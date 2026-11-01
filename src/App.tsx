import React, { useEffect } from 'react';
import { AppProvider, useApp, PAGE_ROUTES } from './context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/layout/Header';
import { DynamicBreadcrumbs } from './components/layout/DynamicBreadcrumbs';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/layout/ToastContainer';
import { GlobalConfirmModal } from './components/common/GlobalConfirmModal';
import { ReportIssueModal } from './components/common/ReportIssueModal';
import { IntroExperience } from './components/layout/IntroExperience';
import { WahOnboardingExperience } from './components/layout/WahOnboardingExperience';
import { CartDrawer } from './components/cart/CartDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { ForceChangePasswordModal } from './components/auth/ForceChangePasswordModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { updatePageSEO, generateBreadcrumbSchema } from './utils/seo';
import { MobileBottomBar } from './components/layout/MobileBottomBar';

// Pages
import { HomePage } from './components/pages/HomePage';
import { SellerProfileView } from './components/pages/SellerProfileView';

// Dynamic code-splitting with automatic recovery for chunk loading issues (e.g. after updates/rebuilds)
const lazyWithRetry = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) =>
  React.lazy(async () => {
    try {
      return await factory();
    } catch (error: any) {
      const errorMsg = error?.message || error?.toString?.() || '';
      const isChunkError =
        error?.name === 'ChunkLoadError' ||
        errorMsg.includes('Loading chunk') ||
        errorMsg.includes('missing:') ||
        errorMsg.includes('Failed to fetch dynamically imported module') ||
        errorMsg.includes("reading 'call'");

      if (isChunkError && typeof window !== 'undefined') {
        const lastReload = window.sessionStorage.getItem('chunk_retry_reload');
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          window.sessionStorage.setItem('chunk_retry_reload', now.toString());
          window.location.reload();
          return { default: (() => null) as unknown as T };
        }
      }
      throw error;
    }
  });

import { ProductsPage } from './components/pages/ProductsPage';
import { ProductDetailsView } from './components/products/ProductDetailsView';
import { CategoriesPage } from './components/pages/CategoriesPage';
import { SellersDirectoryPage } from './components/pages/SellersDirectoryPage';
import { FavoritesPage } from './components/pages/FavoritesPage';
import { CartPage } from './components/pages/CartPage';
import { ForbiddenPage } from './components/pages/ForbiddenPage';
import { NotFoundPage } from './components/pages/NotFoundPage';
import { ResetPasswordPage } from './components/pages/ResetPasswordPage';
import { AmWahSupportButton } from './components/common/AmWahSupportButton';
import { MessageCircle, UserRound } from 'lucide-react';

// High-performance code-splitting: Heavy non-home views loaded on-demand
const CheckoutPage = lazyWithRetry(() =>
  import('./components/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);
const BuyerAccountPage = lazyWithRetry(() =>
  import('./components/pages/BuyerAccountPage').then((m) => ({ default: m.BuyerAccountPage }))
);
const ChatView = lazyWithRetry(() =>
  import('./components/chat/ChatView').then((m) => ({ default: m.ChatView }))
);
const GovernorateDetailPage = lazyWithRetry(() =>
  import('./components/pages/GovernorateDetailPage').then((m) => ({ default: m.GovernorateDetailPage }))
);
const PlacesHeritagePage = lazyWithRetry(() =>
  import('./components/pages/PlacesHeritagePage').then((m) => ({ default: m.PlacesHeritagePage }))
);
const PlaceDetailPage = lazyWithRetry(() =>
  import('./components/pages/PlaceDetailPage').then((m) => ({ default: m.PlaceDetailPage }))
);
const PeoplePage = lazyWithRetry(() =>
  import('./components/pages/PeoplePage').then((m) => ({ default: m.PeoplePage }))
);
const PersonDetailPage = lazyWithRetry(() =>
  import('./components/pages/PersonDetailPage').then((m) => ({ default: m.PersonDetailPage }))
);
const FoodHeritagePage = lazyWithRetry(() =>
  import('./components/pages/FoodHeritagePage').then((m) => ({ default: m.FoodHeritagePage }))
);
const FoodDetailPage = lazyWithRetry(() =>
  import('./components/pages/FoodDetailPage').then((m) => ({ default: m.FoodDetailPage }))
);
const EventsPage = lazyWithRetry(() =>
  import('./components/pages/EventsPage').then((m) => ({ default: m.EventsPage }))
);
const EventDetailPage = lazyWithRetry(() =>
  import('./components/pages/EventDetailPage').then((m) => ({ default: m.EventDetailPage }))
);
const GlobalSearchResultsPage = lazyWithRetry(() =>
  import('./components/pages/GlobalSearchResultsPage').then((m) => ({ default: m.GlobalSearchResultsPage }))
);
const NotificationsPage = lazyWithRetry(() =>
  import('./components/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage }))
);
const WholesalePage = lazyWithRetry(() =>
  import('./components/pages/WholesalePage').then((m) => ({ default: m.WholesalePage }))
);
const UpperEgyptMapPage = lazyWithRetry(() =>
  import('./components/pages/UpperEgyptMapPage').then((m) => ({ default: m.UpperEgyptMapPage }))
);
const CraftReelsPage = lazyWithRetry(() =>
  import('./components/pages/CraftReelsPage').then((m) => ({ default: m.CraftReelsPage }))
);
const DialectDictionaryPage = lazyWithRetry(() =>
  import('./components/pages/quize').then((m) => ({ default: m.DialectDictionaryPage }))
);
const OrdersTrackingPage = lazyWithRetry(() =>
  import('./components/pages/OrdersTrackingPage').then((m) => ({ default: m.OrdersTrackingPage }))
);
const HelpAndContactPage = lazyWithRetry(() =>
  import('./components/pages/HelpAndContactPage').then((m) => ({ default: m.HelpAndContactPage }))
);
const PrivacyPolicyPage = lazyWithRetry(() =>
  import('./components/pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage }))
);
const TermsAndConditionsPage = lazyWithRetry(() =>
  import('./components/pages/TermsAndConditionsPage').then((m) => ({ default: m.TermsAndConditionsPage }))
);

const SellerDashboard = lazyWithRetry(() =>
  import('./components/seller/SellerDashboard').then((m) => ({ default: m.SellerDashboard }))
);
const AdminDashboard = lazyWithRetry(() =>
  import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const CulturalCmsAdminPage = lazyWithRetry(() =>
  import('./components/pages/CulturalCmsAdminPage').then((m) => ({ default: m.CulturalCmsAdminPage }))
);
const AdminMapEditorPage = lazyWithRetry(() =>
  import('./components/pages/AdminMapEditorPage').then((m) => ({ default: m.AdminMapEditorPage }))
);
const AdminEventsManagerPage = lazyWithRetry(() =>
  import('./components/pages/AdminEventsManagerPage').then((m) => ({ default: m.default || m.AdminEventsManagerPage }))
);

const SkeletonBlock: React.FC<{ className: string }> = ({ className }) => (
  <div aria-hidden="true" className={`skeleton-pulse ${className}`} />
);

const LazySectionFallback: React.FC = () => {
  const { activePage } = useApp();
  const isDashboard =
    activePage.startsWith('seller') ||
    activePage.startsWith('admin') ||
    activePage === 'buyer-account' ||
    activePage === 'profile';
  const isListing = [
    'products',
    'market',
    'wah-market',
    'categories',
    'sellers',
    'favorites',
    'reels',
  ].includes(activePage);
  const isDetail = [
    'product-details',
    'product-detail',
    'seller-details',
    'category-details',
    'order-details',
    'place-details',
    'person-details',
    'food-details',
    'event-details',
  ].includes(activePage);

  return (
    <section
      className="wah-route-skeleton mx-auto min-h-[65vh] w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      role="status"
      aria-busy="true"
      aria-label="جاري تجهيز الصفحة"
      dir="rtl"
    >
      <span className="sr-only">جاري فتح الصفحة...</span>
      <div aria-hidden="true">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div className="w-full max-w-sm space-y-3">
            <SkeletonBlock className="h-7 w-2/3 rounded-xl" />
            <SkeletonBlock className="h-4 w-full max-w-xs rounded-lg" />
          </div>
          <SkeletonBlock className="hidden h-11 w-28 rounded-xl sm:block" />
        </div>

        {isDashboard ? (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="rounded-2xl border border-primary/10 bg-white/60 p-4 dark:bg-white/[0.03]">
                  <SkeletonBlock className="mb-4 h-10 w-10 rounded-xl" />
                  <SkeletonBlock className="mb-2 h-4 w-2/3 rounded-lg" />
                  <SkeletonBlock className="h-6 w-1/2 rounded-lg" />
                </div>
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-3 rounded-2xl border border-primary/10 bg-white/60 p-4 dark:bg-white/[0.03]">
                <SkeletonBlock className="mb-5 h-5 w-1/3 rounded-lg" />
                {Array.from({ length: 4 }, (_, index) => (
                  <SkeletonBlock key={index} className="h-14 w-full rounded-xl" />
                ))}
              </div>
              <SkeletonBlock className="min-h-52 rounded-2xl" />
            </div>
          </>
        ) : isListing ? (
          <>
            <div className="mb-6 flex gap-2 overflow-hidden">
              {Array.from({ length: 5 }, (_, index) => (
                <SkeletonBlock key={index} className="h-10 w-24 shrink-0 rounded-full" />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="overflow-hidden rounded-2xl border border-primary/10 bg-white/60 p-2 dark:bg-white/[0.03]">
                  <SkeletonBlock className="aspect-[4/3] rounded-xl" />
                  <div className="space-y-2 p-2 pt-3">
                    <SkeletonBlock className="h-4 w-4/5 rounded-lg" />
                    <SkeletonBlock className="h-3 w-1/2 rounded-lg" />
                    <SkeletonBlock className="mt-3 h-8 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : isDetail ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <SkeletonBlock className="aspect-square max-h-[520px] rounded-3xl" />
            <div className="space-y-4 rounded-3xl border border-primary/10 bg-white/60 p-5 dark:bg-white/[0.03]">
              <SkeletonBlock className="h-4 w-28 rounded-lg" />
              <SkeletonBlock className="h-8 w-4/5 rounded-xl" />
              <SkeletonBlock className="h-5 w-1/3 rounded-lg" />
              <SkeletonBlock className="mt-7 h-24 w-full rounded-xl" />
              <SkeletonBlock className="h-12 w-full rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <SkeletonBlock className="aspect-[2.4/1] w-full rounded-3xl" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="space-y-3 rounded-2xl border border-primary/10 bg-white/60 p-4 dark:bg-white/[0.03]">
                  <SkeletonBlock className="h-36 w-full rounded-xl" />
                  <SkeletonBlock className="h-5 w-2/3 rounded-lg" />
                  <SkeletonBlock className="h-4 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

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
    setAuthModalTab,
    setPostLoginRedirect,
  } = useApp();

  const selectedProduct = products.find((p) => p.id === selectedProductId);

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
          title: 'إتمام وتأكيد الطلب',
          description: 'تأكيد وشحن طلبات سوق وه الحرفية مباشرة من ورش الصعيد.'
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
      case 'people':
      case 'person-details':
        updatePageSEO({
          title: 'اعلام الصعيد | وه',
          description: 'سير ومسيرات شيوخ الصنعة والرواة والفنانين التلقائيين في صعيد مصر.',
          schema: generateBreadcrumbSchema([{ name: 'الرئيسية' }, { name: 'اعلام الصعيد' }])
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
      case 'admin-events':
      case 'admin-events-manager':
        updatePageSEO({
          title: 'إدارة المواسم والأعياد والموالد الصعيدية | وه',
          description: 'لوحة التحكم الشاملة لإدارة وتوثيق مواسم وموالد صعيد مصر بالعامية مع الصور والفيديوهات والتعديل المباشر.'
        });
        break;
      case 'quize':
        updatePageSEO({
          title: 'مسابقة عم وه • كلام الصعيد | وه',
          description: 'اختبر معرفتك بكلمات ومصطلحات لهجة أهل الصعيد الأصيلة مع عم وه.'
        });
        break;
      case 'help':
      case 'contact':
        updatePageSEO({
          title: 'مضايفة وه — المساعدة والتواصل | ديوان العون لأهل البلد',
          description: 'ديوان العون والتواصل في منصة وه؛ في خدمتك على مدار الأسبوع لأي استفسار عن طلبياتك، الصنعة الصعيدية، أو الانضمام لشيوخ الكار.',
          schema: generateBreadcrumbSchema([{ name: 'الرئيسية' }, { name: 'المساعدة والتواصل' }])
        });
        break;
      case 'privacy':
        updatePageSEO({
          title: 'سياسة الخصوصية وأمان أهل الدار | وه',
          description: 'ميثاق سرية وأمان البيانات وحماية خصوصية مقتني الحرف وزوار منصة وه وفق أعلى المعايير.',
          schema: generateBreadcrumbSchema([{ name: 'الرئيسية' }, { name: 'سياسة الخصوصية' }])
        });
        break;
      case 'terms':
        updatePageSEO({
          title: 'الشروط والأحكام وعهد الصنعة | وه',
          description: 'ميثاق وعهد التعامل بين مقتني الحرف وشيوخ الورش ومنصة وه لضمان حقوق الجميع بالعدالة والإنصاف.',
          schema: generateBreadcrumbSchema([{ name: 'الرئيسية' }, { name: 'الشروط والأحكام' }])
        });
        break;
      default:
        break;
    }
  }, [activePage, selectedProduct, selectedSellerId]);

  // Initial Auth Verification State: only block for protected accounts/dashboards
  const isProtectedRoute =
    activePage.startsWith('admin') ||
    activePage.startsWith('seller') ||
    activePage === 'buyer-account' ||
    activePage === 'profile';

  if (isAuthChecking && isProtectedRoute) {
    return <LazySectionFallback />;
  }

  return (
    <main className="min-h-screen flex flex-col justify-between bg-[#FFF9EE] dark:bg-[#1B1009] text-[#3B1E0E] dark:text-[#FFF9EE] transition-colors duration-500">
      <div>
        <Header />
        <DynamicBreadcrumbs />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activePage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            id="main-route-container"
          >
            <React.Suspense fallback={<LazySectionFallback />}>
              {activePage === 'home' && <HomePage />}
              {(activePage === 'products' || activePage === 'search' || activePage === 'market' || activePage === 'wah-market') && <ProductsPage />}
              {(activePage === 'product-details' || activePage === 'product-detail') && <ProductDetailsView />}
              {activePage === 'categories' && <CategoriesPage />}
              {activePage === 'category-details' && <ProductsPage />}
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
                  <div className="max-w-md mx-auto my-16 p-8 bg-white/75 dark:bg-espresso-900/90 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-xl text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl">
                      🔒
                    </div>
                    <h2 className="text-xl font-bold font-main">تسجيل الدخول لإتمام الطلب</h2>
                    <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                      يرجى تسجيل الدخول أو إنشاء حساب جديد لحفظ بيانات الشحن ومتابعة حالة طلبك التراثي.
                    </p>
                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPostLoginRedirect('checkout');
                          setAuthModalTab('login');
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full py-3 bg-[#6B3A1F] text-[#FFF9EE] hover:bg-[#3B1E0E] dark:hover:bg-[#C99444] font-bold rounded-xl shadow-md text-xs transition-all cursor-pointer"
                      >
                        تسجيل الدخول للمتابعة
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePage('products')}
                        className="w-full py-2.5 bg-black/5 dark:bg-cream/5 hover:bg-black/10 text-black/70 dark:text-white/70 font-bold rounded-xl text-xs transition-all cursor-pointer border border-black/10 dark:border-white/10"
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
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-primary-hover flex items-center justify-center mx-auto">
                      <MessageCircle size={30} strokeWidth={1.7} />
                    </div>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">مراسلة إدارة منصة وه (الدعم الفني)</h2>
                    <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                      يرجى تسجيل الدخول للتواصل مباشرة مع فريق إدارة المنصة والدعم الفني ومتابعة استفساراتك.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setPostLoginRedirect('messages');
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
                  <div className="max-w-md mx-auto my-16 p-8 bg-white/80 dark:bg-espresso-900/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 shadow-xl text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary dark:text-primary-hover flex items-center justify-center mx-auto border border-primary/20">
                      <UserRound size={30} strokeWidth={1.7} />
                    </div>
                    <h2 className="text-xl font-bold text-espresso dark:text-cream">إعدادات الحساب الشخصي</h2>
                    <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">
                      يرجى تسجيل الدخول للوصول إلى بياناتك الشخصية وعناوين الشحن المحفوظة.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setPostLoginRedirect('buyer-account');
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-3.5 bg-[#6B3A1F] text-[#FFF9EE] hover:bg-[#3B1E0E] dark:hover:bg-[#C99444] font-bold rounded-xl shadow-md text-sm transition-all cursor-pointer"
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
                <div className="max-w-lg mx-auto my-16 p-8 bg-white/80 dark:bg-espresso-900/90 backdrop-blur-xl rounded-[2rem] border border-amber-500/20 shadow-xl text-center space-y-4" dir="rtl">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-primary-hover flex items-center justify-center mx-auto text-2xl border border-amber-500/20">
                    ⏳
                  </div>
                  <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold">
                    طلبك قيد المراجعة والاعتماد
                  </span>
                  <h2 className="text-xl font-bold text-espresso dark:text-cream">
                    طلب انضمام ورشتك قيد الفحص الإداري
                  </h2>
                  <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">
                    تم استلام طلب اعتماد ورشة "{currentUser.seller?.brandName || 'ورشة الحرفي'}" بنجاح، ويجري حالياً تدقيق البيانات والمعايير التراثية من قبل إدارة منصة وه. ستتمكن من إضافة المنتجات وإدارة المتجر فور صدور الاعتماد.
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                    <button
                      type="button"
                      onClick={() => setActivePage('buyer-account')}
                      className="px-5 py-3 bg-primary hover:bg-[#3B1E0E] text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      متابعة حالة الطلب في حسابي
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePage('home')}
                      className="px-5 py-3 bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-espresso dark:text-cream font-bold rounded-xl text-xs hover:bg-black/10 transition-all cursor-pointer"
                    >
                      العودة للرئيسية
                    </button>
                  </div>
                </div>
              ) : isAuthenticated && currentUser?.sellerStatus === 'rejected' ? (
                <div className="max-w-lg mx-auto my-16 p-8 bg-white/80 dark:bg-espresso-900/90 backdrop-blur-xl rounded-[2rem] border border-rose-500/20 shadow-xl text-center space-y-4" dir="rtl">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-2xl border border-rose-500/20">
                    ⚠️
                  </div>
                  <span className="inline-block px-3 py-1 bg-rose-500/10 text-rose-700 dark:text-rose-300 rounded-full text-xs font-bold">
                    تم رفض طلب الاعتماد
                  </span>
                  <h2 className="text-xl font-bold text-espresso dark:text-cream">
                    لم يتم قبول طلب الانضمام كبائع
                  </h2>
                  <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">
                    {currentUser.seller?.rejectionReason || 'عفواً، لم يستوفِ الطلب المعايير التراثية المعتمدة للمنصة في الوقت الحالي.'}
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                    <button
                      type="button"
                      onClick={() => setActivePage('buyer-account')}
                      className="px-5 py-3 bg-primary hover:bg-[#3B1E0E] text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      تعديل وإعادة تقديم الطلب
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePage('home')}
                      className="px-5 py-3 bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-espresso dark:text-cream font-bold rounded-xl text-xs hover:bg-black/10 transition-all cursor-pointer"
                    >
                      تصفح السوق
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white/80 dark:bg-espresso-900/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 shadow-xl text-center space-y-4" dir="rtl">
                  <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary dark:text-primary-hover flex items-center justify-center mx-auto text-2xl border border-primary/20">
                    🏺
                  </div>
                  <h2 className="text-xl font-bold text-espresso dark:text-cream">لوحة تحكم ورش الصعيد</h2>
                  <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">
                    هذه اللوحة مخصصة لحسابات شيوخ الصنعة وأصحاب الورش المعتمدة. يرجى تسجيل الدخول بحساب ورشتك أو تقديم طلب انضمام كبائع.
                  </p>
                  <div className="pt-2 flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPostLoginRedirect('seller-dashboard');
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-3.5 bg-[#6B3A1F] text-[#FFF9EE] hover:bg-[#3B1E0E] dark:hover:bg-[#C99444] font-bold rounded-xl shadow-md text-sm transition-all cursor-pointer"
                    >
                      تسجيل دخول البائع
                    </button>
                    {currentRole !== 'admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (isAuthenticated) {
                            setActivePage('buyer-account');
                          } else {
                            setPostLoginRedirect('buyer-account');
                            setAuthModalTab('register');
                            setIsAuthModalOpen(true);
                          }
                        }}
                        className="w-full py-2.5 bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-espresso dark:text-cream font-bold rounded-xl text-xs hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer"
                      >
                        تقديم طلب انضمام ورشة جديدة
                      </button>
                    )}
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
                  <div className="max-w-md mx-auto my-16 p-8 bg-white/80 dark:bg-espresso-900/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 shadow-xl text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary dark:text-primary-hover flex items-center justify-center mx-auto text-2xl border border-primary/20">
                      🛡️
                    </div>
                    <h2 className="text-xl font-bold text-espresso dark:text-cream">منطقة الإدارة العليا</h2>
                    <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">
                      هذه اللوحة مخصصة لمديري منصة وه فقط. يرجى تسجيل الدخول بالحساب الإداري المصرح له.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setPostLoginRedirect('admin-dashboard');
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-3.5 bg-[#6B3A1F] text-[#FFF9EE] hover:bg-[#3B1E0E] dark:hover:bg-[#C99444] font-bold rounded-xl shadow-md text-sm transition-all cursor-pointer"
                    >
                      تسجيل الدخول الإداري
                    </button>
                  </div>
                )
              )}

              {activePage === 'reset-password' && <ResetPasswordPage />}

              
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
              {activePage === 'governorate-details' && <GovernorateDetailPage />}
              {activePage === 'places' && <PlacesHeritagePage />}
              {activePage === 'place-details' && <PlaceDetailPage />}
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
              {(activePage === 'admin-events' || activePage === 'admin-events-manager') && (
                <React.Suspense fallback={<LazySectionFallback />}>
                  <AdminEventsManagerPage />
                </React.Suspense>
              )}

              {/* Quiz */}
              {activePage === 'quize' && (
                <React.Suspense fallback={<LazySectionFallback />}>
                  <DialectDictionaryPage />
                </React.Suspense>
              )}

              {/* Help & Contact, Privacy Policy, Terms & Conditions */}
              {(activePage === 'help' || activePage === 'contact') && (
                <React.Suspense fallback={<LazySectionFallback />}>
                  <HelpAndContactPage />
                </React.Suspense>
              )}
              {activePage === 'privacy' && (
                <React.Suspense fallback={<LazySectionFallback />}>
                  <PrivacyPolicyPage />
                </React.Suspense>
              )}
              {activePage === 'terms' && (
                <React.Suspense fallback={<LazySectionFallback />}>
                  <TermsAndConditionsPage />
                </React.Suspense>
              )}

              {!PAGE_ROUTES[activePage] && <NotFoundPage />}
            </React.Suspense>
          </motion.div>
        </AnimatePresence>
      </div>

      <Footer />

      {/* Floating Uncle Wah Technical Support Concierge (عم وه - الدعم الفني) */}
      <AmWahSupportButton />

      {/* Persistent Mobile Bottom Navigation Bar */}
      <MobileBottomBar />

      {/* Global Modals & Drawers */}
      {(currentRole === 'buyer' || !isAuthenticated) && <CartDrawer />}
      <AuthModal />
      <ForceChangePasswordModal />
      <IntroExperience />
      <WahOnboardingExperience />
      <ToastContainer />
      <GlobalConfirmModal />
      <ReportIssueModal />
    </main>
  );
};

export function App() {
  return (
    <AppProvider>
      <InitialLoaderReadySignal />
      <ErrorBoundary>
        <MainContent />
      </ErrorBoundary>
    </AppProvider>
  );
}

const InitialLoaderReadySignal: React.FC = () => {
  const { isAuthChecking, isInitialDataReady } = useApp();

  useEffect(() => {
    if (!isAuthChecking && isInitialDataReady) {
      window.dispatchEvent(new Event('wah:app-ready'));
    }
  }, [isAuthChecking, isInitialDataReady]);

  return null;
};

export default App;