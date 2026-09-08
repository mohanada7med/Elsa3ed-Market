import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { CraftStory } from '../../types';
import {
  Sparkles,
  MapPin,
  ArrowLeft,
  ArrowUpLeft,
  CheckCircle2,
  Hammer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WAHSection } from '../../design-system/WAHSection';

export const HeritageCraftsShowcase: React.FC = () => {
  const { setSelectedCategoryFilter, setActivePage } = useApp();
  const [crafts, setCrafts] = useState<CraftStory[]>([]);
  const [selectedCraftIndex, setSelectedCraftIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchStories = async () => {
      try {
        const data = await api.getPublicCraftStories();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCrafts(data);
        }
      } catch (err) {
        console.warn('[HeritageCraftsShowcase] Could not fetch craft stories:', err);
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
    <div
      dir="rtl"
      className="
        py-16
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors duration-500
        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
        max-w-[1600px]
        mx-auto
        px-5
        sm:px-8
        lg:px-12
      "
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#9a6a35] text-xs font-bold backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#9a6a35]" />
          <span>أطلس الحرف التراثية في صعيد مصر</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black font-serif tracking-tight">
          قصص الصنعة وأسرار الأجداد
        </h2>
        <p className="text-sm sm:text-base text-black/60 dark:text-white/60 leading-relaxed">
          تعرف على عراقة كل حرفة وموطنها في محافظات الصعيد، والسر وراء بقائها رمزاً للهوية المصرية لأكثر من آلاف السنين.
        </p>
      </div>

      {/* Craft Selector Tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar px-1">
        {crafts.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            id={`craft-tab-${item.id}`}
            onClick={() => setSelectedCraftIndex(idx)}
            aria-label={`عرض قصة حرفة ${item.title} في محافظة ${item.governorate}`}
            aria-selected={selectedCraftIndex === idx}
            role="tab"
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 min-h-[42px] cursor-pointer ${selectedCraftIndex === idx
              ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
              : 'bg-white/80 dark:bg-white/5 text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 backdrop-blur-xl'
              }`}
          >
            <MapPin className="w-3.5 h-3.5 opacity-80 shrink-0 text-[#9a6a35]" />
            <span>{item.governorate}</span>
            <span className="opacity-40">|</span>
            <span className="truncate max-w-[140px] sm:max-w-none">{item.title.split('(')[0]}</span>
          </button>
        ))}
      </div>

      {/* Featured Craft Interactive Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={craft.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="rounded-[2rem] bg-white/75 dark:bg-[#151513]/90 border border-black/10 dark:border-white/10 shadow-xl overflow-hidden p-6 sm:p-8 lg:p-10 backdrop-blur-2xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Image Column */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-4/3 rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 shadow-md">
                <img
                  src={craft.image}
                  alt={craft.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute bottom-4 right-4 text-white">
                  <span className="text-[11px] font-medium text-amber-200">
                    عمر الحرفة التقديري:
                  </span>
                  <p className="font-bold text-sm text-white">{craft.historyAge}</p>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 space-y-5 text-right">
              <div>
                <span className="inline-block px-3.5 py-1 rounded-full bg-[#9a6a35]/10 border border-[#9a6a35]/30 text-[#9a6a35] text-xs font-bold mb-2">
                  محافظة {craft.governorate}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#211d18] dark:text-[#f5f0e7] font-serif">
                  {craft.title}
                </h3>
                <p className="text-sm font-semibold text-black/60 dark:text-white/60 mt-1">
                  {craft.subtitle}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-black/75 dark:text-white/75 leading-relaxed">
                {craft.description}
              </p>

              {/* Key Features Bullet Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {(craft.keyFeatures || []).map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-[#211d18] dark:text-[#f5f0e7] bg-black/[0.03] dark:bg-white/[0.04] p-3 rounded-xl border border-black/10 dark:border-white/10"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  id={`browse-craft-${craft.id}`}
                  onClick={() => {
                    setSelectedCategoryFilter(craft.categoryId);
                    setActivePage('products');
                  }}
                  aria-label={`تسوق منتجات ${craft.title.split('(')[0]} من محافظة ${craft.governorate}`}
                  className="px-6 py-3.5 rounded-xl bg-[#211d18] text-white dark:bg-white dark:text-black text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] transition-colors min-h-[44px]"
                >
                  <span>تسوق منتجات {craft.title.split('(')[0]}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};