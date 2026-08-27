import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';
import { PLATFORM_CATEGORIES } from '../server/config/platformCategories.ts';

/**
 * Task 1: Reset Development Database Script
 * Strictly validates environment before clearing development application collections.
 * Does NOT drop database, does NOT delete Mongo users, credentials, or indexes.
 */
async function resetDevelopmentDatabase() {
  console.log('====================================================');
  console.log('🧹 Elsa3ed Market - Development Database Reset');
  console.log('====================================================');

  const nodeEnv = process.env.NODE_ENV || 'development';
  const uri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DB?.trim() || 'Elsa3ed_market';

  // 1. Safety Guard: Check environment
  if (nodeEnv === 'production') {
    console.error('⛔ FATAL: Operation aborted. Cannot reset database in production mode!');
    process.exit(1);
  }

  // 2. Safety Guard: Require explicit confirmation
  const isConfirmed = process.env.CONFIRM_DEV_RESET === 'true' || process.argv.includes('--confirm');
  if (!isConfirmed) {
    console.error('⛔ Safety Guard: Destructive database reset requires explicit confirmation.');
    console.error('   Run with: npx tsx scripts/reset-dev-db.ts --confirm');
    process.exit(1);
  }

  // 3. Safety Guard: Check database name
  if (dbName !== 'Elsa3ed_market') {
    console.error(`⛔ FATAL: Unexpected database name "${dbName}". Reset is strictly restricted to "Elsa3ed_market".`);
    process.exit(1);
  }

  if (!uri) {
    console.error('⛔ FATAL: MONGODB_URI is not set.');
    process.exit(1);
  }

  console.log(`\n🔍 Target Database: [${dbName}]`);
  console.log(`🌱 Target Environment: [${nodeEnv}]`);

  const client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();
    const db = client.db(dbName);

    // Verify connection
    await db.command({ ping: 1 });
    console.log('✅ Connected to MongoDB Atlas development cluster.\n');

    // Collections belonging to Elsa3ed Market application
    const applicationCollections = [
      'products',
      'sellers',
      'orders',
      'carts',
      'favorites',
      'reviews',
      'audit_logs',
      'stock_movements',
      'notifications',
      'discounts'
    ];

    console.log('📦 Clearing application collections...');
    for (const colName of applicationCollections) {
      const exists = await db.listCollections({ name: colName }).hasNext();
      if (exists) {
        const deleted = await db.collection(colName).deleteMany({});
        console.log(` - Cleared collection [${colName}]: ${deleted.deletedCount} documents removed.`);
      } else {
        console.log(` - Collection [${colName}] does not exist yet (skipped).`);
      }
    }

    // Handle Users Collection:
    console.log('\n👤 Resetting Users collection...');
    const usersExists = await db.listCollections({ name: 'users' }).hasNext();
    if (usersExists) {
      const deletedUsers = await db.collection('users').deleteMany({});
      console.log(` - Removed ${deletedUsers.deletedCount} users from [users].`);
    }
    console.log('ℹ️ No test users created. Run `npm run db:bootstrap-admin` to securely initialize a platform admin.');

    // Handle Categories:
    // Re-seed the 8 standard heritage categories (taxonomies required for sellers to choose categories)
    console.log('\n📁 Initializing standard heritage categories...');
    const categoriesExists = await db.listCollections({ name: 'categories' }).hasNext();
    if (categoriesExists) {
      await db.collection('categories').deleteMany({});
    }
    await db.collection('categories').insertMany(PLATFORM_CATEGORIES as any[]);
    console.log(`✅ Initialized ${PLATFORM_CATEGORIES.length} standard heritage categories.`);

    // Handle Craft Stories:
    const craftStoriesExists = await db.listCollections({ name: 'craft_stories' }).hasNext();
    if (craftStoriesExists) {
      await db.collection('craft_stories').deleteMany({});
    }

    // Re-verify production indexes
    console.log('\n⚙️ Re-verifying database indexes...');
    await db.collection('users').createIndex({ usernameNormalized: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex(
      { email: 1 },
      { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
    );
    await db.collection('users').createIndex({ id: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });

    await db.collection('sellers').createIndex({ id: 1 }, { unique: true });
    await db.collection('sellers').createIndex({ userId: 1 });
    await db.collection('sellers').createIndex({ status: 1, governorate: 1 });

    await db.collection('products').createIndex({ id: 1 }, { unique: true });
    await db.collection('products').createIndex({ approvalStatus: 1, categoryId: 1, sellerGovernorate: 1, price: 1 });
    await db.collection('products').createIndex({ sellerId: 1, createdAt: -1 });

    await db.collection('categories').createIndex({ id: 1 }, { unique: true });
    await db.collection('categories').createIndex({ slug: 1 }, { unique: true });
    await db.collection('categories').createIndex({ active: 1, displayOrder: 1 });

    await db.collection('orders').createIndex({ id: 1 }, { unique: true });
    await db.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
    await db.collection('orders').createIndex({ buyerId: 1, createdAt: -1 });
    await db.collection('orders').createIndex({ sellerIds: 1, createdAt: -1 });
    await db.collection('orders').createIndex({ status: 1 });

    await db.collection('reviews').createIndex({ id: 1 }, { unique: true });
    await db.collection('reviews').createIndex({ productId: 1, status: 1, createdAt: -1 });
    await db.collection('reviews').createIndex({ buyerId: 1, productId: 1 });

    await db.collection('craft_stories').createIndex({ id: 1 }, { unique: true });
    await db.collection('craft_stories').createIndex({ active: 1, displayOrder: 1 });
    await db.collection('craft_stories').createIndex({ categoryId: 1 });

    console.log('✅ Indexes verified successfully.');
    console.log('\n====================================================');
    console.log('🎉 Development database reset completed successfully!');
    console.log('====================================================');
  } catch (error: any) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

resetDevelopmentDatabase();
