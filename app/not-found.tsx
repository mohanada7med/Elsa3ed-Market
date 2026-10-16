'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFF9EE] dark:bg-[#1B1009] flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-[#F8EBD7] dark:bg-[#3B1E0E] backdrop-blur-xl rounded-3xl shadow-xl border border-[#E0C79B] dark:border-[#6B3A1F] p-8 text-center">
        <div className="w-16 h-16 bg-primary/15 text-primary dark:text-[#C99444] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-primary/20 text-3xl font-black">
          404
        </div>

        <h1 className="text-2xl font-bold text-[#3B1E0E] dark:text-[#FFF9EE] mb-2 font-main">
          الصفحة غير موجودة
        </h1>

        <p className="text-[#8C6F53] dark:text-[#D6C6B1] text-sm mb-6 leading-relaxed">
          عذراً، الصفحة التي تحاول الوصول إليها قد تكون حُذفت أو نُقلت أو أن الرابط غير صحيح.
        </p>

        <div className="flex justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-[#6B3A1F] hover:bg-[#3B1E0E] text-[#FFF9EE] px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm cursor-pointer"
          >
            <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>العودة للرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
