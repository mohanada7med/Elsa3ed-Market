import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { MapGovernorateData, WahGovernorate } from '../../types';
import {
  MapPin,
  Compass,
  Landmark,
  Hammer,
  Utensils,
  BookOpen,
  Calendar,
  ShoppingBag,
  ArrowLeft,
  Search,
  Sparkles,
  Info,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GovernorateMapItem {
  id: string;
  name: string;
  slug: string;
  nickname: string;
  region: 'جنوب الصعيد' | 'وسط الصعيد' | 'شمال الصعيد';
  color: string;
  hoverColor: string;
  textColor: string;
  nileSegment: string;
  description: string;
  topCraft: string;
  topPlace: string;
  svgPath: string;
  labelX: number;
  labelY: number;
}

// Stylized geographical layout of Upper Egypt governorates along the Nile
const GOVERNORATES_GEO: GovernorateMapItem[] = [
  {
    id: 'fayoum',
    name: 'الفيوم',
    slug: 'fayoum',
    nickname: 'واحة الصعيد الخضراء وأرض السواقي',
    region: 'شمال الصعيد',
    color: '#059669',
    hoverColor: '#10B981',
    textColor: '#FFFFFF',
    nileSegment: 'بحر يوسف وبحيرة قارون',
    description: 'واحة طبيعية فريدة تحتضن قرية تونس لصناعة الخزف ووادي الحيتان أقدم التراث الطبيعي العالمي.',
    topCraft: 'خزف وفخار قرية تونس، سجاد النول اليدوي',
    topPlace: 'وادي الحيتان، بحيرة قارون، سواقي الهدير',
    svgPath: 'M 190 70 C 210 65, 235 70, 240 90 C 235 110, 215 115, 190 110 C 175 105, 170 85, 190 70 Z',
    labelX: 205,
    labelY: 95
  },
  {
    id: 'beni-suef',
    name: 'بني سويف',
    slug: 'beni-suef',
    nickname: 'بوابة الصعيد ولؤلؤة النيل الوسطى',
    region: 'شمال الصعيد',
    color: '#D97706',
    hoverColor: '#F59E0B',
    textColor: '#FFFFFF',
    nileSegment: 'مجرى النيل الأوسط',
    description: 'البوابة الشمالية للصعيد، تجمع بين بساتين النباتات الطبية وهرم ميدوم الشاهد على فجر الهندسة المصرية.',
    topCraft: 'زيوت عطرية ونباتات طبية، سلال النخيل',
    topPlace: 'هرم ميدوم، كهف سنور المحمي',
    svgPath: 'M 220 112 C 265 110, 285 130, 270 155 C 240 165, 215 155, 205 135 C 205 125, 210 115, 220 112 Z',
    labelX: 240,
    labelY: 138
  },
  {
    id: 'minya',
    name: 'المنيا',
    slug: 'minya',
    nickname: 'عروس الصعيد وعاصمة إخناتون الفكرية',
    region: 'وسط الصعيد',
    color: '#B45309',
    hoverColor: '#D97706',
    textColor: '#FFFFFF',
    nileSegment: 'كورنيش عروس الصعيد',
    description: 'أرض الفكر والتوحيد في تل العمارنة، تمتاز بآثار بني حسن والمحاجر الجيرية البيضاء.',
    topCraft: 'صناعة العسل الأسود، تطريز الكليم البدوي',
    topPlace: 'تل العمارنة، مقابر بني حسن، البهنسا',
    svgPath: 'M 205 160 C 255 155, 290 180, 280 220 C 245 230, 200 220, 190 195 C 190 175, 195 165, 205 160 Z',
    labelX: 235,
    labelY: 195
  },
  {
    id: 'asyut',
    name: 'أسيوط',
    slug: 'asyut',
    nickname: 'قلب الصعيد النابض وعاصمة التلي الرفيع',
    region: 'وسط الصعيد',
    color: '#9333EA',
    hoverColor: '#A855F7',
    textColor: '#FFFFFF',
    nileSegment: 'قناطر أسيوط التاريخية',
    description: 'العاصمة التجارية لوسط الصعيد وموطن فن التلي العالمي المطرز بخيوط الفضة والذهب.',
    topCraft: 'فن التلي الأسيوطي، النحت على خشب الأبنوس',
    topPlace: 'دير المحرق العامر، قناطر أسيوط، وكالة شلبي',
    svgPath: 'M 200 225 C 250 220, 295 240, 285 285 C 245 295, 210 285, 190 260 C 185 245, 190 230, 200 225 Z',
    labelX: 238,
    labelY: 260
  },
  {
    id: 'sohag',
    name: 'سوهاج',
    slug: 'sohag',
    nickname: 'معقل النسيج والحرير ومهد ملوك مصر',
    region: 'جنوب الصعيد',
    color: '#C2410C',
    hoverColor: '#EA580C',
    textColor: '#FFFFFF',
    nileSegment: 'منحنى النيل بسوهاج',
    description: 'موطن أخميم أقدم مدينة نسيج في العالم، ومعبد أبيدوس المقدس الذي يضم قائمة ملوك مصر القديمة.',
    topCraft: 'نسيج وكليم أخميم، صناعة الأثاث التراثي',
    topPlace: 'معبد أبيدوس، الدير الأبيض والأحمر، ميريت آمون',
    svgPath: 'M 210 290 C 260 285, 305 305, 295 350 C 255 365, 215 350, 195 325 C 195 305, 200 295, 210 290 Z',
    labelX: 248,
    labelY: 325
  },
  {
    id: 'qena',
    name: 'قنا',
    slug: 'qena',
    nickname: 'أرض القلال القناوية والفركة والكركديه',
    region: 'جنوب الصعيد',
    color: '#B91C1C',
    hoverColor: '#DC2626',
    textColor: '#FFFFFF',
    nileSegment: 'ثنية قنا العظمى',
    description: 'تتميز بثنية النيل العظمى وقرية الجبلاو للفخار ونقادة المشهورة بنسيج الفركة الحريرية.',
    topCraft: 'فخار وقلال قنا، شيلان الفركة بنقادة',
    topPlace: 'معبد دندرة، مسجد سيدي عبد الرحيم القنائي',
    svgPath: 'M 230 355 C 285 345, 335 375, 320 425 C 275 440, 235 420, 215 390 C 215 370, 220 360, 230 355 Z',
    labelX: 270,
    labelY: 395
  },
  {
    id: 'luxor',
    name: 'الأقصر',
    slug: 'luxor',
    nickname: 'طيبة عاصمة العالم القديم ومدينة الشمس',
    region: 'جنوب الصعيد',
    color: '#EAB308',
    hoverColor: '#FACC15',
    textColor: '#1A1614',
    nileSegment: 'ضفتي طيبة الخالدتين',
    description: 'أعظم متحف مفتوح على وجه الأرض، تحتضن ثلث آثار العالم وقرية القرنة معقل حرف الألباستر.',
    topCraft: 'نحت الألباستر، بردي الأقصر، الخزف المعاصر',
    topPlace: 'معبد الكرنك، وادي الملوك، معبد حتشبسوت',
    svgPath: 'M 245 430 C 295 425, 325 450, 315 490 C 280 500, 245 490, 230 465 C 230 445, 235 435, 245 430 Z',
    labelX: 275,
    labelY: 465
  },
  {
    id: 'aswan',
    name: 'أسوان',
    slug: 'aswan',
    nickname: 'بلاد الذهب وموئل السحر النوبي الخالد',
    region: 'جنوب الصعيد',
    color: '#0284C7',
    hoverColor: '#0EA5E9',
    textColor: '#FFFFFF',
    nileSegment: 'شلال النيل الأول وبحيرة ناصر',
    description: 'بوابة مصر الجنوبية ومهد الثقافة النوبية، موطن الجرانيت الوردي والأعشاب الطبيعية والحرف النوبية.',
    topCraft: 'خوص وعراجين النخيل، التطريز النوبي، الفخار الأسواني',
    topPlace: 'معبد فيلة، معبد أبو سمبل، القرية النوبية بغرب سهيل',
    svgPath: 'M 240 495 C 300 485, 340 520, 325 580 C 280 610, 220 590, 210 545 C 210 515, 225 500, 240 495 Z',
    labelX: 270,
    labelY: 550
  }
];

export const UpperEgyptMapPage: React.FC = () => {
  const { navigateToGovernorate, setActivePage } = useApp();
  const [selectedGov, setSelectedGov] = useState<GovernorateMapItem>(GOVERNORATES_GEO[5]); // Default Qena
  const [hoveredGov, setHoveredGov] = useState<GovernorateMapItem | null>(null);
  const [mapStats, setMapStats] = useState<MapGovernorateData[]>([]);
  const [activeRegionFilter, setActiveRegionFilter] = useState<'all' | 'شمال الصعيد' | 'وسط الصعيد' | 'جنوب الصعيد'>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const stats = await wahApi.getMapData();
        setMapStats(stats);
      } catch (err) {
        console.warn('Could not load map stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const activeGovStats = mapStats.find((s) => s.slug === selectedGov.slug);

  const filteredGovernorates = GOVERNORATES_GEO.filter((g) => {
    if (activeRegionFilter === 'all') return true;
    return g.region === activeRegionFilter;
  });

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] text-[#29221D] dark:text-[#FAF6F2] py-6 sm:py-10 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#7A6F64] dark:text-[#9C8F82]">
            <button
              onClick={() => setActivePage('home')}
              className="hover:text-[#B45F42] transition-colors cursor-pointer"
            >
              الرئيسية
            </button>
            <span>/</span>
            <span className="text-[#B45F42] font-bold">خريطة صعيد مصر التفاعلية</span>
          </div>

          <button
            onClick={() => setActivePage('governorates')}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#B45F42] hover:text-[#9E4F36] bg-[#B45F42]/10 hover:bg-[#B45F42]/20 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <span>دليل كافة المحافظات</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Page Title & Intro */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold mb-3 border border-amber-300 dark:border-amber-800/40">
            <Compass className="w-3.5 h-3.5" />
            <span>الجغرافيا الثقافية والتراثية لصعيد مصر</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#29221D] dark:text-[#FAF6F2] font-serif tracking-tight mb-3">
            خريطة صعيد مصر التفاعلية
          </h1>
          <p className="text-sm sm:text-base text-[#665A4F] dark:text-[#A89C90] leading-relaxed">
            استكشف محافظات الصعيد الثمانية عبر شريان النيل الخالد. انقر على أي محافظة لاكتشاف معالمها، أسرار حرفها، حكاياتها، وأشهر مبدعيها.
          </p>
        </div>

        {/* Region Filter Buttons */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
          {(['all', 'شمال الصعيد', 'وسط الصعيد', 'جنوب الصعيد'] as const).map((reg) => (
            <button
              key={reg}
              onClick={() => setActiveRegionFilter(reg)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeRegionFilter === reg
                  ? 'bg-[#B45F42] text-white shadow-md'
                  : 'bg-white dark:bg-[#1E1917] text-[#665A4F] dark:text-[#A89C90] border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42]'
              }`}
            >
              {reg === 'all' ? 'كامل محافظات الصعيد (8)' : reg}
            </button>
          ))}
        </div>

        {/* Interactive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Center: Interactive SVG Upper Egypt Canvas */}
          <div className="lg:col-span-7 bg-white dark:bg-[#1E1917] rounded-3xl p-4 sm:p-8 border border-[#E8E1D9] dark:border-[#382E27] shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0EAE1] dark:border-[#2D2622]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-[#7A6F64] dark:text-[#A89C90]">
                  خريطة متفاعلة — اضغط لاختيار المحافظة
                </span>
              </div>
              <span className="text-xs font-serif text-[#B45F42]">من الفيوم إلى أسوان</span>
            </div>

            {/* SVG Visual Stage */}
            <div className="relative w-full aspect-[4/6] max-h-[640px] flex items-center justify-center">
              <svg
                viewBox="100 40 300 580"
                className="w-full h-full drop-shadow-md select-none"
                aria-label="خريطة صعيد مصر التفاعلية"
              >
                {/* Background decorative Nile River curve */}
                <path
                  d="M 230 50 Q 215 130, 240 180 T 225 300 Q 275 360, 290 400 T 260 480 Q 280 540, 250 620"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.75"
                  className="animate-pulse"
                />

                {/* River Nile Label */}
                <text
                  x="210"
                  y="50"
                  fill="#0284C7"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="end"
                  opacity="0.8"
                >
                  نهر النيل الخالد 〰
                </text>

                {/* Governorates SVG Path Outlines */}
                {GOVERNORATES_GEO.map((gov) => {
                  const isSelected = selectedGov.id === gov.id;
                  const isHovered = hoveredGov?.id === gov.id;
                  const isDimmed =
                    activeRegionFilter !== 'all' && gov.region !== activeRegionFilter;

                  return (
                    <g
                      key={gov.id}
                      id={`map-gov-${gov.id}`}
                      className="cursor-pointer transition-all duration-300"
                      onClick={() => setSelectedGov(gov)}
                      onMouseEnter={() => setHoveredGov(gov)}
                      onMouseLeave={() => setHoveredGov(null)}
                    >
                      <path
                        d={gov.svgPath}
                        fill={isSelected ? gov.hoverColor : gov.color}
                        stroke={isSelected ? '#FFFFFF' : '#1A1614'}
                        strokeWidth={isSelected ? 3 : 1.2}
                        opacity={isDimmed ? 0.3 : isSelected ? 1 : isHovered ? 0.9 : 0.8}
                        className="transition-all duration-200 hover:brightness-110"
                      />
                      {/* Name Pin & Label */}
                      <text
                        x={gov.labelX}
                        y={gov.labelY}
                        fill="#FFFFFF"
                        fontSize={isSelected ? '13' : '11'}
                        fontWeight={isSelected ? 'bold' : '600'}
                        textAnchor="middle"
                        pointerEvents="none"
                        className="drop-shadow-md select-none font-sans"
                      >
                        {gov.name}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Floating Quick Insight Tag */}
              {hoveredGov && (
                <div
                  className="absolute bottom-4 right-4 bg-[#1A1614]/90 backdrop-blur-md text-white text-xs px-3.5 py-2 rounded-xl shadow-lg border border-white/20 pointer-events-none transition-all"
                >
                  <p className="font-bold">{hoveredGov.name}</p>
                  <p className="text-amber-300 text-[11px]">{hoveredGov.nickname}</p>
                </div>
              )}
            </div>

            {/* Micro Governorates Quick Selector Bar */}
            <div className="mt-4 pt-4 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {GOVERNORATES_GEO.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGov(g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedGov.id === g.id
                      ? 'bg-[#B45F42] text-white'
                      : 'bg-[#F3EFE9] dark:bg-[#25201D] text-[#665A4F] dark:text-[#A89C90] hover:bg-[#E8E1D9]'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Rich Interactive Governorate Profile Panel */}
          <div className="lg:col-span-5 bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] dark:border-[#382E27] shadow-sm flex flex-col justify-between">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: selectedGov.color }}
                >
                  {selectedGov.region}
                </span>
                <span className="text-xs text-[#7A6F64] dark:text-[#9C8F82] font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#B45F42]" />
                  <span>{selectedGov.nileSegment}</span>
                </span>
              </div>

              {/* Title & Nickname */}
              <h2 className="text-2xl sm:text-3xl font-black text-[#29221D] dark:text-[#FAF6F2] font-serif mb-1">
                محافظة {selectedGov.name}
              </h2>
              <p className="text-sm font-semibold text-[#B45F42] dark:text-[#FF855D] mb-4">
                «{selectedGov.nickname}»
              </p>

              {/* Description */}
              <p className="text-sm text-[#665A4F] dark:text-[#A89C90] leading-relaxed mb-6">
                {selectedGov.description}
              </p>

              {/* Key Highlights Bento */}
              <div className="space-y-3 mb-6">
                <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shrink-0">
                    <Hammer className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#7A6F64] dark:text-[#A89C90] block">
                      أشهر الحرف اليدوية
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-[#29221D] dark:text-[#FAF6F2]">
                      {selectedGov.topCraft}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 shrink-0">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#7A6F64] dark:text-[#A89C90] block">
                      أبرز المعالم التراثية
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-[#29221D] dark:text-[#FAF6F2]">
                      {selectedGov.topPlace}
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Backend Counter Stats */}
              {activeGovStats && (
                <div className="grid grid-cols-3 gap-2.5 mb-6 text-center">
                  <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27]">
                    <span className="text-lg font-black text-[#B45F42] block">
                      {activeGovStats.stats.placesCount || 3}
                    </span>
                    <span className="text-[11px] text-[#7A6F64] dark:text-[#A89C90] font-medium">
                      معالم موثقة
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27]">
                    <span className="text-lg font-black text-[#B45F42] block">
                      {activeGovStats.stats.craftsCount || 2}
                    </span>
                    <span className="text-[11px] text-[#7A6F64] dark:text-[#A89C90] font-medium">
                      حرف أصيلة
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27]">
                    <span className="text-lg font-black text-[#B45F42] block">
                      {activeGovStats.stats.productsCount || 5}
                    </span>
                    <span className="text-[11px] text-[#7A6F64] dark:text-[#A89C90] font-medium">
                      قطع بالسوق
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-4 border-t border-[#F0EAE1] dark:border-[#2D2622]">
              <button
                type="button"
                id={`explore-gov-btn-${selectedGov.slug}`}
                onClick={() => navigateToGovernorate(selectedGov.slug)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#B45F42] hover:bg-[#9E4F36] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group"
              >
                <span>استكشف محافظة {selectedGov.name} بالكامل</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActivePage('places')}
                  className="py-2.5 px-3 rounded-xl bg-[#F3EFE9] dark:bg-[#25201D] hover:bg-[#E8E1D9] text-[#29221D] dark:text-[#FAF6F2] text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  معالم المحافظة
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('cultural-crafts')}
                  className="py-2.5 px-3 rounded-xl bg-[#F3EFE9] dark:bg-[#25201D] hover:bg-[#E8E1D9] text-[#29221D] dark:text-[#FAF6F2] text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  ورش وحرف {selectedGov.name}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner: Discovery Cards of Upper Egypt Governorates */}
        <div className="mt-12 sm:mt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#29221D] dark:text-[#FAF6F2] font-serif">
                محافظات صعيد مصر الثمانية
              </h3>
              <p className="text-xs sm:text-sm text-[#7A6F64] dark:text-[#9C8F82]">
                اضغط على بطاقة أي محافظة لاستكشاف موسوعتها وتراثها
              </p>
            </div>
            <button
              onClick={() => setActivePage('governorates')}
              className="text-xs sm:text-sm font-bold text-[#B45F42] hover:underline"
            >
              عرض الدليل المصور ←
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {GOVERNORATES_GEO.map((g) => (
              <div
                key={g.id}
                onClick={() => navigateToGovernorate(g.slug)}
                className="group p-4 rounded-2xl bg-white dark:bg-[#1E1917] border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] transition-all cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: g.color }}
                  />
                  <span className="text-[10px] text-[#7A6F64] dark:text-[#9C8F82] font-semibold">
                    {g.region}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-[#29221D] dark:text-[#FAF6F2] group-hover:text-[#B45F42] transition-colors">
                  {g.name}
                </h4>
                <p className="text-xs text-[#7A6F64] dark:text-[#9C8F82] truncate mt-1">
                  {g.nickname}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
