import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { CraftReel, Governorate } from '../../types.ts';
import { craftReelsService } from '../../services/craftReelsService.ts';
import { ReelFeed } from '../public/reels/ReelFeed.tsx';
import { ReelUploadModal } from '../common/ReelUploadModal.tsx';
import {
  Film,
  Play,
  Sparkles,
  ShoppingBag,
  Store,
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
  LayoutGrid,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getOptimizedVideoPoster } from '../../utils/cloudinaryMedia.ts';
import FloatingDock from '../common/FloatingDock.tsx';
import { UncleWahHeroBanner } from '../common/UncleWahHeroBanner.tsx';

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

  // View Mode: 'grid' (catalog view, default for fast browsing) or 'feed' (immersive full-screen)
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      const targetReelId = params.get('reel') || params.get('reelId') || sessionStorage.getItem('wah_selected_reel_id');
      if (targetReelId || viewParam === 'feed') return 'feed';
      if (viewParam === 'grid') return 'grid';
    }
    return 'grid';
  });

  const [reels, setReels] = useState<CraftReel[]>(() => {
    const cached = craftReelsService.getReels();
    return Array.isArray(cached) && cached.length > 0 ? cached : [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    const cached = craftReelsService.getReels();
    return !cached || cached.length === 0;
  });
  const [visibleCount, setVisibleCount] = useState(18);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('all');
  const [selectedContentType, setSelectedContentType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReelId, setSelectedReelId] = useState<string | null>(null);
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

  const handleAdminDeleteReel = (e: React.MouseEvent, reel: CraftReel) => {
    e.stopPropagation();
    confirmModal({
      title: 'حذف مقطع الحرفة',
      message: `هل أنت متأكد من حذف مقطع "${reel.title}" نهائياً من المنصة بصفتك مديراً؟`,
      confirmText: 'نعم، حذف الفيديو',
      danger: true,
      onConfirm: async () => {
        try {
          await craftReelsService.deleteReelAsync(currentUser || { role: 'admin' }, reel.id);
          setReels((prev) => prev.filter((r) => r.id !== reel.id));
          addToast('تم حذف الفيديو بنجاح', `تم حذف فيديو "${reel.title}" من المنصة وقاعدة البيانات`, 'info');
        } catch (err: any) {
          addToast('خطأ في الحذف', err?.message || 'فشل في حذف الفيديو', 'error');
        }
      }
    });
  };

  const loadReelsFromDb = async () => {
    if (reels.length === 0) {
      setIsLoading(true);
    }
    try {
      const dbReels = await craftReelsService.fetchReelsFromDb();
      if (Array.isArray(dbReels) && dbReels.length > 0) {
        setReels(dbReels);
      }
    } catch {
      if (reels.length === 0) {
        setReels(craftReelsService.getReels());
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReelsFromDb();
  }, []);

  useEffect(() => {
    if (currentUser?.id && currentUser.id !== 'guest-visitor' && currentUser.role !== 'guest') {
      craftReelsService.fetchUserLikedReels(currentUser).catch(() => { });
    }
  }, [currentUser?.id, currentUser?.role]);

  // Handle deep-link direct open or view mode query parameter on initial mount only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const targetReelId =
      params.get('reel') ||
      params.get('reelId') ||
      sessionStorage.getItem('wah_selected_reel_id');

    if (targetReelId) {
      setSelectedReelId(targetReelId);
      setViewMode('feed');
      try {
        sessionStorage.removeItem('wah_selected_reel_id');
      } catch { }
    } else if (viewParam === 'feed') {
      setViewMode('feed');
    } else if (viewParam === 'grid') {
      setViewMode('grid');
    }
  }, []);

  // Clean scroll management for immersive feed view mode
  useEffect(() => {
    if (viewMode === 'feed') {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev === 'hidden' ? '' : (prev || '');
        document.documentElement.style.overflow = '';
      };
    }
  }, [viewMode]);

  // Safety unmount cleanup
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const governoratesList = [
    'الفيوم',
    'بني سويف',
    'المنيا',
    'أسيوط',
    'سوهاج',
    'قنا',
    'الأقصر',
    'أسوان',
    'الوادي الجديد',
    'البحر الأحمر'
  ];

  const contentTypesList = [
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

  const governoratesDiscovery = [
    {
      name: 'all',
      label: 'كل الصعيد',
      tag: 'جميع الحكايات',
      img: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_180,c_fill/v1788790207/d13c685b-4403-4983-96fe-49f3b7a925c3.png'
    },
    { name: 'أسوان', label: 'أسوان', tag: 'بلاد الذهب والنيل', img: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_180,c_fill/v1788015791/WAH/provinces/aswan/cover.jpg' },
    { name: 'الأقصر', label: 'الأقصر', tag: 'عاصمة الآثار', img: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_180,c_fill/v1788015791/WAH/provinces/luxor/cover.jpg' },
    { name: 'قنا', label: 'قنا', tag: 'دندرة والتاريخ', img: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_180,c_fill/v1788015791/WAH/provinces/qena/cover.jpg' },
    { name: 'سوهاج', label: 'سوهاج', tag: 'أبيدوس والتراث الأصيل', img: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_180,c_fill/v1788015790/WAH/provinces/sohag/cover.jpg' },
    { name: 'أسيوط', label: 'أسيوط', tag: 'قلب الصعيد النابض', img: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_180,c_fill/v1788015789/WAH/provinces/asyut/cover.jpg' },
    { name: 'المنيا', label: 'المنيا', tag: 'عروس الصعيد', img: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_180,c_fill/v1788015793/WAH/provinces/minya/cover.jpg' },
    { name: 'بني سويف', label: 'بني سويف', tag: 'بوابة الصعيد', img: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_180,c_fill/v1788699005/WAH/provinces/beni-suef/cover.jpg' },
    { name: 'الوادي الجديد', label: 'الوادي الجديد', tag: 'سحر الطبيعة والعيون', img: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_180,c_fill/v1788715713/WAH/heritage-places/white-desert-farafra/img_2340_1788715713136_1exk.jpg' },
    { name: 'البحر الأحمر', label: 'البحر الأحمر', tag: 'بوابة قوافل الصعيد وحصن القصير التاريخي', img: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_180,c_fill/v1789125643/b615782b-1a99-4025-90b0-40d7f1696b9c.png' },
    { name: 'الفيوم', label: 'الفيوم', tag: 'واحة الخضرة والمية العذبة', img: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_180,c_fill/v1789125631/f7be86e1-059c-4bbe-9914-44b2e3ffe16e.png' }
  ];

  // Filtered Reels
  const filteredReels = useMemo(() => {
    return reels.filter((reel) => {
      const matchGov =
        selectedGovernorate === 'all' || reel.governorate === selectedGovernorate;

      const matchContent =
        selectedContentType === 'all' ||
        reel.contentType === selectedContentType ||
        (!reel.contentType && selectedContentType === 'crafts');

      if (!searchQuery.trim()) {
        return matchGov && matchContent;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        reel.title.toLowerCase().includes(q) ||
        (reel.description && reel.description.toLowerCase().includes(q)) ||
        (reel.location && reel.location.toLowerCase().includes(q)) ||
        (reel.governorate && reel.governorate.toLowerCase().includes(q)) ||
        (reel.contentType && reel.contentType.toLowerCase().includes(q)) ||
        (reel.craftType && reel.craftType.toLowerCase().includes(q)) ||
        (reel.artisanName && reel.artisanName.toLowerCase().includes(q)) ||
        (reel.workshopName && reel.workshopName.toLowerCase().includes(q)) ||
        (reel.productTitle && reel.productTitle.toLowerCase().includes(q));

      return matchGov && matchContent && matchSearch;
    });
  }, [reels, selectedGovernorate, selectedContentType, searchQuery]);

  // Reset pagination on filter change
  useEffect(() => {
    setVisibleCount(18);
  }, [selectedGovernorate, selectedContentType, searchQuery]);

  // Switch to feed starting at a specific reel
  const openReelInFeed = (reelId: string) => {
    setSelectedReelId(reelId);
    setViewMode('feed');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // Upload Permission Check
  const handleOpenUpload = () => {
    if (!isAuthenticated || !currentUser) {
      setPermissionAlert({
        isOpen: true,
        title: 'تسجيل الدخول مطلوب لنشر الفيديوهات',
        message:
          'ميزة رفع ونشر حكايات الصعيد (وه Stories) متاحة للمستخدمين والبائعين المسجلين. يرجى تسجيل الدخول بحسابك أو إنشاء حساب جديد.',
        type: 'unauthenticated'
      });
      return;
    }

    if (currentUser.role === 'buyer') {
      setPermissionAlert({
        isOpen: true,
        title: 'خاص بالناشرين والشركاء والبائعين',
        message:
          'حسابك الحالي مسجل كـ "مشتري". لنشر حكايات الصعيد والمعالم والفعاليات والمنتجات، يرجى التقديم لتفعيل صلاحية النشر أو ترقية حسابك.',
        type: 'buyer'
      });
      return;
    }

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
    if (!reel.productId || !reel.productTitle || !reel.productPrice) return;
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
  };

  /* =========================================================================
     VIEW MODE 1: FULLSCREEN REELS FEED (TIKTOK / INSTAGRAM IMMERSIVE STYLE)
     ========================================================================= */
  if (viewMode === 'feed') {
    return (
      <div
        id="reels-fullscreen-view"
        dir="rtl"
        className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none"
        style={{ height: '100dvh', maxHeight: '100dvh' }}
      >
        {/* Top Floating Glassmorphism Navigation Bar */}
        <header className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-3 sm:px-6 pt-[max(calc(env(safe-area-inset-top,0px)+14px),2.75rem)] sm:pt-3.5 pb-3 bg-gradient-to-b from-black/95 via-black/55 to-transparent pointer-events-auto">
          {/* Right: Home & Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setActivePage('home')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md"
              title="الرجوع للرئيسية"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">الرئيسية</span>
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black tracking-widest text-primary uppercase bg-primary/20 px-2 py-0.5 rounded-full border border-primary/30">
                WAH
              </span>
              <span className="text-white text-xs font-black hidden md:inline">
                وه Stories
              </span>
            </div>
          </div>

          {/* Center: Governorates filter & Category selector */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedGovernorate}
                onChange={(e) => setSelectedGovernorate(e.target.value)}
                className="appearance-none bg-black/60 hover:bg-black/80 text-amber-300 text-[11px] font-bold py-1.5 pe-7 ps-3 rounded-full border border-amber-400/30 backdrop-blur-md outline-none cursor-pointer shadow-md"
              >
                <option value="all">كل الصعيد ({reels.length})</option>
                {governoratesList.map((gov) => {
                  const count = reels.filter((r) => r.governorate === gov).length;
                  return (
                    <option key={gov} value={gov} className="bg-[#1B1009] text-[#FFF9EE]">
                      {gov} ({count})
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 start-auto end-2.5 flex items-center text-amber-300/70">
                <ChevronDown size={12} />
              </div>
            </div>

            {/* Quick Category filter pills */}
            <div className="hidden lg:flex items-center gap-1 max-w-sm overflow-x-auto no-scrollbar">
              {contentTypesList.slice(0, 5).map((cat) => (
                <button
                  key={`feed-cat-${cat.id}`}
                  type="button"
                  onClick={() => setSelectedContentType(cat.id)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedContentType === cat.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-white/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Left: View Mode Toggle & Upload */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-400/40 backdrop-blur-md transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
              title="عرض شبكة المعرض"
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">المعرض (Grid)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenUpload}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary hover:bg-[#3B1E0E] text-white text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="نشر حكاية جديدة"
            >
              <Plus size={14} />
              <span className="hidden md:inline">نشر حكاية</span>
            </button>
          </div>
        </header>

        {/* Center: Fullscreen Snap Reel Feed */}
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-xs font-bold text-white/70">جارٍ تجهيز حكايات وريلز الصعيد...</p>
          </div>
        ) : filteredReels.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 gap-4 text-white">
            <Film className="w-14 h-14 text-amber-500/60 animate-bounce" />
            <h3 className="text-lg font-bold text-white">لا توجد حكايات في هذا التصنيف حالياً</h3>
            <p className="text-xs text-white/60 max-w-xs">
              اختر محافظة أخرى أو اضغط على الزر أدناه لعرض كل حكايات الصعيد
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedGovernorate('all');
                setSelectedContentType('all');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-[#3B1E0E] shadow-lg cursor-pointer transition-transform hover:scale-105"
            >
              عرض كل الفيديوهات ({reels.length})
            </button>
          </div>
        ) : (
          <ReelFeed
            reels={filteredReels}
            initialReelId={selectedReelId || undefined}
            onSelectProduct={navigateToProduct}
            onSelectSeller={navigateToSeller}
            onDeleteReel={(deletedId) => setReels((prev) => prev.filter((r) => r.id !== deletedId))}
            onClose={() => setViewMode('grid')}
            showCloseButton={false}
            hasBottomNav={false}
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
          currentUser={currentUser}
          allSellers={sellers}
        />

        {/* Permission Barrier Modal */}
        <AnimatePresence>
          {permissionAlert.isOpen && (
            <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-md bg-[#FFF9EE] dark:bg-[#1B1009] rounded-[2rem] p-6 shadow-2xl border border-black/10 dark:border-white/10 space-y-5 text-right backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
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
                  <h3 className="text-lg font-black">{permissionAlert.title}</h3>
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
                          setPostLoginRedirect('reels');
                          setAuthModalTab('login');
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full py-3 px-4 bg-[#6B3A1F] text-[#FFF9EE] text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>تسجيل الدخول للمتابعة</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPermissionAlert((prev) => ({ ...prev, isOpen: false }))}
                        className="w-full sm:w-auto py-3 px-4 bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPermissionAlert((prev) => ({ ...prev, isOpen: false }))}
                      className="w-full py-3 px-4 bg-[#6B3A1F] text-[#FFF9EE] text-xs sm:text-sm font-bold rounded-xl shadow-md cursor-pointer"
                    >
                      فهمت ذلك
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* =========================================================================
     VIEW MODE 2: GRID / CATALOG VIEW
     ========================================================================= */
  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        overflow-x-hidden
        bg-cream
        text-espresso
        dark:bg-espresso-900
        dark:text-cream
        font-cairo
      "
    >
      <FloatingDock count={filteredReels.length} label="حكاية مصورة" />

      {/* GRID TOP BAR & SWITCHER (CLEAN, NO DUPLICATE HEADERS) */}
      <section className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/75 dark:bg-espresso-900/90 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActivePage('home')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
              title="الرجوع للرئيسية"
            >
              <ArrowLeft size={14} />
              <span>الرئيسية</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">وه Stories</span>
              </div>
              <h2 className="text-xs sm:text-sm font-main font-black text-espresso dark:text-cream">
                معرض حكايات الصعيد ({filteredReels.length} فيديو)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Direct Switch to Fullscreen Feed with Glowing Effect */}
            <button
              type="button"
              onClick={() => {
                if (filteredReels.length > 0) {
                  openReelInFeed(filteredReels[0].id);
                } else {
                  setViewMode('feed');
                }
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6B3A1F] via-[#D97724] to-[#B24C2B] text-white text-xs font-black shadow-lg shadow-amber-900/25 hover:shadow-xl hover:scale-102 active:scale-98 transition-all cursor-pointer animate-pulse"
              title="مشاهدة الفيديوهات بالشاشة الكاملة مع التمرير الرأسي"
            >
              <Play size={14} className="fill-white" />
              <span>شاهد بالشاشة الكاملة (Reels)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenUpload}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black/5 dark:bg-cream/10 hover:bg-black/10 text-xs font-bold transition-all cursor-pointer border border-black/10 dark:border-white/10"
              title="نشر حكاية جديدة"
            >
              <Plus size={14} />
              <span className="hidden md:inline">نشر حكاية</span>
            </button>
          </div>
        </div>
      </section>

      {/* UNCLE WAH HERO BANNER - MASTER OF REELS */}
      <div className="relative z-20 mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 my-4">
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

      {/* UPPER EGYPT DISCOVERY BAR */}
      <section className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 pb-4">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
          {governoratesDiscovery.map((gov) => {
            const isSelected = selectedGovernorate === gov.name;
            return (
              <button
                key={`story-gov-${gov.name}`}
                type="button"
                onClick={() => setSelectedGovernorate(gov.name)}
                className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-hidden cursor-pointer"
              >
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 transition-all duration-200 shadow-md group-hover:scale-105 ${
                    isSelected
                      ? 'bg-gradient-to-tr from-[#6B3A1F] via-amber-500 to-rose-500 ring-2 ring-primary/40 scale-105'
                      : 'bg-black/10 dark:bg-cream/10 group-hover:bg-primary/40'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-black relative">
                    <img
                      src={gov.img}
                      alt={gov.label}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors" />
                  </div>
                </div>
                <span
                  className={`text-[11px] font-bold text-center max-w-[80px] truncate ${
                    isSelected ? 'text-primary' : 'text-black dark:text-white'
                  }`}
                >
                  {gov.label}
                </span>
                <span className="text-[9px] text-black/50 dark:text-white/50 -mt-1">
                  {gov.tag}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* CONTROLS BAR: SEARCH & CATEGORIES */}
      <section className="relative z-30 mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 mb-8">
        <div
          className="
            rounded-[1.5rem]
            border border-black/10
            bg-white/75
            p-3.5
            shadow-[0_20px_70px_rgba(0,0,0,0.08)]
            backdrop-blur-2xl
            dark:border-white/10
            dark:bg-espresso-900/90
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
                placeholder="ابحث عن مكان، فعالية، حكاية، أكل، حرف أو أي شيء في الصعيد..."
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
                  focus:border-primary/40
                  focus:bg-transparent
                  dark:bg-cream/[0.04]
                  dark:placeholder:text-white/30
                  dark:focus:bg-white/[0.06]
                "
              />
              {searchQuery && (
                <button
                  type="button"
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
                  border border-black/10
                  bg-black/[0.035]
                  pe-10 ps-4
                  text-sm font-bold
                  text-espresso
                  outline-none
                  transition-all
                  cursor-pointer
                  hover:border-primary/30
                  focus:border-primary/60
                  focus:ring-2 focus:ring-primary/10
                  dark:border-white/10
                  dark:bg-cream/[0.04]
                  dark:text-cream
                "
              >
                <option
                  value="all"
                  className="bg-cream text-espresso dark:bg-espresso-900 dark:text-cream"
                >
                  كل محافظات الصعيد ({reels.length})
                </option>
                {governoratesList.map((gov) => {
                  const count = reels.filter((r) => r.governorate === gov).length;
                  return (
                    <option
                      key={gov}
                      value={gov}
                      className="bg-cream text-espresso dark:bg-espresso-900 dark:text-cream"
                    >
                      {gov} ({count})
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 start-auto end-3.5 flex items-center text-black/40 dark:text-white/40">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* Content Categories Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 mt-3 border-t border-black/10 dark:border-white/10">
            {contentTypesList.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedContentType(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  selectedContentType === cat.id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-black/[0.04] dark:bg-cream/[0.05] text-black/70 dark:text-white/70 hover:bg-black/[0.08] dark:hover:bg-white/[0.1]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA: VIDEO CARDS GRID */}
      <section className="mx-auto max-w-[1600px] px-5 pb-24 sm:px-8 lg:px-12">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-bold text-black/60 dark:text-white/60">
              جارٍ تحميل حكايات الصعيد الأصيلة...
            </p>
          </div>
        ) : (
          <div>
            {filteredReels.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                  {filteredReels.slice(0, visibleCount).map((reel) => {
                    const categoryLabel =
                      contentTypesList.find((c) => c.id === reel.contentType)?.label ||
                      reel.craftType ||
                      'حكاية';
                    const displayLoc = reel.location || reel.governorate;

                    return (
                      <div
                        key={reel.id}
                        id={`reel-card-${reel.id}`}
                        onClick={() => openReelInFeed(reel.id)}
                        className="group relative aspect-9/16 rounded-[1.5rem] overflow-hidden bg-black cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 border border-black/10 dark:border-white/10"
                      >
                        {/* Poster Image / Video Preview */}
                        <img
                          src={getOptimizedVideoPoster(reel.videoUrl, reel.posterUrl || reel.productImage, 340)}
                          alt={reel.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                        />

                      {/* Gradient Dark Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/50 group-hover:via-black/25 transition-colors" />

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
                          <div className="flex items-center gap-1 bg-primary/85 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
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
                        {/* Location & Category Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {displayLoc && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                              <MapPin size={10} className="text-primary" />
                              <span>{displayLoc}</span>
                            </span>
                          )}
                          <span className="text-[9px] font-medium text-white/70 bg-white/15 px-2 py-0.5 rounded-full backdrop-blur-sm">
                            {categoryLabel}
                          </span>
                        </div>

                        {/* Story Title */}
                        <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug drop-shadow-md">
                          {reel.title}
                        </h3>

                        {/* Product Quick Buy Bar */}
                        {reel.productId && reel.productId !== 'none' && reel.productPrice && (
                          <div className="pt-2 border-t border-white/20 flex items-center justify-between gap-1">
                            <div className="min-w-0">
                              <span className="text-[11px] text-amber-300 font-bold block truncate">
                                {reel.productPrice} ج.م
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleQuickAdd(e, reel)}
                              className="p-1.5 bg-primary hover:bg-[#3B1E0E] text-white rounded-xl transition-transform active:scale-90 shadow-md cursor-pointer"
                              title="شراء فوري للمنتج"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredReels.length > visibleCount && (
                <div className="mt-12 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 18)}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-espresso text-cream dark:bg-cream dark:text-espresso font-main font-bold text-xs sm:text-sm hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <span>عرض المزيد من الحكايات ({filteredReels.length - visibleCount} إضافية)</span>
                  </button>
                </div>
              )}
            </>
            ) : (
              <div className="bg-white/80 dark:bg-espresso-900/90 rounded-[2rem] p-12 text-center border border-black/10 dark:border-white/10 space-y-4 backdrop-blur-xl">
                <Film className="w-12 h-12 text-black/30 dark:text-white/30 mx-auto" />
                <h3 className="text-lg font-black">
                  لا توجد حكايات مطابقة للبحث
                </h3>
                <p className="text-xs text-black/60 dark:text-white/60">
                  جرب اختيار تصنيف آخر أو إعادة تعيين الفلاتر.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGovernorate('all');
                    setSelectedContentType('all');
                    setSearchQuery('');
                  }}
                  className="px-6 py-3 bg-[#6B3A1F] text-[#FFF9EE] text-xs font-bold rounded-xl cursor-pointer"
                >
                  إعادة تعيين الفلاتر
                </button>
              </div>
            )}
          </div>
        )}
      </section>

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
        currentUser={currentUser}
        allSellers={sellers}
      />

      {/* Permission Restriction Barrier Modal */}
      <AnimatePresence>
        {permissionAlert.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-espresso-900 rounded-[2rem] p-6 shadow-2xl border border-black/10 dark:border-white/10 space-y-5 text-right backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
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
                        setPostLoginRedirect('reels');
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-3 px-4 bg-[#6B3A1F] text-[#FFF9EE] text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>تسجيل الدخول كبائع</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPermissionAlert((prev) => ({ ...prev, isOpen: false }))}
                      className="w-full sm:w-auto py-3 px-4 bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPermissionAlert((prev) => ({ ...prev, isOpen: false }))}
                    className="w-full py-3 px-4 bg-[#6B3A1F] text-[#FFF9EE] text-xs sm:text-sm font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    فهمت ذلك
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CraftReelsPage;