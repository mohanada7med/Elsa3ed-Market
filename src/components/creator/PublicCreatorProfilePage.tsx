import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  MapPin,
  Eye,
  Heart,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  Instagram,
  Youtube,
  Globe,
  Share2,
  ArrowRight,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Layers,
  Check,
  Sparkles
} from 'lucide-react';
import { Creator, CraftReel, CreatorPhoto, CreatorStats } from '../../types.ts';
import { creatorApi } from '../../services/api.ts';
import { useApp } from '../../context/AppContext.tsx';
import { CraftReelsModal } from '../public/CraftReelsModal.tsx';
import { getOptimizedVideoPoster } from '../../utils/cloudinaryMedia.ts';

interface PublicCreatorProfilePageProps {
  creatorId: string;
  onBack?: () => void;
  onReelClick?: (reel: CraftReel) => void;
}

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

export const PublicCreatorProfilePage: React.FC<PublicCreatorProfilePageProps> = ({
  creatorId,
  onBack,
  onReelClick
}) => {
  const {
    setActivePage,
    navigateToCreatorsGallery,
    navigateToCreator,
    navigateToProduct,
    navigateToSeller
  } = useApp();

  const [creator, setCreator] = useState<Creator | null>(null);
  const [reels, setReels] = useState<CraftReel[]>([]);
  const [photos, setPhotos] = useState<CreatorPhoto[]>([]);
  const [stats, setStats] = useState<CreatorStats>({
    reelsCount: 0,
    photosCount: 0,
    viewsCount: 0,
    likesCount: 0
  });

  const [activeTab, setActiveTab] = useState<'all' | 'reels' | 'photos'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive Viewers
  const [selectedPhoto, setSelectedPhoto] = useState<CreatorPhoto | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [activeModalReelId, setActiveModalReelId] = useState<string | null>(null);
  const [isCopiedShare, setIsCopiedShare] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await creatorApi.getPublicCreatorProfile(creatorId);
        if (!isMounted) return;
        if (!data || !data.creator) {
          setError('صانع المحتوى غير موجود أو حسابه غير معتمد حالياً');
          return;
        }
        setCreator(data.creator);
        const loadedReels = data.reels || [];
        const loadedPhotos = data.photos || [];
        setReels(loadedReels);
        setPhotos(loadedPhotos);
        setStats(
          data.stats || {
            reelsCount: loadedReels.length,
            photosCount: loadedPhotos.length,
            viewsCount: 0,
            likesCount: 0
          }
        );

        if (loadedReels.length > 0 && loadedPhotos.length > 0) {
          setActiveTab('all');
        } else if (loadedReels.length === 0 && loadedPhotos.length > 0) {
          setActiveTab('photos');
        } else if (loadedReels.length > 0) {
          setActiveTab('reels');
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'فشل في تحميل ملف صانع المحتوى');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (creatorId) {
      loadProfile();
    }
    return () => {
      isMounted = false;
    };
  }, [creatorId]);

  // Keyboard Navigation for Photo Lightbox
  useEffect(() => {
    if (!selectedPhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
      } else if (e.key === 'ArrowRight' && selectedPhoto.images.length > 1) {
        setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : selectedPhoto.images.length - 1));
      } else if (e.key === 'ArrowLeft' && selectedPhoto.images.length > 1) {
        setActivePhotoIdx((prev) => (prev < selectedPhoto.images.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto]);

  // Schema.org Structured Data & Meta Injection for SEO
  useEffect(() => {
    if (!creator) return;
    const scriptId = 'creator-structured-data';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: creator.name,
        description: creator.bio,
        image: creator.avatar,
        homeLocation: {
          '@type': 'AdministrativeArea',
          name: `${creator.city ? creator.city + '، ' : ''}${creator.governorate}`
        },
        interactionStatistic: [
          {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/WatchAction',
            userInteractionCount: stats.viewsCount
          },
          {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/LikeAction',
            userInteractionCount: stats.likesCount
          }
        ]
      }
    };

    scriptTag.textContent = JSON.stringify(structuredData);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [creator, stats]);

  const joinedLabel = useMemo(() => {
    if (!creator?.createdAt) return null;
    try {
      return new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'long' }).format(
        new Date(creator.createdAt)
      );
    } catch {
      return null;
    }
  }, [creator?.createdAt]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${creator?.name} | عدسة وه`,
          text: creator?.bio,
          url
        });
        return;
      } catch { }
    }
    navigator.clipboard?.writeText(url);
    setIsCopiedShare(true);
    setTimeout(() => setIsCopiedShare(false), 2000);
  };

  const handleOpenPhotoLightbox = (item: CreatorPhoto) => {
    setSelectedPhoto(item);
    setActivePhotoIdx(0);
    creatorApi.viewCreatorPhoto(item.id).catch(() => {});
    setPhotos((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, viewsCount: (p.viewsCount || 0) + 1 } : p))
    );
    setStats((prev) => ({ ...prev, viewsCount: (prev.viewsCount || 0) + 1 }));
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
      setStats((prev) => ({ ...prev, likesCount: (prev.likesCount || 0) + 1 }));
    } catch { }
  };

  const handleOpenReel = (reel: CraftReel) => {
    if (onReelClick) {
      onReelClick(reel);
    } else {
      setActiveModalReelId(reel.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand-50 dark:bg-[#120904] flex items-center justify-center p-4" dir="rtl">
        <div className="text-center space-y-3 font-cairo">
          <div className="w-10 h-10 border-2 border-[#C99444]/30 border-t-[#E66A2E] rounded-full animate-spin mx-auto" />
          <p className="text-xs sm:text-sm text-espresso/60 dark:text-cream/60">
            جاري تحميل ملف صانع المحتوى...
          </p>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-sand-50 dark:bg-[#120904] flex items-center justify-center p-4 font-cairo" dir="rtl">
        <div className="max-w-md w-full bg-white dark:bg-[#1A0E08] rounded-2xl p-8 text-center space-y-4 border border-sand-200 dark:border-[#382317]">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Camera className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-espresso dark:text-cream font-main">
            صانع المحتوى غير متاح
          </h2>
          <p className="text-xs text-espresso/65 dark:text-cream/65 leading-relaxed">
            {error || 'لم نتمكن من العثور على هذا الحساب أو أنه غير معتمد حالياً.'}
          </p>
          <div className="flex items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => (onBack ? onBack() : navigateToCreatorsGallery('creators'))}
              className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              دليل صنّاع المحتوى
            </button>
            <button
              type="button"
              onClick={() => setActivePage('home')}
              className="px-5 py-2.5 border border-sand-200 dark:border-[#382317] text-espresso dark:text-cream rounded-xl text-xs font-bold hover:border-primary transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalWorks = reels.length + photos.length;
  const showReelsSection = (activeTab === 'all' || activeTab === 'reels') && reels.length > 0;
  const showPhotosSection = (activeTab === 'all' || activeTab === 'photos') && photos.length > 0;

  return (
    <div
      className="min-h-screen bg-sand-50 dark:bg-[#120904] text-espresso dark:text-cream pb-20 font-cairo transition-colors"
      dir="rtl"
    >
      {/* Top Sub-Navigation Strip */}
      <div className="bg-white/90 dark:bg-[#160B05]/90 backdrop-blur-md sticky top-0 z-30 border-b border-sand-200 dark:border-[#2C1A10]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => (onBack ? onBack() : navigateToCreatorsGallery('creators'))}
              className="flex items-center gap-1.5 text-xs font-bold text-espresso dark:text-cream hover:text-primary dark:hover:text-[#C99444] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
              <span>رجوع</span>
            </button>
            <span className="text-espresso/25 dark:text-cream/20">/</span>
            <button
              type="button"
              onClick={() => navigateToCreatorsGallery('creators')}
              className="text-xs font-semibold text-espresso/65 dark:text-cream/65 hover:text-primary dark:hover:text-[#C99444] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              دليل الصنّاع
            </button>
            <span className="hidden sm:inline text-espresso/25 dark:text-cream/20">/</span>
            <button
              type="button"
              onClick={() => navigateToCreatorsGallery('photos')}
              className="hidden sm:inline text-xs font-semibold text-espresso/65 dark:text-cream/65 hover:text-primary dark:hover:text-[#C99444] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              معرض صور الصعيد
            </button>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="px-3.5 py-1.5 rounded-xl border border-sand-200 dark:border-[#382317] bg-white dark:bg-[#1E110A] hover:border-primary/60 text-xs font-bold text-espresso dark:text-cream transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            {isCopiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>تم النسخ</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-primary dark:text-[#C99444]" />
                <span>مشاركة الصفحة</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editorial Portfolio Hero Band */}
      <section className="relative overflow-hidden border-b border-sand-200 dark:border-[#2C1A10] bg-gradient-to-b from-white via-sand-50/60 to-sand-50 dark:from-[#1B0F08] dark:via-[#150B06] dark:to-[#120904]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,148,68,0.12),transparent_60%)]" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 text-center md:text-right">
            {/* Portrait Frame */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-[#6B3A1F] to-[#26160D] ring-1 ring-[#C99444]/40 shadow-lg">
                {creator.avatar ? (
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#FFF9EE] text-3xl font-black">
                    {creator.name.charAt(0)}
                  </div>
                )}
              </div>

              {creator.verified && (
                <div
                  className="absolute -bottom-1.5 -left-1.5 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center border-2 border-white dark:border-[#1B0F08] shadow-sm"
                  title="صانع محتوى موثق ومعتمد في منصة وه"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Identity, Story & Metadata */}
            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center justify-center md:justify-start gap-2 text-xs font-extrabold text-primary dark:text-[#C99444]">
                    <Camera className="w-3.5 h-3.5" />
                    <span>صانع محتوى وتوثيق تراثي</span>
                    {creator.verified && (
                      <>
                        <span className="text-espresso/30 dark:text-cream/30">·</span>
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Sparkles className="w-3 h-3" />
                          موثق في وه
                        </span>
                      </>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-black text-espresso dark:text-cream font-main tracking-tight text-balance">
                    {creator.name}
                  </h1>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-xs text-espresso/65 dark:text-cream/65">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-primary dark:text-[#C99444]" />
                      {creator.city ? `${creator.city}، ` : ''}
                      {creator.governorate}
                    </span>
                    {joinedLabel && (
                      <>
                        <span className="text-espresso/25 dark:text-cream/25">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-espresso/45 dark:text-cream/45" />
                          انضم في {joinedLabel}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Social Channels */}
                {creator.socialLinks && Object.values(creator.socialLinks).some(Boolean) && (
                  <div className="flex items-center justify-center md:justify-end gap-2 shrink-0">
                    {creator.socialLinks.instagram && (
                      <a
                        href={
                          creator.socialLinks.instagram.startsWith('http')
                            ? creator.socialLinks.instagram
                            : `https://instagram.com/${creator.socialLinks.instagram.replace('@', '')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="w-9 h-9 rounded-xl border border-sand-200 dark:border-[#382317] bg-white dark:bg-[#1E110A] flex items-center justify-center text-pink-600 hover:border-pink-400 transition-colors"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {creator.socialLinks.youtube && (
                      <a
                        href={
                          creator.socialLinks.youtube.startsWith('http')
                            ? creator.socialLinks.youtube
                            : `https://youtube.com/${creator.socialLinks.youtube}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="YouTube"
                        className="w-9 h-9 rounded-xl border border-sand-200 dark:border-[#382317] bg-white dark:bg-[#1E110A] flex items-center justify-center text-red-600 hover:border-red-400 transition-colors"
                      >
                        <Youtube className="w-4 h-4" />
                      </a>
                    )}
                    {creator.socialLinks.tiktok && (
                      <a
                        href={
                          creator.socialLinks.tiktok.startsWith('http')
                            ? creator.socialLinks.tiktok
                            : `https://tiktok.com/@${creator.socialLinks.tiktok.replace('@', '')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="TikTok"
                        className="w-9 h-9 rounded-xl border border-sand-200 dark:border-[#382317] bg-white dark:bg-[#1E110A] flex items-center justify-center text-espresso dark:text-cream hover:border-primary transition-colors"
                      >
                        <Film className="w-4 h-4" />
                      </a>
                    )}
                    {creator.socialLinks.facebook && (
                      <a
                        href={
                          creator.socialLinks.facebook.startsWith('http')
                            ? creator.socialLinks.facebook
                            : `https://facebook.com/${creator.socialLinks.facebook}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook"
                        className="w-9 h-9 rounded-xl border border-sand-200 dark:border-[#382317] bg-white dark:bg-[#1E110A] flex items-center justify-center text-blue-600 hover:border-blue-400 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Bio */}
              <p className="text-sm sm:text-base text-espresso/85 dark:text-cream/85 leading-relaxed max-w-2xl mx-auto md:mx-0">
                {creator.bio}
              </p>

              {/* Unboxed Editorial Specialties */}
              {creator.specialties && creator.specialties.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2.5 gap-y-1 text-xs font-bold text-espresso/75 dark:text-[#D6C6B1]">
                  {creator.specialties.map((spec, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && (
                        <span className="text-espresso/30 dark:text-cream/30">·</span>
                      )}
                      <span>{spec}</span>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hairline 4-Column Tabular Metrics Strip */}
          <div className="mt-8 pt-6 border-t border-sand-200 dark:border-[#2C1A10] grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-sand-200/80 dark:divide-[#2C1A10]">
            <div className="py-2 sm:py-0 sm:px-4 text-center md:text-right">
              <div className="text-xl sm:text-2xl font-black text-espresso dark:text-cream tabular-nums">
                {(stats.reelsCount || reels.length).toLocaleString('ar-EG')}
              </div>
              <div className="text-xs text-espresso/60 dark:text-cream/60 mt-0.5">
                مقطع ريلز منشور
              </div>
            </div>

            <div className="py-2 sm:py-0 sm:px-4 text-center md:text-right">
              <div className="text-xl sm:text-2xl font-black text-espresso dark:text-cream tabular-nums">
                {(stats.photosCount || photos.length).toLocaleString('ar-EG')}
              </div>
              <div className="text-xs text-espresso/60 dark:text-cream/60 mt-0.5">
                ألبوم صور تراثية
              </div>
            </div>

            <div className="py-2 sm:py-0 sm:px-4 text-center md:text-right">
              <div className="text-xl sm:text-2xl font-black text-espresso dark:text-cream tabular-nums">
                {(stats.viewsCount || 0).toLocaleString('ar-EG')}
              </div>
              <div className="text-xs text-espresso/60 dark:text-cream/60 mt-0.5">
                مشاهدة للجمهور
              </div>
            </div>

            <div className="py-2 sm:py-0 sm:px-4 text-center md:text-right">
              <div className="text-xl sm:text-2xl font-black text-espresso dark:text-cream tabular-nums">
                {(stats.likesCount || 0).toLocaleString('ar-EG')}
              </div>
              <div className="text-xs text-espresso/60 dark:text-cream/60 mt-0.5">
                إعجاب وتفاعل
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Portfolio Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-10">
        {/* Work Filter Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sand-200 dark:border-[#2C1A10] pb-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                activeTab === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-espresso/70 dark:text-cream/70 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              كل الأعمال ({totalWorks})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reels')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                activeTab === 'reels'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-espresso/70 dark:text-cream/70 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>الريلز ({reels.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                activeTab === 'photos'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-espresso/70 dark:text-cream/70 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>معارض الصور ({photos.length})</span>
            </button>
          </div>

          <span className="text-xs text-espresso/55 dark:text-cream/55">
            اضغط على أي ريل للمشاهدة التفاعلية أو أي ألبوم لفتح المعرض
          </span>
        </div>

        {/* Empty State if no published works yet */}
        {totalWorks === 0 && (
          <div className="text-center py-16 space-y-3 bg-white dark:bg-[#1B1009] rounded-2xl border border-sand-200 dark:border-[#382317] p-8">
            <Camera className="w-10 h-10 text-espresso/30 dark:text-cream/30 mx-auto" />
            <h3 className="text-sm sm:text-base font-black text-espresso dark:text-cream">
              لم ينشر {creator.name} أعمالاً بعد
            </h3>
            <p className="text-xs text-espresso/60 dark:text-cream/60 max-w-md mx-auto">
              ستظهر هنا جميع مقاطع الريلز ومعارض الصور فور نشرها من قِبل صانع المحتوى.
            </p>
          </div>
        )}

        {/* Section 1: Reels Showcase */}
        {showReelsSection && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-espresso dark:text-cream font-main flex items-center gap-2">
                <Film className="w-4 h-4 text-primary dark:text-[#C99444]" />
                <span>الريلز والحكايات المصورة</span>
              </h2>
              <span className="text-xs font-bold text-espresso/55 dark:text-cream/55 tabular-nums">
                {reels.length} مقطع
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
              {reels.map((reel) => {
                const poster = getOptimizedVideoPoster(
                  reel.videoUrl,
                  reel.posterUrl || reel.productImage,
                  600
                );
                return (
                  <motion.article
                    key={reel.id}
                    whileHover={{ y: -3 }}
                    onClick={() => handleOpenReel(reel)}
                    className="relative group rounded-2xl overflow-hidden aspect-[9/16] bg-[#180C06] border border-sand-200/80 dark:border-[#382317] shadow-sm hover:shadow-xl transition-all cursor-pointer"
                  >
                    {poster ? (
                      <img
                        src={poster}
                        alt={reel.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2B170B] via-[#1C0E07] to-[#0E0603] text-[#C99444]/60 p-4 text-center">
                        <Film className="w-9 h-9 mb-2" />
                        <span className="text-xs font-bold text-white/70 line-clamp-2">{reel.title}</span>
                      </div>
                    )}

                    {/* Measured bottom scrim only */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

                    {/* Top Duration */}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-sm text-white text-[10px] font-bold tabular-nums">
                      {reel.duration || '0:30'}
                    </div>

                    {/* Play hint on hover */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-current mr-0.5" />
                      </div>
                    </div>

                    {/* Bottom Meta */}
                    <div className="absolute bottom-3 inset-x-3 text-white space-y-1.5">
                      {(reel.location || reel.governorate) && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{reel.location || reel.governorate}</span>
                        </div>
                      )}

                      <h3 className="text-xs sm:text-sm font-bold line-clamp-2 leading-snug">
                        {reel.title}
                      </h3>

                      <div className="flex items-center justify-between text-[11px] text-white/80 pt-1 tabular-nums">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {(reel.viewsCount || 0).toLocaleString('ar-EG')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                          {(reel.likesCount || 0).toLocaleString('ar-EG')}
                        </span>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>
        )}

        {/* Section 2: Empty Reels notice if user explicitly clicked Reels tab */}
        {activeTab === 'reels' && reels.length === 0 && totalWorks > 0 && (
          <div className="text-center py-14 space-y-2 bg-white dark:bg-[#1B1009] rounded-2xl border border-sand-200 dark:border-[#382317] p-8">
            <Film className="w-10 h-10 text-espresso/30 dark:text-cream/30 mx-auto" />
            <h3 className="text-sm font-bold text-espresso dark:text-cream">لا توجد مقاطع ريلز منشورة بعد</h3>
          </div>
        )}

        {/* Section 3: Documentary Photos Grid */}
        {showPhotosSection && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-espresso dark:text-cream font-main flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary dark:text-[#C99444]" />
                <span>معارض الصور التراثية</span>
              </h2>
              <span className="text-xs font-bold text-espresso/55 dark:text-cream/55 tabular-nums">
                {photos.length} ألبوم
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {photos.map((item, idx) => {
                const isLead = activeTab === 'photos' && idx === 0 && photos.length >= 3;
                return (
                  <motion.article
                    key={item.id}
                    whileHover={{ y: -3 }}
                    onClick={() => handleOpenPhotoLightbox(item)}
                    className={`group rounded-2xl overflow-hidden bg-white dark:bg-[#1B1009] border border-sand-200/80 dark:border-[#382317] shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col ${
                      isLead ? 'sm:col-span-2 lg:col-span-2' : ''
                    }`}
                  >
                    <div
                      className={`relative bg-[#160B05] overflow-hidden ${
                        isLead ? 'aspect-[16/9]' : 'aspect-[4/3]'
                      }`}
                    >
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2B170B] to-[#140A05] text-[#C99444]/60">
                          <ImageIcon className="w-10 h-10" />
                        </div>
                      )}

                      {item.images.length > 1 && (
                        <span className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/70 text-white text-[11px] font-bold backdrop-blur-sm flex items-center gap-1 tabular-nums">
                          <Layers className="w-3 h-3" />
                          <span>{item.images.length} صور</span>
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-primary dark:text-[#C99444]">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{item.location || item.governorate}</span>
                          </span>
                          <span className="text-espresso/30 dark:text-cream/30">·</span>
                          <span className="text-espresso/65 dark:text-cream/65 font-semibold">
                            {PHOTO_CATEGORY_LABELS[item.category] || item.category}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-black text-espresso dark:text-cream line-clamp-1 font-main">
                          {item.title}
                        </h3>
                        <p className="text-xs text-espresso/70 dark:text-cream/70 line-clamp-2 leading-relaxed">
                          {item.caption}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-sand-100 dark:border-[#2C1A10] text-xs text-espresso/60 dark:text-cream/60 tabular-nums">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {(item.viewsCount || 0).toLocaleString('ar-EG')} مشاهدة
                        </span>

                        <button
                          type="button"
                          aria-label="إعجاب بالألبوم"
                          onClick={(e) => handleLikePhoto(item.id, e)}
                          className="flex items-center gap-1 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                          <span>{(item.likesCount || 0).toLocaleString('ar-EG')}</span>
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>
        )}

        {/* Section 4: Empty Photos notice if user explicitly clicked Photos tab */}
        {activeTab === 'photos' && photos.length === 0 && totalWorks > 0 && (
          <div className="text-center py-14 space-y-2 bg-white dark:bg-[#1B1009] rounded-2xl border border-sand-200 dark:border-[#382317] p-8">
            <ImageIcon className="w-10 h-10 text-espresso/30 dark:text-cream/30 mx-auto" />
            <h3 className="text-sm font-bold text-espresso dark:text-cream">لا توجد معارض صور منشورة بعد</h3>
          </div>
        )}
      </div>

      {/* Upgraded Multi-Image Gallery Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <div
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/92 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-[#140A05] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[94vh]"
            >
              {/* Top Controls */}
              <div className="p-4 flex items-center justify-between border-b border-white/10 text-white shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-sm font-bold truncate">{selectedPhoto.title}</h3>
                  <span className="text-xs text-white/60 tabular-nums shrink-0">
                    ({activePhotoIdx + 1} / {selectedPhoto.images.length})
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="إغلاق المعرض"
                  onClick={() => setSelectedPhoto(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Image Viewer */}
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
                        alt={`صورة ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Bottom Caption & Metadata */}
              <div className="p-4 bg-[#180C06] border-t border-white/10 text-white space-y-2.5 shrink-0">
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-h-24 overflow-y-auto">
                  {selectedPhoto.caption}
                </p>
                <div className="flex items-center justify-between gap-3 text-xs text-stone-400 pt-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="flex items-center gap-1 text-white/90 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {selectedPhoto.location || selectedPhoto.governorate}
                    </span>
                    <span>·</span>
                    <span>{PHOTO_CATEGORY_LABELS[selectedPhoto.category] || selectedPhoto.category}</span>
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

      {/* Full Interactive Reels Feed Modal (supports comments, likes, shares, product linking) */}
      {activeModalReelId && (
        <CraftReelsModal
          reels={reels}
          initialReelId={activeModalReelId}
          isOpen={Boolean(activeModalReelId)}
          onClose={() => setActiveModalReelId(null)}
          onSelectProduct={(pid) => {
            setActiveModalReelId(null);
            navigateToProduct(pid);
          }}
          onSelectSeller={(sid) => {
            setActiveModalReelId(null);
            navigateToSeller(sid);
          }}
          onSelectCreator={(cid) => {
            setActiveModalReelId(null);
            if (cid !== creator.id) navigateToCreator(cid);
          }}
        />
      )}
    </div>
  );
};
