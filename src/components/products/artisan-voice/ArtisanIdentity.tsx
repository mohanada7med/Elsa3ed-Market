import React from 'react';
import { MapPin, BadgeCheck, Sparkles, Volume2 } from 'lucide-react';
import { getOptimizedImageUrl } from '../../../utils/cloudinaryMedia';

export interface ArtisanIdentityProps {
  artisanName: string;
  artisanPortrait?: string;
  artisanGovernorate?: string;
  artisanCraft?: string;
  isPlaying?: boolean;
  className?: string;
}

export const ArtisanIdentity: React.FC<ArtisanIdentityProps> = ({
  artisanName,
  artisanPortrait,
  artisanGovernorate,
  artisanCraft,
  isPlaying = false,
  className = '',
}) => {
  const defaultAvatar =
    'https://res.cloudinary.com/kuana1nl/image/upload/v1788710904/user.jpg';
  const portraitUrl = artisanPortrait
    ? getOptimizedImageUrl(artisanPortrait, { width: 160, height: 160, crop: 'thumb' })
    : defaultAvatar;

  return (
    <div
      className={`flex items-center gap-3.5 sm:gap-4.5 select-none ${className}`}
      dir="rtl"
    >
      {/* Artisan Portrait Container */}
      <div className="relative shrink-0">
        <div
          className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-full overflow-hidden p-0.5 transition-all duration-300 ${
            isPlaying
              ? 'ring-3 ring-amber-600 dark:ring-amber-500 shadow-md shadow-amber-900/20'
              : 'ring-2 ring-[#C99444]/60 dark:ring-[#C99444]/40 shadow-sm'
          }`}
        >
          <img
            src={portraitUrl}
            alt={`صورة الحرفي ${artisanName}`}
            className="w-full h-full object-cover object-center rounded-2xl sm:rounded-full bg-cream-100 dark:bg-espresso-800"
            loading="lazy"
            onError={(e) => {
              // Graceful fallback to default portrait on load error
              (e.currentTarget as HTMLImageElement).src = defaultAvatar;
            }}
          />
        </div>

        {/* Live Audio Playing Indicator Badge */}
        {isPlaying && (
          <span
            className="absolute -bottom-1 -left-1 flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-md ring-2 ring-white dark:ring-espresso animate-pulse"
            title="تسجيل صوتي قيد التشغيل"
            aria-label="تسجيل صوتي قيد التشغيل"
          >
            <Volume2 size={13} className="animate-bounce" />
          </span>
        )}
      </div>

      {/* Artisan Details & Cultural Lineage */}
      <div className="flex-1 min-w-0">
        {/* Heritage Pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 dark:bg-primary-light border border-primary/20 dark:border-primary/30 mb-1.5 shadow-2xs">
          <Sparkles size={11} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-[11px] font-bold text-primary dark:text-cream leading-none">
            صاحب الصنعة • توثيق أصيل
          </span>
          <BadgeCheck size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0 mr-0.5" />
        </div>

        {/* Artisan Name */}
        <h3 className="text-lg sm:text-2xl font-black text-espresso dark:text-cream leading-tight truncate">
          {artisanName}
        </h3>

        {/* Craft & Governorate Heritage Origin */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs sm:text-sm text-secondary dark:text-cream/80">
          {artisanCraft && (
            <span className="font-bold text-espresso/85 dark:text-cream/90">
              {artisanCraft}
            </span>
          )}

          {artisanCraft && artisanGovernorate && (
            <span className="text-secondary/50 dark:text-cream/40" aria-hidden="true">
              •
            </span>
          )}

          {artisanGovernorate && (
            <div className="inline-flex items-center gap-1 font-medium">
              <MapPin size={13} className="text-amber-700 dark:text-amber-500 shrink-0" />
              <span>{artisanGovernorate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

