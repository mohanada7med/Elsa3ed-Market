import dotenv from 'dotenv';
dotenv.config();
import { createApp } from '../server/app.ts';
import { generateToken, TOKEN_EXPIRATION_MS } from '../server/services/authService.ts';
import { getDatabase, memoryDb } from '../server/db/mongodb.ts';
import http from 'http';
import crypto from 'crypto';

let server: http.Server;
let baseUrl = '';

function request(path: string, options: {
  method?: string;
  token?: string;
  body?: any;
  headers?: Record<string, string>;
} = {}): Promise<{ status: number; body: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + path);
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (options.token) {
      reqHeaders['Authorization'] = `Bearer ${options.token}`;
      reqHeaders['Cookie'] = `saeed_auth_token=${options.token}`;
    }

    const req = http.request(url, {
      method: options.method || 'GET',
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch { }
        resolve({ status: res.statusCode || 500, body: parsed, headers: res.headers });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passedCount++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedCount++;
    console.error(`  ❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ''}`);
  }
}

async function runFullRouteAudit() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING DEEP PRODUCTION ROUTE & SECURITY AUDIT');
  console.log('======================================================\n');

  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address() as any;
      baseUrl = `http://127.0.0.1:${addr.port}`;
      console.log(`Test Express server running at: ${baseUrl}\n`);
      resolve();
    });
  });

  const { db, isMongo } = await getDatabase();

  // 1. Prepare Test Users & Roles
  const buyer1 = {
    id: 'test-buyer-1',
    username: 'buyer_one',
    email: 'buyer1@test.com',
    name: 'المشتري الأول',
    role: 'buyer' as const
  };
  const buyer2 = {
    id: 'test-buyer-2',
    username: 'buyer_two',
    email: 'buyer2@test.com',
    name: 'المشتري الثاني',
    role: 'buyer' as const
  };
  const seller1 = {
    id: 'test-seller-1',
    sellerId: 'test-seller-1',
    username: 'seller_one',
    email: 'seller1@test.com',
    name: 'الورشة الأولى',
    role: 'seller' as const,
    sellerStatus: 'approved' as const
  };
  const seller2 = {
    id: 'test-seller-2',
    sellerId: 'test-seller-2',
    username: 'seller_two',
    email: 'seller2@test.com',
    name: 'الورشة الثانية',
    role: 'seller' as const,
    sellerStatus: 'approved' as const
  };
  const admin = {
    id: 'test-admin-1',
    username: 'super_admin',
    email: 'admin@test.com',
    name: 'مدير المنصة',
    role: 'admin' as const
  };

  // Seed into database / memoryDb
  for (const u of [buyer1, buyer2, seller1, seller2, admin]) {
    const fullUser = {
      ...u,
      usernameNormalized: u.username.toLowerCase(),
      updatedAt: new Date().toISOString()
    };
    if (!memoryDb.users.some(x => x.id === u.id)) {
      memoryDb.users.push(fullUser as any);
    }
    if (isMongo && db) {
      await db.collection('users').updateOne(
        { id: u.id },
        { $set: fullUser },
        { upsert: true }
      );
    }
  }

  // Seed sellers collection
  for (const s of [seller1, seller2]) {
    const sDoc = {
      id: s.sellerId,
      userId: s.id,
      name: s.name,
      brandName: s.name,
      governorate: 'قنا',
      status: 'approved',
      verified: true,
      phone: '01000000001',
      email: s.email
    };
    if (!memoryDb.sellers.some(x => x.id === s.sellerId)) {
      memoryDb.sellers.push(sDoc as any);
    }
    if (isMongo && db) {
      await db.collection('sellers').updateOne(
        { id: s.sellerId },
        { $set: sDoc },
        { upsert: true }
      );
    }
  }

  // Seed sample products
  const product1 = {
    id: 'prod-audit-1',
    title: 'قلة قناوية فخار أصيل',
    categoryId: 'cat-pottery',
    categoryName: 'الفخار والخزف',
    sellerId: seller1.sellerId,
    sellerName: seller1.name,
    price: 120,
    stockCount: 15,
    inStock: true,
    approvalStatus: 'approved' as const,
    images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61']
  };
  const product2 = {
    id: 'prod-audit-2',
    title: 'سجادة كليم يدوي أسيوطي',
    categoryId: 'cat-textiles',
    categoryName: 'النسيج والكليم',
    sellerId: seller2.sellerId,
    sellerName: seller2.name,
    price: 350,
    stockCount: 8,
    inStock: true,
    approvalStatus: 'approved' as const,
    images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61']
  };

  for (const p of [product1, product2]) {
    const memIdx = memoryDb.products.findIndex(x => x.id === p.id);
    if (memIdx >= 0) memoryDb.products[memIdx] = p as any;
    else memoryDb.products.push(p as any);
    if (isMongo && db) {
      await db.collection('products').updateOne(
        { id: p.id },
        { $set: p },
        { upsert: true }
      );
    }
  }

  // Generate cryptographic JWT tokens
  const buyer1Token = generateToken(buyer1 as any);
  const buyer2Token = generateToken(buyer2 as any);
  const seller1Token = generateToken(seller1 as any);
  const seller2Token = generateToken(seller2 as any);
  const adminToken = generateToken(admin as any);

  // ==========================================
  // DOMAIN 1: PUBLIC ENDPOINTS & SEO
  // ==========================================
  console.log('--- 1. Public Endpoints & SEO ---');

  const healthRes = await request('/api/health');
  assert(healthRes.status === 200, 'GET /api/health returns 200 OK');

  const productsRes = await request('/api/products');
  assert(productsRes.status === 200 && Array.isArray(productsRes.body?.data), 'GET /api/products returns 200 OK with product catalog');

  const categoriesRes = await request('/api/categories');
  assert(categoriesRes.status === 200 && Array.isArray(categoriesRes.body?.data), 'GET /api/categories returns 200 OK');

  const sellersRes = await request('/api/sellers');
  assert(sellersRes.status === 200 && Array.isArray(sellersRes.body?.data), 'GET /api/sellers returns 200 OK');

  const sitemapRes = await request('/sitemap.xml');
  assert(sitemapRes.status === 200 && typeof sitemapRes.body === 'string' && sitemapRes.body.includes('<urlset'), 'GET /sitemap.xml returns XML sitemap');

  const robotsRes = await request('/robots.txt');
  assert(robotsRes.status === 200 && typeof robotsRes.body === 'string' && robotsRes.body.includes('User-agent'), 'GET /robots.txt returns robots directives');

  // ==========================================
  // DOMAIN 2: AUTHENTICATION FAILURES & SECURITY
  // ==========================================
  console.log('\n--- 2. Authentication Failures & Token Security ---');

  const unauthCart = await request('/api/cart');
  assert(unauthCart.status === 401, 'Unauthenticated GET /api/cart returns 401 UNAUTHORIZED');

  // Tampered token check
  const tamperedToken = buyer1Token.slice(0, -5) + 'xxxxx';
  const tamperedRes = await request('/api/cart', { token: tamperedToken });
  assert(tamperedRes.status === 401, 'Tampered token signature is rejected with 401 UNAUTHORIZED');

  // Expired token check
  const expiredPayload = {
    sub: buyer1.id,
    role: 'buyer',
    iat: Date.now() - (40 * 24 * 60 * 60 * 1000),
    exp: Date.now() - (10 * 24 * 60 * 60 * 1000) // Expired 10 days ago
  };
  const expStr = Buffer.from(JSON.stringify(expiredPayload)).toString('base64');
  const jwtSecret = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'elsa3ed-secret-key-production-change-this';
  const expHmac = crypto.createHmac('sha256', jwtSecret).update(expStr).digest('hex');
  const expiredToken = `${expStr}.${expHmac}`;

  const expiredRes = await request('/api/cart', { token: expiredToken });
  assert(expiredRes.status === 401, 'Expired token is rejected with 401 UNAUTHORIZED');

  // Header spoofing privilege escalation check
  const spoofHeaderRes = await request('/api/admin/users', {
    headers: { 'x-user-id': 'user-admin-1', 'x-user-role': 'admin' }
  });
  assert(spoofHeaderRes.status === 401, 'Unauthenticated header spoof (x-user-id: user-admin-1) rejected with 401 UNAUTHORIZED');

  // ==========================================
  // DOMAIN 3: ROLE-BASED AUTHORIZATION MATRIX
  // ==========================================
  console.log('\n--- 3. Role-Based Authorization Matrix ---');

  // Buyer cannot access seller or admin endpoints
  const buyerSellerRes = await request('/api/seller/dashboard-stats', { token: buyer1Token });
  assert(buyerSellerRes.status === 403, 'Buyer accessing /api/seller/dashboard-stats rejected with 403 FORBIDDEN');

  const buyerAdminRes = await request('/api/admin/users', { token: buyer1Token });
  assert(buyerAdminRes.status === 403, 'Buyer accessing /api/admin/users rejected with 403 FORBIDDEN');

  // Seller cannot access buyer cart or admin endpoints
  const sellerCartRes = await request('/api/cart', { token: seller1Token });
  assert(sellerCartRes.status === 403, 'Seller accessing /api/cart rejected with 403 FORBIDDEN');

  const sellerOrderPost = await request('/api/orders', {
    method: 'POST',
    token: seller1Token,
    body: { shippingAddress: { fullName: 'Test' }, paymentMethod: 'cod' }
  });
  assert(sellerOrderPost.status === 403, 'Seller attempting order creation rejected with 403 FORBIDDEN');

  const sellerAdminRes = await request('/api/admin/users', { token: seller1Token });
  assert(sellerAdminRes.status === 403, 'Seller accessing /api/admin/users rejected with 403 FORBIDDEN');

  // Admin cannot access buyer shopping/cart
  const adminCartRes = await request('/api/cart', { token: adminToken });
  assert(adminCartRes.status === 403, 'Admin accessing /api/cart rejected with 403 FORBIDDEN');

  const adminCartPost = await request('/api/cart/items', {
    method: 'POST',
    token: adminToken,
    body: { productId: product1.id, quantity: 1 }
  });
  assert(adminCartPost.status === 403, 'Admin adding items to cart rejected with 403 FORBIDDEN');

  // Customer order endpoint (/api/orders) is restricted to Buyer
  const sellerGetOrders = await request('/api/orders', { token: seller1Token });
  assert(sellerGetOrders.status === 403, 'Seller accessing GET /api/orders rejected with 403 FORBIDDEN');

  const adminGetOrders = await request('/api/orders', { token: adminToken });
  assert(adminGetOrders.status === 403, 'Admin accessing GET /api/orders rejected with 403 FORBIDDEN');

  const buyerGetOrders = await request('/api/orders', { token: buyer1Token });
  assert(buyerGetOrders.status === 200 && Array.isArray(buyerGetOrders.body?.data), 'Buyer accessing GET /api/orders returns 200 OK with orders list');


  // ==========================================
  // DOMAIN 4: BUYER SHOPPING & CART FLOW
  // ==========================================
  console.log('\n--- 4. Buyer Shopping, Cart & Order Flow ---');

  // Clear Buyer 1 cart
  await request('/api/cart', { method: 'DELETE', token: buyer1Token });

  // Buyer 1 adds product1 to cart
  const addCartRes = await request('/api/cart/items', {
    method: 'POST',
    token: buyer1Token,
    body: { productId: product1.id, quantity: 2 }
  });
  assert(addCartRes.status === 200 && addCartRes.body?.data?.items?.length === 1, 'Buyer 1 adds 2 pieces of product1 to cart');

  // Update item quantity in cart
  const updateQtyRes = await request(`/api/cart/items/${product1.id}`, {
    method: 'PUT',
    token: buyer1Token,
    body: { quantity: 3 }
  });
  assert(updateQtyRes.status === 200 && updateQtyRes.body?.data?.items[0]?.quantity === 3, 'Buyer 1 updates quantity to 3 in cart');

  // Negative quantity rejected
  const negQtyRes = await request(`/api/cart/items/${product1.id}`, {
    method: 'PUT',
    token: buyer1Token,
    body: { quantity: -5 }
  });
  assert(negQtyRes.status === 400, 'Negative quantity rejected with 400 Bad Request');

  // Place order with Vodafone Cash and payment reference
  const orderRes = await request('/api/orders', {
    method: 'POST',
    token: buyer1Token,
    body: {
      shippingAddress: {
        fullName: 'أحمد محمود القناوي',
        phone: '01012345678',
        governorate: 'قنا',
        city: 'نجع حمادي',
        streetAddress: 'شارع المحطة عمارة 4'
      },
      paymentMethod: 'vodafone_cash',
      paymentReference: 'VOD-778899',
      notes: 'تغليف خاص هدية'
    }
  });

  const createdOrder = orderRes.body?.data;
  assert(
    orderRes.status === 201 &&
    (createdOrder?.paymentStatus === 'pending' || createdOrder?.paymentStatus === 'payment_pending_verification') &&
    createdOrder?.paymentReference === 'VOD-778899',
    'Buyer 1 places order: initial paymentStatus is recorded with paymentReference'
  );


  // ==========================================
  // DOMAIN 5: IDOR & RESOURCE OWNERSHIP PROTECTION
  // ==========================================
  console.log('\n--- 5. IDOR & Resource Ownership Protection ---');

  // Buyer 2 cannot view Buyer 1's order
  const idorOrderRes = await request(`/api/orders/${createdOrder.id}`, { token: buyer2Token });
  assert(idorOrderRes.status === 403 || idorOrderRes.status === 404, 'Buyer 2 viewing Buyer 1 order blocked by IDOR protection (403/404)');

  // Buyer 2 cannot cancel Buyer 1's order
  const idorCancelRes = await request(`/api/orders/${createdOrder.id}/cancel`, {
    method: 'POST',
    token: buyer2Token,
    body: { reason: 'malicious cancellation' }
  });
  assert(idorCancelRes.status === 400 || idorCancelRes.status === 403, 'Buyer 2 cancelling Buyer 1 order blocked by IDOR protection');

  // Seller 2 cannot edit Seller 1's product
  const idorProdEditRes = await request(`/api/seller/products/${product1.id}`, {
    method: 'PUT',
    token: seller2Token,
    body: { title: 'اسم معدل بشكل غير مصرح' }
  });
  assert(idorProdEditRes.status === 400 || idorProdEditRes.status === 403, 'Seller 2 editing Seller 1 product blocked by ownership check');

  // Seller 2 cannot modify Seller 1's inventory stock
  const idorStockRes = await request(`/api/seller/inventory/${product1.id}`, {
    method: 'PUT',
    token: seller2Token,
    body: { newStock: 999 }
  });
  assert(idorStockRes.status === 400 || idorStockRes.status === 403, 'Seller 2 updating Seller 1 stock blocked by ownership check');

  // Seller 2 cannot delete Seller 1's product
  const idorProdDelRes = await request(`/api/seller/products/${product1.id}`, {
    method: 'DELETE',
    token: seller2Token
  });
  assert(idorProdDelRes.status === 400 || idorProdDelRes.status === 403, 'Seller 2 deleting Seller 1 product blocked by ownership check');

  // ==========================================
  // DOMAIN 6: INPUT VALIDATION
  // ==========================================
  console.log('\n--- 6. Input Validation ---');

  // Order without shipping address rejected
  const missingAddressOrder = await request('/api/orders', {
    method: 'POST',
    token: buyer1Token,
    body: { paymentMethod: 'cod' }
  });
  assert(missingAddressOrder.status === 400, 'Order without shipping address rejected with 400 Bad Request');

  // Product with negative price rejected
  const negPriceProd = await request('/api/seller/products', {
    method: 'POST',
    token: seller1Token,
    body: {
      title: 'منتج غير صالح',
      price: -50,
      categoryId: 'cat-pottery',
      images: ['https://example.com/test.jpg']
    }
  });
  assert(negPriceProd.status === 400, 'Product with negative price rejected with 400 Bad Request');

  // ==========================================
  // DOMAIN 7: ADMIN CONTROL & PAYMENT VERIFICATION
  // ==========================================
  console.log('\n--- 7. Admin Operations & Payment Verification ---');

  // Buyer cannot mark order as paid
  const buyerMarkPaid = await request(`/api/admin/orders/${createdOrder.id}/status`, {
    method: 'PUT',
    token: buyer1Token,
    body: { paymentStatus: 'paid' }
  });
  assert(buyerMarkPaid.status === 403, 'Buyer cannot access admin order payment update (403 Forbidden)');

  // Seller cannot mark order as paid
  const sellerMarkPaid = await request(`/api/admin/orders/${createdOrder.id}/status`, {
    method: 'PUT',
    token: seller1Token,
    body: { paymentStatus: 'paid' }
  });
  assert(sellerMarkPaid.status === 403, 'Seller cannot access admin order payment update (403 Forbidden)');

  // Admin marks order as paid after reviewing payment reference
  const adminVerifyPaid = await request(`/api/admin/orders/${createdOrder.id}/status`, {
    method: 'PUT',
    token: adminToken,
    body: { status: 'processing', paymentStatus: 'paid' }
  });
  assert(
    adminVerifyPaid.status === 200 &&
    adminVerifyPaid.body?.data?.paymentStatus === 'paid',
    'Admin verifies wallet reference and successfully transitions order to "paid"'
  );

  // Admin lists audit logs
  const auditRes = await request('/api/admin/audit-logs', { token: adminToken });
  assert(auditRes.status === 200 && Array.isArray(auditRes.body?.data), 'Admin successfully retrieves system audit logs');

  // Admin self-deletion protection
  const selfDeleteRes = await request(`/api/admin/users/${admin.id}`, {
    method: 'DELETE',
    token: adminToken
  });
  assert(selfDeleteRes.status === 400, 'Admin self-deletion blocked by security rule (400 Bad Request)');

  // Cleanup server
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });

  console.log('\n======================================================');
  console.log(`🏁 AUDIT RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runFullRouteAudit().catch(err => {
  console.error('Audit run failed:', err);
  process.exit(1);
});
