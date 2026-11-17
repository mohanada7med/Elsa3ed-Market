import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
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
  Tag,
  Calendar,
  Layers
} from 'lucide-react';
import { Creator, CraftReel, CreatorPhoto, CreatorStats } from '../../types.ts';
import { creatorApi } from '../../services/api.ts';
import { useApp } from '../../context/AppContext.tsx';

interface PublicCreatorProfilePageProps {
  creatorId: string;
  onBack?: () => void;
  onReelClick?: (reel: CraftReel) => void;
}

export const PublicCreatorProfilePage: React.FC<PublicCreatorProfilePageProps> = ({
  creatorId,
  onBack,
  onReelClick
}) => {
  const { setActivePage } = useApp();

  const [creator, setCreator] = useState<Creator | null>(null);
  const [reels, setReels] = useState<CraftReel[]>([]);
  const [photos, setPhotos] = useState<CreatorPhoto[]>([]);
  const [stats, setStats] = useState<CreatorStats>({
    reelsCount: 0,
    photosCount: 0,
    viewsCount: 0,
    likesCount: 0
  });

  const [activeTab, setActiveTab] = useState<'reels' | 'photos'>('reels');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox / Video Modal State
  const [selectedPhoto, setSelectedPhoto] = useState<CreatorPhoto | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [selectedReel, setSelectedReel] = useState<CraftReel | null>(null);
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
        setReels(data.reels || []);
        setPhotos(data.photos || []);
        setStats(data.stats || {
          reelsCount: (data.reels || []).length,
          photosCount: (data.photos || []).length,
          viewsCount: 0,
          likesCount: 0
        });

        // Set page default tab based on available content
        if ((data.reels || []).length === 0 && (data.photos || []).length > 0) {
          setActiveTab('photos');
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

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${creator?.name} | صانع محتوى في منصة وه`,
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
    } catch { }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand-50 dark:bg-[#120904] flex items-center justify-center p-4" dir="rtl">
        <div className="text-center space-y-3 font-cairo">
          <div className="w-12 h-12 border-3 border-[#E66A2E]/20 border-t-[#E66A2E] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-stone-500 dark:text-stone-400">جاري تحميل ملف صانع المحتوى...</p>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-sand-50 dark:bg-[#120904] flex items-center justify-center p-4 font-cairo" dir="rtl">
        <div className="max-w-md w-full bg-white dark:bg-[#1E110A] rounded-3xl p-8 text-center space-y-4 border border-sand-300 dark:border-[#382317] shadow-xl">
          <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-espresso dark:text-cream">صانع المحتوى غير متاح</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            {error || 'لم نتمكن من العثور على هذا الحساب أو أنه قيد المراجعة حالياً.'}
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => (onBack ? onBack() : setActivePage('creators'))}
              className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow hover:bg-primary-hover transition-all cursor-pointer"
            >
              تصفح صنّاع المحتوى
            </button>
            <button
              type="button"
              onClick={() => setActivePage('home')}
              className="px-5 py-2.5 bg-stone-100 dark:bg-[#25150C] text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold hover:bg-stone-200 transition-all cursor-pointer"
            >
              الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-[#120904] text-espresso dark:text-cream pb-16 font-cairo transition-colors" dir="rtl">
      {/* Top Banner Navigation */}
      <div className="bg-white/80 dark:bg-[#1A0E08]/80 backdrop-blur-md sticky top-0 z-30 border-b border-sand-200 dark:border-[#2C1A10]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => (onBack ? onBack() : setActivePage('creators'))}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-primary transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>رجوع</span>
            </button>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <button
              type="button"
              onClick={() => setActivePage('creators')}
              className="text-xs font-bold text-stone-500 hover:text-primary transition-colors cursor-pointer"
            >
              دليل صنّاع المحتوى
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-stone-100 dark:bg-[#25150C] hover:bg-stone-200 dark:hover:bg-[#2F1C10] text-stone-600 dark:text-stone-300 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isCopiedShare ? 'تم نسخ الرابط!' : 'مشاركة'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Creator Hero Header Card */}
        <div className="relative rounded-3xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] p-6 sm:p-8 shadow-xl overflow-hidden">
          {/* Subtle Ambient Decorative Gradient */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#E66A2E]/15 via-[#E66A2E]/5 to-transparent pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-right">
            {/* Avatar with Verified Ring */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden p-1 bg-gradient-to-tr from-[#E66A2E] via-[#FFB703] to-[#E66A2E] shadow-xl">
                <img
                  src={creator.avatar || 'https://res.cloudinary.com/kuana1nl/image/upload/v1788710904/user.jpg'}
                  alt={creator.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-[22px] bg-white dark:bg-[#160B05]"
                />
              </div>

              {creator.verified && (
                <div
                  className="absolute -bottom-1 -left-1 bg-amber-500 text-white rounded-full p-1.5 shadow-lg border-2 border-white dark:border-[#1C0E07]"
                  title="صانع محتوى موثق ومعتمد رسمياً في منصة وه"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black text-espresso dark:text-cream">
                      {creator.name}
                    </h1>
                    {creator.verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 to-amber-600/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[11px] font-bold">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        موثق في وه
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-stone-500 dark:text-stone-400 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {creator.city ? `${creator.city}، ` : ''}
                      {creator.governorate}
                    </span>
                    <span>•</span>
                    <span>صانع محتوى صعيدي</span>
                  </div>
                </div>

                {/* Social Links */}
                {creator.socialLinks && Object.values(creator.socialLinks).some(Boolean) && (
                  <div className="flex items-center justify-center gap-2">
                    {creator.socialLinks.instagram && (
                      <a
                        href={creator.socialLinks.instagram.startsWith('http') ? creator.socialLinks.instagram : `https://instagram.com/${creator.socialLinks.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-stone-100 dark:bg-[#28160C] text-pink-600 hover:bg-pink-50 transition-colors"
                        title="Instagram"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {creator.socialLinks.youtube && (
                      <a
                        href={creator.socialLinks.youtube.startsWith('http') ? creator.socialLinks.youtube : `https://youtube.com/${creator.socialLinks.youtube}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-stone-100 dark:bg-[#28160C] text-red-600 hover:bg-red-50 transition-colors"
                        title="YouTube"
                      >
                        <Youtube className="w-4 h-4" />
                      </a>
                    )}
                    {creator.socialLinks.tiktok && (
                      <a
                        href={creator.socialLinks.tiktok.startsWith('http') ? creator.socialLinks.tiktok : `https://tiktok.com/@${creator.socialLinks.tiktok.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-stone-100 dark:bg-[#28160C] text-stone-800 dark:text-stone-200 hover:bg-stone-200 transition-colors"
                        title="TikTok"
                      >
                        <Film className="w-4 h-4" />
                      </a>
                    )}
                    {creator.socialLinks.facebook && (
                      <a
                        href={creator.socialLinks.facebook.startsWith('http') ? creator.socialLinks.facebook : `https://facebook.com/${creator.socialLinks.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-stone-100 dark:bg-[#28160C] text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Facebook"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Bio */}
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                {creator.bio}
              </p>

              {/* Specialties Tags */}
              {creator.specialties && creator.specialties.length > 0 && (
                <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap pt-1">
                  {creator.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-[#25150C] border border-stone-200 dark:border-[#382317] text-[11px] font-medium text-stone-600 dark:text-stone-300"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-sand-200 dark:border-[#2C1A10]">
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-[#160B05] border border-stone-100 dark:border-[#25150C] text-center">
              <div className="text-base sm:text-lg font-black text-espresso dark:text-cream">
                {stats.reelsCount || reels.length}
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                مقطع فيديو
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-[#160B05] border border-stone-100 dark:border-[#25150C] text-center">
              <div className="text-base sm:text-lg font-black text-espresso dark:text-cream">
                {stats.photosCount || photos.length}
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                معرض صور
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-[#160B05] border border-stone-100 dark:border-[#25150C] text-center">
              <div className="text-base sm:text-lg font-black text-espresso dark:text-cream">
                {(stats.viewsCount || 0).toLocaleString('ar-EG')}
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                مشاهدة
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-[#160B05] border border-stone-100 dark:border-[#25150C] text-center">
              <div className="text-base sm:text-lg font-black text-espresso dark:text-cream">
                {(stats.likesCount || 0).toLocaleString('ar-EG')}
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                إعجاب وتفاعل
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs (Reels vs Photos) */}
        <div className="flex items-center justify-center gap-3 border-b border-sand-200 dark:border-[#2C1A10] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('reels')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'reels'
              ? 'bg-primary text-white shadow-md'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#1C0E07]'
              }`}
          >
            <Film className="w-4 h-4" />
            <span>مقاطع الفيديو ({reels.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'photos'
              ? 'bg-primary text-white shadow-md'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#1C0E07]'
              }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>معارض الصور ({photos.length})</span>
          </button>
        </div>

        {/* Tab 1: Published Reels Grid */}
        {activeTab === 'reels' && (
          <div>
            {reels.length === 0 ? (
              <div className="text-center py-16 space-y-3 bg-white dark:bg-[#1C0E07] rounded-3xl border border-sand-200 dark:border-[#382317] p-8">
                <Film className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto" />
                <h3 className="text-sm font-bold text-espresso dark:text-cream">لا توجد مقاطع فيديو منشورة بعد</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  سيتم عرض مقاطع الفيديو المعتمدة هنا فور نشرها
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {reels.map((reel) => (
                  <motion.div
                    key={reel.id}
                    whileHover={{ y: -4 }}
                    onClick={() => {
                      if (onReelClick) {
                        onReelClick(reel);
                      } else {
                        setSelectedReel(reel);
                      }
                    }}
                    className="relative group rounded-2xl overflow-hidden aspect-[9/16] bg-stone-900 border border-sand-200 dark:border-[#382317] shadow cursor-pointer"
                  >
                    <img
                      src={reel.posterUrl || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'}
                      alt={reel.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Duration Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm">
                      {reel.duration || '0:30'}
                    </div>

                    {/* Play icon overlay on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="absolute bottom-2.5 right-2.5 left-2.5 space-y-1 text-white">
                      <h4 className="text-xs font-bold line-clamp-2 leading-snug">
                        {reel.title}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-white/80 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {(reel.viewsCount || 0).toLocaleString('ar-EG')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                          {(reel.likesCount || 0).toLocaleString('ar-EG')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Published Photos Gallery */}
        {activeTab === 'photos' && (
          <div>
            {photos.length === 0 ? (
              <div className="text-center py-16 space-y-3 bg-white dark:bg-[#1C0E07] rounded-3xl border border-sand-200 dark:border-[#382317] p-8">
                <ImageIcon className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto" />
                <h3 className="text-sm font-bold text-espresso dark:text-cream">لا توجد معارض صور منشورة بعد</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  سيتم عرض معارض الصور التراثية المعتمدة هنا فور نشرها
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -4 }}
                    onClick={() => handleOpenPhotoLightbox(item)}
                    className="rounded-2xl overflow-hidden bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
                  >
                    {/* Cover image */}
                    <div className="relative aspect-[4/3] bg-stone-100 dark:bg-[#160B05] overflow-hidden">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {item.images.length > 1 && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 text-white text-[10px] font-bold backdrop-blur-sm flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          <span>+{item.images.length} صور</span>
                        </span>
                      )}
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-primary text-white text-[10px] font-bold shadow">
                        {item.governorate}
                      </span>
                    </div>

                    {/* Content text */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-espresso dark:text-cream line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                          {item.caption}
                        </p>
                      </div>

                      {/* Interaction & Views */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-[#28160C] text-[11px] text-stone-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-stone-400" />
                          {(item.viewsCount || 0).toLocaleString('ar-EG')} مشاهدة
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleLikePhoto(item.id, e)}
                          className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                          <span>{(item.likesCount || 0).toLocaleString('ar-EG')}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal for Photo Album */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[94vh]"
            >
              {/* Top Controls */}
              <div className="p-4 flex items-center justify-between border-b border-white/10 bg-black/40 text-white shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold truncate max-w-md">{selectedPhoto.title}</h3>
                  <span className="text-xs text-white/60">
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

              {/* Main Image Viewer */}
              <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[280px] sm:min-h-[420px]">
                <img
                  src={selectedPhoto.images[activePhotoIdx]}
                  alt={`${selectedPhoto.title} - ${activePhotoIdx + 1}`}
                  referrerPolicy="no-referrer"
                  className="max-h-[58vh] max-w-full object-contain"
                />

                {/* Left/Right Carousel buttons */}
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

              {/* Thumbnail Strip for multi-image albums */}
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

              {/* Bottom Caption & Details */}
              <div className="p-4 bg-stone-900/90 border-t border-white/10 text-white space-y-2 shrink-0">
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-h-24 overflow-y-auto">
                  {selectedPhoto.caption}
                </p>
                <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {selectedPhoto.location || selectedPhoto.governorate}
                    </span>
                    <span>•</span>
                    <span>{selectedPhoto.category}</span>
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

      {/* Reel Video Player Modal */}
      <AnimatePresence>
        {selectedReel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20 aspect-[9/16]"
            >
              <button
                type="button"
                onClick={() => setSelectedReel(null)}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <video
                src={selectedReel.videoUrl}
                poster={selectedReel.posterUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none text-white space-y-1">
                <h4 className="text-sm font-bold">{selectedReel.title}</h4>
                <p className="text-xs text-white/80 line-clamp-2">{selectedReel.description}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
