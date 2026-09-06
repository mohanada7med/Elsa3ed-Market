import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, MapPin, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { CraftStory } from '../../types';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { WAHSection } from '../../design-system/WAHSection';
import { WAHBadge } from '../../design-system/WAHBadge';

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
    <WAHSection
      id="heritage-crafts-showcase"
      eyebrow="أطلس الحرف التراثية في صعيد مصر"
      title="قصص الصنعة وأسرار الأجداد"
      subtitle="تعرف على عراقة كل حرفة وموطنها في محافظات الصعيد، والسر وراء بقائها رمزاً للهوية المصرية لأكثر من آلاف السنين"
      pattern="kilim"
      className="bg-[var(--wah-surface-subtle,#F3ECE2)]/50 dark:bg-[var(--wah-surface-subtle,#26201B)]/30 border-y border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)]"
    >
      {/* Craft Selector Tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-6 sm:mb-8 no-scrollbar px-1">
        {crafts.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            id={`craft-tab-${item.id}`}
            onClick={() => setSelectedCraftIndex(idx)}
            aria-label={`عرض قصة حرفة ${item.title} في محافظة ${item.governorate}`}
            aria-selected={selectedCraftIndex === idx}
            role="tab"
            className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 sm:gap-2 min-h-[42px] cursor-pointer ${
              selectedCraftIndex === idx
                ? 'bg-[var(--wah-primary,#B24C2B)] text-white shadow-md'
                : 'bg-white dark:bg-[var(--wah-surface,#1B1613)] text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] hover:bg-[var(--wah-surface-subtle,#F3ECE2)] dark:hover:bg-[var(--wah-surface-subtle,#26201B)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)]'
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
      <AnimatePresence mode="wait">
        <motion.div
          key={craft.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="wah-card bg-white dark:bg-[var(--wah-surface,#1B1613)] rounded-3xl border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] shadow-xl overflow-hidden p-5 sm:p-8 lg:p-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Image Column with Editorial Curve */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] shadow-md wah-shape-editorial">
                <img
                  src={craft.image}
                  alt={craft.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 right-3 text-white">
                  <span className="text-[11px] font-medium text-[var(--wah-accent-light,#FDF3E7)]">
                    عمر الحرفة التقديري:
                  </span>
                  <p className="font-bold text-sm text-white">{craft.historyAge}</p>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 space-y-5 text-right">
              <div>
                <WAHBadge variant="terracotta" size="sm" className="mb-2">
                  محافظة {craft.governorate}
                </WAHBadge>
                <h3 className="text-2xl sm:text-3xl font-black text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] font-heritage">
                  {craft.title}
                </h3>
                <p className="text-sm font-semibold text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] mt-1">
                  {craft.subtitle}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] leading-relaxed">
                {craft.description}
              </p>

              {/* Key Features Bullet Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {(craft.keyFeatures || []).map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] bg-[var(--wah-surface-subtle,#FAF7F2)] dark:bg-[var(--wah-surface-subtle,#26201B)] p-3 rounded-xl border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[var(--wah-success,#286644)] shrink-0 mt-0.5" />
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
                  aria-label={`تسوق منتجات ${craft.title.split('(')[0]} من محافظة ${craft.governorate}`}
                  className="btn-primary px-6 py-3 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <span>تسوق منتجات {craft.title.split('(')[0]}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </WAHSection>
  );
};
