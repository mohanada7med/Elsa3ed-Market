import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import { MongoClient } from 'mongodb';
import {
  WAH_ROOT_FOLDER,
  WAH_TOP_LEVEL_FOLDERS,
  type WahTopLevelFolder
} from '../server/utils/cloudinaryFolders.ts';

// Configure Cloudinary explicitly
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
  secure: true
});

interface MigrationItem {
  oldPublicId: string;
  newPublicId: string;
  resourceType: 'image' | 'video';
  entityType: string;
  entitySlug: string;
  entityId?: string;
  categorySlug?: string;
  govId?: string;
  userId?: string;
  description: string;
}

const ASSETS_TO_MIGRATE: MigrationItem[] = [
  // 1. Products from Elsa3ed-Market
  {
    oldPublicId: 'Elsa3ed-Market/products/prod-1788179380992-11c1/image_1_1788179380994_r1jk',
    newPublicId: 'WAH/crafts/products/prod-1788179380992-11c1/image_1',
    resourceType: 'image',
    entityType: 'craft',
    entitySlug: 'products/prod-1788179380992-11c1',
    entityId: 'prod-1788179380992-11c1',
    description: 'Product image for prod-1788179380992-11c1'
  },
  // 2. Users from Elsa3ed-Market
  {
    oldPublicId: 'Elsa3ed-Market/users/user-buyer-1787872585157/profile',
    newPublicId: 'WAH/general/users/user-buyer-1787872585157/profile',
    resourceType: 'image',
    entityType: 'general',
    entitySlug: 'users/user-buyer-1787872585157',
    userId: 'user-buyer-1787872585157',
    description: 'User avatar for user-buyer-1787872585157'
  },
  // 3. Governorates (Provinces)
  {
    oldPublicId: 'بنى_سويف',
    newPublicId: 'WAH/provinces/beni-suef/cover',
    resourceType: 'image',
    entityType: 'province',
    entitySlug: 'beni-suef',
    govId: 'gov-bani-suef',
    description: 'Beni Suef cover image'
  },
  {
    oldPublicId: 'المنيا',
    newPublicId: 'WAH/provinces/minya/cover',
    resourceType: 'image',
    entityType: 'province',
    entitySlug: 'minya',
    govId: 'gov-minya',
    description: 'Minya cover image'
  },
  {
    oldPublicId: 'اسيوط',
    newPublicId: 'WAH/provinces/asyut/cover',
    resourceType: 'image',
    entityType: 'province',
    entitySlug: 'asyut',
    govId: 'gov-asyut',
    description: 'Asyut cover image'
  },
  {
    oldPublicId: 'سوهاج',
    newPublicId: 'WAH/provinces/sohag/cover',
    resourceType: 'image',
    entityType: 'province',
    entitySlug: 'sohag',
    govId: 'gov-sohag',
    description: 'Sohag cover image'
  },
  {
    oldPublicId: 'قنا',
    newPublicId: 'WAH/provinces/qena/cover',
    resourceType: 'image',
    entityType: 'province',
    entitySlug: 'qena',
    govId: 'gov-qena',
    description: 'Qena cover image'
  },
  {
    oldPublicId: 'الاقصر',
    newPublicId: 'WAH/provinces/luxor/cover',
    resourceType: 'image',
    entityType: 'province',
    entitySlug: 'luxor',
    govId: 'gov-luxor',
    description: 'Luxor cover image'
  },
  {
    oldPublicId: 'اسوان',
    newPublicId: 'WAH/provinces/aswan/cover',
    resourceType: 'image',
    entityType: 'province',
    entitySlug: 'aswan',
    govId: 'gov-aswan',
    description: 'Aswan cover image'
  },
  {
    oldPublicId: 'الوادى_الجديد',
    newPublicId: 'WAH/provinces/new-valley/cover',
    resourceType: 'image',
    entityType: 'province',
    entitySlug: 'new-valley',
    govId: 'gov-new-valley',
    description: 'New Valley cover image'
  },
  // 4. Categories (Crafts & Food)
  {
    oldPublicId: 'فخار',
    newPublicId: 'WAH/crafts/pottery/category-cover',
    resourceType: 'image',
    entityType: 'craft',
    entitySlug: 'pottery',
    categorySlug: 'pottery',
    description: 'Pottery category cover image'
  },
  {
    oldPublicId: 'كليم',
    newPublicId: 'WAH/crafts/kilim/category-cover',
    resourceType: 'image',
    entityType: 'craft',
    entitySlug: 'kilim',
    categorySlug: 'kilim-carpets',
    description: 'Kilim category cover image'
  },
  {
    oldPublicId: 'الخوص_والمشغولات_النخيلية',
    newPublicId: 'WAH/crafts/palm-wicker/category-cover',
    resourceType: 'image',
    entityType: 'craft',
    entitySlug: 'palm-wicker',
    categorySlug: 'palm-wicker',
    description: 'Palm-wicker category cover image'
  },
  {
    oldPublicId: 'التلى',
    newPublicId: 'WAH/crafts/tally/category-cover',
    resourceType: 'image',
    entityType: 'craft',
    entitySlug: 'tally',
    categorySlug: 'tally-embroidery',
    description: 'Tally category cover image'
  },
  {
    oldPublicId: 'عسل',
    newPublicId: 'WAH/food/natural-honey/category-cover',
    resourceType: 'image',
    entityType: 'food',
    entitySlug: 'natural-honey',
    categorySlug: 'natural-honey-herbs',
    description: 'Natural honey category cover image'
  },
  {
    oldPublicId: 'تمور',
    newPublicId: 'WAH/food/dates-fruits/category-cover',
    resourceType: 'image',
    entityType: 'food',
    entitySlug: 'dates-fruits',
    categorySlug: 'dates-fruits',
    description: 'Dates category cover image'
  },
  // 5. System General Assets
  {
    oldPublicId: 'user',
    newPublicId: 'WAH/general/placeholders/default-user-avatar',
    resourceType: 'image',
    entityType: 'general',
    entitySlug: 'placeholders/default-user-avatar',
    description: 'Default user placeholder avatar'
  },
  {
    oldPublicId: 'elsa3ed_market2',
    newPublicId: 'WAH/general/branding/logo',
    resourceType: 'image',
    entityType: 'general',
    entitySlug: 'branding/logo',
    description: 'Platform branding logo'
  },
  // 6. Videos
  {
    oldPublicId: 'عايزه_يكون_ثانيه',
    newPublicId: 'WAH/videos/intro/platform-intro',
    resourceType: 'video',
    entityType: 'video',
    entitySlug: 'intro/platform-intro',
    description: 'Platform intro video'
  },
  {
    oldPublicId: 'سوق_الصعيدSaeed_Marketمن_كل',
    newPublicId: 'WAH/videos/promo/market-overview',
    resourceType: 'video',
    entityType: 'video',
    entitySlug: 'promo/market-overview',
    description: 'Market overview promo video'
  }
];

async function main() {
  console.log('========================================================================');
  console.log('🚀 WAH CLOUDINARY: PROVISION 14 FOLDERS & MIGRATE LEGACY ASSETS');
  console.log('========================================================================\n');

  console.log(`Cloudinary Cloud: [${cloudinary.config().cloud_name}]`);
  console.log(`API Key:          [${cloudinary.config().api_key?.substring(0, 6)}******]\n`);

  // ==========================================================================
  // STEP 1: PROVISION 14 MISSING FOLDERS IN CLOUDINARY
  // ==========================================================================
  console.log('------------------------------------------------------------------------');
  console.log('📁 STEP 1: Provisioning 14 Missing Canonical Folders under "WAH/"');
  console.log('------------------------------------------------------------------------');

  // Check current subfolders under WAH/
  let currentSubfolders: string[] = [];
  try {
    const res = await cloudinary.api.sub_folders(WAH_ROOT_FOLDER);
    currentSubfolders = (res.folders || []).map((f: any) => f.name);
    console.log(`Currently existing folders under "${WAH_ROOT_FOLDER}/":`, currentSubfolders);
  } catch (err: any) {
    console.warn(`Could not list subfolders under ${WAH_ROOT_FOLDER}:`, err.message);
  }

  const missingFolders = WAH_TOP_LEVEL_FOLDERS.filter(
    (f: string) => !currentSubfolders.includes(f)
  );

  console.log(`\nIdentified ${missingFolders.length} missing folder(s) to create:`);
  for (const folder of missingFolders) {
    console.log(`  ➕ Will create: ${WAH_ROOT_FOLDER}/${folder}`);
  }

  // Create each missing folder using Cloudinary Admin API
  for (const folder of missingFolders) {
    const folderPath = `${WAH_ROOT_FOLDER}/${folder}`;
    try {
      const createRes = await cloudinary.api.create_folder(folderPath);
      console.log(`  ✅ Successfully created folder: ${folderPath} (path: ${createRes.path})`);
    } catch (err: any) {
      console.error(`  ❌ Error creating folder "${folderPath}":`, err.message);
    }
  }

  // Pre-create subfolders used by migrated assets so tree is fully fleshed out
  const extraSubfolders = [
    'WAH/general/branding',
    'WAH/general/placeholders',
    'WAH/general/users',
    'WAH/videos/intro',
    'WAH/videos/promo',
    'WAH/crafts/products'
  ];

  console.log('\nEnsuring asset container subfolders:');
  for (const sub of extraSubfolders) {
    try {
      await cloudinary.api.create_folder(sub);
      console.log(`  ✅ Verified container subfolder: ${sub}`);
    } catch (err: any) {
      // Ignored if already exists
    }
  }

  // Verify the full 17-folder tree from live Cloudinary API
  console.log('\n--- Verifying All 17 WAH Canonical Folders Live ---');
  let updatedSubfolders: any[] = [];
  try {
    const verifyRes = await cloudinary.api.sub_folders(WAH_ROOT_FOLDER);
    updatedSubfolders = verifyRes.folders || [];
  } catch (err: any) {
    console.error('Error verifying subfolders:', err.message);
  }

  const updatedNames = updatedSubfolders.map((f: any) => f.name);
  console.log(`Total canonical folders now under "${WAH_ROOT_FOLDER}/": ${updatedNames.length} of 17\n`);

  console.log('🌳 WAH 17-FOLDER CANONICAL TREE IN CLOUDINARY CONSOLE:');
  console.log('WAH/');
  for (let i = 0; i < WAH_TOP_LEVEL_FOLDERS.length; i++) {
    const name = WAH_TOP_LEVEL_FOLDERS[i];
    const exists = updatedNames.includes(name);
    const isLast = i === WAH_TOP_LEVEL_FOLDERS.length - 1;
    const prefix = isLast ? '└── ' : '├── ';
    const status = exists ? '✓' : '✗';
    console.log(`${prefix}${name}/ [${status}]`);
  }

  // ==========================================================================
  // STEP 2: MIGRATE LEGACY ASSETS TO WAH HIERARCHY
  // ==========================================================================
  console.log('\n------------------------------------------------------------------------');
  console.log('🔄 STEP 2: Migrating Legacy Assets to Proper WAH Locations');
  console.log('------------------------------------------------------------------------');

  const migrationResults: Record<string, { newUrl: string; newPublicId: string; format: string }> = {};

  for (const item of ASSETS_TO_MIGRATE) {
    console.log(`\nMoving [${item.resourceType}]: "${item.oldPublicId}"`);
    console.log(`  ↳ Target: "${item.newPublicId}" (${item.description})`);

    try {
      // Try to rename
      const renameRes = await cloudinary.uploader.rename(
        item.oldPublicId,
        item.newPublicId,
        {
          resource_type: item.resourceType,
          overwrite: true,
          invalidate: true
        }
      );

      console.log(`  ✅ Renamed successfully!`);
      console.log(`     New Secure URL: ${renameRes.secure_url}`);
      migrationResults[item.oldPublicId] = {
        newUrl: renameRes.secure_url,
        newPublicId: renameRes.public_id,
        format: renameRes.format
      };
    } catch (renameErr: any) {
      // If source not found, check if destination already exists (e.g. re-running script)
      if (renameErr.message?.includes('not found') || renameErr.http_code === 404) {
        console.log(`  ℹ️ Source "${item.oldPublicId}" not found. Checking if target already exists...`);
        try {
          const checkRes = await cloudinary.api.resource(item.newPublicId, {
            resource_type: item.resourceType
          });
          console.log(`  ✅ Target already exists at destination!`);
          console.log(`     Secure URL: ${checkRes.secure_url}`);
          migrationResults[item.oldPublicId] = {
            newUrl: checkRes.secure_url,
            newPublicId: checkRes.public_id,
            format: checkRes.format
          };
        } catch (findErr: any) {
          console.error(`  ❌ Failed to locate asset at source or destination:`, renameErr.message);
        }
      } else {
        console.error(`  ❌ Error renaming asset:`, renameErr.message);
      }
    }
  }

  // ==========================================================================
  // STEP 3: UPDATE MONGODB DATABASE
  // ==========================================================================
  console.log('\n------------------------------------------------------------------------');
  console.log('💾 STEP 3: Synchronizing MongoDB Database Records');
  console.log('------------------------------------------------------------------------');

  const uri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DB?.trim() || 'Elsa3ed_market';
  if (!uri) {
    console.error('❌ MONGODB_URI not found in env!');
    process.exit(1);
  }
  const mongoClient = new MongoClient(uri);
  await mongoClient.connect();
  const db = mongoClient.db(dbName);
  console.log(`Connected to MongoDB database: [${dbName}]`);

  // 1. Update wah_governorates
  console.log('\n--- 3.1 Updating wah_governorates ---');
  for (const item of ASSETS_TO_MIGRATE.filter((m) => m.govId)) {
    const res = migrationResults[item.oldPublicId];
    if (res?.newUrl) {
      const updateRes = await db.collection('wah_governorates').updateOne(
        { id: item.govId },
        { $set: { coverImage: res.newUrl, updatedAt: new Date() } }
      );
      console.log(`  ✓ Updated governorate [${item.govId}] coverImage: ${res.newUrl} (matched: ${updateRes.matchedCount})`);
    }
  }

  // 2. Update categories
  console.log('\n--- 3.2 Updating categories ---');
  for (const item of ASSETS_TO_MIGRATE.filter((m) => m.categorySlug)) {
    const res = migrationResults[item.oldPublicId];
    if (res?.newUrl) {
      const updateRes = await db.collection('categories').updateOne(
        { slug: item.categorySlug },
        { $set: { image: res.newUrl, updatedAt: new Date() } }
      );
      console.log(`  ✓ Updated category [${item.categorySlug}] image: ${res.newUrl} (matched: ${updateRes.matchedCount})`);
    }
  }

  // 3. Update products
  console.log('\n--- 3.3 Updating products ---');
  const oldProdImageId = 'Elsa3ed-Market/products/prod-1788179380992-11c1/image_1_1788179380994_r1jk';
  const newProdRes = migrationResults[oldProdImageId];
  if (newProdRes?.newUrl) {
    const prodUpdate = await db.collection('products').updateMany(
      {
        $or: [
          { images: { $elemMatch: { $regex: 'prod-1788179380992-11c1' } } },
          { thumbnail: { $regex: 'prod-1788179380992-11c1' } },
          { id: 'prod-1788179380992-11c1' }
        ]
      },
      {
        $set: {
          thumbnail: newProdRes.newUrl,
          images: [newProdRes.newUrl]
        }
      }
    );
    console.log(`  ✓ Updated products referencing legacy image: ${prodUpdate.modifiedCount} updated`);
  }

  // 4. Update users
  console.log('\n--- 3.4 Updating users ---');
  // Specific user: user-buyer-1787872585157
  const userBuyerRes = migrationResults['Elsa3ed-Market/users/user-buyer-1787872585157/profile'];
  if (userBuyerRes?.newUrl) {
    await db.collection('users').updateOne(
      { id: 'user-buyer-1787872585157' },
      {
        $set: {
          avatar: userBuyerRes.newUrl,
          profileImage: {
            secureUrl: userBuyerRes.newUrl,
            publicId: userBuyerRes.newPublicId
          }
        }
      }
    );
    console.log(`  ✓ Updated user [user-buyer-1787872585157] avatar to WAH user profile URL`);
  }

  // Default avatar users: update users pointing to old user.jpg
  const defaultAvatarRes = migrationResults['user'];
  if (defaultAvatarRes?.newUrl) {
    const userDefaultUpdate = await db.collection('users').updateMany(
      { avatar: { $regex: 'user.jpg' } },
      { $set: { avatar: defaultAvatarRes.newUrl } }
    );
    console.log(`  ✓ Updated ${userDefaultUpdate.modifiedCount} user(s) avatar to: ${defaultAvatarRes.newUrl}`);

    await db.collection('users').updateMany(
      { 'profileImage.secureUrl': { $regex: 'user.jpg' } },
      {
        $set: {
          'profileImage.secureUrl': defaultAvatarRes.newUrl,
          'profileImage.publicId': defaultAvatarRes.newPublicId
        }
      }
    );
  }

  // 5. Register/Upsert all migrated assets in wah_media
  console.log('\n--- 3.5 Upserting Records in "wah_media" Collection ---');
  for (const item of ASSETS_TO_MIGRATE) {
    const res = migrationResults[item.oldPublicId];
    if (!res) continue;

    const folderParts = item.newPublicId.split('/');
    folderParts.pop();
    const folder = folderParts.join('/');

    const mediaDoc = {
      publicId: res.newPublicId,
      folder: folder,
      secureUrl: res.newUrl,
      resourceType: item.resourceType,
      format: res.format,
      entityType: item.entityType,
      entitySlug: item.entitySlug,
      entityId: item.entityId || item.govId || item.categorySlug || item.userId || 'platform',
      isPrimary: true,
      caption: item.description,
      updatedAt: new Date()
    };

    await db.collection('wah_media').updateOne(
      { publicId: res.newPublicId },
      {
        $set: mediaDoc,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
    console.log(`  ✓ Upserted wah_media: ${res.newPublicId}`);
  }

  // ==========================================================================
  // STEP 4: FINAL RE-AUDIT OF LIVE CLOUDINARY
  // ==========================================================================
  console.log('\n------------------------------------------------------------------------');
  console.log('🔍 STEP 4: Final Account Verification');
  console.log('------------------------------------------------------------------------');

  // Verify images outside WAH
  const allImages = await cloudinary.api.resources({ type: 'upload', max_results: 500 });
  const remainingOutsideImages = (allImages.resources || []).filter(
    (a: any) => !a.public_id.startsWith(`${WAH_ROOT_FOLDER}/`)
  );

  // Verify videos outside WAH
  const allVideos = await cloudinary.api.resources({ resource_type: 'video', max_results: 100 });
  const remainingOutsideVideos = (allVideos.resources || []).filter(
    (v: any) => !v.public_id.startsWith(`${WAH_ROOT_FOLDER}/`)
  );

  console.log(`\nCloudinary Assets Audit:`);
  console.log(`  Total Images in Account:  ${allImages.resources?.length || 0}`);
  console.log(`  Total Videos in Account:  ${allVideos.resources?.length || 0}`);
  console.log(`  Images Outside WAH/:      ${remainingOutsideImages.length}`);
  if (remainingOutsideImages.length > 0) {
    for (const r of remainingOutsideImages) {
      console.log(`    ⚠️  ${r.public_id}`);
    }
  } else {
    console.log(`    🎉 0 images outside WAH! All images are organized in WAH/!`);
  }

  console.log(`  Videos Outside WAH/:      ${remainingOutsideVideos.length}`);
  if (remainingOutsideVideos.length > 0) {
    for (const r of remainingOutsideVideos) {
      console.log(`    ⚠️  ${r.public_id}`);
    }
  } else {
    console.log(`    🎉 0 videos outside WAH! All videos are organized in WAH/!`);
  }

  // Check if Elsa3ed-Market root folder is now empty and can be removed or kept
  try {
    const elsa3edAssets = (allImages.resources || []).filter((a: any) =>
      a.public_id.startsWith('Elsa3ed-Market/')
    );
    if (elsa3edAssets.length === 0) {
      console.log(`\nℹ️ Legacy folder "Elsa3ed-Market" is now completely empty!`);
      try {
        await cloudinary.api.delete_folder('Elsa3ed-Market/products/prod-1788179380992-11c1');
        await cloudinary.api.delete_folder('Elsa3ed-Market/products');
        await cloudinary.api.delete_folder('Elsa3ed-Market/users/user-buyer-1787872585157');
        await cloudinary.api.delete_folder('Elsa3ed-Market/users');
        await cloudinary.api.delete_folder('Elsa3ed-Market');
        console.log(`  🧹 Cleaned up empty legacy "Elsa3ed-Market" folder structure in Cloudinary.`);
      } catch (err: any) {
        console.log(`  (Note on legacy folder deletion: ${err.message})`);
      }
    }
  } catch {}

  console.log('\n========================================================================');
  console.log('✨ MIGRATION & PROVISIONING COMPLETED SUCCESSFULLY!');
  console.log('========================================================================\n');

  // Print migration map summary for code replacement
  console.log('--- URL MAPPINGS FOR CODE REPLACEMENT ---');
  for (const [oldId, data] of Object.entries(migrationResults)) {
    console.log(`"${oldId}" => "${data.newUrl}"`);
  }

  await mongoClient.close();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Fatal Migration Error:', err);
  process.exit(1);
});
