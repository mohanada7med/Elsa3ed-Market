import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import type { Product, Seller, Category, AuditLog, UserProfile } from '../../src/types.ts';
import type {
  OrderDocument,
  CartDocument,
  DiscountCouponDocument,
  ReviewDocument,
  StockMovementDocument,
  CraftStoryDocument,
  CraftReelDocument,
  ConversationDocument,
  MessageDocument,
  GovernorateDoc,
  HeritagePlaceDoc,
  CulturalCraftDoc,
  WahStoryDoc,
  LocalPersonDoc,
  UpperEgyptFoodDoc,
  CulturalEventDoc
} from '../models/types.ts';
import { Logger } from '../utils/logger.ts';
import { PLATFORM_CATEGORIES } from '../config/platformCategories.ts';
import {
  INITIAL_GOVERNORATES,
  INITIAL_HERITAGE_PLACES,
  INITIAL_CULTURAL_CRAFTS,
  INITIAL_WAH_STORIES,
  INITIAL_LOCAL_PEOPLE,
  INITIAL_UPPER_EGYPT_FOOD,
  INITIAL_CULTURAL_EVENTS
} from './wahSeedData.ts';

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
  reels: CraftReelDocument[] = [];
  conversations: ConversationDocument[] = [];
  messages: MessageDocument[] = [];
  passwordResets: import('../models/types.ts').PasswordResetRequestDocument[] = [];

  // WAH Cultural Ecosystem Data
  governorates: GovernorateDoc[] = [...INITIAL_GOVERNORATES];
  heritagePlaces: HeritagePlaceDoc[] = [...INITIAL_HERITAGE_PLACES];
  culturalCrafts: CulturalCraftDoc[] = [...INITIAL_CULTURAL_CRAFTS];
  wahStories: WahStoryDoc[] = [...INITIAL_WAH_STORIES];
  localPeople: LocalPersonDoc[] = [...INITIAL_LOCAL_PEOPLE];
  upperEgyptFood: UpperEgyptFoodDoc[] = [...INITIAL_UPPER_EGYPT_FOOD];
  culturalEvents: CulturalEventDoc[] = [...INITIAL_CULTURAL_EVENTS];

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
          serverSelectionTimeoutMS: 10000,
          maxPoolSize: 20, // Sufficient pool size for concurrent request handling
          minPoolSize: 0,  // In serverless, minPoolSize must be 0 to avoid stale sockets
          maxIdleTimeMS: 30000,
          retryWrites: true,
        });
      }

      await globalCache.client.connect();
      globalCache.db = globalCache.client.db(dbName);
      Logger.info(`[MongoDB] Connected successfully to database: ${dbName}`);

      // Seed indexes and categories in background with slight delay so incoming user requests aren't queued behind index builds
      if (!globalCache.indexesSeeded) {
        globalCache.indexesSeeded = true;
        setTimeout(() => {
          if (globalCache.db) {
            seedMongoDatabase(globalCache.db).catch((seedErr) => {
              Logger.error('[MongoDB] Background index/seed creation error:', seedErr);
            });
          }
        }, 100).unref?.();
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
    // Only initialize standard platform heritage categories taxonomy if empty
    const categoriesCount = await database.collection('categories').countDocuments().catch(() => 1);
    if (categoriesCount === 0) {
      await database.collection('categories').insertMany(PLATFORM_CATEGORIES as any[]);
      Logger.info('[MongoDB] Initialized standard platform heritage categories taxonomy');
    }

    // Parallel index creation grouped by collection to ensure optimal performance and integrity
    const indexOperations = [
      // Users
      database.collection('users').createIndex({ usernameNormalized: 1 }, { unique: true }),
      database.collection('users').createIndex({ username: 1 }, { unique: true }),
      database.collection('users').createIndex(
        { email: 1 },
        { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
      ),
      database.collection('users').createIndex({ id: 1 }, { unique: true }),
      database.collection('users').createIndex({ role: 1 }),

      // Products
      database.collection('products').createIndex({ approvalStatus: 1, categoryId: 1, sellerGovernorate: 1, price: 1 }),
      database.collection('products').createIndex({ sellerId: 1, createdAt: -1 }),
      database.collection('products').createIndex({ id: 1 }, { unique: true }),

      // Orders
      database.collection('orders').createIndex({ buyerId: 1, createdAt: -1 }),
      database.collection('orders').createIndex({ sellerIds: 1, createdAt: -1 }),
      database.collection('orders').createIndex({ status: 1, createdAt: -1 }),
      database.collection('orders').createIndex({ id: 1 }, { unique: true }),
      database.collection('orders').createIndex({ orderNumber: 1 }, { unique: true }),

      // Reviews
      database.collection('reviews').createIndex({ productId: 1, status: 1, createdAt: -1 }),
      database.collection('reviews').createIndex({ buyerId: 1, productId: 1 }),

      // Categories
      database.collection('categories').createIndex({ slug: 1 }, { unique: true }),
      database.collection('categories').createIndex({ active: 1, displayOrder: 1 }),

      // Sellers
      database.collection('sellers').createIndex({ id: 1 }, { unique: true }),
      database.collection('sellers').createIndex({ userId: 1 }),
      database.collection('sellers').createIndex({ status: 1, governorate: 1 }),

      // Operations & Audit
      database.collection('audit_logs').createIndex({ timestamp: -1 }),
      database.collection('audit_logs').createIndex({ actorId: 1, createdAt: -1 }),
      database.collection('craft_stories').createIndex({ id: 1 }, { unique: true }),
      database.collection('craft_stories').createIndex({ active: 1, displayOrder: 1 }),
      database.collection('carts').createIndex({ buyerId: 1 }, { unique: true }),
      database.collection('discounts').createIndex({ code: 1 }, { unique: true }),
      database.collection('favorites').createIndex({ buyerId: 1, productId: 1 }, { unique: true }),
      database.collection('notifications').createIndex({ userId: 1, createdAt: -1 }),
      database.collection('stock_movements').createIndex({ sellerId: 1, createdAt: -1 }),
      database.collection('payouts').createIndex({ sellerId: 1, createdAt: -1 }),
      database.collection('payouts').createIndex({ status: 1, createdAt: -1 }),
      database.collection('payouts').createIndex({ id: 1 }, { unique: true }),
      database.collection('password_resets').createIndex({ tokenHash: 1 }),
      database.collection('password_resets').createIndex({ userId: 1 }),
      database.collection('reels').createIndex({ id: 1 }, { unique: true }),
      database.collection('reels').createIndex({ sellerId: 1, createdAt: -1 }),
      database.collection('reels').createIndex({ isFeatured: 1, createdAt: -1 }),
      // Live Chat
      database.collection('conversations').createIndex({ id: 1 }, { unique: true }),
      database.collection('conversations').createIndex({ buyerId: 1, updatedAt: -1 }),
      database.collection('conversations').createIndex({ sellerId: 1, updatedAt: -1 }),
      database.collection('conversations').createIndex({ buyerId: 1, sellerId: 1, productId: 1 }),
      database.collection('conversations').createIndex({ buyerId: 1, sellerId: 1, orderId: 1 }),
      database.collection('messages').createIndex({ id: 1 }, { unique: true }),
      database.collection('messages').createIndex({ conversationId: 1, createdAt: 1 }),
      database.collection('messages').createIndex({ receiverId: 1, isRead: 1 })
    ];


    // Execute non-blocking batch indexing in background
    await Promise.allSettled(indexOperations);
  } catch (err) {
    Logger.error('[MongoDB] Database index/taxonomy initialization error:', err);
  }
}

