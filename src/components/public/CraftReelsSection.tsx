import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { CraftReel } from '../../types.ts';
import { craftReelsService } from '../../services/craftReelsService.ts';
import { CraftReelsModal } from './CraftReelsModal.tsx';
import {
  Film,
  Play,
  ShoppingBag,
  ArrowLeft,
  Flame,
  Trash2,
  Sparkles,
  MapPin
} from 'lucide-react';
import { motion } from 'motion/react';

export const CraftReelsSection: React.FC = () => {
  const { setActivePage, addToCart, addToast, currentUser } = useApp();
  const [reels, setReels] = useState<CraftReel[]>([]);
  const [selectedReelId, setSelectedReelId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setReels(craftReelsService.getReels());
  }, []);

  const openReelModal = (reelId: string) => {
    setSelectedReelId(reelId);
    setIsModalOpen(true);
  };

  const handleAdminDeleteReel = async (e: React.MouseEvent, reel: CraftReel) => {
    e.stopPropagation();
    const confirmed = window.confirm(`هل أنت متأكد من حذف مقطع "${reel.title}" نهائياً؟`);
    if (!confirmed) return;

    try {
      await craftReelsService.deleteReelAsync(currentUser || { role: 'admin' }, reel.id);
      setReels((prev) => prev.filter((r) => r.id !== reel.id));
      addToast('تم حذف الفيديو', 'تم حذف الفيديو بنجاح من المنصة', 'info');
    } catch (err: any) {
      addToast('خطأ في الحذف', err?.message || 'فشل في الحذف', 'error');
    }
  };

  const handleQuickAdd = (e: React.MouseEvent, reel: CraftReel) => {
    e.stopPropagation();
    if (!reel.productId || !reel.productTitle || !reel.productPrice) return;
    addToCart(
      {
        id: reel.productId,
        title: reel.productTitle,
        price: reel.productPrice,
        originalPrice: reel.productOriginalPrice || reel.productPrice,
        images: reel.productImage ? [reel.productImage] : [],
        rating: reel.productRating || 5,
        reviewCount: 15,
        inStock: reel.inStock ?? true,
        stockCount: 10,
        categoryId: 'crafts',
        categoryName: reel.craftType || 'الصعيد',
        sellerId: reel.sellerId || '',
        sellerName: reel.workshopName || 'صانع صعيدي',
        sellerGovernorate: reel.governorate,
        description: reel.description || '',
        specifications: {
          material: reel.craftType || 'تراثي',
          originGovernorate: reel.governorate,
          craftsmanship: 'صناعة يدوية أصيلة'
        },
        tags: reel.hashtags || [],
        isHandmade: true,
        isHeritage: true,
        createdAt: reel.createdAt,
        approvalStatus: 'approved'
      },
      1
    );
    addToast('أُضيف إلى السلة', `تمت إضافة "${reel.productTitle}" لسلة مشترياتك`, 'success');
  };

  if (!reels.length) return null;

  return (
    <section
      dir="rtl"
      className="
        py-24
        bg-[#eee8dc] text-[#211d18]
        dark:bg-[#0b0b0a] dark:text-[#f5f0e7]
        transition-colors duration-500
        border-b border-black/10 dark:border-white/10
        relative overflow-hidden
      "
    >
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#9a6a35]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-black/10 dark:border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#9a6a35]/10 border border-[#9a6a35]/20 text-[#9a6a35] dark:text-amber-400 text-xs font-bold backdrop-blur-md mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>الصعيد في فيديو • شاهد، اكتشف، وعيش التجربة</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-serif tracking-tight">
                 الصعيد كما لم تره من قبل

              <span className="inline-block mt-2 text-[#9a6a35] dark:text-amber-400 font-black"> «ريلز وه» </span>
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setActivePage('reels')}
            className="group inline-flex items-center gap-2.5 text-sm font-bold text-white bg-[#9a6a35] hover:bg-[#744e26] dark:hover:bg-amber-600 px-6 py-3 rounded-2xl border border-black/10 dark:border-white/10 transition-all duration-300 shadow-md self-start md:self-auto cursor-pointer"
          >
            <span>استعراض كل الحكايات</span>
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </button>
        </div>

        {/* Cinematic Cards Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reels.map((reel) => (
            <motion.div
              key={reel.id}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              onClick={() => openReelModal(reel.id)}
              className="group relative bg-white/80 dark:bg-[#151513] rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 shadow-xl hover:shadow-2xl hover:border-[#9a6a35]/40 dark:hover:border-amber-500/40 transition-all duration-300 cursor-pointer flex flex-col backdrop-blur-md"
            >
              {/* Top Media Header / Video Thumbnail Preview */}
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <img
                  src={reel.posterUrl}
                  alt={reel.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

                {/* Play Button Center Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-[#9a6a35] transition-all shadow-lg">
                    <Play className="w-5 h-5 fill-white mr-0.5" />
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                  <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {reel.location || reel.governorate}
                  </span>

                  <div className="flex items-center gap-2">
                    {currentUser?.role === 'admin' && (
                      <button
                        type="button"
                        onClick={(e) => handleAdminDeleteReel(e, reel)}
                        className="p-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-transform active:scale-95"
                        title="حذف الفيديو"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="bg-[#9a6a35]/90 text-white text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <Flame className="w-3 h-3 text-amber-300" />
                      {reel.likesCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                {/* Category & Title */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-[#9a6a35] dark:text-amber-400 bg-[#9a6a35]/10 px-2.5 py-0.5 rounded-full">
                      {reel.contentType || reel.craftType || 'حكاية صعيدية'}
                    </span>
                    {reel.location && (
                      <span className="text-[10px] text-black/60 dark:text-white/60 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#9a6a35]" />
                        {reel.location}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-black dark:text-white line-clamp-1 group-hover:text-[#9a6a35] dark:group-hover:text-amber-300 transition-colors">
                    {reel.title}
                  </h3>
                  {reel.description && (
                    <p className="text-xs text-black/70 dark:text-white/60 line-clamp-2 leading-relaxed">
                      {reel.description}
                    </p>
                  )}
                </div>

                {/* Product Footer Bar (Only shown if product exists) */}
                {reel.productId && reel.productId !== 'none' && reel.productPrice && (
                  <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-black/50 dark:text-white/50 block">المنتج المرتبط</span>
                      <span className="text-sm font-black text-[#9a6a35] dark:text-amber-400">
                        {reel.productPrice} ج.م
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(e, reel)}
                      className="inline-flex items-center gap-2 bg-[#9a6a35] hover:bg-[#744e26] dark:hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>شراء المنتج</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Modal Popup */}
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