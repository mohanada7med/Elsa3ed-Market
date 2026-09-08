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
  ArrowUpLeft,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'motion/react';

export const WahEcosystemPortalSection: React.FC = () => {
  const { setActivePage, wahStats } = useApp();

  const portals = [
    {
      id: 'map',
      title: 'أطلس الصعيد التفاعلي',
      tagline: 'على خط النيل اكتشف محافظات ومعالم وحرف الصعيد',
      desc: 'استكشف محافظات جنوب مصر من الفيوم وبني سويف حتى أسوان والنوبة.',
      icon: Compass,
      badge: 'اكتشف الصعيد..',
      page: 'map' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788790207/d13c685b-4403-4983-96fe-49f3b7a925c3.png'
    },
    {
      id: 'governorates',
      title: wahStats?.governoratesCount ? `محافظات الصعيد الـ ${wahStats.governoratesCount}` : 'محافظات صعيد مصر',
      tagline: 'لكل محافظة طابع وتاريخ وصنعة',
      desc: 'دليل تفصيلي لكل محافظة: الفيوم، بني سويف، المنيا، أسيوط، سوهاج، قنا، الأقصر، أسوان، الوادي الجديد.',
      icon: Map,
      badge: `${wahStats?.governoratesCount || 8} محافظات`,
      page: 'governorates' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788791500/copy_of_.jpg'
    },
    {
      id: 'places',
      title: 'المعالم والتراث المعماري',
      tagline: 'صروح التاريخ ومعابد الأجداد',
      desc: 'توثيق معابد الكرنك، دندرة، إدفو، دير المحرق، قصور المنيا الخديوية، وجبانات أسوان الفاطمية وعمارة النوبة.',
      icon: Landmark,
      badge: wahStats?.placesCount ? `${wahStats.placesCount} معلم موثق` : 'معالم موثقة',
      page: 'places' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788715371/WAH/heritage-places/karnak-temples/img_2332_1788715371753_8g8m.jpg'
    },
    {
      id: 'crafts',
      title: 'موسوعة الحرف والورش',
      tagline: 'أسرار الصنائع في أيدي الشيوخ',
      desc: 'توثيق حي لفخار قنا، تلي أسيوط الفضي، فركة نقادة الحريرية، ألباستر القرنة، وسجاد أخميم اليدوي الأصيل.',
      icon: Hammer,
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
      badge: 'سوق وه المباشر',
      page: 'products' as const,
      image: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788790754/6d17f117-649a-4a79-b565-3f3eef139000.png'
    }
  ];

  return (
    <section
      dir="rtl"
      className="
        py-16
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors duration-500
        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
        max-w-[1600px]
        mx-auto
        px-5
        sm:px-8
        lg:px-12
      "
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#9a6a35] text-xs font-bold backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#9a6a35]" />
          <span>منظومة «وه» الشاملة</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black font-serif tracking-tight">
          أول منصة صعيدية شاملة
        </h2>
        <p className="text-sm sm:text-base text-black/60 dark:text-white/60 leading-relaxed">
          "وه" مش مجرد منصة تجارية؛ ولكن موسوعة حية ونافذة مفتوحة
          <br className="hidden sm:inline" />
          على تاريخ وجغرافية وأهل وروح صعيد مصر الأصيل.
        </p>
      </div>

      {/* Grid of Portals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {portals.map((portal, idx) => {
          const Icon = portal.icon;
          return (
            <motion.article
              key={portal.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              onClick={() => setActivePage(portal.page)}
              className="
                group
                relative
                overflow-hidden
                rounded-[2rem]
                bg-white/50
                dark:bg-white/[0.035]
                border border-black/10
                dark:border-white/10
                cursor-pointer
                transition-all
                duration-500
                hover:-translate-y-1.5
                hover:border-[#9a6a35]
                hover:shadow-[0_20px_50px_rgba(154,106,53,0.12)]
                flex flex-col justify-between
                backdrop-blur-xl
                p-4
                sm:p-5
                shadow-lg
              "
            >
              <div>
                {/* Image Frame */}
                <div className="relative h-64 sm:h-72 overflow-hidden rounded-[1.5rem] bg-black/5 dark:bg-white/5">
                  <img
                    src={portal.image}
                    alt={portal.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/50 group-hover:via-black/20 transition-colors z-10" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1 rounded-xl bg-black/40 backdrop-blur-xl border border-white/20 text-white text-[10px] font-bold shadow-sm">
                      {portal.badge}
                    </span>
                  </div>

                  {/* Title & Overlay Information */}
                  <div className="absolute right-5 left-5 bottom-5 z-20 text-white">
                    <div className="flex items-center gap-1.5 mb-1.5 text-amber-200">
                      <Icon className="w-4 h-4 text-[#9a6a35]" />
                      <span className="text-xs font-bold">{portal.tagline}</span>
                    </div>
                    <h3 className="text-2xl font-black font-serif leading-snug drop-shadow-md">
                      {portal.title}
                    </h3>
                  </div>

                  {/* Floating Hover Arrow */}
                  <div className="absolute bottom-5 left-5 z-20 w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                    <ArrowUpLeft size={18} className="text-[#9a6a35]" />
                  </div>
                </div>

                {/* Description Body */}
                <div className="p-5 sm:p-6">
                  <p className="text-xs sm:text-sm leading-relaxed text-black/65 dark:text-white/65 line-clamp-3">
                    {portal.desc}
                  </p>
                </div>
              </div>

              {/* Footer Action */}
              <div className="px-5 sm:px-6 py-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs font-bold text-[#9a6a35]">
                <span>دخول البوابة</span>
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};