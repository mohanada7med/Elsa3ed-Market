import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import {
  MapGovernorateData,
  MapMarkerItem,
  Product,
} from '../../types';

import {
  ArrowLeft,
  ArrowUpLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Hammer,
  Landmark,
  LayoutGrid,
  MapPin,
  Search,
  Scroll,
  Ship,
  ShoppingBag,
  Sparkles,
  Star,
  Utensils,
  X,
} from 'lucide-react';

/* =========================================================
   WAH | UPPER EGYPT ATLAS
   Responsive + Glassy Luxury Edition
========================================================= */

const LOGO_URL =
  'https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1600&q=85';

/* =========================================================
   GOVERNORATE CONTENT
========================================================= */

const GOVERNORATE_EMBLEMS: Record<
  string,
  {
    label: string;
    folklore: string;
    proverb: string;
  }
> = {
  الفيوم: {
    label: 'أرض السواقي والخزف',
    folklore:
      'الفيوم فيها بحيرة قارون وقرية تونس المشهورة بالخزف والفخار، وسواقي الهدير اللي بتلف وترفع مية بحر يوسف من سنين طويلة.',
    proverb:
      'السواقي تدور وتغني، والخير في بحر يوسف ما ينتهي',
  },

  'بني سويف': {
    label: 'بوابة الصعيد وهرم ميدوم',
    folklore:
      'أول بوابة بتدخلك على الصعيد، ملتقى وادي النيل بالصحرا الشرقية، وفيها هرم ميدوم اللي بيحكي بداية تاريخ الأهرامات في مصر.',
    proverb:
      'أول خطوة في الصعيد سلام، ومن يدخلها يلقى الإكرام',
  },

  المنيا: {
    label: 'عروس الصعيد والتوحيد',
    folklore:
      'عروس الصعيد اللي بتجمع بين تاريخ إخناتون في تل العمارنة ومقابر بني حسن المنحوتة في الجبل، ومعاها دير جبل الطير ونيلها الواسع.',
    proverb:
      'عروس الصعيد النيل في حضنها، والنخل عالي في سماها',
  },

  أسيوط: {
    label: 'قلب الصعيد وفن التلي',
    folklore:
      'عاصمة التجارة التاريخية في الصعيد ومحطة درب الأربعين، ومشهورة بفن التلي الأسيوطي اللي بيتشغل يدوي بخيوط الفضة.',
    proverb:
      'التلي مش بس خيط فضة، دي حكاية فرح وزفة عروسة',
  },

  سوهاج: {
    label: 'معقل الحرير ومهد الملوك',
    folklore:
      'أرض معبد أبيدوس العريق وحضارة الملوك، ومدينة أخميم اللي بتغزل الحرير والنسيج اليدوي من آلاف السنين وكرم ناسها معروف في كل حتة.',
    proverb:
      'نول أخميم يغزل حرير وصوف، وكرم أهلها بالعين موصوف',
  },

  قنا: {
    label: 'أرض القلال ومعبد دندرة',
    folklore:
      'مشهورة بالقلال الفخارية اللي بترطب المية، وجنبها معبد دندرة اللي نقوشه وألوانه لسه حية، وتراث الفركة في نقادة.',
    proverb:
      'من شرب من قلال قنا، لا بد يعود لبلادنا',
  },

  الأقصر: {
    label: 'طيبة عاصمة العالم القديم',
    folklore:
      'عاصمة التاريخ القديم، من معابد الكرنك والأقصر في الشرق لوادي الملوك والملكات في الغرب، وورش الألباستر والنحت اللي شغالين فيها ولاد البلد.',
    proverb:
      'طيبة بلد التاريخ والنور، من يزورها قلبه مسرور',
  },

  أسوان: {
    label: 'بلاد الذهب والنوبة الخالدة',
    folklore:
      'درة النيل في الجنوب وبلاد الذهب، بيوتها النوبية ملونة، ومعابد فيلة وأبو سمبل بتحكي عظمة المكان، ونيلها أهدى وأجمل نيل تشوفه.',
    proverb:
      'في أسوان السلام في القلوب قبل البيوت، والنيل فيها ما يفوت',
  },

  'الوادي الجديد': {
    label: 'واحات النخيل والكنوز',
    folklore:
      'واحات الخارجة والداخلة والفرافرة في قلب الصحرا الغربية، مشهورة بالنخيل وأحلى بلح وسلال الخوص والبيوت المبنية بالطين اللبن.',
    proverb:
      'نخلة الواحات أصلها ثابت في الأرض، وخيرها يفيض على الكل',
  },

  'البحر الأحمر': {
    label: 'بوابة القوافل وحصن القصير',
    folklore:
      'المكان اللي ربط دروب قوافل الصعيد بالبحر من خلال درب الحمامات، وفيها قلعة القصير القديمة وبيوت الحجر المرجاني اللي كانت محطة للحجاج والتجار.',
    proverb:
      'درب الحمامات ربط الجبل بالبحر، وقصير الصعيد حكاية مجد وفخر',
  },
};

/* =========================================================
   TABS
========================================================= */

const TABS = [
  {
    id: 'places' as const,
    label: 'المعالم',
    icon: Landmark,
  },
  {
    id: 'crafts' as const,
    label: 'الحرف',
    icon: Hammer,
  },
  {
    id: 'products' as const,
    label: 'السوق',
    icon: ShoppingBag,
  },
  {
    id: 'foods' as const,
    label: 'السفرة',
    icon: Utensils,
  },
  {
    id: 'folklore' as const,
    label: 'الحكايات',
    icon: Scroll,
  },
];

/* =========================================================
   HELPERS
========================================================= */

const safeImage = (
  image?: string | null,
  fallback = FALLBACK_IMAGE
) => {
  if (!image || typeof image !== 'string') {
    return fallback;
  }

  const clean = image.trim();

  return clean.length > 0 ? clean : fallback;
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export const UpperEgyptMapPage: React.FC = () => {
  const {
    navigateToGovernorate,
    setActivePage,
    products,
    addToCart,
  } = useApp();

  const cachedPayload = wahApi.getCachedMapPayload();

  const [governorates, setGovernorates] = useState<
    MapGovernorateData[]
  >(() => (cachedPayload?.governorates && cachedPayload.governorates.length > 0 ? cachedPayload.governorates : []));

  const [markers, setMarkers] = useState<MapMarkerItem[]>(
    () => (cachedPayload?.markers && cachedPayload.markers.length > 0 ? cachedPayload.markers : [])
  );

  const [isLoading, setIsLoading] = useState<boolean>(
    () => !cachedPayload || !cachedPayload.governorates || cachedPayload.governorates.length === 0
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const [activeTab, setActiveTab] = useState<
    'places' | 'crafts' | 'products' | 'foods' | 'folklore'
  >('places');

  const [displayMode, setDisplayMode] = useState<
    'voyage' | 'grid'
  >('voyage');

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedRegionFilter, setSelectedRegionFilter] =
    useState('الكل');

  const [addedProductId, setAddedProductId] = useState<
    string | null
  >(null);

  /* =======================================================
     FETCH
  ======================================================= */

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const payload = await wahApi.getFullMapPayload();

        if (!isMounted) return;

        if (
          Array.isArray(payload?.governorates) &&
          payload.governorates.length > 0
        ) {
          setGovernorates(payload.governorates);
        }

        if (
          Array.isArray(payload?.markers) &&
          payload.markers.length > 0
        ) {
          setMarkers(payload.markers);
        }
      } catch (error) {
        console.error(
          '[WAH Atlas] Failed to load map payload:',
          error
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =======================================================
     SELECTED GOVERNORATE
  ======================================================= */

  const selectedGov =
    governorates[selectedIndex] ?? governorates[0];

  /* =======================================================
     CURRENT MARKERS
  ======================================================= */

  const currentGovMarkers = useMemo(() => {
    if (!selectedGov) return [];

    return markers.filter(
      (marker) =>
        marker.governorateId === selectedGov.id ||
        marker.governorateName === selectedGov.name
    );
  }, [markers, selectedGov]);

  /* =======================================================
     PLACES
  ======================================================= */

  const places = useMemo(
    () =>
      currentGovMarkers.filter(
        (marker) => marker.type === 'place'
      ),
    [currentGovMarkers]
  );

  /* =======================================================
     CRAFTS
  ======================================================= */

  const crafts = useMemo(
    () =>
      currentGovMarkers.filter(
        (marker) => marker.type === 'craft'
      ),
    [currentGovMarkers]
  );

  /* =======================================================
     PRODUCTS
  ======================================================= */

  const govMarketProducts = useMemo(() => {
    if (!selectedGov || !Array.isArray(products)) {
      return [];
    }

    return products.filter((product) => {
      const origin =
        product.specifications?.originGovernorate ||
        product.sellerGovernorate;

      const titleMatch =
        typeof product.title === 'string' &&
        product.title.includes(selectedGov.name);

      const tagMatch =
        Array.isArray(product.tags) &&
        product.tags.includes(selectedGov.name);

      return (
        origin === selectedGov.name ||
        titleMatch ||
        tagMatch
      );
    });
  }, [products, selectedGov]);

  /* =======================================================
     FILTERED GOVERNORATES
  ======================================================= */

  const filteredGovernorates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return governorates.filter((gov) => {
      const searchMatch =
        !query ||
        gov.name?.toLowerCase().includes(query) ||
        gov.nickname?.toLowerCase().includes(query) ||
        gov.famousFor?.some((item) =>
          item.toLowerCase().includes(query)
        );

      const regionMatch =
        selectedRegionFilter === 'الكل' ||
        gov.region === selectedRegionFilter;

      return searchMatch && regionMatch;
    });
  }, [
    governorates,
    searchQuery,
    selectedRegionFilter,
  ]);

  const currentEmblem =
    GOVERNORATE_EMBLEMS[selectedGov?.name] ?? {
      label: selectedGov?.region || 'الصعيد',
      folklore: selectedGov?.shortIntro || '',
      proverb: '',
    };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const scrollTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const selectGovernorate = (index: number) => {
    if (
      index < 0 ||
      index >= governorates.length
    ) {
      return;
    }

    setSelectedIndex(index);
    setActiveTab('places');
    scrollTop();
  };

  const nextGovernorate = () => {
    if (!governorates.length) return;

    setSelectedIndex((current) =>
      current >= governorates.length - 1
        ? 0
        : current + 1
    );

    setActiveTab('places');
    scrollTop();
  };

  const previousGovernorate = () => {
    if (!governorates.length) return;

    setSelectedIndex((current) =>
      current <= 0
        ? governorates.length - 1
        : current - 1
    );

    setActiveTab('places');
    scrollTop();
  };

  /* =======================================================
     CART
  ======================================================= */

  const handleAddProduct = (product: Product) => {
    try {
      addToCart(product, 1);

      setAddedProductId(product.id);

      window.setTimeout(() => {
        setAddedProductId(null);
      }, 2200);
    } catch (error) {
      console.error(
        '[WAH Atlas] Failed to add product:',
        error
      );
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading || !selectedGov) {
    return (
      <div
        dir="rtl"
        className="
          min-h-screen
          w-full
          overflow-x-hidden
          flex
          items-center
          justify-center
          bg-[#eee8dc]
          text-[#211d18]
          dark:bg-[#0b0b0a]
          dark:text-[#f5f0e7]
          px-4
        "
      >
        <div className="relative w-full max-w-[360px]">
          <div className="absolute inset-0 rounded-[36px] bg-[#9a6a35]/20 blur-3xl" />

          <div
            className="
              relative
              flex
              flex-col
              items-center
              justify-center
              rounded-[28px]
              sm:rounded-[34px]
              border
              border-black/10
              dark:border-white/10
              bg-white/60
              dark:bg-white/[0.05]
              px-7
              sm:px-12
              py-9
              sm:py-10
              shadow-2xl
              backdrop-blur-2xl
            "
          >
            <div
              className="
                flex
                h-16
                w-16
                sm:h-20
                sm:w-20
                items-center
                justify-center
                rounded-[22px]
                border
                border-black/10
                dark:border-white/10
                bg-white/80
                dark:bg-white/[0.08]
                shadow-xl
              "
            >
              <img
                src={LOGO_URL}
                alt="وه"
                className="h-11 w-11 sm:h-14 sm:w-14 object-contain"
              />
            </div>

            <p className="mt-5 text-center text-sm font-black text-[#9a6a35]">
              بنجهز رحلة الصعيد...
            </p>

            <div className="mt-4 flex gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#9a6a35] animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#9a6a35] animate-pulse [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#9a6a35] animate-pulse [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

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
      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <header className="relative z-50 border-b border-black/10 dark:border-white/10">
        <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button
            onClick={() => setActivePage('home')}
            className="
              group flex items-center gap-3
              text-sm font-bold
              transition-all
              hover:text-[#9a6a35]
              cursor-pointer
            "
          >
            <span
              className="
                flex h-10 w-10 items-center justify-center
                rounded-full
                border border-black/10
                bg-white/60
                transition-all
                group-hover:bg-[#211d18]
                group-hover:text-white
                dark:border-white/10
                dark:bg-white/5
                dark:group-hover:bg-white
                dark:group-hover:text-black
              "
            >
              <ArrowLeft
                size={17}
                className="transition-transform group-hover:-translate-x-1"
              />
            </span>
            <span className="hidden sm:block">الرئيسية</span>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <div className="text-[9px] font-bold tracking-[0.35em] text-[#9a6a35]">
              WAH
            </div>
            <div className="mt-1 text-sm font-black">رحلة الصعيد</div>
          </div>

          <div
            className="
              flex
              shrink-0
              items-center
              gap-1
              rounded-xl
              sm:rounded-2xl
              border
              border-black/10
              bg-white/50
              p-1
              backdrop-blur-xl
              dark:border-white/10
              dark:bg-white/[0.05]
              shadow-lg
            "
          >
            <button
              id="btn-view-voyage"
              type="button"
              onClick={() => setDisplayMode('voyage')}
              aria-label="عرض رحلة النيل"
              className={`
                flex
                h-8
                sm:h-10
                items-center
                justify-center
                gap-1.5
                sm:gap-2
                rounded-lg
                sm:rounded-xl
                px-2
                sm:px-4
                text-[8px]
                sm:text-xs
                font-black
                whitespace-nowrap
                transition-all
                cursor-pointer
                ${displayMode === 'voyage'
                  ? 'bg-[#211d18] text-white shadow-lg dark:bg-white dark:text-black'
                  : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
                }
              `}
            >
              <Ship size={15} className="shrink-0" />
              <span>رحلة النيل</span>
            </button>

            <button
              id="btn-view-grid"
              type="button"
              onClick={() => setDisplayMode('grid')}
              aria-label="عرض المحافظات"
              className={`
                flex
                h-8
                sm:h-10
                items-center
                justify-center
                gap-1.5
                sm:gap-2
                rounded-lg
                sm:rounded-xl
                px-2
                sm:px-4
                text-[8px]
                sm:text-xs
                font-black
                whitespace-nowrap
                transition-all
                cursor-pointer
                ${displayMode === 'grid'
                  ? 'bg-[#211d18] text-white shadow-lg dark:bg-white dark:text-black'
                  : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
                }
              `}
            >
              <LayoutGrid size={15} className="shrink-0" />
              <span>المحافظات</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===================================================
          GOVERNORATE RAIL
      =================================================== */}
      <div
        className="
          sticky
          top-0
          z-40
          w-full
          border-b
          border-black/10
          dark:border-white/10
          bg-[#eee8dc]/90
          dark:bg-[#0b0b0a]/90
          backdrop-blur-2xl
        "
      >
        <div className="mx-auto max-w-[1600px] px-3 sm:px-5 md:px-7 lg:px-10 xl:px-12">
          <div className="relative overflow-x-auto no-scrollbar py-3">
            <div className="absolute right-7 left-7 top-[31px] h-px bg-black/10 dark:bg-white/10" />

            <div className="relative z-10 flex min-w-max items-start justify-between gap-2">
              {governorates.map((gov, index) => {
                const active = index === selectedIndex;

                return (
                  <button
                    key={gov.id}
                    id={`ribbon-gov-${gov.id}`}
                    type="button"
                    onClick={() => selectGovernorate(index)}
                    className="group flex min-w-[70px] sm:min-w-[90px] flex-col items-center gap-2 cursor-pointer"
                  >
                    <span
                      className={`
                        relative
                        flex h-8 w-8 sm:h-9 sm:w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        text-[9px] sm:text-[10px]
                        font-black
                        transition-all
                        duration-500
                        ${active
                          ? 'border-[#9a6a35] bg-[#9a6a35] text-white shadow-[0_0_0_5px_rgba(154,106,53,.15)] scale-110'
                          : 'border-black/15 dark:border-white/15 bg-white/80 dark:bg-white/5 text-black/70 dark:text-white/70 group-hover:border-[#9a6a35]'
                        }
                      `}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span
                      className={`
                        max-w-[85px]
                        sm:max-w-[110px]
                        text-center
                        break-words
                        whitespace-normal
                        leading-tight
                        text-[10px]
                        sm:text-xs
                        font-black
                        transition-colors
                        ${active
                          ? 'text-[#9a6a35]'
                          : 'text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white'
                        }
                      `}
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

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}
      <main className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 sm:py-12 lg:px-12">
        {/* =================================================
            GRID MODE
        ================================================= */}
        {displayMode === 'grid' && (
          <section className="mb-14">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 lg:gap-16 items-end mb-8">
              <div>
                <div className="mb-2 text-xs font-bold tracking-[0.3em] text-[#9a6a35]">
                  THE NILE COLLECTION
                </div>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none">
                  الصعيد <span className="text-[#9a6a35]">من جوّه.</span>
                </h2>
                <p className="mt-4 text-sm sm:text-base text-black/60 dark:text-white/60 leading-relaxed">
                  تسع محافظات، آلاف الحكايات، وصناعات اتنقلت من إيد لإيد لحد النهارده.
                </p>
              </div>

              <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] p-6 backdrop-blur-xl shadow-lg">
                <p className="text-[10px] font-bold tracking-[0.25em] text-black/40 dark:text-white/40">
                  UPPER EGYPT
                </p>
                <div className="mt-2 flex items-end gap-3">
                  <span className="text-5xl sm:text-6xl font-black leading-none">
                    {String(governorates.length).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-bold text-black/60 dark:text-white/60">
                    محافظة في رحلة واحدة
                  </span>
                </div>
              </div>
            </div>

            {/* SEARCH & REGION FILTERS */}
            <div className="mb-8 rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-[#151513]/90 p-3 sm:p-4 backdrop-blur-2xl shadow-xl">
              <div className="flex flex-col xl:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="دور على محافظة، مكان، حرفة..."
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
                  {[
                    'الكل',
                    'شمال الصعيد',
                    'وسط الصعيد',
                    'جنوب الصعيد',
                    'الواحات والصحراء الغربية',
                  ].map((region) => {
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

            {/* GOVERNORATES GRID */}
            {filteredGovernorates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGovernorates.map((gov, index) => {
                  const originalIndex = governorates.findIndex((item) => item.id === gov.id);
                  const active = originalIndex === selectedIndex;

                  return (
                    <article
                      key={gov.id}
                      className="group relative overflow-hidden rounded-[2rem] border border-black/10 dark:border-white/10 bg-black shadow-xl cursor-pointer"
                      onClick={() => {
                        selectGovernorate(originalIndex);
                        setDisplayMode('voyage');
                      }}
                    >
                      <div className="relative h-[380px] w-full overflow-hidden">
                        <img
                          src={safeImage(gov.coverImage)}
                          alt={gov.name}
                          className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                        <div className="absolute right-5 top-5 text-7xl font-black leading-none text-white/15">
                          {String(originalIndex + 1).padStart(2, '0')}
                        </div>

                        <div className="absolute left-5 top-5">
                          <span className="inline-flex rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                            {gov.region}
                          </span>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-6">
                          <h3 className="text-3xl font-black text-white group-hover:text-[#d5a56d] transition-colors">
                            {gov.name}
                          </h3>
                          <p className="mt-1 text-xs font-bold text-amber-200">
                            {gov.nickname}
                          </p>
                          <p className="mt-2 line-clamp-2 text-xs text-white/65">
                            {gov.shortIntro}
                          </p>

                          {active && (
                            <span className="mt-4 inline-flex rounded-full border border-white/20 bg-white/20 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                              المحطة الحالية
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
                <h3 className="text-lg font-bold">مفيش نتائج مطابقة</h3>
                <p className="text-xs text-black/50 dark:text-white/50 mt-1">جرّب البحث بكلمة أخرى.</p>
              </div>
            )}
          </section>
        )}

        {/* =================================================
            VOYAGE CONTROLS & HERO
        ================================================= */}
        {displayMode === 'voyage' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold tracking-[0.3em] text-[#9a6a35]">
                  NILE JOURNEY
                </div>
                <p className="mt-1 text-sm font-bold text-black/60 dark:text-white/60">
                  المحطة {String(selectedIndex + 1).padStart(2, '0')} من {String(governorates.length).padStart(2, '0')}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={previousGovernorate}
                  className="flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-4 py-2.5 text-xs font-bold shadow-md backdrop-blur-xl hover:border-[#9a6a35] cursor-pointer"
                >
                  <ChevronRight size={16} />
                  <span>السابقة</span>
                </button>

                <button
                  onClick={nextGovernorate}
                  className="flex items-center gap-2 rounded-xl bg-[#211d18] dark:bg-white text-white dark:text-black px-4 py-2.5 text-xs font-bold shadow-md hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] transition-colors cursor-pointer"
                >
                  <span>التالية</span>
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>

            {/* SELECTED GOVERNORATE HERO CARD */}
            <section className="relative overflow-hidden rounded-[2.5rem] border border-black/10 dark:border-white/10 bg-black min-h-[600px] flex flex-col justify-end p-6 sm:p-12 shadow-2xl">
              <img
                src={safeImage(selectedGov.coverImage)}
                alt={selectedGov.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              <div className="relative z-10 max-w-4xl space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                    {selectedGov.region}
                  </span>
                  <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-bold text-white/70 backdrop-blur-md">
                    {selectedGov.nileSegment}
                  </span>
                </div>

                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black font-serif text-white tracking-tight">
                  {selectedGov.name}
                </h1>

                <p className="text-lg sm:text-2xl font-bold text-amber-200">
                  {selectedGov.nickname}
                </p>

                <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
                  {selectedGov.shortIntro}
                </p>

                <div className="flex items-center gap-2 pt-2 text-xs font-bold text-white/70">
                  <MapPin size={15} className="text-[#9a6a35]" />
                  <span>عاصمة المحافظة: {selectedGov.capitalCity}</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-4">
                  {selectedGov.famousFor?.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* STATS BAR */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { number: places.length, label: 'معالم', icon: Landmark },
                { number: crafts.length, label: 'حرف', icon: Hammer },
                { number: govMarketProducts.length, label: 'منتجات', icon: ShoppingBag },
                { number: selectedGov.stats?.storiesCount ?? 0, label: 'حكايات', icon: Scroll },
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
                      <div className="text-2xl sm:text-3xl font-black leading-none">
                        {stat.number}
                      </div>
                      <div className="mt-1 text-xs font-bold text-black/50 dark:text-white/50">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FOLKLORE QUOTE */}
            <div className="rounded-[2.5rem] border border-black/10 dark:border-white/10 bg-[#211d18] text-white p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full border-[30px] border-white/5" />
              <div className="relative z-10 max-w-3xl mx-auto space-y-4">
                <span className="text-xs font-bold tracking-[0.3em] text-[#d5a56d]">
                  FOLKLORE PROVERB
                </span>
                <blockquote className="text-2xl sm:text-4xl font-black font-serif leading-relaxed">
                  «{currentEmblem.proverb}»
                </blockquote>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed font-medium">
                  {currentEmblem.folklore}
                </p>
              </div>
            </div>

            {/* DOSSIER SECTION (TABS & CONTENT) */}
            <section className="rounded-[2.5rem] border border-black/10 dark:border-white/10 bg-white/60 dark:bg-[#151513]/80 p-6 sm:p-10 backdrop-blur-xl shadow-xl space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-6">
                <div>
                  <div className="text-xs font-bold tracking-[0.3em] text-[#9a6a35]">
                    CULTURAL DOSSIER
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black font-serif mt-1">
                    أرشيف وموسوعة {selectedGov.name}
                  </h3>
                </div>

                <button
                  onClick={() => navigateToGovernorate(selectedGov.slug)}
                  className="flex items-center gap-2 rounded-xl bg-[#211d18] dark:bg-white text-white dark:text-black px-5 py-3 text-xs font-bold shadow-lg hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] transition-colors cursor-pointer w-fit"
                >
                  <span>افتح موسوعة المحافظة</span>
                  <ArrowLeft size={16} />
                </button>
              </div>

              {/* TABS BAR */}
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

              {/* TAB CONTENT */}
              <div className="pt-4">
                {activeTab === 'places' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-black">أهم المعالم والأماكن الأثرية</h4>
                    {places.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {places.map((place) => (
                          <div
                            key={place.id}
                            className="group overflow-hidden rounded-3xl border border-black/10 dark:border-white/10 bg-black text-white relative shadow-lg"
                          >
                            <div className="aspect-[16/10] overflow-hidden">
                              <img
                                src={safeImage(place.coverImage)}
                                alt={place.title}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-6 space-y-1">
                              <span className="text-[10px] font-bold tracking-widest text-[#d5a56d]">
                                {place.typeLabel}
                              </span>
                              <h5 className="text-xl font-black">{place.title}</h5>
                              <p className="text-xs text-white/70 line-clamp-2">
                                {place.shortDescription}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-black/50 dark:text-white/50">لا توجد معالم مسجلة لهذه المحافظة حالياً.</p>
                    )}
                  </div>
                )}

                {activeTab === 'crafts' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-black">الحرف اليدوية التراثية</h4>
                    {crafts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {crafts.map((craft) => (
                          <div
                            key={craft.id}
                            className="flex gap-4 rounded-3xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] p-5 shadow-md"
                          >
                            <img
                              src={safeImage(craft.coverImage)}
                              alt={craft.title}
                              className="h-28 w-28 shrink-0 rounded-2xl object-cover"
                            />
                            <div className="space-y-1 min-w-0">
                              <span className="text-[10px] font-bold text-[#9a6a35]">حرفة تقليدية</span>
                              <h5 className="text-base font-black truncate">{craft.title}</h5>
                              <p className="text-xs text-black/60 dark:text-white/60 line-clamp-3">
                                {craft.shortDescription}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-black/50 dark:text-white/50">لا توجد حرف مسجلة لهذه المحافظة حالياً.</p>
                    )}
                  </div>
                )}

                {activeTab === 'products' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-black">منتجات السوق المرتبطة بالمحافظة</h4>
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
                                <div className="aspect-square overflow-hidden rounded-2xl bg-black/5">
                                  <img
                                    src={safeImage(product.images?.[0])}
                                    alt={product.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                </div>
                                <h5 className="text-sm font-black line-clamp-1">{product.title}</h5>
                                <div className="text-xs font-black text-[#9a6a35]">{product.price} ج.م</div>
                              </div>
                              <button
                                onClick={() => handleAddProduct(product)}
                                className={`mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white transition-colors cursor-pointer ${added ? 'bg-emerald-600' : 'bg-[#211d18] dark:bg-white dark:text-black hover:bg-[#9a6a35]'
                                  }`}
                              >
                                {added ? <Check size={14} /> : <ShoppingBag size={14} />}
                                <span>{added ? 'تم الأضف' : 'أضف للسلة'}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-black/50 dark:text-white/50">لا توجد منتجات معروضة حالياً لهذه المحافظة.</p>
                    )}
                  </div>
                )}

                {activeTab === 'foods' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-black">مطبخ وسفرة المحافظة</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { emoji: '🍞', title: 'العيش الشمسي', text: 'من أشهر تفاصيل البيت الصعيدي، بطعم ورائحة مرتبطة بالخبز البلدي التقليدي.' },
                        { emoji: '🍯', title: 'العسل والفطير', text: 'تفاصيل بسيطة من السفرة المصرية الأصيلة، مرتبطة بالضيافة واللمة.' },
                        { emoji: '🥣', title: 'الكشك الصعيدي', text: 'وصفة تقليدية تعتمد على القمح واللبن وتحضر بطرق مختلفة من بيت لبيت.' },
                        { emoji: '🌿', title: 'الأكل البلدي', text: 'الملوخية والأكلات الريفية جزء من ذاكرة السفرة في محافظات الصعيد.' },
                      ].map((food) => (
                        <div
                          key={food.title}
                          className="flex gap-4 rounded-3xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] p-5 shadow-md"
                        >
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black/5 text-2xl">
                            {food.emoji}
                          </div>
                          <div>
                            <h5 className="text-base font-black">{food.title}</h5>
                            <p className="mt-1 text-xs text-black/60 dark:text-white/60 leading-relaxed">
                              {food.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'folklore' && (
                  <div className="space-y-6 text-center py-8">
                    <Scroll className="mx-auto h-12 w-12 text-[#9a6a35]" />
                    <h4 className="text-xl font-black font-serif">مرويات وحكايات شعبية</h4>
                    <p className="max-w-xl mx-auto text-sm text-black/70 dark:text-white/70 leading-relaxed">
                      {currentEmblem.folklore}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}
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