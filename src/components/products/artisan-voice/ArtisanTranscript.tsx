import React, { useState } from 'react';
import {
  Quote,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Share2,
  Sparkles
} from 'lucide-react';

export interface ArtisanTranscriptProps {
  transcript: string;
  artisanName: string;
  productTitle?: string;
  className?: string;
}

export const ArtisanTranscript: React.FC<ArtisanTranscriptProps> = ({
  transcript,
  artisanName,
  productTitle = '',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  if (!transcript || !transcript.trim()) {
    return null;
  }

  const handleCopyTranscript = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(transcript.trim());
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2200);
      }
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = transcript.trim();
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2200);
      } catch {
        // Safe ignore
      }
      document.body.removeChild(textarea);
    }
  };

  const handleShareStory = async () => {
    const shareTitle = `حكاية ${artisanName} — منصة وه`;
    const shareText = `اسمع واقرأ حكاية ${artisanName} عن صنع ${productTitle || 'هذه القطعة التراثية'}:\n"${transcript.trim().slice(0, 140)}..."`;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        // If aborted by user, do nothing; else fall back to clipboard
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: Copy share message to clipboard
    try {
      const fullShareText = `${shareTitle}\n\n${shareText}\n\n${shareUrl}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullShareText);
        setShareFeedback('تم نسخ رابط الحكاية للمشاركة!');
        setTimeout(() => setShareFeedback(null), 2500);
      }
    } catch {
      // Safe ignore
    }
  };

  return (
    <div
      className={`border-t border-amber-900/10 dark:border-white/10 pt-4 select-none ${className}`}
      dir="rtl"
    >
      {/* Header & Toggle Button */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          aria-controls="artisan-transcript-content"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-espresso dark:text-cream hover:text-primary dark:hover:text-[#C99444] transition-colors cursor-pointer group focus:outline-none focus:ring-1 focus:ring-primary rounded-lg px-1.5 py-1 -mr-1.5"
        >
          <Quote size={16} className="text-[#C99444] shrink-0 rotate-180" />
          <span>{isExpanded ? 'إخفاء كلام الحرفي' : 'اقرأ كلام الحرفي'}</span>
          {isExpanded ? (
            <ChevronUp size={16} className="text-secondary dark:text-cream/60 transition-transform group-hover:-translate-y-0.5" />
          ) : (
            <ChevronDown size={16} className="text-secondary dark:text-cream/60 transition-transform group-hover:translate-y-0.5" />
          )}
        </button>

        {/* Action Buttons (Copy & Share) */}
        <div className="flex items-center gap-1.5">
          {/* Share Feedback Toast / Pill */}
          {shareFeedback && (
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 animate-in fade-in duration-150">
              {shareFeedback}
            </span>
          )}

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyTranscript}
            aria-label="نسخ كلام الحرفي"
            title="نسخ الحكاية"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-espresso dark:text-cream text-xs font-bold transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {isCopied ? (
              <>
                <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-300">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy size={13} className="text-secondary dark:text-cream/70" />
                <span>نسخ الحكاية</span>
              </>
            )}
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShareStory}
            aria-label="مشاركة حكاية الحرفي"
            title="شارك الحكاية"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-espresso dark:text-cream text-xs font-bold transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <Share2 size={13} className="text-secondary dark:text-cream/70" />
            <span className="hidden xs:inline">شارك الحكاية</span>
          </button>
        </div>
      </div>

      {/* Expandable Transcript Body */}
      {isExpanded && (
        <div
          id="artisan-transcript-content"
          className="mt-3.5 p-4 sm:p-5 rounded-2xl bg-amber-950/5 dark:bg-black/25 border-r-4 border-[#C99444] dark:border-[#C99444]/80 text-espresso/90 dark:text-cream/95 text-sm sm:text-base font-normal leading-relaxed sm:leading-loose animate-in fade-in slide-in-from-top-2 duration-200 select-text"
        >
          <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-amber-700 dark:text-amber-400 select-none">
            <Sparkles size={13} />
            <span>الحكاية المنطوقة بلسان صانعها:</span>
          </div>

          <p className="whitespace-pre-line font-serif italic text-espresso/90 dark:text-cream/95">
            "{transcript.trim()}"
          </p>

          <div className="mt-3 text-left text-xs font-bold text-secondary dark:text-cream/60 select-none">
            — {artisanName}
          </div>
        </div>
      )}
    </div>
  );
};

