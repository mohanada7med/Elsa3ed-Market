import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type {
  ShippingCompanyDocument,
  ShipmentDocument,
  ShipmentStatus,
  ShipmentTrackingEvent,
  CODCollectionStatus,
  SellerSettlementStatus,
  OrderDocument,
  ShippingConfigDocument
} from '../models/types.ts';
import type { AuthenticatedUser } from '../middleware/auth.ts';
import { addAuditLog } from './auditService.ts';
import { createNotification, resolveSellerUserId } from './notificationService.ts';

const DEFAULT_SHIPPING_CONFIG: ShippingConfigDocument = {
  id: 'platform_shipping_config',
  defaultPackageType: 'Small',
  freeShippingThreshold: 1000,
  upperEgyptShippingFee: 45,
  otherGovernoratesShippingFee: 55,
  updatedAt: new Date().toISOString(),
  updatedBy: 'النظام'
};

export async function getShippingConfig(): Promise<ShippingConfigDocument> {
  const { db, isMongo } = await getDatabase();
  let config: ShippingConfigDocument | null = null;

  if (isMongo && db) {
    try {
      const doc = await db.collection('platform_shipping_config').findOne({ id: 'platform_shipping_config' });
      if (doc) {
        const { _id, ...cleanDoc } = doc as any;
        config = cleanDoc as ShippingConfigDocument;
      }
    } catch (e) {
      console.error('[ShippingService] Error reading config from Mongo:', e);
    }
  }

  if (!config) {
    config = (memoryDb as any).shippingConfig || (memoryDb as any).platform_shipping_config;
  }

  if (!config) {
    config = { ...DEFAULT_SHIPPING_CONFIG };
    if (isMongo && db) {
      try {
        const { _id, ...safeConfig } = config as any;
        await db.collection('platform_shipping_config').updateOne(
          { id: 'platform_shipping_config' },
          { $set: safeConfig },
          { upsert: true }
        );
      } catch (e) {
        console.error('[ShippingService] Error seeding config in Mongo:', e);
      }
    }
    (memoryDb as any).shippingConfig = config;
    (memoryDb as any).platform_shipping_config = config;
  }

  return config;
}

export async function updateShippingConfig(
  user: AuthenticatedUser,
  updates: Partial<ShippingConfigDocument>
): Promise<ShippingConfigDocument> {
  const current = await getShippingConfig();
  const { _id: _currId, ...cleanCurrent } = (current || {}) as any;
  const { _id: _updId, ...cleanUpdates } = (updates || {}) as any;

  const updated: ShippingConfigDocument = {
    ...cleanCurrent,
    ...cleanUpdates,
    id: 'platform_shipping_config',
    updatedAt: new Date().toISOString(),
    updatedBy: user.name || user.email || 'المدير'
  };

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const { _id, ...safeDoc } = updated as any;
      await db.collection('platform_shipping_config').updateOne(
        { id: 'platform_shipping_config' },
        { $set: safeDoc },
        { upsert: true }
      );
    } catch (e) {
      console.error('[ShippingService] Error saving config to Mongo:', e);
    }
  }

  (memoryDb as any).shippingConfig = updated;
  (memoryDb as any).platform_shipping_config = updated;

  await addAuditLog({
    actorId: user.id,
    userName: user.name || 'مدير المنصة',
    userRole: 'admin',
    action: 'تحديث أسعار ورسوم الشحن',
    resource: 'إعدادات المنصة',
    resourceId: 'platform_shipping_config',
    status: 'نجاح',
    details: `تم تحديث أسعار الشحن: الصعيد ${updated.upperEgyptShippingFee} ج.م، المحافظات ${updated.otherGovernoratesShippingFee} ج.م، حد الشحن المجاني ${updated.freeShippingThreshold} ج.م`
  });

  return updated;
}

/**
 * Calculates platform shipping fee based on cart subtotal and destination governorate
 */
export function calculateShipping(subtotal: number, governorate?: string): { fee: number; isFree: boolean; isUpperEgypt: boolean } {
  const UPPER_EGYPT_GOVERNORATES = ['أسوان', 'الأقصر', 'قنا', 'سوهاج', 'أسيوط', 'المنيا', 'بني سويف', 'الوادي الجديد', 'الفيوم', 'البحر الاحمر'];
  const cfg = (memoryDb as any).shippingConfig || { freeShippingThreshold: 1000, upperEgyptShippingFee: 45, otherGovernoratesShippingFee: 55 };

  if (subtotal >= (cfg.freeShippingThreshold || 1000)) {
    return { fee: 0, isFree: true, isUpperEgypt: false };
  }

  const isUpperEgypt = Boolean(governorate && UPPER_EGYPT_GOVERNORATES.some((gov) => governorate.includes(gov)));
  const fee = isUpperEgypt ? (cfg.upperEgyptShippingFee || 45) : (cfg.otherGovernoratesShippingFee || 55);
  return { fee, isFree: false, isUpperEgypt };
}

// Allowed valid transitions for standard seller operations
const SELLER_VALID_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  not_booked: ['booked'],
  booked: ['awaiting_pickup', 'cancelled'],
  awaiting_pickup: ['picked_up', 'cancelled'],
  picked_up: ['in_transit', 'failed', 'refused', 'returned'],
  in_transit: ['out_for_delivery', 'failed', 'refused', 'returned'],
  out_for_delivery: ['delivered', 'failed', 'refused', 'returned'],
  delivered: [],
  failed: ['in_transit', 'returned', 'cancelled'],
  refused: ['returned'],
  returned: [],
  cancelled: []
};

const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, { title: string; desc: string }> = {
  not_booked: { title: 'غير محجوزة', desc: 'لم يتم حجز بوليصة الشحن بعد' },
  booked: { title: 'تم حجز الشحنة', desc: 'تم حجز بوليصة الشحن لدى شركة الشحن المعتمدة' },
  awaiting_pickup: { title: 'بانتظار استلام المندوب', desc: 'الشحنة مجهزة ومغلفة في انتظار مندوب شركة الشحن للاستلام من الورشة' },
  picked_up: { title: 'تم استلام الشحنة من الورشة', desc: 'تسلم مندوب شركة الشحن الطرد بنجاح وبدأت رحلة الشحن' },
  in_transit: { title: 'قيد الشحن والتوزيع', desc: 'الشحنة في طريقها عبر مراكز الفرز والتوزيع' },
  out_for_delivery: { title: 'خرجت للتوصيل للعميل', desc: 'الشحنة مع مندوب التوصيل النهائي لتسليمها لعنوان العميل' },
  delivered: { title: 'تم التسليم بنجاح', desc: 'تم تسليم الشحنة للعميل بنجاح' },
  failed: { title: 'تعذر التسليم', desc: 'تعذر تسليم الشحنة لوجود عائق في العنوان أو عدم الرد' },
  refused: { title: 'رفض العميل الاستلام', desc: 'قام العميل برفض استلام الشحنة' },
  returned: { title: 'مرتجع إلى الورشة', desc: 'عادت الشحنة وتم إرجاعها إلى مقر الورشة' },
  cancelled: { title: 'تم إلغاء الشحنة', desc: 'تم إلغاء بوليصة الشحن' }
};

/**
 * Get active and approved shipping companies (Public & Seller safe - No secrets)
 */
export async function getApprovedShippingCompanies(): Promise<ShippingCompanyDocument[]> {
  const { db, isMongo } = await getDatabase();

  if (isMongo && db) {
    try {
      const companies = (await db
        .collection('shipping_companies')
        .find({ isActive: true, isApproved: true })
        .sort({ name: 1 })
        .toArray()) as unknown as ShippingCompanyDocument[];

      if (companies.length > 0) return companies;
    } catch (err) {
      console.error('[ShippingService] Mongo fetch approved companies error:', err);
    }
  }

  return (memoryDb.shippingCompanies || []).filter((c) => c.isActive && c.isApproved);
}

/**
 * Get all shipping companies (Admin only)
 */
export async function getAllShippingCompanies(): Promise<ShippingCompanyDocument[]> {
  const { db, isMongo } = await getDatabase();

  if (isMongo && db) {
    try {
      const companies = (await db
        .collection('shipping_companies')
        .find({})
        .sort({ createdAt: -1 })
        .toArray()) as unknown as ShippingCompanyDocument[];

      if (companies.length > 0) return companies;
    } catch (err) {
      console.error('[ShippingService] Mongo fetch all companies error:', err);
    }
  }

  return memoryDb.shippingCompanies || [];
}

/**
 * Create a new approved shipping company (Admin only)
 */
export async function createShippingCompany(
  admin: AuthenticatedUser,
  input: {
    name: string;
    nameEn?: string;
    code: string;
    bookingMethod?: 'external_booking' | 'carrier_api' | 'manual_dispatch';
    trackingUrlTemplate?: string;
    websiteUrl?: string;
    contactPhone?: string;
    supportEmail?: string;
    coverageGovernorates?: string[];
    pickupTerms?: string;
    notes?: string;
    hasApiIntegration?: boolean;
  }
): Promise<ShippingCompanyDocument> {
  const name = input.name?.trim();
  const code = (input.code || name.toLowerCase().replace(/\s+/g, '_')).trim();

  if (!name) {
    throw new Error('اسم شركة الشحن مطلوب');
  }

  if (!code) {
    throw new Error('رمز شركة الشحن التعريفي مطلوب');
  }

  const { db, isMongo } = await getDatabase();
  const now = new Date().toISOString();
  const newCompany: ShippingCompanyDocument = {
    id: `ship-comp-${Date.now()}`,
    name,
    nameEn: input.nameEn?.trim(),
    code,
    bookingMethod: input.bookingMethod || 'external_booking',
    trackingUrlTemplate: input.trackingUrlTemplate?.trim(),
    websiteUrl: input.websiteUrl?.trim(),
    contactPhone: input.contactPhone?.trim(),
    supportEmail: input.supportEmail?.trim(),
    coverageGovernorates: input.coverageGovernorates?.length ? input.coverageGovernorates : ['all'],
    pickupTerms: input.pickupTerms?.trim() || 'حجز عبر البوابة وتنسيق الاستلام مع مندوب الشركة',
    notes: input.notes?.trim(),
    isActive: true,
    isApproved: true,
    approvedAt: now,
    approvedBy: admin.name || 'إدارة منصة وه',
    hasApiIntegration: Boolean(input.hasApiIntegration),
    createdAt: now,
    updatedAt: now
  };

  if (isMongo && db) {
    try {
      await db.collection('shipping_companies').insertOne(newCompany as any);
    } catch (e: any) {
      console.error('[ShippingService] Mongo insert shipping company error:', e);
      throw new Error(`تعذر حفظ شركة الشحن: ${e?.message || 'خطأ في قاعدة البيانات'}`);
    }
  }

  memoryDb.shippingCompanies.unshift(newCompany);

  await addAuditLog({
    userName: admin.name || 'مدير المنصة',
    userRole: 'admin',
    action: 'إضافة شركة شحن معتمدة',
    resource: 'shipping_companies',
    resourceId: newCompany.id,
    status: 'نجاح',
    details: `تمت إضافة شركة الشحن "${name}" (${code}) واعتمادها للورش الحرفية.`
  });

  return newCompany;
}

/**
 * Update an approved shipping company (Admin only)
 */
export async function updateShippingCompany(
  admin: AuthenticatedUser,
  companyId: string,
  input: Partial<ShippingCompanyDocument>
): Promise<ShippingCompanyDocument> {
  const { db, isMongo } = await getDatabase();
  let company: ShippingCompanyDocument | null = null;

  if (isMongo && db) {
    try {
      company = (await db.collection('shipping_companies').findOne({ id: companyId })) as unknown as ShippingCompanyDocument | null;
    } catch (e) {
      console.error('[ShippingService] Mongo find company error:', e);
    }
  }

  if (!company) {
    company = memoryDb.shippingCompanies.find((c) => c.id === companyId) || null;
  }

  if (!company) {
    throw new Error('شركة الشحن غير موجودة');
  }

  const now = new Date().toISOString();
  const updatedCompany: ShippingCompanyDocument = {
    ...company,
    ...(input.name !== undefined && { name: input.name.trim() }),
    ...(input.nameEn !== undefined && { nameEn: input.nameEn.trim() }),
    ...(input.bookingMethod !== undefined && { bookingMethod: input.bookingMethod }),
    ...(input.trackingUrlTemplate !== undefined && { trackingUrlTemplate: input.trackingUrlTemplate.trim() }),
    ...(input.websiteUrl !== undefined && { websiteUrl: input.websiteUrl.trim() }),
    ...(input.contactPhone !== undefined && { contactPhone: input.contactPhone.trim() }),
    ...(input.supportEmail !== undefined && { supportEmail: input.supportEmail.trim() }),
    ...(input.coverageGovernorates !== undefined && { coverageGovernorates: input.coverageGovernorates }),
    ...(input.pickupTerms !== undefined && { pickupTerms: input.pickupTerms.trim() }),
    ...(input.notes !== undefined && { notes: input.notes.trim() }),
    ...(input.isActive !== undefined && { isActive: Boolean(input.isActive) }),
    ...(input.isApproved !== undefined && { isApproved: Boolean(input.isApproved) }),
    ...(input.hasApiIntegration !== undefined && { hasApiIntegration: Boolean(input.hasApiIntegration) }),
    updatedAt: now
  };

  if (isMongo && db) {
    try {
      await db.collection('shipping_companies').updateOne(
        { id: companyId },
        { $set: updatedCompany }
      );
    } catch (e: any) {
      console.error('[ShippingService] Mongo update company error:', e);
      throw new Error('تعذر تحديث بيانات شركة الشحن في قاعدة البيانات');
    }
  }

  const memIdx = memoryDb.shippingCompanies.findIndex((c) => c.id === companyId);
  if (memIdx >= 0) {
    memoryDb.shippingCompanies[memIdx] = updatedCompany;
  }

  await addAuditLog({
    userName: admin.name || 'مدير المنصة',
    userRole: 'admin',
    action: 'تعديل شركة شحن معتمدة',
    resource: 'shipping_companies',
    resourceId: companyId,
    status: 'نجاح',
    details: `تم تحديث بيانات أو حالة تفعيل شركة الشحن "${updatedCompany.name}".`
  });

  return updatedCompany;
}

/**
 * Filter criteria for seller shipments
 */
export interface ShipmentFilters {
  search?: string;
  status?: ShipmentStatus | 'all';
  companyId?: string | 'all';
  paymentMethod?: string | 'all';
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Get shipments for a specific seller with filters and statistics
 */
export async function getSellerShipments(
  sellerId: string,
  filters: ShipmentFilters = {}
): Promise<{
  shipments: ShipmentDocument[];
  stats: {
    totalCount: number;
    readyForBookingCount: number;
    bookedCount: number;
    awaitingPickupCount: number;
    inTransitCount: number;
    deliveredCount: number;
    failedOrReturnedCount: number;
    cancelledCount: number;
  };
}> {
  const { db, isMongo } = await getDatabase();
  let allSellerShipments: ShipmentDocument[] = [];

  if (isMongo && db) {
    try {
      allSellerShipments = (await db
        .collection('shipments')
        .find({ sellerId })
        .sort({ createdAt: -1 })
        .toArray()) as unknown as ShipmentDocument[];
    } catch (e) {
      console.error('[ShippingService] Mongo fetch seller shipments error:', e);
    }
  }

  if (allSellerShipments.length === 0) {
    allSellerShipments = memoryDb.shipments
      .filter((s) => s.sellerId === sellerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Count ready for booking orders (active seller orders without active shipment)
  let readyOrdersCount = 0;
  try {
    let sellerOrders: OrderDocument[] = [];
    if (isMongo && db) {
      sellerOrders = (await db
        .collection('orders')
        .find({ sellerIds: sellerId, status: { $in: ['pending', 'confirmed', 'processing'] } })
        .toArray()) as unknown as OrderDocument[];
    } else {
      sellerOrders = memoryDb.orders.filter(
        (o) => o.sellerIds?.includes(sellerId) && ['pending', 'confirmed', 'processing'].includes(o.status)
      );
    }

    const shippedOrderIds = new Set(
      allSellerShipments
        .filter((s) => s.status !== 'cancelled' && s.status !== 'returned')
        .map((s) => s.orderId)
    );

    readyOrdersCount = sellerOrders.filter((o) => !shippedOrderIds.has(o.id)).length;
  } catch (err) {
    console.warn('[ShippingService] Error calculating ready orders count:', err);
  }

  // Statistics across all shipments of this seller
  const stats = {
    totalCount: allSellerShipments.length,
    readyForBookingCount: readyOrdersCount,
    bookedCount: allSellerShipments.filter((s) => s.status === 'booked').length,
    awaitingPickupCount: allSellerShipments.filter((s) => s.status === 'awaiting_pickup').length,
    inTransitCount: allSellerShipments.filter((s) => ['picked_up', 'in_transit', 'out_for_delivery'].includes(s.status)).length,
    deliveredCount: allSellerShipments.filter((s) => s.status === 'delivered').length,
    failedOrReturnedCount: allSellerShipments.filter((s) => ['failed', 'refused', 'returned'].includes(s.status)).length,
    cancelledCount: allSellerShipments.filter((s) => s.status === 'cancelled').length
  };

  // Apply filtering for the returned list
  let filtered = [...allSellerShipments];

  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter((s) => s.status === filters.status);
  }

  if (filters.companyId && filters.companyId !== 'all') {
    filtered = filtered.filter((s) => s.companyId === filters.companyId);
  }

  if (filters.paymentMethod && filters.paymentMethod !== 'all') {
    if (filters.paymentMethod === 'cod') {
      filtered = filtered.filter((s) => s.paymentMethod === 'cod' || s.paymentMethod === 'cash_on_delivery');
    } else {
      filtered = filtered.filter((s) => s.paymentMethod !== 'cod' && s.paymentMethod !== 'cash_on_delivery');
    }
  }

  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    filtered = filtered.filter((s) =>
      s.orderNumber?.toLowerCase().includes(q) ||
      s.trackingNumber?.toLowerCase().includes(q) ||
      s.shippingLabelRef?.toLowerCase().includes(q) ||
      s.buyerName?.toLowerCase().includes(q) ||
      s.buyerPhone?.includes(q)
    );
  }

  if (filters.dateFrom) {
    const fromTime = new Date(filters.dateFrom).getTime();
    filtered = filtered.filter((s) => new Date(s.bookingDate || s.createdAt).getTime() >= fromTime);
  }

  if (filters.dateTo) {
    const toTime = new Date(filters.dateTo).getTime() + 86400000; // include full day
    filtered = filtered.filter((s) => new Date(s.bookingDate || s.createdAt).getTime() <= toTime);
  }

  return { shipments: filtered, stats };
}

/**
 * Get seller orders that are ready to be booked for shipping
 */
export async function getSellerReadyOrders(sellerId: string): Promise<OrderDocument[]> {
  const { db, isMongo } = await getDatabase();
  let orders: OrderDocument[] = [];

  if (isMongo && db) {
    try {
      orders = (await db
        .collection('orders')
        .find({ sellerIds: sellerId, status: { $nin: ['cancelled', 'delivered'] } })
        .sort({ createdAt: -1 })
        .toArray()) as unknown as OrderDocument[];
    } catch (e) {
      console.error('[ShippingService] Mongo fetch ready orders error:', e);
    }
  }

  if (orders.length === 0) {
    orders = memoryDb.orders
      .filter((o) => o.sellerIds?.includes(sellerId) && !['cancelled', 'delivered'].includes(o.status))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Fetch all active shipments for this seller to filter out already booked orders
  const { shipments: activeShipments } = await getSellerShipments(sellerId);
  const activeShippedOrderIds = new Set(
    activeShipments
      .filter((s) => s.status !== 'cancelled' && s.status !== 'returned')
      .map((s) => s.orderId)
  );

  return orders.filter((o) => !activeShippedOrderIds.has(o.id));
}

/**
 * Create/register shipment details for an order (Seller only)
 */
export async function createShipment(
  seller: AuthenticatedUser,
  input: {
    orderId: string;
    companyId: string;
    trackingNumber: string;
    shippingLabelRef?: string;
    actualShippingCost: number;
    bookingDate: string;
    handoverDate?: string;
    notes?: string;
    allowReshipment?: boolean;
  }
): Promise<ShipmentDocument> {
  const sellerId = seller.sellerId || seller.id;
  const {
    orderId,
    companyId,
    trackingNumber,
    shippingLabelRef,
    actualShippingCost,
    bookingDate,
    handoverDate,
    notes,
    allowReshipment
  } = input;

  if (!orderId) {
    throw new Error('رقم الطلب المرتبط بالشحنة مطلوب');
  }

  if (!companyId) {
    throw new Error('يرجى اختيار شركة شحن معتمدة من القائمة');
  }

  if (!trackingNumber || !trackingNumber.trim()) {
    throw new Error('رقم التتبع أو البوليصة إلزامي');
  }

  const cost = Number(actualShippingCost);
  if (isNaN(cost) || cost < 0) {
    throw new Error('تكلفة الشحن الفعلية يجب أن تكون رقماً موجباً أو صفراً');
  }

  const { db, isMongo } = await getDatabase();

  // 1. Fetch and verify the order
  let order: OrderDocument | null = null;
  if (isMongo && db) {
    try {
      order = (await db.collection('orders').findOne({ id: orderId })) as unknown as OrderDocument | null;
    } catch (e) {
      console.error('[ShippingService] Mongo fetch order error:', e);
    }
  }

  if (!order) {
    order = memoryDb.orders.find((o) => o.id === orderId) || null;
  }

  if (!order) {
    throw new Error('الطلب المطلوب شحنه غير موجود بالمنصة');
  }

  // Role check: Seller must own items in this order
  if (seller.role !== 'admin' && !order.sellerIds?.includes(sellerId)) {
    throw new Error('غير مصرح لك بإنشاء شحنة لطلب تابع لورشة أخرى');
  }

  if (order.status === 'cancelled') {
    throw new Error('لا يمكن إنشاء شحنة لطلب تم إلغاؤه مسبقاً');
  }

  // 2. Fetch and verify approved shipping company
  let company: ShippingCompanyDocument | null = null;
  if (isMongo && db) {
    try {
      company = (await db.collection('shipping_companies').findOne({ id: companyId })) as unknown as ShippingCompanyDocument | null;
    } catch (e) {
      console.error('[ShippingService] Mongo fetch company error:', e);
    }
  }

  if (!company) {
    company = memoryDb.shippingCompanies.find((c) => c.id === companyId) || null;
  }

  if (!company) {
    throw new Error('شركة الشحن المحددة غير موجودة');
  }

  if (!company.isActive || !company.isApproved) {
    throw new Error('شركة الشحن غير نشطة أو لم تعد معتمدة من إدارة المنصة');
  }

  // 3. Duplicate prevention: Check if active shipment already exists for this order
  let existingShipment: ShipmentDocument | null = null;
  if (isMongo && db) {
    try {
      existingShipment = (await db.collection('shipments').findOne({
        orderId,
        sellerId,
        status: { $nin: ['cancelled', 'returned'] }
      })) as unknown as ShipmentDocument | null;
    } catch (e) {
      console.error('[ShippingService] Check existing shipment error:', e);
    }
  }

  if (!existingShipment) {
    existingShipment = memoryDb.shipments.find(
      (s) => s.orderId === orderId && s.sellerId === sellerId && !['cancelled', 'returned'].includes(s.status)
    ) || null;
  }

  if (existingShipment && !allowReshipment) {
    throw new Error(
      `يوجد شحنة نشطة بالفعل مسجلة لهذا الطلب برقم تتبع (${existingShipment.trackingNumber}) مع ${existingShipment.companyName}. لمنع ازدواجية الشحن لا يمكن إنشاء شحنة ثانية إلا في حالة إعادة الإرسال المعتمدة.`
    );
  }

  // 4. Calculate COD and settlement independent statuses
  const isCOD = order.paymentMethod === 'cod' || order.paymentMethod === 'cash_on_delivery';
  const codAmount = isCOD ? Number(order.total || 0) : 0;
  const codCollectionStatus: CODCollectionStatus = isCOD ? 'pending_collection' : 'not_applicable';
  const sellerSettlementStatus: SellerSettlementStatus = 'pending';

  // 5. Generate verified tracking URL if template is available
  let trackingUrl: string | undefined = undefined;
  if (company.trackingUrlTemplate && trackingNumber.trim()) {
    trackingUrl = company.trackingUrlTemplate.replace('{trackingNumber}', encodeURIComponent(trackingNumber.trim()));
  }

  const now = new Date().toISOString();
  const shipmentId = `shp-${Date.now()}`;
  const initialStatus: ShipmentStatus = handoverDate ? 'awaiting_pickup' : 'booked';

  // 6. Build items summary
  const sellerItems = (order.items || []).filter((item) => item.sellerId === sellerId);
  const itemCount = sellerItems.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
  const itemsSummary = sellerItems.map((it) => `${it.productTitle} (×${it.quantity})`).join('، ') || 'منتجات الحرف التراثية';

  // 7. Initial Tracking Event
  const initialEvent: ShipmentTrackingEvent = {
    id: `evt-${Date.now()}-1`,
    status: initialStatus,
    title: SHIPMENT_STATUS_LABELS[initialStatus].title,
    description: `تم تسجيل بوليصة الشحن لدى ${company.name} برقم تتبع ${trackingNumber.trim()}`,
    timestamp: now,
    actorId: seller.id,
    actorName: seller.name || 'الورشة الحرفية',
    actorRole: (seller.role === 'admin' ? 'admin' : 'seller'),
    source: 'seller_portal',
    proofNote: notes?.trim()
  };

  const newShipment: ShipmentDocument = {
    id: shipmentId,
    orderId: order.id,
    orderNumber: order.orderNumber || order.id,
    sellerId,
    sellerName: seller.name || sellerItems[0]?.sellerName || 'حرفي منصة وه',
    sellerGovernorate: seller.governorate || sellerItems[0]?.sellerGovernorate || order.shippingAddress?.governorate || 'الصعيد',
    buyerId: order.buyerId,
    buyerName: order.shippingAddress?.fullName || order.buyerName || 'عميل وه',
    buyerPhone: order.shippingAddress?.phone || order.buyerPhone || '',
    shippingAddress: order.shippingAddress,
    companyId: company.id,
    companyName: company.name,
    companyCode: company.code,
    bookingMethod: company.bookingMethod,
    trackingNumber: trackingNumber.trim(),
    shippingLabelRef: shippingLabelRef?.trim(),
    trackingUrl,
    actualShippingCost: cost,
    bookingDate: bookingDate || now,
    handoverDate: handoverDate || undefined,
    status: initialStatus,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    codAmount,
    codCollectionStatus,
    sellerSettlementStatus,
    itemCount,
    itemsSummary,
    notes: notes?.trim(),
    isReshipment: Boolean(allowReshipment),
    events: [initialEvent],
    createdAt: now,
    updatedAt: now,
    createdBy: seller.id
  };

  // 8. Save shipment
  if (isMongo && db) {
    try {
      await db.collection('shipments').insertOne(newShipment as any);
    } catch (e: any) {
      console.error('[ShippingService] Mongo insert shipment error:', e);
      throw new Error(`تعذر حفظ بيانات الشحنة: ${e?.message || 'خطأ في قاعدة البيانات'}`);
    }
  }

  memoryDb.shipments.unshift(newShipment);

  // 9. Synchronize order status and timeline
  const newOrderStatus = order.status === 'pending' || order.status === 'confirmed' ? 'processing' : order.status;
  order.status = newOrderStatus;
  order.shipmentId = newShipment.id;
  order.shipmentStatus = newShipment.status;
  order.shippingProvider = company.name;
  order.trackingNumber = newShipment.trackingNumber;
  order.codCollectionStatus = codCollectionStatus;
  order.sellerSettlementStatus = sellerSettlementStatus;
  order.updatedAt = now;

  order.timeline.push({
    status: 'processing',
    title: `حجز الشحنة (${company.name})`,
    description: `تم إصدار بوليصة الشحن برقم: ${newShipment.trackingNumber}`,
    time: 'الآن',
    done: true
  });

  if (isMongo && db) {
    try {
      await db.collection('orders').updateOne(
        { id: order.id },
        {
          $set: {
            status: order.status,
            shipmentId: order.shipmentId,
            shipmentStatus: order.shipmentStatus,
            shippingProvider: order.shippingProvider,
            trackingNumber: order.trackingNumber,
            codCollectionStatus: order.codCollectionStatus,
            sellerSettlementStatus: order.sellerSettlementStatus,
            updatedAt: order.updatedAt,
            timeline: order.timeline
          }
        }
      );
    } catch (e) {
      console.error('[ShippingService] Mongo sync order status error:', e);
    }
  }

  const memOrderIdx = memoryDb.orders.findIndex((o) => o.id === order.id);
  if (memOrderIdx >= 0) {
    memoryDb.orders[memOrderIdx] = order;
  }

  // 10. Audit log and notifications
  await addAuditLog({
    userName: seller.name || 'حرفي منصة وه',
    userRole: seller.role,
    action: 'تسجيل بوليصة شحن لطلب',
    resource: 'shipments',
    resourceId: newShipment.id,
    status: 'نجاح',
    details: `تم حجز شحنة الطلب #${order.orderNumber} مع ${company.name}، بوليصة رقم: ${newShipment.trackingNumber}.`
  });

  try {
    // Notify buyer
    await createNotification({
      userId: order.buyerId,
      recipientId: order.buyerId,
      title: `تم تجهيز شحنتك للطلب #${order.orderNumber}`,
      message: `تم حجز شحنة طلبك مع شركة "${company.name}" برقم تتبع ${newShipment.trackingNumber}. يمكنك متابعة مسار الطرد.`,
      type: 'order_status',
      link: 'orders',
      recipientRole: 'buyer',
      metadata: { orderId: order.id, shipmentId: newShipment.id, trackingNumber: newShipment.trackingNumber }
    });
  } catch (notifErr) {
    console.warn('[ShippingService] Notification error:', notifErr);
  }

  return newShipment;
}

/**
 * Update shipment status with strict lifecycle rules and audit trail
 */
export async function updateShipmentStatus(
  user: AuthenticatedUser,
  shipmentId: string,
  newStatus: ShipmentStatus,
  payload: {
    note?: string;
    handoverDate?: string;
    failureReason?: string;
    proofOfDeliveryNote?: string;
    proofOfDeliveryUrl?: string;
  } = {}
): Promise<ShipmentDocument> {
  const { db, isMongo } = await getDatabase();
  let shipment: ShipmentDocument | null = null;

  if (isMongo && db) {
    try {
      shipment = (await db.collection('shipments').findOne({ id: shipmentId })) as unknown as ShipmentDocument | null;
    } catch (e) {
      console.error('[ShippingService] Mongo fetch shipment error:', e);
    }
  }

  if (!shipment) {
    shipment = memoryDb.shipments.find((s) => s.id === shipmentId) || null;
  }

  if (!shipment) {
    throw new Error('سجل الشحنة غير موجود');
  }

  // Role validation: Only the owner seller or admin can update status
  const sellerId = user.sellerId || user.id;
  if (user.role !== 'admin' && shipment.sellerId !== sellerId) {
    throw new Error('غير مصرح لك بتحديث حالة هذه الشحنة');
  }

  const currentStatus = shipment.status;

  // Enforce valid lifecycle transitions for sellers
  if (user.role !== 'admin') {
    const allowed = SELLER_VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `الانتقال من حالة "${SHIPMENT_STATUS_LABELS[currentStatus]?.title || currentStatus}" إلى "${SHIPMENT_STATUS_LABELS[newStatus]?.title || newStatus}" غير مسموح وفقاً لدورة حياة الشحنة.`
      );
    }

    // Protection rule: Delivered status cannot be marked freely without verification or proof
    if (newStatus === 'delivered' && !payload.proofOfDeliveryNote?.trim()) {
      throw new Error('لتأكيد تسليم الشحنة للعميل بنجاح، يجب إدخال إفادة أو كود أو مستند إثبات التسليم المعتمد من شركة الشحن.');
    }

    // Failed or returned status requires reason
    if (['failed', 'refused', 'returned'].includes(newStatus) && !payload.failureReason?.trim() && !payload.note?.trim()) {
      throw new Error('يرجى توضيح سبب تعذر التسليم أو الارتجاع بالتفصيل لإعلام الإدارة والعميل.');
    }
  }

  const now = new Date().toISOString();
  shipment.status = newStatus;
  shipment.updatedAt = now;

  if (payload.handoverDate) {
    shipment.handoverDate = payload.handoverDate;
  }
  if (payload.failureReason) {
    shipment.failureReason = payload.failureReason.trim();
  }
  if (payload.proofOfDeliveryNote) {
    shipment.proofOfDeliveryNote = payload.proofOfDeliveryNote.trim();
  }
  if (payload.proofOfDeliveryUrl) {
    shipment.proofOfDeliveryUrl = payload.proofOfDeliveryUrl.trim();
  }
  if (newStatus === 'delivered') {
    shipment.actualDeliveryDate = now;
  }

  // Independent COD & Settlement update:
  // When delivered is confirmed, carrier has collected COD amount, enabling settlement
  if (newStatus === 'delivered') {
    if (shipment.paymentMethod === 'cod' || shipment.paymentMethod === 'cash_on_delivery') {
      shipment.codCollectionStatus = 'collected_by_carrier';
      shipment.sellerSettlementStatus = 'ready_for_payout';
    }
  } else if (newStatus === 'returned' || newStatus === 'cancelled') {
    if (shipment.paymentMethod === 'cod' || shipment.paymentMethod === 'cash_on_delivery') {
      shipment.codCollectionStatus = 'not_applicable';
      shipment.sellerSettlementStatus = 'on_hold';
    }
  }

  // Add tracking audit event
  const statusMeta = SHIPMENT_STATUS_LABELS[newStatus] || { title: newStatus, desc: '' };
  const eventDesc = payload.note?.trim() || payload.failureReason?.trim() || payload.proofOfDeliveryNote?.trim() || statusMeta.desc;

  const newEvent: ShipmentTrackingEvent = {
    id: `evt-${Date.now()}`,
    status: newStatus,
    title: statusMeta.title,
    description: eventDesc,
    timestamp: now,
    actorId: user.id,
    actorName: user.name || (user.role === 'admin' ? 'إدارة المنصة' : 'الورشة الحرفية'),
    actorRole: (user.role === 'admin' ? 'admin' : 'seller'),
    source: user.role === 'admin' ? 'admin_portal' : 'seller_portal',
    proofNote: payload.proofOfDeliveryNote || payload.note,
    proofDocumentUrl: payload.proofOfDeliveryUrl
  };

  shipment.events.push(newEvent);

  // Update in DB
  if (isMongo && db) {
    try {
      await db.collection('shipments').updateOne(
        { id: shipmentId },
        {
          $set: {
            status: shipment.status,
            handoverDate: shipment.handoverDate,
            actualDeliveryDate: shipment.actualDeliveryDate,
            failureReason: shipment.failureReason,
            proofOfDeliveryNote: shipment.proofOfDeliveryNote,
            proofOfDeliveryUrl: shipment.proofOfDeliveryUrl,
            codCollectionStatus: shipment.codCollectionStatus,
            sellerSettlementStatus: shipment.sellerSettlementStatus,
            events: shipment.events,
            updatedAt: shipment.updatedAt
          }
        }
      );
    } catch (e: any) {
      console.error('[ShippingService] Mongo update shipment status error:', e);
      throw new Error('تعذر تحديث مسار الشحنة في قاعدة البيانات');
    }
  }

  const memIdx = memoryDb.shipments.findIndex((s) => s.id === shipmentId);
  if (memIdx >= 0) {
    memoryDb.shipments[memIdx] = shipment;
  }

  // Synchronize Order status
  let order: OrderDocument | null = null;
  if (isMongo && db) {
    try {
      order = (await db.collection('orders').findOne({ id: shipment.orderId })) as unknown as OrderDocument | null;
    } catch (e) {
      console.error('[ShippingService] Mongo fetch order error:', e);
    }
  }
  if (!order) {
    order = memoryDb.orders.find((o) => o.id === shipment.orderId) || null;
  }

  if (order) {
    order.shipmentStatus = newStatus;
    order.codCollectionStatus = shipment.codCollectionStatus;
    order.sellerSettlementStatus = shipment.sellerSettlementStatus;
    order.updatedAt = now;

    if (newStatus === 'picked_up' || newStatus === 'in_transit' || newStatus === 'out_for_delivery') {
      if (order.status !== 'shipped' && order.status !== 'delivered') {
        order.status = 'shipped';
      }
    } else if (newStatus === 'delivered') {
      order.status = 'delivered';
    }

    order.timeline.push({
      status: order.status,
      title: statusMeta.title,
      description: eventDesc,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      done: true
    });

    if (isMongo && db) {
      try {
        await db.collection('orders').updateOne(
          { id: order.id },
          {
            $set: {
              status: order.status,
              shipmentStatus: order.shipmentStatus,
              codCollectionStatus: order.codCollectionStatus,
              sellerSettlementStatus: order.sellerSettlementStatus,
              timeline: order.timeline,
              updatedAt: order.updatedAt
            }
          }
        );
      } catch (e) {
        console.error('[ShippingService] Mongo sync order error:', e);
      }
    }

    const memOrderIdx = memoryDb.orders.findIndex((o) => o.id === order.id);
    if (memOrderIdx >= 0) {
      memoryDb.orders[memOrderIdx] = order;
    }

    // Send notifications to buyer
    try {
      await createNotification({
        userId: order.buyerId,
        recipientId: order.buyerId,
        title: `تحديث شحنة الطلب #${order.orderNumber}: ${statusMeta.title}`,
        message: `${statusMeta.desc} - بوليصة تتبع: ${shipment.trackingNumber}`,
        type: 'order_status',
        link: 'orders',
        recipientRole: 'buyer',
        metadata: { orderId: order.id, shipmentId, newStatus }
      });
    } catch (notifErr) {
      console.warn('[ShippingService] Notification error:', notifErr);
    }
  }

  // Audit log
  await addAuditLog({
    userName: user.name || 'مستخدم المنصة',
    userRole: user.role,
    action: 'تحديث حالة مسار الشحنة',
    resource: 'shipments',
    resourceId: shipmentId,
    status: 'نجاح',
    details: `تم تحديث حالة الشحنة #${shipment.trackingNumber} إلى "${statusMeta.title}".`
  });

  return shipment;
}

/**
 * Get all shipments across the platform (Admin only)
 */
export async function getAdminShipments(filters: ShipmentFilters = {}): Promise<{
  shipments: ShipmentDocument[];
  stats: {
    totalCount: number;
    bookedCount: number;
    awaitingPickupCount: number;
    inTransitCount: number;
    deliveredCount: number;
    failedOrReturnedCount: number;
    cancelledCount: number;
    totalCodExpected: number;
  };
}> {
  const { db, isMongo } = await getDatabase();
  let allShipments: ShipmentDocument[] = [];

  if (isMongo && db) {
    try {
      allShipments = (await db
        .collection('shipments')
        .find({})
        .sort({ createdAt: -1 })
        .toArray()) as unknown as ShipmentDocument[];
    } catch (e) {
      console.error('[ShippingService] Mongo fetch all shipments error:', e);
    }
  }

  if (allShipments.length === 0) {
    allShipments = [...memoryDb.shipments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const stats = {
    totalCount: allShipments.length,
    bookedCount: allShipments.filter((s) => s.status === 'booked').length,
    awaitingPickupCount: allShipments.filter((s) => s.status === 'awaiting_pickup').length,
    inTransitCount: allShipments.filter((s) => ['picked_up', 'in_transit', 'out_for_delivery'].includes(s.status)).length,
    deliveredCount: allShipments.filter((s) => s.status === 'delivered').length,
    failedOrReturnedCount: allShipments.filter((s) => ['failed', 'refused', 'returned'].includes(s.status)).length,
    cancelledCount: allShipments.filter((s) => s.status === 'cancelled').length,
    totalCodExpected: allShipments
      .filter((s) => s.paymentMethod === 'cod' || s.paymentMethod === 'cash_on_delivery')
      .reduce((sum, s) => sum + (Number(s.codAmount) || 0), 0)
  };

  let filtered = [...allShipments];

  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter((s) => s.status === filters.status);
  }

  if (filters.companyId && filters.companyId !== 'all') {
    filtered = filtered.filter((s) => s.companyId === filters.companyId);
  }

  if (filters.paymentMethod && filters.paymentMethod !== 'all') {
    if (filters.paymentMethod === 'cod') {
      filtered = filtered.filter((s) => s.paymentMethod === 'cod' || s.paymentMethod === 'cash_on_delivery');
    } else {
      filtered = filtered.filter((s) => s.paymentMethod !== 'cod' && s.paymentMethod !== 'cash_on_delivery');
    }
  }

  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    filtered = filtered.filter((s) =>
      s.orderNumber?.toLowerCase().includes(q) ||
      s.trackingNumber?.toLowerCase().includes(q) ||
      s.sellerName?.toLowerCase().includes(q) ||
      s.buyerName?.toLowerCase().includes(q) ||
      s.buyerPhone?.includes(q)
    );
  }

  return { shipments: filtered, stats };
}
