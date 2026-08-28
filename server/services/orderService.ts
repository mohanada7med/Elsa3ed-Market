import { memoryDb, getDatabase } from '../db/mongodb.ts';
import {
  OrderDocument,
  OrderItemSnapshot,
  OrderAddressDocument,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductDocument
} from '../models/types.ts';
import { AuthenticatedUser } from '../middleware/auth.ts';
import { getCart, clearCart } from './cartService.ts';
import { incrementCouponUsage } from './discountService.ts';
import { addAuditLog } from './auditService.ts';

export interface CreateOrderInput {
  shippingAddress: OrderAddressDocument;
  paymentMethod: PaymentMethod;
  discountCode?: string;
  notes?: string;
  paymentReference?: string;
}

/**
 * Creates an order from the buyer's server-side cart with atomic stock reduction
 */
export async function createOrder(
  buyer: AuthenticatedUser,
  input: CreateOrderInput
): Promise<OrderDocument> {
  const { shippingAddress, paymentMethod, discountCode, notes, paymentReference } = input;

  // 1. Validate shipping address fields
  if (!shippingAddress.fullName || !shippingAddress.fullName.trim()) {
    throw new Error('اسم المستلم مطلوب');
  }
  if (!shippingAddress.phone || !shippingAddress.phone.trim()) {
    throw new Error('رقم هاتف المستلم مطلوب');
  }
  if (!shippingAddress.governorate) {
    throw new Error('المحافظة مطلوبة لتحديد مسار الشحن');
  }
  if (!shippingAddress.city || !shippingAddress.streetAddress) {
    throw new Error('يرجى ملء تفاصيل العنوان بدقة (المدينة والشارع)');
  }

  // 2. Fetch buyer's validated cart
  const cartSummary = await getCart(buyer.id, discountCode, shippingAddress.governorate);

  if (cartSummary.items.length === 0) {
    throw new Error('سلة المشتريات فارغة، لا يمكن إتمام الطلب');
  }

  if (!cartSummary.isAllAvailable) {
    const reason = cartSummary.warnings.join(' | ') || 'بعض المنتجات في السلة غير متوفرة أو نفدت كميتها';
    throw new Error(`تعذر إتمام الطلب: ${reason}`);
  }

  const { db, isMongo } = await getDatabase();

  // 3. Atomically verify and reduce stock for all items
  for (const item of cartSummary.items) {
    if (isMongo && db) {
      try {
        const updateResult = await db.collection('products').updateOne(
          {
            id: item.product.id,
            stockCount: { $gte: item.quantity },
            approvalStatus: 'approved'
          },
          {
            $inc: { stockCount: -item.quantity },
            $set: { updatedAt: new Date().toISOString() }
          }
        );

        if (updateResult.matchedCount === 0) {
          throw new Error(`نفدت الكمية من المنتج "${item.product.title}" أثناء إتمام الطلب`);
        }

        // Check if stock became 0, update inStock
        const updatedProd = await db.collection('products').findOne({ id: item.product.id });
        if (updatedProd && updatedProd.stockCount <= 0) {
          await db.collection('products').updateOne(
            { id: item.product.id },
            { $set: { inStock: false } }
          );
        }
      } catch (e) {
        console.error('[OrderService] Mongo stock reduction error:', e);
      }
    }

    // Update memory store
    const memProduct = memoryDb.products.find((p) => p.id === item.product.id);
    if (memProduct) {
      if (memProduct.stockCount < item.quantity) {
        throw new Error(`الكمية المتاحة من "${memProduct.title}" غير كافية`);
      }
      memProduct.stockCount -= item.quantity;
      if (memProduct.stockCount <= 0) {
        memProduct.inStock = false;
      }
    }
  }

  // 4. Build historical OrderItemSnapshot array
  const orderItems: OrderItemSnapshot[] = cartSummary.items.map((item) => ({
    productId: item.product.id,
    productTitle: item.product.title,
    productImage: item.product.images[0] || '',
    sellerId: item.product.sellerId,
    sellerName: item.product.sellerName,
    sellerGovernorate: item.product.sellerGovernorate,
    quantity: item.quantity,
    unitPrice: item.product.price, // Immutable historical snapshot
    subtotal: item.itemSubtotal,
    selectedColor: item.selectedColor,
    customNote: item.customNote
  }));

  const distinctSellerIds = Array.from(new Set(orderItems.map((it) => it.sellerId)));
  const uniqueNum = Math.floor(100000 + Math.random() * 900000);
  const orderNumber = `SAED-${uniqueNum}`;
  const orderId = `ord-${Date.now()}`;
  const trackingNumber = `EG-SAED-${Math.floor(1000 + Math.random() * 9000)}`;

  const nowIso = new Date().toISOString();

  // Initial timeline
  const timeline = [
    {
      status: 'pending' as OrderStatus,
      title: 'تم تسجيل الطلب بنجاح',
      description: `تم إنشاء الطلب برقم ${orderNumber} وإرساله للورش الحرفية بالصعيد`,
      time: 'الآن',
      done: true
    },
    {
      status: 'confirmed' as OrderStatus,
      title: 'تأكيد الورشة والتجهيز',
      description: 'جاري تأكيد جاهزية القطع التراثية المطلوبة',
      time: 'خلال ساعتين',
      done: false
    },
    {
      status: 'processing' as OrderStatus,
      title: 'فحص الجودة والتغليف الآمن',
      description: 'تغليف خاص ومحكم لحماية الفخار والمشغولات اليدوية',
      time: 'خلال 24 ساعة',
      done: false
    },
    {
      status: 'shipped' as OrderStatus,
      title: 'الشحن من محافظات الصعيد',
      description: 'تسليم الطرد لشركة شحن صعيد إكسبريس',
      time: 'خلال 48 ساعة',
      done: false
    },
    {
      status: 'delivered' as OrderStatus,
      title: 'التسليم للمشتري',
      description: 'توصيل الطلب إلى باب المنزل',
      time: 'خلال 3 - 4 أيام عمل',
      done: false
    }
  ];

  // All real orders start as 'pending' payment until verified by gateway/admin or collected (COD)
  const initialPaymentStatus: PaymentStatus = 'pending';

  const orderDocument: OrderDocument = {
    id: orderId,
    orderNumber,
    buyerId: buyer.id,
    buyerName: shippingAddress.fullName,
    buyerPhone: shippingAddress.phone,
    buyerEmail: buyer.email,
    shippingAddress: {
      ...shippingAddress,
      notes: notes || shippingAddress.notes
    },
    items: orderItems,
    status: 'pending',
    paymentMethod,
    paymentStatus: initialPaymentStatus,
    paymentReference:
      paymentReference?.trim() ||
      (paymentMethod !== 'cod'
        ? `REF-${Math.floor(100000 + Math.random() * 900000)}`
        : undefined),
    subtotal: cartSummary.subtotal,
    shippingFee: cartSummary.shippingFee,
    discountAmount: cartSummary.discountAmount,
    discountCode: cartSummary.discountCode,
    total: cartSummary.total,
    createdAt: nowIso,
    updatedAt: nowIso,
    trackingNumber,
    timeline,
    sellerIds: distinctSellerIds
  };

  // 5. Save order in MongoDB / Memory
  if (isMongo && db) {
    try {
      await db.collection('orders').insertOne(orderDocument);
    } catch (e) {
      console.error('[OrderService] Mongo order insertion error:', e);
    }
  }

  memoryDb.orders.unshift(orderDocument);

  // 6. Clear buyer's cart
  await clearCart(buyer.id);

  // 7. Increment coupon usage if used
  if (cartSummary.discountCode) {
    await incrementCouponUsage(cartSummary.discountCode);
  }

  // 8. Audit Log
  await addAuditLog({
    actorId: buyer.id,
    userName: buyer.name,
    userRole: buyer.role,
    action: 'إنشاء طلب شراء جديد',
    resource: 'الطلبات',
    resourceId: orderDocument.id,
    status: 'نجاح',
    details: `تم إنشاء الطلب #${orderNumber} بإجمالي ${orderDocument.total} ج.م وطريقة الدفع ${paymentMethod}`
  });

  return orderDocument;
}

/**
 * Get buyer's orders with strict user ID ownership
 */
export async function getBuyerOrders(buyerId: string): Promise<OrderDocument[]> {
  const { db, isMongo } = await getDatabase();

  if (isMongo && db) {
    try {
      const mongoOrders = (await db
        .collection('orders')
        .find({ buyerId })
        .sort({ createdAt: -1 })
        .toArray()) as unknown as OrderDocument[];
      if (mongoOrders.length > 0) return mongoOrders;
    } catch (e) {
      console.error('[OrderService] Mongo fetch buyer orders error:', e);
    }
  }

  return memoryDb.orders
    .filter((ord) => ord.buyerId === buyerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get single order for buyer (with IDOR protection)
 */
export async function getBuyerOrderById(
  buyerId: string,
  orderId: string
): Promise<OrderDocument | null> {
  const { db, isMongo } = await getDatabase();
  let order: OrderDocument | null = null;

  if (isMongo && db) {
    try {
      order = (await db.collection('orders').findOne({ id: orderId })) as unknown as OrderDocument | null;
    } catch (e) {
      console.error('[OrderService] Mongo fetch order error:', e);
    }
  }


  if (!order) {
    order = memoryDb.orders.find((ord) => ord.id === orderId) || null;
  }

  if (!order) {
    return null;
  }

  // IDOR Protection: verify order belongs to this buyer
  if (order.buyerId !== buyerId) {
    throw new Error('غير مصرح لك بالاطلاع على هذا الطلب');
  }

  return order;
}

/**
 * Buyer can cancel pending order and restore stock
 */
export async function cancelBuyerOrder(
  buyerId: string,
  orderId: string,
  reason?: string
): Promise<OrderDocument> {
  const order = await getBuyerOrderById(buyerId, orderId);

  if (!order) {
    throw new Error('الطلب غير موجود');
  }

  if (order.status !== 'pending' && order.status !== 'review') {
    throw new Error('لا يمكن إلغاء الطلب بعد أن بدأ الحرفي بتجهيزه أو شحنه');
  }

  const { db, isMongo } = await getDatabase();

  // Restore product stock
  for (const item of order.items) {
    if (isMongo && db) {
      try {
        await db.collection('products').updateOne(
          { id: item.productId },
          {
            $inc: { stockCount: item.quantity },
            $set: { inStock: true, updatedAt: new Date().toISOString() }
          }
        );
      } catch (e) {
        console.error('[OrderService] Mongo restore stock error:', e);
      }
    }

    const memProduct = memoryDb.products.find((p) => p.id === item.productId);
    if (memProduct) {
      memProduct.stockCount += item.quantity;
      memProduct.inStock = true;
    }
  }

  // Update order status
  order.status = 'cancelled';
  order.cancellationReason = reason || 'تم الإلغاء بواسطة المشتري';
  order.updatedAt = new Date().toISOString();
  order.timeline.push({
    status: 'cancelled',
    title: 'تم إلغاء الطلب',
    description: order.cancellationReason,
    time: 'الآن',
    done: true
  });

  if (isMongo && db) {
    try {
      await db.collection('orders').updateOne(
        { id: orderId },
        {
          $set: {
            status: 'cancelled',
            cancellationReason: order.cancellationReason,
            updatedAt: order.updatedAt,
            timeline: order.timeline
          }
        }
      );
    } catch (e) {
      console.error('[OrderService] Mongo update cancelled order error:', e);
    }
  }

  const memIdx = memoryDb.orders.findIndex((o) => o.id === orderId);
  if (memIdx >= 0) {
    memoryDb.orders[memIdx] = order;
  }

  return order;
}

/**
 * Get orders for a specific seller
 */
export async function getSellerOrders(sellerId: string): Promise<OrderDocument[]> {
  const { db, isMongo } = await getDatabase();

  if (isMongo && db) {
    try {
      const mongoOrders = (await db
        .collection('orders')
        .find({ sellerIds: sellerId })
        .sort({ createdAt: -1 })
        .toArray()) as unknown as OrderDocument[];
      if (mongoOrders.length > 0) return mongoOrders;
    } catch (e) {
      console.error('[OrderService] Mongo fetch seller orders error:', e);
    }
  }

  return memoryDb.orders
    .filter((ord) => ord.sellerIds && ord.sellerIds.includes(sellerId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Update order fulfillment status by seller
 */
export async function updateSellerOrderStatus(
  seller: AuthenticatedUser,
  orderId: string,
  newStatus: OrderStatus,
  note?: string
): Promise<OrderDocument> {
  const sellerId = seller.sellerId || seller.id;
  const { db, isMongo } = await getDatabase();

  let order: OrderDocument | null = null;
  if (isMongo && db) {
    try {
      order = (await db.collection('orders').findOne({ id: orderId })) as unknown as OrderDocument | null;
    } catch (e) {
      console.error('[OrderService] Mongo fetch order error:', e);
    }
  }


  if (!order) {
    order = memoryDb.orders.find((o) => o.id === orderId) || null;
  }

  if (!order) {
    throw new Error('الطلب غير موجود');
  }

  if (!order.sellerIds.includes(sellerId) && seller.role !== 'admin') {
    throw new Error('ليس لديك صلاحية لتحديث هذا الطلب');
  }

  order.status = newStatus;
  order.updatedAt = new Date().toISOString();

  // Mark appropriate timeline step as done
  let stepMatched = false;
  order.timeline = order.timeline.map((step) => {
    if (step.status === newStatus) {
      stepMatched = true;
      return {
        ...step,
        done: true,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        description: note || step.description
      };
    }
    return step;
  });

  if (!stepMatched) {
    order.timeline.push({
      status: newStatus,
      title: `تحديث الحالة إلى ${newStatus}`,
      description: note || 'تم تحديث مسار الشحن',
      time: 'الآن',
      done: true
    });
  }

  if (isMongo && db) {
    try {
      await db.collection('orders').updateOne(
        { id: orderId },
        {
          $set: {
            status: order.status,
            updatedAt: order.updatedAt,
            timeline: order.timeline
          }
        }
      );
    } catch (e) {
      console.error('[OrderService] Mongo update order status error:', e);
    }
  }

  const memIdx = memoryDb.orders.findIndex((o) => o.id === orderId);
  if (memIdx >= 0) {
    memoryDb.orders[memIdx] = order;
  }

  await addAuditLog({
    actorId: seller.id,
    userName: seller.name,
    userRole: seller.role,
    action: 'تحديث حالة طلب من الورشة',
    resource: 'الطلبات',
    resourceId: order.id,
    status: 'نجاح',
    details: `تم تغيير حالة الطلب #${order.orderNumber} إلى "${newStatus}"`
  });

  return order;
}

/**
 * Admin: List all platform orders with filters
 */
export async function getAdminOrders(filters?: {
  status?: string;
  governorate?: string;
  search?: string;
}): Promise<OrderDocument[]> {
  const { db, isMongo } = await getDatabase();

  let orders: OrderDocument[] = [];
  if (isMongo && db) {
    try {
      orders = (await db
        .collection('orders')
        .find()
        .sort({ createdAt: -1 })
        .toArray()) as unknown as OrderDocument[];
    } catch (e) {
      console.error('[OrderService] Mongo fetch admin orders error:', e);
    }
  }

  if (orders.length === 0) {
    orders = [...memoryDb.orders];
  }

  if (filters?.status && filters.status !== 'all') {
    orders = orders.filter((o) => o.status === filters.status);
  }

  if (filters?.governorate && filters.governorate !== 'all') {
    orders = orders.filter((o) => o.shippingAddress.governorate === filters.governorate);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.buyerName.toLowerCase().includes(q) ||
        o.buyerPhone.includes(q)
    );
  }

  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Admin: Update order status, payment status, and tracking number
 */
export async function updateAdminOrderStatus(
  admin: AuthenticatedUser,
  orderId: string,
  newStatus?: OrderStatus,
  paymentStatus?: PaymentStatus,
  trackingNumber?: string
): Promise<OrderDocument> {
  const { db, isMongo } = await getDatabase();

  let order: OrderDocument | null = null;
  if (isMongo && db) {
    try {
      order = (await db.collection('orders').findOne({ id: orderId })) as unknown as OrderDocument | null;
    } catch (e) {
      console.error('[OrderService] Mongo find order error:', e);
    }
  }


  if (!order) {
    order = memoryDb.orders.find((o) => o.id === orderId) || null;
  }

  if (!order) {
    throw new Error('الطلب غير موجود');
  }

  if (newStatus) {
    order.status = newStatus;
    order.timeline = order.timeline.map((step) => {
      if (step.status === newStatus) {
        return {
          ...step,
          done: true,
          time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return step;
    });
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }

  order.updatedAt = new Date().toISOString();

  if (isMongo && db) {
    try {
      await db.collection('orders').updateOne(
        { id: orderId },
        {
          $set: {
            status: order.status,
            paymentStatus: order.paymentStatus,
            trackingNumber: order.trackingNumber,
            updatedAt: order.updatedAt,
            timeline: order.timeline
          }
        }
      );
    } catch (e) {
      console.error('[OrderService] Mongo update admin order error:', e);
    }
  }

  const memIdx = memoryDb.orders.findIndex((o) => o.id === orderId);
  if (memIdx >= 0) {
    memoryDb.orders[memIdx] = order;
  }

  await addAuditLog({
    actorId: admin.id,
    userName: admin.name,
    userRole: 'admin',
    action: 'إدارة الطلبات من الإدارة',
    resource: 'الطلبات',
    resourceId: order.id,
    status: 'نجاح',
    details: `تم تحديث الطلب #${order.orderNumber} - الحالة: ${order.status}، الدفع: ${order.paymentStatus}`
  });

  return order;
}
