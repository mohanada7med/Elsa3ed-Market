import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { CulturalEvent, VerificationStatus } from '../../types';
import {
  Calendar,
  Sparkles,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Video,
  Image as ImageIcon,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Save,
  Film,
  Utensils,
  Flame,
  Music,
  ExternalLink,
  ChevronRight,
  Filter,
  Play,
  Layers,
  SlidersHorizontal,
  Compass,
  Building2,
  Wheat,
  Share2,
  Award
} from 'lucide-react';
import { AdminMediaUploader } from '../common/AdminMediaUploader';
import { isVideoUrl, getOptimizedVideoUrl } from '../../utils/cloudinaryMedia';

// Upper Egypt Governorates List
const UPPER_EGYPT_GOVERNORATES = [
  { id: 'qena', name: 'قنا' },
  { id: 'luxor', name: 'الأقصر' },
  { id: 'aswan', name: 'أسوان' },
  { id: 'sohag', name: 'سوهاج' },
  { id: 'asyut', name: 'أسيوط' },
  { id: 'minya', name: 'المنيا' },
  { id: 'beni_suef', name: 'بني سويف' },
  { id: 'fayoum', name: 'الفيوم' },
  { id: 'new_valley', name: 'الوادي الجديد' },
  { id: 'red_sea', name: 'البحر الأحمر' }
];

// Event Categories
const EVENT_CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: 'moulid', label: 'موالد وأولياء الصالحين', icon: '🕌' },
  { id: 'harvest', label: 'مواسم الحصاد والزراعة', icon: '🌾' },
  { id: 'festival', label: 'مهرجانات واحتفالات كبرى', icon: '🎉' },
  { id: 'cultural_night', label: 'فروسية ومرماح وهجن', icon: '🐎' },
  { id: 'market_fair', label: 'أسواق ومواسم حرفية وتراثية', icon: '🏺' }
];

// Preset suggestions in authentic Upper Egyptian Dialect for content creators
const DIALECT_RITUAL_SUGGESTIONS = [
  'مرماح الخيل الصعيدي واستعراضات الفروسية في الميدان المفتوح',
  'زفة المحمل والجمال المزركشة والهوادج في الحارات والشوارع القديمة',
  'حلقات الذكر الصوفي والإنشاد الديني مع كبار المداحين لطلوع الفجر',
  'توزيع نفحة الفول النابت الساخن والخبز الشمسي صواني لله',
  'شربات الورد الساقع بالموز المقطع المثلج يتوزع على العطشانين',
  'حلقات التحطيب بالعصي الشوم على نغمات المزمار والطبول الصعيدية',
  'فرشة عرائس المولد الحلاوة والأحصنة والطرابيش والمزامير للأطفال',
  'مدائح نبوية وزيارات الأضرحة وتلاوة الفاتحة والتبرك'
];

const DIALECT_FOOD_SUGGESTIONS = [
  'الفول النابت الصعيدي بالليمون والكمون والخبز الشمسي المقمر',
  'شربات الورد بالموز المثلج (مشروب النفحة الأول في الصعيد)',
  'الكسكسي الصعيدي المسقي بشوربة اللحم البلدي أو المفتوت بالسكر والسمن البلدي',
  'الزلابية الصعيدية المقرمشة المغطاة بالعسل الأسود النقي',
  'كباب صعيدي باللحم المتبل والمخروطة الساخنة',
  'حلاوة المولد الصعيدية التراثية (سمسمية، حمصية، فولية، نوجا)'
];

// Video helper to format embed URL for preview
function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  
  // YouTube watch link
  const ytMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  
  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
}

interface AdminEventsManagerProps {
  governorateId?: string;
  governorateName?: string;
  onNavigateBack?: () => void;
  onClose?: () => void;
  onEventUpdated?: () => void;
}

export const AdminEventsManagerComponent: React.FC<AdminEventsManagerProps> = ({
  governorateId,
  governorateName,
  onNavigateBack,
  onClose,
  onEventUpdated
}) => {
  const { setActivePage, navigateToEvent, addToast, currentUser } = useApp();

  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGov, setSelectedGov] = useState<string>(governorateName || 'all');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'has_video' | 'has_gallery'>('all');

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CulturalEvent | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    event: CulturalEvent | null;
  }>({ isOpen: false, event: null });

  // Load events from database
  const loadEvents = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const data = await wahApi.getEvents();
      setEvents(data || []);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      addToast('خطأ في الاتصال', 'تعذر تحميل بيانات المواسم والموالد من قاعدة البيانات', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Filtered list
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Gov filter
      if (selectedGov !== 'all' && ev.governorateName !== selectedGov) {
        return false;
      }
      // Specific gov prop lock
      if (governorateName && ev.governorateName !== governorateName) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && ev.category !== selectedCategory) {
        return false;
      }
      // Media filter
      if (mediaFilter === 'has_video' && !ev.videoUrl && (!ev.videos || ev.videos.length === 0)) {
        return false;
      }
      if (mediaFilter === 'has_gallery' && (!ev.gallery || ev.gallery.length === 0)) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = ev.title?.toLowerCase().includes(q);
        const matchDesc = ev.description?.toLowerCase().includes(q);
        const matchGov = ev.governorateName?.toLowerCase().includes(q);
        const matchLoc = (ev.locationName || ev.cityName || ev.location || '').toLowerCase().includes(q);
        const matchTrad = (ev.traditions || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchGov && !matchLoc && !matchTrad) {
          return false;
        }
      }
      return true;
    });
  }, [events, selectedGov, governorateName, selectedCategory, mediaFilter, searchQuery]);

  // Quick stats
  const stats = useMemo(() => {
    const total = events.length;
    const moulids = events.filter((e) => e.category === 'moulid').length;
    const harvests = events.filter((e) => e.category === 'harvest').length;
    const festivals = events.filter((e) => e.category === 'festival').length;
    const culturalNights = events.filter((e) => e.category === 'cultural_night').length;
    const withVideos = events.filter((e) => e.videoUrl || (e.videos && e.videos.length > 0)).length;
    return { total, moulids, harvests, festivals, culturalNights, withVideos };
  }, [events]);

  // Handle Delete
  const handleDeleteEvent = async (event: CulturalEvent) => {
    try {
      await wahApi.deleteEvent(event.id, currentUser || undefined);
      addToast('تم الحذف', `تم حذف احتفال «${event.title}» من قاعدة البيانات`, 'success');
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      setDeleteConfirmation({ isOpen: false, event: null });
      if (onEventUpdated) onEventUpdated();
    } catch (err: any) {
      console.error('Delete event error:', err);
      addToast('خطأ في الحذف', err.message || 'تعذر حذف الفعالية', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-espresso-900 via-espresso-950 to-primary/30 p-6 sm:p-8 text-cream border border-primary/20 shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>لوحة الإدارة الشاملة للمواسم والأعياد والموالد الصعيدية</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-cream">
              إدارة احتفالات وليالي الصعيد التراثية
            </h1>
            <p className="text-cream/80 text-sm sm:text-base leading-relaxed">
              توثيق شامل ومباشر في قاعدة البيانات (MongoDB) بالعامية المصرية الأصيلة؛ أضف الموالد الكبرى، مواسم كسر القصب والحصاد، ليالي المرماح والفروسية، مع إضافة الصور عالية الجودة وفيديوهات الذكر والتحطيب والاحتفال، وتعديلها فورياً.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingEvent(null);
                setIsEditModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-cream font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة موسم أو مولد جديد</span>
            </button>

            <button
              type="button"
              onClick={() => loadEvents(true)}
              disabled={isRefreshing}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-cream font-bold text-sm flex items-center gap-2 backdrop-blur-md border border-white/10 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>تحديث البيانات</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-sm flex items-center gap-2 backdrop-blur-md border border-amber-500/30 transition-all cursor-pointer shadow-md"
              >
                <X className="w-4 h-4" />
                <span>إغلاق لوحة التعديل</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActivePage('events')}
              className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/15 text-cream/90 font-medium text-sm flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>معاينة صفحة الزوار</span>
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
            <span className="text-2xl font-black font-serif text-amber-300">{stats.total}</span>
            <p className="text-[11px] text-cream/70 mt-0.5">إجمالي الليالي والمواسم</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
            <span className="text-2xl font-black font-serif text-emerald-400">{stats.moulids}</span>
            <p className="text-[11px] text-cream/70 mt-0.5">موالد وليالي أولياء</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
            <span className="text-2xl font-black font-serif text-amber-400">{stats.harvests}</span>
            <p className="text-[11px] text-cream/70 mt-0.5">مواسم زراعة وحصاد</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
            <span className="text-2xl font-black font-serif text-blue-400">{stats.festivals}</span>
            <p className="text-[11px] text-cream/70 mt-0.5">مهرجانات كبرى</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
            <span className="text-2xl font-black font-serif text-purple-400">{stats.culturalNights}</span>
            <p className="text-[11px] text-cream/70 mt-0.5">فروسية ومرماح</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
            <span className="text-2xl font-black font-serif text-rose-400">{stats.withVideos}</span>
            <p className="text-[11px] text-cream/70 mt-0.5">موثقة بفيديوهات 🎥</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-espresso-900/90 rounded-3xl p-5 border border-black/10 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40" />
            <input
              type="text"
              placeholder="ابحث بالاسم، المحافظة، القرية، طقوس الليلة، أكلات النفحة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Governorate selector */}
          {!governorateName && (
            <div className="w-full md:w-56">
              <select
                value={selectedGov}
                onChange={(e) => setSelectedGov(e.target.value)}
                aria-label="تصفية حسب المحافظة"
                className="w-full py-2.5 px-3 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary cursor-pointer font-medium"
              >
                <option value="all">كافة محافظات الصعيد</option>
                {UPPER_EGYPT_GOVERNORATES.map((g) => (
                  <option key={g.id} value={g.name}>
                    محافظة {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category selector */}
          <div className="w-full md:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="تصفية حسب التصنيف"
              className="w-full py-2.5 px-3 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary cursor-pointer font-medium"
            >
              <option value="all">كافة أنواع الاحتفالات</option>
              {EVENT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Media selector */}
          <div className="w-full md:w-48">
            <select
              value={mediaFilter}
              onChange={(e) => setMediaFilter(e.target.value as any)}
              aria-label="تصفية الوسائط"
              className="w-full py-2.5 px-3 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary cursor-pointer font-medium"
            >
              <option value="all">كل الوسائط</option>
              <option value="has_video">يحتوي فيديو 🎥</option>
              <option value="has_gallery">يحتوي معرض صور 📷</option>
            </select>
          </div>
        </div>

        {/* Quick pill filters for categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-black/50 dark:text-white/50 text-xs shrink-0 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>تصنيف سريع:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full shrink-0 font-medium transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-primary text-cream font-bold'
                : 'bg-black/5 dark:bg-cream/5 hover:bg-black/10 dark:hover:bg-cream/10 text-black/70 dark:text-white/70'
            }`}
          >
            الكل ({events.length})
          </button>
          {EVENT_CATEGORIES.map((cat) => {
            const count = events.filter((e) => e.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full shrink-0 font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-cream font-bold'
                    : 'bg-black/5 dark:bg-cream/5 hover:bg-black/10 dark:hover:bg-cream/10 text-black/70 dark:text-white/70'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="text-center py-24 space-y-4">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-black/60 dark:text-white/60 font-serif">جاري تحميل بيانات المواسم والموالد من قاعدة البيانات...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-espresso-900/50 rounded-3xl border border-dashed border-black/20 dark:border-white/20 p-8 space-y-4">
          <Calendar className="w-12 h-12 text-primary/40 mx-auto" />
          <h3 className="text-lg font-bold font-serif">لا توجد احتفالات مطابقة للبحث</h3>
          <p className="text-xs text-black/60 dark:text-white/60 max-w-md mx-auto">
            لم نجد مواسم أو موالد تطابق معايير التصفية المحددة. يمكنك إضافة موسم جديد أو إعادة ضبط المرشحات.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedGov('all');
              setMediaFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-black/5 dark:bg-cream/10 hover:bg-black/10 text-xs font-bold cursor-pointer transition-all"
          >
            إعادة ضبط خيارات البحث
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const hasVideo = Boolean(event.videoUrl || (event.videos && event.videos.length > 0));
            const galleryCount = event.gallery ? event.gallery.length : 0;
            const categoryObj = EVENT_CATEGORIES.find((c) => c.id === event.category);

            return (
              <div
                key={event.id}
                className="group relative bg-white dark:bg-espresso-900 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Image & Video Top Header */}
                <div className="relative h-52 w-full bg-black/10 overflow-hidden">
                  <img
                    src={event.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Top badges */}
                  <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 z-10">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-cream text-[11px] font-bold border border-white/15 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{event.governorateName}</span>
                    </span>
                    {categoryObj && (
                      <span className="px-2.5 py-1 rounded-full bg-primary/80 backdrop-blur-md text-cream text-[11px] font-bold border border-white/15 flex items-center gap-1">
                        <span>{categoryObj.icon}</span>
                        <span>{categoryObj.label}</span>
                      </span>
                    )}
                  </div>

                  {/* Media badges (Videos & Gallery) */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                    {hasVideo && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-600/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                        <Film className="w-3 h-3" />
                        <span>فيديو 🎥</span>
                      </span>
                    )}
                    {galleryCount > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 border border-white/10">
                        <ImageIcon className="w-3 h-3" />
                        <span>{galleryCount} صور</span>
                      </span>
                    )}
                  </div>

                  {/* Date Badge over image bottom */}
                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-cream z-10">
                    <span className="text-xs font-bold flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-white/10">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      <span>{event.eventDate || event.season || 'موسم سنوي'}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/80 text-white font-bold">
                      {event.status === 'approved' ? 'معتمد في الداتابيز' : 'قيد المراجعة'}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <h3 className="font-serif font-black text-lg text-black dark:text-cream group-hover:text-primary transition-colors line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs text-black/60 dark:text-white/60">
                      <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="line-clamp-1">{event.locationName || event.cityName || event.governorateName}</span>
                    </div>

                    {/* Egyptian dialect narrative snippet */}
                    <p className="text-xs text-black/70 dark:text-white/70 line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Rituals tags */}
                    {event.rituals && event.rituals.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold text-black/50 dark:text-white/50 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-500" />
                          <span>طقوس الليلة الصعيدية:</span>
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {event.rituals.slice(0, 3).map((rit, rIdx) => (
                            <span
                              key={rIdx}
                              className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/20"
                            >
                              {rit}
                            </span>
                          ))}
                          {event.rituals.length > 3 && (
                            <span className="text-[10px] text-black/40 dark:text-white/40 self-center">
                              +{event.rituals.length - 3} المزيد
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Famous foods / Nafha */}
                    {event.famousFoods && event.famousFoods.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 rounded-xl border border-emerald-500/20">
                        <Utensils className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-bold shrink-0">أكلات النفحة:</span>
                        <span className="truncate">{event.famousFoods.slice(0, 2).join('، ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-2">
                    {/* View & Live Edit on site button */}
                    <button
                      type="button"
                      onClick={() => navigateToEvent(event.slug)}
                      className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-cream/10 hover:bg-black/10 dark:hover:bg-cream/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all text-black/80 dark:text-cream border border-black/5 dark:border-white/5"
                      title="فتح صفحة المولد الحية مع إمكانية التعديل المباشر"
                    >
                      <Eye className="w-3.5 h-3.5 text-primary" />
                      <span>صفحة المولد الحية</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Full Edit button */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEvent(event);
                          setIsEditModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                        title="تعديل تفاصيل وبيانات وميديا الاحتفال"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>تعديل وميديا الاحتفال</span>
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmation({ isOpen: true, event })}
                        className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 cursor-pointer transition-all"
                        title="حذف الفعالية"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COMPREHENSIVE EVENT EDITOR WITH MEDIA, DIALECT & HISTORICAL DATA */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <EventEditorModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          event={editingEvent}
          lockedGovernorate={governorateName}
          onSaved={(savedEvent) => {
            setIsEditModalOpen(false);
            setEvents((prev) => {
              const idx = prev.findIndex((e) => e.id === savedEvent.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = savedEvent;
                return next;
              }
              return [savedEvent, ...prev];
            });
            addToast('تم الحفظ بنجاح', `تم حفظ بيانات «${savedEvent.title}» في قاعدة البيانات`, 'success');
            if (onEventUpdated) onEventUpdated();
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deleteConfirmation.isOpen && deleteConfirmation.event && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-espresso-900 rounded-3xl max-w-md w-full p-6 border border-black/10 dark:border-white/10 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold font-serif">هل أنت متأكد من حذف هذا الاحتفال؟</h3>
              <p className="text-xs text-black/60 dark:text-white/60">
                سيتم حذف احتفال «{deleteConfirmation.event.title}» نهائياً من قاعدة بيانات المنصة ومحتوى صعيد مصر.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmation({ isOpen: false, event: null })}
                className="flex-1 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold hover:bg-black/5 dark:hover:bg-cream/10 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleDeleteEvent(deleteConfirmation.event!)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                نعم، احذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Standalone page wrapper
export const AdminEventsManagerPage: React.FC = () => {
  const { setActivePage } = useApp();

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120F0D] text-black dark:text-cream py-10 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
            <button
              type="button"
              onClick={() => setActivePage('cultural-cms')}
              className="hover:text-primary transition-colors cursor-pointer font-bold"
            >
              لوحة التوثيق وإدارة التراث
            </button>
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            <button
              type="button"
              onClick={() => setActivePage('events')}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              المواسم والليالي
            </button>
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            <span className="text-primary font-bold">إدارة الموالد والمواسم والصور والفيديوهات</span>
          </div>

          <button
            type="button"
            onClick={() => setActivePage('events')}
            className="px-3.5 py-1.5 rounded-xl bg-black/5 dark:bg-cream/10 hover:bg-black/10 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>العودة لصفحة المواسم</span>
          </button>
        </div>

        {/* The core management component */}
        <AdminEventsManagerComponent />
      </div>
    </div>
  );
};

// ============================================================================
// MODAL: RICH EVENT EDITOR WITH DIALECT NARRATIVES, PHOTOS & VIDEOS
// ============================================================================
export interface EventEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CulturalEvent | null;
  lockedGovernorate?: string;
  onSaved: (savedEvent: CulturalEvent) => void;
}

export const EventEditorModal: React.FC<EventEditorModalProps> = ({
  isOpen,
  onClose,
  event,
  lockedGovernorate,
  onSaved
}) => {
  const { currentUser, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'basic' | 'dialect_content' | 'media' | 'preview'>('basic');

  // Form fields
  const [title, setTitle] = useState(event?.title || '');
  const [governorateName, setGovernorateName] = useState(
    event?.governorateName || lockedGovernorate || 'قنا'
  );
  const [cityName, setCityName] = useState(event?.cityName || '');
  const [locationName, setLocationName] = useState(event?.locationName || '');
  const [category, setCategory] = useState(event?.category || 'moulid');
  const [eventDate, setEventDate] = useState(event?.eventDate || 'النصف من شهر شعبان (سنوياً)');
  const [startDate, setStartDate] = useState(event?.startDate || '');
  const [endDate, setEndDate] = useState(event?.endDate || '');
  const [eventTime, setEventTime] = useState(event?.eventTime || 'من بعد صلاة العصر وحتى صلاة الفجر');
  const [season, setSeason] = useState(event?.season || 'موسم سنوي');

  // Dialect narrative & cultural details
  const [description, setDescription] = useState(event?.description || '');
  const [traditions, setTraditions] = useState(event?.traditions || '');
  const [ritualsText, setRitualsText] = useState(
    event?.rituals && event.rituals.length > 0 ? event.rituals.join('\n') : ''
  );
  const [famousFoodsText, setFamousFoodsText] = useState(
    event?.famousFoods && event.famousFoods.length > 0 ? event.famousFoods.join('\n') : ''
  );
  const [activitiesText, setActivitiesText] = useState(
    event?.activities && event.activities.length > 0 ? event.activities.join('\n') : ''
  );
  const [sourceName, setSourceName] = useState(
    event?.sourceName || 'أطلس المأثورات الشعبية ومجتمع صعيد مصر'
  );

  // Media
  const [coverImage, setCoverImage] = useState(
    event?.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200'
  );
  const [videoUrl, setVideoUrl] = useState(event?.videoUrl || '');
  const [additionalVideos, setAdditionalVideos] = useState<string[]>(
    event?.videos && event.videos.length > 0 ? event.videos : []
  );
  const [newVideoInput, setNewVideoInput] = useState('');
  const [gallery, setGallery] = useState<string[]>(
    event?.gallery && event.gallery.length > 0 ? event.gallery : []
  );
  const [newGalleryImageInput, setNewGalleryImageInput] = useState('');

  // Coordinates
  const [lat, setLat] = useState<string>(event?.coordinates?.lat?.toString() || '');
  const [lng, setLng] = useState<string>(event?.coordinates?.lng?.toString() || '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick helper to insert suggested dialect text
  const addRitualSuggestion = (suggestion: string) => {
    setRitualsText((prev) => (prev ? `${prev}\n${suggestion}` : suggestion));
  };

  const addFoodSuggestion = (suggestion: string) => {
    setFamousFoodsText((prev) => (prev ? `${prev}\n${suggestion}` : suggestion));
  };

  const handleAddVideo = () => {
    if (!newVideoInput.trim()) return;
    setAdditionalVideos((prev) => [...prev, newVideoInput.trim()]);
    setNewVideoInput('');
  };

  const handleRemoveVideo = (index: number) => {
    setAdditionalVideos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddGalleryImage = () => {
    if (!newGalleryImageInput.trim()) return;
    setGallery((prev) => [...prev, newGalleryImageInput.trim()]);
    setNewGalleryImageInput('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGallery((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('حقل مطلوب', 'يرجى كتابة عنوان الاحتفال أو المولد', 'warning');
      setActiveTab('basic');
      return;
    }
    if (!description.trim()) {
      addToast('حقل مطلوب', 'يرجى كتابة الحكاية التراثية بالعامية المصرية', 'warning');
      setActiveTab('dialect_content');
      return;
    }

    setIsSubmitting(true);

    try {
      const govObj = UPPER_EGYPT_GOVERNORATES.find((g) => g.name === governorateName);
      const govId = govObj?.id || `gov-${encodeURIComponent(governorateName)}`;
      const slug =
        event?.slug ||
        `moulid-${Date.now()}-${title
          .trim()
          .toLowerCase()
          .replace(/[^\u0621-\u064A\w]+/g, '-')}`;

      const parsedRituals = ritualsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedFoods = famousFoodsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedActivities = activitiesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const coordinates = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;

      // Consolidate videos
      const allVideos = [...additionalVideos];
      if (videoUrl.trim() && !allVideos.includes(videoUrl.trim())) {
        allVideos.unshift(videoUrl.trim());
      }

      const payload: Partial<CulturalEvent> = {
        id: event?.id,
        title: title.trim(),
        slug,
        governorateName,
        governorateId: govId,
        cityName: cityName.trim() || undefined,
        locationName: locationName.trim() || governorateName,
        location: locationName.trim() || governorateName,
        category: category as any,
        eventDate: eventDate.trim() || 'موسم سنوي',
        startDate: startDate.trim() || undefined,
        endDate: endDate.trim() || undefined,
        eventTime: eventTime.trim() || undefined,
        season: season.trim() || undefined,
        description: description.trim(),
        traditions: traditions.trim() || undefined,
        rituals: parsedRituals.length > 0 ? parsedRituals : undefined,
        famousFoods: parsedFoods.length > 0 ? parsedFoods : undefined,
        activities: parsedActivities.length > 0 ? parsedActivities : undefined,
        coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
        videoUrl: videoUrl.trim() || undefined,
        videos: allVideos.length > 0 ? allVideos : undefined,
        gallery: gallery.length > 0 ? gallery : undefined,
        coordinates,
        sourceName: sourceName.trim() || undefined,
        status: (event?.status || 'approved') as VerificationStatus,
        createdAt: event?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let saved: CulturalEvent;
      if (event?.id) {
        saved = await wahApi.updateEvent(event.id, payload, currentUser || undefined);
      } else {
        saved = await wahApi.saveEvent(payload, currentUser || undefined);
      }

      onSaved(saved);
    } catch (err: any) {
      console.error('Save event failed:', err);
      addToast('فشل الحفظ', err.message || 'تعذر حفظ بيانات الفعالية في قاعدة البيانات', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const primaryVideoEmbed = getVideoEmbedUrl(videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-espresso-950 rounded-[2.5rem] max-w-4xl w-full max-h-[92vh] flex flex-col border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-black">
                {event ? `تعديل احتفال: ${event.title}` : 'إضافة احتفال أو موسم صعيدي جديد'}
              </h2>
              <p className="text-xs text-black/60 dark:text-white/60">
                يتم التخزين في قاعدة البيانات وعرض المحتوى بالعامية المصرية التراثية مع الصور والفيديوهات
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-black/50 dark:text-white/50 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 border-b border-black/10 dark:border-white/10 flex items-center gap-2 bg-black/[0.01] dark:bg-white/[0.01] overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'basic'
                ? 'border-primary text-primary'
                : 'border-transparent text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>1. البيانات الأساسية والموقع</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dialect_content')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dialect_content'
                ? 'border-primary text-primary'
                : 'border-transparent text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>2. الحكاية بالعامية والطقوس والنفحات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'media'
                ? 'border-primary text-primary'
                : 'border-transparent text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>3. الصور والفيديوهات</span>
            {(videoUrl || gallery.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-primary text-primary'
                : 'border-transparent text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>4. معاينة فورية</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-black/80 dark:text-white/80">
                    اسم الاحتفال أو المولد أو الموسم *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: ليلة القنائي الكبيرة - مولد سيدي عبد الرحيم القنائي"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black/80 dark:text-white/80">المحافظة *</label>
                  <select
                    value={governorateName}
                    onChange={(e) => setGovernorateName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {UPPER_EGYPT_GOVERNORATES.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black/80 dark:text-white/80">نوع الاحتفال *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black/80 dark:text-white/80">المدينة أو المركز</label>
                  <input
                    type="text"
                    placeholder="مثال: مدينة قنا، طهطا، إسنا، نجع حمادي"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black/80 dark:text-white/80">
                    ميدان وساحة الاحتفال الدقيقة
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: ساحة ومسجد سيدي عبد الرحيم القنائي، ميدان المرماح"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black/80 dark:text-white/80">
                    موعد وتاريخ الليلة الكبيرة
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: النصف من شعبان سنوياً، أو 15 طوبة"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black/80 dark:text-white/80">التوقيت اليومي</label>
                  <input
                    type="text"
                    placeholder="مثال: من بعد العصر حتى آذان الفجر"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black/80 dark:text-white/80">الفصل والموسم التراثي</label>
                  <input
                    type="text"
                    placeholder="مثال: موسم كسر القصب في الشتاء، مقدمات شهر رمضان"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black/80 dark:text-white/80">جهة التوثيق والمصدر</label>
                  <input
                    type="text"
                    placeholder="مثال: أطلس المأثورات الشعبية، وزارة الثقافة المصرية"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black/80 dark:text-white/80">خط العرض (Latitude)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="مثال: 26.1551"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black/80 dark:text-white/80">خط الطول (Longitude)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="مثال: 32.716"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DIALECT CONTENT, TRADITIONS & NAFHA */}
          {activeTab === 'dialect_content' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>نصيحة الصياغة بالعامية المصرية الصعيدية:</strong> اكتب تفاصيل الليلة بروح أهل البلد وطريقتهم في السرد (مثال: «أكبر لمة وفرحة في الصعيد، البيوت بتفتح بيبانها، وقدور الفول النابت بتستوي في الحارات، والشوربة بالليمون والكمون بتنزل نفحة لله»).
                </p>
              </div>

              {/* Description in dialect */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black/80 dark:text-white/80">
                  حكاية الليلة والموسم بالعامية المصرية الأصيلة *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="احكي حكاية المولد بالعامية، مين صاحب الليلة؟ وإيه اللي بيحصل فيها وليه الناس بتجيله من كل أنحاء مصر؟"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Historical traditions narrative */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black/80 dark:text-white/80">
                  السياق التاريخي والتقاليد الشعبية المرتبطة بالاحتفال
                </label>
                <textarea
                  rows={4}
                  placeholder="التفاصيل التاريخية: أصل العادة، متى بدأت زفة المحمل، سباق المرماح وعادات شيوخ القبائل عبر القرون..."
                  value={traditions}
                  onChange={(e) => setTraditions(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Rituals list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black/80 dark:text-white/80">
                    قائمة طقوس الليلة الصعيدية (سطر لكل طقس)
                  </label>
                </div>
                <textarea
                  rows={3}
                  placeholder="مثال:&#10;مرماح الخيل الصعيدي واستعراضات الفروسية&#10;زفة المحمل والجمال المزركشة&#10;حلقات الذكر والإنشاد الديني"
                  value={ritualsText}
                  onChange={(e) => setRitualsText(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
                {/* Dialect suggestions */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-black/50 dark:text-white/50 font-bold self-center">
                    مقترحات سريعة:
                  </span>
                  {DIALECT_RITUAL_SUGGESTIONS.slice(0, 4).map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => addRitualSuggestion(sug)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-black/5 dark:bg-cream/10 hover:bg-primary/20 hover:text-primary transition-all cursor-pointer"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Famous Foods / Nafha */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-black/80 dark:text-white/80">
                  أكلات ومشروبات النفحة والضيافة (سطر لكل صنف)
                </label>
                <textarea
                  rows={3}
                  placeholder="مثال:&#10;الفول النابت الصعيدي بالليمون والكمون&#10;شربات الورد بالموز المثلج&#10;الكسكسي المسقي بشوربة اللحم"
                  value={famousFoodsText}
                  onChange={(e) => setFamousFoodsText(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
                {/* Food suggestions */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-black/50 dark:text-white/50 font-bold self-center">
                    أشهر أكلات النفحة:
                  </span>
                  {DIALECT_FOOD_SUGGESTIONS.map((food, fIdx) => (
                    <button
                      key={fIdx}
                      type="button"
                      onClick={() => addFoodSuggestion(food)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/20 transition-all cursor-pointer"
                    >
                      + {food}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black/80 dark:text-white/80">
                  الأنشطة والفعاليات الحية (سطر لكل نشاط)
                </label>
                <textarea
                  rows={2}
                  placeholder="حلقات التحطيب التراثي بالعصا&#10;شراء الهدايا والطرابيش الشعبية وعرائس المولد"
                  value={activitiesText}
                  onChange={(e) => setActivitiesText(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA (PHOTOS & VIDEOS) */}
          {activeTab === 'media' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Cover Image */}
              <div className="space-y-3 bg-black/[0.02] dark:bg-white/[0.02] p-5 rounded-3xl border border-black/10 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black/80 dark:text-white/80 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <span>صورة الغلاف الرئيسية للاحتفال *</span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    placeholder="ضع رابط صورة الغلاف عالية الدقة..."
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary text-left"
                    dir="ltr"
                  />
                  <AdminMediaUploader
                    entityType="cultural-event"
                    entitySlug={event?.slug || title || 'event-cover'}
                    entityId={event?.id}
                    entityTitle={title}
                    governorateName={governorateName}
                    value={coverImage}
                    onChange={(val: any) => {
                      if (typeof val === 'string') setCoverImage(val);
                      else if (val?.secureUrl || val?.url) setCoverImage(val.secureUrl || val.url);
                    }}
                    label="رفع صورة غلاف جديدة من جهازك"
                  />
                </div>

                {/* Cover preview */}
                {coverImage && (
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/10">
                    <img src={coverImage} alt="معاينة الغلاف" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-[10px] font-bold">
                      معاينة الغلاف الحالي
                    </span>
                  </div>
                )}
              </div>

              {/* Main Video URL */}
              <div className="space-y-3 bg-black/[0.02] dark:bg-white/[0.02] p-5 rounded-3xl border border-black/10 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black/80 dark:text-white/80 flex items-center gap-2">
                    <Video className="w-4 h-4 text-rose-500" />
                    <span>رابط الفيديو الرئيسي لليلة (YouTube, MP4, Vimeo, Reels)</span>
                  </label>
                  {videoUrl && (
                    <button
                      type="button"
                      onClick={() => setVideoUrl('')}
                      className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer"
                    >
                      إزالة الفيديو
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <input
                    type="url"
                    placeholder="مثال: https://www.youtube.com/watch?v=... أو رابط MP4 مباشر"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary text-left"
                    dir="ltr"
                  />
                  <AdminMediaUploader
                    entityType="cultural-event"
                    entitySlug={event?.slug || title || 'event-video'}
                    entityId={event?.id}
                    entityTitle={title}
                    governorateName={governorateName}
                    mediaCategory="video"
                    multiple={false}
                    value={videoUrl ? [videoUrl] : []}
                    onChange={(uploaded: any) => {
                      let vUrl = '';
                      if (Array.isArray(uploaded) && uploaded.length > 0) {
                        const item = uploaded[0];
                        vUrl = typeof item === 'string' ? item : (item?.secureUrl || item?.url || '');
                      } else if (typeof uploaded === 'string') {
                        vUrl = uploaded;
                      } else if (uploaded && typeof uploaded === 'object') {
                        vUrl = uploaded.secureUrl || uploaded.url || '';
                      }
                      if (vUrl) setVideoUrl(vUrl);
                    }}
                    label="رفع فيديو للمنصة (MP4 / Cloudinary)"
                  />
                </div>

                {/* Video Preview Player */}
                {videoUrl && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-black/60 dark:text-white/60">
                      معاينة مشغل الفيديو:
                    </span>
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-black/10 dark:border-white/10">
                      {primaryVideoEmbed ? (
                        <iframe
                          src={primaryVideoEmbed}
                          title="معاينة فيديو الليلة"
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : isVideoUrl(videoUrl) || videoUrl.endsWith('.mp4') ? (
                        <video
                          src={getOptimizedVideoUrl(videoUrl)}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-white/70 space-y-2 p-4 text-center">
                          <Film className="w-8 h-8 text-rose-400" />
                          <p className="text-xs">رابط خارجي للفيديو:</p>
                          <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-amber-300 underline font-mono break-all line-clamp-1"
                          >
                            {videoUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Videos List */}
              <div className="space-y-3 bg-black/[0.02] dark:bg-white/[0.02] p-5 rounded-3xl border border-black/10 dark:border-white/10">
                <label className="text-xs font-bold text-black/80 dark:text-white/80 flex items-center gap-2">
                  <Film className="w-4 h-4 text-primary" />
                  <span>فيديوهات ومقاطع إضافية (مرماح، مداحين، زفة المحمل)</span>
                </label>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="رابط فيديو إضافي (YouTube / MP4)..."
                    value={newVideoInput}
                    onChange={(e) => setNewVideoInput(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-xs text-left"
                    dir="ltr"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddVideo();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddVideo}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer"
                  >
                    إضافة
                  </button>
                </div>

                {additionalVideos.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {additionalVideos.map((vid, vIdx) => (
                      <div
                        key={vIdx}
                        className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-espresso-900 border border-black/10 dark:border-white/10 text-xs"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Film className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="font-mono text-[11px] truncate text-left" dir="ltr">
                            {vid}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(vIdx)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Photo Gallery */}
              <div className="space-y-3 bg-black/[0.02] dark:bg-white/[0.02] p-5 rounded-3xl border border-black/10 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black/80 dark:text-white/80 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                    <span>معرض صور الاحتفال والميدان ({gallery.length} صور)</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="رابط صورة جديدة للمعرض..."
                      value={newGalleryImageInput}
                      onChange={(e) => setNewGalleryImageInput(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl bg-black/5 dark:bg-cream/5 border border-black/10 dark:border-white/10 text-xs text-left"
                      dir="ltr"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddGalleryImage();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryImage}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                    >
                      إضافة بالرابط
                    </button>
                  </div>

                  <AdminMediaUploader
                    entityType="cultural-event"
                    entitySlug={event?.slug || title || 'event-gallery'}
                    entityId={event?.id}
                    entityTitle={title}
                    governorateName={governorateName}
                    mediaCategory="image"
                    multiple={true}
                    value={gallery}
                    onChange={(uploaded: any) => {
                      if (Array.isArray(uploaded)) {
                        const urls = uploaded
                          .map((u: any) => (typeof u === 'string' ? u : u?.secureUrl || u?.url || ''))
                          .filter(Boolean);
                        setGallery(urls);
                      } else if (typeof uploaded === 'string' && uploaded) {
                        setGallery((prev) => [...prev, uploaded]);
                      }
                    }}
                    label="رفع صور متعددة لمعرض الاحتفال"
                  />
                </div>

                {/* Gallery thumbnails */}
                {gallery.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-2">
                    {gallery.map((img, iIdx) => (
                      <div
                        key={iIdx}
                        className="group relative h-20 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/10"
                      >
                        <img src={img} alt={`صورة ${iIdx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(iIdx)}
                          className="absolute top-1 left-1 p-1 rounded-md bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="حذف الصورة"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LIVE PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-espresso-900 shadow-xl">
                {/* Hero preview */}
                <div className="relative h-64 bg-black/20">
                  <img
                    src={coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200'}
                    alt="معاينة"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-6 right-6 left-6 text-cream space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-primary font-bold">
                        {governorateName}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-black/60 font-bold">
                        {eventDate || 'موسم سنوي'}
                      </span>
                      {videoUrl && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-600 font-bold flex items-center gap-1">
                          <Film className="w-3 h-3" />
                          <span>فيديو متاح</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-serif font-black">{title || 'عنوان الاحتفال'}</h3>
                    <p className="text-xs text-cream/80 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-300" />
                      <span>{locationName || cityName || governorateName}</span>
                    </p>
                  </div>
                </div>

                {/* Body preview */}
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-black/50 dark:text-white/50 mb-1">
                      الحكاية بالعامية:
                    </h4>
                    <p className="text-sm leading-relaxed text-black/80 dark:text-cream/90">
                      {description || 'لم يتم كتابة وصف بعد.'}
                    </p>
                  </div>

                  {ritualsText && (
                    <div>
                      <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>طقوس الليلة:</span>
                      </h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-black/70 dark:text-white/70">
                        {ritualsText
                          .split('\n')
                          .filter(Boolean)
                          .map((r, idx) => (
                            <li key={idx}>{r}</li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {famousFoodsText && (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs">
                      <strong className="text-emerald-800 dark:text-emerald-300 flex items-center gap-1 mb-1">
                        <Utensils className="w-3.5 h-3.5" />
                        <span>أكلات النفحة:</span>
                      </strong>
                      <p className="text-emerald-900 dark:text-emerald-200">
                        {famousFoodsText.split('\n').filter(Boolean).join(' • ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-black/10 dark:border-white/10 text-xs font-bold hover:bg-black/5 dark:hover:bg-cream/10 cursor-pointer"
            >
              إلغاء
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== 'basic' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'preview') setActiveTab('media');
                    else if (activeTab === 'media') setActiveTab('dialect_content');
                    else if (activeTab === 'dialect_content') setActiveTab('basic');
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-cream/10 text-xs font-bold hover:bg-black/10 cursor-pointer"
                >
                  السابق
                </button>
              )}

              {activeTab !== 'preview' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'basic') setActiveTab('dialect_content');
                    else if (activeTab === 'dialect_content') setActiveTab('media');
                    else if (activeTab === 'media') setActiveTab('preview');
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-black/10 dark:bg-cream/15 text-xs font-bold hover:bg-black/20 cursor-pointer"
                >
                  التالي
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
              >
                <Save className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                <span>{isSubmitting ? 'جاري الحفظ في الداتابيز...' : 'حفظ وتثبيت في قاعدة البيانات'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
