import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';

export interface AmmiyaPlaceUpdate {
  id: string;
  slug: string;
  locationDescription: string;
  visitDuration: string;
  openingHours: string;
  bestTimeToVisit: string;
}

export const AMMIYA_PLACES: Record<string, AmmiyaPlaceUpdate> = {
  // 1. أبو سمبل
  'place-abu-simbel': {
    id: 'place-abu-simbel',
    slug: 'abu-simbel-temples',
    locationDescription: 'منحوت في صخر الجبل على بحيرة ناصر مباشرة جنوب أسوان بحوالي 280 كم، وتقدر تروحه بطيران داخلي أو رحلات برية منظمة من أسوان.',
    visitDuration: 'من ساعتين ونص لأربع ساعات',
    openingHours: 'كل يوم من 5:00 الصبح لحد 6:00 المغرب',
    bestTimeToVisit: 'الصبح بدري أو بعد الظهر عشان تستمتع بفيو بحيرة ناصر مع المعبد، أو في أيام تعامد الشمس في فبراير وأكتوبر.'
  },

  // 2. أبيدوس
  'place-abydos': {
    id: 'place-abydos',
    slug: 'abydos-temple',
    locationDescription: 'المعبد موجود في قلب قرية العرابة المدفونة بمركز البلينا جنوب سوهاج، وحواليه أراضي زراعية ومساحات صحراوية هادية ورايقة.',
    visitDuration: 'من ساعتين لتلات ساعات',
    openingHours: 'كل يوم من 7:00 الصبح لحد 5:00 المغرب',
    bestTimeToVisit: 'من شهر أكتوبر لشهر أبريل، شمس الصعيد في الشتا والربيع بتبقى هادية ومناسبة للتجول.'
  },

  // 3. إهناسيا
  'place-ahnasya': {
    id: 'place-ahnasya',
    slug: 'ahnasya-herakleopolis-magna',
    locationDescription: 'موجودة غرب مدينة بني سويف بحوالي 17 كم في قرية أم الكيمان التابعة لمركز إهناسيا المدينة.',
    visitDuration: 'حوالي ساعة ونص',
    openingHours: 'كل يوم من 8:00 الصبح لحد 4:00 العصر',
    bestTimeToVisit: 'الصبح بدري في الهوا الرايق عشان تستكشف بقايا العاصمة التاريخية ومعبد الإله حريشف براحتك.'
  },

  // 4. أخميم والنول
  'place-akhmeem-handloom': {
    id: 'place-akhmeem-handloom',
    slug: 'akhmeem-handloom-weaving-heritage',
    locationDescription: 'موجودة في شرق النيل قدام مدينة سوهاج على طول، والورش بتلاقيها متوزعة في جمعيات النساجين وحي ورش النول التاريخية.',
    visitDuration: 'من ساعتين لتلات ساعات',
    openingHours: 'كل يوم من 9:00 الصبح لحد 5:00 المغرب',
    bestTimeToVisit: 'فترة الصباح عشان تشوف النساجين وهما شغالين على الأنوال وبيبدعوا القطع الحرير والكليم الصعيدي.'
  },

  // 5. قصر ألكسان
  'place-alexan-pasha-palace': {
    id: 'place-alexan-pasha-palace',
    slug: 'alexan-pasha-palace',
    locationDescription: 'بيطل على كورنيش النيل على طول بشارع الثورة (شارع الجمهورية) في أرقى شوارع حي شرق أسيوط.',
    visitDuration: 'حوالي ساعة زمن',
    openingHours: 'مقفول للزيارة من جوه للتجهيز، لكن الواجهة التاريخية والجنينة باينين ومتاحين للتصوير والمشاهدة من ممشى الكورنيش طول اليوم.',
    bestTimeToVisit: 'وقت العصر وقبل الغروب عشان تستمتع بمنظر القصر وعمارته التاريخية مع النيل.'
  },

  // 6. تل العمارنة
  'place-amarna': {
    id: 'place-amarna',
    slug: 'amarna-akhetaten',
    locationDescription: 'موجود شرق النيل قبالة مدينتي دير مواس وملوي، على بعد 60 كم جنوب مدينة المنيا، وبتعديله بمعدية النيل.',
    visitDuration: 'من ساعتين لتلات ساعات',
    openingHours: 'كل يوم من 8:00 الصبح لحد 5:00 المسا',
    bestTimeToVisit: 'شهور الشتا والربيع (من أكتوبر لأبريل) لأن الموقع واسع وصحراوي ومحتاج جو شتوي هادي.'
  },

  // 7. الأشمونين ومتحف ملوي
  'place-ashmunein-malawi': {
    id: 'place-ashmunein-malawi',
    slug: 'el-ashmunein-malawi-museum',
    locationDescription: 'الأشمونين موجودة شمال غرب ملوي بحوالي 8 كم، ومتحف ملوي هتلاقيه في قلب شارع الجيش بمدينة ملوي بالمنيا.',
    visitDuration: 'من ساعتين لساعتين ونص',
    openingHours: 'كل يوم من 9:00 الصبح لحد 4:00 العصر',
    bestTimeToVisit: 'الصبح بدري عشان تجمع بين جولة تماثيل قرد البابون الضخمة في الأشمونين وزيارة مقتنيات متحف ملوي.'
  },

  // 8. ميدان أسماء الله الحسنى
  'place-asma-allah-alhusna': {
    id: 'place-asma-allah-alhusna',
    slug: 'asma-allah-alhusna-square',
    locationDescription: 'موجود في المدخل الشمالي لمدينة أسيوط قدام البوابة الرئيسية لفرع جامعة الأزهر ومحطة قطار أسيوط.',
    visitDuration: 'من نص ساعة لساعة زمن',
    openingHours: 'ميدان مفتوح في الطريق العام تقدر تعدي عليه وتتفرج عليه 24 ساعة في أي وقت.',
    bestTimeToVisit: 'بالليل بعد المغرب عشان تستمتع بأنوار المجسم الملونة والنسمة الحلوة في الميدان.'
  },

  // 9. قناطر أسيوط وممشى النيل
  'place-assiut-barrage': {
    id: 'place-assiut-barrage',
    slug: 'historic-assiut-barrage',
    locationDescription: 'بتعدي مجرى النيل وتربط بين برين أسيوط عند مدخل فم ترعة الإبراهيمية الشهيرة وسط أسيوط.',
    visitDuration: 'حوالي ساعة زمن',
    openingHours: 'مفتوحة ومتاحة للمشاة والعربيات على مدار 24 ساعة طول اليوم.',
    bestTimeToVisit: 'وقت الغروب وبالليل مع النسمة النيلية الهادية وإضاءة القناطر والممشى.'
  },

  // 10. معهد فؤاد الأول بأسيوط
  'place-assiut-religious-institute': {
    id: 'place-assiut-religious-institute',
    slug: 'assiut-islamic-religious-institute',
    locationDescription: 'موجود في منطقة الحمراء بحي شرق أسيوط على شارع الكورنيش جنب نفق الشهيد أحمد جلال ومستشفى أسيوط العام.',
    visitDuration: 'من ساعة لساعتين',
    openingHours: 'المسجد مفتوح للمصلين في أوقات الصلوات الخمسة كل يوم؛ والجولات العلمية بتنسيق مع إدارة المعهد في مواعيد الشغل الرسمية (8:00 الصبح - 2:00 الظهر).',
    bestTimeToVisit: 'الصبح في وقت اليوم الدراسي أو بين صلاتي الظهر والعصر في هدوء الصحن الإسلامي.'
  },

  // 11. جبانة البجوات بالخارجة
  'place-bagawat-necropolis': {
    id: 'place-bagawat-necropolis',
    slug: 'al-bagawat-necropolis-kharga',
    locationDescription: 'موجودة في ضهر معبد هيبس عند سفح جبل طارق شمال مدينة الخارجة بحوالي 3 كم وسط رمال الواحة.',
    visitDuration: 'من ساعة ونص لساعتين',
    openingHours: 'كل يوم من 8:00 الصبح لحد 4:00 العصر',
    bestTimeToVisit: 'الصبح بدري في جو الشتا المعتدل عشان تشوف قباب الطوب اللبن ورسومات الخروج والسلام ونوح واضحة بنور الشمس.'
  },

  // 12. البهنسا ببني مزار
  'place-bahnasa': {
    id: 'place-bahnasa',
    slug: 'al-bahnasa-martyrs-cemetery',
    locationDescription: 'موجودة غرب مدينة بني مزار بحوالي 16 كم على طرف الظهير الصحراوي الغربي لمحافظة المنيا.',
    visitDuration: 'من ساعتين لتلات ساعات',
    openingHours: 'مفتوحة كل يوم من الصبح بدري لحد آذان المغرب ومغادرة الزوار.',
    bestTimeToVisit: 'صباح يوم الجمعة أو فترة قبل الظهر للتبرك وزيارة أضرحة ومقامات شهداء الصحابة والتابعين.'
  },

  // 13. مقابر بني حسن بالمنيا
  'place-beni-hasan': {
    id: 'place-beni-hasan',
    slug: 'beni-hasan-rock-tombs',
    locationDescription: 'منحوتة في الصخر العالي لهضبة الجبل الشرقي المطلة على النيل بقرية بني حسن الشروق مركز أبو قرقاص جنوب المنيا.',
    visitDuration: 'من ساعتين لساعتين ونص',
    openingHours: 'كل يوم من 8:00 الصبح لحد 5:00 المسا',
    bestTimeToVisit: 'الصبح بدري في شهور الشتا والربيع عشان تتفادى حرارة طلوع الجبل وتستمتع بفيو النيل من فوق.'
  },

  // 14. متحف بني سويف
  'place-beni-suef-museum': {
    id: 'place-beni-suef-museum',
    slug: 'beni-suef-national-museum',
    locationDescription: 'موجود جوه حديقة النصر التاريخية في قلب مدينة بني سويف قريب جداً من محطة القطر.',
    visitDuration: 'حوالي ساعة زمن',
    openingHours: 'مقفول من جوه عشان الترميم (الجنينة الخارجية مفتوحة وتقدر تتمشى فيها طول النهار).',
    bestTimeToVisit: 'تابع إعلانات وزارة السياحة والآثار لحد ما يعلنوا ميعاد افتتاحه الرسمي من جديد.'
  },

  // 15. دير بياض العرب ببني سويف
  'place-byad-monastery': {
    id: 'place-byad-monastery',
    slug: 'byad-monastery-beni-suef',
    locationDescription: 'موجود على طول على البر الشرقي لنهر النيل بقرية بياض العرب، في وش مدينة بني سويف على النيل مباشرة.',
    visitDuration: 'من ساعة لساعتين',
    openingHours: 'مفتوح كل يوم للزيارة والصلوات من 7:00 الصبح لحد 9:00 بالليل.',
    bestTimeToVisit: 'طول السنة، وبالذات الصبح بدري أو قبل الغروب عشان تستمتع بالنسمة النيلية وهدوء الدير.'
  },

  // 16. تمثالا ممنون
  'place-colossi-memnon': {
    id: 'place-colossi-memnon',
    slug: 'colossi-of-memnon',
    locationDescription: 'قاعدين في المساحة المفتوحة على الطريق الرئيسي المؤدي لوادي الملوك ومعابد البر الغربي في الأقصر.',
    visitDuration: 'من نص ساعة لساعة إلا ربع',
    openingHours: 'مفتوحين في الهوا الطلق على مدار 24 ساعة طول اليوم.',
    bestTimeToVisit: 'مع شروق الشمس والصبح بدري عشان تاخد أحلى صور في الضوء الذهبي الهادي.'
  },

  // 17. معبد دندرة بقنا
  'place-dendera': {
    id: 'place-dendera',
    slug: 'dendera-temple',
    locationDescription: 'موجود غرب نهر النيل على بعد حوالي 4 كم من مدينة قنا، وتوصله بسهولة عن طريق كوبري دندرة أو محور الشهيد باسم فكري.',
    visitDuration: 'من ساعتين لتلات ساعات',
    openingHours: 'كل يوم من 7:00 الصبح لحد 5:00 المسا',
    bestTimeToVisit: 'الصبح بدري من أكتوبر لأبريل عشان ضوء النهار ينور النقوش الفيروزية والأزرق الملكي في الأسقف العالية.'
  },

  // 18. دير درنكة بأسيوط
  'place-dronka': {
    id: 'place-dronka',
    slug: 'dronka-monastery-assiut',
    locationDescription: 'منحوت في حضن الجبل الغربي بأسيوط على ارتفاع عالي بقرية درنكة، على بعد حوالي 10 كم جنوب غرب مدينة أسيوط.',
    visitDuration: 'من ساعتين لتلات ساعات',
    openingHours: 'مفتوح كل يوم للزيارة والصلوات من 6:00 الصبح لحد 11:00 بالليل.',
    bestTimeToVisit: 'الصبح بدري أو وقت الغروب عشان تشوف بانوراما أسيوط كلها من فوق الجبل، أو في موسم صوم العذراء بشهر أغسطس.'
  },

  // 19. معبد دوش بواحة باريس
  'place-dush-temple': {
    id: 'place-dush-temple',
    slug: 'temple-fortress-of-dush',
    locationDescription: 'موجود جنوب واحة باريس بحوالي 23 كم، وجنوب مدينة الخارجة بحوالي 115 كم عند ملتقى درب الأربعين القديم.',
    visitDuration: 'حوالي ساعتين زمن',
    openingHours: 'كل يوم من 8:00 الصبح لحد 4:00 العصر',
    bestTimeToVisit: 'الصبح بدري في فصل الشتا عشان الجو بيبقى رائع في الصحرا وتشوف بقايا الحصن الروماني ومعبد إيزيس وسيرابيس.'
  },

  // 20. معبد إدفو
  'place-edfu': {
    id: 'place-edfu',
    slug: 'edfu-temple-horus',
    locationDescription: 'موجود غرب النيل في قلب مدينة إدفو شمال محافظة أسوان بحوالي 100 كم، ومشهور بركوب الحناطير من كورنيش النيل للبوابة.',
    visitDuration: 'من ساعتين لساعتين ونص',
    openingHours: 'كل يوم من 7:00 الصبح لحد 5:00 المغرب',
    bestTimeToVisit: 'الصبح بدري من 7:00 لحد 10:00 الصبح قبل ما الشمس تسخن وزحمة البواخر النيلية تزيد.'
  },

  // 21. جزيرة إلفنتين
  'place-elephantine': {
    id: 'place-elephantine',
    slug: 'elephantine-island-nilometer',
    locationDescription: 'جزيرة نيلية كبيرة في وش كورنيش أسوان بتفصل بين برين النيل، وتوصلها بفلوكة أو معدية من الكورنيش في دقايق معدودة.',
    visitDuration: 'من ساعتين لتلات ساعات',
    openingHours: 'كل يوم من 8:00 الصبح لحد 5:00 المغرب',
    bestTimeToVisit: 'العصر قبل الغروب عشان تستمتع برحلة المعدية وجو النيل الرايق وتشوف مقياس النيل الفرعوني.'
  },

  // 22. سواقي الفيوم
  'place-faiyum-waterwheels': {
    id: 'place-faiyum-waterwheels',
    slug: 'historic-faiyum-waterwheels',
    locationDescription: 'متوزعة على مجرى بحر يوسف وترعة بحر تنهلا وبميدان السواقي الرئيسي الحيوي وسط مدينة الفيوم.',
    visitDuration: 'حوالي ساعة زمن',
    openingHours: 'متاحة ومفتوحة في الميدان العام على مدار 24 ساعة طول اليوم.',
    bestTimeToVisit: 'وقت العصر وبالليل لما الأنوار تشتغل والميدان يروق مع هدير السواقي التاريخية.'
  },

  // 23. دير جبل الطير بسمالوط
  'place-gabal-al-teir': {
    id: 'place-gabal-al-teir',
    slug: 'gabal-al-teir-monastery',
    locationDescription: 'مبني فوق هضبة جبلية صخرية عالية بتطل على النيل شرق سمالوط، وبيبعد عن مدينة المنيا حوالي 25 كم شمالاً.',
    visitDuration: 'من ساعتين لتلات ساعات',
    openingHours: 'مفتوح كل يوم للزيارة والبركة من 6:00 الصبح لحد 8:00 بالليل.',
    bestTimeToVisit: 'طول السنة، وبالذات في موسم مولد واحتفال العذراء في شهر مايو مع الآلاف من كل مصر.'
  },

  // 24. معبد حتشبسوت بالدير البحري
  'place-hatshepsut': {
    id: 'place-hatshepsut',
    slug: 'hatshepsut-temple-deir-el-bahari',
    locationDescription: 'مستند مباشرة في حضن الجبل الصخري الشاهق للدير البحري في البر الغربي لمدينة الأقصر.',
    visitDuration: 'حوالي ساعتين زمن',
    openingHours: 'كل يوم من 6:00 الصبح لحد 5:00 المسا',
    bestTimeToVisit: 'الصبح بدري مع شروق الشمس عشان تشوف الضوء الذهبي وهو بينور مدرجات المعبد التلاتة قبل حر الظهر.'
  },

  // 25. هرم هوارة بالفيوم
  'place-hawara-pyramid': {
    id: 'place-hawara-pyramid',
    slug: 'hawara-pyramid-labyrinth-faiyum',
    locationDescription: 'موجود على بعد حوالي 9 كم جنوب شرق مدينة الفيوم عند مدخل ترعة بحر يوسف لمنخفض الفيوم.',
    visitDuration: 'من ساعة لساعة ونص',
    openingHours: 'كل يوم من 8:00 الصبح لحد 4:00 العصر',
    bestTimeToVisit: 'الصبح بدري في أشهر الشتا والربيع عشان تتجول حوالين الهرم وبقايا قصر التيه الأسطوري.'
  },

  // 26. معبد هيبس بالخارجة
  'place-hibis-temple': {
    id: 'place-hibis-temple',
    slug: 'hibis-temple-kharga',
    locationDescription: 'موجود شمال مدينة الخارجة بحوالي 2.5 كم قريب من جبانة البجوات ومزارع النخيل الخضرا بالواحة.',
    visitDuration: 'من ساعة ونص لساعتين',
    openingHours: 'كل يوم من 8:00 الصبح لحد 4:00 العصر',
    bestTimeToVisit: 'من أكتوبر لأبريل، الجو في واحة الخارجة شتا بيكون مشمس ومعتدل وجميل جداً.'
  },

  // 27. مدينة كرانيس وكوم أوشيم
  'place-karanis-kom-aushim': {
    id: 'place-karanis-kom-aushim',
    slug: 'karanis-kom-aushim-museum-faiyum',
    locationDescription: 'موجودة على بعد 30 كم شمال مدينة الفيوم عند الكيلو 70 على طريق القاهرة - الفيوم الصحراوي.',
    visitDuration: 'من ساعتين لساعتين ونص',
    openingHours: 'كل يوم من 9:00 الصبح لحد 4:00 العصر',
    bestTimeToVisit: 'الصبح بدري لحد نص النهار عشان تلف في شوارع المدينة اليونانية الرومانية القديمة ومتحف كوم أوشيم.'
  },

  // 28. معابد الكرنك
  'place-karnak': {
    id: 'place-karnak',
    slug: 'karnak-temples',
    locationDescription: 'موجود شمال مدينة الأقصر بحوالي 3 كم، ومتوصل بقلب المدينة عن طريق ممشى طريق الكباش على البر الشرقي للنيل.',
    visitDuration: 'من 3 لـ 4 ساعات',
    openingHours: 'كل يوم من 6:00 الصبح لحد 5:30 المسا (وعروض الصوت والضوء ليها مواعيد مسائية خاصة).',
    bestTimeToVisit: 'الصبح بدري مع شروق الشمس عشان تبعد عن زحمة الأفواج وحر الظهر، أو قبل الغروب عشان تشوف انعكاس النور على صالة الأعمدة.'
  },

  // 29. معبد كوم أمبو ومتحف التماسيح
  'place-kom-ombo': {
    id: 'place-kom-ombo',
    slug: 'kom-ombo-temple',
    locationDescription: 'مبني على ربوة عالية فوق النيل مباشرة بمدينة كوم أمبو شمال أسوان بحوالي 45 كم، ومحطة رئيسية لكل المراكب النيلية.',
    visitDuration: 'من ساعة ونص لساعتين',
    openingHours: 'كل يوم من 7:00 الصبح لحد 9:00 بالليل (منور بالكامل بالليل).',
    bestTimeToVisit: 'وقت العصر لحد بالليل عشان تشوف منظر النيل مع الغروب وإضاءة المعبد الساحرة، وتعدي على متحف التماسيح جنب البوابة.'
  },

  // 30. معبد الأقصر وطريق الكباش
  'place-luxor-temple': {
    id: 'place-luxor-temple',
    slug: 'luxor-temple-avenue-sphinxes',
    locationDescription: 'موجود في قلب مدينة الأقصر في وش كورنيش النيل مباشرة، وهو نقطة بداية طريق الكباش التاريخي اللي واصل لحد الكرنك.',
    visitDuration: 'حوالي ساعتين زمن',
    openingHours: 'كل يوم من 6:00 الصبح لحد 10:00 بالليل (منور بالكامل بالليل).',
    bestTimeToVisit: 'قبل الغروب وبالليل عشان تستمتع بالإضاءة البديعة اللي بتنور صروح المعبد وجو الكورنيش المنعش.'
  },

  // 31. معبد مدينة هابو
  'place-medinet-habu': {
    id: 'place-medinet-habu',
    slug: 'medinet-habu-temple',
    locationDescription: 'موجود في الجزء الجنوبي من مقابر ومعابد البر الغربي لمدينة الأقصر، قريب من تمثالي ممنون.',
    visitDuration: 'من ساعة ونص لساعتين',
    openingHours: 'كل يوم من 6:00 الصبح لحد 5:00 المسا',
    bestTimeToVisit: 'الصبح أو وقت الظهيرة لما أشعة الشمس تدخل الصالات وتنور الألوان الأصلية اللي لسه زاهية من آلاف السنين.'
  },

  // 32. هرم ميدوم ببني سويف
  'place-meidum': {
    id: 'place-meidum',
    slug: 'meidum-pyramid',
    locationDescription: 'مبني فوق هضبة صحراوية شمال غرب بني سويف على بعد 35 كم من المدينة وحوالي 15 كم غرب مركز الواسطى.',
    visitDuration: 'من ساعة ونص لساعتين',
    openingHours: 'كل يوم من 8:00 الصبح لحد 4:30 العصر',
    bestTimeToVisit: 'أشهر الخريف والشتا والربيع (من أكتوبر لأبريل) لأن المنطقة صحراوية ومفتوحة ومحتاجة شمس شتوية هادية.'
  },

  // 33. مقابر مير بأسيوط
  'place-meir-tombs': {
    id: 'place-meir-tombs',
    slug: 'meir-rock-cut-tombs-assiut',
    locationDescription: 'منحوتة على حافة الصحرا الغربية غرب مدينة القوصية شمال محافظة أسيوط بحوالي 50 كم.',
    visitDuration: 'من ساعة ونص لساعتين',
    openingHours: 'كل يوم من 8:00 الصبح لحد 4:00 العصر',
    bestTimeToVisit: 'الصبح بدري في فصلي الخريف والشتا عشان تستمتع بنقوش الحياة اليومية والرياضة والصيد في مصر القديمة براحتك.'
  },

  // 34. تمثال ميريت آمون بأخميم
  'place-merit-amun': {
    id: 'place-merit-amun',
    slug: 'merit-amun-statue',
    locationDescription: 'موجود في قلب مدينة أخميم القديمة شرق النيل، على بعد حوالي 4 كم من مدينة سوهاج عبر كوبري أخميم العلوي.',
    visitDuration: 'من ساعة لساعة ونص',
    openingHours: 'كل يوم من 8:00 الصبح لحد 5:00 المسا',
    bestTimeToVisit: 'الصبح بدري عشان تتفادى حرارة الشمس وتشوف جمال تفاصيل ونقوش تاج الأميرة ميريت آمون بنور النهار.'
  },

  // 35. الدير المحرق بالقوصية
  'place-muharraq': {
    id: 'place-muharraq',
    slug: 'muharraq-monastery',
    locationDescription: 'موجود عند سفح جبل قسقام غرب مدينة القوصية بحوالي 12 كم، وبيبعد عن أسيوط نحو 48 كم شمالاً.',
    visitDuration: 'من ساعتين لتلات ساعات',
    openingHours: 'مفتوح كل يوم للزيارة والبركة من 6:00 الصبح لحد 6:00 المغرب (ما عدا أيام الصوم الكبير وفترات خلوات الرهبان المحددة).',
    bestTimeToVisit: 'شهور الخريف والشتا، وفي فترات الأعياد والمواسم الروحية لبركة كنيسة العذراء الأثرية والحصن القديم.'
  },

  // 36. نقادة وورش الفركة
  'place-naqada-heritage': {
    id: 'place-naqada-heritage',
    slug: 'naqada-heritage-town',
    locationDescription: 'موجودة على الضفة الغربية لنهر النيل جنوب محافظة قنا وشمال الأقصر بحوالي 25 كم، وتوصلها بمعدية أو كوبري نقادة الجديد.',
    visitDuration: 'من ساعتين لتلات ساعات',
    openingHours: 'كل يوم من 9:00 الصبح لحد 5:00 المغرب',
    bestTimeToVisit: 'الصبح لحد العصر عشان تشوف حركات المعلمين على نول الفركة التاريخي وزيارة أديرة جبل نقادة القديمة.'
  },

  // 37. متحف النوبة بأسوان
  'place-nubian-museum': {
    id: 'place-nubian-museum',
    slug: 'nubian-museum-aswan',
    locationDescription: 'مبني على ربوة صخرية عالية قريبة من فندق كتاراكت القديم والمقابر الفاطمية بمدينة أسوان.',
    visitDuration: 'من ساعتين لتلات ساعات',
    openingHours: 'شغال كل يوم على فترتين: من 9:00 الصبح لـ 1:00 الظهر، ومن 5:00 المغرب لـ 9:00 بالليل.',
    bestTimeToVisit: 'الفترة المسائية عشان تتمشى في حديقة المتحف الصخرية وتستمتع بالإضاءة الهادية ومعروضات البيت النوبي.'
  },

  // 38. معبد فيلة بأسوان
  'place-philae': {
    id: 'place-philae',
    slug: 'philae-temple',
    locationDescription: 'موجود على جزيرة أجيليكا في قلب مية بحيرة خزان أسوان، جنوب السد القديم بحوالي 8 كم جنوب مدينة أسوان، وتوصله بمركب نيلية.',
    visitDuration: 'من ساعتين لتلات ساعات',
    openingHours: 'كل يوم من 7:00 الصبح لحد 5:00 المسا (وعروض الصوت والضوء بمواعيد مسائية بالليل).',
    bestTimeToVisit: 'الصبح بدري أو وقت العصر قبل الغروب عشان انعكاس صخور الجرانيت والمعبد على صفحة النيل مع رحلة المركب.'
  },

  // 39. مدينة القصر الإسلامية بالداخلة
  'place-qasr-dakhla': {
    id: 'place-qasr-dakhla',
    slug: 'qasr-islamic-city',
    locationDescription: 'هتلاقيها شمال مدينة موط عاصمة الداخلة بحوالي 32 كم، في وسط مزارع وبساتين النخل والعيون الكبريتية بالوادي الجديد.',
    visitDuration: 'من ساعتين لتلات ساعات',
    openingHours: 'كل يوم من 8:00 الصبح لحد 5:00 المسا',
    bestTimeToVisit: 'أشهر الشتا والربيع (من نوفمبر لمارس) لما جو الواحات بيبقى معتدل ولطيف ومثالي للتجول في الحارات المسقوفة.'
  },

  // 40. قصر قارون بالفيوم
  'place-qasr-qarun': {
    id: 'place-qasr-qarun',
    slug: 'qasr-qarun-dionysias-temple',
    locationDescription: 'موجود في أقصى الطرف الغربي لبحيرة قارون شمال غرب محافظة الفيوم بحوالي 50 كم.',
    visitDuration: 'حوالي ساعة ونص',
    openingHours: 'كل يوم من 8:00 الصبح لحد 5:00 المغرب',
    bestTimeToVisit: 'الصبح بدري مع نسمة البحيرة، ويوم 21 ديسمبر من كل سنة الصبح عشان تشوف ظاهرة تعامد الشمس على قدس الأقداس.'
  },

  // 41. سوق القيسارية بأسيوط
  'place-qaysariya-assiut': {
    id: 'place-qaysariya-assiut',
    slug: 'qaysariya-heritage-bazaar-assiut',
    locationDescription: 'ممتد في الحارات والأزقة التراثية المتفرعة من شارع القيسارية غرب مدينة أسيوط جنب جامع الكاشف الأثري.',
    visitDuration: 'من ساعة ونص لساعتين',
    openingHours: 'كل يوم من 9:00 الصبح لحد 10:00 بالليل',
    bestTimeToVisit: 'فترة قبل الظهر أو بعد العصر عشان تتمشى براحتك وسط ريحة العطارة والأقمشة والمصنوعات النحاسية.'
  },

  // 42. مسجد سيدي عبد الرحيم القنائي
  'place-qenawi-mosque': {
    id: 'place-qenawi-mosque',
    slug: 'sayed-abdelrahim-qenawi-mosque',
    locationDescription: 'موجود في قلب مدينة قنا بميدان سيدي عبد الرحيم القنائي، على بعد دقايق من محطة القطر ومجمع المحاكم.',
    visitDuration: 'من ساعة لساعتين',
    openingHours: 'مفتوح كل يوم لجميع الصلوات والزيارة من صلاة الفجر لحد بعد صلاة العشا.',
    bestTimeToVisit: 'وقت صلاة الجمعة أو بين المغرب والعشا عشان تعيش الروحانيات الصعيدية الأصيلة وهدوء أروقة المسجد.'
  },

  // 43. المسجد العمري بقوص
  'place-qus-al-amri-mosque': {
    id: 'place-qus-al-amri-mosque',
    slug: 'al-amri-mosque-qus',
    locationDescription: 'موجود في قلب مدينة قوص القديمة شرق النيل جنوب محافظة قنا، في محطة تجمع قوافل الحج والتجارة التاريخية.',
    visitDuration: 'حوالي ساعة زمن',
    openingHours: 'مفتوح طول اليوم لأوقات الصلوات ومن 8:00 الصبح لحد صلاة العشا.',
    bestTimeToVisit: 'بين وقتي الظهر والعصر عشان تشوف تفاصيل المنبر الخشبي الأيوبي والزخارف الأثرية في نور النهار الواضح.'
  },

  // 44. قلعة القصير بالبحر الأحمر
  'place-quseir-fort': {
    id: 'place-quseir-fort',
    slug: 'el-quseir-ottoman-fort-port',
    locationDescription: 'مبنية على تلة بتطل على ميناء القصير القديم وشاطئ البحر الأحمر على طول بمدينة القصير التاريخية.',
    visitDuration: 'من ساعة ونص لساعتين',
    openingHours: 'كل يوم من 9:00 الصبح لحد 5:00 المغرب',
    bestTimeToVisit: 'الصبح بدري أو وقت العصر قبل الغروب عشان تجمع بين نسمة البحر واستكشاف المدافع والأبراج العثمانية.'
  },

  // 45. معبد الرامسيوم بالأقصر
  'place-ramesseum': {
    id: 'place-ramesseum',
    slug: 'the-ramesseum-luxor',
    locationDescription: 'موجود بين معبد حتشبسوت ومدينة هابو قريب من مقابر النبلاء بالبر الغربي لمدينة الأقصر.',
    visitDuration: 'حوالي ساعة ونص',
    openingHours: 'كل يوم من 6:00 الصبح لحد 5:00 المسا',
    bestTimeToVisit: 'الصبح بدري عشان تشوف تمثال رمسيس الثاني العملاق الواقع وقباب الطوب اللبن في هدوء الصباح.'
  },

  // 46. الدير الأحمر بسوهاج
  'place-red-monastery': {
    id: 'place-red-monastery',
    slug: 'red-monastery-sohag',
    locationDescription: 'موجود غرب مدينة سوهاج بحوالي 12 كم قريب من الدير الأبيض عند سفح الجبل الغربي بقرية دير الأنبا بيشوي.',
    visitDuration: 'من ساعة لساعتين',
    openingHours: 'كل يوم من 8:00 الصبح لحد 6:00 المغرب',
    bestTimeToVisit: 'الصبح من 9:00 الصبح لحد 1:00 الظهر عشان ضوء الشمس ينور الفريسكات الجدارية الملونة الأثرية اللي ملهاش مثيل في العالم.'
  },

  // 47. كهف وادي سنور
  'place-sannur': {
    id: 'place-sannur',
    slug: 'sannur-cave',
    locationDescription: 'موجود في عمق الصحرا الشرقية ببني سويف، على بعد 70 كم جنوب شرق المدينة وحوالي 18 كم من طريق الكريمات الصحراوي.',
    visitDuration: 'من ساعتين لتلات ساعات (غير وقت السفر في الطريق الصحراوي)',
    openingHours: 'مقفول دلوقتي قدام الزوار العاديين (الزيارات متاحة بس لبعثات الأبحاث اللي معاها تصريح رسمي من وزارة البيئة).',
    bestTimeToVisit: 'المكان مقفول دلوقتي لحد ما تخلص أعمال التأمين والتطوير ويفتح رسمي من جديد.'
  },

  // 48. مسجد العارف بسوهاج
  'place-sidi-arif-mosque': {
    id: 'place-sidi-arif-mosque',
    slug: 'sidi-al-arif-mosque-sohag',
    locationDescription: 'موجود في قلب الميدان التاريخي لمدينة سوهاج جنب الأسواق التجارية التراثية ومحطة القطر.',
    visitDuration: 'من ساعة إلا ربع لساعة زمن',
    openingHours: 'مفتوح من صلاة الفجر لحد بعد صلاة العشا كل يوم.',
    bestTimeToVisit: 'بين صلاتي العصر والمغرب للاستمتاع بجو الميدان الروحاني وهدوء الصحن الداخلي للمسجد.'
  },

  // 49. متحف سوهاج القومي
  'place-sohag-museum': {
    id: 'place-sohag-museum',
    slug: 'sohag-national-museum',
    locationDescription: 'مبني على كورنيش النيل على طول في قلب مدينة سوهاج بتصميم مستوحى من المعابد المصرية القديمة.',
    visitDuration: 'حوالي ساعتين زمن',
    openingHours: 'شغال كل يوم على فترتين: من 9:00 الصبح لـ 3:00 العصر، ومن 5:00 المغرب لـ 9:00 بالليل.',
    bestTimeToVisit: 'الفترة المسائية عشان تستمتع بجولة المتحف وتخرج على نسمات كورنيش نيل سوهاج الجميل.'
  },

  // 50. دير الأنبا أنطونيوس
  'place-st-anthony-monastery': {
    id: 'place-st-anthony-monastery',
    slug: 'st-anthony-monastery-red-sea',
    locationDescription: 'موجود في عمق الصحرا الشرقية عند سفح جبل الجلالة القبلي جنوب الزعفرانة بحوالي 45 كم، متصل بدروب قوافل الصعيد القديمة.',
    visitDuration: 'من ساعتين ونص لأربع ساعات',
    openingHours: 'كل يوم من 8:00 الصبح لحد 5:00 المغرب (مع مراعاة مواعيد القداسات الكنسية المقررة).',
    bestTimeToVisit: 'فصل الشتا والربيع عشان الجو بيبقى معتدل في الجبل وتقدر تطلع مغارة الأنبا أنطونيوس فوق الجبل براحتك.'
  },

  // 51. تونا الجبل بملوي
  'place-tuna-el-gebel': {
    id: 'place-tuna-el-gebel',
    slug: 'tuna-el-gebel-necropolis',
    locationDescription: 'موجودة على حافة الصحرا الغربية غرب مدينة ملوي بالمنيا بحوالي 18 كم.',
    visitDuration: 'حوالي ساعتين زمن',
    openingHours: 'كل يوم من 8:00 الصبح لحد 4:00 العصر',
    bestTimeToVisit: 'الصبح بدري في جو لطيف عشان تنزل سراديب طائر الأيبس ومقبرة إيزادورا شهيدة الحب وبيت الساقية الروماني.'
  },

  // 52. قرية تونس بالفيوم
  'place-tunis-village': {
    id: 'place-tunis-village',
    slug: 'tunis-village-faiyum',
    locationDescription: 'مبنية على ربوة عالية بتطل على الطرف الجنوبي لبحيرة قارون وشمال محمية وادي الريان بالفيوم.',
    visitDuration: 'من نص يوم ليوم كامل',
    openingHours: 'القرية مفتوحة طول اليوم، وورش الخزف والمتاحف شغالة يومياً من 9:00 الصبح لحد غروب الشمس.',
    bestTimeToVisit: 'فصل الخريف والربيع، وبالذات في أيام مهرجان تونس السنوي للخزف والفخار.'
  },

  // 53. المسلة الناقصة بأسوان
  'place-unfinished-obelisk': {
    id: 'place-unfinished-obelisk',
    slug: 'unfinished-obelisk-aswan',
    locationDescription: 'موجودة في المحاجر الجنوبية القديمة للجرانيت الوردي، قريبة من المقابر الفاطمية بمدينة أسوان.',
    visitDuration: 'حوالي ساعة زمن',
    openingHours: 'كل يوم من 7:00 الصبح لحد 5:00 المغرب',
    bestTimeToVisit: 'الصبح بدري عشان تتفادى سخونة الصخور الجرانيتية وتشوف عبقرية الفراعنة في قطع الأحجار من قلب الجبل.'
  },

  // 54. وادي الملوك بالأقصر
  'place-valley-kings': {
    id: 'place-valley-kings',
    slug: 'valley-of-the-kings',
    locationDescription: 'موجود في عمق وادٍ جبلي صخري في ضهر جبل القرنة بالبر الغربي لمدينة الأقصر على بعد 10 كم من النيل.',
    visitDuration: 'من ساعتين لتلات ساعات',
    openingHours: 'كل يوم من 6:00 الصبح لحد 5:00 المسا',
    bestTimeToVisit: 'الصبح بدري جداً في الشتا والربيع عشان تتجنب حرارة الجبل وزحمة الأفواج وتشوف المقابر الملكية بروقان.'
  },

  // 55. وادي الملكات ونفرتاري
  'place-valley-queens': {
    id: 'place-valley-queens',
    slug: 'valley-of-the-queens-nefertari',
    locationDescription: 'موجود في الطرف الجنوبي للجبانة الطيبة بالبر الغربي للأقصر قريب من معبد مدينة هابو.',
    visitDuration: 'من ساعة ونص لساعتين',
    openingHours: 'كل يوم من 6:00 الصبح لحد 5:00 المسا',
    bestTimeToVisit: 'الصبح بدري عشان تستمتع بجمال ألوان مقبرة الملكة نفرتاري الأسطورية قبل الزحمة.'
  },

  // 56. وادي الحيتان بالفيوم
  'place-wadi-al-hitan': {
    id: 'place-wadi-al-hitan',
    slug: 'wadi-al-hitan-valley-of-whales',
    locationDescription: 'موجود في عمق صحرا محمية وادي الريان جنوب غرب بحيرة قارون بحوالي 90 كم من مدينة الفيوم.',
    visitDuration: 'من نص يوم ليوم كامل (أو تخييم مصرح به)',
    openingHours: 'المحمية والمتحف المفتوح شغالين كل يوم من 8:00 الصبح لحد 5:00 المغرب (والتخييم الليلي بتصريح مسبق).',
    bestTimeToVisit: 'من شهر أكتوبر لحد أبريل عشان تستمتع بالجو المعتدل وسما النجوم الصافية ومجرة درب التبانة بالليل.'
  },

  // 57. وادي الجمال بالبحر الأحمر
  'place-wadi-el-gemal': {
    id: 'place-wadi-el-gemal',
    slug: 'wadi-el-gemal-national-park',
    locationDescription: 'موجودة جنوب مدينة مرسى علم بحوالي 45 كم، وبتشمل الوادي الرئيسي في البر وجزر حماطة وشاطئ القلعان الخلاب.',
    visitDuration: 'من 4 ساعات ليوم كامل (أو تخييم بيئي في الطبيعة)',
    openingHours: 'مفتوحة كل يوم من شروق الشمس لحد غروبها (والتخييم الليلي بتصريح بيئي مسبق).',
    bestTimeToVisit: 'من شهر أكتوبر لحد شهر مايو في جو شتوي وربيعي مثالي للبحر ومناجم الزمرد القديمة.'
  },

  // 58. وادي الريان وشلالات الفيوم
  'place-wadi-el-rayan': {
    id: 'place-wadi-el-rayan',
    slug: 'wadi-el-rayan-waterfalls-faiyum',
    locationDescription: 'موجودة في منخفض وادي الريان جنوب غرب بحيرة قارون بحوالي 40 كم بمحافظة الفيوم.',
    visitDuration: 'من 3 لـ 5 ساعات',
    openingHours: 'كل يوم من 8:00 الصبح لحد 5:00 المغرب',
    bestTimeToVisit: 'الصبح لحد العصر من أكتوبر لمايو عشان تستمتع برذاذ الشلالات وبحيرات الريان والتزحلق على الرمال.'
  },

  // 59. قرية غرب سهيل النوبية
  'place-west-suhail': {
    id: 'place-west-suhail',
    slug: 'west-suhail-village',
    locationDescription: 'مبنية فوق المنحدرات الصخرية الغربية للنيل شمال خزان أسوان بحوالي 15 كم عن وسط المدينة، وتوصلها بعربية أو بفلوكة نيلية ساحرة.',
    visitDuration: 'من 3 لـ 6 ساعات (أو بيات ليلة في البيوت والنزل البيئية)',
    openingHours: 'مفتوحة للزيارة طول اليوم، وأحلى أوقات النشاط والضيافة من 10:00 الصبح لحد 11:00 بالليل.',
    bestTimeToVisit: 'من شهر أكتوبر لحد شهر أبريل، شمس الشتا في أسوان دافية ومثالية للتجول بالقارب والجلوس في البيوت النوبية.'
  },

  // 60. الصحراء البيضاء بالفرافرة
  'place-white-desert': {
    id: 'place-white-desert',
    slug: 'white-desert-farafra',
    locationDescription: 'موجودة في قلب الصحرا الغربية على بعد 45 كم شمال واحة الفرافرة ونحو 130 كم جنوب الواحات البحرية.',
    visitDuration: 'يوم كامل أو ليلة تخييم سفاري في الصحرا',
    openingHours: 'مفتوحة للرحلات النهارية والتخييم السفاري بتصريح بيئي معتمد وبصحبة دليل سفاري بدوي مرخص.',
    bestTimeToVisit: 'أشهر الشتا والربيع (من أكتوبر لمارس) عشان تبعد عن حر الصيف وتشوف صخور الطباشير وسما النجوم الخيالية.'
  },

  // 61. الدير الأبيض بسوهاج
  'place-white-monastery': {
    id: 'place-white-monastery',
    slug: 'white-monastery-sohag',
    locationDescription: 'موجود غرب مدينة سوهاج بحوالي 8 كم في حضن سفح الجبل الغربي بقرية إدفا.',
    visitDuration: 'من ساعة ونص لساعتين',
    openingHours: 'مفتوح كل يوم للزيارة والصلوات من 8:00 الصبح لحد 6:00 المغرب.',
    bestTimeToVisit: 'شهور الشتا والربيع الصبح، وفي موسم احتفال عيد الأنبا شنودة في شهر يوليو.'
  },

  // 62. قصر البرنس يوسف كمال بنجع حمادي
  'place-youssef-kamal-palace': {
    id: 'place-youssef-kamal-palace',
    slug: 'prince-youssef-kamal-palace',
    locationDescription: 'مبني على كورنيش النيل بمدينة نجع حمادي شمال غرب محافظة قنا بحوالي 55 كم.',
    visitDuration: 'من ساعة ونص لساعتين',
    openingHours: 'كل يوم من 9:00 الصبح لحد 4:00 العصر',
    bestTimeToVisit: 'الصبح لحد الساعة واحدة الظهر عشان تستمتع بالطراز المعماري الأندلسي والحديقة التاريخية في هدوء.'
  }
};

export async function runAmmiyaPlacesMigration() {
  const uri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DB?.trim() || 'Elsa3ed_market';

  if (!uri) {
    throw new Error('MONGODB_URI is not set.');
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB:', dbName);
    const db = client.db(dbName);
    const collection = db.collection('wah_heritage_places');

    let updatedCount = 0;
    const entries = Object.values(AMMIYA_PLACES);

    for (const placeUpdate of entries) {
      const filter = {
        $or: [{ id: placeUpdate.id }, { slug: placeUpdate.slug }]
      };

      const updateDoc = {
        $set: {
          locationDescription: placeUpdate.locationDescription,
          visitDuration: placeUpdate.visitDuration,
          // root level
          openingHours: placeUpdate.openingHours,
          bestTimeToVisit: placeUpdate.bestTimeToVisit,
          // visitInfo nested level
          'visitInfo.openingHours': placeUpdate.openingHours,
          'visitInfo.bestTimeToVisit': placeUpdate.bestTimeToVisit,
          updatedAt: new Date().toISOString()
        }
      };

      const result = await collection.updateOne(filter, updateDoc);
      if (result.matchedCount > 0) {
        updatedCount++;
        console.log(`[✔] Updated: ${placeUpdate.id} (${placeUpdate.slug})`);
      } else {
        console.warn(`[!] No matching document found for ${placeUpdate.id} / ${placeUpdate.slug}`);
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} / ${entries.length} places in MongoDB!`);

    // Verify sample in DB
    const abydos = await collection.findOne({ slug: 'abydos-temple' });
    console.log('\n--- VERIFICATION SAMPLE (معبد أبيدوس) ---');
    console.log('locationDescription:', abydos?.locationDescription);
    console.log('visitDuration:', abydos?.visitDuration);
    console.log('visitInfo.openingHours:', abydos?.visitInfo?.openingHours);
    console.log('visitInfo.bestTimeToVisit:', abydos?.visitInfo?.bestTimeToVisit);

    const elephantine = await collection.findOne({ slug: 'elephantine-island-nilometer' });
    console.log('\n--- VERIFICATION SAMPLE (جزيرة إلفنتين) ---');
    console.log('locationDescription:', elephantine?.locationDescription);
    console.log('visitDuration:', elephantine?.visitDuration);
    console.log('visitInfo.openingHours:', elephantine?.visitInfo?.openingHours);
    console.log('visitInfo.bestTimeToVisit:', elephantine?.visitInfo?.bestTimeToVisit);

    return { success: true, updatedCount };
  } finally {
    await client.close();
  }
}

// Self-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAmmiyaPlacesMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
