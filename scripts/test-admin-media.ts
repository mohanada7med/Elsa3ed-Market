import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { createApp } from '../server/app.ts';
import { generateToken } from '../server/services/authService.ts';
import { AUTH_COOKIE_NAME } from '../server/config/authCookie.ts';
import { getDatabase } from '../server/db/mongodb.ts';
import { buildMediaIdFilter } from '../server/services/mediaService.ts';
import type { UserRole } from '../server/models/types.ts';

// Valid 1x1 transparent PNG buffer
const VALID_1X1_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Valid 1x1 JPEG buffer
const VALID_1X1_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
  'base64'
);

async function runAdminMediaTestSuite() {
  console.log('===============================================================');
  console.log('🛡️  WAH ADMIN MEDIA UPLOAD & SECURITY VERIFICATION SUITE');
  console.log('===============================================================\n');

  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  console.log(`[Test Server] Running on http://127.0.0.1:${port}\n`);

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

  // Generate tokens for testing
  const adminUser = {
    id: 'admin_test_1',
    username: 'admin_tester',
    name: 'مدير الاختبار',
    email: 'admin@wah-test.com',
    phone: '01000000001',
    role: 'admin' as UserRole
  };

  const buyerUser = {
    id: 'buyer_test_1',
    username: 'buyer_tester',
    name: 'مشتري الاختبار',
    email: 'buyer@wah-test.com',
    phone: '01000000002',
    role: 'buyer' as UserRole
  };

  const sellerUser = {
    id: 'seller_test_1',
    username: 'seller_tester',
    name: 'بائع الاختبار',
    email: 'seller@wah-test.com',
    phone: '01000000003',
    role: 'seller' as UserRole,
    sellerId: 'seller_test_1'
  };

  const adminToken = generateToken(adminUser as any);
  const buyerToken = generateToken(buyerUser as any);
  const sellerToken = generateToken(sellerUser as any);

  const adminCookie = `${AUTH_COOKIE_NAME}=${adminToken}`;
  const buyerCookie = `${AUTH_COOKIE_NAME}=${buyerToken}`;
  const sellerCookie = `${AUTH_COOKIE_NAME}=${sellerToken}`;

  try {
    // -------------------------------------------------------------
    // SECTION 1: STRICT 403 FORBIDDEN ENFORCEMENT FOR NON-ADMINS
    // -------------------------------------------------------------
    console.log('--- 1. Security: Strict 403 Forbidden for Non-Admins ---');

    // 1.1 Unauthenticated upload
    const unauthUploadRes = await fetch(`${baseUrl}/admin/media/upload`, {
      method: 'POST'
    });
    assert(unauthUploadRes.status === 403, 'Unauthenticated upload returns 403 Forbidden');
    const unauthData = await unauthUploadRes.json().catch(() => ({}));
    assert(
      unauthData.code === 'FORBIDDEN' || unauthData.error === 'FORBIDDEN',
      'Unauthenticated returns FORBIDDEN error code',
      unauthData.code || unauthData.error
    );

    // 1.2 Buyer upload attempt
    const buyerUploadRes = await fetch(`${baseUrl}/admin/media/upload`, {
      method: 'POST',
      headers: { Cookie: buyerCookie }
    });
    assert(buyerUploadRes.status === 403, 'Buyer upload returns 403 Forbidden');

    // 1.3 Seller upload attempt
    const sellerUploadRes = await fetch(`${baseUrl}/admin/media/upload`, {
      method: 'POST',
      headers: { Cookie: sellerCookie }
    });
    assert(sellerUploadRes.status === 403, 'Seller upload returns 403 Forbidden');

    // 1.4 Non-admin delete
    const buyerDeleteRes = await fetch(`${baseUrl}/admin/media/test_id`, {
      method: 'DELETE',
      headers: { Cookie: buyerCookie }
    });
    assert(buyerDeleteRes.status === 403, 'Buyer delete returns 403 Forbidden');

    // 1.5 Non-admin replace
    const sellerReplaceRes = await fetch(`${baseUrl}/admin/media/test_id/replace`, {
      method: 'POST',
      headers: { Cookie: sellerCookie }
    });
    assert(sellerReplaceRes.status === 403, 'Seller replace returns 403 Forbidden');

    // 1.6 Non-admin set primary
    const unauthPrimaryRes = await fetch(`${baseUrl}/admin/media/test_id/primary`, {
      method: 'POST'
    });
    assert(unauthPrimaryRes.status === 403, 'Unauthenticated set primary returns 403 Forbidden');

    // 1.7 Non-admin gallery reorder
    const buyerReorderRes = await fetch(`${baseUrl}/admin/media/gallery/reorder`, {
      method: 'POST',
      headers: { Cookie: buyerCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [] })
    });
    assert(buyerReorderRes.status === 403, 'Buyer gallery reorder returns 403 Forbidden');

    // 1.8 Non-admin media list
    const sellerListRes = await fetch(`${baseUrl}/admin/media`, {
      headers: { Cookie: sellerCookie }
    });
    assert(sellerListRes.status === 403, 'Seller media listing returns 403 Forbidden');

    // -------------------------------------------------------------
    // SECTION 2: IMAGE VALIDATION & MAGIC BYTE VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- 2. Image Validation & Magic Byte Defense ---');

    async function sendUpload(
      url: string,
      cookie: string,
      fields: Record<string, string>,
      fileBuffer: Buffer | null,
      fileName = 'test.png',
      fileType = 'image/png'
    ) {
      const formData = new FormData();
      for (const [key, val] of Object.entries(fields)) {
        formData.append(key, val);
      }
      if (fileBuffer) {
        const blob = new Blob([fileBuffer], { type: fileType });
        formData.append('file', blob, fileName);
      }

      return fetch(url, {
        method: 'POST',
        headers: { Cookie: cookie },
        body: formData
      });
    }

    // 2.1 Upload with no file attached
    const noFileRes = await sendUpload(`${baseUrl}/admin/media/upload`, adminCookie, {
      entityType: 'craft',
      entityId: 'craft-1'
    }, null);
    assert(noFileRes.status === 400, 'Upload with no file returns 400 Bad Request');

    // 2.2 Upload text file renamed to .jpg (Fake extension / Magic Byte Mismatch)
    const fakeJpgBuffer = Buffer.from('<html><body>Malicious script or text content</body></html>', 'utf-8');
    const fakeJpgRes = await sendUpload(`${baseUrl}/admin/media/upload`, adminCookie, {
      entityType: 'craft',
      entityId: 'craft-1'
    }, fakeJpgBuffer, 'evil.jpg', 'image/jpeg');
    assert(fakeJpgRes.status === 400, 'Fake JPG with text content rejected with 400 Bad Request');
    const fakeJpgData = await fakeJpgRes.json().catch(() => ({}));
    assert(
      Boolean(fakeJpgData.error && (fakeJpgData.error.includes('الثنائية') || fakeJpgData.error.includes('الصيغ'))),
      'Returns descriptive validation error message',
      fakeJpgData.error
    );

    // 2.3 Upload SVG file (Reject vectors/scripts)
    const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>', 'utf-8');
    const svgRes = await sendUpload(`${baseUrl}/admin/media/upload`, adminCookie, {
      entityType: 'place',
      entityId: 'place-1'
    }, svgBuffer, 'vector.svg', 'image/svg+xml');
    assert(svgRes.status === 400, 'SVG file upload rejected with 400 Bad Request');

    // 2.4 Upload GIF file (Forbidden format)
    const fakeGifBuffer = Buffer.from('GIF89a...', 'utf-8');
    const gifRes = await sendUpload(`${baseUrl}/admin/media/upload`, adminCookie, {
      entityType: 'place',
      entityId: 'place-1'
    }, fakeGifBuffer, 'anim.gif', 'image/gif');
    assert(gifRes.status === 400, 'GIF file upload rejected with 400 Bad Request');

    // 2.5 File exceeding 10MB limit
    const oversizedBuffer = Buffer.alloc(10 * 1024 * 1024 + 1024); // 10MB + 1KB
    const oversizedRes = await sendUpload(`${baseUrl}/admin/media/upload`, adminCookie, {
      entityType: 'place',
      entityId: 'place-1'
    }, oversizedBuffer, 'huge.jpg', 'image/jpeg');
    assert(oversizedRes.status === 400, 'File exceeding 10MB rejected with 400 Bad Request');

    // -------------------------------------------------------------
    // SECTION 3: VALID ADMIN IMAGE UPLOAD (CLOUDINARY + MONGODB)
    // -------------------------------------------------------------
    console.log('\n--- 3. Valid Admin Upload (Cloudinary + MongoDB) ---');

    let uploadedMediaId1 = '';
    let uploadedPublicId1 = '';

    const validUploadRes = await sendUpload(`${baseUrl}/admin/media/upload`, adminCookie, {
      entityType: 'craft',
      entityId: 'craft_pottery_qena',
      entitySlug: 'qena-pottery',
      folder: 'wah/crafts',
      alt: 'فخار قنا الأصيل',
      caption: 'صناعة القلل والجرار التراثية',
      isPrimary: 'true'
    }, VALID_1X1_PNG, 'qena_pottery.png', 'image/png');

    assert(validUploadRes.status === 201, 'Valid PNG upload returns 201 Created');
    const uploadData1 = await validUploadRes.json();
    assert(uploadData1.success === true, 'Upload response indicates success: true');
    assert(Boolean(uploadData1.data?.publicId), 'Uploaded media has Cloudinary publicId', uploadData1.data?.publicId);
    assert(Boolean(uploadData1.data?.secureUrl), 'Uploaded media has secureUrl', uploadData1.data?.secureUrl);
    assert(uploadData1.data?.entityType === 'craft', 'Correct entityType stored');
    assert(uploadData1.data?.entityId === 'craft_pottery_qena', 'Correct entityId stored');
    assert(uploadData1.data?.isPrimary === true, 'Stored as primary image');
    assert(uploadData1.data?.uploadedBy === adminUser.id, 'Stored with admin uploader id');

    uploadedMediaId1 = uploadData1.data?._id || uploadData1.data?.id;
    uploadedPublicId1 = uploadData1.data?.publicId;

    // Verify record in MongoDB directly
    const { db } = await getDatabase();
    if (db) {
      const dbRecord = await db.collection('wah_media').findOne(buildMediaIdFilter(uploadedMediaId1));
      assert(Boolean(dbRecord), 'Record confirmed in MongoDB wah_media collection', dbRecord?._id?.toString());
      assert(dbRecord?.publicId === uploadedPublicId1, 'Cloudinary publicId matches database document');
    }

    // -------------------------------------------------------------
    // SECTION 4: GALLERY MANAGEMENT & PRIMARY IMAGE SWITCHING
    // -------------------------------------------------------------
    console.log('\n--- 4. Multiple Images & Primary Cover Image Switching ---');

    // Upload a second image for the same entity (isPrimary: false)
    const secondUploadRes = await sendUpload(`${baseUrl}/admin/media/upload`, adminCookie, {
      entityType: 'craft',
      entityId: 'craft_pottery_qena',
      entitySlug: 'qena-pottery',
      folder: 'wah/crafts',
      alt: 'فخار قنا - صورة ثانية',
      isPrimary: 'false'
    }, VALID_1X1_JPEG, 'qena_pottery_2.jpg', 'image/jpeg');

    assert(secondUploadRes.status === 201, 'Second image upload returns 201 Created');
    const uploadData2 = await secondUploadRes.json();
    const uploadedMediaId2 = uploadData2.data?._id || uploadData2.data?.id;
    assert(uploadData2.data?.isPrimary === false, 'Second image is not primary initially');

    // Switch primary image to Image 2
    const setPrimaryRes = await fetch(`${baseUrl}/admin/media/${uploadedMediaId2}/primary`, {
      method: 'POST',
      headers: { Cookie: adminCookie }
    });
    assert(setPrimaryRes.status === 200, 'Set primary returns 200 OK');
    const primaryResult = await setPrimaryRes.json();
    assert(primaryResult.data?.isPrimary === true, 'Image 2 is now marked as primary');

    // Verify in DB that Image 1 was unset as primary and Image 2 was promoted
    if (db) {
      const img1Doc = await db.collection('wah_media').findOne(buildMediaIdFilter(uploadedMediaId1));
      const img2Doc = await db.collection('wah_media').findOne(buildMediaIdFilter(uploadedMediaId2));
      assert(img1Doc?.isPrimary === false, 'Image 1 was demoted from primary');
      assert(img2Doc?.isPrimary === true, 'Image 2 is promoted to primary');
    }

    // Reorder gallery items
    const reorderRes = await fetch(`${baseUrl}/admin/media/gallery/reorder`, {
      method: 'POST',
      headers: { Cookie: adminCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [
          { id: uploadedMediaId2, displayOrder: 0 },
          { id: uploadedMediaId1, displayOrder: 1 }
        ]
      })
    });
    assert(reorderRes.status === 200, 'Gallery reorder returns 200 OK');

    // -------------------------------------------------------------
    // SECTION 5: TRANSACTIONAL IMAGE REPLACEMENT
    // -------------------------------------------------------------
    console.log('\n--- 5. Transactional Image Replacement ---');

    // 5.1 Replacement failure safety: Try to replace Image 2 with invalid file
    const failedReplaceRes = await sendUpload(
      `${baseUrl}/admin/media/${uploadedMediaId2}/replace`,
      adminCookie,
      {},
      fakeJpgBuffer,
      'bad_replace.jpg',
      'image/jpeg'
    );
    assert(failedReplaceRes.status === 400, 'Failed replacement returns 400 Bad Request');
    if (db) {
      const untouchedDoc = await db.collection('wah_media').findOne(buildMediaIdFilter(uploadedMediaId2));
      assert(untouchedDoc?.publicId === uploadData2.data?.publicId, 'Original media untouched after failed replacement');
    }

    // 5.2 Successful replacement: Replace Image 2 with new valid PNG
    const successReplaceRes = await sendUpload(
      `${baseUrl}/admin/media/${uploadedMediaId2}/replace`,
      adminCookie,
      { alt: 'بديل فخار قنا المحدث' },
      VALID_1X1_PNG,
      'qena_pottery_updated.png',
      'image/png'
    );
    assert(successReplaceRes.status === 200, 'Valid replacement returns 200 OK');
    const replaceData = await successReplaceRes.json();
    assert(replaceData.data?.publicId !== uploadData2.data?.publicId, 'New Cloudinary publicId assigned', replaceData.data?.publicId);
    assert(replaceData.data?.alt === 'بديل فخار قنا المحدث', 'Alt text updated');

    // -------------------------------------------------------------
    // SECTION 6: CLEAN DELETION & CLOUDINARY CLEANUP
    // -------------------------------------------------------------
    console.log('\n--- 6. Clean Deletion & Resource Cleanup ---');

    // Delete Image 2
    const deleteRes2 = await fetch(`${baseUrl}/admin/media/${uploadedMediaId2}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie }
    });
    assert(deleteRes2.status === 200, 'Delete image returns 200 OK');
    if (db) {
      const deletedDoc = await db.collection('wah_media').findOne(buildMediaIdFilter(uploadedMediaId2));
      assert(deletedDoc === null, 'Document completely removed from MongoDB');
    }

    // Delete Image 1
    const deleteRes1 = await fetch(`${baseUrl}/admin/media/${uploadedMediaId1}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie }
    });
    assert(deleteRes1.status === 200, 'Delete image 1 returns 200 OK');

    // -------------------------------------------------------------
    // SECTION 7: BACKWARD COMPATIBILITY (EXTERNAL URL SUPPORT)
    // -------------------------------------------------------------
    console.log('\n--- 7. Backward Compatibility ---');
    // Verify that the media list endpoint supports querying without breaking
    const listRes = await fetch(`${baseUrl}/admin/media?entityType=craft`, {
      headers: { Cookie: adminCookie }
    });
    assert(listRes.status === 200, 'Media list endpoint returns 200 OK');
    const listData = await listRes.json();
    const mediaItems = listData.items || listData.data;
    assert(Array.isArray(mediaItems), 'Returns media items array', `Length: ${mediaItems?.length}`);

  } catch (err) {
    console.error('Test execution error:', err);
    testFailed++;
  } finally {
    server.close();
    console.log('\n===============================================================');
    console.log(`TEST SUITE RESULTS: ${testPassed} PASSED, ${testFailed} FAILED`);
    console.log('===============================================================\n');

    if (testFailed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runAdminMediaTestSuite();
