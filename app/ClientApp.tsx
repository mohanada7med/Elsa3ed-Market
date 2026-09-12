'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import WahIntro from '../src/components/WahIntro';

const App = dynamic(() => import('../src/App'), {
  ssr: false,
});

export default function ClientApp() {
  const [mounted, setMounted] = useState(false);
  // تبدأ بـ true دائماً لتعمل مع كل فتحة موقع
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <App />
      {showIntro && (
        <WahIntro onFinish={() => setShowIntro(false)} />
      )}
    </>
  );
}