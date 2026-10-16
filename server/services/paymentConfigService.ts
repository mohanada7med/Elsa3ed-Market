import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { PaymentConfigDocument } from '../models/types.ts';
import type { AuthenticatedUser } from '../middleware/auth.ts';
import { addAuditLog } from './auditService.ts';

const DEFAULT_CONFIG: PaymentConfigDocument = {
  id: 'platform_payment_config',
  isOnlinePaymentActive: true,
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
 * Get current platform payment configuration (COD, Online & Wallets).
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
    isOnlinePaymentActive?: boolean;
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
    isOnlinePaymentActive:
      payload.isOnlinePaymentActive !== undefined ? payload.isOnlinePaymentActive : (current.isOnlinePaymentActive ?? true),
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
    action: 'تحديث إعدادات طرق الدفع والتحصيل',
    resource: 'إعدادات المنصة',
    resourceId: 'platform_payment_config',
    status: 'نجاح',
    details: `قام المدير ${admin.name} بتحديث إعدادات طرق الدفع (الدفع الإلكتروني: ${updated.isOnlinePaymentActive ? 'مفعل' : 'معطل'}، الدفع عند الاستلام: ${updated.isCashOnDeliveryActive ? 'مفعل' : 'معطل'})`
  });

  return updated;
}
