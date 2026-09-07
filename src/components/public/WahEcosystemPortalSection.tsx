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
import { NubianGeometricPattern } from '../common/NubianGeometricPattern';

export const WahEcosystemPortalSection: React.FC = () => {
  const { setActivePage } = useApp();

  const portals = [
    {
      id: 'map',
      title: 'أطلس الصعيد التفاعلي',
      tagline: 'على خط النيل اكتشف محافظات ومعالم وحرف الصعيد',
      desc: 'استكشف محافظات جنوب مصر من الفيوم وبني سويف حتى أسوان والنوبة.',
      icon: Compass,
      color: 'from-amber-600 to-amber-800',
      badge: 'اكتشف الصعيد..',
      page: 'map' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788790207/d13c685b-4403-4983-96fe-49f3b7a925c3.png'
    },
    {
      id: 'governorates',
      title: 'محافظات الصعيد الـ 8',
      tagline: 'لكل محافظة طابع وتاريخ وصنعة',
      desc: 'دليل تفصيلي لكل محافظة: الفيوم، بني سويف، المنيا، أسيوط، سوهاج، قنا، الأقصر، أسوان، الوادي الجديد .',
      icon: Map,
      color: 'from-[#B24C2B] to-[#8C3E25]',
      badge: '8 محافظات',
      page: 'governorates' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788791500/copy_of_.jpg'
    },
    {
      id: 'places',
      title: 'المعالم والتراث المعماري',
      tagline: 'صروح التاريخ ومعابد الأجداد',
      desc: 'توثيق معابد الكرنك، دندرة، إدفو، دير المحرق، قصور المنيا الخديوية، وجبانات أسوان الفاطمية وعمارة النوبة.',
      icon: Landmark,
      color: 'from-stone-700 to-stone-900',
      badge: '+180 معلم',
      page: 'places' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788715371/WAH/heritage-places/karnak-temples/img_2332_1788715371753_8g8m.jpg'
    },
    {
      id: 'crafts',
      title: 'موسوعة الحرف والورش',
      tagline: 'أسرار الصنائع في أيدي الشيوخ',
      desc: 'توثيق حي لفخار قنا، تلي أسيوط الفضي، فركة نقادة الحريرية، ألباستر القرنة، وسجاد أخميم اليدوي الأصيل.',
      icon: Hammer,
      color: 'from-amber-700 to-orange-900',
      badge: 'حرف صعيدية',
      page: 'cultural-crafts' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788789051/%D9%81%D8%AE%D8%A7%D8%B1%D8%B1%D8%B1%D8%B1.jpg'
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
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788790419/3a9467d6-9e60-4f24-987d-d65a73d19fed.png'
    },
    {
      id: 'people',
      title: 'ناس الصعيد وحُرّاس الحكاية',
      tagline: 'حكايات الأسطوات والشعراء وأهل الصنعة',
      desc: 'تعرّف على وجوه الصعيد الحقيقية؛ أسطوات الحرف، رواة الحكايات، الشعراء، وفناني التراث، وكل شخص شايل حكاية من حكايات المكان.',
      icon: Users,
      color: 'from-blue-700 to-slate-900',
      badge: 'وجوه من الصعيد',
      page: 'people' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788790532/8460cc50-45f5-4452-8f78-993668390750.png'
    },

    {
      id: 'food',
      title: 'طعم الصعيد — المطبخ الأصيل',
      tagline: 'سر الفرن البلدي وخيرات الأرض',
      desc: 'العيش الشمسى البلدي، الفايش الصعيدي الأصيل بالسمسم، الكشك المنياوي، ملوخية الصعيد المجففة، وعسل وسمن الجبل.',
      icon: Utensils,
      color: 'from-emerald-700 to-teal-950',
      badge: 'وصفات وأسرار',
      page: 'food' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788790638/05ef9181-0c18-4290-8a57-b2d054054e7f.png'
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
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788790617/145b481b-d989-4d5b-82cf-26bbb0b5d6eb.png'
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
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788790754/6d17f117-649a-4a79-b565-3f3eef139000.png'
    }
  ];

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B24C2B]/10 border border-[#B24C2B]/20 text-[#B24C2B] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>منظومة «وه» الشاملة</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-[#241E1A] dark:text-[#FAF6F2] font-serif">
          أول منصه صعيديه شامله
        </h2>
        <p className="text-sm sm:text-base text-[#6E6359] dark:text-[#B8ACA0] leading-relaxed">
          "وه" مش مجرد منصة تجارية؛ ولكن موسوعة حية ونافذة مفتوحة
          <br />
          على  تاريخ وجغرافية وأهل وروح صعيد مصر الأصيل
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
              className="group relative bg-white dark:bg-[#1C1816] rounded-3xl border border-[#E5DDD3] dark:border-[#352B24] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#B24C2B] transition-all cursor-pointer flex flex-col justify-between"
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
              <div className="relative p-5 flex-1 flex flex-col justify-between space-y-4 overflow-hidden">
                {(
                  <NubianGeometricPattern
                    opacity={0.05}
                    color="#B24C2B"
                    variant="diamonds"
                    className="group-hover:opacity-25 transition-opacity"
                  />
                )}
                <p className="relative z-10 text-xs sm:text-sm text-[#6E6359] dark:text-[#A89C90] leading-relaxed">
                  {portal.desc}
                </p>

                <div className="relative z-10 pt-2 border-t border-[#F0EAE1] dark:border-[#2C2420] flex items-center justify-between text-[#B24C2B] dark:text-[#FF855D] text-xs font-bold group-hover:underline">
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
