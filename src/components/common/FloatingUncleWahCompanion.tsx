import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Sparkles, X, RefreshCw } from 'lucide-react';

interface StoryItem {
  text: string;
  image: string;
}

interface PageStory {
  title: string;
  role: string;
  badge: string;
  mascot: string;
  stories: StoryItem[];
}

const PAGE_STORIES: Record<string, PageStory> = {
  home: {
    title: 'منصة وه',
    role: 'صاحب وموثّق المنصة',
    badge: 'دليل الصعيد الحي',
    mascot: '/mascot/fav.png',
    stories: [
      {
        text: '«عم وه لف وتعب في كل بلاد وقرى الصعيد، من بحري لحد أسوان والنوبة، عشان يجمع لكم التراث والصنعة والآثار والناس الطيبة في مكان واحد يشرفنا كلنا!»',
        image: '/mascot/athar.png',
      },
      {
        text: '«كل شبر وكل حكاية هنا اتجمعت بعرق وتعب سنين.. ادخل الأبواب السبعة وعيش حكاوي الجنوب الأصيل!»',
        image: '/mascot/char.png',
      },
      {
        text: '«عم وه بيعرف يصوّر، بس قال ليه أصوّر حكايتي لوحدي؟ فجاب الكاميرا وراح يدور على الشطار في الصعيد.. كل واحد عنده صنعة، وحكاية تستاهل تتشاف.»',
        image: '/mascot/reels.png',
      },
      {
        text: '«من ورشة صغيرة في قرية، لدكان قديم في قلب السوق.. عم وه قرر إن الحكايات دي ماينفعش تفضل مستخبية، ولازم توصل لكل الناس.»',
        image: '/mascot/pro.png',
      },
      {
        text: '«هو مش بيدوّر على المشهور بس.. عم وه بيدوّر على كل حد بيعمل حاجة تستاهل نفتخر بيها، حتى لو محدش سمع عنه قبل كده.»',
        image: '/mascot/fan.png',
      },
      {
        text: '«كل مرة عم وه يفتح الكاميرا، بيكتشف حكاية جديدة.. حرفي، فنان، أكلة، مكان، أو عادة لسه عايشة من زمان.»',
        image: '/mascot/reels.png',
      },
      {
        text: '«وعم وه مش جاي يحكي عن الصعيد من بعيد.. ده نازل الشوارع، داخل الورش، قاعد مع الناس، وبيسمع الحكاية من أصحابها.»',
        image: '/mascot/char.png',
      },
      {
        text: '«وه مش مجرد مكان تشوف فيه منتجات.. دي مساحة نخلّي فيها اللي اتعمل بإيدين أهل الصعيد يوصل لناس أكتر، وتفضل حكايته عايشة.»',
        image: '/mascot/pro.png',
      },
      {
        text: '«يمكن تكون عديت من جنب المكان ده مية مرة.. بس عم وه هيوريك الحكاية اللي عمرك ما خدت بالك منها.»',
        image: '/mascot/athar.png',
      },
      {
        text: '«الصعيد مش حكاية واحدة.. الصعيد آلاف الحكايات، وعم وه لسه في أول الطريق.»',
        image: '/mascot/fav.png',
      },
    ],
  },

  products: {
    title: 'سوق وه',
    role: 'تاجر الصنعة والبركة',
    badge: 'شغل يدوي 100%',
    mascot: '/mascot/pro.png',
    stories: [
      {
        text: '«عم وه وهو بيتمشى في أسواق وورش الصعيد.. لقى المنتجات الخطيرة دي! نقى لكم كل قطعة بحب وأمانة من إيد شيوخ الصنعة لداركم مباشرة!»',
        image: '/mascot/pro.png',
      },
      {
        text: '«مفيش وسيط ولا تجار جملة، من إيد الأسطى لبيتك.. كل مليم يروح للصانع الصعيدي وأسرته!»',
        image: '/mascot/pro.png',
      },
    ],
  },

  'wah-market': {
    title: 'سوق وه',
    role: 'تاجر الصنعة والبركة',
    badge: 'شغل يدوي 100%',
    mascot: '/mascot/pro.png',
    stories: [
      {
        text: '«عم وه وهو بيتمشى في أسواق وورش الصعيد.. لقى المنتجات الخطيرة دي! نقى لكم كل قطعة بحب وأمانة من إيد شيوخ الصنعة لداركم مباشرة!»',
        image: '/mascot/pro.png',
      },
    ],
  },

  categories: {
    title: 'أطلس الحِرف',
    role: 'حارس الصنعة وأسرارها',
    badge: 'خريطة الصنايعية',
    mascot: '/mascot/pro.png',
    stories: [
      {
        text: '«عم وه قسّم لكم كل حرفة وصنعة في باب لوحدها؛ من فخار قنا لخزف جرجيس ونسيج أخميم وخوص النوبة، عشان تلاقوا طلبكم على طول وما تتوهوش!»',
        image: '/mascot/pro.png',
      },
      {
        text: '«الصعيد مليان كنوز، وكل قرية اتخصصت في سر صنعة بقالها مئات السنين!»',
        image: '/mascot/pro.png',
      },
    ],
  },

  crafts: {
    title: 'حكايات الصنعة',
    role: 'حارس الصنعة وأسرارها',
    badge: 'أصل الحكاية',
    mascot: '/mascot/pro.png',
    stories: [
      {
        text: '«عم وه قعد مع شيوخ الصنعة في ورشهم، وعرف منهم سر الخامات البلدي وطريقة الشغل اليدوي من أول الطينة لحد ما تطلع تحفة في بيتك!»',
        image: '/mascot/pro.png',
      },
    ],
  },

  places: {
    title: 'آثار ومعالم الصعيد',
    role: 'حارس الآثار والعتيق',
    badge: 'تاريخ الأجداد',
    mascot: '/mascot/athar.png',
    stories: [
      {
        text: '«عم وه لف وتعب وداس في كل سكة وجبل عشان يوصل للمعالم والآثار دي ويوثق تاريخها وحيطانها العتيقة من أقصى الشمال لأقصى الجنوب.. شاور على أي أثر واعرف حكايته!»',
        image: '/mascot/athar.png',
      },
      {
        text: '«حيطان معابدنا وأديرتنا ومساجدنا مش طوب وحجر، دي أرواح وتاريخ عاش آلاف السنين!»',
        image: '/mascot/athar.png',
      },
    ],
  },

  'place-detail': {
    title: 'تفاصيل المعلم',
    role: 'حارس الآثار والعتيق',
    badge: 'أسرار المكان',
    mascot: '/mascot/athar.png',
    stories: [
      {
        text: '«عم وه وقف تحت حيطان الأثر ده، وسأل الرواة والمؤرخين ووثق لكم تاريخه العظيم وسره اللي عمره آلاف السنين!»',
        image: '/mascot/athar.png',
      },
    ],
  },

  map: {
    title: 'خريطة الصعيد',
    role: 'دليل الأطلس ورحلة النيل',
    badge: 'شبر شبر',
    mascot: '/mascot/saaed.png',
    stories: [
      {
        text: '«عم وه مشي على ضفاف النيل ورسم لكم خريطة الصعيد شبر شبر، من بحري لحد أسوان والنوبة، عشان تلفوا في بلادنا براحتكم وما تتوهوش واصل!»',
        image: '/mascot/saaed.png',
      },
      {
        text: '«دوس على أي محافظة في الخريطة وشوف خيرها ومعالمها وناسها الطيبين!»',
        image: '/mascot/saaed.png',
      },
    ],
  },

  'governorate-detail': {
    title: 'تفاصيل المحافظة',
    role: 'دليل الديار الصعيدية',
    badge: 'ديار الكرم',
    mascot: '/mascot/saaed.png',
    stories: [
      {
        text: '«عم وه نزل المحافظة دي، وداس في قراها ونجوعها وشرب الشاي في مضايف ناسها وجمع كل خيرها وتراثها في صفحة واحدة!»',
        image: '/mascot/saaed.png',
      },
    ],
  },

  food: {
    title: 'طعم وسفرة الصعيد',
    role: 'سفرة عم وه وخير بيوتنا',
    badge: 'طبيخ بيوت بلدي',
    mascot: '/mascot/foods.png',
    stories: [
      {
        text: '«عم وه داغ خير البيوت الصعيدية، من عيش شمسي سخن وطواجن بلدي معسلة وفايش بحمص، وجاب لكم سر الأكلات الأصلية من أصحابها!»',
        image: '/mascot/foods.png',
      },
      {
        text: '«النفس الصعيدي في الطبيخ ملوش مثيل، بالسمنة البلدي وتوابل الجنوب اللي تروق البال!»',
        image: '/mascot/foods.png',
      },
    ],
  },

  'food-detail': {
    title: 'تفاصيل الأكلة',
    role: 'سفرة عم وه وخير بيوتنا',
    badge: 'سر الطبخة',
    mascot: '/mascot/foods.png',
    stories: [
      {
        text: '«عم وه دخل مطابخ بيوتنا، وقعد مع أمهاتنا وجداتنا وعرف منهم سر الطبخة ونَفَس الطبيخ البلدي اللي يروق البال!»',
        image: '/mascot/foods.png',
      },
    ],
  },

  people: {
    title: 'أعلام ورموز الصعيد',
    role: 'في مضايف الأكابر',
    badge: 'سيرة عطرة',
    mascot: '/mascot/fav.png',
    stories: [
      {
        text: '«عم وه قعد في مضايف الكبار وشيوخ الصنعة والرواة والشعراء، وجمع سيرتهم العطرة اللي تشرّف كل صعيدي عشان تفضل حية في قلوب أجيالنا الجاية!»',
        image: '/mascot/fav.png',
      },
      {
        text: '«الرجال بأفعالها وكلمتها، والصعيد ولّاد قامات رفعت راس مصر كلها!»',
        image: '/mascot/fav.png',
      },
    ],
  },

  'person-detail': {
    title: 'سيرة القامة الصعيدية',
    role: 'في مضايف الأكابر',
    badge: 'أثر متيمحيش',
    mascot: '/mascot/fan.png',
    stories: [
      {
        text: '«عم وه جمع حكايات وشهادات الناس اللي عاشروا القامة دي، وسجل بصمته اللي هتفضل منورة في تاريخ الجنوب!»',
        image: '/mascot/fan.png',
      },
    ],
  },

  events: {
    title: 'مواسم وليالي الصعيد',
    role: 'في ليالي الموالد',
    badge: 'بهجة الجنوب',
    mascot: '/mascot/events.png',
    stories: [
      {
        text: '«عم وه حضر ليالي الموالد ولمّة الفرح ودقّة عصيان التحطيب وزغاريد المواسم ورجعلكم بالبهجة والنفحات والبركة كلها!»',
        image: '/mascot/events.png',
      },
      {
        text: '«مواسم الصعيد فرحة مابتخلصش، من كسر القصب للموالد الشريفة.. اسمع صوت النغم وافرح معانا!»',
        image: '/mascot/events.png',
      },
    ],
  },

  'event-detail': {
    title: 'تفاصيل الموسم والليالي',
    role: 'في ليالي الموالد',
    badge: 'نفحات وبركة',
    mascot: '/mascot/events.png',
    stories: [
      {
        text: '«عم وه حضر الليلة دي بنفسه وسط الناس، وسجل مواعيدها وطقوسها وبهجتها عشان تشاركوا في فرحة أهلنا!»',
        image: '/mascot/events.png',
      },
    ],
  },

  reels: {
    title: 'ريلز وحكاوي وه',
    role: 'في قلب الحدث',
    badge: 'فيديوهات حية',
    mascot: '/mascot/reels.png',
    stories: [
      {
        text: '«عم وه بيعرف يصوّر، بس قرر إن الحكاية مش لازم تبقى حكايته لوحده.. فجاب الكاميرا وراح يدور على الشطار في الصعيد، وكل واحد عنده حكاية تستاهل تتشاف.»',
        image: '/mascot/reels.png',
      },
    ],
  },

  sellers: {
    title: 'شيوخ الصنعة والورش',
    role: 'بين شيوخ الصنعة',
    badge: 'ورش الصعايدة',
    mascot: '/mascot/pro.png',
    stories: [
      {
        text: '«عم وه خبط على بيبان ورش الصعيد دكان دكان، وقعد مع شيوخ الصنعة الحقيقيين وتأكد من أمانتهم وجودة شغلهم عشان تتعاملوا معاهم وإنتوا متطمنين 100%!»',
        image: '/mascot/pro.png',
      },
    ],
  },

  'seller-details': {
    title: 'ورشة ودكان الصانع',
    role: 'بين شيوخ الصنعة',
    badge: 'صنعة يد أصيلة',
    mascot: '/mascot/pro.png',
    stories: [
      {
        text: '«عم وه زار ورشة الأسطى ده بنفسه، وشاف سر الصنعة وخطوات الشغل اليدوي بعينه.. صنايعي شاطر وأمين على تراث أجداده!»',
        image: '/mascot/pro.png',
      },
    ],
  },

  quize: {
    title: 'انت صعيدي؟ (لعبة اللهجة)',
    role: 'حكم وتحدي اللهجة',
    badge: 'تحدي أصيل',
    mascot: '/mascot/quiz.png',
    stories: [
      {
        text: '«عم وه نقّى لكم أصعب وأجمل الكلمات والأمثال الصعيدية الأصيلة، وعمل لكم التحدي ده عشان يشوف مين الصعيدي الأصلي ومين اللي محتاج يتدرب!»',
        image: '/mascot/quiz.png',
      },
      {
        text: '«وريني شطارتك يا بوي! هل هتكسب لقب العمدة ولا هتقول يا فكيك؟»',
        image: '/mascot/quiz.png',
      },
    ],
  },

  cart: {
    title: 'سلة المشتريات',
    role: 'ضامن الجودة والبركة',
    badge: 'من الورشة لدارك',
    mascot: '/mascot/empty-cart.png',
    stories: [
      {
        text: '«عم وه راجع طلبيتك بنفسه، وضمن لك إن المنتجات دي طالعة من إيد الصانع الصعيدي لدارك على طول وبأعلى جودة وأمانة!»',
        image: '/mascot/empty-cart.png',
      },
    ],
  },

  checkout: {
    title: 'إتمام الطلب',
    role: 'ضامن الجودة والبركة',
    badge: 'أمان وضمان',
    mascot: '/mascot/pro.png',
    stories: [
      {
        text: '«عم وه بيوصي الصنايعية يغلفوا حاجتك بحب وعناية، وهتوصلك لحد باب بيتك في أسرع وقت!»',
        image: '/mascot/pro.png',
      },
    ],
  },

  about: {
    title: 'عن منصة وه',
    role: 'صاحب وموثّق المنصة',
    badge: 'حكاية وتعب سنين',
    mascot: '/mascot/char.png',
    stories: [
      {
        text: '«حكاية عم وه وتعب سنين سفر وتوثيق في كل بلاد الصعيد عشان يجمع التراث والصنعة والناس الطيبة في منصة واحدة تشرفنا كلنا!»',
        image: '/mascot/char.png',
      },
    ],
  },

  favorites: {
    title: 'المفضلة والمختارات',
    role: 'خبير الذوق الرفيع',
    badge: 'ذوق صعيدي عالي',
    mascot: '/mascot/fav.png',
    stories: [
      {
        text: '«يا زين ما نقيت! عم وه بيشهد لك إن ذوقك عالي والقطع اللي اخترتها دي كلها تحف فنية متتعوضش!»',
        image: '/mascot/fav.png',
      },
    ],
  },
};

export const FloatingUncleWahCompanion: React.FC = () => {
  const { activePage } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);

  // الصفحة الحالية
  const activeStory =
    PAGE_STORIES[activePage] || PAGE_STORIES.home;

  // الحكاية الحالية
  const currentStory =
    activeStory.stories[
    storyIndex % activeStory.stories.length
    ];

  // لما الصفحة تتغير نرجع لأول حكاية
  useEffect(() => {
    setStoryIndex(0);
  }, [activePage]);

  // تغيير الحكاية
  const handleNextStory = (e: React.MouseEvent) => {
    e.stopPropagation();

    setStoryIndex(
      (prev) =>
        (prev + 1) % activeStory.stories.length
    );
  };

  return (
    <aside
      aria-label="رفيق الرحلة عم وه"
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] md:bottom-8 right-3 sm:right-6 z-50 select-none font-sans"
      dir="rtl"
    >
      {/* =========================
          EXPANDED DIALOGUE CARD
      ========================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.88,
              y: 15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 10,
            }}
            transition={{
              duration: 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mb-3 w-[calc(100vw-2rem)] max-w-[320px] sm:max-w-[350px] overflow-hidden rounded-3xl border border-primary/30 bg-surface/95 p-4 shadow-2xl backdrop-blur-2xl text-foreground origin-bottom-right"
            style={{
              boxShadow:
                '0 20px 45px -8px rgba(0, 0, 0, 0.45)',
            }}
          >
            {/* Ambient inner glow */}
            <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-primary/20 blur-xl" />

            {/* =========================
                HEADER
            ========================== */}
            <div className="relative z-10 flex items-center justify-between border-b border-border-subtle/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px] font-black">
                  👑
                </span>

                <div>
                  <h4 className="text-xs font-black text-foreground">
                    «عم وه» صاحب المنصة
                  </h4>

                  <span className="text-[10px] font-bold text-primary">
                    {activeStory.role}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleNextStory}
                  title="حكاية تانية مع عم وه"
                  className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-foreground-secondary hover:text-primary transition-colors cursor-pointer"
                >
                  <RefreshCw size={12} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="إغلاق النافذة"
                  className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-foreground-secondary hover:text-foreground transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* =========================
                CONTENT BODY
            ========================== */}
            <div className="relative z-10 mt-3 flex items-start gap-3">

              {/* =========================
                  MASCOT (GPU-accelerated smooth hover)
              ========================== */}
              <div
                className="shrink-0 relative cursor-pointer transform-gpu transition-transform duration-300 hover:scale-110 active:scale-95 will-change-transform"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentStory.image}
                    src={currentStory.image}
                    alt="عم وه"
                    initial={{
                      opacity: 0,
                      scale: 0.85,
                      x: 10,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.85,
                      x: -10,
                    }}
                    transition={{
                      duration: 0.25,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      imageRendering: 'crisp-edges',
                    }}
                    width={96}
                    height={96}
                    decoding="async"
                    className="h-20 sm:h-24 w-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)] select-none"
                  />
                </AnimatePresence>
              </div>

              {/* =========================
                  DIALOGUE
              ========================== */}
              <div className="flex-1 space-y-1.5 min-w-0">

                <div className="inline-block rounded-md bg-amber-500/15 px-2 py-0.5 text-[9px] font-black text-amber-900 dark:text-amber-300 border border-amber-500/20">
                  {activeStory.badge}
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={storyIndex}
                    initial={{
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -5,
                    }}
                    transition={{
                      duration: 0.18,
                    }}
                    className="text-xs font-bold leading-relaxed text-foreground/95"
                  >
                    {currentStory.text}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* =========================
                FOOTER
            ========================== */}
            <div className="relative z-10 mt-3 flex items-center justify-between border-t border-border-subtle/70 pt-2 text-[10px] text-foreground-disabled">
              <span>
                باب: {activeStory.title}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('play-wah-intro'));
                    }
                  }}
                  className="font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  شاشة البداية ↺
                </button>
                <span className="text-border-subtle">|</span>
                <button
                  type="button"
                  onClick={handleNextStory}
                  className="font-black text-primary hover:underline cursor-pointer"
                >
                  اسمع كلام تاني ←
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================
          FLOATING TRIGGER BUTTON
      ========================== */}
      <motion.button
        type="button"
        whileHover={{
          scale: 1.06,
          y: -4,
        }}
        whileTap={{
          scale: 0.92,
        }}
        onClick={() =>
          setIsOpen((prev) => !prev)
        }
        className="group relative flex items-center gap-1.5 sm:gap-2.5 rounded-full border border-primary/40 bg-surface/95 p-1.5 sm:px-3 sm:py-1.5 shadow-xl sm:shadow-2xl backdrop-blur-xl hover:border-primary cursor-pointer transition-all"
        style={{
          boxShadow:
            '0 8px 25px -4px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Pulsing beacon ring */}
        <span className="absolute -inset-0.5 rounded-full bg-primary/20 blur-xs sm:blur-sm group-hover:bg-primary/30 transition-all pointer-events-none" />

        {/* Transition wrapper for smooth page change fade in/out */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{
              opacity: 0,
              y: 8,
              scale: 0.94,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -8,
              scale: 0.94,
            }}
            transition={{
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex items-center gap-1.5 sm:gap-2.5"
          >
            {/* =========================
                MASCOT AVATAR (GPU-accelerated hover & touch feedback)
            ========================== */}
            <div
              className="relative z-10 -my-1 sm:-my-2 shrink-0 transform-gpu transition-transform duration-300 group-hover:scale-110 active:scale-95 will-change-transform"
            >
              <img
                src={currentStory.image}
                alt="عم وه"
                style={{
                  imageRendering: 'crisp-edges',
                }}
                width={48}
                height={48}
                decoding="async"
                loading="eager"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-md select-none -scale-x-100"
              />

              {/* Mini Sparkle badge on mobile */}
              <span className="sm:hidden absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white shadow-md border border-surface sm:border-2">
                <Sparkles size={8} />
              </span>
            </div>

            {/* =========================
                TEXT PILL
            ========================== */}
            <div className="relative z-10 text-right hidden sm:block">
              <span className="block text-[11px] font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                حكاية «عم وه»
              </span>

              <span className="block text-[9px] font-bold text-primary leading-tight">
                {isOpen
                  ? 'انقر للإغلاق'
                  : 'عملت إيه هنا؟'}
              </span>
            </div>

            {/* =========================
                SPARKLE ICON
            ========================== */}
            <div className="relative z-10 hidden sm:flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Sparkles size={11} />
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </aside>
  );
};

export default FloatingUncleWahCompanion;