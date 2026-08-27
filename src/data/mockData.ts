import { Category, Product, Seller, Order, DiscountCoupon, AuditLog, Review, CraftStory } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'pottery',
    name: 'الفخار والخزف الصعيدي',
    nameEn: 'Pottery & Ceramics',
    slug: 'pottery',
    description: 'أواني وقدور وقلل فخارية مصنوعة يدوياً من طمي النيل العذب على يد شيوخ الصنعة بقنا وأسيوط',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
    iconName: 'Sparkles',
    productsCount: 42,
    active: true,
    heritageNote: 'حرفة فرعونية أصيلة متوارثة منذ 5000 عام في قنا وأسيوط',
    featuredGovernorate: 'قنا'
  },
  {
    id: 'kilim-carpets',
    name: 'الكليم والسجاد اليدوي',
    nameEn: 'Handmade Kilim & Rugs',
    slug: 'kilim-carpets',
    description: 'كليم أخميم الصوفي الشهير وسجاد الحرير الطبيعي المنسوج على الأنوال الخشبية القديمة',
    image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
    iconName: 'Flame',
    productsCount: 38,
    active: true,
    heritageNote: 'أخميم عاصمة النسيج اليدوي في صعيد مصر منذ العصر القبطي',
    featuredGovernorate: 'سوهاج'
  },
  {
    id: 'palm-wicker',
    name: 'الخوص والمشغولات النخيلية',
    nameEn: 'Palm Fronds & Wickerwork',
    slug: 'palm-wicker',
    description: 'سلال، أطباق عيش، وحقائب منسوجة بإتقان من جريد وخوص النخيل والدوم الأسواني',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80',
    iconName: 'ShoppingBag',
    productsCount: 29,
    active: true,
    heritageNote: 'صناعة نوبية وصعيدية تجمع بين النفع اليومي والجمال الطبيعي المستدام',
    featuredGovernorate: 'أسوان'
  },
  {
    id: 'tally-embroidery',
    name: 'التلي والتطريز الصعيدي',
    nameEn: 'Assiut Tally & Embroidery',
    slug: 'tally-embroidery',
    description: 'شيلان وعبايات التلي الأسيوطي المطرزة يدوياً بشرائط الفضة والنحاس اللامعة',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    iconName: 'Feather',
    productsCount: 24,
    active: true,
    heritageNote: 'فن التلي الأسيوطي مسجل كتراث إنساني فريد تميزت به نساء أسيوط',
    featuredGovernorate: 'أسوط' as any
  },
  {
    id: 'natural-honey-herbs',
    name: 'عسل جبلي وأعشاب الصعيد',
    nameEn: 'Wild Honey & Organic Herbs',
    slug: 'natural-honey-herbs',
    description: 'عسل سدر جبلي حر، حبّة البركة، كركديه أسواني زهرة كاملة، وحلفا بر صعيدية نقية',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    iconName: 'Heart',
    productsCount: 56,
    active: true,
    heritageNote: 'مناحل ومزارع برية في سفوح جبال المنيا وسوهاج وأسوان',
    featuredGovernorate: 'المنيا'
  },
  {
    id: 'dates-fruits',
    name: 'تمور وخيرات أسوان والوادي',
    nameEn: 'Dates & Upper Egypt Crops',
    slug: 'dates-fruits',
    description: 'تمور مجدولة فاخرة، بلح سكوتي وبرتمودا أسواني، وتمر هندي خام طبيعي',
    image: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a?auto=format&fit=crop&w=800&q=80',
    iconName: 'Sun',
    productsCount: 33,
    active: true,
    heritageNote: 'خيرات نخل الصعيد المعتق تحت شمس الجنوب الدافئة',
    featuredGovernorate: 'أسوان'
  },
  {
    id: 'copper-wood',
    name: 'النحاسيات والخشب المعشق',
    nameEn: 'Handmade Copper & Woodwork',
    slug: 'copper-wood',
    description: 'صواني دائرية مطروقة يدوياً، قناديل نحاسية، وأواني خشب السرسوع والليمون المحفور',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    iconName: 'Award',
    productsCount: 21,
    active: true,
    heritageNote: 'حرفة النقش والزخرفة الصعيدية في الأقصر وقنا',
    featuredGovernorate: 'الأقصر'
  },
  {
    id: 'incense-perfumes',
    name: 'البخور والعطور التراثية',
    nameEn: 'Incense & Heritage Perfumes',
    slug: 'incense-perfumes',
    description: 'بخور الصندل والجاوي الأسواني، خلطات الدلكة النوبية، وزيوت عطرية أصلية',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    iconName: 'Wind',
    productsCount: 19,
    active: true,
    heritageNote: 'أسرار العطارة والروائح الزكية المتوارثة بين العائلات الصعيدية',
    featuredGovernorate: 'أسوان'
  }
];

export const INITIAL_SELLERS: Seller[] = [
  {
    id: 'seller-1',
    name: 'الأسطى سعيد القناوي',
    brandName: 'فخار عم سعيد التراثي',
    governorate: 'قنا',
    rating: 4.9,
    salesCount: 840,
    productsCount: 18,
    badge: 'حرفي ذهبي معتمد',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
    bio: 'صانع فخار أباً عن جد في قرية الجرادوة بقنا منذ أكثر من 35 عاماً.',
    story: 'بدأت رحلتي مع دولاب الفخار وأنا في السابعة من عمري بصحبة جدي. نصنع أوانينا من طين نيل قنا الصافي بدون أي مواد كيميائية لتبرد الماء وتطيب الطعام.',
    verified: true,
    joinedDate: '2023-01-15',
    phone: '01012345678',
    email: 'saeed.pottery@elsa3ed.eg',
    payoutMethod: 'vodafone_cash',
    payoutAccount: '01012345678',
    status: 'approved',
    specialty: 'أواني الفخار والقِلال والزبادي الطبيعي'
  },
  {
    id: 'seller-2',
    name: 'الحاجة أم هاشم الإخميمية',
    brandName: 'أنوال أخميم التراثية',
    governorate: 'سوهاج',
    rating: 5.0,
    salesCount: 1250,
    productsCount: 22,
    badge: 'شيخة الصنعة',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80',
    bio: 'نحافظ على نول أخميم اليدوي الصوفي بألوان الطبيعة ونقوش الصعيد العريقة.',
    story: 'تضم ورشتنا أكثر من 25 سيدة صعيدية ينسجن الكليم الصوفي اليدوي غرزة بغرزة، مستلهمات نقوشهن من بيوت الصعيد والرموز المصرية القديمة.',
    verified: true,
    joinedDate: '2022-11-20',
    phone: '01198765432',
    email: 'om.hashem@elsa3ed.eg',
    payoutMethod: 'instapay',
    payoutAccount: 'omhashem@instapay',
    status: 'approved',
    specialty: 'كليم أخميم الصوفي والسجاد الصعيدي'
  },
  {
    id: 'seller-3',
    name: 'عبد الله النوبي',
    brandName: 'خيرات بلاد الذهب - أسوان',
    governorate: 'أسوان',
    rating: 4.8,
    salesCount: 960,
    productsCount: 31,
    badge: 'مزرعة عضوية موثقة',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a?auto=format&fit=crop&w=1200&q=80',
    bio: 'تمور، كركديه أسواني، وتمر هندي قطفة أولى من مزارع غرب سهيل وأبوسمبل.',
    story: 'نجمع محاصيلنا الزراعية من بساتين النخيل على ضفاف النيل بأسوان بدون مبيدات، ونجففها تحت حرارة شمس أسوان النقية وفق التقاليد النوبية.',
    verified: true,
    joinedDate: '2023-03-10',
    phone: '01234567890',
    email: 'nuba.gold@elsa3ed.eg',
    payoutMethod: 'vodafone_cash',
    payoutAccount: '01234567890',
    status: 'approved',
    specialty: 'التمور النوبية والكركديه والبخور'
  },
  {
    id: 'seller-4',
    name: 'مريم بطرس الأسيوطية',
    brandName: 'حرير وتلي أسيوط',
    governorate: 'أسيوط',
    rating: 4.9,
    salesCount: 420,
    productsCount: 14,
    badge: 'فن تراثي محمي',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80',
    bio: 'تطريز التلي بالفضة على شاش القطن الطبيعي والحرير الأسود.',
    story: 'أعدنا إحياء غرز التلي التسعة الكلاسيكية التي تشتهر بها محافظة أسيوط، لتصل إلى كل بيت مصري وعربي بلمسة فخامة معاصرة.',
    verified: true,
    joinedDate: '2023-05-18',
    phone: '01087654321',
    email: 'tally.assiut@elsa3ed.eg',
    payoutMethod: 'instapay',
    payoutAccount: 'mariam.tally@instapay',
    status: 'approved',
    specialty: 'شيلان وجلاليب التلي الصعيدي'
  },
  {
    id: 'seller-5',
    name: 'المعلم كرم الله القرناوي',
    brandName: 'مشغولات القرنة والخوص',
    governorate: 'الأقصر',
    rating: 4.7,
    salesCount: 680,
    productsCount: 26,
    badge: 'حرفي بيئي',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=1200&q=80',
    bio: 'سلال خوص طبيعية وأواني طهي حجرية من قرية القرنة غرب الأقصر.',
    story: 'بجوار المعابد الخالدة في غرب الأقصر، نستخدم نباتات البردي وسعف النخيل لتشكيل أروع السلال والحقائب التي تناسب المنزل العصري.',
    verified: true,
    joinedDate: '2023-08-01',
    phone: '01511223344',
    email: 'karnak.crafts@elsa3ed.eg',
    payoutMethod: 'vodafone_cash',
    payoutAccount: '01511223344',
    status: 'approved',
    specialty: 'سلال الخوص ومنتجات البردي والألاباستر'
  },
  {
    id: 'seller-6',
    name: 'الشيخ رضوان المنياوي',
    brandName: 'مناحل جبال المنيا وعسل السدر',
    governorate: 'المنيا',
    rating: 5.0,
    salesCount: 510,
    productsCount: 16,
    badge: 'مناحل جبلية عضوية',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80',
    bio: 'مناحل طبيعية في جبال ووديان المنيا لإنتاج عسل السدر والبرسيم الجبلي والأعشاب الطبية.',
    story: 'نتوارث مهنة النحالة في ريف وجبال المنيا أباً عن جد، نحافظ على أصالة فرز العسل البارد الخام بدون أي إضافات كيميائية أو تسخين لحفظ كافة الإنزيمات العلاجية.',
    verified: true,
    joinedDate: '2023-09-12',
    phone: '01099887766',
    email: 'minya.honey@elsa3ed.eg',
    payoutMethod: 'vodafone_cash',
    payoutAccount: '01099887766',
    status: 'approved',
    specialty: 'عسل السدر الجبلي وحبة البركة'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'قُلّة قناوية فخارية مطعمة بالنقش اليدوي (قنا)',
    titleEn: 'Handmade Qena Terracotta Water Jar',
    categoryId: 'pottery',
    categoryName: 'الفخار والخزف الصعيدي',
    sellerId: 'seller-1',
    sellerName: 'فخار عم سعيد التراثي',
    sellerGovernorate: 'قنا',
    price: 185,
    originalPrice: 240,
    discountPercent: 23,
    rating: 4.9,
    reviewCount: 78,
    inStock: true,
    stockCount: 35,
    images: [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'قلة فخارية تقليدية مصنوعة من طمي نيل قنا الشهير بمساميته العالية التي تعمل كفلتر ومبرد طبيعي للمياه دون استهلاك كهرباء. مزينة بنقوش صعيدية دقيقة.',
    specifications: {
      material: 'طين نيل قناوي طبيعي حراري',
      originGovernorate: 'قنا',
      craftsmanship: 'تشكيل يدوي على الدولاب + حرق في الفرن البلدي',
      dimensions: 'ارتفاع 28 سم × قطر 16 سم',
      weight: '1.2 كجم',
      careInstructions: 'تغسل بالماء الفاتر بدون صابون قبل أول استخدام وتترك لتتشرب الماء',
      estimatedMakingTime: '4 أيام عمل'
    },
    tags: ['فخار', 'قنا', 'قلة', 'تبريد طبيعي', 'يدوي', 'صعيد مصر'],
    isHandmade: true,
    isHeritage: true,
    isFeatured: true,
    isNewArrival: false,
    createdAt: '2024-01-10',
    approvalStatus: 'approved'
  },
  {
    id: 'prod-2',
    title: 'كليم أخميم صوفي يدوي أصلي بنقش النجوم الصعيدية (سوهاج)',
    titleEn: 'Akhmim Handmade Wool Kilim Rug',
    categoryId: 'kilim-carpets',
    categoryName: 'الكليم والسجاد اليدوي',
    sellerId: 'seller-2',
    sellerName: 'أنوال أخميم التراثية',
    sellerGovernorate: 'سوهاج',
    price: 1450,
    originalPrice: 1800,
    discountPercent: 19,
    rating: 5.0,
    reviewCount: 114,
    inStock: true,
    stockCount: 12,
    images: [
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'كليم صوف طبيعي 100% مغزول ومصبوغ بأصباغ نباتية (رمان وكركم ونيلة). منسوج على النول اليدوي التقليدي في مدينة أخميم بسوهاج، يدوم لعشرات السنين دون أن يبهت.',
    specifications: {
      material: 'صوف خراف طبيعي 100% + خيوط سداء قطن مصري',
      originGovernorate: 'سوهاج',
      craftsmanship: 'نسيج يدوي على النول العمودي',
      dimensions: '180 سم × 120 سم',
      weight: '2.8 كجم',
      careInstructions: 'تنظيف جاف أو غسيل يدوي بماء بارد وشامبو صوف',
      estimatedMakingTime: '14 يوم عمل'
    },
    tags: ['كليم', 'أخميم', 'سوهاج', 'صوف', 'سجاد يدوي', 'تراثي'],
    isHandmade: true,
    isHeritage: true,
    isFeatured: true,
    isNewArrival: true,
    createdAt: '2024-02-01',
    approvalStatus: 'approved'
  },
  {
    id: 'prod-3',
    title: 'شال تلي أسيوط فاخر مطرز بالفضة الخالصة (أسيوط)',
    titleEn: 'Luxurious Assiut Tally Shawl with Silver Stitching',
    categoryId: 'tally-embroidery',
    categoryName: 'التلي والتطريز الصعيدي',
    sellerId: 'seller-4',
    sellerName: 'حرير وتلي أسيوط',
    sellerGovernorate: 'أسيوط',
    price: 2200,
    originalPrice: 2600,
    discountPercent: 15,
    rating: 4.9,
    reviewCount: 42,
    inStock: true,
    stockCount: 8,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'قطعة فنية نادرة من التلي الأسيوطي التراثي، مطرزة بشرائط معدنية مطلية بالفضة على شاش قطني فاخر. قطعة تعكس أصالة نساء الصعيد وتلائم المناسبات الراقية والمتاحف.',
    specifications: {
      material: 'شاش قطن مصري ممتاز + شرائط فضة نحاسية مطلية',
      originGovernorate: 'أسيوط',
      craftsmanship: 'تطريز يدوي إبرة تلي صعيدية أصلية',
      dimensions: '200 سم × 70 سم',
      weight: '450 جرام',
      careInstructions: 'تنظيف جاف حصراً، لا يعصر ولا يكوى مباشرة على المعدن',
      estimatedMakingTime: '21 يوم عمل'
    },
    tags: ['تلي', 'أسيوط', 'تطريز بالفضة', 'شال صعيدي', 'تراث فاخر'],
    isHandmade: true,
    isHeritage: true,
    isFeatured: true,
    isNewArrival: false,
    createdAt: '2024-01-20',
    approvalStatus: 'approved'
  },
  {
    id: 'prod-4',
    title: 'تمر مجدول أسواني فاخر قطفة أولى - عبوة 1 كجم (أسوان)',
    titleEn: 'Premium Aswan Medjool Dates 1kg',
    categoryId: 'dates-fruits',
    categoryName: 'تمور وخيرات أسوان والوادي',
    sellerId: 'seller-3',
    sellerName: 'خيرات بلاد الذهب - أسوان',
    sellerGovernorate: 'أسوان',
    price: 195,
    originalPrice: 230,
    discountPercent: 15,
    rating: 4.9,
    reviewCount: 165,
    inStock: true,
    stockCount: 150,
    images: [
      'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606851094655-b2593a9af63f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'حبات تمر مجدول حجم كبير (جامبو) مجففة طبيعياً تحت شمس أسوان دون إضافة سكريات أو مواد حافظة. قوام رطب ولذيذ وغني بالطاقة والمعادن.',
    specifications: {
      material: 'تمور مجدول 100% طبيعية عضوية',
      originGovernorate: 'أسوان',
      craftsmanship: 'جني وفرز يدوي معقم',
      weight: '1 كجم صافي',
      careInstructions: 'يحفظ في مكان جاف وبارد أو بالثلاجة للحفاظ على طراوته',
      estimatedMakingTime: 'محصول الموسم الحالي'
    },
    tags: ['تمور', 'أسوان', 'مجدول', 'عضوي', 'طبيعي', 'خيرات الصعيد'],
    isHandmade: false,
    isHeritage: true,
    isFeatured: true,
    isNewArrival: true,
    createdAt: '2024-02-15',
    approvalStatus: 'approved'
  },
  {
    id: 'prod-5',
    title: 'طاجن فخار صعيدي حراري بغطاء مطبوخ بدهن بلدي (أسيوط)',
    titleEn: 'Traditional Upper Egypt Clay Tagine Pot',
    categoryId: 'pottery',
    categoryName: 'الفخار والخزف الصعيدي',
    sellerId: 'seller-1',
    sellerName: 'فخار عم سعيد التراثي',
    sellerGovernorate: 'أسيوط',
    price: 240,
    originalPrice: 300,
    discountPercent: 20,
    rating: 4.8,
    reviewCount: 93,
    inStock: true,
    stockCount: 40,
    images: [
      'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'طاجن فخاري جاهز للاستخدام الفوري معالج ومحروق مسبقاً (معتق). يمنح الأكل نكهة الحطب والصعيد المميزة ويتحمل درجات حرارة الفرن العالية.',
    specifications: {
      material: 'طمي حراري أحمر ممتاز معتق بالعسل الأسود والدهن',
      originGovernorate: 'أسيوط',
      craftsmanship: 'تشكيل دولاب يدوي ومعالجة حرارية',
      dimensions: 'قطر 26 سم × عمق 12 سم',
      weight: '2.1 كجم',
      careInstructions: 'يصلح لجميع أنواع الأفران، لا يوضع ساخناً مباشرة على سطح مبلل',
      estimatedMakingTime: '7 أيام تجهيز وحرق'
    },
    tags: ['طاجن', 'فخار', 'طبخ صعيدي', 'طين حراري', 'أسيوط'],
    isHandmade: true,
    isHeritage: true,
    isFeatured: false,
    isNewArrival: true,
    createdAt: '2024-02-18',
    approvalStatus: 'approved'
  },
  {
    id: 'prod-6',
    title: 'سلة خوص نوبية ملونة مصنوعة من سعف النخيل (أسوان)',
    titleEn: 'Nubian Handwoven Colorful Palm Basket',
    categoryId: 'palm-wicker',
    categoryName: 'الخوص والمشغولات النخيلية',
    sellerId: 'seller-5',
    sellerName: 'مشغولات القرنة والخوص',
    sellerGovernorate: 'أسوان',
    price: 280,
    originalPrice: 350,
    discountPercent: 20,
    rating: 4.9,
    reviewCount: 54,
    inStock: true,
    stockCount: 22,
    images: [
      'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'سلة نوبية أصيلة منسوجة بمهارة متناهية من سعف وخوص النخيل، مزينة بألوان نوبية مبهجة ومزودة بغطاء مخروطي تراثي لحفظ الخبز أو التزيين المنزلي.',
    specifications: {
      material: 'خوص نخيل طبيعي + صبغات نباتية آمنة',
      originGovernorate: 'أسوان',
      craftsmanship: 'جدل ونسيج يدوي نوبي متقن',
      dimensions: 'قطر 30 سم × ارتفاع 35 سم',
      weight: '800 جرام',
      careInstructions: 'تنظف بقطعة قماش مبللة وتجفف في الظل',
      estimatedMakingTime: '5 أيام عمل'
    },
    tags: ['خوص', 'نوبة', 'أسوان', 'سلة', 'ديكور تراثي', 'صديق للبيئة'],
    isHandmade: true,
    isHeritage: true,
    isFeatured: true,
    isNewArrival: false,
    createdAt: '2024-01-28',
    approvalStatus: 'approved'
  },
  {
    id: 'prod-7',
    title: 'عسل سدر صعيدي جبلي حر نقي 100% - 900 جرام (المنيا)',
    titleEn: 'Raw Upper Egypt Mountain Sidr Honey 900g',
    categoryId: 'natural-honey-herbs',
    categoryName: 'عسل جبلي وأعشاب الصعيد',
    sellerId: 'seller-6',
    sellerName: 'مناحل جبال المنيا وعسل السدر',
    sellerGovernorate: 'المنيا',
    price: 360,
    originalPrice: 420,
    discountPercent: 14,
    rating: 5.0,
    reviewCount: 210,
    inStock: true,
    stockCount: 65,
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'عسل سدر جبلي خام غير مبستر وغير مصفى حرارياً، مأخوذ من مناحل جبال المنيا ووديان الصعيد. غني بمضادات الأكسدة ومثالي لرفع المناعة والطاقة.',
    specifications: {
      material: 'عسل نحل سدر جبلي خام 100%',
      originGovernorate: 'المنيا',
      craftsmanship: 'فرز يدوي بارد بدون تسخين',
      weight: '900 جرام',
      careInstructions: 'يحفظ في درجة حرارة الغرفة بعيداً عن أشعة الشمس المباشرة',
      estimatedMakingTime: 'إنتاج موسم السدر'
    },
    tags: ['عسل سدر', 'المنيا', 'عسل جبلي', 'مناعة', 'طبيعي', 'خام'],
    isHandmade: false,
    isHeritage: true,
    isFeatured: true,
    isNewArrival: false,
    createdAt: '2024-01-05',
    approvalStatus: 'approved'
  },
  {
    id: 'prod-8',
    title: 'صينية نحاس صعيدي مطروقة بالنقوش الإسلامية (الأقصر)',
    titleEn: 'Hand-Engraved Brass Serving Tray from Luxor',
    categoryId: 'copper-wood',
    categoryName: 'النحاسيات والخشب المعشق',
    sellerId: 'seller-5',
    sellerName: 'مشغولات القرنة والخوص',
    sellerGovernorate: 'الأقصر',
    price: 890,
    originalPrice: 1100,
    discountPercent: 19,
    rating: 4.8,
    reviewCount: 38,
    inStock: true,
    stockCount: 10,
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'صينية ضيافة نحاس أحمر ثقيل مطروقة يدوياً بالمطرقة والأزميل في ورش الأقصر. نقوش هندسية دقيقة تعكس روح الضيافة الصعيدية الكريمة.',
    specifications: {
      material: 'نحاس أحمر مصري خالص عيار ثقيل',
      originGovernorate: 'الأقصر',
      craftsmanship: 'طرق ونقش يدوي حر بالمطرقة والأزاميل',
      dimensions: 'قطر 40 سم',
      weight: '1.6 كجم',
      careInstructions: 'تلمع بالليمون والملح أو ملمع النحاس التقليدي للحفاظ على بريقها',
      estimatedMakingTime: '8 أيام عمل'
    },
    tags: ['نحاس', 'الأقصر', 'صينية', 'طرق يدوي', 'ضيافة صعيدية'],
    isHandmade: true,
    isHeritage: true,
    isFeatured: false,
    isNewArrival: true,
    createdAt: '2024-02-12',
    approvalStatus: 'approved'
  },
  {
    id: 'prod-9',
    title: 'كركديه أسواني لوزة كاملة قطفة أولى فاخر - 500 جرام (أسوان)',
    titleEn: 'Premium Whole Flower Aswan Hibiscus 500g',
    categoryId: 'natural-honey-herbs',
    categoryName: 'عسل جبلي وأعشاب الصعيد',
    sellerId: 'seller-3',
    sellerName: 'خيرات بلاد الذهب - أسوان',
    sellerGovernorate: 'أسوان',
    price: 110,
    originalPrice: 135,
    discountPercent: 18,
    rating: 4.9,
    reviewCount: 145,
    inStock: true,
    stockCount: 80,
    images: [
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'كركديه أسواني حب كامل قطفة أولى بلون قرمزي داكن وطعم مركز ونكهة لا مثيل لها. منقى يدوياً من الشوائب والتراب.',
    specifications: {
      material: 'زهور كركديه أسواني طبيعي 100%',
      originGovernorate: 'أسوان',
      craftsmanship: 'جني وتجفيف شمسي وتنقية يدوية',
      weight: '500 جرام',
      careInstructions: 'يحفظ في مكان جاف مغلق بإحكام',
      estimatedMakingTime: 'محصول حديث'
    },
    tags: ['كركديه', 'أسوان', 'أعشاب', 'مشروب تراثي', 'صحة'],
    isHandmade: false,
    isHeritage: true,
    isFeatured: false,
    isNewArrival: false,
    createdAt: '2024-01-18',
    approvalStatus: 'approved'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'order-1001',
    orderNumber: 'SAED-2401',
    buyerId: 'user-buyer-1',
    buyerName: 'أحمد محمود الهاشمي',
    buyerPhone: '01019882233',
    buyerEmail: 'ahmed.hashmi@gmail.com',
    shippingAddress: {
      fullName: 'أحمد محمود الهاشمي',
      phone: '01019882233',
      governorate: 'القاهرة',
      city: 'مدينة نصر',
      streetAddress: 'شارع الطيران - بجوار مسجد رابعة',
      buildingNo: 'عمارة 14 - الدور 4',
      notes: 'يرجى الاتصال قبل الوصول بنصف ساعة'
    },
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1
      },
      {
        product: INITIAL_PRODUCTS[1],
        quantity: 1
      }
    ],
    status: 'shipped',
    paymentMethod: 'vodafone_cash',
    paymentStatus: 'paid',
    paymentReference: 'VF-9844129',
    subtotal: 1635,
    shippingFee: 45,
    discountAmount: 100,
    discountCode: 'SAEED100',
    total: 1580,
    createdAt: '2024-02-22T10:30:00Z',
    updatedAt: '2024-02-23T14:00:00Z',
    trackingNumber: 'EG-SAED-9921',
    timeline: [
      {
        status: 'review',
        title: 'تم استلام الطلب',
        description: 'تم تسجيل طلبك وتأكيد الدفع عبر فودافون كاش',
        time: '22 فبراير 10:30 ص',
        done: true
      },
      {
        status: 'confirmed',
        title: 'تم التأكيد مع الورش',
        description: 'تواصلنا مع ورشة عم سعيد وأنوال أخميم لتجهيز القطع التراثية',
        time: '22 فبراير 12:15 م',
        done: true
      },
      {
        status: 'processing',
        title: 'جاري التغليف التراثي المحكم',
        description: 'تم تجهيز وتغليف الفخار والكليم بعناية لضمان سلامة النقل',
        time: '23 فبراير 09:00 ص',
        done: true
      },
      {
        status: 'shipped',
        title: 'تم تسليم الشحنة لمندوب صعيد إكسبريس',
        description: 'الشحنة في طريقها من الصعيد إلى القاهرة',
        time: '23 فبراير 02:00 م',
        done: true
      },
      {
        status: 'out_for_delivery',
        title: 'في طريقها للتسليم إلى باب منزلك',
        description: 'المندوب يستعد للتسليم اليوم',
        time: 'متوقع غداً',
        done: false
      },
      {
        status: 'delivered',
        title: 'تم التسليم بنجاح',
        description: 'تم تسليم الطلب للعميل',
        time: 'متوقع خلال 24 ساعة',
        done: false
      }
    ],
    sellerIds: ['seller-1', 'seller-2']
  },
  {
    id: 'order-1002',
    orderNumber: 'SAED-2402',
    buyerId: 'user-buyer-1',
    buyerName: 'أحمد محمود الهاشمي',
    buyerPhone: '01019882233',
    shippingAddress: {
      fullName: 'أحمد محمود الهاشمي',
      phone: '01019882233',
      governorate: 'القاهرة',
      city: 'المعادي',
      streetAddress: 'شارع 9 - دجلة',
      buildingNo: 'برج الأندلس',
      notes: ''
    },
    items: [
      {
        product: INITIAL_PRODUCTS[3],
        quantity: 2
      },
      {
        product: INITIAL_PRODUCTS[6],
        quantity: 1
      }
    ],
    status: 'delivered',
    paymentMethod: 'instapay',
    paymentStatus: 'paid',
    paymentReference: 'IP-552199',
    subtotal: 750,
    shippingFee: 40,
    discountAmount: 0,
    total: 790,
    createdAt: '2024-02-10T14:20:00Z',
    updatedAt: '2024-02-14T16:00:00Z',
    trackingNumber: 'EG-SAED-8832',
    timeline: [
      { status: 'review', title: 'تم استلام الطلب', description: 'تم الدفع عبر انستاباي', time: '10 فبراير', done: true },
      { status: 'confirmed', title: 'تم التأكيد', description: 'تم تأكيد التمور وعسل السدر', time: '10 فبراير', done: true },
      { status: 'processing', title: 'التجهيز', description: 'تغليف آمن للمواد الغذائية', time: '11 فبراير', done: true },
      { status: 'shipped', title: 'الشحن', description: 'انطلقت الشحنة من أسوان', time: '12 فبراير', done: true },
      { status: 'delivered', title: 'تم التسليم', description: 'استلم العميل الطلب بحالة ممتازة', time: '14 فبراير', done: true }
    ],
    sellerIds: ['seller-3']
  }
];

export const INITIAL_DISCOUNTS: DiscountCoupon[] = [
  {
    id: 'disc-1',
    code: 'SAEED100',
    discountPercent: 10,
    maxDiscount: 100,
    minOrderValue: 500,
    active: true,
    validUntil: '2026-12-31',
    usageCount: 342,
    description: 'خصم 10% بحد أقصى 100 جنيه للطلبات فوق 500 جنيه'
  },
  {
    id: 'disc-2',
    code: 'ASWAN15',
    discountPercent: 15,
    maxDiscount: 200,
    minOrderValue: 800,
    active: true,
    validUntil: '2026-12-31',
    usageCount: 180,
    description: 'خصم 15% على منتجات أسوان والتراث النوبي'
  },
  {
    id: 'disc-3',
    code: 'AHMIM20',
    discountPercent: 20,
    maxDiscount: 350,
    minOrderValue: 1200,
    active: true,
    validUntil: '2026-12-31',
    usageCount: 95,
    description: 'خصم ترويجي على الكليم والسجاد اليدوي'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    productTitle: 'قلة قناوية فخار أصلي',
    userId: 'u-1',
    userName: 'د. خالد عبد السميع',
    userGovernorate: 'الإسكندرية',
    rating: 5,
    comment: 'القلة تحفة فنية حقيقية! الماء فيها بارد جداً ونظيف وريحة طمي النيل الأصيل تريح النفس. وصلت مغلفة بعناية فائقة بدون أي خدش.',
    date: 'منذ 4 أيام',
    verifiedPurchase: true,
    status: 'published'
  },
  {
    id: 'rev-2',
    productId: 'prod-2',
    productTitle: 'كليم أخميم صوفي يدوي أصلي',
    userId: 'u-2',
    userName: 'سارة عبد الفتاح',
    userGovernorate: 'القاهرة',
    rating: 5,
    comment: 'كليم أخميم لا يوصف من جمال الألوان ودقة النسيج الصوفي. أضاف لغرفة المعيشة دفء وروح مصرية أصيلة. شكراً للحاجة أم هاشم ولسوق الصعيد!',
    date: 'منذ أسبوع',
    verifiedPurchase: true,
    status: 'published'
  },
  {
    id: 'rev-3',
    productId: 'prod-4',
    productTitle: 'تمر مجدول أسواني فاخر (1 كجم)',
    userId: 'u-3',
    userName: 'محمود الصاوي',
    userGovernorate: 'الجيزة',
    rating: 5,
    comment: 'التمر المجدول الأسواني طازج جداً ولذيذ وحجمه كبير. تجربة شراء ممتازة والشحن سريع خلال 48 ساعة فقط.',
    date: 'منذ أسبوعين',
    verifiedPurchase: true,
    status: 'published'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    userName: 'مدير المنصة (Admin)',
    userRole: 'admin',
    action: 'اعتماد منتج جديد',
    resource: 'كليم أخميم صوفي يدوي أصلي',
    timestamp: '2024-02-23 11:20:00',
    status: 'نجاح',
    details: 'تم التحقق من مطابقة معايير الحرفة اليدوية واعتماد المنتج للنشر'
  },
  {
    id: 'log-2',
    userName: 'أنوال أخميم التراثية',
    userRole: 'seller',
    action: 'تحديث المخزون',
    resource: 'كليم صوفي سوهاج',
    timestamp: '2024-02-23 09:14:00',
    status: 'نجاح',
    details: 'تمت إضافة 5 قطع جديدة للمخزون بعد انتهاء النسيج'
  },
  {
    id: 'log-3',
    userName: 'أحمد محمود الهاشمي',
    userRole: 'buyer',
    action: 'إنشاء طلب شراء ودفع',
    resource: 'طلب #SAED-2401',
    timestamp: '2024-02-22 10:30:00',
    status: 'نجاح',
    details: 'تم تأكيد تحويل فودافون كاش بقيمة 1,580 ج.م'
  },
  {
    id: 'log-4',
    userName: 'فخار عم سعيد التراثي',
    userRole: 'seller',
    action: 'تحديث حالة الشحن',
    resource: 'طلب #SAED-2401',
    timestamp: '2024-02-23 14:00:00',
    status: 'نجاح',
    details: 'تم تسليم الشحنة لمكتب الشحن بقنا'
  }
];

export const INITIAL_CRAFT_STORIES: CraftStory[] = [
  {
    id: 'craft-pottery',
    title: 'فخار قنا وأسيوط (طين النيل العذب)',
    subtitle: 'سر البرودة والنكهة الخالدة منذ عهد الفراعنة',
    governorate: 'قنا وأسيوط',
    historyAge: 'أكثر من 5000 عام',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
    description:
      'يتميز فخار قنا بطميه الخاص المستخرج من ضفاف النيل والوديان الجبلية المحيطة، حيث تشتهر قرى قنا بإنتاج "القِلال" و"الزير" و"القدور" التي تبرد الماء طبيعياً بالترشيح الدقيق وتحفظ طراوة الطعام دون حاجة للكهرباء.',
    keyFeatures: [
      'تبريد طبيعي فوري عبر مسام الفخار النقية',
      'صناعة يدوية على دولاب الفخار الخشبي',
      'حرق في أفران بلدية تقليدية معالجة بالحرارة',
      'آمن وصحي 100% وخالٍ من الرصاص والكيماويات'
    ],
    categoryId: 'pottery',
    displayOrder: 1,
    active: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'craft-akhmim',
    title: 'كليم أخميم الصوفي (أنوال سوهاج)',
    subtitle: 'عاصمة النسيج اليدوي في مصر العليا',
    governorate: 'سوهاج (أخميم)',
    historyAge: 'أكثر من 2000 عام',
    image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
    description:
      'تُلقب مدينة أخميم بـ "مانشستر ما قبل التاريخ". تعتمد نساء ورجال أخميم على نول النسيج اليدوي لغزل صوف الخراف الطبيعي وصبغه بصبغات نباتية أصيلة كقشور الرمان والكركم، لتخرج قطع سجاد وكليم هندسية تدوم لأجيال.',
    keyFeatures: [
      'صوف طبيعي 100% مغزول يدوياً',
      'أصباغ نباتية طبيعية مقاومة للبهتان',
      'نقوش فرعونية وإسلامية وقبطية متداخلة',
      'عزل حراري ممتاز للأرضيات في الشتاء والصيف'
    ],
    categoryId: 'kilim-carpets',
    displayOrder: 2,
    active: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'craft-tally',
    title: 'تلي أسيوط (التطريز بشرائط الفضة)',
    subtitle: 'ثروة النساء التراثية وتحفة المتاحف العالمية',
    governorate: 'أسيوط',
    historyAge: 'منذ القرن التاسع عشر',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    description:
      'فن التلي الأسيوطي هو تطريز دقيق يستعمل شرائط معدنية مفلطحة من الفضة أو النحاس المطلية، تُغرز على شاش قطني رقيق بتسع غرز رئيسية لتشكيل رموز الحياة والخصوبة وأشجار النخيل وأباريق الماء.',
    keyFeatures: [
      'تطريز يدوي دقيق يستغرق من أسبوع إلى شهر لكل قطعة',
      'شرائط فضية ونحاسية أصلية لامعة',
      'قطعة تراثية راقية مسجلة في اليونسكو',
      'إطلالة ساحرة للمناسبات والضيافة الرفيعة'
    ],
    categoryId: 'tally-embroidery',
    displayOrder: 3,
    active: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'craft-nubian-wicker',
    title: 'خوص النخيل وسلال الدوم (أسوان والنوبة)',
    subtitle: 'هدية النخلة الصعيدية والجمال البيئي المستدام',
    governorate: 'أسوان والأقصر',
    historyAge: 'متوارثة عبر القرون',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80',
    description:
      'من خيرات بساتين النخيل والدوم في أسوان والنوبة وغرب الأقصر، يتم جمع الخوص وجدله بألوان مبهجة لصناعة سلال العيش، وحقائب السفر، وحافظات الأطعمة المستدامة والصديقة للبيئة.',
    keyFeatures: [
      'خامات بيئية طبيعية 100% قابلة للتحلل',
      'ألوان نوبية زاهية ومبهجة تضفي دفئاً للمنزل',
      'متانة عالية وتحمل لسنوات طويلة',
      'تصاميم تناسب الديكور العصري والبوهيمي'
    ],
    categoryId: 'palm-wicker',
    displayOrder: 4,
    active: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

