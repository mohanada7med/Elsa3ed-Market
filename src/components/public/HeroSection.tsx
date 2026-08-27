import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowLeft, Store, Film, MapPin, ShoppingBag } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setActivePage, setShowIntroVideo, setSelectedGovernorateFilter, isAuthenticated, currentRole, setIsAuthModalOpen, setAuthModalTab } = useApp();

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
      {/* Subtle Background Egyptian Clay Ambience */}
      <div className="absolute inset-0 bg-heritage-pattern pointer-events-none opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Main Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-right">
            {/* Top Heritage Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#B45F42]/10 border border-[#B45F42]/25 text-[#B45F42] text-xs sm:text-sm font-bold shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>اول منصه متخصصه لتجارة منتجات الصعيد الاصلية</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#2D2A26] font-heritage leading-[1.25] tracking-tight">
              سوق الصعيد.. <br className="hidden sm:inline" />
              <span className="text-[#B45F42]">من قلب الصعيد لحد بيتك</span>
            </h1>

            {/* Subheading (Clear Arabic Explanation) */}
            <p className="text-sm sm:text-base lg:text-lg text-[#54493F] leading-relaxed max-w-xl font-medium">
              تسوق روائع التراث الأصيل مباشرة من شيوخ الصنعة: فخار قنا المسامي، كليم أخميم اليدوي، تمور وكركديه أسوان البكر، وتلي أسيوط الفاخر. ندعم أكثر من 12 حرفي وعائلة منتجة في جنوب مصر.
            </p>

            {/* Clear Primary Actions */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              {/* Primary Action 1: Browse Marketplace */}
              <button
                type="button"
                id="hero-explore-btn"
                onClick={() => setActivePage('products')}
                className="px-7 sm:px-9 py-3.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-sm sm:text-base font-bold rounded-xl shadow-md flex items-center gap-2.5 transition-all transform active:scale-95"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>تصفح المنتجات</span>
                <ArrowLeft className="w-4 h-4 mr-1" />
              </button>

              {/* Primary Action 2: Sell Your Products */}
              <button
                type="button"
                id="hero-sell-btn"
                onClick={handleStartSelling}
                className="px-6 sm:px-8 py-3.5 bg-white hover:bg-[#F3EFE9] text-[#2D2A26] border-2 border-[#B45F42]/40 hover:border-[#B45F42] text-sm sm:text-base font-bold rounded-xl shadow-xs flex items-center gap-2.5 transition-all"
              >
                <Store className="w-5 h-5 text-amber-700" />
                <span>بيع منتجاتك معنا</span>
              </button>

              {/* Tertiary Documentary Button */}
              <button
                type="button"
                id="hero-intro-video-btn"
                onClick={() => setShowIntroVideo(true)}
                className="px-4 py-3 text-xs sm:text-sm text-[#7A6F64] hover:text-[#B45F42] font-bold flex items-center gap-1.5 transition-colors"
              >
                <Film className="w-4 h-4 text-amber-700" />
                <span>شاهد وثائقي الصعيد</span>
              </button>
            </div>

            {/* Live Metrics Strip (Readable fonts for older users) */}
            <div className="pt-6 border-t border-[#E8E1D9] grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-[#B45F42] block font-mono">+12</span>
                <span className="text-xs text-[#7A6F64] font-bold">ورشة وحرفي موثق</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-[#B45F42] block font-mono">100%</span>
                <span className="text-xs text-[#7A6F64] font-bold">خامات طبيعية وتراث أصيل</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-[#B45F42] block font-mono">27</span>
                <span className="text-xs text-[#7A6F64] font-bold">محافظة يشملها الشحن</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Collage */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              {/* Primary Large Card */}
              <div className="geometric-card overflow-hidden shadow-lg bg-white rounded-3xl border border-[#E8E1D9]">
                <img
                  src="https://res.cloudinary.com/kuana1nl/image/upload/v1787856920/%D9%81%D8%AE%D8%A7%D8%B1.jpg"
                  alt="فخار قنا وأسيوط التراثي"
                  className="w-full h-72 sm:h-80 object-cover"
                />
                <div className="p-4 sm:p-5 bg-white border-t border-[#E8E1D9]">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-100 text-[#B45F42] font-black text-xs px-3 py-1.5 rounded-xl border border-amber-200">
                      أصلي 100%
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary Floating Card */}
              <div
                onClick={() => {
                  setSelectedGovernorateFilter('أسيوط');
                  setActivePage('products');
                }}
                className="absolute -bottom-4 -right-4 bg-white p-3.5 rounded-2xl border border-[#E8E1D9] shadow-lg max-w-[220px] cursor-pointer hover:border-[#B45F42] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=150&q=80"
                    alt="كليم أخميم"
                    className="w-12 h-12 rounded-xl object-cover border border-[#E8E1D9]"
                  />
                  <div>
                    <span className="text-xs text-amber-800 font-bold block">فخار اسيوط</span>
                    <span className="text-sm font-black text-[#2D2A26]">اسيوط</span>
                  </div>
                </div>
              </div>

              {/* Third Floating Badge */}
              <div className="absolute -top-3 -left-3 bg-[#231F1C] text-white px-3.5 py-2 rounded-xl border border-[#B45F42]/40 shadow-md flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-100">صُنع بأيدي أهل الصعيد</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
