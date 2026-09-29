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
    setPostLoginRedirect,
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
            setPostLoginRedirect('notifications');
            setAuthModalTab('login');
            setIsAuthModalOpen(true);
            return;
          }
          setOpen((prev) => !prev);
        }}
        className="relative flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 sm:h-10 sm:w-10 lg:h-11 lg:w-11 cursor-pointer"
        style={{
          backgroundColor: open ? '#E66A2E' : hoverBg,
          color: open ? '#fff' : mainText,
        }}
      >
        <Bell size={18} />
        {displayCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold"
            style={{
              backgroundColor: '#E66A2E',
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
                      style={{ backgroundColor: '#E66A2E' }}
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
                    style={{ color: '#C99444' }}
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
                        setPostLoginRedirect('notifications');
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
                              ? 'rgba(201,148,68,0.15)'
                              : 'rgba(201,148,68,0.06)'
                            : 'transparent',
                        }}
                      >
                        <div
                          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: isDark
                              ? 'rgba(201,148,68,0.18)'
                              : 'rgba(201,148,68,0.10)',
                            color: '#C99444',
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
                                style={{ backgroundColor: '#E66A2E' }}
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
                  className="flex-1 rounded-xl py-2 text-xs font-bold text-center transition-colors cursor-pointer bg-primary text-white hover:bg-[#3B1E0E]"
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
   WAH PORTALS PREVIEW INFO (CHARACTERS & MASCOTS FROM /public)
   ========================================================= */
export interface PortalPreviewItem {
  title: string;
  desc: string;
  avatar: string;
  badge: string;
  accentColor: string;
}

const WAH_PORTALS_PREVIEW: Record<string, PortalPreviewItem> = {
  map: {
    title: 'جولة عم وه في الصعيد',
    desc: 'تعالى نمشي مع عم وه في خريطة الصعيد ونكتشف كل محافظة وقرية ومكان له حكاية.',
    avatar: '/mascot/saaed.png',
    badge: 'جولة عم وه',
    accentColor: '#C99444',
  },

  places: {
    title: 'عم وه في حكايات زمان',
    desc: 'جولة بين المعابد والمقابر والبيوت والأماكن القديمة اللي لسه بتحكي حكايات أهلها.',
    avatar: '/mascot/make.png',
    badge: 'جولة عم وه',
    accentColor: '#E66A2E',
  },

  people: {
    title: 'عم وه مع ناس الصعيد',
    desc: 'نتعرف مع عم وه على شخصيات وناس من الصعيد، وكل واحد منهم وراه حكاية تستاهل تتحكي.',
    avatar: '/mascot/fan.png',
    badge: 'جولة عم وه',
    accentColor: '#C99444',
  },

  food: {
    title: 'عم وه على سفرة الصعيد',
    desc: 'جولة مع عم وه في أكلات الصعيد ووصفاته وحكايات الأكل اللي اتنقلت من جيل لجيل.',
    avatar: '/mascot/foods.png',
    badge: 'جولة عم وه',
    accentColor: '#C99444',
  },

  events: {
    title: 'عم وه في مواسم الصعيد',
    desc: 'نلف مع عم وه في الموالد والمواسم والاحتفالات والعادات اللي بتجمع أهل الصعيد.',
    avatar: '/mascot/events.png',
    badge: 'جولة عم وه',
    accentColor: '#E66A2E',
  },

  reels: {
    title: 'عم وه بيحكيلك',
    desc: 'حكايات قصيرة من قلب الصعيد، أماكن وناس وحرف بنشوفها مع عم وه بطريقة مختلفة.',
    avatar: '/mascot/reels.png',
    badge: 'حكايات عم وه',
    accentColor: '#C99444',
  },

  sellers: {
    title: 'عم وه عند أهل الصنعة',
    desc: 'جولة بين ورش وحرفيي الصعيد، نشوف الصنعة وهي بتتعمل ونسمع حكاية كل صاحب حرفة.',
    avatar: '/mascot/pro.png',
    badge: 'جولة عم وه',
    accentColor: '#C99444',
  },

  categories: {
    title: 'عم وه يكتشف الحرف',
    desc: 'تعالى مع عم وه نتعرف على حرف الصعيد وخاماته، من الفخار والتلي للنسيج والجريد.',
    avatar: '/mascot/fav.png',
    badge: 'جولة عم وه',
    accentColor: '#C99444',
  },

  quize: {
    title: 'عم وه بيختبرك',
    desc: 'فاكر إنك صعيدي أصيل؟ عم وه هيختبرك في اللهجة والكلمات والأمثال ومعانيها.',
    avatar: '/mascot/quiz.png',
    badge: 'تحدي عم وه',
    accentColor: '#E66A2E',
  },

  quiz: {
    title: 'عم وه بيختبرك',
    desc: 'فاكر إنك صعيدي أصيل؟ عم وه هيختبرك في اللهجة والكلمات والأمثال ومعانيها.',
    avatar: '/mascot/quiz.png',
    badge: 'تحدي عم وه',
    accentColor: '#E66A2E',
  },

  about: {
    title: 'عم وه يحكيلك عن وَه',
    desc: 'اقعد مع عم وه واعرف حكاية وَه، وليه بنوثق تراث الصعيد وحكاياته ونوصلها لكل الناس.',
    avatar: '/mascot/logo.png',
    badge: 'حكاية عم وه',
    accentColor: '#C99444',
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
    setPostLoginRedirect,
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

  const isAdmin = currentRole === 'admin' || currentUser?.role === 'admin';
  const isSeller = !isAdmin && (currentRole === 'seller' || currentUser?.role === 'seller');
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
  const mainText = isDark ? '#FFF9EE' : '#3B1E0E';
  const secondaryText = isDark ? '#D6C6B1' : '#8C6F53';
  const borderColor = isDark ? '#6B3A1F' : '#E0C79B';
  const hoverBg = isDark ? 'rgba(74, 39, 21, 0.45)' : 'rgba(248, 235, 215, 0.7)';

  return (
    <>
      <header
        dir="rtl"
        className={`sticky top-0 z-[100] w-full overflow-visible backdrop-blur-2xl transition-colors duration-500 shadow-sm ${className}`}
        style={{
          backgroundColor: isDark
            ? 'rgba(27, 16, 9, 0.95)'
            : 'rgba(255, 249, 238, 0.95)',
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
          {/* =====================================================
              1. MOBILE MAIN HEADER (ONLY THE BIG LOGO)
              الهيدر الأساسي في الموبايل: اللوجو فقط ويكون كبير زى الكمبيوتر
          ===================================================== */}
          <div className="flex lg:hidden items-center justify-center py-3 sm:py-4 w-full select-none">
            <button
              id="brand-logo-mobile"
              type="button"
              onClick={() => navigate('home')}
              aria-label="منصة وه - الرئيسية"
              title="منصة وه - الرئيسية"
              className="
                flex items-center justify-center
                focus:outline-none cursor-pointer
                transition-transform active:scale-95
              "
            >
              <img
                src="https://res.cloudinary.com/kuana1nl/image/upload/v1790463189/logo.png"
                alt="وه"
                draggable={false}
                className="
                  block
                  h-16 w-auto max-w-[240px]
                  sm:h-20 sm:max-w-[300px]
                  object-contain
                  drop-shadow-sm
                  transition-transform duration-300
                  hover:scale-102
                "
              />
            </button>
          </div>

          {/* =====================================================
              2. DESKTOP MAIN ROW (NAV + ACTIONS)
          ===================================================== */}
          <div className="hidden lg:flex relative h-[94px] items-center justify-between">
            {/* START ACTIONS */}
            <div
              id="header-start-actions"
              className="flex items-center gap-6"
            >
              {/* DESKTOP NAV */}
              <div className="flex items-center gap-6">
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
                    color: activePage === 'home' ? (isDark ? '#C99444' : '#6B3A1F') : mainText,
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
                    color: activePage === 'products' ? (isDark ? '#C99444' : '#6B3A1F') : mainText,
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
                    color: activePage === 'map' ? (isDark ? '#C99444' : '#6B3A1F') : mainText,
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
                      backgroundColor: '#E66A2E',
                      color: '#FFF9EE',
                    }}
                  >
                    جديد
                  </span>
                </button>
              </div>
            </div>

            {/* END ACTIONS */}
            <div
              id="header-end-actions"
              className="flex items-center justify-end"
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
                          backgroundColor: '#E66A2E',
                          color: '#FFF9EE',
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
                          backgroundColor: '#E66A2E',
                          color: '#FFF9EE',
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
                          backgroundColor: '#E66A2E',
                          color: '#FFF9EE',
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
                            ? 'rgba(201, 148, 68, 0.20)'
                            : 'rgba(201, 148, 68, 0.12)'
                          : hoverBg,
                        borderColor: userDropdownOpen
                          ? '#C99444'
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
                            dark:ring-[#1B1009]
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
                                      dark:ring-[#1B1009]
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
                                  hover:bg-[#E66A2E]/10
                                  hover:text-[#E66A2E]
                                "
                                style={{
                                  color: mainText,
                                }}
                              >
                                <Flame
                                  size={18}
                                  className="text-[#E66A2E]"
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
                        if (activePage !== 'home') {
                          setPostLoginRedirect(activePage);
                        } else {
                          setPostLoginRedirect(null);
                        }
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
                        backgroundColor: '#6B3A1F',
                      }}
                    >
                      <UserCircle size={15} />
                      <span>دخول</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (activePage !== 'home') {
                          setPostLoginRedirect(activePage);
                        } else {
                          setPostLoginRedirect(null);
                        }
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
                        if (activePage !== 'home') {
                          setPostLoginRedirect(activePage);
                        } else {
                          setPostLoginRedirect(null);
                        }
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
                        backgroundColor: '#6B3A1F',
                        color: '#FFF9EE',
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
            📱 MOBILE SUB-BAR (الـ Sub بار في الموبايل — زي بتاع الكمبيوتر)
        ========================================================= */}
        <div
          className="block lg:hidden border-t select-none relative z-50 backdrop-blur-xl"
          style={{
            borderColor: isDark ? 'rgba(107, 58, 31, 0.4)' : 'rgba(224, 199, 155, 0.5)',
            backgroundColor: isDark ? 'rgba(27, 16, 9, 0.98)' : 'rgba(255, 249, 238, 0.98)',
          }}
        >
          {/* DECORATIVE TOP GLOW */}
          <div
            className="absolute left-1/2 top-0 h-px w-40 -translate-x-1/2 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, #C99444, transparent)',
            }}
          />

          {/* ROW 1: QUICK ACTIONS BAR (Menu, Quiz, Search, Favorites, Cart, Theme, User) */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-black/5 dark:border-white/5">
            {/* START: MENU TOGGLE & QUIZ */}
            <div className="flex items-center gap-1.5">
              <button
                id="mobile-menu-toggle"
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="فتح القائمة"
                title="فتح القائمة"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer text-xs font-bold"
                style={{
                  backgroundColor: hoverBg,
                  color: mainText,
                }}
              >
                <Menu size={16} />
                <span>القائمة</span>
              </button>

              <button
                id="mobile-header-quiz-btn"
                type="button"
                onClick={() => navigate('quize')}
                aria-label="اختبار اللهجة الصعيدية"
                title="اختبار اللهجة الصعيدية"
                className="flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: hoverBg,
                  color: mainText,
                }}
              >
                <Flame size={16} className="text-[#E66A2E]" />
              </button>
            </div>

            {/* END: SEARCH, FAVORITES, CART, THEME, USER */}
            <div className="flex items-center gap-1">
              <button
                id="search-trigger-btn-mobile"
                type="button"
                onClick={() => setSearchOverlayOpen(true)}
                aria-label="بحث"
                title="بحث"
                className="flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: hoverBg,
                  color: mainText,
                }}
              >
                <Search size={16} />
              </button>

              {!isStaff && (
                <button
                  id="nav-favorites-btn-mobile"
                  type="button"
                  onClick={() => navigate('favorites')}
                  aria-label="المفضلة"
                  title="المفضلة"
                  className="relative flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: hoverBg,
                    color: mainText,
                  }}
                >
                  <Heart size={16} />
                  {favorites.length > 0 && (
                    <span
                      className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold"
                      style={{
                        backgroundColor: '#E66A2E',
                        color: '#FFF9EE',
                      }}
                    >
                      {favorites.length > 99 ? '99+' : favorites.length}
                    </span>
                  )}
                </button>
              )}

              {!isStaff && (
                <button
                  id="nav-cart-btn-mobile"
                  type="button"
                  onClick={() => setIsCartDrawerOpen(true)}
                  aria-label="السلة"
                  title="السلة"
                  className="relative flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: hoverBg,
                    color: mainText,
                  }}
                >
                  <ShoppingBag size={16} />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold"
                      style={{
                        backgroundColor: '#E66A2E',
                        color: '#FFF9EE',
                      }}
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              )}

              <button
                id="mobile-header-theme-toggle-btn"
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
                title={isDark ? 'تفعيل الوضع الفاتح' : 'الوضع الداكن'}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: hoverBg,
                  color: mainText,
                }}
              >
                {isDark ? (
                  <Sun size={16} className="text-primary-hover" />
                ) : (
                  <Moon size={16} />
                )}
              </button>

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => navigate(getAccountPage())}
                  aria-label="حسابي"
                  title="حسابي"
                  className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden border border-primary/30 transition-all active:scale-95 cursor-pointer ms-0.5"
                >
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('login');
                    setIsAuthModalOpen(true);
                  }}
                  aria-label="تسجيل الدخول"
                  title="تسجيل الدخول"
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer ms-0.5"
                  style={{
                    backgroundColor: hoverBg,
                    color: mainText,
                  }}
                >
                  <UserCircle size={17} />
                </button>
              )}
            </div>
          </div>

          {/* ROW 2: HERITAGE PORTALS SCROLLABLE STRIP (Sub بار زى بتاع الكمبيوتر بالضبط) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 py-2 scroll-smooth">
            {roleNavLinks
              .filter(
                (link: any) =>
                  link.id !== 'cart' &&
                  link.id !== 'orders' &&
                  link.id !== 'about'
              )
              .map((link: any) => {
                const Icon = link.icon;
                const isActive = activePage === link.id;

                return (
                  <motion.button
                    key={`mob-sub-${link.id}`}
                    type="button"
                    onClick={() => navigate(link.id)}
                    whileTap={{ scale: 0.94 }}
                    className="
                      group relative flex items-center gap-1.5
                      rounded-full px-3 py-1.5 text-xs font-bold
                      whitespace-nowrap shrink-0 transition-colors
                      cursor-pointer
                    "
                    style={{
                      backgroundColor: isActive
                        ? (isDark ? 'rgba(201,148,68,0.18)' : 'rgba(107,58,31,0.1)')
                        : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                      color: isActive
                        ? (isDark ? '#C99444' : '#6B3A1F')
                        : secondaryText,
                      border: isActive
                        ? `1px solid ${isDark ? '#C99444' : '#6B3A1F'}`
                        : `1px solid transparent`,
                    }}
                  >
                    {Icon && (
                      <Icon
                        size={14}
                        strokeWidth={isActive ? 2.5 : 1.8}
                        className={isActive ? (isDark ? 'text-[#C99444]' : 'text-[#6B3A1F]') : ''}
                      />
                    )}
                    <span>{link.shortLabel || link.label}</span>

                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C99444]" />
                    )}

                    {link.isNew && (
                      <span
                        className="rounded-full px-1.5 py-0.2 text-[8px] font-black"
                        style={{
                          backgroundColor: '#E66A2E',
                          color: '#FFF9EE',
                        }}
                      >
                        جديد
                      </span>
                    )}
                  </motion.button>
                );
              })}
          </div>
        </div>

        {/* =========================================================
            وَه — SIGNATURE HEADER
            Interactive Heritage Preview Cards + Extended Logo Center
        ========================================================= */}
        <div
          className="hidden lg:block relative z-[100] select-none"
          onMouseLeave={() => setHoveredPortalId(null)}
        >
          <div
            className="relative border-t border-b overflow-visible"
            style={{
              borderColor: isDark
                ? 'rgba(107, 58, 31, 0.3)'
                : 'rgba(224, 199, 155, 0.4)',
              backgroundColor: isDark ? '#1B1009' : '#FFF9EE',
            }}
          >
            {/* DECORATIVE TOP GLOW */}
            <div
              className="absolute left-1/2 top-0 h-px w-40 -translate-x-1/2"
              style={{
                background:
                  'linear-gradient(90deg, transparent, #C99444, transparent)',
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
                                ? (isDark ? '#C99444' : '#6B3A1F')
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
                                ? 'rgba(201,148,68,0.12)'
                                : 'rgba(107,58,31,0.07)',
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
                                bg-[#C99444]
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
                                bg-[#C99444]
                              "
                            />
                          )}
                        </motion.button>

                        {/* بطاقة الكراكتر التفاعلية */}
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
                                w-[250px]
                                overflow-hidden
                                rounded-3xl
                                border shadow-2xl
                                backdrop-blur-2xl
                                p-4
                              "
                              style={{
                                backgroundColor: isDark
                                  ? 'rgba(59, 30, 14, 0.98)'
                                  : 'rgba(248, 235, 215, 0.98)',
                                borderColor: isDark
                                  ? 'rgba(107, 58, 31, 0.4)'
                                  : 'rgba(224, 199, 155, 0.4)',
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                  <div
                                    className="h-14 w-14 rounded-full overflow-hidden border-2 p-0.5 shadow-md flex items-center justify-center"
                                    style={{
                                      borderColor: preview.accentColor,
                                      backgroundColor: isDark
                                        ? '#1a1816'
                                        : '#f5f0e7',
                                    }}
                                  >
                                    <img
                                      src={preview.avatar}
                                      className="h-full w-full object-cover rounded-full"
                                    />
                                  </div>
                                  <span
                                    className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2"
                                    style={{
                                      backgroundColor: preview.accentColor,
                                      borderColor: isDark ? '#1B1009' : '#FFF9EE',
                                    }}
                                  />
                                </div>

                                <div className="min-w-0 flex-1 text-right">
                                  <span
                                    className="inline-block rounded-full px-2 py-0.5 text-[8px] font-black text-white"
                                    style={{
                                      backgroundColor: preview.accentColor,
                                    }}
                                  >
                                    {preview.badge}
                                  </span>
                                  <p
                                    className="mt-1 text-xs font-black truncate"
                                    style={{ color: mainText }}
                                  >
                                  </p>
                                  <p
                                    className="text-[10px] font-bold opacity-75"
                                    style={{ color: secondaryText }}
                                  >
                                    {preview.title}
                                  </p>
                                </div>
                              </div>

                              <div
                                className="my-2.5 h-px w-full"
                                style={{
                                  background: `linear-gradient(90deg, transparent, ${preview.accentColor}40, transparent)`,
                                }}
                              />

                              <p
                                className="text-[11px] leading-relaxed text-right line-clamp-2"
                                style={{ color: secondaryText }}
                              >
                                {preview.desc}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
              </div>

              {/* ===================================================
                  CENTER BRAND - EXTENDED HERO LOGO (NO SHADOW)
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
                                ? (isDark ? '#C99444' : '#6B3A1F')
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
                                ? 'rgba(201,148,68,0.12)'
                                : 'rgba(107,58,31,0.07)',
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
                                bg-[#C99444]
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
                                bg-[#C99444]
                              "
                            />
                          )}
                        </motion.button>

                        {/* بطاقة الكراكتر التفاعلية */}
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
                                w-[250px]
                                overflow-hidden
                                rounded-3xl
                                border shadow-2xl
                                backdrop-blur-2xl
                                p-4
                              "
                              style={{
                                backgroundColor: isDark
                                  ? 'rgba(59, 30, 14, 0.98)'
                                  : 'rgba(248, 235, 215, 0.98)',
                                borderColor: isDark
                                  ? 'rgba(107, 58, 31, 0.4)'
                                  : 'rgba(224, 199, 155, 0.4)',
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                  <div
                                    className="h-14 w-14 rounded-full overflow-hidden border-2 p-0.5 shadow-md flex items-center justify-center"
                                    style={{
                                      borderColor: preview.accentColor,
                                      backgroundColor: isDark
                                        ? '#1a1816'
                                        : '#f5f0e7',
                                    }}
                                  >
                                    <img
                                      src={preview.avatar}
                                      className="h-full w-full object-cover rounded-full"
                                    />
                                  </div>
                                  <span
                                    className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2"
                                    style={{
                                      backgroundColor: preview.accentColor,
                                      borderColor: isDark ? '#1B1009' : '#FFF9EE',
                                    }}
                                  />
                                </div>

                                <div className="min-w-0 flex-1 text-right">
                                  <span
                                    className="inline-block rounded-full px-2 py-0.5 text-[8px] font-black text-white"
                                    style={{
                                      backgroundColor: preview.accentColor,
                                    }}
                                  >
                                    {preview.badge}
                                  </span>
                                  <p
                                    className="mt-1 text-xs font-black truncate"
                                    style={{ color: mainText }}
                                  >
                                  </p>
                                  <p
                                    className="text-[10px] font-bold opacity-75"
                                    style={{ color: secondaryText }}
                                  >
                                    {preview.title}
                                  </p>
                                </div>
                              </div>

                              <div
                                className="my-2.5 h-px w-full"
                                style={{
                                  background: `linear-gradient(90deg, transparent, ${preview.accentColor}40, transparent)`,
                                }}
                              />

                              <p
                                className="text-[11px] leading-relaxed text-right line-clamp-2"
                                style={{ color: secondaryText }}
                              >
                                {preview.desc}
                              </p>
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
                      color: '#C99444',
                      borderColor: 'rgba(154,106,53,0.20)',
                      backgroundColor: isDark
                        ? 'rgba(201,148,68,0.06)'
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
                          w-[250px]
                          overflow-hidden
                          rounded-3xl
                          border shadow-2xl
                          backdrop-blur-2xl
                          p-4
                        "
                        style={{
                          backgroundColor: isDark
                            ? 'rgba(59, 30, 14, 0.98)'
                            : 'rgba(248, 235, 215, 0.98)',
                          borderColor: isDark
                            ? 'rgba(107, 58, 31, 0.4)'
                            : 'rgba(224, 199, 155, 0.4)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div
                              className="h-14 w-14 rounded-full overflow-hidden border-2 p-1 shadow-md flex items-center justify-center"
                              style={{
                                borderColor: WAH_PORTALS_PREVIEW['about'].accentColor,
                                backgroundColor: isDark ? '#26160D' : '#FFF9EE',
                              }}
                            >
                              <img
                                src={WAH_PORTALS_PREVIEW['about'].avatar}
                                className="h-full w-auto object-contain"
                              />
                            </div>
                          </div>

                          <div className="min-w-0 flex-1 text-right">
                            <span
                              className="inline-block rounded-full px-2 py-0.5 text-[8px] font-black text-white"
                              style={{
                                backgroundColor: WAH_PORTALS_PREVIEW['about'].accentColor,
                              }}
                            >
                              {WAH_PORTALS_PREVIEW['about'].badge}
                            </span>
                            <p
                              className="mt-1 text-xs font-black truncate"
                              style={{ color: mainText }}
                            >
                            </p>
                            <p
                              className="text-[10px] font-bold opacity-75"
                              style={{ color: secondaryText }}
                            >
                              {WAH_PORTALS_PREVIEW['about'].title}
                            </p>
                          </div>
                        </div>

                        <div
                          className="my-2.5 h-px w-full"
                          style={{
                            background: `linear-gradient(90deg, transparent, ${WAH_PORTALS_PREVIEW['about'].accentColor}40, transparent)`,
                          }}
                        />

                        <p
                          className="text-[11px] leading-relaxed text-right line-clamp-2"
                          style={{ color: secondaryText }}
                        >
                          {WAH_PORTALS_PREVIEW['about'].desc}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* FULL WIDTH SHIMMER LINE */}
            <div className="relative left-1/2 h-px w-screen -translate-x-1/2 overflow-hidden">
              {/* Base line */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(0,0,0,0.04)',
                }}
              />

              {/* Single continuous shimmer */}
              <motion.div
                initial={{
                  left: '-320px',
                }}
                animate={{
                  left: '100%',
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'linear',
                }}
                className="absolute top-0 h-full w-80"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, #C99444 50%, transparent 100%)',
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH OVERLAY */}
      <AnimatePresence>
        {searchOverlayOpen && (
          <motion.div
            className="fixed inset-0 z-[600] flex items-start justify-center overflow-y-auto px-4 pt-16 sm:pt-24 lg:pt-28 backdrop-blur-md"
            style={{
              backgroundColor: isDark
                ? 'rgba(27, 16, 9, 0.92)'
                : 'rgba(255, 249, 238, 0.92)',
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
                  <p className="text-xs font-bold" style={{ color: '#C99444' }}>
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
                      ? 'rgba(59, 30, 14, 0.95)'
                      : 'rgba(248, 235, 215, 0.95)',
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
                      backgroundColor: '#6B3A1F',
                      color: '#FFF9EE',
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
                backgroundColor: isDark ? '#1B1009' : '#FFF9EE',
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
                    ? 'rgba(27, 16, 9, 0.95)'
                    : 'rgba(255, 249, 238, 0.95)',
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
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1B1009]" />
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
                        if (activePage !== 'home') {
                          setPostLoginRedirect(activePage);
                        } else {
                          setPostLoginRedirect(null);
                        }
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
                        if (activePage !== 'home') {
                          setPostLoginRedirect(activePage);
                        } else {
                          setPostLoginRedirect(null);
                        }
                        setAuthModalTab('register');
                        setIsAuthModalOpen(true);
                      }}
                      className="flex-1 rounded-xl py-3 text-center text-xs font-bold text-white transition-opacity cursor-pointer"
                      style={{
                        backgroundColor: '#6B3A1F',
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
                        ? 'rgba(230, 106, 46, 0.15)'
                        : hoverBg,
                    borderColor:
                      activePage === 'quize' ? '#E66A2E' : borderColor,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-[#C99444]/15 flex items-center justify-center text-primary dark:text-primary-hover">
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
                      <p className="text-[11px] text-[#8C6F53] dark:text-[#D6C6B1] mt-0.5">
                        اختبر نفسك في 10 أسئلة صعيدية
                      </p>
                    </div>
                  </div>
                  <ArrowLeft size={16} className="text-[#E66A2E]" />
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
                              ? 'rgba(201,148,68,0.18)'
                              : 'rgba(201,148,68,0.09)'
                            : 'transparent',
                          color: isActive ? (isDark ? '#C99444' : '#6B3A1F') : mainText,
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
                              backgroundColor: '#E66A2E',
                              color: '#FFF9EE',
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
                              backgroundColor: '#E66A2E',
                              color: '#FFF9EE',
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
                            backgroundColor: '#E66A2E',
                            color: '#FFF9EE',
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
                        backgroundColor: 'rgba(201,148,68,0.15)',
                        color: '#C99444',
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
                      color: '#C99444',
                      backgroundColor: isDark
                        ? 'rgba(201,148,68,0.10)'
                        : 'rgba(201,148,68,0.06)',
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