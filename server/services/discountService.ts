import { ObjectId } from 'mongodb';
import { memoryDb, getDatabase } from '../db/mongodb.ts';
import type { DiscountCouponDocument } from '../models/types.ts';
import { createAuditLog } from './auditService.ts';

export interface DiscountValidationResult {
  valid: boolean;
  coupon?: DiscountCouponDocument;
  discountAmount: number;
  message?: string;
}

/**
 * Builds an $or query array to match a coupon by its custom `id`, `code`, or MongoDB `_id`.
 */
function buildCouponQueryFilters(idOrCode: string): any[] {
  const clean = idOrCode.trim();
  const filters: any[] = [{ id: clean }, { code: clean.toUpperCase() }];
  if (ObjectId.isValid(clean) && clean.length === 24) {
    try {
      filters.push({ _id: new ObjectId(clean) });
    } catch {
      // Ignore invalid ObjectId format
    }
  }
  return filters;
}

export async function getActiveCoupon(code: string): Promise<DiscountCouponDocument | null> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return null;

  const { db, isMongo } = await getDatabase();
  let coupon: DiscountCouponDocument | null = null;

  if (isMongo && db) {
    try {
      const doc = await db.collection('discounts').findOne({
        code: cleanCode,
        active: true
      });
      if (doc) {
        coupon = {
          ...(doc as any),
          id: (doc as any).id || doc._id?.toString()
        };
      }
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

  // Check expiration if validUntil is specified
  if (coupon.validUntil) {
    const expiryDate = new Date(coupon.validUntil);
    // If only a date string was provided without time (e.g. YYYY-MM-DD), count until end of day
    if (!coupon.validUntil.includes('T')) {
      expiryDate.setHours(23, 59, 59, 999);
    }
    if (expiryDate.getTime() < Date.now()) {
      return null;
    }
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
      if (discounts && discounts.length > 0) {
        return discounts.map((d: any) => ({
          ...d,
          id: d.id || d._id?.toString()
        })) as unknown as DiscountCouponDocument[];
      }
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
  if (!cleanCode) {
    throw new Error('كود الخصم مطلوب');
  }

  const discountPercent = Number(data.discountPercent);
  if (isNaN(discountPercent) || discountPercent < 1 || discountPercent > 95) {
    throw new Error('نسبة الخصم يجب أن تكون بين 1% و 95%');
  }

  const minOrderValue = Math.max(0, Number(data.minOrderValue || 0));
  const maxDiscount = data.maxDiscount ? Math.max(1, Number(data.maxDiscount)) : undefined;

  const id = `coupon-${Date.now()}`;
  const now = new Date().toISOString();

  const newCoupon: DiscountCouponDocument = {
    id,
    code: cleanCode,
    discountPercent,
    maxDiscount,
    minOrderValue,
    active: data.active !== undefined ? Boolean(data.active) : true,
    validUntil: data.validUntil || undefined,
    description: data.description?.trim() || undefined,
    usageCount: 0,
    createdAt: now,
    updatedAt: now
  };

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const existing = await db.collection('discounts').findOne({ code: cleanCode });
      if (existing) {
        throw new Error(`كود الخصم "${cleanCode}" مسجل بالفعل`);
      }
      await db.collection('discounts').insertOne(newCoupon as any);
      // Keep memory store in sync
      const existsInMem = memoryDb.discounts.some((d) => d.code === cleanCode);
      if (!existsInMem) {
        memoryDb.discounts.unshift(newCoupon);
      }
      await createAuditLog({
        userName: 'مدير المنصة',
        userRole: 'admin',
        action: 'إنشاء كود خصم جديد',
        resource: 'كوبونات الخصم',
        resourceId: newCoupon.id,
        status: 'نجاح',
        details: `تم إنشاء كود الخصم "${cleanCode}" بنسبة خصم ${discountPercent}% وحد أدنى ${minOrderValue} ج.م`
      }).catch(() => {});
      return newCoupon;
    } catch (e: any) {
      console.error('[DiscountService] Error inserting discount in Mongo:', e);
      throw new Error(e?.message || 'كود الخصم موجود بالفعل أو حدث خطأ أثناء الحفظ');
    }
  }

  const exists = memoryDb.discounts.some((d) => d.code === cleanCode);
  if (exists) {
    throw new Error(`كود الخصم "${cleanCode}" مسجل بالفعل`);
  }
  memoryDb.discounts.unshift(newCoupon);
  await createAuditLog({
    userName: 'مدير المنصة',
    userRole: 'admin',
    action: 'إنشاء كود خصم جديد',
    resource: 'كوبونات الخصم',
    resourceId: newCoupon.id,
    status: 'نجاح',
    details: `تم إنشاء كود الخصم "${cleanCode}" بنسبة خصم ${discountPercent}% وحد أدنى ${minOrderValue} ج.م`
  }).catch(() => {});
  return newCoupon;
}

export async function updateDiscount(
  id: string,
  data: Partial<DiscountCouponDocument>
): Promise<DiscountCouponDocument> {
  const { db, isMongo } = await getDatabase();
  const now = new Date().toISOString();
  const updatePayload: any = { ...data, updatedAt: now };

  // Crucial: remove MongoDB _id and fixed id from $set so driver doesn't throw immutable field error
  delete updatePayload._id;
  delete updatePayload.id;

  if (updatePayload.code) {
    updatePayload.code = updatePayload.code.trim().toUpperCase();
  }
  if (updatePayload.discountPercent !== undefined) {
    const pct = Number(updatePayload.discountPercent);
    if (isNaN(pct) || pct < 1 || pct > 95) {
      throw new Error('نسبة الخصم يجب أن تكون بين 1% و 95%');
    }
    updatePayload.discountPercent = pct;
  }
  if (updatePayload.minOrderValue !== undefined) {
    updatePayload.minOrderValue = Math.max(0, Number(updatePayload.minOrderValue));
  }
  if (updatePayload.maxDiscount !== undefined) {
    updatePayload.maxDiscount =
      updatePayload.maxDiscount !== null && updatePayload.maxDiscount !== ''
        ? Math.max(1, Number(updatePayload.maxDiscount))
        : undefined;
  }
  if (updatePayload.active !== undefined) {
    updatePayload.active = Boolean(updatePayload.active);
  }
  if (updatePayload.description !== undefined) {
    updatePayload.description = updatePayload.description?.trim() || undefined;
  }
  if (updatePayload.validUntil !== undefined) {
    updatePayload.validUntil = updatePayload.validUntil?.trim() || undefined;
  }

  const queryFilters = buildCouponQueryFilters(id);

  if (isMongo && db) {
    try {
      const res = await db.collection('discounts').findOneAndUpdate(
        { $or: queryFilters },
        { $set: updatePayload },
        { returnDocument: 'after' }
      );
      if (res) {
        const doc = res as any;
        const result: DiscountCouponDocument = {
          ...doc,
          id: doc.id || doc._id?.toString()
        };
        // Update memoryDb too
        const mIdx = memoryDb.discounts.findIndex(
          (d) => d.id === id || d.code.toUpperCase() === (result.code || '').toUpperCase()
        );
        if (mIdx !== -1) {
          memoryDb.discounts[mIdx] = result;
        }
        await createAuditLog({
          userName: 'مدير المنصة',
          userRole: 'admin',
          action: 'تعديل كود خصم',
          resource: 'كوبونات الخصم',
          resourceId: result.id,
          status: 'نجاح',
          details: `تم تحديث بيانات كود الخصم "${result.code}" بنجاح (نسبة الخصم: ${result.discountPercent}%، الحد الأدنى: ${result.minOrderValue} ج.م)`
        }).catch(() => {});
        return result;
      }
    } catch (e: any) {
      console.error('[DiscountService] Error updating discount in Mongo:', e);
      throw new Error(e?.message || 'حدث خطأ أثناء تعديل كود الخصم');
    }
  }

  const idx = memoryDb.discounts.findIndex(
    (d) => d.id === id || d.code.toUpperCase() === id.toUpperCase()
  );
  if (idx !== -1) {
    memoryDb.discounts[idx] = { ...memoryDb.discounts[idx], ...updatePayload };
    await createAuditLog({
      userName: 'مدير المنصة',
      userRole: 'admin',
      action: 'تعديل كود خصم',
      resource: 'كوبونات الخصم',
      resourceId: memoryDb.discounts[idx].id,
      status: 'نجاح',
      details: `تم تحديث بيانات كود الخصم "${memoryDb.discounts[idx].code}" بنجاح (نسبة الخصم: ${memoryDb.discounts[idx].discountPercent}%، الحد الأدنى: ${memoryDb.discounts[idx].minOrderValue} ج.م)`
    }).catch(() => {});
    return memoryDb.discounts[idx];
  }
  throw new Error('كود الخصم غير موجود');
}

export async function deleteDiscount(id: string): Promise<boolean> {
  const { db, isMongo } = await getDatabase();
  const queryFilters = buildCouponQueryFilters(id);
  let deleted = false;

  if (isMongo && db) {
    try {
      const res = await db.collection('discounts').deleteOne({
        $or: queryFilters
      });
      if (res.deletedCount > 0) {
        deleted = true;
      }
    } catch (e) {
      console.error('[DiscountService] Error deleting discount from Mongo:', e);
    }
  }

  const idx = memoryDb.discounts.findIndex(
    (d) => d.id === id || d.code.toUpperCase() === id.toUpperCase()
  );
  if (idx !== -1) {
    memoryDb.discounts.splice(idx, 1);
    deleted = true;
  }

  if (deleted) {
    await createAuditLog({
      userName: 'مدير المنصة',
      userRole: 'admin',
      action: 'حذف كود خصم',
      resource: 'كوبونات الخصم',
      resourceId: id,
      status: 'تنبيه',
      details: `تم حذف كود الخصم "${id}" نهائياً من قاعدة البيانات`
    }).catch(() => {});
  }

  return deleted;
}

export async function toggleDiscountStatus(id: string): Promise<DiscountCouponDocument> {
  const { db, isMongo } = await getDatabase();
  const queryFilters = buildCouponQueryFilters(id);

  if (isMongo && db) {
    try {
      const current = await db.collection('discounts').findOne({
        $or: queryFilters
      });
      if (current) {
        const nextActive = !current.active;
        const res = await db.collection('discounts').findOneAndUpdate(
          { _id: current._id },
          { $set: { active: nextActive, updatedAt: new Date().toISOString() } },
          { returnDocument: 'after' }
        );
        if (res) {
          const doc = res as any;
          const result: DiscountCouponDocument = {
            ...doc,
            id: doc.id || doc._id?.toString()
          };
          const mIdx = memoryDb.discounts.findIndex(
            (d) => d.id === id || d.code === result.code
          );
          if (mIdx !== -1) {
            memoryDb.discounts[mIdx] = result;
          }
          await createAuditLog({
            userName: 'مدير المنصة',
            userRole: 'admin',
            action: 'تغيير حالة كود خصم',
            resource: 'كوبونات الخصم',
            resourceId: result.id,
            status: 'نجاح',
            details: `تم ${result.active ? 'تفعيل' : 'تعطيل'} كود الخصم "${result.code}" مؤقتاً`
          }).catch(() => {});
          return result;
        }
      }
    } catch (e) {
      console.error('[DiscountService] Error toggling discount in Mongo:', e);
    }
  }

  const doc = memoryDb.discounts.find(
    (d) => d.id === id || d.code.toUpperCase() === id.toUpperCase()
  );
  if (doc) {
    doc.active = !doc.active;
    doc.updatedAt = new Date().toISOString();
    await createAuditLog({
      userName: 'مدير المنصة',
      userRole: 'admin',
      action: 'تغيير حالة كود خصم',
      resource: 'كوبونات الخصم',
      resourceId: doc.id,
      status: 'نجاح',
      details: `تم ${doc.active ? 'تفعيل' : 'تعطيل'} كود الخصم "${doc.code}" مؤقتاً`
    }).catch(() => {});
    return doc;
  }
  throw new Error('كود الخصم غير موجود');
}
