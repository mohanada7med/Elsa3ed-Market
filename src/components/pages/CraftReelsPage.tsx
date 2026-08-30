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
  Upload,
  ShieldAlert,
  LogIn,
  UserCheck,
  X,
  Lock,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CraftReelsPage: React.FC = () => {
  const {
    setActivePage,
    addToCart,
    addToast,
    navigateToProduct,
    navigateToSeller,
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthModalTab,
    sellerProducts,
    sellers
  } = useApp();

  const [reels, setReels] = useState<CraftReel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('all');
  const [selectedCraftType, setSelectedCraftType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReelId, setSelectedReelId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Permission Restriction Modal State
  const [permissionAlert, setPermissionAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'unauthenticated' | 'buyer';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'unauthenticated'
  });

  const loadReelsFromDb = async () => {
    setIsLoading(true);
    try {
      const dbReels = await craftReelsService.fetchReelsFromDb();
      setReels(dbReels);
    } catch {
      setReels(craftReelsService.getReels());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReelsFromDb();
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

  // Upload Permission Check (Blocks Guests and Buyers)
  const handleOpenUpload = () => {
    if (!isAuthenticated || !currentUser) {
      setPermissionAlert({
        isOpen: true,
        title: 'تسجيل الدخول مطلوب لنشر الفيديوهات',
        message: 'ميزة رفع ونشر فيديوهات الورش الحرفية (Craft Reels) مخصصة للحرفيين والبائعين المسجلين فقط. يرجى تسجيل الدخول بحساب بائعك أو إنشاء حساب جديد.',
        type: 'unauthenticated'
      });
      return;
    }

    if (currentUser.role === 'buyer') {
      setPermissionAlert({
        isOpen: true,
        title: 'خاص بالورش الحرفية والبائعين فقط',
        message: 'حسابك الحالي مسجل كـ "مشتري". لنشر مقاطع كواليس الصنعة الصعيدية وربطها بمنتجاتك، يرجى التقديم لفتح ورشة بائع معتمدة أو ترقية حسابك.',
        type: 'buyer'
      });
      return;
    }

    // Role is seller or admin -> Allowed
    setIsUploadModalOpen(true);
  };

  const handleReelUploaded = (newReel: CraftReel) => {
    loadReelsFromDb();
    addToast('تم نشر الفيديو بنجاح', `تم حفظ مقطع "${newReel.title}" في قاعدة البيانات وإتاحته للجمهور`, 'success');
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
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1A1614] py-4 sm:py-8 px-3 sm:px-6 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Top Breadcrumb & Hero Header */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#2D2A26] via-[#3D352F] to-[#2D2A26] text-white p-5 sm:p-8 md:p-10 overflow-hidden shadow-xl border border-white/10">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-[#B45F42]/20 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24 sm:-mr-32 sm:-mt-32" />

        <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-[11px] sm:text-xs font-bold border border-white/15">
            <Film className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span>معرض مقاطع الحرفيين الصعيدية • Craft Reels</span>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-black font-heritage tracking-tight leading-snug sm:leading-tight">
            استكشف حكايات وإبداعات الصنعة الصعيدية بالصوت والصورة
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl">
            فيديوهات تفاعلية قصيرة تسافر بك لقلب ورش قنا، سوهاج، أسوان، والأقصر. شاهد دقة تشكيل الطين، وعقد خيوط النول، ونقش النحاس واشترِ القطعة مباشرة من صانعها!
          </p>

          <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => openReelModal(filteredReels[0]?.id || reels[0]?.id)}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-[#B45F42] hover:bg-[#9E4F36] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer min-h-[44px]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>مشاهدة شاشة كاملة (Feed)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenUpload}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4 text-amber-950" />
              <span>إضافة فيديو لورشتك (Upload Reel)</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('sellers')}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl backdrop-blur-xs border border-white/15 flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>دليل الورش والحرفيين</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#261E19] rounded-2xl p-3.5 sm:p-4 border border-[#E8E1D9] dark:border-[#382E27] shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن أسطى، محافظة، أو حرفة..."
              className="w-full pl-3 pr-9 py-2.5 bg-[#FDFBF7] dark:bg-[#1A1614] border border-[#E8E1D9] dark:border-[#4A3E35] rounded-xl text-xs sm:text-sm outline-none focus:border-[#B45F42] text-[#2D2A26] dark:text-white"
            />
          </div>

          {/* Governorate Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-[#7A6F64] dark:text-[#A89F91] whitespace-nowrap flex items-center gap-1 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-[#B45F42]" />
              المحافظة:
            </span>
            <select
              value={selectedGovernorate}
              onChange={(e) => setSelectedGovernorate(e.target.value)}
              className="w-full sm:w-44 px-3 py-2.5 bg-[#FDFBF7] dark:bg-[#1A1614] border border-[#E8E1D9] dark:border-[#4A3E35] rounded-xl text-xs outline-none focus:border-[#B45F42] font-medium text-[#2D2A26] dark:text-white cursor-pointer"
            >
              <option value="all">كل المحافظات الصعيدية</option>
              {governoratesList.map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Craft Categories Pills (Horizontal Scroll) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-2 px-2 sm:mx-0 sm:px-0">
          {craftTypesList.map((craft) => (
            <button
              key={craft.id}
              type="button"
              onClick={() => setSelectedCraftType(craft.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[36px] ${
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {filteredReels.map((reel) => (
            <div
              key={reel.id}
              onClick={() => openReelModal(reel.id)}
              className="group bg-white dark:bg-[#261E19] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E8E1D9] dark:border-[#382E27] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
            >
              {/* 9:16 Video Thumbnail Container */}
              <div className="relative aspect-9/14 bg-black overflow-hidden">
                <img
                  src={reel.posterUrl}
                  alt={reel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" />

                {/* Top Badges */}
                <div className="absolute top-2.5 inset-x-2.5 sm:top-3 sm:inset-x-3 flex items-center justify-between z-10">
                  <span className="bg-black/60 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                    {reel.duration}
                  </span>

                  <span className="bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {reel.governorate}
                  </span>
                </div>

                {/* Center Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white mr-0.5" />
                  </div>
                </div>

                {/* Overlay Artisan Info */}
                <div className="absolute bottom-2.5 inset-x-2.5 sm:bottom-3 sm:inset-x-3 z-10 flex items-center gap-1.5 sm:gap-2">
                  <img
                    src={reel.artisanAvatar}
                    alt={reel.artisanName}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white shadow-md shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] sm:text-xs font-bold text-white truncate drop-shadow-sm">
                      {reel.artisanName}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-amber-200 truncate">
                      {reel.workshopName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer Details */}
              <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#2D2A26] dark:text-[#FDFBF7] leading-snug line-clamp-2">
                    {reel.title}
                  </h3>
                  <p className="hidden sm:block text-xs text-[#7A6F64] dark:text-[#A89F91] line-clamp-2 mt-1 leading-relaxed">
                    {reel.description}
                  </p>
                </div>

                {/* Bottom Product Bar */}
                <div className="pt-2 sm:pt-3 border-t border-[#E8E1D9] dark:border-[#382E27] flex items-center justify-between gap-1.5 sm:gap-2">
                  <div className="min-w-0">
                    <span className="text-[9px] sm:text-[10px] text-[#7A6F64] dark:text-[#A89F91] block truncate">
                      السعر:
                    </span>
                    <span className="text-xs sm:text-sm font-black text-[#B45F42] dark:text-[#E07A5F] block">
                      {reel.productPrice} ج.م
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(e, reel)}
                    className="px-2.5 sm:px-3 py-1.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-[11px] sm:text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0"
                    title="شراء فوري"
                  >
                    <ShoppingBag className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    <span>شراء</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#261E19] rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-[#E8E1D9] dark:border-[#382E27] space-y-3">
          <Film className="w-10 sm:w-12 h-10 sm:h-12 text-gray-400 mx-auto" />
          <h3 className="text-sm sm:text-base font-bold text-[#2D2A26] dark:text-white">
            لا توجد فيديوهات مطابقة للبحث
          </h3>
          <p className="text-xs text-[#7A6F64] dark:text-gray-400 max-w-md mx-auto">
            جرب اختيار محافظة أخرى أو إزالة كلمات البحث لاستعراض كافة مقاطع ورش الصعيد.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedGovernorate('all');
              setSelectedCraftType('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-[#B45F42] text-white text-xs font-bold rounded-xl cursor-pointer"
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

      {/* Upload Reel Modal (Accessible only to sellers and admin) */}
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
        currentUser={currentUser}
        allSellers={sellers}
      />

      {/* Permission Restriction Barrier Modal */}
      <AnimatePresence>
        {permissionAlert.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-[#201B18] rounded-3xl p-6 shadow-2xl border border-[#E8E1D9] dark:border-[#382E27] space-y-5 text-right"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/50 flex items-center justify-center text-amber-700 dark:text-amber-300">
                  <Lock className="w-6 h-6" />
                </div>
                <button
                  type="button"
                  onClick={() => setPermissionAlert((prev) => ({ ...prev, isOpen: false }))}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-[#2D2723] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-[#2D2A26] dark:text-[#FAF6F2] font-heritage">
                  {permissionAlert.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#7A6F64] dark:text-[#A89C90] leading-relaxed">
                  {permissionAlert.message}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {permissionAlert.type === 'unauthenticated' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setPermissionAlert((prev) => ({ ...prev, isOpen: false }));
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-2.5 px-4 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>تسجيل الدخول كبائع</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPermissionAlert((prev) => ({ ...prev, isOpen: false }));
                        setAuthModalTab('register');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-2.5 px-4 bg-[#F3EFE9] dark:bg-[#2D2723] text-[#2D2A26] dark:text-[#FAF6F2] hover:bg-[#E8E1D9] text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
                    >
                      <span>إنشاء حساب جديد</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setPermissionAlert((prev) => ({ ...prev, isOpen: false }));
                        setActivePage('sellers');
                      }}
                      className="w-full py-2.5 px-4 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Store className="w-4 h-4" />
                      <span>التقديم لفتح ورشة بائع</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPermissionAlert((prev) => ({ ...prev, isOpen: false }))}
                      className="w-full py-2.5 px-4 bg-[#F3EFE9] dark:bg-[#2D2723] text-[#2D2A26] dark:text-[#FAF6F2] hover:bg-[#E8E1D9] text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
                    >
                      <span>إلغاء</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

