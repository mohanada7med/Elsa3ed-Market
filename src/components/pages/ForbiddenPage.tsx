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
    ? 'سلة المشتريات غير متاحة لحسابات البائعين'
    : isShoppingRoute && currentRole === 'admin'
    ? 'سلة المشتريات غير متاحة لحسابات الإدارة العليا'
    : title || 'وصول محظور — غير مصرح';

  const defaultMessage = isShoppingRoute && currentRole === 'seller'
    ? 'سلة المشتريات وخدمات التسوق وإتمام الطلبات مخصصة للمشترين فقط. يمكنك إدارة منتجاتك ومخزونك ومبيعاتك من خلال لوحة تحكم ورشتك.'
    : isShoppingRoute && currentRole === 'admin'
    ? 'سلة المشتريات وخدمات التسوق مخصصة لعملاء ومشتري المنصة فقط. يمكنك متابعة ورقابة العمليات من لوحة الإدارة العليا.'
    : message || 'هذا القسم مخصص لفئة محددة من المستخدمين وفقاً للصلاحيات الممنوحة لهم.';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16" dir="rtl">
      <div className="max-w-lg w-full bg-white dark:bg-[#1E1917] rounded-3xl p-8 sm:p-12 text-center border border-[#ecdccf] dark:border-[#382E27] shadow-xl">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <span className="inline-block px-3.5 py-1 bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 rounded-full text-xs font-bold tracking-wider uppercase mb-3 border border-rose-200 dark:border-rose-900/60">
          رمز الاستجابة: 403 Forbidden
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-[#29221d] dark:text-[#FAF6F2] mb-3 font-heritage">
          {defaultTitle}
        </h1>

        <p className="text-[#6e5d4f] dark:text-[#A89C90] text-sm sm:text-base leading-relaxed mb-8">
          {defaultMessage}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {currentRole === 'seller' ? (
            <button
              type="button"
              id="forbidden-seller-dashboard-btn"
              onClick={() => setActivePage('seller-dashboard')}
              className="flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-sm cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>الانتقال إلى لوحة الورشة</span>
            </button>
          ) : currentRole === 'admin' ? (
            <button
              type="button"
              id="forbidden-admin-dashboard-btn"
              onClick={() => setActivePage('admin-dashboard')}
              className="flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-sm cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>الانتقال إلى لوحة الإدارة</span>
            </button>
          ) : (
            <button
              type="button"
              id="forbidden-login-btn"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#9a3412] hover:bg-[#7c2d12] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول بحساب مشتري</span>
            </button>
          )}

          <button
            type="button"
            id="forbidden-home-btn"
            onClick={() => setActivePage('home')}
            className="flex items-center justify-center gap-2 bg-[#f5ebe1] dark:bg-[#2A2420] hover:bg-[#eddcd0] dark:hover:bg-[#352E28] text-[#7c2d12] dark:text-[#FF855D] px-6 py-3 rounded-xl font-bold transition-colors text-sm cursor-pointer border border-[#E8E1D9] dark:border-[#382E27]"
          >
            <Home className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
