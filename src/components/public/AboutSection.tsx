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
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors
        duration-500
        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
        border-t
        border-black/10
        dark:border-white/10
      "
    >
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="
            absolute
            -top-40
            -right-40
            w-[420px]
            h-[420px]
            rounded-full
            bg-[#9a6a35]/[0.07]
            blur-[100px]
          "
        />

        <div
          className="
            absolute
            -bottom-40
            -left-40
            w-[380px]
            h-[380px]
            rounded-full
            bg-amber-500/[0.04]
            blur-[100px]
          "
        />
      </div>

      <div
        className="
          relative
          max-w-[1250px]
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
                text-[#9a6a35]
              "
            >
              <span
                className="
                  w-7
                  h-px
                  bg-[#9a6a35]
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
              <span className="text-[#9a6a35]">
                {' '}مش مجرد مكان.
              </span>
              <br />

              <span className="text-black/80 dark:text-white/80">
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
                text-black/55
                dark:text-white/55
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
                      border-black/[0.08]
                      dark:border-white/[0.08]
                      bg-white/45
                      dark:bg-white/[0.035]
                      px-3
                      py-3
                      backdrop-blur-md
                      transition-all
                      duration-300
                      hover:border-[#9a6a35]/35
                      hover:bg-white/70
                      dark:hover:bg-white/[0.07]
                    "
                  >
                    <Icon
                      className="
                        w-4
                        h-4
                        text-[#9a6a35]
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
                        text-black/40
                        dark:text-white/40
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
                  min-h-[44px]
                  px-5
                  rounded-xl
                  bg-[#211d18]
                  dark:bg-white
                  text-white
                  dark:text-black
                  text-[11px]
                  font-black
                  flex
                  items-center
                  justify-center
                  gap-2
                  shadow-lg
                  shadow-black/10
                  transition-all
                  hover:bg-[#9a6a35]
                  dark:hover:bg-[#d5a56d]
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
                  min-h-[44px]
                  px-5
                  rounded-xl
                  border
                  border-[#9a6a35]/25
                  bg-[#9a6a35]/[0.07]
                  text-[#9a6a35]
                  text-[11px]
                  font-black
                  flex
                  items-center
                  justify-center
                  gap-2
                  transition-all
                  hover:bg-[#9a6a35]
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
                  min-h-[44px]
                  px-5
                  rounded-xl
                  border
                  border-black/10
                  dark:border-white/10
                  bg-white/45
                  dark:bg-white/[0.04]
                  text-[#211d18]
                  dark:text-white
                  text-[11px]
                  font-black
                  flex
                  items-center
                  justify-center
                  gap-2
                  transition-all
                  hover:bg-black/5
                  dark:hover:bg-white/[0.08]
                  cursor-pointer
                "
              >
                <Landmark
                  className="
                    w-4
                    h-4
                    text-[#9a6a35]
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
              h-[300px]
              sm:h-[340px]
              lg:h-[390px]
            "
          >
            {/* Main Image */}
            <div
              className="
                absolute
                inset-0
                overflow-hidden
                rounded-[2rem]
                border
                border-white/70
                dark:border-white/10
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
                  duration-[1200ms]
                  hover:scale-105
                "
                loading="lazy"
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
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
            text-black/30
            dark:text-white/30
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
