import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  Clapperboard,
  X,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOptimizedVideoUrl, getOptimizedVideoPoster } from '../../utils/cloudinaryMedia.ts';

export const IntroExperience: React.FC = () => {
  const { showIntroVideo, dismissIntroVideo, setActivePage } = useApp();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const originalVideoUrl =
    "https://res.cloudinary.com/kuana1nl/video/upload/v1788708117/%D8%B9%D8%A7%D9%8A%D8%B2%D9%87_%D9%8A%D9%83%D9%88%D9%86_%D8%AB%D8%A7%D9%86%D9%8A%D9%87.mp4";

  const optimizedVideoUrl = getOptimizedVideoUrl(originalVideoUrl, { maxDimension: 1080 });
  const posterUrl = getOptimizedVideoPoster(originalVideoUrl, undefined, 1280);

  const triggerControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, []);

  useEffect(() => {
    const handleFSChange = () => {
      const isFS = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (videoRef.current as any)?.webkitDisplayingFullscreen
      );
      setIsFullscreen(isFS);
    };

    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);

    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.addEventListener('webkitbeginfullscreen', () => setIsFullscreen(true));
      videoEl.addEventListener('webkitendfullscreen', () => setIsFullscreen(false));
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('webkitfullscreenchange', handleFSChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    triggerControls();
    const container = containerRef.current;
    const video = videoRef.current;

    try {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        if (container?.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any)?.webkitRequestFullscreen) {
          (container as any).webkitRequestFullscreen();
        } else if ((video as any)?.webkitEnterFullscreen) {
          (video as any).webkitEnterFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      if ((video as any)?.webkitEnterFullscreen) {
        (video as any).webkitEnterFullscreen();
      }
    }
  };

  const togglePlay = () => {
    triggerControls();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    triggerControls();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setCurrentTime(curr);
    setProgress((curr / dur) * 100);
  };

  // معالجة الضغط على الشريط باتجاه اليسار إلى اليمين LTR دائماً
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pos = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = pos * (videoRef.current.duration || 1);
    videoRef.current.currentTime = targetTime;
    setProgress(pos * 100);
    triggerControls();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleClose = () => {
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      try {
        document.exitFullscreen?.();
      } catch (e) { }
    }
    dismissIntroVideo();
  };

  if (!showIntroVideo) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="intro-video-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-center justify-center bg-[#070605]/95 backdrop-blur-2xl p-2 sm:p-6 select-none overflow-y-auto"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#9a6a35]/12 blur-[150px] pointer-events-none rounded-full" />

        <motion.div
          ref={containerRef}
          onMouseMove={triggerControls}
          onTouchStart={triggerControls}
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`
            relative w-full overflow-hidden bg-black text-white transition-all duration-300 flex flex-col justify-between
            ${isFullscreen
              ? 'h-full w-full rounded-none border-none'
              : 'max-w-5xl rounded-3xl sm:rounded-[2.5rem] border border-[#9a6a35]/35 shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_50px_rgba(154,106,53,0.2)]'
            }
          `}
        >
          {/* ======================= الشريط العلوي ======================= */}
          <div
            className={`
              absolute top-0 inset-x-0 z-30 p-3 sm:p-6
              bg-gradient-to-b from-black/90 via-black/40 to-transparent
              flex items-center justify-between pointer-events-none
              transition-opacity duration-300
              ${controlsVisible || !isPlaying || isFullscreen ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <div className="pointer-events-auto flex items-center gap-2.5 bg-black/60 backdrop-blur-xl px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-[#9a6a35]/30">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9a6a35] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9a6a35]" />
              </span>
              <Clapperboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d6aa72]" />
              <span className="text-[11px] sm:text-xs font-black tracking-wide text-[#f5f0e7]">
                الصعيد بيحكى / وثائقي حي
              </span>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="
                pointer-events-auto w-9 h-9 sm:w-11 sm:h-11 rounded-full
                bg-black/60 hover:bg-[#9a6a35] backdrop-blur-xl
                border border-white/10 hover:border-[#9a6a35]
                text-white flex items-center justify-center
                transition-all duration-200 active:scale-95 cursor-pointer
              "
              title="إغلاق وتخطي"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* ======================= شاشة عرض الفيديو ======================= */}
          <div
            onClick={togglePlay}
            className={`relative w-full cursor-pointer flex items-center justify-center overflow-hidden bg-black ${isFullscreen ? 'h-full flex-1' : 'aspect-video'}`}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              webkit-playsinline="true"
              preload="metadata"
              poster={posterUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => {
                if (videoRef.current) setDuration(videoRef.current.duration);
              }}
              onError={(e) => {
                const v = e.currentTarget;
                if (v.src !== originalVideoUrl) {
                  v.src = originalVideoUrl;
                  v.load();
                  v.play().catch(() => { });
                }
              }}
            >
              <source src={optimizedVideoUrl} type="video/mp4" />
            </video>

            {/* أيقونة تشغيل سينمائية عند التوقف */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.65 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.65 }}
                  className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#9a6a35]/90 text-white flex items-center justify-center shadow-[0_0_40px_rgba(154,106,53,0.6)] backdrop-blur-md pointer-events-none"
                >
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ======================= لوحة التحكم (تحت الفيديو في الموبايل، وعائمة في الشاشات الكبيرة والشاشة الكاملة) ======================= */}
          <div
            className={`
              ${isFullscreen
                ? 'absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 sm:p-7'
                : 'relative sm:absolute sm:bottom-0 sm:inset-x-0 sm:z-30 bg-zinc-950 sm:bg-gradient-to-t sm:from-black/95 sm:via-black/70 sm:to-transparent border-t border-white/5 sm:border-none p-3.5 sm:p-6'
              }
              flex flex-col gap-3 transition-opacity duration-300
              ${controlsVisible || !isPlaying || !isFullscreen ? 'opacity-100' : 'sm:opacity-0 sm:pointer-events-none'}
            `}
          >
            {/* شريط التقدم السلس (يعمل LTR لليمين بشكل سليم دائماً) */}
            <div
              dir="ltr"
              onClick={handleSeek}
              className="relative w-full h-2.5 sm:h-2 bg-white/20 hover:h-3 rounded-full cursor-pointer transition-all duration-200 flex items-center"
            >
              <div
                className="h-full rounded-full bg-[#9a6a35] relative transition-all"
                style={{ width: `${progress}%` }}
              >
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_10px_#9a6a35]" />
              </div>
            </div>

            {/* الأزرار وأدوات التحكم */}
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-[#9a6a35] flex items-center justify-center transition-all cursor-pointer text-white active:scale-95"
                  title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-[#9a6a35] flex items-center justify-center transition-all cursor-pointer text-white active:scale-95"
                  title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-white/60" /> : <Volume2 className="w-4 h-4 text-[#d6aa72]" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                      videoRef.current.play();
                      setIsPlaying(true);
                      triggerControls();
                    }
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-[#9a6a35] hidden sm:flex items-center justify-center transition-all cursor-pointer text-white active:scale-95"
                  title="إعادة من الأول"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <span dir="ltr" className="text-[11px] sm:text-xs font-mono text-[#d6aa72] font-semibold ms-1 sm:ms-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-[#9a6a35] flex items-center justify-center transition-all cursor-pointer text-white active:scale-95 border border-white/10"
                  title={isFullscreen ? 'الخروج من الشاشة الكاملة' : 'تكبير الشاشة بالعرض'}
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    setActivePage('products');
                  }}
                  className="
                    px-4 sm:px-6 py-2 sm:py-2.5 rounded-full
                    bg-[#9a6a35] hover:bg-[#83582a]
                    text-white text-xs sm:text-sm font-bold
                    shadow-[0_4px_20px_rgba(154,106,53,0.4)]
                    flex items-center gap-1.5 sm:gap-2
                    transition-all active:scale-95 cursor-pointer whitespace-nowrap
                  "
                >
                  <span>استكشف المنصة</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IntroExperience;