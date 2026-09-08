import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Users, ShoppingBag } from 'lucide-react';

interface WAHGovernorateCardProps {
  id?: string;
  name: string;
  famousCraft: string;
  famousItem: string;
  image: string;
  sellersCount: number;
  productsCount: number;
  onClick: () => void;
  index?: number;
}

export const WAHGovernorateCard: React.FC<WAHGovernorateCardProps> = ({
  id,
  name,
  famousCraft,
  famousItem,
  image,
  sellersCount,
  productsCount,
  onClick,
  index = 0
}) => {
  return (
    <motion.div
      id={id || `gov-card-${name}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-[1.5rem] bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 hover:border-[#9a6a35]/40 dark:hover:border-[#9a6a35]/50 shadow-lg hover:shadow-xl transition-all duration-250 cursor-pointer text-center select-none"
    >
      {/* Governorate Emblem / Photo Frame */}
      <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden mb-3 border border-black/10 dark:border-white/10 group-hover:border-[#9a6a35] shadow-xs group-hover:scale-105 transition-all duration-300 shrink-0">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Governorate Info */}
      <div className="w-full space-y-1">
        <h3 className="font-bold text-[#211d18] dark:text-[#f5f0e7] text-sm group-hover:text-[#9a6a35] dark:group-hover:text-[#d5a56d] transition-colors">
          محافظة {name}
        </h3>
        <p className="text-[11px] font-bold text-[#9a6a35] dark:text-[#d5a56d] leading-snug">
          {famousCraft}
        </p>
        <p className="text-[10px] text-black/60 dark:text-white/60 leading-tight line-clamp-2">
          {famousItem}
        </p>
      </div>

      {/* Verified Artisans & Products Count */}
      <div className="mt-3 pt-2.5 border-t border-black/10 dark:border-white/10 w-full text-[10px] text-black/60 dark:text-white/60 font-medium flex items-center justify-between gap-1 group-hover:text-[#9a6a35] dark:group-hover:text-[#d5a56d] transition-colors">
        <span className="font-bold truncate">
          {sellersCount > 0 ? `${sellersCount} حرفي` : 'ورش قيد التوثيق'}
        </span>
        <span className="shrink-0">({productsCount} منتج)</span>
      </div>
    </motion.div>
  );
};
