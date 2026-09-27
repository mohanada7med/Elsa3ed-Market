import React, { useState } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Building2,
  PackageCheck,
  HelpCircle,
  Clock,
  Phone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const WHATSAPP_NUMBER = '01158969931';
export const WHATSAPP_INT_NUMBER = '201158969931';

export function getWhatsAppUrl(customMessage?: string): string {
  const defaultMsg =
    'السلام عليكم يا عم وه، أود الاستفسار عن منصة وه ومنتجات سوق وه التراثية.';

  const text = encodeURIComponent(customMessage || defaultMsg);

  return `https://wa.me/${WHATSAPP_INT_NUMBER}?text=${text}`;
}

export const WhatsAppButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMsg, setUserMsg] = useState('');

  const handleSendMessage = (textToSend?: string) => {
    const finalMsg =
      textToSend ||
      userMsg ||
      'السلام عليكم يا عم وه، أود الاستفسار عن منصة وه وسوق وه.';

    const url = getWhatsAppUrl(finalMsg);

    window.open(url, '_blank', 'noopener,noreferrer');

    setUserMsg('');
    setIsOpen(false);
  };

  const quickQuestions = [
    {
      icon: (
        <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      ),
      title: 'يا عم وه: طلب عروض أسعار بيع بالجملة والتصدير (B2B)',
      text: 'السلام عليكم يا عم وه، نود الاستفسار عن عروض أسعار البيع بالجملة والتوريدات للفنادق والمؤسسات.',
    },
    {
      icon: (
        <Sparkles className="w-4 h-4 text-amber-600 dark:text-primary-hover shrink-0" />
      ),
      title: 'يا عم وه: طلب تفصيل أو نقش مخصص على الحرف',
      text: 'السلام عليكم يا عم وه، أريد طلب قطعة يدوية مخصصة ونقش اسم/شعار خاص.',
    },
    {
      icon: (
        <PackageCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
      ),
      title: 'يا عم وه: متابعة شحنة أو استفسار عن التوصيل',
      text: 'السلام عليكم يا عم وه، أود الاستفسار عن موعد وتفاصيل شحن طلبي.',
    },
    {
      icon: (
        <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
      ),
      title: 'يا عم وه: محتاج نصيحة لاختيار منتجات أصيلة من السوق',
      text: 'السلام عليكم يا عم وه، أود مساعدتك وخبرتك في اختيار منتجات وهدايا تراثية أصيلة من سوق وه.',
    },
  ];

  return (
    <div
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] md:bottom-8 left-3 sm:left-6 z-50 select-none font-sans"
      dir="rtl"
    >
      {/* Chat Window with Uncle Wah */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full left-0 mb-3 w-[calc(100vw-2rem)] max-w-[360px] overflow-hidden rounded-3xl border border-emerald-500/30 bg-surface/95 shadow-2xl backdrop-blur-2xl text-foreground origin-bottom-left"
            style={{
              boxShadow: '0 20px 45px -8px rgba(0, 0, 0, 0.45)',
            }}
          >
            {/* Header: Uncle Wah's Presence */}
            <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="h-12 w-12 rounded-full bg-white/15 p-0.5 border-2 border-white/30 backdrop-blur-xs overflow-hidden flex items-end justify-center">
                    <img
                      src="/mascot/welcoming.png"
                      alt="عم وه"
                      style={{
                        imageRendering: 'crisp-edges',
                        WebkitFontSmoothing: 'antialiased',
                      }}
                      className="h-12 w-auto object-contain select-none -scale-x-100"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white shadow-xs" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-sm text-white leading-tight">
                      «عم وه» صاحب المنصة
                    </h4>
                    <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px] font-bold">
                      أونلاين
                    </span>
                  </div>

                  <p className="text-[11px] text-emerald-100/90 font-mono mt-0.5 flex items-center gap-1">
                    <Phone size={10} />
                    <span>01158969931 (واتساب مباشر)</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="إغلاق نافذة المحادثة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 bg-black/[0.02] dark:bg-black/20 space-y-3 max-h-[300px] overflow-y-auto">
              {/* Uncle Wah's Welcome Balloon */}
              <div className="flex items-start gap-2.5">
                <img
                  src="/mascot/char.png"
                  alt="عم وه"
                  style={{ imageRendering: 'crisp-edges' }}
                  className="h-10 w-auto object-contain shrink-0 select-none"
                />
                <div className="bg-surface p-3 rounded-2xl rounded-tr-none shadow-xs border border-border-subtle text-xs text-foreground leading-relaxed">
                  <p className="font-black text-emerald-600 dark:text-emerald-400 mb-1">
                    يا مرحب بيك في ديار وه! 🏺✨
                  </p>
                  <p>
                    أنا «عم وه» في خدمتك.. محتاج تستفسر عن منتج، تطلب تفصيل حتة خاصة، أو تسأل عن شحن لدارك؟ ابعتلي على طول وهرد عليك!
                  </p>
                </div>
              </div>

              {/* Quick Questions */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-bold text-foreground-disabled px-1">
                  استفسارات سريعة لعم وه:
                </p>

                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q.text)}
                    className="w-full text-right p-2.5 bg-surface hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20 border border-border-subtle hover:border-emerald-500/40 rounded-xl text-xs font-medium text-foreground flex items-center gap-2.5 transition-all group cursor-pointer"
                  >
                    <span className="shrink-0 p-1 bg-surface-subtle rounded-lg group-hover:scale-110 transition-transform">
                      {q.icon}
                    </span>
                    <span className="truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 font-bold">
                      {q.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="p-3 bg-surface border-t border-border-subtle flex items-center gap-2">
              <input
                type="text"
                value={userMsg}
                onChange={(e) => setUserMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="اكتب رسالتك لعم وه..."
                className="flex-1 text-xs bg-surface-subtle text-foreground px-3 py-2.5 rounded-xl border border-border-subtle focus:border-emerald-500 focus:outline-hidden"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center shrink-0 cursor-pointer"
                aria-label="التواصل مع عم وه عبر واتساب"
                title="إرسال لعم وه على الواتساب"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Main Button - Uncle Wah WhatsApp Button */}
      <div className="relative group">
        <motion.button
          type="button"
          id="global-floating-whatsapp-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="تواصل مع عم وه عبر واتساب"
          className="relative flex items-center gap-2.5 rounded-full border-2 border-emerald-500 bg-surface/95 px-2.5 py-1.5 shadow-2xl backdrop-blur-xl hover:border-emerald-400 cursor-pointer transition-all"
          style={{
            boxShadow: '0 12px 30px -4px rgba(16, 185, 129, 0.38)',
          }}
        >
          {/* Animated Green Pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-emerald-500/25 blur-sm animate-pulse pointer-events-none" />

          {/* Uncle Wah Mascot cutout with Crisp Edges */}
          <div className="relative z-10 -my-2.5 shrink-0">
            <img
              src="/mascot/welcoming.png"
              alt="عم وه"
              style={{
                imageRendering: 'crisp-edges',
                WebkitFontSmoothing: 'antialiased',
              }}
              className="h-13 sm:h-14 w-auto object-contain drop-shadow-md select-none -scale-x-100 group-hover:scale-110 transition-transform duration-300"
            />

            {/* WhatsApp Mini Badge on shoulder */}
            <span className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md border-2 border-surface">
              <MessageCircle size={10} className="fill-white" />
            </span>
          </div>

          {/* Text Labels */}
          <div className="relative z-10 text-right pr-0.5">
            <span className="flex items-center gap-1.5 text-[11px] font-black text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
              <span>دردش مع عم وه</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            </span>
            <span className="block text-[9px] font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
              {isOpen ? 'انقر للإغلاق' : 'واتساب مباشر 💬'}
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default WhatsAppButton;