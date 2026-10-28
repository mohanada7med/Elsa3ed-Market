import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Volume1,
  VolumeX,
  Loader2,
  RotateCw,
  AlertCircle
} from 'lucide-react';

export interface AudioControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  isEnded: boolean;
  hasError: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onSkip: (seconds: number) => void;
  className?: string;
}

export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  isLoading,
  isEnded,
  hasError,
  currentTime,
  duration,
  volume,
  isMuted,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onSkip,
  className = '',
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const effectiveDuration = duration > 0 ? duration : 0;
  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <div className={`space-y-3.5 select-none ${className}`} dir="rtl">
      {/* Error Notice */}
      {hasError && (
        <div
          role="alert"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-bold"
        >
          <AlertCircle size={15} className="shrink-0 text-red-600 dark:text-red-400" />
          <span>تعذر تشغيل التسجيل الصوتي حالياً. يرجى التأكد من اتصال الإنترنت والمحاولة لاحقاً.</span>
        </div>
      )}

      {/* Primary Control Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Play / Pause / Replay & Skip Group */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Main Action Button */}
          <button
            type="button"
            onClick={onPlayPause}
            disabled={isLoading && !isPlaying}
            aria-label={
              isEnded
                ? 'إعادة استماع حكاية الحرفي'
                : isPlaying
                ? 'إيقاف مؤقت'
                : 'اسمع الحكاية'
            }
            title={
              isEnded
                ? 'إعادة استماع حكاية الحرفي'
                : isPlaying
                ? 'إيقاف مؤقت'
                : 'اسمع الحكاية'
            }
            className="group relative inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-gradient-to-r from-amber-700 via-orange-600 to-amber-600 hover:from-amber-800 hover:via-orange-700 hover:to-amber-700 text-white font-black text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C99444]"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin text-white" />
            ) : isEnded ? (
              <RotateCcw size={18} className="text-white" />
            ) : isPlaying ? (
              <Pause size={18} className="text-white fill-white" />
            ) : (
              <Play size={18} className="text-white fill-white ml-0.5" />
            )}

            <span>
              {isLoading
                ? 'جاري التحميل...'
                : isEnded
                ? 'إعادة الاستماع'
                : isPlaying
                ? 'إيقاف مؤقت'
                : 'اسمع الحكاية'}
            </span>
          </button>

          {/* Skip Backward 5s */}
          <button
            type="button"
            onClick={() => onSkip(-5)}
            disabled={!duration || isNaN(duration)}
            aria-label="تراجع ٥ ثوانٍ"
            title="تراجع ٥ ثوانٍ"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-espresso dark:text-cream text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <RotateCcw size={15} />
          </button>

          {/* Skip Forward 5s */}
          <button
            type="button"
            onClick={() => onSkip(5)}
            disabled={!duration || isNaN(duration)}
            aria-label="تقديم ٥ ثوانٍ"
            title="تقديم ٥ ثوانٍ"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-espresso dark:text-cream text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <RotateCw size={15} />
          </button>
        </div>

        {/* Timestamp and Volume Controls */}
        <div className="flex items-center gap-3">
          {/* Digital Time Display */}
          <div
            className="flex items-center gap-1 font-mono text-xs sm:text-sm font-bold text-espresso/80 dark:text-cream/80"
            aria-live="off"
          >
            <span className="text-amber-700 dark:text-amber-400">
              {formatTime(currentTime)}
            </span>
            <span className="text-secondary/60 dark:text-cream/40">/</span>
            <span>{formatTime(effectiveDuration)}</span>
          </div>

          {/* Volume Control */}
          <div
            className="relative flex items-center"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={isMuted || volume === 0 ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
              title={isMuted || volume === 0 ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-espresso dark:text-cream transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={16} className="text-red-600 dark:text-red-400" />
              ) : volume < 0.5 ? (
                <Volume1 size={16} />
              ) : (
                <Volume2 size={16} />
              )}
            </button>

            {/* Accessible Volume Slider Popup */}
            {showVolumeSlider && (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-xl bg-white dark:bg-espresso-800 shadow-xl border border-primary/20 flex flex-col items-center gap-1 z-20 animate-in fade-in zoom-in-95 duration-150"
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  aria-label="مستوى الصوت"
                  className="w-20 h-1.5 accent-amber-600 dark:accent-amber-400 bg-black/10 dark:bg-white/20 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] font-mono font-bold text-secondary dark:text-cream/70">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Linear Scrubable Progress Track (Companion to Waveform) */}
      <div className="relative w-full">
        <input
          type="range"
          min="0"
          max={effectiveDuration || 100}
          step="0.1"
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          disabled={!effectiveDuration}
          aria-label="شريط تقدم التسجيل الصوتي"
          aria-valuemin={0}
          aria-valuemax={Math.round(effectiveDuration)}
          aria-valuenow={Math.round(currentTime)}
          aria-valuetext={`${formatTime(currentTime)} من ${formatTime(effectiveDuration)}`}
          className="w-full h-1.5 bg-[#E0C79B]/50 dark:bg-white/15 rounded-lg appearance-none cursor-pointer accent-amber-700 dark:accent-amber-500 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-[#C99444]"
          style={{
            background: `linear-gradient(to left, #C99444 0%, #E66A2E ${progressPercent}%, rgba(224,199,155,0.4) ${progressPercent}%, rgba(224,199,155,0.4) 100%)`
          }}
        />
      </div>
    </div>
  );
};

