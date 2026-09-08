import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Utensils, Sparkles, Clock } from 'lucide-react';
import { WAHPattern } from '../WAHPattern';

interface WAHFoodCardProps {
  id?: string;
  title: string;
  category: string;
  originGovernorate: string;
  shortDescription: string;
  image: string;
  prepTime?: string;
  onClick?: () => void;
}

export const WAHFoodCard: React.FC<WAHFoodCardProps> = ({
  id,
  title,
  category,
  originGovernorate,
  shortDescription,
  image,
  prepTime,
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
      className="group relative flex flex-col rounded-[1.5rem] bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 hover:border-[#9a6a35]/40 dark:hover:border-[#9a6a35]/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/5 dark:bg-white/5">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="bg-[#9a6a35] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-xs">
            {category}
          </span>
        </div>
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <span className="bg-[#211d18]/80 text-[#f5f0e7] text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#9a6a35]" />
            <span>{originGovernorate}</span>
          </span>
        </div>
        {prepTime && (
          <div className="absolute bottom-2.5 left-2.5 z-10 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-300" />
            <span>{prepTime}</span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between relative bg-white/75 dark:bg-[#151513]/90">
        <WAHPattern type="pottery" opacity={0.03} />
        <div className="relative z-10 space-y-1.5">
          <h3 className="font-bold text-[#211d18] dark:text-[#f5f0e7] text-base group-hover:text-[#9a6a35] dark:group-hover:text-[#d5a56d] transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-xs text-black/60 dark:text-white/60 line-clamp-2 leading-relaxed">
            {shortDescription}
          </p>
        </div>

        <div className="pt-3 mt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs font-bold text-[#9a6a35] dark:text-[#d5a56d] relative z-10">
          <span className="flex items-center gap-1">
            <Utensils className="w-3.5 h-3.5" />
            <span>وصفة وسر المطبخ</span>
          </span>
          <span className="text-[11px] group-hover:-translate-x-1 transition-transform">←</span>
        </div>
      </div>
    </motion.div>
  );
};
