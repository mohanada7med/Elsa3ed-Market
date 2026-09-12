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

  useEffect(() => {
    setMounted(true);

    try {
      const hasVisited = sessionStorage.getItem(SESSION_KEY);
      if (hasVisited === 'true') {
        // لو عمل Refresh: يدخل على التحميل المباشر
        setIntroPhase('loading_pillars');
      } else {
        // أول دخول للتبويب: التجربة الكاملة بالزرار والصوت
        setIntroPhase('idle');
      }
    } catch {
      setIntroPhase('idle');
    }
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* الـ App بدون أي wrapper أو transform عشان الـ fixed elements (Bottom Bar) ترجع مكانها الطبيعي فوراً */}
      <App />

      {/* الـ Intro تظهر كـ Overlay فوق الموقع */}
      {showIntro && (
        <WahIntro
          initialPhase={introPhase}
          onFinish={() => {
            setShowIntro(false);
          }}
        />
      )}
    </>
  );
}