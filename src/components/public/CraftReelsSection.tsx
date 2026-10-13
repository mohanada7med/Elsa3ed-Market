import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
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
  Compass,
  Heart,
  Check,
  Sparkles,
  Share2,
  BadgeCheck,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getOptimizedVideoPoster,
  getOptimizedVideoUrl
} from '../../utils/cloudinaryMedia';

export const CraftReelsSection: React.FC = () => {
  const {
    setActivePage,
    addToCart,
    addToast,
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen
  } = useApp();

  const [reels, setReels] = useState<CraftReel[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedReelId, setSelectedReelId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Playback & Audio
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Responsiveness & In-view
  const [isMobile, setIsMobile] = useState(false);
  const [isInView, setIsInView] = useState(true);

  // Animations & User Interaction
  const [showPlaybackFeedback, setShowPlaybackFeedback] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [addedProductIds, setAddedProductIds] = useState<Set<string>>(new Set());

  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackRequestRef = useRef(0);
  const lastTapRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  /* ================= VIEWPORT OBSERVER ================= */

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        rootMargin: '120px 0px 120px 0px',
        threshold: 0.05
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  /* ================= RESPONSIVE CHECK ================= */

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* ================= DATA LOADING ================= */

  useEffect(() => {
    try {
      const cached = craftReelsService.getReels();
      if (Array.isArray(cached) && cached.length > 0) {
        setReels(cached);
      }
      craftReelsService
        .fetchReelsFromDb()
        .then((fresh) => {
          if (Array.isArray(fresh) && fresh.length > 0) {
            setReels(fresh);
          }
        })
        .catch(() => {});
    } catch (err) {
      console.warn('Failed to load reels:', err);
    }
  }, []);

  /* ================= CATEGORIES FILTER ================= */

  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    reels.forEach((r) => {
      const craft = r.craftType || (r as any).contentType;
      if (craft && typeof craft === 'string' && craft.trim().length > 0) {
        categoriesSet.add(craft.trim());
      }
    });
    return Array.from(categoriesSet);
  }, [reels]);

  const filteredReels = useMemo(() => {
    if (activeCategory === 'all') return reels;
    return reels.filter(
      (r) =>
        (r.craftType && r.craftType.trim() === activeCategory) ||
        ((r as any).contentType && (r as any).contentType.trim() === activeCategory)
    );
  }, [reels, activeCategory]);

  const currentReel: CraftReel | undefined = filteredReels[activeIndex] || reels[0];

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

  const getPoster = useCallback((reel: CraftReel, width = 800) => {
    return getOptimizedVideoPoster(
      reel.videoUrl,
      reel.posterUrl || reel.productImage,
      width
    );
  }, []);

  /* ================= VIDEO PROGRESS & TIME TRACKER ================= */

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (v) {
      setCurrentTime(v.currentTime);
      if (v.duration && !isNaN(v.duration)) {
        setDuration(v.duration);
      }
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  /* ================= PLAYBACK CONTROLLER ================= */

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentReel) return;

    let isCancelled = false;
    const requestId = ++playbackRequestRef.current;

    const isCurrent = () =>
      !isCancelled &&
      requestId === playbackRequestRef.current &&
      videoRef.current === video;

    const executePlay = async () => {
      if (!isCurrent()) return;

      if (!isInView || isModalOpen || selectedReelId || isUserPaused) {
        video.pause();
        return;
      }

      video.playsInline = true;
      video.muted = isMuted;
      video.defaultMuted = isMuted;

      try {
        const p = video.play();
        if (p !== undefined) {
          await p;
        }
        if (isCurrent()) {
          setIsPaused(false);
          setVideoLoaded(true);
        }
      } catch {
        if (!isCurrent()) return;
        // Fallback: auto-mute if browser blocks unmuted audio
        video.muted = true;
        setIsMuted(true);
        try {
          const retryP = video.play();
          if (retryP !== undefined) {
            await retryP;
          }
          if (isCurrent()) {
            setIsPaused(false);
            setVideoLoaded(true);
          }
        } catch {
          // Video will play when ready
        }
      }
    };

    if (!isInView || isModalOpen || selectedReelId || isUserPaused) {
      video.pause();
    } else {
      // Trigger playback immediately
      void executePlay();
      const onReady = () => {
        if (isCurrent()) {
          void executePlay();
        }
      };
      video.addEventListener('canplay', onReady);
      video.addEventListener('loadeddata', onReady);
      video.addEventListener('loadedmetadata', onReady);

      return () => {
        isCancelled = true;
        video.removeEventListener('canplay', onReady);
        video.removeEventListener('loadeddata', onReady);
        video.removeEventListener('loadedmetadata', onReady);
      };
    }

    return () => {
      isCancelled = true;
    };
  }, [
    isInView,
    isUserPaused,
    activeIndex,
    currentReel?.id,
    isModalOpen,
    selectedReelId,
    isMuted
  ]);

  /* ================= CLEANUP ================= */

  useEffect(() => {
    return () => {
      playbackRequestRef.current++;
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      const v = videoRef.current;
      if (v) {
        try {
          v.pause();
        } catch {}
      }
    };
  }, []);

  /* ================= FEEDBACK INDICATOR ================= */

  const showPlaybackIndicator = useCallback(() => {
    setShowPlaybackFeedback(true);
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    feedbackTimeoutRef.current = setTimeout(() => {
      setShowPlaybackFeedback(false);
      feedbackTimeoutRef.current = null;
    }, 600);
  }, []);

  /* ================= PLAY / PAUSE TOGGLE ================= */

  const togglePlayback = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const video = videoRef.current;
      if (!video) return;

      if (video.paused) {
        setIsUserPaused(false);
        try {
          video.muted = isMuted;
          await video.play();
          setIsPaused(false);
        } catch {
          video.muted = true;
          setIsMuted(true);
          await video.play().catch(() => {});
          setIsPaused(false);
        }
      } else {
        setIsUserPaused(true);
        video.pause();
        setIsPaused(true);
      }

      showPlaybackIndicator();
    },
    [isMuted, showPlaybackIndicator]
  );

  /* ================= SOUND TOGGLE ================= */

  const toggleSound = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const video = videoRef.current;
      if (!video) return;

      if (video.muted) {
        video.muted = false;
        video.defaultMuted = false;
        video.volume = 1;
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
        setIsMuted(true);
      }
    },
    [isInView, isModalOpen, selectedReelId]
  );

  /* ================= LIKE & DOUBLE TAP ================= */

  const handleLike = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!currentReel) return;

      if (!isAuthenticated || !currentUser?.id) {
        setIsAuthModalOpen(true);
        addToast('تسجيل الدخول', 'سجّل دخولك أولاً للتفاعل مع الحكايات', 'info');
        return;
      }

      const reelId = currentReel.id;
      setLikedReels((prev) => {
        const next = new Set(prev);
        if (next.has(reelId)) {
          next.delete(reelId);
        } else {
          next.add(reelId);
        }
        return next;
      });

      craftReelsService.toggleLikeReel(reelId, currentUser).catch(() => {});
    },
    [currentReel, isAuthenticated, currentUser, setIsAuthModalOpen, addToast]
  );

  const handleCardInteraction = useCallback(
    (e: React.MouseEvent) => {
      const now = Date.now();
      if (now - lastTapRef.current < 280) {
        handleLike();
        setShowHeartAnim(true);
        setTimeout(() => setShowHeartAnim(false), 800);
      } else {
        togglePlayback(e);
      }
      lastTapRef.current = now;
    },
    [handleLike, togglePlayback]
  );

  /* ================= NAVIGATION ================= */

  const goTo = useCallback(
    (idx: number) => {
      if (!filteredReels.length) return;
      const nextIndex = ((idx % filteredReels.length) + filteredReels.length) % filteredReels.length;
      if (nextIndex === activeIndex) return;

      playbackRequestRef.current++;
      setIsUserPaused(false);
      setVideoLoaded(false);
      setIsPaused(false);
      setCurrentTime(0);
      setShowPlaybackFeedback(false);
      setActiveIndex(nextIndex);
    },
    [filteredReels.length, activeIndex]
  );

  const goNext = useCallback(() => {
    if (!filteredReels.length) return;
    goTo(activeIndex + 1);
  }, [activeIndex, filteredReels.length, goTo]);

  const goPrev = useCallback(() => {
    if (!filteredReels.length) return;
    goTo(activeIndex - 1);
  }, [activeIndex, filteredReels.length, goTo]);

  /* ================= KEYBOARD NAVIGATION ================= */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isInView || isModalOpen) return;
      if (['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowLeft') {
        goNext();
      } else if (e.key === 'ArrowRight') {
        goPrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayback();
      } else if (e.key.toLowerCase() === 'm') {
        toggleSound();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInView, isModalOpen, goNext, goPrev, togglePlayback, toggleSound]);

  /* ================= TOUCH SWIPE ================= */

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

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX < 0) {
        goNext();
      } else {
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
        reviewCount: 16,
        inStock: reel.inStock ?? true,
        stockCount: 10,
        categoryId: 'crafts',
        categoryName: reel.craftType || 'حرفة يدوية',
        sellerId: reel.sellerId || '',
        sellerName: reel.workshopName || reel.artisanName || 'حرفي أصيل',
        sellerGovernorate: reel.governorate,
        description: reel.description || '',
        specifications: {
          material: reel.craftType || 'يدوي أصيل',
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

    setAddedProductIds((prev) => new Set(prev).add(reel.productId!));
    setTimeout(() => {
      setAddedProductIds((prev) => {
        const next = new Set(prev);
        next.delete(reel.productId!);
        return next;
      });
    }, 2500);

    addToast(
      'أُضيف للحقيبة بنجاح',
      `تمت إضافة "${reel.productTitle || reel.title}" لحقيبة تسوقك`,
      'success'
    );
  };

  /* ================= SHARE REEL ================= */

  const handleShare = async (e: React.MouseEvent, reel: CraftReel) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/reels?reelId=${reel.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `وه | ${reel.title}`,
          text: `شاهد حرفة ${reel.craftType || ''} في صعيد مصر: ${reel.title}`,
          url: shareUrl
        });
        return;
      } catch {}
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      addToast('تم نسخ الرابط', 'تم نسخ رابط الحكاية للمشاركة', 'info');
    }
  };

  /* ================= 3D COVERFLOW CALCULATION ================= */

  const getPositionOffset = (index: number) => {
    const total = filteredReels.length;
    if (total <= 1) return 0;
    let diff = index - activeIndex;
    while (diff > total / 2) diff -= total;
    while (diff < -total / 2) diff += total;
    return diff;
  };

  const getCardStyle = (diff: number) => {
    const isSmall = isMobile;
    const spacing = isSmall ? 220 : 340;
    const farSpacing = isSmall ? 360 : 560;

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
          y: isSmall ? 8 : 16,
          scale: isSmall ? 0.88 : 0.86,
          rotateY: isSmall ? 8 : 16,
          opacity: isSmall ? 0.45 : 0.72,
          zIndex: 25,
          pointerEvents: 'auto' as const
        };
      case 1:
        return {
          x: `calc(-50% + ${spacing}px)`,
          y: isSmall ? 8 : 16,
          scale: isSmall ? 0.88 : 0.86,
          rotateY: isSmall ? -8 : -16,
          opacity: isSmall ? 0.45 : 0.72,
          zIndex: 25,
          pointerEvents: 'auto' as const
        };
      case -2:
        return {
          x: `calc(-50% - ${farSpacing}px)`,
          y: 30,
          scale: 0.72,
          rotateY: 24,
          opacity: !isSmall ? 0.35 : 0,
          zIndex: 10,
          pointerEvents: !isSmall ? ('auto' as const) : ('none' as const)
        };
      case 2:
        return {
          x: `calc(-50% + ${farSpacing}px)`,
          y: 30,
          scale: 0.72,
          rotateY: -24,
          opacity: !isSmall ? 0.35 : 0,
          zIndex: 10,
          pointerEvents: !isSmall ? ('auto' as const) : ('none' as const)
        };
      default:
        return {
          x: diff < 0 ? `calc(-50% - ${farSpacing + 200}px)` : `calc(-50% + ${farSpacing + 200}px)`,
          y: 44,
          scale: 0.6,
          rotateY: diff < 0 ? 30 : -30,
          opacity: 0,
          zIndex: 0,
          pointerEvents: 'none' as const
        };
    }
  };

  if (!reels.length) return null;

  const isCurrentLiked = currentReel ? likedReels.has(currentReel.id) : false;

  return (
    <section
      ref={sectionRef}
      dir="rtl"
      className="
        relative overflow-hidden py-12 sm:py-20
        bg-[#110B07] text-[#FFF9EE]
        select-none touch-pan-y
        border-y border-[#3B1E0E]/50
      "
    >
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="
            absolute top-1/4 left-1/2 -translate-x-1/2
            w-[400px] sm:w-[800px]
            h-[350px] sm:h-[450px]
            bg-[#C99444]/12 rounded-full
            blur-[130px] sm:blur-[180px]
          "
        />
        <div
          className="
            absolute -bottom-20 right-10
            w-[250px] sm:w-[450px]
            h-[250px] sm:h-[450px]
            bg-[#E66A2E]/8 rounded-full
            blur-[120px]
          "
        />
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-screen"
          style={{
            backgroundImage: "url('/pattern/pat2.png')",
            backgroundRepeat: 'repeat',
            backgroundSize: '540px auto',
            backgroundPosition: 'center',
            maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 80%)'
          }}
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ================= HEADER SECTION ================= */}
        <div className="relative z-10 mb-8 sm:mb-14">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              {/* Pulsing Live Badge */}
              <div className="mb-4 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#C99444]/15 border border-[#C99444]/30 backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E66A2E] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E66A2E]" />
                </span>
                <span className="text-[11px] font-black tracking-wider text-[#C99444]">
                  استوديو الصعيد | وثائقيات حية من قلب الورش
                </span>
              </div>

              <h2 className="
                text-4xl xs:text-5xl sm:text-6xl lg:text-7xl
                font-black tracking-tight leading-[1.05]
                text-[#FFF9EE] font-main
              ">
                ريلز{' '}
                <span className="text-[#C99444] inline-block">
                  وَه
                </span>
              </h2>

              <p className="mt-4 max-w-2xl text-xs sm:text-sm text-stone-300 leading-relaxed font-medium">
                حكايات وثائقية مصورة تسجّل عظمة اليد اللي بتبني وتغزل وتنحت. تعرّف على الصانع الحقيقي، وشاهد سر الصنعة، واقتنِ القطعة مباشرة من ورشتها بضمان منصة «وَه».
              </p>

              {/* Category Filter Pills */}
              {availableCategories.length > 0 && (
                <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory('all');
                      setActiveIndex(0);
                    }}
                    className={`
                      px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer
                      ${activeCategory === 'all'
                        ? 'bg-[#C99444] text-[#1B1009] shadow-md shadow-[#C99444]/25'
                        : 'bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10'
                      }
                    `}
                  >
                    كل الحكايات ({reels.length})
                  </button>

                  {availableCategories.map((cat) => {
                    const count = reels.filter(
                      (r) => (r.craftType && r.craftType.trim() === cat) || ((r as any).contentType && (r as any).contentType.trim() === cat)
                    ).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat);
                          setActiveIndex(0);
                        }}
                        className={`
                          px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer
                          ${activeCategory === cat
                            ? 'bg-[#C99444] text-[#1B1009] shadow-md shadow-[#C99444]/25'
                            : 'bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10'
                          }
                        `}
                      >
                        {cat} {count > 0 ? `(${count})` : ''}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Navigation Buttons & Full-screen CTA */}
            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="الحكاية السابقة"
                  onClick={goPrev}
                  className="
                    w-11 h-11 rounded-full
                    bg-white/10 hover:bg-[#C99444]
                    border border-white/15 hover:border-[#C99444]
                    text-white hover:text-[#1B1009]
                    transition-all active:scale-90 flex items-center justify-center
                    cursor-pointer shadow-md
                  "
                  title="السابق (السهم الأيمن)"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  aria-label="الحكاية التالية"
                  onClick={goNext}
                  className="
                    w-11 h-11 rounded-full
                    bg-white/10 hover:bg-[#C99444]
                    border border-white/15 hover:border-[#C99444]
                    text-white hover:text-[#1B1009]
                    transition-all active:scale-90 flex items-center justify-center
                    cursor-pointer shadow-md
                  "
                  title="التالي (السهم الأيسر)"
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
                  text-[#C99444] hover:text-[#E0C79B]
                  transition-colors cursor-pointer
                "
              >
                <span>معرض الريلز الكامل</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* ================= 3D REEL STAGE ================= */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="
            relative h-[510px] xs:h-[550px] sm:h-[630px] md:h-[660px]
            w-full flex items-center justify-center
            overflow-hidden sm:overflow-visible my-2
          "
          style={{ perspective: isMobile ? '1100px' : '1700px' }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {filteredReels.map((reel, index) => {
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
                    stiffness: 240,
                    damping: 27,
                    mass: 0.8
                  }}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    transformStyle: 'preserve-3d',
                    touchAction: 'pan-y'
                  }}
                  className={`
                    w-[280px] xs:w-[310px] sm:w-[360px] md:w-[375px]
                    h-[480px] xs:h-[520px] sm:h-[590px] md:h-[620px]
                    rounded-[28px] sm:rounded-[36px]
                    overflow-hidden select-none
                    border transition-[border-color,box-shadow] duration-300
                    ${isCurrent
                      ? 'border-[#C99444]/40 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.9),0_0_35px_rgba(201,148,68,0.22)] ring-1 ring-[#C99444]/30'
                      : 'border-white/10 shadow-2xl cursor-pointer hover:border-white/25'
                    }
                  `}
                  onClick={() => {
                    if (!isCurrent) goTo(index);
                  }}
                >
                  <div className="relative w-full h-full bg-[#180E09] overflow-hidden">
                    {isCurrent ? (
                      /* ACTIVE CENTER STAGE REEL */
                      <div
                        className="relative w-full h-full bg-black cursor-pointer"
                        onClick={handleCardInteraction}
                      >
                        {/* Poster Placeholder */}
                        <img
                          src={getPoster(reel, 900)}
                          alt={reel.title}
                          draggable={false}
                          className="
                            absolute inset-0 w-full h-full
                            object-cover pointer-events-none
                          "
                        />

                        {/* Video Element */}
                        <video
                          ref={(node) => {
                            (videoRef as any).current = node;
                            if (node) {
                              node.muted = isMuted;
                              node.defaultMuted = isMuted;
                              node.playsInline = true;
                              if (!isUserPaused && !isModalOpen && !selectedReelId) {
                                node.play().catch(() => {
                                  node.muted = true;
                                  setIsMuted(true);
                                  node.play().catch(() => {});
                                });
                              }
                            }
                          }}
                          key={reel.id}
                          src={getVideo(reel)}
                          poster={getPoster(reel, 900)}
                          muted={isMuted}
                          autoPlay
                          playsInline
                          preload="auto"
                          disablePictureInPicture
                          onTimeUpdate={handleTimeUpdate}
                          onLoadedData={(e) => {
                            setVideoLoaded(true);
                            if (!isUserPaused && !isModalOpen && !selectedReelId) {
                              e.currentTarget.play().catch(() => {
                                e.currentTarget.muted = true;
                                setIsMuted(true);
                                e.currentTarget.play().catch(() => {});
                              });
                            }
                          }}
                          onCanPlay={(e) => {
                            setVideoLoaded(true);
                            if (!isUserPaused && !isModalOpen && !selectedReelId) {
                              e.currentTarget.play().catch(() => {
                                e.currentTarget.muted = true;
                                setIsMuted(true);
                                e.currentTarget.play().catch(() => {});
                              });
                            }
                          }}
                          onPlaying={() => {
                            setVideoLoaded(true);
                            setIsPaused(false);
                          }}
                          onPlay={() => setIsPaused(false)}
                          onPause={() => setIsPaused(true)}
                          onEnded={() => {
                            goNext();
                          }}
                          onError={() => setVideoLoaded(false)}
                          className="
                            absolute inset-0 w-full h-full
                            object-cover cursor-pointer
                          "
                        />

                        {/* DOUBLE TAP HEART POP ANIMATION */}
                        <AnimatePresence>
                          {showHeartAnim && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.3 }}
                              animate={{ opacity: 1, scale: 1.3 }}
                              exit={{ opacity: 0, scale: 1.7 }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                              className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
                            >
                              <div className="p-5 rounded-full bg-black/40 backdrop-blur-xl border border-white/20">
                                <Heart className="w-16 h-16 text-rose-500 fill-rose-500 drop-shadow-2xl" />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* SINGLE TAP PLAY / PAUSE FEEDBACK */}
                        <AnimatePresence>
                          {showPlaybackFeedback && !showHeartAnim && (
                            <motion.div
                              key="playback-feedback"
                              initial={{ opacity: 0, scale: 0.7 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 1.15 }}
                              transition={{ duration: 0.22 }}
                              className="
                                pointer-events-none absolute inset-0
                                z-40 flex items-center justify-center
                              "
                            >
                              <div className="
                                flex h-20 w-20 items-center justify-center
                                rounded-full border border-white/20
                                bg-black/55 text-white
                                shadow-[0_8px_32px_rgba(0,0,0,0.5)]
                                backdrop-blur-xl
                              ">
                                {isPaused ? (
                                  <Play className="ml-1 h-10 w-10 fill-white text-white" />
                                ) : (
                                  <Pause className="h-10 w-10 fill-white text-white" />
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* TOP STATUS BAR & CONTROLS */}
                        <div
                          className="
                            absolute top-4 inset-x-3.5 sm:inset-x-4
                            z-30 flex items-center justify-between
                            pointer-events-none
                          "
                        >
                          {/* Location & Workshop Badge */}
                          <div className="
                            flex items-center gap-1.5
                            px-3 py-1.5 rounded-full
                            bg-black/60 backdrop-blur-xl
                            border border-white/15 text-stone-200
                            text-[11px] font-bold max-w-[170px]
                            shadow-md
                          ">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#C99444]" />
                            <span className="truncate">
                              {reel.location || reel.governorate || 'صعيد مصر'}
                            </span>
                          </div>

                          {/* Quick Controls: Sound Toggle & Expand */}
                          <div className="flex items-center gap-2 pointer-events-auto">
                            {/* Sound Toggle with Wave Animation */}
                            <button
                              type="button"
                              aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
                              onClick={toggleSound}
                              className={`
                                h-9 sm:h-10 px-3
                                flex items-center gap-1.5
                                rounded-full border transition-all duration-200
                                active:scale-90 cursor-pointer shadow-lg
                                ${isMuted
                                  ? 'bg-black/60 border-white/20 text-white hover:bg-black/80'
                                  : 'bg-[#C99444] border-[#E0C79B] text-[#1B1009] shadow-[#C99444]/30 font-bold'
                                }
                              `}
                              title={isMuted ? 'انقر لتشغيل الصوت' : 'كتم الصوت'}
                            >
                              {isMuted ? (
                                <>
                                  <VolumeX className="w-4 h-4 text-[#C99444]" />
                                  <span className="text-[10px] font-bold hidden xs:inline">الصوت</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-4 h-4" />
                                  <span className="flex items-center gap-0.5 h-3">
                                    <span className="w-0.5 h-2 bg-[#1B1009] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-0.5 h-3 bg-[#1B1009] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-0.5 h-1.5 bg-[#1B1009] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                  </span>
                                </>
                              )}
                            </button>

                            {/* Expand to Full-Screen Reels Modal */}
                            <button
                              type="button"
                              aria-label="مشاهدة بالحجم الكامل"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReelId(reel.id);
                                setIsModalOpen(true);
                              }}
                              className="
                                w-9 h-9 sm:w-10 sm:h-10
                                rounded-full bg-black/60
                                backdrop-blur-xl border border-white/20
                                text-white flex items-center justify-center
                                hover:bg-black/85 transition active:scale-90
                                cursor-pointer shadow-lg
                              "
                              title="تكبير الحكاية"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* BOTTOM DETAILS & PRODUCT CARD OVERLAY */}
                        <div
                          className="
                            absolute bottom-0 inset-x-0 z-30
                            p-4 sm:p-5 pb-5
                            bg-gradient-to-t from-black via-black/90 to-transparent
                          "
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Craft Type & Like Action */}
                          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                            <span className="text-[#C99444] bg-[#C99444]/15 px-2.5 py-0.5 rounded-full border border-[#C99444]/25">
                              {reel.craftType || 'حرفة أصيلة'}
                            </span>

                            <div className="flex items-center gap-2">
                              {/* Like button */}
                              <button
                                type="button"
                                onClick={handleLike}
                                className={`
                                  flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition active:scale-90 cursor-pointer
                                  ${isCurrentLiked
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    : 'bg-white/10 text-stone-300 hover:text-white border border-white/10'
                                  }
                                `}
                              >
                                <Heart className={`w-3.5 h-3.5 ${isCurrentLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                                <span>{(reel.likesCount || 0) + (isCurrentLiked ? 1 : 0)}</span>
                              </button>

                              {/* Share button */}
                              <button
                                type="button"
                                onClick={(e) => handleShare(e, reel)}
                                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 transition active:scale-90 cursor-pointer"
                                title="مشاركة"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Reel Title */}
                          <h3
                            onClick={() => {
                              setSelectedReelId(reel.id);
                              setIsModalOpen(true);
                            }}
                            className="
                              text-white text-sm sm:text-base
                              font-black leading-snug line-clamp-2
                              hover:text-[#E0C79B] transition cursor-pointer font-main
                            "
                          >
                            {reel.title}
                          </h3>

                          {/* Artisan / Workshop Name */}
                          {(reel.artisanName || reel.workshopName) && (
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-stone-300">
                              <BadgeCheck className="w-3.5 h-3.5 text-[#C99444] shrink-0" />
                              <span className="truncate">
                                بأنامل: {reel.artisanName || reel.workshopName}
                              </span>
                            </div>
                          )}

                          {/* Embedded Product Card (Instant 1-Click Buy) */}
                          {reel.productId && reel.productPrice && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="
                                mt-3 p-2 rounded-2xl
                                bg-stone-900/80 backdrop-blur-xl
                                border border-white/15
                                flex items-center justify-between gap-2.5
                                shadow-xl
                              "
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-1">
                                {reel.productImage && (
                                  <img
                                    src={reel.productImage}
                                    alt={reel.productTitle || 'المنتج'}
                                    className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                                  />
                                )}
                                <div className="min-w-0">
                                  <span className="block text-[11px] font-bold text-stone-100 truncate">
                                    {reel.productTitle || reel.title}
                                  </span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-xs font-black text-[#C99444]">
                                      {reel.productPrice} ج.م
                                    </span>
                                    {reel.productOriginalPrice && reel.productOriginalPrice > reel.productPrice && (
                                      <span className="text-[10px] text-stone-400 line-through">
                                        {reel.productOriginalPrice} ج.م
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                aria-label="إضافة للحقيبة"
                                onClick={(e) => handleQuickAdd(e, reel)}
                                className={`
                                  px-3 py-2 rounded-xl text-xs font-bold
                                  flex items-center gap-1.5 shrink-0
                                  transition-all duration-200 active:scale-95 shadow cursor-pointer
                                  ${addedProductIds.has(reel.productId)
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-[#C99444] hover:bg-[#E0C79B] text-[#1B1009] shadow-[#C99444]/30'
                                  }
                                `}
                              >
                                {addedProductIds.has(reel.productId) ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>أُضيف</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>اقتنِ القطعة</span>
                                  </>
                                )}
                              </button>
                            </motion.div>
                          )}
                        </div>

                        {/* SLICK GOLDEN VIDEO PROGRESS BAR AT BOTTOM */}
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-40 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#E66A2E] to-[#C99444] transition-[width] duration-150 ease-linear"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      /* SIDE PREVIEW CARDS (3D DEPTH) */
                      <div className="relative w-full h-full bg-[#110B07] group">
                        <img
                          src={getPoster(reel, 600)}
                          alt={reel.title}
                          draggable={false}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/35" />

                        {/* Center Play Hint */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="
                            w-12 h-12 rounded-full
                            bg-black/50 backdrop-blur-md
                            border border-white/25 text-white/90
                            flex items-center justify-center
                            shadow-xl group-hover:scale-110 group-hover:bg-[#C99444] group-hover:text-[#1B1009] group-hover:border-[#C99444]
                            transition-all duration-300
                          ">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>

                        {/* Card Meta Preview */}
                        <div className="absolute bottom-0 inset-x-0 p-4">
                          <span className="text-[#C99444] text-[10px] font-bold mb-1 block">
                            {reel.craftType || 'حكاية صعيدية'}
                          </span>
                          <h4 className="text-white text-xs sm:text-sm font-bold line-clamp-2">
                            {reel.title}
                          </h4>
                          {(reel.artisanName || reel.workshopName) && (
                            <p className="text-[10px] text-stone-400 mt-1 truncate">
                              بأنامل: {reel.artisanName || reel.workshopName}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ================= BOTTOM THUMBNAIL SELECTOR & CONTROLS ================= */}
        <div className="
          mt-6 sm:mt-10 pt-5 sm:pt-6
          border-t border-[#3B1E0E]/60
          flex flex-col sm:flex-row
          items-center justify-between gap-4
        ">
          {/* Active Reel Counter */}
          <div className="flex items-center justify-between w-full sm:w-auto px-1 sm:px-0">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-[#C99444]">
                {String(activeIndex + 1).padStart(2, '0')}
              </span>
              <span className="text-xs text-stone-500">/</span>
              <span className="text-xs font-bold text-stone-400">
                {String(filteredReels.length).padStart(2, '0')} حكاية موثقة
              </span>
            </div>

            <span className="sm:hidden text-[11px] text-stone-400 font-medium">
              اسحب للتنقل
            </span>
          </div>

          {/* Mini Thumbnail Strip */}
          <div className="
            flex items-center gap-2.5 overflow-x-auto
            w-full sm:w-auto py-1.5 scrollbar-none
          ">
            {filteredReels.map((reel, i) => (
              <button
                key={reel.id}
                type="button"
                aria-label={`الانتقال للحكاية ${i + 1}: ${reel.title}`}
                onClick={() => goTo(i)}
                className={`
                  relative shrink-0 h-12 w-16 sm:h-14 sm:w-20
                  rounded-xl overflow-hidden cursor-pointer
                  border transition-all duration-200
                  ${i === activeIndex
                    ? 'border-[#C99444] ring-2 ring-[#C99444]/40 scale-105 opacity-100 shadow-md shadow-[#C99444]/25'
                    : 'border-white/15 opacity-50 hover:opacity-90 hover:border-white/30'
                  }
                `}
              >
                <img
                  src={getPoster(reel, 200)}
                  alt={reel.title}
                  loading="lazy"
                  draggable={false}
                  className="w-full h-full object-cover"
                />
                {i === activeIndex && (
                  <span className="absolute bottom-0 inset-x-0 py-0.5 bg-[#C99444] text-[#1B1009] text-[9px] font-black text-center">
                    شغال
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Keyboard & Swipe Hint on Desktop */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-stone-400 font-medium">
            <span className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-stone-300 font-mono text-[10px]">
              ←
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-stone-300 font-mono text-[10px]">
              →
            </span>
            <span>للتنقل بالأسهم • اضغط مسافة للإيقاف</span>
          </div>
        </div>
      </div>

      {/* FULLSCREEN REEL MODAL */}
      {selectedReelId && (
        <CraftReelsModal
          reels={filteredReels}
          initialReelId={selectedReelId}
          hasBottomNav={true}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReelId(null);
          }}
          onDeleteReel={(deletedId) => {
            setReels((prev) => prev.filter((r) => r.id !== deletedId));
            setSelectedReelId(null);
            setIsModalOpen(false);
          }}
        />
      )}
    </section>
  );
};

export default CraftReelsSection;
