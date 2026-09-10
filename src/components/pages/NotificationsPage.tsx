import React from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationsManager } from '../common/NotificationsManager';
import { Bell, ChevronRight, ArrowRight, ShieldCheck, LogIn } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const {
    currentRole,
    currentUser,
    isAuthenticated,
    setActivePage,
    unreadNotificationsCount,
    setIsAuthModalOpen,
    setAuthModalTab
  } = useApp();

  const isGuest = !isAuthenticated || currentRole === 'guest' || currentUser?.id === 'guest' || currentUser?.id === 'guest-visitor';

  return (
    <div
      dir="rtl"
      id="notifications-page-root"
      className="
        min-h-screen
        w-full
        overflow-x-hidden
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors duration-500
        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
      "
    >
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-8 sm:py-10 pt-28 sm:pt-36 pb-24 sm:pb-20 space-y-6 sm:space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-xs text-black/50 dark:text-white/50 font-medium">
          <button
            type="button"
            id="notifications-breadcrumb-home"
            onClick={() => setActivePage('home')}
            className="hover:text-[#9a6a35] transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>الرئيسية</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 rotate-180 text-black/30 dark:text-white/30" />
          <span className="font-bold text-[#211d18] dark:text-[#f5f0e7]">مركز الإشعارات والتنبيهات</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-5 sm:pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#9a6a35] dark:text-[#d5a56d] mb-1">
              <Bell className="w-4 h-4" />
              <span>نظام التنبيهات المباشر</span>
              {unreadNotificationsCount > 0 && !isGuest && (
                <span className="px-2 py-0.5 rounded-full bg-[#9a6a35] text-white text-[10px] font-black">
                  {unreadNotificationsCount} غير مقروء
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#211d18] dark:text-[#f5f0e7] font-serif">
              مركز الإشعارات والتنبيهات
            </h1>
            <p className="text-xs sm:text-sm text-black/60 dark:text-white/60 mt-1 max-w-2xl">
              تلقي وتتبع كافة التنبيهات الخاصة بطلبات الشراء، تحديثات الورش الحرفية، والرسائل الرسمية من إدارة منصة وَه.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              id="notifications-back-market-btn"
              onClick={() => setActivePage('products' as any)}
              className="px-4 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] border border-black/10 dark:border-white/10 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>تصفح السوق</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        </div>

        {/* Guest prompt if not logged in */}
        {isGuest ? (
          <div className="max-w-md mx-auto my-12 p-8 bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d] flex items-center justify-center mx-auto text-2xl border border-[#9a6a35]/20">
              🔔
            </div>
            <h2 className="text-xl font-bold text-[#211d18] dark:text-[#f5f0e7]">
              سجل دخولك لعرض إشعاراتك
            </h2>
            <p className="text-xs sm:text-sm text-black/60 dark:text-white/60 leading-relaxed">
              قم بتسجيل الدخول بحسابك لمتابعة إشعارات طلباتك الخاصة، تنبيهات الورش والمحادثات المباشرة.
            </p>
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                id="notifications-guest-login-btn"
                onClick={() => {
                  setAuthModalTab('login');
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-3.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] font-bold rounded-xl shadow-md text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول الآن</span>
              </button>
              <button
                type="button"
                id="notifications-guest-register-btn"
                onClick={() => {
                  setAuthModalTab('register');
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] font-bold rounded-xl text-xs hover:bg-black/10 transition-all cursor-pointer"
              >
                إنشاء حساب جديد
              </button>
            </div>
          </div>
        ) : (
          /* Full Notifications Manager */
          <div className="w-full">
            <NotificationsManager
              viewMode={currentRole === 'admin' ? 'admin' : currentRole === 'seller' ? 'seller' : 'buyer'}
              onNavigateTab={(tab) => {
                if (currentRole === 'admin') {
                  setActivePage('admin-dashboard');
                } else if (currentRole === 'seller') {
                  if (tab === 'orders') setActivePage('seller-orders');
                  else if (tab === 'products') setActivePage('seller-products');
                  else if (tab === 'payouts') setActivePage('seller-payouts');
                  else setActivePage('seller-dashboard');
                } else {
                  if (tab === 'orders') setActivePage('orders');
                  else if (tab === 'profile') setActivePage('buyer-account');
                  else setActivePage('home');
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
