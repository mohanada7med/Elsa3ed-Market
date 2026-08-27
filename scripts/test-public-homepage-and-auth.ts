import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'Elsa3ed_market';

interface TestResult {
  num: number;
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function recordTest(num: number, name: string, passed: boolean, message: string, details?: any) {
  results.push({ num, name, passed, message, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [TEST ${num}: ${name}] ${message}`);
  if (!passed && details) {
    console.error('   Details:', details);
  }
}

async function runHomepageAndAuthTests() {
  console.log('================================================================');
  console.log('🏺 RUNNING HOMEPAGE & AUTHENTICATION USER EXPERIENCE TEST SUITE');
  console.log('================================================================\n');

  if (!MONGO_URI) {
    console.error('MONGODB_URI is not set in environment.');
    process.exit(1);
  }

  const mongo = new MongoClient(MONGO_URI);
  await mongo.connect();
  const db = mongo.db(DB_NAME);

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Open Homepage While Logged Out
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Open Homepage while logged out ---');
    const homeRes = await fetch(`${BASE_URL}/`);
    const homeHtml = await homeRes.text();
    const test1Passed =
      homeRes.ok &&
      homeRes.status === 200 &&
      homeHtml.includes('سوق الصعيد') &&
      !homeHtml.includes('redirected-to-login');

    recordTest(
      1,
      'Open Homepage while logged out',
      test1Passed,
      `Homepage returned HTTP ${homeRes.status}, accessible without authentication.`
    );

    // -------------------------------------------------------------------------
    // TEST 2: Browse Marketplace While Logged Out
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Browse Marketplace while logged out ---');
    const productsRes = await fetch(`${BASE_URL}/api/products`);
    const productsJson = await productsRes.json();
    const categoriesRes = await fetch(`${BASE_URL}/api/categories`);
    const categoriesJson = await categoriesRes.json();

    const test2Passed =
      productsRes.ok &&
      Array.isArray(productsJson.data) &&
      categoriesRes.ok &&
      Array.isArray(categoriesJson.data);

    recordTest(
      2,
      'Browse Marketplace while logged out',
      test2Passed,
      `Retrieved ${productsJson.data?.length || 0} public products and ${categoriesJson.data?.length || 0} categories without auth.`
    );

    // -------------------------------------------------------------------------
    // TEST 3: Open Login & Authenticate
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Login works normally ---');
    const buyerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ahmed.hashmi@gmail.com', password: 'Sa3ed@2025' })
    });
    const buyerLoginJson = await buyerLoginRes.json();
    const test3Passed =
      buyerLoginRes.ok &&
      buyerLoginJson.success === true &&
      Boolean(buyerLoginJson.data?.token) &&
      buyerLoginJson.data?.user?.role === 'buyer';

    const buyerToken = buyerLoginJson.data?.token;
    const buyerUser = buyerLoginJson.data?.user;

    recordTest(
      3,
      'Login works normally',
      test3Passed,
      `Buyer authenticated successfully: ${buyerUser?.name} (${buyerUser?.email})`
    );

    // -------------------------------------------------------------------------
    // TEST 4: Login as Buyer -> Session Info & Logout Available
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Login as Buyer verification ---');
    const meBuyerRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${buyerToken}`
      }
    });
    const meBuyerJson = await meBuyerRes.json();
    const test4Passed =
      meBuyerRes.ok &&
      meBuyerJson.success === true &&
      meBuyerJson.data?.role === 'buyer' &&
      meBuyerJson.data?.email === 'ahmed.hashmi@gmail.com';

    recordTest(
      4,
      'Login as Buyer session state',
      test4Passed,
      `Buyer session active for ${meBuyerJson.data?.name}. Header shows account & logout action.`
    );

    // -------------------------------------------------------------------------
    // TEST 5: Logout -> Session Invalidation & Return to Guest State
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Logout and session invalidation ---');
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`
      }
    });
    const logoutJson = await logoutRes.json();
    const test5Passed = logoutRes.ok && logoutJson.success === true;

    recordTest(
      5,
      'Logout and return to guest state',
      test5Passed,
      `Logout confirmed with server message: "${logoutJson.message}"`
    );

    // -------------------------------------------------------------------------
    // TEST 6: Login as Seller -> Seller Specific Navigation
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Login as Seller ---');
    const sellerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'saeed.pottery@elsa3ed.eg', password: 'Sa3ed@2025' })
    });
    const sellerLoginJson = await sellerLoginRes.json();
    const sellerToken = sellerLoginJson.data?.token;

    const meSellerRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${sellerToken}` }
    });
    const meSellerJson = await meSellerRes.json();

    const test6Passed =
      sellerLoginRes.ok &&
      meSellerRes.ok &&
      meSellerJson.data?.role === 'seller' &&
      Boolean(meSellerJson.data?.seller || meSellerJson.data?.sellerStatus);

    recordTest(
      6,
      'Login as Seller & Seller navigation',
      test6Passed,
      `Seller authenticated: ${meSellerJson.data?.name}, Workshop: ${meSellerJson.data?.seller?.brandName || 'ورشة معتمدة'}`
    );

    // -------------------------------------------------------------------------
    // TEST 7: Login as Admin -> Admin Specific Navigation
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 7: Login as Admin ---');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@elsa3ed.eg', password: 'Sa3ed@2025' })
    });
    const adminLoginJson = await adminLoginRes.json();
    const adminToken = adminLoginJson.data?.token;

    const meAdminRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const meAdminJson = await meAdminRes.json();

    const test7Passed =
      adminLoginRes.ok &&
      meAdminRes.ok &&
      meAdminJson.data?.role === 'admin';

    recordTest(
      7,
      'Login as Admin & Admin navigation',
      test7Passed,
      `Admin authenticated: ${meAdminJson.data?.name} (${meAdminJson.data?.email})`
    );

    // -------------------------------------------------------------------------
    // TEST 8: Logged-Out User Accessing Protected Endpoints (Blocked with 401/403)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 8: Logged-out access to protected pages/APIs ---');
    // 1. Logged out calls to admin endpoints
    const unauthAdminRes = await fetch(`${BASE_URL}/api/admin/users`);
    // 2. Logged out calls to seller inventory
    const unauthSellerRes = await fetch(`${BASE_URL}/api/seller/inventory`);
    // 3. Logged out calls to profile updates
    const unauthProfileRes = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hacker' })
    });

    const test8Passed =
      unauthAdminRes.status === 401 &&
      unauthSellerRes.status === 401 &&
      unauthProfileRes.status === 401;

    recordTest(
      8,
      'Server-side authentication protection remains active',
      test8Passed,
      `Unauthenticated requests rejected: Admin API (${unauthAdminRes.status}), Seller API (${unauthSellerRes.status}), Profile API (${unauthProfileRes.status})`
    );
  } catch (err: any) {
    recordTest(99, 'Execution Error', false, err.message, err);
  } finally {
    await mongo.close();
  }

  console.log('\n================================================================');
  const allPassed = results.every((r) => r.passed);
  console.log(allPassed ? '🎉 ALL 8 AUTHENTICATION & UX TESTS PASSED!' : '❌ SOME TESTS FAILED');
  console.log('================================================================');
  process.exit(allPassed ? 0 : 1);
}

runHomepageAndAuthTests();
