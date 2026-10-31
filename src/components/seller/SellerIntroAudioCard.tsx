import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Mic, Square, RotateCcw, Save, Volume2 } from 'lucide-react';
import { api } from '../../services/api';

interface SellerIntroAudioCardProps {
  audioUrl?: string | null;
  duration?: number | null;
  isOwner: boolean;
  user: { id: string; role: string; sellerId?: string };
  onSaved: (audio: { audioUrl: string; duration: number }) => void;
}

const MAX_RECORDING_SECONDS = 120;
const MAX_AUDIO_BYTES = 12 * 1024 * 1024;

export const SellerIntroAudioCard: React.FC<SellerIntroAudioCardProps> = ({
  audioUrl,
  duration,
  isOwner,
  user,
  onSaved
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isRequestingMic, setIsRequestingMic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioData, setRecordedAudioData] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const previewUrlRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);
  const durationRef = useRef(0);

  const releaseRecordingResources = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => () => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.onstop = null;
      recorderRef.current.stop();
    }
    releaseRecordingResources();
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  const startRecording = async () => {
    if (isRequestingMic || isRecording) return;
    discardRecording();
    setRecordingError(null);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setRecordingError('التسجيل الصوتي غير مدعوم على هذا المتصفح. جرّب متصفحًا أحدث.');
      return;
    }

    setIsRequestingMic(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus'
      ].find((candidate) => MediaRecorder.isTypeSupported(candidate));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      chunksRef.current = [];
      startedAtRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        releaseRecordingResources();
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const elapsed = Math.min(
          MAX_RECORDING_SECONDS,
          Math.max(1, Math.ceil((Date.now() - startedAtRef.current) / 1000))
        );
        durationRef.current = elapsed;
        setRecordingSeconds(elapsed);
        setIsRecording(false);

        if (blob.size > MAX_AUDIO_BYTES) {
          setRecordingError('حجم التسجيل كبير. أعد التسجيل لمدة أقصر.');
          return;
        }
        if (blob.size === 0) {
          setRecordingError('لم يتم التقاط صوت. تأكد من إذن الميكروفون وحاول مرة أخرى.');
          return;
        }

        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = URL.createObjectURL(blob);
        setRecordedAudioUrl(previewUrlRef.current);
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') setRecordedAudioData(reader.result);
        };
        reader.onerror = () => setRecordingError('تعذر تجهيز التسجيل للحفظ. حاول مرة أخرى.');
        reader.readAsDataURL(blob);
      };

      recorder.start(250);
      setIsRecording(true);
      setIsRequestingMic(false);
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
        setRecordingSeconds(Math.min(elapsed, MAX_RECORDING_SECONDS));
        if (elapsed >= MAX_RECORDING_SECONDS && recorder.state === 'recording') {
          recorder.stop();
        }
      }, 250);
    } catch (error) {
      releaseRecordingResources();
      console.error('[SellerIntroAudioCard] Microphone access failed:', error);
      setRecordingError('لم نتمكن من فتح الميكروفون. اسمح للمتصفح باستخدامه ثم حاول مجددًا.');
      setIsRequestingMic(false);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  const discardRecording = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setRecordedAudioUrl(null);
    setRecordedAudioData(null);
    setRecordingSeconds(0);
    durationRef.current = 0;
    setRecordingError(null);
  };

  const saveRecording = async () => {
    if (!recordedAudioData || !durationRef.current) return;
    setIsSaving(true);
    setRecordingError(null);
    try {
      const saved = await api.saveSellerIntroAudio(user, {
        audioData: recordedAudioData,
        duration: durationRef.current
      });
      onSaved(saved);
      discardRecording();
      setIsRecorderOpen(false);
    } catch (error) {
      console.error('[SellerIntroAudioCard] Failed to save workshop introduction:', error);
      setRecordingError((error as Error).message || 'تعذر حفظ التسجيل التعريفي.');
    } finally {
      setIsSaving(false);
    }
  };

  const displayedAudioUrl = recordedAudioUrl || audioUrl;

  return (
    <section className="mt-14 overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/[0.09] via-surface-subtle to-amber-500/[0.06] shadow-xl sm:mt-20">
      <div className="grid gap-6 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary">
            <Mic className="h-4 w-4" />
            صوت الصانع
          </div>
          <h2 className="mt-4 text-2xl font-black sm:text-3xl">
            {audioUrl ? 'اسمع حكاية الصانع بصوته' : 'عرّف الناس بنفسك وبصنعتك'}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground-muted">
            تسجيل قصير بصوت صاحب الورشة يحكي فيه عن نفسه، حرفته، واللي بيميز شغله. التسجيل من الميكروفون مباشرة، ومدته لحد دقيقتين.
          </p>

          {displayedAudioUrl && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border-subtle bg-background/80 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Volume2 className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-xs font-black">
                  {recordedAudioUrl ? 'معاينة تسجيلك الجديد' : `تسجيل ${audioUrl ? 'الصانع' : 'الورشة'}`}
                  {!recordedAudioUrl && duration ? ` · ${duration} ثانية` : ''}
                </p>
                <audio key={displayedAudioUrl} controls preload="metadata" src={displayedAudioUrl} className="h-10 w-full" />
              </div>
            </div>
          )}

          {isRecorderOpen && (
            <div className="mt-5 rounded-2xl border border-primary/20 bg-background/80 p-4 sm:p-5">
              <p className="text-sm font-bold leading-7">
                {isRecording
                  ? 'اتكلم براحتك: عرّفنا باسمك، حرفتك، وحكاية شغلك.'
                  : recordedAudioData
                    ? 'اسمع التسجيل، ولو عجبك احفظه ليظهر في بروفايل الورشة.'
                    : 'ابدأ التسجيل واتكلم بصوت واضح في مكان هادي.'}
              </p>
              {isRecording && (
                <p className="mt-2 text-xs font-black text-rose-600" aria-live="polite">
                  ● جاري التسجيل {Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, '0')} / 2:00
                </p>
              )}
              {recordingError && (
                <p role="alert" className="mt-3 flex items-start gap-2 text-xs font-bold leading-6 text-rose-600">
                  <AlertCircle className="mt-1 h-4 w-4 shrink-0" />
                  {recordingError}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={isSaving || isRequestingMic}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-rose-600 px-4 text-xs font-black text-white transition hover:bg-rose-700 disabled:opacity-50"
                  >
                    {isRequestingMic ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                    {isRequestingMic ? 'جاري فتح الميكروفون...' : recordedAudioData ? 'إعادة التسجيل' : 'ابدأ التسجيل'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-espresso px-4 text-xs font-black text-white transition hover:bg-black"
                  >
                    <Square className="h-4 w-4 fill-current" />
                    إنهاء التسجيل
                  </button>
                )}
                {recordedAudioData && !isRecording && (
                  <>
                    <button
                      type="button"
                      onClick={discardRecording}
                      disabled={isSaving}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border-subtle px-4 text-xs font-bold transition hover:border-primary/40 disabled:opacity-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                      إلغاء التسجيل
                    </button>
                    <button
                      type="button"
                      onClick={saveRecording}
                      disabled={isSaving}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-xs font-black text-white transition hover:bg-primary-hover disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {isSaving ? 'جاري الحفظ...' : 'حفظ في البروفايل'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {isOwner && (
          <div className="flex flex-col gap-2 lg:min-w-52">
            <button
              type="button"
              onClick={() => {
                discardRecording();
                setIsRecorderOpen((open) => !open);
              }}
              disabled={isRecording || isSaving}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-primary-hover disabled:opacity-50"
            >
              <Mic className="h-4 w-4" />
              {audioUrl ? 'سجّل تعريفًا جديدًا' : 'سجّل تعريفك الآن'}
            </button>
            <span className="text-center text-[11px] leading-5 text-foreground-muted">
              التسجيل والتحكم فيه لصاحب الورشة فقط
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
