import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationCenter } from '../common/NotificationCenter';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  User,
  ShieldAlert,
  Store,
  Sparkles,
  ChevronDown,
  Film,
  LogOut,
  PackageCheck,
  Compass,
  Info,
  Layers,
  ArrowRight,
  ArrowLeft,
  LogIn,
  UserPlus,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Header: React.FC = () => {
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
    toggleTheme
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus mobile search input when opened
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
    }
  }, [mobileSearchOpen]);

  // Lock body scroll when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActivePage('products');
      setMobileSearchOpen(false);
    }
  };

  // Navigation links tailored per authenticated role
  const roleNavLinks = React.useMemo(() => {
    if (isAuthenticated && currentRole === 'seller') {
      return [
        { id: 'seller-dashboard', label: 'لوحة التحكم' },
        { id: 'seller-products', label: 'منتجات الورشة' },
        { id: 'seller-inventory', label: 'إدارة المخزون' },
        { id: 'seller-orders', label: 'طلبات الورشة' },
        { id: 'seller-analytics', label: 'المبيعات' },
        { id: 'seller-account', label: 'إعدادات الحساب' }
      ];
    }
    if (isAuthenticated && currentRole === 'admin') {
      return [
        { id: 'admin-dashboard', label: 'لوحة الإدارة' },
        { id: 'admin-buyers', label: 'المستخدمون' },
        { id: 'admin-products', label: 'إدارة المنتجات' },
        { id: 'admin-sellers', label: 'الورش والحرفيون' },
        { id: 'admin-orders', label: 'إدارة الطلبات' },
        { id: 'admin-reports', label: 'التقارير' },
        { id: 'admin-audit-logs', label: 'سجل الرقابة' }
      ];
    }
    return [
      { id: 'home', label: 'الرئيسية' },
      { id: 'products', label: 'كافة المنتجات' },
      { id: 'categories', label: 'التصنيفات التراثية' },
      { id: 'crafts', label: 'حكايات الحرف' },
      { id: 'reels', label: 'فيديوهات الحرف', isNew: true },
      { id: 'sellers', label: 'الورش والحرفيون' },
      ...(isAuthenticated && currentRole === 'buyer'
        ? [
          { id: 'cart', label: 'سلة المشتريات' },
          { id: 'orders', label: 'طلباتي' }
        ]
        : [{ id: 'about', label: 'عن سوق الصعيد' }])
    ];
  }, [isAuthenticated, currentRole]);

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 dark:bg-[#1A1614]/95 backdrop-blur-md border-b border-[#E8E1D9] dark:border-[#382E27] shadow-xs transition-colors duration-200">
      {/* Top Heritage Notice Bar */}
      <div className="bg-[#B45F42] text-[#FDFBF7] text-[11px] sm:text-xs md:text-sm py-1.5 sm:py-2 px-3 sm:px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
            {/* Seamless Moving Marquee Ticker */}
            <div className="overflow-hidden whitespace-nowrap flex-1 min-w-0" dir="ltr">
              <div className="animate-marquee cursor-default select-none flex">
                <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 shrink-0" dir="rtl">
                  <span className="font-medium">
                    شحن مباشر ومضمون من ورش الصعيد في قنا وسوهاج وأسوان وأسيوط لباب بيتك
                  </span>
                  <span className="text-amber-300/80 text-xs">✦</span>
                  <span className="font-medium text-amber-100/90 hidden xs:inline">
                    دعم مباشر لأكثر من 15 ورشة وحرفي مصري أصيل
                  </span>
                  <span className="text-amber-300/80 text-xs hidden xs:inline">✦</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 shrink-0" dir="rtl" aria-hidden="true">
                  <span className="font-medium">
                    شحن مباشر ومضمون من ورش الصعيد في قنا وسوهاج وأسوان وأسيوط لباب بيتك
                  </span>
                  <span className="text-amber-300/80 text-xs">✦</span>
                  <span className="font-medium text-amber-100/90 hidden xs:inline">
                    دعم مباشر لأكثر من 15 ورشة وحرفي مصري أصيل
                  </span>
                  <span className="text-amber-300/80 text-xs hidden xs:inline">✦</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 lg:gap-4 text-xs font-medium shrink-0">
            <button
              type="button"
              id="header-play-intro-btn"
              onClick={() => setShowIntroVideo(true)}
              className="flex items-center gap-1.5 hover:text-amber-200 transition-colors cursor-pointer"
              aria-label="شاهد وثائقي الصعيد وفنون الحرف اليدوية"
            >
              <Film className="w-3.5 h-3.5" />
              <span>شاهد وثائقي الصعيد</span>
            </button>
            <span className="text-white/30">|</span>
            <button
              type="button"
              id="header-theme-toggle-top"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 hover:text-amber-200 transition-colors cursor-pointer text-xs"
              aria-label={theme === 'dark' ? 'التحويل إلى الوضع المضيء النهاري' : 'التحويل إلى الوضع الداكن الليلي'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span>الوضع المضيء</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-200" />
                  <span>الوضع الداكن</span>
                </>
              )}
            </button>
            <span className="text-white/30 hidden lg:inline">|</span>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-amber-100/90">محافظات الصعيد:</span>
              <span className="font-bold">أسوان • الأقصر • قنا • سوهاج • أسيوط</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20 gap-2 sm:gap-4 lg:gap-6">
          {/* Logo Section */}
          <div
            id="brand-logo"
            role="button"
            tabIndex={0}
            aria-label="سوق الصعيد - العودة إلى الصفحة الرئيسية"
            onClick={() => setActivePage('home')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActivePage('home');
              }
            }}
            className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 cursor-pointer group shrink-0 select-none"
          >
            <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center group-hover:scale-105 shrink-0 transition-transform duration-200">
              <img
                src="https://res.cloudinary.com/kuana1nl/image/upload/v1787864171/elsa3ed_market2.png"
                alt="شعار سوق الصعيد"
                className="w-full h-full object-contain drop-shadow-xs"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-lg sm:text-2xl lg:text-3xl font-black text-[#2D2A26] dark:text-[#FAF6F2] font-heritage tracking-tight leading-none">
                سوق الصعيد
              </span>
              <span className="hidden sm:block text-[10px] sm:text-xs text-[#7A6F64] dark:text-[#A89C90] font-medium tracking-wide mt-1">
                أصالة الحرف والخيرات التراثية
              </span>
            </div>
          </div>

          {/* Search Input (Desktop & Tablets >= lg) */}
          <div className="hidden lg:flex flex-1 max-w-sm xl:max-w-md 2xl:max-w-lg mx-2 xl:mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full" role="search">
              <input
                type="text"
                id="desktop-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن: فخار قنا، كليم أخميم، عسل سدر..."
                aria-label="البحث في سوق الصعيد"
                className="w-full bg-[#F3EFE9] dark:bg-[#25201D] hover:bg-[#EDE7DF] dark:hover:bg-[#2D2723] focus:bg-white dark:focus:bg-[#1E1917] text-xs sm:text-sm text-[#2D2A26] dark:text-[#FAF6F2] placeholder:text-[#8C7E72] dark:placeholder:text-[#7A6F64] rounded-xl pl-10 pr-4 py-2 sm:py-2.5 border border-[#E8E1D9] dark:border-[#382E27] focus:border-[#B45F42] focus:ring-2 focus:ring-[#B45F42]/20 outline-none transition-all"
              />
              <button
                type="submit"
                id="desktop-search-btn"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 p-2 text-[#B45F42] hover:text-[#9E4F36] rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors cursor-pointer"
                aria-label="تنفيذ البحث"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Action Controls Area */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-2.5 shrink-0">
            {/* Mobile/Tablet Search Toggle (< lg) */}
            <button
              type="button"
              id="mobile-search-toggle"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className={`lg:hidden p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center ${mobileSearchOpen
                ? 'bg-[#B45F42] text-white'
                : 'text-[#2D2A26] dark:text-[#FAF6F2] hover:bg-[#F3EFE9] dark:hover:bg-[#25201D] border border-transparent hover:border-[#E8E1D9] dark:hover:border-[#382E27]'
                }`}
              aria-label={mobileSearchOpen ? 'إغلاق شريط البحث' : 'فتح شريط البحث'}
            >
              {mobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            {/* Theme Toggle Button (Light/Dark Mode) */}
            <button
              type="button"
              id="header-theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 text-[#2D2A26] dark:text-[#FAF6F2] hover:bg-[#F3EFE9] dark:hover:bg-[#25201D] rounded-xl transition-all flex items-center justify-center cursor-pointer border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px]"
              title={theme === 'dark' ? 'التبديل إلى الوضع النهاري المضيء' : 'التبديل إلى الوضع الليلي الداكن'}
              aria-label={theme === 'dark' ? 'التبديل إلى الوضع النهاري المضيء' : 'التبديل إلى الوضع الليلي الداكن'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-spin-slow transition-transform hover:rotate-90" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-[#7A6F64] hover:text-[#B45F42] transition-colors" />
              )}
            </button>

            {/* Notification Center (Active for Seller, Admin and logged-in Buyers) */}
            {isAuthenticated && (
              <NotificationCenter />
            )}

            {/* Favorites Icon (Buyers and Guests only - Hidden for Seller & Admin) */}
            {(currentRole === 'buyer' || !isAuthenticated) && (
              <button
                type="button"
                id="nav-favorites-btn"
                onClick={() => setActivePage('favorites')}
                className="relative p-2 sm:p-2.5 text-[#2D2A26] dark:text-[#FAF6F2] hover:bg-[#F3EFE9] dark:hover:bg-[#25201D] rounded-xl transition-colors hidden sm:flex items-center justify-center cursor-pointer border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] min-h-[44px] min-w-[44px]"
                title="المفضلة"
                aria-label={`قائمة المفضلة، ${favorites.length} عناصر محفوظة`}
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#7A6F64] dark:text-[#A89C90] hover:text-[#B45F42]" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#B45F42] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {favorites.length}
                  </span>
                )}
              </button>
            )}

            {/* Shopping Cart Button (Buyers and Guests only - Hidden for Seller & Admin) */}
            {(currentRole === 'buyer' || !isAuthenticated) && (
              <button
                type="button"
                id="nav-cart-btn"
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white rounded-xl shadow-xs transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] cursor-pointer"
                aria-label={`سلة المشتريات، ${cartCount} عناصر مضافة`}
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-bold hidden md:inline">السلة</span>
                {cartCount > 0 && (
                  <span className="bg-amber-300 text-[#2D2A26] text-[11px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-full min-w-[18px] sm:min-w-[20px] text-center leading-none">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Authentication States */}
            {!isAuthenticated ? (
              /* GUEST: Show responsive Login & Register buttons */
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  id="header-login-btn"
                  onClick={() => {

                    setAuthModalTab('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-2.5 sm:px-3.5 md:px-4 py-2 sm:py-2.5 bg-white dark:bg-[#25201D] hover:bg-[#F3EFE9] dark:hover:bg-[#2D2723] text-[#2D2A26] dark:text-[#FAF6F2] border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] text-xs sm:text-sm font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 sm:gap-2 min-h-[40px] sm:min-h-[44px] cursor-pointer"
                  aria-label="تسجيل الدخول إلى حسابك"
                >
                  <LogIn className="w-4 h-4 text-[#B45F42]" />
                  <span className="hidden xs:inline">تسجيل الدخول</span>
                  <span className="xs:hidden">دخول</span>
                </button>

                <button
                  type="button"
                  id="header-register-btn"
                  onClick={() => {
                    setAuthModalTab('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="hidden xl:flex px-4 py-2.5 bg-[#F3EFE9] dark:bg-[#2A2320] hover:bg-[#E8E1D9] dark:hover:bg-[#352D29] text-[#B45F42] dark:text-[#FF855D] border border-[#B45F42]/30 text-xs sm:text-sm font-bold rounded-xl shadow-2xs transition-all items-center gap-1.5 min-h-[44px] cursor-pointer"
                  aria-label="إنشاء حساب جديد في سوق الصعيد"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>إنشاء حساب</span>
                </button>
              </div>
            ) : (
              /* LOGGED-IN: User Profile Dropdown Button */
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  id="user-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2.5 p-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] rounded-xl bg-white dark:bg-[#25201D] transition-colors cursor-pointer min-h-[40px] sm:min-h-[44px]"
                  aria-label={`قائمة الحساب: ${currentUser.name || currentUser.username}`}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                >
                  <img
                    src={currentUser.profileImage?.secureUrl || currentUser.avatar || 'https://res.cloudinary.com/kuana1nl/image/upload/v1787924812/user.jpg'}
                    alt={currentUser.name || currentUser.username}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-[#E8E1D9] dark:border-[#382E27] shrink-0"
                  />
                  <div className="text-right hidden md:block max-w-[120px] lg:max-w-[150px]">
                    <span className="text-xs sm:text-sm font-bold text-[#2D2A26] dark:text-[#FAF6F2] block leading-tight truncate">
                      {currentUser.username || currentUser.name}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-[#7A6F64] dark:text-[#A89C90] block font-medium truncate">
                      {currentRole === 'admin' ? 'مدير المنصة' : currentRole === 'seller' ? 'حرفي وورشة' : 'حسابي'}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2D2A26] dark:text-[#FAF6F2] transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      id="user-dropdown-menu"
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute left-0 mt-2 w-64 sm:w-72 bg-white dark:bg-[#201B18] border border-[#E8E1D9] dark:border-[#382E27] rounded-2xl shadow-xl py-2 z-50 origin-top-left"
                    >
                      <div className="px-4 py-3 border-b border-[#F3EFE9] dark:border-[#2D2723]">
                        <p className="text-sm font-bold text-[#2D2A26] dark:text-[#FAF6F2] truncate">
                          {currentUser.name || currentUser.username}
                        </p>
                        {currentUser.email ? (
                          <p className="text-xs text-[#7A6F64] dark:text-[#A89C90] truncate">{currentUser.email}</p>
                        ) : (
                          <p className="text-xs text-[#7A6F64] dark:text-[#A89C90] truncate">@{currentUser.username}</p>
                        )}
                        <span
                          className={`inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${currentRole === 'admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                            : currentRole === 'seller'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                            }`}
                        >
                          {currentRole === 'admin' ? 'مدير المنصة' : currentRole === 'seller' ? 'ورشة معتمدة' : 'مشتري موثق'}
                        </span>
                      </div>

                      {/* Universal Profile & Settings link */}
                      <button
                        type="button"
                        id="user-profile-link"
                        onClick={() => {
                          setActivePage('buyer-account');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-right px-4 py-2.5 text-xs sm:text-sm text-[#2D2A26] dark:text-[#FAF6F2] hover:bg-[#F3EFE9] dark:hover:bg-[#2A2420] flex items-center gap-2.5 font-bold transition-colors cursor-pointer"
                        aria-label="الانتقال إلى الملف الشخصي وإعدادات الحساب"
                      >
                        <User className="w-4 h-4 text-[#B45F42]" />
                        <span>الملف الشخصي وإعدادات الحساب</span>
                      </button>

                      {/* Buyer Links */}
                      {currentRole === 'buyer' && (
                        <>
                          <button
                            type="button"
                            id="user-orders-link"
                            onClick={() => {
                              setActivePage('orders');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-right px-4 py-2.5 text-xs sm:text-sm text-[#2D2A26] dark:text-[#FAF6F2] hover:bg-[#F3EFE9] dark:hover:bg-[#2A2420] flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                            aria-label="الانتقال إلى طلباتي وتتبع الشحنات"
                          >
                            <PackageCheck className="w-4 h-4 text-[#B45F42]" />
                            <span>طلباتي وتتبع الشحنات</span>
                          </button>

                          <button
                            type="button"
                            id="user-favorites-link"
                            onClick={() => {
                              setActivePage('favorites');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-right px-4 py-2.5 text-xs sm:text-sm text-[#2D2A26] dark:text-[#FAF6F2] hover:bg-[#F3EFE9] dark:hover:bg-[#2A2420] flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                            aria-label={`الانتقال إلى قائمة المفضلة، ${favorites.length} عناصر`}
                          >
                            <Heart className="w-4 h-4 text-[#B45F42]" />
                            <span>قائمة المفضلة ({favorites.length})</span>
                          </button>
                        </>
                      )}

                      {/* Seller Links */}
                      {currentRole === 'seller' && (
                        <button
                          type="button"
                          id="seller-dash-link"
                          onClick={() => {
                            setActivePage('seller-dashboard');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-right px-4 py-2.5 text-xs sm:text-sm text-amber-900 dark:text-amber-300 font-bold hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                          aria-label="الانتقال إلى لوحة تحكم الورشة والمنتجات"
                        >
                          <Store className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>لوحة تحكم الورشة والمنتجات</span>
                        </button>
                      )}

                      {/* Admin Links */}
                      {currentRole === 'admin' && (
                        <button
                          type="button"
                          id="admin-dash-link"
                          onClick={() => {
                            setActivePage('admin-dashboard');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-right px-4 py-2.5 text-xs sm:text-sm text-purple-900 dark:text-purple-300 font-bold hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                          aria-label="الانتقال إلى لوحة إدارة المنصة والرقابة"
                        >
                          <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>لوحة إدارة المنصة والرقابة</span>
                        </button>
                      )}

                      {/* Theme toggle in menu */}
                      <button
                        type="button"
                        id="user-dropdown-theme-toggle"
                        onClick={toggleTheme}
                        className="w-full text-right px-4 py-2.5 text-xs sm:text-sm text-[#2D2A26] dark:text-[#FAF6F2] hover:bg-[#F3EFE9] dark:hover:bg-[#2A2420] flex items-center justify-between font-medium transition-colors cursor-pointer"
                        aria-label={theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الداكن'}
                      >
                        <div className="flex items-center gap-2.5">
                          {theme === 'dark' ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Moon className="w-4 h-4 text-[#B45F42]" />
                          )}
                          <span>المظهر: {theme === 'dark' ? 'الوضع الداكن' : 'الوضع النهاري'}</span>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#F3EFE9] dark:bg-[#2D2723] border border-[#E8E1D9] dark:border-[#382E27] text-[#7A6F64] dark:text-[#A89C90] font-bold">
                          {theme === 'dark' ? 'ليلي 🌙' : 'نهاري ☀️'}
                        </span>
                      </button>

                      <div className="border-t border-[#F3EFE9] dark:border-[#2D2723] my-1" />

                      {/* Logout */}
                      <button
                        type="button"
                        id="auth-logout-btn"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-right px-4 py-2.5 text-xs sm:text-sm text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 font-bold transition-colors cursor-pointer"
                        aria-label="تسجيل الخروج من الحساب"
                      >
                        <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Hamburger Button (< md) */}
            <button
              type="button"
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 sm:p-2.5 text-[#2D2A26] dark:text-[#FAF6F2] hover:bg-[#F3EFE9] dark:hover:bg-[#25201D] rounded-xl transition-colors min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center cursor-pointer border border-[#E8E1D9] dark:border-[#382E27]"
              aria-label={mobileMenuOpen ? 'إغلاق القائمة الرئيسية' : 'فتح القائمة الرئيسية'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Expandable Mobile/Tablet Search Bar */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden pb-3 overflow-hidden"
            >
              <form onSubmit={handleSearchSubmit} className="relative w-full" role="search">
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  id="mobile-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن: فخار قنا، كليم، عسل سدر..."
                  aria-label="البحث عن منتجات الصعيد"
                  className="w-full bg-[#F3EFE9] dark:bg-[#25201D] text-xs sm:text-sm text-[#2D2A26] dark:text-[#FAF6F2] placeholder:text-[#8C7E72] dark:placeholder:text-[#7A6F64] rounded-xl pl-10 pr-4 py-2.5 border border-[#E8E1D9] dark:border-[#382E27] focus:border-[#B45F42] outline-none"
                />
                <button
                  type="submit"
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-[#B45F42] cursor-pointer"
                  aria-label="تنفيذ البحث"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Secondary Navigation Bar (md+) */}
        <nav className="hidden md:flex items-center gap-1.5 pb-2.5 sm:pb-3 border-t border-[#E8E1D9]/70 dark:border-[#382E27]/70 pt-2.5 overflow-x-auto no-scrollbar" aria-label="روابط التنقل الرئيسية">
          {roleNavLinks.map((link) => {
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                type="button"
                id={`nav-link-${link.id}`}
                onClick={() => setActivePage(link.id as any)}
                aria-label={`الانتقال إلى صفحة ${link.label}`}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${isActive
                  ? 'bg-[#B45F42] text-white shadow-xs'
                  : 'text-[#54493F] dark:text-[#C5B8AC] hover:text-[#B45F42] dark:hover:text-[#FF855D] hover:bg-[#F3EFE9] dark:hover:bg-[#25201D]'
                  }`}
              >
                <span>{link.label}</span>
                {'isNew' in link && (link as any).isNew && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse ${
                    isActive ? 'bg-amber-300 text-[#2D2A26]' : 'bg-[#B45F42] text-white'
                  }`}>
                    جديد
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Role Badges on the far left */}
          {isAuthenticated && currentRole === 'seller' && (
            <button
              type="button"
              id="nav-quick-seller"
              onClick={() => setActivePage('seller-dashboard')}
              aria-label="الانتقال السريع إلى لوحة تحكم ورشتك"
              className="mr-auto flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              <span>لوحة تحكم ورشتك</span>
            </button>
          )}

          {isAuthenticated && currentRole === 'admin' && (
            <button
              type="button"
              id="nav-quick-admin"
              onClick={() => setActivePage('admin-dashboard')}
              aria-label="الانتقال السريع إلى لوحة الإدارة العليا"
              className="mr-auto flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>لوحة الإدارة العليا</span>
            </button>
          )}

          {isAuthenticated && currentRole === 'buyer' && (
            <button
              type="button"
              id="nav-quick-orders"
              onClick={() => setActivePage('orders')}
              aria-label="الانتقال السريع إلى متابعة طلباتي"
              className="mr-auto flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 bg-[#F3EFE9] dark:bg-[#25201D] text-[#2D2A26] dark:text-[#FAF6F2] hover:bg-[#E8E1D9] dark:hover:bg-[#2D2723] rounded-xl text-xs font-bold border border-[#E8E1D9] dark:border-[#382E27] transition-colors shrink-0 cursor-pointer"
            >
              <PackageCheck className="w-3.5 h-3.5 text-[#B45F42]" />
              <span>متابعة طلباتي</span>
            </button>
          )}
        </nav>
      </div>

      {/* Mobile Drawer Menu Overlay & Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="top-10 sm:top-18 bg-black/50 z-30 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Drawer Content */}
            <motion.div
              id="mobile-drawer"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="md:hidden relative z-40 bg-[#FDFBF7] dark:bg-[#1A1614] border-b border-[#E8E1D9] dark:border-[#382E27] px-4 py-4 space-y-3.5 max-h-[calc(100vh-4.5rem)] overflow-y-auto"
              role="dialog"
              aria-label="قائمة التنقل للهواتف"
            >
              {/* User Card on Mobile Drawer */}
              {isAuthenticated ? (
                <div className="flex items-center justify-between p-3.5 bg-white dark:bg-[#201B18] rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={currentUser.profileImage?.secureUrl || currentUser.avatar || 'https://res.cloudinary.com/kuana1nl/image/upload/v1787924812/user.jpg'}
                      alt={currentUser.name || currentUser.username}
                      className="w-10 h-10 rounded-xl object-cover border border-[#E8E1D9] dark:border-[#382E27] shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-[#2D2A26] dark:text-[#FAF6F2] block leading-tight truncate">
                        {currentUser.name || currentUser.username}
                      </span>
                      <span className="text-xs text-[#7A6F64] dark:text-[#A89C90] block truncate">
                        {currentUser.email || `@${currentUser.username}`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="mobile-logout-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    aria-label="تسجيل الخروج من الحساب"
                    className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900/50 shrink-0 cursor-pointer"
                  >
                    خروج
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 p-2 bg-[#F3EFE9] dark:bg-[#25201D] rounded-2xl">
                  <button
                    type="button"
                    id="mobile-login-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalTab('login');
                      setIsAuthModalOpen(true);
                    }}
                    aria-label="تسجيل الدخول إلى حسابك"
                    className="py-2.5 bg-white dark:bg-[#1E1917] text-[#2D2A26] dark:text-[#FAF6F2] text-xs sm:text-sm font-bold rounded-xl text-center shadow-2xs min-h-[44px] flex items-center justify-center gap-1.5 cursor-pointer border border-[#E8E1D9] dark:border-[#382E27]"
                  >
                    <LogIn className="w-4 h-4 text-[#B45F42]" />
                    <span>تسجيل الدخول</span>
                  </button>
                  <button
                    type="button"
                    id="mobile-register-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalTab('register');
                      setIsAuthModalOpen(true);
                    }}
                    aria-label="إنشاء حساب جديد في سوق الصعيد"
                    className="py-2.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-xs sm:text-sm font-bold rounded-xl text-center shadow-xs min-h-[44px] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>إنشاء حساب</span>
                  </button>
                </div>
              )}

              {/* Theme Switcher Row in Drawer */}
              <div className="p-3 bg-[#F3EFE9] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-600" />
                  )}
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#2D2A26] dark:text-[#FAF6F2] block">مظهر المنصة</span>
                    <span className="text-[11px] text-[#7A6F64] dark:text-[#A89C90] block">
                      {theme === 'dark' ? 'الوضع الداكن (الليلي)' : 'الوضع المضيء (النهاري)'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  id="mobile-theme-toggle-btn"
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الداكن'}
                  className="px-3 py-1.5 bg-white dark:bg-[#1E1917] text-[#2D2A26] dark:text-[#FAF6F2] border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>نهاري</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-[#B45F42]" />
                      <span>داكن</span>
                    </>
                  )}
                </button>
              </div>

              {/* Navigation Links in Drawer */}
              <div className="space-y-1">
                {roleNavLinks.map((link) => {
                  const isActive = activePage === link.id;
                  return (
                    <button
                      key={link.id}
                      type="button"
                      id={`mobile-nav-${link.id}`}
                      onClick={() => {
                        setActivePage(link.id as any);
                        setMobileMenuOpen(false);
                      }}
                      aria-label={`الانتقال إلى صفحة ${link.label}`}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-right transition-colors min-h-[44px] cursor-pointer ${isActive
                        ? 'bg-[#B45F42] text-white'
                        : 'text-[#2D2A26] dark:text-[#FAF6F2] hover:bg-[#F3EFE9] dark:hover:bg-[#25201D]'
                        }`}
                    >
                      <span>{link.label}</span>
                      <ArrowLeft className="w-4 h-4 opacity-70" />
                    </button>
                  );
                })}

                {/* Documentary Trigger */}
                <button
                  type="button"
                  id="mobile-intro-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowIntroVideo(true);
                  }}
                  aria-label="مشاهدة الفيلم الوثائقي عن تراث وحرف الصعيد"
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-900/50 transition-colors min-h-[44px] cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <span>شاهد وثائقي الصعيد</span>
                  </div>
                  <ArrowLeft className="w-4 h-4 opacity-70" />
                </button>
              </div>

              {/* Role-Specific Protected Links in Drawer */}
              {isAuthenticated && (
                <div className="border-t border-[#E8E1D9] dark:border-[#382E27] pt-2 space-y-1">
                  <button
                    type="button"
                    id="mobile-account-link"
                    onClick={() => {
                      setActivePage('buyer-account');
                      setMobileMenuOpen(false);
                    }}
                    aria-label="الانتقال إلى الملف الشخصي وإعدادات الحساب"
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-[#2D2A26] dark:text-[#FAF6F2] hover:bg-[#F3EFE9] dark:hover:bg-[#25201D] min-h-[44px] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#B45F42]" />
                      <span>الملف الشخصي وإعدادات الحساب</span>
                    </div>
                    <ArrowLeft className="w-4 h-4 opacity-70" />
                  </button>

                  {currentRole === 'seller' && (
                    <button
                      type="button"
                      id="mobile-seller-link"
                      onClick={() => {
                        setActivePage('seller-dashboard');
                        setMobileMenuOpen(false);
                      }}
                      aria-label="الانتقال إلى لوحة تحكم الورشة"
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 min-h-[44px] cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                        <span>لوحة تحكم الورشة والمنتجات</span>
                      </div>
                      <ArrowLeft className="w-4 h-4 opacity-70" />
                    </button>
                  )}

                  {currentRole === 'admin' && (
                    <button
                      type="button"
                      id="mobile-admin-link"
                      onClick={() => {
                        setActivePage('admin-dashboard');
                        setMobileMenuOpen(false);
                      }}
                      aria-label="الانتقال إلى لوحة إدارة المنصة والرقابة"
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-purple-900 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 min-h-[44px] cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                        <span>لوحة إدارة المنصة والرقابة</span>
                      </div>
                      <ArrowLeft className="w-4 h-4 opacity-70" />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
