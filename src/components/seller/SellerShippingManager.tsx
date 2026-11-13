import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Package,
  Truck,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Phone,
  FileText,
  X,
  RefreshCw,
  Eye,
  ShieldCheck,
  MapPin,
  Check,
  Loader2,
  MessageSquare,
  MessageCircle
} from 'lucide-react';
import {
  Order,
  Shipment,
  ShipmentStatus,
  OrderStatus
} from '../../types.ts';
import {
  ORDER_FULFILLMENT_STAGES,
  OrderFulfillmentStageStatus
} from '../../constants/orderFulfillmentStages.ts';
import { api } from '../../services/api.ts';
import { RefreshDataButton } from '../common/RefreshDataButton.tsx';

function getWhatsAppUrl(phone?: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  const normalized = digits.startsWith('01') ? `20${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}`;
}

interface SellerShippingManagerProps {
  currentUser: any;
  orders: Order[];
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => Promise<void>;
  addToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
  confirmModal: (config: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    onConfirm: () => void;
  }) => void;
  openReportModal?: (config?: any) => void;
  openChatWithBuyer?: (params: {
    buyerId: string;
    orderId?: string;
    productId?: string;
    initialMessage?: string;
  }) => Promise<void> | void;
}

export const SellerShippingManager: React.FC<SellerShippingManagerProps> = ({
  currentUser,
  orders,
  refreshOrders,
  addToast,
  openReportModal,
  openChatWithBuyer
}) => {
  // Navigation Sub-tab
  type ShippingTab =
    | 'all'
    | 'progress'
    | 'ready'
    | 'booked'
    | 'awaiting_pickup'
    | 'in_transit'
    | 'delivered'
    | 'issues';

  const [shippingTab, setShippingTab] = useState<ShippingTab>('all');

  // Data states
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Statistics state
  const [stats, setStats] = useState({
    totalCount: 0,
    readyForBookingCount: 0,
    bookedCount: 0,
    awaitingPickupCount: 0,
    inTransitCount: 0,
    deliveredCount: 0,
    failedOrReturnedCount: 0,
    cancelledCount: 0
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);
  const [selectedOrderForBooking, setSelectedOrderForBooking] = useState<Order | null>(null);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [selectedShipmentForUpdate, setSelectedShipmentForUpdate] = useState<Shipment | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [selectedShipmentForHistory, setSelectedShipmentForHistory] = useState<Shipment | null>(null);

  // Direct Shipping Registration Form State
  const [bookingFormData, setBookingFormData] = useState({
    trackingNumber: '',
    shippingLabelRef: '',
    actualShippingCost: 45,
    bookingDate: new Date().toISOString().split('T')[0],
    handoverDate: '',
    notes: '',
    allowReshipment: false
  });

  // Update Status Form State
  const [updateFormData, setUpdateFormData] = useState<{
    status: ShipmentStatus;
    note: string;
    handoverDate: string;
    failureReason: string;
    proofOfDeliveryNote: string;
  }>({
    status: 'awaiting_pickup',
    note: '',
    handoverDate: '',
    failureReason: '',
    proofOfDeliveryNote: ''
  });

  // Fetch shipments and ready orders
  const loadShippingData = useCallback(async () => {
    setIsLoading(true);
    try {
      const sellerUser = { id: currentUser.id, role: 'seller', sellerId: currentUser.id };

      const [shipmentsResult, readyOrdersData] = await Promise.all([
        api.getSellerShipments(sellerUser, {
          search: searchQuery || undefined,
          paymentMethod: filterPayment !== 'all' ? filterPayment : undefined
        }).catch((e) => {
          console.warn('[SellerShippingManager] Failed to load shipments:', e);
          return { shipments: [], stats: null };
        }),
        api.getSellerReadyOrders(sellerUser).catch((e) => {
          console.warn('[SellerShippingManager] Failed to load ready orders:', e);
          return [];
        })
      ]);

      setShipments(shipmentsResult.shipments || []);
      if (shipmentsResult.stats) {
        setStats(shipmentsResult.stats);
      }
      setReadyOrders(readyOrdersData || []);
    } catch (err: any) {
      console.error('[SellerShippingManager] Error loading shipping data:', err);
      addToast('خطأ في جلب البيانات', err.message || 'فشل تحديث بيانات الشحن', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id, searchQuery, filterPayment, addToast]);

  useEffect(() => {
    loadShippingData();
  }, [loadShippingData]);

  // Open direct chat with buyer helper
  const handleChatWithBuyer = (buyerId?: string, orderId?: string, orderNumber?: string, buyerName?: string) => {
    if (!buyerId || buyerId === 'admin') {
      addToast('تنبيه', 'بيانات حساب المشتري غير متوفرة لبدء المحادثة، يمكنك التواصل هاتفياً أو عبر واتساب.', 'info');
      return;
    }
    if (!openChatWithBuyer) {
      addToast('تنبيه', 'خدمة المراسلة قيد التهيئة، انتقل إلى تبويب المراسلات.', 'info');
      return;
    }
    const greeting = `السلام عليكم ${buyerName || ''}، بخصوص شحن وتوصيل طلبك رقم #${orderNumber || orderId || ''}، أود التنسيق معك على موعد ومكان التسليم المناسب لك.`;
    openChatWithBuyer({
      buyerId,
      orderId,
      initialMessage: greeting
    });
  };

  // Open direct shipping modal for a specific order
  const handleOpenBooking = (order: Order) => {
    setSelectedOrderForBooking(order);
    setBookingFormData({
      trackingNumber: '',
      shippingLabelRef: '',
      actualShippingCost: Number(order.shippingFee || 45),
      bookingDate: new Date().toISOString().split('T')[0],
      handoverDate: '',
      notes: '',
      allowReshipment: false
    });
    setIsBookModalOpen(true);
  };

  // Submit direct shipping registration form
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForBooking) return;

    setIsSubmitting(true);
    try {
      const sellerUser = { id: currentUser.id, role: 'seller', sellerId: currentUser.id };
      const created = await api.createSellerShipment(sellerUser, {
        orderId: selectedOrderForBooking.id,
        trackingNumber: bookingFormData.trackingNumber.trim() || undefined,
        shippingLabelRef: bookingFormData.shippingLabelRef.trim() || undefined,
        actualShippingCost: Number(bookingFormData.actualShippingCost) || 0,
        bookingDate: bookingFormData.bookingDate,
        handoverDate: bookingFormData.handoverDate || undefined,
        notes: bookingFormData.notes.trim() || undefined,
        allowReshipment: bookingFormData.allowReshipment
      });

      addToast(
        'تم تسجيل الشحن المباشر',
        `تم تجهيز الشحنة بكود المتابعة ${created.trackingNumber} وإشعار المشتري.`,
        'success'
      );

      setIsBookModalOpen(false);
      setSelectedOrderForBooking(null);
      await Promise.all([loadShippingData(), refreshOrders()]);
    } catch (err: any) {
      console.error('[SellerShippingManager] Direct shipping creation failed:', err);
      addToast('تعذر تسجيل الشحنة', err.message || 'حدث خطأ أثناء تسجيل بيانات الشحن', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open status update modal
  const handleOpenUpdate = (shipment: Shipment) => {
    setSelectedShipmentForUpdate(shipment);
    // Suggest next logical status
    let nextStatus: ShipmentStatus = 'awaiting_pickup';
    if (shipment.status === 'booked') nextStatus = 'awaiting_pickup';
    else if (shipment.status === 'awaiting_pickup') nextStatus = 'picked_up';
    else if (shipment.status === 'picked_up') nextStatus = 'in_transit';
    else if (shipment.status === 'in_transit') nextStatus = 'out_for_delivery';
    else if (shipment.status === 'out_for_delivery') nextStatus = 'delivered';

    setUpdateFormData({
      status: nextStatus,
      note: '',
      handoverDate: shipment.handoverDate || new Date().toISOString().split('T')[0],
      failureReason: '',
      proofOfDeliveryNote: ''
    });
    setIsUpdateModalOpen(true);
  };

  // Submit status update
  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipmentForUpdate) return;

    if (updateFormData.status === 'delivered' && !updateFormData.proofOfDeliveryNote.trim()) {
      addToast('تأكيد الاستلام مطلوب', 'يرجى كتابة ملاحظة أو تأكيد استلام العميل لإتمام تسليم الشحنة.', 'error');
      return;
    }

    if (['failed', 'refused', 'returned'].includes(updateFormData.status) && !updateFormData.failureReason.trim()) {
      addToast('سبب المشكلة إلزامي', 'يرجى توضيح سبب تعذر التسليم أو الارتجاع بالتفصيل', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const sellerUser = { id: currentUser.id, role: 'seller', sellerId: currentUser.id };
      await api.updateSellerShipmentStatus(sellerUser, selectedShipmentForUpdate.id, {
        status: updateFormData.status,
        note: updateFormData.note.trim() || undefined,
        handoverDate: updateFormData.handoverDate || undefined,
        failureReason: updateFormData.failureReason.trim() || undefined,
        proofOfDeliveryNote: updateFormData.proofOfDeliveryNote.trim() || undefined
      });

      addToast('تم تحديث مسار الشحنة', 'تم تحديث حالة الشحنة والطلب وتسجيل حركة التتبع بنجاح', 'success');
      setIsUpdateModalOpen(false);
      setSelectedShipmentForUpdate(null);
      await Promise.all([loadShippingData(), refreshOrders()]);
    } catch (err: any) {
      console.error('[SellerShippingManager] Status update failed:', err);
      addToast('تعذر تحديث الشحنة', err.message || 'حدث خطأ أثناء تحديث المسار', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOrderStage = async (order: Order, status: OrderFulfillmentStageStatus) => {
    if (order.status === status || updatingOrderId) return;

    setUpdatingOrderId(order.id);
    try {
      await api.updateSellerOrderStatus(
        { id: currentUser.id, role: 'seller', sellerId: currentUser.sellerId || currentUser.id },
        order.id,
        status
      );
      await Promise.all([refreshOrders(), loadShippingData()]);
      const stage = ORDER_FULFILLMENT_STAGES.find((item) => item.status === status);
      addToast(
        'تم تحديث مرحلة الطلب',
        `الطلب #${order.orderNumber || order.id} أصبح في مرحلة «${stage?.label || status}» وتم إشعار المشتري.`,
        'success'
      );
    } catch (err: any) {
      console.error('[SellerShippingManager] Order stage update failed:', err);
      addToast('تعذر تحديث المرحلة', err?.message || 'حدث خطأ أثناء تحديث مرحلة الطلب', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Status Badge Colors & Labels
  const getShipmentStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'not_booked':
        return { label: 'لم تُجهّز بعد', color: 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700' };
      case 'booked':
        return { label: 'تم التجهيز', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
      case 'awaiting_pickup':
        return { label: 'قيد التنسيق مع المشتري', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
      case 'picked_up':
        return { label: 'جاهزة للخروج', color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' };
      case 'in_transit':
        return { label: 'قيد التوصيل المباشر', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' };
      case 'out_for_delivery':
        return { label: 'خرج للتوصيل', color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' };
      case 'delivered':
        return { label: 'تم التسليم بنجاح', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
      case 'failed':
        return { label: 'تعذر التسليم', color: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800' };
      case 'refused':
        return { label: 'رفض العميل الاستلام', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' };
      case 'returned':
        return { label: 'مرتجع للورشة', color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' };
      case 'cancelled':
        return { label: 'شحنة ملغاة', color: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800' };
      default:
        return { label: status, color: 'bg-black/5 text-black/70 dark:text-white/70 border-black/10' };
    }
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'طلب جديد', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' };
      case 'review':
        return { label: 'مراجعة الدفع', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' };
      case 'confirmed':
        return { label: 'تأكيد الورشة', color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300' };
      case 'processing':
        return { label: 'قيد التجهيز والتغليف', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300' };
      case 'shipped':
        return { label: 'تم تسليمها للشحن', color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300' };
      case 'out_for_delivery':
        return { label: 'خرجت للتوصيل', color: 'bg-teal-500/10 text-teal-700 dark:text-teal-300' };
      case 'delivered':
        return { label: 'مكتمل التسليم', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' };
      case 'cancelled':
        return { label: 'طلب ملغي', color: 'bg-rose-500/10 text-rose-700 dark:text-rose-400' };
      default:
        return { label: status, color: 'bg-black/5 text-black/70 dark:text-white/70' };
    }
  };

  // Filter shipments based on current active shipping tab
  const displayedShipments = useMemo(() => {
    switch (shippingTab) {
      case 'booked':
        return shipments.filter((s) => s.status === 'booked');
      case 'awaiting_pickup':
        return shipments.filter((s) => s.status === 'awaiting_pickup');
      case 'in_transit':
        return shipments.filter((s) => ['picked_up', 'in_transit', 'out_for_delivery'].includes(s.status));
      case 'delivered':
        return shipments.filter((s) => s.status === 'delivered');
      case 'issues':
        return shipments.filter((s) => ['failed', 'refused', 'returned'].includes(s.status));
      case 'ready':
      case 'all':
      default:
        return shipments;
    }
  }, [shipments, shippingTab]);

  const ordersInProgress = useMemo(
    () =>
      orders
        .filter((order) => !['review', 'cancelled', 'delivered'].includes(order.status))
        .filter((order) => {
          if (!searchQuery.trim()) return true;
          const query = searchQuery.trim().toLowerCase();
          return (
            order.orderNumber.toLowerCase().includes(query) ||
            order.buyerName.toLowerCase().includes(query)
          );
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders, searchQuery]
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* 1. Header Banner & Actions */}
      <div className="bg-white/75 dark:bg-espresso-900/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-lg backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold mb-2">
              <Truck className="w-3.5 h-3.5" />
              <span>الشحن المباشر والتواصل مع المشتري</span>
            </div>
            <h3 className="font-bold text-2xl text-espresso dark:text-cream font-cairo">
              نسّق الشحن مع المشتري وتابع التوصيل
            </h3>
            <p className="text-xs text-black/60 dark:text-white/60 mt-1 max-w-2xl leading-relaxed font-medium">
              تواصل مع المشتري مباشرة عبر الشات أو الهاتف أو واتساب لتنسيق موعد وعنوان التسليم، وسجّل الشحنة وتابع تسليمها حتى الوصول.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <RefreshDataButton
              onRefresh={async () => {
                await Promise.all([loadShippingData(), refreshOrders()]);
              }}
              label="حدّث الطلبات"
            />
          </div>
        </div>

        {/* 2. Statistical KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-black/10 dark:border-white/10">
          {/* Ready Orders */}
          <button
            type="button"
            onClick={() => setShippingTab('ready')}
            className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
              shippingTab === 'ready'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-200 shadow-sm'
                : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/10 hover:border-amber-500/30'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
              <span>جاهز للتنسيق</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black font-black text-espresso dark:text-cream">
              {stats.readyForBookingCount}
            </div>
            <span className="text-[10px] text-black/50 dark:text-white/50">طلبات جديدة ومؤكدة</span>
          </button>

          {/* Booked */}
          <button
            type="button"
            onClick={() => setShippingTab('booked')}
            className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
              shippingTab === 'booked'
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-900 dark:text-blue-200 shadow-sm'
                : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/10 hover:border-blue-500/30'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
              <span>تم التجهيز</span>
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black font-black text-espresso dark:text-cream">
              {stats.bookedCount}
            </div>
            <span className="text-[10px] text-black/50 dark:text-white/50">شحنات مسجلة</span>
          </button>

          {/* Awaiting Pickup */}
          <button
            type="button"
            onClick={() => setShippingTab('awaiting_pickup')}
            className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
              shippingTab === 'awaiting_pickup'
                ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-900 dark:text-indigo-200 shadow-sm'
                : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/10 hover:border-indigo-500/30'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
              <span>قيد التنسيق</span>
              <Package className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black font-black text-espresso dark:text-cream">
              {stats.awaitingPickupCount}
            </div>
            <span className="text-[10px] text-black/50 dark:text-white/50">بانتظار التسليم</span>
          </button>

          {/* In Transit */}
          <button
            type="button"
            onClick={() => setShippingTab('in_transit')}
            className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
              shippingTab === 'in_transit'
                ? 'bg-purple-500/15 border-purple-500/40 text-purple-900 dark:text-purple-200 shadow-sm'
                : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/10 hover:border-purple-500/30'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
              <span>قيد الشحن والتوصيل</span>
              <Truck className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black font-black text-espresso dark:text-cream">
              {stats.inTransitCount}
            </div>
            <span className="text-[10px] text-black/50 dark:text-white/50">في الطريق للعميل</span>
          </button>

          {/* Delivered */}
          <button
            type="button"
            onClick={() => setShippingTab('delivered')}
            className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
              shippingTab === 'delivered'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-900 dark:text-emerald-200 shadow-sm'
                : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/10 hover:border-emerald-500/30'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              <span>تم التسليم</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black font-black text-espresso dark:text-cream">
              {stats.deliveredCount}
            </div>
            <span className="text-[10px] text-black/50 dark:text-white/50">تسليم موثق بنجاح</span>
          </button>

          {/* Issues / Returns */}
          <button
            type="button"
            onClick={() => setShippingTab('issues')}
            className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
              shippingTab === 'issues'
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-900 dark:text-rose-200 shadow-sm'
                : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/10 hover:border-rose-500/30'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
              <span>تعذر أو مرتجع</span>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black font-black text-espresso dark:text-cream">
              {stats.failedOrReturnedCount}
            </div>
            <span className="text-[10px] text-black/50 dark:text-white/50">تتطلب متابعة الورشة</span>
          </button>
        </div>
      </div>

      {/* 3. Section Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-black/10 dark:border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setShippingTab('progress')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            shippingTab === 'progress'
              ? 'bg-primary text-cream shadow-sm'
              : 'bg-white/60 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/5'
          }`}
        >
          <span>مراحل الطلبات</span>
          {ordersInProgress.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-black">
              {ordersInProgress.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShippingTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            shippingTab === 'all'
              ? 'bg-primary text-cream shadow-sm'
              : 'bg-white/60 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/5'
          }`}
        >
          كل الشحنات المسجلة ({shipments.length})
        </button>

        <button
          type="button"
          onClick={() => setShippingTab('ready')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            shippingTab === 'ready'
              ? 'bg-primary text-cream shadow-sm'
              : 'bg-white/60 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/5'
          }`}
        >
          <span>طلبات جاهزة للتنسيق والشحن</span>
          {readyOrders.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-black">
              {readyOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* 4. Search and Filters Bar */}
      <div className="bg-white/60 dark:bg-espresso-900/60 rounded-2xl border border-black/10 dark:border-white/10 p-4 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-black/40 dark:text-white/40 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم الطلب، مرجع الشحنة، أو اسم المشتري..."
            className="w-full pl-3 pr-9 py-2 bg-white/80 dark:bg-cream/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-primary text-espresso dark:text-cream"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filter by Payment Method */}
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-3 py-2 bg-white/80 dark:bg-cream/5 border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold text-espresso dark:text-cream outline-none cursor-pointer focus:border-primary"
          >
            <option value="all">كل طرق الدفع</option>
            <option value="cod">دفع عند الاستلام (COD)</option>
            <option value="online">دفع إلكتروني (Online)</option>
          </select>

          {/* Clear filters button if active */}
          {(searchQuery || filterPayment !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterPayment('all');
              }}
              className="px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            >
              مسح التصفية
            </button>
          )}
        </div>
      </div>

      {/* ORDER FULFILLMENT STAGE MANAGEMENT */}
      {shippingTab === 'progress' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-espresso dark:text-cream flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span>مراحل تجهيز وتوصيل الطلبات ({ordersInProgress.length})</span>
            </h4>
            <span className="text-xs text-black/50 dark:text-white/50">
              تغيير المرحلة يُحدّث مسار المشتري ويرسل له إشعاراً
            </span>
          </div>

          {ordersInProgress.length === 0 ? (
            <div className="p-12 text-center bg-white/60 dark:bg-espresso-900/60 rounded-2xl border border-dashed border-black/10 dark:border-white/10 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-espresso dark:text-cream">لا توجد طلبات تحتاج إلى تحديث مرحلة حالياً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {ordersInProgress.map((order) => {
                const currentStage = ORDER_FULFILLMENT_STAGES.find((stage) => stage.status === order.status);
                const isUpdating = updatingOrderId === order.id;

                return (
                  <article
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/70 dark:bg-cream/[0.03] rounded-2xl border border-black/10 dark:border-white/10"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black font-bold text-sm text-primary">
                          #{order.orderNumber || order.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getOrderStatusBadge(order.status).color}`}>
                          {currentStage?.label || getOrderStatusBadge(order.status).label}
                        </span>
                        <span className="text-xs text-black/60 dark:text-white/60">
                          المشتري: {order.shippingAddress?.fullName || order.buyerName}
                        </span>
                      </div>
                      {currentStage && (
                        <p className="mt-1 text-[11px] text-black/55 dark:text-white/55">
                          {currentStage.desc}
                          {currentStage.eta ? ` • ${currentStage.eta}` : ''}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(order.items || []).map((item, index) => (
                          <div
                            key={`${item.product.id}-${index}`}
                            className="flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-2"
                          >
                            <img
                              src={item.product.images?.[0] || '/mascot/empty-search.png'}
                              alt={item.product.title}
                              className="h-10 w-10 rounded-lg object-cover"
                              loading="lazy"
                            />
                            <div className="min-w-0">
                              <p className="max-w-[200px] truncate text-[11px] font-bold text-espresso dark:text-cream">
                                {item.product.title}
                              </p>
                              <p className="text-[10px] text-black/55 dark:text-white/55">
                                كود المنتج: #{item.product.id.slice(0, 8)} • الكمية: {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-bold text-espresso dark:text-cream shrink-0">
                      <span>تحديث المرحلة</span>
                      <select
                        value={order.status}
                        disabled={Boolean(updatingOrderId)}
                        onChange={(event) => {
                          const stage = ORDER_FULFILLMENT_STAGES.find((item) => item.status === event.currentTarget.value);
                          if (stage) void handleUpdateOrderStage(order, stage.status);
                        }}
                        className="max-w-[220px] px-3 py-2 bg-white/90 dark:bg-espresso-800 border border-black/15 dark:border-white/15 rounded-xl text-xs font-bold text-primary outline-none focus:border-primary disabled:opacity-60"
                      >
                        {ORDER_FULFILLMENT_STAGES.map((stage) => (
                          <option key={stage.status} value={stage.status}>
                            {stage.label}
                          </option>
                        ))}
                      </select>
                      {isUpdating && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    </label>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB VIEW: READY ORDERS FOR DIRECT SHIPPING */}
      {shippingTab === 'ready' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-espresso dark:text-cream flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>طلبات مؤكدة جاهزة للتواصل مع المشتري والشحن ({readyOrders.length})</span>
            </h4>
            <span className="text-xs text-black/50 dark:text-white/50">
              تواصل مع المشتري لتنسيق التسليم ثم اضغط «تسجيل الشحن المباشر»
            </span>
          </div>

          {readyOrders.length === 0 ? (
            <div className="p-12 text-center bg-white/60 dark:bg-espresso-900/60 rounded-2xl border border-dashed border-black/10 dark:border-white/10 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-espresso dark:text-cream">
                رائع! جميع طلبات منتجاتك المؤكدة تم تسجيل شحنها المباشر.
              </p>
              <p className="text-[11px] text-black/50 dark:text-white/50">
                عند ورود طلبات شراء جديدة سيتم إدراجها هنا فوراً للتواصل مع المشتري وتنسيق التوصيل.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {readyOrders.map((ord) => {
                const isCOD = ord.paymentMethod === 'cod' || ord.paymentMethod === 'cash_on_delivery';
                const buyerPhone = ord.shippingAddress?.phone || ord.buyerPhone;
                const buyerDisplayName = ord.shippingAddress?.fullName || ord.buyerName;
                const waUrl = getWhatsAppUrl(buyerPhone);

                return (
                  <div
                    key={ord.id}
                    className="p-5 bg-white/70 dark:bg-cream/[0.03] rounded-2xl border border-black/10 dark:border-white/10 hover:border-primary/40 transition-all space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black font-bold text-sm text-primary">
                            #{ord.orderNumber || ord.id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getOrderStatusBadge(ord.status).color}`}>
                            {getOrderStatusBadge(ord.status).label}
                          </span>
                        </div>
                        <span className="text-xs text-black/60 dark:text-white/60 mt-0.5 block">
                          تاريخ الطلب: {new Date(ord.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Chat with Buyer Action */}
                        <button
                          type="button"
                          onClick={() => handleChatWithBuyer(ord.buyerId, ord.id, ord.orderNumber, buyerDisplayName)}
                          className="px-3.5 py-2 rounded-xl bg-amber-600/15 hover:bg-amber-600/25 text-amber-800 dark:text-amber-200 border border-amber-600/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>مراسلة المشتري للشحن</span>
                        </button>

                        {buyerPhone && (
                          <a
                            href={`tel:${buyerPhone}`}
                            className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-espresso dark:text-cream text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                          >
                            <Phone className="w-3.5 h-3.5 text-primary" />
                            <span>اتصال</span>
                          </a>
                        )}

                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>واتساب</span>
                          </a>
                        )}

                        {/* Register Direct Shipping Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenBooking(ord)}
                          className="px-4 py-2 rounded-xl bg-primary text-cream hover:bg-primary-hover text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>تسجيل الشحن المباشر</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(ord.items || []).filter(Boolean).map((item: any, index: number) => {
                        const product = item?.product || {};
                        const productId = product.id || item.productId || `item-${index}`;
                        const productTitle = product.title || item.productTitle || item.title || 'منتج تراثي أصيل';
                        const productImage =
                          product.images?.[0] ||
                          product.image ||
                          item.productImage ||
                          item.image ||
                          '/mascot/empty-search.png';

                        return (
                          <div
                            key={`${productId}-${index}`}
                            className="flex items-center gap-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-3"
                          >
                            <img
                              src={productImage}
                              alt={productTitle}
                              className="h-12 w-12 rounded-lg object-cover shrink-0"
                              loading="lazy"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-espresso dark:text-cream">{productTitle}</p>
                              <p className="text-[10px] text-black/55 dark:text-white/55">
                                كود المنتج: #{String(productId).slice(0, 8)} • الكمية: {item.quantity || 1}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order Details & Address */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="font-bold text-espresso dark:text-cream block mb-1">
                          بيانات المشتري المستلم:
                        </span>
                        <p className="text-black/70 dark:text-white/70 font-medium">
                          {buyerDisplayName}
                        </p>
                        <p className="font-black text-black/60 dark:text-white/60">
                          {buyerPhone}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-espresso dark:text-cream block mb-1">
                          عنوان التوصيل والشحن:
                        </span>
                        <p className="text-black/70 dark:text-white/70 flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>
                            {ord.shippingAddress?.governorate} - {ord.shippingAddress?.city}
                            {ord.shippingAddress?.streetAddress ? `، ${ord.shippingAddress.streetAddress}` : ''}
                          </span>
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-espresso dark:text-cream block mb-1">
                          طريقة الدفع وإجمالي الفاتورة:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isCOD ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            {isCOD ? 'دفع عند الاستلام (COD)' : 'مدفوع إلكترونياً (Online)'}
                          </span>
                          <span className="font-bold text-primary font-black">
                            {Number(ord.total || 0).toLocaleString('ar-EG')} ج.م
                          </span>
                        </div>
                        {isCOD && (
                          <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-1 font-bold">
                            * مطلوب تحصيل {Number(ord.total || 0).toLocaleString('ar-EG')} ج.م عند التسليم للمشتري
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. TAB VIEW: SHIPMENTS LIST */}
      {shippingTab !== 'ready' && shippingTab !== 'progress' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-espresso dark:text-cream flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              <span>الشحنات المباشرة المسجلة ({displayedShipments.length})</span>
            </h4>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-xs text-black/50 dark:text-white/50 flex items-center justify-center gap-2 bg-white/40 dark:bg-espresso-900/40 rounded-2xl border border-black/10 dark:border-white/10">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span>جاري تحميل بيانات الشحنات المحدثة...</span>
            </div>
          ) : displayedShipments.length === 0 ? (
            <div className="p-12 text-center bg-white/60 dark:bg-espresso-900/60 rounded-2xl border border-dashed border-black/10 dark:border-white/10 space-y-2">
              <Package className="w-8 h-8 text-black/30 dark:text-white/30 mx-auto" />
              <p className="text-xs font-bold text-espresso dark:text-cream">
                لا توجد شحنات مطابقة لمعايير البحث والتصفية المحددة.
              </p>
              <button
                type="button"
                onClick={() => setShippingTab('ready')}
                className="mt-2 px-3 py-1.5 text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded-xl font-bold cursor-pointer transition-colors"
              >
                عرض الطلبات الجاهزة للحجز الآن
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedShipments.map((shipment) => {
                const isCOD = shipment.paymentMethod === 'cod' || shipment.paymentMethod === 'cash_on_delivery';
                const statusMeta = getShipmentStatusBadge(shipment.status);
                const waUrl = getWhatsAppUrl(shipment.buyerPhone);

                return (
                  <div
                    key={shipment.id}
                    className="p-5 bg-white/75 dark:bg-espresso-900/80 rounded-2xl border border-black/10 dark:border-white/10 hover:border-primary/40 transition-all space-y-4 shadow-sm"
                  >
                    {/* Header: Tracking #, Direct Shipping Badge, Status Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black font-bold text-sm text-primary">
                            مرجع الشحنة: {shipment.trackingNumber}
                          </span>

                          <span className="text-xs text-black/60 dark:text-white/60">
                            (طلب #{shipment.orderNumber})
                          </span>

                          {/* Shipment Status Badge */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusMeta.color}`}>
                            {statusMeta.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-black/60 dark:text-white/60 mt-1">
                          <span className="font-bold text-espresso dark:text-cream">
                            شحن مباشر بالتنسيق مع المشتري
                          </span>
                          <span>•</span>
                          <span>تاريخ التجهيز: {new Date(shipment.bookingDate || shipment.createdAt).toLocaleDateString('ar-EG')}</span>
                          {shipment.handoverDate && (
                            <>
                              <span>•</span>
                              <span>موعد التسليم: {new Date(shipment.handoverDate).toLocaleDateString('ar-EG')}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Direct Chat with Buyer */}
                        <button
                          type="button"
                          onClick={() => handleChatWithBuyer(shipment.buyerId, shipment.orderId, shipment.orderNumber, shipment.buyerName)}
                          className="px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-600/15 hover:bg-amber-600/25 border border-amber-600/30 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>مراسلة المشتري</span>
                        </button>

                        {shipment.buyerPhone && (
                          <a
                            href={`tel:${shipment.buyerPhone}`}
                            className="px-2.5 py-1.5 text-xs font-bold text-espresso dark:text-cream bg-black/5 dark:bg-white/5 hover:bg-black/10 rounded-xl flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
                          >
                            <Phone className="w-3 h-3 text-primary" />
                            <span>اتصال</span>
                          </a>
                        )}

                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 rounded-xl flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>واتساب</span>
                          </a>
                        )}

                        {/* Tracking History / Checkpoints */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedShipmentForHistory(shipment);
                            setIsHistoryModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-black/70 dark:text-white/70 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                        >
                          <Eye className="w-3 h-3" />
                          <span>سجل المسار ({shipment.events?.length || 1})</span>
                        </button>

                        {/* Update Status Button */}
                        {shipment.status !== 'delivered' && shipment.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => handleOpenUpdate(shipment)}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-transform active:scale-95 whitespace-nowrap shrink-0"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>تحديث الحالة</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content Details: Recipient, Independent Payment & COD Badges */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Recipient Details */}
                      <div>
                        <span className="font-bold text-espresso dark:text-cream block mb-1">
                          المستلم والعنوان:
                        </span>
                        <p className="font-medium text-black/80 dark:text-white/80">
                          {shipment.buyerName}
                        </p>
                        <p className="font-black text-black/60 dark:text-white/60 mb-1">
                          {shipment.buyerPhone}
                        </p>
                        <p className="text-black/60 dark:text-white/60 flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>
                            {shipment.shippingAddress?.governorate} - {shipment.shippingAddress?.city}
                            {shipment.shippingAddress?.streetAddress ? `، ${shipment.shippingAddress.streetAddress}` : ''}
                          </span>
                        </p>
                      </div>

                      {/* Products Summary & Cost */}
                      <div>
                        <span className="font-bold text-espresso dark:text-cream block mb-1">
                          تفاصيل المحتويات وتكلفة الشحن:
                        </span>
                        <p className="text-black/70 dark:text-white/70 line-clamp-2 mb-1">
                          {shipment.itemsSummary}
                        </p>
                        <div className="flex items-center gap-2 text-black/60 dark:text-white/60">
                          <span>تكلفة الشحن المسجلة:</span>
                          <span className="font-bold text-espresso dark:text-cream font-black">
                            {Number(shipment.actualShippingCost || 0).toLocaleString('ar-EG')} ج.م
                          </span>
                        </div>
                      </div>

                      {/* Independent States: Payment, COD Collection, Settlement */}
                      <div className="space-y-1.5 bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-xl border border-black/5 dark:border-white/5">
                        <span className="font-bold text-espresso dark:text-cream block text-[11px]">
                          الأوضاع المالية والتحصيل:
                        </span>

                        {/* Payment Method Badge */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-black/60 dark:text-white/60">طريقة الدفع:</span>
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            isCOD ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            {isCOD ? 'دفع عند الاستلام (COD)' : 'مدفوع إلكترونياً (Online)'}
                          </span>
                        </div>

                        {/* Expected COD Collection */}
                        {isCOD && (
                          <div className="flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-300 border-t border-black/5 dark:border-white/5 pt-1">
                            <span>تحصيل عند التسليم:</span>
                            <span className="font-black text-sm">
                              {Number(shipment.codAmount || 0).toLocaleString('ar-EG')} ج.م
                            </span>
                          </div>
                        )}

                        {/* COD Collection Status */}
                        {isCOD && (
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-black/60 dark:text-white/60">حالة تحصيل COD:</span>
                            <span className="font-bold">
                              {shipment.codCollectionStatus === 'collected_by_carrier'
                                ? '✓ تم التحصيل من العميل'
                                : shipment.codCollectionStatus === 'settled_to_seller'
                                ? '✓ تم توريد المبلغ للورشة'
                                : 'بانتظار الاستلام من المشتري'}
                            </span>
                          </div>
                        )}

                        {/* Settlement Status */}
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-black/60 dark:text-white/60">تسوية مستحقات الورشة:</span>
                          <span className="font-bold text-primary">
                            {shipment.sellerSettlementStatus === 'ready_for_payout'
                              ? 'جاهزة للصرف والمطالبة'
                              : shipment.sellerSettlementStatus === 'paid'
                              ? 'تم التحويل'
                              : 'قيد المراجعة الدورية'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Notice for Failure or Proof of Delivery */}
                    {shipment.failureReason && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <strong>سبب تعذر التسليم أو الارتجاع: </strong>
                          {shipment.failureReason}
                        </div>
                      </div>
                    )}

                    {shipment.proofOfDeliveryNote && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <strong>تأكيد التسليم للمشتري: </strong>
                          {shipment.proofOfDeliveryNote}
                        </div>
                      </div>
                    )}

                    {/* Footer Report Issue Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-xs">
                      <span className="text-[11px] text-black/50 dark:text-white/50">
                        {shipment.notes ? `ملاحظات: ${shipment.notes}` : 'لا توجد ملاحظات إضافية'}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          openReportModal?.({
                            category: 'shipping_issue',
                            orderId: shipment.orderId,
                            orderNumber: shipment.orderNumber,
                            initialSubject: `مشكلة في شحنة الطلب #${shipment.orderNumber} (${shipment.trackingNumber})`
                          })
                        }
                        className="text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 font-bold text-[11px] cursor-pointer"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>إبلاغ الإدارة عن مشكلة شحن</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 1: DIRECT SHIPPING REGISTRATION & BUYER COORDINATION */}
      {/* ================================================================= */}
      {isBookModalOpen && selectedOrderForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-espresso-900 rounded-3xl border border-black/10 dark:border-white/10 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <div>
                <h4 className="font-bold text-xl text-espresso dark:text-cream font-cairo">
                  تسجيل وتنسيق الشحن المباشر
                </h4>
                <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">
                  طلب #{selectedOrderForBooking.orderNumber || selectedOrderForBooking.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 flex items-center justify-center text-black/70 dark:text-white/70 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Coordination Notice */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>الشحن المباشر بين البائع والمشتري: </strong>
                تواصل مع المشتري عبر الشات أو الهاتف لتحديد طريقة وموعد التسليم المناسب، ثم احفظ سجل الشحنة هنا لإعلام المشتري ومتابعة التسليم.
              </div>
            </div>

            {/* Order Summary Snapshot */}
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 space-y-2 text-xs">
              <div className="flex justify-between items-center text-black/70 dark:text-white/70">
                <span>المشتري:</span>
                <strong className="text-espresso dark:text-cream">
                  {selectedOrderForBooking.shippingAddress?.fullName || selectedOrderForBooking.buyerName}
                </strong>
              </div>

              <div className="flex justify-between items-center text-black/70 dark:text-white/70">
                <span>العنوان:</span>
                <span className="font-medium text-espresso dark:text-cream">
                  {selectedOrderForBooking.shippingAddress?.governorate} - {selectedOrderForBooking.shippingAddress?.city}
                </span>
              </div>

              <div className="flex justify-between items-center text-black/70 dark:text-white/70">
                <span>طريقة الدفع:</span>
                <span className="font-bold text-primary">
                  {selectedOrderForBooking.paymentMethod === 'cod' || selectedOrderForBooking.paymentMethod === 'cash_on_delivery'
                    ? `دفع عند الاستلام (مطلوب تحصيل ${Number(selectedOrderForBooking.total).toLocaleString('ar-EG')} ج.م)`
                    : 'مدفوع إلكترونياً (Online)'}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Optional Tracking/Reference Number Input */}
              <div>
                <label className="block text-xs font-bold text-espresso dark:text-cream mb-1.5">
                  رقم مرجعي للشحنة (اختياري)
                </label>
                <input
                  type="text"
                  value={bookingFormData.trackingNumber}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, trackingNumber: e.target.value })}
                  placeholder="اختياري — يُولّد كود تلقائي (WAH-...) لو تركته فارغاً"
                  className="w-full px-3.5 py-2.5 bg-white/90 dark:bg-espresso-800 border border-black/15 dark:border-white/15 rounded-xl text-xs font-black font-bold text-espresso dark:text-cream outline-none focus:border-primary"
                />
              </div>

              {/* Actual Shipping Cost & Booking Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-espresso dark:text-cream mb-1.5">
                    تكلفة التوصيل المتفق عليها (ج.م)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={bookingFormData.actualShippingCost}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, actualShippingCost: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2.5 bg-white/90 dark:bg-espresso-800 border border-black/15 dark:border-white/15 rounded-xl text-xs font-black font-bold text-espresso dark:text-cream outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-espresso dark:text-cream mb-1.5">
                    تاريخ تجهيز الشحنة *
                  </label>
                  <input
                    type="date"
                    value={bookingFormData.bookingDate}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, bookingDate: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-white/90 dark:bg-espresso-800 border border-black/15 dark:border-white/15 rounded-xl text-xs font-bold text-espresso dark:text-cream outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Handover Date */}
              <div>
                <label className="block text-xs font-bold text-espresso dark:text-cream mb-1.5">
                  تاريخ التسليم المتوقع للعميل (اختياري)
                </label>
                <input
                  type="date"
                  value={bookingFormData.handoverDate}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, handoverDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/90 dark:bg-espresso-800 border border-black/15 dark:border-white/15 rounded-xl text-xs font-bold text-espresso dark:text-cream outline-none focus:border-primary"
                />
              </div>

              {/* Shipment Notes */}
              <div>
                <label className="block text-xs font-bold text-espresso dark:text-cream mb-1.5">
                  تفاصيل الاتفاق مع المشتري وتغليف الطرد (اختياري)
                </label>
                <textarea
                  rows={2}
                  value={bookingFormData.notes}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, notes: e.target.value })}
                  placeholder="مثال: تم الاتفاق مع المشتري على التوصيل غداً الساعة 5 مساءً..."
                  className="w-full px-3.5 py-2.5 bg-white/90 dark:bg-espresso-800 border border-black/15 dark:border-white/15 rounded-xl text-xs text-espresso dark:text-cream outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-black/70 dark:text-white/70 hover:bg-black/5 cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-primary text-cream hover:bg-primary-hover text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري تسجيل الشحنة...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تأكيد تسجيل الشحن المباشر</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 2: UPDATE SHIPMENT STATUS ACCORDING TO LIFECYCLE */}
      {/* ================================================================= */}
      {isUpdateModalOpen && selectedShipmentForUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-espresso-900 rounded-3xl border border-black/10 dark:border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <div>
                <h4 className="font-bold text-xl text-espresso dark:text-cream font-cairo">
                  تحديث مسار وحالة الشحنة
                </h4>
                <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">
                  مرجع الشحنة: {selectedShipmentForUpdate.trackingNumber} • شحن مباشر
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 flex items-center justify-center text-black/70 dark:text-white/70 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              {/* Select Status */}
              <div>
                <label className="block text-xs font-bold text-espresso dark:text-cream mb-1.5">
                  الحالة الجديدة للشحنة *
                </label>
                <select
                  value={updateFormData.status}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, status: e.target.value as ShipmentStatus })}
                  required
                  className="w-full px-3.5 py-2.5 bg-white/90 dark:bg-espresso-800 border border-black/15 dark:border-white/15 rounded-xl text-xs font-bold text-primary outline-none focus:border-primary"
                >
                  <option value="awaiting_pickup">جاري التجهيز والتنسيق مع المشتري</option>
                  <option value="picked_up">تم تجهيز الشحنة للخروج للتوصيل</option>
                  <option value="in_transit">قيد التوصيل المباشر نحو المشتري</option>
                  <option value="out_for_delivery">خرجت للتوصيل لعنوان المشتري</option>
                  <option value="delivered">تم التسليم بنجاح للعميل (Delivered)</option>
                  <option value="failed">تعذر التسليم / مشكلة بالعنوان أو الهاتف</option>
                  <option value="refused">رفض العميل الاستلام</option>
                  <option value="returned">مرتجع إلى الورشة</option>
                </select>
              </div>

              {/* Handover Date (if moving to picked_up) */}
              {updateFormData.status === 'picked_up' && (
                <div>
                  <label className="block text-xs font-bold text-espresso dark:text-cream mb-1.5">
                    تاريخ خروج الشحنة للتوصيل *
                  </label>
                  <input
                    type="date"
                    value={updateFormData.handoverDate}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, handoverDate: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-white/90 dark:bg-espresso-800 border border-black/15 dark:border-white/15 rounded-xl text-xs font-bold text-espresso dark:text-cream outline-none focus:border-primary"
                  />
                </div>
              )}

              {/* Required Confirmation Note for 'delivered' */}
              {updateFormData.status === 'delivered' && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="w-4 h-4" />
                    <span>تأكيد استلام العميل (إلزامي للتوثيق) *</span>
                  </div>
                  <input
                    type="text"
                    value={updateFormData.proofOfDeliveryNote}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, proofOfDeliveryNote: e.target.value })}
                    placeholder="مثال: تم التسليم يداً بيد للعميل في عنوانه وتم التأكيد معه"
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-espresso-800 border border-emerald-500/30 rounded-xl text-xs outline-none text-espresso dark:text-cream"
                  />
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                    * حمايةً لحقوق الورشة والمشتري، يتم توثيق ملاحظة التسليم عند إتمام الطلب.
                  </p>
                </div>
              )}

              {/* Reason for failure or return */}
              {['failed', 'refused', 'returned'].includes(updateFormData.status) && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
                    <AlertTriangle className="w-4 h-4" />
                    <span>سبب المشكلة أو الارتجاع (إلزامي) *</span>
                  </div>
                  <input
                    type="text"
                    value={updateFormData.failureReason}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, failureReason: e.target.value })}
                    placeholder="مثال: الهاتف مغلق، أو طلب العميل تأجيل الاستلام، أو العنوان غير صحيح..."
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-espresso-800 border border-rose-500/30 rounded-xl text-xs outline-none text-espresso dark:text-cream"
                  />
                </div>
              )}

              {/* General Note */}
              <div>
                <label className="block text-xs font-bold text-espresso dark:text-cream mb-1.5">
                  تفاصيل أو ملاحظة إضافية لسجل التتبع
                </label>
                <textarea
                  rows={2}
                  value={updateFormData.note}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, note: e.target.value })}
                  placeholder="أدخل أي ملاحظة لتسجيلها في الجدول الزمني للطلب..."
                  className="w-full px-3.5 py-2.5 bg-white/90 dark:bg-espresso-800 border border-black/15 dark:border-white/15 rounded-xl text-xs text-espresso dark:text-cream outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-black/70 dark:text-white/70 hover:bg-black/5 cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-primary text-cream hover:bg-primary-hover text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري التحديث...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تأكيد تحديث الحالة</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 3: TRACKING AUDIT TIMELINE HISTORY */}
      {/* ================================================================= */}
      {isHistoryModalOpen && selectedShipmentForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-espresso-900 rounded-3xl border border-black/10 dark:border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <div>
                <h4 className="font-bold text-xl text-espresso dark:text-cream font-cairo">
                  سجل ومسار التوصيل
                </h4>
                <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">
                  مرجع الشحنة: {selectedShipmentForHistory.trackingNumber} • شحن مباشر
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 flex items-center justify-center text-black/70 dark:text-white/70 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Timeline Steps */}
            <div className="relative border-r-2 border-primary/30 mr-3 pr-5 space-y-6 py-2">
              {(selectedShipmentForHistory.events || []).map((evt, idx) => {
                const statusMeta = getShipmentStatusBadge(evt.status);
                return (
                  <div key={evt.id || idx} className="relative">
                    {/* Checkpoint Dot */}
                    <div className="absolute -right-[27px] top-1 w-3.5 h-3.5 rounded-full bg-primary border-2 border-white dark:border-espresso-900" />

                    <div className="bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-2xl border border-black/5 dark:border-white/5 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-espresso dark:text-cream">
                          {evt.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusMeta.color}`}>
                          {statusMeta.label}
                        </span>
                      </div>

                      <p className="text-xs text-black/70 dark:text-white/70 leading-relaxed">
                        {evt.description}
                      </p>

                      {evt.proofNote && (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 p-1.5 rounded-lg mt-1">
                          إثبات / توثيق: {evt.proofNote}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-black/50 dark:text-white/50 pt-1 border-t border-black/5 dark:border-white/5 mt-2">
                        <span>بواسطة: {evt.actorName} ({evt.source || 'النظام'})</span>
                        <span className="font-black">{new Date(evt.timestamp).toLocaleString('ar-EG')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-primary text-cream text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
