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
import { FavoritesPage } from '../pages/FavoritesPage';

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
        className="relative flex h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer"
        style={{
          backgroundColor: open ? '#E66A2E' : hoverBg,
          color: open ? '#fff' : mainText,
        }}
      >
        <Bell size={16} className="sm:size-[18px]" />
        {displayCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 sm:h-4 sm:min-w-4 items-center justify-center rounded-full px-1 text-[8px] sm:text-[9px] font-bold"
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

              <div className="max-h-[360px] overflow-y-auto">
                {isGuest ? (
                  <div className="px-5 py-8 text-center">
                    <Bell size={26} className="mx-auto opacity-30" />
                    <p
                      className="mt-2 text-xs sm:text-sm font-semibold"
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
                        className="flex w-full gap-3 border-b px-4 py-3.5 text-right transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
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
                          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: isDark
                              ? 'rgba(201,148,68,0.18)'
                              : 'rgba(201,148,68,0.10)',
                            color: '#C99444',
                          }}
                        >
                          <Bell size={14} />
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
                  <div className="px-5 py-8 text-center">
                    <Bell size={26} className="mx-auto opacity-30" />
                    <p
                      className="mt-2 text-xs sm:text-sm font-semibold"
                      style={{ color: mainText }}
                    >
                      مفيش إشعارات
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
      setActivePage(page as ActivePage);
      setMobileMenuOpen(false);
      setUserDropdownOpen(false);
    },
    [setActivePage]
  );

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

  // مكون الأيقونة فقط لشريط الـ Sub Bar
  const renderIconOnlyPortalItem = (link: any) => {
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
        <button
          type="button"
          onClick={() => {
            navigate(link.id);
            setHoveredPortalId(null);
          }}
          aria-label={link.label}
          title={link.label}
          className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 cursor-pointer"
          style={{
            backgroundColor: isActive
              ? isDark
                ? 'rgba(201,148,68,0.22)'
                : 'rgba(107,58,31,0.12)'
              : hoverBg,
            color: isActive ? (isDark ? '#C99444' : '#6B3A1F') : secondaryText,
            border: isActive
              ? `1.5px solid ${isDark ? '#C99444' : '#6B3A1F'}`
              : '1px solid transparent',
          }}
        >
          {Icon && (
            <Icon
              size={15}
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

        {/* كارت المعاينة عند الهوفر */}
        <AnimatePresence>
          {isHovered && preview && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.94 }}
              transition={{ duration: 0.16 }}
              className="pointer-events-none absolute top-[44px] right-1/2 translate-x-1/2 z-[550] w-[220px] rounded-2xl border shadow-xl backdrop-blur-2xl p-3"
              style={{
                backgroundColor: isDark
                  ? 'rgba(59, 30, 14, 0.98)'
                  : 'rgba(248, 235, 215, 0.98)',
                borderColor: isDark
                  ? 'rgba(107, 58, 31, 0.4)'
                  : 'rgba(224, 199, 155, 0.4)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={preview.avatar}
                  alt={preview.title}
                  className="h-10 w-10 rounded-full object-cover border p-0.5"
                  style={{ borderColor: preview.accentColor }}
                />
                <div className="min-w-0 flex-1 text-right">
                  <span
                    className="inline-block rounded-full px-2 py-0.2 text-[8px] font-black text-white"
                    style={{ backgroundColor: preview.accentColor }}
                  >
                    {preview.badge}
                  </span>
                  <p className="text-xs font-bold truncate mt-0.5" style={{ color: mainText }}>
                    {preview.title}
                  </p>
                </div>
              </div>
              <p
                className="mt-2 text-[10px] leading-relaxed text-right line-clamp-2"
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

  return (
    <>
      <header
        dir="rtl"
        className={`sticky top-0 z-[100] w-full overflow-visible backdrop-blur-2xl transition-colors duration-500 shadow-sm ${className}`}
        style={{
          backgroundColor: isDark
            ? 'rgba(27, 16, 9, 0.96)'
            : 'rgba(255, 249, 238, 0.96)',
          color: mainText,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >

        {/* =========================================================
            2. MAIN HEADER ROW
            عناصر اليمين واليسار + اللوجو المتدلي في المنتصف واصل للـ Sub Bar
            ========================================================= */}
        <div className="relative mx-auto max-w-[1600px] px-3 sm:px-6 lg:px-12 overflow-visible">
          <div className="relative flex h-16 sm:h-20 items-center justify-between overflow-visible">
            {/* ----------------- الجانب الأيمن (Right Actions) ----------------- */}
            <div className="flex items-center gap-1.5 sm:gap-3 z-20">
              <button
                type="button"
                id="header-menu-btn"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="القائمة"
                title="القائمة"
                className="flex items-center gap-1.5 h-8.5 px-2.5 sm:px-3.5 sm:h-9.5 rounded-full transition-all active:scale-95 cursor-pointer text-xs font-bold"
                style={{
                  backgroundColor: hoverBg,
                  color: mainText,
                }}
              >
                <Menu size={17} />
                <span className="hidden xs:inline">القائمة</span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label="تبديل الوضع"
                className="flex items-center gap-1.5 h-8.5 px-2.5 sm:px-3.5 sm:h-9.5 rounded-full transition-all active:scale-95 cursor-pointer text-xs font-bold"
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

              <div className="hidden lg:flex items-center gap-4 mr-2">
                <button
                  type="button"
                  onClick={() => navigate('home')}
                  className="whitespace-nowrap text-xs font-black transition-colors cursor-pointer"
                  style={{
                    color: activePage === 'home' ? (isDark ? '#C99444' : '#6B3A1F') : mainText,
                  }}
                >
                  الرئيسية
                </button>
                <button
                  type="button"
                  onClick={() => navigate('products')}
                  className="whitespace-nowrap text-xs font-black transition-colors cursor-pointer"
                  style={{
                    color: activePage === 'products' ? (isDark ? '#C99444' : '#6B3A1F') : mainText,
                  }}
                >
                  المنتجات
                </button>
              </div>
            </div>

            {/* ----------------- اللوجو البطل المتدلي للـ Sub Bar (Centerpiece Hero) ----------------- */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-auto select-none">
              <button
                type="button"
                onClick={() => navigate('home')}
                aria-label="منصة وه - الرئيسية"
                title="منصة وه - الرئيسية"
                className="group flex flex-col items-center justify-center focus:outline-none cursor-pointer transition-transform duration-300 active:scale-95"
              >
                <img
                  src="https://res.cloudinary.com/kuana1nl/image/upload/v1790463189/logo.png"
                  alt="وه"
                  draggable={false}
                  className="
    block
    h-25 w-auto max-w-[190px] translate-y-6
    xs:h-24 xs:max-w-[220px] xs:translate-y-7
    sm:h-28 sm:max-w-[270px] sm:translate-y-8
    lg:h-32 lg:max-w-[320px] lg:translate-y-10
    object-contain
    transition-all duration-300
    group-hover:scale-105
    drop-shadow-md
  "
                />
              </button>
            </div>

            {/* ----------------- الجانب الأيسر (Left Actions) ----------------- */}
            <div className="flex items-center gap-1 sm:gap-2 z-20">
              <button
                type="button"
                onClick={() => setSearchOverlayOpen(true)}
                aria-label="بحث"
                title="بحث"
                className="flex h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: hoverBg,
                  color: mainText,
                }}
              >
                <Search size={16} />
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label="تبديل الوضع"
                className="hidden xs:flex h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer"
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
                  onClick={() => navigate('favorites')}
                  aria-label="الحاجات اللي عجبتك"
                  title="الحاجات اللي عجبتك"
                  className="relative flex h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: hoverBg,
                    color: mainText,
                  }}
                >
                  <Heart size={16} />
                  {cartCount > 0 && (
                    <span
                      className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 sm:h-4 sm:min-w-4 items-center justify-center rounded-full px-1 text-[8px] sm:text-[9px] font-bold"
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

              {isAuthenticated ? (
                <div ref={dropdownRef} className="relative flex shrink-0 items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserDropdownOpen((prev) => !prev);
                    }}
                    className="flex h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-full border border-primary/40 overflow-hidden cursor-pointer transition-transform active:scale-95"
                  >
                    <img
                      src={profileImage}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute left-0 top-[calc(100%+8px)] z-[500] w-[250px] rounded-2xl border shadow-2xl backdrop-blur-3xl overflow-hidden p-2"
                        style={{
                          backgroundColor: isDark
                            ? 'rgba(21, 21, 19, 0.98)'
                            : 'rgba(255, 255, 255, 0.98)',
                          borderColor,
                          color: mainText,
                        }}
                      >
                        <div
                          onClick={() => {
                            setUserDropdownOpen(false);
                            navigate(getAccountPage());
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          <img
                            src={profileImage}
                            alt={displayName}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate">{displayName}</p>
                            <p className="text-[10px] opacity-70" style={{ color: secondaryText }}>
                              {currentRole === 'admin'
                                ? 'الإدارة'
                                : isSeller
                                  ? 'صاحب ورشة'
                                  : 'حسابي'}
                            </p>
                          </div>
                        </div>

                        <div className="my-1 border-t" style={{ borderColor }} />

                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            navigate(getAccountPage());
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          <UserCircle size={15} />
                          <span>حسابي</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-rose-500 rounded-lg cursor-pointer hover:bg-rose-500/10"
                        >
                          <LogOut size={15} />
                          <span>خروج</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPostLoginRedirect(activePage !== 'home' ? activePage : null);
                    setAuthModalTab('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="flex h-8 sm:h-8.5 items-center justify-center rounded-full px-2.5 sm:px-3.5 text-xs font-bold cursor-pointer transition-all active:scale-95"
                  style={{
                    backgroundColor: '#6B3A1F',
                    color: '#FFF9EE',
                  }}
                >
                  دخول
                </button>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================
            3. SUB BAR (أيقونات فقط يمين وشمال، والنص مفرغ للوجو)
            ========================================================= */}
        {/* =========================================================
            3. SUB BAR (أيقونات فقط من نظام ألوان وَه الرسمي)
            ========================================================= */}
        <div
          className="relative border-t select-none"
          style={{ borderColor: isDark ? '#4A2715' : '#E0C79B' }}
        >
          <div
            className="flex h-11 sm:h-12 items-center justify-between px-3 sm:px-6 lg:px-12 relative overflow-visible shadow-xs backdrop-blur-md"
            style={{
              /* ألوان مستخرجة مباشرة من Wah Design Tokens */
              backgroundColor: isDark
                ? '#26160D' // wahDark.surface (السطح الداكن الثانوي المميز عن خلفية الهيدر الأساسي #1B1009)
                : '#F8EBD7', // wah.cream (لون الكروت والأسطح الفرعية المنفصل عن خلفية #FFF9EE)
              borderBottom: `1px solid ${isDark ? 'rgba(201, 148, 68, 0.25)' : '#E0C79B'}`,
            }}
          >
            {/* الجانب الأيمن من الأيقونات */}
            <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
              {rightPortals.map((link) => renderIconOnlyPortalItem(link))}
            </div>

            {/* مساحة وسطية فارغة محجوزة تماماً للوجو المتدلي */}
            <div className="w-24 xs:w-28 sm:w-36 lg:w-44 shrink-0 pointer-events-none" />

            {/* الجانب الأيسر من الأيقونات */}
            <div className="flex flex-1 items-center justify-start gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
              {leftPortals.map((link) => renderIconOnlyPortalItem(link))}

              {/* أيقونة عن وه - مأخوذة من لون wah.gold */}
              <button
                type="button"
                onClick={() => navigate('about')}
                aria-label="عن وه"
                title="عن وه"
                className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 cursor-pointer border shadow-xs"
                style={{
                  color: '#C99444', // wah.gold
                  borderColor: isDark ? 'rgba(201, 148, 68, 0.4)' : '#E0C79B', // wah.beige
                  backgroundColor: isDark
                    ? 'rgba(201, 148, 68, 0.15)' // gold.light
                    : 'rgba(255, 249, 238, 0.85)', // wah.background
                }}
              >
                <Sparkles size={14} />
              </button>
            </div>
          </div>

          {/* خط الشيمر الذهبي المستمر (wah.gold) */}
          <div className="relative h-px w-full overflow-hidden pointer-events-none">
            <motion.div
              initial={{ left: '-300px' }}
              animate={{ left: '100%' }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear',
              }}
              className="absolute top-0 h-full w-60"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, #C99444 50%, transparent 100%)',
              }}
            />
          </div>
        </div>        </header>

      {/* =========================================================
          SEARCH OVERLAY
          ========================================================= */}
      <AnimatePresence>
        {searchOverlayOpen && (
          <motion.div
            className="fixed inset-0 z-[600] flex items-start justify-center overflow-y-auto px-4 pt-16 sm:pt-24 backdrop-blur-md"
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
                    backgroundColor: isDark
                      ? 'rgba(59, 30, 14, 0.95)'
                      : 'rgba(248, 235, 215, 0.95)',
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
                    className="rounded-xl px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
                    style={{ backgroundColor: '#6B3A1F' }}
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

              {/* الروابط الأساسية بالقائمة مع نصوصها */}
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