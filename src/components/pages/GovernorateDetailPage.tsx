import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { WahGovernorate, HeritagePlace, CulturalCraft, WahStory, LocalPerson, UpperEgyptFood, CulturalEvent, Product } from '../../types';
import {
  MapPin,
  Compass,
  Landmark,
  Hammer,
  Utensils,
  BookOpen,
  Calendar,
  Users,
  ShoppingBag,
  ArrowLeft,
  Share2,
  Sparkles,
  ChevronLeft,
  ExternalLink,
  Store
} from 'lucide-react';

export const GovernorateDetailPage: React.FC = () => {
  const {
    selectedGovernorateSlug,
    navigateToGovernorate,
    navigateToPlace,
    navigateToCraft,
    navigateToStory,
    navigateToPerson,
    navigateToFood,
    navigateToEvent,
    navigateToProduct,
    setActivePage,
    addToast
  } = useApp();

  const [governorate, setGovernorate] = useState<WahGovernorate | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'places' | 'crafts' | 'stories' | 'people' | 'food' | 'events' | 'products'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  const slug = selectedGovernorateSlug || 'qena';

  useEffect(() => {
    const fetchGov = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getGovernorateBySlug(slug);
        if (data) {
          setGovernorate(data);
        }
      } catch (err) {
        console.warn('Could not load governorate details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGov();
  }, [slug]);

  const handleShare = () => {
    const url = `${window.location.origin}/governorates?slug=${encodeURIComponent(slug)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      addToast('تم نسخ الرابط', 'تم نسخ رابط المحافظة بنجاح، يمكنك مشاركته الآن', 'success');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#B45F42] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-[#7A6F64]">جاري تحميل موسوعة المحافظة...</p>
        </div>
      </div>
    );
  }

  if (!governorate) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">المحافظة غير موجودة</h2>
          <p className="text-sm text-[#7A6F64] mb-4">لم نعثر على بيانات لهذه المحافظة</p>
          <button
            onClick={() => setActivePage('governorates')}
            className="px-5 py-2.5 rounded-xl bg-[#B45F42] text-white font-bold text-sm"
          >
            العودة لكافة المحافظات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] text-[#29221D] dark:text-[#FAF6F2] font-sans pb-16">
      {/* Hero Header */}
      <div className="relative h-[320px] sm:h-[420px] lg:h-[480px] w-full bg-[#1A1614] overflow-hidden">
        <img
          src={governorate.coverImage || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1600'}
          alt={`محافظة ${governorate.name}`}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151210] via-black/40 to-transparent" />

        {/* Top Floating Bar */}
        <div className="absolute top-6 left-0 right-0 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActivePage('governorates')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>كافة المحافظات</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActivePage('map')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span className="hidden xs:inline">الخريطة التفاعلية</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title="مشاركة رابط المحافظة"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">مشاركة</span>
            </button>
          </div>
        </div>

        {/* Title Content */}
        <div className="absolute bottom-6 sm:bottom-10 right-0 left-0 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-600/90 text-white text-xs font-bold mb-3 backdrop-blur-xs">
            <MapPin className="w-3.5 h-3.5" />
            <span>العاصمة: {governorate.capitalCity || governorate.name}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-serif tracking-tight mb-2 drop-shadow-md">
            محافظة {governorate.name}
          </h1>

          <p className="text-sm sm:text-base text-amber-100/90 max-w-2xl leading-relaxed drop-shadow-sm">
            {governorate.shortIntro}
          </p>
        </div>
      </div>

      {/* Sticky Tab Navigation Bar */}
      <div className="sticky top-16 sm:top-20 z-30 bg-white/95 dark:bg-[#1E1917]/95 backdrop-blur-md border-b border-[#E8E1D9] dark:border-[#382E27] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5">
          {[
            { id: 'overview', label: 'نظرة عامة وتاريخ', icon: Landmark },
            { id: 'places', label: `المعالم التراثية (${governorate.places?.length || 0})`, icon: Landmark },
            { id: 'crafts', label: `الحرف التراثية (${governorate.crafts?.length || 0})`, icon: Hammer },
            { id: 'stories', label: `وه بيحكي (${governorate.stories?.length || 0})`, icon: BookOpen },
            { id: 'people', label: `ناس الصعيد (${governorate.people?.length || 0})`, icon: Users },
            { id: 'food', label: `أكل الصعيد (${governorate.foods?.length || 0})`, icon: Utensils },
            { id: 'events', label: `الفعاليات والمواسم (${governorate.events?.length || 0})`, icon: Calendar },
            { id: 'products', label: `سوق المحافظة (${governorate.products?.length || 0})`, icon: ShoppingBag }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#B45F42] text-white shadow-xs'
                    : 'text-[#665A4F] dark:text-[#A89C90] hover:bg-[#FAF6F0] dark:hover:bg-[#25201D]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tabbed Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12">
        {/* Tab 1: Overview & History */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              {/* History Text */}
              <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] dark:border-[#382E27]">
                <h2 className="text-xl sm:text-2xl font-black font-serif text-[#29221D] dark:text-[#FAF6F2] mb-4">
                  تاريخ وأصالة محافظة {governorate.name}
                </h2>
                <div className="text-sm sm:text-base text-[#665A4F] dark:text-[#A89C90] leading-relaxed space-y-4 whitespace-pre-line font-serif">
                  {governorate.history || governorate.shortIntro}
                </div>
              </div>

              {/* Cultural Traditions & Folk Customs */}
              {governorate.culturalTraditions && governorate.culturalTraditions.length > 0 && (
                <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] dark:border-[#382E27]">
                  <h3 className="text-lg sm:text-xl font-black font-serif text-[#29221D] dark:text-[#FAF6F2] mb-4">
                    عادات وتقاليد متوارثة
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {governorate.culturalTraditions.map((trad, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] text-xs sm:text-sm font-semibold flex items-center gap-2.5"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#B45F42]" />
                        <span>{trad}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Highlights */}
            <div className="lg:col-span-4 space-y-6">
              {/* Famous For Card */}
              <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 border border-[#E8E1D9] dark:border-[#382E27]">
                <h3 className="text-base font-bold mb-3 text-[#29221D] dark:text-[#FAF6F2]">
                  تشتهر المحافظة بـ:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {governorate.famousFor?.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800/40"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Links into sections */}
              <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 border border-[#E8E1D9] dark:border-[#382E27] space-y-3">
                <h3 className="text-base font-bold mb-1 text-[#29221D] dark:text-[#FAF6F2]">
                  استكشف تراث {governorate.name}
                </h3>
                <button
                  onClick={() => setActiveTab('places')}
                  className="w-full text-right p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#25201D] hover:bg-[#E8E1D9] text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span>أشهر المعالم والآثار</span>
                  <ArrowLeft className="w-3.5 h-3.5 text-[#B45F42]" />
                </button>
                <button
                  onClick={() => setActiveTab('crafts')}
                  className="w-full text-right p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#25201D] hover:bg-[#E8E1D9] text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span>الحرف والورش التاريخية</span>
                  <ArrowLeft className="w-3.5 h-3.5 text-[#B45F42]" />
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className="w-full text-right p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#25201D] hover:bg-[#E8E1D9] text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span>منتجات ورش {governorate.name} بالسوق</span>
                  <ArrowLeft className="w-3.5 h-3.5 text-[#B45F42]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Places */}
        {activeTab === 'places' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black font-serif">المعالم التراثية في {governorate.name}</h2>
                <p className="text-xs sm:text-sm text-[#7A6F64]">معالم فرعونية، قبطية، إسلامية وطبيعية موثقة</p>
              </div>
            </div>

            {(!governorate.places || governorate.places.length === 0) ? (
              <div className="text-center py-12 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
                <p className="text-sm text-[#7A6F64]">جاري استكمال توثيق معالم هذه المحافظة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {governorate.places.map((place) => (
                  <div
                    key={place.id}
                    onClick={() => navigateToPlace(place.slug)}
                    className="group bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={place.coverImage || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=600'}
                        alt={place.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                        {place.category}
                      </span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-[#B45F42] transition-colors mb-2">
                          {place.title}
                        </h3>
                        <p className="text-xs text-[#665A4F] dark:text-[#A89C90] line-clamp-2 leading-relaxed">
                          {place.shortDescription || place.description}
                        </p>
                      </div>
                      <div className="pt-4 mt-4 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center justify-between text-xs font-bold text-[#B45F42]">
                        <span>استكشف المعلم</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Crafts */}
        {activeTab === 'crafts' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black font-serif">حرف وورش {governorate.name}</h2>
                <p className="text-xs sm:text-sm text-[#7A6F64]">صناعات يدوية عريقة ورثها الأبناء عن الأجداد</p>
              </div>
            </div>

            {(!governorate.crafts || governorate.crafts.length === 0) ? (
              <div className="text-center py-12 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
                <p className="text-sm text-[#7A6F64]">جاري توثيق ورش وحرف هذه المحافظة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {governorate.crafts.map((craft) => (
                  <div
                    key={craft.id}
                    onClick={() => navigateToCraft(craft.slug)}
                    className="group bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={craft.coverImage || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600'}
                        alt={craft.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-600/90 text-white text-[11px] font-bold">
                        {craft.category}
                      </span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-[#B45F42] transition-colors mb-2">
                          {craft.title}
                        </h3>
                        <p className="text-xs text-[#665A4F] dark:text-[#A89C90] line-clamp-2 leading-relaxed mb-3">
                          {craft.shortDescription}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {craft.materials?.slice(0, 3).map((m, i) => (
                            <span key={i} className="text-[10px] bg-[#FAF6F0] dark:bg-[#25201D] px-2 py-0.5 rounded-md text-[#7A6F64]">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4 mt-4 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center justify-between text-xs font-bold text-[#B45F42]">
                        <span>أسرار الصنعة ومراحلها</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Stories */}
        {activeTab === 'stories' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black font-serif">وه بيحكي — حكايات {governorate.name}</h2>
                <p className="text-xs sm:text-sm text-[#7A6F64]">مرويات شعبية، أساطير النيل، وسير الصمود والحكمة</p>
              </div>
            </div>

            {(!governorate.stories || governorate.stories.length === 0) ? (
              <div className="text-center py-12 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
                <p className="text-sm text-[#7A6F64]">جاري جمع الحكايات الشفاهية من شيوخ المحافظة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {governorate.stories.map((story) => (
                  <div
                    key={story.id}
                    onClick={() => navigateToStory(story.slug)}
                    className="group bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                          {story.category}
                        </span>
                        {(story.narrator || story.authorName) && (
                          <span className="text-xs text-[#7A6F64]">راوي الحكاية: {story.narrator || story.authorName}</span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold font-serif group-hover:text-[#B45F42] transition-colors mb-2">
                        {story.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#665A4F] dark:text-[#A89C90] leading-relaxed line-clamp-3">
                        {story.excerpt || story.content}
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center justify-between text-xs font-bold text-[#B45F42]">
                      <span>اقرأ الحكاية كاملة</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: People */}
        {activeTab === 'people' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black font-serif">ناس {governorate.name}</h2>
                <p className="text-xs sm:text-sm text-[#7A6F64]">شيوخ الصنعة وحراس التراث ورموز الصعيد</p>
              </div>
            </div>

            {(!governorate.people || governorate.people.length === 0) ? (
              <div className="text-center py-12 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
                <p className="text-sm text-[#7A6F64]">جاري توثيق مسيرات شيوخ الصنعة في هذه المحافظة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {governorate.people.map((person) => (
                  <div
                    key={person.id}
                    onClick={() => navigateToPerson(person.slug)}
                    className="group bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={person.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}
                        alt={person.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-[#E8E1D9]"
                      />
                      <div>
                        <h3 className="text-base font-bold group-hover:text-[#B45F42] transition-colors">
                          {person.name}
                        </h3>
                        <p className="text-xs text-[#B45F42] font-semibold">{person.craftTitle}</p>
                        {person.yearsOfExperience && (
                          <p className="text-[11px] text-[#7A6F64]">{person.yearsOfExperience} عاماً من الخبرة</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-[#665A4F] dark:text-[#A89C90] line-clamp-3 leading-relaxed mb-4">
                      {person.bio}
                    </p>
                    <div className="pt-3 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center justify-between text-xs font-bold text-[#B45F42]">
                      <span>الملف الكامل والمقتنيات</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Food */}
        {activeTab === 'food' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black font-serif">طعم وأكلات {governorate.name}</h2>
                <p className="text-xs sm:text-sm text-[#7A6F64]">المذاق الصعيدي الأصيل ومخبوزات الفرن البلدي</p>
              </div>
            </div>

            {(!governorate.foods || governorate.foods.length === 0) ? (
              <div className="text-center py-12 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
                <p className="text-sm text-[#7A6F64]">جاري توثيق وصفات المطبخ الصعيدي لهذه المحافظة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {governorate.foods.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => navigateToFood(food.slug)}
                    className="group bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={food.coverImage || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600'}
                        alt={food.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-600/90 text-white text-[11px] font-bold">
                        {food.category}
                      </span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-[#B45F42] transition-colors mb-2">
                          {food.name}
                        </h3>
                        <p className="text-xs text-[#665A4F] dark:text-[#A89C90] line-clamp-2 leading-relaxed mb-3">
                          {food.story || food.description}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center justify-between text-xs font-bold text-[#B45F42]">
                        <span>الوصفة التراثية والمكونات</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Events */}
        {activeTab === 'events' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black font-serif">فعاليات ومواسم {governorate.name}</h2>
                <p className="text-xs sm:text-sm text-[#7A6F64]">الموالد الشعبية، مواسم الحصاد، ومعارض الحرف التراثية</p>
              </div>
            </div>

            {(!governorate.events || governorate.events.length === 0) ? (
              <div className="text-center py-12 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
                <p className="text-sm text-[#7A6F64]">لا توجد فعاليات مسجلة حالياً لهذه المحافظة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {governorate.events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => navigateToEvent(event.slug)}
                    className="group bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                          {event.category}
                        </span>
                        <span className="text-xs text-[#7A6F64] flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{event.timeOfYear || event.startDate}</span>
                        </span>
                      </div>
                      <h3 className="text-xl font-bold font-serif group-hover:text-[#B45F42] transition-colors mb-2">
                        {event.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#665A4F] dark:text-[#A89C90] leading-relaxed line-clamp-3">
                        {event.description}
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center justify-between text-xs font-bold text-[#B45F42]">
                      <span>تفاصيل الفعالية ومواعيدها</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 8: Marketplace Products from this Governorate */}
        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black font-serif">منتجات ورش {governorate.name}</h2>
                <p className="text-xs sm:text-sm text-[#7A6F64]">قطع فنية أصلية مشحونة مباشرة من أيادي صناع {governorate.name}</p>
              </div>
              <button
                onClick={() => setActivePage('products')}
                className="text-xs sm:text-sm font-bold text-[#B45F42] hover:underline"
              >
                تصفح كل منتجات سوق وه ←
              </button>
            </div>

            {(!governorate.products || governorate.products.length === 0) ? (
              <div className="text-center py-12 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
                <Store className="w-10 h-10 text-[#7A6F64] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#29221D] dark:text-[#FAF6F2]">لا توجد منتجات مسجلة حالياً لهذه المحافظة</p>
                <p className="text-xs text-[#7A6F64] mt-1">تصفح أقسام السوق الأخرى لاكتشاف خيرات الصعيد</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {governorate.products.map((prod: any) => (
                  <div
                    key={prod.id}
                    onClick={() => navigateToProduct(prod.id)}
                    className="group bg-white dark:bg-[#1E1917] rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#E8E1D9] dark:bg-[#25201D]">
                      <img
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400'}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <span className="text-[10px] text-[#B45F42] font-bold block mb-1">
                        {prod.categoryName || 'حرفة يدوية'}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-[#29221D] dark:text-[#FAF6F2] group-hover:text-[#B45F42] transition-colors truncate">
                        {prod.title}
                      </h3>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F0EAE1] dark:border-[#2D2622]">
                        <span className="text-xs sm:text-sm font-black text-[#B45F42]">
                          {prod.price} ج.م
                        </span>
                        <span className="text-[10px] text-[#7A6F64]">تفاصيل القطعة ←</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
