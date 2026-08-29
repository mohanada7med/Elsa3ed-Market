import { memoryDb, getDatabase } from '../db/mongodb.ts';
import type { DiscountCouponDocument } from '../models/types.ts';

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

export async function getAllDiscounts(): Promise<DiscountCouponDocument[]> {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const discounts = await db.collection('discounts').find({}).sort({ createdAt: -1 }).toArray();
      return discounts as unknown as DiscountCouponDocument[];
    } catch (e) {
      console.error('[DiscountService] Error fetching discounts from Mongo:', e);
    }
  }
  return memoryDb.discounts;
}

export async function createDiscount(data: {
  code: string;
  discountPercent: number;
  maxDiscount?: number;
  minOrderValue: number;
  active?: boolean;
  validUntil?: string;
  description?: string;
}): Promise<DiscountCouponDocument> {
  const cleanCode = data.code.trim().toUpperCase();
  const id = `coupon-${Date.now()}`;
  const now = new Date().toISOString();

  const newCoupon: DiscountCouponDocument = {
    id,
    code: cleanCode,
    discountPercent: Number(data.discountPercent),
    maxDiscount: data.maxDiscount !== undefined ? Number(data.maxDiscount) : undefined,
    minOrderValue: Number(data.minOrderValue || 0),
    active: data.active !== undefined ? Boolean(data.active) : true,
    validUntil: data.validUntil || undefined,
    description: data.description || undefined,
    usageCount: 0,
    createdAt: now,
    updatedAt: now
  };

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('discounts').insertOne(newCoupon as any);
      return newCoupon;
    } catch (e) {
      console.error('[DiscountService] Error inserting discount in Mongo:', e);
      throw new Error('كود الخصم موجود بالفعل أو حدث خطأ أثناء الحفظ');
    }
  }

  const exists = memoryDb.discounts.some(d => d.code === cleanCode);
  if (exists) {
    throw new Error('كود الخصم موجود بالفعل');
  }
  memoryDb.discounts.unshift(newCoupon);
  return newCoupon;
}

export async function updateDiscount(
  id: string,
  data: Partial<DiscountCouponDocument>
): Promise<DiscountCouponDocument> {
  const { db, isMongo } = await getDatabase();
  const now = new Date().toISOString();
  const updatePayload: any = { ...data, updatedAt: now };
  if (updatePayload.code) {
    updatePayload.code = updatePayload.code.trim().toUpperCase();
  }

  if (isMongo && db) {
    try {
      const res = await db.collection('discounts').findOneAndUpdate(
        { $or: [{ id }, { _id: id as any }] },
        { $set: updatePayload },
        { returnDocument: 'after' }
      );
      if (res) return res as unknown as DiscountCouponDocument;
    } catch (e) {
      console.error('[DiscountService] Error updating discount in Mongo:', e);
    }
  }

  const idx = memoryDb.discounts.findIndex(d => d.id === id);
  if (idx !== -1) {
    memoryDb.discounts[idx] = { ...memoryDb.discounts[idx], ...updatePayload };
    return memoryDb.discounts[idx];
  }
  throw new Error('كود الخصم غير موجود');
}

export async function deleteDiscount(id: string): Promise<boolean> {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const res = await db.collection('discounts').deleteOne({
        $or: [{ id }, { _id: id as any }]
      });
      return res.deletedCount > 0;
    } catch (e) {
      console.error('[DiscountService] Error deleting discount from Mongo:', e);
    }
  }
  const idx = memoryDb.discounts.findIndex(d => d.id === id);
  if (idx !== -1) {
    memoryDb.discounts.splice(idx, 1);
    return true;
  }
  return false;
}

export async function toggleDiscountStatus(id: string): Promise<DiscountCouponDocument> {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const current = await db.collection('discounts').findOne({
        $or: [{ id }, { _id: id as any }]
      });
      if (current) {
        const nextActive = !current.active;
        const res = await db.collection('discounts').findOneAndUpdate(
          { _id: current._id },
          { $set: { active: nextActive, updatedAt: new Date().toISOString() } },
          { returnDocument: 'after' }
        );
        return res as unknown as DiscountCouponDocument;
      }
    } catch (e) {
      console.error('[DiscountService] Error toggling discount in Mongo:', e);
    }
  }

  const doc = memoryDb.discounts.find(d => d.id === id);
  if (doc) {
    doc.active = !doc.active;
    doc.updatedAt = new Date().toISOString();
    return doc;
  }
  throw new Error('كود الخصم غير موجود');
}
