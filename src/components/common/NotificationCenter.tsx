import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  notificationService,
  AppNotification,
  NotificationType,
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
  Clock,
  Volume2,
  VolumeX,
  BellRing,
  Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { resolveNotificationNavigation } from '../../utils/notificationRouter.ts';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className = '',
}) => {
  const {
    currentRole,
    currentUser,
    setActivePage,
    navigateToOrder,
    navigateToProduct,
    navigateToSeller,
    browserNotificationPermission,
    browserNotificationSettings,
    requestBrowserNotificationPermission,
    updateBrowserNotificationSettings,
    sendTestBrowserNotification,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const targetSellerId = currentUser?.sellerId || currentUser?.id;

  const role = currentRole as 'admin' | 'seller' | 'buyer';

  /* =========================================================
     LOAD NOTIFICATIONS
  ========================================================= */

  const loadNotifications = () => {
    const list = notificationService.getNotifications(
      role,
      targetSellerId
    );

    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
    const unsub = notificationService.subscribe(loadNotifications);
    return () => {
      unsub();
    };
  }, [currentRole, targetSellerId]);

  /* =========================================================
     OUTSIDE CLICK
  ========================================================= */

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown
      );
    };
  }, [isOpen]);

  /* =========================================================
     ESCAPE
  ========================================================= */

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  /* =========================================================
     COUNTS
  ========================================================= */

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((notification) => !notification.read)
      : notifications;

  /* =========================================================
     ACTIONS
  ========================================================= */

  const handleToggle = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    loadNotifications();
    setIsOpen((previous) => !previous);
  };

  const handleMarkAsRead = (
    id: string,
    event?: React.MouseEvent
  ) => {
    event?.stopPropagation();

    notificationService.markAsRead(id);

    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead(
      role,
      targetSellerId
    );

    loadNotifications();
  };

  const handleDeleteNotification = (
    id: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    notificationService.deleteNotification(id);

    loadNotifications();
  };

  const handleClearAll = () => {
    if (
      !window.confirm(
        'هل أنت متأكد من مسح جميع الإشعارات؟'
      )
    ) {
      return;
    }

    notificationService.clearAll(
      role,
      targetSellerId
    );

    loadNotifications();
  };

  const handleNotificationClick = (
    notification: AppNotification
  ) => {
    if (!notification.read) {
      notificationService.markAsRead(
        notification.id
      );
    }

    resolveNotificationNavigation(notification as any, currentRole, {
      setActivePage,
      navigateToOrder,
      navigateToProduct,
      navigateToSeller
    });

    setIsOpen(false);

    loadNotifications();
  };

  /* =========================================================
     ICONS
  ========================================================= */

  const getNotificationIcon = (
    type: NotificationType
  ) => {
    switch (type) {
      case 'new_order':
        return (
          <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        );

      case 'product_approved':
        return (
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        );

      case 'product_rejected':
        return (
          <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
        );

      case 'product_pending_review':
        return (
          <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        );

      case 'low_stock':
        return (
          <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
        );

      case 'payout_requested':
      case 'payout_approved':
      case 'payout_paid':
        return (
          <Wallet className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        );

      case 'new_review':
        return (
          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
        );

      case 'new_seller_registered':
        return (
          <UserPlus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        );

      case 'password_reset_requested':
        return (
          <KeyRound className="h-4 w-4 text-[#9a6a35]" />
        );

      default:
        return (
          <Bell className="h-4 w-4 text-[#9a6a35]" />
        );
    }
  };

  /* =========================================================
     TIME
  ========================================================= */

  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs =
        Date.now() -
        new Date(isoString).getTime();

      const diffMins = Math.floor(
        diffMs / 60000
      );

      const diffHours = Math.floor(
        diffMins / 60
      );

      const diffDays = Math.floor(
        diffHours / 24
      );

      if (diffMins < 1) {
        return 'الآن';
      }

      if (diffMins < 60) {
        return `منذ ${diffMins} دقيقة`;
      }

      if (diffHours < 24) {
        return `منذ ${diffHours} ساعة`;
      }

      return `منذ ${diffDays} يوم`;
    } catch {
      return '';
    }
  };

  /* =========================================================
     ROLE DESCRIPTION
  ========================================================= */

  const roleDescription =
    currentRole === 'admin'
      ? 'متابعة الطلبات، الورش، والاعتمادات بالمنصة'
      : currentRole === 'seller'
        ? 'تنبيهات المبيعات، المخزون، والاعتمادات'
        : 'تحديثات الحساب والطلبات';

  return (
    <div
      ref={dropdownRef}
      className={`
        relative
        shrink-0
        ${className}
      `}
    >
      {/* =====================================================
          NOTIFICATION BUTTON
      ===================================================== */}

      <button
        type="button"
        id="notifications-toggle-btn"
        onClick={handleToggle}
        aria-label={`مركز الإشعارات، ${unreadCount} إشعار غير مقروء`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="
          relative
          flex
          items-center
          justify-center
          w-9
          h-9
          sm:w-10
          sm:h-10
          lg:w-11
          lg:h-11
          rounded-xl
          border
          border-black/10
          dark:border-white/10
          bg-white/80
          dark:bg-white/5
          text-black/70
          dark:text-white/70
          transition-all
          duration-200
          hover:border-[#9a6a35]
          hover:text-[#9a6a35]
          hover:bg-white
          dark:hover:bg-white/10
          active:scale-95
          cursor-pointer
          shadow-sm
        "
      >
        <Bell
          className="
            w-[17px]
            h-[17px]
            sm:w-[18px]
            sm:h-[18px]
          "
        />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            className="
              absolute
              -top-1
              -right-1
              min-w-[18px]
              h-[18px]
              px-1
              rounded-full
              bg-[#9a6a35]
              text-white
              text-[9px]
              font-black
              flex
              items-center
              justify-center
              border-2
              border-[#eee8dc]
              dark:border-[#0b0b0a]
              shadow-md
            "
          >
            {unreadCount > 99
              ? '99+'
              : unreadCount}
          </motion.span>
        )}
      </button>

      {/* =====================================================
          PANEL
      ===================================================== */}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="notifications-panel"
            role="dialog"
            aria-label="مركز الإشعارات"
            initial={{
              opacity: 0,
              y: -8,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -8,
              scale: 0.97,
            }}
            transition={{
              duration: 0.18,
              ease: 'easeOut',
            }}
            className="
              absolute
              z-[100]
              right-0
              top-[calc(100%+10px)]
              w-[420px]
              sm:w-[420px]
              max-w-[calc(100vw-16px)]
              bg-white/95
              dark:bg-[#151513]/95
              backdrop-blur-2xl
              border
              border-black/10
              dark:border-white/10
              rounded-[1.5rem]
              shadow-2xl
              overflow-hidden
              origin-top-right
              flex
              flex-col
              max-h-[min(680px,calc(100vh-90px))]
            "
          >
            {/* PANEL HEADER */}
            <div
              className="
                px-4
                py-3.5
                bg-black/5
                dark:bg-white/5
                border-b
                border-black/10
                dark:border-white/10
                flex
                items-center
                justify-between
                gap-2
              "
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="
                    w-9
                    h-9
                    rounded-xl
                    bg-[#9a6a35]/10
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <Bell className="w-4 h-4 text-[#9a6a35]" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3
                      className="
                        text-[13px]
                        sm:text-sm
                        font-black
                        text-[#211d18]
                        dark:text-[#f5f0e7]
                        truncate
                      "
                    >
                      الإشعارات والتنبيهات
                    </h3>

                    {unreadCount > 0 && (
                      <span
                        className="
                          shrink-0
                          bg-[#9a6a35]
                          text-white
                          text-[9px]
                          font-black
                          px-1.5
                          py-0.5
                          rounded-full
                        "
                      >
                        {unreadCount} جديد
                      </span>
                    )}
                  </div>

                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      sm:text-[11px]
                      text-black/60
                      dark:text-white/60
                      truncate
                      font-medium
                    "
                  >
                    {roleDescription}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="إغلاق الإشعارات"
                className="
                  shrink-0
                  w-8
                  h-8
                  flex
                  items-center
                  justify-center
                  rounded-lg
                  text-black/50
                  dark:text-white/50
                  hover:text-[#9a6a35]
                  hover:bg-black/5
                  dark:hover:bg-white/5
                  transition-colors
                  cursor-pointer
                "
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* BROWSER NOTIFICATIONS */}
            <div
              className="
                px-4
                py-2.5
                bg-[#9a6a35]/10
                border-b
                border-black/10
                dark:border-white/10
                flex
                items-center
                justify-between
                gap-2
              "
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="
                    w-7
                    h-7
                    rounded-lg
                    bg-[#9a6a35]
                    text-white
                    flex
                    items-center
                    justify-center
                    shrink-0
                    shadow-sm
                  "
                >
                  <BellRing className="w-3.5 h-3.5" />
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      text-[10px]
                      sm:text-[11px]
                      font-black
                      text-[#211d18]
                      dark:text-[#f5f0e7]
                      truncate
                    "
                  >
                    {browserNotificationPermission ===
                      'granted'
                      ? 'إشعارات المتصفح مفعلة'
                      : browserNotificationPermission ===
                        'denied'
                        ? 'إشعارات المتصفح محظورة'
                        : 'تفعيل إشعارات المتصفح'}
                  </p>

                  <p
                    className="
                      text-[9px]
                      sm:text-[10px]
                      text-black/60
                      dark:text-white/60
                      truncate
                      font-medium
                    "
                  >
                    {browserNotificationPermission ===
                      'granted'
                      ? 'تنبيهات لحظية للطلبات والرسائل'
                      : 'احصل على تنبيهات لحظية'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {browserNotificationPermission ===
                  'granted' ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        updateBrowserNotificationSettings({
                          soundEnabled:
                            !browserNotificationSettings.soundEnabled,
                        })
                      }
                      className={`
                        w-7
                        h-7
                        rounded-lg
                        border
                        flex
                        items-center
                        justify-center
                        transition-all
                        cursor-pointer
                        ${browserNotificationSettings.soundEnabled
                          ? 'bg-[#9a6a35]/15 border-[#9a6a35]/30 text-[#9a6a35]'
                          : 'bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 border-black/10 dark:border-white/10'
                        }
                      `}
                      title={
                        browserNotificationSettings.soundEnabled
                          ? 'تعطيل الصوت'
                          : 'تفعيل الصوت'
                      }
                    >
                      {browserNotificationSettings.soundEnabled ? (
                        <Volume2 className="w-3.5 h-3.5" />
                      ) : (
                        <VolumeX className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={sendTestBrowserNotification}
                      className="
                        h-7
                        px-2.5
                        rounded-lg
                        bg-white/80
                        dark:bg-white/5
                        border
                        border-[#9a6a35]/30
                        hover:border-[#9a6a35]
                        text-[#9a6a35]
                        hover:bg-[#9a6a35]
                        hover:text-white
                        text-[9px]
                        font-black
                        transition-all
                        cursor-pointer
                      "
                    >
                      تجربة
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={
                      isRequestingPermission ||
                      browserNotificationPermission ===
                      'denied'
                    }
                    onClick={async () => {
                      setIsRequestingPermission(true);

                      await requestBrowserNotificationPermission();

                      setIsRequestingPermission(false);
                    }}
                    className="
                      h-7
                      px-2.5
                      bg-[#211d18]
                      dark:bg-white
                      text-white
                      dark:text-black
                      hover:bg-[#9a6a35]
                      dark:hover:bg-[#d5a56d]
                      disabled:opacity-50
                      rounded-lg
                      text-[9px]
                      font-black
                      transition-all
                      cursor-pointer
                      flex
                      items-center
                      gap-1
                    "
                  >
                    <Radio className="w-3 h-3" />

                    <span>
                      {isRequestingPermission
                        ? 'جارٍ الطلب...'
                        : 'تفعيل'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* FILTERS */}
            <div
              className="
                px-4
                py-2
                bg-white/50
                dark:bg-white/[0.02]
                border-b
                border-black/10
                dark:border-white/10
                flex
                items-center
                justify-between
                gap-2
              "
            >
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`
                    px-3
                    py-1.5
                    rounded-lg
                    text-[10px]
                    font-black
                    transition-all
                    cursor-pointer
                    ${filter === 'all'
                      ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-xs'
                      : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
                    }
                  `}
                >
                  الكل ({notifications.length})
                </button>

                <button
                  type="button"
                  onClick={() => setFilter('unread')}
                  className={`
                    px-3
                    py-1.5
                    rounded-lg
                    text-[10px]
                    font-black
                    transition-all
                    cursor-pointer
                    ${filter === 'unread'
                      ? 'bg-[#9a6a35] text-white shadow-xs'
                      : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
                    }
                  `}
                >
                  غير المقروءة ({unreadCount})
                </button>
              </div>

              {notifications.length > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="
                        text-[10px]
                        font-black
                        text-[#9a6a35]
                        hover:underline
                        flex
                        items-center
                        gap-1
                        cursor-pointer
                      "
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        قراءة الكل
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="
                      w-7
                      h-7
                      rounded-lg
                      text-black/40
                      dark:text-white/40
                      hover:text-red-600
                      hover:bg-red-50
                      dark:hover:bg-red-950/20
                      flex
                      items-center
                      justify-center
                      transition-colors
                      cursor-pointer
                    "
                    title="مسح الكل"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* NOTIFICATIONS LIST */}
            <div
              className="
                overflow-y-auto
                overscroll-contain
                divide-y
                divide-black/5
                dark:divide-white/5
                flex-1
                min-h-0
                max-h-[380px]
                sm:max-h-[430px]
                scrollbar-thin
              "
            >
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map(
                  (notification) => (
                    <div
                      key={notification.id}
                      onClick={() =>
                        handleNotificationClick(
                          notification
                        )
                      }
                      className={`
                        relative
                        p-3.5
                        sm:p-4
                        flex
                        items-start
                        gap-3
                        cursor-pointer
                        transition-colors
                        group
                        ${notification.read
                          ? 'bg-transparent hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                          : 'bg-[#9a6a35]/5 hover:bg-[#9a6a35]/10'
                        }
                      `}
                    >
                      {/* Unread indicator */}
                      {!notification.read && (
                        <div
                          className="
                            absolute
                            right-0
                            top-3
                            bottom-3
                            w-1
                            bg-[#9a6a35]
                            rounded-l-full
                          "
                        />
                      )}

                      {/* Icon */}
                      <div
                        className="
                          w-9
                          h-9
                          sm:w-10
                          sm:h-10
                          rounded-xl
                          bg-white
                          dark:bg-[#1f1d1a]
                          border
                          border-black/10
                          dark:border-white/10
                          flex
                          items-center
                          justify-center
                          shrink-0
                          shadow-sm
                        "
                      >
                        {getNotificationIcon(
                          notification.type
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-2
                          "
                        >
                          <h4
                            className={`
                              text-[12px]
                              sm:text-sm
                              font-black
                              leading-5
                              truncate
                              ${notification.read
                                ? 'text-[#211d18] dark:text-[#f5f0e7]'
                                : 'text-[#9a6a35]'
                              }
                            `}
                          >
                            {notification.title}
                          </h4>

                          <span
                            className="
                              text-[9px]
                              sm:text-[10px]
                              text-black/40
                              dark:text-white/40
                              flex
                              items-center
                              gap-1
                              shrink-0
                              font-medium
                            "
                          >
                            <Clock className="w-2.5 h-2.5" />
                            <span>
                              {formatTimeAgo(
                                notification.createdAt
                              )}
                            </span>
                          </span>
                        </div>

                        <p
                          className="
                            mt-0.5
                            text-[11px]
                            sm:text-xs
                            text-black/70
                            dark:text-white/70
                            line-clamp-2
                            leading-relaxed
                          "
                        >
                          {notification.message}
                        </p>

                        {/* Actions */}
                        <div
                          className="
                            pt-2
                            flex
                            items-center
                            justify-between
                            gap-2
                          "
                        >
                          {notification.actionPage ? (
                            <span
                              className="
                                inline-flex
                                items-center
                                gap-1
                                text-[10px]
                                font-black
                                text-[#9a6a35]
                              "
                            >
                              عرض التفاصيل
                              <ExternalLink className="w-3 h-3" />
                            </span>
                          ) : (
                            <span />
                          )}

                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <button
                                type="button"
                                onClick={(event) =>
                                  handleMarkAsRead(
                                    notification.id,
                                    event
                                  )
                                }
                                className="
                                  opacity-0
                                  group-hover:opacity-100
                                  w-7
                                  h-7
                                  rounded-lg
                                  text-[#9a6a35]
                                  hover:bg-[#9a6a35]/10
                                  transition-all
                                  flex
                                  items-center
                                  justify-center
                                  cursor-pointer
                                "
                                title="تعليم كمقروء"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(event) =>
                                handleDeleteNotification(
                                  notification.id,
                                  event
                                )
                              }
                              className="
                                opacity-70
                                sm:opacity-0
                                sm:group-hover:opacity-100
                                hover:opacity-100
                                w-7
                                h-7
                                rounded-lg
                                text-black/40
                                dark:text-white/40
                                hover:text-red-600
                                hover:bg-red-50
                                dark:hover:bg-red-950/20
                                transition-all
                                flex
                                items-center
                                justify-center
                                cursor-pointer
                              "
                              title="حذف الإشعار"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )
              ) : (
                /* EMPTY STATE */
                <div
                  className="
                    px-6
                    py-12
                    text-center
                    flex
                    flex-col
                    items-center
                  "
                >
                  <div
                    className="
                      w-14
                      h-14
                      rounded-2xl
                      bg-black/5
                      dark:bg-white/5
                      flex
                      items-center
                      justify-center
                      text-[#9a6a35]/40
                    "
                  >
                    <Bell className="w-7 h-7" />
                  </div>

                  <h4
                    className="
                      mt-4
                      text-sm
                      font-black
                      text-[#211d18]
                      dark:text-[#f5f0e7]
                    "
                  >
                    {filter === 'unread'
                      ? 'لا توجد إشعارات غير مقروءة'
                      : 'صندوق الإشعارات فارغ حالياً'}
                  </h4>

                  <p
                    className="
                      mt-1.5
                      text-[10px]
                      sm:text-[11px]
                      text-black/60
                      dark:text-white/60
                      max-w-[280px]
                      leading-relaxed
                      font-medium
                    "
                  >
                    ستصلك هنا كافة التنبيهات الخاصة
                    بالطلبات والمنتجات والحساب أولاً بأول.
                  </p>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div
              className="
                px-4
                py-2.5
                bg-black/5
                dark:bg-white/5
                border-t
                border-black/10
                dark:border-white/10
                flex
                flex-col
                gap-2
              "
            >
              <button
                type="button"
                id="notification-center-view-all-btn"
                onClick={() => {
                  setIsOpen(false);
                  setActivePage('notifications');
                }}
                className="
                  w-full
                  py-2
                  px-3
                  rounded-xl
                  bg-[#9a6a35]
                  hover:bg-[#744e26]
                  text-white
                  text-xs
                  font-bold
                  transition-colors
                  cursor-pointer
                  text-center
                "
              >
                عرض كافة الإشعارات
              </button>
              <span
                className="
                  text-[9px]
                  sm:text-[10px]
                  text-black/60
                  dark:text-white/60
                  flex
                  items-center
                  justify-center
                  gap-1.5
                  font-medium
                "
              >
                <span
                  className="
                    w-1.5
                    h-1.5
                    rounded-full
                    bg-emerald-500
                    animate-pulse
                  "
                />
                نظام إشعارات وَه الفوري
                <span className="opacity-40">•</span>
                تحديث تلقائي
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;