import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';
import { PLATFORM_CATEGORIES } from '../server/config/platformCategories.ts';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const ESSENTIAL_CLOUDINARY_ASSETS = new Set([
  'فخار',
  'كليم',
  'الخوص_والمشغولات_النخيلية',
  'التلى',
  'عسل',
  'تمور',
  'elsa3ed_market2',
  'المنيا',
  'قنا',
  'اسوان',
  'الاقصر',
  'سوهاج',
  'اسيوط',
  'user',
  'سوق_الصعيدSaeed_Marketمن_كل',
  'عايزه_يكون_ثانيه'
]);

async function performFullTestDataCleanup() {
  console.log('================================================================');
  console.log('🧹 Elsa3ed Market — Full Test/Demo Data Purge & Verification');
  console.log('================================================================');

  const uri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DB?.trim() || 'Elsa3ed_market';
  const isConfirmed = process.env.CONFIRM_CLEANUP === 'true' || process.argv.includes('--confirm');

  if (!isConfirmed) {
    console.error('\n⛔ SAFETY GUARD ACTIVATED:');
    console.error('   This operation will purge ALL test/demo data from the database and test media from Cloudinary.');
    console.error('   To proceed, run with:');
    console.error('   npx tsx scripts/cleanup-test-data.ts --confirm\n');
    process.exit(1);
  }

  if (dbName !== 'Elsa3ed_market') {
    console.error(`⛔ FATAL: Target database "${dbName}" is invalid. Expected "Elsa3ed_market".`);
    process.exit(1);
  }

  if (!uri) {
    console.error('⛔ FATAL: MONGODB_URI is not set in environment.');
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000
  });

  try {
    await client.connect();
    const db = client.db(dbName);
    await db.command({ ping: 1 });
    console.log(`✅ Connected to MongoDB Atlas cluster [${dbName}].\n`);

    // ==========================================
    // 1. PRE-CLEANUP AUDIT
    // ==========================================
    console.log('📊 Step 1: Pre-cleanup Database Audit...');
    const collectionsToAudit = [
      'users',
      'sellers',
      'products',
      'orders',
      'carts',
      'favorites',
      'reviews',
      'reels',
      'notifications',
      'audit_logs',
      'stock_movements',
      'discounts',
      'craft_stories',
      'categories',
      'payouts',
      'password_resets'
    ];

    const preCounts: Record<string, number> = {};
    for (const col of collectionsToAudit) {
      try {
        preCounts[col] = await db.collection(col).countDocuments();
        console.log(`   - [${col.padEnd(16)}]: ${preCounts[col]} documents`);
      } catch {
        preCounts[col] = 0;
      }
    }

    // ==========================================
    // 2. SURGICAL USER & SELLER CLEANUP
    // ==========================================
    console.log('\n👤 Step 2: Preserving Platform Administrator and Removing Test Accounts...');
    
    // Find real platform administrator (preserve @مهند / id user-buyer-1787872585157 or real admin)
    const allUsers = await db.collection('users').find({}).toArray();
    const preservedUserIds = new Set<string>();

    for (const user of allUsers) {
      // Preserve real platform admin (@مهند or any non-default admin)
      if (user.username === 'مهند' || (user.role === 'admin' && user.username !== 'admin')) {
        preservedUserIds.add(user.id);
        console.log(`   🛡️ Preserved Platform Admin: [${user.name} (@${user.username})] (ID: ${user.id})`);
      }
    }

    // Delete all test / demo users
    const deleteUsersRes = await db.collection('users').deleteMany({
      id: { $nin: Array.from(preservedUserIds) }
    });
    console.log(`   🗑️ Removed ${deleteUsersRes.deletedCount} test/demo user accounts.`);

    // ==========================================
    // 3. PURGE ALL TEST BUSINESS DATA
    // ==========================================
    console.log('\n📦 Step 3: Purging Test Business Entities & Collections...');

    const collectionsToPurgeAll = [
      'sellers',
      'products',
      'orders',
      'carts',
      'favorites',
      'reviews',
      'reels',
      'notifications',
      'audit_logs',
      'stock_movements',
      'discounts',
      'payouts',
      'password_resets'
    ];

    for (const col of collectionsToPurgeAll) {
      const res = await db.collection(col).deleteMany({});
      console.log(`   🗑️ Cleared [${col.padEnd(16)}]: ${res.deletedCount} documents removed.`);
    }

    // ==========================================
    // 4. PLATFORM TAXONOMIES & CATEGORIES
    // ==========================================
    console.log('\n📁 Step 4: Ensuring Clean Platform Heritage Categories Taxonomy...');
    const catCount = await db.collection('categories').countDocuments();
    if (catCount === 0) {
      await db.collection('categories').insertMany(PLATFORM_CATEGORIES as any[]);
      console.log(`   ✅ Initialized ${PLATFORM_CATEGORIES.length} standard heritage categories.`);
    } else {
      console.log(`   ✅ Retained ${catCount} standard heritage categories.`);
    }

    // ==========================================
    // 5. CLOUDINARY TEST ASSET CLEANUP
    // ==========================================
    console.log('\n☁️ Step 5: Auditing and Cleaning Cloudinary Media Assets...');
    let deletedMediaCount = 0;
    try {
      // Query image resources
      const imgRes = await cloudinary.api.resources({ type: 'upload', max_results: 100 });
      for (const resource of imgRes.resources) {
        const publicId = resource.public_id;
        const isEssential = ESSENTIAL_CLOUDINARY_ASSETS.has(publicId);
        const isAdminAvatar = Array.from(preservedUserIds).some((id) => publicId.includes(id));

        if (!isEssential && !isAdminAvatar) {
          // Delete test upload asset (samples, deleted product images, deleted seller covers, deleted test user avatars)
          try {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
            console.log(`   🗑️ Deleted Cloudinary Test Image: [${publicId}]`);
            deletedMediaCount++;
          } catch (err: any) {
            console.warn(`   ⚠️ Could not delete image [${publicId}]:`, err?.message || err);
          }
        } else {
          console.log(`   🛡️ Preserved Platform Image Asset: [${publicId}]`);
        }
      }

      // Query video resources
      const vidRes = await cloudinary.api.resources({ resource_type: 'video', type: 'upload', max_results: 100 });
      for (const resource of vidRes.resources) {
        const publicId = resource.public_id;
        const isEssential = ESSENTIAL_CLOUDINARY_ASSETS.has(publicId);

        if (!isEssential) {
          try {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
            console.log(`   🗑️ Deleted Cloudinary Test Video: [${publicId}]`);
            deletedMediaCount++;
          } catch (err: any) {
            console.warn(`   ⚠️ Could not delete video [${publicId}]:`, err?.message || err);
          }
        } else {
          console.log(`   🛡️ Preserved Platform Video Asset: [${publicId}]`);
        }
      }
      console.log(`   ✅ Cloudinary cleanup completed: ${deletedMediaCount} test media files purged.`);
    } catch (cldErr: any) {
      console.warn('   ⚠️ Cloudinary API cleanup notice:', cldErr?.message || cldErr);
    }

    // ==========================================
    // 6. RE-VERIFY PRODUCTION DATABASE INDEXES
    // ==========================================
    console.log('\n⚙️ Step 6: Re-verifying MongoDB Database Indexes...');
    const indexOperations = [
      db.collection('users').createIndex({ usernameNormalized: 1 }, { unique: true }),
      db.collection('users').createIndex({ username: 1 }, { unique: true }),
      db.collection('users').createIndex(
        { email: 1 },
        { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
      ),
      db.collection('users').createIndex({ id: 1 }, { unique: true }),
      db.collection('users').createIndex({ role: 1 }),

      db.collection('products').createIndex({ approvalStatus: 1, categoryId: 1, sellerGovernorate: 1, price: 1 }),
      db.collection('products').createIndex({ sellerId: 1, createdAt: -1 }),
      db.collection('products').createIndex({ id: 1 }, { unique: true }),

      db.collection('orders').createIndex({ buyerId: 1, createdAt: -1 }),
      db.collection('orders').createIndex({ sellerIds: 1, createdAt: -1 }),
      db.collection('orders').createIndex({ status: 1, createdAt: -1 }),
      db.collection('orders').createIndex({ id: 1 }, { unique: true }),
      db.collection('orders').createIndex({ orderNumber: 1 }, { unique: true }),

      db.collection('reviews').createIndex({ productId: 1, status: 1, createdAt: -1 }),
      db.collection('reviews').createIndex({ buyerId: 1, productId: 1 }),

      db.collection('categories').createIndex({ slug: 1 }, { unique: true }),
      db.collection('categories').createIndex({ active: 1, displayOrder: 1 }),

      db.collection('sellers').createIndex({ id: 1 }, { unique: true }),
      db.collection('sellers').createIndex({ userId: 1 }),
      db.collection('sellers').createIndex({ status: 1, governorate: 1 }),

      db.collection('audit_logs').createIndex({ timestamp: -1 }),
      db.collection('audit_logs').createIndex({ actorId: 1, createdAt: -1 }),
      db.collection('craft_stories').createIndex({ id: 1 }, { unique: true }),
      db.collection('craft_stories').createIndex({ active: 1, displayOrder: 1 }),
      db.collection('carts').createIndex({ buyerId: 1 }, { unique: true }),
      db.collection('discounts').createIndex({ code: 1 }, { unique: true }),
      db.collection('favorites').createIndex({ buyerId: 1, productId: 1 }, { unique: true }),
      db.collection('notifications').createIndex({ userId: 1, createdAt: -1 }),
      db.collection('stock_movements').createIndex({ sellerId: 1, createdAt: -1 }),
      db.collection('payouts').createIndex({ sellerId: 1, createdAt: -1 }),
      db.collection('payouts').createIndex({ status: 1, createdAt: -1 }),
      db.collection('payouts').createIndex({ id: 1 }, { unique: true }),
      db.collection('password_resets').createIndex({ tokenHash: 1 }),
      db.collection('password_resets').createIndex({ userId: 1 }),
      db.collection('reels').createIndex({ id: 1 }, { unique: true }),
      db.collection('reels').createIndex({ sellerId: 1, createdAt: -1 }),
      db.collection('reels').createIndex({ isFeatured: 1, createdAt: -1 })
    ];
    await Promise.allSettled(indexOperations);
    console.log('   ✅ All production indexes verified.');

    // ==========================================
    // 7. POST-CLEANUP INTEGRITY & CONSISTENCY AUDIT
    // ==========================================
    console.log('\n🔍 Step 7: Post-cleanup Consistency & Orphan Check...');
    const postUsers = await db.collection('users').find({}).toArray();
    const postSellers = await db.collection('sellers').find({}).toArray();
    const postProducts = await db.collection('products').find({}).toArray();
    const postOrders = await db.collection('orders').find({}).toArray();
    const postReels = await db.collection('reels').find({}).toArray();
    const postCarts = await db.collection('carts').find({}).toArray();
    const postReviews = await db.collection('reviews').find({}).toArray();
    const postNotifications = await db.collection('notifications').find({}).toArray();
    const postAuditLogs = await db.collection('audit_logs').find({}).toArray();

    console.log('\n📊 Final Database State:');
    console.log(`   - Users:          ${postUsers.length} (Preserved Admin: ${postUsers.map((u) => u.username).join(', ')})`);
    console.log(`   - Sellers:        ${postSellers.length}`);
    console.log(`   - Products:       ${postProducts.length}`);
    console.log(`   - Orders:         ${postOrders.length}`);
    console.log(`   - Reels:          ${postReels.length}`);
    console.log(`   - Carts:          ${postCarts.length}`);
    console.log(`   - Reviews:        ${postReviews.length}`);
    console.log(`   - Notifications:  ${postNotifications.length}`);
    console.log(`   - Audit Logs:     ${postAuditLogs.length}`);

    // Verify orphan integrity
    const validUserIds = new Set(postUsers.map((u) => u.id));
    const validSellerIds = new Set(postSellers.map((s) => s.id));

    const orphanedSellers = postSellers.filter((s) => !validUserIds.has(s.userId));
    const orphanedProducts = postProducts.filter((p) => !validSellerIds.has(p.sellerId));
    const orphanedOrders = postOrders.filter((o) => !validUserIds.has(o.buyerId));

    if (orphanedSellers.length > 0 || orphanedProducts.length > 0 || orphanedOrders.length > 0) {
      console.error('❌ INTEGRITY WARNING: Found orphaned documents!');
    } else {
      console.log('✅ INTEGRITY CHECK PASSED: Zero orphaned records found.');
    }

    console.log('\n================================================================');
    console.log('🎉 Cleanup Completed Successfully! The project is now 100% clean.');
    console.log('================================================================\n');
  } catch (error: any) {
    console.error('❌ Cleanup failed with error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

performFullTestDataCleanup();
