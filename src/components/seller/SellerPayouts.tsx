import React, { useState, useEffect } from 'react';
import { RefreshDataButton } from '../common/RefreshDataButton.tsx';
import {
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Building2,
  Smartphone,
  Info,
  ChevronLeft,
  X,
  FileText,
  ShieldCheck,
  Send,
  AlertTriangle,
  History
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { PayoutRequest, SellerPayoutSummary, PayoutMethod } from '../../types.ts';

interface SellerPayoutsProps {
  user: { id: string; role: string; name?: string; sellerId?: string };
  onNavigateToAccount?: () => void;
}

export const SellerPayouts: React.FC<SellerPayoutsProps> = ({ user, onNavigateToAccount }) => {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [summary, setSummary] = useState<SellerPayoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Request Payout Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState<string>('');
  const [requestNotes, setRequestNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // View Details Modal state
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);

  const fetchPayoutData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getSellerPayouts(user);
      setPayouts(res.payouts);
      setSummary(res.summary);
    } catch (err: any) {
      console.error('Error fetching seller payouts:', err);
      setError(err?.message || 'تعذر تحميل بيانات المستحقات وطلبات الصرف');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutData();
  }, [user.id]);

  const handleOpenModal = () => {
    setFormError(null);
    if (!summary?.hasPayoutInfo) {
      setFormError('يرجى إضافة بيانات استلام المستحقات أولاً.');
      setIsModalOpen(true);
      return;
    }
    if ((summary?.availableBalance || 0) <= 0) {
      setFormError('لا يوجد رصيد متاح للسحب حالياً.');
      setIsModalOpen(true);
      return;
    }
    setRequestAmount(String(summary?.availableBalance || ''));
    setRequestNotes('');
    setIsModalOpen(true);
  };

  const handlePercentageClick = (pct: number) => {
    if (!summary) return;
    const amount = Math.floor(summary.availableBalance * pct);
    setRequestAmount(String(amount));
    setFormError(null);
  };

  const handleSubmitPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const amount = parseFloat(requestAmount);
    if (isNaN(amount) || amount <= 0) {
      setFormError('يرجى إدخال مبلغ صحيح أكبر من الصفر');
      return;
    }

    if (!summary?.hasPayoutInfo) {
      setFormError('يرجى إضافة بيانات استلام المستحقات أولاً.');
      return;
    }

    if (amount > (summary?.availableBalance || 0)) {
      setFormError(`المبلغ المطلوب يتجاوز الرصيد المتاح للسحب (${summary?.availableBalance.toLocaleString('ar-EG')} ج.م)`);
      return;
    }

    try {
      setActionLoading(true);
      await api.createSellerPayout(user, {
        amount,
        notes: requestNotes.trim() || undefined
      });
      setIsModalOpen(false);
      setSuccessMsg('تم إرسال طلب صرف المستحقات بنجاح، وهو الآن قيد مراجعة الإدارة');
      setTimeout(() => setSuccessMsg(null), 6000);
      await fetchPayoutData();
    } catch (err: any) {
      setFormError(err?.message || 'تعذر إرسال طلب الصرف');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelPayout = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في إلغاء طلب الصرف هذا؟')) {
      return;
    }

    try {
      setActionLoading(true);
      await api.cancelSellerPayout(user, id);
      setSuccessMsg('تم إلغاء طلب الصرف بنجاح');
      setTimeout(() => setSuccessMsg(null), 5000);
      await fetchPayoutData();
      if (selectedPayout?.id === id) {
        setSelectedPayout(null);
      }
    } catch (err: any) {
      alert(err?.message || 'تعذر إلغاء طلب الصرف');
    } finally {
      setActionLoading(false);
    }
  };

  const getMethodIcon = (method?: PayoutMethod) => {
    switch (method) {
      case 'vodafone_cash':
        return <Smartphone className="w-5 h-5 text-red-500" />;
      case 'instapay':
        return <CreditCard className="w-5 h-5 text-purple-600" />;
      case 'bank_transfer':
        return <Building2 className="w-5 h-5 text-blue-600" />;
      default:
        return <Wallet className="w-5 h-5 text-amber-600" />;
    }
  };

  const getMethodLabel = (method?: PayoutMethod) => {
    switch (method) {
      case 'vodafone_cash':
        return 'فودافون كاش';
      case 'instapay':
        return 'إنستاباي (InstaPay)';
      case 'bank_transfer':
        return 'تحويل بنكي';
      default:
        return method || 'غير محدد';
    }
  };

  const getStatusBadge = (status: PayoutRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            قيد المراجعة
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            تمت الموافقة
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            جارٍ التحويل
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            تم الصرف بنجاح
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            مرفوض
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            ملغي
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="seller-payouts-container" className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">طلب صرف المستحقات</h1>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
              المالية والأرباح
            </span>
          </div>
          <p className="text-sm text-gray-500">
            تابع رصيدك المالي، واطلب تحويل أرباح مبيعاتك مباشرة إلى حسابك أو محفظتك
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshDataButton
            id="refresh-payouts-btn"
            onRefresh={fetchPayoutData}
            isLoading={loading}
            label="تحديث المستحقات"
          />
          <button
            id="open-payout-request-btn"
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-xs transition duration-200"
          >
            <ArrowUpRight className="w-5 h-5" />
            <span>طلب صرف المستحقات</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Global Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Payout Info Notice if missing */}
      {!loading && summary && !summary.hasPayoutInfo && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 text-base">بيانات استلام المستحقات غير مكتملة</h4>
              <p className="text-sm text-amber-800 mt-1">
                يرجى إضافة بيانات استلام المستحقات أولاً (محفظة فودافون كاش أو إنستاباي أو حساب بنكي) لتتمكن من تقديم طلب صرف الأرباح.
              </p>
            </div>
          </div>
          {onNavigateToAccount && (
            <button
              id="navigate-to-account-btn"
              onClick={onNavigateToAccount}
              className="shrink-0 inline-flex items-center gap-1.5 bg-amber-800 hover:bg-amber-900 text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow-xs"
            >
              <span>إعداد بيانات الاستلام</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Earnings */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">إجمالي المستحقات</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                `${(summary?.totalEarnings || 0).toLocaleString('ar-EG')} ج.م`
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              إجمالي مبيعات الطلبات المؤكدة ({summary?.totalSalesCount || 0} قطعة)
            </p>
          </div>
        </div>

        {/* 2. Available Balance */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-100">المبلغ المتاح للسحب</span>
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center backdrop-blur-xs">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white">
              {loading ? (
                <div className="h-8 w-24 bg-white/30 animate-pulse rounded"></div>
              ) : (
                `${(summary?.availableBalance || 0).toLocaleString('ar-EG')} ج.م`
              )}
            </div>
            <p className="text-xs text-amber-100/80 mt-1">
              رصيدك الصافي الجاهز للتحويل الفوري
            </p>
          </div>
        </div>

        {/* 3. Under Review / Processing */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">المبالغ قيد المراجعة والتنفيذ</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                `${(summary?.pendingProcessing || 0).toLocaleString('ar-EG')} ج.م`
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              طلبات صرف جاري فحصها أو تنفيذ تحويلها
            </p>
          </div>
        </div>

        {/* 4. Total Paid */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">إجمالي المبالغ المصروفة</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                `${(summary?.totalPaid || 0).toLocaleString('ar-EG')} ج.م`
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              المبالغ التي تم استلامها بالفعل
            </p>
          </div>
        </div>
      </div>

      {/* Registered Payout Info Card */}
      {summary?.payoutInfo && (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-xl">
              {getMethodIcon(summary.payoutInfo.method)}
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium">وسيلة التحويل المعتمدة في حسابك</div>
              <div className="text-base font-bold text-gray-900 flex items-center gap-2 mt-0.5">
                <span>{getMethodLabel(summary.payoutInfo.method)}</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                  {summary.payoutInfo.account}
                </span>
              </div>
            </div>
          </div>
          {onNavigateToAccount && (
            <button
              onClick={onNavigateToAccount}
              className="text-xs text-amber-700 hover:text-amber-800 font-medium underline"
            >
              تعديل بيانات الحساب البنكي / المحفظة
            </button>
          )}
        </div>
      )}

      {/* Recent Payout Requests Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">آخر طلبات الصرف</h2>
          </div>
          <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
            {payouts.length} طلب
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">جاري تحميل سجل طلبات الصرف...</p>
          </div>
        ) : payouts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">لا توجد طلبات صرف حتى الآن</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-5">
              عندما يتوفر لديك رصيد من مبيعات منتجاتك، يمكنك الضغط على "طلب صرف المستحقات" لتحويل أرباحك
            </p>
            <button
              onClick={handleOpenModal}
              disabled={!summary || summary.availableBalance <= 0}
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition disabled:opacity-50"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>تقديم أول طلب صرف</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50/75 text-gray-500 text-xs font-medium border-b border-gray-100">
                  <th className="py-3.5 px-4">رقم الطلب</th>
                  <th className="py-3.5 px-4">المبلغ المطلوب</th>
                  <th className="py-3.5 px-4">المبلغ المنفذ</th>
                  <th className="py-3.5 px-4">طريقة التحويل</th>
                  <th className="py-3.5 px-4">تاريخ الطلب</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-gray-700">
                      {payout.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {payout.requestedAmount.toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="py-3.5 px-4 font-medium text-emerald-700">
                      {payout.paidAmount ? `${payout.paidAmount.toLocaleString('ar-EG')} ج.م` : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-700">
                        {getMethodIcon(payout.paymentMethod)}
                        <span>{getMethodLabel(payout.paymentMethod)}</span>
                      </div>
                      <span className="font-mono text-xs text-gray-400">
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
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedPayout(payout)}
                          className="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                        >
                          التفاصيل
                        </button>
                        {payout.status === 'pending' && (
                          <button
                            onClick={() => handleCancelPayout(payout.id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                          >
                            إلغاء
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

      {/* Modal: Request Payout */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                <Wallet className="w-5 h-5 text-amber-600" />
                <span>طلب صرف المستحقات</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {!summary?.hasPayoutInfo ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-gray-900">بيانات الاستلام غير مسجلة</h4>
                <p className="text-xs text-gray-500">
                  يجب تسجيل بيانات استلام المستحقات (فودافون كاش، إنستاباي، أو الحساب البنكي) أولاً في إعدادات الحساب.
                </p>
                {onNavigateToAccount && (
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      onNavigateToAccount();
                    }}
                    className="mt-2 bg-amber-600 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-amber-700 transition"
                  >
                    الانتقال لبيانات الحساب
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmitPayout} className="space-y-4">
                {/* Available balance highlight */}
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-900">الرصيد المتاح للسحب حالياً:</span>
                  <span className="text-lg font-extrabold text-amber-900">
                    {(summary?.availableBalance || 0).toLocaleString('ar-EG')} ج.م
                  </span>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    المبلغ المطلوب صرفه (ج.م) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      max={summary?.availableBalance}
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                      placeholder="0.00"
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-hidden transition"
                    />
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-medium">ج.م</span>
                  </div>

                  {/* Percentage quick select */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400">سحب سريع:</span>
                    <button
                      type="button"
                      onClick={() => handlePercentageClick(0.25)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition font-medium"
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePercentageClick(0.5)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition font-medium"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePercentageClick(0.75)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition font-medium"
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePercentageClick(1.0)}
                      className="text-xs px-2 py-1 bg-amber-100 hover:bg-amber-200 rounded-lg text-amber-900 transition font-medium"
                    >
                      الكل (100%)
                    </button>
                  </div>
                </div>

                {/* Payout Destination Info Box */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                  <div className="text-xs font-semibold text-gray-600">جهة التحويل:</div>
                  <div className="flex items-center gap-2 text-xs text-gray-900 font-bold">
                    {getMethodIcon(summary.payoutInfo?.method)}
                    <span>{getMethodLabel(summary.payoutInfo?.method)}</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                      {summary.payoutInfo?.account}
                    </span>
                  </div>
                </div>

                {/* Notes (Optional) */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    ملاحظات إضافية للإدارة (اختياري)
                  </label>
                  <textarea
                    rows={2}
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    placeholder="أي تعليمات أو ملاحظات ترغب في توضيحها..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-hidden transition"
                  />
                </div>

                {/* Important Manual Transfer Policy Notice */}
                <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs text-blue-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>سياسة التحويل المالي بسوق الصعيد</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-blue-800">
                    تتم مراجعة الطلب وتحويل المبلغ يدوياً من قِبل إدارة المنصة، وسيتم إشعارك فور اكتمال التحويل مع تسجيل رقم المعاملة الرسمية.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || (summary?.availableBalance || 0) <= 0}
                    className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري الإرسال...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>تأكيد إرسال الطلب</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: View Single Payout Details */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-gray-900 text-base">
                <FileText className="w-5 h-5 text-amber-600" />
                <span>تفاصيل طلب الصرف #{selectedPayout.id}</span>
              </div>
              <button
                onClick={() => setSelectedPayout(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Amount summary */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 block">المبلغ المطلوب:</span>
                <span className="text-xl font-black text-gray-900">
                  {selectedPayout.requestedAmount.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
              <div>{getStatusBadge(selectedPayout.status)}</div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-1">وسيلة التحويل:</span>
                <div className="font-bold text-gray-800 flex items-center gap-1.5">
                  {getMethodIcon(selectedPayout.paymentMethod)}
                  <span>{getMethodLabel(selectedPayout.paymentMethod)}</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-1">رقم الحساب / المحفظة:</span>
                <span className="font-bold font-mono text-gray-800">
                  {selectedPayout.paymentDetailsSnapshot?.accountNumber || '—'}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-1">تاريخ تقديم الطلب:</span>
                <span className="font-medium text-gray-800">
                  {new Date(selectedPayout.requestedAt || selectedPayout.createdAt).toLocaleString('ar-EG')}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-1">الرصيد عند الطلب:</span>
                <span className="font-medium text-gray-800">
                  {selectedPayout.sellerBalanceAtRequest ? `${selectedPayout.sellerBalanceAtRequest.toLocaleString('ar-EG')} ج.م` : '—'}
                </span>
              </div>
            </div>

            {/* Paid Information if completed */}
            {selectedPayout.status === 'paid' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-900">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تم تحويل المبلغ وتأكيد الصرف</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-emerald-700 block">المبلغ المحول:</span>
                    <span className="font-bold text-emerald-950">
                      {(selectedPayout.paidAmount || selectedPayout.requestedAmount).toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block">رقم المعاملة / الحوالة:</span>
                    <span className="font-mono font-bold text-emerald-950 bg-white px-2 py-0.5 rounded border border-emerald-300 inline-block">
                      {selectedPayout.transactionReference || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block">تاريخ التحويل:</span>
                    <span className="font-medium text-emerald-950">
                      {selectedPayout.paymentDate ? new Date(selectedPayout.paymentDate).toLocaleDateString('ar-EG') : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block">بواسطة الإدارة:</span>
                    <span className="font-medium text-emerald-950">
                      {selectedPayout.paidBy || 'إدارة المنصة'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Reason if rejected */}
            {selectedPayout.status === 'rejected' && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-900">
                <div className="flex items-center gap-1.5 font-bold text-rose-800">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>سبب رفض طلب الصرف:</span>
                </div>
                <p className="text-xs text-rose-950 bg-white p-2.5 rounded-lg border border-rose-200 font-medium mt-1">
                  {selectedPayout.rejectionReason || 'لم يتم تحديد سبب'}
                </p>
              </div>
            )}

            {/* Notes if present */}
            {selectedPayout.sellerNotes && (
              <div className="p-3 bg-gray-50 rounded-xl text-xs">
                <span className="text-gray-400 block mb-1">ملاحظاتك:</span>
                <p className="text-gray-800 font-medium">{selectedPayout.sellerNotes}</p>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              {selectedPayout.status === 'pending' ? (
                <button
                  onClick={() => handleCancelPayout(selectedPayout.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition"
                >
                  إلغاء هذا الطلب
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={() => setSelectedPayout(null)}
                className="px-4 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
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

export default SellerPayouts;
