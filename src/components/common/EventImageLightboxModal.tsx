import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  ExternalLink,
  Sparkles,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';

export interface EventImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  coverImage?: string;
  title?: string;
}

export const EventImageLightboxModal: React.FC<EventImageLightboxProps> = ({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
  coverImage,
  title = 'عرض الصور'
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const thumbnailsRef = useRef<HTMLDivElement | null>(null);

  // Sync initial index
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
      setIsZoomed(false);
    }
  }, [isOpen, initialIndex, images.length]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const currentImage = images[currentIndex] || '';
  const isCurrentCover = Boolean(coverImage && currentImage === coverImage);

  // Navigation handlers
  const handleNext = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        // RTL: ArrowRight goes to next or prev
        handlePrev();
      } else if (e.key === 'ArrowLeft') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (!thumbnailsRef.current) return;
    const activeEl = thumbnailsRef.current.children[currentIndex] as HTMLElement | undefined;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentIndex]);

  const handleDownload = async (url: string) => {
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `wah-event-image-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleShare = async (url: string) => {
    if (typeof window === 'undefined') return;
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: `صورة من ${title}`,
          url
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
    } catch {}
  };

  if (!mounted || !isOpen || images.length === 0 || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      dir="rtl"
      className="fixed inset-0 z-[9999999] flex flex-col justify-between bg-black/95 text-white select-none overflow-hidden backdrop-blur-2xl animate-in fade-in duration-300"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Blurred dynamic background from current image */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
        <img
          src={currentImage}
          alt=""
          className="h-full w-full object-cover scale-150 blur-3xl"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* TOP HEADER */}
      <header className="relative z-30 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-bold backdrop-blur-md">
              <ImageIcon size={13} className="text-primary" />
              <span>{currentIndex + 1} / {images.length}</span>
            </span>

            {isCurrentCover && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-black text-xs font-black shadow-md backdrop-blur-md">
                <Sparkles size={12} />
                <span>صورة الغلاف الرسمية</span>
              </span>
            )}
          </div>

          <h2 className="hidden sm:block text-sm font-bold text-white/90 truncate max-w-md font-serif">
            {title}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleDownload(currentImage)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-primary hover:text-black border border-white/15 transition-all cursor-pointer backdrop-blur-md active:scale-95"
            title="تحميل الصورة عالية الدقة"
          >
            <Download size={16} />
          </button>

          <button
            type="button"
            onClick={() => handleShare(currentImage)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-primary hover:text-black border border-white/15 transition-all cursor-pointer backdrop-blur-md active:scale-95"
            title="مشاركة الصورة"
          >
            <Share2 size={16} />
          </button>

          <a
            href={currentImage}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-primary hover:text-black border border-white/15 transition-all cursor-pointer backdrop-blur-md active:scale-95"
            title="فتح الرابط الأصلي في نافذة جديدة"
          >
            <ExternalLink size={16} />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-rose-600 border border-white/20 transition-all cursor-pointer backdrop-blur-md active:scale-95 text-white"
            title="إغلاق (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* MAIN STAGE (Central Image Viewer) */}
      <div
        className="relative z-20 flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden cursor-zoom-in"
        onClick={() => setIsZoomed((prev) => !prev)}
      >
        {/* Prev Arrow */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute right-4 sm:right-8 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 hover:bg-primary hover:text-black border border-white/20 text-white backdrop-blur-xl transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-2xl"
            title="الصورة السابقة (سهم يمين)"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* The Image */}
        <div className="relative max-h-[76vh] max-w-[92vw] flex items-center justify-center">
          <img
            key={currentImage}
            src={currentImage}
            alt={title}
            className={`
              max-h-[76vh] max-w-[92vw] object-contain rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]
              transition-all duration-300 ease-out select-none
              ${isZoomed ? 'scale-125 cursor-zoom-out' : 'scale-100'}
            `}
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Next Arrow */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute left-4 sm:left-8 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 hover:bg-primary hover:text-black border border-white/20 text-white backdrop-blur-xl transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-2xl"
            title="الصورة التالية (سهم يسار)"
          >
            <ChevronLeft size={24} />
          </button>
        )}
      </div>

      {/* BOTTOM THUMBNAILS CAROUSEL */}
      <footer className="relative z-30 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
        <div className="mx-auto max-w-4xl">
          {images.length > 1 && (
            <div
              ref={thumbnailsRef}
              className="flex items-center justify-center gap-2.5 overflow-x-auto py-2 no-scrollbar px-4"
            >
              {images.map((img, idx) => {
                const isActive = idx === currentIndex;
                const isCoverThumb = Boolean(coverImage && img === coverImage);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsZoomed(false);
                      setCurrentIndex(idx);
                    }}
                    className={`
                      relative shrink-0 h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden
                      border transition-all duration-300 cursor-pointer
                      ${
                        isActive
                          ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-black scale-105 shadow-lg shadow-primary/30'
                          : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white/50'
                      }
                    `}
                  >
                    <img
                      src={img}
                      alt={`مصغرة ${idx + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    {isCoverThumb && (
                      <span className="absolute bottom-0 inset-x-0 bg-primary/90 text-black text-[8px] font-black text-center py-0.5 leading-none">
                        غلاف
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-2 text-center text-[11px] text-white/50 font-medium">
            <span>انقر على الصورة للتكبير • استخدم مفاتيح الأسهم للتنقل • زر Esc للإغلاق</span>
          </div>
        </div>
      </footer>
    </div>,
    document.body
  );
};
