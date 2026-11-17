import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Camera,
  MapPin,
  Search,
  Eye,
  Heart,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  X,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { Creator, CreatorPhoto, Governorate, PhotoCategory } from '../../types.ts';
import { creatorApi } from '../../services/api.ts';
import { useApp } from '../../context/AppContext.tsx';

const GOVERNORATES: Governorate[] = [
  'أسوان',
  'الأقصر',
  'قنا',
  'سوهاج',
  'أسيوط',
  'المنيا',
  'بني سويف',
  'الوادي الجديد',
  'الفيوم',
  'البحر الاحمر',
  'القاهرة',
  'الجيزة',
  'الإسكندرية'
];

const PHOTO_CATEGORIES: { id: 'all' | PhotoCategory; label: string }[] = [
  { id: 'all', label: 'كل التصنيفات' },
  { id: 'heritage', label: 'تراث صعيدي وفلكلور' },
  { id: 'crafts', label: 'حرف وصناعات يدوية' },
  { id: 'landmarks', label: 'معالم وآثار تاريخية' },
  { id: 'daily_life', label: 'حياة يومية وعادات' },
  { id: 'festivals', label: 'موالد واحتفالات' },
  { id: 'communities', label: 'مجتمعات وبيئات الصعيد' },
  { id: 'food', label: 'أكلات ومطبخ صعيدي' },
  { id: 'nature', label: 'طبيعة ونيل الصعيد' },
  { id: 'other', label: 'أخرى' }
];

export const CreatorsGalleryPage: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    navigateToCreator,
    setActivePage,
    setIsCreatorApplyModalOpen,
    setIsAuthModalOpen,
    setAuthModalTab,
    creatorsGalleryTab,
    setCreatorsGalleryTab
  } = useApp();

  const [activeView, setActiveView] = useState<'creators' | 'photos'>(creatorsGalleryTab || 'creators');

  useEffect(() => {
    setActiveView(creatorsGalleryTab || 'creators');
  }, [creatorsGalleryTab]);

  const handleSwitchView = (view: 'creators' | 'photos') => {
    setActiveView(view);
    setCreatorsGalleryTab(view);
    try {
      const targetUrl = view === 'photos' ? '/creators?tab=photos' : '/creators';
      window.history.replaceState({ page: 'creators', tab: view }, '', targetUrl);
    } catch { }
  };

  // Creators Directory State
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoadingCreators, setIsLoadingCreators] = useState(true);
  const [creatorGovFilter, setCreatorGovFilter] = useState<string>('all');
  const [creatorSearch, setCreatorSearch] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Photos Gallery State
  const [photos, setPhotos] = useState<CreatorPhoto[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [photoGovFilter, setPhotoGovFilter] = useState<string>('all');
  const [photoCatFilter, setPhotoCatFilter] = useState<string>('all');
  const [photoSearch, setPhotoSearch] = useState('');

  // Lightbox State
  const [selectedPhoto, setSelectedPhoto] = useState<CreatorPhoto | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const loadCreators = useCallback(async () => {
    setIsLoadingCreators(true);
    try {
      const list = await creatorApi.getPublicCreators({
        governorate: creatorGovFilter !== 'all' ? creatorGovFilter : undefined,
        search: creatorSearch.trim() || undefined,
        verifiedOnly
      });
      setCreators(list || []);
    } catch {
      setCreators([]);
    } finally {
      setIsLoadingCreators(false);
    }
  }, [creatorGovFilter, creatorSearch, verifiedOnly]);

  const loadPhotos = useCallback(async () => {
    setIsLoadingPhotos(true);
    try {
      const list = await creatorApi.getPublicPhotos({
        governorate: photoGovFilter !== 'all' ? photoGovFilter : undefined,
        category: photoCatFilter !== 'all' ? photoCatFilter : undefined,
        search: photoSearch.trim() || undefined,
        limit: 40
      });
      setPhotos(list || []);
    } catch {
      setPhotos([]);
    } finally {
      setIsLoadingPhotos(false);
    }
  }, [photoGovFilter, photoCatFilter, photoSearch]);

  useEffect(() => {
    loadCreators();
  }, [loadCreators]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  useEffect(() => {
    if (!selectedPhoto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
      } else if (e.key === 'ArrowRight' && selectedPhoto.images.length > 1) {
        setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : selectedPhoto.images.length - 1));
      } else if (e.key === 'ArrowLeft' && selectedPhoto.images.length > 1) {
        setActivePhotoIdx((prev) => (prev < selectedPhoto.images.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedPhoto]);

  const handleJoinCreatorClick = () => {
    if (!isAuthenticated || !currentUser || currentUser.role === 'guest' || currentUser.id === 'guest-visitor') {
      setAuthModalTab('register');
      setIsAuthModalOpen(true);
      return;
    }
    if (currentUser.role === 'creator') {
      setActivePage('creator-dashboard');
      return;
    }
    if (currentUser.role === 'buyer') {
      setIsCreatorApplyModalOpen(true);
    }
  };

  const handleOpenLightbox = (photo: CreatorPhoto) => {
    setSelectedPhoto(photo);
    setActivePhotoIdx(0);
    creatorApi.viewCreatorPhoto(photo.id).catch(() => {});
    setPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, viewsCount: (p.viewsCount || 0) + 1 } : p))
    );
  };

  const handleLikePhoto = async (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await creatorApi.likeCreatorPhoto(photoId);
      setPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, likesCount: res.likesCount } : p))
      );
      if (selectedPhoto && selectedPhoto.id === photoId) {
        setSelectedPhoto((prev) => (prev ? { ...prev, likesCount: res.likesCount } : null));
      }
    } catch { }
  };

  const getCategoryLabel = (catId: string) => {
    const found = PHOTO_CATEGORIES.find((c) => c.id === catId);
    return found ? found.label : catId;
  };

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-[#120904] text-espresso dark:text-cream pb-20 font-cairo transition-colors" dir="rtl">
      {/* Editorial Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#2A160B] via-[#1E0F07] to-[#120904] text-white border-b border-[#382317]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(230,106,46,0.22),transparent_55%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-amber-300 text-xs font-bold">
                <Camera className="w-3.5 h-3.5" />
                <span>عدسة وه التراثية</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black leading-tight text-white">
                صُنّاع المحتوى ومعارض الصور في الصعيد
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl">
                اكتشف المصورين والمبدعين الذين يوثقون معالم الصعيد، حرفه اليدوية، أسواقه، وحكايات أهله بالصورة والفيديو.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {currentUser?.role !== 'seller' && currentUser?.role !== 'admin' && (
                <button
                  type="button"
                  onClick={handleJoinCreatorClick}
                  className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {currentUser?.role === 'creator' ? 'لوحة صانع المحتوى' : 'انضم كصانع محتوى'}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActivePage('reels')}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Film className="w-4 h-4 text-amber-400" />
                <span>مشاهدة حكايات وه</span>
              </button>
            </div>
          </div>

          {/* Primary Switcher Tabs */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => handleSwitchView('creators')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeView === 'creators'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white/10 text-stone-300 hover:bg-white/15 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>دليل صُنّاع المحتوى ({creators.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchView('photos')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeView === 'photos'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white/10 text-stone-300 hover:bg-white/15 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>معرض صور الصعيد ({photos.length})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {activeView === 'creators' ? (
          <>
            {/* Creators Filters Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={creatorSearch}
                  onChange={(e) => setCreatorSearch(e.target.value)}
                  placeholder="ابحث باسم صانع المحتوى، المدينة، أو التخصص..."
                  className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] bg-stone-50 dark:bg-[#140A05] text-xs text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={creatorGovFilter}
                    onChange={(e) => setCreatorGovFilter(e.target.value)}
                    className="pr-9 pl-4 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] bg-stone-50 dark:bg-[#140A05] text-xs font-bold text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                  >
                    <option value="all">كل المحافظات</option>
                    {GOVERNORATES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setVerifiedOnly((prev) => !prev)}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    verifiedOnly
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                      : 'border-stone-200 dark:border-[#382317] bg-stone-50 dark:bg-[#140A05] text-stone-600 dark:text-stone-300 hover:border-primary/40'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>الموثقون فقط</span>
                </button>
              </div>
            </div>

            {/* Creators Grid */}
            {isLoadingCreators ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="h-64 rounded-3xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] animate-pulse p-5"
                  />
                ))}
              </div>
            ) : creators.length === 0 ? (
              <div className="py-16 text-center bg-white dark:bg-[#1C0E07] rounded-3xl border border-sand-200 dark:border-[#382317] p-8 space-y-3">
                <Sparkles className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto" />
                <h3 className="text-sm font-bold text-espresso dark:text-cream">
                  لا يوجد صنّاع محتوى مطابقون لبحثك حالياً
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  جرّب تغيير المحافظة أو مسح كلمات البحث لاستكشاف جميع المبدعين في الصعيد.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {creators.map((creator) => (
                  <motion.div
                    key={creator.id}
                    whileHover={{ y: -4 }}
                    onClick={() => navigateToCreator(creator.id)}
                    className="group rounded-3xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] p-5 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3.5">
                        <div className="relative shrink-0">
                          <img
                            src={creator.avatar || 'https://res.cloudinary.com/kuana1nl/image/upload/v1788710904/user.jpg'}
                            alt={creator.name}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/30 shadow-sm"
                          />
                          {creator.verified && (
                            <span
                              className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center border-2 border-white dark:border-[#1C0E07]"
                              title="صانع محتوى موثق"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-black text-espresso dark:text-cream truncate group-hover:text-primary transition-colors">
                              {creator.name}
                            </h3>
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-primary shrink-0" />
                            <span className="truncate">
                              {creator.city ? `${creator.city}، ` : ''}
                              {creator.governorate}
                            </span>
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-2">
                        {creator.bio}
                      </p>

                      {creator.specialties && creator.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {creator.specialties.slice(0, 3).map((spec, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-[#25150C] text-[10px] font-medium text-stone-600 dark:text-stone-300"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-stone-100 dark:border-[#2C1A10] flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Film className="w-3.5 h-3.5 text-primary" />
                          <span>{creator.stats?.reelsCount || 0}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
                          <span>{creator.stats?.photosCount || 0}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-stone-400" />
                          <span>{(creator.stats?.viewsCount || 0).toLocaleString('ar-EG')}</span>
                        </span>
                      </div>

                      <span className="text-primary font-bold flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
                        <span>عرض الحساب</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Photos Gallery Filters */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={photoSearch}
                  onChange={(e) => setPhotoSearch(e.target.value)}
                  placeholder="ابحث في المعارض التراثية بالعنوان، المكان، أو القصة..."
                  className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] bg-stone-50 dark:bg-[#140A05] text-xs text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Filter className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={photoCatFilter}
                    onChange={(e) => setPhotoCatFilter(e.target.value)}
                    className="pr-9 pl-4 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] bg-stone-50 dark:bg-[#140A05] text-xs font-bold text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                  >
                    {PHOTO_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={photoGovFilter}
                    onChange={(e) => setPhotoGovFilter(e.target.value)}
                    className="pr-9 pl-4 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] bg-stone-50 dark:bg-[#140A05] text-xs font-bold text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                  >
                    <option value="all">كل المحافظات</option>
                    {GOVERNORATES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Photos Grid */}
            {isLoadingPhotos ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="h-72 rounded-3xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] animate-pulse"
                  />
                ))}
              </div>
            ) : photos.length === 0 ? (
              <div className="py-16 text-center bg-white dark:bg-[#1C0E07] rounded-3xl border border-sand-200 dark:border-[#382317] p-8 space-y-3">
                <ImageIcon className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto" />
                <h3 className="text-sm font-bold text-espresso dark:text-cream">
                  لا توجد معارض صور مطابقة لبحثك حالياً
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  جرّب اختيار تصنيف أو محافظة أخرى لعرض الصور التراثية المعتمدة.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {photos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    whileHover={{ y: -4 }}
                    onClick={() => handleOpenLightbox(photo)}
                    className="group rounded-3xl overflow-hidden bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative aspect-[4/3] bg-stone-100 dark:bg-[#160B05] overflow-hidden">
                      <img
                        src={photo.images[0]}
                        alt={photo.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-lg bg-primary text-white text-[10px] font-bold shadow">
                        {photo.governorate}
                      </span>
                      {photo.images.length > 1 && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/70 text-white text-[10px] font-bold backdrop-blur-sm flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          <span>{photo.images.length} صور</span>
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-primary">
                          {getCategoryLabel(photo.category)}
                        </span>
                        <h3 className="text-sm font-bold text-espresso dark:text-cream line-clamp-1">
                          {photo.title}
                        </h3>
                        <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                          {photo.caption}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-stone-100 dark:border-[#2C1A10] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (photo.creatorId) navigateToCreator(photo.creatorId);
                          }}
                          className="flex items-center gap-2 min-w-0 hover:text-primary transition-colors cursor-pointer"
                        >
                          <img
                            src={photo.creatorAvatar || 'https://res.cloudinary.com/kuana1nl/image/upload/v1788710904/user.jpg'}
                            alt={photo.creatorName}
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-full object-cover border border-stone-200 dark:border-[#382317] shrink-0"
                          />
                          <span className="text-[11px] font-bold truncate">
                            {photo.creatorName}
                          </span>
                        </button>

                        <div className="flex items-center gap-3 text-[11px] text-stone-500 shrink-0">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {(photo.viewsCount || 0).toLocaleString('ar-EG')}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleLikePhoto(photo.id, e)}
                            className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                            <span>{(photo.likesCount || 0).toLocaleString('ar-EG')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Multi-Image Gallery Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[94vh]"
            >
              {/* Header */}
              <div className="p-4 flex items-center justify-between border-b border-white/10 bg-black/40 text-white shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-sm font-bold truncate">{selectedPhoto.title}</h3>
                  <span className="text-xs text-white/60 shrink-0">
                    ({activePhotoIdx + 1} من {selectedPhoto.images.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Image */}
              <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[280px] sm:min-h-[420px]">
                <img
                  src={selectedPhoto.images[activePhotoIdx]}
                  alt={`${selectedPhoto.title} - ${activePhotoIdx + 1}`}
                  referrerPolicy="no-referrer"
                  className="max-h-[56vh] max-w-full object-contain"
                />

                {selectedPhoto.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIdx((prev) =>
                          prev > 0 ? prev - 1 : selectedPhoto.images.length - 1
                        )
                      }
                      className="absolute right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIdx((prev) =>
                          prev < selectedPhoto.images.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="absolute left-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              {selectedPhoto.images.length > 1 && (
                <div className="px-4 py-2 bg-black/70 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                  {selectedPhoto.images.map((thumbUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        idx === activePhotoIdx
                          ? 'border-primary scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={thumbUrl}
                        alt={`thumb-${idx}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Caption & Creator Footer */}
              <div className="p-4 bg-stone-900/90 border-t border-white/10 text-white space-y-2 shrink-0">
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-h-24 overflow-y-auto">
                  {selectedPhoto.caption}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400 pt-1">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const cid = selectedPhoto.creatorId;
                        setSelectedPhoto(null);
                        if (cid) navigateToCreator(cid);
                      }}
                      className="flex items-center gap-1.5 text-white hover:text-primary font-bold transition-colors cursor-pointer"
                    >
                      <img
                        src={selectedPhoto.creatorAvatar || 'https://res.cloudinary.com/kuana1nl/image/upload/v1788710904/user.jpg'}
                        alt={selectedPhoto.creatorName}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span>{selectedPhoto.creatorName}</span>
                    </button>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {selectedPhoto.location || selectedPhoto.governorate}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleLikePhoto(selectedPhoto.id, e)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                    <span>{selectedPhoto.likesCount || 0}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
