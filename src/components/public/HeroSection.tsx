import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowLeft,
  Ship,
  Landmark,
  ShoppingBag,
  Film,
  MapPin,
} from 'lucide-react';
import { motion } from 'motion/react';
import { WAHBadge } from '../../design-system/WAHBadge';

export const HeroSection: React.FC = () => {
  const { setActivePage, wahStats } = useApp();

  return (
    <section
      dir="rtl"
      className="
        relative
        min-h-[680px]
        overflow-hidden
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors duration-500
        dark:bg-[#090909]
        dark:text-white
      "
    >
      {/* Background Image with motion */}
      <motion.div
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
        className="absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <img
          src="https://res.cloudinary.com/kuana1nl/image/upload/v1788832698/WAH/heritage-places/alexan-pasha-palace/dclassic-2026-08-21-02083951477127237e_1788832673058_bzeh.jpg"
          alt=""
          className="h-full w-full object-cover object-center opacity-80 dark:opacity-40 filter brightness-110"
        />
      </motion.div>

      {/* Layer 1: Soft solid color wash */}
      <div
        className="pointer-events-none absolute inset-0 bg-[#eee8dc]/65 dark:bg-black/45"
        aria-hidden="true"
      />

      {/* Layer 2: Editorial directional gradient */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[#eee8dc]/95 via-[#eee8dc]/75 to-[#eee8dc]/30 dark:from-black/[0.96] dark:via-black/[0.72] dark:to-black/[0.18]"
        aria-hidden="true"
      />

      {/* Layer 3: Vertical grounding gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#eee8dc] via-[#eee8dc]/40 to-transparent dark:from-black/[0.92] dark:via-black/40 dark:to-transparent"
        aria-hidden="true"
      />

      {/* Layer 4: Subtle heritage geometric watermark */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.035] dark:opacity-[0.05]"
        aria-hidden="true"
      >
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="wahHeroHeritagePattern"
              width="56"
              height="56"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M28 0 L56 28 L28 56 L0 28 Z"
                fill="none"
                stroke="#9a6a35"
                strokeWidth="0.8"
              />
              <path
                d="M28 12 L44 28 L28 44 L12 28 Z"
                fill="none"
                stroke="#9a6a35"
                strokeWidth="0.6"
                strokeDasharray="2 4"
              />
              <line
                x1="28"
                y1="18"
                x2="28"
                y2="38"
                stroke="#9a6a35"
                strokeWidth="0.6"
              />
              <line
                x1="18"
                y1="28"
                x2="38"
                y2="28"
                stroke="#9a6a35"
                strokeWidth="0.6"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wahHeroHeritagePattern)" />
        </svg>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 mx-auto flex min-h-[680px] max-w-[1500px] items-center px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="w-full max-w-3xl">
          {/* Location pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-5 flex items-center gap-2"
          >
            <MapPin className="h-3.5 w-3.5 text-[#9a6a35]" />
            <span className="text-[10px] font-bold tracking-[0.12em] text-[#9a6a35] dark:text-[#f0d5ad]">
              أسيوط · صعيد مصر
            </span>
            <span className="h-px w-10 bg-black/20 dark:bg-white/30" />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.45 }}
            className="mb-6"
          >
            <WAHBadge
              variant="terracotta"
              size="md"
              icon={<Sparkles className="h-3.5 w-3.5 text-[#9a6a35]" />}
            >
              «منصة صعيد مصر المتكاملة: سوق أصيل · ريلز · وثائقيات وتراث»
            </WAHBadge>
          </motion.div>

          {/* Big Heritage Headline: الصعيد بيحكى */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.25,
              duration: 0.7,
              ease: [0.33, 1, 0.68, 1],
            }}
            className="max-w-4xl font-heritage text-[4rem] font-black leading-[0.9] tracking-[-0.055em] text-[#211d18] drop-shadow-sm dark:text-white dark:drop-shadow-2xl sm:text-[6rem] lg:text-[7.5rem] xl:text-[8.5rem]"
          >
            الصعيد
            <span className="text-[#9a6a35]"> بيحكى </span>
          </motion.h1>

          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 85, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="my-7 h-[2px] bg-[#9a6a35]"
          />

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.55 }}
            className="max-w-2xl text-[14px] font-medium leading-8 text-black/80 dark:text-white/80 sm:text-base"
          >
            أول منصة متكاملة لصعيد مصر تجمع بين{' '}
            <span className="font-bold text-[#9a6a35]">
              سوق وه التجاري الحرفي، ريلز وه لصناع المحتوى الصعيدى، وتراث وه من أعمال توثيق وحفظ التراث
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap items-stretch sm:items-center"
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActivePage('products')}
              className="group flex min-h-[52px] items-center justify-center gap-3 rounded-2xl bg-[#9a6a35] hover:bg-[#805423] text-white px-6 text-sm font-black shadow-xl shadow-[#9a6a35]/25 transition-all sm:min-w-[210px]"
            >
              <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span>ادخل سوق وه الحرفي</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                تسوق وشحن
              </span>
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActivePage('reels')}
              className="group flex min-h-[52px] items-center justify-center gap-2.5 rounded-2xl bg-[#211d18] hover:bg-black text-white px-5 text-sm font-bold shadow-lg shadow-black/10 dark:bg-white dark:text-black dark:hover:bg-[#d5a56d] transition-all sm:min-w-[160px]"
            >
              <Film className="h-5 w-5 text-[#d6aa72] dark:text-[#9a6a35]" />
              <span>ريلز وه</span>
              <ArrowLeft className="h-4 w-4 opacity-60 transition-transform duration-300 group-hover:-translate-x-1 group-hover:opacity-100" />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActivePage('places')}
              className="group flex min-h-[52px] items-center justify-center gap-2.5 rounded-2xl border border-[#9a6a35]/30 bg-white/85 px-5 text-sm font-bold text-[#2b241c] backdrop-blur-md transition-all hover:border-[#9a6a35] hover:bg-white hover:shadow-md hover:shadow-[#9a6a35]/15 dark:border-white/20 dark:bg-white/[0.08] dark:text-white dark:hover:border-white/40 dark:hover:bg-white/[0.15] sm:min-w-[175px]"
            >
              <Landmark className="h-5 w-5 text-[#9a6a35] transition-transform duration-300 group-hover:scale-110" />
              <span>معالم وآثار وه</span>
              <ArrowLeft className="h-4 w-4 opacity-50 transition-transform duration-300 group-hover:-translate-x-1 group-hover:opacity-100" />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActivePage('map')}
              className="group flex min-h-[52px] items-center justify-center gap-2.5 rounded-2xl border border-black/15 bg-white/70 px-5 text-sm font-bold text-[#211d18] backdrop-blur-md transition-all hover:border-[#9a6a35]/50 hover:bg-white hover:shadow-sm dark:border-white/20 dark:bg-white/[0.08] dark:text-white dark:hover:border-white/40 dark:hover:bg-white/[0.15] sm:min-w-[155px]"
            >
              <Ship className="h-5 w-5 text-[#9a6a35] transition-transform duration-300 group-hover:scale-110" />
              <span>خريطة وه للصعيد</span>
              <ArrowLeft className="h-4 w-4 opacity-50 transition-transform duration-300 group-hover:-translate-x-1 group-hover:opacity-100" />
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="mt-6 flex flex-wrap items-center gap-3 sm:gap-5 pt-4 border-t border-black/10 dark:border-white/10 text-xs font-bold text-[#211d18]/80 dark:text-white/80"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#9a6a35]/15 text-[#9a6a35]">
                <ShoppingBag className="h-3.5 w-3.5" />
              </span>
              <span>سوق كامل: اشترى على طول، ادفع بأمان، والتوصيل لحد باب بيتك</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#9a6a35]/15 text-[#9a6a35]">
                <Film className="h-3.5 w-3.5" />
              </span>
              <span>فيديوهات حقيقيه من قلب ورش، وأماكن، وخبايا الصعيد</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#9a6a35]/15 text-[#9a6a35]">
                <Landmark className="h-3.5 w-3.5" />
              </span>
              <span>حكايات ومعالم صعيدية تعيش معاها</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.55 }}
            className="mt-9 grid max-w-xl grid-cols-3 gap-2 border-t border-black/15 pt-5 dark:border-white/15"
          >
            <div className="text-right">
              <span className="block text-xl font-black text-[#9a6a35] sm:text-2xl">
                {wahStats?.governoratesCount}
              </span>
              <span className="text-[10px] font-medium text-black/70 dark:text-white/55 sm:text-xs">
                محافظات صعيدية
              </span>
            </div>
            <div className="border-r border-black/15 pr-3 text-right dark:border-white/10 sm:pr-5">
              <span className="block text-xl font-black text-[#9a6a35] sm:text-2xl">
                {wahStats?.placesCount}+
              </span>
              <span className="text-[10px] font-medium text-black/70 dark:text-white/55 sm:text-xs">
                معلم وموقع
              </span>
            </div>
            <div className="border-r border-black/15 pr-3 text-right dark:border-white/10 sm:pr-5">
              <span className="block text-xl font-black text-[#9a6a35] sm:text-2xl">
                {wahStats?.craftsCount}
              </span>
              <span className="text-[10px] font-medium text-black/70 dark:text-white/55 sm:text-xs">
                حرفة وصنعة
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Subtle bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-[#9a6a35]" />
    </section>
  );
};
