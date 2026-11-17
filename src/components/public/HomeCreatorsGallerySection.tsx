import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  MapPin,
  Eye,
  Heart,
  Layers,
  CheckCircle2,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Film,
  Sparkles
} from 'lucide-react';
import { Creator, CreatorPhoto } from '../../types';
import { creatorApi } from '../../services/api';
import { useApp } from '../../context/AppContext';

const PHOTO_CATEGORY_LABELS: Record<string, string> = {
  heritage: 'تراث وفلكلور',
  crafts: 'حرف وصناعات',
  landmarks: 'معالم وآثار',
  daily_life: 'حياة يومية',
  festivals: 'موالد واحتفالات',
  communities: 'مجتمعات الصعيد',
  food: 'مطبخ صعيدي',
  nature: 'طبيعة ونيل',
  other: 'توثيق صعيدي'
};

export const HomeCreatorsGallerySection: React.FC = () => {
  const {
    navigateToCreator,
    navigateToCreatorsGallery,
    currentUser,
    isAuthenticated,
    setIsCreatorApplyModalOpen,
    setAuthModalTab,
    setIsAuthModalOpen
  } = useApp();

  const [photos, setPhotos] = useState<CreatorPhoto[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedPhoto, setSelectedPhoto] = useState<CreatorPhoto | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadGalleryPreview() {
      setIsLoading(true);
      try {
        const [photosRes, creatorsRes] = await Promise.all([
          creatorApi.getPublicPhotos({ limit: 6 }).catch(() => []),
          creatorApi.getPublicCreators().catch(() => [])
        ]);
        if (!isMounted) return;
        setPhotos(Array.isArray(photosRes) ? photosRes : []);
        setCreators(Array.isArray(creatorsRes) ? creatorsRes.slice(0, 6) : []);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadGalleryPreview();
    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleJoinCreator = () => {
    if (!isAuthenticated || !currentUser || currentUser.role === 'guest' || currentUser.id === 'guest-visitor') {
      setAuthModalTab('register');
      setIsAuthModalOpen(true);
      return;
    }
    if (currentUser.role === 'buyer') {
      setIsCreatorApplyModalOpen(true);
      return;
    }
    navigateToCreatorsGallery('creators');
  };

  if (!isLoading && photos.length === 0 && creators.length === 0) {
    return (
      <section className="relative py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
        <div className="rounded-3xl border border-sand-200 dark:border-[#382317] bg-white/75 dark:bg-[#1B1009]/80 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-right max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-primary dark:text-[#C99444]">
              <Camera className="w-4 h-4" />
              <span>عدسة وه التراثية</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-espresso dark:text-cream font-main">
              صور وحكايات الصعيد بعدسة أهلها
            </h2>
            <p className="text-xs sm:text-sm text-espresso/70 dark:text-cream/70 leading-relaxed">
              توثيق بصري يومي للمعالم والأماكن والحرف في صعيد مصر. لو بتصوّر أو بتحكي عن الصعيد، انضم كصانع محتوى وشارك عدستك مع الجمهور.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleJoinCreator}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>انضم كصانع محتوى</span>
            </button>
            <button
              type="button"
              onClick={() => navigateToCreatorsGallery('photos')}
              className="px-5 py-2.5 rounded-xl border border-sand-300 dark:border-[#382317] text-xs sm:text-sm font-bold text-espresso dark:text-cream hover:border-primary transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              معرض صور الصعيد
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 620px' }}
      className="relative py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      dir="rtl"
    >
      {/* Editorial Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-wide text-primary dark:text-[#C99444]">
            <Camera className="w-4 h-4" />
            <span>عدسة وه · معرض صور الصعيد</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-espresso dark:text-cream font-main tracking-tight">
            الصعيد بعيون صُنّاع المحتوى
          </h2>
          <p className="text-xs sm:text-sm text-espresso/70 dark:text-cream/70 leading-relaxed">
            لقطات ومعارض توثيقية حية لقرى الصعيد ومعالمه وحرفه، يلتقطها المصورون وصنّاع الحكايات المعتمدون في منصة وه.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => navigateToCreatorsGallery('photos')}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer whitespace-nowrap shrink-0"
          >
            <ImageIcon className="w-4 h-4" />
            <span>معرض صور الصعيد</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => navigateToCreatorsGallery('creators')}
            className="px-4 py-2.5 rounded-xl border border-sand-300 dark:border-[#382317] bg-white/70 dark:bg-[#1E110A] hover:border-primary text-espresso dark:text-cream text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>دليل صنّاع المحتوى</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="aspect-[4/3] rounded-2xl bg-sand-100 dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Documentary Photos Bento Showcase */}
          {photos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {photos.map((photo, idx) => {
                const isLead = idx === 0 && photos.length >= 3;
                return (
                  <motion.article
                    key={photo.id}
                    whileHover={{ y: -3 }}
                    onClick={() => handleOpenLightbox(photo)}
                    className={`group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-[#1B1009] border border-sand-200/80 dark:border-[#382317] shadow-sm hover:shadow-lg transition-all flex flex-col ${
                      isLead ? 'sm:col-span-2 lg:col-span-2 lg:row-span-2' : ''
                    }`}
                  >
                    <div
                      className={`relative w-full overflow-hidden bg-[#1D1008] ${
                        isLead ? 'aspect-[16/10] lg:flex-1 lg:min-h-[340px]' : 'aspect-[4/3]'
                      }`}
                    >
                      {photo.images?.[0] ? (
                        <img
                          src={photo.images[0]}
                          alt={photo.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2B170B] to-[#140A05] text-[#C99444]/60">
                          <ImageIcon className="w-10 h-10" />
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                      {photo.images.length > 1 && (
                        <span className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/65 backdrop-blur-sm text-white text-[11px] font-bold flex items-center gap-1 tabular-nums">
                          <Layers className="w-3 h-3" />
                          <span>{photo.images.length}</span>
                        </span>
                      )}

                      <div className="absolute bottom-3 inset-x-4 text-white space-y-1">
                        <div className="flex items-center gap-2 text-[11px] text-amber-300/95 font-bold">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{photo.location || photo.governorate}</span>
                          </span>
                          <span className="text-white/50">·</span>
                          <span className="text-white/85 font-semibold">
                            {PHOTO_CATEGORY_LABELS[photo.category] || 'تراث الصعيد'}
                          </span>
                        </div>
                        <h3
                          className={`font-black leading-snug line-clamp-2 ${
                            isLead ? 'text-base sm:text-xl' : 'text-sm'
                          }`}
                        >
                          {photo.title}
                        </h3>
                      </div>
                    </div>

                    <div className="p-4 flex items-center justify-between gap-3 border-t border-sand-100 dark:border-[#2C1A10]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (photo.creatorId) navigateToCreator(photo.creatorId);
                        }}
                        className="flex items-center gap-2 min-w-0 text-right hover:text-primary transition-colors cursor-pointer"
                      >
                        {photo.creatorAvatar ? (
                          <img
                            src={photo.creatorAvatar}
                            alt={photo.creatorName}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover border border-sand-200 dark:border-[#382317] shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            {(photo.creatorName || 'ص').charAt(0)}
                          </div>
                        )}
                        <span className="text-xs font-bold text-espresso dark:text-cream truncate">
                          {photo.creatorName}
                        </span>
                      </button>

                      <div className="flex items-center gap-3 text-[11px] text-espresso/60 dark:text-cream/60 tabular-nums shrink-0">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {(photo.viewsCount || 0).toLocaleString('ar-EG')}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleLikePhoto(photo.id, e)}
                          aria-label="إعجاب بالصورة"
                          className="flex items-center gap-1 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                          <span>{(photo.likesCount || 0).toLocaleString('ar-EG')}</span>
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}

          {/* Featured Creators Row */}
          {creators.length > 0 && (
            <div className="pt-2 space-y-4">
              <div className="flex items-center justify-between border-b border-sand-200 dark:border-[#2C1A10] pb-2.5">
                <h3 className="text-sm sm:text-base font-black text-espresso dark:text-cream">
                  صُنّاع المحتوى المعتمدون
                </h3>
                <button
                  type="button"
                  onClick={() => navigateToCreatorsGallery('creators')}
                  className="text-xs font-bold text-primary dark:text-[#C99444] hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>عرض الكل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {creators.map((creator) => (
                  <button
                    key={creator.id}
                    type="button"
                    onClick={() => navigateToCreator(creator.id)}
                    className="group text-right p-4 rounded-2xl bg-white/80 dark:bg-[#1B1009] border border-sand-200 dark:border-[#382317] hover:border-primary/60 dark:hover:border-[#C99444]/60 transition-all flex items-center gap-3.5 cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      {creator.avatar ? (
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-xl object-cover ring-1 ring-[#C99444]/40"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#6B3A1F] to-[#26160D] text-[#FFF9EE] flex items-center justify-center text-lg font-black">
                          {creator.name.charAt(0)}
                        </div>
                      )}
                      {creator.verified && (
                        <span
                          className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center border-2 border-white dark:border-[#1B1009]"
                          title="موثق"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className="text-sm font-black text-espresso dark:text-cream truncate group-hover:text-primary dark:group-hover:text-[#C99444] transition-colors">
                        {creator.name}
                      </h4>
                      <p className="text-[11px] text-espresso/60 dark:text-cream/60 truncate">
                        {creator.city ? `${creator.city} · ` : ''}
                        {creator.governorate}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-espresso/70 dark:text-cream/70 tabular-nums pt-0.5">
                        <span className="inline-flex items-center gap-1">
                          <Film className="w-3 h-3 text-primary dark:text-[#C99444]" />
                          {creator.stats?.reelsCount || 0} ريل
                        </span>
                        <span className="text-espresso/30 dark:text-cream/30">·</span>
                        <span className="inline-flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-primary dark:text-[#C99444]" />
                          {creator.stats?.photosCount || 0} ألبوم
                        </span>
                      </div>
                    </div>

                    <ArrowLeft className="w-4 h-4 text-espresso/40 dark:text-cream/40 group-hover:text-primary dark:group-hover:text-[#C99444] group-hover:-translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Multi-Image Lightbox Viewer */}
      <AnimatePresence>
        {selectedPhoto && (
          <div
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-[#140A05] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[94vh]"
            >
              <div className="p-4 flex items-center justify-between border-b border-white/10 text-white shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-sm font-bold truncate">{selectedPhoto.title}</h3>
                  <span className="text-xs text-white/60 tabular-nums shrink-0">
                    ({activePhotoIdx + 1} / {selectedPhoto.images.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  aria-label="إغلاق"
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[260px] sm:min-h-[420px]">
                <img
                  src={selectedPhoto.images[activePhotoIdx]}
                  alt={`${selectedPhoto.title} - ${activePhotoIdx + 1}`}
                  referrerPolicy="no-referrer"
                  className="max-h-[58vh] max-w-full object-contain"
                />
                {selectedPhoto.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="الصورة السابقة"
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
                      aria-label="الصورة التالية"
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
                        alt={`صورة ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="p-4 bg-[#180C06] border-t border-white/10 text-white space-y-2.5 shrink-0">
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-h-24 overflow-y-auto">
                  {selectedPhoto.caption}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400 pt-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        const cid = selectedPhoto.creatorId;
                        setSelectedPhoto(null);
                        if (cid) navigateToCreator(cid);
                      }}
                      className="flex items-center gap-1.5 text-white hover:text-primary font-bold transition-colors cursor-pointer"
                    >
                      <span>{selectedPhoto.creatorName}</span>
                    </button>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {selectedPhoto.location || selectedPhoto.governorate}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleLikePhoto(selectedPhoto.id, e)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer tabular-nums"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>{(selectedPhoto.likesCount || 0).toLocaleString('ar-EG')}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
