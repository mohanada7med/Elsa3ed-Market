import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  MapPin,
  Tag,
  AlertCircle,
  CheckCircle2,
  Send,
  Layers,
  Sparkles
} from 'lucide-react';
import { CreatorPhoto, Governorate, PhotoCategory } from '../../types.ts';
import { creatorApi } from '../../services/api.ts';
import { useApp } from '../../context/AppContext.tsx';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPhoto: CreatorPhoto) => void;
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

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<PhotoCategory>('heritage');
  const [governorate, setGovernorate] = useState<Governorate>((currentUser?.governorate as Governorate) || 'قنا');
  const [location, setLocation] = useState('');
  const [tagsStr, setTagsStr] = useState('#تراث_الصعيد, #وه_Upper_Egypt');

  // Images state: local previews & base64
  const [selectedImages, setSelectedImages] = useState<{ file?: File; preview: string; base64?: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (selectedImages.length + files.length > 10) {
      setErrorMsg('الحد الأقصى لكل ألبوم أو منشور هو 10 صور فقط');
      return;
    }

    setErrorMsg(null);

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg(`الصورة "${file.name}" حجمها كبير جداً، الحد الأقصى 8 ميجابايت`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = evt.target?.result as string;
        setSelectedImages((prev) => [
          ...prev,
          {
            file,
            preview: result,
            base64: result
          }
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== index));
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

    if (selectedImages.length === 0) {
      setErrorMsg('يرجى اختيار صورة واحدة على الأقل لنشرها');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);
    setErrorMsg(null);

    try {
      // 1. Upload images to Cloudinary via backend
      const imagesToUpload = selectedImages.map((img) => img.base64 || img.preview);
      setUploadProgress(40);
      const uploadRes = await creatorApi.uploadCreatorImages(currentUser, imagesToUpload);
      const uploadedUrls = uploadRes.urls;
      setUploadProgress(80);

      if (!uploadedUrls || uploadedUrls.length === 0) {
        throw new Error('فشل حفظ الصور على السحابة، يرجى المحاولة مرة أخرى');
      }

      // 2. Parse hashtags
      const tags = tagsStr
        .split(/[,،\s]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .map((t) => (t.startsWith('#') ? t : `#${t}`));

      // 3. Create photo document
      const newPhoto = await creatorApi.createCreatorPhoto(currentUser, {
        title: title.trim(),
        caption: caption.trim(),
        images: uploadedUrls,
        category,
        governorate,
        location: location.trim() || governorate,
        tags
      });

      setUploadProgress(100);
      onSuccess(newPhoto);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء نشر ألبوم الصور، يرجى المحاولة مرة أخرى');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-3xl bg-white dark:bg-[#1E110A] rounded-2xl sm:rounded-3xl shadow-2xl border border-sand-300 dark:border-[#382317] overflow-hidden my-4 max-h-[92vh] flex flex-col font-cairo"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-sand-200 dark:border-[#2C1A10] flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-[#2A160C] dark:via-[#1E110A] dark:to-[#1E110A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary /10 dark:bg-primary /20 bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-inner">
              <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-espresso dark:text-cream">
                  نشر صور ومعارض تراثية جديدة
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-primary  text-white text-[10px] font-bold">
                  وه Gallery
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                انشر صوراً توثيقية لمعالم، حرف، بيئات، ووجوه الصعيد الأصيلة
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

          {/* Upload Progress Banner */}
          {isUploading && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-200">
                <span>جاري رفع وتأمين الصور على السحابة...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-amber-200 dark:bg-amber-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary  h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Image Picker Dropzone & Previews */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-espresso dark:text-cream">
              الصور التراثية (حتى 10 صور في الألبوم) <span className="text-red-500">*</span>
            </label>

            {selectedImages.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 dark:border-[#382317] hover:border-[#E66A2E] dark:hover:border-[#E66A2E] rounded-2xl p-8 text-center cursor-pointer transition-colors bg-stone-50 dark:bg-[#160B05] hover:bg-stone-100/50 dark:hover:bg-[#201007]"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 bg-primary hover:bg-primary-hover text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="text-sm font-bold text-espresso dark:text-cream mb-1">
                  اضغط لاختيار الصور أو اسحبها هنا
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  يدعم صيغ JPG، PNG، WEBP بجودة عالية حتى 8 ميجابايت للصورة الواحدة
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {selectedImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-xl overflow-hidden aspect-square border border-stone-200 dark:border-[#382317] bg-stone-100 dark:bg-[#160B05] shadow-sm"
                    >
                      <img
                        src={img.preview}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-primary  text-white text-[9px] font-bold shadow">
                          الغلاف
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute bottom-1.5 left-1.5 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-600 transition-colors opacity-90 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {selectedImages.length < 10 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-stone-300 dark:border-[#382317] hover:border-[#E66A2E] flex flex-col items-center justify-center gap-1.5 text-stone-500 hover:bg-primary hover:bg-primary-hover text-white bg-stone-50 dark:bg-[#160B05] transition-colors cursor-pointer"
                    >
                      <Upload className="w-5 h-5" />
                      <span className="text-[11px] font-bold">إضافة صورة</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span>تم تحديد {selectedImages.length} من 10 صور</span>
                  <span>الصورة الأولى هي الغلاف الرئيسي للألبوم</span>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesSelected}
              className="hidden"
            />
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
                placeholder="مثال: بيوت النوبة الملونة في غرب سهيل"
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

          {/* Caption / Story */}
          <div>
            <label className="block text-xs font-bold text-espresso dark:text-cream mb-1">
              الوصف أو القصة التراثية <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="احكِ قصة هذه الصورة، المكان، أصول الصنعة، أو العادة الصعيدية التي توثقها..."
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
                placeholder="مثال: معبد فيلة، قرية القرنة، جزيرة هيسا..."
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
                placeholder="#النوبة، #أسوان، #بيوت_ملونة"
                className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] bg-white dark:bg-[#160B05] text-espresso dark:text-cream text-xs focus:outline-none focus:ring-2 focus:ring-[#E66A2E]"
              />
            </div>
          </div>

          {/* Moderation notice */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            💡 ملاحظة هامة: يخضع المحتوى لمراجعة فريق التحرير الإداري لمنصة وه قبل ظهوره في المعرض العام للتأكد من جودته ومطابقته للهوية التراثية لصعيد مصر.
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-stone-200 dark:border-[#2C1A10] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-[#382317] text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#25150C] text-xs font-bold transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isUploading || selectedImages.length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-[#E66A2E] to-[#C95318] hover:from-[#D4591F] hover:to-[#B6450E] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري الرفع والنشر...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>إرسال للمراجعة والنشر</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
