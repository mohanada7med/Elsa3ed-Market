import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Image as ImageIcon,
  MapPin,
  Tag,
  AlertCircle,
  Save,
  Trash2,
  Upload
} from 'lucide-react';
import { CreatorPhoto, Governorate, PhotoCategory } from '../../types.ts';
import { creatorApi } from '../../services/api.ts';
import { useApp } from '../../context/AppContext.tsx';

interface PhotoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: CreatorPhoto | null;
  onSuccess: (updatedPhoto: CreatorPhoto) => void;
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

const PHOTO_CATEGORIES: { id: PhotoCategory; label: string }[] = [
  { id: 'heritage', label: 'تراث صعيدي وفلكلور' },
  { id: 'crafts', label: 'حرف وصناعات يدوية' },
  { id: 'landmarks', label: 'معالم وآثار تاريخية' },
  { id: 'daily_life', label: 'حياة يومية وعادات' },
  { id: 'festivals', label: 'موالد واحتفالات' },
  { id: 'communities', label: 'مجتمعات وبيئات الصعيد' },
  { id: 'food', label: 'أكلات ومطبخ صعيدي' },
  { id: 'nature', label: 'طبيعة ونيل الصعيد' },
  { id: 'other', label: 'أخرى' }
];

export const PhotoEditModal: React.FC<PhotoEditModalProps> = ({
  isOpen,
  onClose,
  photo,
  onSuccess
}) => {
  const { currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<PhotoCategory>('heritage');
  const [governorate, setGovernorate] = useState<Governorate>('قنا');
  const [location, setLocation] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (photo) {
      setTitle(photo.title || '');
      setCaption(photo.caption || '');
      setCategory((photo.category as PhotoCategory) || 'heritage');
      setGovernorate((photo.governorate as Governorate) || 'قنا');
      setLocation(photo.location || '');
      setTagsStr((photo.tags || []).join(', '));
      setImages(photo.images || []);
      setErrorMsg(null);
    }
  }, [photo]);

  if (!isOpen || !photo) return null;

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      setErrorMsg('يجب أن يحتوي المنشور على صورة واحدة على الأقل');
      return;
    }
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('يرجى إدخال عنوان واضح لألبوم الصور');
      return;
    }

    if (!caption.trim()) {
      setErrorMsg('يرجى كتابة وصف أو قصة معبرة ترافق الصور');
      return;
    }

    if (images.length === 0) {
      setErrorMsg('يجب أن يحتوي المنشور على صورة واحدة على الأقل');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const tags = tagsStr
      .split(/[,،\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    try {
      const updated = await creatorApi.updateCreatorPhoto(currentUser, photo.id, {
        title: title.trim(),
        caption: caption.trim(),
        category,
        governorate,
        location: location.trim() || governorate,
        tags,
        images
      });

      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ التعديلات');
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
        className="relative w-full max-w-2xl bg-white dark:bg-[#1E110A] rounded-2xl sm:rounded-3xl shadow-2xl border border-sand-300 dark:border-[#382317] overflow-hidden my-4 max-h-[92vh] flex flex-col font-cairo"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-sand-200 dark:border-[#2C1A10] flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-[#2A160C] dark:via-[#1E110A] dark:to-[#1E110A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary /10 dark:bg-primary /20 bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-inner">
              <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-espresso dark:text-cream">
                تعديل منشور الصور
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                تحديث بيانات وتفاصيل المنشور التراثي
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-[#2C1A10] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {photo.status === 'rejected' && photo.rejectionReason && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl space-y-1">
              <div className="text-xs font-bold text-rose-800 dark:text-rose-200 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>سبب الرفض السابق من الإدارة:</span>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed pr-5">
                {photo.rejectionReason}
              </p>
            </div>
          )}

          {/* Warning: Re-moderation */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            ⚠️ تنبيه: أي تعديل على المنشور سيؤدي تلقائياً إلى إعادة إرساله لمراجعة الإدارة (قيد المراجعة) للتأكد من المحتوى قبل ظهوره العام.
          </div>

          {/* Current Images */}
          <div>
            <label className="block text-xs font-bold text-espresso dark:text-cream mb-2">
              الصور الحالية ({images.length} صور)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden aspect-square border border-stone-200 dark:border-[#382317] bg-stone-100 dark:bg-[#160B05]"
                >
                  <img
                    src={imgUrl}
                    alt={`Image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-primary  text-white text-[8px] font-bold">
                      الغلاف
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute bottom-1 left-1 p-1 rounded-md bg-black/60 text-white hover:bg-red-600 transition-colors opacity-90 group-hover:opacity-100"
                    title="حذف الصورة"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-espresso dark:text-cream mb-1">
                عنوان الألبوم أو الصورة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] bg-white dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-espresso dark:text-cream mb-1">
                التصنيف التراثي <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PhotoCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] bg-white dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E] appearance-none"
              >
                {PHOTO_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-bold text-espresso dark:text-cream mb-1">
              الوصف أو القصة التراثية <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
              className="w-full p-3 rounded-xl border border-stone-200 dark:border-[#382317] bg-white dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E] resize-none leading-relaxed"
            />
          </div>

          {/* Governorate, Location & Tags */}
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
                المنطقة أو المكان المحدد
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] bg-white dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso dark:text-cream mb-1">
              الهاشتاجات والوسوم
            </label>
            <div className="relative">
              <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] bg-white dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-stone-200 dark:border-[#2C1A10] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#25150C] text-xs font-bold transition-colors disabled:opacity-50"
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
                  <span>جاري حفظ التعديل...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ وإعادة الإرسال للمراجعة</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
