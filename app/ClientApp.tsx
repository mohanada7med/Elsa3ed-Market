'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import WahIntro from '../src/components/WahIntro';

const App = dynamic(() => import('../src/App'), {
  ssr: false,
});

const SESSION_KEY = 'elsa3ed_wah_session_visited';

export default function ClientApp() {
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introPhase, setIntroPhase] = useState<'idle' | 'loading_pillars'>('idle');
  const [isIntroFinishing, setIsIntroFinishing] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const hasVisited = sessionStorage.getItem(SESSION_KEY);
      if (hasVisited === 'true') {
        // لو عمل Refresh: يدخل على التحميل السريع مباشرة بدون زرار
        setIntroPhase('loading_pillars');
      } else {
        // أول فتح للموقع في التبويب: التجربة كاملة بالزرار والصوت
        setIntroPhase('idle');
      }
    } catch {
      setIntroPhase('idle');
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-[#fcfbf9] dark:bg-[#0b0b0a] overflow-x-hidden">
      {/* ظهور الواجهة تدريجياً بتأثير انسيابي */}
      <div
        className={`w-full min-h-screen transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isIntroFinishing || !showIntro
            ? 'scale-100 opacity-100 blur-0 translate-y-0'
            : 'scale-[0.96] opacity-0 blur-[6px] translate-y-4 pointer-events-none'
        }`}
      >
        <App />
      </div>

      {showIntro && (
        <WahIntro
          initialPhase={introPhase}
          onBeforeFinish={() => {
            setIsIntroFinishing(true);
          }}
          onFinish={() => {
            setShowIntro(false);
          }}
        />
      )}
    </div>
  );
}