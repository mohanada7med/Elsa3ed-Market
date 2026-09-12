import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CraftReel } from '../../../types.ts';
import { ReelItem } from './ReelItem.tsx';
import { ChevronUp, ChevronDown, Film } from 'lucide-react';
import { getOptimizedVideoPoster } from '../../../utils/cloudinaryMedia.ts';

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

  // المتصفحات تبدأ التشغيل التلقائي فوراً وبدون أي تأخير عندما يكون الصوت مكتوماً في البداية
  const [isMuted, setIsMuted] = useState(false);
  const [reelsList, setReelsList] = useState<CraftReel[]>(reels);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasInitiallyScrolled = useRef<boolean>(false);
  const isScrollingRef = useRef<boolean>(false);

  useEffect(() => {
    setReelsList(reels);
  }, [reels]);

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

  const scrollToIndex = useCallback((targetIndex: number, smooth = true) => {
    if (targetIndex < 0 || targetIndex >= reelsList.length) return;
    const targetEl = itemRefs.current[targetIndex];
    if (targetEl) {
      isScrollingRef.current = true;
      targetEl.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'start'
      });
      setActiveIndex(targetIndex);
      setActiveReelId(reelsList[targetIndex]?.id || null);

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 400);
    }
  }, [reelsList]);

  useEffect(() => {
    if (hasInitiallyScrolled.current || reelsList.length === 0) return;

    let targetIdx = 0;
    if (initialReelId) {
      const foundIdx = reelsList.findIndex((r) => r.id === initialReelId);
      if (foundIdx !== -1) targetIdx = foundIdx;
    }

    const timeoutId = setTimeout(() => {
      scrollToIndex(targetIdx, false);
      hasInitiallyScrolled.current = true;
    }, 30);

    return () => clearTimeout(timeoutId);
  }, [initialReelId, reelsList, scrollToIndex]);

  // مراقبة الفيديو النشط بأداء أعلى
  useEffect(() => {
    const container = containerRef.current;
    if (!container || reelsList.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idxStr = entry.target.getAttribute('data-index');
            const reelId = entry.target.getAttribute('data-reel-id');
            if (idxStr !== null && reelId) {
              const idx = parseInt(idxStr, 10);
              if (!isNaN(idx) && idx !== activeIndex) {
                setActiveIndex(idx);
                setActiveReelId(reelId);
              }
            }
          }
        });
      },
      {
        root: container,
        threshold: [0.6]
      }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [reelsList, activeIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        overscrollBehavior: 'contain'
      }}
    >
      <div className="relative w-full h-full sm:max-w-[440px] sm:h-[min(94dvh,880px)] sm:rounded-3xl overflow-hidden shadow-2xl bg-black border sm:border-white/10 flex flex-col">
        <div
          ref={containerRef}
          className="reels-scroll-container w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth scrollbar-none"
          style={{
            height: '100%',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            scrollSnapType: 'y mandatory',
            touchAction: 'pan-y'
          }}
        >
          {reelsList.map((reel, idx) => {
            const isActive = activeIndex === idx;
            // يتم تحميل الفيديو النشط والسابق واللاحق فقط لتفادي تجميد الذاكرة وتسريع التشغيل اللحظي
            const shouldRenderMedia = Math.abs(activeIndex - idx) <= 1;

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
                  scrollSnapAlign: 'start',
                  scrollSnapStop: 'always'
                }}
              >
                {shouldRenderMedia ? (
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
                ) : (
                  // صورة الغلاف كبديل خفيف أثناء وجود الكرت بعيداً عن الشاشة
                  <img
                    src={getOptimizedVideoPoster(reel.videoUrl, reel.posterUrl || reel.productImage, 600)}
                    alt={reel.title}
                    className="w-full h-full object-cover opacity-60 filter blur-xs"
                    loading="lazy"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* أزرار التنقل للشاشات الكبيرة */}
      <div className="hidden md:flex flex-col items-center gap-3 absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 z-40">
        <button
          type="button"
          disabled={activeIndex === 0}
          onClick={() => scrollToIndex(activeIndex - 1)}
          className="p-3 rounded-full bg-black/60 hover:bg-black/90 text-white disabled:opacity-20 disabled:cursor-not-allowed border border-white/15 transition-all shadow-xl hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
          title="الفيديو السابق"
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
          title="الفيديو التالي"
          aria-label="الفيديو التالي"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};