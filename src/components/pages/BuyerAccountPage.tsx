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
  Clock,
  CheckCircle2,
  RefreshCw,
  X,
  Sparkles
} from 'lucide-react';
import { Governorate } from '../../types';

export const BuyerAccountPage: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    currentRole,
    orders,
    favorites,
    setActivePage,
    addToast,
    uploadProfileImage,
    removeProfileImage,
    applyToBecomeSeller,
    setIsAuthModalOpen,
    setAuthModalTab
  } = useApp();

  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [governorate, setGovernorate] = useState<Governorate>(
    (currentUser.governorate as Governorate) || 'قنا'
  );

  // Seller Application In-Place State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmittingApply, setIsSubmittingApply] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [workshopName, setWorkshopName] = useState(currentUser.seller?.brandName || '');
  const [specialty, setSpecialty] = useState(currentUser.seller?.specialty || 'مشغولات وفخار صعيدي');
  const [applyGovernorate, setApplyGovernorate] = useState<Governorate>(
    (currentUser.governorate as Governorate) || 'قنا'
  );
  const [applyPhone, setApplyPhone] = useState(currentUser.phone || '');
  const [applyEmail, setApplyEmail] = useState(currentUser.email || '');
  const [bio, setBio] = useState(currentUser.seller?.bio || '');
  const [story, setStory] = useState(currentUser.seller?.story || '');
  const [payoutMethod, setPayoutMethod] = useState<'vodafone_cash' | 'instapay'>('vodafone_cash');
  const [payoutAccount, setPayoutAccount] = useState(currentUser.phone || '');

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
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem('open_seller_apply') === 'true') {
        sessionStorage.removeItem('open_seller_apply');
        if (currentUser?.sellerStatus !== 'approved' && currentRole !== 'seller') {
          setIsApplyModalOpen(true);
        }
      }
    } catch {
      // ignore
    }
  }, [currentUser?.sellerStatus, currentRole]);

  const handleRefreshStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const me = await api.getMe();
      if (me && me.id) {
        setCurrentUser(me);
        if (me.role === 'seller' && me.sellerStatus === 'approved') {
          addToast('تم اعتماد حسابك كبائع!', 'تهانينا، تم توثيق ورشتك بنجاح من قبل الإدارة المركزية.', 'success');
        } else if (me.sellerStatus === 'pending') {
          addToast('حالة الطلب', 'طلب انضمام ورشتك ما زال قيد المراجعة والتدقيق الإداري.', 'info');
        } else if (me.sellerStatus === 'rejected') {
          addToast('حالة الطلب', 'تم رفض طلب الانضمام. يمكنك مراجعة سبب الرفض وتعديل البيانات.', 'warning');
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
      setImageError('نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG أو PNG أو WebP');
      return;
    }

    if (file.size > maxSizeBytes) {
      setImageError('حجم الصورة يتجاوز الحد الأقصى المسموح به (5 ميجابايت)');
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

  const handleRemoveProfileImage = async () => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف صورة الملف الشخصي؟')) return;

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

  const DEFAULT_USER_AVATAR = 'https://res.cloudinary.com/kuana1nl/image/upload/v1788710904/user.jpg';
  const hasCustomImage = Boolean(
    currentUser.profileImage?.secureUrl ||
    (currentUser.avatar &&
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
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors duration-500
        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
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
          className="hover:text-[#9a6a35] transition-colors cursor-pointer"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="font-bold">الملف الشخصي وإعدادات الحساب</span>
      </nav>

      {/* Account Overview Header */}
      <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-lg backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-5">
            {/* User Avatar with Cloudinary Integration */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#211d18] text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-3xl font-serif shadow-md border-2 border-black/10 dark:border-white/10">
                {isUploadingImage || isRemovingImage ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black/60 text-white">
                    <Loader2 className="w-6 h-6 animate-spin mb-1" />
                    <span className="text-[10px]">جاري المعالجة...</span>
                  </div>
                ) : previewImage ? (
                  <img src={previewImage} alt="معاينة" className="w-full h-full object-cover" />
                ) : currentUser.avatar ? (
                  <img
                    src={currentUser.profileImage?.secureUrl || currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>

              {/* Quick Camera Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage || isRemovingImage}
                title="تغيير الصورة"
                className="absolute -bottom-1 -left-1 p-2 bg-[#211d18] hover:bg-[#9a6a35] text-white dark:bg-white dark:text-black dark:hover:bg-[#d5a56d] rounded-xl shadow-md transition-transform hover:scale-105 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black">{currentUser.name}</h1>
                <span className="bg-[#9a6a35]/10 border border-[#9a6a35]/30 text-[#9a6a35] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {currentUser.role === 'admin'
                    ? 'مدير المنصة'
                    : currentUser.role === 'seller'
                      ? 'ورشة معتمدة'
                      : 'متسوق موثق'}
                </span>
              </div>
              <p className="text-xs text-black/60 dark:text-white/60 mt-1">{currentUser.email}</p>

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
                  className="px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#9a6a35]" />
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

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:flex items-center">
            <button
              type="button"
              onClick={() => setActivePage('orders')}
              className="p-3 rounded-2xl bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 hover:border-[#9a6a35] transition-all text-center cursor-pointer backdrop-blur-xl"
            >
              <div className="flex items-center justify-center gap-1 text-[#9a6a35] font-bold text-base">
                <Package className="w-4 h-4" />
                <span>{orders.length}</span>
              </div>
              <span className="text-[10px] text-black/50 dark:text-white/50">طلبات سابقة</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('favorites')}
              className="p-3 rounded-2xl bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 hover:border-[#9a6a35] transition-all text-center cursor-pointer backdrop-blur-xl"
            >
              <div className="flex items-center justify-center gap-1 text-rose-600 dark:text-rose-400 font-bold text-base">
                <Heart className="w-4 h-4 fill-rose-600 dark:fill-rose-400" />
                <span>{favorites.length}</span>
              </div>
              <span className="text-[10px] text-black/50 dark:text-white/50">قطع في المفضلة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Settings Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSaveProfile} className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-lg backdrop-blur-xl space-y-5">
            <h3 className="font-bold text-base border-b border-black/10 dark:border-white/10 pb-3">
              البيانات الشخصية وعنوان التوصيل الافتراضي
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
                  className="w-full pl-3 pr-10 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-sm outline-none text-black/50 dark:text-white/50 min-h-[44px] cursor-not-allowed font-medium"
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
                    className="w-full pl-3 pr-10 py-3 bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm outline-none focus:border-[#9a6a35] min-h-[44px]"
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
                    className="w-full pl-3 pr-10 py-3 bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm outline-none focus:border-[#9a6a35] min-h-[44px]"
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
                    className="w-full pl-3 pr-10 py-3 bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm outline-none focus:border-[#9a6a35] min-h-[44px]"
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
                    className="w-full px-3.5 py-3 bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm outline-none focus:border-[#9a6a35] min-h-[44px] cursor-pointer"
                  >
                    <option value="القاهرة" className="dark:bg-[#151513]">القاهرة</option>
                    <option value="الجيزة" className="dark:bg-[#151513]">الجيزة</option>
                    <option value="الإسكندرية" className="dark:bg-[#151513]">الإسكندرية</option>
                    <option value="قنا" className="dark:bg-[#151513]">قنا</option>
                    <option value="سوهاج" className="dark:bg-[#151513]">سوهاج</option>
                    <option value="أسوان" className="dark:bg-[#151513]">أسوان</option>
                    <option value="الأقصر" className="dark:bg-[#151513]">الأقصر</option>
                    <option value="أسيوط" className="dark:bg-[#151513]">أسيوط</option>
                    <option value="المنيا" className="dark:bg-[#151513]">المنيا</option>
                    <option value="بني سويف" className="dark:bg-[#151513]">بني سويف</option>
                    <option value="الوادي الجديد" className="dark:bg-[#151513]">الوادي الجديد</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors min-h-[44px] cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ التعديلات</span>
            </button>
          </form>
        </div>

        {/* Sidebar Shortcut Options */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white/75 dark:bg-[#151513]/90 p-6 rounded-[2rem] border border-black/10 dark:border-white/10 space-y-3 text-right shadow-lg backdrop-blur-xl">
            {currentUser.sellerStatus === 'approved' || currentRole === 'seller' ? (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs">ورشتك الحرفية المعتمدة</h4>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    معتمدة وموثقة
                  </span>
                </div>
                <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                  متجرك <strong>"{currentUser.seller?.brandName || 'ورشة الحرفي'}"</strong> موثق ومتاح بالسوق العام. يمكنك إدارة منتجاتك ومبيعاتك ومستحقاتك من لوحة التحكم.
                </p>
                <button
                  type="button"
                  id="go-to-seller-dashboard-btn"
                  onClick={() => setActivePage('seller-dashboard')}
                  className="w-full py-2.5 bg-[#9a6a35] hover:bg-[#744e26] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Store className="w-4 h-4" />
                  <span>الدخول إلى لوحة البائع الحرفي</span>
                </button>
              </>
            ) : currentUser.sellerStatus === 'pending' ? (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs">طلب انضمام ورشة حرفية</h4>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    <Clock className="w-3 h-3" />
                    قيد المراجعة والتدقيق
                  </span>
                </div>
                <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <p className="font-bold">{currentUser.seller?.brandName || workshopName || 'ورشة مسجلة'}</p>
                  <p className="text-[11px] opacity-80">
                    محافظة {currentUser.seller?.governorate || applyGovernorate} • {currentUser.seller?.specialty || specialty}
                  </p>
                </div>
                <p className="text-[11px] text-black/60 dark:text-white/60 leading-relaxed">
                  تم حفظ طلبك بنجاح في قاعدة البيانات. تجري حالياً مراجعة المعايير التراثية والتاريخية للورشة من قبل إدارة منصة وه.
                </p>
                <button
                  type="button"
                  id="refresh-seller-status-btn"
                  onClick={handleRefreshStatus}
                  disabled={isCheckingStatus}
                  className="w-full py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] font-bold text-xs rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                  <span>{isCheckingStatus ? 'جاري التحقق...' : 'تحديث حالة الطلب'}</span>
                </button>
              </>
            ) : currentUser.sellerStatus === 'rejected' ? (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs">طلب انضمام ورشة حرفية</h4>
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
                  className="w-full py-2.5 bg-[#9a6a35] hover:bg-[#744e26] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Store className="w-4 h-4" />
                  <span>تعديل وإعادة تقديم الطلب</span>
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs">التحول إلى بائع (Become a Seller)</h4>
                  <span className="text-[10px] text-[#9a6a35] font-bold px-2 py-0.5 bg-[#9a6a35]/10 rounded-full">
                    متاح للمشترين
                  </span>
                </div>
                <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                  هل تمتلك ورشة أو مشغل حرفي في صعيد مصر؟ يمكنك تقديم طلب انضمام كبائع حرفي لعرض منتجاتك، متابعة طلبات العملاء، واستلام مستحقاتك المالية عبر فودافون كاش أو إنستاباي فور مراجعة واعتماد الإدارة.
                </p>
                <button
                  type="button"
                  id="open-apply-seller-modal-btn"
                  onClick={() => setIsApplyModalOpen(true)}
                  className="w-full py-2.5 bg-[#9a6a35] hover:bg-[#744e26] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Store className="w-4 h-4" />
                  <span>التحول إلى بائع — تقديم طلب اعتماد ورشة</span>
                </button>
              </>
            )}
          </div>

          <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[2rem] border border-black/10 dark:border-white/10 text-xs text-black/60 dark:text-white/60 space-y-2 shadow-lg backdrop-blur-xl">
            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>حماية البيانات والخصوصية</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              بياناتك وعناوين الشحن مشفرة ومحمية وفق أعلى معايير الأمان المعتمدة في منصة وه.
            </p>
          </div>
        </div>
      </div>

      {/* In-Place Seller Application Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl bg-white dark:bg-[#151513] rounded-[2rem] border border-black/10 dark:border-white/10 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar text-right"
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#9a6a35]/10 text-[#9a6a35] flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7]">
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
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-black/60 dark:text-white/60 cursor-pointer"
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
                  className="w-full px-3.5 py-2.5 bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] min-h-[42px]"
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
                    className="w-full px-3.5 py-2.5 bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] min-h-[42px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">محافظة الورشة</label>
                  <select
                    value={applyGovernorate}
                    onChange={(e) => setApplyGovernorate(e.target.value as Governorate)}
                    className="w-full px-3.5 py-2.5 bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] min-h-[42px] cursor-pointer"
                  >
                    <option value="قنا" className="dark:bg-[#151513]">قنا</option>
                    <option value="سوهاج" className="dark:bg-[#151513]">سوهاج</option>
                    <option value="أسوان" className="dark:bg-[#151513]">أسوان</option>
                    <option value="الأقصر" className="dark:bg-[#151513]">الأقصر</option>
                    <option value="أسيوط" className="dark:bg-[#151513]">أسيوط</option>
                    <option value="المنيا" className="dark:bg-[#151513]">المنيا</option>
                    <option value="بني سويف" className="dark:bg-[#151513]">بني سويف</option>
                    <option value="الوادي الجديد" className="dark:bg-[#151513]">الوادي الجديد</option>
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
                    className="w-full px-3.5 py-2.5 bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] min-h-[42px]"
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
                    className="w-full px-3.5 py-2.5 bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] min-h-[42px]"
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
                  className="w-full px-3.5 py-2.5 bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">قصة الحرفة ومصدر الإلهام</label>
                <textarea
                  rows={2}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="كيف بدأت الصنعة؟ كم جيلاً توارث هذه الحرفة؟..."
                  className="w-full px-3.5 py-2.5 bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-black/10 dark:border-white/10">
                <div>
                  <label className="block text-xs font-bold mb-1">طريقة استلام الأرباح</label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] min-h-[42px] cursor-pointer"
                  >
                    <option value="vodafone_cash" className="dark:bg-[#151513]">محفظة فودافون كاش / كاش المحمول</option>
                    <option value="instapay" className="dark:bg-[#151513]">شبكة المدفوعات اللحظية InstaPay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">رقم المحفظة أو عنوان InstaPay</label>
                  <input
                    type="text"
                    value={payoutAccount}
                    onChange={(e) => setPayoutAccount(e.target.value)}
                    placeholder="رقم الموبايل أو IPA"
                    className="w-full px-3.5 py-2.5 bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] min-h-[42px]"
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
                  className="px-6 py-2.5 bg-[#9a6a35] hover:bg-[#744e26] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
    </div>
  );
};