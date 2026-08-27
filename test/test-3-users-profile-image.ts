import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'Elsa3ed_market';

// Real test PNG images (valid 64x64 PNG base64 strings)
const TEST_PNG_BUYER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABMSURBVHgB7c4BDQAAAMKg909tDwcUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgDYZtAABa4xUzgAAAABJRU5ErkJggg==';

const TEST_PNG_BUYER_REPLACE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUSURBVHgB7c6xEQAwCMTABvtv5gLgWJAgmZpY85yZk8t6AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA7Ab7jAABQj/6+gAAAABJRU5ErkJggg==';

const TEST_PNG_SELLER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABYSURBVHgB7c7BDQAwCMTADvuP7IKYq6RBSn0e1zln1uRy3gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8Fk8jQAB/W89cgAAAABJRU5ErkJggg==';

const TEST_PNG_ADMIN =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABYSURBVHgB7c7BDQAwCMTADvuPzIJYqCRBSn0e1zln1uRy3gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8Fk8jQAB/W89cgAAAABJRU5ErkJggg==';

interface StepResult {
  title: string;
  passed: boolean;
  message: string;
  error?: any;
}

const testResults: StepResult[] = [];

function logTest(title: string, passed: boolean, message: string, error?: any) {
  testResults.push({ title, passed, message, error });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${title}] ${message}`);
  if (error) {
    console.error('   Details:', error);
  }
}

async function runProfileImageTests() {
  console.log('================================================================');
  console.log('🚀 RUNNING PROFILE IMAGE TESTS FOR 3 AUTHENTICATED USERS');
  console.log('================================================================\n');

  if (!MONGO_URI) {
    console.error('MONGODB_URI missing from environment.');
    process.exit(1);
  }

  const mongo = new MongoClient(MONGO_URI);
  await mongo.connect();
  const db = mongo.db(DB_NAME);

  const password = 'Sa3ed@2025';

  try {
    // -------------------------------------------------------------------------
    // 0. Verify Database contains exactly 3 users
    // -------------------------------------------------------------------------
    const userCount = await db.collection('users').countDocuments();
    logTest(
      '0. Database User Count',
      userCount === 3,
      `Exact user count in database: ${userCount} (Admin, Buyer, Seller)`
    );

    // -------------------------------------------------------------------------
    // Login all 3 users
    // -------------------------------------------------------------------------
    // 1. Buyer Login
    const buyerLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ahmed.hashmi@gmail.com', password })
    });
    const buyerLoginJson = await buyerLogin.json();
    const buyerToken = buyerLoginJson.data?.token;
    const buyerUserId = buyerLoginJson.data?.user?.id;

    // 2. Seller Login
    const sellerLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'saeed.pottery@elsa3ed.eg', password })
    });
    const sellerLoginJson = await sellerLogin.json();
    const sellerToken = sellerLoginJson.data?.token;
    const sellerUserId = sellerLoginJson.data?.user?.id;
    const sellerId = sellerLoginJson.data?.user?.sellerId;

    // 3. Admin Login
    const adminLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@elsa3ed.eg', password })
    });
    const adminLoginJson = await adminLogin.json();
    const adminToken = adminLoginJson.data?.token;
    const adminUserId = adminLoginJson.data?.user?.id;

    const loginsSuccessful = buyerLogin.ok && sellerLogin.ok && adminLogin.ok;
    logTest(
      '0. Multi-Role Authentication',
      loginsSuccessful,
      `Buyer: ${buyerUserId}, Seller: ${sellerUserId}, Admin: ${adminUserId}`
    );

    // -------------------------------------------------------------------------
    // TEST 1: Buyer Profile Image Upload
    // -------------------------------------------------------------------------
    console.log('\n--- Test 1: Buyer Uploads Profile Image ---');
    const buyerUploadRes = await fetch(`${BASE_URL}/api/auth/profile/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
        'x-user-id': buyerUserId,
        'x-user-role': 'buyer'
      },
      body: JSON.stringify({
        image: TEST_PNG_BUYER,
        filename: 'buyer_profile.png'
      })
    });
    const buyerUploadJson = await buyerUploadRes.json();
    const buyerProfileImage = buyerUploadJson.data?.profileImage;

    const buyerInDb = await db.collection('users').findOne({ id: buyerUserId });
    const buyerExpectedFolder = `Elsa3ed-Market/users/${buyerUserId}/profile`;

    const test1Passed =
      buyerUploadRes.ok &&
      buyerProfileImage?.publicId === buyerExpectedFolder &&
      buyerProfileImage?.secureUrl?.includes('res.cloudinary.com') &&
      buyerInDb?.profileImage?.publicId === buyerExpectedFolder;

    logTest(
      'Test 1: Buyer Upload',
      test1Passed,
      `Folder: ${buyerProfileImage?.publicId}, Verified in MongoDB: ${Boolean(buyerInDb?.profileImage)}`
    );

    // -------------------------------------------------------------------------
    // TEST 2: Refresh Page Simulation (GET /api/auth/me)
    // -------------------------------------------------------------------------
    console.log('\n--- Test 2: Refresh Page / Session Verification ---');
    const refreshRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${buyerToken}`,
        'x-user-id': buyerUserId,
        'x-user-role': 'buyer'
      }
    });
    const refreshJson = await refreshRes.json();
    const refreshedUser = refreshJson.data;

    const test2Passed =
      refreshRes.ok &&
      refreshedUser?.profileImage?.publicId === buyerExpectedFolder &&
      refreshedUser?.avatar === buyerProfileImage?.secureUrl;

    logTest(
      'Test 2: Page Refresh Persistence',
      test2Passed,
      `Image remains visible on session restore: ${refreshedUser?.avatar}`
    );

    // -------------------------------------------------------------------------
    // TEST 3: Replace Buyer Profile Image
    // -------------------------------------------------------------------------
    console.log('\n--- Test 3: Replace Buyer Profile Image ---');
    const replaceRes = await fetch(`${BASE_URL}/api/auth/profile/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
        'x-user-id': buyerUserId,
        'x-user-role': 'buyer'
      },
      body: JSON.stringify({
        image: TEST_PNG_BUYER_REPLACE,
        filename: 'buyer_profile_updated.png'
      })
    });
    const replaceJson = await replaceRes.json();
    const replacedImage = replaceJson.data?.profileImage;

    const buyerInDbAfterReplace = await db.collection('users').findOne({ id: buyerUserId });

    const test3Passed =
      replaceRes.ok &&
      replacedImage?.publicId === buyerExpectedFolder &&
      buyerInDbAfterReplace?.profileImage?.publicId === buyerExpectedFolder;

    logTest(
      'Test 3: Replace Profile Image',
      test3Passed,
      `Replaced cleanly under stable publicId: ${replacedImage?.publicId}`
    );

    // -------------------------------------------------------------------------
    // TEST 4: Seller Profile Image Upload
    // -------------------------------------------------------------------------
    console.log('\n--- Test 4: Seller Profile Image in Dedicated Folder ---');
    const sellerUploadRes = await fetch(`${BASE_URL}/api/auth/profile/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`,
        'x-user-id': sellerUserId,
        'x-user-role': 'seller'
      },
      body: JSON.stringify({
        image: TEST_PNG_SELLER,
        filename: 'seller_profile.png'
      })
    });
    const sellerUploadJson = await sellerUploadRes.json();
    const sellerProfileImage = sellerUploadJson.data?.profileImage;
    const sellerExpectedFolder = `Elsa3ed-Market/users/${sellerUserId}/profile`;

    const sellerInDb = await db.collection('users').findOne({ id: sellerUserId });
    const sellerDocInDb = await db.collection('sellers').findOne({ id: sellerId });

    const test4Passed =
      sellerUploadRes.ok &&
      sellerProfileImage?.publicId === sellerExpectedFolder &&
      sellerInDb?.profileImage?.publicId === sellerExpectedFolder &&
      sellerDocInDb?.avatar === sellerProfileImage?.secureUrl;

    logTest(
      'Test 4: Seller Upload',
      test4Passed,
      `Folder: ${sellerProfileImage?.publicId}, Synced with sellers collection: ${Boolean(sellerDocInDb?.avatar)}`
    );

    // -------------------------------------------------------------------------
    // TEST 5: Admin Profile Image Upload
    // -------------------------------------------------------------------------
    console.log('\n--- Test 5: Admin Profile Image in Dedicated Folder ---');
    const adminUploadRes = await fetch(`${BASE_URL}/api/auth/profile/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
        'x-user-id': adminUserId,
        'x-user-role': 'admin'
      },
      body: JSON.stringify({
        image: TEST_PNG_ADMIN,
        filename: 'admin_profile.png'
      })
    });
    const adminUploadJson = await adminUploadRes.json();
    const adminProfileImage = adminUploadJson.data?.profileImage;
    const adminExpectedFolder = `Elsa3ed-Market/users/${adminUserId}/profile`;

    const adminInDb = await db.collection('users').findOne({ id: adminUserId });

    const test5Passed =
      adminUploadRes.ok &&
      adminProfileImage?.publicId === adminExpectedFolder &&
      adminInDb?.profileImage?.publicId === adminExpectedFolder;

    logTest(
      'Test 5: Admin Upload',
      test5Passed,
      `Admin folder: ${adminProfileImage?.publicId}, Verified in MongoDB: ${Boolean(adminInDb?.profileImage)}`
    );

    // -------------------------------------------------------------------------
    // TEST 6: Security - Ignore Client Spoofed userId
    // -------------------------------------------------------------------------
    console.log('\n--- Test 6: Security - Server Ignores Client Spoofed userId ---');
    const spoofAttemptRes = await fetch(`${BASE_URL}/api/auth/profile/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
        'x-user-id': buyerUserId,
        'x-user-role': 'buyer'
      },
      body: JSON.stringify({
        image: TEST_PNG_BUYER,
        filename: 'spoof.png',
        userId: adminUserId // Attempting to inject admin's userId
      })
    });
    const spoofJson = await spoofAttemptRes.json();
    const targetFolderUsed = spoofJson.data?.profileImage?.publicId;
    const isProtected = targetFolderUsed === buyerExpectedFolder;

    logTest(
      'Test 6: Spoofed userId Ignored',
      spoofAttemptRes.ok && isProtected,
      `Folder saved to buyer's own path: ${targetFolderUsed}`
    );

    // -------------------------------------------------------------------------
    // TEST 7: Validation - Reject Non-Image Files
    // -------------------------------------------------------------------------
    console.log('\n--- Test 7: Validation - Non-image File Rejected ---');
    const textDataUri = 'data:text/plain;base64,VGhpcyBpcyBub3QgYW4gaW1hZ2U=';
    const invalidUploadRes = await fetch(`${BASE_URL}/api/auth/profile/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
        'x-user-id': buyerUserId,
        'x-user-role': 'buyer'
      },
      body: JSON.stringify({
        image: textDataUri,
        filename: 'notes.txt'
      })
    });
    const invalidJson = await invalidUploadRes.json();
    const test7Passed = invalidUploadRes.status === 400 && !invalidJson.success;

    logTest(
      'Test 7: Reject Non-Image File',
      test7Passed,
      `Status: ${invalidUploadRes.status}, Error: "${invalidJson.error}"`
    );

    // -------------------------------------------------------------------------
    // TEST 8: Security - Inspect Responses for Secret Leaks
    // -------------------------------------------------------------------------
    console.log('\n--- Test 8: Security - Verify No Credentials Exposed ---');
    const sampleResponses = [
      JSON.stringify(buyerUploadJson),
      JSON.stringify(sellerUploadJson),
      JSON.stringify(adminUploadJson),
      JSON.stringify(refreshJson)
    ];

    const hasNoSecretLeaks = sampleResponses.every((resp) => {
      return (
        !resp.includes('api_secret') &&
        !resp.includes('pNz9EVgbb6g2IUjXXfLOUdAFThs') &&
        !resp.includes('CLOUDINARY_URL') &&
        !resp.includes('mongodb+srv') &&
        !resp.includes('passwordHash')
      );
    });

    logTest(
      'Test 8: Zero Secret Leakage',
      hasNoSecretLeaks,
      'Verified: No API secrets, credentials, or password hashes present in network responses.'
    );

    // -------------------------------------------------------------------------
    // TEST 9: Remove Profile Image (DELETE /api/auth/profile/image)
    // -------------------------------------------------------------------------
    console.log('\n--- Test 9: Remove Profile Image ---');
    const removeRes = await fetch(`${BASE_URL}/api/auth/profile/image`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${buyerToken}`,
        'x-user-id': buyerUserId,
        'x-user-role': 'buyer'
      }
    });

    const buyerInDbAfterRemove = await db.collection('users').findOne({ id: buyerUserId });
    const isProfileImageNull = buyerInDbAfterRemove?.profileImage === null;
    const isDefaultAvatarRestored = Boolean(buyerInDbAfterRemove?.avatar);

    logTest(
      'Test 9: Remove Profile Image',
      removeRes.ok && isProfileImageNull && isDefaultAvatarRestored,
      `Profile image reset: ${isProfileImageNull}, Avatar restored: ${buyerInDbAfterRemove?.avatar}`
    );
  } catch (err: any) {
    logTest('Execution Error', false, err.message, err);
  } finally {
    await mongo.close();
  }

  console.log('\n================================================================');
  const allPassed = testResults.every((t) => t.passed);
  console.log(allPassed ? '🎉 ALL 10 TESTS PASSED SUCCESSFULLY!' : '❌ SOME TESTS FAILED');
  console.log('================================================================');
  process.exit(allPassed ? 0 : 1);
}

runProfileImageTests();
