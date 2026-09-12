import React from 'react';
import { useApp } from '../../context/AppContext';
import { Star, MapPin, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { WAHBadge } from '../../design-system/WAHBadge';

export const FeaturedSellers: React.FC = () => {
  const { sellers, navigateToSeller, setActivePage } = useApp();

  if (sellers.length === 0) {
    return null;
  }

  return (
    <section
      id="featured-sellers-section"
      dir="rtl"
      className="py-16 max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 text-[#211d18] dark:text-[#f5f0e7] select-none"
    >
      {/* Header Section بالتصميم التايبوغرافي المتناسق */}
      <div className="relative z-10 mb-12 sm:mb-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <div>
            {/* الشارة العلوية */}
            <div className="mb-6 flex items-center gap-3 text-[10px] font-black tracking-[0.28em] text-[#9a6a35] dark:text-[#d6aa72]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9a6a35]/10 dark:bg-[#d6aa72]/10">
                <Sparkles size={14} className="text-[#9a6a35] dark:text-[#d6aa72]" />
              </span>
              MASTERS / شيوخ الصنعة وحرفيين الصعيد
            </div>

            {/* العنوان التايبوغرافي الضخم */}
            <h2 className="font-heritage text-[14vw] font-black leading-[0.82] tracking-[-0.08em] sm:text-[11vw] lg:text-[7.5rem] xl:text-[8.5rem]">
              أهل
              <br />
              <span className="mr-[4vw] text-[#9a6a35] dark:text-[#d6aa72] lg:mr-16">
                الصنعة!
              </span>
            </h2>

            {/* الشرح والمؤشر الجانبي */}
            <div className="mt-8 grid max-w-3xl gap-6 sm:grid-cols-[80px_1fr] items-start">
              <div className="hidden sm:block">
                <div className="text-[10px] font-black tracking-[0.2em] text-black/40 dark:text-white/40">
                  فنانين وه
                </div>
                <div className="mt-3 h-px w-10 bg-[#9a6a35] dark:bg-[#d6aa72]" />
              </div>

              <p className="max-w-2xl text-sm font-medium leading-7 text-black/70 dark:text-white/70 sm:text-base sm:leading-8">
                اتعرف على أهل الصنعة، وشوف ورشهم واسمع حكايات شقاهم وتعبهم اللي اتوارثوها جيل ورا جيل في بلاد ونجوع الصعيد.
              </p>
            </div>
          </div>

          {/* زر التوجيه بستايل الكبسولة المتطابق */}
          <div className="lg:pb-3">
            <button
              type="button"
              id="view-all-sellers-btn"
              onClick={() => setActivePage('sellers')}
              className="inline-flex items-center gap-2.5 text-xs font-bold text-white bg-[#1a1713] hover:bg-[#9a6a35] dark:bg-zinc-800 dark:hover:bg-[#9a6a35] px-6 py-3.5 rounded-full transition-all duration-200 shadow-md active:scale-95 cursor-pointer"
            >
              <span>شوف كل الورش والحرفيين</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* بطاقات البائعين والورش */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.slice(0, 6).map((seller, idx) => (
          <motion.div
            key={seller.id}
            id={`seller-card-${seller.id}`}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.35, delay: (idx % 3) * 0.08 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => navigateToSeller(seller.id)}
            className="overflow-hidden cursor-pointer group bg-white/75 dark:bg-[#151513]/90 border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-lg flex flex-col rounded-[1.5rem] transition-all"
          >
            {/* Cover Image */}
            <div className="relative h-36 w-full overflow-hidden bg-black/5 dark:bg-white/5">
              <img
                src={seller.coverImage}
                alt={seller.brandName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute top-3 right-3">
                <WAHBadge variant="terracotta" size="sm" icon={<MapPin className="w-3 h-3 text-white" />}>
                  محافظة {seller.governorate}
                </WAHBadge>
              </div>
            </div>

            {/* Avatar & Content */}
            <div className="p-5 pt-0 flex-1 flex flex-col justify-between relative">
              <div>
                {/* Avatar Offset */}
                <div className="relative -mt-10 mb-3 flex items-end justify-between">
                  <div className="relative">
                    <img
                      src={seller.avatar}
                      alt={seller.name}
                      className="w-16 h-16 rounded-2xl object-cover border-3 border-white dark:border-[#151513] shadow-md"
                    />
                    {seller.verified && (
                      <div className="absolute -bottom-1 -left-1 bg-emerald-600 text-white rounded-full p-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-1 rounded-xl text-xs font-black text-[#211d18] dark:text-[#f5f0e7]">
                    <Star className="w-3.5 h-3.5  text-[#d6aa72]" />
                    <span>{seller.rating}</span>
                    <span className="text-[10px] text-black/50 dark:text-white/50 font-medium">
                      ({seller.salesCount} طلب متسلم)
                    </span>
                  </div>
                </div>

                {/* Seller Brand & Name */}
                <h3 className="font-black text-[#211d18] dark:text-[#f5f0e7] text-base group-hover:text-[#9a6a35] transition-colors leading-tight">
                  {seller.brandName}
                </h3>
                <p className="text-xs text-black/60 dark:text-white/60 font-medium mt-0.5">
                  {seller.name}
                </p>

                <p className="text-xs text-black/70 dark:text-white/70 mt-2.5 line-clamp-2 leading-relaxed">
                  {seller.bio}
                </p>
              </div>

              {/* Footer info */}
              <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
                <span className="text-[#9a6a35] font-black bg-[#9a6a35]/10 px-2.5 py-1 rounded-lg text-[11px]">
                  {seller.specialty}
                </span>
                <span className="text-black/50 dark:text-white/50 font-medium text-[11px]">
                  {seller.productsCount} قطعة معروضة
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedSellers;