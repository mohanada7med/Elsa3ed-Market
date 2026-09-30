import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFF9EE] dark:bg-[#1B1009] flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-[#F8EBD7] dark:bg-[#3B1E0E] backdrop-blur-xl rounded-3xl shadow-xl border border-[#E0C79B] dark:border-[#6B3A1F] p-8 text-center">
        <img
          src="/mascot/empty-search.png"
          alt="تايه في بلادنا؟"
          className="h-44 sm:h-52 w-auto object-contain mx-auto mb-4 drop-shadow-xl"
        />

        <h1 className="text-2xl font-bold text-[#3B1E0E] dark:text-[#FFF9EE] mb-2 font-main">
          تايه في سكك الصعيد يا ولد عمي؟ (404)
        </h1>

        <p className="text-[#8C6F53] dark:text-[#D6C6B1] text-sm mb-6 leading-relaxed">
          ملقيناش الصفحة اللي بتدور عليها، يا إما الرابط اتغير يا دخلت في درب مقطوع. ارجع للرئيسية ونكمل الحكاية!
        </p>

        <div className="flex justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm cursor-pointer"
          >
            <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>العودة للرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
