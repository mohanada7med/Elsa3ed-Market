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
} from 'lucide-react';
import { motion } from 'motion/react';

export const AboutSection: React.FC = () => {
  const { setShowIntroVideo, setActivePage } = useApp();

  const features = [
    {
      icon: MapPin,
      title: 'أماكن',
      text: 'بلاد وآثار ومعالم',
    },
    {
      icon: BookOpen,
      title: 'حكايات',
      text: 'حكاوي ومرويات زمان',
    },
    {
      icon: Sparkles,
      title: 'حرف',
      text: 'صنعة يد متوارثة',
    },
    {
      icon: ShoppingBag,
      title: 'سوق',
      text: 'من يد الصانع لحد عندك',
    },
  ];

  return (
    <section
      dir="rtl"
      className="
        relative
        overflow-hidden
        py-12
        sm:py-14
        bg-background
        text-foreground
        transition-colors
        duration-500
        border-t
        border-border-subtle
      "
    >
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="
            absolute
            -top-40
            -right-40
            w-105
            h-105
            rounded-full
            bg-primary/[0.07]
            blur-[100px]
          "
        />

        <div
          className="
            absolute
            -bottom-40
            -left-40
            w-95
            h-95
            rounded-full
            bg-amber-500/4
            blur-[100px]
          "
        />
      </div>

      <div
        className="
          relative
          max-w-312.5
          mx-auto
          px-5
          sm:px-8
          lg:px-10
        "
      >
        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-[1.05fr_0.95fr]
            gap-8
            lg:gap-14
            items-center
          "
        >
          {/* ─────────────────────
              LEFT — BRAND STORY
          ───────────────────── */}
          <motion.div
            initial={{
              opacity: 0,
              x: 25,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.6,
            }}
          >
            {/* Eyebrow */}
            <div
              className="
                inline-flex
                items-center
                gap-2
                mb-4
                text-[10px]
                font-black
                tracking-[0.18em]
                text-primary
              "
            >
              <span
                className="
                  w-7
                  h-px
                  bg-primary
                "
              />

              <span>وه | WAH</span>
            </div>

            {/* Title */}
            <h2
              className="
                text-3xl
                sm:text-4xl
                lg:text-5xl
                font-black
                font-serif
                leading-[1.15]
                tracking-tight
              "
            >
              الصعيد
              <span className="text-primary">
                {' '}مش مجرد مكان.
              </span>
              <br />

              <span className="text-foreground/80">
                الصعيد حكاية.
              </span>
            </h2>

            {/* Description */}
            <p
              className="
                mt-5
                max-w-xl
                text-xs
                sm:text-sm
                leading-7
                text-foreground-muted
              "
            >
              «وه» بتجمع روح الصعيد كله في مكان واحد؛
              ناسه، بلاده، حرفه، أكله وحكاياته.
              بنوثق الصنعة وبنقربك من شيوخها وناسها الطيبين.
            </p>

            {/* Features */}
            <div
              className="
                grid
                grid-cols-2
                sm:grid-cols-4
                gap-2
                mt-6
                max-w-xl
              "
            >
              {features.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      delay: index * 0.06,
                      duration: 0.35,
                    }}
                    className="
                      group
                      rounded-xl
                      border
                      border-border-subtle
                      bg-surface-subtle
                      px-3
                      py-3
                      backdrop-blur-md
                      transition-all
                      duration-300
                      hover:border-primary/35
                      hover:bg-white/70
                      dark:hover:bg-white/[0.07]
                    "
                  >
                    <Icon
                      className="
                        w-4
                        h-4
                        text-primary
                        mb-2
                        transition-transform
                        duration-300
                        group-hover:scale-110
                      "
                    />

                    <div
                      className="
                        text-[11px]
                        font-black
                      "
                    >
                      {item.title}
                    </div>

                    <div
                      className="
                        mt-0.5
                        text-[9px]
                        text-foreground-disabled
                      "
                    >
                      {item.text}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Actions */}
            <div
              className="
                flex
                flex-col
                sm:flex-row
                gap-2.5
                mt-6
              "
            >
              <motion.button
                type="button"
                whileHover={{
                  y: -2,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() => setShowIntroVideo(true)}
                className="
                  group
                  min-h-11
                  px-5
                  rounded-xl
                  bg-foreground
                  text-background
                  text-[11px]
                  font-black
                  flex
                  items-center
                  justify-center
                  gap-2
                  shadow-lg
                  shadow-black/10
                  transition-all
                  hover:bg-primary
                  dark:hover:bg-primary-hover
                  cursor-pointer
                "
              >
                <Film className="w-4 h-4" />

                <span>اتفرج على حكاية وه</span>

                <ArrowLeft
                  className="
                    w-3.5
                    h-3.5
                    transition-transform
                    duration-300
                    group-hover:-translate-x-1
                  "
                />
              </motion.button>

              <motion.button
                type="button"
                whileHover={{
                  y: -2,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() => setActivePage('products')}
                className="
                  min-h-11
                  px-5
                  rounded-xl
                  border
                  border-primary/25
                  bg-primary/[0.07]
                  text-primary
                  text-[11px]
                  font-black
                  flex
                  items-center
                  justify-center
                  gap-2
                  transition-all
                  hover:bg-primary
                  hover:text-white
                  cursor-pointer
                "
              >
                <ShoppingBag className="w-4 h-4" />

                <span>سوق وه</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{
                  y: -2,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() => setActivePage('places')}
                className="
                  min-h-11
                  px-5
                  rounded-xl
                  border
                  border-border-subtle
                  bg-surface-subtle
                  text-foreground
                  text-[11px]
                  font-black
                  flex
                  items-center
                  justify-center
                  gap-2
                  transition-all
                  hover:bg-black/5
                  dark:hover:bg-white/8
                  cursor-pointer
                "
              >
                <Landmark
                  className="
                    w-4
                    h-4
                    text-primary
                  "
                />

                <span>معالم الصعيد</span>
              </motion.button>
            </div>
          </motion.div>

          {/* ─────────────────────
              RIGHT — VISUAL
          ───────────────────── */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.97,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              relative
              h-75
              sm:h-85
              lg:h-97.5
            "
          >
            {/* Main Image */}
            <div
              className="
                absolute
                inset-0
                overflow-hidden
                rounded-4xl
                border
                border-white/30
                shadow-2xl
                shadow-black/10
              "
            >
              <img
                src="https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png"
                alt="وه - العالم الرقمي لصعيد مصر"
                className="
                  w-full
                  h-full
                  object-cover
                  transition-transform
                  duration-1200
                  hover:scale-105
                "
                loading="lazy"
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-linear-to-t
                  from-black/80
                  via-black/15
                  to-transparent
                "
              />

              {/* Image Content */}
              <div
                className="
                  absolute
                  inset-x-0
                  bottom-0
                  p-5
                  sm:p-6
                  text-white
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-[9px]
                    font-black
                    text-amber-300
                    mb-2
                  "
                >
                  <MapPin className="w-3.5 h-3.5" />

                  <span>من الفيوم لأسوان</span>
                </div>

                <h3
                  className="
                    text-xl
                    sm:text-2xl
                    font-black
                    font-serif
                  "
                >
                  كل شبر هنا وراه حكاية...
                </h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Signature */}
        <div
          className="
            mt-10
            flex
            items-center
            justify-center
            gap-3
            text-foreground/30
          "
        >
          <span className="w-10 h-px bg-current" />

          <span className="text-[9px] font-black tracking-widest">
            كل حكاية وليها أصل
          </span>

          <span className="w-10 h-px bg-current" />
        </div>
      </div>
    </section>
  );
};
