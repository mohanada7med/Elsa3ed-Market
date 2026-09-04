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
import { CraftReelsPage } from './components/pages/CraftReelsPage';
import { SellersDirectoryPage } from './components/pages/SellersDirectoryPage';
import { SellerProfileView } from './components/pages/SellerProfileView';
import { CheckoutPage } from './components/pages/CheckoutPage';
import { OrdersTrackingPage } from './components/pages/OrdersTrackingPage';
import { FavoritesPage } from './components/pages/FavoritesPage';
import { BuyerAccountPage } from './components/pages/BuyerAccountPage';
import { AboutSection } from './components/public/AboutSection';
import { CartPage } from './components/pages/CartPage';
import { ChatView } from './components/chat/ChatView';
import { ForbiddenPage } from './components/pages/ForbiddenPage';

// WAH Upper Egypt Digital Platform Pages
import { UpperEgyptMapPage } from './components/pages/UpperEgyptMapPage';
import { GovernoratesPage } from './components/pages/GovernoratesPage';
import { GovernorateDetailPage } from './components/pages/GovernorateDetailPage';
import { PlacesHeritagePage } from './components/pages/PlacesHeritagePage';
import { PlaceDetailPage } from './components/pages/PlaceDetailPage';
import { CulturalCraftsPage } from './components/pages/CulturalCraftsPage';
import { CulturalCraftDetailPage } from './components/pages/CulturalCraftDetailPage';
import { StoriesPage } from './components/pages/StoriesPage';
import { StoryDetailPage } from './components/pages/StoryDetailPage';
import { PeoplePage } from './components/pages/PeoplePage';
import { PersonDetailPage } from './components/pages/PersonDetailPage';
import { FoodHeritagePage } from './components/pages/FoodHeritagePage';
import { FoodDetailPage } from './components/pages/FoodDetailPage';
import { EventsPage } from './components/pages/EventsPage';
import { EventDetailPage } from './components/pages/EventDetailPage';
import { GlobalSearchResultsPage } from './components/pages/GlobalSearchResultsPage';
import { CulturalCmsAdminPage } from './components/pages/CulturalCmsAdminPage';

import { NotFoundPage } from './components/pages/NotFoundPage';
import { WhatsAppButton } from './components/common/WhatsAppButton';

// Dynamic code-splitting for heavy non-public dashboard bundles
const SellerDashboard = React.lazy(() =>
  import('./components/seller/SellerDashboard').then((m) => ({ default: m.SellerDashboard }))
);
const AdminDashboard = React.lazy(() =>
  import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const WholesalePage = React.lazy(() =>
  import('./components/pages/WholesalePage').then((m) => ({ default: m.WholesalePage }))
);

const LazySectionFallback: React.FC = () => (
  <div className="min-h-[420px] flex flex-col items-center justify-center p-8 text-center">
    <div className="w-12 h-12 border-4 border-[#E8E1D9] border-t-[#B45F42] rounded-full animate-spin mb-4" />
    <p className="text-sm font-bold text-[#2D2A26]">جاري تحميل لوحة التحكم...</p>
    <p className="text-xs text-[#7A6F64] mt-1">وه | WAH — العالم الرقمي لصعيد مصر</p>
  </div>
);

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

  // Dynamic SEO meta updates on page transition (called unconditionally at top of component)
  useEffect(() => {
    switch (activePage) {
      case 'home':
        updatePageSEO({
          title: 'الرئيسية',
          description: 'وه - العالم الرقمي لصعيد مصر لاكتشاف وتوثيق التراث والقرى والأكلات والحرف، وسوق وه المعتمد لتسوق منتجات الصعيد مباشرة من ورشها.'
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
      case 'reels':
        updatePageSEO({
          title: 'فيديوهات الحرفيين التفاعلية (وه Reels)',
          description: 'شاهد مقاطع فيديو حية للحرفيين وهم يصنعون الفخار والكليم والنحاس واشترِ القطعة فوراً من الورشة.'
        });
        break;
      case 'sellers':
        updatePageSEO({
          title: 'دليل الورش والحرفيين',
          description: 'تواصل مع كبار شيوخ الصنعة وأصحاب الورش المعتمدة في قنا وأسوان وسوهاج وأسيوط.'
        });
        break;
      case 'cart':
        updatePageSEO({
          title: 'سلة المشتريات التراثية',
          description: 'استعرض مشترياتك من المنتجات التراثية والحرفية من ورش الصعيد.'
        });
        break;
      case 'checkout':
        updatePageSEO({
          title: 'إتمام الطلب والدفع الآمن',
          description: 'بوابة الدفع والشحن الآمن لطلبات سوق وه.'
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
          description: 'منتجاتك التراثية المفضلة المحفوظة في منصة وه.'
        });
        break;
      case 'messages':
        updatePageSEO({
          title: 'المحادثات المباشرة',
          description: 'تواصل مباشر وفوري مع الحرفيين وشيوخ الصنعة في منصة وه.'
        });
        break;
      case 'about':
        updatePageSEO({
          title: 'عن منصة وه | العالم الرقمي لصعيد مصر',
          description: 'رسالتنا في توثيق وحفظ وإحياء تراث صعيد مصر وربطه بالعالم.'
        });
        break;
      case 'map':
        updatePageSEO({
          title: 'خريطة صعيد مصر التفاعلية | وه',
          description: 'استكشف محافظات صعيد مصر ومعالمها التراثية وحرفها وورشها على الخريطة التفاعلية.'
        });
        break;
      case 'governorates':
      case 'governorate-details':
        updatePageSEO({
          title: 'محافظات صعيد مصر | وه',
          description: 'دليل شامل لكافة محافظات الصعيد من الفيوم حتى أسوان وحلايب وشلاتين.'
        });
        break;
      case 'places':
      case 'place-details':
        updatePageSEO({
          title: 'المعالم والتراث المعماري | وه',
          description: 'توثيق المعابد، القلاع، الأديرة، المساجد العتيقة، والبيوت التراثية بالصعيد.'
        });
        break;
      case 'cultural-crafts':
      case 'craft-details':
        updatePageSEO({
          title: 'موسوعة الحرف والورش التراثية | وه',
          description: 'أسرار صنائع الأجداد: الفخار، التلي، الفركة، الخزف، والألباستر.'
        });
        break;
      case 'stories':
      case 'story-details':
        updatePageSEO({
          title: 'وه بيحكي — حكايات ومرويات الصعيد | وه',
          description: 'مستودع المرويات الشفاهية والسيرة الهلالية وأساطير النيل والجبل بالصعيد.'
        });
        break;
      case 'people':
      case 'person-details':
        updatePageSEO({
          title: 'ناس الصعيد وحراس التراث | وه',
          description: 'سير ومسيرات شيوخ الصنعة والرواة والفنانين التلقائيين في صعيد مصر.'
        });
        break;
      case 'food':
      case 'food-details':
        updatePageSEO({
          title: 'طعم الصعيد — المطبخ التراثي | وه',
          description: 'توثيق أكلات ومخبوزات الصعيد الأصيلة وسر الطبخ في الفرن البلدي.'
        });
        break;
      case 'events':
      case 'event-details':
        updatePageSEO({
          title: 'فعاليات ومواسم الصعيد | وه',
          description: 'أجندة الموالد ومواسم الحصاد والمهرجانات التراثية في محافظات الصعيد.'
        });
        break;
      case 'global-search':
        updatePageSEO({
          title: 'البحث الشامل | وه',
          description: 'ابحث في كافة معالم وحرف وحكايات وأكلات وناس ومنتجات صعيد مصر.'
        });
        break;
      case 'cultural-cms':
        updatePageSEO({
          title: 'لوحة التوثيق التراثي | وه',
          description: 'استوديو التوثيق وحفظ التراث وإدارة الموسوعة التراثية لصعيد مصر.'
        });
        break;
      default:
        break;
    }
  }, [activePage, selectedProduct, selectedSellerId]);

  // Initial Auth Verification State (rendered after all hooks)
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-[#E8E1D9] border-t-[#B45F42] animate-spin" />
            <img
              src="https://res.cloudinary.com/kuana1nl/image/upload/v1787864171/elsa3ed_market2.png"
              alt="وه | WAH"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-heritage text-[#2D2A26]">وه | WAH</h2>
            <p className="text-xs text-[#7A6F64] mt-1">جاري التحقق من بيانات الجلسة واستعادة حسابك...</p>
          </div>
        </div>
      </div>
    );
  }

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
            {(activePage === 'products' || activePage === 'search') && <ProductsPage />}
            {activePage === 'product-details' && <ProductDetailsView />}
            {activePage === 'categories' && <CategoriesPage />}
            {activePage === 'category-details' && <ProductsPage />}
            {activePage === 'crafts' && <CraftsPage />}
            {activePage === 'reels' && <CraftReelsPage />}
            {activePage === 'sellers' && <SellersDirectoryPage />}
            {activePage === 'seller-details' && <SellerProfileView />}

            {/* Cart: Buyer/Guest only. Forbidden for Seller and Admin */}
            {activePage === 'cart' && (
              isAuthenticated && (currentRole === 'seller' || currentRole === 'admin') ? (
                <ForbiddenPage />
              ) : (
                <CartPage />
              )
            )}

            {/* Checkout: Buyer only. Forbidden for Seller and Admin. Prompt login for guest */}
            {activePage === 'checkout' && (
              isAuthenticated && (currentRole === 'seller' || currentRole === 'admin') ? (
                <ForbiddenPage />
              ) : isAuthenticated ? (
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
                      className="w-full py-3 bg-[#B45F42] hover:bg-[#9E4F36] text-white font-bold rounded-xl shadow-md text-sm transition-all cursor-pointer"
                    >
                      تسجيل الدخول للمتابعة
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePage('products')}
                      className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      متابعة التسوق أولاً
                    </button>
                  </div>
                </div>
              )
            )}

            {(activePage === 'orders' || activePage === 'order-details') && (
              isAuthenticated && (currentRole === 'seller' || currentRole === 'admin') ? (
                <ForbiddenPage />
              ) : (
                <OrdersTrackingPage />
              )
            )}

            {activePage === 'favorites' && (
              isAuthenticated && (currentRole === 'seller' || currentRole === 'admin') ? (
                <ForbiddenPage />
              ) : (
                <FavoritesPage />
              )
            )}

            {/* Live Chat: Buyer & General Messages */}
            {activePage === 'messages' && (
              isAuthenticated ? (
                <ChatView isSellerMode={currentRole === 'seller'} />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto text-2xl">
                    💬
                  </div>
                  <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">المحادثة المباشرة مع الحرفيين</h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                    يرجى تسجيل الدخول لبدء أو استكمال محادثاتك مع ورش الحرف التراثية ومتابعة استفساراتك.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md text-sm transition-all cursor-pointer"
                  >
                    تسجيل الدخول للمحادثة
                  </button>
                </div>
              )
            )}

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
            {activePage.startsWith('seller-') && (
              isAuthenticated && (currentRole === 'seller' || currentRole === 'admin') ? (
                <React.Suspense fallback={<LazySectionFallback />}>
                  <SellerDashboard />
                </React.Suspense>
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
            {activePage.startsWith('admin-') && (
              isAuthenticated && currentRole === 'admin' ? (
                <React.Suspense fallback={<LazySectionFallback />}>
                  <AdminDashboard />
                </React.Suspense>
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-purple-200 shadow-xl text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mx-auto text-2xl">
                    🛡️
                  </div>
                  <h2 className="text-xl font-bold text-[#2D2A26]">منطقة الإدارة العليا</h2>
                  <p className="text-sm text-[#7A6F64] leading-relaxed">
                    هذه اللوحة مخصصة لمديري منصة وه فقط. يرجى تسجيل الدخول بالحساب الإداري المصرح له.
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

            {activePage === 'wholesale' && (
              <React.Suspense fallback={<LazySectionFallback />}>
                <WholesalePage />
              </React.Suspense>
            )}

            {/* WAH Upper Egypt Digital Platform Routes */}
            {(activePage === 'map' || activePage === 'explore') && <UpperEgyptMapPage />}
            {activePage === 'governorates' && <GovernoratesPage />}
            {activePage === 'governorate-details' && <GovernorateDetailPage />}
            {activePage === 'places' && <PlacesHeritagePage />}
            {activePage === 'place-details' && <PlaceDetailPage />}
            {activePage === 'cultural-crafts' && <CulturalCraftsPage />}
            {(activePage === 'craft-details' || activePage === 'cultural-craft-details') && <CulturalCraftDetailPage />}
            {activePage === 'stories' && <StoriesPage />}
            {activePage === 'story-details' && <StoryDetailPage />}
            {activePage === 'people' && <PeoplePage />}
            {activePage === 'person-details' && <PersonDetailPage />}
            {activePage === 'food' && <FoodHeritagePage />}
            {activePage === 'food-details' && <FoodDetailPage />}
            {activePage === 'events' && <EventsPage />}
            {activePage === 'event-details' && <EventDetailPage />}
            {activePage === 'global-search' && <GlobalSearchResultsPage />}
            {(activePage === 'cultural-cms' || activePage === 'admin-cultural-cms') && <CulturalCmsAdminPage />}

            {![
              'home',
              'products',
              'search',
              'product-details',
              'categories',
              'category-details',
              'crafts',
              'reels',
              'sellers',
              'seller-details',
              'cart',
              'checkout',
              'orders',
              'order-details',
              'favorites',
              'buyer-account',
              'seller-dashboard',
              'seller-products',
              'seller-inventory',
              'seller-orders',
              'seller-analytics',
              'seller-account',
              'admin-dashboard',
              'admin-sellers',
              'admin-products',
              'admin-buyers',
              'admin-orders',
              'admin-categories',
              'admin-discounts',
              'admin-reports',
              'admin-audit-logs',
              'admin-settings',
              'about',
              'wholesale',
              'map',
              'explore',
              'governorates',
              'governorate-details',
              'places',
              'place-details',
              'cultural-crafts',
              'cultural-craft-details',
              'craft-details',
              'stories',
              'story-details',
              'people',
              'person-details',
              'food',
              'food-details',
              'events',
              'event-details',
              'global-search',
              'cultural-cms',
              'admin-cultural-cms'
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
      {(currentRole === 'buyer' || !isAuthenticated) && <CartDrawer />}
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
