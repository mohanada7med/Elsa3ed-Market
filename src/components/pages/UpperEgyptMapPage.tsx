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
   REGION THEMES
========================================================= */

const REGION_THEMES: Record<
  string,
  {
    color: string;
    soft: string;
    text: string;
  }
> = {
  'شمال الصعيد': {
    color: '#2F6F62',
    soft: 'bg-[#2F6F62]/10',
    text: 'text-[#2F6F62]',
  },

  'وسط الصعيد': {
    color: '#A36A2D',
    soft: 'bg-[#A36A2D]/10',
    text: 'text-[#A36A2D]',
  },

  'جنوب الصعيد': {
    color: '#B24C2B',
    soft: 'bg-[#B24C2B]/10',
    text: 'text-[#B24C2B]',
  },

  'الواحات والصحراء الغربية': {
    color: '#9B7A2F',
    soft: 'bg-[#9B7A2F]/10',
    text: 'text-[#9B7A2F]',
  },
};

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
      'تحتضن الفيوم بحيرة قارون وقرية تونس الشهيرة بالخزف الريفي، وتتوارث العائلات صناعة الفخار وسواقي الهدير التي ترفع مياه بحر يوسف.',
    proverb:
      'السواقي تدور وتغني، والخير في بحر يوسف ما ينتهي',
  },

  'بني سويف': {
    label: 'بوابة الصعيد وهرم ميدوم',
    folklore:
      'بوابة صعيد مصر الشمالية وملتقى وادي النيل بالصحراء الشرقية، ومهد هرم ميدوم العريق.',
    proverb:
      'أول خطوة في الصعيد سلام، ومن يدخلها يلقى الإكرام',
  },

  المنيا: {
    label: 'عروس الصعيد والتوحيد',
    folklore:
      'أرض الفكر والتوحيد في تل العمارنة، وموطن مقابر بني حسن ودير السيدة العذراء بجبل الطير.',
    proverb:
      'عروس الصعيد النيل في حضنها، والنخل عالي في سماها',
  },

  أسيوط: {
    label: 'قلب الصعيد وفن التلي',
    folklore:
      'عاصمة التجارة التاريخية ودرب الأربعين، وتتميز بفن التلي الأسيوطي الرفيع المشغول يدوياً.',
    proverb:
      'التلي مش بس خيط فضة، دي حكاية فرح وزفة عروسة',
  },

  سوهاج: {
    label: 'معقل الحرير ومهد الملوك',
    folklore:
      'أرض معبد أبيدوس التاريخي ومدينة أخميم ذات التراث العريق، حيث تتوارث الأجيال صناعات النسيج والحرير.',
    proverb:
      'نول أخميم يغزل حرير وصوف، وكرم أهلها بالعين موصوف',
  },

  قنا: {
    label: 'أرض القلال ومعبد دندرة',
    folklore:
      'تشتهر قنا بصناعة القلال الفخارية التقليدية، كما تحتضن معبد دندرة وتراث الفركة في نقادة.',
    proverb:
      'من شرب من قلال قنا، لا بد يعود لبلادنا',
  },

  الأقصر: {
    label: 'طيبة عاصمة العالم القديم',
    folklore:
      'تحتضن الأقصر معابد الكرنك والأقصر ووادي الملوك والملكات، وتشتهر بورش الألباستر والنحت اليدوي.',
    proverb:
      'طيبة بلد التاريخ والنور، من يزورها قلبه مسرور',
  },

  أسوان: {
    label: 'بلاد الذهب والنوبة الخالدة',
    folklore:
      'درة النيل الجنوبية وبلاد الذهب، موطن البيوت النوبية ومعابد فيلة وأبو سمبل والأسواق النوبية.',
    proverb:
      'في أسوان السلام في القلوب قبل البيوت، والنيل فيها ما يفوت',
  },

  'الوادي الجديد': {
    label: 'واحات النخيل والكنوز',
    folklore:
      'تضم واحات الخارجة والداخلة والفرافرة، وتتميز بتراث النخيل وسلال الخوص والتمور والعمارة الطينية.',
    proverb:
      'نخلة الواحات أصلها ثابت في الأرض، وخيرها يفيض على الكل',
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

  const [governorates, setGovernorates] = useState<
    MapGovernorateData[]
  >([]);

  const [markers, setMarkers] = useState<MapMarkerItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);

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

  /* =======================================================
     THEME
  ======================================================= */

  const REGION_THEMES: Record<
    string,
    {
      primary: string;
      secondary: string;
      accent: string;
    }
  > = {
    'شمال الصعيد': {
      primary: '#B24C2B',
      secondary: '#264653',
      accent: '#D89B5B',
    },

    'وسط الصعيد': {
      primary: '#A9442B',
      secondary: '#315C62',
      accent: '#C98B4A',
    },

    'جنوب الصعيد': {
      primary: '#9C4328',
      secondary: '#214C55',
      accent: '#D49A55',
    },
  };

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
          bg-[#F6F1EB]
          dark:bg-[#110E0C]
          px-4
        "
      >
        <div className="relative w-full max-w-[360px]">
          <div className="absolute inset-0 rounded-[36px] bg-[#B24C2B]/20 blur-3xl" />

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
              border-white/70
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
                border-white/80
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

            <p className="mt-5 text-center text-sm font-black text-[#B24C2B]">
              بنجهز رحلة الصعيد...
            </p>

            <div className="mt-4 flex gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B24C2B] animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#B24C2B] animate-pulse [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#B24C2B] animate-pulse [animation-delay:300ms]" />
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
        relative
        min-h-screen
        w-full
        max-w-full
        overflow-x-hidden
        bg-[#F6F1EB]
        dark:bg-[#110E0C]
        text-[#211A16]
        dark:text-[#F8F1EA]
      "
    >
      {/* ===================================================
          AMBIENT BACKGROUND
      =================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-40 top-20 h-[400px] w-[400px] sm:h-[550px] sm:w-[550px] rounded-full bg-[#B24C2B]/[0.055] blur-[100px] sm:blur-[130px]" />

        <div className="absolute -left-40 top-[45%] h-[400px] w-[400px] sm:h-[550px] sm:w-[550px] rounded-full bg-[#264653]/[0.045] blur-[100px] sm:blur-[130px]" />

        <div className="absolute right-[35%] bottom-0 h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] rounded-full bg-[#D7A55B]/[0.035] blur-[100px]" />

        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(36,29,24,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(36,29,24,.6) 1px, transparent 1px)',
            backgroundSize: '70px 70px',
          }}
        />
      </div>

      {/* ===================================================
          HEADER
      =================================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          w-full
          border-b
          border-black/[0.06]
          dark:border-white/[0.07]
          bg-[#F8F4EF]/75
          dark:bg-[#14100E]/75
          backdrop-blur-2xl
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[1600px]
            px-3
            sm:px-5
            md:px-7
            lg:px-10
            xl:px-12
          "
        >
          <div
            className="
              flex
              min-h-[62px]
              sm:min-h-[70px]
              md:min-h-[76px]
              items-center
              justify-between
              gap-2
              sm:gap-3
            "
          >
            {/* BRAND */}

            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setActivePage('home')}
                className="group shrink-0"
              >
                <div
                  className="
                    relative
                    flex
                    h-10
                    w-10
                    sm:h-11
                    sm:w-11
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-xl
                    sm:rounded-2xl
                    border
                    border-white/80
                    dark:border-white/10
                    bg-white/60
                    dark:bg-white/[0.06]
                    shadow-lg
                    backdrop-blur-xl
                    transition-all
                    duration-500
                    group-hover:scale-105
                  "
                >
                  <img
                    src={LOGO_URL}
                    alt="وه"
                    className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
                  />
                </div>
              </button>

              <div className="hidden sm:block h-8 w-px shrink-0 bg-[#DCD2C8] dark:bg-white/10" />

              <div className="min-w-0">
                <p className="text-[7px] sm:text-[8px] font-black tracking-[0.2em] text-[#B24C2B]">
                  WAH / ATLAS
                </p>

                <h1 className="mt-0.5 text-xs sm:text-sm font-black leading-tight">
                  رحلة الصعيد
                </h1>
              </div>
            </div>

            {/* VIEW SWITCHER */}

            <div
              className="
                flex
                shrink-0
                items-center
                gap-1
                rounded-xl
                sm:rounded-2xl
                border
                border-white/80
                dark:border-white/10
                bg-white/50
                dark:bg-white/[0.05]
                p-1
                backdrop-blur-xl
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
                  ${displayMode === 'voyage'
                    ? 'bg-[#211A16] text-white shadow-lg dark:bg-white dark:text-[#211A16]'
                    : 'text-[#77685D] dark:text-[#AFA096] hover:bg-white/50 dark:hover:bg-white/[0.05]'
                  }
                `}
              >
                <Ship className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />

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
                  ${displayMode === 'grid'
                    ? 'bg-[#211A16] text-white shadow-lg dark:bg-white dark:text-[#211A16]'
                    : 'text-[#77685D] dark:text-[#AFA096] hover:bg-white/50 dark:hover:bg-white/[0.05]'
                  }
                `}
              >
                <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />

                <span>المحافظات</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===================================================
          GOVERNORATE RAIL
      =================================================== */}

      <div
        className="
          sticky
          top-[62px]
          sm:top-[70px]
          md:top-[76px]
          z-40
          w-full
          border-b
          border-black/[0.04]
          dark:border-white/[0.05]
          bg-[#F8F4EF]/60
          dark:bg-[#14100E]/60
          backdrop-blur-2xl
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[1600px]
            px-2
            sm:px-5
            md:px-7
            lg:px-10
            xl:px-12
          "
        >
          <div className="relative overflow-x-auto no-scrollbar py-2.5 sm:py-3">
            <div className="absolute right-7 left-7 sm:right-8 sm:left-8 top-[25px] sm:top-[30px] h-px bg-[#D9CFC5] dark:bg-white/10" />

            <div className="relative z-10 flex min-w-max items-start justify-between gap-1.5 sm:gap-2">
              {governorates.map((gov, index) => {
                const active = index === selectedIndex;

                return (
                  <button
                    key={gov.id}
                    id={`ribbon-gov-${gov.id}`}
                    type="button"
                    onClick={() =>
                      selectGovernorate(index)
                    }
                    className="
                      group
                      flex
                      min-w-[62px]
                      sm:min-w-[75px]
                      md:min-w-[90px]
                      flex-col
                      items-center
                      gap-1.5
                      px-0.5
                    "
                  >
                    <span
                      className={`
                        relative
                        flex
                        h-7
                        w-7
                        sm:h-8
                        sm:w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        text-[8px]
                        sm:text-[9px]
                        font-black
                        transition-all
                        duration-500
                        ${active
                          ? 'border-[#B24C2B] bg-[#B24C2B] text-white shadow-[0_0_0_5px_rgba(178,76,43,.10),0_8px_25px_rgba(178,76,43,.25)] scale-110'
                          : 'border-white/80 dark:border-white/10 bg-[#F8F3EE]/80 dark:bg-white/[0.06] text-[#88786B] dark:text-[#A8998E] backdrop-blur-xl group-hover:border-[#B24C2B]'
                        }
                      `}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span
                      className={`
                        max-w-[78px]
                        sm:max-w-[95px]
                        text-center
                        break-words
                        whitespace-normal
                        leading-tight
                        text-[8px]
                        sm:text-[9px]
                        md:text-[10px]
                        font-black
                        transition-colors
                        ${active
                          ? 'text-[#B24C2B]'
                          : 'text-[#837469] dark:text-[#A39488]'
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
          MAIN
      =================================================== */}

      <main
        className="
          mx-auto
          w-full
          max-w-[1600px]
          px-3
          sm:px-5
          md:px-7
          lg:px-10
          xl:px-12
          py-4
          sm:py-6
          md:py-8
          lg:py-10
        "
      >
        {/* =================================================
            GRID MODE
        ================================================= */}

        {displayMode === 'grid' && (
          <section className="mb-8 sm:mb-12 lg:mb-16">
            <div
              className="
                grid
                grid-cols-1
                lg:grid-cols-[1fr_330px]
                gap-7
                lg:gap-16
                items-end
                mb-7
                sm:mb-8
              "
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black tracking-[0.2em] text-[#B24C2B]">
                  <Compass className="h-3.5 w-3.5 shrink-0" />
                  THE NILE COLLECTION
                </div>

                <h2
                  className="
                    mt-3
                    font-serif
                    font-black
                    leading-[0.9]
                    tracking-tight
                    text-[48px]
                    sm:text-[62px]
                    md:text-[76px]
                    lg:text-[90px]
                  "
                >
                  الصعيد
                  <br />

                  <span className="text-[#B24C2B]">
                    من جوّه.
                  </span>
                </h2>

                <p className="mt-5 max-w-2xl text-xs sm:text-sm md:text-base leading-7 sm:leading-8 text-[#76675B] dark:text-[#B3A59A]">
                  تسع محافظات، آلاف الحكايات، وصناعات اتنقلت
                  من إيد لإيد لحد النهارده.
                </p>
              </div>

              {/* UPPER EGYPT INFO
                  أصبح ظاهر على كل المقاسات */}
              <div className="block">
                <div
                  className="
                    rounded-[22px]
                    sm:rounded-[28px]
                    border
                    border-white/80
                    dark:border-white/10
                    bg-white/45
                    dark:bg-white/[0.04]
                    p-4
                    sm:p-6
                    backdrop-blur-xl
                    shadow-xl
                  "
                >
                  <p className="text-[8px] sm:text-[9px] font-black tracking-[0.2em] text-[#97887B]">
                    UPPER EGYPT
                  </p>

                  <div className="mt-2 flex items-end gap-3">
                    <span className="font-serif text-5xl sm:text-6xl md:text-7xl font-black leading-none">
                      {String(
                        governorates.length
                      ).padStart(2, '0')}
                    </span>

                    <span className="pb-1 text-[10px] sm:text-xs font-bold leading-5 text-[#837469] dark:text-[#A39488]">
                      محافظات
                      <br />
                      في رحلة واحدة
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SEARCH */}

            <div
              className="
                mb-6
                sm:mb-7
                rounded-[22px]
                sm:rounded-[28px]
                border
                border-white/80
                dark:border-white/10
                bg-white/55
                dark:bg-white/[0.045]
                p-2.5
                sm:p-3
                shadow-xl
                backdrop-blur-2xl
              "
            >
              <div className="flex flex-col xl:flex-row gap-2.5">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute right-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-[#9A897B]" />

                  <input
                    id="input-search-govs"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(
                        event.target.value
                      )
                    }
                    placeholder="دور على محافظة، مكان، حرفة..."
                    className="
                      h-12
                      sm:h-14
                      w-full
                      rounded-xl
                      sm:rounded-2xl
                      border
                      border-white/70
                      dark:border-white/[0.06]
                      bg-white/55
                      dark:bg-white/[0.05]
                      pr-11
                      sm:pr-12
                      pl-10
                      sm:pl-11
                      text-xs
                      sm:text-sm
                      font-bold
                      outline-none
                      backdrop-blur-xl
                      transition-all
                      placeholder:text-[#9B8B7E]
                      focus:border-[#B24C2B]/50
                      focus:bg-white/80
                      dark:focus:bg-white/[0.08]
                    "
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchQuery('')
                      }
                      className="
                        absolute
                        left-2
                        sm:left-3
                        top-1/2
                        flex
                        h-8
                        w-8
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-lg
                        text-[#88786C]
                        hover:bg-black/5
                        dark:hover:bg-white/5
                      "
                    >
                      <X className="h-4 w-4" />
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
                    const active =
                      selectedRegionFilter ===
                      region;

                    return (
                      <button
                        key={region}
                        type="button"
                        onClick={() =>
                          setSelectedRegionFilter(
                            region
                          )
                        }
                        className={`
                          shrink-0
                          rounded-xl
                          px-3.5
                          sm:px-4
                          py-2.5
                          sm:py-3
                          text-[9px]
                          sm:text-[10px]
                          md:text-xs
                          font-black
                          whitespace-nowrap
                          transition-all
                          ${active
                            ? 'bg-[#B24C2B] text-white shadow-lg shadow-[#B24C2B]/20'
                            : 'bg-white/45 dark:bg-white/[0.05] text-[#77685D] dark:text-[#AFA096] border border-white/60 dark:border-white/[0.05]'
                          }
                        `}
                      >
                        {region}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* GOVERNORATE GRID */}

            {filteredGovernorates.length > 0 ? (
              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  xl:grid-cols-12
                  gap-3
                  sm:gap-4
                  lg:gap-5
                "
              >
                {filteredGovernorates.map(
                  (gov, index) => {
                    const originalIndex =
                      governorates.findIndex(
                        (item) =>
                          item.id === gov.id
                      );

                    const active =
                      originalIndex ===
                      selectedIndex;

                    const featured = index === 0;

                    return (
                      <article
                        key={gov.id}
                        id={`card-gov-${gov.id}`}
                        className={`
                          group
                          relative
                          overflow-hidden
                          rounded-[24px]
                          sm:rounded-[30px]
                          border
                          border-white/20
                          bg-[#1D1511]
                          shadow-xl
                          ${featured
                            ? 'xl:col-span-7 xl:row-span-2'
                            : 'xl:col-span-5'
                          }
                        `}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            selectGovernorate(
                              originalIndex
                            );
                            setDisplayMode(
                              'voyage'
                            );
                          }}
                          className={`
                            relative
                            block
                            w-full
                            text-right
                            ${featured
                              ? 'h-[500px] sm:h-[600px] xl:h-full xl:min-h-[650px]'
                              : 'h-[350px] sm:h-[400px]'
                            }
                          `}
                        >
                          <img
                            src={safeImage(
                              gov.coverImage
                            )}
                            alt={gov.name}
                            loading={
                              featured
                                ? 'eager'
                                : 'lazy'
                            }
                            className="
                              absolute
                              inset-0
                              h-full
                              w-full
                              object-cover
                              transition-transform
                              duration-[1200ms]
                              group-hover:scale-105
                            "
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

                          <div className="absolute inset-0 bg-gradient-to-l from-black/25 to-transparent" />

                          {/* TOP */}

                          <div className="absolute top-4 sm:top-5 right-4 sm:right-5 left-4 sm:left-5 flex items-start justify-between gap-3">
                            <span className="max-w-[72%] break-words rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[8px] sm:text-[9px] font-black leading-4 text-white/85 backdrop-blur-xl">
                              {gov.region}
                            </span>

                            <span
                              className="
                                flex
                                h-9
                                w-9
                                sm:h-10
                                sm:w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-white/20
                                bg-white/10
                                text-white
                                backdrop-blur-xl
                                transition-all
                                group-hover:-translate-y-1
                                group-hover:-translate-x-1
                              "
                            >
                              <ArrowUpLeft className="h-4 w-4" />
                            </span>
                          </div>

                          {/* CONTENT */}

                          <div className="absolute right-4 sm:right-5 left-4 sm:left-5 bottom-5 sm:bottom-7">
                            <div className="flex flex-wrap items-center gap-2 text-[8px] sm:text-[9px] font-black tracking-[0.2em] text-white/50">
                              {String(
                                originalIndex + 1
                              ).padStart(2, '0')}

                              <span className="h-px w-5 bg-[#E88E72]" />

                              UPPER EGYPT
                            </div>

                            <h3
                              className={`
                                mt-2
                                font-serif
                                font-black
                                leading-[0.95]
                                text-white
                                break-words
                                ${featured
                                  ? 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl'
                                  : 'text-4xl sm:text-5xl'
                                }
                              `}
                            >
                              {gov.name}
                            </h3>

                            <p className="mt-2 break-words text-xs sm:text-sm font-bold text-amber-200">
                              {gov.nickname}
                            </p>

                            {featured && (
                              <p className="mt-3 sm:mt-4 max-w-xl break-words text-[11px] sm:text-xs md:text-sm leading-6 sm:leading-7 text-white/65">
                                {gov.shortIntro}
                              </p>
                            )}

                            {active && (
                              <span className="mt-3 sm:mt-4 inline-flex max-w-full rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[8px] sm:text-[9px] font-black text-white backdrop-blur-xl">
                                المحطة الحالية
                              </span>
                            )}
                          </div>
                        </button>
                      </article>
                    );
                  }
                )}
              </div>
            ) : (
              <EmptyState
                icon={<Search />}
                title="مفيش نتائج"
                description="جرّب كلمة بحث مختلفة."
              />
            )}
          </section>
        )}

        {/* =================================================
            VOYAGE CONTROLS
        ================================================= */}

        {displayMode === 'voyage' && (
          <section className="mb-4 sm:mb-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black tracking-[0.2em] text-[#B24C2B]">
                  <Ship className="h-3.5 w-3.5 shrink-0" />
                  NILE JOURNEY
                </div>

                <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-bold text-[#75665A] dark:text-[#B5A69A]">
                  المحطة{' '}
                  {String(selectedIndex + 1).padStart(
                    2,
                    '0'
                  )}{' '}
                  من{' '}
                  {String(governorates.length).padStart(
                    2,
                    '0'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:flex gap-2">
                <button
                  id="btn-prev-station"
                  type="button"
                  onClick={previousGovernorate}
                  className="
                    group
                    flex
                    h-10
                    sm:h-11
                    items-center
                    justify-center
                    gap-1.5
                    sm:gap-2
                    rounded-xl
                    border
                    border-white/80
                    dark:border-white/10
                    bg-white/55
                    dark:bg-white/[0.05]
                    px-3
                    sm:px-4
                    text-[10px]
                    sm:text-xs
                    font-black
                    whitespace-nowrap
                    shadow-lg
                    backdrop-blur-xl
                    transition-all
                    hover:border-[#B24C2B]/40
                  "
                >
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  السابقة
                </button>

                <button
                  id="btn-next-station"
                  type="button"
                  onClick={nextGovernorate}
                  className="
                    group
                    flex
                    h-10
                    sm:h-11
                    items-center
                    justify-center
                    gap-1.5
                    sm:gap-2
                    rounded-xl
                    bg-[#B24C2B]
                    px-3
                    sm:px-4
                    text-[10px]
                    sm:text-xs
                    font-black
                    whitespace-nowrap
                    text-white
                    shadow-lg
                    shadow-[#B24C2B]/20
                    transition-all
                    hover:bg-[#963E21]
                  "
                >
                  التالية
                  <ChevronLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            HERO
        ================================================= */}

        {displayMode === 'voyage' && (
          <section className="relative w-full">
            <div
              className="
                relative
                min-h-[600px]
                sm:min-h-[640px]
                md:min-h-[660px]
                lg:min-h-[720px]
                xl:min-h-[780px]
                overflow-hidden
                rounded-[24px]
                sm:rounded-[32px]
                md:rounded-[38px]
                lg:rounded-[44px]
                border
                border-white/20
                bg-[#17110E]
                shadow-[0_25px_80px_rgba(35,22,15,.18)]
                lg:shadow-[0_40px_120px_rgba(35,22,15,.22)]
              "
            >
              <img
                src={safeImage(
                  selectedGov.coverImage
                )}
                alt={selectedGov.name}
                loading="eager"
                className="
                  absolute
                  inset-0
                  h-full
                  w-full
                  object-cover
                "
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0806] via-[#0A0806]/45 to-[#0A0806]/5" />

              <div className="absolute inset-0 bg-gradient-to-l from-[#0A0806]/50 via-transparent to-transparent" />

              {/* AMBIENT LIGHT */}

              <div className="absolute right-[15%] top-[10%] h-36 w-36 sm:h-48 sm:w-48 rounded-full bg-[#B24C2B]/15 blur-[70px] sm:blur-[90px]" />

              <div className="absolute left-[10%] bottom-[15%] h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-[#E8B76E]/10 blur-[60px] sm:blur-[80px]" />

              {/* TOP */}

              <div className="absolute top-4 sm:top-7 lg:top-8 right-4 sm:right-7 lg:right-8 left-4 sm:left-7 lg:left-8 flex items-start justify-between gap-4">
                <div className="flex min-w-0 max-w-[78%] flex-wrap gap-1.5 sm:gap-2">
                  <span className="max-w-full break-words rounded-full border border-white/15 bg-white/[0.08] px-2.5 sm:px-3 py-1.5 text-[8px] sm:text-[9px] font-black leading-4 text-white/85 backdrop-blur-xl">
                    {selectedGov.region}
                  </span>

                  {/* ظهر على كل المقاسات */}
                  <span className="max-w-full break-words rounded-full border border-white/15 bg-white/[0.08] px-2.5 sm:px-3 py-1.5 text-[8px] sm:text-[9px] font-black leading-4 text-white/65 backdrop-blur-xl">
                    {selectedGov.nileSegment}
                  </span>
                </div>

                <div className="shrink-0 text-left">
                  <div className="font-serif text-4xl sm:text-6xl md:text-7xl font-black leading-none text-white/90">
                    {String(
                      selectedIndex + 1
                    ).padStart(2, '0')}
                  </div>

                  <div className="mt-1 text-[7px] sm:text-[8px] font-black tracking-[0.25em] text-white/40">
                    OF{' '}
                    {String(
                      governorates.length
                    ).padStart(2, '0')}
                  </div>
                </div>
              </div>

              {/* HERO CONTENT */}

              <div className="absolute right-4 sm:right-7 lg:right-10 xl:right-12 bottom-5 sm:bottom-8 lg:bottom-10 xl:bottom-12 left-4 sm:left-7 lg:left-10 xl:left-12">
                <div className="max-w-6xl">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[7px] sm:text-[9px] lg:text-[10px] font-black tracking-[0.2em] text-white/50">
                    THE UPPER EGYPT ATLAS

                    <span className="h-px w-6 sm:w-10 bg-[#E88E72]" />

                    WAH
                  </div>

                  <h2
                    id="active-gov-dossier-title"
                    className="
                      mt-3
                      sm:mt-4
                      max-w-full
                      font-serif
                      font-black
                      leading-[0.85]
                      tracking-[-0.05em]
                      text-white
                      break-words
                      text-[52px]
                      sm:text-[72px]
                      md:text-[94px]
                      lg:text-[115px]
                      xl:text-[145px]
                    "
                  >
                    {selectedGov.name}
                  </h2>

                  <div className="mt-5 sm:mt-7 flex flex-col gap-3 sm:gap-5">
                    <div className="min-w-0">
                      <p className="text-sm sm:text-lg lg:text-2xl font-black text-amber-200 break-words">
                        {selectedGov.nickname}
                      </p>

                      <p className="mt-1.5 sm:mt-2 max-w-2xl break-words text-[10px] sm:text-xs lg:text-base leading-6 sm:leading-7 text-white/65">
                        {selectedGov.shortIntro}
                      </p>
                    </div>

                    {/* ظهر على كل المقاسات */}
                    <div className="flex w-fit max-w-full items-center gap-2 text-[10px] sm:text-xs lg:text-sm font-bold text-white/65">
                      <MapPin className="h-4 w-4 shrink-0 text-[#E88E72]" />

                      <span className="break-words">
                        {selectedGov.capitalCity}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 flex max-w-full overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 pb-1">
                    {selectedGov.famousFor
                      ?.slice(0, 5)
                      .map((item) => (
                        <span
                          key={item}
                          className="
                            shrink-0
                            rounded-full
                            border
                            border-white/10
                            bg-white/[0.07]
                            px-2.5
                            sm:px-3
                            py-1.5
                            text-[8px]
                            sm:text-[9px]
                            md:text-[10px]
                            font-bold
                            text-white/70
                            backdrop-blur-xl
                          "
                        >
                          {item}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                GLASS STATS
            ================================================= */}

            <div className="relative z-10 mx-2 sm:mx-5 md:mx-8 lg:mx-14 xl:mx-16 -mt-8 sm:-mt-11 md:-mt-14">
              <div
                className="
                  grid
                  grid-cols-2
                  md:grid-cols-4
                  overflow-hidden
                  rounded-[20px]
                  sm:rounded-[28px]
                  md:rounded-[32px]
                  border
                  border-white/80
                  dark:border-white/10
                  bg-white/55
                  dark:bg-[#1A1411]/75
                  backdrop-blur-2xl
                  shadow-[0_25px_70px_rgba(35,22,15,.13)]
                "
              >
                {[
                  {
                    number:
                      selectedGov.stats
                        ?.placesCount ??
                      places.length,
                    label: 'معالم',
                    icon: Landmark,
                  },

                  {
                    number:
                      selectedGov.stats
                        ?.craftsCount ??
                      crafts.length,
                    label: 'حرف',
                    icon: Hammer,
                  },

                  {
                    number:
                      selectedGov.stats
                        ?.productsCount ??
                      govMarketProducts.length,
                    label: 'منتجات',
                    icon: ShoppingBag,
                  },

                  {
                    number:
                      selectedGov.stats
                        ?.storiesCount ?? 0,
                    label: 'حكايات',
                    icon: Scroll,
                  },
                ].map((stat, index) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className={`
                        flex
                        min-w-0
                        items-center
                        gap-2
                        sm:gap-3
                        lg:gap-4
                        p-3
                        sm:p-5
                        lg:p-7
                        ${index % 2 !== 0
                          ? 'border-r border-black/[0.06] dark:border-white/[0.07]'
                          : ''
                        }
                        ${index >= 2
                          ? 'border-t border-black/[0.06] dark:border-white/[0.07] md:border-t-0'
                          : ''
                        }
                        ${index !== 0
                          ? 'md:border-r'
                          : ''
                        }
                      `}
                    >
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          sm:h-11
                          sm:w-11
                          lg:h-12
                          lg:w-12
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          sm:rounded-2xl
                          border
                          border-white/70
                          dark:border-white/10
                          bg-white/55
                          dark:bg-white/[0.05]
                          text-[#B24C2B]
                          shadow-sm
                        "
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="font-serif text-xl sm:text-2xl lg:text-3xl font-black leading-none">
                          {stat.number}
                        </p>

                        <p className="mt-1 text-[8px] sm:text-[9px] lg:text-[10px] font-black text-[#8A796C] dark:text-[#9E8E82]">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            INTRO
        ================================================= */}

        <section className="py-10 sm:py-14 md:py-16 lg:py-20">
          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-[1fr_1.4fr]
              gap-7
              lg:gap-20
            "
          >
            <div>
              <div className="text-[8px] sm:text-[10px] font-black tracking-[0.2em] text-[#B24C2B]">
                {currentEmblem.label}
              </div>

              <h3
                className="
                  mt-2 sm:mt-3
                  font-serif
                  font-black
                  leading-tight
                  text-3xl
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                كل محافظة
                <br />

                <span className="text-[#B24C2B]">
                  لها روحها.
                </span>
              </h3>
            </div>

            <div>
              <p className="break-words text-sm sm:text-base lg:text-xl leading-8 sm:leading-9 text-[#62544A] dark:text-[#B8A99D]">
                {currentEmblem.folklore}
              </p>

              <div className="mt-5 sm:mt-7 flex items-center gap-3 sm:gap-4">
                <span className="h-px w-10 sm:w-14 bg-[#B24C2B]" />

                <span className="text-[10px] sm:text-xs font-black text-[#8A796B] dark:text-[#96867A]">
                  {selectedGov.name}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            DOSSIER
        ================================================= */}

        <section
          className="
            overflow-hidden
            rounded-[24px]
            sm:rounded-[32px]
            lg:rounded-[42px]
            border
            border-white/80
            dark:border-white/10
            bg-white/45
            dark:bg-white/[0.035]
            shadow-[0_25px_100px_rgba(40,25,15,.08)]
            backdrop-blur-xl
          "
        >
          {/* DOSSIER HEADER */}

          <div className="border-b border-black/[0.05] dark:border-white/[0.07] p-4 sm:p-6 md:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 lg:gap-6">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[8px] sm:text-[9px] font-black tracking-[0.2em] text-[#B24C2B]">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  CULTURAL DOSSIER
                </div>

                <h3 className="mt-2 break-words font-serif text-2xl sm:text-3xl lg:text-4xl font-black">
                  من المكان للحكاية
                </h3>
              </div>

              <button
                id={`btn-open-encyclopedia-${selectedGov.id}`}
                type="button"
                onClick={() =>
                  navigateToGovernorate(
                    selectedGov.slug
                  )
                }
                className="
                  group
                  flex
                  w-full
                  lg:w-auto
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-white/70
                  dark:border-white/10
                  bg-[#211A16]
                  dark:bg-white
                  px-5
                  py-3.5
                  text-[10px]
                  sm:text-xs
                  font-black
                  whitespace-nowrap
                  text-white
                  dark:text-[#211A16]
                  shadow-lg
                  transition-all
                  hover:bg-[#B24C2B]
                  dark:hover:bg-[#B24C2B]
                  dark:hover:text-white
                "
              >
                افتح الموسوعة

                <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
              </button>
            </div>

            {/* TABS */}

            <div className="mt-6 sm:mt-7 overflow-x-auto no-scrollbar pb-1">
              <div
                className="
                  flex
                  min-w-max
                  gap-1
                  rounded-xl
                  sm:rounded-2xl
                  border
                  border-white/70
                  dark:border-white/10
                  bg-white/35
                  dark:bg-white/[0.04]
                  p-1.5
                  backdrop-blur-xl
                "
              >
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active =
                    activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      id={`tab-btn-${tab.id}`}
                      type="button"
                      onClick={() =>
                        setActiveTab(tab.id)
                      }
                      className={`
                        flex
                        shrink-0
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        sm:rounded-xl
                        px-3.5
                        sm:px-5
                        lg:px-6
                        py-2.5
                        sm:py-3
                        text-[9px]
                        sm:text-[10px]
                        md:text-xs
                        font-black
                        whitespace-nowrap
                        transition-all
                        ${active
                          ? 'border border-white/70 dark:border-white/10 bg-white/75 dark:bg-white/[0.09] text-[#211A16] dark:text-white shadow-md backdrop-blur-xl'
                          : 'text-[#827267] dark:text-[#A99A8D] hover:bg-white/30 dark:hover:bg-white/[0.04]'
                        }
                      `}
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />

                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =================================================
              DOSSIER CONTENT
          ================================================= */}

          <div className="p-4 sm:p-6 md:p-8 lg:p-10">
            {/* =================================================
                PLACES
            ================================================= */}

            {activeTab === 'places' && (
              <div>
                <DossierHeading
                  eyebrow="PLACES / MONUMENTS"
                  title={`أماكن بتحكي تاريخ ${selectedGov.name}`}
                />

                {places.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {places.map((place, index) => (
                      <article
                        key={place.id}
                        className="
                          group
                          relative
                          overflow-hidden
                          rounded-[22px]
                          sm:rounded-[28px]
                          border
                          border-white/15
                          bg-[#201713]
                          shadow-xl
                        "
                      >
                        <div className="aspect-[1.35] sm:aspect-[1.5] overflow-hidden">
                          <img
                            src={safeImage(
                              place.coverImage
                            )}
                            alt={place.title}
                            loading="lazy"
                            className="
                              h-full
                              w-full
                              object-cover
                              transition-transform
                              duration-[1000ms]
                              group-hover:scale-105
                            "
                          />
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                        <div className="absolute right-4 sm:right-5 left-4 sm:left-5 bottom-4 sm:bottom-5">
                          <div className="flex flex-wrap items-center gap-2 text-[8px] sm:text-[9px] font-black text-white/50">
                            {String(index + 1).padStart(
                              2,
                              '0'
                            )}

                            <span className="h-px w-5 bg-white/30" />

                            {place.typeLabel}
                          </div>

                          <h4 className="mt-2 break-words text-lg sm:text-xl md:text-2xl font-black text-white">
                            {place.title}
                          </h4>

                          <p className="mt-1.5 sm:mt-2 break-words text-[10px] sm:text-xs leading-6 text-white/65">
                            {place.shortDescription}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Landmark />}
                    title="المعالم بتتجمع هنا"
                    description="اكتشف معالم وأماكن المحافظة في الموسوعة."
                  />
                )}
              </div>
            )}

            {/* =================================================
                CRAFTS
            ================================================= */}

            {activeTab === 'crafts' && (
              <div>
                <DossierHeading
                  eyebrow="LIVING CRAFTS"
                  title={`الصنعة اللي لسه عايشة في ${selectedGov.name}`}
                />

                {crafts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {crafts.map((craft, index) => (
                      <article
                        key={craft.id}
                        className="
                          group
                          grid
                          grid-cols-1
                          sm:grid-cols-[150px_1fr]
                          md:grid-cols-[165px_1fr]
                          lg:grid-cols-[190px_1fr]
                          overflow-hidden
                          rounded-[22px]
                          sm:rounded-[26px]
                          border
                          border-white/80
                          dark:border-white/10
                          bg-white/45
                          dark:bg-white/[0.035]
                          shadow-lg
                          backdrop-blur-xl
                        "
                      >
                        <div className="h-52 sm:h-full min-h-[180px] overflow-hidden">
                          <img
                            src={safeImage(
                              craft.coverImage
                            )}
                            alt={craft.title}
                            loading="lazy"
                            className="
                              h-full
                              w-full
                              object-cover
                              transition-transform
                              duration-700
                              group-hover:scale-105
                            "
                          />
                        </div>

                        <div className="min-w-0 p-4 sm:p-5 md:p-6">
                          <div className="text-[8px] sm:text-[9px] font-black tracking-widest text-[#B24C2B]">
                            CRAFT{' '}
                            {String(index + 1).padStart(
                              2,
                              '0'
                            )}
                          </div>

                          <h4 className="mt-2 sm:mt-3 break-words text-base sm:text-lg md:text-xl font-black">
                            {craft.title}
                          </h4>

                          <p className="mt-2 sm:mt-3 break-words text-[10px] sm:text-xs md:text-sm leading-6 sm:leading-7 text-[#75665A] dark:text-[#B2A398]">
                            {craft.shortDescription}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Hammer />}
                    title="الحرف بتتجمع هنا"
                    description="الصناعات والحرف اليدوية المحلية جزء أساسي من هوية المحافظة."
                  />
                )}
              </div>
            )}

            {/* =================================================
                PRODUCTS
            ================================================= */}

            {activeTab === 'products' && (
              <div>
                <DossierHeading
                  eyebrow="FROM WORKSHOP TO HOME"
                  title={`اختيارات من سوق ${selectedGov.name}`}
                />

                {govMarketProducts.length > 0 ? (
                  <div
                    className="
                      grid
                      grid-cols-2
                      sm:grid-cols-2
                      md:grid-cols-3
                      lg:grid-cols-4
                      gap-2.5
                      sm:gap-4
                      lg:gap-5
                    "
                  >
                    {govMarketProducts.map(
                      (product) => {
                        const added =
                          addedProductId ===
                          product.id;

                        return (
                          <article
                            key={product.id}
                            className="
                              group
                              min-w-0
                              overflow-hidden
                              rounded-[18px]
                              sm:rounded-[22px]
                              lg:rounded-[24px]
                              border
                              border-white/80
                              dark:border-white/10
                              bg-white/45
                              dark:bg-white/[0.035]
                              shadow-lg
                              backdrop-blur-xl
                            "
                          >
                            <div className="relative aspect-square overflow-hidden bg-[#E7DDD3] dark:bg-[#30261F]">
                              <img
                                src={safeImage(
                                  product.images?.[0]
                                )}
                                alt={product.title}
                                loading="lazy"
                                className="
                                  h-full
                                  w-full
                                  object-cover
                                  transition-transform
                                  duration-700
                                  group-hover:scale-105
                                "
                              />

                              <div
                                className="
                                  absolute
                                  top-2
                                  sm:top-3
                                  right-2
                                  sm:right-3
                                  flex
                                  items-center
                                  gap-1
                                  rounded-full
                                  border
                                  border-white/20
                                  bg-black/35
                                  px-2
                                  sm:px-2.5
                                  py-1
                                  sm:py-1.5
                                  text-[7px]
                                  sm:text-[9px]
                                  font-black
                                  text-white
                                  backdrop-blur-xl
                                "
                              >
                                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />

                                {product.rating ||
                                  4.9}
                              </div>
                            </div>

                            <div className="min-w-0 p-2.5 sm:p-3.5 lg:p-4">
                              <h4 className="break-words text-[10px] sm:text-xs md:text-sm font-black leading-5">
                                {product.title}
                              </h4>

                              <p className="mt-1 break-words text-[7px] sm:text-[9px] md:text-[10px] leading-4 text-[#8A796B] dark:text-[#A7988C]">
                                {product.sellerName ||
                                  'حرفي من الصعيد'}
                              </p>

                              <div className="mt-2.5 sm:mt-3 flex min-w-0 flex-col xs:flex-row sm:flex-row items-stretch sm:items-center justify-between gap-2">
                                <span className="min-w-0 break-words text-[10px] sm:text-xs md:text-sm lg:text-base font-black text-[#B24C2B]">
                                  {product.price} ج.م
                                </span>

                                <button
                                  id={`btn-add-atlas-cart-${product.id}`}
                                  type="button"
                                  onClick={() =>
                                    handleAddProduct(
                                      product
                                    )
                                  }
                                  className={`
                                    flex
                                    min-h-8
                                    sm:min-h-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    gap-1
                                    rounded-lg
                                    sm:rounded-xl
                                    px-2
                                    sm:px-3
                                    text-[7px]
                                    sm:text-[9px]
                                    font-black
                                    text-white
                                    shadow-sm
                                    transition-all
                                    ${added
                                      ? 'bg-emerald-600'
                                      : 'bg-[#211A16] hover:bg-[#B24C2B]'
                                    }
                                  `}
                                >
                                  {added ? (
                                    <>
                                      <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />

                                      <span>
                                        تم
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />

                                      <span>
                                        أضف
                                      </span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <EmptyState
                    icon={<ShoppingBag />}
                    title="السوق بيتجهز"
                    description={`منتجات ${selectedGov.name} هتظهر هنا أول ما يتم توثيقها.`}
                  />
                )}
              </div>
            )}

            {/* =================================================
                FOODS
            ================================================= */}

            {activeTab === 'foods' && (
              <div>
                <DossierHeading
                  eyebrow="TASTE OF UPPER EGYPT"
                  title={`سفرة ${selectedGov.name}`}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    {
                      emoji: '🍞',
                      title: 'العيش الشمسي',
                      text: 'من أشهر تفاصيل البيت الصعيدي، بطعم ورائحة مرتبطة بالخبز البلدي التقليدي.',
                    },

                    {
                      emoji: '🍯',
                      title: 'العسل والفطير',
                      text: 'تفاصيل بسيطة من السفرة المصرية الأصيلة، مرتبطة بالضيافة واللمة.',
                    },

                    {
                      emoji: '🥣',
                      title: 'الكشك الصعيدي',
                      text: 'وصفة تقليدية تعتمد على القمح واللبن وتحضر بطرق مختلفة من بيت لبيت.',
                    },

                    {
                      emoji: '🌿',
                      title: 'الأكل البلدي',
                      text: 'الملوخية والأكلات الريفية جزء من ذاكرة السفرة في محافظات الصعيد.',
                    },
                  ].map((food) => (
                    <article
                      key={food.title}
                      className="
                        rounded-[22px]
                        sm:rounded-[26px]
                        border
                        border-white/80
                        dark:border-white/10
                        bg-white/45
                        dark:bg-white/[0.035]
                        p-4
                        sm:p-5
                        md:p-6
                        shadow-lg
                        backdrop-blur-xl
                        transition-all
                        hover:bg-white/65
                        dark:hover:bg-white/[0.055]
                      "
                    >
                      <div className="flex gap-3 sm:gap-4">
                        <div
                          className="
                            flex
                            h-11
                            w-11
                            sm:h-12
                            sm:w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            sm:rounded-2xl
                            border
                            border-white/70
                            dark:border-white/10
                            bg-white/60
                            dark:bg-white/[0.05]
                            text-xl
                            sm:text-2xl
                          "
                        >
                          {food.emoji}
                        </div>

                        <div className="min-w-0">
                          <h4 className="break-words text-sm sm:text-base font-black">
                            {food.title}
                          </h4>

                          <p className="mt-1.5 sm:mt-2 break-words text-[10px] sm:text-xs md:text-sm leading-6 sm:leading-7 text-[#75665A] dark:text-[#B2A398]">
                            {food.text}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* =================================================
                FOLKLORE
            ================================================= */}

            {activeTab === 'folklore' && (
              <div>
                <DossierHeading
                  eyebrow="ORAL HISTORY"
                  title={`حكايات من ${selectedGov.name}`}
                />

                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-[24px]
                    sm:rounded-[32px]
                    border
                    border-white/10
                    bg-[#241B16]
                    px-5
                    sm:px-8
                    md:px-10
                    py-12
                    sm:py-14
                    md:py-16
                    text-center
                    shadow-xl
                  "
                >
                  <div className="absolute -right-20 -top-20 h-56 w-56 sm:h-64 sm:w-64 rounded-full border-[28px] sm:border-[35px] border-white/[0.035]" />

                  <div className="absolute -left-20 -bottom-20 h-56 w-56 sm:h-64 sm:w-64 rounded-full border-[28px] sm:border-[35px] border-[#B24C2B]/10" />

                  <div className="relative">
                    <div className="text-[8px] sm:text-[9px] font-black tracking-[0.2em] text-[#E88E72]">
                      A VOICE FROM UPPER EGYPT
                    </div>

                    <blockquote
                      className="
                        mx-auto
                        mt-4
                        sm:mt-5
                        max-w-4xl
                        break-words
                        font-serif
                        font-black
                        leading-relaxed
                        text-xl
                        sm:text-2xl
                        md:text-4xl
                        lg:text-5xl
                        text-white
                      "
                    >
                      «{currentEmblem.proverb}»
                    </blockquote>
                  </div>
                </div>

                <div
                  className="
                    mt-4
                    sm:mt-5
                    rounded-[22px]
                    sm:rounded-[26px]
                    border
                    border-white/80
                    dark:border-white/10
                    bg-white/45
                    dark:bg-white/[0.035]
                    p-4
                    sm:p-6
                    md:p-8
                    shadow-lg
                    backdrop-blur-xl
                  "
                >
                  <p className="break-words text-xs sm:text-sm md:text-lg leading-8 sm:leading-9 text-[#6E6055] dark:text-[#B6A79B]">
                    {currentEmblem.folklore}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            NEXT JOURNEY
        ================================================= */}

        <section
          className="
            mt-6
            sm:mt-8
            md:mt-10
            relative
            overflow-hidden
            rounded-[26px]
            sm:rounded-[34px]
            lg:rounded-[42px]
            border
            border-white/20
            bg-[#B24C2B]
            text-white
            shadow-[0_30px_90px_rgba(178,76,43,.20)]
          "
        >
          <div className="absolute -left-24 -bottom-24 h-72 w-72 sm:h-80 sm:w-80 rounded-full border-[30px] sm:border-[35px] border-white/[0.06]" />

          <div className="absolute right-1/2 top-[-100px] h-56 w-56 sm:h-64 sm:w-64 rounded-full bg-white/[0.05] blur-3xl" />

          <div
            className="
              relative
              grid
              grid-cols-1
              lg:grid-cols-[1fr_auto]
              gap-6
              sm:gap-8
              items-center
              p-5
              sm:p-7
              md:p-10
              lg:p-14
            "
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[8px] sm:text-[9px] font-black tracking-[0.2em] text-white/65">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                KEEP EXPLORING
              </div>

              <h3 className="mt-2 break-words font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black">
                الرحلة لسه طويلة.
              </h3>

              <p className="mt-2 sm:mt-3 max-w-2xl break-words text-[10px] sm:text-xs md:text-sm leading-7 text-white/70">
                خلّي محطتك الجاية محافظة تانية واكتشف وش جديد
                للصعيد.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-2.5">
              <button
                type="button"
                onClick={nextGovernorate}
                className="
                  group
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-white
                  px-5
                  sm:px-6
                  py-3.5
                  text-[10px]
                  sm:text-xs
                  font-black
                  whitespace-nowrap
                  text-[#B24C2B]
                  shadow-lg
                  transition-all
                  hover:-translate-y-0.5
                "
              >
                المحافظة التالية

                <ChevronLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
              </button>

              <button
                id="btn-open-market-gov"
                type="button"
                onClick={() =>
                  setActivePage('products')
                }
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-white/20
                  bg-white/10
                  px-5
                  sm:px-6
                  py-3.5
                  text-[10px]
                  sm:text-xs
                  font-black
                  whitespace-nowrap
                  text-white
                  backdrop-blur-xl
                  transition-all
                  hover:bg-white/15
                "
              >
                <ShoppingBag className="h-4 w-4 shrink-0" />

                سوق الصعيد
              </button>
            </div>
          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="py-8 sm:py-10 md:py-12 text-center">
          <div className="mx-auto flex w-full max-w-md items-center gap-3 px-5">
            <span className="h-px flex-1 bg-[#DDD4CA] dark:bg-white/10" />

            <div
              className="
                flex
                h-8
                w-8
                sm:h-9
                sm:w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-white/70
                dark:border-white/10
                bg-white/45
                dark:bg-white/[0.04]
                backdrop-blur-xl
              "
            >
              <img
                src={LOGO_URL}
                alt="وه"
                className="h-5 w-5 sm:h-6 sm:w-6 object-contain opacity-70"
              />
            </div>

            <span className="h-px flex-1 bg-[#DDD4CA] dark:bg-white/10" />
          </div>

          <p className="mt-3 sm:mt-4 px-4 break-words text-[8px] sm:text-[9px] md:text-[10px] font-black tracking-[0.12em] text-[#958477] dark:text-[#766960]">
            وَه · حكايات الصعيد من المكان للإنسان
          </p>
        </footer>
      </main>
    </div>
  );
};

/* =========================================================
   DOSSIER HEADING
========================================================= */

const DossierHeading: React.FC<{
  eyebrow: string;
  title: string;
}> = ({ eyebrow, title }) => {
  return (
    <div className="mb-5 sm:mb-7">
      <div className="text-[8px] sm:text-[9px] md:text-[10px] font-black tracking-[0.2em] text-[#B24C2B]">
        {eyebrow}
      </div>

      <h3 className="mt-1.5 sm:mt-2 max-w-3xl break-words font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight">
        {title}
      </h3>
    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div
      className="
        rounded-[22px]
        sm:rounded-[28px]
        border
        border-white/80
        dark:border-white/10
        bg-white/45
        dark:bg-white/[0.035]
        py-14
        sm:py-16
        px-5
        text-center
        shadow-lg
        backdrop-blur-xl
      "
    >
      <div
        className="
          mx-auto
          flex
          h-12
          w-12
          sm:h-14
          sm:w-14
          items-center
          justify-center
          rounded-xl
          sm:rounded-2xl
          border
          border-white/70
          dark:border-white/10
          bg-white/60
          dark:bg-white/[0.05]
          text-[#B24C2B]
        "
      >
        {React.isValidElement(icon)
          ? React.cloneElement(
            icon as React.ReactElement<{
              className?: string;
            }>,
            {
              className:
                'h-5 w-5 sm:h-6 sm:w-6',
            }
          )
          : icon}
      </div>

      <h4 className="mt-4 break-words text-base sm:text-lg font-black">
        {title}
      </h4>

      <p className="mx-auto mt-2 max-w-md break-words text-[10px] sm:text-xs md:text-sm leading-7 text-[#817267] dark:text-[#AA9B8E]">
        {description}
      </p>
    </div>
  );
};

export default UpperEgyptMapPage;