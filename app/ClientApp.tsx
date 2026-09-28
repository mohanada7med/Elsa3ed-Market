'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { WahIntro } from '../src/components/WahIntro';

const App = dynamic(() => import('../src/App'), {
  ssr: false,
});

const SESSION_KEY = 'elsa3ed_wah_session_visited';

export default function ClientApp() {
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introPhase, setIntroPhase] = useState<'idle' | 'loading_pillars'>('idle');

  useEffect(() => {
    try {
      const hasVisited = sessionStorage.getItem(SESSION_KEY);
      if (hasVisited) {
        // عند كل ريفرش (Refresh) في نفس السيشن: يظهر الجزء الثاني مباشرة (ركائز المنصة)
        setIntroPhase('loading_pillars');
      } else {
        // أول مرة يفتح فيها الموقع أو في سيشن جديدة: يظهر الجزء الأول (دوس على وه)
        setIntroPhase('idle');
        sessionStorage.setItem(SESSION_KEY, 'true');
      }
    } catch {
      // في حال تعذر الوصول لـ sessionStorage
      setIntroPhase('idle');
    }

    setMounted(true);

    const handleOpenIntro = () => {
      setShowIntro(true);
      setIntroPhase('idle');
    };

    window.addEventListener('play-wah-intro', handleOpenIntro);
    window.addEventListener('open-wah-intro', handleOpenIntro);

    return () => {
      window.removeEventListener('play-wah-intro', handleOpenIntro);
      window.removeEventListener('open-wah-intro', handleOpenIntro);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* تطبيق وه الأساسي يُحمَّل في الخلفية بسرعة وسلاسة */}
      <App />

      {/* شاشة البداية والتجربة التفاعلية WahIntro */}
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
