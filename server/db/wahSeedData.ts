import {
  GovernorateDoc,
  HeritagePlaceDoc,
  CulturalCraftDoc,
  WahStoryDoc,
  LocalPersonDoc,
  UpperEgyptFoodDoc,
  CulturalEventDoc
} from '../models/types.ts';

export const INITIAL_GOVERNORATES: GovernorateDoc[] = [
  {
    id: 'gov-bani-suef',
    name: 'بني سويف',
    slug: 'bani-suef',
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
    relatedCrafts: ['فخار قنا والقلل', 'النقش على الأحجار'],
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
    relatedCrafts: ['نسيج أخميم اليدوي', 'الكليم السوهاجي'],
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
    relatedCrafts: ['الخوص والجريد النوبي', 'شغل الخرز والتمائم'],
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
    relatedCrafts: ['نحت الألباستر', 'ورق البردي'],
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
    relatedCrafts: ['خوص النخيل', 'الخزف والفخار الواحاتي'],
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
