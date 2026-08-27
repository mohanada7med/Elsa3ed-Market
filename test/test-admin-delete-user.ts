import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'Elsa3ed_market';

// Real test PNG image for testing Cloudinary uploads
const TEST_PRODUCT_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABYSURBVHgB7c7BDQAwCMTADvuP7IKYq6RBSn0e1zln1uRy3gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8Fk8jQAB/W89cgAAAABJRU5ErkJggg==';

const TEST_PROFILE_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABMSURBVHgB7c4BDQAAAMKg909tDwcUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgDYZtAABa4xUzgAAAABJRU5ErkJggg==';

interface TestResult {
  num: string;
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function recordTest(num: string, name: string, passed: boolean, message: string, details?: any) {
  results.push({ num, name, passed, message, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [TEST ${num}: ${name}] ${message}`);
  if (!passed && details) {
    console.error('   Details:', details);
  }
}

async function runAdminDeleteTests() {
  console.log('================================================================');
  console.log('🛡️ RUNNING ADMIN USER MANAGEMENT & DELETION TEST SUITE');
  console.log('================================================================\n');

  if (!MONGO_URI) {
    console.error('MONGODB_URI is not set in environment.');
    process.exit(1);
  }

  const mongo = new MongoClient(MONGO_URI);
  await mongo.connect();
  const db = mongo.db(DB_NAME);

  const timestamp = Date.now();

  try {
    // -------------------------------------------------------------------------
    // SETUP: Login Admin
    // -------------------------------------------------------------------------
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@elsa3ed.eg', password: 'Sa3ed@2025' })
    });
    const adminLoginJson = await adminLoginRes.json();
    const adminToken = adminLoginJson.data?.token;
    const adminUserId = adminLoginJson.data?.user?.id;
    const adminHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
      'x-user-id': adminUserId,
      'x-user-role': 'admin'
    };

    // -------------------------------------------------------------------------
    // TEST 1: Admin Loads Users Management List
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 1: Admin Opens Users Management ---');
    const listRes = await fetch(`${BASE_URL}/api/admin/users`, { headers: adminHeaders });
    const listJson = await listRes.json();
    const usersInList = listJson.data || [];
    const test1Passed = listRes.ok && Array.isArray(usersInList) && usersInList.length >= 3;

    recordTest(
      '1',
      'Load Users from MongoDB',
      test1Passed,
      `Users retrieved from database: ${usersInList.length}`
    );

    // -------------------------------------------------------------------------
    // TEST 2: Open a Buyer Account & Verify Safe Information Display
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: View Safe Buyer Details ---');
    const buyerInList = usersInList.find((u: any) => u.role === 'buyer') || usersInList[0];
    const detailsRes = await fetch(`${BASE_URL}/api/admin/users/${buyerInList.id}`, { headers: adminHeaders });
    const detailsJson = await detailsRes.json();
    const buyerData = detailsJson.data;

    const test2Passed =
      detailsRes.ok &&
      buyerData &&
      buyerData.email &&
      buyerData.name &&
      !('passwordHash' in buyerData) &&
      !JSON.stringify(buyerData).includes('passwordHash');

    recordTest(
      '2',
      'Display Safe User Information',
      test2Passed,
      `User ${buyerData?.name} retrieved safely without passwordHash or credentials.`
    );

    // -------------------------------------------------------------------------
    // TEST 3: Delete Buyer & Verify Account Data & Order Preservation
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Delete Buyer with Order Preservation ---');
    // 1. Create dedicated buyer for deletion
    const testBuyerEmail = `buyer.delete.test.${timestamp}@elsa3ed.eg`;
    const regBuyerRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'مشتري تجريبي للاختبار',
        email: testBuyerEmail,
        password: 'BuyerPassword2026!',
        phone: '01055556666',
        role: 'buyer',
        governorate: 'أسوان'
      })
    });
    const regBuyerJson = await regBuyerRes.json();
    const testBuyerToken = regBuyerJson.data?.token;
    const testBuyerId = regBuyerJson.data?.user?.id;

    // 2. Buyer uploads profile image to Cloudinary
    await fetch(`${BASE_URL}/api/auth/profile/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testBuyerToken}`,
        'x-user-id': testBuyerId,
        'x-user-role': 'buyer'
      },
      body: JSON.stringify({ image: TEST_PROFILE_IMAGE, filename: 'buyer_photo.png' })
    });

    // 3. Buyer adds an item to cart and creates a sample order
    await db.collection('carts').insertOne({
      id: `cart-${testBuyerId}`,
      buyerId: testBuyerId,
      items: [{ productId: 'prod-1', quantity: 2 }]
    } as any);

    const testOrderId = `order-test-${timestamp}`;
    await db.collection('orders').insertOne({
      id: testOrderId,
      orderNumber: `SAED-${timestamp.toString().slice(-4)}`,
      buyerId: testBuyerId,
      buyerName: 'مشتري تجريبي للاختبار',
      buyerPhone: '01055556666',
      buyerEmail: testBuyerEmail,
      shippingAddress: {
        fullName: 'مشتري تجريبي للاختبار',
        phone: '01055556666',
        governorate: 'أسوان',
        city: 'كوم أمبو',
        streetAddress: 'شارع الجمهورية'
      },
      items: [
        {
          productId: 'prod-1',
          productTitle: 'فخار قناوي',
          productImage: 'https://res.cloudinary.com/test.png',
          sellerId: 'seller-1',
          sellerName: 'ورشة سعيد',
          sellerGovernorate: 'قنا',
          quantity: 2,
          unitPrice: 200,
          subtotal: 400
        }
      ],
      status: 'confirmed',
      paymentMethod: 'vodafone_cash',
      paymentStatus: 'paid',
      total: 400,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as any);

    // 4. Admin deletes Buyer
    const deleteBuyerRes = await fetch(`${BASE_URL}/api/admin/users/${testBuyerId}`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    const deleteBuyerJson = await deleteBuyerRes.json();

    // Verify in MongoDB: User deleted, Cart deleted, Order preserved & anonymized!
    const buyerInDb = await db.collection('users').findOne({ id: testBuyerId });
    const cartInDb = await db.collection('carts').findOne({ buyerId: testBuyerId });
    const orderInDb = await db.collection('orders').findOne({ id: testOrderId });

    const isUserDeleted = buyerInDb === null;
    const isCartDeleted = cartInDb === null;
    const isOrderPreservedAndAnonymized =
      orderInDb !== null &&
      orderInDb.buyerName === 'مستخدم محذوف' &&
      orderInDb.total === 400;

    const test3Passed =
      deleteBuyerRes.ok &&
      isUserDeleted &&
      isCartDeleted &&
      isOrderPreservedAndAnonymized;

    recordTest(
      '3',
      'Delete Buyer & Anonymize Orders',
      test3Passed,
      `User deleted: ${isUserDeleted}, Cart deleted: ${isCartDeleted}, Order preserved with anonymized name: "${orderInDb?.buyerName}"`
    );

    // Clean up test order
    await db.collection('orders').deleteOne({ id: testOrderId });

    // -------------------------------------------------------------------------
    // TEST 4 & 5: Create Seller with Products & Cloudinary Images -> Admin Deletes Seller
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4 & 5: Delete Seller and Clean Up Products & Cloudinary Assets ---');
    const testSellerEmail = `seller.delete.test.${timestamp}@elsa3ed.eg`;
    const regSellerRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'حرفي تجريبي للحذف',
        email: testSellerEmail,
        password: 'SellerPassword2026!',
        phone: '01077778888',
        role: 'seller',
        workshopName: `ورشة تجريبية ${timestamp}`,
        governorate: 'سوهاج'
      })
    });
    const regSellerJson = await regSellerRes.json();
    const testSellerToken = regSellerJson.data?.token;
    const testSellerUserId = regSellerJson.data?.user?.id;
    const testSellerId = regSellerJson.data?.user?.sellerId;

    // Approve Seller
    await fetch(`${BASE_URL}/api/admin/sellers/${testSellerId}/status`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'approved' })
    });

    // Upload Seller profile image
    await fetch(`${BASE_URL}/api/auth/profile/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testSellerToken}`,
        'x-user-id': testSellerUserId,
        'x-user-role': 'seller'
      },
      body: JSON.stringify({ image: TEST_PROFILE_IMAGE, filename: 'seller_profile.png' })
    });

    // Seller creates product and uploads a real Cloudinary image
    const testProdId = `prod-delete-test-${timestamp}`;
    const uploadProdImgRes = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testSellerToken}`,
        'x-user-id': testSellerUserId,
        'x-user-role': 'seller'
      },
      body: JSON.stringify({
        image: TEST_PRODUCT_IMAGE,
        filename: 'heritage_craft.png',
        folder: 'products',
        productId: testProdId
      })
    });
    const uploadProdImgJson = await uploadProdImgRes.json();
    const uploadedProdImageUrl = uploadProdImgJson.data?.url || '';

    // Insert Product Document
    await db.collection('products').insertOne({
      id: testProdId,
      title: 'قطعة فخار تجريبية لحذف البائع',
      categoryId: 'pottery',
      categoryName: 'فخار وخزف',
      sellerId: testSellerId,
      sellerName: 'ورشة تجريبية',
      sellerGovernorate: 'سوهاج',
      price: 350,
      rating: 5,
      reviewCount: 0,
      inStock: true,
      stockCount: 10,
      images: [uploadedProdImageUrl],
      description: 'وصف تجريبي',
      approvalStatus: 'approved',
      createdAt: new Date().toISOString()
    } as any);

    // Verify product exists before delete
    const productBefore = await db.collection('products').findOne({ id: testProdId });
    const sellerBefore = await db.collection('sellers').findOne({ id: testSellerId });

    // Admin Deletes Seller
    const deleteSellerRes = await fetch(`${BASE_URL}/api/admin/users/${testSellerUserId}`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    const deleteSellerJson = await deleteSellerRes.json();

    // Verify in MongoDB: Seller user deleted, Seller record deleted, Products deleted!
    const sellerUserAfter = await db.collection('users').findOne({ id: testSellerUserId });
    const sellerDocAfter = await db.collection('sellers').findOne({ id: testSellerId });
    const productAfter = await db.collection('products').findOne({ id: testProdId });

    const isSellerUserDeleted = sellerUserAfter === null;
    const isSellerDocDeleted = sellerDocAfter === null;
    const isProductDeleted = productAfter === null;

    recordTest(
      '4',
      'Delete Seller Account & Records',
      deleteSellerRes.ok && isSellerUserDeleted && isSellerDocDeleted && isProductDeleted,
      `Seller User deleted: ${isSellerUserDeleted}, Seller Doc deleted: ${isSellerDocDeleted}, Seller Products deleted: ${isProductDeleted}`
    );

    recordTest(
      '5',
      'Clean Up Seller Cloudinary Assets',
      deleteSellerJson.data?.deletedProductImagesCount > 0 || deleteSellerJson.data?.deletedProfileImage === true,
      `Cleaned up ${deleteSellerJson.data?.deletedProductImagesCount || 0} product images and profile image from Cloudinary.`
    );

    // -------------------------------------------------------------------------
    // TEST 6: Admin Deletes Another User
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Authorized Deletion of Another User ---');
    const tempUserEmail = `temp.user.${timestamp}@elsa3ed.eg`;
    const tempRegRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'مستخدم تجريبي إضافي',
        email: tempUserEmail,
        password: 'Password123!',
        phone: '01099990000',
        role: 'buyer',
        governorate: 'الأقصر'
      })
    });
    const tempRegJson = await tempRegRes.json();
    const tempUserId = tempRegJson.data?.user?.id;

    const delTempRes = await fetch(`${BASE_URL}/api/admin/users/${tempUserId}`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    recordTest(
      '6',
      'Authorized Deletion of Valid User',
      delTempRes.ok,
      `Successfully deleted user ${tempUserId} with admin authorization.`
    );

    // -------------------------------------------------------------------------
    // TEST 7: Admin Attempts Self-Deletion (Must Be Blocked)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 7: Self-Deletion Protection ---');
    const selfDeleteRes = await fetch(`${BASE_URL}/api/admin/users/${adminUserId}`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    const selfDeleteJson = await selfDeleteRes.json();
    const test7Passed = selfDeleteRes.status === 400 && !selfDeleteJson.success;

    recordTest(
      '7',
      'Prevent Admin Self-Deletion',
      test7Passed,
      `Status: ${selfDeleteRes.status}, Message: "${selfDeleteJson.error}"`
    );

    // -------------------------------------------------------------------------
    // TEST 8: Buyer Attempts to Call Admin Delete API (Must Return 403)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 8: Buyer Authorization Block (403) ---');
    const buyerAuthHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
      'x-user-id': 'user-buyer-1',
      'x-user-role': 'buyer'
    };

    const buyerDeleteAttempt = await fetch(`${BASE_URL}/api/admin/users/user-buyer-1`, {
      method: 'DELETE',
      headers: buyerAuthHeaders
    });
    const buyerDeleteJson = await buyerDeleteAttempt.json();
    const test8Passed = buyerDeleteAttempt.status === 403 && !buyerDeleteJson.success;

    recordTest(
      '8',
      'Buyer Forbidden from Admin Deletion',
      test8Passed,
      `Status: ${buyerDeleteAttempt.status}, Error: "${buyerDeleteJson.error}"`
    );

    // -------------------------------------------------------------------------
    // TEST 9: Seller Attempts to Call Admin Delete API (Must Return 403)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 9: Seller Authorization Block (403) ---');
    const sellerAuthHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
      'x-user-id': 'user-seller-1',
      'x-user-role': 'seller'
    };

    const sellerDeleteAttempt = await fetch(`${BASE_URL}/api/admin/users/user-buyer-1`, {
      method: 'DELETE',
      headers: sellerAuthHeaders
    });
    const sellerDeleteJson = await sellerDeleteAttempt.json();
    const test9Passed = sellerDeleteAttempt.status === 403 && !sellerDeleteJson.success;

    recordTest(
      '9',
      'Seller Forbidden from Admin Deletion',
      test9Passed,
      `Status: ${sellerDeleteAttempt.status}, Error: "${sellerDeleteJson.error}"`
    );

    // -------------------------------------------------------------------------
    // TEST 10: Delete Invalid / Nonexistent User ID (Must Return 404)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 10: Invalid / Nonexistent User ID ---');
    const invalidDeleteRes = await fetch(`${BASE_URL}/api/admin/users/non-existent-user-999999`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    const invalidDeleteJson = await invalidDeleteRes.json();
    const test10Passed = invalidDeleteRes.status === 404 && !invalidDeleteJson.success;

    recordTest(
      '10',
      'Reject Invalid / Nonexistent User ID',
      test10Passed,
      `Status: ${invalidDeleteRes.status}, Error: "${invalidDeleteJson.error}"`
    );

    // -------------------------------------------------------------------------
    // TEST 11: Audit Log Verification
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 11: Audit Log Trail Verification ---');
    const latestAuditLog = await db.collection('audit_logs').findOne({
      action: 'DELETE_USER'
    }, { sort: { timestamp: -1 } });

    const test11Passed =
      latestAuditLog !== null &&
      latestAuditLog.userRole === 'admin' &&
      latestAuditLog.action === 'DELETE_USER';

    recordTest(
      '11',
      'Verify Audit Log Entry Recorded',
      test11Passed,
      `Action: ${latestAuditLog?.action}, Details: "${latestAuditLog?.details}"`
    );

    // -------------------------------------------------------------------------
    // TEST 12: Zero Secrets Exposed
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 12: Inspect Responses for Zero Secret Leaks ---');
    const sampleResponses = [
      JSON.stringify(listJson),
      JSON.stringify(detailsJson),
      JSON.stringify(deleteBuyerJson),
      JSON.stringify(deleteSellerJson)
    ];

    const hasNoSecretLeaks = sampleResponses.every((resp) => {
      return (
        !resp.includes('passwordHash') &&
        !resp.includes('api_secret') &&
        !resp.includes('pNz9EVgbb6g2IUjXXfLOUdAFThs') &&
        !resp.includes('CLOUDINARY_URL') &&
        !resp.includes('mongodb+srv')
      );
    });

    recordTest(
      '12',
      'Zero Secret Leakage in Responses',
      hasNoSecretLeaks,
      'Confirmed: No password hashes, API secrets, or credentials leaked in any network responses.'
    );
  } catch (err: any) {
    recordTest('EXECUTION_ERROR', 'Test Run Encountered Error', false, err.message, err);
  } finally {
    await mongo.close();
  }

  console.log('\n================================================================');
  const allPassed = results.every((r) => r.passed);
  console.log(allPassed ? '🎉 ALL 12 ADMIN MANAGEMENT TESTS PASSED!' : '❌ SOME TESTS FAILED');
  console.log('================================================================');
  process.exit(allPassed ? 0 : 1);
}

runAdminDeleteTests();
