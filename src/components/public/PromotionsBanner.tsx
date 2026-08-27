import React from 'react';
import { useApp } from '../../context/AppContext';
import { Tag, Sparkles, ArrowLeft, Copy, Check } from 'lucide-react';

export const PromotionsBanner: React.FC = () => {
  const { applyDiscountCode, setActivePage, addToast } = useApp();
  const [copied, setCopied] = React.useState(false);

  const couponCode = 'SAEED100';

  const handleCopyCoupon = () => {
    navigator.clipboard?.writeText(couponCode);
    setCopied(true);
    applyDiscountCode(couponCode);
    addToast('تم نسخ وتفعيل الكوبون', `كوبون ${couponCode} يمنحك خصماً فورياً على مشترياتك!`, 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="relative rounded-3xl bg-gradient-to-r from-[#943310] via-[#a33b13] to-[#78280a] text-white p-6 sm:p-10 shadow-xl overflow-hidden">
        {/* Background decorative patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 border border-white/20 text-amber-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مبادرة إحياء كنوز الجنوب</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-black font-heritage leading-tight">
              خصم خاص 15% على أول طلب للحرف اليدوية والفخار
            </h3>

            <p className="text-xs sm:text-sm text-amber-100/90 max-w-xl leading-relaxed">
              استخدم كود الخصم الترحيبي عند إتمام الدفع، واستمتع بشحن آمن وتغليف تراثي مخصص يحمي قطعك الفريدة حتى عتبة بابك.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center lg:items-end justify-center gap-3">
            {/* Coupon Box */}
            <div className="bg-black/30 border border-amber-300/30 p-2.5 rounded-2xl flex items-center justify-between gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 pr-2">
                <Tag className="w-4 h-4 text-amber-300" />
                <span className="font-mono font-black text-base text-amber-200 tracking-wider">
                  {couponCode}
                </span>
              </div>

              <button
                type="button"
                id="copy-coupon-btn"
                onClick={handleCopyCoupon}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold transition-colors flex items-center gap-1 shrink-0 min-h-[38px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-900" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم التفعيل!' : 'نسخ وتفعيل'}</span>
              </button>
            </div>

            <button
              type="button"
              id="promo-shop-now-btn"
              onClick={() => setActivePage('products')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-amber-100 text-[#943310] text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>تسوق العروض المميزة</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
