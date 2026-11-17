import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Film,
  Image as ImageIcon,
  Sparkles,
  Eye,
  Heart,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  Camera,
  Share2,
  Filter,
  Save,
  Instagram,
  Youtube,
  Globe,
  Layers,
  Play,
  RotateCcw,
  Lock,
  Compass,
  LayoutDashboard,
  User as UserIcon,
  FolderOpen,
  X
} from 'lucide-react';
import {
  Creator,
  CraftReel,
  CreatorPhoto,
  Governorate,
  CreatorStatus,
  ContentStatus
} from '../../types.ts';
import { creatorApi } from '../../services/api.ts';
import { craftReelsService } from '../../services/craftReelsService.ts';
import { useApp } from '../../context/AppContext.tsx';
import { ReelUploadModal } from '../common/ReelUploadModal.tsx';
import { ReelEditModal } from '../common/ReelEditModal.tsx';
import { PhotoUploadModal } from './PhotoUploadModal.tsx';
import { PhotoEditModal } from './PhotoEditModal.tsx';

interface CreatorDashboardProps {
  initialTab?: 'overview' | 'reels' | 'photos' | 'profile' | 'content';
  onNavigateToPublic?: (creatorId: string) => void;
}

const GOVERNORATES: Governorate[] = [
  'أسوان',
  'الأقصر',
  'قنا',
  'سوهاج',
  'أسيوط',
  'المنيا',
  'بني سويف',
  'الوادي الجديد',
  'الفيوم',
  'البحر الاحمر',
  'القاهرة',
  'الجيزة',
  'الإسكندرية'
];

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  initialTab = 'overview',
  onNavigateToPublic
}) => {
  const {
    currentUser,
    setCurrentUser,
    navigateToCreator,
    setIsCreatorApplyModalOpen,
    confirmModal,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'reels' | 'photos' | 'profile' | 'content'>(initialTab);

  // Creator profile state
  const [creator, setCreator] = useState<Creator | null>(null);
  const [creatorStatus, setCreatorStatus] = useState<CreatorStatus | 'none'>(
    (currentUser?.creatorStatus as CreatorStatus | 'none') || 'pending'
  );
  const [isLoading, setIsLoading] = useState(true);

  // Reels & Photos state
  const [reels, setReels] = useState<CraftReel[]>([]);
  const [photos, setPhotos] = useState<CreatorPhoto[]>([]);
  const [contentFilter, setContentFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Modals state
  const [isUploadReelOpen, setIsUploadReelOpen] = useState(false);
  const [isUploadPhotoOpen, setIsUploadPhotoOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<CraftReel | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<CreatorPhoto | null>(null);
  const [previewVideoReel, setPreviewVideoReel] = useState<CraftReel | null>(null);

  // Profile Edit State
  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileGovernorate, setProfileGovernorate] = useState<Governorate>('قنا');
  const [profileCity, setProfileCity] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileSpecialties, setProfileSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [profileInstagram, setProfileInstagram] = useState('');
  const [profileYoutube, setProfileYoutube] = useState('');
  const [profileTiktok, setProfileTiktok] = useState('');
  const [profileFacebook, setProfileFacebook] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load Creator Data
  const loadCreatorData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Creator Profile & Status
      const statusRes = await creatorApi.getCreatorStatus(currentUser);
      setCreatorStatus(statusRes.status);
      if (statusRes.creator) {
        setCreator(statusRes.creator);
        setProfileName(statusRes.creator.name || '');
        setProfileBio(statusRes.creator.bio || '');
        setProfileGovernorate(statusRes.creator.governorate || 'قنا');
        setProfileCity(statusRes.creator.city || '');
        setProfileAvatar(statusRes.creator.avatar || '');
        setProfileSpecialties(statusRes.creator.specialties || []);
        setProfileInstagram(statusRes.creator.socialLinks?.instagram || '');
        setProfileYoutube(statusRes.creator.socialLinks?.youtube || '');
        setProfileTiktok(statusRes.creator.socialLinks?.tiktok || '');
        setProfileFacebook(statusRes.creator.socialLinks?.facebook || '');
      }

      // 2. Fetch Creator's Reels & Photos for any active/existing creator profile
      if (statusRes.status && statusRes.status !== 'none') {
        const [userReels, userPhotos] = await Promise.all([
          creatorApi.getCreatorOwnReels(currentUser).catch(() => []),
          creatorApi.getCreatorOwnPhotos(currentUser).catch(() => [])
        ]);
        setReels(userReels || []);
        setPhotos(userPhotos || []);
      }
    } catch (err: any) {
      console.error('[CreatorDashboard] Failed to load creator data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadCreatorData();
  }, [loadCreatorData]);

  // Aggregate Overview Stats
  const publishedReels = reels.filter((r) => r.status === 'approved' || (!r.status && !r.rejectionReason));
  const pendingReels = reels.filter((r) => r.status === 'pending');
  const rejectedReels = reels.filter((r) => r.status === 'rejected');

  const publishedPhotos = photos.filter((p) => p.status === 'approved');
  const pendingPhotos = photos.filter((p) => p.status === 'pending');
  const rejectedPhotos = photos.filter((p) => p.status === 'rejected');

  const totalViews =
    reels.reduce((sum, r) => sum + (r.viewsCount || 0), 0) +
    photos.reduce((sum, p) => sum + (p.viewsCount || 0), 0);

  const totalLikes =
    reels.reduce((sum, r) => sum + (r.likesCount || 0), 0) +
    photos.reduce((sum, p) => sum + (p.likesCount || 0), 0);

  // Handle Delete Content via App Modal
  const requestDelete = (target: { type: 'reel' | 'photo'; id: string; title: string }) => {
    confirmModal({
      title: `حذف ${target.type === 'reel' ? 'مقطع الفيديو' : 'ألبوم الصور'}`,
      message: `هل أنت متأكد من رغبتك في حذف "${target.title}"؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmText: 'نعم، احذف المحتوى',
      cancelText: 'إلغاء',
      danger: true,
      onConfirm: async () => {
        if (target.type === 'reel') {
          await craftReelsService.deleteReelAsync(currentUser || { role: 'creator' }, target.id);
          setReels((prev) => prev.filter((r) => r.id !== target.id));
          addToast('تم حذف الريل', `تم حذف "${target.title}" بنجاح`, 'info');
        } else {
          await creatorApi.deleteCreatorPhoto(currentUser, target.id);
          setPhotos((prev) => prev.filter((p) => p.id !== target.id));
          addToast('تم حذف الألبوم', `تم حذف "${target.title}" بنجاح`, 'info');
        }
      }
    });
  };

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileNotice(null);

    try {
      const updated = await creatorApi.updateCreatorProfile(currentUser, {
        name: profileName.trim(),
        bio: profileBio.trim(),
        governorate: profileGovernorate,
        city: profileCity.trim(),
        avatar: profileAvatar.trim(),
        specialties: profileSpecialties,
        socialLinks: {
          instagram: profileInstagram.trim() || undefined,
          youtube: profileYoutube.trim() || undefined,
          tiktok: profileTiktok.trim() || undefined,
          facebook: profileFacebook.trim() || undefined
        }
      });
      setCreator(updated);
      setProfileNotice({ type: 'success', message: 'تم تحديث بيانات ملفك الشخصي بنجاح!' });
      if (setCurrentUser) {
        setCurrentUser((prev) => ({
          ...prev,
          name: updated.name,
          avatar: updated.avatar || prev.avatar
        }));
      }
    } catch (err: any) {
      setProfileNotice({ type: 'error', message: err.message || 'فشل تحديث البيانات' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Upload Avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const base64 = evt.target?.result as string;
        const folder = creatorStatus === 'approved' ? 'creators' : 'users';
        const res = await creatorApi.uploadCreatorImage(currentUser, base64, file.name, folder);
        setProfileAvatar(res.url);
        addToast('تم رفع الصورة', 'لا تنس الضغط على حفظ التعديلات لاعتمادها', 'success');
      } catch (err: any) {
        setProfileNotice({ type: 'error', message: err.message || 'فشل في رفع الصورة' });
      }
    };
    reader.readAsDataURL(file);
  };

  // Status Badge Component
  const renderStatusBadge = (status?: ContentStatus | string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3" />
            منشور
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold">
            <Clock className="w-3 h-3" />
            قيد المراجعة
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-bold">
            <XCircle className="w-3 h-3" />
            مرفوض
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-500/10 text-stone-600 dark:text-stone-400 border border-stone-500/20 text-[11px] font-bold">
            مسودة
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand-50 dark:bg-[#120904] flex items-center justify-center p-4 font-cairo" dir="rtl">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-3 border-[#E66A2E]/20 border-t-[#E66A2E] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-stone-500 dark:text-stone-400">جاري تحميل لوحة تحكم صانع المحتوى...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-[#120904] text-espresso dark:text-cream pb-20 font-cairo transition-colors" dir="rtl">
      {/* Top Banner & Header */}
      <div className="bg-white dark:bg-[#1A0E08] border-b border-sand-200 dark:border-[#2C1A10] sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E66A2E] to-[#FF9E44] text-white flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-espresso dark:text-cream">
                  لوحة تحكم صانع المحتوى
                </h1>
                {creator?.verified && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                    موثق ★
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                مرحباً بك يا {creator?.name || currentUser?.name} | وثّق تراث ومعالم الصعيد
              </p>
            </div>
          </div>

          {/* Quick Publish Shortcuts */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {creatorStatus === 'approved' && (
              <>
                <button
                  type="button"
                  onClick={() => setIsUploadReelOpen(true)}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>نشر ريل جديد</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsUploadPhotoOpen(true)}
                  className="px-4 py-2 bg-stone-900 dark:bg-[#2C1A10] hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all cursor-pointer border border-stone-700 dark:border-[#382317]"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>نشر ألبوم صور</span>
                </button>
              </>
            )}

            {creator?.id && (
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToPublic) {
                    onNavigateToPublic(creator.id);
                  } else {
                    navigateToCreator(creator.id);
                  }
                }}
                className="p-2 rounded-xl border border-sand-300 dark:border-[#382317] hover:bg-stone-100 dark:hover:bg-[#25150C] text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                title="معاينة الملف الشخصي العام"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar pt-2">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
            { id: 'reels', label: `فيديوهاتي (${reels.length})`, icon: Film },
            { id: 'photos', label: `معارض صوري (${photos.length})`, icon: ImageIcon },
            { id: 'content', label: 'إدارة كل المحتوى', icon: FolderOpen },
            { id: 'profile', label: 'الملف الشخصي', icon: UserIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${isActive
                  ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Account Status Alert Banners */}
        {creatorStatus === 'pending' && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                طلب انضمامك كصانع محتوى قيد المراجعة والتدقيق
              </h4>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                يجري حالياً مراجعة حسابك وتدقيقه من قبل فريق إدارة منصة وه. يمكنك تجهيز وتعديل ملفك الشخصي، وستتمكن من نشر المحتوى العام فور صدور الموافقة الإدارية.
              </p>
            </div>
          </div>
        )}

        {creatorStatus === 'rejected' && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200">
                  تم رفض طلب صانع المحتوى
                </h4>
                {creator?.rejectionReason && (
                  <p className="text-xs text-rose-800/90 dark:text-rose-300/80 leading-relaxed font-semibold">
                    سبب الرفض: {creator.rejectionReason}
                  </p>
                )}
                <p className="text-xs text-rose-700 dark:text-rose-400">
                  يمكنك تحديث بياناتك والتخصصات وروابط أعمالك وإعادة تقديم الطلب للمراجعة من جديد.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCreatorApplyModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تعديل وإعادة التقديم</span>
            </button>
          </div>
        )}

        {creatorStatus === 'suspended' && (
          <div className="p-4 rounded-2xl bg-stone-900 text-white border border-rose-500/40 flex items-start gap-3">
            <Lock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-rose-300">
                تم تجميد حساب صانع المحتوى مؤقتاً
              </h4>
              {creator?.suspensionReason && (
                <p className="text-xs text-stone-300 leading-relaxed">
                  السبب: {creator.suspensionReason}
                </p>
              )}
              <p className="text-[11px] text-stone-400">
                يرجى التواصل مع إدارة منصة وه عبر الدعم الفني للاستفسار أو إعادة تفعيل الحساب.
              </p>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 6 Key Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
                  <Film className="w-4 h-4" />
                </div>
                <div className="text-lg sm:text-xl font-black text-espresso dark:text-cream">
                  {publishedReels.length}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                  ريلز منشورة
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="text-lg sm:text-xl font-black text-espresso dark:text-cream">
                  {publishedPhotos.length}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                  معارض منشورة
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                  <Eye className="w-4 h-4" />
                </div>
                <div className="text-lg sm:text-xl font-black text-espresso dark:text-cream">
                  {totalViews.toLocaleString('ar-EG')}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                  إجمالي المشاهدات
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center mb-2">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="text-lg sm:text-xl font-black text-espresso dark:text-cream">
                  {totalLikes.toLocaleString('ar-EG')}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                  إجمالي التفاعلات
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-lg sm:text-xl font-black text-espresso dark:text-cream">
                  {pendingReels.length + pendingPhotos.length}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                  محتوى قيد المراجعة
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-2">
                  <XCircle className="w-4 h-4" />
                </div>
                <div className="text-lg sm:text-xl font-black text-espresso dark:text-cream">
                  {rejectedReels.length + rejectedPhotos.length}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                  محتوى مرفوض
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Creator Card */}
              <div className="lg:col-span-1 rounded-3xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={creator?.avatar || currentUser?.avatar || 'https://res.cloudinary.com/kuana1nl/image/upload/v1788710904/user.jpg'}
                    alt={creator?.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#E66A2E] shadow"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-espresso dark:text-cream">
                      {creator?.name || currentUser?.name}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {creator?.governorate} • {creator?.city || 'الصعيد'}
                    </p>
                    <div className="pt-1">
                      {renderStatusBadge(creator?.status || 'pending')}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                  {creator?.bio || 'صانع محتوى شغوف بتوثيق عراقة الصعيد وتاريخه وحرفه.'}
                </p>

                <div className="pt-2 border-t border-sand-200 dark:border-[#2C1A10] space-y-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-[#25150C] hover:bg-stone-200 text-stone-700 dark:text-stone-200 text-xs font-bold transition-colors text-center cursor-pointer"
                  >
                    تعديل الملف الشخصي
                  </button>
                  {creator?.id && (
                    <button
                      type="button"
                      onClick={() => onNavigateToPublic ? onNavigateToPublic(creator.id) : navigateToCreator(creator.id)}
                      className="w-full py-2.5 px-3 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>معاينة صفحتك العامة</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Latest Submissions */}
              <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-espresso dark:text-cream flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-primary" />
                    <span>آخر المنشورات والمشاركات</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('content')}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    عرض الكل
                  </button>
                </div>

                {reels.length === 0 && photos.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Sparkles className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
                    <p className="text-xs text-stone-500">لم تقم بنشر أي محتوى بعد، ابدأ بمشاركة أول حكاية!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Combine top recent items */}
                    {[
                      ...reels.map((r) => ({ ...r, _type: 'reel' as const })),
                      ...photos.map((p) => ({ ...p, _type: 'photo' as const }))
                    ]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 4)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-2xl bg-stone-50 dark:bg-[#160B05] border border-stone-200 dark:border-[#2C1A10] flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-black shrink-0 relative">
                              <img
                                src={item._type === 'reel' ? (item as any).posterUrl : (item as any).images?.[0]}
                                alt={item.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 p-0.5 rounded bg-black/60 text-white">
                                {item._type === 'reel' ? (
                                  <Film className="w-2.5 h-2.5" />
                                ) : (
                                  <ImageIcon className="w-2.5 h-2.5" />
                                )}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-espresso dark:text-cream truncate">
                                {item.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                                <span>{item.governorate}</span>
                                <span>•</span>
                                <span>{(item.viewsCount || 0).toLocaleString('ar-EG')} مشاهدة</span>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {renderStatusBadge(item.status)}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY REELS */}
        {activeTab === 'reels' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-espresso dark:text-cream">
                  مقاطع الفيديو والريلز ({reels.length})
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  إدارة مقاطع الفيديو المصورة لحكايات ومعالم وحرف الصعيد
                </p>
              </div>

              {creatorStatus === 'approved' && (
                <button
                  type="button"
                  onClick={() => setIsUploadReelOpen(true)}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>رفع ريل جديد</span>
                </button>
              )}
            </div>

            {reels.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-white dark:bg-[#1C0E07] rounded-3xl border border-sand-200 dark:border-[#382317] p-8">
                <Film className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto" />
                <h3 className="text-sm font-bold text-espresso dark:text-cream">لم تقم برفع أي مقطع فيديو بعد</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  شارك فيديوهات عمودية توثق معالم، أسواق، أو حرف الصعيد الأصيلة
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {reels.map((reel) => (
                  <div
                    key={reel.id}
                    className="rounded-2xl overflow-hidden bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] shadow-sm flex flex-col justify-between"
                  >
                    {/* Poster + Badges */}
                    <div className="relative aspect-[9/16] bg-black overflow-hidden group">
                      <img
                        src={reel.posterUrl || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'}
                        alt={reel.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        {renderStatusBadge(reel.status)}
                      </div>
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                        {reel.duration || '0:30'}
                      </div>

                      {/* Play Preview Overlay */}
                      <button
                        type="button"
                        onClick={() => setPreviewVideoReel(reel)}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </button>
                    </div>

                    {/* Content Details */}
                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-espresso dark:text-cream line-clamp-2">
                          {reel.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-stone-500">
                          <span>{reel.governorate}</span>
                          <span>•</span>
                          <span>{(reel.viewsCount || 0).toLocaleString('ar-EG')} مشاهدة</span>
                          <span>•</span>
                          <span>{(reel.likesCount || 0).toLocaleString('ar-EG')} إعجاب</span>
                        </div>

                        {/* Rejection notice */}
                        {reel.status === 'rejected' && reel.rejectionReason && (
                          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[10px] text-rose-700 dark:text-rose-300">
                            سبب الرفض: {reel.rejectionReason}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-stone-100 dark:border-[#2C1A10] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingReel(reel)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-stone-100 dark:bg-[#25150C] hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                          <span>{reel.status === 'rejected' ? 'تعديل وإعادة تقديم' : 'تعديل'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDelete({ type: 'reel', id: reel.id, title: reel.title })}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          title="حذف الفيديو"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY PHOTOS */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-espresso dark:text-cream">
                  معارض الصور التراثية ({photos.length})
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  إدارة ألبومات الصور التوثيقية لمعالم وحرف ومجتمعات الصعيد
                </p>
              </div>

              {creatorStatus === 'approved' && (
                <button
                  type="button"
                  onClick={() => setIsUploadPhotoOpen(true)}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>نشر ألبوم صور جديد</span>
                </button>
              )}
            </div>

            {photos.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-white dark:bg-[#1C0E07] rounded-3xl border border-sand-200 dark:border-[#382317] p-8">
                <ImageIcon className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto" />
                <h3 className="text-sm font-bold text-espresso dark:text-cream">لم تقم بنشر أي معارض صور بعد</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  انشر صوراً حية للمعالم والموالد والبيئات الصعيدية الأصيلة
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl overflow-hidden bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] shadow-sm flex flex-col justify-between"
                  >
                    {/* Cover Image */}
                    <div className="relative aspect-[4/3] bg-stone-100 dark:bg-[#160B05] overflow-hidden">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        {renderStatusBadge(item.status)}
                      </div>
                      {item.images.length > 1 && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 text-white text-[10px] font-bold backdrop-blur-sm flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          <span>{item.images.length} صور</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-espresso dark:text-cream line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                          {item.caption}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-stone-500 pt-0.5">
                          <span>{item.governorate}</span>
                          <span>•</span>
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{(item.viewsCount || 0).toLocaleString('ar-EG')} مشاهدة</span>
                        </div>

                        {/* Rejection notice */}
                        {item.status === 'rejected' && item.rejectionReason && (
                          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[10px] text-rose-700 dark:text-rose-300">
                            سبب الرفض: {item.rejectionReason}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-stone-100 dark:border-[#2C1A10] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingPhoto(item)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-stone-100 dark:bg-[#25150C] hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                          <span>{item.status === 'rejected' ? 'تعديل وإعادة تقديم' : 'تعديل'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDelete({ type: 'photo', id: item.id, title: item.title })}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          title="حذف الألبوم"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CONTENT MANAGEMENT (UNIFIED TABLE) */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-espresso dark:text-cream">
                  إدارة المحتوى المرفوع ({reels.length + photos.length})
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  متابعة حالة مراجعة الفيديوهات والصور وإعادة تقديم المحتوى المرفوض
                </p>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-[#1C0E07] p-1 rounded-xl border border-sand-200 dark:border-[#382317]">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'pending', label: 'قيد المراجعة' },
                  { id: 'approved', label: 'منشور' },
                  { id: 'rejected', label: 'مرفوض' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setContentFilter(f.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${contentFilter === f.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Unified Table */}
            <div className="rounded-3xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-stone-50 dark:bg-[#160B05] border-b border-sand-200 dark:border-[#2C1A10] text-stone-500 font-bold">
                    <tr>
                      <th className="py-3 px-4">المحتوى</th>
                      <th className="py-3 px-4">النوع</th>
                      <th className="py-3 px-4">المحافظة</th>
                      <th className="py-3 px-4">الحالة</th>
                      <th className="py-3 px-4">ملاحظات المراجعة</th>
                      <th className="py-3 px-4 text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-[#25150C]">
                    {[
                      ...reels.map((r) => ({ ...r, _type: 'reel' as const })),
                      ...photos.map((p) => ({ ...p, _type: 'photo' as const }))
                    ]
                      .filter((item) => {
                        if (contentFilter === 'all') return true;
                        return item.status === contentFilter;
                      })
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-[#201007]">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item._type === 'reel' ? (item as any).posterUrl : (item as any).images?.[0]}
                                alt={item.title}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-lg object-cover bg-black shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-espresso dark:text-cream truncate max-w-xs">
                                  {item.title}
                                </div>
                                <div className="text-[10px] text-stone-400 mt-0.5">
                                  {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {item._type === 'reel' ? (
                              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">
                                ريل فيديو
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 text-[10px] font-bold">
                                معرض صور
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                            {item.governorate}
                          </td>
                          <td className="py-3 px-4">
                            {renderStatusBadge(item.status)}
                          </td>
                          <td className="py-3 px-4">
                            {item.status === 'rejected' && item.rejectionReason ? (
                              <span className="text-rose-600 dark:text-rose-400 text-[11px] font-medium block max-w-xs leading-relaxed">
                                {item.rejectionReason}
                              </span>
                            ) : item.status === 'pending' ? (
                              <span className="text-amber-600 text-[11px]">في انتظار اعتماد المحرر الإداري</span>
                            ) : (
                              <span className="text-emerald-600 text-[11px]">معتمد وظاهر في المعرض العام</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-left">
                            <div className="flex items-center justify-end gap-1.5">
                              {item._type === 'reel' ? (
                                <button
                                  type="button"
                                  onClick={() => setEditingReel(item as any)}
                                  className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#25150C] hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-[11px] font-bold"
                                >
                                  {item.status === 'rejected' ? 'تعديل وإعادة تقديم' : 'تعديل'}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setEditingPhoto(item as any)}
                                  className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#25150C] hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-[11px] font-bold"
                                >
                                  {item.status === 'rejected' ? 'تعديل وإعادة تقديم' : 'تعديل'}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  requestDelete({
                                    type: item._type,
                                    id: item.id,
                                    title: item.title
                                  })
                                }
                                className="p-1 rounded-lg text-stone-400 hover:text-red-600"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MY PROFILE */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="max-w-3xl space-y-6">
            {profileNotice && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${profileNotice.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                  }`}
              >
                {profileNotice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{profileNotice.message}</span>
              </div>
            )}

            {/* Profile Avatar Card */}
            <div className="rounded-3xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group">
                <img
                  src={profileAvatar || currentUser?.avatar || 'https://res.cloudinary.com/kuana1nl/image/upload/v1788710904/user.jpg'}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-white dark:border-[#382317] shadow-md"
                />
                <label className="absolute inset-0 rounded-2xl bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-5 h-5" />
                  <span className="text-[10px] mt-1 font-bold">تغيير</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="space-y-1 text-center sm:text-right">
                <h3 className="text-sm font-bold text-espresso dark:text-cream">الصورة الشخصية لصانع المحتوى</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  اضغط على الصورة لاختيار صورة جديدة ورفعها إلى السحابة مباشرة.
                </p>
              </div>
            </div>

            {/* Basic Info Form */}
            <div className="rounded-3xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-espresso dark:text-cream mb-1">
                  الاسم بالكامل أو الاسم الفني <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] bg-stone-50 dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso dark:text-cream mb-1">
                  النبذة التعريفية <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl border border-stone-200 dark:border-[#382317] bg-stone-50 dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E] resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-espresso dark:text-cream mb-1">
                    المحافظة <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={profileGovernorate}
                    onChange={(e) => setProfileGovernorate(e.target.value as Governorate)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] bg-stone-50 dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E] appearance-none"
                  >
                    {GOVERNORATES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-espresso dark:text-cream mb-1">
                    المدينة أو المنطقة
                  </label>
                  <input
                    type="text"
                    value={profileCity}
                    onChange={(e) => setProfileCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] bg-stone-50 dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E]"
                  />
                </div>
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-xs font-bold text-espresso dark:text-cream mb-2">
                  التخصصات والاهتمامات
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profileSpecialties.map((spec, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-stone-100 dark:bg-[#25150C] text-xs font-medium flex items-center gap-1.5"
                    >
                      <span>{spec}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setProfileSpecialties((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        className="text-stone-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    placeholder="إضافة تخصص جديد..."
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 dark:border-[#382317] bg-stone-50 dark:bg-[#160B05] text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newSpecialty.trim()) {
                          setProfileSpecialties((prev) => [...prev, newSpecialty.trim()]);
                          setNewSpecialty('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSpecialty.trim()) {
                        setProfileSpecialties((prev) => [...prev, newSpecialty.trim()]);
                        setNewSpecialty('');
                      }
                    }}
                    className="px-4 py-2 bg-stone-200 dark:bg-[#25150C] text-xs font-bold rounded-xl"
                  >
                    إضافة
                  </button>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="rounded-3xl bg-white dark:bg-[#1C0E07] border border-sand-200 dark:border-[#382317] p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-espresso dark:text-cream">
                روابط حسابات التواصل الاجتماعي
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Instagram className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                  <input
                    type="text"
                    value={profileInstagram}
                    onChange={(e) => setProfileInstagram(e.target.value)}
                    placeholder="Instagram link / username"
                    className="w-full pr-9 pl-3 py-2 rounded-xl border border-stone-200 dark:border-[#382317] bg-stone-50 dark:bg-[#160B05] text-xs"
                    dir="ltr"
                  />
                </div>

                <div className="relative">
                  <Youtube className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  <input
                    type="text"
                    value={profileYoutube}
                    onChange={(e) => setProfileYoutube(e.target.value)}
                    placeholder="YouTube channel link"
                    className="w-full pr-9 pl-3 py-2 rounded-xl border border-stone-200 dark:border-[#382317] bg-stone-50 dark:bg-[#160B05] text-xs"
                    dir="ltr"
                  />
                </div>

                <div className="relative">
                  <Film className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600 dark:text-stone-300" />
                  <input
                    type="text"
                    value={profileTiktok}
                    onChange={(e) => setProfileTiktok(e.target.value)}
                    placeholder="TikTok username"
                    className="w-full pr-9 pl-3 py-2 rounded-xl border border-stone-200 dark:border-[#382317] bg-stone-50 dark:bg-[#160B05] text-xs"
                    dir="ltr"
                  />
                </div>

                <div className="relative">
                  <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                  <input
                    type="text"
                    value={profileFacebook}
                    onChange={(e) => setProfileFacebook(e.target.value)}
                    placeholder="Facebook page link"
                    className="w-full pr-9 pl-3 py-2 rounded-xl border border-stone-200 dark:border-[#382317] bg-stone-50 dark:bg-[#160B05] text-xs"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSavingProfile ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>حفظ التعديلات</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Reel Upload Modal */}
      {isUploadReelOpen && (
        <ReelUploadModal
          isOpen={isUploadReelOpen}
          onClose={() => setIsUploadReelOpen(false)}
          onSuccess={(newReel) => {
            setReels((prev) => [newReel, ...prev]);
            loadCreatorData();
          }}
          currentUser={currentUser as any}
          artisanName={creator?.name || currentUser?.name}
          artisanAvatar={creator?.avatar || currentUser?.avatar}
          defaultGovernorate={(creator?.governorate || currentUser?.governorate || 'قنا') as Governorate}
        />
      )}

      {/* Reel Edit Modal */}
      {editingReel && (
        <ReelEditModal
          isOpen={Boolean(editingReel)}
          onClose={() => setEditingReel(null)}
          reel={editingReel}
          onSuccess={(updatedReel) => {
            setReels((prev) => prev.map((r) => (r.id === updatedReel.id ? updatedReel : r)));
            setEditingReel(null);
            loadCreatorData();
          }}
          currentUser={currentUser as any}
        />
      )}

      {/* Photo Upload Modal */}
      {isUploadPhotoOpen && (
        <PhotoUploadModal
          isOpen={isUploadPhotoOpen}
          onClose={() => setIsUploadPhotoOpen(false)}
          onSuccess={(newPhoto) => {
            setPhotos((prev) => [newPhoto, ...prev]);
            loadCreatorData();
          }}
        />
      )}

      {/* Photo Edit Modal */}
      {editingPhoto && (
        <PhotoEditModal
          isOpen={Boolean(editingPhoto)}
          onClose={() => setEditingPhoto(null)}
          photo={editingPhoto}
          onSuccess={(updatedPhoto) => {
            setPhotos((prev) => prev.map((p) => (p.id === updatedPhoto.id ? updatedPhoto : p)));
            setEditingPhoto(null);
            loadCreatorData();
          }}
        />
      )}

      {/* Preview Reel Video Modal */}
      <AnimatePresence>
        {previewVideoReel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20 aspect-[9/16]"
            >
              <button
                type="button"
                onClick={() => setPreviewVideoReel(null)}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <video
                src={previewVideoReel.videoUrl}
                poster={previewVideoReel.posterUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
