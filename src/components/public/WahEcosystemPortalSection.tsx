import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowUpLeft, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const WahEcosystemPortalSection: React.FC = () => {
  const { setActivePage, wahStats } = useApp();

  const portals = [
    {
      id: 'map',
      title: 'لفة في الصعيد',
      tagline: 'خريطة النيل ومعالم الصعيد الحية',
      desc: 'لف في محافظات الصعيد من الفيوم وبني سويف لحد أسوان والنوبة على خريطة تفاعلية تاخدك لكل حتة.',
      badge: 'التفاعلي',
      page: 'map' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788790207/d13c685b-4403-4983-96fe-49f3b7a925c3.png',
      nameEn: 'Interactive Atlas',
      accentColor: 'from-amber-900/60'
    },
    {
      id: 'governorates',
      title: wahStats?.governoratesCount ? `محافظات الصعيد الـ ${wahStats.governoratesCount}` : 'محافظات صعيد مصر',
      tagline: 'كل محافظة وليها طابع وتاريخ وصنعة',
      desc: 'دليل لكل محافظة: حكايتها، ناسها، وطابعها اللي بيميزها عن غيرها على شط النيل وفي حضن الجبل.',
      badge: `${wahStats?.governoratesCount || 8} محافظات`,
      page: 'governorates' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788791500/copy_of_.jpg',
      nameEn: 'Governorates Guide',
      accentColor: 'from-stone-900/60'
    },
    {
      id: 'places',
      title: 'معالم وآثار الصعيد',
      tagline: 'حكاوي المعابد والصروح العتيقة',
      desc: 'من معابد الكرنك ودندرة وإدفو لحد الأديرة القديمة وقصور المنيا وعمارة النوبة على النيل.',
      badge: wahStats?.placesCount ? `${wahStats.placesCount} معلم متوثق` : 'معالم متوثقة',
      page: 'places' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788715371/WAH/heritage-places/karnak-temples/img_2332_1788715371753_8g8m.jpg',
      nameEn: 'Architectural Heritage',
      accentColor: 'from-[#9a6a35]/70'
    },
    {
      id: 'crafts',
      title: 'حرف وصنايع الصعيد',
      tagline: 'سر الصنعة في إيد الأسطوات',
      desc: 'أسرار فخار قنا، تلي أسيوط الفضي، فركة نقادة، ألباستر القرنة، وسجاد أخميم اليدوي الأصيل.',
      badge: 'حرف صعيدية',
      page: 'cultural-crafts' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788789051/%D9%81%D8%AE%D8%A7%D8%B1%D8%B1%D8%B1%D8%B1.jpg',
      nameEn: 'Crafts Encyclopedia',
      accentColor: 'from-orange-950/70'
    },
    {
      id: 'stories',
      title: 'وه بيحكي — حكاوي وسير',
      tagline: 'سير الناس ومرويات زمان',
      desc: 'حكايات بتتوارث من جيل لجيل: مربعات ابن عروس، السيرة الهلالية، أساطير النيل، وحكاوي النجوع والبلاد.',
      badge: 'حكاوي ومرويات',
      page: 'stories' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788790419/3a9467d6-9e60-4f24-987d-d65a73d19fed.png',
      nameEn: 'Oral History',
      accentColor: 'from-yellow-950/70'
    },
    {
      id: 'people',
      title: 'ناس الصعيد وحراس الحكاية',
      tagline: 'شيوخ الصنعة وحراس الحكاية',
      desc: 'اتعرف على ناس الصعيد الطيبين؛ شيوخ الصنعة، رواة السيرة، الشعراء، وفنانين التراث.',
      badge: 'وجوه من الصعيد',
      page: 'people' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788790532/8460cc50-45f5-4452-8f78-993668390750.png',
      nameEn: 'People of Upper Egypt',
      accentColor: 'from-[#744e26]/70'
    },
    {
      id: 'food',
      title: 'طعم وأكل الصعيد',
      tagline: 'سر الفرن البلدي وطعم البيوت',
      desc: 'العيش الشمسي، الفايش الصعيدي بالسمسم، الويكا بالمفراك، الكشك، وخيرات عسل القصب.',
      badge: 'أكلات ووصفات',
      page: 'food' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788790638/05ef9181-0c18-4290-8a57-b2d054054e7f.png',
      nameEn: 'Authentic Kitchen',
      accentColor: 'from-amber-950/70'
    },
    {
      id: 'events',
      title: 'مواسم وليالي الصعيد',
      tagline: 'ليالي الموالد وحلقات التحطيب',
      desc: 'موسم كسر القصب، مولد سيدي عبد الرحيم القنائي، ليالي التحطيب بالأقصر، وتعامد الشمس في أبو سمبل.',
      badge: 'مواسم حية',
      page: 'events' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788790617/145b481b-d989-4d5b-82cf-26bbb0b5d6eb.png',
      nameEn: 'Seasons & Events',
      accentColor: 'from-[#5a3e1b]/70'
    },
    {
      id: 'marketplace',
      title: 'سوق وه للحرف اليدوية',
      tagline: 'من الورشة لحد دارك',
      desc: 'اشتري قطع أصلية ومضمونة من ورش قنا وأسوان وسوهاج، بدفع مريح وشحن لحد باب بيتك.',
      badge: 'سوق وه',
      page: 'products' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788790754/6d17f117-649a-4a79-b565-3f3eef139000.png',
      nameEn: 'WAH Marketplace',
      accentColor: 'from-amber-800/60'
    }
  ];

  const [activeId, setActiveId] = useState<string>(portals[0]?.id || '');

  return (
    <section
      dir="rtl"
      className="
        py-16
        bg-transparent
        text-[#211d18]
        transition-colors duration-500
        dark:text-[#f5f0e7]
        max-w-[1600px]
        mx-auto
        px-5
        sm:px-8
        lg:px-12
      "
    >
      {/* الرأس التحريري */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 pb-6 border-b border-black/10 dark:border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#9a6a35] tracking-wider mb-2">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>أبواب ودليل «وه»</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-serif tracking-tight">
            الصعيد كله في مكان واحد
          </h2>
        </div>

        <p className="text-sm text-black/60 dark:text-white/60 max-w-md">
          لف في أبواب «وه» واكتشف بلاد الصعيد وناسه وتراثه، واسمع حكاياته وتفاصيله اللي مميزة كل حتة فيه.
        </p>
      </div>

      {/* شاشة سطح المكتب: أكورديون أفقي متمدد سينمائي */}
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
                flex: isActive ? 4 : 1,
              }}
              transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
              className="relative h-full rounded-[1.5rem] overflow-hidden cursor-pointer shadow-lg select-none group border border-black/10 dark:border-white/10 bg-black"
            >
              <img
                src={portal.image}
                alt={portal.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90"
                loading="lazy"
              />

              <div
                className={`absolute inset-0 transition-opacity duration-500 ${isActive
                  ? 'bg-gradient-to-t from-black via-black/40 to-black/25'
                  : 'bg-black/65 hover:bg-black/50'
                  }`}
              />

              {/* الحالة المنكمشة */}
              <div
                className={`absolute inset-0 p-6 flex flex-col justify-between items-center transition-opacity duration-300 ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
              >
                <span className="font-mono text-xs text-white/50 font-light">
                  0{idx + 1}
                </span>

                <h3 className="text-white font-bold text-lg font-heritage tracking-wide [writing-mode:vertical-rl] rotate-180 select-none">
                  {portal.title}
                </h3>

                <div className="w-2 h-2 rounded-full bg-[#9a6a35]/60" />
              </div>

              {/* الحالة المفتوحة */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                    className="absolute inset-0 p-8 flex flex-col justify-between z-10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-amber-200 border border-white/10">
                          0{idx + 1}
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9a6a35] text-white text-xs font-bold backdrop-blur-md shadow-md">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{portal.badge}</span>
                        </span>
                      </div>

                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:bg-[#9a6a35] transition-colors">
                        <ArrowUpLeft className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="max-w-xl text-right">
                      <span className="text-xs uppercase tracking-widest text-[#9a6a35] font-bold block mb-1">
                        {portal.nameEn}
                      </span>

                      <h3 className="text-3xl sm:text-4xl font-black text-white font-heritage mb-3 leading-tight">
                        {portal.title}
                      </h3>

                      <p className="text-sm text-white/80 leading-relaxed mb-3 line-clamp-2">
                        {portal.desc}
                      </p>

                      <div className="pt-2 border-t border-white/20 inline-flex items-center gap-2 text-xs text-amber-200/90">
                        <span className="italic">{portal.tagline}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* شاشات الموبايل والتابلت: كروت تجميع حركي تفاعلي مميز */}
      <div className="flex flex-col gap-6 sm:grid sm:grid-cols-2 lg:hidden">
        {portals.map((portal, idx) => {
          const isEven = idx % 2 === 0;

          return (
            <motion.div
              key={portal.id}
              role="button"
              tabIndex={0}
              onClick={() => setActivePage(portal.page)}
              initial={{
                opacity: 0,
                x: isEven ? 35 : -35,
                y: 25,
                scale: 0.94,
                rotate: isEven ? -1 : 1,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0,
              }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.05,
              }}
              whileTap={{ scale: 0.97 }}
              className="
                group relative h-[320px] w-full rounded-[2rem] overflow-hidden
                border border-black/10 dark:border-white/10
                bg-black shadow-[0_12px_35px_rgba(0,0,0,0.18)]
                cursor-pointer select-none
              "
            >
              {/* الصورة مع تأثير Zoom ناعم */}
              <img
                src={portal.image}
                alt={portal.title}
                className="
                  absolute inset-0 h-full w-full object-cover
                  opacity-85 transition-transform duration-700 ease-out
                  group-hover:scale-105 group-active:scale-100
                "
                loading="lazy"
                decoding="async"
              />

              {/* طبقة تدرج لوني سينمائي متعدد الدرجات */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
              <div className={`absolute inset-0 bg-gradient-to-b ${portal.accentColor} to-transparent opacity-40 mix-blend-overlay`} />

              {/* نقشة هندسية مصغرة في أركان الكارت */}
              <div className="pointer-events-none absolute left-4 top-4 h-16 w-16 rounded-full border border-white/10" />

              {/* الجزء العلوي: الرقم والبادج وزر الأكشن */}
              <div className="relative z-10 flex items-center justify-between p-5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black tracking-wider text-amber-200 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                    0{idx + 1}
                  </span>
                  <span className="text-[11px] font-bold bg-[#9a6a35] text-white px-3 py-1 rounded-full shadow-md backdrop-blur-md">
                    {portal.badge}
                  </span>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white transition-all group-hover:bg-[#9a6a35] group-active:scale-90">
                  <ArrowUpLeft className="h-4 w-4" />
                </div>
              </div>

              {/* الجزء السفلي: تفاصيل البوابة والنصوص */}
              <div className="absolute bottom-0 inset-x-0 z-10 p-6 text-right">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d5a56d] block mb-1">
                  {portal.nameEn}
                </span>

                <h3 className="text-2xl font-black text-white font-heritage tracking-tight leading-tight mb-2">
                  {portal.title}
                </h3>

                <p className="text-xs text-white/80 leading-relaxed line-clamp-2 mb-3">
                  {portal.desc}
                </p>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between">
                  <span className="text-[11px] text-amber-200/90 font-medium italic truncate max-w-[85%]">
                    {portal.tagline}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#9a6a35]" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};