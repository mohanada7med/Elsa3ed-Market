import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { LocalPerson, LocalPersonMilestone, VerificationStatus } from '../../types';

type PersonWork = NonNullable<LocalPerson['famousWorks']>[number];
type PersonAnecdote = NonNullable<LocalPerson['historicalAnecdotes']>[number];

interface PersonEditorModalProps {
  person: LocalPerson;
  isSaving: boolean;
  onClose: () => void;
  onSave: (updates: Partial<LocalPerson>) => Promise<boolean>;
}

const verificationStatuses: Array<{ value: VerificationStatus; label: string }> = [
  { value: 'draft', label: 'مسودة' },
  { value: 'pending_review', label: 'قيد المراجعة' },
  { value: 'approved', label: 'معتمد' },
  { value: 'rejected', label: 'مرفوض' },
  { value: 'archived', label: 'مؤرشف' },
  { value: 'verified', label: 'موثّق' },
  { value: 'unverified', label: 'غير موثّق' }
];

const inputClassName =
  'w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-amber-500 dark:border-white/10 dark:bg-stone-900 dark:text-white';
const textAreaClassName = `${inputClassName} min-h-28 resize-y leading-7`;

const Field: React.FC<React.PropsWithChildren<{ label: string; className?: string }>> = ({
  label,
  className = '',
  children
}) => (
  <label className={`block space-y-2 text-xs font-bold text-stone-600 dark:text-white/70 ${className}`}>
    <span>{label}</span>
    {children}
  </label>
);

const parseLines = (value: string): string[] =>
  Array.from(new Set(value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseStructuredList = <T,>(
  value: string,
  label: string,
  parseItem: (item: unknown, index: number) => T
): T[] => {
  if (!value.trim()) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(`صيغة قائمة "${label}" غير صحيحة. راجع JSON وحاول مرة أخرى.`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`قائمة "${label}" يجب أن تكون مصفوفة JSON.`);
  }

  return parsed.map(parseItem);
};

const parseMilestones = (value: string): LocalPersonMilestone[] =>
  parseStructuredList(value, 'المحطات المهمة', (item, index) => {
    if (
      !isRecord(item) ||
      typeof item.title !== 'string' ||
      typeof item.description !== 'string' ||
      (item.year !== undefined && typeof item.year !== 'string')
    ) {
      throw new Error(`المحطة رقم ${index + 1} تحتاج إلى title وdescription، وyear اختياري.`);
    }

    return {
      title: item.title,
      description: item.description,
      ...(typeof item.year === 'string' ? { year: item.year } : {})
    };
  });

const parseFamousWorks = (value: string): PersonWork[] =>
  parseStructuredList(value, 'الأعمال المشهورة', (item, index) => {
    if (
      !isRecord(item) ||
      typeof item.title !== 'string' ||
      ['type', 'year', 'description'].some((key) => item[key] !== undefined && typeof item[key] !== 'string')
    ) {
      throw new Error(`العمل رقم ${index + 1} يحتاج إلى title، والحقول type وyear وdescription اختيارية.`);
    }

    return {
      title: item.title,
      ...(typeof item.type === 'string' ? { type: item.type } : {}),
      ...(typeof item.year === 'string' ? { year: item.year } : {}),
      ...(typeof item.description === 'string' ? { description: item.description } : {})
    };
  });

const parseHistoricalAnecdotes = (value: string): PersonAnecdote[] =>
  parseStructuredList(value, 'الحكايات التاريخية', (item, index) => {
    if (
      !isRecord(item) ||
      typeof item.title !== 'string' ||
      typeof item.story !== 'string' ||
      (item.eraOrContext !== undefined && typeof item.eraOrContext !== 'string')
    ) {
      throw new Error(`الحكاية رقم ${index + 1} تحتاج إلى title وstory، وeraOrContext اختياري.`);
    }

    return {
      title: item.title,
      story: item.story,
      ...(typeof item.eraOrContext === 'string' ? { eraOrContext: item.eraOrContext } : {})
    };
  });

export const PersonEditorModal: React.FC<PersonEditorModalProps> = ({
  person,
  isSaving,
  onClose,
  onSave
}) => {
  const [draft, setDraft] = useState<LocalPerson>(person);
  const [photoUrl, setPhotoUrl] = useState(person.avatarUrl || person.photoUrl || person.imageUrl || '');
  const [origin, setOrigin] = useState(person.originVillage || person.villageOrOrigin || '');
  const [videosText, setVideosText] = useState((person.videos || []).join('\n'));
  const [worksText, setWorksText] = useState((person.famousWorksOrActs || []).join('\n'));
  const [milestonesText, setMilestonesText] = useState(JSON.stringify(person.keyMilestones || [], null, 2));
  const [famousWorksText, setFamousWorksText] = useState(JSON.stringify(person.famousWorks || [], null, 2));
  const [anecdotesText, setAnecdotesText] = useState(JSON.stringify(person.historicalAnecdotes || [], null, 2));
  const [latitude, setLatitude] = useState(person.coordinates?.lat?.toString() || '');
  const [longitude, setLongitude] = useState(person.coordinates?.lng?.toString() || '');
  const [validationError, setValidationError] = useState('');

  const updateField = <K extends keyof LocalPerson,>(key: K, value: LocalPerson[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError('');

    const name = draft.name.trim();
    const slug = draft.slug.trim();
    if (!name || !slug) {
      setValidationError('الاسم والمعرّف المختصر مطلوبان.');
      return;
    }

    let coordinates: LocalPerson['coordinates'];
    const hasLatitude = Boolean(latitude.trim());
    const hasLongitude = Boolean(longitude.trim());
    if (hasLatitude !== hasLongitude) {
      setValidationError('أدخل خط العرض وخط الطول معًا.');
      return;
    }
    if (hasLatitude && hasLongitude) {
      const lat = Number(latitude);
      const lng = Number(longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        setValidationError('أدخل إحداثيات صحيحة للعرض على الخريطة.');
        return;
      }
      coordinates = { lat, lng };
    }

    try {
      const updates: Partial<LocalPerson> = {
        name,
        slug,
        titleOrRole: draft.titleOrRole.trim(),
        craftTitle: draft.craftTitle?.trim() || '',
        governorateName: draft.governorateName.trim(),
        governorateId: draft.governorateId.trim(),
        biography: draft.biography.trim(),
        bio: draft.bio?.trim() || '',
        craftOrSkill: draft.craftOrSkill.trim(),
        avatarUrl: photoUrl.trim(),
        photoUrl: photoUrl.trim(),
        imageUrl: photoUrl.trim(),
        videoUrl: draft.videoUrl?.trim() || '',
        videos: parseLines(videosText),
        quote: draft.quote?.trim() || '',
        yearsOfExperience: draft.yearsOfExperience ?? 0,
        originVillage: origin.trim(),
        villageOrOrigin: origin.trim(),
        keyMilestones: parseMilestones(milestonesText),
        famousWorksOrActs: parseLines(worksText),
        famousWorks: parseFamousWorks(famousWorksText),
        localImpact: draft.localImpact?.trim() || '',
        famousAnecdote: draft.famousAnecdote?.trim() || '',
        historicalAnecdotes: parseHistoricalAnecdotes(anecdotesText),
        relatedArtisanId: draft.relatedArtisanId?.trim() || '',
        relatedCraftId: draft.relatedCraftId?.trim() || '',
        coordinates,
        isFeatured: Boolean(draft.isFeatured),
        sourceName: draft.sourceName?.trim() || '',
        sourceUrl: draft.sourceUrl?.trim() || '',
        sourceType: draft.sourceType?.trim() || '',
        researchDate: draft.researchDate?.trim() || '',
        verificationStatus: draft.verificationStatus || draft.status,
        status: draft.status
      };

      const saved = await onSave(updates);
      if (!saved) return;
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'تعذر التحقق من بيانات القوائم.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="person-editor-title"
    >
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-stone-200 bg-[#FFF9EE] shadow-2xl dark:border-white/10 dark:bg-[#1B1009]">
        <header className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-white/10 sm:px-7">
          <div>
            <h2 id="person-editor-title" className="text-xl font-black text-stone-900 dark:text-white">
              تعديل بيانات الشخصية
            </h2>
            <p className="mt-1 text-[11px] text-stone-500 dark:text-white/50">
              المعرّف الثابت: {person.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="إغلاق محرر الشخصية"
            className="rounded-full p-2 text-stone-500 transition hover:bg-stone-200 hover:text-stone-900 disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-8 p-5 sm:p-7">
            <section className="space-y-4">
              <h3 className="border-b border-stone-200 pb-2 text-sm font-black text-amber-800 dark:border-white/10 dark:text-amber-400">
                البيانات الأساسية
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="الاسم الكامل">
                  <input className={inputClassName} value={draft.name} onChange={(event) => updateField('name', event.target.value)} />
                </Field>
                <Field label="المعرّف المختصر (Slug)">
                  <input className={inputClassName} dir="ltr" value={draft.slug} onChange={(event) => updateField('slug', event.target.value)} />
                </Field>
                <Field label="الصفة أو الدور">
                  <input className={inputClassName} value={draft.titleOrRole} onChange={(event) => updateField('titleOrRole', event.target.value)} />
                </Field>
                <Field label="اللقب الحرفي">
                  <input className={inputClassName} value={draft.craftTitle || ''} onChange={(event) => updateField('craftTitle', event.target.value)} />
                </Field>
                <Field label="الحرفة أو المهارة">
                  <input className={inputClassName} value={draft.craftOrSkill} onChange={(event) => updateField('craftOrSkill', event.target.value)} />
                </Field>
                <Field label="المحافظة">
                  <input className={inputClassName} value={draft.governorateName} onChange={(event) => updateField('governorateName', event.target.value)} />
                </Field>
                <Field label="معرّف المحافظة">
                  <input className={inputClassName} value={draft.governorateId} onChange={(event) => updateField('governorateId', event.target.value)} />
                </Field>
                <Field label="القرية أو الأصل">
                  <input className={inputClassName} value={origin} onChange={(event) => setOrigin(event.target.value)} />
                </Field>
                <Field label="سنوات الخبرة">
                  <input
                    className={inputClassName}
                    type="number"
                    min="0"
                    value={draft.yearsOfExperience ?? ''}
                    onChange={(event) => updateField('yearsOfExperience', event.target.value === '' ? undefined : Number(event.target.value))}
                  />
                </Field>
                <Field label="حالة السجل">
                  <select className={inputClassName} value={draft.status} onChange={(event) => updateField('status', event.target.value as VerificationStatus)}>
                    {verificationStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                  </select>
                </Field>
                <Field label="حالة التوثيق">
                  <select
                    className={inputClassName}
                    value={draft.verificationStatus || draft.status}
                    onChange={(event) => updateField('verificationStatus', event.target.value)}
                  >
                    {verificationStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                  </select>
                </Field>
                <label className="flex items-center gap-3 self-end rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-bold text-stone-700 dark:border-white/10 dark:bg-stone-900 dark:text-white">
                  <input type="checkbox" checked={Boolean(draft.isFeatured)} onChange={(event) => updateField('isFeatured', event.target.checked)} />
                  شخصية مميزة
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="border-b border-stone-200 pb-2 text-sm font-black text-amber-800 dark:border-white/10 dark:text-amber-400">
                السيرة والمحتوى
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="السيرة الكاملة">
                  <textarea className={textAreaClassName} value={draft.biography} onChange={(event) => updateField('biography', event.target.value)} />
                </Field>
                <Field label="نبذة مختصرة">
                  <textarea className={textAreaClassName} value={draft.bio || ''} onChange={(event) => updateField('bio', event.target.value)} />
                </Field>
                <Field label="اقتباس من الشخصية">
                  <textarea className={textAreaClassName} value={draft.quote || ''} onChange={(event) => updateField('quote', event.target.value)} />
                </Field>
                <Field label="الأثر المحلي">
                  <textarea className={textAreaClassName} value={draft.localImpact || ''} onChange={(event) => updateField('localImpact', event.target.value)} />
                </Field>
                <Field label="حكاية مشهورة">
                  <textarea className={textAreaClassName} value={draft.famousAnecdote || ''} onChange={(event) => updateField('famousAnecdote', event.target.value)} />
                </Field>
                <Field label="الأعمال أو الأفعال المشهورة — سطر لكل عنصر">
                  <textarea className={textAreaClassName} value={worksText} onChange={(event) => setWorksText(event.target.value)} />
                </Field>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="border-b border-stone-200 pb-2 text-sm font-black text-amber-800 dark:border-white/10 dark:text-amber-400">
                المحطات والأعمال والحكايات
              </h3>
              <p className="text-[11px] leading-6 text-stone-500 dark:text-white/50">
                القوائم التالية بصيغة JSON. اتركها [] إذا لم توجد عناصر؛ تُعرض أمثلة البنية داخل كل حقل.
              </p>
              <div className="grid gap-4 lg:grid-cols-3">
                <Field label="المحطات المهمة">
                  <textarea
                    className={`${textAreaClassName} min-h-52 font-black text-xs`}
                    dir="ltr"
                    value={milestonesText}
                    onChange={(event) => setMilestonesText(event.target.value)}
                    placeholder='[{"year":"1980","title":"محطة","description":"التفاصيل"}]'
                  />
                </Field>
                <Field label="الأعمال المشهورة">
                  <textarea
                    className={`${textAreaClassName} min-h-52 font-black text-xs`}
                    dir="ltr"
                    value={famousWorksText}
                    onChange={(event) => setFamousWorksText(event.target.value)}
                    placeholder='[{"title":"اسم العمل","type":"كتاب","year":"1980","description":"التفاصيل"}]'
                  />
                </Field>
                <Field label="الحكايات التاريخية">
                  <textarea
                    className={`${textAreaClassName} min-h-52 font-black text-xs`}
                    dir="ltr"
                    value={anecdotesText}
                    onChange={(event) => setAnecdotesText(event.target.value)}
                    placeholder='[{"title":"عنوان الحكاية","story":"نص الحكاية","eraOrContext":"السياق"}]'
                  />
                </Field>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="border-b border-stone-200 pb-2 text-sm font-black text-amber-800 dark:border-white/10 dark:text-amber-400">
                الصور والفيديوهات
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="رابط الصورة">
                  <input className={inputClassName} dir="ltr" value={photoUrl} onChange={(event) => setPhotoUrl(event.target.value)} />
                </Field>
                <Field label="رابط الفيديو الرئيسي">
                  <input className={inputClassName} dir="ltr" value={draft.videoUrl || ''} onChange={(event) => updateField('videoUrl', event.target.value)} />
                </Field>
                <Field label="روابط فيديو إضافية — رابط لكل سطر" className="sm:col-span-2">
                  <textarea className={textAreaClassName} dir="ltr" value={videosText} onChange={(event) => setVideosText(event.target.value)} />
                </Field>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="border-b border-stone-200 pb-2 text-sm font-black text-amber-800 dark:border-white/10 dark:text-amber-400">
                الربط والمصادر والإحداثيات
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="معرّف الحرفي المرتبط">
                  <input className={inputClassName} value={draft.relatedArtisanId || ''} onChange={(event) => updateField('relatedArtisanId', event.target.value)} />
                </Field>
                <Field label="معرّف الحرفة المرتبطة">
                  <input className={inputClassName} value={draft.relatedCraftId || ''} onChange={(event) => updateField('relatedCraftId', event.target.value)} />
                </Field>
                <Field label="اسم المصدر">
                  <input className={inputClassName} value={draft.sourceName || ''} onChange={(event) => updateField('sourceName', event.target.value)} />
                </Field>
                <Field label="رابط المصدر">
                  <input className={inputClassName} dir="ltr" value={draft.sourceUrl || ''} onChange={(event) => updateField('sourceUrl', event.target.value)} />
                </Field>
                <Field label="نوع المصدر">
                  <input className={inputClassName} value={draft.sourceType || ''} onChange={(event) => updateField('sourceType', event.target.value)} />
                </Field>
                <Field label="تاريخ البحث أو التوثيق">
                  <input className={inputClassName} type="date" value={draft.researchDate || ''} onChange={(event) => updateField('researchDate', event.target.value)} />
                </Field>
                <Field label="خط العرض">
                  <input className={inputClassName} dir="ltr" type="number" step="any" value={latitude} onChange={(event) => setLatitude(event.target.value)} />
                </Field>
                <Field label="خط الطول">
                  <input className={inputClassName} dir="ltr" type="number" step="any" value={longitude} onChange={(event) => setLongitude(event.target.value)} />
                </Field>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-white/50">
                املأ الإحداثيين معًا؛ تركهما فارغين لا يغيّر الإحداثيات الحالية.
              </p>
            </section>

            {validationError && (
              <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-700 dark:text-red-300">
                {validationError}
              </p>
            )}
          </div>

          <footer className="sticky bottom-0 flex justify-end gap-3 border-t border-stone-200 bg-[#FFF9EE]/95 px-5 py-4 backdrop-blur dark:border-white/10 dark:bg-[#1B1009]/95 sm:px-7">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-bold text-stone-700 transition hover:bg-stone-100 disabled:opacity-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-amber-700 disabled:cursor-wait disabled:opacity-60"
            >
              <Save size={16} />
              {isSaving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
