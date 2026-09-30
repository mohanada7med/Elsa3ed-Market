import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi, adminMediaApi } from '../../services/api';
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
  Check,
  Upload,
  Star,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Copy,
  Sliders
} from 'lucide-react';

export interface PlaceEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: HeritagePlace | null;
  onSaved: (updatedPlace: HeritagePlace) => void;
  initialTab?: 'basic' | 'content' | 'visit' | 'media' | 'preview';
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
  initialTab = 'basic',
}) => {
  const { currentUser, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'visit' | 'media' | 'preview'>(
    initialTab || 'basic'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Upload refs & states
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkUrlsInput, setBulkUrlsInput] = useState('');
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

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
    setGallery((prev) => Array.from(new Set([...prev, newGalleryInput.trim()])));
    setNewGalleryInput('');
    addToast('تمت الإضافة', 'تمت إضافة الصورة إلى المعرض', 'success');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGallery((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveImage = (index: number, direction: 'prev' | 'next') => {
    const targetIdx = direction === 'prev' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= gallery.length) return;
    const nextGallery = [...gallery];
    const temp = nextGallery[index];
    nextGallery[index] = nextGallery[targetIdx];
    nextGallery[targetIdx] = temp;
    setGallery(nextGallery);
  };

  const handleFilesUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);
    const authUser = {
      id: currentUser?.id || 'admin',
      role: currentUser?.role || 'admin',
    };

    const targetSlug =
      place?.slug ||
      title
        .trim()
        .toLowerCase()
        .replace(/[^\w\u0621-\u064A]+/g, '-')
        .replace(/^-+|-+$/g, '') ||
      'heritage-place';

    const uploadedUrls: string[] = [];
    const fileList = Array.from(files);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setUploadStatusText(`جاري رفع الصورة ${i + 1} من ${fileList.length} (${file.name})...`);
      setUploadProgress(0);
      try {
        const result = await adminMediaApi.uploadAdminMedia(
          authUser,
          {
            file,
            entityType: 'heritage-places',
            entitySlug: targetSlug,
            entityId: place?.id || targetSlug,
            caption: title.trim() || place?.title || 'معلم تراثي',
            alt: title.trim() || place?.title || 'معلم تراثي',
            isPrimary: false,
            addToGallery: true,
          },
          (percent) => {
            setUploadProgress(percent);
          }
        );
        const url = result?.secureUrl || result?.url;
        if (url) {
          uploadedUrls.push(url.trim());
        }
      } catch (err: any) {
        addToast('خطأ في رفع الملف', err.message || `تعذر رفع ${file.name}`, 'error');
      }
    }

    if (uploadedUrls.length > 0) {
      setGallery((prev) => Array.from(new Set([...prev, ...uploadedUrls])));
      if (!coverImage || coverImage.includes('unsplash.com')) {
        setCoverImage(uploadedUrls[0]);
      }
      addToast('تم الرفع بنجاح', `تمت إضافة ${uploadedUrls.length} صورة إلى معرض المعلم`, 'success');
    }

    setIsUploading(false);
    setUploadProgress(0);
    setUploadStatusText('');
  };

  const handleCoverUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatusText('جاري رفع وتعيين صورة الغلاف الرئيسية...');
    const authUser = {
      id: currentUser?.id || 'admin',
      role: currentUser?.role || 'admin',
    };

    const targetSlug =
      place?.slug ||
      title
        .trim()
        .toLowerCase()
        .replace(/[^\w\u0621-\u064A]+/g, '-')
        .replace(/^-+|-+$/g, '') ||
      'heritage-place';

    try {
      const result = await adminMediaApi.uploadAdminMedia(
        authUser,
        {
          file,
          entityType: 'heritage-places',
          entitySlug: targetSlug,
          entityId: place?.id || targetSlug,
          caption: title.trim() || place?.title || 'معلم تراثي',
          alt: title.trim() || place?.title || 'معلم تراثي',
          isPrimary: true,
          addToGallery: true,
        },
        (percent) => {
          setUploadProgress(percent);
        }
      );
      const url = result?.secureUrl || result?.url;
      if (url) {
        const cleanUrl = url.trim();
        setCoverImage(cleanUrl);
        setGallery((prev) => Array.from(new Set([cleanUrl, ...prev])));
        addToast('تم التحديث', 'تم رفع وتعيين صورة الغلاف بنجاح', 'success');
      }
    } catch (err: any) {
      addToast('خطأ في الرفع', err.message || 'فشل رفع صورة الغلاف', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatusText('');
    }
  };

  const handleAddBulkUrls = () => {
    if (!bulkUrlsInput.trim()) return;
    const lines = bulkUrlsInput
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.startsWith('http://') || s.startsWith('https://'));

    if (lines.length === 0) {
      addToast('روابط غير صحيحة', 'يرجى إدخال روابط تبدأ بـ http أو https', 'warning');
      return;
    }

    setGallery((prev) => Array.from(new Set([...prev, ...lines])));
    if (!coverImage || coverImage.includes('unsplash.com')) {
      setCoverImage(lines[0]);
    }
    setBulkUrlsInput('');
    setShowBulkModal(false);
    addToast('تمت الإضافة', `تمت إضافة ${lines.length} رابط بنجاح`, 'success');
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
                <h2 className="text-base sm:text-lg font-main">
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
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'basic'
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
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'content'
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
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'visit'
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
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'media'
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
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'preview'
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
              {/* Cover Image Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.025] dark:bg-white/[0.025] border border-black/10 dark:border-white/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-black text-primary">
                    <ImageIcon className="w-4 h-4" />
                    <span>الصورة الرئيسية للغلاف (Hero Cover Image)</span>
                  </div>
                  <span className="text-[11px] font-bold text-black/50 dark:text-white/50">
                    تظهر كبانر رئيسي في أعلى صفحة المعلم وفي الكروت
                  </span>
                </div>

                {/* Hidden File Input for Cover */}
                <input
                  type="file"
                  ref={coverFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleCoverUpload(e.target.files[0]);
                    }
                  }}
                />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="أدخل رابط صورة الغلاف أو ارفعها من جهازك..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-black flex items-center justify-center gap-1.5 hover:bg-primary-hover transition-all cursor-pointer shadow-sm shrink-0 disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع غلاف من الجهاز</span>
                  </button>
                </div>

                {coverImage && (
                  <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-inner group">
                    <img
                      src={coverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as any).src = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex flex-col justify-between p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-white text-[10px] font-black shadow">
                          <Star className="w-3 h-3 fill-white" /> الغلاف الرئيسي المعتمد
                        </span>
                        <button
                          type="button"
                          onClick={() => setPreviewModalUrl(coverImage)}
                          className="p-1.5 rounded-xl bg-black/60 text-white hover:bg-primary transition cursor-pointer"
                          title="معاينة بالحجم الكامل"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-white/90 text-xs font-bold">
                        <span className="truncate max-w-[80%] font-mono text-[10px] opacity-75">{coverImage}</span>
                        <button
                          type="button"
                          onClick={() => coverFileInputRef.current?.click()}
                          className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-[11px] font-bold text-white transition cursor-pointer"
                        >
                          تغيير الصورة
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Gallery Images Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.025] dark:bg-white/[0.025] border border-black/10 dark:border-white/10 space-y-4">
                {/* Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black text-primary">معرض صور المعلم التراثي</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-black">
                      {gallery.length} صور
                    </span>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBulkModal(!showBulkModal)}
                      className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 text-black/80 dark:text-white/80"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{showBulkModal ? 'إخفاء لصق الروابط' : 'لصق روابط متعددة'}</span>
                    </button>
                    {gallery.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('هل تريد فعلاً إفراغ المعرض وحذف كل الصور؟')) {
                            setGallery([]);
                            addToast('تم الإفراغ', 'تم إفراغ المعرض', 'warning');
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-red-500 hover:bg-red-500/10 text-xs font-bold transition-all cursor-pointer"
                        title="إفراغ كل صور المعرض"
                      >
                        مسح الكل
                      </button>
                    )}
                  </div>
                </div>

                {/* Hidden File Input for Multiple Gallery Upload */}
                <input
                  type="file"
                  ref={galleryFileInputRef}
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFilesUpload(e.target.files);
                    }
                  }}
                />

                {/* Fast Upload Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleFilesUpload(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => {
                    if (!isUploading) galleryFileInputRef.current?.click();
                  }}
                  className={`
                    relative p-6 rounded-2xl border-2 border-dashed text-center transition-all duration-300 cursor-pointer
                    flex flex-col items-center justify-center gap-2.5
                    ${isDragOver
                      ? 'border-primary bg-primary/10 scale-[1.01]'
                      : 'border-primary/30 hover:border-primary/70 bg-primary/[0.02] hover:bg-primary/[0.05]'
                    }
                    ${isUploading ? 'pointer-events-none opacity-80' : ''}
                  `}
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                      <Upload className="w-6 h-6 text-primary" />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-black text-black/85 dark:text-white/85">
                      {isUploading
                        ? uploadStatusText || 'جاري رفع الصور إلى السحابة...'
                        : 'اسحب وأفلت الصور هنا مباشرة، أو انقر للاختيار من جهازك'}
                    </p>
                    <p className="text-[11px] font-bold text-black/50 dark:text-white/50 mt-1">
                      يدعم اختيار صور متعددة دفعة واحدة (JPG, PNG, WebP) ويتم حفظها سحابياً فوراً
                    </p>
                  </div>

                  {!isUploading && (
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-black shadow-sm mt-1">
                      <Plus className="w-4 h-4" />
                      <span>اختيار صور من الكمبيوتر أو الهاتف</span>
                    </div>
                  )}

                  {/* Upload Progress Bar */}
                  {isUploading && (
                    <div className="w-full max-w-md mx-auto mt-2 space-y-1">
                      <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${Math.max(uploadProgress, 20)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-primary">
                        {uploadProgress > 0 ? `${uploadProgress}%` : 'جاري التحميل...'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bulk URL Mode */}
                {showBulkModal && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 animate-in fade-in duration-200">
                    <label className="block text-xs font-black text-primary">
                      لصق روابط صور متعددة (رابط في كل سطر)
                    </label>
                    <textarea
                      rows={3}
                      value={bulkUrlsInput}
                      onChange={(e) => setBulkUrlsInput(e.target.value)}
                      placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                      className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-black/40 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBulkModal(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-black/60 hover:text-black dark:text-white/60 cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={handleAddBulkUrls}
                        className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-black hover:bg-primary-hover transition cursor-pointer"
                      >
                        إضافة الروابط للمعرض
                      </button>
                    </div>
                  </div>
                )}

                {/* Single URL Quick Add */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={newGalleryInput}
                    onChange={(e) => setNewGalleryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGalleryImage();
                      }
                    }}
                    placeholder="أو اكتب أو الصق رابط صورة سريع هنا واضغط إضافة..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryImage}
                    className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-black flex items-center gap-1.5 cursor-pointer hover:bg-primary-hover transition-all shrink-0 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة الرابط</span>
                  </button>
                </div>

                {/* Gallery Cards Grid */}
                {gallery.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-black/60 dark:text-white/60">
                      <span>الصور الحالية بالمعرض (يمكنك تعيين أي صورة كغلاف بنقرة واحدة أو إعادة ترتيبها)</span>
                      <span className="font-mono text-primary">{gallery.length} صور</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {gallery.map((imgUrl, idx) => {
                        const isCover =
                          coverImage === imgUrl ||
                          coverImage.split('?')[0] === imgUrl.split('?')[0];

                        return (
                          <div
                            key={`${imgUrl}-${idx}`}
                            className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 shadow-sm flex flex-col ${isCover
                                ? 'border-primary ring-2 ring-primary/40 bg-primary/5'
                                : 'border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] hover:border-primary/50 hover:shadow-md'
                              }`}
                          >
                            {/* Thumbnail Canvas */}
                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/10">
                              <img
                                src={imgUrl}
                                alt={`معرض ${idx + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                  (e.target as any).src = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600';
                                }}
                              />

                              {/* Cover Badge */}
                              {isCover && (
                                <div className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-black shadow-md z-10">
                                  <Star className="w-3 h-3 fill-white" />
                                  <span>الغلاف الرئيسي</span>
                                </div>
                              )}

                              {/* Hover Action Overlay */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-20">
                                <div className="flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewModalUrl(imgUrl)}
                                    className="p-1.5 rounded-xl bg-white/20 hover:bg-white/40 text-white transition cursor-pointer"
                                    title="معاينة بالحجم الكامل"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveGalleryImage(idx)}
                                    className="p-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white transition cursor-pointer"
                                    title="حذف الصورة من المعرض"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="flex items-center justify-between gap-1">
                                  {/* Reorder Buttons */}
                                  <div className="flex items-center gap-1">
                                    {idx > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => handleMoveImage(idx, 'prev')}
                                        className="p-1 rounded-lg bg-white/20 hover:bg-white/40 text-white cursor-pointer"
                                        title="تقديم الصورة للأمام"
                                      >
                                        <ChevronRight className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {idx < gallery.length - 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleMoveImage(idx, 'next')}
                                        className="p-1 rounded-lg bg-white/20 hover:bg-white/40 text-white cursor-pointer"
                                        title="تأخير الصورة للخلف"
                                      >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>

                                  {/* Set as Cover */}
                                  {!isCover && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCoverImage(imgUrl);
                                        addToast('تم التعيين', 'تم تعيين هذه الصورة كغلاف رئيسي للمعلم بنجاح', 'success');
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary-hover text-white text-[10px] font-black flex items-center gap-1 cursor-pointer transition shadow"
                                      title="اجعلها صورة الغلاف الرئيسية"
                                    >
                                      <Star className="w-3 h-3" />
                                      <span>اجعلها غلاف</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Card Footer */}
                            <div className="p-2.5 flex items-center justify-between border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                              <span className="text-[11px] font-black text-black/70 dark:text-white/70">
                                توثيق #{idx + 1}
                              </span>
                              {isCover ? (
                                <span className="text-[10px] font-black text-primary flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-primary" /> الغلاف
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCoverImage(imgUrl);
                                    addToast('تم التعيين', 'تم تعيين الصورة كغلاف', 'success');
                                  }}
                                  className="text-[10px] font-bold text-black/50 hover:text-primary transition cursor-pointer"
                                >
                                  تعيين كغلاف
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl border border-dashed border-black/15 dark:border-white/15 text-center text-black/50 dark:text-white/50 text-xs">
                    لا توجد صور في المعرض حالياً. استخدم زر الرفع أعلاه لإضافة صور المكان.
                  </div>
                )}
              </div>

              {/* Videos Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.025] dark:bg-white/[0.025] border border-black/10 dark:border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-primary">
                  <Video className="w-4 h-4" />
                  <span>الفيديوهات التوثيقية واليوتيوب</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-black/70 dark:text-white/70 mb-1.5">
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
                  <label className="block text-[11px] font-bold text-black/70 dark:text-white/70 mb-1.5">
                    إضافة مقطع فيديو إضافي
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={newVideoInput}
                      onChange={(e) => setNewVideoInput(e.target.value)}
                      placeholder="رابط يوتيوب أو فيديو توثيقي آخر..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddVideo}
                      className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-black flex items-center gap-1 cursor-pointer hover:bg-primary-hover transition-all shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة فيديو</span>
                    </button>
                  </div>
                </div>

                {additionalVideos.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {additionalVideos.map((vid, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] text-xs font-mono border border-black/5 dark:border-white/5"
                      >
                        <span className="truncate max-w-[80%]">{vid}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          title="حذف الفيديو"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Instant Full-Screen Preview Lightbox Modal */}
              {previewModalUrl && (
                <div
                  className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
                  onClick={() => setPreviewModalUrl(null)}
                >
                  <div
                    className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl bg-black"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={previewModalUrl}
                      alt="معاينة"
                      className="w-full h-full max-h-[80vh] object-contain"
                    />
                    <div className="p-4 bg-[#181614] flex items-center justify-between gap-3 text-white border-t border-white/10">
                      <span className="font-mono text-xs truncate max-w-[70%] text-white/70">
                        {previewModalUrl}
                      </span>
                      <div className="flex items-center gap-2">
                        {coverImage !== previewModalUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setCoverImage(previewModalUrl);
                              addToast('تم التعيين', 'تم تعيين الصورة كغلاف', 'success');
                              setPreviewModalUrl(null);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5" />
                            <span>اجعلها الغلاف</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setPreviewModalUrl(null)}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold cursor-pointer"
                        >
                          إغلاق
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                    <h3 className="text-2xl font-main">{title || 'اسم المعلم'}</h3>
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
