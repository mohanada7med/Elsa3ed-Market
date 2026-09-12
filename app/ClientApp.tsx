'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import WahIntro from '../src/components/WahIntro';

const App = dynamic(() => import('../src/App'), {
  ssr: false,
});

export default function ClientApp() {
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isIntroFinishing, setIsIntroFinishing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-[#fcfbf9] dark:bg-[#0b0b0a] overflow-x-hidden">
      {/* حاوية الـ App: تبدأ بالدخول التدريجي أثناء خروج الـ Intro */}
      <div
        className={`w-full min-h-screen transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isIntroFinishing || !showIntro
          ? 'scale-100 opacity-100 blur-0 translate-y-0'
          : 'scale-[0.96] opacity-0 blur-[6px] translate-y-4 pointer-events-none'
          }`}
      >
        <App />
      </div>

      {/* شاشة الـ Intro */}
      {showIntro && (
        <WahIntro
          onBeforeFinish={() => {
            // يبدأ تحريك الـ App في الخلفية فوراً
            setIsIntroFinishing(true);
          }}
          onFinish={() => {
            // إزالة الـ Intro تماماً من الـ DOM بعد انتهاء الحركة
            setShowIntro(false);
          }}
        />
      )}
    </div>
  );
}