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
        <Bell size={17} className="sm:size-[18px]" />
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
              className="absolute left-0 top-[calc(100%+8px)] z-[500] w-[300px] sm:w-[380px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[1.75rem] border shadow-2xl backdrop-blur-3xl"
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
   WAH PORTALS PREVIEW INFO
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
   HEADER COMPONENT
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

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [userDropdownOpen]);

  useEffect(() => {
    if (!searchOverlayOpen) return;
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [searchOverlayOpen]);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMobileMenuOpen(false);
      setSearchOverlayOpen(false);
      setUserDropdownOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    setActivePage('products');
    setSearchOverlayOpen(false);
  };

  const roleNavLinks = useMemo(() => {
    if (currentRole === 'seller') {
      return [
        { id: 'seller-dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
        { id: 'seller-products', label: 'منتجاتي', icon: Package },
        { id: 'seller-inventory', label: 'المخزون', icon: Store },
        { id: 'seller-orders', label: 'الطلبات', icon: ShoppingBag },
        { id: 'seller-analytics', label: 'الإحصائيات', icon: Sparkles },
        { id: 'seller-account', label: 'حسابي', icon: UserCircle },
      ];
    }

    if (currentRole === 'admin') {
      return [
        { id: 'admin-dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
        { id: 'admin-buyers', label: 'المشترين', icon: UserCircle },
        { id: 'admin-products', label: 'المنتجات', icon: Package },
        { id: 'admin-sellers', label: 'البائعين', icon: Store },
        { id: 'admin-orders', label: 'الطلبات', icon: ShoppingBag },
        { id: 'admin-reports', label: 'البلاغات والشكاوى', icon: AlertTriangle },
        { id: 'admin-audit-logs', label: 'سجل النشاط', icon: ShieldCheck },
      ];
    }

    const links: any[] = [
      { id: 'home', label: 'الرئيسية', shortLabel: 'الرئيسية' },
      { id: 'products', label: 'المنتجات', shortLabel: 'المنتجات' },
      { id: 'map', label: 'محافظات الصعيد', shortLabel: 'خريطة الصعيد', icon: Compass, isNew: true },
      { id: 'places', label: 'المعالم والآثار', shortLabel: 'المعالم والآثار', icon: Landmark },
      { id: 'people', label: 'أعلام ورموز الصعيد', shortLabel: 'أعلام الصعيد', icon: Users },
      { id: 'food', label: 'طعم الصعيد (المطبخ الأصيل)', shortLabel: 'طعم الصعيد', icon: UtensilsCrossed },
      { id: 'events', label: 'مواسم وليالي الصعيد', shortLabel: 'ليالي ومواسم', icon: Calendar },
      { id: 'reels', label: 'ريلز وه', shortLabel: 'ريلز وه', isNew: true, icon: Film },
      { id: 'sellers', label: 'شيوخ الصنعة والورش', shortLabel: 'ورش الصنعة', icon: Store },
      { id: 'categories', label: 'التصنيفات التراثية', shortLabel: 'التصنيفات', icon: Layers },
      { id: 'quize', label: 'انت صعيدى ؟ (لعبة اللهجة)', shortLabel: 'انت صعيدى؟', isNew: true, icon: Flame },
      { id: 'about', label: 'عن وه', shortLabel: 'عن وه', icon: Sparkles },
    ];

    if (isAuthenticated && currentRole === 'buyer') {
      links.push({ id: 'cart', label: 'السلة' });
      links.push({ id: 'orders', label: 'طلباتي' });
    }

    return links;
  }, [currentRole, isAuthenticated]);

  const portalLinks = useMemo(() => {
    return roleNavLinks.filter(
      (link: any) =>
        link.id !== 'home' &&
        link.id !== 'products' &&
        link.id !== 'cart' &&
        link.id !== 'orders' &&
        link.id !== 'about'
    );
  }, [roleNavLinks]);

  const splitHalf = Math.ceil(portalLinks.length / 2);
  const rightPortals = portalLinks.slice(0, splitHalf);
  const leftPortals = portalLinks.slice(splitHalf);

  const navigate = useCallback(
    (page: string) => {
      const cleanPage = page.startsWith('/') ? page.slice(1) : page;
      setActivePage(cleanPage as ActivePage);
      setMobileMenuOpen(false);
      setUserDropdownOpen(false);
    },
    [setActivePage]
  );

  const handleFavoritesClick = useCallback(() => {
    navigate('favorites');
  }, [navigate]);

  const getAccountPage = useCallback((): ActivePage => {
    if (isSeller) return 'seller-account';
    if (isAdmin) return 'admin-dashboard';
    return 'buyer-account';
  }, [isSeller, isAdmin]);

  const displayName = currentUser?.name || currentUser?.username || 'حسابي';
  const profileImage =
    currentUser?.profileImage?.secureUrl ||
    (currentUser as any)?.avatar ||
    'https://res.cloudinary.com/kuana1nl/image/upload/v1790463189/logo.png';

  const isDark = theme === 'dark';
  const mainText = isDark ? '#FFF9EE' : '#3B1E0E';
  const secondaryText = isDark ? '#D6C6B1' : '#8C6F53';
  const borderColor = isDark ? '#6B3A1F' : '#E0C79B';
  const hoverBg = isDark ? 'rgba(74, 39, 21, 0.45)' : 'rgba(248, 235, 215, 0.7)';

  /* =========================================================
     RENDER: بوابة كاملة للكمبيوتر (أيقونة + نص + بطاقة)
     ========================================================= */
  const renderDesktopPortalItem = (link: any, isLeftSide = false) => {
    const Icon = link.icon;
    const isActive = activePage === link.id;
    const isHovered = hoveredPortalId === link.id;
    const preview = WAH_PORTALS_PREVIEW[link.id];

    return (
      <div
        key={link.id}
        className="relative shrink-0"
        onMouseEnter={() => setHoveredPortalId(link.id)}
        onMouseLeave={() => setHoveredPortalId(null)}
      >
        <motion.button
          type="button"
          onClick={() => {
            navigate(link.id);
            setHoveredPortalId(null);
          }}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex items-center gap-2 rounded-full px-3.5 py-2 cursor-pointer overflow-hidden whitespace-nowrap"
          style={{
            color:
              isActive || isHovered
                ? isDark
                  ? '#C99444'
                  : '#6B3A1F'
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
                className={isActive ? (isDark ? 'text-[#C99444]' : 'text-[#6B3A1F]') : ''}
              />
            </motion.span>
          )}

          <span className="relative z-10 text-[10px] font-bold whitespace-nowrap">
            {link.shortLabel || link.label}
          </span>

          {isActive && (
            <motion.span
              layoutId={isLeftSide ? 'wah-sig-desktop-left' : 'wah-sig-desktop-right'}
              className="relative z-10 h-1 w-1 rounded-full bg-[#C99444]"
            />
          )}

          {link.isNew && (
            <motion.span
              animate={{ scale: [1, 1.35, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative z-10 h-1.5 w-1.5 rounded-full bg-[#C99444]"
            />
          )}
        </motion.button>

        {/* بطاقة الكراكتر التفاعلية للكمبيوتر */}
        <AnimatePresence>
          {isHovered && preview && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.94 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="pointer-events-none absolute top-[52px] right-1/2 translate-x-1/2 z-[500] w-[250px] overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-2xl p-4"
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
                      backgroundColor: isDark ? '#1a1816' : '#f5f0e7',
                    }}
                  >
                    <img
                      src={preview.avatar}
                      alt={preview.title}
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
                    style={{ backgroundColor: preview.accentColor }}
                  >
                    {preview.badge}
                  </span>
                  <p
                    className="text-[10px] font-bold opacity-75 mt-1"
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
  };

  /* =========================================================
     RENDER: بوابة أيقونة فقط للموبايل
     ========================================================= */
  const renderMobileIconPortalItem = (link: any) => {
    const Icon = link.icon;
    const isActive = activePage === link.id;

    return (
      <button
        key={`mob-${link.id}`}
        type="button"
        onClick={() => navigate(link.id)}
        aria-label={link.label}
        title={link.label}
        className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        style={{
          backgroundColor: isActive
            ? isDark
              ? 'rgba(201, 148, 68, 0.25)'
              : '#E0C79B'
            : isDark
              ? '#3B1E0E'
              : '#FFF9EE',
          color: isActive
            ? isDark
              ? '#C99444'
              : '#3B1E0E'
            : isDark
              ? '#D6C6B1'
              : '#8C6F53',
          border: isActive
            ? `1.5px solid ${isDark ? '#C99444' : '#6B3A1F'}`
            : `1px solid ${isDark ? 'rgba(74, 39, 21, 0.6)' : 'rgba(224, 199, 155, 0.5)'}`,
        }}
      >
        {Icon && (
          <Icon
            size={16}
            strokeWidth={isActive ? 2.5 : 1.9}
            className={isActive ? (isDark ? 'text-[#C99444]' : 'text-[#6B3A1F]') : ''}
          />
        )}

        {link.isNew && (
          <span
            className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: '#E66A2E' }}
          />
        )}
      </button>
    );
  };

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
        {/* =========================================================
            1. TOP BAR (البار العلوي الرفيع)
            ========================================================= */}
        <div className="hidden lg:block border-b" style={{ borderColor }}>
          <div className="mx-auto flex h-9 max-w-[1600px] items-center justify-between px-6 lg:px-12">
            <div
              className="flex items-center gap-2 text-xs font-bold"
              style={{ color: secondaryText }}
            >
              <Sparkles size={13} className="text-primary" />
              <span className="truncate">من قلب الصعيد... حكاية بتبدأ</span>
            </div>

            <div
              className="flex items-center gap-5 text-xs font-bold"
              style={{ color: secondaryText }}
            >
              <span>أصالة</span>
              <span>•</span>
              <span>حرفة</span>
              <span>•</span>
              <span>حكاية</span>
            </div>
          </div>
        </div>

        {/* =========================================================
            2. DESKTOP MAIN ROW (نظام الكمبيوتر الأصلي المتوازن)
            ========================================================= */}
        <div className="hidden lg:flex relative mx-auto max-w-[1600px] h-[94px] items-center justify-between px-12">
          {/* Start Actions / Nav Links */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => navigate('home')}
              className="whitespace-nowrap text-sm font-black transition-colors cursor-pointer"
              style={{
                color: activePage === 'home' ? (isDark ? '#C99444' : '#6B3A1F') : mainText,
              }}
            >
              الرئيسية
            </button>

            <button
              type="button"
              onClick={() => navigate('products')}
              className="whitespace-nowrap text-sm font-black transition-colors cursor-pointer"
              style={{
                color: activePage === 'products' ? (isDark ? '#C99444' : '#6B3A1F') : mainText,
              }}
            >
              المنتجات
            </button>

            <button
              type="button"
              onClick={() => navigate('map')}
              className="flex items-center gap-1.5 whitespace-nowrap text-sm font-black transition-colors cursor-pointer"
              style={{
                color: activePage === 'map' ? (isDark ? '#C99444' : '#6B3A1F') : mainText,
              }}
            >
              محافظات الصعيد
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-black"
                style={{
                  backgroundColor: '#E66A2E',
                  color: '#FFF9EE',
                }}
              >
                جديد
              </span>
            </button>
          </div>

          {/* End Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOverlayOpen(true)}
              aria-label="بحث"
              title="بحث"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer"
              style={{ backgroundColor: hoverBg, color: mainText }}
            >
              <Search size={18} />
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="المظهر"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer"
              style={{ backgroundColor: hoverBg, color: mainText }}
            >
              {isDark ? <Sun size={18} className="text-primary-hover" /> : <Moon size={18} />}
            </button>

            {!isStaff && (
              <button
                type="button"
                onClick={handleFavoritesClick}
                aria-label="المفضلة"
                title="المفضلة"
                className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer"
                style={{ backgroundColor: hoverBg, color: mainText }}
              >
                <Heart size={18} />
                {favorites.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold bg-[#E66A2E] text-white">
                    {favorites.length > 99 ? '99+' : favorites.length}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated && (
              <button
                type="button"
                onClick={() => navigate('messages')}
                aria-label="الرسائل"
                className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer"
                style={{ backgroundColor: hoverBg, color: mainText }}
              >
                <MessageCircle size={18} />
                {chatUnreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold bg-[#E66A2E] text-white">
                    {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated && (
              <NotificationCenter
                isDark={isDark}
                mainText={mainText}
                secondaryText={secondaryText}
                borderColor={borderColor}
                hoverBg={hoverBg}
              />
            )}

            {!isStaff && (
              <button
                type="button"
                onClick={() => setIsCartDrawerOpen(true)}
                aria-label="السلة"
                className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer"
                style={{ backgroundColor: hoverBg, color: mainText }}
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold bg-[#E66A2E] text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated ? (
              <div ref={dropdownRef} className="relative flex shrink-0 items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserDropdownOpen((prev) => !prev);
                  }}
                  className="flex items-center gap-2.5 rounded-full border p-1 pe-3.5 ps-1 transition-all cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95"
                  style={{
                    backgroundColor: userDropdownOpen ? (isDark ? 'rgba(201,148,68,0.2)' : 'rgba(201,148,68,0.12)') : hoverBg,
                    borderColor: userDropdownOpen ? '#C99444' : borderColor,
                    color: mainText,
                  }}
                >
                  <img src={profileImage} alt={displayName} className="h-9.5 w-9.5 rounded-full object-cover ring-2 ring-primary/40" />
                  <div className="flex flex-col text-right leading-tight">
                    <span className="max-w-[110px] truncate text-sm font-black">{displayName}</span>
                    <span className="text-[10px] font-semibold opacity-70" style={{ color: secondaryText }}>
                      {currentRole === 'admin' ? 'الإدارة' : isSeller ? 'صاحب ورشة' : 'حسابي'}
                    </span>
                  </div>
                  <ChevronDown size={15} className={`text-primary transition-transform duration-300 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.96 }}
                      className="absolute left-0 top-[calc(100%+10px)] z-[500] w-[280px] rounded-[1.75rem] border shadow-2xl backdrop-blur-3xl overflow-hidden p-2"
                      style={{
                        backgroundColor: isDark ? 'rgba(21, 21, 19, 0.97)' : 'rgba(255, 255, 255, 0.98)',
                        borderColor,
                        color: mainText,
                      }}
                    >
                      <div
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate(getAccountPage());
                        }}
                        className="flex items-center gap-3.5 p-3.5 rounded-xl cursor-pointer hover:bg-primary/5 border-b"
                        style={{ borderColor }}
                      >
                        <img src={profileImage} alt={displayName} className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/30" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black">{displayName}</p>
                          <p className="text-xs font-semibold opacity-70" style={{ color: secondaryText }}>
                            {currentRole === 'admin' ? 'إدارة وه' : isSeller ? 'شيخ صنعة / بائع' : 'ابن البلد / زبون'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-0.5 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            navigate(getAccountPage());
                          }}
                          className="flex w-full items-center gap-3 px-3.5 py-2 text-sm font-bold rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary"
                        >
                          <UserCircle size={18} className="text-primary" />
                          <span>حسابي</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-3 px-3.5 py-2 text-sm font-bold text-rose-500 rounded-xl cursor-pointer hover:bg-rose-500/10"
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPostLoginRedirect(activePage !== 'home' ? activePage : null);
                    setAuthModalTab('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="flex h-10 items-center justify-center rounded-full px-4 text-sm font-bold border cursor-pointer hover:opacity-80"
                  style={{ color: mainText, borderColor }}
                >
                  ادخل لحسابك
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPostLoginRedirect(activePage !== 'home' ? activePage : null);
                    setAuthModalTab('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="flex h-10 items-center justify-center rounded-full px-5 text-sm font-bold cursor-pointer text-white bg-primary hover:opacity-90"
                >
                  اعمل حساب جديد
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================
            3. MOBILE MAIN ROW (يمين وشمال + اللوجو المتدلي في المنتصف)
            ========================================================= */}
        <div className="flex lg:hidden relative mx-auto max-w-[1600px] h-18 sm:h-22 items-center justify-between px-3 sm:px-6 overflow-visible">
          {/* الجانب الأيمن */}
          <div className="flex items-center gap-1.5 z-20">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="القائمة"
              title="القائمة"
              className="flex h-8.5 w-8.5 items-center justify-center rounded-full cursor-pointer active:scale-95"
              style={{ backgroundColor: hoverBg, color: mainText }}
            >
              <Menu size={16} className="text-primary-hover" />
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-full cursor-pointer active:scale-95"
              style={{ backgroundColor: hoverBg, color: mainText }}
            >
              {isDark ? <Sun size={16} className="text-primary-hover" /> : <Moon size={16} />}
            </button>
          </div>

          {/* اللوجو المتدلي الواصل للـ Sub Bar في الموبايل */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-auto select-none">
            <button
              type="button"
              onClick={() => navigate('home')}
              className="group flex flex-col items-center justify-center focus:outline-none cursor-pointer transition-transform active:scale-95"
            >
              <img
                src="https://res.cloudinary.com/kuana1nl/image/upload/v1790463189/logo.png"
                alt="وه"
                draggable={false}
                className="
    block
    h-28 w-auto max-w-[180px] translate-y-6
    xs:h-24 xs:max-w-[210px] xs:translate-y-7
    sm:h-26 sm:max-w-[250px] sm:translate-y-8
    object-contain
    transition-all duration-300
    group-hover:scale-105
    drop-shadow-md
  "
              />
            </button>
          </div>

          {/* الجانب الأيسر */}
          <div className="flex items-center gap-1 sm:gap-1.5 z-20">
            <button
              type="button"
              onClick={handleFavoritesClick}
              aria-label="المفضلة"
              title="المفضلة"
              className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full cursor-pointer active:scale-95"
              style={{ backgroundColor: hoverBg, color: mainText }}
            >
              <Heart size={16} />
              {favorites.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[8px] font-bold bg-[#E66A2E] text-white">
                  {favorites.length > 99 ? '99+' : favorites.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="hidden xs:flex h-8.5 w-8.5 items-center justify-center rounded-full cursor-pointer active:scale-95"
              style={{ backgroundColor: hoverBg, color: mainText }}
            >
              {isDark ? <Sun size={16} className="text-primary-hover" /> : <Moon size={16} />}
            </button>

            {!isStaff && (
              <button
                type="button"
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full cursor-pointer active:scale-95"
                style={{ backgroundColor: hoverBg, color: mainText }}
              >
                <ShoppingBag size={16} />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[8px] font-bold bg-[#E66A2E] text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate(getAccountPage())}
                className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-primary/40 overflow-hidden cursor-pointer active:scale-95"
              >
                <img src={profileImage} alt={displayName} className="h-full w-full object-cover" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setPostLoginRedirect(activePage !== 'home' ? activePage : null);
                  setAuthModalTab('login');
                  setIsAuthModalOpen(true);
                }}
                className="flex h-8 items-center justify-center rounded-full px-3 text-xs font-bold text-white bg-primary cursor-pointer active:scale-95"
              >
                دخول
              </button>
            )}
          </div>
        </div>

        {/* =========================================================
            4. DESKTOP SIGNATURE BAR (البار التراثي الأصلي للكمبيوتر باللوجو المتدلي القديم)
            ========================================================= */}
        <div className="hidden lg:block relative z-[90] select-none" onMouseLeave={() => setHoveredPortalId(null)}>
          <div
            className="relative border-t border-b overflow-visible"
            style={{
              borderColor: isDark ? 'rgba(107, 58, 31, 0.3)' : 'rgba(224, 199, 155, 0.4)',
              backgroundColor: isDark ? '#1B1009' : '#FFF9EE',
            }}
          >
            <div
              className="absolute left-1/2 top-0 h-px w-40 -translate-x-1/2"
              style={{ background: 'linear-gradient(90deg, transparent, #C99444, transparent)' }}
            />

            <div className="mx-auto flex h-[68px] max-w-[1450px] items-center px-8 overflow-visible">
              {/* الجانب الأيمن من البوابات بالكمبيوتر */}
              <div className="flex flex-1 items-center justify-end gap-1">
                {rightPortals.map((link) => renderDesktopPortalItem(link, false))}
              </div>

              {/* لوجو الكمبيوتر المتدلي الأصلي بتأثيره القديم */}
              <div className="relative mx-4 shrink-0 flex items-center justify-center select-none overflow-visible">
                <motion.button
                  type="button"
                  onClick={() => navigate('home')}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="group relative z-30 flex flex-col items-center justify-center -translate-y-12 bg-transparent border-0 p-0 cursor-pointer focus:outline-none overflow-visible"
                >
                  <img
                    src="https://res.cloudinary.com/kuana1nl/image/upload/v1790463189/logo.png"
                    alt="وه"
                    draggable={false}
                    className="block h-50 w-auto max-w-[280px] object-contain transition-transform duration-300 group-hover:scale-103"
                  />
                </motion.button>
              </div>

              {/* الجانب الأيسر من البوابات بالكمبيوتر */}
              <div className="flex flex-1 items-center justify-start gap-1">
                {leftPortals.map((link) => renderDesktopPortalItem(link, true))}

                {/* عن وه */}
                <div
                  className="relative"
                  onMouseEnter={() => setHoveredPortalId('about')}
                  onMouseLeave={() => setHoveredPortalId(null)}
                >
                  <motion.button
                    type="button"
                    onClick={() => {
                      navigate('about');
                      setHoveredPortalId(null);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.94 }}
                    className="relative ml-2 flex items-center gap-1.5 rounded-full px-3 py-2 border cursor-pointer whitespace-nowrap"
                    style={{
                      color: '#C99444',
                      borderColor: 'rgba(154,106,53,0.20)',
                      backgroundColor: isDark ? 'rgba(201,148,68,0.06)' : 'rgba(154,106,53,0.05)',
                    }}
                  >
                    <Sparkles size={12} />
                    <span className="text-[10px] font-black">عن وَه</span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* خط الشيمر المستمر للكمبيوتر */}
            <div className="relative left-1/2 h-px w-screen -translate-x-1/2 overflow-hidden pointer-events-none">
              <div className="absolute inset-0" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
              <motion.div
                initial={{ left: '-320px' }}
                animate={{ left: '100%' }}
                transition={{ duration: 6, repeat: Infinity, repeatType: 'loop', ease: 'linear' }}
                className="absolute top-0 h-full w-80"
                style={{ background: 'linear-gradient(90deg, transparent 0%, #C99444 50%, transparent 100%)' }}
              />
            </div>
          </div>
        </div>

        {/* =========================================================
            5. MOBILE SUB BAR (أيقونات فقط + لون مختلف مستوحى من Tokens)
            ========================================================= */}
        <div className="block lg:hidden relative border-t select-none" style={{ borderColor }}>
          <div
            className="flex h-11 sm:h-12 items-center justify-between px-3 sm:px-6 relative overflow-visible shadow-xs backdrop-blur-md"
            style={{
              backgroundColor: isDark ? '#26160D' : '#F8EBD7',
              borderBottom: `1px solid ${isDark ? 'rgba(201, 148, 68, 0.25)' : '#E0C79B'}`,
            }}
          >
            {/* يمين: نصف الأيقونات */}
            <div className="flex flex-1 items-center justify-end gap-1.5 overflow-x-auto no-scrollbar py-1">
              {rightPortals.map((link) => renderMobileIconPortalItem(link))}
            </div>

            {/* مساحة فارغة في المركز محجوزة للوجو المتدلي */}
            <div className="w-24 xs:w-28 sm:w-36 shrink-0 pointer-events-none" />

            {/* شمال: باقي الأيقونات + عن وه */}
            <div className="flex flex-1 items-center justify-start gap-1.5 overflow-x-auto no-scrollbar py-1">
              {leftPortals.map((link) => renderMobileIconPortalItem(link))}

              <button
                type="button"
                onClick={() => navigate('about')}
                aria-label="عن وه"
                className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer border"
                style={{
                  color: '#C99444',
                  borderColor: isDark ? 'rgba(201,148,68,0.4)' : '#E0C79B',
                  backgroundColor: isDark ? 'rgba(201,148,68,0.15)' : 'rgba(255, 249, 238, 0.85)',
                }}
              >
                <Sparkles size={14} />
              </button>
            </div>
          </div>

          {/* خط الشيمر للموبايل */}
          <div className="relative h-px w-full overflow-hidden pointer-events-none">
            <motion.div
              initial={{ left: '-300px' }}
              animate={{ left: '100%' }}
              transition={{ duration: 5, repeat: Infinity, repeatType: 'loop', ease: 'linear' }}
              className="absolute top-0 h-full w-60"
              style={{ background: 'linear-gradient(90deg, transparent 0%, #C99444 50%, transparent 100%)' }}
            />
          </div>
        </div>
      </header>

      {/* =========================================================
          SEARCH OVERLAY
          ========================================================= */}
      <AnimatePresence>
        {searchOverlayOpen && (
          <motion.div
            className="fixed inset-0 z-[600] flex items-start justify-center overflow-y-auto px-4 pt-16 sm:pt-24 backdrop-blur-md"
            style={{
              backgroundColor: isDark ? 'rgba(27, 16, 9, 0.92)' : 'rgba(255, 249, 238, 0.92)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-[650px]"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold" style={{ color: '#C99444' }}>
                    منصة وه
                  </p>
                  <h2 className="mt-1 text-xl font-bold font-serif">بتدور على إيه؟</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchOverlayOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full cursor-pointer"
                  style={{ backgroundColor: hoverBg, color: mainText }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit}>
                <div
                  className="flex items-center gap-3 rounded-2xl border px-4 shadow-xl"
                  style={{
                    backgroundColor: isDark ? 'rgba(59, 30, 14, 0.95)' : 'rgba(248, 235, 215, 0.95)',
                    borderColor,
                  }}
                >
                  <Search size={18} style={{ color: secondaryText }} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن منتج، ورشة، مكان..."
                    className="h-12 min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:opacity-60"
                    style={{ color: mainText }}
                  />
                  <button
                    type="submit"
                    className="rounded-xl px-3 py-1.5 text-xs font-bold text-white cursor-pointer bg-primary"
                  >
                    دوّر
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          MOBILE SLIDE DRAWER
          ========================================================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[700] bg-black/50 backdrop-blur-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.aside
              dir="rtl"
              className="fixed bottom-0 right-0 top-0 z-[710] w-[85vw] max-w-[340px] overflow-y-auto shadow-2xl p-4"
              style={{
                backgroundColor: isDark ? '#1B1009' : '#FFF9EE',
                color: mainText,
              }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between border-b pb-4 mb-4" style={{ borderColor }}>
                <img
                  src="https://res.cloudinary.com/kuana1nl/image/upload/v1790463189/logo.png"
                  alt="وه"
                  className="h-12 w-auto"
                />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full cursor-pointer"
                  style={{ backgroundColor: hoverBg, color: mainText }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-1">
                {roleNavLinks.map((link: any) => {
                  const Icon = link.icon;
                  const isActive = activePage === link.id;

                  return (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => navigate(link.id)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right font-bold text-xs sm:text-sm cursor-pointer transition-colors"
                      style={{
                        backgroundColor: isActive
                          ? isDark
                            ? 'rgba(201,148,68,0.2)'
                            : 'rgba(201,148,68,0.1)'
                          : 'transparent',
                        color: isActive ? (isDark ? '#C99444' : '#6B3A1F') : mainText,
                      }}
                    >
                      {Icon && <Icon size={17} />}
                      <span className="flex-1">{link.label}</span>
                      {link.isNew && (
                        <span className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-[#E66A2E] text-white">
                          جديد
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer border border-rose-500/20"
                >
                  <LogOut size={16} />
                  <span>اخرج من الحساب</span>
                </button>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;