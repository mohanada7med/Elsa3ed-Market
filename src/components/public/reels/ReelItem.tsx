import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../../context/AppContext.tsx';
import { CraftReel } from '../../../types.ts';
import { craftReelsService } from '../../../services/craftReelsService.ts';
import { ReelInfoSection } from './ReelInfoSection.tsx';
import { ReelActionButtons } from './ReelActionButtons.tsx';
import { ReelCommentsDrawer } from './ReelCommentsDrawer.tsx';
import { getOptimizedVideoUrl, getOptimizedVideoPoster } from '../../../utils/cloudinaryMedia.ts';
import {
  Play,
  Heart,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  X,
  Trash2,
  VolumeX,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReelItemProps {
  reel: CraftReel;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onSelectProduct?: (productId: string) => void;
  onSelectSeller?: (sellerId: string) => void;
  onDeleteReel?: (reelId: string) => void;
  onClose?: () => void;
  showCloseButton?: boolean;
  reelIndex?: number;
  totalReels?: number;
  hasBottomNav?: boolean;
}

export const ReelItem: React.FC<ReelItemProps> = ({
  reel,
  isActive,
  isMuted,
  onToggleMute,
  onSelectProduct,
  onSelectSeller,
  onDeleteReel,
  onClose,
  showCloseButton = false,
  reelIndex,
  totalReels,
  hasBottomNav = false
}) => {
  const { currentUser, addToast } = useApp();

  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likesCount || 0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);

  // Derive optimized streamable video URL (f_auto, q_auto, faststart MP4)
  const safeVideoUrl = useMemo(
    () =>
      getOptimizedVideoUrl(reel.videoUrl, { maxDimension: 1080 }) ||
      'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-potter-shaping-a-clay-vase-41717-large.mp4',
    [reel.videoUrl]
  );

  // Derive instant first-frame JPEG poster (35KB vs 50MB raw video)
  const safePosterUrl = useMemo(
    () => getOptimizedVideoPoster(reel.videoUrl, reel.posterUrl || reel.productImage, 800),
    [reel.videoUrl, reel.posterUrl, reel.productImage]
  );

  // مزامنة حالة الإعجاب
  useEffect(() => {
    const userLikes = craftReelsService.getUserLikedReels();
    setIsLiked(userLikes.includes(reel.id));
    setLikesCount(reel.likesCount || 0);
  }, [reel.id, reel.likesCount]);

  // مزامنة الصوت مباشرة مع المتصفح
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // آلية التشغيل الفوري والتعامل مع الصوت التلقائي
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      setHasVideoError(false);
      setIsVideoLoading(true);
      craftReelsService.incrementViews(reel.id);

      video.muted = isMuted;

      const executePlay = async () => {
        try {
          await video.play();
          setIsPlaying(true);
          setIsVideoLoading(false);
          setShowAudioPrompt(false);
        } catch (err: any) {
          if (err?.name === 'AbortError') return;
          // المتصفح حظر التشغيل بالصوت -> تشغيل فوري بدون صوت لتفادي التعليق
          video.muted = true;
          setShowAudioPrompt(true);
          try {
            await video.play();
            setIsPlaying(true);
            setIsVideoLoading(false);
          } catch (muteErr: any) {
            if (muteErr?.name === 'AbortError') return;
            setIsVideoLoading(false);
            setIsPlaying(false);
          }
        }
      };

      void executePlay();
    } else {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
      setIsVideoLoading(false);
      setIsCommentsOpen(false);
      setShowAudioPrompt(false);
      if (progressBarRef.current) {
        progressBarRef.current.style.width = '0%';
      }
    }
  }, [isActive, isMuted, safeVideoUrl]);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => { });
      setIsPlaying(true);
      setShowPlayIcon(false);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 700);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const prog = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${prog}%`;
      }
    }
  };

  const handleLike = () => {
    const res = craftReelsService.toggleLikeReel(reel.id);
    setIsLiked(res.isLiked);
    setLikesCount(res.newLikesCount);

    if (res.isLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    }
  };

  const handleVideoAreaClick = () => {
    const now = Date.now();
    const timeDiff = now - lastTapRef.current;
    lastTapRef.current = now;

    if (timeDiff < 300) {
      if (!isLiked) {
        handleLike();
      } else {
        setShowHeartBurst(true);
        setTimeout(() => setShowHeartBurst(false), 900);
      }
    } else {
      handleTogglePlay();
    }
  };

  const handleShare = () => {
    craftReelsService.incrementShares(reel.id);
    const shareUrl = `${window.location.origin}/?reel=${reel.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: reel.title,
          text: `شاهد إبداع الصنعة الصعيدية في "${reel.title}" على منصة وه!`,
          url: shareUrl
        })
        .catch(() => { });
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      addToast('تم نسخ الرابط', 'تم نسخ رابط مقطع الفيديو بنجاح', 'success');
      setTimeout(() => setCopiedLink(false), 2400);
    }
  };

  const canDelete = Boolean(
    currentUser?.role === 'admin' ||
    (currentUser?.role === 'seller' &&
      reel.sellerId &&
      (currentUser.id === reel.sellerId || currentUser.sellerId === reel.sellerId))
  );

  const handleDeleteReel = async () => {
    setIsDeleting(true);
    try {
      await craftReelsService.deleteReelAsync(currentUser || { role: 'admin' }, reel.id);
      addToast('تم حذف الفيديو', `تم حذف فيديو "${reel.title}" بنجاح`, 'info');
      setIsConfirmingDelete(false);
      if (onDeleteReel) onDeleteReel(reel.id);
    } catch (err: any) {
      addToast('خطأ في الحذف', err?.message || 'فشل في حذف الفيديو', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      id={`reel-item-${reel.id}`}
      className="relative w-full h-full bg-black overflow-hidden select-none flex items-center justify-center"
      style={{ height: '100%', maxHeight: '100dvh' }}
    >
      {/* 1. Progress Bar (DOM Ref - zero React re-renders during playback) */}
      <div className="absolute top-0 inset-x-0 z-30 h-1 bg-white/20">
        <div
          ref={progressBarRef}
          className="h-full bg-amber-500 transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(245,158,11,0.8)]"
          style={{ width: '0%' }}
        />
      </div>

      {/* 2. Top Bar */}
      <div className="absolute top-2 inset-x-0 z-30 px-4 py-2 flex items-center justify-between pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2 pointer-events-auto">
          {typeof reelIndex === 'number' && typeof totalReels === 'number' && (
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white/90 border border-white/10">
              {reelIndex + 1} / {totalReels}
            </span>
          )}
          <span className="hidden xs:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9a6a35]/90 backdrop-blur-md text-[11px] font-bold text-white shadow-sm border border-amber-500/30">
            <Sparkles className="w-3 h-3 text-[#d5a56d]" />
            <span>ريلز الصعيد</span>
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={onToggleMute}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white transition-all cursor-pointer active:scale-90"
            title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#d6aa72]" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {showCloseButton && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white transition-all cursor-pointer active:scale-90"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Media Canvas */}
      <div
        className="relative w-full h-full flex items-center justify-center cursor-pointer bg-black overflow-hidden"
        onClick={handleVideoAreaClick}
      >
        {/* Instant Poster Canvas (Zero black/white flash between videos) */}
        {(!isPlaying || isVideoLoading) && (
          <img
            src={safePosterUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300 z-[5]"
            loading="eager"
            decoding="async"
          />
        )}

        <video
          ref={videoRef}
          src={safeVideoUrl}
          poster={safePosterUrl}
          preload={isActive ? 'metadata' : 'none'}
          playsInline
          webkit-playsinline="true"
          loop
          muted={isMuted}
          onCanPlay={() => setIsVideoLoading(false)}
          onWaiting={() => setIsVideoLoading(true)}
          onPlaying={() => {
            setIsVideoLoading(false);
            setIsPlaying(true);
          }}
          onError={() => {
            setIsVideoLoading(false);
            setHasVideoError(true);
          }}
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover"
        />

        {isVideoLoading && !hasVideoError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none bg-black/20 backdrop-blur-[2px]">
            <div className="w-11 h-11 border-3 border-white/20 border-t-amber-400 rounded-full animate-spin" />
          </div>
        )}

        {hasVideoError && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-20 space-y-4">
            <AlertTriangle className="w-12 h-12 text-[#d6aa72]" />
            <p className="text-sm font-medium text-white">تعذر تحميل مقطع الفيديو</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current) {
                  videoRef.current.load();
                  videoRef.current.play().catch(() => { });
                }
              }}
              className="px-4 py-2 bg-[#9a6a35] hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة التشغيل</span>
            </button>
          </div>
        )}

        {showPlayIcon && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
              <Play className="w-8 h-8 fill-white mr-1" />
            </div>
          </div>
        )}

        <AnimatePresence>
          {showHeartBurst && (
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1.3, opacity: 1 }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center z-25 pointer-events-none"
            >
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Bottom Shadow Gradient */}
      <div className="absolute bottom-0 inset-x-0 h-96 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none z-10" />

      {/* 5. Bottom Overlay Zones */}
      <div
        className={`absolute bottom-0 inset-x-0 z-20 px-4 flex items-end justify-between gap-4 pointer-events-none transition-all duration-300 ${hasBottomNav
          ? 'pb-[calc(env(safe-area-inset-bottom,0px)+100px)] sm:pb-44'
          : 'pb-[calc(env(safe-area-inset-bottom,0px)+16px)] sm:pb-6'
          }`}
        dir="rtl"
      >
        {/* النصوص والمنتج (اليمين) */}
        <div className="flex-1 pointer-events-auto max-w-[74%] drop-shadow-xl">
          <ReelInfoSection
            reel={reel}
            onSelectSeller={onSelectSeller}
            onSelectProduct={onSelectProduct}
            onCloseParent={onClose}
          />
        </div>

        {/* أزرار التفاعل (اليسار) */}
        <div
          className={`pointer-events-auto flex flex-col items-center drop-shadow-2xl ${hasBottomNav ? 'mb-8' : 'mb-1'
            }`}
        >
          <ReelActionButtons
            reel={reel}
            isLiked={isLiked}
            likesCount={likesCount}
            isMuted={isMuted}
            copiedLink={copiedLink}
            canDelete={canDelete}
            onLike={handleLike}
            onOpenComments={() => setIsCommentsOpen(true)}
            onShare={handleShare}
            onToggleMute={onToggleMute}
            onRequestDelete={() => setIsConfirmingDelete(true)}
          />
        </div>
      </div>      {/* 6. Comments Drawer */}
      <ReelCommentsDrawer
        reel={reel}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        onCommentAdded={(newComm) => {
          if (!reel.comments) reel.comments = [];
          reel.comments.unshift(newComm);
        }}
      />

      {/* 7. Delete Modal */}
      <AnimatePresence>
        {isConfirmingDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 text-right"
            dir="rtl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1c1815] border border-rose-500/30 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-white"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="font-bold text-base text-white">
                  {currentUser?.role === 'admin' ? 'حذف الفيديو (صلاحيات المدير)' : 'حذف مقطع الفيديو'}
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  هل أنت متأكد من حذف مقطع "{reel.title}" نهائياً من المنصة؟
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteReel}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'جارِ الحذف...' : 'نعم، احذف'}</span>
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-5 py-3 bg-white/10 hover:bg-white/15 text-zinc-300 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};