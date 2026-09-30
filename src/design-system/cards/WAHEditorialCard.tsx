import React from 'react';
import { motion } from 'motion/react';
import { MapPin, ArrowLeft, Clock, Sparkles } from 'lucide-react';
import { WAHBadge } from '../WAHBadge';
import { HeritageCornerStamp } from '../../components/common/HeritageCornerStamp';

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
    ? 'rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-[1rem] rounded-bl-[1rem]'
    : 'rounded-[1.5rem]';

  return (
    <motion.article
      id={id}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`group relative flex flex-col bg-white/75 dark:bg-espresso-900/90 backdrop-blur-xl border border-black/10 dark:border-white/10 hover:border-primary/40 dark:hover:border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer ${shapeClass}`}
    >
      {/* Editorial Photography */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/5 dark:bg-cream/5">
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
            <span className="bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-xs">
              {category}
            </span>
          )}
          {badge && (
            <span className="bg-black/50 text-white backdrop-blur-md text-[10px] font-semibold px-2 py-0.5 rounded-md border border-white/20">
              {badge}
            </span>
          )}
        </div>

        {/* ختم تراثي أصيل في الركن */}
        <HeritageCornerStamp position="top-left" size={34} />

        {/* Governorate Bottom Tag */}
        {governorate && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="bg-espresso/80 text-cream text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/15 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary" />
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
      <div className="p-5 flex-1 flex flex-col justify-between relative bg-white/75 dark:bg-espresso-900/90">
        {/* Subtle authentic heritage pattern texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.045] mix-blend-multiply dark:mix-blend-screen"
          style={{
            backgroundImage: "url('/pattern/pat2.png')",
            backgroundRepeat: 'repeat',
            backgroundSize: '360px auto'
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 space-y-2">
          {subtitle && (
            <p className="text-xs font-bold text-primary dark:text-primary-hover line-clamp-1">
              {subtitle}
            </p>
          )}

          <h3 className="text-base sm:text-lg font-cairo font-bold text-espresso dark:text-cream leading-snug group-hover:text-primary dark:group-hover:text-[#C99444] transition-colors">
            {title}
          </h3>

          {excerpt && (
            <p className="text-xs sm:text-sm text-black/60 dark:text-white/60 line-clamp-2 leading-relaxed">
              {excerpt}
            </p>
          )}
        </div>

        {/* Action Link Footer */}
        <div className="pt-4 mt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs font-bold text-primary dark:text-primary-hover group-hover:text-[#3B1E0E] dark:group-hover:text-[#C99444] relative z-10">
          <span>اكتشف المزيد</span>
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.article>
  );
};
