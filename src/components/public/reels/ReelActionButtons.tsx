import React from 'react';
import { useApp } from '../../../context/AppContext.tsx';
import { CraftReel } from '../../../types.ts';
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Trash2,
  Check
} from 'lucide-react';

interface ReelActionButtonsProps {
  reel: CraftReel;
  isLiked: boolean;
  likesCount: number;
  isMuted: boolean;
  copiedLink: boolean;
  canDelete: boolean;
  onLike: () => void;
  onOpenComments: () => void;
  onShare: () => void;
  onToggleMute: () => void;
  onRequestDelete: () => void;
}

export const ReelActionButtons: React.FC<ReelActionButtonsProps> = ({
  reel,
  isLiked,
  likesCount,
  isMuted,
  copiedLink,
  canDelete,
  onLike,
  onOpenComments,
  onShare,
  onToggleMute,
  onRequestDelete
}) => {
  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <div
      className="flex flex-col items-center gap-3 select-none pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Like Button */}
      <button
        type="button"
        id={`reel-like-btn-${reel.id}`}
        onClick={onLike}
        className="flex flex-col items-center gap-1 group cursor-pointer"
        aria-label={isLiked ? 'إلغاء الإعجاب' : 'إعجاب'}
      >
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center sm:backdrop-blur-md border transition-all duration-200 active:scale-75 ${
            isLiked
              ? 'bg-rose-600/90 border-rose-400 text-white shadow-lg shadow-rose-600/30'
              : 'bg-black/60 hover:bg-black/80 border-white/20 text-white'
          }`}
        >
          <Heart
            className={`w-5 h-5 transition-transform duration-200 ${
              isLiked ? 'fill-white text-white scale-110' : 'group-hover:scale-110 text-white'
            }`}
          />
        </div>
        <span className="text-[11px] font-bold text-white drop-shadow-md tabular-nums leading-none">
          {formatCount(likesCount)}
        </span>
      </button>

      {/* 2. Comments Button */}
      <button
        type="button"
        id={`reel-comment-btn-${reel.id}`}
        onClick={onOpenComments}
        className="flex flex-col items-center gap-1 group cursor-pointer"
        aria-label="عرض التعليقات"
      >
        <div className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 sm:backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 active:scale-75">
          <MessageCircle className="w-5 h-5 group-hover:scale-110 text-white group-hover:text-amber-300 transition-all" />
        </div>
        <span className="text-[11px] font-bold text-white drop-shadow-md tabular-nums leading-none">
          {formatCount(reel.comments?.length || 0)}
        </span>
      </button>

      {/* 3. Share Button */}
      <button
        type="button"
        id={`reel-share-btn-${reel.id}`}
        onClick={onShare}
        className="flex flex-col items-center gap-1 group cursor-pointer"
        aria-label="مشاركة الفيديو"
      >
        <div className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 sm:backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 active:scale-75">
          {copiedLink ? (
            <Check className="w-5 h-5 text-emerald-400 animate-scale-up" />
          ) : (
            <Share2 className="w-5 h-5 group-hover:scale-110 text-white group-hover:text-sky-300 transition-all" />
          )}
        </div>
        <span className="text-[11px] font-bold text-white drop-shadow-md tabular-nums leading-none">
          {copiedLink ? 'تم النسخ' : formatCount(reel.sharesCount || 0)}
        </span>
      </button>

      {/* 4. Mute / Sound Toggle */}
      <div className="relative flex flex-col items-center">
        {/* Tooltip hint pointing to the mute button */}
        {isMuted && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            className="
              absolute
              left-full
              ml-2.5
              top-1/2
              -translate-y-1/2
              z-50
              flex
              items-center
              gap-1.5
              px-2.5
              py-1.5
              rounded-xl
              bg-amber-400
              hover:bg-amber-300
              text-stone-950
              font-black
              text-[11px]
              whitespace-nowrap
              shadow-xl
              shadow-black/70
              border
              border-amber-200
              cursor-pointer
              pointer-events-auto
              animate-bounce
              transition-transform
              active:scale-95
            "
          >
            {/* Arrow pointing left directly to the button */}
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[6px] border-r-amber-400" />
            <Volume2 className="w-3.5 h-3.5 shrink-0 fill-stone-950" />
            <span>دوس هنا لتشغيل الصوت</span>
          </div>
        )}

        <button
          type="button"
          id={`reel-mute-btn-${reel.id}`}
          onClick={onToggleMute}
          className="flex flex-col items-center gap-1 group cursor-pointer"
          title={isMuted ? 'دوس على الزرار علشان تشغل الصوت' : 'كتم الصوت'}
          aria-label={isMuted ? 'دوس على الزرار علشان تشغل الصوت' : 'كتم الصوت'}
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center sm:backdrop-blur-md border transition-all duration-200 active:scale-75 ${
              isMuted
                ? 'bg-black/85 hover:bg-black/95 border-amber-400 text-amber-300 ring-2 ring-amber-400/50 shadow-lg shadow-amber-900/40 animate-pulse'
                : 'bg-black/60 hover:bg-black/80 border-white/20 text-white'
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-amber-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <span className="text-[10px] font-bold text-white drop-shadow-md leading-none">
            {isMuted ? 'تشغيل الصوت' : 'الصوت'}
          </span>
        </button>
      </div>

      {/* 5. Delete (Admin or Owner Only) */}
      {canDelete && (
        <button
          type="button"
          id={`reel-delete-btn-${reel.id}`}
          onClick={onRequestDelete}
          className="w-11 h-11 rounded-full bg-rose-600/80 hover:bg-rose-700 sm:backdrop-blur-md border border-rose-400/40 text-white flex items-center justify-center transition-all duration-200 active:scale-75 cursor-pointer shadow-md"
          title="حذف هذا الفيديو"
          aria-label="حذف هذا الفيديو"
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      )}
    </div>
  );
};
