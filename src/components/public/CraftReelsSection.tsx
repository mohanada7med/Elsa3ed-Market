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
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Flame,
  Trash2,
  MapPin,
  Sparkles,
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

const AUTOPLAY_TIME = 7000;

export const CraftReelsSection: React.FC = () => {
  const {
    setActivePage,
    addToCart,
    addToast,
    confirmModal,
    currentUser
  } = useApp();

  const [reels, setReels] = useState<CraftReel[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedReelId, setSelectedReelId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  /* ================= DETECT MOBILE ================= */
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
      if (Array.isArray(data)) setReels(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  /* ================= NAVIGATION ================= */
  const goTo = useCallback(
    (idx: number) => {
      if (!reels.length) return;
      setVideoLoaded(false);
      setActiveIndex(() => {
        if (idx < 0) return reels.length - 1;
        if (idx >= reels.length) return 0;
        return idx;
      });
    },
    [reels.length]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  /* ================= AUTOPLAY ================= */
  useEffect(() => {
    if (!reels.length || isHovered || isPaused || selectedReelId) return;
    const interval = setInterval(goNext, AUTOPLAY_TIME);
    return () => clearInterval(interval);
  }, [reels.length, isHovered, isPaused, selectedReelId, goNext, activeIndex]);

  /* ================= VIDEO SYNC ================= */
  const currentReel = reels[activeIndex];

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentReel) return;

    if (isModalOpen || selectedReelId) {
      try {
        video.pause();
      } catch (_) { }
      return;
    }

    video.muted = isMuted;
    video.currentTime = 0;

    let active = true;
    video
      .play()
      .then(() => {
        if (active) setIsPaused(false);
      })
      .catch(() => {
        if (active) setIsPaused(true);
      });

    return () => {
      active = false;
    };
  }, [activeIndex, currentReel?.id, isMuted, isModalOpen, selectedReelId]);

  /* ================= MEDIA GETTERS ================= */
  const getVideo = (reel: CraftReel) =>
    getOptimizedVideoUrl(reel.videoUrl, {
      maxDimension: 720,
      qualityMode: 'eco',
      forceMp4: true
    }) || reel.videoUrl;

  const getPoster = (reel: CraftReel, width = 700) =>
    getOptimizedVideoPoster(
      reel.videoUrl,
      reel.posterUrl || reel.productImage,
      width
    );

  /* ================= ACTIONS ================= */
  const handleDragEnd = (_: any, info: PanInfo) => {
    // حساسية مناسبة للموبايل لمنع التمرير بالخطأ
    const offsetThreshold = isMobile ? 35 : 55;
    const velocityThreshold = 250;

    if (info.offset.x < -offsetThreshold || info.velocity.x < -velocityThreshold) {
      goNext();
    } else if (info.offset.x > offsetThreshold || info.velocity.x > velocityThreshold) {
      goPrev();
    }
  };

  const togglePlayback = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPaused(false);
    } else {
      v.pause();
      setIsPaused(true);
    }
  };

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

    addToast('تمت الإضافة', `أُضيف "${reel.productTitle || reel.title}" للحقيبة`, 'success');
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedReelId(null);
  }, []);

  /* ================= RESPONSIVE STACK MATH ================= */
  const getPositionOffset = (index: number) => {
    const total = reels.length;
    let diff = index - activeIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  const getCardStyle = (diff: number) => {
    // إعدادات مخصصة للهواتف لتفادي الخروج عن الشاشة
    if (isMobile) {
      switch (diff) {
        case 0:
          return {
            x: '-50%',
            left: '50%',
            y: 0,
            scale: 1,
            rotateY: 0,
            opacity: 1,
            zIndex: 30,
            pointerEvents: 'auto' as const
          };
        case -1:
          return {
            x: '-50%',
            left: '2%',
            y: 0,
            scale: 0.88,
            rotateY: 12,
            opacity: 0.35,
            zIndex: 10,
            pointerEvents: 'auto' as const
          };
        case 1:
          return {
            x: '-50%',
            left: '98%',
            y: 0,
            scale: 0.88,
            rotateY: -12,
            opacity: 0.35,
            zIndex: 10,
            pointerEvents: 'auto' as const
          };
        default:
          return {
            x: '-50%',
            left: diff < 0 ? '-30%' : '130%',
            y: 0,
            scale: 0.7,
            rotateY: 0,
            opacity: 0,
            zIndex: 0,
            pointerEvents: 'none' as const
          };
      }
    }

    // إعدادات الشاشات الكبيرة (Desktop)
    switch (diff) {
      case 0:
        return {
          x: '-50%',
          left: '50%',
          y: 0,
          scale: 1,
          rotateY: 0,
          opacity: 1,
          zIndex: 40,
          pointerEvents: 'auto' as const
        };
      case -1:
        return {
          x: '-50%',
          left: '24%',
          y: 15,
          scale: 0.85,
          rotateY: 18,
          opacity: 0.75,
          zIndex: 20,
          pointerEvents: 'auto' as const
        };
      case 1:
        return {
          x: '-50%',
          left: '76%',
          y: 15,
          scale: 0.85,
          rotateY: -18,
          opacity: 0.75,
          zIndex: 20,
          pointerEvents: 'auto' as const
        };
      case -2:
        return {
          x: '-50%',
          left: '7%',
          y: 35,
          scale: 0.7,
          rotateY: 30,
          opacity: 0.4,
          zIndex: 10,
          pointerEvents: 'auto' as const
        };
      case 2:
        return {
          x: '-50%',
          left: '93%',
          y: 35,
          scale: 0.7,
          rotateY: -30,
          opacity: 0.4,
          zIndex: 10,
          pointerEvents: 'auto' as const
        };
      default:
        return {
          x: '-50%',
          left: diff < 0 ? '-15%' : '115%',
          y: 50,
          scale: 0.5,
          rotateY: diff < 0 ? 40 : -40,
          opacity: 0,
          zIndex: 1,
          pointerEvents: 'none' as const
        };
    }
  };

  if (!reels.length) return null;

  return (
    <section
      dir="rtl"
      className="relative overflow-hidden py-10 sm:py-20 bg-[#0c0a09] text-stone-100 select-none touch-pan-y"
    >
      {/* Dynamic Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[700px] h-[300px] sm:h-[400px] bg-primary/10 rounded-full blur-[110px] sm:blur-[160px]" />

        {/* Authentic WAH Brand Watermark (وه بيحكي) */}
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
        {/* Header Block */}
        {/* ===================================================
            MATCHED BRAND HERO HEADER
        =================================================== */}
        <div className="relative z-10 mb-10 sm:mb-16 text-foreground select-none">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
            <div>
              {/* Badge */}
              <div className="mb-6 flex items-center gap-3 text-[10px] font-black tracking-[0.28em] text-primary dark:text-primary-hover">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                  <Compass
                    size={14}
                    className="animate-spin-slow text-accent"
                  />
                </span>
                DISCOVER / حكايات ووثائقيات «وه»
              </div>

              {/* Massive Title */}
              <h2 className="max-w-6xl text-5xl sm:text-7xl lg:text-[8rem] font-black leading-[0.95] tracking-tight text-espresso dark:text-cream">
                ريلز
                <br />
                <span className="ps-22 mr-3 sm:mr-8 lg:mr-20 text-primary dark:text-primary-hover">
                  وه
                </span>
              </h2>

              {/* Subtitle / Details Block */}
              <div className="mt-8 grid max-w-3xl gap-6 sm:grid-cols-[80px_1fr] items-start">
                <div className="hidden sm:block">
                  <div className="text-[10px] font-black tracking-[0.2em] text-foreground-disabled">
                    ريلز وه
                  </div>
                  <div className="mt-3 h-px w-10 bg-accent" />
                </div>

                <div className="text-sm sm:text-base leading-relaxed text-black/60 dark:text-white/60">
                  حكايات وثائقية قصيرة بتسجل روح الورش الصعيدية، أصالة كل لمسة يد، وسر كل قطعة من مكان صناعتها الأصلي.
                </div>
              </div>
            </div>

            {/* Right Action & Navigation */}
            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="السابق"
                  onClick={goPrev}
                  className="w-11 h-11 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  aria-label="التالي"
                  onClick={goNext}
                  className="w-11 h-11 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActivePage('reels')}
                className="group inline-flex items-center gap-2 text-xs font-black text-primary dark:text-primary-hover transition-colors"
              >
                <span>كل الحكايات المصورة</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
        {/* 3D Panorama Stage - ارتفاع متناسب على الموبايل والكمبيوتر */}
        <div
          className="relative h-[480px] xs:h-[520px] sm:h-[620px] w-full flex items-center justify-center overflow-hidden sm:overflow-visible"
          style={{ perspective: isMobile ? '900px' : '1500px' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {reels.map((reel, index) => {
              const diff = getPositionOffset(index);
              // إخفاء الكروت البعيدة تماماً لتوفير أداء الهاتف ومنع الـ Overflow
              if (isMobile && Math.abs(diff) > 1) return null;
              if (!isMobile && Math.abs(diff) > 2) return null;

              const isCurrent = diff === 0;
              const cardAnim = getCardStyle(diff);

              return (
                <motion.div
                  key={reel.id}
                  initial={false}
                  animate={cardAnim}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 26,
                    mass: 0.7
                  }}
                  drag={isCurrent ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  style={{
                    position: 'absolute',
                    transformStyle: 'preserve-3d',
                    touchAction: 'pan-y'
                  }}
                  className={`
                    w-[270px] xs:w-[290px] sm:w-[350px]
                    h-[460px] xs:h-[500px] sm:h-[580px]
                    rounded-[26px] sm:rounded-[32px]
                    overflow-hidden select-none border border-white/10 shadow-2xl
                    ${isCurrent ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                  `}
                  onClick={() => {
                    if (!isCurrent) goTo(index);
                  }}
                >
                  <div className="relative w-full h-full bg-stone-900 overflow-hidden">
                    {/* Active Reel Display */}
                    {isCurrent ? (
                      <div className="relative w-full h-full bg-black">
                        {/* Poster Placeholder */}
                        <img
                          src={getPoster(reel, 800)}
                          alt={reel.title}
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${videoLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
                            }`}
                        />

                        <video
                          ref={videoRef}
                          key={reel.id}
                          src={getVideo(reel)}
                          poster={getPoster(reel, 800)}
                          muted={isMuted}
                          playsInline
                          preload="auto"
                          onCanPlay={() => setVideoLoaded(true)}
                          onEnded={goNext}
                          className="absolute inset-0 w-full h-full object-cover"
                        />


                        {/* Top Quick Action Pills */}
                        <div className="absolute top-5 inset-x-3 sm:inset-x-4 z-30 flex items-center justify-between pointer-events-auto">
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 text-stone-200 text-[10px] font-bold">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            <span className="truncate max-w-[110px]">
                              {reel.location || reel.governorate || 'الصعيد'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsMuted((m) => !m);
                              }}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center hover:bg-black/70 transition"
                            >
                              {isMuted ? (
                                <VolumeX className="w-3.5 h-3.5" />
                              ) : (
                                <Volume2 className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReelId(reel.id);
                                setIsModalOpen(true);
                              }}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center hover:bg-black/70 transition"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Play/Pause Center Tap Area */}
                        <button
                          type="button"
                          onClick={togglePlayback}
                          className="absolute inset-0 z-20 flex items-center justify-center bg-transparent"
                        >
                          <AnimatePresence>
                            {isPaused && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.6 }}
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/60 backdrop-blur-lg border border-white/20 flex items-center justify-center text-white shadow-2xl"
                              >
                                <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white mr-[-2px]" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>

                        {/* Bottom Information Overlay */}
                        <div
                          className="absolute bottom-0 inset-x-0 z-30 p-3.5 sm:p-5 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-amber-400 mb-1">
                            <span>{reel.craftType || 'حرفة تراثية'}</span>
                            <span className="flex items-center gap-1 text-stone-300">
                              <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                              {reel.likesCount || 0}
                            </span>
                          </div>

                          <h3
                            onClick={() => {
                              setSelectedReelId(reel.id);
                              setIsModalOpen(true);
                            }}
                            className="text-white text-sm sm:text-base font-black leading-snug line-clamp-2 hover:text-amber-300 transition cursor-pointer"
                          >
                            {reel.title}
                          </h3>

                          {(reel.artisanName || reel.workshopName) && (
                            <p className="mt-0.5 text-[10px] sm:text-xs text-stone-400 truncate">
                              صُنعت بأنامل: {reel.artisanName || reel.workshopName}
                            </p>
                          )}

                          {/* Product Pill */}
                          {reel.productId && reel.productPrice && (
                            <div className="mt-2.5 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/10 flex items-center justify-between gap-2">
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
                                onClick={(e) => handleQuickAdd(e, reel)}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold flex items-center justify-center transition active:scale-90 shadow shrink-0"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Side Peek Cards */
                      <div className="relative w-full h-full bg-stone-950">
                        <img
                          src={getPoster(reel, 500)}
                          alt={reel.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/80">
                            <Play className="w-4 h-4 fill-current mr-[-2px]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar: Indicators & Strip */}
        <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-900 pt-4 sm:pt-6">
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

            {/* Mobile View All Button */}
            <button
              type="button"
              onClick={() => setActivePage('reels')}
              className="sm:hidden text-xs font-bold text-amber-400"
            >
              عرض الكل ←
            </button>
          </div>

          {/* Quick-Seek Preview Strip (Scrollable on mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1 scrollbar-none">
            {reels.map((reel, i) => (
              <button
                key={reel.id}
                type="button"
                onClick={() => goTo(i)}
                className={`relative shrink-0 h-9 w-12 sm:h-10 sm:w-14 rounded-lg sm:rounded-xl overflow-hidden border transition-all ${i === activeIndex
                  ? 'border-amber-400 ring-2 ring-amber-400/30 scale-105 opacity-100'
                  : 'border-white/10 opacity-40'
                  }`}
              >
                <img
                  src={getPoster(reel, 150)}
                  alt={reel.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          <div className="hidden lg:block text-[11px] text-stone-500 font-medium">
            اسحب يميناً أو يساراً للتنقل بين الحكايات
          </div>
        </div>
      </div>

      {/* Modal View */}
      {selectedReelId && (
        <CraftReelsModal
          reels={reels}
          initialReelId={selectedReelId}
          hasBottomNav={true}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onDeleteReel={(deletedId) => {
            setReels((prev) => prev.filter((r) => r.id !== deletedId));
          }}
        />
      )}
    </section>
  );
};

export default CraftReelsSection;