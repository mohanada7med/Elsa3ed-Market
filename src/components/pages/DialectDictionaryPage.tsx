import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Search,
  Volume2,
  Share2,
  Check,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Award,
  ChevronRight,
  MapPin,
  Flame,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { NubianGeometricPattern } from '../common/NubianGeometricPattern';

export interface DialectEntry {
  id: string;
  term: string;
  pronunciation?: string;
  meaning: string;
  origin: string; // فرعوني / قبطي / عربي فصيح قديم
  originDetails: string;
  category: 'proverb' | 'daily' | 'hospitality' | 'crafts_land' | 'coptic_pharaonic';
  categoryLabel: string;
  governorates: string[];
  example: string;
  tags: string[];
}

export const DIALECT_ENTRIES: DialectEntry[] = [
  {
    id: '1',
    term: 'دِلْعَادِي',
    pronunciation: 'Dil-aadi',
    meaning: 'الآن / في هذا الوقت الحالي فوراً',
    origin: 'عربي فصيح منحوت',
    originDetails: 'منحوتة من جملة (في هذا الوقت العادي أو هذا الأوان)، وتستخدم بكثرة في قنا والأقصر بمعنى "دلوقتي".',
    category: 'daily',
    categoryLabel: 'كلمات يومية',
    governorates: ['قنا', 'الأقصر', 'سوهاج'],
    example: '«تعال دِلْعَادي نشرب الشاي مع الأسطى محمود»',
    tags: ['يومي', 'وقت', 'قنا']
  },
  {
    id: '2',
    term: 'الباب اللي يجيك منه الريح سِده واستريح',
    meaning: 'الأمر أو الشخص الذي يأتيك منه وجع الرأس والقلق اقطع صلتك به لتعيش في طمأنينة وسلام.',
    origin: 'مثل صعيدي ضارب في القدم',
    originDetails: 'مثل مصري صعيدي فصيح يضرب في الحكمة وتجنب الفتن وبدايات المشكلات قبل تفاقمها.',
    category: 'proverb',
    categoryLabel: 'أمثال شعبية',
    governorates: ['أسوان', 'قنا', 'الأقصر', 'سوهاج', 'أسيوط', 'المنيا'],
    example: '«يا ولدي ما تخليش حد يشتتك، الباب اللي يجيك منه الريح سده واستريح»',
    tags: ['حكمة', 'أمثال', 'راحة بال']
  },
  {
    id: '3',
    term: 'البُرْشْ (أو البَرش)',
    pronunciation: 'El-Borsh',
    meaning: 'الحصيرة المصنوعة من خوص النخيل أو الحلفاء للجلوس عليها في المندرة أو الغيط.',
    origin: 'أصل مصري قديم / قبطي (Bars)',
    originDetails: 'مشتقة من الكلمة القبطية المصرية القديمة "بارس" (Bars) وتعني الحصير المصنوع من الحلفاء والسمار النيلي.',
    category: 'coptic_pharaonic',
    categoryLabel: 'أصول فرعونية وقبطية',
    governorates: ['قنا', 'أسوان', 'سوهاج', 'أسيوط'],
    example: '«افرد البرش تحت النخلة واستريح من شقا القايلة»',
    tags: ['حرف', 'نخيل', 'أصول قديمة']
  },
  {
    id: '4',
    term: 'يا بوي / يا مَراري',
    pronunciation: 'Ya Boy',
    meaning: 'صيحة تعجب ودهشة وفخر وانبهار صعيدي شهير يعبر عن عظم الأمر وجلاله.',
    origin: 'عربي فصيح من النداء',
    originDetails: 'نداء تعجبي أصيل يتوارثه أهل الصعيد من أجيال للتعبير عن هيبة الشيء وشدة الإعجاب أو الصدمة.',
    category: 'hospitality',
    categoryLabel: 'تعابير أصيلة',
    governorates: ['قنا', 'الأقصر', 'سوهاج', 'أسوان'],
    example: '«يا بوي على الكرم الصعيدي ونخوة الرجالة!»',
    tags: ['تعجب', 'فخر', 'هوية']
  },
  {
    id: '5',
    term: 'اطْبُخِي يا جارية.. كَلّف يا سيدي',
    meaning: 'الجودة والنتائج الطيبة تحتاج إلى توفير الموارد والإمكانات والإنفاق الصادق أولاً.',
    origin: 'مثل صعيدي في إدارة البيوت والعمل',
    originDetails: 'يضرب للمطالبين بالإتقان والنجاح دون تقديم مؤن أو مصاريف تلائم المطلوب.',
    category: 'proverb',
    categoryLabel: 'أمثال شعبية',
    governorates: ['الأقصر', 'قنا', 'سوهاج', 'أسيوط', 'المنيا'],
    example: '«عايز نطلع أحسن فخار في المعرض؟ اطبخي يا جارية كلف يا سيدي!»',
    tags: ['أمثال', 'عمل', 'حكمة']
  },
  {
    id: '6',
    term: 'عَفَارِمْ عليك',
    pronunciation: 'Afarem Alayk',
    meaning: 'أحسنت صنعاً / برافو عليك / أجدت وكفيت.',
    origin: 'تعبير تقدير تراثي',
    originDetails: 'يستخدمه كبار السن وشيوخ الصنائع في ورش الفخار والنسيج لتشجيع الصبي الحاذق الذي يتقن فنه.',
    category: 'hospitality',
    categoryLabel: 'تعابير التقدير',
    governorates: ['قنا', 'الأقصر', 'أسيوط', 'سوهاج'],
    example: '«عفارم عليك يا واد النقشة طالعة مسطرة!»',
    tags: ['تشجيع', 'صنعة', 'ورش']
  },
  {
    id: '7',
    term: 'المِشَنّة',
    pronunciation: 'El-Meshenna',
    meaning: 'طبق دائري مقعر من خوص النخيل المضفور يُحفظ فيه العيش الشمسي أو البلح.',
    origin: 'أصل مصري قديم (Shenou)',
    originDetails: 'تعود إلى الكلمة المصرية القديمة "شن" بمعنى الدائرة أو الإحاطة، وما زالت تصنع في قرى الصعيد بنفس الطريقة الفرعونية.',
    category: 'coptic_pharaonic',
    categoryLabel: 'أصول فرعونية وقبطية',
    governorates: ['قنا', 'الأقصر', 'أسوان', 'سوهاج'],
    example: '«هاتي المشنة ورصي فيها العيش الشمسي الطالع من الفرن البلدي»',
    tags: ['أدوات', 'خوص', 'تراث']
  },
  {
    id: '8',
    term: 'اللي يشرب من مية النيل يرجع له تاني',
    meaning: 'سحر الصعيد والنيل وبركته تلازم كل من ذاق كرمه وعاش بين أهله فيحن إليه دوماً.',
    origin: 'مقولة ومثل نيلية خالدة',
    originDetails: 'رمزية نيلية توارثها الصعايدة ترحيباً بالضيوف والرحالة منذ آلاف السنين.',
    category: 'hospitality',
    categoryLabel: 'تعابير الترحيب والكرم',
    governorates: ['أسوان', 'الأقصر', 'قنا', 'سوهاج', 'أسيوط', 'المنيا', 'بني سويف'],
    example: '«نورت بلادنا يا غالي، واللي يشرب من مية النيل يرجع له تاني»',
    tags: ['النيل', 'كرم', 'سياحة']
  },
  {
    id: '9',
    term: 'هَبّاشْ',
    pronunciation: 'Habbash',
    meaning: 'الشخص النشيط الكادح الذي يسعى في الصباح الباكر في الغيط والعمل ولا يهدأ.',
    origin: 'عربي فصيح (هَبَشَ: كَسَبَ وجَمَعَ)',
    originDetails: 'من جذر فصيح قديم يدل على السعي والرزق الحلال، يطلق مديحاً على المزارع والحرفي المجتهد.',
    category: 'crafts_land',
    categoryLabel: 'أدوات وحرف ومفردات الأرض',
    governorates: ['قنا', 'سوهاج', 'أسيوط'],
    example: '«الحاج إسماعيل راجل هباش من الفجرية في غيط القصب»',
    tags: ['أرض', 'زراعة', 'اجتهاد']
  },
  {
    id: '10',
    term: 'الزير ما يرويش غير العطشان الصادق',
    meaning: 'الخير الحقيقي لا يقدّره إلا من عرف قيمته واحتاجه بصدق.',
    origin: 'مثل تراثي فخاري',
    originDetails: 'مستوحى من عادة وضع "أزيار القلل وقناصيص الماء" الباردة عند مداخل البيوت والمزارع لعابري السبيل.',
    category: 'proverb',
    categoryLabel: 'أمثال شعبية',
    governorates: ['قنا', 'سوهاج', 'الأقصر'],
    example: '«قدّم معروفك لوجه الله، الزير ما يرويش غير العطشان»',
    tags: ['أمثال', 'فخار', 'كرم']
  },
  {
    id: '11',
    term: 'طَوْبة تخلي الصبية كَركوبة',
    meaning: 'شهر طوبة القبطي شديد البرودة لدرجة أنه يجعل الشابة القوية ترتجف وتنحني كالعجوز.',
    origin: 'تقويم مصري قديم وقبطي',
    originDetails: 'ينسب إلى الإله "توبي" إله المطر والخصب في مصر القديمة، ويعكس دقة الفلاح الصعيدي في مراقبة فصول المناخ.',
    category: 'coptic_pharaonic',
    categoryLabel: 'أصول فرعونية وقبطية',
    governorates: ['أسيوط', 'المنيا', 'سوهاج', 'قنا', 'بني سويف'],
    example: '«دفوا عيالكم وعمروا الكانون، طوبة تخلي الصبية كركوبة!»',
    tags: ['طقس', 'مواسم', 'زراعة']
  },
  {
    id: '12',
    term: 'الرَّاحَة في القَناعَة.. والغِنَى في النَّفْس',
    meaning: 'ثروة الصعيدي وعزته تكمن في شرف نفسه وعزة كرامته وقناعته بما قسم الله له.',
    origin: 'حكمة متداولة في مجالس الرجال والمندرة',
    originDetails: 'تشكل العمود الفقري للقيم الأخلاقية في البيوت الصعيدية الأصيلة.',
    category: 'proverb',
    categoryLabel: 'أمثال شعبية',
    governorates: ['الأقصر', 'أسوان', 'قنا', 'سوهاج', 'المنيا'],
    example: '«عشنا وشوفنا، الراحة في القناعة والغنى في النفس يا ولدي»',
    tags: ['شرف', 'كرامة', 'أخلاق']
  },
  {
    id: '13',
    term: 'الطّابونة / الكانون',
    pronunciation: 'El-Kanoon',
    meaning: 'موقد الطين والفرن الطيني القديم الذي تشعل فيه الحطب وقوالب الفخار لتحمير الخبز وصنع الشاي.',
    origin: 'تراث ريفي نيلي أصيل',
    originDetails: 'عنصر أساسي في بيت الصعيد، حوله تجتمع العائلة مساءً لسماع السيرة الهلالية والحكايات.',
    category: 'crafts_land',
    categoryLabel: 'أدوات وحرف ومفردات الأرض',
    governorates: ['قنا', 'الأقصر', 'أسوان', 'سوهاج', 'أسيوط', 'المنيا'],
    example: '«الشاي المعمول على الكانون طعمه يرد الروح»',
    tags: ['بيت', 'شاي', 'دفء']
  },
  {
    id: '14',
    term: 'مْرَوَّقْ وزَيّ الفُلْ',
    meaning: 'في أتم الصحة وراحة البال والصفاء، كصفاء مياه النيل في الصباح الباكر.',
    origin: 'تعبير يومي للمودة',
    originDetails: 'يستخدم رداً على تحية "كيف حالك وكيف صحتك؟" بالصعيد.',
    category: 'daily',
    categoryLabel: 'كلمات يومية',
    governorates: ['أسوان', 'الأقصر', 'قنا', 'سوهاج', 'المنيا'],
    example: '«الحمد لله مروق وزي الفل في خيركم ونعمتكم»',
    tags: ['تحية', 'محبة', 'راحة']
  },
  {
    id: '15',
    term: 'صاحب بالين كداب.. وصاحب تلاتة منافق',
    meaning: 'من يشتت جهده بين أمرين لن يتقن أحدهما، والتركيز والإخلاص في الصنعة أساس النجاح.',
    origin: 'مثل صعيدي في إتقان العمل',
    originDetails: 'يحث به شيوخ الصنعة المتدربين على التفاني في تعلم حرفة واحدة حتى يبلغوا مرتبة "المعلّم".',
    category: 'proverb',
    categoryLabel: 'أمثال شعبية',
    governorates: ['قنا', 'الأقصر', 'أسيوط', 'سوهاج'],
    example: '«ركز في نولك ونسيجك، صاحب بالين كداب!»',
    tags: ['إتقان', 'حرفة', 'حكمة']
  }
];

export const QUIZ_QUESTIONS = [
  {
    question: 'ما معنى كلمة «دِلْعَادِي» الشهيرة في قنا والأقصر؟',
    options: ['الآن / فوراً', 'في الصباح الباكر', 'ببطء شديد', 'في الماضي البعيد'],
    correctIndex: 0,
    explanation: '«دلعادي» تعني في هذا الوقت الحالي فوراً، وهي منحوتة من (في هذا الوقت العادي).'
  },
  {
    question: 'إلى أي لغة يرجع أصل كلمة «البُرْشْ» (حصير خوص النخيل)؟',
    options: ['الفارسية', 'المصرية القديمة / القبطية (Bars)', 'اليونانية', 'التركية'],
    correctIndex: 1,
    explanation: 'تعود إلى الكلمة المصرية القديمة والقبطية "بارس" وتعني الحصير المجدول من الحلفاء والسمار.'
  },
  {
    question: 'يضرب مثل «اطْبُخِي يا جارية كَلّف يا سيدي» للتعبير عن:',
    options: ['الكسل والإهمال', 'أن إتقان أي عمل يحتاج توفير موارده ومصاريفه أولاً', 'حب الطبخ فقط', 'إضاعة الوقت'],
    correctIndex: 1,
    explanation: 'يضرب لمن يطلب نتائج ممتازة دون أن يقدم المؤن والميزانية الكافية لإتمامها.'
  },
  {
    question: 'ما هي «المِشَنّة» في بيوت وقرى صعيد مصر؟',
    options: ['إناء نحاسي للطهي', 'طبق مقعر من خوص النخيل المضفور لحفظ العيش الشمسي', 'مروحة يدوية', 'سجادة صوفية'],
    correctIndex: 1,
    explanation: 'المشنة طبق واسع مجدول من خوص النخيل، مستمد من الكلمة المصرية القديمة "شن" بمعنى الدائرة.'
  },
  {
    question: 'ما المقصود بوصف شخص بأنه «هَبّاشْ» في لغة الأرض والزراعة بالصعيد؟',
    options: ['شخص غضوب', 'شخص كادح يسعى بنشاط في الفجر لطلب الرزق الحلال', 'كثير الكلام', 'يحب النوم طويلاً'],
    correctIndex: 1,
    explanation: '«الهباش» مأخوذة من هبش في العربية الفصيحة أي كسب وسعى بجد في عمله وأرضه.'
  }
];

export const DialectDictionaryPage: React.FC = () => {
  const { setActivePage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGov, setSelectedGov] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dictionary' | 'quiz'>('dictionary');

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Proverb / Word of the Day (seeded by date)
  const wordOfTheDay = useMemo(() => {
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % DIALECT_ENTRIES.length;
    return DIALECT_ENTRIES[dayIndex] || DIALECT_ENTRIES[0];
  }, []);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return DIALECT_ENTRIES.filter((entry) => {
      const matchesSearch =
        entry.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.originDetails.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.example.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'all' || entry.category === selectedCategory;

      const matchesGov =
        selectedGov === 'all' || entry.governorates.includes(selectedGov);

      return matchesSearch && matchesCategory && matchesGov;
    });
  }, [searchQuery, selectedCategory, selectedGov]);

  // Pronounce word using browser speech synthesis
  const speakTerm = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/«|»|\/|\(|\)/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ar-EG';
      utterance.rate = 0.85; // deliberate, authentic cadence
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Copy shareable card
  const handleCopyCard = (entry: DialectEntry) => {
    const textToCopy = `«${entry.term}»\nالمعنى: ${entry.meaning}\nالأصل: ${entry.originDetails}\nالمحافظات: ${entry.governorates.join('، ')}\n\nمن معجم الصعيدي الفصيح — منصة وه | WAH`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Quiz submission
  const handleSelectAnswer = (index: number) => {
    if (selectedOptionIndex !== null) return;
    setSelectedOptionIndex(index);
    setShowExplanation(true);
    if (index === QUIZ_QUESTIONS[currentQuestionIndex].correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setShowExplanation(false);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setScore(0);
    setIsQuizCompleted(false);
    setShowExplanation(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#12100E] text-[#2C241D] dark:text-[#EDE6DF] transition-colors pb-24">
      {/* =========================================================
          HERO BANNER
          ========================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#FAF4EB] via-[#F4ECE0] to-[#FDFBF7] dark:from-[#1E1915] dark:via-[#171310] dark:to-[#12100E] border-b border-[#E7DDCF] dark:border-[#2C251F] pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 sm:px-6">
        <NubianGeometricPattern opacity={0.06} />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <button
              type="button"
              onClick={() => setActivePage('home')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#8C5D30] hover:text-[#6D4420] dark:text-[#D1A877] dark:hover:text-[#E9CBA4] transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} className="rotate-180" />
              العودة للرئيسية
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8C5D30]/10 dark:bg-[#8C5D30]/20 text-[#8C5D30] dark:text-[#E2B98A] text-xs font-black">
              <Sparkles size={14} />
              موسوعة التراث اللغوي والشفاهي
            </div>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#221B14] dark:text-[#F8F4EE] leading-tight tracking-tight mb-4">
              معجم اللهجة والأمثال الصعيدية
              <span className="block mt-1 text-[#8C5D30] dark:text-[#DDAF7C] font-serif text-2xl sm:text-3xl lg:text-4xl">
                «الصعيدي الفصيح»
              </span>
            </h1>
            <p className="text-base sm:text-lg text-[#6E5B4B] dark:text-[#BDB0A3] leading-relaxed">
              توثيق تفاعلي حي لمفردات وحِكَم وأمثال صعيد مصر، وجذورها الممتدة في اللغة المصرية القديمة والقبطية والفصحى، مع النطق الصوتي وقصص نشأتها عبر مدن وقرى النيل الخالد.
            </p>
          </div>

          {/* Mode Tabs (Dictionary vs Quiz) */}
          <div className="flex items-center gap-3 mt-8">
            <button
              type="button"
              onClick={() => setActiveTab('dictionary')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all cursor-pointer shadow-sm ${
                activeTab === 'dictionary'
                  ? 'bg-[#8C5D30] text-white shadow-md'
                  : 'bg-white dark:bg-[#201A16] text-[#6E5B4B] dark:text-[#BDB0A3] hover:bg-[#EFE8DD] dark:hover:bg-[#2A231E]'
              }`}
            >
              <BookOpen size={17} />
              المعجم والمفردات ({DIALECT_ENTRIES.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all cursor-pointer shadow-sm ${
                activeTab === 'quiz'
                  ? 'bg-[#8C5D30] text-white shadow-md'
                  : 'bg-white dark:bg-[#201A16] text-[#6E5B4B] dark:text-[#BDB0A3] hover:bg-[#EFE8DD] dark:hover:bg-[#2A231E]'
              }`}
            >
              <HelpCircle size={17} />
              اختبر معلوماتك: لهجتك صعيدي فصيح؟
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500 text-white font-black">
                تحدي
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {activeTab === 'dictionary' ? (
          <>
            {/* =========================================================
                WORD OF THE DAY CARD
                ========================================================= */}
            <div className="mb-10 rounded-3xl border border-[#E2D4C3] dark:border-[#332A23] bg-gradient-to-br from-amber-50/70 via-white to-orange-50/50 dark:from-[#211A15] dark:via-[#1A1410] dark:to-[#17120E] p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#8C5D30]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#8C5D30] text-white">
                    <Flame size={16} />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-[#8C5D30] dark:text-[#DFA973]">
                    مفردة ومثل اليوم المختارة
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => speakTerm(wordOfTheDay.term)}
                    aria-label="سماع النطق"
                    title="سماع النطق باللهجة الصعيدية"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#2A211B] text-[#8C5D30] dark:text-[#DFB588] text-xs font-bold border border-[#E7DECة] dark:border-[#382D25] hover:bg-[#F8F2E8] dark:hover:bg-[#322720] transition-colors cursor-pointer"
                  >
                    <Volume2 size={15} />
                    استمع للنطق
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyCard(wordOfTheDay)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#2A211B] text-[#635345] dark:text-[#D1C3B6] text-xs font-bold border border-[#E7DECE] dark:border-[#382D25] hover:bg-[#F8F2E8] dark:hover:bg-[#322720] transition-colors cursor-pointer"
                  >
                    {copiedId === wordOfTheDay.id ? <Check size={15} className="text-emerald-600" /> : <Share2 size={15} />}
                    {copiedId === wordOfTheDay.id ? 'تم النسخ' : 'مشاركة'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-[#261E17] dark:text-[#FAF5EE] mb-2 font-serif">
                    «{wordOfTheDay.term}»
                  </h2>
                  <p className="text-base sm:text-lg font-bold text-[#8C5D30] dark:text-[#E0AD76] mb-3">
                    {wordOfTheDay.meaning}
                  </p>
                  <p className="text-sm text-[#5B493B] dark:text-[#B5A799] leading-relaxed mb-4">
                    <strong className="text-[#261E17] dark:text-[#FAF5EE]">أصلها وسرّها: </strong>
                    {wordOfTheDay.originDetails}
                  </p>

                  <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#15100D]/80 border border-[#E6DDCE] dark:border-[#2E241E] text-xs sm:text-sm text-[#46382D] dark:text-[#CBBDB0] italic">
                    {wordOfTheDay.example}
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-[#1A1410]/80 p-5 rounded-2xl border border-[#E4DACB] dark:border-[#2D231D] space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#8C7662] dark:text-[#9A8A7A] block">
                      التصنيف:
                    </span>
                    <span className="text-xs font-black text-[#261E17] dark:text-[#FAF5EE]">
                      {wordOfTheDay.categoryLabel}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-[#8C7662] dark:text-[#9A8A7A] block">
                      أكثر المحافظات استخداماً:
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {wordOfTheDay.governorates.map((gov) => (
                        <span
                          key={gov}
                          className="px-2 py-0.5 rounded-lg bg-[#8C5D30]/10 dark:bg-[#8C5D30]/25 text-[#8C5D30] dark:text-[#DFB588] text-[11px] font-bold"
                        >
                          {gov}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-[#8C7662] dark:text-[#9A8A7A] block">
                      الجذر اللغوي:
                    </span>
                    <span className="text-xs font-semibold text-[#5B493B] dark:text-[#B5A799]">
                      {wordOfTheDay.origin}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================================
                SEARCH & FILTERS
                ========================================================= */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C7662] dark:text-[#9A8A7A]"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن مثل أو كلمة أو معنى صعيدي (مثل: دلعادي، البرش، كانون...)"
                    className="w-full pr-11 pl-4 py-3 rounded-2xl bg-white dark:bg-[#1A1410] border border-[#E5DACB] dark:border-[#30261F] text-sm text-[#261E17] dark:text-[#FAF5EE] placeholder:text-[#9F8F7F] focus:outline-none focus:ring-2 focus:ring-[#8C5D30]/30"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C5D30] px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-stone-800"
                    >
                      مسح
                    </button>
                  )}
                </div>

                {/* Governorates dropdown */}
                <div className="relative shrink-0 sm:w-56">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white dark:bg-[#1A1410] border border-[#E5DACB] dark:border-[#30261F]">
                    <MapPin size={16} className="text-[#8C5D30] shrink-0" />
                    <select
                      value={selectedGov}
                      onChange={(e) => setSelectedGov(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-[#261E17] dark:text-[#FAF5EE] focus:outline-none cursor-pointer"
                    >
                      <option value="all">كل محافظات الصعيد</option>
                      <option value="الأقصر">الأقصر</option>
                      <option value="أسوان">أسوان</option>
                      <option value="قنا">قنا</option>
                      <option value="سوهاج">سوهاج</option>
                      <option value="أسيوط">أسيوط</option>
                      <option value="المنيا">المنيا</option>
                      <option value="بني سويف">بني سويف</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'proverb', label: 'أمثال شعبية وحِكَم' },
                  { id: 'hospitality', label: 'تعابير الكرم والأصالة' },
                  { id: 'coptic_pharaonic', label: 'أصول فرعونية وقبطية' },
                  { id: 'crafts_land', label: 'مفردات الأرض والحرف' },
                  { id: 'daily', label: 'كلمات يومية' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#8C5D30] text-white shadow-sm'
                        : 'bg-white dark:bg-[#1E1814] text-[#6B5A4B] dark:text-[#BDB0A3] border border-[#E5DACB] dark:border-[#2D231D] hover:bg-[#F5EDE1] dark:hover:bg-[#271F19]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* =========================================================
                ENTRIES GRID
                ========================================================= */}
            {filteredEntries.length === 0 ? (
              <div className="py-16 text-center bg-white dark:bg-[#181310] rounded-3xl border border-[#E5DACB] dark:border-[#2E241E] p-8">
                <Layers size={40} className="mx-auto text-[#A89888] mb-3 opacity-60" />
                <h3 className="text-lg font-bold text-[#261E17] dark:text-[#FAF5EE] mb-1">
                  لم نجد مفردات تطابق بحثك
                </h3>
                <p className="text-sm text-[#7D6D5E] dark:text-[#A7998B] mb-4">
                  جرب البحث بكلمة أخرى أو قم بإلغاء التصفية لاستعراض كافة مفردات المعجم.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedGov('all');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#8C5D30] text-white text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  إعادة ضبط البحث
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col justify-between rounded-3xl border border-[#E6DCCE] dark:border-[#2F251E] bg-white dark:bg-[#1A1410] p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-[#8C5D30]/10 dark:bg-[#8C5D30]/20 text-[#8C5D30] dark:text-[#DFB588] text-[11px] font-black">
                            {entry.categoryLabel}
                          </span>
                          <span className="text-[11px] font-semibold text-[#8C7969] dark:text-[#9A8A7A]">
                            {entry.origin}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => speakTerm(entry.term)}
                            title="استمع للنطق"
                            aria-label={`استمع لنطق ${entry.term}`}
                            className="p-2 rounded-xl text-[#8C5D30] dark:text-[#DFA973] hover:bg-amber-50 dark:hover:bg-[#2B211A] transition-colors cursor-pointer"
                          >
                            <Volume2 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyCard(entry)}
                            title="نسخ ومشاركة"
                            aria-label="نسخ"
                            className="p-2 rounded-xl text-[#7E6C5C] dark:text-[#A7998B] hover:bg-stone-100 dark:hover:bg-[#2B211A] transition-colors cursor-pointer"
                          >
                            {copiedId === entry.id ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Term & Meaning */}
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-[#261E17] dark:text-[#FAF5EE] font-serif group-hover:text-[#8C5D30] dark:group-hover:text-[#DFB588] transition-colors">
                          «{entry.term}»
                        </h3>
                        {entry.pronunciation && (
                          <span className="text-xs font-mono text-[#8C7969] dark:text-[#9A8A7A] block mt-0.5">
                            [{entry.pronunciation}]
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-bold text-[#8C5D30] dark:text-[#DFA973]">
                        {entry.meaning}
                      </p>

                      <p className="text-xs sm:text-sm text-[#5B493B] dark:text-[#B5A799] leading-relaxed">
                        {entry.originDetails}
                      </p>

                      {/* Authentic Example */}
                      <div className="p-3 rounded-2xl bg-[#FAF6F0] dark:bg-[#140F0C] border border-[#E9E0D2] dark:border-[#271E18] text-xs text-[#4E3F33] dark:text-[#C7B9AC] italic">
                        {entry.example}
                      </div>
                    </div>

                    {/* Footer Governorates */}
                    <div className="mt-4 pt-3 border-t border-[#EFE8DC] dark:border-[#261E18] flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-[#8C7662] dark:text-[#9A8A7A]">
                        <MapPin size={13} className="text-[#8C5D30]" />
                        <span>شائع في:</span>
                        <span className="font-bold text-[#261E17] dark:text-[#FAF5EE]">
                          {entry.governorates.slice(0, 3).join('، ')}
                          {entry.governorates.length > 3 && ` +${entry.governorates.length - 3}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* =========================================================
             INTERACTIVE QUIZ EXPERIENCE
             ========================================================= */
          <div className="max-w-2xl mx-auto py-6">
            {!isQuizCompleted ? (
              <div className="rounded-3xl border border-[#E4DACB] dark:border-[#30261F] bg-white dark:bg-[#1A1410] p-6 sm:p-10 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <HelpCircle size={18} />
                    </span>
                    <span className="text-xs font-black text-[#8C7662] dark:text-[#9A8A7A]">
                      سؤال {currentQuestionIndex + 1} من {QUIZ_QUESTIONS.length}
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#8C5D30]/10 text-[#8C5D30] dark:text-[#DFB588] text-xs font-black">
                    النقاط: {score}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-[#EFE8DD] dark:bg-[#28201A] overflow-hidden mb-6">
                  <div
                    className="h-full bg-[#8C5D30] transition-all duration-300 rounded-full"
                    style={{
                      width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`
                    }}
                  />
                </div>

                {/* Question */}
                <h3 className="text-xl sm:text-2xl font-black text-[#261E17] dark:text-[#FAF5EE] mb-6 leading-relaxed font-serif">
                  {QUIZ_QUESTIONS[currentQuestionIndex].question}
                </h3>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {QUIZ_QUESTIONS[currentQuestionIndex].options.map((opt, idx) => {
                    const isSelected = selectedOptionIndex === idx;
                    const isCorrect = idx === QUIZ_QUESTIONS[currentQuestionIndex].correctIndex;
                    let btnStyle = 'border-[#E6DCCE] dark:border-[#2F251E] bg-[#FDFBF7] dark:bg-[#140F0C] text-[#3A2F25] dark:text-[#DDD1C4] hover:bg-[#F7F1E7] dark:hover:bg-[#231A14]';

                    if (selectedOptionIndex !== null) {
                      if (isCorrect) {
                        btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold';
                      } else if (isSelected) {
                        btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-bold';
                      }
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={selectedOptionIndex !== null}
                        onClick={() => handleSelectAnswer(idx)}
                        className={`w-full text-right p-4 rounded-2xl border text-sm sm:text-base font-semibold transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {selectedOptionIndex !== null && isCorrect && (
                          <Check size={18} className="text-emerald-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showExplanation && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 mb-6 text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                    <strong>الإيضاح التراثي: </strong>
                    {QUIZ_QUESTIONS[currentQuestionIndex].explanation}
                  </div>
                )}

                {/* Next button */}
                {selectedOptionIndex !== null && (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="w-full py-3.5 rounded-2xl bg-[#8C5D30] hover:bg-[#724822] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>
                      {currentQuestionIndex + 1 === QUIZ_QUESTIONS.length ? 'مشاهدة النتيجة الختامية' : 'السؤال التالي'}
                    </span>
                    <ChevronRight size={18} className="rotate-180" />
                  </button>
                )}
              </div>
            ) : (
              /* Quiz Results */
              <div className="rounded-3xl border border-[#E4DACB] dark:border-[#30261F] bg-white dark:bg-[#1A1410] p-8 sm:p-12 text-center shadow-sm space-y-6">
                <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
                  <Award size={40} />
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#261E17] dark:text-[#FAF5EE] mb-2 font-serif">
                    {score === QUIZ_QUESTIONS.length
                      ? 'صعيدي أباً عن جد! 👑'
                      : score >= 3
                      ? 'عفارم عليك! ابن النيل الصادق 🌾'
                      : 'بداية جميلة لتعلم لغة الكرم والأصالة 🏺'}
                  </h3>
                  <p className="text-base text-[#6E5B4B] dark:text-[#BDB0A3]">
                    حصلت على <strong className="text-[#8C5D30] dark:text-[#DFB588] text-xl">{score}</strong> من إجمالي{' '}
                    <strong className="text-xl">{QUIZ_QUESTIONS.length}</strong> أسئلة
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF4EB] dark:bg-[#16110D] border border-[#E7DDCF] dark:border-[#2C231D] text-xs sm:text-sm text-[#5B493B] dark:text-[#B5A799] leading-relaxed">
                  اللهجة الصعيدية ليست مجرد كلمات متوارثة، بل هي وعاء لتاريخ عريق يمتد لآلاف السنين يجمع فصاحة العربية مع هيبة اللسان المصري القديم.
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRestartQuiz}
                    className="flex-1 py-3 rounded-2xl border border-[#8C5D30] text-[#8C5D30] dark:text-[#DFB588] font-black text-sm flex items-center justify-center gap-2 hover:bg-[#8C5D30]/5 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={16} />
                    إعادة الاختبار
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('dictionary')}
                    className="flex-1 py-3 rounded-2xl bg-[#8C5D30] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#724822] transition-colors cursor-pointer"
                  >
                    <BookOpen size={16} />
                    تصفح كافة مفردات المعجم
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
