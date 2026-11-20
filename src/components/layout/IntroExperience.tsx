
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
  X,
  RotateCcw,
  Share2,
  Check,
  Link2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getOptimizedVideoUrl,
  getOptimizedVideoPoster,
} from '../../utils/cloudinaryMedia.ts';

const ORIGINAL_VIDEO_URL =
  'https://res.cloudinary.com/kuana1nl/video/upload/v1795182277/compressed.mp4';

/* ================= THEME ================= */

const themeStyles = {
  light: {
    ink: '#3B2A1A',
    paper: '#F4E8CF',
    sand: '#E6D5B0',
    shadow: '#3B2A1A',
    texture: 'rgba(59,42,26,0.07)',
    accent: '#9A6A35',
    muted: 'rgba(59,42,26,0.65)',
    progress: '#B45F42',
    mobileBg: '#E8D8BD',
    mobileSurface: '#F4E8CF',
  },
  dark: {
    ink: '#F0DFC0',
    paper: '#241E1A',
    sand: '#352A21',
    shadow: '#0D0907',
    texture: 'rgba(240,223,192,0.045)',
    accent: '#D49A5B',
    muted: 'rgba(240,223,192,0.65)',
    progress: '#D49A5B',
    mobileBg: '#17120F',
    mobileSurface: '#241E1A',
  },
};

type ThemeColors = typeof themeStyles.light;

const formatTime = (secs: number) => {
  if (!Number.isFinite(secs) || secs < 0) return '0:00';

  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);

  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const getCurrentTheme = (): keyof typeof themeStyles => {
  if (typeof document === 'undefined') return 'light';

  const root = document.documentElement;

  return root.classList.contains('dark') ||
    root.getAttribute('data-theme') === 'dark' ||
    root.getAttribute('data-mode') === 'dark'
    ? 'dark'
    : 'light';
};

/* ================= BUTTON ================= */

const InkButton: React.FC<{
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  colors: ThemeColors;
  className?: string;
}> = ({ onClick, title, children, colors, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    style={{
      backgroundColor: colors.paper,
      color: colors.ink,
      borderColor: colors.ink,
      boxShadow: `3px 3px 0 ${colors.shadow}`,
    }}
    className={`
      flex h-10 w-10 shrink-0 items-center justify-center
      rounded-xl border-2 transition-all duration-200
      hover:bg-primary hover:text-white
      active:translate-x-[2px] active:translate-y-[2px]
      active:shadow-none sm:h-11 sm:w-11
      ${className}
    `}
  >
    {children}
  </button>
);

/* ================= ORNAMENT ================= */

const Ornament: React.FC<{ colors: ThemeColors }> = ({ colors }) => (
  <div className="flex items-center gap-2" aria-hidden="true">
    <span className="h-[2px] flex-1" style={{ backgroundColor: colors.ink }} />
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-2.5 w-2.5 rotate-45"
        style={{ backgroundColor: i === 1 ? colors.accent : colors.ink }}
      />
    ))}
    <span className="h-[2px] flex-1" style={{ backgroundColor: colors.ink }} />
  </div>
);

/* ================= PROGRESS BAR ================= */

const ProgressBar: React.FC<{
  progress: number;
  currentTime: number;
  duration: number;
  colors: ThemeColors;
  onSeek: (e: React.PointerEvent<HTMLDivElement>) => void;
  draggingRef: React.MutableRefObject<boolean>;
}> = ({
  progress,
  currentTime,
  duration,
  colors,
  onSeek,
  draggingRef,
}) => (
    <div className="w-full">
      <div
        dir="ltr"
        role="slider"
        aria-label="تقدم الفيديو"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        tabIndex={0}
        onKeyDown={(e) => {
          const video = document.getElementById(
            'wah-intro-video'
          ) as HTMLVideoElement | null;

          if (!video || !Number.isFinite(video.duration)) return;

          if (e.key === 'ArrowRight') {
            video.currentTime = Math.min(video.duration, video.currentTime + 5);
          }

          if (e.key === 'ArrowLeft') {
            video.currentTime = Math.max(0, video.currentTime - 5);
          }
        }}
        onPointerDown={(e) => {
          draggingRef.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          onSeek(e);
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) onSeek(e);
        }}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
        onPointerCancel={() => {
          draggingRef.current = false;
        }}
        className="flex h-7 w-full cursor-pointer touch-none items-center"
      >
        <div
          className="relative h-[7px] w-full overflow-hidden rounded-full"
          style={{ backgroundColor: colors.sand }}
        >
          <div
            className="absolute inset-y-0 start-0 rounded-full"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              backgroundColor: colors.progress,
              transition: draggingRef.current ? 'none' : 'width 100ms linear',
            }}
          />
        </div>
      </div>

      <div
        dir="ltr"
        className="flex justify-between text-[10px] font-bold tabular-nums"
        style={{ color: colors.muted }}
      >
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );

/* ================= MAIN ================= */

export const IntroExperience: React.FC = () => {
  const { showIntroVideo, dismissIntroVideo, setActivePage } = useApp();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const fallbackTriedRef = useRef(false);
  const audioAttemptedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  /* SYNC URL TO /film */
  useEffect(() => {
    if (!showIntroVideo) return;
    try {
      const current = window.location.pathname.replace(/\/+$/, '') || '/';
      if (current !== '/film' && current !== '/film') {
        window.history.pushState({ page: 'intro' }, '', '/film');
      }
    } catch { }
  }, [showIntroVideo]);

  const handleShareLink = useCallback(async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://waaaaah.vercel.app';
    const shareUrl = `${origin}/film`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'فيلم وه التوثيقي — الصعيد بيحكى',
          text: 'شاهد الحكاية والفيلم التوثيقي لمنصة وه وصعيد مصر:',
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2400);
      } catch {
        try {
          const input = document.createElement('input');
          input.value = shareUrl;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2400);
        } catch { }
      }
    }
  }, []);

  /* THEME */

  const [theme, setTheme] = useState<keyof typeof themeStyles>(getCurrentTheme);

  const COLORS = themeStyles[theme];

  useEffect(() => {
    const updateTheme = () => setTheme(getCurrentTheme());

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-mode'],
    });

    return () => observer.disconnect();
  }, []);

  /* VIDEO URLS */

  const optimizedVideoUrl = getOptimizedVideoUrl(
    ORIGINAL_VIDEO_URL,
    { maxDimension: 1080 }
  );

  const posterUrl = getOptimizedVideoPoster(
    ORIGINAL_VIDEO_URL,
    undefined,
    1280
  );

  /* BACKGROUND */

  const latticeBg: React.CSSProperties = {
    backgroundColor: COLORS.sand,
    backgroundImage: `
      repeating-linear-gradient(
        45deg,
        ${COLORS.texture} 0 2px,
        transparent 2px 16px
      ),
      repeating-linear-gradient(
        -45deg,
        ${COLORS.texture} 0 2px,
        transparent 2px 16px
      )
    `,
  };

  /* RESET */

  useEffect(() => {
    if (!showIntroVideo) return;

    fallbackTriedRef.current = false;
    audioAttemptedRef.current = false;
    draggingRef.current = false;

    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setIsMuted(false);
  }, [showIntroVideo]);

  /* SCROLL LOCK */

  useEffect(() => {
    if (!showIntroVideo) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showIntroVideo]);

  /* FULLSCREEN EVENTS */

  useEffect(() => {
    if (!showIntroVideo) return;

    const video = videoRef.current as any;

    const updateFullscreen = () => {
      setIsFullscreen(
        !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          video?.webkitDisplayingFullscreen
        )
      );
    };

    const handleWebkitBegin = () => setIsFullscreen(true);
    const handleWebkitEnd = () => setIsFullscreen(false);

    video?.addEventListener('webkitbeginfullscreen', handleWebkitBegin);
    video?.addEventListener('webkitendfullscreen', handleWebkitEnd);

    document.addEventListener('fullscreenchange', updateFullscreen);
    document.addEventListener('webkitfullscreenchange', updateFullscreen);

    return () => {
      video?.removeEventListener('webkitbeginfullscreen', handleWebkitBegin);
      video?.removeEventListener('webkitendfullscreen', handleWebkitEnd);

      document.removeEventListener('fullscreenchange', updateFullscreen);
      document.removeEventListener('webkitfullscreenchange', updateFullscreen);
    };
  }, [showIntroVideo]);

  /* PLAY / PAUSE */

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => { });
    } else {
      video.pause();
    }
  }, []);

  /* MUTE */

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const next = !video.muted;

    video.muted = next;
    setIsMuted(next);

    if (!next && video.paused) {
      video.play().catch(() => { });
    }
  }, []);

  /* RESTART */

  const restart = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.play().catch(() => { });
  }, []);

  /* FULLSCREEN */

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current as any;
    const video = videoRef.current as any;
    const doc = document as any;

    try {
      const isCurrentlyFullscreen =
        document.fullscreenElement || doc.webkitFullscreenElement;

      if (!isCurrentlyFullscreen) {
        if (container?.requestFullscreen) {
          await container.requestFullscreen();
        } else if (container?.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        } else if (video?.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      }
    } catch {
      video?.webkitEnterFullscreen?.();
    }
  }, []);

  /* CLOSE */

  const handleClose = useCallback(() => {
    const doc = document as any;

    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => { });
      } else if (doc.webkitFullscreenElement) {
        doc.webkitExitFullscreen?.();
      }
    } catch {
      // Ignore fullscreen exit errors.
    }

    videoRef.current?.pause();
    dismissIntroVideo();
  }, [dismissIntroVideo]);

  const goToPlatform = useCallback(() => {
    handleClose();
    setActivePage('products');
  }, [handleClose, setActivePage]);

  /* KEYBOARD */

  useEffect(() => {
    if (!showIntroVideo) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        handleClose();
      }

      if (e.code === 'Space') {
        const target = e.target as HTMLElement;

        if (
          target.tagName === 'BUTTON' ||
          target.tagName === 'INPUT' ||
          target.getAttribute('role') === 'slider'
        ) {
          return;
        }

        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, [showIntroVideo, handleClose, togglePlay]);

  /* SEEK */

  const seekFromPointer = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const video = videoRef.current;

      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();

      if (!rect.width) return;

      const position = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width)
      );

      const newTime = position * video.duration;

      video.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(position * 100);
    },
    []
  );

  /* TIME UPDATE */

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;

    if (!video || draggingRef.current) return;

    const total = video.duration;

    setCurrentTime(video.currentTime);
    setDuration(Number.isFinite(total) ? total : 0);

    setProgress(
      total > 0 && Number.isFinite(total)
        ? (video.currentTime / total) * 100
        : 0
    );
  }, []);

  /* METADATA */

  const handleMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    setCurrentTime(video.currentTime);
  }, []);

  /* AUDIO AUTOPLAY */

  const handleCanPlay = useCallback(() => {
    const video = videoRef.current;

    if (!video || audioAttemptedRef.current) return;

    audioAttemptedRef.current = true;

    video.muted = false;
    setIsMuted(false);

    video.play().catch(() => {
      // Some browsers block autoplay with sound.
      video.muted = true;
      setIsMuted(true);

      video.play().catch(() => { });
    });
  }, []);

  /* VIDEO ERROR FALLBACK */

  const handleVideoError = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;

      if (fallbackTriedRef.current) return;

      fallbackTriedRef.current = true;
      video.src = ORIGINAL_VIDEO_URL;
      video.load();

      video.play().catch(() => { });
    },
    []
  );

  if (!showIntroVideo) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="intro-video-modal"
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={latticeBg}
        className="
          fixed inset-0 z-[999] flex items-center
          justify-center overflow-hidden select-none
          sm:p-6
        "
      >
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            backgroundColor: COLORS.paper,
            borderColor: COLORS.ink,
            color: COLORS.ink,
            boxShadow: `12px 12px 0 ${COLORS.shadow}`,
          }}
          className="
            relative flex h-full w-full flex-col
            sm:h-auto sm:max-w-4xl sm:flex-row sm:gap-8
            sm:rounded-[1.75rem] sm:border-[3px] sm:p-7
          "
        >
          {/* MOBILE HEADER */}

          <div
            className="
              relative flex shrink-0 items-center
              justify-between px-5 pb-2 pt-5
              sm:hidden
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl border"
                style={{
                  borderColor: COLORS.ink,
                  backgroundColor: COLORS.sand,
                }}
              >
                <span className="text-lg font-black"><img src="mascot/logo.png" /></span>
              </div>

              <div>
                <h2 className="text-base font-black">
                  الصعيد بيحكى
                </h2>

                <p
                  className="mt-0.5 text-[10px] font-medium"
                  style={{ color: COLORS.muted }}
                >
                  الحكاية ورا كل حاجة
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              aria-label="إغلاق"
              style={{
                backgroundColor: COLORS.paper,
                borderColor: COLORS.ink,
                color: COLORS.ink,
              }}
              className="
                flex h-10 w-10 items-center justify-center
                rounded-xl border-2
              "
            >
              <X size={19} />
            </button>
          </div>

          {/* SHARED VIDEO - ONE INSTANCE ONLY */}

          <div
            className="
              flex min-h-0 flex-1 items-center justify-center
              px-4 py-2 sm:flex-none sm:px-0 sm:py-0
            "
          >
            <div
              style={{
                borderColor: COLORS.ink,
                boxShadow: `5px 5px 0 ${COLORS.shadow}`,
              }}
              className="
                relative h-full max-h-[58dvh]
                aspect-[9/16] max-w-full
                overflow-hidden rounded-[1.35rem]
                border-[2px] bg-black
                sm:h-[min(82dvh,740px)]
                sm:max-h-[82dvh] sm:rounded-2xl sm:border-[3px]
              "
            >
              {/* THE ONLY VIDEO ELEMENT */}

              <video
                id="wah-intro-video"
                ref={videoRef}
                src={optimizedVideoUrl}
                poster={posterUrl}
                className="absolute inset-0 h-full w-full object-contain"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                preload="auto"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onCanPlay={handleCanPlay}
                onTimeUpdate={handleTimeUpdate}
                onDurationChange={handleMetadata}
                onLoadedMetadata={handleMetadata}
                onError={handleVideoError}
              />

              {/* VIDEO CLICK AREA */}

              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'إيقاف الفيديو مؤقتاً' : 'تشغيل الفيديو'}
                className="absolute inset-0 z-10 cursor-pointer bg-transparent"
              />

              {/* PLAY ICON */}

              <AnimatePresence>
                {!isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    style={{
                      backgroundColor: COLORS.paper,
                      color: COLORS.ink,
                      borderColor: COLORS.ink,
                    }}
                    className="
                      pointer-events-none absolute left-1/2 top-1/2
                      z-20 flex h-16 w-16 -translate-x-1/2
                      -translate-y-1/2 items-center justify-center
                      rounded-full border-[2px]
                      sm:h-20 sm:w-20
                    "
                  >
                    <Play className="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* DOCUMENTARY LABEL */}

              <div
                style={{
                  backgroundColor: COLORS.paper,
                  color: COLORS.ink,
                  borderColor: COLORS.ink,
                }}
                className="
                  pointer-events-none absolute start-3 top-3 z-20
                  -rotate-6 rounded-md border px-2.5 py-1
                  text-[10px] font-black sm:border-2 sm:text-[11px]
                "
              >
                <span
                  className="
                    me-1.5 inline-block h-1.5 w-1.5
                    animate-pulse rounded-full bg-red-600
                  "
                />
                وثائقي حي
              </div>
            </div>
          </div>

          {/* MOBILE CONTROLS */}

          <div
            className="
              shrink-0 space-y-3 px-4 pb-4 pt-3 sm:hidden
            "
          >
            <div className="flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: COLORS.accent }}
              />

              <span
                className="text-[10px] font-bold tracking-widest"
                style={{ color: COLORS.muted }}
              >
                حكاية من قلب الصعيد
              </span>
            </div>

            <ProgressBar
              progress={progress}
              currentTime={currentTime}
              duration={duration}
              colors={COLORS}
              onSeek={seekFromPointer}
              draggingRef={draggingRef}
            />

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <InkButton
                  onClick={togglePlay}
                  title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                  colors={COLORS}
                  className="h-11 w-11"
                >
                  {isPlaying ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} fill="currentColor" />
                  )}
                </InkButton>

                <InkButton
                  onClick={toggleMute}
                  title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
                  colors={COLORS}
                  className="h-11 w-11"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </InkButton>

                <InkButton
                  onClick={restart}
                  title="إعادة الفيديو"
                  colors={COLORS}
                  className="h-11 w-11"
                >
                  <RotateCcw size={17} />
                </InkButton>

                <InkButton
                  onClick={handleShareLink}
                  title={copiedLink ? 'تم نسخ الرابط!' : 'مشاركة أو نسخ رابط الفيلم (/film)'}
                  colors={COLORS}
                  className="h-11 w-11"
                >
                  {copiedLink ? (
                    <Check size={18} className="text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Share2 size={17} />
                  )}
                </InkButton>
              </div>

              <button
                type="button"
                onClick={toggleFullscreen}
                style={{
                  color: COLORS.ink,
                  borderColor: COLORS.ink,
                }}
                className="
                  flex h-10 items-center gap-1.5
                  rounded-xl border px-3 text-[11px]
                  font-bold transition-all active:scale-95
                "
              >
                {isFullscreen ? (
                  <Minimize size={15} />
                ) : (
                  <Maximize size={15} />
                )}
                ملء الشاشة
              </button>
            </div>

            {/* DIRECT SHAREABLE LINK (MOBILE) */}
            <button
              type="button"
              onClick={handleShareLink}
              title="اضغط لنسخ الرابط المباشر للفيلم"
              style={{
                borderColor: COLORS.ink,
                backgroundColor: COLORS.sand,
                color: COLORS.ink,
              }}
              className="
                flex w-full items-center justify-between
                rounded-xl border-2 px-3 py-2 text-xs font-bold
                transition-all active:scale-[0.98] cursor-pointer
              "
            >
              <div className="flex items-center gap-1.5">
                <Link2 size={14} className="shrink-0" />
                <span className="font-mono text-[11px] font-black" dir="ltr">
                  /film
                </span>
              </div>
              <span
                className="text-[10px] font-black"
                style={{ color: copiedLink ? '#16a34a' : COLORS.accent }}
              >
                {copiedLink ? 'تم نسخ الرابط ✓' : 'نسخ رابط الفيلم'}
              </span>
            </button>

            <button
              type="button"
              onClick={goToPlatform}
              style={{
                backgroundColor: COLORS.ink,
                color: COLORS.paper,
                boxShadow: `3px 3px 0 ${COLORS.accent}`,
              }}
              className="
                flex w-full items-center justify-center
                gap-2 rounded-xl py-3.5 text-sm
                font-black transition-all
                active:translate-y-[2px] active:shadow-none
              "
            >
              استكشف المنصة
              <ArrowLeft size={17} />
            </button>

            <p
              className="text-center text-[9px] font-medium"
              style={{ color: COLORS.muted }}
            >
              وَه — العالم الرقمي لصعيد مصر
            </p>
          </div>

          {/* DESKTOP PANEL */}

          <div
            className="
              hidden min-w-0 flex-1 flex-col
              justify-center py-4 sm:flex
            "
          >
            {/* DESKTOP HEADER */}

            <div className="mb-7 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-12 w-12 items-center justify-center
                    rounded-2xl border-2
                  "
                  style={{
                    borderColor: COLORS.ink,
                    backgroundColor: COLORS.sand,
                  }}
                >
                  <span className="text-xl font-black"><img src="/mascot/logo.png" /></span>
                </div>

                <div>
                  <h2 className="text-xl font-black">
                    الصعيد بيحكى
                  </h2>

                  <p
                    className="mt-1 text-xs"
                    style={{ color: COLORS.muted }}
                  >
                    الحكاية ورا كل حاجة
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="إغلاق"
                style={{
                  borderColor: COLORS.ink,
                  color: COLORS.ink,
                }}
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-xl border-2 transition-transform
                  hover:rotate-90
                "
              >
                <X size={18} />
              </button>
            </div>

            {/* TITLE */}

            <div className="mb-5">
              <span
                className="text-[10px] font-black tracking-[0.25em]"
                style={{ color: COLORS.accent }}
              >
                WELCOME TO WAH
              </span>

              <h1 className="mt-3 text-3xl font-black leading-tight">
                كل حكاية
                <br />
                <span style={{ color: COLORS.accent }}>
                  وراها حكاية
                </span>
              </h1>

              <p
                className="mt-4 max-w-xs text-sm leading-7"
                style={{ color: COLORS.muted }}
              >
                اكتشف عالم صعيد مصر، حكايات ناسه، تراثه، منتجاته
                وأماكنه اللي تستاهل تتشاف.
              </p>
            </div>

            <Ornament colors={COLORS} />

            {/* VIDEO INFO */}

            <div className="mt-5 flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: COLORS.accent }}
              />

              <span
                className="text-xs font-bold"
                style={{ color: COLORS.muted }}
              >
                حكاية من قلب الصعيد
              </span>
            </div>

            {/* PROGRESS */}

            <div className="mt-4">
              <ProgressBar
                progress={progress}
                currentTime={currentTime}
                duration={duration}
                colors={COLORS}
                onSeek={seekFromPointer}
                draggingRef={draggingRef}
              />
            </div>

            {/* CONTROLS */}

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <InkButton
                  onClick={togglePlay}
                  title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                  colors={COLORS}
                >
                  {isPlaying ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} fill="currentColor" />
                  )}
                </InkButton>

                <InkButton
                  onClick={toggleMute}
                  title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
                  colors={COLORS}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </InkButton>

                <InkButton
                  onClick={restart}
                  title="إعادة الفيديو"
                  colors={COLORS}
                >
                  <RotateCcw size={17} />
                </InkButton>

                <InkButton
                  onClick={handleShareLink}
                  title={copiedLink ? 'تم نسخ الرابط!' : 'مشاركة أو نسخ رابط الفيلم (/film)'}
                  colors={COLORS}
                >
                  {copiedLink ? (
                    <Check size={18} className="text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Share2 size={17} />
                  )}
                </InkButton>
              </div>

              <InkButton
                onClick={toggleFullscreen}
                title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
                colors={COLORS}
              >
                {isFullscreen ? (
                  <Minimize size={18} />
                ) : (
                  <Maximize size={18} />
                )}
              </InkButton>
            </div>

            {/* DIRECT SHAREABLE LINK */}
            <button
              type="button"
              onClick={handleShareLink}
              title="اضغط لنسخ الرابط المباشر للفيلم"
              style={{
                borderColor: COLORS.ink,
                backgroundColor: COLORS.sand,
                color: COLORS.ink,
              }}
              className="
                mt-4 flex w-full items-center justify-between
                rounded-xl border-2 px-3.5 py-2.5 text-xs font-bold
                transition-all hover:brightness-95 active:scale-[0.98] cursor-pointer
              "
            >
              <div className="flex items-center gap-2 truncate">
                <Link2 size={15} className="shrink-0" />
                <span className="font-mono text-xs font-black tracking-wide" dir="ltr">
                  waaaaah.vercel.app/film
                </span>
              </div>
              <span
                className="text-xs font-black"
                style={{ color: copiedLink ? '#16a34a' : COLORS.accent }}
              >
                {copiedLink ? 'تم نسخ الرابط ✓' : 'مشاركة ونسخ الرابط'}
              </span>
            </button>

            {/* CTA */}

            <button
              type="button"
              onClick={goToPlatform}
              style={{
                backgroundColor: COLORS.ink,
                color: COLORS.paper,
                boxShadow: `4px 4px 0 ${COLORS.accent}`,
              }}
              className="
                mt-7 flex w-full items-center justify-center
                gap-3 rounded-xl py-4 text-sm font-black
                transition-all hover:-translate-y-1
                active:translate-y-[2px] active:shadow-none
              "
            >
              استكشف المنصة
              <ArrowLeft size={18} />
            </button>

            <p
              className="mt-5 text-center text-[10px] font-medium"
              style={{ color: COLORS.muted }}
            >
              وَه — العالم الرقمي لصعيد مصر
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IntroExperience;
