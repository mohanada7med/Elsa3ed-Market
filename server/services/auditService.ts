import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { AuditLogDocument, UserRole } from '../models/types.ts';

export async function createAuditLog(entry: {
  actorId?: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resource: string;
  resourceId?: string;
  status?: 'نجاح' | 'تنبيه' | 'خطأ';
  details: string;
  metadata?: Record<string, any>;
}): Promise<AuditLogDocument> {
  const newLog: AuditLogDocument = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    actorId: entry.actorId,
    userName: entry.userName,
    userRole: entry.userRole,
    action: entry.action,
    resource: entry.resource,
    resourceId: entry.resourceId,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    status: entry.status || 'نجاح',
    details: entry.details,
    metadata: entry.metadata
  };

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('audit_logs').insertOne(newLog as any);
    } catch (e) {
      console.error('[AuditService] Failed to insert log to MongoDB:', e);
    }
  }

// Always keep in memory store as well
  memoryDb.auditLogs.unshift(newLog as any);
  return newLog;
}

export const addAuditLog = createAuditLog;

export async function getAuditLogs(): Promise<AuditLogDocument[]> {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const logs = await db.collection('audit_logs').find().sort({ timestamp: -1 }).limit(100).toArray();
      return logs as unknown as AuditLogDocument[];
    } catch (e) {
      console.error('[AuditService] Failed to fetch logs from MongoDB:', e);
    }
  }
  return memoryDb.auditLogs as AuditLogDocument[];
}
