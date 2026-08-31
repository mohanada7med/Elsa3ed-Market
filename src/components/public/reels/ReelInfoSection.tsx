import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext.tsx';
import { CraftReel } from '../../../types.ts';
import { BadgeCheck, Music, MapPin, Sparkles } from 'lucide-react';
import { ReelProductPill } from './ReelProductPill.tsx';

interface ReelInfoSectionProps {
  reel: CraftReel;
  onSelectSeller?: (sellerId: string) => void;
  onSelectProduct?: (productId: string) => void;
  onCloseParent?: () => void;
}

export const ReelInfoSection: React.FC<ReelInfoSectionProps> = ({
  reel,
  onSelectSeller,
  onSelectProduct,
  onCloseParent
}) => {
  const { navigateToSeller } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSellerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCloseParent) onCloseParent();
    if (onSelectSeller) {
      onSelectSeller(reel.sellerId);
    } else {
      navigateToSeller(reel.sellerId);
    }
  };

  const hasLongDescription =
    (reel.description && reel.description.length > 80) ||
    (reel.title && reel.title.length > 50);

  return (
    <div
      className="space-y-2 max-w-[calc(100%-60px)] sm:max-w-[calc(100%-68px)] text-right select-text pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Seller Information Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleSellerClick}
          className="flex items-center gap-2 group cursor-pointer text-right min-w-0"
          aria-label={`زيارة ورشة ${reel.artisanName || reel.workshopName}`}
        >
          {/* Avatar */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-amber-500/80 bg-neutral-800">
            <img
              src={reel.artisanAvatar}
              alt={reel.artisanName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
            />
          </div>

          {/* Name */}
          <div className="min-w-0 flex items-center gap-1">
            <span className="font-bold text-xs sm:text-sm text-white drop-shadow-md truncate max-w-[140px] sm:max-w-[200px] group-hover:text-amber-300 transition-colors">
              {reel.artisanName || reel.workshopName}
            </span>
            {(reel.isVerifiedArtisan ?? true) && (
              <BadgeCheck className="w-3.5 h-3.5 text-amber-400 shrink-0 drop-shadow" />
            )}
          </div>
        </button>

        {/* Governorate Tag */}
        {reel.governorate && (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs border border-white/15 text-[10px] font-medium text-amber-200/90 shrink-0">
            <MapPin className="w-2.5 h-2.5 text-[#B45F42]" />
            <span>{reel.governorate}</span>
          </span>
        )}
      </div>

      {/* 2. Reel Title & Caption */}
      <div className="space-y-1">
        <h3 className="text-xs sm:text-sm font-bold text-white leading-snug drop-shadow-md">
          {reel.title}
        </h3>

        {reel.description && (
          <div className="text-[11px] sm:text-xs text-gray-200/95 leading-relaxed drop-shadow-sm">
            <p className={isExpanded ? '' : 'line-clamp-2'}>
              {reel.description}
            </p>
            {hasLongDescription && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="text-[10px] font-bold text-amber-300 hover:text-amber-200 mt-0.5 cursor-pointer underline underline-offset-2"
              >
                {isExpanded ? 'عرض أقل' : 'المزيد'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Music Track & Craft Tag (Minimal Single Row) */}
      <div className="flex items-center gap-2 text-[10px] text-amber-300/80">
        {reel.musicTrack && (
          <div className="inline-flex items-center gap-1 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-md truncate max-w-[160px]">
            <Music className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">{reel.musicTrack}</span>
          </div>
        )}
        {reel.craftType && (
          <span className="bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-md truncate max-w-[120px] text-gray-300">
            {reel.craftType}
          </span>
        )}
      </div>

      {/* 4. Instant Product Pill */}
      {reel.productId && (
        <div className="pt-0.5">
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
