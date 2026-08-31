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
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [reelsList, setReelsList] = useState<CraftReel[]>(reels);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasInitiallyScrolled = useRef<boolean>(false);
  const lastWheelTime = useRef<number>(0);

  // Sync reels list with incoming prop
  useEffect(() => {
    setReelsList(reels);
  }, [reels]);

  // Set initial active reel id and index
  useEffect(() => {
    if (reelsList.length === 0) return;
    if (initialReelId) {
      const idx = reelsList.findIndex((r) => r.id === initialReelId);
      if (idx !== -1) {
        setActiveIndex(idx);
        setActiveReelId(initialReelId);
        return;
      }
    }
    setActiveIndex(0);
    setActiveReelId(reelsList[0].id);
  }, [initialReelId, reelsList]);

  // Scroll to target reel index
  const scrollToIndex = useCallback((targetIndex: number, smooth = true) => {
    if (targetIndex < 0 || targetIndex >= reelsList.length) return;
    const targetEl = itemRefs.current[targetIndex];
    if (targetEl) {
      targetEl.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'start'
      });
      setActiveIndex(targetIndex);
      setActiveReelId(reelsList[targetIndex]?.id || null);
    }
  }, [reelsList]);

  // Initial scroll to target reel on mount / load
  useEffect(() => {
    if (hasInitiallyScrolled.current || reelsList.length === 0) return;

    let targetIdx = 0;
    if (initialReelId) {
      const foundIdx = reelsList.findIndex((r) => r.id === initialReelId);
      if (foundIdx !== -1) targetIdx = foundIdx;
    }

    // Scroll without animation on first load
    const timeoutId = setTimeout(() => {
      scrollToIndex(targetIdx, false);
      hasInitiallyScrolled.current = true;
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [initialReelId, reelsList, scrollToIndex]);

  // IntersectionObserver: Detects which reel is currently in view (threshold: 60%)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || reelsList.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idxStr = entry.target.getAttribute('data-index');
            const reelId = entry.target.getAttribute('data-reel-id');
            if (idxStr !== null && reelId) {
              const idx = parseInt(idxStr, 10);
              if (!isNaN(idx)) {
                setActiveIndex(idx);
                setActiveReelId(reelId);
              }
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6
      }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [reelsList]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is typing in an input or textarea, skip
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowDown' || e.key === 'j' || e.key === 'PageDown') {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'PageUp') {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        scrollToIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        scrollToIndex(reelsList.length - 1);
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, reelsList.length, scrollToIndex, onClose]);

  // Mouse wheel navigation with debounce for desktop
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Only intercept if delta is significant to prevent erratic jumping
    const now = Date.now();
    if (now - lastWheelTime.current < 450) return;

    if (e.deltaY > 35 && activeIndex < reelsList.length - 1) {
      lastWheelTime.current = now;
      scrollToIndex(activeIndex + 1);
    } else if (e.deltaY < -35 && activeIndex > 0) {
      lastWheelTime.current = now;
      scrollToIndex(activeIndex - 1);
    }
  };

  const handleDeleteReel = (deletedId: string) => {
    const updated = reelsList.filter((r) => r.id !== deletedId);
    setReelsList(updated);
    if (onDeleteReel) onDeleteReel(deletedId);

    if (updated.length === 0 && onClose) {
      onClose();
    } else if (activeIndex >= updated.length) {
      const nextIdx = Math.max(0, updated.length - 1);
      scrollToIndex(nextIdx);
    }
  };

  if (reelsList.length === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 text-gray-400 space-y-3 bg-black">
        <Film className="w-12 h-12 text-gray-500" />
        <p className="text-sm font-bold text-gray-300">لا توجد مقاطع ريلز متاحة حالياً</p>
      </div>
    );
  }

  return (
    <div
      id="reels-feed-container"
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black select-none"
      style={{
        height: '100dvh',
        maxHeight: '100dvh',
        overscrollBehavior: 'contain',
        overscrollBehaviorY: 'contain'
      }}
      onWheel={handleWheel}
    >
      {/* Centered Phone Canvas Wrapper (Full screen on mobile, phone-sized card on desktop) */}
      <div className="relative w-full h-full sm:max-w-[420px] sm:h-[min(94dvh,860px)] sm:rounded-3xl overflow-hidden shadow-2xl bg-black border sm:border-white/10 flex flex-col">
        {/* Dedicated Vertical Scroll Snap Container */}
        <div
          ref={containerRef}
          className="reels-scroll-container w-full h-full overflow-y-scroll overscroll-contain snap-y snap-mandatory scroll-smooth scrollbar-none"
          style={{
            height: '100%',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            overscrollBehaviorY: 'contain',
            scrollSnapType: 'y mandatory',
            touchAction: 'pan-y'
          }}
        >
          {reelsList.map((reel, idx) => {
            const isActive = activeIndex === idx;
            return (
              <div
                key={reel.id}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                data-reel-id={reel.id}
                data-index={idx}
                className="reel-snap-item w-full h-full min-h-[100dvh] sm:min-h-full snap-start snap-always shrink-0 relative flex items-center justify-center bg-black overflow-hidden"
                style={{
                  height: '100%',
                  minHeight: '100%',
                  maxHeight: '100%',
                  scrollSnapAlign: 'start',
                  scrollSnapStop: 'always',
                  overscrollBehavior: 'contain',
                  overscrollBehaviorY: 'contain'
                }}
              >
                <ReelItem
                  reel={reel}
                  isActive={isActive}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted((prev) => !prev)}
                  onSelectProduct={onSelectProduct}
                  onSelectSeller={onSelectSeller}
                  onDeleteReel={handleDeleteReel}
                  onClose={onClose}
                  showCloseButton={showCloseButton}
                  reelIndex={idx}
                  totalReels={reelsList.length}
                  hasBottomNav={hasBottomNav}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Next/Prev Floating Navigation Pill on Side */}
      <div className="hidden md:flex flex-col items-center gap-3 absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 z-40">
        <button
          type="button"
          disabled={activeIndex === 0}
          onClick={() => scrollToIndex(activeIndex - 1)}
          className="p-3 rounded-full bg-black/60 hover:bg-black/90 text-white disabled:opacity-20 disabled:cursor-not-allowed border border-white/15 transition-all shadow-xl hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
          title="الفيديو السابق (سهم لأعلى)"
          aria-label="الفيديو السابق"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        <span className="text-[11px] font-bold text-center text-white/80 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-xs border border-white/10">
          {activeIndex + 1} / {reelsList.length}
        </span>

        <button
          type="button"
          disabled={activeIndex === reelsList.length - 1}
          onClick={() => scrollToIndex(activeIndex + 1)}
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

