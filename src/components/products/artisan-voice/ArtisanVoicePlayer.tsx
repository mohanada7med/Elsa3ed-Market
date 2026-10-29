import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { WAHPattern } from '../../../design-system/WAHPattern';
import { ArtisanIdentity } from './ArtisanIdentity';
import { AudioWaveform } from './AudioWaveform';
import { AudioControls } from './AudioControls';
import { ArtisanTranscript } from './ArtisanTranscript';
import { Mic, Headphones, Sparkles, PlusCircle, Edit3 } from 'lucide-react';
import { ArtisanVoiceRecorderModal } from '../../seller/ArtisanVoiceRecorderModal';

export interface ArtisanVoicePlayerProps {
  product?: Product | null;
  artisanName?: string;
  artisanPortrait?: string;
  artisanGovernorate?: string;
  artisanCraft?: string;
  audioUrl?: string;
  transcript?: string;
  audioDuration?: number;
  className?: string;
}

export const ArtisanVoicePlayer: React.FC<ArtisanVoicePlayerProps> = ({
  product,
  artisanName: propArtisanName,
  artisanPortrait: propArtisanPortrait,
  artisanGovernorate: propArtisanGovernorate,
  artisanCraft: propArtisanCraft,
  audioUrl: propAudioUrl,
  transcript: propTranscript,
  audioDuration: propAudioDuration,
  className = '',
}) => {
  const { sellers, currentRole, currentUser, setActivePage } = useApp();

  // Match corresponding seller profile if available
  const matchingSeller = useMemo(() => {
    if (!product?.sellerId || !sellers) return undefined;
    return sellers.find((s) => s.id === product.sellerId);
  }, [product?.sellerId, sellers]);

  // Resolve artisan identity fields with graceful fallbacks
  const artisanName =
    propArtisanName ||
    product?.artisanName ||
    matchingSeller?.name ||
    matchingSeller?.brandName ||
    product?.sellerName ||
    'صانع القطعة الحرفي';

  const artisanPortrait =
    propArtisanPortrait ||
    product?.artisanPortrait ||
    matchingSeller?.avatar ||
    matchingSeller?.coverImage;

  const artisanGovernorate =
    propArtisanGovernorate ||
    product?.artisanGovernorate ||
    matchingSeller?.governorate ||
    product?.sellerGovernorate ||
    product?.specifications?.originGovernorate ||
    'صعيد مصر';

  const artisanCraft =
    propArtisanCraft ||
    product?.artisanCraft ||
    matchingSeller?.specialty ||
    product?.specifications?.craftsmanship ||
    product?.categoryName ||
    'صناعة يدوية أصيلة';

  const audioUrl = propAudioUrl !== undefined ? propAudioUrl : product?.audioUrl;
  const transcript = propTranscript !== undefined ? propTranscript : product?.transcript;
  const defaultDuration =
    propAudioDuration !== undefined
      ? propAudioDuration
      : product?.audioDuration || 0;

  // Audio Playback State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(defaultDuration);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoadedOnce, setIsLoadedOnce] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);

  // Check strictly if current user is the owner seller of this product, or admin
  const isOwnerOrAdmin = useMemo(() => {
    if (!product || !currentUser) return false;
    if (currentRole === 'admin' || currentUser.role === 'admin') return true;
    if (currentRole === 'seller' || currentUser.role === 'seller') {
      const userSellerId = currentUser.sellerId || currentUser.id || (currentUser as any)?.seller?.id;
      return Boolean(
        userSellerId &&
        product.sellerId &&
        (userSellerId === product.sellerId || currentUser.id === product.sellerId)
      );
    }
    return false;
  }, [product, currentUser, currentRole]);

  // Global Audio Coordination across players
  const playerId = useMemo(
    () => `wah-player-${product?.id || Math.random().toString(36).substring(2, 7)}`,
    [product?.id]
  );

  useEffect(() => {
    const handleGlobalAudioPlay = (e: Event) => {
      const customEvt = e as CustomEvent<{ playerId: string }>;
      if (customEvt.detail?.playerId !== playerId && isPlaying) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('wah-audio-play', handleGlobalAudioPlay as EventListener);
      return () => {
        window.removeEventListener('wah-audio-play', handleGlobalAudioPlay as EventListener);
      };
    }
  }, [playerId, isPlaying]);

  // Audio Play / Pause handler
  const handlePlayPause = useCallback(() => {
    if (!audioUrl) return;

    if (!audioRef.current) return;

    if (hasError) {
      // Retry loading on error
      setHasError(false);
      setIsLoading(true);
      audioRef.current.load();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Dispatch global audio coordination event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('wah-audio-play', { detail: { playerId } })
        );
      }

      setIsLoadedOnce(true);
      setIsLoading(true);
      setIsEnded(false);

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch((err) => {
            console.warn('[ArtisanVoicePlayer] Playback was interrupted or blocked:', err);
            setIsPlaying(false);
            setIsLoading(false);
          });
      }
    }
  }, [audioUrl, hasError, isPlaying, playerId]);

  // Seek handler
  const handleSeek = useCallback(
    (targetTime: number) => {
      if (!audioRef.current || isNaN(targetTime)) return;
      const clamped = Math.max(0, Math.min(duration || 1000, targetTime));
      audioRef.current.currentTime = clamped;
      setCurrentTime(clamped);
      if (isEnded && clamped < duration) {
        setIsEnded(false);
      }
    },
    [duration, isEnded]
  );

  // Skip ± seconds
  const handleSkip = useCallback(
    (seconds: number) => {
      if (!audioRef.current) return;
      handleSeek(audioRef.current.currentTime + seconds);
    },
    [handleSeek]
  );

  // Volume & Mute Handlers
  const handleVolumeChange = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
    }
  }, [isMuted]);

  const handleToggleMute = useCallback(() => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  }, [isMuted]);

  // Synchronize audio element volume/mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Clean up audio on unmount
  useEffect(() => {
    const currentAudio = audioRef.current;
    return () => {
      if (currentAudio) {
        try {
          currentAudio.pause();
          currentAudio.src = '';
        } catch {
          // Ignore unmount error
        }
      }
    };
  }, []);

  const hasAudioRecording = Boolean(audioUrl && audioUrl.trim());

  return (
    <div
      className={`relative rounded-3xl border border-[#E0C79B] dark:border-primary/40 bg-gradient-to-br from-[#FFF9EE] via-[#F8EBD7]/60 to-[#FFF9EE] dark:from-[#26160D] dark:via-[#1B1009] dark:to-[#26160D] shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
      dir="rtl"
    >
      {/* Subtle Upper Egyptian Heritage Pattern Background (Low opacity, non-intrusive) */}
      <WAHPattern
        type="geometry"
        opacity={0.035}
        className="pointer-events-none absolute inset-0 z-0"
      />

      {/* Hidden Native Audio Element (Lazy loaded on user request) */}
      {hasAudioRecording && (
        <audio
          ref={audioRef}
          preload="none"
          crossOrigin="anonymous"
          src={isLoadedOnce || isPlaying ? audioUrl : undefined}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current && audioRef.current.duration) {
              setDuration(audioRef.current.duration);
            }
            setIsLoading(false);
          }}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => {
            setIsLoading(false);
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setIsEnded(true);
            setCurrentTime(0);
          }}
          onError={(e) => {
            console.error('[ArtisanVoicePlayer] Audio loading error:', e);
            setHasError(true);
            setIsLoading(false);
            setIsPlaying(false);
          }}
        />
      )}

      {/* Main Content Area */}
      <div className="relative z-10 p-5 sm:p-7 md:p-8 space-y-5 sm:space-y-6">
        {/* Editorial Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-amber-900/10 dark:border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-700/10 dark:bg-amber-400/10 text-amber-800 dark:text-amber-300 border border-amber-700/20 dark:border-amber-400/20 text-xs font-black tracking-wide mb-1.5">
              <Headphones size={13} className="text-amber-700 dark:text-amber-400" />
              <span>صوت الحرفي • VOICE OF THE ARTISAN</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-espresso dark:text-cream leading-tight">
              اسمع حكاية الصنعة
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs sm:text-sm font-medium text-secondary dark:text-cream/80 max-w-xs">
              كل قطعة وراها حكاية.. اسمعها من صاحبها.
            </p>

            {/* Seller / Artisan Voice Recording Action - ONLY visible to the product owner or admin */}
            {product && isOwnerOrAdmin && (
              <button
                type="button"
                onClick={() => setIsRecorderOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-700/10 hover:bg-amber-700 hover:text-white dark:bg-amber-400/10 dark:hover:bg-amber-500 text-amber-800 dark:text-amber-300 dark:hover:text-black border border-amber-700/20 dark:border-amber-400/20 text-xs font-bold transition-all cursor-pointer shrink-0"
                title="خاص بصاحب المنتج: تسجيل أو تعديل صوت الورشة"
              >
                <Mic size={13} />
                <span>{hasAudioRecording ? 'تعديل تسجيل صوتك' : 'سجل صوتك للقطعة'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Artisan Identity Card */}
        <ArtisanIdentity
          artisanName={artisanName}
          artisanPortrait={artisanPortrait}
          artisanGovernorate={artisanGovernorate}
          artisanCraft={artisanCraft}
          isPlaying={isPlaying}
        />

        {/* Conditional Playback vs Honest Empty State */}
        {hasAudioRecording ? (
          <div className="space-y-4 pt-1">
            {/* Animated Waveform Display */}
            <AudioWaveform
              audioRef={audioRef}
              isPlaying={isPlaying}
              duration={duration}
              currentTime={currentTime}
              onSeek={handleSeek}
              barCount={32}
            />

            {/* Interactive Player Controls */}
            <AudioControls
              isPlaying={isPlaying}
              isLoading={isLoading}
              isEnded={isEnded}
              hasError={hasError}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              isMuted={isMuted}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onVolumeChange={handleVolumeChange}
              onToggleMute={handleToggleMute}
              onSkip={handleSkip}
            />

            {/* Expandable Authentic Spoken Transcript */}
            {transcript && (
              <ArtisanTranscript
                transcript={transcript}
                artisanName={artisanName}
                productTitle={product?.title}
              />
            )}
          </div>
        ) : (
          /* Honest Empty State when Audio is Pending Documentation */
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/5 dark:bg-black/25 border border-amber-900/10 dark:border-white/10 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-600/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                <Mic size={18} />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-black text-espresso dark:text-cream">
                  تسجيل الورشة قيد التوثيق
                </h4>
                <p className="text-xs sm:text-sm text-secondary dark:text-cream/80 leading-relaxed">
                  فريق منصة «وه» وحرفيو الصعيد يعملون على توثيق سر الصنعة. التسجيل الصوتي للحرفي سيكون متاحاً هنا للاستماع قريباً.
                </p>
              </div>
            </div>

            {/* Quick Seller / Artisan Action: ONLY for owner seller or admin */}
            {product && isOwnerOrAdmin ? (
              <div className="pt-2 border-t border-amber-900/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                  بصفتك البائع صاحب هذه القطعة، يمكنك توثيق صوت ورشتك وسر الصنعة الآن مباشرة لتظهر لجميع المشترين:
                </span>
                <button
                  type="button"
                  onClick={() => setIsRecorderOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <Mic size={14} />
                  <span>سجل صوت ورشتك الآن</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-amber-900/10 dark:border-white/10">
                <span className="text-[11px] text-black/50 dark:text-white/40">
                  🔊 بمجرد قيام الحرفي صاحب القطعة بتسجيل صوته، ستتمكن من الاستماع إليه مباشرة هنا.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Seller-Only Voice Recorder Modal */}
      {product && isRecorderOpen && (
        <ArtisanVoiceRecorderModal
          isOpen={isRecorderOpen}
          onClose={() => setIsRecorderOpen(false)}
          product={product}
          onSaved={() => {
            setIsRecorderOpen(false);
          }}
        />
      )}
    </div>
  );
};

