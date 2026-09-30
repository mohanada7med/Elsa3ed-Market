'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Send,
  CheckCircle2,
  HelpCircle,
  Truck,
  RotateCcw,
  Store,
  Compass,
  Headphones,
  Award,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FaqItem {
  id: string;
  category: 'shipping' | 'quality' | 'artisans' | 'returns' | 'payment';
  question: string;
  answer: string;
  badge?: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'f-1',
    category: 'shipping',
    question: 'إزاي بتضمنوا وصول الفخار والخزف والألاباستر سليم من غير كسر؟',
    answer:
      'كل قطعة بتطلع من ورش الصعيد بتمر بنظام تغليف مصفح ثلاثي الطبقات: طبقة فقاعات هوائية سميكة (Air-Bubble Cushioning)، زوايا كرتونية مقواة عازلة للصدمات، وصناديق خشبية خفيفة للقطع الكبيرة أو الفخار النادر. بنتعامل مع شركات شحن متخصصة في شحن التحف والقطع القابلة للكسر، وفي حال حصل أي كسر لا قدر الله أثناء الشحن، بنتحمل المسؤولية كاملة وبنستبدل القطعة أو نرجع المبلغ فوراً دون أي نقاش.',
    badge: 'ضمان التغليف المصفح',
  },
  {
    id: 'f-2',
    category: 'quality',
    question: 'هل المنتجات المعروضة يدوية وأصيلة 100% ولا شغل مصانع مقلد؟',
    answer:
      'منصة «وَه» مبنية أساساً على توثيق وحماية الصنعة الصعيدية الأصيلة. كل قطعة على المنصة وراها شيخ كار أو أسطى معروف وموثق بالاسم والمكان، تقدر تشوف فيديو صناعة القطعة بنفسك في ورشته (Reels). لا نسمح بأي منتجات مصنعية مقلدة أو تجارية رديئة، وكل طلب بيخرج معاه «ختم أصالة وَه» موضح فيه اسم الصانع وقريته وتاريخ صُنع القطعة.',
    badge: 'ختم أصالة الصنعة',
  },
  {
    id: 'f-3',
    category: 'artisans',
    question: 'أنا حرفي أو صاحب ورشة في الصعيد.. إزاي أعرض شغلي في سوق وَه؟',
    answer:
      'يا مرحب بيك في دارك! المنصة معمولة مخصوص عشان تفتح باب الرزق والتوثيق لكل أسطى وشيخ كار في محافظات الصعيد. تقدر تدوس على "سجل كبائع حرفي" من القائمة أو تتواصل معانا مباشرة عبر واتساب، وفريقنا المتنقل في محافظات الجنوب هيزور ورشتك، يوثق شغلك ويصور منتجاتك مجاناً بالكامل لمساعدتك في البيع والتوصيل لكل أنحاء مصر والعالم.',
    badge: 'باب الورش مفتوح',
  },
  {
    id: 'f-4',
    category: 'returns',
    question: 'لو القطعة وصلتني وفيها اختلاف عن الصورة، إيه سياسة الإرجاع؟',
    answer:
      'حقك محفوظ بالكامل ومضمون بعهد الصعيد وقانون حماية المستهلك. لأن المنتجات يدوية، فكل قطعة بتكون متفردة وبها لمسات الصانع الحقيقية، لكن إذا كان هناك عيب واضح أو اختلاف جوهري عن المواصفات، تقدر تطلب الاستبدال أو الإرجاع خلال 14 يوماً من استلام الطلب مع استرداد كامل المبلغ المدفوع ومصاريف الشحن.',
    badge: '14 يوم استرجاع',
  },
  {
    id: 'f-5',
    category: 'shipping',
    question: 'الشحن بياخد وقت قد إيه لمحافظات بحري والقاهرة؟',
    answer:
      'الطلبيات بتخرج مباشرة من ورش الحرفيين في محافظات الصعيد (قنا، الأقصر، أسوان، سوهاج، أسيوط). التوصيل لمحافظات الصعيد بياخد من يومين إلى 3 أيام عمل، ولمحافظات القاهرة والدلتا من 3 إلى 5 أيام عمل، مع إمكانية تتبع شحنتك لحظة بلحظة عبر صفحة "تتبع الطلبات" برقم الشحنة.',
  },
  {
    id: 'f-6',
    category: 'payment',
    question: 'إيه هي طرق الدفع المتاحة على المنصة؟',
    answer:
      'بنوفر لك كل الطرق اللي تريحك: الدفع عند الاستلام كاش بعد معاينة طردك، الدفع الإلكتروني الآمن بالفيزا والماستركارد عبر بوابات مصرفية مشفرة، المحافظ الإلكترونية (فودافون كاش وأورنج واتصالات ووي)، بالإضافة لتطبيق إنستاباي (InstaPay) المباشر.',
  },
];

export const HelpAndContactPage: React.FC = () => {
  const { setActivePage, addToast, setIsAuthModalOpen } = useApp();

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    governorate: 'قنا',
    subjectType: 'order_inquiry',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // FAQ active filter and accordion
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('f-1');

  const filteredFaqs =
    activeFaqCategory === 'all'
      ? FAQS
      : FAQS.filter((f) => f.category === activeFaqCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      addToast('بيانات ناقصة', 'برجاء كتابة الاسم، ورقم الهاتف، ونص الرسالة لإتمام الإرسال', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      addToast('وصلت رسالتك للديوان', 'تسلم إيدك يا غالي! رسالتك وصلت لديوان وه وهنرد عليك في أسرع وقت', 'success');
      setFormData({
        name: '',
        phone: '',
        email: '',
        governorate: 'قنا',
        subjectType: 'order_inquiry',
        message: '',
      });
      setTimeout(() => setIsSubmitted(false), 8000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FFF9EE] dark:bg-[#1B1009] text-[#3B1E0E] dark:text-[#FFF9EE] pb-24 transition-colors duration-300">
      {/* 1. HERO SECTION - مضيافة وه */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#3B1E0E] via-[#2A150A] to-[#1B1009] text-[#FFF9EE] pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#C99444]/30">
        {/* Pattern & glow */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-screen"
          style={{
            backgroundImage: "url('/pattern/pat2.png')",
            backgroundRepeat: 'repeat',
            backgroundSize: '400px auto',
          }}
          aria-hidden="true"
        />
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#C99444]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-[#E66A2E]/15 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C99444]/20 border border-[#C99444]/40 text-[#E0C79B] text-xs font-bold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#C99444]" />
            <span>ديوان العون والمضايفة التراثي</span>
          </div>

          <h1 className="font-main text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.2]">
            مضايفة <span className="text-[#C99444]">وَه</span>.. بابنا مفتوح وواجب الضيافة واصل
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#D6C6B1] leading-relaxed font-normal">
            إحنا هنا عشان نخدمك كأهل دار. سواء عندك استفسار عن شحنة، بتدور على قطعة معمولة على مزاجك من الورش، أو عاوز تنضم لشيوخ الكار.. رسالتك في عينينا.
          </p>

          {/* Heritage Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-white/90">
              <Headphones className="w-3.5 h-3.5 text-[#C99444]" />
              فريق دعم من أهل الصعيد 7 أيام بالأسبوع
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-white/90">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ضمان سلامة القطع التراثية 100%
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-white/90">
              <Store className="w-3.5 h-3.5 text-amber-300" />
              اتصال مباشر مع شيوخ الصنعة
            </span>
          </div>
        </div>
      </section>

      {/* 2. DIRECT CONTACT CHANNELS CARDS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* WhatsApp Direct */}
          <a
            href="https://wa.me/201158969931?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%20%D9%8A%D8%A7%20%D8%AF%D9%8A%D9%88%D8%A7%D9%86%20%D9%88%D9%87%D8%8C%20%D8%B9%D9%86%D8%AF%D9%8A%20%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D9%85%D9%86%D8%B5%D8%A9%20%D9%88%D9%87"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-5 rounded-2xl bg-white dark:bg-[#26160D] border border-[#C99444]/30 shadow-md hover:shadow-xl hover:border-[#C99444] transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-main text-lg text-[#3B1E0E] dark:text-[#FFF9EE]">واتساب الدعم السريع</h3>
              <p className="text-xs text-[#8C6F53] dark:text-[#D6C6B1] mt-1 leading-relaxed">
                تواصل مباشر وفوري مع فريق ديوان وه للرد على استفسارك ومتابعة طلبيتك.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>ابعت رسالة دلوقتي</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* Hotline / Phone */}
          <a
            href="tel:+201158969931"
            className="group relative p-5 rounded-2xl bg-white dark:bg-[#26160D] border border-[#C99444]/30 shadow-md hover:shadow-xl hover:border-[#C99444] transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary dark:text-primary-hover flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-main text-lg text-[#3B1E0E] dark:text-[#FFF9EE]">اتصل بالديوان</h3>
              <p className="text-xs text-[#8C6F53] dark:text-[#D6C6B1] mt-1 leading-relaxed">
                متاحين يومياً من 9 صباحاً لحد 10 مساءً للرد على مكالماتكم الكريمة.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-bold text-primary dark:text-primary-hover">
              <span dir="ltr">+20 115 896 9931</span>
              <Phone className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* Official Email */}
          <a
            href="mailto:support@wah-saeed.com"
            className="group relative p-5 rounded-2xl bg-white dark:bg-[#26160D] border border-[#C99444]/30 shadow-md hover:shadow-xl hover:border-[#C99444] transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-main text-lg text-[#3B1E0E] dark:text-[#FFF9EE]">البريد الرسمي</h3>
              <p className="text-xs text-[#8C6F53] dark:text-[#D6C6B1] mt-1 leading-relaxed">
                لطلبات التوريد والمؤسسات، الشراكات الثقافية، والتقارير الرسمية.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
              <span dir="ltr">support@wah-saeed.com</span>
              <Send className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* Upper Egypt Centers */}
          <div className="group relative p-5 rounded-2xl bg-white dark:bg-[#26160D] border border-[#C99444]/30 shadow-md hover:shadow-xl hover:border-[#C99444] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-main text-lg text-[#3B1E0E] dark:text-[#FFF9EE]">مراكز وه بالجنوب</h3>
              <p className="text-xs text-[#8C6F53] dark:text-[#D6C6B1] mt-1 leading-relaxed">
                الأقصر (الكورنيش) • أسوان (غرب سهيل) • قنا (نقادة وقوص) • القاهرة (ديوان التوزيع).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
              <span>الصعيد كله بلدنا</span>
              <Compass className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT: CONTACT FORM + FAQ ACCORDION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Form Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#26160D] border border-[#C99444]/35 shadow-lg relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary dark:text-primary-hover text-xs font-bold">
                  <Send className="w-3 h-3" />
                  <span>رسالة لديوان وه</span>
                </div>
                <h2 className="font-main text-2xl sm:text-3xl text-[#3B1E0E] dark:text-[#FFF9EE]">
                  اكتب رسالتك وطلبك
                </h2>
                <p className="text-xs text-[#8C6F53] dark:text-[#D6C6B1] leading-relaxed">
                  سواء كنت زبون بتسأل عن شحنتك أو حرفي عاوز تعرض شغلك الأصيل، اكتب بياناتك وهنتواصل معاك.
                </p>
              </div>

              {isSubmitted && (
                <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>وصلت رسالتك لديوان وه، وهيتصل بيك حد من شيوخ الدعم في أقرب وقت. نورتنا يا غالي!</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[#3B1E0E] dark:text-[#FFF9EE]">
                    اسمك الكريم <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: الحاج عثمان القناوي"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-[#3B1E0E] dark:text-[#FFF9EE]">
                      رقم الهاتف / الواتساب <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="010XXXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:border-primary transition-colors text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-[#3B1E0E] dark:text-[#FFF9EE]">
                      المحافظة
                    </label>
                    <select
                      value={formData.governorate}
                      onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="قنا">قنا</option>
                      <option value="الأقصر">الأقصر</option>
                      <option value="أسوان">أسوان</option>
                      <option value="سوهاج">سوهاج</option>
                      <option value="أسيوط">أسيوط</option>
                      <option value="المنيا">المنيا</option>
                      <option value="بني سويف">بني سويف</option>
                      <option value="الفيوم">الفيوم</option>
                      <option value="الوادي الجديد">الوادي الجديد</option>
                      <option value="البحر الأحمر">البحر الأحمر</option>
                      <option value="القاهرة والجيزة">القاهرة والجيزة</option>
                      <option value="محافظة أخرى">محافظة أخرى</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[#3B1E0E] dark:text-[#FFF9EE]">
                    نوع الموضوع
                  </label>
                  <select
                    value={formData.subjectType}
                    onChange={(e) => setFormData({ ...formData, subjectType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="order_inquiry">استفسار عن طلب أو تتبع شحنة</option>
                    <option value="artisan_join">أنا صانع وعاوز انضم لسوق وه</option>
                    <option value="custom_order">طلب قطعة يدوية بمواصفات خاصة</option>
                    <option value="wholesale">طلبات الجملة والتوريدات الفندقية</option>
                    <option value="feedback">اقتراح أو ملاحظة لتطوير المنصة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[#3B1E0E] dark:text-[#FFF9EE]">
                    نص الرسالة أو الاستفسار <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="اكتب تفاصيل استفسارك أو طلبك هنا براحتك..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-[#B37A2B] text-white font-main text-base font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>جاري إرسال الرسالة للديوان...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>إرسال الرسالة لديوان وه</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Track order quick shortcut */}
            <div className="p-5 rounded-2xl bg-[#C99444]/10 border border-[#C99444]/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-main text-sm text-[#3B1E0E] dark:text-[#FFF9EE]">بتدور على شحنتك؟</h4>
                  <p className="text-[11px] text-[#8C6F53] dark:text-[#D6C6B1]">
                    تابع مسار شحنتك خطوة بخطوة من الورشة لحد باب بيتك.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('orders')}
                className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#B37A2B] transition-colors shrink-0 cursor-pointer"
              >
                تتبع طلبيتك
              </button>
            </div>
          </div>

          {/* FAQ Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/10 dark:border-white/10">
              <div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-primary dark:text-primary-hover">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>إجابات سريعة وواضحة</span>
                </div>
                <h2 className="font-main text-2xl sm:text-3xl text-[#3B1E0E] dark:text-[#FFF9EE] mt-0.5">
                  الأسئلة الشائعة من أهل البلد
                </h2>
              </div>

              {/* FAQ Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'shipping', label: 'الشحن والتغليف' },
                  { id: 'quality', label: 'أصل الصنعة' },
                  { id: 'artisans', label: 'للحرفيين' },
                  { id: 'returns', label: 'الإرجاع والضمان' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFaqCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeFaqCategory === tab.id
                        ? 'bg-[#3B1E0E] dark:bg-[#FFF9EE] text-[#FFF9EE] dark:text-[#3B1E0E] shadow-sm'
                        : 'bg-black/[0.04] dark:bg-white/[0.04] text-[#8C6F53] dark:text-[#D6C6B1] hover:bg-black/10 dark:hover:bg-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion list */}
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = expandedFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? 'bg-white dark:bg-[#26160D] border-[#C99444] shadow-md'
                        : 'bg-white/70 dark:bg-white/[0.02] border-black/10 dark:border-white/10 hover:border-[#C99444]/60'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                      className="w-full p-4 sm:p-5 text-right flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary dark:text-primary-hover flex items-center justify-center font-bold text-xs shrink-0">
                          ؟
                        </span>
                        <div className="text-right">
                          <h3 className="font-main text-base sm:text-lg text-[#3B1E0E] dark:text-[#FFF9EE]">
                            {faq.question}
                          </h3>
                          {faq.badge && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-primary dark:text-primary-hover">
                              {faq.badge}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-[#8C6F53] dark:text-[#D6C6B1] transition-transform duration-300 shrink-0 ${
                          isOpen ? 'rotate-180 text-primary' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#8C6F53] dark:text-[#D6C6B1] leading-relaxed border-t border-black/5 dark:border-white/5 mt-1 font-normal">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Quick Policies Navigation */}
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-[#8C6F53] dark:text-[#D6C6B1]">
                حابب تقرأ ميثاق التعامل أو شروط حفظ البيانات بالتفصيل؟
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActivePage('privacy')}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#3B1E0E] border border-black/10 dark:border-white/15 text-primary hover:border-primary font-bold transition-colors cursor-pointer"
                >
                  سياسة الخصوصية
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('terms')}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#3B1E0E] border border-black/10 dark:border-white/15 text-primary hover:border-primary font-bold transition-colors cursor-pointer"
                >
                  الشروط والأحكام
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
