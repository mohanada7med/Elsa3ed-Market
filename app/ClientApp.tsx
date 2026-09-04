'use client';

import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center p-4">
    <div className="w-12 h-12 border-4 border-[#E8E1D9] border-t-[#B45F42] rounded-full animate-spin mb-4" />
    <p className="text-sm font-bold text-[#2D2A26]">وه | WAH — العالم الرقمي لصعيد مصر</p>
  </div>
);

const App = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: LoadingFallback,
});

export default function ClientApp() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <App />
    </Suspense>
  );
}
