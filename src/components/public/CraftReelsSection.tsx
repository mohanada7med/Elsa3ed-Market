
import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';

import { useApp } from '../../context/AppContext';
import { CraftReel } from '../../types';
import { craftReelsService } from '../../services/craftReelsService';
import { CraftReelsModal } from './CraftReelsModal';

import {
  Play,
  Pause,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Flame,
  MapPin,
  Volume2,
  VolumeX,
  Maximize2,
  Compass
} from 'lucide-react';

import { motion, AnimatePresence, PanInfo } from 'framer-motion';

import {
  getOptimizedVideoPoster,
  getOptimizedVideoUrl
} from '../../utils/cloudinaryMedia';

export const CraftReelsSection: React.FC = () => {
  const {
    setActivePage,
    addToCart,
    addToast
  } = useApp();

  const [reels, setReels] = useState<CraftReel[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedReelId, setSelectedReelId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [showPlaybackFeedback, setShowPlaybackFeedback] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackRequestRef = useRef(0);
  const soundPreferenceRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  /* ================= VIEWPORT VISIBILITY ================= */

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        rootMargin: '250px 0px',
        threshold: 0
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  /* ================= MOBILE DETECTION ================= */

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* ================= LOAD REELS ================= */

  useEffect(() => {
    try {
      const data = craftReelsService.getReels();
      if (Array.isArray(data) && data.length > 0) {
        setReels(data);
      }
      craftReelsService
        .fetchReelsFromDb()
        .then((fresh) => {
          if (Array.isArray(fresh) && fresh.length > 0) {
            setReels(fresh);
          }
        })
        .catch(() => { });
    } catch (error) {
      console.error('Failed to load craft reels:', error);
    }
  }, []);

  /* ================= MEDIA GETTERS ================= */

  const getVideo = useCallback((reel: CraftReel) => {
    const raw =
      reel.videoUrl ||
      'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-potter-shaping-a-clay-vase-41717-large.mp4';
    return (
      getOptimizedVideoUrl(raw, {
        maxDimension: 720,
        qualityMode: 'eco',
        forceMp4: true
      }) || raw
    );
  }, []);

  const getPoster = useCallback(
    (reel: CraftReel, width = 700) => {
      return getOptimizedVideoPoster(
        reel.videoUrl,
        reel.posterUrl || reel.productImage,
        width
      );
    },
    []
  );

  /* ================= PRELOAD NEXT VIDEO ================= */

  useEffect(() => {
    if (!reels.length) return;
    const nextIndex = (activeIndex + 1) % reels.length;
    const nextReel = reels[nextIndex];
    if (nextReel) {
      const url = getVideo(nextReel);
      if (url) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'video';
        link.href = url;
        document.head.appendChild(link);
        return () => {
          try {
            document.head.removeChild(link);
          } catch (_) { }
        };
      }
    }
  }, [activeIndex, reels, getVideo]);

  /* ================= UNMUTE ON FIRST USER GESTURE ================= */

  useEffect(() => {
    const unlockSound = () => {
      soundPreferenceRef.current = false;
      const video = videoRef.current;
      if (video && video.muted) {
        video.muted = false;
        setIsMuted(false);
        video.play().catch(() => { });
      }
    };

    const events = ['pointerdown', 'touchstart', 'click', 'keydown', 'wheel'];
    events.forEach((ev) =>
      window.addEventListener(ev, unlockSound, { once: true, passive: true })
    );

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, unlockSound));
    };
  }, []);

  /* ================= PLAYBACK FEEDBACK ================= */

  const showPlaybackIndicator = useCallback(() => {
    setShowPlaybackFeedback(true);

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    feedbackTimeoutRef.current = setTimeout(() => {
      setShowPlaybackFeedback(false);
      feedbackTimeoutRef.current = null;
    }, 650);
  }, []);

  /* ================= NAVIGATION ================= */

  const goTo = useCallback(
    (idx: number) => {
      if (!reels.length) return;

      const nextIndex = ((idx % reels.length) + reels.length) % reels.length;
      if (nextIndex === activeIndex) return;

      playbackRequestRef.current++;
      // تفاعل من المستخدم: تفعيل الصوت على الفور
      soundPreferenceRef.current = false;
      setIsMuted(false);
      setVideoLoaded(false);
      setIsPaused(false);
      setShowPlaybackFeedback(false);
      setActiveIndex(nextIndex);
    },
    [reels.length, activeIndex]
  );

  const goNext = useCallback(() => {
    if (!reels.length) return;

    const nextIndex = (activeIndex + 1) % reels.length;

    playbackRequestRef.current++;
    soundPreferenceRef.current = false;
    setIsMuted(false);
    setVideoLoaded(false);
    setIsPaused(false);
    setShowPlaybackFeedback(false);
    setActiveIndex(nextIndex);
  }, [activeIndex, reels.length]);

  const goPrev = useCallback(() => {
    if (!reels.length) return;

    const prevIndex = (activeIndex - 1 + reels.length) % reels.length;

    playbackRequestRef.current++;
    soundPreferenceRef.current = false;
    setIsMuted(false);
    setVideoLoaded(false);
    setIsPaused(false);
    setShowPlaybackFeedback(false);
    setActiveIndex(prevIndex);
  }, [activeIndex, reels.length]);

  const currentReel = reels[activeIndex];

  /* ================= AUTOMATIC VIDEO PLAYBACK WITH SOUND ================= */

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentReel) return;

    let isCancelled = false;
    const requestId = ++playbackRequestRef.current;

    const isCurrentRequest = () =>
      !isCancelled &&
      requestId === playbackRequestRef.current &&
      videoRef.current === video;

    const executePlay = async () => {
      if (!isCurrentRequest()) return;

      if (!isInView || isModalOpen || selectedReelId) {
        video.pause();
        return;
      }

      video.playsInline = true;
      video.defaultMuted = false;

      // 1. نبدأ بالصوت شغال مباشرة كما طلب المستخدم
      const wantMuted = soundPreferenceRef.current;
      video.muted = wantMuted;

      try {
        const p = video.play();
        if (p !== undefined) {
          await p;
        }

        if (isCurrentRequest()) {
          setIsMuted(video.muted);
          setIsPaused(false);
          setVideoLoaded(true);
        }
      } catch (err: any) {
        if (!isCurrentRequest()) return;

        // لو المتصفح حظر الصوت تلقائياً لعدم وجود تفاعل مسبق، نشغل بدون صوت كـ fallback فوري
        video.muted = true;
        try {
          const retryP = video.play();
          if (retryP !== undefined) {
            await retryP;
          }
          if (isCurrentRequest()) {
            setIsMuted(true);
            setIsPaused(false);
            setVideoLoaded(true);
          }
        } catch {
          if (isCurrentRequest()) {
            setIsPaused(true);
          }
        }
      }
    };

    if (!isInView || isModalOpen || selectedReelId) {
      video.pause();
    } else {
      if (video.readyState >= 2) {
        void executePlay();
      } else {
        const onReady = () => {
          if (isCurrentRequest()) {
            void executePlay();
          }
        };
        video.addEventListener('canplay', onReady, { once: true });
        video.addEventListener('loadeddata', onReady, { once: true });
        video.load();
        void executePlay();

        return () => {
          isCancelled = true;
          video.removeEventListener('canplay', onReady);
          video.removeEventListener('loadeddata', onReady);
        };
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [
    isInView,
    activeIndex,
    currentReel?.id,
    isModalOpen,
    selectedReelId
  ]);

  /* ================= CLEANUP ================= */

  useEffect(() => {
    return () => {
      playbackRequestRef.current++;

      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }

      const video = videoRef.current;

      if (video) {
        try {
          video.pause();
          video.removeAttribute('src');
          video.load();
        } catch {
          // The component is already unmounting.
        }
      }
    };
  }, []);

  /* ================= PLAY / PAUSE ================= */

  const togglePlayback = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation();

      const video = videoRef.current;

      if (!video || !isInView || isModalOpen || selectedReelId) {
        return;
      }

      if (video.paused) {
        try {
          video.muted = soundPreferenceRef.current;
          await video.play();
          setIsMuted(video.muted);
          setIsPaused(false);
        } catch {
          setIsPaused(true);
        }
      } else {
        video.pause();
        setIsPaused(true);
      }

      showPlaybackIndicator();
    },
    [
      isInView,
      isModalOpen,
      selectedReelId,
      showPlaybackIndicator
    ]
  );

  /* ================= SOUND ================= */

  const toggleSound = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      const video = videoRef.current;
      if (!video) return;

      if (video.muted) {
        // تفاعل مباشر من المستخدم لتفعيل الصوت.
        video.muted = false;
        video.defaultMuted = false;
        video.volume = 1;
        soundPreferenceRef.current = false;
        setIsMuted(false);

        if (video.paused && isInView && !isModalOpen && !selectedReelId) {
          try {
            await video.play();
            setIsPaused(false);
          } catch {
            setIsPaused(true);
          }
        }
      } else {
        video.muted = true;
        soundPreferenceRef.current = true;
        setIsMuted(true);
      }
    },
    [isInView, isModalOpen, selectedReelId]
  );

  /* ================= SWIPE NAVIGATION ================= */

  /* ================= TOUCH SWIPE NAVIGATION ================= */

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        // سحب لليسار (التالي)
        goNext();
      } else {
        // سحب لليمين (السابق)
        goPrev();
      }
    }
  };

  /* ================= QUICK ADD TO CART ================= */

  const handleQuickAdd = (e: React.MouseEvent, reel: CraftReel) => {
    e.stopPropagation();

    if (!reel.productId || !reel.productPrice) return;

    addToCart(
      {
        id: reel.productId,
        title: reel.productTitle || reel.title,
        price: reel.productPrice,
        originalPrice: reel.productOriginalPrice || reel.productPrice,
        images: reel.productImage ? [reel.productImage] : [],
        rating: reel.productRating || 5,
        reviewCount: 12,
        inStock: reel.inStock ?? true,
        stockCount: 10,
        categoryId: 'crafts',
        categoryName: reel.craftType || 'تراثي',
        sellerId: reel.sellerId || '',
        sellerName: reel.workshopName || 'صانع أصيل',
        sellerGovernorate: reel.governorate,
        description: reel.description || '',
        specifications: {
          material: reel.craftType || 'يدوي',
          originGovernorate: reel.governorate,
          craftsmanship: 'صناعة يدوية فاخرة'
        },
        tags: reel.hashtags || [],
        isHandmade: true,
        isHeritage: true,
        createdAt: reel.createdAt,
        approvalStatus: 'approved'
      },
      1
    );

    addToast(
      'تمت الإضافة',
      `أُضيف "${reel.productTitle || reel.title}" للحقيبة`,
      'success'
    );
  };

  /* ================= MODAL ================= */

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedReelId(null);
  }, []);

  const openReelModal = useCallback((reelId: string) => {
    setSelectedReelId(reelId);
    setIsModalOpen(true);
  }, []);

  /* ================= RESPONSIVE STACK & SMOOTH 3D COVERFLOW ================= */

  const getPositionOffset = (index: number) => {
    const total = reels.length;
    if (total <= 1) return 0;

    let diff = index - activeIndex;

    while (diff > total / 2) diff -= total;
    while (diff < -total / 2) diff += total;

    return diff;
  };

  const getCardStyle = (diff: number) => {
    const isSmall = isMobile;
    const isVisibleFar = !isSmall && reels.length > 5;
    const spacing = isSmall ? 210 : 330;
    const farSpacing = isSmall ? 340 : 540;

    switch (diff) {
      case 0:
        return {
          x: '-50%',
          y: 0,
          scale: 1,
          rotateY: 0,
          opacity: 1,
          zIndex: 40,
          pointerEvents: 'auto' as const
        };

      case -1:
        return {
          x: `calc(-50% - ${spacing}px)`,
          y: isSmall ? 6 : 14,
          scale: isSmall ? 0.88 : 0.86,
          rotateY: isSmall ? 8 : 16,
          opacity: isSmall ? 0.45 : 0.75,
          zIndex: 25,
          pointerEvents: 'auto' as const
        };

      case 1:
        return {
          x: `calc(-50% + ${spacing}px)`,
          y: isSmall ? 6 : 14,
          scale: isSmall ? 0.88 : 0.86,
          rotateY: isSmall ? -8 : -16,
          opacity: isSmall ? 0.45 : 0.75,
          zIndex: 25,
          pointerEvents: 'auto' as const
        };

      case -2:
        return {
          x: `calc(-50% - ${farSpacing}px)`,
          y: 28,
          scale: 0.72,
          rotateY: 24,
          opacity: isVisibleFar ? 0.35 : 0,
          zIndex: 10,
          pointerEvents: isVisibleFar ? ('auto' as const) : ('none' as const)
        };

      case 2:
        return {
          x: `calc(-50% + ${farSpacing}px)`,
          y: 28,
          scale: 0.72,
          rotateY: -24,
          opacity: isVisibleFar ? 0.35 : 0,
          zIndex: 10,
          pointerEvents: isVisibleFar ? ('auto' as const) : ('none' as const)
        };

      default:
        return {
          x: diff < 0 ? `calc(-50% - ${farSpacing + 180}px)` : `calc(-50% + ${farSpacing + 180}px)`,
          y: 40,
          scale: 0.6,
          rotateY: diff < 0 ? 30 : -30,
          opacity: 0,
          zIndex: 0,
          pointerEvents: 'none' as const
        };
    }
  };

  if (!reels.length) return null;

  return (
    <section
      ref={sectionRef}
      dir="rtl"
      className="
        relative overflow-hidden py-10 sm:py-20
        bg-[#0c0a09] text-stone-100
        select-none touch-pan-y
      "
    >
      {/* BACKGROUND */}

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="
            absolute top-1/4 left-1/2 -translate-x-1/2
            w-[350px] sm:w-[700px]
            h-[300px] sm:h-[400px]
            bg-primary/10 rounded-full
            blur-[110px] sm:blur-[160px]
          "
        />

        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-screen"
          style={{
            backgroundImage: "url('/pattern/pat2.png')",
            backgroundRepeat: 'repeat',
            backgroundSize: '520px auto',
            backgroundPosition: 'center',
            maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 80%)'
          }}
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="relative z-10 mb-10 sm:mb-16 text-foreground select-none">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
            <div>
              <div className="
                mb-6 flex items-center gap-3
                text-[10px] font-black tracking-[0.28em]
                text-primary dark:text-primary-hover
              ">
                <span className="
                  flex h-8 w-8 items-center justify-center
                  rounded-full bg-accent/10
                ">
                  <Compass size={14} className="animate-spin-slow text-accent" />
                </span>
                DISCOVER / حكايات ووثائقيات «وه»
              </div>

              <h2 className="
                max-w-6xl text-5xl sm:text-7xl lg:text-[8rem]
                font-black leading-[0.95] tracking-tight
                text-espresso dark:text-cream
              ">
                ريلز
                <br />
                <span className="
                  ps-22 mr-3 sm:mr-8 lg:mr-20
                  text-primary dark:text-primary-hover
                ">
                  وه
                </span>
              </h2>

              <div className="
                mt-8 grid max-w-3xl gap-6
                sm:grid-cols-[80px_1fr] items-start
              ">
                <div className="hidden sm:block">
                  <div className="
                    text-[10px] font-black tracking-[0.2em]
                    text-foreground-disabled
                  ">
                    ريلز وه
                  </div>
                  <div className="mt-3 h-px w-10 bg-accent" />
                </div>

                <div className="
                  text-sm sm:text-base leading-relaxed
                  text-black/60 dark:text-white/60
                ">
                  حكايات وثائقية قصيرة بتسجل روح الورش الصعيدية،
                  أصالة كل لمسة يد، وسر كل قطعة من مكان صناعتها الأصلي.
                </div>
              </div>
            </div>

            <div className="
              flex flex-row lg:flex-col items-center
              lg:items-end justify-between gap-4
            ">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="السابق"
                  onClick={goPrev}
                  className="
                    w-11 h-11 rounded-full
                    bg-black/5 dark:bg-white/5
                    border border-black/10 dark:border-white/10
                    text-foreground hover:bg-primary hover:text-white
                    hover:border-primary transition-all
                    active:scale-95 flex items-center justify-center
                    cursor-pointer
                  "
                >
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  aria-label="التالي"
                  onClick={goNext}
                  className="
                    w-11 h-11 rounded-full
                    bg-black/5 dark:bg-white/5
                    border border-black/10 dark:border-white/10
                    text-foreground hover:bg-primary hover:text-white
                    hover:border-primary transition-all
                    active:scale-95 flex items-center justify-center
                    cursor-pointer
                  "
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActivePage('reels')}
                className="
                  group inline-flex items-center gap-2
                  text-xs font-black
                  text-primary dark:text-primary-hover
                  transition-colors
                "
              >
                <span>كل الحكايات المصورة</span>
                <ArrowLeft className="
                  w-4 h-4 group-hover:-translate-x-1
                  transition-transform
                " />
              </button>
            </div>
          </div>
        </div>

        {/* 3D REELS STAGE */}

        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="
            relative h-[480px] xs:h-[520px] sm:h-[620px]
            w-full flex items-center justify-center
            overflow-hidden sm:overflow-visible
          "
          style={{ perspective: isMobile ? '1000px' : '1600px' }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {reels.map((reel, index) => {
              const diff = getPositionOffset(index);
              const isCurrent = diff === 0;
              const cardAnim = getCardStyle(diff);

              return (
                <motion.div
                  key={reel.id}
                  initial={false}
                  animate={cardAnim}
                  transition={{
                    type: 'spring',
                    stiffness: 220,
                    damping: 26,
                    mass: 0.75
                  }}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    transformStyle: 'preserve-3d',
                    touchAction: 'pan-y'
                  }}
                  className={`
                    w-[270px] xs:w-[290px] sm:w-[340px] md:w-[350px]
                    h-[460px] xs:h-[500px] sm:h-[560px] md:h-[580px]
                    rounded-[26px] sm:rounded-[32px]
                    overflow-hidden select-none
                    border border-white/10 shadow-2xl
                    transition-[border-color,box-shadow] duration-300
                    ${isCurrent
                      ? 'border-white/25 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.15)]'
                      : 'cursor-pointer hover:border-white/20'
                    }
                  `}
                  onClick={() => {
                    if (!isCurrent) goTo(index);
                  }}
                >
                  <div className="relative w-full h-full bg-stone-900 overflow-hidden">

                    {isCurrent ? (
                      <div className="relative w-full h-full bg-black">

                        <img
                          src={getPoster(reel, 800)}
                          alt={reel.title}
                          draggable={false}
                          className="
                            absolute inset-0 w-full h-full
                            object-cover pointer-events-none
                          "
                        />

                        <video
                          ref={videoRef}
                          key={reel.id}
                          src={getVideo(reel)}
                          poster={getPoster(reel, 800)}
                          muted={isMuted}
                          autoPlay
                          playsInline
                          preload="auto"
                          disablePictureInPicture
                          onLoadedData={(e) => {
                            setVideoLoaded(true);
                            const v = e.currentTarget;
                            if (v.paused && !isModalOpen && !selectedReelId) {
                              v.play().catch(() => {
                                v.muted = true;
                                v.play().catch(() => { });
                              });
                            }
                          }}
                          onCanPlay={(e) => {
                            setVideoLoaded(true);
                            const v = e.currentTarget;
                            if (v.paused && !isModalOpen && !selectedReelId) {
                              v.play().catch(() => {
                                v.muted = true;
                                v.play().catch(() => { });
                              });
                            }
                          }}
                          onPlaying={() => {
                            setVideoLoaded(true);
                            setIsPaused(false);
                          }}
                          onPlay={() => setIsPaused(false)}
                          onPause={() => setIsPaused(true)}
                          onClick={togglePlayback}
                          onEnded={goNext}
                          onError={() => setVideoLoaded(false)}
                          className="
                            absolute inset-0 w-full h-full
                            object-cover cursor-pointer
                          "
                        />

                        <AnimatePresence>
                          {showPlaybackFeedback && (
                            <motion.div
                              key="playback-feedback"
                              initial={{ opacity: 0, scale: 0.72, y: 4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 1.12, y: -3 }}
                              transition={{
                                duration: 0.22,
                                ease: [0.22, 1, 0.36, 1]
                              }}
                              className="
                                pointer-events-none absolute inset-0
                                z-20 flex items-center justify-center
                              "
                              aria-hidden="true"
                            >
                              <div className="
                                flex h-[76px] w-[76px]
                                items-center justify-center
                                rounded-full border border-white/20
                                bg-black/45 text-white
                                shadow-[0_8px_32px_rgba(0,0,0,0.3)]
                                backdrop-blur-xl
                                sm:h-[88px] sm:w-[88px]
                              ">
                                {isPaused ? (
                                  <Play className="ml-1 h-9 w-9 fill-white sm:h-10 sm:w-10" />
                                ) : (
                                  <Pause className="h-9 w-9 fill-white sm:h-10 sm:w-10" />
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* TOP CONTROLS */}

                        <div className="
                          absolute top-5 inset-x-3 sm:inset-x-4
                          z-30 flex items-center justify-between
                          pointer-events-none
                        ">
                          <div className="
                            flex items-center gap-1
                            px-2.5 py-1 rounded-full
                            bg-black/50 backdrop-blur-xl
                            border border-white/10 text-stone-200
                            text-[10px] font-bold max-w-[150px]
                          ">
                            <MapPin className="w-3 h-3 shrink-0 text-amber-400" />
                            <span className="truncate">
                              {reel.location || reel.governorate || 'الصعيد'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 pointer-events-auto">
                            <button
                              type="button"
                              aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
                              onClick={toggleSound}
                              className={`
                                h-9 w-9 sm:h-10 sm:w-10
                                flex items-center justify-center
                                rounded-full border transition-all duration-200
                                active:scale-90
                                ${isMuted
                                  ? 'bg-black/55 border-white/15 text-white hover:bg-black/75'
                                  : 'bg-amber-400 border-amber-300 text-stone-950 shadow-lg shadow-amber-900/20'
                                }
                              `}
                              title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
                            >
                              {isMuted ? (
                                <VolumeX className="w-4 h-4" />
                              ) : (
                                <Volume2 className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              aria-label="عرض الريل"
                              onClick={(e) => {
                                e.stopPropagation();
                                openReelModal(reel.id);
                              }}
                              className="
                                w-9 h-9 sm:w-10 sm:h-10
                                rounded-full bg-black/50
                                backdrop-blur-xl border border-white/10
                                text-white flex items-center justify-center
                                hover:bg-black/70 transition active:scale-90
                              "
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* BOTTOM INFORMATION */}

                        <div
                          className="
                            absolute bottom-0 inset-x-0 z-30
                            p-3.5 sm:p-5
                            bg-gradient-to-t from-black via-black/85 to-transparent
                          "
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="
                            flex items-center justify-between
                            text-[10px] sm:text-[11px]
                            font-bold text-amber-400 mb-1
                          ">
                            <span>{reel.craftType || 'حرفة تراثية'}</span>
                            <span className="flex items-center gap-1 text-stone-300">
                              <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                              {reel.likesCount || 0}
                            </span>
                          </div>

                          <h3
                            onClick={() => openReelModal(reel.id)}
                            className="
                              text-white text-sm sm:text-base
                              font-black leading-snug line-clamp-2
                              hover:text-amber-300 transition cursor-pointer
                            "
                          >
                            {reel.title}
                          </h3>

                          {(reel.artisanName || reel.workshopName) && (
                            <p className="mt-0.5 text-[10px] sm:text-xs text-stone-400 truncate">
                              صُنعت بأنامل: {reel.artisanName || reel.workshopName}
                            </p>
                          )}

                          {reel.productId && reel.productPrice && (
                            <div className="
                              mt-2.5 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl
                              bg-white/[0.08] backdrop-blur-xl
                              border border-white/10
                              flex items-center justify-between gap-2
                            ">
                              <div className="min-w-0 pr-1">
                                <span className="block text-[9px] sm:text-[10px] text-stone-300 truncate">
                                  {reel.productTitle || 'القطعة المعروضة'}
                                </span>
                                <span className="block text-[11px] sm:text-xs font-black text-amber-400">
                                  {reel.productPrice} ج.م
                                </span>
                              </div>

                              <button
                                type="button"
                                aria-label="إضافة المنتج للحقيبة"
                                onClick={(e) => handleQuickAdd(e, reel)}
                                className="
                                  w-8 h-8 sm:w-9 sm:h-9
                                  rounded-lg sm:rounded-xl
                                  bg-amber-500 hover:bg-amber-400
                                  text-stone-950 font-bold
                                  flex items-center justify-center
                                  transition active:scale-90 shadow shrink-0
                                "
                              >
                                <ShoppingBag className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* SIDE PREVIEW CARDS */

                      <div className="relative w-full h-full bg-stone-950">
                        <img
                          src={getPoster(reel, 500)}
                          alt={reel.title}
                          draggable={false}
                          className="absolute inset-0 w-full h-full object-cover"
                        />

                        <div className="absolute inset-0 bg-black/60" />

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="
                            w-11 h-11 rounded-full
                            bg-black/40 backdrop-blur-md
                            border border-white/15 text-white/80
                            flex items-center justify-center
                          ">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>

                        <div className="
                          absolute bottom-0 inset-x-0 p-4
                          bg-gradient-to-t from-black/90 to-transparent
                        ">
                          <p className="text-amber-400 text-[10px] font-bold mb-1">
                            {reel.craftType || 'حرفة تراثية'}
                          </p>
                          <h3 className="text-white text-sm font-black line-clamp-2">
                            {reel.title}
                          </h3>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM NAVIGATION */}

        <div className="
          mt-5 sm:mt-8 flex flex-col sm:flex-row
          items-center justify-between gap-4
          border-t border-stone-900 pt-4 sm:pt-6
        ">
          <div className="flex items-center justify-between w-full sm:w-auto px-2 sm:px-0">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black text-amber-400">
                {String(activeIndex + 1).padStart(2, '0')}
              </span>
              <span className="text-xs text-stone-600">/</span>
              <span className="text-xs font-semibold text-stone-500">
                {String(reels.length).padStart(2, '0')} حكاية
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActivePage('reels')}
              className="sm:hidden text-xs font-bold text-amber-400"
            >
              عرض الكل ←
            </button>
          </div>

          {/* REEL THUMBNAILS */}

          <div className="
            flex items-center gap-2 overflow-x-auto
            w-full sm:w-auto py-1 scrollbar-none
          ">
            {reels.map((reel, i) => (
              <button
                key={reel.id}
                type="button"
                aria-label={`عرض الحكاية ${i + 1}: ${reel.title}`}
                aria-current={i === activeIndex ? 'true' : undefined}
                onClick={() => goTo(i)}
                className={`
                  relative shrink-0 h-9 w-12 sm:h-10 sm:w-14
                  rounded-lg sm:rounded-xl overflow-hidden
                  border transition-all duration-200
                  ${i === activeIndex
                    ? 'border-amber-400 ring-2 ring-amber-400/30 scale-105 opacity-100'
                    : 'border-white/10 opacity-45 hover:opacity-80'
                  }
                `}
              >
                <img
                  src={getPoster(reel, 150)}
                  alt={reel.title}
                  loading="lazy"
                  draggable={false}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          <div className="hidden lg:block text-[11px] text-stone-500 font-medium">
            اسحب يمينًا أو يسارًا للتنقل بين الحكايات
          </div>
        </div>
      </div>

      {/* REEL MODAL */}

      {selectedReelId && (
        <CraftReelsModal
          reels={reels}
          initialReelId={selectedReelId}
          hasBottomNav={true}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onDeleteReel={(deletedId) => {
            setReels((prev) => {
              const next = prev.filter((reel) => reel.id !== deletedId);

              setActiveIndex((current) => {
                if (!next.length) return 0;
                if (current >= next.length) return next.length - 1;
                return current;
              });

              return next;
            });

            setSelectedReelId(null);
            setIsModalOpen(false);
          }}
        />
      )}
    </section>
  );
};

export default CraftReelsSection;
