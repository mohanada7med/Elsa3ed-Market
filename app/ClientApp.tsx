'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const App = dynamic(() => import('../src/App'), {
  ssr: false,
});

export default function ClientApp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <App />;
}