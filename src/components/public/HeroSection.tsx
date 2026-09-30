import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowLeft,
  Landmark,
  ShoppingBag,
  Film,
  MapPin,
} from 'lucide-react';
import { motion } from 'motion/react';
import { WAHBadge } from '../../design-system/WAHBadge';
import { HOME_PATTERN_CONFIG, getHomePatternOpacity } from '../../config/homePatternConfig';

export const HeroSection: React.FC = () => {
  const { setActivePage, wahStats } = useApp();
  const heroConfig = HOME_PATTERN_CONFIG.hero;
  const isPatternActive = HOME_PATTERN_CONFIG.globalEnabled && heroConfig.enabled;

  return (
    <section
      dir="rtl"
      className="
        relative
        overflow-hidden
        bg-background
        text-foreground
        transition-colors
        duration-500
      "
    >
      {/* Authentic WAH Brand Heritage Corner Watermarks — يتم التحكم بها من config/homePatternConfig.ts */}
      {isPatternActive && heroConfig.topLeft.enabled && (
        <motion.div
          animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-0 w-80 sm:w-[500px] h-80 sm:h-[500px] pointer-events-none select-none z-0 mix-blend-multiply dark:mix-blend-screen"
          style={{
            opacity: getHomePatternOpacity(heroConfig.topLeft.opacity),
            backgroundImage: `url('${heroConfig.topLeft.pattern}')`,
            backgroundRepeat: 'repeat',
            backgroundSize: `${heroConfig.topLeft.scale}px auto`,
            maskImage: 'radial-gradient(circle at 15% 15%, black 20%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(circle at 15% 15%, black 20%, transparent 75%)'
          }}
          aria-hidden="true"
        />
      )}

      {isPatternActive && heroConfig.bottomRight.enabled && (
        <div
          className="hidden lg:block absolute bottom-0 right-0 w-[420px] h-[420px] pointer-events-none select-none z-0 mix-blend-multiply dark:mix-blend-screen"
          style={{
            opacity: getHomePatternOpacity(heroConfig.bottomRight.opacity),
            backgroundImage: `url('${heroConfig.bottomRight.pattern}')`,
            backgroundRepeat: 'repeat',
            backgroundSize: `${heroConfig.bottomRight.scale}px auto`,
            maskImage: 'radial-gradient(circle at 90% 90%, black 20%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(circle at 90% 90%, black 20%, transparent 75%)'
          }}
          aria-hidden="true"
        />
      )}
      {/* ========================================================= */}
      {/* 📱 Mobile Layout (< lg)                                   */}
      {/* ========================================================= */}

      <div
        className="
          relative
          h-dvh
          w-full
          flex
          flex-col
          justify-between
          overflow-hidden
          bg-background
          p-5
          pb-8
          transition-colors
          duration-500
          lg:hidden
        "
      >
        {/* ===================================================== */}
        {/* MOBILE BACKGROUND                                      */}
        {/* ===================================================== */}

        <div className="absolute inset-0 z-0">
          <img
            src="https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800,c_limit/v1788832698/WAH/heritage-places/alexan-pasha-palace/dclassic-2026-08-21-02083951477127237e_1788832673058_bzeh.jpg"
            alt="قصر ألكسان باشا"
            className="
              h-full
              w-full
              object-cover
              object-center
            "
            decoding="async"
            fetchPriority="high"
          />

          {/* الفيد السفلي */}

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              bottom-0
              h-[75%]
              bg-linear-to-t
              from-background
              via-background/80
              to-transparent
              transition-colors
              duration-500
            "
          />

          {/* الفيد العلوي */}

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              h-24
              bg-linear-to-b
              from-black/40
              to-transparent
            "
          />
        </div>

        {/* ===================================================== */}
        {/* عم وه — MOBILE                                         */}
        {/* ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            x: -80,
            y: 55,
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: [0, -4, 0],
          }}
          transition={{
            opacity: {
              duration: 0.7,
              delay: 0.65,
            },
            x: {
              duration: 0.8,
              delay: 0.65,
              ease: [0.22, 1, 0.36, 1],
            },
            y: {
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.3,
            },
          }}
          className="
  pointer-events-none
  absolute
  bottom-[48%]
  left-[24px]
  z-[5]
"
        >
          {/* الإضاءة خلف الشخصية */}

          <div
            className="
              absolute
              bottom-5
              left-1/2
              h-36
              w-36
              -translate-x-1/2
              rounded-full
              bg-primary/20
              blur-[55px]
            "
          />

          <img
            src="/mascot/welcoming.png"
            alt="عم وه"
            className="
              relative
              h-[175px]
              w-auto
              object-contain
              drop-shadow-[0_15px_18px_rgba(0,0,0,0.55)]
            "
            style={{
              imageRendering: 'crisp-edges',
            }}
          />

          {/* اسم عم وه */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.85,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 1.25,
              duration: 0.4,
            }}
            className="
              absolute
              bottom-5
              -right-3
              rounded-full
              border
              border-white/15
              bg-black/45
              px-3
              py-1.5
              shadow-lg
              backdrop-blur-md
            "
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_6px_rgba(255,255,255,0.35)]" />

                <span className="text-[9px] font-black leading-tight text-white">
                  أهلاً بيك، أنا عم وه 👋
                </span>
              </div>

              <span className="pl-3 text-[8px] leading-relaxed text-white/55">
                وهساعدك تكتشف حكايات الصعيد ومنتجاته
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* ===================================================== */}
        {/* LOCATION                                              */}
        {/* ===================================================== */}

        <div
          className="
            relative
            z-10
            flex
            items-center
            justify-between
            pt-2
          "
        >
          <span
            className="
              flex
              items-center
              gap-1.5
              rounded-full
              border
              border-white/15
              bg-black/40
              px-3
              py-1
              text-[11px]
              font-bold
              text-white
              shadow-sm
              backdrop-blur-md
            "
          >
            <MapPin className="h-3 w-3 text-primary" />

            أسيوط · قلب الصعيد
          </span>
        </div>

        {/* ===================================================== */}
        {/* MOBILE CONTENT                                         */}
        {/* ===================================================== */}

        <div className="relative z-10 space-y-4">
          <div className="space-y-2 text-right">
            <span
              className="
                inline-block
                rounded-full
                border
                border-primary/20
                bg-primary/10
                px-2.5
                py-0.5
                text-[11px]
                font-bold
                text-accent
                shadow-xs
              "
            >
              شغل يدوي · ريلز · حكاوي زمان
            </span>

            <h1
              className="
                font-heritage
                text-5xl
                font-normal
                leading-[1.15]
                tracking-normal
                text-foreground
              "
            >
              الصعيد{' '}
              <span className="text-primary">
                بيحكي
              </span>
            </h1>

            <p
              className="
                text-xs
                font-medium
                leading-relaxed
                text-foreground/80
              "
            >
              أول مكان يجمع حلاوة الصعيد:
              سوق لشغل اليد، فيديوهات من قلب
              الورش، وحكاوي وتراث ملهاش مثيل.
            </p>
          </div>

          {/* ================================================= */}
          {/* MAIN BUTTON                                        */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={() =>
              setActivePage('products')
            }
            className="
              flex
              w-full
              items-center
              justify-between
              rounded-2xl
              bg-primary
              p-3.5
              text-white
              shadow-xl
              shadow-caramel/25
              transition-all
              hover:bg-[#805423]
              active:scale-[0.98]
            "
          >
            <div className="flex items-center gap-2.5">
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/20
                "
              >
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>

              <span className="text-sm font-black">
                خش على سوق وه
              </span>
            </div>

            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* ================================================= */}
          {/* QUICK BUTTONS                                      */}
          {/* ================================================= */}

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() =>
                setActivePage('reels')
              }
              className="
                flex
                items-center
                justify-center
                gap-1.5
                rounded-xl
                bg-foreground
                py-2.5
                text-xs
                font-bold
                text-background
                shadow-xs
                transition-all
                hover:bg-black
                active:scale-95
              "
            >
              <Film className="h-3.5 w-3.5 text-primary" />

              <span>
                ريلز وه
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setActivePage('places')
              }
              className="
                flex
                items-center
                justify-center
                gap-1.5
                rounded-xl
                bg-foreground
                py-2.5
                text-xs
                font-bold
                text-background
                shadow-xs
                transition-all
                hover:bg-black
                active:scale-95
              "
            >
              <Landmark className="h-3.5 w-3.5 text-primary" />

              <span>
                أماكن وه
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setActivePage('map')
              }
              className="
                flex
                items-center
                justify-center
                gap-1.5
                rounded-xl
                bg-foreground
                py-2.5
                text-xs
                font-bold
                text-background
                shadow-xs
                transition-all
                hover:bg-black
                active:scale-95
              "
            >
              <MapPin className="h-3.5 w-3.5 text-primary" />

              <span>
                خريطة الصعيد
              </span>
            </button>
          </div>

          {/* ================================================= */}
          {/* MOBILE STATS                                       */}
          {/* ================================================= */}

          <div
            className="
              flex
              items-center
              justify-between
              border-t
              border-foreground/15
              pt-3
              text-center
              text-foreground
            "
          >
            <div>
              <span className="block text-sm font-black text-primary">
                {wahStats?.governoratesCount}
              </span>

              <span className="text-[10px] text-foreground-muted">
                محافظة
              </span>
            </div>

            <div className="h-4 w-px bg-foreground/15" />

            <div>
              <span className="block text-sm font-black text-primary">
                +{wahStats?.placesCount}
              </span>

              <span className="text-[10px] text-foreground-muted">
                مكان وأثر
              </span>
            </div>

            <div className="h-4 w-px bg-foreground/15" />

            <div>
              <span className="block text-sm font-black text-primary">
                {wahStats?.productsCount}
              </span>

              <span className="text-[10px] text-foreground-muted">
                منتجات صعيدية
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 💻 Desktop Layout (lg+)                                   */}
      {/* ========================================================= */}

      <div
        className="
          relative
          hidden
          min-h-170
          lg:block
        "
      >
        {/* ===================================================== */}
        {/* DESKTOP IMAGE                                          */}
        {/* ===================================================== */}

        <motion.div
          initial={{
            scale: 1.06,
          }}
          animate={{
            scale: 1,
          }}
          transition={{
            duration: 1.8,
            ease: 'easeOut',
          }}
          className="
            absolute
            inset-0
            overflow-hidden
          "
          aria-hidden="true"
        >
          <img
            src="https://res.cloudinary.com/kuana1nl/image/upload/q_auto,f_auto,w_1440,c_limit/v1789326122/WAH/heritage-places/alexan-pasha-palace/img_2824_1789326122576_jjul.jpg"
            alt="قصر ألكسان باشا"
            className="
              h-full
              w-full
              object-cover
              object-center
              opacity-85
              contrast-105
            "
            decoding="async"
          />
        </motion.div>

        {/* ===================================================== */}
        {/* DESKTOP IMAGE GRADIENTS                                */}
        {/* ===================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-linear-to-l
            from-background
            via-background/85
            via-55%
            to-transparent
          "
          aria-hidden="true"
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            h-2/3
            bg-linear-to-t
            from-background
            via-background/50
            to-transparent
          "
          aria-hidden="true"
        />

        {/* ===================================================== */}
        {/* عم وه — DESKTOP                                       */}
        {/* ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 70,
            x: 30,
          }}
          animate={{
            opacity: 1,
            y: [0, -6, 0],
            x: 0,
          }}
          transition={{
            opacity: {
              duration: 0.7,
              delay: 0.75,
            },
            x: {
              duration: 0.8,
              delay: 0.75,
              ease: [0.22, 1, 0.36, 1],
            },
            y: {
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.5,
            },
          }}
          className="
    pointer-events-none
    absolute
    bottom-[40px]
    left-[5%]
    z-[8]
    hidden
    lg:block
    xl:left-[8%]
  "
        >
          {/* Glow */}
          <div
            className="
      absolute
      bottom-10
      left-1/2
      h-72
      w-72
      -translate-x-1/2
      rounded-full
      bg-primary/20
      blur-[90px]
    "
          />

          {/* Character */}
          <img
            src="/mascot/welcoming.png"
            alt="عم وه"
            className="
      relative
      h-[270px]
      w-auto
      object-contain
      drop-shadow-[0_20px_25px_rgba(0,0,0,0.45)]
      xl:h-[330px]
    "
            style={{
              imageRendering: 'crisp-edges',
            }}
          />

          {/* Character Label */}
          <motion.div
            initial={{
              opacity: 0,
              x: 15,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 1.2,
              duration: 0.5,
            }}
            className="
  absolute
  bottom-24
-right-[20px]  rounded-full
  border
  border-white/15
  bg-black/45
  px-4
  py-2
  shadow-lg
  backdrop-blur-md
  whitespace-nowrap
"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(255,255,255,0.35)]" />

                <span className="text-[10px] font-black leading-tight text-white">
                  أهلاً بيك، أنا عم وه 👋
                </span>
              </div>

              <span className="pl-3.5 text-[9px] leading-relaxed text-white/55">
                وهساعدك تكتشف حكايات الصعيد ومنتجاته
              </span>
            </div>
          </motion.div>
        </motion.div>
        {/* ===================================================== */}
        {/* DESKTOP CONTENT                                        */}
        {/* ===================================================== */}

        <div
          className="
            relative
            z-10
            mx-auto
            flex
            min-h-170
            max-w-375
            items-center
            px-12
            py-20
          "
        >
          <div className="w-full max-w-3xl">
            {/* Location */}

            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 0.1,
              }}
              className="
                mb-5
                flex
                items-center
                gap-2
              "
            >
              <MapPin className="h-3.5 w-3.5 text-primary" />

              <span
                className="
                  text-[10px]
                  font-bold
                  tracking-[0.12em]
                  text-accent
                "
              >
                أسيوط · قلب الصعيد
              </span>

              <span
                className="
                  h-px
                  w-10
                  bg-foreground/20
                "
              />
            </motion.div>

            {/* Badge */}

            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.18,
                duration: 0.45,
              }}
              className="mb-6"
            >
              <WAHBadge
                variant="terracotta"
                size="md"
                icon={
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                }
              >
                «كل الصعيد في وه: شغل يدوي أصيل · ريلز · حكاوي زمان»
              </WAHBadge>
            </motion.div>

            {/* Title */}

            <motion.h1
              initial={{
                opacity: 0,
                y: 24,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.25,
                duration: 0.7,
                ease: [0.33, 1, 0.68, 1],
              }}
              className="
                max-w-4xl
                font-heritage
                text-[6.5rem]
                font-normal
                leading-[1.1]
                tracking-normal
                text-foreground
                drop-shadow-sm
                xl:text-[7.5rem]
              "
            >
              الصعيد{' '}
              <span className="text-primary">
                بيحكي
              </span>
            </motion.h1>

            {/* Accent Line */}

            <motion.div
              initial={{
                width: 0,
                opacity: 0,
              }}
              animate={{
                width: 85,
                opacity: 1,
              }}
              transition={{
                delay: 0.5,
                duration: 0.5,
              }}
              className="
                my-7
                h-0.5
                bg-primary
              "
            />

            {/* Description */}

            <motion.p
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.55,
                duration: 0.55,
              }}
              className="
                max-w-2xl
                text-base
                font-medium
                leading-8
                text-foreground/90
              "
            >
              أول مكان يجمع حلاوة الصعيد كلها من{' '}
              <span className="font-bold text-accent">
                سوق وه لشغل اليد والخير الأصلي، ريلز وه من إيد ولاد البلد، وحكاوي وأماكن وه اللي ملهاش مثيل
              </span>
            </motion.p>

            {/* ================================================= */}
            {/* BUTTONS                                           */}
            {/* ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 14,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.65,
                duration: 0.5,
              }}
              className="
                mt-8
                flex
                items-center
                gap-3
              "
            >
              {/* Market */}

              <motion.button
                type="button"
                whileHover={{
                  scale: 1.03,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() =>
                  setActivePage('products')
                }
                className="
                  group
                  flex
                  min-h-13
                  min-w-52.5
                  items-center
                  justify-center
                  gap-3
                  rounded-2xl
                  bg-primary
                  px-6
                  text-sm
                  font-black
                  text-white
                  shadow-xl
                  shadow-caramel/25
                  transition-all
                  hover:bg-[#805423]
                "
              >
                <ShoppingBag
                  className="
                    h-5
                    w-5
                    transition-transform
                    group-hover:scale-110
                  "
                />

                <span>
                  خش سوق وه
                </span>

                <ArrowLeft
                  className="
                    h-4
                    w-4
                    transition-transform
                    duration-300
                    group-hover:-translate-x-1
                  "
                />
              </motion.button>

              {/* Reels */}

              <motion.button
                type="button"
                whileHover={{
                  scale: 1.02,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() =>
                  setActivePage('reels')
                }
                className="
                  group
                  flex
                  min-h-13
                  min-w-43.75
                  items-center
                  justify-center
                  gap-2.5
                  rounded-2xl
                  border
                  border-primary/30
                  bg-surface
                  px-5
                  text-sm
                  font-bold
                  text-foreground
                  backdrop-blur-md
                  transition-all
                  hover:border-primary
                "
              >
                <Film className="h-5 w-5 text-primary" />

                <span>
                  فيديوهات وه
                </span>
              </motion.button>

              {/* Places */}

              <motion.button
                type="button"
                whileHover={{
                  scale: 1.02,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() =>
                  setActivePage('places')
                }
                className="
                  group
                  flex
                  min-h-13
                  min-w-43.75
                  items-center
                  justify-center
                  gap-2.5
                  rounded-2xl
                  border
                  border-primary/30
                  bg-surface
                  px-5
                  text-sm
                  font-bold
                  text-foreground
                  backdrop-blur-md
                  transition-all
                  hover:border-primary
                "
              >
                <Landmark className="h-5 w-5 text-primary" />

                <span>
                  أماكن وه
                </span>
              </motion.button>

              {/* Map */}

              <motion.button
                type="button"
                whileHover={{
                  scale: 1.02,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() =>
                  setActivePage('map')
                }
                className="
                  group
                  flex
                  min-h-13
                  min-w-43.75
                  items-center
                  justify-center
                  gap-2.5
                  rounded-2xl
                  border
                  border-primary/30
                  bg-surface
                  px-5
                  text-sm
                  font-bold
                  text-foreground
                  backdrop-blur-md
                  transition-all
                  hover:border-primary
                "
              >
                <MapPin className="h-5 w-5 text-primary" />

                <span>
                  خريطة الصعيد
                </span>
              </motion.button>
            </motion.div>

            {/* ================================================= */}
            {/* DESKTOP STATS                                      */}
            {/* ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.8,
                duration: 0.55,
              }}
              className="
                mt-9
                grid
                max-w-xl
                grid-cols-3
                gap-2
                border-t
                border-foreground/15
                pt-5
              "
            >
              <div className="text-right">
                <span
                  className="
                    block
                    text-2xl
                    font-black
                    text-primary
                  "
                >
                  {wahStats?.governoratesCount}
                </span>

                <span
                  className="
                    text-xs
                    font-medium
                    text-foreground-muted
                  "
                >
                  محافظة فـ الصعيد
                </span>
              </div>

              <div
                className="
                  border-r
                  border-foreground/15
                  pr-5
                  text-right
                "
              >
                <span
                  className="
                    block
                    text-2xl
                    font-black
                    text-primary
                  "
                >
                  {wahStats?.placesCount}+
                </span>

                <span
                  className="
                    text-xs
                    font-medium
                    text-foreground-muted
                  "
                >
                  مكان وأثر
                </span>
              </div>

              <div
                className="
                  border-r
                  border-foreground/15
                  pr-5
                  text-right
                "
              >
                <span
                  className="
                    block
                    text-2xl
                    font-black
                    text-primary
                  "
                >
                  {wahStats?.productsCount}
                </span>

                <span
                  className="
                    text-xs
                    font-medium
                    text-foreground-muted
                  "
                >
                  صنعة وشغل إيد
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM BRAND LINE                                         */}
      {/* ========================================================= */}

      <div
        className="
          absolute
          bottom-0
          left-0
          right-0
          z-20
          h-1
          bg-primary
        "
      />
    </section>
  );
};