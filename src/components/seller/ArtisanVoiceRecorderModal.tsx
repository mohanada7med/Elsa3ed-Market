import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Volume2,
  Sparkles,
  Loader2,
  Trash2,
  Headphones
} from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatTime } from '../products/artisan-voice/AudioControls';

export interface ArtisanVoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSaved?: (updatedProduct: Product) => void;
}

export const ArtisanVoiceRecorderModal: React.FC<ArtisanVoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  product,
  onSaved,
}) => {
  const { currentUser, saveArtisanVoice } = useApp();

  // Mode: 'record' or 'upload'
  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record');

  // Form Fields
  const [artisanName, setArtisanName] = useState(
    product.artisanName || currentUser.name || product.sellerName || ''
  );
  const [artisanCraft, setArtisanCraft] = useState(
    product.artisanCraft || (currentUser as any).specialty || product.categoryName || ''
  );
  const [transcript, setTranscript] = useState(product.transcript || '');
  const [existingAudioUrl, setExistingAudioUrl] = useState(product.audioUrl || '');

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedDataUri, setRecordedDataUri] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // Audio Preview Playback State
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);

  // Saving State
  const [isSaving, setIsSaving] = useState(false);

  // MediaRecorder Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset or update state on open
  useEffect(() => {
    if (isOpen) {
      setArtisanName(product.artisanName || currentUser.name || product.sellerName || '');
      setArtisanCraft(product.artisanCraft || (currentUser as any).specialty || product.categoryName || '');
      setTranscript(product.transcript || '');
      setExistingAudioUrl(product.audioUrl || '');
      setRecordedBlob(null);
      setRecordedDataUri(null);
      setIsRecording(false);
      setRecordingSeconds(0);
      setRecordingError(null);
      setIsPlayingPreview(false);
    } else {
      cleanupRecording();
    }
  }, [isOpen, product, currentUser]);

  const cleanupRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    setIsRecording(false);
    setIsPlayingPreview(false);
  };

  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  if (!isOpen) return null;

  // Start In-Browser Recording
  const handleStartRecording = async () => {
    setRecordingError(null);
    setRecordedBlob(null);
    setRecordedDataUri(null);
    setRecordingSeconds(0);
    chunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('متصفحك لا يدعم تسجيل الصوت المباشر من الميكروفون');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Determine supported mimeType
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(audioBlob);

        // Convert blob to Data URI
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setRecordedDataUri(reader.result as string);
        };
      };

      mediaRecorder.start(250); // Slice every 250ms
      setIsRecording(true);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 180) {
            // Auto stop at 3 minutes
            handleStopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Error starting recording:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setRecordingError('يرجى السماح بصلاحية الميكروفون من إعدادات المتصفح لتسجيل صوتك');
      } else {
        setRecordingError(err.message || 'تعذر تشغيل الميكروفون');
      }
      setIsRecording(false);
    }
  };

  // Stop Recording
  const handleStopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
  };

  // Play / Pause Preview
  const handleTogglePreview = () => {
    const audioSource = recordedDataUri || existingAudioUrl;
    if (!audioSource) return;

    if (!previewAudioRef.current) {
      const audio = new Audio(audioSource);
      audio.onloadedmetadata = () => {
        setPreviewDuration(audio.duration || recordingSeconds);
      };
      audio.ontimeupdate = () => {
        setPreviewCurrentTime(audio.currentTime);
      };
      audio.onended = () => {
        setIsPlayingPreview(false);
        setPreviewCurrentTime(0);
      };
      previewAudioRef.current = audio;
    }

    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play().then(() => {
        setIsPlayingPreview(true);
      });
    }
  };

  // Handle Audio File Selection (Upload from device)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRecordingError(null);
    if (file.size > 15 * 1024 * 1024) {
      setRecordingError('حجم الملف الصوتي كبير جداً (الحد الأقصى 15 ميجابايت)');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setRecordedDataUri(reader.result as string);
      setRecordedBlob(file);
      // Pre-populate audio duration if possible
      const tempAudio = new Audio(reader.result as string);
      tempAudio.onloadedmetadata = () => {
        setPreviewDuration(tempAudio.duration);
      };
    };
  };

  // Delete Current Audio
  const handleDeleteAudio = () => {
    setRecordedBlob(null);
    setRecordedDataUri(null);
    setExistingAudioUrl('');
    setPreviewCurrentTime(0);
    setPreviewDuration(0);
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
  };

  // Save Audio & Transcript
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setRecordingError(null);

    try {
      const finalAudioData = recordedDataUri || undefined;
      const finalAudioUrl = !recordedDataUri ? existingAudioUrl || undefined : undefined;

      const updated = await saveArtisanVoice(product.id, {
        audioData: finalAudioData,
        audioUrl: finalAudioUrl,
        transcript: transcript.trim() || undefined,
        artisanName: artisanName.trim() || undefined,
        artisanCraft: artisanCraft.trim() || undefined,
        audioDuration: previewDuration || recordingSeconds || undefined,
      });

      if (onSaved) {
        onSaved(updated);
      }
      onClose();
    } catch (err: any) {
      setRecordingError(err.message || 'فشل حفظ تسجيل الصوت');
    } finally {
      setIsSaving(false);
    }
  };

  const hasAudioToPlay = Boolean(recordedDataUri || existingAudioUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#FFF9EE] dark:bg-[#1B1009] border border-[#E0C79B] dark:border-primary/40 shadow-2xl p-5 sm:p-7 text-espresso dark:text-cream select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-amber-700/10 dark:bg-amber-400/10 text-amber-800 dark:text-amber-400">
              <Mic size={22} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-600/10 text-amber-700 dark:text-amber-300 text-[10px] font-black">
                <Sparkles size={11} />
                <span>خاص بالبائع صاحب الورشة • يظهر لكل الناس</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black mt-0.5">
                سجل صوتك لقطعة: {product.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-secondary dark:text-cream/60 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Message */}
        {recordingError && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{recordingError}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-5 space-y-5">
          {/* Audio Source Tabs */}
          <div className="flex p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('record')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'record'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-secondary hover:text-espresso dark:text-cream/70'
              }`}
            >
              <Mic size={15} />
              <span>تسجيل مباشر بالميكروفون</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-secondary hover:text-espresso dark:text-cream/70'
              }`}
            >
              <Upload size={15} />
              <span>رفع ملف صوتي مسجل</span>
            </button>
          </div>

          {/* Tab 1: Live Microphone Recording */}
          {activeTab === 'record' && (
            <div className="p-5 rounded-2xl bg-amber-950/5 dark:bg-black/30 border border-amber-900/15 dark:border-white/10 text-center space-y-4">
              {isRecording ? (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-bold animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    <span>جاري تسجيل صوتك الآن...</span>
                  </div>

                  <div className="font-mono text-3xl font-black text-amber-800 dark:text-amber-400">
                    {formatTime(recordingSeconds)}
                  </div>

                  <p className="text-xs text-secondary dark:text-cream/70">
                    اتكلم بلهجتك الطبيعية واحكي عن طريقتك وخاماتك وسر صنعتك
                  </p>

                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                  >
                    <Square size={16} className="fill-white" />
                    <span>إيقاف وإنهاء التسجيل</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs sm:text-sm text-secondary dark:text-cream/80">
                    اضغط على الزر وسجل حكايتك وصوتك من قلب ورشتك
                  </p>

                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 text-white font-black text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Mic size={18} />
                    <span>{hasAudioToPlay ? 'تسجيل صوت جديد للقطعة' : 'ابدأ التسجيل الصوتي الآن'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Upload Pre-recorded Audio File */}
          {activeTab === 'upload' && (
            <div className="p-5 rounded-2xl bg-amber-950/5 dark:bg-black/30 border border-dashed border-amber-900/30 dark:border-white/20 text-center space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload size={28} className="mx-auto text-amber-700 dark:text-amber-400" />
              <div>
                <p className="text-xs sm:text-sm font-bold">
                  اختر ملفاً صوتياً من جهازك (MP3, WAV, M4A, OGG)
                </p>
                <p className="text-[11px] text-secondary dark:text-cream/60 mt-0.5">
                  الحد الأقصى لحجم الملف: 15 ميجابايت
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover cursor-pointer"
              >
                <span>اختيار الملف الصوتي</span>
              </button>
            </div>
          )}

          {/* Audio Preview Player (If Recorded or Existing) */}
          {hasAudioToPlay && !isRecording && (
            <div className="p-4 rounded-2xl bg-amber-800/10 dark:bg-amber-400/10 border border-amber-800/20 dark:border-amber-400/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                  <Headphones size={15} />
                  <span>معاينة التسجيل الصوتي قبل النشر:</span>
                </div>

                <button
                  type="button"
                  onClick={handleDeleteAudio}
                  className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 font-bold cursor-pointer"
                  title="حذف التسجيل"
                >
                  <Trash2 size={13} />
                  <span>حذف التسجيل</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTogglePreview}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-700 text-white hover:bg-amber-800 transition-colors cursor-pointer shrink-0"
                >
                  {isPlayingPreview ? (
                    <Pause size={17} className="fill-white" />
                  ) : (
                    <Play size={17} className="fill-white ml-0.5" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-secondary dark:text-cream/70 mb-1">
                    <span>{formatTime(previewCurrentTime)}</span>
                    <span>{formatTime(previewDuration || recordingSeconds)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-amber-600 transition-all duration-100"
                      style={{
                        width: `${
                          previewDuration > 0
                            ? (previewCurrentTime / previewDuration) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Artisan Identity Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-foreground">اسم الحرفي / صانع القطعة:</label>
              <input
                type="text"
                value={artisanName}
                onChange={(e) => setArtisanName(e.target.value)}
                placeholder="مثال: الأسطى سيد، الست أمونة"
                className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">تخصص وصفة الحرفي:</label>
              <input
                type="text"
                value={artisanCraft}
                onChange={(e) => setArtisanCraft(e.target.value)}
                placeholder="مثال: شيخ فخاراني بالحميدات، نسّاجة أخميم"
                className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Transcript Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-foreground">
                الحكاية المكتوبة بلسانك (نص الحكاية المنطوق):
              </label>
              <span className="text-[10px] text-secondary dark:text-cream/60">
                تظهر تحت التسجيل ويقدر الزوار ينسخوها ويشاركوها
              </span>
            </div>
            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="اكتب هنا ما قلته في التسجيل أو حكاية القطعة التراثية وسر الصنعة باللهجة الصعيدية أو المصرية التلقائية..."
              className="w-full px-3 py-2.5 bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl text-xs sm:text-sm outline-none focus:border-primary resize-none leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-black/10 dark:border-white/10">
            <span className="text-[11px] text-secondary dark:text-cream/70 font-medium hidden sm:inline">
              بمجرد الحفظ، يظهر صوتك وحكايتك فوراً لجميع المشترين في صفحة المنتج
            </span>

            <div className="flex items-center gap-2 mr-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-bold text-secondary hover:text-espresso dark:text-cream/70 cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="submit"
                disabled={isSaving || isRecording || (!hasAudioToPlay && !transcript.trim())}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>جاري الحفظ والنشر...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>حفظ ونشر صوت الحرفي للجميع</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
