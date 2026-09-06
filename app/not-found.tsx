import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--wah-background,#FAF7F2)] dark:bg-[var(--wah-background,#110E0C)] flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-[var(--wah-surface,#FFFFFF)] dark:bg-[var(--wah-surface,#1B1613)] rounded-3xl shadow-xl border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] p-8 text-center">
        <div className="w-16 h-16 bg-[var(--wah-primary-light,#F7ECE6)] dark:bg-[var(--wah-primary-light,rgba(224,99,60,0.15))] text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[var(--wah-primary,#B24C2B)]/20">
          <Compass className="w-8 h-8" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-bold text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] mb-2 font-serif">
          الصفحة غير موجودة (404)
        </h1>

        <p className="text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] text-sm mb-6 leading-relaxed">
          عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم نقلها أو كتابة الرابط بشكل غير صحيح.
        </p>

        <div className="flex justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-[var(--wah-primary,#B24C2B)] hover:bg-[var(--wah-primary-hover,#963E21)] text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm cursor-pointer"
          >
            <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>العودة للرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
