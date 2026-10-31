import React, { useEffect, useState } from 'react';
import { BadgeCheck, Clock3, Megaphone, RefreshCw, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import type { HomePromotionPosition, PaidPromotion, PaidPromotionRequest, Product, Seller, UserProfile } from '../../types';

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

  const refreshRequests = async () => {
    setLoadError('');
    setLoading(true);
    try {
      const [pendingRequests, active] = await Promise.all([
        api.getAdminPromotionRequests(user),
        api.getAdminPaidPromotion(user)
      ]);
      setRequests(pendingRequests);
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

  return (
    <section dir="rtl" className="space-y-6 rounded-[2rem] border border-border bg-surface p-5 shadow-xs sm:p-8">
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">طلبات مساحة الترشيح المدفوعة</h2>
            <p className="mt-1 text-xs leading-6 text-foreground-muted">
              أكّد قيمة الدفع، ثم اختر المحتوى ومدة ظهوره في الصفحة الرئيسية ودليل الورش.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refreshRequests()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-foreground transition hover:border-primary disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث الطلبات
        </button>
      </header>

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

      {loadError && (
        <div role="alert" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-700 dark:text-rose-300">
          {loadError}
          <button type="button" onClick={() => void refreshRequests()} className="mr-3 font-black underline">إعادة المحاولة</button>
        </div>
      )}

      {!loading && !loadError && requests.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <BadgeCheck className="mx-auto h-8 w-8 text-emerald-600" />
          <p className="mt-3 text-sm font-bold text-foreground">لا توجد طلبات اشتراك معلقة</p>
        </div>
      )}

      <div className="space-y-5">
        {requests.map((request) => (
          <PromotionRequestCard
            key={request.id}
            request={request}
            products={products.filter((product) => product.approvalStatus === 'approved')}
            sellers={sellers.filter((seller) => seller.status === 'approved')}
            user={user}
            addToast={addToast}
            onActivated={(activatedId) => {
              setRequests((current) => current.filter((item) => item.id !== activatedId));
              void refreshRequests();
            }}
            onRejected={(rejectedId) => setRequests((current) => current.filter((item) => item.id !== rejectedId))}
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
  const [contentType, setContentType] = useState<'product' | 'seller'>('product');
  const [contentId, setContentId] = useState('');
  const [durationDays, setDurationDays] = useState('7');
  const [paidAmount, setPaidAmount] = useState('');
  const [homepagePosition, setHomepagePosition] = useState<HomePromotionPosition>('after-reels');
  const [submitting, setSubmitting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const choices = contentType === 'product' ? products : sellers;
  useEffect(() => {
    setContentId(choices[0]?.id || '');
  }, [contentType, products, sellers]);

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
      addToast('تم تفعيل مساحة الترشيح', 'تم تأكيد الدفع واختيار المحتوى ومدة ظهوره بنجاح.', 'success');
    } catch (error) {
      addToast('تعذر تفعيل مساحة الترشيح', (error as Error).message || 'راجع البيانات وحاول مرة أخرى', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const reject = async () => {
    if (!window.confirm(`هل تريد رفض طلب مساحة الترشيح الخاص بـ "${request.sellerName}"؟`)) return;
    setRejecting(true);
    try {
      await api.rejectPaidPromotionRequest(user, request.id);
      onRejected(request.id);
      addToast('تم رفض الطلب', 'تم تحديث حالة طلب الاشتراك.', 'success');
    } catch (error) {
      addToast('تعذر رفض الطلب', (error as Error).message || 'حاول مرة أخرى', 'error');
    } finally {
      setRejecting(false);
    }
  };

  return (
    <article className="rounded-2xl border border-border bg-background p-4 sm:p-6">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-foreground">
            <Clock3 className="h-4 w-4 text-amber-600" />
            {request.sellerName}
          </div>
          <p className="mt-1 text-[11px] text-foreground-disabled">
            تاريخ الطلب: {new Date(request.createdAt).toLocaleDateString('ar-EG')}
          </p>
          {request.message && <p className="mt-3 whitespace-pre-wrap text-xs leading-6 text-foreground-muted">{request.message}</p>}
        </div>
        <span className="w-fit rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black text-amber-700 dark:text-amber-300">قيد المراجعة</span>
      </div>

      <form onSubmit={activate} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-xs font-bold text-foreground">
          نوع المحتوى
          <select
            value={contentType}
            onChange={(event) => setContentType(event.target.value as 'product' | 'seller')}
            className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-3 outline-none focus:border-primary"
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
            className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-3 outline-none focus:border-primary disabled:opacity-50"
          >
            {choices.length === 0 && <option value="">لا يوجد محتوى معتمد</option>}
            {contentType === 'product'
              ? products.map((product) => <option key={product.id} value={product.id}>{product.title} — {product.sellerName}</option>)
              : sellers.map((seller) => <option key={seller.id} value={seller.id}>{seller.brandName || seller.name}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold text-foreground">
          مدة الظهور (بالأيام)
          <input
            type="number"
            min="1"
            max="365"
            required
            value={durationDays}
            onChange={(event) => setDurationDays(event.target.value)}
            className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-3 outline-none focus:border-primary"
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
            className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-3 outline-none focus:border-primary"
          />
        </label>
        <label className="text-xs font-bold text-foreground">
          موضع الظهور في الرئيسية
          <HomePositionSelect value={homepagePosition} onChange={setHomepagePosition} />
        </label>
        <button
          type="submit"
          disabled={submitting || !contentId || !choices.length}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-black text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2 lg:col-span-4"
        >
          <BadgeCheck className="h-4 w-4" />
          {submitting ? 'جارٍ تأكيد الدفع والتفعيل...' : 'تأكيد الدفع وتفعيل مساحة الترشيح'}
        </button>
        <button
          type="button"
          onClick={() => void reject()}
          disabled={rejecting || submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 px-4 py-3 text-xs font-black text-rose-700 transition hover:bg-rose-500/10 disabled:opacity-50 lg:col-span-1"
        >
          <Trash2 className="h-4 w-4" />
          {rejecting ? 'جارٍ الرفض...' : 'رفض الطلب'}
        </button>
      </form>
    </article>
  );
};

const HOME_POSITION_OPTIONS: Array<{ value: HomePromotionPosition; label: string }> = [
  { value: 'after-hero', label: 'بعد واجهة الترحيب' },
  { value: 'after-product-of-week', label: 'بعد منتج الأسبوع' },
  { value: 'after-governorates', label: 'بعد قسم المحافظات' },
  { value: 'after-reels', label: 'بعد فيديوهات الصنعة' },
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
    className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-3 outline-none focus:border-primary"
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
  const [homepagePosition, setHomepagePosition] = useState<HomePromotionPosition>(promotion.homepagePosition || 'after-reels');
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
    <article className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] p-4 sm:p-6">
      <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-foreground">
            <BadgeCheck className="h-5 w-5 text-emerald-600" />
            إدارة الترشيح الحالي
          </div>
          <p className="mt-1 text-[11px] text-foreground-muted">
            {isExpired ? 'انتهى في ' : 'ينتهي في '}
            {new Date(promotion.endsAt).toLocaleString('ar-EG')}
          </p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-[10px] font-black ${isExpired ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'}`}>
          {isExpired ? 'انتهت المدة — يمكن التجديد' : 'مفعّل'}
        </span>
      </div>
      <form onSubmit={save} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-xs font-bold text-foreground">
          نوع المحتوى
          <select
            value={contentType}
            onChange={(event) => setContentType(event.target.value as 'product' | 'seller')}
            className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-3 outline-none focus:border-primary"
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
            className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-3 outline-none focus:border-primary disabled:opacity-50"
          >
            {contentType === 'product'
              ? products.map((product) => <option key={product.id} value={product.id}>{product.title} — {product.sellerName}</option>)
              : sellers.map((seller) => <option key={seller.id} value={seller.id}>{seller.brandName || seller.name}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold text-foreground">
          مدة جديدة (بالأيام)
          <input type="number" min="1" max="365" required value={durationDays} onChange={(event) => setDurationDays(event.target.value)} className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-3 outline-none focus:border-primary" />
        </label>
        <label className="text-xs font-bold text-foreground">
          المبلغ المؤكد (ج.م)
          <input type="number" min="0.01" step="0.01" required value={paidAmount} onChange={(event) => setPaidAmount(event.target.value)} className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-3 outline-none focus:border-primary" />
        </label>
        <label className="text-xs font-bold text-foreground">
          موضع الظهور في الرئيسية
          <HomePositionSelect value={homepagePosition} onChange={setHomepagePosition} />
        </label>
        <button type="submit" disabled={saving || !contentId || !choices.length} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-black text-white transition hover:bg-primary-hover disabled:opacity-50 sm:col-span-1">
          <RefreshCw className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
          {saving ? 'جارٍ الحفظ...' : 'حفظ تعديلات الترشيح'}
        </button>
        <button type="button" onClick={() => void remove()} disabled={removing || saving} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 px-4 py-3 text-xs font-black text-rose-700 transition hover:bg-rose-500/10 disabled:opacity-50 sm:col-span-1">
          <Trash2 className="h-4 w-4" />
          {removing ? 'جارٍ الإيقاف...' : 'إيقاف وإزالة الظهور'}
        </button>
      </form>
      <p className="mt-3 text-[10px] text-foreground-disabled">
        حفظ التعديلات يعيد احتساب مدة الظهور من وقت الحفظ؛ الإيقاف يخفي المساحة فورًا.
      </p>
    </article>
  );
};
