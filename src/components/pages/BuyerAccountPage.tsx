import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
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
  AlertCircle
} from 'lucide-react';
import { Governorate } from '../../types';

export const BuyerAccountPage: React.FC = () => {
  const {
    currentUser,
    currentRole,
    orders,
    favorites,
    setActivePage,
    addToast,
    uploadProfileImage,
    removeProfileImage,
    setIsAuthModalOpen,
    setAuthModalTab
  } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '01012345678');
  const [governorate, setGovernorate] = useState<Governorate>(
    (currentUser.governorate as Governorate) || 'قنا'
  );

  // Profile image upload state
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
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('تم حفظ البيانات', 'تم تحديث بيانات حسابك وعنوانك بنجاح', 'success');
  };

  const DEFAULT_USER_AVATAR = 'https://res.cloudinary.com/kuana1nl/image/upload/v1787924812/user.jpg';
  const hasCustomImage = Boolean(
    currentUser.profileImage?.secureUrl ||
    (currentUser.avatar &&
      currentUser.avatar !== DEFAULT_USER_AVATAR &&
      !currentUser.avatar.includes('v1787924812/user.jpg') &&
      !currentUser.avatar.includes('photo-1535713875002') &&
      !currentUser.avatar.includes('photo-1472099645785'))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#8c6b53]">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#943310] transition-colors"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="text-gray-900 font-bold">الملف الشخصي وإعدادات الحساب</span>
      </nav>

      {/* Account Overview Header */}
      <div className="bg-white rounded-3xl border border-[#ebdccd] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-5">
            {/* User Avatar with Cloudinary Integration */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#943310] text-white flex items-center justify-center font-black text-3xl font-heritage shadow-md border-2 border-[#ebdccd]">
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
                className="absolute -bottom-1 -left-1 p-2 bg-[#943310] hover:bg-[#78280b] text-white rounded-xl shadow-md transition-transform hover:scale-105 min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{currentUser.name}</h1>
                <span className="bg-amber-100 text-[#943310] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {currentUser.role === 'admin'
                    ? 'مدير المنصة'
                    : currentUser.role === 'seller'
                    ? 'ورشة معتمدة'
                    : 'متسوق موثق'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{currentUser.email}</p>

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
                  className="px-3 py-1.5 bg-[#faf6f0] hover:bg-[#ebdccd] border border-[#dfcebe] text-gray-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5 text-[#943310]" />
                  <span>{isUploadingImage ? 'جاري الرفع...' : 'تغيير الصورة'}</span>
                </button>

                {hasCustomImage && (
                  <button
                    type="button"
                    id="remove-profile-image-btn"
                    onClick={handleRemoveProfileImage}
                    disabled={isUploadingImage || isRemovingImage}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isRemovingImage ? 'جاري الحذف...' : 'حذف الصورة'}</span>
                  </button>
                )}
              </div>

              {/* Error Message */}
              {imageError && (
                <div className="mt-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
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
              className="p-3 rounded-2xl bg-[#faf6f0] border border-[#ebdccd] hover:border-[#943310] transition-all text-center"
            >
              <div className="flex items-center justify-center gap-1 text-[#943310] font-bold text-base">
                <Package className="w-4 h-4" />
                <span>{orders.length}</span>
              </div>
              <span className="text-[10px] text-gray-500">طلبات سابقة</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('favorites')}
              className="p-3 rounded-2xl bg-[#faf6f0] border border-[#ebdccd] hover:border-[#943310] transition-all text-center"
            >
              <div className="flex items-center justify-center gap-1 text-rose-600 font-bold text-base">
                <Heart className="w-4 h-4 fill-rose-600" />
                <span>{favorites.length}</span>
              </div>
              <span className="text-[10px] text-gray-500">قطع في المفضلة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Settings Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-[#ebdccd] p-6 sm:p-8 shadow-xs space-y-5">
            <h3 className="font-bold text-base text-gray-900 border-b border-[#f0e4d7] pb-3">
              البيانات الشخصية وعنوان التوصيل الافتراضي
            </h3>

            {/* Username display (read-only for security) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">اسم المستخدم</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  disabled
                  value={currentUser.username || 'غير محدد'}
                  className="w-full pl-3 pr-10 py-3 bg-gray-100/80 border border-[#dfcebe] rounded-xl text-sm outline-none text-gray-600 min-h-[44px] cursor-not-allowed font-medium"
                />
                <User className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
              </div>
              <span className="text-[11px] text-gray-500 mt-1 block">
                اسم المستخدم ثابت ومخصص لتسجيل الدخول بأمان لحسابك.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الاسم الكامل</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-3 pr-10 py-3 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310] min-h-[44px]"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  البريد الإلكتروني <span className="text-gray-400 font-normal">(اختياري)</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com (اختياري)"
                    className="w-full pl-3 pr-10 py-3 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310] min-h-[44px]"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">رقم الهاتف</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-3 pr-10 py-3 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310] min-h-[44px]"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">المحافظة</label>
                <div className="relative">
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value as Governorate)}
                    className="w-full px-3.5 py-3 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310] min-h-[44px] cursor-pointer"
                  >
                    <option value="القاهرة">القاهرة</option>
                    <option value="الجيزة">الجيزة</option>
                    <option value="الإسكندرية">الإسكندرية</option>
                    <option value="قنا">قنا</option>
                    <option value="سوهاج">سوهاج</option>
                    <option value="أسوان">أسوان</option>
                    <option value="الأقصر">الأقصر</option>
                    <option value="أسيوط">أسيوط</option>
                    <option value="المنيا">المنيا</option>
                    <option value="بني سويف">بني سويف</option>
                    <option value="الوادي الجديد">الوادي الجديد</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#943310] hover:bg-[#7c280a] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              <span>حفظ التعديلات</span>
            </button>
          </form>
        </div>

        {/* Sidebar Shortcut Options */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#faf6f0] p-6 rounded-3xl border border-[#ebdccd] space-y-3 text-right">
            <h4 className="font-bold text-xs text-gray-900">هل تمتلك ورشة حرفية في الصعيد؟</h4>
            <p className="text-xs text-[#8c6b53] leading-relaxed">
              يمكنك التبديل إلى حساب بائع حرفي لعرض منتجاتك، متابعة طلبات العملاء، واستلام مستحقاتك المالية عبر فودافون كاش أو إنستاباي.
            </p>
            <button
              type="button"
              onClick={() => {
                if (currentRole === 'seller') {
                  setActivePage('seller-dashboard');
                } else {
                  setAuthModalTab('register');
                  setIsAuthModalOpen(true);
                }
              }}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Store className="w-4 h-4" />
              <span>{currentRole === 'seller' ? 'الدخول إلى لوحة البائع الحرفي' : 'تسجيل حساب ورشة حرفية'}</span>
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#ebdccd] text-xs text-gray-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4" />
              <span>حماية البيانات والخصوصية</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              بياناتك وعناوين الشحن مشفرة ومحمية وفق أعلى معايير الأمان المعتمدة في منصة سوق الصعيد.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
