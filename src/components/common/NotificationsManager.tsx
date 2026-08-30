import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  notificationService,
  AppNotification,
  NotificationType
} from '../../services/notificationService.ts';
import {
  Bell,
  CheckCheck,
  Trash2,
  ExternalLink,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wallet,
  Star,
  UserPlus,
  KeyRound,
  Sparkles,
  Clock,
  Filter,
  Check,
  Send
} from 'lucide-react';

interface NotificationsManagerProps {
  viewMode: 'seller' | 'admin';
  onNavigateTab?: (tab: string) => void;
}

export const NotificationsManager: React.FC<NotificationsManagerProps> = ({
  viewMode,
  onNavigateTab
}) => {
  const { currentUser, currentRole, addToast } = useApp();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Broadcast Announcement state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastRecipient, setBroadcastRecipient] = useState<'all' | 'seller' | 'buyer'>('all');

  const targetSellerId = currentUser?.sellerId || currentUser?.id;

  const refreshList = () => {
    const list = notificationService.getNotifications(viewMode, targetSellerId);
    setNotifications(list);
  };

  useEffect(() => {
    refreshList();
    const interval = setInterval(refreshList, 6000);
    return () => clearInterval(interval);
  }, [viewMode, targetSellerId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
    refreshList();
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead(viewMode, targetSellerId);
    refreshList();
    addToast('تم التحديث', 'تم تعليم كافة الإشعارات كمقروءة', 'success');
  };

  const handleDelete = (id: string) => {
    notificationService.deleteNotification(id);
    refreshList();
  };

  const handleClearAll = () => {
    if (window.confirm('هل أنت متأكد من حذف كافة سجل الإشعارات؟')) {
      notificationService.clearAll(viewMode, targetSellerId);
      refreshList();
      addToast('تم المسح', 'تم مسح سجل الإشعارات بنجاح', 'info');
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    notificationService.addNotification({
      recipientRole: broadcastRecipient,
      title: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
      type: 'system_alert',
      actionPage: broadcastRecipient === 'seller' ? 'seller-dashboard' : 'home'
    });

    addToast('تم إرسال التنبيه', 'تم إرسال الإشعار والتنبيه بنجاح للجمهور المستهدف', 'success');
    setShowBroadcastModal(false);
    setBroadcastTitle('');
    setBroadcastMessage('');
    refreshList();
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'new_order':
        return <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'product_approved':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'product_rejected':
        return <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'product_pending_review':
        return <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'low_stock':
        return <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      case 'payout_requested':
      case 'payout_approved':
      case 'payout_paid':
        return <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'new_review':
        return <Star className="w-5 h-5 text-amber-400 fill-amber-400" />;
      case 'new_seller_registered':
        return <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'password_reset_requested':
        return <KeyRound className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      default:
        return <Bell className="w-5 h-5 text-[#B45F42]" />;
    }
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'الآن';
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      return `منذ ${diffDays} يوم`;
    } catch {
      return '';
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    const matchesRead =
      filterRead === 'all' ||
      (filterRead === 'unread' && !notif.read) ||
      (filterRead === 'read' && notif.read);

    const matchesType = filterType === 'all' || notif.type === filterType;

    const matchesSearch =
      searchQuery.trim() === '' ||
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRead && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#2D2A26] via-[#382E27] to-[#2D2A26] text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-[#4A3E35]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#B45F42]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-amber-300 text-xs font-bold border border-white/15">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>
                {viewMode === 'admin'
                  ? 'مركز إشعارات الإدارة العامة والرقابة'
                  : 'تنبيهات ورشة الصنعة والمبيعات'}
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black font-heritage tracking-tight">
              {viewMode === 'admin'
                ? 'متابعة العمليات الحية، طلبات الورش، والتحويلات المالية'
                : 'متابعة حركة الطلبات، رصيد الأرباح، ونفاد المخزون أولاً بأول'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {viewMode === 'admin'
                ? 'تنبيهات فورية بخصوص تسجيل الورش والحرفيين الجدد، مراجعة المنتجات اليدوية، وطلبات السحب والتسويات.'
                : 'إشعارات لحظية عند ورود طلب شراء جديد لمنتجات ورشتك، تحديثات حالة الاعتماد، وتنبيهات مستحقاتك المالية.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border border-white/15 cursor-pointer shadow-xs"
              >
                <CheckCheck className="w-4 h-4" />
                <span>قراءة كل الإشعارات</span>
              </button>
            )}

            {viewMode === 'admin' && (
              <button
                type="button"
                id="admin-broadcast-btn"
                onClick={() => setShowBroadcastModal(true)}
                className="px-5 py-3 bg-gradient-to-r from-[#B45F42] to-[#9E4F36] hover:from-[#9E4F36] hover:to-[#863F28] text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>إرسال تنبيه أو إعلان عام</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E1917] p-5 rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#7A6F64] dark:text-[#A89C90] mb-2">
            <span>إجمالي الإشعارات المسجلة</span>
            <Bell className="w-4 h-4 text-[#B45F42]" />
          </div>
          <span className="text-2xl font-black text-[#2D2A26] dark:text-[#FAF6F2] font-mono">
            {notifications.length} إشعار
          </span>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">
            سجل حي محدث تلقائياً
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E1917] p-5 rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#7A6F64] dark:text-[#A89C90] mb-2">
            <span>الإشعارات غير المقروءة</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-[#2D2A26] dark:text-[#FAF6F2] font-mono">
            {unreadCount} جديد
          </span>
          <span className="text-[10px] text-[#7A6F64] dark:text-[#A89C90] block mt-1">
            تحتاج إلى مراجعة وتدقيق
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E1917] p-5 rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#7A6F64] dark:text-[#A89C90] mb-2">
            <span>إشعارات الطلبات والمبيعات</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-[#2D2A26] dark:text-[#FAF6F2] font-mono">
            {notifications.filter((n) => n.type === 'new_order').length}
          </span>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">
            حركة البيع المباشر
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E1917] p-5 rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#7A6F64] dark:text-[#A89C90] mb-2">
            <span>إشعارات الماليات والتسويات</span>
            <Wallet className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-black text-[#2D2A26] dark:text-[#FAF6F2] font-mono">
            {notifications.filter((n) => n.type.startsWith('payout')).length}
          </span>
          <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold block mt-1">
            حسابات وسحوبات الورش
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Read / Unread Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setFilterRead('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterRead === 'all'
                  ? 'bg-[#B45F42] text-white shadow-xs'
                  : 'bg-[#F3EFE9] dark:bg-[#2A2320] text-[#7A6F64] dark:text-[#A89C90] hover:bg-[#EDE7DF]'
              }`}
            >
              كافة الإشعارات ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterRead('unread')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterRead === 'unread'
                  ? 'bg-[#B45F42] text-white shadow-xs'
                  : 'bg-[#F3EFE9] dark:bg-[#2A2320] text-[#7A6F64] dark:text-[#A89C90] hover:bg-[#EDE7DF]'
              }`}
            >
              غير المقروءة ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterRead('read')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterRead === 'read'
                  ? 'bg-[#B45F42] text-white shadow-xs'
                  : 'bg-[#F3EFE9] dark:bg-[#2A2320] text-[#7A6F64] dark:text-[#A89C90] hover:bg-[#EDE7DF]'
              }`}
            >
              المقروءة ({notifications.length - unreadCount})
            </button>
          </div>

          {/* Quick Actions & Search */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في نص الإشعار..."
                className="w-full pl-4 pr-9 py-2 bg-[#FDFBF7] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] rounded-xl text-xs text-[#2D2A26] dark:text-[#FAF6F2] outline-none focus:border-[#B45F42]"
              />
              <Bell className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors flex items-center gap-1.5 border border-transparent hover:border-red-200"
                title="مسح كافة الإشعارات"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">مسح السجل</span>
              </button>
            )}
          </div>
        </div>

        {/* Type Categories Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#F3EFE9] dark:border-[#2D2723] text-xs">
          <span className="text-[#7A6F64] dark:text-[#A89C90] text-[11px] font-bold shrink-0 ml-1">
            تصنيف الإشعار:
          </span>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterType === 'all'
                ? 'bg-[#2D2A26] dark:bg-white text-white dark:text-[#2D2A26] font-bold'
                : 'text-[#7A6F64] dark:text-[#A89C90] hover:bg-[#F3EFE9] dark:hover:bg-[#2A2320]'
            }`}
          >
            الكل
          </button>
          <button
            type="button"
            onClick={() => setFilterType('new_order')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterType === 'new_order'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-[#7A6F64] dark:text-[#A89C90] hover:bg-[#F3EFE9] dark:hover:bg-[#2A2320]'
            }`}
          >
            الطلبات والمبيعات
          </button>
          <button
            type="button"
            onClick={() => setFilterType('product_approved')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterType === 'product_approved'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-[#7A6F64] dark:text-[#A89C90] hover:bg-[#F3EFE9] dark:hover:bg-[#2A2320]'
            }`}
          >
            اعتماد المنتجات
          </button>
          <button
            type="button"
            onClick={() => setFilterType('low_stock')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterType === 'low_stock'
                ? 'bg-amber-600 text-white font-bold'
                : 'text-[#7A6F64] dark:text-[#A89C90] hover:bg-[#F3EFE9] dark:hover:bg-[#2A2320]'
            }`}
          >
            تنبيهات المخزون
          </button>
          <button
            type="button"
            onClick={() => setFilterType('payout_paid')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterType === 'payout_paid'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-[#7A6F64] dark:text-[#A89C90] hover:bg-[#F3EFE9] dark:hover:bg-[#2A2320]'
            }`}
          >
            التحويلات المالية
          </button>
          <button
            type="button"
            onClick={() => setFilterType('new_review')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterType === 'new_review'
                ? 'bg-amber-600 text-white font-bold'
                : 'text-[#7A6F64] dark:text-[#A89C90] hover:bg-[#F3EFE9] dark:hover:bg-[#2A2320]'
            }`}
          >
            تقييمات الزبائن
          </button>
        </div>
      </div>

      {/* Notifications List Content */}
      <div className="bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] overflow-hidden shadow-xs">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-[#F3EFE9] dark:divide-[#2D2723]">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 sm:p-6 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  notif.read
                    ? 'bg-white dark:bg-[#1E1917] hover:bg-[#FAF6F0] dark:hover:bg-[#25201D]'
                    : 'bg-[#FFF8F3] dark:bg-[#2D201A] hover:bg-[#FDF2E9] dark:hover:bg-[#38261E]'
                }`}
              >
                {/* Left (RTL Right): Icon & Details */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#2A2320] border border-[#E8E1D9] dark:border-[#382E27] flex items-center justify-center shrink-0 shadow-xs">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm sm:text-base font-bold ${
                          notif.read
                            ? 'text-[#2D2A26] dark:text-[#FAF6F2]'
                            : 'text-[#B45F42] dark:text-[#FF855D]'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="px-2 py-0.5 bg-[#B45F42] text-white text-[10px] font-bold rounded-full">
                          جديد
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-[#5E5248] dark:text-[#C5BCB3] leading-relaxed max-w-3xl">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-[#8C7E72] dark:text-[#7A6F64]">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTimeAgo(notif.createdAt)}</span>
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(notif.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F3EFE9] dark:border-[#2D2723]">
                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="px-3 py-1.5 bg-[#F3EFE9] dark:bg-[#2A2320] hover:bg-[#EDE7DF] dark:hover:bg-[#352C27] text-[#7A6F64] dark:text-[#A89C90] text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      title="تعليم كمقروء"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>تعليم كمقروء</span>
                    </button>
                  )}

                  {notif.actionTab && onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!notif.read) handleMarkAsRead(notif.id);
                        onNavigateTab(notif.actionTab!);
                      }}
                      className="px-4 py-1.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>الانتقال للقسم</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(notif.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                    title="حذف هذا الإشعار"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF6F0] dark:bg-[#25201D] flex items-center justify-center mx-auto text-gray-300 dark:text-gray-600">
              <Bell className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-[#2D2A26] dark:text-[#FAF6F2]">
              لا توجد إشعارات مطابقة للبحث أو التصفية الحالية
            </h4>
            <p className="text-xs text-[#7A6F64] dark:text-[#A89C90] max-w-md mx-auto">
              عند حدوث أي تفاعل جديد على منتجاتك، طلبياتك، أو حسابك ستظهر التنبيهات هنا فورياً مع إمكانية التفاعل معها بنقرة واحدة.
            </p>
          </div>
        )}
      </div>

      {/* Broadcast Announcement Modal (Admin Only) */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#F3EFE9] dark:border-[#2D2723] pb-4">
              <div className="flex items-center gap-2 text-[#B45F42]">
                <Send className="w-5 h-5" />
                <h3 className="text-base font-bold text-[#2D2A26] dark:text-[#FAF6F2]">
                  إرسال إشعار / إعلان عام من الإدارة
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-[#2D2A26] dark:text-[#FAF6F2] block">
                  الفئة المستهدفة
                </label>
                <select
                  value={broadcastRecipient}
                  onChange={(e) => setBroadcastRecipient(e.target.value as any)}
                  className="w-full p-2.5 bg-[#FDFBF7] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] rounded-xl outline-none"
                >
                  <option value="all">كافة مستخدمي المنصة (بائعين ومشترين)</option>
                  <option value="seller">أصحاب الورش والحرفيين فقط</option>
                  <option value="buyer">المشترين فقط</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#2D2A26] dark:text-[#FAF6F2] block">
                  عنوان الإشعار *
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="مثال: خصومات موسم حصاد القصب بالصعيد، تحديث سياسة الشحن..."
                  required
                  className="w-full p-2.5 bg-[#FDFBF7] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] rounded-xl outline-none focus:border-[#B45F42]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#2D2A26] dark:text-[#FAF6F2] block">
                  نص الرسالة / التنبيه *
                </label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={4}
                  placeholder="اكتب تفاصيل التنبيه الموجه للبائعين أو الجمهور..."
                  required
                  className="w-full p-2.5 bg-[#FDFBF7] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] rounded-xl outline-none focus:border-[#B45F42]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F3EFE9] dark:border-[#2D2723]">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال التنبيه الآن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
