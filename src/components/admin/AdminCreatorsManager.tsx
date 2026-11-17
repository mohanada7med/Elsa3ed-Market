import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Film,
  Image as ImageIcon,
  ShieldCheck,
  ShieldAlert,
  UserX,
  UserCheck,
  Trash2,
  ExternalLink,
  MapPin,
  Instagram,
  Youtube,
  Globe,
  Phone,
  Mail,
  Play,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Heart,
  RefreshCw
} from 'lucide-react';
import { Creator, CraftReel, CreatorPhoto, CreatorStatus } from '../../types.ts';
import { creatorApi } from '../../services/api.ts';
import { useApp } from '../../context/AppContext.tsx';

interface AdminCreatorsManagerProps {
  onNavigateToPublicProfile?: (creatorId: string) => void;
}

export const AdminCreatorsManager: React.FC<AdminCreatorsManagerProps> = ({
  onNavigateToPublicProfile
}) => {
  const { currentUser, confirmModal, addToast, setActivePage } = useApp();

  // Sub-tabs: 'creators' (applications/accounts) vs 'moderation' (pending content)
  const [activeSubTab, setActiveSubTab] = useState<'creators' | 'moderation'>('creators');

  // Creators list state
  const [creators, setCreators] = useState<Creator[]>([]);
  const [creatorFilter, setCreatorFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'suspended'>('pending');
  const [creatorSearch, setCreatorSearch] = useState('');
  const [isLoadingCreators, setIsLoadingCreators] = useState(true);

  // Content moderation state
  const [pendingReels, setPendingReels] = useState<CraftReel[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<CreatorPhoto[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [contentFilterType, setContentFilterType] = useState<'all' | 'reels' | 'photos'>('all');

  // Selected for action / modal
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [rejectionModal, setRejectionModal] = useState<{
    type: 'creator' | 'reel' | 'photo';
    id: string;
    title: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingRejection, setIsSubmittingRejection] = useState(false);

  // Media Previews
  const [previewReel, setPreviewReel] = useState<CraftReel | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<CreatorPhoto | null>(null);
  const [previewPhotoIdx, setPreviewPhotoIdx] = useState(0);

  // Fetch Creators List
  const fetchCreators = useCallback(async () => {
    setIsLoadingCreators(true);
    try {
      const data = await creatorApi.adminListCreators(currentUser, {
        status: creatorFilter === 'all' ? undefined : creatorFilter,
        search: creatorSearch.trim() || undefined
      });
      setCreators(data || []);
    } catch (err: any) {
      console.error('[AdminCreators] Error fetching creators:', err);
    } finally {
      setIsLoadingCreators(false);
    }
  }, [currentUser, creatorFilter, creatorSearch]);

  // Fetch Pending Content
  const fetchPendingContent = useCallback(async () => {
    setIsLoadingContent(true);
    try {
      const data = await creatorApi.adminGetPendingContent(currentUser);
      setPendingReels(data.reels || []);
      setPendingPhotos(data.photos || []);
    } catch (err: any) {
      console.error('[AdminCreators] Error fetching pending content:', err);
    } finally {
      setIsLoadingContent(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchCreators();
  }, [fetchCreators]);

  useEffect(() => {
    fetchPendingContent();
  }, [fetchPendingContent]);

  // Handle Creator Approval
  const handleApproveCreator = async (creator: Creator) => {
    confirmModal({
      title: 'اعتماد حساب صانع المحتوى',
      message: `هل أنت متأكد من اعتماد حساب "${creator.name}"؟ سيتمكن من نشر الريلز والصور بعد الاعتماد.`,
      confirmText: 'نعم، اعتماد الحساب',
      cancelText: 'إلغاء',
      danger: false,
      onConfirm: async () => {
        try {
          const updated = await creatorApi.adminUpdateCreatorStatus(currentUser, creator.id, 'approved');
          setCreators((prev) => prev.map((c) => (c.id === creator.id ? updated : c)));
          if (addToast) addToast('تم الاعتماد', `تم اعتماد حساب "${creator.name}" بنجاح`, 'success');
        } catch (err: any) {
          alert(err.message || 'فشل اعتماد الحساب');
        }
      }
    });
  };

  // Handle Toggle Verification
  const handleToggleVerification = async (creator: Creator) => {
    const nextStatus = !creator.verified;
    try {
      const updated = await creatorApi.adminToggleCreatorVerification(currentUser, creator.id, nextStatus);
      setCreators((prev) => prev.map((c) => (c.id === creator.id ? updated : c)));
      if (addToast) {
        addToast(
          nextStatus ? 'تم منح التوثيق' : 'تم إلغاء التوثيق',
          nextStatus
            ? `تم منح شارة التوثيق الذهبية لصانع المحتوى "${creator.name}"`
            : `تم إلغاء شارة التوثيق من "${creator.name}"`,
          'success'
        );
      }
    } catch (err: any) {
      alert(err.message || 'فشل تعديل شارة التوثيق');
    }
  };

  // Handle Suspension / Reactivation
  const handleToggleSuspension = async (creator: Creator) => {
    const isSuspended = creator.status === 'suspended';
    const nextStatus: CreatorStatus = isSuspended ? 'approved' : 'suspended';

    confirmModal({
      title: isSuspended ? 'إلغاء تجميد الحساب' : 'تجميد حساب صانع المحتوى',
      message: isSuspended
        ? `هل تريد إعادة تفعيل حساب "${creator.name}"؟`
        : `هل أنت متأكد من تجميد حساب "${creator.name}"؟ لن يتمكن من الوصول للمنصة أو نشر محتوى جديد.`,
      confirmText: isSuspended ? 'إعادة التفعيل' : 'تجميد الحساب',
      cancelText: 'إلغاء',
      danger: !isSuspended,
      onConfirm: async () => {
        try {
          const updated = await creatorApi.adminUpdateCreatorStatus(
            currentUser,
            creator.id,
            nextStatus,
            isSuspended ? undefined : 'تم تجميد الحساب بقرار إداري'
          );
          setCreators((prev) => prev.map((c) => (c.id === creator.id ? updated : c)));
          if (addToast) {
            addToast(
              isSuspended ? 'تم التفعيل' : 'تم التجميد',
              isSuspended
                ? `تمت إعادة تفعيل حساب "${creator.name}"`
                : `تم تجميد حساب "${creator.name}"`,
              'info'
            );
          }
        } catch (err: any) {
          alert(err.message || 'فشل تحديث حالة الحساب');
        }
      }
    });
  };

  // Handle Content Approval (Reel or Photo)
  const handleApproveContent = async (type: 'reel' | 'photo', id: string, title: string) => {
    confirmModal({
      title: `اعتماد ${type === 'reel' ? 'مقطع الفيديو' : 'ألبوم الصور'}`,
      message: `هل أنت متأكد من اعتماد "${title}"؟ سيظهر المحتوى فوراً في المعرض التراثي للجمهور.`,
      confirmText: 'نعم، اعتماد ونشر',
      cancelText: 'إلغاء',
      danger: false,
      onConfirm: async () => {
        try {
          if (type === 'reel') {
            await creatorApi.adminModerateReel(currentUser, id, 'approve');
            setPendingReels((prev) => prev.filter((r) => r.id !== id));
          } else {
            await creatorApi.adminModeratePhoto(currentUser, id, 'approve');
            setPendingPhotos((prev) => prev.filter((p) => p.id !== id));
          }
          if (addToast) addToast('تم الاعتماد', `تم اعتماد ونشر "${title}" في المنصة بنجاح`, 'success');
        } catch (err: any) {
          alert(err.message || 'فشل اعتماد المحتوى');
        }
      }
    });
  };

  // Handle Submitting Rejection (for creator, reel, or photo)
  const handleSubmitRejection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionModal) return;
    if (!rejectionReason.trim()) {
      alert('يرجى توضيح سبب الرفض باللغة العربية لإرشاد المستخدم');
      return;
    }

    setIsSubmittingRejection(true);
    try {
      if (rejectionModal.type === 'creator') {
        const updated = await creatorApi.adminUpdateCreatorStatus(
          currentUser,
          rejectionModal.id,
          'rejected',
          rejectionReason.trim()
        );
        setCreators((prev) => prev.map((c) => (c.id === rejectionModal.id ? updated : c)));
      } else if (rejectionModal.type === 'reel') {
        await creatorApi.adminModerateReel(currentUser, rejectionModal.id, 'reject', rejectionReason.trim());
        setPendingReels((prev) => prev.filter((r) => r.id !== rejectionModal.id));
      } else {
        await creatorApi.adminModeratePhoto(currentUser, rejectionModal.id, 'reject', rejectionReason.trim());
        setPendingPhotos((prev) => prev.filter((p) => p.id !== rejectionModal.id));
      }

      if (addToast) addToast('تم الرفض', `تم رفض الطلب وإرسال سبب الرفض إلى صاحب الحساب`, 'info');
      setRejectionModal(null);
      setRejectionReason('');
    } catch (err: any) {
      alert(err.message || 'فشل رفض الطلب');
    } finally {
      setIsSubmittingRejection(false);
    }
  };

  const pendingCreatorsCount = creators.filter((c) => c.status === 'pending').length;
  const pendingContentTotal = pendingReels.length + pendingPhotos.length;

  return (
    <div className="space-y-6 font-cairo" dir="rtl">
      {/* Top Header Card */}
      <div className="rounded-3xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary /10 dark:bg-primary /20 bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-espresso dark:text-cream">
              إدارة صناع المحتوى والاعتماد التراثي
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              مراجعة طلبات الانضمام، توثيق الحسابات، وتدقيق مقاطع الريلز ومعارض الصور التراثية
            </p>
          </div>
        </div>

        {/* Sub Tabs Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-100 dark:bg-[#160B05] border border-sand-200 dark:border-[#2C1A10]">
          <button
            type="button"
            onClick={() => setActiveSubTab('creators')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'creators'
              ? 'bg-primary  text-white shadow'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
          >
            <span>طلبات وحسابات الصناع</span>
            {pendingCreatorsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary hover:bg-primary-hover text-white text-[10px] font-black">
                {pendingCreatorsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('moderation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'moderation'
              ? 'bg-primary  text-white shadow'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
          >
            <span>تدقيق المحتوى المعلق</span>
            {pendingContentTotal > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
                {pendingContentTotal}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SUBTAB 1: CREATOR ACCOUNTS / APPLICATIONS */}
      {activeSubTab === 'creators' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-white dark:bg-[#1C0E07] rounded-2xl border border-sand-200 dark:border-[#382317]">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'pending', label: 'قيد المراجعة' },
                { id: 'approved', label: 'معتمد' },
                { id: 'rejected', label: 'مرفوض' },
                { id: 'suspended', label: 'معلق' }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCreatorFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${creatorFilter === f.id
                    ? 'bg-primary  text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#25150C]'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={creatorSearch}
                onChange={(e) => setCreatorSearch(e.target.value)}
                placeholder="بحث بالاسم أو المحافظة..."
                className="w-full pr-9 pl-3 py-2 rounded-xl border border-stone-200 dark:border-[#382317] bg-white dark:bg-[#160B05] text-xs text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-[#E66A2E]"
              />
            </div>
          </div>

          {/* Creators Table / Cards */}
          {isLoadingCreators ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-2 border-[#E66A2E] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : creators.length === 0 ? (
            <div className="py-16 text-center space-y-2 bg-white dark:bg-[#1C0E07] rounded-3xl border border-sand-200 dark:border-[#382317]">
              <Sparkles className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
              <p className="text-xs text-stone-500">لا توجد طلبات صناع محتوى تطابق الفلتر الحالي</p>
            </div>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-stone-50 dark:bg-[#160B05] border-b border-sand-200 dark:border-[#2C1A10] text-stone-500 font-bold">
                    <tr>
                      <th className="py-3 px-4">صانع المحتوى</th>
                      <th className="py-3 px-4">الموقع</th>
                      <th className="py-3 px-4">التخصصات</th>
                      <th className="py-3 px-4">بيانات التواصل</th>
                      <th className="py-3 px-4">الحالة</th>
                      <th className="py-3 px-4">التوثيق</th>
                      <th className="py-3 px-4 text-left">إجراءات الإدارة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-[#25150C]">
                    {creators.map((c) => (
                      <tr key={c.id} className="hover:bg-stone-50/50 dark:hover:bg-[#201007]">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={c.avatar || 'https://res.cloudinary.com/kuana1nl/image/upload/v1788710904/user.jpg'}
                              alt={c.name}
                              className="w-10 h-10 rounded-xl object-cover border border-stone-200 dark:border-[#382317] shrink-0"
                            />
                            <div>
                              <div className="font-bold text-espresso dark:text-cream flex items-center gap-1.5">
                                <span>{c.name}</span>
                                {c.verified && (
                                  <span className="text-amber-500 text-[10px] font-black" title="موثق">
                                    ★
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-stone-400 line-clamp-1 max-w-xs mt-0.5">
                                {c.bio}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                          {c.city ? `${c.city}، ` : ''}
                          {c.governorate}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(c.specialties || []).slice(0, 2).map((s, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#25150C] text-[10px] text-stone-600 dark:text-stone-300"
                              >
                                {s}
                              </span>
                            ))}
                            {(c.specialties || []).length > 2 && (
                              <span className="text-[10px] text-stone-400">
                                +{(c.specialties || []).length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-stone-500 text-[11px]">
                          <div>{c.phone || '-'}</div>
                          {c.email && <div className="text-stone-400">{c.email}</div>}
                        </td>

                        <td className="py-3 px-4">
                          {c.status === 'approved' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                              معتمد
                            </span>
                          ) : c.status === 'pending' ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                              قيد المراجعة
                            </span>
                          ) : c.status === 'rejected' ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 text-[10px] font-bold">
                              مرفوض
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-stone-500/10 text-stone-500 text-[10px] font-bold">
                              معلق
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleVerification(c)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${c.verified
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-stone-100 dark:bg-[#25150C] text-stone-500 hover:text-amber-600'
                              }`}
                            title="تبديل شارة التوثيق"
                          >
                            {c.verified ? '★ موثق' : 'توثيق'}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-left">
                          <div className="flex items-center justify-end gap-1.5">
                            {c.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApproveCreator(c)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm cursor-pointer"
                                >
                                  اعتماد
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRejectionModal({
                                      type: 'creator',
                                      id: c.id,
                                      title: c.name
                                    })
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-sm cursor-pointer"
                                >
                                  رفض
                                </button>
                              </>
                            )}

                            {c.status === 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleToggleSuspension(c)}
                                className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-[#25150C] hover:bg-red-50 hover:text-red-600 text-stone-600 dark:text-stone-300 text-[10px] font-medium"
                                title="تجميد الحساب"
                              >
                                تجميد
                              </button>
                            )}

                            {c.status === 'suspended' && (
                              <button
                                type="button"
                                onClick={() => handleToggleSuspension(c)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold"
                              >
                                تنشيط
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                if (onNavigateToPublicProfile) {
                                  onNavigateToPublicProfile(c.id);
                                } else {
                                  setActivePage('creator-public-profile');
                                }
                              }}
                              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                              title="معاينة الصفحة العامة"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: CONTENT MODERATION (PENDING REELS & PHOTOS) */}
      {activeSubTab === 'moderation' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-espresso dark:text-cream">تصفية نوع المحتوى:</span>
              <div className="flex items-center gap-1 bg-white dark:bg-[#1C0E07] p-1 rounded-xl border border-sand-200 dark:border-[#382317]">
                <button
                  type="button"
                  onClick={() => setContentFilterType('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${contentFilterType === 'all'
                    ? 'bg-primary  text-white'
                    : 'text-stone-600 dark:text-stone-400'
                    }`}
                >
                  الكل ({pendingContentTotal})
                </button>
                <button
                  type="button"
                  onClick={() => setContentFilterType('reels')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${contentFilterType === 'reels'
                    ? 'bg-primary  text-white'
                    : 'text-stone-600 dark:text-stone-400'
                    }`}
                >
                  فيديوهات ({pendingReels.length})
                </button>
                <button
                  type="button"
                  onClick={() => setContentFilterType('photos')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${contentFilterType === 'photos'
                    ? 'bg-primary  text-white'
                    : 'text-stone-600 dark:text-stone-400'
                    }`}
                >
                  معارض صور ({pendingPhotos.length})
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchPendingContent()}
              className="p-2 rounded-xl border border-sand-300 dark:border-[#382317] hover:bg-stone-100 dark:hover:bg-[#25150C] text-stone-600 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث القائمة</span>
            </button>
          </div>

          {isLoadingContent ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-2 border-[#E66A2E] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : pendingContentTotal === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white dark:bg-[#1C0E07] rounded-3xl border border-sand-200 dark:border-[#382317]">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-espresso dark:text-cream">كل المحتوى مراجع ومعتمد!</h3>
              <p className="text-xs text-stone-500">لا توجد أي فيديوهات أو صور بانتظار الاعتماد حالياً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pending Reels */}
              {(contentFilterType === 'all' || contentFilterType === 'reels') &&
                pendingReels.map((reel) => (
                  <div
                    key={reel.id}
                    className="rounded-3xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] p-4 shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div className="flex gap-4">
                      {/* Video Poster with Preview trigger */}
                      <div
                        onClick={() => setPreviewReel(reel)}
                        className="w-24 aspect-[9/16] rounded-2xl overflow-hidden bg-black relative group shrink-0 cursor-pointer shadow"
                      >
                        <img
                          src={reel.posterUrl || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'}
                          alt={reel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                          <Play className="w-6 h-6 text-white fill-current" />
                        </div>
                        <span className="absolute bottom-1 right-1 px-1 rounded bg-black/70 text-white text-[9px]">
                          {reel.duration || '0:30'}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-bold">
                            ريل فيديو
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {new Date(reel.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-espresso dark:text-cream line-clamp-2">
                          {reel.title}
                        </h4>

                        <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed">
                          {reel.description}
                        </p>

                        <div className="text-[10px] text-stone-500 flex items-center gap-2 pt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 bg-primary hover:bg-primary-hover text-white" />
                            {reel.governorate}
                          </span>
                          <span>•</span>
                          <span>صانع: {reel.artisanName || reel.creatorName || 'صعيدي'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Moderation Actions */}
                    <div className="pt-3 border-t border-stone-100 dark:border-[#2C1A10] flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setRejectionModal({
                            type: 'reel',
                            id: reel.id,
                            title: reel.title
                          })
                        }
                        className="px-4 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
                      >
                        رفض مع السبب
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveContent('reel', reel.id, reel.title)}
                        className="px-5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-colors cursor-pointer"
                      >
                        اعتماد ونشر
                      </button>
                    </div>
                  </div>
                ))}

              {/* Pending Photos */}
              {(contentFilterType === 'all' || contentFilterType === 'photos') &&
                pendingPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="rounded-3xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] p-4 shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div className="flex gap-4">
                      {/* Photo Cover with Lightbox trigger */}
                      <div
                        onClick={() => {
                          setPreviewPhoto(photo);
                          setPreviewPhotoIdx(0);
                        }}
                        className="w-28 aspect-[4/3] rounded-2xl overflow-hidden bg-black relative group shrink-0 cursor-pointer shadow"
                      >
                        <img
                          src={photo.images[0]}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {photo.images.length > 1 && (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold flex items-center gap-0.5">
                            <Layers className="w-2.5 h-2.5" />
                            <span>{photo.images.length} صور</span>
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-[10px] font-bold">
                            معرض صور ({photo.category})
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {new Date(photo.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-espresso dark:text-cream line-clamp-1">
                          {photo.title}
                        </h4>

                        <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed">
                          {photo.caption}
                        </p>

                        <div className="text-[10px] text-stone-500 flex items-center gap-2 pt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 bg-primary hover:bg-primary-hover text-white" />
                            {photo.governorate}
                          </span>
                          <span>•</span>
                          <span>صانع: {photo.creatorName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Moderation Actions */}
                    <div className="pt-3 border-t border-stone-100 dark:border-[#2C1A10] flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setRejectionModal({
                            type: 'photo',
                            id: photo.id,
                            title: photo.title
                          })
                        }
                        className="px-4 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
                      >
                        رفض مع السبب
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveContent('photo', photo.id, photo.title)}
                        className="px-5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-colors cursor-pointer"
                      >
                        اعتماد ونشر
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Rejection Modal with Reason Field */}
      <AnimatePresence>
        {rejectionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-[#1E110A] rounded-3xl p-6 shadow-2xl border border-sand-300 dark:border-[#382317] space-y-4"
            >
              <div className="flex items-center justify-between border-b border-sand-200 dark:border-[#2C1A10] pb-3">
                <h3 className="text-sm font-bold text-espresso dark:text-cream flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>
                    رفض {rejectionModal.type === 'creator' ? 'طلب الحساب' : 'المحتوى المرسل'}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => setRejectionModal(null)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300">
                يرجى كتابة سبب الرفض بوضوح ليظهر لصانع المحتوى ويتمكن من تصحيحه وإعادة تقديمه:
              </p>

              <form onSubmit={handleSubmitRejection} className="space-y-4">
                <textarea
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="مثال: يرجى تحسين جودة الصوت في الفيديو، أو تصوير زاوية أوضح، أو التأكد من مطابقة المعروض للهوية الصعيدية..."
                  required
                  className="w-full p-3 rounded-xl border border-stone-200 dark:border-[#382317] bg-stone-50 dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none leading-relaxed"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectionModal(null)}
                    className="px-4 py-2 rounded-xl border border-stone-200 dark:border-[#382317] text-stone-600 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRejection || !rejectionReason.trim()}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingRejection ? 'جاري الرفض...' : 'تأكيد الرفض'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reel Video Preview Modal */}
      <AnimatePresence>
        {previewReel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20 aspect-[9/16]"
            >
              <button
                type="button"
                onClick={() => setPreviewReel(null)}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                ✕
              </button>
              <video
                src={previewReel.videoUrl}
                poster={previewReel.posterUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Photo Preview Modal */}
      <AnimatePresence>
        {previewPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[92vh]"
            >
              <div className="p-4 flex items-center justify-between border-b border-white/10 text-white">
                <div className="text-xs font-bold">{previewPhoto.title}</div>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(null)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/80"
                >
                  ✕
                </button>
              </div>

              <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px]">
                <img
                  src={previewPhoto.images[previewPhotoIdx]}
                  alt="Preview"
                  className="max-h-[60vh] max-w-full object-contain"
                />

                {previewPhoto.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewPhotoIdx((prev) =>
                          prev > 0 ? prev - 1 : previewPhoto.images.length - 1
                        )
                      }
                      className="absolute right-3 p-2 rounded-full bg-black/60 text-white"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewPhotoIdx((prev) =>
                          prev < previewPhoto.images.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="absolute left-3 p-2 rounded-full bg-black/60 text-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
