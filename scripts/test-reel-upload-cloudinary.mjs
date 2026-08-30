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

async function testReelUploadFlow() {
  console.log('=== VERIFYING REEL UPLOAD TO CLOUDINARY FOLDER Elsa3ed-Market/reels ===\n');

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
    console.log('1. Logging in as seller1...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'seller1', password: 'password123' })
    });
    const loginJson = await loginRes.json();
    const token = loginJson?.data?.token;

    if (!token) {
      throw new Error(`Login failed: ${JSON.stringify(loginJson)}`);
    }
    console.log('✅ Logged in successfully. Token acquired.');

    // 2. Prepare sample video payload
    console.log('\n2. Uploading craft reel video to /api/reels/upload-video...');
    const uploadRes = await fetch(`${baseUrl}/api/reels/upload-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        video: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
        filename: `artisan_pottery_reel_${Date.now()}.mp4`,
        mimeType: 'video/mp4'
      })
    });


    const uploadJson = await uploadRes.json();
    console.log('Upload response status:', uploadRes.status);
    console.log('Upload response body:', uploadJson);

    if (!uploadJson.success || !uploadJson.data?.url) {
      throw new Error(`Reel upload failed: ${uploadJson.error || 'No URL returned'}`);
    }

    const { url, fileKey, duration } = uploadJson.data;

    // 3. Assert URL and folder location
    console.log('\n3. Verifying Cloudinary destination folder:');
    console.log(' - Video URL:', url);
    console.log(' - Cloudinary Public ID:', fileKey);

    const isInTargetFolder = fileKey.startsWith('Elsa3ed-Market/reels/');
    const isCloudinarySecureUrl = url.startsWith('https://res.cloudinary.com/kuana1nl/video/upload/');

    if (!isInTargetFolder) {
      throw new Error(`FAIL: Video was NOT stored in Elsa3ed-Market/reels! Public ID is: ${fileKey}`);
    }
    if (!isCloudinarySecureUrl) {
      throw new Error(`FAIL: Video URL is NOT on Cloudinary secure storage! URL is: ${url}`);
    }

    console.log('✅ PASS: Video stored in folder: Elsa3ed-Market/reels');
    console.log('✅ PASS: Video served from Cloudinary HTTPS CDN');

    // 4. Verify asset exists directly in Cloudinary Media Library via Admin API
    console.log('\n4. Verifying asset directly in Cloudinary Media Library API...');
    const assetDetails = await cloudinary.api.resource(fileKey, { resource_type: 'video' });
    console.log('✅ Cloudinary confirms asset exists:');
    console.log(' - Format:', assetDetails.format);
    console.log(' - Bytes:', assetDetails.bytes);
    console.log(' - Folder:', assetDetails.folder || 'Elsa3ed-Market/reels');
    console.log(' - Duration (seconds):', assetDetails.duration);

    // 5. Clean up the test video from Cloudinary
    console.log('\n5. Cleaning up test video from Cloudinary...');
    const destroyRes = await cloudinary.uploader.destroy(fileKey, { resource_type: 'video' });
    console.log('✅ Cleanup result:', destroyRes);

    console.log('\n🎉 ALL REEL CLOUDINARY UPLOAD VERIFICATIONS PASSED SUCCESSFULLY!');
  } finally {
    if (server) {
      server.close();
    }
  }
}

testReelUploadFlow().catch((err) => {
  console.error('\n❌ Verification failed:', err);
  process.exit(1);
});
