import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowUpLeft,
  Compass,
  Crown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PortalMascot {
  src: string;
  role: string;
  badge: string;
  quote: string;
  reactionNote: string;
}

interface Portal {
  id: string;
  title: string;
  tagline: string;
  desc: string;
  badge: string;
  page:
  | 'products'
  | 'reels'
  | 'map'
  | 'places'
  | 'people'
  | 'food'
  | 'events';
  image: string;
  nameEn: string;
  accentColor: string;
  mascot: PortalMascot;
}

export const WahEcosystemPortalSection: React.FC = () => {
  const { setActivePage, wahStats } = useApp();

  const portals: Portal[] = [
    {
      id: 'marketplace',
      title: 'سوق وه.. من إيد الصانع لدارك',
      tagline: 'حاجة أصلية من الورشة لحد عندك',
      desc: 'سوق مليان خير الصعيد وشغل الورش الأصيل 100%، اشترِ اللي يعجبك والدفع أمان وشحن واصل لحد باب بيتك.',
      badge: 'دكان وه',
      page: 'products',
      image:
        'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790754/6d17f117-649a-4a79-b565-3f3eef139000.png',
      nameEn: 'WAH Marketplace',
      accentColor: 'from-amber-800/80',
      mascot: {
        src: '/mascot/pro.png',
        role: 'عم وه التاجر الأمين',
        badge: 'ضمان إيد الصانع',
        quote:
          'عم وه بيقولك: دي بضاعة من إيد صاحبها.. من الورشة لحد دارك.',
        reactionNote: 'من إيد الصانع لدارك',
      },
    },

    {
      id: 'reels',
      title: 'ريلز وحكاوي حية',
      tagline: 'شوف الصعيد بعينك واسمع حسه',
      desc: 'فيديوهات قصيرة وخفيفة تاخدك في ثواني جوة حيطان الورش، والأسواق، ووسط الناس في الشارع الصعيدي.',
      badge: 'ريلز من قلب الصعيد',
      page: 'reels',
      image:
        'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788789051/%D9%81%D8%AE%D8%A7%D8%B1%D8%B1%D8%B1%D8%B1.jpg',
      nameEn: 'Live Reels',
      accentColor: 'from-orange-950/70',
      mascot: {
        src: '/mascot/reels.png',
        role: 'عم وه صاحب العين المبدعه',
        badge: 'حكايات من قلب الصعيد',
        quote:
          'عم وه خدك معاه.. شوف الحكاية بعينك واسمع صوت الصعيد.',
        reactionNote: 'شوف الحكاية بعينك',
      },
    },

    {
      id: 'map',
      title: 'لفة على النيل والبلاد',
      tagline: 'خريطة تاخدك لكل شبر في الصعيد',
      desc: 'لف في بلادنا براحتك من أول بحري الصعيد لحد أسوان وبلاد النوبة، دوس على الخريطة وشوف كل حتة.',
      badge: 'الخريطة الحية',
      page: 'map',
      image:
        'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790207/d13c685b-4403-4983-96fe-49f3b7a925c3.png',
      nameEn: 'Interactive Atlas',
      accentColor: 'from-amber-900/60',
      mascot: {
        src: '/mascot/saaed.png',
        role: 'عم وه دليل البلاد',
        badge: 'لفة في بلادنا',
        quote:
          'عم وه يقولك: تعالى ألفّفك في بلادنا.. بلد بلد ونجع نجع.',
        reactionNote: 'تعالى ألفّفك',
      },
    },

    {
      id: 'places',
      title: 'آثار ومعالم بلدنا',
      tagline: 'حيطان عتيقة وحكاوي من سنين',
      desc: 'من عظمة الكرنك ودندرة وإدفو لحد الأديرة القديمة، وقصور المنيا، وبيوت النوبة الملونة على البحر.',
      badge: wahStats?.placesCount
        ? `${wahStats.placesCount} مكان متوثق`
        : 'أماكن متوثقة',
      page: 'places',
      image:
        'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788715371/WAH/heritage-places/karnak-temples/img_2332_1788715371753_8g8m.jpg',
      nameEn: 'Architectural Heritage',
      accentColor: 'from-[#9a6a35]/70',
      mascot: {
        src: '/mascot/athar.png',
        role: 'عم وه حارس الحكاية',
        badge: 'حكاية من زمان',
        quote:
          'عم وه واقف يحكيلك.. كل حجر هنا وراه حكاية تستاهل تتسمع.',
        reactionNote: 'كل حجر وراه حكاية',
      },
    },

    {
      id: 'people',
      title: 'أعلام ورموز الصعيد',
      tagline: 'شيوخ الصنعة وحراس الأصل والكلمة',
      desc: 'اتعرف على قامات الصعيد؛ شيوخ الصنعة اللي صانوا التراث، رواة السير، وكبار الأدباء والشعراء اللي شرفوا بلدهم.',
      badge: 'ناس ليها علامة',
      page: 'people',
      image:
        'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790532/8460cc50-45f5-4452-8f78-993668390750.png',
      nameEn: 'Figures of Upper Egypt',
      accentColor: 'from-[#744e26]/70',
      mascot: {
        src: '/mascot/fan.png',
        role: 'عم وه راوي السير',
        badge: 'ناس ليها سيرة',
        quote:
          'عم وه يعرفك على ناس ليها سيرة.. ناس سابت علامة في بلدها.',
        reactionNote: 'ناس ليها سيرة',
      },
    },

    {
      id: 'food',
      title: 'لقمة هنية من قلب بيوتنا',
      tagline: 'ريحة الفرن البلدي وطبيخ الطواجن',
      desc: 'طعم العيش الشمسي السخن، فايش بلبن الحمص، ويكة صعيدي مفروكة، كشك مقدوح بالسمن، وخير عسل القصب الصافي.',
      badge: 'أكل بيوت بلدي',
      page: 'food',
      image:
        'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790638/05ef9181-0c18-4290-8a57-b2d054054e7f.png',
      nameEn: 'Authentic Kitchen',
      accentColor: 'from-amber-950/70',
      mascot: {
        src: '/mascot/foods.png',
        role: 'عم وه صاحب السفرة',
        badge: 'لقمة من ريحة البيت',
        quote:
          'عم وه يقولك: دي مش مجرد أكلة.. دي ريحة بيت ولمة وأصل.',
        reactionNote: 'لقمة من ريحة البيت',
      },
    },

    {
      id: 'events',
      title: 'ليالي الموالد ولمّة الفرح',
      tagline: 'عصيان التحطيب وزغاريد المواسم',
      desc: 'فرحة كسر القصب، زحمة ونفحات سيدي عبد الرحيم القنائي، حلقات التحطيب في الأقصر، وشمس أبو سمبل لما تشرق.',
      badge: 'مواسم وليالي',
      page: 'events',
      image:
        'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790617/145b481b-d989-4d5b-82cf-26bbb0b5d6eb.png',
      nameEn: 'Seasons & Events',
      accentColor: 'from-[#5a3e1b]/70',
      mascot: {
        src: '/mascot/events.png',
        role: 'عم وه صاحب اللمة',
        badge: 'فرحة ولمّة',
        quote:
          'عم وه أخدك على اللمة.. موالد وفرحة وحكايات بتتكرر كل سنة.',
        reactionNote: 'تعالى على اللمة',
      },
    },
  ];

  const [activeId, setActiveId] = useState<string>(
    portals[0]?.id || ''
  );

  return (
    <section
      dir="rtl"
      className="
        py-16
        bg-transparent
        text-foreground
        transition-colors duration-500
        max-w-[1600px]
        mx-auto
        px-5
        sm:px-8
        lg:px-12
        overflow-x-clip
      "
    >
      {/* ======================================== */}
      {/* HEADER */}
      {/* ======================================== */}

      <div className="relative z-10 mb-12 sm:mb-16 text-foreground select-none">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <div>
            <div className="mb-6 flex items-center gap-3 text-[10px] font-black tracking-[0.28em] text-primary dark:text-primary-hover">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                <Compass
                  size={14}
                  className="animate-spin-slow text-accent"
                />
              </span>

              DISCOVER / أبواب ودليل «وه» السبعة
            </div>

            <br />

            <h1 className="max-w-6xl text-5xl sm:text-7xl lg:text-[8rem] font-black leading-[0.95] tracking-tight">
              أبواب
              <br />

              <span className="ps-22 mr-3 sm:mr-8 lg:mr-20 text-primary dark:text-primary-hover">
                وه
              </span>
            </h1>

            <div className="mt-8 grid max-w-3xl gap-6 sm:grid-cols-[80px_1fr] items-start">
              <div className="hidden sm:block">
                <div className="text-[10px] font-black tracking-[0.2em] text-foreground-disabled">
                  هتلاقى ايه
                </div>

                <div className="mt-3 h-px w-10 bg-accent" />
              </div>

              <div className="space-y-3">
                <p className="max-w-2xl text-sm font-medium leading-7 text-foreground-secondary sm:text-base sm:leading-8">
                  كل خير الصعيد متجمع في{' '}
                  <strong className="text-foreground font-black">
                    7 أبواب تراثية رئيسية
                  </strong>
                  . في كل باب، هتلاقي{' '}
                  <strong className="text-primary font-black">
                    «عم وه»
                  </strong>{' '}
                  متقمص دوراً أصيلاً وموثقاً حكايته بيده:
                  من تاجر الصنعة الأمين، لدليل النيل والرحالة،
                  لحارس العتيق وراعي بهجة الموالد!
                </p>

                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-bold text-primary">
                  <Crown size={13} className="shrink-0" />

                  <span>
                    «عم وه» مرافقك في الأبواب السبعة بشخصيات وأدوار فريدة
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================== */}
      {/* DESKTOP */}
      {/* ======================================== */}

      <div className="hidden lg:flex gap-3 h-[520px] w-full">
        {portals.map((portal, idx) => {
          const isActive = activeId === portal.id;

          return (
            <motion.div
              key={portal.id}
              role="button"
              tabIndex={0}
              onMouseEnter={() => setActiveId(portal.id)}
              onClick={() => setActivePage(portal.page)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActivePage(portal.page);
                }
              }}
              animate={{
                flex: isActive ? 4.5 : 1,
              }}
              transition={{
                duration: 0.55,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="
                relative
                h-full
                rounded-3xl
                overflow-hidden
                cursor-pointer
                shadow-lg
                select-none
                group
                border border-white/10
                bg-black
              "
            >
              <img
                src={portal.image}
                alt={portal.title}
                className="
                  absolute inset-0
                  w-full h-full
                  object-cover
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-105
                  opacity-85
                "
                loading="lazy"
              />

              <div
                className={`absolute inset-0 transition-opacity duration-500 ${isActive
                  ? 'bg-gradient-to-t from-black via-black/55 to-black/35'
                  : 'bg-black/70 hover:bg-black/55'
                  }`}
              />

              {/* CLOSED CARD */}

              <div
                className={`absolute inset-0 p-5 flex flex-col justify-between items-center transition-opacity duration-300 ${isActive
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-100'
                  }`}
              >
                <div className="flex flex-col items-center gap-1.5">
                  <span className="font-mono text-xs text-[#d5a56d] font-bold">
                    0{idx + 1}
                  </span>

                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 p-0.5 flex items-center justify-center overflow-hidden">
                    <img
                      src={portal.mascot.src}
                      alt={portal.mascot.role}
                      style={{
                        imageRendering: 'crisp-edges',
                      }}
                      className="
                        w-full
                        h-full
                        object-contain
                        -scale-x-100
                      "
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <h3 className="
                    text-white
                    font-bold
                    text-base
                    font-heritage
                    tracking-wide
                    [writing-mode:vertical-rl]
                    rotate-180
                    select-none
                  ">
                    {portal.title}
                  </h3>

                  <span className="
                    text-[10px]
                    font-mono
                    text-primary
                    [writing-mode:vertical-rl]
                    rotate-180
                    opacity-70
                  ">
                    {portal.mascot.role}
                  </span>
                </div>

                <div className="
                  w-2.5
                  h-2.5
                  rounded-full
                  bg-primary/70
                  animate-pulse
                " />
              </div>

              {/* OPEN CARD */}

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.35,
                      delay: 0.12,
                    }}
                    className="
                      absolute
                      inset-0
                      p-7
                      lg:p-8
                      flex
                      flex-col
                      justify-between
                      z-10
                    "
                  >
                    <div className="
                      flex
                      items-center
                      justify-between
                    ">
                      <div className="
                        flex
                        items-center
                        gap-2.5
                      ">
                        <span className="
                          font-mono
                          text-xs
                          px-2.5
                          py-1
                          rounded-full
                          bg-black/50
                          backdrop-blur-md
                          text-[#d5a56d]
                          font-bold
                          border border-white/10
                        ">
                          باب 0{idx + 1}
                        </span>

                        <span className="
                          inline-flex
                          items-center
                          gap-1.5
                          px-3
                          py-1
                          rounded-full
                          bg-primary
                          text-white
                          text-xs
                          font-bold
                          backdrop-blur-md
                          shadow-md
                        ">
                          <Sparkles className="w-3.5 h-3.5" />

                          <span>
                            {portal.badge}
                          </span>
                        </span>

                        <span className="
                          inline-flex
                          items-center
                          gap-1
                          px-3
                          py-1
                          rounded-full
                          bg-amber-500/20
                          text-amber-200
                          border border-amber-500/40
                          text-xs
                          font-bold
                          backdrop-blur-md
                        ">
                          <span>
                            {portal.mascot.role}
                          </span>
                        </span>
                      </div>

                      <div className="
                        w-10
                        h-10
                        rounded-full
                        bg-white/20
                        backdrop-blur-md
                        border border-white/30
                        flex
                        items-center
                        justify-center
                        text-white
                        group-hover:bg-primary
                        transition-colors
                        shadow-lg
                      ">
                        <ArrowUpLeft className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="
                      grid
                      grid-cols-[1fr_auto]
                      items-end
                      gap-6
                    ">
                      <div className="
                        max-w-xl
                        text-right
                        space-y-3
                      ">
                        <span className="
                          text-xs
                          uppercase
                          tracking-widest
                          text-primary-hover
                          font-black
                          block
                        ">
                          {portal.nameEn}
                        </span>

                        <h3 className="
                          text-2xl
                          sm:text-3xl
                          lg:text-4xl
                          font-black
                          text-white
                          font-heritage
                          leading-tight
                        ">
                          {portal.title}
                        </h3>

                        <p className="
                          text-xs
                          sm:text-sm
                          text-white/85
                          leading-relaxed
                          line-clamp-2
                        ">
                          {portal.desc}
                        </p>

                        <div className="
                          rounded-2xl
                          bg-black/60
                          border border-primary/40
                          p-3.5
                          backdrop-blur-md
                          space-y-1.5
                        ">
                          <div className="
                            flex
                            items-center
                            justify-between
                            text-[11px]
                            font-black
                            text-amber-300
                          ">
                            <span className="
                              flex
                              items-center
                              gap-1.5
                            ">
                              <span className="
                                w-2
                                h-2
                                rounded-full
                                bg-amber-400
                              " />

                              «عم وه»: {portal.mascot.role}
                            </span>

                            <span className="
                              text-[10px]
                              text-white/50
                              font-normal
                            ">
                              {portal.mascot.badge}
                            </span>
                          </div>

                          <p className="
                            text-xs
                            font-medium
                            text-white/95
                            leading-relaxed
                          ">
                            {portal.mascot.quote}
                          </p>
                        </div>

                        <div className="
                          pt-2
                          border-t
                          border-white/20
                          flex
                          items-center
                          justify-between
                          text-xs
                          text-[#d5a56d]
                        ">
                          <span className="italic">
                            {portal.tagline}
                          </span>

                          <span className="
                            font-bold
                            text-white
                            flex
                            items-center
                            gap-1
                          ">
                            افتح الباب الآن ←
                          </span>
                        </div>
                      </div>

                      <div className="
                        relative
                        shrink-0
                        flex
                        flex-col
                        items-center
                      ">
                        <div className="
                          absolute
                          -inset-2
                          rounded-full
                          bg-primary/20
                          blur-xl
                          animate-pulse
                          pointer-events-none
                        " />

                        <motion.div
                          animate={{
                            y: [0, -6, 0],
                          }}
                          transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="relative z-10"
                        >
                          <img
                            src={portal.mascot.src}
                            alt={portal.mascot.role}
                            style={{
                              imageRendering: 'crisp-edges',
                            }}
                            className="
                              h-44
                              sm:h-52
                              w-auto
                              object-contain
                              drop-shadow-[0_14px_25px_rgba(0,0,0,0.5)]
                              select-none
                            "
                          />
                        </motion.div>

                        <div className="
                          w-24
                          h-2
                          rounded-[100%]
                          bg-black/60
                          blur-xs
                          -mt-1
                        " />

                        <span className="
                          mt-1
                          text-[9px]
                          font-bold
                          text-amber-300/80
                          bg-black/50
                          px-2
                          py-0.5
                          rounded-full
                          border border-white/10
                          backdrop-blur-xs
                        ">
                          {portal.mascot.reactionNote}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* ======================================== */}
      {/* MOBILE + TABLET */}
      {/* ======================================== */}

      <div className="
        flex
        flex-col
        gap-5
        sm:grid
        sm:grid-cols-2
        lg:hidden
      ">
        {portals.map((portal, idx) => (
          <motion.div
            key={portal.id}
            role="button"
            tabIndex={0}
            onClick={() => setActivePage(portal.page)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActivePage(portal.page);
              }
            }}
            initial={{
              opacity: 0,
              y: 18,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              margin: '-40px',
            }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
              delay: idx * 0.03,
            }}
            whileTap={{
              scale: 0.985,
            }}
            className="
              group
              relative
              w-full
              overflow-hidden
              rounded-[28px]
              bg-black
              border border-white/10
              shadow-[0_12px_35px_rgba(0,0,0,0.2)]
              cursor-pointer
              select-none
            "
          >
            {/* ================================= */}
            {/* IMAGE */}
            {/* ================================= */}

            <div className="
              relative
              h-[270px]
              overflow-hidden
            ">
              <img
                src={portal.image}
                alt={portal.title}
                loading="lazy"
                decoding="async"
                className="
                  absolute
                  inset-0
                  h-full
                  w-full
                  object-cover
                  opacity-90
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-105
                "
              />

              {/* Main overlay */}

              <div className="
                absolute
                inset-0
                bg-gradient-to-t
                from-black
                via-black/20
                to-black/10
              " />

              {/* Accent */}

              <div
                className={`
                  absolute
                  inset-0
                  bg-gradient-to-b
                  ${portal.accentColor}
                  to-transparent
                  opacity-30
                `}
              />

              {/* ================================= */}
              {/* TOP */}
              {/* ================================= */}

              <div className="
                absolute
                top-4
                left-4
                right-4
                z-10
                flex
                items-center
                justify-between
              ">
                <span className="
                  rounded-full
                  border border-white/15
                  bg-black/50
                  px-2.5
                  py-1
                  text-[10px]
                  font-black
                  text-[#d5a56d]
                  backdrop-blur-md
                ">
                  0{idx + 1}
                </span>

                <span className="
                  rounded-full
                  bg-primary
                  px-3
                  py-1
                  text-[9px]
                  font-black
                  text-white
                  shadow-lg
                ">
                  {portal.badge}
                </span>
              </div>

              {/* ================================= */}
              {/* عم وه خارج من الصورة */}
              {/* ================================= */}

              <motion.div
                className="
                  absolute
                  bottom-[-5px]
                  left-4
                  z-20
                "
                animate={{
                  y: [0, -3, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {/* Glow */}

                <div className="
                  absolute
                  bottom-3
                  left-1/2
                  -translate-x-1/2
                  h-16
                  w-16
                  rounded-full
                  bg-primary/30
                  blur-2xl
                " />

                {/* Mascot */}

                <img
                  src={portal.mascot.src}
                  alt={portal.mascot.role}
                  style={{
                    imageRendering: 'crisp-edges',
                  }}
                  className="
                    relative
                    h-[118px]
                    w-auto
                    object-contain
                    select-none
                    -scale-x-100
                    drop-shadow-[0_10px_15px_rgba(0,0,0,0.65)]
                  "
                />
              </motion.div>

              {/* ================================= */}
              {/* ROLE */}
              {/* ================================= */}

              <div className="
                absolute
                bottom-4
                left-[92px]
                z-20
                rounded-full
                border border-white/15
                bg-black/60
                px-2.5
                py-1
                backdrop-blur-md
              ">
                <span className="
                  text-[8px]
                  font-black
                  text-amber-300
                ">
                  {portal.mascot.role}
                </span>
              </div>
            </div>

            {/* ================================= */}
            {/* CONTENT */}
            {/* ================================= */}

            <div className="
              relative
              bg-black
              px-5
              pb-5
              pt-4
              text-right
            ">
              {/* Accent line */}

              <div className="
                absolute
                top-0
                right-5
                h-[2px]
                w-10
                rounded-full
                bg-primary
              " />

              {/* English */}

              <span className="
                block
                text-[8px]
                font-black
                uppercase
                tracking-[0.25em]
                text-[#d5a56d]
                mb-1.5
              ">
                {portal.nameEn}
              </span>

              {/* Title */}

              <h3 className="
                text-[21px]
                font-black
                leading-tight
                tracking-tight
                text-white
                font-heritage
              ">
                {portal.title}
              </h3>

              {/* عم وه sentence */}

              <p className="
                mt-2
                max-w-[90%]
                text-[11px]
                font-medium
                leading-[1.7]
                text-white/60
              ">
                {portal.mascot.quote
                  .replace(/^عم وه[^:]*:\s*/i, '')
                  .replace(/^عم وه\s*/i, '')}
              </p>

              {/* Bottom */}

              <div className="
                mt-4
                flex
                items-center
                justify-between
                border-t
                border-white/10
                pt-3
              ">
                <span className="
                  text-[10px]
                  italic
                  text-[#d5a56d]
                ">
                  {portal.mascot.reactionNote}
                </span>

                <span className="
                  flex
                  items-center
                  gap-1
                  text-[10px]
                  font-black
                  text-white
                  transition-colors
                  group-hover:text-primary
                ">
                  ادخل الباب

                  <ArrowUpLeft className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};