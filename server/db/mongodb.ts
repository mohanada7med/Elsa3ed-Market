import { MongoClient, Db } from 'mongodb';
import {
  INITIAL_PRODUCTS,
  INITIAL_SELLERS,
  INITIAL_CATEGORIES,
  INITIAL_AUDIT_LOGS,
  INITIAL_ORDERS,
  INITIAL_DISCOUNTS,
  INITIAL_REVIEWS,
  INITIAL_CRAFT_STORIES
} from '../../src/data/mockData.ts';
import { Product, Seller, Category, AuditLog, UserProfile, Review, CraftStory } from '../../src/types.ts';
import { OrderDocument, CartDocument, DiscountCouponDocument, ReviewDocument, StockMovementDocument, CraftStoryDocument } from '../models/types.ts';
import { Logger } from '../utils/logger.ts';

import dotenv from 'dotenv';
dotenv.config();

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;
let connectionPromise: Promise<{ db: Db | null; isMongo: boolean }> | null = null;
let lastAttemptTime = 0;
let connectionFailed = false;
let failureReason = '';
const RETRY_COOLDOWN_MS = 60000; // Wait 1 minute before retrying a failed connection

// In-memory fallback storage when MongoDB URI is not configured or during offline development
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

  constructor() {
    this.seed();
  }

  seed() {
    this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    this.sellers = JSON.parse(JSON.stringify(INITIAL_SELLERS));
    this.categories = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));
    this.auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
    this.discounts = JSON.parse(JSON.stringify(INITIAL_DISCOUNTS));
    this.reviews = JSON.parse(JSON.stringify(INITIAL_REVIEWS));
    this.craftStories = JSON.parse(JSON.stringify(INITIAL_CRAFT_STORIES));

    this.stockMovements = [
      {
        id: 'mov-1',
        productId: 'prod-1',
        productTitle: 'قلة قناوية فخار أصلي',
        sellerId: 'seller-1',
        type: 'STOCK_ADDED',
        quantity: 20,
        previousStock: 0,
        newStock: 20,
        reason: 'دفعة إنتاج فخاري جديدة من ورشة قنا',
        actorId: 'seller-1',
        actorName: 'الأسطى سعيد القناوي',
        timestamp: '2024-02-20T10:00:00.000Z'
      },
      {
        id: 'mov-2',
        productId: 'prod-1',
        productTitle: 'قلة قناوية فخار أصلي',
        sellerId: 'seller-1',
        type: 'ORDER_SOLD',
        quantity: 5,
        previousStock: 20,
        newStock: 15,
        reason: 'مبيعات طلبات مؤكدة',
        actorId: 'system',
        actorName: 'النظام الآلي',
        timestamp: '2024-02-22T14:30:00.000Z'
      }
    ];

    // Convert initial orders to OrderDocument format with historical item snapshots
    this.orders = (INITIAL_ORDERS as any[]).map((ord) => ({
      id: ord.id,
      orderNumber: ord.orderNumber || `SAED-${ord.id.replace(/\D/g, '').slice(-4) || '1042'}`,
      buyerId: ord.buyerId || 'user-buyer-1',
      buyerName: ord.buyerName || ord.shippingAddress.fullName,
      buyerPhone: ord.buyerPhone || ord.shippingAddress.phone,
      buyerEmail: ord.buyerEmail || 'ahmed.hashmi@gmail.com',
      shippingAddress: {
        fullName: ord.shippingAddress.fullName,
        phone: ord.shippingAddress.phone,
        governorate: ord.shippingAddress.governorate,
        city: ord.shippingAddress.city,
        streetAddress: ord.shippingAddress.streetAddress,
        buildingNo: ord.shippingAddress.buildingNo,
        notes: ord.shippingAddress.notes
      },
      items: ord.items.map((it: any) => ({
        productId: it.product?.id || it.productId || 'prod-1',
        productTitle: it.product?.title || 'منتج تراثي',
        productImage: it.product?.images?.[0] || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
        sellerId: it.product?.sellerId || 'seller-1',
        sellerName: it.product?.sellerName || 'ورشة الصعيد',
        sellerGovernorate: it.product?.sellerGovernorate || 'قنا',
        quantity: it.quantity || 1,
        unitPrice: it.product?.price || 250,
        subtotal: (it.product?.price || 250) * (it.quantity || 1)
      })),
      status: ord.status || 'review',
      paymentMethod: ord.paymentMethod || 'vodafone_cash',
      paymentStatus: ord.paymentStatus || 'paid',
      paymentReference: ord.paymentReference || 'VF-882199',
      paymentReceiptUrl: ord.paymentReceiptUrl,
      subtotal: ord.subtotal || 750,
      shippingFee: ord.shippingFee || 40,
      discountAmount: ord.discountAmount || 0,
      discountCode: ord.discountCode,
      total: ord.total || 790,
      createdAt: ord.createdAt || new Date().toISOString(),
      updatedAt: ord.updatedAt || new Date().toISOString(),
      trackingNumber: ord.trackingNumber || 'EG-SAED-8832',
      timeline: ord.timeline || [
        { status: 'review', title: 'تم استلام الطلب', description: 'تم الدفع والتحقق', time: 'مؤخراً', done: true }
      ],
      sellerIds: ord.sellerIds || ['seller-1']
    }));

    // Seed default cart for buyer
    this.carts = [
      {
        id: 'cart-user-buyer-1',
        buyerId: 'user-buyer-1',
        items: [
          {
            productId: 'prod-1',
            quantity: 1,
            addedAt: new Date().toISOString()
          }
        ],
        updatedAt: new Date().toISOString()
      }
    ];

    this.users = [
      {
        id: 'user-admin-1',
        name: 'أ/ محمود الهواري (مدير المنصة)',
        email: 'admin@elsa3ed.eg',
        phone: '01000000000',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        governorate: 'قنا',
        savedAddresses: [],
        createdAt: '2023-01-01'
      },
      {
        id: 'seller-1',
        name: 'الأسطى سعيد القناوي',
        email: 'saeed.pottery@elsa3ed.eg',
        phone: '01012345678',
        role: 'seller',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        governorate: 'قنا',
        savedAddresses: [],
        createdAt: '2023-01-15'
      },
      {
        id: 'user-buyer-1',
        name: 'أحمد محمود الهاشمي',
        email: 'ahmed.hashmi@gmail.com',
        phone: '01019882233',
        role: 'buyer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        governorate: 'القاهرة',
        savedAddresses: [
          {
            fullName: 'أحمد محمود الهاشمي',
            phone: '01019882233',
            governorate: 'القاهرة',
            city: 'المعادي',
            streetAddress: 'شارع 9 - دجلة، عمارة 12، شقة 4',
            buildingNo: 'عمارة 12',
            notes: 'التوصيل مساءً'
          }
        ],
        createdAt: '2023-09-01'
      }
    ];
  }
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

  if (!uri || uri.includes('USERNAME:PASSWORD') || uri.includes('CLUSTER.mongodb.net')) {
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
      await database.collection('categories').insertMany(INITIAL_CATEGORIES as any[]);
      Logger.info('[MongoDB] Initialized standard platform categories collection');
    }

    // Seed craft stories if none exist
    const craftStoriesCount = await database.collection('craft_stories').countDocuments();
    if (craftStoriesCount === 0) {
      await database.collection('craft_stories').insertMany(INITIAL_CRAFT_STORIES as any[]);
      Logger.info('[MongoDB] Initialized craft_stories collection');
    }

    // Comprehensive production indexes for high-throughput queries
    await database.collection('users').createIndex({ email: 1 }, { unique: true });
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
