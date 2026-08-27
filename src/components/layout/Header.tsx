import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  LogIn,
  UserPlus
} from 'lucide-react';

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
    setShowIntroVideo
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActivePage('products');
    }
  };

  // Base public navigation links
  const publicNavLinks = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'products', label: 'كافة المنتجات' },
    { id: 'categories', label: 'التصنيفات التراثية' },
    { id: 'crafts', label: 'حكايات الحرف' },
    { id: 'sellers', label: 'الورش والحرفيون' },
    { id: 'about', label: 'عن سوق الصعيد' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E8E1D9] shadow-xs">
      {/* Top Heritage Notice Bar */}
      <div className="bg-[#B45F42] text-[#FDFBF7] text-xs sm:text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400/25 text-amber-100 text-xs font-bold px-2.5 py-0.5 rounded border border-amber-300/30">
              حرف أصلية 100%
            </span>
            <p className="truncate font-medium">
              شحن مباشر ومضمون من ورش الصعيد في قنا وسوهاج وأسوان وأسيوط لباب بيتك
            </p>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs font-medium">
            <button
              type="button"
              id="header-play-intro-btn"
              onClick={() => setShowIntroVideo(true)}
              className="flex items-center gap-1.5 hover:text-amber-200 transition-colors"
            >
              <Film className="w-4 h-4" />
              <span>شاهد وثائقي الصعيد</span>
            </button>
            <span className="text-white/30">|</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-100/90">محافظات الصعيد:</span>
              <span className="font-bold">أسوان • الأقصر • قنا • سوهاج • أسيوط • الوادي الجديد • المنيا • بني سويف</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20 gap-3 sm:gap-6">
          {/* Logo */}
          <div
            id="brand-logo"
            onClick={() => setActivePage('home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B45F42] to-[#9E4F36] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform border border-[#8C5039]/30">
              <span className="font-black text-2xl font-heritage">ص</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-[#2D2A26] font-heritage tracking-tight">
                  سوق الصعيد
                </span>
              </div>
              <span className="block text-xs text-[#7A6F64] font-medium tracking-wide">
                أصالة الحرف والخيرات التراثية
              </span>
            </div>
          </div>

          {/* Search Input (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                id="desktop-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن: فخار قنا، كليم أخميم، عسل سدر، تلي..."
                className="w-full bg-[#F3EFE9] hover:bg-[#EDE7DF] focus:bg-white text-sm text-[#2D2A26] placeholder:text-[#8C7E72] rounded-xl pl-11 pr-4 py-2.5 border border-[#E8E1D9] focus:border-[#B45F42] focus:ring-2 focus:ring-[#B45F42]/20 outline-none transition-all"
              />
              <button
                type="submit"
                id="desktop-search-btn"
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-[#B45F42] hover:text-[#9E4F36] rounded-lg hover:bg-amber-100/50 transition-colors"
                aria-label="بحث"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Action Area (Cart, Favorites, Auth State) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Toggle */}
            <button
              type="button"
              id="mobile-search-toggle"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="lg:hidden p-2.5 text-[#2D2A26] hover:bg-[#F3EFE9] rounded-xl transition-colors"
              aria-label="بحث في المنتجات"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Favorites (Always accessible or if buyer) */}
            <button
              type="button"
              id="nav-favorites-btn"
              onClick={() => setActivePage('favorites')}
              className="relative p-2.5 text-[#2D2A26] hover:bg-[#F3EFE9] rounded-xl transition-colors hidden sm:flex items-center justify-center"
              title="المفضلة"
              aria-label="المفضلة"
            >
              <Heart className="w-5 h-5 text-[#7A6F64] hover:text-[#B45F42]" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#B45F42] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-xs">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              type="button"
              id="nav-cart-btn"
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white rounded-xl shadow-xs transition-all"
              aria-label="سلة المشتريات"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-bold hidden sm:inline">السلة</span>
              {cartCount > 0 && (
                <span className="bg-amber-300 text-[#2D2A26] text-xs font-black px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* AUTHENTICATION STATE: GUEST VS LOGGED IN */}
            {!isAuthenticated ? (
              /* GUEST: Show Clear Login & Register Buttons */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="header-login-btn"
                  onClick={() => {
                    setAuthModalTab('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3.5 sm:px-4 py-2.5 bg-white hover:bg-[#F3EFE9] text-[#2D2A26] border border-[#E8E1D9] text-xs sm:text-sm font-bold rounded-xl shadow-2xs transition-all flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-[#B45F42]" />
                  <span>تسجيل الدخول</span>
                </button>

                <button
                  type="button"
                  id="header-register-btn"
                  onClick={() => {
                    setAuthModalTab('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="hidden md:flex px-4 py-2.5 bg-[#F3EFE9] hover:bg-[#E8E1D9] text-[#B45F42] border border-[#B45F42]/30 text-xs sm:text-sm font-bold rounded-xl shadow-2xs transition-all items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>إنشاء حساب</span>
                </button>
              </div>
            ) : (
              /* LOGGED-IN: Show User Profile, Role Badge, My Account & Real Logout */
              <div className="relative">
                <button
                  type="button"
                  id="user-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 border border-[#E8E1D9] hover:border-[#B45F42] rounded-xl bg-white transition-colors"
                  aria-label="قائمة حسابي"
                >
                  <img
                    src={currentUser.profileImage?.secureUrl || currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover border border-[#E8E1D9] shrink-0"
                  />
                  <div className="text-right hidden sm:block">
                    <span className="text-xs sm:text-sm font-bold text-[#2D2A26] block leading-tight max-w-[130px] truncate">
                      {currentUser.name}
                    </span>
                    <span className="text-[11px] text-[#7A6F64] block font-medium">
                      {currentRole === 'admin' ? 'مدير المنصة' : currentRole === 'seller' ? 'حرفي وورشة' : 'حسابي'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#2D2A26]" />
                </button>

                {userDropdownOpen && (
                  <div
                    id="user-dropdown-menu"
                    className="absolute left-0 mt-2 w-64 bg-white border border-[#E8E1D9] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in"
                  >
                    <div className="px-4 py-3 border-b border-[#F3EFE9]">
                      <p className="text-sm font-bold text-[#2D2A26] truncate">{currentUser.name}</p>
                      <p className="text-xs text-[#7A6F64] truncate">{currentUser.email}</p>
                      <span
                        className={`inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${currentRole === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : currentRole === 'seller'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
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
                      className="w-full text-right px-4 py-2.5 text-xs sm:text-sm text-[#2D2A26] hover:bg-[#F3EFE9] flex items-center gap-2.5 font-bold transition-colors"
                    >
                      <User className="w-4 h-4 text-[#B45F42]" />
                      <span>الملف الشخصي وإعدادات الحساب</span>
                    </button>

                    {/* Buyer Specific Links */}
                    {currentRole === 'buyer' && (
                      <>
                        <button
                          type="button"
                          id="user-orders-link"
                          onClick={() => {
                            setActivePage('orders');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-right px-4 py-2.5 text-xs sm:text-sm text-[#2D2A26] hover:bg-[#F3EFE9] flex items-center gap-2.5 font-medium transition-colors"
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
                          className="w-full text-right px-4 py-2.5 text-xs sm:text-sm text-[#2D2A26] hover:bg-[#F3EFE9] flex items-center gap-2.5 font-medium transition-colors"
                        >
                          <Heart className="w-4 h-4 text-[#B45F42]" />
                          <span>قائمة المفضلة ({favorites.length})</span>
                        </button>
                      </>
                    )}

                    {/* Seller Specific Links */}
                    {currentRole === 'seller' && (
                      <button
                        type="button"
                        id="seller-dash-link"
                        onClick={() => {
                          setActivePage('seller-dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-right px-4 py-2.5 text-xs sm:text-sm text-amber-900 font-bold hover:bg-amber-50 flex items-center gap-2.5 transition-colors"
                      >
                        <Store className="w-4 h-4 text-amber-700" />
                        <span>لوحة تحكم الورشة والمنتجات</span>
                      </button>
                    )}

                    {/* Admin Specific Links */}
                    {currentRole === 'admin' && (
                      <button
                        type="button"
                        id="admin-dash-link"
                        onClick={() => {
                          setActivePage('admin-dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-right px-4 py-2.5 text-xs sm:text-sm text-purple-900 font-bold hover:bg-purple-50 flex items-center gap-2.5 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-purple-700" />
                        <span>لوحة إدارة المنصة والرقابة</span>
                      </button>
                    )}

                    <div className="border-t border-[#F3EFE9] my-1" />

                    {/* Real Logout Action */}
                    <button
                      type="button"
                      id="auth-logout-btn"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-right px-4 py-2.5 text-xs sm:text-sm text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 font-bold transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-[#2D2A26] hover:bg-[#F3EFE9] rounded-xl transition-colors"
              aria-label="القائمة الرئيسية"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Expand */}
        {mobileSearchOpen && (
          <div className="lg:hidden pb-3">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                id="mobile-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن: فخار، كليم، عسل، تلي..."
                className="w-full bg-[#F3EFE9] text-sm text-[#2D2A26] rounded-xl pl-10 pr-4 py-2.5 border border-[#E8E1D9] outline-none"
              />
              <button
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-[#B45F42]"
                aria-label="بحث"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Desktop Secondary Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 pb-3 border-t border-[#E8E1D9]/70 pt-2.5">
          {publicNavLinks.map((link) => {
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                type="button"
                id={`nav-link-${link.id}`}
                onClick={() => setActivePage(link.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${isActive
                    ? 'bg-[#B45F42] text-white shadow-xs'
                    : 'text-[#54493F] hover:text-[#B45F42] hover:bg-[#F3EFE9]'
                  }`}
              >
                <span>{link.label}</span>
              </button>
            );
          })}

          {/* Role-Specific Quick Buttons in Desktop Bar */}
          {isAuthenticated && currentRole === 'seller' && (
            <button
              type="button"
              id="nav-quick-seller"
              onClick={() => setActivePage('seller-dashboard')}
              className="mr-auto flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 shadow-xs transition-colors"
            >
              <Store className="w-4 h-4" />
              <span>لوحة تحكم ورشتك</span>
            </button>
          )}

          {isAuthenticated && currentRole === 'admin' && (
            <button
              type="button"
              id="nav-quick-admin"
              onClick={() => setActivePage('admin-dashboard')}
              className="mr-auto flex items-center gap-1.5 px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-bold hover:bg-purple-800 shadow-xs transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>لوحة الإدارة العليا</span>
            </button>
          )}

          {isAuthenticated && currentRole === 'buyer' && (
            <button
              type="button"
              id="nav-quick-orders"
              onClick={() => setActivePage('orders')}
              className="mr-auto flex items-center gap-1.5 px-4 py-2 bg-[#F3EFE9] text-[#2D2A26] hover:bg-[#E8E1D9] rounded-xl text-xs font-bold border border-[#E8E1D9] transition-colors"
            >
              <PackageCheck className="w-4 h-4 text-[#B45F42]" />
              <span>متابعة طلباتي</span>
            </button>
          )}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer"
          className="md:hidden bg-[#FDFBF7] border-b border-[#E8E1D9] px-4 py-4 space-y-3 animate-in slide-in-from-top-4"
        >
          {/* User Status Card on Mobile */}
          {isAuthenticated ? (
            <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#E8E1D9] shadow-2xs">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.profileImage?.secureUrl || currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-xl object-cover border border-[#E8E1D9]"
                />
                <div>
                  <span className="text-sm font-bold text-[#2D2A26] block leading-tight">{currentUser.name}</span>
                  <span className="text-xs text-[#7A6F64] block">{currentUser.email}</span>
                </div>
              </div>
              <button
                type="button"
                id="mobile-logout-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200"
              >
                خروج
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 p-2 bg-[#F3EFE9] rounded-2xl">
              <button
                type="button"
                id="mobile-login-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalTab('login');
                  setIsAuthModalOpen(true);
                }}
                className="py-2.5 bg-white text-[#2D2A26] text-xs font-bold rounded-xl text-center shadow-2xs"
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                id="mobile-register-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalTab('register');
                  setIsAuthModalOpen(true);
                }}
                className="py-2.5 bg-[#B45F42] text-white text-xs font-bold rounded-xl text-center shadow-xs"
              >
                إنشاء حساب
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1">
            {publicNavLinks.map((link) => {
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
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-right transition-colors ${isActive ? 'bg-[#B45F42] text-white' : 'text-[#2D2A26] hover:bg-[#F3EFE9]'
                    }`}
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-4 h-4 opacity-70" />
                </button>
              );
            })}
          </div>

          {/* Protected Links in Mobile Menu if Authenticated */}
          {isAuthenticated && (
            <div className="border-t border-[#E8E1D9] pt-2 space-y-1">
              <button
                type="button"
                id="mobile-account-link"
                onClick={() => {
                  setActivePage('buyer-account');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-[#2D2A26] hover:bg-[#F3EFE9]"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#B45F42]" />
                  <span>الملف الشخصي وإعدادات الحساب</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </button>

              {currentRole === 'seller' && (
                <button
                  type="button"
                  id="mobile-seller-link"
                  onClick={() => {
                    setActivePage('seller-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100"
                >
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-700" />
                    <span>لوحة تحكم الورشة</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-70" />
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
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-purple-900 bg-purple-50 hover:bg-purple-100"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-purple-700" />
                    <span>لوحة إدارة المنصة</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-70" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
