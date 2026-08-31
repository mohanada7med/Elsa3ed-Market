import dotenv from 'dotenv';
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';
import { createApp } from '../server/app.ts';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function runComprehensiveCloudinaryAudit() {
  console.log('========================================================================');
  console.log('🚀 RUNNING COMPREHENSIVE CLOUDINARY VIDEO & SELLER FOLDER AUDIT & TESTS');
  console.log('========================================================================\n');

  const app = createApp();
  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      baseUrl = `http://127.0.0.1:${addr.port}`;
      console.log(`Test Express server running at: ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    // 1. Authenticate as seller1
    console.log('1. Authenticating as seller1...');
    const sellerLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'seller1', password: 'password123' })
    });
    const sellerLoginJson = await sellerLoginRes.json();
    const sellerToken = sellerLoginJson?.data?.token;
    if (!sellerToken) throw new Error('Seller login failed');
    console.log('✅ Seller token acquired.');

    // 2. Authenticate as admin
    console.log('\n2. Authenticating as admin...');
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password123' })
    });
    const adminLoginJson = await adminLoginRes.json();
    const adminToken = adminLoginJson?.data?.token;
    if (!adminToken) throw new Error('Admin login failed');
    console.log('✅ Admin token acquired.');

    // 3. Test: Reject blob: URLs in /upload-video
    console.log('\n3. Testing: Rejection of temporary blob: URL in /api/reels/upload-video...');
    const blobUploadRes = await fetch(`${baseUrl}/api/reels/upload-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        video: 'blob:https://elsa3ed-market2.vercel.app/342fe55a-a9ba-4d72-83e7-52809bc2f929',
        filename: 'fake_blob.mp4'
      })
    });
    const blobUploadJson = await blobUploadRes.json();
    console.log('Blob upload HTTP status:', blobUploadRes.status);
    console.log('Blob upload response:', blobUploadJson);
    if (blobUploadRes.status === 400 && !blobUploadJson.success) {
      console.log('✅ PASS: Rejected temporary blob: URL correctly with HTTP 400.');
    } else {
      throw new Error('FAIL: /upload-video did not reject blob: URL');
    }

    // 4. Test: Reject blob: URLs in POST /api/reels
    console.log('\n4. Testing: Rejection of temporary blob: URL in POST /api/reels...');
    const blobCreateRes = await fetch(`${baseUrl}/api/reels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        title: 'فيديو اختبار رفض الرابط المؤقت',
        videoUrl: 'blob:https://elsa3ed-market2.vercel.app/342fe55a-a9ba-4d72-83e7-52809bc2f929',
        productId: 'prod-test-1'
      })
    });
    const blobCreateJson = await blobCreateRes.json();
    console.log('Blob create HTTP status:', blobCreateRes.status);
    console.log('Blob create response:', blobCreateJson);
    if (blobCreateRes.status === 400 && !blobCreateJson.success) {
      console.log('✅ PASS: Rejected saving blob: URL into database correctly with HTTP 400.');
    } else {
      throw new Error('FAIL: POST /api/reels did not reject blob: URL');
    }

    // 5. Test: Seller Video Upload into Dedicated Seller Folder Elsa3ed-Market/sellers/seller-1/videos/
    console.log('\n5. Testing: Seller Video Upload with Folder Isolation (Elsa3ed-Market/sellers/seller-1/videos)...');
    const sellerUploadRes = await fetch(`${baseUrl}/api/reels/upload-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        video: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
        filename: `seller1_reel_${Date.now()}.mp4`,
        mimeType: 'video/mp4'
      })
    });
    const sellerUploadJson = await sellerUploadRes.json();
    console.log('Seller upload response:', sellerUploadJson);

    if (!sellerUploadJson.success || !sellerUploadJson.data?.fileKey) {
      throw new Error(`Seller upload failed: ${JSON.stringify(sellerUploadJson)}`);
    }

    const sellerFileKey = sellerUploadJson.data.fileKey;
    const sellerVideoUrl = sellerUploadJson.data.url;
    console.log('Seller File Key (Public ID):', sellerFileKey);
    console.log('Seller Video URL:', sellerVideoUrl);

    if (!sellerFileKey.startsWith('Elsa3ed-Market/sellers/seller-1/videos/')) {
      throw new Error(`FAIL: Seller video public_id does NOT match Elsa3ed-Market/sellers/seller-1/videos/! Got: ${sellerFileKey}`);
    }
    console.log('✅ PASS: Seller video uploaded into isolated seller folder: Elsa3ed-Market/sellers/seller-1/videos/');

    // 6. Test: Cross-seller folder isolation (attempt spoofing targetSellerId from seller account)
    console.log('\n6. Testing: Cross-seller security (Seller attempting to spoof targetSellerId="seller-999")...');
    const spoofUploadRes = await fetch(`${baseUrl}/api/reels/upload-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        video: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
        filename: `spoof_reel_${Date.now()}.mp4`,
        targetSellerId: 'seller-999' // Spoofed!
      })
    });
    const spoofUploadJson = await spoofUploadRes.json();
    const spoofFileKey = spoofUploadJson.data?.fileKey;
    console.log('Spoofed upload resulting key:', spoofFileKey);

    if (!spoofFileKey.startsWith('Elsa3ed-Market/sellers/seller-1/videos/')) {
      throw new Error(`SECURITY FAIL: Backend trusted client spoofed sellerId! Got: ${spoofFileKey}`);
    }
    console.log('✅ PASS: Backend strictly derived sellerId from server-authenticated session token!');

    // Clean up spoofed test video
    await cloudinary.uploader.destroy(spoofFileKey, { resource_type: 'video' });

    // 7. Test: Admin Video Upload into Admin Folder Elsa3ed-Market/admin/videos/
    console.log('\n7. Testing: Admin Video Upload (Elsa3ed-Market/admin/videos/)...');
    const adminUploadRes = await fetch(`${baseUrl}/api/reels/upload-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        video: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
        filename: `admin_reel_${Date.now()}.mp4`
      })
    });
    const adminUploadJson = await adminUploadRes.json();
    const adminFileKey = adminUploadJson.data?.fileKey;
    console.log('Admin File Key (Public ID):', adminFileKey);

    if (!adminFileKey.startsWith('Elsa3ed-Market/admin/videos/')) {
      throw new Error(`FAIL: Admin video public_id does NOT match Elsa3ed-Market/admin/videos/! Got: ${adminFileKey}`);
    }
    console.log('✅ PASS: Admin video uploaded into admin folder: Elsa3ed-Market/admin/videos/');

    // Clean up admin test video
    await cloudinary.uploader.destroy(adminFileKey, { resource_type: 'video' });

    // 8. Test: Create Reel in Database with Cloudinary Public ID
    console.log('\n8. Testing: Create Reel with Cloudinary Public ID and permanent URL...');
    const createReelRes = await fetch(`${baseUrl}/api/reels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        title: 'فيديو صناعة الفخار الصعيدي - اختبار كود الكلاود',
        videoUrl: sellerVideoUrl,
        cloudinaryPublicId: sellerFileKey,
        artisanName: 'عم حمزة القناوي',
        workshopName: 'ورشة الفخار القناوي الأصيل',
        governorate: 'قنا',
        craftType: 'فخار قناوي أصيل',
        productId: 'prod-pottery-test-1',
        productTitle: 'قلة قناوي مبردة بالنقوش التراثية',
        productPrice: 280
      })
    });
    const createReelJson = await createReelRes.json();
    console.log('Create Reel Response:', createReelJson);
    const createdReelId = createReelJson.data?.id;

    if (!createdReelId || !createReelJson.data?.cloudinaryPublicId) {
      throw new Error(`Create reel failed: ${JSON.stringify(createReelJson)}`);
    }
    console.log(`✅ PASS: Reel created in database with id=${createdReelId} and cloudinaryPublicId=${createReelJson.data.cloudinaryPublicId}`);

    // 9. Test: Delete Reel and verify Cloudinary Asset Cleanup
    console.log('\n9. Testing: Delete Reel and Cloudinary Asset Cleanup...');
    const deleteRes = await fetch(`${baseUrl}/api/reels/${createdReelId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sellerToken}`
      }
    });
    const deleteJson = await deleteRes.json();
    console.log('Delete Reel response:', deleteJson);
    if (!deleteJson.success) {
      throw new Error(`Delete reel failed: ${JSON.stringify(deleteJson)}`);
    }
    console.log('✅ PASS: Reel deleted from database and Cloudinary deletion triggered.');

    console.log('\n========================================================================');
    console.log('🎉 ALL CLOUDINARY & SELLER FOLDER AUDIT TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('========================================================================\n');
  } finally {
    if (server) {
      server.close();
    }
  }
}

runComprehensiveCloudinaryAudit().catch((err) => {
  console.error('❌ Cloudinary Audit Error:', err);
  process.exit(1);
});
