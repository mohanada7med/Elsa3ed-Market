
import React, { useEffect, useState } from 'react';
import WahIntro from './components/WahIntro';
import { AppProvider, useApp, PAGE_ROUTES } from './context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/layout/ToastContainer';
import { IntroExperience } from './components/layout/IntroExperience';
import { CartDrawer } from './components/cart/CartDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { ForceChangePasswordModal } from './components/auth/ForceChangePasswordModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { WahLoadingScreen } from './components/common/WahLoadingScreen';
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
import { FavoritesPage } from './components/pages/FavoritesPage';
import { BuyerAccountPage } from './components/pages/BuyerAccountPage';
import { AboutSection } from './components/public/AboutSection';
import { CartPage } from './components/pages/CartPage';
import { ChatView } from './components/chat/ChatView';
import { ForbiddenPage } from './components/pages/ForbiddenPage';

// WAH Upper Egypt Digital Platform Pages
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
import { NotificationsPage } from './components/pages/NotificationsPage';

import { NotFoundPage } from './components/pages/NotFoundPage';
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
  import('./components/pages/DialectDictionaryPage').then((m) => ({ default: m.DialectDictionaryPage }))
);
const OrdersTrackingPage = React.lazy(() =>
  import('./components/pages/OrdersTrackingPage').then((m) => ({ default: m.OrdersTrackingPage }))
);

const LazySectionFallback: React.FC = () => (
  <div className="min-h-[420px] flex flex-col items-center justify-center p-8 text-center" dir="rtl">
    <div className="w-12 h-12 border-4 border-black/10 dark:border-white/10 border-t-[#9a6a35] dark:border-t-[#d5a56d] rounded-full animate-spin mb-4" />
    <p className="text-sm font-bold text-[#211d18] dark:text-[#f5f0e7]">جاري تحميل لوحة التحكم...</p>
    <p className="text-xs text-black/60 dark:text-white/60 mt-1">وَه | WAH — العالم الرقمي لصعيد مصر</p>
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
  const [showIntro, setShowIntro] = useState(true);
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
          title: 'أطلس الصعيد التفاعلي ورحلة النيل | وه',
          description: 'استكشف محافظات صعيد مصر ومعالمها التراثية وحرفها وأسواقها على الأطلس التفاعلي ومسار رحلة النيل التراثية.'
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
      case 'admin-map-editor':
        updatePageSEO({
          title: 'محرر إحداثيات الخريطة التفاعلية (GIS) | وه',
          description: 'لوحة التحكم الإدارية لضبط إحداثيات ومواقع معالم ومحافظات صعيد مصر.'
        });
        break;
      case 'dialect-dictionary':
        updatePageSEO({
          title: 'معجم اللهجة والأمثال الصعيدية (الصعيدي الفصيح) | وه',
          description: 'توثيق تفاعلي حي لمفردات وحِكَم وأمثال صعيد مصر، وجذورها القبطية والفرعونية والعربية مع النطق الصوتي واختبار اللهجة.'
        });
        break;
      default:
        break;
    }
  }, [activePage, selectedProduct, selectedSellerId]);
  if (showIntro) {
    return (
      <WahIntro
        onEnter={() => setShowIntro(false)}
      />
    );
  }
  // Initial Auth Verification State (rendered after all hooks)
  if (isAuthChecking) {
    return <WahLoadingScreen />;

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

            {/* Notifications Center Page */}
            {activePage === 'notifications' && <NotificationsPage />}

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

            {/* Seller Dashboard: Requires Approved Seller or Admin Role */}
            {activePage.startsWith('seller-') && (
              isAuthenticated && (currentRole === 'seller' || currentRole === 'admin') && currentUser?.sellerStatus !== 'pending' && currentUser?.sellerStatus !== 'rejected' ? (
                <React.Suspense fallback={<LazySectionFallback />}>
                  <SellerDashboard />
                </React.Suspense>
              ) : isAuthenticated && currentUser?.sellerStatus === 'pending' ? (
                <div className="max-w-lg mx-auto my-16 p-8 bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-amber-500/20 shadow-xl text-center space-y-4" dir="rtl">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-2xl border border-amber-500/20">
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
              )
            )}

            {/* Admin Dashboard: Requires Admin Role */}
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
            {activePage === 'dialect-dictionary' && (
              <React.Suspense fallback={<LazySectionFallback />}>
                <DialectDictionaryPage />
              </React.Suspense>
            )}

            {!PAGE_ROUTES[activePage] && <NotFoundPage />}
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
