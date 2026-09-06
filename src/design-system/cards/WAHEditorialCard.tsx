import React from 'react';
import { motion } from 'motion/react';
import { MapPin, ArrowLeft, Clock, Sparkles } from 'lucide-react';
import { WAHBadge } from '../WAHBadge';
import { WAHPattern } from '../WAHPattern';

interface WAHEditorialCardProps {
  id?: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  image: string;
  category?: string;
  governorate?: string;
  meta?: string;
  badge?: string;
  editorialShape?: boolean;
  onClick?: () => void;
}

export const WAHEditorialCard: React.FC<WAHEditorialCardProps> = ({
  id,
  title,
  subtitle,
  excerpt,
  image,
  category,
  governorate,
  meta,
  badge,
  editorialShape = true,
  onClick
}) => {
  const shapeClass = editorialShape
    ? 'rounded-tl-3xl rounded-br-3xl rounded-tr-xl rounded-bl-xl'
    : 'rounded-2xl';

  return (
    <motion.article
      id={id}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`group relative flex flex-col bg-white dark:bg-[var(--wah-surface,#1B1613)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] hover:border-[var(--wah-primary,#B24C2B)] dark:hover:border-[var(--wah-primary,#E0633C)] shadow-[0_2px_10px_-2px_rgba(36,30,26,0.04)] hover:shadow-[0_14px_30px_-6px_rgba(36,30,26,0.12)] dark:hover:shadow-[0_14px_34px_-6px_rgba(0,0,0,0.65)] transition-all duration-300 overflow-hidden cursor-pointer ${shapeClass}`}
    >
      {/* Editorial Photography */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 z-10">
          {category && (
            <span className="bg-[var(--wah-primary,#B24C2B)] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-xs">
              {category}
            </span>
          )}
          {badge && (
            <span className="bg-black/50 text-white backdrop-blur-md text-[10px] font-semibold px-2 py-0.5 rounded-md border border-white/20">
              {badge}
            </span>
          )}
        </div>

        {/* Governorate Bottom Tag */}
        {governorate && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="bg-black/60 text-[var(--wah-accent-light,#FDF3E7)] text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/15 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[var(--wah-accent,#D97724)]" />
              <span>{governorate}</span>
            </span>
          </div>
        )}

        {meta && (
          <div className="absolute bottom-3 left-3 z-10 text-[10px] text-stone-300 font-medium flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
            <Clock className="w-3 h-3" />
            <span>{meta}</span>
          </div>
        )}
      </div>

      {/* Editorial Content */}
      <div className="p-5 flex-1 flex flex-col justify-between relative bg-white dark:bg-[var(--wah-surface,#1B1613)]">
        <WAHPattern type="geometry" opacity={0.02} />

        <div className="relative z-10 space-y-2">
          {subtitle && (
            <p className="text-xs font-bold text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] line-clamp-1">
              {subtitle}
            </p>
          )}

          <h3 className="text-base sm:text-lg font-black font-serif text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] leading-snug group-hover:text-[var(--wah-primary,#B24C2B)] dark:group-hover:text-[var(--wah-primary,#E0633C)] transition-colors">
            {title}
          </h3>

          {excerpt && (
            <p className="text-xs sm:text-sm text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] line-clamp-2 leading-relaxed">
              {excerpt}
            </p>
          )}
        </div>

        {/* Action Link Footer */}
        <div className="pt-4 mt-4 border-t border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] flex items-center justify-between text-xs font-bold text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] group-hover:text-[var(--wah-primary-hover,#963E21)] relative z-10">
          <span>اكتشف المزيد</span>
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.article>
  );
};
