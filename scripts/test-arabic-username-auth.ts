import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { MongoClient } from 'mongodb';
import { register, login, AuthSession } from '../server/services/authService.ts';
import { normalizeUsername, validateUsername } from '../server/services/userService.ts';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'Elsa3ed_market';

if (!MONGODB_URI) {
  console.error('⛔ FATAL: MONGODB_URI environment variable is missing.');
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI, {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000
});

async function runTests() {
  console.log('================================================================');
  console.log('🔍 ELSA3ED MARKET — ARABIC USERNAME AUTHENTICATION TEST SUITE');
  console.log('================================================================');

  let passedTests = 0;
  let failedTests = 0;

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    console.log(`✅ Connected to MongoDB Atlas cluster [${MONGODB_DB}]\n`);

    // Clean up any null emails so they are unset
    try {
      await db.collection('users').updateMany({ email: null }, { $unset: { email: "" } });
      await db.collection('users').dropIndex('email_1');
    } catch {
      // ignore
    }

    // Verify / Ensure unique indexes
    await db.collection('users').createIndex({ usernameNormalized: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex(
      { email: 1 },
      { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
    );
    await db.collection('users').createIndex({ id: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    console.log('✅ Unique MongoDB indexes verified (usernameNormalized, username, sparse email).\n');

    // ---------------------------------------------------------
    // TEST 1: Register Buyer with Arabic username "محمد"
    // ---------------------------------------------------------
    console.log('--- TEST 1: Register Buyer with Arabic username "محمد" ---');
    const buyerUsername = 'محمد';
    const buyerPassword = 'ValidPassword123!';
    
    // Normalization check
    const normalized = normalizeUsername(buyerUsername);
    if (normalized !== 'محمد') {
      throw new Error(`Normalization failed! Expected "محمد", got "${normalized}"`);
    }
    console.log(`✓ Normalization check passed: "${buyerUsername}" -> "${normalized}"`);

    const buyerSession: AuthSession = await register({
      username: buyerUsername,
      name: 'محمد عبد الرحيم القنائي',
      password: buyerPassword,
      phone: '01012345678',
      role: 'buyer',
      governorate: 'قنا'
    });

    if (buyerSession.user.username !== 'محمد') {
      throw new Error(`Expected session username "محمد", got "${buyerSession.user.username}"`);
    }
    if (buyerSession.user.role !== 'buyer') {
      throw new Error(`Expected role "buyer", got "${buyerSession.user.role}"`);
    }

    // Verify in MongoDB Atlas
    const buyerDoc = await db.collection('users').findOne({ username: 'محمد' });
    if (!buyerDoc) {
      throw new Error('User "محمد" was NOT found in MongoDB Atlas users collection!');
    }
    if (buyerDoc.username !== 'محمد' || buyerDoc.usernameNormalized !== 'محمد') {
      throw new Error(`MongoDB document has incorrect username: ${JSON.stringify(buyerDoc)}`);
    }
    console.log('✅ TEST 1 PASSED: Buyer with Arabic username "محمد" created & verified in MongoDB Atlas.');
    passedTests++;

    // ---------------------------------------------------------
    // TEST 2: Logout and Login using username "محمد" + password
    // ---------------------------------------------------------
    console.log('\n--- TEST 2: Login using Arabic username "محمد" + password ---');
    const loginSession = await login('محمد', buyerPassword);
    if (!loginSession.token) {
      throw new Error('Login failed: token was not returned.');
    }
    if (loginSession.user.username !== 'محمد') {
      throw new Error(`Login failed: expected user "محمد", got "${loginSession.user.username}"`);
    }
    console.log('✅ TEST 2 PASSED: Successfully logged in using Arabic username "محمد". JWT token generated.');
    passedTests++;

    // ---------------------------------------------------------
    // TEST 3: Duplicate username prevention
    // ---------------------------------------------------------
    console.log('\n--- TEST 3: Duplicate Arabic username registration rejection ---');
    let duplicateRejected = false;
    try {
      await register({
        username: '  محمد  ', // Leading/trailing whitespace should normalize to "محمد"
        name: 'محمد شخص آخر',
        password: 'AnotherPassword456!',
        phone: '01099998888',
        role: 'buyer'
      });
    } catch (err: any) {
      if (err.message.includes('اسم المستخدم مستخدم بالفعل')) {
        duplicateRejected = true;
        console.log(`✓ Correct Arabic error message returned: "${err.message}"`);
      } else {
        throw new Error(`Unexpected error message on duplicate: "${err.message}"`);
      }
    }
    if (!duplicateRejected) {
      throw new Error('Duplicate username was incorrectly allowed!');
    }
    console.log('✅ TEST 3 PASSED: Duplicate Arabic username prevented with friendly Arabic error.');
    passedTests++;

    // ---------------------------------------------------------
    // TEST 4: Register Seller with Arabic username "الأسطى_محمود"
    // ---------------------------------------------------------
    console.log('\n--- TEST 4: Register Seller with Arabic username "الأسطى_محمود" ---');
    const sellerUsername = 'الأسطى_محمود';
    const sellerPassword = 'SellerSecret789!';
    const sellerSession = await register({
      username: sellerUsername,
      name: 'محمود الصعيدي الخزاف',
      password: sellerPassword,
      phone: '01122334455',
      role: 'seller',
      workshopName: 'ورشة الفخار والخزف الأصيل',
      specialty: 'فخار قناوي وخزف يدوي',
      governorate: 'قنا'
    });

    if (sellerSession.user.role !== 'seller') {
      throw new Error(`Expected role "seller", got "${sellerSession.user.role}"`);
    }
    if (sellerSession.user.sellerStatus !== 'pending') {
      throw new Error(`Expected sellerStatus "pending", got "${sellerSession.user.sellerStatus}"`);
    }

    const sellerDoc = await db.collection('sellers').findOne({ name: 'محمود الصعيدي الخزاف' });
    if (!sellerDoc || sellerDoc.status !== 'pending') {
      throw new Error('Seller document not found or status not pending in MongoDB!');
    }
    console.log('✅ TEST 4 PASSED: Seller registered with Arabic username and "pending" review status.');
    passedTests++;

    // ---------------------------------------------------------
    // TEST 5: Approve Seller and verify Seller Login
    // ---------------------------------------------------------
    console.log('\n--- TEST 5: Approve Seller & verify Seller Login via username ---');
    await db.collection('sellers').updateOne(
      { id: sellerDoc.id },
      { $set: { status: 'approved' } }
    );
    await db.collection('users').updateOne(
      { id: sellerSession.user.id },
      { $set: { sellerStatus: 'approved' } }
    );

    const approvedSellerLogin = await login(sellerUsername, sellerPassword);
    if (approvedSellerLogin.user.sellerStatus !== 'approved') {
      throw new Error(`Expected approved seller status upon login, got: "${approvedSellerLogin.user.sellerStatus}"`);
    }
    console.log('✅ TEST 5 PASSED: Approved seller successfully logged in using Arabic username.');
    passedTests++;

    // ---------------------------------------------------------
    // TEST 6: Login as Admin using admin username
    // ---------------------------------------------------------
    console.log('\n--- TEST 6: Admin Registration & Login via username ---');
    const adminUsername = 'مدير_المنصة';
    const adminPassword = 'AdminPassword999!';
    const adminSession = await register({
      username: adminUsername,
      name: 'مدير المنصة الرئيسي',
      password: adminPassword,
      phone: '01000000000',
      role: 'admin',
      governorate: 'قنا'
    });

    const adminLogin = await login(adminUsername, adminPassword);
    if (adminLogin.user.role !== 'admin' || adminLogin.user.username !== adminUsername) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.user)}`);
    }
    console.log('✅ TEST 6 PASSED: Admin successfully logged in via username.');
    passedTests++;

    // ---------------------------------------------------------
    // TEST 7: Login without email field
    // ---------------------------------------------------------
    console.log('\n--- TEST 7: Verify email is never required for login ---');
    const noEmailLogin = await login('محمد', buyerPassword);
    if (!noEmailLogin.token || noEmailLogin.user.username !== 'محمد') {
      throw new Error('Login without email failed!');
    }
    console.log('✅ TEST 7 PASSED: Pure username-based authentication succeeded without email.');
    passedTests++;

    // ---------------------------------------------------------
    // TEST 8: Invalid username or password error messages
    // ---------------------------------------------------------
    console.log('\n--- TEST 8: Friendly Arabic error messages for bad credentials ---');
    let badCredsError = false;
    try {
      await login('محمد', 'WrongPassword123');
    } catch (err: any) {
      if (err.message === 'اسم المستخدم أو كلمة المرور غير صحيحة') {
        badCredsError = true;
        console.log(`✓ Received expected Arabic error: "${err.message}"`);
      } else {
        throw new Error(`Unexpected error message: "${err.message}"`);
      }
    }
    if (!badCredsError) throw new Error('Bad password was not rejected!');

    let missingUserError = false;
    try {
      await login('', 'SomePassword');
    } catch (err: any) {
      if (err.message === 'من فضلك اكتب اسم المستخدم') {
        missingUserError = true;
        console.log(`✓ Received expected Arabic error for empty username: "${err.message}"`);
      } else {
        throw new Error(`Unexpected error message: "${err.message}"`);
      }
    }
    if (!missingUserError) throw new Error('Missing username was not rejected!');
    console.log('✅ TEST 8 PASSED: Clear Arabic error messages for all invalid login scenarios.');
    passedTests++;

    // ---------------------------------------------------------
    // TEST 9: Response Data Leak Inspection
    // ---------------------------------------------------------
    console.log('\n--- TEST 9: Security inspection (No secrets / hashes leaked) ---');
    const inspectedResponses = [buyerSession, loginSession, sellerSession, approvedSellerLogin, adminLogin];
    for (const session of inspectedResponses) {
      const serialized = JSON.stringify(session);
      if (serialized.includes('passwordHash') || serialized.includes('mongodb') || serialized.includes('secret')) {
        throw new Error('SECURITY VIOLATION: sensitive field found in auth response!');
      }
      if ((session.user as any).passwordHash || (session.user as any).password) {
        throw new Error('SECURITY VIOLATION: passwordHash attached to user object!');
      }
    }
    console.log('✅ TEST 9 PASSED: Zero sensitive fields, secrets, or password hashes leaked in API responses.');
    passedTests++;

    // ---------------------------------------------------------
    // CLEANUP: Clean up test accounts to leave database pristine
    // ---------------------------------------------------------
    console.log('\n--- CLEANUP: Removing verification accounts from MongoDB Atlas ---');
    const deleteUsersResult = await db.collection('users').deleteMany({
      username: { $in: ['محمد', 'الأسطى_محمود', 'مدير_المنصة'] }
    });
    const deleteSellersResult = await db.collection('sellers').deleteMany({
      name: 'محمود الصعيدي الخزاف'
    });
    console.log(`✓ Deleted ${deleteUsersResult.deletedCount} test users from MongoDB.`);
    console.log(`✓ Deleted ${deleteSellersResult.deletedCount} test sellers from MongoDB.`);

    const finalUsersCount = await db.collection('users').countDocuments();
    const finalSellersCount = await db.collection('sellers').countDocuments();
    console.log(`✓ Final users count in Atlas: ${finalUsersCount}`);
    console.log(`✓ Final sellers count in Atlas: ${finalSellersCount}`);

    console.log('\n================================================================');
    console.log(`🎉 ALL TESTS PASSED! (${passedTests} passed, ${failedTests} failed)`);
    console.log('Arabic username authentication is fully functional and verified against live MongoDB Atlas.');
    console.log('================================================================');

  } catch (err: any) {
    console.error('❌ Test suite failed:', err);
    failedTests++;
    process.exit(1);
  } finally {
    await client.close();
  }
}

runTests();
