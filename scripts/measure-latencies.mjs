const BASE = 'http://localhost:3000';

async function timeRequest(name, url, options = {}) {
  const start = performance.now();
  try {
    const res = await fetch(`${BASE}${url}`, options);
    const duration = Math.round(performance.now() - start);
    return { name, status: res.status, duration, ok: res.ok };
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    return { name, status: 'ERROR', duration, ok: false, error: err.message };
  }
}

async function run() {
  console.log('=== BENCHMARKING ENDPOINT LATENCIES ===\n');

  // 1. First Pass (Fetch / Warm-up cache)
  console.log('--- First Pass (Uncached or Cold) ---');
  const coldCategories = await timeRequest('GET /api/categories', '/api/categories');
  const coldSellers = await timeRequest('GET /api/sellers', '/api/sellers');
  const coldProducts = await timeRequest('GET /api/products', '/api/products');
  const coldAuthMe = await timeRequest('GET /api/auth/me (Guest)', '/api/auth/me');
  const guestOrders = await timeRequest('GET /api/orders (Guest - 401 Expected)', '/api/orders');

  console.log(`${coldCategories.name}: ${coldCategories.status} in ${coldCategories.duration}ms`);
  console.log(`${coldSellers.name}: ${coldSellers.status} in ${coldSellers.duration}ms`);
  console.log(`${coldProducts.name}: ${coldProducts.status} in ${coldProducts.duration}ms`);
  console.log(`${coldAuthMe.name}: ${coldAuthMe.status} in ${coldAuthMe.duration}ms`);
  console.log(`${guestOrders.name}: ${guestOrders.status} in ${guestOrders.duration}ms`);

  // 2. Second Pass (Warm Cache - TTL / Memory cache active)
  console.log('\n--- Second Pass (Warm Cache) ---');
  const warmCategories = await timeRequest('GET /api/categories', '/api/categories');
  const warmSellers = await timeRequest('GET /api/sellers', '/api/sellers');
  const warmProducts = await timeRequest('GET /api/products', '/api/products');
  const warmAuthMe = await timeRequest('GET /api/auth/me (Guest)', '/api/auth/me');

  console.log(`${warmCategories.name}: ${warmCategories.status} in ${warmCategories.duration}ms`);
  console.log(`${warmSellers.name}: ${warmSellers.status} in ${warmSellers.duration}ms`);
  console.log(`${warmProducts.name}: ${warmProducts.status} in ${warmProducts.duration}ms`);
  console.log(`${warmAuthMe.name}: ${warmAuthMe.status} in ${warmAuthMe.duration}ms`);

  // 3. Authenticated Pass (Login as Buyer, Admin, Seller)
  console.log('\n--- Authenticated Session Checks ---');
  // Buyer login
  const buyerLoginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'buyer1', password: 'password123' })
  });
  const buyerCookie = buyerLoginRes.headers.get('set-cookie');
  const buyerJson = await buyerLoginRes.json();
  const buyerToken = buyerJson?.data?.token;

  if (buyerToken) {
    const buyerAuthMe = await timeRequest('GET /api/auth/me (Buyer)', '/api/auth/me', {
      headers: { 'Authorization': `Bearer ${buyerToken}` }
    });
    const buyerOrders = await timeRequest('GET /api/orders (Buyer - 200 Expected)', '/api/orders', {
      headers: { 'Authorization': `Bearer ${buyerToken}` }
    });
    console.log(`${buyerAuthMe.name}: ${buyerAuthMe.status} in ${buyerAuthMe.duration}ms`);
    console.log(`${buyerOrders.name}: ${buyerOrders.status} in ${buyerOrders.duration}ms`);
  }

  // Admin login
  const adminLoginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'password123' })
  });
  const adminJson = await adminLoginRes.json();
  const adminToken = adminJson?.data?.token;

  if (adminToken) {
    const adminOrders = await timeRequest('GET /api/orders (Admin - 403 Expected)', '/api/orders', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminActualOrders = await timeRequest('GET /api/admin/orders (Admin - 200 Expected)', '/api/admin/orders', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`${adminOrders.name}: ${adminOrders.status} in ${adminOrders.duration}ms`);
    console.log(`${adminActualOrders.name}: ${adminActualOrders.status} in ${adminActualOrders.duration}ms`);
  }

  // Seller login
  const sellerLoginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'seller1', password: 'password123' })
  });
  const sellerJson = await sellerLoginRes.json();
  const sellerToken = sellerJson?.data?.token;

  if (sellerToken) {
    const sellerOrders = await timeRequest('GET /api/orders (Seller - 403 Expected)', '/api/orders', {
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    const sellerActualOrders = await timeRequest('GET /api/seller/orders (Seller - 200 Expected)', '/api/seller/orders', {
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    console.log(`${sellerOrders.name}: ${sellerOrders.status} in ${sellerOrders.duration}ms`);
    console.log(`${sellerActualOrders.name}: ${sellerActualOrders.status} in ${sellerActualOrders.duration}ms`);
  }
}

run();
