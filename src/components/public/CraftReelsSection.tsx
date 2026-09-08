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
  Compass,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';

export const CraftReelsSection: React.FC = () => {
  const { setActivePage, addToCart, addToast, currentUser } = useApp();
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

  const handleAdminDeleteReel = async (e: React.MouseEvent, reel: CraftReel) => {
    e.stopPropagation();
    const confirmed = window.confirm(`هل أنت متأكد من حذف مقطع "${reel.title}" من ورشة "${reel.workshopName}" نهائياً من المنصة؟`);
    if (!confirmed) return;

    try {
      await craftReelsService.deleteReelAsync(currentUser || { role: 'admin' }, reel.id);
      setReels((prev) => prev.filter((r) => r.id !== reel.id));
      addToast('تم حذف الفيديو', `تم حذف فيديو "${reel.title}" بنجاح من المنصة وقاعدة البيانات`, 'info');
    } catch (err: any) {
      addToast('خطأ في الحذف', err?.message || 'فشل في حذف الفيديو', 'error');
    }
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
    <section
      dir="rtl"
      className="
        py-16
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors duration-500
        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
        border-b border-black/10
        dark:border-white/10
        relative
        overflow-hidden
      "
    >
      {/* Decorative Heritage Watermark */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#9a6a35]/5 rounded-full blur-3xl pointer-events-none -mr-48 -mt-48" />

      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#9a6a35] text-xs font-bold backdrop-blur-md shadow-sm mb-2">
              <Film className="w-3.5 h-3.5" />
              <span>وه Reels • مقاطع صناع الصعيد</span>
              <span className="bg-[#9a6a35] text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                جديد
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black font-serif tracking-tight">
              شاهد الصنعة على أصولها واشترِ فوراً
            </h2>
            <p className="text-sm sm:text-base text-black/60 dark:text-white/60 mt-1 max-w-2xl leading-relaxed">
              مقاطع حية من قلب ورش قنا وسوهاج وأسوان.. تابع أنامل الأسطوات على النول ودولاب الفخار مع إمكانية شراء القطعة المعروضة مباشرة.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActivePage('reels')}
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#9a6a35] hover:text-[#744e26] transition-colors py-2.5 px-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-md shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <span>استعراض كل الفيديوهات</span>
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </button>
        </div>

        {/* Stories Avatars Bar (Circular Instagram Stories Style) */}
        <div className="flex items-center gap-4 overflow-x-auto pb-4 mb-8 scrollbar-none snap-x">
          {reels.map((reel) => (
            <button
              key={`story-${reel.id}`}
              type="button"
              onClick={() => openReelModal(reel.id)}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-hidden cursor-pointer"
            >
              {/* Pulsating Story Gradient Ring */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-[#9a6a35] to-rose-500 group-hover:scale-105 transition-transform duration-200 shadow-md">
                <div className="w-full h-full rounded-full p-0.5 bg-white dark:bg-[#151513]">
                  <img
                    src={reel.artisanAvatar}
                    alt={reel.artisanName}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[11px] font-bold text-black dark:text-white text-center max-w-[76px] truncate">
                {reel.artisanName}
              </span>
              <span className="text-[9px] text-black/50 dark:text-white/50 -mt-1">
                {reel.governorate}
              </span>
            </button>
          ))}
        </div>

        {/* 9:16 Video Reels Grid Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {reels.map((reel) => (
            <div
              key={reel.id}
              onClick={() => openReelModal(reel.id)}
              onMouseEnter={() => setHoveredReelId(reel.id)}
              onMouseLeave={() => setHoveredReelId(null)}
              className="group relative aspect-9/16 rounded-[1.5rem] overflow-hidden bg-black cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 border border-black/10 dark:border-white/10"
            >
              {/* Poster Image / Video Preview */}
              <img
                src={reel.posterUrl}
                alt={reel.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/50 group-hover:via-black/20 transition-colors" />

              {/* Top Badges */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                  {reel.duration}
                </span>

                <div className="flex items-center gap-1.5">
                  {currentUser?.role === 'admin' && (
                    <button
                      type="button"
                      onClick={(e) => handleAdminDeleteReel(e, reel)}
                      className="p-1 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white border border-rose-400/50 shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                      title="حذف الفيديو بصلاحيات المدير"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <div className="flex items-center gap-1 bg-[#9a6a35]/85 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                    <Flame className="w-3 h-3 text-amber-300" />
                    <span>{reel.likesCount}</span>
                  </div>
                </div>
              </div>

              {/* Center Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                  <Play className="w-5 h-5 fill-white mr-0.5" />
                </div>
              </div>

              {/* Bottom Information Card */}
              <div className="absolute bottom-0 inset-x-0 p-3 z-10 space-y-2">
                {/* Artisan Info */}
                <div className="flex items-center gap-1.5">
                  <img
                    src={reel.artisanAvatar}
                    alt={reel.artisanName}
                    className="w-5 h-5 rounded-full object-cover border border-white/40 shadow-sm"
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
                <div className="pt-2 border-t border-white/20 flex items-center justify-between gap-1">
                  <div className="min-w-0">
                    <span className="text-[11px] text-amber-300 font-bold block truncate">
                      {reel.productPrice} ج.م
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(e, reel)}
                    className="p-1.5 bg-[#9a6a35] hover:bg-[#744e26] text-white rounded-xl transition-transform active:scale-90 shadow-md cursor-pointer"
                    title="شراء فوري للمنتج"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
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
          onDeleteReel={(deletedId) => {
            setReels((prev) => prev.filter((r) => r.id !== deletedId));
          }}
        />
      )}
    </section>
  );
};