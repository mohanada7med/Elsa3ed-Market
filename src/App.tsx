import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/layout/ToastContainer';
import { IntroExperience } from './components/layout/IntroExperience';
import { CartDrawer } from './components/cart/CartDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { ForceChangePasswordModal } from './components/auth/ForceChangePasswordModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { updatePageSEO } from './utils/seo';
import { MobileBottomBar } from './components/layout/MobileBottomBar';

// Pages
import { HomePage } from './components/pages/HomePage';
import { ProductsPage } from './components/pages/ProductsPage';
import { ProductDetailsView } from './components/products/ProductDetailsView';
import { CategoriesPage } from './components/pages/CategoriesPage';
import { CraftsPage } from './components/pages/CraftsPage';
import { SellersDirectoryPage } from './components/pages/SellersDirectoryPage';
import { SellerProfileView } from './components/pages/SellerProfileView';
import { CheckoutPage } from './components/pages/CheckoutPage';
import { OrdersTrackingPage } from './components/pages/OrdersTrackingPage';
import { FavoritesPage } from './components/pages/FavoritesPage';
import { BuyerAccountPage } from './components/pages/BuyerAccountPage';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AboutSection } from './components/public/AboutSection';
import { WholesalePage } from './components/pages/WholesalePage';
import { NotFoundPage } from './components/pages/NotFoundPage';
import { WhatsAppButton } from './components/common/WhatsAppButton';

const MainContent: React.FC = () => {
  const {
    activePage,
    setActivePage,
    selectedProductId,
    selectedSellerId,
    products,
    isAuthChecking,
    isAuthenticated,
    currentRole,
    setIsAuthModalOpen,
    setAuthModalTab
  } = useApp();
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Initial Auth Verification State (Prevents flash of logged-out or unauthorized screens on refresh)
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-[#E8E1D9] border-t-[#B45F42] animate-spin" />
            <img
              src="https://res.cloudinary.com/kuana1nl/image/upload/v1787864171/elsa3ed_market2.png"
              alt="سوق الصعيد"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-heritage text-[#2D2A26]">سوق الصعيد</h2>
            <p className="text-xs text-[#7A6F64] mt-1">جاري التحقق من بيانات الجلسة واستعادة حسابك...</p>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic SEO meta updates on page transition
  useEffect(() => {
    switch (activePage) {
      case 'home':
        updatePageSEO({
          title: 'الرئيسية',
          description: 'سوق الصعيد - المنصة المعتمدة لتسوق الحرف اليدوية والفخار والكليم والعسل والخيرات التراثية مباشرة من ورش الصعيد.'
        });
        break;
      case 'products':
        updatePageSEO({
          title: 'معرض المنتجات التراثية',
          description: 'تصفح تشكيلة واسعة من روائع الحرف الصعيدية الأصيلة بأسعار الورش وضمان الجودة والشحن الآمن.'
        });
        break;
      case 'categories':
        updatePageSEO({
          title: 'الأقسام والحرف التراثية',
          description: 'استكشف تصنيفات الحرف الصعيدية: الفخار والخزف، المنسوجات والكليم، المشغولات الخشبية، وخيرات الطبيعة.'
        });
        break;
      case 'crafts':
        updatePageSEO({
          title: 'قصص الحرفيين وموسوعة التراث',
          description: 'تعرف على حكايات الأسطوات وتاريخ صناعة الفخار القناوي وسجاد أخميم والفضة النوبية.'
        });
        break;
      case 'sellers':
        updatePageSEO({
          title: 'دليل الورش والحرفيين',
          description: 'تواصل مع كبار شيوخ الصنعة وأصحاب الورش المعتمدة في قنا وأسوان وسوهاج وأسيوط.'
        });
        break;
      case 'checkout':
        updatePageSEO({
          title: 'إتمام الطلب والدفع الآمن',
          description: 'بوابة الدفع والشحن الآمن لطلبات سوق الصعيد.'
        });
        break;
      case 'orders':
        updatePageSEO({
          title: 'تتبع الطلبات والشحنات',
          description: 'متابعة حية لمسار شحن طلباتك الحرفية من محافظات الصعيد حتى باب منزلك.'
        });
        break;
      case 'favorites':
        updatePageSEO({
          title: 'المفضلة وقائمة الرغبات',
          description: 'منتجاتك التراثية المفضلة المحفوظة في سوق الصعيد.'
        });
        break;
      case 'about':
        updatePageSEO({
          title: 'عن منصة سوق الصعيد',
          description: 'رسالتنا في دعم الحرفيين وتمكين التراث الصعيدي المصري وربطه بالأسواق العالمية.'
        });
        break;
      default:
        break;
    }
  }, [activePage, selectedProduct, selectedSellerId]);

  return (
    <main className="min-h-screen flex flex-col justify-between bg-[#faf6f0]">
      <div>
        <Header />

        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            id="main-route-container"
          >
            {activePage === 'home' && <HomePage />}
            {activePage === 'products' && <ProductsPage />}
            {activePage === 'product-details' && <ProductDetailsView />}
            {activePage === 'categories' && <CategoriesPage />}
            {activePage === 'crafts' && <CraftsPage />}
            {activePage === 'sellers' && <SellersDirectoryPage />}
            {activePage === 'seller-details' && <SellerProfileView />}

            {/* Checkout: Requires Authentication */}
            {activePage === 'checkout' && (
              isAuthenticated ? (
                <CheckoutPage />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-[#E8E1D9] shadow-xl text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#B45F42]/10 text-[#B45F42] flex items-center justify-center mx-auto text-2xl">
                    🔒
                  </div>
                  <h2 className="text-xl font-bold text-[#2D2A26]">تسجيل الدخول لإتمام الطلب</h2>
                  <p className="text-sm text-[#7A6F64] leading-relaxed">
                    يرجى تسجيل الدخول أو إنشاء حساب جديد لحفظ بيانات الشحن ومتابعة حالة طلبك التراثي.
                  </p>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-3 bg-[#B45F42] hover:bg-[#9E4F36] text-white font-bold rounded-xl shadow-md text-sm transition-all"
                    >
                      تسجيل الدخول للمتابعة
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePage('products')}
                      className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-all"
                    >
                      متابعة التسوق أولاً
                    </button>
                  </div>
                </div>
              )
            )}

            {activePage === 'orders' && <OrdersTrackingPage />}
            {activePage === 'favorites' && <FavoritesPage />}

            {/* Buyer Account: Requires Authentication */}
            {activePage === 'buyer-account' && (
              isAuthenticated ? (
                <BuyerAccountPage />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-[#E8E1D9] shadow-xl text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-2xl">
                    👤
                  </div>
                  <h2 className="text-xl font-bold text-[#2D2A26]">إعدادات الحساب الشخصي</h2>
                  <p className="text-sm text-[#7A6F64] leading-relaxed">
                    يرجى تسجيل الدخول للوصول إلى بياناتك الشخصية وعناوين الشحن المحفوظة.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full py-3 bg-[#B45F42] hover:bg-[#9E4F36] text-white font-bold rounded-xl shadow-md text-sm transition-all"
                  >
                    تسجيل الدخول الآن
                  </button>
                </div>
              )
            )}

            {/* Seller Dashboard: Requires Seller or Admin Role */}
            {activePage === 'seller-dashboard' && (
              isAuthenticated && (currentRole === 'seller' || currentRole === 'admin') ? (
                <SellerDashboard />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-amber-200 shadow-xl text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-2xl">
                    🏺
                  </div>
                  <h2 className="text-xl font-bold text-[#2D2A26]">لوحة تحكم ورش الصعيد</h2>
                  <p className="text-sm text-[#7A6F64] leading-relaxed">
                    هذه اللوحة مخصصة لحسابات شيوخ الصنعة وأصحاب الورش المعتمدة. يرجى تسجيل الدخول بحساب ورشتك أو تقديم طلب انضمام كبائع.
                  </p>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-md text-sm transition-all"
                    >
                      تسجيل دخول البائع
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalTab('register');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-2.5 bg-white border border-[#E8E1D9] text-[#2D2A26] font-bold rounded-xl text-xs hover:bg-[#F3EFE9] transition-all"
                    >
                      تقديم طلب انضمام ورشة جديدة
                    </button>
                  </div>
                </div>
              )
            )}

            {/* Admin Dashboard: Requires Admin Role */}
            {activePage === 'admin-dashboard' && (
              isAuthenticated && currentRole === 'admin' ? (
                <AdminDashboard />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-purple-200 shadow-xl text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mx-auto text-2xl">
                    🛡️
                  </div>
                  <h2 className="text-xl font-bold text-[#2D2A26]">منطقة الإدارة العليا</h2>
                  <p className="text-sm text-[#7A6F64] leading-relaxed">
                    هذه اللوحة مخصصة لمديري منصة سوق الصعيد فقط. يرجى تسجيل الدخول بالحساب الإداري المصرح له.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-md text-sm transition-all"
                  >
                    تسجيل الدخول الإداري
                  </button>
                </div>
              )
            )}

            {activePage === 'about' && (
              <div className="py-8">
                <AboutSection />
              </div>
            )}

            {activePage === 'wholesale' && <WholesalePage />}

            {![
              'home',
              'products',
              'product-details',
              'categories',
              'crafts',
              'sellers',
              'seller-details',
              'checkout',
              'orders',
              'favorites',
              'buyer-account',
              'seller-dashboard',
              'admin-dashboard',
              'about',
              'wholesale'
            ].includes(activePage) && <NotFoundPage />}
          </motion.div>
        </AnimatePresence>
      </div>

      <Footer />

      {/* Floating Direct WhatsApp Support & Inquiries */}
      <WhatsAppButton />

      {/* Persistent Mobile Bottom Navigation Bar (Phones & Small Tablets) */}
      <MobileBottomBar />

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <AuthModal />
      <ForceChangePasswordModal />
      <IntroExperience />
      <ToastContainer />
    </main>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
