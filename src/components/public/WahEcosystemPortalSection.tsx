
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AnimatePresence, motion } from 'motion/react';

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
      title: '"سوق وه" من إيد الصانع لدارك',
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
      title: 'لفة على النيل',
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
      className="mx-auto w-full max-w-[1600px] overflow-hidden px-3 pb-12 text-foreground sm:px-6 lg:px-10"
    >
      {/* ================= HEADER ================= */}

      <div className="relative z-10 mb-5 overflow-hidden select-none text-foreground sm:mb-12">

        <div className="relative grid items-center gap-3 sm:gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">

          {/* Typography */}

          <div className="relative z-10 py-3 sm:py-8">
            <div className="mb-3 flex items-center gap-2 sm:mb-5 sm:gap-3">
              <span className="h-px w-9 bg-accent" />
              <span className="text-[10px] font-bold tracking-wide text-foreground-secondary sm:text-xs">
                تعالى نكتشف حكاية الصعيد
              </span>
            </div>

            <h1 className="relative text-4xl font-normal leading-[1.1] tracking-tight sm:text-8xl sm:leading-[1.15] lg:text-[8.5rem]">
              <span className="block">أبواب</span>

              <span className="relative mt-1 inline-flex items-center gap-2 sm:gap-7">
                <span className="relative z-10 font-main text-primary dark:text-primary-hover">
                  وه
                </span>

                <div className="group relative mt-2 flex h-[62px] w-[52px] items-end justify-center sm:mt-5 sm:h-[100px] sm:w-[82px]">
                  <div className="absolute inset-x-1 top-0 bottom-0 rounded-t-[38px] rounded-b-sm border-[3px] border-accent/70 bg-accent/10 shadow-[0_8px_20px_rgba(180,95,66,0.12)] transition-all duration-500 group-hover:border-primary" />

                  <div className="relative z-10 mb-1 flex h-[88%] w-[78%] items-center justify-center rounded-t-[32px] rounded-b-sm border-2 border-[#8B542E] bg-gradient-to-br from-[#C99458] via-[#A96B3D] to-[#754426] shadow-[inset_3px_0_5px_rgba(255,255,255,0.2),inset_-3px_0_5px_rgba(0,0,0,0.2)] transition-all duration-500 group-hover:translate-x-1">
                    <div className="absolute inset-x-2 top-4 bottom-3 rounded-t-[24px] rounded-b-sm border border-[#E4B77D]/50" />
                    <div className="absolute inset-x-3 top-7 bottom-5 rounded-t-[20px] rounded-b-sm border border-[#754426]/40" />
                    <div className="absolute right-2 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border border-[#F5D18B] bg-[#D9AD65] shadow-sm" />
                  </div>

                  <div className="absolute -bottom-1 h-2 w-[85%] rounded-full bg-accent/30 blur-md" />
                </div>
              </span>
            </h1>

            {/* Description */}

            <div className="mt-3 grid max-w-2xl grid-cols-[25px_1fr] gap-2 sm:mt-12 sm:grid-cols-[65px_1fr] sm:gap-6">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black tracking-widest text-accent">
                  WAH
                </span>
                <span className="mt-3 h-full min-h-16 w-px bg-gradient-to-b from-accent/60 to-transparent sm:min-h-20" />
              </div>

              <div>
                <p className="text-xs font-medium leading-6 text-foreground-secondary sm:text-base sm:leading-9">
                  كل خير الصعيد متجمع في{' '}
                  <strong className="font-black text-foreground">
                    7 أبواب تراثية رئيسية
                  </strong>
                  . في كل باب، هتلاقي{' '}
                  <strong className="font-black text-primary dark:text-primary-hover">
                    «عم وه»
                  </strong>{' '}
                  متقمص دوراً أصيلاً وموثقاً حكايته بيده!
                </p>
              </div>
            </div>
          </div>

          {/* Main Mascot */}

          <div className="relative mx-auto flex h-[170px] w-full max-w-[340px] items-center justify-center sm:h-[300px] sm:max-w-[460px] lg:min-h-[510px]">
            <div className="absolute h-[85%] w-[85%] rounded-full border border-primary/10" />
            <div className="absolute h-[70%] w-[70%] rounded-full border border-dashed border-accent/20" />

            <motion.div
              className="relative z-10 flex h-full w-full items-end justify-center"
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="absolute bottom-8 h-48 w-48 rounded-full bg-accent/10 blur-3xl sm:h-64 sm:w-64" />

              <img
                src="/mascot/doors.png"
                alt="عم وه"
                className="relative z-10 h-[85%] max-w-[95%] object-contain object-bottom drop-shadow-[0_20px_25px_rgba(36,30,26,0.15)] transition-transform duration-700 hover:scale-105 sm:h-full sm:max-w-[125%]"
              />

              <div className="absolute right-0 top-3 z-20 hidden rounded-xl border border-border/70 bg-background/90 px-3 py-2 shadow-lg backdrop-blur-md sm:right-2 sm:top-10 sm:block sm:rounded-2xl sm:px-4 sm:py-3">
                <div className="text-[10px] font-bold text-foreground-secondary">
                  دليلك في كل حكاية
                </div>
                <div className="mt-1 text-sm font-black text-primary dark:text-primary-hover">
                  وكل مكان
                </div>
              </div>

              <div className="absolute bottom-4 left-2 z-20 hidden h-10 w-10 items-center justify-center rounded-full border border-accent/30 bg-background text-xs font-black text-accent shadow-sm sm:bottom-6 sm:left-4 sm:flex sm:h-12 sm:w-12 sm:text-sm">
                07
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* DESKTOP - ORIGINAL INTERACTIVE PORTALS */}
      {/* ================================================= */}

      <div className="hidden h-[520px] w-full gap-3 lg:flex">
        {portals.map((portal, idx) => {
          const isActive = activeId === portal.id;

          return (
            <motion.div
              key={portal.id}
              role="button"
              tabIndex={0}
              onMouseEnter={() => setActiveId(portal.id)}
              onFocus={() => setActiveId(portal.id)}
              onClick={() => setActivePage(portal.page)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActivePage(portal.page);
                }
              }}
              animate={{ flex: isActive ? 6.5 : 1 }}
              transition={{
                duration: 0.55,
                ease: [0.32, 0.72, 0, 1],
              }}
              aria-label={`${portal.title}: ${portal.tagline}`}
              className={`group relative h-full min-w-0 cursor-pointer select-none overflow-hidden rounded-3xl border bg-black shadow-lg transition-[border-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? 'border-primary/50 shadow-[0_18px_45px_rgba(0,0,0,0.4)]'
                  : 'border-white/10'
              }`}
            >
              <img
                src={portal.image}
                alt={portal.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-bottom opacity-85 transition-transform duration-700 ease-out group-hover:scale-105"
              />

              <div
                className={`absolute inset-0 transition-colors duration-500 ${
                  isActive
                    ? 'bg-gradient-to-t from-black via-black/55 to-black/35'
                    : 'bg-black/70 group-hover:bg-black/55'
                }`}
              />

              {/* Collapsed Content */}

              <div
                className={`absolute inset-0 flex flex-col items-center justify-between p-5 transition-opacity duration-300 ${
                  isActive
                    ? 'pointer-events-none opacity-0'
                    : 'opacity-100'
                }`}
              >
                <div className="flex flex-col items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-[#d5a56d]">
                    0{idx + 1}
                  </span>

                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 p-0.5">
                    <img
                      src={portal.mascot.src}
                      alt={portal.mascot.role}
                      className="h-full w-full object-contain -scale-x-100"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <h3 className="select-none text-base font-bold tracking-wide text-white [writing-mode:vertical-rl] rotate-180">
                    {portal.title}
                  </h3>

                  <span className="text-[10px] text-primary opacity-70 [writing-mode:vertical-rl] rotate-180">
                    {portal.mascot.role}
                  </span>
                </div>

                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary/70" />
              </div>

              {/* Expanded Content */}

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: 0.12,
                    }}
                    className="absolute inset-0 z-10 flex flex-col justify-center p-5 lg:p-7"
                  >
                    <div className="grid grid-cols-[1fr_auto] items-center gap-4 lg:gap-6">
                      <div className="max-w-xl space-y-3 text-right">
                        <span className="block text-xs font-black uppercase tracking-widest text-primary-hover">
                          {portal.nameEn}
                        </span>

                        <h3 className="font-cairo text-2xl font-black leading-tight text-white sm:text-3xl lg:text-4xl">
                          {portal.title}
                        </h3>

                        <p className="line-clamp-2 text-xs leading-relaxed text-white/85 sm:text-sm">
                          {portal.desc}
                        </p>

                        <div className="space-y-1.5 rounded-2xl border border-primary/40 bg-black/60 p-3.5 backdrop-blur-md">
                          <div className="flex items-center justify-between gap-2 text-[11px] font-black text-amber-300">
                            <span>
                              «عم وه»: {portal.mascot.role}
                            </span>

                            <span className="text-[10px] font-normal text-white/50">
                              {portal.mascot.badge}
                            </span>
                          </div>

                          <p className="text-xs font-medium leading-relaxed text-white/95">
                            {portal.mascot.quote}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/20 pt-2 text-xs text-[#d5a56d]">
                          <span className="italic">
                            {portal.tagline}
                          </span>

                          <span className="font-bold text-white">
                            افتح الباب الآن
                          </span>
                        </div>
                      </div>

                      <div className="relative flex shrink-0 flex-col items-center">
                        <div className="pointer-events-none absolute -inset-2 animate-pulse rounded-full bg-primary/20 blur-xl" />

                        <motion.div
                          animate={{ y: [0, -6, 0] }}
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
                            className="h-44 w-auto select-none object-contain drop-shadow-[0_14px_25px_rgba(0,0,0,0.5)] sm:h-52"
                          />
                        </motion.div>

                        <div className="-mt-1 h-2 w-24 rounded-[100%] bg-black/60 blur-sm" />

                        <span className="mt-1 rounded-full border border-white/10 bg-black/50 px-2 py-0.5 text-[9px] font-bold text-amber-300/80 backdrop-blur-sm">
                          {portal.mascot.reactionNote}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pointer-events-none absolute inset-2 rounded-[1.3rem] border border-white/15" />
            </motion.div>
          );
        })}
      </div>

      {/* ================================================= */}
      {/* MOBILE + TABLET - NEW CARD DESIGN */}
      {/* ================================================= */}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:hidden">
        {portals.map((portal, idx) => {
          const featured = idx === 0;

          return (
            <motion.button
              key={portal.id}
              type="button"
              onClick={() => setActivePage(portal.page)}
              initial={{
                opacity: 0,
                y: 25,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.1,
              }}
              transition={{
                duration: 0.5,
                delay: idx * 0.045,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileTap={{
                scale: 0.98,
              }}
              aria-label={`${portal.title}: ${portal.tagline}`}
              className={`
                group relative flex min-h-[190px] w-full flex-col
                overflow-hidden rounded-[22px] border border-white/10
                bg-[#21140d] text-right shadow-lg
                transition-all duration-500
                hover:border-primary/50
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-primary
                sm:min-h-[230px] sm:rounded-[28px]
                ${featured ? 'col-span-2 min-h-[230px] sm:min-h-[280px]' : ''}
              `}
            >
              {/* Background Image */}

              <img
                src={portal.image}
                alt={portal.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay */}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />

              <div
                className={`absolute inset-0 bg-gradient-to-br ${portal.accentColor} opacity-40`}
              />

              {/* Inner Border */}

              <div className="pointer-events-none absolute inset-2 z-20 rounded-[17px] border border-white/15 sm:inset-3 sm:rounded-[21px]" />

              {/* Top Information */}

              <div className="absolute inset-x-4 top-4 z-10 flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold tracking-widest text-white/75 sm:text-xs">
                  0{idx + 1} / 07
                </span>

                <span className="max-w-[75%] truncate rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[9px] font-bold text-[#f4d18e] backdrop-blur-md sm:text-[10px]">
                  {portal.badge}
                </span>
              </div>

              {/* Uncle WAH */}

              <motion.div
                className={`absolute bottom-0 left-2 z-10 flex items-end justify-center ${
                  featured
                    ? 'h-[78%] w-[43%] sm:h-[85%] sm:w-[40%]'
                    : 'h-[65%] w-[42%] sm:h-[72%]'
                }`}
                animate={{
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 3.5 + idx * 0.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <img
                  src={portal.mascot.src}
                  alt={portal.mascot.role}
                  loading="lazy"
                  className="h-full max-w-full object-contain object-bottom drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-105"
                />
              </motion.div>

              {/* Text Content */}

              <div
                className={`absolute bottom-0 right-0 z-10 flex flex-col justify-end ${
                  featured
                    ? 'w-[68%] p-4 sm:w-[65%] sm:p-7'
                    : 'w-[72%] p-3 sm:w-[75%] sm:p-5'
                }`}
              >
                <span className="mb-1 text-[8px] font-bold uppercase tracking-widest text-[#e9b978] sm:text-[10px]">
                  {portal.nameEn}
                </span>

                <h3
                  className={`font-black leading-[1.5] text-white ${
                    featured
                      ? 'text-base sm:text-2xl'
                      : 'text-xs sm:text-base'
                  }`}
                >
                  {portal.title}
                </h3>

                <p
                  className={`mt-1 line-clamp-2 text-white/70 ${
                    featured
                      ? 'text-[10px] leading-5 sm:text-sm sm:leading-7'
                      : 'text-[9px] leading-4 sm:text-xs sm:leading-5'
                  }`}
                >
                  {featured ? portal.desc : portal.tagline}
                </p>

                {/* Featured Quote */}

                {featured && (
                  <div className="mt-3 hidden border-t border-white/20 pt-3 sm:block">
                    <p className="text-xs font-bold text-amber-200">
                      {portal.mascot.role}
                    </p>

                    <p className="mt-1 text-xs leading-6 text-white/80">
                      {portal.mascot.quote}
                    </p>
                  </div>
                )}

                {/* Action */}

                <div className="mt-2 flex items-center gap-2 text-[9px] font-bold text-[#f4d18e] sm:text-[11px]">
                  <span>اكتشف الحكاية</span>

                  <span className="transition-transform duration-300 group-hover:-translate-x-2">
                    ←
                  </span>
                </div>
              </div>

              {/* Hover Light */}

              <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-tr from-primary/0 via-transparent to-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </motion.button>
          );
        })}
      </div>

      {/* ================= FOOTER ================= */}

      <div className="mt-8 flex flex-col items-center justify-center gap-3 border-t border-border/60 pt-6 text-center sm:mt-12 sm:flex-row">
        <span className="text-xs font-bold text-primary">
          WAH — وه
        </span>

        <span className="hidden h-1 w-1 rounded-full bg-primary/40 sm:block" />

        <p className="text-xs leading-6 text-foreground-secondary">
          الصعيد مش مجرد مكان.. الصعيد حكاية وأصل وناس.
        </p>
      </div>
    </section>
  );
};
