import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { CraftReel, Governorate } from '../../types.ts';
import { craftReelsService } from '../../services/craftReelsService.ts';
import { CraftReelsModal } from '../public/CraftReelsModal.tsx';
import { ReelFeed } from '../public/reels/ReelFeed.tsx';
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
  ChevronLeft,
  Trash2,
  Grid,
  Tv
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
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>('grid');
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

  const handleAdminDeleteReel = async (e: React.MouseEvent, reel: CraftReel) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف مقطع "${reel.title}" من ورشة "${reel.workshopName}" نهائياً من المنصة بصفتك مديراً؟`
    );
    if (!confirmed) return;

    try {
      await craftReelsService.deleteReelAsync(currentUser || { role: 'admin' }, reel.id);
      setReels((prev) => prev.filter((r) => r.id !== reel.id));
      addToast('تم حذف الفيديو بنجاح', `تم حذف فيديو "${reel.title}" من المنصة وقاعدة البيانات`, 'info');
    } catch (err: any) {
      addToast('خطأ في الحذف', err?.message || 'فشل في حذف الفيديو', 'error');
    }
  };

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

  // Handle deep-link direct open of a specific reel
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const targetReelId =
      params.get('reel') ||
      params.get('reelId') ||
      sessionStorage.getItem('wah_selected_reel_id');

    if (targetReelId) {
      setSelectedReelId(targetReelId);
      setIsModalOpen(true);
      try {
        sessionStorage.removeItem('wah_selected_reel_id');
      } catch {}
    }
  }, [reels]);

  // Lock parent document scrolling when viewing reels in feed mode on mobile
  useEffect(() => {
    if (viewMode !== 'feed') return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    if (!isMobile) return;

    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, scrollY);
    };
  }, [viewMode]);

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
      const matchGov =
        selectedGovernorate === 'all' || reel.governorate === selectedGovernorate;
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
        message:
          'ميزة رفع ونشر فيديوهات الورش الحرفية (وه Reels) مخصصة للحرفيين والبائعين المسجلين فقط. يرجى تسجيل الدخول بحساب بائعك أو إنشاء حساب جديد.',
        type: 'unauthenticated'
      });
      return;
    }

    if (currentUser.role === 'buyer') {
      setPermissionAlert({
        isOpen: true,
        title: 'خاص بالورش الحرفية والبائعين فقط',
        message:
          'حسابك الحالي مسجل كـ "مشتري". لنشر مقاطع كواليس الصنعة الصعيدية وربطها بمنتجاتك، يرجى التقديم لفتح ورشة بائع معتمدة أو ترقية حسابك.',
        type: 'buyer'
      });
      return;
    }

    // Role is seller or admin -> Allowed
    setIsUploadModalOpen(true);
  };

  const handleReelUploaded = (newReel: CraftReel) => {
    loadReelsFromDb();
    addToast(
      'تم نشر الفيديو بنجاح',
      `تم حفظ مقطع "${newReel.title}" في قاعدة البيانات وإتاحته للجمهور`,
      'success'
    );
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
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1A1614] py-4 sm:py-6 px-3 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Header with Clean Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#221B17] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B45F42]/10 dark:bg-[#B45F42]/20 text-[#B45F42] dark:text-[#E07A5F] text-xs font-bold mb-2">
            <Film className="w-3.5 h-3.5" />
            <span>وه Reels • مقاطع صناع الصعيد</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2D2A26] dark:text-[#FAF6F2] font-heritage">
            شاهد الصنعة على أصولها واشترِ فوراً
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6F64] dark:text-[#A89C90] mt-1">
            مقاطع فيديو حية من قلب ورش قنا وسوهاج وأسوان تكشف أسرار الحرفة وتفاصيل المنتجات.
          </p>
        </div>

        {/* Action Buttons & View Mode Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {/* Toggle View Mode */}
          <div className="flex items-center p-1 bg-[#F5EFE6] dark:bg-[#17120F] rounded-xl border border-[#E8E1D9] dark:border-[#382E27]">
            <button
              type="button"
              id="reels-view-grid"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#2D2723] text-[#2D2A26] dark:text-white shadow-xs'
                  : 'text-[#7A6F64] dark:text-[#A89C90]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>الشبكة</span>
            </button>

            <button
              type="button"
              id="reels-view-feed"
              onClick={() => setViewMode('feed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'feed'
                  ? 'bg-[#B45F42] text-white shadow-xs'
                  : 'text-[#7A6F64] dark:text-[#A89C90]'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>مشاهدة ريلز</span>
            </button>
          </div>

          {/* Upload Reel Button */}
          <button
            type="button"
            id="reels-upload-btn"
            onClick={handleOpenUpload}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>نشر فيديو للورشة</span>
          </button>
        </div>
      </div>

      {/* 2. Mode: Immersive Feed Mode */}
      {viewMode === 'feed' ? (
        <div className="w-full flex justify-center sm:py-4">
          <div className="fixed inset-0 z-40 bg-black sm:relative sm:inset-auto sm:z-auto sm:max-w-[420px] sm:h-[min(94dvh,860px)] sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border sm:border-white/10">
            {/* Mobile Top Floating Switch to Grid button */}
            <div className="sm:hidden absolute top-3 right-3 z-50 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>عرض الشبكة</span>
              </button>
            </div>

            <ReelFeed
              reels={filteredReels.length > 0 ? filteredReels : reels}
              initialReelId={selectedReelId || undefined}
              onSelectProduct={(pId) => navigateToProduct(pId)}
              onSelectSeller={(sId) => navigateToSeller(sId)}
              onDeleteReel={(deletedId) => {
                setReels((prev) => prev.filter((r) => r.id !== deletedId));
              }}
              showCloseButton={false}
              hasBottomNav={false}
            />
          </div>
        </div>
      ) : (
        /* 3. Mode: Grid & Explorer Mode */
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-[#221B17] rounded-2xl p-3.5 sm:p-4 border border-[#E8E1D9] dark:border-[#382E27] shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن أسطى، ورشة، أو منتج في الفيديو..."
                  className="w-full pl-3 pr-9 py-2 bg-[#FDFBF7] dark:bg-[#1A1614] border border-[#E8E1D9] dark:border-[#4A3E35] rounded-xl text-xs sm:text-sm outline-none focus:border-[#B45F42] text-[#2D2A26] dark:text-white"
                />
              </div>

              {/* Governorate Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#7A6F64] dark:text-[#A89F91] whitespace-nowrap flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#B45F42]" />
                  المحافظة:
                </span>
                <select
                  value={selectedGovernorate}
                  onChange={(e) => setSelectedGovernorate(e.target.value)}
                  className="px-3 py-2 bg-[#FDFBF7] dark:bg-[#1A1614] border border-[#E8E1D9] dark:border-[#4A3E35] rounded-xl text-xs outline-none focus:border-[#B45F42] font-medium text-[#2D2A26] dark:text-white cursor-pointer"
                >
                  <option value="all">كل محافظات الصعيد</option>
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

          {/* Grid Layout */}
          {filteredReels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {filteredReels.map((reel) => (
                <div
                  key={reel.id}
                  id={`reel-card-${reel.id}`}
                  onClick={() => openReelModal(reel.id)}
                  className="group bg-white dark:bg-[#221B17] rounded-2xl overflow-hidden border border-[#E8E1D9] dark:border-[#382E27] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-9/14 bg-neutral-900 overflow-hidden">
                    <img
                      src={reel.posterUrl}
                      alt={reel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-2 inset-x-2 flex items-center justify-between z-10 pointer-events-none">
                      <span className="bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                        {reel.duration}
                      </span>

                      <div className="flex items-center gap-1">
                        {currentUser?.role === 'admin' && (
                          <button
                            type="button"
                            onClick={(e) => handleAdminDeleteReel(e, reel)}
                            className="p-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white border border-rose-400/50 shadow-md transition-transform active:scale-95 pointer-events-auto cursor-pointer"
                            title="حذف الفيديو"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                        <span className="bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full">
                          {reel.governorate}
                        </span>
                      </div>
                    </div>

                    {/* Center Play Icon */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-white mr-0.5" />
                      </div>
                    </div>

                    {/* Bottom Seller Info inside card image */}
                    <div className="absolute bottom-2 inset-x-2 z-10 flex items-center gap-1.5 pointer-events-none">
                      <img
                        src={reel.artisanAvatar}
                        alt={reel.artisanName}
                        className="w-6 h-6 rounded-full object-cover border border-white/60 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-white truncate drop-shadow-sm">
                          {reel.artisanName}
                        </p>
                        <p className="text-[9px] text-amber-200 truncate">
                          {reel.workshopName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Content & Quick Action */}
                  <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                    <h3 className="text-xs font-bold text-[#2D2A26] dark:text-[#FAF6F2] leading-snug line-clamp-2">
                      {reel.title}
                    </h3>

                    {/* Price and Instant Buy */}
                    <div className="pt-2 border-t border-[#E8E1D9] dark:border-[#382E27] flex items-center justify-between gap-1">
                      <span className="text-xs font-black text-[#B45F42] dark:text-[#E07A5F]">
                        {reel.productPrice} ج.م
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(e, reel)}
                        className="px-2.5 py-1 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>شراء</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#221B17] rounded-3xl p-10 text-center border border-[#E8E1D9] dark:border-[#382E27] space-y-3">
              <Film className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-sm font-bold text-[#2D2A26] dark:text-white">
                لا توجد فيديوهات مطابقة للبحث
              </h3>
              <p className="text-xs text-[#7A6F64] dark:text-gray-400">
                جرب اختيار محافظة أخرى أو إعادة تعيين الفلاتر.
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
        </div>
      )}

      {/* Full-Screen Modal Viewer */}
      {selectedReelId && (
        <CraftReelsModal
          reels={filteredReels.length > 0 ? filteredReels : reels}
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
