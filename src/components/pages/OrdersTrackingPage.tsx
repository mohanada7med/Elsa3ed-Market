import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  ChevronRight,
  MapPin,
  FileText,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CreditCard,
  Phone,
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
  const { orders, cancelOrder, refreshOrders, setActivePage, addToast, selectedOrderId, openChatWithArtisan } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Sync selectedOrder when orders or selectedOrderId update
  const currentSelected = selectedOrder
    ? orders.find((o) => o.id === selectedOrder.id) || orders[0] || null
    : (selectedOrderId ? orders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId) : null) || orders[0] || null;

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
    if (!window.confirm('هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ سيتم استرجاع القطع للمخزون فوراً.')) {
      return;
    }

    setIsCancelling(true);
    try {
      await cancelOrder(orderId, 'طلب العميل الإلغاء');
    } catch (err: any) {
      addToast('خطأ في الإلغاء', err?.message || 'تعذر إلغاء الطلب حالياً', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#8c6b53]">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#943310] transition-colors"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="text-gray-900 font-bold">تتبع الشحنات والطلبات</span>
      </nav>

      {/* Page Header */}
      <div className="bg-[#241811] rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
            <Truck className="w-3.5 h-3.5" />
            <span>خدمة التتبع اللحظي لشحنات الصعيد</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heritage">
            تتبع طلباتك ورحلة وصولها من الورشة
          </h1>
          <p className="text-xs text-[#cfc0b3]">
            تابع حالة التجهيز والتحميل في محافظات الصعيد حتى وصولها لباب منزلك بأمان
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => refreshOrders()}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActivePage('products')}
            className="px-5 py-2.5 bg-[#943310] hover:bg-[#7c280a] text-white text-xs font-bold rounded-xl transition-colors"
          >
            تسوق المزيد من القطع
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#ebdccd] p-16 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-[#faf6f0] text-[#943310] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10 opacity-60" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">لا توجد لديك طلبات سابقة حتى الآن</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            عندما تقوم بطلب أي قطعة فخار أو كليم أو عسل ستظهر مسارات الشحن والتتبع هنا بالتفصيل.
          </p>
          <button
            type="button"
            onClick={() => setActivePage('products')}
            className="px-6 py-2.5 bg-[#943310] text-white text-xs font-bold rounded-xl shadow-md"
          >
            استكشف سوق الصعيد
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Orders List Column */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-bold text-sm text-gray-900 px-1">
              قائمة طلباتك ({orders.length})
            </h3>

            <div className="space-y-3">
              {orders.map((ord) => {
                const isSelected = currentSelected?.id === ord.id;
                const isCancelled = ord.status === 'cancelled';
                return (
                  <div
                    key={ord.id}
                    id={`order-card-${ord.id}`}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-white border-[#943310] shadow-md ring-1 ring-[#943310]'
                        : 'bg-white border-[#ebdccd] hover:border-gray-300'
                    } ${isCancelled ? 'opacity-75 bg-gray-50/50' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-xs text-[#943310]">
                        {ord.orderNumber || ord.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'processing'
                            ? 'bg-amber-100 text-amber-800'
                            : ord.status === 'confirmed'
                            ? 'bg-indigo-100 text-indigo-800'
                            : ord.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-gray-100 text-gray-800'
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
                            className="inline-block w-8 h-8 rounded-lg object-cover ring-2 ring-white"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        {ord.items.length} منتجات • {ord.total} ج.م
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                      <span>تاريخ الطلب: {ord.createdAt ? ord.createdAt.substring(0, 10) : 'اليوم'}</span>
                      <span className="text-[#943310] font-semibold">عرض التفاصيل ←</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Order Tracking Timeline Detail */}
          {currentSelected && (
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl border border-[#ebdccd] p-4 sm:p-8 shadow-xs space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0e4d7] pb-4">
                  <div>
                    <span className="text-xs text-[#8c6b53] block">تفاصيل الطلب النشط:</span>
                    <h2 className="text-lg font-bold font-mono text-gray-900">
                      {currentSelected.orderNumber || currentSelected.id}
                    </h2>
                    {currentSelected.trackingNumber && (
                      <span className="text-[11px] text-gray-500 font-mono">
                        رقم التتبع: {currentSelected.trackingNumber}
                      </span>
                    )}
                  </div>

                  <div className="text-left sm:text-left">
                    <span className="text-xs text-gray-400 block">الإجمالي النهائي:</span>
                    <span className="text-lg font-black text-[#943310]">{currentSelected.total} ج.م</span>
                  </div>
                </div>

                {/* Cancelled Banner */}
                {currentSelected.status === 'cancelled' && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
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
                    <h4 className="text-xs font-bold text-gray-900">مراحل الشحن والتجهيز:</h4>

                    <div className="relative pr-6 space-y-6 before:absolute before:right-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#ebdccd]">
                      {STATUS_STEPS.map((step, idx) => {
                        const currentIdx = getStepIndex(currentSelected.status);
                        const isPastOrCurrent = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div key={step.status} className="relative flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 -mr-6.5 ${
                                isPastOrCurrent
                                  ? 'bg-[#943310] text-white ring-4 ring-[#943310]/20'
                                  : 'bg-[#ebdccd] text-gray-400'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>

                            <div className="flex-1">
                              <h5
                                className={`text-xs font-bold ${
                                  isCurrent
                                    ? 'text-[#943310]'
                                    : isPastOrCurrent
                                    ? 'text-gray-900'
                                    : 'text-gray-400'
                                }`}
                              >
                                {step.label}
                              </h5>
                              <p className="text-[11px] text-gray-500 mt-0.5">{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Shipping Destination Box */}
                <div className="bg-[#faf6f0] p-4 rounded-2xl border border-[#ebdccd] text-xs text-gray-700 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-gray-900">
                    <MapPin className="w-4 h-4 text-[#943310]" />
                    <span>
                      عنوان التوصيل:{' '}
                      {currentSelected.shippingAddress?.governorate || 'المحافظة'} -{' '}
                      {currentSelected.shippingAddress?.city || 'المدينة'}
                    </span>
                  </div>
                  <p className="text-gray-600 pr-6">
                    {currentSelected.shippingAddress?.streetAddress ||
                      (currentSelected.shippingAddress as any)?.address ||
                      'العنوان التفصيلي'}
                  </p>
                  <p className="text-gray-500 pr-6">
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
                  <h4 className="text-xs font-bold text-gray-900">القطع المطلوبة في الشحنة:</h4>
                  <div className="divide-y divide-[#f0e4d7]">
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
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                            <div>
                              <span className="font-bold text-gray-900 block">{title}</span>
                              <span className="text-[10px] text-[#8c6b53]">
                                {sellerName} • محافظة {sellerGov}
                              </span>
                            </div>
                          </div>

                          <div className="text-left">
                            <span className="font-bold text-[#943310] block">
                              {price * qty} ج.م
                            </span>
                            <span className="text-[10px] text-gray-400">الكمية: {qty}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Chat & Actions */}
                <div className="pt-4 border-t border-[#ebdccd] flex flex-wrap items-center justify-between gap-3">
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
                    className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-700" />
                    <span>محادثة الحرفي بخصوص هذا الطلب</span>
                  </button>

                  {/* Cancel Order Action for Eligible States */}
                  {['review', 'pending', 'confirmed'].includes(currentSelected.status) && (
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() => handleCancelOrder(currentSelected.id)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
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

