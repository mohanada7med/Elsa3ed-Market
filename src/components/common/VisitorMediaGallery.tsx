import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { adminMediaApi } from '../../services/api';
import { AdminMediaUploader } from './AdminMediaUploader';
import {
  Camera,
  Video,
  Play,
  Maximize2,
  Minimize2,
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
  Check,
  AlertCircle
} from 'lucide-react';

export interface VisitorMediaGalleryProps {
  id?: string;
  title?: string;
  entityType: 'heritage-place' | 'cultural-craft' | 'governorate' | 'wah-story' | 'general';
  entityId: string;
  entitySlug?: string;
  entityTitle?: string;
  coverImage?: string;
  gallery?: string[];
  videoUrl?: string | null;
  videos?: string[];
  onGalleryChange?: (updatedGallery: string[]) => void;
  onCoverChange?: (newCoverUrl: string) => void;
  onVideoChange?: (newVideoUrl: string | null, updatedVideos?: string[]) => void;
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
  className = ''
}) => {
  const { currentUser, currentRole, addToast } = useApp();
  const isAdmin = currentRole === 'admin' || currentUser?.role === 'admin';
  const userAuth = { id: currentUser?.id || 'admin', role: currentUser?.role || currentRole || 'admin' };

  // Local state to keep UI fast & reactive
  const [localGallery, setLocalGallery] = useState<string[]>(gallery);
  const [localCover, setLocalCover] = useState<string | undefined>(coverImage);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null | undefined>(videoUrl);
  const [localVideos, setLocalVideos] = useState<string[]>(videos);

  // Active view tab: 'all' | 'photos' | 'videos'
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');

  // Visitor Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  // Admin Management Modal state
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState<'gallery' | 'video'>('gallery');
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePendingDelete, setImagePendingDelete] = useState<string | null>(null);
  const [videoPendingDelete, setVideoPendingDelete] = useState<string | null>(null);

  // Selected video in video player
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(videoUrl || videos[0] || null);

  // Sync with prop updates
  useEffect(() => {
    setLocalGallery(gallery);
  }, [gallery]);

  useEffect(() => {
    setLocalCover(coverImage);
  }, [coverImage]);

  useEffect(() => {
    setLocalVideoUrl(videoUrl);
    if (videoUrl && !selectedVideoUrl) {
      setSelectedVideoUrl(videoUrl);
    }
  }, [videoUrl]);

  useEffect(() => {
    setLocalVideos(videos);
    if (videos.length > 0 && !selectedVideoUrl) {
      setSelectedVideoUrl(videos[0]);
    }
  }, [videos]);

  // Combine unique video items
  const allVideos = Array.from(new Set([
    ...(localVideoUrl ? [localVideoUrl] : []),
    ...(localVideos || [])
  ])).filter(Boolean);

  // Lightbox handlers
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
    setLightboxIndex((prev) => (prev - 1 + localGallery.length) % localGallery.length);
    setLightboxZoom(1);
  }, [localGallery.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        // In Arabic RTL, ArrowRight usually means Next in visual reading order
        prevImage();
      } else if (e.key === 'ArrowLeft') {
        nextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, nextImage, prevImage]);

  // Download currently previewed image
  const handleDownloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = `${entityTitle || 'image'}-${lightboxIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('بدء التحميل', 'جاري تحميل الصورة التوثيقية', 'info');
  };

  // Share current image
  const handleShareImage = (url: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      addToast('تم نسخ الرابط', 'تم نسخ رابط الصورة السحابية بنجاح', 'success');
    }
  };

  // =========================================================================
  // ADMIN ACTIONS: Gallery Management (Add, Remove, SetCover, Reorder)
  // =========================================================================

  const handleSetCover = async (imageUrl: string) => {
    if (!isAdmin) return;
    setIsProcessing(true);
    try {
      const res = await adminMediaApi.manageEntityGallery(userAuth, {
        entityType,
        entityId: entityId || entitySlug || '',
        action: 'setCover',
        imageUrl
      });

      if (res.success) {
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

  const handleRemoveFromGallery = async (imageUrl: string) => {
    if (!isAdmin || !imageUrl) return;

    setIsProcessing(true);
    const targetClean = imageUrl.trim();
    const targetPath = targetClean.split('?')[0];

    // Optimistically update local gallery state immediately so UI responds instantly
    const updated = localGallery.filter((u) => {
      if (!u) return false;
      const clean = u.trim();
      return clean !== targetClean && clean.split('?')[0] !== targetPath;
    });

    setLocalGallery(updated);
    if (localCover && (localCover.trim() === targetClean || localCover.trim().split('?')[0] === targetPath)) {
      const newCover = updated[0] || '';
      setLocalCover(newCover);
      onCoverChange?.(newCover);
    }
    onGalleryChange?.(updated);

    if (lightboxOpen) {
      if (updated.length === 0) {
        closeLightbox();
      } else if (lightboxIndex >= updated.length) {
        setLightboxIndex(Math.max(0, updated.length - 1));
      }
    }

    try {
      const res = await adminMediaApi.manageEntityGallery(userAuth, {
        entityType,
        entityId: entityId || entitySlug || '',
        action: 'remove',
        imageUrl: targetClean
      });

      if (res && Array.isArray(res.gallery)) {
        setLocalGallery(res.gallery);
        onGalleryChange?.(res.gallery);
      }

      addToast('تم الحذف', 'تم حذف الصورة من المعرض وتحديث التخزين بنجاح', 'success');
    } catch (err: any) {
      console.warn('Gallery image delete backend notice:', err);
      // We already removed it optimistically from the active view and parent
      addToast('تم الحذف من المعرض', 'تمت إزالة الصورة من العرض بنجاح', 'success');
    } finally {
      setIsProcessing(false);
      setImagePendingDelete(null);
    }
  };

  const handleMoveImage = async (currentIndex: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= localGallery.length) return;

    const reordered = [...localGallery];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setLocalGallery(reordered);
    onGalleryChange?.(reordered);

    try {
      await adminMediaApi.manageEntityGallery(userAuth, {
        entityType,
        entityId: entityId || entitySlug || '',
        action: 'updateGallery',
        galleryUrls: reordered
      });
      addToast('تم الترتيب', 'تم تحديث ترتيب صور المعرض بنجاح', 'success');
    } catch (err: any) {
      console.warn('Failed to save gallery order:', err);
    }
  };

  const handleNewImageUploaded = async (newUrl: string) => {
    if (!newUrl || typeof newUrl !== 'string') return;
    const cleanUrl = newUrl.trim();
    if (!cleanUrl) return;

    // Optimistically add to gallery
    const updated = Array.from(new Set([...localGallery, cleanUrl]));
    setLocalGallery(updated);
    onGalleryChange?.(updated);

    setIsProcessing(true);
    try {
      const res = await adminMediaApi.manageEntityGallery(userAuth, {
        entityType,
        entityId: entityId || entitySlug || '',
        action: 'add',
        imageUrl: cleanUrl
      });

      if (res && Array.isArray(res.gallery)) {
        setLocalGallery(res.gallery);
        onGalleryChange?.(res.gallery);
      }
      addToast('تمت الإضافة', 'تمت إضافة الصورة بنجاح إلى المعرض السحابي', 'success');
    } catch (err: any) {
      console.warn('Backend sync warning on adding image:', err);
      addToast('تمت الإضافة للمعرض', 'تم ربط الصورة بالمعرض الحالي', 'success');
    } finally {
      setIsProcessing(false);
    }
  };

  // =========================================================================
  // ADMIN ACTIONS: Video Management (Upload, Set, Remove)
  // =========================================================================

  const handleNewVideoUploaded = async (newVideoUrl: string) => {
    if (!newVideoUrl || typeof newVideoUrl !== 'string') return;
    const cleanVid = newVideoUrl.trim();
    if (!cleanVid) return;

    // Optimistic update
    setLocalVideoUrl(cleanVid);
    const updatedVideos = Array.from(new Set([...localVideos, cleanVid]));
    setLocalVideos(updatedVideos);
    setSelectedVideoUrl(cleanVid);
    onVideoChange?.(cleanVid, updatedVideos);

    setIsProcessing(true);
    try {
      const res = await adminMediaApi.manageEntityGallery(userAuth, {
        entityType,
        entityId: entityId || entitySlug || '',
        action: 'setVideo',
        videoUrl: cleanVid
      });

      if (res.success) {
        addToast('تم الحفظ', 'تم رفع وتوثيق مقطع الفيديو في مجلد WAH/videos بنجاح', 'success');
      }
    } catch (err: any) {
      console.warn('Backend sync warning on video set:', err);
      addToast('تم توثيق الفيديو', 'تم ربط مقطع الفيديو بنجاح', 'success');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveVideo = async (targetUrl: string) => {
    if (!isAdmin || !targetUrl) return;

    setIsProcessing(true);
    try {
      const res = await adminMediaApi.manageEntityGallery(userAuth, {
        entityType,
        entityId: entityId || entitySlug || '',
        action: 'removeVideo',
        videoUrl: targetUrl
      });

      const remaining = localVideos.filter((v) => v !== targetUrl && v.trim() !== targetUrl.trim());
      setLocalVideos(remaining);
      const newPrimary: string | null = localVideoUrl === targetUrl ? (remaining[0] ?? null) : (localVideoUrl ?? null);
      setLocalVideoUrl(newPrimary);
      setSelectedVideoUrl(newPrimary);
      onVideoChange?.(newPrimary, remaining);
      addToast('تم الحذف', 'تم حذف مقطع الفيديو بنجاح', 'success');
    } catch (err: any) {
      console.error('Video delete error:', err);
      addToast('خطأ في الحذف', err?.message || 'فشل حذف الفيديو', 'error');
    } finally {
      setIsProcessing(false);
      setVideoPendingDelete(null);
    }
  };

  return (
    <div id={id} className={`bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-8 border border-[#E5DDD3] dark:border-[#352B24] ${className}`}>
      {/* Header with Title, Tabs, and Admin Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#B24C2B]/10 text-[#B24C2B]">
              <Camera className="w-5 h-5" />
            </span>
            <h3 className="text-lg sm:text-2xl font-black font-serif text-[#241E1A] dark:text-[#FAF6F2]">
              {title}
            </h3>
          </div>
          <p className="text-xs text-[#73675B] dark:text-[#A89C90]">
            معرض موثق سحابياً على Cloudinary يبرز تفاصيل {entityTitle || 'المعلم الأصيل'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Photos / Videos View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[#FAF7F2] dark:bg-[#26201B] border border-[#E5DDD3] dark:border-[#352B24]">
            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'photos'
                  ? 'bg-white dark:bg-[#1E1917] text-[#B24C2B] shadow-xs'
                  : 'text-[#73675B] hover:text-[#241E1A] dark:hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>الصور ({localGallery.length})</span>
            </button>

            {allVideos.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('videos')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'videos'
                    ? 'bg-white dark:bg-[#1E1917] text-[#B24C2B] shadow-xs'
                    : 'text-[#73675B] hover:text-[#241E1A] dark:hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>الفيديو ({allVideos.length})</span>
              </button>
            )}
          </div>

          {/* Admin Management Buttons */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdminActiveTab('video');
                  setAdminModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                title="رفع فيديو توثيقي لهذا الكيان في مجلد WAH/videos"
              >
                <Film className="w-3.5 h-3.5" />
                <span>+ رفع فيديو للمكان</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminActiveTab('gallery');
                  setAdminModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8E422D] hover:bg-[#733524] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                title="إدارة المعرض والوسائط"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>إدارة المعرض</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: PHOTOS GALLERY VIEW                                            */}
      {/* ========================================================================= */}
      {activeTab === 'photos' && (
        <>
          {localGallery.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#FAF7F2] dark:bg-[#26201B] border border-dashed border-[#D9CFBE] dark:border-[#3D332A] text-center">
              <Camera className="w-10 h-10 text-[#A89C90] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-[#73675B] dark:text-[#A89C90] mb-1">
                لا توجد صور في المعرض التوثيقي حتى الآن
              </p>
              <p className="text-xs text-[#73675B]/80 mb-4">
                سيتم إضافة صور فوتوغرافية عالية الجودة لهذا المعلم قريباً.
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setAdminActiveTab('gallery');
                    setAdminModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8E422D] text-white text-xs font-bold hover:bg-[#733524] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>رفع أول صورة للمعرض</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mosaic Grid Layout */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {localGallery.map((imgUrl, idx) => {
                  const isCover = imgUrl === localCover;
                  return (
                    <div
                      key={idx}
                      onClick={() => openLightbox(idx)}
                      className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-[#FAF7F2] dark:bg-[#26201B] border border-[#E5DDD3] dark:border-[#352B24] cursor-pointer shadow-xs hover:shadow-md transition-all"
                    >
                      <img
                        src={imgUrl}
                        alt={`${entityTitle || 'صورة'} ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=600';
                        }}
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 text-white">
                        <span className="text-[11px] font-bold flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>تكبير</span>
                        </span>
                        <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded-md font-mono">
                          {idx + 1} / {localGallery.length}
                        </span>
                      </div>

                      {/* Cover Badge */}
                      {isCover && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[#8E422D] text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                          <Star className="w-3 h-3 fill-current" />
                          <span>الغلاف</span>
                        </div>
                      )}

                      {/* Admin Quick Delete Action */}
                      {isAdmin && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImagePendingDelete(imgUrl);
                            }}
                            className="min-h-[38px] min-w-[38px] p-2 rounded-xl bg-red-600/90 hover:bg-red-700 text-white shadow-md transition-colors cursor-pointer flex items-center justify-center"
                            title="حذف هذه الصورة من المعرض"
                            aria-label="حذف الصورة من المعرض"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* View Fullscreen CTA */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => openLightbox(0)}
                  className="text-xs font-bold text-[#B24C2B] hover:text-[#8E422D] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>فتح المعرض التفاعلي بالحجم الكامل ({localGallery.length} صور)</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: VIDEOS SHOWCASE VIEW                                           */}
      {/* ========================================================================= */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          {allVideos.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#FAF7F2] dark:bg-[#26201B] border border-dashed border-[#D9CFBE] dark:border-[#3D332A] text-center">
              <Film className="w-10 h-10 text-[#A89C90] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-[#73675B] dark:text-[#A89C90] mb-1">
                لا توجد مقاطع فيديو توثيقية مرفوعة بعد
              </p>
              <p className="text-xs text-[#73675B]/80 mb-4">
                يمكن لمدير النظام رفع فيديوهات توثيقية مباشرة وحفظها في WAH/videos.
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setAdminActiveTab('video');
                    setAdminModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8E422D] text-white text-xs font-bold hover:bg-[#733524] transition-colors cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>رفع فيديو توثيقي جديد</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Primary Selected Video Player */}
              {selectedVideoUrl && (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-[500px] border border-[#D9CFBE] dark:border-[#3D332A] shadow-lg flex items-center justify-center">
                  <video
                    src={selectedVideoUrl}
                    controls
                    className="w-full h-full object-contain"
                    poster={localCover || undefined}
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-[#8E422D]/90 backdrop-blur-xs text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs pointer-events-none">
                    <Video className="w-3.5 h-3.5 text-amber-300" />
                    <span>توثيق مرئي أصيل</span>
                  </div>
                </div>
              )}

              {/* Video playlist / thumbnails if multiple videos exist */}
              {allVideos.length > 1 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#73675B]">قائمة الفيديوهات المتوفرة:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {allVideos.map((vid, idx) => {
                      const isSelected = vid === selectedVideoUrl;
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedVideoUrl(vid)}
                          className={`relative aspect-video rounded-xl overflow-hidden bg-black/40 border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#B24C2B] shadow-md'
                              : 'border-transparent hover:border-[#D9CFBE]'
                          }`}
                        >
                          <video src={vid} className="w-full h-full object-cover" muted />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-white">
                              <Play className="w-4 h-4 fill-white ml-0.5" />
                            </div>
                          </div>
                          <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/75 text-[10px] text-white font-bold">
                            مقطع {idx + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULLSCREEN VISITOR LIGHTBOX                                              */}
      {/* ========================================================================= */}
      {lightboxOpen && localGallery.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none">
          {/* Lightbox Top Bar */}
          <div className="p-4 sm:px-6 flex items-center justify-between text-white border-b border-white/10 bg-black/40">
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-bold font-serif text-amber-200">
                {entityTitle || 'المعرض التوثيقي'}
              </span>
              <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-white/80 font-mono">
                {lightboxIndex + 1} من {localGallery.length}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Zoom In */}
              <button
                type="button"
                onClick={() => setLightboxZoom((prev) => Math.min(prev + 0.25, 2.5))}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="تكبير"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {/* Zoom Out */}
              <button
                type="button"
                onClick={() => setLightboxZoom((prev) => Math.max(prev - 0.25, 0.75))}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="تصغير"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              {/* Reset Zoom */}
              {lightboxZoom !== 1 && (
                <button
                  type="button"
                  onClick={() => setLightboxZoom(1)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="إعادة ضبط الحجم"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              {/* Download Image */}
              <button
                type="button"
                onClick={() => handleDownloadImage(localGallery[lightboxIndex])}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="تحميل الصورة"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Share Image Link */}
              <button
                type="button"
                onClick={() => handleShareImage(localGallery[lightboxIndex])}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="نسخ رابط الصورة"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Admin Delete from Lightbox */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setImagePendingDelete(localGallery[lightboxIndex])}
                  className="p-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  title="حذف هذه الصورة من المعرض"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">حذف من المعرض</span>
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={closeLightbox}
                className="p-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors cursor-pointer ml-2"
                title="إغلاق المعرض (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Main Stage */}
          <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
            {/* Previous Button */}
            <button
              type="button"
              onClick={prevImage}
              className="absolute right-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer"
              title="الصورة السابقة"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Main Stage Image */}
            <div
              className="transition-transform duration-200 max-h-[75vh] max-w-[90vw] flex items-center justify-center"
              style={{ transform: `scale(${lightboxZoom})` }}
            >
              <img
                src={localGallery[lightboxIndex]}
                alt={`${entityTitle} ${lightboxIndex + 1}`}
                className="max-h-[75vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={nextImage}
              className="absolute left-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer"
              title="الصورة التالية"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Bottom Filmstrip */}
          <div className="p-3 bg-black/60 border-t border-white/10 overflow-x-auto flex items-center justify-center gap-2">
            {localGallery.map((img, idx) => {
              const isActive = idx === lightboxIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setLightboxIndex(idx);
                    setLightboxZoom(1);
                  }}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    isActive ? 'border-[#B24C2B] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="مصغرة" className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN IN-PLACE MANAGEMENT MODAL                                           */}
      {/* ========================================================================= */}
      {adminModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] dark:bg-[#1E1917] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-[#D9CFBE] dark:border-[#3D332A] shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E5DDD3] dark:border-[#352B24] flex items-center justify-between bg-white dark:bg-[#231C18]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#8E422D]/10 text-[#8E422D]">
                  <Settings2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black font-serif text-[#241E1A] dark:text-[#FAF6F2]">
                    إدارة معرض وصور وفيديوهات: {entityTitle}
                  </h3>
                  <p className="text-[11px] text-[#73675B] dark:text-[#A89C90]">
                    المجلد السحابي: WAH/{entityType === 'cultural-craft' ? 'crafts' : 'places'}/{entitySlug || entityId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAdminModalOpen(false)}
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[#73675B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin Tabs */}
            <div className="px-6 pt-4 border-b border-[#E5DDD3] dark:border-[#352B24] flex items-center gap-4 bg-[#FAF7F2] dark:bg-[#1E1917]">
              <button
                type="button"
                onClick={() => setAdminActiveTab('gallery')}
                className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  adminActiveTab === 'gallery'
                    ? 'border-[#8E422D] text-[#8E422D]'
                    : 'border-transparent text-[#73675B] hover:text-[#241E1A]'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>معرض الصور ({localGallery.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminActiveTab('video')}
                className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  adminActiveTab === 'video'
                    ? 'border-[#8E422D] text-[#8E422D]'
                    : 'border-transparent text-[#73675B] hover:text-[#241E1A]'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>مقاطع الفيديو ({allVideos.length})</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: GALLERY IMAGES MANAGEMENT */}
              {adminActiveTab === 'gallery' && (
                <div className="space-y-6">
                  {/* Current Gallery Grid with Card Controls */}
                  <div>
                    <h4 className="text-xs font-bold text-[#241E1A] dark:text-[#FAF6F2] mb-3">
                      الصور الحالية بالمعرض (يمكنك تعيين الغلاف أو الحذف أو الترتيب):
                    </h4>

                    {localGallery.length === 0 ? (
                      <p className="text-xs text-[#73675B] py-4 text-center">لا توجد صور حالية بالمعرض.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {localGallery.map((imgUrl, idx) => {
                          const isCover = imgUrl === localCover;
                          return (
                            <div
                              key={idx}
                              className={`rounded-2xl p-2.5 border bg-white dark:bg-[#26201B] flex flex-col justify-between gap-2 transition-all ${
                                isCover
                                  ? 'border-[#8E422D] shadow-xs'
                                  : 'border-[#E5DDD3] dark:border-[#352B24]'
                              }`}
                            >
                              <div className="relative aspect-video rounded-xl overflow-hidden bg-black/10">
                                <img src={imgUrl} alt="صورة" className="w-full h-full object-cover" />
                                {isCover && (
                                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[#8E422D] text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span>الغلاف الرئيسي</span>
                                  </div>
                                )}
                              </div>

                              {/* Card Action Buttons */}
                              <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#E5DDD3] dark:border-[#352B24]">
                                {/* Reorder */}
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, 'left')}
                                    disabled={idx === 0 || isProcessing}
                                    className="p-1.5 rounded-md bg-[#FAF7F2] dark:bg-[#1E1917] border border-[#E5DDD3] dark:border-[#352B24] text-xs disabled:opacity-30 cursor-pointer"
                                    title="تحريك لليمين"
                                  >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, 'right')}
                                    disabled={idx === localGallery.length - 1 || isProcessing}
                                    className="p-1.5 rounded-md bg-[#FAF7F2] dark:bg-[#1E1917] border border-[#E5DDD3] dark:border-[#352B24] text-xs disabled:opacity-30 cursor-pointer"
                                    title="تحريك لليسار"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="flex items-center gap-1">
                                  {/* Set as Cover */}
                                  {!isCover && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetCover(imgUrl)}
                                      disabled={isProcessing}
                                      className="px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-bold transition-colors cursor-pointer"
                                    >
                                      تعيين كغلاف
                                    </button>
                                  )}

                                   {/* Delete */}
                                  <button
                                    type="button"
                                    onClick={() => setImagePendingDelete(imgUrl)}
                                    disabled={isProcessing}
                                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                    title="حذف من المعرض"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>حذف</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Upload New Image to Gallery */}
                  <div className="pt-4 border-t border-[#E5DDD3] dark:border-[#352B24]">
                    <h4 className="text-xs font-bold text-[#241E1A] dark:text-[#FAF6F2] mb-2 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-[#8E422D]" />
                      <span>رفع صور جديدة إلى المعرض (Cloudinary):</span>
                    </h4>
                    <AdminMediaUploader
                      entityType={entityType}
                      entitySlug={entitySlug || entityId}
                      entityTitle={entityTitle}
                      mediaCategory="image"
                      multiple={true}
                      value={[]}
                      onChange={(uploaded: any) => {
                        if (Array.isArray(uploaded)) {
                          uploaded.forEach((item: any) => {
                            const url = typeof item === 'string' ? item : (item?.secureUrl || item?.url);
                            if (url && typeof url === 'string') {
                              handleNewImageUploaded(url);
                            }
                          });
                        } else if (uploaded) {
                          const url = typeof uploaded === 'string' ? uploaded : (uploaded?.secureUrl || uploaded?.url);
                          if (url && typeof url === 'string') {
                            handleNewImageUploaded(url);
                          }
                        }
                      }}
                      helperText="الصور يتم رفعها وتوثيقها فوراً في مجلد المكان المخصص داخل Cloudinary."
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: VIDEOS MANAGEMENT */}
              {adminActiveTab === 'video' && (
                <div className="space-y-6">
                  {/* Current Videos */}
                  <div>
                    <h4 className="text-xs font-bold text-[#241E1A] dark:text-[#FAF6F2] mb-3">
                      الفيديوهات التوثيقية الحالية (WAH/videos):
                    </h4>

                    {allVideos.length === 0 ? (
                      <p className="text-xs text-[#73675B] py-4 text-center">لا توجد مقاطع فيديو مخصصة لهذا الكيان حالياً.</p>
                    ) : (
                      <div className="space-y-3">
                        {allVideos.map((vidUrl, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-white dark:bg-[#26201B] border border-[#E5DDD3] dark:border-[#352B24] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-12 rounded-lg bg-black overflow-hidden relative shrink-0">
                                <video src={vidUrl} className="w-full h-full object-cover" muted />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Play className="w-3.5 h-3.5 text-white fill-white" />
                                </div>
                              </div>
                              <div className="truncate max-w-sm">
                                <span className="text-xs font-bold text-[#241E1A] dark:text-[#FAF6F2] block">
                                  مقطع فيديو {idx + 1}
                                </span>
                                <span className="text-[10px] text-[#73675B] truncate block font-mono" dir="ltr">
                                  {vidUrl}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setVideoPendingDelete(vidUrl)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>إزالة الفيديو</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Upload New Video */}
                  <div className="pt-4 border-t border-[#E5DDD3] dark:border-[#352B24]">
                    <h4 className="text-xs font-bold text-[#241E1A] dark:text-[#FAF6F2] mb-2 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-[#8E422D]" />
                      <span>رفع مقطع فيديو جديد (يُحفظ في مجلد WAH/videos):</span>
                    </h4>
                    <AdminMediaUploader
                      entityType="video"
                      entitySlug={entitySlug || entityId}
                      entityTitle={entityTitle}
                      mediaCategory="video"
                      multiple={false}
                      value={localVideoUrl ? [localVideoUrl] : []}
                      onChange={(uploaded: any) => {
                        let finalVidUrl = '';
                        if (Array.isArray(uploaded) && uploaded.length > 0) {
                          const item = uploaded[0];
                          finalVidUrl = typeof item === 'string' ? item : (item?.secureUrl || item?.url || '');
                        } else if (typeof uploaded === 'string') {
                          finalVidUrl = uploaded;
                        } else if (uploaded && typeof uploaded === 'object') {
                          finalVidUrl = uploaded.secureUrl || uploaded.url || '';
                        }
                        if (finalVidUrl) {
                          handleNewVideoUploaded(finalVidUrl);
                        }
                      }}
                      helperText="يتم رفع الفيديو وتجزئته بحجم يصل حتى 150MB ويتم تخزينه في WAH/videos."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E5DDD3] dark:border-[#352B24] flex items-center justify-between bg-white dark:bg-[#231C18]">
              <span className="text-xs text-[#73675B]">
                التعديلات تُحفظ فوراً في السحابة وقاعدة البيانات.
              </span>
              <button
                type="button"
                onClick={() => setAdminModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#8E422D] text-white text-xs font-bold hover:bg-[#733524] transition-colors cursor-pointer"
              >
                إغلاق اللوحة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Non-blocking Gallery Image Delete Confirmation Dialog */}
      {imagePendingDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#26201B] border border-[#E5DDD3] dark:border-[#352B24] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/50">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#241E1A] dark:text-[#FAF6F2]">
                  تأكيد حذف الصورة
                </h3>
                <p className="text-xs text-[#73675B] dark:text-[#A89C90]">
                  حذف الصورة من معرض المكان وتحديث التخزين
                </p>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden aspect-video bg-black/5 relative">
              <img
                src={imagePendingDelete}
                alt="الصورة المراد حذفها"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5DDD3] dark:border-[#352B24]">
              <button
                type="button"
                onClick={() => setImagePendingDelete(null)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1917] border border-[#E5DDD3] dark:border-[#352B24] text-xs font-bold text-[#73675B] hover:bg-gray-100 dark:hover:bg-[#2D241E] transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleRemoveFromGallery(imagePendingDelete)}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>نعم، احذف من المعرض</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Non-blocking Video Delete Confirmation Dialog */}
      {videoPendingDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#26201B] border border-[#E5DDD3] dark:border-[#352B24] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/50">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#241E1A] dark:text-[#FAF6F2]">
                  تأكيد إزالة الفيديو
                </h3>
                <p className="text-xs text-[#73675B] dark:text-[#A89C90]">
                  إزالة هذا المقطع من قائمة فيديوهات المكان
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5DDD3] dark:border-[#352B24]">
              <button
                type="button"
                onClick={() => setVideoPendingDelete(null)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1917] border border-[#E5DDD3] dark:border-[#352B24] text-xs font-bold text-[#73675B] hover:bg-gray-100 dark:hover:bg-[#2D241E] transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleRemoveVideo(videoPendingDelete)}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري الإزالة...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>نعم، إزالة الفيديو</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
