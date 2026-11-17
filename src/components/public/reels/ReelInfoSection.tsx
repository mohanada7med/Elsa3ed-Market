import React, { useState } from 'react';
import { CraftReel } from '../../../types.ts';
import { MapPin, Compass } from 'lucide-react';
import { ReelProductPill } from './ReelProductPill.tsx';

interface ReelInfoSectionProps {
  reel: CraftReel;
  onSelectSeller?: (sellerId: string) => void;
  onSelectCreator?: (creatorId: string) => void;
  onSelectProduct?: (productId: string) => void;
  onCloseParent?: () => void;
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  all: 'كل الحكايات',
  places: 'أماكن ومعالم',
  crafts: 'حرف وصناعات',
  heritage: 'تراث وآثار',
  events: 'فعاليات ومهرجانات',
  food: 'أكل صعيدي',
  markets: 'أسواق',
  people: 'حكايات الناس',
  travel: 'رحلات وتجارب',
  other: 'حكاية صعيدية'
};

export const ReelInfoSection: React.FC<ReelInfoSectionProps> = ({
  reel,
  onSelectCreator,
  onSelectProduct,
  onCloseParent
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const categoryLabel =
    (reel.contentType && CONTENT_TYPE_LABELS[reel.contentType]) ||
    reel.craftType ||
    'اكتشف الصعيد';

  const displayLocation = reel.location || reel.governorate || 'الصعيد';
  const creatorDisplayName = reel.creatorName || reel.artisanName;
  const creatorAvatarUrl = reel.creatorAvatar || reel.artisanAvatar;

  const hasLongDescription =
    (reel.description && reel.description.length > 90) ||
    (reel.title && reel.title.length > 60);

  const hasProduct = Boolean(
    reel.productId &&
    reel.productId !== 'none' &&
    reel.productTitle &&
    reel.productPrice
  );

  return (
    <div
      className="space-y-2.5 max-w-[calc(100%-60px)] sm:max-w-[calc(100%-68px)] text-right select-text pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
      dir="rtl"
    >
      {/* 0. Creator Attribution Badge (if published by a Content Creator) */}
      {reel.creatorId && creatorDisplayName && (
        <div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCloseParent?.();
              onSelectCreator?.(reel.creatorId!);
            }}
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/75 hover:bg-black/90 sm:backdrop-blur-md border border-amber-400/35 text-white text-[11px] font-bold shadow-md transition-all cursor-pointer active:scale-95"
          >
            {creatorAvatarUrl ? (
              <img
                src={creatorAvatarUrl}
                alt={creatorDisplayName}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover border border-amber-400/60 shrink-0"
              />
            ) : (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shrink-0">
                {creatorDisplayName.charAt(0)}
              </span>
            )}
            <span className="truncate max-w-[160px]">{creatorDisplayName}</span>
            <span className="text-[9px] text-amber-300 font-extrabold">• صانع محتوى</span>
          </button>
        </div>
      )}

      {/* 1. Location and Category Meta Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {displayLocation && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 sm:backdrop-blur-md border border-white/20 text-[11px] font-bold text-[#d5a56d] shadow-md shrink-0">
            <MapPin className="w-3 h-3 text-[#d5a56d]" />
            <span>{displayLocation}</span>
          </span>
        )}

        {categoryLabel && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/90 sm:backdrop-blur-md text-white text-[10px] font-extrabold shadow-md shrink-0">
            <Compass className="w-2.5 h-2.5 text-[#d5a56d]" />
            <span>{categoryLabel}</span>
          </span>
        )}
      </div>

      {/* 2. Story Title & Description */}
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug drop-shadow-lg tracking-tight">
          {reel.title}
        </h3>

        {reel.description && (
          <div className="text-xs text-gray-100/95 leading-relaxed drop-shadow-md">
            <p className={isExpanded ? '' : 'line-clamp-2'}>
              {reel.description}
            </p>
            {hasLongDescription && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="text-[11px] font-bold text-amber-300 hover:text-[#d5a56d] mt-1 cursor-pointer underline underline-offset-2"
              >
                {isExpanded ? 'عرض أقل' : 'المزيد'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Optional Shoppable Product Pill (Only if product exists) */}
      {hasProduct && (
        <div className="pt-1">
          <ReelProductPill
            reel={reel}
            onSelectProduct={onSelectProduct}
            onCloseParent={onCloseParent}
          />
        </div>
      )}
    </div>
  );
};

