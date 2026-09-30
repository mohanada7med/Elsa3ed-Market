import React, {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { CraftReel, Governorate } from '../../types.ts';
import { craftReelsService } from '../../services/craftReelsService.ts';
import { ReelFeed } from '../public/reels/ReelFeed.tsx';
import { ReelUploadModal } from '../common/ReelUploadModal.tsx';
import {
  Film,
  Play,
  ShoppingBag,
  Flame,
  Search,
  MapPin,
  ArrowLeft,
  Plus,
  LogIn,
  X,
  Lock,
  Trash2,
  Loader2,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getOptimizedVideoPoster } from '../../utils/cloudinaryMedia.ts';
import FloatingDock from '../common/FloatingDock.tsx';
import { UncleWahHeroBanner } from '../common/UncleWahHeroBanner.tsx';

/* ------------------------------------------------------------------ */
/* Constants (outside the component so they are created once)          */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 18;

const GOVERNORATES = [
  'أسوان',
  'الأقصر',
  'قنا',
  'سوهاج',
  'أسيوط',
  'المنيا',
  'بني سويف',
  'الفيوم',
  'الوادي الجديد',
  'البحر الأحمر'
];

const CONTENT_TYPES = [
  { id: 'all', label: 'كل الحكايات' },
  { id: 'places', label: 'أماكن ومعالم' },
  { id: 'crafts', label: 'حرف وصناعات' },
  { id: 'heritage', label: 'تراث وآثار' },
  { id: 'events', label: 'فعاليات ومهرجانات' },
  { id: 'food', label: 'أكل صعيدي' },
  { id: 'markets', label: 'أسواق' },
  { id: 'people', label: 'حكايات الناس' },
  { id: 'travel', label: 'رحلات وتجارب' },
  { id: 'other', label: 'أخرى' }
];

const CONTENT_LABELS: Record<string, string> = Object.fromEntries(
  CONTENT_TYPES.map((c) => [c.id, c.label])
);

/** Read URL / session params ONCE, instead of in 2 places. */
function readInitialParams() {
  if (typeof window === 'undefined') return { reelId: null as string | null, view: 'grid' as const };
  const params = new URLSearchParams(window.location.search);
  let reelId = params.get('reel') || params.get('reelId');
  if (!reelId) {
    try {
      reelId = sessionStorage.getItem('wah_selected_reel_id');
      if (reelId) sessionStorage.removeItem('wah_selected_reel_id');
    } catch {
      /* ignore */
    }
  }
  const view = reelId || params.get('view') === 'feed' ? 'feed' : 'grid';
  return { reelId, view: view as 'feed' | 'grid' };
}

/* ------------------------------------------------------------------ */
/* Reel card: memoised so typing in search doesn't re-render every card */
/* ------------------------------------------------------------------ */

interface ReelCardProps {
  reel: CraftReel;
  featured: boolean;
  isAdmin: boolean;
  onOpen: (id: string) => void;
  onAdd: (e: React.MouseEvent, reel: CraftReel) => void;
  onDelete: (e: React.MouseEvent, reel: CraftReel) => void;
}

const ReelCard = memo(function ReelCard({
  reel,
  featured,
  isAdmin,
  onOpen,
  onAdd,
  onDelete
}: ReelCardProps) {
  const poster = useMemo(
    () =>
      getOptimizedVideoPoster(
        reel.videoUrl,
        reel.posterUrl || reel.productImage,
        featured ? 640 : 340
      ),
    [reel.videoUrl, reel.posterUrl, reel.productImage, featured]
  );

  const category =
    (reel.contentType && CONTENT_LABELS[reel.contentType]) || reel.craftType || 'حكاية';
  const place = reel.location || reel.governorate;
  const hasProduct = reel.productId && reel.productId !== 'none' && reel.productPrice;

  return (
    <article
      onClick={() => onOpen(reel.id)}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-espresso ${featured ? 'aspect-9/16 lg:col-span-2 lg:row-span-2 lg:aspect-auto' : 'aspect-9/16'
        }`}
      // Skip layout/paint work for cards that are off-screen
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 360px' }}
    >
      <img
        src={poster}
        alt={reel.title}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
      />

      {/* One gradient only, at the bottom, where the text lives */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      {/* Top row */}
      <div className="absolute inset-x-2.5 top-2.5 flex items-center justify-between">
        <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {reel.duration}
        </span>
        <div className="flex items-center gap-1.5">
          {isAdmin && (
            <button
              type="button"
              onClick={(e) => onDelete(e, reel)}
              className="rounded-md bg-rose-600 p-1 text-white"
              title="حذف الفيديو بصلاحيات المدير"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
          <span className="flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
            <Flame className="h-3 w-3 text-amber-300" />
            {reel.likesCount}
          </span>
        </div>
      </div>

      {/* Play hint: appears on hover only */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white">
          <Play className="h-5 w-5 fill-white" />
        </span>
      </div>

      {/* Info */}
      <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-3">
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
          {place && (
            <span className="inline-flex items-center gap-1 text-amber-300">
              <MapPin size={11} />
              {place}
            </span>
          )}
          <span className="text-white/70">{category}</span>
        </div>

        <h3
          className={`line-clamp-2 font-bold leading-snug text-white ${featured ? 'text-sm lg:text-xl' : 'text-xs'
            }`}
        >
          {reel.title}
        </h3>

        {hasProduct && (
          <div className="flex items-center justify-between border-t border-white/20 pt-2">
            <span className="text-[11px] font-bold text-amber-300">{reel.productPrice} ج.م</span>
            <button
              type="button"
              onClick={(e) => onAdd(e, reel)}
              className="rounded-lg bg-primary p-1.5 text-white active:scale-90"
              title="أضف للسلة"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
});

/* ------------------------------------------------------------------ */
/* Permission modal (was duplicated twice in the old file)             */
/* ------------------------------------------------------------------ */

interface PermissionState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'unauthenticated' | 'buyer';
}

const PermissionModal: React.FC<{
  state: PermissionState;
  onClose: () => void;
  onLogin: () => void;
}> = ({ state, onClose, onLogin }) => (
  <AnimatePresence>
    {state.isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="w-full max-w-md space-y-5 rounded-3xl border border-black/10 bg-cream p-6 text-right shadow-2xl dark:border-white/10 dark:bg-espresso-900"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
              <Lock className="h-6 w-6" />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-black/50 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black">{state.title}</h3>
            <p className="text-sm leading-relaxed text-black/60 dark:text-white/60">
              {state.message}
            </p>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            {state.type === 'unauthenticated' ? (
              <>
                <button
                  type="button"
                  onClick={onLogin}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B3A1F] px-4 py-3 text-sm font-bold text-[#FFF9EE]"
                >
                  <LogIn className="h-4 w-4" />
                  تسجيل الدخول
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-black/5 px-4 py-3 text-xs font-bold text-black/70 dark:bg-white/5 dark:text-white/70"
                >
                  إلغاء
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-[#6B3A1F] px-4 py-3 text-sm font-bold text-[#FFF9EE]"
              >
                فهمت
              </button>
            )}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

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
    setPostLoginRedirect,
    sellerProducts,
    sellers,
    confirmModal
  } = useApp();

  const initial = useRef(readInitialParams()).current;

  const [viewMode, setViewMode] = useState<'feed' | 'grid'>(initial.view);
  const [selectedReelId, setSelectedReelId] = useState<string | null>(initial.reelId);

  const [reels, setReels] = useState<CraftReel[]>(() => {
    const cached = craftReelsService.getReels();
    return Array.isArray(cached) ? cached : [];
  });
  const [isLoading, setIsLoading] = useState(reels.length === 0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedGovernorate, setSelectedGovernorate] = useState('all');
  const [selectedContentType, setSelectedContentType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [permissionAlert, setPermissionAlert] = useState<PermissionState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'unauthenticated'
  });

  // Search is deferred so typing never blocks the UI
  const deferredQuery = useDeferredValue(searchQuery);

  /* ---------- data loading ---------- */

  const loadReelsFromDb = useCallback(async () => {
    try {
      const dbReels = await craftReelsService.fetchReelsFromDb();
      if (Array.isArray(dbReels) && dbReels.length > 0) setReels(dbReels);
    } catch {
      /* keep cached reels */
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReelsFromDb();
  }, [loadReelsFromDb]);

  useEffect(() => {
    if (currentUser?.id && currentUser.id !== 'guest-visitor' && currentUser.role !== 'guest') {
      craftReelsService.fetchUserLikedReels(currentUser).catch(() => { });
    }
  }, [currentUser?.id, currentUser?.role]);

  /* ---------- body scroll lock (feed mode) ---------- */

  useEffect(() => {
    if (viewMode !== 'feed') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [viewMode]);

  /* ---------- derived data (computed once per change, not per render) ---------- */

  const governorateCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of reels) m[r.governorate] = (m[r.governorate] || 0) + 1;
    return m;
  }, [reels]);

  const searchIndex = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of reels) {
      m.set(
        r.id,
        [
          r.title,
          r.description,
          r.location,
          r.governorate,
          r.contentType,
          r.craftType,
          r.artisanName,
          r.workshopName,
          r.productTitle
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
      );
    }
    return m;
  }, [reels]);

  const filteredReels = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return reels.filter((r) => {
      if (selectedGovernorate !== 'all' && r.governorate !== selectedGovernorate) return false;
      if (
        selectedContentType !== 'all' &&
        r.contentType !== selectedContentType &&
        !(!r.contentType && selectedContentType === 'crafts')
      )
        return false;
      return !q || (searchIndex.get(r.id) || '').includes(q);
    });
  }, [reels, selectedGovernorate, selectedContentType, deferredQuery, searchIndex]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedGovernorate, selectedContentType, deferredQuery]);

  const hasMore = filteredReels.length > visibleCount;

  /* ---------- infinite scroll ---------- */

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || viewMode !== 'grid') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisibleCount((c) => c + PAGE_SIZE);
      },
      { rootMargin: '600px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, viewMode, visibleCount]);

  /* ---------- stable handlers (so memo(ReelCard) actually works) ---------- */

  const latest = useRef({ addToCart, addToast, confirmModal, currentUser });
  latest.current = { addToCart, addToast, confirmModal, currentUser };

  const openReelInFeed = useCallback((id: string) => {
    setSelectedReelId(id);
    setViewMode('feed');
    window.scrollTo({ top: 0 });
  }, []);

  const backToGrid = useCallback(() => {
    setSelectedReelId(null); // otherwise the feed re-opens on the old reel
    setViewMode('grid');
  }, []);

  const handleAdminDeleteReel = useCallback((e: React.MouseEvent, reel: CraftReel) => {
    e.stopPropagation();
    const { confirmModal, currentUser, addToast } = latest.current;
    if (!currentUser || currentUser.role !== 'admin') return;
    confirmModal({
      title: 'حذف مقطع الحرفة',
      message: `هل أنت متأكد من حذف مقطع "${reel.title}" نهائياً من المنصة؟`,
      confirmText: 'نعم، حذف الفيديو',
      danger: true,
      onConfirm: async () => {
        try {
          await craftReelsService.deleteReelAsync(currentUser, reel.id);
          setReels((prev) => prev.filter((r) => r.id !== reel.id));
          addToast('تم حذف الفيديو بنجاح', `تم حذف فيديو "${reel.title}"`, 'info');
        } catch (err: any) {
          addToast('خطأ في الحذف', err?.message || 'فشل في حذف الفيديو', 'error');
        }
      }
    });
  }, []);

  const handleQuickAdd = useCallback((e: React.MouseEvent, reel: CraftReel) => {
    e.stopPropagation();
    if (!reel.productId || !reel.productTitle || !reel.productPrice) return;
    const { addToCart, addToast } = latest.current;
    addToCart(
      {
        id: reel.productId,
        title: reel.productTitle,
        price: reel.productPrice,
        originalPrice: reel.productOriginalPrice || reel.productPrice,
        images: reel.productImage ? [reel.productImage] : [],
        rating: reel.productRating || 5,
        reviewCount: 22,
        inStock: reel.inStock ?? true,
        stockCount: 15,
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
  }, []);

  const handleOpenUpload = () => {
    if (!isAuthenticated || !currentUser) {
      setPermissionAlert({
        isOpen: true,
        title: 'سجّل الدخول لنشر حكايتك',
        message:
          'نشر حكايات الصعيد متاح للمستخدمين والبائعين المسجلين. سجّل الدخول أو أنشئ حساباً جديداً.',
        type: 'unauthenticated'
      });
      return;
    }
    if (currentUser.role === 'buyer') {
      setPermissionAlert({
        isOpen: true,
        title: 'النشر للشركاء والبائعين',
        message:
          'حسابك الحالي مسجل كـ "مشتري". قدّم على صلاحية النشر أو رقّ حسابك لتنشر حكايتك.',
        type: 'buyer'
      });
      return;
    }
    setIsUploadModalOpen(true);
  };

  const closePermission = () => setPermissionAlert((p) => ({ ...p, isOpen: false }));

  const resetFilters = () => {
    setSelectedGovernorate('all');
    setSelectedContentType('all');
    setSearchQuery('');
  };

  // Only start the feed on a reel that is actually in the filtered list
  const feedInitialId =
    selectedReelId && filteredReels.some((r) => r.id === selectedReelId)
      ? selectedReelId
      : undefined;

  /* ---------- shared modals, rendered ONCE ---------- */

  const modals = (
    <>
      <ReelUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={(newReel: CraftReel) => {
          loadReelsFromDb();
          addToast('تم نشر الفيديو', `تم نشر "${newReel.title}" وأصبح متاحاً للجمهور`, 'success');
        }}
        sellerId={currentUser?.sellerId || currentUser?.id}
        sellerName={currentUser?.name || 'ورشة الحرف التراثية'}
        artisanName={currentUser?.name || 'حرفي صعيدي أصيل'}
        artisanAvatar={currentUser?.avatar}
        defaultGovernorate={(currentUser?.governorate as Governorate) || 'قنا'}
        sellerProducts={sellerProducts}
        currentUser={currentUser}
        allSellers={sellers}
      />
      <PermissionModal
        state={permissionAlert}
        onClose={closePermission}
        onLogin={() => {
          closePermission();
          setPostLoginRedirect('reels');
          setAuthModalTab('login');
          setIsAuthModalOpen(true);
        }}
      />
    </>
  );

  /* ================================================================== */
  /* FEED MODE                                                           */
  /* ================================================================== */

  if (viewMode === 'feed') {
    return (
      <>
        <div
          dir="rtl"
          className="fixed inset-0 z-50 flex select-none flex-col overflow-hidden bg-black"
          style={{ height: '100dvh' }}
        >
          <header className="absolute inset-x-0 top-0 z-50 flex items-center justify-between gap-2 bg-gradient-to-b from-black/90 to-transparent px-3 pb-6 pt-[max(calc(env(safe-area-inset-top,0px)+12px),2.5rem)] sm:px-6 sm:pt-3.5">
            <button
              type="button"
              onClick={() => setActivePage('home')}
              className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-bold text-white"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">الرئيسية</span>
            </button>

            <select
              value={selectedGovernorate}
              onChange={(e) => setSelectedGovernorate(e.target.value)}
              className="rounded-full border border-amber-400/30 bg-black/60 px-3 py-1.5 text-[11px] font-bold text-amber-300 outline-none"
            >
              <option value="all">كل الصعيد ({reels.length})</option>
              {GOVERNORATES.map((g) => (
                <option key={g} value={g} className="bg-[#1B1009] text-[#FFF9EE]">
                  {g} ({governorateCounts[g] || 0})
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={backToGrid}
                className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300"
              >
                <LayoutGrid size={14} />
                <span className="hidden sm:inline">المعرض</span>
              </button>
              <button
                type="button"
                onClick={handleOpenUpload}
                className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white"
              >
                <Plus size={14} />
                <span className="hidden md:inline">نشر حكاية</span>
              </button>
            </div>
          </header>

          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-white">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-xs font-bold text-white/70">جارٍ تجهيز الحكايات...</p>
            </div>
          ) : filteredReels.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center text-white">
              <Film className="h-14 w-14 text-amber-500/60" />
              <h3 className="text-lg font-bold">لا توجد حكايات في هذا التصنيف</h3>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white"
              >
                عرض كل الحكايات ({reels.length})
              </button>
            </div>
          ) : (
            <ReelFeed
              // remount when filters change so the feed resets cleanly
              key={`${selectedGovernorate}-${selectedContentType}`}
              reels={filteredReels}
              initialReelId={feedInitialId}
              onSelectProduct={navigateToProduct}
              onSelectSeller={navigateToSeller}
              onDeleteReel={(id) => setReels((prev) => prev.filter((r) => r.id !== id))}
              onClose={backToGrid}
              showCloseButton={false}
              hasBottomNav={false}
            />
          )}
        </div>
        {modals}
      </>
    );
  }

  /* ================================================================== */
  /* GRID MODE                                                           */
  /* ================================================================== */

  const isAdmin = currentUser?.role === 'admin';
  const chipBase = 'shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors';
  const chipIdle = 'bg-black/[0.05] text-black/70 hover:bg-black/[0.09] dark:bg-white/[0.07] dark:text-white/70';
  const chipOn = 'bg-espresso text-cream dark:bg-cream dark:text-espresso';

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-cream font-cairo text-espresso dark:bg-espresso-900 dark:text-cream"
    >
      <FloatingDock count={filteredReels.length} label="حكاية مصورة" />

      {/* Sticky toolbar: one solid bar instead of several glass panels */}
      <div className="sticky top-0 z-30 border-b border-black/10 bg-cream/95 dark:border-white/10 dark:bg-espresso-900/95">
        <div className="mx-auto max-w-[1600px] space-y-3 px-5 py-3 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActivePage('home')}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-black/5 px-3 py-2.5 text-xs font-bold dark:bg-white/10"
              title="الرجوع للرئيسية"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">الرئيسية</span>
            </button>

            <div className="relative min-w-0 flex-1">
              <Search
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن مكان أو حرفة أو حكاية..."
                className="h-11 w-full rounded-xl bg-black/[0.05] pl-10 pr-10 text-sm outline-none placeholder:text-black/35 focus:ring-2 focus:ring-primary/40 dark:bg-white/[0.07] dark:placeholder:text-white/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                filteredReels.length > 0 ? openReelInFeed(filteredReels[0].id) : setViewMode('feed')
              }
              className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white"
              title="مشاهدة بالشاشة الكاملة"
            >
              <Play size={14} className="fill-white" />
              <span className="hidden sm:inline">شاهد بالشاشة الكاملة</span>
            </button>

            <button
              type="button"
              onClick={handleOpenUpload}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-black/15 px-3 py-2.5 text-xs font-bold dark:border-white/15"
              title="نشر حكاية جديدة"
            >
              <Plus size={14} />
              <span className="hidden md:inline">نشر حكاية</span>
            </button>
          </div>

          {/* Governorates: text chips with counts (replaces 11 round images) */}
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedGovernorate('all')}
              className={`${chipBase} ${selectedGovernorate === 'all' ? chipOn : chipIdle}`}
            >
              كل الصعيد ({reels.length})
            </button>
            {GOVERNORATES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGovernorate(g)}
                className={`${chipBase} ${selectedGovernorate === g ? chipOn : chipIdle}`}
              >
                {g} ({governorateCounts[g] || 0})
              </button>
            ))}
          </div>

          {/* Content types: underlined tabs so they read as a second level */}
          <div className="no-scrollbar flex items-center gap-5 overflow-x-auto">
            {CONTENT_TYPES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedContentType(c.id)}
                className={`shrink-0 cursor-pointer whitespace-nowrap border-b-2 pb-1.5 text-xs font-bold transition-colors ${selectedContentType === c.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-black/55 hover:text-black dark:text-white/55 dark:hover:text-white'
                  }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto my-5 max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <UncleWahHeroBanner
          doorTitle="حكاوي وتجارب حية من ورش ودكاكين الصعيد"
          doorBadge="باب ريلز وه"
          mascotSrc="/mascot/reels.png"
          mascotRole="عم وه في قلب الحدث"
          quote="عم وه بيعرف يصوّر، بس قرر إن الحكاية مش لازم تبقى حكايته لوحده.. فساب الكاميرا تفتح للناس الشاطرة في الصعيد، وكل واحد يحكيلنا حكايته وصنعته بطريقته."
          statsText={`${reels.length} حكاية مصورة`}
          actionText="شارك حكايتك"
          onAction={handleOpenUpload}
        />
      </div>

      <section className="mx-auto max-w-[1600px] px-5 pb-24 sm:px-8 lg:px-12">
        <h2 className="mb-4 text-sm font-black">
          {filteredReels.length} حكاية
          {selectedGovernorate !== 'all' && ` من ${selectedGovernorate}`}
        </h2>

        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-bold text-black/60 dark:text-white/60">جارٍ تحميل الحكايات...</p>
          </div>
        ) : filteredReels.length === 0 ? (
          <div className="space-y-4 rounded-3xl border border-black/10 p-12 text-center dark:border-white/10">
            <Film className="mx-auto h-12 w-12 text-black/30 dark:text-white/30" />
            <h3 className="text-lg font-black">لا توجد حكايات مطابقة</h3>
            <p className="text-xs text-black/60 dark:text-white/60">جرّب تصنيفاً آخر أو امسح الفلاتر.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-xl bg-[#6B3A1F] px-6 py-3 text-xs font-bold text-[#FFF9EE]"
            >
              مسح الفلاتر
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
              {filteredReels.slice(0, visibleCount).map((reel, i) => (
                <ReelCard
                  key={reel.id}
                  reel={reel}
                  featured={i === 0}
                  isAdmin={isAdmin}
                  onOpen={openReelInFeed}
                  onAdd={handleQuickAdd}
                  onDelete={handleAdminDeleteReel}
                />
              ))}
            </div>

            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
              </div>
            )}
          </>
        )}
      </section>

      {modals}
    </div>
  );
};

export default CraftReelsPage;