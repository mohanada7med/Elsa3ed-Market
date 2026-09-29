import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { CraftReel } from '../../../types';
import { craftReelsService } from '../../../services/craftReelsService';
import { ReelInfoSection } from './ReelInfoSection';
import { ReelActionButtons } from './ReelActionButtons';
import { ReelCommentsDrawer } from './ReelCommentsDrawer';
import {
  getOptimizedVideoUrl,
  getOptimizedVideoPoster
} from '../../../utils/cloudinaryMedia';
import {
  generateVideoSchema,
  updatePageSEO
} from '../../../utils/seo';

import {
  Play,
  Heart,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  X,
  Trash2,
  VolumeX,
  Volume2,
  ChevronUp,
  ChevronDown
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
  const {
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthModalTab,
    addToast
  } = useApp();

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

  const [showControls, setShowControls] = useState(true);
  const [isEntering, setIsEntering] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMobileScreen =
    typeof window !== 'undefined'
      ? window.innerWidth <= 768
      : false;

  const safeVideoUrl = useMemo(
    () =>
      getOptimizedVideoUrl(reel.videoUrl, {
        maxDimension: isMobileScreen ? 720 : 1080,
        qualityMode: isMobileScreen ? 'eco' : 'auto',
        forceMp4: true
      }) ||
      reel.videoUrl ||
      'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-potter-shaping-a-clay-vase-41717-large.mp4',
    [reel.videoUrl, isMobileScreen]
  );

  const [currentVideoSrc, setCurrentVideoSrc] =
    useState(safeVideoUrl);

  useEffect(() => {
    setCurrentVideoSrc(safeVideoUrl);
    setHasVideoError(false);
  }, [safeVideoUrl]);

  const safePosterUrl = useMemo(
    () =>
      getOptimizedVideoPoster(
        reel.videoUrl,
        reel.posterUrl || reel.productImage,
        720
      ),
    [reel.videoUrl, reel.posterUrl, reel.productImage]
  );

  /* -------------------------------------------------------
     SEO
  ------------------------------------------------------- */

  useEffect(() => {
    if (!isActive) return;

    const parsedDuration = reel.duration
      ? reel.duration.startsWith('PT')
        ? reel.duration
        : `PT${parseInt(reel.duration, 10) || 30}S`
      : 'PT30S';

    const creator =
      reel.artisanName ||
      reel.workshopName ||
      'حرفيي وه';

    const videoSchema = generateVideoSchema({
      title:
        reel.title ||
        'فيديو ورشة وحرفة يدوية - وه صعيد مصر',

      description:
        reel.description ||
        `فيديو يوثق حرفة يدوية وتراثية في صعيد مصر بصناعة ${creator}`,

      thumbnailUrl: safePosterUrl,
      uploadDate:
        reel.createdAt ||
        new Date().toISOString(),

      contentUrl: safeVideoUrl,
      duration: parsedDuration
    });

    updatePageSEO({
      title: `${reel.title} | ريلز الحرفيين`,
      description:
        reel.description ||
        'شاهد إبداع الحرفيين وورش العمل التراثية في صعيد مصر',
      image: safePosterUrl,
      schema: videoSchema
    });
  }, [
    isActive,
    reel.id,
    reel.title,
    reel.description,
    safePosterUrl,
    safeVideoUrl,
    reel.createdAt,
    reel.duration,
    reel.artisanName,
    reel.workshopName
  ]);

  /* -------------------------------------------------------
     LIKE SYNC
  ------------------------------------------------------- */

  useEffect(() => {
    if (currentUser?.id && currentUser.id !== 'guest-visitor' && currentUser.role !== 'guest') {
      const userLikes = craftReelsService.getUserLikedReels(currentUser.id);
      setIsLiked(userLikes.includes(reel.id) || Boolean((reel as any).isLiked));

      // Asynchronously fetch fresh likes from server for this user
      craftReelsService.fetchUserLikedReels(currentUser).then((freshLikes) => {
        setIsLiked(freshLikes.includes(reel.id));
      }).catch(() => { });
    } else {
      setIsLiked(false);
    }
    setLikesCount(reel.likesCount || 0);
  }, [reel.id, reel.likesCount, currentUser?.id, currentUser?.role]);

  /* -------------------------------------------------------
     AUDIO
  ------------------------------------------------------- */

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  /* -------------------------------------------------------
     CONTROLS AUTO HIDE
  ------------------------------------------------------- */

  const revealControls = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (isPlaying) {
      controlsTimeoutRef.current =
        setTimeout(() => {
          setShowControls(false);
        }, 3200);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (video) {
        try {
          video.pause();
          video.currentTime = 0;
          video.removeAttribute('src');
          video.load();
        } catch (_) {}
      }
    };
  }, []);

  /* -------------------------------------------------------
     ACTIVE VIDEO
  ------------------------------------------------------- */

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    let isCancelled = false;

    if (isActive) {
      setHasVideoError(false);
      setIsVideoLoading(true);
      setIsEntering(true);
      setShowControls(true);

      craftReelsService.incrementViews(reel.id);

      video.muted = isMuted;

      const executePlay = async () => {
        try {
          await video.play();

          if (isCancelled) return;

          setIsPlaying(true);
          setIsVideoLoading(false);
          setShowAudioPrompt(false);

          setTimeout(() => {
            if (!isCancelled) setIsEntering(false);
          }, 450);

        } catch (err: any) {
          if (isCancelled || err?.name === 'AbortError') return;

          video.muted = true;
          if (!isCancelled) setShowAudioPrompt(true);

          try {
            await video.play();

            if (isCancelled) return;

            setIsPlaying(true);
            setIsVideoLoading(false);

            setTimeout(() => {
              if (!isCancelled) setIsEntering(false);
            }, 450);

          } catch (muteErr: any) {
            if (isCancelled || muteErr?.name === 'AbortError') return;

            setIsVideoLoading(false);
            setIsPlaying(false);
            setIsEntering(false);
          }
        }
      };

      void executePlay();

    } else {
      try {
        video.pause();
        video.currentTime = 0;
      } catch (_) {}

      setIsPlaying(false);
      setIsVideoLoading(false);
      setIsCommentsOpen(false);
      setShowAudioPrompt(false);
      setShowControls(true);
      setIsEntering(false);

      if (progressBarRef.current) {
        progressBarRef.current.style.width = '0%';
      }
    }

    return () => {
      isCancelled = true;
      try {
        video.pause();
      } catch (_) {}
    };
  }, [
    isActive,
    isMuted,
    currentVideoSrc,
    reel.id
  ]);

  /* -------------------------------------------------------
     VIDEO ERROR
  ------------------------------------------------------- */

  const handleVideoError = () => {
    if (
      reel.videoUrl &&
      currentVideoSrc !== reel.videoUrl
    ) {
      setCurrentVideoSrc(reel.videoUrl);
      setIsVideoLoading(true);
      setHasVideoError(false);

      if (videoRef.current) {
        videoRef.current.load();

        if (isActive) {
          videoRef.current
            .play()
            .catch(() => { });
        }
      }
    } else {
      setIsVideoLoading(false);
      setHasVideoError(true);
    }
  };

  /* -------------------------------------------------------
     PLAY / PAUSE
  ------------------------------------------------------- */

  const handleTogglePlay = () => {
    const video = videoRef.current;

    if (!video) return;

    revealControls();

    if (video.paused) {
      video
        .play()
        .catch(() => { });

      setIsPlaying(true);
      setShowPlayIcon(false);
    } else {
      video.pause();

      setIsPlaying(false);
      setShowPlayIcon(true);

      setTimeout(() => {
        setShowPlayIcon(false);
      }, 700);
    }
  };

  /* -------------------------------------------------------
     PROGRESS
  ------------------------------------------------------- */

  const handleTimeUpdate = () => {
    const video = videoRef.current;

    if (
      video &&
      video.duration &&
      progressBarRef.current
    ) {
      const progress =
        (video.currentTime / video.duration) * 100;

      progressBarRef.current.style.width =
        `${progress}%`;
    }
  };

  /* -------------------------------------------------------
     LIKE
  ------------------------------------------------------- */

  const handleLike = async () => {
    if (!isAuthenticated || !currentUser || currentUser.id === 'guest-visitor' || currentUser.role === 'guest') {
      addToast(
        'تسجيل الدخول مطلوب',
        'سجّل دخولك الأول أو أنشئ حساب عشان تقدر تعمل لايك وتتفاعل مع حكايات وفيديوهات الصعيد',
        'info'
      );
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      return;
    }

    const prevLiked = isLiked;
    const prevCount = likesCount;
    const nextLiked = !prevLiked;
    const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1));

    // Optimistic UI update
    setIsLiked(nextLiked);
    setLikesCount(nextCount);

    if (nextLiked) {
      setShowHeartBurst(true);
      setTimeout(() => {
        setShowHeartBurst(false);
      }, 900);
    }

    try {
      const res = await craftReelsService.toggleLikeReel(reel.id, currentUser);
      setIsLiked(res.isLiked);
      setLikesCount(res.newLikesCount);
    } catch (err: any) {
      // Revert optimistic state
      setIsLiked(prevLiked);
      setLikesCount(prevCount);

      if (err?.code === 'UNAUTHORIZED') {
        addToast(
          'تسجيل الدخول مطلوب',
          'سجّل دخولك الأول أو أنشئ حساب عشان تقدر تعمل لايك وتتفاعل مع حكايات وفيديوهات الصعيد',
          'info'
        );
        setAuthModalTab('login');
        setIsAuthModalOpen(true);
      } else {
        addToast('تعذر حفظ الإعجاب', err?.message || 'حدث خطأ أثناء حفظ الإعجاب، حاول مجدداً', 'error');
      }
    }
  };

  /* -------------------------------------------------------
     DOUBLE TAP
  ------------------------------------------------------- */

  const handleVideoAreaClick = () => {
    const now = Date.now();

    const timeDiff =
      now - lastTapRef.current;

    lastTapRef.current = now;

    if (timeDiff < 300) {
      if (!isAuthenticated || !currentUser || currentUser.id === 'guest-visitor' || currentUser.role === 'guest') {
        addToast(
          'تسجيل الدخول مطلوب',
          'سجّل دخولك الأول أو أنشئ حساب عشان تقدر تعمل لايك وتتفاعل مع حكايات وفيديوهات الصعيد',
          'info'
        );
        setAuthModalTab('login');
        setIsAuthModalOpen(true);
        return;
      }

      if (!isLiked) {
        handleLike();
      } else {
        setShowHeartBurst(true);

        setTimeout(() => {
          setShowHeartBurst(false);
        }, 900);
      }

      return;
    }

    handleTogglePlay();
  };

  /* -------------------------------------------------------
     SHARE
  ------------------------------------------------------- */

  const handleShare = () => {
    craftReelsService.incrementShares(reel.id);

    const shareUrl =
      `${window.location.origin}/?reel=${reel.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: reel.title,
          text:
            `شاهد إبداع الصنعة الصعيدية في "${reel.title}" على منصة وه!`,
          url: shareUrl
        })
        .catch(() => { });
    } else {
      navigator.clipboard.writeText(shareUrl);

      setCopiedLink(true);

      addToast(
        'تم نسخ الرابط',
        'تم نسخ رابط مقطع الفيديو بنجاح',
        'success'
      );

      setTimeout(() => {
        setCopiedLink(false);
      }, 2400);
    }
  };

  /* -------------------------------------------------------
     DELETE
  ------------------------------------------------------- */

  const canDelete = Boolean(
    currentUser?.role === 'admin' ||
    (
      currentUser?.role === 'seller' &&
      reel.sellerId &&
      (
        currentUser.id === reel.sellerId ||
        currentUser.sellerId === reel.sellerId
      )
    )
  );

  const handleDeleteReel = async () => {
    setIsDeleting(true);

    try {
      await craftReelsService.deleteReelAsync(
        currentUser || { role: 'admin' },
        reel.id
      );

      addToast(
        'تم حذف الفيديو',
        `تم حذف فيديو "${reel.title}" بنجاح`,
        'info'
      );

      setIsConfirmingDelete(false);

      if (onDeleteReel) {
        onDeleteReel(reel.id);
      }

    } catch (err: any) {
      addToast(
        'خطأ في الحذف',
        err?.message ||
        'فشل في حذف الفيديو',
        'error'
      );

    } finally {
      setIsDeleting(false);
    }
  };

  /* -------------------------------------------------------
     MAIN UI
  ------------------------------------------------------- */

  return (
    <div
      id={`reel-item-${reel.id}`}
      className="
        relative
        w-full
        h-full
        overflow-hidden
        select-none
        flex
        items-center
        justify-center
        bg-[#100b08]
      "
      style={{
        height: '100%',
        maxHeight: '100dvh'
      }}
    >

      {/* =====================================================
          CINEMATIC BACKDROP
      ===================================================== */}

      <div className="absolute inset-0 overflow-hidden">

        <motion.img
          src={safePosterUrl}
          alt=""
          aria-hidden="true"
          initial={{
            scale: 1.15,
            opacity: 0.25
          }}
          animate={{
            scale: isActive ? 1.08 : 1.15,
            opacity: isActive ? 0.38 : 0.2
          }}
          transition={{
            duration: 1.2,
            ease: 'easeOut'
          }}
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            blur-3xl
          "
        />

        <div className="
          absolute
          inset-0
          bg-[#100b08]/55
        " />

        <div className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_55%)]
        " />

      </div>

      {/* =====================================================
          DESKTOP CINEMATIC FRAME
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.94
        }}
        animate={{
          opacity: 1,
          scale: 1
        }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="
          relative
          z-[2]
          h-full
          w-full
          sm:h-[96%]
          sm:w-[min(100%,520px)]
          sm:rounded-[32px]
          overflow-hidden
          bg-black
          shadow-[0_30px_100px_rgba(0,0,0,0.55)]
          ring-1
          ring-white/10
        "
      >

        {/* ===================================================
            TOP PROGRESS
        =================================================== */}

        <div className="
          absolute
          top-[env(safe-area-inset-top,0px)]
          sm:top-0
          inset-x-0
          z-40
          h-[3px]
          bg-white/10
        ">
          <div
            ref={progressBarRef}
            className="
              h-full
              w-0
              bg-gradient-to-r
              from-[#D97724]
              via-[#f5c17a]
              to-[#B24C2B]
              shadow-[0_0_12px_rgba(217,119,36,0.9)]
            "
          />
        </div>

        {/* ===================================================
            TOP HEADER (MODAL VIEWER)
        =================================================== */}

        {showCloseButton && (
          <motion.div
            initial={{
              opacity: 0,
              y: -15
            }}
            animate={{
              opacity: showControls ? 1 : 0,
              y: showControls ? 0 : -15
            }}
            transition={{
              duration: 0.3
            }}
            className="
              absolute
              top-0
              inset-x-0
              z-30
              px-4
              pt-[max(calc(env(safe-area-inset-top,0px)+14px),2.75rem)]
              sm:pt-5
              pb-14
              bg-gradient-to-b
              from-black/75
              via-black/25
              to-transparent
              pointer-events-none
            "
          >

            <div className="
              flex
              items-center
              justify-between
              gap-3
              pointer-events-auto
            ">

              {/* LEFT */}
              <div className="
                flex
                items-center
                gap-2
              ">

                {typeof reelIndex === 'number' &&
                  typeof totalReels === 'number' && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="
                        px-3
                        py-1.5
                        rounded-full
                        bg-black/45
                        backdrop-blur-xl
                        border
                        border-white/10
                        text-white
                        text-[10px]
                        font-bold
                      "
                    >
                      {String(reelIndex + 1).padStart(2, '0')}
                      <span className="mx-1 text-white/30">
                        /
                      </span>
                      {String(totalReels).padStart(2, '0')}
                    </motion.div>
                  )}

                <div className="
                  hidden
                  sm:flex
                  items-center
                  gap-2
                  px-3
                  py-1.5
                  rounded-full
                  bg-white/[0.07]
                  backdrop-blur-xl
                  border
                  border-white/10
                  text-white
                ">
                  <Sparkles className="
                    w-3.5
                    h-3.5
                    text-[#e4aa68]
                  " />

                  <span className="
                    text-[10px]
                    font-bold
                  ">
                    ريلز وه
                  </span>
                </div>

              </div>

              {/* RIGHT */}
              <div className="
                flex
                items-center
                gap-2
              ">

                {showCloseButton && onClose && (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.86 }}
                    onClick={onClose}
                    className="
                      w-10
                      h-10
                      rounded-full
                      flex
                      items-center
                      justify-center
                      bg-black/45
                      backdrop-blur-xl
                      border
                      border-white/10
                      text-white
                    "
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}

              </div>

            </div>

          </motion.div>
        )}

        {/* ===================================================
            VIDEO
        =================================================== */}

        <div
          className="
            relative
            w-full
            h-full
            overflow-hidden
            cursor-pointer
            bg-black
          "
          onClick={handleVideoAreaClick}
          onMouseMove={revealControls}
          onTouchStart={revealControls}
        >

          {/* Poster */}

          <AnimatePresence>
            {(!isPlaying || isVideoLoading) && (
              <motion.img
                key={`poster-${reel.id}`}
                src={safePosterUrl}
                alt=""
                initial={{
                  opacity: 1,
                  scale: 1.02
                }}
                animate={{
                  opacity: isPlaying ? 0 : 1,
                  scale: isPlaying ? 1 : 1.02
                }}
                exit={{
                  opacity: 0
                }}
                transition={{
                  duration: 0.45
                }}
                className="
                  absolute
                  inset-0
                  z-[5]
                  w-full
                  h-full
                  object-cover
                  pointer-events-none
                "
                loading="eager"
                decoding="async"
              />
            )}
          </AnimatePresence>

          {/* VIDEO */}

          <motion.video
            ref={videoRef}
            src={currentVideoSrc}
            poster={safePosterUrl}
            preload={isActive ? 'metadata' : 'none'}
            playsInline
            webkit-playsinline="true"
            loop
            muted={isMuted}
            onCanPlay={() => {
              setIsVideoLoading(false);
            }}
            onWaiting={() => {
              setIsVideoLoading(true);
            }}
            onPlaying={() => {
              setIsVideoLoading(false);
              setIsPlaying(true);
            }}
            onError={handleVideoError}
            onTimeUpdate={handleTimeUpdate}
            initial={{
              scale: 1.04,
              opacity: 0
            }}
            animate={{
              scale: isEntering ? 1.035 : 1,
              opacity: isPlaying ? 1 : 0.98
            }}
            transition={{
              scale: {
                duration: 1.1,
                ease: [0.22, 1, 0.36, 1]
              },
              opacity: {
                duration: 0.45
              }
            }}
            className="
              absolute
              inset-0
              w-full
              h-full
              object-cover
            "
          />

          {/* =================================================
              CINEMATIC LIGHT
          ================================================= */}

          <motion.div
            animate={{
              x: ['-120%', '120%']
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              repeatDelay: 4,
              ease: 'easeInOut'
            }}
            className="
              absolute
              top-0
              bottom-0
              left-0
              w-[35%]
              z-[7]
              pointer-events-none
              bg-gradient-to-r
              from-transparent
              via-white/[0.045]
              to-transparent
              skew-x-[-15deg]
            "
          />

          {/* =================================================
              LOADING
          ================================================= */}

          {isVideoLoading && !hasVideoError && (
            <div className="
              absolute
              inset-0
              z-20
              flex
              items-center
              justify-center
              pointer-events-none
            ">

              <motion.div
                animate={{
                  rotate: 360
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className="
                  w-12
                  h-12
                  rounded-full
                  border
                  border-white/10
                  border-t-[#e0a35e]
                  border-r-[#b24c2b]
                  bg-black/20
                  backdrop-blur-md
                "
              />

            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {hasVideoError && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              className="
                absolute
                inset-0
                z-30
                bg-black/85
                backdrop-blur-xl
                flex
                flex-col
                items-center
                justify-center
                p-6
                text-center
              "
            >

              <div className="
                w-16
                h-16
                rounded-[22px]
                flex
                items-center
                justify-center
                bg-[#B24C2B]/15
                border
                border-[#B24C2B]/30
                mb-4
              ">
                <AlertTriangle className="
                  w-7
                  h-7
                  text-[#e5a36b]
                " />
              </div>

              <p className="
                text-sm
                font-bold
                text-white
                mb-4
              ">
                تعذر تحميل الفيديو
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();

                  setHasVideoError(false);
                  setIsVideoLoading(true);

                  if (
                    reel.videoUrl &&
                    currentVideoSrc !== reel.videoUrl
                  ) {
                    setCurrentVideoSrc(
                      reel.videoUrl
                    );
                  }

                  if (videoRef.current) {
                    videoRef.current.load();

                    videoRef.current
                      .play()
                      .catch(() => { });
                  }
                }}
                className="
                  px-5
                  py-3
                  rounded-2xl
                  bg-[#B24C2B]
                  hover:bg-[#963d22]
                  text-white
                  text-xs
                  font-bold
                  flex
                  items-center
                  gap-2
                  shadow-xl
                "
              >
                <RotateCcw className="w-4 h-4" />
                إعادة التشغيل
              </button>

            </motion.div>
          )}

          {/* =================================================
              PLAY ICON
          ================================================= */}

          <AnimatePresence>
            {(!isPlaying ||
              showPlayIcon) &&
              !isVideoLoading &&
              !hasVideoError && (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.55
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1
                  }}
                  exit={{
                    opacity: 0,
                    scale: 1.35
                  }}
                  className="
                    absolute
                    inset-0
                    z-[18]
                    flex
                    items-center
                    justify-center
                    pointer-events-none
                  "
                >

                  <div className="
                    w-20
                    h-20
                    rounded-full
                    bg-black/45
                    backdrop-blur-xl
                    border
                    border-white/20
                    flex
                    items-center
                    justify-center
                    shadow-[0_10px_50px_rgba(0,0,0,0.45)]
                  ">
                    <Play className="
                      w-8
                      h-8
                      fill-white
                      text-white
                      ml-1
                    " />
                  </div>

                </motion.div>
              )}
          </AnimatePresence>

          {/* =================================================
              HEART BURST
          ================================================= */}

          <AnimatePresence>
            {showHeartBurst && (
              <>
                <motion.div
                  initial={{
                    scale: 0.15,
                    opacity: 0,
                    rotate: -15
                  }}
                  animate={{
                    scale: 1.15,
                    opacity: 1,
                    rotate: 0
                  }}
                  exit={{
                    scale: 1.8,
                    opacity: 0
                  }}
                  transition={{
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="
                    absolute
                    inset-0
                    z-30
                    flex
                    items-center
                    justify-center
                    pointer-events-none
                  "
                >
                  <Heart className="
                    w-28
                    h-28
                    text-rose-500
                    fill-rose-500
                    drop-shadow-[0_0_35px_rgba(244,63,94,0.9)]
                  " />
                </motion.div>

                {/* Decorative particles */}

                {[...Array(8)].map((_, index) => (
                  <motion.span
                    key={index}
                    initial={{
                      opacity: 1,
                      scale: 0,
                      x: 0,
                      y: 0
                    }}
                    animate={{
                      opacity: 0,
                      scale: 1,
                      x:
                        Math.cos(
                          (index / 8) *
                          Math.PI *
                          2
                        ) * 110,
                      y:
                        Math.sin(
                          (index / 8) *
                          Math.PI *
                          2
                        ) * 110
                    }}
                    transition={{
                      duration: 0.7
                    }}
                    className="
                      absolute
                      left-1/2
                      top-1/2
                      z-30
                      w-2
                      h-2
                      rounded-full
                      bg-[#e9b477]
                      pointer-events-none
                    "
                  />
                ))}

              </>
            )}
          </AnimatePresence>

          {/* =================================================
              BOTTOM GRADIENT
          ================================================= */}

          <div className="
            absolute
            bottom-0
            inset-x-0
            h-[48%]
            z-10
            pointer-events-none
            bg-gradient-to-t
            from-black/95
            via-black/55
            to-transparent
          " />

        </div>

        {/* ===================================================
            FLOATING SOUND TOGGLE BUTTON (UNDER TOP CORNER BUTTON)
        =================================================== */}

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: showControls ? 1 : 0.85,
            scale: 1
          }}
          transition={{ duration: 0.25 }}
          className="
            absolute
            top-[calc(max(calc(env(safe-area-inset-top,0px)+14px),2.75rem)+2.75rem)]
            sm:top-16
            left-3.5
            sm:left-6
            z-35
            pointer-events-auto
          "
        >
          <motion.button
            type="button"
            whileTap={{ scale: 0.84 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            className={`
              w-10
              h-10
              rounded-full
              flex
              items-center
              justify-center
              backdrop-blur-xl
              border
              shadow-xl
              transition-all
              cursor-pointer
              ${isMuted
                ? 'bg-black/75 hover:bg-black/90 border-amber-400/50 text-amber-300 shadow-amber-900/30 ring-1 ring-amber-400/30'
                : 'bg-black/55 hover:bg-black/80 border-white/20 text-white shadow-black/40'
              }
            `}
            title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
            aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-amber-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </motion.button>
        </motion.div>

        {/* ===================================================
            BOTTOM CONTENT
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25
          }}
          animate={{
            opacity: showControls ? 1 : 0,
            y: showControls ? 0 : 25
          }}
          transition={{
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1]
          }}
          className={`
            absolute
            bottom-0
            inset-x-0
            z-20
            px-4
            sm:px-5
            flex
            items-end
            justify-between
            gap-3
            pointer-events-none
            ${hasBottomNav
              ? 'pb-[calc(env(safe-area-inset-bottom,0px)+130px)] sm:pb-5'
              : 'pb-[calc(env(safe-area-inset-bottom,0px)+35px)] sm:pb-5'
            }
          `}
          dir="rtl"
        >

          {/* INFO */}

          <div className="
            flex-1
            min-w-0
            pointer-events-auto
            max-w-[76%]
            mb-2 sm:mb-0
          ">
            <ReelInfoSection
              reel={reel}
              onSelectSeller={onSelectSeller}
              onSelectProduct={onSelectProduct}
              onCloseParent={onClose}
            />
          </div>

          {/* ACTIONS */}

          <motion.div
            initial={{
              opacity: 0,
              x: 18
            }}
            animate={{
              opacity: showControls ? 1 : 0,
              x: showControls ? 0 : 18
            }}
            transition={{
              duration: 0.35
            }}
            className="
              pointer-events-auto
              flex
              flex-col
              items-center
              gap-2
              mb-1
            "
          >
            <ReelActionButtons
              reel={reel}
              isLiked={isLiked}
              likesCount={likesCount}
              isMuted={isMuted}
              copiedLink={copiedLink}
              canDelete={canDelete}
              onLike={handleLike}
              onOpenComments={() =>
                setIsCommentsOpen(true)
              }
              onShare={handleShare}
              onToggleMute={onToggleMute}
              onRequestDelete={() =>
                setIsConfirmingDelete(true)
              }
            />
          </motion.div>

        </motion.div>

        {/* ===================================================
            SIDE SWIPE HINT
        =================================================== */}

        {isActive &&
          typeof totalReels === 'number' &&
          totalReels > 1 && (
            <motion.div
              initial={{
                opacity: 0,
                y: 8
              }}
              animate={{
                opacity: [0, 0.65, 0],
                y: [8, 0, -5]
              }}
              transition={{
                duration: 2.8,
                delay: 1.4
              }}
              className="
                absolute
                bottom-24
                left-1/2
                -translate-x-1/2
                z-20
                pointer-events-none
                flex
                flex-col
                items-center
                gap-1
                text-white/50
              "
            >
              <ChevronUp className="w-4 h-4" />

              <span className="
                text-[8px]
                font-bold
                tracking-wide
              ">
                اسحب للحكاية اللي بعدها
              </span>
            </motion.div>
          )}

      </motion.div>

      {/* =====================================================
          COMMENTS
      ===================================================== */}

      <ReelCommentsDrawer
        reel={reel}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        onCommentAdded={(newComm) => {
          if (!reel.comments) {
            reel.comments = [];
          }

          reel.comments.unshift(newComm);
        }}
      />

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      <AnimatePresence>
        {isConfirmingDelete && (
          <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
            className="
              absolute
              inset-0
              z-[100]
              bg-black/80
              backdrop-blur-xl
              flex
              items-center
              justify-center
              p-4
              text-right
            "
            dir="rtl"
          >

            <motion.div
              initial={{
                scale: 0.85,
                opacity: 0,
                y: 20
              }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0
              }}
              exit={{
                scale: 0.9,
                opacity: 0
              }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 22
              }}
              className="
                bg-[#1c1511]/95
                backdrop-blur-2xl
                border
                border-white/10
                rounded-[30px]
                p-6
                max-w-sm
                w-full
                shadow-[0_30px_100px_rgba(0,0,0,0.65)]
                text-white
              "
            >

              <div className="
                w-14
                h-14
                rounded-2xl
                bg-rose-500/10
                border
                border-rose-500/20
                flex
                items-center
                justify-center
                text-rose-400
                mx-auto
                mb-5
              ">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="
                text-center
                space-y-2
              ">

                <h3 className="
                  font-bold
                  text-base
                ">
                  {currentUser?.role === 'admin'
                    ? 'حذف الفيديو'
                    : 'حذف مقطع الفيديو'}
                </h3>

                <p className="
                  text-xs
                  text-white/55
                  leading-6
                ">
                  هل أنت متأكد من حذف مقطع
                  "{reel.title}"
                  نهائيًا من المنصة؟
                </p>

              </div>

              <div className="
                flex
                items-center
                gap-2.5
                pt-5
              ">

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteReel}
                  className="
                    flex-1
                    py-3
                    rounded-2xl
                    bg-rose-600
                    hover:bg-rose-700
                    disabled:opacity-50
                    text-white
                    text-xs
                    font-bold
                    flex
                    items-center
                    justify-center
                    gap-2
                    shadow-lg
                    active:scale-95
                    transition-all
                  "
                >
                  <Trash2 className="w-4 h-4" />

                  <span>
                    {isDeleting
                      ? 'جارِ الحذف...'
                      : 'نعم، احذف'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() =>
                    setIsConfirmingDelete(false)
                  }
                  className="
                    px-5
                    py-3
                    rounded-2xl
                    bg-white/[0.07]
                    hover:bg-white/[0.12]
                    border
                    border-white/10
                    text-white/70
                    text-xs
                    font-bold
                    active:scale-95
                    transition-all
                  "
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