import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { MapGovernorateData, MapMarkerItem, Product } from '../../types';
import {
  Landmark,
  Hammer,
  Utensils,
  ShoppingBag,
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  LayoutGrid,
  Check,
  Scroll,
  Star,
  Ship,
  Sparkles
} from 'lucide-react';

// Regional palette definition with authentic Upper Egyptian earth tones
const REGION_THEMES: Record<string, { badge: string; color: string; hoverColor: string; bgSoft: string; border: string }> = {
  'شمال الصعيد': {
    badge: 'bg-emerald-100 text-emerald-950 dark:bg-emerald-950/80 dark:text-emerald-200 border-emerald-400 dark:border-emerald-700',
    color: '#047857',
    hoverColor: '#059669',
    bgSoft: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-300 dark:border-emerald-800'
  },
  'وسط الصعيد': {
    badge: 'bg-amber-100 text-amber-950 dark:bg-amber-950/80 dark:text-amber-200 border-amber-400 dark:border-amber-700',
    color: '#B45309',
    hoverColor: '#D97706',
    bgSoft: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-300 dark:border-amber-800'
  },
  'جنوب الصعيد': {
    badge: 'bg-rose-100 text-rose-950 dark:bg-rose-950/80 dark:text-rose-200 border-rose-400 dark:border-rose-700',
    color: '#9E3C1B',
    hoverColor: '#B45F42',
    bgSoft: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-300 dark:border-rose-800'
  },
  'الواحات والصحراء الغربية': {
    badge: 'bg-yellow-100 text-yellow-950 dark:bg-yellow-950/80 dark:text-yellow-200 border-yellow-400 dark:border-yellow-700',
    color: '#A16207',
    hoverColor: '#CA8A04',
    bgSoft: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-300 dark:border-yellow-800'
  }
};

// Emblems and symbols for quick visual recognition
const GOVERNORATE_EMBLEMS: Record<string, { symbol: string; label: string; folklore: string; proverb: string }> = {
  'الفيوم': {
    symbol: '💧',
    label: 'أرض السواقي والخزف',
    folklore: 'تحتضن الفيوم بحيرة قارون وقرية تونس الشهيرة بالخزف الريفي، وتتوارث العائلات صناعة الفخار وسواقي الهدير التي ترفع مياه بحر يوسف منذ مئات السنين.',
    proverb: '«السواقي تدور وتغني، والخير في بحر يوسف ما ينتهي»'
  },
  'بني سويف': {
    symbol: '🗿',
    label: 'بوابة الصعيد وهرم ميدوم',
    folklore: 'بوابة صعيد مصر الشمالية وملتقى وادي النيل بالصحراء الشرقية، مهد هرم ميدوم العريق الذي يروي بداية تطور بناء الأهرامات في مصر القديمة.',
    proverb: '«أول خطوة في الصعيد سلام، ومن يدخلها يلقى الإكرام»'
  },
  'المنيا': {
    symbol: '📜',
    label: 'عروس الصعيد والتوحيد',
    folklore: 'أرض الفكر والتوحيد في تل العمارنة حيث أقام إخناتون عاصمته، وموطن مقابر بني حسن المنحوتة في الصخر ودير السيدة العذراء بجبل الطير.',
    proverb: '«عروس الصعيد النيل في حضنها، والنخل عالي في سماها»'
  },
  'أسيوط': {
    symbol: '🪡',
    label: 'قلب الصعيد وفن التلي',
    folklore: 'عاصمة التجارة التاريخية ودرب الأربعين، وتتميز عالمياً بفن التلي الأسيوطي الرفيع المشغول يدوياً بشرائط الفضة الصافية على أقمشة الشبيكة.',
    proverb: '«التلي مش بس خيط فضة، دي حكاية فرح وزفة عروسة»'
  },
  'سوهاج': {
    symbol: '🧵',
    label: 'معقل الحرير ومهد الملوك',
    folklore: 'أرض معبد أبيدوس المقدس وقبر أوزوريس الأسطوري، ومدينة أخميم التاريخية التي لُقبت بمانشستر ما قبل التاريخ بفضل أنوال الحرير والكتان المتوارثة.',
    proverb: '«نول أخميم يغزل حرير وصوف، وكرم أهلها بالعين موصوف»'
  },
  'قنا': {
    symbol: '🏺',
    label: 'أرض القلال ومعبد دندرة',
    folklore: 'مهد ثنية النيل العظمى ومعبد دندرة الخالد للإلهة حتحور، وتشتهر بصناعة قلال الفخار التراثية التي تبرد الماء بطين قنا المميز وأنوال الفركة بنقادة.',
    proverb: '«من شرب من قلال قنا، لا بد يعود لبلادنا»'
  },
  'الأقصر': {
    symbol: '🏛️',
    label: 'طيبة عاصمة العالم القديم',
    folklore: 'تحتضن ثلث آثار الإنسانية من معابد الكرنك والأقصر إلى وادي الملوك والملكات بالبر الغربي، وتزدهر بحرفة نحت حجر الألباستر اليدوي في القرنة.',
    proverb: '«طيبة بلد التاريخ والنور، من يزورها قلبه مسرور»'
  },
  'أسوان': {
    symbol: '☀️',
    label: 'بلاد الذهب والنوبة الخالدة',
    folklore: 'درة النيل الجنوبية وبلاد الذهب، موطن البيوت النوبية الملونة ومعابد فيلة وأبو سمبل، وأسواق البهارات والكركديه ومشغولات الخوص الدقيقة.',
    proverb: '«في أسوان السلام في القلوب قبل البيوت، والنيل فيها ما يفوت»'
  },
  'الوادي الجديد': {
    symbol: '🌴',
    label: 'واحات النخيل والكنوز',
    folklore: 'أكبر محافظات مصر مساحةً وتضم واحات الخارجة والداخلة والفرافرة، مهد مدينة القصر الإسلامية ومعبد هيبس وأجود أنواع تمور النخيل وسلال الخوص.',
    proverb: '«نخلة الواحات أصلها ثابت في الأرض، وخيرها يفيض على الكل»'
  }
};

// Fallback data for all 9 Upper Egyptian governorates in geographic sequence (North to South)
const VOYAGE_GOVERNORATES: MapGovernorateData[] = [
  {
    id: 'gov-fayoum',
    name: 'الفيوم',
    slug: 'fayoum',
    nickname: 'واحة الصعيد الخضراء وأرض السواقي',
    region: 'شمال الصعيد',
    nileSegment: 'بحر يوسف وبحيرة قارون وسواقي الهدير',
    shortIntro: 'واحة طبيعية وتاريخية فريدة تحتضن قرية تونس لصناعة الخزف ووادي الحيتان العالمي وبحيرة قارون وسواقي الهدير الخالدة.',
    famousFor: ['قرية تونس للخزف', 'وادي الحيتان ووادي الريان', 'سواقي الهدير', 'بحيرة قارون', 'الفطير المشلتت والبط البلدي'],
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    capitalCity: 'مدينة الفيوم',
    coordinates: { lat: 29.3084, lng: 30.8428 },
    stats: { placesCount: 4, craftsCount: 3, storiesCount: 3, foodsCount: 3, eventsCount: 2, productsCount: 12 }
  },
  {
    id: 'gov-bani-suef',
    name: 'بني سويف',
    slug: 'bani-suef',
    nickname: 'بوابة الصعيد ولؤلؤة النيل الوسطى',
    region: 'شمال الصعيد',
    nileSegment: 'مجرى النيل الأوسط وبساتين ميدوم',
    shortIntro: 'بوابة صعيد مصر الشمالية، مهد هرم ميدوم الأسطوري ومحمية كهف سنور ومزارع النباتات العطرية والطبية الأصيلة.',
    famousFor: ['هرم ميدوم العريق', 'محمية كهف وادي سنور', 'النباتات الطبية والعطرية', 'الفخار اليدوي السويفي'],
    coverImage: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1200&auto=format&fit=crop&q=80',
    capitalCity: 'مدينة بني سويف',
    coordinates: { lat: 29.0661, lng: 31.0994 },
    stats: { placesCount: 3, craftsCount: 2, storiesCount: 2, foodsCount: 3, eventsCount: 1, productsCount: 8 }
  },
  {
    id: 'gov-minya',
    name: 'المنيا',
    slug: 'minya',
    nickname: 'عروس الصعيد وعاصمة التوحيد والفكر',
    region: 'وسط الصعيد',
    nileSegment: 'كورنيش عروس الصعيد وجبل الطير',
    shortIntro: 'عروس الصعيد وأرض الفكر والتوحيد، موطن تل العمارنة وإخناتون ومقابر بني حسن المنحوتة ودير السيدة العذراء بجبل الطير.',
    famousFor: ['تل العمارنة وعاصمة إخناتون', 'مقابر بني حسن الصخرية', 'دير جبل الطير التاريخي', 'العسل الأسود والملوخية البوراني'],
    coverImage: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1200&auto=format&fit=crop&q=80',
    capitalCity: 'مدينة المنيا',
    coordinates: { lat: 28.1099, lng: 30.7503 },
    stats: { placesCount: 5, craftsCount: 3, storiesCount: 4, foodsCount: 3, eventsCount: 2, productsCount: 14 }
  },
  {
    id: 'gov-asyut',
    name: 'أسيوط',
    slug: 'asyut',
    nickname: 'قلب الصعيد النابض وعاصمة فن التلي الرفيع',
    region: 'وسط الصعيد',
    nileSegment: 'قناطر أسيوط التاريخية ومحطة درب الأربعين',
    shortIntro: 'قلب الصعيد النابض ومستودع التاريخ التجاري، عاصمة فن التلي المشغول بخيوط الفضة الصافية والدير المحرق التاريخي بالقوصية.',
    famousFor: ['فن التلي الأسيوطي بالفضة', 'الدير المحرق بالقوصية', 'قناطر أسيوط التاريخية', 'صناعة السجاد الصوف اليدوي'],
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    capitalCity: 'مدينة أسيوط',
    coordinates: { lat: 27.1809, lng: 31.1837 },
    stats: { placesCount: 4, craftsCount: 4, storiesCount: 3, foodsCount: 3, eventsCount: 2, productsCount: 15 }
  },
  {
    id: 'gov-sohag',
    name: 'سوهاج',
    slug: 'sohag',
    nickname: 'معقل النسيج والحرير ومهد ملوك مصر',
    region: 'جنوب الصعيد',
    nileSegment: 'منحنى النيل بسوهاج وجزر الزهور وأبيدوس',
    shortIntro: 'أرض الملوك ومنبت موحد القطرين، تضم معبد أبيدوس المقدس وأنوال الحرير والكتان بأخميم أقدم عاصمة نسيج في العالم القديم.',
    famousFor: ['معبد أبيدوس وسيتي الأول', 'أنوال النسيج والحرير بأخميم', 'الدير الأبيض والدير الأحمر', 'تمثال ميريت آمون'],
    coverImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&auto=format&fit=crop&q=80',
    capitalCity: 'مدينة سوهاج',
    coordinates: { lat: 26.5569, lng: 31.6948 },
    stats: { placesCount: 5, craftsCount: 4, storiesCount: 3, foodsCount: 4, eventsCount: 2, productsCount: 16 }
  },
  {
    id: 'gov-qena',
    name: 'قنا',
    slug: 'qena',
    nickname: 'أرض القلال القناوية ومعبد دندرة والفركة',
    region: 'جنوب الصعيد',
    nileSegment: 'ثنية قنا العظمى ملتقى الصحراء والنيل',
    shortIntro: 'عقدة النيل وسحر ثنية قنا الشهيرة، مهد معبد حتحور بدندرة وقلال وجرار الفخار القناوي الأصيل وأنوال الفركة بنقادة.',
    famousFor: ['معبد دندرة الخالد', 'فخار قنا والقلل القناوي', 'فركة نقادة الحريرية اليدوية', 'مسجد سيدي عبد الرحيم القناوي', 'عصير ومزارع قصب السكر'],
    coverImage: 'https://images.unsplash.com/photo-1599833975787-5c143f373c30?w=1200&auto=format&fit=crop&q=80',
    capitalCity: 'مدينة قنا',
    coordinates: { lat: 26.1551, lng: 32.7160 },
    stats: { placesCount: 6, craftsCount: 4, storiesCount: 4, foodsCount: 4, eventsCount: 3, productsCount: 18 }
  },
  {
    id: 'gov-luxor',
    name: 'الأقصر',
    slug: 'luxor',
    nickname: 'طيبة عاصمة العالم القديم ومدينة الشمس',
    region: 'جنوب الصعيد',
    nileSegment: 'ضفتي طيبة الخالدتين ووادي الملوك',
    shortIntro: 'عاصمة التاريخ وطيبة العظمى، تحتضن ثلث آثار العالم من معابد الكرنك والأقصر إلى وادي الملوك ونحاتي الألباستر بالقرنة.',
    famousFor: ['معابد الكرنك والأقصر', 'وادي الملوك والملكات', 'نحت الألباستر بالقرنة', 'البالون الطائر', 'صناعة ورق البردي'],
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    capitalCity: 'مدينة الأقصر',
    coordinates: { lat: 25.6872, lng: 32.6396 },
    stats: { placesCount: 8, craftsCount: 4, storiesCount: 5, foodsCount: 4, eventsCount: 3, productsCount: 22 }
  },
  {
    id: 'gov-aswan',
    name: 'أسوان',
    slug: 'aswan',
    nickname: 'بلاد الذهب وموئل السحر النوبي الخالد',
    region: 'جنوب الصعيد',
    nileSegment: 'شلال النيل الأول وبحيرة ناصر والسد العالي',
    shortIntro: 'بلاد الذهب ودرة النيل الجنوبية، ملتقى السحر النوبي والبيوت الملونة بمعبد فيلة وأبو سمبل، وسوق التوابل والكركديه والخوص.',
    famousFor: ['معبد فيلة وأبو سمبل', 'قرى النوبة وغرب سهيل', 'مشغولات الخوص والخرز النوبي', 'سوق التوابل والكركديه الأسواني', 'جزيرة النباتات ومحمية سالوجا'],
    coverImage: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1200&auto=format&fit=crop&q=80',
    capitalCity: 'مدينة أسوان',
    coordinates: { lat: 24.0889, lng: 32.8998 },
    stats: { placesCount: 7, craftsCount: 5, storiesCount: 5, foodsCount: 4, eventsCount: 3, productsCount: 24 }
  },
  {
    id: 'gov-new-valley',
    name: 'الوادي الجديد',
    slug: 'new-valley',
    nickname: 'واحات الأساطير وكنوز الصحراء الغربية',
    region: 'الواحات والصحراء الغربية',
    nileSegment: 'درب الأربعين الواصل إلى وادي النيل والواحات',
    shortIntro: 'جنة واحات مصر الغربية (الخارجة والداخلة والفرافرة)، أرض مدينة القصر الإسلامية ومعبد هيبس وتمور النخيل الفاخرة.',
    famousFor: ['مدينة القصر الإسلامية بالداخلة', 'معبد هيبس بالخارجة', 'محمية الصحراء البيضاء بالفرافرة', 'تمور الواحات وسلال الخوص'],
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    capitalCity: 'مدينة الخارجة',
    coordinates: { lat: 25.4514, lng: 30.5464 },
    stats: { placesCount: 5, craftsCount: 3, storiesCount: 3, foodsCount: 3, eventsCount: 2, productsCount: 11 }
  }
];

// Curated landmarks and crafts for dossier
const VOYAGE_MARKERS: MapMarkerItem[] = [
  {
    id: 'marker-dendera',
    title: 'معبد دندرة للإلهة حتحور',
    slug: 'dendera-temple',
    type: 'place',
    typeLabel: 'صرح أثري فرعوني',
    governorateId: 'gov-qena',
    governorateName: 'قنا',
    lat: 26.142,
    lng: 32.670,
    coverImage: 'https://images.unsplash.com/photo-1599833975787-5c143f373c30?w=600&auto=format&fit=crop&q=80',
    shortDescription: 'أحد أبهى وأكمل المعابد المصرية القديمة بسقوفه الملونة وأبراج زودياك الفلكية الخالدة.',
    isFeatured: true
  },
  {
    id: 'marker-qena-pottery',
    title: 'ورش صناعة الفخار والقلال القناوية',
    slug: 'qena-pottery-craft',
    type: 'craft',
    typeLabel: 'حرفة تراثية عريقة',
    governorateId: 'gov-qena',
    governorateName: 'قنا',
    lat: 26.160,
    lng: 32.720,
    coverImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
    shortDescription: 'صناعة القلل والجرار التراثية المتوارثة من طمي وادي النيل لتبريد مياه الشرب طبيعياً.',
    isFeatured: true
  },
  {
    id: 'marker-karnak',
    title: 'مجمع معابد الكرنك العظيم',
    slug: 'karnak-temples',
    type: 'place',
    typeLabel: 'أكبر مجمع ديني بالتاريخ',
    governorateId: 'gov-luxor',
    governorateName: 'الأقصر',
    lat: 25.718,
    lng: 32.658,
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    shortDescription: 'أعظم دور العبادة في التاريخ القديم بصالة الأعمدة الكبرى ومسلات حتشبسوت الخالدة.',
    isFeatured: true
  },
  {
    id: 'marker-philae',
    title: 'معبد فيلة لؤلؤة النيل',
    slug: 'philae-temple',
    type: 'place',
    typeLabel: 'معبد جزيرة النيل',
    governorateId: 'gov-aswan',
    governorateName: 'أسوان',
    lat: 24.025,
    lng: 32.884,
    coverImage: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600&auto=format&fit=crop&q=80',
    shortDescription: 'معبد إيزيس الساحر القائم وسط مياه بحيرة خزان أسوان بروعته المعمارية الخاطفة.',
    isFeatured: true
  },
  {
    id: 'marker-akhmeem-weaving',
    title: 'أنوال نسيج وحرير أخميم',
    slug: 'akhmeem-silk-weaving',
    type: 'craft',
    typeLabel: 'حرفة عالمية متوارثة',
    governorateId: 'gov-sohag',
    governorateName: 'سوهاج',
    lat: 26.565,
    lng: 31.745,
    coverImage: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&auto=format&fit=crop&q=80',
    shortDescription: 'غزل الحرير والكتان على الأنوال اليدوية المتوارثة في أخميم منذ عصور الفراعنة.',
    isFeatured: true
  },
  {
    id: 'marker-asyut-tally',
    title: 'فن التلي الأسيوطي بالفضة',
    slug: 'asyut-tally-embroidery',
    type: 'craft',
    typeLabel: 'تطريز تراثي بالفضة',
    governorateId: 'gov-asyut',
    governorateName: 'أسيوط',
    lat: 27.181,
    lng: 31.185,
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    shortDescription: 'تطريز يدوي بخيوط الفضة والذهب على الشبيكة متوارث كتحفة فنية أسيوطية مسجلة عالمياً.',
    isFeatured: true
  },
  {
    id: 'marker-meidum',
    title: 'هرم ميدوم العريق',
    slug: 'meidum-pyramid',
    type: 'place',
    typeLabel: 'معلم تاريخي معماري',
    governorateId: 'gov-bani-suef',
    governorateName: 'بني سويف',
    lat: 29.261,
    lng: 31.157,
    coverImage: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=600&auto=format&fit=crop&q=80',
    shortDescription: 'حلقة الوصل المعمارية بين الهرم المدرج والأهرام الكاملة وأحد أقدم شواهد الحضارة ببني سويف.',
    isFeatured: true
  },
  {
    id: 'marker-tunis-village',
    title: 'قرية تونس وفخار الفيوم',
    slug: 'tunis-pottery-village',
    type: 'craft',
    typeLabel: 'مركز عالمي للخزف',
    governorateId: 'gov-fayoum',
    governorateName: 'الفيوم',
    lat: 29.245,
    lng: 30.485,
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    shortDescription: 'عاصمة الخزف الفني والبيئي على ضفاف بحيرة قارون ومقصد محبي الفن والتراث.',
    isFeatured: true
  }
];

export const UpperEgyptMapPage: React.FC = () => {
  const { navigateToGovernorate, setActivePage, products, addToCart } = useApp();

  // Governorates data & markers
  const [governorates, setGovernorates] = useState<MapGovernorateData[]>(VOYAGE_GOVERNORATES);
  const [markers, setMarkers] = useState<MapMarkerItem[]>(VOYAGE_MARKERS);

  // Selected Governorate State (defaults to Qena - heart of Upper Egypt)
  const [selectedIndex, setSelectedIndex] = useState<number>(5); // Index 5 = Qena
  const selectedGov = governorates[selectedIndex] || governorates[0];

  // Active Tab inside governorate dossier: places | crafts | foods | folklore | products
  const [activeTab, setActiveTab] = useState<'places' | 'crafts' | 'foods' | 'folklore' | 'products'>('places');

  // Exploration display mode (no map):
  // 1. 'voyage': Nile River Corridor (step-by-step cruise station)
  // 2. 'grid': All 9 Governorates Bento Cards
  const [displayMode, setDisplayMode] = useState<'voyage' | 'grid'>('voyage');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('الكل');

  // Added-to-cart toast visual state
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Load live data from API with fallback guarantee
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const payload = await wahApi.getFullMapPayload();
        if (isMounted) {
          if (payload.governorates && payload.governorates.length > 0) {
            setGovernorates(payload.governorates);
          }
          if (payload.markers && payload.markers.length > 0) {
            setMarkers(payload.markers);
          }
        }
      } catch (err) {
        console.warn('Live map data loaded from verified fallback', err);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Stepping through stations
  const handleNextStation = () => {
    if (selectedIndex < governorates.length - 1) {
      setSelectedIndex((prev) => prev + 1);
    } else {
      setSelectedIndex(0); // Wrap around smoothly
    }
  };

  const handlePrevStation = () => {
    if (selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1);
    } else {
      setSelectedIndex(governorates.length - 1); // Wrap around smoothly
    }
  };

  // Filtered Governorates for Grid View & Search
  const filteredGovernorates = useMemo(() => {
    return governorates.filter((gov) => {
      const matchesSearch =
        !searchQuery.trim() ||
        gov.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        (gov.nickname && gov.nickname.toLowerCase().includes(searchQuery.trim().toLowerCase())) ||
        (gov.famousFor && gov.famousFor.some((f) => f.toLowerCase().includes(searchQuery.trim().toLowerCase())));

      const matchesRegion =
        selectedRegionFilter === 'الكل' || gov.region === selectedRegionFilter;

      return matchesSearch && matchesRegion;
    });
  }, [governorates, searchQuery, selectedRegionFilter]);

  // Current governorate's markers
  const currentGovMarkers = useMemo(() => {
    if (!selectedGov) return [];
    return markers.filter(
      (m) => m.governorateId === selectedGov.id || m.governorateName === selectedGov.name
    );
  }, [markers, selectedGov]);

  // Real products from the marketplace matching this governorate
  const govMarketProducts = useMemo(() => {
    if (!selectedGov || !products) return [];
    return products.filter((p) => {
      const originGov = p.specifications?.originGovernorate || p.sellerGovernorate;
      return (
        originGov === selectedGov.name ||
        p.title?.includes(selectedGov.name) ||
        p.tags?.includes(selectedGov.name)
      );
    });
  }, [products, selectedGov]);

  const currentEmblem = GOVERNORATE_EMBLEMS[selectedGov?.name] || {
    symbol: '🏛️',
    label: selectedGov?.region || 'الصعيد',
    folklore: selectedGov?.shortIntro || '',
    proverb: ''
  };
  const currentTheme = (selectedGov?.region && REGION_THEMES[selectedGov.region]) || REGION_THEMES['جنوب الصعيد'];

  // Handle adding product to cart with visual badge
  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#14100E] text-[#1C1613] dark:text-[#FDFBF7] font-sans pb-28 selection:bg-[#9E3C1B] selection:text-white">
      {/* 1. Top Navigation Bar */}
      <header className="border-b-2 border-[#E5DDD2] dark:border-[#2E241E] bg-white/95 dark:bg-[#1C1714]/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3 flex-wrap">
          {/* Breadcrumb & Title */}
          <div className="flex items-center gap-2.5 text-sm sm:text-base font-black">
            <button
              id="voyage-breadcrumb-home"
              onClick={() => setActivePage('home')}
              className="text-[#5A4D42] dark:text-[#C5B8AC] hover:text-[#9E3C1B] dark:hover:text-[#E88E72] transition-colors cursor-pointer"
            >
              الرئيسية
            </button>
            <span className="text-[#C2B5A7]">/</span>
            <div className="flex items-center gap-1.5 text-[#9E3C1B] dark:text-[#E88E72]">
              <Ship className="w-5 h-5" />
              <span className="font-black text-base sm:text-lg">رحلة محافظات الصعيد</span>
            </div>
          </div>

          {/* View Modes: Voyage vs Grid */}
          <div className="flex items-center bg-[#EFE9DF] dark:bg-[#251D18] p-1 rounded-2xl border-2 border-[#D9CFC2] dark:border-[#3D3028]">
            <button
              type="button"
              id="btn-view-voyage"
              onClick={() => setDisplayMode('voyage')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                displayMode === 'voyage'
                  ? 'bg-[#9E3C1B] text-white shadow-xs'
                  : 'text-[#4A3E34] dark:text-[#D5C9BD] hover:text-[#1C1613]'
              }`}
            >
              <Ship className="w-4 h-4" />
              <span>محطة بمحطة (رحلة النيل)</span>
            </button>

            <button
              type="button"
              id="btn-view-grid"
              onClick={() => setDisplayMode('grid')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                displayMode === 'grid'
                  ? 'bg-[#9E3C1B] text-white shadow-xs'
                  : 'text-[#4A3E34] dark:text-[#D5C9BD] hover:text-[#1C1613]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>دليل الـ 9 محافظات</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Quick Horizontal Station Ribbon (All 9 Governorates at a glance) */}
      <nav aria-label="محطات الصعيد الـ 9" className="bg-white/90 dark:bg-[#1A1513]/90 border-b border-[#E5DDD2] dark:border-[#2E241E] py-2.5 px-4 sm:px-6 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3 min-w-max">
          <div className="flex items-center gap-1.5 pl-2 text-xs font-black text-[#8C7A6B] dark:text-[#A8988B] shrink-0 border-l border-[#E5DDD2] dark:border-[#2E241E]">
            <Ship className="w-4 h-4 text-[#9E3C1B]" />
            <span>محطات النيل:</span>
          </div>

          {governorates.map((gov, index) => {
            const isCurrent = index === selectedIndex;
            const emblem = GOVERNORATE_EMBLEMS[gov.name]?.symbol || '🏛️';
            return (
              <button
                key={gov.id}
                type="button"
                id={`ribbon-gov-${gov.slug}`}
                onClick={() => setSelectedIndex(index)}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 border-2 ${
                  isCurrent
                    ? 'bg-[#9E3C1B] text-white border-[#9E3C1B] shadow-sm scale-105'
                    : 'bg-[#FAF7F2] dark:bg-[#251D18] text-[#4A3E34] dark:text-[#D5C9BD] border-[#E2D8CC] dark:border-[#3D3028] hover:border-[#9E3C1B]'
                }`}
              >
                <span className="text-sm">{emblem}</span>
                <span>{gov.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isCurrent ? 'bg-amber-300 text-[#1C1613]' : 'bg-[#E5DDD2] dark:bg-[#3D3028] text-[#5A4D42] dark:text-[#C5B8AC]'
                }`}>
                  {index + 1}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8">
        
        {/* =========================================================
           VIEW 1: PANORAMIC NILE VOYAGE (Sequential Step-by-Step)
           Senior-Friendly Navigation with Huge Controls
           ========================================================= */}
        {displayMode === 'voyage' && (
          <div className="space-y-6">
            {/* Step Navigation Bar */}
            <div className="bg-white dark:bg-[#1C1714] rounded-3xl p-5 sm:p-6 border-2 border-[#E2D8CC] dark:border-[#2E241E] shadow-sm">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Previous Station Button */}
                <button
                  type="button"
                  id="btn-prev-station"
                  onClick={handlePrevStation}
                  className="flex items-center gap-2.5 px-5 sm:px-7 py-3.5 rounded-2xl font-black transition-all cursor-pointer border-2 min-h-[56px] text-sm sm:text-base bg-[#FAF7F2] dark:bg-[#251D18] hover:bg-[#EFE9DF] text-[#1C1613] dark:text-[#FDFBF7] border-[#D9CFC2] dark:border-[#3D3028] shadow-2xs hover:border-[#9E3C1B]"
                  aria-label="المحطة السابقة في مسار رحلة النيل"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#9E3C1B]" />
                  <span>المحطة السابقة</span>
                </button>

                {/* Station Milestone Indicator */}
                <div className="flex flex-col items-center justify-center text-center space-y-1">
                  <span className="text-xs sm:text-sm font-bold text-[#6E5F52] dark:text-[#A8988B]">
                    المحطة {selectedIndex + 1} من {governorates.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentEmblem.symbol}</span>
                    <span className="font-black text-xl sm:text-3xl text-[#9E3C1B] dark:text-amber-400 font-serif">
                      محافظة {selectedGov.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#8C7A6B] dark:text-[#B3A497]">
                    {selectedGov.nileSegment}
                  </span>
                </div>

                {/* Next Station Button */}
                <button
                  type="button"
                  id="btn-next-station"
                  onClick={handleNextStation}
                  className="flex items-center gap-2.5 px-5 sm:px-7 py-3.5 rounded-2xl font-black transition-all cursor-pointer min-h-[56px] text-sm sm:text-base bg-[#9E3C1B] hover:bg-[#832E12] text-white shadow-sm"
                  aria-label="المحطة التالية في مسار رحلة النيل"
                >
                  <span>المحطة التالية</span>
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
                </button>
              </div>

              {/* Visual Step Timeline Dots */}
              <div className="mt-5 pt-4 border-t border-[#EFE9DF] dark:border-[#2E241E] flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
                {governorates.map((gov, idx) => {
                  const isCurrent = idx === selectedIndex;
                  const isPast = idx < selectedIndex;
                  return (
                    <button
                      key={gov.id}
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      className={`flex flex-col items-center gap-1.5 p-1 rounded-xl transition-all cursor-pointer shrink-0 ${
                        isCurrent ? 'scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={`محطة ${idx + 1}: ${gov.name}`}
                    >
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isCurrent
                            ? 'bg-[#9E3C1B] text-white ring-4 ring-[#9E3C1B]/20'
                            : isPast
                            ? 'bg-amber-600 text-white'
                            : 'bg-[#E5DDD2] dark:bg-[#3D3028] text-[#5A4D42] dark:text-[#C5B8AC]'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span className={`text-[11px] font-bold ${isCurrent ? 'text-[#9E3C1B] dark:text-amber-400 font-black' : 'text-[#6E5F52] dark:text-[#A8988B]'}`}>
                        {gov.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
           VIEW 2: ALL 9 GOVERNORATES BENTO GRID
           Filterable, Searchable, Card-based Showcase
           ========================================================= */}
        {displayMode === 'grid' && (
          <div className="space-y-6">
            {/* Search and Filters Bar */}
            <div className="p-4 sm:p-6 bg-white dark:bg-[#1C1714] rounded-3xl border-2 border-[#E2D8CC] dark:border-[#2E241E] space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-5 h-5 text-[#8C7A6B] absolute right-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="input-search-govs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن محافظة، حرفة (فخار، تلي، نول)، أو صرح أثري..."
                    className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#251D18] border-2 border-[#D9CFC2] dark:border-[#3D3028] text-sm sm:text-base font-bold text-[#1C1613] dark:text-[#FDFBF7] outline-none focus:border-[#9E3C1B]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-[#8C7A6B] hover:text-[#1C1613]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Region Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
                  {['الكل', 'جنوب الصعيد', 'وسط الصعيد', 'شمال الصعيد', 'الواحات والصحراء الغربية'].map((reg) => (
                    <button
                      key={reg}
                      type="button"
                      onClick={() => setSelectedRegionFilter(reg)}
                      className={`px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-colors cursor-pointer border ${
                        selectedRegionFilter === reg
                          ? 'bg-[#9E3C1B] text-white border-[#9E3C1B]'
                          : 'bg-[#FAF7F2] dark:bg-[#251D18] text-[#4A3E34] dark:text-[#D5C9BD] border-[#D9CFC2] dark:border-[#3D3028]'
                      }`}
                    >
                      {reg}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid of 9 Governorates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGovernorates.map((gov) => {
                const foundIdx = governorates.findIndex((g) => g.id === gov.id);
                const isCurrent = foundIdx === selectedIndex;
                const emblem = GOVERNORATE_EMBLEMS[gov.name]?.symbol || '🏛️';

                return (
                  <div
                    key={gov.id}
                    id={`card-gov-${gov.slug}`}
                    className={`bg-white dark:bg-[#1C1714] rounded-3xl overflow-hidden border-2 transition-all flex flex-col justify-between shadow-sm hover:shadow-md ${
                      isCurrent
                        ? 'border-[#9E3C1B] ring-2 ring-[#9E3C1B]/30'
                        : 'border-[#E2D8CC] dark:border-[#2E241E]'
                    }`}
                  >
                    <div>
                      <div className="relative aspect-video overflow-hidden bg-[#2D2622]">
                        <img
                          src={gov.coverImage}
                          alt={gov.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-3 right-3">
                          <span className="text-xs font-black px-3 py-1 rounded-full bg-black/60 text-white backdrop-blur-md">
                            {gov.region}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3 left-3 text-white">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{emblem}</span>
                            <h3 className="text-xl font-black font-serif">
                              محافظة {gov.name}
                            </h3>
                          </div>
                          <p className="text-xs text-amber-200 font-bold truncate">
                            «{gov.nickname}»
                          </p>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <p className="text-[#4A3E34] dark:text-[#D5C9BD] line-clamp-3 leading-relaxed text-xs sm:text-sm">
                          {gov.shortIntro}
                        </p>

                        {gov.famousFor && gov.famousFor.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {gov.famousFor.slice(0, 3).map((f, i) => (
                              <span
                                key={i}
                                className="text-[11px] font-bold px-2 py-1 rounded-lg bg-[#FAF7F2] dark:bg-[#251D18] text-[#5A4D42] dark:text-[#C5B8AC] border border-[#E2D8CC] dark:border-[#3D3028]"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (foundIdx !== -1) setSelectedIndex(foundIdx);
                          setDisplayMode('voyage');
                        }}
                        className="flex-1 py-2.5 px-3 bg-[#EFE9DF] dark:bg-[#251D18] text-[#1C1613] dark:text-[#FDFBF7] font-black text-xs sm:text-sm rounded-xl hover:bg-[#E5DDD2] transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-[#D9CFC2] dark:border-[#3D3028]"
                      >
                        <Ship className="w-4 h-4 text-[#9E3C1B]" />
                        <span>فتح برحلة النيل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigateToGovernorate(gov.slug)}
                        className="flex-1 py-2.5 px-3 bg-[#9E3C1B] text-white font-black text-xs sm:text-sm rounded-xl hover:bg-[#853216] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <span>الموسوعة</span>
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================
           ACTIVE GOVERNORATE HERITAGE DOSSIER
           Proverbs, crafts, cuisine & marketplace
           ========================================================= */}
        <section aria-labelledby="active-gov-dossier-title" className="space-y-6">
          {/* Panoramic Hero Banner for Selected Station */}
          <div className="bg-white dark:bg-[#1B1512] rounded-3xl overflow-hidden border-2 border-[#E2D8CC] dark:border-[#2E241E] shadow-sm">
            <div className="relative aspect-[21/9] min-h-[280px] sm:min-h-[360px] overflow-hidden bg-[#2D2622]">
              <img
                src={selectedGov.coverImage}
                alt={selectedGov.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />

              {/* Top Region Badge */}
              <div className="absolute top-4 sm:top-6 right-4 sm:right-6 left-4 sm:left-6 flex items-center justify-between gap-3">
                <span className={`text-xs sm:text-sm font-black px-4 py-2 rounded-full backdrop-blur-md shadow-md ${currentTheme.badge}`}>
                  {selectedGov.region}
                </span>
              </div>

              {/* Bottom Panoramic Info */}
              <div className="absolute bottom-5 right-5 left-5 text-white space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl">{currentEmblem.symbol}</span>
                  <h2
                    id="active-gov-dossier-title"
                    className="font-black font-serif drop-shadow-md text-2xl sm:text-4xl"
                  >
                    محافظة {selectedGov.name}
                  </h2>
                </div>
                <p className="text-amber-300 font-black text-base sm:text-xl drop-shadow-sm">
                  «{selectedGov.nickname}»
                </p>
                <p className="text-white/80 text-xs sm:text-sm font-medium">
                  العاصمة: {selectedGov.capitalCity} | قطاع النيل: {selectedGov.nileSegment}
                </p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="p-4 sm:p-6 bg-[#FAF7F2]/90 dark:bg-[#1C1714] border-b-2 border-[#EFE9DF] dark:border-[#2E241E]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#251D18] border border-[#E2D8CC] dark:border-[#3D3028] text-center">
                  <span className="text-xs text-[#7A6F64] dark:text-[#A89C90] font-bold block">الصروح التاريخية</span>
                  <span className="text-lg sm:text-xl font-black text-[#9E3C1B] dark:text-amber-400">
                    {selectedGov.stats?.placesCount || 5} معالم
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#251D18] border border-[#E2D8CC] dark:border-[#3D3028] text-center">
                  <span className="text-xs text-[#7A6F64] dark:text-[#A89C90] font-bold block">الحرف التراثية</span>
                  <span className="text-lg sm:text-xl font-black text-[#9E3C1B] dark:text-amber-400">
                    {selectedGov.stats?.craftsCount || 4} صنائع حية
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#251D18] border border-[#E2D8CC] dark:border-[#3D3028] text-center">
                  <span className="text-xs text-[#7A6F64] dark:text-[#A89C90] font-bold block">معروضات السوق</span>
                  <span className="text-lg sm:text-xl font-black text-[#9E3C1B] dark:text-amber-400">
                    {govMarketProducts.length > 0 ? `${govMarketProducts.length} منتجات` : `${selectedGov.stats?.productsCount || 10}+ منتج`}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#251D18] border border-[#E2D8CC] dark:border-[#3D3028] text-center">
                  <span className="text-xs text-[#7A6F64] dark:text-[#A89C90] font-bold block">الحكايات الشفاهية</span>
                  <span className="text-lg sm:text-xl font-black text-[#9E3C1B] dark:text-amber-400">
                    {selectedGov.stats?.storiesCount || 4} مرويات
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Tab Navigation */}
            <div className="p-4 sm:p-8 space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-[#EFE9DF] dark:border-[#2E241E] overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  id="tab-btn-places"
                  onClick={() => setActiveTab('places')}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl font-black transition-all cursor-pointer whitespace-nowrap text-sm sm:text-base ${
                    activeTab === 'places'
                      ? 'bg-[#9E3C1B] text-white shadow-xs'
                      : 'text-[#5A4D42] dark:text-[#C5B8AC] hover:bg-[#EFE9DF] dark:hover:bg-[#251D18]'
                  }`}
                >
                  <Landmark className="w-5 h-5" />
                  <span>الصروح والمعالم ({currentGovMarkers.filter((m) => m.type === 'place').length || 2})</span>
                </button>

                <button
                  type="button"
                  id="tab-btn-crafts"
                  onClick={() => setActiveTab('crafts')}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl font-black transition-all cursor-pointer whitespace-nowrap text-sm sm:text-base ${
                    activeTab === 'crafts'
                      ? 'bg-[#9E3C1B] text-white shadow-xs'
                      : 'text-[#5A4D42] dark:text-[#C5B8AC] hover:bg-[#EFE9DF] dark:hover:bg-[#251D18]'
                  }`}
                >
                  <Hammer className="w-5 h-5" />
                  <span>الحرف والورش ({currentGovMarkers.filter((m) => m.type === 'craft').length || 2})</span>
                </button>

                <button
                  type="button"
                  id="tab-btn-products"
                  onClick={() => setActiveTab('products')}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl font-black transition-all cursor-pointer whitespace-nowrap text-sm sm:text-base ${
                    activeTab === 'products'
                      ? 'bg-[#9E3C1B] text-white shadow-xs'
                      : 'text-[#5A4D42] dark:text-[#C5B8AC] hover:bg-[#EFE9DF] dark:hover:bg-[#251D18]'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>معروضات السوق ({govMarketProducts.length})</span>
                  {govMarketProducts.length > 0 && (
                    <span className="text-[10px] bg-amber-400 text-[#1C1613] font-bold px-1.5 py-0.5 rounded-full">
                      متاح
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  id="tab-btn-foods"
                  onClick={() => setActiveTab('foods')}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl font-black transition-all cursor-pointer whitespace-nowrap text-sm sm:text-base ${
                    activeTab === 'foods'
                      ? 'bg-[#9E3C1B] text-white shadow-xs'
                      : 'text-[#5A4D42] dark:text-[#C5B8AC] hover:bg-[#EFE9DF] dark:hover:bg-[#251D18]'
                  }`}
                >
                  <Utensils className="w-5 h-5" />
                  <span>سفرة وخيرات البلد</span>
                </button>

                <button
                  type="button"
                  id="tab-btn-folklore"
                  onClick={() => setActiveTab('folklore')}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl font-black transition-all cursor-pointer whitespace-nowrap text-sm sm:text-base ${
                    activeTab === 'folklore'
                      ? 'bg-[#9E3C1B] text-white shadow-xs'
                      : 'text-[#5A4D42] dark:text-[#C5B8AC] hover:bg-[#EFE9DF] dark:hover:bg-[#251D18]'
                  }`}
                >
                  <Scroll className="w-5 h-5" />
                  <span>أمثال وحكايات شعبية</span>
                </button>
              </div>

              {/* TAB 1: PLACES */}
              {activeTab === 'places' && (
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-black text-[#1C1613] dark:text-[#FDFBF7] flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-[#9E3C1B]" />
                    <span>أبرز المعالم والصروح في {selectedGov.name}:</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentGovMarkers.filter((m) => m.type === 'place').length > 0 ? (
                      currentGovMarkers
                        .filter((m) => m.type === 'place')
                        .map((p) => (
                          <div
                            key={p.id}
                            className="bg-[#FAF7F2] dark:bg-[#201814] rounded-2xl overflow-hidden border-2 border-[#E2D8CC] dark:border-[#3D3028] flex flex-col sm:flex-row gap-4 p-4"
                          >
                            <img
                              src={p.coverImage}
                              alt={p.title}
                              className="w-full sm:w-36 h-36 object-cover rounded-xl shrink-0"
                            />
                            <div className="space-y-1.5 flex-1">
                              <h4 className="text-base sm:text-lg font-black text-[#1C1613] dark:text-[#FDFBF7]">
                                {p.title}
                              </h4>
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-300 inline-block">
                                {p.typeLabel}
                              </span>
                              <p className="text-[#4A3E34] dark:text-[#DDD3C7] leading-relaxed text-xs sm:text-sm">
                                {p.shortDescription}
                              </p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#201814] border-2 border-[#E2D8CC] dark:border-[#3D3028] col-span-2">
                        <p className="text-[#4A3E34] dark:text-[#DDD3C7] font-bold text-sm sm:text-base">
                          تزخر محافظة {selectedGov.name} بالعديد من الآثار والمعابد والمساجد والكنائس التاريخية العريقة.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: CRAFTS */}
              {activeTab === 'crafts' && (
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-black text-[#1C1613] dark:text-[#FDFBF7] flex items-center gap-2">
                    <Hammer className="w-5 h-5 text-[#9E3C1B]" />
                    <span>الحرف التراثية وشيوخ الصنعة في {selectedGov.name}:</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentGovMarkers.filter((m) => m.type === 'craft').length > 0 ? (
                      currentGovMarkers
                        .filter((m) => m.type === 'craft')
                        .map((c) => (
                          <div
                            key={c.id}
                            className="bg-[#FAF7F2] dark:bg-[#201814] rounded-2xl overflow-hidden border-2 border-[#E2D8CC] dark:border-[#3D3028] flex flex-col sm:flex-row gap-4 p-4"
                          >
                            <img
                              src={c.coverImage}
                              alt={c.title}
                              className="w-full sm:w-36 h-36 object-cover rounded-xl shrink-0"
                            />
                            <div className="space-y-1.5 flex-1">
                              <h4 className="text-base sm:text-lg font-black text-[#1C1613] dark:text-[#FDFBF7]">
                                {c.title}
                              </h4>
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 dark:bg-amber-950/60 dark:text-amber-300 inline-block">
                                {c.typeLabel}
                              </span>
                              <p className="text-[#4A3E34] dark:text-[#DDD3C7] leading-relaxed text-xs sm:text-sm">
                                {c.shortDescription}
                              </p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#201814] border-2 border-[#E2D8CC] dark:border-[#3D3028] col-span-2">
                        <p className="text-[#4A3E34] dark:text-[#DDD3C7] font-bold text-sm sm:text-base">
                          تتميز {selectedGov.name} بصناعات يدوية فريدة يتوارثها الحرفيون أباً عن جد كرمز أصيل للهوية الصعيدية.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: MARKETPLACE PRODUCTS */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-[#1C1613] dark:text-[#FDFBF7] flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#9E3C1B]" />
                      <span>منتجات حقيقية متوفرة للشراء من ورش {selectedGov.name}:</span>
                    </h3>

                    <button
                      type="button"
                      onClick={() => setActivePage('products')}
                      className="text-xs sm:text-sm font-black text-[#9E3C1B] dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>تصفح كافة معروضات المتجر</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {govMarketProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {govMarketProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-[#FAF7F2] dark:bg-[#201814] rounded-2xl border-2 border-[#E2D8CC] dark:border-[#3D3028] overflow-hidden p-3.5 flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-2">
                            <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 relative">
                              <img
                                src={prod.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600'}
                                alt={prod.title}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md">
                                {prod.sellerGovernorate || selectedGov.name}
                              </span>
                            </div>
                            <h4 className="text-sm sm:text-base font-black text-[#1C1613] dark:text-[#FDFBF7] line-clamp-1">
                              {prod.title}
                            </h4>
                            <div className="flex items-center justify-between text-xs font-bold text-[#6E5F52] dark:text-[#A8988B]">
                              <span>الورشة: {prod.sellerName || 'حرفيو الصعيد'}</span>
                              <div className="flex items-center gap-1 text-amber-500">
                                <Star className="w-3 h-3 fill-current" />
                                <span>{prod.rating || 4.9}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#E2D8CC] dark:border-[#3D3028] flex items-center justify-between gap-2">
                            <span className="text-base sm:text-lg font-black text-[#9E3C1B] dark:text-amber-400">
                              {prod.price} ج.م
                            </span>

                            <button
                              type="button"
                              id={`btn-add-atlas-cart-${prod.id}`}
                              onClick={() => handleAddToCart(prod)}
                              className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                                addedProductId === prod.id
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#9E3C1B] hover:bg-[#853216] text-white'
                              }`}
                            >
                              {addedProductId === prod.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>تمت الإضافة!</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                  <span>أضف للسلة</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-[#FAF7F2] dark:bg-[#201814] border-2 border-[#E2D8CC] dark:border-[#3D3028] text-center space-y-3">
                      <ShoppingBag className="w-8 h-8 text-[#9E3C1B] mx-auto opacity-75" />
                      <h4 className="text-base font-black text-[#1C1613] dark:text-[#FDFBF7]">
                        ورش ومنتجات محافظة {selectedGov.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#5A4D42] dark:text-[#C5B8AC] max-w-md mx-auto leading-relaxed">
                        يتم الآن توثيق ورفع منتجات ورش جديدة من {selectedGov.name} مباشرة إلى منصة وه. يمكنك استعراض كافة المنتجات التراثية المتاحة حالياً في السوق.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActivePage('products')}
                        className="py-2.5 px-5 rounded-xl bg-[#9E3C1B] text-white text-xs sm:text-sm font-black hover:bg-[#853216] transition-colors cursor-pointer"
                      >
                        استعرض منتجات الصعيد الآن
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: FOODS */}
              {activeTab === 'foods' && (
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-black text-[#1C1613] dark:text-[#FDFBF7] flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-[#9E3C1B]" />
                    <span>سفرة وخيرات الصعيد الأصيلة في {selectedGov.name}:</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#201814] border-2 border-[#E2D8CC] dark:border-[#3D3028] space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🍞</span>
                        <h4 className="text-base sm:text-lg font-black text-[#1C1613] dark:text-[#FDFBF7]">
                          العيش الشمسي الصعيدي
                        </h4>
                      </div>
                      <p className="text-[#4A3E34] dark:text-[#DDD3C7] leading-relaxed text-xs sm:text-sm">
                        يُخمر تحت حرارة شمس الصعيد الساطعة ويُخبز في أفران الطين البلدي، وله طعم ورائحة لا تتكرر في أي مكان آخر.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#201814] border-2 border-[#E2D8CC] dark:border-[#3D3028] space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🍯</span>
                        <h4 className="text-base sm:text-lg font-black text-[#1C1613] dark:text-[#FDFBF7]">
                          عسل القصب الأسود والفطير المشلتت
                        </h4>
                      </div>
                      <p className="text-[#4A3E34] dark:text-[#DDD3C7] leading-relaxed text-xs sm:text-sm">
                        مستخلص من أعواد قصب السكر الصعيدي في العصارات التقليدية، ويُقدم مع الفطير المورق بالسمن البلدي الصعيدي.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#201814] border-2 border-[#E2D8CC] dark:border-[#3D3028] space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🥣</span>
                        <h4 className="text-base sm:text-lg font-black text-[#1C1613] dark:text-[#FDFBF7]">
                          الكشك الصعيدي بالفريك واللبن
                        </h4>
                      </div>
                      <p className="text-[#4A3E34] dark:text-[#DDD3C7] leading-relaxed text-xs sm:text-sm">
                        كرات الكشك المجففة المصنوعة من القمح الصعيدي واللبن الحامض، وجبة الأصالة والدفء في بيوت الصعيد.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#201814] border-2 border-[#E2D8CC] dark:border-[#3D3028] space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🦆</span>
                        <h4 className="text-base sm:text-lg font-black text-[#1C1613] dark:text-[#FDFBF7]">
                          الطيور البلدية والملوخية الناشفة
                        </h4>
                      </div>
                      <p className="text-[#4A3E34] dark:text-[#DDD3C7] leading-relaxed text-xs sm:text-sm">
                        البط البلدي والحمام المحشي بالفريك الصعيدي والملوخية الخضراء بالتقلية التي تُبهج كل زائر.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: FOLKLORE & PROVERBS */}
              {activeTab === 'folklore' && (
                <div className="space-y-4">
                  <div className="p-6 sm:p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 text-center space-y-3 relative">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs font-black px-3.5 py-1 rounded-full bg-amber-200 text-amber-950 dark:bg-amber-900 dark:text-amber-200">
                        مَثَل شعبي من قلب {selectedGov.name}
                      </span>
                    </div>
                    <p className="font-serif font-black text-[#9E3C1B] dark:text-amber-300 text-xl sm:text-3xl">
                      {currentEmblem.proverb}
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#201814] border-2 border-[#E2D8CC] dark:border-[#3D3028] space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="text-base sm:text-lg font-black text-[#1C1613] dark:text-[#FDFBF7] flex items-center gap-2">
                        <Scroll className="w-5 h-5 text-[#9E3C1B]" />
                        <span>من حكايات وتراث {selectedGov.name}:</span>
                      </h4>
                    </div>
                    <p className="text-[#4A3E34] dark:text-[#DDD3C7] leading-relaxed font-medium text-sm sm:text-base">
                      {currentEmblem.folklore}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 border-t-2 border-[#EFE9DF] dark:border-[#2E241E] flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  id={`btn-open-encyclopedia-${selectedGov.slug}`}
                  onClick={() => navigateToGovernorate(selectedGov.slug)}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-[#9E3C1B] hover:bg-[#853216] text-white font-black flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer min-h-[52px] text-sm sm:text-base"
                >
                  <span>فتح موسوعة محافظة {selectedGov.name} بالكامل</span>
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  id="btn-open-market-gov"
                  onClick={() => setActivePage('products')}
                  className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-[#EFE9DF] dark:bg-[#251D18] hover:bg-[#E5DDD2] text-[#1C1613] dark:text-[#FDFBF7] font-black flex items-center justify-center gap-2 transition-colors cursor-pointer border-2 border-[#D9CFC2] dark:border-[#3D3028] min-h-[52px] text-sm sm:text-base"
                >
                  <ShoppingBag className="w-5 h-5 text-[#9E3C1B]" />
                  <span>تسوّق منتجات {selectedGov.name}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UpperEgyptMapPage;
