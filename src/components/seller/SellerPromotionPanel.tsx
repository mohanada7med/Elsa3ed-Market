import React, { useEffect, useState } from 'react';
import { BadgeCheck, Clock3, Megaphone, Send } from 'lucide-react';
import { api } from '../../services/api';
import type { PaidPromotionRequest, UserProfile } from '../../types';

interface SellerPromotionPanelProps {
  user: UserProfile;
  addToast: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

const requestStatus: Record<PaidPromotionRequest['status'], string> = {
  pending: 'طلبك قيد المراجعة',
  active: 'لديك مساحة ترويج مفعّلة',
  rejected: 'تمت مراجعة طلبك',
  expired: 'انتهت مدة الترويج'
};

export const SellerPromotionPanel: React.FC<SellerPromotionPanelProps> = ({ user, addToast }) => {
  const [request, setRequest] = useState<PaidPromotionRequest | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');

  const refreshRequest = async () => {
    setLoadError('');
    try {
      setRequest(await api.getSellerPromotionRequest(user));
    } catch (error) {
      setLoadError((error as Error).message || 'تعذر تحميل حالة الطلب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshRequest();
  }, [user.id]);

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const created = await api.requestPaidPromotion(user, message);
      setRequest(created);
      setMessage('');
      addToast('تم إرسال الطلب', 'هتراجع الإدارة طلبك وتتواصل معك لتأكيد الاشتراك.', 'success');
    } catch (error) {
      addToast('تعذر إرسال الطلب', (error as Error).message || 'حاول مرة أخرى بعد قليل', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section dir="rtl" className="space-y-6 rounded-[2rem] border border-black/10 bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-espresso-900/90 sm:p-8">
      <header className="flex items-start gap-4 border-b border-black/10 pb-5 dark:border-white/10">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Megaphone className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-espresso dark:text-cream">مساحة ترشيح وه المدفوعة</h2>
          <p className="mt-1 text-xs leading-6 text-black/60 dark:text-white/60">
            اطلب الاشتراك لتظهر ورشتك أو إحدى قطعك في الصفحة الرئيسية ودليل الورش. الإدارة تختار المحتوى وتؤكد الدفع ومدة العرض.
          </p>
        </div>
      </header>

      {loading ? (
        <div role="status" className="rounded-2xl bg-black/5 p-4 text-sm dark:bg-white/5">جارٍ تحميل حالة طلبك...</div>
      ) : loadError ? (
        <div role="alert" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-700 dark:text-rose-300">
          {loadError}
          <button type="button" onClick={() => void refreshRequest()} className="mr-3 font-black underline">إعادة المحاولة</button>
        </div>
      ) : request ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 font-black text-primary">
            {request.status === 'active' ? <BadgeCheck className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
            {requestStatus[request.status]}
          </div>
          <p className="mt-2 text-xs leading-6 text-foreground-muted">
            {request.status === 'pending'
              ? 'بعد إرسال الطلب، هتراجع الإدارة بيانات الاشتراك وتتواصل معك لتأكيد الدفع قبل اختيار المحتوى ومدة ظهوره.'
              : request.status === 'active'
                ? `مساحة الترويج فعالة حتى ${request.endsAt ? new Date(request.endsAt).toLocaleDateString('ar-EG') : 'موعد الانتهاء'}.`
                : 'يمكنك إرسال طلب جديد لمراجعته من الإدارة.'}
          </p>
          <p className="mt-2 text-[10px] font-bold text-foreground-disabled">
            تاريخ الطلب: {new Date(request.createdAt).toLocaleDateString('ar-EG')}
          </p>
        </div>
      ) : null}

      {!loading && !loadError && request?.status !== 'pending' && (
        <form onSubmit={submitRequest} className="space-y-4">
          <label className="block text-xs font-bold text-foreground">
            رسالة للإدارة <span className="font-normal text-foreground-disabled">(اختياري)</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="اكتب أي تفاصيل تساعد الإدارة في مراجعة طلب الاشتراك..."
              className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black text-white transition hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {submitting ? 'جارٍ إرسال الطلب...' : request ? 'إرسال طلب اشتراك جديد' : 'طلب الاشتراك'}
          </button>
        </form>
      )}
    </section>
  );
};
