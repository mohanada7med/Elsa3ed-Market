import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import { Product, Seller, Category, AuditLog, UserProfile } from '../../src/types.ts';
import { OrderDocument, CartDocument, DiscountCouponDocument, ReviewDocument, StockMovementDocument, CraftStoryDocument } from '../models/types.ts';
import { Logger } from '../utils/logger.ts';
import { PLATFORM_CATEGORIES } from '../config/platformCategories.ts';

dotenv.config();

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;
let connectionPromise: Promise<{ db: Db | null; isMongo: boolean }> | null = null;
let lastAttemptTime = 0;
let connectionFailed = false;
let failureReason = '';
const RETRY_COOLDOWN_MS = 60000; // Wait 1 minute before retrying a failed connection

// Clean in-memory storage initialized to empty state for testing
class MemoryStore {
  products: Product[] = [];
  sellers: Seller[] = [];
  categories: Category[] = [];
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
 * Connect to MongoDB with circuit breaker pattern to prevent request stalling on SSL/TLS errors.
 */
export async function getDatabase(): Promise<{ db: Db | null; isMongo: boolean }> {
  const uri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DB?.trim() || 'Elsa3ed_market';

  console.log('[MongoDB] URI configured:', !!uri);
  console.log('[MongoDB] Database:', dbName);

  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is missing in production environment');
    }

    return { db: null, isMongo: false };
  }

  if (
    uri.includes('USERNAME:PASSWORD') ||
    uri.includes('CLUSTER.mongodb.net')
  ) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI still contains placeholder values');
    }

    return { db: null, isMongo: false };
  }

  if (isConnected && db) {
    return { db, isMongo: true };
  }

  // Circuit breaker: If connection failed recently, quickly return in-memory fallback without stalling
  const now = Date.now();
  if (connectionFailed && now - lastAttemptTime < RETRY_COOLDOWN_MS) {
    return { db: null, isMongo: false };
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  lastAttemptTime = now;

  connectionPromise = (async () => {
    try {
      if (!client) {
        client = new MongoClient(uri, {
          connectTimeoutMS: 10000,
          serverSelectionTimeoutMS: 10000,
          maxPoolSize: 10,
          minPoolSize: 2,
          maxIdleTimeMS: 30000,
          retryWrites: true,
        });
      }

      await client.connect();
      db = client.db(dbName);
      isConnected = true;
      connectionFailed = false;
      failureReason = '';
      Logger.info(`[MongoDB] Connected successfully to database: ${dbName}`);

      // Build database indexes and seed essential platform taxonomies (no mock products or sellers)
      await seedMongoDatabase(db);

      return { db, isMongo: true };
    } catch (error: any) {
      connectionFailed = true;
      failureReason = error?.message || 'Connection error';

      Logger.error(`[MongoDB] Connection failed: ${failureReason}`);

      if (client) {
        try {
          await client.close();
        } catch {
          // ignore close error
        }
        client = null;
      }

      if (process.env.NODE_ENV === 'production') {
        throw new Error(`MongoDB connection failed: ${failureReason}`);
      }

      Logger.info('[Database] Falling back to in-memory database');

      return { db: null, isMongo: false };
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
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
