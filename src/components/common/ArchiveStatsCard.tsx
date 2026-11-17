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

export const ArchiveStatsCard: React.FC<ArchiveStatsCardProps> = ({
  eyebrow,
  icon: Icon,
  stats,
  footer,
}) => (
  <div className="group relative mx-auto max-w-md [perspective:1200px]">
    {/* هالة إضاءة خلفية تتوهج عند التمرير */}
    <div className="pointer-events-none absolute -inset-1 rounded-[2.5rem] bg-gradient-to-b from-primary/30 via-transparent to-primary/20 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100 dark:from-primary-hover/30 dark:to-primary-hover/20" />

    {/* جسم الباب الرئيسي (خزنة مقوسة من الأعلى ومشطوفة الزوايا) */}
    <div className="relative overflow-hidden rounded-t-[8rem] rounded-b-3xl border-2 border-border-subtle bg-surface p-3 pb-0 shadow-2xl transition-all duration-500 group-hover:border-primary/60 dark:group-hover:border-primary-hover/60">
      
      {/* مسامير تثبيت معدنية في الأركان */}
      <span className="absolute start-5 top-16 h-2 w-2 rounded-full border border-black/20 bg-black/10 dark:border-white/20 dark:bg-white/10" />
      <span className="absolute end-5 top-16 h-2 w-2 rounded-full border border-black/20 bg-black/10 dark:border-white/20 dark:bg-white/10" />
      <span className="absolute bottom-16 start-5 h-2 w-2 rounded-full border border-black/20 bg-black/10 dark:border-white/20 dark:bg-white/10" />
      <span className="absolute bottom-16 end-5 h-2 w-2 rounded-full border border-black/20 bg-black/10 dark:border-white/20 dark:bg-white/10" />

      {/* الإطار الداخلي للخزنة */}
      <div className="relative overflow-hidden rounded-t-[7.2rem] rounded-b-2xl border border-black/10 bg-gradient-to-b from-black/[0.03] via-transparent to-black/[0.04] px-6 pt-10 pb-9 dark:border-white/10 dark:from-white/[0.04] dark:to-white/[0.03]">
        
        {/* ترس/حلقة قفل الخزنة الدوارة في الخلفية */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/20 transition-transform duration-1000 ease-out group-hover:rotate-90 group-hover:scale-110 dark:border-primary-hover/20" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/15 transition-transform duration-1000 ease-out group-hover:-rotate-45 dark:border-primary-hover/15" />

        {/* قفل الأمان العلوي (تاج الخزنة) */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-surface shadow-lg transition-all duration-500 group-hover:rotate-[360deg] group-hover:rounded-full group-hover:border-primary dark:border-primary-hover/30 dark:group-hover:border-primary-hover">
            {/* مؤشر نبض أخضر/أساسي */}
            <span className="absolute -end-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75 dark:bg-primary-hover" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-primary dark:bg-primary-hover" />
            </span>
            <Icon size={22} className="text-primary dark:text-primary-hover" />
          </div>

          <span className="mt-4 rounded-full border border-black/10 bg-black/[0.03] px-3.5 py-1 text-[9px] font-black uppercase tracking-[0.28em] text-black/60 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/60">
            {eyebrow}
          </span>
        </div>

        {/* بوابة الإحصائيات (ضلفتان تنزلقان مع شعاع ضوئي في المنتصف) */}
        <div className="relative z-10 mt-8 grid grid-cols-2 gap-3">
          {/* شعاع الليزر/الضوء العمودي في المنتصف */}
          <div className="pointer-events-none absolute inset-y-2 left-1/2 z-20 w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-primary to-transparent opacity-30 transition-all duration-500 group-hover:scale-y-110 group-hover:opacity-100 group-hover:shadow-[0_0_12px_2px_rgba(var(--color-primary),0.6)] dark:via-primary-hover" />

          {stats.map((stat, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl border border-black/10 bg-surface/90 p-5 text-center backdrop-blur-md transition-all duration-500 ease-out dark:border-white/10 ${
                index === 0
                  ? 'group-hover:-translate-x-1.5 group-hover:-rotate-1 rtl:group-hover:translate-x-1.5 rtl:group-hover:rotate-1'
                  : 'group-hover:translate-x-1.5 group-hover:rotate-1 rtl:group-hover:-translate-x-1.5 rtl:group-hover:-rotate-1'
              }`}
            >
              {/* خط مسح ضوئي (Scanner Bar) يتحرك داخل كل ضلفة */}
              <div className="pointer-events-none absolute inset-x-0 -top-full h-1/2 bg-gradient-to-b from-transparent via-primary/10 to-transparent transition-all duration-1000 group-hover:top-full dark:via-primary-hover/15" />

              {/* مزلاج قفل جانبي */}
              <div
                className={`absolute top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary/40 transition-all duration-300 group-hover:h-3 group-hover:bg-primary dark:bg-primary-hover/40 dark:group-hover:bg-primary-hover ${
                  index === 0 ? 'end-1.5' : 'start-1.5'
                }`}
              />

              <div className="text-4xl font-black tracking-[-0.06em] text-black transition-transform duration-300 group-hover:scale-105 dark:text-white sm:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2.5 text-[10px] font-semibold leading-4 text-black/50 dark:text-white/45">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* العتبة السفلية للخزنة (تضيء وتفتح أقفالها عند الـ Hover) */}
      <div className="-mx-3 mt-3 flex items-center justify-between border-t border-black/10 bg-black/[0.04] px-6 py-4 dark:border-white/10 dark:bg-white/[0.04]">
        {/* أقفال سفلية تنسحب للخارج */}
        <div className="flex gap-1">
          <span className="h-2 w-3 rounded-sm bg-primary/50 transition-transform duration-500 group-hover:-translate-x-1 group-hover:bg-primary dark:bg-primary-hover/50 dark:group-hover:bg-primary-hover" />
          <span className="h-2 w-1.5 rounded-sm bg-primary/30 transition-transform duration-500 group-hover:-translate-x-0.5 dark:bg-primary-hover/30" />
        </div>

        <span className="text-[11px] font-bold tracking-wide text-black/80 dark:text-white/80">
          {footer}
        </span>

        <div className="flex gap-1">
          <span className="h-2 w-1.5 rounded-sm bg-primary/30 transition-transform duration-500 group-hover:translate-x-0.5 dark:bg-primary-hover/30" />
          <span className="h-2 w-3 rounded-sm bg-primary/50 transition-transform duration-500 group-hover:translate-x-1 group-hover:bg-primary dark:bg-primary-hover/50 dark:group-hover:bg-primary-hover" />
        </div>
      </div>
    </div>
  </div>
);