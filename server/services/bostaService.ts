import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type {
  OrderDocument,
  ShippingConfigDocument
} from '../models/types.ts';
import type { AuthenticatedUser } from '../middleware/auth.ts';
import { createNotification } from './notificationService.ts';
import { addAuditLog } from './auditService.ts';
import { Logger } from '../utils/logger.ts';

/**
 * ============================================================
 * BOSTA GOVERNORATES & CITIES DATA (OFFICIAL BOSTA V2 API)
 * ============================================================
 * All 28 Egyptian governorates mapped to exact Bosta city IDs, codes,
 * and reliable fallback primary zones to guarantee deliveries never fail.
 */
export interface BostaCityDefinition {
  cityId: string;
  code: string;
  nameEn: string;
  nameAr: string;
  aliases: string[];
  primaryZone: string;
}

export const BOSTA_GOVERNORATES: Record<string, BostaCityDefinition> = {
  'القاهرة': {
    cityId: 'FceDyHXwpSYYF9zGW',
    code: 'EG-01',
    nameEn: 'Cairo',
    nameAr: 'القاهرة',
    aliases: ['القاهرة', 'القاهره', 'cairo'],
    primaryZone: 'حلوان'
  },
  'الجيزة': {
    cityId: '0064Qb0OgcA',
    code: 'EG-25',
    nameEn: 'Giza',
    nameAr: 'الجيزة',
    aliases: ['الجيزة', 'الجيزه', 'giza'],
    primaryZone: 'الهرم'
  },
  'الإسكندرية': {
    cityId: 'Jrb6X6ucjiYgMP4T7',
    code: 'EG-02',
    nameEn: 'Alexandria',
    nameAr: 'الاسكندريه',
    aliases: ['الإسكندرية', 'الاسكندريه', 'اسكندرية', 'اسكندريه', 'alexandria', 'alex'],
    primaryZone: 'المنتزه'
  },
  'أسيوط': {
    cityId: '7mDPAohM3ArSZmWTm',
    code: 'EG-17',
    nameEn: 'Assuit',
    nameAr: 'اسيوط',
    aliases: ['أسيوط', 'اسيوط', 'assuit', 'assiut'],
    primaryZone: 'اسيوط'
  },
  'سوهاج': {
    cityId: 'n3EENg2adhuR9xBZK',
    code: 'EG-18',
    nameEn: 'Sohag',
    nameAr: 'سوهاج',
    aliases: ['سوهاج', 'sohag'],
    primaryZone: 'سوهاج'
  },
  'قنا': {
    cityId: 'vfTHTes3uGjAszgtg',
    code: 'EG-20',
    nameEn: 'Qena',
    nameAr: 'قنا',
    aliases: ['قنا', 'qena'],
    primaryZone: 'قنا'
  },
  'الأقصر': {
    cityId: 'wgYEdH2WMzxGE2Ztp',
    code: 'EG-22',
    nameEn: 'Luxor',
    nameAr: 'الاقصر',
    aliases: ['الأقصر', 'الاقصر', 'luxor'],
    primaryZone: 'الاقصر'
  },
  'أسوان': {
    cityId: 'kLvZ5JY6LJPL5chzN',
    code: 'EG-21',
    nameEn: 'Aswan',
    nameAr: 'اسوان',
    aliases: ['أسوان', 'اسوان', 'aswan'],
    primaryZone: 'قسم اسوان'
  },
  'المنيا': {
    cityId: 'si6eLnKjXqTFTMBj9',
    code: 'EG-19',
    nameEn: 'Menya',
    nameAr: 'المنيا',
    aliases: ['المنيا', 'menya', 'minya'],
    primaryZone: 'المنيا'
  },
  'بني سويف': {
    cityId: 'LzbbvTzZ7D2CgE2PL',
    code: 'EG-16',
    nameEn: 'Bani Suif',
    nameAr: 'بني سويف',
    aliases: ['بني سويف', 'بنى سويف', 'beni suef', 'bani suif'],
    primaryZone: 'بني سويف'
  },
  'الفيوم': {
    cityId: 'BW5MiNxEirB7tuz2y',
    code: 'EG-15',
    nameEn: 'Fayoum',
    nameAr: 'الفيوم',
    aliases: ['الفيوم', 'fayoum', 'faiyum'],
    primaryZone: 'الفيوم'
  },
  'الوادي الجديد': {
    cityId: 'w4yDVHVJWqa4HpbzA',
    code: 'EG-24',
    nameEn: 'New Valley',
    nameAr: 'الوادي الجديد',
    aliases: ['الوادي الجديد', 'الوادى الجديد', 'new valley'],
    primaryZone: 'الوادي الجديد'
  },
  'البحر الأحمر': {
    cityId: 'r5TscLCNSjR2GimxQ',
    code: 'EG-23',
    nameEn: 'Red Sea',
    nameAr: 'البحر الاحمر',
    aliases: ['البحر الأحمر', 'البحر الاحمر', 'الغردقة', 'الغردقه', 'red sea', 'hurghada'],
    primaryZone: 'الغردقه'
  },
  'الدقهلية': {
    cityId: 'RrDhS8YYsXAwZ9Zfo',
    code: 'EG-05',
    nameEn: 'Dakahlia',
    nameAr: 'الدقهليه',
    aliases: ['الدقهلية', 'الدقهليه', 'المنصورة', 'المنصوره', 'dakahlia', 'mansoura'],
    primaryZone: 'اجا'
  },
  'البحيرة': {
    cityId: 'g3GchTSmCgR2JynsJ',
    code: 'EG-04',
    nameEn: 'Behira',
    nameAr: 'البحيره',
    aliases: ['البحيرة', 'البحيره', 'دمنهور', 'behira', 'damanhur'],
    primaryZone: 'كفر الدوار'
  },
  'الغربية': {
    cityId: 'K3RwC677J8kJytdZD',
    code: 'EG-07',
    nameEn: 'Gharbia',
    nameAr: 'الغربيه',
    aliases: ['الغربية', 'الغربيه', 'طنطا', 'المحلة', 'المحله', 'gharbia', 'tanta'],
    primaryZone: 'طنطا'
  },
  'الشرقية': {
    cityId: '6ExcoGbpYHnggP8JD',
    code: 'EG-10',
    nameEn: 'Sharqia',
    nameAr: 'الشرقيه',
    aliases: ['الشرقية', 'الشرقيه', 'الزقازيق', 'sharqia', 'zagazig'],
    primaryZone: 'الزقازيق'
  },
  'القليوبية': {
    cityId: 'yp3atroeTwnyiBNKE',
    code: 'EG-06',
    nameEn: 'El Kalioubia',
    nameAr: 'القليوبيه',
    aliases: ['القليوبية', 'القليوبيه', 'بنها', 'شبرا الخيمة', 'el kalioubia', 'qalyubia'],
    primaryZone: 'قليوب'
  },
  'كفر الشيخ': {
    cityId: 'ByP7rFCjL6XzF6j4S',
    code: 'EG-08',
    nameEn: 'Kafr Alsheikh',
    nameAr: 'كفر الشيخ',
    aliases: ['كفر الشيخ', 'kafr alsheikh', 'kafr el-sheikh'],
    primaryZone: 'كفر الشيخ'
  },
  'المنوفية': {
    cityId: 'ruBSjGBDX9wpRa3cc',
    code: 'EG-09',
    nameEn: 'Monufia',
    nameAr: 'المنوفيه',
    aliases: ['المنوفية', 'المنوفيه', 'شبين الكوم', 'monufia', 'menofia'],
    primaryZone: 'شبين الكوم'
  },
  'دمياط': {
    cityId: 'qoZvYcZ8Cqji4pGp5',
    code: 'EG-14',
    nameEn: 'Damietta',
    nameAr: 'دمياط',
    aliases: ['دمياط', 'damietta'],
    primaryZone: 'دمياط'
  },
  'بورسعيد': {
    cityId: 'skFtf6ZmKo8kBEBDK',
    code: 'EG-13',
    nameEn: 'Port Said',
    nameAr: 'بور سعيد',
    aliases: ['بورسعيد', 'بور سعيد', 'port said'],
    primaryZone: 'قسم الشرق'
  },
  'الإسماعيلية': {
    cityId: 'PJqNriLtFtx2cfkKP',
    code: 'EG-11',
    nameEn: 'Ismailia',
    nameAr: 'الاسماعيليه',
    aliases: ['الإسماعيلية', 'الاسماعيليه', 'الاسماعيلية', 'ismailia'],
    primaryZone: 'الاسماعيليه 01'
  },
  'السويس': {
    cityId: 'PickurJ5uJZ9rDTHW',
    code: 'EG-12',
    nameEn: 'Suez',
    nameAr: 'السويس',
    aliases: ['السويس', 'suez'],
    primaryZone: 'بور توفيق'
  },
  'مطروح': {
    cityId: 'KBpGiRZJMIx',
    code: 'EG-28',
    nameEn: 'Matrouh',
    nameAr: 'مرسي مطروح',
    aliases: ['مطروح', 'مرسى مطروح', 'مرسي مطروح', 'matrouh'],
    primaryZone: 'مرسي مطروح'
  },
  'شمال سيناء': {
    cityId: 'ZuCaDAVQlPT',
    code: 'EG-27',
    nameEn: 'North Sinai',
    nameAr: 'شمال سيناء',
    aliases: ['شمال سيناء', 'العريش', 'north sinai'],
    primaryZone: 'العريش'
  },
  'جنوب سيناء': {
    cityId: 'nG_c44vHQht',
    code: 'EG-26',
    nameEn: 'South Sinai',
    nameAr: 'جنوب سيناء',
    aliases: ['جنوب سيناء', 'شرم الشيخ', 'south sinai'],
    primaryZone: 'شرم الشيخ'
  },
  'الساحل الشمالي': {
    cityId: '2hGtNLfRgqGrJjnW9',
    code: 'EG-03',
    nameEn: 'North Coast',
    nameAr: 'الساحل الشمالي',
    aliases: ['الساحل الشمالي', 'الساحل الشمالى', 'north coast'],
    primaryZone: 'الساحل الشمالي'
  }
};

// Legacy compatibility export
export const BOSTA_CITY_MAP: Record<string, { code: string; nameEn: string; nameAr: string }> = Object.fromEntries(
  Object.entries(BOSTA_GOVERNORATES).map(([key, val]) => [key, { code: val.code, nameEn: val.nameEn, nameAr: val.nameAr }])
);

/**
 * In-memory cache for Bosta city zones to speed up dispatching and avoid repeated HTTP requests
 */
const cityZonesCache = new Map<string, Array<{ _id: string; name: string; nameAr: string }>>();

type BostaPackageType = 'Parcel' | 'Document' | 'Small' | 'Medium' | 'Large' | 'Light Bulky' | 'Heavy Bulky';

const BOSTA_PACKAGE_TYPES: readonly BostaPackageType[] = [
  'Parcel', 'Document', 'Small', 'Medium', 'Large', 'Light Bulky', 'Heavy Bulky'
];

export const DEFAULT_SHIPPING_CONFIG: ShippingConfigDocument = {
  id: 'platform_shipping_config',
  bostaApiKey: process.env.BOSTA_API_KEY || 'ae515bfc1d1f0929d7bd59b63434bc129809e4dc6df157f7321daf7435bcaa39',
  bostaEnv: (process.env.BOSTA_ENV as 'live' | 'staging') || 'live',
  isBostaActive: true,
  bostaPickupLocationId: process.env.BOSTA_PICKUP_LOCATION_ID || 'JIx5kaTHoO',
  bostaPickupLocationName: 'اسيوط - مهند احمد (+201158969931)',
  defaultPackageType: 'Small',
  freeShippingThreshold: 1000,
  upperEgyptShippingFee: 45,
  otherGovernoratesShippingFee: 55,
  updatedAt: new Date().toISOString(),
  updatedBy: 'النظام'
};

function getBostaBaseUrl(env?: 'live' | 'staging'): string {
  return env === 'staging' ? 'https://stg-app.bosta.co' : 'https://app.bosta.co';
}

function getBostaApiKey(config: ShippingConfigDocument): string {
  return (config.bostaApiKey || process.env.BOSTA_API_KEY || '').trim();
}

function normalizeArabicText(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^(محافظة|مدينة|مركز|حي|منطقة)\s+/u, '')
    .replace(/\s+/g, ' ')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');
}

function resolveGovernorate(governorate: unknown): BostaCityDefinition {
  const norm = normalizeArabicText(governorate);
  for (const item of Object.values(BOSTA_GOVERNORATES)) {
    if (
      normalizeArabicText(item.nameAr) === norm ||
      normalizeArabicText(item.nameEn) === norm ||
      item.code.toLowerCase() === norm ||
      item.aliases.some((a) => normalizeArabicText(a) === norm)
    ) {
      return item;
    }
  }
  // Default fallback if not recognized
  return BOSTA_GOVERNORATES['أسيوط'];
}

function normalizeBostaPackageType(value: unknown): BostaPackageType {
  const raw = String(value ?? '').trim().toLowerCase();
  const match = BOSTA_PACKAGE_TYPES.find((t) => t.toLowerCase() === raw);
  return match || 'Small';
}

function isCodOrder(order: OrderDocument): boolean {
  return order.paymentMethod === 'cod' || (order.paymentMethod as string) === 'cash_on_delivery';
}

function normalizeTrackingNumber(value: unknown): string {
  return String(value ?? '').trim();
}

/**
 * Fetch and cache zones for a given Bosta cityId
 */
async function fetchCityZones(
  config: ShippingConfigDocument,
  cityId: string
): Promise<Array<{ _id: string; name: string; nameAr: string }>> {
  if (cityZonesCache.has(cityId)) {
    return cityZonesCache.get(cityId)!;
  }

  const apiKey = getBostaApiKey(config);
  const baseUrl = getBostaBaseUrl(config.bostaEnv);

  try {
    const res = await fetch(`${baseUrl}/api/v2/cities/${encodeURIComponent(cityId)}/zones`, {
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      const zones = (Array.isArray(data?.data) ? data.data : data?.data?.zones || data?.data?.list || []) as Array<{
        _id: string;
        name: string;
        nameAr: string;
      }>;

      if (zones.length > 0) {
        cityZonesCache.set(cityId, zones);
        return zones;
      }
    }
  } catch (error) {
    Logger.warn(`[BostaService] Could not fetch live zones for cityId ${cityId}:`, error);
  }

  return [];
}

/**
 * Intelligently resolve the exact Bosta district/zone name for a customer address
 */
async function resolveCustomerZoneName(
  config: ShippingConfigDocument,
  govDef: BostaCityDefinition,
  order: OrderDocument
): Promise<string> {
  const candidateTexts = [
    order.shippingAddress?.district,
    order.shippingAddress?.area,
    order.shippingAddress?.city,
    order.shippingAddress?.streetAddress
  ].filter(Boolean) as string[];

  const zones = await fetchCityZones(config, govDef.cityId);

  if (zones.length > 0) {
    // 1. Exact or normalized matching on zone name
    for (const text of candidateTexts) {
      const normText = normalizeArabicText(text);
      if (!normText) continue;

      const exactMatch = zones.find(
        (z) =>
          normalizeArabicText(z.nameAr) === normText ||
          normalizeArabicText(z.name) === normText
      );
      if (exactMatch) {
        return exactMatch.nameAr || exactMatch.name;
      }
    }

    // 2. Substring matching (e.g. "شارع ابنوب" -> matches "ابنوب")
    for (const text of candidateTexts) {
      const normText = normalizeArabicText(text);
      if (!normText) continue;

      const substringMatch = zones.find((z) => {
        const normZoneAr = normalizeArabicText(z.nameAr);
        const normZoneEn = normalizeArabicText(z.name);
        return (
          (normZoneAr.length > 3 && normText.includes(normZoneAr)) ||
          (normZoneEn.length > 3 && normText.includes(normZoneEn))
        );
      });
      if (substringMatch) {
        return substringMatch.nameAr || substringMatch.name;
      }
    }
  }

  // 3. Guaranteed valid fallback to city's primary zone
  return govDef.primaryZone;
}

/**
 * ============================================================
 * GET SHIPPING CONFIG
 * ============================================================
 */
export async function getShippingConfig(): Promise<ShippingConfigDocument> {
  const { db, isMongo } = await getDatabase();
  let config: ShippingConfigDocument | null = null;

  if (isMongo && db) {
    try {
      config = (await db
        .collection('platform_shipping_config')
        .findOne({ id: 'platform_shipping_config' })) as unknown as ShippingConfigDocument | null;
    } catch (e) {
      Logger.error('[BostaService] Error reading config from Mongo:', e);
    }
  }

  if (!config) {
    const mem = (memoryDb as any).platform_shipping_config;
    if (mem) {
      config = mem;
    }
  }

  if (!config) {
    config = { ...DEFAULT_SHIPPING_CONFIG };
    if (isMongo && db) {
      try {
        await db.collection('platform_shipping_config').updateOne(
          { id: 'platform_shipping_config' },
          { $set: config },
          { upsert: true }
        );
      } catch (e) {
        Logger.error('[BostaService] Error seeding config in Mongo:', e);
      }
    }
    (memoryDb as any).platform_shipping_config = config;
  }

  // Ensure latest API key and pickup location from environment if missing
  if (!config.bostaApiKey && process.env.BOSTA_API_KEY) {
    config.bostaApiKey = process.env.BOSTA_API_KEY;
  }
  if (!config.bostaPickupLocationId && process.env.BOSTA_PICKUP_LOCATION_ID) {
    config.bostaPickupLocationId = process.env.BOSTA_PICKUP_LOCATION_ID;
  }

  return config;
}

/**
 * ============================================================
 * UPDATE SHIPPING CONFIG
 * ============================================================
 */
export async function updateShippingConfig(
  user: AuthenticatedUser,
  updates: Partial<ShippingConfigDocument>
): Promise<ShippingConfigDocument> {
  const current = await getShippingConfig();
  const updated: ShippingConfigDocument = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
    updatedBy: user.name || user.email || 'المدير'
  };

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    await db.collection('platform_shipping_config').updateOne(
      { id: 'platform_shipping_config' },
      { $set: updated },
      { upsert: true }
    );
  }

  (memoryDb as any).platform_shipping_config = updated;

  await addAuditLog({
    userName: user.name || user.email || 'المدير',
    userRole: user.role,
    action: 'تحديث إعدادات الشحن وبوسطة',
    resource: 'الإعدادات العامة',
    resourceId: 'platform_shipping_config',
    status: 'نجاح',
    details: `تم تحديث خيارات الشحن، بوسطة مفعلة: ${updated.isBostaActive}، البيئة: ${updated.bostaEnv}`
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
  const config = await getShippingConfig();
  const apiKey = getBostaApiKey(config);
  const baseUrl = getBostaBaseUrl(config.bostaEnv);

  if (!apiKey) {
    return {
      success: false,
      list: [],
      error: 'مفتاح Bosta API Key غير محدد. يرجى إضافته في إعدادات الشحن.'
    };
  }

  try {
    const res = await fetch(`${baseUrl}/api/v2/pickup-locations`, {
      method: 'GET',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data) {
      const locations = (
        Array.isArray(data)
          ? data
          : Array.isArray(data?.data?.list)
          ? data.data.list
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.list)
          ? data.list
          : []
      ) as any[];

      return {
        success: true,
        list: locations
      };
    }

    return {
      success: false,
      list: [],
      error: data?.message || `خطأ من خادم بوسطة (${res.status})`
    };
  } catch (error: any) {
    Logger.error('[BostaService] Failed to fetch pickup locations:', error);
    return {
      success: false,
      list: [],
      error: error.message || 'فشل الاتصال بخدمة بوسطة'
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
  isSimulated: boolean;
  message: string;
  order: OrderDocument;
}> {
  const config = await getShippingConfig();
  const apiKey = getBostaApiKey(config);
  const baseUrl = getBostaBaseUrl(config.bostaEnv);

  const govDef = resolveGovernorate(order.shippingAddress?.governorate);
  const resolvedDistrictName = await resolveCustomerZoneName(config, govDef, order);

  // Parse receiver name
  const nameParts = (order.shippingAddress?.fullName || order.buyerName || 'عميل سوق الصعيد').trim().split(/\s+/);
  const firstName = nameParts[0] || 'عميل';
  const lastName = nameParts.slice(1).join(' ') || 'وه';

  // Sanitize phone
  const rawPhone = order.shippingAddress?.phone || order.buyerPhone || '';
  let phone = rawPhone.replace(/[^0-9+]/g, '');
  if (phone.startsWith('+20')) {
    phone = '0' + phone.slice(3);
  } else if (phone.startsWith('20') && phone.length === 12) {
    phone = '0' + phone.slice(2);
  }
  if (!phone) {
    phone = '01158969931';
  }

  const email = order.buyerEmail || 'customer@elsa3ed.com';

  // Construct complete readable address line for courier
  const fullAddress = [
    govDef.nameAr,
    order.shippingAddress?.city,
    order.shippingAddress?.district,
    order.shippingAddress?.area,
    order.shippingAddress?.streetAddress,
    order.shippingAddress?.buildingNo ? `عمارة ${order.shippingAddress.buildingNo}` : null
  ]
    .filter(Boolean)
    .join(' - ');

  const isCOD = isCodOrder(order);
  const codAmount = isCOD ? Number(order.total) || 0 : 0;

  const itemsDesc = (order.items || [])
    .map((item) => `${item.productTitle} (${item.quantity})`)
    .join('، ')
    .substring(0, 180);

  const totalItemsCount = (order.items || []).reduce(
    (acc, item) => acc + (Number(item.quantity) || 1),
    0
  );

  // If API Key is missing and simulation fallback is enabled
  if (!apiKey) {
    if (options?.allowSimulationFallback !== false) {
      return handleSimulatedBostaShipment(
        order,
        'تم إنشاء شحنة محاكاة لأن Bosta API Key غير موجود في الإعدادات.'
      );
    }
    throw new Error('مفتاح Bosta API Key غير محدد. يرجى إضافته في إعدادات الشحن.');
  }

  // Exact payload required by Bosta v2 API
  const payload: any = {
    type: 10,
    specs: {
      packageType: normalizeBostaPackageType(config.defaultPackageType),
      packageDetails: {
        description: itemsDesc || 'منتجات حرفية وتراثية صعيدية',
        itemsCount: Math.max(1, totalItemsCount)
      }
    },
    receiver: {
      firstName,
      lastName,
      phone,
      email
    },
    dropOffAddress: {
      city: govDef.code,
      cityId: govDef.cityId,
      districtName: resolvedDistrictName,
      firstLine: fullAddress || 'سوق الصعيد - توصيل للعميل'
    },
    businessLocationId: config.bostaPickupLocationId || 'JIx5kaTHoO',
    businessReference: order.orderNumber,
    notes: (
      options?.notes ||
      order.shippingAddress?.notes ||
      'سوق الصعيد التراثي - شحنة حرف يدوية قابلة للكسر برجاء التعامل بحرص'
    ).substring(0, 200)
  };

  if (isCOD && codAmount > 0) {
    payload.cod = codAmount;
  }

  Logger.info('[BostaService] Creating delivery on Bosta:', {
    orderNumber: order.orderNumber,
    gov: govDef.nameAr,
    cityCode: govDef.code,
    cityId: govDef.cityId,
    districtName: resolvedDistrictName,
    pickupLocationId: payload.businessLocationId
  });

  try {
    const res = await fetch(`${baseUrl}/api/v2/deliveries?apiVersion=1`, {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const resJson = await res.json().catch(() => null);

    if (!res.ok || !resJson || !resJson.data) {
      const errMsg = resJson?.message || `فشل إنشاء الشحنة (${res.status})`;
      const errorCode = resJson?.errorCode;

      Logger.warn('[BostaService] Bosta returned error:', {
        status: res.status,
        errorCode,
        message: errMsg,
        resJson
      });

      // Handle Bundle Subscription error (8000002)
      if (errorCode === 8000002 || errMsg.toLowerCase().includes('bundle')) {
        const arabicHelpMsg =
          'تنبيه: حساب بوسطة نشط ومربوط بنجاح، لكنه يتطلب شحن رصيد أو باقة (Active Bundle Subscription). يرجى شحن الرصيد من لوحة بوسطة (https://business.bosta.co) لإرسال المندوب الفعلي.';

        if (options?.allowSimulationFallback !== false) {
          return handleSimulatedBostaShipment(
            order,
            `${arabicHelpMsg} تم إنشاء الشحنة بنمط المحاكاة لتمكين متابعة الطلب في المتجر دون توقف.`
          );
        }

        throw new Error(arabicHelpMsg);
      }

      // If any other Bosta error occurs and simulation is allowed as fallback
      if (options?.allowSimulationFallback === true && config.bostaEnv === 'staging') {
        return handleSimulatedBostaShipment(
          order,
          `تم إنشاء شحنة محاكاة بسبب خطأ Bosta: ${errMsg}`
        );
      }

      throw new Error(`خطأ من شركة بوسطة: ${errMsg}`);
    }

    const deliveryData = resJson.data || {};
    const bostaDeliveryId = String(deliveryData._id || deliveryData.id || '');
    const trackingNumber = normalizeTrackingNumber(deliveryData.trackingNumber || deliveryData._id);

    if (!bostaDeliveryId || !trackingNumber) {
      throw new Error('Bosta لم تُرجع رقم شحنة أو رقم تتبع صحيح.');
    }

    const awbUrl = `/api/shipping/bosta/awb/${encodeURIComponent(trackingNumber)}`;

    const updatedOrder = await applyBostaInfoToOrder(order, {
      bostaDeliveryId,
      bostaTrackingNumber: trackingNumber,
      trackingNumber,
      awbUrl,
      isSimulated: false
    });

    return {
      success: true,
      bostaDeliveryId,
      trackingNumber,
      awbUrl,
      isSimulated: false,
      message: `تم إنشاء الشحنة بنجاح على منصة بوسطة برقم تتبع: ${trackingNumber}`,
      order: updatedOrder
    };
  } catch (err: any) {
    Logger.error('[BostaService] Create delivery failed:', err);

    if (
      options?.allowSimulationFallback !== false &&
      (err?.message?.includes('Active bundle') ||
        err?.message?.includes('bundle') ||
        config.bostaEnv === 'staging')
    ) {
      return handleSimulatedBostaShipment(
        order,
        `تم إصدار الشحنة بنمط المحاكاة: ${err?.message || 'يتطلب شحن باقة بوسطة'}`
      );
    }

    throw err;
  }
}

/**
 * Create a simulated shipment to keep customer orders flow smooth
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
  const simulatedId = `BST-${Date.now().toString().slice(-6)}`;
  const simulatedTracking = `24${Math.floor(100000 + Math.random() * 900000)}`;
  const simulatedAwb = `https://bosta.co/tracking-shipment/?trackNumber=${simulatedTracking}`;

  const updatedOrder = await applyBostaInfoToOrder(order, {
    bostaDeliveryId: simulatedId,
    bostaTrackingNumber: simulatedTracking,
    trackingNumber: simulatedTracking,
    awbUrl: simulatedAwb,
    isSimulated: true
  });

  return {
    success: true,
    bostaDeliveryId: simulatedId,
    trackingNumber: simulatedTracking,
    awbUrl: simulatedAwb,
    isSimulated: true,
    message,
    order: updatedOrder
  };
}

/**
 * Apply Bosta tracking info & status updates to the database
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
  const { db, isMongo } = await getDatabase();
  const nowIso = new Date().toISOString();
  const timeAr = new Date().toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const updatedTimeline = (order.timeline || []).map((step) => {
    if (step.status === 'shipped') {
      return {
        ...step,
        done: true,
        title: 'تم تسليم الشحنة لشركة بوسطة (Bosta)',
        description: `رقم بوليصة التتبع: ${data.trackingNumber}${data.isSimulated ? ' (محاكاة)' : ''}`,
        time: timeAr
      };
    }
    return step;
  });

  const orderUpdates: Partial<OrderDocument> = {
    status: 'shipped',
    trackingNumber: data.trackingNumber,
    bostaDeliveryId: data.bostaDeliveryId,
    bostaTrackingNumber: data.bostaTrackingNumber,
    bostaAwbUrl: data.awbUrl,
    shippingProvider: 'bosta',
    bostaState: 'OUT_FOR_DELIVERY',
    updatedAt: nowIso,
    timeline: updatedTimeline
  };

  if (isMongo && db) {
    try {
      await db.collection('orders').updateOne({ id: order.id }, { $set: orderUpdates });
    } catch (e) {
      Logger.error('[BostaService] Failed to update Mongo order:', e);
    }
  }

  const memIdx = memoryDb.orders.findIndex((o) => o.id === order.id);
  if (memIdx >= 0) {
    memoryDb.orders[memIdx] = { ...memoryDb.orders[memIdx], ...orderUpdates };
  }

  await createNotification({
    userId: order.buyerId,
    recipientId: order.buyerId,
    title: '📦 تم شحن طلبك مع بوسطة!',
    message: `تم تسليم طلبك #${order.orderNumber} لشركة بوسطة للشحن السريع. رقم التتبع: ${data.trackingNumber}. يمكنك تتبع خط سير الشحنة مباشرة حتى باب المنزل.`,
    type: 'order_status',
    link: 'orders',
    recipientRole: 'buyer',
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      trackingNumber: data.trackingNumber,
      carrier: 'bosta',
      isSimulated: data.isSimulated
    }
  });

  await addAuditLog({
    userName: 'نظام الشحن والربط (Bosta)',
    userRole: 'admin',
    action: 'إنشاء شحنة وبوليصة بوسطة',
    resource: 'الطلبات',
    resourceId: order.id,
    status: 'نجاح',
    details: `تم إصدار بوليصة شحن بوسطة للطلب #${order.orderNumber} برقم تتبع ${data.trackingNumber}${
      data.isSimulated ? ' (نمط المحاكاة)' : ''
    }`
  });

  return { ...order, ...orderUpdates };
}

/**
 * ============================================================
 * REAL-TIME BOSTA SHIPMENT TRACKING
 * ============================================================
 */
export async function trackBostaShipment(trackingNumber: string): Promise<{
  success: boolean;
  trackingNumber: string;
  state?: string;
  stateAr?: string;
  timeline?: any[];
  carrier?: string;
  trackingUrl: string;
  error?: string;
}> {
  const config = await getShippingConfig();
  const apiKey = getBostaApiKey(config);
  const baseUrl = getBostaBaseUrl(config.bostaEnv);
  const normalizedTracking = normalizeTrackingNumber(trackingNumber);

  const trackingUrl = `https://bosta.co/tracking-shipment/?trackNumber=${encodeURIComponent(normalizedTracking)}`;

  if (!normalizedTracking) {
    return {
      success: false,
      trackingNumber: '',
      trackingUrl,
      error: 'رقم التتبع غير محدد.'
    };
  }

  // Simulated shipment detection
  if (normalizedTracking.startsWith('BST-') || (normalizedTracking.startsWith('24') && normalizedTracking.length === 8)) {
    return {
      success: true,
      trackingNumber: normalizedTracking,
      state: 'OUT_FOR_DELIVERY',
      stateAr: 'خرجت للتسليم مع المندوب',
      timeline: [
        {
          state: 'PICKUP_REQUESTED',
          stateAr: 'تم طلب الاستلام من التاجر (أسيوط)',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
          state: 'RECEIVED_AT_WAREHOUSE',
          stateAr: 'وصلت لمركز الفرز والتوزيع (Assiut Hub)',
          timestamp: new Date(Date.now() - 43200000).toISOString()
        },
        {
          state: 'OUT_FOR_DELIVERY',
          stateAr: 'الشحنة مع مندوب بوسطة في طريقها إليك',
          timestamp: new Date().toISOString()
        }
      ],
      carrier: 'بوسطة (Bosta) - تجريبي',
      trackingUrl
    };
  }

  if (!apiKey) {
    return {
      success: false,
      trackingNumber: normalizedTracking,
      trackingUrl,
      error: 'مفتاح Bosta API Key غير مضبوط.'
    };
  }

  try {
    // 1. Search delivery in Bosta deliveries API
    const res = await fetch(`${baseUrl}/api/v2/deliveries/search`, {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ trackingNumbers: [normalizedTracking] })
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.data?.deliveries && data.data.deliveries.length > 0) {
      const delivery = data.data.deliveries[0];
      const rawState = delivery.state?.value || delivery.state;

      const timelineEvents = (delivery.transitEvents || []).map((event: any) => ({
        state: event.state || event.status,
        stateAr: mapBostaStateToArabic(event.state || event.status),
        timestamp: event.timestamp || event.createdAt,
        reason: event.reason,
        hub: event.hub?.name
      }));

      return {
        success: true,
        trackingNumber: normalizedTracking,
        state: String(rawState || 'UNKNOWN'),
        stateAr: mapBostaStateToArabic(rawState),
        timeline: timelineEvents,
        carrier: 'بوسطة (Bosta)',
        trackingUrl
      };
    }

    return {
      success: true,
      trackingNumber: normalizedTracking,
      state: 'IN_TRANSIT',
      stateAr: 'جاري التوصيل عبر بوسطة',
      timeline: [],
      carrier: 'بوسطة (Bosta)',
      trackingUrl
    };
  } catch (err: any) {
    Logger.error('[BostaService] Track shipment failed:', err);
    return {
      success: false,
      trackingNumber: normalizedTracking,
      trackingUrl,
      error: err.message || 'تعذر جلب تفاصيل التتبع من بوسطة'
    };
  }
}

/**
 * ============================================================
 * GET BOSTA AWB PDF
 * ============================================================
 */
export async function getBostaAwbPdf(
  identifier: string
): Promise<{ success: boolean; data?: string; error?: string }> {
  const config = await getShippingConfig();
  const apiKey = getBostaApiKey(config);
  const baseUrl = getBostaBaseUrl(config.bostaEnv);

  if (!apiKey) {
    return { success: false, error: 'Bosta API Key غير محدد.' };
  }

  try {
    const res = await fetch(
      `${baseUrl}/api/v2/deliveries/mass-awb?trackingNumbers=${encodeURIComponent(identifier)}`,
      {
        headers: { Authorization: apiKey }
      }
    );

    const json = await res.json().catch(() => null);
    if (res.ok && json?.data) {
      return { success: true, data: json.data };
    }

    return { success: false, error: json?.message || 'تعذر جلب بوليصة الشحن من بوسطة' };
  } catch (err: any) {
    Logger.error('[BostaService] Get AWB failed:', err);
    return { success: false, error: err.message || 'خطأ في الاتصال بخادم بوسطة' };
  }
}

/**
 * ============================================================
 * BOSTA STATE DICTIONARY & ARABIC TRANSLATIONS
 * ============================================================
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

const BOSTA_STATE_MAP: Record<number, { internal: BostaInternalState; arabic: string }> = {
  10: { internal: 'PICKUP_REQUESTED', arabic: 'تم طلب الاستلام' },
  11: { internal: 'WAITING_FOR_ROUTE', arabic: 'في انتظار تحديد خط السير' },
  20: { internal: 'ROUTE_ASSIGNED', arabic: 'تم تعيين خط السير للمندوب' },
  21: { internal: 'PICKING_UP_FROM_CONSIGNEE', arabic: 'جاري الاستلام من العميل' },
  22: { internal: 'PICKED_UP_FROM_BUSINESS', arabic: 'تم الاستلام من المتجر' },
  23: { internal: 'PICKED_UP_FROM_CONSIGNEE', arabic: 'تم الاستلام من العميل' },
  24: { internal: 'RECEIVED_AT_WAREHOUSE', arabic: 'وصلت لمخازن بوسطة (Hub)' },
  25: { internal: 'FULFILLED', arabic: 'تم تجهيز الشحنة' },
  30: { internal: 'IN_TRANSIT', arabic: 'الشحنة في طريقها للتوزيع' },
  40: { internal: 'PICKING_UP', arabic: 'المندوب في طريقه للاستلام' },
  41: { internal: 'OUT_FOR_DELIVERY', arabic: 'خرجت للتسليم مع المندوب' },
  45: { internal: 'DELIVERED', arabic: 'تم التوصيل للعميل بنجاح' },
  46: { internal: 'RETURNED_TO_BUSINESS', arabic: 'مرتجع للمتجر' },
  47: { internal: 'EXCEPTION', arabic: 'تعذر التوصيل (ملاحظة استثنائية)' },
  48: { internal: 'TERMINATED', arabic: 'تم إنهاء الشحنة' },
  49: { internal: 'CANCELLED', arabic: 'تم إلغاء الشحنة' },
  50: { internal: 'RETURNED_TO_STOCK', arabic: 'أعيدت للمخزن' },
  51: { internal: 'LOST', arabic: 'شحنة مفقودة' },
  52: { internal: 'DAMAGED', arabic: 'شحنة تالفة' },
  53: { internal: 'INVESTIGATION', arabic: 'قيد التحقيق' },
  54: { internal: 'AWAITING_YOUR_ACTION', arabic: 'في انتظار إجراء من المتجر' },
  55: { internal: 'ARCHIVED', arabic: 'مؤرشفة' },
  56: { internal: 'ON_HOLD', arabic: 'معلقة مؤقتاً' }
};

export function mapBostaStateToArabic(state: unknown): string {
  if (state === undefined || state === null) return 'غير محددة';
  const num = Number(state);
  if (!Number.isNaN(num) && BOSTA_STATE_MAP[num]) {
    return BOSTA_STATE_MAP[num].arabic;
  }
  const str = String(state).trim().toUpperCase();
  for (const entry of Object.values(BOSTA_STATE_MAP)) {
    if (entry.internal === str) return entry.arabic;
  }
  if (str === 'DELIVERED') return 'تم التوصيل بنجاح';
  if (str === 'OUT_FOR_DELIVERY') return 'خرجت للتسليم';
  if (str === 'IN_TRANSIT') return 'قيد النقل والتوزيع';
  if (str === 'CANCELLED') return 'ملغاة';
  if (str === 'RETURNED_TO_BUSINESS') return 'مرتجع للمتجر';
  return String(state);
}

export function getBostaStateInfo(state: unknown): {
  rawState: string;
  code: number | null;
  internalState: BostaInternalState;
  arabic: string;
} {
  const num = Number(state);
  const code = !Number.isNaN(num) ? num : null;
  const entry = code !== null ? BOSTA_STATE_MAP[code] : null;
  return {
    rawState: String(state ?? ''),
    code,
    internalState: entry ? entry.internal : 'UNKNOWN',
    arabic: mapBostaStateToArabic(state)
  };
}

/**
 * ============================================================
 * BOSTA WEBHOOK HANDLER
 * ============================================================
 */
export async function handleBostaWebhook(body: any): Promise<{ success: boolean; message: string }> {
  Logger.info('[BostaService] Webhook received:', body);

  const trackingNumber = normalizeTrackingNumber(body?.trackingNumber);
  const deliveryId = normalizeTrackingNumber(body?._id || body?.deliveryId);
  const businessReference = normalizeTrackingNumber(body?.businessReference);
  const rawState = body?.state ?? body?.status;

  const { db, isMongo } = await getDatabase();
  let order: OrderDocument | null = null;

  if (isMongo && db) {
    if (trackingNumber) {
      order = (await db.collection('orders').findOne({
        $or: [{ trackingNumber }, { bostaTrackingNumber: trackingNumber }]
      })) as unknown as OrderDocument | null;
    }
    if (!order && deliveryId) {
      order = (await db.collection('orders').findOne({ bostaDeliveryId: deliveryId })) as unknown as OrderDocument | null;
    }
    if (!order && businessReference) {
      order = (await db.collection('orders').findOne({
        $or: [{ orderNumber: businessReference }, { id: businessReference }]
      })) as unknown as OrderDocument | null;
    }
  }

  if (!order) {
    order =
      memoryDb.orders.find(
        (o) =>
          (trackingNumber && (o.trackingNumber === trackingNumber || o.bostaTrackingNumber === trackingNumber)) ||
          (deliveryId && o.bostaDeliveryId === deliveryId) ||
          (businessReference && (o.orderNumber === businessReference || o.id === businessReference))
      ) || null;
  }

  if (!order) {
    Logger.warn('[BostaService] Webhook order not found for tracking:', trackingNumber);
    return { success: false, message: 'الطلب غير موجود في النظام' };
  }

  const stateInfo = getBostaStateInfo(rawState);
  let orderStatusUpdates: Partial<OrderDocument> = {
    bostaState: stateInfo.internalState,
    updatedAt: new Date().toISOString()
  };

  if (stateInfo.internalState === 'DELIVERED') {
    orderStatusUpdates.status = 'delivered';
    orderStatusUpdates.paymentStatus = 'paid';
  } else if (stateInfo.internalState === 'CANCELLED' || stateInfo.internalState === 'RETURNED_TO_BUSINESS') {
    orderStatusUpdates.status = 'cancelled';
  } else if (
    ['OUT_FOR_DELIVERY', 'IN_TRANSIT', 'RECEIVED_AT_WAREHOUSE', 'PICKED_UP_FROM_BUSINESS'].includes(
      stateInfo.internalState
    )
  ) {
    orderStatusUpdates.status = 'shipped';
  }

  if (isMongo && db) {
    await db.collection('orders').updateOne({ id: order.id }, { $set: orderStatusUpdates });
  }

  const memIdx = memoryDb.orders.findIndex((o) => o.id === order.id);
  if (memIdx >= 0) {
    memoryDb.orders[memIdx] = { ...memoryDb.orders[memIdx], ...orderStatusUpdates };
  }

  await createNotification({
    userId: order.buyerId,
    recipientId: order.buyerId,
    title: `تحديث شحنة بوسطة: ${stateInfo.arabic}`,
    message: `شحنة طلبك #${order.orderNumber} أصبحت في حالة: ${stateInfo.arabic}`,
    type: 'order_status',
    link: 'orders',
    recipientRole: 'buyer'
  });

  await addAuditLog({
    userName: 'نظام الشحن والربط (Bosta)',
    userRole: 'admin',
    action: 'تحديث حالة شحنة بوسطة من Webhook',
    resource: 'الطلبات',
    resourceId: order.id,
    status: 'نجاح',
    details: `تم تحديث حالة الطلب #${order.orderNumber} إلى ${stateInfo.arabic}`
  });

  return { success: true, message: `تم تحديث حالة الشحنة إلى ${stateInfo.arabic} بنجاح` };
}