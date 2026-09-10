import React from 'react';
import { useApp } from '../../context/AppContext';
import { Star, MapPin, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { WAHSection } from '../../design-system/WAHSection';
import { WAHBadge } from '../../design-system/WAHBadge';

export const FeaturedSellers: React.FC = () => {
  const { sellers, navigateToSeller, setActivePage } = useApp();

  if (sellers.length === 0) {
    return null;
  }

  return (
    <WAHSection
      id="featured-sellers-section"
      eyebrow="شيوخ الصنعة وحرفيين الصعيد"
      title="ورش ومعامل الصنعة الأصيلة"
      subtitle="اتعرف على أصحاب الصنعة وشوف ورشهم وحكايات كفاحهم المتوارثة في بلاد ونجوع الصعيد"
      pattern="geometry"
      action={
        <button
          type="button"
          id="view-all-sellers-btn"
          onClick={() => setActivePage('sellers')}
          className="text-xs sm:text-sm font-bold text-[#9a6a35] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>شوف كل الورش والحرفيين</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      }
    >
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
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
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
    </WAHSection>
  );
};

export default FeaturedSellers;
