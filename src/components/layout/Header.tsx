import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import type { ActivePage } from '../../types';
import { resolveNotificationNavigation } from '../../utils/notificationRouter';
import {
  Menu,
  X,
  Search,
  Sun,
  Moon,
  Heart,
  ShoppingBag,
  MessageCircle,
  UserCircle,
  ChevronDown,
  LogOut,
  Package,
  LayoutDashboard,
  Sparkles,
  Play,
  Store,
  ShieldCheck,
  ArrowLeft,
  Bell,
  Check,
  Flame,
  Film,
  AlertTriangle,
  Calendar,
  Landmark,
  Users,
  UtensilsCrossed,
  Compass,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/* =========================================================
   TYPES
   ========================================================= */

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time?: string;
  unread?: boolean;
};

export interface NotificationCenterProps {
  isDark: boolean;
  mainText: string;
  secondaryText: string;
  borderColor: string;
  hoverBg: string;
}

export interface HeaderProps {
  className?: string;
}

/* =========================================================
   NOTIFICATION CENTER
   ========================================================= */

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isDark,
  mainText,
  secondaryText,
  borderColor,
  hoverBg,
}) => {
  const [open, setOpen] = useState(false);
  const {
    currentUser,
    currentRole,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActivePage,
    navigateToOrder,
    navigateToProduct,
    navigateToSeller,
    setIsAuthModalOpen,
    setAuthModalTab,
  } = useApp();

  const isGuest =
    currentRole === 'guest' ||
    !currentUser?.id ||
    currentUser.id === 'guest' ||
    currentUser.id === 'guest-visitor';
  const displayCount = isGuest ? 0 : unreadNotificationsCount;
  const userNotifications = isGuest ? [] : notifications;

  const formatRelativeTime = (isoString?: string): string => {
    if (!isoString) return 'دلوقتي';
    try {
      const diff = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'دلوقتي';
      if (mins < 60) return `من ${mins} دقيقة`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `من ${hours} ساعة`;
      const days = Math.floor(hours / 24);
      if (days === 1) return 'إمبارح';
      return `من ${days} أيام`;
    } catch {
      return 'من مدة';
    }
  };

  const handleNotificationClick = (item: any) => {
    if (!item) return;
    markNotificationAsRead(item.id);
    setOpen(false);
    resolveNotificationNavigation(item, currentRole, {
      setActivePage,
      navigateToOrder,
      navigateToProduct,
      navigateToSeller,
    });
  };

  return (
    <div className="relative shrink-0">
      <button
        id="header-notifications-btn"
        type="button"
        aria-label="الإشعارات"
        onClick={() => {
          if (isGuest) {
            setAuthModalTab('login');
            setIsAuthModalOpen(true);
            return;
          }
          setOpen((prev) => !prev);
        }}
        className="relative flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 sm:h-10 sm:w-10 lg:h-11 lg:w-11 cursor-pointer"
        style={{
          backgroundColor: open ? '#9a6a35' : hoverBg,
          color: open ? '#fff' : mainText,
        }}
      >
        <Bell size={18} />
        {displayCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold"
            style={{
              backgroundColor: '#9a6a35',
              color: '#fff',
            }}
          >
            {displayCount > 99 ? '99+' : displayCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[490] bg-black/25 backdrop-blur-[2px] sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              id="notifications-dropdown-menu"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 top-[calc(100%+8px)] z-[500] w-[320px] sm:w-[380px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[1.75rem] border shadow-2xl backdrop-blur-3xl"
              style={{
                backgroundColor: isDark
                  ? 'rgba(21, 21, 19, 0.98)'
                  : 'rgba(255, 255, 255, 0.98)',
                borderColor,
                color: mainText,
              }}
            >
              <div
                className="flex items-center justify-between border-b px-4 py-3 sm:px-5 sm:py-3.5"
                style={{ borderColor }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">الإشعارات</span>
                  {displayCount > 0 && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ backgroundColor: '#9a6a35' }}
                    >
                      {displayCount} جديد
                    </span>
                  )}
                </div>
                {displayCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllNotificationsAsRead()}
                    className="flex items-center gap-1 text-xs font-semibold cursor-pointer hover:underline"
                    style={{ color: '#9a6a35' }}
                  >
                    <Check size={13} />
                    <span>تحديد الكل كمقروء</span>
                  </button>
                )}
              </div>

              <div className="max-h-[380px] overflow-y-auto">
                {isGuest ? (
                  <div className="px-5 py-10 text-center">
                    <Bell size={28} className="mx-auto opacity-30" />
                    <p
                      className="mt-3 text-sm font-semibold"
                      style={{ color: mainText }}
                    >
                      سجل دخول عشان تشوف إشعاراتك
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="mt-3 rounded-full px-4 py-1.5 text-xs font-bold text-white bg-primary cursor-pointer hover:bg-primary-hover"
                    >
                      تسجيل الدخول
                    </button>
                  </div>
                ) : userNotifications.length > 0 ? (
                  userNotifications.map((notification) => {
                    const isUnread = !notification.read && !notification.isRead;
                    return (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className="flex w-full gap-3 border-b px-4 py-4 text-right transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                        style={{
                          borderColor,
                          backgroundColor: isUnread
                            ? isDark
                              ? 'rgba(154,106,53,0.12)'
                              : 'rgba(154,106,53,0.06)'
                            : 'transparent',
                        }}
                      >
                        <div
                          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: isDark
                              ? 'rgba(154,106,53,0.16)'
                              : 'rgba(154,106,53,0.10)',
                            color: '#9a6a35',
                          }}
                        >
                          <Bell size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold truncate">
                              {notification.title}
                            </p>
                            {isUnread && (
                              <span
                                className="mt-1 h-2 w-2 shrink-0 rounded-full"
                                style={{ backgroundColor: '#9a6a35' }}
                              />
                            )}
                          </div>
                          <p
                            className="mt-1 text-[11px] leading-5"
                            style={{ color: secondaryText }}
                          >
                            {notification.message}
                          </p>
                          <p
                            className="mt-1 text-[10px]"
                            style={{ color: secondaryText }}
                          >
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-5 py-10 text-center">
                    <Bell size={28} className="mx-auto opacity-30" />
                    <p
                      className="mt-3 text-sm font-semibold"
                      style={{ color: mainText }}
                    >
                      مفيش إشعارات
                    </p>
                    <p
                      className="mt-1 text-xs"
                      style={{ color: secondaryText }}
                    >
                      هتظهر هنا أي تحديثات جديدة لطلباتك وحسابك
                    </p>
                  </div>
                )}
              </div>

              <div
                className="border-t p-2 flex items-center gap-2"
                style={{ borderColor }}
              >
                <button
                  type="button"
                  id="header-view-all-notifications-btn"
                  onClick={() => {
                    setOpen(false);
                    setActivePage('notifications');
                  }}
                  className="flex-1 rounded-xl py-2 text-xs font-bold text-center transition-colors cursor-pointer bg-primary text-white hover:bg-[#744e26]"
                >
                  شوف كل الإشعارات
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 rounded-xl py-2 text-xs font-semibold cursor-pointer"
                  style={{
                    backgroundColor: hoverBg,
                    color: mainText,
                  }}
                >
                  قفل
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
/* =========================================================
   WAH PORTALS PREVIEW INFO (FOR HOVER CARDS)
   ========================================================= */
export interface PortalPreviewItem {
  title: string;
  desc: string;
  image: string;
  badge: string;
}

const WAH_PORTALS_PREVIEW: Record<string, PortalPreviewItem> = {
  map: {
    title: 'خريطة الصعيد التفاعلية',
    desc: 'اكتشف محافظات وقرى الصعيد وتراث كل بلد على ضفاف النيل.',
    image:
      'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790207/d13c685b-4403-4983-96fe-49f3b7a925c3.png',
    badge: 'الخريطة الحية',
  },
  places: {
    title: 'آثار ومعالم الصعيد',
    desc: 'معابد الكرنك ودندرة وإدفو، قصور المنيا وبيوت غرب سهيل النوبية.',
    image:
      'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788715371/WAH/heritage-places/karnak-temples/img_2332_1788715371753_8g8m.jpg',
    badge: 'معالم متوثقة',
  },
  people: {
    title: 'أعلام ورموز الصعيد',
    desc: 'شيوخ الصنعة ورواة السير والأدباء والشعراء الكبار.',
    image:
      'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790532/8460cc50-45f5-4452-8f78-993668390750.png',
    badge: 'حُرّاس الأصل',
  },
  food: {
    title: 'طعم الصعيد البلدي',
    desc: 'طبيخ الطواجن، عيش شمسي سخن، وفايش بلبن الحمص.',
    image:
      'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790638/05ef9181-0c18-4290-8a57-b2d054054e7f.png',
    badge: 'أكل بيوت',
  },
  events: {
    title: 'مواسم وليالي الصعيد',
    desc: 'حلقات التحطيب، ليالي الموالد، وزغاريد الأفراح والمواسم.',
    image:
      'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790617/145b481b-d989-4d5b-82cf-26bbb0b5d6eb.png',
    badge: 'ليالي الجنوب',
  },
  reels: {
    title: 'ريلز وحكاوي وه',
    desc: 'فيديوهات قصيرة تاخدك جوة حيطان الورش وأزقة الأسواق.',
    image:
      'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788789051/%D9%81%D8%AE%D8%A7%D8%B1%D8%B1%D8%B1%D8%B1.jpg',
    badge: 'فيديوهات حية',
  },
  sellers: {
    title: 'شيوخ الصنعة والورش',
    desc: 'دكاكين وورش الحرفيين الأصليين في الفخار والخزف والنسيج.',
    image:
      'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790754/6d17f117-649a-4a79-b565-3f3eef139000.png',
    badge: 'ورش الصعايدة',
  },
  categories: {
    title: 'التصنيفات التراثية',
    desc: 'تصفح كل منتجات وحرف الصعيد مقسمة حسب الصناعة والخامات.',
    image:
      'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788789051/%D9%81%D8%AE%D8%A7%D8%B1%D8%B1%D8%B1%D8%B1.jpg',
    badge: 'حرف أصيلة',
  },
  quize: {
    title: 'انت صعيدي؟ (لعبة اللهجة)',
    desc: 'تحدي تفاعلي سريع يختبر معرفتك بأصالة الكلمات والمصطلحات الصعيدية.',
    image:
      'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790532/8460cc50-45f5-4452-8f78-993668390750.png',
    badge: 'تحدي ولعبة',
  },
  quiz: {
    title: 'انت صعيدي؟ (لعبة اللهجة)',
    desc: 'تحدي تفاعلي سريع يختبر معرفتك بأصالة الكلمات والمصطلحات الصعيدية.',
    image:
      'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790532/8460cc50-45f5-4452-8f78-993668390750.png',
    badge: 'تحدي ولعبة',
  },
  about: {
    title: 'عن منصة وه',
    desc: 'قصة ورسالة إحياء الحرف التراثية وتوثيق كل شبر في الصعيد.',
    image:
      'https://res.cloudinary.com/kuana1nl/image/upload/v1790463189/logo.png',
    badge: 'حكاية وه',
  },
};

/* =========================================================
   HEADER
   ========================================================= */

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const {
    activePage,
    setActivePage,
    cartCount,
    setIsCartDrawerOpen,
    favorites,
    searchQuery,
    setSearchQuery,
    isAuthenticated,
    currentRole,
    currentUser,
    logout,
    setIsAuthModalOpen,
    setAuthModalTab,
    setShowIntroVideo,
    theme,
    toggleTheme,
    chatUnreadCount,
    openReportModal,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [hoveredPortalId, setHoveredPortalId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isSeller = currentRole === 'seller' || currentUser?.role === 'seller';
  const isAdmin = currentRole === 'admin' || currentUser?.role === 'admin';
  const isStaff = isSeller || isAdmin;

  /* =========================================================
     CLOSE ACCOUNT DROPDOWN (CLICK OUTSIDE)
     ========================================================= */
  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  /* =========================================================
     SEARCH OVERLAY FOCUS
     ========================================================= */
  useEffect(() => {
    if (!searchOverlayOpen) return;
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [searchOverlayOpen]);

  /* =========================================================
     BODY LOCK
     ========================================================= */
  useEffect(() => {
    if (mobileMenuOpen || searchOverlayOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, searchOverlayOpen]);

  /* =========================================================
     ESC KEY
     ========================================================= */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMobileMenuOpen(false);
      setSearchOverlayOpen(false);
      setUserDropdownOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  /* =========================================================
     SEARCH
     ========================================================= */
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    setActivePage('products');
    setSearchOverlayOpen(false);
  };

  /* =========================================================
     ROLE NAVIGATION LINKS
     ========================================================= */
  const roleNavLinks = useMemo(() => {
    if (currentRole === 'seller') {
      return [
        {
          id: 'seller-dashboard',
          label: 'لوحة التحكم',
          icon: LayoutDashboard,
        },
        {
          id: 'seller-products',
          label: 'منتجاتي',
          icon: Package,
        },
        {
          id: 'seller-inventory',
          label: 'المخزون',
          icon: Store,
        },
        {
          id: 'seller-orders',
          label: 'الطلبات',
          icon: ShoppingBag,
        },
        {
          id: 'seller-analytics',
          label: 'الإحصائيات',
          icon: Sparkles,
        },
        {
          id: 'seller-account',
          label: 'حسابي',
          icon: UserCircle,
        },
      ];
    }

    if (currentRole === 'admin') {
      return [
        {
          id: 'admin-dashboard',
          label: 'لوحة التحكم',
          icon: LayoutDashboard,
        },
        {
          id: 'admin-buyers',
          label: 'المشترين',
          icon: UserCircle,
        },
        {
          id: 'admin-products',
          label: 'المنتجات',
          icon: Package,
        },
        {
          id: 'admin-sellers',
          label: 'البائعين',
          icon: Store,
        },
        {
          id: 'admin-orders',
          label: 'الطلبات',
          icon: ShoppingBag,
        },
        {
          id: 'admin-reports',
          label: 'البلاغات والشكاوى',
          icon: AlertTriangle,
        },
        {
          id: 'admin-audit-logs',
          label: 'سجل النشاط',
          icon: ShieldCheck,
        },
      ];
    }

    const links: any[] = [
      {
        id: 'home',
        label: 'الرئيسية',
        shortLabel: 'الرئيسية',
      },
      {
        id: 'products',
        label: 'المنتجات',
        shortLabel: 'المنتجات',
      },
      {
        id: 'map',
        label: 'محافظات الصعيد',
        shortLabel: 'خريطة الصعيد',
        icon: Compass,
        isNew: true,
      },
      {
        id: 'places',
        label: 'المعالم والآثار',
        shortLabel: 'المعالم والآثار',
        icon: Landmark,
      },
      {
        id: 'people',
        label: 'أعلام ورموز الصعيد',
        shortLabel: 'أعلام الصعيد',
        icon: Users,
      },
      {
        id: 'food',
        label: 'طعم الصعيد (المطبخ الأصيل)',
        shortLabel: 'طعم الصعيد',
        icon: UtensilsCrossed,
      },
      {
        id: 'events',
        label: 'مواسم وليالي الصعيد',
        shortLabel: 'ليالي ومواسم',
        icon: Calendar,
      },
      {
        id: 'reels',
        label: 'ريلز وه',
        shortLabel: 'ريلز وه',
        isNew: true,
        icon: Film,
      },
      {
        id: 'sellers',
        label: 'شيوخ الصنعة والورش',
        shortLabel: 'ورش الصنعة',
        icon: Store,
      },
      {
        id: 'categories',
        label: 'التصنيفات التراثية',
        shortLabel: 'التصنيفات',
        icon: Layers,
      },
      {
        id: 'quize',
        label: 'انت صعيدى ؟ (لعبة اللهجة)',
        shortLabel: 'انت صعيدى؟',
        isNew: true,
        icon: Flame,
      },
      {
        id: 'about',
        label: 'عن وه',
        shortLabel: 'عن وه',
        icon: Sparkles,
      },
    ];

    if (isAuthenticated && currentRole === 'buyer') {
      links.push({
        id: 'cart',
        label: 'السلة',
      });
      links.push({
        id: 'orders',
        label: 'طلباتي',
      });
    }

    return links;
  }, [currentRole, isAuthenticated]);

  /* =========================================================
     NAVIGATE
     ========================================================= */
  const navigate = useCallback(
    (page: string) => {
      setActivePage(page as ActivePage);
      setMobileMenuOpen(false);
      setUserDropdownOpen(false);
    },
    [setActivePage]
  );

  const getAccountPage = useCallback((): ActivePage => {
    if (isSeller) {
      return 'seller-account';
    }
    if (isAdmin) {
      return 'admin-dashboard';
    }
    return 'buyer-account';
  }, [isSeller, isAdmin]);

  /* =========================================================
     USER
     ========================================================= */
  const displayName = currentUser?.name || currentUser?.username || 'حسابي';
  const profileImage =
    currentUser?.profileImage?.secureUrl ||
    (currentUser as any)?.avatar ||
    'https://res.cloudinary.com/kuana1nl/image/upload/v1790463189/logo.png';

  /* =========================================================
     COLORS
     ========================================================= */
  const isDark = theme === 'dark';
  const mainText = isDark ? '#f5f0e7' : '#211d18';
  const secondaryText = isDark ? '#b3a59a' : '#76675b';
  const borderColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const hoverBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';

  return (
    <>
      <header
        dir="rtl"
        className={`sticky top-0 z-[100] w-full overflow-visible backdrop-blur-2xl transition-colors duration-500 shadow-sm ${className}`}
        style={{
          backgroundColor: isDark
            ? 'rgba(11, 11, 10, 0.9)'
            : 'rgba(238, 232, 220, 0.9)',
          color: mainText,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        {/* TOP BAR */}
        <div
          className="hidden border-b lg:block"
          style={{
            borderColor,
          }}
        >
          <div className="mx-auto flex h-9 max-w-[1600px] items-center justify-between px-6 lg:px-12">
            <div
              className="flex items-center gap-2 text-xs font-bold"
              style={{
                color: secondaryText,
              }}
            >
              <Sparkles size={13} className="text-primary" />
              <span>من قلب الصعيد... حكاية بتبدأ</span>
            </div>

            <div
              className="flex items-center gap-5 text-xs font-bold"
              style={{
                color: secondaryText,
              }}
            >
              <span>أصالة</span>
              <span>•</span>
              <span>حرفة</span>
              <span>•</span>
              <span>حكاية</span>
            </div>
          </div>
        </div>

        {/* MAIN ROW */}
        <div className="relative mx-auto max-w-[1600px] px-2 sm:px-6 lg:px-12">
          <div className="relative flex h-16 items-center justify-between sm:h-[78px] lg:h-[94px]">
            {/* START ACTIONS */}
            <div
              id="header-start-actions"
              className="
                absolute start-0 top-0 z-10
                flex h-full items-center
                px-1.5
                sm:px-2
                lg:static lg:h-auto lg:max-w-none lg:px-0 lg:z-auto
              "
            >
              {/* MOBILE MENU TOGGLE */}
              <button
                id="mobile-menu-toggle"
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="فتح القائمة"
                title="فتح القائمة"
                className="
                  flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-full
                  transition-all
                  active:scale-95
                  lg:hidden
                  cursor-pointer
                "
                style={{
                  backgroundColor: hoverBg,
                  color: mainText,
                }}
              >
                <Menu size={20} />
              </button>

              {/* MOBILE THEME TOGGLE */}
              <button
                id="mobile-header-theme-toggle-btn"
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
                title={isDark ? 'تفعيل الوضع الفاتح' : 'الوضع الداكن'}
                className="
                  flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-full
                  transition-all
                  hover:scale-105
                  active:scale-95
                  ms-1
                  sm:ms-2
                  lg:hidden
                  cursor-pointer
                "
                style={{
                  backgroundColor: hoverBg,
                  color: mainText,
                }}
              >
                {isDark ? (
                  <Sun size={18} className="text-primary-hover" />
                ) : (
                  <Moon size={18} />
                )}
              </button>

              {/* MOBILE QUIZ */}
              <button
                id="mobile-header-quiz-btn"
                type="button"
                onClick={() => navigate('quize')}
                aria-label="اختبار اللهجة الصعيدية"
                title="اختبار اللهجة الصعيدية"
                className="
                  flex h-9 w-9 shrink-0
                  items-center
                  justify-center
                  rounded-full
                  transition-all
                  hover:scale-105
                  active:scale-95
                  ms-1
                  lg:hidden
                  cursor-pointer
                "
                style={{
                  backgroundColor: hoverBg,
                  color: mainText,
                }}
              >
                <Flame size={18} />
              </button>

              {/* DESKTOP NAV */}
              <div className="hidden items-center gap-6 lg:flex">
                <button
                  type="button"
                  onClick={() => navigate('home')}
                  className="
                    whitespace-nowrap
                    text-sm
                    font-black
                    transition-colors
                    cursor-pointer
                  "
                  style={{
                    color: activePage === 'home' ? '#9a6a35' : mainText,
                  }}
                >
                  الرئيسية
                </button>

                <button
                  type="button"
                  onClick={() => navigate('products')}
                  className="
                    whitespace-nowrap
                    text-sm
                    font-black
                    transition-colors
                    cursor-pointer
                  "
                  style={{
                    color: activePage === 'products' ? '#9a6a35' : mainText,
                  }}
                >
                  المنتجات
                </button>

                <button
                  type="button"
                  onClick={() => navigate('map')}
                  className="
                    flex items-center gap-1.5
                    whitespace-nowrap
                    text-sm
                    font-black
                    transition-colors
                    cursor-pointer
                  "
                  style={{
                    color: activePage === 'map' ? '#9a6a35' : mainText,
                  }}
                >
                  محافظات الصعيد
                  <span
                    className="
                      rounded-full
                      px-2
                      py-0.5
                      text-[9px]
                      font-black
                    "
                    style={{
                      backgroundColor: '#9a6a35',
                      color: '#fff',
                    }}
                  >
                    جديد
                  </span>
                </button>
              </div>
            </div>

            {/* =====================================================
                CENTER LOGO (MOBILE & TABLET ONLY)
                على الديسكتوب يمتد للـ Sub-bar في الأسفل
            ===================================================== */}
            <div
              id="header-center-logo"
              className="
                pointer-events-auto
                absolute
                left-1/2
                top-1/2
                z-20
                flex
                -translate-x-1/2
                -translate-y-1/2
                items-center
                justify-center
                select-none
                lg:hidden
              "
            >
              <button
                id="brand-logo-mobile"
                type="button"
                onClick={() => navigate('home')}
                aria-label="وه - الرئيسية"
                className="
                  flex
                  items-center
                  justify-center
                  rounded-2xl
                  transition-transform
                  hover:scale-[1.02]
                  active:scale-95
                  cursor-pointer
                  focus:outline-none
                "
              >
                <img
                  src="https://res.cloudinary.com/kuana1nl/image/upload/v1790463189/logo.png"
                  alt="وه"
                  draggable={false}
                  className="
                    block
                    h-[34px]
                    w-auto
                    max-w-[68px]
                    object-contain
                    sm:h-[50px]
                    sm:max-w-[100px]
                  "
                />
              </button>
            </div>

            {/* END ACTIONS */}
            <div
              id="header-end-actions"
              className="
                absolute
                end-0
                top-0
                z-10
                flex
                h-full
                items-center
                justify-end
                px-1.5
                sm:px-2
                lg:static
                lg:h-auto
                lg:max-w-none
                lg:px-0
                lg:z-auto
              "
            >
              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-0.5
                  sm:gap-1.5
                  lg:gap-2
                "
              >
                {/* SEARCH */}
                <button
                  id="search-trigger-btn"
                  type="button"
                  onClick={() => setSearchOverlayOpen(true)}
                  aria-label="بحث"
                  title="بحث"
                  className="
                    flex
                    h-8.5
                    w-8.5
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    transition-all
                    hover:scale-105
                    active:scale-95
                    sm:h-10
                    sm:w-10
                    lg:h-11
                    lg:w-11
                    cursor-pointer
                  "
                  style={{
                    backgroundColor: hoverBg,
                    color: mainText,
                  }}
                >
                  <Search
                    size={17}
                    className="sm:h-[18px] sm:w-[18px]"
                  />
                </button>

                {/* THEME - DESKTOP */}
                <button
                  id="header-theme-toggle-btn"
                  type="button"
                  onClick={toggleTheme}
                  aria-label={
                    isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'
                  }
                  className="
                    hidden
                    lg:flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    transition-all
                    hover:scale-105
                    active:scale-95
                    cursor-pointer
                  "
                  style={{
                    backgroundColor: hoverBg,
                    color: mainText,
                  }}
                >
                  {isDark ? (
                    <Sun
                      size={18}
                      className="text-primary-hover"
                    />
                  ) : (
                    <Moon size={18} />
                  )}
                </button>

                {/* FAVORITES */}
                {!isStaff && (
                  <button
                    id="nav-favorites-btn"
                    type="button"
                    onClick={() => navigate('favorites')}
                    aria-label="المفضلة"
                    title="المفضلة"
                    className="
                      relative
                      flex
                      h-8.5
                      w-8.5
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      transition-all
                      hover:scale-105
                      active:scale-95
                      sm:h-10
                      sm:w-10
                      lg:h-11
                      lg:w-11
                      cursor-pointer
                    "
                    style={{
                      backgroundColor: hoverBg,
                      color: mainText,
                    }}
                  >
                    <Heart
                      size={17}
                      className="sm:h-[18px] sm:w-[18px]"
                    />
                    {favorites.length > 0 && (
                      <span
                        className="
                          absolute
                          -right-0.5
                          -top-0.5
                          flex
                          h-4
                          min-w-4
                          items-center
                          justify-center
                          rounded-full
                          px-1
                          text-[9px]
                          font-bold
                        "
                        style={{
                          backgroundColor: '#9a6a35',
                          color: '#fff',
                        }}
                      >
                        {favorites.length > 99 ? '99+' : favorites.length}
                      </span>
                    )}
                  </button>
                )}

                {/* CHAT - DESKTOP */}
                {isAuthenticated && (
                  <button
                    id="nav-chat-btn"
                    type="button"
                    onClick={() => navigate('messages')}
                    aria-label="الرسائل"
                    title="الرسائل"
                    className="
                      relative
                      hidden
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      transition-all
                      hover:scale-105
                      active:scale-95
                      lg:flex
                      cursor-pointer
                    "
                    style={{
                      backgroundColor: hoverBg,
                      color: mainText,
                    }}
                  >
                    <MessageCircle size={18} />
                    {chatUnreadCount > 0 && (
                      <span
                        className="
                          absolute
                          -right-0.5
                          -top-0.5
                          flex
                          h-4
                          min-w-4
                          items-center
                          justify-center
                          rounded-full
                          px-1
                          text-[9px]
                          font-bold
                        "
                        style={{
                          backgroundColor: '#9a6a35',
                          color: '#fff',
                        }}
                      >
                        {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                      </span>
                    )}
                  </button>
                )}

                {/* NOTIFICATIONS - DESKTOP */}
                {isAuthenticated && (
                  <div className="hidden lg:block">
                    <NotificationCenter
                      isDark={isDark}
                      mainText={mainText}
                      secondaryText={secondaryText}
                      borderColor={borderColor}
                      hoverBg={hoverBg}
                    />
                  </div>
                )}

                {/* CART */}
                {!isStaff && (
                  <button
                    id="nav-cart-btn"
                    type="button"
                    onClick={() => setIsCartDrawerOpen(true)}
                    aria-label="السلة"
                    title="السلة"
                    className="
                      relative
                      flex
                      h-8.5
                      w-8.5
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      transition-all
                      hover:scale-105
                      active:scale-95
                      sm:h-10
                      sm:w-10
                      lg:h-11
                      lg:w-11
                      cursor-pointer
                    "
                    style={{
                      backgroundColor: hoverBg,
                      color: mainText,
                    }}
                  >
                    <ShoppingBag
                      size={17}
                      className="sm:h-[18px] sm:w-[18px]"
                    />
                    {cartCount > 0 && (
                      <span
                        className="
                          absolute
                          -right-0.5
                          -top-0.5
                          flex
                          h-4
                          min-w-4
                          items-center
                          justify-center
                          rounded-full
                          px-1
                          text-[9px]
                          font-bold
                        "
                        style={{
                          backgroundColor: '#9a6a35',
                          color: '#fff',
                        }}
                      >
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </button>
                )}

                {/* USER */}
                {isAuthenticated ? (
                  <div
                    ref={dropdownRef}
                    className="
                      relative
                      flex
                      shrink-0
                      items-center
                    "
                  >
                    <button
                      id="user-menu-btn"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setUserDropdownOpen((prev) => !prev);
                      }}
                      aria-expanded={userDropdownOpen}
                      aria-haspopup="menu"
                      aria-label="قائمة الحساب"
                      className="
                        group
                        flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        p-1
                        sm:gap-2.5
                        sm:pe-3.5
                        sm:ps-1
                        transition-all
                        duration-300
                        cursor-pointer
                        select-none
                        hover:shadow-md
                        hover:scale-[1.02]
                        active:scale-95
                      "
                      style={{
                        backgroundColor: userDropdownOpen
                          ? isDark
                            ? 'rgba(154, 106, 53, 0.18)'
                            : 'rgba(154, 106, 53, 0.12)'
                          : hoverBg,
                        borderColor: userDropdownOpen
                          ? '#9a6a35'
                          : borderColor,
                        color: mainText,
                      }}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={profileImage}
                          alt={displayName}
                          className="
                            h-8.5
                            w-8.5
                            rounded-full
                            object-cover
                            ring-2
                            ring-primary/40
                            transition-transform
                            duration-300
                            group-hover:scale-105
                            sm:h-9
                            sm:w-9
                            lg:h-9.5
                            lg:w-9.5
                          "
                        />
                        <span
                          className="
                            absolute
                            bottom-0
                            right-0
                            h-2.5
                            w-2.5
                            rounded-full
                            bg-emerald-500
                            ring-2
                            ring-white
                            dark:ring-[#121210]
                          "
                        />
                      </div>

                      <div
                        className="
                          hidden
                          sm:flex
                          flex-col
                          text-right
                          leading-tight
                        "
                      >
                        <span
                          className="
                            max-w-[110px]
                            truncate
                            text-xs
                            font-black
                            transition-colors
                            group-hover:text-primary
                            lg:text-sm
                          "
                        >
                          {displayName}
                        </span>
                        <span
                          className="
                            text-[10px]
                            font-semibold
                            opacity-70
                          "
                          style={{
                            color: secondaryText,
                          }}
                        >
                          {currentRole === 'admin'
                            ? 'الإدارة'
                            : isSeller
                              ? 'صاحب ورشة'
                              : 'حسابي'}
                        </span>
                      </div>

                      <ChevronDown
                        size={15}
                        className={`
                          hidden
                          sm:block
                          text-primary
                          transition-transform
                          duration-300
                          ease-out
                          ${userDropdownOpen ? 'rotate-180' : ''}
                        `}
                      />
                    </button>

                    {/* USER DROPDOWN */}
                    <AnimatePresence>
                      {userDropdownOpen && (
                        <>
                          <motion.div
                            className="
                              fixed
                              inset-0
                              z-[490]
                              bg-black/25
                              backdrop-blur-[2px]
                              sm:hidden
                            "
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setUserDropdownOpen(false)}
                          />

                          <motion.div
                            id="user-dropdown-menu"
                            role="menu"
                            initial={{
                              opacity: 0,
                              y: -10,
                              scale: 0.96,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              scale: 1,
                            }}
                            exit={{
                              opacity: 0,
                              y: -10,
                              scale: 0.96,
                            }}
                            transition={{
                              duration: 0.18,
                              ease: 'easeOut',
                            }}
                            style={{
                              transformOrigin: 'top left',
                              backgroundColor: isDark
                                ? 'rgba(21, 21, 19, 0.97)'
                                : 'rgba(255, 255, 255, 0.98)',
                              borderColor,
                            }}
                            className="
                              absolute
                              left-0
                              top-[calc(100%+10px)]
                              z-[500]
                              w-[280px]
                              max-w-[calc(100vw-24px)]
                              overflow-hidden
                              rounded-[1.75rem]
                              border
                              shadow-2xl
                              backdrop-blur-3xl
                            "
                          >
                            <div
                              onClick={() => {
                                setUserDropdownOpen(false);
                                navigate(getAccountPage());
                              }}
                              className="
                                group
                                border-b
                                p-4
                                cursor-pointer
                                transition-colors
                                hover:bg-primary/5
                              "
                              style={{
                                borderColor,
                              }}
                            >
                              <div className="flex items-center gap-3.5">
                                <div className="relative">
                                  <img
                                    src={profileImage}
                                    alt={displayName}
                                    className="
                                      h-11
                                      w-11
                                      rounded-full
                                      object-cover
                                      ring-2
                                      ring-primary/30
                                      shadow-sm
                                    "
                                  />
                                  <span
                                    className="
                                      absolute
                                      bottom-0
                                      right-0
                                      h-3
                                      w-3
                                      rounded-full
                                      bg-emerald-500
                                      ring-2
                                      ring-white
                                      dark:ring-[#151513]
                                    "
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="truncate text-sm font-black">
                                      {displayName}
                                    </p>
                                    <ArrowLeft
                                      size={13}
                                      className="
                                        text-primary
                                        opacity-0
                                        transition-opacity
                                        group-hover:opacity-100
                                      "
                                    />
                                  </div>
                                  <p
                                    className="
                                      mt-0.5
                                      text-xs
                                      font-semibold
                                    "
                                    style={{
                                      color: secondaryText,
                                    }}
                                  >
                                    {currentRole === 'admin'
                                      ? 'إدارة وه'
                                      : isSeller
                                        ? 'شيخ صنعة / بائع'
                                        : 'ابن البلد / زبون'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-0.5 p-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setUserDropdownOpen(false);
                                  navigate(getAccountPage());
                                }}
                                className="
                                  flex
                                  w-full
                                  items-center
                                  gap-3
                                  rounded-xl
                                  px-3.5
                                  py-2.5
                                  text-sm
                                  font-bold
                                  cursor-pointer
                                  transition-colors
                                  hover:bg-primary/10
                                  hover:text-primary
                                "
                                style={{
                                  color: mainText,
                                }}
                              >
                                <UserCircle
                                  size={18}
                                  className="text-primary"
                                />
                                <span>حسابي</span>
                              </button>

                              {isSeller && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUserDropdownOpen(false);
                                    navigate('seller-dashboard');
                                  }}
                                  className="
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    rounded-xl
                                    px-3.5
                                    py-2.5
                                    text-sm
                                    font-bold
                                    cursor-pointer
                                    transition-colors
                                    hover:bg-primary/10
                                    hover:text-primary
                                  "
                                  style={{
                                    color: mainText,
                                  }}
                                >
                                  <Store
                                    size={18}
                                    className="text-primary"
                                  />
                                  <span>لوحة الورشة</span>
                                </button>
                              )}

                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUserDropdownOpen(false);
                                    navigate('admin-dashboard');
                                  }}
                                  className="
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    rounded-xl
                                    px-3.5
                                    py-2.5
                                    text-sm
                                    font-bold
                                    cursor-pointer
                                    transition-colors
                                    hover:bg-primary/10
                                    hover:text-primary
                                  "
                                  style={{
                                    color: mainText,
                                  }}
                                >
                                  <ShieldCheck
                                    size={18}
                                    className="text-primary"
                                  />
                                  <span>لوحة الإدارة</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setUserDropdownOpen(false);
                                  navigate('messages');
                                }}
                                className="
                                  flex
                                  w-full
                                  items-center
                                  justify-between
                                  rounded-xl
                                  px-3.5
                                  py-2.5
                                  text-sm
                                  font-bold
                                  cursor-pointer
                                  transition-colors
                                  hover:bg-primary/10
                                  hover:text-primary
                                "
                                style={{
                                  color: mainText,
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <MessageCircle
                                    size={18}
                                    className="text-primary"
                                  />
                                  <span>الرسائل</span>
                                </div>
                                {chatUnreadCount > 0 && (
                                  <span
                                    className="
                                      rounded-full
                                      bg-primary
                                      px-2
                                      py-0.5
                                      text-[10px]
                                      font-bold
                                      text-white
                                    "
                                  >
                                    {chatUnreadCount}
                                  </span>
                                )}
                              </button>

                              {!isStaff && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUserDropdownOpen(false);
                                    navigate('orders');
                                  }}
                                  className="
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    rounded-xl
                                    px-3.5
                                    py-2.5
                                    text-sm
                                    font-bold
                                    cursor-pointer
                                    transition-colors
                                    hover:bg-primary/10
                                    hover:text-primary
                                  "
                                  style={{
                                    color: mainText,
                                  }}
                                >
                                  <Package
                                    size={18}
                                    className="text-primary"
                                  />
                                  <span>طلباتي ومشترياتي</span>
                                </button>
                              )}

                              {!isStaff && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUserDropdownOpen(false);
                                    navigate('favorites');
                                  }}
                                  className="
                                    flex
                                    w-full
                                    items-center
                                    justify-between
                                    rounded-xl
                                    px-3.5
                                    py-2.5
                                    text-sm
                                    font-bold
                                    cursor-pointer
                                    transition-colors
                                    hover:bg-primary/10
                                    hover:text-primary
                                  "
                                  style={{
                                    color: mainText,
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <Heart
                                      size={18}
                                      className="text-primary"
                                    />
                                    <span>المفضلة</span>
                                  </div>
                                  {favorites.length > 0 && (
                                    <span
                                      className="
                                        rounded-full
                                        bg-primary
                                        px-2
                                        py-0.5
                                        text-[10px]
                                        font-bold
                                        text-white
                                      "
                                    >
                                      {favorites.length}
                                    </span>
                                  )}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setUserDropdownOpen(false);
                                  navigate('quize');
                                }}
                                className="
                                  flex
                                  w-full
                                  items-center
                                  gap-3
                                  rounded-xl
                                  px-3.5
                                  py-2.5
                                  text-sm
                                  font-bold
                                  cursor-pointer
                                  transition-colors
                                  hover:bg-[#b45f42]/10
                                  hover:text-[#b45f42]
                                "
                                style={{
                                  color: mainText,
                                }}
                              >
                                <Flame
                                  size={18}
                                  className="text-[#b45f42]"
                                />
                                <span>تحدي اللهجة الصعيدية</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setUserDropdownOpen(false);
                                  openReportModal();
                                }}
                                className="
                                  flex
                                  w-full
                                  items-center
                                  gap-3
                                  rounded-xl
                                  px-3.5
                                  py-2.5
                                  text-sm
                                  font-bold
                                  cursor-pointer
                                  transition-colors
                                  hover:bg-amber-500/10
                                  dark:hover:text-amber-400
                                "
                                style={{
                                  color: mainText,
                                }}
                              >
                                <AlertTriangle
                                  size={18}
                                  className="text-amber-600"
                                />
                                <span>تقديم بلاغ أو شكوى</span>
                              </button>

                              <div
                                className="my-1.5 border-t"
                                style={{
                                  borderColor,
                                }}
                              />

                              <button
                                type="button"
                                onClick={() => {
                                  setUserDropdownOpen(false);
                                  logout();
                                }}
                                className="
                                  flex
                                  w-full
                                  items-center
                                  gap-3
                                  rounded-xl
                                  px-3.5
                                  py-2.5
                                  text-sm
                                  font-bold
                                  text-rose-500
                                  transition-colors
                                  hover:bg-rose-500/10
                                  cursor-pointer
                                "
                              >
                                <LogOut size={18} />
                                <span>اخرج من الحساب</span>
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      title="تسجيل الدخول / إنشاء حساب"
                      aria-label="تسجيل الدخول / إنشاء حساب"
                      className="
                        flex
                        h-8
                        shrink-0
                        items-center
                        gap-1
                        rounded-full
                        px-2.5
                        text-[11px]
                        font-black
                        text-white
                        shadow-xs
                        transition-all
                        hover:scale-105
                        active:scale-95
                        cursor-pointer
                        whitespace-nowrap
                        sm:hidden
                      "
                      style={{
                        backgroundColor: '#9a6a35',
                      }}
                    >
                      <UserCircle size={15} />
                      <span>دخول</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="
                        hidden
                        sm:flex
                        h-9
                        lg:h-10
                        items-center
                        justify-center
                        rounded-full
                        px-3.5
                        sm:px-4
                        text-xs
                        sm:text-sm
                        font-bold
                        cursor-pointer
                        hover:opacity-80
                        transition-opacity
                        whitespace-nowrap
                        shrink-0
                      "
                      style={{
                        color: mainText,
                        border: `1px solid ${borderColor}`,
                      }}
                    >
                      ادخل لحسابك
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalTab('register');
                        setIsAuthModalOpen(true);
                      }}
                      className="
                        hidden
                        sm:flex
                        h-9
                        lg:h-10
                        items-center
                        justify-center
                        rounded-full
                        px-3.5
                        sm:px-5
                        text-xs
                        sm:text-sm
                        font-bold
                        cursor-pointer
                        hover:opacity-90
                        transition-opacity
                        whitespace-nowrap
                        shrink-0
                      "
                      style={{
                        backgroundColor: '#9a6a35',
                        color: '#fff',
                      }}
                    >
                      اعمل حساب جديد
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            وَه — SIGNATURE HEADER
            Minimal / Editorial / Heritage (Extended Logo Center)
        ========================================================= */}
        <div
          className="hidden lg:block relative z-[100] select-none"
          onMouseLeave={() => setHoveredPortalId(null)}
        >
          <div
            className="relative border-t border-b overflow-visible"
            style={{
              borderColor: isDark
                ? 'rgba(154,106,53,0.12)'
                : 'rgba(154,106,53,0.14)',
              backgroundColor: isDark ? '#12100e' : '#faf8f2',
            }}
          >
            {/* DECORATIVE TOP GLOW */}
            <div
              className="absolute left-1/2 top-0 h-px w-40 -translate-x-1/2"
              style={{
                background:
                  'linear-gradient(90deg, transparent, #9a6a35, transparent)',
              }}
            />

            <div className="mx-auto flex h-[68px] max-w-[1450px] items-center px-8 overflow-visible">

              {/* RIGHT NAVIGATION */}
              <div className="flex flex-1 items-center justify-end gap-1">
                {roleNavLinks
                  .filter(
                    (link: any) =>
                      link.id !== 'home' &&
                      link.id !== 'products' &&
                      link.id !== 'cart' &&
                      link.id !== 'orders' &&
                      link.id !== 'about'
                  )
                  .slice(
                    0,
                    Math.ceil(
                      roleNavLinks.filter(
                        (link: any) =>
                          link.id !== 'home' &&
                          link.id !== 'products' &&
                          link.id !== 'cart' &&
                          link.id !== 'orders' &&
                          link.id !== 'about'
                      ).length / 2
                    )
                  )
                  .map((link: any) => {
                    const Icon = link.icon;
                    const isActive = activePage === link.id;
                    const isHovered = hoveredPortalId === link.id;
                    const preview = WAH_PORTALS_PREVIEW[link.id];

                    return (
                      <div
                        key={link.id}
                        className="relative"
                        onMouseEnter={() => setHoveredPortalId(link.id)}
                      >
                        <motion.button
                          type="button"
                          onClick={() => {
                            navigate(link.id);
                            setHoveredPortalId(null);
                          }}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          className="
                            group relative
                            flex items-center gap-2
                            rounded-full
                            px-3.5 py-2
                            cursor-pointer
                            overflow-hidden
                          "
                          style={{
                            color:
                              isActive || isHovered
                                ? '#9a6a35'
                                : secondaryText,
                          }}
                        >
                          <motion.span
                            className="absolute inset-0 rounded-full"
                            initial={false}
                            animate={{
                              opacity: isActive || isHovered ? 1 : 0,
                              scale: isActive || isHovered ? 1 : 0.8,
                            }}
                            transition={{ duration: 0.2 }}
                            style={{
                              backgroundColor: isDark
                                ? 'rgba(154,106,53,0.09)'
                                : 'rgba(154,106,53,0.07)',
                            }}
                          />

                          {Icon && (
                            <motion.span
                              className="relative z-10"
                              animate={{
                                rotate: isHovered ? [0, -7, 7, 0] : 0,
                                scale: isHovered ? 1.08 : 1,
                              }}
                              transition={{ duration: 0.4 }}
                            >
                              <Icon
                                size={14}
                                strokeWidth={isActive ? 2.4 : 1.8}
                              />
                            </motion.span>
                          )}

                          <span
                            className="
                              relative z-10
                              text-[10px]
                              font-bold
                              whitespace-nowrap
                            "
                          >
                            {link.shortLabel || link.label}
                          </span>

                          {isActive && (
                            <motion.span
                              layoutId="wah-signature-active"
                              className="
                                relative z-10
                                h-1 w-1
                                rounded-full
                                bg-[#9a6a35]
                              "
                            />
                          )}

                          {link.isNew && (
                            <motion.span
                              animate={{
                                scale: [1, 1.35, 1],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                              }}
                              className="
                                absolute right-1 top-1
                                h-1.5 w-1.5
                                rounded-full
                                bg-[#9a6a35]
                              "
                            />
                          )}
                        </motion.button>

                        {/* بطاقة المعاينة التفاعلية الأنيقة */}
                        <AnimatePresence>
                          {isHovered && preview && (
                            <motion.div
                              initial={{ opacity: 0, y: 12, scale: 0.94 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.94 }}
                              transition={{ duration: 0.18, ease: 'easeOut' }}
                              className="
                                pointer-events-none
                                absolute
                                top-[52px]
                                right-1/2
                                translate-x-1/2
                                z-[500]
                                w-64
                                overflow-hidden
                                rounded-2xl
                                border shadow-2xl
                                backdrop-blur-2xl
                              "
                              style={{
                                backgroundColor: isDark
                                  ? 'rgba(18, 16, 14, 0.97)'
                                  : 'rgba(255, 255, 255, 0.98)',
                                borderColor: isDark
                                  ? 'rgba(154, 106, 53, 0.35)'
                                  : 'rgba(154, 106, 53, 0.22)',
                              }}
                            >
                              <div className="relative h-28 w-full overflow-hidden bg-black/10">
                                <img
                                  src={preview.image}
                                  alt={preview.title}
                                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                                <span
                                  className="
                                    absolute top-2.5 right-2.5
                                    rounded-full px-2 py-0.5
                                    text-[9px] font-black text-white shadow-sm
                                  "
                                  style={{ backgroundColor: '#9a6a35' }}
                                >
                                  {preview.badge}
                                </span>
                              </div>

                              <div className="p-3 text-right">
                                <h4
                                  className="text-xs font-black truncate"
                                  style={{ color: mainText }}
                                >
                                  {preview.title}
                                </h4>
                                <p
                                  className="mt-1 text-[11px] leading-relaxed line-clamp-2"
                                  style={{ color: secondaryText }}
                                >
                                  {preview.desc}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
              </div>

              {/* ===================================================
                  CENTER BRAND - EXTENDED HERO LOGO
              =================================================== */}
              <div className="relative mx-12 lg:mx-3 shrink-0 flex items-center justify-center select-none overflow-visible">
                <motion.button
                  type="button"
                  onClick={() => navigate('home')}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  aria-label="منصة وه - الرئيسية"
                  title="منصة وه - الرئيسية"
                  className="
                    group relative z-30
                    flex flex-col items-center justify-center
                    -translate-y-14 lg:-translate-y-16
                    bg-transparent border-0 p-0
                    cursor-pointer focus:outline-none overflow-visible
                  "
                >
                  <img
                    src="https://res.cloudinary.com/kuana1nl/image/upload/v1790463189/logo.png"
                    alt="وه"
                    draggable={false}
                    className="
                      block
                      h-5 w-auto max-w-[280px]
                      lg:h-48 lg:max-w-[330px]
                      object-contain
                      transition-transform duration-300
                      group-hover:scale-103
                    "
                  />
                </motion.button>
              </div>

              {/* LEFT NAVIGATION */}
              <div className="flex flex-1 items-center justify-start gap-1">
                {roleNavLinks
                  .filter(
                    (link: any) =>
                      link.id !== 'home' &&
                      link.id !== 'products' &&
                      link.id !== 'cart' &&
                      link.id !== 'orders' &&
                      link.id !== 'about'
                  )
                  .slice(
                    Math.ceil(
                      roleNavLinks.filter(
                        (link: any) =>
                          link.id !== 'home' &&
                          link.id !== 'products' &&
                          link.id !== 'cart' &&
                          link.id !== 'orders' &&
                          link.id !== 'about'
                      ).length / 2
                    )
                  )
                  .map((link: any) => {
                    const Icon = link.icon;
                    const isActive = activePage === link.id;
                    const isHovered = hoveredPortalId === link.id;
                    const preview = WAH_PORTALS_PREVIEW[link.id];

                    return (
                      <div
                        key={link.id}
                        className="relative"
                        onMouseEnter={() => setHoveredPortalId(link.id)}
                      >
                        <motion.button
                          type="button"
                          onClick={() => {
                            navigate(link.id);
                            setHoveredPortalId(null);
                          }}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          className="
                            group relative
                            flex items-center gap-2
                            rounded-full
                            px-3.5 py-2
                            cursor-pointer
                            overflow-hidden
                          "
                          style={{
                            color:
                              isActive || isHovered
                                ? '#9a6a35'
                                : secondaryText,
                          }}
                        >
                          <motion.span
                            className="absolute inset-0 rounded-full"
                            initial={false}
                            animate={{
                              opacity: isActive || isHovered ? 1 : 0,
                              scale: isActive || isHovered ? 1 : 0.8,
                            }}
                            transition={{ duration: 0.2 }}
                            style={{
                              backgroundColor: isDark
                                ? 'rgba(154,106,53,0.09)'
                                : 'rgba(154,106,53,0.07)',
                            }}
                          />

                          {Icon && (
                            <motion.span
                              className="relative z-10"
                              animate={{
                                rotate: isHovered ? [0, -7, 7, 0] : 0,
                                scale: isHovered ? 1.08 : 1,
                              }}
                              transition={{ duration: 0.4 }}
                            >
                              <Icon
                                size={14}
                                strokeWidth={isActive ? 2.4 : 1.8}
                              />
                            </motion.span>
                          )}

                          <span
                            className="
                              relative z-10
                              text-[10px]
                              font-bold
                              whitespace-nowrap
                            "
                          >
                            {link.shortLabel || link.label}
                          </span>

                          {isActive && (
                            <motion.span
                              layoutId="wah-signature-active-left"
                              className="
                                relative z-10
                                h-1 w-1
                                rounded-full
                                bg-[#9a6a35]
                              "
                            />
                          )}

                          {link.isNew && (
                            <motion.span
                              animate={{
                                scale: [1, 1.35, 1],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                              }}
                              className="
                                absolute left-1 top-1
                                h-1.5 w-1.5
                                rounded-full
                                bg-[#9a6a35]
                              "
                            />
                          )}
                        </motion.button>

                        {/* بطاقة المعاينة التفاعلية الأنيقة */}
                        <AnimatePresence>
                          {isHovered && preview && (
                            <motion.div
                              initial={{ opacity: 0, y: 12, scale: 0.94 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.94 }}
                              transition={{ duration: 0.18, ease: 'easeOut' }}
                              className="
                                pointer-events-none
                                absolute
                                top-[52px]
                                right-1/2
                                translate-x-1/2
                                z-[500]
                                w-64
                                overflow-hidden
                                rounded-2xl
                                border shadow-2xl
                                backdrop-blur-2xl
                              "
                              style={{
                                backgroundColor: isDark
                                  ? 'rgba(18, 16, 14, 0.97)'
                                  : 'rgba(255, 255, 255, 0.98)',
                                borderColor: isDark
                                  ? 'rgba(154, 106, 53, 0.35)'
                                  : 'rgba(154, 106, 53, 0.22)',
                              }}
                            >
                              <div className="relative h-28 w-full overflow-hidden bg-black/10">
                                <img
                                  src={preview.image}
                                  alt={preview.title}
                                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                                <span
                                  className="
                                    absolute top-2.5 right-2.5
                                    rounded-full px-2 py-0.5
                                    text-[9px] font-black text-white shadow-sm
                                  "
                                  style={{ backgroundColor: '#9a6a35' }}
                                >
                                  {preview.badge}
                                </span>
                              </div>

                              <div className="p-3 text-right">
                                <h4
                                  className="text-xs font-black truncate"
                                  style={{ color: mainText }}
                                >
                                  {preview.title}
                                </h4>
                                <p
                                  className="mt-1 text-[11px] leading-relaxed line-clamp-2"
                                  style={{ color: secondaryText }}
                                >
                                  {preview.desc}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}

                {/* ABOUT */}
                <div
                  className="relative"
                  onMouseEnter={() => setHoveredPortalId('about')}
                >
                  <motion.button
                    type="button"
                    onClick={() => {
                      navigate('about');
                      setHoveredPortalId(null);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.94 }}
                    className="
                      relative
                      ml-2
                      flex items-center gap-1.5
                      rounded-full
                      px-3 py-2
                      border
                      cursor-pointer
                    "
                    style={{
                      color: '#9a6a35',
                      borderColor: 'rgba(154,106,53,0.20)',
                      backgroundColor: isDark
                        ? 'rgba(154,106,53,0.06)'
                        : 'rgba(154,106,53,0.05)',
                    }}
                  >
                    <Sparkles size={12} />
                    <span className="text-[9px] font-black">عن وَه</span>
                  </motion.button>

                  <AnimatePresence>
                    {hoveredPortalId === 'about' && WAH_PORTALS_PREVIEW['about'] && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.94 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="
                          pointer-events-none
                          absolute
                          top-[52px]
                          left-0
                          z-[500]
                          w-64
                          overflow-hidden
                          rounded-2xl
                          border shadow-2xl
                          backdrop-blur-2xl
                        "
                        style={{
                          backgroundColor: isDark
                            ? 'rgba(18, 16, 14, 0.97)'
                            : 'rgba(255, 255, 255, 0.98)',
                          borderColor: isDark
                            ? 'rgba(154, 106, 53, 0.35)'
                            : 'rgba(154, 106, 53, 0.22)',
                        }}
                      >
                        <div className="relative h-28 w-full overflow-hidden bg-black/10 flex items-center justify-center p-4">
                          <img
                            src={WAH_PORTALS_PREVIEW['about'].image}
                            alt={WAH_PORTALS_PREVIEW['about'].title}
                            className="h-full w-auto object-contain"
                          />
                        </div>

                        <div className="p-3 text-right">
                          <h4
                            className="text-xs font-black truncate"
                            style={{ color: mainText }}
                          >
                            {WAH_PORTALS_PREVIEW['about'].title}
                          </h4>
                          <p
                            className="mt-1 text-[11px] leading-relaxed line-clamp-2"
                            style={{ color: secondaryText }}
                          >
                            {WAH_PORTALS_PREVIEW['about'].desc}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* BOTTOM LINE */}
            <div className="relative h-px w-full overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(0,0,0,0.04)',
                }}
              />
              <motion.div
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute h-full w-32"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, #9a6a35, transparent)',
                }}
              />
            </div>
          </div>
        </div>      </header>

      {/* SEARCH OVERLAY */}
      <AnimatePresence>
        {searchOverlayOpen && (
          <motion.div
            className="fixed inset-0 z-[600] flex items-start justify-center overflow-y-auto px-4 pt-16 sm:pt-24 lg:pt-28 backdrop-blur-md"
            style={{
              backgroundColor: isDark
                ? 'rgba(11, 11, 10, 0.85)'
                : 'rgba(238, 232, 220, 0.85)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-[680px]"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold" style={{ color: '#9a6a35' }}>
                    وه
                  </p>
                  <h2 className="mt-1 text-xl font-bold sm:text-2xl font-serif">
                    بتدور على إيه؟
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchOverlayOpen(false)}
                  aria-label="إغلاق البحث"
                  className="flex h-10 w-10 items-center justify-center rounded-full cursor-pointer"
                  style={{
                    backgroundColor: hoverBg,
                    color: mainText,
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit}>
                <div
                  className="flex items-center gap-3 rounded-[1.5rem] border px-4 shadow-xl backdrop-blur-2xl"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(21, 21, 19, 0.9)'
                      : 'rgba(255, 255, 255, 0.9)',
                    borderColor,
                  }}
                >
                  <Search
                    size={21}
                    className="shrink-0"
                    style={{ color: secondaryText }}
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بتدور على إيه؟ منتج، صنعة، مكان..."
                    className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:opacity-60 sm:text-base font-bold"
                    style={{ color: mainText }}
                  />
                  <button
                    type="submit"
                    className="hidden h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold sm:flex cursor-pointer hover:opacity-90 transition-opacity"
                    style={{
                      backgroundColor: '#9a6a35',
                      color: '#fff',
                    }}
                  >
                    دوّر
                    <ArrowLeft size={16} />
                  </button>
                </div>
              </form>

              <div className="mt-7">
                <p
                  className="mb-3 text-xs font-bold"
                  style={{ color: secondaryText }}
                >
                  ممكن يعجبك تدور على
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'فخار',
                    'كليم',
                    'هدايا',
                    'حرف يدوية',
                    'أسيوط',
                    'سوهاج',
                    'الأقصر',
                    'أسوان',
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSearchQuery(tag);
                        setActivePage('products');
                        setSearchOverlayOpen(false);
                      }}
                      className="rounded-full border px-3.5 py-2 text-xs font-bold sm:text-sm cursor-pointer hover:border-primary transition-colors"
                      style={{
                        color: mainText,
                        borderColor,
                        backgroundColor: hoverBg,
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[700] bg-black/50 backdrop-blur-xs lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.aside
              dir="rtl"
              className="fixed bottom-0 right-0 top-0 z-[710] w-[88vw] max-w-[360px] overflow-y-auto overscroll-contain lg:hidden shadow-2xl"
              style={{
                backgroundColor: isDark ? '#0b0b0a' : '#eee8dc',
                color: mainText,
                paddingBottom:
                  'calc(env(safe-area-inset-bottom, 0px) + 2.5rem)',
              }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            >
              <div
                className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b px-4 sm:h-20 backdrop-blur-2xl"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(11, 11, 10, 0.9)'
                    : 'rgba(238, 232, 220, 0.9)',
                  borderColor,
                }}
              >
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="إغلاق القائمة"
                  className="flex h-10 w-10 items-center justify-center rounded-full cursor-pointer"
                  style={{
                    backgroundColor: hoverBg,
                    color: mainText,
                  }}
                >
                  <X size={20} />
                </button>

                <img
                  src="https://res.cloudinary.com/kuana1nl/image/upload/v1790463189/logo.png"
                  alt="وه"
                  className="h-10 w-auto sm:h-12"
                />
              </div>

              <div className="p-4 sm:p-5">
                {isAuthenticated ? (
                  <div
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(getAccountPage());
                    }}
                    className="mb-4 flex items-center gap-3.5 rounded-2xl border p-3.5 cursor-pointer transition-all hover:scale-[1.01]"
                    style={{
                      borderColor,
                      backgroundColor: hoverBg,
                    }}
                  >
                    <div className="relative">
                      <img
                        src={profileImage}
                        alt={displayName}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/30"
                      />
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#121210]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className="truncate text-sm font-black"
                          style={{ color: mainText }}
                        >
                          {displayName}
                        </p>
                        <ArrowLeft size={14} className="text-primary" />
                      </div>
                      <p
                        className="mt-0.5 text-xs font-semibold"
                        style={{ color: secondaryText }}
                      >
                        {currentRole === 'admin'
                          ? 'إدارة وه'
                          : isSeller
                            ? 'شيخ صنعة / بائع'
                            : 'ابن البلد / زبون'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="flex-1 rounded-xl py-3 text-center text-xs font-bold border transition-colors cursor-pointer"
                      style={{
                        borderColor,
                        color: mainText,
                      }}
                    >
                      ادخل لحسابك
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setAuthModalTab('register');
                        setIsAuthModalOpen(true);
                      }}
                      className="flex-1 rounded-xl py-3 text-center text-xs font-bold text-white transition-opacity cursor-pointer"
                      style={{
                        backgroundColor: '#9a6a35',
                      }}
                    >
                      اعمل حساب جديد
                    </button>
                  </div>
                )}

                {/* QUIZ BANNER */}
                <div
                  onClick={() => navigate('quize')}
                  className="mb-4 flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01]"
                  style={{
                    backgroundColor:
                      activePage === 'quize'
                        ? 'rgba(180, 95, 66, 0.15)'
                        : hoverBg,
                    borderColor:
                      activePage === 'quize' ? '#b45f42' : borderColor,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-[#d6aa72]/15 flex items-center justify-center text-primary dark:text-primary-hover">
                      <Flame size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-primary dark:text-primary-hover">
                          فاهم كلام الصعايدة؟
                        </span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-primary text-white">
                          تحدي
                        </span>
                      </div>
                      <p className="text-[11px] text-[#76675b] dark:text-[#b3a59a] mt-0.5">
                        اختبر نفسك في 10 أسئلة صعيدية
                      </p>
                    </div>
                  </div>
                  <ArrowLeft size={16} className="text-[#b45f42]" />
                </div>

                {/* NAVIGATION */}
                <div className="space-y-1">
                  {roleNavLinks.map((link: any) => {
                    const Icon = link.icon;
                    const isActive = activePage === link.id;

                    return (
                      <button
                        key={link.id}
                        type="button"
                        onClick={() => navigate(link.id)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-right font-bold cursor-pointer transition-colors"
                        style={{
                          backgroundColor: isActive
                            ? isDark
                              ? 'rgba(154,106,53,0.18)'
                              : 'rgba(154,106,53,0.09)'
                            : 'transparent',
                          color: isActive ? '#9a6a35' : mainText,
                        }}
                      >
                        {Icon && <Icon size={19} className="shrink-0" />}
                        <span className="flex-1 text-sm font-bold">
                          {link.label}
                        </span>
                        {link.isNew && (
                          <span
                            className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                            style={{
                              backgroundColor: '#9a6a35',
                              color: '#fff',
                            }}
                          >
                            جديد
                          </span>
                        )}
                        <ArrowLeft size={15} className="opacity-40" />
                      </button>
                    );
                  })}
                </div>

                {/* ACCOUNT SHORTCUTS */}
                {isAuthenticated && (
                  <div
                    className="my-5 border-t pt-4"
                    style={{ borderColor }}
                  >
                    <p
                      className="mb-2 px-3 text-xs font-bold"
                      style={{ color: secondaryText }}
                    >
                      حاجات تهمك في حسابك
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setShowIntroVideo(true);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: mainText }}
                    >
                      <Play size={18} />
                      <span>شوف حكاية وه</span>
                    </button>

                    {isSeller && (
                      <button
                        type="button"
                        onClick={() => navigate('seller-dashboard')}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        style={{ color: mainText }}
                      >
                        <Store size={18} />
                        <span>لوحة الورشة</span>
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => navigate('admin-dashboard')}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        style={{ color: mainText }}
                      >
                        <ShieldCheck size={18} />
                        <span>لوحة الإدارة</span>
                      </button>
                    )}

                    {!isStaff && (
                      <button
                        type="button"
                        onClick={() => navigate('favorites')}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        style={{ color: mainText }}
                      >
                        <Heart size={18} />
                        <span>المفضلة</span>
                        {favorites.length > 0 && (
                          <span
                            className="mr-auto rounded-full px-2 py-0.5 text-[10px] font-bold"
                            style={{
                              backgroundColor: '#9a6a35',
                              color: '#fff',
                            }}
                          >
                            {favorites.length}
                          </span>
                        )}
                      </button>
                    )}

                    {!isStaff && (
                      <button
                        type="button"
                        onClick={() => navigate('orders')}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        style={{ color: mainText }}
                      >
                        <Package size={18} />
                        <span>طلباتي ومشترياتي</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate('messages')}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: mainText }}
                    >
                      <MessageCircle size={18} />
                      <span>الرسايل</span>
                      {chatUnreadCount > 0 && (
                        <span
                          className="mr-auto rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{
                            backgroundColor: '#9a6a35',
                            color: '#fff',
                          }}
                        >
                          {chatUnreadCount}
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* DISCOVER */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowIntroVideo(true);
                  }}
                  className="mt-4 flex w-full items-center justify-between rounded-2xl border p-4 text-right cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ borderColor, backgroundColor: hoverBg }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: 'rgba(154,106,53,0.12)',
                        color: '#9a6a35',
                      }}
                    >
                      <Film size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">اتعرف على وه</p>
                      <p
                        className="mt-1 text-[11px]"
                        style={{ color: secondaryText }}
                      >
                        من الصعيد... لكل مصر
                      </p>
                    </div>
                  </div>
                  <ArrowLeft size={17} style={{ color: secondaryText }} />
                </button>

                {/* LOGOUT */}
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold cursor-pointer hover:bg-rose-500/10 transition-colors"
                    style={{
                      color: '#9a6a35',
                      backgroundColor: isDark
                        ? 'rgba(154,106,53,0.10)'
                        : 'rgba(154,106,53,0.06)',
                    }}
                  >
                    <LogOut size={17} />
                    اخرج من الحساب
                  </button>
                )}

                {/* FOOTER */}
                <div
                  className="mt-6 border-t pt-5 text-center"
                  style={{ borderColor }}
                >
                  <p
                    className="text-[11px] font-bold"
                    style={{ color: secondaryText }}
                  >
                    وه — حكاية الصعيد في إيدك
                  </p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;