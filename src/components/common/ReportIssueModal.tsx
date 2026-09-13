import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  AlertTriangle,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  Tag,
  CreditCard,
  Store,
  UserX,
  DollarSign,
  Wrench,
  Video,
  HelpCircle,
  FileText,
  Phone,
  User,
  MapPin,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import type { ReportTicket, ReportCategory, ReportPriority, ReportStatus } from '../../types.ts';

export interface CategoryOption {
  id: ReportCategory;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: 'order_issue',
    label: 'مشكلة في طلب أو شحنة',
    desc: 'تأخير في الاستلام، كسر أو تلف أثناء الشحن، أو نقص في الطلب',
    icon: Package
  },
  {
    id: 'product_issue',
    label: 'عيب أو عدم مطابقة منتج',
    desc: 'المنتج يختلف عن الصور المعروضة أو به عيب صناعة واضح',
    icon: Tag
  },
  {
    id: 'payment_issue',
    label: 'مشكلة دفع أو تحويل كاش / إنستاباي',
    desc: 'استفسار عن تأكيد العملية، كود الإيداع، أو إيصال السداد',
    icon: CreditCard
  },
  {
    id: 'seller_complaint',
    label: 'شكوى ضد ورشة / صانع حرفي',
    desc: 'سوء تعامل أو عدم الالتزام بالمواعيد المتفق عليها',
    icon: Store
  },
  {
    id: 'buyer_complaint',
    label: 'شكوى ضد مشتري (خاص بالورش)',
    desc: 'رفض استلام غير مبرر أو إساءة في التواصل (للبائعين فقط)',
    icon: UserX
  },
  {
    id: 'payout_issue',
    label: 'صرف مستحقات وأرباح (خاص بالورش)',
    desc: 'استفسار عن تحويل الأرباح ومستحقات الطلبات المكتملة',
    icon: DollarSign
  },
  {
    id: 'technical_issue',
    label: 'عطل فني في المنصة أو الحساب',
    desc: 'مشكلة في تسجيل الدخول، سلة المشتريات، أو تصفح الموقع',
    icon: Wrench
  },
  {
    id: 'craft_content',
    label: 'ملاحظة على قصة أو ريلز تراثي',
    desc: 'تصحيح معلومة توثيقية أو بلاغ عن محتوى غير لائق',
    icon: Video
  },
  {
    id: 'other',
    label: 'استفسار عام أو مقترح تطوير',
    desc: 'أي اقتراح أو رسالة ترغب في إيصالها لإدارة منصة وه',
    icon: HelpCircle
  }
];

export const ReportIssueModal: React.FC = () => {
  const { reportModalState, closeReportModal, currentUser, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [myTickets, setMyTickets] = useState<ReportTicket[]>([]);

  // Form Fields
  const [category, setCategory] = useState<ReportCategory>('order_issue');
  const [priority, setPriority] = useState<ReportPriority>('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('');

  // Context-passed references
  const [relatedOrderId, setRelatedOrderId] = useState<string | undefined>();
  const [relatedOrderNumber, setRelatedOrderNumber] = useState<string | undefined>();
  const [relatedProductId, setRelatedProductId] = useState<string | undefined>();
  const [relatedProductName, setRelatedProductName] = useState<string | undefined>();
  const [relatedSellerId, setRelatedSellerId] = useState<string | undefined>();
  const [relatedSellerName, setRelatedSellerName] = useState<string | undefined>();

  // Synchronize when opened
  useEffect(() => {
    if (!reportModalState?.isOpen) return;

    setActiveTab(
      (reportModalState.initialTab as any) === 'my-reports' || reportModalState.initialTab === 'history'
        ? 'history'
        : 'new'
    );
    setCategory(reportModalState.category || 'order_issue');
    setPriority(reportModalState.priority || 'medium');
    setSubject(reportModalState.initialSubject || '');
    setDescription(reportModalState.initialDescription || '');

    setRelatedOrderId(reportModalState.relatedOrderId);
    setRelatedOrderNumber(reportModalState.relatedOrderNumber);
    setRelatedProductId(reportModalState.relatedProductId);
    setRelatedProductName(reportModalState.relatedProductName);
    setRelatedSellerId(reportModalState.relatedSellerId);
    setRelatedSellerName(reportModalState.relatedSellerName);

    // Populate user profile info
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setGovernorate(currentUser.governorate || '');
    }
  }, [reportModalState, currentUser]);

  // Fetch ticket history
  const fetchMyTickets = async () => {
    setIsLoadingHistory(true);
    try {
      const tickets = await api.getMyReports({
        id: currentUser?.id,
        phone: currentUser?.phone || phone,
        role: currentUser?.role
      });
      setMyTickets(tickets || []);
    } catch (err: any) {
      console.error('Failed to load tickets history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (reportModalState?.isOpen && activeTab === 'history') {
      fetchMyTickets();
    }
  }, [reportModalState?.isOpen, activeTab]);

  if (!reportModalState?.isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      addToast('تنبيه', 'برجاء كتابة عنوان أو موضوع مختصر للبلاغ', 'warning');
      return;
    }

    if (!description.trim()) {
      addToast('تنبيه', 'برجاء توضيح تفاصيل المشكلة بالشرح الكافي', 'warning');
      return;
    }

    if (!name.trim()) {
      addToast('تنبيه', 'برجاء إدخال اسمك للمتابعة', 'warning');
      return;
    }

    if (!phone.trim()) {
      addToast('تنبيه', 'برجاء إدخال رقم الهاتف للتواصل والرد', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const userRole = currentUser?.role || 'buyer';

      const res = await api.submitReportTicket(
        {
          category,
          priority,
          subject: subject.trim(),
          description: description.trim(),
          userName: name.trim(),
          userPhone: phone.trim(),
          userGovernorate: governorate.trim() || undefined,
          userRole,
          relatedOrderId,
          relatedOrderNumber,
          relatedProductId,
          relatedProductName,
          relatedSellerId,
          relatedSellerName
        },
        { id: currentUser?.id, role: currentUser?.role }
      );

      addToast(
        'تم تسجيل بلاغك بنجاح',
        `رقم البلاغ #${res.data?.ticketNumber || ''} - ستتواصل معك إدارة وه قريباً.`,
        'success'
      );

      // Reset form
      setSubject('');
      setDescription('');
      // Switch to history tab to show the created ticket
      setActiveTab('history');
      fetchMyTickets();
    } catch (err: any) {
      addToast('خطأ', err.message || 'تعذر إرسال البلاغ، حاول مجدداً', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>تم الحل بنجاح</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
            <Clock className="w-3 h-3 animate-spin" />
            <span>جاري المتابعة والحل</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
            <AlertCircle className="w-3 h-3" />
            <span>مرفوض / مغلق</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            <span>قيد المراجعة</span>
          </span>
        );
    }
  };

  return (
    <div
      id="report-issue-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeReportModal();
      }}
      role="dialog"
      aria-modal="true"
      dir="rtl"
    >
      <div
        id="report-issue-modal-container"
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#faf8f5] dark:bg-[#141412] text-black dark:text-white rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#181816]/90 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-black dark:text-white flex items-center gap-2">
                <span>مركز البلاغات والدعم الفني</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:text-primary-hover">
                  إدارة منصة وه
                </span>
              </h2>
              <p className="text-xs text-black/60 dark:text-white/60">
                طريقة مخصصة للمشتري والبائع للإبلاغ عن أي مشكلة والتواصل المباشر مع الإدارة
              </p>
            </div>
          </div>

          <button
            id="close-report-modal-btn"
            onClick={closeReportModal}
            className="p-2 rounded-xl text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] px-6 pt-2 shrink-0">
          <button
            id="tab-new-report"
            onClick={() => setActiveTab('new')}
            className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'new'
                ? 'border-primary text-primary dark:text-primary-hover'
                : 'border-transparent text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>تقديم بلاغ جديد</span>
          </button>

          <button
            id="tab-history-reports"
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-primary text-primary dark:text-primary-hover'
                : 'border-transparent text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>متابعة بلاغاتي والردود</span>
            {myTickets.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 text-black/80 dark:text-white/80">
                {myTickets.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'new' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Linked Context Alert if from Order / Product */}
              {(relatedOrderNumber || relatedProductName || relatedSellerName) && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>تم ربط البلاغ تلقائياً بـ:</span>
                  </div>
                  {relatedOrderNumber && (
                    <span className="px-2 py-0.5 rounded-lg bg-white/70 dark:bg-black/40 font-mono font-bold">
                      طلب #{relatedOrderNumber}
                    </span>
                  )}
                  {relatedProductName && (
                    <span className="px-2 py-0.5 rounded-lg bg-white/70 dark:bg-black/40 font-medium">
                      منتج: {relatedProductName}
                    </span>
                  )}
                  {relatedSellerName && (
                    <span className="px-2 py-0.5 rounded-lg bg-white/70 dark:bg-black/40 font-medium">
                      ورشة: {relatedSellerName}
                    </span>
                  )}
                </div>
              )}

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-black/70 dark:text-white/70 mb-2">
                  نوع المشكلة أو البلاغ *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CATEGORY_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = category === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCategory(opt.id)}
                        className={`text-right p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-black dark:text-white shadow-sm ring-1 ring-primary'
                            : 'border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 bg-white/60 dark:bg-[#1c1c1a]/60 text-black/80 dark:text-white/80'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-primary text-white'
                              : 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-black truncate">{opt.label}</div>
                          <div className="text-[10px] text-black/50 dark:text-white/50 line-clamp-2 leading-tight mt-0.5">
                            {opt.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Selector */}
              <div>
                <label className="block text-xs font-bold text-black/70 dark:text-white/70 mb-1.5">
                  درجة الأهمية
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'low', label: 'عادي / استفسار', color: 'border-blue-500/30' },
                    { id: 'medium', label: 'متوسط / هام', color: 'border-amber-500/30' },
                    { id: 'urgent', label: 'عاجل جداً / طارئ', color: 'border-red-500/30' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id as ReportPriority)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        priority === p.id
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-white/60 dark:bg-[#1c1c1a]/60 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-black/70 dark:text-white/70 mb-1.5">
                  عنوان أو موضوع البلاغ *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="مثال: تأخير استلام الشحنة، أو تلف منتج الفخار أثناء النقل"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-[#1c1c1a] border border-black/10 dark:border-white/10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-black/70 dark:text-white/70 mb-1.5">
                  شرح وتفاصيل المشكلة بالتفصيل *
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اشرح المشكلة بالتفصيل، وما حدث معك بالظبط، وأي معلومات تساعد فريق الإدارة على التدخل السريع وحل المشكلة..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-[#1c1c1a] border border-black/10 dark:border-white/10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  required
                />
              </div>

              {/* Contact Info (Name, Phone, Governorate) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-black/5 dark:border-white/5">
                <div>
                  <label className="block text-xs font-bold text-black/70 dark:text-white/70 mb-1">
                    الاسم بالكامل *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="اسمك"
                      className="w-full pl-3 pr-8 py-2 rounded-xl text-xs bg-white dark:bg-[#1c1c1a] border border-black/10 dark:border-white/10 focus:border-primary focus:outline-none"
                      required
                    />
                    <User className="w-3.5 h-3.5 text-black/40 dark:text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black/70 dark:text-white/70 mb-1">
                    رقم الهاتف للتواصل *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full pl-3 pr-8 py-2 rounded-xl text-xs text-right bg-white dark:bg-[#1c1c1a] border border-black/10 dark:border-white/10 focus:border-primary focus:outline-none"
                      required
                    />
                    <Phone className="w-3.5 h-3.5 text-black/40 dark:text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black/70 dark:text-white/70 mb-1">
                    المحافظة
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      placeholder="مثال: سوهاج، قنا"
                      className="w-full pl-3 pr-8 py-2 rounded-xl text-xs bg-white dark:bg-[#1c1c1a] border border-black/10 dark:border-white/10 focus:border-primary focus:outline-none"
                    />
                    <MapPin className="w-3.5 h-3.5 text-black/40 dark:text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeReportModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  إلغاء
                </button>

                <button
                  id="submit-report-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-primary hover:bg-[#855b2d] text-white shadow-lg shadow-[#9a6a35]/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري إرسال البلاغ للإدارة...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>إرسال البلاغ للإدارة الآن</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* History & Tracking Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-black/60 dark:text-white/60">
                  سجل البلاغات والشكاوى التي قمت بتقديمها وردود إدارة منصة وه عليها:
                </p>
                <button
                  onClick={fetchMyTickets}
                  disabled={isLoadingHistory}
                  className="p-1.5 text-xs text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white flex items-center gap-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                  title="تحديث البيانات"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                  <span>تحديث</span>
                </button>
              </div>

              {isLoadingHistory ? (
                <div className="py-12 text-center text-black/40 dark:text-white/40 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                  <p className="text-xs">جاري تحميل سجل بلاغاتك...</p>
                </div>
              ) : myTickets.length === 0 ? (
                <div className="py-12 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto text-black/40 dark:text-white/40">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-black/70 dark:text-white/70">
                    لا توجد بلاغات مسجلة حتى الآن
                  </p>
                  <p className="text-xs text-black/50 dark:text-white/50 max-w-xs mx-auto">
                    إذا واجهتك أي مشكلة أثناء الشراء أو البيع، يمكنك تقديم بلاغ جديد وسيقوم فريق الإدارة بالرد فوراً.
                  </p>
                  <button
                    onClick={() => setActiveTab('new')}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-primary text-white hover:bg-[#855b2d]"
                  >
                    تقديم بلاغ الآن
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myTickets.map((ticket) => {
                    const catObj = CATEGORY_OPTIONS.find((c) => c.id === ticket.category);
                    return (
                      <div
                        key={ticket.id}
                        className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#181816]/90 space-y-3 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-primary dark:text-primary-hover bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md">
                              #{ticket.ticketNumber}
                            </span>
                            {getStatusBadge(ticket.status)}
                            <span className="text-[11px] font-bold text-black/60 dark:text-white/60">
                              {catObj?.label || ticket.category}
                            </span>
                          </div>
                          <span className="text-[10px] text-black/40 dark:text-white/40">
                            {new Date(ticket.createdAt).toLocaleString('ar-EG', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-black dark:text-white mb-1">
                            {ticket.subject}
                          </h4>
                          <p className="text-xs text-black/70 dark:text-white/70 whitespace-pre-wrap leading-relaxed">
                            {ticket.description}
                          </p>
                        </div>

                        {ticket.relatedOrderNumber && (
                          <div className="text-[11px] font-medium text-black/60 dark:text-white/60 bg-black/[0.03] dark:bg-white/[0.03] p-2 rounded-xl flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-amber-600" />
                            <span>مرتبط بالطلب: #{ticket.relatedOrderNumber}</span>
                          </div>
                        )}

                        {/* Admin Response Box */}
                        {ticket.adminResponse ? (
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>رد إدارة منصة وه:</span>
                              </span>
                              {ticket.adminRespondedAt && (
                                <span className="text-[10px] opacity-70">
                                  {new Date(ticket.adminRespondedAt).toLocaleString('ar-EG', {
                                    dateStyle: 'short',
                                    timeStyle: 'short'
                                  })}
                                </span>
                              )}
                            </div>
                            <p className="text-xs leading-relaxed whitespace-pre-wrap">
                              {ticket.adminResponse}
                            </p>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 text-[11px] text-black/50 dark:text-white/50 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>البلاغ قيد الدراسة من قِبل المشرفين، وسيصلك إشعار بالرد هنا فور الانتهاء.</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportIssueModal;
