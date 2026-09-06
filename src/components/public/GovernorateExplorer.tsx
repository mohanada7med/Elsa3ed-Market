import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Governorate } from '../../types';
import {
  MapPin,
  Sparkles,
  Compass,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  ShoppingBag,
  Landmark,
  X,
  ExternalLink,
  Store,
  Layers,
  Ship
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NubianGeometricPattern } from '../common/NubianGeometricPattern';

export interface GovernorateExplorerItem {
  name: Governorate;
  slug: string;
  symbol: string;
  region: 'شمال الصعيد' | 'وسط الصعيد' | 'جنوب الصعيد' | 'الواحات والصحراء';
  capitalCity: string;
  famousCraft: string;
  famousItem: string;
  tags: string[];
  coverImage: string;
  folkloreProverb: string;
  shortIntro: string;
  nileOrder: number; // 1 = Northernmost, 8 = Southernmost
}

export const UPPER_EGYPT_GOVERNORATES: GovernorateExplorerItem[] = [
  {
    name: 'بني سويف',
    slug: 'beni-suef',
    symbol: '🗿',
    region: 'شمال الصعيد',
    capitalCity: 'مدينة بني سويف',
    famousCraft: 'النباتات العطرية والطبية وفخار ميدوم',
    famousItem: 'زيوت عطرية، شيح ونعناع بلدي، وفايش صعيدي بالحليب',
    tags: ['نباتات طبية', 'فايش صعيدي', 'زيوت بابونج', 'فخار ميدوم'],
    coverImage: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015793/%D8%A8%D9%86%D9%8A-%D8%B3%D9%88%D9%8A%D9%81.jpg',
    folkloreProverb: '«أول خطوة في الصعيد سلام، ومن يدخلها يلقى الإكرام»',
    shortIntro: 'بوابة صعيد مصر الشمالية وحاضنة هرم ميدوم العريق، رائدة زراعة وتقطير النباتات الطبية والعطرية وصناعة الفايش الصعيدي.',
    nileOrder: 1
  },
  {
    name: 'المنيا',
    slug: 'minya',
    symbol: '📜',
    region: 'وسط الصعيد',
    capitalCity: 'مدينة المنيا',
    famousCraft: 'عسل السدر الجبلي والزراعة العضوية النظيفة',
    famousItem: 'عسل جبلي نقي، زيت سمسم معصور على البارد، وأعشاب برية',
    tags: ['عسل سدر جبلي', 'زيت سمسم بلدي', 'أعشاب عطرية', 'دبس رمان'],
    coverImage: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015793/%D8%A7%D9%84%D9%85%D9%86%D9%8A%D8%A7.jpg',
    folkloreProverb: '«عروس الصعيد النيل في حضنها، والنخل عالي في سماها»',
    shortIntro: 'عروس الصعيد وأرض التوحيد في تل العمارنة، تشتهر بإنتاج أجود أنواع عسل النحل الجبلي ومحاصيل الزراعة العضوية.',
    nileOrder: 2
  },
  {
    name: 'أسيوط',
    slug: 'asyut',
    symbol: '🪡',
    region: 'وسط الصعيد',
    capitalCity: 'مدينة أسيوط',
    famousCraft: 'فن التلي الأسيوطي الرفيع وخيوط الفضة',
    famousItem: 'شيلان وجلاليب التلي المطرزة بالفضة الخالصة، وطواجن الفخار',
    tags: ['تلي أسيوط', 'فضة خالصة', 'تطريز يدوي', 'طواجن صعيدية'],
    coverImage: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015789/%D8%A7%D8%B3%D9%8A%D9%88%D8%B7.jpg',
    folkloreProverb: '«التلي مش بس خيط فضة، دي حكاية فرح وزفة عروسة»',
    shortIntro: 'قلب الصعيد النابض وعاصمة درب الأربعين، موطن فن التلي النادر الذي يُحاك يدوياً بشرائط الفضة الخالصة.',
    nileOrder: 3
  },
  {
    name: 'سوهاج',
    slug: 'sohag',
    symbol: '🧵',
    region: 'وسط الصعيد',
    capitalCity: 'مدينة سوهاج',
    famousCraft: 'أنوال أخميم التراثية والنسيج اليدوي الأصيل',
    famousItem: 'كليم الصوف والحرير الطبيعي، مفارش أخميم، وعسل الموالح',
    tags: ['كليم أخميم', 'حرير طبيعي', 'نسيج يدوي', 'مفارش قطنية'],
    coverImage: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015790/%D8%B3%D9%88%D9%87%D8%A7%D8%AC.jpg',
    folkloreProverb: '«نول أخميم يغزل حرير وصوف، وكرم أهلها بالعين موصوف»',
    shortIntro: 'مدينة النسيج التاريخية ومهد الملوك، تشتهر بأنوال كليم أخميم الحريري ومعبد أبيدوس المقدس.',
    nileOrder: 4
  },
  {
    name: 'قنا',
    slug: 'qena',
    symbol: '🏺',
    region: 'جنوب الصعيد',
    capitalCity: 'مدينة قنا',
    famousCraft: 'الفخار الصعيدي وأنوال الفركة بنقادة',
    famousItem: 'قلال قنا الفخارية، شيلان الفركة الحريرية، وعسل القصب الأسود',
    tags: ['قلال قنا', 'فركة نقادة', 'طواجن فخار', 'عسل قصب'],
    coverImage: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015791/%D9%82%D9%86%D8%A7.jpg',
    folkloreProverb: '«من شرب من قلال قنا، لا بد يعود لبلادنا»',
    shortIntro: 'أرض ثنية النيل الكبرى ومعبد دندرة، قلعة صناعة قلال الفخار المسامية الشهيرة وأنوال الفركة التراثية بمركز نقادة.',
    nileOrder: 5
  },
  {
    name: 'الأقصر',
    slug: 'luxor',
    symbol: '🏛️',
    region: 'جنوب الصعيد',
    capitalCity: 'مدينة الأقصر',
    famousCraft: 'نحت الألاباستر والنحاسيات والخشب التراثي',
    famousItem: 'تماثيل الألباستر اليدوية، صواني النحاس المزخرفة، وأواني خشب السرسوع',
    tags: ['ألاباستر القرنة', 'نحاس منقوش', 'خشب سرسوع', 'برديات'],
    coverImage: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015791/%D8%A7%D9%84%D8%A7%D9%82%D8%B5%D8%B1.jpg',
    folkloreProverb: '«طيبة بلد التاريخ والنور، من يزورها قلبه مسرور»',
    shortIntro: 'طيبة عاصمة العالم القديم، تضم ثلث آثار الإنسانية وورش نحت حجر الألاباستر بالبر الغربي والنحاس المطروق.',
    nileOrder: 6
  },
  {
    name: 'أسوان',
    slug: 'aswan',
    symbol: '☀️',
    region: 'جنوب الصعيد',
    capitalCity: 'مدينة أسوان',
    famousCraft: 'خيرات النوبة والخوص والمشغولات اليدوية',
    famousItem: 'تمور المجدول، كركديه أسوان، عطور وبخور، وسلال الخوص النوبية',
    tags: ['تمور مجدول', 'كركديه نوبي', 'سلال خوص', 'بخور صندل'],
    coverImage: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015791/%D8%A7%D8%B3%D9%88%D8%A7%D9%86.jpg',
    folkloreProverb: '«في أسوان السلام في القلوب قبل البيوت، والنيل فيها ما يفوت»',
    shortIntro: 'درة النيل الجنوبية وموطن الحضارة النوبية العريقة، تشتهر ببيوتها الملونة وأسواق التوابل والمشغولات الخوصية.',
    nileOrder: 7
  },
  {
    name: 'الوادي الجديد',
    slug: 'new-valley',
    symbol: '🌴',
    region: 'الواحات والصحراء',
    capitalCity: 'مدينة الخارجة',
    famousCraft: 'تمور الواحات وخوص النخيل وزيت الزيتون',
    famousItem: 'بلح صعيدي، عجوة الواحات، زيت زيتون بكر، وسلال الجريد',
    tags: ['تمور صعيدية', 'زيت زيتون بكر', 'سلال خوص ونخيل', 'دبس تمر'],
    coverImage: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015793/%D8%A7%D9%84%D9%88%D8%A7%D8%AF%D9%8A-%D8%A7%D9%84%D8%AC%D8%AF%D9%8A%D8%AF.jpg',
    folkloreProverb: '«نخلة الواحات أصلها ثابت في الأرض، وخيرها يفيض على الكل»',
    shortIntro: 'واحات النخيل والكنوز البكر، مهد أجود أصناف التمور الصعيدية وزيت الزيتون المعصور على البارد.',
    nileOrder: 8
  }
];

const REGION_OPTIONS = [
  { id: 'all', label: 'كافة المحافظات (8)' },
  { id: 'شمال الصعيد', label: 'شمال الصعيد' },
  { id: 'وسط الصعيد', label: 'وسط الصعيد' },
  { id: 'جنوب الصعيد', label: 'جنوب الصعيد' },
  { id: 'الواحات والصحراء', label: 'الواحات والصحراء' }
];

export const GovernorateExplorer: React.FC = () => {
  const { sellers, products, setSelectedGovernorateFilter, navigateToGovernorate, setActivePage } = useApp();

  // View Mode: 'grid' (cards) vs 'river' (Nile journey slider)
  const [viewMode, setViewMode] = useState<'grid' | 'river'>('grid');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick-view modal state
  const [previewGov, setPreviewGov] = useState<GovernorateExplorerItem | null>(null);

  // River scroll ref
  const riverScrollRef = useRef<HTMLDivElement>(null);

  const handleScrollRiver = (direction: 'left' | 'right') => {
    if (riverScrollRef.current) {
      const scrollAmount = 320;
      riverScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Filtered governorates based on search and region
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
        gov.tags.some((t) => t.toLowerCase().includes(q));

      return matchesRegion && matchesSearch;
    });
  }, [selectedRegion, searchQuery]);

  // Handle direct navigation to product store
  const handleShopGovernorate = (govName: Governorate) => {
    setSelectedGovernorateFilter(govName);
    setActivePage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle direct navigation to governorate dossier
  const handleOpenGovernorateDossier = (slug: string) => {
    navigateToGovernorate(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative my-8 sm:my-14 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Outer Heritage Container */}
      <div className="rounded-3xl bg-[#FAF6F0] dark:bg-[#181310] border-2 border-amber-300/70 dark:border-amber-900/40 shadow-sm overflow-hidden p-4 sm:p-8">
        
        {/* =========================================================
            1. TEXT HEADER SECTION
            Notice: Nubian Geometric Pattern is strictly on this text
            container background only, NEVER over any picture/image!
           ========================================================= */}
        <div className="relative rounded-2xl bg-white dark:bg-[#201A16] border border-[#E8DFC5] dark:border-[#382B22] p-6 sm:p-10 mb-8 overflow-hidden shadow-xs">
          {/* Authentic Nubian Pattern purely behind the text */}
          <NubianGeometricPattern
            opacity={0.15}
            color="#B24C2B"
            variant="tapestry"
            scale={1.1}
            className="text-[#B24C2B] dark:text-[#E0633C]"
          />

          {/* Top Decorative Frieze on Text Box */}
          <div className="absolute top-0 inset-x-0">
            <NubianGeometricPattern
              variant="frieze"
              opacity={0.35}
              color="#B24C2B"
              className="text-[#B24C2B]"
            />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 dark:bg-amber-950/70 text-[#943310] dark:text-amber-300 text-xs font-bold mb-3 border border-amber-300 dark:border-amber-800/60 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <MapPin className="w-3.5 h-3.5" />
                <span>محافظات صعيد مصر • مسار النيل والتراث الحي</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-[#241E1A] dark:text-[#F7F3EE] font-heritage tracking-tight mb-2.5">
                استكشف الصعيد بحسب محافظة المنشأ
              </h2>

              <p className="text-xs sm:text-sm text-[#73675B] dark:text-[#A89B8F] leading-relaxed">
                ثماني محافظات عريقة تمتد على ضفاف النيل من بني سويف شمالاً حتى بلاد الذهب في أسوان جنوباً. لكل محافظة هوية تراثية فريدة وحرفة توارثها الأجداد عبر آلاف السنين.
              </p>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <button
                type="button"
                id="btn-open-interactive-map"
                onClick={() => {
                  setActivePage('map');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B24C2B] hover:bg-[#97381B] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer min-h-[44px]"
              >
                <Compass className="w-4 h-4" />
                <span>الخريطة التفاعلية الشاملة</span>
              </button>

              <button
                type="button"
                id="btn-open-gov-encyclopedia"
                onClick={() => {
                  setActivePage('governorates');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#2A221D] hover:bg-amber-50 dark:hover:bg-[#342A24] text-[#241E1A] dark:text-[#F7F3EE] text-xs sm:text-sm font-bold border border-[#E5DDD3] dark:border-[#40332B] shadow-xs transition-all cursor-pointer min-h-[44px]"
              >
                <Landmark className="w-4 h-4 text-amber-600" />
                <span>موسوعة المحافظات</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================
            2. INTERACTIVE CONTROLS BAR
            Search + Region Tabs + View Switcher (Cards vs River)
           ========================================================= */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8C7A6B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن محافظة، حرفة، أو منتج شهير..."
                className="w-full bg-white dark:bg-[#221B17] text-xs sm:text-sm text-[#241E1A] dark:text-[#F7F3EE] rounded-xl pl-9 pr-10 py-2.5 border border-[#E5DDD3] dark:border-[#382E27] focus:border-[#B24C2B] dark:focus:border-[#E0633C] outline-none shadow-xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-2 self-end lg:self-auto bg-white dark:bg-[#221B17] p-1 rounded-xl border border-[#E5DDD3] dark:border-[#382E27] shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#B24C2B] text-white shadow-xs'
                    : 'text-[#665A4F] dark:text-[#A89B8F] hover:text-[#241E1A]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>شبكة البطاقات</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('river')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'river'
                    ? 'bg-[#B24C2B] text-white shadow-xs'
                    : 'text-[#665A4F] dark:text-[#A89B8F] hover:text-[#241E1A]'
                }`}
              >
                <Ship className="w-3.5 h-3.5" />
                <span>مسار النيل التفاعلي</span>
              </button>
            </div>
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {REGION_OPTIONS.map((opt) => {
              const isActive = selectedRegion === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedRegion(opt.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white dark:bg-[#221B17] text-[#665A4F] dark:text-[#A89B8F] border-[#E5DDD3] dark:border-[#382E27] hover:border-amber-400'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            3. VIEW MODE: NILE RIVER ROUTE SLIDER (مسار النيل التفاعلي)
           ========================================================= */}
        {viewMode === 'river' && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#73675B] dark:text-[#A89B8F]">
              <div className="flex items-center gap-1.5 font-bold">
                <Ship className="w-4 h-4 text-[#B24C2B]" />
                <span>مسار النيل من الشمال إلى الجنوب (8 محطات): اسحب أو استخدم الأسهم</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleScrollRiver('right')}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#221B17] border border-[#E5DDD3] dark:border-[#382E27] hover:bg-amber-50 cursor-pointer"
                  title="السابق"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScrollRiver('left')}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#221B17] border border-[#E5DDD3] dark:border-[#382E27] hover:bg-amber-50 cursor-pointer"
                  title="التالي"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={riverScrollRef}
              className="flex items-stretch gap-4 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth"
            >
              {UPPER_EGYPT_GOVERNORATES.map((gov) => {
                const govSellers = sellers.filter(
                  (s) => s.governorate === gov.name && s.status !== 'rejected' && s.status !== 'suspended'
                );
                const govProducts = products.filter(
                  (p) =>
                    (p.sellerGovernorate === gov.name || p.specifications?.originGovernorate === gov.name) &&
                    p.approvalStatus === 'approved'
                );

                return (
                  <div
                    key={gov.slug}
                    className="w-[280px] sm:w-[320px] shrink-0 rounded-2xl bg-white dark:bg-[#1F1916] border border-[#E5DDD3] dark:border-[#382E27] hover:border-[#B24C2B] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Clean photo without any pattern */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-stone-200 dark:bg-stone-800">
                      <img
                        src={gov.coverImage}
                        alt={`محافظة ${gov.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Station Badge */}
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-[11px] font-bold border border-white/20 flex items-center gap-1">
                        <span>محطة {gov.nileOrder}</span>
                        <span>•</span>
                        <span>{gov.region}</span>
                      </span>

                      {/* Title on Photo */}
                      <div className="absolute bottom-2.5 right-3 left-3 text-white">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">{gov.symbol}</span>
                          <h3 className="text-xl font-black font-heritage drop-shadow-md">
                            محافظة {gov.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-amber-200/90 truncate">
                          العاصمة: {gov.capitalCity}
                        </p>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-[11px] font-bold mb-1.5 border border-amber-200 dark:border-amber-800/40">
                          <span>الحرفة:</span>
                          <span className="truncate">{gov.famousCraft}</span>
                        </div>
                        <p className="text-xs text-[#665A4F] dark:text-[#A89B8F] line-clamp-2 leading-relaxed">
                          {gov.shortIntro}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#EFE8DF] dark:border-[#302620] flex items-center justify-between gap-2">
                        <div className="text-[10px] text-[#73675B] dark:text-[#A89B8F]">
                          <span className="font-bold text-[#B24C2B] dark:text-[#E0633C]">
                            {govSellers.length} مقدم خدمة
                          </span>
                          <span className="mx-1">•</span>
                          <span>{govProducts.length} منتج</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewGov(gov)}
                            className="p-1.5 rounded-lg bg-[#FAF6F0] dark:bg-[#2A221D] hover:bg-amber-100 text-[#241E1A] dark:text-white text-xs font-bold transition-colors cursor-pointer"
                            title="نظرة سريعة"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShopGovernorate(gov.name)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#B24C2B] hover:bg-[#97381B] text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>تسوّق</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================
            4. VIEW MODE: RESPONSIVE CARDS GRID (شبكة البطاقات الذكية)
            Fully responsive:
            - Mobile: 1 or 2 clean cards with spacious touch targets
            - Tablet: 2-3 columns
            - Desktop: 4 columns
           ========================================================= */}
        {viewMode === 'grid' && (
          <div>
            {filteredGovernorates.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#1E1917] rounded-2xl border border-[#E5DDD3] dark:border-[#382E27] p-8">
                <Compass className="w-10 h-10 text-[#8C7A6B] mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#241E1A] dark:text-[#F7F3EE]">لم يتم العثور على محافظات مطابقة</h3>
                <p className="text-xs text-[#73675B] dark:text-[#A89B8F] mt-1">جرب البحث بكلمة أخرى مثل «فخار»، «تلي»، «أسوان»، أو اختر إقليم آخر</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedRegion('all');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#B24C2B] text-white text-xs font-bold cursor-pointer"
                >
                  عرض جميع المحافظات
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredGovernorates.map((gov, idx) => {
                  const govSellers = sellers.filter(
                    (s) => s.governorate === gov.name && s.status !== 'rejected' && s.status !== 'suspended'
                  );
                  const govProducts = products.filter(
                    (p) =>
                      (p.sellerGovernorate === gov.name || p.specifications?.originGovernorate === gov.name) &&
                      p.approvalStatus === 'approved'
                  );
                  const sellersCount = govSellers.length;
                  const productsCount = govProducts.length;

                  return (
                    <motion.div
                      key={gov.name}
                      id={`gov-card-${gov.slug}`}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-20px' }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                      className="group bg-white dark:bg-[#1F1916] rounded-2xl border border-[#E5DDD3] dark:border-[#382E27] hover:border-[#B24C2B] dark:hover:border-[#E0633C] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* Top Photo Cover: Clean, High-Contrast, Pattern-Free! */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-stone-200 dark:bg-stone-800">
                        <img
                          src={gov.coverImage}
                          alt={`محافظة ${gov.name}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                            {gov.region}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewGov(gov);
                            }}
                            className="p-1.5 rounded-full bg-black/60 hover:bg-[#B24C2B] backdrop-blur-md text-white text-xs transition-colors cursor-pointer"
                            title="نظرة سريعة"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Bottom Info on Photo */}
                        <div className="absolute bottom-3 right-3 left-3 text-white">
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg">{gov.symbol}</span>
                            <h3 className="text-xl sm:text-2xl font-black font-heritage drop-shadow-md">
                              محافظة {gov.name}
                            </h3>
                          </div>
                          <p className="text-[11px] text-amber-200/90 mt-0.5">
                            العاصمة: {gov.capitalCity}
                          </p>
                        </div>
                      </div>

                      {/* Card Content (Text Area) */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          {/* Famous Craft Badge */}
                          <div className="p-2 rounded-xl bg-[#FAF6F0] dark:bg-[#28201B] border border-[#EFE8DF] dark:border-[#382E27] mb-2.5">
                            <span className="text-[10px] text-[#8C7A6B] dark:text-[#A8988B] block font-bold">
                              الحرفة التراثية الأشهر:
                            </span>
                            <span className="text-xs font-bold text-[#B24C2B] dark:text-[#E0633C] line-clamp-1">
                              {gov.famousCraft}
                            </span>
                          </div>

                          {/* Short Description */}
                          <p className="text-xs text-[#665A4F] dark:text-[#A89B8F] leading-relaxed line-clamp-2">
                            {gov.shortIntro}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {gov.tags.slice(0, 3).map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#2A231F] text-[#55473E] dark:text-[#C4B7AC]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Card Footer with Live Stats & Dual Action Buttons */}
                        <div className="pt-3 border-t border-[#EFE8DF] dark:border-[#302620] space-y-2.5">
                          {/* Stats */}
                          <div className="flex items-center justify-between text-[11px] text-[#73675B] dark:text-[#A89B8F] font-medium">
                            <span className="font-bold text-[#B24C2B] dark:text-[#E0633C]">
                              {sellersCount > 0 ? `${sellersCount} مقدم خدمة` : 'ورش التراث'}
                            </span>
                            <span>({productsCount} منتج بالسوق)</span>
                          </div>

                          {/* Buttons */}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => handleShopGovernorate(gov.name)}
                              className="w-full py-2 px-2.5 rounded-xl bg-[#B24C2B] hover:bg-[#97381B] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>تسوّق</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenGovernorateDossier(gov.slug)}
                              className="w-full py-2 px-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#251E1A] hover:bg-amber-100/70 dark:hover:bg-[#342A24] text-[#241E1A] dark:text-[#F7F3EE] text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-[#E5DDD3] dark:border-[#382E27]"
                            >
                              <span>الدليل</span>
                              <ArrowLeft className="w-3 h-3 text-[#B24C2B]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            5. AUTHENTIC FOLKLORE FOOTER BANNER
            Purely a text container with Nubian pattern background!
           ========================================================= */}
        <div className="relative mt-8 rounded-2xl bg-white dark:bg-[#201A16] border border-[#E8DFC5] dark:border-[#382B22] p-5 sm:p-7 overflow-hidden shadow-xs">
          <NubianGeometricPattern
            opacity={0.12}
            color="#B24C2B"
            variant="diamonds"
            className="text-[#B24C2B] dark:text-[#E0633C]"
          />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-[#B24C2B] dark:text-amber-400 flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#241E1A] dark:text-[#F7F3EE]">
                  هل تود استكشاف خريطة الصعيد التفاعلية مع إحداثيات GPS والمعالم الكاملة؟
                </h4>
                <p className="text-xs text-[#73675B] dark:text-[#A89B8F] mt-0.5">
                  شاهد مسارات القرى التراثية، المعابد، وورش الحرفيين مباشرة على خريطة النيل
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActivePage('map');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-xl bg-[#B24C2B] hover:bg-[#97381B] text-white text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer shadow-xs"
            >
              افتح أطلس وخريطة الصعيد
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          6. QUICK-VIEW MODAL (نافذة النظرة السريعة التفاعلية)
          Smooth slide-up modal with complete details
         ========================================================= */}
      <AnimatePresence>
        {previewGov && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-xl bg-white dark:bg-[#1C1714] rounded-3xl overflow-hidden shadow-2xl border border-[#E5DDD3] dark:border-[#382E27] max-h-[90vh] flex flex-col"
            >
              {/* Clean Header Image: No pattern overlay */}
              <div className="relative h-48 sm:h-56 shrink-0 overflow-hidden bg-stone-900">
                <img
                  src={previewGov.coverImage}
                  alt={previewGov.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setPreviewGov(null)}
                  className="absolute top-4 left-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Badges & Title */}
                <div className="absolute bottom-4 right-4 left-4 text-white">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-600 text-white text-[11px] font-bold mb-1.5">
                    <span>{previewGov.symbol}</span>
                    <span>{previewGov.region}</span>
                    <span>•</span>
                    <span>العاصمة: {previewGov.capitalCity}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black font-heritage">
                    محافظة {previewGov.name}
                  </h3>
                </div>
              </div>

              {/* Modal Body: Text Area with Nubian Pattern Background */}
              <div className="relative p-6 overflow-y-auto space-y-4 flex-1">
                <NubianGeometricPattern
                  opacity={0.08}
                  color="#B24C2B"
                  variant="diamonds"
                  className="text-[#B24C2B]"
                />

                <div className="relative z-10 space-y-4">
                  {/* Traditional Quote */}
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-heritage italic">
                    {previewGov.folkloreProverb}
                  </div>

                  {/* Intro */}
                  <div>
                    <h4 className="text-xs font-bold text-[#8C7A6B] dark:text-[#A8988B] mb-1">
                      عن المحافظة وتاريخها:
                    </h4>
                    <p className="text-xs sm:text-sm text-[#55473E] dark:text-[#C5B8AC] leading-relaxed">
                      {previewGov.shortIntro}
                    </p>
                  </div>

                  {/* Famous Craft and Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#251E1A] border border-[#E8DFC5] dark:border-[#382B22]">
                      <span className="text-[11px] font-bold text-[#B24C2B] dark:text-[#E0633C] block mb-1">
                        الحرفة الأكثر شهرة:
                      </span>
                      <span className="text-xs text-[#241E1A] dark:text-[#F7F3EE] font-bold">
                        {previewGov.famousCraft}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#251E1A] border border-[#E8DFC5] dark:border-[#382B22]">
                      <span className="text-[11px] font-bold text-[#B24C2B] dark:text-[#E0633C] block mb-1">
                        أشهر المنتجات التراثية:
                      </span>
                      <span className="text-xs text-[#241E1A] dark:text-[#F7F3EE]">
                        {previewGov.famousItem}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <span className="text-[11px] font-bold text-[#8C7A6B] dark:text-[#A8988B] block mb-1.5">
                      العلامات والمنتجات الرئيسية:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {previewGov.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#2A231F] text-[#4A3E34] dark:text-[#D5C9BD] text-xs font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 bg-[#FAF6F0] dark:bg-[#201A16] border-t border-[#E5DDD3] dark:border-[#382E27] flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const g = previewGov;
                    setPreviewGov(null);
                    handleOpenGovernorateDossier(g.slug);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#2A231F] hover:bg-stone-100 text-[#241E1A] dark:text-[#F7F3EE] text-xs sm:text-sm font-bold border border-[#E5DDD3] dark:border-[#40332B] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Landmark className="w-4 h-4 text-amber-600" />
                  <span>دليل المحافظة التراثي</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const g = previewGov;
                    setPreviewGov(null);
                    handleShopGovernorate(g.name);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#B24C2B] hover:bg-[#97381B] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>تسوّق منتجات {previewGov.name}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
