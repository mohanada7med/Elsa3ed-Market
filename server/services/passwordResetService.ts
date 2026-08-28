import bcrypt from 'bcryptjs';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { PasswordResetRequestDocument, UserDocument } from '../models/types.ts';
import { findUserByUsername, normalizeUsername } from './userService.ts';
import { createNotification } from './notificationService.ts';
import { createAuditLog } from './auditService.ts';
import { AuthenticatedUser } from '../middleware/auth.ts';
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

  return {
    success: true,
    message: 'تم رفض طلب استعادة كلمة المرور'
  };
}
