import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowLeft, Store, Film, MapPin, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

export const HeroSection: React.FC = () => {
  const {
    setActivePage,
    setShowIntroVideo,
    setSelectedGovernorateFilter,
    isAuthenticated,
    currentRole,
    setIsAuthModalOpen,
    setAuthModalTab
  } = useApp();

  const handleStartSelling = () => {
    if (isAuthenticated && currentRole === 'seller') {
      setActivePage('seller-dashboard');
    } else {
      setAuthModalTab('register');
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="relative bg-[#FDFBF7] border-b border-[#E8E1D9] overflow-hidden">
      <div className="absolute inset-0 bg-heritage-pattern pointer-events-none opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
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
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#B45F42]/10 border border-[#B45F42]/25 text-[#B45F42] text-xs sm:text-sm font-bold shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-amber-700 animate-pulse" />
              <span>اول منصه متخصصه لتجارة منتجات الصعيد الاصلية</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.45 }}
              className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#2D2A26] font-heritage leading-[1.25] tracking-tight"
            >
              سوق الصعيد.. <br className="hidden sm:inline" />
              <span className="text-[#B45F42]">من قلب الصعيد لحد بيتك</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
              className="text-xs sm:text-base lg:text-lg text-[#54493F] leading-relaxed max-w-xl font-medium"
            >
              تسوق روائع التراث الأصيل مباشرة من شيوخ الصنعة: فخار قنا المسامي، كليم أخميم اليدوي، تمور وكركديه أسوان البكر، وتلي أسيوط الفاخر. ندعم أكثر من 12 حرفي وعائلة منتجة في جنوب مصر.
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
                id="hero-explore-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePage('products')}
                aria-label="تصفح جميع المنتجات التراثية في سوق الصعيد"
                className="w-full sm:w-auto px-7 sm:px-9 py-3.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-sm sm:text-base font-bold rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-colors cursor-pointer min-h-[44px]"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>تصفح المنتجات</span>
                <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
              </motion.button>

              <motion.button
                type="button"
                id="hero-sell-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartSelling}
                aria-label="بيع منتجاتك معنا والانضمام كحرفي صعيدي"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 bg-white hover:bg-[#F3EFE9] text-[#2D2A26] border-2 border-[#B45F42]/40 hover:border-[#B45F42] text-sm sm:text-base font-bold rounded-xl shadow-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer min-h-[44px]"
              >
                <Store className="w-5 h-5 text-amber-700" />
                <span>بيع منتجاتك معنا</span>
              </motion.button>

              <motion.button
                type="button"
                id="hero-intro-video-btn"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowIntroVideo(true)}
                aria-label="مشاهدة الفيلم الوثائقي عن سوق الصعيد وأهل الحرف"
                className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm text-[#7A6F64] hover:text-[#B45F42] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[40px]"
              >
                <Film className="w-4 h-4 text-amber-700" />
                <span>شاهد وثائقي الصعيد</span>
              </motion.button>
            </motion.div>

            {/* Live Metrics Strip */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="pt-6 border-t border-[#E8E1D9] grid grid-cols-3 gap-2 sm:gap-4 max-w-lg"
            >
              <div className="transition-transform hover:-translate-y-0.5">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#B45F42] block font-mono">+12</span>
                <span className="text-[10px] sm:text-xs text-[#7A6F64] font-bold leading-tight block">ورشة وحرفي موثق</span>
              </div>
              <div className="transition-transform hover:-translate-y-0.5">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#B45F42] block font-mono">100%</span>
                <span className="text-[10px] sm:text-xs text-[#7A6F64] font-bold leading-tight block">خامات طبيعية وأصيلة</span>
              </div>
              <div className="transition-transform hover:-translate-y-0.5">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#B45F42] block font-mono">27</span>
                <span className="text-[10px] sm:text-xs text-[#7A6F64] font-bold leading-tight block">محافظة يشملها الشحن</span>
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
                className="geometric-card overflow-hidden shadow-lg bg-white rounded-3xl border border-[#E8E1D9]"
              >
                <img
                  src="https://res.cloudinary.com/kuana1nl/image/upload/v1787856920/%D9%81%D8%AE%D8%A7%D8%B1.jpg"
                  alt="فخار قنا وأسيوط التراثي الأصيل"
                  className="w-full h-64 sm:h-80 object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="p-3 sm:p-4 bg-white border-t border-[#E8E1D9]">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-100 text-[#B45F42] font-black text-xs px-3 py-1 rounded-xl border border-amber-200">
                      أصلي 100%
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                role="button"
                tabIndex={0}
                aria-label="تصفح منتجات فخار أسيوط"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedGovernorateFilter('أسيوط');
                    setActivePage('products');
                  }
                }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                whileHover={{ scale: 1.05, y: -2 }}
                onClick={() => {
                  setSelectedGovernorateFilter('أسيوط');
                  setActivePage('products');
                }}
                className="absolute -bottom-2 sm:-bottom-4 right-2 sm:-right-4 bg-white p-2.5 sm:p-3.5 rounded-2xl border border-[#E8E1D9] shadow-lg max-w-[170px] sm:max-w-[220px] cursor-pointer hover:border-[#B45F42] transition-colors z-10"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=150&q=80"
                    alt="كليم أخميم"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-[#E8E1D9] shrink-0"
                  />
                  <div>
                    <span className="text-[10px] sm:text-xs text-amber-800 font-bold block truncate">فخار اسيوط</span>
                    <span className="text-xs sm:text-sm font-black text-[#2D2A26]">اسيوط</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="absolute -top-2 sm:-top-3 left-2 sm:-left-3 bg-[#231F1C] text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-[#B45F42]/40 shadow-md flex items-center gap-1.5 sm:gap-2 z-10"
              >
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold text-amber-100">صُنع بأيدي أهل الصعيد</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
