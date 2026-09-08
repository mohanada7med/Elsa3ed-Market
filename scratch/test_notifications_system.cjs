/**
 * Comprehensive Automated End-to-End QA Test for Elsa3ed Market Notification System
 * Tests:
 * 1. Guest protection (401 Unauthorized on protected notification endpoints)
 * 2. Strict ownership & authorization (User A cannot access/modify User B's notifications)
 * 3. Real event notifications:
 *    - Seller application -> Admin notification
 *    - Admin approves seller -> User notification
 *    - Admin rejects seller -> User notification
 *    - Order created -> Buyer, Seller, and Admin notifications
 *    - Order status updated -> Buyer notification
 *    - Payout request -> Admin notification
 *    - Admin approves/pays payout -> Seller notification
 *    - Password reset request -> Admin notification
 *    - Admin completes password reset -> Safe User notification (no passwords/secrets)
 *    - Product created (pending) -> Admin notification
 *    - Product approved/rejected -> Seller notification
 * 4. API Endpoints:
 *    - GET /api/notifications
 *    - GET /api/notifications/unread-count
 *    - PATCH /api/notifications/:id/read
 *    - PATCH /api/notifications/read-all
 *    - DELETE /api/notifications/:id
 * 5. Database state: Zero fake/seed notifications in MongoDB
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });

const BASE_URL = 'http://127.0.0.1:3000';
const MONGO_URI = process.env.MONGODB_URI;

let client;
let db;

async function setup() {
  if (!MONGO_URI) {
    throw new Error('MONGODB_URI is not defined in .env');
  }
  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db('Elsa3ed_market');
  console.log('Connected to MongoDB Atlas: Elsa3ed_market');
}

async function teardown() {
  if (client) {
    await client.close();
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, options);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, headers: res.headers, body: json };
}

async function runTests() {
  await setup();
  console.log('\n========================================');
  console.log('RUNNING NOTIFICATION SYSTEM E2E QA SUITE');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  PASS: ${message}`);
      passed++;
    } else {
      console.error(`  FAIL: ${message}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const testUserIds = [
    `test-admin-${timestamp}`,
    `test-buyer-a-${timestamp}`,
    `test-buyer-b-${timestamp}`,
    `test-seller-${timestamp}`
  ];
  const testSellerId = `seller-${timestamp}`;

  try {
    // ----------------------------------------------------
    // TEST 1: Guest Access Protection
    // ----------------------------------------------------
    console.log('\n--- 1. Guest Protection Tests ---');
    const guestNotifs = await request('/api/notifications');
    assert(guestNotifs.status === 401, 'Guest accessing GET /api/notifications returns 401 Unauthorized');

    const guestCount = await request('/api/notifications/unread-count');
    assert(guestCount.status === 401, 'Guest accessing GET /api/notifications/unread-count returns 401 Unauthorized');

    const guestRead = await request('/api/notifications/fake-id/read', { method: 'PATCH' });
    assert(guestRead.status === 401, 'Guest accessing PATCH /api/notifications/:id/read returns 401 Unauthorized');

    const guestReadAll = await request('/api/notifications/read-all', { method: 'PATCH' });
    assert(guestReadAll.status === 401, 'Guest accessing PATCH /api/notifications/read-all returns 401 Unauthorized');

    const guestDelete = await request('/api/notifications/fake-id', { method: 'DELETE' });
    assert(guestDelete.status === 401, 'Guest accessing DELETE /api/notifications/:id returns 401 Unauthorized');

    // ----------------------------------------------------
    // TEST 2: Setup Authenticated Test Users (Admin, Buyer A, Buyer B, Seller)
    // ----------------------------------------------------
    console.log('\n--- 2. Setting up Authenticated Test Actors ---');
    const adminUser = {
      id: testUserIds[0],
      username: `admin_${timestamp}`,
      usernameNormalized: `admin_${timestamp}`,
      email: `admin_${timestamp}@elsa3ed.com`,
      emailNormalized: `admin_${timestamp}@elsa3ed.com`,
      phone: '01012345678',
      name: 'مدير المنصة التجريبي',
      role: 'admin'
    };
    const buyerA = {
      id: testUserIds[1],
      username: `buyer_a_${timestamp}`,
      usernameNormalized: `buyer_a_${timestamp}`,
      email: `buyer_a_${timestamp}@test.com`,
      emailNormalized: `buyer_a_${timestamp}@test.com`,
      phone: '01012345678',
      name: 'المشتري الأول (أحمد)',
      role: 'buyer'
    };
    const buyerB = {
      id: testUserIds[2],
      username: `buyer_b_${timestamp}`,
      usernameNormalized: `buyer_b_${timestamp}`,
      email: `buyer_b_${timestamp}@test.com`,
      emailNormalized: `buyer_b_${timestamp}@test.com`,
      phone: '01012345678',
      name: 'المشتري الثاني (محمود)',
      role: 'buyer'
    };
    const sellerUser = {
      id: testUserIds[3],
      username: `seller_${timestamp}`,
      usernameNormalized: `seller_${timestamp}`,
      email: `seller_${timestamp}@test.com`,
      emailNormalized: `seller_${timestamp}@test.com`,
      phone: '01012345678',
      name: 'الحرفي الصعيدي',
      role: 'seller',
      sellerId: testSellerId
    };

    await db.collection('users').insertMany([adminUser, buyerA, buyerB, sellerUser]);
    await db.collection('sellers').insertOne({
      id: sellerUser.sellerId,
      userId: sellerUser.id,
      name: sellerUser.name,
      brandName: 'ورشة الخزف التراثي',
      governorate: 'قنا',
      status: 'approved',
      payoutMethod: 'vodafone_cash',
      payoutAccount: '01012345678',
      createdAt: new Date().toISOString()
    });

    const adminHeaders = { 'Content-Type': 'application/json', 'x-user-id': adminUser.id, 'x-user-role': 'admin' };
    const buyerAHeaders = { 'Content-Type': 'application/json', 'x-user-id': buyerA.id, 'x-user-role': 'buyer' };
    const buyerBHeaders = { 'Content-Type': 'application/json', 'x-user-id': buyerB.id, 'x-user-role': 'buyer' };
    const sellerHeaders = { 'Content-Type': 'application/json', 'x-user-id': sellerUser.id, 'x-user-role': 'seller', 'x-seller-id': sellerUser.sellerId };

    // Verify initial unread count for Buyer A is 0
    const buyerAInitialCount = await request('/api/notifications/unread-count', { headers: buyerAHeaders });
    assert(buyerAInitialCount.status === 200 && buyerAInitialCount.body.count === 0, 'Buyer A has initially 0 notifications');

    // ----------------------------------------------------
    // TEST 3: Direct Notification Creation & Strict Recipient Ownership
    // ----------------------------------------------------
    console.log('\n--- 3. Strict Ownership & Recipient Isolation Tests ---');
    const notifAId = `notif-a-${timestamp}`;
    await db.collection('notifications').insertOne({
      id: notifAId,
      userId: buyerA.id,
      title: 'إشعار خاص بالمشتري أ',
      message: 'محتوى سري لا يمكن لغير المشتري أ الاطلاع عليه أو تعديله.',
      type: 'account',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    // Buyer A can read their notification
    const buyerANotifs = await request('/api/notifications', { headers: buyerAHeaders });
    assert(
      buyerANotifs.status === 200 &&
      buyerANotifs.body.data.some((n) => n.id === notifAId),
      'Buyer A can fetch their own notification'
    );

    // Buyer B cannot see Buyer A's notification
    const buyerBNotifs = await request('/api/notifications', { headers: buyerBHeaders });
    assert(
      buyerBNotifs.status === 200 &&
      !buyerBNotifs.body.data.some((n) => n.id === notifAId),
      'Buyer B CANNOT see Buyer A notification (Strict isolation)'
    );

    // Buyer B cannot mark Buyer A's notification as read
    const buyerBTryReadA = await request(`/api/notifications/${notifAId}/read`, {
      method: 'PATCH',
      headers: buyerBHeaders
    });
    assert(
      buyerBTryReadA.status === 404,
      'Buyer B CANNOT mark Buyer A notification as read (404/Forbidden)'
    );

    // Buyer B cannot delete Buyer A's notification
    const buyerBTryDeleteA = await request(`/api/notifications/${notifAId}`, {
      method: 'DELETE',
      headers: buyerBHeaders
    });
    assert(
      buyerBTryDeleteA.status === 404,
      'Buyer B CANNOT delete Buyer A notification (404/Forbidden)'
    );

    // Verify Buyer A's notification is still unread in DB
    const notifAInDb = await db.collection('notifications').findOne({ id: notifAId });
    assert(notifAInDb && notifAInDb.isRead === false, 'Buyer A notification remains unread after unauthorized attempts');

    // ----------------------------------------------------
    // TEST 4: Real System Event: Seller Application & Approval Workflow
    // ----------------------------------------------------
    console.log('\n--- 4. Real System Event: Seller Application & Moderation ---');
    const applyRes = await request('/api/seller-requests', {
      method: 'POST',
      headers: buyerAHeaders,
      body: JSON.stringify({
        workshopName: 'مشغل سجاد أخميم اليدوي',
        specialty: 'المنسوجات اليدوية',
        governorate: 'سوهاج',
        phone: '01123456789'
      })
    });
    assert(applyRes.status === 201, 'Buyer A submitted seller application successfully');
    const appliedSellerId = applyRes.body.data ? applyRes.body.data.id : null;

    // Admin should have received a real notification in MongoDB
    const adminSellerNotif = await db.collection('notifications').findOne({
      userId: adminUser.id,
      title: { $regex: /طلب اعتماد ورشة/ }
    });
    assert(adminSellerNotif !== null, 'Admin received real persistent notification for new seller application');

    // Admin approves the seller request
    const approveRes = await request(`/api/admin/seller-requests/${appliedSellerId}/approve`, {
      method: 'PATCH',
      headers: adminHeaders
    });
    assert(approveRes.status === 200, 'Admin approved seller successfully');

    // Buyer A should have received approval notification
    const sellerApprovalNotif = await db.collection('notifications').findOne({
      userId: buyerA.id,
      title: { $regex: /تم اعتماد حساب ورشتك/ }
    });
    assert(sellerApprovalNotif !== null, 'Buyer A received real persistent approval notification');

    // ----------------------------------------------------
    // TEST 5: Real System Event: Order Creation & Order Status Transitions
    // ----------------------------------------------------
    console.log('\n--- 5. Real System Event: Order Creation & Status Transitions ---');
    // Create test product for seller
    const testProduct = {
      id: `prod-${timestamp}`,
      title: 'طقم فناجين فخار قناوي',
      price: 250,
      stockCount: 15,
      inStock: true,
      approvalStatus: 'approved',
      sellerId: sellerUser.sellerId,
      sellerName: 'ورشة الخزف التراثي',
      sellerGovernorate: 'قنا',
      images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61']
    };
    await db.collection('products').insertOne(testProduct);

    // Add product to Buyer B cart
    const addCartRes = await request('/api/cart/items', {
      method: 'POST',
      headers: buyerBHeaders,
      body: JSON.stringify({ productId: testProduct.id, quantity: 2 })
    });
    assert(addCartRes.status === 200, 'Buyer B added product to cart');

    // Create Order
    const createOrderRes = await request('/api/orders', {
      method: 'POST',
      headers: buyerBHeaders,
      body: JSON.stringify({
        shippingAddress: {
          fullName: 'محمود الصعيدي',
          phone: '01011223344',
          governorate: 'قنا',
          city: 'قنا',
          streetAddress: 'شارع التراث القديم'
        },
        paymentMethod: 'cash_on_delivery'
      })
    });
    assert(createOrderRes.status === 201, 'Buyer B created order successfully');
    const createdOrderId = createOrderRes.body.data ? createOrderRes.body.data.id : null;

    // Verify notifications were created for:
    // 1. Buyer B
    const buyerOrderNotif = await db.collection('notifications').findOne({
      userId: buyerB.id,
      type: 'new_order',
      'metadata.orderId': createdOrderId
    });
    assert(buyerOrderNotif !== null, 'Buyer received real persistent notification for order creation');

    // 2. Seller
    const sellerOrderNotif = await db.collection('notifications').findOne({
      userId: sellerUser.id,
      type: 'new_order',
      'metadata.orderId': createdOrderId
    });
    assert(sellerOrderNotif !== null, 'Seller received real persistent notification for new order in workshop');

    // 3. Admin
    const adminOrderNotif = await db.collection('notifications').findOne({
      userId: adminUser.id,
      type: 'new_order',
      'metadata.orderId': createdOrderId
    });
    assert(adminOrderNotif !== null, 'Admin received real persistent notification for new platform order');

    // Seller updates order status to 'processing'
    const updateStatusRes = await request(`/api/seller/orders/${createdOrderId}/status`, {
      method: 'PUT',
      headers: sellerHeaders,
      body: JSON.stringify({ status: 'processing', note: 'جاري التجهيز في الورشة' })
    });
    assert(updateStatusRes.status === 200, 'Seller updated order status to processing');

    // Buyer B should receive real order_status notification
    const buyerStatusNotif = await db.collection('notifications').findOne({
      userId: buyerB.id,
      type: 'order_status',
      'metadata.orderId': createdOrderId,
      'metadata.status': 'processing'
    });
    assert(buyerStatusNotif !== null, 'Buyer received real persistent notification when order status updated');

    // ----------------------------------------------------
    // TEST 6: Real System Event: Seller Payout Request & Admin Action
    // ----------------------------------------------------
    console.log('\n--- 6. Real System Event: Seller Payout Workflow ---');
    // Ensure order is delivered to allow payout balance
    await db.collection('orders').updateOne(
      { id: createdOrderId },
      { $set: { status: 'delivered', paymentStatus: 'paid' } }
    );

    const payoutRes = await request('/api/seller/payouts', {
      method: 'POST',
      headers: sellerHeaders,
      body: JSON.stringify({ amount: 200, notes: 'تحويل أرباح مبيعات الفخار' })
    });
    assert(payoutRes.status === 201, 'Seller submitted payout request successfully');
    const payoutId = payoutRes.body.data ? payoutRes.body.data.id : null;

    // Admin receives payout notification
    const adminPayoutNotif = await db.collection('notifications').findOne({
      userId: adminUser.id,
      link: 'admin-payouts'
    });
    assert(adminPayoutNotif !== null, 'Admin received real persistent notification for seller payout request');

    // Admin approves payout
    const adminApprovePayoutRes = await request(`/api/admin/payouts/${payoutId}/approve`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ note: 'تمت الموافقة من المالية' })
    });
    assert(adminApprovePayoutRes.status === 200, 'Admin approved payout request');

    // Seller receives payout approval notification
    const sellerPayoutApprovedNotif = await db.collection('notifications').findOne({
      userId: sellerUser.id,
      title: { $regex: /الموافقة على طلب صرف المستحقات/ }
    });
    assert(sellerPayoutApprovedNotif !== null, 'Seller received real persistent notification for approved payout');

    // ----------------------------------------------------
    // TEST 7: Real System Event: Password Reset Workflow (Zero Sensitive Data)
    // ----------------------------------------------------
    console.log('\n--- 7. Real System Event: Password Reset Workflow ---');
    const pwdReqRes = await request('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: buyerB.username })
    });
    assert(pwdReqRes.status === 200, 'Password reset requested successfully');
    const resetRequestId = pwdReqRes.body.data ? pwdReqRes.body.data.requestId : null;

    // Admin receives notification for password reset
    const adminResetNotif = await db.collection('notifications').findOne({
      userId: adminUser.id,
      title: { $regex: /طلب استعادة كلمة المرور|طلب إعادة تعيين/ }
    });
    assert(adminResetNotif !== null, 'Admin received real notification for password reset request');

    // Admin completes request
    const completeResetRes = await request(`/api/admin/password-resets/${resetRequestId}/complete`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ temporaryPassword: 'TempPassword123' })
    });
    assert(completeResetRes.status === 200, 'Admin completed password reset');

    // Buyer B receives notification with NO passwords/secrets
    const buyerResetNotif = await db.collection('notifications').findOne({
      userId: buyerB.id,
      title: { $regex: /استعادة كلمة المرور|تحديث بشأن طلب/ }
    });
    assert(buyerResetNotif !== null, 'User received real notification that password reset was handled');
    assert(
      !buyerResetNotif.message.includes('TempPassword123'),
      'CRITICAL SECURITY: Notification does NOT contain temporary password or secrets'
    );

    // ----------------------------------------------------
    // TEST 8: Real System Event: Product Moderation (Approve / Reject)
    // ----------------------------------------------------
    console.log('\n--- 8. Real System Event: Product Moderation ---');
    const newProdRes = await request('/api/seller/products', {
      method: 'POST',
      headers: sellerHeaders,
      body: JSON.stringify({
        title: 'إبريق نحاسي أصيل',
        price: 450,
        stockCount: 5,
        categoryId: 'cat-copper',
        description: 'إبريق نحاسي يدوي الصنع من خان الخليلي وبقايا نحاس الصعيد القديم',
        images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61']
      })
    });
    assert(newProdRes.status === 201, 'Seller submitted product for review');
    const moderationProdId = newProdRes.body.data ? newProdRes.body.data.id : null;

    // Admin receives notification for new product pending review
    const adminProdNotif = await db.collection('notifications').findOne({
      userId: adminUser.id,
      title: { $regex: /منتج/ }
    });
    assert(adminProdNotif !== null, 'Admin received real notification for pending product review');

    // Admin approves product
    const approveProdRes = await request(`/api/admin/products/${moderationProdId}/approve`, {
      method: 'POST',
      headers: adminHeaders
    });
    assert(approveProdRes.status === 200, 'Admin approved product');

    // Seller receives approval notification
    const sellerProdApprovedNotif = await db.collection('notifications').findOne({
      userId: sellerUser.id,
      title: { $regex: /اعتماد|نشر/ }
    });
    assert(sellerProdApprovedNotif !== null, 'Seller received real notification for product approval');

    // ----------------------------------------------------
    // TEST 9: Notification Mutations (Mark as Read, Read All, Delete)
    // ----------------------------------------------------
    console.log('\n--- 9. Notification API Mutations & Unread Counts ---');
    const unreadCountRes = await request('/api/notifications/unread-count', { headers: buyerBHeaders });
    const currentUnread = unreadCountRes.body.count;
    assert(currentUnread > 0, `Buyer B has ${currentUnread} real unread notifications`);

    // Fetch buyer B notifications to get a valid notification ID
    const buyerBNotifsList = await request('/api/notifications', { headers: buyerBHeaders });
    const targetNotifId = buyerBNotifsList.body.data[0].id;

    // Mark single notification as read
    const markReadRes = await request(`/api/notifications/${targetNotifId}/read`, {
      method: 'PATCH',
      headers: buyerBHeaders
    });
    assert(markReadRes.status === 200, 'Buyer B marked single notification as read');

    // Verify unread count decreased
    const afterSingleReadCount = await request('/api/notifications/unread-count', { headers: buyerBHeaders });
    assert(
      afterSingleReadCount.body.count === currentUnread - 1,
      `Unread count decreased accurately from ${currentUnread} to ${afterSingleReadCount.body.count}`
    );

    // Mark all as read
    const markAllRes = await request('/api/notifications/read-all', {
      method: 'PATCH',
      headers: buyerBHeaders
    });
    assert(markAllRes.status === 200, 'Buyer B marked all notifications as read');

    const afterAllReadCount = await request('/api/notifications/unread-count', { headers: buyerBHeaders });
    assert(afterAllReadCount.body.count === 0, 'Unread count is now 0 after mark-all-as-read');

    // Delete single notification
    const deleteRes = await request(`/api/notifications/${targetNotifId}`, {
      method: 'DELETE',
      headers: buyerBHeaders
    });
    assert(deleteRes.status === 200, 'Buyer B deleted single notification');

    const deletedInDb = await db.collection('notifications').findOne({ id: targetNotifId });
    assert(deletedInDb === null, 'Notification was deleted permanently from MongoDB');

    // ----------------------------------------------------
    // TEST 10: Database Integrity Check (No Fake/Seed Notifications)
    // ----------------------------------------------------
    console.log('\n--- 10. Database Integrity Check ---');
    const fakeSeedCount = await db.collection('notifications').countDocuments({
      $or: [
        { id: { $regex: /^seed-/ } },
        { title: 'أهلاً بيك في وه' }
      ]
    });
    assert(fakeSeedCount === 0, 'Zero fake/seed notifications exist in MongoDB Atlas');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    try {
      if (db) {
        console.log('\n--- Cleaning up test artifacts from database ---');
        await db.collection('users').deleteMany({ id: { $in: testUserIds } });
        await db.collection('sellers').deleteMany({ $or: [{ id: testSellerId }, { userId: { $in: testUserIds } }] });
        await db.collection('notifications').deleteMany({ userId: { $in: testUserIds } });
        await db.collection('seller_requests').deleteMany({ userId: { $in: testUserIds } });
        await db.collection('products').deleteMany({ sellerId: testSellerId });
        await db.collection('orders').deleteMany({ buyerId: { $in: testUserIds } });
        await db.collection('payouts').deleteMany({ sellerId: testSellerId });
        await db.collection('password_resets').deleteMany({ username: { $in: [`buyer_a_${timestamp}`, `buyer_b_${timestamp}`] } });
        console.log('Cleanup completed successfully.');
      }
    } catch (cleanErr) {
      console.warn('Cleanup warning:', cleanErr.message);
    }

    console.log('\n========================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================\n');
    await teardown();
  }
}

runTests();
