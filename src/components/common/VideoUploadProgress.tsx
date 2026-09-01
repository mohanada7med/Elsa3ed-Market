import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Film,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
  Play,
  Pause,
  Cloud,
  FileVideo,
  Sparkles,
  Loader2,
  Trash2
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useApp } from '../../context/AppContext.tsx';

export type VideoUploadState = 'idle' | 'selected' | 'uploading' | 'processing' | 'success' | 'error' | 'cancelled';

export interface VideoUploadProgressProps {
  id?: string;
  initialVideoUrl?: string;
  initialCloudinaryPublicId?: string;
  targetSellerId?: string;
  sellerId?: string;
  currentUser?: any;
  maxSizeBytes?: number; // default 2GB (Cloudinary chunked upload)
  onUploadSuccess: (result: {
    url: string;
    fileKey: string;
    cloudinaryPublicId: string;
    duration?: number;
    format?: string;
    fileSize?: number;
    filename?: string;
  }) => void;
  onUploadStart?: () => void;
  onUploadCancel?: () => void;
  onVideoRemoved?: () => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
}

export const VideoUploadProgress: React.FC<VideoUploadProgressProps> = ({
  id = 'video-upload-component',
  initialVideoUrl,
  initialCloudinaryPublicId,
  targetSellerId,
  sellerId,
  currentUser,
  maxSizeBytes = 2048 * 1024 * 1024, // 2GB
  onUploadSuccess,
  onUploadStart,
  onUploadCancel,
  onVideoRemoved,
  onUploadError,
  disabled = false
}) => {
  const { currentUser: authUser } = useApp();
  const user = currentUser || authUser;
  const effectiveSellerId = sellerId || targetSellerId;

  const [uploadState, setUploadState] = useState<VideoUploadState>(
    initialVideoUrl ? 'success' : 'idle'
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialVideoUrl || '');
  const [uploadedUrl, setUploadedUrl] = useState<string>(initialVideoUrl || '');
  const [uploadedPublicId, setUploadedPublicId] = useState<string>(initialCloudinaryPublicId || '');

  // Progress metrics
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [loadedBytes, setLoadedBytes] = useState<number>(0);
  const [totalBytes, setTotalBytes] = useState<number>(0);
  const [currentChunk, setCurrentChunk] = useState<number>(1);
  const [totalChunks, setTotalChunks] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number | null>(null);

  // Video playback preview
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cancelUploadRef = useRef<(() => void) | null>(null);

  // Clean up object URLs on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Sync initial video url changes
  useEffect(() => {
    if (initialVideoUrl && uploadState === 'idle') {
      setUploadedUrl(initialVideoUrl);
      setPreviewUrl(initialVideoUrl);
      if (initialCloudinaryPublicId) {
        setUploadedPublicId(initialCloudinaryPublicId);
      }
      setUploadState('success');
    }
  }, [initialVideoUrl, initialCloudinaryPublicId]);

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const handleFileSelect = (file: File) => {
    // Validate format
    const validMimes = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/ogg',
      'video/x-matroska',
      'video/3gpp',
      'video/x-msvideo'
    ];
    const isMimeValid = validMimes.includes(file.type) || file.type.startsWith('video/');
    const isExtValid = /\.(mp4|webm|mov|ogg|mkv|avi|3gp)$/i.test(file.name);

    if (!isMimeValid && !isExtValid) {
      setErrorMessage('صيغة الفيديو غير مدعومة. يرجى اختيار ملف MP4 أو WebM أو MOV.');
      setUploadState('error');
      return;
    }

    // Validate size (up to 2GB)
    if (file.size > maxSizeBytes) {
      setErrorMessage(`حجم الفيديو (${formatFileSize(file.size)}) يتجاوز الحد الأقصى المسموح (${formatFileSize(maxSizeBytes)}).`);
      setUploadState('error');
      return;
    }

    if (file.size <= 0) {
      setErrorMessage('الملف المحدد فارغ أو تالف.');
      setUploadState('error');
      return;
    }

    // Revoke old blob url if exists
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    const localUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(localUrl);
    setTotalBytes(file.size);
    setLoadedBytes(0);
    setProgressPercent(0);
    setCurrentChunk(1);
    setTotalChunks(Math.ceil(file.size / (6 * 1024 * 1024)) || 1);
    setErrorMessage('');
    setUploadState('selected');
  };

  const startUpload = async (fileToUpload?: File) => {
    const targetFile = fileToUpload || selectedFile;
    if (!targetFile || !user) {
      setErrorMessage('يرجى تسجيل الدخول واختيار ملف فيديو صالح للرفع.');
      setUploadState('error');
      return;
    }

    setUploadState('uploading');
    setProgressPercent(0);
    setLoadedBytes(0);
    setTotalBytes(targetFile.size);
    setCurrentChunk(1);
    setTotalChunks(Math.ceil(targetFile.size / (6 * 1024 * 1024)) || 1);
    setErrorMessage('');
    onUploadStart?.();

    try {
      const result = await api.uploadReelVideoWithProgress({
        user,
        file: targetFile,
        targetSellerId: effectiveSellerId,
        onProgress: ({ loaded, total, percentage, state, currentChunk: curChunk, totalChunks: totChunks }) => {
          setLoadedBytes(loaded);
          setTotalBytes(total);
          setProgressPercent(percentage);
          if (curChunk) setCurrentChunk(curChunk);
          if (totChunks) setTotalChunks(totChunks);
          if (state === 'processing') {
            setUploadState('processing');
          }
        },
        onCancelRef: (cancelFn) => {
          cancelUploadRef.current = cancelFn;
        }
      });

      setUploadedUrl(result.url);
      setUploadedPublicId(result.cloudinaryPublicId);
      setProgressPercent(100);
      setUploadState('success');

      onUploadSuccess({
        url: result.url,
        fileKey: result.fileKey,
        cloudinaryPublicId: result.cloudinaryPublicId,
        duration: result.duration || videoDuration || undefined,
        format: result.format,
        fileSize: targetFile.size,
        filename: targetFile.name
      });
    } catch (err: any) {
      if (err?.message === 'تم إلغاء عملية الرفع') {
        setUploadState('cancelled');
        setErrorMessage('تم إلغاء عملية الرفع.');
        onUploadCancel?.();
      } else {
        const errorText = err?.message || 'فشل في رفع الفيديو. تحقق من اتصالك وحاول مرة أخرى.';
        setUploadState('error');
        setErrorMessage(errorText);
        onUploadError?.(errorText);
      }
    } finally {
      cancelUploadRef.current = null;
    }
  };

  const handleCancelUpload = () => {
    if (cancelUploadRef.current) {
      cancelUploadRef.current();
    } else {
      setUploadState('cancelled');
      setErrorMessage('تم إلغاء عملية الرفع.');
      onUploadCancel?.();
    }
  };

  const handleRemoveVideo = async () => {
    // Clean up uploaded Cloudinary asset if previously uploaded in this session
    if (uploadedPublicId && user) {
      api.deleteReelAsset(user, uploadedPublicId).catch(() => {});
    }

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl('');
    setUploadedUrl('');
    setUploadedPublicId('');
    setProgressPercent(0);
    setLoadedBytes(0);
    setTotalBytes(0);
    setErrorMessage('');
    setUploadState('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onVideoRemoved?.();
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div id={id} className="w-full space-y-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/ogg,video/x-matroska"
        className="hidden"
        disabled={disabled || uploadState === 'uploading' || uploadState === 'processing'}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileSelect(file);
          }
        }}
      />

      {/* IDLE STATE: Dropzone */}
      {uploadState === 'idle' && (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (disabled) return;
            const file = e.dataTransfer.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            disabled
              ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
              : 'border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/80 shadow-xs'
          }`}
        >
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-100/80 flex items-center justify-center text-amber-700 shadow-inner">
            <Upload className="w-7 h-7 animate-pulse" />
          </div>
          <h4 className="text-base font-semibold text-gray-900 mb-1">
            اختر أو اسحب مقطع فيديو الريلز هنا
          </h4>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-3">
            يدعم صيغ MP4, WebM, MOV بحجم يصل حتى {formatFileSize(maxSizeBytes)} مع رفع سحابي مباشر وسريع
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
            <FileVideo className="w-4 h-4" />
            <span>تصفح ملفات الفيديو</span>
          </div>
        </div>
      )}

      {/* SELECTED STATE: Ready to upload */}
      {uploadState === 'selected' && selectedFile && (
        <div className="border border-amber-200 bg-white rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                  <span>الحجم: {formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span>النوع: {selectedFile.type || 'فيديو'}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveVideo}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="إلغاء واختيار ملف آخر"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Local Preview Box */}
          {previewUrl && (
            <div className="relative aspect-video max-h-48 rounded-lg overflow-hidden bg-black/90 flex items-center justify-center">
              <video
                ref={videoRef}
                src={previewUrl}
                className="w-full h-full object-contain"
                onLoadedMetadata={(e) => {
                  setVideoDuration(e.currentTarget.duration);
                }}
                onEnded={() => setIsPlaying(false)}
              />
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-transform hover:scale-105"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              تغيير الفيديو
            </button>
            <button
              type="button"
              onClick={() => startUpload()}
              disabled={disabled}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-all hover:shadow"
            >
              <Cloud className="w-4 h-4" />
              <span>بدء الرفع السحابي الفعلي</span>
            </button>
          </div>
        </div>
      )}

      {/* UPLOADING STATE: Real Progress Indicator */}
      {uploadState === 'uploading' && (
        <div className="border border-amber-300 bg-amber-50/50 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span>جاري رفع الفيديو سحابياً...</span>
                  {totalChunks > 1 && (
                    <span className="text-[11px] font-normal px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded-full font-sans">
                      الجزء {currentChunk} من {totalChunks}
                    </span>
                  )}
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  تم نقل {formatFileSize(loadedBytes)} من إجمالي {formatFileSize(totalBytes)} (مباشر إلى Cloudinary)
                </p>
              </div>
            </div>
            <div className="text-left">
              <span className="text-xl font-extrabold text-amber-700 tabular-nums">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Real progress track */}
          <div className="relative w-full h-3 bg-amber-200/70 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium truncate max-w-[200px]">
              {selectedFile?.name}
            </span>
            <button
              type="button"
              onClick={handleCancelUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>إلغاء الرفع</span>
            </button>
          </div>
        </div>
      )}

      {/* PROCESSING STATE: 100% Uploaded, Cloudinary / Server processing */}
      {uploadState === 'processing' && (
        <div className="border border-blue-200 bg-blue-50/60 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">تم اكتمال الرفع — جاري المعالجة السحابية</h4>
                <p className="text-xs text-blue-800 mt-0.5">
                  جاري ضغط وترميز الفيديو وتوثيق الرابط الآمن على Cloudinary...
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
              100%
            </span>
          </div>

          <div className="relative w-full h-3 bg-blue-200/70 rounded-full overflow-hidden">
            <div className="h-full w-full bg-blue-600 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* SUCCESS STATE: Video successfully stored */}
      {uploadState === 'success' && (
        <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">✓ تم رفع الفيديو وتوثيقه بنجاح</h4>
                <p className="text-xs text-emerald-700">
                  تم حفظ الفيديو سحابياً برابط دائم ومؤمن
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-100/80 hover:bg-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors"
                title="استبدال الفيديو"
              >
                استبدال
              </button>
              <button
                type="button"
                onClick={handleRemoveVideo}
                disabled={disabled}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="حذف الفيديو"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Video Preview */}
          {(previewUrl || uploadedUrl) && (
            <div className="relative aspect-video max-h-48 rounded-lg overflow-hidden bg-black/90 flex items-center justify-center">
              <video
                ref={videoRef}
                src={previewUrl || uploadedUrl}
                controls
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {uploadedPublicId && (
            <div className="text-[11px] text-gray-500 font-mono bg-white/80 p-2 rounded-lg border border-emerald-100 truncate">
              <span className="text-gray-400 font-sans">المعرف السحابي: </span>
              {uploadedPublicId}
            </div>
          )}
        </div>
      )}

      {/* ERROR STATE */}
      {uploadState === 'error' && (
        <div className="border border-red-200 bg-red-50/80 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-950">فشل في رفع الفيديو</h4>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">
                {errorMessage || 'حدث خطأ غير متوقع أثناء الرفع السحابي. يرجى إعادة المحاولة.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-red-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-red-100/50 transition-colors"
            >
              اختيار ملف آخر
            </button>
            {selectedFile && (
              <button
                type="button"
                onClick={() => startUpload()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-lg shadow-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* CANCELLED STATE */}
      {uploadState === 'cancelled' && (
        <div className="border border-gray-200 bg-gray-50 rounded-xl p-4 text-center space-y-3">
          <p className="text-sm font-medium text-gray-700">تم إلغاء عملية رفع الفيديو بنجاح</p>
          <div className="flex items-center justify-center gap-2">
            {selectedFile && (
              <button
                type="button"
                onClick={() => startUpload()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3.5 py-1.5 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>بدء الرفع مجدداً</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              اختيار فيديو آخر
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
