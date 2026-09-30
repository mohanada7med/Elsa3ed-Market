'use client';

import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  Award,
  Sparkles,
  FileCheck,
  Truck,
  RotateCcw,
  Store,
  HelpCircle,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TermsAndConditionsPage: React.FC = () => {
  const { setActivePage } = useApp();
  const [activeSection, setActiveSection] = useState<string>('covenant');

  const sections = [
    { id: 'covenant', title: 'عهد الصنعة والمقدمة' },
    { id: 'handicraft-nature', title: 'طبيعة الحرف اليدوية وتفردها' },
    { id: 'orders-pricing', title: 'الطلبات، الأسعار، والدفع' },
    { id: 'shipping-delivery', title: 'الشحن، التغليف، والمعاينة' },
    { id: 'returns-refunds', title: 'سياسة الاستبدال والاسترجاع' },
    { id: 'artisan-rights', title: 'ميثاق حماية الورش والحرفيين' },
    { id: 'intellectual-property', title: 'الملكية الفكرية وأرشيف التراث' },
    { id: 'governing-law', title: 'القانون الحاكم والتحكيم' },
  ];

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9EE] dark:bg-[#1B1009] text-[#3B1E0E] dark:text-[#FFF9EE] pb-24 transition-colors duration-300">
      {/* 1. Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#3B1E0E] via-[#2A150A] to-[#1B1009] text-[#FFF9EE] pt-14 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#C99444]/30">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-screen"
          style={{
            backgroundImage: "url('/pattern/pat2.png')",
            backgroundRepeat: 'repeat',
            backgroundSize: '400px auto',
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C99444]/20 border border-[#C99444]/40 text-[#E0C79B] text-xs font-bold">
            <Scale className="w-3.5 h-3.5 text-[#C99444]" />
            <span>ميثاق التعامل وعهد الصنعة</span>
          </div>

          <h1 className="font-main text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            الشروط والأحكام وعهد الصنعة في <span className="text-[#C99444]">«وَه»</span>
          </h1>

          <p className="text-sm sm:text-base text-[#D6C6B1] max-w-2xl mx-auto leading-relaxed font-normal">
            «كلمة الشرف عهد، وحق الصانع والمشتري مصان» — وثيقة تنظم التعامل بين مقتني الحرف، شيوخ الورش، والمنصة بالإنصاف والأمانة.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-white/60 pt-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#C99444]" />
              تاريخ الاعتماد: سبتمبر 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              ميثاق موثق لحماية التراث الصعيدي الأصيل
            </span>
          </div>
        </div>
      </section>

      {/* 2. Main Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 p-5 rounded-2xl bg-white dark:bg-[#26160D] border border-[#C99444]/30 shadow-sm space-y-2">
              <h3 className="font-main text-sm text-[#3B1E0E] dark:text-[#FFF9EE] pb-2 border-b border-black/10 dark:border-white/10 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary" />
                <span>بنود ميثاق التعامل</span>
              </h3>
              <nav className="space-y-1">
                {sections.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollTo(item.id)}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      activeSection === item.id
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-[#8C6F53] dark:text-[#D6C6B1] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>{item.title}</span>
                    <span className="text-[10px] opacity-70">0{idx + 1}</span>
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setActivePage('help')}
                  className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#B37A2B] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>عندك سؤال؟ كلم شيوخ الدعم</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Legal Articles */}
          <main className="lg:col-span-8 space-y-8 text-xs sm:text-sm leading-relaxed">
            {/* Section 1: Covenant */}
            <article id="covenant" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#26160D] border border-[#C99444]/20 shadow-xs space-y-3 scroll-mt-24">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Scale className="w-5 h-5 text-primary" />
                <h2 className="font-main text-xl sm:text-2xl text-[#3B1E0E] dark:text-[#FFF9EE]">
                  1. عهد الصنعة ومقدمة الميثاق
                </h2>
              </div>
              <p className="text-[#8C6F53] dark:text-[#D6C6B1]">
                أهلاً بك في منصة <strong>«وَه — WAH»</strong>، العالم الرقمي المتكامل لتوثيق وتسوق تراث وحرف صعيد مصر. باستخدامك للمنصة أو إتمام أي عملية شراء أو تسجيلك كصانع أو مشتري، فإنك توافق على هذا الميثاق الذي وُضع لضمان حقوق كل الأطراف بعدالة تامة تحترم أعراف التجارة الصعيدية الرشيدة وأحكام القوانين المصرية المنظمة للتجارة الإلكترونية وحماية المستهلك.
              </p>
            </article>

            {/* Section 2: Handicraft Nature */}
            <article id="handicraft-nature" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#26160D] border border-[#C99444]/20 shadow-xs space-y-3 scroll-mt-24">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="font-main text-xl sm:text-2xl text-[#3B1E0E] dark:text-[#FFF9EE]">
                  2. طبيعة الحرف اليدوية وتفرد القطع
                </h2>
              </div>
              <p className="text-[#8C6F53] dark:text-[#D6C6B1]">
                المنتجات المعروضة في «سوق وه» ليست منتجات بلاستيكية مكررة تصنعها ماكينات صماء، بل هي <strong>شغل إيد 100%</strong> يخرج من أنوال الكليم بقنا وأسيوط، وأفران فخار قنا، ومخارط ألاباستر القرنة بالأقصر، وورش النحاس والخوص الأسواني.
              </p>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>تنبيه تقدير الصنعة:</span>
                </div>
                <p>
                  قد تجد اختلافات طفيفة جداً في درجات ألوان الصوف الطبيعي، أو عروق حجر الألاباستر، أو ملمس طمي النيل؛ هذه الفروقات ليست عيوباً صناعية بل هي شهادة ميلاد تثبت تفرد قطعتك وأنها صُنعت خصيصاً بروح ولمسة الصانع.
                </p>
              </div>
            </article>

            {/* Section 3: Orders and Pricing */}
            <article id="orders-pricing" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#26160D] border border-[#C99444]/20 shadow-xs space-y-3 scroll-mt-24">
              <div className="flex items-center gap-2 text-primary font-bold">
                <FileCheck className="w-5 h-5 text-emerald-500" />
                <h2 className="font-main text-xl sm:text-2xl text-[#3B1E0E] dark:text-[#FFF9EE]">
                  3. الطلبات، الأسعار، وطرق الدفع
                </h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-[#8C6F53] dark:text-[#D6C6B1] pr-2">
                <li><strong>شفافية الأسعار:</strong> الأسعار المعروضة على المنصة هي أسعار عادلة تصدر بالتنسيق المباشر مع أصحاب الورش لضمان حصول الصانع على حقه الكريم كاملاً.</li>
                <li><strong>لا توجد رسوم خفية:</strong> قيمة المنتج وتكلفة الشحن تظهر بوضوح تام في شاشة السلة والدفع قبل تأكيد الطلب.</li>
                <li><strong>طرق الدفع المعتمدة:</strong> الدفع عند الاستلام كاش بعد المعاينة، الدفع الإلكتروني بالبطاقات، المحافظ الإلكترونية (فودافون كاش وغيرها)، وتطبيق InstaPay.</li>
                <li><strong>طلبات الجملة والمقاسات الخاصة:</strong> في طلبيات التوريد أو التصنيع بالطلب، يتم الاتفاق على دفعة مقدمة لتوفير المواد الخام للورشة.</li>
              </ul>
            </article>

            {/* Section 4: Shipping and Delivery */}
            <article id="shipping-delivery" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#26160D] border border-[#C99444]/20 shadow-xs space-y-3 scroll-mt-24">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Truck className="w-5 h-5 text-blue-500" />
                <h2 className="font-main text-xl sm:text-2xl text-[#3B1E0E] dark:text-[#FFF9EE]">
                  4. الشحن، التغليف، وحق المعاينة
                </h2>
              </div>
              <p className="text-[#8C6F53] dark:text-[#D6C6B1]">
                نحرص على أن تصلك تحفك وقطعك التراثية في أبهى صورة:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1">
                  <h4 className="font-bold text-xs text-[#3B1E0E] dark:text-[#FFF9EE]">تغليف مصفح للكسر</h4>
                  <p className="text-[11px] text-[#8C6F53] dark:text-[#D6C6B1]">تغليف فقاعي وصناديق مدعمة خاصة بالفخار والألاباستر والزجاج المعشق.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1">
                  <h4 className="font-bold text-xs text-[#3B1E0E] dark:text-[#FFF9EE]">حق المعاينة قبل الاستلام</h4>
                  <p className="text-[11px] text-[#8C6F53] dark:text-[#D6C6B1]">يحق للمشتري فحص الطرد خارجياً وداخلياً بحضور مندوب التوصيل للتأكد من سلامته.</p>
                </div>
              </div>
            </article>

            {/* Section 5: Returns and Refunds */}
            <article id="returns-refunds" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#26160D] border border-[#C99444]/20 shadow-xs space-y-3 scroll-mt-24">
              <div className="flex items-center gap-2 text-primary font-bold">
                <RotateCcw className="w-5 h-5 text-rose-500" />
                <h2 className="font-main text-xl sm:text-2xl text-[#3B1E0E] dark:text-[#FFF9EE]">
                  5. سياسة الاستبدال، الاسترجاع، والتعويض
                </h2>
              </div>
              <p className="text-[#8C6F53] dark:text-[#D6C6B1]">
                حقك مكفول بالكامل طبقاً لقانون حماية المستهلك المصري (رقم 181 لسنة 2018):
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#8C6F53] dark:text-[#D6C6B1] pr-2">
                <li><strong>فترة الـ 14 يوماً:</strong> يمكنك طلب استرجاع أو استبدال أي منتج خلال 14 يوماً من تاريخ الاستلام بشرط بقاء المنتج بحالته الأصلية وتغليفه الأصلي.</li>
                <li><strong>حالات الكسر أو التلف أثناء الشحن:</strong> نتحمل كامل التعويض فوراً؛ نقوم إما بإرسال قطعة جديدة بديلة أو استرداد كامل المبلغ المدفوع دون أي مصاريف إضافية على العميل.</li>
                <li><strong>الطلبيات المخصصة بالاسم أو المقاس الخاص:</strong> المنتجات التي تم تفصيلها أو نقش اسم المشتري عليها خصيصاً لا تخضع للاسترجاع إلا في حال وجود عيب مصنعي صريح.</li>
              </ul>
            </article>

            {/* Section 6: Artisan Rights */}
            <article id="artisan-rights" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#26160D] border border-[#C99444]/20 shadow-xs space-y-3 scroll-mt-24">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Store className="w-5 h-5 text-amber-500" />
                <h2 className="font-main text-xl sm:text-2xl text-[#3B1E0E] dark:text-[#FFF9EE]">
                  6. ميثاق حماية الورش والحرفيين
                </h2>
              </div>
              <p className="text-[#8C6F53] dark:text-[#D6C6B1]">
                منصة «وَه» وُجدت لتكون ظهيراً وسنداً لشيوخ الصنعة في الجنوب:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[#8C6F53] dark:text-[#D6C6B1] pr-2">
                <li>نلتزم بتحويل مستحقات الورش في المواعيد المحددة دون تأخير.</li>
                <li>يُحظر على أي مستخدم استغلال المنصة في طلبات وهمية أو إيذاء الحرفيين.</li>
                <li>يتم توثيق كل ورشة وعرض قصة صاحبها بفخر دون طمس هويته أو نسبها لوسطاء تجاريين.</li>
              </ul>
            </article>

            {/* Section 7: Intellectual Property */}
            <article id="intellectual-property" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#26160D] border border-[#C99444]/20 shadow-xs space-y-3 scroll-mt-24">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Award className="w-5 h-5 text-purple-500" />
                <h2 className="font-main text-xl sm:text-2xl text-[#3B1E0E] dark:text-[#FFF9EE]">
                  7. الملكية الفكرية وتوثيق تراث الصعيد
                </h2>
              </div>
              <p className="text-[#8C6F53] dark:text-[#D6C6B1]">
                كافة المواد التوثيقية، الفيديوهات المصورة داخل الورش، حكايات المعالم الجغرافية، نقوش العلامة التجارية «وَه»، والتصميم البرمجي هي حقوق ملكية فكرية محفوظة لمنصة «وَه» وصناع التراث الموثقين.
              </p>
              <p className="text-xs text-[#8C6F53] dark:text-[#D6C6B1]">
                يُمنع منعاً باتاً استنساخ المحتوى أو استخدامه لأغراض تجارية مضللة دون الحصول على إذن كتابي رسمي وموثق من إدارة المنصة.
              </p>
            </article>

            {/* Section 8: Governing Law */}
            <article id="governing-law" className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#C99444]/15 via-white dark:via-[#26160D] to-[#3B1E0E]/10 border border-[#C99444]/40 shadow-md space-y-4 scroll-mt-24">
              <div className="flex items-center gap-2 text-primary font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h2 className="font-main text-xl sm:text-2xl text-[#3B1E0E] dark:text-[#FFF9EE]">
                  8. القانون الحاكم والتحكيم العادل
                </h2>
              </div>
              <p className="text-[#8C6F53] dark:text-[#D6C6B1]">
                تخضع هذه الشروط والأحكام وتُفسر وفقاً للقوانين السارية في جمهورية مصر العربية. في حال نشوء أي خلاف، نسعى أولاً لحله بروح التراضي وأعراف الإنصاف وأمانة الصعيد، وفي حال تعذر ذلك، تختص المحاكم المصرية المختصة بالفصل فيه.
              </p>
              <div className="flex flex-wrap gap-3 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActivePage('help')}
                  className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-[#B37A2B] transition-colors cursor-pointer"
                >
                  تواصل مع ديوان المساعدة
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('privacy')}
                  className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 font-bold transition-colors cursor-pointer"
                >
                  الاطلاع على سياسة الخصوصية
                </button>
              </div>
            </article>
          </main>
        </div>
      </div>
    </div>
  );
};
