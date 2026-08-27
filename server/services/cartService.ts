import { memoryDb, getDatabase } from '../db/mongodb.ts';
import {
  CartDocument,
  CartItemDocument,
  PopulatedCartItem,
  ProductDocument
} from '../models/types.ts';
import { calculateShipping } from './shippingService.ts';
import { validateAndCalculateDiscount } from './discountService.ts';

export interface CartSummary {
  id: string;
  buyerId: string;
  items: PopulatedCartItem[];
  cartCount: number;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  discountCode?: string;
  total: number;
  isAllAvailable: boolean;
  warnings: string[];
}

/**
 * Helper to get or create raw CartDocument for buyer
 */
async function getRawCart(buyerId: string): Promise<CartDocument> {
  const { db, isMongo } = await getDatabase();
  let cart: CartDocument | null = null;

  if (isMongo && db) {
    try {
      cart = (await db.collection('carts').findOne({ buyerId })) as unknown as CartDocument | null;
    } catch (e) {
      console.error('[CartService] Error fetching cart from MongoDB:', e);
    }
  }


  if (!cart) {
    cart = memoryDb.carts.find((c) => c.buyerId === buyerId) || null;
  }

  if (!cart) {
    cart = {
      id: `cart-${buyerId}`,
      buyerId,
      items: [],
      updatedAt: new Date().toISOString()
    };

    if (isMongo && db) {
      try {
        await db.collection('carts').insertOne(cart);
      } catch (e) {
        console.error('[CartService] Error inserting new cart in Mongo:', e);
      }
    }
    memoryDb.carts.push(cart);
  }

  return cart;
}

/**
 * Save raw CartDocument back to store
 */
async function saveRawCart(cart: CartDocument): Promise<void> {
  cart.updatedAt = new Date().toISOString();
  const { db, isMongo } = await getDatabase();

  if (isMongo && db) {
    try {
      await db.collection('carts').updateOne(
        { buyerId: cart.buyerId },
        { $set: { items: cart.items, updatedAt: cart.updatedAt } },
        { upsert: true }
      );
    } catch (e) {
      console.error('[CartService] Error saving cart in Mongo:', e);
    }
  }

  const idx = memoryDb.carts.findIndex((c) => c.buyerId === cart.buyerId);
  if (idx >= 0) {
    memoryDb.carts[idx] = cart;
  } else {
    memoryDb.carts.push(cart);
  }
}

/**
 * Get and populate cart with real-time product prices and stock validation
 */
export async function getCart(
  buyerId: string,
  couponCode?: string,
  governorate?: string
): Promise<CartSummary> {
  const rawCart = await getRawCart(buyerId);
  const { db, isMongo } = await getDatabase();

  const productIds = rawCart.items.map((it) => it.productId);
  let products: ProductDocument[] = [];

  if (productIds.length > 0) {
    if (isMongo && db) {
      try {
        products = (await db
          .collection('products')
          .find({ id: { $in: productIds } })
          .toArray()) as unknown as ProductDocument[];
      } catch (e) {
        console.error('[CartService] Error fetching products for cart:', e);
      }
    }


    if (products.length === 0) {
      products = memoryDb.products.filter((p) => productIds.includes(p.id)) as ProductDocument[];
    }
  }

  const productMap = new Map<string, ProductDocument>();
  products.forEach((p) => productMap.set(p.id, p));

  const populatedItems: PopulatedCartItem[] = [];
  const warnings: string[] = [];
  let isAllAvailable = true;
  let subtotal = 0;
  let cartCount = 0;

  for (const item of rawCart.items) {
    const product = productMap.get(item.productId);

    if (!product) {
      warnings.push(`المنتج ذو الرمز ${item.productId} لم يعد متوفراً في المتجر.`);
      isAllAvailable = false;
      continue;
    }

    const isApproved = product.approvalStatus === 'approved';
    const isStockValid = product.inStock && product.stockCount >= item.quantity;
    let itemWarning: string | undefined;

    if (!isApproved) {
      itemWarning = 'هذا المنتج قيد المراجعة أو غير متاح للشراء حالياً';
      isAllAvailable = false;
    } else if (!product.inStock || product.stockCount <= 0) {
      itemWarning = 'نفدت الكمية المتوفرة من هذا المنتج بالورشة';
      isAllAvailable = false;
    } else if (item.quantity > product.stockCount) {
      itemWarning = `الكمية المتاحة بالورشة حالياً هي ${product.stockCount} قطع فقط`;
      isAllAvailable = false;
    }

    const itemSubtotal = product.price * item.quantity;
    if (isApproved && product.inStock) {
      subtotal += itemSubtotal;
      cartCount += item.quantity;
    }

    populatedItems.push({
      product,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      customNote: item.customNote,
      itemSubtotal,
      isAvailable: isApproved && isStockValid,
      stockCount: product.stockCount,
      warning: itemWarning
    });
  }

  // Shipping calculation
  const shippingInfo = calculateShipping(subtotal, governorate);

  // Discount calculation
  const discountResult = await validateAndCalculateDiscount(couponCode, subtotal);
  if (couponCode && !discountResult.valid && discountResult.message) {
    warnings.push(discountResult.message);
  }

  const discountAmount = discountResult.valid ? discountResult.discountAmount : 0;
  const total = Math.max(0, subtotal + shippingInfo.fee - discountAmount);

  return {
    id: rawCart.id,
    buyerId,
    items: populatedItems,
    cartCount,
    subtotal,
    shippingFee: shippingInfo.fee,
    discountAmount,
    discountCode: discountResult.valid && discountResult.coupon ? discountResult.coupon.code : undefined,
    total,
    isAllAvailable,
    warnings
  };
}

/**
 * Add item to cart with server-side product and stock validation
 */
export async function addToCart(
  buyerId: string,
  productId: string,
  quantity = 1,
  selectedColor?: string,
  customNote?: string
): Promise<CartSummary> {
  if (quantity <= 0) {
    throw new Error('الكمية المطلوبة يجب أن تكون قطعة واحدة على الأقل');
  }

  const { db, isMongo } = await getDatabase();
  let product: ProductDocument | null = null;

  if (isMongo && db) {
    try {
      product = (await db.collection('products').findOne({ id: productId })) as unknown as ProductDocument | null;
    } catch (e) {
      console.error('[CartService] Error finding product in Mongo:', e);
    }
  }

  if (!product) {
    product = (memoryDb.products.find((p) => p.id === productId) as ProductDocument) || null;
  }

  if (!product) {
    throw new Error('المنتج غير موجود بسوق الصعيد');
  }

  if (product.approvalStatus !== 'approved') {
    throw new Error('هذا المنتج لم يتم اعتماده بعد في المتجر العام');
  }

  if (!product.inStock || product.stockCount <= 0) {
    throw new Error('عفواً، نفدت الكمية المتوفرة من هذه القطعة التراثية');
  }

  const rawCart = await getRawCart(buyerId);
  const existingIndex = rawCart.items.findIndex((it) => it.productId === productId);

  const currentQty = existingIndex >= 0 ? rawCart.items[existingIndex].quantity : 0;
  const newTotalQty = currentQty + quantity;

  if (newTotalQty > product.stockCount) {
    throw new Error(
      `الكمية المتاحة بالورشة حالياً هي ${product.stockCount} قطع فقط. (لديك ${currentQty} بالسلة)`
    );
  }

  if (existingIndex >= 0) {
    rawCart.items[existingIndex].quantity = newTotalQty;
    if (selectedColor) rawCart.items[existingIndex].selectedColor = selectedColor;
    if (customNote) rawCart.items[existingIndex].customNote = customNote;
  } else {
    rawCart.items.push({
      productId,
      quantity,
      selectedColor,
      customNote,
      addedAt: new Date().toISOString()
    });
  }

  await saveRawCart(rawCart);
  return getCart(buyerId);
}

/**
 * Update item quantity in cart
 */
export async function updateCartItemQuantity(
  buyerId: string,
  productId: string,
  quantity: number
): Promise<CartSummary> {
  const rawCart = await getRawCart(buyerId);

  if (quantity <= 0) {
    rawCart.items = rawCart.items.filter((it) => it.productId !== productId);
    await saveRawCart(rawCart);
    return getCart(buyerId);
  }

  // Validate stock
  const { db, isMongo } = await getDatabase();
  let product: ProductDocument | null = null;

  if (isMongo && db) {
    try {
      product = (await db.collection('products').findOne({ id: productId })) as unknown as ProductDocument | null;
    } catch (e) {
      console.error('[CartService] Error finding product in Mongo:', e);
    }
  }


  if (!product) {
    product = (memoryDb.products.find((p) => p.id === productId) as ProductDocument) || null;
  }

  if (product && quantity > product.stockCount) {
    throw new Error(`الكمية المتاحة في الورشة هي ${product.stockCount} قطع فقط`);
  }

  const existingIndex = rawCart.items.findIndex((it) => it.productId === productId);
  if (existingIndex >= 0) {
    rawCart.items[existingIndex].quantity = quantity;
    await saveRawCart(rawCart);
  }

  return getCart(buyerId);
}

/**
 * Remove an item from cart
 */
export async function removeCartItem(buyerId: string, productId: string): Promise<CartSummary> {
  const rawCart = await getRawCart(buyerId);
  rawCart.items = rawCart.items.filter((it) => it.productId !== productId);
  await saveRawCart(rawCart);
  return getCart(buyerId);
}

/**
 * Clear all items from cart
 */
export async function clearCart(buyerId: string): Promise<CartSummary> {
  const rawCart = await getRawCart(buyerId);
  rawCart.items = [];
  await saveRawCart(rawCart);
  return getCart(buyerId);
}
