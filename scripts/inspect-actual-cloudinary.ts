import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import { getDatabase } from '../server/db/mongodb.ts';
import {
  WAH_ROOT_FOLDER,
  WAH_TOP_LEVEL_FOLDERS,
  CLOUDINARY_ENTITY_FOLDER_MAP
} from '../server/utils/cloudinaryFolders.ts';

// Configure Cloudinary explicitly with credentials
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
    secure: true
  });
}

async function inspectCloudinaryAndMongo() {
  console.log('===============================================================');
  console.log('🔍 REAL CLOUDINARY & MONGODB LIVE AUDIT');
  console.log('===============================================================\n');

  console.log(`Target Cloudinary Cloud: [${cloudinary.config().cloud_name}]`);
  console.log(`API Key: [${cloudinary.config().api_key?.substring(0, 6)}******]\n`);

  // 1. Root Folders in Cloudinary
  console.log('--- 1. Actual Cloudinary Root Folders ---');
  let rootFolders: any[] = [];
  try {
    const rootRes = await cloudinary.api.root_folders();
    rootFolders = rootRes.folders || [];
    console.log('Cloudinary Root Folders:', rootFolders.map((f: any) => f.name || f.path));
  } catch (err: any) {
    console.error('Error fetching root folders:', err.message);
  }

  // 2. Subfolders under WAH/
  console.log('\n--- 2. Actual Cloudinary Subfolders under "WAH/" ---');
  let wahSubfolders: any[] = [];
  try {
    const wahRes = await cloudinary.api.sub_folders(WAH_ROOT_FOLDER);
    wahSubfolders = wahRes.folders || [];
    console.log(`Found ${wahSubfolders.length} subfolders under "${WAH_ROOT_FOLDER}":`);
    for (const f of wahSubfolders) {
      console.log(`  📁 ${f.name} (path: ${f.path})`);
    }
  } catch (err: any) {
    console.error(`Error fetching subfolders under "${WAH_ROOT_FOLDER}":`, err.message);
  }

  // 3. Sub-subfolders and assets for each existing WAH folder
  console.log('\n--- 3. Detailed Hierarchy of Existing WAH Folders ---');
  const actualWahTopLevelNames = wahSubfolders.map((f: any) => f.name);
  const actualFolderDetails: Record<string, { subfolders: string[]; assetCount: number; assets: any[] }> = {};

  for (const f of wahSubfolders) {
    const folderPath = f.path || `${WAH_ROOT_FOLDER}/${f.name}`;
    let subSubs: any[] = [];
    try {
      const subRes = await cloudinary.api.sub_folders(folderPath);
      subSubs = subRes.folders || [];
    } catch {}

    let assets: any[] = [];
    try {
      const resList = await cloudinary.api.resources({
        type: 'upload',
        prefix: `${folderPath}/`,
        max_results: 100
      });
      assets = resList.resources || [];
    } catch {}

    actualFolderDetails[f.name] = {
      subfolders: subSubs.map((s: any) => s.name || s.path),
      assetCount: assets.length,
      assets: assets.map((a: any) => ({
        public_id: a.public_id,
        bytes: a.bytes,
        format: a.format,
        created_at: a.created_at,
        secure_url: a.secure_url
      }))
    };

    console.log(`\n📁 ${folderPath} (${assets.length} assets):`);
    if (subSubs.length > 0) {
      console.log(`   Sub-entities: ${subSubs.map((s: any) => s.name).join(', ')}`);
    }
    for (const a of assets) {
      console.log(`   - [${a.format}] ${a.public_id} (${a.bytes} bytes) -> ${a.secure_url}`);
    }
  }

  // 4. All Resources in Cloudinary Account (to detect assets outside WAH/)
  console.log('\n--- 4. All Resources in Account (Outside WAH Detection) ---');
  let allAccountResources: any[] = [];
  try {
    const allRes = await cloudinary.api.resources({
      type: 'upload',
      max_results: 500
    });
    allAccountResources = allRes.resources || [];
    console.log(`Total upload assets in account: ${allAccountResources.length}`);

    const assetsOutsideWah = allAccountResources.filter(
      (a: any) => !a.public_id.startsWith(`${WAH_ROOT_FOLDER}/`)
    );

    console.log(`Assets INSIDE ${WAH_ROOT_FOLDER}/: ${allAccountResources.length - assetsOutsideWah.length}`);
    console.log(`Assets OUTSIDE ${WAH_ROOT_FOLDER}/: ${assetsOutsideWah.length}`);
    if (assetsOutsideWah.length > 0) {
      for (const a of assetsOutsideWah) {
        console.log(`   ⚠️  Outside: ${a.public_id} (${a.secure_url})`);
      }
    }
  } catch (err: any) {
    console.error('Error listing all account resources:', err.message);
  }

  // 5. MongoDB wah_media Collection Audit
  console.log('\n--- 5. MongoDB "wah_media" Collection Records ---');
  const { db } = await getDatabase();
  let mongoMediaDocs: any[] = [];
  if (db) {
    try {
      mongoMediaDocs = await db.collection('wah_media').find({}).toArray();
      console.log(`Total documents in "wah_media": ${mongoMediaDocs.length}`);
      for (const doc of mongoMediaDocs) {
        console.log(`  📄 DB ID: ${doc._id || doc.id}`);
        console.log(`     publicId:   ${doc.publicId}`);
        console.log(`     folder:     ${doc.folder}`);
        console.log(`     entityType: ${doc.entityType}`);
        console.log(`     entitySlug: ${doc.entitySlug}`);
        console.log(`     entityId:   ${doc.entityId}`);
        console.log(`     secureUrl:  ${doc.secureUrl}`);
      }

      // Check if legacy Cloudinary assets outside WAH are referenced in any entity
      console.log('\n--- 5.1 Scanning Database for References to Outside Assets ---');
      const collectionsToCheck = [
        'wah_governorates',
        'wah_heritage_places',
        'wah_cultural_crafts',
        'wah_foods',
        'wah_stories',
        'wah_people',
        'wah_events',
        'products',
        'categories',
        'users',
        'sellers'
      ];

      for (const colName of collectionsToCheck) {
        try {
          const docsWithCloudinary = await db.collection(colName).find({
            $or: [
              { coverImage: { $regex: 'cloudinary' } },
              { gallery: { $regex: 'cloudinary' } },
              { image: { $regex: 'cloudinary' } },
              { avatar: { $regex: 'cloudinary' } },
              { 'profileImage.secureUrl': { $regex: 'cloudinary' } }
            ]
          }).toArray();

          if (docsWithCloudinary.length > 0) {
            console.log(`  📌 Collection "${colName}": ${docsWithCloudinary.length} document(s) reference Cloudinary:`);
            for (const d of docsWithCloudinary) {
              const url = d.coverImage || d.image || d.avatar || d.profileImage?.secureUrl || (Array.isArray(d.gallery) ? d.gallery.join(', ') : '');
              console.log(`     - [${d.id || d._id}] ${d.name || d.title || d.username}: ${url}`);
            }
          }
        } catch {}
      }

    } catch (err: any) {
      console.error('Error reading MongoDB:', err.message);
    }
  }

  // 6. Cross-Comparison: MongoDB vs Cloudinary
  console.log('\n--- 6. Cross-Comparison: MongoDB vs Cloudinary ---');
  const cloudPublicIds = new Set(allAccountResources.map((a: any) => a.public_id));

  const mongoInCloud = mongoMediaDocs.filter((d) => d.publicId && cloudPublicIds.has(d.publicId));
  const mongoMissingInCloud = mongoMediaDocs.filter((d) => d.publicId && !cloudPublicIds.has(d.publicId));
  const cloudNotInMongo = allAccountResources.filter((a: any) => {
    return !mongoMediaDocs.some((d) => d.publicId === a.public_id);
  });

  console.log(`✓ MongoDB docs present in Cloudinary: ${mongoInCloud.length}`);
  console.log(`✗ MongoDB docs MISSING in Cloudinary: ${mongoMissingInCloud.length}`);
  for (const m of mongoMissingInCloud) {
    console.log(`   ❌ DB doc ${m._id} points to missing Cloudinary asset: ${m.publicId}`);
  }

  console.log(`❓ Cloudinary assets NOT in MongoDB wah_media: ${cloudNotInMongo.length}`);
  for (const c of cloudNotInMongo) {
    console.log(`   ⚠️  Cloudinary asset unlinked in wah_media: ${c.public_id}`);
  }

  // 7. Check if Cloudinary API supports creating empty folders
  console.log('\n--- 7. Testing Cloudinary Empty Folder Creation Capability ---');
  let supportsEmptyFolders = false;
  try {
    if (typeof (cloudinary.api as any).create_folder === 'function') {
      supportsEmptyFolders = true;
      console.log('✓ cloudinary.api.create_folder() function is available in Cloudinary SDK.');
    } else {
      console.log('✗ cloudinary.api.create_folder() is NOT present in current Cloudinary SDK.');
    }
  } catch (err: any) {
    console.log('create_folder test error:', err.message);
  }

  // 8. Summary Analysis
  console.log('\n===============================================================');
  console.log('📊 REAL CLOUDINARY VERIFICATION SUMMARY');
  console.log('===============================================================');
  console.log(`Expected Folders Defined in Architecture: ${WAH_TOP_LEVEL_FOLDERS.length}`);
  console.log(`Actual Folders Found in Cloudinary:       ${actualWahTopLevelNames.length}`);
  console.log('Expected List:\n ', WAH_TOP_LEVEL_FOLDERS.join(', '));
  console.log('Actual List:\n ', actualWahTopLevelNames.join(', '));

  const missingFolders = WAH_TOP_LEVEL_FOLDERS.filter((f) => !actualWahTopLevelNames.includes(f));
  const unexpectedFolders = actualWahTopLevelNames.filter(
    (f: string) => !WAH_TOP_LEVEL_FOLDERS.includes(f as any)
  );

  console.log('\nMissing Folders in Cloudinary:\n ', missingFolders.length > 0 ? missingFolders.join(', ') : 'None');
  console.log('Unexpected Folders in Cloudinary:\n ', unexpectedFolders.length > 0 ? unexpectedFolders.join(', ') : 'None');

  process.exit(0);
}

inspectCloudinaryAndMongo().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
