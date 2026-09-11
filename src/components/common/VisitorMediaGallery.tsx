import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';

import { useApp } from '../../context/AppContext';
import { adminMediaApi } from '../../services/api';
import { AdminMediaUploader } from './AdminMediaUploader';

import {
  Sparkles,
  Images,
  Film,
  Star,
  Trash2,
  Plus,
  Maximize2,
  Download,
  Share2,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  Settings2,
  AlertCircle,
  Eye,
  Sliders,
  Compass
} from 'lucide-react';

export interface VisitorMediaGalleryProps {
  id?: string;
  title?: string;
  entityType:
  | 'heritage-place'
  | 'cultural-craft'
  | 'governorate'
  | 'wah-story'
  | 'general';
  entityId: string;
  entitySlug?: string;
  entityTitle?: string;
  coverImage?: string;
  gallery?: string[];
  videoUrl?: string | null;
  videos?: string[];
  onGalleryChange?: (updatedGallery: string[]) => void;
  onCoverChange?: (newCoverUrl: string) => void;
  onVideoChange?: (
    newVideoUrl: string | null,
    updatedVideos?: string[]
  ) => void;
  className?: string;
}

export const VisitorMediaGallery: React.FC<VisitorMediaGalleryProps> = ({
  id,
  title = 'الأرشيف البصري والتوثيق',
  entityType,
  entityId,
  entitySlug,
  entityTitle,
  coverImage,
  gallery = [],
  videoUrl,
  videos = [],
  onGalleryChange,
  onCoverChange,
  onVideoChange,
  className = '',
}) => {
  const { currentUser, currentRole, addToast } = useApp();

  const isAdmin = currentRole === 'admin' || currentUser?.role === 'admin';

  const userAuth = useMemo(
    () => ({
      id: currentUser?.id || 'admin',
      role: isAdmin ? 'admin' : currentUser?.role || currentRole || 'admin',
    }),
    [currentUser, currentRole, isAdmin]
  );

  const targetEntityKey = entityId || entitySlug || '';

  // States
  const [localGallery, setLocalGallery] = useState<string[]>(() =>
    Array.isArray(gallery) ? gallery.filter(Boolean) : []
  );
  const [localCover, setLocalCover] = useState<string | undefined>(coverImage);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null | undefined>(videoUrl);
  const [localVideos, setLocalVideos] = useState<string[]>(() =>
    Array.isArray(videos) ? videos.filter(Boolean) : []
  );

  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(
    videoUrl || (videos && videos[0]) || null
  );

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showOverlayControls, setShowOverlayControls] = useState(true);

  // Touch Swipe
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Admin Modals
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<'images' | 'video'>('images');
  const [isProcessing, setIsProcessing] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'image' | 'video'; url: string } | null>(null);

  // Sync
  useEffect(() => {
    if (Array.isArray(gallery)) setLocalGallery(gallery.filter(Boolean));
  }, [gallery]);

  useEffect(() => {
    setLocalCover(coverImage);
  }, [coverImage]);

  useEffect(() => {
    setLocalVideoUrl(videoUrl);
    if (videoUrl && !selectedVideo) setSelectedVideo(videoUrl);
  }, [videoUrl, selectedVideo]);

  useEffect(() => {
    if (Array.isArray(videos)) {
      const clean = videos.filter(Boolean);
      setLocalVideos(clean);
      if (clean.length > 0 && !selectedVideo) setSelectedVideo(clean[0]);
    }
  }, [videos, selectedVideo]);

  const allVideos = useMemo(() => {
    return Array.from(
      new Set([...(localVideoUrl ? [localVideoUrl] : []), ...(localVideos || [])])
    ).filter(Boolean);
  }, [localVideoUrl, localVideos]);

  // Lock mobile background scrolling
  useEffect(() => {
    if (lightboxOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [lightboxOpen]);

  // Lightbox Navigation
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    setShowOverlayControls(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextLightboxImage = useCallback(() => {
    if (!localGallery.length) return;
    setLightboxIndex((prev) => (prev + 1) % localGallery.length);
  }, [localGallery.length]);

  const prevLightboxImage = useCallback(() => {
    if (!localGallery.length) return;
    setLightboxIndex((prev) => (prev - 1 + localGallery.length) % localGallery.length);
  }, [localGallery.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextLightboxImage();
      else prevLightboxImage();
    }
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') prevLightboxImage();
      if (e.key === 'ArrowLeft') nextLightboxImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, nextLightboxImage, prevLightboxImage]);

  // Mutations
  const handleSetCover = async (url: string) => {
    if (!isAdmin || isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await adminMediaApi.manageEntityGallery(userAuth, {
        entityType,
        entityId: targetEntityKey,
        entitySlug: entitySlug || targetEntityKey,
        action: 'setCover',
        imageUrl: url,
      });
      const newCover = res?.coverImage || url;
      setLocalCover(newCover);
      onCoverChange?.(newCover);
      addToast('تم التحديث', 'تم اعتماد الصورة كغلاف رئيسي', 'success');
    } catch (err: any) {
      addToast('خطأ', err?.message || 'تعذر تعيين الغلاف', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReorder = async (index: number, direction: 'forward' | 'backward') => {
    const targetIndex = direction === 'forward' ? index + 1 : index - 1;
    if (targetIndex < 0 || targetIndex >= localGallery.length || isProcessing) return;

    const reordered = [...localGallery];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setLocalGallery(reordered);
    onGalleryChange?.(reordered);

    try {
      await adminMediaApi.manageEntityGallery(userAuth, {
        entityType,
        entityId: targetEntityKey,
        action: 'updateGallery',
        galleryUrls: reordered,
      });
      addToast('تم الترتيب', 'تم تحديث أولوية العرض', 'success');
    } catch (err) {
      console.warn('Reorder error:', err);
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!isAdmin || isProcessing) return;
    setIsProcessing(true);

    const updated = localGallery.filter((img) => img !== imageUrl);
    try {
      const res = await adminMediaApi.manageEntityGallery(userAuth, {
        entityType,
        entityId: targetEntityKey,
        entitySlug: entitySlug || targetEntityKey,
        action: 'remove',
        imageUrl,
        galleryUrls: updated,
      });

      const finalGallery = res?.gallery || updated;
      setLocalGallery(finalGallery);
      onGalleryChange?.(finalGallery);

      if (localCover === imageUrl) {
        const nextCover = finalGallery[0] || '';
        setLocalCover(nextCover || undefined);
        onCoverChange?.(nextCover);
      }

      if (lightboxOpen && finalGallery.length === 0) closeLightbox();
      addToast('تم الحذف', 'تم حذف الصورة من الأرشيف', 'success');
    } catch (err: any) {
      addToast('خطأ', err?.message || 'فشل حذف الصورة', 'error');
    } finally {
      setIsProcessing(false);
      setItemToDelete(null);
    }
  };

  const handleDownload = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `archive-${Date.now()}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: entityTitle || 'الأرشيف التوثيقي', url });
      } catch { }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      addToast('تم النسخ', 'تم نسخ الرابط إلى الحافظة', 'success');
    }
  };

  return (
    <section
      id={id}
      dir="rtl"
      className={`relative w-full overflow-hidden rounded-3xl border border-[#9a6a35]/20 bg-[#9a6a35]/[0.03] p-4 text-black/85 dark:text-white/85 sm:p-7 md:p-8 ${className}`}
    >
      {/* Background accents matching #9a6a35 */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#9a6a35]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#9a6a35]/10 blur-3xl" />

      {/* Header Bar */}
      <header className="relative z-10 mb-7 flex flex-col gap-4 border-b border-[#9a6a35]/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-[#9a6a35] font-black text-xs sm:text-sm">
            <Sparkles className="w-4 h-4" />
            <span>معرض وسائط التوثيق</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-black/85 dark:text-white/85 sm:text-3xl">
            {title}
          </h3>
        </div>

        {/* Tab Switcher & Admin Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex rounded-2xl border border-[#9a6a35]/20 bg-[#9a6a35]/10 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${activeTab === 'photos'
                ? 'bg-[#9a6a35] text-white shadow-sm'
                : 'text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white'
                }`}
            >
              <Images className="h-3.5 w-3.5" />
              <span>الصور ({localGallery.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${activeTab === 'videos'
                ? 'bg-[#9a6a35] text-white shadow-sm'
                : 'text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white'
                }`}
            >
              <Film className="h-3.5 w-3.5" />
              <span>المقاطع ({allVideos.length})</span>
            </button>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setAdminModalOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#9a6a35]/30 bg-[#9a6a35]/10 text-[#9a6a35] transition hover:bg-[#9a6a35] hover:text-white cursor-pointer"
              title="إدارة وسائط الأرشيف"
            >
              <Settings2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      {/* PHOTOS TAB */}
      {activeTab === 'photos' && (
        <div>
          {localGallery.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#9a6a35]/30 bg-[#9a6a35]/5 py-12 text-center">
              <Images className="h-10 w-10 text-[#9a6a35]/40" />
              <p className="mt-3 text-sm font-bold text-black/60 dark:text-white/60">
                لا توجد صور موثقة في هذا القسم حالياً
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setAdminTab('images');
                    setAdminModalOpen(true);
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#9a6a35] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#9a6a35]/90 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  إضافة صور جديدة
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {localGallery.map((url, idx) => {
                const isCover = url === localCover;

                return (
                  <div
                    key={`${url}-${idx}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#9a6a35]/25 bg-white/70 shadow-sm transition-all duration-300 hover:border-[#9a6a35]/60 hover:shadow-md dark:bg-white/[0.03]"
                  >
                    {/* Image Viewport Canvas */}
                    <div
                      className="relative aspect-[4/3] w-full overflow-hidden bg-black/5 cursor-pointer"
                      onClick={() => openLightbox(idx)}
                    >
                      <img
                        src={url}
                        alt={`${entityTitle || 'توثيق'} - ${idx + 1}`}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Top Overlay Badge */}
                      <div className="absolute top-2.5 right-2.5 left-2.5 flex items-center justify-between pointer-events-none">
                        {isCover ? (
                          <span className="flex items-center gap-1 rounded-full bg-[#9a6a35] px-2.5 py-0.5 text-[10px] font-bold text-white shadow pointer-events-auto">
                            <Star className="h-3 w-3 fill-white" /> الغلاف
                          </span>
                        ) : (
                          <div />
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openLightbox(idx);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur-md transition hover:bg-[#9a6a35] pointer-events-auto cursor-pointer"
                          title="شاشة كاملة"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Document Bar */}
                    <div className="flex items-center justify-between border-t border-[#9a6a35]/15 bg-[#9a6a35]/5 px-3.5 py-2.5">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#9a6a35]">
                        <Compass className="h-3.5 w-3.5" />
                        <span>توثيق #{idx + 1}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openLightbox(idx)}
                          className="flex items-center gap-1 text-[11px] font-bold text-black/70 hover:text-[#9a6a35] transition dark:text-white/70 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>معاينة</span>
                        </button>

                        {isAdmin && (
                          <div className="mr-2 flex items-center gap-1 border-r border-[#9a6a35]/20 pr-2">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetCover(url)}
                                title="تعيين كغلاف"
                                className="rounded-lg p-1 text-[#9a6a35] hover:bg-[#9a6a35]/15 transition cursor-pointer"
                              >
                                <Star className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleReorder(idx, 'backward')}
                                title="تقديم"
                                className="rounded-lg p-1 text-black/60 hover:text-black dark:text-white/60 cursor-pointer"
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {idx < localGallery.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleReorder(idx, 'forward')}
                                title="تأخير"
                                className="rounded-lg p-1 text-black/60 hover:text-black dark:text-white/60 cursor-pointer"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setItemToDelete({ type: 'image', url })}
                              title="حذف"
                              className="rounded-lg p-1 text-red-500 hover:bg-red-500/10 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIDEOS TAB */}
      {activeTab === 'videos' && (
        <div>
          {allVideos.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#9a6a35]/30 bg-[#9a6a35]/5 py-12 text-center">
              <Film className="h-10 w-10 text-[#9a6a35]/40" />
              <p className="mt-3 text-sm font-bold text-black/60 dark:text-white/60">
                لا توجد تسجيلات مرئية متاحة
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setAdminTab('video');
                    setAdminModalOpen(true);
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#9a6a35] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#9a6a35]/90 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  رفع مقطع توثيقي
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 overflow-hidden rounded-2xl border border-[#9a6a35]/25 bg-black shadow-md">
                <div className="relative aspect-video w-full bg-black">
                  {selectedVideo && (
                    <video
                      key={selectedVideo}
                      src={selectedVideo}
                      controls
                      playsInline
                      poster={localCover}
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>
              </div>

              <div className="lg:col-span-4 space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold text-[#9a6a35]">
                    المقاطع المسجلة ({allVideos.length})
                  </h4>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setAdminTab('video');
                        setAdminModalOpen(true);
                      }}
                      className="text-xs font-bold text-[#9a6a35] hover:underline cursor-pointer"
                    >
                      + رفع مقطع
                    </button>
                  )}
                </div>

                <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
                  {allVideos.map((vidUrl, idx) => {
                    const isSelected = vidUrl === selectedVideo;
                    return (
                      <div
                        key={`${vidUrl}-${idx}`}
                        onClick={() => setSelectedVideo(vidUrl)}
                        className={`group flex items-center justify-between gap-3 rounded-xl border p-2.5 transition cursor-pointer ${isSelected
                          ? 'border-[#9a6a35] bg-[#9a6a35]/15 shadow-sm'
                          : 'border-[#9a6a35]/15 bg-white/60 hover:bg-[#9a6a35]/5 dark:border-white/10 dark:bg-white/5'
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative flex h-11 w-14 shrink-0 items-center justify-center rounded-lg bg-[#9a6a35] text-white">
                            <Play className="h-4 w-4 fill-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-black/85 dark:text-white/85">
                              تسجيل وثائقي #{idx + 1}
                            </p>
                            <span className="text-[10px] text-black/50 dark:text-white/50">
                              انقر للتشغيل في المشغل
                            </span>
                          </div>
                        </div>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemToDelete({ type: 'video', url: vidUrl });
                            }}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PORTAL-BASED CINEMATIC BLURRED VIEWER */}
      {lightboxOpen &&
        localGallery.length > 0 &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            dir="rtl"
            className="fixed inset-0 z-[9999999] h-[100dvh] w-screen select-none overflow-hidden touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* 1. Backdrop: Same Image with Blur + Dark Fade */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src={localGallery[lightboxIndex]}
                alt=""
                className="h-full w-full object-cover scale-125 blur-3xl brightness-40 transition-all duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
            </div>

            {/* 2. Floating Top Header */}
            <div
              className={`absolute top-0 inset-x-0 z-50 transition-opacity duration-300 ${showOverlayControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                } flex items-center justify-between bg-gradient-to-b from-black/80 via-black/30 to-transparent p-4`}
            >
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-[#9a6a35]/30 bg-[#9a6a35]/40 px-3 py-1 font-mono text-xs font-bold text-white shadow-sm backdrop-blur-md">
                  {lightboxIndex + 1} / {localGallery.length}
                </span>
                <span className="hidden sm:inline-block text-xs font-bold text-white/90 truncate max-w-xs font-serif">
                  {entityTitle || 'الأرشيف البصري'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(localGallery[lightboxIndex])}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-[#9a6a35] hover:border-[#9a6a35] cursor-pointer active:scale-95"
                  title="تحميل الصورة"
                >
                  <Download className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleShare(localGallery[lightboxIndex])}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-[#9a6a35] hover:border-[#9a6a35] cursor-pointer active:scale-95"
                  title="مشاركة الصورة"
                >
                  <Share2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={closeLightbox}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur-md transition hover:bg-[#9a6a35] hover:border-[#9a6a35] cursor-pointer active:scale-95"
                  title="إغلاق"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* 3. Main Stage */}
            <div
              className="absolute inset-0 z-10 flex h-[100dvh] w-screen items-center justify-center cursor-pointer p-2 sm:p-4"
              onClick={() => setShowOverlayControls((prev) => !prev)}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevLightboxImage();
                }}
                className="hidden sm:flex absolute right-6 z-40 h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:bg-[#9a6a35] hover:border-[#9a6a35] cursor-pointer"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              <img
                src={localGallery[lightboxIndex]}
                alt=""
                className="max-h-full max-w-full object-contain pointer-events-none rounded-xl shadow-2xl drop-shadow-2xl transition-transform duration-300"
              />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextLightboxImage();
                }}
                className="hidden sm:flex absolute left-6 z-40 h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:bg-[#9a6a35] hover:border-[#9a6a35] cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            </div>

            {/* 4. Bottom Strip */}
            <div
              className={`absolute bottom-0 inset-x-0 z-50 transition-opacity duration-300 ${showOverlayControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                } bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4`}
            >
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 no-scrollbar">
                {localGallery.map((thumbUrl, tIdx) => {
                  const isActive = tIdx === lightboxIndex;
                  return (
                    <button
                      key={`thumb-${tIdx}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex(tIdx);
                      }}
                      className={`relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${isActive
                        ? 'border-[#9a6a35] scale-105 shadow-lg shadow-[#9a6a35]/60 brightness-105'
                        : 'border-white/20 opacity-60 hover:opacity-100'
                        }`}
                    >
                      <img src={thumbUrl} alt="" className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-center text-[10px] text-white/70">
                اسحب للتنقل بين اللقطات • اضغط في أي مكان لإخفاء الأزرار
              </p>
            </div>
          </div>,
          document.body
        )}

      {/* ADMIN UPLOAD MODAL */}
      {adminModalOpen && isAdmin && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#9a6a35]/25 bg-[#FAF7F2] shadow-2xl dark:border-white/10 dark:bg-[#181614]">
            <div className="flex items-center justify-between border-b border-black/10 bg-white/80 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-2 text-[#9a6a35] font-bold">
                <Sliders className="h-4 w-4" />
                <h3 className="font-serif text-base text-black/85 dark:text-white/85">
                  إدارة وسائط المعرض
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAdminModalOpen(false)}
                className="rounded-xl p-2 text-black/50 hover:bg-red-500 hover:text-white transition cursor-pointer dark:text-white/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex border-b border-[#9a6a35]/15 px-6 pt-3">
              <button
                type="button"
                onClick={() => setAdminTab('images')}
                className={`pb-3 text-xs font-bold transition border-b-2 ${adminTab === 'images'
                  ? 'border-[#9a6a35] text-[#9a6a35]'
                  : 'border-transparent text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white'
                  }`}
              >
                إضافة صور
              </button>
              <button
                type="button"
                onClick={() => setAdminTab('video')}
                className={`mr-6 pb-3 text-xs font-bold transition border-b-2 ${adminTab === 'video'
                  ? 'border-[#9a6a35] text-[#9a6a35]'
                  : 'border-transparent text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white'
                  }`}
              >
                رفع فيديو
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              {adminTab === 'images' ? (
                <AdminMediaUploader
                  entityType={entityType || 'heritage-place'}
                  entitySlug={entitySlug || entityId}
                  entityId={entityId || entitySlug}
                  entityTitle={entityTitle}
                  mediaCategory="image"
                  multiple={true}
                  value={[]}
                  onChange={(uploaded: any) => {
                    const urls: string[] = [];
                    if (Array.isArray(uploaded)) {
                      uploaded.forEach((item: any) => {
                        const u = typeof item === 'string' ? item : item?.secureUrl || item?.url;
                        if (u) urls.push(u.trim());
                      });
                    } else if (uploaded) {
                      const u = typeof uploaded === 'string' ? uploaded : uploaded?.secureUrl || uploaded?.url;
                      if (u) urls.push(u.trim());
                    }
                    if (urls.length > 0) {
                      const updated = Array.from(new Set([...localGallery, ...urls]));
                      setLocalGallery(updated);
                      onGalleryChange?.(updated);
                      if (!localCover) {
                        setLocalCover(urls[0]);
                        onCoverChange?.(urls[0]);
                      }
                      addToast('تم الحفظ', 'تمت إضافة الصور بنجاح', 'success');
                    }
                  }}
                  helperText="ارفع صوراً بصيغ JPG أو PNG أو WebP."
                />
              ) : (
                <AdminMediaUploader
                  entityType={entityType || 'heritage-place'}
                  entitySlug={entitySlug || entityId}
                  entityId={entityId || entitySlug}
                  entityTitle={entityTitle}
                  mediaCategory="video"
                  multiple={false}
                  value={localVideoUrl ? [localVideoUrl] : []}
                  onChange={(uploaded: any) => {
                    let vUrl = '';
                    if (Array.isArray(uploaded) && uploaded.length > 0) {
                      vUrl = uploaded[0]?.secureUrl || uploaded[0]?.url || uploaded[0];
                    } else if (typeof uploaded === 'string') {
                      vUrl = uploaded;
                    } else if (uploaded) {
                      vUrl = uploaded.secureUrl || uploaded.url || '';
                    }
                    if (vUrl) {
                      const clean = vUrl.trim();
                      const updated = Array.from(new Set([...localVideos, clean]));
                      setLocalVideoUrl(clean);
                      setLocalVideos(updated);
                      setSelectedVideo(clean);
                      onVideoChange?.(clean, updated);
                      addToast('تم الحفظ', 'تم ربط الفيديو بنجاح', 'success');
                    }
                  }}
                  helperText="ارفع ملف فيديو MP4 واضح."
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1c1a18]">
            <div className="flex items-center gap-2 text-red-600 mb-3">
              <AlertCircle className="h-5 w-5" />
              <h4 className="font-bold text-sm">تأكيد الحذف</h4>
            </div>
            <p className="text-xs leading-relaxed text-black/70 dark:text-white/70">
              هل أنت متأكد من رغبتك في حذف هذا {itemToDelete.type === 'image' ? 'الصورة' : 'المقطع'}؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 rounded-xl bg-black/5 py-2.5 text-xs font-bold text-black/70 hover:bg-black/10 transition cursor-pointer dark:bg-white/5 dark:text-white/70"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  if (itemToDelete.type === 'image') {
                    handleDeleteImage(itemToDelete.url);
                  } else {
                    const remaining = localVideos.filter((v) => v !== itemToDelete.url);
                    setLocalVideos(remaining);
                    const nextVid: string | null = (localVideoUrl === itemToDelete.url ? remaining[0] : localVideoUrl) ?? null;
                    setLocalVideoUrl(nextVid);
                    setSelectedVideo(nextVid);
                    onVideoChange?.(nextVid, remaining);
                    setItemToDelete(null);
                    addToast('تم الحذف', 'تم حذف الفيديو من القائمة', 'success');
                  }
                }}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition cursor-pointer"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VisitorMediaGallery;