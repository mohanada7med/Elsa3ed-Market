import type { Product, WholesaleTier } from '../types';

export interface ActiveTierInfo {
  tier: WholesaleTier | null;
  discountPercent: number;
  unitPrice: number;
  savingsPerUnit: number;
  totalSavings: number;
}

export interface NextTierInfo {
  tier: WholesaleTier;
  itemsNeeded: number;
  discountPercent: number;
  potentialUnitPrice: number;
}

/**
 * الشرائح النموذجية المقترحة لحرفيي وورش صعيد مصر
 */
export const STANDARD_WHOLESALE_PRESETS: Array<{
  minQty: number;
  discountPercent: number;
  label: string;
}> = [
  { minQty: 5, discountPercent: 15, label: 'كميات صغيرة وبازارات' },
  { minQty: 15, discountPercent: 25, label: 'تجهيز فنادق ومطاعم' },
  { minQty: 50, discountPercent: 35, label: 'توريدات كبرى وتصدير' }
];

/**
 * حساب سعر القطعة الفعلي بناءً على الكمية المطلوبة وشرائح أسعار الجملة
 */
export function getEffectiveUnitPrice(
  product: {
    price: number;
    wholesaleEnabled?: boolean;
    wholesalePrice?: number;
    wholesaleMinQty?: number;
    wholesaleTiers?: WholesaleTier[];
  } | null | undefined,
  quantity: number = 1
): number {
  if (!product) return 0;
  const basePrice = Number(product.price) || 0;
  const qty = Math.max(1, Number(quantity) || 1);

  if (qty <= 1) return basePrice;

  // 1. فحص الشرائح المتعددة
  if (Array.isArray(product.wholesaleTiers) && product.wholesaleTiers.length > 0) {
    const validTiers = product.wholesaleTiers
      .filter((t) => Number(t.minQty) > 1 && Number(t.price) > 0)
      .sort((a, b) => Number(b.minQty) - Number(a.minQty));

    for (const tier of validTiers) {
      if (qty >= Number(tier.minQty)) {
        return Math.min(basePrice, Number(tier.price));
      }
    }
  }

  // 2. فحص السعر القديم الفردي بالجملة كبديل
  if (
    product.wholesalePrice &&
    product.wholesaleMinQty &&
    qty >= Number(product.wholesaleMinQty)
  ) {
    return Math.min(basePrice, Number(product.wholesalePrice));
  }

  return basePrice;
}

/**
 * استخراج تفاصيل الشريحة النشطة الحالية وقيمة التوفير
 */
export function getActiveWholesaleTier(
  product: {
    price: number;
    wholesalePrice?: number;
    wholesaleMinQty?: number;
    wholesaleTiers?: WholesaleTier[];
  } | null | undefined,
  quantity: number = 1
): ActiveTierInfo | null {
  if (!product) return null;
  const basePrice = Number(product.price) || 0;
  const qty = Math.max(1, Number(quantity) || 1);
  const effectiveUnitPrice = getEffectiveUnitPrice(product, qty);
  const savingsPerUnit = Math.max(0, basePrice - effectiveUnitPrice);

  if (savingsPerUnit <= 0) {
    return null;
  }

  let matchedTier: WholesaleTier | null = null;
  if (Array.isArray(product.wholesaleTiers) && product.wholesaleTiers.length > 0) {
    const sortedTiers = [...product.wholesaleTiers]
      .filter((t) => Number(t.minQty) > 1 && Number(t.price) > 0)
      .sort((a, b) => Number(b.minQty) - Number(a.minQty));

    for (const t of sortedTiers) {
      if (qty >= Number(t.minQty)) {
        matchedTier = t;
        break;
      }
    }
  }

  if (!matchedTier && product.wholesalePrice && product.wholesaleMinQty && qty >= Number(product.wholesaleMinQty)) {
    matchedTier = {
      minQty: Number(product.wholesaleMinQty),
      price: Number(product.wholesalePrice),
      label: 'سعر جملة الورشة'
    };
  }

  const discountPercent = basePrice > 0
    ? Math.round((savingsPerUnit / basePrice) * 100)
    : 0;

  return {
    tier: matchedTier,
    discountPercent,
    unitPrice: effectiveUnitPrice,
    savingsPerUnit,
    totalSavings: savingsPerUnit * qty
  };
}

/**
 * معرفة الشريحة التالية المتاحة لتشجيع العميل على زيادة الكمية
 */
export function getNextWholesaleTier(
  product: {
    price: number;
    wholesaleTiers?: WholesaleTier[];
  } | null | undefined,
  currentQuantity: number = 1
): NextTierInfo | null {
  if (!product || !Array.isArray(product.wholesaleTiers) || product.wholesaleTiers.length === 0) {
    return null;
  }

  const basePrice = Number(product.price) || 0;
  const qty = Math.max(1, Number(currentQuantity) || 1);

  // الشرائح مرتبة تصاعدياً
  const ascendingTiers = [...product.wholesaleTiers]
    .filter((t) => Number(t.minQty) > qty && Number(t.price) > 0 && Number(t.price) < basePrice)
    .sort((a, b) => Number(a.minQty) - Number(b.minQty));

  const nextTier = ascendingTiers[0];
  if (!nextTier) return null;

  const itemsNeeded = Number(nextTier.minQty) - qty;
  const savingsPerUnit = Math.max(0, basePrice - Number(nextTier.price));
  const discountPercent = basePrice > 0 ? Math.round((savingsPerUnit / basePrice) * 100) : 0;

  return {
    tier: nextTier,
    itemsNeeded,
    discountPercent,
    potentialUnitPrice: Number(nextTier.price)
  };
}
