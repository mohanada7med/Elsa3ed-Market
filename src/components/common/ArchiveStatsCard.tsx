import React, { type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface ArchiveStat {
  value: ReactNode;
  label: ReactNode;
}

interface ArchiveStatsCardProps {
  eyebrow: string;
  icon: LucideIcon;
  stats: readonly [ArchiveStat, ArchiveStat];
  footer: ReactNode;
}

/*
  بلاطات بينتو منفصلة: بلاطة primary، بلاطة دهبية نازلة شوية،
  وكبسولة surface تحتهم فيها الأيقونة والنصوص. بنفس tokens موقعك.
*/
export const ArchiveStatsCard: React.FC<ArchiveStatsCardProps> = ({
  eyebrow,
  icon: Icon,
  stats,
  footer,
}) => (
  <div className="mx-auto grid w-full max-w-md grid-cols-2 items-start gap-2.5 sm:gap-3">
    {/* بلاطة 1 */}
    <div className="flex aspect-square flex-col justify-end rounded-[1.5rem] rounded-br-lg bg-primary p-3.5 text-white transition-transform duration-300 hover:-translate-y-1 rtl:rounded-br-[1.5rem] rtl:rounded-bl-lg sm:rounded-[2rem] sm:p-5">
      <div className="text-5xl font-black leading-none sm:text-7xl wah-num">{stats[0].value}</div>
      <div className="mt-2 text-xs leading-5 text-white/85 sm:mt-3 sm:text-sm sm:leading-6">{stats[0].label}</div>
    </div>

    {/* بلاطة 2 (نازلة شوية) */}
    <div className="mt-6 flex aspect-square flex-col justify-end rounded-[1.5rem] rounded-tl-lg bg-[#C99444] p-3.5 text-espresso transition-transform duration-300 hover:-translate-y-1 rtl:rounded-tl-[1.5rem] rtl:rounded-tr-lg sm:mt-8 sm:rounded-[2rem] sm:p-5">
      <div className="text-5xl font-black leading-none sm:text-7xl wah-num">{stats[1].value}</div>
      <div className="mt-2 text-xs leading-5 text-espresso/80 sm:mt-3 sm:text-sm sm:leading-6">{stats[1].label}</div>
    </div>

    {/* الكبسولة */}
    <div className="col-span-2 flex items-center gap-4 rounded-full border border-border-subtle bg-surface py-3 pe-6 ps-3">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-espresso text-[#C99444]">
        <Icon size={22} />
      </span>
      <div className="min-w-0">
        <div className="text-xs text-black/55 dark:text-white/55">{eyebrow}</div>
        <div className="text-sm font-bold text-espresso dark:text-cream">{footer}</div>
      </div>
    </div>
  </div>
);