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
      if (hasVisited === 'true') {
        // عند عمل Refresh في نفس الجلسة: التحميل السريع مباشرة
        setIntroPhase('loading_pillars');
      } else {
        // أول دخول للموقع في الجلسة: التجربة الكاملة مع الشعار
        setIntroPhase('idle');
      }
    } catch {
      setIntroPhase('idle');
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

      {/* شاشة البداية WahIntro تظهر كأول شيء يراه المستخدم كطبقة كاملة */}
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
