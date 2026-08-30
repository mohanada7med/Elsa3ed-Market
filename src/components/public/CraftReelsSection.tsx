import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { CraftReel } from '../../types.ts';
import { craftReelsService } from '../../services/craftReelsService.ts';
import { CraftReelsModal } from './CraftReelsModal.tsx';
import {
  Film,
  Play,
  Heart,
  Eye,
  Sparkles,
  ShoppingBag,
  ArrowLeft,
  Store,
  Flame,
  BadgeCheck,
  Compass
} from 'lucide-react';
import { motion } from 'motion/react';

export const CraftReelsSection: React.FC = () => {
  const { setActivePage, addToCart, addToast } = useApp();
  const [reels, setReels] = useState<CraftReel[]>([]);
  const [selectedReelId, setSelectedReelId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredReelId, setHoveredReelId] = useState<string | null>(null);

  useEffect(() => {
    setReels(craftReelsService.getReels());
  }, []);

  const openReelModal = (reelId: string) => {
    setSelectedReelId(reelId);
    setIsModalOpen(true);
  };

  const handleQuickAdd = (e: React.MouseEvent, reel: CraftReel) => {
    e.stopPropagation();
    addToCart(
      {
        id: reel.productId,
        title: reel.productTitle,
        price: reel.productPrice,
        originalPrice: reel.productOriginalPrice,
        images: [reel.productImage],
        rating: reel.productRating,
        reviewCount: 15,
        inStock: reel.inStock,
        stockCount: 10,
        categoryId: 'crafts',
        categoryName: reel.craftType,
        sellerId: reel.sellerId,
        sellerName: reel.workshopName,
        sellerGovernorate: reel.governorate,
        description: reel.description,
        specifications: {
          material: reel.craftType,
          originGovernorate: reel.governorate,
          craftsmanship: 'صناعة يدوية أصيلة'
        },
        tags: reel.hashtags,
        isHandmade: true,
        isHeritage: true,
        createdAt: reel.createdAt,
        approvalStatus: 'approved'
      },
      1
    );
    addToast('أُضيف إلى السلة', `تمت إضافة "${reel.productTitle}" لسلة مشترياتك`, 'success');
  };

  return (
    <section className="py-10 bg-gradient-to-b from-[#FDFBF7] via-[#F5EFE6] to-[#FDFBF7] dark:from-[#1A1614] dark:via-[#261E19] dark:to-[#1A1614] border-y border-[#E8E1D9] dark:border-[#382E27] relative overflow-hidden">
      {/* Decorative Heritage Watermark */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#B45F42]/5 rounded-full blur-3xl pointer-events-none -mr-48 -mt-48" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B45F42]/10 dark:bg-[#B45F42]/20 text-[#B45F42] dark:text-[#E07A5F] text-xs font-bold mb-2">
              <Film className="w-3.5 h-3.5" />
              <span>فيديوهات ورش الصعيد • Craft Reels</span>
              <span className="bg-[#B45F42] text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                جديد
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#2D2A26] dark:text-[#FDFBF7] font-heritage tracking-tight">
              شاهد الصنعة على أصولها واشترِ فوراً
            </h2>
            <p className="text-xs sm:text-sm text-[#7A6F64] dark:text-[#A89F91] mt-1 max-w-2xl">
              مقاطع حية من قلب ورش قنا وسوهاج وأسوان.. تابع أنامل الأسطوات على النول ودولاب الفخار مع إمكانية شراء القطعة المعروضة مباشرة.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActivePage('reels')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#2D2A26] hover:bg-[#FAF6F0] text-[#B45F42] dark:text-[#E07A5F] font-bold text-xs sm:text-sm rounded-xl border border-[#E8E1D9] dark:border-[#4A3E35] shadow-xs transition-all hover:shadow-md cursor-pointer self-start sm:self-auto"
          >
            <span>استعراض كل الفيديوهات</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Stories Avatars Bar (Circular Instagram Stories Style) */}
        <div className="flex items-center gap-4 overflow-x-auto pb-4 mb-6 scrollbar-none snap-x">
          {reels.map((reel) => (
            <button
              key={`story-${reel.id}`}
              type="button"
              onClick={() => openReelModal(reel.id)}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-hidden cursor-pointer"
            >
              {/* Pulsating Story Gradient Ring */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-[#B45F42] to-rose-500 group-hover:scale-105 transition-transform duration-200 shadow-md">
                <div className="w-full h-full rounded-full p-0.5 bg-white dark:bg-[#1A1614]">
                  <img
                    src={reel.artisanAvatar}
                    alt={reel.artisanName}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#2D2A26] dark:text-[#FDFBF7] text-center max-w-[76px] truncate">
                {reel.artisanName}
              </span>
              <span className="text-[9px] text-[#7A6F64] dark:text-[#A89F91] -mt-1">
                {reel.governorate}
              </span>
            </button>
          ))}
        </div>

        {/* 9:16 Video Reels Grid Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {reels.map((reel) => (
            <div
              key={reel.id}
              onClick={() => openReelModal(reel.id)}
              onMouseEnter={() => setHoveredReelId(reel.id)}
              onMouseLeave={() => setHoveredReelId(null)}
              className="group relative aspect-9/16 rounded-2xl overflow-hidden bg-black cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/10"
            >
              {/* Poster Image / Video Preview */}
              <img
                src={reel.posterUrl}
                alt={reel.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50 group-hover:via-black/20 transition-colors" />

              {/* Top Badges */}
              <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
                <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                  {reel.duration}
                </span>

                <div className="flex items-center gap-1 bg-[#B45F42]/80 backdrop-blur-xs text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  <Flame className="w-3 h-3 text-amber-300" />
                  <span>{reel.likesCount}</span>
                </div>
              </div>

              {/* Center Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-white mr-0.5" />
                </div>
              </div>

              {/* Bottom Information Card */}
              <div className="absolute bottom-0 inset-x-0 p-2.5 z-10 space-y-2">
                {/* Artisan Info */}
                <div className="flex items-center gap-1.5">
                  <img
                    src={reel.artisanAvatar}
                    alt={reel.artisanName}
                    className="w-5 h-5 rounded-full object-cover border border-white/40"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-white truncate drop-shadow-xs">
                      {reel.artisanName}
                    </p>
                  </div>
                </div>

                {/* Reel Title */}
                <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug drop-shadow-md">
                  {reel.title}
                </h3>

                {/* Product Quick Buy Bar */}
                <div className="pt-1 border-t border-white/15 flex items-center justify-between gap-1">
                  <div className="min-w-0">
                    <span className="text-[10px] text-amber-300 font-bold block truncate">
                      {reel.productPrice} ج.م
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(e, reel)}
                    className="p-1.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white rounded-lg transition-transform active:scale-90 shadow-md"
                    title="شراء فوري للمنتج"
                  >
                    <ShoppingBag className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-Screen Interactive Craft Reels Modal */}
      {selectedReelId && (
        <CraftReelsModal
          reels={reels}
          initialReelId={selectedReelId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReelId(null);
          }}
        />
      )}
    </section>
  );
};
