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
      <div className="max-w-lg w-full bg-[var(--wah-surface,#FFFFFF)] dark:bg-[var(--wah-surface,#1B1613)] rounded-3xl p-8 sm:p-12 text-center border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] shadow-xl">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-rose-500/20">
          <ShieldAlert className="w-10 h-10" aria-hidden="true" />
        </div>

        <span className="inline-block px-3.5 py-1 bg-rose-500/10 text-rose-700 dark:text-rose-300 rounded-full text-xs font-bold tracking-wider uppercase mb-3 border border-rose-500/20">
          رمز الاستجابة: 403 Forbidden
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] mb-3 font-heritage">
          {defaultTitle}
        </h1>

        <p className="text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] text-sm sm:text-base leading-relaxed mb-8">
          {defaultMessage}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {currentRole === 'seller' ? (
            <button
              type="button"
              id="forbidden-seller-dashboard-btn"
              onClick={() => setActivePage('seller-dashboard')}
              className="flex items-center justify-center gap-2 bg-[var(--wah-secondary,#264653)] hover:bg-[var(--wah-secondary-hover,#1E3640)] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-sm cursor-pointer"
            >
              <Store className="w-4 h-4" aria-hidden="true" />
              <span>الانتقال إلى لوحة الورشة</span>
            </button>
          ) : currentRole === 'admin' ? (
            <button
              type="button"
              id="forbidden-admin-dashboard-btn"
              onClick={() => setActivePage('admin-dashboard')}
              className="flex items-center justify-center gap-2 bg-[var(--wah-primary,#B24C2B)] hover:bg-[var(--wah-primary-hover,#963E21)] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-sm cursor-pointer"
            >
              <Shield className="w-4 h-4" aria-hidden="true" />
              <span>الانتقال إلى لوحة الإدارة</span>
            </button>
          ) : (
            <button
              type="button"
              id="forbidden-login-btn"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[var(--wah-primary,#B24C2B)] hover:bg-[var(--wah-primary-hover,#963E21)] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>تسجيل الدخول بحساب مشتري</span>
            </button>
          )}

          <button
            type="button"
            id="forbidden-home-btn"
            onClick={() => setActivePage('home')}
            className="flex items-center justify-center gap-2 bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)] hover:bg-[var(--wah-border,#E5DDD3)] dark:hover:bg-[var(--wah-border,#352B24)] text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] px-6 py-3 rounded-xl font-bold transition-colors text-sm cursor-pointer border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)]"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>العودة للرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
