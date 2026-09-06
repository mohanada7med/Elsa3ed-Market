import React from 'react';
import { useApp } from '../../context/AppContext';
import { Store, Star, MapPin, CheckCircle2, ArrowLeft } from 'lucide-react';
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
      eyebrow="حرفيو الصعيد وشيوخ الصنعة"
      title="الورش والتعاونيات الحرفية المعتمدة"
      subtitle="تعرف على صانعي الجمال واطلع على ورشهم وقصص كفاحهم المتوارثة في مدن وقرى الصعيد"
      pattern="geometry"
      action={
        <button
          type="button"
          id="view-all-sellers-btn"
          onClick={() => setActivePage('sellers')}
          className="text-xs sm:text-sm font-bold text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>عرض كافة الورش والحرفيين</span>
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
            className="wah-card overflow-hidden cursor-pointer group bg-white dark:bg-[var(--wah-surface,#1B1613)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] flex flex-col rounded-2xl"
          >
            {/* Cover Image */}
            <div className="relative h-32 w-full overflow-hidden bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)]">
              <img
                src={seller.coverImage}
                alt={seller.brandName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute top-2.5 right-2.5">
                <WAHBadge variant="terracotta" size="sm" icon={<MapPin className="w-3 h-3 text-white" />}>
                  محافظة {seller.governorate}
                </WAHBadge>
              </div>
            </div>

            {/* Avatar & Content */}
            <div className="p-5 pt-0 flex-1 flex flex-col justify-between relative bg-white dark:bg-[var(--wah-surface,#1B1613)]">
              <div>
                {/* Avatar Offset */}
                <div className="relative -mt-10 mb-3 flex items-end justify-between">
                  <div className="relative">
                    <img
                      src={seller.avatar}
                      alt={seller.name}
                      className="w-16 h-16 rounded-2xl object-cover border-3 border-white dark:border-[var(--wah-surface,#1B1613)] shadow-md"
                    />
                    {seller.verified && (
                      <div className="absolute -bottom-1 -left-1 bg-[var(--wah-success,#286644)] text-white rounded-full p-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] px-2.5 py-1 rounded-xl text-xs font-bold text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)]">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{seller.rating}</span>
                    <span className="text-[10px] text-[var(--wah-text-subtle,#9C8E80)] font-normal">
                      ({seller.salesCount} مبيعة)
                    </span>
                  </div>
                </div>

                {/* Seller Brand & Name */}
                <h3 className="font-bold text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] text-base group-hover:text-[var(--wah-primary,#B24C2B)] dark:group-hover:text-[var(--wah-primary,#E0633C)] transition-colors leading-tight">
                  {seller.brandName}
                </h3>
                <p className="text-xs text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] font-medium mt-0.5">
                  {seller.name}
                </p>

                <p className="text-xs text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] mt-2.5 line-clamp-2 leading-relaxed">
                  {seller.bio}
                </p>
              </div>

              {/* Footer info */}
              <div className="mt-4 pt-3 border-t border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] flex items-center justify-between text-xs">
                <span className="text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] font-bold bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)] px-2 py-0.5 rounded text-[11px]">
                  {seller.specialty}
                </span>
                <span className="text-[var(--wah-text-subtle,#9C8E80)] font-medium text-[11px]">
                  {seller.productsCount} منتجات معروضة
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </WAHSection>
  );
};
