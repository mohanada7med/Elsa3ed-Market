import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import { Product, Seller, Category, AuditLog, UserProfile } from '../../src/types.ts';
import { OrderDocument, CartDocument, DiscountCouponDocument, ReviewDocument, StockMovementDocument, CraftStoryDocument } from '../models/types.ts';
import { Logger } from '../utils/logger.ts';
import { PLATFORM_CATEGORIES } from '../config/platformCategories.ts';

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
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is missing in Vercel / production environment variables');
    }

    return { db: null, isMongo: false };
  }

  if (
    uri.includes('USERNAME:PASSWORD') ||
    uri.includes('<db_password>') ||
    uri.includes('CLUSTER.mongodb.net')
  ) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI still contains placeholder values (<db_password> or USERNAME:PASSWORD)');
    }

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
          connectTimeoutMS: 8000,
          serverSelectionTimeoutMS: 5000, // 5s timeout to fail before Vercel function timeout
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
  } catch (err) {
    Logger.error('[MongoDB] Index creation error:', err);
  }
}
