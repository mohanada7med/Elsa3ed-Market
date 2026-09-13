import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream dark:bg-espresso-900 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-white/80 dark:bg-espresso-900/90 backdrop-blur-xl rounded-3xl shadow-xl border border-black/10 dark:border-white/10 p-8 text-center">
        <div className="w-16 h-16 bg-primary/15 text-primary dark:text-primary-hover rounded-2xl flex items-center justify-center mx-auto mb-5 border border-primary/20">
          <Compass className="w-8 h-8" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-bold text-espresso dark:text-cream mb-2 font-serif">
          الصفحة غير موجودة (404)
        </h1>

        <p className="text-black/60 dark:text-white/60 text-sm mb-6 leading-relaxed">
          عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم نقلها أو كتابة الرابط بشكل غير صحيح.
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
