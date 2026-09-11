import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
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
const TOTAL_QUIZ_TIME = 50; // 50 ثانية للاختبار كاملاً

const playBeep = (freq = 440, type: OscillatorType = 'sine', duration = 0.15) => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // AudioContext fallback
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
  // سحب activePage من السياق لمعرفة الصفحة الحالية
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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const victoryPlayedRef = useRef(false);

  const currentQuestion = questions[currentIndex];

  const startQuiz = () => {
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
    setIsPlayingAudio(false);
    victoryPlayedRef.current = false;

    if (introAudioRef.current) {
      introAudioRef.current.pause();
      introAudioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    startQuiz();
  }, []);

  // مؤقت الجولة الشامل
  // مؤقت الجولة الشامل مع صوت تحذيري في آخر 5 ثواني
  useEffect(() => {
    if (!gameStarted || completed) return;

    if (timeLeft <= 0) {
      playBeep(220, 'sawtooth', 0.4); // صوت انتهاء الوقت
      setCompleted(true);
      return;
    }

    // تكتكة تحذيرية حادة وسريعة لآخر 5 ثواني (5, 4, 3, 2, 1)
    if (timeLeft <= 5) {
      playBeep(880, 'square', 0.08);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, completed, timeLeft]);
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
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
    } catch {
      setIsPlayingAudio(false);
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

  const shareFacebookPost = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}&quote=${encodeURIComponent(shareText)}`,
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
        // user cancel
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
      <div className="min-h-screen bg-[#f3eee5] dark:bg-[#090908] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#9a6a35]/20 border-t-[#9a6a35] dark:border-[#d6aa72]/20 dark:border-t-[#d6aa72] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-black/55 dark:text-white/55 font-bold text-sm">
            بنجهزلك الاختبار...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#f3eee5] text-[#211d18] transition-colors duration-500 dark:bg-[#090908] dark:text-[#f4eee5]"
    >
      {/* =====================================================
          DECORATIVE BACKGROUND
      ===================================================== */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <NubianGeometricPattern opacity={0.04} />

        <div className="absolute -right-[260px] top-[18%] h-[600px] w-[600px] rounded-full border border-[#9a6a35]/[0.07] dark:border-[#d6aa72]/[0.06]" />
        <div className="absolute -left-[300px] top-[55%] h-[700px] w-[700px] rounded-full border border-[#9a6a35]/[0.05] dark:border-[#d6aa72]/[0.05]" />
        <div className="absolute right-[15%] top-[42%] h-2 w-2 rounded-full bg-[#9a6a35]/30 dark:bg-[#d6aa72]/30" />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="relative z-50 border-b border-black/[0.07] bg-[#f3eee5]/80 backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#090908]/80">
        <div className="mx-auto flex h-[72px] max-w-[1700px] items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-16">
          {/* إخفاء زر الرئيسية لو activePage == 'home' */}
          {activePage !== 'home' ? (
            <button
              type="button"
              onClick={() => setActivePage('home')}
              className="group flex items-center gap-3 text-xs font-black transition-all hover:text-[#9a6a35] dark:hover:text-[#d6aa72] cursor-pointer"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 transition-all group-hover:bg-[#211d18] group-hover:text-white dark:border-white/10 dark:group-hover:bg-white dark:group-hover:text-black">
                <ArrowLeft
                  size={15}
                  className="transition-transform group-hover:-translate-x-0.5"
                />
              </span>
              <span className="hidden sm:block">الرئيسية</span>
            </button>
          ) : (
            <div />
          )}

          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <div className="text-[8px] font-black tracking-[0.45em] text-[#9a6a35] dark:text-[#d6aa72]">
              WAH
            </div>
            <div className="mt-1 text-xs font-black">اختبار اللهجة</div>
          </div>

          <button
            type="button"
            onClick={() => setActivePage('categories')}
            className="group flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-[10px] font-black transition-all hover:bg-[#211d18] hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-black sm:px-4 sm:py-2.5 sm:text-xs cursor-pointer"
          >
            <span className="hidden sm:block">اكتشف التصنيفات</span>
            <ArrowUpLeft
              size={14}
              className="transition-transform group-hover:-translate-x-0.5"
            />
          </button>
        </div>
      </header>

      {/* =====================================================
          1. COUNTDOWN STATE
      ===================================================== */}
      {countdown !== null && (
        <section className="relative z-10 flex min-h-[calc(100vh-72px)] items-center justify-center px-5 py-12">
          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-[#121210]/70 text-[9px] font-black tracking-[0.25em] text-[#9a6a35] dark:text-[#d6aa72] mb-6 backdrop-blur-md">
              <Zap size={14} />
              PREPARE FOR THE QUIZ
            </div>

            <div
              key={countdown}
              className="text-[9rem] sm:text-[13rem] leading-none font-black text-[#9a6a35] dark:text-[#d6aa72] select-none animate-pulse"
            >
              {countdown}
            </div>

            <p className="mt-6 text-sm sm:text-base font-medium text-black/60 dark:text-white/60">
              ركّز... الجولة هتبدأ حالاً
            </p>
          </div>
        </section>
      )}

      {/* =====================================================
          2. LOBBY / INTRO STATE
      ===================================================== */}
      {showIntro && countdown === null && (
        <div className="relative z-10">
          <section className="mx-auto max-w-[1700px] px-5 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-24 lg:px-12 lg:pb-20 lg:pt-28 xl:px-16">
            <div className="grid gap-14 lg:grid-cols-[1fr_420px] lg:items-end lg:gap-20">
              {/* Main Title Section */}
              <div>
                <div className="mb-7 flex items-center gap-3 text-[9px] font-black tracking-[0.28em] text-[#9a6a35] dark:text-[#d6aa72]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9a6a35]/10 dark:bg-[#d6aa72]/10">
                    <Sparkles size={13} />
                  </span>
                  WAH / DIALECT CHALLENGE
                </div>

                <h1 className="max-w-6xl text-[18vw] font-black leading-[0.78] tracking-[-0.1em] sm:text-[13vw] lg:text-[9rem] xl:text-[10.5rem]">
                  انت
                  <br />
                  <span className="mr-[8vw] text-[#9a6a35] dark:text-[#d6aa72] lg:mr-28">
                    صعيدي؟
                  </span>
                </h1>

                <div className="mt-10 grid max-w-3xl gap-7 sm:grid-cols-[90px_1fr]">
                  <div className="hidden sm:block">
                    <div className="text-[9px] font-black tracking-[0.2em] text-black/35 dark:text-white/30">
                      01
                    </div>
                    <div className="mt-3 h-px w-12 bg-[#9a6a35] dark:bg-[#d6aa72]" />
                  </div>

                  <p className="max-w-2xl text-sm font-medium leading-8 text-black/55 dark:text-white/55 sm:text-base sm:leading-9">
                    10 أسئلة سريعة تقيس فهمك الحقيقي لمفردات وكلام أهل الصعيد.
                    معاك {TOTAL_QUIZ_TIME} ثانية للجولة كاملة. لو خلص الوقت هيتم
                    اعتماد درجتك فوري!
                  </p>
                </div>
              </div>

              {/* Side Card / Stats Box */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-[2rem] border border-black/[0.08] bg-[#e8e0d2] p-7 dark:border-white/[0.08] dark:bg-[#121210] sm:p-8">
                  <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full border border-[#9a6a35]/15 dark:border-[#d6aa72]/10" />

                  <div className="relative">
                    <div className="mb-10 flex items-center justify-between">
                      <div className="text-[8px] font-black tracking-[0.3em] text-black/35 dark:text-white/35">
                        QUIZ OVERVIEW
                      </div>
                      <Flame
                        size={18}
                        className="text-[#9a6a35] dark:text-[#d6aa72]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-4xl font-black tracking-[-0.07em]">
                          10
                        </div>
                        <div className="mt-2 text-[10px] font-medium text-black/50 dark:text-white/40">
                          أسئلة
                        </div>
                      </div>

                      <div>
                        <div className="text-4xl font-black tracking-[-0.07em]">
                          {formatTime(TOTAL_QUIZ_TIME)}
                        </div>
                        <div className="mt-2 text-[10px] font-medium text-black/50 dark:text-white/40">
                          وقت الجولة
                        </div>
                      </div>

                      <div>
                        <div className="text-4xl font-black tracking-[-0.07em]">
                          50
                        </div>
                        <div className="mt-2 text-[10px] font-medium text-black/50 dark:text-white/40">
                          كلمة بالبنك
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center gap-3 border-t border-black/10 pt-5 dark:border-white/10">
                      <CircleDot
                        size={13}
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

          {/* CTA Box */}
          <section className="relative z-30 mx-auto max-w-[1700px] px-5 sm:px-8 lg:px-12 xl:px-16 pb-16">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#211d18] px-6 py-12 text-white sm:px-10 sm:py-16 lg:px-16">
              <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full border border-white/[0.08]" />
              <div className="pointer-events-none absolute -bottom-32 right-[30%] h-72 w-72 rounded-full border border-white/[0.05]" />

              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-3 text-[9px] font-black tracking-[0.25em] text-[#d6aa72]">
                    READY TO START?
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.05em]">
                    مستعد لاختبار الصعيد؟
                  </h2>
                  <p className="mt-3 max-w-xl text-xs sm:text-sm leading-7 text-white/50">
                    شوف نفسك صعيدي أصيل وتستحق لقب العمدة ولا محتاج تزور قنا
                    وأسيوط وسوهاج تاني.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={beginGame}
                  className="group inline-flex items-center justify-center gap-2.5 text-sm font-bold text-white bg-[#9a6a35] hover:bg-[#744e26] dark:hover:bg-amber-600 px-6 py-3 rounded-2xl border border-black/10 dark:border-white/10 transition-all duration-300 shadow-md self-start md:self-auto cursor-pointer"
                >
                  ابدأ التحدي الآن
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================
          3. ACTIVE GAMEPLAY INTERACTION
      ===================================================== */}
      {!completed && currentQuestion && gameStarted && (
        <section className="relative z-20 mx-auto max-w-[1100px] px-5 pt-8 pb-24 sm:px-8 sm:pt-12">
          {/* Top Bar: Progress & Timer */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs font-black">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#9a6a35]/10 text-[#9a6a35] dark:bg-[#d6aa72]/15 dark:text-[#d6aa72]">
                <Flame size={17} />
              </span>
              سؤال {currentIndex + 1} من {questions.length}
            </div>

            {/* Timer Badge */}
            <div
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition-colors ${timeLeft <= 15
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse'
                : 'bg-[#e8e0d2] text-[#211d18] dark:bg-[#121210] dark:text-[#f4eee5] border border-black/5 dark:border-white/10'
                }`}
            >
              <Clock size={15} />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Score */}
            <div className="rounded-full bg-[#9a6a35]/10 dark:bg-[#d6aa72]/10 border border-[#9a6a35]/20 dark:border-[#d6aa72]/20 px-4 py-2 text-xs font-black text-[#9a6a35] dark:text-[#d6aa72]">
              النقاط: {score}
            </div>
          </div>

          {/* Time Progress Bar */}
          <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
            <div
              className={`h-full transition-all duration-1000 ${timeLeft <= 15 ? 'bg-rose-500' : 'bg-[#9a6a35] dark:bg-[#d6aa72]'
                }`}
              style={{ width: `${(timeLeft / TOTAL_QUIZ_TIME) * 100}%` }}
            />
          </div>

          {/* Main Question Card */}
          <div
            key={currentQuestion.id}
            className="relative overflow-hidden rounded-[2.5rem] border border-black/[0.08] bg-[#e8e0d2]/70 p-6 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#121210] sm:p-10"
          >
            <div className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full border border-[#9a6a35]/15 dark:border-[#d6aa72]/10" />

            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 text-[9px] font-black tracking-[0.25em] text-[#9a6a35] dark:text-[#d6aa72]">
                <ScrollText size={13} />
                QUESTION ARCHIVE
              </div>

              <h2 className="mb-8 text-2xl font-black leading-relaxed sm:text-3xl lg:text-4xl">
                {currentQuestion.question}
              </h2>

              <div className="grid gap-3 sm:gap-4">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.correctAnswer;

                  let cardClass =
                    'border-black/[0.08] bg-white/70 dark:border-white/[0.08] dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.08] text-[#211d18] dark:text-[#f4eee5]';

                  if (selectedAnswer) {
                    if (isCorrect) {
                      cardClass =
                        'border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200';
                    } else if (isSelected) {
                      cardClass =
                        'border-rose-500 bg-rose-50/90 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                    } else {
                      cardClass =
                        'border-black/[0.05] dark:border-white/[0.05] opacity-35';
                    }
                  }

                  return (
                    <button
                      key={`${currentQuestion.id}-${index}`}
                      type="button"
                      disabled={Boolean(selectedAnswer)}
                      onClick={() => handleAnswer(option)}
                      className={`flex w-full cursor-pointer items-center gap-4 rounded-2xl border p-4 text-right transition-all sm:p-5 ${cardClass}`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-all ${selectedAnswer && isCorrect
                          ? 'bg-emerald-500 text-white'
                          : selectedAnswer && isSelected
                            ? 'bg-rose-500 text-white'
                            : 'border border-black/10 bg-white dark:border-white/10 dark:bg-[#1f1d1a] text-[#9a6a35] dark:text-[#d6aa72]'
                          }`}
                      >
                        {selectedAnswer && isCorrect ? (
                          <Check size={16} />
                        ) : selectedAnswer && isSelected ? (
                          <X size={16} />
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </span>

                      <span className="text-sm font-bold leading-7 sm:text-base">
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation Box */}
              {selectedAnswer && (
                <div className="mt-6 rounded-2xl border border-black/10 bg-white/80 p-5 dark:border-white/10 dark:bg-[#1a1916]">
                  <div className="mb-2 flex items-center gap-2">
                    {selectedAnswer === currentQuestion.correctAnswer ? (
                      <Check
                        size={17}
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                    ) : (
                      <X
                        size={17}
                        className="text-rose-500 dark:text-rose-400"
                      />
                    )}
                    <span className="text-xs font-black">
                      {selectedAnswer === currentQuestion.correctAnswer
                        ? 'إجابة صحيحة'
                        : 'إجابة خاطئة'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm leading-7 text-black/65 dark:text-white/65 font-medium">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          4. RESULTS SCREEN (BRAND STATEMENT & SHARE)
      ===================================================== */}
      {completed && (
        <section className="relative z-20 mx-auto max-w-[1200px] px-5 pt-8 pb-20 sm:px-8 sm:pt-14">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-black/[0.08] bg-[#e8e0d2]/70 p-6 sm:p-12 text-center backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#121210]">
            <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full border border-[#9a6a35]/15 dark:border-[#d6aa72]/10" />
            <div className="pointer-events-none absolute -right-32 -bottom-32 h-80 w-80 rounded-full border border-black/5 dark:border-white/5" />

            <div className="relative z-10 max-w-2xl mx-auto">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#1a1815] px-4 py-2 text-xs font-black text-[#9a6a35] dark:text-[#d6aa72]">
                <Trophy size={16} />
                {result.badge}
              </div>

              {/* Time out notice if unfinished */}
              {timeLeft <= 0 && currentIndex < questions.length - 1 && (
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-4 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <Clock size={14} />
                  انتهى الوقت المحدد للاختبار!
                </div>
              )}

              {/* Score Display */}
              <div className="my-6">
                <div className="text-[10px] font-black tracking-[0.3em] text-black/40 dark:text-white/40 mb-2">
                  YOUR FINAL SCORE
                </div>
                <div className="text-7xl sm:text-9xl font-black text-[#9a6a35] dark:text-[#d6aa72] tracking-tighter">
                  {score}
                  <span className="text-2xl sm:text-4xl text-black/40 dark:text-white/40 font-bold">
                    /10
                  </span>
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                {result.title}
              </h2>

              <p className="text-sm sm:text-base leading-8 text-black/60 dark:text-white/60 mb-8 font-medium">
                {result.description}
              </p>

              {/* Cultural recognition callout */}
              {result.isSaidi && (
                <div className="mb-8 inline-flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#1a1815] px-5 py-3.5">
                  <Gem
                    size={18}
                    className="text-[#9a6a35] dark:text-[#d6aa72]"
                  />
                  <span className="text-xs font-black">
                    صعيدي أباً عن جد.. ودانك واعية للكلام وعارف أصل الحكاية.
                  </span>
                </div>
              )}

              {/* Share Box Styled Like Market Dark Cards */}
              <div className="rounded-[2rem] bg-[#211d18] p-6 sm:p-8 text-white text-right relative overflow-hidden mb-6">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                  <div className="text-[9px] font-black tracking-[0.25em] text-[#d6aa72]">
                    WAH ARCHIVE CERTIFICATE
                  </div>
                  <div className="text-xs font-bold text-white/50">
                    كلام الصعايدة
                  </div>
                </div>

                <div className="py-2 text-center">
                  <div className="text-4xl sm:text-5xl font-black text-[#d6aa72] mb-1">
                    {score} / 10
                  </div>
                  <div className="text-base font-bold text-white/90">
                    {result.title}
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={shareWhatsAppMessage}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1EBA59] text-white text-xs font-black transition-colors cursor-pointer"
                  >
                    <MessageCircle size={16} />
                    واتساب
                  </button>

                  <button
                    type="button"
                    onClick={shareFacebookPost}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1877F2] hover:bg-[#0d6efd] text-white text-xs font-black transition-colors cursor-pointer"
                  >
                    <Facebook size={16} />
                    فيسبوك
                  </button>

                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="sm:col-span-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E1306C] via-[#FD1D1D] to-[#F56040] text-white text-xs font-black transition-opacity hover:opacity-90 cursor-pointer"
                  >
                    <Share2 size={16} />
                    مشاركة النتيجة ستوري
                  </button>

                  <button
                    type="button"
                    onClick={copyResult}
                    className="sm:col-span-2 flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 text-white text-xs font-black transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="text-emerald-400" />
                        تم نسخ الرابط والنتيجة
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        نسخ نص النتيجة
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={startQuiz}
                  className="group flex h-14 w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-[#211d18] px-8 text-xs font-black text-white hover:bg-[#9a6a35] dark:bg-white dark:text-black dark:hover:bg-[#d6aa72] transition-all cursor-pointer"
                >
                  <RefreshCw size={15} />
                  جولة جديدة بأسئلة مختلفة
                </button>

                {activePage !== 'home' && (
                  <button
                    type="button"
                    onClick={() => setActivePage('home')}
                    className="flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-black/10 px-8 text-xs font-black text-black/70 hover:bg-black/5 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5 transition-all cursor-pointer"
                  >
                    العودة للرئيسية
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          FOOTER SPACER & HERITAGE STATEMENT
      ===================================================== */}
      <section className="relative z-10 border-t border-black/[0.07] dark:border-white/[0.08] mt-12">
        <div className="mx-auto max-w-[1700px] px-5 py-12 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-black/40 dark:text-white/40">
          <div className="flex items-center gap-2">
            <CircleDot size={12} className="text-[#9a6a35] dark:text-[#d6aa72]" />
            <span>وه • توثيق الحكاية واللهجة الصعيدية الأصلية</span>
          </div>
          <div>جميع الحقوق محفوظة © {new Date().getFullYear()}</div>
        </div>
      </section>
    </main>
  );
};

export default DialectDictionaryPage;