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
    <div className="min-h-screen bg-[#FFF9EE] dark:bg-[#1B1009] flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-[#F8EBD7] dark:bg-[#3B1E0E] backdrop-blur-xl rounded-3xl shadow-xl border border-[#E0C79B] dark:border-[#6B3A1F] p-8 text-center">
        <div className="w-16 h-16 bg-primary/15 text-primary dark:text-[#C99444] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-primary/20">
          <AlertTriangle className="w-8 h-8" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-bold text-[#3B1E0E] dark:text-[#FFF9EE] mb-2 font-main">
          عذراً، حدث خطأ غير متوقع
        </h1>

        <p className="text-[#8C6F53] dark:text-[#D6C6B1] text-sm mb-6 leading-relaxed">
          واجهت المنصة مشكلة مؤقتة أثناء معالجة الصفحة. لقد تم تسجيل هذا الخطأ لحله في أقرب وقت.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            id="app-error-reload-btn"
            type="button"
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 bg-[#6B3A1F] hover:bg-[#3B1E0E] dark:hover:bg-[#C99444] text-[#FFF9EE] px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>إعادة تحميل الصفحة</span>
          </button>

          <Link
            id="app-error-home-btn"
            href="/"
            className="flex items-center justify-center gap-2 bg-[#FFF9EE] dark:bg-[#26160D] hover:bg-[#F8EBD7] dark:hover:bg-[#4A2715] text-[#3B1E0E] dark:text-[#FFF9EE] px-5 py-2.5 rounded-xl font-bold transition-colors border border-[#E0C79B] dark:border-[#6B3A1F] cursor-pointer"
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
