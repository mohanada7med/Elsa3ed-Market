
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  MessageCircle,
  RefreshCw,
  Star,
  Zap,
  Heart,
  ArrowLeft,
} from 'lucide-react';

export type UncleWahContextType =
  | 'places'
  | 'food'
  | 'governorate'
  | 'crafts'
  | 'people'
  | 'events';

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
    primaryImg: '/mascot/make.png',
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

export const UncleWahInteractiveGuide: React.FC<
  UncleWahInteractiveGuideProps
> = ({
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

  const activeImage = isAltReaction
    ? data.secondaryImg
    : data.primaryImg;

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
    <motion.section
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      dir="rtl"
      className={`
        relative isolate overflow-hidden rounded-[30px]
        border-[2px] border-[#B24C2B]/25
        bg-[#FAF7F2] dark:bg-[#241E1A]
        shadow-[0_10px_0_rgba(38,70,83,0.12)]
        ${className}
      `}
    >
      {/* Comic background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.10] dark:opacity-[0.08]"
          style={{
            backgroundImage: 'radial-gradient(#B24C2B 1.3px, transparent 1.3px)',
            backgroundSize: '13px 13px',
          }}
        />

        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#D97724]/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#D97724]/15 blur-3xl" />

        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute right-[45%] top-5 text-[#D97724]/60"
        >
          <Zap size={30} fill="currentColor" />
        </motion.div>
      </div>

      {/* Comic top strip */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-5 sm:px-7">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 rotate-[-8deg] items-center justify-center rounded-xl bg-[#B24C2B] text-white shadow-[3px_3px_0_#78311E]">
            <Sparkles size={17} />
          </span>
          <div>
            <p className="text-sm font-black text-[#241E1A] dark:text-[#FAF7F2]">
              عم وه!
            </p>
            <p className="text-[9px] font-black tracking-widest text-[#B24C2B]">
              THE STORYTELLER
            </p>
          </div>
        </div>

        <div className="rotate-2 rounded-lg border-2 border-[#D97724] bg-[#D97724]/10 px-3 py-1.5 text-[9px] font-black text-[#A95B16] dark:text-[#F1B36D]">
          {data.badge}
        </div>
      </div>

      {/* Comic stage */}
      <div className="relative z-10 grid items-center gap-1 px-4 pb-5 pt-3 sm:grid-cols-[1fr_1.15fr_1fr] sm:gap-2 sm:px-6 sm:pb-7">

        {/* First speech bubble */}
        <div className="relative z-20 order-2 sm:order-1">
          <motion.div
            initial={{ opacity: 0, x: 20, rotate: 4 }}
            animate={{ opacity: 1, x: 0, rotate: -2 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-[25px] rounded-bl-[5px] border-[3px] border-[#B24C2B] bg-white p-3 shadow-[5px_6px_0_#B24C2B]/20 dark:bg-[#332820] sm:p-4"
          >
            <div className="absolute -top-3 right-4 rounded-full bg-[#D97724] px-3 py-1 text-[9px] font-black text-white">
              اسمع يا غالي!
            </div>

            <p className="mt-2 text-[11px] font-bold leading-[2] text-[#241E1A] dark:text-[#FAF7F2]">
              {data.role}
            </p>

            <div className="mt-2 flex items-center gap-1 text-[#D97724]">
              <Star size={11} fill="currentColor" />
              <Star size={11} fill="currentColor" />
              <Star size={11} fill="currentColor" />
            </div>
          </motion.div>

          <div className="mt-3 hidden text-center text-[10px] font-bold text-[#D97724]/60 dark:text-[#C0D5DA] sm:block">
            الحكاية ورا كل حاجة
          </div>
        </div>

        {/* Main mascot pop-out */}
        <div className="relative order-1 flex min-h-[245px] items-center justify-center sm:order-2 sm:min-h-[290px]">

          {/* Comic burst */}
          <motion.div
            animate={{ rotate: [0, 3, -3, 0], scale: [1, 1.035, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute h-[225px] w-[225px] sm:h-[265px] sm:w-[265px]"
          >
            <svg viewBox="0 0 300 300" className="h-full w-full overflow-visible">
              <path
                d="M150 5 L177 42 L220 17 L227 65 L278 63 L263 112 L300 150 L263 188 L278 237 L227 235 L220 283 L177 258 L150 295 L123 258 L80 283 L73 235 L22 237 L37 188 L0 150 L37 112 L22 63 L73 65 L80 17 L123 42 Z"
                fill="#D97724"
                stroke="#B24C2B"
                strokeWidth="5"
                strokeLinejoin="round"
              />
              <circle cx="150" cy="150" r="105" fill="#FAF7F2" opacity=".85" />
            </svg>
          </motion.div>

          {/* Character */}
          <motion.img
            key={activeImage}
            src={activeImage}
            alt={data.role}
            initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 14 }}
            whileHover={{ scale: 1.06, rotate: 2 }}
            className="relative z-10 h-[235px] w-auto max-w-[95%] object-contain drop-shadow-[0_13px_8px_rgba(0,0,0,0.25)] sm:h-[275px]"
          />

          {/* Comic sound effect */}
          <motion.div
            animate={{ rotate: [8, -5, 8], y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute left-0 top-5 z-20 -rotate-6 rounded-xl border-[3px] border-white bg-[#B24C2B] px-3 py-2 text-sm font-black text-white shadow-[3px_4px_0_#19343D]"
          >
            وه!
          </motion.div>

          <div className="absolute bottom-0 z-20 rounded-full border-2 border-white bg-[#B24C2B] px-5 py-1.5 text-[10px] font-black text-white shadow-[0_4px_0_#78311E] dark:border-[#241E1A]">
            صاحب المنصة ✦
          </div>
        </div>

        {/* Second speech bubble */}
        <div className="relative z-20 order-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0, x: -18, rotate: -4, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, rotate: 2, scale: 1 }}
              exit={{ opacity: 0, x: 12, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-[25px] rounded-tr-[5px] border-[3px] border-[#D97724] bg-white p-3 shadow-[5px_6px_0_rgba(38,70,83,0.17)] dark:bg-[#332820] dark:border-[#D97724] sm:p-4"
            >
              <div className="absolute -top-3 left-4 rounded-full bg-[#D97724] px-3 py-1 text-[9px] font-black text-white dark:bg-[#D97724]">
                حكاية من القلب
              </div>

              <div className="mt-2 flex items-center gap-1 text-[#D97724]">
                <MessageCircle size={13} />
                <span className="text-[9px] font-black">عم وه بيقولك</span>
              </div>

              <p className="mt-2 text-[11px] font-bold leading-[2] text-[#241E1A] dark:text-[#FAF7F2] sm:text-xs">
                {currentQuote}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Comic footer */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#B24C2B]/15 bg-[#E8E1D9]/70 px-5 py-3 dark:bg-[#3B3029]/80 sm:px-7">
        <div className="flex items-center gap-2">
          <Heart size={14} fill="currentColor" className="text-[#B24C2B]" />
          <span className="text-[10px] font-black text-[#D97724] dark:text-[#F0DED0]">
            {locationName
              ? `من ديار ${locationName}`
              : title || 'الحكاية ورا كل حاجة'}
          </span>
        </div>

        <motion.button
          type="button"
          onClick={handleNextQuote}
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.94 }}
          className="flex items-center gap-2 rounded-xl border-2 border-[#B24C2B] bg-[#B24C2B] px-4 py-2 text-[10px] font-black text-white shadow-[0_4px_0_#78311E] transition-colors hover:bg-[#963D23]"
        >
          <RefreshCw size={13} />
          {hasInteracted ? 'يلا حكاية جديدة' : 'اضغط وشوف حكاية'}
          <ArrowLeft size={12} />
        </motion.button>
      </div>
    </motion.section>
  );
};

export default UncleWahInteractiveGuide;