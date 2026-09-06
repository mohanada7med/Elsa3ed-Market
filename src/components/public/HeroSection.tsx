import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowLeft,
  Ship,
  Landmark,
  Hammer,
  BookOpen,
  ShoppingBag,
  Users,
  Utensils,
  MapPin,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { WAHPattern } from '../../design-system/WAHPattern';
import { WAHBadge } from '../../design-system/WAHBadge';

export const HeroSection: React.FC = () => {
  const { setActivePage } = useApp();

  return (
    <div className="relative bg-[var(--wah-background,#FAF7F2)] dark:bg-[var(--wah-background,#110E0C)] border-b border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] overflow-hidden transition-colors duration-300">
      {/* =========================================================================
          HERO CULTURAL BACKGROUND (باترن صعيدي تراثي خفيف وأنيق - للموبايل وكل الشاشات)
          Upper Egyptian Kilim & Tally Heritage Pattern with Ambient Radial Fade
         ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        {/* 1. Seamless Upper Egyptian Heritage Pattern (باترن التلي والكليم الصعيدي الأصيل) */}
        <div
          className="absolute inset-0 opacity-[0.10] dark:opacity-[0.15]"
          style={{
            maskImage: 'radial-gradient(ellipse 90% 80% at 50% 45%, black 40%, transparent 95%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 45%, black 40%, transparent 95%)'
          }}
        >
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="wahUpperEgyptHeritagePattern"
                width="48"
                height="48"
                patternUnits="userSpaceOnUse"
              >
                {/* Outer Kilim Diamond Grid (معينات الكليم الصعيدي) */}
                <path
                  d="M24 0 L48 24 L24 48 L0 24 Z"
                  fill="none"
                  stroke="var(--wah-primary, #B24C2B)"
                  strokeWidth="0.9"
                />
                {/* Inner Tally Diamond (معين التلي الأسيوطي المنقط) */}
                <path
                  d="M24 9 L39 24 L24 39 L9 24 Z"
                  fill="none"
                  stroke="var(--wah-accent, #D97724)"
                  strokeWidth="0.75"
                  strokeDasharray="2 3"
                />
                {/* Traditional Tally Metal Cross (علامة التلي التقليدية) */}
                <line x1="24" y1="16" x2="24" y2="32" stroke="var(--wah-secondary, #264653)" strokeWidth="0.8" />
                <line x1="16" y1="24" x2="32" y2="24" stroke="var(--wah-secondary, #264653)" strokeWidth="0.8" />
                {/* Interlocking Nubian Corner Chevron Ticks (أركان الشرفات النوبية) */}
                <path
                  d="M0 0 L6 6 M48 0 L42 6 M0 48 L6 42 M48 48 L42 42"
                  stroke="var(--wah-primary, #B24C2B)"
                  strokeWidth="0.65"
                />
              </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#wahUpperEgyptHeritagePattern)" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">

          {/* Main Hero Narrative */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6 text-right"
          >
            {/* Cultural Identity Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="inline-flex items-center gap-2"
            >
              <WAHBadge
                variant="terracotta"
                size="md"
                icon={<Sparkles className="w-3.5 h-3.5 text-[var(--wah-primary,#B24C2B)] animate-pulse" />}
              >
                «وه — كل حكاية ليها أصل في الصعيد»
              </WAHBadge>
            </motion.div>

            {/* Display Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.45 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] font-heritage leading-[1.18] tracking-tight"
            >
              منصة <span className="text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)]">«وه»</span> <br className="hidden sm:inline" />
              العالم الرقمي لصعيد مصر
            </motion.h1>

            {/* Context Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
              className="text-sm sm:text-base lg:text-lg text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] leading-relaxed max-w-xl font-medium"
            >
              المنصة الرقمية الموثقة لاكتشاف والارتباط بصعيد مصر: محافظاته، صروحه المعمارية،
              صنائعه وأسرار ورشه الحية، مروياته الشفاهية، شيوخ الصنعة، طعامه التراثي، وسوقه المباشر من الورشة للبيت.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.45 }}
              className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2"
            >
              <motion.button
                type="button"
                id="hero-map-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePage('map')}
                aria-label="استكشاف رحلة محافظات صعيد مصر"
                className="btn-primary px-7 py-3.5 rounded-xl text-sm sm:text-base font-bold shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer min-h-[46px]"
              >
                <Ship className="w-5 h-5" />
                <span>رحلة محافظات الصعيد</span>
                <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
              </motion.button>

              <motion.button
                type="button"
                id="hero-places-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePage('places')}
                aria-label="استكشاف المعالم والتراث المعماري"
                className="btn-outline px-6 py-3.5 rounded-xl text-sm sm:text-base font-bold shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[46px]"
              >
                <Landmark className="w-5 h-5 text-[var(--wah-secondary,#264653)] dark:text-[var(--wah-secondary,#427B8C)]" />
                <span>المعالم والتراث</span>
              </motion.button>

              <motion.button
                type="button"
                id="hero-market-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePage('products')}
                aria-label="التسوق من سوق وه"
                className="btn-secondary px-6 py-3.5 rounded-xl text-sm sm:text-base font-bold shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[46px]"
              >
                <ShoppingBag className="w-5 h-5 text-[var(--wah-accent,#D97724)]" />
                <span>سوق وه الحرفي</span>
              </motion.button>
            </motion.div>

            {/* Quick Portal Navigation Chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="pt-3 flex items-center gap-2 flex-wrap"
            >
              <span className="text-xs font-bold text-[var(--wah-text-subtle,#9C8E80)]">بوابات التوثيق:</span>
              <button
                type="button"
                id="hero-chip-crafts"
                onClick={() => setActivePage('cultural-crafts')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[var(--wah-surface,#1B1613)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] hover:border-[var(--wah-primary,#B24C2B)] text-xs font-bold text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Hammer className="w-3.5 h-3.5 text-[var(--wah-primary,#B24C2B)]" />
                <span>موسوعة الحرف</span>
              </button>

              <button
                type="button"
                id="hero-chip-stories"
                onClick={() => setActivePage('stories')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[var(--wah-surface,#1B1613)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] hover:border-[var(--wah-primary,#B24C2B)] text-xs font-bold text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-[var(--wah-accent,#D97724)]" />
                <span>وه بيحكي (المرويات)</span>
              </button>

              <button
                type="button"
                id="hero-chip-people"
                onClick={() => setActivePage('people')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[var(--wah-surface,#1B1613)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] hover:border-[var(--wah-primary,#B24C2B)] text-xs font-bold text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Users className="w-3.5 h-3.5 text-[var(--wah-secondary,#264653)] dark:text-[var(--wah-secondary,#427B8C)]" />
                <span>ناس الصعيد</span>
              </button>

              <button
                type="button"
                id="hero-chip-food"
                onClick={() => setActivePage('food')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[var(--wah-surface,#1B1613)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] hover:border-[var(--wah-primary,#B24C2B)] text-xs font-bold text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Utensils className="w-3.5 h-3.5 text-[var(--wah-success,#286644)]" />
                <span>طعم الصعيد</span>
              </button>
            </motion.div>

            {/* Metrics Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="pt-6 border-t border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-xl"
            >
              <div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] block font-mono">10</span>
                <span className="text-[10px] sm:text-xs text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] font-bold leading-tight block">محافظات موثقة</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] block font-mono">+150</span>
                <span className="text-[10px] sm:text-xs text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] font-bold leading-tight block">معلم وموقع تراثي</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] block font-mono">+40</span>
                <span className="text-[10px] sm:text-xs text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] font-bold leading-tight block">حرفة وصنعة أصيلة</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] block font-mono">100%</span>
                <span className="text-[10px] sm:text-xs text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] font-bold leading-tight block">توثيق حي وميداني</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Visual Composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-5 relative mt-4 lg:mt-0"
          >
            <div className="relative mx-auto max-w-md">
              {/* Main Card with Editorial Shape */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="wah-card overflow-hidden shadow-xl bg-white dark:bg-[var(--wah-surface,#1B1613)] wah-shape-editorial border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)]"
              >
                <div className="relative overflow-hidden aspect-[4/3] sm:aspect-square">
                  <img
                    src="https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1000"
                    alt="معابد وصروح صعيد مصر التاريخية"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--wah-text,#241E1A)]/90 via-transparent to-black/20" />

                  {/* Photo overlay info */}
                  <div className="absolute bottom-4 right-4 left-4 text-right">
                    <span className="text-[11px] font-bold text-[var(--wah-accent-light,#FDF3E7)] bg-[var(--wah-text,#241E1A)]/60 px-2.5 py-1 rounded-md backdrop-blur-md inline-block mb-1">
                      صروح قنا الخالدة
                    </span>
                    <h3 className="text-base sm:text-lg font-bold font-heritage text-white leading-snug">
                      معبد دندرة — درة العمارة وسقف الأبراج السماوية
                    </h3>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-[var(--wah-surface,#1B1613)] flex items-center justify-between">
                  <span className="text-xs text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)]">
                    توثيق ميداني حصري لمنصة وه
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePage('places')}
                    className="text-xs font-bold text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>استكشف المعلم</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>

              {/* Floating Craft Badge */}
              <motion.div
                role="button"
                tabIndex={0}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                whileHover={{ scale: 1.05, y: -2 }}
                onClick={() => setActivePage('cultural-crafts')}
                className="absolute -bottom-4 sm:-bottom-5 right-2 sm:-right-4 bg-white dark:bg-[var(--wah-surface,#1B1613)] p-3 sm:p-3.5 rounded-2xl border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] shadow-lg max-w-[200px] sm:max-w-[240px] cursor-pointer hover:border-[var(--wah-primary,#B24C2B)] transition-all z-10"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200"
                    alt="فخار قنا"
                    className="w-11 h-11 rounded-xl object-cover border border-[var(--wah-border,#E5DDD3)] shrink-0"
                  />
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--wah-accent,#D97724)] font-bold block truncate">صنائع حية</span>
                    <span className="text-xs sm:text-sm font-black text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)]">فخار وخزف قنا</span>
                  </div>
                </div>
              </motion.div>

              {/* Geographic Strip */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="absolute -top-3 left-2 bg-[var(--wah-text,#241E1A)] text-white px-3 py-1.5 rounded-xl border border-[var(--wah-primary,#B24C2B)]/40 shadow-md flex items-center gap-1.5 z-10"
              >
                <MapPin className="w-3.5 h-3.5 text-[var(--wah-accent,#D97724)] shrink-0" />
                <span className="text-xs font-bold text-[var(--wah-accent-light,#FDF3E7)] font-heritage">
                  من الجيزة إلى أسوان
                </span>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
