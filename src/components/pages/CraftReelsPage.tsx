import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { CraftReel, Governorate } from '../../types.ts';
import { craftReelsService } from '../../services/craftReelsService.ts';
import { CraftReelsModal } from '../public/CraftReelsModal.tsx';
import { ReelUploadModal } from '../common/ReelUploadModal.tsx';
import {
  Film,
  Play,
  Heart,
  Eye,
  Share2,
  Sparkles,
  ShoppingBag,
  Store,
  Flame,
  Search,
  Filter,
  Layers,
  MapPin,
  Maximize2,
  ArrowLeft,
  BadgeCheck,
  Plus,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CraftReelsPage: React.FC = () => {
  const { setActivePage, addToCart, addToast, navigateToProduct, navigateToSeller, currentUser, sellerProducts } = useApp();

  const [reels, setReels] = useState<CraftReel[]>([]);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('all');
  const [selectedCraftType, setSelectedCraftType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReelId, setSelectedReelId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    setReels(craftReelsService.getReels());
  }, []);

  const governoratesList = ['قنا', 'سوهاج', 'الأقصر', 'أسوان', 'أسيوط'];
  const craftTypesList = [
    { id: 'all', label: 'كل الحرف' },
    { id: 'فخار', label: '🏺 فخار وخزف' },
    { id: 'كليم', label: '🧶 كليم وسجاد نول' },
    { id: 'نحاس', label: '✨ مشغولات نحاسية' },
    { id: 'خوص', label: '🌴 خوص وسعف نخيل' },
    { id: 'تلي', label: '🪡 تلي وتطريز فضة' },
    { id: 'خشب', label: '🪵 خراطة خشب سرسوع' }
  ];

  // Filtered Reels
  const filteredReels = useMemo(() => {
    return reels.filter((reel) => {
      const matchGov = selectedGovernorate === 'all' || reel.governorate === selectedGovernorate;
      const matchCraft =
        selectedCraftType === 'all' ||
        reel.craftType.toLowerCase().includes(selectedCraftType.toLowerCase()) ||
        reel.title.toLowerCase().includes(selectedCraftType.toLowerCase());
      const matchSearch =
        !searchQuery.trim() ||
        reel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reel.artisanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reel.workshopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reel.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchGov && matchCraft && matchSearch;
    });
  }, [reels, selectedGovernorate, selectedCraftType, searchQuery]);

  const openReelModal = (reelId: string) => {
    setSelectedReelId(reelId);
    setIsModalOpen(true);
  };

  const handleReelUploaded = (newReel: CraftReel) => {
    setReels(craftReelsService.getReels());
    addToast('تم نشر الفيديو بنجاح', `تمت إضافة مقطع "${newReel.title}" إلى Craft Reels`, 'success');
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
        reviewCount: 22,
        inStock: reel.inStock,
        stockCount: 15,
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
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1A1614] py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      {/* Top Breadcrumb & Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#2D2A26] via-[#3D352F] to-[#2D2A26] text-white p-6 sm:p-10 overflow-hidden shadow-xl border border-white/10">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B45F42]/20 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/15">
            <Film className="w-3.5 h-3.5" />
            <span>معرض مقاطع الحرفيين الصعيدية • Craft Reels</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-heritage tracking-tight leading-tight">
            استكشف حكايات وإبداعات الصنعة الصعيدية بالصوت والصورة
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            فيديوهات تفاعلية قصيرة (Reels) تسافر بك لقلب ورش قنا، سوهاج، أسوان، الأقصر، وأسيوط. شاهد دقة تشكيل الطين، وعقد خيوط النول، ونقش النحاس واشترِ القطعة مباشرة من صانعها!
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openReelModal(filteredReels[0]?.id || reels[0]?.id)}
              className="px-5 py-2.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>مشاهدة شاشة كاملة (Immersive Feed)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-950" />
              <span>إضافة فيديو لورشتك (Upload Reel)</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('sellers')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl backdrop-blur-xs border border-white/15 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>دليل الورش والحرفيين</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#261E19] rounded-2xl p-4 border border-[#E8E1D9] dark:border-[#382E27] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن أسطى، محافظة، أو حرفة..."
              className="w-full pl-3 pr-9 py-2 bg-[#FDFBF7] dark:bg-[#1A1614] border border-[#E8E1D9] dark:border-[#4A3E35] rounded-xl text-xs sm:text-sm outline-none focus:border-[#B45F42] text-[#2D2A26] dark:text-white"
            />
          </div>

          {/* Governorate Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-[#7A6F64] dark:text-[#A89F91] whitespace-nowrap flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#B45F42]" />
              المحافظة:
            </span>
            <select
              value={selectedGovernorate}
              onChange={(e) => setSelectedGovernorate(e.target.value)}
              className="w-full sm:w-44 px-3 py-2 bg-[#FDFBF7] dark:bg-[#1A1614] border border-[#E8E1D9] dark:border-[#4A3E35] rounded-xl text-xs outline-none focus:border-[#B45F42] font-medium text-[#2D2A26] dark:text-white cursor-pointer"
            >
              <option value="all">كل المحافظات</option>
              {governoratesList.map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Craft Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {craftTypesList.map((craft) => (
            <button
              key={craft.id}
              type="button"
              onClick={() => setSelectedCraftType(craft.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCraftType === craft.id
                  ? 'bg-[#B45F42] text-white shadow-xs'
                  : 'bg-[#F5EFE6] dark:bg-[#1A1614] text-[#7A6F64] dark:text-[#A89F91] hover:bg-[#E8E1D9] dark:hover:bg-[#382E27]'
              }`}
            >
              {craft.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reels Grid Feed */}
      {filteredReels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredReels.map((reel) => (
            <div
              key={reel.id}
              onClick={() => openReelModal(reel.id)}
              className="group bg-white dark:bg-[#261E19] rounded-3xl overflow-hidden border border-[#E8E1D9] dark:border-[#382E27] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              {/* 9:16 Video Thumbnail Container */}
              <div className="relative aspect-9/14 bg-black overflow-hidden">
                <img
                  src={reel.posterUrl}
                  alt={reel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

                {/* Top Badges */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                  <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                    {reel.duration}
                  </span>

                  <span className="bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    محافظة {reel.governorate}
                  </span>
                </div>

                {/* Center Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white mr-0.5" />
                  </div>
                </div>

                {/* Overlay Artisan Info */}
                <div className="absolute bottom-3 inset-x-3 z-10 flex items-center gap-2">
                  <img
                    src={reel.artisanAvatar}
                    alt={reel.artisanName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate drop-shadow-sm">
                      {reel.artisanName}
                    </p>
                    <p className="text-[10px] text-amber-200 truncate">
                      {reel.workshopName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer Details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#2D2A26] dark:text-[#FDFBF7] leading-snug line-clamp-2">
                    {reel.title}
                  </h3>
                  <p className="text-xs text-[#7A6F64] dark:text-[#A89F91] line-clamp-2 mt-1 leading-relaxed">
                    {reel.description}
                  </p>
                </div>

                {/* Bottom Product Bar */}
                <div className="pt-3 border-t border-[#E8E1D9] dark:border-[#382E27] flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#7A6F64] dark:text-[#A89F91] block">
                      المنتج المصنوع:
                    </span>
                    <span className="text-xs font-black text-[#B45F42] dark:text-[#E07A5F] block">
                      {reel.productPrice} ج.م
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(e, reel)}
                    className="px-3 py-1.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
                    title="شراء فوري"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>شراء</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#261E19] rounded-3xl p-12 text-center border border-[#E8E1D9] dark:border-[#382E27] space-y-3">
          <Film className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-[#2D2A26] dark:text-white">
            لا توجد فيديوهات مطابقة للبحث
          </h3>
          <p className="text-xs text-[#7A6F64] dark:text-gray-400">
            جرب اختيار محافظة أخرى أو إزالة كلمات البحث لاستعراض كافة مقاطع ورش الصعيد.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedGovernorate('all');
              setSelectedCraftType('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-[#B45F42] text-white text-xs font-bold rounded-xl"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      )}

      {/* Full-Screen Interactive Craft Reels Modal */}
      {selectedReelId && (
        <CraftReelsModal
          reels={filteredReels.length > 0 ? filteredReels : reels}
          initialReelId={selectedReelId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReelId(null);
          }}
        />
      )}

      {/* Upload Reel Modal */}
      <ReelUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleReelUploaded}
        sellerId={currentUser?.sellerId || currentUser?.id}
        sellerName={currentUser?.name || 'ورشة الحرف التراثية'}
        artisanName={currentUser?.name || 'حرفي صعيدي أصيل'}
        artisanAvatar={currentUser?.avatar}
        defaultGovernorate={(currentUser?.governorate as Governorate) || 'قنا'}
        sellerProducts={sellerProducts}
      />
    </div>
  );
};
