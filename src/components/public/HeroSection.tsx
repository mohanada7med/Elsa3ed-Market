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
import { WAHBadge } from '../../design-system/WAHBadge';

export const HeroSection: React.FC = () => {
  const { setActivePage, wahStats } = useApp();

  return (
    <div
      dir="rtl"
      className="
        relative
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors duration-500
        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
        border-b border-black/10
        dark:border-white/10
        overflow-hidden
      "
    >
      {/* =========================================================================
          HERO CULTURAL BACKGROUND (باترن صعيدي تراثي خفيف وأنيق ومتوافق مع النايت مود)
         ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]"
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
                {/* معينات الكليم الصعيدي */}
                <path
                  d="M24 0 L48 24 L24 48 L0 24 Z"
                  fill="none"
                  stroke="#9a6a35"
                  strokeWidth="0.9"
                />
                {/* معين التلي الأسيوطي */}
                <path
                  d="M24 9 L39 24 L24 39 L9 24 Z"
                  fill="none"
                  stroke="#9a6a35"
                  strokeWidth="0.75"
                  strokeDasharray="2 3"
                />
                {/* خطوط التلي المعدنية */}
                <line x1="24" y1="16" x2="24" y2="32" stroke="#9a6a35" strokeWidth="0.8" />
                <line x1="16" y1="24" x2="32" y2="24" stroke="#9a6a35" strokeWidth="0.8" />
                {/* شرفات نوبية متقاطعة */}
                <path
                  d="M0 0 L6 6 M48 0 L42 6 M0 48 L6 42 M48 48 L42 42"
                  stroke="#9a6a35"
                  strokeWidth="0.65"
                />
              </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#wahUpperEgyptHeritagePattern)" />
          </svg>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">

          {/* النص والقصة التحريرية */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6 text-right"
          >
            {/* الشارة الهوياتية */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="inline-flex items-center gap-2"
            >
              <WAHBadge
                variant="terracotta"
                size="md"
                icon={<Sparkles className="w-3.5 h-3.5 text-[#9a6a35] animate-pulse" />}
              >
                «وه — كل حكاية ليها أصل في الصعيد»
              </WAHBadge>
            </motion.div>

            {/* العنوان الرئيسي */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.45 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black font-heritage leading-[1.18] tracking-tight"
            >
              منصة <span className="text-[#9a6a35]">«وه»</span> <br className="hidden sm:inline" />
              العالم الرقمي لصعيد مصر
            </motion.h1>

            {/* الوصف التعريفي */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
              className="text-sm sm:text-base lg:text-lg text-black/65 dark:text-white/65 leading-relaxed max-w-xl font-medium"
            >
              المنصة الرقمية الموثقة لاكتشاف والارتباط بصعيد مصر: محافظاته، صروحه المعمارية،
              صنائع وأسرار ورشه الحية، مروياته الشفاهية، شيوخ الصنعة، طعامه التراثي، وسوقه المباشر من الورشة للبيت.
            </motion.p>

            {/* أزرار الإجراءات الرئيسية */}
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
                className="px-7 py-3.5 rounded-xl text-sm sm:text-base font-bold shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer min-h-[46px] bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d]"
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
                className="px-6 py-3.5 rounded-xl text-sm sm:text-base font-bold shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[46px] border border-black/15 dark:border-white/15 bg-white/60 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Landmark className="w-5 h-5 text-[#9a6a35]" />
                <span>المعالم والتراث</span>
              </motion.button>

              <motion.button
                type="button"
                id="hero-market-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePage('products')}
                aria-label="التسوق من سوق وه"
                className="px-6 py-3.5 rounded-xl text-sm sm:text-base font-bold shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[46px] border border-black/15 dark:border-white/15 bg-white/60 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <ShoppingBag className="w-5 h-5 text-[#9a6a35]" />
                <span>سوق وه الحرفي</span>
              </motion.button>
            </motion.div>

            {/* بوابات التوثيق السريعة */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="pt-3 flex items-center gap-2 flex-wrap"
            >
              <span className="text-xs font-bold text-black/50 dark:text-white/50">بوابات التوثيق:</span>

              <button
                type="button"
                id="hero-chip-crafts"
                onClick={() => setActivePage('cultural-crafts')}
                className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-[#9a6a35] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Hammer className="w-3.5 h-3.5 text-[#9a6a35]" />
                <span>موسوعة الحرف</span>
              </button>

              <button
                type="button"
                id="hero-chip-stories"
                onClick={() => setActivePage('stories')}
                className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-[#9a6a35] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#9a6a35]" />
                <span>وه بيحكي (المرويات)</span>
              </button>

              <button
                type="button"
                id="hero-chip-people"
                onClick={() => setActivePage('people')}
                className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-[#9a6a35] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Users className="w-3.5 h-3.5 text-[#9a6a35]" />
                <span>ناس الصعيد</span>
              </button>

              <button
                type="button"
                id="hero-chip-food"
                onClick={() => setActivePage('food')}
                className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-[#9a6a35] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Utensils className="w-3.5 h-3.5 text-[#9a6a35]" />
                <span>طعم الصعيد</span>
              </button>
            </motion.div>

            {/* شريط الإحصائيات التوثيقية */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="pt-6 border-t border-black/10 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-xl"
            >
              <div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#9a6a35] block font-mono">
                  {wahStats?.governoratesCount ?? 8}
                </span>
                <span className="text-[10px] sm:text-xs text-black/55 dark:text-white/55 font-bold leading-tight block">محافظات موثقة</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#9a6a35] block font-mono">
                  {wahStats?.placesCount ?? 25}
                </span>
                <span className="text-[10px] sm:text-xs text-black/55 dark:text-white/55 font-bold leading-tight block">معلم وموقع تراثي</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#9a6a35] block font-mono">
                  {wahStats?.craftsCount ?? 8}
                </span>
                <span className="text-[10px] sm:text-xs text-black/55 dark:text-white/55 font-bold leading-tight block">حرفة وصنعة أصيلة</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#9a6a35] block font-mono">100%</span>
                <span className="text-[10px] sm:text-xs text-black/55 dark:text-white/55 font-bold leading-tight block">توثيق حي وميداني</span>
              </div>
            </motion.div>
          </motion.div>

          {/* المعرض البصري الجانبي */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-5 relative mt-4 lg:mt-0"
          >
            <div className="relative mx-auto max-w-md">
              {/* البطاقة البصرية الرئيسية */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden shadow-xl bg-white dark:bg-[#151513] border border-black/10 dark:border-white/10 rounded-3xl"
              >
                <div className="relative overflow-hidden aspect-[4/3] sm:aspect-square bg-stone-200 dark:bg-stone-900">
                  <img
                    src="https://res.cloudinary.com/kuana1nl/image/upload/v1788715194/WAH/heritage-places/dendera-temple/img_2330_1788715194855_ea88.jpg"
                    alt="معابد وصروح صعيد مصر التاريخية"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                  {/* تدرج لوني يحافظ على وضوح النص في الوضعين الفاتح والداكن */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                  {/* نصوص الصورة المعمارية */}
                  <div className="absolute bottom-4 right-4 left-4 text-right">
                    <span className="text-[11px] font-bold text-amber-200 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-md inline-block mb-1.5 border border-white/10">
                      صروح قنا الخالدة
                    </span>
                    <h3 className="text-base sm:text-lg font-bold font-heritage text-white leading-snug drop-shadow-sm">
                      معبد دندرة — درة العمارة وسقف الأبراج السماوية
                    </h3>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-[#151513] flex items-center justify-between">
                  <span className="text-xs text-black/55 dark:text-white/55">
                    العمارة البطلمية الفرعونية
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePage('places')}
                    className="text-xs font-bold text-[#9a6a35] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>استكشف المعلم</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>

              {/* شارة الحرفة العائمة */}
              <motion.div
                role="button"
                tabIndex={0}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                whileHover={{ scale: 1.04, y: -2 }}
                onClick={() => setActivePage('cultural-crafts')}
                className="absolute -bottom-4 sm:-bottom-5 right-2 sm:-right-4 bg-white dark:bg-[#1f1a17] p-3 sm:p-3.5 rounded-2xl border border-black/10 dark:border-white/10 shadow-xl max-w-[200px] sm:max-w-[240px] cursor-pointer hover:border-[#9a6a35] transition-all z-10 select-none"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://res.cloudinary.com/kuana1nl/image/upload/v1788789051/%D9%81%D8%AE%D8%A7%D8%B1%D8%B1%D8%B1%D8%B1.jpg"
                    alt="فخار قنا"
                    className="w-11 h-11 rounded-xl object-cover border border-black/10 dark:border-white/10 shrink-0"
                  />
                  <div className="text-right">
                    <span className="text-[10px] text-[#9a6a35] font-bold block truncate">فخار قنا</span>
                    <span className="text-xs sm:text-sm font-black text-black dark:text-white">صناعة يدوية</span>
                  </div>
                </div>
              </motion.div>

              {/* شريط النطاق الجغرافي العائم */}
              <motion.div
                whileHover={{ y: -3, scale: 1.04 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="absolute -top-3 left-2 bg-[#211d18] text-white px-3.5 py-1.5 rounded-xl border border-white/15 shadow-lg flex items-center gap-1.5 z-10 select-none"
              >
                <MapPin className="w-3.5 h-3.5 text-[#9a6a35] shrink-0" />
                <span className="text-xs font-bold text-amber-100 font-heritage">
                  من الفيوم إلى أسوان
                </span>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};