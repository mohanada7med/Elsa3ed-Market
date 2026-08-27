import { memoryDb, getDatabase } from '../db/mongodb.ts';
import { DiscountCouponDocument } from '../models/types.ts';

export interface DiscountValidationResult {
  valid: boolean;
  coupon?: DiscountCouponDocument;
  discountAmount: number;
  message?: string;
}

export async function getActiveCoupon(code: string): Promise<DiscountCouponDocument | null> {
  const cleanCode = code.trim().toUpperCase();
  const { db, isMongo } = await getDatabase();

  let coupon: DiscountCouponDocument | null = null;

  if (isMongo && db) {
    try {
      coupon = (await db.collection('discounts').findOne({
        code: cleanCode,
        active: true
      })) as unknown as DiscountCouponDocument | null;
    } catch (e) {
      console.error('[DiscountService] Error fetching coupon from Mongo:', e);
    }
  }

  if (!coupon) {
    coupon = memoryDb.discounts.find((d) => d.code.toUpperCase() === cleanCode && d.active) || null;
  }

  if (!coupon) {
    return null;
  }

  // Check expiration
  if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
    return null;
  }

  return coupon;
}

export async function validateAndCalculateDiscount(
  code: string | undefined,
  subtotal: number
): Promise<DiscountValidationResult> {
  if (!code || !code.trim()) {
    return {
      valid: false,
      discountAmount: 0
    };
  }

  const coupon = await getActiveCoupon(code);

  if (!coupon) {
    return {
      valid: false,
      discountAmount: 0,
      message: 'كود الخصم غير صحيح أو منتهي الصلاحية'
    };
  }

  if (subtotal < coupon.minOrderValue) {
    return {
      valid: false,
      coupon,
      discountAmount: 0,
      message: `الحد الأدنى لتطبيق هذا الكوبون هو ${coupon.minOrderValue} ج.م`
    };
  }

  // Calculate discount percentage
  let amount = Math.round((subtotal * coupon.discountPercent) / 100);
  if (coupon.maxDiscount && amount > coupon.maxDiscount) {
    amount = coupon.maxDiscount;
  }

  return {
    valid: true,
    coupon,
    discountAmount: amount,
    message: `تم تطبيق خصم ${coupon.discountPercent}% بنجاح`
  };
}

export async function incrementCouponUsage(code: string): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  const { db, isMongo } = await getDatabase();

  if (isMongo && db) {
    try {
      await db.collection('discounts').updateOne(
        { code: cleanCode },
        { $inc: { usageCount: 1 } }
      );
    } catch (e) {
      console.error('[DiscountService] Error updating coupon usage:', e);
    }
  }

  const memoryCoupon = memoryDb.discounts.find((d) => d.code.toUpperCase() === cleanCode);
  if (memoryCoupon) {
    memoryCoupon.usageCount = (memoryCoupon.usageCount || 0) + 1;
  }
}
