import type { WholesaleTier, ProductDocument } from '../models/types';

/**
 * حساب سعر القطعة الفعلي بناءً على الكمية المطلوبة وشرائح أسعار الجملة للورش
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
