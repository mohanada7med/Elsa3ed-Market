import React, { useEffect, useMemo, useState } from 'react';
import { useApp, PAGE_ROUTES } from '../../context/AppContext';
import { ActivePage } from '../../types';
import { wahApi } from '../../services/api';
import {
  Home,
  ChevronLeft,
  ArrowRight
} from 'lucide-react';

export interface BreadcrumbItem {
  id: string;
  label: string;
  page?: ActivePage;
  url?: string;
  onClick?: () => void;
  isCurrent?: boolean;
}

const GOVERNORATE_NAMES: Record<string, string> = {
  'bani-suef': 'بني سويف',
  'beni-suef': 'بني سويف',
  'minya': 'المنيا',
  'al-minya': 'المنيا',
  'asyut': 'أسيوط',
  'assiut': 'أسيوط',
  'sohag': 'سوهاج',
  'qena': 'قنا',
  'luxor': 'الأقصر',
  'al-luxor': 'الأقصر',
  'aswan': 'أسوان',
  'new-valley': 'الوادي الجديد',
  'al-wadi-al-gadid': 'الوادي الجديد',
  'fayoum': 'الفيوم',
  'al-fayoum': 'الفيوم'
};

const SELLER_SECTION_LABELS: Record<string, string> = {
  'seller-products': 'إدارة المنتجات والمقتنيات',
  'seller-inventory': 'المخزون والكميات',
  'seller-orders': 'طلبات الورشة الواردة',
  'seller-messages': 'محادثات الزبائن',
  'seller-payouts': 'المستحقات والأرباح',
  'seller-analytics': 'تقارير المبيعات والإحصائيات',
  'seller-account': 'إعدادات متجر الورشة'
};

const ADMIN_SECTION_LABELS: Record<string, string> = {
  'admin-cultural-cms': 'إدارة المحتوى الثقافي والتراثي',
  'cultural-cms': 'إدارة المحتوى الثقافي والتراثي',
  'admin-map-editor': 'محرر خريطة الصعيد',
  'admin-sellers': 'إدارة الورش وشيوخ الصنعة',
  'admin-products': 'مراجعة وتدقيق المنتجات',
  'admin-buyers': 'سجل المشترين والمستخدمين',
  'admin-orders': 'متابعة وإدارة الطلبات',
  'admin-payouts': 'تسويات المستحقات المالية',
  'admin-categories': 'أقسام وتصنيفات المنصة',
  'admin-discounts': 'كوبونات الخصم والعروض',
  'admin-reports': 'البلاغات والشكاوى الفنية',
  'admin-audit-logs': 'سجلات الأمان والعمليات',
  'admin-media': 'مكتبة الوسائط السحابية',
  'admin-settings': 'الإعدادات العامة للمنصة'
};

export const DynamicBreadcrumbs: React.FC = () => {
  const {
    activePage,
    setActivePage,
    products,
    selectedProductId,
    categories,
    selectedCategoryId,
    sellers,
    selectedSellerId,
    orders,
    selectedOrderId,
    selectedGovernorateSlug,
    selectedPlaceSlug,
    selectedCraftSlug,
    selectedPersonSlug,
    selectedFoodSlug,
    selectedEventSlug,
    searchQuery,
    setSelectedCategoryFilter
  } = useApp();

  // Asynchronously fetched detail names for dynamic cultural ecosystem entities
  const [asyncEntityName, setAsyncEntityName] = useState<string | null>(null);

  // Synchronize dynamic entity names when viewing deep-linked items
  useEffect(() => {
    let isMounted = true;

    async function resolveEntityName() {
      setAsyncEntityName(null);

      try {
        if (activePage === 'governorate-details' && selectedGovernorateSlug) {
          const cached = wahApi.getCachedGovernorateBySlug(selectedGovernorateSlug);
          if (cached?.name) {
            setAsyncEntityName(cached.name);
            return;
          }
          if (GOVERNORATE_NAMES[selectedGovernorateSlug]) {
            setAsyncEntityName(GOVERNORATE_NAMES[selectedGovernorateSlug]);
            return;
          }
          const data = await wahApi.getGovernorateBySlug(selectedGovernorateSlug);
          if (isMounted && data?.name) setAsyncEntityName(data.name);
        } else if (activePage === 'place-details' && selectedPlaceSlug) {
          const cached = wahApi.getCachedPlaceBySlug(selectedPlaceSlug);
          if (cached?.title) {
            setAsyncEntityName(cached.title);
            return;
          }
          const data = await wahApi.getPlaceBySlug(selectedPlaceSlug);
          if (isMounted && data?.title) setAsyncEntityName(data.title);
        } else if ((activePage === 'cultural-craft-details' || activePage === 'craft-details') && selectedCraftSlug) {
          const data = await wahApi.getCraftBySlug(selectedCraftSlug);
          if (isMounted && data?.title) setAsyncEntityName(data.title);
        } else if (activePage === 'person-details' && selectedPersonSlug) {
          const data = await wahApi.getPersonBySlug(selectedPersonSlug);
          if (isMounted && data?.name) setAsyncEntityName(data.name);
        } else if (activePage === 'food-details' && selectedFoodSlug) {
          const data = await wahApi.getFoodBySlug(selectedFoodSlug);
          if (isMounted && data?.name) setAsyncEntityName(data.name);
        } else if (activePage === 'event-details' && selectedEventSlug) {
          const data = await wahApi.getEventBySlug(selectedEventSlug);
          if (isMounted && data?.title) setAsyncEntityName(data.title);
        }
      } catch {
        // Graceful fallback to default formatted slug
      }
    }

    resolveEntityName();

    return () => {
      isMounted = false;
    };
  }, [
    activePage,
    selectedGovernorateSlug,
    selectedPlaceSlug,
    selectedCraftSlug,
    selectedPersonSlug,
    selectedFoodSlug,
    selectedEventSlug
  ]);

  // Compute hierarchical breadcrumbs list
  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    // Only display on secondary pages
    if (activePage === 'home') {
      return [];
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://wah-saeed.com';
    const items: BreadcrumbItem[] = [
      {
        id: 'home',
        label: 'الرئيسية',
        page: 'home',
        url: `${origin}/`,
        onClick: () => setActivePage('home')
      }
    ];

    // Helper to format fallback slug if entity name is pending
    const formatSlug = (slug?: string | null, fallback = 'تفاصيل'): string => {
      if (!slug) return fallback;
      return slug.replace(/[-_]/g, ' ');
    };

    // 1. Market & Products Flow
    if (activePage === 'products' || activePage === 'search' || activePage === 'market' || activePage === 'wah-market') {
      items.push({
        id: 'products',
        label: searchQuery.trim() ? `بحث: "${searchQuery}"` : 'سوق وه التراثي',
        url: `${origin}/products`,
        isCurrent: true
      });
    } else if (activePage === 'product-details' || activePage === 'product-detail') {
      items.push({
        id: 'market-parent',
        label: 'سوق وه التراثي',
        page: 'products',
        url: `${origin}/products`,
        onClick: () => {
          setSelectedCategoryFilter('all');
          setActivePage('products');
        }
      });

      const currentProd = products.find((p) => p.id === selectedProductId);
      if (currentProd?.categoryName) {
        items.push({
          id: `cat-${currentProd.categoryId || 'current'}`,
          label: currentProd.categoryName,
          url: `${origin}/categories/${currentProd.categoryId || ''}`,
          onClick: () => {
            if (currentProd.categoryId) {
              setSelectedCategoryFilter(currentProd.categoryId);
            }
            setActivePage('products');
          }
        });
      }

      items.push({
        id: 'current-product',
        label: currentProd?.title || 'تفاصيل المقتنى',
        url: `${origin}/products/${selectedProductId || ''}`,
        isCurrent: true
      });
    } else if (activePage === 'categories') {
      items.push({
        id: 'categories',
        label: 'أقسام وتصنيفات الحرف',
        url: `${origin}/categories`,
        isCurrent: true
      });
    } else if (activePage === 'category-details') {
      items.push({
        id: 'categories-parent',
        label: 'أقسام وتصنيفات الحرف',
        page: 'categories',
        url: `${origin}/categories`,
        onClick: () => setActivePage('categories')
      });
      const cat = categories.find((c) => c.id === selectedCategoryId || c.slug === selectedCategoryId);
      items.push({
        id: 'current-category',
        label: cat?.name || 'تصنيف الحرفة',
        url: `${origin}/categories/${selectedCategoryId || ''}`,
        isCurrent: true
      });
    } else if (activePage === 'crafts') {
      items.push({
        id: 'crafts',
        label: 'قصص الحرفيين وموسوعة التراث',
        url: `${origin}/crafts`,
        isCurrent: true
      });
    } else if (activePage === 'reels') {
      items.push({
        id: 'reels',
        label: 'فيديوهات الصنعة والورش (Reels)',
        url: `${origin}/reels`,
        isCurrent: true
      });
    } else if (activePage === 'sellers') {
      items.push({
        id: 'sellers',
        label: 'دليل الورش وشيوخ الصنعة',
        url: `${origin}/sellers`,
        isCurrent: true
      });
    } else if (activePage === 'seller-details') {
      items.push({
        id: 'sellers-parent',
        label: 'دليل الورش وشيوخ الصنعة',
        page: 'sellers',
        url: `${origin}/sellers`,
        onClick: () => setActivePage('sellers')
      });
      const seller = sellers.find((s) => s.id === selectedSellerId);
      items.push({
        id: 'current-seller',
        label: seller?.brandName || seller?.name || 'ملف الورشة',
        url: `${origin}/sellers/${selectedSellerId || ''}`,
        isCurrent: true
      });
    } else if (activePage === 'cart') {
      items.push({
        id: 'cart',
        label: 'سلة المقتنيات التراثية',
        url: `${origin}/cart`,
        isCurrent: true
      });
    } else if (activePage === 'checkout') {
      items.push({
        id: 'cart-parent',
        label: 'سلة المقتنيات',
        page: 'cart',
        url: `${origin}/cart`,
        onClick: () => setActivePage('cart')
      });
      items.push({
        id: 'checkout',
        label: 'إتمام الطلب والدفع الآمن',
        url: `${origin}/checkout`,
        isCurrent: true
      });
    } else if (activePage === 'orders') {
      items.push({
        id: 'orders',
        label: 'تتبع الطلبات والشحنات',
        url: `${origin}/orders`,
        isCurrent: true
      });
    } else if (activePage === 'order-details') {
      items.push({
        id: 'orders-parent',
        label: 'تتبع الطلبات',
        page: 'orders',
        url: `${origin}/orders`,
        onClick: () => setActivePage('orders')
      });
      const currentOrder = orders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId);
      items.push({
        id: 'current-order',
        label: currentOrder?.orderNumber ? `طلب رقم #${currentOrder.orderNumber}` : 'تفاصيل الطلب',
        url: `${origin}/orders/${selectedOrderId || ''}`,
        isCurrent: true
      });
    } else if (activePage === 'favorites') {
      items.push({
        id: 'favorites',
        label: 'المفضلة وقائمة الرغبات',
        url: `${origin}/favorites`,
        isCurrent: true
      });
    } else if (activePage === 'notifications') {
      items.push({
        id: 'notifications',
        label: 'مركز الإشعارات والتنبيهات',
        url: `${origin}/notifications`,
        isCurrent: true
      });
    } else if (activePage === 'messages') {
      items.push({
        id: 'messages',
        label: 'المحادثات المباشرة مع الحرفيين',
        url: `${origin}/messages`,
        isCurrent: true
      });
    } else if (activePage === 'buyer-account' || activePage === 'profile') {
      items.push({
        id: 'profile',
        label: 'حسابي الشخصي',
        url: `${origin}/profile`,
        isCurrent: true
      });
    } else if (activePage === 'about') {
      items.push({
        id: 'about',
        label: 'عن منصة وه | العالم الرقمي لصعيد مصر',
        url: `${origin}/about`,
        isCurrent: true
      });
    } else if (activePage === 'wholesale') {
      items.push({
        id: 'market-parent',
        label: 'سوق وه',
        page: 'products',
        url: `${origin}/products`,
        onClick: () => setActivePage('products')
      });
      items.push({
        id: 'wholesale',
        label: 'تجارة الجملة والطلبات الخاصة',
        url: `${origin}/wholesale`,
        isCurrent: true
      });
    } else if (activePage === 'quize' || activePage === 'dialect-dictionary') {
      items.push({
        id: 'quize',
        label: 'قاموس اللهجة الصعيدية وتحدي الأمثال',
        url: `${origin}/quiz`,
        isCurrent: true
      });
    }

    // 2. Cultural & Heritage Ecosystem Flow
    else if (activePage === 'map' || activePage === 'explore') {
      items.push({
        id: 'map',
        label: 'خريطة صعيد مصر التفاعلية',
        url: `${origin}/map`,
        isCurrent: true
      });
    } else if (activePage === 'governorate-details') {
      items.push({
        id: 'map-parent',
        label: 'خريطة الصعيد',
        page: 'map',
        url: `${origin}/map`,
        onClick: () => setActivePage('map')
      });
      const govName = asyncEntityName || (selectedGovernorateSlug ? GOVERNORATE_NAMES[selectedGovernorateSlug] : null) || formatSlug(selectedGovernorateSlug, 'المحافظة');
      items.push({
        id: 'current-governorate',
        label: `محافظة ${govName}`,
        url: `${origin}/governorates/${selectedGovernorateSlug || ''}`,
        isCurrent: true
      });
    } else if (activePage === 'places') {
      items.push({
        id: 'places',
        label: 'المعالم والتراث المعماري',
        url: `${origin}/places`,
        isCurrent: true
      });
    } else if (activePage === 'place-details') {
      items.push({
        id: 'places-parent',
        label: 'المعالم والتراث المعماري',
        page: 'places',
        url: `${origin}/places`,
        onClick: () => setActivePage('places')
      });
      items.push({
        id: 'current-place',
        label: asyncEntityName || formatSlug(selectedPlaceSlug, 'تفاصيل المعلم'),
        url: `${origin}/places/${selectedPlaceSlug || ''}`,
        isCurrent: true
      });
    } else if (activePage === 'cultural-crafts') {
      items.push({
        id: 'cultural-crafts',
        label: 'موسوعة الحرف والورش التراثية',
        url: `${origin}/cultural-crafts`,
        isCurrent: true
      });
    } else if (activePage === 'cultural-craft-details' || activePage === 'craft-details') {
      items.push({
        id: 'crafts-parent',
        label: 'موسوعة الحرف التراثية',
        page: 'cultural-crafts',
        url: `${origin}/cultural-crafts`,
        onClick: () => setActivePage('cultural-crafts')
      });
      items.push({
        id: 'current-craft',
        label: asyncEntityName || formatSlug(selectedCraftSlug, 'تفاصيل الحرفة'),
        url: `${origin}/cultural-crafts/${selectedCraftSlug || ''}`,
        isCurrent: true
      });
    } else if (activePage === 'people') {
      items.push({
        id: 'people',
        label: 'أعلام وشخصيات الصعيد',
        url: `${origin}/people`,
        isCurrent: true
      });
    } else if (activePage === 'person-details') {
      items.push({
        id: 'people-parent',
        label: 'أعلام وشخصيات الصعيد',
        page: 'people',
        url: `${origin}/people`,
        onClick: () => setActivePage('people')
      });
      items.push({
        id: 'current-person',
        label: asyncEntityName || formatSlug(selectedPersonSlug, 'سيرة العلم'),
        url: `${origin}/people/${selectedPersonSlug || ''}`,
        isCurrent: true
      });
    } else if (activePage === 'food') {
      items.push({
        id: 'food',
        label: 'طعم الصعيد والمطبخ التراثي',
        url: `${origin}/food`,
        isCurrent: true
      });
    } else if (activePage === 'food-details') {
      items.push({
        id: 'food-parent',
        label: 'طعم الصعيد والمطبخ التراثي',
        page: 'food',
        url: `${origin}/food`,
        onClick: () => setActivePage('food')
      });
      items.push({
        id: 'current-food',
        label: asyncEntityName || formatSlug(selectedFoodSlug, 'تفاصيل الأكلة'),
        url: `${origin}/food/${selectedFoodSlug || ''}`,
        isCurrent: true
      });
    } else if (activePage === 'events') {
      items.push({
        id: 'events',
        label: 'مواسم وموالد الصعيد',
        url: `${origin}/events`,
        isCurrent: true
      });
    } else if (activePage === 'event-details') {
      items.push({
        id: 'events-parent',
        label: 'مواسم وموالد الصعيد',
        page: 'events',
        url: `${origin}/events`,
        onClick: () => setActivePage('events')
      });
      items.push({
        id: 'current-event',
        label: asyncEntityName || formatSlug(selectedEventSlug, 'تفاصيل الفعالية'),
        url: `${origin}/events/${selectedEventSlug || ''}`,
        isCurrent: true
      });
    } else if (activePage === 'global-search') {
      items.push({
        id: 'global-search',
        label: 'البحث الشامل في تراث الصعيد',
        url: `${origin}/global-search`,
        isCurrent: true
      });
    }

    // 3. Seller Dashboard Flow
    else if (activePage.startsWith('seller-')) {
      items.push({
        id: 'seller-dashboard-parent',
        label: 'لوحة تحكم الورشة',
        page: 'seller-dashboard',
        url: `${origin}/seller-dashboard`,
        onClick: activePage === 'seller-dashboard' ? undefined : () => setActivePage('seller-dashboard'),
        isCurrent: activePage === 'seller-dashboard'
      });

      if (activePage !== 'seller-dashboard') {
        items.push({
          id: activePage,
          label: SELLER_SECTION_LABELS[activePage] || 'القسم',
          url: `${origin}/${PAGE_ROUTES[activePage] || activePage}`,
          isCurrent: true
        });
      }
    }

    // 4. Admin Dashboard Flow
    else if (activePage.startsWith('admin-') || activePage === 'cultural-cms') {
      items.push({
        id: 'admin-dashboard-parent',
        label: 'لوحة الإدارة العليا',
        page: 'admin-dashboard',
        url: `${origin}/admin-dashboard`,
        onClick: activePage === 'admin-dashboard' ? undefined : () => setActivePage('admin-dashboard'),
        isCurrent: activePage === 'admin-dashboard'
      });

      if (activePage !== 'admin-dashboard') {
        items.push({
          id: activePage,
          label: ADMIN_SECTION_LABELS[activePage] || 'القسم الإداري',
          url: `${origin}/${PAGE_ROUTES[activePage] || activePage}`,
          isCurrent: true
        });
      }
    } else if (activePage === 'reset-password') {
      items.push({
        id: 'reset-password',
        label: 'استعادة وتعيين كلمة المرور',
        url: `${origin}/reset-password`,
        isCurrent: true
      });
    } else {
      // General Fallback
      items.push({
        id: 'unknown-page',
        label: 'الصفحة المطلوبة',
        url: `${origin}/`,
        isCurrent: true
      });
    }

    return items;
  }, [
    activePage,
    setActivePage,
    products,
    selectedProductId,
    categories,
    selectedCategoryId,
    sellers,
    selectedSellerId,
    orders,
    selectedOrderId,
    selectedGovernorateSlug,
    selectedPlaceSlug,
    selectedCraftSlug,
    selectedPersonSlug,
    selectedFoodSlug,
    selectedEventSlug,
    searchQuery,
    asyncEntityName,
    setSelectedCategoryFilter
  ]);

  // Inject / update Schema.org BreadcrumbList structured data for SEO hierarchy
  useEffect(() => {
    if (breadcrumbItems.length <= 1) {
      const existing = document.getElementById('schema-breadcrumb-jsonld');
      if (existing) existing.remove();
      return;
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: item.url || (typeof window !== 'undefined' ? window.location.href : 'https://wah-saeed.com')
      }))
    };

    let scriptTag = document.getElementById('schema-breadcrumb-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'schema-breadcrumb-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schema);

    return () => {
      const el = document.getElementById('schema-breadcrumb-jsonld');
      if (el) el.remove();
    };
  }, [breadcrumbItems]);

  // If on home page or no breadcrumb items exist, render nothing
  if (activePage === 'home' || breadcrumbItems.length === 0) {
    return null;
  }

  // Handle step-up / back action
  const handleBackStep = () => {
    if (breadcrumbItems.length >= 2) {
      const parentItem = breadcrumbItems[breadcrumbItems.length - 2];
      if (parentItem.onClick) {
        parentItem.onClick();
        return;
      }
      if (parentItem.page) {
        setActivePage(parentItem.page);
        return;
      }
    }
    window.history.back();
  };

  return (
    <nav
      id="dynamic-page-breadcrumbs"
      aria-label="مسار التصفح"
      dir="rtl"
      className="w-full border-b transition-colors duration-300 relative z-40 bg-[#fbf8f2]/95 dark:bg-[#141210]/95 backdrop-blur-md border-black/[0.07] dark:border-white/[0.08]"
    >
      <div className="mx-auto flex h-11 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-12 text-xs">
        {/* Breadcrumbs Ordered List with Microdata markup */}
        <ol
          itemScope
          itemType="https://schema.org/BreadcrumbList"
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar whitespace-nowrap py-1 pr-0.5"
        >
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const isRoot = index === 0;

            return (
              <li
                key={item.id}
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
                className="flex items-center gap-1.5 sm:gap-2 shrink-0"
              >
                {index > 0 && (
                  <ChevronLeft
                    size={13}
                    aria-hidden="true"
                    className="text-black/35 dark:text-white/35 shrink-0"
                  />
                )}

                {isLast ? (
                  <span
                    itemProp="name"
                    aria-current="page"
                    title={item.label}
                    className="font-bold text-primary dark:text-[#d5a56d] truncate max-w-[180px] sm:max-w-[320px] md:max-w-[480px]"
                  >
                    {item.label}
                  </span>
                ) : (
                  <button
                    type="button"
                    itemProp="item"
                    onClick={item.onClick}
                    className="flex items-center gap-1.5 text-black/60 dark:text-white/60 hover:text-primary dark:hover:text-[#d5a56d] transition-colors cursor-pointer py-1 font-medium hover:underline underline-offset-4 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary rounded-sm"
                  >
                    {isRoot && (
                      <Home
                        size={13}
                        aria-hidden="true"
                        className="shrink-0 -mt-0.5 text-primary/80 dark:text-[#d5a56d]/80"
                      />
                    )}
                    <span itemProp="name">{item.label}</span>
                  </button>
                )}

                <meta itemProp="position" content={String(index + 1)} />
              </li>
            );
          })}
        </ol>

        {/* Quick Contextual Action: Step-back shortcut */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 pl-1 mr-4">
          <button
            type="button"
            onClick={handleBackStep}
            title="الرجوع للقسم السابق"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-black/50 dark:text-white/50 hover:text-espresso dark:hover:text-cream bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.07] dark:hover:bg-white/[0.08] transition-all cursor-pointer border border-black/5 dark:border-white/5"
          >
            <ArrowRight size={12} className="rotate-0" />
            <span>رجوع</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default DynamicBreadcrumbs;
