import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Package,
  Heart,
  ShieldCheck,
  ChevronRight,
  Save,
  Store,
  Upload,
  Camera,
  Trash2,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  X,
  Sparkles,
  KeyRound,
  LogOut,
  Bell,
  ClipboardList
} from 'lucide-react';
import { Governorate, OrderAddress } from '../../types';
import { DeleteAccountModal } from '../common/DeleteAccountModal';
import { NotificationsManager } from '../common/NotificationsManager';

type AccountTab = 'personal' | 'security' | 'addresses' | 'orders' | 'notifications';
type ProfileAddress = OrderAddress & { isDefault?: boolean };

export const BuyerAccountPage: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    currentRole,
    logout,
    changePersonalPassword,
    orders,
    favorites,
    unreadNotificationsCount,
    setActivePage,
    navigateToOrder,
    addToast,
    uploadProfileImage,
    removeProfileImage,
    applyToBecomeSeller,
    setIsAuthModalOpen,
    setAuthModalTab,
    confirmModal,
    openReportModal
  } = useApp();

  const isAdmin = currentRole === 'admin' || currentUser?.role === 'admin';
  const isSeller = currentRole === 'seller' || currentUser?.role === 'seller';
  const isBuyer = !isAdmin && !isSeller;

  const profileTabs: { id: AccountTab; label: string; icon: typeof User; badge?: number }[] = [
    { id: 'personal', label: 'البيانات الشخصية', icon: User },
    { id: 'security', label: 'الأمان', icon: KeyRound },
    ...(isBuyer ? [{ id: 'addresses' as const, label: 'العناوين', icon: MapPin }] : []),
    ...(isBuyer ? [{ id: 'orders' as const, label: 'الطلبات', icon: ClipboardList, badge: orders.length }] : []),
    { id: 'notifications', label: 'الإشعارات', icon: Bell, badge: unreadNotificationsCount }
  ];

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [governorate, setGovernorate] = useState<Governorate>(
    (currentUser?.governorate as Governorate) || 'قنا'
  );
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AccountTab>('personal');
  const [addresses, setAddresses] = useState<ProfileAddress[]>(currentUser?.savedAddresses || []);
  const [isSavingAddresses, setIsSavingAddresses] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isRevokingSessions, setIsRevokingSessions] = useState(false);

  // Seller Application In-Place State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmittingApply, setIsSubmittingApply] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [workshopName, setWorkshopName] = useState(currentUser?.seller?.brandName || '');
  const [specialty, setSpecialty] = useState(currentUser?.seller?.specialty || 'مشغولات وفخار صعيدي');
  const [applyGovernorate, setApplyGovernorate] = useState<Governorate>(
    (currentUser?.governorate as Governorate) || 'قنا'
  );
  const [applyPhone, setApplyPhone] = useState(currentUser?.phone || '');
  const [applyEmail, setApplyEmail] = useState(currentUser?.email || '');
  const [bio, setBio] = useState(currentUser?.seller?.bio || '');
  const [story, setStory] = useState(currentUser?.seller?.story || '');
  const [payoutMethod, setPayoutMethod] = useState<'vodafone_cash' | 'instapay'>('vodafone_cash');
  const [payoutAccount, setPayoutAccount] = useState(currentUser?.phone || '');

  useEffect(() => {
    if (currentUser?.id) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      if (currentUser.governorate) {
        setGovernorate(currentUser.governorate as Governorate);
        setApplyGovernorate(currentUser.governorate as Governorate);
      }
      if (currentUser.seller) {
        if (currentUser.seller.brandName) setWorkshopName(currentUser.seller.brandName);
        if (currentUser.seller.specialty) setSpecialty(currentUser.seller.specialty);
        if (currentUser.seller.bio) setBio(currentUser.seller.bio);
        if (currentUser.seller.story) setStory(currentUser.seller.story);
      }
      if (currentUser.phone) {
        setApplyPhone(currentUser.phone);
        setPayoutAccount(currentUser.phone);
      }
      setAddresses(currentUser.savedAddresses || []);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!isBuyer && (activeTab === 'addresses' || activeTab === 'orders')) {
      setActiveTab('personal');
    }
  }, [activeTab, isBuyer]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem('open_seller_apply') === 'true') {
        sessionStorage.removeItem('open_seller_apply');
        if (currentUser?.sellerStatus !== 'approved' && currentRole !== 'seller' && !isAdmin) {
          setIsApplyModalOpen(true);
        }
      }
    } catch {
      // ignore
    }
  }, [currentUser?.sellerStatus, currentRole, isAdmin]);

  const handleRefreshStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const me = await api.getMe();
      if (me && me.id) {
        setCurrentUser(me);
        if (me.role === 'seller' && me.sellerStatus === 'approved') {
          addToast('مبروك ورشتك اتقبلت!', 'ورشتك اتوثقت وبقت جاهزة على المنصة.', 'success');
        } else if (me.sellerStatus === 'pending') {
          addToast('حالة الطلب', 'طلب ورشتك لسه بيتراجع من الإدارة.', 'info');
        } else if (me.sellerStatus === 'rejected') {
          addToast('حالة الطلب', 'للأسف طلب الانضمام اترفض، تقدر تشوف السبب وتعدل بياناتك وتبعته تاني.', 'warning');
        } else {
          addToast('حالة الحساب', 'حسابك مسجل كمشتري في منصة وه.', 'info');
        }
      }
    } catch (err: any) {
      addToast('خطأ', err?.message || 'فشل في تحديث حالة الحساب', 'error');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshopName.trim()) {
      addToast('خطأ', 'اسم الورشة أو المتجر التراثي مطلوب', 'error');
      return;
    }
    if (!applyPhone.trim()) {
      addToast('خطأ', 'رقم هاتف التواصل للورشة مطلوب', 'error');
      return;
    }

    setIsSubmittingApply(true);
    try {
      await applyToBecomeSeller({
        workshopName: workshopName.trim(),
        specialty: specialty.trim(),
        governorate: applyGovernorate,
        phone: applyPhone.trim(),
        email: applyEmail.trim() || undefined,
        bio: bio.trim() || undefined,
        story: story.trim() || undefined,
        payoutMethod,
        payoutAccount: payoutAccount.trim() || applyPhone.trim()
      });
      setIsApplyModalOpen(false);
    } catch (err: any) {
      // Toast handled by context
    } finally {
      setIsSubmittingApply(false);
    }
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeBytes = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setImageError('نوع الصورة مش مدعوم، اختار صورة JPG أو PNG أو WebP');
      return;
    }

    if (file.size > maxSizeBytes) {
      setImageError('حجم الصورة كبير أوي، الحد الأقصى 5 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUri = event.target?.result as string;
      setPreviewImage(dataUri);
      setIsUploadingImage(true);

      try {
        await uploadProfileImage(dataUri, file.name);
        setPreviewImage(null);
      } catch (err: any) {
        console.error('[BuyerAccountPage] Upload error:', err);
        setImageError(err?.message || 'فشل في رفع صورة الملف الشخصي إلى Cloudinary');
      } finally {
        setIsUploadingImage(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfileImage = () => {
    confirmModal({
      title: 'حذف صورة الملف الشخصي',
      message: 'هل أنت متأكد من رغبتك في حذف صورة الملف الشخصي؟',
      confirmText: 'نعم، حذف الصورة',
      danger: true,
      onConfirm: async () => {
        setImageError(null);
        setIsRemovingImage(true);
        try {
          await removeProfileImage();
          setPreviewImage(null);
        } catch (err: any) {
          console.error('[BuyerAccountPage] Remove error:', err);
          setImageError(err?.message || 'فشل في حذف صورة الملف الشخصي');
        } finally {
          setIsRemovingImage(false);
        }
      }
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentUser?.id) {
        await api.updateProfile({ id: currentUser.id, role: currentUser.role }, {
          name,
          phone,
          governorate
        });
        setCurrentUser(prev => ({
          ...prev,
          name,
          phone,
          governorate
        }));
      }
      addToast('تم حفظ البيانات', 'تم تحديث بيانات حسابك وعنوانك بنجاح', 'success');
    } catch (err: any) {
      addToast('خطأ', err?.message || 'فشل حفظ بيانات الملف الشخصي', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      addToast('كلمة المرور قصيرة', 'كلمة المرور الجديدة يجب ألا تقل عن 6 خانات.', 'warning');
      return;
    }
    if (newPassword === currentPassword) {
      addToast('كلمة المرور لم تتغير', 'اختر كلمة مرور جديدة مختلفة عن الحالية.', 'warning');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      addToast('تأكيد كلمة المرور', 'كلمتا المرور الجديدتان غير متطابقتين.', 'warning');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePersonalPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      await logout('تم تغيير كلمة المرور وتسجيل الخروج من كل الأجهزة. سجّل الدخول مجددًا بكلمة المرور الجديدة.');
    } catch (error: any) {
      addToast('تعذر تغيير كلمة المرور', error?.message || 'حاول مرة أخرى.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogoutAllSessions = () => {
    confirmModal({
      title: 'تسجيل الخروج من كل الأجهزة',
      message: 'سيتم إنهاء جلستك الحالية وكل الجلسات المفتوحة على أجهزتك، وستحتاج إلى تسجيل الدخول مرة أخرى.',
      confirmText: 'تسجيل الخروج من الكل',
      danger: true,
      onConfirm: async () => {
        setIsRevokingSessions(true);
        try {
          await api.revokeAllSessions({ id: currentUser.id, role: currentRole });
          await logout('تم تسجيل الخروج من كل الأجهزة. يمكنك تسجيل الدخول مرة أخرى في أي وقت.');
        } catch (error: any) {
          addToast('تعذر تسجيل الخروج من كل الأجهزة', error?.message || 'حاول مرة أخرى.', 'error');
        } finally {
          setIsRevokingSessions(false);
        }
      }
    });
  };

  const handleSaveAddresses = async (event: React.FormEvent) => {
    event.preventDefault();
    if (addresses.some((address) =>
      !address.fullName.trim() ||
      !address.phone.trim() ||
      !address.city.trim() ||
      !address.streetAddress.trim()
    )) {
      addToast('بيانات العنوان ناقصة', 'أكمل الاسم والهاتف والمدينة والعنوان التفصيلي لكل عنوان.', 'warning');
      return;
    }

    setIsSavingAddresses(true);
    try {
      const defaultIndex = addresses.findIndex((address) => address.isDefault);
      const savedAddresses = addresses.map((address, index) => ({
        ...address,
        isDefault: index === (defaultIndex >= 0 ? defaultIndex : 0)
      }));
      await api.updateProfile(
        { id: currentUser.id, role: currentUser.role },
        { savedAddresses }
      );
      setAddresses(savedAddresses);
      setCurrentUser((previous) => ({ ...previous, savedAddresses }));
      addToast('تم حفظ العناوين', 'تم تحديث عناوين التوصيل بنجاح.', 'success');
    } catch (error: any) {
      addToast('تعذر حفظ العناوين', error?.message || 'حاول مرة أخرى.', 'error');
    } finally {
      setIsSavingAddresses(false);
    }
  };

  const updateAddress = (index: number, updates: Partial<OrderAddress>) => {
    setAddresses((previous) => previous.map((address, addressIndex) =>
      addressIndex === index ? { ...address, ...updates } : address
    ));
  };

  const DEFAULT_USER_AVATAR = 'https://res.cloudinary.com/kuana1nl/image/upload/v1788710904/user.jpg';
  const hasCustomImage = Boolean(
    currentUser?.profileImage?.secureUrl ||
    (currentUser?.avatar &&
      currentUser.avatar !== DEFAULT_USER_AVATAR &&
      !currentUser.avatar.includes('default-user-avatar') &&
      !currentUser.avatar.includes('v1787924812/user.jpg') &&
      !currentUser.avatar.includes('photo-1535713875002') &&
      !currentUser.avatar.includes('photo-1472099645785'))
  );

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        overflow-x-hidden
        bg-cream
        text-espresso
        transition-colors duration-500
        dark:bg-espresso-900
        dark:text-cream
        max-w-[1600px]
        mx-auto
        px-5
        sm:px-8
        lg:px-12
        py-8
        space-y-8
      "
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-black/50 dark:text-white/50">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-primary transition-colors cursor-pointer"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="font-bold">الملف الشخصي وإعدادات الحساب</span>
      </nav>

      {/* Account Overview Header */}
      <div className="bg-white/75 dark:bg-espresso-900/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-lg backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-5">
            {/* User Avatar with Cloudinary Integration */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#6B3A1F] text-[#FFF9EE] flex items-center justify-center font-black text-3xl font-main shadow-md border-2 border-black/10 dark:border-white/10">
                {isUploadingImage || isRemovingImage ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black/60 text-white">
                    <Loader2 className="w-6 h-6 animate-spin mb-1" />
                    <span className="text-[10px]">جاري المعالجة...</span>
                  </div>
                ) : previewImage ? (
                  <img src={previewImage} alt="معاينة" className="w-full h-full object-cover" />
                ) : currentUser?.avatar ? (
                  <img
                    src={currentUser.profileImage?.secureUrl || currentUser.avatar}
                    alt={currentUser?.name || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser?.name?.charAt(0) || '👤'
                )}
              </div>

              {/* Quick Camera Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage || isRemovingImage}
                title="تغيير الصورة"
                className="absolute -bottom-1 -left-1 p-2 bg-espresso hover:bg-primary text-white dark:bg-[#6B3A1F] dark:text-[#FFF9EE] dark:hover:bg-primary-hover rounded-xl shadow-md transition-transform hover:scale-105 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black">{currentUser?.name || 'حسابي'}</h1>
                <span className="bg-primary/10 border border-primary/30 text-primary text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {currentUser?.role === 'admin'
                    ? 'مدير المنصة'
                    : currentUser?.role === 'seller'
                      ? 'ورشة معتمدة'
                      : 'متسوق موثق'}
                </span>
              </div>
              <p className="text-xs text-black/60 dark:text-white/60 mt-1">{currentUser?.email || ''}</p>

              {/* Profile Image Management Controls */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleProfileImageSelect}
                  className="hidden"
                  id="profile-image-file-input"
                />

                <button
                  type="button"
                  id="change-profile-image-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage || isRemovingImage}
                  className="px-3 py-1.5 bg-black/5 dark:bg-cream/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  <span>{isUploadingImage ? 'جاري الرفع...' : 'تغيير الصورة'}</span>
                </button>

                {hasCustomImage && (
                  <button
                    type="button"
                    id="remove-profile-image-btn"
                    onClick={handleRemoveProfileImage}
                    disabled={isUploadingImage || isRemovingImage}
                    className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isRemovingImage ? 'جاري الحذف...' : 'حذف الصورة'}</span>
                  </button>
                )}
              </div>

              {/* Error Message */}
              {imageError && (
                <div className="mt-2 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg p-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{imageError}</span>
                </div>
              )}
            </div>
          </div>

          {isBuyer && (
            <div className="grid grid-cols-2 gap-3 sm:flex items-center">
              <button
                type="button"
                onClick={() => setActiveTab('addresses')}
                className="p-3 rounded-2xl bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 hover:border-primary transition-all text-center cursor-pointer backdrop-blur-xl"
              >
                <div className="flex items-center justify-center gap-1 text-primary font-bold text-base">
                  <MapPin className="w-4 h-4" />
                  <span>{addresses.length}</span>
                </div>
                <span className="text-[10px] text-black/50 dark:text-white/50">عناوين التوصيل</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePage('favorites')}
                className="p-3 rounded-2xl bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 hover:border-primary transition-all text-center cursor-pointer backdrop-blur-xl"
              >
                <div className="flex items-center justify-center gap-1 text-rose-600 dark:text-rose-400 font-bold text-base">
                  <Heart className="w-4 h-4 fill-rose-600 dark:fill-rose-400" />
                  <span>{favorites.length}</span>
                </div>
                <span className="text-[10px] text-black/50 dark:text-white/50">قطع في المفضلة</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        role="tablist"
        aria-label="أقسام الملف الشخصي"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-2 rounded-2xl bg-white/70 dark:bg-espresso-900/80 border border-black/10 dark:border-white/10 shadow-sm"
      >
        {profileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`profile-tab-${tab.id}`}
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[46px] rounded-xl px-2.5 py-2 flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-black/65 dark:text-white/65 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`min-w-5 rounded-full px-1 text-[10px] ${isActive ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Form & Settings */}
      {activeTab === 'personal' && (
      <div
        role="tabpanel"
        id="profile-panel-personal"
        aria-labelledby="profile-tab-personal"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* Profile Settings Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSaveProfile} className="bg-white/75 dark:bg-espresso-900/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-lg backdrop-blur-xl space-y-5">
            <h3 className="font-bold text-base border-b border-black/10 dark:border-white/10 pb-3">
              بياناتك الشخصية
            </h3>

            {/* Username display (read-only for security) */}
            <div>
              <label className="block text-xs font-bold mb-1">اسم المستخدم</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  disabled
                  value={currentUser.username || 'غير محدد'}
                  className="w-full pl-3 pr-10 py-3 bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 rounded-xl text-sm outline-none text-black/50 dark:text-white/50 min-h-[44px] cursor-not-allowed font-medium"
                />
                <User className="w-4 h-4 text-black/40 dark:text-white/40 absolute right-3 top-3.5" />
              </div>
              <span className="text-[11px] text-black/50 dark:text-white/50 mt-1 block">
                اسم المستخدم ثابت ومخصص لتسجيل الدخول بأمان لحسابك.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">الاسم الكامل</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-3 pr-10 py-3 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm outline-none focus:border-primary min-h-[44px]"
                  />
                  <User className="w-4 h-4 text-black/40 dark:text-white/40 absolute right-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  البريد الإلكتروني <span className="text-black/40 dark:text-white/40 font-normal">(اختياري)</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com (اختياري)"
                    className="w-full pl-3 pr-10 py-3 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm outline-none focus:border-primary min-h-[44px]"
                  />
                  <Mail className="w-4 h-4 text-black/40 dark:text-white/40 absolute right-3 top-3.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">رقم الهاتف</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-3 pr-10 py-3 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm outline-none focus:border-primary min-h-[44px]"
                  />
                  <Phone className="w-4 h-4 text-black/40 dark:text-white/40 absolute right-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">المحافظة</label>
                <div className="relative">
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value as Governorate)}
                    className="w-full px-3.5 py-3 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm outline-none focus:border-primary min-h-[44px] cursor-pointer"
                  >
                    <option value="القاهرة" className="dark:bg-espresso-900">القاهرة</option>
                    <option value="الجيزة" className="dark:bg-espresso-900">الجيزة</option>
                    <option value="الإسكندرية" className="dark:bg-espresso-900">الإسكندرية</option>
                    <option value="قنا" className="dark:bg-espresso-900">قنا</option>
                    <option value="سوهاج" className="dark:bg-espresso-900">سوهاج</option>
                    <option value="أسوان" className="dark:bg-espresso-900">أسوان</option>
                    <option value="الأقصر" className="dark:bg-espresso-900">الأقصر</option>
                    <option value="أسيوط" className="dark:bg-espresso-900">أسيوط</option>
                    <option value="المنيا" className="dark:bg-espresso-900">المنيا</option>
                    <option value="بني سويف" className="dark:bg-espresso-900">بني سويف</option>
                    <option value="الوادي الجديد" className="dark:bg-espresso-900">الوادي الجديد</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#6B3A1F] text-[#FFF9EE] hover:bg-[#3B1E0E] dark:hover:bg-[#C99444] text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors min-h-[44px] cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ التعديلات</span>
            </button>
          </form>
        </div>

        {/* Sidebar Shortcut Options */}
        <div className="lg:col-span-4 space-y-4">
          {isAdmin ? (
            <div className="bg-white/75 dark:bg-espresso-900/90 p-6 rounded-[2rem] border border-primary/20 space-y-3 text-right shadow-lg backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-primary dark:text-primary-hover">لوحة الإدارة العليا</h4>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:text-primary-hover border border-primary/20">
                  <ShieldCheck className="w-3 h-3" />
                  مدير المنصة
                </span>
              </div>
              <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                أنت مسجل كمدير عام لمنصة وه. تدار كافة الورش والبائعين والمنتجات والطلبات والتراث مباشرة من لوحة الإدارة.
              </p>
              <button
                type="button"
                id="go-to-admin-dashboard-btn"
                onClick={() => setActivePage('admin-dashboard')}
                className="w-full py-2.5 bg-primary hover:bg-[#3B1E0E] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>الانتقال للوحة تحكم الإدارة</span>
              </button>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button type="button" onClick={() => setActivePage('admin-buyers')} className="py-2.5 px-2 bg-black/5 dark:bg-cream/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold rounded-xl transition-colors cursor-pointer">
                  إدارة المستخدمين
                </button>
                <button type="button" onClick={() => setActivePage('admin-products')} className="py-2.5 px-2 bg-black/5 dark:bg-cream/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold rounded-xl transition-colors cursor-pointer">
                  إدارة المنتجات
                </button>
                <button type="button" onClick={() => setActivePage('admin-orders')} className="py-2.5 px-2 bg-black/5 dark:bg-cream/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold rounded-xl transition-colors cursor-pointer">
                  إدارة الطلبات
                </button>
                <button type="button" onClick={() => setActivePage('admin-reports')} className="py-2.5 px-2 bg-black/5 dark:bg-cream/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold rounded-xl transition-colors cursor-pointer">
                  البلاغات
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/75 dark:bg-espresso-900/90 p-6 rounded-[2rem] border border-black/10 dark:border-white/10 space-y-3 text-right shadow-lg backdrop-blur-xl">
              {currentUser?.sellerStatus === 'approved' || (isSeller && !currentUser?.sellerStatus) ? (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs">ورشتك الحرفية المعتمدة</h4>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      معتمدة وموثقة
                    </span>
                  </div>
                  <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                    متجرك <strong>"{currentUser.seller?.brandName || 'ورشة الحرفي'}"</strong> متوثق وشغال في السوق. تقدر تدير منتجاتك ومبيعاتك وأرباحك من لوحة التحكم.
                  </p>
                  <button
                    type="button"
                    id="go-to-seller-settings-btn"
                    onClick={() => setActivePage('seller-account')}
                    className="w-full py-2.5 bg-primary hover:bg-[#3B1E0E] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Store className="w-4 h-4" />
                    <span>إعدادات الورشة</span>
                  </button>
                </>
              ) : currentUser?.sellerStatus === 'suspended' ? (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs">حالة الورشة</h4>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                      <AlertTriangle className="w-3 h-3" />
                      موقوفة مؤقتًا
                    </span>
                  </div>
                  <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                    تواصل مع الإدارة لمعرفة تفاصيل الإيقاف ومتابعة حالة ورشتك.
                  </p>
                  <button type="button" onClick={() => setActivePage('seller-account')} className="w-full py-2.5 bg-black/5 dark:bg-cream/5 hover:bg-black/10 dark:hover:bg-white/10 text-espresso dark:text-cream font-bold text-xs rounded-xl border border-black/10 dark:border-white/10 transition-colors cursor-pointer">
                    إعدادات الورشة
                  </button>
                </>
              ) : currentUser?.sellerStatus === 'pending' ? (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs">حالة اعتماد الورشة</h4>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-primary-hover border border-amber-500/20">
                      <Clock className="w-3 h-3" />
                      قيد المراجعة والتدقيق
                    </span>
                  </div>
                  <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs text-amber-900 dark:text-primary-hover space-y-1">
                    <p className="font-bold">{currentUser.seller?.brandName || workshopName || 'ورشة مسجلة'}</p>
                    <p className="text-[11px] opacity-80">
                      محافظة {currentUser.seller?.governorate || applyGovernorate} • {currentUser.seller?.specialty || specialty}
                    </p>
                  </div>
                  <p className="text-[11px] text-black/60 dark:text-white/60 leading-relaxed">
                    طلبك محفوظ عندنا تمام، وإدارة منصة وه بتراجع بيانات الورشة دلوقتي وهنرد عليك قريب.
                  </p>
                  <button
                    type="button"
                    id="refresh-seller-status-btn"
                    onClick={handleRefreshStatus}
                    disabled={isCheckingStatus}
                    className="w-full py-2.5 bg-black/5 dark:bg-cream/5 hover:bg-black/10 dark:hover:bg-white/10 text-espresso dark:text-cream font-bold text-xs rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                    <span>{isCheckingStatus ? 'بنراجع...' : 'حدّث حالة الطلب'}</span>
                  </button>
                </>
              ) : currentUser?.sellerStatus === 'rejected' ? (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs">حالة اعتماد الورشة</h4>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                      <AlertCircle className="w-3 h-3" />
                      تم الرفض
                    </span>
                  </div>
                  <div className="p-3 bg-rose-500/5 dark:bg-rose-500/10 rounded-xl border border-rose-500/20 text-xs text-rose-900 dark:text-rose-200 space-y-1">
                    <span className="font-bold block text-[11px]">سبب الرفض:</span>
                    <p className="text-[11px]">{currentUser.seller?.rejectionReason || 'لم يستوفِ الملف المعايير التراثية المطلوبة.'}</p>
                  </div>
                  <button
                    type="button"
                    id="reapply-seller-btn"
                    onClick={() => setIsApplyModalOpen(true)}
                    className="w-full py-2.5 bg-primary hover:bg-[#3B1E0E] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Store className="w-4 h-4" />
                    <span>إعدادات الورشة وإعادة التقديم</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs">افتح ورشتك في وه</h4>
                    <span className="text-[10px] text-primary font-bold px-2 py-0.5 bg-primary/10 rounded-full">
                      متاح للمشترين
                    </span>
                  </div>
                  <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                    عندك ورشة أو بتعمل حرف يدوية في الصعيد؟ تقدر تقدم عشان تنضم كبائع حرفي وتعرض منتجاتك للناس، وتتابع طلباتك وتستلم فلوسك على فودافون كاش أو إنستاباي بعد ما الإدارة تراجع طلبك.
                  </p>
                  <button
                    type="button"
                    id="open-apply-seller-modal-btn"
                    onClick={() => setIsApplyModalOpen(true)}
                    className="w-full py-2.5 bg-primary hover:bg-[#3B1E0E] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Store className="w-4 h-4" />
                    <span>قدّم طلب عشان تفتح ورشتك كبائع</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Complaints & Support Center Card */}
          <div className="bg-white/80 dark:bg-espresso-900/90 p-5 rounded-[2rem] border border-amber-500/20 text-xs space-y-3 shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-primary dark:text-primary-hover">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>مركز المساعدة والبلاغات</span>
              </div>
              <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                مباشر مع الإدارة
              </span>
            </div>
            <p className="text-[11px] text-black/65 dark:text-white/65 leading-relaxed">
              واجهتك أي مشكلة في طلب، عيب في منتج يدوي استلمته، أو مشكلة في الدفع؟ بلّغ الإدارة فوراً وهيتم متابعة طلبك هاتفياً وحله.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                id="open-report-from-buyer-account-btn"
                onClick={() => openReportModal({ initialTab: 'new' })}
                className="flex-1 py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>تقديم بلاغ أو شكوى</span>
              </button>
              <button
                type="button"
                onClick={() => openReportModal({ initialTab: 'my-reports' })}
                className="py-2.5 px-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black/80 dark:text-white/80 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>سجل بلاغاتي</span>
              </button>
            </div>
          </div>

        </div>
      </div>
      )}

      {activeTab === 'security' && (
        <section
          role="tabpanel"
          id="profile-panel-security"
          aria-labelledby="profile-tab-security"
          className="max-w-3xl mx-auto space-y-5"
        >
          <div className="bg-white/75 dark:bg-espresso-900/90 p-6 sm:p-8 rounded-[2rem] border border-black/10 dark:border-white/10 space-y-5 shadow-lg backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-lg">الأمان وكلمة المرور</h2>
                <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                  تحديث كلمة المرور يسجل خروج حسابك من جميع الأجهزة.
                </p>
              </div>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <input
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="كلمة المرور الحالية"
                aria-label="كلمة المرور الحالية"
                className="w-full px-4 py-3 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm outline-none focus:border-primary"
                dir="ltr"
              />
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="كلمة المرور الجديدة (6 خانات على الأقل)"
                aria-label="كلمة المرور الجديدة"
                className="w-full px-4 py-3 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm outline-none focus:border-primary"
                dir="ltr"
              />
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                placeholder="تأكيد كلمة المرور الجديدة"
                aria-label="تأكيد كلمة المرور الجديدة"
                className="w-full px-4 py-3 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm outline-none focus:border-primary"
                dir="ltr"
              />
              <button
                type="submit"
                disabled={isChangingPassword || isRevokingSessions}
                className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-[#3B1E0E] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                <span>{isChangingPassword ? 'جاري تغيير كلمة المرور...' : 'تغيير كلمة المرور'}</span>
              </button>
            </form>
          </div>

          <div className="bg-white/75 dark:bg-espresso-900/90 p-6 rounded-[2rem] border border-rose-500/25 space-y-4 shadow-lg backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm">جلسات تسجيل الدخول</h3>
                <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                  أنهِ الجلسات المفتوحة على جميع أجهزتك، بما فيها هذا الجهاز.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogoutAllSessions}
              disabled={isChangingPassword || isRevokingSessions}
              className="w-full sm:w-auto px-5 py-3 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-bold text-sm rounded-xl border border-rose-500/25 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isRevokingSessions ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              <span>{isRevokingSessions ? 'جاري إنهاء الجلسات...' : 'تسجيل الخروج من كل الأجهزة'}</span>
            </button>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 p-4 text-xs text-black/60 dark:text-white/60">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="leading-relaxed">بيانات حسابك محمية، ولا نعرض كلمة المرور الحالية أو نخزنها كنص قابل للقراءة.</p>
          </div>
        </section>
      )}

      {activeTab === 'addresses' && (
        <section
          role="tabpanel"
          id="profile-panel-addresses"
          aria-labelledby="profile-tab-addresses"
          className="max-w-4xl mx-auto space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-black text-lg">عناوين التوصيل</h2>
              <p className="text-xs text-black/60 dark:text-white/60 mt-1">احفظ عناوينك واختر العنوان الافتراضي للطلبات القادمة.</p>
            </div>
            <button
              type="button"
              onClick={() => setAddresses((previous) => [
                ...previous,
                {
                  fullName: currentUser.name || '',
                  phone: currentUser.phone || '',
                  governorate: (currentUser.governorate as Governorate) || 'قنا',
                  city: '',
                  streetAddress: '',
                  isDefault: previous.length === 0
                }
              ])}
              className="px-4 py-2.5 bg-primary/10 hover:bg-primary/15 text-primary font-bold text-xs rounded-xl border border-primary/20 transition-colors cursor-pointer"
            >
              إضافة عنوان جديد
            </button>
          </div>

          {addresses.length === 0 ? (
            <form onSubmit={handleSaveAddresses} className="bg-white/75 dark:bg-espresso-900/90 rounded-[2rem] border border-dashed border-black/20 dark:border-white/20 p-10 text-center space-y-3">
              <MapPin className="w-8 h-8 mx-auto text-primary" />
              <p className="font-bold text-sm">لسه مفيش عناوين محفوظة</p>
              <p className="text-xs text-black/55 dark:text-white/55">أضف عنوانًا لتسهيل إتمام طلباتك القادمة.</p>
              <button
                type="submit"
                disabled={isSavingAddresses}
                className="px-5 py-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl border border-rose-500/25 cursor-pointer disabled:opacity-50"
              >
                {isSavingAddresses ? 'جاري التحديث...' : 'حفظ قائمة العناوين فارغة'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSaveAddresses} className="space-y-4">
              {addresses.map((address, index) => (
                <div key={`address-${index}`} className="bg-white/75 dark:bg-espresso-900/90 p-5 sm:p-6 rounded-[2rem] border border-black/10 dark:border-white/10 space-y-4 shadow-lg backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-sm">عنوان التوصيل {index + 1}</h3>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="default-address"
                          checked={Boolean(address.isDefault)}
                          onChange={() => setAddresses((previous) => previous.map((item, itemIndex) => ({
                            ...item,
                            isDefault: itemIndex === index
                          })))}
                          className="accent-primary"
                        />
                        افتراضي
                      </label>
                      <button
                        type="button"
                        onClick={() => setAddresses((previous) => {
                          const remaining = previous.filter((_, itemIndex) => itemIndex !== index);
                          const defaultIndex = remaining.findIndex((item) => item.isDefault);
                          return remaining.map((item, itemIndex) => ({
                            ...item,
                            isDefault: itemIndex === (defaultIndex >= 0 ? defaultIndex : 0)
                          }));
                        })}
                        aria-label={`حذف عنوان التوصيل ${index + 1}`}
                        className="p-2 text-rose-600 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      required
                      value={address.fullName}
                      onChange={(event) => updateAddress(index, { fullName: event.target.value })}
                      placeholder="اسم المستلم"
                      aria-label="اسم المستلم"
                      className="w-full px-3 py-2.5 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-primary"
                    />
                    <input
                      required
                      type="tel"
                      value={address.phone}
                      onChange={(event) => updateAddress(index, { phone: event.target.value })}
                      placeholder="رقم الهاتف"
                      aria-label="رقم هاتف المستلم"
                      className="w-full px-3 py-2.5 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-primary"
                    />
                    <select
                      required
                      value={address.governorate}
                      onChange={(event) => updateAddress(index, { governorate: event.target.value as Governorate })}
                      aria-label="المحافظة"
                      className="w-full px-3 py-2.5 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-primary"
                    >
                      {['القاهرة', 'الجيزة', 'الإسكندرية', 'قنا', 'سوهاج', 'أسوان', 'الأقصر', 'أسيوط', 'المنيا', 'بني سويف', 'الوادي الجديد'].map((governorateOption) => (
                        <option key={governorateOption} value={governorateOption} className="dark:bg-espresso-900">{governorateOption}</option>
                      ))}
                    </select>
                    <input
                      required
                      value={address.city}
                      onChange={(event) => updateAddress(index, { city: event.target.value })}
                      placeholder="المدينة أو المركز"
                      aria-label="المدينة أو المركز"
                      className="w-full px-3 py-2.5 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-primary"
                    />
                    <input
                      required
                      value={address.streetAddress}
                      onChange={(event) => updateAddress(index, { streetAddress: event.target.value })}
                      placeholder="الشارع والعنوان بالتفصيل"
                      aria-label="الشارع والعنوان بالتفصيل"
                      className="w-full sm:col-span-2 px-3 py-2.5 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-primary"
                    />
                    <input
                      value={address.buildingNo || ''}
                      onChange={(event) => updateAddress(index, { buildingNo: event.target.value })}
                      placeholder="رقم المبنى (اختياري)"
                      aria-label="رقم المبنى"
                      className="w-full px-3 py-2.5 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-primary"
                    />
                    <input
                      value={address.notes || ''}
                      onChange={(event) => updateAddress(index, { notes: event.target.value })}
                      placeholder="علامة مميزة أو ملاحظات (اختياري)"
                      aria-label="ملاحظات العنوان"
                      className="w-full px-3 py-2.5 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>
              ))}
              <button
                type="submit"
                disabled={isSavingAddresses}
                className="px-6 py-3 bg-primary hover:bg-[#3B1E0E] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSavingAddresses ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSavingAddresses ? 'جاري حفظ العناوين...' : 'حفظ العناوين'}</span>
              </button>
            </form>
          )}
        </section>
      )}

      {activeTab === 'orders' && (
        <section
          role="tabpanel"
          id="profile-panel-orders"
          aria-labelledby="profile-tab-orders"
          className="max-w-4xl mx-auto space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-black text-lg">طلباتي</h2>
              <p className="text-xs text-black/60 dark:text-white/60 mt-1">تابع أحدث طلباتك وحالتها.</p>
            </div>
            <button type="button" onClick={() => setActivePage('orders')} className="text-xs font-bold text-primary hover:underline cursor-pointer">
              عرض كل الطلبات
            </button>
          </div>
          {orders.length === 0 ? (
            <div className="bg-white/75 dark:bg-espresso-900/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-10 text-center space-y-3">
              <Package className="w-8 h-8 mx-auto text-primary" />
              <p className="font-bold text-sm">لا توجد طلبات حتى الآن</p>
              <button type="button" onClick={() => setActivePage('products')} className="text-xs font-bold text-primary hover:underline cursor-pointer">
                ابدأ التسوق
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 8).map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => navigateToOrder(order.id)}
                  className="w-full text-right bg-white/75 dark:bg-espresso-900/90 rounded-2xl border border-black/10 dark:border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-sm">طلب رقم {order.orderNumber || order.id}</span>
                    <p className="text-xs text-black/55 dark:text-white/55 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG')} · {order.items.length} منتجات
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-xs font-bold text-primary">
                      {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(order.total)}
                    </span>
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">{order.status}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'notifications' && (
        <section
          role="tabpanel"
          id="profile-panel-notifications"
          aria-labelledby="profile-tab-notifications"
          className="max-w-5xl mx-auto bg-white/75 dark:bg-espresso-900/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-4 sm:p-6 shadow-lg backdrop-blur-xl"
        >
          <NotificationsManager
            viewMode={currentRole === 'admin' ? 'admin' : currentRole === 'seller' ? 'seller' : 'buyer'}
            onNavigateTab={(tab) => {
              if (currentRole === 'admin') {
                setActivePage('admin-dashboard');
              } else if (currentRole === 'seller') {
                if (tab === 'orders') setActivePage('seller-orders');
                else if (tab === 'products') setActivePage('seller-products');
                else if (tab === 'payouts') setActivePage('seller-payouts');
                else setActivePage('seller-dashboard');
              } else if (tab === 'orders') {
                setActiveTab('orders');
              } else if (tab === 'profile') {
                setActiveTab('personal');
              } else {
                setActiveTab('personal');
              }
            }}
          />
        </section>
      )}

      {/* In-Place Seller Application Modal */}
      {!isAdmin && isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl bg-white dark:bg-espresso-900 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar text-right"
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-espresso dark:text-cream">
                    طلب اعتماد ورشة حرفية بصعيد مصر
                  </h3>
                  <p className="text-[11px] text-black/60 dark:text-white/60">
                    سجل بيانات ورشتك للانضمام إلى نخبة شيوخ الصنعة في منصة وه
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-cream/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-black/60 dark:text-white/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">
                  اسم الورشة أو العلامة الحرفية <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={workshopName}
                  onChange={(e) => setWorkshopName(e.target.value)}
                  placeholder="مثال: ورشة الفخار الأصيل، نول أخميم اليدوي..."
                  className="w-full px-3.5 py-2.5 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-primary min-h-[42px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    التخصص الحرفي <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="مثال: فخار وخزف، تلي وتطريز، سجاد صوف..."
                    className="w-full px-3.5 py-2.5 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-primary min-h-[42px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">محافظة الورشة</label>
                  <select
                    value={applyGovernorate}
                    onChange={(e) => setApplyGovernorate(e.target.value as Governorate)}
                    className="w-full px-3.5 py-2.5 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-primary min-h-[42px] cursor-pointer"
                  >
                    <option value="قنا" className="dark:bg-espresso-900">قنا</option>
                    <option value="سوهاج" className="dark:bg-espresso-900">سوهاج</option>
                    <option value="أسوان" className="dark:bg-espresso-900">أسوان</option>
                    <option value="الأقصر" className="dark:bg-espresso-900">الأقصر</option>
                    <option value="أسيوط" className="dark:bg-espresso-900">أسيوط</option>
                    <option value="المنيا" className="dark:bg-espresso-900">المنيا</option>
                    <option value="بني سويف" className="dark:bg-espresso-900">بني سويف</option>
                    <option value="الوادي الجديد" className="dark:bg-espresso-900">الوادي الجديد</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    رقم هاتف الورشة <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={applyPhone}
                    onChange={(e) => setApplyPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-primary min-h-[42px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    البريد الإلكتروني للورشة <span className="text-black/40 dark:text-white/40 font-normal">(اختياري)</span>
                  </label>
                  <input
                    type="email"
                    value={applyEmail}
                    onChange={(e) => setApplyEmail(e.target.value)}
                    placeholder="workshop@example.com"
                    className="w-full px-3.5 py-2.5 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-primary min-h-[42px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">نبذة عن الورشة والمنتجات</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="اكتب نبذة مختصرة تصف منتجات ورشتكم التراثية..."
                  className="w-full px-3.5 py-2.5 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">قصة الحرفة ومصدر الإلهام</label>
                <textarea
                  rows={2}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="كيف بدأت الصنعة؟ كم جيلاً توارث هذه الحرفة؟..."
                  className="w-full px-3.5 py-2.5 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-black/10 dark:border-white/10">
                <div>
                  <label className="block text-xs font-bold mb-1">طريقة استلام الأرباح</label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-primary min-h-[42px] cursor-pointer"
                  >
                    <option value="vodafone_cash" className="dark:bg-espresso-900">محفظة فودافون كاش / كاش المحمول</option>
                    <option value="instapay" className="dark:bg-espresso-900">شبكة المدفوعات اللحظية InstaPay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">رقم المحفظة أو عنوان InstaPay</label>
                  <input
                    type="text"
                    value={payoutAccount}
                    onChange={(e) => setPayoutAccount(e.target.value)}
                    placeholder="رقم الموبايل أو IPA"
                    className="w-full px-3.5 py-2.5 bg-black/[0.035] dark:bg-cream/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-primary min-h-[42px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApply}
                  className="px-6 py-2.5 bg-primary hover:bg-[#3B1E0E] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingApply ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري إرسال الطلب...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>إرسال طلب الاعتماد</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        isSellerMode={currentRole === 'seller' || currentUser?.role === 'seller'}
      />
    </div>
  );
};