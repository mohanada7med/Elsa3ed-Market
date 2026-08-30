import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import type { Product, Seller, Category, AuditLog, UserProfile } from '../../src/types.ts';
import type { OrderDocument, CartDocument, DiscountCouponDocument, ReviewDocument, StockMovementDocument, CraftStoryDocument, CraftReelDocument } from '../models/types.ts';
import { Logger } from '../utils/logger.ts';
import { PLATFORM_CATEGORIES } from '../config/platformCategories.ts';
import { INITIAL_CRAFT_REELS_DB } from '../config/initialReels.ts';

dotenv.config();

interface MongoGlobalCache {
  client: MongoClient | null;
  db: Db | null;
  promise: Promise<{ db: Db | null; isMongo: boolean }> | null;
  indexesSeeded: boolean;
  lastAttemptTime: number;
}

// Global connection caching across serverless invocations on Vercel
const globalCache: MongoGlobalCache = (globalThis as any).__mongoCache || {
  client: null,
  db: null,
  promise: null,
  indexesSeeded: false,
  lastAttemptTime: 0,
};
(globalThis as any).__mongoCache = globalCache;

// Clean in-memory storage with default platform categories
class MemoryStore {
  products: Product[] = [];
  sellers: Seller[] = [];
  categories: Category[] = [...PLATFORM_CATEGORIES];
  auditLogs: AuditLog[] = [];
  users: UserProfile[] = [];
  carts: CartDocument[] = [];
  orders: OrderDocument[] = [];
  discounts: DiscountCouponDocument[] = [];
  reviews: ReviewDocument[] = [];
  stockMovements: StockMovementDocument[] = [];
  craftStories: CraftStoryDocument[] = [];
  reels: CraftReelDocument[] = [...INITIAL_CRAFT_REELS_DB];
  passwordResets: import('../models/types.ts').PasswordResetRequestDocument[] = [];
  payouts: import('../models/types.ts').PayoutDocument[] = [];
  paymentConfig: import('../models/types.ts').PaymentConfigDocument = {
    id: 'platform_payment_config',
    instaPayAccount: 'elsa3ed@instapay',
    vodafoneCashNumber: '01158969931',
    instaPayInstructions: 'قم بالتحويل عبر تطبيق إنستاباي إلى المعرف الموضح أعلاه واضغط على "تم التحويل".',
    vodafoneCashInstructions: 'قم بتحويل المبلغ إلى رقم فودافون كاش الموضح أعلاه واضغط على "تم التحويل".',
    updatedAt: new Date().toISOString(),
    updatedBy: 'النظام'
  };
}
export const memoryDb = new MemoryStore();

/**
 * Connect to MongoDB with serverless connection pooling and non-blocking background initialization.
 * Optimized for Vercel Serverless Functions and container environments.
 */
export async function getDatabase(): Promise<{ db: Db | null; isMongo: boolean }> {
  // Support standard MONGODB_URI and common aliases (e.g. MONGODB_CONNECTION_URL, DATABASE_URL)
  const uri = (
    process.env.MONGODB_URI ||
    process.env.MONGODB_CONNECTION_URL ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL
  )?.trim();
  const dbName = process.env.MONGODB_DB?.trim() || 'Elsa3ed_market';

  if (!uri) {
    Logger.info('[Database] Operating with in-memory store (MONGODB_URI not provided)');
    return { db: null, isMongo: false };
  }

  if (
    uri.includes('USERNAME:PASSWORD') ||
    uri.includes('<db_password>') ||
    uri.includes('CLUSTER.mongodb.net')
  ) {
    Logger.warn('[Database] MONGODB_URI contains placeholder values; operating with in-memory store');
    return { db: null, isMongo: false };
  }

  // If already connected and client is active, return immediately (0ms latency)
  if (globalCache.db && globalCache.client) {
    return { db: globalCache.db, isMongo: true };
  }

  // If a connection attempt is already in progress, reuse the existing promise
  if (globalCache.promise) {
    return globalCache.promise;
  }

  // Short retry throttle (2 seconds) to avoid spamming on connection errors
  const now = Date.now();
  if (now - globalCache.lastAttemptTime < 2000 && !globalCache.db) {
    return { db: null, isMongo: false };
  }

  globalCache.lastAttemptTime = now;

  globalCache.promise = (async () => {
    try {
      if (!globalCache.client) {
        globalCache.client = new MongoClient(uri, {
          connectTimeoutMS: 10000,
          serverSelectionTimeoutMS: 10000, // 10s timeout to allow cold starts to resolve cleanly
          maxPoolSize: 10,
          minPoolSize: 0, // In serverless, minPoolSize must be 0 to avoid stale sockets
          maxIdleTimeMS: 30000,
          retryWrites: true,
        });
      }

      await globalCache.client.connect();
      globalCache.db = globalCache.client.db(dbName);
      Logger.info(`[MongoDB] Connected successfully to database: ${dbName}`);

      // Seed indexes and categories in the background so cold start response is NOT blocked
      if (!globalCache.indexesSeeded) {
        globalCache.indexesSeeded = true;
        seedMongoDatabase(globalCache.db).catch((seedErr) => {
          Logger.error('[MongoDB] Background index/seed creation error:', seedErr);
        });
      }

      return { db: globalCache.db, isMongo: true };
    } catch (error: any) {
      Logger.error(`[MongoDB] Connection failed: ${error?.message || error}`);

      if (globalCache.client) {
        try {
          await globalCache.client.close();
        } catch {
          // ignore close error
        }
        globalCache.client = null;
      }
      globalCache.db = null;

      const isTimeout = error?.name === 'MongoServerSelectionError' || error?.message?.includes('timed out');
      if (isTimeout) {
        Logger.warn('[MongoDB] Connection timed out. Ensure 0.0.0.0/0 is added in MongoDB Atlas Network Access.');
      }

      Logger.info('[Database] Operating with in-memory store until database is connected');
      return { db: null, isMongo: false };
    } finally {
      globalCache.promise = null;
    }
  })();

  return globalCache.promise;
}

async function seedMongoDatabase(database: Db) {
  try {
    // Only seed standard platform categories if none exist (essential for seller product categorization)
    const categoriesCount = await database.collection('categories').countDocuments();
    if (categoriesCount === 0) {
      await database.collection('categories').insertMany(PLATFORM_CATEGORIES as any[]);
      Logger.info('[MongoDB] Initialized standard platform categories collection');
    }

    // Seed default baseline admin and seller accounts if missing
    try {
      const defaultPasswordHash = await bcrypt.hash('password123', 10);
      
      const adminExists = await database.collection('users').findOne({ usernameNormalized: 'admin' });
      if (!adminExists) {
        await database.collection('users').insertOne({
          id: 'user-admin-1',
          username: 'admin',
          usernameNormalized: 'admin',
          name: 'أ/ محمود الهواري (مدير المنصة)',
          email: 'admin@elsa3ed.eg',
          phone: '01000000000',
          role: 'admin',
          passwordHash: defaultPasswordHash,
          governorate: 'قنا',
          savedAddresses: [],
          status: 'active',
          avatar: 'https://res.cloudinary.com/kuana1nl/image/upload/v1787924812/user.jpg',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        Logger.info('[MongoDB] Seeded default platform admin user (@admin)');
      }

      const sellerExists = await database.collection('users').findOne({ usernameNormalized: 'seller1' });
      if (!sellerExists) {
        await database.collection('users').insertOne({
          id: 'user-seller-1',
          username: 'seller1',
          usernameNormalized: 'seller1',
          name: 'عم حمزة القناوي',
          email: 'seller1@elsa3ed.eg',
          phone: '01011111111',
          role: 'seller',
          passwordHash: defaultPasswordHash,
          sellerId: 'seller-1',
          sellerStatus: 'approved',
          governorate: 'قنا',
          savedAddresses: [],
          status: 'active',
          avatar: 'https://res.cloudinary.com/kuana1nl/image/upload/v1787924812/user.jpg',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        await database.collection('sellers').updateOne(
          { id: 'seller-1' },
          {
            $setOnInsert: {
              id: 'seller-1',
              userId: 'user-seller-1',
              name: 'عم حمزة القناوي',
              workshopName: 'ورشة الفخار القناوي الأصيل',
              phone: '01011111111',
              email: 'seller1@elsa3ed.eg',
              governorate: 'قنا',
              city: 'قنا',
              address: 'حي القناوية، مركز قنا',
              specialty: 'صناعة الفخار والقلل القناوي',
              status: 'approved',
              story: 'حرفة ورثتها أباً عن جد منذ أكثر من 40 عاماً',
              rating: 4.9,
              reviewCount: 28,
              totalSales: 154,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          },
          { upsert: true }
        );
        Logger.info('[MongoDB] Seeded default seller user (@seller1)');
      }
    } catch (userSeedErr) {
      Logger.error('[MongoDB] Error seeding default users:', userSeedErr);
    }

    // Comprehensive production indexes for high-throughput queries
    try {
      await database.collection('users').updateMany({ email: null }, { $unset: { email: "" } });
    } catch {
      // ignore
    }
    try {
      await database.collection('users').dropIndex('email_1');
    } catch {
      // ignore
    }
    await database.collection('users').createIndex({ usernameNormalized: 1 }, { unique: true });
    await database.collection('users').createIndex({ username: 1 }, { unique: true });
    await database.collection('users').createIndex(
      { email: 1 },
      { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
    );
    await database.collection('users').createIndex({ id: 1 }, { unique: true });
    await database.collection('users').createIndex({ role: 1 });

    // Comprehensive production indexes for high-throughput queries
    await database.collection('products').createIndex({ approvalStatus: 1, categoryId: 1, sellerGovernorate: 1, price: 1 });
    await database.collection('products').createIndex({ sellerId: 1, createdAt: -1 });
    await database.collection('products').createIndex({ id: 1 }, { unique: true });
    await database.collection('orders').createIndex({ buyerId: 1, createdAt: -1 });
    await database.collection('orders').createIndex({ sellerIds: 1, createdAt: -1 });
    await database.collection('orders').createIndex({ status: 1, createdAt: -1 });
    await database.collection('orders').createIndex({ id: 1 }, { unique: true });
    await database.collection('reviews').createIndex({ productId: 1, status: 1, createdAt: -1 });
    await database.collection('reviews').createIndex({ buyerId: 1, productId: 1 });
    await database.collection('categories').createIndex({ slug: 1 }, { unique: true });
    await database.collection('categories').createIndex({ active: 1, displayOrder: 1 });
    await database.collection('sellers').createIndex({ id: 1 }, { unique: true });
    await database.collection('sellers').createIndex({ status: 1, governorate: 1 });
    await database.collection('audit_logs').createIndex({ timestamp: -1 });
    await database.collection('audit_logs').createIndex({ actorId: 1, createdAt: -1 });
    await database.collection('craft_stories').createIndex({ id: 1 }, { unique: true });
    await database.collection('craft_stories').createIndex({ active: 1, displayOrder: 1 });
    await database.collection('craft_stories').createIndex({ categoryId: 1 });

    // Carts, Discounts, Favorites & Operations Indexes
    await database.collection('carts').createIndex({ buyerId: 1 }, { unique: true });
    await database.collection('discounts').createIndex({ code: 1 }, { unique: true });
    await database.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
    await database.collection('favorites').createIndex({ buyerId: 1, productId: 1 }, { unique: true });
    await database.collection('notifications').createIndex({ userId: 1, createdAt: -1 });
    await database.collection('stock_movements').createIndex({ sellerId: 1, createdAt: -1 });
    await database.collection('payouts').createIndex({ sellerId: 1, createdAt: -1 });
    await database.collection('payouts').createIndex({ status: 1, createdAt: -1 });
    await database.collection('payouts').createIndex({ id: 1 }, { unique: true });
    await database.collection('password_resets').createIndex({ tokenHash: 1 });
    await database.collection('password_resets').createIndex({ userId: 1 });
    try {
      await database.collection('password_resets').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    } catch {
      // Ignore if index option differs
    }
    // Reels Collection Indexes & Initial Seed
    await database.collection('reels').createIndex({ id: 1 }, { unique: true });
    await database.collection('reels').createIndex({ sellerId: 1, createdAt: -1 });
    await database.collection('reels').createIndex({ governorate: 1 });
    await database.collection('reels').createIndex({ isFeatured: 1, createdAt: -1 });

    try {
      const reelsCount = await database.collection('reels').countDocuments();
      if (reelsCount === 0) {
        await database.collection('reels').insertMany(INITIAL_CRAFT_REELS_DB);
        Logger.info('[MongoDB] Seeded initial craft reels into database');
      }
    } catch (seedErr) {
      Logger.warn('[MongoDB] Error checking/seeding reels:', seedErr);
    }
  } catch (err) {
    Logger.error('[MongoDB] Index creation error:', err);
  }
}
