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
  ArrowUpLeft,
  Check,
  CircleDot,
  Clock,
  Copy,
  Facebook,
  Flame,
  Gem,
  MessageCircle,
  RefreshCw,
  ScrollText,
  Share2,
  Sparkles,
  Trophy,
  X,
  Zap,
  Target,
} from 'lucide-react';

import { NubianGeometricPattern } from '../common/NubianGeometricPattern';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const WAH_INTRO_AUDIO_URL = '/audio/site-intro.mp3';
export const TOTAL_QUIZ_TIME = 50;

// Singleton AudioContext لمنع تسريب الذاكرة والتعليق
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
    // تجاهل أخطاء تشغيل الصوت في المتصفحات المقيدة
  }
};

const QUESTION_BANK: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'لما واحد صعيدي يقولك «دِلْوَقتي» أو «دِلْعَادي»، غالبًا قصده إيه؟',
    options: ['في الوقت الحالي', 'بكرة الصبح بدري', 'من كام سنة فاتوا', 'بعد شوية مش كتير'],
    correctAnswer: 'في الوقت الحالي',
    explanation: 'المقصود إن الحاجة بتحصل في الوقت الحالي.',
  },
  {
    id: 'q2',
    question: 'لو حد قال «الواد ده هَبّاش»، يقصد إيه؟',
    options: ['بيحب النوم والراحة', 'شغال وبيسعى على رزقه', 'كلامه كتير ومالوش لزمة', 'بيخاف ومابيحبش الناس'],
    correctAnswer: 'شغال وبيسعى على رزقه',
    explanation: 'هبّاش بتتقال على الشخص اللي بيسعى وبيشتغل ومش بيكسل.',
  },
  {
    id: 'q3',
    question: 'لما حد يقول «مْرَوَّق وزَيّ الفُل»، بيكون حاله عامل إزاي؟',
    options: ['متضايق وزعلان', 'تعبان ومرهق', 'رايق ومرتاح', 'مستعجل ومرتبك'],
    correctAnswer: 'رايق ومرتاح',
    explanation: 'يعني رايق، مرتاح، ومزاجه حلو.',
  },
  {
    id: 'q4',
    question: 'في المثل «طوبة تخلي الصبية كركوبة»... طوبة هنا إيه؟',
    options: ['طوبة بناء', 'شهر قبطي شتوي', 'قرية في الصعيد', 'أكلة شعبية قديمة'],
    correctAnswer: 'شهر قبطي شتوي',
    explanation: 'طوبة اسم شهر في التقويم القبطي، وبييجي في عز البرد.',
  },
  {
    id: 'q5',
    question: 'لما حد يقول «الباب اللي يجيك منه الريح سده واستريح»، يقصد إيه؟',
    options: ['اقفل الشبابيك وقت العاصفة', 'ابعد عن أي حاجة فيها وجع دماغ', 'نام بدري وماتشغلش بالك', 'سافر وسيب المكان اللي إنت فيه'],
    correctAnswer: 'ابعد عن أي حاجة فيها وجع دماغ',
    explanation: 'المعنى: لو حاجة بتجيبلك مشاكل، ابعد عنها من الأساس.',
  },
  {
    id: 'q6',
    question: 'لو واحد قال «الراجل ده ابن بلد»، غالبًا بيقصد إيه؟',
    options: ['غريب ومش معروف هنا', 'جدع وأصيل وواقف جنب الناس', 'مالوش في الاختلاط بالناس', 'مسافر ومش قاعد في بلده'],
    correctAnswer: 'جدع وأصيل وواقف جنب الناس',
    explanation: 'ابن البلد بتتقال على الشخص الشهم اللي يعتمد عليه.',
  },
  {
    id: 'q7',
    question: 'لو حد قال «سيبك منه ده بيهاتي»، يعني إيه؟',
    options: ['بيتكلم كلام من غير أي فايدة', 'بيشتغل شغل تقيل وصعب', 'بيهزر وبيضحك مع كل الناس', 'بيفكر كتير قبل ما يتكلم'],
    correctAnswer: 'بيتكلم كلام من غير أي فايدة',
    explanation: 'يعني كلام كتير ومكرر من غير نتيجة.',
  },
  {
    id: 'q8',
    question: 'لما حد يقول «على مهلك يا زين»، بيطلب منك إيه؟',
    options: ['تجري بسرعة', 'تسكت تماماً', 'تهدى وماتستعجلش', 'تمشي من هنا'],
    correctAnswer: 'تهدى وماتستعجلش',
    explanation: 'يعني خد وقتك ولا تتسرع.',
  },
  {
    id: 'q9',
    question: 'لو حد قال «ده كلام ما يطلعش من كبير»، قصده إيه؟',
    options: ['كلام مهم وموزون', 'كلام لا يليق بمقام شخص محترم', 'كلام قديم ومش مفهوم', 'كلام سر لازم تكتمه'],
    correctAnswer: 'كلام لا يليق بمقام شخص محترم',
    explanation: 'المقصود إن التصرف أو الكلام أقل من مكانة صاحبه.',
  },
  {
    id: 'q10',
    question: 'لو واحد قال «خليك راجل في كلمتك»، يعني إيه؟',
    options: ['اتكلم بصوت قوي وعالي', 'التزم بوعدك اللي قلته للناس', 'اتكلم دايماً في كل مجلس', 'ماتردش على أي حد يكلمك'],
    correctAnswer: 'التزم بوعدك اللي قلته للناس',
    explanation: 'يعني خليك وفيّ بعهدك وكلامك.',
  },
  {
    id: 'q11',
    question: 'لما حد يقول «يا ساتر يا رب»، غالبًا بيقولها إمتى؟',
    options: ['وقت الفرحة والاحتفال', 'وقت المفاجأة أو الخضة', 'وقت الجوع والتعب', 'وقت النوم والراحة'],
    correctAnswer: 'وقت المفاجأة أو الخضة',
    explanation: 'دعاء واستعاذة وقت المفاجأة أو الخوف.',
  },
  {
    id: 'q12',
    question: 'لو حد قال «الواد ده شقي»، المقصود غالبًا إيه؟',
    options: ['هادي ومش بيتكلم', 'حرك ومشاغب ونشيط', 'كسلان ومابيعملش حاجة', 'خواف وبيخاف من الضلمة'],
    correctAnswer: 'حرك ومشاغب ونشيط',
    explanation: 'شقي هنا تعني كثير الحركة والمشاغبة المحبوبة.',
  },
  {
    id: 'q13',
    question: 'لو حد قال «مالك ساكت ليه؟ إنت متكدر؟»، كلمة «متكدر» معناها إيه؟',
    options: ['فرحان ومبسوط جداً', 'زعلان ومتضايق ومش رايق', 'جعان وعايز تاكل حاجة', 'مستعجل ووراك ميعاد مهم'],
    correctAnswer: 'زعلان ومتضايق ومش رايق',
    explanation: 'متكدر يعني مزاجه مش رايق ومهموم.',
  },
  {
    id: 'q14',
    question: 'لما حد يقول «ده راجل له كلمة»، المقصود إيه؟',
    options: ['بيتكلم كتير من غير فايدة', 'صاحب موقف والناس بتثق فيه', 'صوته عالي ومسموع في كل حتة', 'بيحب يحكي حكايات قديمة'],
    correctAnswer: 'صاحب موقف والناس بتثق فيه',
    explanation: 'يعني شخص مسموع الكلمة وموثوق في كلامه.',
  },
  {
    id: 'q15',
    question: 'لو حد قال «متشيلش هم»، يعني إيه؟',
    options: ['ماتقلقش وسيبها تمشي', 'اتحرك بسرعة وماتتأخرش', 'اتكلم وقول اللي في بالك', 'نام وارتاح وماتقومش'],
    correctAnswer: 'ماتقلقش وسيبها تمشي',
    explanation: 'المعنى: اطمئن ولا تقلق.',
  },
  {
    id: 'q16',
    question: 'لو واحد قال «ده بيزوّغ من الشغل»، يعني إيه؟',
    options: ['بيشتغل بتركيز وإتقان عالي', 'بيهرب ومابيأديش اللي عليه', 'بيبدأ شغله بدري كل يوم', 'بيحب يساعد كل زمايله'],
    correctAnswer: 'بيهرب ومابيأديش اللي عليه',
    explanation: 'بيزوغ يعني بيتفادى الشغل أو الحضور.',
  },
  {
    id: 'q17',
    question: 'لما حد يقول «كلامك موزون»، بيقصد إيه؟',
    options: ['صوتك كان عالي وواضح', 'كلامك محسوب ومبني على عقل', 'كلامك سريع ومختصر جداً', 'كلامك مضحك ولطيف في القعدة'],
    correctAnswer: 'كلامك محسوب ومبني على عقل',
    explanation: 'يعني كلامك حكيم وفيه رزانة.',
  },
  {
    id: 'q18',
    question: 'لو حد قال «ما تعوجهاش»، المقصود إيه؟',
    options: ['ماتعقدش الأمور وخليها سالكة', 'امشي بسرعة عشان ماتتأخرش', 'اتكلم بوضوح وماتخافش من حد', 'اقفل الباب وماتسيبوش مفتوح'],
    correctAnswer: 'ماتعقدش الأمور وخليها سالكة',
    explanation: 'يعني لا تصعب الأمر وتجعله معقداً.',
  },
  {
    id: 'q19',
    question: 'لما واحد في الصعيد يقولك «حِبِلّي» أو «حِبْل»، يقصد مين؟',
    options: ['أخويا الصغير', 'صاحبي القريب مني', 'ابني أو ذريتي', 'جاري اللي في وشي'],
    correctAnswer: 'ابني أو ذريتي',
    explanation: 'الحِبْل في لهجة بعض قرى الصعيد يقصد به الابن أو الذرية والنسل.',
  },
  {
    id: 'q20',
    question: 'لو قالك «قرّب اقعد على الدِّكّة»، الدكة دي عبارة عن إيه؟',
    options: ['فرشة معمولة من الصوف', 'مقعد خشب عريض للقعدة', 'سجادة مفروشة على الأرض', 'ترابيزة واطية للأكل'],
    correctAnswer: 'مقعد خشب عريض للقعدة',
    explanation: 'الدكة هي كنبة خشبية عريضة تقليدية بتكون موجودة قدام البيوت وفي المندرة.',
  },
  {
    id: 'q21',
    question: 'كلمة «المندرة» في البيت الصعيدي معناها إيه؟',
    options: ['مكان خبيز العيش الشمسي', 'أوضة الضيوف واستقبال الرجال', 'حوش البهايم والمواشي', 'مخزن الغلال والقمح'],
    correctAnswer: 'أوضة الضيوف واستقبال الرجال',
    explanation: 'المندرة هي غرفة الضيافة الكبيرة المخصصة لاستقبال الضيوف والرجال.',
  },
  {
    id: 'q22',
    question: 'لو واحد صعيدي قال «عَوِّقْتْ ليه في المشوار؟»، قصده إيه؟',
    options: ['ليه غيرت طريقك؟', 'ليه مشيت في الشمس؟', 'ليه اتأخرت وأخدت وقت؟', 'ليه ماروحتش مشوارك؟'],
    correctAnswer: 'ليه اتأخرت وأخدت وقت؟',
    explanation: 'عوّق تعني تأخر وأبطأ في العودة أو إنهاء المشوار.',
  },
  {
    id: 'q23',
    question: 'لما حد يقول «الراجل ده دِماغُه ناشفة»، يقصد إيه؟',
    options: ['مابيفهمش حاجة خالص', 'عنيد ومتمسك برأيه جداً', 'ذكي وسريع البديهة', 'هادي ومابيتكلمش كتير'],
    correctAnswer: 'عنيد ومتمسك برأيه جداً',
    explanation: 'دماغه ناشفة تعني شخص عنيد يصعب إقناعه بالتراجع عن موقفه.',
  },
  {
    id: 'q24',
    question: 'لو حد قالك «ادّيني هَبّابة»، يقصد بيها إيه؟',
    options: ['شوية وقت قليلين خالص', 'كوباية مية ساقعة', 'عصاية طويلة للغيط', 'حاجة مروحة للتهوية'],
    correctAnswer: 'شوية وقت قليلين خالص',
    explanation: 'الهبّابة أو الهبّة تعني لحظة زمنية قصيرة أو هنيهة.',
  },
  {
    id: 'q25',
    question: 'كلمة «البَلاص» المشهورة في ريف وصعيد مصر تُستخدم في إيه؟',
    options: ['حفظ العسل والجبنة القديمة', 'غسيل الهدوم اليدوي', 'شيل حبوب القمح والشعير', 'تسوية العيش البلدي'],
    correctAnswer: 'حفظ العسل والجبنة القديمة',
    explanation: 'البلاص هو إناء فخاري كبير بيتحفظ فيه العسل الأسود والجبنة القديمة.',
  },
  {
    id: 'q26',
    question: 'لما حد يقول «فُلان ده عَينُه مَليانة»، قصده إيه؟',
    options: ['عنده قوة نظر عالية', 'شبعان وقنوع ومش طماع', 'بيحسد الناس على حاجتها', 'تعبان وعايز ينام'],
    correctAnswer: 'شبعان وقنوع ومش طماع',
    explanation: 'عينه مليانة يعني شخص أصيل لا يتطلع لما في أيدي غيره وقنوع برزقه.',
  },
  {
    id: 'q27',
    question: 'لو سمعت واحد بيقول «يا خَبَر أبيض»، غالبًا بيكون إحساسه إيه؟',
    options: ['مستغرب ومتفاجئ بحاجة', 'زعلان وغضبان من حد', 'خايف ومرعوب ومذعور', 'جعان ومستني الغدا'],
    correctAnswer: 'مستغرب ومتفاجئ بحاجة',
    explanation: 'تعبير يدل على الدهشة والاستغراب بأسلوب لطيف.',
  },
  {
    id: 'q28',
    question: 'لما يقول «إحنا بنِخبِز في الماجور»، ما هو «الماجور»؟',
    options: ['وعاء فخاري كبير للعجين', 'فرن طين بلدي قديم', 'خشبة تقليب العيش', 'غربال تنقية الدقيق'],
    correctAnswer: 'وعاء فخاري كبير للعجين',
    explanation: 'الماجور إناء فخاري واسع وعميق بيتعجن فيه الدقيق.',
  },
  {
    id: 'q29',
    question: 'لو قال «الراجل ده بَخيت»، كلمة «بخيت» معناها إيه؟',
    options: ['راجل كريم وسخي', 'شخص محظوظ ومرزوق', 'شخص فقير ومحتاج', 'شخص سريع الحركة'],
    correctAnswer: 'شخص محظوظ ومرزوق',
    explanation: 'بخيت مشتقة من البخت، وتعني صاحب الحظ الطيب والتوفيق.',
  },
  {
    id: 'q30',
    question: 'لما حد يقول «كَبَّ الرزق»، كلمة «كبّ» هنا معناها إيه؟',
    options: ['دلق أو سكب الحاجة', 'جمع ووفر الفلوس', 'طبخ الأكل بسرعة', 'باع واشترى بالربح'],
    correctAnswer: 'دلق أو سكب الحاجة',
    explanation: 'كبّ الشيء أي سكبه أو أراقه على الأرض.',
  },
  {
    id: 'q31',
    question: 'لو واحد صعيدي قال «البِدارْ» في الزراعة، يقصد إيه؟',
    options: ['حصاد المحصول الناشف', 'رش وبذر التقاوي بالأرض', 'ريّ الزرع وقت الفجر', 'تقليح النخل العالي'],
    correctAnswer: 'رش وبذر التقاوي بالأرض',
    explanation: 'البِدار هو نثر الحبوب والتقاوي باليد في الأرض الزراعية.',
  },
  {
    id: 'q32',
    question: 'لما حد يقول «يا مرحب باللي طَلّ»، كلمة «طَلّ» معناها إيه؟',
    options: ['زارنا وظهر بعد غيبة', 'اتكلم في التليفون بدري', 'بعت رسالة مكتوبة', 'سافر للبلاد البعيدة'],
    correctAnswer: 'زارنا وظهر بعد غيبة',
    explanation: 'طَلّ أي ظهر وأقبل زائراً أو مشرقاً بحضوره.',
  },
  {
    id: 'q33',
    question: 'لو حد قال «ده واد لِبِخ في الكلام»، كلمة «لِبِخ» تعني إيه؟',
    options: ['فصيح ولسانه حلو ومقنع', 'صوته عالي ومزعج للناس', 'كلامه قليل وخجول جداً', 'صادق ومابيعرفش يجامل'],
    correctAnswer: 'فصيح ولسانه حلو ومقنع',
    explanation: 'اللبخ أو اللبق هو صاحب اللسان الحاضر الذي يعرف كيف يزن كلامه.',
  },
  {
    id: 'q34',
    question: 'لما يقول «الحاجة دي اتْقَلَبِت رَأْسًا على عَقِب»، يعني إيه؟',
    options: ['اتصلحت وبقت كويسة', 'اتشقلبت وباظ نظامها تماماً', 'غليت وبقت غالية جداً', 'ضاعت ومحدش لاقيها'],
    correctAnswer: 'اتشقلبت وباظ نظامها تماماً',
    explanation: 'تعبير يدل على الانقلاب التام وتغير الحال.',
  },
  {
    id: 'q35',
    question: 'لو حد قال «الراجل ده صَلْب طُولُه»، يقصد إيه بحالته الصحية؟',
    options: ['صحيته قوية وقادر يقف ويتحرك', 'طويل القامة ونحيف الجسم', 'تعبان ونايم في السرير', 'بيجري ومستعجل جداً'],
    correctAnswer: 'صحيته قوية وقادر يقف ويتحرك',
    explanation: 'صلب طوله تعني بصحة وعافية وقادر على الاعتماد على نفسه والوقوف.',
  },
  {
    id: 'q36',
    question: 'في المثل «العِرج يِمِدّ لسابع جد»، المقصود بإيه هنا؟',
    options: ['الأرض الزراعية بتورث', 'الصفات والطباع وراثة في الأهل', 'السفر بيقرب المسافات', 'الأشجار بتكبر مع السنين'],
    correctAnswer: 'الصفات والطباع وراثة في الأهل',
    explanation: 'يُضرب في تأثير الأصل والصفات وطباع العائلة عبر الأجيال.',
  },
  {
    id: 'q37',
    question: 'لو حد قال «استهدى بالله وارتزّ»، كلمة «ارتزّ» معناها إيه؟',
    options: ['اقعد واثبت في مكانك', 'اتكلم وقول طلباتك', 'امشي وماترجعش تاني', 'نام واصحى بكير'],
    correctAnswer: 'اقعد واثبت في مكانك',
    explanation: 'ارتزّ بتتقال بمعنى اقعد واهدأ واثبت مكانك.',
  },
  {
    id: 'q38',
    question: 'لما حد يقول «فُلان ده واكِل نَاسه»، المقصود إيه؟',
    options: ['بيصرف عليهم وكريم معاهم', 'جاحد ومش مقدر فضل أهله', 'بيحب العزومات والأفراح', 'مسافر بعيد عن بلده'],
    correctAnswer: 'جاحد ومش مقدر فضل أهله',
    explanation: 'تعبير مجازي عن الشخص القاسي الذي ينكر أفضال أقاربه.',
  },
  {
    id: 'q39',
    question: 'لو سمعت حد بيقول «عَطّار وبِيْعَطِّر»، غالبًا شغال إيه؟',
    options: ['بياع توابل وأعشاب طبية', 'نجار بيعمل دواليب خشب', 'فلاح بيزرع البرسيم والقمح', 'صانع فخار وجرار طين'],
    correctAnswer: 'بياع توابل وأعشاب طبية',
    explanation: 'العطار هو صاحب دكان التوابل والبهارات والأعشاب التقليدية.',
  },
  {
    id: 'q40',
    question: 'كلمة «الدّافور» في الاستخدام الريفي الصعيدي تشير لإيه؟',
    options: ['وابور الجاز الصغير للنار', 'مروحة قديمة معمولة خوص', 'نوع قماش للصوف والجلابيب', 'عربية خشب بتجرها حمير'],
    correctAnswer: 'وابور الجاز الصغير للنار',
    explanation: 'الدافور هو موقد النار أو الشعلة الصغيرة المتنقلة لإعداد الشاي والطبخ.',
  },
  {
    id: 'q41',
    question: 'لما حد يقول «ده راجل بَصّار»، يعني إيه؟',
    options: ['بيفهم الأمور بنظرة وفراسة', 'بيشتغل في تصليح النظارات', 'بيحب السهر بالليل كتير', 'كلامه كتير ومابيخلصش'],
    correctAnswer: 'بيفهم الأمور بنظرة وفراسة',
    explanation: 'البصّار هو صاحب البصيرة والفراسة الحادة.',
  },
  {
    id: 'q42',
    question: 'لو قال «الشمس طالعة تحرق القِصَبْ»، ده وقت إيه من السنة؟',
    options: ['عز الصيف والحرارة الشديدة', 'عز طوبة والشتا والمطر', 'وقت نسيم الربيع الهادي', 'وقت خريف ورياح الخماسين'],
    correctAnswer: 'عز الصيف والحرارة الشديدة',
    explanation: 'كناية عن شدة حرارة الصيف.',
  },
  {
    id: 'q43',
    question: 'لما يقولك الصعيدي «مِيلْ علينا نشرب شاي»، قصده إيه بكلمة «ميل»؟',
    options: ['عدّي علينا وادخل ضيفنا', 'امشي في طريق مايل ومعووج', 'اتصل بينا في التليفون', 'ابعتلنا حد من قرايبك'],
    correctAnswer: 'عدّي علينا وادخل ضيفنا',
    explanation: 'مِيل علينا دعوة كريمة للمرور وزيارة البيت وتناول واجب الضيافة.',
  },
  {
    id: 'q44',
    question: 'لو قال «فُلان ما عِندُوش عِزْوَة»، يعني محروم من إيه؟',
    options: ['الأهل والسند والرجالة اللي معاه', 'الفلوس والأراضي الواسعة', 'البيوت الكبيرة والعربيات', 'الوظيفة الميري الحكومية'],
    correctAnswer: 'الأهل والسند والرجالة اللي معاه',
    explanation: 'العِزوة هي العائلة الكبيرة والذرية والسند من الأهل.',
  },
  {
    id: 'q45',
    question: 'في اللهجة الصعيدية، كلمة «الزَّقْزُوقْ» غالبًا بتتقال على مين؟',
    options: ['العيل الصغير اللي بيتحرك كتير', 'الراجل العجوز كبير القعدة', 'الضيف الغريب عن القرية', 'التاجر الشاطر في السوق'],
    correctAnswer: 'العيل الصغير اللي بيتحرك كتير',
    explanation: 'الزقزوق هو الطفل الصغير النشيط كثير المشاغبة.',
  },
  {
    id: 'q46',
    question: 'لما حد يقول «الموضوع ده فيه إنَّ»، بيقصد إيه؟',
    options: ['موضوع مشكوك فيه وفيه سر', 'موضوع سهل وهيخلص في ثانية', 'موضوع مبهج ويفرح القلب', 'موضوع قديم وانتهى زمان'],
    correctAnswer: 'موضوع مشكوك فيه وفيه سر',
    explanation: 'تعبير يدل على وجود ريبة أو أمر مخفي غير معلن.',
  },
  {
    id: 'q47',
    question: 'لو قال «قَعَدْنا في عَصْرِيّة هَنِيّة»، ده وقت إيه؟',
    options: ['الوقت ما بين العصر والمغرب', 'الساعة اتناشر الظهر بالتمام', 'الساعة اتنين بالليل في السهر', 'وقت صلاة الفجر والشروق'],
    correctAnswer: 'الوقت ما بين العصر والمغرب',
    explanation: 'العصرية هي فترة ما بعد العصر إلى الغروب.',
  },
  {
    id: 'q48',
    question: 'لما يقول «اتْسَمَّرْ في مكانه»، ده معناه إنه حصله إيه؟',
    options: ['وقف وما اتحركش من المفاجأة', 'نام نوم تقيل ومصحاش', 'جري بسرعة واستخبى', 'قعد يضحك بصوت عالي'],
    correctAnswer: 'وقف وما اتحركش من المفاجأة',
    explanation: 'اتسمر كأنه مسمار دُقّ في الأرض من الصدمة أو الدهشة.',
  },
  {
    id: 'q49',
    question: 'لو حد قال «ده راجل مِفْضال»، دي صفة بتدل على إيه؟',
    options: ['صاحب فضل وكرم وإحسان كبير', 'بيتكلم كتير من غير فايدة', 'عنده أراضي كتير بيبورها', 'دايم الخناق والمشاكل'],
    correctAnswer: 'صاحب فضل وكرم وإحسان كبير',
    explanation: 'المِفضال صيغة مبالغة تدل على كثرة الجود والكرم.',
  },
  {
    id: 'q50',
    question: 'لما حد يقول «سَالِك النِّيّة»، يقصد بيه إيه؟',
    options: ['قلبه أبيض ونيته صافية وطيبة', 'بيعرف يسلك طرقه بالمكر', 'بيتحرك بسرعة ومابيستناش', 'ذكي ومبيثقش في أي حد'],
    correctAnswer: 'قلبه أبيض ونيته صافية وطيبة',
    explanation: 'سالك النية يعني شخص طيب السريرة وخالي القلب من الحقد.',
  },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const createQuiz = (): QuizQuestion[] => {
  return shuffleArray(QUESTION_BANK)
    .slice(0, 10)
    .map((question) => ({
      ...question,
      options: shuffleArray(question.options),
    }));
};

export const DialectDictionaryPage: React.FC = () => {
  const { activePage, setActivePage } = useApp();

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

  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const victoryPlayedRef = useRef(false);

  const currentQuestion = questions[currentIndex];

  const startQuiz = useCallback(() => {
    setQuestions(createQuiz());
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setCompleted(false);
    setCopied(false);
    setShowIntro(true);
    setGameStarted(false);
    setCountdown(null);
    setTimeLeft(TOTAL_QUIZ_TIME);
    victoryPlayedRef.current = false;

    if (introAudioRef.current) {
      introAudioRef.current.pause();
      introAudioRef.current.currentTime = 0;
    }
  }, []);

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  // تايمر محسّن يعمل بفاصل زمني ثابت دون إعادة إنشاء الـ Interval كل ثانية
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
    if (score >= 10) {
      return {
        badge: 'عمدة الصعيد',
        title: 'صعيدي أصيل في الكلام 👳‍♂️',
        description: 'ما شاء الله عليك، جبت الدرجة النهائية وفهمت كل الكلمات وأصولها.',
        isSaidi: true,
      };
    }
    if (score >= 8) {
      return {
        badge: 'ابن أصول',
        title: 'فاهم الصعيدي كويس جداً',
        description: 'ودنك متعودة على مصطلحات وكلام أهل الصعيد وباقيلك تكّة على التمام.',
        isSaidi: true,
      };
    }
    if (score >= 6) {
      return {
        badge: 'مستمع طيب',
        title: 'نتيجة جيدة وقريبة',
        description: 'فاهم المعنى العام، ومحتاج تركيز بسيط في بعض الكلمات.',
        isSaidi: false,
      };
    }
    if (score >= 4) {
      return {
        badge: 'مسافر جديد',
        title: 'محتاج تلف شوية في الصعيد',
        description: 'جولة سريعة بين محافظات الصعيد وهتبقى متمكن من اللهجة.',
        isSaidi: false,
      };
    }
    return {
      badge: 'بداية الطريق',
      title: 'محتاج تدريب في كلام الصعيد',
      description: 'جرّب الاختبار تاني وركّز في معاني الكلمات.',
      isSaidi: false,
    };
  }, [score]);

  const playSaidiIntro = async () => {
    try {
      if (!introAudioRef.current) {
        introAudioRef.current = new Audio(WAH_INTRO_AUDIO_URL);
      }
      const audio = introAudioRef.current;
      audio.currentTime = 0;
      audio.volume = 0.9;
      await audio.play();
    } catch {
      // تجاهل أخطاء تشغيل الصوت
    }
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer || !currentQuestion || completed) return;

    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    window.setTimeout(() => {
      if (currentIndex === questions.length - 1) {
        const finalScore = score + (isCorrect ? 1 : 0);
        setCompleted(true);

        if (finalScore >= 8 && !victoryPlayedRef.current) {
          victoryPlayedRef.current = true;
          window.setTimeout(() => {
            playSaidiIntro();
          }, 350);
        }
        return;
      }

      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    }, 1000);
  };

  const shareText = `جربت اختبار "فاهم كلام الصعايدة؟" على وه | WAH
جبت ${score} من ${questions.length} (${result.title}).
جرّب الاختبار وشوف هتعرف تجيب كام:`;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const shareWhatsAppMessage = () => {
    const text = `${shareText}\n${shareUrl}`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };



  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'اختبار كلام الصعايدة | وه',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // تم إلغاء المشاركة
      }
      return;
    }
    await copyResult();
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch {
      setCopied(false);
    }
  };

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-[#eee8dc] dark:bg-[#0b0b0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#9a6a35]/20 border-t-[#9a6a35] dark:border-[#d6aa72]/20 dark:border-t-[#d6aa72] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-black/55 dark:text-white/55 font-bold text-sm">
            بنجهزلك الاختبار...
          </p>
        </div>
      </div>
    );
  }

  const isHomePage = activePage === 'home';
  const WrapperTag = isHomePage ? 'section' : 'main';

  return (
    <WrapperTag
      dir="rtl"
      className={`${isHomePage ? 'py-4 sm:py-8' : 'min-h-screen pb-20 lg:pb-0'} overflow-x-hidden bg-[#eee8dc] text-[#211d18] dark:bg-[#0b0b0a] dark:text-[#f5f0e7]`}
    >
      {/* خلفية مخففة جداً للموبايل لتقليل إجهاد كارت الشاشة */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="opacity-40">
          <NubianGeometricPattern opacity={0.03} />
        </div>
        {/* إخفاء الحلقات الضخمة في الشاشات الصغيرة */}
        <div className="hidden sm:block absolute -right-[260px] top-[18%] h-[600px] w-[600px] rounded-full border border-[#9a6a35]/[0.05] dark:border-[#d6aa72]/[0.04]" />
        <div className="hidden sm:block absolute -left-[300px] top-[55%] h-[700px] w-[700px] rounded-full border border-[#9a6a35]/[0.04] dark:border-[#d6aa72]/[0.03]" />
      </div>

      {/* الهيدر مع تقليل البلور على الموبايل - يظهر فقط في وضع الصفحة المستقلة */}
      {!isHomePage && (
        <header className="relative z-50 border-b border-black/[0.07] bg-[#eee8dc]/95 sm:bg-[#eee8dc]/80 sm:backdrop-blur-md dark:border-white/[0.08] dark:bg-[#0b0b0a]/95 sm:dark:bg-[#0b0b0a]/80">
          <div className="mx-auto flex h-[56px] sm:h-[72px] max-w-[1700px] items-center justify-between px-4 sm:px-8 lg:px-12 xl:px-16">
            <button
              type="button"
              onClick={() => setActivePage('home')}
              className="group flex items-center gap-2 sm:gap-3 text-xs font-black hover:text-[#9a6a35] dark:hover:text-[#d6aa72] cursor-pointer min-h-[44px] min-w-[44px]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 group-hover:bg-[#211d18] group-hover:text-white dark:border-white/10 dark:group-hover:bg-white dark:group-hover:text-black">
                <ArrowLeft
                  size={15}
                  className="transition-transform group-hover:-translate-x-0.5"
                />
              </span>
              <span className="hidden sm:block">الرئيسية</span>
            </button>

            <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
              <div className="text-[8px] font-black tracking-[0.45em] text-[#9a6a35] dark:text-[#d6aa72]">
                WAH
              </div>
              <div className="mt-0.5 text-xs font-black">اختبار اللهجة</div>
            </div>

            <button
              type="button"
              onClick={() => setActivePage('categories')}
              className="group flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-[10px] font-black hover:bg-[#211d18] hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-black sm:px-4 sm:py-2.5 sm:text-xs cursor-pointer min-h-[40px]"
            >
              <span className="hidden sm:block">اكتشف التصنيفات</span>
              <ArrowUpLeft
                size={14}
                className="transition-transform group-hover:-translate-x-0.5"
              />
            </button>
          </div>
        </header>
      )}

      {/* 1. مرحلة العد التنازلي */}
      {countdown !== null && (
        <section className="relative z-10 flex min-h-[calc(100vh-72px)] items-center justify-center px-5 py-12">
          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#121210] text-[9px] font-black tracking-[0.25em] text-[#9a6a35] dark:text-[#d6aa72] mb-6">
              <Zap size={14} />
              PREPARE FOR THE QUIZ
            </div>

            <div
              key={countdown}
              className="text-[8rem] sm:text-[13rem] leading-none font-black text-[#9a6a35] dark:text-[#d6aa72] select-none"
            >
              {countdown}
            </div>

            <p className="mt-6 text-sm sm:text-base font-medium text-black/60 dark:text-white/60">
              ركّز... الجولة هتبدأ حالاً
            </p>
          </div>
        </section>
      )}

      {/* 2. شاشة البداية */}
      {showIntro && countdown === null && (
        <div className="relative z-10">
          <section className="mx-auto max-w-[1700px] px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-20 lg:px-12 xl:px-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-end lg:gap-20">
              <div>
                <div className="mb-6 flex items-center gap-3 text-[9px] font-black tracking-[0.28em] text-[#9a6a35] dark:text-[#d6aa72]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9a6a35]/10 dark:bg-[#d6aa72]/10">
                    <Target size={14} className="text-[#9a6a35] dark:text-[#d6aa72]" />
                  </span>
                  WAH / DIALECT CHALLENGE
                </div>

                <h1 className="max-w-6xl text-5xl sm:text-7xl lg:text-[8rem] font-black leading-[0.95] tracking-tight">
                  انت
                  <br />
                  <span className="mr-3 sm:mr-8 lg:mr-20 text-[#9a6a35] dark:text-[#d6aa72]">
                    صعيدي؟
                  </span>
                </h1>

                <div className="mt-8 grid max-w-3xl gap-6 sm:grid-cols-[90px_1fr]">
                  <div className="hidden sm:block">
                    <div className="text-[9px] font-black tracking-[0.2em] text-black/35 dark:text-white/30">
                      اختبار اللهجة
                    </div>
                    <div className="mt-3 h-px w-12 bg-[#9a6a35] dark:bg-[#d6aa72]" />
                  </div>

                  <p className="max-w-2xl text-sm font-medium leading-7 text-black/60 dark:text-white/60 sm:text-base sm:leading-8">
                    10 أسئلة سريعة تقيس فهمك الحقيقي لمفردات وكلام أهل الصعيد.
                    معاك {TOTAL_QUIZ_TIME} ثانية للجولة كاملة. لو خلص الوقت هيتم
                    اعتماد درجتك فوري!
                  </p>
                </div>
              </div>

              {/* بطاقة معلومات الاختبار */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-3xl border border-black/[0.08] bg-[#e8e0d2] p-6 dark:border-white/[0.08] dark:bg-[#121210] sm:p-8">
                  <div className="relative">
                    <div className="mb-8 flex items-center justify-between">
                      <div className="text-[8px] font-black tracking-[0.3em] text-black/40 dark:text-white/40">
                        QUIZ OVERVIEW
                      </div>
                      <Flame
                        size={18}
                        className="text-[#9a6a35] dark:text-[#d6aa72]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <div className="text-3xl sm:text-4xl font-black tracking-tighter">
                          10
                        </div>
                        <div className="mt-1 text-[10px] font-medium text-black/50 dark:text-white/40">
                          أسئلة
                        </div>
                      </div>

                      <div>
                        <div className="text-3xl sm:text-4xl font-black tracking-tighter">
                          {formatTime(TOTAL_QUIZ_TIME)}
                        </div>
                        <div className="mt-1 text-[10px] font-medium text-black/50 dark:text-white/40">
                          وقت الجولة
                        </div>
                      </div>

                      <div>
                        <div className="text-3xl sm:text-4xl font-black tracking-tighter">
                          50
                        </div>
                        <div className="mt-1 text-[10px] font-medium text-black/50 dark:text-white/40">
                          كلمة بالبنك
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-2 border-t border-black/10 pt-4 dark:border-white/10">
                      <CircleDot
                        size={12}
                        className="text-[#9a6a35] dark:text-[#d6aa72]"
                      />
                      <span className="text-[10px] font-bold">
                        أصالة • حكاية • لهجة
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* زر بدء اللعبة */}
          <section className="relative z-30 mx-auto max-w-[1700px] px-5 sm:px-8 lg:px-12 xl:px-16 pb-12">
            <div className="relative overflow-hidden rounded-3xl bg-[#211d18] px-6 py-8 text-white sm:px-10 sm:py-12">
              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-2 text-[9px] font-black tracking-[0.25em] text-[#d6aa72]">
                    READY TO START?
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black">
                    مستعد لاختبار الصعيد؟
                  </h2>
                  <p className="mt-2 max-w-xl text-xs sm:text-sm leading-6 text-white/50">
                    شوف نفسك صعيدي أصيل وتستحق لقب العمدة ولا محتاج تلف لفة تانية في القرى.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={beginGame}
                  className="inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-[#9a6a35] hover:bg-[#744e26] dark:hover:bg-amber-600 px-7 py-3.5 rounded-xl border border-white/10 transition-colors shadow-sm self-start lg:self-auto cursor-pointer"
                >
                  ابدأ التحدي الآن
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 3. شاشة الأسئلة والتفاعل */}
      {!completed && currentQuestion && gameStarted && (
        <section className="relative z-20 mx-auto max-w-[1000px] px-4 pt-6 pb-20 sm:px-8 sm:pt-10">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#9a6a35]/10 text-[#9a6a35] dark:bg-[#d6aa72]/15 dark:text-[#d6aa72]">
                <Flame size={15} />
              </span>
              سؤال {currentIndex + 1} من {questions.length}
            </div>

            <div
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-black ${timeLeft <= 15
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                : 'bg-[#e8e0d2] text-[#211d18] dark:bg-[#121210] dark:text-[#f4eee5] border border-black/5 dark:border-white/10'
                }`}
            >
              <Clock size={14} />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <div className="rounded-full bg-[#9a6a35]/10 dark:bg-[#d6aa72]/10 border border-[#9a6a35]/20 dark:border-[#d6aa72]/20 px-3 py-1.5 text-xs font-black text-[#9a6a35] dark:text-[#d6aa72]">
              النقاط: {score}
            </div>
          </div>

          <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
            <div
              className={`h-full transition-all duration-300 ${timeLeft <= 15 ? 'bg-rose-500' : 'bg-[#9a6a35] dark:bg-[#d6aa72]'
                }`}
              style={{ width: `${(timeLeft / TOTAL_QUIZ_TIME) * 100}%` }}
            />
          </div>

          <div
            key={currentQuestion.id}
            className="rounded-3xl border border-black/[0.08] bg-[#e8e0d2] p-5 dark:border-white/[0.08] dark:bg-[#121210] sm:p-8"
          >
            <div className="mb-4 inline-flex items-center gap-1.5 text-[9px] font-black tracking-[0.2em] text-[#9a6a35] dark:text-[#d6aa72]">
              <ScrollText size={12} />
              QUESTION ARCHIVE
            </div>

            <h2 className="mb-6 text-xl font-black leading-snug sm:text-3xl">
              {currentQuestion.question}
            </h2>

            <div className="grid gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;

                let cardClass =
                  'border-black/[0.08] bg-white dark:border-white/[0.08] dark:bg-[#181715] text-[#211d18] dark:text-[#f4eee5]';

                if (selectedAnswer) {
                  if (isCorrect) {
                    cardClass =
                      'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200';
                  } else if (isSelected) {
                    cardClass =
                      'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200';
                  } else {
                    cardClass =
                      'border-black/[0.04] dark:border-white/[0.04] opacity-40';
                  }
                }

                return (
                  <button
                    key={`${currentQuestion.id}-${index}`}
                    type="button"
                    disabled={Boolean(selectedAnswer)}
                    onClick={() => handleAnswer(option)}
                    className={`flex w-full cursor-pointer items-center gap-3.5 rounded-xl border p-3.5 text-right transition-colors sm:p-4 ${cardClass}`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${selectedAnswer && isCorrect
                        ? 'bg-emerald-500 text-white'
                        : selectedAnswer && isSelected
                          ? 'bg-rose-500 text-white'
                          : 'border border-black/10 bg-[#f7f5f0] dark:border-white/10 dark:bg-[#201e1b] text-[#9a6a35] dark:text-[#d6aa72]'
                        }`}
                    >
                      {selectedAnswer && isCorrect ? (
                        <Check size={14} />
                      ) : selectedAnswer && isSelected ? (
                        <X size={14} />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </span>

                    <span className="text-xs font-bold leading-6 sm:text-base">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedAnswer && (
              <div className="mt-5 rounded-xl border border-black/10 bg-white/90 p-4 dark:border-white/10 dark:bg-[#181715]">
                <div className="mb-1.5 flex items-center gap-1.5">
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <Check
                      size={15}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  ) : (
                    <X
                      size={15}
                      className="text-rose-500 dark:text-rose-400"
                    />
                  )}
                  <span className="text-xs font-black">
                    {selectedAnswer === currentQuestion.correctAnswer
                      ? 'إجابة صحيحة'
                      : 'إجابة خاطئة'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm leading-6 text-black/70 dark:text-white/70 font-medium">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. شاشة النتائج */}
      {completed && (
        <section className="relative z-20 mx-auto max-w-[1000px] px-4 pt-6 pb-16 sm:px-8 sm:pt-10">
          <div className="rounded-3xl border border-black/[0.08] bg-[#e8e0d2] p-6 sm:p-10 text-center dark:border-white/[0.08] dark:bg-[#121210]">
            <div className="max-w-xl mx-auto">
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a1815] px-3.5 py-1.5 text-xs font-black text-[#9a6a35] dark:text-[#d6aa72]">
                <Trophy size={14} />
                {result.badge}
              </div>

              {timeLeft <= 0 && currentIndex < questions.length - 1 && (
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <Clock size={13} />
                  انتهى الوقت المحدد للاختبار!
                </div>
              )}

              <div className="my-4">
                <div className="text-[9px] font-black tracking-[0.25em] text-black/40 dark:text-white/40 mb-1">
                  YOUR FINAL SCORE
                </div>
                <div className="text-6xl sm:text-8xl font-black text-[#9a6a35] dark:text-[#d6aa72] tracking-tight">
                  {score}
                  <span className="text-xl sm:text-3xl text-black/40 dark:text-white/40 font-bold">
                    /10
                  </span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
                {result.title}
              </h2>

              <p className="text-xs sm:text-sm leading-6 text-black/60 dark:text-white/60 mb-6 font-medium">
                {result.description}
              </p>

              {result.isSaidi && (
                <div className="mb-6 inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a1815] px-4 py-2.5">
                  <Gem
                    size={16}
                    className="text-[#9a6a35] dark:text-[#d6aa72]"
                  />
                  <span className="text-xs font-black">
                    صعيدي أباً عن جد.. ودانك واعية للكلام وعارف أصل الحكاية.
                  </span>
                </div>
              )}

              {/* بطاقة المشاركة */}
              <div className="rounded-2xl bg-[#211d18] p-5 sm:p-6 text-white text-right relative overflow-hidden mb-6">
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
                  <div className="text-[8px] font-black tracking-[0.2em] text-[#d6aa72]">
                    WAH ARCHIVE CERTIFICATE
                  </div>
                  <div className="text-xs font-bold text-white/50">
                    كلام الصعايدة
                  </div>
                </div>

                <div className="py-2 text-center">
                  <div className="text-3xl sm:text-4xl font-black text-[#d6aa72] mb-1">
                    {score} / 10
                  </div>
                  <div className="text-sm font-bold text-white/90">
                    {result.title}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={shareWhatsAppMessage}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1EBA59] text-white text-xs font-black transition-colors cursor-pointer"
                  >
                    <MessageCircle size={15} />
                    واتساب
                  </button>
                  

                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="sm:col-span-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E1306C] via-[#FD1D1D] to-[#F56040] text-white text-xs font-black transition-opacity hover:opacity-90 cursor-pointer"
                  >
                    <Share2 size={15} />
                    مشاركة النتيجة ستوري
                  </button>

                  <button
                    type="button"
                    onClick={copyResult}
                    className="sm:col-span-2 flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 text-white text-xs font-black transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check size={15} className="text-emerald-400" />
                        تم نسخ الرابط والنتيجة
                      </>
                    ) : (
                      <>
                        <Copy size={15} />
                        نسخ نص النتيجة
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* أزرار الإعادة */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={startQuiz}
                  className="flex h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-[#211d18] px-6 text-xs font-black text-white hover:bg-[#9a6a35] dark:bg-white dark:text-black dark:hover:bg-[#d6aa72] transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} />
                  جولة جديدة بأسئلة مختلفة
                </button>

                {activePage !== 'home' && (
                  <button
                    type="button"
                    onClick={() => setActivePage('home')}
                    className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-black/10 px-6 text-xs font-black text-black/70 hover:bg-black/5 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    العودة للرئيسية
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* تذييل الصفحة - يظهر فقط في الصفحة المستقلة لتجنب الازدواج في الرئيسية */}
      {!isHomePage && (
        <footer className="relative z-10 border-t border-black/[0.07] dark:border-white/[0.08] mt-8 pb-12">
          <div className="mx-auto max-w-[1700px] px-5 py-8 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-black/40 dark:text-white/40">
            <div className="flex items-center gap-2">
              <CircleDot size={11} className="text-[#9a6a35] dark:text-[#d6aa72]" />
              <span>وه • توثيق الحكاية واللهجة الصعيدية الأصلية</span>
            </div>
            <div>جميع الحقوق محفوظة © {new Date().getFullYear()}</div>
          </div>
        </footer>
      )}
    </WrapperTag>
  );
};

export default DialectDictionaryPage;