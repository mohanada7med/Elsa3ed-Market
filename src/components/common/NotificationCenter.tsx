
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

  const role = currentRole as 'admin' | 'seller' | 'buyer' | 'guest';

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

    const interval = window.setInterval(() => {
      loadNotifications();
    }, 8000);

    return () => window.clearInterval(interval);
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

    if (notification.actionPage) {
      setActivePage(
        notification.actionPage as any
      );
    }

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
          <KeyRound className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        );

      default:
        return (
          <Bell className="h-4 w-4 text-[#B24C2B]" />
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
          border-[#E5DDD3]
          dark:border-[#352B24]
          bg-white
          dark:bg-[#201A17]
          text-[#73675B]
          dark:text-[#C5BCB3]
          transition-all
          duration-200
          hover:border-[#B24C2B]
          hover:text-[#B24C2B]
          hover:bg-[#FAF7F2]
          dark:hover:bg-[#2A2320]
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
              bg-[#B24C2B]
              text-white
              text-[9px]
              font-black
              flex
              items-center
              justify-center
              border-2
              border-white
              dark:border-[#15110E]
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

              /* Desktop */
              right-0
              top-[calc(100%+10px)]
              w-[420px]

              /* Tablet */
              sm:w-[420px]

              /* Mobile */
              max-w-[calc(100vw-16px)]

              bg-white
              dark:bg-[#1E1917]

              border
              border-[#E5DDD3]
              dark:border-[#352B24]

              rounded-2xl
              sm:rounded-3xl

              shadow-[0_20px_60px_rgba(45,42,38,0.18)]
              dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)]

              overflow-hidden

              origin-top-right

              flex
              flex-col

              max-h-[min(680px,calc(100vh-90px))]
            "
          >
            {/* =================================================
                PANEL HEADER
            ================================================= */}

            <div
              className="
                px-3
                py-3
                sm:px-4
                sm:py-4

                bg-[#FAF7F2]
                dark:bg-[#26201C]

                border-b
                border-[#E5DDD3]
                dark:border-[#352B24]

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
                    bg-[#B24C2B]/10
                    dark:bg-[#B24C2B]/20
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <Bell className="w-4 h-4 text-[#B24C2B]" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3
                      className="
                        text-[13px]
                        sm:text-sm
                        font-black
                        text-[#2D2A26]
                        dark:text-[#FAF6F2]
                        truncate
                      "
                    >
                      الإشعارات والتنبيهات
                    </h3>

                    {unreadCount > 0 && (
                      <span
                        className="
                          shrink-0
                          bg-[#B24C2B]
                          text-white
                          text-[9px]
                          font-bold
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
                      text-[#73675B]
                      dark:text-[#A89C90]
                      truncate
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
                  text-[#8C7E72]
                  hover:text-[#B24C2B]
                  hover:bg-black/5
                  dark:hover:bg-white/5
                  transition-colors
                  cursor-pointer
                "
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* =================================================
                BROWSER NOTIFICATIONS
            ================================================= */}

            <div
              className="
                px-3
                py-2.5
                sm:px-4

                bg-gradient-to-r
                from-amber-500/10
                via-[#B24C2B]/10
                to-amber-500/10

                dark:from-amber-950/30
                dark:via-[#B24C2B]/20
                dark:to-amber-950/30

                border-b
                border-[#E5DDD3]
                dark:border-[#352B24]

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
                    bg-[#B24C2B]
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
                      font-bold
                      text-[#2D2A26]
                      dark:text-[#FAF6F2]
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
                      text-[#73675B]
                      dark:text-[#A89C90]
                      truncate
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
                          ? `
                              bg-amber-100
                              dark:bg-amber-900/40
                              text-amber-800
                              dark:text-amber-200
                              border-amber-300
                              dark:border-amber-700
                            `
                          : `
                              bg-gray-100
                              dark:bg-gray-800
                              text-gray-400
                              border-gray-200
                              dark:border-gray-700
                            `
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
                        bg-white
                        dark:bg-[#2A2320]
                        border
                        border-[#B24C2B]/30
                        hover:border-[#B24C2B]
                        text-[#B24C2B]
                        dark:text-[#FF855D]
                        hover:bg-[#B24C2B]
                        hover:text-white
                        text-[9px]
                        font-bold
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
                      bg-[#B24C2B]
                      hover:bg-[#963E21]
                      disabled:opacity-50
                      text-white
                      rounded-lg
                      text-[9px]
                      font-bold
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

            {/* =================================================
                FILTERS
            ================================================= */}

            <div
              className="
                px-3
                py-2

                bg-white
                dark:bg-[#1E1917]

                border-b
                border-[#E5DDD3]
                dark:border-[#352B24]

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
                    px-2.5
                    sm:px-3
                    py-1.5
                    rounded-lg
                    text-[10px]
                    font-bold
                    transition-all
                    cursor-pointer

                    ${filter === 'all'
                      ? 'bg-[#B24C2B] text-white'
                      : `
                          text-[#73675B]
                          dark:text-[#A89C90]
                          hover:bg-[#F3EFE9]
                          dark:hover:bg-[#2A2420]
                        `
                    }
                  `}
                >
                  الكل ({notifications.length})
                </button>

                <button
                  type="button"
                  onClick={() => setFilter('unread')}
                  className={`
                    px-2.5
                    sm:px-3
                    py-1.5
                    rounded-lg
                    text-[10px]
                    font-bold
                    transition-all
                    cursor-pointer

                    ${filter === 'unread'
                      ? 'bg-[#B24C2B] text-white'
                      : `
                          text-[#73675B]
                          dark:text-[#A89C90]
                          hover:bg-[#F3EFE9]
                          dark:hover:bg-[#2A2420]
                        `
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
                        font-bold
                        text-[#B24C2B]
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
                      text-gray-400
                      hover:text-red-500
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

            {/* =================================================
                NOTIFICATIONS LIST
            ================================================= */}

            <div
              className="
                overflow-y-auto
                overscroll-contain
                divide-y
                divide-[#F3EFE9]
                dark:divide-[#2D2723]

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
                        p-3
                        sm:p-4

                        flex
                        items-start
                        gap-2.5
                        sm:gap-3

                        cursor-pointer

                        transition-colors

                        group

                        ${notification.read
                          ? `
                              bg-white
                              dark:bg-[#1E1917]
                              hover:bg-[#FAF7F2]
                              dark:hover:bg-[#26201B]
                            `
                          : `
                              bg-[#FFF8F3]
                              dark:bg-[#2D201A]
                              hover:bg-[#FDF2E9]
                              dark:hover:bg-[#38261E]
                            `
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
                            bg-[#B24C2B]
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
                          sm:rounded-2xl

                          bg-white
                          dark:bg-[#2A2320]

                          border
                          border-[#E5DDD3]
                          dark:border-[#352B24]

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
                              text-[11px]
                              sm:text-sm
                              font-bold
                              leading-5
                              truncate

                              ${notification.read
                                ? `
                                    text-[#2D2A26]
                                    dark:text-[#FAF6F2]
                                  `
                                : `
                                    text-[#B24C2B]
                                    dark:text-[#FF855D]
                                  `
                              }
                            `}
                          >
                            {notification.title}
                          </h4>

                          <span
                            className="
                              text-[9px]
                              sm:text-[10px]
                              text-[#8C7E72]
                              dark:text-[#73675B]

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
                            text-[10px]
                            sm:text-xs

                            text-[#5E5248]
                            dark:text-[#C5BCB3]

                            line-clamp-2

                            leading-relaxed
                          "
                        >
                          {notification.message}
                        </p>

                        {/* Actions */}

                        <div
                          className="
                            pt-1.5

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

                                text-[9px]
                                sm:text-[10px]

                                font-bold

                                text-[#B24C2B]
                                dark:text-[#FF855D]
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

                                  sm:opacity-0

                                  w-7
                                  h-7

                                  rounded-lg

                                  text-[#B24C2B]

                                  hover:bg-[#B24C2B]/10

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
                                opacity-0
                                group-hover:opacity-100

                                w-7
                                h-7

                                rounded-lg

                                text-gray-400

                                hover:text-red-500
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
                /* =================================================
                   EMPTY STATE
                ================================================= */

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

                      bg-[#FAF7F2]
                      dark:bg-[#26201B]

                      flex
                      items-center
                      justify-center

                      text-[#B24C2B]/40
                    "
                  >
                    <Bell className="w-7 h-7" />
                  </div>

                  <h4
                    className="
                      mt-4

                      text-sm

                      font-bold

                      text-[#2D2A26]
                      dark:text-[#FAF6F2]
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

                      text-[#73675B]
                      dark:text-[#A89C90]

                      max-w-[280px]

                      leading-relaxed
                    "
                  >
                    ستصلك هنا كافة التنبيهات الخاصة
                    بالطلبات والمنتجات والحساب أولاً بأول.
                  </p>
                </div>
              )}
            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div
              className="
                px-3
                py-2.5

                bg-[#FAF7F2]
                dark:bg-[#26201C]

                border-t
                border-[#E5DDD3]
                dark:border-[#352B24]

                text-center
              "
            >
              <span
                className="
                  text-[9px]
                  sm:text-[10px]

                  text-[#73675B]
                  dark:text-[#A89C90]

                  flex
                  items-center
                  justify-center
                  gap-1.5
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

                نظام إشعارات وه الفوري
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