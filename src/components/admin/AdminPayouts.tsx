import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  FileText,
  Building2,
  Smartphone,
  CreditCard,
  X,
  Send,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  User,
  MapPin,
  Calendar,
  History,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type {
  PayoutRequest,
  AdminPayoutSummary,
  PayoutMethod,
  PayoutStatus,
  Seller
} from '../../types.ts';

interface AdminPayoutsProps {
  user: { id: string; role: string; name?: string };
}

export const AdminPayouts: React.FC<AdminPayoutsProps> = ({ user }) => {
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
  const [payoutDetails, setPayoutDetails] = useState<{
    payout: PayoutRequest;
    seller: Seller | null;
    currentAvailableBalance: number;
    sellerPreviousPayouts: PayoutRequest[];
    totalSellerEarnings: number;
  } | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

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
      const details = await api.getAdminPayoutById(user, id);
      setPayoutDetails(details);
    } catch (err: any) {
      alert(err?.message || 'تعذر جلب تفاصيل طلب الصرف');
      setSelectedPayoutId(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من الموافقة على طلب الصرف هذا؟')) return;

    try {
      setActionLoading(true);
      await api.approveAdminPayout(user, id);
      setSuccessMsg('تمت الموافقة على طلب الصرف بنجاح وإشعار الحرفي');
      setTimeout(() => setSuccessMsg(null), 5000);
      await fetchPayouts();
      if (selectedPayoutId === id) {
        handleOpenDetails(id);
      }
    } catch (err: any) {
      alert(err?.message || 'تعذر الموافقة على طلب الصرف');
    } finally {
      setActionLoading(false);
    }
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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            قيد الانتظار
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            تمت الموافقة
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            جارٍ التحويل اليدوي
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            تم الصرف والتأكيد
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            مرفوض
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            ملغي من الحرفي
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="admin-payouts-container" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">إدارة طلبات صرف المستحقات</h1>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
              المالية اليدوية
            </span>
          </div>
          <p className="text-sm text-gray-500">
            مراجعة طلبات صرف مستحقات الحرفيين والبائعين، وتنفيذ التحويلات اليدوية، وتسجيل أرقام الحوالات
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPayouts}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-xl border border-gray-200 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث الطلبات</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">طلبات قيد الانتظار</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">
              {summary ? `${summary.totalPendingAmount.toLocaleString('ar-EG')} ج.م` : '—'}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <span>{summary?.totalPendingCount || 0} طلب يحتاج مراجعة</span>
            </div>
          </div>
        </div>

        {/* Processing Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">جاري التحويل والتنفيذ</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">
              {summary ? `${summary.totalApprovedProcessingAmount.toLocaleString('ar-EG')} ج.م` : '—'}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-indigo-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
              <span>{summary?.totalApprovedProcessingCount || 0} طلب قيد التحويل</span>
            </div>
          </div>
        </div>

        {/* Paid Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">إجمالي المبالغ المصروفة</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-700">
              {summary ? `${summary.totalPaidAmount.toLocaleString('ar-EG')} ج.م` : '—'}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>{summary?.totalPaidCount || 0} طلب تم تحويله بنجاح</span>
            </div>
          </div>
        </div>

        {/* Rejected Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">الطلبات المرفوضة</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">
              {summary?.totalRejectedCount || 0}
            </div>
            <p className="text-xs text-gray-400 mt-1">طلبات تم رفضها مع توضيح السبب</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
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
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition ${
                statusFilter === tab.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
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
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden transition"
          />
          <button
            type="submit"
            className="absolute left-2.5 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Main Payouts Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">جاري تحميل طلبات صرف المستحقات...</p>
          </div>
        ) : payouts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">لا توجد طلبات صرف تطابق المعايير</h3>
            <p className="text-xs text-gray-500">
              لم يتم العثور على أي طلبات في هذه الحالة أو بكلمة البحث المدخلة
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50/75 text-gray-500 text-xs font-medium border-b border-gray-100">
                  <th className="py-3.5 px-4">رقم الطلب</th>
                  <th className="py-3.5 px-4">الحرفي / الورشة</th>
                  <th className="py-3.5 px-4">المبلغ المطلوب</th>
                  <th className="py-3.5 px-4">وسيلة ورقم التحويل</th>
                  <th className="py-3.5 px-4">تاريخ الطلب</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-bold text-gray-800 block">
                        {payout.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 text-xs">
                        {payout.sellerBrandName || payout.sellerName}
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{payout.sellerGovernorate || 'الصعيد'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-gray-900 text-sm">
                        {payout.requestedAmount.toLocaleString('ar-EG')} ج.م
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-800 font-medium">
                        {getMethodIcon(payout.paymentMethod)}
                        <span>{getMethodLabel(payout.paymentMethod)}</span>
                      </div>
                      <span className="font-mono text-xs text-gray-500 block">
                        {payout.paymentDetailsSnapshot?.accountNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">
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
                        {/* Details button */}
                        <button
                          onClick={() => handleOpenDetails(payout.id)}
                          title="عرض ومراجعة الطلب"
                          className="p-1.5 text-gray-600 hover:text-amber-700 bg-gray-50 hover:bg-amber-50 rounded-lg transition border border-gray-200"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Direct action based on status */}
                        {payout.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(payout.id)}
                              disabled={actionLoading}
                              title="موافقة على الطلب"
                              className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                            >
                              موافقة
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(payout)}
                              disabled={actionLoading}
                              title="رفض الطلب"
                              className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
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
                            className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition inline-flex items-center gap-1 shadow-xs"
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
        )}
      </div>

      {/* Modal: Full Payout Review & Seller Balance Details */}
      {selectedPayoutId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-gray-100 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-gray-900 text-lg">
                <FileText className="w-5 h-5 text-amber-600" />
                <span>مراجعة طلب الصرف #{selectedPayoutId}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedPayoutId(null);
                  setPayoutDetails(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-12 text-center">
                <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-500">جاري جلب تفاصيل الحرفي والبيانات المالية...</p>
              </div>
            ) : payoutDetails ? (
              <div className="space-y-5">
                {/* Status & Amount Highlight */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-gray-500 block">المبلغ المطلوب:</span>
                    <span className="text-2xl font-black text-gray-900">
                      {payoutDetails.payout.requestedAmount.toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(payoutDetails.payout.status)}
                  </div>
                </div>

                {/* Seller Real-Time Financial Balance Safety Audit */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">فحص الرصيد الفعلي للبائع:</span>
                    <span className="text-xs bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-mono">
                      محسوب مباشرة من قاعدة البيانات
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-white rounded-lg border border-amber-100">
                      <span className="text-gray-400 block">إجمالي الأرباح التاريخية:</span>
                      <span className="font-bold text-gray-900 text-sm">
                        {payoutDetails.totalSellerEarnings.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-amber-100">
                      <span className="text-gray-400 block">الرصيد المتاح الحالي:</span>
                      <span className="font-bold text-emerald-700 text-sm">
                        {payoutDetails.currentAvailableBalance.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-amber-100 col-span-2 sm:col-span-1">
                      <span className="text-gray-400 block">الرصيد لحظة الطلب:</span>
                      <span className="font-bold text-gray-700 text-sm">
                        {payoutDetails.payout.sellerBalanceAtRequest
                          ? `${payoutDetails.payout.sellerBalanceAtRequest.toLocaleString('ar-EG')} ج.م`
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seller Info & Payment Destination Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-amber-600" />
                      <span>بيانات الحرفي والورشة</span>
                    </h4>
                    <div>
                      <span className="text-gray-400 block">اسم الورشة / الحرفي:</span>
                      <span className="font-bold text-gray-800">
                        {payoutDetails.seller?.brandName || payoutDetails.payout.sellerBrandName || payoutDetails.seller?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">المحافظة:</span>
                      <span className="text-gray-700">
                        {payoutDetails.seller?.governorate || payoutDetails.payout.sellerGovernorate || 'غير محدد'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">رقم الهاتف:</span>
                      <span className="font-mono text-gray-700">
                        {payoutDetails.seller?.phone || 'غير مسجل'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-amber-600" />
                      <span>بيانات تحويل المستحقات</span>
                    </h4>
                    <div>
                      <span className="text-gray-400 block">وسيلة الاستلام:</span>
                      <div className="font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
                        {getMethodIcon(payoutDetails.payout.paymentMethod)}
                        <span>{getMethodLabel(payoutDetails.payout.paymentMethod)}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400 block">رقم الحساب / المحفظة:</span>
                      <span className="font-bold font-mono text-sm bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-900 inline-block mt-0.5">
                        {payoutDetails.payout.paymentDetailsSnapshot?.accountNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">اسم صاحب الحساب:</span>
                      <span className="text-gray-700">
                        {payoutDetails.payout.paymentDetailsSnapshot?.accountHolderName || payoutDetails.seller?.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seller Notes if present */}
                {payoutDetails.payout.sellerNotes && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                    <span className="text-gray-400 block mb-1">ملاحظات الحرفي:</span>
                    <p className="text-gray-800">{payoutDetails.payout.sellerNotes}</p>
                  </div>
                )}

                {/* Completed Payment Record if Paid */}
                {payoutDetails.payout.status === 'paid' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-900">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>بيانات الحوالة والتحويل المالي المسجلة</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="text-emerald-700 block">المبلغ المنفذ:</span>
                        <span className="font-bold text-emerald-950">
                          {payoutDetails.payout.paidAmount?.toLocaleString('ar-EG')} ج.م
                        </span>
                      </div>
                      <div>
                        <span className="text-emerald-700 block">رقم المعاملة / الحوالة:</span>
                        <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 inline-block text-emerald-950">
                          {payoutDetails.payout.transactionReference}
                        </span>
                      </div>
                      <div>
                        <span className="text-emerald-700 block">تاريخ التحويل:</span>
                        <span className="font-medium text-emerald-950">
                          {payoutDetails.payout.paymentDate
                            ? new Date(payoutDetails.payout.paymentDate).toLocaleDateString('ar-EG')
                            : '—'}
                        </span>
                      </div>
                    </div>
                    {payoutDetails.payout.adminNote && (
                      <div className="mt-2 pt-2 border-t border-emerald-200 text-[11px]">
                        <span className="text-emerald-700 block font-semibold">ملاحظات الإدارة:</span>
                        <p className="text-emerald-950">{payoutDetails.payout.adminNote}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Rejection info if rejected */}
                {payoutDetails.payout.status === 'rejected' && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-900">
                    <div className="flex items-center gap-1.5 font-bold text-rose-800">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>سبب الرفض المسجل:</span>
                    </div>
                    <p className="text-xs bg-white p-2.5 rounded-lg border border-rose-200 font-medium mt-1 text-rose-950">
                      {payoutDetails.payout.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Seller Previous Payouts List */}
                {payoutDetails.sellerPreviousPayouts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-gray-400" />
                      <span>سجل طلبات الصرف السابقة لهذا الحرفي ({payoutDetails.sellerPreviousPayouts.length})</span>
                    </h4>
                    <div className="max-h-36 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-xl text-xs">
                      {payoutDetails.sellerPreviousPayouts.map((prev) => (
                        <div key={prev.id} className="p-2.5 flex items-center justify-between hover:bg-gray-50">
                          <div>
                            <span className="font-mono text-gray-700 block">{prev.id}</span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(prev.createdAt).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                          <div className="text-left flex items-center gap-2">
                            <span className="font-bold text-gray-900">
                              {prev.requestedAmount.toLocaleString('ar-EG')} ج.م
                            </span>
                            {getStatusBadge(prev.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Workflow Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {payoutDetails.payout.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(payoutDetails.payout.id)}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                        >
                          موافقة على الطلب
                        </button>
                        <button
                          onClick={() => handleOpenRejectModal(payoutDetails.payout)}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded-xl transition"
                        >
                          رفض الطلب
                        </button>
                      </>
                    )}

                    {payoutDetails.payout.status === 'approved' && (
                      <button
                        onClick={() => handleMarkProcessing(payoutDetails.payout.id)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
                      >
                        بدء التحويل اليدوي
                      </button>
                    )}

                    {(payoutDetails.payout.status === 'approved' || payoutDetails.payout.status === 'processing') && (
                      <button
                        onClick={() => handleOpenPaidModal(payoutDetails.payout)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تأكيد التحويل والصرف</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPayoutId(null);
                      setPayoutDetails(null);
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-xl transition"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Modal: Confirm Paid (Manual Transfer Record) */}
      {isPaidModalOpen && targetPayoutForPaid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-gray-900 text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>تأكيد التحويل المالي وصرف المستحقات</span>
              </div>
              <button
                onClick={() => setIsPaidModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paidFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paidFormError}</span>
              </div>
            )}

            {/* Target destination snapshot */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-950">
              <div className="flex items-center justify-between">
                <span className="font-bold">المستلم: {targetPayoutForPaid.sellerBrandName || targetPayoutForPaid.sellerName}</span>
                <span className="font-mono font-bold">{targetPayoutForPaid.requestedAmount.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="text-[11px] text-emerald-800 flex items-center gap-2">
                <span>الوسيلة: {getMethodLabel(targetPayoutForPaid.paymentMethod)}</span>
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300">
                  {targetPayoutForPaid.paymentDetailsSnapshot?.accountNumber}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitPaid} className="space-y-4 text-xs">
              {/* Transaction Reference (Mandatory) */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden transition"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  سيتم إرسال هذا الرقم للحرفي في الإشعار ليكون دليلاً على إتمام الحوالة.
                </p>
              </div>

              {/* Method & Amount Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden transition"
                  >
                    <option value="vodafone_cash">فودافون كاش</option>
                    <option value="instapay">إنستاباي InstaPay</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    المبلغ المحول فعلياً (ج.م) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    max={targetPayoutForPaid.requestedAmount}
                    required
                    value={paidForm.paidAmount}
                    onChange={(e) =>
                      setPaidForm({ ...paidForm, paidAmount: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden transition"
                  />
                </div>
              </div>

              {/* Payment Date */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  تاريخ إجراء التحويل
                </label>
                <input
                  type="date"
                  value={paidForm.paymentDate}
                  onChange={(e) =>
                    setPaidForm({ ...paidForm, paymentDate: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden transition"
                />
              </div>

              {/* Admin Note */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  ملاحظات إدارية (اختياري)
                </label>
                <textarea
                  rows={2}
                  placeholder="أي تفاصيل أو ملاحظات توثيقية إضافية..."
                  value={paidForm.adminNote}
                  onChange={(e) =>
                    setPaidForm({ ...paidForm, adminNote: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden transition"
                />
              </div>

              {/* Manual Confirmation Warning */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  بتأكيد هذا الإجراء، تقر بأنك قمت بتحويل المبلغ يدوياً بالكامل إلى الحرفي خارج النظام، وسيقوم النظام فوراً بتحديث رصيد الحرفي وإرسال إشعار رسمي له.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaidModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition"
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
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reject Payout */}
      {isRejectModalOpen && targetPayoutForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-gray-900 text-base">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>رفض طلب صرف المستحقات</span>
              </div>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {rejectError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{rejectError}</span>
              </div>
            )}

            <div className="p-3 bg-gray-50 rounded-xl text-xs">
              <span className="text-gray-400 block">الطلب:</span>
              <span className="font-bold text-gray-900">
                #{targetPayoutForReject.id} بمبلغ {targetPayoutForReject.requestedAmount.toLocaleString('ar-EG')} ج.م
              </span>
            </div>

            <form onSubmit={handleSubmitReject} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  سبب الرفض (إلزامي) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="يرجى كتابة سبب الرفض بوضوح (مثلاً: رقم الحساب غير صحيح، أو تعذر إتمام التحويل عبر المحفظة...)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-hidden transition"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  سيتم إرسال هذا السبب مباشرة إلى الحرفي في الإشعار ليتسنى له تصحيح البيانات.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition"
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayouts;
