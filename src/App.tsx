import React, { useEffect, useState } from 'react';
import WahIntro from './components/WahIntro';
import { AppProvider, useApp, PAGE_ROUTES } from './context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/layout/ToastContainer';
import { GlobalConfirmModal } from './components/common/GlobalConfirmModal';
import { IntroExperience } from './components/layout/IntroExperience';
import { CartDrawer } from './components/cart/CartDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { ForceChangePasswordModal } from './components/auth/ForceChangePasswordModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { updatePageSEO, generateBreadcrumbSchema } from './utils/seo';
import { MobileBottomBar } from './components/layout/MobileBottomBar';

// Pages
import { HomePage } from './components/pages/HomePage';

// Dynamic code-splitting for all secondary pages so initial bundle is tiny & super fast
const ProductsPage = React.lazy(() =>
  import('./components/pages/ProductsPage').then((m) => ({ default: m.ProductsPage }))
);
const ProductDetailsView = React.lazy(() =>
  import('./components/products/ProductDetailsView').then((m) => ({ default: m.ProductDetailsView }))
);
const CategoriesPage = React.lazy(() =>
  import('./components/pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage }))
);
const CraftsPage = React.lazy(() =>
  import('./components/pages/CraftsPage').then((m) => ({ default: m.CraftsPage }))
);
const SellersDirectoryPage = React.lazy(() =>
  import('./components/pages/SellersDirectoryPage').then((m) => ({ default: m.SellersDirectoryPage }))
);
const SellerProfileView = React.lazy(() =>
  import('./components/pages/SellerProfileView').then((m) => ({ default: m.SellerProfileView }))
);
const CheckoutPage = React.lazy(() =>
  import('./components/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);
const FavoritesPage = React.lazy(() =>
  import('./components/pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage }))
);
const BuyerAccountPage = React.lazy(() =>
  import('./components/pages/BuyerAccountPage').then((m) => ({ default: m.BuyerAccountPage }))
);
const AboutSection = React.lazy(() =>
  import('./components/public/AboutSection').then((m) => ({ default: m.AboutSection }))
);
const CartPage = React.lazy(() =>
  import('./components/pages/CartPage').then((m) => ({ default: m.CartPage }))
);
const ChatView = React.lazy(() =>
  import('./components/chat/ChatView').then((m) => ({ default: m.ChatView }))
);
const ForbiddenPage = React.lazy(() =>
  import('./components/pages/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage }))
);

// WAH Upper Egypt Digital Platform Pages (Lazy Loaded)
const GovernoratesPage = React.lazy(() =>
  import('./components/pages/GovernoratesPage').then((m) => ({ default: m.GovernoratesPage }))
);
const GovernorateDetailPage = React.lazy(() =>
  import('./components/pages/GovernorateDetailPage').then((m) => ({ default: m.GovernorateDetailPage }))
);
const PlacesHeritagePage = React.lazy(() =>
  import('./components/pages/PlacesHeritagePage').then((m) => ({ default: m.PlacesHeritagePage }))
);
const PlaceDetailPage = React.lazy(() =>
  import('./components/pages/PlaceDetailPage').then((m) => ({ default: m.PlaceDetailPage }))
);
const CulturalCraftsPage = React.lazy(() =>
  import('./components/pages/CulturalCraftsPage').then((m) => ({ default: m.CulturalCraftsPage }))
);
const CulturalCraftDetailPage = React.lazy(() =>
  import('./components/pages/CulturalCraftDetailPage').then((m) => ({ default: m.CulturalCraftDetailPage }))
);
const StoriesPage = React.lazy(() =>
  import('./components/pages/StoriesPage').then((m) => ({ default: m.StoriesPage }))
);
const StoryDetailPage = React.lazy(() =>
  import('./components/pages/StoryDetailPage').then((m) => ({ default: m.StoryDetailPage }))
);
const PeoplePage = React.lazy(() =>
  import('./components/pages/PeoplePage').then((m) => ({ default: m.PeoplePage }))
);
const PersonDetailPage = React.lazy(() =>
  import('./components/pages/PersonDetailPage').then((m) => ({ default: m.PersonDetailPage }))
);
const FoodHeritagePage = React.lazy(() =>
  import('./components/pages/FoodHeritagePage').then((m) => ({ default: m.FoodHeritagePage }))
);
const FoodDetailPage = React.lazy(() =>
  import('./components/pages/FoodDetailPage').then((m) => ({ default: m.FoodDetailPage }))
);
const EventsPage = React.lazy(() =>
  import('./components/pages/EventsPage').then((m) => ({ default: m.EventsPage }))
);
const EventDetailPage = React.lazy(() =>
  import('./components/pages/EventDetailPage').then((m) => ({ default: m.EventDetailPage }))
);
const GlobalSearchResultsPage = React.lazy(() =>
  import('./components/pages/GlobalSearchResultsPage').then((m) => ({ default: m.GlobalSearchResultsPage }))
);
const NotificationsPage = React.lazy(() =>
  import('./components/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage }))
);
const ResetPasswordPage = React.lazy(() =>
  import('./components/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
);
const NotFoundPage = React.lazy(() =>
  import('./components/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

import { WhatsAppButton } from './components/common/WhatsAppButton';

// Dynamic code-splitting for heavy non-public dashboard and heavy standalone page bundles
const SellerDashboard = React.lazy(() =>
  import('./components/seller/SellerDashboard').then((m) => ({ default: m.SellerDashboard }))
);
const AdminDashboard = React.lazy(() =>
  import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const WholesalePage = React.lazy(() =>
  import('./components/pages/WholesalePage').then((m) => ({ default: m.WholesalePage }))
);
const CulturalCmsAdminPage = React.lazy(() =>
  import('./components/pages/CulturalCmsAdminPage').then((m) => ({ default: m.CulturalCmsAdminPage }))
);
const AdminMapEditorPage = React.lazy(() =>
  import('./components/pages/AdminMapEditorPage').then((m) => ({ default: m.AdminMapEditorPage }))
);
const UpperEgyptMapPage = React.lazy(() =>
  import('./components/pages/UpperEgyptMapPage').then((m) => ({ default: m.UpperEgyptMapPage }))
);
const CraftReelsPage = React.lazy(() =>
  import('./components/pages/CraftReelsPage').then((m) => ({ default: m.CraftReelsPage }))
);
const DialectDictionaryPage = React.lazy(() =>
  import('./components/pages/quize').then((m) => ({ default: m.DialectDictionaryPage }))
);
const OrdersTrackingPage = React.lazy(() =>
  import('./components/pages/OrdersTrackingPage').then((m) => ({ default: m.OrdersTrackingPage }))
);

const LazySectionFallback: React.FC = () => (
  <div className="min-h-[380px] flex flex-col items-center justify-center p-8 text-center" dir="rtl">
    <div className="w-10 h-10 border-3 border-[#9a6a35]/20 border-t-[#9a6a35] rounded-full animate-spin mb-3" />
    <p className="text-xs font-bold text-[#9a6a35]">وَه | جاري فتح الصفحة...</p>
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
    currentUser,
    currentRole,
    setIsAuthModalOpen,
    setAuthModalTab
  } = useApp();

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const [showIntro, setShowIntro] = useState(false);

  // Dynamic SEO meta updates on page transition
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
          description: 'تصفح تشكيلة واسعة من روائع الحرف الصعيدية الأصيلة بأسعار الورش وضمان الجودة والشحن الآمن.',
          schema: generateBreadcrumbSchema([{ name: 'الرئيسية' }, { name: 'المقتنيات وسوق وه' }])
        });
        break;
      case 'categories':
        updatePageSEO({
          title: 'الأقسام والحرف التراثية',
          description: 'استكشف تصنيفات الحرف الصعيدية: الفخار والخزف، المنسوجات والكليم، المشغولات الخشبية، وخيرات الطبيعة.',
          schema: generateBreadcrumbSchema([{ name: 'الرئيسية' }, { name: 'الأقسام والتصنيفات' }])
        });
        break;
      case 'crafts':
        updatePageSEO({
          title: 'قصص الحرفيين وموسوعة التراث',
          description: 'تعرف على حكايات الأسطوات وتاريخ صناعة الفخار القناوي وسجاد أخميم والفضة النوبية.',
          schema: generateBreadcrumbSchema([{ name: 'الرئيسية' }, { name: 'قصص الحرفيين وموسوعة التراث' }])
        });
        break;
      case 'reels':
        updatePageSEO({
          title: 'فيديوهات الحرفيين التفاعلية (وه Reels)',
          description: 'شاهد مقاطع فيديو حية للحرفيين وهم يصنعون الفخار والكليم والنحاس واشترِ القطعة فوراً من الورشة.',
          schema: generateBreadcrumbSchema([{ name: 'الرئيسية' }, { name: 'فيديوهات الصنعة والورش' }])
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
          title: 'لفة في الصعيد ورحلة النيل | وه',
          description: 'استكشف محافظات صعيد مصر ومعالمها التراثية وحرفها وأسواقها على الأطلس التفاعلي ومسار رحلة النيل التراثية.'
        });
        break;
      case 'governorates':
      case 'governorate-details':
        updatePageSEO({
          title: 'محافظات صعيد مصر | وه',
          description: 'دليل شامل لكافة محافظات الصعيد من الفيوم حتى أسوان وحلايب وشلاتين.',
          schema: generateBreadcrumbSchema([{ name: 'الرئيسية' }, { name: 'محافظات صعيد مصر' }])
        });
        break;
      case 'places':
      case 'place-details':
        updatePageSEO({
          title: 'المعالم والتراث المعماري | وه',
          description: 'توثيق المعابد، القلاع، الأديرة، المساجد العتيقة، والبيوت التراثية بالصعيد.',
          schema: generateBreadcrumbSchema([{ name: 'الرئيسية' }, { name: 'المعالم والتراث المعماري' }])
        });
        break;
      case 'cultural-crafts':
      case 'craft-details':
        updatePageSEO({
          title: 'موسوعة الحرف والورش التراثية | وه',
          description: 'أسرار صنائع الأجداد: الفخار، التلي، الفركة، الخزف، والألباستر.',
          schema: generateBreadcrumbSchema([{ name: 'الرئيسية' }, { name: 'موسوعة الحرف والورش التراثية' }])
        });
        break;
      case 'stories':
      case 'story-details':
        updatePageSEO({
          title: 'وه بيحكي — حكايات ومرويات الصعيد | وه',
          description: 'مستودع المرويات الشفاهية والسيرة الهلالية وأساطير النيل والجبل بالصعيد.',
          schema: generateBreadcrumbSchema([{ name: 'الرئيسية' }, { name: 'حكايات ومرويات الصعيد' }])
        });
        break;
      case 'people':
      case 'person-details':
        updatePageSEO({
          title: 'ناس الصعيد وحراس التراث | وه',
          description: 'سير ومسيرات شيوخ الصنعة والرواة والفنانين التلقائيين في صعيد مصر.',
          schema: generateBreadcrumbSchema([{ name: 'الرئيسية' }, { name: 'ناس الصعيد وحراس التراث' }])
        });
        break;
      case 'food':
      case 'food-details':
        updatePageSEO({
          title: 'طعم الصعيد — المطبخ التراثي | وه',
          description: 'توثيق أكلات ومخبوزات الصعيد الأصيلة وسر الطبخ في الفرن البلدي.',
          schema: generateBreadcrumbSchema([{ name: 'الرئيسية' }, { name: 'طعم الصعيد والمطبخ التراثي' }])
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
      case 'admin-map-editor':
        updatePageSEO({
          title: 'محرر إحداثيات الخريطة التفاعلية (GIS) | وه',
          description: 'لوحة التحكم الإدارية لضبط إحداثيات ومواقع معالم ومحافظات صعيد مصر.'
        });
        break;
      case 'quize':
      case 'dialect-dictionary':
        updatePageSEO({
          title: 'تحدي اللهجة الصعيدية | وه',
          description: 'اختبر معرفتك بلهجة ومفردات أهل الصعيد في 10 أسئلة سريعة وممتعة.'
        });
        break;
      default:
        break;
    }
  }, [activePage, selectedProduct, selectedSellerId]);

  if (showIntro) {
    return (
      <WahIntro onFinish={() => setShowIntro(false)}
      />
    );
  }

  // Initial Auth Verification State: only block for protected accounts/dashboards
  const isProtectedRoute =
    activePage.startsWith('admin') ||
    activePage.startsWith('seller') ||
    activePage === 'buyer-account';

  if (isAuthChecking && isProtectedRoute) {
    return <WahIntro onFinish={() => { }} />;
  }

  return (
    <main className="min-h-screen flex flex-col justify-between bg-[#eee8dc] dark:bg-[#0b0b0a] text-[#211d18] dark:text-[#f5f0e7] transition-colors duration-500">
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
            <React.Suspense fallback={<LazySectionFallback />}>
              {activePage === 'home' && <HomePage />}
              {(activePage === 'products' || activePage === 'search' || activePage === 'market' || activePage === 'wah-market') && <ProductsPage />}
              {(activePage === 'product-details' || activePage === 'product-detail') && <ProductDetailsView />}
              {activePage === 'categories' && <CategoriesPage />}
              {activePage === 'category-details' && <ProductsPage />}
              {activePage === 'crafts' && <CraftsPage />}
              {activePage === 'reels' && (
                <React.Suspense fallback={<LazySectionFallback />}>
                  <CraftReelsPage />
                </React.Suspense>
              )}
              {activePage === 'sellers' && <SellersDirectoryPage />}
              {activePage === 'seller-details' && <SellerProfileView />}

              {/* Cart */}
              {activePage === 'cart' && (
                isAuthenticated && (currentRole === 'seller' || currentRole === 'admin') ? (
                  <ForbiddenPage />
                ) : (
                  <CartPage />
                )
              )}

              {/* Checkout */}
              {activePage === 'checkout' && (
                isAuthenticated && (currentRole === 'seller' || currentRole === 'admin') ? (
                  <ForbiddenPage />
                ) : isAuthenticated ? (
                  <CheckoutPage />
                ) : (
                  <div className="max-w-md mx-auto my-16 p-8 bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-xl text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#9a6a35]/10 text-[#9a6a35] flex items-center justify-center mx-auto text-2xl">
                      🔒
                    </div>
                    <h2 className="text-xl font-bold font-serif">تسجيل الدخول لإتمام الطلب</h2>
                    <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                      يرجى تسجيل الدخول أو إنشاء حساب جديد لحفظ بيانات الشحن ومتابعة حالة طلبك التراثي.
                    </p>
                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalTab('login');
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full py-3 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] font-bold rounded-xl shadow-md text-xs transition-all cursor-pointer"
                      >
                        تسجيل الدخول للمتابعة
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePage('products')}
                        className="w-full py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 text-black/70 dark:text-white/70 font-bold rounded-xl text-xs transition-all cursor-pointer border border-black/10 dark:border-white/10"
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
                  <React.Suspense fallback={<LazySectionFallback />}>
                    <OrdersTrackingPage />
                  </React.Suspense>
                )
              )}

              {activePage === 'favorites' && (
                isAuthenticated && (currentRole === 'seller' || currentRole === 'admin') ? (
                  <ForbiddenPage />
                ) : (
                  <FavoritesPage />
                )
              )}

              {/* Notifications */}
              {activePage === 'notifications' && <NotificationsPage />}

              {/* Live Chat */}
              {activePage === 'messages' && (
                isAuthenticated ? (
                  <ChatView isSellerMode={currentRole === 'seller'} />
                ) : (
                  <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-[#d6aa72] flex items-center justify-center mx-auto text-2xl">
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

              {/* Buyer Account */}
              {(activePage === 'buyer-account' || activePage === 'profile') && (
                isAuthenticated ? (
                  <BuyerAccountPage />
                ) : (
                  <div className="max-w-md mx-auto my-16 p-8 bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 shadow-xl text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d] flex items-center justify-center mx-auto text-2xl border border-[#9a6a35]/20">
                      👤
                    </div>
                    <h2 className="text-xl font-bold text-[#211d18] dark:text-[#f5f0e7]">إعدادات الحساب الشخصي</h2>
                    <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">
                      يرجى تسجيل الدخول للوصول إلى بياناتك الشخصية وعناوين الشحن المحفوظة.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-3.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] font-bold rounded-xl shadow-md text-sm transition-all cursor-pointer"
                    >
                      تسجيل الدخول الآن
                    </button>
                  </div>
                )
              )}

              {/* Seller Dashboard */}
              {activePage.startsWith('seller-') && activePage !== 'seller-details' && (isAuthenticated && (currentRole === 'seller' || currentRole === 'admin') && currentUser?.sellerStatus !== 'pending' && currentUser?.sellerStatus !== 'rejected' ? (
                <React.Suspense fallback={<LazySectionFallback />}>
                  <SellerDashboard />
                </React.Suspense>
              ) : isAuthenticated && currentUser?.sellerStatus === 'pending' ? (
                <div className="max-w-lg mx-auto my-16 p-8 bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-amber-500/20 shadow-xl text-center space-y-4" dir="rtl">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-[#d6aa72] flex items-center justify-center mx-auto text-2xl border border-amber-500/20">
                    ⏳
                  </div>
                  <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold">
                    طلبك قيد المراجعة والاعتماد
                  </span>
                  <h2 className="text-xl font-bold text-[#211d18] dark:text-[#f5f0e7]">
                    طلب انضمام ورشتك قيد الفحص الإداري
                  </h2>
                  <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">
                    تم استلام طلب اعتماد ورشة "{currentUser.seller?.brandName || 'ورشة الحرفي'}" بنجاح، ويجري حالياً تدقيق البيانات والمعايير التراثية من قبل إدارة منصة وه. ستتمكن من إضافة المنتجات وإدارة المتجر فور صدور الاعتماد.
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                    <button
                      type="button"
                      onClick={() => setActivePage('buyer-account')}
                      className="px-5 py-3 bg-[#9a6a35] hover:bg-[#744e26] text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      متابعة حالة الطلب في حسابي
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePage('home')}
                      className="px-5 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] font-bold rounded-xl text-xs hover:bg-black/10 transition-all cursor-pointer"
                    >
                      العودة للرئيسية
                    </button>
                  </div>
                </div>
              ) : isAuthenticated && currentUser?.sellerStatus === 'rejected' ? (
                <div className="max-w-lg mx-auto my-16 p-8 bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-rose-500/20 shadow-xl text-center space-y-4" dir="rtl">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-2xl border border-rose-500/20">
                    ⚠️
                  </div>
                  <span className="inline-block px-3 py-1 bg-rose-500/10 text-rose-700 dark:text-rose-300 rounded-full text-xs font-bold">
                    تم رفض طلب الاعتماد
                  </span>
                  <h2 className="text-xl font-bold text-[#211d18] dark:text-[#f5f0e7]">
                    لم يتم قبول طلب الانضمام كبائع
                  </h2>
                  <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">
                    {currentUser.seller?.rejectionReason || 'عفواً، لم يستوفِ الطلب المعايير التراثية المعتمدة للمنصة في الوقت الحالي.'}
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                    <button
                      type="button"
                      onClick={() => setActivePage('buyer-account')}
                      className="px-5 py-3 bg-[#9a6a35] hover:bg-[#744e26] text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      تعديل وإعادة تقديم الطلب
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePage('home')}
                      className="px-5 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] font-bold rounded-xl text-xs hover:bg-black/10 transition-all cursor-pointer"
                    >
                      تصفح السوق
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 shadow-xl text-center space-y-4" dir="rtl">
                  <div className="w-16 h-16 rounded-2xl bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d] flex items-center justify-center mx-auto text-2xl border border-[#9a6a35]/20">
                    🏺
                  </div>
                  <h2 className="text-xl font-bold text-[#211d18] dark:text-[#f5f0e7]">لوحة تحكم ورش الصعيد</h2>
                  <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">
                    هذه اللوحة مخصصة لحسابات شيوخ الصنعة وأصحاب الورش المعتمدة. يرجى تسجيل الدخول بحساب ورشتك أو تقديم طلب انضمام كبائع.
                  </p>
                  <div className="pt-2 flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-3.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] font-bold rounded-xl shadow-md text-sm transition-all cursor-pointer"
                    >
                      تسجيل دخول البائع
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (isAuthenticated) {
                          setActivePage('buyer-account');
                        } else {
                          setAuthModalTab('register');
                          setIsAuthModalOpen(true);
                        }
                      }}
                      className="w-full py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] font-bold rounded-xl text-xs hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer"
                    >
                      تقديم طلب انضمام ورشة جديدة
                    </button>
                  </div>
                </div>
              ))}

              {/* Admin Dashboard */}
              {activePage.startsWith('admin-') && activePage !== 'admin-cultural-cms' && activePage !== 'admin-map-editor' && (
                isAuthenticated && currentRole === 'admin' ? (
                  <React.Suspense fallback={<LazySectionFallback />}>
                    <AdminDashboard />
                  </React.Suspense>
                ) : (
                  <div className="max-w-md mx-auto my-16 p-8 bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 shadow-xl text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d] flex items-center justify-center mx-auto text-2xl border border-[#9a6a35]/20">
                      🛡️
                    </div>
                    <h2 className="text-xl font-bold text-[#211d18] dark:text-[#f5f0e7]">منطقة الإدارة العليا</h2>
                    <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">
                      هذه اللوحة مخصصة لمديري منصة وه فقط. يرجى تسجيل الدخول بالحساب الإداري المصرح له.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-3.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] font-bold rounded-xl shadow-md text-sm transition-all cursor-pointer"
                    >
                      تسجيل الدخول الإداري
                    </button>
                  </div>
                )
              )}

              {activePage === 'reset-password' && <ResetPasswordPage />}

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
              {(activePage === 'map' || activePage === 'explore') && (
                <React.Suspense fallback={<LazySectionFallback />}>
                  <UpperEgyptMapPage />
                </React.Suspense>
              )}
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
              {(activePage === 'cultural-cms' || activePage === 'admin-cultural-cms') && (
                <React.Suspense fallback={<LazySectionFallback />}>
                  <CulturalCmsAdminPage />
                </React.Suspense>
              )}
              {activePage === 'admin-map-editor' && (
                <React.Suspense fallback={<LazySectionFallback />}>
                  <AdminMapEditorPage />
                </React.Suspense>
              )}

              {/* Dialect Dictionary & Quiz */}
              {(activePage === 'quize' || activePage === 'dialect-dictionary') && (
                <React.Suspense fallback={<LazySectionFallback />}>
                  <DialectDictionaryPage />
                </React.Suspense>
              )}

              {!PAGE_ROUTES[activePage] && <NotFoundPage />}
            </React.Suspense>
          </motion.div>
        </AnimatePresence>
      </div>

      <Footer />

      {/* Floating Direct WhatsApp Support & Inquiries */}
      <WhatsAppButton />

      {/* Persistent Mobile Bottom Navigation Bar */}
      <MobileBottomBar />

      {/* Global Modals & Drawers */}
      {(currentRole === 'buyer' || !isAuthenticated) && <CartDrawer />}
      <AuthModal />
      <ForceChangePasswordModal />
      <IntroExperience />
      <ToastContainer />
      <GlobalConfirmModal />
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