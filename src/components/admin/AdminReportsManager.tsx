import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Mail,
  User,
  Store,
  Package,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Send,
  Trash2,
  ChevronDown,
  FileText,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useApp } from '../../context/AppContext.tsx';
import type { ReportTicket, ReportStatus, ReportPriority, ReportCategory } from '../../types.ts';
import { CATEGORY_OPTIONS } from '../common/ReportIssueModal.tsx';

interface AdminReportsManagerProps {
  onTicketCountChange?: (count: number) => void;
}

export const AdminReportsManager: React.FC<AdminReportsManagerProps> = ({ onTicketCountChange }) => {
  const { currentUser, addToast, confirmModal } = useApp();

  const [reports, setReports] = useState<ReportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'buyer' | 'seller' | 'guest'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Selected ticket for reply/update modal
  const [selectedTicket, setSelectedTicket] = useState<ReportTicket | null>(null);
  const [replyStatus, setReplyStatus] = useState<ReportStatus>('in_progress');
  const [replyText, setReplyText] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminReports({ id: currentUser?.id, role: currentUser?.role });
      setReports(data || []);
      const pendingCount = (data || []).filter((r: ReportTicket) => r.status === 'pending').length;
      if (onTicketCountChange) {
        onTicketCountChange(pendingCount);
      }
    } catch (err: any) {
      addToast('خطأ', err.message || 'تعذر جلب البلاغات والشكاوى', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const openActionModal = (ticket: ReportTicket) => {
    setSelectedTicket(ticket);
    setReplyStatus(ticket.status === 'pending' ? 'in_progress' : ticket.status);
    setReplyText(ticket.adminResponse || '');
    setInternalNotes(ticket.internalNotes || '');
  };

  const closeActionModal = () => {
    setSelectedTicket(null);
    setReplyText('');
    setInternalNotes('');
  };

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setIsSaving(true);
    try {
      const res = await api.updateAdminReport(
        selectedTicket.id,
        {
          status: replyStatus,
          adminResponse: replyText.trim() || undefined,
          internalNotes: internalNotes.trim() || undefined
        },
        { id: currentUser?.id, role: currentUser?.role }
      );

      setReports((prev) =>
        prev.map((t) => (t.id === selectedTicket.id ? res.data : t))
      );
      addToast('تم الحفظ', 'تم تحديث حالة البلاغ وإرسال الرد للشاكي بنجاح', 'success');
      closeActionModal();
    } catch (err: any) {
      addToast('خطأ', err.message || 'فشل تحديث البلاغ', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickStatusChange = async (ticket: ReportTicket, newStatus: ReportStatus) => {
    try {
      const res = await api.updateAdminReport(
        ticket.id,
        { status: newStatus },
        { id: currentUser?.id, role: currentUser?.role }
      );
      setReports((prev) =>
        prev.map((t) => (t.id === ticket.id ? res.data : t))
      );
      addToast('تم التحديث', `تم تعديل حالة البلاغ إلى ${getStatusLabel(newStatus)}`, 'success');
    } catch (err: any) {
      addToast('خطأ', err.message || 'تعذر تعديل الحالة', 'error');
    }
  };

  const handleDeleteTicket = (ticket: ReportTicket) => {
    confirmModal({
      title: 'حذف هذا البلاغ نهائياً',
      message: `هل أنت متأكد من رغبتك في حذف البلاغ #${ticket.ticketNumber} بخصوص "${ticket.subject}"؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmText: 'نعم، احذف البلاغ',
      cancelText: 'إلغاء',
      danger: true,
      onConfirm: async () => {
        try {
          await api.deleteAdminReport(ticket.id, { id: currentUser?.id, role: currentUser?.role });
          setReports((prev) => prev.filter((t) => t.id !== ticket.id));
          addToast('تم الحذف', 'تم حذف البلاغ من السجلات', 'info');
        } catch (err: any) {
          addToast('خطأ', err.message || 'فشل حذف البلاغ', 'error');
        }
      }
    });
  };

  const getStatusLabel = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return 'جديد (بانتظار الرد)';
      case 'in_progress':
        return 'قيد المتابعة';
      case 'resolved':
        return 'تم الحل بنجاح';
      case 'rejected':
        return 'مرفوض / مغلق';
      default:
        return status;
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span>جديد (بانتظار الرد)</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-500/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>قيد المتابعة والحل</span>
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>تم الحل بنجاح</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-neutral-500/10 text-neutral-800 dark:text-neutral-300 border border-neutral-500/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-neutral-500" />
            <span>مرفوض / مغلق</span>
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: ReportPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            <span>طارئ جداً</span>
          </span>
        );
      case 'high':
        return (
          <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span>عاجل</span>
          </span>
        );
      case 'medium':
        return (
          <span className="bg-blue-600/15 text-blue-800 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span>متوسط</span>
          </span>
        );
      case 'low':
        return (
          <span className="bg-neutral-500/15 text-neutral-700 dark:text-neutral-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span>عادي</span>
          </span>
        );
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) => r.status === 'pending').length;
    const inProgress = reports.filter((r) => r.status === 'in_progress').length;
    const resolved = reports.filter((r) => r.status === 'resolved').length;
    const urgent = reports.filter((r) => (r.priority === 'urgent' || r.priority === 'high') && r.status !== 'resolved').length;
    return { total, pending, inProgress, resolved, urgent };
  }, [reports]);

  // Filtered List
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Status Filter
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;

      // Role Filter
      if (roleFilter !== 'all') {
        if (roleFilter === 'seller' && r.userRole !== 'seller') return false;
        if (roleFilter === 'buyer' && r.userRole !== 'buyer') return false;
        if (roleFilter === 'guest' && r.userRole !== 'guest') return false;
      }

      // Category Filter
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;

      // Priority Filter
      if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;

      // Search Term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTicket = r.ticketNumber.toLowerCase().includes(q);
        const matchesSubject = r.subject.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        const matchesUser = r.userName.toLowerCase().includes(q);
        const matchesPhone = r.userPhone.toLowerCase().includes(q);
        const matchesOrder = r.relatedOrderNumber?.toLowerCase().includes(q);
        return matchesTicket || matchesSubject || matchesDesc || matchesUser || matchesPhone || matchesOrder;
      }

      return true;
    });
  }, [reports, statusFilter, roleFilter, categoryFilter, priorityFilter, searchTerm]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white/80 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-lg backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-serif">
                  إدارة البلاغات والشكاوى والدعم الفني
                </h2>
                <p className="text-xs text-black/60 dark:text-white/60 font-medium">
                  استقبال ومتابعة جميع شكاوى وبلاغات المشترين، شيوخ الصنعة، والورش الحرفية وحلها مباشرة
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchReports}
              disabled={isLoading}
              className="px-4 py-2.5 bg-black/5 dark:bg-white/10 hover:bg-black/10 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>تحديث البلاغات</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-black/10 dark:border-white/10">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-right">
            <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300">
              بلاغات جديدة بانتظار الرد
            </div>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1 font-mono">
              {stats.pending}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-right">
            <div className="text-[11px] font-bold text-blue-900 dark:text-blue-300">
              قيد المتابعة والحل
            </div>
            <div className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1 font-mono">
              {stats.inProgress}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-right">
            <div className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
              تم حلها بالكامل
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
              {stats.resolved}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-right">
            <div className="text-[11px] font-bold text-rose-900 dark:text-rose-300">
              بلاغات عاجلة / طارئة
            </div>
            <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1 font-mono">
              {stats.urgent}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white/80 dark:bg-[#151513]/90 rounded-2xl border border-black/10 dark:border-white/10 p-4 shadow-sm backdrop-blur-xl space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute right-3 top-3 text-black/40 dark:text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث برقم التذكرة، اسم الشاكي، رقم الهاتف، أو رقم الطلب..."
              className="w-full pr-9 pl-4 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'كل الأدوار' },
              { id: 'buyer', label: 'المشترين' },
              { id: 'seller', label: 'الورش / البائعين' },
              { id: 'guest', label: 'زوار' }
            ].map((rf) => (
              <button
                key={rf.id}
                type="button"
                onClick={() => setRoleFilter(rf.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                  roleFilter === rf.id
                    ? 'bg-[#9a6a35] text-white'
                    : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 text-black/70 dark:text-white/70'
                }`}
              >
                {rf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/5 dark:border-white/5">
          <span className="text-xs font-bold text-black/50 dark:text-white/50 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>الحالة:</span>
          </span>
          {[
            { id: 'all', label: `الكل (${reports.length})` },
            { id: 'pending', label: `جديد (${stats.pending})` },
            { id: 'in_progress', label: `قيد المتابعة (${stats.inProgress})` },
            { id: 'resolved', label: `تم الحل (${stats.resolved})` },
            { id: 'rejected', label: 'مرفوض / مغلق' }
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id as any)}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                statusFilter === st.id
                  ? 'border-[#9a6a35] bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d]'
                  : 'border-transparent text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-black/50 dark:text-white/50 space-y-2 bg-white/60 dark:bg-[#151513]/60 rounded-3xl border border-black/10 dark:border-white/10">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#9a6a35]" />
            <p>جاري تحميل البلاغات من الخادم...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center text-xs text-black/50 dark:text-white/50 space-y-3 bg-white/60 dark:bg-[#151513]/60 rounded-3xl border border-dashed border-black/10 dark:border-white/10">
            <ShieldCheck className="w-12 h-12 mx-auto text-black/30 dark:text-white/30" />
            <h4 className="font-bold text-sm text-[#211d18] dark:text-[#f5f0e7]">
              لا توجد بلاغات تطابق شروط البحث أو التصفية
            </h4>
            <p className="text-[11px] text-black/50 dark:text-white/50 max-w-sm mx-auto">
              عندما يقوم أي مشتري أو صانع ورشة بتقديم شكوى أو طلب مساعدة، ستظهر التذكرة هنا فوراً لإدارتها والرد عليها.
            </p>
          </div>
        ) : (
          filteredReports.map((ticket) => {
            const categoryObj = CATEGORY_OPTIONS.find((c) => c.id === ticket.category);
            return (
              <div
                key={ticket.id}
                className={`p-5 rounded-3xl border transition-all bg-white/80 dark:bg-[#151513]/90 shadow-sm backdrop-blur-xl space-y-4 ${
                  ticket.status === 'pending'
                    ? 'border-amber-500/40 dark:border-amber-500/30 ring-1 ring-amber-500/20'
                    : 'border-black/10 dark:border-white/10'
                }`}
              >
                {/* Top Row: Meta Info & Status Badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-xs bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-lg text-[#9a6a35] dark:text-[#d5a56d]">
                      #{ticket.ticketNumber}
                    </span>

                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}

                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70">
                      {categoryObj?.label || ticket.category}
                    </span>

                    {ticket.userRole === 'seller' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                        <Store className="w-3 h-3" />
                        <span>بائع / ورشة</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-500/20">
                        <User className="w-3 h-3" />
                        <span>مشتري</span>
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-black/40 dark:text-white/40">
                    {new Date(ticket.createdAt).toLocaleString('ar-EG', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>

                {/* Submitter Details Banner */}
                <div className="p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <User className="w-3.5 h-3.5 text-[#9a6a35]" />
                    <span>الشاكي: <strong>{ticket.userName}</strong></span>
                    {ticket.userGovernorate && (
                      <span className="text-[11px] text-black/50 dark:text-white/50 font-normal">
                        ({ticket.userGovernorate})
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={`tel:${ticket.userPhone}`}
                      className="text-[#9a6a35] dark:text-[#d5a56d] font-mono font-bold flex items-center gap-1 hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{ticket.userPhone}</span>
                    </a>

                    {ticket.userEmail && (
                      <a
                        href={`mailto:${ticket.userEmail}`}
                        className="text-black/60 dark:text-white/60 flex items-center gap-1 hover:underline"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{ticket.userEmail}</span>
                      </a>
                    )}

                    {ticket.relatedOrderNumber && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-black/70 dark:text-white/70 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                        <Package className="w-3.5 h-3.5 text-[#9a6a35]" />
                        <span>رقم الطلب: {ticket.relatedOrderNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subject & Description */}
                <div className="space-y-1.5 text-right">
                  <h3 className="text-sm font-black text-[#211d18] dark:text-[#f5f0e7]">
                    {ticket.subject}
                  </h3>
                  <p className="text-xs text-black/75 dark:text-white/75 leading-relaxed whitespace-pre-line bg-black/[0.015] dark:bg-white/[0.015] p-3 rounded-2xl border border-black/5 dark:border-white/5">
                    {ticket.description}
                  </p>
                </div>

                {/* Attachments if any */}
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-black/50 dark:text-white/50">المرفقات:</span>
                    {ticket.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-[#9a6a35] hover:underline flex items-center gap-1 bg-[#9a6a35]/10 px-2 py-1 rounded-lg"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>معاينة الرابط المرفق #{i + 1}</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* Admin Response Display (If already replied) */}
                {ticket.adminResponse && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-xs font-black text-emerald-800 dark:text-emerald-300">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>رد إدارة منصة وه المسجل:</span>
                      </div>
                      {ticket.adminRespondedAt && (
                        <span className="text-[10px] font-normal text-emerald-800/60 dark:text-emerald-300/60">
                          {new Date(ticket.adminRespondedAt).toLocaleString('ar-EG')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-950 dark:text-emerald-100 leading-relaxed">
                      {ticket.adminResponse}
                    </p>
                  </div>
                )}

                {/* Internal Admin Notes (Staff only) */}
                {ticket.internalNotes && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-900 dark:text-amber-200">
                    <strong>ملاحظات سرية للإدارة:</strong> {ticket.internalNotes}
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openActionModal(ticket)}
                      className="px-4 py-2 bg-[#9a6a35] hover:bg-[#7e5527] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{ticket.adminResponse ? 'تعديل الرد والملاحظات' : 'الرد وحل البلاغ'}</span>
                    </button>

                    {ticket.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(ticket, 'resolved')}
                        className="px-3 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-600/20 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>تم الحل فوراً</span>
                      </button>
                    )}

                    {ticket.status !== 'in_progress' && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(ticket, 'in_progress')}
                        className="px-3 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl border border-blue-600/20 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>قيد المتابعة</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteTicket(ticket)}
                      className="p-2 text-rose-600 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                      title="حذف البلاغ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Admin Action & Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
          <div
            className="w-full max-w-xl bg-white dark:bg-[#151513] rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7]">
                    الرد على التذكرة #{selectedTicket.ticketNumber}
                  </h3>
                  <p className="text-xs text-black/60 dark:text-white/60">
                    الشاكي: {selectedTicket.userName} ({selectedTicket.userPhone})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeActionModal}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 flex items-center justify-center text-black/60 dark:text-white/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReply} className="space-y-4">
              {/* Change Status Dropdown */}
              <div>
                <label className="block text-xs font-bold mb-1.5">تحديث حالة البلاغ</label>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value as ReportStatus)}
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:border-[#9a6a35] cursor-pointer"
                >
                  <option value="pending">جديد (بانتظار المراجعة)</option>
                  <option value="in_progress">قيد المتابعة والحل</option>
                  <option value="resolved">تم الحل بنجاح</option>
                  <option value="rejected">مرفوض / مغلق</option>
                </select>
              </div>

              {/* Public Admin Response for the user */}
              <div>
                <label className="block text-xs font-bold mb-1">
                  رد الإدارة على الشاكي <span className="text-emerald-600 font-bold">(سيظهر له فوراً في حسابه)</span>
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="اكتب ردك الواضح على المشكلة، والحلول التي تم اتخاذها، أو توجيهات التواصل..."
                  className="w-full p-3 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] resize-none"
                />
              </div>

              {/* Private Staff Notes */}
              <div>
                <label className="block text-xs font-bold mb-1">
                  ملاحظات سرية للإدارة <span className="text-black/40 dark:text-white/40 font-normal">(لن يراها الشاكي)</span>
                </label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="ملاحظات داخلية لفريق العمل، تفاصيل التواصل الهاتفي، أو إجراءات البنك..."
                  className="w-full p-3 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={closeActionModal}
                  className="px-4 py-2 text-xs font-bold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#9a6a35] hover:bg-[#7e5527] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري حفظ الرد...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>حفظ الرد وتحديث الحالة</span>
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
