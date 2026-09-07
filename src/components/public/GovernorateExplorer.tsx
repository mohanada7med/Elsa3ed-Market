'use client';

import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Governorate } from '../../types';
import {
  MapPin,
  Search,
  ShoppingBag,
  Users,
  Package,
  ArrowUpLeft,
  X,
  Landmark,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NubianGeometricPattern } from '../common/NubianGeometricPattern';

export interface GovernorateExplorerItem {
  name: Governorate;
  slug: string;
  region:
  | 'شمال الصعيد'
  | 'وسط الصعيد'
  | 'جنوب الصعيد'
  | 'الواحات والصحراء';
  capitalCity: string;
  famousCraft: string;
  famousItem: string;
  tags: string[];
  coverImage: string;
  folkloreProverb: string;
  shortIntro: string;
  nileOrder: number;
}

export const UPPER_EGYPT_GOVERNORATES: GovernorateExplorerItem[] = [
  {
    name: 'بني سويف',
    slug: 'beni-suef',
    region: 'شمال الصعيد',
    capitalCity: 'مدينة بني سويف',
    famousCraft: 'النباتات العطرية والطبية وفخار ميدوم',
    famousItem: 'زيوت عطرية، شيح ونعناع بلدي، وفايش صعيدي بالحليب',
    tags: ['نباتات طبية', 'فايش صعيدي', 'زيوت بابونج', 'فخار ميدوم'],
    coverImage:
      'https://res.cloudinary.com/kuana1nl/image/upload/v1788699005/WAH/provinces/beni-suef/cover.jpg',
    folkloreProverb:
      '«أول خطوة في الصعيد سلام، ومن يدخلها يلقى الإكرام»',
    shortIntro:
      'بوابة صعيد مصر الشمالية وحاضنة هرم ميدوم العريق، رائدة زراعة وتقطير النباتات الطبية والعطرية وصناعة الفايش الصعيدي.',
    nileOrder: 1,
  },
  {
    name: 'المنيا',
    slug: 'minya',
    region: 'وسط الصعيد',
    capitalCity: 'مدينة المنيا',
    famousCraft: 'عسل السدر الجبلي والزراعة العضوية النظيفة',
    famousItem:
      'عسل جبلي نقي، زيت سمسم معصور على البارد، وأعشاب برية',
    tags: ['عسل سدر جبلي', 'زيت سمسم بلدي', 'أعشاب عطرية', 'دبس رمان'],
    coverImage:
      'https://res.cloudinary.com/kuana1nl/image/upload/v1788015793/WAH/provinces/minya/cover.jpg',
    folkloreProverb:
      '«عروس الصعيد النيل في حضنها، والنخل عالي في سماها»',
    shortIntro:
      'عروس الصعيد وأرض التوحيد في تل العمارنة، تشتهر بإنتاج أجود أنواع عسل النحل الجبلي ومحاصيل الزراعة العضوية.',
    nileOrder: 2,
  },
  {
    name: 'أسيوط',
    slug: 'asyut',
    region: 'وسط الصعيد',
    capitalCity: 'مدينة أسيوط',
    famousCraft: 'فن التلي الأسيوطي الرفيع وخيوط الفضة',
    famousItem:
      'شيلان وجلاليب التلي المطرزة بالفضة الخالصة، وطواجن الفخار',
    tags: ['تلي أسيوط', 'فضة خالصة', 'تطريز يدوي', 'طواجن صعيدية'],
    coverImage:
      'https://res.cloudinary.com/kuana1nl/image/upload/v1788015789/WAH/provinces/asyut/cover.jpg',
    folkloreProverb:
      '«التلي مش بس خيط فضة، دي حكاية فرح وزفة عروسة»',
    shortIntro:
      'قلب الصعيد النابض وعاصمة درب الأربعين، موطن فن التلي النادر الذي يُحاك يدوياً بشرائط الفضة الخالصة.',
    nileOrder: 3,
  },
  {
    name: 'سوهاج',
    slug: 'sohag',
    region: 'وسط الصعيد',
    capitalCity: 'مدينة سوهاج',
    famousCraft: 'أنوال أخميم التراثية والنسيج اليدوي الأصيل',
    famousItem:
      'كليم الصوف والحرير الطبيعي، مفارش أخميم، وعسل الموالح',
    tags: ['كليم أخميم', 'حرير طبيعي', 'نسيج يدوي', 'مفارش قطنية'],
    coverImage:
      'https://res.cloudinary.com/kuana1nl/image/upload/v1788015790/WAH/provinces/sohag/cover.jpg',
    folkloreProverb:
      '«نول أخميم يغزل حرير وصوف، وكرم أهلها بالعين موصوف»',
    shortIntro:
      'مدينة النسيج التاريخية ومهد الملوك، تشتهر بأنوال كليم أخميم الحريري ومعبد أبيدوس المقدس.',
    nileOrder: 4,
  },
  {
    name: 'قنا',
    slug: 'qena',
    region: 'جنوب الصعيد',
    capitalCity: 'مدينة قنا',
    famousCraft: 'الفخار الصعيدي وأنوال الفركة بنقادة',
    famousItem:
      'قلال قنا الفخارية، شيلان الفركة الحريرية، وعسل القصب الأسود',
    tags: ['قلال قنا', 'فركة نقادة', 'طواجن فخار', 'عسل قصب'],
    coverImage:
      'https://res.cloudinary.com/kuana1nl/image/upload/v1788015791/WAH/provinces/qena/cover.jpg',
    folkloreProverb:
      '«من شرب من قلال قنا، لا بد يعود لبلادنا»',
    shortIntro:
      'أرض ثنية النيل الكبرى ومعبد دندرة، قلعة صناعة قلال الفخار المسامية الشهيرة وأنوال الفركة التراثية بمركز نقادة.',
    nileOrder: 5,
  },
  {
    name: 'الأقصر',
    slug: 'luxor',
    region: 'جنوب الصعيد',
    capitalCity: 'مدينة الأقصر',
    famousCraft: 'نحت الألاباستر والنحاسيات والخشب التراثي',
    famousItem:
      'تماثيل الألباستر اليدوية، صواني النحاس المزخرفة، وأواني خشب السرسوع',
    tags: ['ألاباستر القرنة', 'نحاس منقوش', 'خشب سرسوع', 'برديات'],
    coverImage:
      'https://res.cloudinary.com/kuana1nl/image/upload/v1788015791/WAH/provinces/luxor/cover.jpg',
    folkloreProverb:
      '«طيبة بلد التاريخ والنور، من يزورها قلبه مسرور»',
    shortIntro:
      'طيبة عاصمة العالم القديم، تضم ثلث آثار الإنسانية وورش نحت حجر الألاباستر بالبر الغربي والنحاس المطروق.',
    nileOrder: 6,
  },
  {
    name: 'أسوان',
    slug: 'aswan',
    region: 'جنوب الصعيد',
    capitalCity: 'مدينة أسوان',
    famousCraft: 'خيرات النوبة والخوص والمشغولات اليدوية',
    famousItem:
      'تمور المجدول، كركديه أسوان، عطور وبخور، وسلال الخوص النوبية',
    tags: ['تمور مجدول', 'كركديه نوبي', 'سلال خوص', 'بخور صندل'],
    coverImage:
      'https://res.cloudinary.com/kuana1nl/image/upload/v1788015791/WAH/provinces/aswan/cover.jpg',
    folkloreProverb:
      '«في أسوان السلام في القلوب قبل البيوت، والنيل فيها ما يفوت»',
    shortIntro:
      'درة النيل الجنوبية وموطن الحضارة النوبية العريقة، تشتهر ببيوتها الملونة وأسواق التوابل والمشغولات الخوصية.',
    nileOrder: 7,
  },
  {
    name: 'الوادي الجديد',
    slug: 'new-valley',
    region: 'الواحات والصحراء',
    capitalCity: 'مدينة الخارجة',
    famousCraft: 'تمور الواحات وخوص النخيل وزيت الزيتون',
    famousItem:
      'بلح صعيدي، عجوة الواحات، زيت زيتون بكر، وسلال الجريد',
    tags: ['تمور صعيدية', 'زيت زيتون بكر', 'سلال خوص ونخيل', 'دبس تمر'],
    coverImage:
      'https://res.cloudinary.com/kuana1nl/image/upload/v1788698700/WAH/provinces/new-valley/cover.jpg',
    folkloreProverb:
      '«نخلة الواحات أصلها ثابت في الأرض، وخيرها يفيض على الكل»',
    shortIntro:
      'واحات النخيل والكنوز البكر، مهد أجود أصناف التمور الصعيدية وزيت الزيتون المعصور على البارد.',
    nileOrder: 8,
  },
];

const REGION_OPTIONS = [
  { id: 'all', label: 'كل الصعيد' },
  { id: 'شمال الصعيد', label: 'شمال الصعيد' },
  { id: 'وسط الصعيد', label: 'وسط الصعيد' },
  { id: 'جنوب الصعيد', label: 'جنوب الصعيد' },
  { id: 'الواحات والصحراء', label: 'الواحات والصحراء' },
];

export const GovernorateExplorer: React.FC = () => {
  const {
    sellers,
    products,
    setSelectedGovernorateFilter,
    navigateToGovernorate,
    setActivePage,
  } = useApp();

  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewGov, setPreviewGov] =
    useState<GovernorateExplorerItem | null>(null);

  const getSellerCount = (govName: Governorate) =>
    sellers.filter(
      (seller: any) =>
        seller.governorate === govName ||
        seller.governorateName === govName
    ).length;

  const getProductCount = (govName: Governorate) =>
    products.filter(
      (product: any) =>
        product.governorate === govName ||
        product.governorateName === govName ||
        product.sellerGovernorate === govName
    ).length;

  const filteredGovernorates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return UPPER_EGYPT_GOVERNORATES.filter((gov) => {
      const regionMatch =
        selectedRegion === 'all' || gov.region === selectedRegion;

      if (!q) return regionMatch;

      const searchMatch =
        gov.name.toLowerCase().includes(q) ||
        gov.capitalCity.toLowerCase().includes(q) ||
        gov.famousCraft.toLowerCase().includes(q) ||
        gov.famousItem.toLowerCase().includes(q) ||
        gov.tags.some((tag) => tag.toLowerCase().includes(q));

      return regionMatch && searchMatch;
    }).sort((a, b) => a.nileOrder - b.nileOrder);
  }, [selectedRegion, searchQuery]);

  const handleExplore = (gov: GovernorateExplorerItem) => {
    navigateToGovernorate(gov.slug);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleShop = (govName: Governorate) => {
    setSelectedGovernorateFilter(govName);
    setActivePage('products');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <section
      dir="rtl"
      className="relative my-14 sm:my-20 max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8"
    >
      {/* Decorative Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.5] rounded-[45px] pointer-events-none">
        <NubianGeometricPattern
          variant="tapestry"
          color="#B24C2B"
          className="absolute inset-0 opacity-[0.14]"
        />
      </div>

      {/* ================= HEADER ================= */}
      <div className="relative z-10 text-center mb-10 sm:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B24C2B]/10 border border-[#B24C2B]/10 text-[#B24C2B] text-sm font-bold mb-4"
        >
          <Sparkles className="w-4 h-4" />
          من الفيوم إلى أسوان
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-[#382820] tracking-tight"
        >
          اكتشف الصعيد
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="max-w-2xl mx-auto mt-4 text-[#76675E] text-base sm:text-lg leading-8"
        >
          كل محافظة حكاية، وكل حكاية وراها ناس وصنعة وتراث يستاهل يتشاف.
        </motion.p>
      </div>

      {/* ================= SEARCH + FILTER ================= */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9A8A80]" />

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن محافظة أو حرفة أو منتج..."
            className="w-full h-13 pr-12 pl-5 rounded-2xl bg-white border border-[#E5D8D0] text-[#382820] placeholder:text-[#A99A91] outline-none focus:border-[#B24C2B] focus:ring-4 focus:ring-[#B24C2B]/10 transition-all shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {REGION_OPTIONS.map((region) => {
            const active = selectedRegion === region.id;

            return (
              <button
                key={region.id}
                type="button"
                onClick={() => setSelectedRegion(region.id)}
                className={`
                  shrink-0 px-5 h-12 rounded-xl text-sm font-bold
                  transition-all duration-200
                  ${active
                    ? 'bg-[#B24C2B] text-white shadow-[0_5px_18px_rgba(178,76,43,0.25)]'
                    : 'bg-white text-[#66574F] border border-[#E5D8D0] hover:border-[#B24C2B]/40 hover:text-[#B24C2B]'
                  }
                `}
              >
                {region.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= CARDS ================= */}
      {filteredGovernorates.length > 0 ? (
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
          {filteredGovernorates.map((gov, index) => {
            const sellersCount = getSellerCount(gov.name);
            const productsCount = getProductCount(gov.name);

            return (
              <motion.article
                key={gov.slug}
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  margin: '-50px',
                }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.05,
                }}
                whileHover={{
                  y: -6,
                }}
                className="group relative bg-white rounded-[26px] overflow-hidden border border-[#E8DDD6] shadow-[0_8px_28px_rgba(62,42,33,0.07)] hover:shadow-[0_18px_45px_rgba(62,42,33,0.13)] transition-shadow duration-300"
              >
                {/* Card Pattern */}
                <div className="absolute top-0 left-0 w-24 h-24 opacity-[0.0] pointer-events-none">
                  <NubianGeometricPattern
                    variant="diamonds"
                    color="#B24C2B"
                    className="w-full h-full"
                  />
                </div>

                {/* Image */}
                <div className="relative h-[220px] overflow-hidden">
                  <img
                    src={gov.coverImage}
                    alt={`محافظة ${gov.name}`}
                    loading={index < 4 ? 'eager' : 'lazy'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                  />

                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                  {/* Region Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md text-[#514139] text-xs font-bold shadow-md">
                      <MapPin className="w-3.5 h-3.5 text-[#B24C2B]" />
                      {gov.region}
                    </span>
                  </div>

                  {/* Governorate Title */}
                  <div className="absolute bottom-5 right-5 left-5">
                    <div className="text-white/75 text-xs mb-1">
                      {gov.capitalCity}
                    </div>

                    <h3 className="text-[27px] font-bold text-white">
                      {gov.name}
                    </h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  {/* Craft */}
                  <div className="flex items-start gap-2 mb-3">
                    <div className="mt-0.5 w-7 h-7 shrink-0 rounded-lg bg-[#B24C2B]/10 flex items-center justify-center">
                      <Landmark className="w-3.5 h-3.5 text-[#B24C2B]" />
                    </div>

                    <p className="text-sm font-bold text-[#49372F] leading-6">
                      {gov.famousCraft}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-[13px] text-[#7A6B63] leading-6 line-clamp-2 min-h-[48px]">
                    {gov.shortIntro}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center divide-x divide-x-reverse divide-[#E9DED7] border-y border-[#EEE4DE] mt-5 py-3">
                    <div className="flex-1 flex items-center justify-center gap-2">
                      <Users className="w-4 h-4 text-[#B24C2B]" />

                      <div className="leading-tight">
                        <div className="text-sm font-bold text-[#3B2922]">
                          {sellersCount}
                        </div>
                        <div className="text-[10px] text-[#918078]">
                          حرفي / بائع
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center gap-2">
                      <Package className="w-4 h-4 text-[#B24C2B]" />

                      <div className="leading-tight">
                        <div className="text-sm font-bold text-[#3B2922]">
                          {productsCount}
                        </div>
                        <div className="text-[10px] text-[#918078]">
                          منتج
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-[1fr_auto] gap-2 mt-5">
                    <button
                      type="button"
                      onClick={() => handleExplore(gov)}
                      className="h-11 rounded-xl bg-[#B24C2B] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#963E21] hover:shadow-[0_6px_18px_rgba(178,76,43,0.22)] active:scale-[0.98] transition-all"
                    >
                      استكشف
                      <ArrowUpLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShop(gov.name)}
                      title={`تسوق من ${gov.name}`}
                      className="w-11 h-11 rounded-xl border border-[#E2D5CD] bg-[#FFFCFA] text-[#5C4940] flex items-center justify-center hover:border-[#B24C2B]/40 hover:bg-[#B24C2B]/5 hover:text-[#B24C2B] active:scale-[0.98] transition-all"
                    >
                      <ShoppingBag className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      ) : (
        <div className="relative z-10 bg-white rounded-[26px] border border-[#E8DDD6] p-12 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#B24C2B]/10 flex items-center justify-center">
            <Search className="w-7 h-7 text-[#B24C2B]" />
          </div>

          <h3 className="mt-5 text-xl font-bold text-[#3B2922]">
            ملقيناش اللي بتدور عليه
          </h3>

          <p className="mt-2 text-sm text-[#7A6B63]">
            جرّب اسم محافظة أو حرفة مختلفة.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedRegion('all');
            }}
            className="mt-5 px-6 h-11 rounded-xl bg-[#B24C2B] text-white font-bold text-sm hover:bg-[#963E21] transition-colors"
          >
            عرض كل المحافظات
          </button>
        </div>
      )}

      {/* Footer Accent */}
      <div className="relative z-10 flex items-center justify-center gap-4 mt-10">
        <span className="w-12 h-px bg-[#DCCBC1]" />

        <span className="text-sm font-medium text-[#8B7B72]">
          الصعيد حكاية بتتوارث
        </span>

        <span className="w-12 h-px bg-[#DCCBC1]" />
      </div>

      {/* ================= PREVIEW ================= */}
      <AnimatePresence>
        {previewGov && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm p-4 flex items-center justify-center"
            onClick={() => setPreviewGov(null)}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
              transition={{
                duration: 0.25,
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FFFCFA] rounded-[30px] shadow-2xl"
            >
              {/* Modal Header */}
              <div className="relative h-[280px] sm:h-[350px]">
                <img
                  src={previewGov.coverImage}
                  alt={previewGov.name}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                <button
                  type="button"
                  onClick={() => setPreviewGov(null)}
                  className="absolute top-5 left-5 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#3B2922] hover:bg-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute right-6 bottom-7">
                  <span className="text-white/75 text-sm">
                    {previewGov.region}
                  </span>

                  <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1">
                    {previewGov.name}
                  </h2>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 sm:p-8">
                <div className="rounded-2xl bg-[#F8F1EC] border border-[#E9DDD5] p-5">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-[#B24C2B]/10 flex items-center justify-center">
                      <Landmark className="w-5 h-5 text-[#B24C2B]" />
                    </div>

                    <div>
                      <h3 className="font-bold text-[#3B2922] mb-1">
                        حكاية {previewGov.name}
                      </h3>

                      <p className="text-sm text-[#6F625B] leading-7">
                        {previewGov.shortIntro}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Proverb */}
                <div className="mt-7">
                  <span className="text-xs font-bold text-[#B24C2B]">
                    من كلام أهلها
                  </span>

                  <p className="mt-2 text-xl font-bold text-[#3B2922] leading-9">
                    {previewGov.folkloreProverb}
                  </p>
                </div>

                {/* Famous Craft */}
                <div className="mt-7">
                  <h3 className="font-bold text-lg text-[#3B2922]">
                    أشهر حرفة
                  </h3>

                  <p className="mt-2 text-sm text-[#6F625B] leading-7">
                    {previewGov.famousCraft}
                  </p>
                </div>

                {/* Famous Products */}
                <div className="mt-6">
                  <h3 className="font-bold text-lg text-[#3B2922]">
                    من منتجاتها
                  </h3>

                  <p className="mt-2 text-sm text-[#6F625B] leading-7">
                    {previewGov.famousItem}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {previewGov.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#E3D6CE] text-xs font-bold text-[#65564E]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Modal Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => handleExplore(previewGov)}
                    className="h-12 rounded-xl bg-[#B24C2B] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#963E21] transition-all"
                  >
                    اكتشف المحافظة
                    <ArrowUpLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShop(previewGov.name)}
                    className="h-12 rounded-xl bg-white border border-[#DCCBC1] text-[#5A463C] font-bold flex items-center justify-center gap-2 hover:border-[#B24C2B]/40 hover:text-[#B24C2B] transition-all"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    تسوق من المحافظة
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GovernorateExplorer;



