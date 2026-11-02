import React, { useEffect, useMemo, useState } from 'react';
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
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
  MapPin,
  Search,
  Scroll,
  ShoppingBag,
  Utensils,
  X,
  Loader2,
} from 'lucide-react';
import { UncleWahHeroBanner } from '../common/UncleWahHeroBanner';

const LOGO_URL =
  'https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1200&auto=format&fit=crop&q=80';

const VISITED_KEY = 'wah_atlas_visited';

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
type TabId = (typeof TABS)[number]['id'];

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

/* ───────────── ستايل الورق والحبر ───────────── */
const PAPER = 'bg-[#fbf3e1] dark:bg-[#2a2420]';
const INK_BORDER = 'border-2 border-espresso/80 dark:border-[#C99444]/70';
const LINED =
  'bg-[repeating-linear-gradient(transparent,transparent_31px,rgba(107,58,31,.12)_32px)] dark:bg-[repeating-linear-gradient(transparent,transparent_31px,rgba(201,148,68,.16)_32px)]';

const formatDate = (iso?: string) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
};

/* ───────────── مكونات صغيرة ───────────── */

// ميلان تلاتي الأبعاد مع حركة الماوس
const TiltCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  label?: string;
}> = ({ children, className, onClick, label }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-9, 9]), { stiffness: 200, damping: 20 });

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileTap={{ scale: 0.97 }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// باركود شكلي مبني على رقم المحافظة
const Barcode: React.FC<{ seed: string }> = ({ seed }) => {
  const bars = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => {
        const code = seed.charCodeAt(i % seed.length) || 7;
        return ((code * (i + 3)) % 4) + 1;
      }),
    [seed]
  );
  return (
    <div className="flex w-full flex-col gap-[2px] text-espresso dark:text-[#C99444]" aria-hidden>
      {bars.map((h, i) => (
        <span key={i} className="block w-full bg-current" style={{ height: h }} />
      ))}
    </div>
  );
};

// ختم بيتخبط (سلام بقوة)
const Stamp: React.FC<{ label: string; date?: string; size?: 'sm' | 'lg'; delay?: number }> = ({ label, date, size = 'lg', delay = 0 }) => (
  <motion.div
    initial={{ scale: 3, rotate: -35, opacity: 0 }}
    animate={{ scale: 1, rotate: -12, opacity: 0.92 }}
    transition={{ type: 'spring', stiffness: 420, damping: 14, delay }}
    className={`pointer-events-none flex flex-col items-center justify-center rounded-full border-[3px] border-double border-[#B3261E] text-center text-[#B3261E] dark:border-[#FF8A80] dark:text-[#FF8A80] ${size === 'lg' ? 'h-28 w-28' : 'h-[68px] w-[68px]'
      }`}
  >
    <span className={`font-main font-black leading-none ${size === 'lg' ? 'text-xl' : 'text-[11px]'}`}>وصلت</span>
    <span className={`font-bold leading-tight ${size === 'lg' ? 'mt-1 max-w-[88px] truncate text-[11px]' : 'max-w-[56px] truncate text-[8px]'}`}>{label}</span>
    {date && size === 'lg' && <span className="text-[10px] font-bold opacity-80">{date}</span>}
  </motion.div>
);

// دايرة التقدم
const ProgressRing: React.FC<{ done: number; total: number }> = ({ done, total }) => {
  const r = 52;
  const c = 2 * Math.PI * r;
  const ratio = total ? done / total : 0;
  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeOpacity=".18" strokeWidth="8" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#C99444"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - ratio) }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </svg>
      <div className="text-center">
        <div className="text-3xl font-black leading-none">
          {done}
          <span className="text-base opacity-60">/{total}</span>
        </div>
        <div className="mt-1 text-[11px] font-bold opacity-75">محطة مختومة</div>
      </div>
    </div>
  );
};

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const rise = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 24 } },
};

// قلب صفحة الجواز
const pageVariants = {
  enter: (d: number) => ({ rotateY: d * -55, opacity: 0, x: d * -30 }),
  center: { rotateY: 0, opacity: 1, x: 0 },
  exit: (d: number) => ({ rotateY: d * 55, opacity: 0, x: d * 30 }),
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
  const [bookOpen, setBookOpen] = useState(false);
  const [flipDir, setFlipDir] = useState(1);
  const [activeTab, setActiveTab] = useState<TabId>('places');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('الكل');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // الأختام اللي اتجمعت (متخزنة في المتصفح)
  const [visited, setVisited] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(VISITED_KEY) || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(VISITED_KEY, JSON.stringify(visited));
    } catch { }
  }, [visited]);

  const markVisited = (id?: string) => {
    if (!id) return;
    setVisited((cur) => (cur[id] ? cur : { ...cur, [id]: new Date().toISOString() }));
  };

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

        const preloadPromises = currentGovs
          .filter((g) => Boolean(g.coverImage))
          .map(
            (g) =>
              new Promise<void>((resolve) => {
                const img = new Image();
                img.src = getHighQualityImage(g.coverImage, 800);
                img.onload = () => resolve();
                img.onerror = () => resolve();
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

  // قفل السكروول وإغلاق بـ Esc
  useEffect(() => {
    if (!bookOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBookOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [bookOpen]);

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

  const countsByGov = useMemo(() => {
    const map: Record<string, { places: number; crafts: number }> = {};
    governorates.forEach((g) => {
      const own = markers.filter((m) => m.governorateId === g.id || m.governorateName === g.name);
      map[g.id] = {
        places: own.filter((m) => m.type === 'place').length,
        crafts: own.filter((m) => m.type === 'craft').length,
      };
    });
    return map;
  }, [governorates, markers]);

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

  const visitedCount = governorates.filter((g) => visited[g.id]).length;

  const openGovernorate = (index: number) => {
    setFlipDir(1);
    setSelectedIndex(index);
    setActiveTab('places');
    markVisited(governorates[index]?.id);
    setBookOpen(true);
  };

  const stepGovernorate = (dir: 1 | -1) => {
    if (!governorates.length) return;
    setFlipDir(dir);
    const next = (selectedIndex + dir + governorates.length) % governorates.length;
    setSelectedIndex(next);
    setActiveTab('places');
    markVisited(governorates[next]?.id);
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
        className="min-h-screen w-full flex flex-col items-center justify-center bg-cream dark:bg-espresso-900 text-espresso dark:text-cream gap-4"
      >
        <motion.div
          animate={{ rotateY: [0, 180, 360] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformPerspective: 600 }}
          className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 dark:bg-cream/5 ${INK_BORDER}`}
        >
          <img src={LOGO_URL} alt="وه" className="h-10 w-10 object-contain" />
        </motion.div>
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>بنجهّز صور ومحطات الصعيد بأعلى جودة...</span>
        </div>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div
        dir="rtl"
        className="min-h-screen overflow-x-hidden bg-cream text-espresso transition-colors duration-500 dark:bg-espresso-900 dark:text-cream"
      >
        {/* الرأس */}
        <header className="border-b border-black/10 dark:border-white/10">
          <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between px-5 sm:px-8">
            <button
              onClick={() => setActivePage('home')}
              className="group flex items-center gap-3 text-sm font-bold transition-colors hover:text-primary cursor-pointer"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/60 transition-colors group-hover:bg-espresso group-hover:text-white dark:border-white/10 dark:bg-cream/5 dark:group-hover:bg-white dark:group-hover:text-black">
                <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" />
              </span>
              <span className="hidden sm:block">الرئيسية</span>
            </button>
            <div className="flex items-center gap-2">
              <img src={LOGO_URL} alt="وه" className="h-7 w-7 object-contain" />
              <span className="text-sm font-black">رحلة الصعيد</span>
            </div>
            <div className="w-10 sm:w-24" aria-hidden />
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
          <div className="mb-12">
            <UncleWahHeroBanner
              doorTitle="خريطة بلاد ودكاكين ونيل الصعيد"
              doorBadge="باب خريطة الصعيد"
              mascotSrc="/mascot/saaed.png"
              mascotRole="دليل عم وه للبلاد"
              quote="عم وه رسم لكم خريطة الصعيد شبر شبر من بحري لحد أسوان والنوبة عشان متتوهش في ديارنا.. دوس على أي محافظة وشوف حكاياتها وخيرها!"
              statsText={`${governorates.length} محافظة صعيدية`}
              actionText="طلّع تذكرتك"
              onAction={() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' })}
            />
          </div>

          {/* غلاف الجواز */}
          <motion.section
            initial={{ opacity: 0, y: 30, rotateX: 20 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            style={{ transformPerspective: 1200 }}
            className="relative mb-12 overflow-hidden rounded-[2rem] bg-espresso p-3 text-[#E8C27A] shadow-2xl dark:bg-[#1a1310]"
          >
            <div className="relative grid items-center gap-6 rounded-[1.5rem] border-2 border-dashed border-[#C99444]/60 bg-[radial-gradient(circle_at_85%_20%,rgba(201,148,68,.22),transparent_45%)] px-6 py-8 sm:px-10 md:grid-cols-[auto_1fr_auto]">
              <motion.div
                animate={{ rotate: [0, 6, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-[3px] border-double border-[#C99444] md:mx-0"
              >
                <img src={LOGO_URL} alt="وه" className="h-14 w-14 object-contain" />
              </motion.div>

              <div className="text-center md:text-right">
                <div className="text-xs font-bold text-[#C99444]/80">جمهورية الصعيد الأصيل</div>
                <h2 className="mt-1 font-main text-4xl font-black text-white sm:text-5xl">جواز سفر الصعيد</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-loose text-white/75 md:mx-0">
                  كل محطة تفتح تذكرتها بتتختم في جوازك. اجمع {governorates.length} ختم وكمّل الرحلة من أول النيل لآخره.
                </p>
                {visitedCount > 0 && (
                  <button
                    onClick={() => setVisited({})}
                    className="mt-3 text-xs font-bold text-[#C99444] underline-offset-4 hover:underline cursor-pointer"
                  >
                    امسح الأختام وابدأ من جديد
                  </button>
                )}
              </div>

              <div className="mx-auto text-[#E8C27A] md:mx-0">
                <ProgressRing done={visitedCount} total={governorates.length} />
              </div>
            </div>
          </motion.section>

          {/* البحث والتصفية */}
          <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/45 dark:text-white/45" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="قلّب على بلد، معلم، صنعة يدوية..."
                className={`h-12 w-full rounded-xl py-3 pr-12 pl-11 text-sm font-bold outline-none placeholder:text-black/35 focus:border-primary dark:placeholder:text-white/35 ${PAPER} ${INK_BORDER}`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="مسح البحث"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {availableRegions.map((region) => {
                const active = selectedRegionFilter === region;
                return (
                  <button
                    key={region}
                    onClick={() => setSelectedRegionFilter(region)}
                    className={`shrink-0 rounded-lg border-2 border-dashed px-4 py-2.5 text-xs font-black whitespace-nowrap transition-colors cursor-pointer ${active
                      ? 'border-primary bg-primary text-white'
                      : 'border-espresso/50 hover:border-primary dark:border-[#C99444]/50'
                      }`}
                  >
                    {region}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═════════ التذاكر ═════════ */}
          <section id="tickets" className="scroll-mt-6">
            {filteredGovernorates.length > 0 ? (
              <motion.div
                key={`${searchQuery}-${selectedRegionFilter}`}
                variants={gridVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3"
              >
                {filteredGovernorates.map((gov) => {
                  const originalIndex = governorates.findIndex((g) => g.id === gov.id);
                  const counts = countsByGov[gov.id] || { places: 0, crafts: 0 };
                  const stamped = Boolean(visited[gov.id]);

                  return (
                    <motion.div key={gov.id} variants={rise}>
                      <TiltCard
                        onClick={() => openGovernorate(originalIndex)}
                        label={`افتح تذكرة ${gov.name}`}
                        className="group relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <div className={`relative grid grid-cols-[minmax(0,1fr)_88px] overflow-hidden rounded-2xl shadow-xl transition-shadow group-hover:shadow-2xl sm:grid-cols-[minmax(0,1fr)_108px] ${PAPER} ${INK_BORDER}`}>
                          {/* الجزء الرئيسي */}
                          <div className="min-w-0">
                            <div className="relative h-36 overflow-hidden sm:h-40">
                              <img
                                src={getHighQualityImage(gov.coverImage, 800)}
                                alt={gov.name}
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                                <span className="rounded-md bg-black/45 px-2.5 py-1 text-[11px] font-black text-white backdrop-blur-md">
                                  تذكرة رحلة
                                </span>
                                {gov.region && (
                                  <span className="rounded-md bg-white/85 px-2.5 py-1 text-[11px] font-black text-espresso">{gov.region}</span>
                                )}
                              </div>
                              <AnimatePresence>
                                {stamped && (
                                  <div className="absolute bottom-2 left-3">
                                    <Stamp label={gov.name} size="sm" />
                                  </div>
                                )}
                              </AnimatePresence>
                            </div>

                            <div className="space-y-2 p-4">
                              <h3 className="font-main text-3xl font-black leading-tight">{gov.name}</h3>
                              {gov.nickname && <p className="line-clamp-1 text-xs font-bold text-primary">{gov.nickname}</p>}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t-2 border-dashed border-espresso/25 pt-3 text-[11px] font-bold text-black/65 dark:border-[#C99444]/30 dark:text-white/65">
                                {gov.capitalCity && (
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} className="text-primary" />
                                    {gov.capitalCity}
                                  </span>
                                )}
                                {counts.places > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Landmark size={12} className="text-primary" />
                                    {counts.places} معالم
                                  </span>
                                )}
                                {counts.crafts > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Hammer size={12} className="text-primary" />
                                    {counts.crafts} حرف
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* العُرقوب (الجزء اللي بيتقطع) */}
                          <div className="flex flex-col items-center justify-between border-r-2 border-dashed border-espresso/60 p-3 text-center dark:border-[#C99444]/60">
                            <div>
                              <div className="text-[10px] font-black text-black/50 dark:text-white/50">المحطة</div>
                              <div className="font-main text-4xl font-black leading-none text-primary">
                                {String(originalIndex + 1).padStart(2, '0')}
                              </div>
                            </div>
                            <div className="w-full px-1">
                              <Barcode seed={gov.id || gov.name} />
                            </div>
                            <motion.div
                              animate={{ x: [0, -5, 0] }}
                              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                              className="flex items-center gap-1 text-[11px] font-black text-primary"
                            >
                              <ChevronLeft size={14} />
                              افتح
                            </motion.div>
                          </div>

                          {/* فتحات التذكرة */}
                          <span className="absolute -top-3 left-[88px] h-6 w-6 -translate-x-1/2 rounded-full border-2 border-espresso/80 bg-cream sm:left-[108px] dark:border-[#C99444]/70 dark:bg-espresso-900" />
                          <span className="absolute -bottom-3 left-[88px] h-6 w-6 -translate-x-1/2 rounded-full border-2 border-espresso/80 bg-cream sm:left-[108px] dark:border-[#C99444]/70 dark:bg-espresso-900" />
                        </div>
                      </TiltCard>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <div className={`rounded-2xl border-dashed py-16 text-center ${PAPER} ${INK_BORDER}`}>
                <Search className="mx-auto mb-3 h-8 w-8 text-black/40 dark:text-white/40" />
                <h3 className="text-lg font-black">ملقيناش حاجة بالاسم ده</h3>
                <p className="mt-1 text-xs text-black/55 dark:text-white/55">جرّب كلمة تانية أو امسح البحث.</p>
              </div>
            )}
          </section>
        </main>

        {/* ═════════ الجواز المفتوح: صفحتين وعلامات كتاب ═════════ */}
        <AnimatePresence>
          {bookOpen && selectedGov && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookOpen(false)}
              className="fixed inset-0 z-[70] flex items-stretch justify-center bg-black/70 backdrop-blur-sm md:items-center md:p-8"
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={`جواز ${selectedGov.name}`}
                dir="rtl"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.8, y: 80, rotateX: 25, opacity: 0 }}
                animate={{ scale: 1, y: 0, rotateX: 0, opacity: 1 }}
                exit={{ scale: 0.85, y: 60, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                style={{ transformPerspective: 1800 }}
                className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden bg-espresso shadow-2xl md:h-[88vh] md:rounded-[2rem] md:p-3 dark:bg-[#1a1310]"
              >
                {/* أزرار */}
                <div className="absolute inset-x-4 top-4 z-40 flex items-center justify-between md:inset-x-7 md:top-7">
                  <button
                    onClick={() => setBookOpen(false)}
                    aria-label="إغلاق"
                    className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-espresso/70 bg-[#fbf3e1] text-espresso shadow-lg transition-transform hover:rotate-90 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => stepGovernorate(-1)}
                      aria-label="الصفحة اللي قبلها"
                      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-espresso/70 bg-[#fbf3e1] text-espresso shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    >
                      <ChevronRight size={19} />
                    </button>
                    <span className="rounded-full border-2 border-espresso/70 bg-[#fbf3e1] px-3 py-2.5 text-[11px] font-black text-espresso shadow-lg">
                      {selectedIndex + 1} / {governorates.length}
                    </span>
                    <button
                      onClick={() => stepGovernorate(1)}
                      aria-label="الصفحة اللي بعدها"
                      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-espresso/70 bg-[#C99444] text-espresso shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    >
                      <ChevronLeft size={19} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain md:overflow-hidden md:rounded-[1.4rem]" style={{ perspective: 1800 }}>
                  <AnimatePresence mode="wait" custom={flipDir}>
                    <motion.div
                      key={selectedGov.id}
                      custom={flipDir}
                      variants={pageVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      style={{ transformOrigin: flipDir > 0 ? 'right center' : 'left center' }}
                      className="flex min-h-full flex-col md:h-full md:flex-row"
                    >
                      {/* ───── الصفحة الأولى: الصورة والبيانات ───── */}
                      <div className={`relative flex flex-col gap-5 px-6 pb-8 pt-20 md:w-[42%] md:overflow-y-auto md:px-9 md:pt-24 ${PAPER}`}>
                        {/* ظل الكعب */}
                        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-10 bg-gradient-to-r from-black/15 to-transparent md:block" />

                        {/* صورة ملزوقة بشريط */}
                        <div className="relative mx-auto w-full max-w-[320px] -rotate-2">
                          <span className="absolute -top-3 left-6 z-10 h-6 w-16 rotate-[-8deg] bg-[#E8C27A]/80 shadow-sm" />
                          <span className="absolute -top-3 right-6 z-10 h-6 w-16 rotate-[9deg] bg-[#E8C27A]/80 shadow-sm" />
                          <div className="border-[10px] border-b-[44px] border-white bg-white shadow-xl dark:border-[#f1e6cf]">
                            <div className="relative aspect-[4/5] overflow-hidden">
                              <img
                                src={getHighQualityImage(selectedGov.coverImage, 800)}
                                alt={selectedGov.name}
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="absolute bottom-2 inset-x-0 text-center font-main text-lg font-black text-espresso">{selectedGov.name}</div>

                          {/* الختم */}
                          <div className="absolute -bottom-8 -left-4 z-20">
                            <Stamp key={selectedGov.id} label={selectedGov.name} date={formatDate(visited[selectedGov.id])} delay={0.5} />
                          </div>
                        </div>

                        <div className="space-y-3 pt-6 text-center md:text-right">
                          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                            <span className="rounded-md border-2 border-dashed border-primary px-2.5 py-1 text-[11px] font-black text-primary">المحطة {selectedIndex + 1}</span>
                            {selectedGov.region && (
                              <span className="rounded-md border-2 border-dashed border-espresso/50 px-2.5 py-1 text-[11px] font-black dark:border-[#C99444]/60">{selectedGov.region}</span>
                            )}
                          </div>
                          <h2 className="font-main text-5xl font-black leading-tight">{selectedGov.name}</h2>
                          {selectedGov.nickname && <p className="text-lg font-black text-primary">{selectedGov.nickname}</p>}
                          {selectedGov.shortIntro && (
                            <p className="text-sm leading-loose text-black/70 dark:text-white/70">{selectedGov.shortIntro}</p>
                          )}

                          <dl className="space-y-1.5 border-t-2 border-dashed border-espresso/25 pt-3 text-xs dark:border-[#C99444]/30">
                            {selectedGov.capitalCity && (
                              <div className="flex justify-between gap-3">
                                <dt className="font-bold text-black/55 dark:text-white/55">العاصمة</dt>
                                <dd className="font-black">{selectedGov.capitalCity}</dd>
                              </div>
                            )}
                            {selectedGov.nileSegment && (
                              <div className="flex justify-between gap-3">
                                <dt className="font-bold text-black/55 dark:text-white/55">على النيل</dt>
                                <dd className="font-black">{selectedGov.nileSegment}</dd>
                              </div>
                            )}
                          </dl>

                          {selectedGov.famousFor && selectedGov.famousFor.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2 pt-1 md:justify-start">
                              {selectedGov.famousFor.map((item, i) => (
                                <motion.span
                                  key={item}
                                  initial={{ opacity: 0, scale: 0.4 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.35 + i * 0.06, type: 'spring', stiffness: 320, damping: 14 }}
                                  className={`rounded-full bg-primary/12 px-3 py-1 text-xs font-black text-primary ${i % 2 ? 'rotate-1' : '-rotate-1'}`}
                                >
                                  {item}
                                </motion.span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ───── الصفحة التانية: ورق مسطّر + علامات كتاب ───── */}
                      <div className={`relative flex flex-1 flex-col md:flex-row ${PAPER} ${LINED} md:overflow-hidden`}>
                        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-10 bg-gradient-to-l from-black/15 to-transparent md:block" />

                        {/* علامات الكتاب */}
                        <div className="no-scrollbar order-first flex gap-2 overflow-x-auto px-5 pb-1 pt-4 md:order-last md:w-[58px] md:flex-col md:overflow-visible md:px-0 md:pt-24">
                          {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.id;
                            const count =
                              tab.id === 'places' ? places.length
                                : tab.id === 'crafts' ? crafts.length
                                  : tab.id === 'products' ? govMarketProducts.length
                                    : tab.id === 'foods' ? foods.length
                                      : null;
                            return (
                              <motion.button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                animate={{ x: active ? 0 : 0 }}
                                whileHover={{ x: -4 }}
                                whileTap={{ scale: 0.94 }}
                                aria-label={tab.label}
                                className={`relative flex shrink-0 items-center gap-2 rounded-t-xl px-3.5 py-2.5 text-xs font-black whitespace-nowrap transition-colors cursor-pointer md:w-[58px] md:flex-col md:rounded-l-xl md:rounded-r-none md:px-0 md:py-4 ${active
                                  ? 'bg-primary text-white shadow-lg md:-translate-x-1'
                                  : 'bg-espresso/10 text-espresso hover:bg-espresso/20 dark:bg-white/10 dark:text-cream dark:hover:bg-white/20'
                                  }`}
                              >
                                <Icon size={17} />
                                <span className="md:[writing-mode:vertical-rl]">{tab.label}</span>
                                {count !== null && (
                                  <span className={`rounded-full px-1.5 text-[10px] ${active ? 'bg-white/25' : 'bg-primary/20 text-primary'}`}>{count}</span>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>

                        {/* محتوى الصفحة */}
                        <div className="relative flex-1 px-5 pb-10 pt-4 md:overflow-y-auto md:px-9 md:pt-24">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`${selectedGov.id}-${activeTab}`}
                              variants={gridVariants}
                              initial="hidden"
                              animate="show"
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.1 }}
                              className="space-y-5"
                            >
                              {activeTab === 'places' && (
                                places.length > 0 ? (
                                  <div className="grid gap-6 sm:grid-cols-2">
                                    {places.map((place, i) => {
                                      const targetKey = (place as any).slug || (place as any).placeId || place.id;
                                      return (
                                        <motion.button
                                          key={place.id}
                                          variants={rise}
                                          whileHover={{ y: -6, rotate: i % 2 ? 1.5 : -1.5 }}
                                          whileTap={{ scale: 0.97 }}
                                          onClick={() => navigateToPlace(targetKey)}
                                          className="group text-right cursor-pointer"
                                        >
                                          <div className={`bg-white p-2.5 pb-4 shadow-lg dark:bg-[#f1e6cf] ${i % 2 ? 'rotate-1' : '-rotate-1'}`}>
                                            <div className="aspect-[4/3] overflow-hidden">
                                              <img
                                                src={getHighQualityImage(place.coverImage, 600)}
                                                alt={place.title}
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                              />
                                            </div>
                                            <div className="px-1 pt-3 text-espresso">
                                              {place.typeLabel && <span className="text-[11px] font-black text-primary">{place.typeLabel}</span>}
                                              <h4 className="text-base font-black">{place.title}</h4>
                                              {place.shortDescription && <p className="line-clamp-2 text-xs leading-relaxed text-espresso/70">{place.shortDescription}</p>}
                                            </div>
                                          </div>
                                        </motion.button>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-sm text-black/55 dark:text-white/55">لسه مفيش معالم متسجلة للمحافظة دي في الداتابيز.</p>
                                )
                              )}

                              {activeTab === 'crafts' && (
                                crafts.length > 0 ? (
                                  <ul className="space-y-3">
                                    {crafts.map((craft) => (
                                      <motion.li
                                        key={craft.id}
                                        variants={rise}
                                        className="flex items-center gap-4 border-b-2 border-dashed border-espresso/25 pb-3 dark:border-[#C99444]/30"
                                      >
                                        <img
                                          src={getHighQualityImage(craft.coverImage, 300)}
                                          alt={craft.title}
                                          loading="lazy"
                                          className="h-16 w-16 shrink-0 rounded-full border-2 border-espresso/70 object-cover dark:border-[#C99444]"
                                        />
                                        <div className="min-w-0">
                                          <h4 className="truncate text-base font-black">{craft.title}</h4>
                                          <p className="line-clamp-2 text-xs leading-relaxed text-black/65 dark:text-white/65">{craft.shortDescription}</p>
                                        </div>
                                      </motion.li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-black/55 dark:text-white/55">لسه مفيش حرف متسجلة للمحافظة دي في الداتابيز.</p>
                                )
                              )}

                              {activeTab === 'products' && (
                                govMarketProducts.length > 0 ? (
                                  <div className="grid grid-cols-2 gap-4">
                                    {govMarketProducts.map((product) => {
                                      const added = addedProductId === product.id;
                                      return (
                                        <motion.div
                                          key={product.id}
                                          variants={rise}
                                          whileHover={{ y: -5 }}
                                          className={`flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#f1e6cf] ${INK_BORDER}`}
                                        >
                                          <img
                                            src={getHighQualityImage(product.images?.[0], 450)}
                                            alt={product.title}
                                            loading="lazy"
                                            className="aspect-square w-full object-cover"
                                          />
                                          <div className="flex flex-1 flex-col justify-between gap-3 p-3 text-espresso">
                                            <div>
                                              <h4 className="line-clamp-1 text-sm font-black">{product.title}</h4>
                                              <div className="text-xs font-black text-primary">{product.price} جنيه</div>
                                            </div>
                                            <motion.button
                                              whileTap={{ scale: 0.92 }}
                                              onClick={() => handleAddProduct(product)}
                                              className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-black text-white cursor-pointer ${added ? 'bg-emerald-600' : 'bg-espresso'}`}
                                            >
                                              {added ? <Check size={14} /> : <ShoppingBag size={14} />}
                                              <span>{added ? 'اتحط في السلة' : 'حطه في السلة'}</span>
                                            </motion.button>
                                          </div>
                                        </motion.div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-sm text-black/55 dark:text-white/55">مفيش منتجات معروضة بالسوق تابعة للمحافظة دي حالياً.</p>
                                )
                              )}

                              {activeTab === 'foods' && (
                                foods.length > 0 ? (
                                  <ul className="space-y-3">
                                    {foods.map((food: any, idx: number) => (
                                      <motion.li
                                        key={food.id || idx}
                                        variants={rise}
                                        className="flex items-center gap-3 border-b-2 border-dashed border-espresso/25 pb-3 dark:border-[#C99444]/30"
                                      >
                                        {food.coverImage ? (
                                          <img src={getHighQualityImage(food.coverImage, 300)} alt={food.title} loading="lazy" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                                        ) : (
                                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                                            <Utensils size={26} />
                                          </div>
                                        )}
                                        <div className="min-w-0">
                                          <h4 className="text-base font-black">{food.title}</h4>
                                          <p className="line-clamp-2 text-xs leading-relaxed text-black/65 dark:text-white/65">{food.shortDescription || food.description}</p>
                                        </div>
                                      </motion.li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-black/55 dark:text-white/55">لسه مفيش أكلات متسجلة للمحافظة دي في الداتابيز.</p>
                                )
                              )}

                              {activeTab === 'folklore' && (
                                <motion.div variants={rise} className="space-y-4 py-2">
                                  <div className="flex items-center gap-3">
                                    <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                                      <Scroll className="h-9 w-9 text-primary" />
                                    </motion.div>
                                    <h4 className="text-xl font-black">حكايات وذكريات من {selectedGov.name}</h4>
                                  </div>
                                  <p className="text-sm leading-[2rem] text-black/80 dark:text-white/80">
                                    {folkloreStory || 'لسه مفيش حكايات شعبية متسجلة للمحافظة دي في الداتابيز.'}
                                  </p>
                                </motion.div>
                              )}

                              {selectedGov.slug && (
                                <motion.div variants={rise} className="pt-4">
                                  <button
                                    onClick={() => navigateToGovernorate(selectedGov.slug)}
                                    className="group inline-flex items-center gap-2 rounded-xl bg-[#6B3A1F] px-6 py-3.5 text-sm font-black text-[#FFF9EE] shadow-lg transition-transform hover:-translate-y-1 cursor-pointer"
                                  >
                                    <span>افتح ملف المحافظة كامل</span>
                                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1.5" />
                                  </button>
                                </motion.div>
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};

export default UpperEgyptMapPage;