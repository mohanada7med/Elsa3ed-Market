import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { HeritagePlace, VerificationStatus } from '../../types';
import {
  X,
  Save,
  Image as ImageIcon,
  Video,
  Trash2,
  Plus,
  MapPin,
  Calendar,
  Building2,
  Clock,
  Ticket,
  Compass,
  Landmark,
  Eye,
  FileText,
  Sparkles,
  Layers,
  Check
} from 'lucide-react';

export interface PlaceEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: HeritagePlace | null;
  onSaved: (updatedPlace: HeritagePlace) => void;
}

const UPPER_EGYPT_GOVERNORATES = [
  { id: 'aswan', name: 'أسوان' },
  { id: 'luxor', name: 'الأقصر' },
  { id: 'qena', name: 'قنا' },
  { id: 'sohag', name: 'سوهاج' },
  { id: 'asyut', name: 'أسيوط' },
  { id: 'minya', name: 'المنيا' },
  { id: 'beni-suef', name: 'بني سويف' },
  { id: 'fayoum', name: 'الفيوم' },
  { id: 'red-sea', name: 'البحر الأحمر' },
  { id: 'new-valley', name: 'الوادي الجديد' },
];

const CATEGORIES = [
  { id: 'temple', label: 'معبد فرعوني' },
  { id: 'tomb', label: 'مقابر أثرية' },
  { id: 'monastery', label: 'دير قبطي' },
  { id: 'mosque', label: 'مسجد أثري' },
  { id: 'museum', label: 'متحف تراثي' },
  { id: 'heritage_village', label: 'قرية تراثية' },
  { id: 'nature', label: 'طبيعة ومعلم بيئي' },
  { id: 'cultural_center', label: 'مركز ثقافي وقصر ثقافة' },
  { id: 'pharaonic', label: 'أثر فرعوني' },
  { id: 'coptic', label: 'تراث قبطي' },
  { id: 'islamic', label: 'تراث إسلامي' },
  { id: 'folk', label: 'تراث شعبي' },
];

export const PlaceEditorModal: React.FC<PlaceEditorModalProps> = ({
  isOpen,
  onClose,
  place,
  onSaved,
}) => {
  const { currentUser, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'visit' | 'media' | 'preview'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState(place?.title || '');
  const [category, setCategory] = useState(place?.category || 'temple');
  const [governorateId, setGovernorateId] = useState(place?.governorateId || 'qena');
  const [locationName, setLocationName] = useState(place?.locationName || '');
  const [locationDescription, setLocationDescription] = useState(place?.locationDescription || '');
  const [lat, setLat] = useState<string>(place?.coordinates?.lat?.toString() || '');
  const [lng, setLng] = useState<string>(place?.coordinates?.lng?.toString() || '');

  // Content
  const [shortDescription, setShortDescription] = useState(place?.shortDescription || '');
  const [description, setDescription] = useState(place?.description || '');
  const [history, setHistory] = useState(place?.history || place?.fullHistory || '');
  const [historicalEra, setHistoricalEra] = useState(place?.historicalEra || 'عصر الدولة الحديثة');
  const [significance, setSignificance] = useState(place?.significance || '');
  const [visitorTips, setVisitorTips] = useState(place?.visitorTips || '');
  const [highlightsText, setHighlightsText] = useState((place?.architecturalHighlights || []).join('\n'));

  // Visit & Access
  const [entryFee, setEntryFee] = useState<string>(
    typeof place?.visitInfo?.entryFee === 'string'
      ? place.visitInfo.entryFee
      : place?.visitInfo?.entryFee?.toString() || 'تذاكر عادية للمصريين والأجانب'
  );
  const [openingHours, setOpeningHours] = useState(place?.visitInfo?.openingHours || 'يومياً من ٨:٠٠ ص حتى ٥:٠٠ م');
  const [visitDuration, setVisitDuration] = useState(place?.visitDuration || 'ساعتان إلى ٣ ساعات');
  const [bestTimeToVisit, setBestTimeToVisit] = useState(place?.visitInfo?.bestTimeToVisit || 'فصل الشتاء والصباح الباكر');
  const [transportation, setTransportation] = useState(place?.access?.transportation || '');
  const [servicesText, setServicesText] = useState(
    (place?.visitorServices || []).map((s) => s.name).join('\n')
  );

  // Media
  const [coverImage, setCoverImage] = useState(
    place?.coverImage || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200'
  );
  const [gallery, setGallery] = useState<string[]>(
    place?.gallery && place.gallery.length > 0
      ? place.gallery
      : place?.galleryImages || []
  );
  const [newGalleryInput, setNewGalleryInput] = useState('');
  const [videoUrl, setVideoUrl] = useState(place?.videoUrl || '');
  const [additionalVideos, setAdditionalVideos] = useState<string[]>(place?.videos || []);
  const [newVideoInput, setNewVideoInput] = useState('');

  // Status
  const [status, setStatus] = useState<VerificationStatus>(
    (place?.status || 'approved') as VerificationStatus
  );

  if (!isOpen) return null;

  const currentGov = UPPER_EGYPT_GOVERNORATES.find((g) => g.id === governorateId) || {
    id: governorateId,
    name: place?.governorateName || 'قنا',
  };

  const handleAddGalleryImage = () => {
    if (!newGalleryInput.trim()) return;
    setGallery((prev) => [...prev, newGalleryInput.trim()]);
    setNewGalleryInput('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGallery((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddVideo = () => {
    if (!newVideoInput.trim()) return;
    setAdditionalVideos((prev) => [...prev, newVideoInput.trim()]);
    setNewVideoInput('');
  };

  const handleRemoveVideo = (index: number) => {
    setAdditionalVideos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('حقل مطلوب', 'يرجى إدخال اسم المعلم التراثي', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedHighlights = highlightsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedServices = servicesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name }));

      const coordinates =
        lat && lng
          ? { lat: parseFloat(lat), lng: parseFloat(lng) }
          : place?.coordinates;

      const allVideos = [...additionalVideos];
      if (videoUrl.trim() && !allVideos.includes(videoUrl.trim())) {
        allVideos.unshift(videoUrl.trim());
      }

      const payload: Partial<HeritagePlace> = {
        title: title.trim(),
        category,
        governorateId: currentGov.id,
        governorateName: currentGov.name,
        locationName: locationName.trim() || currentGov.name,
        locationDescription: locationDescription.trim() || undefined,
        shortDescription: shortDescription.trim() || undefined,
        description: description.trim(),
        history: history.trim(),
        fullHistory: history.trim(),
        historicalEra: historicalEra.trim() || undefined,
        significance: significance.trim() || title.trim(),
        visitorTips: visitorTips.trim() || undefined,
        architecturalHighlights: parsedHighlights.length > 0 ? parsedHighlights : undefined,
        visitDuration: visitDuration.trim() || undefined,
        visitInfo: {
          entryFee: entryFee.trim() || undefined,
          openingHours: openingHours.trim() || undefined,
          bestTimeToVisit: bestTimeToVisit.trim() || undefined,
        },
        access: transportation.trim() ? { transportation: transportation.trim() } : undefined,
        visitorServices: parsedServices.length > 0 ? parsedServices : undefined,
        coverImage: coverImage.trim(),
        gallery: gallery.length > 0 ? gallery : [coverImage.trim()],
        galleryImages: gallery.length > 0 ? gallery : [coverImage.trim()],
        videoUrl: videoUrl.trim() || undefined,
        videos: allVideos.length > 0 ? allVideos : undefined,
        coordinates,
        status,
        updatedAt: new Date().toISOString(),
      };

      let result: HeritagePlace;
      if (place?.id) {
        result = await wahApi.updatePlace(place.id, payload, currentUser || { role: 'admin' });
      } else {
        result = await wahApi.savePlace(payload, currentUser || { role: 'admin' });
      }

      addToast('تم الحفظ بنجاح', `تم تحديث بيانات وميديا المعلم "${result.title}" في نفس الصفحة بنجاح`, 'success');
      onSaved(result);
      onClose();
    } catch (err: any) {
      console.error('Error saving place:', err);
      addToast('خطأ في الحفظ', err?.message || 'تعذر تحديث بيانات المعلم، يرجى المحاولة مرة أخرى', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="
          relative w-full max-w-4xl max-h-[92vh]
          flex flex-col
          rounded-[2.5rem]
          bg-cream text-espresso
          dark:bg-espresso-900 dark:text-cream
          border border-black/10 dark:border-white/10
          shadow-2xl overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center border border-primary/20">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-serif">
                  تعديل محتوى وميديا المعلم التراثي
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                  تحكم مباشر
                </span>
              </div>
              <p className="text-xs text-black/60 dark:text-white/60">
                تعديل وحفظ فوري للبيانات والنصوص والوسائط في نفس الصفحة دون مغادرتها
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl text-black/50 dark:text-white/50 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-all"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 border-b border-black/10 dark:border-white/10 flex items-center gap-1.5 bg-black/[0.01] dark:bg-white/[0.01] overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'basic'
                ? 'border-primary text-primary font-black'
                : 'border-transparent text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>1. البيانات والموقع</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'content'
                ? 'border-primary text-primary font-black'
                : 'border-transparent text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>2. التوثيق والتاريخ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('visit')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'visit'
                ? 'border-primary text-primary font-black'
                : 'border-transparent text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>3. التذاكر والزيارة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'media'
                ? 'border-primary text-primary font-black'
                : 'border-transparent text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>4. الصور والفيديوهات</span>
            {(videoUrl || gallery.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'preview'
                ? 'border-primary text-primary font-black'
                : 'border-transparent text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>5. معاينة حية</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* TAB 1: BASIC & LOCATION */}
          {activeTab === 'basic' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    اسم / عنوان المعلم التراثي <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: معبد دندرة، مسجد القنائي، دير المحرق..."
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">التصنيف التراثي</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5">المحافظة</label>
                  <select
                    value={governorateId}
                    onChange={(e) => setGovernorateId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                  >
                    {UPPER_EGYPT_GOVERNORATES.map((gov) => (
                      <option key={gov.id} value={gov.id}>
                        {gov.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">المدينة أو المركز أو المنطقة</label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="مثال: مركز دندرة، غرب النيل، مدينة أسوان..."
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">الوصف الجغرافي التفصيلي والعنوان</label>
                <input
                  type="text"
                  value={locationDescription}
                  onChange={(e) => setLocationDescription(e.target.value)}
                  placeholder="مثال: يقع على الضفة الغربية لنهر النيل ويبعد ٥ كم عن مدينة قنا..."
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Coordinates */}
              <div className="p-4 rounded-2xl bg-black/[0.025] dark:bg-white/[0.025] border border-black/10 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>إحداثيات الخريطة الحية (GPS Coordinates)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-black/60 dark:text-white/60 mb-1">
                      خط العرض (Latitude)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="26.1416"
                      className="w-full px-3 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-black/60 dark:text-white/60 mb-1">
                      خط الطول (Longitude)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="32.6703"
                      className="w-full px-3 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold mb-1.5">حالة التحقق والنشر</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="radio"
                      name="status"
                      value="approved"
                      checked={status === 'approved'}
                      onChange={() => setStatus('approved')}
                      className="text-primary focus:ring-primary"
                    />
                    <span>منشور وموثق للعامة (Approved)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="radio"
                      name="status"
                      value="pending_review"
                      checked={status === 'pending_review'}
                      onChange={() => setStatus('pending_review')}
                      className="text-primary focus:ring-primary"
                    />
                    <span>مسودة وقيد المراجعة</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTENT & HISTORY */}
          {activeTab === 'content' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  النبذة التوثيقية المختصرة (Short Description)
                </label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="موجز سريع عن المعلم يظهر في البطاقات والمشاركات..."
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs leading-relaxed focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  الوصف التفصيلي والقصة التراثية <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب وصفاً ثرياً وممتعاً يروي روح المكان وعظمته التراثية..."
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs leading-relaxed focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5">العصر التاريخي</label>
                  <input
                    type="text"
                    value={historicalEra}
                    onChange={(e) => setHistoricalEra(e.target.value)}
                    placeholder="مثال: العصر البطلمي والروماني، العصر الفاطمي، الدولة القديمة..."
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">الأهمية التراثية والرمزية</label>
                  <input
                    type="text"
                    value={significance}
                    onChange={(e) => setSignificance(e.target.value)}
                    placeholder="مثال: أعظم معبد محفوظ لسقف فلكي في مصر القديمة..."
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  السياق التاريخي الكامل (Full History)
                </label>
                <textarea
                  rows={4}
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                  placeholder="تفاصيل التأسيس، الملوك أو البناة، التطور التاريخي، والتنقيبات..."
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs leading-relaxed focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    السمات والملامح المعمارية (كل سمة في سطر)
                  </label>
                  <textarea
                    rows={3}
                    value={highlightsText}
                    onChange={(e) => setHighlightsText(e.target.value)}
                    placeholder="الأعمدة الحتحورية الفريدة&#10;السرداب السفلي السري&#10;الزودياك وسقف الأبراج السماوية"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs leading-relaxed focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    نصائح وإرشادات الزوار
                  </label>
                  <textarea
                    rows={3}
                    value={visitorTips}
                    onChange={(e) => setVisitorTips(e.target.value)}
                    placeholder="يُفضل الزيارة صباحاً لتجنب حرارة الشمس، واصطحاب كشاف يدوي لرؤية نقوش السراديب..."
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs leading-relaxed focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VISIT & ACCESS */}
          {activeTab === 'visit' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    ساعات العمل وأوقات الفتح
                  </label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="يومياً من ٨:٠٠ ص حتى ٥:٠٠ م"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    مدة الزيارة المقترحة
                  </label>
                  <input
                    type="text"
                    value={visitDuration}
                    onChange={(e) => setVisitDuration(e.target.value)}
                    placeholder="ساعتان إلى ٣ ساعات"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    رسوم وتذاكر الدخول
                  </label>
                  <input
                    type="text"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    placeholder="مثال: ٤٠ ج للمصريين / ٢٠ ج للطلبة / ٢٠٠ ج للأجانب"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    أفضل أوقات الزيارة
                  </label>
                  <input
                    type="text"
                    value={bestTimeToVisit}
                    onChange={(e) => setBestTimeToVisit(e.target.value)}
                    placeholder="فصل الشتاء والربيع، والصباح الباكر"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  طرق الوصول والمواصلات (Transportation)
                </label>
                <input
                  type="text"
                  value={transportation}
                  onChange={(e) => setTransportation(e.target.value)}
                  placeholder="ميكروباص من موقف قنا أو تاكسي مباشر، أو قطار الصعيد حتى محطة قنا..."
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  الخدمات المتاحة للزوار (كل خدمة في سطر)
                </label>
                <textarea
                  rows={3}
                  value={servicesText}
                  onChange={(e) => setServicesText(e.target.value)}
                  placeholder="موقف سيارات مجاني&#10;مركز زوار ومطويات إرشادية&#10;مرشدون سياحيون معتمدون&#10;دورات مياه وكافيتريا"
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs leading-relaxed focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA (PHOTOS & VIDEOS) */}
          {activeTab === 'media' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Cover Image */}
              <div className="p-4 rounded-2xl bg-black/[0.025] dark:bg-white/[0.025] border border-black/10 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <ImageIcon className="w-4 h-4" />
                  <span>الصورة الرئيسية للغلاف (Hero Cover Image)</span>
                </div>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                />
                {coverImage && (
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-black/10 dark:border-white/10">
                    <img
                      src={coverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).src = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                      <span className="text-white text-xs font-bold">معاينة الغلاف الحي</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div className="p-4 rounded-2xl bg-black/[0.025] dark:bg-white/[0.025] border border-black/10 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary">
                    <Layers className="w-4 h-4" />
                    <span>معرض صور المعلم التراثي ({gallery.length} صور)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={newGalleryInput}
                    onChange={(e) => setNewGalleryInput(e.target.value)}
                    placeholder="أدخل رابط صورة تراثية جديدة..."
                    className="flex-1 px-4 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryImage}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-primary-hover transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة</span>
                  </button>
                </div>

                {gallery.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    {gallery.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="group relative h-24 rounded-xl overflow-hidden border border-black/10 dark:border-white/10"
                      >
                        <img
                          src={imgUrl}
                          alt={`معرض ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-1.5 left-1.5 p-1 rounded-lg bg-black/70 text-rose-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="حذف الصورة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Videos */}
              <div className="p-4 rounded-2xl bg-black/[0.025] dark:bg-white/[0.025] border border-black/10 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <Video className="w-4 h-4" />
                  <span>الفيديوهات التوثيقية واليوتيوب</span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-black/60 dark:text-white/60 mb-1">
                    رابط الفيديو التوثيقي الرئيسي
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... أو رابط مباشر"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-black/60 dark:text-white/60 mb-1">
                    إضافة مقطع فيديو إضافي
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={newVideoInput}
                      onChange={(e) => setNewVideoInput(e.target.value)}
                      placeholder="رابط يوتيوب أو فيديو توثيقي آخر..."
                      className="flex-1 px-4 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddVideo}
                      className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-primary-hover transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة</span>
                    </button>
                  </div>
                </div>

                {additionalVideos.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {additionalVideos.map((vid, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] text-xs font-mono"
                      >
                        <span className="truncate max-w-[80%]">{vid}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: LIVE PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-5 rounded-3xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 space-y-4">
                <div className="relative h-56 rounded-2xl overflow-hidden">
                  <img
                    src={coverImage}
                    alt={title || 'المعلم'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 flex flex-col justify-end text-white">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary text-xs font-black w-max mb-2">
                      {CATEGORIES.find((c) => c.id === category)?.label || category}
                    </span>
                    <h3 className="text-2xl font-black font-serif">{title || 'اسم المعلم'}</h3>
                    <div className="flex items-center gap-3 text-xs mt-1 font-bold text-white/80">
                      <span>محافظة {currentGov.name}</span>
                      <span>•</span>
                      <span>{historicalEra}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-espresso-800/80 border border-black/10 dark:border-white/10">
                  <h4 className="text-xs font-bold text-primary mb-1">النبذة التوثيقية</h4>
                  <p className="text-xs leading-relaxed text-black/80 dark:text-white/80">
                    {description || shortDescription || 'لم يتم إدخال وصف بعد...'}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03]">
                    <span className="block text-[10px] text-black/50 dark:text-white/50 font-bold">المواعيد</span>
                    <span className="text-xs font-bold line-clamp-1">{openingHours}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03]">
                    <span className="block text-[10px] text-black/50 dark:text-white/50 font-bold">المدة المقترحة</span>
                    <span className="text-xs font-bold line-clamp-1">{visitDuration}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03]">
                    <span className="block text-[10px] text-black/50 dark:text-white/50 font-bold">التذاكر</span>
                    <span className="text-xs font-bold line-clamp-1">{entryFee}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03]">
                    <span className="block text-[10px] text-black/50 dark:text-white/50 font-bold">معرض الصور</span>
                    <span className="text-xs font-bold">{gallery.length} صور</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              إلغاء
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== 'preview' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'basic') setActiveTab('content');
                    else if (activeTab === 'content') setActiveTab('visit');
                    else if (activeTab === 'visit') setActiveTab('media');
                    else if (activeTab === 'media') setActiveTab('preview');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-black/5 dark:bg-cream/10 text-xs font-bold hover:bg-black/10 transition-all cursor-pointer"
                >
                  التبويب التالي
                </button>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  px-6 py-2.5 rounded-xl
                  bg-primary hover:bg-primary-hover
                  text-white text-xs font-black
                  flex items-center gap-2
                  transition-all shadow-md
                  cursor-pointer disabled:opacity-50
                "
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'جاري الحفظ والتحديث...' : 'حفظ التعديلات في نفس الصفحة'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
