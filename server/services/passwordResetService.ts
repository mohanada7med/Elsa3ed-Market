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
 * Submit a request to reset password by username
 */
export async function createPasswordResetRequest(usernameInput: string): Promise<{
  success: boolean;
  message: string;
  requestId: string;
}> {
  if (!usernameInput || typeof usernameInput !== 'string' || !usernameInput.trim()) {
    throw new Error('من فضلك اكتب اسم المستخدم');
  }

  const trimmedUsername = usernameInput.trim();
  const user = await findUserByUsername(trimmedUsername);

  if (!user) {
    throw new Error('اسم المستخدم المدخل غير مسجل لدينا في المنصة');
  }

  const { db, isMongo } = await getDatabase();

  // Check if there is an active pending reset request for this user
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
    throw new Error('يوجد بالفعل طلب معلق لاستعادة كلمة المرور لهذا الحساب قيد مراجعة الإدارة');
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

  // Insert request
  if (isMongo && db) {
    try {
      await db.collection('password_resets').insertOne(resetRequest as any);
    } catch (e) {
      Logger.error('[PasswordResetService] Error inserting reset request into MongoDB:', e);
      throw new Error('فشل في حفظ طلب استعادة كلمة المرور، يرجى المحاولة مرة أخرى');
    }
  }
  memoryDb.passwordResets.unshift(resetRequest);

  // Send real-time / in-app notification to all platform Administrators
  try {
    let adminUsers: { id: string }[] = [];
    if (isMongo && db) {
      adminUsers = await db.collection('users').find({ role: 'admin' }, { projection: { id: 1 } }).toArray() as any;
    } else {
      adminUsers = memoryDb.users.filter((u) => u.role === 'admin').map((u) => ({ id: u.id }));
    }

    const notifTitle = 'طلب إعادة تعيين كلمة المرور';
    const notifMessage = `المستخدم: ${user.username} قام بطلب إعادة تعيين كلمة المرور.`;

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
    details: `قدم المستخدم (${user.name} - @${user.username}) طلباً لاستعادة كلمة المرور`
  });

  return {
    success: true,
    message: 'تم إرسال طلبك إلى الإدارة. سيقوم المسؤول بمراجعة الطلب وإنشاء كلمة مرور جديدة لك.',
    requestId
  };
}

/**
 * Fetch password reset requests for Admin Dashboard
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

  // Memory fallback
  return memoryDb.passwordResets.filter((r) => {
    if (statusFilter && statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });
}

/**
 * Admin completes a password reset request by assigning a new temporary password
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
    throw new Error('غير مصرح. هذه العملية تتطلب صلاحيات مدير المنصة');
  }

  if (!requestId || typeof requestId !== 'string') {
    throw new Error('معرف الطلب غير صالح');
  }

  if (!temporaryPassword || typeof temporaryPassword !== 'string' || temporaryPassword.length < 6) {
    throw new Error('كلمة المرور المؤقتة يجب ألا تقل عن 6 خانات');
  }

  const { db, isMongo } = await getDatabase();

  let request: PasswordResetRequestDocument | null = null;
  if (isMongo && db) {
    request = (await db.collection('password_resets').findOne({ id: requestId })) as any;
  } else {
    request = memoryDb.passwordResets.find((r) => r.id === requestId) || null;
  }

  if (!request) {
    throw new Error('طلب إعادة تعيين كلمة المرور غير موجود');
  }

  if (request.status !== 'pending') {
    throw new Error('تمت معالجة هذا الطلب بالفعل مسبقاً');
  }

  // Hash temporary password with bcrypt (cost 10)
  const passwordHash = await bcrypt.hash(temporaryPassword, 10);
  const now = new Date().toISOString();

  // 1. Update target user password and set mustChangePassword = true
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

  // 2. Mark reset request as completed and record admin info
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

  // 3. Security Audit Log (Never log the plain text password)
  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'COMPLETE_PASSWORD_RESET',
    resource: 'password_resets',
    resourceId: requestId,
    status: 'نجاح',
    details: `قام المدير (${adminUser.name}) بإنشاء كلمة مرور مؤقتة للمستخدم (${request.username}) وتحديث حسابه للإلزام بتغييرها`
  });

  // Send safe notification to user (zero secrets or credentials in message)
  try {
    await createNotification({
      userId: request.userId,
      title: 'تحديث بشأن طلب استعادة كلمة المرور',
      message: 'تمت معالجة طلبك لاستعادة كلمة المرور بنجاح من قبل إدارة المنصة. يرجى تسجيل الدخول وتحديث كلمة المرور الخاصة بك.',
      type: 'account',
      link: 'buyer-account'
    });
  } catch (notifErr) {
    Logger.warn('[PasswordResetService] Failed sending completion notification to user:', notifErr);
  }

  return {
    success: true,
    message: `تم تعيين كلمة المرور المؤقتة بنجاح للمستخدم (${request.name || request.username})`,
    temporaryPassword
  };
}

/**
 * Admin rejects a password reset request
 */
export async function rejectPasswordResetRequest(
  adminUser: AuthenticatedUser,
  requestId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  if (!adminUser || adminUser.role !== 'admin') {
    throw new Error('غير مصرح. هذه العملية تتطلب صلاحيات مدير المنصة');
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
    throw new Error('طلب إعادة تعيين كلمة المرور غير موجود');
  }

  const updates = {
    status: 'rejected' as const,
    handledByAdminId: adminUser.id,
    handledByAdminName: adminUser.name,
    handledAt: now,
    adminNotes: reason?.trim() || 'تم رفض الطلب من قبل الإدارة'
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
    details: `قام المدير (${adminUser.name}) برفض طلب استعادة كلمة المرور للمستخدم (${request.username})`
  });

  // Send safe notification to user
  try {
    await createNotification({
      userId: request.userId,
      title: 'تحديث بشأن طلب استعادة كلمة المرور',
      message: `تم رفض طلب استعادة كلمة المرور من قبل إدارة المنصة. ${updates.adminNotes ? `السبب: ${updates.adminNotes}` : ''}`.trim(),
      type: 'account',
      link: 'buyer-account'
    });
  } catch (notifErr) {
    Logger.warn('[PasswordResetService] Failed sending rejection notification to user:', notifErr);
  }

  return {
    success: true,
    message: 'تم رفض طلب استعادة كلمة المرور'
  };
}

/**
 * Request an automated password reset link sent to the user's registered email address.
 * Supports email or username as identifier.
 * Prevents account enumeration by always returning the same generic success message.
 */
export async function requestAutomatedPasswordReset(
  identifier: string,
  baseUrlOrOrigin?: string
): Promise<{ success: boolean; message: string }> {
  const genericSuccessMessage = 'لو البيانات دي مرتبطة بحساب، هنبعتلك رسالة لإعادة تعيين كلمة السر.';

  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    throw new Error('من فضلك اكتب اسم المستخدم أو البريد الإلكتروني');
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

  // Account Enumeration Prevention:
  // If user doesn't exist or has no registered email, return generic response without revealing anything
  if (!user || !user.email || !user.email.trim()) {
    Logger.info(`[PasswordResetService] Reset requested for non-existing or email-less identifier: "${trimmed}"`);
    return {
      success: true,
      message: genericSuccessMessage
    };
  }

  try {
    // Generate cryptographically secure random token (256-bit entropy)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Token expires in 30 minutes
    const expiresInMinutes = 30;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

    // Store secure token hash and expiration on the user document
    await updateUser(user.id, {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: expiresAt
    });

    // Form absolute reset URL
    let appBaseUrl = (
      process.env.APP_URL ||
      baseUrlOrOrigin ||
      'http://localhost:3000'
    ).trim().replace(/\/$/, '');

    // Ensure URL has protocol
    if (!appBaseUrl.startsWith('http://') && !appBaseUrl.startsWith('https://')) {
      appBaseUrl = `https://${appBaseUrl}`;
    }

    const resetUrl = `${appBaseUrl}/reset-password?token=${rawToken}`;

    // Send email to the registered email address
    await sendPasswordResetEmail({
      to: user.email.trim(),
      userName: user.name || user.username,
      resetUrl,
      expiresInMinutes
    });

    // Audit log without leaking the raw token or email secrets
    await createAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'PASSWORD_RESET_REQUESTED',
      resource: 'users',
      resourceId: user.id,
      status: 'نجاح',
      details: `تم إرسال رابط إعادة تعيين كلمة السر إلى البريد الإلكتروني المسجل للمستخدم (@${user.username})`
    });

    Logger.info(`[PasswordResetService] Password reset token created and emailed for user ${user.id} (@${user.username})`);
  } catch (err: any) {
    Logger.error(`[PasswordResetService] Error processing password reset for user ${user?.id}:`, err?.message || err);
    // Even if an unexpected server error occurs, do not leak internal errors to potential attackers
  }

  return {
    success: true,
    message: genericSuccessMessage
  };
}

/**
 * Validates whether a given reset token is valid and unexpired
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
      message: 'رمز التحقق مفقود، يرجى استخدام الرابط المرسل إليك في البريد الإلكتروني.'
    };
  }

  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const user = await findUserByResetTokenHash(tokenHash);

  if (!user) {
    return {
      valid: false,
      code: 'INVALID',
      message: 'رابط إعادة تعيين كلمة السر غير صالح أو تم استخدامه من قبل.'
    };
  }

  if (!user.passwordResetExpiresAt || new Date(user.passwordResetExpiresAt).getTime() < Date.now()) {
    // Invalidate stale token
    await updateUser(user.id, {
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null
    }).catch(() => {});

    return {
      valid: false,
      code: 'EXPIRED',
      message: 'انتهت صلاحية رابط إعادة تعيين كلمة السر، يرجى طلب رابط جديد.'
    };
  }

  return {
    valid: true
  };
}

/**
 * Resets user password using the cryptographically verified token
 */
export async function resetPasswordWithToken(params: {
  token: string;
  password: string;
  confirmPassword?: string;
}): Promise<{ success: boolean; message: string }> {
  const { token, password, confirmPassword } = params;

  if (!token || typeof token !== 'string' || !token.trim()) {
    throw new Error('رمز التحقق غير موجود');
  }

  if (!password || typeof password !== 'string') {
    throw new Error('يرجى كتابة كلمة السر الجديدة');
  }

  if (password.length < 6) {
    throw new Error('كلمة السر يجب ألا تقل عن 6 خانات');
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    throw new Error('كلمتا السر غير متطابقتين');
  }

  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const user = await findUserByResetTokenHash(tokenHash);

  if (!user) {
    throw new Error('رابط إعادة تعيين كلمة السر غير صالح أو تم استخدامه من قبل');
  }

  if (!user.passwordResetExpiresAt || new Date(user.passwordResetExpiresAt).getTime() < Date.now()) {
    // Clean up expired token
    await updateUser(user.id, {
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null
    }).catch(() => {});

    throw new Error('انتهت صلاحية رابط إعادة تعيين كلمة السر، يرجى طلب رابط جديد');
  }

  // Hash the new password with bcrypt
  const newPasswordHash = await hashPassword(password);

  // Atomically update password, clear reset token & expiration, and clear mustChangePassword
  const updated = await updateUser(user.id, {
    passwordHash: newPasswordHash,
    passwordResetTokenHash: null,
    passwordResetExpiresAt: null,
    mustChangePassword: false
  });

  if (!updated) {
    throw new Error('تعذر تحديث كلمة السر، يرجى المحاولة مرة أخرى');
  }

  // Invalidate any active cached sessions for this user
  invalidateAuthSession(user.id);

  // Create audit log
  await createAuditLog({
    userName: user.name,
    userRole: user.role,
    action: 'PASSWORD_RESET_SUCCESS',
    resource: 'users',
    resourceId: user.id,
    status: 'نجاح',
    details: `تمت إعادة تعيين كلمة السر بنجاح باستخدام رابط التحقق للمستخدم (@${user.username})`
  });

  // Create in-app notification for the user
  try {
    await createNotification({
      userId: user.id,
      title: 'تم تغيير كلمة السر بنجاح',
      message: 'تمت إعادة تعيين كلمة السر لحسابك بنجاح. إذا لم تكن أنت من قام بهذا التغيير، يرجى التواصل فوراً مع إدارة المنصة.',
      type: 'account',
      link: 'buyer-account'
    });
  } catch (notifErr) {
    Logger.warn('[PasswordResetService] Notification delivery warning:', notifErr);
  }

  return {
    success: true,
    message: 'تم تغيير كلمة السر بنجاح. يمكنك الآن تسجيل الدخول بكلمة السر الجديدة.'
  };
}

