import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import {
  WahGovernorate,
  HeritagePlace,
  CulturalCraft,
  WahStory,
  LocalPerson,
  UpperEgyptFood,
  CulturalEvent,
  CityDoc,
  VillageDoc,
  CulturalTraditionDoc,
  PlatformSettingsDoc,
  VerificationStatus
} from '../../types';
import {
  Landmark,
  Hammer,
  BookOpen,
  Users,
  Utensils,
  Calendar,
  MapPin,
  Compass,
  Plus,
  Save,
  Trash2,
  Edit,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Archive,
  Search,
  SlidersHorizontal,
  ArrowLeft,
  RefreshCw,
  Eye,
  Settings,
  X,
  FileText
} from 'lucide-react';

type EntityTab =
  | 'governorates'
  | 'cities'
  | 'villages'
  | 'places'
  | 'crafts'
  | 'traditions'
  | 'stories'
  | 'people'
  | 'food'
  | 'events'
  | 'settings';

export const CulturalCmsAdminPage: React.FC = () => {
  const { setActivePage, addToast, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<EntityTab>('governorates');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Entities state
  const [governorates, setGovernorates] = useState<WahGovernorate[]>([]);
  const [cities, setCities] = useState<CityDoc[]>([]);
  const [villages, setVillages] = useState<VillageDoc[]>([]);
  const [places, setPlaces] = useState<HeritagePlace[]>([]);
  const [crafts, setCrafts] = useState<CulturalCraft[]>([]);
  const [traditions, setTraditions] = useState<CulturalTraditionDoc[]>([]);
  const [stories, setStories] = useState<WahStory[]>([]);
  const [people, setPeople] = useState<LocalPerson[]>([]);
  const [foods, setFoods] = useState<UpperEgyptFood[]>([]);
  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettingsDoc | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Safe Deletion State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    item: any;
    entityType: string;
    dependencies?: Record<string, number>;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const authUser = { id: currentUser?.id, role: currentUser?.role || 'admin' };

  // Fetch data on tab change
  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'governorates') {
        const data = await wahApi.getGovernorates();
        setGovernorates(data);
      } else if (activeTab === 'cities') {
        const data = await wahApi.getCities();
        setCities(data);
      } else if (activeTab === 'villages') {
        const data = await wahApi.getVillages();
        setVillages(data);
      } else if (activeTab === 'places') {
        const data = await wahApi.getPlaces();
        setPlaces(data);
      } else if (activeTab === 'crafts') {
        const data = await wahApi.getCrafts();
        setCrafts(data);
      } else if (activeTab === 'traditions') {
        const data = await wahApi.getTraditions();
        setTraditions(data);
      } else if (activeTab === 'stories') {
        const data = await wahApi.getStories();
        setStories(data);
      } else if (activeTab === 'people') {
        const data = await wahApi.getPeople();
        setPeople(data);
      } else if (activeTab === 'food') {
        const data = await wahApi.getFood();
        setFoods(data);
      } else if (activeTab === 'events') {
        const data = await wahApi.getEvents();
        setEvents(data);
      } else if (activeTab === 'settings') {
        const data = await wahApi.getPlatformSettings();
        setPlatformSettings(data);
      }
    } catch (err: any) {
      addToast('خطأ في الاتصال', err.message || 'فشل تحميل البيانات من قاعدة البيانات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Auth Guard
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] flex items-center justify-center p-6 text-center">
        <div className="bg-white dark:bg-[#1E1917] p-8 rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] max-w-md shadow-xl">
          <Shield className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#29221D] dark:text-[#FAF6F2] mb-2">منطقة إدارية مقيدة</h2>
          <p className="text-xs text-[#7A6F64] dark:text-[#9C8F82] mb-6">
            لوحة التوثيق التراثي والتحكم بموسوعة وه مخصصة لحسابات الإدارة العليا فقط.
          </p>
          <button
            onClick={() => setActivePage('home')}
            className="px-6 py-2.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white rounded-xl text-xs font-bold transition-all"
          >
            العودة إلى الصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  // Handle Moderation Status Update
  const handleStatusChange = async (entityType: string, id: string, newStatus: string) => {
    try {
      await wahApi.updateModerationStatus(entityType, id, newStatus, undefined, authUser);
      addToast('تم تحديث الحالة', `تم تعديل حالة الاعتماد إلى ${newStatus}`, 'success');
      loadData();
    } catch (err: any) {
      addToast('فشل التحديث', err.message || 'تعذر تغيير حالة الاعتماد', 'error');
    }
  };

  // Handle Safe Deletion Check
  const initiateDelete = async (item: any, entityType: string) => {
    // Perform preliminary check for governorate or craft
    if (entityType === 'governorates') {
      try {
        // Dry-run delete to see if dependencies exist
        await wahApi.deleteGovernorate(item.id, { force: false, archive: false }, authUser);
        addToast('تم الحذف', `تم حذف المحافظة "${item.name}" بنجاح`, 'success');
        loadData();
      } catch (err: any) {
        if (err.message && err.message.includes('لا يمكن حذف المحافظة لوجود ارتباطات')) {
          setDeleteConfirmation({
            isOpen: true,
            item,
            entityType,
            dependencies: { 'الارتباطات الحالية': 1 }
          });
        } else {
          addToast('تنبيه', err.message, 'warning');
        }
      }
    } else if (entityType === 'cities') {
      try {
        await wahApi.deleteCity(item.id, authUser);
        addToast('تم الحذف', `تم حذف مدينة "${item.name}"`, 'success');
        loadData();
      } catch (err: any) {
        addToast('تعذر الحذف', err.message, 'warning');
      }
    } else if (entityType === 'villages') {
      if (confirm(`هل أنت متأكد من حذف قرية "${item.name}" نهائياً من قاعدة البيانات؟`)) {
        try {
          await wahApi.deleteVillage(item.id, authUser);
          addToast('تم الحذف', `تم حذف قرية "${item.name}"`, 'success');
          loadData();
        } catch (err: any) {
          addToast('تعذر الحذف', err.message, 'error');
        }
      }
    } else if (entityType === 'places') {
      if (confirm(`هل أنت متأكد من حذف المعلم "${item.title}"؟`)) {
        try {
          await wahApi.deletePlace(item.id, authUser);
          addToast('تم الحذف', 'تم حذف المعلم التراثي بنجاح', 'success');
          loadData();
        } catch (err: any) {
          addToast('تعذر الحذف', err.message, 'error');
        }
      }
    } else if (entityType === 'crafts') {
      if (confirm(`هل أنت متأكد من حذف حرفة "${item.title}"؟`)) {
        try {
          await wahApi.deleteCraft(item.id, { force: false }, authUser);
          addToast('تم الحذف', 'تم حذف الحرفة بنجاح', 'success');
          loadData();
        } catch (err: any) {
          addToast('تعذر الحذف', err.message, 'warning');
        }
      }
    } else if (entityType === 'traditions') {
      if (confirm(`هل أنت متأكد من حذف التقليد "${item.title}"؟`)) {
        try {
          await wahApi.deleteTradition(item.id, authUser);
          addToast('تم الحذف', 'تم حذف التقليد التراثي بنجاح', 'success');
          loadData();
        } catch (err: any) {
          addToast('تعذر الحذف', err.message, 'error');
        }
      }
    } else if (entityType === 'stories') {
      if (confirm(`هل أنت متأكد من حذف قصة "${item.title}"؟`)) {
        try {
          await wahApi.deleteStory(item.id, authUser);
          addToast('تم الحذف', 'تم حذف القصة بنجاح', 'success');
          loadData();
        } catch (err: any) {
          addToast('تعذر الحذف', err.message, 'error');
        }
      }
    } else if (entityType === 'people') {
      if (confirm(`هل أنت متأكد من حذف شخصية "${item.name}"؟`)) {
        try {
          await wahApi.deletePerson(item.id, authUser);
          addToast('تم الحذف', 'تم حذف بيانات الشخصية بنجاح', 'success');
          loadData();
        } catch (err: any) {
          addToast('تعذر الحذف', err.message, 'error');
        }
      }
    } else if (entityType === 'food') {
      if (confirm(`هل أنت متأكد من حذف وصفة "${item.title}"؟`)) {
        try {
          await wahApi.deleteFood(item.id, authUser);
          addToast('تم الحذف', 'تم حذف الوصفة بنجاح', 'success');
          loadData();
        } catch (err: any) {
          addToast('تعذر الحذف', err.message, 'error');
        }
      }
    } else if (entityType === 'events') {
      if (confirm(`هل أنت متأكد من حذف فعالية "${item.title}"؟`)) {
        try {
          await wahApi.deleteEvent(item.id, authUser);
          addToast('تم الحذف', 'تم حذف الفعالية بنجاح', 'success');
          loadData();
        } catch (err: any) {
          addToast('تعذر الحذف', err.message, 'error');
        }
      }
    }
  };

  // Confirm Archival instead of Hard Delete
  const handleArchiveGovernorate = async () => {
    if (!deleteConfirmation) return;
    setIsDeleting(true);
    try {
      await wahApi.deleteGovernorate(deleteConfirmation.item.id, { archive: true }, authUser);
      addToast('تمت الأرشفة', `تمت أرشفة محافظة "${deleteConfirmation.item.name}" وإخفاؤها من العرض العام دون كسر الارتباطات`, 'success');
      setDeleteConfirmation(null);
      loadData();
    } catch (err: any) {
      addToast('خطأ', err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Render Status Badge
  const renderStatusBadge = (status: VerificationStatus | string | undefined) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-md text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>معتمد ومنشور</span>
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-md text-[11px] font-bold">
            <Clock className="w-3 h-3" />
            <span>قيد المراجعة</span>
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-md text-[11px] font-bold">
            <Archive className="w-3 h-3" />
            <span>مؤرشف</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 px-2 py-0.5 rounded-md text-[11px] font-bold">
            <AlertCircle className="w-3 h-3" />
            <span>مرفوض</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 px-2 py-0.5 rounded-md text-[11px] font-bold">
            <span>مسودة</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] text-[#29221D] dark:text-[#FAF6F2] py-6 sm:py-10 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#7A6F64] dark:text-[#9C8F82]">
            <button onClick={() => setActivePage('admin-dashboard')} className="hover:text-[#B45F42] transition-colors">
              لوحة الإدارة المركزية
            </button>
            <span>/</span>
            <span className="text-[#B45F42] font-bold">إدارة موسوعة وه والمحتوى التراثي</span>
          </div>

          <button
            onClick={() => setActivePage('admin-dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E1D9] dark:border-[#382E27] text-xs font-bold hover:bg-white dark:hover:bg-[#1E1917]"
          >
            <span>العودة للمتجر</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Header Title */}
        <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] dark:border-[#382E27] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2 border border-amber-300 dark:border-amber-800/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>نظام إدارة التراث الرقمي — وه</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black font-serif">
              الموسوعة التراثية وإدارة المحافظات
            </h1>
            <p className="text-xs sm:text-sm text-[#665A4F] dark:text-[#A89C90] mt-1">
              إدارة بيانات المحافظات، المدن، القرى، المعالم، الحرف، المرويات، شيوخ الصنعة، الأكلات، والفعاليات مع تدقيق الأمان وقاعدة بيانات MongoDB دائمة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#25201D] text-[#29221D] dark:text-[#FAF6F2] border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] text-xs font-bold transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>تحديث البيانات</span>
            </button>

            {activeTab !== 'settings' && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B45F42] hover:bg-[#9E4F36] text-white text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة عنصر جديد</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-[#E8E1D9] dark:border-[#382E27]">
          {[
            { id: 'governorates', label: 'المحافظات', icon: Landmark, count: governorates.length },
            { id: 'cities', label: 'المدن والمراكز', icon: MapPin, count: cities.length },
            { id: 'villages', label: 'القرى والنجوع', icon: Compass, count: villages.length },
            { id: 'places', label: 'المعالم التراثية', icon: Landmark, count: places.length },
            { id: 'crafts', label: 'الحرف والورش', icon: Hammer, count: crafts.length },
            { id: 'traditions', label: 'العادات والتقاليد', icon: Sparkles, count: traditions.length },
            { id: 'stories', label: 'الحكايات والمرويات', icon: BookOpen, count: stories.length },
            { id: 'people', label: 'شيوخ الصنعة والرموز', icon: Users, count: people.length },
            { id: 'food', label: 'المطبخ التراثي', icon: Utensils, count: foods.length },
            { id: 'events', label: 'المواسم والفعاليات', icon: Calendar, count: events.length },
            { id: 'settings', label: 'إعدادات المنصة', icon: Settings, count: 0 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as EntityTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#B45F42] text-white shadow-xs'
                    : 'bg-white dark:bg-[#1E1917] text-[#665A4F] dark:text-[#A89C90] border border-[#E8E1D9] dark:border-[#382E27] hover:bg-[#FAF6F0]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.id !== 'settings' && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#FAF6F0] dark:bg-[#25201D] text-[#7A6F64]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content View Based on Active Tab */}
        {activeTab === 'governorates' && (
          <div className="space-y-4">
            {governorates.length === 0 && !isLoading ? (
              <div className="text-center py-16 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
                <Landmark className="w-12 h-12 text-[#7A6F64] mx-auto mb-3" />
                <h3 className="text-base font-bold">لا توجد محافظات مسجلة حالياً</h3>
                <p className="text-xs text-[#7A6F64] mt-1">اضغط على زر "إضافة عنصر جديد" لتوثيق محافظة جديدة.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {governorates.map((gov) => (
                  <div
                    key={gov.id}
                    className="bg-white dark:bg-[#1E1917] rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={gov.coverImage || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=200'}
                            alt={gov.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#E8E1D9]"
                          />
                          <div>
                            <h3 className="text-base font-bold">محافظة {gov.name}</h3>
                            <span className="text-xs text-[#7A6F64]">العاصمة: {gov.capitalCity || gov.name}</span>
                          </div>
                        </div>
                        {renderStatusBadge(gov.status)}
                      </div>
                      <p className="text-xs text-[#665A4F] dark:text-[#A89C90] line-clamp-2 mb-3">
                        {gov.shortIntro}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {gov.famousFor?.map((f, i) => (
                          <span key={i} className="text-[10px] bg-[#FAF6F0] dark:bg-[#25201D] px-2 py-0.5 rounded-md text-[#7A6F64]">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingItem(gov);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-[#E8E1D9] dark:border-[#382E27] text-xs font-bold hover:bg-[#FAF6F0]"
                          title="تعديل"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => initiateDelete(gov, 'governorates')}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold"
                          title="حذف بأمان"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <select
                        value={gov.status || 'approved'}
                        onChange={(e) => handleStatusChange('governorates', gov.id, e.target.value)}
                        className="text-[11px] bg-[#FAF6F0] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] rounded-lg px-2 py-1 outline-none font-bold"
                      >
                        <option value="approved">معتمد ومنشور</option>
                        <option value="pending_review">قيد المراجعة</option>
                        <option value="draft">مسودة</option>
                        <option value="archived">مؤرشف</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cities Tab */}
        {activeTab === 'cities' && (
          <div className="space-y-4">
            {cities.length === 0 && !isLoading ? (
              <div className="text-center py-16 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
                <MapPin className="w-12 h-12 text-[#7A6F64] mx-auto mb-3" />
                <h3 className="text-base font-bold">لا توجد مدن ومراكز مسجلة حالياً</h3>
                <p className="text-xs text-[#7A6F64] mt-1">أضف مراكز ومدن الصعيد التراثية إلى قاعدة البيانات.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cities.map((c) => (
                  <div key={c.id} className="bg-white dark:bg-[#1E1917] p-5 rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">مدينة / مركز {c.name}</h4>
                      <p className="text-xs text-[#7A6F64]">التابعة لمحافظة {c.governorateName}</p>
                      {c.shortDescription && <p className="text-xs text-[#A89C90] mt-1 line-clamp-1">{c.shortDescription}</p>}
                    </div>
                    <button
                      onClick={() => initiateDelete(c, 'cities')}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Villages Tab */}
        {activeTab === 'villages' && (
          <div className="space-y-4">
            {villages.length === 0 && !isLoading ? (
              <div className="text-center py-16 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
                <Compass className="w-12 h-12 text-[#7A6F64] mx-auto mb-3" />
                <h3 className="text-base font-bold">لا توجد قرى مسجلة حالياً</h3>
                <p className="text-xs text-[#7A6F64] mt-1">ابدأ بتوثيق القرى التراثية وقرى الحرفيين في الصعيد.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {villages.map((v) => (
                  <div key={v.id} className="bg-white dark:bg-[#1E1917] p-5 rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">قرية {v.name}</h4>
                      <p className="text-xs text-[#7A6F64]">{v.cityName ? `مركز ${v.cityName} — ` : ''}محافظة {v.governorateName}</p>
                      {v.traditionalCraftName && (
                        <span className="inline-block mt-1 text-[11px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md font-bold">
                          حرفة: {v.traditionalCraftName}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => initiateDelete(v, 'villages')}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Places Tab */}
        {activeTab === 'places' && (
          <div className="space-y-4">
            {places.length === 0 && !isLoading ? (
              <div className="text-center py-16 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
                <Landmark className="w-12 h-12 text-[#7A6F64] mx-auto mb-3" />
                <h3 className="text-base font-bold">لم تتم إضافة معالم تراثية بعد</h3>
                <p className="text-xs text-[#7A6F64] mt-1">يمكن إضافة وتوثيق المعالم التراثية والآثار من خلال زر الإضافة أعلاه.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {places.map((place) => (
                  <div key={place.id} className="bg-white dark:bg-[#1E1917] rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-[#B45F42]">{place.governorateName}</span>
                        {renderStatusBadge(place.status)}
                      </div>
                      <h4 className="font-bold text-base mb-1">{place.title}</h4>
                      <p className="text-xs text-[#665A4F] dark:text-[#A89C90] line-clamp-2 mb-4">
                        {place.shortDescription || place.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center justify-between">
                      <button
                        onClick={() => initiateDelete(place, 'places')}
                        className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>

                      <select
                        value={place.status || 'approved'}
                        onChange={(e) => handleStatusChange('places', place.id, e.target.value)}
                        className="text-[11px] bg-[#FAF6F0] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] rounded-lg px-2 py-1 font-bold"
                      >
                        <option value="approved">معتمد</option>
                        <option value="pending_review">مراجعة</option>
                        <option value="draft">مسودة</option>
                        <option value="rejected">مرفوض</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Crafts Tab */}
        {activeTab === 'crafts' && (
          <div className="space-y-4">
            {crafts.length === 0 && !isLoading ? (
              <div className="text-center py-16 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
                <Hammer className="w-12 h-12 text-[#7A6F64] mx-auto mb-3" />
                <h3 className="text-base font-bold">لم تتم إضافة حرف تقليدية بعد</h3>
                <p className="text-xs text-[#7A6F64] mt-1">ابدأ بتوثيق حرف الصعيد التراثية وأدواتها ومراحل تصنيعها.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {crafts.map((craft) => (
                  <div key={craft.id} className="bg-white dark:bg-[#1E1917] rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{craft.category || 'حرفة تقليدية'}</span>
                        {renderStatusBadge(craft.status)}
                      </div>
                      <h4 className="font-bold text-base mb-1">{craft.title}</h4>
                      <p className="text-xs text-[#665A4F] dark:text-[#A89C90] line-clamp-2 mb-3">
                        {craft.shortDescription}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center justify-between">
                      <button
                        onClick={() => initiateDelete(craft, 'crafts')}
                        className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>

                      <select
                        value={craft.status || 'approved'}
                        onChange={(e) => handleStatusChange('crafts', craft.id, e.target.value)}
                        className="text-[11px] bg-[#FAF6F0] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] rounded-lg px-2 py-1 font-bold"
                      >
                        <option value="approved">معتمد</option>
                        <option value="pending_review">مراجعة</option>
                        <option value="draft">مسودة</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Traditions Tab */}
        {activeTab === 'traditions' && (
          <div className="space-y-4">
            {traditions.length === 0 && !isLoading ? (
              <div className="text-center py-16 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
                <Sparkles className="w-12 h-12 text-[#7A6F64] mx-auto mb-3" />
                <h3 className="text-base font-bold">لا توجد عادات وتقاليد مسجلة حالياً</h3>
                <p className="text-xs text-[#7A6F64] mt-1">وثّق عادات الكرم، الفنون القولية، ومظاهر الضيافة الصعيدية.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {traditions.map((t) => (
                  <div key={t.id} className="bg-white dark:bg-[#1E1917] rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-[#B45F42]">{t.governorateName}</span>
                        {renderStatusBadge(t.status)}
                      </div>
                      <h4 className="font-bold text-base mb-1">{t.title}</h4>
                      <p className="text-xs text-[#665A4F] dark:text-[#A89C90] line-clamp-3 mb-3">
                        {t.description}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center justify-between">
                      <button
                        onClick={() => initiateDelete(t, 'traditions')}
                        className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                      <select
                        value={t.status || 'approved'}
                        onChange={(e) => handleStatusChange('traditions', t.id, e.target.value)}
                        className="text-[11px] bg-[#FAF6F0] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] rounded-lg px-2 py-1 font-bold"
                      >
                        <option value="approved">معتمد</option>
                        <option value="pending_review">مراجعة</option>
                        <option value="draft">مسودة</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stories Tab */}
        {activeTab === 'stories' && (
          <div className="space-y-4">
            {stories.length === 0 && !isLoading ? (
              <div className="text-center py-16 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
                <BookOpen className="w-12 h-12 text-[#7A6F64] mx-auto mb-3" />
                <h3 className="text-base font-bold">لم تتم إضافة حكايات ومرويات بعد</h3>
                <p className="text-xs text-[#7A6F64] mt-1">ابدأ بتوثيق مرويات الصعيد وأساطير النيل وأسرار الأجداد.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {stories.map((story) => (
                  <div key={story.id} className="bg-white dark:bg-[#1E1917] rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-[#B45F42]">{story.governorateName}</span>
                        {renderStatusBadge(story.status)}
                      </div>
                      <h4 className="font-bold text-base mb-1">{story.title}</h4>
                      <p className="text-xs text-[#665A4F] dark:text-[#A89C90] line-clamp-3 mb-3">
                        {story.excerpt || story.content}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center justify-between">
                      <button
                        onClick={() => initiateDelete(story, 'stories')}
                        className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                      <select
                        value={story.status || 'approved'}
                        onChange={(e) => handleStatusChange('stories', story.id, e.target.value)}
                        className="text-[11px] bg-[#FAF6F0] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] rounded-lg px-2 py-1 font-bold"
                      >
                        <option value="approved">معتمد</option>
                        <option value="pending_review">مراجعة</option>
                        <option value="draft">مسودة</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* People Tab */}
        {activeTab === 'people' && (
          <div className="space-y-4">
            {people.length === 0 && !isLoading ? (
              <div className="text-center py-16 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
                <Users className="w-12 h-12 text-[#7A6F64] mx-auto mb-3" />
                <h3 className="text-base font-bold">لم تتم إضافة شيوخ صنعة أو شخصيات بعد</h3>
                <p className="text-xs text-[#7A6F64] mt-1">وثّق مسيرة وحكايات حراس التراث وشيوخ الصنعة في الصعيد.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {people.map((person) => (
                  <div key={person.id} className="bg-white dark:bg-[#1E1917] rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={person.avatarUrl || person.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'}
                            alt={person.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#E8E1D9]"
                          />
                          <div>
                            <h4 className="font-bold text-sm">{person.name}</h4>
                            <p className="text-xs text-[#B45F42]">{person.titleOrRole || person.craftTitle}</p>
                          </div>
                        </div>
                        {renderStatusBadge(person.status)}
                      </div>
                      <p className="text-xs text-[#665A4F] dark:text-[#A89C90] line-clamp-2 mb-3">
                        {person.biography || person.bio}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center justify-between">
                      <button
                        onClick={() => initiateDelete(person, 'people')}
                        className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                      <select
                        value={person.status || 'approved'}
                        onChange={(e) => handleStatusChange('people', person.id, e.target.value)}
                        className="text-[11px] bg-[#FAF6F0] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] rounded-lg px-2 py-1 font-bold"
                      >
                        <option value="approved">معتمد</option>
                        <option value="pending_review">مراجعة</option>
                        <option value="draft">مسودة</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Food Tab */}
        {activeTab === 'food' && (
          <div className="space-y-4">
            {foods.length === 0 && !isLoading ? (
              <div className="text-center py-16 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
                <Utensils className="w-12 h-12 text-[#7A6F64] mx-auto mb-3" />
                <h3 className="text-base font-bold">لم تتم إضافة أكلات تراثية بعد</h3>
                <p className="text-xs text-[#7A6F64] mt-1">وثّق مخبوزات ووصفات المطبخ الصعيدي الأصيل.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {foods.map((food) => (
                  <div key={food.id} className="bg-white dark:bg-[#1E1917] rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-[#B45F42]">{food.governorateName}</span>
                        {renderStatusBadge(food.status)}
                      </div>
                      <h4 className="font-bold text-base mb-1">{food.title || food.name}</h4>
                      <p className="text-xs text-[#665A4F] dark:text-[#A89C90] line-clamp-2 mb-3">
                        {food.description || food.story}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center justify-between">
                      <button
                        onClick={() => initiateDelete(food, 'food')}
                        className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                      <select
                        value={food.status || 'approved'}
                        onChange={(e) => handleStatusChange('food', food.id, e.target.value)}
                        className="text-[11px] bg-[#FAF6F0] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] rounded-lg px-2 py-1 font-bold"
                      >
                        <option value="approved">معتمد</option>
                        <option value="pending_review">مراجعة</option>
                        <option value="draft">مسودة</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            {events.length === 0 && !isLoading ? (
              <div className="text-center py-16 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
                <Calendar className="w-12 h-12 text-[#7A6F64] mx-auto mb-3" />
                <h3 className="text-base font-bold">لم تتم إضافة فعاليات أو مواسم بعد</h3>
                <p className="text-xs text-[#7A6F64] mt-1">أضف الموالد، المهرجانات، ومعارض الحرف السنوية في الصعيد.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {events.map((ev) => (
                  <div key={ev.id} className="bg-white dark:bg-[#1E1917] rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-[#B45F42]">{ev.governorateName}</span>
                        {renderStatusBadge(ev.status)}
                      </div>
                      <h4 className="font-bold text-base mb-1">{ev.title}</h4>
                      <p className="text-xs text-[#665A4F] dark:text-[#A89C90] line-clamp-2 mb-3">
                        {ev.description}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center justify-between">
                      <button
                        onClick={() => initiateDelete(ev, 'events')}
                        className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                      <select
                        value={ev.status || 'approved'}
                        onChange={(e) => handleStatusChange('events', ev.id, e.target.value)}
                        className="text-[11px] bg-[#FAF6F0] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] rounded-lg px-2 py-1 font-bold"
                      >
                        <option value="approved">معتمد</option>
                        <option value="pending_review">مراجعة</option>
                        <option value="draft">مسودة</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Platform Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] dark:border-[#382E27] shadow-xs">
            <h2 className="text-lg font-bold font-serif mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#B45F42]" />
              <span>إعدادات وهوية المنصة المركزية</span>
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await wahApi.savePlatformSettings(platformSettings, authUser);
                  addToast('تم الحفظ', 'تم تحديث إعدادات المنصة في قاعدة البيانات بنجاح', 'success');
                } catch (err: any) {
                  addToast('خطأ', err.message || 'فشل حفظ الإعدادات', 'error');
                }
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#7A6F64] mb-2">اسم المنصة</label>
                  <input
                    type="text"
                    value={platformSettings?.siteName || 'وه | WAH'}
                    onChange={(e) =>
                      setPlatformSettings((prev: any) => ({ ...prev, siteName: e.target.value }))
                    }
                    className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-[#E8E1D9] dark:border-[#382E27] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#7A6F64] mb-2">الشعار اللفظي (Tagline)</label>
                  <input
                    type="text"
                    value={platformSettings?.siteTagline || 'العالم الرقمي لصعيد مصر'}
                    onChange={(e) =>
                      setPlatformSettings((prev: any) => ({ ...prev, siteTagline: e.target.value }))
                    }
                    className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-[#E8E1D9] dark:border-[#382E27] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#7A6F64] mb-2">البريد الإلكتروني الرسمي</label>
                  <input
                    type="email"
                    value={platformSettings?.contactEmail || 'contact@wah-platform.eg'}
                    onChange={(e) =>
                      setPlatformSettings((prev: any) => ({ ...prev, contactEmail: e.target.value }))
                    }
                    className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-[#E8E1D9] dark:border-[#382E27] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#7A6F64] mb-2">هاتف التواصل وخدمة العملاء</label>
                  <input
                    type="text"
                    value={platformSettings?.contactPhone || '+201000000000'}
                    onChange={(e) =>
                      setPlatformSettings((prev: any) => ({ ...prev, contactPhone: e.target.value }))
                    }
                    className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-[#E8E1D9] dark:border-[#382E27] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#7A6F64] mb-2">سعر الشحن الموحد (ج.م)</label>
                  <input
                    type="number"
                    value={platformSettings?.shippingFlatRate ?? 45}
                    onChange={(e) =>
                      setPlatformSettings((prev: any) => ({
                        ...prev,
                        shippingFlatRate: Number(e.target.value)
                      }))
                    }
                    className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-[#E8E1D9] dark:border-[#382E27] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#7A6F64] mb-2">حد الشحن المجاني (ج.م)</label>
                  <input
                    type="number"
                    value={platformSettings?.freeShippingThreshold ?? 500}
                    onChange={(e) =>
                      setPlatformSettings((prev: any) => ({
                        ...prev,
                        freeShippingThreshold: Number(e.target.value)
                      }))
                    }
                    className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-[#E8E1D9] dark:border-[#382E27] outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#F0EAE1] dark:border-[#2D2622] flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ إعدادات المنصة الدائمة</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Safe Deletion / Archival Confirmation Modal */}
        {deleteConfirmation && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E8E1D9] dark:border-[#382E27] shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold">لا يمكن الحذف المباشر لوجود ارتباطات في المنظومة</h3>
                <p className="text-xs text-[#665A4F] dark:text-[#A89C90] mt-2 leading-relaxed">
                  المحافظة "{deleteConfirmation.item.name}" تحتوي على معالم أو مدن أو حرف مرتبطة بها. لحماية تكامل قاعدة البيانات، يمكنك اختيار <strong>الأرشفة الآمنة</strong> بدلاً من الحذف الجبري.
                </p>
              </div>

              <div className="bg-[#FAF6F0] dark:bg-[#25201D] p-4 rounded-xl border border-[#E8E1D9] dark:border-[#382E27] text-xs space-y-1">
                <div className="font-bold text-[#B45F42]">خيارات الأمان المتاحة:</div>
                <p>1. أرشفة المحافظة: تُخفي المحافظة من الواجهات العامة مع الحفاظ على سلامة الروابط والمنتجات.</p>
                <p>2. إلغاء العملية ومراجعة المدن والورش المرتبطة يدوياً.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 rounded-xl border border-[#E8E1D9] dark:border-[#382E27] text-xs font-bold text-[#7A6F64] hover:bg-[#FAF6F0]"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleArchiveGovernorate}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isDeleting ? 'جاري الأرشفة...' : 'أرشفة المحافظة بأمان (مستحسن)'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Simple Item Creation / Edit Modal */}
        {isModalOpen && (
          <ItemCreationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              setIsModalOpen(false);
              loadData();
            }}
            activeTab={activeTab}
            editingItem={editingItem}
            authUser={authUser}
            governorates={governorates}
            cities={cities}
          />
        )}
      </div>
    </div>
  );
};

interface ItemCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activeTab: EntityTab;
  editingItem: any;
  authUser: { id?: string; role?: string };
  governorates: WahGovernorate[];
  cities: CityDoc[];
}

const ItemCreationModal: React.FC<ItemCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  activeTab,
  editingItem,
  authUser,
  governorates,
  cities
}) => {
  const { addToast } = useApp();
  const [title, setTitle] = useState(editingItem?.title || editingItem?.name || '');
  const [governorateName, setGovernorateName] = useState(editingItem?.governorateName || 'قنا');
  const [cityName, setCityName] = useState(editingItem?.cityName || '');
  const [category, setCategory] = useState(editingItem?.category || '');
  const [description, setDescription] = useState(editingItem?.description || editingItem?.shortIntro || '');
  const [detailedContent, setDetailedContent] = useState(editingItem?.history || editingItem?.biography || editingItem?.content || '');
  const [imageUrl, setImageUrl] = useState(editingItem?.coverImage || editingItem?.avatarUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('بيانات ناقصة', 'يرجى إدخال العنوان أو الاسم الرئيسي', 'warning');
      return;
    }

    setIsSubmitting(true);
    const slug = editingItem?.slug || `${Date.now()}-${title.trim().toLowerCase().replace(/[^\u0621-\u064A\w]+/g, '-')}`;

    try {
      if (activeTab === 'governorates') {
        await wahApi.saveGovernorate({
          id: editingItem?.id,
          name: title.trim(),
          slug,
          capitalCity: cityName.trim() || title.trim(),
          shortIntro: description.trim(),
          history: detailedContent.trim() || description.trim(),
          famousFor: category ? category.split(/[,،]+/).map((s) => s.trim()) : ['تراث عريق'],
          coverImage: imageUrl.trim() || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800',
          gallery: imageUrl.trim() ? [imageUrl.trim()] : [],
          status: 'approved'
        }, authUser);
      } else if (activeTab === 'cities') {
        await wahApi.saveCity({
          id: editingItem?.id,
          name: title.trim(),
          governorateName,
          governorateId: `gov-${governorateName}`,
          shortDescription: description.trim(),
          status: 'approved'
        }, authUser);
      } else if (activeTab === 'villages') {
        await wahApi.saveVillage({
          id: editingItem?.id,
          name: title.trim(),
          cityName: cityName.trim() || undefined,
          governorateName,
          governorateId: `gov-${governorateName}`,
          description: description.trim(),
          status: 'approved'
        }, authUser);
      } else if (activeTab === 'places') {
        await wahApi.savePlace({
          id: editingItem?.id,
          title: title.trim(),
          slug,
          governorateName,
          governorateId: `gov-${governorateName}`,
          category: category || 'heritage_site',
          description: description.trim(),
          history: detailedContent.trim() || description.trim(),
          significance: description.trim(),
          locationName: governorateName,
          coverImage: imageUrl.trim() || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
          gallery: imageUrl.trim() ? [imageUrl.trim()] : [],
          status: 'approved'
        }, authUser);
      } else if (activeTab === 'crafts') {
        await wahApi.saveCraft({
          id: editingItem?.id,
          title: title.trim(),
          slug,
          shortDescription: description.trim(),
          history: detailedContent.trim() || description.trim(),
          governorates: [governorateName],
          materials: ['مواد طبيعية محلية صلبة'],
          tools: ['أدوات يدوية تقليدية متوارثة'],
          manufacturingStages: [
            { stepNumber: 1, title: 'المرحلة التحضيرية', description: detailedContent.trim() || description.trim() }
          ],
          coverImage: imageUrl.trim() || 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800',
          gallery: imageUrl.trim() ? [imageUrl.trim()] : [],
          status: 'approved'
        }, authUser);
      } else if (activeTab === 'traditions') {
        await wahApi.saveTradition({
          id: editingItem?.id,
          title: title.trim(),
          slug,
          governorateName,
          governorateId: `gov-${governorateName}`,
          category: category || 'customs',
          description: description.trim(),
          historicalOrigin: detailedContent.trim() || undefined,
          coverImage: imageUrl.trim() || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
          status: 'approved'
        }, authUser);
      } else if (activeTab === 'stories') {
        await wahApi.saveStory({
          id: editingItem?.id,
          title: title.trim(),
          slug,
          excerpt: description.trim(),
          content: detailedContent.trim() || description.trim(),
          category: 'oral_tradition',
          authorName: 'راوي الصعيد',
          governorateName,
          governorateId: `gov-${governorateName}`,
          coverImage: imageUrl.trim() || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
          readingTimeMinutes: 4,
          status: 'approved'
        }, authUser);
      } else if (activeTab === 'people') {
        await wahApi.savePerson({
          id: editingItem?.id,
          name: title.trim(),
          slug,
          titleOrRole: category || 'شيخ صنعة وحارس تراث',
          craftOrSkill: category || 'حرفي صعيدي تقليدي',
          governorateName,
          governorateId: `gov-${governorateName}`,
          biography: detailedContent.trim() || description.trim(),
          avatarUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
          yearsOfExperience: 25,
          status: 'approved'
        }, authUser);
      } else if (activeTab === 'food') {
        await wahApi.saveFood({
          id: editingItem?.id,
          title: title.trim(),
          slug,
          governorateName,
          governorateId: `gov-${governorateName}`,
          description: description.trim(),
          ingredients: ['مكونات بلدية طازجة من خيرات الصعيد'],
          preparationMethod: detailedContent.trim() || description.trim(),
          originStory: detailedContent.trim() || description.trim(),
          occasionOrTradition: category || 'أكلات يومية ومناسبات',
          coverImage: imageUrl.trim() || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
          status: 'approved'
        }, authUser);
      } else if (activeTab === 'events') {
        await wahApi.saveEvent({
          id: editingItem?.id,
          title: title.trim(),
          slug,
          category: category || 'festival',
          governorateName,
          governorateId: `gov-${governorateName}`,
          locationName: governorateName,
          eventDate: 'موسم سنوي',
          eventTime: '06:00 مساءً',
          description: detailedContent.trim() || description.trim(),
          coverImage: imageUrl.trim() || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
          status: 'approved'
        }, authUser);
      }

      addToast('تم الحفظ بنجاح', `تم حفظ "${title}" في قاعدة البيانات بشكل دائم`, 'success');
      onSuccess();
    } catch (err: any) {
      addToast('فشل الحفظ', err.message || 'حدث خطأ أثناء الحفظ', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#E8E1D9] dark:border-[#382E27] shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1] dark:border-[#2D2622] mb-6">
          <h3 className="text-lg font-bold font-serif flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#B45F42]" />
            <span>{editingItem ? 'تعديل عنصر' : 'إضافة وتوثيق عنصر جديد'}</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[#7A6F64] hover:bg-[#FAF6F0]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#7A6F64] mb-1">الاسم أو العنوان الرئيسي *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: محافظة قنا، معبد دندرة، نول أخميم..."
              className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-[#E8E1D9] dark:border-[#382E27] outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#7A6F64] mb-1">المحافظة</label>
              <select
                value={governorateName}
                onChange={(e) => setGovernorateName(e.target.value)}
                className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-[#E8E1D9] dark:border-[#382E27] outline-none"
              >
                {['قنا', 'الأقصر', 'أسوان', 'سوهاج', 'أسيوط', 'المنيا', 'بني سويف', 'الفيوم', 'الوادي الجديد', 'البحر الأحمر'].map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7A6F64] mb-1">التصنيف أو الكلمات الدلالية</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="مثال: فخار، منسوجات، فرعوني..."
                className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-[#E8E1D9] dark:border-[#382E27] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#7A6F64] mb-1">رابط صورة الغلاف</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-[#E8E1D9] dark:border-[#382E27] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#7A6F64] mb-1">الوصف الموجز والتعريف السريع</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="نبذة مكثفة للعرض في البطاقات..."
              className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-[#E8E1D9] dark:border-[#382E27] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#7A6F64] mb-1">المحتوى التفصيلي والتاريخ</label>
            <textarea
              rows={4}
              value={detailedContent}
              onChange={(e) => setDetailedContent(e.target.value)}
              placeholder="التوثيق الكامل والمروية الشعبية وتاريخ الصنعة..."
              className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-[#E8E1D9] dark:border-[#382E27] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0EAE1] dark:border-[#2D2622]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E8E1D9] dark:border-[#382E27] text-xs font-bold text-[#7A6F64]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-[#B45F42] hover:bg-[#9E4F36] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ في MongoDB'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
