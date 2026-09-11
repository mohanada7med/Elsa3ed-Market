import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import {
  MapGovernorateData,
  MapMarkerItem,
  Product,
} from '../../types';

import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Hammer,
  Landmark,
  LayoutGrid,
  MapPin,
  Search,
  Scroll,
  Ship,
  ShoppingBag,
  Utensils,
  X,
  Loader2,
} from 'lucide-react';

const LOGO_URL =
  'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto:eco,w_100/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1200&auto=format&fit=crop&q=80';

const GOVERNORATE_ORDER = [
  'الفيوم',
  'بني سويف',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'الوادي الجديد',
  'البحر الأحمر',
];

const sortGovernoratesGeographically = (govs: MapGovernorateData[]): MapGovernorateData[] => {
  return [...govs].sort((a, b) => {
    const idxA = GOVERNORATE_ORDER.indexOf(a.name);
    const idxB = GOVERNORATE_ORDER.indexOf(b.name);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.name.localeCompare(b.name, 'ar');
  });
};

const TABS = [
  { id: 'places' as const, label: 'المعالم', icon: Landmark },
  { id: 'crafts' as const, label: 'الصنايعية', icon: Hammer },
  { id: 'products' as const, label: 'السوق', icon: ShoppingBag },
  { id: 'foods' as const, label: 'السفرة', icon: Utensils },
  { id: 'folklore' as const, label: 'الحكايات', icon: Scroll },
];

/**
 * دالة الحفاظ على أعلى جودة كريستالية للصور
 */
const getHighQualityImage = (url?: string | null, width = 1600): string => {
  if (!url || typeof url !== 'string') return FALLBACK_IMAGE;
  const clean = url.trim();
  if (!clean) return FALLBACK_IMAGE;

  if (clean.includes('res.cloudinary.com') && clean.includes('/upload/')) {
    if (clean.includes('f_auto,q_auto')) {
      return clean.replace(/w_\d+/, `w_${width}`);
    }
    return clean.replace(
      '/upload/',
      `/upload/f_auto,q_auto:best,w_${width},c_limit/`
    );
  }

  if (clean.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(clean);
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', 'crop');
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', '85');
      return urlObj.toString();
    } catch {
      return clean;
    }
  }

  return clean;
};

export const UpperEgyptMapPage: React.FC = () => {
  const app = useApp();
  const { navigateToGovernorate, setActivePage, products, addToCart } = app;

  const navigateToPlace = (placeIdOrSlug: string) => {
    if (typeof (app as any).navigateToPlace === 'function') {
      (app as any).navigateToPlace(placeIdOrSlug);
    } else if (typeof (app as any).navigateToHeritagePlace === 'function') {
      (app as any).navigateToHeritagePlace(placeIdOrSlug);
    } else {
      if (typeof (app as any).setSelectedPlaceId === 'function') {
        (app as any).setSelectedPlaceId(placeIdOrSlug);
      }
      setActivePage('places');
    }
  };

  const getInitialPayload = () => {
    try {
      const cached = wahApi.getCachedMapPayload();
      if (cached?.governorates && cached.governorates.length > 0) return cached;
      const stored = sessionStorage.getItem('wah_map_payload');
      if (stored) return JSON.parse(stored);
    } catch { }
    return null;
  };

  const initialPayload = useMemo(() => getInitialPayload(), []);

  const [governorates, setGovernorates] = useState<MapGovernorateData[]>(() => {
    const rawGovs = initialPayload?.governorates || [];
    return sortGovernoratesGeographically(rawGovs);
  });

  const [markers, setMarkers] = useState<MapMarkerItem[]>(
    () => initialPayload?.markers || []
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'places' | 'crafts' | 'products' | 'foods' | 'folklore'>('places');
  const [displayMode, setDisplayMode] = useState<'voyage' | 'grid'>('voyage');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('الكل');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // تحميل البيانات وتحميل كل الصور في الـ RAM قبل إخفاء الـ Loader
  useEffect(() => {
    let isMounted = true;

    const loadAndPreloadAll = async () => {
      try {
        let currentGovs = governorates;
        let currentMarkers = markers;

        if (!currentGovs.length) {
          const payload = await wahApi.getFullMapPayload();
          if (Array.isArray(payload?.governorates)) {
            currentGovs = sortGovernoratesGeographically(payload.governorates);
            setGovernorates(currentGovs);
          }
          if (Array.isArray(payload?.markers)) {
            currentMarkers = payload.markers;
            setMarkers(currentMarkers);
          }
          try {
            sessionStorage.setItem('wah_map_payload', JSON.stringify(payload));
          } catch { }
        }

        // تحميل جميع صور أغلفة المحافظات مسبقاً بدقة كاملة
        const preloadPromises = currentGovs
          .filter((g) => Boolean(g.coverImage))
          .map(
            (g) =>
              new Promise<void>((resolve) => {
                const img = new Image();
                img.src = getHighQualityImage(g.coverImage, 1600);
                img.onload = () => resolve();
                img.onerror = () => resolve(); // لضمان عدم توقف الصفحة إذا تعذر تحميل صورة واحدة
              })
          );

        await Promise.all(preloadPromises);
      } catch (error) {
        console.error('[WAH Atlas] خطأ في تحميل الأطلس:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadAndPreloadAll();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedGov = governorates[selectedIndex] ?? governorates[0];

  const currentGovMarkers = useMemo(() => {
    if (!selectedGov) return [];
    return markers.filter(
      (marker) =>
        marker.governorateId === selectedGov.id ||
        marker.governorateName === selectedGov.name
    );
  }, [markers, selectedGov]);

  const places = useMemo(
    () => currentGovMarkers.filter((marker) => marker.type === 'place'),
    [currentGovMarkers]
  );

  const crafts = useMemo(
    () => currentGovMarkers.filter((marker) => marker.type === 'craft'),
    [currentGovMarkers]
  );

  const foods = useMemo(() => {
    const foodMarkers = currentGovMarkers.filter((marker) => (marker as any).type === 'food');
    if (foodMarkers.length > 0) return foodMarkers;

    if (Array.isArray((selectedGov as any)?.traditionalFoods)) {
      return (selectedGov as any).traditionalFoods.map((f: any, i: number) => ({
        id: `food-${i}`,
        title: typeof f === 'string' ? f : f.name || f.title,
        shortDescription: f.description || 'أكلة صعيدية أصيلة من خير بيوت وبلاد المحافظة.',
        coverImage: f.image || null,
      }));
    }

    return [];
  }, [currentGovMarkers, selectedGov]);

  const govMarketProducts = useMemo(() => {
    if (!selectedGov || !Array.isArray(products)) return [];
    return products.filter((product) => {
      const origin = product.specifications?.originGovernorate || product.sellerGovernorate;
      const titleMatch = typeof product.title === 'string' && product.title.includes(selectedGov.name);
      const tagMatch = Array.isArray(product.tags) && product.tags.includes(selectedGov.name);
      return origin === selectedGov.name || titleMatch || tagMatch;
    });
  }, [products, selectedGov]);

  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    governorates.forEach((g) => {
      if (g.region) set.add(g.region);
    });
    return ['الكل', ...Array.from(set)];
  }, [governorates]);

  const filteredGovernorates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return governorates.filter((gov) => {
      const searchMatch =
        !query ||
        gov.name?.toLowerCase().includes(query) ||
        gov.nickname?.toLowerCase().includes(query) ||
        gov.famousFor?.some((item) => item.toLowerCase().includes(query));

      const regionMatch =
        selectedRegionFilter === 'الكل' || gov.region === selectedRegionFilter;

      return searchMatch && regionMatch;
    });
  }, [governorates, searchQuery, selectedRegionFilter]);

  const folkloreStory = useMemo(() => {
    if (!selectedGov) return '';
    return (
      (selectedGov as any).culturalTraditions ||
      (selectedGov as any).folklore ||
      selectedGov.history ||
      selectedGov.shortIntro ||
      ''
    );
  }, [selectedGov]);

  const scrollTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const selectGovernorate = (index: number) => {
    if (index < 0 || index >= governorates.length) return;
    setSelectedIndex(index);
    setActiveTab('places');
    scrollTop();
  };

  const nextGovernorate = () => {
    if (!governorates.length) return;
    setSelectedIndex((current) => (current >= governorates.length - 1 ? 0 : current + 1));
    setActiveTab('places');
    scrollTop();
  };

  const previousGovernorate = () => {
    if (!governorates.length) return;
    setSelectedIndex((current) => (current <= 0 ? governorates.length - 1 : current - 1));
    setActiveTab('places');
    scrollTop();
  };

  const handleAddProduct = (product: Product) => {
    try {
      addToCart(product, 1);
      setAddedProductId(product.id);
      window.setTimeout(() => setAddedProductId(null), 2200);
    } catch (error) {
      console.error('[WAH Atlas] عطل في إضافة المنتج:', error);
    }
  };

  if (isLoading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen w-full flex flex-col items-center justify-center bg-[#eee8dc] dark:bg-[#0b0b0a] text-[#211d18] dark:text-[#f5f0e7] gap-4"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 shadow-xl">
          <img src={LOGO_URL} alt="وه" className="h-10 w-10 object-contain" />
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-[#9a6a35]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>بنجهّز صور ومحطات الصعيد بأعلى جودة...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors duration-500
        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
      "
    >
      {/* الرأس */}
      <header className="relative z-50 border-b border-black/10 dark:border-white/10">
        <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button
            onClick={() => setActivePage('home')}
            className="group flex items-center gap-3 text-sm font-bold transition-all hover:text-[#9a6a35] cursor-pointer"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/60 transition-all group-hover:bg-[#211d18] group-hover:text-white dark:border-white/10 dark:bg-white/5 dark:group-hover:bg-white dark:group-hover:text-black">
              <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" />
            </span>
            <span className="hidden sm:block">الرئيسية</span>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <div className="text-[9px] font-bold tracking-[0.35em] text-[#9a6a35]">WAH</div>
            <div className="mt-1 text-sm font-black">رحلة الصعيد</div>
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-xl sm:rounded-2xl border border-black/10 bg-white/50 p-1 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] shadow-lg">
            <button
              type="button"
              onClick={() => setDisplayMode('voyage')}
              className={`flex h-8 sm:h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl px-2 sm:px-4 text-[10px] sm:text-xs font-black transition-all cursor-pointer ${displayMode === 'voyage'
                ? 'bg-[#211d18] text-white shadow-lg dark:bg-white dark:text-black'
                : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
            >
              <Ship size={15} className="shrink-0" />
              <span>مركب النيل</span>
            </button>

            <button
              type="button"
              onClick={() => setDisplayMode('grid')}
              className={`flex h-8 sm:h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl px-2 sm:px-4 text-[10px] sm:text-xs font-black transition-all cursor-pointer ${displayMode === 'grid'
                ? 'bg-[#211d18] text-white shadow-lg dark:bg-white dark:text-black'
                : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
            >
              <LayoutGrid size={15} className="shrink-0" />
              <span>كل المحافظات</span>
            </button>
          </div>
        </div>
      </header>

      {/* شريط المحطات */}
      <div className="sticky top-0 z-40 w-full border-b border-black/10 dark:border-white/10 bg-[#eee8dc]/90 dark:bg-[#0b0b0a]/90 backdrop-blur-2xl">
        <div className="mx-auto max-w-[1600px] px-3 sm:px-5 md:px-7 lg:px-10 xl:px-12">
          <div className="relative overflow-x-auto no-scrollbar py-3">
            <div className="absolute right-7 left-7 top-[31px] h-px bg-black/10 dark:bg-white/10" />

            <div className="relative z-10 flex min-w-max items-start justify-between gap-2">
              {governorates.map((gov, index) => {
                const active = index === selectedIndex;
                return (
                  <button
                    key={gov.id}
                    type="button"
                    onClick={() => selectGovernorate(index)}
                    className="group flex min-w-[70px] sm:min-w-[90px] flex-col items-center gap-2 cursor-pointer"
                  >
                    <span
                      className={`relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border text-[9px] sm:text-[10px] font-black transition-all duration-300 ${active
                        ? 'border-[#9a6a35] bg-[#9a6a35] text-white shadow-[0_0_0_5px_rgba(154,106,53,.15)] scale-110'
                        : 'border-black/15 dark:border-white/15 bg-white/80 dark:bg-white/5 text-black/70 dark:text-white/70 group-hover:border-[#9a6a35]'
                        }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span
                      className={`max-w-[85px] sm:max-w-[110px] text-center break-words leading-tight text-[10px] sm:text-xs font-black transition-colors ${active
                        ? 'text-[#9a6a35]'
                        : 'text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white'
                        }`}
                    >
                      {gov.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <main className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 sm:py-12 lg:px-12">
        {/* نظام الشبكة */}
        {displayMode === 'grid' && (
          <section className="mb-14">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 lg:gap-16 items-end mb-8">
              <div>
                <div className="mb-2 text-xs font-bold tracking-[0.3em] text-[#9a6a35]">حكايات على ضفاف النيل</div>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none">
                  الصعيد <span className="text-[#9a6a35]">على أصوله.</span>
                </h2>
                <p className="mt-4 text-sm sm:text-base text-black/60 dark:text-white/60 leading-relaxed">
                  بلاد طيبة وناس كريمة، صنايعية ورثوا الحرفة أب عن جد، ومعالم حية تفرح القلب.
                </p>
              </div>

              <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] p-6 backdrop-blur-xl shadow-lg">
                <p className="text-[10px] font-bold tracking-[0.25em] text-black/40 dark:text-white/40">صعيد مصر</p>
                <div className="mt-2 flex items-end gap-3">
                  <span className="text-5xl sm:text-6xl font-black leading-none">
                    {String(governorates.length).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-bold text-black/60 dark:text-white/60">محافظة جاهزة ومحملة</span>
                </div>
              </div>
            </div>

            {/* البحث */}
            <div className="mb-8 rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-[#151513]/90 p-3 sm:p-4 backdrop-blur-2xl shadow-xl">
              <div className="flex flex-col xl:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="قلّب على بلد، معلم، صنعة يدوية..."
                    className="h-12 w-full rounded-2xl border border-transparent bg-black/[0.035] pr-11 pl-10 text-sm font-medium outline-none transition-all placeholder:text-black/35 focus:border-[#9a6a35]/40 focus:bg-transparent dark:bg-white/[0.04] dark:placeholder:text-white/30 dark:focus:bg-white/[0.06]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
                  {availableRegions.map((region) => {
                    const active = selectedRegionFilter === region;
                    return (
                      <button
                        key={region}
                        onClick={() => setSelectedRegionFilter(region)}
                        className={`shrink-0 rounded-xl px-4 py-3 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${active
                          ? 'bg-[#9a6a35] text-white shadow-md'
                          : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10'
                          }`}
                      >
                        {region}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* كروت المحافظات */}
            {filteredGovernorates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGovernorates.map((gov) => {
                  const originalIndex = governorates.findIndex((item) => item.id === gov.id);
                  const active = originalIndex === selectedIndex;

                  return (
                    <article
                      key={gov.id}
                      className="group relative overflow-hidden rounded-[2rem] border border-black/10 dark:border-white/10 bg-[#dfd6c5] dark:bg-[#1a1917] shadow-xl cursor-pointer"
                      onClick={() => {
                        selectGovernorate(originalIndex);
                        setDisplayMode('voyage');
                      }}
                    >
                      <div className="relative h-[380px] w-full overflow-hidden">
                        <img
                          src={getHighQualityImage(gov.coverImage, 900)}
                          alt={gov.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                        <div className="absolute right-5 top-5 text-7xl font-black leading-none text-white/20">
                          {String(originalIndex + 1).padStart(2, '0')}
                        </div>

                        <div className="absolute left-5 top-5">
                          <span className="inline-flex rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                            {gov.region}
                          </span>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-6">
                          <h3 className="text-3xl font-black text-white group-hover:text-[#d5a56d] transition-colors">
                            {gov.name}
                          </h3>
                          <p className="mt-1 text-xs font-bold text-amber-200">{gov.nickname}</p>
                          <p className="mt-2 line-clamp-2 text-xs text-white/75">{gov.shortIntro}</p>

                          {active && (
                            <span className="mt-4 inline-flex rounded-full border border-white/20 bg-white/25 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                              إحنا هنا دلوقتي
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center rounded-3xl border border-dashed border-black/20 dark:border-white/20">
                <Search className="mx-auto mb-3 h-8 w-8 text-black/40 dark:text-white/40" />
                <h3 className="text-lg font-bold">ملقيناش حاجة بالاسم ده</h3>
                <p className="text-xs text-black/50 dark:text-white/50 mt-1">جرّب كلمة تانية أو امسح البحث.</p>
              </div>
            )}
          </section>
        )}

        {/* نظام الرحلة الفردية: الصورة والكلام بيظهروا سوا بدون ثانية انتظار واحدة */}
        {displayMode === 'voyage' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold tracking-[0.3em] text-[#9a6a35]">سكة النيل</div>
                <p className="mt-1 text-sm font-bold text-black/60 dark:text-white/60">
                  المحطة {String(selectedIndex + 1).padStart(2, '0')} من {String(governorates.length || 1).padStart(2, '0')}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={previousGovernorate}
                  className="flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-4 py-2.5 text-xs font-bold shadow-md backdrop-blur-xl hover:border-[#9a6a35] cursor-pointer"
                >
                  <ChevronRight size={16} />
                  <span>المحطة اللي قبلها</span>
                </button>

                <button
                  onClick={nextGovernorate}
                  className="flex items-center gap-2 rounded-xl bg-[#211d18] dark:bg-white text-white dark:text-black px-4 py-2.5 text-xs font-bold shadow-md hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] transition-colors cursor-pointer"
                >
                  <span>المحطة اللي بعدها</span>
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>

            {/* كارت البطل المشترك بنظام الـ Animated Swap الفوري */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-black/10 dark:border-white/10 bg-[#dfd6c5] dark:bg-[#1a1917] min-h-[550px] sm:min-h-[600px] shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedGov?.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12"
                >
                  <img
                    src={getHighQualityImage(selectedGov?.coverImage, 1600)}
                    alt={selectedGov?.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />

                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    className="relative z-10 max-w-4xl space-y-4 pointer-events-auto"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedGov?.region && (
                        <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                          {selectedGov.region}
                        </span>
                      )}
                      {selectedGov?.nileSegment && (
                        <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-bold text-white/70 backdrop-blur-md">
                          {selectedGov.nileSegment}
                        </span>
                      )}
                    </div>

                    <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black font-serif text-white tracking-tight">
                      {selectedGov?.name}
                    </h1>

                    {selectedGov?.nickname && (
                      <p className="text-lg sm:text-2xl font-bold text-amber-200">{selectedGov.nickname}</p>
                    )}

                    {selectedGov?.shortIntro && (
                      <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
                        {selectedGov.shortIntro}
                      </p>
                    )}

                    {selectedGov?.capitalCity && (
                      <div className="flex items-center gap-2 pt-2 text-xs font-bold text-white/70">
                        <MapPin size={15} className="text-[#9a6a35]" />
                        <span>عاصمتها ومركزها: {selectedGov.capitalCity}</span>
                      </div>
                    )}

                    {selectedGov?.famousFor && selectedGov.famousFor.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-4">
                        {selectedGov.famousFor.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* العدادات */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { number: places.length, label: 'أماكن ومعالم', icon: Landmark },
                { number: crafts.length, label: 'صنايعية وحرف', icon: Hammer },
                { number: govMarketProducts.length, label: 'منتجات بالسوق', icon: ShoppingBag },
                { number: foods.length, label: 'أكلات صعيدي', icon: Utensils },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-4 rounded-3xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] p-5 backdrop-blur-xl shadow-lg"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#9a6a35]/10 text-[#9a6a35]">
                      <Icon size={22} />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black leading-none">{stat.number}</div>
                      <div className="mt-1 text-xs font-bold text-black/50 dark:text-white/50">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* أصل الحكاية من الداتابيز */}
            {folkloreStory && (
              <div className="rounded-[2.5rem] border border-black/10 dark:border-white/10 bg-[#211d18] text-white p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full border-[30px] border-white/5" />
                <div className="relative z-10 max-w-3xl mx-auto space-y-4">
                  <span className="text-xs font-bold tracking-[0.3em] text-[#d5a56d]">حكاية المكان وتاريخه</span>
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed font-medium">
                    {folkloreStory}
                  </p>
                </div>
              </div>
            )}

            {/* التبويبات */}
            <section className="rounded-[2.5rem] border border-black/10 dark:border-white/10 bg-white/60 dark:bg-[#151513]/80 p-6 sm:p-10 backdrop-blur-xl shadow-xl space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-6">
                <div>
                  <div className="text-xs font-bold tracking-[0.3em] text-[#9a6a35]">تفاصيل من قلب البلد</div>
                  <h3 className="text-2xl sm:text-3xl font-black font-serif mt-1">
                    دفتر حكايات {selectedGov?.name}
                  </h3>
                </div>

                {selectedGov?.slug && (
                  <button
                    onClick={() => navigateToGovernorate(selectedGov.slug)}
                    className="flex items-center gap-2 rounded-xl bg-[#211d18] dark:bg-white text-white dark:text-black px-5 py-3 text-xs font-bold shadow-lg hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] transition-colors cursor-pointer w-fit"
                  >
                    <span>افتح ملف المحافظة كامل</span>
                    <ArrowLeft size={16} />
                  </button>
                )}
              </div>

              {/* أزرار التبويب */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${active
                        ? 'bg-[#9a6a35] text-white shadow-md'
                        : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                    >
                      <Icon size={16} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* محتويات التبويب */}
              <div className="pt-4">
                {/* المعالم */}
                {activeTab === 'places' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-black">أشهر الأماكن والمعالم اللي تزار</h4>
                    {places.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {places.map((place) => {
                          const targetKey = (place as any).slug || (place as any).placeId || place.id;
                          return (
                            <div
                              key={place.id}
                              onClick={() => navigateToPlace(targetKey)}
                              className="group overflow-hidden rounded-3xl border border-black/10 dark:border-white/10 bg-[#dfd6c5] dark:bg-[#1a1917] text-white relative shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                            >
                              <div className="aspect-[16/10] overflow-hidden">
                                <img
                                  src={getHighQualityImage(place.coverImage, 700)}
                                  alt={place.title}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
                              <div className="absolute inset-x-0 bottom-0 p-6 space-y-1">
                                {place.typeLabel && (
                                  <span className="text-[10px] font-bold tracking-widest text-[#d5a56d]">
                                    {place.typeLabel}
                                  </span>
                                )}
                                <h5 className="text-xl font-black group-hover:text-[#d5a56d] transition-colors">{place.title}</h5>
                                {place.shortDescription && (
                                  <p className="text-xs text-white/75 line-clamp-2">{place.shortDescription}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-black/50 dark:text-white/50">لسه مفيش معالم متسجلة للمحافظة دي في الداتابيز.</p>
                    )}
                  </div>
                )}

                {/* الحرف */}
                {activeTab === 'crafts' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-black">حرف يدوية وصنايعية البلد</h4>
                    {crafts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {crafts.map((craft) => (
                          <div
                            key={craft.id}
                            className="flex gap-4 rounded-3xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] p-5 shadow-md"
                          >
                            <img
                              src={getHighQualityImage(craft.coverImage, 400)}
                              alt={craft.title}
                              className="h-28 w-28 shrink-0 rounded-2xl object-cover bg-[#dfd6c5] dark:bg-[#1a1917]"
                            />
                            <div className="space-y-1 min-w-0">
                              <span className="text-[10px] font-bold text-[#9a6a35]">حرفة أصلية</span>
                              <h5 className="text-base font-black truncate">{craft.title}</h5>
                              <p className="text-xs text-black/60 dark:text-white/60 line-clamp-3">
                                {craft.shortDescription}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-black/50 dark:text-white/50">لسه مفيش حرف متسجلة للمحافظة دي في الداتابيز.</p>
                    )}
                  </div>
                )}

                {/* السوق والمنتجات */}
                {activeTab === 'products' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-black">شغل يدوي وحاجات من خير المحافظة</h4>
                    {govMarketProducts.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {govMarketProducts.map((product) => {
                          const added = addedProductId === product.id;
                          return (
                            <div
                              key={product.id}
                              className="group rounded-3xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] overflow-hidden p-4 flex flex-col justify-between shadow-md"
                            >
                              <div className="space-y-3">
                                <div className="aspect-square overflow-hidden rounded-2xl bg-[#dfd6c5]/50 dark:bg-[#1a1917]">
                                  <img
                                    src={getHighQualityImage(product.images?.[0], 500)}
                                    alt={product.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                </div>
                                <h5 className="text-sm font-black line-clamp-1">{product.title}</h5>
                                <div className="text-xs font-black text-[#9a6a35]">{product.price} جنيه</div>
                              </div>
                              <button
                                onClick={() => handleAddProduct(product)}
                                className={`mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white transition-colors cursor-pointer ${added
                                  ? 'bg-emerald-600'
                                  : 'bg-[#211d18] dark:bg-white dark:text-black hover:bg-[#9a6a35]'
                                  }`}
                              >
                                {added ? <Check size={14} /> : <ShoppingBag size={14} />}
                                <span>{added ? 'اتحط في السلة' : 'حطه في السلة'}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-black/50 dark:text-white/50">مفيش منتجات معروضة بالسوق تابعة للمحافظة دي حالياً.</p>
                    )}
                  </div>
                )}

                {/* السفرة */}
                {activeTab === 'foods' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-black">أكلات السفرة الصعيدية الأصيلة</h4>
                    {foods.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {foods.map((food: any, idx: number) => (
                          <div
                            key={food.id || idx}
                            className="flex gap-4 rounded-3xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] p-5 shadow-md"
                          >
                            {food.coverImage ? (
                              <img
                                src={getHighQualityImage(food.coverImage, 300)}
                                alt={food.title}
                                className="h-16 w-16 shrink-0 rounded-2xl object-cover bg-[#dfd6c5] dark:bg-[#1a1917]"
                              />
                            ) : (
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#9a6a35]/10 text-[#9a6a35]">
                                <Utensils size={24} />
                              </div>
                            )}
                            <div>
                              <h5 className="text-base font-black">{food.title}</h5>
                              <p className="mt-1 text-xs text-black/60 dark:text-white/60 leading-relaxed">
                                {food.shortDescription || food.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-black/50 dark:text-white/50">لسه مفيش أكلات متسجلة للمحافظة دي في الداتابيز.</p>
                    )}
                  </div>
                )}

                {/* الحكايات */}
                {activeTab === 'folklore' && (
                  <div className="space-y-6 text-center py-8">
                    <Scroll className="mx-auto h-12 w-12 text-[#9a6a35]" />
                    <h4 className="text-xl font-black font-serif">حكايات وذكريات من {selectedGov?.name}</h4>
                    <p className="max-w-xl mx-auto text-sm text-black/70 dark:text-white/70 leading-relaxed">
                      {folkloreStory || 'لسه مفيش حكايات شعبية متسجلة للمحافظة دي في الداتابيز.'}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* الفوتر */}
      <footer className="border-t border-black/10 dark:border-white/10 py-12 text-center">
        <div className="mx-auto flex w-full max-w-md items-center gap-3 px-5 mb-4">
          <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5">
            <img src={LOGO_URL} alt="وه" className="h-6 w-6 object-contain opacity-80" />
          </div>
          <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        </div>
        <p className="text-[10px] font-black tracking-[0.2em] text-black/50 dark:text-white/50">
          وَه · حكايات الصعيد من المكان للإنسان
        </p>
      </footer>
    </div>
  );
};

export default UpperEgyptMapPage;