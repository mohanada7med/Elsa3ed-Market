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
  FileText,
  ShieldAlert,
  Check,
  Sparkles,
  Info,
  Video,
  Play
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
  mediaCategory?: 'all' | 'image' | 'video';
  onEntityGalleryChange?: (action: 'add' | 'remove' | 'setCover', url: string) => void;
}

interface StagedFile {
  id: string;
  file: File;
  localPreviewUrl: string;
  alt: string;
  caption: string;
  sizeBytes: number;
  format: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  isVideo?: boolean;
}

interface StagedReplacement {
  targetIdOrUrl: string;
  targetCurrentUrl: string;
  file: File;
  localPreviewUrl: string;
  alt?: string;
  caption?: string;
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
  className = '',
  mediaCategory = 'all',
  onEntityGalleryChange
}) => {
  const { currentUser, currentRole } = useApp();
  const isAdmin = currentRole === 'admin';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Active input mode: 'device' (upload) vs 'url' (external link)
  const [activeMode, setActiveMode] = useState<'device' | 'url'>('device');
  const [urlInput, setUrlInput] = useState('');
  const [altInput, setAltInput] = useState('');
  const [captionInput, setCaptionInput] = useState('');

  // Staging area for pre-save local preview
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [stagedReplacement, setStagedReplacement] = useState<StagedReplacement | null>(null);

  // Global upload / action states
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  // Clean up object URLs when unmounting or changing staged files
  useEffect(() => {
    return () => {
      stagedFiles.forEach((sf) => URL.revokeObjectURL(sf.localPreviewUrl));
      if (stagedReplacement) {
        URL.revokeObjectURL(stagedReplacement.localPreviewUrl);
      }
    };
  }, [stagedFiles, stagedReplacement]);

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
  const getSuggestedAlt = (customTitle?: string) => {
    if (altInput.trim()) return altInput.trim();
    const targetTitle = customTitle || entityTitle.trim() || 'توثيق تراثي';
    const parts = [targetTitle];
    if (governorateName.trim()) parts.push(governorateName.trim());
    parts.push('منصة وه للتراث الرقمي');
    return parts.join(' - ');
  };

  // Auto-clear notification messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // 1. When files are picked or dropped from device: Stage with instant local preview before saving!
  const handleFilesSelected = (files: FileList | File[]) => {
    if (!isAdmin) {
      setErrorMessage('عفواً، ميزة رفع الوسائط مخصصة لمدراء منصة وه فقط');
      return;
    }
    if (!files || files.length === 0 || disabled) return;
    setErrorMessage(null);

    const allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const allowedVideoMimes = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/ogg',
      'video/x-matroska',
      'video/3gpp',
      'video/x-msvideo'
    ];

    const filesArray = Array.from(files);
    const remainingSlots = multiple ? maxFiles - currentItems.length : 1;
    const selected = filesArray.slice(0, remainingSlots);

    if (selected.length === 0) {
      setErrorMessage(`تم الوصول إلى الحد الأقصى المسموح به (${maxFiles} ملفات)`);
      return;
    }

    const newStaged: StagedFile[] = [];

    for (const file of selected) {
      const isVideo =
        file.type.startsWith('video/') ||
        allowedVideoMimes.includes(file.type.toLowerCase()) ||
        Boolean(file.name.match(/\.(mp4|webm|mov|ogg|mkv|3gp|avi)$/i));

      if (mediaCategory === 'image' && isVideo) {
        setErrorMessage(`الملف "${file.name}" هو مقطع فيديو، وهذا الحقل مخصص للصور فقط.`);
        return;
      }
      if (mediaCategory === 'video' && !isVideo) {
        setErrorMessage(`الملف "${file.name}" ليس مقطع فيديو صالح. الصيغ المقبولة للفيديو: MP4, WebM, MOV.`);
        return;
      }

      if (isVideo) {
        if (file.size > 150 * 1024 * 1024) {
          setErrorMessage(`مقطع الفيديو "${file.name}" يتجاوز الحد الأقصى المسموح به (150 ميجابايت)`);
          return;
        }
      } else {
        if (!allowedImageMimes.includes(file.type.toLowerCase())) {
          setErrorMessage(`الملف "${file.name}" غير مدعوم. الصيغ المقبولة للصور: JPG, PNG, WEBP وللفيديو: MP4, WebM`);
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          setErrorMessage(`الصورة "${file.name}" تتجاوز الحد الأقصى المسموح به (10 ميجابايت)`);
          return;
        }
      }

      const localUrl = URL.createObjectURL(file);
      const ext = file.name.split('.').pop()?.toUpperCase() || (isVideo ? 'VIDEO' : 'IMG');

      newStaged.push({
        id: `staged-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        file,
        localPreviewUrl: localUrl,
        alt: getSuggestedAlt(file.name.replace(/\.[^/.]+$/, '')),
        caption: captionInput.trim(),
        sizeBytes: file.size,
        format: ext,
        progress: 0,
        status: 'pending',
        isVideo
      });
    }

    setStagedFiles(newStaged);
  };

  // Discard staged files
  const cancelStaging = () => {
    stagedFiles.forEach((sf) => URL.revokeObjectURL(sf.localPreviewUrl));
    setStagedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Execute upload of staged files to Cloudinary via server API
  const executeStagedUpload = async () => {
    if (stagedFiles.length === 0 || isUploading || disabled) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const uploadedResults: MediaItem[] = [];

      for (let i = 0; i < stagedFiles.length; i++) {
        const item = stagedFiles[i];

        // Update item status to uploading
        setStagedFiles((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, status: 'uploading', progress: 5 } : p))
        );

        const isFirstImage = currentItems.length === 0 && i === 0;
        const isVideo = item.isVideo || item.file.type.startsWith('video/');

        const uploadedMedia = await api.uploadAdminMedia(
          currentUser || {},
          {
            file: item.file,
            filename: item.file.name,
            mimeType: item.file.type,
            resourceType: isVideo ? 'video' : 'image',
            entityType: isVideo ? 'video' : entityType,
            entitySlug,
            entityId,
            alt: item.alt || getSuggestedAlt(),
            caption: item.caption,
            isPrimary: !multiple || isFirstImage,
            addToGallery: multiple && !isVideo
          },
          (progressPercent) => {
            setStagedFiles((prev) =>
              prev.map((p, idx) => (idx === i ? { ...p, progress: progressPercent } : p))
            );
          }
        );

        uploadedResults.push(uploadedMedia);

        setStagedFiles((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, status: 'success', progress: 100 } : p))
        );
      }

      // Commit to parent component
      if (multiple) {
        const newArray = [...currentItems.map((it) => it.item || it.url), ...uploadedResults];
        onChange(newArray);
        setSuccessMessage(`تم رفع وتوثيق ${uploadedResults.length} وسيط بنجاح في السحابة`);
      } else {
        const first = uploadedResults[0];
        onChange(first.secureUrl || first.url);
        setSuccessMessage('تم رفع وتوثيق الوسيط بنجاح في السحابة');
      }

      // Cleanup staging
      stagedFiles.forEach((sf) => URL.revokeObjectURL(sf.localPreviewUrl));
      setStagedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      console.error('Upload execution failed:', err);
      setErrorMessage(err?.message || 'فشل في رفع وتوثيق الصورة إلى Cloudinary');
    } finally {
      setIsUploading(false);
    }
  };

  // 2. Handle External URL submission (Backward compatibility)
  const handleUrlSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAdmin) {
      setErrorMessage('عفواً، اعتماد وحفظ الصور مخصص لمدراء المنصة فقط');
      return;
    }
    if (!urlInput.trim() || disabled || isUploading) return;
    setErrorMessage(null);

    const cleanUrl = urlInput.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setErrorMessage('يرجى إدخال رابط يبدأ بـ http:// أو https://');
      return;
    }

    try {
      setIsUploading(true);

      const media = await api.saveAdminMediaUrl(currentUser || {}, {
        url: cleanUrl,
        entityType,
        entitySlug,
        entityId,
        alt: getSuggestedAlt(),
        caption: captionInput.trim(),
        isPrimary: !multiple || currentItems.length === 0,
        addToGallery: multiple
      });

      if (multiple) {
        onChange([...currentItems.map((i) => i.item || i.url), media]);
        setSuccessMessage('تم اعتماد وحفظ رابط الصورة في المعرض');
      } else {
        onChange(cleanUrl);
        setSuccessMessage('تم اعتماد رابط الصورة بنجاح');
      }

      setUrlInput('');
    } catch (err: any) {
      setErrorMessage(err?.message || 'فشل في تسجيل رابط الصورة');
    } finally {
      setIsUploading(false);
    }
  };

  // 3. Handle image replacement flow with pre-replacement staging
  const triggerReplacePicker = (mediaIdOrUrl: string, currentUrl: string) => {
    if (!isAdmin) {
      setErrorMessage('عفواً، استبدال الصور مخصص لمدراء المنصة فقط');
      return;
    }
    setStagedReplacement({
      targetIdOrUrl: mediaIdOrUrl,
      targetCurrentUrl: currentUrl,
      file: null as any,
      localPreviewUrl: ''
    });
    if (replaceInputRef.current) {
      replaceInputRef.current.click();
    }
  };

  const handleReplacementFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !stagedReplacement || disabled) return;

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedMimes.includes(file.type.toLowerCase())) {
      setErrorMessage(`الملف "${file.name}" غير مدعوم. الصيغ المقبولة: JPG و PNG و WEBP`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('حجم الصورة البديلة يتجاوز الحد المسموح (10 ميجابايت)');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setStagedReplacement((prev) => (prev ? { ...prev, file, localPreviewUrl: localUrl } : null));
  };

  const confirmReplacement = async () => {
    if (!stagedReplacement || !stagedReplacement.file || isUploading || disabled) return;
    setIsUploading(true);
    setErrorMessage(null);

    const { targetIdOrUrl, file } = stagedReplacement;

    try {
      // Find the existing media item
      const target = currentItems.find(
        (it) => it.item?.id === targetIdOrUrl || it.url === targetIdOrUrl
      );

      let newUrl: string;

      if (target?.item?.id) {
        const replaced = await api.replaceAdminMedia(currentUser || {}, target.item.id, file);
        newUrl = replaced.secureUrl || replaced.url;
      } else {
        // Safe upload of replacement image
        const uploaded = await api.uploadAdminMedia(currentUser || {}, {
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
          if (it.item?.id === targetIdOrUrl || it.url === targetIdOrUrl) {
            return newUrl;
          }
          return it.item || it.url;
        });
        onChange(updated);
      } else {
        onChange(newUrl);
      }

      setSuccessMessage('تم استبدال الصورة بنجاح وحذف السابقة بأمان');
      URL.revokeObjectURL(stagedReplacement.localPreviewUrl);
      setStagedReplacement(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    } catch (err: any) {
      setErrorMessage(err?.message || 'فشل في استبدال الصورة في السحابة');
    } finally {
      setIsUploading(false);
    }
  };

  const cancelReplacement = () => {
    if (stagedReplacement?.localPreviewUrl) {
      URL.revokeObjectURL(stagedReplacement.localPreviewUrl);
    }
    setStagedReplacement(null);
    if (replaceInputRef.current) replaceInputRef.current.value = '';
  };

  // 4. Handle Delete image with Cloudinary & DB destruction
  const handleRemove = async (urlToRemove: string, itemToRemove?: MediaItem) => {
    if (!isAdmin) {
      setErrorMessage('عفواً، حذف الصور مخصص لمدراء المنصة فقط');
      return;
    }
    if (disabled || isUploading) return;

    try {
      setIsUploading(true);

      if (itemToRemove?.id || itemToRemove?.publicId) {
        try {
          await api.deleteAdminMedia(currentUser || {}, itemToRemove.id || itemToRemove.publicId!);
        } catch (delErr: any) {
          console.warn('Cloudinary delete warning:', delErr?.message || delErr);
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

      setSuccessMessage('تم حذف الصورة من قاعدة البيانات والتخزين السحابي');
    } catch (err: any) {
      setErrorMessage(err?.message || 'فشل في حذف الصورة');
    } finally {
      setIsUploading(false);
    }
  };

  // 5. Handle Set as Primary Cover Image
  const handleSetPrimary = async (indexToPrimary: number) => {
    if (!multiple || indexToPrimary === 0 || disabled || !isAdmin) return;

    const items = [...currentItems];
    const [selected] = items.splice(indexToPrimary, 1);
    items.unshift(selected);

    // Call server endpoint if item has an ID
    if (selected.item?.id) {
      try {
        await api.setPrimaryAdminMedia(currentUser || {}, selected.item.id);
      } catch (err) {
        console.warn('Primary sync warning:', err);
      }
    }

    onChange(items.map((it) => it.item || it.url));
    setSuccessMessage('تم تعيين الصورة كغلاف رئيسي للكيان');
  };

  // 6. Touch-friendly reordering in gallery (RTL support)
  const handleMove = async (index: number, direction: 'left' | 'right') => {
    if (!multiple || disabled || !isAdmin) return;
    const newItems = [...currentItems];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const reorderedUrls = newItems.map((it) => it.url);
    onChange(newItems.map((it) => it.item || it.url));

    // Sync reordered gallery with backend
    if (entityId) {
      try {
        await api.reorderGalleryMedia(currentUser || {}, {
          entityType,
          entityId,
          galleryUrls: reorderedUrls
        });
      } catch (e) {
        console.warn('Reorder sync warning:', e);
      }
    }
  };

  const isVideoUrl = (url?: string) =>
    Boolean(
      url &&
        (url.match(/\.(mp4|webm|mov|ogg|mkv|3gp|m4v)(\?.*)?$/i) ||
          url.includes('/video/upload/') ||
          url.includes('resource_type=video'))
    );

  return (
    <div className={`w-full text-right ${className}`} dir="rtl">
      {/* Label and Header */}
      {label && (
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <label className="block text-xs sm:text-sm font-bold text-[#2D2621] dark:text-[#E5DDD3]">
            {label}
            {multiple && (
              <span className="text-[11px] font-normal text-[#8A7E72] dark:text-[#A89D91] mr-1.5">
                ({currentItems.length} من {maxFiles} {mediaCategory === 'video' ? 'فيديوهات' : 'وسائط'})
              </span>
            )}
          </label>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={
          mediaCategory === 'video'
            ? 'video/mp4,video/webm,video/quicktime,video/*'
            : mediaCategory === 'image'
            ? 'image/png,image/jpeg,image/webp,image/jpg'
            : 'image/png,image/jpeg,image/webp,image/jpg,video/mp4,video/webm,video/quicktime,video/*'
        }
        multiple={multiple}
        onChange={(e) => {
          if (e.target.files) handleFilesSelected(e.target.files);
        }}
        className="hidden"
        id="admin-media-file-input"
        disabled={disabled || !isAdmin}
      />

      <input
        ref={replaceInputRef}
        type="file"
        accept={
          mediaCategory === 'video'
            ? 'video/mp4,video/webm,video/quicktime,video/*'
            : 'image/png,image/jpeg,image/webp,image/jpg'
        }
        onChange={handleReplacementFilePicked}
        className="hidden"
        id="admin-media-replace-input"
        disabled={disabled || !isAdmin}
      />

      {/* Non-Admin Security Warning */}
      {!isAdmin && (
        <div className="p-3 mb-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>ميزة رفع واستبدال الوسائط مخصصة لمدراء المنصة فقط. يمكنك تصفح ومعاينة الوسائط.</span>
        </div>
      )}

      {/* Mode Selector Tabs (Device Upload vs External URL) */}
      <div className="flex items-center gap-1.5 p-1 bg-[#F3ECE2] dark:bg-[#201A16] rounded-xl mb-3 border border-[#E8E0D5] dark:border-[#352B24] w-full">
        <button
          type="button"
          onClick={() => setActiveMode('device')}
          className={`flex-1 min-h-[40px] px-3 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeMode === 'device'
              ? 'bg-white dark:bg-[#2C241F] text-[#8E422D] dark:text-[#FF8A65] shadow-xs'
              : 'text-[#6B5E52] dark:text-[#A89D91] hover:text-[#2D2621]'
          }`}
        >
          <Upload className="w-4 h-4 shrink-0" />
          <span>رفع من الجهاز (Cloudinary)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('url')}
          className={`flex-1 min-h-[40px] px-3 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeMode === 'url'
              ? 'bg-white dark:bg-[#2C241F] text-[#8E422D] dark:text-[#FF8A65] shadow-xs'
              : 'text-[#6B5E52] dark:text-[#A89D91] hover:text-[#2D2621]'
          }`}
        >
          <LinkIcon className="w-4 h-4 shrink-0" />
          <span>رابط وسيط خارجي (URL)</span>
        </button>
      </div>

      {/* Tab 1: Upload from Device (Drag & Drop) */}
      {activeMode === 'device' && stagedFiles.length === 0 && (
        <div className="space-y-2 mb-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (isAdmin && !disabled) setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (isAdmin && !disabled && e.dataTransfer.files) {
                handleFilesSelected(e.dataTransfer.files);
              }
            }}
            onClick={() => {
              if (isAdmin && !disabled && !isUploading) fileInputRef.current?.click();
            }}
            className={`w-full border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center transition-all select-none min-h-[120px] sm:min-h-[140px] flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-[#8E422D] bg-[#8E422D]/10 dark:bg-[#8E422D]/20 scale-[0.99]'
                : 'border-[#D9CFBE] dark:border-[#3D332A] bg-[#FAF7F2] dark:bg-[#231C18] hover:border-[#8E422D] hover:bg-[#F3ECE2] dark:hover:bg-[#2B231E]'
            } ${disabled || !isAdmin ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#EADCCB] dark:bg-[#362A22] flex items-center justify-center text-[#8E422D] dark:text-[#FF8A65]">
              {mediaCategory === 'video' ? (
                <Video className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#2D2621] dark:text-[#E5DDD3]">
                {mediaCategory === 'video'
                  ? 'اضغط هنا للاختيار من جهازك أو اسحب مقطع الفيديو إلى هنا'
                  : mediaCategory === 'image'
                  ? 'اضغط هنا للاختيار من جهازك أو اسحب الصور إلى هنا'
                  : 'اضغط هنا للاختيار من جهازك أو اسحب الصور والفيديوهات إلى هنا'}
              </p>
              <p className="text-[11px] sm:text-xs text-[#7A6E63] dark:text-[#A89D91] mt-0.5">
                {mediaCategory === 'video'
                  ? 'يدعم MP4 و WebM و MOV (الحد الأقصى 150 ميجابايت) • مجلد WAH/videos'
                  : 'يدعم الصور JPG و PNG (10 ميجابايت) والفيديو (150 ميجابايت) • يتم التوثيق والمعاينة قبل الحفظ'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STAGING AREA: Local Image Preview Before Saving */}
      {stagedFiles.length > 0 && (
        <div className="mb-4 p-4 rounded-2xl border-2 border-[#8E422D] bg-[#FFFBF7] dark:bg-[#261E1A] shadow-md space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E0D5] dark:border-[#3D332A]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8E422D] dark:text-[#FF8A65]">
              <Sparkles className="w-4 h-4" />
              <span>معاينة الوسيط قبل الحفظ والرفع إلى Cloudinary</span>
            </div>
            <button
              type="button"
              onClick={cancelStaging}
              disabled={isUploading}
              className="p-1 rounded-md text-[#7A6E63] hover:text-red-600 cursor-pointer"
              title="إلغاء المعاينة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stagedFiles.map((sf, idx) => (
              <div
                key={sf.id}
                className="flex gap-3 p-2.5 rounded-xl bg-white dark:bg-[#1E1815] border border-[#E8E0D5] dark:border-[#352B24]"
              >
                <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-black/10 flex items-center justify-center">
                  {sf.isVideo ? (
                    <video
                      src={sf.localPreviewUrl}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={sf.localPreviewUrl}
                      alt={sf.alt}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white flex items-center gap-1">
                    {sf.isVideo && <Video className="w-2.5 h-2.5 text-amber-400" />}
                    {sf.format}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5 text-right">
                  <p className="text-xs font-bold text-[#2D2621] dark:text-[#E5DDD3] truncate">
                    {sf.file.name}
                  </p>
                  <p className="text-[10px] text-[#7A6E63] dark:text-[#A89D91]">
                    الحجم: {(sf.sizeBytes / (1024 * 1024)).toFixed(2)} ميجابايت
                  </p>

                  <input
                    type="text"
                    value={sf.alt}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStagedFiles((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, alt: val } : p))
                      );
                    }}
                    placeholder="النص البديل (Alt text)"
                    className="w-full text-[11px] px-2.5 py-1 rounded-lg border border-[#D9CFBE] dark:border-[#3D332A] bg-[#FAF7F2] dark:bg-[#26201B] outline-none"
                  />

                  {sf.status === 'uploading' && (
                    <div className="space-y-1 pt-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#8E422D] h-full transition-all duration-200"
                          style={{ width: `${sf.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#8E422D] font-bold">
                        جاري الرفع... {sf.progress}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={cancelStaging}
              disabled={isUploading}
              className="px-3.5 py-2 rounded-xl border border-[#D9CFBE] dark:border-[#3D332A] text-xs font-bold text-[#7A6E63] hover:bg-gray-100 dark:hover:bg-[#332A22] cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={executeStagedUpload}
              disabled={isUploading}
              className="px-5 py-2 rounded-xl bg-[#8E422D] hover:bg-[#753422] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الرفع إلى Cloudinary...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>تأكيد الرفع والحفظ بالسحابة</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* REPLACEMENT STAGING MODAL: Preview Before Replace */}
      {stagedReplacement && stagedReplacement.localPreviewUrl && (
        <div className="mb-4 p-4 rounded-2xl border-2 border-[#8E422D] bg-[#FFFBF7] dark:bg-[#261E1A] shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E0D5] dark:border-[#3D332A]">
            <span className="text-xs font-bold text-[#8E422D] dark:text-[#FF8A65] flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4" />
              <span>معاينة استبدال الصورة</span>
            </span>
            <button
              type="button"
              onClick={cancelReplacement}
              className="p-1 text-gray-500 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#7A6E63] block">الصورة الحالية (ستُحذف بعد نجاح البديل):</span>
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/5 border border-[#E8E0D5]">
                <img
                  src={stagedReplacement.targetCurrentUrl}
                  alt="الصورة الحالية"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-600 block">الصورة البديلة الجديدة:</span>
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/5 border-2 border-emerald-500">
                <img
                  src={stagedReplacement.localPreviewUrl}
                  alt="الصورة البديلة"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E0D5] dark:border-[#3D332A]">
            <button
              type="button"
              onClick={cancelReplacement}
              disabled={isUploading}
              className="px-3.5 py-2 rounded-xl border border-[#D9CFBE] text-xs font-bold text-[#7A6E63] cursor-pointer"
            >
              إلغاء الاستبدال
            </button>
            <button
              type="button"
              onClick={confirmReplacement}
              disabled={isUploading}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري استبدال الصورة في Cloudinary...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>تأكيد استبدال الصورة</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: External Image URL (Backward compatibility) */}
      {activeMode === 'url' && (
        <form onSubmit={handleUrlSubmit} className="space-y-2 mb-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/... أو رابط صورة خارجي"
                disabled={disabled || isUploading || !isAdmin}
                className="w-full bg-[#FAF7F2] dark:bg-[#231C18] text-xs sm:text-sm rounded-xl px-4 py-3 border border-[#D9CFBE] dark:border-[#3D332A] text-[#2D2621] dark:text-[#E5DDD3] placeholder:text-[#9C8F82] focus:outline-none focus:border-[#8E422D] min-h-[44px]"
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              disabled={disabled || isUploading || !urlInput.trim() || !isAdmin}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#8E422D] hover:bg-[#753422] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
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
            disabled={disabled || !isAdmin}
            className="w-full bg-[#FAF7F2] dark:bg-[#231C18] text-xs sm:text-sm rounded-xl px-3.5 py-2 border border-[#D9CFBE] dark:border-[#3D332A] text-[#2D2621] dark:text-[#E5DDD3] placeholder:text-[#9C8F82] focus:outline-none focus:border-[#8E422D] min-h-[40px]"
          />
        </div>
      </div>

      {/* Status Notifications */}
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

      {/* SINGLE IMAGE / VIDEO PREVIEW MODE */}
      {!multiple && currentItems.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden border border-[#D9CFBE] dark:border-[#3D332A] bg-[#FAF7F2] dark:bg-[#231C18] p-3">
          <div className="relative w-full aspect-video sm:aspect-21/9 max-h-[240px] rounded-xl overflow-hidden bg-black/10 flex items-center justify-center">
            {isVideoUrl(currentItems[0].url) ? (
              <video
                src={currentItems[0].url}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={currentItems[0].url}
                alt={currentItems[0].item?.alt || entityTitle || 'معاينة الوسيط'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800';
                }}
              />
            )}

            {/* Cloudinary Badge */}
            {currentItems[0].url.includes('cloudinary.com') && (
              <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-[#8E422D]/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                {isVideoUrl(currentItems[0].url) ? 'فيديو موثق' : 'Cloudinary موثق'}
              </div>
            )}

            {/* Preview Overlay Button */}
            <button
              type="button"
              onClick={() => setPreviewModalUrl(currentItems[0].url)}
              className="absolute top-2 left-2 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer"
              title="تكبير ومعاينة"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Metadata & Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-[#E8E0D5] dark:border-[#332A22]">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#2D2621] dark:text-[#E5DDD3] truncate">
                {currentItems[0].item?.title || currentItems[0].item?.alt || entityTitle || 'صورة الغلاف'}
              </p>
              <p className="text-[10px] text-[#7A6E63] dark:text-[#A89D91] truncate font-mono mt-0.5 text-left" dir="ltr">
                {currentItems[0].item?.publicId || currentItems[0].url}
              </p>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    triggerReplacePicker(
                      currentItems[0].item?.id || currentItems[0].url,
                      currentItems[0].url
                    )
                  }
                  disabled={disabled || isUploading}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg border border-[#D9CFBE] dark:border-[#3D332A] bg-white dark:bg-[#2B231E] hover:bg-[#F3ECE2] text-[#2D2621] dark:text-[#E5DDD3] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>استبدال</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRemove(currentItems[0].url, currentItems[0].item)}
                  disabled={disabled || isUploading}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </button>
              </div>
            )}
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
                } bg-[#FAF7F2] dark:bg-[#231C18] p-2 flex flex-col justify-between`}
              >
                {/* Thumbnail */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/10 flex items-center justify-center">
                  {isVideoUrl(img.url) ? (
                    <>
                      <video
                        src={img.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white">
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-white flex items-center gap-1">
                        <Video className="w-2.5 h-2.5 text-amber-400" />
                        فيديو
                      </span>
                    </>
                  ) : (
                    <img
                      src={img.url}
                      alt={img.item?.alt || `صورة ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Primary Badge */}
                  {idx === 0 && (
                    <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-[#8E422D] text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 fill-current" />
                      <span>رئيسي</span>
                    </div>
                  )}

                  {/* Zoom Preview */}
                  <button
                    type="button"
                    onClick={() => setPreviewModalUrl(img.url)}
                    className="absolute top-1.5 left-1.5 p-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white cursor-pointer"
                    title="معاينة"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card Controls & Reordering */}
                {isAdmin && (
                  <div className="mt-2 pt-2 border-t border-[#E8E0D5] dark:border-[#332A22] flex items-center justify-between gap-1">
                    {/* Reorder Buttons (Touch-friendly for mobile) */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'left')}
                        disabled={idx === 0 || disabled}
                        className="min-w-[32px] min-h-[32px] p-1.5 rounded-md bg-white dark:bg-[#2B231E] border border-[#D9CFBE] dark:border-[#3D332A] text-[#2D2621] dark:text-[#E5DDD3] disabled:opacity-30 flex items-center justify-center cursor-pointer"
                        title="تحريك للأمام"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'right')}
                        disabled={idx === currentItems.length - 1 || disabled}
                        className="min-w-[32px] min-h-[32px] p-1.5 rounded-md bg-white dark:bg-[#2B231E] border border-[#D9CFBE] dark:border-[#3D332A] text-[#2D2621] dark:text-[#E5DDD3] disabled:opacity-30 flex items-center justify-center cursor-pointer"
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
                          className="min-h-[32px] px-2 py-1 rounded-md text-[11px] font-bold bg-[#EADCCB] dark:bg-[#362A22] text-[#8E422D] dark:text-[#FF8A65] hover:bg-[#8E422D] hover:text-white transition-all cursor-pointer"
                          title="تعيين كصورة رئيسية"
                        >
                          تعيين كغلاف
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          triggerReplacePicker(img.item?.id || img.url, img.url)
                        }
                        disabled={disabled || isUploading}
                        className="min-w-[32px] min-h-[32px] p-1.5 rounded-md text-[#2D2621] dark:text-[#E5DDD3] hover:bg-black/5 cursor-pointer"
                        title="استبدال"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemove(img.url, img.item)}
                        disabled={disabled || isUploading}
                        className="min-w-[32px] min-h-[32px] p-1.5 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-[#1F1A16] rounded-2xl p-3 overflow-hidden flex flex-col items-center shadow-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            {isVideoUrl(previewModalUrl) ? (
              <video
                src={previewModalUrl}
                controls
                autoPlay
                className="max-h-[78vh] max-w-full rounded-xl"
              />
            ) : (
              <img
                src={previewModalUrl}
                alt="معاينة بالحجم الكامل"
                className="max-h-[78vh] w-auto object-contain rounded-xl"
              />
            )}
            <div className="w-full p-2 text-center text-xs text-white/70 truncate font-mono text-left mt-1" dir="ltr">
              {previewModalUrl}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
