import React, { useState, useEffect } from 'react';
import { ShoppingBag, Film, Landmark, Sparkles } from 'lucide-react';

interface WahLoadingScreenProps {
  onComplete?: () => void;
}

export const WahLoadingScreen: React.FC<WahLoadingScreenProps> = ({
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);


  const pillars = [
    {
      title: 'سوق وه.. من إيد الصانع لحد بيتك',
      subtitle: 'اتسوق أحلى شغل من الصعيد، وخلّي طلبك يوصلك لحد باب بيتك',
      icon: ShoppingBag,
    },
    {
      title: 'ريلز وحكاوي من قلب الصعيد',
      subtitle: 'شوف الصعيد على حقيقته.. ورش وأماكن أول مرة تشوفها',
      icon: Film,
    },
    {
      title: 'آثار ومعالم وحكاوي بلدنا',
      subtitle: 'لفّ في بلادنا واعرف حكاية كل مكان من قلب الصعيد',
      icon: Landmark,
    },
  ];



  useEffect(() => {
    if (currentIndex >= pillars.length - 1) {
      // الرسالة الثالثة ظهرت
      const finishTimer = setTimeout(() => {
        onComplete?.();
      }, 1500);

      return () => clearTimeout(finishTimer);
    }

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentIndex, onComplete]);
  const CurrentIcon = pillars[currentIndex].icon;

  return (
    <div
      id="wah-auth-loading-screen"
      dir="rtl"
      className="fixed inset-0 z-[9999] flex min-h-screen flex-col items-center justify-center bg-[#eee8dc] dark:bg-[#0b0b0a] text-[#211d18] dark:text-[#f5f0e7] transition-colors px-6 select-none"
      role="status"
      aria-label="جاري تجهيز منصة وه"
    >
      {/* توهج محيطي خافت جداً */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#9a6a35]/12 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
        {/* اللوجو في المركز مع حلقة وميض ناعمة */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute w-32 h-32 rounded-full border border-[#9a6a35]/20 animate-ping opacity-25" />
          <div className="w-28 h-28 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center backdrop-blur-md p-4 shadow-sm">
            <img
              src="https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png"
              alt="شعار وه"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
        </div>

        {/* كبسولة الأيقونة المتغيرة */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#9a6a35]/10 text-[#9a6a35] dark:text-[#d5a56d] border border-[#9a6a35]/20 text-xs font-bold mb-3 transition-all duration-300">
          <CurrentIcon className="w-4 h-4" />
          <span>{pillars[currentIndex].title}</span>
        </div>

        {/* السطر التوضيحي السلس */}
        <div className="h-10 flex items-center justify-center">
          <p className="text-xs sm:text-sm font-medium text-black/70 dark:text-white/70 transition-opacity duration-300">
            {pillars[currentIndex].subtitle}
          </p>
        </div>

        {/* مؤشر النقاط الصغير مع خط تحميل خفيف */}
        <div className="mt-8 flex flex-col items-center gap-3 w-44">
          <div className="flex items-center gap-2">
            {pillars.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === idx
                  ? 'w-6 bg-[#9a6a35]'
                  : 'w-1.5 bg-black/20 dark:bg-white/20'
                  }`}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default WahLoadingScreen;