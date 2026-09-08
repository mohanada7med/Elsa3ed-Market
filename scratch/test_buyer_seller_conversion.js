import fetch from 'node-fetch';
import assert from 'assert';
import dotenv from 'dotenv';
import { getDatabase } from '../server/db/mongodb.ts';
import { generateToken } from '../server/services/authService.ts';

dotenv.config();

const BASE_URL = 'http://localhost:3000';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  let data = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data, headers: res.headers };
}

async function runTests() {
  console.log('========================================================');
  console.log('🚀 TESTING BUYER → SELLER CONVERSION & APPROVAL WORKFLOW');
  console.log('========================================================\n');

  const ts = Date.now();

  // Connect to DB and locate Admin
  const { db, isMongo } = await getDatabase();
  assert(isMongo && db, 'Connected to MongoDB Atlas');
  console.log('✓ Connected to MongoDB Atlas');

  const adminDoc = await db.collection('users').findOne({ role: 'admin' });
  assert(adminDoc, 'Admin user exists in MongoDB');
  const adminToken = generateToken(adminDoc);
  console.log(`✓ Admin JWT token generated for (${adminDoc.name || adminDoc.username})`);

  // Clear previous notifications for clean assertions
  await db.collection('notifications').deleteMany({ userId: adminDoc.id });

  // ----------------------------------------------------------------
  // 1. Existing Buyer Registration
  // ----------------------------------------------------------------
  console.log('\n--- [Step 1: Normal Buyer Registration] ---');
  const buyerUsername = `buyer_test_${ts}`;
  const buyerRes = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: buyerUsername,
      name: 'أحمد الصعيدي الحرفي',
      phone: '01011223344',
      password: 'Password123!',
      role: 'buyer',
      governorate: 'قنا'
    })
  });
  assert(buyerRes.status === 201, `Buyer registration returned 201 (Actual: ${buyerRes.status})`);
  const buyerToken = buyerRes.data.data.token;
  const buyerId = buyerRes.data.data.user.id;

  const buyerMeRes = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${buyerToken}` }
  });
  assert(buyerMeRes.data.data.role === 'buyer', `User role is 'buyer'`);
  assert(!buyerMeRes.data.data.sellerStatus, `User sellerStatus is undefined`);
  console.log('✓ Buyer registered and verified as role: buyer');

  // Check initial /api/seller-requests/status
  const initialStatusRes = await request('/api/seller-requests/status', {
    headers: { Authorization: `Bearer ${buyerToken}` }
  });
  assert(initialStatusRes.status === 200, 'Status check returned 200');
  assert(initialStatusRes.data.sellerStatus === 'none', 'Initial seller request status is none');
  console.log('✓ Initial seller request status correctly reports none');

  // Verify buyer cannot access seller features
  const buyerProductAttempt = await request('/api/seller/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({ title: 'منتج غير مصرح', price: 100 })
  });
  assert(buyerProductAttempt.status === 403, 'Buyer forbidden from creating products (403)');
  assert(buyerProductAttempt.data.code === 'FORBIDDEN_SELLER_ONLY', 'Code is FORBIDDEN_SELLER_ONLY');
  console.log('✓ Normal buyer strictly blocked from seller endpoints (403 FORBIDDEN_SELLER_ONLY)');

  // ----------------------------------------------------------------
  // 2. Buyer submits "Become a Seller" application
  // ----------------------------------------------------------------
  console.log('\n--- [Step 2: Buyer submits "Become a Seller" Request] ---');
  const applyRes = await request('/api/seller-requests', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({
      workshopName: `ورشة خزف وفخار قنا الأصيلة ${ts}`,
      specialty: 'فخار وخزف نيلي',
      governorate: 'قنا',
      phone: '01011223344',
      bio: 'ورشة أجدادنا في صناعة القلل والأواني الخزفية التراثية',
      story: 'بدأت ورشتنا منذ أكثر من خمسين عاماً على ضفاف النيل'
    })
  });
  assert(applyRes.status === 201, `Application submitted with 201 (Actual: ${applyRes.status})`);
  const requestId = applyRes.data.data.id;
  assert(requestId, 'Request ID returned');
  assert(applyRes.data.data.status === 'pending', 'Request status is pending');
  console.log(`✓ Application submitted (ID: ${requestId}, status: pending)`);

  // Verify user role remains buyer and status is pending
  const buyerMeAfterApply = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${buyerToken}` }
  });
  assert(buyerMeAfterApply.data.data.role === 'buyer', `User role strictly remains 'buyer' (Actual: ${buyerMeAfterApply.data.data.role})`);
  assert(buyerMeAfterApply.data.data.sellerStatus === 'pending', `User sellerStatus is 'pending'`);
  console.log('✓ User role strictly remains "buyer", sellerStatus is "pending"');

  // Verify Admin received persistent notification in database
  const adminNotifsRes = await request('/api/auth/notifications', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const hasAdminNotif = (adminNotifsRes.data.data || []).some(
    (n) => n.title.includes('طلب اعتماد') && n.message.includes(buyerRes.data.data.user.name)
  );
  assert(hasAdminNotif, 'Admin received persistent notification in database');
  console.log('✓ Persistent notification created in database for Administrators');

  // ----------------------------------------------------------------
  // 3. Duplicate Request Prevention
  // ----------------------------------------------------------------
  console.log('\n--- [Step 3: Duplicate Request Prevention] ---');
  const duplicateRes = await request('/api/seller-requests', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({
      workshopName: 'ورشة مكررة',
      phone: '01011223344'
    })
  });
  assert(duplicateRes.status === 400, `Duplicate submission rejected with 400 (Actual: ${duplicateRes.status})`);
  assert(duplicateRes.data.code === 'ALREADY_PENDING', `Code is ALREADY_PENDING (Actual: ${duplicateRes.data.code})`);
  console.log('✓ Duplicate pending request successfully prevented (400 ALREADY_PENDING)');

  // ----------------------------------------------------------------
  // 4. Pending Seller Blocked from Seller Actions
  // ----------------------------------------------------------------
  console.log('\n--- [Step 4: Pending Seller Permissions Check] ---');
  const pendingProductAttempt = await request('/api/seller/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({ title: 'منتج قيد المراجعة', price: 200 })
  });
  assert(pendingProductAttempt.status === 403, 'Pending seller forbidden from creating products (403)');
  assert(pendingProductAttempt.data.code === 'SELLER_PENDING_APPROVAL', 'Code is SELLER_PENDING_APPROVAL');
  console.log('✓ Pending seller blocked from protected actions (403 SELLER_PENDING_APPROVAL)');

  // ----------------------------------------------------------------
  // 5. Admin Listing & Details
  // ----------------------------------------------------------------
  console.log('\n--- [Step 5: Admin Lists & Views Requests] ---');
  const adminListRes = await request('/api/admin/seller-requests?status=pending', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(adminListRes.status === 200, 'Admin list seller requests returned 200');
  const foundRequest = (adminListRes.data.data || []).find((r) => r.id === requestId);
  assert(foundRequest, 'Submitted request found in Admin list');
  assert(foundRequest.userName === 'أحمد الصعيدي الحرفي', 'User name present in request');
  assert(foundRequest.userId === buyerId, 'User ID present in request');
  assert(foundRequest.requestDate, 'Request date present in request');
  console.log('✓ Request listed with user name, user ID, workshop name, request date, and status');

  const adminDetailRes = await request(`/api/admin/seller-requests/${requestId}`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(adminDetailRes.status === 200, 'Admin details returned 200');
  assert(adminDetailRes.data.data.brandName.includes('ورشة خزف وفخار'), 'Workshop details verified');
  console.log('✓ Admin view details endpoint returns full seller request details');

  // ----------------------------------------------------------------
  // 6. Admin Rejection Scenario
  // ----------------------------------------------------------------
  console.log('\n--- [Step 6: Admin Rejection Workflow] ---');
  const rejectionReason = 'الصور غير واضحة ونحتاج لتوضيح موقع المشغل الحرفي بدقة في قنا';
  const rejectRes = await request(`/api/admin/seller-requests/${requestId}/reject`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ reason: rejectionReason })
  });
  assert(rejectRes.status === 200, `Admin rejection returned 200 (Actual: ${rejectRes.status})`);
  assert(rejectRes.data.data.status === 'rejected', 'Status updated to rejected');
  assert(rejectRes.data.data.rejectionReason === rejectionReason, 'Rejection reason saved');
  console.log('✓ Admin successfully rejected request with reason');

  // Verify user state after rejection
  const buyerMeAfterReject = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${buyerToken}` }
  });
  assert(buyerMeAfterReject.data.data.role === 'buyer', `User role strictly remains 'buyer' (Actual: ${buyerMeAfterReject.data.data.role})`);
  assert(buyerMeAfterReject.data.data.sellerStatus === 'rejected', 'User sellerStatus is rejected');
  console.log('✓ User role remains "buyer", sellerStatus is "rejected"');

  // Verify User received persistent rejection notification in database
  const userNotifsRes1 = await request('/api/auth/notifications', {
    headers: { Authorization: `Bearer ${buyerToken}` }
  });
  console.log(`User notifications count: ${(userNotifsRes1.data.data || []).length}`);
  const hasRejectionNotif = (userNotifsRes1.data.data || []).some(
    (n) => n.message.includes('رفض') && n.message.includes('الصور غير واضحة')
  );
  assert(hasRejectionNotif, `User received persistent rejection notification in database: ${JSON.stringify(userNotifsRes1.data.data)}`);
  console.log('✓ Persistent rejection notification delivered to user');

  // Verify rejected user is blocked from seller actions
  const rejectedProductAttempt = await request('/api/seller/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({ title: 'منتج بعد الرفض', price: 200 })
  });
  assert(rejectedProductAttempt.status === 403, 'Rejected user forbidden (403)');
  assert(rejectedProductAttempt.data.code === 'SELLER_REJECTED', 'Code is SELLER_REJECTED');
  console.log('✓ Rejected user blocked from seller actions (403 SELLER_REJECTED)');

  // ----------------------------------------------------------------
  // 7. Buyer Re-application after Rejection
  // ----------------------------------------------------------------
  console.log('\n--- [Step 7: Buyer Re-submits Application] ---');
  const reapplyRes = await request('/api/seller-requests', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({
      workshopName: `ورشة خزف وفخار قنا الأصيلة المُحدثة ${ts}`,
      specialty: 'فخار وخزف نيلي يدوي',
      governorate: 'قنا',
      phone: '01011223344',
      bio: 'تم تحديث البيانات وإرفاق العنوان الدقيق بقرية المحروسة في قنا'
    })
  });
  assert(reapplyRes.status === 200 || reapplyRes.status === 201, `Re-application succeeded (Actual: ${reapplyRes.status})`);
  assert(reapplyRes.data.data.status === 'pending', 'Status reset to pending');
  assert(!reapplyRes.data.data.rejectionReason, 'Rejection reason cleared on re-apply');
  console.log('✓ Buyer allowed to re-apply after rejection, status reset to "pending"');

  // ----------------------------------------------------------------
  // 8. Admin Approval Workflow
  // ----------------------------------------------------------------
  console.log('\n--- [Step 8: Admin Approval Workflow] ---');
  const approveRes = await request(`/api/admin/seller-requests/${requestId}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(approveRes.status === 200, `Admin approval returned 200 (Actual: ${approveRes.status})`);
  assert(approveRes.data.data.status === 'approved', 'Status updated to approved');
  assert(approveRes.data.data.verified === true, 'Seller verified flag is true');
  console.log('✓ Admin approved seller application');

  // Verify user role elevated to seller in database & session
  const sellerMeAfterApprove = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${buyerToken}` }
  });
  assert(sellerMeAfterApprove.data.data.role === 'seller', `User role ELEVATED to 'seller' (Actual: ${sellerMeAfterApprove.data.data.role})`);
  assert(sellerMeAfterApprove.data.data.sellerStatus === 'approved', 'User sellerStatus is approved');
  console.log('✓ User role ELEVATED to "seller", sellerStatus is "approved"');

  // Verify User received persistent approval notification in database
  const userNotifsRes2 = await request('/api/auth/notifications', {
    headers: { Authorization: `Bearer ${buyerToken}` }
  });
  const hasApprovalNotif = (userNotifsRes2.data.data || []).some(
    (n) => n.title.includes('تهانينا') && n.title.includes('اعتماد')
  );
  assert(hasApprovalNotif, 'User received persistent approval notification in database');
  console.log('✓ Persistent approval notification delivered to user');

  // ----------------------------------------------------------------
  // 9. Approved Seller Permissions & Product Creation
  // ----------------------------------------------------------------
  console.log('\n--- [Step 9: Approved Seller Product Creation] ---');
  const createProductRes = await request('/api/seller/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({
      title: `طاجن فخار صعيدي يدوي أصيل ${ts}`,
      description: 'طاجن من طمي النيل الأصيل مصنوع على الدولاب اليدوي ومحروق في الفرن البلدي',
      price: 250,
      stock: 15,
      categoryId: 'cat-pottery',
      categoryName: 'فخار وخزف',
      governorate: 'قنا',
      images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80']
    })
  });
  assert(createProductRes.status === 201, `Product created with 201 (Actual: ${createProductRes.status}, Error: ${JSON.stringify(createProductRes.data)})`);
  assert(createProductRes.data.data.approvalStatus === 'pending', 'New product starts as pending moderation');
  console.log('✓ Approved seller can now create products (201 Created)');

  // ----------------------------------------------------------------
  // 10. Scenario 2: Direct Seller Registration
  // ----------------------------------------------------------------
  console.log('\n--- [Step 10: Scenario 2 - Direct Seller Registration] ---');
  const directSellerUsername = `direct_seller_${ts}`;
  const directSellerRes = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: directSellerUsername,
      name: 'عمر النجار الإخميمي',
      phone: '01233445566',
      password: 'Password123!',
      role: 'seller',
      workshopName: `مشغل نول إخميم ${ts}`,
      specialty: 'نسيج وكليم يدوي',
      governorate: 'سوهاج'
    })
  });
  assert(directSellerRes.status === 201, `Direct seller registered with 201 (Actual: ${directSellerRes.status})`);
  const directToken = directSellerRes.data.data.token;

  // Verify direct seller starts with role 'buyer' and status 'pending' until Admin approval
  const directMeRes = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${directToken}` }
  });
  assert(directMeRes.data.data.role === 'buyer', `Direct seller role remains 'buyer' until approval (Actual: ${directMeRes.data.data.role})`);
  assert(directMeRes.data.data.sellerStatus === 'pending', 'Direct seller status is pending');
  console.log('✓ Direct seller registration creates pending status and preserves buyer role until approval');

  // Verify direct seller blocked from adding products while pending
  const directProductAttempt = await request('/api/seller/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${directToken}` },
    body: JSON.stringify({ title: 'كليم غير معتمد', price: 500 })
  });
  assert(directProductAttempt.status === 403, 'Direct seller blocked with 403 while pending');
  assert(directProductAttempt.data.code === 'SELLER_PENDING_APPROVAL', 'Code is SELLER_PENDING_APPROVAL');
  console.log('✓ Direct registered seller blocked from seller actions until Admin approval');

  // ----------------------------------------------------------------
  // 11. Security Checks: Unauthorized Approval Attempts
  // ----------------------------------------------------------------
  console.log('\n--- [Step 11: Security Checks - Unauthorized Attempts] ---');
  const unauthAttempt = await request(`/api/admin/seller-requests/${requestId}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${directToken}` } // non-admin token
  });
  assert(unauthAttempt.status === 403, `Non-admin approval attempt blocked with 403 (Actual: ${unauthAttempt.status})`);
  console.log('✓ Non-admin cannot approve seller requests (403 Forbidden)');

  const guestAttempt = await request(`/api/admin/seller-requests/${requestId}/approve`, {
    method: 'PATCH' // no token
  });
  assert(guestAttempt.status === 401 || guestAttempt.status === 403, `Guest approval attempt blocked (Actual: ${guestAttempt.status})`);
  console.log('✓ Unauthenticated request blocked (401/403)');

  console.log('\n========================================================');
  console.log('🎉 ALL BUYER → SELLER CONVERSION & APPROVAL TESTS PASSED (100%)!');
  console.log('========================================================');
}

runTests().catch((err) => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
