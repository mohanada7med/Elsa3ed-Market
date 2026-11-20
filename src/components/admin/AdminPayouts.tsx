import React, { useState, useEffect } from 'react';
import { RefreshDataButton } from '../common/RefreshDataButton.tsx';
import {
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Eye,
  FileText,
  Building2,
  Smartphone,
  CreditCard,
  X,
  ShieldAlert,
  User,
  MapPin,
  History,
  Package
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useApp } from '../../context/AppContext.tsx';
import type {
  PayoutRequest,
  AdminPayoutSummary,
  AdminPayoutDetails,
  AdminPayoutOrderSnapshot,
  PayoutMethod,
  PayoutStatus
} from '../../types.ts';

interface AdminPayoutsProps {
  user: { id: string; role: string; name?: string };
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  review: 'مراجعة الدفع',
  confirmed: 'مؤكد',
  processing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  out_for_delivery: 'خرج للتوصيل',
  delivered: 'تم التسليم',
  cancelled: 'ملغي'
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'بانتظار الدفع',
  payment_pending_verification: 'بانتظار مراجعة الدفع',
  paid: 'مدفوع',
  payment_rejected: 'مرفوض',
  failed: 'فشل الدفع',
  refunded: 'مسترد',
  cash_on_delivery: 'الدفع عند الاستلام'
};

const isValidPayoutNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const formatPayoutNumber = (value: number | undefined): string =>
  isValidPayoutNumber(value) ? value.toLocaleString('ar-EG') : 'غير متاح';

/* ───────────── UI Helpers ───────────── */

const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <span className="text-gray-400 dark:text-stone-400 block">{label}</span>
    <span className="text-gray-700 dark:text-stone-300 break-words">{children}</span>
  </div>
);

const StatTile: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-3 bg-gray-50 dark:bg-[#26160D] rounded-xl border border-gray-200 dark:border-[#6B3A1F]">
    <span className="text-gray-500 dark:text-stone-400 block">{label}</span>
    <span className="font-black text-gray-900 dark:text-[#FFF9EE] text-sm">{value}</span>
  </div>
);

/* Bottom-sheet على الموبايل، نافذة في النص على الشاشات الكبيرة */
const ModalShell: React.FC<{
  maxWidth?: string;
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}> = ({ maxWidth = 'sm:max-w-lg', title, icon, onClose, footer, children }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
    <div
      className={`bg-white dark:bg-[#1E1917] w-full ${maxWidth} max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl shadow-xl border border-gray-100 dark:border-[#6B3A1F]`}
    >
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-gray-100 dark:border-[#6B3A1F] shrink-0">
        <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-[#FFF9EE] text-base sm:text-lg min-w-0">
          {icon}
          <span className="truncate">{title}</span>
        </div>
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-[#FFF9EE] rounded-lg hover:bg-gray-100 dark:hover:bg-[#3B1E0E] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">{children}</div>

      {footer && (
        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-gray-100 dark:border-[#6B3A1F] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {footer}
        </div>
      )}
    </div>
  </div>
);

function calculatePayoutSales(
  orders: AdminPayoutOrderSnapshot[],
  sellerIds: Set<string>
): Pick<
  AdminPayoutDetails,
  'totalProductSales' | 'totalSellerTips' | 'totalSalesCount' | 'sellerOrdersCount' | 'salesByProduct' | 'recentSales'
> {
  const productSales = new Map<string, {
    productId: string;
    productTitle: string;
    quantity: number;
    revenue: number;
    orderIds: Set<string>;
  }>();
  const recentSales: NonNullable<AdminPayoutDetails['recentSales']> = [];
  let totalProductSales = 0;
  let totalSellerTips = 0;
  let totalSalesCount = 0;
  let sellerOrdersCount = 0;

  for (const order of orders) {
    if (order.status === 'cancelled' || order.paymentStatus === 'refunded') continue;

    const items = (order.items || []).filter((item) => sellerIds.has(item.sellerId));
    if (items.length > 0) {
      sellerOrdersCount += 1;
      let productSalesForOrder = 0;
      const orderItems: NonNullable<AdminPayoutDetails['recentSales']>[number]['items'] = [];

      for (const item of items) {
        const quantity = Number(item.quantity) || 1;
        const unitPrice = Number(item.unitPrice) || 0;
        const revenue = unitPrice * quantity;
        const productId = item.productId || item.productTitle;
        const productTitle = item.productTitle || item.productId;
        const sales = productSales.get(productId) || {
          productId,
          productTitle,
          quantity: 0,
          revenue: 0,
          orderIds: new Set<string>()
        };

        sales.quantity += quantity;
        sales.revenue += revenue;
        sales.orderIds.add(order.id);
        productSales.set(productId, sales);

        totalProductSales += revenue;
        totalSalesCount += quantity;
        productSalesForOrder += revenue;
        orderItems.push({
          productId,
          productTitle,
          quantity,
          unitPrice,
          revenue: Math.round(revenue * 100) / 100
        });
      }

      recentSales.push({
        orderId: order.id,
        orderNumber: order.orderNumber || order.id,
        createdAt: order.createdAt,
        buyerName: order.buyerName || '',
        status: order.status,
        paymentStatus: order.paymentStatus,
        itemCount: items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
        productSales: Math.round(productSalesForOrder * 100) / 100,
        items: orderItems
      });
    }

    if (order.sellerTipSellerId && sellerIds.has(order.sellerTipSellerId)) {
      totalSellerTips += Number(order.sellerTipAmount) || 0;
    }
  }

  const salesByProduct = Array.from(productSales.values())
    .map((sales) => ({
      productId: sales.productId,
      productTitle: sales.productTitle,
      quantity: sales.quantity,
      revenue: Math.round(sales.revenue * 100) / 100,
      ordersCount: sales.orderIds.size,
      averageUnitPrice: sales.quantity > 0
        ? Math.round((sales.revenue / sales.quantity) * 100) / 100
        : 0
    }))
    .sort((a, b) => b.revenue - a.revenue);

  recentSales.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    totalProductSales: Math.round(totalProductSales * 100) / 100,
    totalSellerTips: Math.round(totalSellerTips * 100) / 100,
    totalSalesCount,
    sellerOrdersCount,
    salesByProduct,
    recentSales: recentSales.slice(0, 20)
  };
}

export const AdminPayouts: React.FC<AdminPayoutsProps> = ({ user }) => {
  const { confirmModal, addToast } = useApp();
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [summary, setSummary] = useState<AdminPayoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Payout Details Modal
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const [payoutDetails, setPayoutDetails] = useState<AdminPayoutDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const salesByProduct = payoutDetails?.salesByProduct ?? [];
  const recentSales = payoutDetails?.recentSales ?? [];
  const previousPayouts = payoutDetails?.sellerPreviousPayouts ?? [];
  const hasIncompletePayoutStats = Boolean(
    payoutDetails &&
      (
        !isValidPayoutNumber(payoutDetails.totalSellerEarnings) ||
        !isValidPayoutNumber(payoutDetails.currentAvailableBalance) ||
        !isValidPayoutNumber(payoutDetails.totalSalesCount) ||
        !isValidPayoutNumber(payoutDetails.sellerOrdersCount) ||
        !isValidPayoutNumber(payoutDetails.totalProductSales) ||
        !isValidPayoutNumber(payoutDetails.totalSellerTips) ||
        !isValidPayoutNumber(payoutDetails.totalPaid) ||
        !isValidPayoutNumber(payoutDetails.pendingProcessing) ||
        !Array.isArray(payoutDetails.salesByProduct) ||
        !Array.isArray(payoutDetails.recentSales)
      )
  );

  // Mark Paid Modal state
  const [isPaidModalOpen, setIsPaidModalOpen] = useState(false);
  const [targetPayoutForPaid, setTargetPayoutForPaid] = useState<PayoutRequest | null>(null);
  const [paidForm, setPaidForm] = useState({
    transactionReference: '',
    paymentMethod: 'vodafone_cash' as PayoutMethod,
    paidAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    adminNote: ''
  });
  const [paidFormError, setPaidFormError] = useState<string | null>(null);

  // Reject Modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [targetPayoutForReject, setTargetPayoutForReject] = useState<PayoutRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminPayouts(user, {
        status: statusFilter,
        search: searchQuery
      });
      setPayouts(res.payouts);
      setSummary(res.summary);
    } catch (err: any) {
      console.error('Error fetching admin payouts:', err);
      setError(err?.message || 'فشل في تحميل طلبات صرف المستحقات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPayouts();
  };

  const handleOpenDetails = async (id: string) => {
    setSelectedPayoutId(id);
    setDetailsLoading(true);
    try {
      let details = await api.getAdminPayoutById(user, id);
      const needsSalesFallback = [
        details.totalSellerEarnings,
        details.currentAvailableBalance,
        details.totalProductSales,
        details.totalSellerTips,
        details.totalSalesCount,
        details.sellerOrdersCount,
        details.totalPaid,
        details.pendingProcessing
      ].some((value) => !isValidPayoutNumber(value)) ||
        !Array.isArray(details.salesByProduct) ||
        !Array.isArray(details.recentSales);

      if (needsSalesFallback) {
        const [orders, payoutHistory] = await Promise.all([
          api.getAdminOrders(user),
          api.getAdminPayouts(user, { status: 'all' })
        ]);
        const sellerIds = new Set(
          [details.payout.sellerId, details.seller?.id, details.seller?.userId]
            .filter((sellerId): sellerId is string => Boolean(sellerId))
        );
        const sales = calculatePayoutSales(orders, sellerIds);
        const sellerPayouts = payoutHistory.payouts.filter((payout) =>
          sellerIds.has(payout.sellerId)
        );
        const totalPaid = sellerPayouts.reduce(
          (sum, payout) => sum + (
            payout.status === 'paid'
              ? Number(payout.paidAmount ?? payout.requestedAmount ?? 0)
              : 0
          ),
          0
        );
        const pendingProcessing = sellerPayouts.reduce(
          (sum, payout) => sum + (
            ['pending', 'approved', 'processing'].includes(payout.status)
              ? Number(payout.requestedAmount || 0)
              : 0
          ),
          0
        );
        const totalSellerEarnings =
          (sales.totalProductSales ?? 0) + (sales.totalSellerTips ?? 0);

        details = {
          ...details,
          ...sales,
          totalSellerEarnings,
          totalPaid: Math.round(totalPaid * 100) / 100,
          pendingProcessing: Math.round(pendingProcessing * 100) / 100,
          currentAvailableBalance: Math.max(
            0,
            Math.round((totalSellerEarnings - totalPaid - pendingProcessing) * 100) / 100
          ),
          sellerPreviousPayouts: sellerPayouts
            .filter((payout) => payout.id !== id)
            .slice(0, 10)
        };
      }

      setPayoutDetails(details);
    } catch (err: any) {
      alert(err?.message || 'تعذر جلب تفاصيل طلب الصرف');
      setSelectedPayoutId(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedPayoutId(null);
    setPayoutDetails(null);
  };

  const handleApprove = (id: string) => {
    confirmModal({
      title: 'الموافقة على طلب الصرف',
      message: 'هل أنت متأكد من الموافقة على طلب الصرف هذا وتحويله للإجراءات التالية؟',
      confirmText: 'تأكيد الموافقة',
      danger: false,
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.approveAdminPayout(user, id);
          setSuccessMsg('تمت الموافقة على طلب الصرف بنجاح وإشعار الحرفي');
          addToast('تمت الموافقة', 'تمت الموافقة على طلب الصرف بنجاح', 'success');
          setTimeout(() => setSuccessMsg(null), 5000);
          await fetchPayouts();
          if (selectedPayoutId === id) {
            handleOpenDetails(id);
          }
        } catch (err: any) {
          addToast('خطأ', err?.message || 'تعذر الموافقة على طلب الصرف', 'error');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleMarkProcessing = async (id: string) => {
    try {
      setActionLoading(true);
      await api.markAdminPayoutProcessing(user, id);
      setSuccessMsg('تم تحويل حالة الطلب إلى جارٍ التحويل');
      setTimeout(() => setSuccessMsg(null), 5000);
      await fetchPayouts();
      if (selectedPayoutId === id) {
        handleOpenDetails(id);
      }
    } catch (err: any) {
      alert(err?.message || 'تعذر تحديث حالة الطلب');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPaidModal = (payout: PayoutRequest) => {
    setTargetPayoutForPaid(payout);
    setPaidForm({
      transactionReference: '',
      paymentMethod: payout.paymentMethod || 'vodafone_cash',
      paidAmount: String(payout.requestedAmount),
      paymentDate: new Date().toISOString().split('T')[0],
      adminNote: ''
    });
    setPaidFormError(null);
    setIsPaidModalOpen(true);
  };

  const handleSubmitPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaidFormError(null);

    if (!targetPayoutForPaid) return;

    if (!paidForm.transactionReference.trim()) {
      setPaidFormError('يرجى إدخال رقم المعاملة أو كود إيصال التحويل');
      return;
    }

    const amount = parseFloat(paidForm.paidAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaidFormError('يرجى إدخال مبلغ صحيح أكبر من الصفر');
      return;
    }

    if (amount > targetPayoutForPaid.requestedAmount) {
      setPaidFormError(`لا يمكن أن يتجاوز المبلغ المدفوع المبلغ المطلوب (${targetPayoutForPaid.requestedAmount} ج.م)`);
      return;
    }

    try {
      setActionLoading(true);
      await api.markAdminPayoutPaid(user, targetPayoutForPaid.id, {
        transactionReference: paidForm.transactionReference.trim(),
        paymentMethod: paidForm.paymentMethod,
        paidAmount: amount,
        paymentDate: paidForm.paymentDate,
        adminNote: paidForm.adminNote.trim() || undefined
      });

      setIsPaidModalOpen(false);
      setSuccessMsg(`تم تأكيد صرف مبلغ ${amount.toLocaleString('ar-EG')} ج.م بنجاح وإشعار الحرفي برقم المعاملة`);
      setTimeout(() => setSuccessMsg(null), 6000);
      await fetchPayouts();
      if (selectedPayoutId === targetPayoutForPaid.id) {
        handleOpenDetails(targetPayoutForPaid.id);
      }
    } catch (err: any) {
      setPaidFormError(err?.message || 'فشل تأكيد تحويل وصرف المبلغ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRejectModal = (payout: PayoutRequest) => {
    setTargetPayoutForReject(payout);
    setRejectReason('');
    setRejectError(null);
    setIsRejectModalOpen(true);
  };

  const handleSubmitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    setRejectError(null);

    if (!targetPayoutForReject) return;

    if (!rejectReason.trim()) {
      setRejectError('يرجى كتابة سبب رفض طلب الصرف بوضوح');
      return;
    }

    try {
      setActionLoading(true);
      await api.rejectAdminPayout(user, targetPayoutForReject.id, rejectReason.trim());
      setIsRejectModalOpen(false);
      setSuccessMsg('تم رفض طلب الصرف بنجاح وإشعار الحرفي بالسبب');
      setTimeout(() => setSuccessMsg(null), 5000);
      await fetchPayouts();
      if (selectedPayoutId === targetPayoutForReject.id) {
        handleOpenDetails(targetPayoutForReject.id);
      }
    } catch (err: any) {
      setRejectError(err?.message || 'فشل رفض طلب الصرف');
    } finally {
      setActionLoading(false);
    }
  };

  const getMethodIcon = (method?: PayoutMethod) => {
    switch (method) {
      case 'vodafone_cash':
        return <Smartphone className="w-4 h-4 text-red-500" />;
      case 'instapay':
        return <CreditCard className="w-4 h-4 text-purple-600" />;
      case 'bank_transfer':
        return <Building2 className="w-4 h-4 text-blue-600" />;
      default:
        return <Wallet className="w-4 h-4 text-amber-600" />;
    }
  };

  const getMethodLabel = (method?: PayoutMethod) => {
    switch (method) {
      case 'vodafone_cash':
        return 'فودافون كاش';
      case 'instapay':
        return 'إنستاباي InstaPay';
      case 'bank_transfer':
        return 'تحويل بنكي';
      default:
        return method || 'غير محدد';
    }
  };

  const getStatusBadge = (status: PayoutStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5" />
            قيد الانتظار
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5" />
            تمت الموافقة
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 whitespace-nowrap">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            جارٍ التحويل اليدوي
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5" />
            تم الصرف والتأكيد
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 whitespace-nowrap">
            <XCircle className="w-3.5 h-3.5" />
            مرفوض
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-stone-800 text-gray-700 dark:text-stone-300 border border-gray-200 dark:border-stone-700 whitespace-nowrap">
            ملغي من الحرفي
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="admin-payouts-container" className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E1917] p-4 sm:p-6 rounded-2xl border border-gray-100 dark:border-[#6B3A1F] shadow-xs">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-[#FFF9EE]">إدارة طلبات صرف المستحقات</h1>
            <span className="text-xs bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
              المالية اليدوية
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-[#D6C6B1]">
            مراجعة طلبات صرف مستحقات الحرفيين والبائعين، وتنفيذ التحويلات اليدوية، وتسجيل أرقام الحوالات
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <RefreshDataButton
            onRefresh={fetchPayouts}
            isLoading={loading}
            label="تحديث الطلبات"
          />
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Pending Card */}
        <div className="bg-white dark:bg-[#1E1917] p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-[#6B3A1F] shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-[#D6C6B1]">طلبات قيد الانتظار</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-primary dark:text-primary-hover flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-[#FFF9EE]">
              {summary ? `${summary.totalPendingAmount.toLocaleString('ar-EG')} ج.م` : '—'}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] sm:text-xs text-amber-700 dark:text-primary dark:text-primary-hover font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0"></span>
              <span>{summary?.totalPendingCount || 0} طلب يحتاج مراجعة</span>
            </div>
          </div>
        </div>

        {/* Processing Card */}
        <div className="bg-white dark:bg-[#1E1917] p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-[#6B3A1F] shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-[#D6C6B1]">جاري التحويل والتنفيذ</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-[#FFF9EE]">
              {summary ? `${summary.totalApprovedProcessingAmount.toLocaleString('ar-EG')} ج.م` : '—'}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] sm:text-xs text-indigo-700 dark:text-indigo-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block shrink-0"></span>
              <span>{summary?.totalApprovedProcessingCount || 0} طلب قيد التحويل</span>
            </div>
          </div>
        </div>

        {/* Paid Card */}
        <div className="bg-white dark:bg-[#1E1917] p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-[#6B3A1F] shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-[#D6C6B1]">إجمالي المبالغ المصروفة</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {summary ? `${summary.totalPaidAmount.toLocaleString('ar-EG')} ج.م` : '—'}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] sm:text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0"></span>
              <span>{summary?.totalPaidCount || 0} طلب تم تحويله بنجاح</span>
            </div>
          </div>
        </div>

        {/* Rejected Card */}
        <div className="bg-white dark:bg-[#1E1917] p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-[#6B3A1F] shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-[#D6C6B1]">الطلبات المرفوضة</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-[#FFF9EE]">
              {summary?.totalRejectedCount || 0}
            </div>
            <p className="text-[11px] sm:text-xs text-gray-400 dark:text-stone-400 mt-1">طلبات تم رفضها مع توضيح السبب</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#1E1917] p-3 sm:p-4 rounded-2xl border border-gray-100 dark:border-[#6B3A1F] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Status Filter Tabs: scroll أفقي على الموبايل */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto md:overflow-visible md:flex-wrap pb-1 md:pb-0 -mx-1 px-1">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'pending', label: 'قيد الانتظار' },
            { id: 'approved', label: 'تمت الموافقة' },
            { id: 'processing', label: 'جارٍ التحويل' },
            { id: 'paid', label: 'تم الصرف' },
            { id: 'rejected', label: 'مرفوضة' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`shrink-0 whitespace-nowrap px-3 py-2 md:py-1.5 text-xs font-medium rounded-xl transition cursor-pointer ${statusFilter === tab.id
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-gray-50 dark:bg-[#1B1009] border border-gray-100 dark:border-[#6B3A1F] text-gray-600 dark:text-stone-300 hover:bg-gray-100 dark:hover:bg-[#3B1E0E]'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="بحث برقم الطلب، اسم البائع، الحساب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 md:py-2 text-base md:text-xs bg-gray-50 dark:bg-[#1B1009] border border-gray-200 dark:border-[#6B3A1F] rounded-xl text-gray-900 dark:text-[#FFF9EE] focus:bg-white dark:focus:bg-[#26160D] focus:ring-2 focus:ring-amber-500 focus:outline-hidden transition"
          />
          <button
            type="submit"
            aria-label="بحث"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-stone-400 hover:text-gray-600 dark:hover:text-[#FFF9EE] cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Main Payouts List */}
      <div className="bg-white dark:bg-[#1E1917] rounded-2xl border border-gray-100 dark:border-[#6B3A1F] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-[#D6C6B1]">جاري تحميل طلبات صرف المستحقات...</p>
          </div>
        ) : payouts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-[#1B1009] border border-gray-100 dark:border-[#6B3A1F] text-gray-400 dark:text-stone-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-[#FFF9EE] mb-1">لا توجد طلبات صرف تطابق المعايير</h3>
            <p className="text-xs text-gray-500 dark:text-[#D6C6B1]">
              لم يتم العثور على أي طلبات في هذه الحالة أو بكلمة البحث المدخلة
            </p>
          </div>
        ) : (
          <>
            {/* ===== موبايل: كروت ===== */}
            <ul className="md:hidden divide-y divide-gray-100 dark:divide-[#3B1E0E]">
              {payouts.map((payout) => (
                <li key={payout.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 dark:text-[#FFF9EE] text-sm truncate">
                        {payout.sellerBrandName || payout.sellerName}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-[#D6C6B1] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400 dark:text-stone-400" />
                        <span>{payout.sellerGovernorate || 'الصعيد'}</span>
                      </div>
                    </div>
                    {getStatusBadge(payout.status)}
                  </div>

                  <div className="flex items-end justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#26160D] border border-gray-100 dark:border-[#6B3A1F]">
                    <div>
                      <span className="text-[11px] text-gray-500 dark:text-[#D6C6B1] block">المبلغ المطلوب</span>
                      <span className="font-black text-lg text-gray-900 dark:text-[#FFF9EE]">
                        {payout.requestedAmount.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5 text-xs text-gray-800 dark:text-[#FFF9EE] font-medium justify-end">
                        {getMethodIcon(payout.paymentMethod)}
                        <span>{getMethodLabel(payout.paymentMethod)}</span>
                      </div>
                      <span className="font-black text-xs text-gray-500 dark:text-[#D6C6B1] block" dir="ltr">
                        {payout.paymentDetailsSnapshot?.accountNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-[#D6C6B1]">
                    <span className="font-bold text-gray-700 dark:text-stone-300">#{payout.id}</span>
                    <span>
                      {new Date(payout.requestedAt || payout.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-stretch gap-2">
                    <button
                      onClick={() => handleOpenDetails(payout.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-gray-700 dark:text-stone-300 bg-gray-50 dark:bg-[#26160D] hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl border border-gray-200 dark:border-[#6B3A1F] transition cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>مراجعة</span>
                    </button>

                    {payout.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(payout.id)}
                          disabled={actionLoading}
                          className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition cursor-pointer disabled:opacity-60"
                        >
                          موافقة
                        </button>
                        <button
                          onClick={() => handleOpenRejectModal(payout)}
                          disabled={actionLoading}
                          className="flex-1 py-2.5 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl transition cursor-pointer disabled:opacity-60"
                        >
                          رفض
                        </button>
                      </>
                    )}

                    {(payout.status === 'approved' || payout.status === 'processing') && (
                      <button
                        onClick={() => handleOpenPaidModal(payout)}
                        disabled={actionLoading}
                        className="flex-[2] inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition cursor-pointer disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تأكيد الصرف</span>
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* ===== PC / تابلت: جدول ===== */}
            <div className="wah-table-container hidden md:block overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 dark:bg-[#26160D] text-gray-500 dark:text-[#D6C6B1] text-xs font-medium border-b border-gray-100 dark:border-[#6B3A1F]">
                    <th className="py-3.5 px-4">رقم الطلب</th>
                    <th className="py-3.5 px-4">الحرفي / الورشة</th>
                    <th className="py-3.5 px-4">المبلغ المطلوب</th>
                    <th className="py-3.5 px-4">وسيلة ورقم التحويل</th>
                    <th className="py-3.5 px-4 hidden lg:table-cell">تاريخ الطلب</th>
                    <th className="py-3.5 px-4">الحالة</th>
                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#3B1E0E] text-sm">
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50/50 dark:hover:bg-[#26201B]/50 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-black text-xs text-gray-800 dark:text-stone-300 block">
                          {payout.id}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-[#D6C6B1] lg:hidden">
                          {new Date(payout.requestedAt || payout.createdAt).toLocaleDateString('ar-EG', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 dark:text-[#FFF9EE] text-xs">
                          {payout.sellerBrandName || payout.sellerName}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-[#D6C6B1] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400 dark:text-stone-400" />
                          <span>{payout.sellerGovernorate || 'الصعيد'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-gray-900 dark:text-[#FFF9EE] text-sm whitespace-nowrap">
                          {payout.requestedAmount.toLocaleString('ar-EG')} ج.م
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-800 dark:text-[#FFF9EE] font-medium">
                          {getMethodIcon(payout.paymentMethod)}
                          <span>{getMethodLabel(payout.paymentMethod)}</span>
                        </div>
                        <span className="font-black text-xs text-gray-500 dark:text-[#D6C6B1] block">
                          {payout.paymentDetailsSnapshot?.accountNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500 dark:text-[#D6C6B1] hidden lg:table-cell">
                        {new Date(payout.requestedAt || payout.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(payout.status)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenDetails(payout.id)}
                            title="عرض ومراجعة الطلب"
                            className="p-1.5 text-gray-600 dark:text-stone-300 hover:text-amber-700 dark:hover:text-primary dark:text-primary-hover bg-gray-50 dark:bg-[#26160D] hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition border border-gray-200 dark:border-[#6B3A1F] cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {payout.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(payout.id)}
                                disabled={actionLoading}
                                title="موافقة على الطلب"
                                className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition cursor-pointer"
                              >
                                موافقة
                              </button>
                              <button
                                onClick={() => handleOpenRejectModal(payout)}
                                disabled={actionLoading}
                                title="رفض الطلب"
                                className="px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg transition cursor-pointer"
                              >
                                رفض
                              </button>
                            </>
                          )}

                          {(payout.status === 'approved' || payout.status === 'processing') && (
                            <button
                              onClick={() => handleOpenPaidModal(payout)}
                              disabled={actionLoading}
                              title="تأكيد التحويل اليدوي والصرف"
                              className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition inline-flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>تأكيد الصرف</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal: Full Payout Review & Seller Balance Details */}
      {selectedPayoutId && (
        <ModalShell
          maxWidth="sm:max-w-5xl"
          title={`مراجعة طلب الصرف #${selectedPayoutId}`}
          icon={<FileText className="w-5 h-5 text-amber-600 shrink-0" />}
          onClose={closeDetails}
          footer={
            payoutDetails && (
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
                <button
                  onClick={closeDetails}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-[#3B1E0E] hover:bg-gray-200 dark:hover:bg-[#6B3A1F] text-gray-700 dark:text-stone-300 text-xs font-medium rounded-xl transition cursor-pointer"
                >
                  إغلاق
                </button>

                <div className="flex flex-col sm:flex-row gap-2">
                  {payoutDetails.payout.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(payoutDetails.payout.id)}
                        disabled={actionLoading}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                      >
                        موافقة على الطلب
                      </button>
                      <button
                        onClick={() => handleOpenRejectModal(payoutDetails.payout)}
                        disabled={actionLoading}
                        className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-medium rounded-xl transition cursor-pointer"
                      >
                        رفض الطلب
                      </button>
                    </>
                  )}

                  {payoutDetails.payout.status === 'approved' && (
                    <button
                      onClick={() => handleMarkProcessing(payoutDetails.payout.id)}
                      disabled={actionLoading}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      بدء التحويل اليدوي
                    </button>
                  )}

                  {(payoutDetails.payout.status === 'approved' || payoutDetails.payout.status === 'processing') && (
                    <button
                      onClick={() => handleOpenPaidModal(payoutDetails.payout)}
                      disabled={actionLoading}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تأكيد التحويل والصرف</span>
                    </button>
                  )}
                </div>
              </div>
            )
          }
        >
          {detailsLoading ? (
            <div className="py-12 text-center">
              <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500 dark:text-[#D6C6B1]">جاري جلب تفاصيل الحرفي والبيانات المالية...</p>
            </div>
          ) : payoutDetails ? (
            <div className="space-y-4">
              {/* Status & Amount Highlight */}
              <div className="p-4 bg-gray-50 dark:bg-[#26160D] rounded-xl border border-gray-200 dark:border-[#6B3A1F] flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-gray-500 dark:text-[#D6C6B1] block">المبلغ المطلوب:</span>
                  <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-[#FFF9EE]">
                    {payoutDetails.payout.requestedAmount.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
                {getStatusBadge(payoutDetails.payout.status)}
              </div>

              {/* Seller Real-Time Financial Balance Safety Audit */}
              <div className="p-4 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-900 dark:text-primary dark:text-primary-hover">فحص الرصيد الفعلي للبائع:</span>
                  <span className="text-xs bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-primary dark:text-primary-hover px-2 py-0.5 rounded font-black">
                    محسوب مباشرة من ادارة وه
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
                  <div className="p-2.5 bg-white dark:bg-[#1B1009] rounded-lg border border-amber-100 dark:border-amber-900/40">
                    <span className="text-gray-400 dark:text-stone-400 block">إجمالي الأرباح التاريخية:</span>
                    <span className="font-bold text-gray-900 dark:text-[#FFF9EE] text-sm">
                      {formatPayoutNumber(payoutDetails.totalSellerEarnings)} ج.م
                    </span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-[#1B1009] rounded-lg border border-amber-100 dark:border-amber-900/40">
                    <span className="text-gray-400 dark:text-stone-400 block">الرصيد المتاح الحالي:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      {formatPayoutNumber(payoutDetails.currentAvailableBalance)} ج.م
                    </span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-[#1B1009] rounded-lg border border-amber-100 dark:border-amber-900/40 col-span-2 sm:col-span-1">
                    <span className="text-gray-400 dark:text-stone-400 block">الرصيد لحظة الطلب:</span>
                    <span className="font-bold text-gray-700 dark:text-stone-300 text-sm">
                      {payoutDetails.payout.sellerBalanceAtRequest
                        ? `${payoutDetails.payout.sellerBalanceAtRequest.toLocaleString('ar-EG')} ج.م`
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {hasIncompletePayoutStats && (
                <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3">
                  بعض إحصائيات المبيعات غير متاحة من الخادم الحالي، وتظهر كـ«غير متاح» بدلًا من احتسابها صفرًا.
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 text-xs">
                <StatTile label="القطع المباعة" value={formatPayoutNumber(payoutDetails.totalSalesCount)} />
                <StatTile label="طلبات البيع" value={formatPayoutNumber(payoutDetails.sellerOrdersCount)} />
                <StatTile label="قيمة المنتجات المباعة" value={`${formatPayoutNumber(payoutDetails.totalProductSales)} ج.م`} />
                <StatTile label="دعم المشترين" value={`${formatPayoutNumber(payoutDetails.totalSellerTips)} ج.م`} />
                <StatTile label="تم صرفه" value={`${formatPayoutNumber(payoutDetails.totalPaid)} ج.م`} />
                <StatTile label="طلبات صرف معلقة" value={`${formatPayoutNumber(payoutDetails.pendingProcessing)} ج.م`} />
              </div>

              {/* Seller Info & Payment Destination Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-gray-50 dark:bg-[#26160D] rounded-xl border border-gray-200 dark:border-[#6B3A1F] space-y-2.5">
                  <h4 className="font-bold text-gray-900 dark:text-[#FFF9EE] flex items-center gap-1.5">
                    <User className="w-4 h-4 text-amber-600" />
                    <span>بيانات الحرفي والورشة</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-x-4 gap-y-2.5">
                    <InfoRow label="اسم الحرفي:">
                      <span className="font-bold text-gray-800 dark:text-[#FFF9EE]">
                        {payoutDetails.seller?.name || payoutDetails.payout.sellerName || 'غير مسجل'}
                      </span>
                    </InfoRow>
                    <InfoRow label="اسم الورشة:">
                      <span className="font-bold text-gray-800 dark:text-[#FFF9EE]">
                        {payoutDetails.seller?.brandName || payoutDetails.payout.sellerBrandName || 'غير مسجل'}
                      </span>
                    </InfoRow>
                    <InfoRow label="رقم تعريف البائع:">
                      {payoutDetails.seller?.id || payoutDetails.payout.sellerId}
                    </InfoRow>
                    {payoutDetails.seller?.userId && (
                      <InfoRow label="معرّف حساب المستخدم:">{payoutDetails.seller.userId}</InfoRow>
                    )}
                    <InfoRow label="المحافظة:">
                      {payoutDetails.seller?.governorate || payoutDetails.payout.sellerGovernorate || 'غير محدد'}
                    </InfoRow>
                    <InfoRow label="رقم الهاتف:">
                      <span className="font-black">{payoutDetails.seller?.phone || 'غير مسجل'}</span>
                    </InfoRow>
                    <InfoRow label="البريد الإلكتروني:">
                      <span className="break-all">{payoutDetails.seller?.email || 'غير مسجل'}</span>
                    </InfoRow>
                    <InfoRow label="التخصص:">{payoutDetails.seller?.specialty || 'غير محدد'}</InfoRow>
                    <InfoRow label="حالة الورشة والتوثيق:">
                      {payoutDetails.seller?.status === 'approved'
                        ? 'معتمدة'
                        : payoutDetails.seller?.status === 'pending'
                          ? 'قيد المراجعة'
                          : payoutDetails.seller?.status === 'rejected'
                            ? 'مرفوضة'
                            : payoutDetails.seller?.status === 'suspended'
                              ? 'موقوفة'
                              : 'غير محددة'}
                      {' · '}
                      {payoutDetails.seller?.verified ? 'موثقة' : 'غير موثقة'}
                    </InfoRow>
                    <InfoRow label="تاريخ الانضمام:">
                      {payoutDetails.seller?.joinedDate
                        ? new Date(payoutDetails.seller.joinedDate).toLocaleDateString('ar-EG')
                        : 'غير مسجل'}
                    </InfoRow>
                    <InfoRow label="تقييم الورشة وعدد منتجاتها:">
                      {payoutDetails.seller
                        ? `${payoutDetails.seller.rating.toLocaleString('ar-EG')} ★ · ${payoutDetails.seller.productsCount.toLocaleString('ar-EG')} منتج`
                        : 'غير متاح'}
                    </InfoRow>
                  </div>

                  {payoutDetails.seller &&
                    (payoutDetails.seller.bio ||
                      payoutDetails.seller.story ||
                      payoutDetails.seller.offerings ||
                      payoutDetails.seller.craftSinceYear ||
                      payoutDetails.seller.achievementSkills?.length) && (
                      <details className="pt-2 border-t border-gray-200 dark:border-[#3B1E0E]">
                        <summary className="cursor-pointer font-bold text-amber-700 dark:text-amber-400 py-1">
                          نبذة الورشة والحرفة
                        </summary>
                        <div className="pt-2 space-y-2 text-gray-700 dark:text-stone-300 leading-relaxed">
                          {payoutDetails.seller.bio && <p>{payoutDetails.seller.bio}</p>}
                          {payoutDetails.seller.story && <p>{payoutDetails.seller.story}</p>}
                          {payoutDetails.seller.offerings && <p>المنتجات: {payoutDetails.seller.offerings}</p>}
                          {payoutDetails.seller.craftSinceYear && (
                            <p>بدأ ممارسة الحرفة سنة {payoutDetails.seller.craftSinceYear}</p>
                          )}
                          {payoutDetails.seller.achievementSkills?.length ? (
                            <p>المهارات: {payoutDetails.seller.achievementSkills.join('، ')}</p>
                          ) : null}
                        </div>
                      </details>
                    )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-[#26160D] rounded-xl border border-gray-200 dark:border-[#6B3A1F] space-y-2.5 self-start">
                  <h4 className="font-bold text-gray-900 dark:text-[#FFF9EE] flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-amber-600" />
                    <span>بيانات تحويل المستحقات</span>
                  </h4>
                  <div>
                    <span className="text-gray-400 dark:text-stone-400 block">وسيلة الاستلام:</span>
                    <div className="font-bold text-gray-800 dark:text-[#FFF9EE] flex items-center gap-1.5 mt-0.5">
                      {getMethodIcon(payoutDetails.payout.paymentMethod)}
                      <span>{getMethodLabel(payoutDetails.payout.paymentMethod)}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-stone-400 block">رقم الحساب / المحفظة:</span>
                    <span className="font-black text-sm bg-white dark:bg-[#1B1009] px-2 py-0.5 rounded border border-gray-200 dark:border-[#6B3A1F] text-gray-900 dark:text-[#FFF9EE] inline-block mt-0.5 break-all">
                      {payoutDetails.payout.paymentDetailsSnapshot?.accountNumber}
                    </span>
                  </div>
                  <InfoRow label="اسم صاحب الحساب:">
                    {payoutDetails.payout.paymentDetailsSnapshot?.accountHolderName || payoutDetails.seller?.name}
                  </InfoRow>
                </div>
              </div>

              {/* ملخص المنتجات المباعة: كروت على الموبايل، جدول على الشاشات الأكبر */}
              <section className="p-4 bg-white dark:bg-[#211B17] rounded-xl border border-gray-200 dark:border-[#6B3A1F] space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-bold text-gray-900 dark:text-[#FFF9EE] flex items-center gap-1.5 text-xs sm:text-sm">
                    <Package className="w-4 h-4 text-amber-600" />
                    <span>ملخص المنتجات المباعة</span>
                  </h4>
                  <span className="text-[11px] text-gray-500 dark:text-stone-400">
                    {formatPayoutNumber(payoutDetails.salesByProduct?.length)} منتج
                  </span>
                </div>
                {salesByProduct.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-stone-400">لا توجد مبيعات منتجات مسجلة للبائع.</p>
                ) : (
                  <>
                    <div className="sm:hidden space-y-2">
                      {salesByProduct.map((product) => (
                        <div
                          key={product.productId}
                          className="p-3 rounded-lg border border-gray-200 dark:border-[#3B1E0E] bg-gray-50 dark:bg-[#1B1009] text-xs space-y-1.5"
                        >
                          <div>
                            <span className="block font-bold text-gray-900 dark:text-[#FFF9EE]">{product.productTitle}</span>
                            <span className="text-[10px] text-gray-400 dark:text-stone-500">#{product.productId}</span>
                          </div>
                          <div className="flex items-center justify-between text-gray-600 dark:text-stone-300">
                            <span>الكمية: <b>{product.quantity.toLocaleString('ar-EG')}</b></span>
                            <span>الطلبات: <b>{product.ordersCount.toLocaleString('ar-EG')}</b></span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-stone-400">
                              متوسط القطعة: {product.averageUnitPrice.toLocaleString('ar-EG')} ج.م
                            </span>
                            <span className="font-black text-emerald-700 dark:text-emerald-400">
                              {product.revenue.toLocaleString('ar-EG')} ج.م
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-[#3B1E0E] text-gray-500 dark:text-stone-400">
                            <th className="p-2">المنتج</th>
                            <th className="p-2">الكمية المباعة</th>
                            <th className="p-2">عدد الطلبات</th>
                            <th className="p-2">متوسط سعر القطعة</th>
                            <th className="p-2">إجمالي المبيعات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#3B1E0E]">
                          {salesByProduct.map((product) => (
                            <tr key={product.productId}>
                              <td className="p-2">
                                <span className="block font-bold text-gray-900 dark:text-[#FFF9EE]">{product.productTitle}</span>
                                <span className="text-[10px] text-gray-400 dark:text-stone-500">#{product.productId}</span>
                              </td>
                              <td className="p-2 font-black">{product.quantity.toLocaleString('ar-EG')}</td>
                              <td className="p-2">{product.ordersCount.toLocaleString('ar-EG')}</td>
                              <td className="p-2">{product.averageUnitPrice.toLocaleString('ar-EG')} ج.م</td>
                              <td className="p-2 font-black text-emerald-700 dark:text-emerald-400">
                                {product.revenue.toLocaleString('ar-EG')} ج.م
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </section>

              {/* تفاصيل المبيعات حسب الطلب */}
              <section className="p-4 bg-white dark:bg-[#211B17] rounded-xl border border-gray-200 dark:border-[#6B3A1F] space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-bold text-gray-900 dark:text-[#FFF9EE] flex items-center gap-1.5 text-xs sm:text-sm">
                    <History className="w-4 h-4 text-amber-600" />
                    <span>تفاصيل المبيعات حسب الطلب</span>
                  </h4>
                  <span className="text-[11px] text-gray-500 dark:text-stone-400">
                    آخر {formatPayoutNumber(payoutDetails.recentSales?.length)} طلب
                  </span>
                </div>
                {recentSales.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-stone-400">لا توجد طلبات بيع محتسبة لهذا البائع.</p>
                ) : (
                  <div className="space-y-2">
                    {recentSales.map((sale) => (
                      <details
                        key={sale.orderId}
                        className="rounded-lg border border-gray-200 dark:border-[#3B1E0E] bg-gray-50 dark:bg-[#1B1009]"
                      >
                        <summary className="cursor-pointer list-none p-3 grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between gap-x-3 gap-y-1.5 text-xs">
                          <span className="font-black text-gray-900 dark:text-[#FFF9EE]">طلب #{sale.orderNumber}</span>
                          <span className="text-gray-500 dark:text-stone-400 text-left sm:text-right">
                            {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('ar-EG') : 'تاريخ غير محدد'}
                          </span>
                          <span className="text-gray-700 dark:text-stone-300">المشتري: {sale.buyerName || 'غير محدد'}</span>
                          <span className="text-left sm:text-right">{sale.itemCount.toLocaleString('ar-EG')} قطعة</span>
                          <span className="font-black text-emerald-700 dark:text-emerald-400">
                            {sale.productSales.toLocaleString('ar-EG')} ج.م
                          </span>
                          <span className="text-gray-500 dark:text-stone-400 text-left sm:text-right">
                            {ORDER_STATUS_LABELS[sale.status] || sale.status} · {PAYMENT_STATUS_LABELS[sale.paymentStatus] || sale.paymentStatus}
                          </span>
                        </summary>
                        <div className="border-t border-gray-200 dark:border-[#3B1E0E] divide-y divide-gray-100 dark:divide-[#3B1E0E]">
                          {sale.items.map((item, index) => (
                            <div
                              key={`${item.productId}-${index}`}
                              className="p-3 grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between gap-x-3 gap-y-1 text-[11px]"
                            >
                              <span className="font-bold text-gray-800 dark:text-[#FFF9EE] col-span-2 sm:col-span-1">
                                {item.productTitle}
                              </span>
                              <span>الكمية: {item.quantity.toLocaleString('ar-EG')}</span>
                              <span>سعر القطعة: {item.unitPrice.toLocaleString('ar-EG')} ج.م</span>
                              <span className="font-black col-span-2 sm:col-span-1">
                                الإجمالي: {item.revenue.toLocaleString('ar-EG')} ج.م
                              </span>
                            </div>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </section>

              {/* Seller Notes if present */}
              {payoutDetails.payout.sellerNotes && (
                <div className="p-3 bg-gray-50 dark:bg-[#26160D] rounded-xl border border-gray-200 dark:border-[#6B3A1F] text-xs">
                  <span className="text-gray-400 dark:text-stone-400 block mb-1">ملاحظات الحرفي:</span>
                  <p className="text-gray-800 dark:text-[#FFF9EE]">{payoutDetails.payout.sellerNotes}</p>
                </div>
              )}

              {/* Completed Payment Record if Paid */}
              {payoutDetails.payout.status === 'paid' && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>بيانات الحوالة والتحويل المالي المسجلة</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-emerald-700 dark:text-emerald-300 block">المبلغ المنفذ:</span>
                      <span className="font-bold text-emerald-950 dark:text-emerald-100">
                        {payoutDetails.payout.paidAmount?.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>
                    <div>
                      <span className="text-emerald-700 dark:text-emerald-300 block">رقم المعاملة / الحوالة:</span>
                      <span className="font-black bg-white dark:bg-[#1B1009] px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 inline-block text-emerald-950 dark:text-emerald-100 break-all">
                        {payoutDetails.payout.transactionReference}
                      </span>
                    </div>
                    <div>
                      <span className="text-emerald-700 dark:text-emerald-300 block">تاريخ التحويل:</span>
                      <span className="font-medium text-emerald-950 dark:text-emerald-100">
                        {payoutDetails.payout.paymentDate
                          ? new Date(payoutDetails.payout.paymentDate).toLocaleDateString('ar-EG')
                          : '—'}
                      </span>
                    </div>
                  </div>
                  {payoutDetails.payout.adminNote && (
                    <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800 text-[11px]">
                      <span className="text-emerald-700 dark:text-emerald-300 block font-semibold">ملاحظات الإدارة:</span>
                      <p className="text-emerald-950 dark:text-emerald-100">{payoutDetails.payout.adminNote}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Rejection info if rejected */}
              {payoutDetails.payout.status === 'rejected' && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl space-y-1 text-xs text-rose-900 dark:text-rose-200">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300">
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>سبب الرفض المسجل:</span>
                  </div>
                  <p className="text-xs bg-white dark:bg-[#1B1009] p-2.5 rounded-lg border border-rose-200 dark:border-rose-800 font-medium mt-1 text-rose-950 dark:text-rose-100">
                    {payoutDetails.payout.rejectionReason}
                  </p>
                </div>
              )}

              {/* Seller Previous Payouts List */}
              {previousPayouts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-stone-300 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-gray-400 dark:text-stone-400" />
                    <span>سجل طلبات الصرف السابقة لهذا الحرفي ({previousPayouts.length})</span>
                  </h4>
                  <div className="max-h-40 overflow-y-auto divide-y divide-gray-100 dark:divide-[#3B1E0E] border border-gray-100 dark:border-[#6B3A1F] rounded-xl text-xs">
                    {previousPayouts.map((prev) => (
                      <div key={prev.id} className="p-2.5 flex items-center justify-between gap-2 hover:bg-gray-50 dark:hover:bg-[#26201B]/50 transition">
                        <div className="min-w-0">
                          <span className="font-black text-gray-700 dark:text-stone-300 block truncate">{prev.id}</span>
                          <span className="text-[10px] text-gray-400 dark:text-stone-400">
                            {new Date(prev.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-gray-900 dark:text-[#FFF9EE]">
                            {prev.requestedAmount.toLocaleString('ar-EG')} ج.م
                          </span>
                          {getStatusBadge(prev.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </ModalShell>
      )}

      {/* Modal: Confirm Paid (Manual Transfer Record) */}
      {isPaidModalOpen && targetPayoutForPaid && (
        <ModalShell
          title="تأكيد التحويل المالي وصرف المستحقات"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          onClose={() => setIsPaidModalOpen(false)}
          footer={
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPaidModalOpen(false)}
                className="px-4 py-2.5 text-xs text-gray-600 dark:text-stone-300 hover:bg-gray-100 dark:hover:bg-[#3B1E0E] rounded-xl transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                form="paid-form"
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد الصرف النهائي</span>
                  </>
                )}
              </button>
            </div>
          }
        >
          {paidFormError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-medium text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{paidFormError}</span>
            </div>
          )}

          {/* Target destination snapshot */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs space-y-1 text-emerald-950 dark:text-emerald-200">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold truncate">المستلم: {targetPayoutForPaid.sellerBrandName || targetPayoutForPaid.sellerName}</span>
              <span className="font-black whitespace-nowrap">{targetPayoutForPaid.requestedAmount.toLocaleString('ar-EG')} ج.م</span>
            </div>
            <div className="text-[11px] text-emerald-800 dark:text-emerald-300 flex flex-wrap items-center gap-2">
              <span>الوسيلة: {getMethodLabel(targetPayoutForPaid.paymentMethod)}</span>
              <span className="font-black bg-white dark:bg-[#1B1009] px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200">
                {targetPayoutForPaid.paymentDetailsSnapshot?.accountNumber}
              </span>
            </div>
          </div>

          <form id="paid-form" onSubmit={handleSubmitPaid} className="space-y-4 text-xs">
            {/* Transaction Reference (Mandatory) */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-stone-300 mb-1">
                رقم المعاملة / كود إيصال التحويل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: VF-9823471029 أو كود الحوالة البنكية"
                value={paidForm.transactionReference}
                onChange={(e) =>
                  setPaidForm({ ...paidForm, transactionReference: e.target.value })
                }
                className="w-full px-3 py-2.5 text-base sm:text-xs bg-gray-50 dark:bg-[#1B1009] border border-gray-200 dark:border-[#6B3A1F] rounded-xl text-gray-900 dark:text-[#FFF9EE] font-black focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-[#26160D] focus:outline-hidden transition"
              />
              <p className="text-[10px] text-gray-400 dark:text-stone-400 mt-1">
                سيتم إرسال هذا الرقم للحرفي في الإشعار ليكون دليلاً على إتمام الحوالة.
              </p>
            </div>

            {/* Method & Amount Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 dark:text-stone-300 mb-1">
                  طريقة التحويل المستخدمة
                </label>
                <select
                  value={paidForm.paymentMethod}
                  onChange={(e) =>
                    setPaidForm({
                      ...paidForm,
                      paymentMethod: e.target.value as PayoutMethod
                    })
                  }
                  className="w-full px-3 py-2.5 text-base sm:text-xs bg-gray-50 dark:bg-[#1B1009] border border-gray-200 dark:border-[#6B3A1F] rounded-xl text-gray-900 dark:text-[#FFF9EE] font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-[#26160D] focus:outline-hidden transition cursor-pointer"
                >
                  <option value="vodafone_cash">فودافون كاش</option>
                  <option value="instapay">إنستاباي InstaPay</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-stone-300 mb-1">
                  المبلغ المحول فعلياً (ج.م) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="1"
                  max={targetPayoutForPaid.requestedAmount}
                  required
                  value={paidForm.paidAmount}
                  onChange={(e) =>
                    setPaidForm({ ...paidForm, paidAmount: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-base sm:text-xs bg-gray-50 dark:bg-[#1B1009] border border-gray-200 dark:border-[#6B3A1F] rounded-xl text-gray-900 dark:text-[#FFF9EE] font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-[#26160D] focus:outline-hidden transition"
                />
              </div>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-stone-300 mb-1">
                تاريخ إجراء التحويل
              </label>
              <input
                type="date"
                value={paidForm.paymentDate}
                onChange={(e) =>
                  setPaidForm({ ...paidForm, paymentDate: e.target.value })
                }
                className="w-full px-3 py-2.5 text-base sm:text-xs bg-gray-50 dark:bg-[#1B1009] border border-gray-200 dark:border-[#6B3A1F] rounded-xl text-gray-900 dark:text-[#FFF9EE] focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-[#26160D] focus:outline-hidden transition"
              />
            </div>

            {/* Admin Note */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-stone-300 mb-1">
                ملاحظات إدارية (اختياري)
              </label>
              <textarea
                rows={2}
                placeholder="أي تفاصيل أو ملاحظات توثيقية إضافية..."
                value={paidForm.adminNote}
                onChange={(e) =>
                  setPaidForm({ ...paidForm, adminNote: e.target.value })
                }
                className="w-full px-3 py-2.5 text-base sm:text-xs bg-gray-50 dark:bg-[#1B1009] border border-gray-200 dark:border-[#6B3A1F] rounded-xl text-gray-900 dark:text-[#FFF9EE] focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-[#26160D] focus:outline-hidden transition"
              />
            </div>

            {/* Manual Confirmation Warning */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[11px] text-amber-900 dark:text-primary dark:text-primary-hover flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-primary dark:text-primary-hover shrink-0 mt-0.5" />
              <p>
                بتأكيد هذا الإجراء، تقر بأنك قمت بتحويل المبلغ يدوياً بالكامل إلى الحرفي خارج النظام، وسيقوم النظام فوراً بتحديث رصيد الحرفي وإرسال إشعار رسمي له.
              </p>
            </div>
          </form>
        </ModalShell>
      )}

      {/* Modal: Reject Payout */}
      {isRejectModalOpen && targetPayoutForReject && (
        <ModalShell
          maxWidth="sm:max-w-md"
          title="رفض طلب صرف المستحقات"
          icon={<XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />}
          onClose={() => setIsRejectModalOpen(false)}
          footer={
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2.5 text-xs text-gray-600 dark:text-stone-300 hover:bg-gray-100 dark:hover:bg-[#3B1E0E] rounded-xl transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                form="reject-form"
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري الرفض...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>تأكيد رفض الطلب</span>
                  </>
                )}
              </button>
            </div>
          }
        >
          {rejectError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-medium text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{rejectError}</span>
            </div>
          )}

          <div className="p-3 bg-gray-50 dark:bg-[#26160D] border border-gray-100 dark:border-[#6B3A1F] rounded-xl text-xs">
            <span className="text-gray-400 dark:text-stone-400 block">الطلب:</span>
            <span className="font-bold text-gray-900 dark:text-[#FFF9EE]">
              #{targetPayoutForReject.id} بمبلغ {targetPayoutForReject.requestedAmount.toLocaleString('ar-EG')} ج.م
            </span>
          </div>

          <form id="reject-form" onSubmit={handleSubmitReject} className="text-xs">
            <label className="block font-medium text-gray-700 dark:text-stone-300 mb-1">
              سبب الرفض (إلزامي) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="يرجى كتابة سبب الرفض بوضوح (مثلاً: رقم الحساب غير صحيح، أو تعذر إتمام التحويل عبر المحفظة...)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2.5 text-base sm:text-xs bg-gray-50 dark:bg-[#1B1009] border border-gray-200 dark:border-[#6B3A1F] rounded-xl text-gray-900 dark:text-[#FFF9EE] focus:ring-2 focus:ring-rose-500 focus:bg-white dark:focus:bg-[#26160D] focus:outline-hidden transition"
            />
            <p className="text-[10px] text-gray-400 dark:text-stone-400 mt-1">
              سيتم إرسال هذا السبب مباشرة إلى الحرفي في الإشعار ليتسنى له تصحيح البيانات.
            </p>
          </form>
        </ModalShell>
      )}
    </div>
  );
};

export default AdminPayouts;