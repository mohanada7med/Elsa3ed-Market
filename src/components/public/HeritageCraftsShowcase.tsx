import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, MapPin, ArrowLeft, CheckCircle2, Heart, Award, Shield } from 'lucide-react';
import { CraftStory } from '../../types.ts';
import { api } from '../../services/api.ts';

export const HeritageCraftsShowcase: React.FC = () => {
  const { navigateToCategory, setSelectedCategoryFilter, setActivePage } = useApp();
  const [crafts, setCrafts] = useState<CraftStory[]>([]);
  const [selectedCraftIndex, setSelectedCraftIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchStories = async () => {
      try {
        setIsLoading(true);
        const data = await api.getPublicCraftStories();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCrafts(data);
        }
      } catch (err) {
        console.warn('[HeritageCraftsShowcase] Could not fetch craft stories from API:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchStories();
    return () => {
      isMounted = false;
    };
  }, []);

  const craft = crafts[selectedCraftIndex] || crafts[0] || null;
  if (!craft || crafts.length === 0) {
    return null;
  }

  return (
    <section className="py-14 bg-[#f3eadc] border-y border-[#ebdccd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#943310]/10 text-[#943310] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>أطلس الحرف التراثية في صعيد مصر</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 font-heritage">
            قصص الصنعة وأسرار الأجداد
          </h2>
          <p className="text-xs sm:text-sm text-[#7a5e4a] mt-2 leading-relaxed">
            تعرف على عراقة كل حرفة وموطنها في محافظات الصعيد، والسر وراء بقائها رمزاً للهوية المصرية لأكثر من آلاف السنين
          </p>
        </div>

        {/* Craft Selector Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-6 sm:mb-8 no-scrollbar px-1">
          {crafts.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              id={`craft-tab-${item.id}`}
              onClick={() => setSelectedCraftIndex(idx)}
              className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 sm:gap-2 min-h-[42px] ${
                selectedCraftIndex === idx
                  ? 'bg-[#943310] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-[#ede0ca] border border-[#ebdccd]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 opacity-80 shrink-0" />
              <span>{item.governorate}</span>
              <span className="opacity-40">|</span>
              <span className="truncate max-w-[140px] sm:max-w-none">{item.title.split('(')[0]}</span>
            </button>
          ))}
        </div>

        {/* Featured Craft Interactive Card */}
        <div className="bg-white rounded-3xl border border-[#ebdccd] shadow-xl overflow-hidden p-4 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Image Column */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-amber-900/10 shadow-md">
                <img
                  src={craft.image}
                  alt={craft.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 right-3 text-white">
                  <span className="text-[11px] font-medium text-amber-300">عمر الحرفة التقديري:</span>
                  <p className="font-bold text-sm">{craft.historyAge}</p>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 space-y-5 text-right">
              <div>
                <span className="text-xs font-black text-[#943310] uppercase tracking-wider block mb-1">
                  محافظة {craft.governorate}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 font-heritage">
                  {craft.title}
                </h3>
                <p className="text-sm font-semibold text-[#8c6b53] mt-1">{craft.subtitle}</p>
              </div>

              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {craft.description}
              </p>

              {/* Key Features Bullet Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {craft.keyFeatures.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-800 bg-[#faf6f0] p-2.5 rounded-xl border border-[#ebdccd]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Action Button to browse products in this craft */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  id={`browse-craft-${craft.id}`}
                  onClick={() => {
                    setSelectedCategoryFilter(craft.categoryId);
                    setActivePage('products');
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-[#943310] hover:bg-[#7c280a] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] min-h-[44px]"
                >
                  <span>تسوق منتجات {craft.title.split('(')[0]}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
