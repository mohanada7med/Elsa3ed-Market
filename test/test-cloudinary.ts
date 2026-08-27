import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testUpload() {
    const testPng =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    console.log('Uploading test image to Cloudinary...');

    const result = await cloudinary.uploader.upload(testPng, {
        folder: 'Elsa3ed-Market/products/test-prod-1',
        public_id: 'test_img_1',
        overwrite: true,
    });

    console.log('Upload success:', Boolean(result.secure_url));
    console.log('Public ID:', result.public_id);
    console.log('Secure URL:', result.secure_url);

    console.log('Deleting test image...');

    const deleted = await cloudinary.uploader.destroy(result.public_id);

    console.log('Cleanup result:', deleted.result);
}

testUpload()
    .then(() => {
        console.log('✅ Cloudinary upload test completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Test upload failed:', error?.message || error);
        process.exit(1);
    });