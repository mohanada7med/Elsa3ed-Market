import { createApp } from '../server/app.ts';
import { AUTH_COOKIE_NAME } from '../server/config/authCookie.ts';
import http from 'http';

async function runTests() {
  console.log('=== AUTHENTICATION PERSISTENCE VERIFICATION SUITE ===\n');

  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  console.log(`Test server listening on port ${port}`);

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName} ${detail ? `(${detail})` : ''}`);
      testPassed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      testFailed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Register Buyer & Verify Cookie
    // ----------------------------------------------------
    console.log('\n--- TEST A: Register/Login Buyer & Verify HTTP-Only Cookie ---');
    const buyerUsername = `buyer_${Date.now()}`;
    const buyerRegRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: buyerUsername,
        name: 'مشتري تجريبي صعيدي',
        email: `${buyerUsername}@example.com`,
        password: 'password123',
        phone: '01012345678',
        role: 'buyer',
        governorate: 'قنا'
      })
    });

    const buyerCookies = buyerRegRes.headers.get('set-cookie');
    assert(buyerRegRes.status === 201, 'Buyer Registration status 201');
    assert(Boolean(buyerCookies && buyerCookies.includes(AUTH_COOKIE_NAME)), 'Set-Cookie header contains saeed_auth_token');
    assert(Boolean(buyerCookies && buyerCookies.includes('HttpOnly')), 'Cookie has HttpOnly flag');
    assert(Boolean(buyerCookies && buyerCookies.includes('SameSite=Lax')), 'Cookie has SameSite=Lax');

    // Extract raw cookie for subsequent requests
    const cookieHeader = buyerCookies ? buyerCookies.split(';')[0] : '';
    console.log(`  Extracted Cookie: ${cookieHeader.substring(0, 35)}...`);

    // ----------------------------------------------------
    // TEST 2: Session Restoration on Refresh (GET /api/auth/me with Cookie)
    // ----------------------------------------------------
    console.log('\n--- TEST B: Session Restoration on Page Refresh (GET /api/auth/me) ---');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: {
        'Cookie': cookieHeader
      }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, 'GET /api/auth/me returns 200 OK with valid cookie');
    assert(meData.success === true, 'Response indicates success');
    assert(meData.data.username === buyerUsername, 'Restores correct username', meData.data.username);
    assert(meData.data.role === 'buyer', 'Preserves buyer role on refresh', meData.data.role);

    // ----------------------------------------------------
    // TEST 3: Register / Login Seller & Refresh
    // ----------------------------------------------------
    console.log('\n--- TEST E & F: Seller Registration, Status, and Role Persistence ---');
    const sellerUsername = `seller_${Date.now()}`;
    const sellerRegRes = await fetch(`${baseUrl}/auth/register/seller`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: sellerUsername,
        name: 'معلم سعيد الفخار',
        workshopName: 'ورشة الفخار الأصيل',
        password: 'password123',
        phone: '01123456789',
        governorate: 'قنا',
        specialty: 'فخار وخزف'
      })
    });

    const sellerCookies = sellerRegRes.headers.get('set-cookie');
    assert(sellerRegRes.status === 201, 'Seller Registration status 201');
    assert(Boolean(sellerCookies && sellerCookies.includes(AUTH_COOKIE_NAME)), 'Seller receives saeed_auth_token cookie');

    const sellerCookieHeader = sellerCookies ? sellerCookies.split(';')[0] : '';
    const sellerMeRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Cookie': sellerCookieHeader }
    });
    const sellerMeData = await sellerMeRes.json();
    assert(sellerMeRes.status === 200, 'Seller session restored on refresh');
    assert(sellerMeData.data.role === 'seller', 'Preserves seller role on refresh', sellerMeData.data.role);
    assert(Boolean(sellerMeData.data.sellerId || sellerMeData.data.seller), 'Seller workshop details linked');

    // ----------------------------------------------------
    // TEST 4: Buyer Login via Identifier and Refresh
    // ----------------------------------------------------
    console.log('\n--- TEST: Username-based Login & Refresh ---');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: buyerUsername,
        password: 'password123'
      })
    });
    const loginCookies = loginRes.headers.get('set-cookie');
    assert(loginRes.status === 200, 'Buyer login via username successful');
    assert(Boolean(loginCookies && loginCookies.includes(AUTH_COOKIE_NAME)), 'Login sets HTTP-only cookie');

    // ----------------------------------------------------
    // TEST 5: Logout & Ensure Refresh Leaves User Logged Out
    // ----------------------------------------------------
    console.log('\n--- TEST D: Logout & Persistence After Logout ---');
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader
      }
    });
    const logoutCookies = logoutRes.headers.get('set-cookie');
    assert(logoutRes.status === 200, 'Logout succeeds with 200');
    // Cookie should be expired / cleared
    const isCleared = Boolean(logoutCookies && (
      logoutCookies.includes(`${AUTH_COOKIE_NAME}=;`) ||
      logoutCookies.includes('Max-Age=0') ||
      logoutCookies.includes('expires=Thu, 01 Jan 1970')
    ));
    assert(isCleared, 'Logout sets expiration in the past to clear cookie');

    // Simulating refreshed request after logout (no cookie or cleared cookie)
    const afterLogoutMeRes = await fetch(`${baseUrl}/auth/me`);
    assert(afterLogoutMeRes.status === 401, 'Subsequent request after logout rejected with 401 (guest state)');

    // ----------------------------------------------------
    // TEST 6: Unauthenticated Request (Guest)
    // ----------------------------------------------------
    console.log('\n--- TEST: Guest User Session Check ---');
    const guestRes = await fetch(`${baseUrl}/auth/me`);
    const guestData = await guestRes.json();
    assert(guestRes.status === 401, 'Guest request without cookie returns 401');
    assert(guestData.success === false, 'Guest success is false without crashing');

    // ----------------------------------------------------
    // TEST 7 (Test G): Admin Role Persistence on Refresh
    // ----------------------------------------------------
    console.log('\n--- TEST G: Admin Role Persistence on Refresh ---');
    const { generateToken } = await import('../server/services/authService.ts');
    const adminUser = {
      id: 'user-admin-1',
      username: 'admin',
      email: 'admin@elsa3ed.eg',
      role: 'admin' as const,
      name: 'محمود الهواري (مدير المنصة)',
      phone: '01000000000',
      governorate: 'قنا'
    };
    const adminToken = generateToken(adminUser as any);
    const adminCookieHeader = `${AUTH_COOKIE_NAME}=${adminToken}`;

    const adminMeRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Cookie': adminCookieHeader }
    });
    const adminMeData = await adminMeRes.json();
    console.log('AdminMe response:', adminMeRes.status, adminMeData);
    assert(adminMeRes.status === 200, 'Admin session restored on refresh via cookie');
    assert(adminMeData.success === true, 'Admin response success is true');
    assert(adminMeData.data.role === 'admin', 'Preserves admin role on refresh', adminMeData.data.role);
    assert(adminMeData.data.id === 'user-admin-1', 'Admin user ID matches');

    // ----------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------
    console.log(`\n=== VERIFICATION SUMMARY ===`);
    console.log(`Total Passed: ${testPassed}`);
    console.log(`Total Failed: ${testFailed}`);

    if (testFailed === 0) {
      console.log('\n>>> ALL AUTHENTICATION PERSISTENCE TESTS PASSED! <<<');
    } else {
      process.exitCode = 1;
    }
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
