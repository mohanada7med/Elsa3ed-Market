import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { ProductDocument, StockMovementDocument } from '../models/types.ts';
import { AuthenticatedUser } from '../middleware/auth.ts';
import { createAuditLog } from './auditService.ts';

export interface InventoryItemDTO {
  product: ProductDocument;
  currentStock: number;
  soldQuantity: number;
  availableStock: number;
  lowStockThreshold: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastMovement?: StockMovementDocument;
}

/**
 * Get seller's complete inventory breakdown.
 */
export async function getSellerInventory(sellerId: string): Promise<InventoryItemDTO[]> {
  const { db, isMongo } = await getDatabase();
  let products: ProductDocument[] = [];
  let orders: any[] = [];
  let movements: StockMovementDocument[] = [];

  if (isMongo && db) {
    try {
      products = (await db.collection('products').find({ sellerId }).sort({ stockCount: 1 }).toArray()) as unknown as ProductDocument[];
      orders = await db.collection('orders').find({ sellerIds: sellerId }).toArray();
      movements = (await db.collection('stock_movements').find({ sellerId }).sort({ timestamp: -1 }).toArray()) as unknown as StockMovementDocument[];
    } catch (e) {
      console.error('[InventoryService] MongoDB fetch error:', e);
    }
  }

  if (products.length === 0) {
    products = memoryDb.products.filter((p) => p.sellerId === sellerId) as ProductDocument[];
  }
  if (orders.length === 0) {
    orders = memoryDb.orders.filter((o) => o.sellerIds.includes(sellerId));
  }
  if (movements.length === 0) {
    movements = memoryDb.stockMovements.filter((m) => m.sellerId === sellerId);
  }

  // Calculate sold quantities per product from orders
  const soldMap: Record<string, number> = {};
  for (const order of orders) {
    if (order.status !== 'cancelled') {
      for (const item of order.items || []) {
        soldMap[item.productId] = (soldMap[item.productId] || 0) + (item.quantity || 1);
      }
    }
  }

  const DEFAULT_LOW_STOCK_THRESHOLD = 5;

  return products.map((prod) => {
    const currentStock = Number(prod.stockCount) || 0;
    const soldQuantity = soldMap[prod.id] || 0;
    const threshold = DEFAULT_LOW_STOCK_THRESHOLD;
    
    let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
    if (currentStock === 0) {
      stockStatus = 'out_of_stock';
    } else if (currentStock <= threshold) {
      stockStatus = 'low_stock';
    }

    const lastMovement = movements.find((m) => m.productId === prod.id);

    return {
      product: prod,
      currentStock,
      soldQuantity,
      availableStock: currentStock,
      lowStockThreshold: threshold,
      stockStatus,
      lastMovement
    };
  });
}

/**
 * Update stock count for a seller's product.
 * NOTE: Updating inventory does NOT trigger re-moderation of the product.
 */
export async function updateSellerStock(
  sellerUser: AuthenticatedUser,
  productId: string,
  newStock: number,
  reason = 'تعديل يدوي للمخزون'
): Promise<{ product: ProductDocument; movement: StockMovementDocument }> {
  const sellerId = sellerUser.sellerId || sellerUser.id;
  const numStock = Number(newStock);

  if (isNaN(numStock) || numStock < 0) {
    throw new Error('كمية المخزون يجب أن تكون رقماً صحيحاً أكبر من أو يساوي الصفر');
  }

  const { db, isMongo } = await getDatabase();
  let product: ProductDocument | null = null;

  if (isMongo && db) {
    try {
      product = (await db.collection('products').findOne({ id: productId })) as unknown as ProductDocument | null;
    } catch (e) {
      console.error('[InventoryService] Product lookup error:', e);
    }
  }
  if (!product) {
    product = (memoryDb.products.find((p) => p.id === productId) as ProductDocument) || null;
  }

  if (!product) {
    throw new Error('المنتج غير موجود');
  }

  // IDOR check: Seller can only edit own products unless admin
  if (sellerUser.role !== 'admin' && product.sellerId !== sellerId) {
    throw new Error('غير مصرح لك بتعديل مخزون هذا المنتج (IDOR Check Failed)');
  }

  const previousStock = Number(product.stockCount) || 0;
  const diff = numStock - previousStock;
  const type: StockMovementDocument['type'] =
    diff > 0 ? 'STOCK_ADDED' : diff < 0 ? 'STOCK_REMOVED' : 'MANUAL_ADJUSTMENT';

  const updatedFields = {
    stockCount: numStock,
    inStock: numStock > 0,
    updatedAt: new Date().toISOString().split('T')[0]
  };

  if (isMongo && db) {
    try {
      await db.collection('products').updateOne({ id: productId }, { $set: updatedFields });
    } catch (e) {
      console.error('[InventoryService] Update product error:', e);
    }
  }

  const memProd = memoryDb.products.find((p) => p.id === productId);
  if (memProd) {
    Object.assign(memProd, updatedFields);
  }

  const updatedProduct = { ...product, ...updatedFields };

  // Create Stock Movement record
  const movement: StockMovementDocument = {
    id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    productId,
    productTitle: product.title,
    sellerId: product.sellerId,
    type,
    quantity: Math.abs(diff),
    previousStock,
    newStock: numStock,
    reason: reason.trim(),
    actorId: sellerUser.id,
    actorName: sellerUser.name,
    timestamp: new Date().toISOString()
  };

  if (isMongo && db) {
    try {
      await db.collection('stock_movements').insertOne(movement as any);
    } catch (e) {
      console.error('[InventoryService] Insert movement error:', e);
    }
  }

  memoryDb.stockMovements.unshift(movement);

  await createAuditLog({
    actorId: sellerUser.id,
    userName: sellerUser.name,
    userRole: sellerUser.role,
    action: 'INVENTORY_UPDATED',
    resource: 'مخزون منتج',
    resourceId: productId,
    status: 'نجاح',
    details: `قام ${sellerUser.name} بتحديث مخزون "${product.title}" من ${previousStock} إلى ${numStock} قطعة (${reason})`,
    metadata: { productId, previousStock, newStock: numStock, reason }
  });

  return { product: updatedProduct, movement };
}

/**
 * Get stock movements history for seller.
 */
export async function getStockMovements(sellerId: string, productId?: string): Promise<StockMovementDocument[]> {
  const { db, isMongo } = await getDatabase();
  let movements: StockMovementDocument[] = [];

  if (isMongo && db) {
    try {
      const query: any = { sellerId };
      if (productId) query.productId = productId;
      movements = (await db.collection('stock_movements').find(query).sort({ timestamp: -1 }).limit(100).toArray()) as unknown as StockMovementDocument[];
      if (movements.length > 0) return movements;
    } catch (e) {
      console.error('[InventoryService] MongoDB getStockMovements error:', e);
    }
  }

  movements = memoryDb.stockMovements.filter((m) => {
    if (m.sellerId !== sellerId) return false;
    if (productId && m.productId !== productId) return false;
    return true;
  });

  return movements;
}
