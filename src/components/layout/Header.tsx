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
  ClipboardList,
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
  Headphones,
  User,
  HomeIcon,
  ChevronLeft,
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
    <div className="relative z-[600] shrink-0">      <button
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
              className="absolute left-0 top-[calc(100%+8px)] z-[700] w-[300px] sm:w-[380px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[1.75rem] border shadow-2xl backdrop-blur-3xl" style={{
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
    unreadNotificationsCount,
    openReportModal,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileCategory, setActiveMobileCategory] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [hoveredPortalId, setHoveredPortalId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentRole === 'admin' || currentUser?.role === 'admin';
  const isSeller = currentRole === 'seller' || currentUser?.role === 'seller';
  const isStaff = isSeller || isAdmin;

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
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
      setIsProfileMenuOpen(false);
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
    if (isSeller) {
      return [
        { id: 'seller-dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
        { id: 'seller-products', label: 'منتجاتي', icon: Package },
        { id: 'seller-inventory', label: 'المخزون', icon: Store },
        { id: 'seller-orders', label: 'الطلبات', icon: ClipboardList },
        { id: 'seller-analytics', label: 'الإحصائيات', icon: Sparkles },
        { id: 'buyer-account', label: 'الملف الشخصي', icon: UserCircle },
      ];
    }

    if (isAdmin) {
      return [
        { id: 'admin-dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
        { id: 'admin-buyers', label: 'المشترين', icon: UserCircle },
        { id: 'admin-products', label: 'المنتجات', icon: Package },
        { id: 'admin-sellers', label: 'البائعين', icon: Store },
        { id: 'admin-orders', label: 'الطلبات', icon: ClipboardList },
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
      { id: 'help', label: 'مضايفة وه (المساعدة والتواصل)', shortLabel: 'المساعدة', icon: Headphones },
    ];

    if (isAuthenticated && currentRole === 'buyer') {
      links.push({ id: 'cart', label: 'السلة' });
      links.push({ id: 'orders', label: 'طلباتي' });
    }

    return links;
  }, [currentRole, isAuthenticated, isSeller, isAdmin]);
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
  const mobileNavCategories = useMemo(() => {
    const categories = isSeller
      ? [
        {
          id: 'seller-main',
          title: 'إدارة الورشة',
          description: 'لوحة التحكم وإعدادات الورشة',
          icon: Store,
          items: ['seller-dashboard', 'buyer-account'],
        },
        {
          id: 'seller-products',
          title: 'المنتجات والمخزون',
          description: 'إدارة منتجاتك ومتابعة المخزون',
          icon: Package,
          items: ['seller-products', 'seller-inventory'],
        },
        {
          id: 'seller-orders',
          title: 'الطلبات والأداء',
          description: 'الطلبات والإحصائيات',
          icon: ClipboardList,
          items: ['seller-orders', 'seller-analytics'],
        },
      ]
      : isAdmin
        ? [
          {
            id: 'admin-main',
            title: 'الإدارة الرئيسية',
            description: 'لوحة التحكم والمستخدمون',
            icon: LayoutDashboard,
            items: ['admin-dashboard', 'admin-buyers'],
          },
          {
            id: 'admin-market',
            title: 'إدارة السوق',
            description: 'المنتجات والبائعون والطلبات',
            icon: Store,
            items: ['admin-products', 'admin-sellers', 'admin-orders'],
          },
          {
            id: 'admin-system',
            title: 'إدارة النظام',
            description: 'البلاغات وسجل النشاط',
            icon: ShieldCheck,
            items: ['admin-reports', 'admin-audit-logs'],
          },
        ]
        : [
          {
            id: 'main',
            title: 'الرئيسية والسوق',
            description: 'ابدأ رحلتك في منصة وَه',
            icon: HomeIcon,
            items: ['home', 'products', 'cart', 'orders'],
          },
          {
            id: 'discover',
            title: 'اكتشف الصعيد',
            description: 'المحافظات والأماكن والشخصيات',
            icon: Compass,
            items: ['map', 'places', 'people'],
          },
          {
            id: 'heritage',
            title: 'تراث وحكايات الصعيد',
            description: 'الأكل والمواسم والحكايات',
            icon: Landmark,
            items: ['food', 'events', 'reels'],
          },
          {
            id: 'wah-market',
            title: 'سوق وَه',
            description: 'الحرفيون والمنتجات التراثية',
            icon: ShoppingBag,
            items: ['sellers', 'categories'],
          },
          {
            id: 'about',
            title: 'عن وَه والمساعدة',
            description: 'تعرف على وَه وتواصل معنا',
            icon: Headphones,
            items: ['quize', 'about', 'help'],
          },
        ];

    return categories
      .map((category) => ({
        ...category,
        links: roleNavLinks.filter((link: any) =>
          category.items.includes(link.id)
        ),
      }))
      .filter((category) => category.links.length > 0);
  }, [roleNavLinks, isSeller, isAdmin]);
  const splitHalf = Math.ceil(portalLinks.length / 2);
  const rightPortals = portalLinks.slice(0, splitHalf);
  const leftPortals = portalLinks.slice(splitHalf);

  const navigate = useCallback(
    (page: string) => {
      const cleanPage = page.startsWith('/') ? page.slice(1) : page;
      setActivePage(cleanPage as ActivePage);
      setMobileMenuOpen(false);
      setUserDropdownOpen(false);
      setIsProfileMenuOpen(false);
    },
    [setActivePage]
  );

  const handleFavoritesClick = useCallback(() => {
    navigate('favorites');
  }, [navigate]);

  const getAccountPage = useCallback((): ActivePage => {
    return 'buyer-account';
  }, []);

  const profileMenuItems = useMemo(() => {
    if (isAdmin) {
      return [
        {
          id: 'admin-dashboard',
          label: 'لوحة التحكم العامة',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: 'admin-products',
          label: 'إدارة المنتجات',
          icon: Package,
          badge: null,
        },
        {
          id: 'admin-sellers',
          label: 'إدارة الورش والبائعين',
          icon: Store,
          badge: null,
        },
        {
          id: 'admin-buyers',
          label: 'إدارة المستخدمين',
          icon: Users,
          badge: null,
        },
        {
          id: 'admin-orders',
          label: 'إدارة الطلبات',
          icon: ClipboardList,
          badge: null,
        },
        {
          id: 'admin-categories',
          label: 'التصنيفات التراثية',
          icon: Layers,
          badge: null,
        },
        {
          id: 'admin-reports',
          label: 'البلاغات والشكاوى',
          icon: AlertTriangle,
          badge: null,
        },
        {
          id: 'admin-audit-logs',
          label: 'سجل النشاط',
          icon: ShieldCheck,
          badge: null,
        },
        {
          id: 'notifications',
          label: 'مركز الإشعارات',
          icon: Bell,
          badge: unreadNotificationsCount > 0 ? (unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount) : null,
        },
        {
          id: 'buyer-account',
          label: 'الملف الشخصي',
          icon: UserCircle,
          badge: null,
        },
      ];
    }

    if (isSeller) {
      return [
        {
          id: 'seller-dashboard',
          label: 'لوحة تحكم الورشة',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: 'seller-products',
          label: 'منتجات الورشة',
          icon: Package,
          badge: null,
        },
        {
          id: 'seller-orders',
          label: 'طلبات الورشة',
          icon: ClipboardList,
          badge: null,
        },
        {
          id: 'seller-inventory',
          label: 'المخزون',
          icon: Store,
          badge: null,
        },
        {
          id: 'seller-analytics',
          label: 'الأرباح والإحصائيات',
          icon: Sparkles,
          badge: null,
        },
        {
          id: 'messages',
          label: 'الدعم الفنى',
          icon: MessageCircle,
          badge: chatUnreadCount > 0 ? (chatUnreadCount > 99 ? '99+' : chatUnreadCount) : null,
        },
        {
          id: 'notifications',
          label: 'الإشعارات',
          icon: Bell,
          badge: unreadNotificationsCount > 0 ? (unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount) : null,
        },
        {
          id: 'buyer-account',
          label: 'الملف الشخصي',
          icon: UserCircle,
          badge: null,
        },
      ];
    }

    // Buyer / Regular User
    return [
      {
        id: 'buyer-account',
        label: 'الملف الشخصي',
        icon: UserCircle,
        badge: null,
      },
      {
        id: 'orders',
        label: 'طلباتي',
        icon: ClipboardList,
        badge: null,
      },
      {
        id: 'favorites',
        label: 'المفضلة',
        icon: Heart,
        badge: favorites.length > 0 ? (favorites.length > 99 ? '99+' : favorites.length) : null,
      },
      {
        id: 'messages',
        label: ' الدعم الفنى',
        icon: MessageCircle,
        badge: chatUnreadCount > 0 ? (chatUnreadCount > 99 ? '99+' : chatUnreadCount) : null,
      },
      {
        id: 'notifications',
        label: 'الإشعارات',
        icon: Bell,
        badge: unreadNotificationsCount > 0 ? (unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount) : null,
      },
    ];
  }, [isAdmin, isSeller, unreadNotificationsCount, chatUnreadCount, favorites.length]);

  const handleProfileItemClick = useCallback(
    (pageId: string) => {
      setIsProfileMenuOpen(false);
      setUserDropdownOpen(false);
      navigate(pageId);
    },
    [navigate]
  );

  const displayName = currentUser?.name || currentUser?.username || 'حسابي';
  const profileImage =
    currentUser?.profileImage?.secureUrl ||
    (currentUser as any)?.avatar ||
    'https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png';

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
          className="group relative flex items-center gap-1 xl:gap-2 rounded-full px-2 xl:px-3.5 py-1.5 xl:py-2 cursor-pointer overflow-hidden whitespace-nowrap"
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
                size={13}
                strokeWidth={isActive ? 2.4 : 1.8}
                className={`xl:size-[14px] ${isActive ? (isDark ? 'text-[#C99444]' : 'text-[#6B3A1F]') : ''}`}
              />
            </motion.span>
          )}

          <span className="relative z-10 text-[9px] xl:text-[10px] font-bold whitespace-nowrap">
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
                <div className="relative z-[600] shrink-0">                  <div
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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
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

                      <div className="space-y-0.5 pt-2 max-h-[60vh] overflow-y-auto">
                        {profileMenuItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = activePage === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleProfileItemClick(item.id)}
                              className="flex w-full items-center justify-between px-3.5 py-2 text-sm font-bold rounded-xl cursor-pointer transition-colors"
                              style={{
                                backgroundColor: isActive
                                  ? (isDark ? 'rgba(201,148,68,0.2)' : 'rgba(201,148,68,0.1)')
                                  : 'transparent',
                                color: isActive ? (isDark ? '#C99444' : '#6B3A1F') : mainText,
                              }}
                              onMouseEnter={(e) => {
                                if (!isActive) e.currentTarget.style.backgroundColor = hoverBg;
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <Icon size={18} className={isActive ? 'text-primary' : ''} />
                                <span>{item.label}</span>
                              </div>
                              {item.badge && (
                                <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold bg-[#E66A2E] text-white">
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}

                        <div className="pt-1 mt-1 border-t" style={{ borderColor }}>
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              setIsProfileMenuOpen(false);
                              logout();
                            }}
                            className="flex w-full items-center gap-3 px-3.5 py-2 text-sm font-bold text-rose-500 rounded-xl cursor-pointer hover:bg-rose-500/10 transition-colors"
                          >
                            <LogOut size={18} />
                            <span>اخرج من الحساب</span>
                          </button>
                        </div>
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
        <div className="flex lg:hidden relative mx-auto max-w-[1600px] h-28 sm:h-36 items-center justify-between px-3 sm:px-6 overflow-visible mt-2">
          {/* الجانب الأيمن: القائمة والبحث */}
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
              aria-label="تغيير المظهر"
              title="تغيير المظهر"
              className="flex h-8.5 w-8.5 items-center justify-center rounded-full cursor-pointer transition-transform active:scale-95"
              style={{ backgroundColor: hoverBg, color: mainText }}
            >
              {isDark ? <Sun size={16} className="text-primary-hover" /> : <Moon size={16} />}
            </button>

            <button
              type="button"
              onClick={() => setSearchOverlayOpen(true)}
              aria-label="البحث"
              title="البحث"
              className="flex h-8.5 w-8.5 items-center justify-center rounded-full cursor-pointer active:scale-95"
              style={{ backgroundColor: hoverBg, color: mainText }}
            >
              <Search size={16} />
            </button>

          </div>

          {/* اللوجو في منتصف الهيدر تماماً وبنفس المساحة */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto select-none">
            <button
              type="button"
              onClick={() => navigate('home')}
              className="group flex flex-col items-center justify-center focus:outline-none cursor-pointer transition-transform active:scale-95"
            >
              <img
                src="https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png"
                alt="وه"
                draggable={false}
                className="
                  block
                  h-24 w-auto max-w-[150px]
                  xs:h-28 xs:max-w-[190px]
                  sm:h-32 sm:max-w-[230px]
                  object-contain
                  transition-all duration-300
                  group-hover:scale-105
                  drop-shadow-md
                "
              />
            </button>
          </div>

          {/* الجانب الأيسر: المظهر والمفضلة والسلة والحساب */}
          <div className="relative flex items-center gap-1 sm:gap-1.5 z-50">
            {!isStaff && (
              <button
                type="button"
                onClick={handleFavoritesClick}
                aria-label="المفضلة"
                title="المفضلة"
                className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full cursor-pointer transition-transform active:scale-95"
                style={{ backgroundColor: hoverBg, color: mainText }}
              >
                <Heart size={16} />

                {favorites.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[8px] font-bold bg-[#E66A2E] text-white">
                    {favorites.length > 99 ? '99+' : favorites.length}
                  </span>
                )}
              </button>
            )}
            {/* المستخدم المسجل */}
            {isAuthenticated ? (
              <>
                {/* الإشعارات */}
                <NotificationCenter
                  isDark={isDark}
                  mainText={mainText}
                  secondaryText={secondaryText}
                  borderColor={borderColor}
                  hoverBg={hoverBg}
                />

                {/* صورة الحساب + القائمة */}
                <div ref={profileMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    aria-label="قائمة الحساب"
                    title="قائمة الحساب"
                    className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-primary/40 overflow-hidden cursor-pointer transition-transform active:scale-95"
                  >
                    <img
                      src={profileImage}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  </button>

                  {isProfileMenuOpen && (
                    <div
                      className="absolute ltr:right-0 rtl:left-0 top-full mt-2 w-60 sm:w-64 max-h-[75vh] flex flex-col overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-md z-[999] animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200"
                      style={{
                        backgroundColor: isDark ? 'rgba(36, 26, 21, 0.96)' : 'rgba(255, 249, 240, 0.96)',
                        borderColor: borderColor,
                        color: mainText,
                      }}
                    >
                      {/* بيانات المستخدم */}
                      <div
                        className="px-4 py-3 border-b"
                        style={{ borderColor: borderColor }}
                      >
                        <p className="text-sm font-bold truncate">
                          {displayName}
                        </p>

                        <p
                          className="mt-0.5 text-[11px] truncate"
                          style={{ color: secondaryText }}
                        >
                          {isAdmin
                            ? 'مدير النظام'
                            : isSeller
                              ? 'بائع'
                              : 'مشتري'}
                        </p>
                      </div>

                      {/* قائمة الصفحات المخصصة للصلاحيات */}
                      <div className="space-y-0.5 py-1.5 overflow-y-auto max-h-[55vh]">
                        {profileMenuItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = activePage === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleProfileItemClick(item.id)}
                              className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
                              style={{
                                backgroundColor: isActive
                                  ? (isDark ? 'rgba(201,148,68,0.2)' : 'rgba(201,148,68,0.1)')
                                  : 'transparent',
                                color: isActive ? (isDark ? '#C99444' : '#6B3A1F') : mainText,
                              }}
                              onMouseEnter={(e) => {
                                if (!isActive) e.currentTarget.style.backgroundColor = hoverBg;
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <Icon size={17} className={isActive ? 'text-primary' : ''} />
                                <span>{item.label}</span>
                              </div>
                              {item.badge && (
                                <span className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold bg-[#E66A2E] text-white">
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}

                        {/* تسجيل الخروج */}
                        <div className="pt-1 mt-1 border-t" style={{ borderColor: borderColor }}>
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              setUserDropdownOpen(false);
                              logout();
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 transition-colors cursor-pointer hover:bg-rose-500/10"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = hoverBg;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <LogOut size={17} />
                            <span>تسجيل الخروج</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* الزائر */
              <button
                type="button"
                onClick={() => {
                  setPostLoginRedirect(activePage !== 'home' ? activePage : null);
                  setAuthModalTab('login');
                  setIsAuthModalOpen(true);
                }}
                aria-label="دخول"
                className="flex h-8 items-center justify-center rounded-full px-3 text-xs font-bold text-white bg-primary cursor-pointer transition-transform active:scale-95"
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

            <div className="mx-auto flex h-[68px] max-w-[1600px] items-center px-3 xl:px-8 overflow-visible">
              {/* الجانب الأيمن من البوابات بالكمبيوتر */}
              <div className="flex flex-1 items-center justify-end gap-1">
                {rightPortals.map((link) => renderDesktopPortalItem(link, false))}
              </div>

              {/* لوجو الكمبيوتر المتدلي الأصلي بتأثيره القديم */}
              <div className="relative mx-2 xl:mx-4 shrink-0 flex items-center justify-center select-none overflow-visible">
                <motion.button
                  type="button"
                  onClick={() => navigate('home')}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="group relative z-30 flex flex-col items-center justify-center -translate-y-8 xl:-translate-y-12 bg-transparent border-0 p-0 cursor-pointer focus:outline-none overflow-visible"
                >
                  <img
                    src="https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png"
                    alt="وه"
                    draggable={false}
                    className="block h-36 xl:h-48 w-auto max-w-[200px] xl:max-w-[260px] object-contain transition-transform duration-300 group-hover:scale-103"
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
                  <h2 className="mt-1 text-xl font-bold font-main">بتدور على إيه؟</h2>
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
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-[700] bg-black/60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Drawer */}
            <motion.aside
              dir="rtl"
              className="fixed bottom-0 right-0 top-0 z-[710] flex w-[90vw] max-w-[390px] flex-col overflow-hidden shadow-2xl"
              style={{
                backgroundColor: isDark ? '#1B1009' : '#FAF7F0',
                color: mainText,
                borderLeft: `1px solid ${borderColor}`,
              }}
              initial={{ x: '100%', opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            >
              {/* Decorative Background */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                style={{
                  backgroundImage: `
              repeating-linear-gradient(
                45deg,
                #C99444 0px,
                #C99444 1px,
                transparent 1px,
                transparent 14px
              )
            `,
                }}
              />

              {/* Header */}
              <div
                className="relative shrink-0 overflow-hidden px-5 pb-5 pt-6"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #3B1E0E 0%, #241309 60%, #1B1009 100%)'
                    : 'linear-gradient(135deg, #6B3A1F 0%, #3B1E0E 100%)',
                }}
              >
                {/* Decorative Circles */}
                <div className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full border border-[#C99444]/20" />
                <div className="pointer-events-none absolute -left-6 -top-6 h-28 w-28 rounded-full border border-[#C99444]/15" />
                <div className="pointer-events-none absolute -bottom-16 right-20 h-36 w-36 rounded-full bg-[#C99444]/10 blur-2xl" />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#C99444]/30 bg-white/10 p-1.5 backdrop-blur-sm">
                      <img
                        src="https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png"
                        alt="وه"
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div>
                      <p className="text-lg font-black tracking-wide text-[#FAF7F0]">
                        أهلاً بيك في وَه
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-[#E8D6B5]/75">
                        من قلب الصعيد... حكاية بتبدأ
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="إغلاق القائمة"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-all hover:rotate-90 hover:bg-white/20 active:scale-90"
                  >
                    <X size={19} />
                  </button>
                </div>

                {/* Brand Bottom */}
                <div className="relative mt-5 flex items-center gap-2">
                  <span className="h-px flex-1 bg-gradient-to-l from-[#C99444]/60 to-transparent" />
                  <span className="text-[9px] font-bold tracking-[0.2em] text-[#C99444]">
                    العالم الرقمي لصعيد مصر
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-[#C99444]/60 to-transparent" />
                </div>
              </div>

              {/* User Card */}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(getAccountPage());
                  }}
                  className="relative mx-4 mt-4 flex shrink-0 items-center gap-3 overflow-hidden rounded-2xl border p-3 text-right transition-all active:scale-[0.98]"
                  style={{
                    borderColor: isDark
                      ? 'rgba(201,148,68,0.3)'
                      : 'rgba(107,58,31,0.15)',
                    backgroundColor: isDark
                      ? 'rgba(201,148,68,0.08)'
                      : 'rgba(201,148,68,0.08)',
                  }}
                >
                  <div className="absolute bottom-0 right-0 top-0 w-1 bg-[#C99444]" />

                  <img
                    src={profileImage}
                    alt={displayName}
                    className="h-12 w-12 rounded-xl border-2 border-[#C99444]/50 object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{displayName}</p>

                    <p
                      className="mt-1 text-[10px] font-semibold"
                      style={{ color: secondaryText }}
                    >
                      {isAdmin
                        ? 'مدير النظام'
                        : isSeller
                          ? 'صاحب ورشة'
                          : 'عضو في مجتمع وَه'}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C99444]/15 text-[#C99444]">
                    <UserCircle size={19} />
                  </div>
                </button>
              )}

              {/* Navigation Content */}
              <div className="relative flex-1 overflow-y-auto px-4 pb-5 pt-5">
                {/* Section Title */}
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="h-5 w-1 rounded-full bg-[#C99444]" />
                      <h3 className="text-sm font-black">اكتشف وَه</h3>
                    </div>

                    <p
                      className="mr-3 text-[10px]"
                      style={{ color: secondaryText }}
                    >
                      كل حكايات الصعيد في مكان واحد
                    </p>
                  </div>

                  <span
                    className="rounded-lg px-3 py-1.5 text-[10px] font-black"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(201,148,68,0.13)'
                        : 'rgba(201,148,68,0.15)',
                      color: '#C99444',
                    }}
                  >
                    {mobileNavCategories.length} أقسام
                  </span>
                </div>

                {/* Categories Grid with In-line Expansion */}
                <div className="flex flex-col gap-3">
                  {mobileNavCategories.map((category, index) => {
                    const CategoryIcon = category.icon;
                    const isOpen = activeMobileCategory === category.id;
                    const hasActivePage = category.links.some(
                      (link: any) => activePage === link.id
                    );

                    return (
                      <div key={category.id} className="flex flex-col gap-2">
                        {/* Category Card Button */}
                        <motion.button
                          type="button"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.25,
                            delay: index * 0.035,
                          }}
                          onClick={() => {
                            setActiveMobileCategory(
                              isOpen ? null : category.id
                            );
                          }}
                          aria-expanded={isOpen}
                          className="group relative flex min-h-[110px] w-full flex-col items-start overflow-hidden rounded-2xl border p-3.5 text-right transition-all duration-300 active:scale-[0.97]"
                          style={{
                            borderColor: hasActivePage || isOpen
                              ? '#C99444'
                              : borderColor,

                            backgroundColor: isOpen
                              ? isDark
                                ? 'rgba(201,148,68,0.14)'
                                : 'rgba(201,148,68,0.12)'
                              : isDark
                                ? 'rgba(255,255,255,0.035)'
                                : '#FFFFFF',
                          }}
                        >
                          {/* Decorative Shape */}
                          <div
                            className="pointer-events-none absolute -left-5 -top-5 h-20 w-20 rounded-full transition-transform duration-500 group-hover:scale-150"
                            style={{
                              backgroundColor: isOpen
                                ? 'rgba(201,148,68,0.13)'
                                : isDark
                                  ? 'rgba(201,148,68,0.045)'
                                  : 'rgba(201,148,68,0.06)',
                            }}
                          />

                          {/* Icon */}
                          <div
                            className="relative mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300"
                            style={{
                              backgroundColor: hasActivePage || isOpen
                                ? '#C99444'
                                : isDark
                                  ? 'rgba(201,148,68,0.12)'
                                  : 'rgba(201,148,68,0.13)',

                              color: hasActivePage || isOpen
                                ? '#241309'
                                : '#C99444',
                            }}
                          >
                            <CategoryIcon size={20} />
                          </div>

                          {/* Text */}
                          <div className="relative w-full">
                            <p className="text-xs font-black leading-relaxed">
                              {category.title}
                            </p>

                            <p
                              className="mt-1 text-[9px] font-medium"
                              style={{ color: secondaryText }}
                            >
                              {category.links.length} روابط
                            </p>
                          </div>

                          {/* Bottom Indicator */}
                          <div className="absolute bottom-3 left-3 flex items-center gap-1">
                            <motion.span
                              animate={{ rotate: isOpen ? -90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronLeft
                                size={15}
                                style={{
                                  color: hasActivePage || isOpen
                                    ? '#C99444'
                                    : secondaryText,
                                }}
                              />
                            </motion.span>
                          </div>

                          {hasActivePage && (
                            <span className="absolute left-3 top-3 h-2 w-2 rounded-full bg-[#C99444] shadow-[0_0_8px_#C99444]" />
                          )}
                        </motion.button>

                        {/* In-line Links Drawer (Appears right below this specific card) */}
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, y: -8 }}
                              animate={{ opacity: 1, height: 'auto', y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -8 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div
                                className="space-y-1.5 rounded-2xl border p-2 shadow-inner"
                                style={{
                                  borderColor: '#C99444',
                                  backgroundColor: isDark
                                    ? 'rgba(201,148,68,0.06)'
                                    : 'rgba(201,148,68,0.04)',
                                }}
                              >
                                {category.links.map((link: any, linkIndex: number) => {
                                  const Icon = link.icon;
                                  const isActive = activePage === link.id;

                                  return (
                                    <motion.button
                                      key={link.id}
                                      type="button"
                                      initial={{ opacity: 0, x: 8 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{
                                        duration: 0.18,
                                        delay: linkIndex * 0.03,
                                      }}
                                      onClick={() => navigate(link.id)}
                                      className="flex w-full items-center gap-3 rounded-xl p-2.5 text-right transition-all active:scale-[0.98]"
                                      style={{
                                        backgroundColor: isActive
                                          ? isDark
                                            ? 'rgba(201,148,68,0.2)'
                                            : 'rgba(201,148,68,0.15)'
                                          : 'transparent',

                                        color: isActive
                                          ? '#C99444'
                                          : mainText,
                                      }}
                                    >
                                      <div
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                        style={{
                                          backgroundColor: isActive
                                            ? 'rgba(201,148,68,0.2)'
                                            : hoverBg,
                                          color: isActive
                                            ? '#C99444'
                                            : secondaryText,
                                        }}
                                      >
                                        {Icon ? (
                                          <Icon size={16} />
                                        ) : (
                                          <Sparkles size={16} />
                                        )}
                                      </div>

                                      <span className="flex-1 text-xs font-bold">
                                        {link.label}
                                      </span>

                                      {link.isNew && (
                                        <span className="rounded-full bg-[#E66A2E] px-2 py-0.5 text-[8px] font-bold text-white">
                                          جديد
                                        </span>
                                      )}

                                      {isActive && (
                                        <span className="h-2 w-2 rounded-full bg-[#C99444]" />
                                      )}
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Small Brand Note */}
                <div
                  className="mt-6 flex items-center gap-3 rounded-xl border p-3"
                  style={{
                    borderColor,
                    backgroundColor: isDark
                      ? 'rgba(201,148,68,0.045)'
                      : 'rgba(201,148,68,0.06)',
                  }}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C99444]/15 text-[#C99444]">
                    <Sparkles size={18} />
                  </div>

                  <div>
                    <p className="text-[10px] font-black">
                      الصعيد حكاية تستاهل تتحكي
                    </p>

                    <p
                      className="mt-1 text-[9px]"
                      style={{ color: secondaryText }}
                    >
                      اكتشف تراثنا، ناسنا، وأماكننا
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                className="relative shrink-0 border-t p-4"
                style={{
                  borderColor,
                  backgroundColor: isDark ? '#170D07' : '#F3EBDD',
                }}
              >
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsProfileMenuOpen(false);
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 py-3.5 text-xs font-black text-rose-500 transition-all hover:bg-rose-500/10 active:scale-[0.98]"
                  >
                    <LogOut size={17} />
                    <span>تسجيل الخروج</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setPostLoginRedirect(
                        activePage !== 'home' ? activePage : null
                      );
                      setAuthModalTab('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B3A1F] py-3.5 text-xs font-black text-white shadow-lg shadow-[#6B3A1F]/15 transition-all hover:bg-[#3B1E0E] active:scale-[0.98]"
                  >
                    <User size={17} />
                    <span>تسجيل الدخول</span>
                  </button>
                )}

                <p
                  className="mt-3 text-center text-[9px] font-bold tracking-wide"
                  style={{ color: secondaryText }}
                >
                  وَه — العالم الرقمي لصعيد مصر
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>    </>
  );
};

export default Header;