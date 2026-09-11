import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { PasswordResetRequestDocument, UserDocument } from '../models/types.ts';
import {
  findUserByUsername,
  findUserByEmail,
  findUserByResetTokenHash,
  updateUser,
  normalizeUsername
} from './userService.ts';
import { hashPassword } from './authService.ts';
import { invalidateAuthSession } from '../middleware/auth.ts';
import { sendPasswordResetEmail } from './emailService.ts';
import { createNotification } from './notificationService.ts';
import { createAuditLog } from './auditService.ts';
import type { AuthenticatedUser } from '../middleware/auth.ts';
import { Logger } from '../utils/logger.ts';
/**
 * تقديم طلب استعادة كلمة السر عن طريق اسم المستخدم (يدوياً لمراجعة الإدارة)
 */
export async function createPasswordResetRequest(usernameInput: string): Promise<{
  success: boolean;
  message: string;
  requestId: string;
}> {
  if (!usernameInput || typeof usernameInput !== 'string' || !usernameInput.trim()) {
    throw new Error('من فضلك اكتب اسم المستخدم الأول عشان نقدر نساعدك.');
  }

  const trimmedUsername = usernameInput.trim();
  const user = await findUserByUsername(trimmedUsername);

  if (!user) {
    throw new Error('اسم المستخدم اللي كتبته مش مسجل عندنا في المنصة.');
  }

  const { db, isMongo } = await getDatabase();

  // التأكد من عدم وجود طلب معلق سابق لنفس المستخدم
  let existingPending: PasswordResetRequestDocument | null = null;
  if (isMongo && db) {
    try {
      existingPending = (await db.collection('password_resets').findOne({
        userId: user.id,
        status: 'pending'
      })) as unknown as PasswordResetRequestDocument | null;
    } catch (e) {
      Logger.error('[PasswordResetService] Error checking existing pending requests:', e);
    }
  } else {
    existingPending = memoryDb.passwordResets.find(
      (r) => r.userId === user.id && r.status === 'pending'
    ) || null;
  }

  if (existingPending) {
    throw new Error('فيه بالفعل طلب استعادة كلمة سر معلق للحساب ده وقيد المراجعة من الإدارة حالياً.');
  }

  const now = new Date().toISOString();
  const requestId = `pwd-reset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const resetRequest: PasswordResetRequestDocument = {
    id: requestId,
    userId: user.id,
    username: user.username,
    name: user.name,
    phone: user.phone,
    role: user.role,
    status: 'pending',
    createdAt: now
  };

  // حفظ الطلب في قاعدة البيانات
  if (isMongo && db) {
    try {
      await db.collection('password_resets').insertOne(resetRequest as any);
    } catch (e) {
      Logger.error('[PasswordResetService] Error inserting reset request into MongoDB:', e);
      throw new Error('حصل مشكلة واحنا بنحفظ طلب الاستعادة، جرب تاني كمان شوية.');
    }
  }
  memoryDb.passwordResets.unshift(resetRequest);

  // إرسال إشعار فوري لجميع مديري المنصة
  try {
    let adminUsers: { id: string }[] = [];
    if (isMongo && db) {
      adminUsers = await db.collection('users').find({ role: 'admin' }, { projection: { id: 1 } }).toArray() as any;
    } else {
      adminUsers = memoryDb.users.filter((u) => u.role === 'admin').map((u) => ({ id: u.id }));
    }

    const notifTitle = 'طلب استعادة كلمة السر';
    const notifMessage = `المستخدم: @${user.username} طلب إعادة تعيين كلمة السر الخاصة بيه.`;

    for (const admin of adminUsers) {
      await createNotification({
        userId: admin.id,
        title: notifTitle,
        message: notifMessage,
        type: 'system',
        link: 'admin-dashboard'
      });
    }
  } catch (notifErr) {
    Logger.warn('[PasswordResetService] Failed sending notification to admins:', notifErr);
  }

  await createAuditLog({
    userName: user.name,
    userRole: user.role,
    action: 'FORGOT_PASSWORD_REQUEST',
    resource: 'password_resets',
    resourceId: requestId,
    status: 'نجاح',
    details: `المستخدم (${user.name} - @${user.username}) طلب استعادة كلمة السر يدوياً`
  });

  return {
    success: true,
    message: 'تم إرسال طلبك للإدارة بنجاح. المسؤول هيراجعه وهيظبط لك كلمة سر جديدة.',
    requestId
  };
}

/**
 * جلب طلبات استعادة كلمة السر الخاصة بلوحة التحكم للآدمن
 */
export async function getPasswordResetRequests(
  statusFilter?: 'all' | 'pending' | 'completed' | 'rejected'
): Promise<PasswordResetRequestDocument[]> {
  const { db, isMongo } = await getDatabase();
  const query: any = {};

  if (statusFilter && statusFilter !== 'all') {
    query.status = statusFilter;
  }

  if (isMongo && db) {
    try {
      const requests = await db
        .collection('password_resets')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      return requests as unknown as PasswordResetRequestDocument[];
    } catch (e) {
      Logger.error('[PasswordResetService] Error fetching reset requests from MongoDB:', e);
    }
  }

  return memoryDb.passwordResets.filter((r) => {
    if (statusFilter && statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });
}

/**
 * الآدمن بينهي طلب الاستعادة ويدي للمستخدم كلمة سر مؤقتة جديدة
 */
export async function completePasswordResetRequest(
  adminUser: AuthenticatedUser,
  requestId: string,
  temporaryPassword: string
): Promise<{
  success: boolean;
  message: string;
  temporaryPassword: string;
}> {
  if (!adminUser || adminUser.role !== 'admin') {
    throw new Error('مش مسموح ليك بالخطوة دي، دي خاصة بأدمن المنصة بس.');
  }

  if (!requestId || typeof requestId !== 'string') {
    throw new Error('كود الطلب مش مظبوط.');
  }

  if (!temporaryPassword || typeof temporaryPassword !== 'string' || temporaryPassword.length < 6) {
    throw new Error('كلمة المرور المؤقتة لازم تكون 6 خانات على الأقل.');
  }

  const { db, isMongo } = await getDatabase();

  let request: PasswordResetRequestDocument | null = null;
  if (isMongo && db) {
    request = (await db.collection('password_resets').findOne({ id: requestId })) as any;
  } else {
    request = memoryDb.passwordResets.find((r) => r.id === requestId) || null;
  }

  if (!request) {
    throw new Error('طلب استعادة كلمة المرور مش موجود أساساً.');
  }

  if (request.status !== 'pending') {
    throw new Error('الطلب ده اتعامل معاه وخلص خلاص من قبل كده.');
  }

  const passwordHash = await bcrypt.hash(temporaryPassword, 10);
  const now = new Date().toISOString();

  // 1. تحديث باسورد المستخدم وتفعيله بحيث يلتزم بتغييرها عند الدخول
  if (isMongo && db) {
    await db.collection('users').updateOne(
      { id: request.userId },
      {
        $set: {
          passwordHash,
          mustChangePassword: true,
          updatedAt: now
        }
      }
    );
  } else {
    const user = memoryDb.users.find((u) => u.id === request!.userId);
    if (user) {
      (user as any).passwordHash = passwordHash;
      (user as any).mustChangePassword = true;
      (user as any).updatedAt = now;
    }
  }

  // 2. تحديث حالة الطلب إلى مكتمل
  const requestUpdates = {
    status: 'completed' as const,
    handledByAdminId: adminUser.id,
    handledByAdminName: adminUser.name,
    handledAt: now
  };

  if (isMongo && db) {
    await db.collection('password_resets').updateOne(
      { id: requestId },
      { $set: requestUpdates }
    );
  }
  const memReq = memoryDb.passwordResets.find((r) => r.id === requestId);
  if (memReq) {
    Object.assign(memReq, requestUpdates);
  }

  // 3. سجل الأمان
  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'COMPLETE_PASSWORD_RESET',
    resource: 'password_resets',
    resourceId: requestId,
    status: 'نجاح',
    details: `الآدمن (${adminUser.name}) عمل كلمة مرور مؤقتة للمستخدم (@${request.username}) وجهّز حسابه للتحديث`
  });

  try {
    await createNotification({
      userId: request.userId,
      title: 'تم تحديث طلب استعادة كلمة المرور',
      message: 'الإدارة خلصت طلبك وعملت لك كلمة مرور مؤقتة. ادخل سجل دخولك بيها وغيرهالك.',
      type: 'account',
      link: 'buyer-account'
    });
  } catch (notifErr) {
    Logger.warn('[PasswordResetService] Failed sending completion notification to user:', notifErr);
  }

  return {
    success: true,
    message: `تم عمل كلمة المرور المؤقتة بنجاح للمستخدم (${request.name || request.username})`,
    temporaryPassword
  };
}

/**
 * الآدمن بيرفض طلب استعادة كلمة السر
 */
export async function rejectPasswordResetRequest(
  adminUser: AuthenticatedUser,
  requestId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  if (!adminUser || adminUser.role !== 'admin') {
    throw new Error('مش مسموح ليك بالخطوة دي، دي خاصة بأدمن المنصة بس.');
  }

  const { db, isMongo } = await getDatabase();
  const now = new Date().toISOString();

  let request: PasswordResetRequestDocument | null = null;
  if (isMongo && db) {
    request = (await db.collection('password_resets').findOne({ id: requestId })) as any;
  } else {
    request = memoryDb.passwordResets.find((r) => r.id === requestId) || null;
  }

  if (!request) {
    throw new Error('طلب استعادة كلمة المرور مش موجود.');
  }

  const updates = {
    status: 'rejected' as const,
    handledByAdminId: adminUser.id,
    handledByAdminName: adminUser.name,
    handledAt: now,
    adminNotes: reason?.trim() || 'تم رفض الطلب من قِبل الإدارة.'
  };

  if (isMongo && db) {
    await db.collection('password_resets').updateOne({ id: requestId }, { $set: updates });
  }
  const memReq = memoryDb.passwordResets.find((r) => r.id === requestId);
  if (memReq) {
    Object.assign(memReq, updates);
  }

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'REJECT_PASSWORD_RESET',
    resource: 'password_resets',
    resourceId: requestId,
    status: 'تنبيه',
    details: `الآدمن (${adminUser.name}) رفض طلب استعادة كلمة السر للمستخدم (@${request.username})`
  });

  try {
    await createNotification({
      userId: request.userId,
      title: 'تحديث بخصوص طلب استعادة كلمة المرور',
      message: `للأسف الإدارة رفضت طلب استعادة كلمة المرور. ${updates.adminNotes ? `السبب: ${updates.adminNotes}` : ''}`.trim(),
      type: 'account',
      link: 'buyer-account'
    });
  } catch (notifErr) {
    Logger.warn('[PasswordResetService] Failed sending rejection notification to user:', notifErr);
  }

  return {
    success: true,
    message: 'تم رفض طلب استعادة كلمة المرور بنجاح.'
  };
}

/**
 * إرسال رابط آلي لاستعادة كلمة السر عبر البريد الإلكتروني للمستخدم مع إرجاع تلميح الإيميل للشاشة الكاملة
 */
export async function requestAutomatedPasswordReset(
  identifier: string,
  baseUrlOrOrigin?: string
): Promise<{ success: boolean; message: string; emailHint?: string }> {
  // رسالة بالعامية المصرية وفيها تنبيه صندوق الوارد والـ Spam بوضوح
  const genericSuccessMessage = 'تم إرسال رسالة إعادة تعيين كلمة المرور على إيميلك بنجاح. بص في صندوق الوارد (Inbox)، ولو ملقيتهاش هناك، ضروري تبص في البريد غير المرغوب فيه (Spam / Junk).';

  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    throw "من فضلك اكتب اسم المستخدم أو البريد الإلكتروني."; // تم تصحيح الصيغة أدناه
  }

  // (تصحيح الخطأ الإملائي في الكود الفعلي)
  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    throw new Error('من فضلك اكتب اسم المستخدم أو الإيميل بتاعك.');
  }

  const trimmed = identifier.trim();
  const isEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

  let user: UserDocument | null = null;

  try {
    if (isEmailFormat) {
      user = await findUserByEmail(trimmed);
      if (!user) {
        user = await findUserByUsername(trimmed);
      }
    } else {
      user = await findUserByUsername(trimmed);
      if (!user && trimmed.includes('@')) {
        user = await findUserByEmail(trimmed);
      }
    }
  } catch (lookupErr) {
    Logger.error('[PasswordResetService] User lookup error in automated reset:', lookupErr);
  }

  // حماية الحسابات من التتبع (Account Enumeration)
  if (!user || !user.email || !user.email.trim()) {
    Logger.info(`[PasswordResetService] Reset requested for non-existing or email-less identifier: "${trimmed}"`);
    return {
      success: true,
      message: genericSuccessMessage,
      emailHint: isEmailFormat ? trimmed : undefined
    };
  }

  try {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const expiresInMinutes = 30;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

    await updateUser(user.id, {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: expiresAt
    });

    let configuredUrl = process.env.APP_URL?.trim();
    if (process.env.NODE_ENV === 'production' && configuredUrl && (configuredUrl.includes('localhost') || configuredUrl.includes('127.0.0.1'))) {
      configuredUrl = undefined;
    }
    let appBaseUrl = (
      configuredUrl ||
      baseUrlOrOrigin ||
      'http://localhost:3000'
    ).trim().replace(/\/$/, '');

    if (!appBaseUrl.startsWith('http://') && !appBaseUrl.startsWith('https://')) {
      appBaseUrl = `https://${appBaseUrl}`;
    }

    const resetUrl = `${appBaseUrl}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail({
      to: user.email.trim(),
      userName: user.name || user.username,
      resetUrl,
      expiresInMinutes
    });

    await createAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'PASSWORD_RESET_REQUESTED',
      resource: 'users',
      resourceId: user.id,
      status: 'نجاح',
      details: `تم إرسال لينك استعادة كلمة السر للإيميل المسجل الخاص بالمستخدم (@${user.username})`
    });

    Logger.info(`[PasswordResetService] Password reset token created and emailed for user ${user.id} (@${user.username})`);
  } catch (err: any) {
    Logger.error(`[PasswordResetService] Error processing password reset for user ${user?.id}:`, err?.message || err);
  }

  const maskedEmail = user.email.replace(/(^[\w.+-]{2})(.*)(@[\w.-]+)/, (_, a, b, c) => `${a}${'*'.repeat(Math.max(b.length, 3))}${c}`);

  return {
    success: true,
    message: genericSuccessMessage,
    emailHint: maskedEmail
  };
}

/**
 * التحقق من صلاحية كود أو توكن إعادة التعيين
 */
export async function validateResetToken(token: string): Promise<{
  valid: boolean;
  message?: string;
  code?: 'INVALID' | 'EXPIRED' | 'MISSING';
}> {
  if (!token || typeof token !== 'string' || !token.trim()) {
    return {
      valid: false,
      code: 'MISSING',
      message: 'رمز التحقق مش موجود، من فضلك استخدم اللينك اللي وصلك في الإيميل بالضبط.'
    };
  }

  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const user = await findUserByResetTokenHash(tokenHash);

  if (!user) {
    return {
      valid: false,
      code: 'INVALID',
      message: 'لينك إعادة التعيين ده مش شغال أو تم استخدامه قبل كده.'
    };
  }

  if (!user.passwordResetExpiresAt || new Date(user.passwordResetExpiresAt).getTime() < Date.now()) {
    await updateUser(user.id, {
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null
    }).catch(() => { });

    return {
      valid: false,
      code: 'EXPIRED',
      message: 'للأسف انتهت صلاحية لينك استعادة كلمة السر، من فضلك اطلب واحد غيره.'
    };
  }

  return {
    valid: true
  };
}

/**
 * إعادة تعيين كلمة السر الخاصة بالمستخدم باستخدام التكن المُتحقق منه
 */
export async function resetPasswordWithToken(params: {
  token: string;
  password: string;
  confirmPassword?: string;
}): Promise<{ success: boolean; message: string }> {
  const { token, password, confirmPassword } = params;

  if (!token || typeof token !== 'string' || !token.trim()) {
    throw new Error('رمز التحقق مش موجود.');
  }

  if (!password || typeof password !== 'string') {
    throw new Error('من فضلك اكتب كلمة السر الجديدة.');
  }

  if (password.length < 6) {
    throw new Error('كلمة السر لازم تكون 6 خانات على الأقل يا غالي.');
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    throw new Error('كلمتا السر مش متطابقتين، تأكد منهم كويس.');
  }

  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const user = await findUserByResetTokenHash(tokenHash);

  if (!user) {
    throw new Error('لينك إعادة التعيين ده غير صالح أو تم استخدامه قبل كده.');
  }

  if (!user.passwordResetExpiresAt || new Date(user.passwordResetExpiresAt).getTime() < Date.now()) {
    await updateUser(user.id, {
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null
    }).catch(() => { });

    throw new Error('انتهت صلاحية لينك استعادة كلمة السر، اطلب لينك جديد من فضلك.');
  }

  const newPasswordHash = await hashPassword(password);

  const updated = await updateUser(user.id, {
    passwordHash: newPasswordHash,
    passwordResetTokenHash: null,
    passwordResetExpiresAt: null,
    mustChangePassword: false
  });

  if (!updated) {
    throw new Error('حصلت مشكلة واحنا بنحدث كلمة السر، جرب تاني كمان شوية.');
  }

  invalidateAuthSession(user.id);

  await createAuditLog({
    userName: user.name,
    userRole: user.role,
    action: 'PASSWORD_RESET_SUCCESS',
    resource: 'users',
    resourceId: user.id,
    status: 'نجاح',
    details: `تمت إعادة تعيين كلمة السر بنجاح للمستخدم (@${user.username}) عن طريق لينك التحقق`
  });

  try {
    await createNotification({
      userId: user.id,
      title: 'تم تغيير كلمة السر بنجاح',
      message: 'تم تغيير كلمة السر الخاصة بحسابك بنجاح. لو مش إنت اللي عملت التغيير ده، كلم إدارة المنصة فوراً.',
      type: 'account',
      link: 'buyer-account'
    });
  } catch (notifErr) {
    Logger.warn('[PasswordResetService] Notification delivery warning:', notifErr);
  }

  return {
    success: true,
    message: 'مبروك! تم تغيير كلمة السر بنجاح، تقدر تسجل دخولك دلوقتي بكلمتك الجديدة.'
  };
}