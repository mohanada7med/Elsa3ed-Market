import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { CraftReel } from '../../types.ts';
import { craftReelsService } from '../../services/craftReelsService.ts';
import { CraftReelsModal } from './CraftReelsModal.tsx';
import {
  Play,
  ShoppingBag,
  ArrowLeft,
  Flame,
  Trash2,
  MapPin,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

export const CraftReelsSection: React.FC = () => {
  const { setActivePage, addToCart, addToast, currentUser, confirmModal } = useApp();
  const [reels, setReels] = useState<CraftReel[]>([]);
  const [selectedReelId, setSelectedReelId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const data = craftReelsService.getReels();
    setReels(data);
  }, []);

  // تجهيز مسبق لرابط أول فيديو لتسريع الفتح الفوري
  // داخل CraftReelsSection.tsx
  const prefetchVideo = (videoUrl?: string) => {
    if (!videoUrl) return;
    // استخدام Link Preload يجبر المتصفح على بدء التنزيل فوراً في الكاش
    const existing = document.querySelector(`link[href="${videoUrl}"]`);
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'video';
      link.href = videoUrl;
      document.head.appendChild(link);
    }
  };

  const openReelModal = (reelId: string) => {
    setSelectedReelId(reelId);
    setIsModalOpen(true);
  };

  const handleAdminDeleteReel = (e: React.MouseEvent, reel: CraftReel) => {
    e.stopPropagation();
    confirmModal({
      title: 'حذف وثائقي الحرفة',
      message: `متأكد من رغبتك في حذف "${reel.title}" نهائياً؟`,
      confirmText: 'نعم، حذف الفيديو',
      danger: true,
      onConfirm: async () => {
        try {
          await craftReelsService.deleteReelAsync(currentUser || { role: 'admin' }, reel.id);
          setReels((prev) => prev.filter((r) => r.id !== reel.id));
          addToast('تم الحذف', 'تمت إزالة الفيديو بنجاح', 'info');
        } catch (err: any) {
          addToast('تعذر الحذف', err?.message || 'حدث خطأ أثناء الحذف', 'error');
        }
      }
    });
  };

  const handleQuickAdd = (e: React.MouseEvent, reel: CraftReel) => {
    e.stopPropagation();
    if (!reel.productId || !reel.productPrice) return;
    addToCart(
      {
        id: reel.productId,
        title: reel.productTitle || reel.title,
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
    addToast('أُضيفت للحقيبة', `تمت إضافة "${reel.productTitle || reel.title}"`, 'success');
  };

  if (!reels.length) return null;

  return (
    <section
      dir="rtl"
      // حشو سفلي أمان pb-32 لحل تداخل الـ Bottom Bar بالكامل
      className="pt-16 pb-32 sm:pb-36 bg-transparent text-[#211d18] dark:text-[#f5f0e7] relative select-none"
      style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-[#9a6a35]/20 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9a6a35]/10 border border-[#9a6a35]/30 text-[#9a6a35] dark:text-amber-400 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>الأرشيف التفاعلي الحي</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-serif tracking-tight">
              أسرار الصنعة
              <span className="mr-2 text-[#9a6a35] dark:text-amber-400">بكاميرا الحرفي</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setActivePage('reels')}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#1a1713] hover:bg-[#9a6a35] dark:bg-zinc-800 dark:hover:bg-[#9a6a35] px-5 py-3 rounded-full transition-all shadow-md self-start md:self-auto cursor-pointer"
          >
            <span>عرض كل الفيديوهات</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* عرض شبكي سينمائي بنسبة 9:16 مع تصميم عائم */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {reels.map((reel, idx) => (
            <motion.div
              key={reel.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -6, scale: 1.01 }}
              onMouseEnter={() => prefetchVideo(reel.videoUrl)}
              onTouchStart={() => prefetchVideo(reel.videoUrl)}
              onClick={() => openReelModal(reel.id)}
              className="group relative aspect-[9/16] rounded-3xl overflow-hidden bg-zinc-900 border border-black/10 dark:border-white/10 shadow-lg hover:shadow-2xl hover:border-[#9a6a35] transition-all duration-300 cursor-pointer"
            >
              {/* صورة الغلاف */}
              <img
                src={reel.posterUrl}
                alt={reel.title}
                loading={idx < 4 ? 'eager' : 'lazy'}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* تدرج لوني للنصوص والقراءة */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />

              {/* عناصر الجزء العلوي */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                <span className="bg-black/50 backdrop-blur-md text-amber-200 text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#d5a56d]" />
                  {reel.location || reel.governorate}
                </span>

                <div className="flex items-center gap-1.5">
                  {currentUser?.role === 'admin' && (
                    <button
                      type="button"
                      onClick={(e) => handleAdminDeleteReel(e, reel)}
                      className="p-1.5 rounded-full bg-rose-600/90 text-white backdrop-blur-md hover:bg-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="bg-black/50 backdrop-blur-md text-white text-[11px] font-bold px-2 py-1 rounded-full border border-white/10 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {reel.likesCount}
                  </span>
                </div>
              </div>

              {/* زر التشغيل الشفاف في المنتصف */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 group-hover:bg-[#9a6a35] transition-all duration-300">
                  <Play className="w-5 h-5 fill-current mr-0.5" />
                </div>
              </div>

              {/* الجزء السفلي العائم (معلومات المنتج والعنوان) */}
              <div className="absolute inset-x-0 bottom-0 p-3.5 z-10 flex flex-col justify-end space-y-2.5">
                <div>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/20 inline-block mb-1">
                    {reel.craftType || 'حرفة يدوية'}
                  </span>
                  <h3 className="text-white text-sm font-bold line-clamp-1 group-hover:text-amber-300 transition-colors">
                    {reel.title}
                  </h3>
                </div>

                {/* شراء سريع إذا وجد منتج */}
                {reel.productId && reel.productId !== 'none' && reel.productPrice && (
                  <div className="p-2 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-between gap-2">
                    <div className="truncate">
                      <span className="text-[10px] text-zinc-300 block truncate">{reel.productTitle || 'القطعة المعروضة'}</span>
                      <span className="text-xs font-black text-amber-400 font-mono">
                        {reel.productPrice} ج.م
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(e, reel)}
                      className="flex-shrink-0 bg-[#9a6a35] hover:bg-amber-600 text-white p-2 rounded-xl active:scale-95 transition-all cursor-pointer"
                      title="شراء فوري"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedReelId && (
        <CraftReelsModal
          reels={reels}
          initialReelId={selectedReelId}
          hasBottomNav={true}
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