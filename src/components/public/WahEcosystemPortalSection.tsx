import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowUpLeft, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const WahEcosystemPortalSection: React.FC = () => {
  const { setActivePage, wahStats } = useApp();

  const portals = [
    {
      id: 'marketplace',
      title: 'سوق وه.. من إيد الصانع لدارك',
      tagline: 'حاجة أصلية من الورشة لحد عندك',
      desc: 'سوق مليان خير الصعيد وشغل الورش الأصيل 100%، اشترِ اللي يعجبك والدفع أمان وشحن واصل لحد باب بيتك.',
      badge: 'دكان وسوق وه',
      page: 'products' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790754/6d17f117-649a-4a79-b565-3f3eef139000.png',
      nameEn: 'WAH Marketplace',
      accentColor: 'from-amber-800/80',
      mascot: '/mascot/empty-cart.png',
      mascotRole: 'عم وه تاجر الصنعة والبركة',
      mascotStory: 'عم وه وهو بيتمشى في أسواق وورش الصعيد.. لقى المنتجات الخطيرة دي، كلها شغل يدوي أصيل 100% من إيد شيوخ الصنعة لدارك!'
    },
    {
      id: 'places',
      title: 'آثار ومعالم بلدنا',
      tagline: 'حيطان عتيقة وحكاوي من سنين',
      desc: 'من عظمة الكرنك ودندرة وإدفو لحد الأديرة القديمة، وقصور المنيا، وبيوت النوبة الملونة على البحر.',
      badge: wahStats?.placesCount ? `${wahStats.placesCount} مكان متوثق` : 'أماكن متوثقة',
      page: 'places' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788715371/WAH/heritage-places/karnak-temples/img_2332_1788715371753_8g8m.jpg',
      nameEn: 'Architectural Heritage',
      accentColor: 'from-[#9a6a35]/70',
      mascot: '/mascot/char.png',
      mascotRole: 'عم وه حارس الآثار والعتيق',
      mascotStory: 'عم وه لف وتعب وداس في كل سكة وجبل عشان يوصل للأماكن دي ويوثق تاريخها وحيطانها العتيقة من أقصى الشمال لأقصى الجنوب!'
    },
    {
      id: 'people',
      title: 'أعلام ورموز الصعيد',
      tagline: 'شيوخ الصنعة وحراس الأصل والكلمة',
      desc: 'اتعرف على قامات الصعيد؛ شيوخ الصنعة اللي صانوا التراث، رواة السير، وكبار الأدباء والشعراء اللي شرفوا بلدهم.',
      badge: 'ناس ليها علامة',
      page: 'people' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790532/8460cc50-45f5-4452-8f78-993668390750.png',
      nameEn: 'Figures of Upper Egypt',
      accentColor: 'from-[#744e26]/70',
      mascot: '/mascot/fav.png',
      mascotRole: 'عم وه في مضايف الأكابر',
      mascotStory: 'عم وه قعد في مضايف الكبار وسمع حكايات شيوخ الصنعة والرواة والشعراء اللي سابوا علامة في تاريخ الجنوب!'
    },
    {
      id: 'map',
      title: 'لفة على النيل والبلاد',
      tagline: 'خريطة تاخدك لكل شبر في الصعيد',
      desc: 'لف في بلادنا براحتك من أول بحري الصعيد لحد أسوان وبلاد النوبة، دوس على الخريطة وشوف كل حتة.',
      badge: 'الخريطة الحية',
      page: 'map' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790207/d13c685b-4403-4983-96fe-49f3b7a925c3.png',
      nameEn: 'Interactive Atlas',
      accentColor: 'from-amber-900/60',
      mascot: '/mascot/welcoming.png',
      mascotRole: 'دليل عم وه للأطلس',
      mascotStory: 'عم وه رسم لكم خريطة الصعيد شبر شبر من بحري لحد أسوان والنوبة عشان متتوهش واصل في ديارنا!'
    },
    {
      id: 'food',
      title: 'لقمة هنية من قلب بيوتنا',
      tagline: 'ريحة الفرن البلدي وطبيخ الطواجن',
      desc: 'طعم العيش الشمسي السخن، فايش بلبن الحمص، ويكة صعيدي مفروكة، كشك مقدوح بالسمن، وخير عسل القصب الصافي.',
      badge: 'أكل بيوت بلدي',
      page: 'food' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790638/05ef9181-0c18-4290-8a57-b2d054054e7f.png',
      nameEn: 'Authentic Kitchen',
      accentColor: 'from-amber-950/70',
      mascot: '/mascot/welcoming.png',
      mascotRole: 'سفرة عم وه وخير بيوتنا',
      mascotStory: 'عم وه داغ خير البيوت الصعيدية.. من عيش شمسي سخن وطواجن بلدي معسلة لحد فايش بلبن الحمص وعسل القصب الصافي!'
    },
    {
      id: 'events',
      title: 'ليالي الموالد ولمّة الفرح',
      tagline: 'عصيان التحطيب وزغاريد المواسم',
      desc: 'فرحة كسر القصب، زحمة ونفحات سيدي عبد الرحيم القنائي، حلقات التحطيب في الأقصر، وشمس أبو سمبل لما تشرق.',
      badge: 'مواسم وليالي',
      page: 'events' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788790617/145b481b-d989-4d5b-82cf-26bbb0b5d6eb.png',
      nameEn: 'Seasons & Events',
      accentColor: 'from-[#5a3e1b]/70',
      mascot: '/mascot/quiz.png',
      mascotRole: 'عم وه في ليالي الموالد',
      mascotStory: 'عم وه حضر ليالي الموالد ولمّة الفرح ودقّة عصيان التحطيب وزغاريد المواسم ورجعلكم بالبهجة والنفحات كلها!'
    },
    {
      id: 'reels',
      title: 'ريلز وحكاوي حية',
      tagline: 'شوف الصعيد بعينك واسمع حسه',
      desc: 'فيديوهات قصيرة وخفيفة تاخدك في ثواني جوة حيطان الورش، والأسواق، ووسط الناس في الشارع الصعيدي.',
      badge: 'ريلز من قلب الصعيد',
      page: 'reels' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/f_auto,q_auto,w_800/v1788789051/%D9%81%D8%AE%D8%A7%D8%B1%D8%B1%D8%B1%D8%B1.jpg',
      nameEn: 'Live Reels',
      accentColor: 'from-orange-950/70',
      mascot: '/mascot/quiz.png',
      mascotRole: 'عم وه في قلب الحدث',
      mascotStory: 'عم وه صور لكم بكاميرته من قلب الورش وأزقة الأسواق حكاوي حية وسريعة تشوفوها صوت وصورة بعينكم!'
    }
  ]; const [activeId, setActiveId] = useState<string>(portals[0]?.id || '');

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
            <div className="mb-4 inline-flex items-center gap-3 text-[10px] font-black tracking-[0.28em] text-primary dark:text-primary-hover">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                <Compass size={14} className="animate-spin-slow text-accent" />
              </span>
              DISCOVER / أبواب ودليل «وه»
            </div>

            {/* وسام عم وه صاحب وموثق المنصة */}
            <div className="mb-6 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-primary/25 bg-surface-subtle/80 backdrop-blur-md self-start w-fit shadow-xs">
              <img
                src="/mascot/char.png"
                alt="عم وه"
                className="w-6 h-6 object-contain drop-shadow shrink-0"
              />
              <span className="text-[11px] font-black text-foreground">
                أبواب الصعيد السبعة برعاية وتوثيق <strong className="text-primary">«عم وه»</strong>
              </span>
            </div>

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

              <p className="max-w-2xl text-sm font-medium leading-7 text-foreground-secondary sm:text-base sm:leading-8">
                كل خير وتاريخ الصعيد متجمع في مكان واحد.
                عم وه لف ووثق شبر شبر عشان يفتحلك الباب على:
                <br />
                <strong className="text-accent">سوق مباشر تشتري منه من إيد الحرفي</strong>،{' '}
                وفيديوهات وتجارب حقيقية من صناع المحتوى، وتوثيق تفاعلي لكل معلم وأكلة ومولد في الصعيد.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* شاشة سطح المكتب: أكورديون أفقي متمدد سينمائي مع مجسم عم وه */}
      <div className="hidden lg:flex gap-3 h-135 w-full">
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
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90"
                loading="lazy"
              />

              <div
                className={`absolute inset-0 transition-opacity duration-500 ${isActive
                  ? 'bg-linear-to-t from-black via-black/45 to-black/25'
                  : 'bg-black/65 hover:bg-black/50'
                  }`}
              />

              {/* الحالة المنكمشة */}
              <div
                className={`absolute inset-0 p-6 flex flex-col justify-between items-center transition-opacity duration-300 ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
              >
                <span className="font-mono text-xs text-[#d5a56d] font-bold">
                  0{idx + 1}
                </span>

                <h3 className="text-white font-bold text-lg font-heritage tracking-wide [writing-mode:vertical-rl] rotate-180 select-none">
                  {portal.title}
                </h3>

                <div className="w-2 h-2 rounded-full bg-primary/60" />
              </div>

              {/* الحالة المفتوحة مع كراكتر عم وه وحكايته */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                    className="absolute inset-0 p-7 flex flex-col justify-between z-10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[#d5a56d] font-bold border border-white/15">
                          0{idx + 1}
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold backdrop-blur-md shadow-md">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{portal.badge}</span>
                        </span>

                        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-black text-amber-300 bg-black/40 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          {portal.mascotRole}
                        </span>
                      </div>

                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:bg-primary transition-colors">
                        <ArrowUpLeft className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] items-end gap-6 my-auto">
                      <div className="max-w-xl text-right">
                        <span className="text-xs uppercase tracking-widest text-primary font-bold block mb-1">
                          {portal.nameEn}
                        </span>

                        <h3 className="text-2xl sm:text-3xl xl:text-4xl font-black text-white font-heritage mb-2 leading-tight">
                          {portal.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-white/85 leading-relaxed mb-3 line-clamp-2">
                          {portal.desc}
                        </p>

                        {/* بالونة كلام عم وه */}
                        <div className="p-3 sm:p-3.5 rounded-2xl bg-black/75 backdrop-blur-md border border-primary/30 flex items-center gap-3 shadow-xl">
                          <img
                            src={portal.mascot}
                            alt={portal.mascotRole}
                            className="w-12 h-12 object-contain shrink-0 drop-shadow -scale-x-100"
                          />
                          <div className="text-right">
                            <span className="text-[10px] font-black text-amber-300 block mb-0.5">
                              {portal.mascotRole}:
                            </span>
                            <p className="text-xs font-bold text-white/95 leading-relaxed">
                              "{portal.mascotStory}"
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/15 inline-flex items-center gap-2 text-xs text-[#d5a56d]/90">
                          <span className="italic">{portal.tagline}</span>
                        </div>
                      </div>

                      {/* مجسم عم وه كامل بدون خلفية */}
                      <div className="hidden xl:flex items-end justify-center self-end shrink-0 pl-2">
                        <motion.img
                          initial={{ opacity: 0, scale: 0.88, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.45, ease: 'easeOut' }}
                          src={portal.mascot}
                          alt={portal.mascotRole}
                          className="h-72 w-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)] select-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* شاشات الموبايل والتابلت: كروت تجميع حركي مع حكاية عم وه في كل باب */}
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
                group relative min-h-[380px] w-full rounded-4xl overflow-hidden
                border border-white/10
                bg-black shadow-[0_12px_35px_rgba(0,0,0,0.18)]
                cursor-pointer select-none flex flex-col justify-between
              "
            >
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

              <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-black/30" />
              <div className={`absolute inset-0 bg-linear-to-b ${portal.accentColor} to-transparent opacity-40 mix-blend-overlay`} />

              {/* الجزء العلوي: الرقم والبادج وزر الأكشن */}
              <div className="relative z-10 flex items-center justify-between p-5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black tracking-wider text-[#d5a56d] bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                    0{idx + 1}
                  </span>
                  <span className="text-[11px] font-bold bg-primary text-white px-3 py-1 rounded-full shadow-md backdrop-blur-md">
                    {portal.badge}
                  </span>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white transition-all group-hover:bg-primary group-active:scale-90">
                  <ArrowUpLeft className="h-4 w-4" />
                </div>
              </div>

              {/* الجزء السفلي: تفاصيل البوابة ونصوص عم وه */}
              <div className="relative z-10 p-5 text-right space-y-3">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d5a56d] block">
                  {portal.nameEn}
                </span>

                <h3 className="text-xl sm:text-2xl font-black text-white font-heritage tracking-tight leading-tight">
                  {portal.title}
                </h3>

                {/* حكاية عم وه في الموبايل */}
                <div className="p-3 rounded-2xl bg-black/80 backdrop-blur-md border border-primary/30 flex items-center gap-2.5">
                  <img
                    src={portal.mascot}
                    alt="عم وه"
                    className="w-10 h-10 object-contain shrink-0 drop-shadow -scale-x-100"
                  />
                  <div className="min-w-0">
                    <span className="text-[9px] font-black text-amber-300 block mb-0.5 truncate">
                      {portal.mascotRole}:
                    </span>
                    <p className="text-[11px] font-bold text-white/95 leading-snug line-clamp-2">
                      "{portal.mascotStory}"
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-[#d5a56d]/90 font-medium italic">
                  <span className="truncate max-w-[85%]">{portal.tagline}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};