import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CraftReel } from '../../../types.ts';
import { ReelItem } from './ReelItem.tsx';
import { ChevronUp, ChevronDown, Film } from 'lucide-react';

interface ReelFeedProps {
  reels: CraftReel[];
  initialReelId?: string;
  onSelectProduct?: (productId: string) => void;
  onSelectSeller?: (sellerId: string) => void;
  onDeleteReel?: (reelId: string) => void;
  onClose?: () => void;
  showCloseButton?: boolean;
  hasBottomNav?: boolean;
}

export const ReelFeed: React.FC<ReelFeedProps> = ({
  reels,
  initialReelId,
  onSelectProduct,
  onSelectSeller,
  onDeleteReel,
  onClose,
  showCloseButton = false,
  hasBottomNav = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [reelsList, setReelsList] = useState<CraftReel[]>(reels);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  // Sync reels list
  useEffect(() => {
    setReelsList(reels);
  }, [reels]);

  // Set initial active index based on initialReelId
  useEffect(() => {
    if (initialReelId && reelsList.length > 0) {
      const idx = reelsList.findIndex((r) => r.id === initialReelId);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [initialReelId, reelsList]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < reelsList.length - 1 ? prev + 1 : prev));
  }, [reelsList.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in input, ignore
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, onClose]);

  // Touch Swipe Handlers (Vertical Mobile Gestures)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === null || touchEndY.current === null) return;
    const diff = touchStartY.current - touchEndY.current;

    // Minimum swipe threshold
    if (diff > 50) {
      // Swiped Up -> Next Reel
      goToNext();
    } else if (diff < -50) {
      // Swiped Down -> Prev Reel
      goToPrev();
    }

    touchStartY.current = null;
    touchEndY.current = null;
  };

  // Wheel scroll navigation with debounce
  const lastWheelTime = useRef<number>(0);
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 450) return;

    if (e.deltaY > 30) {
      lastWheelTime.current = now;
      goToNext();
    } else if (e.deltaY < -30) {
      lastWheelTime.current = now;
      goToPrev();
    }
  };

  const handleDeleteReel = (deletedId: string) => {
    const updated = reelsList.filter((r) => r.id !== deletedId);
    setReelsList(updated);
    if (onDeleteReel) onDeleteReel(deletedId);

    if (updated.length === 0 && onClose) {
      onClose();
    } else if (currentIndex >= updated.length) {
      setCurrentIndex(Math.max(0, updated.length - 1));
    }
  };

  if (reelsList.length === 0) {
    return (
      <div className="w-full h-[70vh] flex flex-col items-center justify-center text-center p-6 text-gray-400 space-y-3">
        <Film className="w-12 h-12 text-gray-500" />
        <p className="text-sm font-bold text-gray-300">لا توجد مقاطع ريلز متاحة حالياً</p>
      </div>
    );
  }

  const currentReel = reelsList[currentIndex];

  return (
    <div
      ref={containerRef}
      id="reels-feed-container"
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Centered Video Canvas Container (Desktop constraint: max-w-[420px]) */}
      <div className="relative w-full h-full sm:max-w-[420px] sm:h-[min(94dvh,860px)] sm:rounded-3xl overflow-hidden shadow-2xl bg-black border sm:border-white/10 flex flex-col justify-between">
        {currentReel && (
          <ReelItem
            key={currentReel.id}
            reel={currentReel}
            isActive={true}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted((prev) => !prev)}
            onSelectProduct={onSelectProduct}
            onSelectSeller={onSelectSeller}
            onDeleteReel={handleDeleteReel}
            onClose={onClose}
            showCloseButton={showCloseButton}
            reelIndex={currentIndex}
            totalReels={reelsList.length}
            hasBottomNav={hasBottomNav}
          />
        )}
      </div>

      {/* Desktop Next/Prev Floating Arrows on Side */}
      <div className="hidden md:flex flex-col gap-3 absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 z-40">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={goToPrev}
          className="p-3 rounded-full bg-black/60 hover:bg-black/90 text-white disabled:opacity-20 disabled:cursor-not-allowed border border-white/15 transition-all shadow-xl hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
          title="الفيديو السابق (سهم لأعلى)"
          aria-label="الفيديو السابق"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        <span className="text-[11px] font-bold text-center text-white/70">
          {currentIndex + 1} / {reelsList.length}
        </span>

        <button
          type="button"
          disabled={currentIndex === reelsList.length - 1}
          onClick={goToNext}
          className="p-3 rounded-full bg-black/60 hover:bg-black/90 text-white disabled:opacity-20 disabled:cursor-not-allowed border border-white/15 transition-all shadow-xl hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
          title="الفيديو التالي (سهم لأسفل)"
          aria-label="الفيديو التالي"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
