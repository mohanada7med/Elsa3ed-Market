import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  ShoppingBag,
  Layers,
  Heart,
  User,
  Film,
  Store,
  ShieldAlert,
  LogIn,
  Package,
  ClipboardList,
  MessageSquare,
  MapPin,
  Flame,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

export const MobileBottomBar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    cartCount,
    setIsCartDrawerOpen,
    favorites,
    isAuthenticated,
    currentRole,
    currentUser,
    setIsAuthModalOpen,
    setAuthModalTab,
    chatUnreadCount
  } = useApp();

  const handleAccountClick = () => {
    if (!isAuthenticated) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
    } else if (currentRole === 'seller' || currentUser?.role === 'seller') {
      setActivePage('seller-account');
    } else if (currentRole === 'admin' || currentUser?.role === 'admin') {
      setActivePage('admin-dashboard');
    } else {
      setActivePage('buyer-account');
    }
  };

  const isAccountActive =
    activePage === 'buyer-account' ||
    activePage === 'seller-account' ||
    (currentRole === 'seller' && activePage === 'seller-dashboard') ||
    (currentRole === 'admin' && activePage === 'admin-dashboard');

  if (activePage === 'product-details' || activePage === 'checkout') {
    return null;
  }

  return (
    <div
      id="mobile-bottom-navigation"
      dir="rtl"
      className="lg:hidden fixed bottom-3 inset-x-3 sm:inset-x-6 z-40 select-none pointer-events-none pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label="شريط التنقل السريع للهواتف"
    >
      <nav
        className="
          pointer-events-auto
          max-w-md
          mx-auto
          rounded-[2rem]
          bg-white/80
          dark:bg-[#151513]/90
          backdrop-blur-2xl
          border
          border-black/10
          dark:border-white/10
          shadow-[0_16px_40px_rgba(0,0,0,0.12)]
          dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]
          p-1.5
          flex
          items-center
          justify-between
          transition-colors
          duration-300
        "
      >
        {/* ==================== SELLER NAVIGATION ==================== */}
        {isAuthenticated && currentRole === 'seller' ? (
          <>
            {/* 1. الرئيسية */}
            <button
              type="button"
              onClick={() => setActivePage('home' as any)}
              className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[48px] cursor-pointer"
            >
              {activePage === 'home' && (
                <motion.div
                  layoutId="sellerActivePill"
                  className="absolute inset-0 rounded-2xl bg-[#9a6a35]/15 dark:bg-[#9a6a35]/25 border border-[#9a6a35]/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <Compass className={`relative z-10 w-4 h-4 ${activePage === 'home' ? 'text-[#9a6a35]' : 'text-black/50 dark:text-white/50'}`} />
              <span className={`relative z-10 text-[10px] font-bold mt-1 ${activePage === 'home' ? 'text-[#9a6a35]' : 'text-black/65 dark:text-white/65'}`}>
                الرئيسية
              </span>
            </button>

            {/* 2. منتجات الورشة */}
            <button
              type="button"
              onClick={() => setActivePage('seller-products' as any)}
              className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[48px] cursor-pointer"
            >
              {activePage === 'seller-products' && (
                <motion.div
                  layoutId="sellerActivePill"
                  className="absolute inset-0 rounded-2xl bg-[#9a6a35]/15 dark:bg-[#9a6a35]/25 border border-[#9a6a35]/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <Package className={`relative z-10 w-4 h-4 ${activePage === 'seller-products' ? 'text-[#9a6a35]' : 'text-black/50 dark:text-white/50'}`} />
              <span className={`relative z-10 text-[10px] font-bold mt-1 ${activePage === 'seller-products' ? 'text-[#9a6a35]' : 'text-black/65 dark:text-white/65'}`}>
                منتجاتي
              </span>
            </button>

            {/* 3. الزر المركزي المميز: لوحة الورشة */}
            <button
              type="button"
              onClick={() => setActivePage('seller-dashboard' as any)}
              className="relative -top-3 px-2 flex flex-col items-center justify-center cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-[#211d18] text-white dark:bg-white dark:text-black flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-105 active:scale-95 transition-all">
                <Store className="w-5 h-5 text-[#9a6a35]" />
              </div>
              <span className="text-[9px] font-black mt-0.5 text-[#9a6a35]">الورشة</span>
            </button>

            {/* 4. طلبات الورشة */}
            <button
              type="button"
              onClick={() => setActivePage('seller-orders' as any)}
              className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[48px] cursor-pointer"
            >
              {activePage === 'seller-orders' && (
                <motion.div
                  layoutId="sellerActivePill"
                  className="absolute inset-0 rounded-2xl bg-[#9a6a35]/15 dark:bg-[#9a6a35]/25 border border-[#9a6a35]/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <ClipboardList className={`relative z-10 w-4 h-4 ${activePage === 'seller-orders' ? 'text-[#9a6a35]' : 'text-black/50 dark:text-white/50'}`} />
              <span className={`relative z-10 text-[10px] font-bold mt-1 ${activePage === 'seller-orders' ? 'text-[#9a6a35]' : 'text-black/65 dark:text-white/65'}`}>
                الطلبات
              </span>
            </button>

            {/* 5. الرسائل */}
            <button
              type="button"
              onClick={() => setActivePage('messages' as any)}
              className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[48px] cursor-pointer"
            >
              {(activePage === 'messages' || activePage === 'seller-messages') && (
                <motion.div
                  layoutId="sellerActivePill"
                  className="absolute inset-0 rounded-2xl bg-[#9a6a35]/15 dark:bg-[#9a6a35]/25 border border-[#9a6a35]/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <div className="relative">
                <MessageSquare className={`relative z-10 w-4 h-4 ${activePage === 'messages' || activePage === 'seller-messages' ? 'text-[#9a6a35]' : 'text-black/50 dark:text-white/50'}`} />
                {chatUnreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#9a6a35] text-white text-[8px] font-black px-1 min-w-[14px] h-[14px] rounded-full flex items-center justify-center leading-none z-20">
                    {chatUnreadCount}
                  </span>
                )}
              </div>
              <span className={`relative z-10 text-[10px] font-bold mt-1 ${activePage === 'messages' || activePage === 'seller-messages' ? 'text-[#9a6a35]' : 'text-black/65 dark:text-white/65'}`}>
                المحادثات
              </span>
            </button>
          </>
        ) : isAuthenticated && currentRole === 'admin' ? (
          /* ==================== ADMIN NAVIGATION ==================== */
          <>
            <button
              type="button"
              onClick={() => setActivePage('home' as any)}
              className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[48px] cursor-pointer"
            >
              {activePage === 'home' && (
                <motion.div
                  layoutId="adminActivePill"
                  className="absolute inset-0 rounded-2xl bg-purple-500/15 border border-purple-500/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <Compass className={`relative z-10 w-4 h-4 ${activePage === 'home' ? 'text-purple-600 dark:text-purple-400' : 'text-black/50 dark:text-white/50'}`} />
              <span className={`relative z-10 text-[10px] font-bold mt-1 ${activePage === 'home' ? 'text-purple-600 dark:text-purple-400' : 'text-black/65 dark:text-white/65'}`}>
                الرئيسية
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('admin-products' as any)}
              className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[48px] cursor-pointer"
            >
              {activePage === 'admin-products' && (
                <motion.div
                  layoutId="adminActivePill"
                  className="absolute inset-0 rounded-2xl bg-purple-500/15 border border-purple-500/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <Package className={`relative z-10 w-4 h-4 ${activePage === 'admin-products' ? 'text-purple-600 dark:text-purple-400' : 'text-black/50 dark:text-white/50'}`} />
              <span className={`relative z-10 text-[10px] font-bold mt-1 ${activePage === 'admin-products' ? 'text-purple-600 dark:text-purple-400' : 'text-black/65 dark:text-white/65'}`}>
                المنتجات
              </span>
            </button>

            {/* المركز: لوحة الإدارة */}
            <button
              type="button"
              onClick={() => setActivePage('admin-dashboard' as any)}
              className="relative -top-3 px-2 flex flex-col items-center justify-center cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-[#211d18] text-white dark:bg-white dark:text-black flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-105 active:scale-95 transition-all">
                <ShieldAlert className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-[9px] font-black mt-0.5 text-purple-600 dark:text-purple-400">الإدارة</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('admin-orders' as any)}
              className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[48px] cursor-pointer"
            >
              {activePage === 'admin-orders' && (
                <motion.div
                  layoutId="adminActivePill"
                  className="absolute inset-0 rounded-2xl bg-purple-500/15 border border-purple-500/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <ClipboardList className={`relative z-10 w-4 h-4 ${activePage === 'admin-orders' ? 'text-purple-600 dark:text-purple-400' : 'text-black/50 dark:text-white/50'}`} />
              <span className={`relative z-10 text-[10px] font-bold mt-1 ${activePage === 'admin-orders' ? 'text-purple-600 dark:text-purple-400' : 'text-black/65 dark:text-white/65'}`}>
                الطلبات
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('admin-sellers' as any)}
              className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[48px] cursor-pointer"
            >
              {activePage === 'admin-sellers' && (
                <motion.div
                  layoutId="adminActivePill"
                  className="absolute inset-0 rounded-2xl bg-purple-500/15 border border-purple-500/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <Store className={`relative z-10 w-4 h-4 ${activePage === 'admin-sellers' ? 'text-purple-600 dark:text-purple-400' : 'text-black/50 dark:text-white/50'}`} />
              <span className={`relative z-10 text-[10px] font-bold mt-1 ${activePage === 'admin-sellers' ? 'text-purple-600 dark:text-purple-400' : 'text-black/65 dark:text-white/65'}`}>
                الورش
              </span>
            </button>
          </>
        ) : (
          /* ==================== BUYER & GUEST SHOPPING NAVIGATION ==================== */
          <>
            {/* 1. الرئيسية */}
            <button
              type="button"
              onClick={() => setActivePage('home' as any)}
              className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[48px] cursor-pointer"
              aria-label="الرئيسية"
            >
              {activePage === 'home' && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-0 rounded-2xl bg-[#9a6a35]/15 dark:bg-[#9a6a35]/25 border border-[#9a6a35]/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <Compass className={`relative z-10 w-4 h-4 transition-transform active:scale-90 ${activePage === 'home' ? 'text-[#9a6a35]' : 'text-black/50 dark:text-white/50'}`} />
              <span className={`relative z-10 text-[10px] font-bold mt-1 tracking-tight ${activePage === 'home' ? 'text-[#9a6a35]' : 'text-black/65 dark:text-white/65'}`}>
                الرئيسية
              </span>
            </button>

            {/* 2. المقتنيات والمعروضات */}
            <button
              type="button"
              onClick={() => setActivePage('products' as any)}
              className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[48px] cursor-pointer"
              aria-label="المقتنيات"
            >
              {activePage === 'products' && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-0 rounded-2xl bg-[#9a6a35]/15 dark:bg-[#9a6a35]/25 border border-[#9a6a35]/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <Layers className={`relative z-10 w-4 h-4 transition-transform active:scale-90 ${activePage === 'products' ? 'text-[#9a6a35]' : 'text-black/50 dark:text-white/50'}`} />
              <span className={`relative z-10 text-[10px] font-bold mt-1 tracking-tight ${activePage === 'products' ? 'text-[#9a6a35]' : 'text-black/65 dark:text-white/65'}`}>
                المقتنيات
              </span>
            </button>

            {/* 3. الزر المركزي البارز: أطلس محافظات الصعيد */}
            <button
              type="button"
              onClick={() => setActivePage('map' as any)}
              className="relative -top-3 px-2 flex flex-col items-center justify-center cursor-pointer group"
              aria-label="لفة في الصعيد"
            >
              <div className="w-12 h-12 rounded-full bg-[#211d18] text-white dark:bg-white dark:text-black flex items-center justify-center shadow-xl shadow-black/20 group-hover:scale-105 active:scale-95 transition-all">
                <MapPin className="w-5 h-5 text-[#9a6a35]" />
              </div>
              <span className="text-[9px] font-black mt-0.5 text-[#9a6a35]">الصعيد</span>
            </button>

            {/* 4. سلة المشتريات */}
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[48px] cursor-pointer"
              aria-label="سلة المقتنيات"
            >
              {activePage === 'cart' && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-0 rounded-2xl bg-[#9a6a35]/15 dark:bg-[#9a6a35]/25 border border-[#9a6a35]/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <div className="relative">
                <ShoppingBag className={`relative z-10 w-4 h-4 transition-transform active:scale-90 ${activePage === 'cart' ? 'text-[#9a6a35]' : 'text-black/50 dark:text-white/50'}`} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#9a6a35] text-white text-[8px] font-black px-1 min-w-[14px] h-[14px] rounded-full flex items-center justify-center leading-none z-20 shadow-xs">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className={`relative z-10 text-[10px] font-bold mt-1 tracking-tight ${activePage === 'cart' ? 'text-[#9a6a35]' : 'text-black/65 dark:text-white/65'}`}>
                السلة
              </span>
            </button>

            {/* 5. الحساب / تسجيل الدخول */}
            <button
              type="button"
              onClick={handleAccountClick}
              className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[48px] cursor-pointer"
              aria-label={isAuthenticated ? 'حسابي' : 'تسجيل الدخول'}
            >
              {isAccountActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-0 rounded-2xl bg-[#9a6a35]/15 dark:bg-[#9a6a35]/25 border border-[#9a6a35]/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              {!isAuthenticated ? (
                <LogIn className={`relative z-10 w-4 h-4 transition-transform active:scale-90 ${isAccountActive ? 'text-[#9a6a35]' : 'text-black/50 dark:text-white/50'}`} />
              ) : (
                <User className={`relative z-10 w-4 h-4 transition-transform active:scale-90 ${isAccountActive ? 'text-[#9a6a35]' : 'text-black/50 dark:text-white/50'}`} />
              )}
              <span className={`relative z-10 text-[10px] font-bold mt-1 tracking-tight ${isAccountActive ? 'text-[#9a6a35]' : 'text-black/65 dark:text-white/60'}`}>
                {!isAuthenticated ? 'دخول' : 'حسابي'}
              </span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
};