import { createApp } from '../server/app.ts';
import { generateToken } from '../server/services/authService.ts';
import { getDatabase, memoryDb } from '../server/db/mongodb.ts';
import type { Server } from 'http';

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING CART & SHOPPING ACCESS CONTROL VERIFICATION');
  console.log('======================================================\n');

  const app = createApp();
  const PORT = 4056;
  let server: Server;

  await new Promise<void>((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
      resolve();
    });
  });

  const BASE_URL = `http://localhost:${PORT}`;

  // Seed sample products into Mongo and Memory store for consistent testing
  const { db, isMongo } = await getDatabase();
  const sampleApproved = {
    id: 'test-prod-approved',
    title: 'قُلة قناوية فخارية أصلية',
    price: 150,
    images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61'],
    sellerId: 'seller-1',
    sellerName: 'الأسطى سعيد القناوي',
    sellerGovernorate: 'قنا',
    categoryId: 'pottery',
    approvalStatus: 'approved',
    inStock: true,
    stockCount: 20,
    rating: 4.9,
    createdAt: new Date().toISOString()
  };

  const sampleUnapproved = {
    id: 'test-prod-pending',
    title: 'سجادة صوف غير معتمدة',
    price: 500,
    images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61'],
    sellerId: 'seller-1',
    sellerName: 'الأسطى سعيد القناوي',
    sellerGovernorate: 'قنا',
    categoryId: 'kilim',
    approvalStatus: 'pending',
    inStock: true,
    stockCount: 10,
    rating: 0,
    createdAt: new Date().toISOString()
  };

  const sampleOutOfStock = {
    id: 'test-prod-oos',
    title: 'شال أخميمي نافد',
    price: 300,
    images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61'],
    sellerId: 'seller-1',
    sellerName: 'الأسطى سعيد القناوي',
    sellerGovernorate: 'سوهاج',
    categoryId: 'textiles',
    approvalStatus: 'approved',
    inStock: false,
    stockCount: 0,
    rating: 5.0,
    createdAt: new Date().toISOString()
  };

  if (isMongo && db) {
    await db.collection('products').updateOne({ id: sampleApproved.id }, { $set: sampleApproved }, { upsert: true });
    await db.collection('products').updateOne({ id: sampleUnapproved.id }, { $set: sampleUnapproved }, { upsert: true });
    await db.collection('products').updateOne({ id: sampleOutOfStock.id }, { $set: sampleOutOfStock }, { upsert: true });
  }

  // Also seed memoryDb
  for (const p of [sampleApproved, sampleUnapproved, sampleOutOfStock]) {
    const idx = memoryDb.products.findIndex((x) => x.id === p.id);
    if (idx >= 0) memoryDb.products[idx] = p as any;
    else memoryDb.products.push(p as any);
  }

  // Generate tokens for each role
  const buyerToken = generateToken({
    id: 'user-buyer-1',
    username: 'ahmed_buyer',
    email: 'ahmed.hashmi@gmail.com',
    role: 'buyer'
  } as any);

  const buyer2Token = generateToken({
    id: 'user-buyer-2',
    username: 'mona_buyer',
    email: 'mona.buyer@gmail.com',
    role: 'buyer'
  } as any);

  const sellerToken = generateToken({
    id: 'seller-1',
    username: 'saeed_seller',
    email: 'saeed.pottery@elsa3ed.eg',
    role: 'seller',
    sellerId: 'seller-1',
    sellerStatus: 'approved'
  } as any);

  const adminToken = generateToken({
    id: 'user-admin-1',
    username: 'admin_mahmoud',
    email: 'admin@elsa3ed.eg',
    role: 'admin'
  } as any);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Guest / Unauthenticated Restrictions (401)
    // ----------------------------------------------------
    console.log('\n--- 1. Guest / Unauthenticated Restrictions ---');
    const guestCartRes = await fetch(`${BASE_URL}/api/cart`);
    const guestCartJson = await guestCartRes.json();
    assert(
      guestCartRes.status === 401 && guestCartJson.code === 'UNAUTHORIZED',
      'Guest GET /api/cart returns 401 UNAUTHORIZED',
      `Got status ${guestCartRes.status}`
    );

    const guestAddRes = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: sampleApproved.id, quantity: 1 })
    });
    const guestAddJson = await guestAddRes.json();
    assert(
      guestAddRes.status === 401 && guestAddJson.code === 'UNAUTHORIZED',
      'Guest POST /api/cart/items returns 401 UNAUTHORIZED',
      `Got status ${guestAddRes.status}`
    );

    // ----------------------------------------------------
    // TEST 2: Seller STRICTLY BLOCKED from Cart & Orders (403 FORBIDDEN_BUYER_ONLY)
    // ----------------------------------------------------
    console.log('\n--- 2. Seller Access Restrictions (403 Forbidden) ---');
    const sellerGetRes = await fetch(`${BASE_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${sellerToken}` }
    });
    const sellerGetJson = await sellerGetRes.json();
    assert(
      sellerGetRes.status === 403 && sellerGetJson.code === 'FORBIDDEN_BUYER_ONLY',
      'Seller GET /api/cart returns 403 FORBIDDEN_BUYER_ONLY',
      `Got status ${sellerGetRes.status}, code: ${sellerGetJson.code}`
    );

    const sellerPostRes = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sellerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId: sampleApproved.id, quantity: 1 })
    });
    const sellerPostJson = await sellerPostRes.json();
    assert(
      sellerPostRes.status === 403 && sellerPostJson.code === 'FORBIDDEN_BUYER_ONLY',
      'Seller POST /api/cart/items returns 403 FORBIDDEN_BUYER_ONLY',
      `Got status ${sellerPostRes.status}`
    );

    const sellerOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sellerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ paymentMethod: 'cod', shippingAddress: { fullName: 'Seller Test' } })
    });
    const sellerOrderJson = await sellerOrderRes.json();
    assert(
      sellerOrderRes.status === 403 && sellerOrderJson.code === 'FORBIDDEN_BUYER_ONLY',
      'Seller POST /api/orders returns 403 FORBIDDEN_BUYER_ONLY',
      `Got status ${sellerOrderRes.status}`
    );

    const sellerGetOrdersRes = await fetch(`${BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${sellerToken}` }
    });
    assert(
      sellerGetOrdersRes.status === 403,
      'Seller GET /api/orders returns 403 FORBIDDEN_BUYER_ONLY',
      `Got status ${sellerGetOrdersRes.status}`
    );

    // ----------------------------------------------------
    // TEST 3: Admin STRICTLY BLOCKED from Cart & Orders (403 FORBIDDEN_BUYER_ONLY)
    // ----------------------------------------------------
    console.log('\n--- 3. Admin Access Restrictions (403 Forbidden) ---');
    const adminGetRes = await fetch(`${BASE_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminGetJson = await adminGetRes.json();
    assert(
      adminGetRes.status === 403 && adminGetJson.code === 'FORBIDDEN_BUYER_ONLY',
      'Admin GET /api/cart returns 403 FORBIDDEN_BUYER_ONLY',
      `Got status ${adminGetRes.status}`
    );

    const adminPostRes = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId: sampleApproved.id, quantity: 1 })
    });
    const adminPostJson = await adminPostRes.json();
    assert(
      adminPostRes.status === 403 && adminPostJson.code === 'FORBIDDEN_BUYER_ONLY',
      'Admin POST /api/cart/items returns 403 FORBIDDEN_BUYER_ONLY',
      `Got status ${adminPostRes.status}`
    );

    const adminOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ paymentMethod: 'cod', shippingAddress: { fullName: 'Admin Test' } })
    });
    const adminOrderJson = await adminOrderRes.json();
    assert(
      adminOrderRes.status === 403 && adminOrderJson.code === 'FORBIDDEN_BUYER_ONLY',
      'Admin POST /api/orders returns 403 FORBIDDEN_BUYER_ONLY',
      `Got status ${adminOrderRes.status}`
    );

    // ----------------------------------------------------
    // TEST 4: Buyer Full Shopping Access & Business Logic
    // ----------------------------------------------------
    console.log('\n--- 4. Buyer Full Shopping & Cart Operations ---');
    // Clear buyer's cart first
    await fetch(`${BASE_URL}/api/cart`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${buyerToken}` }
    });

    const buyerGetEmptyRes = await fetch(`${BASE_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${buyerToken}` }
    });
    const buyerGetEmptyJson = await buyerGetEmptyRes.json();
    assert(
      buyerGetEmptyRes.status === 200 && buyerGetEmptyJson.success && Array.isArray(buyerGetEmptyJson.data.items),
      'Buyer GET /api/cart returns 200 OK with empty items list',
      `Got status ${buyerGetEmptyRes.status}`
    );

    // Add approved item to cart
    const buyerAddRes = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${buyerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId: sampleApproved.id, quantity: 2 })
    });
    const buyerAddJson = await buyerAddRes.json();
    assert(
      buyerAddRes.status === 200 && buyerAddJson.success && buyerAddJson.data.items.length === 1,
      'Buyer POST /api/cart/items successfully adds approved item (2 pieces)',
      `Got status ${buyerAddRes.status}`
    );

    // Update item quantity
    const buyerUpdateRes = await fetch(`${BASE_URL}/api/cart/items/${sampleApproved.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${buyerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity: 3 })
    });
    const buyerUpdateJson = await buyerUpdateRes.json();
    const updatedItem = buyerUpdateJson.data?.items?.find((i: any) => i.product?.id === sampleApproved.id || i.productId === sampleApproved.id);
    assert(
      buyerUpdateRes.status === 200 && updatedItem?.quantity === 3,
      `Buyer PUT /api/cart/items/${sampleApproved.id} updates quantity to 3`,
      `Got status ${buyerUpdateRes.status}`
    );

    // Reject non-positive or float quantities
    const invalidQtyRes = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${buyerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId: sampleApproved.id, quantity: -5 })
    });
    assert(
      invalidQtyRes.status === 400,
      'Negative quantity rejected with 400 Bad Request',
      `Got status ${invalidQtyRes.status}`
    );

    // Reject unapproved product
    const unapprovedRes = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${buyerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId: sampleUnapproved.id, quantity: 1 })
    });
    assert(
      unapprovedRes.status === 400,
      'Unapproved product rejected with 400 Bad Request',
      `Got status ${unapprovedRes.status}`
    );

    // Reject out-of-stock product
    const oosRes = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${buyerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId: sampleOutOfStock.id, quantity: 1 })
    });
    assert(
      oosRes.status === 400,
      'Out-of-stock product rejected with 400 Bad Request',
      `Got status ${oosRes.status}`
    );

    // Reject quantity exceeding available stock (stock is 20, requesting 50)
    const exceedStockRes = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${buyerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId: sampleApproved.id, quantity: 50 })
    });
    assert(
      exceedStockRes.status === 400,
      'Quantity exceeding stock rejected with 400 Bad Request',
      `Got status ${exceedStockRes.status}`
    );

    // Remove single item
    const buyerRemoveRes = await fetch(`${BASE_URL}/api/cart/items/${sampleApproved.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${buyerToken}` }
    });
    const buyerRemoveJson = await buyerRemoveRes.json();
    assert(
      buyerRemoveRes.status === 200 && buyerRemoveJson.data.items.length === 0,
      `Buyer DELETE /api/cart/items/${sampleApproved.id} removes item from cart`,
      `Got status ${buyerRemoveRes.status}`
    );

    // ----------------------------------------------------
    // TEST 5: Cart Isolation & IDOR Protection
    // ----------------------------------------------------
    console.log('\n--- 5. Cart Isolation & IDOR Protection ---');
    // Buyer 1 adds an item
    await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${buyerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId: sampleApproved.id, quantity: 1 })
    });

    // Buyer 2 checks their cart
    const buyer2CartRes = await fetch(`${BASE_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${buyer2Token}` }
    });
    const buyer2CartJson = await buyer2CartRes.json();
    const buyer2Items = buyer2CartJson.data?.items || [];
    assert(
      buyer2Items.length === 0,
      "Buyer 2 cannot see Buyer 1's cart items (Strictly isolated by authenticated userId)",
      `Buyer 2 has ${buyer2Items.length} items`
    );

    // Clean up Buyer 1
    await fetch(`${BASE_URL}/api/cart`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${buyerToken}` }
    });

    console.log('\n======================================================');
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');
  } catch (error) {
    console.error('Unexpected test exception:', error);
    failed++;
  } finally {
    server!.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
