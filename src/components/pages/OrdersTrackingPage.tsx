import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { api, initiatePaymobPayment, getPaymentStatus } from '../../services/api';
import {
  Truck,
  CheckCircle2,
  ChevronRight,
  MapPin,
  RefreshCw,
  ShoppingBag,
  XCircle,
  MessageSquare,
  AlertTriangle,
  ExternalLink,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Loader2
} from 'lucide-react';


const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'pending', label: 'تم تسجيل الطلب', desc: 'تم استلام طلبك ومراجعته بالورشة' },
  { status: 'confirmed', label: 'تأكيد الورش الحرفية', desc: 'تم تأكيد توافر القطع وجودة الصنعة اليدوية' },
  { status: 'processing', label: 'التجهيز والتغليف الآمن', desc: 'يتم الآن فحص القطعة وتغليفها بمواد امتصاص الصدمات' },
  { status: 'shipped', label: 'في الطريق للتوصيل', desc: 'تم شحن الطلب بالتنسيق المباشر مع الورشة وهو في طريقه إليك' },
  { status: 'out_for_delivery', label: 'خرجت للتوصيل', desc: 'الشحنة في طريقها لتسليم الطلب على عنوانك بالتنسيق معك' },
  { status: 'delivered', label: 'تم الاستلام بنجاح', desc: 'تم تسليم الطلب إلى باب المنزل' }
];

export const OrdersTrackingPage: React.FC = () => {
  const { orders, cancelOrder, refreshOrders, setActivePage, addToast, selectedOrderId, openChatWithArtisan, navigateToOrder, activePage, confirmModal, openReportModal, currentUser } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success') {
      addToast('تم تأكيد الدفع والطلب!', 'تم استلام وتأكيد سداد طلبك بنجاح عبر Paymob، وجاري الآن بدء التجهيز بالورشة.', 'success');
      refreshOrders();
    } else if (payment === 'failed') {
      addToast('لم يكتمل الدفع', 'لم يتم تأكيد طلبك لعدم اكتمال السداد. اضغط على زر "إتمام السداد وتأكيد الطلب" للمحاولة مجدداً.', 'error');
      refreshOrders();
    } else if (payment === 'checking') {
      addToast('جاري مراجعة الدفع', 'هنحدّث حالة الطلب فور تأكيد Paymob لاستلام المبلغ.', 'info');
      refreshOrders();
    }
  }, []);

  const effectiveOrderId =
    selectedOrderId ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/orders/')
      ? decodeURIComponent(window.location.pathname.split('/')[2] || '')
      : null);

  // Sync selectedOrder when orders or selectedOrderId update
  const currentSelected = selectedOrder
    ? orders.find((o) => o.id === selectedOrder.id) || orders[0] || null
    : (effectiveOrderId ? orders.find((o) => o.id === effectiveOrderId || o.orderNumber === effectiveOrderId) : null) || orders[0] || null;

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'review':
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'out_for_delivery':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 0;
    }
  };

  const handleCancelOrder = (orderId: string) => {
    confirmModal({
      title: 'إلغاء الطلب',
      message: 'متأكد إنك عايز تلغي الطلب ده؟ القطع هترجع للمخزون فوراً.',
      confirmText: 'نعم، إلغاء الطلب',
      danger: true,
      onConfirm: async () => {
        setIsCancelling(true);
        try {
          await cancelOrder(orderId, 'المشتري طلب الإلغاء');
        } catch (err: any) {
          addToast('مشكلة في الإلغاء', err?.message || 'ماعرفناش نلغي الطلب دلوقتي، جرّب تاني', 'error');
        } finally {
          setIsCancelling(false);
        }
      }
    });
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-cream text-espresso dark:bg-espresso-900 dark:text-cream max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-8 space-y-8"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-espresso/60 dark:text-cream/60 font-medium">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-primary dark:hover:text-[#C99444] transition-colors cursor-pointer"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 opacity-50" />
        <button
          type="button"
          onClick={() => {
            setSelectedOrder(null);
            setActivePage('orders');
          }}
          className="hover:text-primary dark:hover:text-[#C99444] transition-colors cursor-pointer"
        >
          الطلبات
        </button>
        {activePage === 'order-details' && currentSelected && (
          <>
            <ChevronRight className="w-3.5 h-3.5 rotate-180 opacity-50" />
            <span className="text-espresso dark:text-cream font-bold">
              طلب #{currentSelected.orderNumber || currentSelected.id}
            </span>
          </>
        )}
      </nav>

      {/* Page Header */}
      <div className="bg-espresso rounded-[2rem] p-6 sm:p-10 text-cream shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-black/10 dark:border-white/10 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-[#C99444] border border-primary/30 text-xs font-bold">
            <Truck className="w-3.5 h-3.5 text-[#C99444]" />
            <span>تتبع شحنتك خطوة بخطوة من الصعيد</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-main font-black">
            تابع طلباتك ورحلتها من الورشة لحد عندك
          </h1>
          <p className="text-xs text-cream/80">
            تابع تجهيز القطعة في ورش الصعيد لحد ما تخبط على باب بيتك بأمان
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            type="button"
            onClick={() => refreshOrders()}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center"
            title="حدّث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActivePage('products')}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-[1.25rem] shadow-lg transition-all hover:scale-[1.02] cursor-pointer min-h-[42px]"
          >
            شوف قطع تانية
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/75 dark:bg-espresso-900/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-16 text-center space-y-4 shadow-lg">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary dark:text-primary-hover flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-cairo font-bold text-espresso dark:text-cream">لسه مفيش أي طلبات طلبتها لحد دلوقتي</h3>
          <p className="text-xs sm:text-sm text-espresso/70 dark:text-cream/70 max-w-sm mx-auto leading-relaxed">
            أول ما تطلب أي قطعة من الفخار أو الكليم أو العسل، مسار شحنتها وتفاصيلها هتظهرلك هنا أول بأول.
          </p>
          <button
            type="button"
            onClick={() => setActivePage('products')}
            className="px-7 py-3.5 bg-[#6B3A1F] text-[#FFF9EE] hover:bg-[#3B1E0E] dark:hover:bg-[#C99444] text-xs font-black rounded-[1.25rem] shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
          >
            استكشف سوق وه
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Orders List Column */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-cairo font-bold text-sm text-espresso dark:text-cream px-1">
              كل طلباتك ({orders.length})
            </h3>

            <div className="space-y-3">
              {orders.map((ord) => {
                const isSelected = currentSelected?.id === ord.id;
                const isCancelled = ord.status === 'cancelled';
                return (
                  <div
                    key={ord.id}
                    id={`order-card-${ord.id}`}
                    onClick={() => {
                      setSelectedOrder(ord);
                      navigateToOrder(ord.id);
                    }}
                    className={`p-4 rounded-[1.5rem] border cursor-pointer transition-all duration-200 ${isSelected
                      ? 'bg-white/95 dark:bg-espresso-900/95 border-primary shadow-lg ring-1 ring-primary'
                      : 'bg-white/75 dark:bg-espresso-900/90 border-black/10 dark:border-white/10 hover:border-primary/50'
                      } ${isCancelled ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-xs text-primary dark:text-primary-hover">
                        {ord.orderNumber || ord.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${ord.status === 'delivered'
                          ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20'
                          : ord.status === 'shipped' || ord.status === 'out_for_delivery'
                            ? 'bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/20'
                            : ord.status === 'processing'
                              ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20'
                              : ord.status === 'confirmed'
                                ? 'bg-primary/15 text-primary dark:text-primary-hover border border-primary/30'
                                : ord.status === 'cancelled'
                                  ? 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20'
                                  : 'bg-black/5 text-espresso dark:bg-cream/10 dark:text-cream'
                          }`}
                      >
                        {ord.status === 'cancelled'
                          ? 'ملغي'
                          : STATUS_STEPS.find((s) => s.status === ord.status)?.label || ord.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex -space-x-2 space-x-reverse overflow-hidden">
                        {(ord.items || []).filter(Boolean).slice(0, 3).map((it: any, idx: number) => {
                          const itemImg =
                            it?.product?.images?.[0] ||
                            it?.productImage ||
                            it?.images?.[0] ||
                            it?.image ||
                            'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=100&q=80';
                          return (
                            <img
                              key={idx}
                              src={itemImg}
                              alt=""
                              className="inline-block w-8 h-8 rounded-lg object-cover ring-2 ring-white dark:ring-[#1B1009]"
                            />
                          );
                        })}
                      </div>
                      <span className="text-xs text-espresso/70 dark:text-cream/70 font-medium">
                        {(ord.items || []).length} منتجات • {ord.total} ج.م
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-espresso/50 dark:text-cream/50 pt-2 border-t border-black/5 dark:border-white/5">
                      <span>تاريخ الطلب: {ord.createdAt ? ord.createdAt.substring(0, 10) : 'اليوم'}</span>
                      {ord.paymentStatus === 'paid' ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>مدفوع (Paymob)</span>
                        </span>
                      ) : ord.paymentMethod?.startsWith('paymob') ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">بانتظار السداد</span>
                      ) : (
                        <span className="text-espresso/60 dark:text-cream/60">دفع عند الاستلام</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Order Tracking Timeline Detail */}
          {currentSelected && (
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white/75 dark:bg-espresso-900/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-lg space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-4">
                  <div>
                    <span className="text-xs text-espresso/60 dark:text-cream/60 block">تفاصيل الطلب النشط:</span>
                    <h2 className="text-lg font-black text-cairo text-espresso dark:text-cream">
                      {currentSelected.orderNumber || currentSelected.id}
                    </h2>
                    {currentSelected.trackingNumber && (
                      <span className="text-[11px] text-espresso/60 dark:text-cream/60 font-mono">
                        رقم التتبع: {currentSelected.trackingNumber}
                      </span>
                    )}
                  </div>

                  <div className="text-left sm:text-left">
                    <span className="text-xs text-espresso/50 dark:text-cream/50 block">الإجمالي النهائي:</span>
                    <span className="text-xl font-black text-primary dark:text-primary-hover">{currentSelected.total} ج.م</span>
                    {!!currentSelected.sellerTipAmount && (
                      <span className="mt-1 block text-[10px] font-bold text-espresso/60 dark:text-cream/60">
                        يشمل دعمًا اختياريًا بقيمة {currentSelected.sellerTipAmount} ج.م لـ{currentSelected.sellerTipSellerName || 'الحرفي'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Payment Information & Paymob Actions Box */}
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  currentSelected.paymentStatus === 'paid'
                    ? 'bg-emerald-500/[0.08] border-emerald-500/20'
                    : currentSelected.paymentMethod?.startsWith('paymob')
                      ? 'bg-amber-500/[0.08] border-amber-500/20'
                      : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/10 dark:border-white/10'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      currentSelected.paymentStatus === 'paid'
                        ? 'bg-emerald-600 text-white'
                        : currentSelected.paymentMethod?.startsWith('paymob')
                          ? 'bg-amber-600 text-white'
                          : 'bg-black/10 dark:bg-white/10 text-espresso dark:text-cream'
                    }`}>
                      {currentSelected.paymentMethod === 'paymob_wallet' ? (
                        <Smartphone className="w-5 h-5" />
                      ) : (
                        <CreditCard className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-espresso dark:text-cream">
                          {currentSelected.paymentMethod === 'paymob_wallet'
                            ? 'المحفظة الذكية (Paymob)'
                            : currentSelected.paymentMethod === 'paymob_card' || currentSelected.paymentMethod === 'paymob'
                              ? 'البطاقة البنكية (Paymob)'
                              : 'الدفع نقداً عند الاستلام'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          currentSelected.paymentStatus === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                            : currentSelected.paymentMethod?.startsWith('paymob')
                              ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                              : 'bg-blue-500/20 text-blue-800 dark:text-blue-300'
                        }`}>
                          {currentSelected.paymentStatus === 'paid'
                            ? 'تم السداد وتأكيد الطلب ✓'
                            : currentSelected.paymentMethod?.startsWith('paymob')
                              ? 'غير مؤكد - بانتظار السداد'
                              : 'الدفع عند المعاينة'}
                        </span>
                      </div>
                      <p className="text-[11px] text-espresso/60 dark:text-cream/60 mt-0.5">
                        {currentSelected.paymentStatus === 'paid'
                          ? `رقم العملية المعتمدة: ${currentSelected.paymentReference || 'Paymob Transaction'}`
                          : currentSelected.paymentMethod?.startsWith('paymob')
                            ? 'لم يتم تأكيد طلبك للورشة بعد. سدد الآن إلكترونياً لتأكيد الطلب وبدء تجهيزه بالورش.'
                            : 'سيتم تحصيل المبلغ نقداً عند تسليمك ومعاينة الشحنة'}
                      </p>
                    </div>
                  </div>

                  {/* Actions for Paymob Pending Orders */}
                  {currentSelected.paymentMethod?.startsWith('paymob') &&
                    currentSelected.paymentStatus !== 'paid' &&
                    currentSelected.status !== 'cancelled' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setIsPaying(true);
                            const methodType = currentSelected.paymentMethod === 'paymob_wallet' ? 'wallet' : 'card';
                            const requestPay = async (type: 'card' | 'wallet') => {
                              if (typeof api?.initiatePaymobPayment === 'function') {
                                return api.initiatePaymobPayment(currentUser, currentSelected.id, type);
                              }
                              if (typeof initiatePaymobPayment === 'function') {
                                return initiatePaymobPayment(currentUser, currentSelected.id, type);
                              }
                              const r = await fetch('/api/payments/paymob/initiate', {
                                method: 'POST',
                                credentials: 'include',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ orderId: currentSelected.id, methodType: type })
                              });
                              const j = await r.json();
                              if (!j.success || !j.data) throw new Error(j.error || 'تعذر بدء الدفع');
                              return j.data;
                            };

                            let payRes: any = null;
                            try {
                              payRes = await requestPay(methodType);
                            } catch (firstErr: any) {
                              if (methodType === 'wallet') {
                                console.warn('[OrdersTracking] Wallet unavailable, falling back to card payment:', firstErr?.message);
                                payRes = await requestPay('card');
                              } else {
                                throw firstErr;
                              }
                            }

                            if (payRes?.paymentUrl) {
                              window.location.href = payRes.paymentUrl;
                            }
                          } catch (err: any) {
                            addToast('خطأ في الاتصال بـ Paymob', err?.message || 'تعذر بدء الدفع، جرب ثانية', 'error');
                          } finally {
                            setIsPaying(false);
                          }
                        }}
                        disabled={isPaying}
                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {isPaying ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>جاري الفتح...</span>
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>إتمام السداد وتأكيد الطلب الآن</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setIsCheckingStatus(true);
                            let statusData: any = null;
                            if (typeof api?.getPaymentStatus === 'function') {
                              statusData = await api.getPaymentStatus(currentSelected.id);
                            } else if (typeof getPaymentStatus === 'function') {
                              statusData = await getPaymentStatus(currentSelected.id, currentUser);
                            } else {
                              const r = await fetch(`/api/payments/status/${currentSelected.id}`);
                              const j = await r.json();
                              statusData = j?.data;
                            }
                            if (statusData?.paymentStatus === 'paid') {
                              addToast('تم التأكيد', 'تم تأكيد سداد هذا الطلب بنجاح!', 'success');
                              refreshOrders();
                            } else {
                              addToast('حالة الدفع', 'الطلب ما زال بانتظار إتمام السداد عبر Paymob', 'info');
                            }
                          } catch (err) {
                            refreshOrders();
                          } finally {
                            setIsCheckingStatus(false);
                          }
                        }}
                        disabled={isCheckingStatus}
                        className="p-2 border border-black/10 dark:border-white/10 hover:bg-black/5 rounded-xl text-xs transition cursor-pointer"
                        title="تحقق من حالة الدفع"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Live Shipping & Tracking Information */}
                {Boolean(currentSelected.trackingNumber) && (
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-primary dark:text-primary-hover">
                            شحن مباشر بالتنسيق مع الورشة
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                            شحن مباشر
                          </span>
                        </div>
                        <p className="text-[11px] text-espresso/70 dark:text-cream/70 font-mono mt-0.5">
                          مرجع الشحنة: <strong className="text-espresso dark:text-cream font-bold">{currentSelected.trackingNumber}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}


                {/* Cancelled Banner */}
                {currentSelected.status === 'cancelled' && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-800 dark:text-rose-300 text-xs">
                    <XCircle className="w-5 h-5 shrink-0 text-rose-600" />
                    <div>
                      <span className="font-bold block">هذا الطلب ملغي</span>
                      <span>تم استرجاع كميات المنتجات إلى مخزون الورش الحرفية.</span>
                    </div>
                  </div>
                )}

                {/* Tracking Timeline */}
                {currentSelected.status !== 'cancelled' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-espresso dark:text-cream">مراحل الشحن والتجهيز:</h4>

                    <div className="relative pr-6 space-y-6 before:absolute before:right-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-black/10 dark:before:bg-white/10">
                      {STATUS_STEPS.map((step, idx) => {
                        const currentIdx = getStepIndex(currentSelected.status);
                        const isPastOrCurrent = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div key={step.status} className="relative flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 -mr-6.5 ${isPastOrCurrent
                                ? 'bg-primary text-white ring-4 ring-primary/20'
                                : 'bg-black/10 dark:bg-cream/10 text-stone-400'
                                }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>

                            <div className="flex-1">
                              <h5
                                className={`text-xs font-bold ${isCurrent
                                  ? 'text-primary dark:text-primary-hover'
                                  : isPastOrCurrent
                                    ? 'text-espresso dark:text-cream'
                                    : 'text-espresso/40 dark:text-cream/40'
                                  }`}
                              >
                                {step.label}
                              </h5>
                              <p className="text-[11px] text-espresso/60 dark:text-cream/60 mt-0.5">{step.desc}</p>
                              {currentSelected.timeline?.find((event) => event.status === step.status)?.time && (
                                <p className="mt-1 text-[10px] font-medium text-primary dark:text-primary-hover">
                                  {currentSelected.timeline.find((event) => event.status === step.status)?.time}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Shipping Destination Box */}
                <div className="bg-black/5 dark:bg-cream/5 p-4 rounded-[1.5rem] border border-black/10 dark:border-white/10 text-xs text-espresso dark:text-cream space-y-2">
                  <div className="flex items-center gap-2 font-bold text-espresso dark:text-cream">
                    <MapPin className="w-4 h-4 text-primary dark:text-primary-hover" />
                    <span>
                      عنوان التوصيل:{' '}
                      {currentSelected.shippingAddress?.governorate || 'المحافظة'} -{' '}
                      {currentSelected.shippingAddress?.city || 'المدينة'}
                    </span>
                  </div>
                  <p className="text-espresso/70 dark:text-cream/70 pr-6">
                    {currentSelected.shippingAddress?.streetAddress ||
                      (currentSelected.shippingAddress as any)?.address ||
                      'العنوان التفصيلي'}
                  </p>
                  <p className="text-espresso/50 dark:text-cream/50 pr-6">
                    المستلم:{' '}
                    {currentSelected.shippingAddress?.fullName ||
                      (currentSelected.shippingAddress as any)?.buyerName ||
                      currentSelected.buyerName}{' '}
                    (
                    {currentSelected.shippingAddress?.phone ||
                      (currentSelected.shippingAddress as any)?.buyerPhone ||
                      currentSelected.buyerPhone}
                    )
                  </p>
                </div>

                {/* Items in this order */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-espresso dark:text-cream">القطع المطلوبة في الشحنة:</h4>
                  <div className="divide-y divide-black/5 dark:divide-white/5">
                    {(currentSelected.items || []).filter(Boolean).map((it: any, idx: number) => {
                      const prodId = it?.product?.id || it?.productId || `item-${idx}`;
                      const title = it?.product?.title || it?.productTitle || it?.title || 'منتج تراثي أصيل';
                      const img =
                        it?.product?.images?.[0] ||
                        it?.productImage ||
                        it?.images?.[0] ||
                        it?.image ||
                        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=100&q=80';
                      const sellerName = it?.product?.sellerName || it?.sellerName || 'ورشة الصعيد';
                      const sellerGov = it?.product?.sellerGovernorate || it?.sellerGovernorate || 'قنا';
                      const price = it?.product?.price || it?.unitPrice || it?.price || 0;
                      const qty = it?.quantity || 1;

                      return (
                        <div key={prodId} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={img}
                              alt={title}
                              className="w-12 h-12 rounded-xl object-cover border border-black/10 dark:border-white/10"
                            />
                            <div>
                              <span className="font-bold text-espresso dark:text-cream block">{title}</span>
                              <span className="text-[10px] text-espresso/60 dark:text-cream/60">
                                {sellerName} • محافظة {sellerGov}
                              </span>
                            </div>
                          </div>

                          <div className="text-left">
                            <span className="font-bold text-primary dark:text-primary-hover block">
                              {price * qty} ج.م
                            </span>
                            <span className="text-[10px] text-espresso/50 dark:text-cream/50">الكمية: {qty}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Chat & Actions */}
                <div className="pt-4 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {Boolean(currentSelected.sellerIds?.[0] || currentSelected.items?.[0]?.product?.sellerId) && (
                      <button
                        type="button"
                        onClick={() => {
                          const targetSellerId =
                            currentSelected.sellerIds?.[0] || currentSelected.items?.[0]?.product?.sellerId;
                          openChatWithArtisan({
                            sellerId: targetSellerId,
                            orderId: currentSelected.id,
                            initialMessage: `السلام عليكم، أود التنسيق بخصوص شحن وتوصيل طلبي رقم (${currentSelected.orderNumber || currentSelected.id}).`
                          });
                        }}
                        className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>مراسلة البائع / الورشة لترتيب الشحن</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        openChatWithArtisan({
                          sellerId: 'admin',
                          orderId: currentSelected.id,
                          initialMessage: `السلام عليكم، أود التواصل مع إدارة المنصة بخصوص طلبي رقم (${currentSelected.orderNumber || currentSelected.id}).`
                        });
                      }}
                      className="px-4 py-2.5 bg-primary/15 hover:bg-primary/25 text-primary dark:text-primary-hover text-xs font-bold rounded-xl border border-primary/30 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <MessageSquare className="w-4 h-4 text-primary dark:text-primary-hover" />
                      <span>مراسلة إدارة المنصة</span>
                    </button>
                  </div>

                  {/* Report Issue to Admin Button */}
                  <button
                    type="button"
                    id="report-order-issue-btn"
                    onClick={() =>
                      openReportModal({
                        category: 'order_issue',
                        orderId: currentSelected.id,
                        orderNumber: currentSelected.orderNumber,
                        initialSubject: `مشكلة في الطلب #${currentSelected.orderNumber || currentSelected.id}`
                      })
                    }
                    className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>إبلاغ الإدارة عن مشكلة بالطلب</span>
                  </button>

                  {/* Cancel Order Action for Eligible States */}
                  {['review', 'pending', 'confirmed'].includes(currentSelected.status) && (
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() => handleCancelOrder(currentSelected.id)}
                      className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl border border-rose-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{isCancelling ? 'جاري الإلغاء...' : 'إلغاء هذا الطلب'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
