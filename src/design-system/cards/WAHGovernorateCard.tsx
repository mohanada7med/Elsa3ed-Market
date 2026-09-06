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
      className="group relative flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[var(--wah-surface,#1B1613)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] hover:border-[var(--wah-primary,#B24C2B)] dark:hover:border-[var(--wah-primary,#E0633C)] shadow-[0_2px_8px_-2px_rgba(36,30,26,0.04)] hover:shadow-[0_12px_24px_-4px_rgba(36,30,26,0.1)] dark:hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.5)] transition-all duration-250 cursor-pointer text-center select-none"
    >
      {/* Governorate Emblem / Photo Frame */}
      <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden mb-3 border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] group-hover:border-[var(--wah-primary,#B24C2B)] shadow-xs group-hover:scale-105 transition-all duration-300 shrink-0">
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
        <h3 className="font-bold text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] text-sm group-hover:text-[var(--wah-primary,#B24C2B)] dark:group-hover:text-[var(--wah-primary,#E0633C)] transition-colors">
          محافظة {name}
        </h3>
        <p className="text-[11px] font-bold text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] leading-snug">
          {famousCraft}
        </p>
        <p className="text-[10px] text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] leading-tight line-clamp-2">
          {famousItem}
        </p>
      </div>

      {/* Verified Artisans & Products Count */}
      <div className="mt-3 pt-2.5 border-t border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] w-full text-[10px] text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] font-medium flex items-center justify-between gap-1 group-hover:text-[var(--wah-primary,#B24C2B)] dark:group-hover:text-[var(--wah-primary,#E0633C)] transition-colors">
        <span className="font-bold truncate">
          {sellersCount > 0 ? `${sellersCount} حرفي` : 'ورش قيد التوثيق'}
        </span>
        <span className="shrink-0">({productsCount} منتج)</span>
      </div>
    </motion.div>
  );
};
