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
      className="relative overflow-hidden bg-background text-foreground transition-colors duration-500"
    >
      {/* ========================================================= */}
      {/* 📱 Mobile Layout (< lg)                                   */}
      {/* ========================================================= */}
      <div className="relative h-dvh w-full flex flex-col justify-between p-5 pb-8 overflow-hidden lg:hidden bg-background transition-colors duration-500">

        {/* 1. الصورة والتدرج السفلي */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://res.cloudinary.com/kuana1nl/image/upload/v1788832698/WAH/heritage-places/alexan-pasha-palace/dclassic-2026-08-21-02083951477127237e_1788832673058_bzeh.jpg"
            alt="قصر ألكسان باشا"
            className="h-full w-full object-cover object-center"
          />

          {/* فيد الموبايل السفلي متطابق مع الخلفية */}
          <div className="absolute inset-x-0 bottom-0 h-[75%] bg-linear-to-t from-background via-background/80 to-transparent pointer-events-none transition-colors duration-500" />
          {/* فيد الموبايل العلوي لحماية الشارة */}
          <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/40 to-transparent pointer-events-none" />
        </div>

        {/* 2. شارة الموقع بالأعلى */}
        <div className="relative z-10 pt-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white border border-white/15 shadow-sm">
            <MapPin className="h-3 w-3 text-primary" />
            أسيوط · قلب الصعيد
          </span>
        </div>

        {/* 3. منطقة الكلام والأزرار */}
        <div className="relative z-10 space-y-4">
          <div className="space-y-2 text-right">
            <span className="inline-block text-[11px] font-bold text-accent bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full shadow-xs">
              شغل يدوي · ريلز · حكاوي زمان
            </span>

            <h1 className="font-heritage text-5xl font-black text-foreground leading-[1.05] tracking-tight">
              الصعيد <span className="text-primary">بيحكي</span>
            </h1>

            <p className="text-xs text-foreground/80 leading-relaxed font-medium">
              أول مكان يجمع حلاوة الصعيد: سوق لشغل اليد، فيديوهات من قلب الورش، وحكاوي وتراث ملهاش مثيل.
            </p>
          </div>

          {/* زر الشراء الرئيسي */}
          <button
            type="button"
            onClick={() => setActivePage('products')}
            className="w-full flex items-center justify-between rounded-2xl bg-primary hover:bg-[#805423] text-white p-3.5 shadow-xl shadow-caramel/25 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-black">خش على سوق وه</span>
            </div>
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* أزرار سريعة */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setActivePage('reels')}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-foreground hover:bg-black text-background text-xs font-bold active:scale-95 shadow-xs transition-all"
            >
              <Film className="h-3.5 w-3.5 text-primary" />
              <span> ريلز وه</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('places')}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-foreground hover:bg-black text-background text-xs font-bold active:scale-95 shadow-xs transition-all"
            >
              <Landmark className="h-3.5 w-3.5 text-primary" />
              <span>أماكن وه</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('map')}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-foreground hover:bg-black text-background text-xs font-bold active:scale-95 shadow-xs transition-all"
            >
              <Ship className="h-3.5 w-3.5 text-primary" />
              <span>خريطة الصعيد</span>
            </button>
          </div>

          {/* إحصائيات سريعة */}
          <div className="flex items-center justify-between border-t border-foreground/15 pt-3 text-center text-foreground">
            <div>
              <span className="block text-sm font-black text-primary">{wahStats?.governoratesCount}</span>
              <span className="text-[10px] text-foreground-muted">محافظة</span>
            </div>
            <div className="h-4 w-px bg-foreground/15" />
            <div>
              <span className="block text-sm font-black text-primary">+{wahStats?.placesCount}</span>
              <span className="text-[10px] text-foreground-muted">مكان وأثر</span>
            </div>
            <div className="h-4 w-px bg-foreground/15" />
            <div>
              <span className="block text-sm font-black text-primary">{wahStats?.craftsCount}</span>
              <span className="text-[10px] text-foreground-muted">صنعة يدوية</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 💻 Desktop Layout (lg+)                                   */}
      {/* ========================================================= */}
      <div className="hidden lg:block relative min-h-170">
        <motion.div
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          className="absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <img
            src="https://res.cloudinary.com/kuana1nl/image/upload/q_auto,f_auto/v1789326122/WAH/heritage-places/alexan-pasha-palace/img_2824_1789326122576_jjul.jpg"
            alt="قصر ألكسان باشا"
            className="h-full w-full object-cover object-center opacity-85 contrast-105"
          />
        </motion.div>

        {/* الفيد الأفقي */}
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-l from-background via-background/85 via-55% to-transparent"
          aria-hidden="true"
        />

        {/* الفيد الرأسي */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-background via-background/50 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto flex min-h-170 max-w-375 items-center px-12 py-20">
          <div className="w-full max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-5 flex items-center gap-2"
            >
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-bold tracking-[0.12em] text-accent">
                أسيوط · قلب الصعيد
              </span>
              <span className="h-px w-10 bg-foreground/20" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.45 }}
              className="mb-6"
            >
              <WAHBadge
                variant="terracotta"
                size="md"
                icon={<Sparkles className="h-3.5 w-3.5 text-primary" />}
              >
                «كل الصعيد في وه: شغل يدوي أصيل · ريلز · حكاوي زمان»
              </WAHBadge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
              className="max-w-4xl font-heritage text-[7.5rem] xl:text-[8.5rem] font-black leading-[0.9] tracking-[-0.055em] text-foreground drop-shadow-sm"
            >
              الصعيد <span className="text-primary">بيحكي</span>
            </motion.h1>

            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 85, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="my-7 h-0.5 bg-primary"
            />

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.55 }}
              className="max-w-2xl text-base font-medium leading-8 text-foreground/90"
            >
              أول مكان يجمع حلاوة الصعيد كلها من{' '}
              <span className="font-bold text-accent">
                سوق وه لشغل اليد والخير الأصلي، ريلز وه من إيد ولاد البلد، وحكاوي وأماكن وه اللي ملهاش مثيل
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              className="mt-8 flex items-center gap-3"
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePage('products')}
                className="group flex min-h-13 items-center justify-center gap-3 rounded-2xl bg-primary hover:bg-[#805423] text-white px-6 text-sm font-black shadow-xl shadow-caramel/25 transition-all min-w-52.5"
              >
                <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span>خش سوق وه</span>
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePage('reels')}
                className="group flex min-h-13 items-center justify-center gap-2.5 rounded-2xl border border-primary/30 bg-surface px-5 text-sm font-bold text-foreground backdrop-blur-md transition-all hover:border-primary min-w-43.75"
              >
                <Film className="h-5 w-5 text-primary" />
                <span>فيديوهات وه</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePage('places')}
                className="group flex min-h-13 items-center justify-center gap-2.5 rounded-2xl border border-primary/30 bg-surface px-5 text-sm font-bold text-foreground backdrop-blur-md transition-all hover:border-primary min-w-43.75"
              >
                <Landmark className="h-5 w-5 text-primary" />
                <span>أماكن وه</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePage('map')}
                className="group flex min-h-13 items-center justify-center gap-2.5 rounded-2xl border border-primary/30 bg-surface px-5 text-sm font-bold text-foreground backdrop-blur-md transition-all hover:border-primary min-w-43.75"
              >
                <Ship className="h-5 w-5 text-primary" />
                <span>خريطة الصعيد</span>
              </motion.button>
            </motion.div>

            {/* Desktop Stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.55 }}
              className="mt-9 grid max-w-xl grid-cols-3 gap-2 border-t border-foreground/15 pt-5"
            >
              <div className="text-right">
                <span className="block text-2xl font-black text-primary">{wahStats?.governoratesCount}</span>
                <span className="text-xs font-medium text-foreground-muted">محافظة فـ الصعيد</span>
              </div>
              <div className="border-r border-foreground/15 pr-5 text-right">
                <span className="block text-2xl font-black text-primary">{wahStats?.placesCount}+</span>
                <span className="text-xs font-medium text-foreground-muted">مكان وأثر</span>
              </div>
              <div className="border-r border-foreground/15 pr-5 text-right">
                <span className="block text-2xl font-black text-primary">{wahStats?.craftsCount}</span>
                <span className="text-xs font-medium text-foreground-muted">صنعة وشغل إيد</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-primary" />
    </section>
  );
};