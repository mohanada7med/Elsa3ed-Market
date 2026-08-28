'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#faf6f0]">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#B45F42] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-[#7A6F64]">جاري تحميل سوق الصعيد...</p>
      </div>
    </div>
  ),
});

export default function ClientApp() {
  return <App />;
}
