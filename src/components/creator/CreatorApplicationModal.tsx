import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Camera,
  Sparkles,
  MapPin,
  Send,
  AlertCircle,
  CheckCircle2,
  Instagram,
  Youtube,
  Globe,
  Phone,
  Mail,
  User,
  Film
} from 'lucide-react';
import { Governorate } from '../../types.ts';
import { creatorApi } from '../../services/api.ts';
import { useApp } from '../../context/AppContext.tsx';

interface CreatorApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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

const SPECIALTY_OPTIONS = [
  'معالم وآثار الصعيد',
  'حرف وصناعات يدوية',
  'فلكلور وموالد وتراث',
  'مأكولات وأكلات صعيدية',
  'حكايات ناس الصعيد وعاداتهم',
  'طبيعة ونيل الصعيد',
  'تصوير فوتوغرافي وتوثيقي',
  'موسيقى وفنون شعبية'
];

export const CreatorApplicationModal: React.FC<CreatorApplicationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser, setCurrentUser, addToast } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState('');
  const [governorate, setGovernorate] = useState<Governorate>((currentUser?.governorate as Governorate) || 'قنا');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [specialties, setSpecialties] = useState<string[]>(['معالم وآثار الصعيد']);
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [previousRejectionReason, setPreviousRejectionReason] = useState<string | null>(null);

  // Social links
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [facebook, setFacebook] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setName(currentUser?.name || '');
    setGovernorate((currentUser?.governorate as Governorate) || 'قنا');
    setPhone(currentUser?.phone || '');
    setEmail(currentUser?.email || '');
    setAvatar(currentUser?.avatar || '');
    setPreviousRejectionReason(null);

    if (currentUser?.id && currentUser.id !== 'guest-visitor') {
      creatorApi
        .getCreatorStatus(currentUser)
        .then((res) => {
          if (res?.creator) {
            const c = res.creator;
            setName(c.name || currentUser?.name || '');
            setBio(c.bio || '');
            setGovernorate((c.governorate as Governorate) || (currentUser?.governorate as Governorate) || 'قنا');
            setCity(c.city || '');
            setPhone(c.phone || currentUser?.phone || '');
            setEmail(c.email || currentUser?.email || '');
            setAvatar(c.avatar || currentUser?.avatar || '');
            if (Array.isArray(c.specialties) && c.specialties.length > 0) {
              setSpecialties(c.specialties);
            }
            setInstagram(c.socialLinks?.instagram || '');
            setYoutube(c.socialLinks?.youtube || '');
            setTiktok(c.socialLinks?.tiktok || '');
            setFacebook(c.socialLinks?.facebook || '');
            if (c.status === 'rejected' && c.rejectionReason) {
              setPreviousRejectionReason(c.rejectionReason);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen, currentUser?.id]);

  if (!isOpen) return null;

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('الحد الأقصى لحجم الصورة هو 5 ميجابايت');
      return;
    }

    setIsUploadingAvatar(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const base64 = evt.target?.result as string;
        const uploadRes = await creatorApi.uploadCreatorImage(currentUser, base64, file.name, 'users');
        setAvatar(uploadRes.url);
      } catch (err: any) {
        setErrorMsg(err.message || 'فشل رفع الصورة الشخصية');
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleSpecialty = (spec: string) => {
    setSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const handleAddCustomSpecialty = () => {
    const trimmed = customSpecialty.trim();
    if (trimmed && !specialties.includes(trimmed)) {
      setSpecialties((prev) => [...prev, trimmed]);
      setCustomSpecialty('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('يرجى كتابة الاسم بالكامل أو الاسم الفني');
      return;
    }
    if (!bio.trim() || bio.trim().length < 20) {
      setErrorMsg('يرجى كتابة نبذة تعريفية لا تقل عن 20 حرفاً توضح أسلوبك ورؤيتك لتوثيق الصعيد');
      return;
    }
    if (!city.trim()) {
      setErrorMsg('يرجى كتابة المدينة أو المنطقة التي تركز عليها');
      return;
    }
    if (specialties.length === 0) {
      setErrorMsg('يرجى اختيار تخصص واحد على الأقل للمحتوى');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const created = await creatorApi.applyForCreator(currentUser, {
        name: name.trim(),
        avatar: avatar.trim() || currentUser?.avatar,
        bio: bio.trim(),
        governorate,
        city: city.trim(),
        specialties,
        socialLinks: {
          instagram: instagram.trim() || undefined,
          youtube: youtube.trim() || undefined,
          tiktok: tiktok.trim() || undefined,
          facebook: facebook.trim() || undefined
        },
        phone: phone.trim() || currentUser?.phone,
        email: email.trim() || currentUser?.email
      });

      const msg = 'تم تقديم طلبك بنجاح! سيتم مراجعة طلبك وتدقيقه من قبل فريق إدارة منصة وه، وستتلقى إشعاراً بنتيجة الاعتماد.';
      setSuccessMsg(msg);
      addToast('تم إرسال طلب صانع المحتوى', 'سيتلقى فريق الإدارة طلبك ويخطرك فور المراجعة', 'success');

      if (setCurrentUser) {
        setCurrentUser((prev) => ({
          ...prev,
          role: 'creator',
          creatorId: created.id,
          creatorStatus: 'pending'
        }));
      }
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء تقديم الطلب، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-white dark:bg-[#1E110A] rounded-2xl sm:rounded-3xl shadow-2xl border border-sand-300 dark:border-[#382317] overflow-hidden my-4 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-sand-200 dark:border-[#2C1A10] flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-[#2A160C] dark:via-[#1E110A] dark:to-[#1E110A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-espresso dark:text-cream font-cairo">
                  انضم كصانع محتوى في منصة وه
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
                  صانع محتوى
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-cairo">
                وثّق تراث الصعيد ومعالمه وفنونه بعدستك وشاركها مع العالم
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-[#2C1A10] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 font-cairo">
          {previousRejectionReason && !errorMsg && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1 text-xs text-amber-800 dark:text-amber-300">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>ملاحظات الإدارة على طلبك السابق (يمكنك التعديل وإعادة التقديم):</span>
              </div>
              <p className="leading-relaxed pr-5">{previousRejectionReason}</p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-espresso dark:text-cream">تم استلام طلبك بنجاح!</h3>
              <p className="text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto leading-relaxed">
                {successMsg}
              </p>
            </div>
          ) : (
            <>
              {/* Profile Picture */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-2xl bg-stone-50 dark:bg-[#25150C] border border-stone-200 dark:border-[#382317]">
                <div className="relative group">
                  <img
                    src={avatar || currentUser?.avatar || 'https://res.cloudinary.com/kuana1nl/image/upload/v1788710904/user.jpg'}
                    alt="Avatar"
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white dark:border-[#382317] shadow-md"
                  />
                  <label className="absolute inset-0 rounded-2xl bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-5 h-5" />
                    <span className="text-[10px] mt-1 font-bold">تغيير</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-center sm:text-right space-y-1">
                  <div className="text-xs font-bold text-espresso dark:text-cream">
                    صورة صانع المحتوى
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    الصورة ستظهر في حسابك العام ومع كل فيديو وصورة تنشرها. اضغط على الصورة لتحديثها.
                  </p>
                  {isUploadingAvatar && (
                    <span className="text-[11px] text-primary font-bold block animate-pulse">
                      جاري رفع الصورة إلى السحابة...
                    </span>
                  )}
                </div>
              </div>

              {/* Name & Bio */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-espresso dark:text-cream mb-1">
                    الاسم بالكامل أو الاسم الفني <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: أحمد الصعيدي - حكايات الأقصر"
                      required
                      className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] bg-white dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-espresso dark:text-cream mb-1">
                    نبذة تعريفية ورؤيتك لتوثيق الصعيد <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="اكتب نبذة عن اهتمامك بالصعيد وتجربتك في التصوير والتوثيق، وما تنوي نشره على وه..."
                    required
                    className="w-full p-3 rounded-xl border border-stone-200 dark:border-[#382317] bg-white dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E] resize-none leading-relaxed"
                  />
                  <div className="text-[10px] text-stone-400 text-left mt-0.5">
                    {bio.length} حرف (20 حرف على الأقل)
                  </div>
                </div>
              </div>

              {/* Governorate & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-espresso dark:text-cream mb-1">
                    المحافظة <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value as Governorate)}
                      className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] bg-white dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E] appearance-none"
                    >
                      {GOVERNORATES.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-espresso dark:text-cream mb-1">
                    المدينة أو المنطقة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="مثال: إسنا، نقادة، دندرة، النوبة..."
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] bg-white dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E]"
                  />
                </div>
              </div>

              {/* Content Specialties */}
              <div>
                <label className="block text-xs font-bold text-espresso dark:text-cream mb-2">
                  مجالات وتخصصات المحتوى <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {SPECIALTY_OPTIONS.map((spec) => {
                    const isSelected = specialties.includes(spec);
                    return (
                      <button
                        type="button"
                        key={spec}
                        onClick={() => toggleSpecialty(spec)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${isSelected
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-stone-100 dark:bg-[#25150C] text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-[#2F1C10]'
                          }`}
                      >
                        {isSelected && '✓ '}
                        {spec}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSpecialty}
                    onChange={(e) => setCustomSpecialty(e.target.value)}
                    placeholder="إضافة تخصص آخر..."
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 dark:border-[#382317] bg-white dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSpecialty();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSpecialty}
                    className="px-4 py-2 bg-stone-200 dark:bg-[#25150C] hover:bg-stone-300 dark:hover:bg-[#2F1C10] text-xs font-bold text-espresso dark:text-cream rounded-xl transition-colors"
                  >
                    إضافة
                  </button>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-espresso dark:text-cream">
                  روابط حساباتك السابقة على السوشيال ميديا (اختياري)
                </label>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  تساعدنا هذه الروابط على سرعة التحقق من أعمالك وتوثيق حسابك
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="relative">
                    <Instagram className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="Instagram username / رابط"
                      className="w-full pr-9 pl-3 py-2 rounded-xl border border-stone-200 dark:border-[#382317] bg-white dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E]"
                      dir="ltr"
                    />
                  </div>

                  <div className="relative">
                    <Youtube className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                    <input
                      type="text"
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                      placeholder="YouTube channel / رابط"
                      className="w-full pr-9 pl-3 py-2 rounded-xl border border-stone-200 dark:border-[#382317] bg-white dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E]"
                      dir="ltr"
                    />
                  </div>

                  <div className="relative">
                    <Film className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-700 dark:text-stone-300" />
                    <input
                      type="text"
                      value={tiktok}
                      onChange={(e) => setTiktok(e.target.value)}
                      placeholder="TikTok username / رابط"
                      className="w-full pr-9 pl-3 py-2 rounded-xl border border-stone-200 dark:border-[#382317] bg-white dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E]"
                      dir="ltr"
                    />
                  </div>

                  <div className="relative">
                    <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                    <input
                      type="text"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      placeholder="Facebook page / رابط"
                      className="w-full pr-9 pl-3 py-2 rounded-xl border border-stone-200 dark:border-[#382317] bg-white dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E]"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-espresso dark:text-cream mb-1">
                    رقم الهاتف للتواصل <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      required
                      className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] bg-white dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E]"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-espresso dark:text-cream mb-1">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] bg-white dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E]"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-stone-200 dark:border-[#2C1A10] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#25150C] text-xs font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#E66A2E] to-[#C95318] hover:from-[#D4591F] hover:to-[#B6450E] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>جاري إرسال الطلب...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>تقديم طلب الانضمام</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
};
