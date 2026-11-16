import { createAuditLog, getAuditLogs, deleteAuditLog } from '../server/services/auditService.ts';
import { getDatabase } from '../server/db/mongodb.ts';

async function runAuditTests() {
  console.log('--- Starting Comprehensive Audit Logs Test ---');

  // 1. Check DB Connection
  const { isMongo, db } = await getDatabase();
  console.log(`Database type: ${isMongo ? 'MongoDB' : 'Memory'}`);

  // 2. Create sample audit logs across categories
  const testLogs = [
    {
      actorId: 'usr-admin-01',
      userName: 'مدير المنصة',
      userRole: 'admin' as const,
      action: 'اعتماد منتج حرفي',
      resource: 'المنتجات',
      resourceId: 'prod-pottery-101',
      status: 'نجاح' as const,
      details: 'تم اعتماد منتج "طاجن فخار قناوي" ونشره للجمهور',
      metadata: { category: 'فخار', price: 250 }
    },
    {
      actorId: 'usr-buyer-02',
      userName: 'أحمد محمود',
      userRole: 'buyer' as const,
      action: 'إلغاء طلب شراء',
      resource: 'الطلبات',
      resourceId: 'ord-88741',
      status: 'تنبيه' as const,
      details: 'قام المشتري بإلغاء الطلب #ord-88741 قبل الشحن',
      metadata: { reason: 'تغيير عنوان التوصيل' }
    },
    {
      userName: 'مجهول',
      userRole: 'buyer' as const,
      action: 'فشل تسجيل الدخول',
      resource: 'الأمان وتسجيل الدخول',
      status: 'خطأ' as const,
      details: 'محاولة تسجيل دخول فاشلة بكلمة مرور خاطئة للمستخدم admin@elsa3ed.com',
      metadata: { identifier: 'admin@elsa3ed.com', ip: '192.168.1.5' }
    },
    {
      actorId: 'usr-admin-01',
      userName: 'مدير المنصة',
      userRole: 'admin' as const,
      action: 'إنشاء كوبون خصم',
      resource: 'الكوبونات والخصومات',
      resourceId: 'OMDA10',
      status: 'نجاح' as const,
      details: 'تم إنشاء الكوبون OMDA10 بنسبة خصم 10%',
      metadata: { discountPercent: 10, maxUsage: 100 }
    }
  ];

  for (const log of testLogs) {
    const created = await createAuditLog(log);
    console.log(`Created audit log: [${created.status}] ${created.action} - ID: ${created.id}`);
  }

  // 3. Test filtering: by status 'خطأ'
  const errorLogs = await getAuditLogs({ status: 'خطأ' });
  console.log(`Filtered by status 'خطأ': found ${errorLogs.length} logs`);
  if (!errorLogs.some((l) => l.action.includes('فشل تسجيل الدخول'))) {
    throw new Error('Failed to filter audit logs by status');
  }

  // 4. Test filtering: by search term 'فخار'
  const searchLogs = await getAuditLogs({ search: 'فخار' });
  console.log(`Filtered by search 'فخار': found ${searchLogs.length} logs`);
  if (!searchLogs.some((l) => l.details.includes('طاجن فخار'))) {
    throw new Error('Failed to filter audit logs by search query');
  }

  // 5. Test filtering: by role 'admin'
  const adminLogs = await getAuditLogs({ role: 'admin' });
  console.log(`Filtered by role 'admin': found ${adminLogs.length} logs`);

  // 6. Test delete single audit log
  const firstLog = errorLogs[0];
  if (firstLog) {
    await deleteAuditLog(firstLog.id);
    const afterDelete = await getAuditLogs();
    if (afterDelete.some((l) => l.id === firstLog.id)) {
      throw new Error(`Audit log ${firstLog.id} was not deleted`);
    }
    console.log(`Successfully verified deletion of log: ${firstLog.id}`);
  }

  console.log('--- All Audit Logs tests passed successfully! ---');
  process.exit(0);
}

runAuditTests().catch((err) => {
  console.error('Audit logs test error:', err);
  process.exit(1);
});
