import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import type { MediaItem } from '../../types.ts';
import {
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCw,
  Star,
  ChevronRight,
  ChevronLeft,
  Eye,
  X,
  FileText
} from 'lucide-react';

export interface AdminMediaUploaderProps {
  entityType: string;
  entitySlug?: string;
  entityId?: string;
  entityTitle?: string;
  governorateName?: string;
  value?: string | MediaItem | Array<string | MediaItem>;
  onChange: (value: any) => void;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

export const AdminMediaUploader: React.FC<AdminMediaUploaderProps> = ({
  entityType,
  entitySlug,
  entityId,
  entityTitle = '',
  governorateName = '',
  value,
  onChange,
  multiple = false,
  maxFiles = 10,
  label,
  helperText,
  disabled = false,
  className = ''
}) => {
  const { user } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Active input mode: 'device' (upload) vs 'url' (external link)
  const [activeMode, setActiveMode] = useState<'device' | 'url'>('device');
  const [urlInput, setUrlInput] = useState('');
  const [altInput, setAltInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [replacingMediaId, setReplacingMediaId] = useState<string | null>(null);

  // Normalize initial and incoming value to an array of normalized items
  const normalizeItems = (val: any): Array<{ url: string; item?: MediaItem }> => {
    if (!val) return [];
    if (Array.isArray(val)) {
      return val
        .map((v) => {
          if (!v) return null;
          if (typeof v === 'string') return { url: v };
          return { url: v.secureUrl || v.url || '', item: v };
        })
        .filter((v): v is { url: string; item?: MediaItem } => Boolean(v && v.url));
    }
    if (typeof val === 'string') {
      return val.trim() ? [{ url: val.trim() }] : [];
    }
    if (typeof val === 'object' && (val.secureUrl || val.url)) {
      return [{ url: val.secureUrl || val.url, item: val }];
    }
    return [];
  };

  const currentItems = normalizeItems(value);

  // Smart suggestion for Arabic alt text
  const getSuggestedAlt = () => {
    if (altInput.trim()) return altInput.trim();
    const parts = [entityTitle.trim() || 'معلم تراثي'];
    if (governorateName.trim()) parts.push(governorateName.trim());
    parts.push('منصة وه للتراث');
    return parts.join(' - ');
  };

  // Auto-clear notification messages after 4 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Handle direct file upload to Cloudinary via server API
  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0 || disabled) return;
    setErrorMessage(null);
    setIsUploading(true);
    setUploadProgress(10);
    setUploadStatusText('جاري قراءة وفحص ملفات الصور...');

    try {
      const filesToUpload = Array.from(files);
      const remainingSlots = multiple ? maxFiles - currentItems.length : 1;
      const validFiles = filesToUpload.slice(0, remainingSlots);

      if (validFiles.length === 0) {
        throw new Error(`تم الوصول إلى الحد الأقصى المسموح به (${maxFiles} صور)`);
      }

      const uploadedMediaList: MediaItem[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];

        // Validate client file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(file.type.toLowerCase())) {
          throw new Error(`الملف ${file.name} غير مدعوم. يرجى اختيار صور JPG أو PNG أو WEBP`);
        }

        // Validate client file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`الصورة ${file.name} تتجاوز الحد الأقصى المسموح (10 ميجابايت)`);
        }

        const stepProgress = Math.round(15 + ((i + 1) / validFiles.length) * 75);
        setUploadProgress(stepProgress);
        setUploadStatusText(`جاري رفع وتوثيق صورة ${i + 1} من ${validFiles.length} إلى Cloudinary...`);

        const isFirstImage = currentItems.length === 0 && i === 0;
        const media = await api.uploadAdminMedia(user || {}, {
          file,
          filename: file.name,
          mimeType: file.type,
          entityType,
          entitySlug,
          entityId,
          alt: getSuggestedAlt(),
          isPrimary: !multiple || isFirstImage,
          addToGallery: multiple
        });

        uploadedMediaList.push(media);
      }

      setUploadProgress(100);
      setUploadStatusText('تم رفع وتوثيق الصور بنجاح في السحابة!');

      if (multiple) {
        const newArray = [...currentItems.map((i) => i.item || i.url), ...uploadedMediaList];
        onChange(newArray);
        setSuccessMessage(`تم إضافة ${uploadedMediaList.length} صورة إلى المعرض بنجاح`);
      } else {
        const first = uploadedMediaList[0];
        // Pass the secureUrl string or full MediaItem (backwards compatible)
        onChange(first.secureUrl || first.url);
        setSuccessMessage('تم رفع وتعيين الصورة بنجاح');
      }

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMessage(err?.message || 'فشل في رفع الصورة إلى Cloudinary');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatusText('');
    }
  };

  // Handle external URL submission
  const handleUrlSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim() || disabled) return;
    setErrorMessage(null);

    const cleanUrl = urlInput.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setErrorMessage('يرجى إدخال رابط يبدأ بـ http:// أو https://');
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatusText('جاري التحقق من الرابط وتسجيله...');

      const media = await api.saveAdminMediaUrl(user || {}, {
        url: cleanUrl,
        entityType,
        entitySlug,
        entityId,
        alt: getSuggestedAlt(),
        isPrimary: !multiple || currentItems.length === 0,
        addToGallery: multiple
      });

      if (multiple) {
        onChange([...currentItems.map((i) => i.item || i.url), media]);
        setSuccessMessage('تم إضافة رابط الصورة إلى المعرض بنجاح');
      } else {
        onChange(cleanUrl);
        setSuccessMessage('تم اعتماد رابط الصورة بنجاح');
      }

      setUrlInput('');
    } catch (err: any) {
      setErrorMessage(err?.message || 'فشل في تسجيل رابط الصورة');
    } finally {
      setIsUploading(false);
      setUploadStatusText('');
    }
  };

  // Handle replacing an existing media image
  const triggerReplace = (mediaIdOrUrl: string) => {
    setReplacingMediaId(mediaIdOrUrl);
    if (replaceInputRef.current) {
      replaceInputRef.current.click();
    }
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingMediaId || disabled) return;

    try {
      setIsUploading(true);
      setUploadStatusText('جاري استبدال الصورة في Cloudinary...');
      setErrorMessage(null);

      // Find the item being replaced
      const target = currentItems.find(
        (it) => it.item?.id === replacingMediaId || it.url === replacingMediaId
      );

      let newUrl: string;

      if (target?.item?.id) {
        const replaced = await api.replaceAdminMedia(user || {}, target.item.id, file);
        newUrl = replaced.secureUrl || replaced.url;
      } else {
        // Fallback: upload new and replace in state
        const uploaded = await api.uploadAdminMedia(user || {}, {
          file,
          entityType,
          entitySlug,
          entityId,
          alt: getSuggestedAlt(),
          isPrimary: !multiple
        });
        newUrl = uploaded.secureUrl || uploaded.url;
      }

      if (multiple) {
        const updated = currentItems.map((it) => {
          if (it.item?.id === replacingMediaId || it.url === replacingMediaId) {
            return newUrl;
          }
          return it.item || it.url;
        });
        onChange(updated);
      } else {
        onChange(newUrl);
      }

      setSuccessMessage('تم استبدال الصورة بنجاح');
    } catch (err: any) {
      setErrorMessage(err?.message || 'فشل في استبدال الصورة');
    } finally {
      setIsUploading(false);
      setReplacingMediaId(null);
      setUploadStatusText('');
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  // Handle removing / deleting an image
  const handleRemove = async (urlToRemove: string, itemToRemove?: MediaItem) => {
    if (disabled) return;
    try {
      // If we have a Cloudinary asset ID or public ID, delete from Cloudinary
      if (itemToRemove?.id || itemToRemove?.publicId) {
        try {
          await api.deleteAdminMedia(user || {}, itemToRemove.id || itemToRemove.publicId!);
        } catch (delErr) {
          console.warn('Cloudinary delete warning:', delErr);
        }
      }

      if (multiple) {
        const updated = currentItems
          .filter((it) => it.url !== urlToRemove)
          .map((it) => it.item || it.url);
        onChange(updated);
      } else {
        onChange('');
      }
      setSuccessMessage('تم حذف الصورة');
    } catch (err: any) {
      setErrorMessage(err?.message || 'فشل في حذف الصورة');
    }
  };

  // Set an image as primary in gallery mode
  const handleSetPrimary = (indexToPrimary: number) => {
    if (!multiple || indexToPrimary === 0) return;
    const items = [...currentItems];
    const [selected] = items.splice(indexToPrimary, 1);
    items.unshift(selected);
    onChange(items.map((it) => it.item || it.url));
    setSuccessMessage('تم تعيين الصورة كغلاف رئيسي');
  };

  // Touch-friendly reordering (Move backward / forward in RTL)
  const handleMove = (index: number, direction: 'left' | 'right') => {
    if (!multiple) return;
    const newItems = [...currentItems];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    onChange(newItems.map((it) => it.item || it.url));
  };

  return (
    <div className={`w-full text-right ${className}`} dir="rtl">
      {/* Label and Header */}
      {label && (
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <label className="block text-xs sm:text-sm font-bold text-[#2D2621] dark:text-[#E8E1D9]">
            {label}
            {multiple && (
              <span className="text-[11px] font-normal text-[#8A7E72] dark:text-[#A89D91] mr-1.5">
                ({currentItems.length} من {maxFiles} صور)
              </span>
            )}
          </label>
        </div>
      )}

      {/* Hidden file inputs for direct and replace */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        multiple={multiple}
        onChange={(e) => {
          if (e.target.files) handleFileUpload(e.target.files);
        }}
        className="hidden"
        id="admin-media-file-input"
      />

      <input
        ref={replaceInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={handleReplaceFile}
        className="hidden"
        id="admin-media-replace-input"
      />

      {/* Mode Selector Tabs (Upload vs External URL) */}
      <div className="flex items-center gap-1.5 p-1 bg-[#F3ECE2] dark:bg-[#201A16] rounded-xl mb-3 border border-[#E8E0D5] dark:border-[#382E27] w-full">
        <button
          type="button"
          onClick={() => setActiveMode('device')}
          className={`flex-1 min-h-[40px] px-3 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeMode === 'device'
              ? 'bg-white dark:bg-[#2C241F] text-[#8E422D] dark:text-[#FF8A65] shadow-xs'
              : 'text-[#6B5E52] dark:text-[#A89D91] hover:text-[#2D2621]'
          }`}
        >
          <Upload className="w-4 h-4 shrink-0" />
          <span>رفع من الجهاز</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('url')}
          className={`flex-1 min-h-[40px] px-3 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeMode === 'url'
              ? 'bg-white dark:bg-[#2C241F] text-[#8E422D] dark:text-[#FF8A65] shadow-xs'
              : 'text-[#6B5E52] dark:text-[#A89D91] hover:text-[#2D2621]'
          }`}
        >
          <LinkIcon className="w-4 h-4 shrink-0" />
          <span>رابط صورة خارجي</span>
        </button>
      </div>

      {/* Tab 1: Upload from Device (Drag & Drop + Touch Target) */}
      {activeMode === 'device' && (
        <div className="space-y-2 mb-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files);
            }}
            onClick={() => {
              if (!isUploading && !disabled) fileInputRef.current?.click();
            }}
            className={`w-full border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center transition-all cursor-pointer select-none min-h-[120px] sm:min-h-[140px] flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-[#8E422D] bg-[#8E422D]/10 dark:bg-[#8E422D]/20 scale-[0.99]'
                : 'border-[#D9CFBE] dark:border-[#3D332A] bg-[#FAF6F0] dark:bg-[#231C18] hover:border-[#8E422D] hover:bg-[#F3ECE2] dark:hover:bg-[#2B231E]'
            } ${disabled || isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-[#8E422D] animate-spin" />
                <p className="text-xs sm:text-sm font-bold text-[#2D2621] dark:text-[#E8E1D9]">
                  {uploadStatusText || 'جاري رفع وتوثيق الصورة...'}
                </p>
                {uploadProgress > 0 && (
                  <div className="w-48 bg-[#E8E0D5] dark:bg-[#382E27] h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-[#8E422D] h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#EADCCB] dark:bg-[#362A22] flex items-center justify-center text-[#8E422D] dark:text-[#FF8A65]">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#2D2621] dark:text-[#E8E1D9]">
                    اضغط هنا للاختيار من جهازك أو اسحب الصور إلى هنا
                  </p>
                  <p className="text-[11px] sm:text-xs text-[#7A6E63] dark:text-[#A89D91] mt-0.5">
                    يدعم JPG و PNG و WEBP (الحد الأقصى 10 ميجابايت)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: External Image URL */}
      {activeMode === 'url' && (
        <form onSubmit={handleUrlSubmit} className="space-y-2 mb-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/... أو رابط Cloudinary"
                disabled={disabled || isUploading}
                className="w-full bg-[#FAF6F0] dark:bg-[#231C18] text-xs sm:text-sm rounded-xl px-4 py-3 border border-[#D9CFBE] dark:border-[#3D332A] text-[#2D2621] dark:text-[#E8E1D9] placeholder:text-[#9C8F82] focus:outline-none focus:border-[#8E422D] min-h-[44px]"
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              disabled={disabled || isUploading || !urlInput.trim()}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#8E422D] hover:bg-[#753422] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>اعتماد الرابط</span>
            </button>
          </div>
        </form>
      )}

      {/* Alt Text Input (for SEO & Accessibility) */}
      <div className="mb-3">
        <label className="block text-[11px] sm:text-xs font-semibold text-[#6B5E52] dark:text-[#A89D91] mb-1">
          النص البديل المعبر (Alt Text) للتوثيق ومحركات البحث
        </label>
        <div className="relative">
          <input
            type="text"
            value={altInput}
            onChange={(e) => setAltInput(e.target.value)}
            placeholder={getSuggestedAlt()}
            className="w-full bg-[#FAF6F0] dark:bg-[#231C18] text-xs sm:text-sm rounded-xl px-3.5 py-2 border border-[#D9CFBE] dark:border-[#3D332A] text-[#2D2621] dark:text-[#E8E1D9] placeholder:text-[#9C8F82] focus:outline-none focus:border-[#8E422D] min-h-[40px]"
          />
        </div>
      </div>

      {/* Status Messages */}
      {errorMessage && (
        <div className="p-3 mb-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-red-100 rounded text-red-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3 mb-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="flex-1">{successMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SINGLE IMAGE PREVIEW MODE                                                */}
      {/* ========================================================================= */}
      {!multiple && currentItems.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden border border-[#D9CFBE] dark:border-[#3D332A] bg-[#FAF6F0] dark:bg-[#231C18] p-3">
          <div className="relative w-full aspect-video sm:aspect-21/9 max-h-[220px] rounded-xl overflow-hidden bg-black/5 flex items-center justify-center">
            <img
              src={currentItems[0].url}
              alt={currentItems[0].item?.alt || entityTitle || 'معاينة الصورة'}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800';
              }}
            />

            {/* Cloudinary Badge */}
            {currentItems[0].url.includes('cloudinary.com') && (
              <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-[#8E422D]/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                Cloudinary موثق
              </div>
            )}

            {/* Preview Overlay Button */}
            <button
              type="button"
              onClick={() => setPreviewModalUrl(currentItems[0].url)}
              className="absolute top-2 left-2 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-all"
              title="تكبير ومعاينة الصورة"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Metadata & Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-[#E8E0D5] dark:border-[#332A22]">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#2D2621] dark:text-[#E8E1D9] truncate">
                {currentItems[0].item?.title || currentItems[0].item?.alt || entityTitle || 'صورة الغلاف'}
              </p>
              <p className="text-[10px] text-[#7A6E63] dark:text-[#A89D91] truncate ltr text-right font-mono mt-0.5" dir="ltr">
                {currentItems[0].item?.publicId || currentItems[0].url}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => triggerReplace(currentItems[0].item?.id || currentItems[0].url)}
                disabled={disabled || isUploading}
                className="min-h-[36px] px-3 py-1.5 rounded-lg border border-[#D9CFBE] dark:border-[#3D332A] bg-white dark:bg-[#2B231E] hover:bg-[#F3ECE2] text-[#2D2621] dark:text-[#E8E1D9] text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>استبدال</span>
              </button>

              <button
                type="button"
                onClick={() => handleRemove(currentItems[0].url, currentItems[0].item)}
                disabled={disabled || isUploading}
                className="min-h-[36px] px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GALLERY PREVIEW MODE (Multiple Images)                                   */}
      {/* ========================================================================= */}
      {multiple && currentItems.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentItems.map((img, idx) => (
              <div
                key={img.item?.id || `${img.url}-${idx}`}
                className={`relative rounded-xl overflow-hidden border transition-all ${
                  idx === 0
                    ? 'border-[#8E422D] shadow-xs dark:border-[#FF8A65]/60'
                    : 'border-[#D9CFBE] dark:border-[#3D332A]'
                } bg-[#FAF6F0] dark:bg-[#231C18] p-2 flex flex-col justify-between`}
              >
                {/* Thumbnail */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/5">
                  <img
                    src={img.url}
                    alt={img.item?.alt || `صورة ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Primary Badge */}
                  {idx === 0 && (
                    <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-[#8E422D] text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 fill-current" />
                      <span>رئيسية</span>
                    </div>
                  )}

                  {/* Zoom Preview */}
                  <button
                    type="button"
                    onClick={() => setPreviewModalUrl(img.url)}
                    className="absolute top-1.5 left-1.5 p-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white"
                    title="معاينة"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card Controls & Reordering */}
                <div className="mt-2 pt-2 border-t border-[#E8E0D5] dark:border-[#332A22] flex items-center justify-between gap-1">
                  {/* Reorder Buttons (Touch-friendly for mobile) */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'left')}
                      disabled={idx === 0 || disabled}
                      className="min-w-[32px] min-h-[32px] p-1.5 rounded-md bg-white dark:bg-[#2B231E] border border-[#D9CFBE] dark:border-[#3D332A] text-[#2D2621] dark:text-[#E8E1D9] disabled:opacity-30 flex items-center justify-center"
                      title="تحريك للأمام"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'right')}
                      disabled={idx === currentItems.length - 1 || disabled}
                      className="min-w-[32px] min-h-[32px] p-1.5 rounded-md bg-white dark:bg-[#2B231E] border border-[#D9CFBE] dark:border-[#3D332A] text-[#2D2621] dark:text-[#E8E1D9] disabled:opacity-30 flex items-center justify-center"
                      title="تحريك للخلف"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Actions: Set primary, Replace, Delete */}
                  <div className="flex items-center gap-1">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        disabled={disabled}
                        className="min-h-[32px] px-2 py-1 rounded-md text-[11px] font-bold bg-[#EADCCB] dark:bg-[#362A22] text-[#8E422D] dark:text-[#FF8A65] hover:bg-[#8E422D] hover:text-white transition-all"
                        title="تعيين كصورة رئيسية"
                      >
                        رئيسية
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => triggerReplace(img.item?.id || img.url)}
                      disabled={disabled || isUploading}
                      className="min-w-[32px] min-h-[32px] p-1.5 rounded-md text-[#2D2621] dark:text-[#E8E1D9] hover:bg-black/5"
                      title="استبدال"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(img.url, img.item)}
                      disabled={disabled || isUploading}
                      className="min-w-[32px] min-h-[32px] p-1.5 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper text */}
      {helperText && (
        <p className="text-[11px] text-[#7A6E63] dark:text-[#A89D91] mt-1.5">
          {helperText}
        </p>
      )}

      {/* Image Lightbox Preview Modal */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-[#1F1A16] rounded-2xl p-2 overflow-hidden flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewModalUrl}
              alt="معاينة بالحجم الكامل"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
            <div className="w-full p-2 text-center text-xs text-white/70 truncate ltr" dir="ltr">
              {previewModalUrl}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
