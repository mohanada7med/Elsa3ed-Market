import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { createApp } from '../server/app.ts';
import { generateToken } from '../server/services/authService.ts';
import { AUTH_COOKIE_NAME } from '../server/config/authCookie.ts';
import { getDatabase } from '../server/db/mongodb.ts';
import {
  getCloudinaryFolder,
  isValidWahEntityType,
  WAH_TOP_LEVEL_FOLDERS,
  CLOUDINARY_ENTITY_FOLDER_MAP,
  sanitizeSlug
} from '../server/utils/cloudinaryFolders.ts';
import { buildMediaIdFilter } from '../server/services/mediaService.ts';
import type { UserRole } from '../server/models/types.ts';

// Valid 1x1 transparent PNG buffer
const VALID_1X1_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

async function runCloudinaryFolderArchitectureSuite() {
  console.log('===============================================================');
  console.log('🏛️  WAH CLOUDINARY FOLDER ARCHITECTURE & SECURITY SUITE');
  console.log('===============================================================\n');

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName} ${detail ? `(${detail})` : ''}`);
      testPassed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      testFailed++;
    }
  }

  // -------------------------------------------------------------
  // SECTION 1: CENTRAL FOLDER GENERATION FUNCTION TESTS
  // -------------------------------------------------------------
  console.log('--- 1. Central Folder Generation Function (getCloudinaryFolder) ---');

  const expectedMappings: Array<{ entityType: string; slug: string; expected: string }> = [
    { entityType: 'province', slug: 'luxor', expected: 'WAH/provinces/luxor' },
    { entityType: 'governorate', slug: 'qena', expected: 'WAH/provinces/qena' },
    { entityType: 'city', slug: 'esna', expected: 'WAH/cities/esna' },
    { entityType: 'village', slug: 'al-makhadma', expected: 'WAH/villages/al-makhadma' },
    { entityType: 'archaeologicalSite', slug: 'meidum-pyramid', expected: 'WAH/archaeological-sites/meidum-pyramid' },
    { entityType: 'archaeological-site', slug: 'ihnasia', expected: 'WAH/archaeological-sites/ihnasia' },
    { entityType: 'museum', slug: 'nubian-museum', expected: 'WAH/museums/nubian-museum' },
    { entityType: 'naturalReserve', slug: 'wadi-el-gemal', expected: 'WAH/natural-reserves/wadi-el-gemal' },
    { entityType: 'religiousSite', slug: 'dendera-temple', expected: 'WAH/religious-sites/dendera-temple' },
    { entityType: 'food', slug: 'feteer-meshaltet', expected: 'WAH/food/feteer-meshaltet' },
    { entityType: 'craft', slug: 'pottery', expected: 'WAH/crafts/pottery' },
    { entityType: 'craft', slug: 'handmade-carpet', expected: 'WAH/crafts/handmade-carpet' },
    { entityType: 'tradition', slug: 'tahtib', expected: 'WAH/traditions/tahtib' },
    { entityType: 'story', slug: 'sirat-bani-hilal', expected: 'WAH/stories/sirat-bani-hilal' },
    { entityType: 'person', slug: 'sheikh-taha', expected: 'WAH/people/sheikh-taha' },
    { entityType: 'event', slug: 'moulid-sidi-abdelrahim', expected: 'WAH/events/moulid-sidi-abdelrahim' },
    { entityType: 'heritagePlace', slug: 'karnak', expected: 'WAH/heritage-places/karnak' },
    { entityType: 'video', slug: 'pottery-demo', expected: 'WAH/videos/pottery-demo' },
    { entityType: 'gallery', slug: 'akhmeem-weaving', expected: 'WAH/galleries/akhmeem-weaving' },
    { entityType: 'general', slug: '', expected: 'WAH/general' }
  ];

  for (const m of expectedMappings) {
    const res = getCloudinaryFolder(m.entityType, m.slug);
    assert(res === m.expected, `Mapping ${m.entityType} -> ${m.expected}`, res);
  }

  // Verify all 17 top-level folders exist
  assert(WAH_TOP_LEVEL_FOLDERS.length === 17, 'Exactly 17 top-level WAH folders defined');

  // -------------------------------------------------------------
  // SECTION 2: UNKNOWN ENTITY REJECTION (UNIT)
  // -------------------------------------------------------------
  console.log('\n--- 2. Unknown Entity Type Rejection ---');

  const invalidTypes = ['unknown-type', 'random_stuff', 'hacker/path', '', '   '];
  for (const inv of invalidTypes) {
    let threw = false;
    try {
      getCloudinaryFolder(inv, 'slug');
    } catch {
      threw = true;
    }
    assert(threw, `getCloudinaryFolder rejects invalid type: "${inv}"`);
    assert(!isValidWahEntityType(inv), `isValidWahEntityType returns false for: "${inv}"`);
  }

  // -------------------------------------------------------------
  // SECTION 3: HTTP API & SECURITY INTEGRATION TESTS
  // -------------------------------------------------------------
  console.log('\n--- 3. HTTP API Server-Side Security & Folder Enforcement ---');

  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  const adminUser = {
    id: 'admin_arch_tester',
    username: 'admin_arch',
    name: 'مدير البنية التحتية',
    email: 'admin-arch@wah.eg',
    phone: '01000000099',
    role: 'admin' as UserRole
  };

  const adminToken = generateToken(adminUser as any);
  const adminCookie = `${AUTH_COOKIE_NAME}=${adminToken}`;

  async function sendUpload(
    fields: Record<string, string>,
    fileBuffer: Buffer = VALID_1X1_PNG,
    fileName = 'test.png',
    fileType = 'image/png'
  ) {
    const formData = new FormData();
    for (const [key, val] of Object.entries(fields)) {
      formData.append(key, val);
    }
    const blob = new Blob([fileBuffer], { type: fileType });
    formData.append('file', blob, fileName);

    return fetch(`${baseUrl}/admin/media/upload`, {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: formData
    });
  }

  try {
    // 3.1 Reject unknown entityType via API
    const badTypeRes = await sendUpload({
      entityType: 'malicious_random_type',
      entitySlug: 'test-slug'
    });
    assert(badTypeRes.status === 400, 'API rejects unknown entityType with 400 Bad Request');
    const badTypeData = await badTypeRes.json().catch(() => ({}));
    assert(badTypeData.code === 'UNKNOWN_ENTITY_TYPE', 'API returns UNKNOWN_ENTITY_TYPE error code');

    // 3.2 Security: Client sends custom "folder" and "public_id" — Server MUST ignore and override
    const clientTamperRes = await sendUpload({
      entityType: 'food',
      entitySlug: 'feteer-meshaltet',
      entityId: 'food-feteer-1',
      folder: 'hacked/arbitrary/folder',
      public_id: 'injected_public_id',
      publicId: 'injected_public_id_2',
      alt: 'فطير مشلتت صعيدي'
    }, VALID_1X1_PNG, 'feteer.png', 'image/png');

    assert(clientTamperRes.status === 201, 'Valid upload with tampered folder params succeeds');
    const tamperData = await clientTamperRes.json();
    const mediaDoc = tamperData.data;

    // Server-enforced folder
    assert(
      mediaDoc.folder === 'WAH/food/feteer-meshaltet',
      'Server enforced folder "WAH/food/feteer-meshaltet" and ignored client injection',
      mediaDoc.folder
    );
    assert(
      mediaDoc.publicId.startsWith('WAH/food/feteer-meshaltet/'),
      'Cloudinary publicId resides strictly inside WAH/food/feteer-meshaltet/',
      mediaDoc.publicId
    );
    assert(
      !mediaDoc.publicId.includes('injected_public_id'),
      'Client-supplied public_id was safely ignored and overridden'
    );

    // 3.3 Database synchronization
    const { db } = await getDatabase();
    if (db) {
      const dbDoc = await db.collection('wah_media').findOne(buildMediaIdFilter(mediaDoc.id || mediaDoc._id));
      assert(Boolean(dbDoc), 'Record verified in MongoDB wah_media');
      assert(dbDoc?.folder === 'WAH/food/feteer-meshaltet', 'MongoDB stores correct server folder');
      assert(dbDoc?.entityType === 'food', 'MongoDB stores entityType: food');
      assert(dbDoc?.entitySlug === 'feteer-meshaltet', 'MongoDB stores entitySlug: feteer-meshaltet');
      assert(dbDoc?.entityId === 'food-feteer-1', 'MongoDB stores entityId: food-feteer-1');
      assert(dbDoc?.publicId === mediaDoc.publicId, 'MongoDB stores matching Cloudinary publicId');
      assert(Boolean(dbDoc?.secureUrl), 'MongoDB stores secureUrl');
      assert(Boolean(dbDoc?.createdAt && dbDoc?.updatedAt), 'MongoDB stores timestamps');
    }

    // 3.4 Upload into Archaeological Site subfolder
    const siteUploadRes = await sendUpload({
      entityType: 'archaeologicalSite',
      entitySlug: 'meidum-pyramid',
      entityId: 'site-meidum',
      alt: 'هرم ميدوم التراثي'
    }, VALID_1X1_PNG, 'meidum.png', 'image/png');

    assert(siteUploadRes.status === 201, 'Upload for archaeologicalSite succeeds');
    const siteData = await siteUploadRes.json();
    assert(
      siteData.data?.folder === 'WAH/archaeological-sites/meidum-pyramid',
      'Folder correctly structured as WAH/archaeological-sites/meidum-pyramid',
      siteData.data?.folder
    );

    // 3.5 Clean up uploaded test assets
    const mediaId1 = mediaDoc.id || mediaDoc._id;
    const mediaId2 = siteData.data?.id || siteData.data?._id;

    if (mediaId1) {
      const del1 = await fetch(`${baseUrl}/admin/media/${mediaId1}`, {
        method: 'DELETE',
        headers: { Cookie: adminCookie }
      });
      assert(del1.status === 200, 'Clean deletion of test image 1 from Cloudinary & DB');
    }

    if (mediaId2) {
      const del2 = await fetch(`${baseUrl}/admin/media/${mediaId2}`, {
        method: 'DELETE',
        headers: { Cookie: adminCookie }
      });
      assert(del2.status === 200, 'Clean deletion of test image 2 from Cloudinary & DB');
    }

  } catch (err) {
    console.error('Test suite error:', err);
    testFailed++;
  } finally {
    server.close();
    console.log('\n===============================================================');
    console.log(`ARCHITECTURE TEST RESULTS: ${testPassed} PASSED, ${testFailed} FAILED`);
    console.log('===============================================================\n');

    if (testFailed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runCloudinaryFolderArchitectureSuite();
