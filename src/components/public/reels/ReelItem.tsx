import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../context/AppContext.tsx';
import { CraftReel } from '../../../types.ts';
import { craftReelsService } from '../../../services/craftReelsService.ts';
import { ReelInfoSection } from './ReelInfoSection.tsx';
import { ReelActionButtons } from './ReelActionButtons.tsx';
import { ReelCommentsDrawer } from './ReelCommentsDrawer.tsx';
import {
  Play,
  Heart,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  X,
  Trash2
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

  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likesCount || 0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTapRef = useRef<number>(0);

  // Sync liked state from service
  useEffect(() => {
    const userLikes = craftReelsService.getUserLikedReels();
    setIsLiked(userLikes.includes(reel.id));
    setLikesCount(reel.likesCount || 0);
  }, [reel.id, reel.likesCount]);

  // Autoplay / Pause according to isActive
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      setHasVideoError(false);
      craftReelsService.incrementViews(reel.id);
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn('[ReelItem] Video play was prevented:', err);
            setIsPlaying(false);
          });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setIsCommentsOpen(false);
    }
  }, [isActive, reel.id]);

  // Handle Play/Pause toggle on video tap
  const handleTogglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      setShowPlayIcon(false);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 800);
    }
  };

  // Video Progress Update
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const prog = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(prog);
    }
  };

  // Like Action
  const handleLike = () => {
    const res = craftReelsService.toggleLikeReel(reel.id);
    setIsLiked(res.isLiked);
    setLikesCount(res.newLikesCount);

    if (res.isLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    }
  };

  // Video Tap Handler (Single Tap = Play/Pause, Double Tap = Like)
  const handleVideoAreaClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const timeDiff = now - lastTapRef.current;
    lastTapRef.current = now;

    if (timeDiff < 300) {
      // Double Tap -> Like & Burst
      if (!isLiked) {
        handleLike();
      } else {
        setShowHeartBurst(true);
        setTimeout(() => setShowHeartBurst(false), 900);
      }
    } else {
      // Single Tap -> Play/Pause
      handleTogglePlay();
    }
  };

  // Share Action
  const handleShare = () => {
    craftReelsService.incrementShares(reel.id);
    const shareUrl = `${window.location.origin}/?reel=${reel.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: reel.title,
          text: `شاهد إبداع الصنعة الصعيدية في "${reel.title}" على سوق الصعيد!`,
          url: shareUrl
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      addToast('تم نسخ الرابط', 'تم نسخ رابط مقطع الفيديو للمشاركة بنجاح', 'success');
      setTimeout(() => setCopiedLink(false), 2400);
    }
  };

  // Delete Permission
  const canDelete =
    currentUser?.role === 'admin' ||
    (currentUser?.role === 'seller' &&
      (currentUser?.sellerId === reel.sellerId || currentUser?.id === reel.sellerId));

  const handleDeleteReel = async () => {
    setIsDeleting(true);
    try {
      await craftReelsService.deleteReelAsync(currentUser || { role: 'admin' }, reel.id);
      addToast('تم حذف الفيديو', `تم حذف فيديو "${reel.title}" بنجاح`, 'info');
      setIsConfirmingDelete(false);
      if (onDeleteReel) {
        onDeleteReel(reel.id);
      }
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
      style={{
        height: '100%',
        maxHeight: '100dvh'
      }}
    >
      {/* 1. Top Smooth Progress Bar */}
      <div className="absolute top-0 inset-x-0 z-30 h-0.5 bg-white/20">
        <div
          className="h-full bg-[#B45F42] transition-all duration-100 ease-linear"
          style={{ width: `${videoProgress}%` }}
        />
      </div>

      {/* 2. Top Header (Minimalist: Close button + subtle counter / badge) */}
      <div className="absolute top-2 inset-x-0 z-30 px-3 py-1 flex items-center justify-between pointer-events-none bg-gradient-to-b from-black/60 to-transparent">
        {/* Counter / Category pill */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {typeof reelIndex === 'number' && typeof totalReels === 'number' && (
            <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs text-[10px] font-bold text-white/80 border border-white/10">
              {reelIndex + 1} / {totalReels}
            </span>
          )}
          <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#B45F42]/80 backdrop-blur-xs text-[10px] font-bold text-white shadow-xs">
            <Sparkles className="w-2.5 h-2.5" />
            <span>ريلز الصعيد</span>
          </span>
        </div>

        {/* Close Button */}
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/15 text-white transition-all pointer-events-auto cursor-pointer"
            title="إغلاق"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3. Main Video Player Canvas */}
      <div
        className="relative w-full h-full flex items-center justify-center cursor-pointer bg-[#14100E] overflow-hidden"
        onClick={handleVideoAreaClick}
      >
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={reel.posterUrl}
          playsInline
          loop
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onWaiting={() => setIsVideoLoading(true)}
          onPlaying={() => {
            setIsVideoLoading(false);
            setIsPlaying(true);
          }}
          onCanPlay={() => setIsVideoLoading(false)}
          onError={() => {
            setIsVideoLoading(false);
            setHasVideoError(true);
          }}
          className="w-full h-full object-cover"
        />

        {/* Video Loading Spinner */}
        {isVideoLoading && !hasVideoError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="w-10 h-10 border-2 border-white/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        )}

        {/* Video Error Fallback */}
        {hasVideoError && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center z-20 space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-400" />
            <p className="text-xs text-white">تعذر تحميل الفيديو حالياً</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current) {
                  videoRef.current.load();
                  videoRef.current.play().catch(() => {});
                }
              }}
              className="px-3 py-1.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        )}

        {/* Subtle Pause Indicator */}
        {showPlayIcon && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white animate-scale-up">
              <Play className="w-7 h-7 fill-white mr-0.5" />
            </div>
          </div>
        )}

        {/* Double-Tap Heart Burst Animation */}
        <AnimatePresence>
          {showHeartBurst && (
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1.25, opacity: 1 }}
              exit={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center z-25 pointer-events-none"
            >
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Bottom Overlay Gradient for clean text readability */}
      <div className="absolute bottom-0 inset-x-0 h-48 sm:h-56 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

      {/* 5. Clear Non-Overlapping Layout Zones */}
      <div
        className={`absolute bottom-0 inset-x-0 z-20 px-3 sm:px-4 flex items-end justify-between gap-3 pointer-events-none ${
          hasBottomNav
            ? 'pb-[calc(env(safe-area-inset-bottom)+70px)]'
            : 'pb-[calc(env(safe-area-inset-bottom)+16px)] sm:pb-5'
        }`}
        dir="rtl"
      >
        {/* Right / Start: Seller Info, Caption, Product Pill */}
        <ReelInfoSection
          reel={reel}
          onSelectSeller={onSelectSeller}
          onSelectProduct={onSelectProduct}
          onCloseParent={onClose}
        />

        {/* Left / End: Compact Action Buttons Column */}
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

      {/* 6. Sliding Comments Drawer */}
      <ReelCommentsDrawer
        reel={reel}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        onCommentAdded={(newComm) => {
          if (!reel.comments) reel.comments = [];
          reel.comments.unshift(newComm);
        }}
      />

      {/* 7. Delete Confirmation Dialog */}
      <AnimatePresence>
        {isConfirmingDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 text-right"
            dir="rtl"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#201A16] border border-rose-500/40 rounded-3xl p-5 sm:p-6 max-w-xs sm:max-w-sm w-full space-y-4 shadow-2xl text-white"
            >
              <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {currentUser?.role === 'admin' ? 'حذف الفيديو (صلاحيات المدير)' : 'حذف مقطع الفيديو'}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  هل أنت متأكد من حذف مقطع "{reel.title}" نهائياً من المنصة؟
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteReel}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg cursor-pointer transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'جارِ الحذف...' : 'نعم، احذف'}</span>
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-bold rounded-xl cursor-pointer transition-all"
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
