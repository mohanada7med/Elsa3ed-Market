import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowLeft,
  Map,
  Compass,
  Landmark,
  Hammer,
  BookOpen,
  Film,
  ShoppingBag,
  Users,
  Utensils,
  MapPin
} from 'lucide-react';
import { motion } from 'motion/react';

export const HeroSection: React.FC = () => {
  const {
    setActivePage,
    setShowIntroVideo,
    navigateToGovernorate,
    isAuthenticated,
    currentRole,
    setIsAuthModalOpen,
    setAuthModalTab
  } = useApp();

  return (
    <div className="relative bg-[#FAF6F0] dark:bg-[#151210] border-b border-[#E8E1D9] dark:border-[#382E27] overflow-hidden">
      <div className="absolute inset-0 bg-heritage-pattern pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Main Hero Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6 text-right"
          >
            {/* Top Heritage Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B45F42]/10 border border-[#B45F42]/30 text-[#B45F42] dark:text-[#FF855D] text-xs sm:text-sm font-bold shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>«وه — كل حكاية ليها أصل»</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.45 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#2D2A26] dark:text-[#FAF6F2] font-serif leading-[1.2] tracking-tight"
            >
              منصة <span className="text-[#B45F42]">«وه»</span> <br className="hidden sm:inline" />
              العالم الرقمي لصعيد مصر
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
              className="text-sm sm:text-base lg:text-lg text-[#54493F] dark:text-[#B8ACA0] leading-relaxed max-w-xl font-medium"
            >
              المنصة الرقمية الجامعة لاكتشاف، توثيق، والارتباط بصعيد مصر: محافظاته، تراثه المعماري، صنائعه وأسرار ورشه، مروياته الشفاهية، شيوخ الصنعة، طعامه الأصيل، وسوقه المباشر من الورشة للبيت.
            </motion.p>

            {/* Clear Primary Actions */}
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
                aria-label="استكشاف خريطة صعيد مصر التفاعلية"
                className="w-full sm:w-auto px-7 sm:px-8 py-3.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-sm sm:text-base font-bold rounded-2xl shadow-md flex items-center justify-center gap-2.5 transition-colors cursor-pointer min-h-[46px]"
              >
                <Compass className="w-5 h-5" />
                <span>خريطة الصعيد التفاعلية</span>
                <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
              </motion.button>

              <motion.button
                type="button"
                id="hero-places-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePage('places')}
                aria-label="استكشاف المعالم والتراث المعماري"
                className="w-full sm:w-auto px-5 sm:px-6 py-3.5 bg-white dark:bg-[#1E1917] hover:bg-[#FAF6F0] dark:hover:bg-[#25201D] text-[#2D2A26] dark:text-[#FAF6F2] border-2 border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] text-sm sm:text-base font-bold rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[46px]"
              >
                <Landmark className="w-5 h-5 text-amber-700" />
                <span>المعالم والتراث</span>
              </motion.button>

              <motion.button
                type="button"
                id="hero-market-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePage('products')}
                aria-label="التسوق من سوق وه"
                className="w-full sm:w-auto px-5 sm:px-6 py-3.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800/50 text-sm sm:text-base font-bold rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[46px]"
              >
                <ShoppingBag className="w-5 h-5 text-amber-800 dark:text-amber-300" />
                <span>سوق وه الحرفي</span>
              </motion.button>
            </motion.div>

            {/* Quick Portal Navigation Chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="pt-4 flex items-center gap-2 flex-wrap"
            >
              <span className="text-xs font-bold text-[#7A6F64]">بوابات الاستكشاف:</span>
              <button
                onClick={() => setActivePage('cultural-crafts')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1917] border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Hammer className="w-3.5 h-3.5 text-[#B45F42]" />
                <span>موسوعة الحرف</span>
              </button>

              <button
                onClick={() => setActivePage('stories')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1917] border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>وه بيحكي (المرويات)</span>
              </button>

              <button
                onClick={() => setActivePage('people')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1917] border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>ناس الصعيد</span>
              </button>

              <button
                onClick={() => setActivePage('food')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1917] border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                <span>طعم الصعيد</span>
              </button>
            </motion.div>

            {/* Live Metrics Strip */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="pt-6 border-t border-[#E8E1D9] dark:border-[#382E27] grid grid-cols-4 gap-2 sm:gap-4 max-w-xl"
            >
              <div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#B45F42] block font-mono">10</span>
                <span className="text-[10px] sm:text-xs text-[#7A6F64] font-bold leading-tight block">محافظات موثقة</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#B45F42] block font-mono">+150</span>
                <span className="text-[10px] sm:text-xs text-[#7A6F64] font-bold leading-tight block">معلم وموقع تراثي</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#B45F42] block font-mono">+40</span>
                <span className="text-[10px] sm:text-xs text-[#7A6F64] font-bold leading-tight block">حرفة وصنعة أصيلة</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#B45F42] block font-mono">100%</span>
                <span className="text-[10px] sm:text-xs text-[#7A6F64] font-bold leading-tight block">توثيق حي وميداني</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Visual Collage */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-5 relative mt-4 lg:mt-0"
          >
            <div className="relative mx-auto max-w-md">
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="geometric-card overflow-hidden shadow-xl bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]"
              >
                <img
                  src="https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1000"
                  alt="معابد وصروح صعيد مصر التاريخية"
                  className="w-full h-72 sm:h-96 object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="p-4 bg-white dark:bg-[#1E1917] border-t border-[#E8E1D9] dark:border-[#382E27] flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold font-serif text-[#29221D] dark:text-[#FAF6F2]">
                      معبد دندرة — قنا
                    </h3>
                    <p className="text-xs text-[#7A6F64]">درة العمارة البطلمية وسقف الأبراج السماوية</p>
                  </div>
                  <button
                    onClick={() => setActivePage('map')}
                    className="px-3 py-1.5 rounded-xl bg-[#B45F42] text-white text-xs font-bold hover:bg-[#9E4F36] transition-colors cursor-pointer"
                  >
                    على الخريطة
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
                className="absolute -bottom-3 sm:-bottom-5 right-2 sm:-right-4 bg-white dark:bg-[#1E1917] p-3 sm:p-4 rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] shadow-lg max-w-[200px] sm:max-w-[240px] cursor-pointer hover:border-[#B45F42] transition-colors z-10"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200"
                    alt="فخار قنا"
                    className="w-12 h-12 rounded-xl object-cover border border-[#E8E1D9] shrink-0"
                  />
                  <div>
                    <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold block truncate">حرف وصنائع حية</span>
                    <span className="text-xs sm:text-sm font-black text-[#2D2A26] dark:text-[#FAF6F2]">فخار وخزف الصعيد</span>
                  </div>
                </div>
              </motion.div>

              {/* Floating Tag */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="absolute -top-3 left-2 bg-[#1A1614] text-white px-3 py-2 rounded-xl border border-[#B45F42]/40 shadow-md flex items-center gap-2 z-10"
              >
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-amber-100 font-serif">من الجيزة إلى أسوان</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
