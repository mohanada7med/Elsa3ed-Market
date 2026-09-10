import { Db } from 'mongodb';
import { Logger } from './logger.ts';
import { memoryDb } from '../db/mongodb.ts';
import type {
  HeritagePlaceDoc,
  HeritagePlaceEvent,
  HeritagePlaceVisitorService,
  HeritagePlaceVisitInfo,
  HeritagePlaceAccess,
  HeritagePlaceAddress
} from '../models/types.ts';

interface AuthenticPlaceEnrichment {
  address: HeritagePlaceAddress;
  visitInfo: HeritagePlaceVisitInfo;
  access: HeritagePlaceAccess;
  visitDuration: string;
  visitorServices: HeritagePlaceVisitorService[];
  events: HeritagePlaceEvent[];
}

// Authentic Upper Egypt Heritage Place details for existing database documents
const AUTHENTIC_PLACES_DATA: Record<string, AuthenticPlaceEnrichment> = {
  'place-abydos': {
    address: {
      governorate: 'سوهاج',
      city: 'البلينا',
      village: 'قرية العرابة المدفونة'
    },
    visitInfo: {
      openingHours: 'يومياً من ٧:٠٠ صباحاً حتى ٥:٠٠ مساءً',
      bestTimeToVisit: 'من أكتوبر حتى أبريل (الأشهر المعتدلة شتاءً)',
      entryFee: '٦٠ جنيهاً للمصريين / ٣٠ جنيهاً للطلاب / ٢٦٠ جنيهاً للأجانب',
      reservationRequired: false
    },
    visitDuration: 'من ٢ إلى ٣ ساعات',
    access: {
      description: 'يقع على بعد حوالي 11 كم جنوب غرب مدينة البلينا، و55 كم جنوب سوهاج، عبر طريق البلينا - العرابة المدفونة الممهد.',
      transportation: 'سيارات أجرة وميكروباص من موقف البلينا، أو عبر قطار الصعيد حتى محطة البلينا ثم تاكسي محلي إلى المعبد.'
    },
    visitorServices: [
      { name: 'مركز زوار واستعلامات', description: 'مركز معتمد يقدم نبذة تعريفية وخرائط مسار المعبد وقائمة الملوك' },
      { name: 'مرشدون أثريون مرخصون', description: 'مرافقة لشرح نقوش سيتي الأول والأوزيريون باللغتين العربية والإنجليزية' },
      { name: 'مواقف سيارات وحافلات', description: 'موقف سيارات منظم ومؤمن أمام مدخل المعبد مباشرة' },
      { name: 'كافتيريا واستراحة', description: 'استراحة مظللة تقدم المشروبات ومأكولات سريعة للزوار' }
    ],
    events: [
      {
        name: 'احتفالية مروية أوزيريس وأبيدوس التراثية',
        description: 'فعاليات ثقافية سنوية تسرد قصة الحج القديم وعمارة الأوزيريون الأثرية',
        date: 'شهر نوفمبر سنوياً',
        duration: 'يومان',
        frequency: 'سنوي'
      }
    ]
  },
  'place-karnak': {
    address: {
      governorate: 'الأقصر',
      city: 'الأقصر',
      village: 'نجع الكرنك - الضفة الشرقية'
    },
    visitInfo: {
      openingHours: 'يومياً من ٦:٠٠ صباحاً حتى ٥:٣٠ مساءً (عروض الصوت والضوء مساءً)',
      bestTimeToVisit: 'الصباح الباكر أو قبل الغروب لتجنب حرارة الشمس الشديدة',
      entryFee: '٤٠ جنيهاً للمصريين / ٢٠ جنيهاً للطلاب / ٤٥٠ جنيهاً للأجانب',
      reservationRequired: false
    },
    visitDuration: 'من ٣ إلى ٤ ساعات',
    access: {
      description: 'يقع شمال معبد الأقصر بنحو 3 كم متصلاً عبر طريق الكباش التاريخي، ويمكن الوصول إليه سيراً أو بالسيارة.',
      transportation: 'سيارات تاكسي، حناطير تراثية من كورنيش النيل، أو سيارات سياحية مكيفة.'
    },
    visitorServices: [
      { name: 'عروض الصوت والضوء', description: 'عروض صوت وضوء بعدة لغات تسرد تاريخ طيبة ومعابد الكرنك' },
      { name: 'عربات كهربائية (جولف كار)', description: 'متاحة لكبار السن وذوي الاحتياجات الخاصة للتنقل داخل المجمع' },
      { name: 'بازار الحرف التراثية', description: 'أكشاك معتمدة لبيع ورق البردي، الألباستر، والتحف التراثية' },
      { name: 'مرافق وخدمات عامة', description: 'دورات مياه حديثة، مركز طبي للطوارئ، ومناطق استراحة مظللة' }
    ],
    events: [
      {
        name: 'ظاهرة تعامد الشمس على قدس أقداس الكرنك',
        description: 'حدث فلكي تاريخي فريد يوثق بداية الانقلاب الشتوي ودخول الضوء إلى مقصورة آمون',
        date: '٢١ ديسمبر من كل عام',
        duration: 'يوم واحد',
        frequency: 'سنوي'
      },
      {
        name: 'مهرجان الأقصر للسينما الإفريقية بالكرنك',
        description: 'افتتاحية مهرجان السينما الإفريقية بحضور فنانين ومبدعين وسط أعمدة المعبد',
        date: 'شهر مارس',
        duration: 'أسبوع',
        frequency: 'سنوي'
      }
    ]
  },
  'place-qasr-dakhla': {
    address: {
      governorate: 'الوادي الجديد',
      city: 'مركز الداخلة',
      village: 'قرية القصر التراثية'
    },
    visitInfo: {
      openingHours: 'يومياً من ٨:٠٠ صباحاً حتى ٦:٠٠ مساءً',
      bestTimeToVisit: 'أشهر الشتاء والربيع (نوفمبر إلى مارس) لطبيعة الواحات الصحراوية',
      entryFee: '٢٠ جنيهاً للمصريين / ١٠ جنيهات للطلاب / ٨٠ جنيهاً للأجانب',
      reservationRequired: false
    },
    visitDuration: 'من ساعتين إلى ٣ ساعات',
    access: {
      description: 'تقع القرية على بعد 32 كم شمال غرب مدينة موط (عاصمة مركز الداخلة)، عبر طريق الواحات المعبد.',
      transportation: 'سيارات ميكروباص من موقف موط، أو رحلات السفاري وسيارات الدفع الرباعي المنظمة.'
    },
    visitorServices: [
      { name: 'ورش الفخار والحديد التقليدي', description: 'مشاهدة حرفيي الفخار والحدادة التقليدية بأساليب متوارثة منذ العصر الأيوبي' },
      { name: 'معصرة الزيتون الخشبية التاريخية', description: 'زيارة معصرة الزيتون اليدوية ومطاحن الغلال الحجرية التاريخية' },
      { name: 'بيوت ضيافة بيئية (Eco-lodge)', description: 'نزل وإقامات بيئية مبنية من الطين وجذوع النخيل تقدم وجبات الواحات' }
    ],
    events: [
      {
        name: 'مهرجان عراجين الواحات والتمور بالقصر',
        description: 'احتفال بموسم جني البلح الواحاتي وعرض المشغولات اليدوية من سعف النخيل',
        date: 'أكتوبر سنوياً',
        duration: '٣ أيام',
        frequency: 'سنوي'
      }
    ]
  },
  'place-dendera': {
    address: {
      governorate: 'قنا',
      city: 'قنا',
      village: 'قرية دندرة - غرب النيل'
    },
    visitInfo: {
      openingHours: 'يومياً من ٧:٠٠ صباحاً حتى ٥:٠٠ مساءً',
      bestTimeToVisit: 'الصباح الباكر لمشاهدة انعكاس ألوان السقف الفلكي بأشعة الشمس الطبيعية',
      entryFee: '٤٠ جنيهاً للمصريين / ٢٠ جنيهاً للطلاب / ٣٠٠ جنيهاً للأجانب',
      reservationRequired: false
    },
    visitDuration: 'من ٢ إلى ٣ ساعات',
    access: {
      description: 'يقع غرب مدينة قنا بمسافة 5 كم بعد عبور كوبري النيل بقنا متجهاً إلى طريق دندرة الزراعي.',
      transportation: 'سيارات تاكسي من محطة قطار قنا، وميكروباصات خط قنا - دندرة المتوفرة على مدار اليوم.'
    },
    visitorServices: [
      { name: 'مسار الزيارة البانورامي للصعود للسطح', description: 'درج حجري أثري متاح للزوار للصعود لغرف السقف ومقصورة دائرة الأبراج' },
      { name: 'مركز الزوار وتوثيق الترميم', description: 'لوحات توضيحية لعمليات إزالة السناج واستعادة الألوان الحتحورية الأصلية' },
      { name: 'خدمات ذوي الهمم', description: 'ممرات تمهيدية ميسرة حتى بهو الأعمدة الحتحورية' }
    ],
    events: [
      {
        name: 'مهرجان دندرة للموسيقى والغناء',
        description: 'أمسيات غنائية وتراثية تنظمها وزارة الثقافة بساحة المعبد المفتوحة',
        date: 'شهر فبراير أو مارس',
        duration: '٣ ليالٍ',
        frequency: 'سنوي'
      }
    ]
  },
  'place-philae': {
    address: {
      governorate: 'أسوان',
      city: 'أسوان',
      village: 'جزيرة أجيليكا - خزان أسوان'
    },
    visitInfo: {
      openingHours: 'يومياً من ٧:٠٠ صباحاً حتى ٤:٠٠ مساءً',
      bestTimeToVisit: 'الصباح من ٨ إلى ١١، أو فترة ما قبل الغروب لمشاهدة النيل',
      entryFee: '٥٠ جنيهاً للمصريين / ٢٥ جنيهاً للطلاب / ٤٥٠ جنيهاً للأجانب (لا تشمل اللنش النيلي)',
      reservationRequired: false
    },
    visitDuration: 'من ساعتين ونصف إلى ٣ ساعات ونصف',
    access: {
      description: 'يتم الوصول إلى مرسى لنشات فيلة جنوب أسوان قرب السد القديم، ثم استقلال قارب نيلي لمدة 15 دقيقة للجزيرة.',
      transportation: 'تاكسي أو حافلة سياحية إلى مرسى الشلال، ثم قوارب نيلية بمحرك مرخصة لنقل الزوار.'
    },
    visitorServices: [
      { name: 'مرسى القوارب النيلية', description: 'مرسى منظم وآمن مع سترات نجاة لركاب القوارب المتجهة للجزيرة' },
      { name: 'عروض الصوت والضوء بجزيرة فيلة', description: 'عروض درامية صوتية مسائية تجسد أسطورة إيزيس وأوزيريس' },
      { name: 'كافيه نوبي مطل على خزان أسوان', description: 'مقهى واستراحة تراثية بوسط الجزيرة تقدم الشاي والكركديه الأسواني' }
    ],
    events: [
      {
        name: 'ملتقى أسوان الدولي لفن النحت والتراث',
        description: 'ورش فنية واستعراضات نوبية تحت سفح معبد إيزيس العظيم',
        date: 'فبراير سنوياً',
        duration: '٥ أيام',
        frequency: 'سنوي'
      }
    ]
  },
  'place-meidum': {
    address: {
      governorate: 'بني سويف',
      city: 'الواسطى',
      village: 'قرية ميدوم'
    },
    visitInfo: {
      openingHours: 'يومياً من ٨:٠٠ صباحاً حتى ٤:٠٠ عصراً',
      bestTimeToVisit: 'شهور الخريف والشتاء (أكتوبر حتى مارس)',
      entryFee: '٣٠ جنيهاً للمصريين / ١٥ جنيهاً للطلاب / ١٥٠ جنيهاً للأجانب',
      reservationRequired: false
    },
    visitDuration: 'من ساعة ونصف إلى ساعتين',
    access: {
      description: 'يقع غرب مدينة الواسطى بمسافة نحو 17 كم، ويمكن سلوك طريق القاهرة - أسيوط الغربي ثم مخرج ميدوم.',
      transportation: 'سيارات خاصة أو رحلات سياحية من بني سويف والقاهرة، أو سيارات أجرة من مركز الواسطى.'
    },
    visitorServices: [
      { name: 'دخول الممر الداخلي للهرم', description: 'ممر خشبي داخلي مزود بإنارة يتيح للزوار الوصول لحجرة الدفن المنحوتة' },
      { name: 'استراحة بيئية', description: 'مظلات خشبية ومقاعد مخصصة للراحة ومطلة على الهرم والمساطب المحيطة' }
    ],
    events: [
      {
        name: 'يوم التراث السويفي بميدوم',
        description: 'فعالية سنوية للمدارس والجامعات للتعريف بأول هرم مصري كامل البناء',
        date: 'أول نوفمبر',
        duration: 'يوم واحد',
        frequency: 'سنوي'
      }
    ]
  },
  'place-sannur': {
    address: {
      governorate: 'بني سويف',
      city: 'بني سويف',
      village: 'الصحراء الشرقية - وادي سنور'
    },
    visitInfo: {
      openingHours: 'يومياً من ٨:٣٠ صباحاً حتى ٣:٣٠ عصراً (يفضل التنسيق مع جهاز المحميات)',
      bestTimeToVisit: 'أشهر الاعتدال الحراري لتفادي برودة الصحراء شتاءً وحرارة الصيف',
      entryFee: '٢٥ جنيهاً للمصريين / ١٥ جنيهاً للطلاب / ١٠٠ جنيهاً للأجانب',
      reservationRequired: true
    },
    visitDuration: 'ساعتان إلى ٣ ساعات',
    access: {
      description: 'يقع في قلب الصحراء الشرقية جنوب شرق بني سويف بحوالي 70 كم، عبر المدق الصحراوي المتفرع من طريق الجيش/الكريمات.',
      transportation: 'سيارات دفع رباعي (4x4) ذات خلوص أرضي مناسب للمدقات الصخرية الصحراوية.'
    },
    visitorServices: [
      { name: 'دليل جيولوجي متخصص', description: 'مرافق معتمد من إدارة المحميات لشرح تكوينات الهوابط والصواعد الكارستية' },
      { name: 'مسار خشبي وإنارة داخلية', description: 'ممشى خشبي مؤمن داخل تجويف الكهف لحماية التكوينات الألباسترية النادرة' }
    ],
    events: [
      {
        name: 'اليوم العالمي للأرض ومحميات الصعيد',
        description: 'زيارات استكشافية ومخيمات علمية لشباب الجيولوجيا وعشاق الطبيعة',
        date: '٢٢ أبريل',
        duration: 'يومان',
        frequency: 'سنوي'
      }
    ]
  },
  'place-byad-monastery': {
    address: {
      governorate: 'بني سويف',
      city: 'بني سويف الشرقية',
      village: 'بياض العرب'
    },
    visitInfo: {
      openingHours: 'يومياً من ٦:٠٠ صباحاً حتى ٨:٠٠ مساءً',
      bestTimeToVisit: 'على مدار العام وخاصة أثناء صوم السيدة العذراء في شهر أغسطس',
      entryFee: 'مجاني للزيارة والتبرك',
      reservationRequired: false
    },
    visitDuration: 'ساعة إلى ساعتين',
    access: {
      description: 'يقع على الضفة الشرقية للنيل مواجهاً لمدينة بني سويف، بعد عبور كوبري النيل العلوي بمسافة 2 كم.',
      transportation: 'سيارات تاكسي من مدينة بني سويف وميكروباصات متجهة لحي بياض العرب والمنطقة الصناعية.'
    },
    visitorServices: [
      { name: 'مزار الكنيسة الأثرية', description: 'مزار روحي تاريخي من القرن الرابع الميلادي يضم أيقونات أثرية' },
      { name: 'بيوت مؤتمرات وضيافة', description: 'مباني فندقية ملحقة مجهزة لاستقبال الوفود والعائلات' },
      { name: 'مكتبة ومكتبة وسائط دينية', description: 'مكتبة للكتب التاريخية والتراثية القبطية والترانيم' }
    ],
    events: [
      {
        name: 'نهضة وموسم صوم السيدة العذراء ببياض',
        description: 'احتفالات روحية وتراثية يتوافد عليها عشرات الآلاف من أبناء الصعيد',
        date: 'من ٧ إلى ٢٢ أغسطس سنوياً',
        duration: '١٥ يوماً',
        frequency: 'سنوي'
      }
    ]
  },
  'place-amarna': {
    address: {
      governorate: 'المنيا',
      city: 'دير مواس',
      village: 'قرية تل العمارنة'
    },
    visitInfo: {
      openingHours: 'يومياً من ٨:٠٠ صباحاً حتى ٤:٣٠ مساءً',
      bestTimeToVisit: 'شهور الشتاء المعتدلة، في الصباح لزيارة المقابر الشمالية والجنوبية',
      entryFee: '٤٠ جنيهاً للمصريين / ٢٠ جنيهاً للطلاب / ٢٤٠ جنيهاً للأجانب',
      reservationRequired: false
    },
    visitDuration: 'من ٣ إلى ٥ ساعات',
    access: {
      description: 'تقع على الضفة الشرقية للنيل مواجهة لمدينة دير مواس. يتم العبور بالمعدية النيلية ثم استقلال سيارة داخلية.',
      transportation: 'معدية دير مواس النيلية ثم سيارات أجرة محلية للوصول إلى قصر إخناتون والمقابر الجبلية.'
    },
    visitorServices: [
      { name: 'مركز زوار تل العمارنة البريطاني المصري', description: 'متحف مصغر يعرض نماذج المدينة وتطور فن العمارنة التعبيري' },
      { name: 'خدمات الإرشاد الميداني', description: 'مرشدون أثريون لتوضيح بقايا القصور الملكية ومنازل النبلاء' }
    ],
    events: [
      {
        name: 'يوم إخناتون وفجر التوحيد التراثي',
        description: 'ندوات وفعاليات ثقافية تتناول الفن التعبيري وثورة إخناتون الدينية والفلسفية',
        date: 'شهر أكتوبر',
        duration: 'يومان',
        frequency: 'سنوي'
      }
    ]
  },
  'place-beni-hasan': {
    address: {
      governorate: 'المنيا',
      city: 'أبو قرقاص',
      village: 'قرية بني حسن الشروق'
    },
    visitInfo: {
      openingHours: 'يومياً من ٧:٣٠ صباحاً حتى ٤:٣٠ مساءً',
      bestTimeToVisit: 'أشهر الشتاء والربيع في الصباح الباكر',
      entryFee: '٤٠ جنيهاً للمصريين / ٢٠ جنيهاً للطلاب / ٢٠٠ جنيهاً للأجانب',
      reservationRequired: false
    },
    visitDuration: 'ساعتان إلى ٣ ساعات',
    access: {
      description: 'تقع شرق النيل على بعد 25 كم جنوب مدينة المنيا، ويتم الصعود إليها عبر درج حجري يطل على وادي النيل.',
      transportation: 'سيارات من مدينة المنيا أو أبو قرقاص عبر كوبري النيل، أو سيارات سياحية خاصة.'
    },
    visitorServices: [
      { name: 'درج حجري ومقاعد استراحة بانورامية', description: 'ممشى حجري للصعود إلى المقابر الجبلية مع إطلالة خلابة على نهر النيل والمزارع' },
      { name: 'لوحات تفسيرية لنقوش الرياضة والمصارعة', description: 'شاشات ولوحات تعريفية بالحركات الرياضية الفرعونية المنقوشة بجدران مقبرة خيتي وباقيت' }
    ],
    events: [
      {
        name: 'ملتقى الرياضات المصرية القديمة ببني حسن',
        description: 'عروض رياضية استعراضية للمصارعة والتحطيب مستوحاة من جداريات بني حسن الفرعونية',
        date: 'شهر نوفمبر',
        duration: 'يوم واحد',
        frequency: 'سنوي'
      }
    ]
  },
  'place-gabal-al-teir': {
    address: {
      governorate: 'المنيا',
      city: 'سمالوط',
      village: 'قرية جبل الطير الشرقية'
    },
    visitInfo: {
      openingHours: 'يومياً من ٦:٠٠ صباحاً حتى ٨:٠٠ مساءً',
      bestTimeToVisit: 'مايو أثناء مولد السيدة العذراء أو طوال أشهر الشتاء الهادئة',
      entryFee: 'مجاني للزيارة والتبرك',
      reservationRequired: false
    },
    visitDuration: 'ساعة ونصف إلى ساعتين ونصف',
    access: {
      description: 'يقع فوق قمة هضبة جبلية شرق النيل بمركز سمالوط، متصلاً بطريق كوبري سمالوط الجديد على النيل.',
      transportation: 'سيارات تاكسي وميكروباص من سمالوط أو مدينة المنيا عبر المحور الجديد شرق النيل.'
    },
    visitorServices: [
      { name: 'المغارة الأثرية للعائلة المقدسة', description: 'مغارة منحوتة بالصخر احتمت بها السيدة العذراء والسيد المسيح في رحلة الهروب' },
      { name: 'ممشى سياحي مطل على النيل', description: 'ممشى تم تطويره ضمن مشروع مسار رحلة العائلة المقدسة بمصر' },
      { name: 'فندق ونزل إقامة الزوار', description: 'أماكن مبيت واستراحات سياحية مجهزة' }
    ],
    events: [
      {
        name: 'احتفالات مولد العذراء بجبل الطير',
        description: 'واحد من أضخم التجمعات الشعبية والتراثية بمصر يجمع المسلمين والمسيحيين بأجواء صعيدية بهيجة',
        date: 'أواخر مايو سنوياً',
        duration: '٨ أيام',
        frequency: 'سنوي'
      }
    ]
  },
  'place-muharraq': {
    address: {
      governorate: 'أسيوط',
      city: 'القوصية',
      village: 'سفح جبل قسقام - مير'
    },
    visitInfo: {
      openingHours: 'يومياً من ٥:٣٠ صباحاً حتى ٧:٠٠ مساءً (مواعيد محددة في خلوات الرهبان والصوم الكبير)',
      bestTimeToVisit: 'أشهر الخريف والشتاء، وفترة احتفالات تدشين الكنيسة في أواخر يونيو',
      entryFee: 'مجاني للزيارة والتبرك',
      reservationRequired: false
    },
    visitDuration: 'ساعتان إلى ٣ ساعات',
    access: {
      description: 'يقع على بعد 12 كم غرب مدينة القوصية، و45 كم شمال غرب مدينة أسيوط عبر طريق أسيوط - القوصية الزراعي أو الصحراوي الغربي.',
      transportation: 'سيارات تاكسي من القوصية، أو سيارات ميكروباص مخصصة لدير المحرق من مواقف أسيوط والقوصية.'
    },
    visitorServices: [
      { name: 'كنيسة السيدة العذراء الأثرية الأولى', description: 'أقدم مذبح حجري دشن في المسيحية والمكان الذي مكثت به العائلة المقدسة أكثر من ستة أشهر' },
      { name: 'الحصن الأثري القديم', description: 'حصن بيزنطي من القرن السادس الميلادي متاح لمشاهدة عمارته من الخارج والداخل' },
      { name: 'مكتبة المخطوطات والكلية الإكليريكية', description: 'متحف مخطوطات قبطية نادرة ومكتبة دينية عريقة' },
      { name: 'مضايف ومطاعم الزوار', description: 'مضايف كبرى تقدم وجبات وخدمات ضيافة مجانية ومأجورة للرحلات' }
    ],
    events: [
      {
        name: 'موسم عيد تكريس كنيسة العذراء المحرق',
        description: 'احتفال ديني وتراثي حاشد يحيي ذكرى تأسيس أول كنيسة بالصعيد',
        date: 'من ٢١ إلى ٢٨ يونيو سنوياً',
        duration: 'أسبوع',
        frequency: 'سنوي'
      }
    ]
  },
  'place-dronka': {
    address: {
      governorate: 'أسيوط',
      city: 'أسيوط',
      village: 'قرية درنكة - الجبل الغربي'
    },
    visitInfo: {
      openingHours: 'يومياً من ٦:٠٠ صباحاً حتى ١٠:٠٠ مساءً',
      bestTimeToVisit: 'أغسطس في صوم العذراء، أو أوقات العصر والمغيب لمشاهدة إطلالة أسيوط كاملة من الجبل',
      entryFee: 'مجاني للزيارة والتبرك',
      reservationRequired: false
    },
    visitDuration: 'ساعتان',
    access: {
      description: 'يقع على سفح هضبة أسيوط الغربية على بعد نحو 10 كم جنوب غرب مدينة أسيوط.',
      transportation: 'سيارات تاكسي وميكروباصات متكررة من موقف المعلمين وميدان المجذوب بأسيوط مباشرة للجبل.'
    },
    visitorServices: [
      { name: 'مغارة الجبل الكبرى', description: 'مغارة فسيحة تتسع لآلاف الزوار تقع داخل حضن الجبل الغربي' },
      { name: 'فندق سياحي واستراحات', description: 'غرف فندقية مجهزة لإقامة الوافدين والعائلات ومطاعم وجبات جاهزة' },
      { name: 'مصاعد كهربائية وسلالم مجهزة', description: 'مصاعد تيسر وصول كبار السن وذوي الهمم إلى كناس المغارة العلوية' }
    ],
    events: [
      {
        name: 'مهرجان وموسم صوم العذراء بدرنكة',
        description: 'أكبر ملتقى شعبي وروحي بالصعيد يشارك فيه أكثر من مليوني زائر سنوياً بمواكب الأيقونات والشموع',
        date: 'من ٧ حتى ٢٢ أغسطس سنوياً',
        duration: '١٥ يوماً',
        frequency: 'سنوي'
      }
    ]
  },
  'place-merit-amun': {
    address: {
      governorate: 'سوهاج',
      city: 'أخميم',
      village: 'المدينة القديمة - منطقة المقابر بكوم الشقافة'
    },
    visitInfo: {
      openingHours: 'يومياً من ٨:٠٠ صباحاً حتى ٤:٠٠ عصراً',
      bestTimeToVisit: 'الصباح لمشاهدة براعة نحت الحجر الجيري الأبيض وتمثال رمسيس الثاني المجاور',
      entryFee: '٢٠ جنيهاً للمصريين / ١٠ جنيهات للطلاب / ٨٠ جنيهاً للأجانب',
      reservationRequired: false
    },
    visitDuration: 'ساعة إلى ساعة ونصف',
    access: {
      description: 'يقع وسط مدينة أخميم على بعد 5 كم شرق مدينة سوهاج، عبر كوبري أخميم على النيل.',
      transportation: 'سيارات ميكروباص من مجمع مواقف سوهاج إلى أخميم، أو تاكسي مباشر حتى منطقة المعبد المفتوح.'
    },
    visitorServices: [
      { name: 'متحف مفتوح للمنحوتات', description: 'ساحة عرض مفتوحة مجهزة بإضاءة حديثة وحواجز أمان للممشى' },
      { name: 'قرب ورش نسيج أخميم التراثية', description: 'إمكانية دمج الزيارة مع زيارة أنوال النسيج اليدوي والتلي بالمدينة' }
    ],
    events: [
      {
        name: 'يوم العروسة وميريت آمون التراثي',
        description: 'فعالية سنوية تسلط الضوء على ملابس المرأة الصعيدية وتاريخ الملكة ميريت آمون ابنة رمسيس الثاني',
        date: 'شهر مارس',
        duration: 'يوم واحد',
        frequency: 'سنوي'
      }
    ]
  },
  'place-white-monastery': {
    address: {
      governorate: 'سوهاج',
      city: 'سوهاج',
      village: 'سفح الجبل الغربي - إدفا'
    },
    visitInfo: {
      openingHours: 'يومياً من ٦:٠٠ صباحاً حتى ٦:٠٠ مساءً',
      bestTimeToVisit: 'أشهر الشتاء والربيع في الصباح الهادئ',
      entryFee: 'مجاني للزيارة',
      reservationRequired: false
    },
    visitDuration: 'ساعة ونصف إلى ساعتين',
    access: {
      description: 'يقع غرب مدينة سوهاج بمسافة نحو 8 كم على سفح الهضبة الغربية قرب قرية إدفا والدير الأحمر.',
      transportation: 'سيارات تاكسي من مدينة سوهاج، أو ميكروباصات خط إدفا - الجبل الغربي.'
    },
    visitorServices: [
      { name: 'عمارة الحجر الأبيض الفرعونية الفريدة', description: 'مشاهدة مبنى البازيليكا الضخم المشيد بأحجار جيرية فرعونية قديمة من عصر الملك رمسيس' },
      { name: 'استراحة الزوار ومكتبة الدير', description: 'استراحة هادئة ومكتبة توثق مؤلفات الأنبا شنودة رئيس المتوحدين في الأدب القبطي الصعيدي' }
    ],
    events: [
      {
        name: 'عيد القديس الأنبا شنودة رئيس المتوحدين',
        description: 'احتفال ديني وتراثي يحضره الآلاف من مختلف محافظات الصعيد',
        date: '١٤ يوليو سنوياً',
        duration: 'يومان',
        frequency: 'سنوي'
      }
    ]
  },
  'place-qenawi-mosque': {
    address: {
      governorate: 'قنا',
      city: 'قنا',
      village: 'ميدان سيدي عبد الرحيم القنائي - وسط المدينة'
    },
    visitInfo: {
      openingHours: 'مفتوح للصلوات والزيارات يومياً من صلاة الفجر حتى صلاة العشاء',
      bestTimeToVisit: 'يوم الجمعة وأمسيات شهر رمضان وموسم المولد في شهر شعبان',
      entryFee: 'مجاني',
      reservationRequired: false
    },
    visitDuration: 'ساعة إلى ساعتين',
    access: {
      description: 'يقع في قلب مدينة قنا بميدان سيدي عبد الرحيم القنائي الشهير المتفرع من شارع المحطة.',
      transportation: 'سيراً من محطة قطار قنا بمسافة 10 دقائق، أو عبر سيارات التاكسي والسرفيس الداخلي بالمدينة.'
    },
    visitorServices: [
      { name: 'مسجد تاريخي ومقام صوفي جليل', description: 'عمارة إسلامية مهيبة مع مئذنة شامخة وضريح القطب الصوفي عبد الرحيم القنائي' },
      { name: 'مركز ثقافي ومكتبة إسلامية', description: 'مكتبة كبرى تضم مخطوطات وكتباً في الفقه والتصوف وتاريخ الصعيد' },
      { name: 'ساحة رحبة ومرافق حديثة', description: 'ميدان فسيح ملحق به حدائق عامة ودورات مياه ومواقف سيارات' }
    ],
    events: [
      {
        name: 'مولد سيدي عبد الرحيم القنائي',
        description: 'من كبرى الاحتفالات التراثية والدينية بصعيد مصر بحلقات ذكر ومرماح خيل وأناشيد صوفية',
        date: 'النصف من شعبان سنوياً',
        duration: '١٠ أيام',
        frequency: 'سنوي'
      }
    ]
  },
  'place-valley-kings': {
    address: {
      governorate: 'الأقصر',
      city: 'القرنة',
      village: 'البر الغربي - وادي الملوك'
    },
    visitInfo: {
      openingHours: 'يومياً من ٦:٠٠ صباحاً حتى ٥:٠٠ مساءً',
      bestTimeToVisit: 'في الساعات الأولى من الصباح الباكر (٦ إلى ٩ صباحاً) لتفادي الزحام وحرارة الشمس',
      entryFee: '٦٠ جنيهاً للمصريين / ٣٠ جنيهاً للطلاب / ٦٠٠ جنيهاً للأجانب (تشمل زيارة ٣ مقابر رئيسية)',
      reservationRequired: false
    },
    visitDuration: 'من ٣ إلى ٤ ساعات',
    access: {
      description: 'يقع في عمق الهضبة الجيرية بالبر الغربي للأقصر على بعد 10 كم من النيل.',
      transportation: 'عبر المعدية النيلية من البر الشرقي ثم تاكسي، أو سيارات سياحية مكيفة عبر كوبري الأقصر العلوي.'
    },
    visitorServices: [
      { name: 'طفطف كهربائي صديق للبيئة', description: 'قطار كهربائي ينقل الزوار من مركز التذاكر إلى بداية وادي المقابر الملكية' },
      { name: 'مركز زوار بنماذج ثلاثية الأبعاد', description: 'شاشات عرض ونموذج مجسم ثلاثي الأبعاد لتوزيع المقابر الملكية تحت الأرض' },
      { name: 'مقابر إضافية خاصة (توت عنخ آمون وسيتي الأول)', description: 'إمكانية حجز تذاكر مقابر ملكية خاصة ونادرة تحت رقابة بيئية صارمة' }
    ],
    events: [
      {
        name: 'ذكرى اكتشاف مقبرة توت عنخ آمون',
        description: 'احتفال سنوي يسلط الضوء على اكتشافات هوارد كارتر والبعثات الأثرية العاملة بالوادي',
        date: '٤ نوفمبر سنوياً',
        duration: 'يوم واحد',
        frequency: 'سنوي'
      }
    ]
  },
  'place-hatshepsut': {
    address: {
      governorate: 'الأقصر',
      city: 'القرنة',
      village: 'الدير البحري - البر الغربي'
    },
    visitInfo: {
      openingHours: 'يومياً من ٦:٠٠ صباحاً حتى ٥:٠٠ مساءً',
      bestTimeToVisit: 'الصباح الباكر لمشاهدة إشراقة الشمس على واجهة المعبد المدرجة وسط صخور الجبل',
      entryFee: '٤٠ جنيهاً للمصريين / ٢٠ جنيهاً للطلاب / ٣٦٠ جنيهاً للأجانب',
      reservationRequired: false
    },
    visitDuration: 'ساعتان',
    access: {
      description: 'يقع أسفل الجرف الصخري بالدير البحري مجاوراً لوادي الملوك بالبر الغربي للأقصر.',
      transportation: 'سيارات سياحية أو تاكسي محلي من مرسى معدية القرنة، ويتوفر طفطف ينقل الزوار من البوابة للصرح.'
    },
    visitorServices: [
      { name: 'طفطف كهربائي لنقل الزوار', description: 'نقل مريح من شباك التذاكر وساحة البازارات إلى سفح الصرح المدرج' },
      { name: 'نقوش بعثة بلاد بونت التاريخية', description: 'ممرات ومصاطب مهيأة لمشاهدة أول توثيق مصري للرحلات التجارية إلى إفريقيا' },
      { name: 'كافتيريا وبازار هدايا الألباستر', description: 'سوق حرفيين لمنتجات الألباستر المنحوت يدوياً بقرية القرنة' }
    ],
    events: [
      {
        name: 'أوبرا عايدة بمعبد حتشبسوت',
        description: 'عروض أوبرالية وفنية عالمية تقدم بساحة المعبد التاريخية ذات الإضاءة الساحرة',
        date: 'مواسم متفرقة (أكتوبر - نوفمبر)',
        duration: '٣ ليالٍ',
        frequency: 'موسمي'
      }
    ]
  },
  'place-abu-simbel': {
    address: {
      governorate: 'أسوان',
      city: 'مدينة أبو سمبل السياحية',
      village: 'ضفاف بحيرة ناصر'
    },
    visitInfo: {
      openingHours: 'يومياً من ٥:٠٠ صباحاً حتى ٦:٠٠ مساءً',
      bestTimeToVisit: 'فبراير وأكتوبر لمشاهدة تعامد الشمس، أو شهور الشتاء للاستمتاع بنقاء بحيرة ناصر',
      entryFee: '٥٠ جنيهاً للمصريين / ٢٥ جنيهاً للطلاب / ٥٠٠ جنيهاً للأجانب',
      reservationRequired: false
    },
    visitDuration: 'من ساعتين ونصف إلى ٤ ساعات',
    access: {
      description: 'يقع على بعد 280 كم جنوب أسوان قرب الحدود السودانية على شاطئ بحيرة ناصر.',
      transportation: 'رحلات طيران يومية من مطار القاهرة وأسوان إلى مطار أبو سمبل، أو حافلات وسيارات سياحية عبر طريق أسوان - أبو سمبل الدولي المعبد.'
    },
    visitorServices: [
      { name: 'مركز توثيق إنقاذ المعبدين واليونسكو', description: 'معرض دائم يروي أكبر ملحمة هندسية لنقل وتفكيك المعبدين وحمايتهما من الغرق' },
      { name: 'عروض الصوت والضوء على بحيرة ناصر', description: 'عرض صوت وضوء ساحر باللغات المتعددة أمام التماثيل العملاقة لرمسيس ونفرتاري' },
      { name: 'فنادق ونزل سياحية بيئية', description: 'منتجعات وفنادق مطلة على البحيرة تقدم طعاماً نوبياً وصعيدياً أصيلاً' }
    ],
    events: [
      {
        name: 'مهرجان تعامد الشمس على تمثال رمسيس الثاني',
        description: 'حدث عالمي مهيب يتكرر مرتين فقط بالسنة حيث تخترق أشعة الفجر قدس الأقداس لتضيء وجه الفرعون',
        date: '٢٢ فبراير و ٢٢ أكتوبر سنوياً',
        duration: 'يومان',
        frequency: 'نصف سنوي'
      }
    ]
  },
  'place-west-suhail': {
    address: {
      governorate: 'أسوان',
      city: 'أسوان',
      village: 'قرية غرب سهيل النوبية - غرب النيل'
    },
    visitInfo: {
      openingHours: 'مفتوحة للزوار طوال اليوم، وأفضل أوقات النشاط من ١٠:٠٠ صباحاً حتى ١١:٠٠ مساءً',
      bestTimeToVisit: 'من شهر أكتوبر حتى أبريل في مواسم السياحة والطقس الدافئ',
      entryFee: 'دخول القرية مجاني (البيوت النوبية ومزارات التماسيح بأسعار رمزية)',
      reservationRequired: false
    },
    visitDuration: 'من ٣ إلى ٦ ساعات (أو إقامة ليلة كاملة)',
    access: {
      description: 'تقع على الضفة الغربية لنهر النيل شمال خزان أسوان القديم بحوالي 2 كم.',
      transportation: 'قوارب نيلية ولنشات شراعية من كورنيش أسوان (تجربة نيلية خلابة لمدة 30 دقيقة)، أو بالسيارة عبر كوبري الخزان.'
    },
    visitorServices: [
      { name: 'البيوت النوبية التقليدية وتربية التماسيح', description: 'دخول البيوت الملونة، تذوق شاي الجبنة، ورؤية أحواض التماسيح النيلية الأليفة' },
      { name: 'سوق العطارة والبخور والمشغولات النوبية', description: 'أطول بازار مفتوح للمشغولات اليدوية النوبية، الكركديه، الحناء، والبهارات الأسوانية' },
      { name: 'بيوت ضيافة وكافيهات نيلية', description: 'جلسات عصرية وتراثية مباشرة على شاطئ النيل الرملي الصافي' }
    ],
    events: [
      {
        name: 'مهرجان الأراجيد والغناء النوبي بغرب سهيل',
        description: 'أمسيات غنائية وإيقاعية نوبية على آلات الدف والطمبور مع رقصات الأراجيد التراثية',
        date: 'عطلات رأس السنة ومواسم الأعياد',
        duration: '٣ أيام',
        frequency: 'موسمي'
      }
    ]
  },
  'place-white-desert': {
    address: {
      governorate: 'الوادي الجديد',
      city: 'مركز الفرافرة',
      village: 'شمال واحة الفرافرة بمسافة 45 كم'
    },
    visitInfo: {
      openingHours: 'متاحة للرحلات المنظمة والتخييم السفاري بتصريح بيئي معتمد',
      bestTimeToVisit: 'من منتصف أكتوبر حتى أواخر أبريل، وتعتبر الليالي المقمرة الأجمل للتخييم ورؤية النجوم',
      entryFee: '٥٠ جنيهاً للمصريين / ٥ دولارات للأجانب (رسوم المحمية الطبيعية)',
      reservationRequired: true
    },
    visitDuration: 'يوم كامل أو ليلة تخييم سفاري',
    access: {
      description: 'تقع على جانبي طريق الواحات البحرية - الفرافرة، وتبعد نحو 500 كم عن القاهرة.',
      transportation: 'سيارات دفع رباعي مجهزة ومصحوبة بمرشدين وسائقين محترفين من واحة الفرافرة أو الواحات البحرية.'
    },
    visitorServices: [
      { name: 'مخيمات سفاري بيئية مؤمنة', description: 'تجهيزات خيام وفرش ومعدات تخييم كاملة مع إشعال حطب وأمسيات واحاتية' },
      { name: 'وجبات مدفونة بالرمال وشاي الحطب', description: 'تجربة تناول وجبات الفراخ والمندي المطهوة في باطن الرمال وشاي الأعشاب' },
      { name: 'مسارات تصوير الصخور الطباشيرية', description: 'جولات لتصوير صخرة الفطر، الفرخة، الجمل، وتكوينات الكالسيت الطبيعية النادرة' }
    ],
    events: [
      {
        name: 'مهرجان رصد الشهب وسياحة الفلك بالفرافرة',
        description: 'مخيمات رصد فلكي ورؤية مجرة درب التبانة وزخات الشهب في أكثر بقاع الأرض نقاءً للغلاف الجوي',
        date: 'أغسطس ونوفمبر سنوياً',
        duration: 'يومان',
        frequency: 'نصف سنوي'
      }
    ]
  },
  'place-hibis-temple': {
    address: {
      governorate: 'الوادي الجديد',
      city: 'الخارجة',
      village: 'شمال مدينة الخارجة بمسافة 2 كم'
    },
    visitInfo: {
      openingHours: 'يومياً من ٨:٠٠ صباحاً حتى ٤:٠٠ عصراً',
      bestTimeToVisit: 'فصل الشتاء والربيع صباحاً',
      entryFee: '٣٠ جنيهاً للمصريين / ١٥ جنيهاً للطلاب / ١٦٠ جنيهاً للأجانب',
      reservationRequired: false
    },
    visitDuration: 'ساعة ونصف إلى ساعتين',
    access: {
      description: 'يقع شمال مدينة الخارجة مباشرة بجوار مقابر البجوات الأثرية على طريق الخارجة - أسيوط.',
      transportation: 'سيارات تاكسي من مدينة الخارجة بمسافة 5 دقائق فقط.'
    },
    visitorServices: [
      { name: 'معبد فارسي مصري وحيد متكامل', description: 'المعبد الوحيد الباقي بحالة متكاملة من العصر الصاوي والفارسي بكرس للإله آمون' },
      { name: 'ممشى خشبي وبطاقات توضيحية', description: 'مسار مظلل ونظام مراقبة بيئية متطور للمحافظة على أحجار المعبد ونقوشه' }
    ],
    events: [
      {
        name: 'يوم الواحات الأثري بهيبس',
        description: 'جولات مدرسية وبحثية تستعرض تاريخ درب الأربعين وطرق القوافل التجارية القديمة بالواحات',
        date: 'شهر ديسمبر',
        duration: 'يوم واحد',
        frequency: 'سنوي'
      }
    ]
  },
  'place-asma-allah-alhusna': {
    address: {
      governorate: 'أسيوط',
      city: 'أسيوط',
      village: 'حي غرب - مدخل مدينة أسيوط'
    },
    visitInfo: {
      openingHours: 'ميدان ومعلم عام مفتوح للزيارة والتصوير على مدار ٢٤ ساعة',
      bestTimeToVisit: 'أوقات المساء والليل للاستمتاع بالإضاءة الجمالية والنافورات المحيطة',
      entryFee: 'مجاني للعامة',
      reservationRequired: false
    },
    visitDuration: 'نصف ساعة إلى ساعة',
    access: {
      description: 'يقع عند المدخل الرئيسي الحيوي لمدينة أسيوط رابطاً بين محاور الجامعة وكوبري أسيوط العلوي.',
      transportation: 'سيارات تاكسي، سرفيس داخلي، أو مشياً على الأقدام من منطقة الجامعة وميدان المجذوب.'
    },
    visitorServices: [
      { name: 'ساحات تنزه ومقاعد للمواطنين', description: 'مقاعد مريحة ومساحات خضراء تحيط بنصب أسماء الله الحسنى الفني المعماري' },
      { name: 'إضاءة ليلية متناسقة', description: 'نظام إضاءة فني يبرز الحروف العربية وزخارف أسماء الله الحسنى ليلاً' }
    ],
    events: [
      {
        name: 'احتفاليات ليالي رمضان التراثية بأسيوط',
        description: 'أجواء رمضانية واحتفالية وتجمع أهالي أسيوط في محيط الميدان والحدائق المجاورة',
        date: 'طوال شهر رمضان المبارك',
        duration: 'شهر كامل',
        frequency: 'سنوي'
      }
    ]
  },
  'place-alexan-pasha-palace': {
    address: {
      governorate: 'أسيوط',
      city: 'أسيوط',
      village: 'حي شرق - شارع كورنيش النيل'
    },
    visitInfo: {
      openingHours: 'من الخارج يومياً، وخلال فعاليات الترميم والمناسبات الرسمية لوزارة الآثار',
      bestTimeToVisit: 'فترة بعد العصر والمساء على كورنيش النيل بأسيوط',
      entryFee: 'حسب لوائح وزارة السياحة والآثار لمتاحف المحافظات',
      reservationRequired: false
    },
    visitDuration: 'ساعة إلى ساعتين',
    access: {
      description: 'يقع مباشرة على كورنيش النيل بأسيوط في منطقة مميزة بحي شرق بالقرب من ديوان عام المحافظة.',
      transportation: 'تاكسي أو سيراً على الأقدام لرواد كورنيش النيل بمدينة أسيوط.'
    },
    visitorServices: [
      { name: 'تحفة العمارة الأوروبية الكلاسيكية', description: 'مشاهدة طراز القصر الإيطالي المزدان بزخارف الباروك والروكوكو والزجاج الملون' },
      { name: 'مشروع تحويل القصر لمتحف قومي لأسيوط', description: 'معرض ومركز ثقافي يوثق تاريخ شخصيات أسيوط وعائلاتها العريقة' }
    ],
    events: [
      {
        name: 'أسبوع العمارة والتراث بأسيوط',
        description: 'معارض تصوير فوتوغرافي وندوات حول المباني التراثية والقصور التاريخية بالصعيد',
        date: 'شهر نوفمبر',
        duration: '٣ أيام',
        frequency: 'سنوي'
      }
    ]
  },
  'place-assiut-religious-institute': {
    address: {
      governorate: 'أسيوط',
      city: 'أسيوط',
      village: 'منطقة الحمراء - شارع المعهد الديني'
    },
    visitInfo: {
      openingHours: 'يومياً خلال ساعات العمل الأكاديمي والزيارات الميدانية من ٨:٣٠ صباحاً حتى ٣:٠٠ عصراً',
      bestTimeToVisit: 'أيام الأسبوع الدراسية ومعارض الأنشطة الثقافية للأزهر الشريف',
      entryFee: 'مجاني للزيارات التعليمية والثقافية بالتنسيق مع إدارة المعهد',
      reservationRequired: false
    },
    visitDuration: 'ساعة إلى ساعة ونصف',
    access: {
      description: 'يقع في منطقة الحمراء التاريخية بالقرب من محطة سكة حديد أسيوط بقلب المدينة القديمة.',
      transportation: 'سهل الوصول سيراً من محطة القطار أو بسيارات السرفيس والتاكسي المتوفرة بكثافة.'
    },
    visitorServices: [
      { name: 'طراز العمارة المملوكية والإسلامية الحديثة', description: 'أيقونة معمارية افتتحها الملك فؤاد الأول عام 1934 بأعمدة وقباب وزخارف أندلسية وإسلامية فريدة' },
      { name: 'المسجد الأثري والباحة التعليمية الفسيحة', description: 'مسجد فسيح ذو مئذنة رشيقة وقاعات تدريس تاريخية تخرج منها كبار علماء الصعيد ومصر' }
    ],
    events: [
      {
        name: 'احتفالية مئوية التعليم الأزهري بالصعيد',
        description: 'مؤتمرات فكرية ومعارض لمخطوطات الأزهر الشريف والعلماء الأعلام خريجي المعهد',
        date: 'شهر مارس',
        duration: 'يومان',
        frequency: 'سنوي'
      }
    ]
  }
};

/**
 * Safe and non-destructive schema migration for WAH Heritage Places.
 * Preserves 100% of existing database fields, values, IDs, and custom edits.
 * Enriches missing or unpopulated fields with structured authentic data.
 */
export async function runHeritagePlacesMigration(db: Db): Promise<{
  success: boolean;
  totalPlaces: number;
  migratedCount: number;
  alreadyUpToDateCount: number;
}> {
  try {
    const places = await db.collection<HeritagePlaceDoc>('wah_heritage_places').find({}).toArray();
    let migratedCount = 0;
    let alreadyUpToDateCount = 0;

    for (const place of places) {
      const enrichment = AUTHENTIC_PLACES_DATA[place.id];
      const updates: Partial<HeritagePlaceDoc> = {};

      // 1. address: preserve if existing, otherwise enrich or structure
      if (!place.address || (!place.address.city && !place.address.governorate)) {
        if (enrichment?.address) {
          updates.address = enrichment.address;
        } else {
          updates.address = {
            governorate: place.governorateName || '',
            city: place.locationName || place.governorateName || '',
            village: ''
          };
        }
      }

      // 2. visitInfo: preserve if existing, otherwise enrich or default
      if (!place.visitInfo || (!place.visitInfo.openingHours && !place.visitInfo.entryFee)) {
        if (enrichment?.visitInfo) {
          updates.visitInfo = enrichment.visitInfo;
        } else {
          updates.visitInfo = {
            openingHours: 'يومياً من ٨:٠٠ صباحاً حتى ٥:٠٠ مساءً',
            bestTimeToVisit: 'أشهر الشتاء والربيع المعتدلة',
            entryFee: 'تذاكر معتمدة وفق أسعار وزارة السياحة والآثار',
            reservationRequired: false
          };
        }
      }

      // 3. visitDuration: preserve if existing, otherwise enrich or default
      if (!place.visitDuration || place.visitDuration.trim() === '') {
        updates.visitDuration = enrichment?.visitDuration || 'ساعة إلى ساعتين';
      }

      // 4. access: preserve if existing, otherwise enrich or default
      if (!place.access || (!place.access.description && !place.access.transportation)) {
        if (enrichment?.access) {
          updates.access = enrichment.access;
        } else {
          updates.access = {
            description: `يقع المعلم في ${place.locationName || place.governorateName} عبر الطرق الرئيسية الممهدة.`,
            transportation: 'سيارات أجرة وحافلات محلية متوفرة من المراكز المجاورة.'
          };
        }
      }

      // 5. visitorServices: preserve if existing and non-empty, otherwise enrich or default
      if (!place.visitorServices || place.visitorServices.length === 0) {
        if (enrichment?.visitorServices && enrichment.visitorServices.length > 0) {
          updates.visitorServices = enrichment.visitorServices;
        } else {
          updates.visitorServices = [
            { name: 'لوحات إرشادية وتفسيرية', description: 'لوحات تعريفية بتاريخ المعلم ومسارات الزيارة' },
            { name: 'مواقف واستراحات للزوار', description: 'أماكن مخصصة لراحة الزوار ومواقف سيارات قريبة' }
          ];
        }
      }

      // 6. events: preserve if existing and non-empty, otherwise enrich or default
      if (!place.events || place.events.length === 0) {
        if (enrichment?.events && enrichment.events.length > 0) {
          updates.events = enrichment.events;
        } else {
          updates.events = [];
        }
      }

      // If any new fields need to be set in MongoDB, update with $set ONLY (never overwriting existing data)
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date().toISOString();
        await db.collection('wah_heritage_places').updateOne(
          { id: place.id },
          { $set: updates }
        );
        migratedCount++;

        // Keep memoryDb in sync as well
        const memIdx = memoryDb.heritagePlaces.findIndex((p) => p.id === place.id);
        if (memIdx >= 0) {
          memoryDb.heritagePlaces[memIdx] = {
            ...memoryDb.heritagePlaces[memIdx],
            ...updates
          };
        }
      } else {
        alreadyUpToDateCount++;
      }
    }

    Logger.info(`[Heritage Places Migration] Completed safely. Total: ${places.length}, Enriched/Migrated: ${migratedCount}, Already up to date: ${alreadyUpToDateCount}`);
    return {
      success: true,
      totalPlaces: places.length,
      migratedCount,
      alreadyUpToDateCount
    };
  } catch (error: any) {
    Logger.error('[Heritage Places Migration] Error during safe migration:', error);
    return {
      success: false,
      totalPlaces: 0,
      migratedCount: 0,
      alreadyUpToDateCount: 0
    };
  }
}
