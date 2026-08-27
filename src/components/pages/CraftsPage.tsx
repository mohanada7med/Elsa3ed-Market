import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, MapPin, ChevronRight, Film, ArrowLeft, CheckCircle2, Award } from 'lucide-react';

export const CraftsPage: React.FC = () => {
  const { setActivePage, setShowIntroVideo, setSelectedCategoryFilter } = useApp();

  const CRAFT_STORIES = [
    {
      id: 'pottery-qena-assiut',
      title: 'فخار قنا وأسيوط وطمي النيل العذب',
      governorate: 'محافظتي قنا وأسيوط',
      history: 'تاريخ موغل يمتد لأكثر من 5000 عام منذ مصر القديمة',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
      description:
        'يمتاز فخار قنا وأسيوط بأنه يُصنع من طين نقي معالج بأساليب توارثها الحرفيون عبر آلاف السنين. بفضل مسامية الطين الصعيدي الدقيقة، يعمل الفخار كمرشح طبيعي يبرد الماء النقي بنقاء ويزيل الأملاح الزائدة، كما يمنح الطواجن الصعيدية نكهة لا تضاهى في الطبخ.',
      steps: [
        'جمع الطمي الطبيعي من ضفاف النيل والوديان وترسيبه في أحواض مائية',
        'عجن الطين بالأقدام والأيدي لإخراج فقاعات الهواء وضمان التماسك',
        'التشكيل اليدوي على دولاب الفخار الخشبي التقليدي بدقة بالغة',
        'التجفيف تحت شمس الصعيد الدافئة ثم الحرق في أفران بلدي بدرجة حرارة محسوبة'
      ],
      categoryId: 'pottery'
    },
    {
      id: 'kilim-akhmim',
      title: 'كليم أخميم الصوفي (أنوال سوهاج)',
      governorate: 'مدينة أخميم - سوهاج',
      history: 'تراث نسيجي عالمي يعود للقرن الرابع الميلادي',
      image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
      description:
        'أخميم هي عاصمة النسيج اليدوي في صعيد مصر. تتميز قطع الكليم بنقوشها الهندسية المبهجة وألوانها المستخلصة من قشور الرمان، الكركم، والنيلة الزرقاء. كل عقدة في الكليم تعبر عن صبر وإبداع النساج الصعيدي.',
      steps: [
        'فرز صوف الخراف الطبيعي وغزله إلى خيوط متينة بأيدي نساء القرية',
        'صباغة الخيوط بصبغات نباتية ومعدنية صديقة للبيئة مقاومة للبهتان',
        'شد السدى على النول الخشبي وتجهيز المشط والمكوك',
        'نسج الرسوم الهندسية يدوياً عقدة بعقدة لأسابيع متتالية'
      ],
      categoryId: 'kilim-carpets'
    },
    {
      id: 'tally-assiut',
      title: 'تلي أسيوط (التطريز بشرائط الفضة والنحاس)',
      governorate: 'أسيوط وقراها التراثية',
      history: 'حرفة نادرة مسجلة ضمن قوائم صون التراث العالمي',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      description:
        'فن التلي هو أحد أرقى فنون التطريز التراثية النسائية في مصر والعالم. تُستعمل فيه شرائط مفلطحة من الفضة الخالصة أو النحاس المطلي، تُثبت على نسيج التل أو الشاش القطني الخفيف لتشكل لوحات فنية تحكي أساطير الصعيد والبركة والوفاء.',
      steps: [
        'تصميم ورسم الرموز والوحدات التراثية (الشمعة، النخلة، الجمل، العروسة)',
        'استخدام إبرة مخصصة مفلطحة لتمرير شرائط الفضة دون قطع النسيج',
        'ثني شريط الفضة وضغطه بأظافر اليد ليعكس الضوء والبريق مع كل حركة',
        'تجميع القطعة وإنهاؤها كشال فاخر أو فستان تراثي متميز'
      ],
      categoryId: 'tally-embroidery'
    },
    {
      id: 'palm-aswan',
      title: 'خوص النخيل وسلال الدوم (أسوان والنوبة)',
      governorate: 'أسوان، النوبة، والأقصر',
      history: 'صناعة بيئية مستدامة متوارثة منذ حضارة كرمة والنوبة القديمة',
      image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80',
      description:
        'تستغل قرى النوبة وأسوان سعف النخيل وأوراق شجر الدوم المعمر لصناعة أجمل السلال الملونة، والأطباق المعلقة، والمفارش الطبيعية، مما يحافظ على البيئة ويوفر دخلاً كريماً لعائلات الجنوب.',
      steps: [
        'حصاد سعف النخيل في مواسم التقليم وتجفيفه تحت أشعة الشمس',
        'تقسيم السعف إلى خيوط دقيقة ونقعها في الماء لزيادة مرونتها',
        'صباغة جزء من السعف بألوان حيوية مستمدة من التراث النوبي',
        'جدل السلال يدوياً وتشكيل الأنماط الدائرية والهندسية المتناسقة'
      ],
      categoryId: 'palm-wicker'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#8c6b53]">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#943310] transition-colors"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="text-gray-900 font-bold">أطلس حرف الصعيد التراثية</span>
      </nav>

      {/* Hero Banner with Documentary CTA */}
      <div className="bg-[#241710] rounded-3xl p-6 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#943310] text-amber-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>الموسوعة التراثية الرقمية</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-heritage leading-tight">
            أطلس الحرف التراثية في صعيد مصر
          </h1>

          <p className="text-xs sm:text-sm text-[#cfc0b3] leading-relaxed">
            توثيق تاريخي وبصري لأعرق الحرف اليدوية في محافظات الصعيد السبع، وقصص شيوخ الصنعة الذين صمدت ورشهم لآلاف السنين في وجه الاندثار.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="crafts-watch-film-btn"
              onClick={() => setShowIntroVideo(true)}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs shadow-md flex items-center gap-2 transition-all"
            >
              <Film className="w-4 h-4" />
              <span>مشاهدة الفيلم الوثائقي التفاعلي</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Craft Stories Articles */}
      <div className="space-y-12">
        {CRAFT_STORIES.map((story, idx) => (
          <article
            key={story.id}
            id={story.id}
            className="bg-white rounded-3xl border border-[#ebdccd] shadow-md overflow-hidden p-6 sm:p-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Visual Side */}
              <div className={`lg:col-span-5 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-4/3">
                  <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 right-3 text-white">
                    <span className="text-[11px] text-amber-300 font-bold block">الموطن التراثي:</span>
                    <span className="font-bold text-sm">{story.governorate}</span>
                  </div>
                </div>
              </div>

              {/* Story Content */}
              <div className={`lg:col-span-7 space-y-4 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-amber-100 text-[#943310] text-xs font-bold rounded-lg border border-amber-300">
                    {story.governorate}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">| {story.history}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-heritage">
                  {story.title}
                </h2>

                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {story.description}
                </p>

                {/* Steps / Techniques list */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-[#943310]">مراحل الصنعة اليدوية المتوارثة:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {story.steps.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-2.5 bg-[#faf6f0] rounded-xl border border-[#ebdccd] text-[11px] text-gray-800 flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shop this craft button */}
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryFilter(story.categoryId);
                      setActivePage('products');
                    }}
                    className="px-6 py-2.5 bg-[#943310] hover:bg-[#7c280a] text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    <span>تصفح قطع {story.title.split('(')[0]}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
