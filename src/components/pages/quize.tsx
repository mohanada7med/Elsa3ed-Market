import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';

import { useApp } from '../../context/AppContext';

import {
  ArrowLeft,
  Check,
  Clock,
  Copy,
  Flame,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Trophy,
  X,
  Target
} from 'lucide-react';

import { UncleWahHeroBanner } from '../common/UncleWahHeroBanner';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const TOTAL_QUIZ_TIME = 90;

// AudioContext singleton
let globalAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!globalAudioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (AudioCtx) {
      globalAudioCtx = new AudioCtx();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
};

const playBeep = (freq = 440, type: OscillatorType = 'sine', duration = 0.15) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // ignore audio failures
  }
};

const RAW_DIALECT_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'لما واحد صعيدي يقولك «دِلْوَقتي» أو «دِلْعَادي»، غالبًا قصده إيه؟',
    options: ['في الوقت الحالي', 'بكرة الصبح بدري', 'من كام سنة فاتوا', 'بعد شوية مش كتير'],
    correctAnswer: 'في الوقت الحالي',
    explanation: 'المقصود إن الحاجة بتحصل في الوقت الحالي أو تواً.',
  },
  {
    id: 'q2',
    question: 'لو حد قال «الواد ده هَبّاش»، يقصد إيه؟',
    options: ['شغال وبيسعى على رزقه', 'بيحب النوم والراحة', 'كلامه كتير ومالوش لزمة', 'بيخاف ومابيحبش الناس'],
    correctAnswer: 'شغال وبيسعى على رزقه',
    explanation: 'هبّاش بتتقال على الشخص الشغيل اللي بيسعى وما بيكسلش.',
  },
  {
    id: 'q3',
    question: 'كلمة «المندرة» في البيت الصعيدي معناها إيه؟',
    options: ['أوضة الضيوف واستقبال الرجال', 'مكان خبيز العيش الشمسي', 'حوش البهايم والمواشي', 'مخزن الغلال والقمح'],
    correctAnswer: 'أوضة الضيوف واستقبال الرجال',
    explanation: 'المندرة هي صالة الضيافة الكبيرة لاستقبال الزوار وكبار البلد.',
  },
  {
    id: 'q4',
    question: 'لو قالك «قرّب اقعد على الدِّكّة»، الدكة دي عبارة عن إيه؟',
    options: ['مقعد خشب عريض للقعدة', 'فرشة معمولة من الصوف', 'سجادة مفروشة على الأرض', 'ترابيزة واطية للأكل'],
    correctAnswer: 'مقعد خشب عريض للقعدة',
    explanation: 'الدكة هي كنبة خشبية عريضة تقليدية قدام البيوت وفي المندرة.',
  },
  {
    id: 'q5',
    question: 'كلمة «البَلاص» المشهورة في ريف وصعيد مصر تُستخدم في إيه؟',
    options: ['حفظ العسل والجبنة القديمة', 'غسيل الهدوم اليدوي', 'شيل حبوب القمح والشعير', 'تسوية العيش البلدي'],
    correctAnswer: 'حفظ العسل والجبنة القديمة',
    explanation: 'البلاص هو إناء فخاري كبير أصيل بيتحفظ فيه العسل الأسود والجبن القديم.',
  },
  {
    id: 'q6',
    question: 'لو واحد صعيدي قال «عَوِّقْتْ ليه في المشوار؟»، قصده إيه؟',
    options: ['ليه اتأخرت وأخدت وقت؟', 'ليه غيرت طريقك؟', 'ليه مشيت في الشمس؟', 'ليه ماروحتش مشوارك؟'],
    correctAnswer: 'ليه اتأخرت وأخدت وقت؟',
    explanation: 'عوّق تعني أبطأ أو تأخر في العودة.',
  },
  {
    id: 'q7',
    question: 'لما يقول «إحنا بنِخبِز في الماجور»، ما هو «الماجور»؟',
    options: ['وعاء فخاري كبير للعجين', 'فرن طين بلدي قديم', 'خشبة تقليب العيش', 'غربال تنقية الدقيق'],
    correctAnswer: 'وعاء فخاري كبير للعجين',
    explanation: 'الماجور إناء فخاري واسع وعميق بيتعجن فيه الدقيق البلدي.',
  },
  {
    id: 'q8',
    question: 'لو قال «الراجل ده بَخيت»، كلمة «بخيت» معناها إيه؟',
    options: ['شخص محظوظ ومرزوق', 'راجل كريم وسخي', 'شخص فقير ومحتاج', 'شخص سريع الحركة'],
    correctAnswer: 'شخص محظوظ ومرزوق',
    explanation: 'بخيت مشتقة من البخت، أي صاحب الحظ الطيب والتوفيق.',
  },
  {
    id: 'q9',
    question: 'لما حد يقول «استهدى بالله وارتزّ»، كلمة «ارتزّ» معناها إيه؟',
    options: ['اقعد واثبت في مكانك', 'اتكلم وقول طلباتك', 'امشي وماترجعش تاني', 'نام واصحى بكير'],
    correctAnswer: 'اقعد واثبت في مكانك',
    explanation: 'ارتزّ بتتقال بمعنى اقعد واهدأ واثبت مكانك.',
  },
  {
    id: 'q10',
    question: 'لو حد قال «ده واد لِبِخ في الكلام»، كلمة «لِبِخ» تعني إيه؟',
    options: ['فصيح ولسانه حلو ومقنع', 'صوته عالي ومزعج للناس', 'كلامه قليل وخجول جداً', 'صادق ومابيعرفش يجامل'],
    correctAnswer: 'فصيح ولسانه حلو ومقنع',
    explanation: 'اللبخ أو اللبق هو اللبق الفصيح صاحب اللسان الحاضر المقنع.',
  },
  {
    id: 'q11',
    question: 'في الصعيد، لما يقول «جبت الحَبّة والنسوان خَبَزوا التاوة»، ما هي التاوة؟',
    options: ['صينية أو صاج تسوية العيش الرقيق', 'حلة تسوية اللحمة', 'طبق شوربة العدس', 'مغرفة العسل'],
    correctAnswer: 'صينية أو صاج تسوية العيش الرقيق',
    explanation: 'التاوة هي الصاج المعدني الدائري المستوي الذي يخبز عليه الرقاق أو الفطير.',
  },
  {
    id: 'q12',
    question: 'لو قالك «ادّيني هَبّابة»، يقصد بيها إيه؟',
    options: ['شوية وقت قليلين خالص', 'كوباية مية ساقعة', 'عصاية طويلة للغيط', 'حاجة مروحة للتهوية'],
    correctAnswer: 'شوية وقت قليلين خالص',
    explanation: 'الهبّابة أو الهبّة تعني لحظة زمنية قصيرة أو هنيهة.',
  },
  {
    id: 'q13',
    question: 'المثل الصعيدي الأصيل: «العِرج يمد لسابع جد»، معناه إيه؟',
    options: ['الأصل والجينات والطباع تتوارث عبر الأجيال', 'طول القامة في العائلة', 'السفر لمسافات بعيدة', 'كثرة الأقارب في القرية'],
    correctAnswer: 'الأصل والجينات والطباع تتوارث عبر الأجيال',
    explanation: 'يعني أن أصل العائلة وخلقها يظهر حتماً في تصرفات الأبناء والأحفاد.',
  },
  {
    id: 'q14',
    question: 'المثل الصعيدي: «أطعم الفم تستحي العين»، يدعو لإيه؟',
    options: ['الكرم وحسن الضيافة يكسبك مودة الناس واحترامهم', 'الامتناع عن الأكل أمام الضيوف', 'الصمت وقت الطعام', 'الطبخ بكميات كبيرة'],
    correctAnswer: 'الكرم وحسن الضيافة يكسبك مودة الناس واحترامهم',
    explanation: 'الإحسان وإطعام الطعام يكسر العداوة ويزرع الخجل والتقدير في النفوس.',
  },
  {
    id: 'q15',
    question: 'المثل: «الشاطرة تغزل برجل حمار»، يضرب في إيه؟',
    options: ['المهارة والقدرة على النجاح بأبسط الإمكانيات', 'صناعة السجاد اليدوي', 'تربية المواشي في الريف', 'السرعة في الغزل'],
    correctAnswer: 'المهارة والقدرة على النجاح بأبسط الإمكانيات',
    explanation: 'يدل على أن صاحب الحرفة البارع يستطيع الإنجاز والإبداع بأي وسيلة متاحة.',
  },
  {
    id: 'q16',
    question: 'المثل الصعيدي: «على قد لحافك مد رجليك»، حكمته إيه؟',
    options: ['العيش في حدود قدرتك المادية دون ديون', 'النوم المبكر في الشتاء', 'شراء أقمشة طويلة', 'التواضع مع الكبار'],
    correctAnswer: 'العيش في حدود قدرتك المادية دون ديون',
    explanation: 'التصرف بحكمة والتزام الإنفاق حسب الدخل والموارد المتاحة.',
  },
  {
    id: 'q17',
    question: 'المثل: «اللقمة الهنية تكفي مية»، يُقصد به إيه؟',
    options: ['البركة والرضا والمحبة تجمع الناس مهما قلّ الطعام', 'كثرة الضيوف على الوليمة', 'طبخ العيش الشمسي', 'توزيع الطعام على الفقراء'],
    correctAnswer: 'البركة والرضا والمحبة تجمع الناس مهما قلّ الطعام',
    explanation: 'الرضا والمودة والصفاء تجعل القليل كافياً ومباركاً للجميع.',
  },
  {
    id: 'q18',
    question: 'المثل: «اللي ما يشوفش من الغربال يبقى أعمى»، يضرب في إيه؟',
    options: ['الأمر الواضح الجلي الذي لا يحتاج لدليل', 'تنقية الحبوب والدقيق', 'ضعف البصر لكبار السن', 'صناعة الغرابيل اليدوية'],
    correctAnswer: 'الأمر الواضح الجلي الذي لا يحتاج لدليل',
    explanation: 'يضرب في وضوح الحقيقة وظهورها بحيث لا تخفى إلا على من يتعامى عنها.',
  },
  {
    id: 'q19',
    question: 'المثل: «يا واخد القوت يا ناوي على الموت»، حكمة صريحة عن إيه؟',
    options: ['التحذير الشديد من أكل أموال وحقوق الضعفاء وأرزاقهم', 'الموت جوعاً في السفر', 'تقاسم الخبز في الغيط', 'تخزين الغلال للعام القادم'],
    correctAnswer: 'التحذير الشديد من أكل أموال وحقوق الضعفاء وأرزاقهم',
    explanation: 'تحذير تراثي صعيدي شديد اللهجة من ظلم الناس في أقواتهم ومصادر رزقهم.',
  },
  {
    id: 'q20',
    question: 'المثل: «قرد موالف ولا غزال شارد»، حكمته في العلاقات إيه؟',
    options: ['تفضيل الصاحب القريب المخلص المضمون على البعيد غير المأمون', 'تربية الحيوانات في البيت', 'صيد الغزلان في الصحراء الشرقية', 'سرعة المشي في الجبل'],
    correctAnswer: 'تفضيل الصاحب القريب المخلص المضمون على البعيد غير المأمون',
    explanation: 'تفضيل من تعرف طباعه وألفته وتضمن وفاءه على من يبهرك بمظهره لكنه يغدر أو يبتعد.',
  }
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const createRandomQuiz = (): QuizQuestion[] => {
  return shuffleArray(RAW_DIALECT_QUESTIONS)
    .slice(0, 10)
    .map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));
};

export const DialectDictionaryPage: React.FC = () => {
  const { activePage, setActivePage, addToast } = useApp();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

  const [showIntro, setShowIntro] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_QUIZ_TIME);

  const currentQuestion = questions[currentIndex];

  const startQuiz = useCallback(() => {
    setQuestions(createRandomQuiz());
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setCompleted(false);
    setCopied(false);
    setShowIntro(true);
    setGameStarted(false);
    setCountdown(null);
    setTimeLeft(TOTAL_QUIZ_TIME);
  }, []);

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  // Timer
  useEffect(() => {
    if (!gameStarted || completed) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          playBeep(220, 'sawtooth', 0.4);
          setCompleted(true);
          return 0;
        }

        if (prev <= 6 && prev > 1) {
          playBeep(880, 'square', 0.06);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, completed]);

  const beginGame = () => {
    playBeep(440, 'triangle', 0.15);
    setShowIntro(false);
    setCountdown(3);

    let count = 3;
    const timer = window.setInterval(() => {
      count -= 1;
      if (count > 0) {
        playBeep(440 + (3 - count) * 80, 'sine', 0.12);
        setCountdown(count);
        return;
      }

      playBeep(750, 'triangle', 0.25);
      window.clearInterval(timer);
      setCountdown(null);
      setTimeLeft(TOTAL_QUIZ_TIME);
      setGameStarted(true);
    }, 800);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const result = useMemo(() => {
    if (score >= 9) {
      return {
        badge: 'عمدة الصعيد 👳‍♂️',
        title: 'صعيدي أصيل أباً عن جد',
        description: 'ما شاء الله عليك! ودنك واعية لكلام وأمثال وأصول الصعيد كلها.',
      };
    }
    if (score >= 7) {
      return {
        badge: 'ابن بلد واعي 📜',
        title: 'فاهم كلام الصعيد كويس جداً',
        description: 'شاطر وعندك معرفة حقيقية بلهجة وحكم الصعايدة.',
      };
    }
    if (score >= 5) {
      return {
        badge: 'مستمع طيب',
        title: 'صعيدي نص نص',
        description: 'فاهم المعنى العام، ومحتاج تقعد في المندرة شوية عشان تتقن الباقي.',
      };
    }
    return {
      badge: 'ضيف عزيز',
      title: 'محتاج تلف لفة في الصعيد',
      description: 'زر أسوان وقنا وسوهاج واقعد مع عم وه عشان تشرب اللهجة من منبعها.',
    };
  }, [score]);

  const handleSelectOption = (option: string) => {
    if (selectedAnswer !== null || completed) return;

    setSelectedAnswer(option);
    const isCorrect = option === currentQuestion.correctAnswer;

    if (isCorrect) {
      playBeep(880, 'sine', 0.15);
      setScore((prev) => prev + 1);
    } else {
      playBeep(260, 'sawtooth', 0.25);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        setCompleted(true);
        if (score + (isCorrect ? 1 : 0) >= 8) {
          playBeep(523, 'triangle', 0.1);
          setTimeout(() => playBeep(659, 'triangle', 0.1), 120);
          setTimeout(() => playBeep(784, 'triangle', 0.3), 240);
        }
      }
    }, 1500);
  };

  const copyResult = () => {
    const shareText = `أنا حققت ${score}/10 في تحدي «عم وه واللهجة الصعيدية» (${result.title})! اختبر نفسك وشوف هتطلع صعيدي أصيل ولا محتاج تدريب: ${window.location.origin}/quize`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      addToast('تم نسخ النتيجة!', 'تقدر تبعتها لأصحابك الآن', 'info');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareWhatsAppMessage = () => {
    const text = encodeURIComponent(
      `أنا حققت ${score}/10 في مسابقة «عم وه واللهجة الصعيدية» وحصلت على لقب (${result.badge})! يا ترى تقدر تغلبني؟ ادخل وجرّب: ${window.location.origin}/quize`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const isHomePage = activePage === 'home';
  const WrapperTag = isHomePage ? 'div' : 'main';

  return (
    <WrapperTag
      dir="rtl"
      className="
        relative
        min-h-screen
        w-full
        overflow-x-hidden
        bg-background
        text-foreground
        transition-colors duration-500
      "
    >
      {/* 1. شعار وشريط البانر التراثي */}
      {!isHomePage && (
        <UncleWahHeroBanner
          doorTitle="مسابقة عم وه • كلام الصعيد"
          quote="«اتعلم كلام أهل الصعيد الأصيل واختبر معرفتك بلهجتنا التراثية مع عم وه.»"
          mascotSrc="/mascot/quiz.png"
          mascotRole="حكيم الصعيد وخبير اللهجة التراثية"
          doorBadge="تحدي عم وه"
          actionText="العودة للرئيسية"
          onAction={() => setActivePage('home')}
        />
      )}

      {/* 2. شاشة البداية */}
      {showIntro && !completed && (
        <div className="relative z-10 pt-6 sm:pt-10">
          <section className="mx-auto max-w-[1000px] px-5 sm:px-8">
            <div className="rounded-3xl bg-[#3B1E0E] text-white p-6 sm:p-12 relative overflow-hidden shadow-xl mb-12">
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <img
                    src="/mascot/quiz.png"
                    alt="عم وه"
                    className="w-24 h-24 sm:w-32 sm:h-32 object-contain shrink-0 drop-shadow-xl"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#C99444] block mb-1">
                      أهلاً بيك في مضايفة عم وه
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black mb-2">
                      مسابقة لهجة وكلام الصعيد
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 max-w-md leading-relaxed">
                      10 أسئلة سريعة ومعاك {TOTAL_QUIZ_TIME} ثانية للجولة كاملة. ركز وشوف نفسك صعيدي أصيل ولا ضيف عزيز!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={beginGame}
                  className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[#E66A2E] hover:bg-[#d6571a] text-white text-sm font-black transition-all shadow-md hover:scale-105 cursor-pointer shrink-0"
                >
                  ابدأ الاختبار الآن ⚡
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 3. شاشة العد التنازلي */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center">
            <span className="text-8xl font-black text-white animate-ping">
              {countdown}
            </span>
            <p className="mt-4 text-xl font-bold text-[#C99444]">
              جاهز يا بطل؟
            </p>
          </div>
        </div>
      )}

      {/* 4. أثناء اللعب */}
      {gameStarted && !completed && currentQuestion && (
        <section className="relative z-10 mx-auto max-w-[850px] px-5 sm:px-8 py-6">
          {/* Top Bar: Progress & Timer */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8C6F53] dark:text-[#D6C6B1]">
              <Target className="w-4 h-4 text-[#E66A2E]" />
              <span>السؤال {currentIndex + 1} من 10</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-xs font-mono font-bold">
              <Clock className="w-4 h-4 text-[#E66A2E]" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden mb-6">
            <div
              className="h-full bg-[#E66A2E] transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / 10) * 100}%` }}
            />
          </div>

          {/* Question Box */}
          <div className="rounded-3xl border border-[#6B3A1F]/15 dark:border-white/10 bg-white dark:bg-[#24150C] p-6 sm:p-10 shadow-lg mb-6">
            <h3 className="text-xl sm:text-2xl font-black text-[#3B1E0E] dark:text-[#FFF9EE] leading-snug">
              {currentQuestion.question}
            </h3>

            {/* Options */}
            <div className="mt-8 space-y-3">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedAnswer === opt;
                const isCorrect = opt === currentQuestion.correctAnswer;
                const showFeedback = selectedAnswer !== null;

                let optStyle = 'border-[#6B3A1F]/15 dark:border-white/10 hover:border-[#6B3A1F]/40 bg-[#FAF5EB]/60 dark:bg-[#1B0E07]/60';
                if (showFeedback) {
                  if (isCorrect) {
                    optStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold';
                  } else if (isSelected) {
                    optStyle = 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={selectedAnswer !== null}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-right transition-all cursor-pointer flex items-center justify-between gap-3 ${optStyle}`}
                  >
                    <span className="text-xs sm:text-sm font-bold">
                      {opt}
                    </span>
                    {showFeedback && isCorrect && (
                      <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {showFeedback && isSelected && !isCorrect && (
                      <X className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Note */}
            {selectedAnswer !== null && (
              <div className="mt-6 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs sm:text-sm text-[#8C6F53] dark:text-[#D6C6B1] leading-relaxed">
                <strong>حكاية وسر الإجابة: </strong>
                {currentQuestion.explanation}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. شاشة النتائج */}
      {completed && (
        <section className="relative z-20 mx-auto max-w-[700px] px-5 sm:px-8 py-8 sm:py-12">
          <div className="rounded-3xl border border-[#6B3A1F]/15 dark:border-white/10 bg-[#FAF5EB] dark:bg-[#24150C] p-6 sm:p-10 text-center shadow-2xl">
            <img
              src={score >= 7 ? '/mascot/quiz.png' : '/mascot/empty-search.png'}
              alt="النتيجة"
              className="w-28 sm:w-36 h-auto mx-auto object-contain drop-shadow-xl mb-4"
            />

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1B0E07] border border-[#6B3A1F]/20 text-xs font-black text-[#E66A2E] mb-3">
              <Trophy className="w-4 h-4" />
              <span>{result.badge}</span>
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-[#3B1E0E] dark:text-[#FFF9EE] mb-2">
              {result.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#8C6F53] dark:text-[#D6C6B1] max-w-lg mx-auto mb-6">
              {result.description}
            </p>

            {/* Score Number */}
            <div className="text-5xl sm:text-7xl font-black font-main text-[#6B3A1F] dark:text-[#C99444] mb-8">
              {score} <span className="text-2xl sm:text-3xl text-black/30 dark:text-white/30">/ 10</span>
            </div>

            {/* Social Share & Replay Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={shareWhatsAppMessage}
                className="px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#1eb956] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>شارك نتيجتك على واتساب</span>
              </button>

              <button
                type="button"
                onClick={copyResult}
                className="px-5 py-3 rounded-xl border border-[#6B3A1F]/20 dark:border-white/20 bg-white dark:bg-[#1B0E07] text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم النسخ' : 'نسخ النتيجة'}</span>
              </button>

              <button
                type="button"
                onClick={startQuiz}
                className="px-6 py-3 rounded-xl bg-[#6B3A1F] dark:bg-[#C99444] text-white dark:text-[#24150C] text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>جولة جديدة</span>
              </button>
            </div>
          </div>
        </section>
      )}
    </WrapperTag>
  );
};

export default DialectDictionaryPage;