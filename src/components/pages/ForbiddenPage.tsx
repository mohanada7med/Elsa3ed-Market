import React from 'react';
import { ShieldAlert, Home, LogIn } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ForbiddenPage: React.FC = () => {
  const { setActivePage, setIsAuthModalOpen } = useApp();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16" dir="rtl">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#ecdccf] shadow-lg">
        <div className="w-20 h-20 bg-rose-50 text-rose-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
          رمز الخطأ: 403 غير مصرح
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold text-[#29221d] mb-3 font-serif">
          وصول محظور أو يتطلب صلاحيات خاصة
        </h1>

        <p className="text-[#6e5d4f] text-base leading-relaxed mb-8">
          هذا القسم مخصص لفئة محددة من المستخدمين (الحرفيين أو إدارة المنصة). يرجى التأكد من تسجيل الدخول بالحساب المناسب.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            id="forbidden-login-btn"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#9a3412] hover:bg-[#7c2d12] text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
          >
            <LogIn className="w-5 h-5" />
            <span>تسجيل الدخول بحساب آخر</span>
          </button>

          <button
            id="forbidden-home-btn"
            onClick={() => setActivePage('home')}
            className="flex items-center justify-center gap-2 bg-[#f5ebe1] hover:bg-[#eddcd0] text-[#7c2d12] px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>العودة للرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
