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
  ArrowUp,
  ArrowDown,
  Eye,
  X,
  ShieldAlert,
  Check,
  Sparkles,
  Video,
  Play,
  Plus,
  RotateCw
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
  const isAdmin = currentRole === 'admin' || currentUser?.role === 'admin';
  const authUser = {
    id: currentUser?.id || 'admin',
    role: isAdmin ? 'admin' : (currentUser?.role || currentRole || 'admin')
  };
  const [externalUrlInput, setExternalUrlInput] = useState('');
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
  const [itemPendingDelete, setItemPendingDelete] = useState<{ url: string; item?: MediaItem } | null>(null);

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

  // 1. When files are picked or dropped from device: Stage with instant local preview before saving
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
        if (file.size > 1024 * 1024 * 1024) {
          setErrorMessage('حجم الفيديو لازم يكون 300 ميجاأو أقل.');
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

    setStagedFiles((prev) => [...prev, ...newStaged]);
    // Auto-trigger upload immediately so files upload seamlessly without requiring an extra click
    setTimeout(() => {
      startUploadBatch(newStaged);
    }, 100);
  };

  // Remove individual staged file before upload
  const removeStagedFile = (idToRemove: string) => {
    setStagedFiles((prev) => {
      const target = prev.find((p) => p.id === idToRemove);
      if (target) URL.revokeObjectURL(target.localPreviewUrl);
      return prev.filter((p) => p.id !== idToRemove);
    });
  };

  // Discard all staged files
  const cancelStaging = () => {
    stagedFiles.forEach((sf) => URL.revokeObjectURL(sf.localPreviewUrl));
    setStagedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Upload single item helper
  const uploadSingleItem = async (item: StagedFile, isFirst: boolean): Promise<MediaItem> => {
    const isVideo = item.isVideo || item.file.type.startsWith('video/');
    return await api.uploadAdminMedia(
      authUser,
      {
        file: item.file,
        filename: item.file.name,
        mimeType: item.file.type,
        resourceType: isVideo ? 'video' : 'image',
        entityType: entityType || (isVideo ? 'videos' : 'general'),
        entitySlug,
        entityId,
        alt: item.alt || getSuggestedAlt(),
        caption: item.caption,
        isPrimary: !multiple || isFirst,
        addToGallery: multiple && !isVideo
      },
      (progressPercent) => {
        setStagedFiles((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, progress: progressPercent } : p))
        );
      }
    );
  };

  // Batch upload execution with automatic feedback and cleanup
  const startUploadBatch = async (itemsToUpload: StagedFile[]) => {
    const pendingItems = itemsToUpload.filter((sf) => sf.status !== 'success');
    if (pendingItems.length === 0 || isUploading || disabled) return;

    setIsUploading(true);
    setErrorMessage(null);

    const uploadedResults: MediaItem[] = [];
    let hadErrors = false;

    for (let i = 0; i < pendingItems.length; i++) {
      const item = pendingItems[i];

      setStagedFiles((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: 'uploading', progress: 5, errorMessage: undefined } : p))
      );

      const isFirstImage = currentItems.length === 0 && uploadedResults.length === 0;

      try {
        const uploadedMedia = await uploadSingleItem(item, isFirstImage);
        uploadedResults.push(uploadedMedia);

        setStagedFiles((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, status: 'success', progress: 100 } : p))
        );
      } catch (err: any) {
        hadErrors = true;
        setStagedFiles((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, status: 'error', errorMessage: err?.message || 'فشل الرفع' } : p))
        );
      }
    }

    // Commit any successful results to parent
    if (uploadedResults.length > 0) {
      if (multiple) {
        const newArray = [...currentItems.map((it) => it.item || it.url), ...uploadedResults];
        onChange(newArray);
        setSuccessMessage(`تم رفع وتوثيق ${uploadedResults.length} ملف بنجاح في السحابة`);
      } else {
        const first = uploadedResults[0];
        onChange(first.secureUrl || first.url);
        setSuccessMessage('تم رفع وتوثيق الوسيط بنجاح في السحابة');
      }
    }

    setIsUploading(false);

    if (!hadErrors) {
      setTimeout(() => {
        itemsToUpload.forEach((sf) => URL.revokeObjectURL(sf.localPreviewUrl));
        setStagedFiles((prev) => prev.filter((p) => !itemsToUpload.some((it) => it.id === p.id)));
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 1200);
    } else {
      setErrorMessage('بعض الملفات واجهت خطأ أثناء الرفع، يمكنك النقر على "إعادة المحاولة" لكل ملف متبقٍ');
    }
  };

  // Retry upload for a specific failed staged file
  const retrySingleStagedUpload = async (stagedId: string) => {
    const item = stagedFiles.find((sf) => sf.id === stagedId);
    if (!item || isUploading || disabled) return;
    await startUploadBatch([item]);
  };

  // Execute upload of all staged files manually if desired
  const executeStagedUpload = async () => {
    const pendingOrErrorItems = stagedFiles.filter((sf) => sf.status !== 'success');
    await startUploadBatch(pendingOrErrorItems);
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

      const media = await api.saveAdminMediaUrl(authUser, {
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
    replaceInputRef.current?.click();
  };

  const handleReplacementFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !stagedReplacement) return;

    const allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const allowedVideoMimes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const isVideo = file.type.startsWith('video/') || allowedVideoMimes.includes(file.type.toLowerCase());

    if (isVideo && file.size > 1024 * 1024 * 1024) {
      setErrorMessage('حجم الفيديو لازم يكون 300 ميجاأو أقل.');
      return;
    }
    if (!isVideo && (!allowedImageMimes.includes(file.type.toLowerCase()) || file.size > 10 * 1024 * 1024)) {
      setErrorMessage('الصورة البديلة يجب أن تكون JPG/PNG/WEBP وأقل من 10 ميجابايت');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setStagedReplacement((prev) => (prev ? { ...prev, file, localPreviewUrl: localUrl } : null));
  };

  const confirmReplacement = async () => {
    if (!stagedReplacement || !stagedReplacement.file || isUploading) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const updatedMedia = await api.replaceAdminMedia(
        authUser,
        stagedReplacement.targetIdOrUrl,
        stagedReplacement.file
      );

      const newUrl = updatedMedia.secureUrl || updatedMedia.url;

      if (multiple) {
        const updatedList = currentItems.map((item) =>
          item.url === stagedReplacement.targetCurrentUrl ? { url: newUrl, item: updatedMedia } : item
        );
        onChange(updatedList.map((i) => i.item || i.url));
      } else {
        onChange(newUrl);
      }

      setSuccessMessage('تم استبدال الوسيط بنجاح وحذف السابق بأمان');
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
  const executeConfirmedDelete = async () => {
    if (!itemPendingDelete || !isAdmin || disabled || isUploading) return;
    const { url: urlToRemove, item: itemToRemove } = itemPendingDelete;

    try {
      setIsUploading(true);

      if (itemToRemove?.id || itemToRemove?.publicId) {
        try {
          await api.deleteAdminMedia(authUser, itemToRemove.id || itemToRemove.publicId!);
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

      setSuccessMessage('تم حذف الوسيط من قاعدة البيانات والتخزين السحابي');
      setItemPendingDelete(null);
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

    if (selected.item?.id) {
      try {
        await api.setPrimaryAdminMedia(authUser, selected.item.id);
      } catch (err) {
        console.warn('Primary sync warning:', err);
      }
    }

    onChange(items.map((it) => it.item || it.url));
    setSuccessMessage('تم تعيين الصورة كغلاف رئيسي للكيان');
  };

  // 6. Touch-friendly reordering in gallery (Forward / Backward)
  const handleMove = async (index: number, direction: 'forward' | 'backward') => {
    if (!multiple || disabled || !isAdmin) return;
    const newItems = [...currentItems];
    const targetIndex = direction === 'forward' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const reorderedUrls = newItems.map((it) => it.url);
    onChange(newItems.map((it) => it.item || it.url));

    if (entityId) {
      try {
        await api.reorderGalleryMedia(authUser, {
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

  // Staging upload progress metrics
  const totalStagedCount = stagedFiles.length;
  const completedStagedCount = stagedFiles.filter((sf) => sf.status === 'success').length;
  const averageProgress =
    totalStagedCount > 0
      ? Math.round(stagedFiles.reduce((acc, sf) => acc + sf.progress, 0) / totalStagedCount)
      : 0;

  return (
    <div className={`w-full text-right ${className}`} dir="rtl">
      {/* Label and Header */}
      {label && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <label className="block text-xs sm:text-sm font-bold text-[#211d18] dark:text-[#f5f0e7]">
            {label}
            {multiple && (
              <span className="text-[11px] font-normal text-black/50 dark:text-white/50 dark:text-black/50 dark:text-white/50 mr-1.5">
                ({currentItems.length} من {maxFiles} {mediaCategory === 'video' ? 'فيديوهات' : 'وسائط'})
              </span>
            )}
          </label>

          {/* Media Category Pill Badge */}
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EADCCB] dark:bg-[#362A22] text-[#9a6a35] dark:text-[#d5a56d]">
              {mediaCategory === 'video' ? (
                <>
                  <Video className="w-3 h-3" />
                  <span>فيديو فقط</span>
                </>
              ) : mediaCategory === 'image' ? (
                <>
                  <ImageIcon className="w-3 h-3" />
                  <span>صور فقط</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>صور وفيديو</span>
                </>
              )}
            </span>

            {multiple && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                <span>معرض متعدد</span>
              </span>
            )}
          </div>
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
      <div className="flex items-center gap-1.5 p-1 bg-black/10 dark:bg-white/10 dark:bg-[#201A16] rounded-xl mb-3 border border-black/10 dark:border-white/10 w-full">
        <button
          type="button"
          onClick={() => setActiveMode('device')}
          className={`flex-1 min-h-[44px] px-3 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${activeMode === 'device'
            ? 'bg-white dark:bg-[#2C241F] text-[#9a6a35] dark:text-[#d5a56d] shadow-xs'
            : 'text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50 hover:text-[#211d18]'
            }`}
        >
          <Upload className="w-4 h-4 shrink-0" />
          <span>رفع من الجهاز (Cloudinary)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('url')}
          className={`flex-1 min-h-[44px] px-3 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${activeMode === 'url'
            ? 'bg-white dark:bg-[#2C241F] text-[#9a6a35] dark:text-[#d5a56d] shadow-xs'
            : 'text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50 hover:text-[#211d18]'
            }`}
        >
          <LinkIcon className="w-4 h-4 shrink-0" />
          <span>رابط وسيط خارجي (URL)</span>
        </button>
      </div>

      {/* Tab 1: Upload from Device - Mobile First Touch Zone */}
      {activeMode === 'device' && stagedFiles.length === 0 && (
        <div className="space-y-3 mb-3">
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
            className={`w-full border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center transition-all select-none flex flex-col items-center justify-center gap-3 ${isDragging
              ? 'border-[#9a6a35] bg-[#9a6a35]/10 dark:bg-[#9a6a35]/20 scale-[0.99]'
              : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 dark:bg-black/5 dark:bg-white/5'
              }`}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EADCCB] dark:bg-[#362A22] flex items-center justify-center text-[#9a6a35] dark:text-[#d5a56d] shadow-2xs">
              {mediaCategory === 'video' ? (
                <Video className="w-6 h-6 sm:w-7 sm:h-7" />
              ) : (
                <Upload className="w-6 h-6 sm:w-7 sm:h-7" />
              )}
            </div>

            <div className="max-w-md">
              <h4 className="text-sm sm:text-base font-bold text-[#211d18] dark:text-[#f5f0e7]">
                {mediaCategory === 'video'
                  ? 'اختر أو اسحب مقطع فيديو توثيقي'
                  : mediaCategory === 'image'
                    ? multiple
                      ? 'اختر مجموعة صور للمعرض'
                      : 'اختر صورة الغلاف الرئيسية'
                    : 'اختر الصور أو مقاطع الفيديو'}
              </h4>
              <p className="text-[11px] sm:text-xs text-black/60 dark:text-white/60 mt-1 leading-relaxed">
                {mediaCategory === 'video'
                  ? 'صيغ الفيديو: MP4, WebM, MOV حتى 1 جيجابايت • مجلد WAH/videos'
                  : 'الصور المدعومة: JPG, PNG, WEBP (حتى 10 ميجابايت) • معاينة سريعة قبل الرفع'}
              </p>
            </div>

            {/* Mobile-First Action Buttons (44px min touch targets) */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 w-full pt-1">
              <button
                type="button"
                onClick={() => {
                  if (isAdmin && !disabled && !isUploading) fileInputRef.current?.click();
                }}
                disabled={disabled || !isAdmin || isUploading}
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {mediaCategory === 'video' ? (
                  <>
                    <Video className="w-4 h-4" />
                    <span>اختيار فيديو من الجهاز</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>{multiple ? 'اختيار صور من الجهاز' : 'اختيار صورة من الجهاز'}</span>
                  </>
                )}
              </button>

              <span className="hidden sm:inline text-xs text-black/50 dark:text-white/50">أو اسحب وأفلت هنا</span>
            </div>
          </div>
        </div>
      )}

      {/* STAGING AREA: Local Previews with Real Progress & Retry */}
      {stagedFiles.length > 0 && (
        <div className="mb-4 p-3 sm:p-5 rounded-2xl border-2 border-[#9a6a35] bg-[#FFFBF7] dark:bg-[#261E1A] shadow-md space-y-3.5">
          {/* Header with counter and cancel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-black/10 dark:border-white/10 dark:border-[#3D332A]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#9a6a35] dark:text-[#d5a56d]">
                <Sparkles className="w-4 h-4" />
                <span>معاينة الوسائط قبل الرفع النهائي إلى Cloudinary</span>
              </div>
              <p className="text-[11px] text-black/60 dark:text-white/60">
                جاهز للرفع: {stagedFiles.length} ملف • يمكنك تعديل النص البديل أو إزالة أي ملف قبل الاعتماد
              </p>
            </div>

            <button
              type="button"
              onClick={cancelStaging}
              disabled={isUploading}
              className="self-end sm:self-center min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold text-black/60 dark:text-white/60 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1 cursor-pointer"
              title="إلغاء جميع الملفات"
              aria-label="إلغاء جميع الملفات المجهزة"
            >
              <X className="w-4 h-4" />
              <span>إلغاء الكل</span>
            </button>
          </div>

          {/* Aggregate Upload Progress Bar */}
          {isUploading && (
            <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 dark:bg-[#201A16] border border-black/10 dark:border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#9a6a35] dark:text-[#d5a56d] flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري الرفع إلى السحابة... ({completedStagedCount} من {totalStagedCount} اكتملت)</span>
                </span>
                <span className="font-mono text-xs">{averageProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#9a6a35] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${averageProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Staged Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-0.5">
            {stagedFiles.map((sf) => (
              <div
                key={sf.id}
                className="p-3 rounded-xl bg-white dark:bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col justify-between gap-2.5 shadow-2xs"
              >
                <div className="flex gap-3">
                  {/* Thumbnail / Video Preview */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-black/10 flex items-center justify-center">
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
                      {sf.isVideo ? <Video className="w-2.5 h-2.5 text-amber-400" /> : <ImageIcon className="w-2.5 h-2.5" />}
                      {sf.format}
                    </span>
                  </div>

                  {/* Metadata and Alt Text */}
                  <div className="flex-1 min-w-0 space-y-1.5 text-right">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] truncate" title={sf.file.name}>
                        {sf.file.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeStagedFile(sf.id)}
                        disabled={isUploading}
                        className="p-1 rounded-md text-black/50 dark:text-white/50 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer shrink-0"
                        title="إزالة من قائمة الرفع"
                        aria-label="إزالة الملف من القائمة"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[10px] text-black/60 dark:text-white/60">
                      الحجم: {(sf.sizeBytes / (1024 * 1024)).toFixed(2)} ميجابايت • {sf.isVideo ? 'فيديو' : 'صورة'}
                    </p>

                    <input
                      type="text"
                      value={sf.alt}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStagedFiles((prev) =>
                          prev.map((p) => (p.id === sf.id ? { ...p, alt: val } : p))
                        );
                      }}
                      placeholder="النص البديل (Alt text)"
                      disabled={isUploading}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 outline-none min-h-[36px]"
                    />
                  </div>
                </div>

                {/* Status indicator and Retry */}
                <div className="pt-1.5 border-t border-[#F0EAE1] dark:border-[#2C2420] flex items-center justify-between gap-2">
                  <div className="text-[11px] font-bold">
                    {sf.status === 'pending' && (
                      <span className="text-black/50 dark:text-white/50 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        <span>بانتظار بدء الرفع</span>
                      </span>
                    )}
                    {sf.status === 'uploading' && (
                      <span className="text-[#9a6a35] dark:text-[#d5a56d] flex items-center gap-1 font-bold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري الرفع... {sf.progress}%</span>
                      </span>
                    )}
                    {sf.status === 'success' && (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تم الرفع بنجاح بالسحابة</span>
                      </span>
                    )}
                    {sf.status === 'error' && (
                      <span className="text-red-600 dark:text-red-400 flex items-center gap-1 font-bold truncate max-w-[200px]" title={sf.errorMessage}>
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{sf.errorMessage || 'فشل الرفع'}</span>
                      </span>
                    )}
                  </div>

                  {sf.status === 'error' && (
                    <button
                      type="button"
                      onClick={() => retrySingleStagedUpload(sf.id)}
                      disabled={isUploading}
                      className="min-h-[32px] px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-red-200"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>إعادة المحاولة</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Staging Bottom Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 pt-2 border-t border-black/10 dark:border-white/10 dark:border-[#3D332A]">
            <button
              type="button"
              onClick={cancelStaging}
              disabled={isUploading}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-black/60 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-[#332A22] cursor-pointer flex items-center justify-center"
            >
              إلغاء المعاينة
            </button>
            <button
              type="button"
              onClick={executeStagedUpload}
              disabled={isUploading}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري رفع {stagedFiles.length} ملف إلى Cloudinary...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>تأكيد رفع {stagedFiles.length} ملف إلى السحابة</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* REPLACEMENT STAGING MODAL: Preview Before Replace */}
      {stagedReplacement && stagedReplacement.localPreviewUrl && (
        <div className="mb-4 p-4 rounded-2xl border-2 border-[#9a6a35] bg-[#FFFBF7] dark:bg-[#261E1A] shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10 dark:border-[#3D332A]">
            <span className="text-xs sm:text-sm font-bold text-[#9a6a35] dark:text-[#d5a56d] flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4" />
              <span>معاينة استبدال الوسيط قبل التطبيق بالسحابة</span>
            </span>
            <button
              type="button"
              onClick={cancelReplacement}
              className="min-h-[36px] min-w-[36px] p-1 text-gray-500 hover:text-gray-800 flex items-center justify-center rounded-lg cursor-pointer"
              aria-label="إلغاء الاستبدال"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-black/60 dark:text-white/60 block">الوسيط الحالي (سيُستبدل ويُحذف بأمان):</span>
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/5 border border-black/10 dark:border-white/10">
                {isVideoUrl(stagedReplacement.targetCurrentUrl) ? (
                  <video src={stagedReplacement.targetCurrentUrl} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={stagedReplacement.targetCurrentUrl} alt="الحالية" className="w-full h-full object-cover" />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-600 block">الوسيط البديل الجديد:</span>
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/5 border-2 border-emerald-500">
                {stagedReplacement.file?.type.startsWith('video/') ? (
                  <video src={stagedReplacement.localPreviewUrl} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={stagedReplacement.localPreviewUrl} alt="البديلة" className="w-full h-full object-cover" />
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2 pt-2 border-t border-black/10 dark:border-white/10 dark:border-[#3D332A]">
            <button
              type="button"
              onClick={cancelReplacement}
              disabled={isUploading}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-black/60 dark:text-white/60 cursor-pointer flex items-center justify-center"
            >
              إلغاء الاستبدال
            </button>
            <button
              type="button"
              onClick={confirmReplacement}
              disabled={isUploading}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الاستبدال في Cloudinary...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>تأكيد استبدال الوسيط</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: External Image URL (Backward compatibility) */}
      {activeMode === 'url' && (
        <div className="space-y-2 mb-3"> {/* تم تغيير form إلى div لمنع تداخل النماذج */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="url"
                value={externalUrlInput}
                onChange={(e) => setExternalUrlInput(e.target.value)}
                placeholder="أدخل رابط الصورة أو الفيديو مباشرة (https://...)"
                dir="ltr"
                className="w-full px-3 py-2 text-xs border border-black/15 dark:border-white/15 rounded-xl bg-white dark:bg-black/40 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <button
              type="button" // تم جعل الزر من نوع button عادي وليس submit لمنع إرسال النموذج الرئيسي بالخطأ
              onClick={handleUrlSubmit}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <span>حفظ الرابط</span>
            </button>
          </div>
        </div>
      )}

      {/* Alt Text Input (for SEO & Accessibility) */}
      <div className="mb-3">
        <label className="block text-[11px] sm:text-xs font-semibold text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50 mb-1">
          النص البديل المعبر (Alt Text) للتوثيق ومحركات البحث
        </label>
        <div className="relative">
          <input
            type="text"
            value={altInput}
            onChange={(e) => setAltInput(e.target.value)}
            placeholder={getSuggestedAlt()}
            disabled={disabled || !isAdmin}
            className="w-full bg-black/5 dark:bg-white/5 dark:bg-black/5 dark:bg-white/5 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] placeholder:text-black/40 dark:text-white/40 focus:outline-none focus:border-[#9a6a35] min-h-[44px]"
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
            className="p-1 hover:bg-red-100 rounded text-red-600 min-w-[28px] min-h-[28px] flex items-center justify-center"
            aria-label="إغلاق التنبيه"
          >
            <X className="w-4 h-4" />
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
      {/* SINGLE IMAGE / VIDEO PREVIEW MODE (Responsive Media Card)                 */}
      {/* ========================================================================= */}
      {!multiple && currentItems.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 dark:bg-black/5 dark:bg-white/5 p-3 sm:p-4">
          <div className="relative w-full aspect-video sm:aspect-21/9 max-h-[260px] rounded-xl overflow-hidden bg-black/10 flex items-center justify-center">
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

            {/* Type & Cloudinary Badges */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-[#9a6a35]/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                {isVideoUrl(currentItems[0].url) ? 'فيديو موثق' : 'صورة موثقة'}
              </span>
              <span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                الغلاف
              </span>
            </div>

            {/* Preview Overlay Button */}
            <button
              type="button"
              onClick={() => setPreviewModalUrl(currentItems[0].url)}
              className="absolute top-2 left-2 min-h-[38px] min-w-[38px] p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer flex items-center justify-center"
              title="معاينة بالحجم الكامل"
              aria-label="معاينة الوسيط بالحجم الكامل"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Metadata & Mobile Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-black/10 dark:border-white/10">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-[#211d18] dark:text-[#f5f0e7] truncate">
                {currentItems[0].item?.title || currentItems[0].item?.alt || entityTitle || 'صورة الغلاف'}
              </p>
              <p className="text-[10px] text-black/60 dark:text-white/60 truncate font-mono mt-0.5 text-left" dir="ltr">
                {currentItems[0].item?.publicId || currentItems[0].url}
              </p>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() =>
                    triggerReplacePicker(
                      currentItems[0].item?.id || currentItems[0].url,
                      currentItems[0].url
                    )
                  }
                  disabled={disabled || isUploading}
                  className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl hover:bg-black/10 dark:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>استبدال</span>
                </button>

                <button
                  type="button"
                  onClick={() => setItemPendingDelete(currentItems[0])}
                  disabled={disabled || isUploading}
                  className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GALLERY PREVIEW MODE (Multiple Images - Responsive Grid)                   */}
      {/* ========================================================================= */}
      {multiple && currentItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-black/60 dark:text-white/60 px-1">
            <span>صور وفيديوهات المعرض التوثيقي ({currentItems.length})</span>
            <span>الترتيب من اليمين إلى اليسار</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentItems.map((img, idx) => {
              const isVideo = isVideoUrl(img.url);
              const isPrimary = idx === 0;

              return (
                <div
                  key={img.item?.id || `${img.url}-${idx}`}
                  className={`relative rounded-2xl overflow-hidden border transition-all ${isPrimary
                    ? 'border-[#9a6a35] shadow-xs dark:border-[#d5a56d]/60 bg-[#FFFBF7] dark:bg-black/5 dark:bg-white/5'
                    : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 dark:bg-black/5 dark:bg-white/5'
                    } p-3 flex flex-col justify-between gap-2.5`}
                >
                  {/* Thumbnail / Video */}
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/10 flex items-center justify-center">
                    {isVideo ? (
                      <>
                        <video
                          src={img.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <div className="w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white shadow-xs">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 text-[10px] font-bold text-white flex items-center gap-1">
                          <Video className="w-3 h-3 text-amber-400" />
                          <span>فيديو</span>
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
                    {isPrimary && (
                      <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-[#9a6a35] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>الغلاف الرئيسي ✓</span>
                      </div>
                    )}

                    {/* Order Number Badge */}
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-mono">
                      #{idx + 1}
                    </span>

                    {/* Zoom Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewModalUrl(img.url)}
                      className="absolute top-2 left-2 min-h-[34px] min-w-[34px] p-1.5 rounded-lg bg-black/60 hover:bg-black/85 text-white cursor-pointer flex items-center justify-center"
                      title="معاينة بالحجم الكامل"
                      aria-label="معاينة الصورة بالحجم الكامل"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card Controls & Touch Reordering */}
                  {isAdmin && (
                    <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/10">
                      {/* Top Action Row: Set primary / Status */}
                      <div className="flex items-center justify-between gap-1.5">
                        {!isPrimary ? (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(idx)}
                            disabled={disabled}
                            className="flex-1 min-h-[36px] px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#EADCCB] dark:bg-[#362A22] text-[#9a6a35] dark:text-[#d5a56d] hover:bg-[#9a6a35] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
                            title="تعيين كصورة رئيسية"
                          >
                            <Star className="w-3.5 h-3.5" />
                            <span>تعيين كغلاف</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>الصورة الأولى بالواجهة</span>
                          </span>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              triggerReplacePicker(img.item?.id || img.url, img.url)
                            }
                            disabled={disabled || isUploading}
                            className="min-h-[36px] min-w-[36px] p-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/5 dark:bg-white/5 cursor-pointer flex items-center justify-center"
                            title="استبدال"
                            aria-label="استبدال هذا الوسيط"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setItemPendingDelete(img)}
                            disabled={disabled || isUploading}
                            className="min-h-[36px] min-w-[36px] p-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 hover:bg-red-100 cursor-pointer flex items-center justify-center"
                            title="حذف"
                            aria-label="حذف هذا الوسيط"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Reordering Controls (Touch-Friendly min 44px) */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-black/50 dark:text-white/50 font-semibold whitespace-nowrap">الترتيب:</span>
                        <div className="grid grid-cols-2 gap-1.5 flex-1">
                          <button
                            type="button"
                            onClick={() => handleMove(idx, 'forward')}
                            disabled={idx === 0 || disabled}
                            className="min-h-[40px] px-2 py-1 rounded-xl bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] disabled:opacity-30 flex items-center justify-center gap-1 text-xs font-bold cursor-pointer"
                            title="تقديم للأمام"
                            aria-label="تقديم للأمام"
                          >
                            <ArrowUp className="w-3.5 h-3.5 sm:hidden" />
                            <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
                            <span>للأمام</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(idx, 'backward')}
                            disabled={idx === currentItems.length - 1 || disabled}
                            className="min-h-[40px] px-2 py-1 rounded-xl bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] disabled:opacity-30 flex items-center justify-center gap-1 text-xs font-bold cursor-pointer"
                            title="تأخير للخلف"
                            aria-label="تأخير للخلف"
                          >
                            <span>للخلف</span>
                            <ArrowDown className="w-3.5 h-3.5 sm:hidden" />
                            <ChevronLeft className="w-3.5 h-3.5 hidden sm:inline" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Helper text */}
      {helperText && (
        <p className="text-[11px] text-black/60 dark:text-white/60 mt-1.5">
          {helperText}
        </p>
      )}

      {/* SAFE DELETE CONFIRMATION MODAL */}
      {itemPendingDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-2xl w-full max-w-sm border border-black/10 dark:border-white/10 p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#211d18] dark:text-[#FAF6F2]">
                  تأكيد حذف الوسيط
                </h4>
                <p className="text-[11px] text-black/60 dark:text-white/60">
                  سيتم حذف الملف من Cloudinary وقاعدة البيانات نهائياً
                </p>
              </div>
            </div>

            {/* Thumbnail Preview */}
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/10 border border-black/10 dark:border-white/10">
              {isVideoUrl(itemPendingDelete.url) ? (
                <video src={itemPendingDelete.url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={itemPendingDelete.url} alt="معاينة الحذف" className="w-full h-full object-cover" />
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setItemPendingDelete(null)}
                disabled={isUploading}
                className="flex-1 min-h-[44px] rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-black/60 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-[#332A22]"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={executeConfirmedDelete}
                disabled={isUploading}
                className="flex-1 min-h-[44px] rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>نعم، احذف نهائياً</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Preview Modal */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="relative max-w-4xl max-h-[92vh] w-full bg-black/5 dark:bg-white/5 rounded-2xl p-2 sm:p-4 overflow-hidden flex flex-col items-center shadow-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-3 left-3 z-10 min-h-[44px] min-w-[44px] p-2 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer flex items-center justify-center"
              aria-label="إغلاق المعاينة"
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
                className="max-h-[78vh] w-auto max-w-full object-contain rounded-xl"
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
