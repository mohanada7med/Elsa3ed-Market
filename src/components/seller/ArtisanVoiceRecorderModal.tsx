import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Headphones,
  FileAudio,
  FileText,
  Radio
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
  const supportsSpeechRecognition =
    typeof window !== 'undefined' &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

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
  const [isRequestingMic, setIsRequestingMic] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFinalizingRecording, setIsFinalizingRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedPreviewUrl, setRecordedPreviewUrl] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // Live Speech-to-Text Transcription State (تفريغ الكلام المنطوق مباشرة من الريكورد)
  const [liveSpokenText, setLiveSpokenText] = useState<string>('');
  const [transcriptionSuccess, setTranscriptionSuccess] = useState<boolean>(false);
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [speechRecognitionError, setSpeechRecognitionError] = useState<string | null>(null);

  // Audio Preview Playback State
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);

  // Saving State
  const [isSaving, setIsSaving] = useState(false);

  // Media & Recognition Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const recordedPreviewUrlRef = useRef<string | null>(null);
  const previewAudioSourceRef = useRef<string | null>(null);

  // Web Speech API Recognition Reference
  const recognitionRef = useRef<any>(null);
  const dictationRecognitionRef = useRef<any>(null);
  const speechAccumulatedRef = useRef<string>('');
  const speechRecognitionUnavailableRef = useRef(false);

  // Clean up all recording and speech recognition resources
  const cleanupRecording = useCallback(() => {
    isRecordingRef.current = false;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Safe ignore
      }
      recognitionRef.current = null;
    }

    if (dictationRecognitionRef.current) {
      try {
        dictationRecognitionRef.current.abort();
      } catch {
        // Safe ignore
      }
      dictationRecognitionRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      try {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch {
        mediaRecorderRef.current = null;
      }
      mediaRecorderRef.current = null;
    }

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch {
        // Safe ignore
      }
      streamRef.current = null;
    }

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
      previewAudioSourceRef.current = null;
    }

    if (recordedPreviewUrlRef.current) {
      URL.revokeObjectURL(recordedPreviewUrlRef.current);
      recordedPreviewUrlRef.current = null;
    }

    setIsRequestingMic(false);
    setIsRecording(false);
    setIsFinalizingRecording(false);
    setIsDictating(false);
    setIsPlayingPreview(false);
  }, []);

  // Reset or update state on open
  useEffect(() => {
    if (isOpen) {
      setArtisanName(product.artisanName || currentUser.name || product.sellerName || '');
      setArtisanCraft(product.artisanCraft || (currentUser as any).specialty || product.categoryName || '');
      setTranscript(product.transcript || '');
      setExistingAudioUrl(product.audioUrl || '');
      if (recordedPreviewUrlRef.current) {
        URL.revokeObjectURL(recordedPreviewUrlRef.current);
        recordedPreviewUrlRef.current = null;
      }
      setRecordedPreviewUrl(null);
      setRecordedBlob(null);
      setIsRequestingMic(false);
      setIsRecording(false);
      setIsFinalizingRecording(false);
      setRecordingSeconds(0);
      setRecordingError(null);
      setLiveSpokenText('');
      setSpeechRecognitionError(null);
      setPreviewCurrentTime(0);
      setPreviewDuration(0);
      setIsPlayingPreview(false);
      setTranscriptionSuccess(Boolean(product.transcript));
      setIsPlayingPreview(false);
      setIsDictating(false);
      isRecordingRef.current = false;
      speechAccumulatedRef.current = '';
    } else {
      cleanupRecording();
    }
  }, [isOpen, product, currentUser, cleanupRecording]);

  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, [cleanupRecording]);

  if (!isOpen) return null;

  // Safe MimeType detection
  const getSupportedMimeType = (): string | undefined => {
    if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) {
      return undefined;
    }
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4;codecs=mp4a.40.2',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus',
      'audio/ogg',
    ];
    for (const candidate of candidates) {
      try {
        if (MediaRecorder.isTypeSupported(candidate)) {
          return candidate;
        }
      } catch {
        // Continue
      }
    }
    return undefined;
  };

  const setRecordedAudio = (blob: Blob) => {
    if (recordedPreviewUrlRef.current) {
      URL.revokeObjectURL(recordedPreviewUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(blob);
    recordedPreviewUrlRef.current = previewUrl;
    previewAudioSourceRef.current = null;
    setRecordedPreviewUrl(previewUrl);
    setRecordedBlob(blob);
    setIsPlayingPreview(false);

    const audio = new Audio(previewUrl);
    audio.onloadedmetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setPreviewDuration(audio.duration);
      }
    };
  };

  const convertBlobToDataUri = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('تعذر تجهيز الملف الصوتي للحفظ'));
        }
      };
      reader.onerror = () => reject(new Error('تعذر قراءة الملف الصوتي، حاول تسجيله أو اختياره مرة أخرى'));
      reader.readAsDataURL(blob);
    });

  // START RECORDING with Simultaneous Real-Time Speech Recognition (Speech-to-Text)
  const handleStartRecording = async () => {
    setRecordingError(null);
    setRecordedBlob(null);
    setIsFinalizingRecording(false);
    setRecordingSeconds(0);
    chunksRef.current = [];
    speechAccumulatedRef.current = '';
    setLiveSpokenText('');
    setSpeechRecognitionError(null);
    speechRecognitionUnavailableRef.current = false;
    setTranscriptionSuccess(false);
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setRecordingError('التسجيل المباشر غير مدعوم على هذا المتصفح أو الاتصال. افتح الموقع عبر HTTPS أو ارفع ملفاً صوتياً جاهزاً.');
      return;
    }

    let stream: MediaStream | null = null;
    setIsRequestingMic(true);

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const supportedMime = getSupportedMimeType();
      const mediaRecorder = supportedMime
        ? new MediaRecorder(stream, { mimeType: supportedMime, audioBitsPerSecond: 64000 })
        : new MediaRecorder(stream);

      streamRef.current = stream;
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        try {
          const audioBlob = new Blob(chunksRef.current, {
            type: mediaRecorder.mimeType || supportedMime || 'audio/webm',
          });
          if (audioBlob.size === 0) {
            setRecordingError('التسجيل فاضي. تأكد من السماح للمتصفح باستخدام الميكروفون ثم حاول مرة تانية.');
          } else if (audioBlob.size > 3 * 1024 * 1024) {
            setRecordingError('حجم التسجيل أكبر من 3 ميجابايت. قصّر مدة التسجيل أو ارفع ملفاً أصغر.');
          } else {
            setRecordedAudio(audioBlob);
          }

          if (speechAccumulatedRef.current.trim()) {
            setTranscript(speechAccumulatedRef.current.trim());
            setTranscriptionSuccess(true);
          }
        } catch (stopError) {
          console.error('[MediaRecorder] Error processing recording:', stopError);
          setRecordingError('تعذر تجهيز التسجيل. حاول مرة تانية أو ارفع ملفاً صوتياً جاهزاً.');
        } finally {
          stream?.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          mediaRecorderRef.current = null;
          setIsFinalizingRecording(false);
        }
      };
      mediaRecorder.onerror = () => {
        setRecordingError('حصلت مشكلة أثناء التسجيل. جرّب مرة تانية أو ارفع ملفاً صوتياً جاهزاً.');
      };
      try {
        mediaRecorder.start(250);
      } catch {
        mediaRecorder.start();
      }
      setIsRecording(true);
      isRecordingRef.current = true;

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = 'ar-EG';
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.maxAlternatives = 1;
          recognition.onresult = (event: any) => {
            let currentSessionText = '';
            for (let i = 0; i < event.results.length; i++) {
              const result = event.results[i];
              if (result?.[0]?.transcript) currentSessionText += `${result[0].transcript} `;
            }
            const cleaned = currentSessionText.trim();
            if (cleaned) {
              speechAccumulatedRef.current = cleaned;
              setLiveSpokenText(cleaned);
              setTranscript(cleaned);
              setTranscriptionSuccess(true);
            }
          };
          recognition.onerror = (event: any) => {
            if (event.error === 'no-speech' || event.error === 'aborted') return;
            speechRecognitionUnavailableRef.current = true;
            setSpeechRecognitionError('الإملاء الصوتي غير متاح حالياً. التسجيل مستمر، وتقدر تكتب الحكاية يدوياً.');
            console.warn('[SpeechRecognition] Transcription unavailable:', event.error);
          };
          recognition.onend = () => {
            if (isRecordingRef.current && !speechRecognitionUnavailableRef.current) {
              try {
                recognition.start();
              } catch {
                // Recognition may stop on mobile; audio recording continues independently.
              }
            }
          };
          recognition.start();
          recognitionRef.current = recognition;
        } catch (speechError) {
          console.warn('[SpeechRecognition] Could not start speech recognition:', speechError);
        }
      }

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((previous) => {
          if (previous >= 179) {
            window.setTimeout(handleStopRecording, 0);
            return 180;
          }
          return previous + 1;
        });
      }, 1000);
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      mediaRecorderRef.current = null;
      cleanupRecording();
      const errorName = (error as DOMException)?.name;
      setRecordingError(
        errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError'
          ? 'لم يتم السماح باستخدام الميكروفون. فعّل إذن الميكروفون للموقع أو ارفع ملفاً صوتياً جاهزاً.'
          : errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError'
            ? 'لم يتم العثور على ميكروفون متاح. وصّل ميكروفوناً أو ارفع ملفاً صوتياً جاهزاً.'
            : 'تعذر بدء التسجيل. تأكد من اتصال آمن HTTPS ومن عمل الميكروفون ثم حاول مرة تانية.'
      );
    } finally {
      setIsRequestingMic(false);
    }
  };

  // STOP RECORDING
  const handleStopRecording = () => {
    isRecordingRef.current = false;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Stop real-time speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }

    const finalDuration = recordingSeconds;
    setPreviewDuration(finalDuration);

    // If actual words were recognized from the voice recording, enforce them in the transcript
    if (speechAccumulatedRef.current.trim()) {
      setTranscript(speechAccumulatedRef.current.trim());
      setTranscriptionSuccess(true);
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        setIsFinalizingRecording(true);
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error('[ArtisanVoiceRecorder] Recorder stop failed:', err);
        setRecordingError('تعذر إنهاء التسجيل. لم يتم حفظ تسجيل غير مكتمل.');
        setIsFinalizingRecording(false);
      }
    } else {
      setRecordingError('لم يتم العثور على تسجيل صالح. حاول تسجيل الصوت مرة تانية.');
      setIsFinalizingRecording(false);
    }

    setIsRecording(false);
  };

  // Cancel in-progress recording
  const handleCancelRecording = () => {
    cleanupRecording();
    setRecordedBlob(null);
    setRecordedPreviewUrl(null);
    setIsFinalizingRecording(false);
    setRecordingSeconds(0);
    setLiveSpokenText('');
    speechAccumulatedRef.current = '';
    setRecordingError(null);
  };

  // Dedicated Direct Voice Dictation (إملاء صوتي إضافي في خانة الحكاية)
  const handleToggleDictation = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecordingError('متصفحك الحالي لا يدعم ميزة الإملاء الصوتي المباشر. يمكنك استخدام Chrome أو Edge أو كتابة النص يدوياً.');
      return;
    }

    if (isDictating) {
      if (dictationRecognitionRef.current) {
        try {
          dictationRecognitionRef.current.stop();
        } catch {
          // ignore
        }
        dictationRecognitionRef.current = null;
      }
      setIsDictating(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-EG';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        const previousText = transcript.trim();

        recognition.onresult = (event: any) => {
          let newlyDictated = '';
          for (let i = 0; i < event.results.length; i++) {
            const res = event.results[i];
            if (res && res[0] && res[0].transcript) {
              newlyDictated += res[0].transcript + ' ';
            }
          }
          const combined = previousText
            ? `${previousText} ${newlyDictated.trim()}`
            : newlyDictated.trim();
          setTranscript(combined);
          setTranscriptionSuccess(true);
        };

        recognition.onerror = () => {
          setIsDictating(false);
        };

        recognition.onend = () => {
          setIsDictating(false);
        };

        recognition.start();
        dictationRecognitionRef.current = recognition;
        setIsDictating(true);
        setRecordingError(null);
      } catch (err: any) {
        console.warn('[Dictation] Error:', err);
        setIsDictating(false);
      }
    }
  };

  // Play / Pause Preview Player
  const handleTogglePreview = () => {
    const audioSource = recordedPreviewUrl || existingAudioUrl;
    if (!audioSource) return;

    if (!previewAudioRef.current || previewAudioSourceRef.current !== audioSource) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      const audio = new Audio(audioSource);
      previewAudioSourceRef.current = audioSource;
      audio.onloadedmetadata = () => {
        setPreviewDuration(audio.duration || recordingSeconds || 30);
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
      previewAudioRef.current
        .play()
        .then(() => {
          setIsPlayingPreview(true);
        })
        .catch((playErr) => {
          console.warn('Preview play interrupted:', playErr);
          setIsPlayingPreview(false);
        });
    }
  };

  // File Upload Handler (MP3, WAV, M4A, OGG)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRecordingError(null);
    const mimeByExtension: Record<string, string> = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      m4a: 'audio/mp4',
      mp4: 'audio/mp4',
      ogg: 'audio/ogg',
      aac: 'audio/aac',
      webm: 'audio/webm',
      '3gp': 'audio/3gpp'
    };
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const reportedMime = file.type.toLowerCase().split(';')[0];
    const supportedMime = new Set([
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav',
      'audio/x-wav',
      'audio/x-m4a',
      'audio/ogg',
      'audio/aac',
      'audio/3gpp'
    ]);
    const detectedMime = supportedMime.has(reportedMime)
      ? reportedMime
      : mimeByExtension[extension];
    if (!detectedMime || !supportedMime.has(detectedMime)) {
      setRecordingError('اختار ملف صوتي بصيغة MP3 أو WAV أو M4A أو OGG أو WebM.');
      e.target.value = '';
      return;
    }
    if (file.size === 0) {
      setRecordingError('الملف الصوتي فاضي. اختار ملفاً صالحاً وحاول مرة تانية.');
      e.target.value = '';
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setRecordingError('حجم الملف الصوتي أكبر من 3 ميجابايت. اختار ملفاً أصغر أو قصّر مدة التسجيل.');
      e.target.value = '';
      return;
    }

    const normalizedFile = file.type === detectedMime
      ? file
      : new Blob([file], { type: detectedMime });
    setRecordedAudio(normalizedFile);
    setPreviewCurrentTime(0);
    setRecordingSeconds(0);
    setLiveSpokenText('');
    speechAccumulatedRef.current = '';
    e.target.value = '';
  };

  // Delete current audio
  const handleDeleteAudio = () => {
    setRecordedBlob(null);
    setRecordedPreviewUrl(null);
    if (recordedPreviewUrlRef.current) {
      URL.revokeObjectURL(recordedPreviewUrlRef.current);
      recordedPreviewUrlRef.current = null;
    }
    setExistingAudioUrl('');
    setPreviewCurrentTime(0);
    setPreviewDuration(0);
    setLiveSpokenText('');
    speechAccumulatedRef.current = '';
    setTranscriptionSuccess(false);
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
      previewAudioSourceRef.current = null;
    }
    setIsPlayingPreview(false);
  };

  // Save Audio & Transcript to Product
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFinalizingRecording) return;
    setIsSaving(true);
    setRecordingError(null);

    try {
      if (recordedBlob && (recordedBlob.size === 0 || recordedBlob.size > 3 * 1024 * 1024)) {
        throw new Error('التسجيل غير صالح أو أكبر من الحد المسموح (3 ميجابايت).');
      }

      const finalAudioData = recordedBlob
        ? await convertBlobToDataUri(recordedBlob)
        : undefined;
      const finalAudioUrl = !recordedBlob ? existingAudioUrl || undefined : undefined;
      if (!finalAudioData && !finalAudioUrl && !transcript.trim()) {
        throw new Error('سجّل أو ارفع ملفاً صوتياً أو اكتب الحكاية قبل الحفظ.');
      }

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

  const hasAudioToPlay = Boolean(recordedBlob || existingAudioUrl);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:items-center sm:p-4 backdrop-blur-sm animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="artisan-voice-title"
        className="relative w-full max-w-xl max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1rem)] overflow-y-auto overscroll-contain rounded-t-3xl sm:rounded-3xl bg-[#FFF9EE] dark:bg-[#1B1009] border border-[#E0C79B] dark:border-primary/40 shadow-2xl p-4 sm:p-7 text-espresso dark:text-cream select-none"
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
                <span>تسجيل صوتي • الإملاء حسب دعم المتصفح</span>
              </div>
              <h3 id="artisan-voice-title" className="break-words text-base sm:text-xl font-black mt-0.5">
                سجل صوتك لقطعة: {product.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving || isRecording || isFinalizingRecording || isRequestingMic}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-secondary dark:text-cream/60 transition-colors cursor-pointer disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        {/* Informative Alert / Error Banner */}
        {recordingError && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-amber-600" />
              <span>{recordingError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-5 space-y-5">
          {/* Audio Source Tabs */}
          <div className="flex p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[10px] sm:text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('record')}
              className={`min-h-11 flex-1 px-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${activeTab === 'record'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'text-secondary hover:text-espresso dark:text-cream/70'
                }`}
            >
              <Mic size={15} />
              <span>تسجيل صوتي</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`min-h-11 flex-1 px-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${activeTab === 'upload'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'text-secondary hover:text-espresso dark:text-cream/70'
                }`}
            >
              <Upload size={15} />
              <span>رفع تسجيل</span>
            </button>
          </div>

          {/* TAB 1: Live Voice Recording */}
          {activeTab === 'record' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-amber-950/5 dark:bg-black/30 border border-amber-900/15 dark:border-white/10 text-center space-y-4">
              {isRecording ? (
                /* ACTIVE RECORDING STATE WITH LIVE TRANSCRIPTION */
                <div className="space-y-4">
                  {/* Status Indicator */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    <span>جاري تسجيل صوتك... أوقف التسجيل بعد ما تخلص</span>
                  </div>

                  {/* Dynamic Sound Wave Pulse Animation */}
                  <div className="flex items-center justify-center gap-1.5 h-12 py-1">
                    {[40, 75, 55, 90, 60, 100, 70, 85, 45, 95, 65, 80, 50, 90, 70, 60].map(
                      (h, i) => (
                        <span
                          key={i}
                          className="w-1.5 rounded-full bg-gradient-to-t from-red-600 to-amber-500 animate-pulse"
                          style={{
                            height: `${h}%`,
                            animationDelay: `${(i * 0.08).toFixed(2)}s`,
                            animationDuration: '0.8s',
                          }}
                        />
                      )
                    )}
                  </div>

                  {/* Digital Recording Clock */}
                  <div className="font-mono text-3xl sm:text-4xl font-black text-amber-800 dark:text-amber-400">
                    {formatTime(recordingSeconds)}
                    <span className="text-xs text-secondary dark:text-cream/50 mr-2 font-normal font-sans">
                      (الحد الأقصى 03:00)
                    </span>
                  </div>

                  {/* Real-Time Live Speech-to-Text Box (الكلام المنطوق مباشرة من الريكورد) */}
                  <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-amber-600/25 text-right space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-800 dark:text-amber-300">
                        <Sparkles size={13} className="text-amber-600 animate-spin" />
                        <span>الإملاء الصوتي المباشر:</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        {speechRecognitionError
                          ? 'التسجيل شغال؛ الإملاء غير متاح'
                          : supportsSpeechRecognition
                            ? 'متاح في متصفحك'
                            : 'اكتب الحكاية يدوياً'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-black/40 border border-black/5 min-h-[2.5rem] text-xs sm:text-sm font-semibold text-espresso dark:text-cream leading-relaxed select-text">
                      {liveSpokenText ? (
                        <span className="text-amber-900 dark:text-amber-200">« {liveSpokenText} »</span>
                      ) : (
                        <span className="text-secondary/60 dark:text-cream/40 italic">
                          {speechRecognitionError
                            ? speechRecognitionError
                            : supportsSpeechRecognition
                            ? 'اتكلم بحريتك.. الكلمات المدعومة هتظهر هنا، وتقدر تراجعها وتعدلها.'
                            : 'الإملاء الصوتي مش مدعوم في المتصفح ده. اكتب حكايتك في الخانة تحت.'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons During Recording */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleStopRecording}
                      className="inline-flex min-h-12 items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-xl transition-all active:scale-95 cursor-pointer w-full sm:w-auto"
                    >
                      <Square size={17} className="fill-white" />
                      <span>إيقاف ومراجعة التسجيل</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelRecording}
                      className="min-h-11 px-4 text-xs font-bold text-secondary dark:text-cream/60 hover:text-red-600 transition-colors cursor-pointer py-1"
                    >
                      إلغاء والبدء من جديد
                    </button>
                  </div>
                </div>
              ) : (
                /* IDLE STATE: READY TO RECORD */
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-black text-espresso dark:text-cream">
                      سجل صوت القطعة، وبعدها راجع التسجيل قبل ما تحفظه
                    </p>
                    <p className="text-xs text-secondary dark:text-cream/70 max-w-md mx-auto">
                      لو متصفحك بيدعم الإملاء الصوتي، هتظهر الكلمات أثناء التسجيل. وتقدر تكتب الحكاية بنفسك لو الميزة مش متاحة.
                    </p>
                  </div>

                  {/* The Main Record Button */}
                  <div>
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      disabled={isRequestingMic}
                      className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 hover:from-amber-800 hover:to-orange-700 disabled:opacity-60 text-white font-black text-sm sm:text-base shadow-lg transition-all active:scale-95 cursor-pointer"
                    >
                      {isRequestingMic ? (
                        <>
                          <Loader2 size={18} className="animate-spin text-white" />
                          <span>جاري طلب إذن الميكروفون...</span>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 rounded-full bg-red-500 animate-ping mr-0.5" />
                          <Mic size={18} />
                          <span>{hasAudioToPlay ? 'تسجيل صوت وتفريغ كلام جديد' : 'ابدأ التسجيل الصوتي الآن'}</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB 2: Upload Pre-recorded Audio File */}
          {activeTab === 'upload' && (
            <div className="p-4 sm:p-6 rounded-2xl bg-amber-950/5 dark:bg-black/30 border border-dashed border-amber-900/30 dark:border-white/20 text-center space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
                onChange={handleFileSelect}
                className="hidden"
              />
              <FileAudio size={32} className="mx-auto text-amber-700 dark:text-amber-400" />
              <div>
                <p className="text-xs sm:text-sm font-black">
                  اختر ملفاً صوتياً مسجلاً من هاتفك أو جهازك (MP3, WAV, M4A, OGG)
                </p>
                <p className="text-[11px] text-secondary dark:text-cream/60 mt-0.5">
                  الحد الأقصى لحجم الملف: 3 ميجابايت
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex min-h-11 items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <Upload size={14} />
                <span>اختيار الملف الصوتي</span>
              </button>
            </div>
          )}

          {isFinalizingRecording && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-700/10 px-3 py-3 text-sm font-bold text-amber-900 dark:text-amber-200">
              <Loader2 size={17} className="animate-spin" />
              <span>جاري تجهيز التسجيل للمراجعة...</span>
            </div>
          )}

          {/* Audio Preview Player (If Recorded or Selected) */}
          {hasAudioToPlay && !isRecording && !isFinalizingRecording && (
            <div className="p-4 rounded-2xl bg-amber-800/10 dark:bg-amber-400/10 border border-amber-800/25 dark:border-amber-400/25 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-amber-900 dark:text-amber-300">
                  <Headphones size={15} />
                  <span>معاينة التسجيل الصوتي قبل النشر:</span>
                </div>

                <button
                  type="button"
                  onClick={handleDeleteAudio}
                  className="inline-flex min-h-11 items-center gap-1 px-2 text-[11px] text-red-600 hover:text-red-700 font-bold cursor-pointer"
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
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-700 text-white hover:bg-amber-800 transition-colors cursor-pointer shrink-0 shadow-md"
                >
                  {isPlayingPreview ? (
                    <Pause size={18} className="fill-white" />
                  ) : (
                    <Play size={18} className="fill-white ml-0.5" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-secondary dark:text-cream/70 mb-1">
                    <span>{formatTime(previewCurrentTime)}</span>
                    <span>{formatTime(previewDuration || recordingSeconds)}</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-orange-500 transition-all duration-100"
                      style={{
                        width: `${previewDuration > 0
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
                className="w-full min-h-11 px-3 py-2 bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">تخصص وصفة الحرفي:</label>
              <input
                type="text"
                value={artisanCraft}
                onChange={(e) => setArtisanCraft(e.target.value)}
                placeholder="مثال: شيخ فخاراني بالحميدات، نسّاجة أخميم"
                className="w-full min-h-11 px-3 py-2 bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Spoken Transcript Field (الحكاية المنطوقة المأخوذة من الريكورد) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <label className="font-bold text-foreground flex items-center gap-1.5">
                  <FileText size={14} className="text-amber-700 dark:text-amber-400" />
                  <span>حكاية القطعة المكتوبة:</span>
                </label>

                {transcriptionSuccess && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle2 size={11} />
                    <span>مفرغة تلقائياً من الصوت</span>
                  </span>
                )}
              </div>

              {/* Direct Voice Dictation Button (إملاء صوتي إضافي) */}
              <button
                type="button"
                onClick={handleToggleDictation}
                className={`inline-flex min-h-11 items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${isDictating
                  ? 'bg-red-600 text-white animate-pulse shadow-xs'
                  : 'bg-amber-800/10 hover:bg-amber-800/20 text-amber-900 dark:text-amber-300 border border-amber-800/20'
                  }`}
                title="تحدث لإضافة أو تعديل الكلام المنطوق مباشرة"
              >
                <Mic size={12} className={isDictating ? 'animate-bounce' : ''} />
                <span>{isDictating ? 'جاري الاستماع لكلامك...' : 'إملاء صوتي مباشر'}</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="اكتب حكاية القطعة هنا. لو الإملاء الصوتي مدعوم، هتقدر تراجع النص وتعدله قبل النشر."
              className="w-full px-3 py-3 bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl text-sm outline-none focus:border-primary resize-y leading-relaxed"
            />

            <p className="text-[10px] text-secondary dark:text-cream/60">
              تظهر هذه الحكاية للزوار في صفحة المنتج ويمكنهم قراءتها ونسخها ومشاركتها مع الاستماع للصوت.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-black/10 dark:border-white/10">
            <span className="text-[11px] text-secondary dark:text-cream/70 font-medium hidden sm:inline">
              بمجرد الحفظ، يظهر صوتك وحكايتك فوراً لجميع المشترين في صفحة المنتج
            </span>

            <div className="flex w-full sm:w-auto items-center gap-2 sm:mr-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving || isRecording || isFinalizingRecording || isRequestingMic}
                className="min-h-11 flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-secondary hover:text-espresso dark:text-cream/70 cursor-pointer disabled:opacity-40"
              >
                إلغاء
              </button>

              <button
                type="submit"
                disabled={isSaving || isRecording || isFinalizingRecording || isRequestingMic || (!hasAudioToPlay && !transcript.trim())}
                className="inline-flex min-h-11 flex-[2] sm:flex-none items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>جاري الحفظ والنشر...</span>
                  </>
                ) : isFinalizingRecording ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>جاري تجهيز التسجيل...</span>
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
