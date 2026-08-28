import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  ShoppingBag,
  Grid,
  Heart,
  User,
  Store,
  ShieldAlert,
  LogIn,
  Package,
  Boxes,
  ClipboardList,
  ShieldCheck,
  Users
} from 'lucide-react';

export const MobileBottomBar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    cartCount,
    setIsCartDrawerOpen,
    favorites,
    isAuthenticated,
    currentRole,
    setIsAuthModalOpen,
    setAuthModalTab
  } = useApp();

  const handleAccountClick = () => {
    if (!isAuthenticated) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
    } else if (currentRole === 'seller') {
      setActivePage('seller-dashboard');
    } else if (currentRole === 'admin') {
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

  return (
    <div
      id="mobile-bottom-navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FDFBF7]/95 dark:bg-[#151210]/95 backdrop-blur-lg border-t border-[#E8E1D9] dark:border-[#382E27] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 safe-area-pb"
      role="navigation"
      aria-label="شريط التنقل السريع للهواتف"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* ==================== SELLER SPECIFIC NAVIGATION ==================== */}
        {isAuthenticated && currentRole === 'seller' ? (
          <>
            {/* Home / Market */}
            <button
              type="button"
              id="mobile-bar-seller-home"
              onClick={() => setActivePage('home')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[48px] cursor-pointer ${
                activePage === 'home'
                  ? 'text-amber-700 dark:text-amber-400 font-bold'
                  : 'text-[#7A6F64] dark:text-[#9C8F82]'
              }`}
              aria-label="الرئيسية"
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight">الرئيسية</span>
            </button>

            {/* My Products */}
            <button
              type="button"
              id="mobile-bar-seller-products"
              onClick={() => setActivePage('seller-products')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[48px] cursor-pointer ${
                activePage === 'seller-products'
                  ? 'text-amber-700 dark:text-amber-400 font-bold'
                  : 'text-[#7A6F64] dark:text-[#9C8F82]'
              }`}
              aria-label="منتجات الورشة"
            >
              <Package className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight">منتجاتي</span>
            </button>

            {/* Center Highlight: Seller Dashboard */}
            <button
              type="button"
              id="mobile-bar-seller-dash"
              onClick={() => setActivePage('seller-dashboard')}
              className="relative -top-2 flex flex-col items-center justify-center cursor-pointer group"
              aria-label="لوحة تحكم الورشة"
            >
              <div className="w-12 h-12 rounded-full bg-amber-700 dark:bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-700/30 group-hover:scale-105 active:scale-95 transition-all">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 font-bold text-amber-700 dark:text-amber-400">لوحة الورشة</span>
            </button>

            {/* Seller Orders */}
            <button
              type="button"
              id="mobile-bar-seller-orders"
              onClick={() => setActivePage('seller-orders')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[48px] cursor-pointer ${
                activePage === 'seller-orders'
                  ? 'text-amber-700 dark:text-amber-400 font-bold'
                  : 'text-[#7A6F64] dark:text-[#9C8F82]'
              }`}
              aria-label="طلبات الورشة"
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight">الطلبات</span>
            </button>

            {/* Inventory */}
            <button
              type="button"
              id="mobile-bar-seller-inventory"
              onClick={() => setActivePage('seller-inventory')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[48px] cursor-pointer ${
                activePage === 'seller-inventory'
                  ? 'text-amber-700 dark:text-amber-400 font-bold'
                  : 'text-[#7A6F64] dark:text-[#9C8F82]'
              }`}
              aria-label="إدارة المخزون"
            >
              <Boxes className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight">المخزون</span>
            </button>
          </>
        ) : isAuthenticated && currentRole === 'admin' ? (
          /* ==================== ADMIN SPECIFIC NAVIGATION ==================== */
          <>
            {/* Home / Market */}
            <button
              type="button"
              id="mobile-bar-admin-home"
              onClick={() => setActivePage('home')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[48px] cursor-pointer ${
                activePage === 'home'
                  ? 'text-purple-700 dark:text-purple-400 font-bold'
                  : 'text-[#7A6F64] dark:text-[#9C8F82]'
              }`}
              aria-label="الرئيسية"
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight">الرئيسية</span>
            </button>

            {/* Products Management */}
            <button
              type="button"
              id="mobile-bar-admin-products"
              onClick={() => setActivePage('admin-products')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[48px] cursor-pointer ${
                activePage === 'admin-products'
                  ? 'text-purple-700 dark:text-purple-400 font-bold'
                  : 'text-[#7A6F64] dark:text-[#9C8F82]'
              }`}
              aria-label="إدارة المنتجات"
            >
              <Package className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight">المنتجات</span>
            </button>

            {/* Center Highlight: Admin Dashboard */}
            <button
              type="button"
              id="mobile-bar-admin-dash"
              onClick={() => setActivePage('admin-dashboard')}
              className="relative -top-2 flex flex-col items-center justify-center cursor-pointer group"
              aria-label="لوحة الإدارة العليا"
            >
              <div className="w-12 h-12 rounded-full bg-purple-700 dark:bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-700/30 group-hover:scale-105 active:scale-95 transition-all">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 font-bold text-purple-700 dark:text-purple-400">الإدارة</span>
            </button>

            {/* Orders Management */}
            <button
              type="button"
              id="mobile-bar-admin-orders"
              onClick={() => setActivePage('admin-orders')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[48px] cursor-pointer ${
                activePage === 'admin-orders'
                  ? 'text-purple-700 dark:text-purple-400 font-bold'
                  : 'text-[#7A6F64] dark:text-[#9C8F82]'
              }`}
              aria-label="إدارة الطلبات"
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight">الطلبات</span>
            </button>

            {/* Users & Sellers */}
            <button
              type="button"
              id="mobile-bar-admin-users"
              onClick={() => setActivePage('admin-sellers')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[48px] cursor-pointer ${
                activePage === 'admin-sellers'
                  ? 'text-purple-700 dark:text-purple-400 font-bold'
                  : 'text-[#7A6F64] dark:text-[#9C8F82]'
              }`}
              aria-label="الورش والبائعين"
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight">الورش</span>
            </button>
          </>
        ) : (
          /* ==================== BUYER & GUEST SHOPPING NAVIGATION ==================== */
          <>
            {/* Home Button */}
            <button
              type="button"
              id="mobile-bar-home"
              onClick={() => setActivePage('home')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[48px] cursor-pointer ${
                activePage === 'home'
                  ? 'text-[#B45F42] dark:text-[#FF855D] font-bold'
                  : 'text-[#7A6F64] dark:text-[#9C8F82] hover:text-[#2D2A26] dark:hover:text-[#FAF6F2]'
              }`}
              aria-label="الرئيسية"
              aria-current={activePage === 'home' ? 'page' : undefined}
            >
              <div className="relative">
                <Home className="w-5 h-5 transition-transform active:scale-90" />
                {activePage === 'home' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#B45F42] dark:bg-[#FF855D] rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">الرئيسية</span>
            </button>

            {/* Products / Market Button */}
            <button
              type="button"
              id="mobile-bar-products"
              onClick={() => setActivePage('products')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[48px] cursor-pointer ${
                activePage === 'products' || activePage === 'product-details'
                  ? 'text-[#B45F42] dark:text-[#FF855D] font-bold'
                  : 'text-[#7A6F64] dark:text-[#9C8F82] hover:text-[#2D2A26] dark:hover:text-[#FAF6F2]'
              }`}
              aria-label="المتجر"
              aria-current={activePage === 'products' ? 'page' : undefined}
            >
              <div className="relative">
                <Grid className="w-5 h-5 transition-transform active:scale-90" />
                {(activePage === 'products' || activePage === 'product-details') && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#B45F42] dark:bg-[#FF855D] rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">المنتجات</span>
            </button>

            {/* Cart Trigger (Center Action Highlight - ONLY FOR BUYER/GUEST) */}
            <button
              type="button"
              id="mobile-bar-cart"
              onClick={() => {
                setActivePage('cart');
              }}
              className="relative -top-2 flex flex-col items-center justify-center cursor-pointer group"
              aria-label={`سلة المشتريات، ${cartCount} عناصر`}
            >
              <div className="w-12 h-12 rounded-full bg-[#B45F42] dark:bg-[#FF855D] text-white flex items-center justify-center shadow-lg shadow-[#B45F42]/30 group-hover:scale-105 active:scale-95 transition-all">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-300 text-[#2D2A26] text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs border-2 border-white dark:border-[#151210]">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-bold text-[#B45F42] dark:text-[#FF855D]">السلة</span>
            </button>

            {/* Favorites Button */}
            <button
              type="button"
              id="mobile-bar-favorites"
              onClick={() => setActivePage('favorites')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[48px] cursor-pointer ${
                activePage === 'favorites'
                  ? 'text-[#B45F42] dark:text-[#FF855D] font-bold'
                  : 'text-[#7A6F64] dark:text-[#9C8F82] hover:text-[#2D2A26] dark:hover:text-[#FAF6F2]'
              }`}
              aria-label="المفضلة"
              aria-current={activePage === 'favorites' ? 'page' : undefined}
            >
              <div className="relative">
                <Heart className="w-5 h-5 transition-transform active:scale-90" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold px-1 min-w-[14px] h-[14px] rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">المفضلة</span>
            </button>

            {/* Account / Login Button */}
            <button
              type="button"
              id="mobile-bar-account"
              onClick={handleAccountClick}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[48px] cursor-pointer ${
                isAccountActive
                  ? 'text-[#B45F42] dark:text-[#FF855D] font-bold'
                  : 'text-[#7A6F64] dark:text-[#9C8F82] hover:text-[#2D2A26] dark:hover:text-[#FAF6F2]'
              }`}
              aria-label={isAuthenticated ? 'حسابي' : 'تسجيل الدخول'}
              aria-current={isAccountActive ? 'page' : undefined}
            >
              <div className="relative">
                {!isAuthenticated ? (
                  <LogIn className="w-5 h-5 transition-transform active:scale-90" />
                ) : (
                  <User className="w-5 h-5 transition-transform active:scale-90" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">
                {!isAuthenticated ? 'دخول' : 'حسابي'}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
