import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  MapPin,
  ChevronRight,
  Film,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Layers,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Search
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
    <div
      dir="rtl"
      className="min-h-screen bg-[#eee8dc] text-[#211d18] dark:bg-[#0b0b0a] dark:text-[#f5f0e7] max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-8 space-y-10"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#211d18]/60 dark:text-[#f5f0e7]/60 font-medium">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#9a6a35] dark:hover:text-[#d5a56d] transition-colors cursor-pointer"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 opacity-50" />
        <span className="text-[#211d18] dark:text-[#f5f0e7] font-bold">حكايات صنعة الصعيد</span>
      </nav>

      {/* Hero Banner with Documentary CTA */}
      <div className="bg-[#211d18] text-[#f5f0e7] rounded-[2rem] p-6 sm:p-12 shadow-xl relative overflow-hidden border border-black/10 dark:border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#9a6a35]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9a6a35]/20 text-[#d5a56d] border border-[#9a6a35]/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#d5a56d]" />
            <span>صَنعة أهالينا وخير أرضنا</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-serif leading-tight">
            دليل حِرف وصنايع الصعيد.. من إيدين أصحابها
          </h1>

          <p className="text-xs sm:text-sm text-[#f5f0e7]/80 leading-relaxed">
            توثيق حي لحِرف الصعيد اللي لسه عايشة؛ بنكشف سر الصنعة، وخير الخامات اللي طالعة من أرضنا، وبنحكي عن شيوخ المهنة اللي شالوا السر وسلّموه جيل ورا جيل.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="crafts-watch-film-btn"
              onClick={() => setShowIntroVideo(true)}
              className="px-6 py-3.5 rounded-[1.25rem] bg-[#9a6a35] hover:bg-[#7d5427] text-white font-black text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Film className="w-4 h-4" />
              <span>اتفرج على الفيلم الوثائقي</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[1.5rem] border border-black/10 dark:border-white/10 p-4 sm:p-5 shadow-lg space-y-4 transition-colors">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#211d18]/50 dark:text-[#f5f0e7]/50 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="دوّر في أطلس الحرف بالاسم، المادة، القرية أو المحافظة..."
              className="w-full pl-3 pr-10 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[1rem] text-xs sm:text-sm text-[#211d18] dark:text-[#f5f0e7] placeholder-[#211d18]/40 dark:placeholder-[#f5f0e7]/40 focus:outline-none focus:border-[#9a6a35] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#211d18]/60 dark:text-[#f5f0e7]/60 hover:text-[#9a6a35] cursor-pointer"
              >
                مسح
              </button>
            )}
          </div>

          {/* Results count badge */}
          <div className="text-xs font-bold text-[#211d18]/80 dark:text-[#f5f0e7]/80 px-4 py-2.5 bg-black/5 dark:bg-white/5 rounded-[1rem] border border-black/10 dark:border-white/10 shrink-0 self-start md:self-auto flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#9a6a35] dark:text-[#d5a56d]" />
            <span>
              {isLoading
                ? 'جاري التحميل...'
                : `${filteredCrafts.length} ${filteredCrafts.length === 1 ? 'حرفة متوثقة' : 'حرف متوثقة'}`}
            </span>
          </div>
        </div>

        {/* Governorate Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[#211d18]/60 dark:text-[#f5f0e7]/60 font-bold shrink-0 ml-1">المحافظة:</span>
          {UPPER_EGYPT_GOVS.map((gov) => (
            <button
              key={gov}
              type="button"
              onClick={() => setSelectedGov(gov)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${selectedGov === gov
                  ? 'bg-[#9a6a35] text-white shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 text-[#211d18]/80 dark:text-[#f5f0e7]/80 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10'
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
              className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-10 animate-pulse space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 h-64 bg-black/5 dark:bg-white/5 rounded-2xl" />
                <div className="lg:col-span-7 space-y-4">
                  <div className="h-6 w-32 bg-black/5 dark:bg-white/5 rounded-lg" />
                  <div className="h-8 w-3/4 bg-black/5 dark:bg-white/5 rounded-lg" />
                  <div className="h-20 w-full bg-black/5 dark:bg-white/5 rounded-lg" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-10 bg-black/5 dark:bg-white/5 rounded-xl" />
                    <div className="h-10 bg-black/5 dark:bg-white/5 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCrafts.length === 0 ? (
        /* Honest Database-Only Empty State */
        <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-dashed border-black/20 dark:border-white/20 p-12 text-center max-w-2xl mx-auto space-y-4 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-[#9a6a35]/10 text-[#9a6a35] dark:text-[#d5a56d] flex items-center justify-center mx-auto border border-[#9a6a35]/20">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-serif">
            ملقيناش حرف مطابقة
          </h2>
          <p className="text-xs sm:text-sm text-[#211d18]/70 dark:text-[#f5f0e7]/70 leading-relaxed max-w-md mx-auto">
            {selectedGov !== 'الكل' || searchQuery
              ? 'جرّب غيّر كلمة البحث أو فضّي الفلاتر عشان تشوف كل الحرف والصنايع المتوثقة.'
              : 'بيتم توثيق الحرف التراثية وأسرار الصنعة الأصيلة أول بأول من قلب صعيد مصر.'}
          </p>
          {(selectedGov !== 'الكل' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedGov('الكل');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] text-xs font-bold rounded-xl border border-black/10 dark:border-white/10 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#9a6a35]" />
              <span>فضّي الفلاتر</span>
            </button>
          )}
        </div>
      ) : (
        /* Real Database Craft Records */
        <div className="space-y-10">
          {filteredCrafts.map((story, idx) => {
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
                className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 shadow-lg overflow-hidden p-6 sm:p-10 transition-colors"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Visual Side */}
                  <div className={`lg:col-span-5 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-4/3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
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
                        <div className="w-full h-full flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 text-[#9a6a35] dark:text-[#d5a56d] p-6 text-center">
                          <BookOpen className="w-12 h-12 opacity-60 mb-2" />
                          <span className="text-xs font-bold">{story.title}</span>
                          <span className="text-[10px] text-[#211d18]/50 dark:text-[#f5f0e7]/50 mt-1">{story.governorate}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                      <div className="absolute bottom-3 right-3 text-white">
                        <span className="text-[11px] text-[#d5a56d] font-bold block">الموطن التراثي:</span>
                        <span className="font-bold text-sm">{fullLocation || story.governorate}</span>
                      </div>

                      {story.historyAge && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-xs rounded-lg text-[#d5a56d] text-[10px] font-bold border border-white/10">
                          {story.historyAge}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Story Content */}
                  <div className={`lg:col-span-7 space-y-4 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d] text-xs font-bold rounded-lg border border-[#9a6a35]/30 inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{story.governorate}</span>
                      </span>

                      {story.city && (
                        <span className="px-2.5 py-1 bg-black/5 dark:bg-white/5 text-[#211d18] dark:text-[#f5f0e7] text-xs font-semibold rounded-lg border border-black/10 dark:border-white/10">
                          {story.city}
                        </span>
                      )}

                      {story.village && (
                        <span className="px-2.5 py-1 bg-black/5 dark:bg-white/5 text-[#211d18] dark:text-[#f5f0e7] text-xs font-semibold rounded-lg border border-black/10 dark:border-white/10">
                          قرية {story.village}
                        </span>
                      )}

                      {story.verificationStatus === 'verified' && (
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold rounded-lg border border-emerald-500/20 inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>توثيق معتمد</span>
                        </span>
                      )}

                      {story.historyAge && (
                        <span className="text-xs text-[#211d18]/50 dark:text-[#f5f0e7]/50 font-medium">| {story.historyAge}</span>
                      )}
                    </div>

                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-[#211d18] dark:text-[#f5f0e7] font-serif">
                        {story.title}
                      </h2>
                      {story.subtitle && (
                        <p className="text-sm font-bold text-[#9a6a35] dark:text-[#d5a56d] mt-1">{story.subtitle}</p>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-[#211d18]/80 dark:text-[#f5f0e7]/80 leading-relaxed whitespace-pre-line">
                      {story.description}
                    </p>

                    {/* Natural Materials list if present */}
                    {story.materials && story.materials.length > 0 && (
                      <div className="pt-1">
                        <h4 className="text-xs font-bold text-[#9a6a35] dark:text-[#d5a56d] mb-1.5 flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" />
                          <span>الخامات الطبيعية والبيئية المستخدمة:</span>
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {story.materials.map((mat, mIdx) => (
                            <span
                              key={mIdx}
                              className="px-2.5 py-1 bg-black/5 dark:bg-white/5 text-[#211d18] dark:text-[#f5f0e7] text-[11px] font-medium rounded-lg border border-black/10 dark:border-white/10"
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
                        <h4 className="text-xs font-bold text-[#9a6a35] dark:text-[#d5a56d]">أسرار ومراحل الصنعة المتوارثة:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {stepsOrTechniques.map((step, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 text-[11px] text-[#211d18] dark:text-[#f5f0e7] flex items-start gap-2"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-snug">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Historical Sources if present */}
                    {story.sources && story.sources.length > 0 && (
                      <div className="pt-2 text-[11px] text-[#211d18]/60 dark:text-[#f5f0e7]/60 border-t border-black/10 dark:border-white/10">
                        <span className="font-bold text-[#211d18] dark:text-[#f5f0e7] ml-1">المراجع والمصادر:</span>
                        <div className="inline-flex flex-wrap gap-2 mt-1">
                          {story.sources.map((src, srcIdx) => (
                            <span key={srcIdx} className="inline-flex items-center gap-1">
                              {src.sourceUrl ? (
                                <a
                                  href={src.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#9a6a35] dark:text-[#d5a56d] hover:underline inline-flex items-center gap-0.5"
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
                        className="w-full sm:w-auto px-6 py-3.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-black rounded-[1.25rem] shadow-lg inline-flex items-center justify-center gap-2 transition-all hover:scale-[1.01] min-h-[44px] cursor-pointer"
                      >
                        <span>شوف منتجات وقطع {story.title.split('(')[0]}</span>
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
