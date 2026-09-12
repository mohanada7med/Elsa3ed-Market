import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { RefreshDataButton } from './RefreshDataButton.tsx';
import { api } from '../../services/api.ts';
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
  Play,
  User,
  Users,
  ShieldAlert,
  History,
  RotateCcw,
  Loader2,
  Search,
  Info,
  CheckCircle
} from 'lucide-react';
import { resolveNotificationNavigation } from '../../utils/notificationRouter.ts';

interface NotificationsManagerProps {
  viewMode: 'seller' | 'admin' | 'buyer';
  onNavigateTab?: (tab: string) => void;
}

export const NotificationsManager: React.FC<NotificationsManagerProps> = ({
  viewMode,
  onNavigateTab
}) => {
  const {
    currentUser,
    currentRole,
    setActivePage,
    navigateToOrder,
    navigateToProduct,
    navigateToSeller,
    addToast,
    refreshNotifications,
    browserNotificationPermission,
    browserNotificationSettings,
    requestBrowserNotificationPermission,
    updateBrowserNotificationSettings,
    sendTestBrowserNotification,
    confirmModal
  } = useApp();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Admin Sub-Tab & History
  const [adminSubTab, setAdminSubTab] = useState<'inbox' | 'broadcasts'>('inbox');
  const [broadcastHistory, setBroadcastHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Admin Broadcast Announcement state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTargetType, setBroadcastTargetType] = useState<'all' | 'user' | 'buyers' | 'sellers'>('all');
  const [broadcastActionPage, setBroadcastActionPage] = useState<string>('notifications');
  const [selectedTargetUserId, setSelectedTargetUserId] = useState('');
  const [selectedTargetUser, setSelectedTargetUser] = useState<any | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);
  const [broadcastSuccessMessage, setBroadcastSuccessMessage] = useState<string | null>(null);

  const targetSellerId = currentUser?.sellerId || currentUser?.id;

  const refreshList = () => {
    const list = notificationService.getNotifications(viewMode, targetSellerId);
    setNotifications(list);
  };

  const fetchBroadcastHistory = async () => {
    if (viewMode !== 'admin' || !currentUser?.id) return;
    try {
      setIsLoadingHistory(true);
      const data = await api.getAdminBroadcastHistory({ id: currentUser.id, role: 'admin' });
      setBroadcastHistory(data || []);
    } catch (err) {
      console.warn('Failed to load admin broadcast history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchUsers = async () => {
    if (viewMode !== 'admin' || !currentUser?.id) return;
    try {
      setIsLoadingUsers(true);
      const data = await api.getAdminUsers({ id: currentUser.id, role: 'admin' });
      setAvailableUsers(data || []);
    } catch (err) {
      console.warn('Failed to load users for targeted notifications:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    refreshList();
    const unsub = notificationService.subscribe(refreshList);
    return () => {
      unsub();
    };
  }, [viewMode, targetSellerId]);

  useEffect(() => {
    if (viewMode === 'admin') {
      fetchBroadcastHistory();
      fetchUsers();
    }
  }, [viewMode, currentUser?.id]);

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
    confirmModal({
      title: 'حذف سجل الإشعارات',
      message: 'هل أنت متأكد من حذف كافة سجل الإشعارات؟',
      confirmText: 'مسح السجل',
      danger: true,
      onConfirm: async () => {
        notificationService.clearAll(viewMode, targetSellerId);
        refreshList();
        addToast('تم المسح', 'تم مسح سجل الإشعارات بنجاح', 'info');
      }
    });
  };

  const handleResetBroadcastForm = () => {
    setBroadcastTitle('');
    setBroadcastMessage('');
    setBroadcastTargetType('all');
    setBroadcastActionPage('notifications');
    setSelectedTargetUserId('');
    setSelectedTargetUser(null);
    setUserSearchQuery('');
    setBroadcastError(null);
    setBroadcastSuccessMessage(null);
  };

  const handleSelectUser = (user: any) => {
    setSelectedTargetUserId(user.id);
    setSelectedTargetUser(user);
    setUserSearchQuery('');
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastError(null);
    setBroadcastSuccessMessage(null);

    const title = broadcastTitle.trim();
    const message = broadcastMessage.trim();

    if (!title || title.length < 2) {
      setBroadcastError('عنوان الإشعار مطلوب ويجب أن يتكون من حرفين على الأقل');
      return;
    }
    if (title.length > 150) {
      setBroadcastError('عنوان الإشعار يجب ألا يتجاوز 150 حرفاً');
      return;
    }
    if (!message || message.length < 2) {
      setBroadcastError('نص الإشعار مطلوب ويجب أن يتكون من حرفين على الأقل');
      return;
    }
    if (message.length > 2000) {
      setBroadcastError('نص الإشعار يجب ألا يتجاوز 2000 حرف');
      return;
    }
    if (broadcastTargetType === 'user' && !selectedTargetUserId.trim()) {
      setBroadcastError('يرجى تحديد المستخدم المستهدف أو إدخال معرف المستخدم (User ID)');
      return;
    }

    setIsSendingBroadcast(true);
    const idempotencyKey = `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const destinationPage = broadcastActionPage || (broadcastTargetType === 'sellers' ? 'seller-dashboard' : 'notifications');

    try {
      const res = await api.sendAdminNotification(
        { id: currentUser!.id, role: 'admin' },
        {
          title,
          message,
          targetType: broadcastTargetType,
          targetUserId: broadcastTargetType === 'user' ? selectedTargetUserId.trim() : undefined,
          idempotencyKey,
          actionPage: destinationPage,
          link: destinationPage
        }
      );

      if (!res.success) {
        setBroadcastError(res.error || 'فشل إرسال الإشعار من الخادم');
        return;
      }

      const count = res.recipientsCount || 1;
      setBroadcastSuccessMessage(`تم بنجاح حفظ الإشعار في MongoDB وتسليمه لـ ${count} مستخدم في الوقت الفعلي!`);
      addToast(
        'تم إرسال الإشعار بنجاح',
        `تم تسليم الإشعار لـ ${count} مستخدم وتسجيله في قاعدة البيانات`,
        'success'
      );

      await fetchBroadcastHistory();
      refreshList();
      refreshNotifications();

      setTimeout(() => {
        setShowBroadcastModal(false);
        setBroadcastSuccessMessage(null);
        handleResetBroadcastForm();
      }, 1400);
    } catch (err: any) {
      setBroadcastError(err?.message || 'حدث خطأ في الاتصال بالخادم أثناء إرسال الإشعار');
    } finally {
      setIsSendingBroadcast(false);
    }
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
        return <Sparkles className="w-5 h-5 text-amber-600 dark:text-[#d6aa72]" />;
      case 'low_stock':
        return <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-[#d6aa72]" />;
      case 'payout_requested':
      case 'payout_approved':
      case 'payout_paid':
        return <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'new_review':
        return <Star className="w-5 h-5 text-[#d6aa72] " />;
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
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${browserNotificationPermission === 'granted'
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
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${browserNotificationSettings.soundEnabled
              ? 'bg-[#9a6a35]/10 border-[#9a6a35]/30'
              : 'bg-white/40 dark:bg-white/5 border-black/10 dark:border-white/10'
              }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${browserNotificationSettings.soundEnabled
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
              className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${browserNotificationSettings.soundEnabled ? 'bg-[#9a6a35]' : 'bg-black/20 dark:bg-white/20'
                }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${browserNotificationSettings.soundEnabled ? 'translate-x-0' : '-translate-x-4'
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
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${browserNotificationSettings.notifyOrders
              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
              : 'bg-white/40 dark:bg-white/5 border-black/10 dark:border-white/10'
              }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${browserNotificationSettings.notifyOrders
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
              className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${browserNotificationSettings.notifyOrders ? 'bg-emerald-600' : 'bg-black/20 dark:bg-white/20'
                }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${browserNotificationSettings.notifyOrders ? 'translate-x-0' : '-translate-x-4'
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
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${browserNotificationSettings.notifyMessages
              ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50'
              : 'bg-white/40 dark:bg-white/5 border-black/10 dark:border-white/10'
              }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${browserNotificationSettings.notifyMessages
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
              className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${browserNotificationSettings.notifyMessages ? 'bg-blue-600' : 'bg-black/20 dark:bg-white/20'
                }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${browserNotificationSettings.notifyMessages ? 'translate-x-0' : '-translate-x-4'
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
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${browserNotificationSettings.notifyStock
              ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/50'
              : 'bg-white/40 dark:bg-white/5 border-black/10 dark:border-white/10'
              }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${browserNotificationSettings.notifyStock
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
              className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${browserNotificationSettings.notifyStock ? 'bg-purple-600' : 'bg-black/20 dark:bg-white/20'
                }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${browserNotificationSettings.notifyStock ? 'translate-x-0' : '-translate-x-4'
                  }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Admin View Mode Switcher: Inbox vs Sent Broadcasts (Admin Only) */}
      {viewMode === 'admin' && (
        <div className="flex items-center gap-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10 w-fit">
          <button
            type="button"
            id="admin-notifs-inbox-tab"
            onClick={() => setAdminSubTab('inbox')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${adminSubTab === 'inbox'
              ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
              : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
              }`}
          >
            <Bell className="w-4 h-4" />
            <span>الإشعارات الواردة</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#9a6a35] text-white font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            id="admin-notifs-broadcasts-tab"
            onClick={() => {
              setAdminSubTab('broadcasts');
              fetchBroadcastHistory();
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${adminSubTab === 'broadcasts'
              ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
              : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
              }`}
          >
            <History className="w-4 h-4" />
            <span>سجل التنبيهات والإعلانات المرسلة (MongoDB)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/10 font-bold">
              {broadcastHistory.length}
            </span>
          </button>
        </div>
      )}

      {/* Admin Broadcasts History View */}
      {viewMode === 'admin' && adminSubTab === 'broadcasts' ? (
        <div className="space-y-4">
          <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[2rem] border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-[#211d18] dark:text-[#f5f0e7] flex items-center gap-2">
                <History className="w-5 h-5 text-[#9a6a35]" />
                <span>سجل الإعلانات والتنبيهات الموجهة (من قاعدة البيانات MongoDB)</span>
              </h3>
              <p className="text-xs text-black/60 dark:text-white/60 mt-1 font-medium">
                متابعة كافة التنبيهات المرسلة من الإدارة مع تتبع عدد المستلمين الفعلي وعدد القراءات الحقيقية لحظة بلحظة.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={fetchBroadcastHistory}
                disabled={isLoadingHistory}
                className="px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs font-black transition-all flex items-center gap-2 border border-black/10 dark:border-white/10 cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin text-[#9a6a35]' : ''}`} />
                <span>تحديث السجل</span>
              </button>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(true)}
                className="px-5 py-2 bg-[#9a6a35] hover:bg-[#83592c] text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال تنبيه جديد</span>
              </button>
            </div>
          </div>

          {isLoadingHistory ? (
            <div className="p-12 text-center bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10">
              <Loader2 className="w-8 h-8 animate-spin text-[#9a6a35] mx-auto mb-2" />
              <p className="text-xs font-bold text-black/60 dark:text-white/60">جارٍ تحميل سجل الإعلانات من قاعدة البيانات...</p>
            </div>
          ) : broadcastHistory.length > 0 ? (
            <div className="space-y-3">
              {broadcastHistory.map((bc: any) => {
                const targetLabel =
                  bc.targetType === 'all'
                    ? 'كافة المستخدمين'
                    : bc.targetType === 'buyers'
                      ? 'المشترين فقط'
                      : bc.targetType === 'sellers'
                        ? 'أصحاب الورش والحرفيين'
                        : `مستخدم محدد (${bc.targetUserId || 'معرف'})`;

                const targetBadgeColor =
                  bc.targetType === 'all'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    : bc.targetType === 'buyers'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : bc.targetType === 'sellers'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';

                const readCount = bc.readCount ?? (Array.isArray(bc.readBy) ? bc.readBy.length : 0);
                const recipientsCount = bc.recipientsCount || 1;
                const readPercentage = Math.min(100, Math.round((readCount / recipientsCount) * 100));

                return (
                  <div
                    key={bc.id || bc._id}
                    className="p-5 bg-white/80 dark:bg-[#151513]/90 rounded-2xl border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-sm space-y-3 transition-all hover:border-[#9a6a35]/30"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${targetBadgeColor}`}>
                          {targetLabel}
                        </span>
                        <h4 className="text-sm font-black text-[#211d18] dark:text-[#f5f0e7]">
                          {bc.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-black/50 dark:text-white/50 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(bc.createdAt).toLocaleString('ar-EG')}</span>
                      </div>
                    </div>

                    <p className="text-xs text-black/75 dark:text-white/75 leading-relaxed font-medium">
                      {bc.message}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-black/60 dark:text-white/60 font-medium">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#9a6a35]" />
                          <span>عدد المستلمين الفعلي: <strong>{recipientsCount}</strong></span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>تمت القراءة: <strong>{readCount}</strong> ({readPercentage}%)</span>
                        </span>
                        {bc.senderName && (
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-black/40 dark:text-white/40" />
                            <span>بواسطة: {bc.senderName}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        ● محفوظ في MongoDB & تم البث عبر SSE
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#9a6a35]/10 text-[#9a6a35] flex items-center justify-center mx-auto">
                <History className="w-8 h-8" />
              </div>
              <h4 className="text-base font-black text-[#211d18] dark:text-[#f5f0e7]">
                لم يتم إرسال أي إعلانات أو تنبيهات عامة بعد
              </h4>
              <p className="text-xs text-black/60 dark:text-white/60 max-w-md mx-auto font-medium">
                يمكنك إرسال تنبيهات موجهة لكافة مستخدمي المنصة، أو للمشترين فقط، أو للحرفيين، أو لمستخدم بعينه وستظهر هنا في السجل.
              </p>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(true)}
                className="px-6 py-2.5 bg-[#9a6a35] hover:bg-[#83592c] text-white rounded-xl text-xs font-black shadow-lg inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <Send className="w-4 h-4" />
                <span>إرسال أول تنبيه الآن</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
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
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${filterRead === 'all'
                    ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
                    : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/10'
                    }`}
                >
                  كافة الإشعارات ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterRead('unread')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${filterRead === 'unread'
                    ? 'bg-[#9a6a35] text-white shadow-md'
                    : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/10'
                    }`}
                >
                  غير المقروءة ({unreadCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterRead('read')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${filterRead === 'read'
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
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${filterType === 'all'
                  ? 'bg-[#211d18] dark:bg-white text-white dark:text-[#211d18] font-black'
                  : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setFilterType('new_order')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${filterType === 'new_order'
                  ? 'bg-emerald-600 text-white font-black'
                  : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
              >
                الطلبات والمبيعات
              </button>
              <button
                type="button"
                onClick={() => setFilterType('product_approved')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${filterType === 'product_approved'
                  ? 'bg-emerald-600 text-white font-black'
                  : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
              >
                اعتماد المنتجات
              </button>
              <button
                type="button"
                onClick={() => setFilterType('low_stock')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${filterType === 'low_stock'
                  ? 'bg-amber-600 text-white font-black'
                  : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
              >
                تنبيهات المخزون
              </button>
              <button
                type="button"
                onClick={() => setFilterType('payout_paid')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${filterType === 'payout_paid'
                  ? 'bg-purple-600 text-white font-black'
                  : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
              >
                التحويلات المالية
              </button>
              <button
                type="button"
                onClick={() => setFilterType('new_review')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${filterType === 'new_review'
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
                    className={`p-5 sm:p-6 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${notif.read
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
                            className={`text-sm sm:text-base font-black ${notif.read
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

                      {(notif.link || notif.actionPage || notif.metadata?.orderId || notif.metadata?.productId || (notif.actionTab && onNavigateTab)) && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!notif.read) handleMarkAsRead(notif.id);
                            if (notif.actionTab && onNavigateTab) {
                              onNavigateTab(notif.actionTab);
                            } else {
                              resolveNotificationNavigation(notif as any, currentRole, {
                                setActivePage,
                                navigateToOrder,
                                navigateToProduct,
                                navigateToSeller,
                                onNavigateTab
                              });
                            }
                          }}
                          className="px-4 py-2 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-black rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>الانتقال والتفاصيل</span>
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
        </>
      )}

      {/* Broadcast Announcement & Targeted Notifications Modal (Admin Only) */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in overflow-y-auto">
          <div className="bg-white/95 dark:bg-[#151513]/95 rounded-[2rem] border border-black/10 dark:border-white/10 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 backdrop-blur-2xl my-8">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2.5 text-[#9a6a35]">
                <div className="w-10 h-10 rounded-xl bg-[#9a6a35]/10 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#211d18] dark:text-[#f5f0e7]">
                    إرسال إشعار وتنبيه رسمي من الإدارة
                  </h3>
                  <span className="text-[11px] text-black/50 dark:text-white/50 block font-medium">
                    يتم الحفظ في MongoDB والبث لحظياً عبر قنوات SSE الفورية
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBroadcastModal(false);
                  setBroadcastError(null);
                  setBroadcastSuccessMessage(null);
                }}
                className="p-2 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error Banner */}
            {broadcastError && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-bold">{broadcastError}</div>
                <button
                  type="button"
                  onClick={() => setBroadcastError(null)}
                  className="text-rose-600 hover:text-rose-800 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Success Banner */}
            {broadcastSuccessMessage && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-bold">{broadcastSuccessMessage}</div>
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              {/* Target Type Selector */}
              <div className="space-y-2">
                <label className="font-black text-[#211d18] dark:text-[#f5f0e7] block">
                  الفئة المستهدفة بالتنبيه *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastTargetType('all');
                      setSelectedTargetUserId('');
                      setSelectedTargetUser(null);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${broadcastTargetType === 'all'
                      ? 'bg-[#211d18] text-white dark:bg-white dark:text-black border-transparent shadow-md'
                      : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:bg-black/10'
                      }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="font-black text-[11px]">كافة المستخدمين</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastTargetType('user');
                      if (availableUsers.length === 0) fetchUsers();
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${broadcastTargetType === 'user'
                      ? 'bg-[#211d18] text-white dark:bg-white dark:text-black border-transparent shadow-md'
                      : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:bg-black/10'
                      }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="font-black text-[11px]">مستخدم محدد</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastTargetType('buyers');
                      setSelectedTargetUserId('');
                      setSelectedTargetUser(null);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${broadcastTargetType === 'buyers'
                      ? 'bg-[#211d18] text-white dark:bg-white dark:text-black border-transparent shadow-md'
                      : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:bg-black/10'
                      }`}
                  >
                    <Package className="w-4 h-4" />
                    <span className="font-black text-[11px]">المشترين فقط</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastTargetType('sellers');
                      setSelectedTargetUserId('');
                      setSelectedTargetUser(null);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${broadcastTargetType === 'sellers'
                      ? 'bg-[#211d18] text-white dark:bg-white dark:text-black border-transparent shadow-md'
                      : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:bg-black/10'
                      }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="font-black text-[11px]">أصحاب الورش</span>
                  </button>
                </div>
              </div>

              {/* Specific User Search & Selector (When Target = user) */}
              {broadcastTargetType === 'user' && (
                <div className="p-3.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-black text-[#211d18] dark:text-[#f5f0e7] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#9a6a35]" />
                      <span>اختيار المستخدم المستهدف (من قاعدة البيانات) *</span>
                    </label>
                    {selectedTargetUserId && (
                      <span className="text-[10px] text-emerald-600 font-bold">
                        ✓ تم اختيار المستخدم
                      </span>
                    )}
                  </div>

                  {/* Selected User Preview Card */}
                  {selectedTargetUserId ? (
                    <div className="p-3 bg-white dark:bg-[#1c1b18] rounded-xl border border-emerald-500/30 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#9a6a35]/15 text-[#9a6a35] flex items-center justify-center font-black text-xs shrink-0">
                          {(selectedTargetUser?.name || selectedTargetUser?.fullName || 'U').charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-xs text-[#211d18] dark:text-[#f5f0e7] block truncate">
                            {selectedTargetUser?.name || selectedTargetUser?.fullName || 'مستخدم المنصة'}
                          </span>
                          <span className="text-[10px] text-black/50 dark:text-white/50 block font-mono truncate">
                            {selectedTargetUserId} {selectedTargetUser?.email ? `• ${selectedTargetUser.email}` : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#9a6a35]/10 text-[#9a6a35]">
                          {selectedTargetUser?.role === 'seller' ? 'حرفي' : selectedTargetUser?.role === 'admin' ? 'مدير' : 'مشتري'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTargetUserId('');
                            setSelectedTargetUser(null);
                          }}
                          className="p-1 text-black/40 hover:text-red-500 rounded-lg cursor-pointer"
                          title="تغيير المستخدم"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Search / Manual Input */}
                      <div className="relative">
                        <input
                          type="text"
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          placeholder="ابحث بالاسم، البريد الإلكتروني، أو أدخل المعرف (User ID)..."
                          className="w-full pr-9 pl-3 py-2 bg-white dark:bg-[#1a1916] border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35] text-[#211d18] dark:text-[#f5f0e7] placeholder:text-black/35 dark:placeholder:text-white/35"
                        />
                        <Search className="w-4 h-4 text-black/40 dark:text-white/40 absolute right-3 top-2.5 pointer-events-none" />
                      </div>

                      {/* Filtered User Selection List */}
                      <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-black/5 dark:divide-white/5 bg-white dark:bg-[#1a1916] rounded-xl border border-black/10 dark:border-white/10 p-1">
                        {isLoadingUsers ? (
                          <div className="p-4 text-center text-xs text-black/50">جارٍ جلب المستخدمين...</div>
                        ) : availableUsers.filter((u) => {
                          if (!userSearchQuery.trim()) return true;
                          const q = userSearchQuery.toLowerCase();
                          return (
                            (u.name && u.name.toLowerCase().includes(q)) ||
                            (u.fullName && u.fullName.toLowerCase().includes(q)) ||
                            (u.email && u.email.toLowerCase().includes(q)) ||
                            (u.id && u.id.toLowerCase().includes(q)) ||
                            (u._id && String(u._id).toLowerCase().includes(q))
                          );
                        }).slice(0, 6).length > 0 ? (
                          availableUsers
                            .filter((u) => {
                              if (!userSearchQuery.trim()) return true;
                              const q = userSearchQuery.toLowerCase();
                              return (
                                (u.name && u.name.toLowerCase().includes(q)) ||
                                (u.fullName && u.fullName.toLowerCase().includes(q)) ||
                                (u.email && u.email.toLowerCase().includes(q)) ||
                                (u.id && u.id.toLowerCase().includes(q)) ||
                                (u._id && String(u._id).toLowerCase().includes(q))
                              );
                            })
                            .slice(0, 6)
                            .map((u) => (
                              <button
                                key={u.id || u._id}
                                type="button"
                                onClick={() => handleSelectUser(u)}
                                className="w-full text-right p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg flex items-center justify-between gap-2 cursor-pointer transition-colors"
                              >
                                <div className="min-w-0">
                                  <span className="font-bold text-xs text-[#211d18] dark:text-[#f5f0e7] block truncate">
                                    {u.name || u.fullName || 'مستخدم'}
                                  </span>
                                  <span className="text-[10px] text-black/50 dark:text-white/50 block font-mono truncate">
                                    {u.id || u._id} • {u.email || u.phone || 'بدون بريد'}
                                  </span>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/70">
                                  {u.role === 'seller' ? 'حرفي' : u.role === 'admin' ? 'مدير' : 'مشتري'}
                                </span>
                              </button>
                            ))
                        ) : (
                          <div className="p-3 text-center text-xs text-black/50">
                            لم يتم العثور على مستخدم مطابق. يمكنك إدخال معرف المستخدم مباشرة.
                          </div>
                        )}
                      </div>

                      {/* Manual direct User ID entry */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={selectedTargetUserId}
                          onChange={(e) => {
                            setSelectedTargetUserId(e.target.value.trim());
                            setSelectedTargetUser(null);
                          }}
                          placeholder="أو اكتب معرف المستخدم مباشرة (User ID)"
                          className="flex-1 p-2 bg-white dark:bg-[#1a1916] border border-black/10 dark:border-white/10 rounded-xl outline-none font-mono text-[11px] text-[#211d18] dark:text-[#f5f0e7]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-black text-[#211d18] dark:text-[#f5f0e7] block">
                    عنوان الإشعار والتنبيه *
                  </label>
                  <span className="text-[10px] text-black/40 dark:text-white/40 font-mono">
                    {broadcastTitle.length}/150
                  </span>
                </div>
                <input
                  type="text"
                  value={broadcastTitle}
                  maxLength={150}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="مثال: تحديث أوقات تسليم طلبات الأعياد، إشعار سحب مستحقات..."
                  required
                  className="w-full p-3 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35] text-[#211d18] dark:text-[#f5f0e7] placeholder:text-black/35 dark:placeholder:text-white/35 font-medium"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-black text-[#211d18] dark:text-[#f5f0e7] block">
                    نص الرسالة والتنبيه المفصل *
                  </label>
                  <span className="text-[10px] text-black/40 dark:text-white/40 font-mono">
                    {broadcastMessage.length}/2000
                  </span>
                </div>
                <textarea
                  value={broadcastMessage}
                  maxLength={2000}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={4}
                  placeholder="اكتب التوجيهات أو الإعلان الرسمي بشكل واضح..."
                  required
                  className="w-full p-3 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35] text-[#211d18] dark:text-[#f5f0e7] placeholder:text-black/35 dark:placeholder:text-white/35 leading-relaxed font-medium"
                />
              </div>

              {/* Destination Page on Click */}
              <div className="space-y-1.5">
                <label className="font-black text-[#211d18] dark:text-[#f5f0e7] block">
                  وجهة الانتقال عند النقر على الإشعار
                </label>
                <select
                  value={broadcastActionPage}
                  onChange={(e) => setBroadcastActionPage(e.target.value)}
                  className="w-full p-3 bg-white/60 dark:bg-[#151513] border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35] text-[#211d18] dark:text-[#f5f0e7] font-bold text-xs cursor-pointer"
                >
                  <option value="notifications">مركز الإشعارات (الافتراضي)</option>
                  <option value="products">سوق وَه للحرف والمنتجات</option>
                  <option value="orders">صفحة متابعة الطلبيات</option>
                  <option value="seller-dashboard">لوحة تحكم الورش الحرفية</option>
                  <option value="buyer-account">الملف الشخصي والحساب</option>
                  <option value="home">الصفحة الرئيسية</option>
                </select>
                <p className="text-[10px] text-black/50 dark:text-white/50">
                  سيتم توجيه المستخدم تلقائياً وبأمان لهذه الصفحة عند النقر على الإشعار دون حدوث خطأ 404.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={handleResetBroadcastForm}
                  className="px-3 py-2 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة ضبط</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBroadcastModal(false);
                      setBroadcastError(null);
                      setBroadcastSuccessMessage(null);
                    }}
                    className="px-4 py-2.5 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white font-black cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingBroadcast || !broadcastTitle.trim() || !broadcastMessage.trim()}
                    className="px-6 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] disabled:opacity-50 font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isSendingBroadcast ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#9a6a35]" />
                        <span>جارٍ الحفظ والبث...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>إرسال التنبيه الآن</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsManager;

