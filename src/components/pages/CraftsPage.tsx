import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  MapPin,
  ChevronRight,
  Film,
  ArrowLeft,
  CheckCircle2,
  Award,
  Search,
  BookOpen,
  Layers,
  Scroll,
  ExternalLink,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { CraftStory } from '../../types';
import { api } from '../../services/api';
import { motion } from 'motion/react';

const UPPER_EGYPT_GOVS = ['الكل', 'أسوان', 'الأقصر', 'قنا', 'سوهاج', 'أسيوط', 'المنيا'];

export const CraftsPage: React.FC = () => {
  const { setActivePage, setShowIntroVideo, setSelectedCategoryFilter } = useApp();
  const [crafts, setCrafts] = useState<CraftStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGov, setSelectedGov] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchCrafts = async () => {
      try {
        setIsLoading(true);
        const data = await api.getPublicCraftStories();
        if (isMounted) {
          setCrafts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn('[CraftsPage] Error loading craft stories from database:', err);
        if (isMounted) setCrafts([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCrafts();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCrafts = crafts.filter((craft) => {
    const matchesGov =
      selectedGov === 'الكل' ||
      craft.governorate?.includes(selectedGov) ||
      craft.city?.includes(selectedGov) ||
      craft.village?.includes(selectedGov);

    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesGov;

    const matchesSearch =
      craft.title?.toLowerCase().includes(q) ||
      craft.subtitle?.toLowerCase().includes(q) ||
      craft.description?.toLowerCase().includes(q) ||
      craft.governorate?.toLowerCase().includes(q) ||
      craft.city?.toLowerCase().includes(q) ||
      craft.village?.toLowerCase().includes(q) ||
      craft.artisan?.toLowerCase().includes(q) ||
      (craft.materials || []).some((m) => m.toLowerCase().includes(q)) ||
      (craft.techniques || []).some((t) => t.toLowerCase().includes(q));

    return matchesGov && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#8c6b53]">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#943310] transition-colors"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="text-gray-900 font-bold">أطلس حرف الصعيد التراثية</span>
      </nav>

      {/* Hero Banner with Documentary CTA */}
      <div className="bg-[#241710] rounded-3xl p-6 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#943310] text-amber-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>الموسوعة التراثية الرقمية</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-heritage leading-tight">
            أطلس الحرف التراثية في صعيد مصر
          </h1>

          <p className="text-xs sm:text-sm text-[#cfc0b3] leading-relaxed">
            توثيق تاريخي وبصري مستمد حصرياً من سجلات قاعدة البيانات المعتمدة لحرف الصعيد الأصيلة، لتوثيق أسرار الصنعة وهوية الحرفيين دون تحريف أو اختلاق.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="crafts-watch-film-btn"
              onClick={() => setShowIntroVideo(true)}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Film className="w-4 h-4" />
              <span>مشاهدة الفيلم الوثائقي التفاعلي</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#ebdccd] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في أطلس الحرف بالاسم، المادة، القرية أو المحافظة..."
              className="w-full pl-3 pr-10 py-2.5 bg-[#faf6f0] border border-[#ebdccd] rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#943310] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                مسح
              </button>
            )}
          </div>

          {/* Results count badge */}
          <div className="text-xs font-bold text-[#8c6b53] px-3 py-1.5 bg-[#faf6f0] rounded-xl border border-[#ebdccd] shrink-0 self-start md:self-auto flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#943310]" />
            <span>
              {isLoading
                ? 'جاري التحميل...'
                : `${filteredCrafts.length} ${filteredCrafts.length === 1 ? 'حرفة موثقة' : 'حرف موثقة'}`}
            </span>
          </div>
        </div>

        {/* Governorate Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-gray-500 font-bold shrink-0 ml-1">تصفية بالمحافظة:</span>
          {UPPER_EGYPT_GOVS.map((gov) => (
            <button
              key={gov}
              type="button"
              onClick={() => setSelectedGov(gov)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                selectedGov === gov
                  ? 'bg-[#943310] text-white shadow-xs'
                  : 'bg-[#faf6f0] text-gray-700 hover:bg-[#ede0ca] border border-[#ebdccd]'
              }`}
            >
              {gov}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section: Loading | Empty | Real Records */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="bg-white rounded-3xl border border-[#ebdccd] p-6 sm:p-10 animate-pulse space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 h-64 bg-gray-200 rounded-2xl" />
                <div className="lg:col-span-7 space-y-4">
                  <div className="h-6 w-32 bg-gray-200 rounded-lg" />
                  <div className="h-8 w-3/4 bg-gray-200 rounded-lg" />
                  <div className="h-20 w-full bg-gray-200 rounded-lg" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-10 bg-gray-200 rounded-xl" />
                    <div className="h-10 bg-gray-200 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCrafts.length === 0 ? (
        /* Honest Database-Only Empty State */
        <div className="bg-white rounded-3xl border border-dashed border-[#ebdccd] p-12 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-[#943310] flex items-center justify-center mx-auto border border-amber-200">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-heritage">
            لا توجد حرف موثقة حاليًا
          </h2>
          <p className="text-xs sm:text-sm text-[#8c6b53] leading-relaxed max-w-md mx-auto">
            {selectedGov !== 'الكل' || searchQuery
              ? 'لم يتم العثور على حرف تطابق معايير البحث المحددة. يمكنك إعادة تعيين الفلاتر لعرض كافة السجلات المعتمدة.'
              : 'يتم توثيق الحرف التراثية وأسرار الصنعة الأصيلة عبر لوحة تحكم إدارة المنصة استناداً إلى المراجع الميدانية المعتمدة.'}
          </p>
          {(selectedGov !== 'الكل' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedGov('الكل');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#faf6f0] hover:bg-[#ede0ca] text-[#943310] text-xs font-bold rounded-xl border border-[#ebdccd] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          )}
        </div>
      ) : (
        /* Real Database Craft Records */
        <div className="space-y-12">
          {filteredCrafts.map((story, idx) => {
            const hasLocationDetails = story.city || story.village || story.location;
            const fullLocation = [story.governorate, story.city, story.village, story.location]
              .filter(Boolean)
              .join(' - ');

            const stepsOrTechniques =
              (story.techniques && story.techniques.length > 0
                ? story.techniques
                : story.keyFeatures) || [];

            return (
              <motion.article
                key={story.id}
                id={story.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: (idx % 3) * 0.08 }}
                className="bg-white rounded-3xl border border-[#ebdccd] shadow-md overflow-hidden p-6 sm:p-10"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Visual Side */}
                  <div className={`lg:col-span-5 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-4/3 bg-gray-100 border border-[#ebdccd]">
                      {story.image ? (
                        <img
                          src={story.image}
                          alt={story.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-[#ebdccd] text-[#943310] p-6 text-center">
                          <BookOpen className="w-12 h-12 opacity-60 mb-2" />
                          <span className="text-xs font-bold">{story.title}</span>
                          <span className="text-[10px] text-gray-500 mt-1">{story.governorate}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                      
                      <div className="absolute bottom-3 right-3 text-white">
                        <span className="text-[11px] text-amber-300 font-bold block">الموطن التراثي:</span>
                        <span className="font-bold text-sm">{fullLocation || story.governorate}</span>
                      </div>

                      {story.historyAge && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-xs rounded-lg text-amber-200 text-[10px] font-bold border border-white/10">
                          {story.historyAge}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Story Content */}
                  <div className={`lg:col-span-7 space-y-4 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-amber-100 text-[#943310] text-xs font-bold rounded-lg border border-amber-300 inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{story.governorate}</span>
                      </span>

                      {story.city && (
                        <span className="px-2.5 py-1 bg-[#faf6f0] text-gray-700 text-xs font-semibold rounded-lg border border-[#ebdccd]">
                          {story.city}
                        </span>
                      )}

                      {story.village && (
                        <span className="px-2.5 py-1 bg-[#faf6f0] text-gray-700 text-xs font-semibold rounded-lg border border-[#ebdccd]">
                          قرية {story.village}
                        </span>
                      )}

                      {story.verificationStatus === 'verified' && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>توثيق معتمد</span>
                        </span>
                      )}

                      {story.historyAge && (
                        <span className="text-xs text-gray-500 font-medium">| {story.historyAge}</span>
                      )}
                    </div>

                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-heritage">
                        {story.title}
                      </h2>
                      {story.subtitle && (
                        <p className="text-sm font-bold text-[#8c6b53] mt-1">{story.subtitle}</p>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {story.description}
                    </p>

                    {/* Natural Materials list if present */}
                    {story.materials && story.materials.length > 0 && (
                      <div className="pt-1">
                        <h4 className="text-xs font-bold text-[#943310] mb-1.5 flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" />
                          <span>الخامات الطبيعية والبيئية المستخدمة:</span>
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {story.materials.map((mat, mIdx) => (
                            <span
                              key={mIdx}
                              className="px-2.5 py-1 bg-[#faf6f0] text-gray-800 text-[11px] font-medium rounded-lg border border-[#ebdccd]"
                            >
                              {mat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Steps / Techniques list */}
                    {stepsOrTechniques.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <h4 className="text-xs font-bold text-[#943310]">أسرار ومراحل الصنعة المتوارثة:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {stepsOrTechniques.map((step, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2.5 bg-[#faf6f0] rounded-xl border border-[#ebdccd] text-[11px] text-gray-800 flex items-start gap-2"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="leading-snug">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Historical Sources if present */}
                    {story.sources && story.sources.length > 0 && (
                      <div className="pt-2 text-[11px] text-gray-500 border-t border-[#ebdccd]">
                        <span className="font-bold text-gray-700 ml-1">المراجع والمصادر:</span>
                        <div className="inline-flex flex-wrap gap-2 mt-1">
                          {story.sources.map((src, srcIdx) => (
                            <span key={srcIdx} className="inline-flex items-center gap-1">
                              {src.sourceUrl ? (
                                <a
                                  href={src.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#943310] hover:underline inline-flex items-center gap-0.5"
                                >
                                  <span>{src.sourceName || src.sourceUrl}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : (
                                <span>{src.sourceName}</span>
                              )}
                              {srcIdx < (story.sources?.length || 1) - 1 && <span>•</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action button to shop products */}
                    <div className="pt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (story.categoryId) {
                            setSelectedCategoryFilter(story.categoryId);
                          }
                          setActivePage('products');
                        }}
                        className="w-full sm:w-auto px-6 py-3 bg-[#943310] hover:bg-[#7c280a] text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center justify-center gap-2 transition-all hover:scale-[1.01] min-h-[44px] cursor-pointer"
                      >
                        <span>تصفح قطع ومنتجات {story.title.split('(')[0]}</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
};
