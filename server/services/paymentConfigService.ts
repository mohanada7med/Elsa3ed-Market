import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { PaymentConfigDocument } from '../models/types.ts';
import type { AuthenticatedUser } from '../middleware/auth.ts';
import { addAuditLog } from './auditService.ts';

const DEFAULT_CONFIG: PaymentConfigDocument = {
  id: 'platform_payment_config',
  fawaterakApiKey: process.env.FAWATERAK_API_KEY || '',
  fawaterakVendorKey: process.env.FAWATERAK_VENDOR_KEY || '',
  fawaterakEnv: 'staging',
  isFawaterakActive: true,
  isCashOnDeliveryActive: true,
  instaPayAccount: 'elsa3ed@instapay',
  vodafoneCashNumber: '01158969931',
  instaPayInstructions: 'قم بالتحويل عبر تطبيق إنستاباي إلى المعرف الموضح أعلاه واضغط على "تم التحويل".',
  vodafoneCashInstructions: 'قم بتحويل المبلغ إلى رقم فودافون كاش الموضح أعلاه واضغط على "تم التحويل".',
  isInstaPayActive: false,
  isVodafoneCashActive: false,
  updatedAt: new Date().toISOString(),
  updatedBy: 'النظام'
};

/**
 * Get current platform payment configuration (Fawaterak gateway & COD & legacy accounts).
 */
export async function getPaymentConfig(): Promise<PaymentConfigDocument> {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const config = await db.collection('payment_configs').findOne({ id: 'platform_payment_config' });
      if (config) {
        return {
          ...DEFAULT_CONFIG,
          ...(config as unknown as PaymentConfigDocument)
        };
      }
    } catch (e) {
      console.error('[PaymentConfigService] Error fetching payment config from Mongo:', e);
    }
  }

  if (!memoryDb.paymentConfig) {
    memoryDb.paymentConfig = { ...DEFAULT_CONFIG };
  }
  return memoryDb.paymentConfig;
}

/**
 * Admin: Update platform payment configuration.
 */
export async function updatePaymentConfig(
  admin: AuthenticatedUser,
  payload: {
    fawaterakApiKey?: string;
    fawaterakVendorKey?: string;
    fawaterakEnv?: 'staging' | 'live';
    isFawaterakActive?: boolean;
    isCashOnDeliveryActive?: boolean;
    instaPayAccount?: string;
    vodafoneCashNumber?: string;
    instaPayInstructions?: string;
    vodafoneCashInstructions?: string;
    isInstaPayActive?: boolean;
    isVodafoneCashActive?: boolean;
  }
): Promise<PaymentConfigDocument> {
  const current = await getPaymentConfig();
  const now = new Date().toISOString();

  const updated: PaymentConfigDocument = {
    ...current,
    fawaterakApiKey:
      payload.fawaterakApiKey !== undefined ? payload.fawaterakApiKey.trim() : current.fawaterakApiKey,
    fawaterakVendorKey:
      payload.fawaterakVendorKey !== undefined ? payload.fawaterakVendorKey.trim() : current.fawaterakVendorKey,
    fawaterakEnv: payload.fawaterakEnv || current.fawaterakEnv || 'staging',
    isFawaterakActive:
      payload.isFawaterakActive !== undefined ? payload.isFawaterakActive : (current.isFawaterakActive ?? true),
    isCashOnDeliveryActive:
      payload.isCashOnDeliveryActive !== undefined ? payload.isCashOnDeliveryActive : (current.isCashOnDeliveryActive ?? true),
    instaPayAccount: payload.instaPayAccount?.trim() || current.instaPayAccount,
    vodafoneCashNumber: payload.vodafoneCashNumber?.trim() || current.vodafoneCashNumber,
    instaPayInstructions:
      payload.instaPayInstructions !== undefined
        ? payload.instaPayInstructions.trim()
        : current.instaPayInstructions,
    vodafoneCashInstructions:
      payload.vodafoneCashInstructions !== undefined
        ? payload.vodafoneCashInstructions.trim()
        : current.vodafoneCashInstructions,
    isInstaPayActive: payload.isInstaPayActive ?? current.isInstaPayActive,
    isVodafoneCashActive: payload.isVodafoneCashActive ?? current.isVodafoneCashActive,
    updatedAt: now,
    updatedBy: admin.name
  };

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const { _id, ...safeUpdated } = updated as any;
      await db.collection('payment_configs').updateOne(
        { id: 'platform_payment_config' },
        { $set: safeUpdated },
        { upsert: true }
      );
    } catch (e) {
      console.error('[PaymentConfigService] Error updating payment config in Mongo:', e);
    }
  }

  memoryDb.paymentConfig = updated;

  await addAuditLog({
    actorId: admin.id,
    userName: admin.name,
    userRole: 'admin',
    action: 'تحديث إعدادات بوابة الدفع وطرق الدفع',
    resource: 'إعدادات المنصة',
    resourceId: 'platform_payment_config',
    status: 'نجاح',
    details: `قام المدير ${admin.name} بتحديث إعدادات بوابة فاتورتك (تفعيل: ${updated.isFawaterakActive ? 'نعم' : 'لا'}) والدفع عند الاستلام (تفعيل: ${updated.isCashOnDeliveryActive ? 'نعم' : 'لا'})`
  });

  return updated;
}
