import { memoryDb, getDatabase } from '../db/mongodb.ts';
import type { ReportTicketDocument, ReportCategory, ReportPriority, ReportStatus } from '../models/types.ts';
import { notifyAdmins, createNotification } from './notificationService.ts';

export interface CreateReportInput {
  userId?: string;
  userName: string;
  userEmail?: string;
  userPhone: string;
  userRole?: 'buyer' | 'seller' | 'admin' | 'guest';
  userGovernorate?: string;
  category: ReportCategory;
  priority?: ReportPriority;
  subject: string;
  description: string;
  relatedOrderId?: string;
  relatedOrderNumber?: string;
  relatedProductId?: string;
  relatedProductName?: string;
  relatedSellerId?: string;
  relatedSellerName?: string;
  attachments?: string[];
}

export interface UpdateReportInput {
  status?: ReportStatus;
  adminResponse?: string;
  internalNotes?: string;
}

function generateTicketNumber(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${dateStr}-${rand}`;
}

export async function createReport(
  input: CreateReportInput,
  currentUser?: { id?: string; name?: string; role?: string; phone?: string; email?: string }
): Promise<ReportTicketDocument> {
  const now = new Date().toISOString();

  const ticket: ReportTicketDocument = {
    id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ticketNumber: generateTicketNumber(),
    userId: currentUser?.id || input.userId || 'guest',
    userName: input.userName || currentUser?.name || 'مستخدم المنصة',
    userEmail: input.userEmail || currentUser?.email || '',
    userPhone: input.userPhone || currentUser?.phone || '',
    userRole: (input.userRole || currentUser?.role || 'buyer') as any,
    userGovernorate: input.userGovernorate || '',
    category: input.category || 'other',
    priority: input.priority || 'medium',
    subject: input.subject.trim(),
    description: input.description.trim(),
    relatedOrderId: input.relatedOrderId,
    relatedOrderNumber: input.relatedOrderNumber,
    relatedProductId: input.relatedProductId,
    relatedProductName: input.relatedProductName,
    relatedSellerId: input.relatedSellerId,
    relatedSellerName: input.relatedSellerName,
    attachments: input.attachments || [],
    status: 'pending',
    createdAt: now,
    updatedAt: now
  };

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    await db.collection<ReportTicketDocument>('reports').insertOne({ ...ticket });
  } else {
    memoryDb.reports.unshift(ticket);
  }

  // Notify Admins
  try {
    const roleLabel = ticket.userRole === 'seller' ? 'بائع / ورشة' : ticket.userRole === 'buyer' ? 'مشتري' : 'زائر';
    await notifyAdmins({
      title: `بلاغ جديد #${ticket.ticketNumber}: ${ticket.subject}`,
      message: `قدم ${ticket.userName} (${roleLabel}) شكوى جديدة بخصوص "${ticket.subject}".`,
      type: 'order_status',
      metadata: { entityId: ticket.id, ticketId: ticket.id }
    });
  } catch (err) {
    console.error('[ReportService] Failed to notify admins:', err);
  }

  // Notify user confirming ticket creation if registered
  if (ticket.userId && ticket.userId !== 'guest') {
    try {
      await createNotification({
        userId: ticket.userId,
        title: `تم استلام بلاغك بنجاح #${ticket.ticketNumber}`,
        message: `تم تسجيل بلاغك بخصوص "${ticket.subject}"، وجاري مراجعته من قِبل إدارة منصة وه والرد عليك في أقرب وقت.`,
        type: 'order_status',
        metadata: { entityId: ticket.id, ticketId: ticket.id }
      });
    } catch (err) {
      console.error('[ReportService] Failed to notify ticket submitter:', err);
    }
  }

  return ticket;
}

export async function getMyReports(
  user: { id?: string; phone?: string }
): Promise<ReportTicketDocument[]> {
  const { db, isMongo } = await getDatabase();

  if (isMongo && db) {
    const query: any = {};
    if (user.id && user.id !== 'guest') {
      if (user.phone) {
        query.$or = [{ userId: user.id }, { userPhone: user.phone }];
      } else {
        query.userId = user.id;
      }
    } else if (user.phone) {
      query.userPhone = user.phone;
    } else {
      return [];
    }

    const items = await db
      .collection<ReportTicketDocument>('reports')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    return items;
  }

  // In-memory fallback
  return memoryDb.reports
    .filter((r) => {
      if (user.id && user.id !== 'guest' && r.userId === user.id) return true;
      if (user.phone && r.userPhone === user.phone) return true;
      return false;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAdminReports(filter?: {
  status?: ReportStatus;
  category?: ReportCategory;
  userRole?: string;
  searchTerm?: string;
}): Promise<ReportTicketDocument[]> {
  const { db, isMongo } = await getDatabase();

  if (isMongo && db) {
    const query: any = {};
    if (filter?.status) query.status = filter.status;
    if (filter?.category) query.category = filter.category;
    if (filter?.userRole && filter.userRole !== 'all') query.userRole = filter.userRole;
    if (filter?.searchTerm) {
      const regex = { $regex: filter.searchTerm, $options: 'i' };
      query.$or = [
        { ticketNumber: regex },
        { subject: regex },
        { description: regex },
        { userName: regex },
        { userPhone: regex },
        { relatedOrderNumber: regex }
      ];
    }

    const items = await db
      .collection<ReportTicketDocument>('reports')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    return items;
  }

  // In-memory fallback
  return memoryDb.reports
    .filter((r) => {
      if (filter?.status && r.status !== filter.status) return false;
      if (filter?.category && r.category !== filter.category) return false;
      if (filter?.userRole && filter.userRole !== 'all' && r.userRole !== filter.userRole) return false;
      if (filter?.searchTerm) {
        const q = filter.searchTerm.toLowerCase();
        const matches =
          r.ticketNumber.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.userName.toLowerCase().includes(q) ||
          r.userPhone.toLowerCase().includes(q) ||
          r.relatedOrderNumber?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateAdminReport(
  reportId: string,
  input: UpdateReportInput,
  adminUser?: { id?: string; name?: string }
): Promise<ReportTicketDocument> {
  const { db, isMongo } = await getDatabase();
  const now = new Date().toISOString();

  let existing: ReportTicketDocument | null = null;

  if (isMongo && db) {
    existing = await db.collection<ReportTicketDocument>('reports').findOne({ id: reportId });
  } else {
    existing = memoryDb.reports.find((r) => r.id === reportId) || null;
  }

  if (!existing) {
    throw new Error('البلاغ المطلوب غير موجود');
  }

  const updated: ReportTicketDocument = {
    ...existing,
    ...(input.status ? { status: input.status } : {}),
    ...(input.adminResponse !== undefined ? { adminResponse: input.adminResponse } : {}),
    ...(input.internalNotes !== undefined ? { internalNotes: input.internalNotes } : {}),
    adminRespondedAt: now,
    adminRespondedBy: adminUser?.name || 'إدارة منصة وه',
    updatedAt: now
  };

  if (isMongo && db) {
    await db.collection<ReportTicketDocument>('reports').updateOne(
      { id: reportId },
      { $set: updated }
    );
  } else {
    const idx = memoryDb.reports.findIndex((r) => r.id === reportId);
    if (idx !== -1) {
      memoryDb.reports[idx] = updated;
    }
  }

  // Notify submitter if status changed or admin replied
  if (updated.userId && updated.userId !== 'guest') {
    try {
      const statusLabel =
        updated.status === 'resolved'
          ? 'تم حل المشكلة بنجاح'
          : updated.status === 'in_progress'
          ? 'قيد المتابعة والحل'
          : updated.status === 'rejected'
          ? 'مرفوض / مغلق'
          : 'قيد المراجعة';

      await createNotification({
        userId: updated.userId,
        title: `تحديث بشأن بلاغك #${updated.ticketNumber}`,
        message: input.adminResponse
          ? `رد الإدارة: "${input.adminResponse.slice(0, 80)}${input.adminResponse.length > 80 ? '...' : ''}" (الحالة: ${statusLabel})`
          : `تم تغيير حالة بلاغك إلى: ${statusLabel}`,
        type: 'order_status',
        metadata: { entityId: updated.id, ticketId: updated.id }
      });
    } catch (err) {
      console.error('[ReportService] Failed to notify user on report update:', err);
    }
  }

  return updated;
}

export async function deleteAdminReport(reportId: string): Promise<boolean> {
  const { db, isMongo } = await getDatabase();

  if (isMongo && db) {
    const res = await db.collection('reports').deleteOne({ id: reportId });
    return res.deletedCount > 0;
  }

  const idx = memoryDb.reports.findIndex((r) => r.id === reportId);
  if (idx !== -1) {
    memoryDb.reports.splice(idx, 1);
    return true;
  }
  return false;
}
