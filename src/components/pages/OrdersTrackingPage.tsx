import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import {
  Truck,
  CheckCircle2,
  ChevronRight,
  MapPin,
  RefreshCw,
  ShoppingBag,
  XCircle,
  MessageSquare
} from 'lucide-react';

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'pending', label: 'تم تسجيل الطلب', desc: 'تم استلام طلبك ومراجعته بالورشة' },
  { status: 'confirmed', label: 'تأكيد الورش الحرفية', desc: 'تم تأكيد توافر القطع وجودة الصنعة اليدوية' },
  { status: 'processing', label: 'التجهيز والتغليف الآمن', desc: 'يتم الآن فحص القطعة وتغليفها بمواد امتصاص الصدمات' },
  { status: 'shipped', label: 'في الطريق مع شحن الصعيد', desc: 'خرجت الشحنة من الصعيد وهي متجهة لمدينتك' },
  { status: 'delivered', label: 'تم الاستلام بنجاح', desc: 'تم تسليم الطلب إلى باب المنزل' }
];

export const OrdersTrackingPage: React.FC = () => {
  const { orders, cancelOrder, refreshOrders, setActivePage, addToast, selectedOrderId, openChatWithArtisan, navigateToOrder, activePage } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

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
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('متأكد إنك عايز تلغي الطلب ده؟ القطع هترجع للمخزون فوراً.')) {
      return;
    }

    setIsCancelling(true);
    try {
      await cancelOrder(orderId, 'المشتري طلب الإلغاء');
    } catch (err: any) {
      addToast('مشكلة في الإلغاء', err?.message || 'ماعرفناش نلغي الطلب دلوقتي، جرّب تاني', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#eee8dc] text-[#211d18] dark:bg-[#0b0b0a] dark:text-[#f5f0e7] max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-8 space-y-8"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#211d18]/60 dark:text-[#f5f0e7]/60 font-medium">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#9a6a35] dark:hover:text-[#d5a56d] transition-colors cursor-pointer"
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
          className="hover:text-[#9a6a35] dark:hover:text-[#d5a56d] transition-colors cursor-pointer"
        >
          الطلبات
        </button>
        {activePage === 'order-details' && currentSelected && (
          <>
            <ChevronRight className="w-3.5 h-3.5 rotate-180 opacity-50" />
            <span className="text-[#211d18] dark:text-[#f5f0e7] font-bold">
              طلب #{currentSelected.orderNumber || currentSelected.id}
            </span>
          </>
        )}
      </nav>

      {/* Page Header */}
      <div className="bg-[#211d18] rounded-[2rem] p-6 sm:p-10 text-[#f5f0e7] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-black/10 dark:border-white/10 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9a6a35]/20 text-[#d5a56d] border border-[#9a6a35]/30 text-xs font-bold">
            <Truck className="w-3.5 h-3.5 text-[#d5a56d]" />
            <span>تتبع شحنتك خطوة بخطوة من الصعيد</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif">
            تابع طلباتك ورحلتها من الورشة لحد عندك
          </h1>
          <p className="text-xs text-[#f5f0e7]/80">
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
            className="px-6 py-3 bg-[#9a6a35] hover:bg-[#7d5427] text-white text-xs font-black rounded-[1.25rem] shadow-lg transition-all hover:scale-[1.02] cursor-pointer min-h-[42px]"
          >
            شوف قطع تانية
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-16 text-center space-y-4 shadow-lg">
          <div className="w-20 h-20 rounded-2xl bg-[#9a6a35]/10 text-[#9a6a35] dark:text-[#d5a56d] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black font-serif text-[#211d18] dark:text-[#f5f0e7]">لسه مفيش أي طلبات طلبتها لحد دلوقتي</h3>
          <p className="text-xs sm:text-sm text-[#211d18]/70 dark:text-[#f5f0e7]/70 max-w-sm mx-auto leading-relaxed">
            أول ما تطلب أي قطعة من الفخار أو الكليم أو العسل، مسار شحنتها وتفاصيلها هتظهرلك هنا أول بأول.
          </p>
          <button
            type="button"
            onClick={() => setActivePage('products')}
            className="px-7 py-3.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-black rounded-[1.25rem] shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
          >
            استكشف سوق وه
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Orders List Column */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-black font-serif text-sm text-[#211d18] dark:text-[#f5f0e7] px-1">
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
                    className={`p-4 rounded-[1.5rem] border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-white/95 dark:bg-[#151513]/95 border-[#9a6a35] shadow-lg ring-1 ring-[#9a6a35]'
                        : 'bg-white/75 dark:bg-[#151513]/90 border-black/10 dark:border-white/10 hover:border-[#9a6a35]/50'
                    } ${isCancelled ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-xs text-[#9a6a35] dark:text-[#d5a56d]">
                        {ord.orderNumber || ord.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20'
                            : ord.status === 'shipped'
                            ? 'bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/20'
                            : ord.status === 'processing'
                            ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20'
                            : ord.status === 'confirmed'
                            ? 'bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d] border border-[#9a6a35]/30'
                            : ord.status === 'cancelled'
                            ? 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20'
                            : 'bg-black/5 text-[#211d18] dark:bg-white/10 dark:text-[#f5f0e7]'
                        }`}
                      >
                        {ord.status === 'cancelled'
                          ? 'ملغي'
                          : STATUS_STEPS.find((s) => s.status === ord.status)?.label || ord.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex -space-x-2 space-x-reverse overflow-hidden">
                        {ord.items.slice(0, 3).map((it, idx) => (
                          <img
                            key={idx}
                            src={it.product.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=100&q=80'}
                            alt=""
                            className="inline-block w-8 h-8 rounded-lg object-cover ring-2 ring-white dark:ring-[#151513]"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-[#211d18]/70 dark:text-[#f5f0e7]/70 font-medium">
                        {ord.items.length} منتجات • {ord.total} ج.م
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#211d18]/50 dark:text-[#f5f0e7]/50 pt-2 border-t border-black/5 dark:border-white/5">
                      <span>تاريخ الطلب: {ord.createdAt ? ord.createdAt.substring(0, 10) : 'اليوم'}</span>
                      <span className="text-[#9a6a35] dark:text-[#d5a56d] font-bold">عرض التفاصيل ←</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Order Tracking Timeline Detail */}
          {currentSelected && (
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-lg space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-4">
                  <div>
                    <span className="text-xs text-[#211d18]/60 dark:text-[#f5f0e7]/60 block">تفاصيل الطلب النشط:</span>
                    <h2 className="text-lg font-black font-mono text-[#211d18] dark:text-[#f5f0e7]">
                      {currentSelected.orderNumber || currentSelected.id}
                    </h2>
                    {currentSelected.trackingNumber && (
                      <span className="text-[11px] text-[#211d18]/60 dark:text-[#f5f0e7]/60 font-mono">
                        رقم التتبع: {currentSelected.trackingNumber}
                      </span>
                    )}
                  </div>

                  <div className="text-left sm:text-left">
                    <span className="text-xs text-[#211d18]/50 dark:text-[#f5f0e7]/50 block">الإجمالي النهائي:</span>
                    <span className="text-xl font-black text-[#9a6a35] dark:text-[#d5a56d]">{currentSelected.total} ج.م</span>
                  </div>
                </div>

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
                    <h4 className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">مراحل الشحن والتجهيز:</h4>

                    <div className="relative pr-6 space-y-6 before:absolute before:right-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-black/10 dark:before:bg-white/10">
                      {STATUS_STEPS.map((step, idx) => {
                        const currentIdx = getStepIndex(currentSelected.status);
                        const isPastOrCurrent = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div key={step.status} className="relative flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 -mr-6.5 ${
                                isPastOrCurrent
                                  ? 'bg-[#9a6a35] text-white ring-4 ring-[#9a6a35]/20'
                                  : 'bg-black/10 dark:bg-white/10 text-stone-400'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>

                            <div className="flex-1">
                              <h5
                                className={`text-xs font-bold ${
                                  isCurrent
                                    ? 'text-[#9a6a35] dark:text-[#d5a56d]'
                                    : isPastOrCurrent
                                    ? 'text-[#211d18] dark:text-[#f5f0e7]'
                                    : 'text-[#211d18]/40 dark:text-[#f5f0e7]/40'
                                }`}
                              >
                                {step.label}
                              </h5>
                              <p className="text-[11px] text-[#211d18]/60 dark:text-[#f5f0e7]/60 mt-0.5">{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Shipping Destination Box */}
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-[1.5rem] border border-black/10 dark:border-white/10 text-xs text-[#211d18] dark:text-[#f5f0e7] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#211d18] dark:text-[#f5f0e7]">
                    <MapPin className="w-4 h-4 text-[#9a6a35] dark:text-[#d5a56d]" />
                    <span>
                      عنوان التوصيل:{' '}
                      {currentSelected.shippingAddress?.governorate || 'المحافظة'} -{' '}
                      {currentSelected.shippingAddress?.city || 'المدينة'}
                    </span>
                  </div>
                  <p className="text-[#211d18]/70 dark:text-[#f5f0e7]/70 pr-6">
                    {currentSelected.shippingAddress?.streetAddress ||
                      (currentSelected.shippingAddress as any)?.address ||
                      'العنوان التفصيلي'}
                  </p>
                  <p className="text-[#211d18]/50 dark:text-[#f5f0e7]/50 pr-6">
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
                  <h4 className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">القطع المطلوبة في الشحنة:</h4>
                  <div className="divide-y divide-black/5 dark:divide-white/5">
                    {(currentSelected.items || []).map((it, idx) => {
                      const prodId = it.product?.id || (it as any).productId || `item-${idx}`;
                      const title = it.product?.title || (it as any).productTitle || 'منتج تراثي أصيل';
                      const img = it.product?.images?.[0] || (it as any).productImage || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=100&q=80';
                      const sellerName = it.product?.sellerName || (it as any).sellerName || 'ورشة الصعيد';
                      const sellerGov = it.product?.sellerGovernorate || (it as any).sellerGovernorate || 'قنا';
                      const price = it.product?.price || (it as any).unitPrice || 0;
                      const qty = it.quantity || 1;

                      return (
                        <div key={prodId} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={img}
                              alt={title}
                              className="w-12 h-12 rounded-xl object-cover border border-black/10 dark:border-white/10"
                            />
                            <div>
                              <span className="font-bold text-[#211d18] dark:text-[#f5f0e7] block">{title}</span>
                              <span className="text-[10px] text-[#211d18]/60 dark:text-[#f5f0e7]/60">
                                {sellerName} • محافظة {sellerGov}
                              </span>
                            </div>
                          </div>

                          <div className="text-left">
                            <span className="font-bold text-[#9a6a35] dark:text-[#d5a56d] block">
                              {price * qty} ج.م
                            </span>
                            <span className="text-[10px] text-[#211d18]/50 dark:text-[#f5f0e7]/50">الكمية: {qty}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Chat & Actions */}
                <div className="pt-4 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const firstItem = currentSelected.items?.[0];
                      const sellerId = firstItem?.product?.sellerId || (firstItem as any)?.sellerId || currentSelected.sellerIds?.[0] || (currentSelected as any).sellerId;
                      openChatWithArtisan({
                        sellerId,
                        orderId: currentSelected.id,
                        initialMessage: `السلام عليكم، أستفسر بخصوص طلبي رقم (${currentSelected.orderNumber || currentSelected.id}).`
                      });
                    }}
                    className="px-4 py-2.5 bg-[#9a6a35]/15 hover:bg-[#9a6a35]/25 text-[#9a6a35] dark:text-[#d5a56d] text-xs font-bold rounded-xl border border-[#9a6a35]/30 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4 text-[#9a6a35] dark:text-[#d5a56d]" />
                    <span>محادثة الحرفي بخصوص هذا الطلب</span>
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
