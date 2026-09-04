import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Map,
  Compass,
  Landmark,
  Hammer,
  BookOpen,
  Users,
  Utensils,
  Calendar,
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'motion/react';

export const WahEcosystemPortalSection: React.FC = () => {
  const { setActivePage } = useApp();

  const portals = [
    {
      id: 'map',
      title: 'خريطة الصعيد التفاعلية',
      tagline: 'أطلس حي لمحافظات ومعالم وحرف الصعيد',
      desc: 'استكشف جغرافية جنوب مصر، من هضاب الفيوم وجبال بني سويف، حتى نيل أسوان وبحيرة ناصر وشواطئ حلايب.',
      icon: Compass,
      color: 'from-amber-600 to-amber-800',
      badge: 'تفاعلي',
      page: 'map' as const,
      image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=600'
    },
    {
      id: 'governorates',
      title: 'محافظات الصعيد الـ 10',
      tagline: 'لكل محافظة طابع وتاريخ وصنعة',
      desc: 'دليل تفصيلي لكل محافظة: الفيوم، بني سويف، المنيا، أسيوط، سوهاج، قنا، الأقصر، أسوان، الوادي الجديد، والبحر الأحمر.',
      icon: Map,
      color: 'from-[#B45F42] to-[#8C3E25]',
      badge: '10 محافظات',
      page: 'governorates' as const,
      image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600'
    },
    {
      id: 'places',
      title: 'المعالم والتراث المعماري',
      tagline: 'صروح التاريخ ومعابد الأجداد',
      desc: 'توثيق معابد الكرنك، دندرة، إدفو، دير المحرق، قصور المنيا الخديوية، وجبانات أسوان الفاطمية وعمارة النوبة.',
      icon: Landmark,
      color: 'from-stone-700 to-stone-900',
      badge: '+150 معلم',
      page: 'places' as const,
      image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600'
    },
    {
      id: 'crafts',
      title: 'موسوعة الحرف والورش',
      tagline: 'أسرار الصنائع في أيدي الشيوخ',
      desc: 'توثيق حي لفخار قنا، تلي أسيوط الفضي، فركة نقادة الحريرية، ألباستر القرنة، وسجاد أخميم اليدوي الأصيل.',
      icon: Hammer,
      color: 'from-amber-700 to-orange-900',
      badge: 'صنائع حية',
      page: 'cultural-crafts' as const,
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600'
    },
    {
      id: 'stories',
      title: 'وه بيحكي — حكايات الصعيد',
      tagline: 'ذاكرة المرويات الشفاهية',
      desc: 'مستودع الروايات الشفاهية: مربعات ابن عروس، سيرة الهلالية، أساطير النيل والجبل، وتاريخ القرى والنجوع القديمة.',
      icon: BookOpen,
      color: 'from-purple-800 to-indigo-950',
      badge: 'أرشيف شفاهي',
      page: 'stories' as const,
      image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600'
    },
    {
      id: 'people',
      title: 'ناس الصعيد وحراس التراث',
      tagline: 'سير ومسيرات الأسطوات والشعراء',
      desc: 'وجوه صعيدية حقيقية: كبار الحرفيين، رواة الموالد، شيوخ الطرق، وفنانو النحت والنسيج ومواقف الكرم والشهامة.',
      icon: Users,
      color: 'from-blue-700 to-slate-900',
      badge: 'شخصيات ملهمة',
      page: 'people' as const,
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600'
    },
    {
      id: 'food',
      title: 'طعم الصعيد — المطبخ الأصيل',
      tagline: 'سر الفرن البلدي وخيرات الأرض',
      desc: 'الشمس البلدي، الفايش الصعيدي الأصيل بالسمسم، الكشك المنياوي، ملوخية الصعيد المجففة، وعسل وسمن الجبل.',
      icon: Utensils,
      color: 'from-emerald-700 to-teal-950',
      badge: 'وصفات وأسرار',
      page: 'food' as const,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'
    },
    {
      id: 'events',
      title: 'فعاليات ومواسم الصعيد',
      tagline: 'أجندة الموالد وحلقات التحطيب',
      desc: 'موسم كسر القصب، مولد سيدي عبد الرحيم القنائي، مهرجان التحطيب السنوي بالأقصر، وتعامد الشمس في أبو سمبل.',
      icon: Calendar,
      color: 'from-rose-700 to-pink-950',
      badge: 'أجندة حية',
      page: 'events' as const,
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600'
    },
    {
      id: 'marketplace',
      title: 'سوق وه الحرفي (المتجر)',
      tagline: 'من الورشة لبيتك مباشرة',
      desc: 'تسوق منتجات حقيقية أصلية مضمونة من ورش قنا وأسوان وسوهاج، بدفع آمن وشحن معتمد لكل محافظات مصر.',
      icon: ShoppingBag,
      color: 'from-amber-800 to-orange-950',
      badge: 'سوق وه المباشر',
      page: 'products' as const,
      image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600'
    }
  ];

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B45F42]/10 border border-[#B45F42]/20 text-[#B45F42] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>منظومة «وه» الشاملة</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-[#29221D] dark:text-[#FAF6F2] font-serif">
          أبواب العالم الرقمي لصعيد مصر
        </h2>
        <p className="text-sm sm:text-base text-[#6E6359] dark:text-[#B8ACA0] leading-relaxed">
          «وه» ليست مجرد منصة تجارية؛ بل موسوعة حية ونافذة مفتوحة على تاريخ وجغرافية وأهل وروح صعيد مصر الأصيل.
        </p>
      </div>

      {/* Grid of Portals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portals.map((portal, idx) => {
          const Icon = portal.icon;
          return (
            <motion.div
              key={portal.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              onClick={() => setActivePage(portal.page)}
              className="group relative bg-white dark:bg-[#1C1816] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#B45F42] transition-all cursor-pointer flex flex-col justify-between"
            >
              {/* Image banner */}
              <div className="relative h-44 w-full overflow-hidden bg-stone-200">
                <img
                  src={portal.image}
                  alt={portal.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                {/* Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold">
                    {portal.badge}
                  </span>
                </div>

                {/* Icon Float */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2 text-white">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-xs text-amber-200 font-bold block">{portal.tagline}</span>
                    <h3 className="text-base font-black font-serif text-white">{portal.title}</h3>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs sm:text-sm text-[#6E6359] dark:text-[#A89C90] leading-relaxed">
                  {portal.desc}
                </p>

                <div className="pt-2 border-t border-[#F0EAE1] dark:border-[#2C2420] flex items-center justify-between text-[#B45F42] dark:text-[#FF855D] text-xs font-bold group-hover:underline">
                  <span>دخول البوابة</span>
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
