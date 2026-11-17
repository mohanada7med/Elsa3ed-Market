import React, { useEffect, useState, useMemo } from 'react';
import {
  BadgeCheck,
  Clock3,
  Megaphone,
  RefreshCw,
  Trash2,
  Phone,
  MessageCircle,
  MapPin,
  TrendingUp,
  DollarSign,
  Package,
  Store,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Check,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import type {
  HomePromotionPosition,
  PaidPromotion,
  PaidPromotionRequest,
  Product,
  Seller,
  UserProfile
} from '../../types';

interface PaidPromotionRequestsPanelProps {
  user: UserProfile;
  products: Product[];
  sellers: Seller[];
  addToast: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export const PaidPromotionRequestsPanel: React.FC<PaidPromotionRequestsPanelProps> = ({
  user,
  products,
  sellers,
  addToast
}) => {
  const [requests, setRequests] = useState<PaidPromotionRequest[]>([]);
  const [activePromotion, setActivePromotion] = useState<PaidPromotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'active' | 'archived' | 'all'>('pending');

  const refreshRequests = async () => {
    setLoadError('');
    setLoading(true);
    try {
      const [allRequests, active] = await Promise.all([
        api.getAdminPromotionRequests(user, 'all'),
        api.getAdminPaidPromotion(user)
      ]);
      setRequests(allRequests);
      setActivePromotion(active);
    } catch (error) {
      setLoadError((error as Error).message || 'تعذر تحميل طلبات الاشتراك');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshRequests();
  }, [user.id]);

  // Statistics
  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === 'pending').length;
    const active = requests.filter((r) => r.status === 'active').length;
    const archived = requests.filter((r) => r.status === 'rejected' || r.status === 'expired').length;
    const totalRevenue = requests
      .filter((r) => r.paidAmount && (r.status === 'active' || r.status === 'expired'))
      .reduce((sum, r) => sum + (r.paidAmount || 0), 0);

    return {
      total: requests.length,
      pending,
      active,
      archived,
      totalRevenue
    };
  }, [requests]);

  // Filtered requests based on active tab
  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests;
    if (statusFilter === 'pending') return requests.filter((r) => r.status === 'pending');
    if (statusFilter === 'active') return requests.filter((r) => r.status === 'active');
    if (statusFilter === 'archived') return requests.filter((r) => r.status === 'rejected' || r.status === 'expired');
    return requests;
  }, [requests, statusFilter]);

  return (
    <section dir="rtl" className="space-y-6 rounded-[2rem] border border-border bg-surface p-5 shadow-xs sm:p-8 text-foreground">
      {/* HEADER */}
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:text-primary-hover">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">إدارة طلبات مساحة الترشيح المدفوعة</h2>
            <p className="mt-1 text-xs leading-6 text-foreground-secondary">
              متابعة طلبات الورش الحرفية، تأكيد الدفع والتواصل المباشر مع البائع، وتفعيل الإعلان على الصفحة الرئيسية.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refreshRequests()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-foreground transition hover:border-primary disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث الطلبات
        </button>
      </header>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-border bg-background p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-foreground-secondary block mb-1">طلبات بانتظار التأكيد</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{stats.pending}</span>
            <span className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock3 className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-foreground-secondary block mb-1">الحملة النشطة الحالية</span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {activePromotion ? 'مفعّلة على الرئيسية' : 'شاغرة حالياً'}
            </span>
            <span className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <BadgeCheck className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-foreground-secondary block mb-1">إجمالي طلبات الورش</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-foreground font-mono">{stats.total}</span>
            <span className="h-8 w-8 rounded-xl bg-primary/10 text-primary dark:text-primary-hover flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-foreground-secondary block mb-1">عوائد الترويج المحصلة</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.totalRevenue.toLocaleString('ar-EG')} ج.م
            </span>
            <span className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>

      {/* ACTIVE PROMOTION OVERVIEW (IF PRESENT) */}
      {activePromotion && (
        <ActivePromotionCard
          promotion={activePromotion}
          products={products.filter((product) => product.approvalStatus === 'approved')}
          sellers={sellers.filter((seller) => seller.status === 'approved')}
          user={user}
          addToast={addToast}
          onUpdated={() => void refreshRequests()}
          onRemoved={() => {
            setActivePromotion(null);
            addToast('تم إيقاف الترشيح', 'لم يعد المحتوى يظهر في الموقع.', 'success');
          }}
        />
      )}

      {/* TABS / STATUS FILTER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-black/5 dark:bg-white/5 text-foreground-secondary hover:text-foreground'
            }`}
          >
            قيد المراجعة ({stats.pending})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-black/5 dark:bg-white/5 text-foreground-secondary hover:text-foreground'
            }`}
          >
            المفعّلة ({stats.active})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('archived')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'archived'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-black/5 dark:bg-white/5 text-foreground-secondary hover:text-foreground'
            }`}
          >
            الأرشيف والسجل ({stats.archived})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-black/5 dark:bg-white/5 text-foreground-secondary hover:text-foreground'
            }`}
          >
            كافة الطلبات ({stats.total})
          </button>
        </div>

        <span className="text-xs text-foreground-secondary">
          عرض {filteredRequests.length} طلب
        </span>
      </div>

      {loadError && (
        <div role="alert" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs font-bold text-rose-700 dark:text-rose-300">
          {loadError}
          <button type="button" onClick={() => void refreshRequests()} className="mr-3 font-black underline cursor-pointer">
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !loadError && filteredRequests.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-2">
          <BadgeCheck className="mx-auto h-8 w-8 text-emerald-600 opacity-60" />
          <p className="text-sm font-bold text-foreground">لا توجد طلبات في هذا التبويب حالياً</p>
          <p className="text-xs text-foreground-secondary">
            {statusFilter === 'pending'
              ? 'كافة طلبات الاشتراك تمت مراجعتها بالكامل.'
              : 'يمكنك اختيار تبويب آخر لمراجعة الطلبات السابقة أو المعلقة.'}
          </p>
        </div>
      )}

      {/* REQUESTS LIST */}
      <div className="space-y-5">
        {filteredRequests.map((req) => (
          <PromotionRequestCard
            key={req.id}
            request={req}
            products={products.filter((product) => product.approvalStatus === 'approved')}
            sellers={sellers.filter((seller) => seller.status === 'approved')}
            user={user}
            addToast={addToast}
            onActivated={() => {
              void refreshRequests();
            }}
            onRejected={() => {
              void refreshRequests();
            }}
          />
        ))}
      </div>
    </section>
  );
};

interface PromotionRequestCardProps {
  request: PaidPromotionRequest;
  products: Product[];
  sellers: Seller[];
  user: UserProfile;
  addToast: PaidPromotionRequestsPanelProps['addToast'];
  onActivated: (id: string) => void;
  onRejected: (id: string) => void;
}

const PromotionRequestCard: React.FC<PromotionRequestCardProps> = ({
  request,
  products,
  sellers,
  user,
  addToast,
  onActivated,
  onRejected
}) => {
  const [contentType, setContentType] = useState<'product' | 'seller'>(request.contentType || 'product');
  const [contentId, setContentId] = useState(request.contentId || '');
  const [durationDays, setDurationDays] = useState(String(request.durationDays || '7'));
  const [paidAmount, setPaidAmount] = useState(request.paidAmount ? String(request.paidAmount) : '150');
  const [homepagePosition, setHomepagePosition] = useState<HomePromotionPosition>(request.homepagePosition || 'after-hero');
  const [submitting, setSubmitting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const choices = contentType === 'product' ? products : sellers;
  useEffect(() => {
    if (request.contentId && choices.some((c) => c.id === request.contentId)) {
      setContentId(request.contentId);
    } else if (!contentId || !choices.some((c) => c.id === contentId)) {
      setContentId(choices[0]?.id || '');
    }
  }, [contentType, products, sellers, request.contentId]);

  // Find seller info for contact
  const matchedSeller = useMemo(() => {
    return sellers.find((s) => s.id === request.sellerId || s.userId === request.sellerUserId) || null;
  }, [sellers, request.sellerId, request.sellerUserId]);

  const sellerPhone = request.sellerPhone || matchedSeller?.phone || '';
  const sellerGov = request.sellerGovernorate || matchedSeller?.governorate || '';

  const cleanPhone = sellerPhone.replace(/\D/g, '');
  const formattedWhatsAppUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone}?text=${encodeURIComponent(
        `السلام عليكم ورحمة الله، بخصوص طلب مساحة ترشيح وه الترويجية لورشة (${request.sellerName}):`
      )}`
    : '';

  const activate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.activatePaidPromotion(user, request.id, {
        contentType,
        contentId,
        durationDays: Number(durationDays),
        paidAmount: Number(paidAmount),
        homepagePosition
      });
      onActivated(request.id);
      addToast('تم تفعيل مساحة الترشيح', `تم تأكيد الدفع وإطلاق إعلان ورشة "${request.sellerName}" بنجاح على الصفحة الرئيسية.`, 'success');
    } catch (error) {
      addToast('تعذر تفعيل مساحة الترشيح', (error as Error).message || 'راجع البيانات وحاول مرة أخرى', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectConfirm = async (event: React.FormEvent) => {
    event.preventDefault();
    setRejecting(true);
    try {
      await api.rejectPaidPromotionRequest(user, request.id, rejectionReason.trim());
      setIsRejectDialogOpen(false);
      onRejected(request.id);
      addToast('تم رفض الطلب', `تم رفض طلب الاشتراك وإشعار الورشة بالسبب بنجاح.`, 'info');
    } catch (error) {
      addToast('تعذر رفض الطلب', (error as Error).message || 'حاول مرة أخرى', 'error');
    } finally {
      setRejecting(false);
    }
  };

  const statusBadge = useMemo(() => {
    switch (request.status) {
      case 'active':
        return <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-black text-emerald-700 dark:text-emerald-300">مفعّل حالياً</span>;
      case 'rejected':
        return <span className="rounded-full bg-rose-500/15 px-3 py-1 text-[10px] font-black text-rose-700 dark:text-rose-300">مرفوض</span>;
      case 'expired':
        return <span className="rounded-full bg-black/10 dark:bg-white/10 px-3 py-1 text-[10px] font-black text-foreground-secondary">منتهي</span>;
      default:
        return <span className="rounded-full bg-amber-500/15 px-3 py-1 text-[10px] font-black text-amber-700 dark:text-amber-300">بانتظار المراجعة والتأكيد</span>;
    }
  }, [request.status]);

  return (
    <article className="rounded-2xl border border-border bg-background p-4 sm:p-6 shadow-2xs space-y-4">
      {/* Header & Seller Contact */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black text-base text-foreground flex items-center gap-1.5">
              <Store className="h-4 w-4 text-primary dark:text-primary-hover" />
              {request.sellerName}
            </h3>
            {sellerGov && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-foreground-secondary flex items-center gap-1">
                <MapPin className="h-3 w-3 text-amber-500" />
                {sellerGov}
              </span>
            )}
            <span className="text-[11px] text-foreground-secondary font-mono">
              تاريخ الطلب: {new Date(request.createdAt).toLocaleDateString('ar-EG')}
            </span>
          </div>

          {/* Contact Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {sellerPhone && (
              <>
                <a
                  href={`tel:${sellerPhone}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1 text-xs font-bold text-foreground hover:border-primary transition"
                  title="اتصال هاتفي بالبائع"
                >
                  <Phone className="h-3.5 w-3.5 text-blue-500" />
                  <span>{sellerPhone}</span>
                </a>

                {formattedWhatsAppUrl && (
                  <a
                    href={formattedWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-3 py-1 text-xs font-bold transition"
                    title="مراسلة البائع واتساب"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span>مراسلة واتساب</span>
                  </a>
                )}
              </>
            )}
          </div>

          {request.message && (
            <div className="mt-2 rounded-xl bg-surface border border-border p-3 text-xs text-foreground-secondary">
              <span className="font-bold text-foreground block mb-0.5">رسالة الورشة:</span>
              <p className="whitespace-pre-wrap">{request.message}</p>
            </div>
          )}

          {/* Preferences Pill */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="font-bold text-foreground">تفضيلات الورشة:</span>
            <span className="rounded-lg bg-primary/10 px-2 py-0.5 font-bold text-primary dark:text-primary-hover">
              {request.contentType === 'product' ? 'ترويج منتج محدد' : 'ترويج ملف الورشة'}
            </span>
            {request.durationDays && (
              <span className="rounded-lg bg-black/5 dark:bg-white/5 px-2 py-0.5 text-foreground-secondary font-medium">
                {request.durationDays} يوم
              </span>
            )}
            {request.homepagePosition && (
              <span className="rounded-lg bg-black/5 dark:bg-white/5 px-2 py-0.5 text-foreground-secondary font-medium">
                الموضع: {request.homepagePosition}
              </span>
            )}
          </div>

          {request.rejectionReason && (
            <div className="rounded-xl border border-rose-300 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300">
              <span className="font-bold block mb-0.5">سبب الرفض الموجه للتاجر:</span>
              <p>{request.rejectionReason}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {statusBadge}
          {request.status === 'pending' && (
            <button
              type="button"
              onClick={() => setIsRejectDialogOpen(true)}
              disabled={rejecting}
              className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-bold transition cursor-pointer"
            >
              رفض الطلب مع إبداء سبب
            </button>
          )}
        </div>
      </div>

      {/* Activation Form (For pending requests) */}
      {request.status === 'pending' && (
        <form onSubmit={activate} className="pt-2 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-xs font-bold text-foreground">
              نوع المحتوى
              <select
                value={contentType}
                onChange={(event) => setContentType(event.target.value as 'product' | 'seller')}
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-xs outline-none focus:border-primary cursor-pointer"
              >
                <option value="product">منتج معتمد</option>
                <option value="seller">ورشة معتمدة</option>
              </select>
            </label>

            <label className="text-xs font-bold text-foreground">
              المحتوى المختار
              <select
                value={contentId}
                onChange={(event) => setContentId(event.target.value)}
                required
                disabled={!choices.length}
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-xs outline-none focus:border-primary disabled:opacity-50 cursor-pointer"
              >
                {choices.length === 0 && <option value="">لا يوجد محتوى معتمد</option>}
                {contentType === 'product'
                  ? products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.title} — {product.sellerName} ({product.price} ج.م)
                      </option>
                    ))
                  : sellers.map((seller) => (
                      <option key={seller.id} value={seller.id}>
                        {seller.brandName || seller.name} ({seller.governorate})
                      </option>
                    ))}
              </select>
            </label>

            <label className="text-xs font-bold text-foreground">
              مدة الظهور (أيام)
              <input
                type="number"
                min="1"
                max="365"
                required
                value={durationDays}
                onChange={(event) => setDurationDays(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-xs outline-none focus:border-primary font-mono"
              />
            </label>

            <label className="text-xs font-bold text-foreground">
              المبلغ المدفوع (ج.م)
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={paidAmount}
                onChange={(event) => setPaidAmount(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-xs outline-none focus:border-primary font-mono"
              />
            </label>

            <label className="text-xs font-bold text-foreground">
              موضع الظهور
              <HomePositionSelect value={homepagePosition} onChange={setHomepagePosition} />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || !choices.length}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-black transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <BadgeCheck className="h-4 w-4" />
              <span>{submitting ? 'جارٍ التفعيل...' : 'تأكيد الدفع وإطلاق الإعلان'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Rejection Dialog with constructive reason */}
      {isRejectDialogOpen && (
        <div className="rounded-xl border border-rose-300 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-rose-800 dark:text-rose-200 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              توضيح سبب رفض طلب الورشة
            </h4>
            <button
              type="button"
              onClick={() => setIsRejectDialogOpen(false)}
              className="text-foreground-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[11px] text-foreground-secondary">
            سيصل هذا السبب كإشعار مباشر لصاحب الورشة لمساعدته في تصحيح البيانات وإعادة التقديم.
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={2}
            placeholder="مثال: يرجى تحسين جودة صورة المنتج، أو المنتج غير متوفر بالكمية الكافية..."
            className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:border-primary"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRejectDialogOpen(false)}
              className="px-3 py-1.5 text-xs font-bold text-foreground-secondary hover:text-foreground"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleRejectConfirm}
              disabled={rejecting}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              {rejecting ? 'جارٍ الرفض...' : 'تأكيد الرفض وإشعار الورشة'}
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

const HOME_POSITION_OPTIONS: Array<{ value: HomePromotionPosition; label: string }> = [
  { value: 'after-hero', label: 'أعلى الرئيسية (بعد الهيرو)' },
  { value: 'after-product-of-week', label: 'بعد منتج الأسبوع' },
  { value: 'after-governorates', label: 'بعد قسم المحافظات' },
  { value: 'after-reels', label: 'بعد ريلز الحرف' },
  { value: 'before-market', label: 'قبل سوق المنتجات' },
  { value: 'after-market', label: 'بعد سوق المنتجات' },
  { value: 'after-quiz', label: 'بعد اختبار الصعيد' },
  { value: 'after-sellers', label: 'بعد دليل الورش' }
];

const HomePositionSelect: React.FC<{
  value: HomePromotionPosition;
  onChange: (value: HomePromotionPosition) => void;
}> = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(event) => onChange(event.target.value as HomePromotionPosition)}
    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-xs outline-none focus:border-primary cursor-pointer"
  >
    {HOME_POSITION_OPTIONS.map((option) => (
      <option key={option.value} value={option.value}>{option.label}</option>
    ))}
  </select>
);

interface ActivePromotionCardProps {
  promotion: PaidPromotion;
  products: Product[];
  sellers: Seller[];
  user: UserProfile;
  addToast: PaidPromotionRequestsPanelProps['addToast'];
  onUpdated: () => void;
  onRemoved: () => void;
}

const ActivePromotionCard: React.FC<ActivePromotionCardProps> = ({
  promotion,
  products,
  sellers,
  user,
  addToast,
  onUpdated,
  onRemoved
}) => {
  const [contentType, setContentType] = useState<'product' | 'seller'>(promotion.contentType);
  const [contentId, setContentId] = useState(promotion.content.id);
  const [durationDays, setDurationDays] = useState(String(
    promotion.durationDays ||
    Math.max(1, Math.ceil((new Date(promotion.endsAt).getTime() - new Date(promotion.startsAt).getTime()) / 86_400_000))
  ));
  const [paidAmount, setPaidAmount] = useState(String(promotion.paidAmount || ''));
  const [homepagePosition, setHomepagePosition] = useState<HomePromotionPosition>(promotion.homepagePosition || 'after-hero');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const isExpired = new Date(promotion.endsAt).getTime() <= Date.now();

  const choices = contentType === 'product' ? products : sellers;
  useEffect(() => {
    if (!choices.some((choice) => choice.id === contentId)) {
      setContentId(choices[0]?.id || '');
    }
  }, [contentType, products, sellers]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.updateActivePaidPromotion(user, {
        contentType,
        contentId,
        durationDays: Number(durationDays),
        paidAmount: Number(paidAmount),
        homepagePosition
      });
      addToast('تم تعديل مساحة الترشيح', 'تم حفظ المحتوى والموضع والمدة الجديدة.', 'success');
      onUpdated();
    } catch (error) {
      addToast('تعذر تعديل مساحة الترشيح', (error as Error).message || 'راجع البيانات وحاول مرة أخرى', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('هل تريد إيقاف مساحة الترشيح الحالية وإخفاءها من الموقع؟')) return;
    setRemoving(true);
    try {
      await api.removeActivePaidPromotion(user);
      onRemoved();
    } catch (error) {
      addToast('تعذر إيقاف مساحة الترشيح', (error as Error).message || 'حاول مرة أخرى', 'error');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <article className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/[0.04] p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
            <BadgeCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-foreground">
              المساحة الإعلانية المفعّلة حالياً بالرئيسية
            </div>
            <p className="mt-0.5 text-[11px] text-foreground-secondary">
              {isExpired ? 'انتهت في ' : 'نشطة حتى '}
              {new Date(promotion.endsAt).toLocaleString('ar-EG')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`w-fit rounded-full px-3 py-1 text-[10px] font-black ${isExpired ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'}`}>
            {isExpired ? 'انتهت المدة — يمكن التجديد' : 'مفعّل ونشط بالرئيسية'}
          </span>
          <button
            type="button"
            onClick={remove}
            disabled={removing}
            className="inline-flex items-center gap-1 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 px-3 py-1 text-xs font-bold cursor-pointer"
            title="إيقاف الإعلان"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>إيقاف</span>
          </button>
        </div>
      </div>

      <form onSubmit={save} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-xs font-bold text-foreground">
          نوع المحتوى
          <select
            value={contentType}
            onChange={(event) => setContentType(event.target.value as 'product' | 'seller')}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-xs outline-none focus:border-primary cursor-pointer"
          >
            <option value="product">منتج معتمد</option>
            <option value="seller">ورشة معتمدة</option>
          </select>
        </label>

        <label className="text-xs font-bold text-foreground">
          المحتوى المعروض
          <select
            value={contentId}
            onChange={(event) => setContentId(event.target.value)}
            required
            disabled={!choices.length}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-xs outline-none focus:border-primary disabled:opacity-50 cursor-pointer"
          >
            {contentType === 'product'
              ? products.map((product) => <option key={product.id} value={product.id}>{product.title} — {product.sellerName}</option>)
              : sellers.map((seller) => <option key={seller.id} value={seller.id}>{seller.brandName || seller.name}</option>)}
          </select>
        </label>

        <label className="text-xs font-bold text-foreground">
          مدة جديدة (أيام)
          <input
            type="number"
            min="1"
            max="365"
            required
            value={durationDays}
            onChange={(event) => setDurationDays(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-xs outline-none focus:border-primary font-mono"
          />
        </label>

        <label className="text-xs font-bold text-foreground">
          المبلغ المؤكد (ج.م)
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={paidAmount}
            onChange={(event) => setPaidAmount(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-xs outline-none focus:border-primary font-mono"
          />
        </label>

        <label className="text-xs font-bold text-foreground">
          موضع الظهور
          <HomePositionSelect value={homepagePosition} onChange={setHomepagePosition} />
        </label>

        <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white px-5 py-2 text-xs font-black transition cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            <span>{saving ? 'جارٍ الحفظ...' : 'حفظ تعديلات الترشيح'}</span>
          </button>
        </div>
      </form>
    </article>
  );
};

export default PaidPromotionRequestsPanel;
