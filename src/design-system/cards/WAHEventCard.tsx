import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Sparkles } from 'lucide-react';
import { WAHPattern } from '../WAHPattern';

interface WAHEventCardProps {
  id?: string;
  title: string;
  category: string;
  governorate: string;
  seasonText: string;
  shortDescription: string;
  image: string;
  onClick?: () => void;
}

export const WAHEventCard: React.FC<WAHEventCardProps> = ({
  id,
  title,
  category,
  governorate,
  seasonText,
  shortDescription,
  image,
  onClick
}) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="group relative flex flex-col rounded-2xl bg-white dark:bg-[var(--wah-surface,#1B1613)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] hover:border-[var(--wah-primary,#B24C2B)] dark:hover:border-[var(--wah-primary,#E0633C)] shadow-[0_2px_8px_-2px_rgba(36,30,26,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(36,30,26,0.12)] dark:hover:shadow-[0_12px_30px_-6px_rgba(0,0,0,0.6)] transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute top-2.5 right-2.5 z-10 flex gap-1.5">
          <span className="bg-[var(--wah-primary,#B24C2B)] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-xs">
            {category}
          </span>
        </div>
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <span className="bg-black/60 text-[var(--wah-accent-light,#FDF3E7)] text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[var(--wah-accent,#D97724)]" />
            <span>{governorate}</span>
          </span>
        </div>
        <div className="absolute bottom-2.5 left-2.5 z-10 bg-black/60 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1 border border-white/10">
          <Calendar className="w-3 h-3" />
          <span>{seasonText}</span>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between relative bg-white dark:bg-[var(--wah-surface,#1B1613)]">
        <WAHPattern type="geometry" opacity={0.03} />
        <div className="relative z-10 space-y-1.5">
          <h3 className="font-bold text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] text-base group-hover:text-[var(--wah-primary,#B24C2B)] dark:group-hover:text-[var(--wah-primary,#E0633C)] transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-xs text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] line-clamp-2 leading-relaxed">
            {shortDescription}
          </p>
        </div>

        <div className="pt-3 mt-3 border-t border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] flex items-center justify-between text-xs font-bold text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] relative z-10">
          <span>تفاصيل الفعالية ومواعيدها</span>
          <span className="text-[11px] group-hover:-translate-x-1 transition-transform">←</span>
        </div>
      </div>
    </motion.div>
  );
};
