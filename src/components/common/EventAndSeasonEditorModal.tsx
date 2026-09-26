import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { CulturalEvent, WahSeason } from '../../types';
import {
  X,
  Save,
  Sparkles,
  Calendar,
  Wheat,
  MapPin,
  Clock,
  Utensils,
  Flame,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Compass,
  Layers,
  ChevronDown
} from 'lucide-react';

const UPPER_EGYPT_GOVERNORATES = [
  { id: 'gov-qena', name: 'قنا' },
  { id: 'gov-luxor', name: 'الأقصر' },
  { id: 'gov-aswan', name: 'أسوان' },
  { id: 'gov-sohag', name: 'سوهاج' },
  { id: 'gov-asyut', name: 'أسيوط' },
  { id: 'gov-minya', name: 'المنيا' },
  { id: 'gov-beni-suef', name: 'بني سويف' },
  { id: 'gov-fayoum', name: 'الفيوم' },
  { id: 'gov-new-valley', name: 'الوادي الجديد' },
  { id: 'gov-red-sea', name: 'البحر الأحمر' }
];

const PRESET_IMAGES = [
  { label: 'ليلة ومولد صوفي', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80' },
  { label: 'كسر قصب وحصاد', url: 'https://images.unsplash.com/photo-1599833975787-5c143f373c30?w=800&auto=format&fit=crop&q=80' },
  { label: 'مرماح وفروسية', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80' },
  { label: 'سوق وموسم شعبي', url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop&q=80' },
  { label: 'نيل وأصالة', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80' },
];

export interface EventAndSeasonEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  // If editing an existing event or season, pass it here
  itemToEdit?: any | null;
  // Optional pre-selected governorate name
  defaultGovernorateName?: string;
  // Callback when save is successful
  onSaved?: (savedItem: any) => void;
}

export const EventAndSeasonEditorModal: React.FC<EventAndSeasonEditorModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  defaultGovernorateName,
  onSaved
}) => {
  const { currentUser, addToast } = useApp();

  const isEditing = !!(itemToEdit?.id || itemToEdit?._id);

  // Determine if editing item is a season
  const initialIsSeason =
    itemToEdit?.category === 'harvest' ||
    itemToEdit?.category === 'agricultural' ||
    !!itemToEdit?.startPeriod ||
    (itemToEdit as any)?.entityType === 'season' ||
    (itemToEdit as any)?.entityType === 'seasons';

  const [itemType, setItemType] = useState<'event' | 'season'>(
    initialIsSeason ? 'season' : 'event'
  );

  // Form states
  const [title, setTitle] = useState('');
  const [governorateName, setGovernorateName] = useState('قنا');
  const [locationName, setLocationName] = useState('');
  const [category, setCategory] = useState('moulid');
  const [eventDate, setEventDate] = useState('');
  const [startPeriod, setStartPeriod] = useState('');
  const [endPeriod, setEndPeriod] = useState('');
  const [description, setDescription] = useState('');
  const [rituals, setRituals] = useState('');
  const [famousFoods, setFamousFoods] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state when modal opens or itemToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        const isSeason =
          itemToEdit.category === 'harvest' ||
          itemToEdit.category === 'agricultural' ||
          !!itemToEdit.startPeriod ||
          (itemToEdit as any).entityType === 'season' ||
          (itemToEdit as any).entityType === 'seasons';

        setItemType(isSeason ? 'season' : 'event');
        setTitle(itemToEdit.title || '');
        setGovernorateName(itemToEdit.governorateName || defaultGovernorateName || 'قنا');
        setLocationName(
          itemToEdit.locationName ||
          itemToEdit.cityName ||
          itemToEdit.location ||
          ''
        );
        setCategory(
          (itemToEdit.category as string) ||
          (isSeason ? 'harvest' : 'moulid')
        );
        setEventDate(
          itemToEdit.eventDate ||
          itemToEdit.dateText ||
          itemToEdit.timeOfYear ||
          itemToEdit.season ||
          ''
        );
        setStartPeriod(
          itemToEdit.startPeriod ||
          (itemToEdit.eventDate?.includes('-') ? itemToEdit.eventDate.split('-')[0].trim() : '') ||
          'شهر طوبة'
        );
        setEndPeriod(
          itemToEdit.endPeriod ||
          (itemToEdit.eventDate?.includes('-') ? itemToEdit.eventDate.split('-')[1]?.trim() || '' : '') ||
          'نهاية أمشير'
        );
        setDescription(itemToEdit.description || '');

        // Rituals array or string
        if (Array.isArray(itemToEdit.rituals)) {
          setRituals(itemToEdit.rituals.join('\n'));
        } else if (Array.isArray(itemToEdit.relatedStories)) {
          setRituals(itemToEdit.relatedStories.join('\n'));
        } else {
          setRituals('');
        }

        // Foods array or string
        if (Array.isArray(itemToEdit.famousFoods)) {
          setFamousFoods(itemToEdit.famousFoods.join('\n'));
        } else if (Array.isArray(itemToEdit.relatedFoods)) {
          setFamousFoods(itemToEdit.relatedFoods.join('\n'));
        } else {
          setFamousFoods('');
        }

        setCoverImage(itemToEdit.coverImage || '');
      } else {
        // Reset to clean add form
        setItemType('event');
        setTitle('');
        setGovernorateName(defaultGovernorateName || 'قنا');
        setLocationName('');
        setCategory('moulid');
        setEventDate('');
        setStartPeriod('شهر طوبة (يناير)');
        setEndPeriod('نهاية أمشير (فبراير)');
        setDescription('');
        setRituals('');
        setFamousFoods('');
        setCoverImage('');
      }
      setErrorMessage(null);
    }
  }, [isOpen, itemToEdit, defaultGovernorateName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('يرجى كتابة اسم الليلة أو المولد أو الموسم');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('يرجى كتابة نبذة أو حكاية بالعامية عن طقوس المناسبة وتفاصيلها');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const targetGov = UPPER_EGYPT_GOVERNORATES.find((g) => g.name === governorateName);
    const govId = targetGov?.id || `gov-${governorateName}`;
    const slug =
      itemToEdit?.slug ||
      `${Date.now()}-${title.trim().toLowerCase().replace(/[^\u0621-\u064A\w]+/g, '-')}`;

    const parsedRituals = rituals
      .split(/[\n،,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedFoods = famousFoods
      .split(/[\n،,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const fallbackImage =
      itemType === 'season'
        ? 'https://images.unsplash.com/photo-1599833975787-5c143f373c30?w=800&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80';

    try {
      let savedResult: any = null;

      if (itemType === 'season') {
        const seasonPayload: Partial<WahSeason> = {
          id: itemToEdit?.id,
          title: title.trim(),
          slug,
          governorateId: govId,
          governorateName: governorateName,
          cityName: locationName.trim() || governorateName,
          category: (category as any) || 'harvest',
          startPeriod: startPeriod.trim() || 'فترة الحصاد',
          endPeriod: endPeriod.trim() || 'نهاية الموسم',
          description: description.trim(),
          coverImage: coverImage.trim() || fallbackImage,
          relatedFoods: parsedFoods.length > 0 ? parsedFoods : ['طعام الحصاد الصعيدي', 'العيش الشمسي والجبن القديم'],
          relatedStories: parsedRituals.length > 0 ? parsedRituals : ['أهازيج العمل المشترك', 'طقوس الحصاد وبركة النيل'],
          status: 'approved'
        };

        savedResult = await wahApi.saveSeason(seasonPayload, currentUser || undefined);
        addToast(
          isEditing ? 'تم تعديل الموسم' : 'تم إضافة الموسم',
          `تم حفظ موسم "${title.trim()}" بنجاح في قاعدة البيانات`,
          'success'
        );
      } else {
        const eventPayload: Partial<CulturalEvent> = {
          id: itemToEdit?.id,
          title: title.trim(),
          slug,
          governorateId: govId,
          governorateName: governorateName,
          locationName: locationName.trim() || governorateName,
          cityName: locationName.trim() || governorateName,
          location: locationName.trim() ? `${locationName.trim()}، ${governorateName}` : governorateName,
          category: (category as any) || 'moulid',
          eventDate: eventDate.trim() || 'موسم سنوي مبارك',
          dateText: eventDate.trim() || 'موسم سنوي مبارك',
          season: eventDate.trim() || 'موسم سنوي مبارك',
          timeOfYear: eventDate.trim() || 'موسم سنوي مبارك',
          description: description.trim(),
          coverImage: coverImage.trim() || fallbackImage,
          rituals: parsedRituals.length > 0 ? parsedRituals : ['حلقات الذكر والمديح الصوفي', 'سباقات الخيل والمرماح والتحطيب'],
          famousFoods: parsedFoods.length > 0 ? parsedFoods : ['حلاوة المولد الصعيدية', 'شربات الورد بالنعناع', 'فتة اللحم الصعيدي'],
          status: 'approved'
        };

        savedResult = await wahApi.saveEvent(eventPayload, currentUser || undefined);
        addToast(
          isEditing ? 'تم تعديل الليلة' : 'تم إضافة الليلة',
          `تم حفظ ليلة "${title.trim()}" بنجاح في قاعدة البيانات`,
          'success'
        );
      }

      if (onSaved) {
        onSaved(savedResult);
      }

      onClose();
    } catch (err: any) {
      console.error('Error saving event/season:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء الحفظ في قاعدة البيانات. برجاء المحاولة مجدداً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        onClick={() => !isSubmitting && onClose()}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div
        className="
          relative z-10
          flex flex-col
          w-full sm:max-w-2xl
          h-full sm:h-auto sm:max-h-[90vh]
          overflow-hidden
          bg-white dark:bg-[#181411]
          text-stone-900 dark:text-stone-100
          border-0 sm:border border-stone-200 dark:border-stone-800
          rounded-none sm:rounded-[2rem]
          shadow-2xl
          transition-colors duration-300
        "
      >
        {/* Sticky Header */}
        <header
          className="
            sticky top-0 z-20 shrink-0
            flex items-center justify-between
            px-4 sm:px-6 py-4
            border-b border-stone-200 dark:border-stone-800
            bg-white/95 dark:bg-[#181411]/95
            backdrop-blur-md
          "
        >
          <div className="flex items-center gap-3">
            <div
              className={`
                flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl
                ${itemType === 'season'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'bg-primary/10 text-primary border border-primary/20'
                }
              `}
            >
              {itemType === 'season' ? <Wheat size={20} /> : <Calendar size={20} />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                  {isEditing ? 'تعديل سجل قائم' : 'توثيق جديد'}
                </span>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  MongoDB Direct
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black font-serif text-stone-900 dark:text-stone-100 leading-snug">
                {isEditing
                  ? `تعديل: ${title || 'الليلة أو الموسم'}`
                  : itemType === 'season'
                  ? 'توثيق موسم زراعي وحصاد جديد'
                  : 'توثيق ليلة أو مولد صعيدي جديد'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => !isSubmitting && onClose()}
            className="
              flex h-9 w-9 items-center justify-center rounded-full
              border border-stone-200 dark:border-stone-800
              bg-stone-100 dark:bg-stone-800
              text-stone-600 dark:text-stone-300
              hover:bg-stone-200 dark:hover:bg-stone-700
              hover:text-stone-900 dark:hover:text-white
              transition-colors cursor-pointer
            "
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </header>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5"
        >
          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-start gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 p-3.5 text-rose-700 dark:text-rose-300">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <p className="text-xs sm:text-sm font-bold leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Section 1: Item Type Selector (Only if adding new) */}
          {!isEditing && (
            <div className="rounded-2xl p-1 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => {
                  setItemType('event');
                  setCategory('moulid');
                }}
                className={`
                  flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer
                  ${itemType === 'event'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }
                `}
              >
                <Calendar size={15} className="text-primary" />
                <span>ليلة أو مولد أو احتفال</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setItemType('season');
                  setCategory('harvest');
                }}
                className={`
                  flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer
                  ${itemType === 'season'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }
                `}
              >
                <Wheat size={15} className="text-amber-500" />
                <span>موسم زراعي أو حصاد</span>
              </button>
            </div>
          )}

          {/* Section 2: Main Details Card */}
          <div className="rounded-2xl p-4 sm:p-5 bg-stone-50/70 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {itemType === 'season' ? 'اسم الموسم الزراعي أو الحصاد *' : 'اسم الليلة أو المولد أو الاحتفال *'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  itemType === 'season'
                    ? 'مثال: موسم كسر القصب وعصير العسل الأسود'
                    : 'مثال: ليلة سيدي عبد الرحيم القنائي، ليلة أبو الحجاج'
                }
                className="
                  w-full min-h-[46px] px-3.5 py-2.5 text-sm font-semibold rounded-xl
                  bg-white dark:bg-stone-900
                  text-stone-900 dark:text-stone-100
                  placeholder:text-stone-400 dark:placeholder:text-stone-500
                  border border-stone-300 dark:border-stone-700
                  focus:border-primary dark:focus:border-amber-400
                  focus:ring-2 focus:ring-primary/20 dark:focus:ring-amber-400/20
                  outline-none transition-all
                "
              />
            </div>

            {/* Governorate and Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  المحافظة الصعيدية *
                </label>
                <select
                  value={governorateName}
                  onChange={(e) => setGovernorateName(e.target.value)}
                  className="
                    w-full min-h-[46px] px-3.5 py-2.5 text-sm font-bold rounded-xl
                    bg-white dark:bg-stone-900
                    text-stone-900 dark:text-stone-100
                    border border-stone-300 dark:border-stone-700
                    focus:border-primary dark:focus:border-amber-400
                    outline-none cursor-pointer
                  "
                >
                  {UPPER_EGYPT_GOVERNORATES.map((gov) => (
                    <option
                      key={gov.id}
                      value={gov.name}
                      className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100 font-bold"
                    >
                      محافظة {gov.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  المركز أو القرية أو الساحة
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="مثال: نجع حمادي، إسنا، ساحة المقام"
                  className="
                    w-full min-h-[46px] px-3.5 py-2.5 text-sm font-semibold rounded-xl
                    bg-white dark:bg-stone-900
                    text-stone-900 dark:text-stone-100
                    placeholder:text-stone-400 dark:placeholder:text-stone-500
                    border border-stone-300 dark:border-stone-700
                    focus:border-primary dark:focus:border-amber-400
                    focus:ring-2 focus:ring-primary/20
                    outline-none transition-all
                  "
                />
              </div>
            </div>

            {/* Category and Timing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  تصنيف المناسبة
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="
                    w-full min-h-[46px] px-3.5 py-2.5 text-sm font-bold rounded-xl
                    bg-white dark:bg-stone-900
                    text-stone-900 dark:text-stone-100
                    border border-stone-300 dark:border-stone-700
                    focus:border-primary dark:focus:border-amber-400
                    outline-none cursor-pointer
                  "
                >
                  {itemType === 'season' ? (
                    <>
                      <option value="harvest" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">
                        مواسم زراعية وحصاد (قصب، بلح، قمح)
                      </option>
                      <option value="agricultural" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">
                        موسم زراعي دوري
                      </option>
                      <option value="craft" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">
                        موسم حرفي وتصنيع شعبي
                      </option>
                      <option value="cultural" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">
                        موسم تراثي وثقافي
                      </option>
                    </>
                  ) : (
                    <>
                      <option value="moulid" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">
                        موالد وليالي ذكر وأولياء
                      </option>
                      <option value="harvest" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">
                        مواسم زراعية وحصاد
                      </option>
                      <option value="cultural_night" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">
                        فروسية ومرماح وهجن
                      </option>
                      <option value="festival" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">
                        احتفالات ومهرجانات كبرى
                      </option>
                      <option value="market_fair" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">
                        أسواق ومواسم حرفية شعبية
                      </option>
                    </>
                  )}
                </select>
              </div>

              {itemType === 'season' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                      بداية الموسم
                    </label>
                    <input
                      type="text"
                      value={startPeriod}
                      onChange={(e) => setStartPeriod(e.target.value)}
                      placeholder="يناير / طوبة"
                      className="
                        w-full min-h-[46px] px-3 py-2 text-xs font-bold rounded-xl
                        bg-white dark:bg-stone-900
                        text-stone-900 dark:text-stone-100
                        border border-stone-300 dark:border-stone-700
                        focus:border-primary outline-none
                      "
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                      نهاية الموسم
                    </label>
                    <input
                      type="text"
                      value={endPeriod}
                      onChange={(e) => setEndPeriod(e.target.value)}
                      placeholder="مايو / برمودة"
                      className="
                        w-full min-h-[46px] px-3 py-2 text-xs font-bold rounded-xl
                        bg-white dark:bg-stone-900
                        text-stone-900 dark:text-stone-100
                        border border-stone-300 dark:border-stone-700
                        focus:border-primary outline-none
                      "
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    موعد وتاريخ الليلة السنوي
                  </label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="مثال: النصف من شعبان، الليلة الكبيرة في رجب"
                    className="
                      w-full min-h-[46px] px-3.5 py-2.5 text-sm font-semibold rounded-xl
                      bg-white dark:bg-stone-900
                      text-stone-900 dark:text-stone-100
                      placeholder:text-stone-400 dark:placeholder:text-stone-500
                      border border-stone-300 dark:border-stone-700
                      focus:border-primary outline-none
                    "
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Story & Description */}
          <div className="rounded-2xl p-4 sm:p-5 bg-stone-50/70 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  الحكاية والتفاصيل بالعامية الصعيدية البسيطة *
                </label>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                  <Sparkles size={11} />
                  <span>بروح الصعيد وأهله</span>
                </span>
              </div>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="احكي لنا الحكاية بالبلدي: إيه سر المناسبة؟ مين صاحب المقام أو الموسم؟ وإيه اللي بيحصل فيها ومنين بييجوا الناس؟"
                className="
                  w-full p-3.5 text-sm font-semibold rounded-xl
                  bg-white dark:bg-stone-900
                  text-stone-900 dark:text-stone-100
                  placeholder:text-stone-400 dark:placeholder:text-stone-500
                  border border-stone-300 dark:border-stone-700
                  focus:border-primary dark:focus:border-amber-400
                  focus:ring-2 focus:ring-primary/20
                  outline-none transition-all leading-relaxed
                "
              />
            </div>

            {/* Rituals and Foods */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Flame size={13} className="text-primary" />
                  <span>أهم الطقوس والفعاليات</span>
                </label>
                <textarea
                  rows={3}
                  value={rituals}
                  onChange={(e) => setRituals(e.target.value)}
                  placeholder="حلقات الذكر والإنشاد&#10;سباقات المرماح والفروسية&#10;حلبات التحطيب بالعصا"
                  className="
                    w-full p-3 text-xs sm:text-sm font-semibold rounded-xl
                    bg-white dark:bg-stone-900
                    text-stone-900 dark:text-stone-100
                    placeholder:text-stone-400 dark:placeholder:text-stone-500
                    border border-stone-300 dark:border-stone-700
                    focus:border-primary outline-none leading-relaxed
                  "
                />
                <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 block">
                  افصل بين كل طقس بسطر جديد
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Utensils size={13} className="text-amber-500" />
                  <span>أكلات وضيافة ونفحة المناسبة</span>
                </label>
                <textarea
                  rows={3}
                  value={famousFoods}
                  onChange={(e) => setFamousFoods(e.target.value)}
                  placeholder="الفتة الصعيدي باللحمة&#10;الكشك الصعيدي المطبوخ&#10;شربات الورد وحلاوة المولد"
                  className="
                    w-full p-3 text-xs sm:text-sm font-semibold rounded-xl
                    bg-white dark:bg-stone-900
                    text-stone-900 dark:text-stone-100
                    placeholder:text-stone-400 dark:placeholder:text-stone-500
                    border border-stone-300 dark:border-stone-700
                    focus:border-primary outline-none leading-relaxed
                  "
                />
                <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 block">
                  افصل بين كل أكلة بسطر جديد
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Cover Image & Presets */}
          <div className="rounded-2xl p-4 sm:p-5 bg-stone-50/70 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-3">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-primary" />
              <span>صورة الغلاف للمناسبة</span>
            </label>

            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/... أو اختر صورة من المقترحات أدناه"
              className="
                w-full min-h-[46px] px-3.5 py-2.5 text-xs sm:text-sm font-mono rounded-xl
                bg-white dark:bg-stone-900
                text-stone-900 dark:text-stone-100
                placeholder:text-stone-400 dark:placeholder:text-stone-500
                border border-stone-300 dark:border-stone-700
                focus:border-primary outline-none
              "
            />

            {/* Quick preset selector */}
            <div>
              <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-2">
                صور صعيدية مقترحة جاهزة للاختيار:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_IMAGES.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoverImage(img.url)}
                    className={`
                      text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1
                      ${coverImage === img.url
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-primary'
                      }
                    `}
                  >
                    <span>{img.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Thumbnail */}
            {coverImage && (
              <div className="relative mt-2 h-36 w-full overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-950">
                <img
                  src={coverImage}
                  alt="معاينة الصورة"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as any).src =
                      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className="absolute top-2 left-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                  title="إزالة الصورة"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Sticky/Fixed Footer Action Buttons */}
          <div
            className="
              sticky bottom-0 z-20 -mx-4 sm:-mx-6 -mb-5
              px-4 sm:px-6 py-4
              border-t border-stone-200 dark:border-stone-800
              bg-white/95 dark:bg-[#181411]/95
              backdrop-blur-md
              flex items-center justify-end gap-3
            "
          >
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onClose()}
              className="
                h-12 px-5 rounded-xl
                border border-stone-300 dark:border-stone-700
                bg-stone-100 hover:bg-stone-200
                dark:bg-stone-800 dark:hover:bg-stone-700
                text-stone-800 dark:text-stone-200
                text-xs sm:text-sm font-bold
                transition-all cursor-pointer
                disabled:opacity-50
              "
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="
                h-12 px-7 rounded-xl
                bg-primary hover:bg-primary-hover active:scale-98
                text-white
                text-xs sm:text-sm font-black
                shadow-lg shadow-amber-600/25
                flex items-center justify-center gap-2
                transition-all cursor-pointer
                disabled:opacity-50
              "
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>جاري الحفظ في الداتا بيز...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEditing ? 'حفظ التعديلات في MongoDB' : 'تسجيل وتوثيق في الداتا بيز'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
