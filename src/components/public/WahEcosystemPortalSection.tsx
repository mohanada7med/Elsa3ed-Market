import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowUpLeft, Compass, MessageCircle, Crown } from 'lucide-react';
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
  page: 'products' | 'reels' | 'map' | 'places' | 'people' | 'food' | 'events';
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
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790754/6d17f117-649a-4a79-b565-3f3eef139000.png',
      nameEn: 'WAH Marketplace',
      accentColor: 'from-amber-800/80',
      mascot: {
        src: '/mascot/empty-cart.png',
        role: 'عم وه التاجر الأمين',
        badge: 'ضمان إيد الصانع 100%',
        quote: '«نقيت لكم أنضف شغل يدوي من أصحاب الورش مباشرة؛ لا وسيط ولا لف.. متسعر بالحق ويوصل لحد دارك!»',
        reactionNote: 'حامل قفة وسلة خيرات الصعيد',
      },
    },
    {
      id: 'reels',
      title: 'ريلز وحكاوي حية',
      tagline: 'شوف الصعيد بعينك واسمع حسه',
      desc: 'فيديوهات قصيرة وخفيفة تاخدك في ثواني جوة حيطان الورش، والأسواق، ووسط الناس في الشارع الصعيدي.',
      badge: 'ريلز من قلب الصعيد',
      page: 'reels',
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788789051/%D9%81%D8%AE%D8%A7%D8%B1%D8%B1%D8%B1%D8%B1.jpg',
      nameEn: 'Live Reels',
      accentColor: 'from-orange-950/70',
      mascot: {
        src: '/mascot/quiz.png',
        role: 'عم وه مصوّر الحكاوي',
        badge: 'صوت وصورة من قلب الحدث',
        quote: '«نزلت بكاميرتي في قلب الدكاكين والأزقة والأسواق.. شوفوا حس الصعيد الحقيقي والضحكة والجدعنة بعينكم!»',
        reactionNote: 'متحمس يوثق بالفيديو والصوت',
      },
    },
    {
      id: 'map',
      title: 'لفة على النيل والبلاد',
      tagline: 'خريطة تاخدك لكل شبر في الصعيد',
      desc: 'لف في بلادنا براحتك من أول بحري الصعيد لحد أسوان وبلاد النوبة، دوس على الخريطة وشوف كل حتة.',
      badge: 'الخريطة الحية',
      page: 'map',
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790207/d13c685b-4403-4983-96fe-49f3b7a925c3.png',
      nameEn: 'Interactive Atlas',
      accentColor: 'from-amber-900/60',
      mascot: {
        src: '/mascot/welcoming.png',
        role: 'عم وه دليل الرحالة',
        badge: 'شبر شبر ع النيل',
        quote: '«مشيت على ضفاف النيل ورسمت لكم كل نجع وقرية ومحافظة.. دوس على أي بقعة في الخريطة ولف في بلادنا براحتك!»',
        reactionNote: 'فاتح دراعاته يرحب بالمسافرين',
      },
    },
    {
      id: 'places',
      title: 'آثار ومعالم بلدنا',
      tagline: 'حيطان عتيقة وحكاوي من سنين',
      desc: 'من عظمة الكرنك ودندرة وإدفو لحد الأديرة القديمة، وقصور المنيا، وبيوت النوبة الملونة على البحر.',
      badge: wahStats?.placesCount ? `${wahStats.placesCount} مكان متوثق` : 'أماكن متوثقة',
      page: 'places',
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788715371/WAH/heritage-places/karnak-temples/img_2332_1788715371753_8g8m.jpg',
      nameEn: 'Architectural Heritage',
      accentColor: 'from-[#9a6a35]/70',
      mascot: {
        src: '/mascot/char.png',
        role: 'عم وه حارس العتيق',
        badge: 'وقار 7000 سنة حضارة',
        quote: '«وقفت تحت حيطان المعابد والبيوت القديمة وسألت الرواة والمؤرخين.. وسجلت لكم سر أجدادنا وعزتهم التي لا تنكسر!»',
        reactionNote: 'واقف بالهيبة والعصا حارساً للآثار',
      },
    },
    {
      id: 'people',
      title: 'أعلام ورموز الصعيد',
      tagline: 'شيوخ الصنعة وحراس الأصل والكلمة',
      desc: 'اتعرف على قامات الصعيد؛ شيوخ الصنعة اللي صانوا التراث، رواة السير، وكبار الأدباء والشعراء اللي شرفوا بلدهم.',
      badge: 'ناس ليها علامة',
      page: 'people',
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790532/8460cc50-45f5-4452-8f78-993668390750.png',
      nameEn: 'Figures of Upper Egypt',
      accentColor: 'from-[#744e26]/70',
      mascot: {
        src: '/mascot/fav.png',
        role: 'عم وه راوي السير العطرة',
        badge: 'في مضايف الأكابر',
        quote: '«قعدت في مضايف شيوخ الصنعة والشعراء وأهل الكرم، وجمعت سيرتهم اللي تشرّف كل صعيدي وتفضل فخر لأولادنا!»',
        reactionNote: 'مبتسم بفخر في مضايف الكبار',
      },
    },
    {
      id: 'food',
      title: 'لقمة هنية من قلب بيوتنا',
      tagline: 'ريحة الفرن البلدي وطبيخ الطواجن',
      desc: 'طعم العيش الشمسي السخن، فايش بلبن الحمص، ويكة صعيدي مفروكة، كشك مقدوح بالسمن، وخير عسل القصب الصافي.',
      badge: 'أكل بيوت بلدي',
      page: 'food',
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790638/05ef9181-0c18-4290-8a57-b2d054054e7f.png',
      nameEn: 'Authentic Kitchen',
      accentColor: 'from-amber-950/70',
      mascot: {
        src: '/mascot/welcoming.png',
        role: 'عم وه صاحب السفرة البلدي',
        badge: 'نَفَس بلدي بالسمنة الصافية',
        quote: '«دخلت مطابخ أهالينا ودوقت العيش الشمسي السخن وطواجن البامية بالسمن البلدي.. أكل صعيدي يروق البال ويغذي الروح!»',
        reactionNote: 'متهلل بالخير واللقمة الهنية',
      },
    },
    {
      id: 'events',
      title: 'ليالي الموالد ولمّة الفرح',
      tagline: 'عصيان التحطيب وزغاريد المواسم',
      desc: 'فرحة كسر القصب، زحمة ونفحات سيدي عبد الرحيم القنائي، حلقات التحطيب في الأقصر، وشمس أبو سمبل لما تشرق.',
      badge: 'مواسم وليالي',
      page: 'events',
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790617/145b481b-d989-4d5b-82cf-26bbb0b5d6eb.png',
      nameEn: 'Seasons & Events',
      accentColor: 'from-[#5a3e1b]/70',
      mascot: {
        src: '/mascot/quiz.png',
        role: 'عم وه راعي البهجة والمواسم',
        badge: 'نفحات وبركة ولمة حبايب',
        quote: '«حضرت ليالي الذكر ودقة عصايا التحطيب وزغاريد الموالد.. جبت لكم بهجة مواسم الجنوب ونفحاتها اللي تشرح القلب!»',
        reactionNote: 'مستمتع بدقة التحطيب والإنشاد',
      },
    },
  ];

  const [activeId, setActiveId] = useState<string>(portals[0]?.id || '');

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
      {/* الرأس التحريري */}
      <div className="relative z-10 mb-12 sm:mb-16 text-foreground select-none">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <div>
            {/* الشارة العلوية */}
            <div className="mb-6 flex items-center gap-3 text-[10px] font-black tracking-[0.28em] text-primary dark:text-primary-hover">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                <Compass size={14} className="animate-spin-slow text-accent" />
              </span>
              DISCOVER / أبواب ودليل «وه» السبعة
            </div>
            <br />
            {/* العنوان التايبوغرافي المتجاوب */}
            <h1 className="max-w-6xl text-5xl sm:text-7xl lg:text-[8rem] font-black leading-[0.95] tracking-tight">
              أبواب
              <br />
              <span className="ps-22 mr-3 sm:mr-8 lg:mr-20 text-primary dark:text-primary-hover">
                وه
              </span>
            </h1>
            {/* الشرح والمؤشر الجانبي */}
            <div className="mt-8 grid max-w-3xl gap-6 sm:grid-cols-[80px_1fr] items-start">
              <div className="hidden sm:block">
                <div className="text-[10px] font-black tracking-[0.2em] text-foreground-disabled">
                  هتلاقى ايه
                </div>
                <div className="mt-3 h-px w-10 bg-accent" />
              </div>

              <div className="space-y-3">
                <p className="max-w-2xl text-sm font-medium leading-7 text-foreground-secondary sm:text-base sm:leading-8">
                  كل خير الصعيد متجمع في <strong className="text-foreground font-black">7 أبواب تراثية رئيسية</strong>.
                  في كل باب، هتلاقي <strong className="text-primary font-black">«عم وه»</strong> متقمص دوراً أصيلاً وموثقاً حكايته بيده:
                  من تاجر الصنعة الأمين، لدليل النيل والرحالة، لحارس العتيق وراعي بهجة الموالد!
                </p>

                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-bold text-primary">
                  <Crown size={13} className="shrink-0" />
                  <span>«عم وه» مرافقك في الأبواب السبعة بشخصيات وأدوار فريدة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* شاشة سطح المكتب: أكورديون أفقي متمدد سينمائي بحضور مميز لعم وه في كل باب */}
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
              transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
              className="relative h-full rounded-3xl overflow-hidden cursor-pointer shadow-lg select-none group border border-white/10 bg-black"
            >
              <img
                src={portal.image}
                alt={portal.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-85"
                loading="lazy"
              />

              <div
                className={`absolute inset-0 transition-opacity duration-500 ${
                  isActive
                    ? 'bg-gradient-to-t from-black via-black/55 to-black/35'
                    : 'bg-black/70 hover:bg-black/55'
                }`}
              />

              {/* الحالة المنكمشة: يظهر فيها رقم الباب وعنوانه وصورة مصغرة لعم وه في هذا الباب */}
              <div
                className={`absolute inset-0 p-5 flex flex-col justify-between items-center transition-opacity duration-300 ${
                  isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              >
                <div className="flex flex-col items-center gap-1.5">
                  <span className="font-mono text-xs text-[#d5a56d] font-bold">
                    0{idx + 1}
                  </span>
                  {/* عم وه مصغر في الحالة المنكمشة */}
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 p-0.5 flex items-center justify-center overflow-hidden">
                    <img
                      src={portal.mascot.src}
                      alt={portal.mascot.role}
                      style={{ imageRendering: 'crisp-edges' }}
                      className="w-full h-full object-contain -scale-x-100"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-white font-bold text-base font-heritage tracking-wide [writing-mode:vertical-rl] rotate-180 select-none">
                    {portal.title}
                  </h3>
                  <span className="text-[10px] font-mono text-primary [writing-mode:vertical-rl] rotate-180 opacity-70">
                    {portal.mascot.role}
                  </span>
                </div>

                <div className="w-2.5 h-2.5 rounded-full bg-primary/70 animate-pulse" />
              </div>

              {/* الحالة المفتوحة: تفاصيل الباب + عم وه بشخصيته ودوره واقتباسه المميز */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, delay: 0.12 }}
                    className="absolute inset-0 p-7 lg:p-8 flex flex-col justify-between z-10"
                  >
                    {/* شريط الرأس في الباب المفتوح */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[#d5a56d] font-bold border border-white/10">
                          باب 0{idx + 1}
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold backdrop-blur-md shadow-md">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{portal.badge}</span>
                        </span>

                        {/* شارة دور عم وه في هذا الباب */}
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40 text-xs font-bold backdrop-blur-md">
                          <span>{portal.mascot.role}</span>
                        </span>
                      </div>

                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:bg-primary transition-colors shadow-lg">
                        <ArrowUpLeft className="w-5 h-5" />
                      </div>
                    </div>

                    {/* المحتوى الرئيسي: نصوص الباب + مجسم عم وه مع بالون الحكاية */}
                    <div className="grid grid-cols-[1fr_auto] items-end gap-6">
                      {/* النصوص */}
                      <div className="max-w-xl text-right space-y-3">
                        <span className="text-xs uppercase tracking-widest text-primary-hover font-black block">
                          {portal.nameEn}
                        </span>

                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-heritage leading-tight">
                          {portal.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-white/85 leading-relaxed line-clamp-2">
                          {portal.desc}
                        </p>

                        {/* كلام وحكاية عم وه الخاصة بهذا الباب */}
                        <div className="rounded-2xl bg-black/60 border border-primary/40 p-3.5 backdrop-blur-md space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-black text-amber-300">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-400" />
                              «عم وه»: {portal.mascot.role}
                            </span>
                            <span className="text-[10px] text-white/50 font-normal">
                              {portal.mascot.badge}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-white/95 leading-relaxed">
                            {portal.mascot.quote}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-[#d5a56d]">
                          <span className="italic">{portal.tagline}</span>
                          <span className="font-bold text-white hover:text-primary transition-colors flex items-center gap-1">
                            افتح الباب الآن ←
                          </span>
                        </div>
                      </div>

                      {/* مجسم عم وه المخصص لهذا الباب */}
                      <div className="relative shrink-0 flex flex-col items-center">
                        <div className="absolute -inset-2 rounded-full bg-primary/20 blur-xl animate-pulse pointer-events-none" />
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                          className="relative z-10"
                        >
                          <img
                            src={portal.mascot.src}
                            alt={portal.mascot.role}
                            style={{
                              imageRendering: 'crisp-edges',
                            }}
                            className="h-44 sm:h-52 w-auto object-contain drop-shadow-[0_14px_25px_rgba(0,0,0,0.5)] select-none"
                          />
                        </motion.div>
                        {/* ظل أرضي */}
                        <div className="w-24 h-2 rounded-[100%] bg-black/60 blur-xs -mt-1" />
                        <span className="mt-1 text-[9px] font-bold text-amber-300/80 bg-black/50 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-xs">
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

      {/* شاشات الموبايل والتابلت: كروت تجميع حركي تفاعلي مميز تبرز عم وه بكل باب */}
      <div className="flex flex-col gap-6 sm:grid sm:grid-cols-2 lg:hidden">
        {portals.map((portal, idx) => {
          return (
            <motion.div
              key={portal.id}
              role="button"
              tabIndex={0}
              onClick={() => setActivePage(portal.page)}
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.04,
              }}
              whileTap={{ scale: 0.98 }}
              className="
                group relative min-h-[420px] w-full rounded-4xl overflow-hidden
                border border-white/15
                bg-black shadow-[0_12px_35px_rgba(0,0,0,0.22)]
                cursor-pointer select-none flex flex-col justify-between p-5
              "
            >
              {/* صورة خلفية الباب */}
              <img
                src={portal.image}
                alt={portal.title}
                className="
                  absolute inset-0 h-full w-full object-cover
                  opacity-80 transition-transform duration-700 ease-out
                  group-hover:scale-105 group-active:scale-100
                "
                loading="lazy"
                decoding="async"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
              <div
                className={`absolute inset-0 bg-gradient-to-b ${portal.accentColor} to-transparent opacity-40 mix-blend-overlay`}
              />

              {/* الجزء العلوي: الرقم والبادج وشارة عم وه */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-xs font-black tracking-wider text-[#d5a56d] bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15">
                    0{idx + 1}
                  </span>
                  <span className="text-[10px] font-bold bg-primary text-white px-2.5 py-0.5 rounded-full shadow-md backdrop-blur-md">
                    {portal.badge}
                  </span>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white transition-all group-hover:bg-primary group-active:scale-90 shrink-0">
                  <ArrowUpLeft className="h-4 w-4" />
                </div>
              </div>

              {/* مجسم عم وه بارز في منتصف الكارت مع حركته المميزة لهذا الباب */}
              <div className="relative z-10 my-2 flex items-center justify-between gap-3 bg-black/50 border border-white/15 rounded-2xl p-3 backdrop-blur-md">
                <div className="flex-1 text-right space-y-1">
                  <div className="inline-flex items-center gap-1 text-[10px] font-black text-amber-300">
                    <span>👑 {portal.mascot.role}</span>
                  </div>
                  <p className="text-[11px] font-medium text-white/90 leading-relaxed line-clamp-2">
                    {portal.mascot.quote}
                  </p>
                </div>

                <div className="shrink-0 relative">
                  <img
                    src={portal.mascot.src}
                    alt={portal.mascot.role}
                    style={{ imageRendering: 'crisp-edges' }}
                    className="h-20 w-auto object-contain drop-shadow-md select-none -scale-x-100"
                  />
                  <div className="w-12 h-1.5 rounded-[100%] bg-black/70 blur-xs mx-auto" />
                </div>
              </div>

              {/* الجزء السفلي: تفاصيل البوابة والنصوص */}
              <div className="relative z-10 text-right space-y-2">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#d5a56d] block">
                  {portal.nameEn}
                </span>

                <h3 className="text-xl font-black text-white font-heritage tracking-tight leading-tight">
                  {portal.title}
                </h3>

                <p className="text-xs text-white/80 leading-relaxed line-clamp-2">
                  {portal.desc}
                </p>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-[#d5a56d]">
                  <span className="italic truncate max-w-[80%]">{portal.tagline}</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    ادخل الباب ←
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};