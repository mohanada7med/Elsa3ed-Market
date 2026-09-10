import React from 'react';
import { ShieldAlert, Home, LogIn, Store, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ForbiddenPageProps {
  title?: string;
  message?: string;
}

export const ForbiddenPage: React.FC<ForbiddenPageProps> = ({ title, message }) => {
  const { setActivePage, setIsAuthModalOpen, currentRole, activePage } = useApp();

  const isShoppingRoute = activePage === 'cart' || activePage === 'checkout' || activePage === 'favorites';

  const defaultTitle = isShoppingRoute && currentRole === 'seller'
    ? 'سلة المشتريات مش متاحة لحسابات البائعين'
    : isShoppingRoute && currentRole === 'admin'
    ? 'سلة المشتريات مش متاحة لحسابات الإدارة'
    : title || 'الصفحة دي مقفولة عليك';

  const defaultMessage = isShoppingRoute && currentRole === 'seller'
    ? 'سلة المشتريات والشوبينج معمولة للمشترين بس. تقدر تدير منتجاتك ومخزونك ومبيعاتك من لوحة تحكم ورشتك.'
    : isShoppingRoute && currentRole === 'admin'
    ? 'سلة الشراء مخصصة للزبائن والمشترين بس. تقدر تتابع الشغل والعمليات من لوحة الإدارة.'
    : message || 'القسم ده محتاج صلاحيات تانية عشان تدخله.';

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-5 sm:px-8 py-16" dir="rtl">
      <div className="max-w-lg w-full bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] p-8 sm:p-12 text-center border border-black/10 dark:border-white/10 shadow-xl">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
          <ShieldAlert className="w-10 h-10" aria-hidden="true" />
        </div>

        <span className="inline-block px-3.5 py-1 bg-rose-500/10 text-rose-700 dark:text-rose-300 rounded-full text-xs font-bold tracking-wider uppercase mb-3 border border-rose-500/20">
          كود الخطأ: 403 Forbidden
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-[#211d18] dark:text-[#f5f0e7] mb-3 font-serif">
          {defaultTitle}
        </h1>

        <p className="text-[#211d18]/70 dark:text-[#f5f0e7]/70 text-sm sm:text-base leading-relaxed mb-8">
          {defaultMessage}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {currentRole === 'seller' ? (
            <button
              type="button"
              id="forbidden-seller-dashboard-btn"
              onClick={() => setActivePage('seller-dashboard')}
              className="flex items-center justify-center gap-2 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] px-6 py-3.5 rounded-[1.25rem] font-black transition-all shadow-lg text-sm cursor-pointer"
            >
              <Store className="w-4 h-4" aria-hidden="true" />
              <span>روح على لوحة الورشة</span>
            </button>
          ) : currentRole === 'admin' ? (
            <button
              type="button"
              id="forbidden-admin-dashboard-btn"
              onClick={() => setActivePage('admin-dashboard')}
              className="flex items-center justify-center gap-2 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] px-6 py-3.5 rounded-[1.25rem] font-black transition-all shadow-lg text-sm cursor-pointer"
            >
              <Shield className="w-4 h-4" aria-hidden="true" />
              <span>روح على لوحة الإدارة</span>
            </button>
          ) : (
            <button
              type="button"
              id="forbidden-login-btn"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] px-6 py-3.5 rounded-[1.25rem] font-black transition-all shadow-lg text-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>ادخل بحساب مشتري</span>
            </button>
          )}

          <button
            type="button"
            id="forbidden-home-btn"
            onClick={() => setActivePage('home')}
            className="flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] px-6 py-3.5 rounded-[1.25rem] font-bold transition-colors text-sm cursor-pointer border border-black/10 dark:border-white/10"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>ارجع للرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
