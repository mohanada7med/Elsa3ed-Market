import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useApp } from '../../context/AppContext';
import { adminMediaApi } from '../../services/api';
import { AdminMediaUploader } from './AdminMediaUploader';

import {
  Camera,
  Video,
  Play,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  X,
  Star,
  Trash2,
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Share2,
  Settings2,
  Film,
  Image as ImageIcon,
  ArrowUpRight,
  GripHorizontal,
  Layers3,
  Sparkles,
  Check,
  Images,
  MonitorPlay,
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
  title = 'معرض الصور والتوثيق المرئي',
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

  const isAdmin =
    currentRole === 'admin' || currentUser?.role === 'admin';

  const userAuth = useMemo(
    () => ({
      id: currentUser?.id || 'admin',
      role: isAdmin
        ? 'admin'
        : currentUser?.role || currentRole || 'admin',
    }),
    [currentUser, currentRole, isAdmin]
  );

  const targetEntityKey = entityId || entitySlug || '';

  // =========================================================
  // LOCAL STATE
  // =========================================================
  const [localGallery, setLocalGallery] = useState<string[]>(() =>
    Array.isArray(gallery) ? gallery.filter(Boolean) : []
  );
  const [localCover, setLocalCover] = useState<string | undefined>(coverImage);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null | undefined>(videoUrl);
  const [localVideos, setLocalVideos] = useState<string[]>(() =>
    Array.isArray(videos) ? videos.filter(Boolean) : []
  );

  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(
    videoUrl || (videos && videos[0]) || null
  );

  // LIGHTBOX
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  // ADMIN MODAL & ACTIONS
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState<'gallery' | 'video'>('gallery');
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePendingDelete, setImagePendingDelete] = useState<string | null>(null);
  const [videoPendingDelete, setVideoPendingDelete] = useState<string | null>(null);

  // =========================================================
  // SYNC PROPS SAFELY
  // =========================================================
  useEffect(() => {
    if (Array.isArray(gallery)) {
      setLocalGallery((prev) => {
        const next = gallery.filter(Boolean);
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
    }
  }, [gallery]);

  useEffect(() => {
    setLocalCover(coverImage);
  }, [coverImage]);

  useEffect(() => {
    setLocalVideoUrl(videoUrl);
    if (videoUrl && !selectedVideoUrl) {
      setSelectedVideoUrl(videoUrl);
    }
  }, [videoUrl, selectedVideoUrl]);

  useEffect(() => {
    if (Array.isArray(videos)) {
      const cleanVids = videos.filter(Boolean);
      setLocalVideos(cleanVids);
      if (cleanVids.length > 0 && !selectedVideoUrl) {
        setSelectedVideoUrl(cleanVids[0]);
      }
    }
  }, [videos, selectedVideoUrl]);

  // =========================================================
  // MEMOIZED MEDIA LISTS
  // =========================================================
  const allVideos = useMemo(() => {
    return Array.from(
      new Set([
        ...(localVideoUrl ? [localVideoUrl] : []),
        ...(localVideos || []),
      ])
    ).filter(Boolean);
  }, [localVideoUrl, localVideos]);

  const activeImage = localGallery[
    Math.min(activeImageIndex, Math.max(localGallery.length - 1, 0))
  ];

  // =========================================================
  // LIGHTBOX CONTROLS
  // =========================================================
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxZoom(1);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxZoom(1);
  };

  const nextImage = useCallback(() => {
    if (localGallery.length === 0) return;
    setLightboxIndex((prev) => (prev + 1) % localGallery.length);
    setLightboxZoom(1);
  }, [localGallery.length]);

  const prevImage = useCallback(() => {
    if (localGallery.length === 0) return;
    setLightboxIndex(
      (prev) => (prev - 1 + localGallery.length) % localGallery.length
    );
    setLightboxZoom(1);
  }, [localGallery.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') prevImage();
      if (e.key === 'ArrowLeft') nextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, nextImage, prevImage]);

  // =========================================================
  // DOWNLOAD & SHARE
  // =========================================================
  const handleDownloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = `${entityTitle || 'heritage-image'}-${lightboxIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('بدء التحميل', 'جاري تنزيل الصورة التوثيقية', 'info');
  };

  const handleShareImage = async (url: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: entityTitle || 'المعرض التوثيقي',
          url,
        });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        addToast('تم النسخ', 'تم نسخ رابط الصورة بنجاح', 'success');
      }
    } catch {
      // User cancelled share
    }
  };

  // =========================================================
  // SET COVER
  // =========================================================
  const handleSetCover = async (imageUrl: string) => {
    if (!isAdmin || isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await adminMediaApi.manageEntityGallery(userAuth, {
        entityType,
        entityId: targetEntityKey,
        action: 'setCover',
        imageUrl,
      });

      if (res?.success !== false) {
        setLocalCover(imageUrl);
        onCoverChange?.(imageUrl);
        addToast('تم التعيين', 'تم تعيين الصورة كغلاف رئيسي بنجاح', 'success');
      }
    } catch (err: any) {
      addToast('خطأ', err?.message || 'فشل تعيين الصورة كغلاف', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // =========================================================
  // BATCH UPLOAD
  // =========================================================
  const handleNewImagesUploaded = async (newUrls: string[]) => {
    if (!newUrls || newUrls.length === 0 || isProcessing) return;

    const validUrls = newUrls
      .filter((u): u is string => typeof u === 'string')
      .map((u) => u.trim())
      .filter(Boolean);

    if (validUrls.length === 0) return;

    const realEntityId = entityId || entitySlug || '';
    if (!realEntityId) {
      addToast('خطأ برمجي', 'لم يتم العثور على مُعرّف الكيان (entityId مفقود)', 'error');
      return;
    }

    const updatedGallery = Array.from(new Set([...localGallery, ...validUrls]));
    setLocalGallery(updatedGallery);
    onGalleryChange?.(updatedGallery);

    let nextCover = localCover;
    if (!localCover && validUrls[0]) {
      nextCover = validUrls[0];
      setLocalCover(nextCover);
      onCoverChange?.(nextCover);
    }

    setIsProcessing(true);

    try {
      let res = await adminMediaApi.manageEntityGallery(userAuth, {
        entityType,
        entityId: realEntityId,
        action: 'updateGallery',
        galleryUrls: updatedGallery,
        coverImage: nextCover,
      });

      if (!res || res.success === false) {
        for (const url of validUrls) {
          res = await adminMediaApi.manageEntityGallery(userAuth, {
            entityType,
            entityId: realEntityId,
            action: 'add',
            imageUrl: url,
          });
        }
      }

      if (res?.gallery && Array.isArray(res.gallery)) {
        setLocalGallery(res.gallery);
        onGalleryChange?.(res.gallery);
      }

      addToast('تم الحفظ', 'تم حفظ الصور في قاعدة البيانات بنجاح', 'success');
    } catch (err: any) {
      addToast('فشل الحفظ في الخادم', err?.message || 'الصور رُفعت لكن لم يتم ربطها بقاعدة البيانات', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // =========================================================
  // DELETE IMAGE
  // =========================================================
  const handleRemoveFromGallery = async (imageUrl: string) => {
    if (!isAdmin || !imageUrl || isProcessing) return;

    setIsProcessing(true);
    const targetClean = imageUrl.trim();
    const targetPath = targetClean.split('?')[0];

    const updated = localGallery.filter((url) => {
      if (!url) return false;
      const clean = url.trim();
      return clean !== targetClean && clean.split('?')[0] !== targetPath;
    });

    try {
      const res = await adminMediaApi.manageEntityGallery(userAuth, {
        entityType,
        entityId: targetEntityKey,
        action: 'remove',
        imageUrl: targetClean,
        galleryUrls: updated,
      });

      const finalGallery = res?.gallery && Array.isArray(res.gallery) ? res.gallery : updated;
      setLocalGallery(finalGallery);
      onGalleryChange?.(finalGallery);

      if (
        localCover &&
        (localCover.trim() === targetClean ||
          localCover.trim().split('?')[0] === targetPath)
      ) {
        const nextCover = finalGallery[0] || '';
        setLocalCover(nextCover);
        onCoverChange?.(nextCover);

        if (nextCover) {
          await adminMediaApi.manageEntityGallery(userAuth, {
            entityType,
            entityId: targetEntityKey,
            action: 'setCover',
            imageUrl: nextCover,
          });
        }
      }

      if (activeImageIndex >= finalGallery.length) {
        setActiveImageIndex(Math.max(0, finalGallery.length - 1));
      }

      if (lightboxOpen && finalGallery.length === 0) {
        closeLightbox();
      }

      addToast('تم الحذف', 'تم حذف الصورة من المعرض والمخزن السحابي بنجاح', 'success');
    } catch (err: any) {
      addToast('خطأ في الحذف', err?.message || 'فشل حذف الصورة من الخادم أو السحابة', 'error');
    } finally {
      setIsProcessing(false);
      setImagePendingDelete(null);
    }
  };

  // =========================================================
  // REORDER IMAGES
  // =========================================================
  const handleMoveImage = async (
    currentIndex: number,
    direction: 'left' | 'right'
  ) => {
    const targetIndex =
      direction === 'left' ? currentIndex - 1 : currentIndex + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= localGallery.length ||
      isProcessing
    ) {
      return;
    }

    const reordered = [...localGallery];
    const [moved] = reordered.splice(currentIndex, 1);
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
      addToast('تم الترتيب', 'تم تحديث ترتيب صور المعرض بنجاح', 'success');
    } catch (err) {
      console.warn('Failed to persist gallery order:', err);
    }
  };

  // =========================================================
  // VIDEO CONTROLS
  // =========================================================
  const handleNewVideoUploaded = async (newVideoUrl: string) => {
    if (!newVideoUrl || typeof newVideoUrl !== 'string' || isProcessing) return;
    const cleanVid = newVideoUrl.trim();
    if (!cleanVid) return;

    const updatedVideos = Array.from(new Set([...localVideos, cleanVid]));

    setLocalVideoUrl(cleanVid);
    setLocalVideos(updatedVideos);
    setSelectedVideoUrl(cleanVid);
    onVideoChange?.(cleanVid, updatedVideos);

    setIsProcessing(true);

    try {
      await adminMediaApi.manageEntityGallery(userAuth, {
        entityType,
        entityId: targetEntityKey,
        action: 'setVideo',
        videoUrl: cleanVid,
      });
      addToast('تم الحفظ', 'تم رفع وتوثيق مقطع الفيديو بنجاح', 'success');
    } catch (err: any) {
      addToast('خطأ', err?.message || 'فشل ربط مقطع الفيديو بالخادم', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveVideo = async (targetUrl: string) => {
    if (!isAdmin || !targetUrl || isProcessing) return;

    setIsProcessing(true);

    try {
      await adminMediaApi.manageEntityGallery(userAuth, {
        entityType,
        entityId: targetEntityKey,
        action: 'removeVideo',
        videoUrl: targetUrl,
      });

      const remaining = localVideos.filter(
        (v) => v !== targetUrl && v.trim() !== targetUrl.trim()
      );

      setLocalVideos(remaining);

      const newPrimary =
        localVideoUrl === targetUrl ? remaining[0] ?? null : localVideoUrl ?? null;

      setLocalVideoUrl(newPrimary);
      setSelectedVideoUrl(newPrimary);
      onVideoChange?.(newPrimary, remaining);

      addToast('تم الحذف', 'تم حذف مقطع الفيديو بنجاح', 'success');
    } catch (err: any) {
      addToast('خطأ', err?.message || 'فشل حذف الفيديو من الخادم', 'error');
    } finally {
      setIsProcessing(false);
      setVideoPendingDelete(null);
    }
  };

  return (
    <>
      {localGallery.length === 0 && allVideos.length === 0 ? (
        <section
          id={id}
          dir="rtl"
          className={`relative overflow-hidden rounded-[2rem] border border-black/10 bg-[#f4efe7] shadow-xl dark:border-white/10 dark:bg-[#151311] ${className}`}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#9a6a35]/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#9a6a35]/10 blur-3xl" />
          </div>

          <div className="relative flex min-h-[380px] flex-col items-center justify-center px-5 py-12 text-center sm:px-8">
            <div className="relative mb-7">
              <div className="absolute inset-0 rounded-[2rem] bg-[#9a6a35]/10 blur-xl" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] border border-[#9a6a35]/20 bg-white shadow-sm dark:bg-white/[0.04]">
                <Images className="h-9 w-9 text-[#9a6a35]" />
              </div>
            </div>

            <span className="mb-3 rounded-full bg-[#9a6a35]/10 px-3 py-1.5 text-[9px] font-black tracking-[0.25em] text-[#9a6a35]">
              VISUAL ARCHIVE
            </span>

            <h3 className="font-serif text-2xl font-black text-[#171411] dark:text-white sm:text-3xl">
              المعرض لسه فاضي
            </h3>

            <p className="mt-3 max-w-md text-xs leading-7 text-black/45 dark:text-white/40">
              أضف الصور والفيديوهات التوثيقية علشان تبدأ بناء الأرشيف البصري الخاص بـ{' '}
              {entityTitle || 'هذا المكان'}.
            </p>

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setAdminActiveTab('gallery');
                  setAdminModalOpen(true);
                }}
                className="mt-7 flex items-center gap-2 rounded-2xl bg-[#9a6a35] px-6 py-3.5 text-xs font-black text-white shadow-lg shadow-[#9a6a35]/20 transition hover:-translate-y-0.5 hover:bg-[#83592c] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                ابدأ إضافة الوسائط
              </button>
            )}
          </div>
        </section>
      ) : (
        <section
          id={id}
          dir="rtl"
          className={`relative overflow-hidden rounded-[2rem] border border-black/10 bg-[#f5f1eb] text-[#171411] shadow-2xl dark:border-white/10 dark:bg-[#12110f] dark:text-white ${className}`}
        >
          <header className="relative z-20 overflow-hidden border-b border-black/10 bg-white/80 px-4 py-5 backdrop-blur-xl dark:border-white/10 dark:bg-[#171512]/80 sm:px-6 lg:px-8">
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-l from-[#9a6a35] via-[#c18b4f] to-transparent" />

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#9a6a35]/10 text-[#9a6a35]">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <span className="text-[9px] font-black tracking-[0.25em] text-[#9a6a35]">
                    HERITAGE VISUAL ARCHIVE
                  </span>
                </div>

                <h2 className="font-serif text-xl font-black leading-tight sm:text-2xl lg:text-3xl">
                  {title}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-black/40 dark:text-white/40">
                  <span>{entityTitle || 'المحتوى التوثيقي'}</span>
                  <span className="h-1 w-1 rounded-full bg-[#9a6a35]/50" />
                  <span>{localGallery.length} صور</span>
                  <span className="h-1 w-1 rounded-full bg-[#9a6a35]/50" />
                  <span>{allVideos.length} فيديو</span>
                </div>
              </div>

              <div className="flex w-full items-center gap-2 lg:w-auto">
                <div className="flex min-w-0 flex-1 items-center rounded-2xl border border-black/10 bg-black/[0.025] p-1 dark:border-white/10 dark:bg-white/[0.025] lg:flex-none">
                  <button
                    type="button"
                    onClick={() => setActiveTab('photos')}
                    className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black transition sm:px-4 ${activeTab === 'photos'
                      ? 'bg-[#171411] text-white shadow-lg dark:bg-white dark:text-black'
                      : 'text-black/45 hover:text-black dark:text-white/45 dark:hover:text-white'
                      }`}
                  >
                    <ImageIcon className="h-4 w-4 shrink-0" />
                    <span>الصور</span>
                    <span className="font-mono text-[9px] opacity-50">
                      {localGallery.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('videos')}
                    className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black transition sm:px-4 ${activeTab === 'videos'
                      ? 'bg-[#171411] text-white shadow-lg dark:bg-white dark:text-black'
                      : 'text-black/45 hover:text-black dark:text-white/45 dark:hover:text-white'
                      }`}
                  >
                    <Film className="h-4 w-4 shrink-0" />
                    <span>الفيديو</span>
                    <span className="font-mono text-[9px] opacity-50">
                      {allVideos.length}
                    </span>
                  </button>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setAdminActiveTab('gallery');
                      setAdminModalOpen(true);
                    }}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-white text-black/60 shadow-sm transition hover:border-[#9a6a35]/30 hover:bg-[#9a6a35]/10 hover:text-[#9a6a35] dark:border-white/10 dark:bg-white/[0.03] dark:text-white/60 cursor-pointer"
                    title="إدارة الوسائط"
                  >
                    <Settings2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </header>

          {activeTab === 'photos' && (
            <div>
              {localGallery.length === 0 ? (
                <div className="flex min-h-[360px] items-center justify-center px-5">
                  <div className="text-center">
                    <ImageIcon className="mx-auto mb-4 h-12 w-12 text-black/15 dark:text-white/15" />
                    <p className="text-sm font-black text-black/40 dark:text-white/40">
                      لا توجد صور
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative overflow-hidden bg-[#11100e]">
                    <div className="absolute inset-0">
                      {activeImage && (
                        <img
                          src={activeImage}
                          alt=""
                          aria-hidden="true"
                          className="h-full w-full scale-110 object-cover opacity-30 blur-3xl"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/65" />
                    </div>

                    <div className="relative flex min-h-[420px] items-center justify-center p-3 sm:min-h-[520px] sm:p-6 lg:min-h-[620px] lg:p-10">
                      {activeImage && (
                        <div className="relative flex max-h-[580px] w-full items-center justify-center">
                          <img
                            src={activeImage}
                            alt={`${entityTitle || 'المكان'} - صورة ${activeImageIndex + 1}`}
                            className="relative z-10 max-h-[72vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl sm:rounded-3xl"
                          />
                          <div className="pointer-events-none absolute inset-0 z-20 rounded-3xl ring-1 ring-white/10" />
                        </div>
                      )}

                      <div className="absolute left-4 top-4 z-30 sm:left-7 sm:top-7">
                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-xl">
                          <Images className="h-3.5 w-3.5 text-[#c18b4f]" />
                          <span className="font-mono text-[10px] font-bold text-white">
                            {String(activeImageIndex + 1).padStart(2, '0')} /{' '}
                            {String(localGallery.length).padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      {activeImage === localCover && (
                        <div className="absolute right-4 top-4 z-30 flex items-center gap-1.5 rounded-full bg-[#9a6a35] px-3 py-2 text-[9px] font-black text-white shadow-xl sm:right-7 sm:top-7">
                          <Star className="h-3 w-3 fill-current" />
                          الصورة الرئيسية
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => openLightbox(activeImageIndex)}
                        className="absolute bottom-4 left-4 z-30 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/45 text-white backdrop-blur-xl transition hover:bg-white hover:text-black sm:bottom-7 sm:left-7 cursor-pointer"
                        title="عرض بالحجم الكامل"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </button>

                      {localGallery.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveImageIndex(
                              (prev) =>
                                (prev - 1 + localGallery.length) %
                                localGallery.length
                            )
                          }
                          className="absolute right-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white backdrop-blur-xl transition hover:bg-white hover:text-black sm:right-7 sm:h-12 sm:w-12 cursor-pointer"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      )}

                      {localGallery.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveImageIndex(
                              (prev) => (prev + 1) % localGallery.length
                            )
                          }
                          className="absolute left-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white backdrop-blur-xl transition hover:bg-white hover:text-black sm:left-7 sm:h-12 sm:w-12 cursor-pointer"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="border-b border-black/10 bg-white px-4 py-4 dark:border-white/10 dark:bg-[#171512] sm:px-6 lg:px-8">
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {localGallery.map((imgUrl, idx) => {
                        const isActive = idx === activeImageIndex;
                        const isCover = imgUrl === localCover;

                        return (
                          <button
                            type="button"
                            key={`${imgUrl}-${idx}`}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`group relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl transition sm:h-24 sm:w-36 cursor-pointer ${isActive
                              ? 'ring-2 ring-[#9a6a35] ring-offset-2 ring-offset-white dark:ring-offset-[#171512]'
                              : 'opacity-55 hover:opacity-100'
                              }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`صورة ${idx + 1}`}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                              loading="lazy"
                            />
                            {isCover && (
                              <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-lg bg-[#9a6a35] text-white shadow-lg">
                                <Star className="h-3 w-3 fill-current" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="p-4 sm:p-6 lg:p-8">
              {allVideos.length === 0 ? (
                <div className="flex min-h-[360px] items-center justify-center">
                  <div className="text-center">
                    <Film className="mx-auto mb-4 h-12 w-12 text-black/15 dark:text-white/15" />
                    <p className="text-sm font-black text-black/40 dark:text-white/40">
                      لا توجد فيديوهات
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                  <div className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-black shadow-xl dark:border-white/10">
                    <div className="relative aspect-video bg-black">
                      {selectedVideoUrl && (
                        <video
                          key={selectedVideoUrl}
                          src={selectedVideoUrl}
                          controls
                          playsInline
                          className="h-full w-full object-contain"
                          poster={localCover || undefined}
                        />
                      )}
                    </div>
                  </div>

                  <aside className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-white dark:border-white/10 dark:bg-[#171512]">
                    <div className="max-h-[520px] space-y-2 overflow-y-auto p-3">
                      {allVideos.map((vidUrl, idx) => {
                        const isSelected = vidUrl === selectedVideoUrl;

                        return (
                          <button
                            type="button"
                            key={`${vidUrl}-${idx}`}
                            onClick={() => setSelectedVideoUrl(vidUrl)}
                            className={`group flex w-full items-center gap-3 rounded-2xl p-2 text-right transition cursor-pointer ${isSelected
                              ? 'bg-[#9a6a35]/10 ring-1 ring-[#9a6a35]/30'
                              : 'hover:bg-black/[0.035] dark:hover:bg-white/[0.035]'
                              }`}
                          >
                            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-black">
                              <video
                                src={vidUrl}
                                muted
                                preload="metadata"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <span className="text-xs font-bold truncate">فيديو توثيقي #{idx + 1}</span>
                          </button>
                        );
                      })}
                    </div>
                  </aside>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxOpen && localGallery.length > 0 && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[9999] flex flex-col bg-[#070706]/98 text-white backdrop-blur-2xl"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black/30 px-3 py-3 sm:px-6 sm:py-4">
            <span className="font-serif text-sm font-black">{entityTitle || 'المعرض التوثيقي'}</span>
            <button
              type="button"
              onClick={closeLightbox}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-red-600 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-3 sm:p-6">
            <img
              src={localGallery[lightboxIndex]}
              alt=""
              className="max-h-[76vh] max-w-[88vw] rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* ADMIN PANEL MODAL */}
      {adminModalOpen && isAdmin && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/75 p-2 backdrop-blur-md sm:p-5"
        >
          <div className="flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.75rem] border border-black/10 bg-[#f5f1eb] shadow-2xl dark:border-white/10 dark:bg-[#171512]">
            <div className="flex shrink-0 items-center justify-between border-b border-black/10 bg-white px-4 py-4 dark:border-white/10 dark:bg-[#1d1a17]">
              <h3 className="font-serif text-base font-black">إدارة الوسائط والرفع الاحترافي</h3>
              <button
                type="button"
                onClick={() => setAdminModalOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 hover:bg-red-500 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex border-b border-black/10 bg-white dark:border-white/10 dark:bg-[#1d1a17]">
              <button
                type="button"
                onClick={() => setAdminActiveTab('gallery')}
                className={`flex items-center gap-2 border-b-2 px-6 py-4 text-xs font-black ${adminActiveTab === 'gallery' ? 'border-[#9a6a35] text-[#9a6a35]' : 'border-transparent opacity-50'
                  }`}
              >
                الصور
              </button>
              <button
                type="button"
                onClick={() => setAdminActiveTab('video')}
                className={`flex items-center gap-2 border-b-2 px-6 py-4 text-xs font-black ${adminActiveTab === 'video' ? 'border-[#9a6a35] text-[#9a6a35]' : 'border-transparent opacity-50'
                  }`}
              >
                الفيديو
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-7">
              {adminActiveTab === 'gallery' && (
                <div className="space-y-6">
                  {/* أداة الرفع الجديدة */}
                  <AdminMediaUploader
                    entityType={entityType}
                    entitySlug={entitySlug || entityId}
                    entityTitle={entityTitle}
                    mediaCategory="image"
                    multiple={true}
                    value={[]}
                    onChange={(uploaded: any) => {
                      const urls: string[] = [];
                      if (Array.isArray(uploaded)) {
                        uploaded.forEach((item: any) => {
                          const url = typeof item === 'string' ? item : item?.secureUrl || item?.url;
                          if (url) urls.push(url.trim());
                        });
                      } else if (uploaded) {
                        const url = typeof uploaded === 'string' ? uploaded : uploaded?.secureUrl || uploaded?.url;
                        if (url) urls.push(url.trim());
                      }
                      if (urls.length > 0) handleNewImagesUploaded(urls);
                    }}
                    helperText="اختر صور جديدة للإضافة الفورية للأرشيف السحابي."
                  />

                  {/* إدارة واستعراض الصور القديمة المخزنة سحابياً وقاعدياً */}
                  <div className="rounded-2xl border border-black/10 bg-white/50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-xs font-black tracking-wider opacity-80">
                        الصور الحالية في الأرشيف ({localGallery.length})
                      </h4>
                      <span className="text-[10px] opacity-50">إدارة مباشرة من السحابة وقاعدة البيانات</span>
                    </div>

                    {localGallery.length === 0 ? (
                      <p className="py-6 text-center text-xs opacity-40">لا توجد صور مسجلة حالياً لهذا الكيان.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[280px] overflow-y-auto p-1">
                        {localGallery.map((imgUrl, idx) => {
                          const isCover = imgUrl === localCover;
                          return (
                            <div
                              key={`${imgUrl}-${idx}`}
                              className="group relative aspect-video overflow-hidden rounded-xl border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5"
                            >
                              <img
                                src={imgUrl}
                                alt={`صورة أرشيفية ${idx + 1}`}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              />

                              {/* شارة الغلاف */}
                              {isCover && (
                                <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded bg-[#9a6a35] text-white shadow">
                                  <Star className="h-3 w-3 fill-current" />
                                </span>
                              )}

                              {/* أزرار التحكم السريع (تعيين غلاف / حذف نهائي) */}
                              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/60 opacity-0 backdrop-blur-xs transition group-hover:opacity-100">
                                {!isCover && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetCover(imgUrl)}
                                    title="تعيين كغلاف رئيسي"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white hover:bg-[#9a6a35] cursor-pointer"
                                  >
                                    <Star className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setImagePendingDelete(imgUrl)}
                                  title="حذف من السحابة وقاعدة البيانات"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/80 text-white hover:bg-red-600 cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {adminActiveTab === 'video' && (
                <AdminMediaUploader
                  entityType={entityType || 'heritage-place'}
                  entitySlug={entitySlug || entityId}
                  entityTitle={entityTitle}
                  mediaCategory="video"
                  multiple={false}
                  value={localVideoUrl ? [localVideoUrl] : []}
                  onChange={(uploaded: any) => {
                    let finalVidUrl = '';
                    if (Array.isArray(uploaded) && uploaded.length > 0) {
                      finalVidUrl = uploaded[0]?.secureUrl || uploaded[0]?.url || uploaded[0];
                    } else if (typeof uploaded === 'string') {
                      finalVidUrl = uploaded;
                    } else if (uploaded) {
                      finalVidUrl = uploaded.secureUrl || uploaded.url || '';
                    }
                    if (finalVidUrl) handleNewVideoUploaded(finalVidUrl);
                  }}
                  helperText="رفع فيديو توثيقي (يدعم معالجة وحفظ احترافي وتتبع الرفع بوضوح)."
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODALS */}
      {imagePendingDelete && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 dark:bg-[#211d19]">
            <h3 className="text-base font-black mb-2">حذف الصورة نهائيًا؟</h3>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setImagePendingDelete(null)} className="flex-1 rounded-xl bg-black/5 py-3 text-xs font-bold cursor-pointer">إلغاء</button>
              <button onClick={() => handleRemoveFromGallery(imagePendingDelete)} className="flex-1 rounded-xl bg-red-600 py-3 text-xs font-black text-white cursor-pointer">حذف</button>
            </div>
          </div>
        </div>
      )}

      {videoPendingDelete && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 dark:bg-[#211d19]">
            <h3 className="text-base font-black mb-2">إزالة مقطع الفيديو؟</h3>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setVideoPendingDelete(null)} className="flex-1 rounded-xl bg-black/5 py-3 text-xs font-bold cursor-pointer">إلغاء</button>
              <button onClick={() => handleRemoveVideo(videoPendingDelete)} className="flex-1 rounded-xl bg-red-600 py-3 text-xs font-black text-white cursor-pointer">إزالة</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VisitorMediaGallery;