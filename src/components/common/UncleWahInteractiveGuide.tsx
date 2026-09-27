import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageCircle, RefreshCw, Volume2 } from 'lucide-react';

export type UncleWahContextType = 'places' | 'food' | 'governorate' | 'crafts' | 'people' | 'events';

export interface UncleWahInteractiveGuideProps {
  context: UncleWahContextType;
  title?: string;
  locationName?: string;
  customQuote?: string;
  className?: string;
}

interface ReactionData {
  primaryImg: string;
  secondaryImg: string;
  role: string;
  badge: string;
  quotes: string[];
  soundEffectText?: string;
}

const CONTEXT_REACTIONS: Record<UncleWahContextType, ReactionData> = {
  places: {
    // الجدية والوقار عند الحديث عن الآثار والمعالم العتيقة
    primaryImg: '/mascot/athar.png',
    secondaryImg: '/mascot/fav.png',
    role: 'عم وه حارس الآثار والعتيق',
    badge: 'وقار وتاريخ الأجداد',
    quotes: [
      '«يا مرحب بيك في حيطان التاريخ وعزة أجدادنا.. المكان ده شاهد على آلاف السنين، وقف واتأمل عظمته!»',
      '«لفيت وتعبت ودست في كل شبر وجبل عشان أوثق لكم عظمة المعلم ده، تاريخ يشرف كل مصري وصعيدي!»',
      '«كل حجر هنا ليه سر حكاه الأجداد، اسمع للحيطان وشم ريحة الأصالة!»',
    ],
    soundEffectText: 'صوت هيبة التاريخ',
  },
  food: {
    // الفرح والشهية والبهجة عند الحديث عن الأكلات البلدي
    primaryImg: '/mascot/foods.png',
    secondaryImg: '/mascot/fav.png',
    role: 'سفرة عم وه وخير بيوتنا',
    badge: 'لقمة هنية تروق البال',
    quotes: [
      '«وه! الأكلة دي تروق البال وتغذي الروح! يا زين ما نقيت، دا طبيخ صعيدي بلدي أصيل 100%!»',
      '«بالهنا والشفا على قلبك يا غالي! متنساش تدوقها سخنة مع لقمة عيش شمسي طازة طالعة من الفرن!»',
      '«سر النفس الحلو ده موروث من أمهاتنا وجداتنا في بيوت الصعيد، خير ملوش مثيل!»',
    ],
    soundEffectText: 'ريحة الفرن البلدي',
  },
  governorate: {
    // الترحاب الفياض وفخر الدليل المحلي بأهله
    primaryImg: '/mascot/saaed.png',
    secondaryImg: '/mascot/fav.png',
    role: 'دليل عم وه لديار الجنوب',
    badge: 'ديار الكرم والشهامة',
    quotes: [
      '«نورت ديار الكرم والشهامة! المحافظة دي كل شبر وقرية فيها ليها حكاية وخير ونفحات طيبة.»',
      '«أنا لفيت قراها ونجوعها شبر شبر على رجلي، ناسها أجدع وأطيب ناس وتراثهم في القلب!»',
      '«لو لفيت الدنيا بحالها مش هتلاقي زي دفا ولمة أهالي المحافظة دي، اتفسح وانبسط!»',
    ],
    soundEffectText: 'كرم الضيافة الصعيدي',
  },
  crafts: {
    // تاجر الصنعة الخبير المقدر لشغل اليد الحرفي
    primaryImg: '/mascot/pro.png',
    secondaryImg: '/mascot/fav.png',
    role: 'عم وه تاجر الصنعة والبركة',
    badge: 'شغل يد يتوزن بالذهب',
    quotes: [
      '«صنعة يد تتوزن بالذهب! شيوخ الصنعة ورثوا السر ده أب عن جد ومفيش زيه في الدنيا كلها.»',
      '«كل دقة ولمسة في القطعة دي معمولة بحب وعرق وتاريخ.. حتة حية من روح الصعيد في بيتك!»',
      '«شيوخ الصنعة هما حراس الهوية، لما تشتري منهم إنت بتدعم أسطوات حقيقيين بيصونوا تراثنا.»',
    ],
    soundEffectText: 'دقة الصنعة في الورشة',
  },
  people: {
    // هيبة ووقار المضايف عند الحديث عن الكبار
    primaryImg: '/mascot/fan.png',
    secondaryImg: '/mascot/fav.png',
    role: 'عم وه في مضايف الأكابر',
    badge: 'سيرة عطرة وناس علامة',
    quotes: [
      '«قعدت في مضايف الكبار وسمعت من شيوخ الصنعة والرواة، سيرة عطرة تفضل علامة وشرف لكل صعيدي.»',
      '«الرجال بالكلمة والأثر، ودي قامة سابت بصمة متتمحيش في تاريخ بلادنا!»',
    ],
    soundEffectText: 'واجب المضايف',
  },
  events: {
    // البهجة والتحطيب والموالد
    primaryImg: '/mascot/events.png',
    secondaryImg: '/mascot/fav.png',
    role: 'عم وه في ليالي الموالد',
    badge: 'ليالي الفرح والتحطيب',
    quotes: [
      '«ليلة من ليالي الفرح والبركة! اسمع دقة عصيان التحطيب وزغاريد المواسم وعيش البهجة.»',
      '«الموالد دي لمّة أهل وحبايب ونفحات طيبة بترد الروح.. افرح معانا!»',
    ],
    soundEffectText: 'بهجة وزغاريد المولد',
  },
};

export const UncleWahInteractiveGuide: React.FC<UncleWahInteractiveGuideProps> = ({
  context,
  title,
  locationName,
  customQuote,
  className = '',
}) => {
  const data = CONTEXT_REACTIONS[context] || CONTEXT_REACTIONS.places;
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isAltReaction, setIsAltReaction] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const activeImage = isAltReaction ? data.secondaryImg : data.primaryImg;

  const currentQuote =
    customQuote && quoteIndex === 0
      ? customQuote
      : data.quotes[quoteIndex % data.quotes.length];

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % data.quotes.length);
    setIsAltReaction((prev) => !prev);
    setHasInteracted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      dir="rtl"
      className={`relative overflow-hidden rounded-3xl sm:rounded-4xl border border-primary/25 bg-gradient-to-r from-surface-subtle/95 via-surface-subtle/85 to-primary/10 p-4 sm:p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-primary/40 ${className}`}
    >
      {/* Decorative ambient subtle lights */}
      <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-primary/15 blur-2xl" />
      <div className="pointer-events-none absolute -right-12 -bottom-12 h-36 w-36 rounded-full bg-amber-500/15 blur-2xl" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
        {/* INTERACTIVE MASCOT WITH CRISP-EDGES & HOVER / CLICK REACTION */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleNextQuote}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNextQuote();
            }
          }}
          title="اضغط على عم وه لتبديل الحكاية والرياكشن"
          className="group relative flex flex-col items-center justify-end shrink-0 cursor-pointer select-none focus:outline-hidden"
        >
          {/* Subtle glow ring behind Uncle Wah */}
          <div className="absolute -inset-2 rounded-full bg-primary/20 blur-md opacity-60 group-hover:opacity-100 transition-opacity" />

          {/* Floating animated avatar with crisp-edges */}
          <motion.div
            key={activeImage}
            initial={{ scale: 0.9, rotate: -2 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.06, rotate: 1 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="relative z-10"
          >
            <img
              src={activeImage}
              alt={data.role}
              style={{
                imageRendering: 'crisp-edges',
                WebkitFontSmoothing: 'antialiased',
              }}
              className="h-28 sm:h-32 lg:h-36 w-auto object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.25)] transition-all"
              loading="eager"
            />
          </motion.div>

          {/* Synchronized ground shadow */}
          <div className="w-20 sm:w-24 h-1.5 rounded-[100%] bg-black/40 blur-xs mx-auto -mt-1 group-hover:scale-90 transition-transform" />

          {/* Interactive poke hint badge */}
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-black/40 dark:bg-white/10 px-2 py-0.5 text-[9px] font-bold text-amber-300 backdrop-blur-xs transition-colors group-hover:bg-primary group-hover:text-white">
            <RefreshCw size={9} className="shrink-0 group-hover:rotate-180 transition-transform duration-500" />
            <span>{hasInteracted ? 'حكاية تانية' : 'انقر على عم وه'}</span>
          </span>
        </div>

        {/* NARRATIVE & SPEECH BUBBLE */}
        <div className="flex-1 text-right space-y-2 min-w-0 w-full">
          {/* Top badges bar */}
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-black shadow-2xs">
                <Sparkles size={11} className="shrink-0" />
                <span>«عم وه» صاحب المنصة</span>
              </span>

              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                {data.role}
              </span>
            </div>

            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              {data.badge}
            </span>
          </div>

          {/* Speech Bubble */}
          <div className="relative rounded-2xl bg-background/85 border border-primary/20 p-3 sm:p-3.5 shadow-xs backdrop-blur-md">
            <AnimatePresence mode="wait">
              <motion.p
                key={quoteIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-xs sm:text-[13px] font-bold text-foreground/95 leading-relaxed"
              >
                {currentQuote}
              </motion.p>
            </AnimatePresence>

            {/* Bubble footer with interaction trigger */}
            <div className="mt-2 flex items-center justify-between border-t border-border-subtle/70 pt-1.5 text-[10px] text-foreground-disabled">
              <span className="font-medium">
                {locationName ? `من وحي ديار ${locationName}` : title ? `عن: ${title}` : 'توثيق صعيدى أصيل'}
              </span>

              <button
                type="button"
                onClick={handleNextQuote}
                className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-black cursor-pointer transition-colors"
              >
                <MessageCircle size={11} />
                <span>حكاية كمان مع عم وه ←</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UncleWahInteractiveGuide;
