'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AppError] Error caught by Next.js App Router boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#eee8dc] dark:bg-[#0b0b0a] flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-3xl shadow-xl border border-black/10 dark:border-white/10 p-8 text-center">
        <div className="w-16 h-16 bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#9a6a35]/20">
          <AlertTriangle className="w-8 h-8" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-bold text-[#211d18] dark:text-[#f5f0e7] mb-2 font-serif">
          عذراً، حدث خطأ غير متوقع
        </h1>

        <p className="text-black/60 dark:text-white/60 text-sm mb-6 leading-relaxed">
          واجهت المنصة مشكلة مؤقتة أثناء معالجة الصفحة. لقد تم تسجيل هذا الخطأ لحله في أقرب وقت.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            id="app-error-reload-btn"
            type="button"
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 bg-[#9a6a35] hover:bg-[#7d5427] text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>إعادة تحميل الصفحة</span>
          </button>

          <Link
            id="app-error-home-btn"
            href="/"
            className="flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] px-5 py-2.5 rounded-xl font-bold transition-colors border border-black/10 dark:border-white/10 cursor-pointer"
          >
            <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>العودة للرئيسية</span>
          </Link>
        </div>

        {process.env.NODE_ENV !== 'production' && error && (
          <div className="mt-6 text-left p-3 bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 rounded-xl text-xs font-mono overflow-auto max-h-32 dir-ltr">
            {error.message || error.toString()}
          </div>
        )}
      </div>
    </div>
  );
}
