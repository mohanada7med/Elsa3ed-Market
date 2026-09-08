import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { RefreshDataButton } from './RefreshDataButton.tsx';
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
  Check,
  Send,
  BellRing,
  Volume2,
  VolumeX,
  Radio,
  MessageSquare,
  Play
} from 'lucide-react';

interface NotificationsManagerProps {
  viewMode: 'seller' | 'admin';
  onNavigateTab?: (tab: string) => void;
}

export const NotificationsManager: React.FC<NotificationsManagerProps> = ({
  viewMode,
  onNavigateTab
}) => {
  const {
    currentUser,
    addToast,
    browserNotificationPermission,
    browserNotificationSettings,
    requestBrowserNotificationPermission,
    updateBrowserNotificationSettings,
    sendTestBrowserNotification
  } = useApp();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

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
    const unsub = notificationService.subscribe(refreshList);
    return () => {
      unsub();
    };
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
        return <KeyRound className="w-5 h-5 text-[#9a6a35]" />;
      default:
        return <Bell className="w-5 h-5 text-[#9a6a35]" />;
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
    <div className="space-y-6 animate-in fade-in" dir="rtl">
      {/* Header Banner */}
      <div className="relative rounded-[2rem] bg-gradient-to-r from-[#211d18] via-[#2d251e] to-[#211d18] text-white p-6 sm:p-8 overflow-hidden shadow-2xl border border-black/10 dark:border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#9a6a35]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[#d5a56d] text-xs font-bold border border-white/15">
              <Bell className="w-4 h-4 text-[#9a6a35]" />
              <span>
                {viewMode === 'admin'
                  ? 'مركز إشعارات الإدارة العامة والرقابة'
                  : 'تنبيهات ورشة الصنعة والمبيعات'}
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black font-serif tracking-tight">
              {viewMode === 'admin'
                ? 'متابعة العمليات الحية، طلبات الورش، والتحويلات المالية'
                : 'متابعة حركة الطلبات، رصيد الأرباح، ونفاد المخزون أولاً بأول'}
            </h2>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              {viewMode === 'admin'
                ? 'تنبيهات فورية بخصوص تسجيل الورش والحرفيين الجدد، مراجعة المنتجات اليدوية، وطلبات السحب والتسويات.'
                : 'إشعارات لحظية عند ورود طلب شراء جديد لمنتجات ورشتك، تحديثات حالة الاعتماد، وتنبيهات مستحقاتك المالية.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <RefreshDataButton
              onRefresh={refreshList}
              label="تحديث الإشعارات"
              variant="outline"
              className="bg-white/10 text-white hover:bg-white/20 border-white/20 rounded-xl"
            />

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 border border-white/15 cursor-pointer shadow-xs"
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
                className="px-5 py-2.5 bg-[#9a6a35] hover:bg-[#83592c] text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>إرسال تنبيه أو إعلان عام</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Web Push & Instant Sound Alerts Configuration Bar */}
      <div className="bg-white/75 dark:bg-[#151513]/90 p-5 sm:p-6 rounded-[2rem] border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-black/10 dark:border-white/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#9a6a35]/10 text-[#9a6a35] flex items-center justify-center shrink-0 border border-[#9a6a35]/20">
              <BellRing className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-[#211d18] dark:text-[#f5f0e7]">
                  إشعارات المتصفح الفورية والتنبيهات الصوتية (Web Push)
                </h3>
                <span
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                    browserNotificationPermission === 'granted'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : browserNotificationPermission === 'denied'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                  }`}
                >
                  {browserNotificationPermission === 'granted'
                    ? '● الإشعارات مفعلة'
                    : browserNotificationPermission === 'denied'
                    ? '● محظورة بالمتصفح'
                    : '○ بانتظار الإذن'}
                </span>
              </div>
              <p className="text-xs text-black/60 dark:text-white/60 max-w-2xl leading-relaxed font-medium">
                استقبل تنبيهات لحظية ورنات مميزة فور ورود طلبات شراء جديدة أو رسائل من العملاء حتى إذا كنت تعمل في تبويب آخر أو المتصفح بالخلفية.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {browserNotificationPermission === 'granted' ? (
              <button
                type="button"
                onClick={sendTestBrowserNotification}
                className="px-4 py-2.5 bg-white/80 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-[#9a6a35] border border-[#9a6a35]/30 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>تجربة إشعار ورنة تجريبية</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isRequestingPermission || browserNotificationPermission === 'denied'}
                onClick={async () => {
                  setIsRequestingPermission(true);
                  await requestBrowserNotificationPermission();
                  setIsRequestingPermission(false);
                }}
                className="px-5 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] disabled:opacity-50 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>{isRequestingPermission ? 'جارٍ طلب الإذن من المتصفح...' : 'السماح بالإشعارات الفورية'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Granular Preferences Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
          {/* Sound Alert Toggle */}
          <div
            onClick={() =>
              updateBrowserNotificationSettings({
                soundEnabled: !browserNotificationSettings.soundEnabled
              })
            }
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              browserNotificationSettings.soundEnabled
                ? 'bg-[#9a6a35]/10 border-[#9a6a35]/30'
                : 'bg-white/40 dark:bg-white/5 border-black/10 dark:border-white/10'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  browserNotificationSettings.soundEnabled
                    ? 'bg-[#9a6a35] text-white shadow-xs'
                    : 'bg-black/10 dark:bg-white/10 text-black/40 dark:text-white/40'
                }`}
              >
                {browserNotificationSettings.soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-[#211d18] dark:text-[#f5f0e7] block truncate">
                  التنبيه الصوتي (Ringtone)
                </span>
                <span className="text-[10px] text-black/50 dark:text-white/50 block truncate font-medium">
                  رنات تراثية هادئة ونقية
                </span>
              </div>
            </div>
            <div
              className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                browserNotificationSettings.soundEnabled ? 'bg-[#9a6a35]' : 'bg-black/20 dark:bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  browserNotificationSettings.soundEnabled ? 'translate-x-0' : '-translate-x-4'
                }`}
              />
            </div>
          </div>

          {/* New Orders Toggle */}
          <div
            onClick={() =>
              updateBrowserNotificationSettings({
                notifyOrders: !browserNotificationSettings.notifyOrders
              })
            }
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              browserNotificationSettings.notifyOrders
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                : 'bg-white/40 dark:bg-white/5 border-black/10 dark:border-white/10'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  browserNotificationSettings.notifyOrders
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-black/10 dark:bg-white/10 text-black/40 dark:text-white/40'
                }`}
              >
                <Package className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-[#211d18] dark:text-[#f5f0e7] block truncate">
                  تنبيهات طلبات الشراء
                </span>
                <span className="text-[10px] text-black/50 dark:text-white/50 block truncate font-medium">
                  إشعار فوري عند كل طلب
                </span>
              </div>
            </div>
            <div
              className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                browserNotificationSettings.notifyOrders ? 'bg-emerald-600' : 'bg-black/20 dark:bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  browserNotificationSettings.notifyOrders ? 'translate-x-0' : '-translate-x-4'
                }`}
              />
            </div>
          </div>

          {/* Chat Messages Toggle */}
          <div
            onClick={() =>
              updateBrowserNotificationSettings({
                notifyMessages: !browserNotificationSettings.notifyMessages
              })
            }
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              browserNotificationSettings.notifyMessages
                ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50'
                : 'bg-white/40 dark:bg-white/5 border-black/10 dark:border-white/10'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  browserNotificationSettings.notifyMessages
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-black/10 dark:bg-white/10 text-black/40 dark:text-white/40'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-[#211d18] dark:text-[#f5f0e7] block truncate">
                  رسائل المحادثة الفورية
                </span>
                <span className="text-[10px] text-black/50 dark:text-white/50 block truncate font-medium">
                  استفسارات المشترين والورش
                </span>
              </div>
            </div>
            <div
              className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                browserNotificationSettings.notifyMessages ? 'bg-blue-600' : 'bg-black/20 dark:bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  browserNotificationSettings.notifyMessages ? 'translate-x-0' : '-translate-x-4'
                }`}
              />
            </div>
          </div>

          {/* Stock Alerts Toggle */}
          <div
            onClick={() =>
              updateBrowserNotificationSettings({
                notifyStock: !browserNotificationSettings.notifyStock
              })
            }
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              browserNotificationSettings.notifyStock
                ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/50'
                : 'bg-white/40 dark:bg-white/5 border-black/10 dark:border-white/10'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  browserNotificationSettings.notifyStock
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-black/10 dark:bg-white/10 text-black/40 dark:text-white/40'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-[#211d18] dark:text-[#f5f0e7] block truncate">
                  تنبيهات المخزون
                </span>
                <span className="text-[10px] text-black/50 dark:text-white/50 block truncate font-medium">
                  عند اقتراب نفاد القطع
                </span>
              </div>
            </div>
            <div
              className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                browserNotificationSettings.notifyStock ? 'bg-purple-600' : 'bg-black/20 dark:bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  browserNotificationSettings.notifyStock ? 'translate-x-0' : '-translate-x-4'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 mb-2">
            <span>إجمالي الإشعارات المسجلة</span>
            <Bell className="w-4 h-4 text-[#9a6a35]" />
          </div>
          <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7]">
            {notifications.length} إشعار
          </span>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">
            سجل حي محدث تلقائياً
          </span>
        </div>

        <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 mb-2">
            <span>الإشعارات غير المقروءة</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7]">
            {unreadCount} جديد
          </span>
          <span className="text-[10px] text-black/50 dark:text-white/50 block mt-1 font-medium">
            تحتاج إلى مراجعة وتدقيق
          </span>
        </div>

        <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 mb-2">
            <span>إشعارات الطلبات والمبيعات</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7]">
            {notifications.filter((n) => n.type === 'new_order').length}
          </span>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">
            حركة البيع المباشر
          </span>
        </div>

        <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 mb-2">
            <span>إشعارات الماليات والتسويات</span>
            <Wallet className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7]">
            {notifications.filter((n) => n.type.startsWith('payout')).length}
          </span>
          <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold block mt-1">
            حسابات وسحوبات الورش
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-5 backdrop-blur-xl shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Read / Unread Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setFilterRead('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                filterRead === 'all'
                  ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
                  : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/10'
              }`}
            >
              كافة الإشعارات ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterRead('unread')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                filterRead === 'unread'
                  ? 'bg-[#9a6a35] text-white shadow-md'
                  : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/10'
              }`}
            >
              غير المقروءة ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterRead('read')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                filterRead === 'read'
                  ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
                  : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/10'
              }`}
            >
              المقروءة ({notifications.length - unreadCount})
            </button>
          </div>

          {/* Quick Actions & Search */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في نص الإشعار..."
                className="w-full pl-4 pr-10 py-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-[#211d18] dark:text-[#f5f0e7] outline-none focus:border-[#9a6a35]"
              />
              <Bell className="w-3.5 h-3.5 text-black/40 dark:text-white/40 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3.5 py-2.5 text-xs font-black text-black/50 dark:text-white/50 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors flex items-center gap-1.5 border border-transparent hover:border-red-200 cursor-pointer"
                title="مسح كافة الإشعارات"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">مسح السجل</span>
              </button>
            )}
          </div>
        </div>

        {/* Type Categories Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-black/10 dark:border-white/10 text-xs">
          <span className="text-black/60 dark:text-white/60 text-[11px] font-black shrink-0 ml-1">
            تصنيف الإشعار:
          </span>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#211d18] dark:bg-white text-white dark:text-[#211d18] font-black'
                : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            الكل
          </button>
          <button
            type="button"
            onClick={() => setFilterType('new_order')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterType === 'new_order'
                ? 'bg-emerald-600 text-white font-black'
                : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            الطلبات والمبيعات
          </button>
          <button
            type="button"
            onClick={() => setFilterType('product_approved')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterType === 'product_approved'
                ? 'bg-emerald-600 text-white font-black'
                : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            اعتماد المنتجات
          </button>
          <button
            type="button"
            onClick={() => setFilterType('low_stock')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterType === 'low_stock'
                ? 'bg-amber-600 text-white font-black'
                : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            تنبيهات المخزون
          </button>
          <button
            type="button"
            onClick={() => setFilterType('payout_paid')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterType === 'payout_paid'
                ? 'bg-purple-600 text-white font-black'
                : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            التحويلات المالية
          </button>
          <button
            type="button"
            onClick={() => setFilterType('new_review')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterType === 'new_review'
                ? 'bg-amber-600 text-white font-black'
                : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            تقييمات الزبائن
          </button>
        </div>
      </div>

      {/* Notifications List Content */}
      <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 overflow-hidden backdrop-blur-xl shadow-lg">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 sm:p-6 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  notif.read
                    ? 'bg-transparent hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                    : 'bg-[#9a6a35]/5 hover:bg-[#9a6a35]/10'
                }`}
              >
                {/* Left (RTL Right): Icon & Details */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1f1d1a] border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm sm:text-base font-black ${
                          notif.read
                            ? 'text-[#211d18] dark:text-[#f5f0e7]'
                            : 'text-[#9a6a35]'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="px-2 py-0.5 bg-[#9a6a35] text-white text-[10px] font-black rounded-full">
                          جديد
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-black/70 dark:text-white/70 leading-relaxed max-w-3xl font-medium">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-black/50 dark:text-white/50 font-medium">
                      <span className="flex items-center gap-1">
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
                <div className="flex items-center gap-2 sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5">
                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="px-3.5 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 text-black/70 dark:text-white/70 text-xs font-black rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
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
                      className="px-4 py-2 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-black rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>الانتقال للقسم</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(notif.id)}
                    className="p-2 text-black/40 dark:text-white/40 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
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
            <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto text-[#9a6a35]/40">
              <Bell className="w-8 h-8" />
            </div>
            <h4 className="text-base font-black text-[#211d18] dark:text-[#f5f0e7]">
              لا توجد إشعارات مطابقة للبحث أو التصفية الحالية
            </h4>
            <p className="text-xs text-black/60 dark:text-white/60 max-w-md mx-auto font-medium">
              عند حدوث أي تفاعل جديد على منتجاتك، طلبياتك، أو حسابك ستظهر التنبيهات هنا فورياً مع إمكانية التفاعل معها بنقرة واحدة.
            </p>
          </div>
        )}
      </div>

      {/* Broadcast Announcement Modal (Admin Only) */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in">
          <div className="bg-white/95 dark:bg-[#151513]/95 rounded-[2rem] border border-black/10 dark:border-white/10 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2 text-[#9a6a35]">
                <Send className="w-5 h-5" />
                <h3 className="text-base sm:text-lg font-black text-[#211d18] dark:text-[#f5f0e7]">
                  إرسال إشعار / إعلان عام من الإدارة
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="p-1.5 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-black text-[#211d18] dark:text-[#f5f0e7] block">
                  الفئة المستهدفة
                </label>
                <select
                  value={broadcastRecipient}
                  onChange={(e) => setBroadcastRecipient(e.target.value as any)}
                  className="w-full p-3 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none text-[#211d18] dark:text-[#f5f0e7] cursor-pointer"
                >
                  <option value="all">كافة مستخدمي المنصة (بائعين ومشترين)</option>
                  <option value="seller">أصحاب الورش والحرفيين فقط</option>
                  <option value="buyer">المشترين فقط</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-[#211d18] dark:text-[#f5f0e7] block">
                  عنوان الإشعار *
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="مثال: خصومات موسم حصاد القصب بالصعيد، تحديث سياسة الشحن..."
                  required
                  className="w-full p-3 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35] text-[#211d18] dark:text-[#f5f0e7] placeholder:text-black/35 dark:placeholder:text-white/35"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-[#211d18] dark:text-[#f5f0e7] block">
                  نص الرسالة / التنبيه *
                </label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={4}
                  placeholder="اكتب تفاصيل التنبيه الموجه للبائعين أو الجمهور..."
                  required
                  className="w-full p-3 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35] text-[#211d18] dark:text-[#f5f0e7] placeholder:text-black/35 dark:placeholder:text-white/35"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2.5 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white font-black cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
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

export default NotificationsManager;
