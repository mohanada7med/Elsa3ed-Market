import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface AudioWaveformProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  onSeek: (targetTime: number) => void;
  barCount?: number;
  className?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioRef,
  isPlaying,
  duration,
  currentTime,
  onSeek,
  barCount = 32,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const isDraggingRef = useRef(false);

  // Web Audio API refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const hasAnalyserRef = useRef(false);

  // Smooth lerp animation values
  const heightsRef = useRef<number[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Initialize resting heights
  useEffect(() => {
    const resting: number[] = [];
    for (let i = 0; i < barCount; i++) {
      // Natural arch resting baseline reflecting handcrafted vocal curve
      const arch = Math.sin((i / (barCount - 1)) * Math.PI);
      resting.push(16 + arch * 12);
    }
    heightsRef.current = resting;
  }, [barCount]);

  // Lazy Web Audio API initialization when user starts playback
  const setupWebAudio = useCallback(() => {
    if (hasAnalyserRef.current || !audioRef.current || typeof window === 'undefined') return;

    try {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      if (!sourceNodeRef.current && audioRef.current) {
        // Wrap createMediaElementSource in try-catch in case of CORS or existing connection
        try {
          const source = ctx.createMediaElementSource(audioRef.current);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64; // Gives 32 frequency bins
          analyser.smoothingTimeConstant = 0.8;

          source.connect(analyser);
          analyser.connect(ctx.destination);

          sourceNodeRef.current = source;
          analyserRef.current = analyser;
          hasAnalyserRef.current = true;
        } catch (mediaErr) {
          // If CORS fails or source already connected, fallback gracefully to mathematical cadence
          hasAnalyserRef.current = false;
        }
      }
    } catch {
      hasAnalyserRef.current = false;
    }
  }, [audioRef]);

  // Clean up Web Audio resources on unmount
  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      try {
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
        }
      } catch {
        // Ignore unmount close errors
      }
    };
  }, []);

  // Main Waveform Animation Loop
  useEffect(() => {
    if (isPlaying) {
      setupWebAudio();
    }

    let isRunning = true;
    const freqData = new Uint8Array(32);

    const updateLoop = () => {
      if (!isRunning) return;

      const analyser = analyserRef.current;
      const audioEl = audioRef.current;
      const t = audioEl ? audioEl.currentTime : 0;
      const hasRealAudioData = hasAnalyserRef.current && analyser && isPlaying;

      if (hasRealAudioData) {
        try {
          analyser.getByteFrequencyData(freqData);
        } catch {
          // Fallback if read fails
        }
      }

      for (let i = 0; i < barCount; i++) {
        let targetHeight = 16;

        if (prefersReducedMotion) {
          // Static calm waveform for users with motion sensitivity
          targetHeight = 20 + Math.sin((i / (barCount - 1)) * Math.PI) * 25;
        } else if (isPlaying) {
          if (hasRealAudioData) {
            // Map frequencies to human vocal range (~100Hz - 3kHz)
            const binIdx = Math.min(31, Math.floor((i / barCount) * 24));
            const rawVal = freqData[binIdx] || 0;
            // Bell curve emphasis on mid frequencies (human speech resonance)
            const voiceWeight = 0.7 + 0.3 * Math.sin((i / barCount) * Math.PI);
            targetHeight = Math.min(96, Math.max(14, (rawVal / 255) * 85 * voiceWeight + 12));
          } else {
            // Elegant organic vocal cadence fallback synchronized strictly with playback timeline
            const v1 = Math.sin(t * 4.2 + i * 0.45) * 0.35;
            const v2 = Math.cos(t * 2.1 - i * 0.32) * 0.28;
            const voicePauseMod = Math.sin(t * 1.1) > -0.7 ? 1 : 0.25;
            const arch = Math.sin((i / (barCount - 1)) * Math.PI);
            targetHeight = Math.min(94, Math.max(14, (v1 + v2 + 0.5) * 75 * voicePauseMod * (0.6 + arch * 0.4) + 14));
          }
        } else {
          // Settled resting state when paused
          const arch = Math.sin((i / (barCount - 1)) * Math.PI);
          targetHeight = 16 + arch * 12;
        }

        // Smooth spring-like lerp to target height
        const current = heightsRef.current[i] || 16;
        const lerpFactor = isPlaying ? 0.25 : 0.12;
        const next = current + (targetHeight - current) * lerpFactor;
        heightsRef.current[i] = next;

        // Directly update DOM element style to avoid React rerender churn
        const barEl = barsRef.current[i];
        if (barEl) {
          barEl.style.height = `${next.toFixed(1)}%`;
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(updateLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(updateLoop);

    return () => {
      isRunning = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isPlaying, prefersReducedMotion, barCount, setupWebAudio, audioRef]);

  // Calculate seek position from click or drag (RTL-aware)
  const handleSeekFromPointer = useCallback(
    (clientX: number) => {
      if (!containerRef.current || duration <= 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;

      // In Arabic RTL, bar 0 is on the right, bar 31 on the left
      const relativeX = clientX - rect.left;
      const fraction = 1 - Math.max(0, Math.min(1, relativeX / rect.width));
      const targetTime = fraction * duration;
      onSeek(targetTime);
    },
    [duration, onSeek]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    handleSeekFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    handleSeekFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe ignore
      }
    }
  };

  const progressFraction = duration > 0 ? Math.max(0, Math.min(1, currentTime / duration)) : 0;

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label="مخطط الصوت التفاعلي للتقديم والتأخير"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(currentTime)}
      aria-valuetext={`${Math.round(currentTime)} ثانية من ${Math.round(duration)} ثانية`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          // RTL: ArrowLeft advances forward
          onSeek(Math.min(duration, currentTime + 5));
        } else if (e.key === 'ArrowRight') {
          // RTL: ArrowRight steps backward
          onSeek(Math.max(0, currentTime - 5));
        } else if (e.key === 'Home') {
          onSeek(0);
        } else if (e.key === 'End') {
          onSeek(duration);
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      dir="rtl"
      className={`relative w-full h-14 sm:h-16 flex items-center justify-between gap-[3px] sm:gap-1.5 px-2 py-1 rounded-2xl bg-amber-950/5 dark:bg-black/30 border border-amber-900/10 dark:border-white/10 cursor-pointer touch-none select-none transition-colors duration-200 hover:border-amber-700/30 focus:outline-none focus:ring-2 focus:ring-[#C99444] ${className}`}
      title="اضغط على أي جزء للتخطي داخل التسجيل"
    >
      {Array.from({ length: barCount }).map((_, i) => {
        // In RTL, bar 0 is rightmost. Progress fraction is between 0 and 1.
        const barFraction = i / (barCount - 1);
        const isPlayed = barFraction <= progressFraction;

        return (
          <div
            key={i}
            className="flex-1 h-full flex items-center justify-center pointer-events-none"
          >
            <div
              ref={(el) => {
                barsRef.current[i] = el;
              }}
              style={{ height: '18%' }}
              className={`w-full max-w-[5px] sm:max-w-[7px] rounded-full transition-[background-color] duration-150 ${
                isPlayed
                  ? 'bg-gradient-to-t from-amber-700 via-orange-600 to-amber-500 dark:from-amber-500 dark:via-orange-500 dark:to-amber-300 shadow-2xs'
                  : 'bg-[#D6C6B1]/70 dark:bg-white/20'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
};

