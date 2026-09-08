// Automated End-to-End Verification Test for Seller Registration & Approval Workflow
// Tests Scenarios A through F against the live server at http://localhost:3000

const BASE_URL = 'http://localhost:3000';

async function request(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, ok: res.ok, headers: res.headers, data: json };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('========================================================');
  console.log('🚀 STARTING QA AUDIT & E2E VERIFICATION TEST');
  console.log('========================================================\n');

  const timestamp = Date.now();

  // ----------------------------------------------------
  // SCENARIO A: Normal User Registration & Restrictions
  // ----------------------------------------------------
  console.log('--- [Scenario A: Normal User] ---');
  const buyerUsername = `buyer_${timestamp}`;
  const buyerPassword = 'Password123!';
  const regBuyerRes = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: buyerUsername,
      name: 'أحمد محمود القناوي',
      phone: '01012345678',
      password: buyerPassword,
      role: 'buyer',
      governorate: 'قنا'
    })
  });
  assert(regBuyerRes.status === 201, `Buyer registered successfully (Status: ${regBuyerRes.status})`);
  const buyerToken = regBuyerRes.data.data.token;
  const buyerUser = regBuyerRes.data.data.user;
  assert(buyerUser.role === 'buyer', `User role is 'buyer' (Actual: ${buyerUser.role})`);
  assert(!buyerUser.sellerStatus || buyerUser.sellerStatus === 'none', `Buyer sellerStatus is empty/none (Actual: ${buyerUser.sellerStatus})`);

  // Check /api/auth/me for normal buyer
  const buyerMeRes = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${buyerToken}` }
  });
  assert(buyerMeRes.status === 200, `Buyer /api/auth/me returns 200`);
  assert(buyerMeRes.data.data.role === 'buyer', `Buyer /me role is 'buyer'`);
  assert(buyerMeRes.data.data.sellerStatus === undefined, `Buyer /me sellerStatus is undefined (not default pending)`);

  // Verify that normal buyer cannot create products
  const buyerCreateProductRes = await request('/api/seller/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({
      title: 'محاولة إضافة منتج غير مصرح',
      price: 200,
      categoryId: 'cat-pottery'
    })
  });
  assert(buyerCreateProductRes.status === 403, `Normal buyer product creation is blocked with 403 (Actual: ${buyerCreateProductRes.status})`);
  assert(buyerCreateProductRes.data.code === 'FORBIDDEN_SELLER_ONLY', `Error code is FORBIDDEN_SELLER_ONLY (Actual: ${buyerCreateProductRes.data.code})`);

  // ----------------------------------------------------
  // SCENARIO B: Seller Application (Pending State)
  // ----------------------------------------------------
  console.log('\n--- [Scenario B: Seller Application] ---');
  const applyRes = await request('/api/seller/apply', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({
      workshopName: `ورشة خزف النيل التراثية ${timestamp}`,
      specialty: 'فخار وخزف قناوي أصيل',
      governorate: 'قنا',
      phone: '01012345678',
      bio: 'صناعة الفخار والقناوي التراثي الأصيل باستخدام طمي النيل.',
      story: 'توارثنا هذه الصنعة منذ أربعة أجيال على ضفاف النيل.',
      payoutMethod: 'vodafone_cash',
      payoutAccount: '01012345678'
    })
  });
  assert(applyRes.status === 201, `Seller application submitted with 201 (Actual: ${applyRes.status})`);
  const applicationData = applyRes.data.data;
  assert(applicationData.status === 'pending', `Application status in DB is 'pending' (Actual: ${applicationData.status})`);
  const sellerId = applicationData.id;

  // Verify status via GET /api/seller/status
  const statusCheckRes = await request('/api/seller/status', {
    headers: { Authorization: `Bearer ${buyerToken}` }
  });
  assert(statusCheckRes.status === 200, `GET /api/seller/status accessible to pending applicant (Status: 200)`);
  assert(statusCheckRes.data.data.status === 'pending', `GET /api/seller/status returns pending status`);
  assert(statusCheckRes.data.data.brandName.includes('ورشة خزف النيل'), `GET /api/seller/status returns workshop name`);

  // Verify /api/auth/me now reflects pending status but user role is still 'buyer'
  const buyerMeAfterApply = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${buyerToken}` }
  });
  assert(buyerMeAfterApply.data.data.role === 'buyer', `User role remains 'buyer' while pending (Actual: ${buyerMeAfterApply.data.data.role})`);
  assert(buyerMeAfterApply.data.data.sellerStatus === 'pending', `sellerStatus is 'pending' (Actual: ${buyerMeAfterApply.data.data.sellerStatus})`);
  assert(buyerMeAfterApply.data.data.seller !== null, `Seller details populated for pending applicant`);

  // Verify that pending seller CANNOT create products
  const pendingCreateProductRes = await request('/api/seller/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({
      title: 'منتج قيد المراجعة مرفوض',
      price: 150,
      categoryId: 'cat-pottery'
    })
  });
  assert(pendingCreateProductRes.status === 403, `Pending seller blocked from creating products (Status: 403)`);
  assert(pendingCreateProductRes.data.code === 'SELLER_PENDING_APPROVAL', `Error code is SELLER_PENDING_APPROVAL (Actual: ${pendingCreateProductRes.data.code})`);

  // ----------------------------------------------------
  // SCENARIO C: Admin Review of Applications
  // ----------------------------------------------------
  console.log('\n--- [Scenario C: Admin Review] ---');
  // Obtain admin authentication token for the verified admin in database
  const { getDatabase } = await import('../server/db/mongodb.ts');
  const { generateToken } = await import('../server/services/authService.ts');
  const { db } = await getDatabase();
  const adminDoc = await db.collection('users').findOne({ role: 'admin' });
  assert(Boolean(adminDoc), `Verified admin user exists in MongoDB Atlas (${adminDoc?.username})`);
  const adminToken = generateToken(adminDoc);
  assert(Boolean(adminToken), `Valid admin JWT token generated`);

  // Query pending sellers in admin endpoint
  const adminSellersRes = await request('/api/admin/sellers?status=pending', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(adminSellersRes.status === 200, `Admin can list sellers (Status: 200)`);
  const pendingSellers = adminSellersRes.data.data || [];
  const foundApplication = pendingSellers.find((s) => s.id === sellerId);
  assert(Boolean(foundApplication), `Application ${sellerId} found in Admin Dashboard pending queue`);
  assert(foundApplication.status === 'pending', `Application status verified as 'pending' in Admin Dashboard`);

  // ----------------------------------------------------
  // SCENARIO D: Admin Approves Application
  // ----------------------------------------------------
  console.log('\n--- [Scenario D: Admin Approves Seller] ---');
  const approveRes = await request(`/api/admin/sellers/${sellerId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'approved'
    })
  });
  assert(approveRes.status === 200, `Admin approved seller with 200 (Actual: ${approveRes.status})`);
  assert(approveRes.data.data.status === 'approved', `Seller status updated to 'approved' in DB`);
  assert(approveRes.data.data.verified === true, `Seller verified flag is true`);

  // Verify approved seller /api/auth/me
  const sellerMeRes = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${buyerToken}` }
  });
  assert(sellerMeRes.status === 200, `Seller /api/auth/me returned 200`);
  assert(sellerMeRes.data.data.role === 'seller', `User role elevated to 'seller' in DB upon approval (Actual: ${sellerMeRes.data.data.role})`);
  assert(sellerMeRes.data.data.sellerStatus === 'approved', `User sellerStatus is 'approved' (Actual: ${sellerMeRes.data.data.sellerStatus})`);

  // ----------------------------------------------------
  // SCENARIO E: Product Creation by Approved Seller
  // ----------------------------------------------------
  console.log('\n--- [Scenario E: Product Creation by Approved Seller] ---');
  const createProductRes = await request('/api/seller/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({
      title: `قُلة قناوية منقوشة ${timestamp}`,
      price: 180,
      categoryId: 'cat-pottery',
      categoryName: 'الفخار والخزف',
      description: 'قلة قناوية يدوية فخارية تقليدية تبرد الماء طبيعياً ومزينة بنقوش صعيدية أصيلة.',
      images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'],
      stockCount: 15
    })
  });
  assert(createProductRes.status === 200 || createProductRes.status === 201, `Product created by approved seller (Status: ${createProductRes.status})`);
  const createdProduct = createProductRes.data.data;
  assert(createdProduct.sellerId === sellerId, `Product stored with correct sellerId (${createdProduct.sellerId} === ${sellerId})`);
  assert(createdProduct.approvalStatus === 'pending', `Product starts with approvalStatus: 'pending' (Actual: ${createdProduct.approvalStatus})`);
  const productId = createdProduct.id;

  // Verify product is NOT visible in public marketplace yet
  const publicListRes = await request('/api/products');
  const inPublic = (publicListRes.data.data || []).some((p) => p.id === productId);
  assert(!inPublic, `Unapproved product is NOT visible in public products list`);

  // Admin reviews and approves the product
  const approveProductRes = await request(`/api/admin/products/${productId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(approveProductRes.status === 200, `Admin approved product (Status: 200)`);
  assert(approveProductRes.data.data.approvalStatus === 'approved', `Product approvalStatus updated to 'approved'`);

  // Verify product is NOW visible publicly
  const publicListAfterApprove = await request('/api/products');
  const inPublicAfter = (publicListAfterApprove.data.data || []).some((p) => p.id === productId);
  assert(inPublicAfter, `Approved product is NOW visible in public products list!`);

  // ----------------------------------------------------
  // SCENARIO F: Second Seller Application & Admin Rejection
  // ----------------------------------------------------
  console.log('\n--- [Scenario F: Reject Seller Application] ---');
  const rejectedUsername = `rejected_user_${timestamp}`;
  const regUser2Res = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: rejectedUsername,
      name: 'محمود عبد السلام',
      phone: '01198765432',
      password: 'Password123!',
      role: 'buyer',
      governorate: 'أسيوط'
    })
  });
  assert(regUser2Res.status === 201, `Second user registered`);
  const user2Token = regUser2Res.data.data.token;

  // Apply as seller
  const apply2Res = await request('/api/seller/apply', {
    method: 'POST',
    headers: { Authorization: `Bearer ${user2Token}` },
    body: JSON.stringify({
      workshopName: `ورشة مشغولات عصرية غير تراثية ${timestamp}`,
      specialty: 'منتجات بلاستيكية مستوردة',
      governorate: 'أسيوط',
      phone: '01198765432'
    })
  });
  assert(apply2Res.status === 201, `Second seller application submitted`);
  const seller2Id = apply2Res.data.data.id;

  // Admin rejects the application with reason
  const rejectionReasonText = 'عفواً، المنتجات المقدمة بلاستيكية ولا تنتمي للحرف التراثية اليدوية لصعيد مصر';
  const rejectRes = await request(`/api/admin/sellers/${seller2Id}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'rejected',
      reason: rejectionReasonText
    })
  });
  assert(rejectRes.status === 200, `Admin rejected application (Status: 200)`);
  assert(rejectRes.data.data.status === 'rejected', `Application status is 'rejected'`);
  assert(rejectRes.data.data.rejectionReason === rejectionReasonText, `Rejection reason stored correctly`);

  // Check second user /api/auth/me
  const user2MeRes = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${user2Token}` }
  });
  assert(user2MeRes.data.data.role === 'buyer', `Rejected user role remains 'buyer' (Actual: ${user2MeRes.data.data.role})`);
  assert(user2MeRes.data.data.sellerStatus === 'rejected', `Rejected user sellerStatus is 'rejected'`);
  assert(user2MeRes.data.data.seller.rejectionReason === rejectionReasonText, `Rejection reason returned to user`);

  // Verify rejected user CANNOT access seller product creation
  const rejectedProductCreateRes = await request('/api/seller/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${user2Token}` },
    body: JSON.stringify({
      title: 'منتج من بائع مرفوض',
      price: 100,
      categoryId: 'cat-pottery'
    })
  });
  assert(rejectedProductCreateRes.status === 403, `Rejected seller blocked with 403 (Actual: ${rejectedProductCreateRes.status})`);
  assert(rejectedProductCreateRes.data.code === 'SELLER_REJECTED', `Error code is SELLER_REJECTED (Actual: ${rejectedProductCreateRes.data.code})`);

  console.log('\n========================================================');
  console.log('✅ ALL QA AUDIT SCENARIOS (A THROUGH F) PASSED WITH 100% SUCCESS!');
  console.log('========================================================');
}

runTests().catch((err) => {
  console.error('\n❌ QA TEST RUN FAILED:', err);
  process.exit(1);
});
