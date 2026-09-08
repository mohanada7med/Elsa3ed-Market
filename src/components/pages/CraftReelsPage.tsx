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
  ArrowUpLeft,
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
      } catch { }
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
    <div
      dir="rtl"
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors duration-500
        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
      "
    >
      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <header className="relative z-50 border-b border-black/10 dark:border-white/10">
        <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button
            onClick={() => setActivePage('home')}
            className="
              group flex items-center gap-3
              text-sm font-bold
              transition-all
              hover:text-[#9a6a35]
              cursor-pointer
            "
          >
            <span
              className="
                flex h-10 w-10 items-center justify-center
                rounded-full
                border border-black/10
                bg-white/60
                transition-all
                group-hover:bg-[#211d18]
                group-hover:text-white
                dark:border-white/10
                dark:bg-white/5
                dark:group-hover:bg-white
                dark:group-hover:text-black
              "
            >
              <ArrowLeft
                size={17}
                className="transition-transform group-hover:-translate-x-1"
              />
            </span>
            <span className="hidden sm:block">الرئيسية</span>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <div className="text-[9px] font-bold tracking-[0.35em] text-[#9a6a35]">
              WAH
            </div>
            <div className="mt-1 text-sm font-black">وه Reels</div>
          </div>

          <button
            type="button"
            onClick={handleOpenUpload}
            className="
              flex items-center gap-2
              rounded-full
              border border-black/10
              px-4 py-2.5
              text-xs font-bold
              transition-all
              hover:bg-[#211d18]
              hover:text-white
              dark:border-white/10
              dark:hover:bg-white
              dark:hover:text-black
              cursor-pointer
            "
          >
            <span className="hidden sm:block">نشر فيديو للورشة</span>
            <Plus size={15} />
          </button>
        </div>
      </header>

      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full border border-black/5 dark:border-white/5" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-[350px] w-[350px] rounded-full border border-black/5 dark:border-white/5" />

        <div className="mx-auto max-w-[1600px] px-5 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-24 lg:px-12 lg:pb-20 lg:pt-32">
          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_420px]">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <Sparkles size={16} className="text-[#9a6a35]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#9a6a35]">
                  Upper Egypt Reels / Craft Videos
                </span>
              </div>

              <h1
                className="
                  max-w-5xl
                  text-[14vw]
                  font-black
                  leading-[0.78]
                  tracking-[-0.08em]
                  sm:text-[11vw]
                  lg:text-[9rem]
                  xl:text-[11rem]
                "
              >
                شاهد
                <br />
                <span className="mr-[8vw] text-[#9a6a35] lg:mr-28">الصنعة</span>
              </h1>

              <div className="mt-10 flex max-w-2xl items-start gap-5">
                <div className="mt-2 h-16 w-px bg-[#9a6a35]" />
                <p className="text-sm leading-8 text-black/55 dark:text-white/55 sm:text-base">
                  مقاطع فيديو حية من قلب ورش قنا وسوهاج وأسوان تكشف أسرار الحرفة وتفاصيل المنتجات مع إمكانية الشراء الفوري.
                </p>
              </div>
            </div>

            {/* Stats Card */}
            <div className="relative">
              <div
                className="
                  relative overflow-hidden
                  rounded-[2rem]
                  border border-black/10
                  bg-white/50
                  p-7
                  backdrop-blur-xl
                  dark:border-white/10
                  dark:bg-white/[0.035]
                "
              >
                <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full border border-[#9a6a35]/20" />

                <div className="relative">
                  <div className="mb-10 flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-[0.25em] text-black/40 dark:text-white/40">
                      CRAFT REELS
                    </span>
                    <Film size={18} className="text-[#9a6a35]" />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-5xl font-black tracking-[-0.05em]">
                        {reels.length}
                      </div>
                      <div className="mt-2 text-xs text-black/45 dark:text-white/45">
                        مقطع فيديو حي
                      </div>
                    </div>

                    <div>
                      <div className="text-5xl font-black tracking-[-0.05em]">
                        8
                      </div>
                      <div className="mt-2 text-xs text-black/45 dark:text-white/45">
                        محافظات صعيدية
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex items-center gap-3 border-t border-black/10 pt-5 dark:border-white/10">
                    <div className="h-2 w-2 rounded-full bg-[#9a6a35]" />
                    <span className="text-xs font-bold">
                      من الورشة لبيتك مباشرة
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STORIES AVATARS BAR
      ===================================================== */}
      <section className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 pb-8">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
          {reels.map((reel) => (
            <button
              key={`story-${reel.id}`}
              type="button"
              onClick={() => openReelModal(reel.id)}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-hidden cursor-pointer"
            >
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
      </section>

      {/* =====================================================
          FLOATING CONTROLS BAR (View Mode & Filters)
      ===================================================== */}
      <section className="relative z-30 mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 mb-10">
        <div
          className="
            rounded-[1.5rem]
            border border-black/10
            bg-white/75
            p-3
            shadow-[0_20px_70px_rgba(0,0,0,0.08)]
            backdrop-blur-2xl
            dark:border-white/10
            dark:bg-[#151513]/90
            dark:shadow-black/30
          "
        >
          <div className="flex flex-col gap-3 lg:flex-row items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search
                size={17}
                className="
                  absolute right-4 top-1/2
                  -translate-y-1/2
                  text-black/40
                  dark:text-white/40
                "
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن أسطى، ورشة، أو منتج في الفيديو..."
                className="
                  h-12 w-full
                  rounded-xl
                  border border-transparent
                  bg-black/[0.035]
                  pr-11 pl-10
                  text-sm
                  outline-none
                  transition-all
                  placeholder:text-black/35
                  focus:border-[#9a6a35]/40
                  focus:bg-transparent
                  dark:bg-white/[0.04]
                  dark:placeholder:text-white/30
                  dark:focus:bg-white/[0.06]
                "
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="
                    absolute left-3 top-1/2
                    -translate-y-1/2
                    rounded-full p-1.5
                    hover:bg-black/10
                    dark:hover:bg-white/10
                    cursor-pointer
                  "
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Governorate Select */}
            <div className="relative w-full lg:w-60">
              <select
                value={selectedGovernorate}
                onChange={(e) => setSelectedGovernorate(e.target.value)}
                className="
                  h-12 w-full
                  appearance-none
                  rounded-xl
                  border border-transparent
                  bg-black/[0.035]
                  px-4
                  text-sm font-bold
                  outline-none
                  transition-all
                  focus:border-[#9a6a35]/40
                  dark:bg-white/[0.04]
                  dark:focus:bg-white/[0.06]
                  cursor-pointer
                "
              >
                <option value="all">كل محافظات الصعيد</option>
                {governoratesList.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-black/[0.035] dark:bg-white/[0.04] rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-4 h-10 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'grid'
                    ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
                    : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
                  }`}
              >
                <Grid size={15} />
                <span>الشبكة</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('feed')}
                className={`px-4 h-10 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'feed'
                    ? 'bg-[#9a6a35] text-white shadow-md'
                    : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
                  }`}
              >
                <Tv size={15} />
                <span>مشاهدة ريلز</span>
              </button>
            </div>
          </div>

          {/* Craft Categories Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 mt-3 border-t border-black/10 dark:border-white/10">
            {craftTypesList.map((craft) => (
              <button
                key={craft.id}
                type="button"
                onClick={() => setSelectedCraftType(craft.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${selectedCraftType === craft.id
                    ? 'bg-[#9a6a35] text-white shadow-md'
                    : 'bg-black/[0.04] dark:bg-white/[0.05] text-black/70 dark:text-white/70 hover:bg-black/[0.08] dark:hover:bg-white/[0.1]'
                  }`}
              >
                {craft.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT AREA (Feed or Grid)
      ===================================================== */}
      <section className="mx-auto max-w-[1600px] px-5 pb-24 sm:px-8 lg:px-12">
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
          <div>
            {filteredReels.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                {filteredReels.map((reel) => (
                  <div
                    key={reel.id}
                    id={`reel-card-${reel.id}`}
                    onClick={() => openReelModal(reel.id)}
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
                            className="p-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white border border-rose-400/50 shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
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
            ) : (
              <div className="bg-white/80 dark:bg-[#151513]/90 rounded-[2rem] p-12 text-center border border-black/10 dark:border-white/10 space-y-4 backdrop-blur-xl">
                <Film className="w-12 h-12 text-black/30 dark:text-white/30 mx-auto" />
                <h3 className="text-lg font-black">
                  لا توجد فيديوهات مطابقة للبحث
                </h3>
                <p className="text-xs text-black/60 dark:text-white/60">
                  جرب اختيار محافظة أخرى أو إعادة تعيين الفلاتر.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGovernorate('all');
                    setSelectedCraftType('all');
                    setSearchQuery('');
                  }}
                  className="px-6 py-3 bg-[#211d18] text-white dark:bg-white dark:text-black text-xs font-bold rounded-xl cursor-pointer"
                >
                  إعادة تعيين الفلاتر
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}
      <section className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div
            className="
              relative overflow-hidden
              rounded-[2rem]
              bg-[#211d18]
              px-6 py-14
              text-white
              sm:px-12 sm:py-20
              lg:px-20
            "
          >
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full border border-white/10" />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_400px] lg:items-end">
              <div>
                <div className="mb-5 text-[10px] font-bold tracking-[0.3em] text-[#d5a56d]">
                  WATCH & SHOP
                </div>
                <h2
                  className="
                    max-w-4xl
                    text-4xl
                    font-black
                    leading-tight
                    tracking-[-0.04em]
                    sm:text-6xl
                  "
                >
                  الصنعة مش كلام...
                  <br />
                  <span className="text-[#d5a56d]">دي أفعال وتفاصيل.</span>
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-sm leading-8 text-white/55">
                  تابع كل جديد من ورش الصعيد واقتني القطع الفنية الأصلية مباشرة من صانعيها.
                </p>
                <button
                  type="button"
                  onClick={handleOpenUpload}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs font-bold text-black hover:bg-[#d5a56d] transition-colors cursor-pointer w-fit"
                >
                  <span>نشر فيديو لورشحتك</span>
                  <Plus size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              className="w-full max-w-md bg-white dark:bg-[#151513] rounded-[2rem] p-6 shadow-2xl border border-black/10 dark:border-white/10 space-y-5 text-right backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#9a6a35]/10 border border-[#9a6a35]/30 flex items-center justify-center text-[#9a6a35]">
                  <Lock className="w-6 h-6" />
                </div>
                <button
                  type="button"
                  onClick={() => setPermissionAlert((prev) => ({ ...prev, isOpen: false }))}
                  className="p-2 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black">
                  {permissionAlert.title}
                </h3>
                <p className="text-xs sm:text-sm text-black/60 dark:text-white/60 leading-relaxed">
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
                      className="w-full py-3 px-4 bg-[#211d18] text-white dark:bg-white dark:text-black text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
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
                      className="w-full py-3 px-4 bg-black/5 dark:bg-white/5 text-black dark:text-white hover:bg-black/10 text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
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
                      className="w-full py-3 px-4 bg-[#211d18] text-white dark:bg-white dark:text-black text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Store className="w-4 h-4" />
                      <span>التقديم لفتح ورشة بائع</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPermissionAlert((prev) => ({ ...prev, isOpen: false }))}
                      className="w-full py-3 px-4 bg-black/5 dark:bg-white/5 text-black dark:text-white hover:bg-black/10 text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
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