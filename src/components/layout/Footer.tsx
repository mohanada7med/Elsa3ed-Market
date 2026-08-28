import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ShieldCheck, HeartHandshake, Truck, RefreshCcw, MapPin, Phone, Mail, Film, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActivePage, setShowIntroVideo } = useApp();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#231F1C] text-[#E8E1D9] border-t-4 border-[#B45F42] relative overflow-hidden pb-20 md:pb-0">
      {/* Upper Egyptian Heritage Features Banner */}
      <div className="bg-[#2D2824] border-b border-[#3D3732] py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-[#B45F42]/25 border border-[#B45F42]/40 flex items-center justify-center text-amber-300 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">حرف يدوية أصيلة 100%</h4>
              <p className="text-xs text-[#C5B8AC] mt-1 leading-relaxed">
                منتجات معتمدة ومصنوعة بأيدي شيوخ الصنعة في ورش وقرى الصعيد
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-[#B45F42]/25 border border-[#B45F42]/40 flex items-center justify-center text-amber-300 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">تغليف آمن وشحن سريع</h4>
              <p className="text-xs text-[#C5B8AC] mt-1 leading-relaxed">
                تغليف مخصص لحماية الفخار والمشغولات الحساسة لكافة محافظات مصر
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-[#B45F42]/25 border border-[#B45F42]/40 flex items-center justify-center text-amber-300 shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">دعم مباشر للحرفيين</h4>
              <p className="text-xs text-[#C5B8AC] mt-1 leading-relaxed">
                عائد المبيعات يذهب مباشرة لأسر الحرفيين والتعاونيات التراثية
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-[#B45F42]/25 border border-[#B45F42]/40 flex items-center justify-center text-amber-300 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">دفع آمن وضمان استبدال</h4>
              <p className="text-xs text-[#C5B8AC] mt-1 leading-relaxed">
                دعم فودافون كاش، انستاباي، والدفع عند الاستلام مع فحص الشحنة
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Story */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#B45F42] to-[#9E4F36] flex items-center justify-center text-white font-black text-xl font-heritage">
                ص
              </div>
              <span className="text-2xl font-black text-white font-heritage">
                سوق الصعيد (Elsa3ed Market)
              </span>
            </div>
            <p className="text-sm text-[#C5B8AC] leading-relaxed max-w-md">
              المنصة الرقمية الأولى المتخصصة في إبراز وتسويق كنوز صعيد مصر التراثية. نربط أنوال أخميم، وفواخير قنا وأسيوط، ونخيل أسوان، وفنون الأقصر بكل منزل مصري وعربي بروح الأصالة والجودة العالية.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                id="footer-intro-btn"
                onClick={() => setShowIntroVideo(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#2E2824] hover:bg-[#3D3732] text-amber-200 text-xs font-semibold border border-amber-400/25 transition-colors cursor-pointer"
                aria-label="مشاهدة الفيلم التعريفي والوثائقي عن سوق الصعيد"
              >
                <Film className="w-4 h-4" />
                <span>مشاهدة الفيلم التعريفي</span>
              </button>
            </div>
          </div>

          {/* Quick Marketplace Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#3D3732] pb-2">
              تصفح السوق
            </h4>
            <ul className="space-y-2 text-xs text-[#C5B8AC]">
              <li>
                <button
                  type="button"
                  onClick={() => setActivePage('products')}
                  className="hover:text-amber-200 transition-colors text-right cursor-pointer"
                  aria-label="الانتقال إلى صفحة جميع المنتجات اليدوية"
                >
                  جميع المنتجات اليدوية
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePage('categories')}
                  className="hover:text-amber-200 transition-colors text-right cursor-pointer"
                  aria-label="الانتقال إلى صفحة التصنيفات التراثية"
                >
                  التصنيفات التراثية
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePage('crafts')}
                  className="hover:text-amber-200 transition-colors text-right cursor-pointer"
                  aria-label="الانتقال إلى أطلس حرف الصعيد"
                >
                  أطلس حرف الصعيد
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePage('sellers')}
                  className="hover:text-amber-200 transition-colors text-right cursor-pointer"
                  aria-label="الانتقال إلى دليل الورش والحرفيين"
                >
                  دليل الورش والحرفيين
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePage('about')}
                  className="hover:text-amber-200 transition-colors text-right cursor-pointer"
                  aria-label="الانتقال إلى قصة ورسالة المنصة"
                >
                  قصة ورسالة المنصة
                </button>
              </li>
            </ul>
          </div>

          {/* Buyer Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#3D3732] pb-2">
              خدمات المشترين
            </h4>
            <ul className="space-y-2 text-xs text-[#C5B8AC]">
              <li>
                <button
                  type="button"
                  onClick={() => setActivePage('orders')}
                  className="hover:text-amber-200 transition-colors text-right cursor-pointer"
                  aria-label="الانتقال إلى تتبع طلبي وشحنتي"
                >
                  تتبع طلبي وشحنتي
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePage('favorites')}
                  className="hover:text-amber-200 transition-colors text-right cursor-pointer"
                  aria-label="الانتقال إلى قائمة الرغبات والمفضلة"
                >
                  قائمة الرغبات والمفضلة
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePage('cart')}
                  className="hover:text-amber-200 transition-colors text-right cursor-pointer"
                  aria-label="الانتقال إلى سلة المشتريات"
                >
                  سلة المشتريات
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePage('buyer-account')}
                  className="hover:text-amber-200 transition-colors text-right cursor-pointer"
                  aria-label="الانتقال إلى إدارة العناوين والحساب"
                >
                  إدارة العناوين والحساب
                </button>
              </li>
            </ul>
          </div>

          {/* Artisans & Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#3D3732] pb-2">
              انضم كحرفي صعيدي
            </h4>
            <p className="text-xs text-[#C5B8AC] leading-relaxed">
              هل تمتلك ورشة فخار، نول نسيج، أو مزرعة تمور وعسل في الصعيد؟ انضم إلينا وسوق منتجاتك لملايين العملاء.
            </p>
            <div className="space-y-1.5 pt-2 text-xs text-amber-200 font-medium">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>قنا • الأقصر • أسوان • سوهاج • أسيوط</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="tel:+201158969931" aria-label="الاتصال عبر الهاتف: 01158969931" className="hover:underline">
                  <span dir="ltr">01158969931</span>
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:[EMAIL_ADDRESS]" aria-label="مراسلتنا عبر البريد الإلكتروني: ahmdmohanad28@gmail.com" className="hover:underline">
                  <span>ahmdmohanad28@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Governorates Strip */}
        <div className="mt-12 pt-6 border-t border-[#3D3732] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#A89D91] font-bold">محافظات التراث المباشر:</span>
            {['أسوان (التمور والخوص)', 'الأقصر (النحاس والخشب)', 'قنا (الفخار)', 'سوهاج (أخميم)', 'أسيوط (التلي والحرير)', 'المنيا (عسل السدر)', 'الوادي الجديد'].map(
              (gov, idx) => (
                <span
                  key={idx}
                  className="bg-[#2D2824] px-2.5 py-1 rounded-md text-amber-200/90 border border-[#3D3732] text-[11px]"
                >
                  {gov}
                </span>
              )
            )}
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="p-2.5 rounded-xl bg-[#2E2824] hover:bg-[#3D3732] text-white transition-colors flex items-center gap-1.5 text-xs font-semibold min-h-[40px] cursor-pointer"
            aria-label="العودة لأعلى الصفحة"
          >
            <span>للأعلى</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        {/* Payment Methods & Copyright */}
        <div className="mt-8 pt-6 border-t border-[#3D3732] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A89D91]">
          <p className="text-center sm:text-left">
            جميع الحقوق محفوظة © {new Date().getFullYear()} سوق الصعيد (Elsa3ed Market) — صنع بحب وإتقان مصري.
          </p>
        </div>
      </div>
    </footer>
  );
};