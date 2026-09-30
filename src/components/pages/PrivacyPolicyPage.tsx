'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Database,
  CreditCard,
  UserCheck,
  FileText,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Phone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { setActivePage } = useApp();
  const [activeSection, setActiveSection] = useState<string>('intro');

  const sections = [
    { id: 'intro', title: 'ميثاق الأمانة والخصوصية' },
    { id: 'data-collected', title: 'البيانات التي نجمعها' },
    { id: 'how-we-use', title: 'كيف نوظف بياناتك؟' },
    { id: 'payments', title: 'أمان وسرية المدفوعات' },
    { id: 'cookies', title: 'ملفات الكوكيز وتجربة التصفح' },
    { id: 'third-parties', title: 'عدم مشاركة البيانات' },
    { id: 'your-rights', title: 'حقوقك والتحكم في حسابك' },
    { id: 'contact-dpo', title: 'مسؤول الخصوصية والتواصل' },
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
            <Lock className="w-3.5 h-3.5 text-[#C99444]" />
            <span>وثيقة أمان وسرية أهل الدار</span>
          </div>

          <h1 className="font-main text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            سياسة الخصوصية وحماية بياناتك في <span className="text-[#C99444]">«وَه»</span>
          </h1>

          <p className="text-sm sm:text-base text-[#D6C6B1] max-w-2xl mx-auto leading-relaxed">
            «سرّك في بير، وبيوت الصعيد ما بتطلعش أسرارها» — نلتزم بحماية كل معلومة تشاركها معنا بأعلى معايير الأمان الرقمي وعهد الأمانة الصعيدي.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-white/60 pt-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#C99444]" />
              آخر تحديث: سبتمبر 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              متوافق مع قانون حماية البيانات الشخصية المصري
            </span>
          </div>
        </div>
      </section>

      {/* 2. Main Content Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 p-5 rounded-2xl bg-white dark:bg-[#26160D] border border-[#C99444]/30 shadow-sm space-y-2">
              <h3 className="font-cairo font-bold text-sm text-[#3B1E0E] dark:text-[#FFF9EE] pb-2 border-b border-black/10 dark:border-white/10 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>فهرس بنود الخصوصية</span>
              </h3>
              <nav className="space-y-1">
                {sections.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollTo(item.id)}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${activeSection === item.id
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
                  className="w-full py-2.5 rounded-xl bg-[#C99444]/15 hover:bg-[#C99444]/25 text-primary dark:text-[#E0C79B] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>تواصل مع ديوان الدعم</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Legal Articles */}
          <main className="lg:col-span-8 space-y-8 text-xs sm:text-sm leading-relaxed">
            {/* Section 1: Intro */}
            <article id="intro" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#26160D] border border-[#C99444]/20 shadow-xs space-y-3 scroll-mt-24">
              <div className="flex items-center gap-2 text-primary font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h2 className="font-cairo font-black text-xl sm:text-2xl text-[#3B1E0E] dark:text-[#FFF9EE]">
                  1. ميثاق الأمانة والخصوصية
                </h2>
              </div>
              <p className="text-[#8C6F53] dark:text-[#D6C6B1]">
                نحن في منصة <strong>«وَه — WAH»</strong> نقدر ثقتك الغالية باختيارك لتسوق وتوثيق تراث صعيد مصر. نعتبر خصوصية بياناتك الشخصية أمانة شرعية ومسؤولية قانونية، ونلتزم بألا تُستخدم أي معلومة تقدمها لنا إلا في الغرض المحدد لها وبأعلى مستويات التشفير والأمان.
              </p>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
                💡 <strong>قاعدتنا الذهبية:</strong> نحن لا نبيع، ولا نؤجر، ولا نتاجر ببياناتك مع أي شركة إعلانية أو جهة تجارية خارجية إطلاقاً.
              </div>
            </article>

            {/* Section 2: Data Collected */}
            <article id="data-collected" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#26160D] border border-[#C99444]/20 shadow-xs space-y-3 scroll-mt-24">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Database className="w-5 h-5 text-blue-500" />
                <h2 className="font-cairo font-black text-xl sm:text-2xl text-[#3B1E0E] dark:text-[#FFF9EE]">
                  2. البيانات التي نجمعها عنك
                </h2>
              </div>
              <p className="text-[#8C6F53] dark:text-[#D6C6B1]">
                نجمع فقط البيانات الضرورية لتنفيذ وتوصيل طلبياتك وتقديم تجربة استخدام ممتازة:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[#8C6F53] dark:text-[#D6C6B1] pr-2">
                <li><strong>بيانات الحساب:</strong> الاسم، البريد الإلكتروني، ورقم الهاتف عند التسجيل.</li>
                <li><strong>بيانات التوصيل والشحن:</strong> المحافظة، المدينة، العنوان التفصيلي، والملاحظات الخاصة بوصول مندوب الشحن لدارك.</li>
                <li><strong>بيانات الحرفيين والورش:</strong> اسم الورشة، المحافظة، القرية، تخصص الصنعة (لتوثيق أصل القطعة وإظهارها في ملف الصانع).</li>
                <li><strong>البيانات التقنية غير المعرفة:</strong> نوع المتصفح، نظام التشغيل، والصفحات المفضلة لتحسين سرعة وأداء المنصة.</li>
              </ul>
            </article>

            {/* Section 3: How We Use Data */}
            <article id="how-we-use" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#26160D] border border-[#C99444]/20 shadow-xs space-y-3 scroll-mt-24">
              <div className="flex items-center gap-2 text-primary font-bold">
                <UserCheck className="w-5 h-5 text-purple-500" />
                <h2 className="font-cairo font-black text-xl sm:text-2xl text-[#3B1E0E] dark:text-[#FFF9EE]">
                  3. كيف نوظف هذه البيانات؟
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1">
                  <h4 className="font-cairo font-bold text-xs text-[#3B1E0E] dark:text-[#FFF9EE]">شحن وتوصيل الطرود</h4>
                  <p className="text-[11px] text-[#8C6F53] dark:text-[#D6C6B1]">توجيه مندوب الشحن مباشرة لعنوانك وتحديثك برقم التتبع.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1">
                  <h4 className="font-cairo font-bold text-xs text-[#3B1E0E] dark:text-[#FFF9EE]">خدمة ودعم العملاء</h4>
                  <p className="text-[11px] text-[#8C6F53] dark:text-[#D6C6B1]">مساعدتك السريعة عند التواصل بخصوص أي تعديل أو استفسار.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1">
                  <h4 className="font-cairo font-bold text-xs text-[#3B1E0E] dark:text-[#FFF9EE]">توثيق أصالة الصنعة</h4>
                  <p className="text-[11px] text-[#8C6F53] dark:text-[#D6C6B1]">ربط مشترياتك بورشة الصانع الحقيقي وحفظ تاريخ القطعة التراثية.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1">
                  <h4 className="font-cairo font-bold text-xs text-[#3B1E0E] dark:text-[#FFF9EE]">أمان وحماية الحساب</h4>
                  <p className="text-[11px] text-[#8C6F53] dark:text-[#D6C6B1]">منع أي محاولات احتيال أو طلبات وهمية لحماية حقوق الورش والزبائن.</p>
                </div>
              </div>
            </article>

            {/* Section 4: Payments */}
            <article id="payments" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#26160D] border border-[#C99444]/20 shadow-xs space-y-3 scroll-mt-24">
              <div className="flex items-center gap-2 text-primary font-bold">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                <h2 className="font-cairo font-black text-xl sm:text-2xl text-[#3B1E0E] dark:text-[#FFF9EE]">
                  4. أمان وسرية المدفوعات والبطاقات
                </h2>
              </div>
              <p className="text-[#8C6F53] dark:text-[#D6C6B1]">
                نحن <strong>لا نطلع ولا نخزن</strong> أي أرقام بطاقات ائتمانية، رموز أمان (CVV)، أو كلمات سر بنكية على سيرفراتنا نهائياً.
              </p>
              <p className="text-[#8C6F53] dark:text-[#D6C6B1]">
                جميع المعاملات المالية الإلكترونية تتم عبر بوابات دفع بنكية معتمدة من البنك المركزي المصري ومحمية ببروتوكولات التشفير العالمية SSL/TLS المتطابقة مع معايير PCI-DSS لضمان أعلى درجات الأمان المصرفي.
              </p>
            </article>

            {/* Section 5: Cookies */}
            <article id="cookies" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#26160D] border border-[#C99444]/20 shadow-xs space-y-3 scroll-mt-24">
              <div className="flex items-center gap-2 text-primary font-bold">
                <EyeOff className="w-5 h-5 text-amber-500" />
                <h2 className="font-cairo font-black text-xl sm:text-2xl text-[#3B1E0E] dark:text-[#FFF9EE]">
                  5. ملفات تعريف الارتباط (Cookies)
                </h2>
              </div>
              <p className="text-[#8C6F53] dark:text-[#D6C6B1]">
                نستخدم ملفات كوكيز محدودة لأغراض وظيفية بحتة، مثل:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#8C6F53] dark:text-[#D6C6B1] pr-2">
                <li>حفظ المنتجات داخل سلة المشتريات حتى لا تضيع عند إغلاق المتصفح.</li>
                <li>تذكر وضع العرض المفضل لديك (الوضع الداكن / وضع النهار).</li>
                <li>الحفاظ على جلسة تسجيل دخولك بأمان.</li>
              </ul>
              <p className="text-xs text-[#8C6F53] dark:text-[#D6C6B1]">
                يمكنك في أي وقت تعطيل ملفات الكوكيز من إعدادات متصفحك دون أن يتأثر تصفحك للمقالات والمعالم التراثية.
              </p>
            </article>

            {/* Section 6: Third Parties */}
            <article id="third-parties" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#26160D] border border-[#C99444]/20 shadow-xs space-y-3 scroll-mt-24">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Lock className="w-5 h-5 text-rose-500" />
                <h2 className="font-cairo font-black text-xl sm:text-2xl text-[#3B1E0E] dark:text-[#FFF9EE]">
                  6. مشاركة البيانات مع جهات التنفيذ فقط
                </h2>
              </div>
              <p className="text-[#8C6F53] dark:text-[#D6C6B1]">
                لا تتم مشاركة بياناتك إلا مع الأطراف المعنية مباشرة بإتمام طلبك:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#8C6F53] dark:text-[#D6C6B1] pr-2">
                <li><strong>شركة الشحن والتوصيل:</strong> الاسم والعنوان ورقم الهاتف فقط حتى يستطيع المندوب تسليمك الطرد.</li>
                <li><strong>الورشة الصانعة:</strong> بيانات القطعة والمقاسات المطلوبة دون مشاركة بياناتك الحساسة.</li>
                <li><strong>الجهات القضائية أو القانونية:</strong> فقط في حال وجود إلزام قانوني نافذ وصريح طبقاً للقوانين المصرية.</li>
              </ul>
            </article>

            {/* Section 7: Your Rights */}
            <article id="your-rights" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#26160D] border border-[#C99444]/20 shadow-xs space-y-3 scroll-mt-24">
              <div className="flex items-center gap-2 text-primary font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h2 className="font-cairo font-black text-xl sm:text-2xl text-[#3B1E0E] dark:text-[#FFF9EE]">
                  7. حقوقك والتحكم الكامل في حسابك
                </h2>
              </div>
              <p className="text-[#8C6F53] dark:text-[#D6C6B1]">
                طبقاً للميثاق والقانون، لك كامل الحقوق التالية في أي وقت:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 text-center">
                  <div className="font-bold text-xs">حق الاطلاع والتعديل</div>
                  <div className="text-[10px] text-[#8C6F53] dark:text-[#D6C6B1] mt-0.5">تحديث بياناتك وعناوينك من صفحة حسابك.</div>
                </div>
                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 text-center">
                  <div className="font-bold text-xs">حق إلغاء الاشتراك</div>
                  <div className="text-[10px] text-[#8C6F53] dark:text-[#D6C6B1] mt-0.5">إلغاء رسائل النشرة البريدية بضغطة زر واحدة.</div>
                </div>
                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 text-center">
                  <div className="font-bold text-xs text-rose-500">حق حذف الحساب والبيانات</div>
                  <div className="text-[10px] text-[#8C6F53] dark:text-[#D6C6B1] mt-0.5">طلب حذف حسابك وسجل بياناتك نهائياً.</div>
                </div>
              </div>
            </article>

            {/* Section 8: DPO Contact */}
            <article id="contact-dpo" className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#C99444]/15 via-white dark:via-[#26160D] to-[#3B1E0E]/10 border border-[#C99444]/40 shadow-md space-y-4 scroll-mt-24">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Sparkles className="w-5 h-5 text-[#C99444]" />
                <h2 className="font-cairo font-black text-xl sm:text-2xl text-[#3B1E0E] dark:text-[#FFF9EE]">
                  8. مسؤول حماية البيانات والتواصل
                </h2>
              </div>
              <p className="text-[#8C6F53] dark:text-[#D6C6B1]">
                إذا كان لديك أي سؤال، استفسار، أو رغبة في ممارسة أي من حقوقك المتعلقة بخصوصيتك، يمكنك مراسلة مسؤول حماية الخصوصية لدينا مباشرة:
              </p>
              <div className="flex flex-wrap gap-4 pt-1 text-xs">
                <a
                  href="mailto:privacy@wah-saeed.com"
                  className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-[#B37A2B] transition-colors flex items-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>privacy@wah-saeed.com</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActivePage('help')}
                  className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 font-bold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>الذهاب لصفحة المساعدة والتواصل</span>
                </button>
              </div>
            </article>
          </main>
        </div>
      </div>
    </div>
  );
};
