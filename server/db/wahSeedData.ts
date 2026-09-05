import type {
  GovernorateDoc,
  HeritagePlaceDoc,
  CulturalCraftDoc,
  WahStoryDoc,
  LocalPersonDoc,
  UpperEgyptFoodDoc,
  CulturalEventDoc,
  CityDoc,
  VillageDoc,
  CulturalTraditionDoc,
  PlatformSettingsDoc
} from '../models/types.ts';

export const INITIAL_GOVERNORATES: GovernorateDoc[] = [
  {
    id: 'gov-fayoum',
    name: 'الفيوم',
    slug: 'fayoum',
    nickname: 'واحة الصعيد الخضراء وأرض السواقي',
    region: 'شمال الصعيد',
    nileSegment: 'بحر يوسف وبحيرة قارون وسواقي الهدير',
    shortIntro: 'واحة طبيعية وأثرية فريدة تحتضن قرية تونس لصناعة الخزف ووادي الحيتان أقدم التراث الطبيعي العالمي في مصر.',
    history: 'أقدم منخفض طبيعي استصلحه ملوك الفراعنة في عصر الدولة الوسطى (الملك أمنمحات الثالث)، مشتهرة بسواقي الهدير التي ابتكرت في العصر البطلمي لرفع مياه بحر يوسف المتفرع من النيل، وقرية تونس رائدة الخزف الفني في الشرق الأوسط.',
    famousFor: ['قرية تونس للخزف', 'وادي الحيتان ووادي الريان', 'سواقي الهدير بالفيوم', 'بحيرة قارون', 'الفطير المشلتت والبط الفيومي'],
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80'
    ],
    capitalCity: 'مدينة الفيوم',
    mapCoordinates: { lat: 29.3084, lng: 30.8428 },
    traditionalCraftsIds: ['craft-pottery', 'craft-kilim', 'craft-palm'],
    traditionalFoodIds: ['food-feteer', 'food-mesh'],
    culturalTraditions: ['مهرجان الخزف الدولي بقرية تونس', 'مواسم صيد بحيرة قارون', 'التحطيب وأغاني الحصاد'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'gov-bani-suef',
    name: 'بني سويف',
    slug: 'bani-suef',
    nickname: 'بوابة الصعيد ولؤلؤة النيل الوسطى',
    region: 'شمال الصعيد',
    nileSegment: 'مجرى النيل الأوسط وبساتين ميدوم',
    shortIntro: 'بوابة صعيد مصر الشمالية، تجمع بين عبق الأهرامات المبكرة وسحر النيل وسهول الزراعة الخصبة والنباتات العطرية.',
    history: 'تمتلك بني سويف عمقاً حضارياً يمتد لعصور ما قبل الأسرات وعصر الدولة القديمة حيث هرم ميدوم العريق الذي يمثل حلقة الوصل المعمارية بين الهرم المدرج والأهرامات الكاملة، كما شهدت ازدهاراً صناعياً وتجارياً عبر محطات نهر النيل التاريخية.',
    famousFor: ['هرم ميدوم', 'محمية كهف وادي سنور', 'النباتات الطبية والعطرية', 'صناعات الفخار اليدوي', 'الأقمشة الشعبية'],
    coverImage: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&auto=format&fit=crop&q=80'
    ],
    capitalCity: 'مدينة بني سويف',
    mapCoordinates: { lat: 29.0661, lng: 31.0994 },
    traditionalCraftsIds: ['craft-pottery', 'craft-palm'],
    traditionalFoodIds: ['food-fayesh', 'food-mesh'],
    culturalTraditions: ['مواسم حصاد النباتات العطرية', 'السامر والتحطيب بالسويفي', 'إنشاد المديح النبوي'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'gov-minya',
    name: 'المنيا',
    slug: 'minya',
    nickname: 'عروس الصعيد وعاصمة التوحيد والفكر',
    region: 'وسط الصعيد',
    nileSegment: 'كورنيش عروس الصعيد الممتد',
    shortIntro: 'عروس الصعيد وأرض التوحيد، مهد ثورة إخناتون الفنية والفكرية في تل العمارنة وكنوز بني حسن الخالدة.',
    history: 'حاضرة مصر الوسطى ومركزها الفكري في عهد إخناتون ونفرتيتي، حيث تأسست أخت أتون (تل العمارنة). تزخر المنيا بمقابر بني حسن المنحوتة في الصخر، ودير السيدة العذراء بجبل الطير الذي استقبل العائلة المقدسة في رحلتها التاريخية.',
    famousFor: ['تل العمارنة', 'مقابر بني حسن', 'دير جبل الطير', 'تونة الجبل', 'العسل الأسود والملوخية البورانية'],
    coverImage: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566192091743-5966a6079984?w=800&auto=format&fit=crop&q=80'
    ],
    capitalCity: 'مدينة المنيا',
    mapCoordinates: { lat: 28.1099, lng: 30.7503 },
    traditionalCraftsIds: ['craft-woodwork', 'craft-kilim'],
    traditionalFoodIds: ['food-molokhia-minya', 'food-black-honey'],
    culturalTraditions: ['احتفالات مولد العذراء بجبل الطير', 'فن الواو المنياوي', 'أغاني النيل وسواقي المنيا'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'gov-asyut',
    name: 'أسيوط',
    slug: 'asyut',
    nickname: 'قلب الصعيد النابض وعاصمة التلي الرفيع',
    region: 'وسط الصعيد',
    nileSegment: 'قناطر أسيوط التاريخية ومحطة الأربعين',
    shortIntro: 'قلب الصعيد النابض وعاصمته التجارية عبر درب الأربعين، موطن فن التلي النادر والسجاد الصوف والكليم الأصيل.',
    history: 'كانت أسيوط (سيوط القديمة) مركز حراسة حدود مصر الوسطى ومحطة القوافل التجارية الكبرى القادمة من قلب أفريقيا عبر درب الأربعين. توارثت أسيوط فن التطريز بخيوط الفضة والذهب على قماش الشبيكة (التلي الأسيوطي) المسجل عالمياً كتراث فريد.',
    famousFor: ['فن التلي الأسيوطي', 'الدير المحرق بالقوصية', 'قناطر أسيوط التاريخية', 'وكالة شلبي للتوابل', 'صناعة السجاد اليدوي'],
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80'
    ],
    capitalCity: 'مدينة أسيوط',
    mapCoordinates: { lat: 27.1809, lng: 31.1837 },
    traditionalCraftsIds: ['craft-tally', 'craft-carpet-wool', 'craft-pottery'],
    traditionalFoodIds: ['food-bessara', 'food-shamsi-bread'],
    culturalTraditions: ['أعراس التلي وحلي العروسة الأسيوطية', 'ليالي السيرة الهلالية', 'مجالس المصالحات العرفية'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'gov-sohag',
    name: 'سوهاج',
    slug: 'sohag',
    nickname: 'معقل النسيج والحرير ومهد ملوك مصر',
    region: 'جنوب الصعيد',
    nileSegment: 'منحنى النيل بسوهاج وجزر الزهور',
    shortIntro: 'أرض المواويل والنسيج اليدوي بأخميم، مستودع الحكمة والآثار بأبيدوس ومعبد سيتي الأول الأسطوري.',
    history: 'سوهاج هي أرض الملوك، منها خرج مينا موحد القطرين، وتحتضن أبيدوس أقدس بقاع مصر القديمة حيث دفن أوزوريس ومعبد سيتي الأول ذو النقوش الأكثر نقاءً في تاريخ العمارة المصرية. تشتهر أخميم بلقب مانشستر ما قبل التاريخ بفضل أنوال الحرير والكتان المتوارثة لآلاف السنين.',
    famousFor: ['معبد أبيدوس', 'أنوال النسيج بأخميم', 'الدير الأبيض والدير الأحمر', 'تمثال ميريت آمون', 'الكليم السوهاجي'],
    coverImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop&q=80'
    ],
    capitalCity: 'مدينة سوهاج',
    mapCoordinates: { lat: 26.5569, lng: 31.6948 },
    traditionalCraftsIds: ['craft-textile-akhmeem', 'craft-kilim'],
    traditionalFoodIds: ['food-weka', 'food-shamsi-bread'],
    culturalTraditions: ['جلسات المربعات الشعرية وفن النميم', 'مواسم غزل الكتان والحرير', 'حلقات التحطيب في الموالد'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'gov-qena',
    name: 'قنا',
    slug: 'qena',
    nickname: 'أرض القلال القناوية والفركة والكركديه',
    region: 'جنوب الصعيد',
    nileSegment: 'ثنية قنا العظمى ملتقى الصحراء والبحر',
    shortIntro: 'مهد الفخار والقناوي الأصيل، حامية معبد حتحور بدندرة وواحة القصب الأخضر والصناعات الحرفية المتجذرة.',
    history: 'تمثل قنا عقدة النيل حيث يلتف النهر في ثنية قنا الشهيرة لتلتقي طرق البحر الأحمر والصحراء الشرقية. تشتهر دندرة بمعبد الإلهة حتحور ربة الفنون والموسيقى، وتشتهر قرية الجرادسة ودندرة وقوص بصناعة القلل والجرار الفخارية الفريدة من نوعها بفضل خصائص طميها النيلي المميز.',
    famousFor: ['معبد دندرة', 'فخار قنا والقلل القناوي', 'قصب السكر والعسل الأسود', 'مسجد سيدي عبد الرحيم القناوي', 'تطريز الفركا بنقادة'],
    coverImage: 'https://images.unsplash.com/photo-1599833975787-5c143f373c30?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1599833975787-5c143f373c30?w=800&auto=format&fit=crop&q=80'
    ],
    capitalCity: 'مدينة قنا',
    mapCoordinates: { lat: 26.1551, lng: 32.716 },
    traditionalCraftsIds: ['craft-pottery', 'craft-ferka-naqada'],
    traditionalFoodIds: ['food-keshkesh', 'food-black-honey'],
    culturalTraditions: ['ليلة القناوي والإنشاد الصوفي', 'سباقات الخيل والمرماح بالصعيد', 'أهازيج عصير القصب'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'gov-luxor',
    name: 'الأقصر',
    slug: 'luxor',
    nickname: 'طيبة عاصمة العالم القديم ومدينة الشمس',
    region: 'جنوب الصعيد',
    nileSegment: 'ضفتي طيبة الخالدتين وجبال وادي الملوك',
    shortIntro: 'عاصمة التاريخ الإنساني وطيبة العظمى، موطن ثلث آثار العالم وأعظم نَحّاتي حجر الألباستر ومتاحف الهواء الطلق.',
    history: 'طيبة عاصمة الإمبراطورية المصرية القديمة وعصرها الذهبي. تضم معابد الكرنك والأقصر، ووادي الملوك والملكات، ومعبد حتشبسوت في الدير البحري. توارثت أجيال الحرفيين في القرنة غرب الأقصر فنون نحت حجر الألباستر الشفاف والبردي المزين بالهيروغليفية.',
    famousFor: ['معابد الكرنك والأقصر', 'وادي الملوك والملكات', 'نحت الألباستر بالقرنة', 'البالون الطائر', 'ورق البردي اليدوي'],
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80'
    ],
    capitalCity: 'مدينة الأقصر',
    mapCoordinates: { lat: 25.6872, lng: 32.6396 },
    traditionalCraftsIds: ['craft-alabaster', 'craft-papyrus'],
    traditionalFoodIds: ['food-taameya-luxor', 'food-shamsi-bread'],
    culturalTraditions: ['احتفالات مولد سيدي أبو الحجاج الأقصري', 'موسيقى الربابة الصعيدي', 'كرنفالات المراكب النيلية'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'gov-aswan',
    name: 'أسوان',
    slug: 'aswan',
    nickname: 'بلاد الذهب وموئل السحر النوبي الخالد',
    region: 'جنوب الصعيد',
    nileSegment: 'شلال النيل الأول وبحيرة ناصر العظيمة',
    shortIntro: 'بلاد الذهب وسحر النوبة الخالد، واحة التوابل والكركديه، ومنبت صناعات الخوص والجريد والخرز الإفريقي البديع.',
    history: 'سونو (السوق القديمة) عند الشلال الأول لنهر النيل، البوابة الإستراتيجية لمصر نحو إفريقيا ومحجر الجرانيت الوردي لمسلات الفراعنة. تتميز أسوان بالثقافة النوبية العريقة بمنازلها الملونة وقراها التراثية كغرب سهيل وهيسا، ومعبد فيلة الرومانسي وأبو سمبل الصخري.',
    famousFor: ['معبد فيلة وأبو سمبل', 'قرى النوبة وغرب سهيل', 'شغل الخوص والخرز النوبي', 'سوق التوابل والكركديه الأسواني', 'جزيرة النباتات ومحمية سالوجا وغزال'],
    coverImage: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&auto=format&fit=crop&q=80'
    ],
    capitalCity: 'مدينة أسوان',
    mapCoordinates: { lat: 24.0889, lng: 32.8998 },
    traditionalCraftsIds: ['craft-nubian-beads', 'craft-palm', 'craft-kilim'],
    traditionalFoodIds: ['food-karkadeh', 'food-shamsi-bread'],
    culturalTraditions: ['الأعراس النوبية ورقصة الأراجيد', 'أغاني الطمبور النوبي', 'سباقات الفلوكة الشراعية'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'gov-new-valley',
    name: 'الوادي الجديد',
    slug: 'new-valley',
    nickname: 'واحات الأساطير وكنوز الصحراء الغربية',
    region: 'الواحات والصحراء الغربية',
    nileSegment: 'درب الأربعين الواصل إلى وادي النيل',
    shortIntro: 'واحات الصحراء الغربية الساحرة (الخارجة، الداخلة، الفرافرة)، جنة النخيل وصناعة الأواني الخزفية والرمال البيضاء.',
    history: 'تمثل واحات الوادي الجديد كنزاً أثرياً وطبيعياً فريداً، حيث مدينة القصر الإسلامية المبنية بالطوب اللبن منذ القرون الوسطى، ومعبد هيبس الفرعوني بالخارجة، والصحراء البيضاء بفرافرة. يعتمد أهالي الواحات على النخيل في كل تفاصيل حياتهم من خوص وأثاث وسلال وتمر واحاتي فاخر.',
    famousFor: ['مدينة القصر الإسلامية', 'الصحراء البيضاء بالفرارة', 'تمور الواحات وسلال الخوص', 'معبد هيبس', 'الخزف الواحاتي والعيون الكبريتية'],
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80'
    ],
    capitalCity: 'مدينة الخارجة',
    mapCoordinates: { lat: 25.4514, lng: 30.5464 },
    traditionalCraftsIds: ['craft-palm', 'craft-pottery', 'craft-kilim'],
    traditionalFoodIds: ['food-dates-oasis', 'food-fayesh'],
    culturalTraditions: ['مهرجان جني التمور بالواحات', 'جلسات السمر البدوي بالصحراء', 'موسيقى المقرونة الواحاتية'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

export const INITIAL_HERITAGE_PLACES: HeritagePlaceDoc[] = [
  {
    id: 'place-meidum',
    title: 'هرم ميدوم وفجر الهندسة المصرية',
    slug: 'meidum-pyramid',
    governorateId: 'gov-bani-suef',
    governorateName: 'بني سويف',
    category: 'temple',
    description: 'الهرم الفريد الذي شيده الملك حوني وأكمله سنفرو، يمثل حلقة الوصل المعمارية بين الهرم المدرج والأهرامات الكاملة.',
    history: 'شُيد قبل أكثر من 4600 عام، وتعتبر مصاطبه الصخرية الثلاث من أعظم شواهد التطور الهندسي المصري القديم في قلب محافظة بني سويف.',
    significance: 'أول محاولة لبناء هرم ذي أوجه ملساء، وتحيط به مقابر أمراء الدولة القديمة ونقوش أوز ميدوم الشهيرة بمتحف الآثار.',
    locationName: 'مركز الواسطى، شمال محافظة بني سويف',
    coverImage: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&auto=format&fit=crop&q=80'
    ],
    coordinates: { lat: 29.2605, lng: 31.1578 },
    isFeatured: true,
    rating: 4.8,
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'place-sannur',
    title: 'محمية كهف وادي سنور الكارستي',
    slug: 'sannur-cave',
    governorateId: 'gov-bani-suef',
    governorateName: 'بني سويf',
    category: 'nature',
    description: 'كهف جيولوجي فريد ونادر عالمياً يمتلئ بالهوابط والصواعد الكالسيتية البديعة التي تشكلت عبر ملايين السنين في قلب الصحراء الشرقية.',
    history: 'يعود تكوينه الجيولوجي لأكثر من 65 مليون سنة إثر ذوبان الحجر الجيري بواسطة المياه الجوفية، ويمتد لمسافة تزيد عن 700 متر باطن الأرض.',
    significance: 'أحد أندر كهفين كارستيين مسجلين على مستوى كوكب الأرض مع كهف فيرجينيا بالولايات المتحدة.',
    locationName: 'جنوب شرق بني سويف، الصحراء الشرقية',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80'
    ],
    coordinates: { lat: 28.9167, lng: 31.2833 },
    isFeatured: true,
    rating: 4.7,
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'place-amarna',
    title: 'تل العمارنة (أخت أتون عاصمة التوحيد)',
    slug: 'tell-el-amarna',
    governorateId: 'gov-minya',
    governorateName: 'المنيا',
    category: 'temple',
    description: 'العاصمة الفكرية والفنية التي أسسها الملك إخناتون والملكة نفرتيتي، مهد ثورة الفن المصري القديم وعبادة قرص الشمس أتون.',
    history: 'تأسست عام 1346 قبل الميلاد على ضفة النيل الشرقية بالمنيا، وشهدت خروج الفنان المصري من القوالب التقليدية إلى الواقعية الإنسانية الشفافة.',
    significance: 'تحتضن القصر الشمالي ومقابر النبلاء وقصر نفرتيتي الذي عُثر فيه على رأسها الأيقوني الخالد.',
    locationName: 'دير مواس، جنوب محافظة المنيا',
    coverImage: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&auto=format&fit=crop&q=80'
    ],
    coordinates: { lat: 27.6469, lng: 30.9022 },
    isFeatured: true,
    rating: 4.9,
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'place-beni-hasan',
    title: 'مقابر بني حسن المنحوتة في الجبل',
    slug: 'beni-hasan-tombs',
    governorateId: 'gov-minya',
    governorateName: 'المنيا',
    category: 'tomb',
    description: '39 مقبرة صخرية لحكام الإقليم في عهد الدولة الوسطى، وتتميز برسوم ألعاب المصارعة والرياضة والوفود التجارية القديمة.',
    history: 'تعود للأسر الحادية عشرة والثانية عشرة (حوالي 2000 ق.م)، وتتميز بنقوش جدارية تحكي تفاصيل الحياة اليومية والزراعة والصيد والألعاب الأولمبية الفرعونية.',
    significance: 'أدق توثيق لرياضات الفروسية والجمباز والمصارعة الفرعونية القديمة بنقوشها الملونة الزاهية.',
    locationName: 'أبو قرقاص، الضفة الشرقية للنيل، المنيا',
    coverImage: 'https://images.unsplash.com/photo-1566192091743-5966a6079984?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566192091743-5966a6079984?w=800&auto=format&fit=crop&q=80'
    ],
    coordinates: { lat: 27.9300, lng: 30.8717 },
    isFeatured: true,
    rating: 4.8,
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'place-muharraq',
    title: 'الدير المحرق العامر (جبل قسقام)',
    slug: 'muharraq-monastery',
    governorateId: 'gov-asyut',
    governorateName: 'أسيوط',
    category: 'monastery',
    description: 'أقدس محطات العائلة المقدسة في مصر، حيث مكثت فيه أكثر من ستة أشهر في الكنيسة الأثرية القديمة المشيدة بالحجارة اللبنة.',
    history: 'يعد من أقدم الأديرة المأهولة في العالم، ويضم الكنيسة الأثرية التي دُشنت بيد المسيح حسب المعتقد القبطي وحصناً أثرياً شُيد لصد غارات الصحراء.',
    significance: 'يطلق عليه "أورشليم الثانية"، ويضم أكبر مكتبة للمخطوطات القبطية والعربية النادرة بالصعيد.',
    locationName: 'مركز القوصية، غرب النيل، أسيوط',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'
    ],
    coordinates: { lat: 27.4600, lng: 30.8100 },
    isFeatured: true,
    rating: 4.9,
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'place-abydos',
    title: 'معبد أبيدوس وأوزيريون سيتي الأول',
    slug: 'abydos-temple',
    governorateId: 'gov-sohag',
    governorateName: 'سوهاج',
    category: 'temple',
    description: 'أقدس بقاع مصر القديمة، المعبد الجنائزي للفرعون سيتي الأول الذي يضم قائمة ملوك مصر الشهيرة ومبنى الأوزيريون الغامض.',
    history: 'كانت أبيدوس مركز عبادة الإله أوزيريس حيث كان يحج إليها المصريون القدماء. نقوش جدران معبد سيتي الأول تعتبر أدق نقوش بارزة مكتملة في الحضارة الفرعونية.',
    significance: 'يحتوي على قائمة أبيدوس للملوك التي أرخت 76 ملكاً من ملوك مصر، ويمثل قمة الفن التشكيلي والمعماري الدقيق.',
    locationName: 'مركز البلينا، جنوب محافظة سوهاج',
    coverImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop&q=80'
    ],
    coordinates: { lat: 26.1844, lng: 31.9189 },
    isFeatured: true,
    rating: 5.0,
    relatedCrafts: ['نسيج أخميم اليدوي', 'الكليم السوهاجي'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'place-merit-amun',
    title: 'تمثال الأميرة ميريت آمون بأخميم',
    slug: 'merit-amun-statue',
    governorateId: 'gov-sohag',
    governorateName: 'سوهاج',
    category: 'museum',
    description: 'أطول وأجمل تمثال لملكة مصرية يقف شامخاً في الهواء الطلق، ابنة رمسيس الثاني وزوجته الملكية الكبرى ذات الملامح الآسرة.',
    history: 'اكتُشف التمثال المنحوت من الحجر الجيري الأبيض عام 1981 أثناء حفر أساسات معبد أخميم القديم، ويبلغ ارتفاعه قرابة 12 متراً.',
    significance: 'أكبر تمثال لامرأة في الحضارة الفرعونية القديمة وتعتبر رمزاً أثرياً لمحافظة سوهاج.',
    locationName: 'مدينة أخميم، شرق النيل، سوهاج',
    coverImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop&q=80'
    ],
    coordinates: { lat: 26.5640, lng: 31.7450 },
    isFeatured: true,
    rating: 4.8,
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'place-dendera',
    title: 'معبد دندرة المركب (معبد حتحور)',
    slug: 'dendera-temple',
    governorateId: 'gov-qena',
    governorateName: 'قنا',
    category: 'temple',
    description: 'أحد أروع وأكمل المعابد المصرية القديمة حفظاً لنقوشه وألوانه الزرقاء الساحرة، مكرس لحتحور ربة الحب والجمال والموسيقى والخصوبة.',
    history: 'شُيد المعبد في العصر البطلمي واكتمل في عهد الرومان، ويشتهر بسقفه الفلكي الفريد ونقوش الأبراج الفلكية، بالإضافة إلى سراديب باطنية ونقوش مصابيح دندرة المثيرة للإعجاب.',
    significance: 'يتميز بأعمدته الحتحورية ذات الوجوه الأربعة التي ترمز لجهات الأرض الأربع واحتفاظه بنقاء ألوانه الطبيعية بعد آلاف السنين.',
    locationName: 'قرية دندرة، غرب قنا، على بعد 4 كم من مدينة قنا',
    coverImage: 'https://images.unsplash.com/photo-1599833975787-5c143f373c30?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1599833975787-5c143f373c30?w=800&auto=format&fit=crop&q=80'
    ],
    coordinates: { lat: 26.1422, lng: 32.6703 },
    isFeatured: true,
    rating: 5.0,
    relatedCrafts: ['فخار قنا والقلل', 'النقش على الأحجار'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'place-karnak',
    title: 'مجمع معابد الكرنك العظيم',
    slug: 'karnak-temples',
    governorateId: 'gov-luxor',
    governorateName: 'الأقصر',
    category: 'temple',
    description: 'أكبر دار عبادة دينية شيدتها البشرية عبر التاريخ، معبد الإله آمون رع وقاعة الأعمدة الكبرى ذات الـ 134 عموداً عملاقاً.',
    history: 'استمر بناؤه وتوسعته لأكثر من ألفي عام من عهد الدولة الوسطى وحتى العصر البطلمي، ليكون وثيقة معمارية لحضارة مصر القديمة بأكملها.',
    significance: 'أكبر مجمع ديني في العالم، يربطه طريق الكباش التاريخي بمعبد الأقصر على امتداد 2.7 كيلومتر.',
    locationName: 'مدينة الأقصر، البر الشرقي للنيل',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80'
    ],
    coordinates: { lat: 25.7188, lng: 32.6573 },
    isFeatured: true,
    rating: 5.0,
    relatedCrafts: ['نحت الألباستر', 'ورق البردي'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'place-valley-kings',
    title: 'وادي الملوك ومقابر الفراعنة',
    slug: 'valley-of-the-kings',
    governorateId: 'gov-luxor',
    governorateName: 'الأقصر',
    category: 'tomb',
    description: 'المقبرة الإمبراطورية العظمى المحفورة في قلب الصخر بجبل القرنة، موطن مقبرة توت عنخ آمون وسيتي الأول ورمسيس السادس.',
    history: 'استخدم لأكثر من 500 عام في عصر الدولة الحديثة لدفن ملوك مصر، ويضم أكثر من 60 مقبرة ملكية تزخر بنصوص كتاب الموتى ورسوم الرحلة إلى الأبدية.',
    significance: 'أعظم موقع للتراث الجنائزي على سطح الأرض، ومصدر روائع الكنوز الذهبية للمتحف المصري.',
    locationName: 'البر الغربي للنيل، الأقصر',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80'
    ],
    coordinates: { lat: 25.7402, lng: 32.6014 },
    isFeatured: true,
    rating: 5.0,
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'place-philae',
    title: 'معبد فيلة جزيرة إيزيس',
    slug: 'philae-temple',
    governorateId: 'gov-aswan',
    governorateName: 'أسوان',
    category: 'temple',
    description: 'جوهرة النيل وجزيرة الحب والجمال، المعبد الذي أنقذته اليونسكو من الغرق بعد بناء السد العالي ونُقل إلى جزيرة أجيليكا.',
    history: 'شيد المعبد لعبادة الربة إيزيس واستمر مقصداً للعبادة حتى عهد الإمبراطور جستنيان، ويتميز بمقصورة تراجان الشهيرة وأعمدته النيلية البديعة.',
    significance: 'آخر معقل للغة الهيروغليفية في التاريخ حيث تم تسجيل آخر نقش هيروغليفي معروف على أحد جدرانه عام 394 ميلادية.',
    locationName: 'جزيرة أجيليكا، بحيرة أسوان، محافظة أسوان',
    coverImage: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&auto=format&fit=crop&q=80'
    ],
    coordinates: { lat: 24.0253, lng: 32.8842 },
    isFeatured: true,
    rating: 4.9,
    relatedCrafts: ['الخوص والجريد النوبي', 'شغل الخرز والتمائم'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'place-abu-simbel',
    title: 'معبد أبو سمبل العظيم لرمسيس الثاني',
    slug: 'abu-simbel-temples',
    governorateId: 'gov-aswan',
    governorateName: 'أسوان',
    category: 'temple',
    description: 'المعجزة المعمارية المنحوتة في الصخر على ضفاف بحيرة ناصر، حيث تتعامد الشمس مرتين سنوياً على قدس أقداس رمسيس الثاني.',
    history: 'شُيد قبل أكثر من 3200 عام لتخليد نصر معركة قادش وحماية الحدود الجنوبية، ونُقل بالكامل في أضخم عملية إنقاذ آثاري في التاريخ بقيادة اليونسكو.',
    significance: 'تتعامد الشمس في 22 أكتوبر و22 فبراير في ظاهرة فلكية وهندسية تسلب ألباب العالم حتى اليوم.',
    locationName: 'أبو سمبل، جنوب بحيرة ناصر، محافظة أسوان',
    coverImage: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&auto=format&fit=crop&q=80'
    ],
    coordinates: { lat: 22.3372, lng: 31.6258 },
    isFeatured: true,
    rating: 5.0,
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'place-west-suhail',
    title: 'قرية غرب سهيل النوبية التراثية',
    slug: 'west-suhail-village',
    governorateId: 'gov-aswan',
    governorateName: 'أسوان',
    category: 'heritage_village',
    description: 'واحة الأصالة النوبية بمنازلها المقببة الملونة بزخارف التراث والمطلة على شلال النيل وصخور الجرانيت الوردي.',
    history: 'تأسست منذ نحو مائة عام مع إنشاء خزان أسوان القديم، وتوارث أهلها تربية التماسيح والضيافة النوبية وصناعة الخوص والمصنوعات الجلدية والخرز.',
    significance: 'النافذة الأروع على الثقافة والموسيقى النوبية والبيت النوبي الحقيقي على ضفاف النيل.',
    locationName: 'البر الغربي للنيل، أسوان، فوق هضبة سهيل',
    coverImage: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&auto=format&fit=crop&q=80'
    ],
    coordinates: { lat: 24.0583, lng: 32.8750 },
    isFeatured: true,
    rating: 4.9,
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'place-qasr-dakhla',
    title: 'مدينة القصر الإسلامية بالداخلة',
    slug: 'qasr-islamic-city',
    governorateId: 'gov-new-valley',
    governorateName: 'الوادي الجديد',
    category: 'heritage_village',
    description: 'مدينة تاريخية متكاملة شيدت بالطوب اللبن وجذوع النخيل منذ العصر الأيوبي، بممراتها المظللة ومعاصر زيت الزيتون وطواحين الغلال.',
    history: 'كانت عاصمة واحة الداخلة وقاعدة عسكرية وتحكيمية في القرون الوسطى، وتحتفظ بأعتاب أبوابها الخشبية المنقوشة بآيات قرآنية وأسماء صناعها وتواريخ تشييدها.',
    significance: 'نموذج حي فريد للعمارة البيئية الواحاتية المتكيفة مع قسوة الصحراء، ومسجد نصر الدين ذو المئذنة الخشبية الشامخة.',
    locationName: 'واحة الداخلة، الوادي الجديد، شمال غرب موط',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80'
    ],
    coordinates: { lat: 25.6983, lng: 28.8833 },
    isFeatured: true,
    rating: 4.8,
    relatedCrafts: ['خوص النخيل', 'الخزف والفخار الواحاتي'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'place-white-desert',
    title: 'محمية الصحراء البيضاء الساحرة بالفرافرة',
    slug: 'white-desert-farafra',
    governorateId: 'gov-new-valley',
    governorateName: 'الوادي الجديد',
    category: 'nature',
    description: 'متحف صخري طبيعي مفتوح نحتته الرياح على هيئة تماثيل طباشيرية بيضاء نقية تتلألأ تحت ضوء القمر وسط رمال الصحراء الغربية.',
    history: 'تشكلت هذه المنحوتات الطباشيرية الكارستية عبر ملايين السنين عندما كانت الصحراء الغربية قاعاً لبحر تيثيس القديم.',
    significance: 'واحدة من أروع العجائب الجيولوجية في شمال إفريقيا ومقصد عالمي لسياحة السفاري والتخييم الفلكي.',
    locationName: 'واحة الفرافرة، الوادي الجديد',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80'
    ],
    coordinates: { lat: 27.0600, lng: 27.9700 },
    isFeatured: true,
    rating: 5.0,
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

export const INITIAL_CULTURAL_CRAFTS: CulturalCraftDoc[] = [
  {
    id: 'craft-tally',
    title: 'فن التلي الأسيوطي',
    slug: 'asyut-tally',
    shortDescription: 'تطريز تراثي دقيق بخيوط الفضة النقية أو الذهب على نسيج الشبيكة القطني الصعيدي، فن نسائي توارثته الأمهات لقرون.',
    history: 'يعود فن التلي إلى القرن التاسع عشر في أسيوط وسوهاج، حيث صممت نساء الصعيد زخارف هندسية مستوحاة من البيئة: النخلة، الجمل، العروسة، الفارس، والشمعدان لتخليد تاريخ العائلة وزي العروس.',
    governorates: ['أسيوط', 'سوهاج'],
    materials: ['خيوط فضة مسطحة عيار 925', 'قماش شبيكة قطني ناعم', 'إبر خاصة مسطحة'],
    tools: ['إبرة التلي المسطحة', 'مقص تطريز نحاسي', 'نول شد القماش'],
    manufacturingStages: [
      { stepNumber: 1, title: 'إعداد قماش الشبيكة وتقسيمه', description: 'تجهيز الشبيكة القطنية وتحديد المساحات والتطريزات الهندسية بدقة حسابية متناهية.' },
      { stepNumber: 2, title: 'لضم شريط الفضة بالإبرة المسطحة', description: 'إدخال شريط الفضة المبطط داخل الإبرة المخصوصة دون ثنيه.' },
      { stepNumber: 3, title: 'عقد الغرزة وضغطها', description: 'إدخال الفضة بين خيوط الشبيكة ثم ثنيها وقصها بضغط اليد لتثبيتها دون عقد خلفية.' },
      { stepNumber: 4, title: 'الصقل والتنعيم', description: 'تمرير أداة خشبية أو عاجية لصقل الغرز الفضية لتعطي لمعاناً براقاً وملمساً ناعماً.' }
    ],
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'craft-pottery',
    title: 'فخار قنا والقلل القناوي',
    slug: 'qena-pottery',
    shortDescription: 'صناعة القلل والجرار والأواني الفخارية من طمي النيل الرسوبي الطبيعي، مبرد مياه طبيعي نقي منذ عهد الفراعنة.',
    history: 'تعد قنا وقراها من أقدم مراكز الخزف في حوض البحر الأبيض المتوسط، وتشتهر قلل قنا بمساميتها المحسوبة علمياً التي تعمل على تبريد المياه صيفاً عبر التبخير الذاتي دون أي طاقة كهربائية.',
    governorates: ['قنا', 'أسوان', 'بني سويف'],
    materials: ['طمي نيلي نقي', 'رمل سيليكا ناعم', 'ماء عذب', 'قش التبن للتهوية'],
    tools: ['دولاب الفخار اليدوي (عجلة الخزاف)', 'سلك القص النحاسي', 'أفران الحرق التقليدية (القمائن)'],
    manufacturingStages: [
      { stepNumber: 1, title: 'تخمير الطمي وتصفيته', description: 'نقع الطين في أحواض مائية وعجنه بالأقدام لإخراج الهواء والشوائب.' },
      { stepNumber: 2, title: 'التشكيل على الدولاب', description: 'رفع كتلة الطين وتشكيل بدن القلة وعنقها بزاوية دقيقة وسرعة دوران محسوبة.' },
      { stepNumber: 3, title: 'الزخرفة والتجفيف الهوائي', description: 'نقش الرسوم الهندسية بالسن الخشبي وتركها تجف في الظل لأيام.' },
      { stepNumber: 4, title: 'الحرق في القمينة', description: 'رص الأواني في الفرن الطيني وحرقها على نار هادئة لساعات للحصول على الصلابة والمسامية.' }
    ],
    coverImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'craft-alabaster',
    title: 'نحت حجر الألباستر بالقرنة',
    slug: 'luxor-alabaster',
    shortDescription: 'حرفة ورثها أبناء قرية القرنة في الأقصر، تحويل الحجر الكلسي الشفاف إلى تماثيل ومزهريات وفوانيس مضيئة تشع نوراً.',
    history: 'استخدم قدماء المصريين الألباستر (المرمر المصري) المستخرج من محاجر حتنوب ووادي سنور في صناعة الأواني الكانوبية وتماثيل الملوك. ورث أهالي القرنة غرب الأقصر تقنيات النحت اليدوي الدقيقة دون استخدام آلات حديثة للحفاظ على روح الحجر.',
    governorates: ['الأقصر'],
    materials: ['أحجار الألباستر الأبيض الشفاف والبني والأخضر', 'شمع التلميع الطبيعي'],
    tools: ['الأزاميل الفولاذية بمقاساتها', 'المطارق الخشبية', 'المبارد الناعمة وصنفرة المياه'],
    manufacturingStages: [
      { stepNumber: 1, title: 'تقطيع الحجر الخام', description: 'تكسير الكتل الحجرية من الجبل بحذر حسب حجم القطعة المراد صنعها.' },
      { stepNumber: 2, title: 'التفريغ الداخلي اليدوي', description: 'تفريغ لب الآنية أو التمثال باستخدام الأزاميل اليدوية حتى تصبح رقيقة بما يكفي لنفاذ الضوء.' },
      { stepNumber: 3, title: 'النحت الخارجي والتفاصيل', description: 'نحت الملامح الهيروغليفية أو الزخارف بدقة عالية.' },
      { stepNumber: 4, title: 'الصنفرة والتشميع بالنار', description: 'صنفرة القطعة بالماء ثم تسخينها وتلميعها بالشمع الطبيعي لتظهر تعريقات الحجر الشفافة.' }
    ],
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'craft-textile-akhmeem',
    title: 'نسيج أخميم اليدوي وحرير الأنوال',
    slug: 'akhmeem-weaving',
    shortDescription: 'أقدم مدرسة نسيج في حوض النيل، تشتهر بأنوالها اليدوية الخشبية لصناعة مفارش الكتان والشيلان الحريرية الفاخرة.',
    history: 'كانت مدينة أخميم عاصمة النسيج في مصر القديمة والقبطية والإسلامية حتى أطلق عليها المؤرخون لقب (مانشستر العصور القديمة). تصدرت أقمشتها أرجاء العالم لجودتها ونقوشها الزهرية والهندسية المتوارثة.',
    governorates: ['سوهاج'],
    materials: ['خيوط القطن المصري طويل التيلة', 'خيوط الكتان الطبيعي', 'أصباغ نباتية طبيعية'],
    tools: ['النول الخشبي الأرضي التقليدي', 'المكوك الخشبي', 'المشط المعدني لدك الخيوط'],
    manufacturingStages: [
      { stepNumber: 1, title: 'تسدية الخيوط', description: 'مد خيوط السدى الطولية على النول بترتيب دقيق ومحكم.' },
      { stepNumber: 2, title: 'التلقيم والبدء', description: 'إدخال خيوط اللحمة بالعرض بواسطة المكوك بين فجوات السدى.' },
      { stepNumber: 3, title: 'الدك والنسيج', description: 'دك الخيوط بالمشط لتتماسك الأنسجة وتظهر الرسومات المطرزة.' }
    ],
    coverImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&auto=format&fit=crop&q=80',
    gallery: [],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'craft-palm',
    title: 'صناعات خوص وجريد النخيل',
    slug: 'palm-crafts',
    shortDescription: 'استثمار كامل شجرة النخيل المباركة لصناعة السلال والأطباق الملونة والأقفاص والأثاث البيئي المريح.',
    history: 'منذ فجر الحضارة المصرية والنخيل هو الصديق الأول لأهل الصعيد والواحات. تطور نسج الخوص ليصبح فناً نسائياً لتلوين أطباق العيش والسلال، بينما تولى الرجال تشكيل الجريد إلى أرائك ومقاعد بيئية أصيلة.',
    governorates: ['الوادي الجديد', 'أسوان', 'قنا', 'بني سويف'],
    materials: ['سعف النخيل (الخوص)', 'جريد النخيل الأخضر والمجفف', 'أصبغة ألوان طبيعية زاهية'],
    tools: ['المخرز الحديدي', 'الساطور لتقطيع الجريد', 'مقص الخوص'],
    manufacturingStages: [
      { stepNumber: 1, title: 'فرز السعف وتشميسه', description: 'انتقاء أوراق السعف الطازجة وتجفيفها تحت شمس الصعيد لتكتسب مرونتها.' },
      { stepNumber: 2, title: 'صباغة الخوص', description: 'غلي ألياف الخوص في ماء الصبغات الطبيعية لإكسابها ألوان النوبة والواحات الزاهية.' },
      { stepNumber: 3, title: 'الجدل والنسج الحلزوني', description: 'جدل الضفائر وخياطتها بالمخرز لتأخذ شكل السلة أو الطبق التراثي.' }
    ],
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    gallery: [],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

export const INITIAL_WAH_STORIES: WahStoryDoc[] = [
  {
    id: 'story-tally-secret',
    title: 'حكاية غرزة التلي: فضة الصعيد التي تحكي أسرار البيوت',
    slug: 'story-of-tally',
    excerpt: 'كيف تحولت خيوط الفضة المعدنية على أيدي نساء أسيوط وسوهاج إلى لغة تعبيرية تشفر آمال العروس وأسرار العائلة دون كلام.',
    content: `في كل بيت عتيق من بيوت أسيوط وسوهاج، كانت هناك سيدة تجلس قرب نافذة المشربية حيث يتسلل ضوء الصباح. تضع على ركبتيها وسادة صغيرة وشالاً أسود من قماش التل الشفاف، وبجانبها خيوط مفلطحة من الفضة الخالصة تلمع كلمعان الندى على سعف النخيل.

لم تكن غرز التلي مجرد حليات زينة؛ بل كانت لغة بصرية متكاملة. فعندما تطرز السيدة شكل "الجمل"، كانت تدعو لزوجها أو ابنها بالصبر وسلامة السفر في دروب التجارة الطويلة. وحين تضع "العروسة والشاهدين"، كانت تسجل يوم زفافها الميمون. أما رسم "النخلة"، فكان رمزاً للخير والبركة الدائمة التي لا تنقطع.

تقول الحاجة فاطمة من منفلوط: "التلي مش شغل إبر وخلاص.. التلي نفس وهدوء بال. شريط الفضة رقيق، لو اتشد زيادة يقطع القماش، ولو اتساب مرخي يبهت. لازم إيدك تميز الإحساس بين الشدة والرخاوة زي عيشة الصعيد تمام".

واليوم، يعود التلي ليتصدر منصات الموضة العالمية كواحد من أرقى وأندر أشكال التطريز اليدوي على وجه الأرض، شاهداً على عظمة صانعاته اللواتي خلدن التاريخ بخيوط الفضة.`,
    category: 'craft_origins',
    authorName: 'فريق توثيق وه',
    governorateName: 'أسيوط',
    governorateId: 'gov-asyut',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    readingTimeMinutes: 4,
    relatedCraftId: 'craft-tally',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'story-qena-pottery-breath',
    title: 'سر «القلة القناوي»: كيف تتنفس فخاريات ثنية النيل؟',
    slug: 'secret-of-qena-pottery',
    excerpt: 'سر التبريد الإعجازي الذي حير الباحثين؛ طمي قنا الرسوبي الذي يحول حرارة الصيف القائظة إلى شربة ماء باردة عذبة.',
    content: `عند منعطف النيل الكبير في قنا، تترسب طبقات خاصة من الطمي الصخري الممزوج بنسب متوازنة من السيليكا وكربونات الكالسيوم. هذا الخليط الطبيعي لا تجده في أي بقعة أخرى بامتداد مجرى النهر.

من هذا الطمي بالذات، تصنع "القلة القناوي". لقرون طويلة، تساءل المسافرون كيف تظل مياه القلة باردة ومنعشة حتى في أوج قيظ شهر طوبة وأمشير ومسرى، حين تتجاوز الحرارة أربعين درجة مئوية في الظل!

السر يكمن في مسامية الفخار الدقيقة؛ فالقلة لا تحبس الماء بشكل أصم، بل تسمح لكميات مجهرية بالرشح نحو السطح الخارجي. وحين تلامس نسمات الهواء السطح المبلل، يتبخر الماء ساحباً معه حرارة البدن الفخاري، فيحدث تبريد ديناميكي طبيعي مدهش.

يقول عم أحمد القناوي، أحد شيوخ الصنعة: "القلة مش بس بتبرد المية، القلة بتنقي الروح. المية لما تقعد في فخار قنا تشيل منها كل زفارة، وترجع كأنك لسه غارفها من منبع النيل الصافي".`,
    category: 'places_myths',
    authorName: 'فريق توثيق وه',
    governorateName: 'قنا',
    governorateId: 'gov-qena',
    coverImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1200&auto=format&fit=crop&q=80',
    readingTimeMinutes: 5,
    relatedCraftId: 'craft-pottery',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'story-shamsi-bread-sunrise',
    title: 'العيش الشمسي: قرص الشمس الذي يخبزه الصعيد فجراً',
    slug: 'shamsi-bread-legend',
    excerpt: 'طقس يومي يتوارثه أهالي الصعيد منذ عهد الفراعنة، حين تصعد نسوة البيوت بالخبز نحو أشعة الشمس ليتخمر بالحرارة الكونية.',
    content: `قبل أن تبزغ خيوط الشمس الأولى فوق جبال الصعيد، تبدأ الحركة في بيوت القرى. يُعجن الدقيق بالماء والخميرة البائنة (الخميرة المتوارثة من عجنة الأمس)، وتُشكل العجينة على هيئة أقراص دائرية تُوضع بعناية فوق "المقارص" المصنوعة من الطين والردة.

هنا تبدأ المرحلة الأسطورية التي سُمي الخبز لأجلها: "التشميس". تُحمل المقارص إلى أسطح المنازل لتستقبل أشعة الشمس الصباحية المباشرة. تقوم حرارة الشمس الطبيعية بتنشيط الخمائر ببطء، فينتفخ الرغيف ويتشقق سطحه برقة ونعومة لا يمكن لفرن حديث أن يضاهيها.

وقبل إدخاله في الفرن البلدي المسقوف بالطين، تأتي مرحلة "التطريح والشرد"، حيث تشق السيدة أطراف الرغيف بشوكة أو سكين حاد في حركة دائرية تشبه قرص الشمس المضيء وأشعته المنبثقة.

العيش الشمسي ليس مجرد طعام، بل هو رمز الكرم الصعيدي؛ فالرغيف الواحد يزن أضعاف الخبز العادي ويبقى طازجاً لأيام دون أن يفسد، شاهداً على عبقرية المطبخ الريفي في استثمار طاقة الطبيعة.`,
    category: 'folklore',
    authorName: 'فريق توثيق وه',
    governorateName: 'الأقصر',
    governorateId: 'gov-luxor',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    readingTimeMinutes: 4,
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

export const INITIAL_LOCAL_PEOPLE: LocalPersonDoc[] = [
  {
    id: 'person-sheikh-fathy',
    name: 'عم فتحي القرناوي',
    slug: 'sheikh-fathy-alabaster',
    titleOrRole: 'شيخ نحاتي الألباستر بجبل القرنة',
    governorateName: 'الأقصر',
    governorateId: 'gov-luxor',
    biography: 'أمضى أكثر من 50 عاماً بين جدران مرسمه الصخري في غرب الأقصر، يعلم شباب القرية أسرار نحت الألباستر بالأزاميل اليدوية حفاظاً على الصنعة من الاندثار أمام الآلات الصينية.',
    craftOrSkill: 'نحت الألباستر وتشكيل المرمر',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    yearsOfExperience: 52,
    relatedCraftId: 'craft-alabaster',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'person-om-hassan',
    name: 'الخالة أم حسن الأسيوطية',
    slug: 'om-hassan-tally',
    titleOrRole: 'حارسة التلي الأسيوطي ورئيسة جمعية إحياء التراث',
    governorateName: 'أسيوط',
    governorateId: 'gov-asyut',
    biography: 'قادت مبادرة لتدريب أكثر من 300 فتاة من قرى أسيوط على فن التطريز بالتلي الفضي، وشاركت بأعمالها في معارض تراثية في باريس وإيطاليا لتعريف العالم بأصالة نساء الصعيد.',
    craftOrSkill: 'تطريز التلي بالفضة عيار 925',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    yearsOfExperience: 38,
    relatedCraftId: 'craft-tally',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'person-am-gad',
    name: 'الأستاذ جاد الكريم النوبي',
    slug: 'gad-alkareem-nubian',
    titleOrRole: 'راوي السير النوبية وصانع مشغولات الخوص والخرز',
    governorateName: 'أسوان',
    governorateId: 'gov-aswan',
    biography: 'من أهالي قرية غرب سهيل بأسوان، يجمع بين العزف على آلة الطمبور وحفظ تراث المشغولات النوبية المصنوعة من جريد النخيل والخرز الملون الذي يحكي قصص النيل والتماسيح.',
    craftOrSkill: 'شغل الخوص والخرز النوبي والرواية الشعبية',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    yearsOfExperience: 44,
    relatedCraftId: 'craft-palm',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

export const INITIAL_UPPER_EGYPT_FOOD: UpperEgyptFoodDoc[] = [
  {
    id: 'food-shamsi-bread',
    title: 'العيش الشمسي الصعيدي',
    slug: 'shamsi-bread',
    governorateName: 'الأقصر',
    governorateId: 'gov-luxor',
    description: 'خبز صعيدي تاريخي يُخمر تحت أشعة الشمس المباشرة على مقارص الطين، ذو قوام إسفنجي غني ونكهة حمضية خفيفة لا تقاوم.',
    ingredients: ['دقيق قمح كامل نقي', 'خميرة بائنة بلدية', 'ماء فاتر', 'ملح صخري', 'ردة ناعمة للفرش'],
    preparationMethod: 'يُعجن الخليط جيداً حتى يتماسك، يُقطع إلى أقراص مستديرة وتوضع فوق المقارص، تُترك لساعات تحت الشمس لتتخمر وترتفع، ثم يُشرط محيط الرغيف ويُخبز في فرن الحطب البلدي.',
    originStory: 'يعود هذا الخبز إلى عصور الفراعنة، حيث عُثر على نماذج منه في مقابر وادي الملوك بحالته الكاملة ومطابقاً تماماً لما يُخبز اليوم.',
    occasionOrTradition: 'حاضر في كل وليمة صعيدية ومناسبات الأفراح والمآتم، ولا تكتمل مائدة دونه.',
    coverImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'food-weka',
    title: 'الويكا الصعيدي الأصيلة',
    slug: 'weka-saeedi',
    governorateName: 'سوهاج',
    governorateId: 'gov-sohag',
    description: 'طبق البامية المجففة أو الطازجة المفرومة ناعماً بالمفراك الخشبي في مرقة اللحم الدسمة مع طشة الثوم والكزبرة الجافة.',
    ingredients: ['بامية صعيدي خضراء مقطعة حلقات رقيقة', 'مرقة لحم أو بط بلدي دسمة', 'ثوم بلدي مهروس', 'كزبرة جافة مطحونة', 'سمن بلدي أصفر'],
    preparationMethod: 'تُسلق حلقات البامية في المرقة المغلية حتى تنضج تماماً، ثم تُفرك بالمفراك الصعيدي اليدوي حتى تصبح ناعمة وقوامها مخملي، وتُضاف إليها طشة الثوم والكزبرة بالسمن البلدي.',
    originStory: 'ابتكرها أهل الصعيد لحفظ البامية واستغلال خيرات المواسم، وتعد الطبق الصيفي الأحب لقلوب الصعايدة مع العيش الشمسي الساخن والباذنجان المخلل.',
    occasionOrTradition: 'وجبة الغداء الرئيسية بعد أيام العمل الحقلية الطويلة.',
    coverImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&auto=format&fit=crop&q=80',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'food-fayesh',
    title: 'الفايش الصعيدي بالخميرة الحمصية',
    slug: 'fayesh-saeedi',
    governorateName: 'بني سويف',
    governorateId: 'gov-bani-suef',
    description: 'مقرمشات صعيدية ذهبية بنكهة المحلب والكركم والسمسم، تصنع بخميرة سرية من مغلي الحمص واللبن الدافئ.',
    ingredients: ['حمص مطحون ناعم', 'حليب بقري أو جاموسي مغلي', 'دقيق فاخر', 'كركم طبيعي ومحلب ناعم', 'سمن بلدي وسكر وسمسم محمص'],
    preparationMethod: 'تُحضر خميرة الحمص وتُدفأ في مكان مظلم لمدة 24 ساعة حتى تفور، ثم يُعجن بها طحين الفايش مع السمن والكركم والمحلب، يُخبز على شكل قوالب ثم يُقطع شرائح ويُحمص في الفرن حتى يقرمش.',
    originStory: 'رفيق شاي الصباح وشاي العصر في كل بيوت الصعيد، ويُحضر بكميات كبيرة في مواسم الأعياد كعلامة احتفال عائلية.',
    occasionOrTradition: 'أعياد الفطر والأضحى والصباحيات العائلية.',
    coverImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'food-black-honey',
    title: 'العسل الأسود المعصور والمفتقة',
    slug: 'black-honey-qena',
    governorateName: 'قنا',
    governorateId: 'gov-qena',
    description: 'خلاصة قصب السكر الصعيدي المطبوخ على الحطب في عصارات نجع حمادي وقوص التاريخية، غني بالحديد والمعادن الطبيعية.',
    ingredients: ['عصير قصب سكر صعيدي طازج 100% بدون أي إضافات'],
    preparationMethod: 'يُعصر القصب الطازج ويُصفى ثم يغلي في أواني نحاسية ضخمة على نار خشبية متدرجة لساعات حتى يتبخر الماء ويثقل القوام ويكتسب لونه الأسود الأبنوسي ونكهته الدخانية العميقة.',
    originStory: 'تشتهر قنا بكونها عاصمة قصب السكر، وتعتبر عصاراتها التقليدية مقصداً تراثياً يوثق فنون الطهي البطيء الطبيعي.',
    occasionOrTradition: 'فطور الصعيد اليومي مع الفطير المشلتت والجبنة القديمة.',
    coverImage: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1200&auto=format&fit=crop&q=80',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

export const INITIAL_CULTURAL_EVENTS: CulturalEventDoc[] = [
  {
    id: 'event-tahteeb-luxor',
    title: 'المهرجان القومي لفن التحطيب بالأقصر',
    slug: 'luxor-tahteeb-festival',
    category: 'festival',
    governorateName: 'الأقصر',
    governorateId: 'gov-luxor',
    locationName: 'ساحة معبد الكرنك، الأقصر',
    eventDate: 'ديسمبر من كل عام',
    eventTime: '05:00 مساءً - 10:00 مساءً',
    description: 'تجمع سنوي لأبطال وشيوخ لعبة التحطيب الصعيدية المسجلة على قائمة اليونسكو للتراث الإنساني، مع عروض المزمار والفروسية والسامر الشعبي.',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'event-dendera-music',
    title: 'مهرجان دندرة للموسيقى والغناء',
    slug: 'dendera-music-festival',
    category: 'cultural_night',
    governorateName: 'قنا',
    governorateId: 'gov-qena',
    locationName: 'المسرح المكشوف، معبد دندرة، قنا',
    eventDate: 'مارس من كل عام',
    eventTime: '07:00 مساءً - 11:00 مساءً',
    description: 'ليالٍ موسيقية ساحرة في رحاب معبد حتحور تشهد عروضاً للموسيقى العربية والتراث الصعيدي والإنشاد الصوفي الأصيل.',
    coverImage: 'https://images.unsplash.com/photo-1599833975787-5c143f373c30?w=1200&auto=format&fit=crop&q=80',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'event-dates-newvalley',
    title: 'مهرجان تمور الواحات السنوي',
    slug: 'new-valley-dates-festival',
    category: 'market_fair',
    governorateName: 'الوادي الجديد',
    governorateId: 'gov-new-valley',
    locationName: 'حديقة 30 يونيو، الخارجة، الوادي الجديد',
    eventDate: 'أكتوبر من كل عام',
    eventTime: '10:00 صباحاً - 09:00 مساءً',
    description: 'معرض ضخم لمنتجات تمور الواحات وصناعات الخوص والجريد اليدوية مع ورش تدريبية حية للزوار وسياحة علاجية بالعيون الكبريتية.',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

export const INITIAL_CITIES: CityDoc[] = [
  {
    id: 'city-beni-suef',
    name: 'مدينة بني سويف',
    governorateId: 'gov-bani-suef',
    governorateName: 'بني سويف',
    shortDescription: 'عاصمة المحافظة ومركزها التجاري على ضفاف نهر النيل.',
    famousFor: ['شارع أحمد عرابي التجاري', 'حديقة النيل', 'صناعات الفخار'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'city-minya',
    name: 'مدينة المنيا',
    governorateId: 'gov-minya',
    governorateName: 'المنيا',
    shortDescription: 'عروس الصعيد بمبانيها الكلاسيكية وكورنيش النيل التاريخي الممتد.',
    famousFor: ['كورنيش المنيا', 'ميدان البوستة', 'سوق الحبشي'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'city-mallawi',
    name: 'ملوي',
    governorateId: 'gov-minya',
    governorateName: 'المنيا',
    shortDescription: 'حاضرة التجارة والحرف الخشبية وصناعة الساقية والمحاريث بالمنيا.',
    famousFor: ['متحف ملوي الآثاري', 'صناعات الخشب والأثاث الريفي'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'city-asyut',
    name: 'مدينة أسيوط',
    governorateId: 'gov-asyut',
    governorateName: 'أسيوط',
    shortDescription: 'عاصمة صعيد مصر الكبرى وملتقى قوافل التجارة وحرف التلي والسجاد.',
    famousFor: ['قناطر أسيوط', 'شارع يسرى راغب', 'وكالة شلبي للتوابل'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'city-akhmeem',
    name: 'أخميم',
    governorateId: 'gov-sohag',
    governorateName: 'سوهاج',
    shortDescription: 'عاصمة النسيج اليدوي التاريخية والأنوال المتوارثة منذ الفراعنة.',
    famousFor: ['أنوال أخميم للحرير والكتان', 'تمثال ميريت آمون'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'city-sohag',
    name: 'مدينة سوهاج',
    governorateId: 'gov-sohag',
    governorateName: 'سوهاج',
    shortDescription: 'حاضرة محافظة سوهاج ومركز التجارة على النيل.',
    famousFor: ['متحف سوهاج القومي', 'مسجد العارف بالله', 'جزيرة الزهور'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'city-qena',
    name: 'مدينة قنا',
    governorateId: 'gov-qena',
    governorateName: 'قنا',
    shortDescription: 'مدينة القلل القناوية ومسجد سيدي عبد الرحيم القنائي الشهير.',
    famousFor: ['مسجد عبد الرحيم القنائي', 'سوق الفخار', 'معبد دندرة'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'city-naqada',
    name: 'نقادة',
    governorateId: 'gov-qena',
    governorateName: 'قنا',
    shortDescription: 'معقل حضارة نقادة التاريخية ومركز صناعة الفركة اليدوية (الشال الصعيدي).',
    famousFor: ['أنوال الفركة اليدوية', 'أديرة نقادة التاريخية'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'city-luxor',
    name: 'مدينة الأقصر',
    governorateId: 'gov-luxor',
    governorateName: 'الأقصر',
    shortDescription: 'طيبة عاصمة الإمبراطورية المصرية العظمى ومتحف العالم المفتوح.',
    famousFor: ['معبد الكرنك', 'معبد الأقصر', 'وادي الملوك', 'صناعة الألباستر'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'city-aswan',
    name: 'مدينة أسوان',
    governorateId: 'gov-aswan',
    governorateName: 'أسوان',
    shortDescription: 'بوابة مصر الجنوبية وحاضنة التراث النوبي الساحر وجزر النيل العذبة.',
    famousFor: ['السوق السياحي لأسوان', 'معبد فيلة', 'صناعات الخوص النوبي والبخور'],
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

export const INITIAL_VILLAGES: VillageDoc[] = [
  {
    id: 'village-dandara',
    name: 'قرية دندرة',
    cityName: 'مدينة قنا',
    governorateId: 'gov-qena',
    governorateName: 'قنا',
    traditionalCraftId: 'craft-pottery-qena',
    traditionalCraftName: 'الفخار والقلل القناوية',
    description: 'قرية عريقة تحتضن معبد حتحور وتشتهر بعائلات الفواخير التي تشكل طمي النيل.',
    famousFor: ['صناعة القلل والجرار', 'معبد دندرة'],
    coverImage: 'https://images.unsplash.com/photo-1599833975787-5c143f373c30?w=800',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'village-ballas',
    name: 'قرية البلاص',
    cityName: 'قنا',
    governorateId: 'gov-qena',
    governorateName: 'قنا',
    traditionalCraftId: 'craft-pottery-qena',
    traditionalCraftName: 'صناعة بلاص العسل والجبن',
    description: 'القرية التي سمي باسمها "البلاص" الصعيدي الشهير لحفظ العسل والجبن القديم.',
    famousFor: ['صناعة البلاص الفخاري الخزفي'],
    coverImage: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'village-gharb-soheil',
    name: 'قرية غرب سهيل النوبية',
    cityName: 'مدينة أسوان',
    governorateId: 'gov-aswan',
    governorateName: 'أسوان',
    traditionalCraftId: 'craft-nubian-basketry',
    traditionalCraftName: 'الخوص النوبي والحلي التراثية',
    description: 'واحدة من أجمل قرى النيل في أسوان ببيوتها الملونة وتماسيحها وترحيب أهلها.',
    famousFor: ['البيوت النوبية الملونة', 'أطباق الخوص الملونة', 'تربية التماسيح التراثية'],
    coverImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'village-gurna',
    name: 'قرية القرنة التراثية',
    cityName: 'مدينة الأقصر',
    governorateId: 'gov-luxor',
    governorateName: 'الأقصر',
    traditionalCraftId: 'craft-alabaster',
    traditionalCraftName: 'نحت حجر الألباستر والجرانيت',
    description: 'تقع بالبر الغربي للأقصر، تشتهر بورش نحت الألباستر اليدوية وتصميم حسن فتحي المعماري.',
    famousFor: ['مصانع الألباستر اليدوية', 'قرية حسن فتحي البيئية'],
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

export const INITIAL_TRADITIONS: CulturalTraditionDoc[] = [
  {
    id: 'tradition-tahtib',
    title: 'فن ولعبة التحطيب الصعيدية',
    slug: 'tahtib-martial-art',
    governorateName: 'سوهاج والأقصر وقنا',
    governorateId: 'gov-sohag',
    category: 'customs',
    description: 'فن الفروسية والمبارزة بالعصا الخيزران على إيقاع الطبل والمزمار البلدي، مسجل بقائمة التراث الإنساني لليونسكو كرمز لشهامة ونبل الصعايدة.',
    historicalOrigin: 'منقوش على جدران معابد الفراعنة في بني حسن وتل العمارنة والأقصر.',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'tradition-sirah-hilaliyya',
    title: 'السيرة الهلالية وفن الواو والمربعات',
    slug: 'sirah-hilaliyya-storytelling',
    governorateName: 'قنا وأسيوط وسوهاج',
    governorateId: 'gov-qena',
    category: 'oral_arts',
    description: 'الملحمة الشعبية الشفاهية الأضخم في الوجدان العربي التي يرويها شعراء الربابة في المضايف وسهرات السمر الشتوية بصوت شجي.',
    historicalOrigin: 'تغريبة بني هلال إلى بلاد المغرب العربي متوارثة شفاهياً منذ قرون.',
    coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'tradition-shamsi-baking',
    title: 'طقس خبيز العيش الشمسي في الفرن البلدي',
    slug: 'shamsi-bread-ritual',
    governorateName: 'عموم محافظات الصعيد',
    governorateId: 'gov-asyut',
    category: 'celebration',
    description: 'يوم الخبيز الصعيدي المقدس، حيث تعجن النسوة الدقيق النقي وتترك الأقراص لتختمر تحت أشعة شمس الصعيد الساطعة قبل خبزها في الفرن البلدي الطيني.',
    historicalOrigin: 'متوارث مباشرة من مصر القديمة كما توثقه نقوش مقابر دير المدينة والأقصر.',
    coverImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

export const INITIAL_PLATFORM_SETTINGS: PlatformSettingsDoc = {
  id: 'platform-settings-default',
  siteName: 'وه | WAH',
  siteTagline: 'المنصة الوطنية الكبرى لتوثيق وتسويق تراث وحرف وثقافة صعيد مصر',
  contactEmail: 'contact@wah-egypt.com',
  contactPhone: '+20 100 123 4567',
  shippingFlatRate: 45,
  freeShippingThreshold: 500,
  featuredGovernorates: ['gov-qena', 'gov-luxor', 'gov-aswan', 'gov-asyut', 'gov-sohag'],
  featuredCrafts: ['craft-tally', 'craft-pottery-qena', 'craft-textile-akhmeem', 'craft-alabaster'],
  featuredStories: ['story-tally-secret', 'story-ballas-clay'],
  featuredProducts: [],
  heroHeadline: 'وه.. أصالة الصعيد بين يديك',
  heroSubheadline: 'منصة بيئية وتوثيقية وسوق مباشر يربطك بأعرق ورش الحرفيين، كنوز المحافظات، حكايات الأجداد، وخيرات جنوب الوادي.',
  updatedAt: '2026-01-01T00:00:00.000Z',
  updatedBy: 'system-init'
};

