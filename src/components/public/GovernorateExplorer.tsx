import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Governorate } from '../../types';
import {
  MapPin,
  Compass,
  ArrowUpLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  ShoppingBag,
  Landmark,
  X,
  LayoutGrid,
  Route,
  Sparkles,
  Users,
  PackageCheck,
  Flame,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NubianGeometricPattern } from '../common/NubianGeometricPattern';

export interface GovernorateExplorerItem {
  name: Governorate;
  slug: string;
  region: 'شمال الصعيد' | 'وسط الصعيد' | 'جنوب الصعيد' | 'الواحات والصحراء';
  capitalCity: string;
  famousCraft: string;
  famousItem: string;
  tags: string[];
  coverImage: string;
  folkloreProverb: string;
  shortIntro: string;
  nileOrder: number;
}

export const UPPER_EGYPT_GOVERNORATES: GovernorateExplorerItem[] = [
  {
    name: 'بني سويف',
    slug: 'beni-suef',
    region: 'شمال الصعيد',
    capitalCity: 'مدينة بني سويف',
    famousCraft: 'النباتات العطرية والطبية وفخار ميدوم',
    famousItem: 'زيوت عطرية، شيح ونعناع بلدي، وفايش صعيدي بالحليب',
    tags: ['نباتات طبية', 'فايش صعيدي', 'زيوت بابونج', 'فخار ميدوم'],
    coverImage: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788699005/WAH/provinces/beni-suef/cover.jpg',
    folkloreProverb: '«أول خطوة في الصعيد سلام، ومن يدخلها يلقى الإكرام»',
    shortIntro: 'بوابة صعيد مصر الشمالية وحاضنة هرم ميدوم العريق، رائدة زراعة وتقطير النباتات الطبية والعطرية وصناعة الفايش الصعيدي.',
    nileOrder: 1
  },
  {
    name: 'المنيا',
    slug: 'minya',
    region: 'وسط الصعيد',
    capitalCity: 'مدينة المنيا',
    famousCraft: 'عسل السدر الجبلي والزراعة العضوية النظيفة',
    famousItem: 'عسل جبلي نقي، زيت سمسم معصور على البارد، وأعشاب برية',
    tags: ['عسل سدر جبلي', 'زيت سمسم بلدي', 'أعشاب عطرية', 'دبس رمان'],
    coverImage: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015793/WAH/provinces/minya/cover.jpg',
    folkloreProverb: '«عروس الصعيد النيل في حضنها، والنخل عالي في سماها»',
    shortIntro: 'عروس الصعيد وأرض التوحيد في تل العمارنة، تشتهر بإنتاج أجود أنواع عسل النحل الجبلي ومحاصيل الزراعة العضوية.',
    nileOrder: 2
  },
  {
    name: 'أسيوط',
    slug: 'asyut',
    region: 'وسط الصعيد',
    capitalCity: 'مدينة أسيوط',
    famousCraft: 'فن التلي الأسيوطي الرفيع وخيوط الفضة',
    famousItem: 'شيلان وجلاليب التلي المطرزة بالفضة الخالصة، وطواجن الفخار',
    tags: ['تلي أسيوط', 'فضة خالصة', 'تطريز يدوي', 'طواجن صعيدية'],
    coverImage: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015789/WAH/provinces/asyut/cover.jpg',
    folkloreProverb: '«التلي مش بس خيط فضة، دي حكاية فرح وزفة عروسة»',
    shortIntro: 'قلب الصعيد النابض وعاصمة درب الأربعين، موطن فن التلي النادر الذي يُحاك يدوياً بشرائط الفضة الخالصة.',
    nileOrder: 3
  },
  {
    name: 'سوهاج',
    slug: 'sohag',
    region: 'وسط الصعيد',
    capitalCity: 'مدينة سوهاج',
    famousCraft: 'أنوال أخميم التراثية والنسيج اليدوي الأصيل',
    famousItem: 'كليم الصوف والحرير الطبيعي، مفارش أخميم، وعسل الموالح',
    tags: ['كليم أخميم', 'حرير طبيعي', 'نسيج يدوي', 'مفارش قطنية'],
    coverImage: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015790/WAH/provinces/sohag/cover.jpg',
    folkloreProverb: '«نول أخميم يغزل حرير وصوف، وكرم أهلها بالعين موصوف»',
    shortIntro: 'مدينة النسيج التاريخية ومهد الملوك، تشتهر بأنوال كليم أخميم الحريري ومعبد أبيدوس المقدس.',
    nileOrder: 4
  },
  {
    name: 'قنا',
    slug: 'qena',
    region: 'جنوب الصعيد',
    capitalCity: 'مدينة قنا',
    famousCraft: 'الفخار الصعيدي وأنوال الفركة بنقادة',
    famousItem: 'قلال قنا الفخارية، شيلان الفركة الحريرية، وعسل القصب الأسود',
    tags: ['قلال قنا', 'فركة نقادة', 'طواجن فخار', 'عسل قصب'],
    coverImage: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015791/WAH/provinces/qena/cover.jpg',
    folkloreProverb: '«من شرب من قلال قنا، لا بد يعود لبلادنا»',
    shortIntro: 'أرض ثنية النيل الكبرى ومعبد دندرة، قلعة صناعة قلال الفخار المسامية الشهيرة وأنوال الفركة التراثية بمركز نقادة.',
    nileOrder: 5
  },
  {
    name: 'الأقصر',
    slug: 'luxor',
    region: 'جنوب الصعيد',
    capitalCity: 'مدينة الأقصر',
    famousCraft: 'نحت الألاباستر والنحاسيات والخشب التراثي',
    famousItem: 'تماثيل الألباستر اليدوية، صواني النحاس المزخرفة، وأواني خشب السرسوع',
    tags: ['ألاباستر القرنة', 'نحاس منقوش', 'خشب سرسوع', 'برديات'],
    coverImage: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015791/WAH/provinces/luxor/cover.jpg',
    folkloreProverb: '«طيبة بلد التاريخ والنور، من يزورها قلبه مسرور»',
    shortIntro: 'طيبة عاصمة العالم القديم، تضم ثلث آثار الإنسانية وورش نحت حجر الألاباستر بالبر الغربي والنحاس المطروق.',
    nileOrder: 6
  },
  {
    name: 'أسوان',
    slug: 'aswan',
    region: 'جنوب الصعيد',
    capitalCity: 'مدينة أسوان',
    famousCraft: 'خيرات النوبة والخوص والمشغولات اليدوية',
    famousItem: 'تمور المجدول، كركديه أسوان، عطور وبخور، وسلال الخوص النوبية',
    tags: ['تمور مجدول', 'كركديه نوبي', 'سلال خوص', 'بخور صندل'],
    coverImage: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015791/WAH/provinces/aswan/cover.jpg',
    folkloreProverb: '«في أسوان السلام في القلوب قبل البيوت، والنيل فيها ما يفوت»',
    shortIntro: 'درة النيل الجنوبية وموطن الحضارة النوبية العريقة، تشتهر ببيوتها الملونة وأسواق التوابل والمشغولات الخوصية.',
    nileOrder: 7
  },
  {
    name: 'الوادي الجديد',
    slug: 'new-valley',
    region: 'الواحات والصحراء',
    capitalCity: 'مدينة الخارجة',
    famousCraft: 'تمور الواحات وخوص النخيل وزيت الزيتون',
    famousItem: 'بلح صعيدي، عجوة الواحات، زيت زيتون بكر، وسلال الجريد',
    tags: ['تمور صعيدية', 'زيت زيتون بكر', 'سلال خوص ونخيل', 'دبس تمر'],
    coverImage: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788698700/WAH/provinces/new-valley/cover.jpg',
    folkloreProverb: '«نخلة الواحات أصلها ثابت في الأرض، وخيرها يفيض على الكل»',
    shortIntro: 'واحات النخيل والكنوز البكر، مهد أجود أصناف التمور الصعيدية وزيت الزيتون المعصور على البارد.',
    nileOrder: 8
  }
];

const REGION_OPTIONS = [
  { id: 'all', label: 'كافة الأقاليم' },
  { id: 'شمال الصعيد', label: 'شمال الصعيد' },
  { id: 'وسط الصعيد', label: 'وسط الصعيد' },
  { id: 'جنوب الصعيد', label: 'جنوب الصعيد' },
  { id: 'الواحات والصحراء', label: 'الواحات والصحراء' }
];

export const GovernorateExplorer: React.FC = () => {
  const {
    sellers,
    products,
    setSelectedGovernorateFilter,
    navigateToGovernorate,
    setActivePage
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'river'>('grid');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewGov, setPreviewGov] = useState<GovernorateExplorerItem | null>(null);

  const riverScrollRef = useRef<HTMLDivElement>(null);

  const handleScrollRiver = (direction: 'next' | 'prev') => {
    if (!riverScrollRef.current) return;
    const scrollAmount = 360;
    riverScrollRef.current.scrollBy({
      left: direction === 'next' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const filteredGovernorates = useMemo(() => {
    return UPPER_EGYPT_GOVERNORATES.filter((gov) => {
      const matchesRegion = selectedRegion === 'all' || gov.region === selectedRegion;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        gov.name.toLowerCase().includes(q) ||
        gov.capitalCity.toLowerCase().includes(q) ||
        gov.famousCraft.toLowerCase().includes(q) ||
        gov.famousItem.toLowerCase().includes(q) ||
        gov.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchesRegion && matchesSearch;
    });
  }, [selectedRegion, searchQuery]);

  const totalSellers = useMemo(() => {
    return sellers.filter((s) => s.status !== 'rejected' && s.status !== 'suspended').length;
  }, [sellers]);

  const totalProducts = useMemo(() => {
    return products.filter((p) => p.approvalStatus === 'approved').length;
  }, [products]);

  const handleShopGovernorate = (govName: Governorate) => {
    setSelectedGovernorateFilter(govName);
    setActivePage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenGovernorateDossier = (slug: string) => {
    navigateToGovernorate(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative my-8 sm:my-14 max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-8 select-none">
      
      {/* Background Atmosphere Lights */}
      <div className="absolute -top-10 right-10 w-96 h-96 bg-[#C85A32]/10 dark:bg-[#C85A32]/15 rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#D48238]/10 dark:bg-[#D48238]/15 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Main Glass Shell */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-b from-[#FAF7F2]/90 to-[#F3ECE0]/80 dark:from-[#17120F]/90 dark:to-[#110D0B]/90 backdrop-blur-2xl border border-[#E5DACD] dark:border-[#2C221B] shadow-2xl p-4 sm:p-8 lg:p-10">

        {/* HERO BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-[#1A130F] text-[#FDFBF7] p-6 sm:p-10 lg:p-12 mb-8 border border-[#3A2D23] shadow-xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <NubianGeometricPattern variant="tapestry" scale={1.3} opacity={0.3} color="#E59966" />
          </div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-gradient-to-tr from-[#C85A32]/35 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2C1F18] border border-[#4E372A] text-[#E59966] text-xs font-black tracking-wide mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#E59966]" />
                <span>حكايات الحرفة وأصالة النيل</span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heritage leading-tight sm:leading-none text-white">
                الصعيد.. <br className="hidden sm:inline" />
                <span className="bg-gradient-to-l from-[#FAF4EC] via-[#E59966] to-[#C85A32] bg-clip-text text-transparent">
                  حكاية ورا كل حاجة.
                </span>
              </h2>

              <p className="mt-4 text-xs sm:text-sm lg:text-base text-[#B8A697] leading-relaxed max-w-xl">
                من بني سويف لأسوان، اكتشف كل محافظة عبر تراثها، حِرفها اليدوية النادرة، ناسها المخلصين وطواجنها الأصيلة.
              </p>

              {/* Stats Counters Ribbon */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-6 border-t border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#C85A32]/20 flex items-center justify-center text-[#E59966]">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-black text-white text-sm">8 محافظات</span>
                    <span className="text-stone-400 text-[11px]">مراكز الحرف التقليدية</span>
                  </div>
                </div>

                <div className="w-px h-8 bg-white/10 hidden sm:block" />

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#C85A32]/20 flex items-center justify-center text-[#E59966]">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-black text-white text-sm">+{totalSellers || '120'} صانع</span>
                    <span className="text-stone-400 text-[11px]">حرفيون وشيوخ مهنة</span>
                  </div>
                </div>

                <div className="w-px h-8 bg-white/10 hidden sm:block" />

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#C85A32]/20 flex items-center justify-center text-[#E59966]">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-black text-white text-sm">+{totalProducts || '450'} منتج</span>
                    <span className="text-stone-400 text-[11px]">تراثي يدوي أصلي</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Map & Dossier Triggers */}
            <div className="flex flex-row sm:flex-col lg:flex-row gap-3 w-full lg:w-auto shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActivePage('map');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2.5 h-12 px-6 rounded-xl bg-[#C85A32] hover:bg-[#B24622] text-white text-xs sm:text-sm font-black shadow-lg shadow-[#C85A32]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>الخريطة الحية</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivePage('governorates');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-black border border-white/15 backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                <Landmark className="w-4 h-4 text-[#E59966]" />
                <span>الموسوعة الشاملة</span>
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH & CONTROLS */}
        <div className="space-y-4 mb-7">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#948173] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالحرفة (تلي، فخار، كليم...) أو اسم المحافظة..."
                className="w-full h-12 pr-11 pl-11 rounded-2xl bg-white dark:bg-[#1A1411] text-xs sm:text-sm text-[#241E1A] dark:text-[#FAF6F0] placeholder:text-[#A09083] border border-[#E5DCD1] dark:border-[#352920] focus:border-[#C85A32] dark:focus:border-[#E59966] focus:ring-4 focus:ring-[#C85A32]/10 outline-none transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between md:justify-end gap-3">
              <span className="text-xs font-bold text-[#8A776A] dark:text-[#9F8F82]">
                {filteredGovernorates.length} مواطن صعيدية
              </span>

              <div className="flex items-center p-1 bg-[#ECE3D6] dark:bg-[#1E1713] rounded-2xl border border-[#DFD3C2] dark:border-[#35271E]">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-[#2C211A] text-[#C85A32] dark:text-[#E59966] shadow-sm'
                      : 'text-[#706053] dark:text-[#9E8E81] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>معرض البطاقات</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('river')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    viewMode === 'river'
                      ? 'bg-white dark:bg-[#2C211A] text-[#C85A32] dark:text-[#E59966] shadow-sm'
                      : 'text-[#706053] dark:text-[#9E8E81] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Route className="w-3.5 h-3.5" />
                  <span>مسار النيل</span>
                </button>
              </div>
            </div>

          </div>

          {/* Region Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {REGION_OPTIONS.map((opt) => {
              const active = selectedRegion === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedRegion(opt.id)}
                  className={`h-9 px-4 rounded-xl text-xs font-black whitespace-nowrap transition-all border cursor-pointer ${
                    active
                      ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-sm'
                      : 'bg-white/80 dark:bg-[#1A1411] text-[#716155] dark:text-[#B3A497] border-[#E8DFC5] dark:border-[#35281F] hover:border-[#C85A32]/60'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIVER VIEW (Timeline Route) */}
        {viewMode === 'river' && (
          <div className="relative mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#C85A32]/10 flex items-center justify-center text-[#C85A32] dark:text-[#E59966]">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#261E19] dark:text-[#FAF6F0]">درب النيل من الشمال إلى الجنوب</h3>
                  <p className="text-[11px] text-[#8C7A6B]">مرتبة جغرافياً وفق تدفق شريان الحياة</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleScrollRiver('prev')}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-[#1E1713] border border-[#E5DCD1] dark:border-[#352920] text-stone-700 dark:text-stone-300 hover:bg-stone-100 transition-all cursor-pointer shadow-sm active:scale-95"
                  aria-label="السابق"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScrollRiver('next')}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-[#1E1713] border border-[#E5DCD1] dark:border-[#352920] text-stone-700 dark:text-stone-300 hover:bg-stone-100 transition-all cursor-pointer shadow-sm active:scale-95"
                  aria-label="التالي"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={riverScrollRef}
              className="flex items-stretch gap-5 overflow-x-auto no-scrollbar py-3 px-1 snap-x snap-mandatory touch-pan-x"
            >
              {filteredGovernorates.map((gov) => (
                <div key={gov.slug} className="w-[300px] sm:w-[340px] shrink-0 snap-start">
                  <InteractiveGovernorateCard
                    gov={gov}
                    sellers={sellers}
                    products={products}
                    onPreview={setPreviewGov}
                    onShop={handleShopGovernorate}
                    onExplore={handleOpenGovernorateDossier}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GRID VIEW */}
        {viewMode === 'grid' && (
          <div>
            {filteredGovernorates.length === 0 ? (
              <div className="text-center py-20 px-4 bg-white/40 dark:bg-[#1A1411]/40 rounded-3xl border border-dashed border-[#DFD3C2] dark:border-[#35271E]">
                <Compass className="w-10 h-10 mx-auto text-[#C85A32] opacity-50 mb-3" />
                <h3 className="text-base font-black text-[#261E19] dark:text-[#FAF6F0]">لا توجد محافظة مطابقة</h3>
                <p className="text-xs text-[#8C7A6B] mt-1 max-w-xs mx-auto">تأكد من كتابة الاسم بصورة صحيحة أو ابحث بأسماء الحرف كـ "التلي" أو "الفخار".</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedRegion('all');
                  }}
                  className="mt-4 px-5 py-2 rounded-xl bg-[#C85A32] text-white text-xs font-black cursor-pointer shadow-sm"
                >
                  عرض كافة المحافظات
                </button>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
              >
                <AnimatePresence>
                  {filteredGovernorates.map((gov) => (
                    <motion.div
                      layout
                      key={gov.slug}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25 }}
                    >
                      <InteractiveGovernorateCard
                        gov={gov}
                        sellers={sellers}
                        products={products}
                        onPreview={setPreviewGov}
                        onShop={handleShopGovernorate}
                        onExplore={handleOpenGovernorateDossier}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        )}

      </div>

      {/* QUICK VIEW POPUP MODAL */}
      <AnimatePresence>
        {previewGov && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md"
            onClick={() => setPreviewGov(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[92vh] bg-[#FAF7F2] dark:bg-[#18120F] rounded-[2rem] overflow-hidden shadow-2xl border border-[#E5DACD] dark:border-[#382B22] flex flex-col"
            >
              {/* Cover Header */}
              <div className="relative h-60 sm:h-72 shrink-0 overflow-hidden bg-stone-900">
                <img
                  src={previewGov.coverImage}
                  alt={previewGov.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#18120F] via-[#18120F]/45 to-transparent" />

                <button
                  type="button"
                  onClick={() => setPreviewGov(null)}
                  className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 hover:bg-[#C85A32] text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="absolute bottom-5 right-6 left-6 text-white">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#C85A32] text-white text-[11px] font-black tracking-wide mb-2">
                    {previewGov.region} • المحطة النيلية 0{previewGov.nileOrder}
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black font-heritage">
                    محافظة {previewGov.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 mt-0.5">
                    عاصمتها {previewGov.capitalCity}
                  </p>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
                {previewGov.folkloreProverb && (
                  <div className="p-4 rounded-2xl bg-[#C85A32]/10 border-r-4 border-[#C85A32] text-[#C85A32] dark:text-[#E59966]">
                    <span className="text-[10px] font-black uppercase tracking-widest block mb-1 opacity-70">لسان أهل البلد:</span>
                    <p className="text-sm sm:text-base font-bold font-heritage leading-relaxed">
                      {previewGov.folkloreProverb}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-black text-[#8C7A6B] uppercase tracking-wider mb-1.5">حكاية المحافظة</h4>
                  <p className="text-xs sm:text-sm text-[#504237] dark:text-[#CFC0B2] leading-relaxed">
                    {previewGov.shortIntro}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#F0E8DC] dark:bg-[#231A15] border border-[#E0D3C3] dark:border-[#38291F]">
                    <span className="text-[11px] text-[#8C7A6B] block mb-0.5 font-bold">أشهر الحرف المتوارثة</span>
                    <span className="text-sm font-black text-[#C85A32] dark:text-[#E59966]">
                      {previewGov.famousCraft}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F0E8DC] dark:bg-[#231A15] border border-[#E0D3C3] dark:border-[#38291F]">
                    <span className="text-[11px] text-[#8C7A6B] block mb-0.5 font-bold">أبرز خيراتها ومنتجاتها</span>
                    <span className="text-sm font-black text-[#261E19] dark:text-[#FAF6F0]">
                      {previewGov.famousItem}
                    </span>
                  </div>
                </div>

                {previewGov.tags?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-[#8C7A6B] uppercase tracking-wider mb-2">المعالم والبصمات</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {previewGov.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-xl bg-white dark:bg-[#251C17] text-[#69584C] dark:text-[#D1C2B4] text-xs font-bold border border-[#E2D6C6] dark:border-[#3B2B20]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-4 sm:p-5 bg-[#F0E8DC] dark:bg-[#140E0C] border-t border-[#E2D5C5] dark:border-[#30231A] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const slug = previewGov.slug;
                    setPreviewGov(null);
                    handleOpenGovernorateDossier(slug);
                  }}
                  className="px-4.5 py-2.5 rounded-xl bg-white dark:bg-[#241A14] hover:bg-stone-50 dark:hover:bg-[#2D211A] text-[#241E1A] dark:text-[#FAF6F0] text-xs sm:text-sm font-black border border-[#DECFC0] dark:border-[#38291F] cursor-pointer"
                >
                  دليل المحافظة
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const name = previewGov.name;
                    setPreviewGov(null);
                    handleShopGovernorate(name);
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B24622] text-white text-xs sm:text-sm font-black shadow-md cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>تسوّق خيرات {previewGov.name}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

/* =========================================================================
   SUB-COMPONENT: INTERACTIVE HIGH-END CARD (WITH MOUSE LIGHT)
   ========================================================================= */

interface InteractiveCardProps {
  gov: GovernorateExplorerItem;
  sellers: any[];
  products: any[];
  onPreview: (gov: GovernorateExplorerItem) => void;
  onShop: (name: Governorate) => void;
  onExplore: (slug: string) => void;
}

const InteractiveGovernorateCard: React.FC<InteractiveCardProps> = ({
  gov,
  sellers,
  products,
  onPreview,
  onShop,
  onExplore
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const govSellersCount = sellers.filter(
    (s) => s.governorate === gov.name && s.status !== 'rejected' && s.status !== 'suspended'
  ).length;

  const govProductsCount = products.filter(
    (p) =>
      (p.sellerGovernorate === gov.name || p.specifications?.originGovernorate === gov.name) &&
      p.approvalStatus === 'approved'
  ).length;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className="group relative flex flex-col h-[470px] rounded-3xl overflow-hidden bg-[#1C1410] border border-[#3A2D23] hover:border-[#C85A32]/70 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 cursor-default"
    >
      {/* Interactive Spotlight Cursor Highlight */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
        style={{
          background: isHovered
            ? `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(200, 90, 50, 0.22), transparent 70%)`
            : ''
        }}
      />

      {/* Cover Image */}
      <img
        src={gov.coverImage}
        alt={gov.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        loading="lazy"
      />

      {/* Multi-stage High-Contrast Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#140E0C] via-[#140E0C]/65 to-[#140E0C]/15" />
      <div className="absolute inset-0 bg-[#C85A32]/5 mix-blend-color" />

      {/* Top Meta Header */}
      <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white text-[11px] font-black">
          <MapPin className="w-3 h-3 text-[#E59966]" />
          <span>{gov.region}</span>
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreview(gov);
          }}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-black/45 hover:bg-[#C85A32] backdrop-blur-md border border-white/20 text-white transition-all cursor-pointer active:scale-90"
          title="نظرة سريعة"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Narrative Bottom Card Body */}
      <div className="relative z-10 mt-auto p-4 sm:p-5 flex flex-col">
        
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-black text-[#E59966] uppercase tracking-widest">
            المحطة 0{gov.nileOrder}
          </span>
          <div className="h-px flex-1 bg-white/20" />
        </div>

        <h3 className="text-2xl sm:text-3xl font-black font-heritage text-white leading-tight mb-1">
          {gov.name}
        </h3>

        <p className="text-xs font-bold text-[#F3C5A5] line-clamp-1 mb-2">
          {gov.famousCraft}
        </p>

        <p className="text-[11px] text-stone-300 leading-relaxed line-clamp-2 mb-3 font-medium">
          {gov.shortIntro}
        </p>

        {/* Dynamic Badges */}
        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white text-[11px] mb-3.5">
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 text-[#E59966]" />
            <span className="font-bold">{govSellersCount > 0 ? `${govSellersCount} صانع` : 'شيوخ مهنة'}</span>
          </div>
          <div className="w-px h-3 bg-white/20" />
          <div className="flex items-center gap-1.5">
            <PackageCheck className="w-3 h-3 text-[#E59966]" />
            <span className="font-bold">{govProductsCount} قطعة أصلية</span>
          </div>
        </div>

        {/* Buttons Action Grid */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onShop(gov.name)}
            className="h-10 rounded-xl bg-white hover:bg-[#F0E9DF] text-[#1F1713] text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>تسوق</span>
          </button>

          <button
            type="button"
            onClick={() => onExplore(gov.slug)}
            className="h-10 rounded-xl bg-white/15 hover:bg-[#C85A32] text-white text-xs font-black inline-flex items-center justify-center gap-1 backdrop-blur-md border border-white/20 hover:border-transparent transition-all cursor-pointer active:scale-95"
          >
            <span>الحكاية</span>
            <ArrowUpLeft className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};