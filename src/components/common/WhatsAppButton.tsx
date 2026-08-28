import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles, Building2, PackageCheck, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const WHATSAPP_NUMBER = '01158969931';
export const WHATSAPP_INT_NUMBER = '201158969931';

export function getWhatsAppUrl(customMessage?: string): string {
  const defaultMsg = 'السلام عليكم، أود الاستفسار عن منتجات سوق الصعيد التراثية.';
  const text = encodeURIComponent(customMessage || defaultMsg);
  return `https://wa.me/${WHATSAPP_INT_NUMBER}?text=${text}`;
}

export const WhatsAppButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMsg, setUserMsg] = useState('');

  const handleSendMessage = (textToSend?: string) => {
    const finalMsg = textToSend || userMsg || 'السلام عليكم، أود الاستفسار عن منتجات وخدمات سوق الصعيد.';
    const url = getWhatsAppUrl(finalMsg);
    window.open(url, '_blank', 'noopener,noreferrer');
    setUserMsg('');
    setIsOpen(false);
  };

  const quickQuestions = [
    {
      icon: <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      title: 'طلب عروض أسعار بيع بالجملة والتصدير (B2B)',
      text: 'السلام عليكم، نود الاستفسار عن عروض أسعار البيع بالجملة والتوريدات للفنادق والمؤسسات.'
    },
    {
      icon: <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      title: 'طلب تفصيل أو نقش مخصص على الحرف',
      text: 'السلام عليكم، أريد طلب قطعة يدوية مخصصة ونقش اسم/شعار خاص.'
    },
    {
      icon: <PackageCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      title: 'متابعة شحنة أو استفسار عن التوصيل',
      text: 'السلام عليكم، أود الاستفسار عن موعد وتفاصيل شحن طلبي.'
    },
    {
      icon: <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      title: 'استفسار عام عن منتجات الورش الأصيلة',
      text: 'السلام عليكم، أود المساعدة في اختيار منتجات وهدايا تراثية من سوق الصعيد.'
    }
  ];

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 sm:left-6 z-40" dir="rtl">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mb-3 w-[330px] sm:w-[360px] bg-white dark:bg-[#1B1613] rounded-3xl shadow-2xl border border-[#E8E1D9] dark:border-[#382E27] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#b45f42] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center p-1 border border-white/20">
                    <img
                      src="https://res.cloudinary.com/kuana1nl/image/upload/v1787864171/elsa3ed_market2.png"
                      alt="سوق الصعيد"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-amber-300 border-2 border-[#b45f42] rounded-full" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight text-white">خدمة عملاء سوق الصعيد</h4>
                  <p className="text-[11px] text-amber-100/90 font-mono mt-0.5">01158969931 (واتساب مباشر)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="إغلاق نافذة المحادثة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 bg-[#E5DDD5]/30 dark:bg-[#14100E] space-y-3 max-h-[300px] overflow-y-auto">
              <div className="bg-white dark:bg-[#221C18] p-3 rounded-2xl rounded-tr-none shadow-2xs border border-gray-100 dark:border-[#332A24] text-xs text-gray-800 dark:text-[#DDD2C7] leading-relaxed">
                <p className="font-bold text-[#B45F42] dark:text-[#FF855D] mb-1">مرحباً بك في سوق الصعيد! 🏺✨</p>
                <p>فريقنا في خدمتك لمساعدتك في استفسارات المنتجات التراثية، طلبات الجملة والتصدير، وتفصيل القطع الخاصة.</p>
              </div>

              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 px-1">استفسارات سريعة ومباشرة:</p>
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q.text)}
                    className="w-full text-right p-2.5 bg-white dark:bg-[#221C18] hover:bg-emerald-50 dark:hover:bg-[#2A231E] border border-gray-200 dark:border-[#382E27] rounded-xl text-xs font-medium text-gray-800 dark:text-[#E8DFD8] flex items-center gap-2.5 transition-all group"
                  >
                    <span className="shrink-0 p-1 bg-gray-50 dark:bg-[#191411] rounded-lg group-hover:scale-110 transition-transform">
                      {q.icon}
                    </span>
                    <span className="truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 font-bold">{q.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="p-3 bg-white dark:bg-[#1B1613] border-t border-[#E8E1D9] dark:border-[#382E27] flex items-center gap-2">
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
                placeholder="اكتب استفسارك هنا..."
                className="flex-1 text-xs bg-gray-50 dark:bg-[#251E1A] text-gray-900 dark:text-white px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#3A3028] focus:border-[#b45f42] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                className="p-2.5 bg-[#b45f42] hover:bg-[#9e4f36] text-white rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center shrink-0 cursor-pointer"
                aria-label="التواصل عبر واتساب"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Main Button */}
      <div className="relative group">
        <button
          type="button"
          id="global-floating-whatsapp-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="تواصل معنا عبر واتساب "
          className="w-14 h-14 rounded-full bg-[#b45f42] hover:bg-[#b45f42] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center relative cursor-pointer"
        >
          {/* Animated gentle pulse ring */}
          <span className="absolute inset-0 rounded-full bg-[#b45f42] opacity-30 animate-ping pointer-events-none" />
          
          <MessageCircle className="w-7 h-7 fill-white text-[#e97248]" />

          {/* Online badge */}
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-xs">
            <span className="w-2.5 h-2.5 bg-[#f35d24] rounded-full" />
          </span>
        </button>

        {/* Hover Tooltip (Desktop) */}
        {!isOpen && (
          <div className="hidden sm:block absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            <div className="bg-[#b45f42] text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-lg flex items-center gap-1.5">
              <span>تواصل واتساب </span>
            
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
