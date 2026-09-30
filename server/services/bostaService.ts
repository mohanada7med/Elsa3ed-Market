import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { OrderDocument, ShippingConfigDocument } from '../models/types.ts';
import type { AuthenticatedUser } from '../middleware/auth.ts';
import { createNotification } from './notificationService.ts';
import { addAuditLog } from './auditService.ts';
import { Logger } from '../utils/logger.ts';

/**
 * ============================================================
 * BOSTA CITY MAP
 * ============================================================
 */

export const BOSTA_CITY_MAP: Record<
  string,
  {
    code: string;
    nameEn: string;
    nameAr: string;
  }
> = {
  'القاهرة': {
    code: 'EG-01',
    nameEn: 'Cairo',
    nameAr: 'القاهرة'
  },

  'الجيزة': {
    code: 'EG-25',
    nameEn: 'Giza',
    nameAr: 'الجيزة'
  },

  'الإسكندرية': {
    code: 'EG-02',
    nameEn: 'Alexandria',
    nameAr: 'الاسكندريه'
  },

  'اسكندرية': {
    code: 'EG-02',
    nameEn: 'Alexandria',
    nameAr: 'الاسكندريه'
  },

  'أسيوط': {
    code: 'EG-17',
    nameEn: 'Assuit',
    nameAr: 'اسيوط'
  },

  'اسيوط': {
    code: 'EG-17',
    nameEn: 'Assuit',
    nameAr: 'اسيوط'
  },

  'سوهاج': {
    code: 'EG-18',
    nameEn: 'Sohag',
    nameAr: 'سوهاج'
  },

  'قنا': {
    code: 'EG-20',
    nameEn: 'Qena',
    nameAr: 'قنا'
  },

  'الأقصر': {
    code: 'EG-22',
    nameEn: 'Luxor',
    nameAr: 'الاقصر'
  },

  'الاقصر': {
    code: 'EG-22',
    nameEn: 'Luxor',
    nameAr: 'الاقصر'
  },

  'أسوان': {
    code: 'EG-21',
    nameEn: 'Aswan',
    nameAr: 'اسوان'
  },

  'اسوان': {
    code: 'EG-21',
    nameEn: 'Aswan',
    nameAr: 'اسوان'
  },

  'المنيا': {
    code: 'EG-19',
    nameEn: 'Menya',
    nameAr: 'المنيا'
  },

  'بني سويف': {
    code: 'EG-16',
    nameEn: 'Bani Suif',
    nameAr: 'بني سويف'
  },

  'الفيوم': {
    code: 'EG-15',
    nameEn: 'Fayoum',
    nameAr: 'الفيوم'
  },

  'الوادي الجديد': {
    code: 'EG-24',
    nameEn: 'New Valley',
    nameAr: 'الوادي الجديد'
  },

  'البحر الأحمر': {
    code: 'EG-23',
    nameEn: 'Red Sea',
    nameAr: 'البحر الاحمر'
  },

  'البحر الاحمر': {
    code: 'EG-23',
    nameEn: 'Red Sea',
    nameAr: 'البحر الاحمر'
  },

  'الدقهلية': {
    code: 'EG-05',
    nameEn: 'Dakahlia',
    nameAr: 'الدقهليه'
  },

  'البحيرة': {
    code: 'EG-04',
    nameEn: 'Behira',
    nameAr: 'البحيره'
  },

  'الغربية': {
    code: 'EG-07',
    nameEn: 'Gharbia',
    nameAr: 'الغربيه'
  },

  'الشرقية': {
    code: 'EG-10',
    nameEn: 'Sharqia',
    nameAr: 'الشرقيه'
  },

  'القليوبية': {
    code: 'EG-06',
    nameEn: 'El Kalioubia',
    nameAr: 'القليوبيه'
  },

  'كفر الشيخ': {
    code: 'EG-08',
    nameEn: 'Kafr Alsheikh',
    nameAr: 'كفر الشيخ'
  },

  'المنوفية': {
    code: 'EG-09',
    nameEn: 'Monufia',
    nameAr: 'المنوفيه'
  },

  'دمياط': {
    code: 'EG-14',
    nameEn: 'Damietta',
    nameAr: 'دمياط'
  },

  'بورسعيد': {
    code: 'EG-13',
    nameEn: 'Port Said',
    nameAr: 'بور سعيد'
  },

  'بور سعيد': {
    code: 'EG-13',
    nameEn: 'Port Said',
    nameAr: 'بور سعيد'
  },

  'الإسماعيلية': {
    code: 'EG-11',
    nameEn: 'Ismailia',
    nameAr: 'الاسماعيليه'
  },

  'السويس': {
    code: 'EG-12',
    nameEn: 'Suez',
    nameAr: 'السويس'
  },

  'مطروح': {
    code: 'EG-28',
    nameEn: 'Matrouh',
    nameAr: 'مرسي مطروح'
  },

  'مرسى مطروح': {
    code: 'EG-28',
    nameEn: 'Matrouh',
    nameAr: 'مرسي مطروح'
  },

  'شمال سيناء': {
    code: 'EG-27',
    nameEn: 'North Sinai',
    nameAr: 'شمال سيناء'
  },

  'جنوب سيناء': {
    code: 'EG-26',
    nameEn: 'South Sinai',
    nameAr: 'جنوب سيناء'
  }
};

/**
 * ============================================================
 * CITY RESOLUTION
 * ============================================================
 */

export function resolveBostaCityCode(
  governorateName?: string
): {
  code: string;
  nameEn: string;
  nameAr: string;
} | null {
  if (!governorateName) {
    return null;
  }

  const clean = governorateName
    .trim()
    .replace(/^محافظة\s+/i, '');

  if (!clean) {
    return null;
  }

  for (const [key, val] of Object.entries(BOSTA_CITY_MAP)) {
    if (
      clean === key ||
      clean.includes(key) ||
      key.includes(clean)
    ) {
      return val;
    }
  }

  return null;
}

/**
 * ============================================================
 * DEFAULT SHIPPING CONFIG
 * ============================================================
 *
 * IMPORTANT:
 * لا تضع Bosta API Key الحقيقي هنا.
 *
 * استخدم:
 * BOSTA_API_KEY=xxxxxxxx
 *
 * في environment variables.
 */

const DEFAULT_SHIPPING_CONFIG: ShippingConfigDocument = {
  id: 'platform_shipping_config',
  bostaApiKey: process.env.BOSTA_API_KEY || 'ae515bfc1d1f0929d7bd59b63434bc129809e4dc6df157f7321daf7435bcaa39',
  bostaEnv: (process.env.BOSTA_ENV as 'live' | 'staging') || 'live',
  isBostaActive: true,
  bostaPickupLocationId: process.env.BOSTA_PICKUP_LOCATION_ID || 'JIx5kaTHoO',
  bostaPickupLocationName: 'اسيوط - مهند احمد (+201158969931)',
  defaultPackageType: 'SMALL',
  freeShippingThreshold: 1000,
  upperEgyptShippingFee: 45,
  otherGovernoratesShippingFee: 55,
  updatedAt: new Date().toISOString(),
  updatedBy: 'النظام'
};

/**
 * ============================================================
 * HELPERS
 * ============================================================
 */

function getBostaBaseUrl(
  env?: 'live' | 'staging'
): string {
  return env === 'staging'
    ? 'https://stg-app.bosta.co'
    : 'https://app.bosta.co';
}

function getBostaApiKey(
  config: ShippingConfigDocument
): string {
  return (
    config.bostaApiKey ||
    process.env.BOSTA_API_KEY ||
    ''
  ).trim();
}

function isCodOrder(
  order: OrderDocument
): boolean {
  return (
    order.paymentMethod === 'cod' ||
    (order.paymentMethod as string) ===
    'cash_on_delivery'
  );
}

function normalizeTrackingNumber(
  value: unknown
): string {
  if (
    value === undefined ||
    value === null
  ) {
    return '';
  }

  return String(value).trim();
}

function getWebhookStateCode(
  state: unknown
): number | null {
  if (
    state === undefined ||
    state === null ||
    state === ''
  ) {
    return null;
  }

  const numeric = Number(state);

  if (
    Number.isFinite(numeric) &&
    Number.isInteger(numeric)
  ) {
    return numeric;
  }

  return null;
}

/**
 * ============================================================
 * BOSTA NUMERIC STATE CODES
 * ============================================================
 *
 * حسب Webhook documentation:
 *
 * 10  Pickup requested / New
 * 11  Waiting for route
 * 20  Route Assigned
 * 21  Picked up from business
 * 22  Picking up from consignee
 * 23  Picked up from consignee
 * 24  Received at warehouse
 * 25  Fulfilled
 * 30  In transit between hubs
 * 40  Picking up / Cash Collection
 * 41  Heading to customer / Out for delivery
 * 45  Delivered
 * 46  Returned to business
 * 47  Exception
 * 48  Terminated
 * 49  Cancelled
 * 60  Returned to stock
 * 100 Lost
 * 101 Damaged
 * 102 Investigation
 * 103 Awaiting your action
 * 104 Archived
 * 105 On hold
 */

export type BostaInternalState =
  | 'PICKUP_REQUESTED'
  | 'WAITING_FOR_ROUTE'
  | 'ROUTE_ASSIGNED'
  | 'PICKING_UP_FROM_CONSIGNEE'
  | 'PICKED_UP_FROM_BUSINESS'
  | 'PICKED_UP_FROM_CONSIGNEE'
  | 'RECEIVED_AT_WAREHOUSE'
  | 'FULFILLED'
  | 'IN_TRANSIT'
  | 'PICKING_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'RETURNED_TO_BUSINESS'
  | 'EXCEPTION'
  | 'TERMINATED'
  | 'CANCELLED'
  | 'RETURNED_TO_STOCK'
  | 'LOST'
  | 'DAMAGED'
  | 'INVESTIGATION'
  | 'AWAITING_YOUR_ACTION'
  | 'ARCHIVED'
  | 'ON_HOLD'
  | 'UNKNOWN';

function mapBostaStateCode(
  state: unknown
): BostaInternalState {
  const numeric = getWebhookStateCode(state);

  if (numeric !== null) {
    switch (numeric) {
      case 10:
        return 'PICKUP_REQUESTED';

      case 11:
        return 'WAITING_FOR_ROUTE';

      case 20:
        return 'ROUTE_ASSIGNED';

      case 21:
        return 'PICKED_UP_FROM_BUSINESS';

      case 22:
        return 'PICKING_UP_FROM_CONSIGNEE';

      case 23:
        return 'PICKED_UP_FROM_CONSIGNEE';

      case 24:
        return 'RECEIVED_AT_WAREHOUSE';

      case 25:
        return 'FULFILLED';

      case 30:
        return 'IN_TRANSIT';

      case 40:
        return 'PICKING_UP';

      case 41:
        return 'OUT_FOR_DELIVERY';

      case 45:
        return 'DELIVERED';

      case 46:
        return 'RETURNED_TO_BUSINESS';

      case 47:
        return 'EXCEPTION';

      case 48:
        return 'TERMINATED';

      case 49:
        return 'CANCELLED';

      case 60:
        return 'RETURNED_TO_STOCK';

      case 100:
        return 'LOST';

      case 101:
        return 'DAMAGED';

      case 102:
        return 'INVESTIGATION';

      case 103:
        return 'AWAITING_YOUR_ACTION';

      case 104:
        return 'ARCHIVED';

      case 105:
        return 'ON_HOLD';

      default:
        return 'UNKNOWN';
    }
  }

  const text = String(state || '')
    .trim()
    .toUpperCase();

  switch (text) {
    case 'CREATED':
    case 'NEW':
    case 'PICKUP_REQUESTED':
      return 'PICKUP_REQUESTED';

    case 'WAITING_FOR_ROUTE':
      return 'WAITING_FOR_ROUTE';

    case 'ROUTE_ASSIGNED':
      return 'ROUTE_ASSIGNED';

    case 'PICKING_UP':
      return 'PICKING_UP';

    case 'PICKING_UP_FROM_CONSIGNEE':
      return 'PICKING_UP_FROM_CONSIGNEE';

    case 'PICKED_UP':
    case 'PICKED_UP_FROM_BUSINESS':
      return 'PICKED_UP_FROM_BUSINESS';

    case 'PICKED_UP_FROM_CONSIGNEE':
      return 'PICKED_UP_FROM_CONSIGNEE';

    case 'PACKAGE_RECEIVED':
    case 'RECEIVED_AT_WAREHOUSE':
      return 'RECEIVED_AT_WAREHOUSE';

    case 'FULFILLED':
      return 'FULFILLED';

    case 'IN_TRANSIT':
      return 'IN_TRANSIT';

    case 'DELIVERING':
    case 'OUT_FOR_DELIVERY':
      return 'OUT_FOR_DELIVERY';

    case 'DELIVERED':
      return 'DELIVERED';

    case 'RETURNED_TO_BUSINESS':
    case 'RETURNED':
      return 'RETURNED_TO_BUSINESS';

    case 'EXCEPTION':
    case 'DELAYED':
      return 'EXCEPTION';

    case 'TERMINATED':
      return 'TERMINATED';

    case 'CANCELLED':
    case 'CANCELED':
      return 'CANCELLED';

    case 'RETURNED_TO_STOCK':
      return 'RETURNED_TO_STOCK';

    case 'LOST':
      return 'LOST';

    case 'DAMAGED':
      return 'DAMAGED';

    case 'INVESTIGATION':
      return 'INVESTIGATION';

    case 'AWAITING_YOUR_ACTION':
      return 'AWAITING_YOUR_ACTION';

    case 'ARCHIVED':
      return 'ARCHIVED';

    case 'ON_HOLD':
      return 'ON_HOLD';

    default:
      return 'UNKNOWN';
  }
}

/**
 * ============================================================
 * ARABIC STATE
 * ============================================================
 */

function mapBostaStateToArabic(
  state?: unknown
): string {
  const internalState =
    mapBostaStateCode(state);

  switch (internalState) {
    case 'PICKUP_REQUESTED':
      return 'تم طلب استلام الشحنة';

    case 'WAITING_FOR_ROUTE':
      return 'الشحنة بانتظار خط السير';

    case 'ROUTE_ASSIGNED':
      return 'تم تحديد خط سير الشحنة';

    case 'PICKING_UP':
      return 'جاري استلام الشحنة';

    case 'PICKING_UP_FROM_CONSIGNEE':
      return 'جاري استلام الشحنة من العميل';

    case 'PICKED_UP_FROM_BUSINESS':
      return 'تم استلام الشحنة من البائع';

    case 'PICKED_UP_FROM_CONSIGNEE':
      return 'تم استلام الشحنة من العميل';

    case 'RECEIVED_AT_WAREHOUSE':
      return 'تم استلام الشحنة في مركز بوسطة';

    case 'FULFILLED':
      return 'تم تجهيز الشحنة';

    case 'IN_TRANSIT':
      return 'الشحنة قيد النقل بين المراكز';

    case 'OUT_FOR_DELIVERY':
      return 'خرجت الشحنة للتسليم مع المندوب';

    case 'DELIVERED':
      return 'تم تسليم الشحنة بنجاح';

    case 'RETURNED_TO_BUSINESS':
      return 'تم إرجاع الشحنة إلى البائع';

    case 'EXCEPTION':
      return 'يوجد استثناء أو مشكلة في عملية التوصيل';

    case 'TERMINATED':
      return 'تم إنهاء محاولة الشحن';

    case 'CANCELLED':
      return 'تم إلغاء الشحنة';

    case 'RETURNED_TO_STOCK':
      return 'تم إرجاع الشحنة للمخزون';

    case 'LOST':
      return 'الشحنة مفقودة';

    case 'DAMAGED':
      return 'الشحنة تعرضت للتلف';

    case 'INVESTIGATION':
      return 'الشحنة قيد التحقيق';

    case 'AWAITING_YOUR_ACTION':
      return 'الشحنة بانتظار إجراء من البائع';

    case 'ARCHIVED':
      return 'تم أرشفة الشحنة';

    case 'ON_HOLD':
      return 'الشحنة معلقة مؤقتًا';

    default:
      return String(state || 'جاري المعالجة');
  }
}

/**
 * ============================================================
 * ORDER STATUS HELPERS
 * ============================================================
 */

function shouldMarkOrderAsShipped(
  state: BostaInternalState
): boolean {
  return [
    'PICKUP_REQUESTED',
    'WAITING_FOR_ROUTE',
    'ROUTE_ASSIGNED',
    'PICKING_UP',
    'PICKING_UP_FROM_CONSIGNEE',
    'PICKED_UP_FROM_BUSINESS',
    'PICKED_UP_FROM_CONSIGNEE',
    'RECEIVED_AT_WAREHOUSE',
    'FULFILLED',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY'
  ].includes(state);
}

function shouldMarkOrderAsDelivered(
  state: BostaInternalState
): boolean {
  return state === 'DELIVERED';
}

/**
 * ============================================================
 * GET SHIPPING CONFIG
 * ============================================================
 */

export async function getShippingConfig(): Promise<ShippingConfigDocument> {
  const {
    db,
    isMongo
  } = await getDatabase();

  if (isMongo && db) {
    try {
      const config =
        await db
          .collection('shipping_configs')
          .findOne({
            id: 'platform_shipping_config'
          });

      if (config) {
        const doc = config as unknown as ShippingConfigDocument;
        return {
          ...DEFAULT_SHIPPING_CONFIG,
          ...doc,
          bostaApiKey: (doc.bostaApiKey || process.env.BOSTA_API_KEY || DEFAULT_SHIPPING_CONFIG.bostaApiKey).trim(),
          bostaEnv: doc.bostaEnv || (process.env.BOSTA_ENV as 'live' | 'staging') || 'live',
          bostaPickupLocationId: doc.bostaPickupLocationId || process.env.BOSTA_PICKUP_LOCATION_ID || DEFAULT_SHIPPING_CONFIG.bostaPickupLocationId
        };
      }

    } catch (e) {
      Logger.error(
        '[BostaService] Error fetching shipping config from Mongo:',
        e
      );
    }
  }

  if (!memoryDb.shippingConfig) {
    memoryDb.shippingConfig = {
      ...DEFAULT_SHIPPING_CONFIG
    };
  }

  return memoryDb.shippingConfig;
}

/**
 * ============================================================
 * UPDATE SHIPPING CONFIG
 * ============================================================
 */

export async function updateShippingConfig(
  admin: AuthenticatedUser,
  payload: Partial<ShippingConfigDocument>
): Promise<ShippingConfigDocument> {
  const current =
    await getShippingConfig();

  const now =
    new Date().toISOString();

  const updated: ShippingConfigDocument = {
    ...current,
    ...payload,

    bostaApiKey:
      payload.bostaApiKey !== undefined
        ? payload.bostaApiKey.trim()
        : current.bostaApiKey,

    bostaEnv:
      payload.bostaEnv ||
      current.bostaEnv ||
      'live',

    isBostaActive:
      payload.isBostaActive !== undefined
        ? payload.isBostaActive
        : current.isBostaActive,

    bostaPickupLocationId:
      payload.bostaPickupLocationId?.trim() ||
      current.bostaPickupLocationId,

    bostaPickupLocationName:
      payload.bostaPickupLocationName?.trim() ||
      current.bostaPickupLocationName,

    defaultPackageType:
      payload.defaultPackageType ||
      current.defaultPackageType ||
      'SMALL',

    freeShippingThreshold:
      Number(payload.freeShippingThreshold) >= 0
        ? Number(payload.freeShippingThreshold)
        : current.freeShippingThreshold,

    upperEgyptShippingFee:
      Number(payload.upperEgyptShippingFee) >= 0
        ? Number(payload.upperEgyptShippingFee)
        : current.upperEgyptShippingFee,

    otherGovernoratesShippingFee:
      Number(payload.otherGovernoratesShippingFee) >= 0
        ? Number(payload.otherGovernoratesShippingFee)
        : current.otherGovernoratesShippingFee,

    updatedAt: now,

    updatedBy: admin.name
  };

  const {
    db,
    isMongo
  } = await getDatabase();

  if (isMongo && db) {
    try {
      await db
        .collection('shipping_configs')
        .updateOne(
          {
            id: 'platform_shipping_config'
          },
          {
            $set: updated
          },
          {
            upsert: true
          }
        );
    } catch (e) {
      Logger.error(
        '[BostaService] Error updating shipping config in Mongo:',
        e
      );
    }
  }

  memoryDb.shippingConfig =
    updated;

  await addAuditLog({
    actorId: admin.id,
    userName: admin.name,
    userRole: 'admin',

    action:
      'تحديث إعدادات الشحن وربط بوسطة (Bosta)',

    resource:
      'إعدادات الشحن',

    resourceId:
      'platform_shipping_config',

    status:
      'نجاح',

    details:
      `قام المدير ${admin.name} بتحديث إعدادات ربط شركة بوسطة Bosta ` +
      `(تفعيل: ${updated.isBostaActive
        ? 'نعم'
        : 'لا'
      }) ` +
      `وموقع الاستلام: ${updated.bostaPickupLocationName ||
      updated.bostaPickupLocationId ||
      'غير محدد'
      }`
  });

  return updated;
}

/**
 * ============================================================
 * GET BOSTA PICKUP LOCATIONS
 * ============================================================
 */

export async function getBostaPickupLocations(): Promise<{
  success: boolean;
  list: any[];
  error?: string;
}> {
  const config =
    await getShippingConfig();

  const apiKey =
    getBostaApiKey(config);

  if (!apiKey) {
    return {
      success: false,
      list: [],
      error:
        'مفتاح Bosta API غير مضبوط.'
    };
  }

  const baseUrl =
    getBostaBaseUrl(
      config.bostaEnv
    );

  try {
    const res =
      await fetch(
        `${baseUrl}/api/v2/pickup-locations`,
        {
          headers: {
            Authorization: apiKey
          }
        }
      );

    const data =
      await res
        .json()
        .catch(() => null);

    if (
      res.ok &&
      data?.success &&
      data?.data?.list
    ) {
      return {
        success: true,
        list: data.data.list
      };
    }

    return {
      success: false,
      list: [],
      error:
        data?.message ||
        `فشل جلب عناوين الاستلام من بوسطة (${res.status})`
    };
  } catch (err: any) {
    Logger.error(
      '[BostaService] Pickup locations fetch error:',
      err
    );

    return {
      success: false,
      list: [],
      error:
        err.message ||
        'فشل الاتصال بخادم بوسطة'
    };
  }
}

/**
 * ============================================================
 * CREATE BOSTA SHIPMENT
 * ============================================================
 */

export async function createBostaShipment(
  order: OrderDocument,
  options?: {
    notes?: string;
    allowSimulationFallback?: boolean;
  }
): Promise<{
  success: boolean;
  bostaDeliveryId?: string;
  trackingNumber: string;
  awbUrl?: string;
  isSimulated?: boolean;
  message?: string;
  order: OrderDocument;
}> {
  const config =
    await getShippingConfig();

  const apiKey =
    getBostaApiKey(config);

  const baseUrl =
    getBostaBaseUrl(
      config.bostaEnv
    );

  /**
   * ----------------------------------------------------------
   * Validate destination
   * ----------------------------------------------------------
   */

  const destinationCity =
    resolveBostaCityCode(
      order.shippingAddress?.governorate
    );

  if (!destinationCity) {
    throw new Error(
      `محافظة العميل غير مدعومة أو غير معروفة لدى Bosta: ${order.shippingAddress?.governorate ||
      'غير محددة'
      }`
    );
  }

  /**
   * ----------------------------------------------------------
   * Receiver
   * ----------------------------------------------------------
   */

  const nameParts =
    (
      order.shippingAddress?.fullName ||
      order.buyerName ||
      'عميل سوق وه'
    )
      .trim()
      .split(/\s+/);

  const firstName =
    nameParts[0] ||
    'عميل';

  const lastName =
    nameParts
      .slice(1)
      .join(' ') ||
    'وه';

  const phone =
    (
      order.shippingAddress?.phone ||
      order.buyerPhone ||
      ''
    )
      .replace(/[^0-9+]/g, '');

  if (!phone) {
    throw new Error(
      'رقم هاتف العميل غير موجود ولا يمكن إنشاء شحنة Bosta.'
    );
  }

  const email =
    order.buyerEmail ||
    'customer@elsa3ed.com';

  /**
   * ----------------------------------------------------------
   * Address
   * ----------------------------------------------------------
   */

  const fullAddress = [
    order.shippingAddress?.governorate,
    order.shippingAddress?.city,
    order.shippingAddress?.streetAddress,

    order.shippingAddress?.buildingNo
      ? `عمارة ${order.shippingAddress.buildingNo}`
      : null
  ]
    .filter(Boolean)
    .join(' - ');

  if (!fullAddress) {
    throw new Error(
      'عنوان العميل غير مكتمل ولا يمكن إنشاء شحنة Bosta.'
    );
  }

  /**
   * ----------------------------------------------------------
   * COD
   * ----------------------------------------------------------
   */

  const isCOD =
    isCodOrder(order);

  const codAmount =
    isCOD
      ? Number(order.total) || 0
      : 0;

  /**
   * ----------------------------------------------------------
   * Items
   * ----------------------------------------------------------
   */

  const itemsDesc =
    (order.items || [])
      .map(
        (item) =>
          `${item.productTitle} (${item.quantity})`
      )
      .join('، ')
      .substring(0, 180);

  const totalItemsCount =
    (order.items || [])
      .reduce(
        (acc, item) =>
          acc +
          (Number(item.quantity) || 1),
        0
      );

  /**
   * ----------------------------------------------------------
   * API Key
   * ----------------------------------------------------------
   *
   * في Production:
   * لا نعمل Simulation تلقائيًا.
   */

  if (!apiKey) {
    if (
      options?.allowSimulationFallback === true &&
      config.bostaEnv === 'staging'
    ) {
      return handleSimulatedBostaShipment(
        order,
        'تم إنشاء شحنة محاكاة لأن Bosta API Key غير موجود في بيئة الاختبار.'
      );
    }

    throw new Error(
      'Bosta API Key غير مضبوط. أضف BOSTA_API_KEY في Environment Variables.'
    );
  }

  /**
   * ----------------------------------------------------------
   * Bosta Payload
   * ----------------------------------------------------------
   */

  const payload: any = {
    type: 10,

    specs: {
      packageType:
        config.defaultPackageType ||
        'SMALL',

      packageDetails: {
        description:
          itemsDesc ||
          'منتجات حرفية تراثية من الصعيد',

        itemsCount:
          Math.max(
            1,
            totalItemsCount
          )
      }
    },

    receiver: {
      firstName,
      lastName,
      phone,
      email
    },

    dropOffAddress: {
      city:
        destinationCity.code,

      firstLine:
        fullAddress
    },

    /**
     * مهم جدًا:
     * ده اللي هنستخدمه في الـWebhook
     * للعثور على الطلب.
     */
    businessReference:
      order.orderNumber,

    notes:
      (
        options?.notes ||
        order.shippingAddress?.notes ||
        'سوق الصعيد التراثي - منتجات حرفية قابلة للكسر بعناية'
      ).substring(0, 200)
  };

  /**
   * COD
   */

  if (codAmount > 0) {
    payload.cod =
      codAmount;
  }

  /**
   * Pickup address
   */

  if (
    config.bostaPickupLocationId
  ) {
    payload.pickupAddress = {
      _id:
        config.bostaPickupLocationId
    };
  }

  /**
   * ----------------------------------------------------------
   * Create delivery
   * ----------------------------------------------------------
   */

  try {
    const res =
      await fetch(
        `${baseUrl}/api/v2/deliveries?apiVersion=1`,
        {
          method: 'POST',

          headers: {
            Authorization: apiKey,
            'Content-Type':
              'application/json'
          },

          body:
            JSON.stringify(payload)
        }
      );

    const resJson =
      await res
        .json()
        .catch(() => null);

    if (
      !res.ok ||
      !resJson ||
      !resJson.data
    ) {
      const errMsg =
        resJson?.message ||
        `فشل إنشاء الشحنة من بوسطة (${res.status})`;

      Logger.warn(
        '[BostaService] API response warning:',
        errMsg
      );

      /**
       * Simulation ONLY when explicitly requested.
       */
      if (
        options?.allowSimulationFallback === true &&
        config.bostaEnv === 'staging'
      ) {
        return handleSimulatedBostaShipment(
          order,
          `تم إنشاء شحنة محاكاة بسبب خطأ Bosta: ${errMsg}`
        );
      }

      throw new Error(
        `خطأ من شركة بوسطة: ${errMsg}`
      );
    }

    const deliveryData =
      resJson.data || {};

    const bostaDeliveryId =
      String(
        deliveryData._id ||
        deliveryData.id ||
        ''
      );

    const trackingNumber =
      normalizeTrackingNumber(
        deliveryData.trackingNumber ||
        deliveryData._id
      );

    if (
      !bostaDeliveryId ||
      !trackingNumber
    ) {
      throw new Error(
        'Bosta رجعت استجابة بدون Delivery ID أو Tracking Number.'
      );
    }

    const awbUrl =
      `${baseUrl}/api/v2/deliveries/awb/${bostaDeliveryId}`;

    const updatedOrder =
      await applyBostaInfoToOrder(
        order,
        {
          bostaDeliveryId,

          bostaTrackingNumber:
            trackingNumber,

          trackingNumber,

          awbUrl,

          isSimulated: false
        }
      );

    return {
      success: true,

      bostaDeliveryId,

      trackingNumber,

      awbUrl,

      isSimulated: false,

      message:
        `تم إنشاء الشحنة بنجاح على منصة بوسطة ` +
        `برقم تتبع: ${trackingNumber}`,

      order:
        updatedOrder
    };
  } catch (err: any) {
    Logger.error(
      '[BostaService] Create delivery failed:',
      err
    );

    /**
     * مهم:
     *
     * لا نعمل Fake Shipment في Production.
     */
    if (
      options?.allowSimulationFallback === true &&
      config.bostaEnv === 'staging'
    ) {
      return handleSimulatedBostaShipment(
        order,
        `تم إصدار الشحنة بنمط المحاكاة بسبب تعذر الاتصال ببوسطة: ${err.message
        }`
      );
    }

    throw err;
  }
}

/**
 * ============================================================
 * SIMULATED SHIPMENT
 * ============================================================
 *
 * للاختبارات فقط.
 */

async function handleSimulatedBostaShipment(
  order: OrderDocument,
  message: string
): Promise<{
  success: boolean;
  bostaDeliveryId?: string;
  trackingNumber: string;
  awbUrl?: string;
  isSimulated: boolean;
  message: string;
  order: OrderDocument;
}> {
  const simulatedId =
    `BST-${Date.now()
      .toString()
      .slice(-6)}`;

  const simulatedTracking =
    `24${Math.floor(
      100000 +
      Math.random() *
      900000
    )}`;

  const simulatedAwb =
    `https://bosta.co/tracking-shipment/?trackNumber=${simulatedTracking}`;

  const updatedOrder =
    await applyBostaInfoToOrder(
      order,
      {
        bostaDeliveryId:
          simulatedId,

        bostaTrackingNumber:
          simulatedTracking,

        trackingNumber:
          simulatedTracking,

        awbUrl:
          simulatedAwb,

        isSimulated:
          true
      }
    );

  return {
    success: true,

    bostaDeliveryId:
      simulatedId,

    trackingNumber:
      simulatedTracking,

    awbUrl:
      simulatedAwb,

    isSimulated:
      true,

    message,

    order:
      updatedOrder
  };
}

/**
 * ============================================================
 * APPLY BOSTA INFO TO ORDER
 * ============================================================
 */

async function applyBostaInfoToOrder(
  order: OrderDocument,
  data: {
    bostaDeliveryId: string;
    bostaTrackingNumber: string;
    trackingNumber: string;
    awbUrl: string;
    isSimulated: boolean;
  }
): Promise<OrderDocument> {
  const {
    db,
    isMongo
  } = await getDatabase();

  const nowIso =
    new Date().toISOString();

  const timeAr =
    new Date().toLocaleTimeString(
      'ar-EG',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );

  /**
   * Mark shipping timeline as done.
   */

  const updatedTimeline =
    (order.timeline || [])
      .map((step) => {
        if (
          step.status === 'shipped'
        ) {
          return {
            ...step,

            done: true,

            title:
              'تم تسليم الشحنة لشركة بوسطة (Bosta)',

            description:
              `رقم بوليصة التتبع: ${data.trackingNumber}${data.isSimulated
                ? ' (محاكاة)'
                : ''
              }`,

            time:
              timeAr
          };
        }

        return step;
      });

  const orderUpdates:
    Partial<OrderDocument> = {
    status:
      'shipped',

    trackingNumber:
      data.trackingNumber,

    bostaDeliveryId:
      data.bostaDeliveryId,

    bostaTrackingNumber:
      data.bostaTrackingNumber,

    bostaAwbUrl:
      data.awbUrl,

    shippingProvider:
      'bosta',

    bostaState:
      'OUT_FOR_DELIVERY',

    updatedAt:
      nowIso,

    timeline:
      updatedTimeline
  };

  /**
   * Mongo
   */

  if (isMongo && db) {
    try {
      await db
        .collection('orders')
        .updateOne(
          {
            id: order.id
          },
          {
            $set:
              orderUpdates
          }
        );
    } catch (e) {
      Logger.error(
        '[BostaService] Failed to update Mongo order:',
        e
      );
    }
  }

  /**
   * Memory DB
   */

  const memIdx =
    memoryDb.orders.findIndex(
      (o) =>
        o.id === order.id
    );

  if (memIdx >= 0) {
    memoryDb.orders[memIdx] = {
      ...memoryDb.orders[memIdx],
      ...orderUpdates
    };
  }

  /**
   * Notification
   */

  await createNotification({
    userId:
      order.buyerId,

    recipientId:
      order.buyerId,

    title:
      '📦 تم شحن طلبك مع بوسطة!',

    message:
      `تم تسليم طلبك #${order.orderNumber} ` +
      `لشركة بوسطة للشحن السريع. ` +
      `رقم التتبع: ${data.trackingNumber}. ` +
      `يمكنك تتبع خط سير الشحنة مباشرة حتى باب المنزل.`,

    type:
      'order_status',

    link:
      'orders',

    recipientRole:
      'buyer',

    metadata: {
      orderId:
        order.id,

      orderNumber:
        order.orderNumber,

      trackingNumber:
        data.trackingNumber,

      carrier:
        'bosta',

      isSimulated:
        data.isSimulated
    }
  });

  /**
   * Audit
   */

  await addAuditLog({
    userName:
      'نظام الشحن والربط (Bosta)',

    userRole:
      'admin',

    action:
      'إنشاء شحنة وبوليصة بوسطة',

    resource:
      'الطلبات',

    resourceId:
      order.id,

    status:
      'نجاح',

    details:
      `تم إصدار بوليصة شحن بوسطة للطلب #${order.orderNumber} ` +
      `برقم تتبع ${data.trackingNumber}` +
      `${data.isSimulated
        ? ' (نمط المحاكاة)'
        : ''
      }`
  });

  return {
    ...order,
    ...orderUpdates
  };
}

/**
 * ============================================================
 * TRACK BOSTA SHIPMENT
 * ============================================================
 */

export async function trackBostaShipment(
  trackingNumber: string
): Promise<{
  success: boolean;
  trackingNumber: string;
  state?: string;
  stateAr?: string;
  timeline?: any[];
  carrier?: string;
  trackingUrl: string;
  error?: string;
}> {
  const config =
    await getShippingConfig();

  const apiKey =
    getBostaApiKey(config);

  const baseUrl =
    getBostaBaseUrl(
      config.bostaEnv
    );

  const normalizedTracking =
    normalizeTrackingNumber(
      trackingNumber
    );

  const trackingUrl =
    `https://bosta.co/tracking-shipment/?trackNumber=${encodeURIComponent(
      normalizedTracking
    )}`;

  if (!normalizedTracking) {
    return {
      success: false,

      trackingNumber:
        normalizedTracking,

      trackingUrl,

      error:
        'رقم التتبع غير موجود.'
    };
  }

  /**
   * لا يوجد API Key
   */

  if (!apiKey) {
    return {
      success: false,

      trackingNumber:
        normalizedTracking,

      trackingUrl,

      error:
        'Bosta API Key غير مضبوط.'
    };
  }

  try {
    const res =
      await fetch(
        `${baseUrl}/api/v2/deliveries/${encodeURIComponent(
          normalizedTracking
        )}/tracking`,
        {
          headers: {
            Authorization:
              apiKey
          }
        }
      );

    const data =
      await res
        .json()
        .catch(() => null);

    if (
      res.ok &&
      data?.data
    ) {
      const trackingData =
        data.data;

      const rawState =
        trackingData.state;

      return {
        success: true,

        trackingNumber:
          normalizedTracking,

        state:
          String(rawState),

        stateAr:
          mapBostaStateToArabic(
            rawState
          ),

        timeline:
          trackingData.transitEvents ||
          [],

        carrier:
          'بوسطة (Bosta)',

        trackingUrl
      };
    }

    return {
      success: false,

      trackingNumber:
        normalizedTracking,

      trackingUrl,

      error:
        data?.message ||
        `فشل جلب بيانات التتبع من بوسطة (${res.status})`
    };
  } catch (err: any) {
    Logger.error(
      '[BostaService] Track shipment failed:',
      err
    );

    return {
      success: false,

      trackingNumber:
        normalizedTracking,

      trackingUrl,

      error:
        err.message ||
        'تعذر جلب تفاصيل التتبع من بوسطة'
    };
  }
}

/**
 * ============================================================
 * FIND ORDER FROM BOSTA WEBHOOK
 * ============================================================
 */

async function findOrderFromBostaWebhook(
  body: any
): Promise<OrderDocument | null> {
  const trackingNumber =
    normalizeTrackingNumber(
      body?.trackingNumber
    );

  const deliveryId =
    normalizeTrackingNumber(
      body?._id ||
      body?.deliveryId
    );

  const businessReference =
    normalizeTrackingNumber(
      body?.businessReference
    );

  const {
    db,
    isMongo
  } = await getDatabase();

  /**
   * ----------------------------------------------------------
   * Mongo
   * ----------------------------------------------------------
   */

  if (isMongo && db) {
    try {
      const conditions: any[] = [];

      /**
       * أهم lookup:
       * businessReference = order.orderNumber
       */

      if (businessReference) {
        conditions.push({
          orderNumber:
            businessReference
        });
      }

      if (trackingNumber) {
        conditions.push({
          trackingNumber
        });

        conditions.push({
          bostaTrackingNumber:
            trackingNumber
        });
      }

      if (deliveryId) {
        conditions.push({
          bostaDeliveryId:
            deliveryId
        });
      }

      if (conditions.length > 0) {
        const order =
          (await db
            .collection('orders')
            .findOne({
              $or:
                conditions
            })) as unknown as
          | OrderDocument
          | null;

        if (order) {
          return order;
        }
      }
    } catch (e) {
      Logger.error(
        '[Bosta Webhook] Mongo find order error:',
        e
      );
    }
  }

  /**
   * ----------------------------------------------------------
   * Memory DB
   * ----------------------------------------------------------
   */

  const memoryOrder =
    memoryDb.orders.find(
      (o) => {
        if (
          businessReference &&
          o.orderNumber ===
          businessReference
        ) {
          return true;
        }

        if (
          trackingNumber &&
          (
            o.trackingNumber ===
            trackingNumber ||
            o.bostaTrackingNumber ===
            trackingNumber
          )
        ) {
          return true;
        }

        if (
          deliveryId &&
          o.bostaDeliveryId ===
          deliveryId
        ) {
          return true;
        }

        return false;
      }
    );

  return memoryOrder || null;
}

/**
 * ============================================================
 * WEBHOOK TIMESTAMP
 * ============================================================
 */

function getWebhookTimestamp(
  body: any
): string {
  const raw =
    body?.timeStamp;

  if (!raw) {
    return new Date().toISOString();
  }

  const numeric =
    Number(raw);

  if (
    Number.isFinite(numeric)
  ) {
    /**
     * Bosta timestamp may be milliseconds
     * or seconds.
     */

    const milliseconds =
      numeric < 10000000000
        ? numeric * 1000
        : numeric;

    const date =
      new Date(milliseconds);

    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  const date =
    new Date(String(raw));

  if (!Number.isNaN(date.getTime())) {
    return date.toISOString();
  }

  return new Date().toISOString();
}

/**
 * ============================================================
 * WEBHOOK DUPLICATE CHECK
 * ============================================================
 */

function hasSameWebhookEvent(
  order: OrderDocument,
  state: string,
  eventTimestamp: string
): boolean {
  const timeline =
    order.timeline || [];

  if (!timeline.length) {
    return false;
  }

  const last =
    timeline[timeline.length - 1];

  if (!last) {
    return false;
  }

  const lastTitle =
    String(
      (last as any).title || ''
    );

  const lastDescription =
    String(
      (last as any).description ||
      ''
    );

  const normalizedState =
    String(state);

  /**
   * Prevent obvious repeated
   * same-state webhook entries.
   */

  if (
    lastDescription.includes(
      `Bosta state: ${normalizedState}`
    )
  ) {
    return true;
  }

  if (
    lastTitle.includes(
      normalizedState
    ) &&
    eventTimestamp
  ) {
    return true;
  }

  return false;
}

/**
 * ============================================================
 * BUILD WEBHOOK TIMELINE
 * ============================================================
 */

function buildWebhookTimelineStep(
  state: BostaInternalState,
  rawState: unknown,
  body: any,
  timeAr: string
): any {
  const exceptionReason =
    body?.exceptionReason
      ? ` السبب: ${body.exceptionReason}`
      : '';

  const exceptionCode =
    body?.exceptionCode !==
      undefined &&
      body?.exceptionCode !==
      null
      ? ` كود الاستثناء: ${body.exceptionCode}`
      : '';

  const attempts =
    body?.numberOfAttempts !==
      undefined &&
      body?.numberOfAttempts !==
      null
      ? ` عدد المحاولات: ${body.numberOfAttempts}`
      : '';

  let title =
    mapBostaStateToArabic(
      rawState
    );

  let description =
    `حالة الشحنة في بوسطة: ${rawState}`;

  switch (state) {
    case 'DELIVERED':
      title =
        'تم تسليم الطلب للمشتري بنجاح 🎉';

      description =
        'قام مندوب بوسطة بتسليم الشحنة للعميل بنجاح.';

      break;

    case 'OUT_FOR_DELIVERY':
      title =
        'الشحنة خرجت للتسليم';

      description =
        'الشحنة في طريقها للعنوان المسجل مع مندوب بوسطة.';

      break;

    case 'IN_TRANSIT':
      title =
        'الشحنة قيد النقل';

      description =
        'الشحنة تتحرك بين مراكز بوسطة اللوجستية.';

      break;

    case 'RECEIVED_AT_WAREHOUSE':
      title =
        'تم استلام الشحنة في مركز بوسطة';

      description =
        'تم تسجيل وصول الشحنة إلى أحد مراكز بوسطة.';

      break;

    case 'PICKED_UP_FROM_BUSINESS':
      title =
        'تم استلام الشحنة من البائع';

      description =
        'مندوب بوسطة استلم الشحنة من موقع البائع.';

      break;

    case 'RETURNED_TO_BUSINESS':
      title =
        'تم إرجاع الشحنة للبائع';

      description =
        `بوسطة قامت بإرجاع الشحنة إلى المصدر.${exceptionReason}`;

      break;

    case 'EXCEPTION':
      title =
        'يوجد استثناء في التوصيل';

      description =
        `يوجد استثناء أو مشكلة في عملية التوصيل.${exceptionReason}${exceptionCode}${attempts}`;

      break;

    case 'CANCELLED':
      title =
        'تم إلغاء الشحنة';

      description =
        `تم تسجيل إلغاء الشحنة في بوسطة.${exceptionReason}`;

      break;

    case 'TERMINATED':
      title =
        'تم إنهاء الشحنة';

      description =
        'تم إنهاء عملية الشحن بعد محاولات غير ناجحة.';

      break;

    case 'LOST':
      title =
        'الشحنة مفقودة';

      description =
        'تم تسجيل الشحنة كمفقودة لدى بوسطة.';

      break;

    case 'DAMAGED':
      title =
        'الشحنة تعرضت للتلف';

      description =
        'تم تسجيل الشحنة كمتضررة لدى بوسطة.';

      break;

    case 'AWAITING_YOUR_ACTION':
      title =
        'الشحنة تحتاج إلى إجراء';

      description =
        `بوسطة تنتظر إجراء من البائع.${exceptionReason}`;

      break;

    case 'ON_HOLD':
      title =
        'الشحنة معلقة مؤقتًا';

      description =
        'الشحنة متوقفة مؤقتًا لدى بوسطة.';

      break;
  }

  return {
    status:
      state === 'DELIVERED'
        ? 'delivered'
        : state === 'CANCELLED'
          ? 'cancelled'
          : 'shipped',

    title,

    description:
      `${description} ` +
      `(Bosta state: ${String(rawState)})`,

    time:
      timeAr,

    done:
      true
  };
}

/**
 * ============================================================
 * HANDLE BOSTA WEBHOOK
 * ============================================================
 */

export async function handleBostaWebhook(
  body: any
): Promise<{
  success: boolean;
  message: string;
}> {
  Logger.info(
    '[Bosta Webhook] Received payload:',
    body
  );

  if (!body) {
    return {
      success: false,
      message:
        'حمولة الـ Webhook فارغة'
    };
  }

  /**
   * ----------------------------------------------------------
   * Extract identifiers
   * ----------------------------------------------------------
   */

  const trackingNumber =
    normalizeTrackingNumber(
      body.trackingNumber
    );

  const deliveryId =
    normalizeTrackingNumber(
      body._id ||
      body.deliveryId
    );

  const businessReference =
    normalizeTrackingNumber(
      body.businessReference
    );

  const rawState =
    body.state ??
    body.status;

  if (
    !trackingNumber &&
    !deliveryId &&
    !businessReference
  ) {
    return {
      success: false,
      message:
        'لا يوجد Tracking Number أو Delivery ID أو Business Reference في الـWebhook'
    };
  }

  if (
    rawState === undefined ||
    rawState === null ||
    rawState === ''
  ) {
    return {
      success: false,
      message:
        'حالة الشحنة مفقودة في الـWebhook'
    };
  }

  /**
   * ----------------------------------------------------------
   * Resolve state
   * ----------------------------------------------------------
   *
   * مثال:
   *
   * state = 45
   *
   * internalState = DELIVERED
   */

  const state =
    mapBostaStateCode(
      rawState
    );

  const rawStateText =
    String(rawState);

  /**
   * ----------------------------------------------------------
   * Find order
   * ----------------------------------------------------------
   */

  const order =
    await findOrderFromBostaWebhook(
      body
    );

  if (!order) {
    Logger.warn(
      '[Bosta Webhook] No matching order:',
      {
        trackingNumber,
        deliveryId,
        businessReference,
        state: rawState
      }
    );

    /**
     * مهم:
     *
     * نعتبر الـWebhook مستلمًا
     * حتى لا تقوم Bosta بإعادة إرساله
     * لمجرد أن الطلب غير موجود عندنا.
     */

    return {
      success: true,
      message:
        'تم استلام الـWebhook ولكن لم يتم العثور على طلب مطابق'
    };
  }

  /**
   * ----------------------------------------------------------
   * Event time
   * ----------------------------------------------------------
   */

  const eventIso =
    getWebhookTimestamp(body);

  const timeAr =
    new Date(
      eventIso
    ).toLocaleTimeString(
      'ar-EG',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );

  /**
   * ----------------------------------------------------------
   * Duplicate protection
   * ----------------------------------------------------------
   */

  const alreadyProcessed =
    hasSameWebhookEvent(
      order,
      rawStateText,
      eventIso
    );

  if (alreadyProcessed) {
    Logger.info(
      `[Bosta Webhook] Duplicate event ignored for order #${order.orderNumber}, state=${rawStateText}`
    );

    return {
      success: true,
      message:
        'تم استلام حدث Bosta مكرر وتم تجاهله'
    };
  }

  /**
   * ----------------------------------------------------------
   * Determine order status
   * ----------------------------------------------------------
   */

  let updatedOrderStatus =
    order.status;

  if (
    shouldMarkOrderAsDelivered(
      state
    )
  ) {
    updatedOrderStatus =
      'delivered';
  } else if (
    shouldMarkOrderAsShipped(
      state
    )
  ) {
    updatedOrderStatus =
      'shipped';
  }

  /**
   * لا نقوم بتغيير Order status
   * تلقائيًا إلى cancelled للـException/Return
   * لأن حالة الشحنة في Bosta ليست بالضرورة
   * مساوية لحالة الطلب التجارية عندك.
   *
   * لكننا نسجل bostaState.
   */

  /**
   * ----------------------------------------------------------
   * Timeline
   * ----------------------------------------------------------
   */

  const newTimelineStep =
    buildWebhookTimelineStep(
      state,
      rawState,
      body,
      timeAr
    );

  const updatedTimeline = [
    ...(order.timeline || []),
    newTimelineStep
  ];

  /**
   * ----------------------------------------------------------
   * Updates
   * ----------------------------------------------------------
   */

  const updates:
    Partial<OrderDocument> = {
    status:
      updatedOrderStatus,

    bostaState:
      state,

    updatedAt:
      new Date().toISOString(),

    timeline:
      updatedTimeline
  };

  /**
   * Keep tracking information
   * synchronized if Bosta sends it.
   */

  if (trackingNumber) {
    updates.trackingNumber =
      trackingNumber;

    updates.bostaTrackingNumber =
      trackingNumber;
  }

  if (deliveryId) {
    updates.bostaDeliveryId =
      deliveryId;
  }

  /**
   * ----------------------------------------------------------
   * COD
   * ----------------------------------------------------------
   *
   * Only Delivered = payment collected.
   */

  if (
    state === 'DELIVERED' &&
    isCodOrder(order)
  ) {
    updates.paymentStatus =
      'paid';
  }

  /**
   * ----------------------------------------------------------
   * Optional metadata
   *
   * We use `as any` so this remains compatible
   * with the current OrderDocument interface.
   * ----------------------------------------------------------
   */

  const extraUpdates: any = {
    bostaStateCode:
      getWebhookStateCode(
        rawState
      ),

    bostaLastWebhookAt:
      eventIso,

    bostaWebhookType:
      body.type || undefined,

    bostaBusinessReference:
      businessReference ||
      undefined,

    bostaExceptionReason:
      body.exceptionReason ||
      undefined,

    bostaExceptionCode:
      body.exceptionCode ??
      undefined,

    bostaNumberOfAttempts:
      body.numberOfAttempts ??
      undefined,

    bostaDeliveryPromiseDate:
      body.deliveryPromiseDate ||
      undefined,

    bostaConfirmedDelivery:
      body.isConfirmedDelivery ??
      undefined
  };

  /**
   * Remove undefined values.
   */

  Object.keys(extraUpdates)
    .forEach((key) => {
      if (
        extraUpdates[key] ===
        undefined
      ) {
        delete extraUpdates[key];
      }
    });

  Object.assign(
    updates as any,
    extraUpdates
  );

  /**
   * ----------------------------------------------------------
   * Mongo update
   * ----------------------------------------------------------
   */

  const {
    db,
    isMongo
  } = await getDatabase();

  if (isMongo && db) {
    try {
      await db
        .collection('orders')
        .updateOne(
          {
            id: order.id
          },
          {
            $set:
              updates
          }
        );
    } catch (e) {
      Logger.error(
        '[Bosta Webhook] Failed to update Mongo order:',
        e
      );

      /**
       * We don't return failure here because
       * the webhook should remain safe to retry.
       */
    }
  }

  /**
   * ----------------------------------------------------------
   * Memory DB update
   * ----------------------------------------------------------
   */

  const memIdx =
    memoryDb.orders.findIndex(
      (o) =>
        o.id === order.id
    );

  if (memIdx >= 0) {
    memoryDb.orders[memIdx] = {
      ...memoryDb.orders[memIdx],
      ...updates
    };
  }

  /**
   * ----------------------------------------------------------
   * Notifications
   * ----------------------------------------------------------
   */

  if (
    state === 'DELIVERED'
  ) {
    await createNotification({
      userId:
        order.buyerId,

      recipientId:
        order.buyerId,

      title:
        'تم استلام طلبك بنجاح! 🎊',

      message:
        `نتمنى أن تنال المنتجات التراثية إعجابك! ` +
        `نسعد دائماً بخدمتك في سوق الصعيد.`,

      type:
        'order_status',

      link:
        'orders',

      recipientRole:
        'buyer',

      metadata: {
        orderId:
          order.id,

        orderNumber:
          order.orderNumber,

        status:
          'delivered',

        bostaState:
          state
      }
    });
  }

  /**
   * Notify customer for important exceptions.
   */

  if (
    state === 'EXCEPTION' ||
    state === 'AWAITING_YOUR_ACTION'
  ) {
    await createNotification({
      userId:
        order.buyerId,

      recipientId:
        order.buyerId,

      title:
        'تحديث على شحنتك 📦',

      message:
        mapBostaStateToArabic(
          rawState
        ) +
        (
          body.exceptionReason
            ? `: ${body.exceptionReason}`
            : ''
        ),

      type:
        'order_status',

      link:
        'orders',

      recipientRole:
        'buyer',

      metadata: {
        orderId:
          order.id,

        orderNumber:
          order.orderNumber,

        bostaState:
          state,

        bostaStateCode:
          getWebhookStateCode(
            rawState
          ),

        exceptionCode:
          body.exceptionCode ??
          null
      }
    });
  }

  /**
   * ----------------------------------------------------------
   * Audit log
   * ----------------------------------------------------------
   */

  await addAuditLog({
    userName:
      'نظام الشحن والربط (Bosta)',

    userRole:
      'admin',

    action:
      'تحديث حالة شحنة بوسطة',

    resource:
      'الطلبات',

    resourceId:
      order.id,

    status:
      'نجاح',

    details:
      `تم تحديث الطلب #${order.orderNumber} ` +
      `من Webhook Bosta. ` +
      `State=${rawStateText}, ` +
      `InternalState=${state}, ` +
      `Tracking=${trackingNumber || 'غير موجود'}, ` +
      `BusinessReference=${businessReference || 'غير موجود'}`
  });

  Logger.info(
    `[Bosta Webhook] Order #${order.orderNumber} updated successfully. ` +
    `rawState=${rawStateText}, internalState=${state}, ` +
    `tracking=${trackingNumber}`
  );

  return {
    success: true,

    message:
      `تم تحديث حالة الشحنة إلى ${mapBostaStateToArabic(
        rawState
      )} بنجاح`
  };
}

/**
 * ============================================================
 * WEBHOOK STATE INFORMATION
 * ============================================================
 *
 * Useful for controllers/admin/debugging.
 */

export function getBostaStateInfo(
  state: unknown
): {
  rawState: string;
  code: number | null;
  internalState: BostaInternalState;
  arabic: string;
} {
  const code =
    getWebhookStateCode(
      state
    );

  const internalState =
    mapBostaStateCode(
      state
    );

  return {
    rawState:
      String(state ?? ''),

    code,

    internalState,

    arabic:
      mapBostaStateToArabic(
        state
      )
  };
}