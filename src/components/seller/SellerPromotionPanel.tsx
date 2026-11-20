import React, { useEffect, useState, useMemo } from 'react';
import {
  Megaphone,
  Sparkles,
  Clock3,
  CheckCircle2,
  BadgeCheck,
  AlertTriangle,
  TrendingUp,
  Send,
  Eye,
  Calendar,
  Store,
  Package,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  HelpCircle,
  MapPin,
  Trash2,
  Tag,
  ArrowUpLeft
} from 'lucide-react';
import { api } from '../../services/api';
import type { HomePromotionPosition, PaidPromotionRequest, Product, Seller, UserProfile } from '../../types';
import { toArabicDigits } from '../../utils/arabicNumbers';

interface SellerPromotionPanelProps {
  user: UserProfile;
  seller?: Seller | null;
  products?: Product[];
  addToast: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  onNavigateToProducts?: () => void;
  onNavigateToHome?: () => void;
}

const PROMOTION_PACKAGES = [
  {
    id: 7,
    name: 'باقة الأسبوع (٧ أيام)',
    days: 7,
    popular: false,
    estimatedPrice: '١٥٠ ج.م',
    description: 'انطلاقة سريعة لتسليط الضوء على قطعة مميزة أو عروض العطلة والمواسم.',
    features: ['ظهور متواصل ٧ أيام كاملة', 'تثبيت في الموضع المفضل', 'شارة ترشيح وه التراثية']
  },
  {
    id: 14,
    name: 'باقة الأسبوعين (١٤ يوماً)',
    days: 14,
    popular: true,
    estimatedPrice: '٢٨٠ ج.م',
    description: 'الخيار الأكثر طلباً لمضاعفة المشاهدات واستقبال طلبات ومبيعات متواصلة.',
    features: ['ظهور مميز لمدة ١٤ يوماً', 'وفر ٢٠ ج.م مقارنة بالأسبوعي', 'أولوية الظهور في دليل الورش', 'دعم تسويقي مخصص']
  },
  {
    id: 30,
    name: 'باقة الشهر الترويجي (٣٠ يوماً)',
    days: 30,
    popular: false,
    estimatedPrice: '٥٠٠ ج.م',
    description: 'تصدر دائم للصفحة الرئيسية لأعلى عائد استثماري وبناء شهرة ورشتك.',
    features: ['ظهور كامل لمدة شهر (٣٠ يوم)', 'وفر ١٠٠ ج.م', 'أعلى معدل نقرات ومبيعات', 'تقرير أداء الحملة الترويجية']
  }
];

const HOMEPAGE_POSITIONS: { id: HomePromotionPosition; label: string; desc: string; badge: string }[] = [
  {
    id: 'after-hero',
    label: 'أعلى الصفحة الرئيسية (مباشرة بعد البانر الترحيبي)',
    desc: 'أول ما يراه الزائر فور دخول الموقع — أعلى نسبة مشاهدة ونقرات.',
    badge: 'الأعلى مشاهدة ⭐'
  },
  {
    id: 'after-product-of-week',
    label: 'بعد منتج الأسبوع التراثي',
    desc: 'موضع استراتيجي جوار القطعة التراثية الأبرز في الصعيد.',
    badge: 'فخم ومرموق'
  },
  {
    id: 'before-market',
    label: 'قبل سوق ومنتجات وه مباشرة',
    desc: 'يخاطب المتسوقين الجاهزين للشراء الفوري قبل تصفح باقي المنتجات.',
    badge: 'مبيعات فورية 🛒'
  },
  {
    id: 'after-reels',
    label: 'بعد فيديوهات وريلز الحرف',
    desc: 'يستهدف الجمهور المتفاعل مع فيديوهات وريلز الورش والحرفيين الصعايدة.',
    badge: 'تفاعل عالي 🎬'
  },
  {
    id: 'after-governorates',
    label: 'بعد بوابات ومحافظات الصعيد',
    desc: 'مناسب للقطع الحرفية المرتبطة بمحافظة وتراث جغرافي محدد.',
    badge: 'تراث أصيل'
  }
];

export const SellerPromotionPanel: React.FC<SellerPromotionPanelProps> = ({
  user,
  seller,
  products = [],
  addToast,
  onNavigateToProducts,
  onNavigateToHome
}) => {
  const [request, setRequest] = useState<PaidPromotionRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Form State
  const [contentType, setContentType] = useState<'product' | 'seller'>('product');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedDurationDays, setSelectedDurationDays] = useState<number>(14);
  const [selectedPosition, setSelectedPosition] = useState<HomePromotionPosition>('after-hero');
  const [sellerMessage, setSellerMessage] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Filter approved products of this seller
  const approvedProducts = useMemo(() => {
    return products.filter((p) => p.approvalStatus === 'approved');
  }, [products]);

  // Set default product when approved products are loaded
  useEffect(() => {
    if (approvedProducts.length > 0 && !selectedProductId) {
      setSelectedProductId(approvedProducts[0].id);
    } else if (approvedProducts.length === 0) {
      setContentType('seller');
    }
  }, [approvedProducts, selectedProductId]);

  const selectedProduct = useMemo(() => {
    return approvedProducts.find((p) => p.id === selectedProductId) || approvedProducts[0] || null;
  }, [approvedProducts, selectedProductId]);

  const refreshRequest = async () => {
    setLoadError('');
    try {
      const data = await api.getSellerPromotionRequest(user);
      setRequest(data);
    } catch (error) {
      setLoadError((error as Error).message || 'تعذر تحميل حالة طلب الترويج');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshRequest();
  }, [user.id]);

  const handleCreateRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (contentType === 'product' && !selectedProductId) {
      addToast('اختر المنتج المراد ترويجه', 'يرجى تحديد قطعة معتمدة من ورشتك لإطلاق الحملة عليها.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.requestPaidPromotion(user, {
        message: sellerMessage.trim(),
        contentType,
        contentId: contentType === 'product' ? selectedProductId : (seller?.id || user.id),
        durationDays: selectedDurationDays,
        homepagePosition: selectedPosition
      });
      setRequest(created);
      setSellerMessage('');
      addToast('تم تقديم طلب الترويج بنجاح!', 'سيتواصل معك فريق إدارة منصة وه لتأكيد التفاصيل وتفعيل إعلانك.', 'success');
    } catch (error) {
      addToast('تعذر إرسال الطلب', (error as Error).message || 'حاول مرة أخرى بعد قليل', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!request) return;
    if (!window.confirm('هل أنت متأكد من إلغاء طلب مساحة الترويج المعلق؟ يمكنك تقديم طلب جديد في أي وقت.')) {
      return;
    }

    setCancelling(true);
    try {
      await api.cancelSellerPromotionRequest(user, request.id);
      setRequest(null);
      addToast('تم إلغاء الطلب', 'تم إلغاء طلب مساحة الترويج بنجاح. يمكنك تجهيز طلب جديد متى شئت.', 'info');
    } catch (error) {
      addToast('تعذر إلغاء الطلب', (error as Error).message || 'حدث خطأ أثناء الإلغاء', 'error');
    } finally {
      setCancelling(false);
    }
  };

  // Remaining days calculation if active
  const remainingDays = useMemo(() => {
    if (!request?.endsAt || request.status !== 'active') return 0;
    const diff = new Date(request.endsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [request]);

  const workshopName = seller?.brandName || seller?.name || user.name || 'ورشتك الحرفية';
  const workshopGov = seller?.governorate || user.governorate || 'صعيد مصر';

  return (
    <section dir="rtl" className="space-y-8 text-foreground">
      {/* 1. HERO BANNER */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-amber-500/5 to-surface p-6 shadow-xl sm:p-10">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary dark:text-primary-hover">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>خدمة نمو ومبيعات ورش الصعيد</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight">
              مساحة ترشيح وه المدفوعة
            </h1>
            <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
              روّج لورشتك وقطعك الحرفية المعتمدة في صدارة الصفحة الرئيسية ودليل الورش، واصل لآلاف الزوار الصعايدة والمهتمين بالتراث يومياً وضاعف مبيعاتك وأرباحك.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-border px-3 py-1.5 text-xs font-bold text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                صدارة الصفحة الرئيسية
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-border px-3 py-1.5 text-xs font-bold text-foreground">
                <BadgeCheck className="h-3.5 w-3.5 text-primary dark:text-primary-hover" />
                شارة ترشيح وه الذهبية
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-border px-3 py-1.5 text-xs font-bold text-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                مضاعفة الزيارات والطلبات
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => void refreshRequest()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 py-3 text-xs font-bold text-foreground shadow-sm transition hover:border-primary disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث حالة الترويج</span>
            </button>
            {onNavigateToHome && (
              <button
                type="button"
                onClick={onNavigateToHome}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-hover border border-primary/20 px-5 py-3 text-xs font-bold transition cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                <span>معاينة الصفحة الرئيسية</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. STATUS NOTICES */}
      {loadError && (
        <div role="alert" className="flex items-center justify-between rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs font-bold text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{loadError}</span>
          </div>
          <button type="button" onClick={() => void refreshRequest()} className="underline cursor-pointer">
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* ACTIVE CAMPAIGN DASHBOARD */}
      {request && request.status === 'active' && (
        <div className="rounded-[2.5rem] border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-surface to-surface p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="inline-block text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                  حملة ترويجية نشطة ومباشرة الآن
                </span>
                <h3 className="text-xl font-black text-foreground">إعلان ورشتك معروض للجمهور بنجاح</h3>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 rounded-2xl">
              <Clock3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="block text-[10px] text-foreground-secondary">الوقت المتبقي</span>
                <span className="text-base font-black text-emerald-700 dark:text-emerald-300">
                  {remainingDays > 0 ? `${remainingDays.toLocaleString('ar-EG')} يوم متبقي` : 'ينتهي اليوم'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <span className="text-[11px] text-foreground-secondary block mb-1">نوع المحتوى المروّج</span>
              <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                {request.contentType === 'product' ? <Package className="h-4 w-4 text-primary dark:text-primary-hover" /> : <Store className="h-4 w-4 text-primary dark:text-primary-hover" />}
                {request.contentType === 'product' ? 'قطعة / منتج محدد' : 'ملف الورشة بالكامل'}
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4">
              <span className="text-[11px] text-foreground-secondary block mb-1">مكان الظهور</span>
              <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-amber-500" />
                {HOMEPAGE_POSITIONS.find((p) => p.id === request.homepagePosition)?.label.split('(')[0] || 'الصفحة الرئيسية'}
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4">
              <span className="text-[11px] text-foreground-secondary block mb-1">مدة الحملة</span>
              <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-blue-500" />
                {(request.durationDays || 7).toLocaleString('ar-EG')} يوم
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4">
              <span className="text-[11px] text-foreground-secondary block mb-1">تاريخ الانتهاء</span>
              <span className="font-bold text-sm text-foreground">
                {request.endsAt ? new Date(request.endsAt).toLocaleDateString('ar-EG') : 'غير محدد'}
              </span>
            </div>
          </div>

          {onNavigateToHome && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onNavigateToHome}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                <span>معاينة إعلانك مباشرة على الصفحة الرئيسية</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* PENDING REQUEST TRACKER */}
      {request && request.status === 'pending' && (
        <div className="rounded-[2.5rem] border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-surface to-surface p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Clock3 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">طلبك قيد المراجعة</span>
                <h3 className="text-lg font-black text-foreground">تم استلام طلب الترويج وجارٍ مراجعته من الإدارة</h3>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancelRequest}
              disabled={cancelling}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-900/40 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 text-rose-700 px-3.5 py-2 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              title="إلغاء الطلب"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{cancelling ? 'جارٍ الإلغاء...' : 'إلغاء الطلب'}</span>
            </button>
          </div>

          {/* Stepper Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
              <span className="text-xs font-bold text-emerald-600 block mb-1">الخطوة ١</span>
              <span className="text-xs font-black text-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                تم استلام الطلب
              </span>
            </div>
            <div className="rounded-2xl border-2 border-amber-500 bg-amber-500/10 p-3.5">
              <span className="text-xs font-bold text-amber-600 block mb-1">الخطوة ٢</span>
              <span className="text-xs font-black text-foreground flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5 text-amber-500" />
                مراجعة الإدارة
              </span>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-3.5 opacity-60">
              <span className="text-xs font-bold text-foreground-secondary block mb-1">الخطوة ٣</span>
              <span className="text-xs font-bold text-foreground">تأكيد الدفع والتنسيق</span>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-3.5 opacity-60">
              <span className="text-xs font-bold text-foreground-secondary block mb-1">الخطوة ٤</span>
              <span className="text-xs font-bold text-foreground">إطلاق الحملة على الرئيسية</span>
            </div>
          </div>

          {/* Summary of submitted choices */}
          <div className="rounded-2xl bg-surface border border-border p-4 text-xs space-y-2">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div>
                <span className="text-foreground-secondary">المحتوى المطلوب: </span>
                <span className="font-bold text-foreground">
                  {request.contentType === 'product' ? 'ترويج منتج محدد' : 'ملف الورشة'}
                </span>
              </div>
              <div>
                <span className="text-foreground-secondary">المدة المقترحة: </span>
                <span className="text-sm font-black text-foreground">{(request.durationDays || 7).toLocaleString('ar-EG')} يوماً</span>
              </div>
              <div>
                <span className="text-foreground-secondary">الموضع المفضل: </span>
                <span className="font-bold text-foreground">
                  {HOMEPAGE_POSITIONS.find((p) => p.id === request.homepagePosition)?.label.split('(')[0] || 'أعلى الصفحة الرئيسية'}
                </span>
              </div>
              <div>
                <span className="text-foreground-secondary">تاريخ التقديم: </span>
                <span className="font-bold text-foreground">
                  {new Date(request.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
            </div>
            {request.message && (
              <div className="pt-2 border-t border-border text-foreground-secondary">
                <span className="font-bold text-foreground">رسالتك للإدارة: </span>
                <span className="italic font-medium">{request.message}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REJECTED / EXPIRED NOTICE */}
      {request && (request.status === 'rejected' || request.status === 'expired') && (
        <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 text-foreground-secondary">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">
                {request.status === 'rejected' ? 'تمت مراجعة طلبك السابق' : 'انتهت مدة الحملة الترويجية السابقة'}
              </h4>
              <p className="text-xs text-foreground-secondary mt-0.5">
                يمكنك الآن حجز مساحة جديدة وتخصيص تفضيلاتك من النموذج أدناه.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-primary dark:text-primary-hover">جاهز لحملة جديدة ✨</span>
        </div>
      )}

      {/* 3. CAMPAIGN CREATION FORM */}
      {(!request || request.status !== 'pending') && (
        <form onSubmit={handleCreateRequest} className="space-y-8">
          <div className="rounded-[2.5rem] border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-8">
            {/* Step 1: Content Type Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white font-black text-xs">
                  1
                </div>
                <h3 className="font-black text-base text-foreground">ماذا تريد أن تروّج في الصفحة الرئيسية؟</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Option */}
                <button
                  type="button"
                  onClick={() => setContentType('product')}
                  className={`p-5 rounded-2xl border-2 text-right transition-all cursor-pointer relative ${
                    contentType === 'product'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-surface hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-primary-hover">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-foreground">ترويج قطعة أو منتج محدد</h4>
                        <span className="text-[11px] text-foreground-secondary">الخيار الأمثل للتركيز على قطعة معينة وزيادة مبيعاتها</span>
                      </div>
                    </div>
                    {contentType === 'product' && (
                      <CheckCircle2 className="h-5 w-5 text-primary dark:text-primary-hover flex-shrink-0" />
                    )}
                  </div>
                </button>

                {/* Seller Option */}
                <button
                  type="button"
                  onClick={() => setContentType('seller')}
                  className={`p-5 rounded-2xl border-2 text-right transition-all cursor-pointer relative ${
                    contentType === 'seller'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-surface hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-primary-hover">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-foreground">ترويج ورشتك بالكامل</h4>
                        <span className="text-[11px] text-foreground-secondary">جذب المتابعين والطلبات المباشرة لكافة منتجات ورشتك</span>
                      </div>
                    </div>
                    {contentType === 'seller' && (
                      <CheckCircle2 className="h-5 w-5 text-primary dark:text-primary-hover flex-shrink-0" />
                    )}
                  </div>
                </button>
              </div>

              {/* Product Picker if Product option is chosen */}
              {contentType === 'product' && (
                <div className="pt-2">
                  {approvedProducts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-5 text-center space-y-3">
                      <Package className="h-8 w-8 text-amber-500 mx-auto" />
                      <p className="text-xs font-bold text-foreground">لا توجد منتجات معتمدة حتى الآن في ورشتك</p>
                      <p className="text-[11px] text-foreground-secondary">
                        يجب اعتماد منتج واحد على الأقل لنشره في مساحة الترويج، أو يمكنك اختيار ترويج ملف الورشة بدلاً منه.
                      </p>
                      {onNavigateToProducts && (
                        <button
                          type="button"
                          onClick={onNavigateToProducts}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-white px-4 py-2 text-xs font-bold cursor-pointer"
                        >
                          <span>إدارة منتجات ورشتك</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-foreground">
                        اختر القطعة المراد ترويجها من منتجات ورشتك:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1">
                        {approvedProducts.map((prod) => {
                          const isSelected = prod.id === selectedProductId;
                          return (
                            <button
                              key={prod.id}
                              type="button"
                              onClick={() => setSelectedProductId(prod.id)}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-right transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-primary bg-primary/10 shadow-sm'
                                  : 'border-border bg-surface hover:border-primary/40'
                              }`}
                            >
                              <img
                                src={prod.images?.[0] || '/mascot/welcoming.webp'}
                                alt={toArabicDigits(prod.title)}
                                className="h-12 w-12 rounded-lg object-cover flex-shrink-0 border border-border"
                              />
                              <div className="overflow-hidden flex-1">
                                <h5 className="font-bold text-xs text-foreground truncate">{toArabicDigits(prod.title)}</h5>
                                <span className="block text-sm font-black text-primary dark:text-primary-hover">
                                  {prod.price.toLocaleString('ar-EG')} ج.م
                                </span>
                              </div>
                              {isSelected && <CheckCircle2 className="h-4 w-4 text-primary dark:text-primary-hover flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Duration & Package Selection */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white font-black text-xs">
                  2
                </div>
                <h3 className="font-black text-base text-foreground">اختر باقة ومدة الحملة الترويجية</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PROMOTION_PACKAGES.map((pkg) => {
                  const isSelected = selectedDurationDays === pkg.days;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedDurationDays(pkg.days)}
                      className={`relative p-5 rounded-2xl border-2 text-right transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border bg-surface hover:border-primary/40'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-3 left-4 rounded-full bg-gradient-to-r from-amber-500 to-primary px-3 py-0.5 text-[10px] font-black text-white shadow-sm">
                          الأكثر طلباً 🔥
                        </span>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-sm text-foreground">{pkg.name}</h4>
                          <span className="text-sm font-black text-primary dark:text-primary-hover">{pkg.estimatedPrice}</span>
                        </div>
                        <p className="text-[11px] text-foreground-secondary leading-relaxed">{pkg.description}</p>
                      </div>

                      <div className="pt-4 border-t border-border mt-4 space-y-1.5 w-full">
                        {pkg.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Preferred Placement */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white font-black text-xs">
                  3
                </div>
                <h3 className="font-black text-base text-foreground">المكان المفضل للظهور في الصفحة الرئيسية</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {HOMEPAGE_POSITIONS.map((pos) => {
                  const isSelected = selectedPosition === pos.id;
                  return (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setSelectedPosition(pos.id)}
                      className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-border bg-surface hover:border-primary/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-primary dark:text-primary-hover px-2 py-0.5 rounded-md bg-primary/10">
                            {pos.badge}
                          </span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-primary dark:text-primary-hover" />}
                        </div>
                        <h4 className="font-bold text-xs text-foreground mt-1">{pos.label}</h4>
                      </div>
                      <p className="text-[10px] text-foreground-secondary mt-2">{pos.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Special Request Message */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white font-black text-xs">
                  4
                </div>
                <label htmlFor="seller-promo-notes" className="font-black text-base text-foreground">
                  ملاحظات أو تفاصيل إضافية للإدارة <span className="font-normal text-xs text-foreground-secondary">(اختياري)</span>
                </label>
              </div>

              <textarea
                id="seller-promo-notes"
                value={sellerMessage}
                onChange={(e) => setSellerMessage(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="اكتب أي رغبة خاصة مثل موعد مفضل لبدء الإعلان، طريقة الدفع الأنسب لك (فودافون كاش، إنستاباي)، أو استفسارات..."
                className="w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-xs text-foreground placeholder:text-foreground-secondary outline-none transition focus:border-primary"
              />
            </div>

            {/* Step 5: Live Interactive Mockup Preview */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary dark:text-primary-hover" />
                  <h3 className="font-black text-base text-foreground">معاينة حية لشكل إعلانك في الموقع</h3>
                </div>
                <span className="text-[11px] text-foreground-secondary">يحاكي ظهور الإعلان أمام الزوار</span>
              </div>

              {/* Mockup Card */}
              <div className="overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-amber-500/5 to-surface p-5 sm:p-7 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                  <div className="flex items-center gap-4 text-right flex-1">
                    <img
                      src={
                        contentType === 'product' && selectedProduct
                          ? selectedProduct.images?.[0] || '/mascot/welcoming.webp'
                          : seller?.coverImage || '/mascot/welcoming.webp'
                      }
                      alt="معاينة الترويج"
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover border border-primary/30 shadow-md flex-shrink-0"
                    />
                    <div className="space-y-1.5 overflow-hidden">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-black text-primary dark:text-primary-hover border border-primary/20">
                        <Sparkles className="h-3 w-3" />
                        <span>ترشيح وه المميز</span>
                      </div>
                      <h4 className="font-black text-base sm:text-lg text-foreground truncate">
                        {contentType === 'product' && selectedProduct
                          ? toArabicDigits(selectedProduct.title)
                          : toArabicDigits(workshopName)}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-secondary">
                        <span className="font-bold flex items-center gap-1">
                          <Store className="h-3.5 w-3.5 text-primary dark:text-primary-hover" />
                          {toArabicDigits(workshopName)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-amber-500" />
                          {workshopGov}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center sm:items-end gap-2 flex-shrink-0">
                    {contentType === 'product' && selectedProduct && (
                      <span className="text-2xl font-black text-primary dark:text-primary-hover">
                        {selectedProduct.price.toLocaleString('ar-EG')} ج.م
                      </span>
                    )}
                    <div className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-white px-5 py-2.5 text-xs font-black shadow-md">
                      <span>{contentType === 'product' ? 'اطلب القطعة الآن' : 'استكشف الورشة'}</span>
                      <ArrowUpLeft className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-foreground-secondary flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>لا يتم خصم أي مبالغ الآن — الدفع يتم فقط بعد تواصل الإدارة وتأكيد موعد الحملة.</span>
              </div>

              <button
                type="submit"
                disabled={submitting || (contentType === 'product' && !selectedProductId)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary-hover text-white px-8 py-4 text-sm font-black transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>{submitting ? 'جارٍ إرسال طلب الترويج...' : 'إرسال طلب الترويج للإدارة'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 4. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <div className="rounded-[2.5rem] border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="h-5 w-5 text-primary dark:text-primary-hover" />
          <h3 className="font-black text-base text-foreground">أسئلة شائعة حول مساحة الترشيح المدفوعة</h3>
        </div>

        {[
          {
            q: 'كيف يتم سداد قيمة الاشتراك في مساحة الترويج؟',
            a: 'يمكنك السداد بكل سهولة وبأمان عبر إنستاباي (InstaPay)، المحافظ الإلكترونية مثل فودافون كاش، أو التحويل البنكي. فور تقديم طلبك، سيتواصل معك ممثل الإدارة عبر الهاتف أو الواتساب لتزويدك ببيانات التحويل وتأكيد تفاصيل إعلانك.'
          },
          {
            q: 'متى يبدأ إعلاني في الظهور على الموقع؟',
            a: 'يبدأ الإعلان في الظهور مباشرة خلال ٢٤ ساعة من تأكيد السداد واعتماد الموضع، ويستمر طوال المدة المحددة (٧، ١٤، أو ٣٠ يوماً) على مدار الساعة.'
          },
          {
            q: 'هل يمكنني تغيير القطعة المعروضة أثناء سريان الحملة؟',
            a: 'نعم، يمكنك التواصل مع إدارة وه في أي وقت لتحديث القطعة أو ترويج منتج آخر ذو أولوية لديك خلال فترة اشتراكك النشط.'
          },
          {
            q: 'ما الشروط الواجب توفرها في المنتج أو الورشة؟',
            a: 'يشترط فقط أن تكون الورشة والمنتجات معتمدة في سوق الصعيد ومتاحة في المخزون، لضمان تجربة تسوق موثوقة وممتازة لعملاء ومحبي التراث.'
          }
        ].map((item, idx) => {
          const isExpanded = expandedFaq === idx;
          return (
            <div key={idx} className="rounded-2xl border border-border overflow-hidden transition-colors">
              <button
                type="button"
                onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                className="w-full p-4 text-right font-bold text-xs sm:text-sm text-foreground flex items-center justify-between gap-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
              >
                <span>{item.q}</span>
                <span className="text-primary dark:text-primary-hover font-black text-base">{isExpanded ? '−' : '+'}</span>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 text-xs text-foreground-secondary leading-relaxed border-t border-border bg-black/5 dark:bg-white/5">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SellerPromotionPanel;
