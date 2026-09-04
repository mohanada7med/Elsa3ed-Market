import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { WahGovernorate } from '../../types';
import {
  MapPin,
  Compass,
  Landmark,
  Hammer,
  Utensils,
  BookOpen,
  Calendar,
  ArrowLeft,
  Search,
  Sparkles,
  Layers,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const GovernoratesPage: React.FC = () => {
  const { navigateToGovernorate, setActivePage } = useApp();
  const [governorates, setGovernorates] = useState<WahGovernorate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'شمال الصعيد' | 'وسط الصعيد' | 'جنوب الصعيد'>('all');

  useEffect(() => {
    const fetchGovs = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getGovernorates();
        setGovernorates(data);
      } catch (err) {
        console.warn('Could not load governorates:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGovs();
  }, []);

  const getRegion = (name: string): 'شمال الصعيد' | 'وسط الصعيد' | 'جنوب الصعيد' => {
    if (['الفيوم', 'بني سويف'].includes(name)) return 'شمال الصعيد';
    if (['المنيا', 'أسيوط'].includes(name)) return 'وسط الصعيد';
    return 'جنوب الصعيد';
  };

  const filteredGovernorates = governorates.filter((gov) => {
    const matchesSearch =
      gov.name.includes(searchQuery) ||
      gov.shortIntro.includes(searchQuery) ||
      gov.famousFor.some((f) => f.includes(searchQuery));
    const region = getRegion(gov.name);
    const matchesRegion = regionFilter === 'all' || region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] text-[#29221D] dark:text-[#FAF6F2] py-6 sm:py-10 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#7A6F64] dark:text-[#9C8F82]">
            <button
              onClick={() => setActivePage('home')}
              className="hover:text-[#B45F42] transition-colors cursor-pointer"
            >
              الرئيسية
            </button>
            <span>/</span>
            <span className="text-[#B45F42] font-bold">محافظات صعيد مصر</span>
          </div>

          <button
            onClick={() => setActivePage('map')}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#B45F42] hover:text-[#9E4F36] bg-[#B45F42]/10 hover:bg-[#B45F42]/20 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>عرض الخريطة التفاعلية</span>
          </button>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold mb-3 border border-amber-300 dark:border-amber-800/40">
            <Landmark className="w-3.5 h-3.5" />
            <span>موسوعة صعيد مصر الرقمية</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#29221D] dark:text-[#FAF6F2] font-serif tracking-tight mb-3">
            محافظات صعيد مصر
          </h1>
          <p className="text-sm sm:text-base text-[#665A4F] dark:text-[#A89C90] leading-relaxed">
            ثماني محافظات عريقة تمتد على ضفاف النيل من الفيوم وبني سويف شمالاً حتى بلاد الذهب في أسوان جنوباً. لكل محافظة حكايتها وتاريخها وحرفتها التي تفردت بها عبر آلاف السنين.
          </p>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-white dark:bg-[#1E1917] rounded-2xl p-4 sm:p-5 border border-[#E8E1D9] dark:border-[#382E27] shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن محافظة، معلم، أو حرفة..."
              className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm text-[#29221D] dark:text-[#FAF6F2] rounded-xl pl-10 pr-4 py-2.5 border border-[#E8E1D9] dark:border-[#382E27] focus:border-[#B45F42] outline-none"
            />
            <Search className="w-4 h-4 text-[#7A6F64] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar">
            {(['all', 'شمال الصعيد', 'وسط الصعيد', 'جنوب الصعيد'] as const).map((region) => (
              <button
                key={region}
                onClick={() => setRegionFilter(region)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  regionFilter === region
                    ? 'bg-[#B45F42] text-white'
                    : 'bg-[#FAF6F0] dark:bg-[#25201D] text-[#665A4F] dark:text-[#A89C90] hover:bg-[#E8E1D9]'
                }`}
              >
                {region === 'all' ? 'كافة الأقاليم' : region}
              </button>
            ))}
          </div>
        </div>

        {/* Governorates Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 rounded-3xl bg-white dark:bg-[#1E1917] border border-[#E8E1D9] dark:border-[#382E27] animate-pulse"
              />
            ))}
          </div>
        ) : filteredGovernorates.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
            <Compass className="w-12 h-12 text-[#7A6F64] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#29221D] dark:text-[#FAF6F2]">لم يتم العثور على نتائج</h3>
            <p className="text-xs text-[#7A6F64] mt-1">جرب البحث بكلمات أخرى أو اختر إقليم مختلف</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredGovernorates.map((gov) => {
              const region = getRegion(gov.name);
              return (
                <div
                  key={gov.id}
                  id={`gov-card-${gov.slug}`}
                  onClick={() => navigateToGovernorate(gov.slug)}
                  className="group bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  {/* Image Cover & Badges */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#E8E1D9] dark:bg-[#25201D]">
                    <img
                      src={gov.coverImage || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800'}
                      alt={`محافظة ${gov.name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Region Pill */}
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                      {region}
                    </span>

                    {/* Capital Pill */}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-600/90 backdrop-blur-md text-white text-[11px] font-bold">
                      العاصمة: {gov.capitalCity || gov.name}
                    </span>

                    {/* Governorate Name Overlay */}
                    <div className="absolute bottom-3 right-3 left-3 text-white">
                      <h3 className="text-2xl font-black font-serif drop-shadow-md">
                        محافظة {gov.name}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Short Intro */}
                      <p className="text-xs sm:text-sm text-[#665A4F] dark:text-[#A89C90] leading-relaxed mb-4 line-clamp-2">
                        {gov.shortIntro}
                      </p>

                      {/* Famous For Chips */}
                      {gov.famousFor && gov.famousFor.length > 0 && (
                        <div className="mb-4">
                          <span className="text-[11px] font-bold text-[#7A6F64] dark:text-[#9C8F82] block mb-2">
                            تشتهر بـ:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {gov.famousFor.slice(0, 3).map((item, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] font-medium bg-[#FAF6F0] dark:bg-[#25201D] text-[#29221D] dark:text-[#FAF6F2] px-2.5 py-1 rounded-lg border border-[#E8E1D9] dark:border-[#382E27]"
                              >
                                {item}
                              </span>
                            ))}
                            {gov.famousFor.length > 3 && (
                              <span className="text-[10px] text-[#7A6F64] self-center">
                                +{gov.famousFor.length - 3} المزيد
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Drilldown CTA */}
                    <div className="pt-4 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center justify-between text-[#B45F42] dark:text-[#FF855D] font-bold text-xs sm:text-sm group-hover:text-[#9E4F36]">
                      <span className="group-hover:underline">استكشف موسوعة {gov.name}</span>
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
