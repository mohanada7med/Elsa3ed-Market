import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { AuditLogDocument, UserRole } from '../models/types.ts';

export interface AuditLogQueryOptions {
  limit?: number;
  status?: string;
  role?: string;
  resource?: string;
  search?: string;
}

export async function createAuditLog(entry: {
  actorId?: string;
  userName: string;
  userRole: UserRole | string;
  action: string;
  resource: string;
  resourceId?: string;
  status?: 'نجاح' | 'تنبيه' | 'خطأ';
  details: string;
  metadata?: Record<string, any>;
}): Promise<AuditLogDocument> {
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);

  const newLog: AuditLogDocument = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    actorId: entry.actorId || undefined,
    userName: entry.userName || 'النظام',
    userRole: (entry.userRole as UserRole) || 'admin',
    action: entry.action,
    resource: entry.resource,
    resourceId: entry.resourceId || undefined,
    timestamp,
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

  // Always keep in memory store (capped at 1000 items to prevent unbounded memory growth)
  memoryDb.auditLogs.unshift(newLog as any);
  if (memoryDb.auditLogs.length > 1000) {
    memoryDb.auditLogs.pop();
  }

  return newLog;
}

export const addAuditLog = createAuditLog;

/**
 * Convenient single-line helper to log any system or user event.
 */
export async function logAudit(
  actor: { id?: string; name?: string; role?: string; username?: string } | null | undefined,
  action: string,
  resource: string,
  details: string,
  status: 'نجاح' | 'تنبيه' | 'خطأ' = 'نجاح',
  resourceId?: string,
  metadata?: Record<string, any>
): Promise<AuditLogDocument> {
  return createAuditLog({
    actorId: actor?.id,
    userName: actor?.name || actor?.username || 'النظام',
    userRole: (actor?.role as UserRole) || 'admin',
    action,
    resource,
    resourceId,
    status,
    details,
    metadata
  });
}

export async function getAuditLogs(options?: AuditLogQueryOptions): Promise<AuditLogDocument[]> {
  const limit = Math.min(1000, options?.limit ? Number(options.limit) : 500);
  const { db, isMongo } = await getDatabase();

  const query: any = {};
  if (options?.status && options.status !== 'all') {
    query.status = options.status;
  }
  if (options?.role && options.role !== 'all') {
    query.userRole = options.role;
  }
  if (options?.resource && options.resource !== 'all') {
    query.resource = options.resource;
  }
  if (options?.search && options.search.trim()) {
    const s = options.search.trim();
    query.$or = [
      { userName: { $regex: s, $options: 'i' } },
      { action: { $regex: s, $options: 'i' } },
      { resource: { $regex: s, $options: 'i' } },
      { details: { $regex: s, $options: 'i' } }
    ];
  }

  if (isMongo && db) {
    try {
      const logs = await db
        .collection('audit_logs')
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      if (logs && logs.length > 0) {
        return logs.map((l: any) => ({
          ...l,
          id: l.id || l._id?.toString()
        })) as unknown as AuditLogDocument[];
      }
    } catch (e) {
      console.error('[AuditService] Failed to fetch logs from MongoDB:', e);
    }
  }

  let memoryFiltered = memoryDb.auditLogs as AuditLogDocument[];
  if (options?.status && options.status !== 'all') {
    memoryFiltered = memoryFiltered.filter((l) => l.status === options.status);
  }
  if (options?.role && options.role !== 'all') {
    memoryFiltered = memoryFiltered.filter((l) => l.userRole === options.role);
  }
  if (options?.resource && options.resource !== 'all') {
    memoryFiltered = memoryFiltered.filter((l) => l.resource === options.resource);
  }
  if (options?.search && options.search.trim()) {
    const s = options.search.toLowerCase();
    memoryFiltered = memoryFiltered.filter(
      (l) =>
        (l.userName && l.userName.toLowerCase().includes(s)) ||
        (l.action && l.action.toLowerCase().includes(s)) ||
        (l.resource && l.resource.toLowerCase().includes(s)) ||
        (l.details && l.details.toLowerCase().includes(s))
    );
  }

  return memoryFiltered.slice(0, limit);
}

export async function deleteAuditLog(logId: string): Promise<boolean> {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('audit_logs').deleteOne({ id: logId });
    } catch (e) {
      console.error('[AuditService] Failed to delete log from MongoDB:', e);
    }
  }
  memoryDb.auditLogs = memoryDb.auditLogs.filter((l) => l.id !== logId);
  return true;
}

export async function clearAllAuditLogs(): Promise<boolean> {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('audit_logs').deleteMany({});
    } catch (e) {
      console.error('[AuditService] Failed to clear logs from MongoDB:', e);
    }
  }
  memoryDb.auditLogs = [];
  return true;
}
