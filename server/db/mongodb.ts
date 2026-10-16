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
  CulturalEventDoc,
  CityDoc,
  VillageDoc,
  CulturalTraditionDoc,
  PlatformSettingsDoc,
  SeasonDoc
} from '../models/types.ts';
import { Logger } from '../utils/logger.ts';
import { PLATFORM_CATEGORIES } from '../config/platformCategories.ts';
import { INITIAL_PLATFORM_SETTINGS } from './wahSeedData.ts';
import { AUTHENTIC_WAH_FOOD } from './authenticWahFoodData.ts';
import { AUTHENTIC_WAH_EVENTS } from './authenticWahEventsData.ts';
import { runHeritagePlacesMigration } from '../utils/heritagePlacesMigration.ts';

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
  reelLikes: Array<{ userId: string; reelId: string; createdAt: string }> = [];
  conversations: ConversationDocument[] = [];
  messages: MessageDocument[] = [];
  passwordResets: import('../models/types.ts').PasswordResetRequestDocument[] = [];
  reports: import('../models/types.ts').ReportTicketDocument[] = [];

  // WAH Cultural Ecosystem Data (Database-driven solely from MongoDB, with rich authentic defaults)
  governorates: GovernorateDoc[] = [];
  heritagePlaces: HeritagePlaceDoc[] = [];
  culturalCrafts: CulturalCraftDoc[] = [];
  wahStories: WahStoryDoc[] = [];
  localPeople: LocalPersonDoc[] = [];
  upperEgyptFood: UpperEgyptFoodDoc[] = [];
  culturalEvents: CulturalEventDoc[] = [];
  seasons: SeasonDoc[] = [];
  media: import('../models/types.ts').MediaAssetDoc[] = [];

  payouts: import('../models/types.ts').PayoutDocument[] = [];
  paymentConfig: import('../models/types.ts').PaymentConfigDocument = {
    id: 'platform_payment_config',
    isOnlinePaymentActive: true,
    isCashOnDeliveryActive: true,
    instaPayAccount: 'elsa3ed@instapay',
    vodafoneCashNumber: '01158969931',
    instaPayInstructions: 'قم بالتحويل عبر تطبيق إنستاباي إلى المعرف الموضح أعلاه واضغط على "تم التحويل".',
    vodafoneCashInstructions: 'قم بتحويل المبلغ إلى رقم فودافون كاش الموضح أعلاه واضغط على "تم التحويل".',
    isInstaPayActive: false,
    isVodafoneCashActive: false,
    updatedAt: new Date().toISOString(),
    updatedBy: 'النظام'
  };
  shippingConfig: import('../models/types.ts').ShippingConfigDocument = {
    id: 'platform_shipping_config',
    defaultPackageType: 'Small',
    freeShippingThreshold: 1000,
    upperEgyptShippingFee: 45,
    otherGovernoratesShippingFee: 55,
    updatedAt: new Date().toISOString(),
    updatedBy: 'النظام'
  };
  shippingCompanies: import('../models/types.ts').ShippingCompanyDocument[] = [
    {
      id: 'ship-comp-aramex',
      name: 'أرامكس مصر - Aramex Egypt',
      nameEn: 'Aramex Egypt',
      code: 'aramex',
      bookingMethod: 'external_booking',
      trackingUrlTemplate: 'https://www.aramex.com/track/results?shipmentNumber={trackingNumber}',
      websiteUrl: 'https://www.aramex.com',
      contactPhone: '16996',
      supportEmail: 'cairo@aramex.com',
      coverageGovernorates: ['all'],
      pickupTerms: 'حجز الشحنة عبر بوابة أرامكس الخارجية وتدوين رقم البوليصة. تسليم للمندوب من مقر الورشة أو أقرب فرع.',
      notes: 'تغطية واسعة للشحن الداخلي والدولي للقطع الحرفية التراثية.',
      isActive: true,
      isApproved: true,
      approvedAt: '2026-01-01T00:00:00.000Z',
      approvedBy: 'إدارة منصة وه',
      hasApiIntegration: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'ship-comp-egypt-post',
      name: 'البريد المصري السريع - Egypt Post',
      nameEn: 'Egypt Post Express',
      code: 'egypt_post',
      bookingMethod: 'external_booking',
      trackingUrlTemplate: 'https://egyptpost.org/tracking?item={trackingNumber}',
      websiteUrl: 'https://egyptpost.org',
      contactPhone: '16789',
      supportEmail: 'contact@egyptpost.org',
      coverageGovernorates: ['all'],
      pickupTerms: 'تغطية تصل لكافة قرى ومراكز محافظات الصعيد. تسليم عبر أقرب مكتب بريد أو التنسيق مع خدمة مندوب البريد السريع.',
      notes: 'أنسب تكلفة اقتصادية للطرود الحرفية في القرى والنجوع النائية.',
      isActive: true,
      isApproved: true,
      approvedAt: '2026-01-01T00:00:00.000Z',
      approvedBy: 'إدارة منصة وه',
      hasApiIntegration: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'ship-comp-mylerz',
      name: 'شركة مايلرز - Mylerz Egypt',
      nameEn: 'Mylerz',
      code: 'mylerz',
      bookingMethod: 'external_booking',
      trackingUrlTemplate: 'https://mylerz.net/tracking/{trackingNumber}',
      websiteUrl: 'https://mylerz.net',
      contactPhone: '0221299999',
      supportEmail: 'info@mylerz.net',
      coverageGovernorates: ['all'],
      pickupTerms: 'حجز الشحنة عبر حساب التاجر لدى مايلرز. تسليم للمندوب مع دعم كامل لتحصيل مبالغ الدفع عند الاستلام COD.',
      notes: 'سرعة توصيل ممتازة وتحديث دوري لحالة الشحنات في المدن الكبرى.',
      isActive: true,
      isApproved: true,
      approvedAt: '2026-01-01T00:00:00.000Z',
      approvedBy: 'إدارة منصة وه',
      hasApiIntegration: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'ship-comp-saed-logistics',
      name: 'الصعيد إكسبريس للخدمات اللوجستية',
      nameEn: 'Saed Express Logistics',
      code: 'saed_express',
      bookingMethod: 'external_booking',
      websiteUrl: 'https://saed-express.com',
      contactPhone: '01012345678',
      supportEmail: 'ops@saed-express.com',
      coverageGovernorates: ['أسوان', 'الأقصر', 'قنا', 'سوهاج', 'أسيوط', 'المنيا', 'بني سويف', 'الوادي الجديد', 'الفيوم'],
      pickupTerms: 'خدمة نقل مخصصة لمنتجات الحرف التراثية والفخار والسجاد اليدوي بين محافظات الصعيد والمحافظات المركزية.',
      notes: 'متخصصة في العناية بالمنتجات الحرفية سهلة الكسر والقطع التراثية الكبيرة.',
      isActive: true,
      isApproved: true,
      approvedAt: '2026-01-01T00:00:00.000Z',
      approvedBy: 'إدارة منصة وه',
      hasApiIntegration: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    }
  ];
  shipments: import('../models/types.ts').ShipmentDocument[] = [];
  craftReels: any;
}
export const memoryDb = new MemoryStore();

/**
 * Safely resolves and validates a MongoDB database name.
 * Prevents errors if a connection URI or invalid characters are passed in MONGODB_DB.
 */
export function resolveValidDatabaseName(rawDbName?: string, uri?: string): string {
  let candidate = (rawDbName || '').trim();

  // If rawDbName is a full connection URI or contains a protocol scheme
  if (candidate.startsWith('mongodb://') || candidate.startsWith('mongodb+srv://') || candidate.includes('://')) {
    try {
      const parsed = new URL(candidate);
      const fromPath = parsed.pathname.replace(/^\/+/, '').split('?')[0].trim();
      candidate = fromPath;
    } catch {
      candidate = '';
    }
  }

  // If candidate is empty, try extracting database name from URI pathname
  if (!candidate && uri) {
    try {
      const parsed = new URL(uri);
      const fromPath = parsed.pathname.replace(/^\/+/, '').split('?')[0].trim();
      if (fromPath) candidate = fromPath;
    } catch {
      // ignore URI parse errors
    }
  }

  // MongoDB database names cannot contain: /\. "$*<>:|? or null character
  if (candidate) {
    if (candidate.includes('.')) {
      // If it contains dots (e.g. hostname like cluster0.mongodb.net), discard and fallback
      candidate = '';
    } else {
      candidate = candidate.replace(/[\\\/\. \"\$\*\<\>\:\|\?]/g, '_').trim();
    }
  }

  return candidate || 'Elsa3ed_market';
}

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
  const dbName = resolveValidDatabaseName(process.env.MONGODB_DB, uri);

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
      try {
        globalCache.db = globalCache.client.db(dbName);
      } catch (err) {
        Logger.warn(`[MongoDB] Failed to select database "${dbName}", falling back to "Elsa3ed_market":`, err);
        globalCache.db = globalCache.client.db('Elsa3ed_market');
      }
      Logger.info(`[MongoDB] Connected successfully to database: ${globalCache.db.databaseName}`);

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

    // Initialize platform settings if not present
    await database.collection('platform_settings').updateOne(
      { id: INITIAL_PLATFORM_SETTINGS.id },
      { $setOnInsert: INITIAL_PLATFORM_SETTINGS },
      { upsert: true }
    );

    // Initialize authentic Upper Egypt food database if empty
    const foodCount = await database.collection('wah_food').countDocuments().catch(() => 1);
    if (foodCount === 0) {
      await database.collection('wah_food').insertMany(AUTHENTIC_WAH_FOOD as any[]);
      Logger.info('[MongoDB] Initialized authentic Upper Egypt food collection');
    }

    // Do not forcibly overwrite or upsert any events or seasons - data is fetched strictly from MongoDB
    const eventsCount = await database.collection('wah_events').countDocuments().catch(() => 0);
    if (eventsCount === 0) {
      Logger.info('[MongoDB] wah_events collection is ready');
    }

    // Parallel index creation grouped by collection to ensure optimal performance and integrity
    const indexOperations = [
      // WAH Cultural Ecosystem Indexes
      database.collection('wah_governorates').createIndex({ id: 1 }, { unique: true }),
      database.collection('wah_governorates').createIndex({ slug: 1 }, { unique: true }),
      database.collection('wah_governorates').createIndex({ status: 1 }),

      database.collection('wah_cities').createIndex({ id: 1 }, { unique: true }),
      database.collection('wah_cities').createIndex({ governorateId: 1 }),

      database.collection('wah_villages').createIndex({ id: 1 }, { unique: true }),
      database.collection('wah_villages').createIndex({ governorateId: 1 }),

      database.collection('wah_heritage_places').createIndex({ id: 1 }, { unique: true }),
      database.collection('wah_heritage_places').createIndex({ slug: 1 }, { unique: true }),
      database.collection('wah_heritage_places').createIndex({ governorateId: 1, category: 1 }),
      database.collection('wah_heritage_places').createIndex({ status: 1 }),

      database.collection('wah_cultural_crafts').createIndex({ id: 1 }, { unique: true }),
      database.collection('wah_cultural_crafts').createIndex({ slug: 1 }, { unique: true }),
      database.collection('wah_cultural_crafts').createIndex({ status: 1 }),

      database.collection('wah_traditions').createIndex({ id: 1 }, { unique: true }),
      database.collection('wah_traditions').createIndex({ slug: 1 }, { unique: true }),
      database.collection('wah_traditions').createIndex({ governorateId: 1 }),

      database.collection('wah_local_people').createIndex({ id: 1 }, { unique: true }),
      database.collection('wah_local_people').createIndex({ slug: 1 }, { unique: true }),
      database.collection('wah_local_people').createIndex({ governorateId: 1 }),

      database.collection('wah_food').createIndex({ id: 1 }, { unique: true }),
      database.collection('wah_food').createIndex({ slug: 1 }, { unique: true }),
      database.collection('wah_food').createIndex({ governorateId: 1 }),

      database.collection('wah_events').createIndex({ id: 1 }, { unique: true }),
      database.collection('wah_events').createIndex({ slug: 1 }, { unique: true }),
      database.collection('wah_events').createIndex({ governorateId: 1, status: 1 }),

      database.collection('wah_seasons').createIndex({ id: 1 }, { unique: true }),
      database.collection('wah_seasons').createIndex({ slug: 1 }, { unique: true }),
      database.collection('wah_seasons').createIndex({ governorateId: 1 }),
      database.collection('wah_seasons').createIndex({ status: 1 }),

      database.collection('platform_settings').createIndex({ id: 1 }, { unique: true }),
      database.collection('media_assets').createIndex({ id: 1 }, { unique: true }),
      database.collection('reports').createIndex({ id: 1 }, { unique: true }),
      database.collection('reports').createIndex({ status: 1, reportedEntityType: 1 }),
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
      database.collection('notifications').createIndex({ userId: 1, isRead: 1 }),
      database.collection('notifications').createIndex({ id: 1 }, { unique: true }),
      database.collection('stock_movements').createIndex({ sellerId: 1, createdAt: -1 }),
      database.collection('payouts').createIndex({ sellerId: 1, createdAt: -1 }),
      database.collection('payouts').createIndex({ status: 1, createdAt: -1 }),
      database.collection('payouts').createIndex({ id: 1 }, { unique: true }),
      database.collection('password_resets').createIndex({ tokenHash: 1 }),
      database.collection('password_resets').createIndex({ userId: 1 }),
      database.collection('reels').createIndex({ id: 1 }, { unique: true }),
      database.collection('reels').createIndex({ sellerId: 1, createdAt: -1 }),
      database.collection('reels').createIndex({ isFeatured: 1, createdAt: -1 }),
      database.collection('reel_likes').createIndex({ userId: 1, reelId: 1 }, { unique: true }),
      database.collection('reel_likes').createIndex({ reelId: 1 }),
      database.collection('reel_likes').createIndex({ userId: 1 }),
      // Live Chat
      database.collection('conversations').createIndex({ id: 1 }, { unique: true }),
      database.collection('conversations').createIndex({ buyerId: 1, updatedAt: -1 }),
      database.collection('conversations').createIndex({ sellerId: 1, updatedAt: -1 }),
      database.collection('conversations').createIndex({ buyerId: 1, sellerId: 1, productId: 1 }),
      database.collection('conversations').createIndex({ buyerId: 1, sellerId: 1, orderId: 1 }),
      database.collection('messages').createIndex({ id: 1 }, { unique: true }),
      database.collection('messages').createIndex({ conversationId: 1, createdAt: 1 }),
      database.collection('messages').createIndex({ receiverId: 1, isRead: 1 }),

      // Shipping & Logistics Indexes
      database.collection('shipping_companies').createIndex({ id: 1 }, { unique: true }),
      database.collection('shipping_companies').createIndex({ code: 1 }, { unique: true }),
      database.collection('shipping_companies').createIndex({ isActive: 1, isApproved: 1 }),
      database.collection('shipments').createIndex({ id: 1 }, { unique: true }),
      database.collection('shipments').createIndex({ orderId: 1 }),
      database.collection('shipments').createIndex({ sellerId: 1, createdAt: -1 }),
      database.collection('shipments').createIndex({ status: 1, createdAt: -1 }),
      database.collection('shipments').createIndex({ trackingNumber: 1 })
    ];


    // Execute non-blocking batch indexing in background
    await Promise.allSettled(indexOperations);

    // Seed approved shipping companies if none exist in MongoDB
    try {
      await database.collection('shipping_companies').deleteMany({ code: 'bosta' });
      const companyCount = await database.collection('shipping_companies').countDocuments();
      if (companyCount === 0 && memoryDb.shippingCompanies?.length > 0) {
        await database.collection('shipping_companies').insertMany(memoryDb.shippingCompanies as any);
        Logger.info(`[MongoDB] Successfully seeded ${memoryDb.shippingCompanies.length} approved shipping companies`);
      }
    } catch (shipSeedErr) {
      Logger.warn('[MongoDB] Shipping companies auto-seed non-fatal error:', shipSeedErr);
    }

    // Safely migrate and enrich heritage places schema without altering existing data
    await runHeritagePlacesMigration(database);
  } catch (err) {
    Logger.error('[MongoDB] Database index/taxonomy initialization error:', err);
  }
}

