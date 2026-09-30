import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Film,
  Store,
  BookOpen,
  Sparkles,
  ArrowLeft,
  ShoppingBag,
  Landmark,
  Award,
} from 'lucide-react';
import { motion } from 'motion/react';

export const AboutSection: React.FC = () => {
  const { setShowIntroVideo, setActivePage } = useApp();

  const features = [
    {
      icon: MapPin,
      title: 'بلاد ومعالم',
      text: 'خبايا القرى ومعالم الصعيد',
    },
    {
      icon: Award,
      title: 'رجالة الجنوب',
      text: 'قامات وشخصيات سابت بصمة',
    },
    {
      icon: Sparkles,
      title: 'صنعة يد',
      text: 'أسرار الحرف من إيدين شيوخها',
    },
    {
      icon: ShoppingBag,
      title: 'سوق وه',
      text: 'من إيد الصانع لباب بيتك',
    },
  ];

  return (
    <section
      dir="rtl"
      className="relative overflow-hidden py-14 sm:py-20 bg-background text-foreground transition-colors duration-500 border-t border-border-subtle"
    >
      {/* Ambient Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-1/4 right-5 w-96 h-96 rounded-full bg-primary/10 blur-[130px]" />
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* ─────────────────────────────────────────────────────────────
          LEFT (lg:col-span-7) — BRAND STORY & EDITORIAL CONTENT
      ───────────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1"
          >
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/5 backdrop-blur-md mb-6 self-start shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-black tracking-widest text-primary">
                وه | WAH • أرشيف الجنوب الحي
              </span>
            </div>

            {/* Hero Title */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-main leading-[1.25] tracking-tight text-foreground">
              الصعيد{' '}
              <span className="relative inline-block text-primary dark:text-primary-hover">
                <span className="relative z-5">مش مجرد مكان</span>
                <svg
                  className="absolute -bottom-2.5 left-0 w-full h-3 text-primary/35 pointer-events-none z-0"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2,16 Q50,2 98,16"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
              <br />
              <span className="text-foreground/80 font-normal text-2xl sm:text-4xl block mt-3">
                الصعيد حكاية بتتعاش.
              </span>
            </h2>
            {/* Narrative Description */}
            <p className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-foreground-muted font-normal">
              «وه» بتجمع روح الصعيد كله في مكان واحد؛ ناسه، بلاده، حرفه، أكله وحكاياته.
              بنوثق الصنعة وبنقربك من شيوخها وناسها الطيبين.
            </p>

            {/* Connected Features Rail */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-8 max-w-xl">
              {features.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06, duration: 0.35 }}
                    whileHover={{ y: -3 }}
                    className="group relative rounded-2xl border border-border-subtle bg-surface-subtle/80 p-3.5 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:bg-surface-subtle shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 mb-2.5">
                      <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    <div className="text-xs font-black text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </div>

                    <div className="mt-0.5 text-[10px] text-foreground-disabled leading-normal">
                      {item.text}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Action Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-8">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowIntroVideo(true)}
                className="group min-h-12 px-6 rounded-2xl bg-foreground text-background text-xs font-black flex items-center justify-center gap-3 shadow-xl hover:bg-primary hover:text-white transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-background/20 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Film className="w-3.5 h-3.5" />
                </div>
                <span>اتفرج على حكاية وه</span>
                <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1.5" />
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePage('products')}
                className="min-h-12 px-5 rounded-2xl border border-primary/30 bg-primary/10 text-primary text-xs font-black flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>سوق وه</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePage('places')}
                className="min-h-12 px-5 rounded-2xl border border-border-subtle bg-surface-subtle text-foreground text-xs font-black flex items-center justify-center gap-2 hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
              >
                <Landmark className="w-4 h-4 text-primary" />
                <span>معالم الصعيد</span>
              </motion.button>
            </div>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────────
          RIGHT (lg:col-span-5) — CHARACTER STAGE & DIORAMA
      ───────────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative flex items-center justify-center min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] order-1 lg:order-2"
          >
            {/* خلفية شمس الجنوب الدائرية المتوهجة */}
            <div className="absolute w-72 sm:w-88 lg:w-96 h-72 sm:h-88 lg:h-96 rounded-full bg-gradient-to-tr from-primary/30 via-primary/10 to-transparent blur-3xl -z-10 pointer-events-none" />

            {/* حلقة شمسية تراثية تدور ببطء */}
            <div className="absolute w-64 sm:w-80 h-64 sm:h-80 rounded-full border border-dashed border-primary/25 pointer-events-none -z-10 animate-[spin_50s_linear_infinite]" />
            <div className="absolute w-52 sm:w-64 h-52 sm:h-64 rounded-full border border-primary/15 pointer-events-none -z-10" />



            {/* مجسم الكراكتر مع حركة الطفو والظل */}
            <div className="relative z-10 flex flex-col items-center justify-center select-none">
              <motion.div
                animate={{ y: [0, -14, 0] }}
                whileHover={{ scale: 1.5 }}
                transition={{
                  y: {
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  scale: {
                    duration: 0.35,
                    ease: "easeOut",
                  },
                }}
                className="relative cursor-default"
              >
                <img
                  src="https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png"
                  alt="وه - العالم الرقمي لصعيد مصر"
                  className="h-72 sm:h-88 lg:h-[430px] w-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.22)]"
                  loading="lazy"
                />
              </motion.div>

              {/* ظل أرضي متزامن مع حركة الارتفاع */}
              <motion.div
                animate={{
                  scale: [1, 0.78, 1],
                  opacity: [0.35, 0.16, 0.35],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-40 sm:w-48 h-3.5 rounded-[100%] bg-black/40 blur-md -mt-3 -z-10"
              />
            </div>


          </motion.div>

        </div>

        {/* Bottom Signature Line */}
        <div className="mt-14 sm:mt-16 flex items-center justify-center gap-3 text-foreground/30">
          <span className="w-12 h-px bg-current" />
          <span className="text-[10px] font-black tracking-widest uppercase">
            كل حكاية وليها أصل • من قلب الجنوب
          </span>
          <span className="w-12 h-px bg-current" />
        </div>
      </div >
    </section >);
};
