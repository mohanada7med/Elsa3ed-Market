'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const App = dynamic(() => import('../src/App'), {
  ssr: false,
});

const WahIntro = dynamic(() => import('../src/components/WahIntro'), {
  ssr: false,
});

const SESSION_KEY = 'elsa3ed_wah_session_visited';

export default function ClientApp() {
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introPhase, setIntroPhase] = useState<'idle' | 'loading_pillars'>('idle');

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === 'true') {
        setIntroPhase('loading_pillars');
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* تطبيق وه الأساسي يُحمَّل في الخلفية فوراً دون تأخير */}
      <App />

      {/* شاشة البداية وه كطبقة علوية سلسة وسريعة */}
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