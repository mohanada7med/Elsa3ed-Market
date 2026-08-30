import React, { useState, useEffect, useRef } from 'react';
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
  X,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const { currentRole, currentUser, setActivePage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const targetSellerId = currentUser?.sellerId || currentUser?.id;

  const loadNotifications = () => {
    const list = notificationService.getNotifications(
      currentRole as 'admin' | 'seller' | 'buyer' | 'guest',
      targetSellerId
    );
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 8000);
    return () => clearInterval(interval);
  }, [currentRole, targetSellerId]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    notificationService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead(
      currentRole as 'admin' | 'seller' | 'buyer' | 'guest',
      targetSellerId
    );
    loadNotifications();
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    notificationService.deleteNotification(id);
    loadNotifications();
  };

  const handleClearAll = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع الإشعارات؟')) {
      notificationService.clearAll(
        currentRole as 'admin' | 'seller' | 'buyer' | 'guest',
        targetSellerId
      );
      loadNotifications();
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) {
      handleMarkAsRead(notif.id);
    }
    if (notif.actionPage) {
      setActivePage(notif.actionPage as any);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'new_order':
        return <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'product_approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'product_rejected':
        return <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'product_pending_review':
        return <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      case 'payout_requested':
      case 'payout_approved':
      case 'payout_paid':
        return <Wallet className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'new_review':
        return <Star className="w-4 h-4 text-amber-400 fill-amber-400" />;
      case 'new_seller_registered':
        return <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'password_reset_requested':
        return <KeyRound className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <Bell className="w-4 h-4 text-[#B45F42]" />;
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

  const filteredNotifications = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        id="notifications-toggle-btn"
        onClick={() => {
          setIsOpen(!isOpen);
          loadNotifications();
        }}
        className="relative p-2 sm:p-2.5 text-[#2D2A26] dark:text-[#FAF6F2] hover:bg-[#F3EFE9] dark:hover:bg-[#25201D] rounded-xl transition-all flex items-center justify-center cursor-pointer border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px]"
        aria-label={`مركز الإشعارات، ${unreadCount} إشعار غير مقروء`}
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#7A6F64] dark:text-[#A89C90] hover:text-[#B45F42] transition-colors" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="notifications-panel"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 mt-2 w-[340px] sm:w-[420px] max-w-[92vw] bg-white dark:bg-[#1E1917] border border-[#E8E1D9] dark:border-[#382E27] rounded-3xl shadow-2xl z-50 overflow-hidden origin-top-left flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-4 bg-[#FAF6F0] dark:bg-[#26201C] border-b border-[#E8E1D9] dark:border-[#382E27] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#B45F42]/10 dark:bg-[#B45F42]/20 flex items-center justify-center text-[#B45F42]">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#2D2A26] dark:text-[#FAF6F2] flex items-center gap-1.5">
                    <span>الإشعارات والتنبيهات</span>
                    {unreadCount > 0 && (
                      <span className="bg-[#B45F42] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} جديد
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-[#7A6F64] dark:text-[#A89C90]">
                    {currentRole === 'admin'
                      ? 'متابعة الطلبات، الورش، والاعتمادات بالمنصة'
                      : currentRole === 'seller'
                      ? 'تنبيهات المبيعات، المخزون، والاعتمادات'
                      : 'تحديثات الحساب والطلبات'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-black/5"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs & Quick Actions */}
            <div className="px-4 py-2 bg-white dark:bg-[#1E1917] border-b border-[#E8E1D9] dark:border-[#382E27] flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    filter === 'all'
                      ? 'bg-[#B45F42] text-white'
                      : 'text-[#7A6F64] dark:text-[#A89C90] hover:bg-[#F3EFE9] dark:hover:bg-[#2A2420]'
                  }`}
                >
                  الكل ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    filter === 'unread'
                      ? 'bg-[#B45F42] text-white'
                      : 'text-[#7A6F64] dark:text-[#A89C90] hover:bg-[#F3EFE9] dark:hover:bg-[#2A2420]'
                  }`}
                >
                  غير المقروءة ({unreadCount})
                </button>
              </div>

              {notifications.length > 0 && (
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] font-bold text-[#B45F42] hover:underline flex items-center gap-1 cursor-pointer"
                      title="تعليم كل الإشعارات كمقروءة"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>قراءة الكل</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-[11px] text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
                    title="مسح الكل"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto divide-y divide-[#F3EFE9] dark:divide-[#2D2723] flex-1 max-h-[380px]">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 sm:p-4 transition-colors cursor-pointer flex items-start gap-3 group relative ${
                      notif.read
                        ? 'bg-white dark:bg-[#1E1917] hover:bg-[#FAF6F0] dark:hover:bg-[#25201D]'
                        : 'bg-[#FFF8F3] dark:bg-[#2D201A] hover:bg-[#FDF2E9] dark:hover:bg-[#38261E]'
                    }`}
                  >
                    {/* Unread Indicator Bar */}
                    {!notif.read && (
                      <div className="absolute right-0 top-3 bottom-3 w-1 bg-[#B45F42] rounded-l-full" />
                    )}

                    {/* Icon Bubble */}
                    <div className="w-9 h-9 rounded-2xl bg-white dark:bg-[#2A2320] border border-[#E8E1D9] dark:border-[#382E27] flex items-center justify-center shrink-0 shadow-2xs">
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-xs sm:text-sm font-bold truncate ${
                            notif.read
                              ? 'text-[#2D2A26] dark:text-[#FAF6F2]'
                              : 'text-[#B45F42] dark:text-[#FF855D]'
                          }`}
                        >
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-[#8C7E72] dark:text-[#7A6F64] flex items-center gap-1 shrink-0 font-medium">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formatTimeAgo(notif.createdAt)}</span>
                        </span>
                      </div>

                      <p className="text-xs text-[#5E5248] dark:text-[#C5BCB3] line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Action Pill if navigational */}
                      {notif.actionPage && (
                        <div className="pt-1 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#B45F42] dark:text-[#FF855D]">
                            <span>عرض التفاصيل</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteNotification(notif.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all rounded-md"
                            title="حذف هذا الإشعار"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#FAF6F0] dark:bg-[#25201D] flex items-center justify-center mx-auto text-gray-300 dark:text-gray-600">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#2D2A26] dark:text-[#FAF6F2]">
                    {filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'صندوق الإشعارات فارغ حالياً'}
                  </h4>
                  <p className="text-[11px] text-[#7A6F64] dark:text-[#A89C90] max-w-xs mx-auto">
                    ستصلك هنا كافة التنبيهات الفورية بخصوص الطلبات، حالة المنتجات، والمستحقات المالية أولاً بأول.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-[#FAF6F0] dark:bg-[#26201C] border-t border-[#E8E1D9] dark:border-[#382E27] text-center">
              <span className="text-[10px] text-[#7A6F64] dark:text-[#A89C90]">
                نظام إشعارات سوق الصعيد الفوري • تحديث تلقائي مستمر
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
