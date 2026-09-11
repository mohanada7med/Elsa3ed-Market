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
  UserPlus,
  Flame,
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
    setAuthModalTab
  } = useApp();

  const isGuest = currentRole === 'guest' || !currentUser?.id || currentUser.id === 'guest' || currentUser.id === 'guest-visitor';
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
      navigateToSeller
    });
  };

  return (
    <div className="relative shrink-0">
      {/* BELL */}
      <button
        id="header-notifications-btn"
        type="button"
        aria-label="الإشعارات"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 sm:h-10 sm:w-10 lg:h-11 lg:w-11 cursor-pointer"
        style={{
          backgroundColor: hoverBg,
          color: mainText,
        }}
      >
        <Bell size={18} />

        {displayCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold animate-pulse"
            style={{
              backgroundColor: '#9a6a35',
              color: '#fff',
            }}
          >
            {displayCount > 9 ? '9+' : displayCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* MOBILE BACKDROP */}
            <motion.div
              className="fixed inset-x-0 bottom-0 top-16 sm:top-[78px] lg:top-[94px] z-[400] bg-black/30 sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* NOTIFICATION PANEL */}
            <motion.div
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
                duration: 0.16,
              }}
              className="
                fixed
                left-3
                right-3
                top-[74px]
                z-[410]
                overflow-hidden
                rounded-[1.5rem]
                border
                shadow-2xl
                backdrop-blur-2xl
                sm:absolute
                sm:left-auto
                sm:right-0
                sm:top-[calc(100%+10px)]
                sm:w-[350px]
              "
              style={{
                backgroundColor: isDark
                  ? 'rgba(21, 21, 19, 0.95)'
                  : 'rgba(255, 255, 255, 0.95)',
                borderColor,
              }}
            >
              {/* HEADER */}
              <div
                className="flex items-center justify-between border-b px-4 py-3.5"
                style={{
                  borderColor,
                }}
              >
                <div>
                  <h3 className="text-sm font-bold">
                    الإشعارات
                  </h3>

                  <p
                    className="mt-0.5 text-[11px]"
                    style={{
                      color: secondaryText,
                    }}
                  >
                    {isGuest ? 'تنبيهات وه' : 'أحدث التنبيهات والأخبار أول بأول'}
                  </p>
                </div>

                {!isGuest && displayCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllNotificationsAsRead()}
                    className="flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                    style={{
                      color: '#9a6a35',
                    }}
                  >
                    <Check size={13} />
                    علّم على الكل كمقروء
                  </button>
                )}
              </div>

              {/* LIST */}
              <div className="max-h-[55vh] overflow-y-auto">
                {isGuest ? (
                  <div className="px-5 py-10 text-center">
                    <Bell
                      size={28}
                      className="mx-auto opacity-30"
                    />

                    <p
                      className="mt-3 text-sm font-semibold"
                      style={{
                        color: mainText,
                      }}
                    >
                      سجّل دخولك عشان تشوف إشعاراتك
                    </p>

                    <p
                      className="mt-1 text-xs"
                      style={{
                        color: secondaryText,
                      }}
                    >
                      هتلاقي هنا كل جديد يخص طلباتك والورش والرسايل أول بأول
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="mt-4 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer shadow-md"
                      style={{
                        backgroundColor: '#9a6a35',
                        color: '#fff',
                      }}
                    >
                      ادخل لحسابك
                    </button>
                  </div>
                ) : userNotifications.length > 0 ? (
                  userNotifications.map(
                    (notification) => {
                      const isUnread = !notification.read && !notification.isRead;
                      return (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => handleNotificationClick(notification)}
                          className="flex w-full gap-3 border-b px-4 py-4 text-right transition-colors cursor-pointer"
                          style={{
                            borderColor,
                            backgroundColor:
                              isUnread
                                ? isDark
                                  ? 'rgba(154,106,53,0.08)'
                                  : 'rgba(154,106,53,0.05)'
                                : 'transparent',
                          }}
                        >
                          {/* ICON */}
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                            style={{
                              backgroundColor:
                                isDark
                                  ? 'rgba(154,106,53,0.16)'
                                  : 'rgba(154,106,53,0.10)',
                              color: '#9a6a35',
                            }}
                          >
                            <Bell size={16} />
                          </div>

                          {/* TEXT */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold">
                                {notification.title}
                              </p>

                              {isUnread && (
                                <span
                                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                                  style={{
                                    backgroundColor:
                                      '#9a6a35',
                                  }}
                                />
                              )}
                            </div>

                            <p
                              className="mt-1 text-[11px] leading-5"
                              style={{
                                color: secondaryText,
                              }}
                            >
                              {notification.message}
                            </p>

                            <p
                              className="mt-1 text-[10px]"
                              style={{
                                color: secondaryText,
                              }}
                            >
                              {formatRelativeTime(notification.createdAt)}
                            </p>
                          </div>
                        </button>
                      );
                    }
                  )
                ) : (
                  <div className="px-5 py-10 text-center">
                    <Bell
                      size={28}
                      className="mx-auto opacity-30"
                    />

                    <p
                      className="mt-3 text-sm font-semibold"
                      style={{
                        color: mainText,
                      }}
                    >
                      مفيش إشعارات
                    </p>

                    <p
                      className="mt-1 text-xs"
                      style={{
                        color: secondaryText,
                      }}
                    >
                      هتظهر هنا أي تحديثات جديدة لطلباتك وحسابك
                    </p>
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div
                className="border-t p-2 flex items-center gap-2"
                style={{
                  borderColor,
                }}
              >
                <button
                  type="button"
                  id="header-view-all-notifications-btn"
                  onClick={() => {
                    setOpen(false);
                    setActivePage('notifications');
                  }}
                  className="flex-1 rounded-xl py-2 text-xs font-bold text-center transition-colors cursor-pointer bg-[#9a6a35] text-white hover:bg-[#744e26]"
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
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* =========================================================
     CLOSE ACCOUNT DROPDOWN
     ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, []);

  /* =========================================================
     SEARCH FOCUS
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
     NAV LINKS
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
          label: 'التقارير',
          icon: Sparkles,
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
      },
      {
        id: 'products',
        label: 'المنتجات',
      },
      {
        id: 'categories',
        label: 'التصنيفات',
      },
      {
        id: 'map',
        label: 'محافظات الصعيد',
        isNew: true,
      },
      {
        id: 'crafts',
        label: 'الحرف',
      },
      {
        id: 'quize',
        label: 'انت صعيدى ؟',
        isNew: true,
        icon: Flame,
      },
      {
        id: 'reels',
        label: 'ريلز وه',
        isNew: true,
      },
      {
        id: 'sellers',
        label: 'البائعين',
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

    links.push({
      id: 'about',
      label: 'عن وه',
    });

    return links;
  }, [currentRole, isAuthenticated]);

  /* =========================================================
     NAVIGATE
     ========================================================= */

  const navigate = useCallback((page: string) => {
    setActivePage(page as ActivePage);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [setActivePage]);

  const getAccountPage = useCallback((): ActivePage => {
    if (currentRole === 'seller' || currentUser?.role === 'seller') {
      return 'seller-account';
    }
    if (currentRole === 'admin' || currentUser?.role === 'admin') {
      return 'admin-dashboard';
    }
    return 'buyer-account';
  }, [currentRole, currentUser?.role]);

  /* =========================================================
     USER
     ========================================================= */

  const displayName = currentUser?.name || currentUser?.username || 'حسابي';

  const profileImage =
    currentUser?.profileImage?.secureUrl ||
    (currentUser as any)?.avatar ||
    'https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png';

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
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header
        dir="rtl"
        className={`sticky top-0 z-[100] w-full overflow-visible backdrop-blur-2xl transition-colors duration-500 shadow-sm ${className}`}
        style={{
          backgroundColor: isDark ? 'rgba(11, 11, 10, 0.9)' : 'rgba(238, 232, 220, 0.9)',
          color: mainText,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        {/* ===================================================
            TOP BAR
            =================================================== */}

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
              <Sparkles size={13} className="text-[#9a6a35]" />
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

        {/* ===================================================
            MAIN ROW
            =================================================== */}

        <div className="relative mx-auto max-w-[1600px] px-3 sm:px-6 lg:px-12">
          <div className="relative flex h-16 items-center justify-between sm:h-[78px] lg:h-[94px]">

            {/* =================================================
                LEFT / START AREA (Actions & Navigation)
                ================================================= */}

            <div
              id="header-start-actions"
              className="absolute start-0 ltr:left-0 rtl:right-0 top-0 flex h-full max-w-[calc(50%-44px)] items-center px-1 sm:max-w-[calc(50%-55px)] sm:px-2.5 z-10 lg:static lg:h-auto lg:max-w-none lg:px-0 lg:z-auto"
            >
              {/* MOBILE MENU */}
              <button
                id="mobile-menu-toggle"
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="فتح القائمة"
                title="فتح القائمة"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all active:scale-95 sm:h-10 sm:w-10 lg:hidden cursor-pointer"
                style={{
                  backgroundColor: hoverBg,
                  color: mainText,
                }}
              >
                <Menu size={20} className="sm:w-[21px] sm:h-[21px]" />
              </button>

              {/* MOBILE NIGHT MODE TOGGLE */}
              <button
                id="mobile-header-theme-toggle-btn"
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
                title={isDark ? 'تفعيل الوضع الفاتح' : 'الوضع الداكن'}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 ms-1.5 sm:ms-2 lg:hidden cursor-pointer"
                style={{
                  backgroundColor: hoverBg,
                  color: mainText,
                }}
              >
                {isDark ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} />}
              </button>

              {/* MOBILE QUIZ SHORTCUT BUTTON */}
              <button
                id="mobile-header-quiz-btn"
                type="button"
                onClick={() => navigate('quize')}
                aria-label="لعبة اللهجة"
                title="تحدي كلام الصعايدة"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 ms-1.5 sm:ms-2 lg:hidden cursor-pointer relative"
                style={{
                  backgroundColor: activePage === 'quize' ? '#9a6a35' : hoverBg,
                  color: activePage === 'quize' ? '#fff' : '#b45f42',
                }}
              >
                <Flame size={18} className={activePage === 'quize' ? 'text-white' : 'text-[#b45f42] dark:text-[#e07a5f]'} />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e07a5f] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#b45f42]"></span>
                </span>
              </button>

              {/* DESKTOP NAV */}
              <div className="hidden items-center gap-6 lg:flex">
                <button
                  type="button"
                  onClick={() => navigate('home')}
                  className="whitespace-nowrap text-sm font-black transition-colors cursor-pointer"
                  style={{
                    color: activePage === 'home' ? '#9a6a35' : mainText,
                  }}
                >
                  الرئيسية
                </button>

                <button
                  type="button"
                  onClick={() => navigate('products')}
                  className="whitespace-nowrap text-sm font-black transition-colors cursor-pointer"
                  style={{
                    color: activePage === 'products' ? '#9a6a35' : mainText,
                  }}
                >
                  المنتجات
                </button>

                <button
                  type="button"
                  onClick={() => navigate('map')}
                  className="flex items-center gap-1.5 whitespace-nowrap text-sm font-black transition-colors cursor-pointer"
                  style={{
                    color: activePage === 'map' ? '#9a6a35' : mainText,
                  }}
                >
                  محافظات الصعيد
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-black"
                    style={{
                      backgroundColor: '#9a6a35',
                      color: '#fff',
                    }}
                  >
                    جديد
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('quize')}
                  className="flex items-center gap-1.5 whitespace-nowrap text-sm font-black transition-colors cursor-pointer"
                  style={{
                    color: activePage === 'quize' ? '#9a6a35' : mainText,
                  }}
                >
                  <Flame size={15} className="text-[#b45f42]" />
                  انت صعيدى؟
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-black"
                    style={{
                      backgroundColor: '#9a6a35',
                      color: '#fff',
                    }}
                  >
                    لعبة
                  </span>
                </button>
              </div>
            </div>

            {/* =================================================
                CENTER LOGO (Fixed True Horizontal Center)
                ================================================= */}

            <div
              id="header-center-logo"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-auto select-none"
            >
              <button
                id="brand-logo"
                type="button"
                onClick={() => navigate('home')}
                aria-label="وه - الرئيسية"
                className="flex items-center justify-center rounded-2xl transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer focus:outline-none"
              >
                <img
                  src="https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png"
                  alt="وه"
                  draggable={false}
                  className="block h-[42px] w-auto max-w-[84px] object-contain sm:h-[56px] sm:max-w-[110px] lg:h-[68px] lg:max-w-[140px]"
                />
              </button>
            </div>

            {/* =================================================
                RIGHT / END AREA (Action Buttons)
                ================================================= */}

            <div
              id="header-end-actions"
              className="absolute end-0 ltr:right-0 rtl:left-0 top-0 flex h-full max-w-[calc(50%-44px)] items-center justify-end px-1 sm:max-w-[calc(50%-55px)] sm:px-2 z-10 lg:static lg:h-auto lg:max-w-none lg:px-0 lg:z-auto"
            >
              <div className="flex min-w-0 items-center gap-1 sm:gap-1.5 lg:gap-2">
                {/* SEARCH */}
                <button
                  id="search-trigger-btn"
                  type="button"
                  onClick={() => setSearchOverlayOpen(true)}
                  aria-label="بحث"
                  className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 sm:h-10 sm:w-10 lg:h-11 lg:w-11 cursor-pointer"
                  style={{
                    backgroundColor: hoverBg,
                    color: mainText,
                  }}
                >
                  <Search size={18} />
                </button>

                {/* THEME (DESKTOP) */}
                <button
                  id="header-theme-toggle-btn"
                  type="button"
                  onClick={toggleTheme}
                  aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
                  className="hidden lg:flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 lg:h-11 lg:w-11 cursor-pointer"
                  style={{
                    backgroundColor: hoverBg,
                    color: mainText,
                  }}
                >
                  {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
                </button>

                {/* FAVORITES */}
                <button
                  id="nav-favorites-btn"
                  type="button"
                  onClick={() => navigate('favorites')}
                  aria-label="المفضلة"
                  className="relative hidden h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 md:flex lg:h-11 lg:w-11 cursor-pointer"
                  style={{
                    backgroundColor: hoverBg,
                    color: mainText,
                  }}
                >
                  <Heart size={18} />
                  {favorites.length > 0 && (
                    <span
                      className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold"
                      style={{
                        backgroundColor: '#9a6a35',
                        color: '#fff',
                      }}
                    >
                      {favorites.length > 99 ? '99+' : favorites.length}
                    </span>
                  )}
                </button>

                {/* CHAT */}
                {isAuthenticated && (
                  <button
                    id="nav-chat-btn"
                    type="button"
                    onClick={() => navigate('messages')}
                    aria-label="الرسائل"
                    className="relative hidden h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 lg:flex cursor-pointer"
                    style={{
                      backgroundColor: hoverBg,
                      color: mainText,
                    }}
                  >
                    <MessageCircle size={18} />
                    {chatUnreadCount > 0 && (
                      <span
                        className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold"
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

                {/* NOTIFICATIONS */}
                {isAuthenticated && (
                  <NotificationCenter
                    isDark={isDark}
                    mainText={mainText}
                    secondaryText={secondaryText}
                    borderColor={borderColor}
                    hoverBg={hoverBg}
                  />
                )}

                {/* CART */}
                <button
                  id="nav-cart-btn"
                  type="button"
                  onClick={() => setIsCartDrawerOpen(true)}
                  aria-label="السلة"
                  className="relative flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 sm:h-10 sm:w-10 lg:h-11 lg:w-11 cursor-pointer"
                  style={{
                    backgroundColor: hoverBg,
                    color: mainText,
                  }}
                >
                  <ShoppingBag size={18} />
                  {cartCount > 0 && (
                    <span
                      className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold"
                      style={{
                        backgroundColor: '#9a6a35',
                        color: '#fff',
                      }}
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>

                {/* USER */}
                {isAuthenticated ? (
                  <div ref={dropdownRef} className="relative shrink-0 flex items-center">
                    <button
                      id="user-avatar-btn"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(getAccountPage());
                      }}
                      title="الملف الشخصي"
                      aria-label="الملف الشخصي"
                      className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full p-0.5 transition-all hover:scale-105 active:scale-95 cursor-pointer sm:h-10 sm:w-10 lg:h-11 lg:w-11"
                      style={{
                        backgroundColor: hoverBg,
                        color: mainText,
                      }}
                    >
                      <img
                        src={profileImage}
                        alt={displayName}
                        className="h-7.5 w-7.5 shrink-0 rounded-full object-cover sm:h-9 sm:w-9 lg:h-10 lg:w-10"
                      />
                    </button>

                    <button
                      id="user-menu-btn"
                      type="button"
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        setUserDropdownOpen((prev) => !prev);
                      }}
                      aria-expanded={userDropdownOpen}
                      aria-haspopup="menu"
                      aria-label="قائمة الحساب"
                      className="hidden sm:flex h-10 shrink-0 items-center justify-center rounded-full p-1 transition-all hover:scale-105 active:scale-95 sm:gap-1.5 lg:h-11 cursor-pointer"
                      style={{
                        backgroundColor: hoverBg,
                        color: mainText,
                      }}
                    >
                      <span className="hidden max-w-[100px] truncate text-sm font-bold xl:block">
                        {displayName}
                      </span>
                      <ChevronDown
                        size={15}
                        className={`transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* USER DROPDOWN */}
                    <AnimatePresence>
                      {userDropdownOpen && (
                        <motion.div
                          id="user-dropdown-menu"
                          role="menu"
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ duration: 0.16 }}
                          onPointerDown={(event) => event.stopPropagation()}
                          className="absolute left-0 top-[calc(100%+10px)] z-[500] w-[270px] overflow-hidden rounded-[1.5rem] border shadow-2xl backdrop-blur-2xl"
                          style={{
                            backgroundColor: isDark
                              ? 'rgba(21, 21, 19, 0.95)'
                              : 'rgba(255, 255, 255, 0.95)',
                            borderColor,
                          }}
                        >
                          <div
                            onClick={() => navigate(getAccountPage())}
                            className="border-b p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            style={{ borderColor }}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={profileImage}
                                alt={displayName}
                                className="h-11 w-11 shrink-0 rounded-full object-cover"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold">{displayName}</p>
                                <p
                                  className="mt-0.5 text-xs font-medium"
                                  style={{ color: secondaryText }}
                                >
                                  {currentRole === 'admin'
                                    ? 'إدارة وه'
                                    : currentRole === 'seller'
                                      ? 'شيخ صنعة / بائع'
                                      : 'ابن البلد / زبون'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-2">
                            <button
                              type="button"
                              onClick={() => navigate(getAccountPage())}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                              style={{ color: mainText }}
                            >
                              <UserCircle size={18} />
                              <span>حسابي</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => navigate('messages')}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                              style={{ color: mainText }}
                            >
                              <MessageCircle size={18} />
                              <span>الرسايل</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => navigate('orders')}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                              style={{ color: mainText }}
                            >
                              <Package size={18} />
                              <span>طلباتي ومشترياتي</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => navigate('favorites')}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                              style={{ color: mainText }}
                            >
                              <Heart size={18} />
                              <span>المفضلة</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => navigate('quize')}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                              style={{ color: mainText }}
                            >
                              <Flame size={18} className="text-[#b45f42]" />
                              <span>تحدي اللهجة الصعيدية</span>
                            </button>

                            {currentRole === 'seller' && (
                              <button
                                type="button"
                                onClick={() => navigate('seller-dashboard')}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                style={{ color: mainText }}
                              >
                                <Store size={18} />
                                <span>لوحة الورشة</span>
                              </button>
                            )}

                            {currentRole === 'admin' && (
                              <button
                                type="button"
                                onClick={() => navigate('admin-dashboard')}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                style={{ color: mainText }}
                              >
                                <ShieldCheck size={18} />
                                <span>لوحة الإدارة</span>
                              </button>
                            )}

                            <div className="my-2 border-t" style={{ borderColor }} />

                            <button
                              type="button"
                              onClick={() => {
                                setUserDropdownOpen(false);
                                logout();
                              }}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold cursor-pointer transition-colors hover:bg-rose-500/10"
                              style={{ color: '#9a6a35' }}
                            >
                              <LogOut size={18} />
                              <span>اخرج من الحساب</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalTab('register');
                        setIsAuthModalOpen(true);
                      }}
                      title="اعمل حساب / ادخل لحسابك"
                      aria-label="اعمل حساب / ادخل لحسابك"
                      className="flex sm:hidden h-8.5 items-center gap-1.5 shrink-0 rounded-full px-2.5 text-xs font-bold text-white shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                      style={{ backgroundColor: '#9a6a35' }}
                    >
                      <UserPlus size={14} />
                      <span>دخول</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="hidden sm:flex h-9 lg:h-10 items-center justify-center rounded-full px-3.5 sm:px-4 text-xs sm:text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap shrink-0"
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
                      className="hidden sm:flex h-9 lg:h-10 items-center justify-center rounded-full px-3.5 sm:px-5 text-xs sm:text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
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

        {/* ===================================================
            DESKTOP NAV (SUB BAR)
            =================================================== */}

        <div
          className="hidden border-t lg:block"
          style={{
            borderColor,
          }}
        >
          <nav className="mx-auto flex h-12 max-w-[1600px] items-center justify-center gap-7 overflow-x-auto px-6 scrollbar-none">
            {roleNavLinks.map((link: any) => {
              const Icon = link.icon;

              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => navigate(link.id)}
                  className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-bold transition-colors cursor-pointer"
                  style={{
                    color: activePage === link.id ? '#9a6a35' : mainText,
                  }}
                >
                  {Icon && <Icon size={15} />}
                  <span>{link.label}</span>
                  {link.isNew && (
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                      style={{
                        backgroundColor: '#9a6a35',
                        color: '#fff',
                      }}
                    >
                      جديد
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* =====================================================
          SEARCH OVERLAY
          ===================================================== */}

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
                  <p className="text-xs font-bold" style={{ color: '#9a6a35' }}>وه</p>
                  <h2 className="mt-1 text-xl font-bold sm:text-2xl font-serif">بتدور على إيه؟</h2>
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
                      className="rounded-full border px-3.5 py-2 text-xs font-bold sm:text-sm cursor-pointer hover:border-[#9a6a35] transition-colors"
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

      {/* =====================================================
          MOBILE DRAWER
          ===================================================== */}

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
                paddingBottom: 'env(safe-area-inset-bottom)',
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
              {/* MOBILE HEADER */}
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

                <button
                  type="button"
                  onClick={() => navigate('home')}
                  className="flex items-center"
                >
                  <img
                    src="https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png"
                    alt="وه"
                    className="h-11 w-auto object-contain sm:h-12"
                  />
                </button>
              </div>

              <div className="p-4">
                {/* ACCOUNT */}
                {isAuthenticated ? (
                  <div
                    className="mb-5 rounded-[1.5rem] border p-4 shadow-sm backdrop-blur-xl"
                    style={{
                      borderColor,
                      backgroundColor: hoverBg,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={profileImage}
                        alt={displayName}
                        className="h-12 w-12 shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{displayName}</p>
                        <p
                          className="mt-1 text-xs font-bold"
                          style={{ color: secondaryText }}
                        >
                          {currentRole === 'admin'
                            ? 'إدارة وه'
                            : currentRole === 'seller'
                              ? 'حساب الورشة / بائع'
                              : 'حساب زبون'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(getAccountPage())}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity"
                      style={{
                        backgroundColor: '#9a6a35',
                        color: '#fff',
                      }}
                    >
                      <UserCircle size={17} />
                      حسابي
                    </button>
                  </div>
                ) : (
                  <div className="mb-5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="rounded-xl border py-3 text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ borderColor, color: mainText }}
                    >
                      تسجيل دخول
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setAuthModalTab('register');
                        setIsAuthModalOpen(true);
                      }}
                      className="rounded-xl py-3 text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '#9a6a35', color: '#fff' }}
                    >
                      اعمل حساب جديد
                    </button>
                  </div>
                )}

                {/* BANNER FOR QUIZ IN MOBILE MENU */}
                <div
                  onClick={() => navigate('quize')}
                  className="mb-4 flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01]"
                  style={{
                    backgroundColor: activePage === 'quize'
                      ? 'rgba(180, 95, 66, 0.15)'
                      : hoverBg,
                    borderColor: activePage === 'quize' ? '#b45f42' : borderColor,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#b45f42]/10 dark:bg-[#e07a5f]/15 flex items-center justify-center text-[#b45f42] dark:text-[#e07a5f]">
                      <Flame size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#b45f42] dark:text-[#e07a5f]">فاهم كلام الصعايدة؟</span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#b45f42] text-white">تحدي</span>
                      </div>
                      <p className="text-[11px] text-[#76675b] dark:text-[#b3a59a] mt-0.5">اختبر نفسك في 10 أسئلة صعيدية</p>
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
                        <span className="flex-1 text-sm font-bold">{link.label}</span>
                        {link.isNew && (
                          <span
                            className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                            style={{ backgroundColor: '#9a6a35', color: '#fff' }}
                          >
                            جديد
                          </span>
                        )}
                        <ArrowLeft size={15} className="opacity-40" />
                      </button>
                    );
                  })}
                </div>

                {/* MOBILE ACCOUNT SHORTCUTS */}
                {isAuthenticated && (
                  <div className="my-5 border-t pt-4" style={{ borderColor }}>
                    <p className="mb-2 px-3 text-xs font-bold" style={{ color: secondaryText }}>
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

                    {currentRole === 'seller' && (
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

                    {currentRole === 'admin' && (
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
                          style={{ backgroundColor: '#9a6a35', color: '#fff' }}
                        >
                          {favorites.length}
                        </span>
                      )}
                    </button>

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
                          style={{ backgroundColor: '#9a6a35', color: '#fff' }}
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
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">اتعرف على وه</p>
                      <p className="mt-1 text-[11px]" style={{ color: secondaryText }}>
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
                      backgroundColor: isDark ? 'rgba(154,106,53,0.10)' : 'rgba(154,106,53,0.06)',
                    }}
                  >
                    <LogOut size={17} />
                    اخرج من الحساب
                  </button>
                )}

                {/* FOOTER */}
                <div className="mt-6 border-t pt-5 text-center" style={{ borderColor }}>
                  <p className="text-[11px] font-bold" style={{ color: secondaryText }}>
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