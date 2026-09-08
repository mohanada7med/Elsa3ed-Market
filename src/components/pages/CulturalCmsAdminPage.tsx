import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi, api } from '../../services/api';
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
  PlatformSettingsDoc,
  WahSeason,
  GovernorateDashboardStats,
  VerificationStatus,
  Product
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
  ArrowRight,
  RefreshCw,
  Eye,
  Settings,
  X,
  FileText,
  Share2,
  CheckSquare,
  Square,
  Wheat,
  Video,
  ShoppingBag,
  Map as MapIcon,
  Link as LinkIcon,
  ChevronDown,
  Info,
  ExternalLink,
  Filter,
  Layers,
  SlidersHorizontal,
  ChevronLeft,
  Image as ImageIcon
} from 'lucide-react';
import { AdminMediaUploader } from '../common/AdminMediaUploader';
import { AdminMediaLibraryPage } from '../admin/AdminMediaLibraryPage';
import { i } from 'motion/react-client';

type GovernorateSubTab =
  | 'overview'
  | 'cities_villages'
  | 'places_heritage'
  | 'crafts'
  | 'food'
  | 'people_artisans'
  | 'stories'
  | 'events_seasons'
  | 'reels'
  | 'products'
  | 'map'
  | 'relationships'
  | 'pending_review';

export const CulturalCmsAdminPage: React.FC = () => {
  const { setActivePage, addToast, currentUser, isAuthenticated, currentRole, setIsAuthModalOpen, setAuthModalTab } = useApp();

  const [selectedGovId, setSelectedGovId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<GovernorateSubTab>('overview');

  const [globalGovSearch, setGlobalGovSearch] = useState('');
  const [govStatusFilter, setGovStatusFilter] = useState<string>('all');
  const [internalSearch, setInternalSearch] = useState('');
  const [internalCategoryFilter, setInternalCategoryFilter] = useState('all');

  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const [governorates, setGovernorates] = useState<WahGovernorate[]>([]);
  const [dashboardStats, setDashboardStats] = useState<GovernorateDashboardStats | null>(null);

  const [cities, setCities] = useState<CityDoc[]>([]);
  const [villages, setVillages] = useState<VillageDoc[]>([]);
  const [places, setPlaces] = useState<HeritagePlace[]>([]);
  const [crafts, setCrafts] = useState<CulturalCraft[]>([]);
  const [stories, setStories] = useState<WahStory[]>([]);
  const [people, setPeople] = useState<LocalPerson[]>([]);
  const [foods, setFoods] = useState<UpperEgyptFood[]>([]);
  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [seasons, setSeasons] = useState<WahSeason[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettingsDoc | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionInProgress, setBulkActionInProgress] = useState(false);

  const [isActionCenterOpen, setIsActionCenterOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntityType, setEditingEntityType] = useState<string>('place');
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    item: any;
    entityType: string;
    dependencies?: Record<string, number>;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const authUser = useMemo(() => ({ id: currentUser?.id, role: currentUser?.role || 'admin' }), [currentUser]);

  const activeGov = useMemo(() => {
    if (!selectedGovId) return null;
    return governorates.find((g) => g.id === selectedGovId || g.slug === selectedGovId) || null;
  }, [selectedGovId, governorates]);

  const loadGovernorates = async () => {
    setIsLoading(true);
    try {
      const data = await wahApi.getGovernorates();
      setGovernorates(data);
    } catch (err: any) {
      addToast('خطأ في الاتصال', err.message || 'فشل تحميل بيانات المحافظات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGovernorates();
  }, []);

  const loadGovernorateData = async (govId: string) => {
    setIsStatsLoading(true);
    try {
      const [statsRes, citiesData, villagesData, placesData, craftsData, storiesData, peopleData, foodsData, eventsData, seasonsData] =
        await Promise.all([
          wahApi.getGovernorateDashboard(govId).catch(() => null),
          wahApi.getCities(govId).catch(() => []),
          wahApi.getVillages({ governorateId: govId }).catch(() => []),
          wahApi.getPlaces({ governorateId: govId }).catch(() => []),
          wahApi.getCrafts().catch(() => []),
          wahApi.getStories({ governorateId: govId }).catch(() => []),
          wahApi.getPeople({ governorateId: govId }).catch(() => []),
          wahApi.getFood({ governorateId: govId }).catch(() => []),
          wahApi.getEvents({ governorateId: govId }).catch(() => []),
          wahApi.getSeasons({ governorateId: govId }).catch(() => [])
        ]);

      if (statsRes) setDashboardStats(statsRes);
      setCities(citiesData);
      setVillages(villagesData);
      setPlaces(placesData);
      setStories(storiesData);
      setPeople(peopleData);
      setFoods(foodsData);
      setEvents(eventsData);
      setSeasons(seasonsData);

      const currentGovObj = governorates.find((g) => g.id === govId || g.slug === govId);
      if (currentGovObj) {
        const matchingCrafts = craftsData.filter(
          (c: CulturalCraft) =>
            c.governorates?.includes(currentGovObj.name) ||
            c.governorates?.includes(currentGovObj.id)
        );
        setCrafts(matchingCrafts);

        try {
          const prods = await api.getPublicProducts({ governorate: currentGovObj.name });
          setProducts(prods || []);
        } catch {
          setProducts([]);
        }
      }
    } catch (err: any) {
      addToast('خطأ في تحميل بيانات المحافظة', err.message || 'تعذر جلب سجلات المحافظة الحالية', 'error');
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGovId) {
      setSelectedIds([]);
      setInternalSearch('');
      loadGovernorateData(selectedGovId);
    } else {
      setDashboardStats(null);
    }
  }, [selectedGovId]);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div
        dir="rtl"
        className="
          min-h-[70vh]
          flex items-center justify-center px-5
          bg-[#eee8dc]
          text-[#211d18]
          transition-colors duration-500
          dark:bg-[#0b0b0a]
          dark:text-[#f5f0e7]
        "
      >
        <div className="max-w-md w-full my-16 p-8 bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-2xl text-center space-y-4 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#9a6a35]/10 text-[#9a6a35] flex items-center justify-center mx-auto text-2xl">
            🛡️
          </div>
          <h2 className="text-xl font-bold font-serif">منطقة إدارية مقيدة</h2>
          <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
            نظام إدارة وتوثيق محافظات وه (Governorate CMS) مخصص لصلاحيات الإدارة العليا فقط. يرجى تسجيل الدخول بالحساب الإداري المصرح له.
          </p>
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('login');
              setIsAuthModalOpen(true);
            }}
            className="w-full py-3 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] font-bold rounded-xl shadow-md text-xs transition-all cursor-pointer"
          >
            تسجيل الدخول الإداري
          </button>
        </div>
      </div>
    );
  }

  const handleBulkAction = async (action: 'approve' | 'archive' | 'publish' | 'unpublish' | 'feature' | 'unfeature' | 'reject') => {
    if (selectedIds.length === 0) return;

    let targetEntityType: any = 'places';
    if (activeSubTab === 'places_heritage') targetEntityType = 'places';
    else if (activeSubTab === 'crafts') targetEntityType = 'crafts';
    else if (activeSubTab === 'food') targetEntityType = 'foods';
    else if (activeSubTab === 'people_artisans') targetEntityType = 'people';
    else if (activeSubTab === 'stories') targetEntityType = 'stories';
    else if (activeSubTab === 'events_seasons') targetEntityType = 'events';
    else if (activeSubTab === 'cities_villages') targetEntityType = 'cities';
    else if (activeSubTab === 'products') targetEntityType = 'products';

    let reason = '';
    if (action === 'reject') {
      const input = prompt('يرجى كتابة سبب الرفض لحفظه في سجل التدقيق:');
      if (!input) return;
      reason = input;
    }

    setBulkActionInProgress(true);
    try {
      const res = await wahApi.executeBulkAction(
        {
          entityType: targetEntityType,
          action,
          ids: selectedIds,
          rejectionReason: reason
        },
        authUser
      );

      addToast('نجحت العملية', res.message || `تم تنفيذ الإجراء (${action}) على ${selectedIds.length} عنصر`, 'success');
      setSelectedIds([]);
      if (selectedGovId) loadGovernorateData(selectedGovId);
    } catch (err: any) {
      addToast('فشل الإجراء المجمع', err.message || 'تعذر تنفيذ العملية', 'error');
    } finally {
      setBulkActionInProgress(false);
    }
  };

  const executeSafeDelete = async () => {
    if (!deleteConfirmation) return;
    const { item, entityType } = deleteConfirmation;
    setIsDeleting(true);

    try {
      if (entityType === 'governorates') {
        await wahApi.deleteGovernorate(item.id, { force: false, archive: true }, authUser);
        addToast('تمت الأرشفة', `تم أرشفة المحافظة "${item.name}" بأمان`, 'success');
        loadGovernorates();
      } else if (entityType === 'places') {
        await wahApi.deletePlace(item.id, authUser);
        addToast('تم الحذف', 'تم حذف المعلم التراثي', 'success');
      } else if (entityType === 'crafts') {
        await wahApi.deleteCraft(item.id, { force: true }, authUser);
        addToast('تم الحذف', 'تم حذف الحرفة بنجاح', 'success');
      } else if (entityType === 'stories') {
        await wahApi.deleteStory(item.id, authUser);
        addToast('تم الحذف', 'تم حذف القصة بنجاح', 'success');
      } else if (entityType === 'food') {
        await wahApi.deleteFood(item.id, authUser);
        addToast('تم الحذف', 'تم حذف الوصفة بنجاح', 'success');
      } else if (entityType === 'people') {
        await wahApi.deletePerson(item.id, authUser);
        addToast('تم الحذف', 'تم حذف بيانات الشخصية', 'success');
      } else if (entityType === 'events') {
        await wahApi.deleteEvent(item.id, authUser);
        addToast('تم الحذف', 'تم حذف الفعالية بنجاح', 'success');
      } else if (entityType === 'seasons') {
        await wahApi.deleteSeason(item.id, authUser);
        addToast('تم الحذف', 'تم حذف الموسم بنجاح', 'success');
      } else if (entityType === 'cities') {
        await wahApi.deleteCity(item.id, authUser);
        addToast('تم الحذف', 'تم حذف المدينة بنجاح', 'success');
      } else if (entityType === 'villages') {
        await wahApi.deleteVillage(item.id, authUser);
        addToast('تم الحذف', 'تم حذف القرية بنجاح', 'success');
      }

      setDeleteConfirmation(null);
      if (selectedGovId) loadGovernorateData(selectedGovId);
    } catch (err: any) {
      addToast('خطأ في العملية', err.message || 'فشل حذف السجل', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderStatusBadge = (status?: string, verificationStatus?: string) => {
    if (status === 'approved' || verificationStatus === 'verified') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>معتمد ومنشور</span>
        </span>
      );
    }
    if (status === 'pending_review' || verificationStatus === 'pending_review' || status === 'unverified') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>يحتاج مراجعة</span>
        </span>
      );
    }
    if (status === 'archived') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-black/60 dark:bg-white/5 dark:text-white/60 border border-black/10 dark:border-white/10">
          <Archive className="w-3 h-3" />
          <span>مؤرشف</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-black/60 dark:bg-white/5 dark:text-white/60 border border-black/10 dark:border-white/10">
        <span>مسودة</span>
      </span>
    );
  };

  const filteredGovernorates = useMemo(() => {
    return governorates.filter((gov) => {
      const matchSearch =
        !globalGovSearch.trim() ||
        gov.name.toLowerCase().includes(globalGovSearch.toLowerCase()) ||
        gov.shortIntro?.toLowerCase().includes(globalGovSearch.toLowerCase()) ||
        gov.famousFor?.some((f) => f.toLowerCase().includes(globalGovSearch.toLowerCase()));
      const matchStatus = govStatusFilter === 'all' || gov.status === govStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [governorates, globalGovSearch, govStatusFilter]);

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors duration-500
        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
        max-w-[1600px]
        mx-auto
        px-5
        sm:px-8
        lg:px-12
        py-8
        space-y-8
      "
    >
      {/* ========================================================================= */}
      {/* VIEW 1: GOVERNORATES SELECTION HUB (لوحة محافظات الصعيد الكبرى)          */}
      {/* ========================================================================= */}
      {!selectedGovId && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header banner */}
          <div className="rounded-[2rem] bg-[#211d18] text-white dark:bg-white dark:text-black p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-black/10 dark:border-white/10 backdrop-blur-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#9a6a35] uppercase tracking-wider">
                <Landmark className="w-4 h-4" />
                <span>نظام إدارة التراث والمحتوى الجغرافي | WAH Governorate CMS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-serif">
                لوحة إدارة محافظات وه
              </h1>
              <p className="text-xs sm:text-sm text-white/70 dark:text-black/70 max-w-2xl leading-relaxed">
                نظام إدارة المحتوى الموجه بالمحافظة: اختر أي محافظة من محافظات الصعيد لإدارة جميع المعالم، الحرف، الأكلات، شيوخ الصنعة، القصص، الفعاليات، والمواسم المرتبطة بها في مركز تحكم موحد.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingEntityType('governorate');
                  setEditingItem(null);
                  setIsEditModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-3 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>توثيق محافظة جديدة</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePage('admin-dashboard')}
                className="flex items-center gap-2 px-4 py-3 bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/10 rounded-xl text-xs font-bold transition-all cursor-pointer border border-black/10 dark:border-white/10"
              >
                <span>لوحة المتجر</span>
              </button>
            </div>
          </div>

          {/* Filter and Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/75 dark:bg-[#151513]/90 p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-black/40 dark:text-white/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={globalGovSearch}
                onChange={(e) => setGlobalGovSearch(e.target.value)}
                placeholder="ابحث عن محافظة، معلم، حرفة..."
                className="w-full bg-black/[0.035] dark:bg-white/[0.04] text-xs rounded-xl pr-10 pl-4 py-2.5 border border-black/10 dark:border-white/10 outline-none focus:border-[#9a6a35]"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-black/60 dark:text-white/60 whitespace-nowrap">الحالة:</span>
              <select
                value={govStatusFilter}
                onChange={(e) => setGovStatusFilter(e.target.value)}
                className="bg-black/[0.035] dark:bg-white/[0.04] text-xs rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 outline-none font-bold cursor-pointer"
              >
                <option value="all">كافة المحافظات ({governorates.length})</option>
                <option value="approved">معتمدة ومنشورة</option>
                <option value="pending_review">تحتاج مراجعة</option>
                <option value="archived">مؤرشفة</option>
              </select>

              <button
                type="button"
                onClick={loadGovernorates}
                className="p-2.5 bg-black/[0.035] dark:bg-white/[0.04] hover:bg-black/10 rounded-xl border border-black/10 dark:border-white/10 text-xs text-black/70 dark:text-white/70 cursor-pointer"
                title="تحديث البيانات"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Governorates Cards Grid */}
          {isLoading && governorates.length === 0 ? (
            <div className="text-center py-24 bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
              <RefreshCw className="w-8 h-8 text-[#9a6a35] animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-black/60 dark:text-white/60">جاري جلب بيانات محافظات الصعيد من قاعدة البيانات...</p>
            </div>
          ) : filteredGovernorates.length === 0 ? (
            <div className="text-center py-20 bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
              <Landmark className="w-12 h-12 text-black/40 dark:text-white/40 mx-auto mb-3" />
              <h3 className="text-base font-bold">لا توجد نتائج مطابقة لبحثك</h3>
              <p className="text-xs text-black/60 dark:text-white/60 mt-1">تأكد من كتابة اسم المحافظة بشكل صحيح أو أعد ضبط خيارات التصفية.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredGovernorates.map((gov, index) => (
                <div
                  key={gov.id}
                  className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 overflow-hidden shadow-lg backdrop-blur-xl hover:border-[#9a6a35] transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Card Image Banner */}
                    <div className="relative h-48 w-full overflow-hidden bg-stone-100 dark:bg-stone-900 rounded-t-[2rem]">
                      <img
                        src={gov.coverImage || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800'}
                        alt={gov.name}
                        loading={index < 4 ? 'eager' : 'lazy'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xs text-white border border-white/20">
                          {gov.region || 'صعيد مصر'}
                        </span>
                      </div>
                      <div className="absolute top-3 left-3">{renderStatusBadge(gov.status)}</div>

                      <div className="absolute bottom-3 right-3 left-3 text-white">
                        <h3 className="text-xl font-black font-serif leading-tight">محافظة {gov.name}</h3>
                        <p className="text-xs text-stone-200 line-clamp-1 mt-0.5">{gov.nickname || gov.shortIntro}</p>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-4">
                      <p className="text-xs text-black/60 dark:text-white/60 line-clamp-2 leading-relaxed">
                        {gov.shortIntro || gov.history}
                      </p>

                      {gov.famousFor && gov.famousFor.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {gov.famousFor.slice(0, 3).map((feat, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 border border-black/10 dark:border-white/10"
                            >
                              {feat}
                            </span>
                          ))}
                          {gov.famousFor.length > 3 && (
                            <span className="text-[10px] text-[#9a6a35] font-bold self-center">
                              +{gov.famousFor.length - 3} أخرى
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-5 pt-0 border-t border-black/10 dark:border-white/10 mt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedGovId(gov.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <span>دخول لوحة إدارة {gov.name}</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingEntityType('governorate');
                        setEditingItem(gov);
                        setIsEditModalOpen(true);
                      }}
                      className="p-3 rounded-xl border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold transition-all cursor-pointer"
                      title="تعديل بيانات المحافظة"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: DEDICATED GOVERNORATE CMS (لوحة إدارة المحافظة المحددة)            */}
      {/* ========================================================================= */}
      {selectedGovId && activeGov && (
        <div className="space-y-6 animate-fadeIn">
          {/* Dedicated Top Breadcrumb & Switcher Navigation Bar */}
          <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-5 shadow-lg backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedGovId(null)}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold text-black/70 dark:text-white/70 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>كافة المحافظات</span>
              </button>
              <span className="text-[#9a6a35] font-bold">/</span>
              <span className="text-sm font-black font-serif">لوحة إدارة محافظة {activeGov.name}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-black/60 dark:text-white/60 font-bold hidden sm:inline">تبديل المحافظة:</span>
                <select
                  value={selectedGovId}
                  onChange={(e) => setSelectedGovId(e.target.value)}
                  className="bg-black/[0.035] dark:bg-white/[0.04] text-xs font-bold rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 outline-none cursor-pointer"
                >
                  {governorates.map((g) => (
                    <option key={g.id} value={g.id}>
                      محافظة {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsActionCenterOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة محتوى سريع</span>
              </button>
            </div>
          </div>

          {/* Dedicated Hero Banner for this Governorate */}
          <div className="relative rounded-[2rem] overflow-hidden border border-black/10 dark:border-white/10 bg-black min-h-[160px] flex items-end p-6 sm:p-8 shadow-xl">
            <img
              src={activeGov.coverImage || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1200'}
              alt={activeGov.name}
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-[#9a6a35] text-white font-bold">
                    {activeGov.region || 'صعيد مصر'}
                  </span>
                  {renderStatusBadge(activeGov.status)}
                </div>
                <h2 className="text-2xl sm:text-4xl font-black font-serif text-white">مركز إدارة {activeGov.name}</h2>
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                  {activeGov.shortIntro || activeGov.nickname || 'التوثيق الشامل لكنوز وتراث المحافظة'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingEntityType('governorate');
                    setEditingItem(activeGov);
                    setIsEditModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl text-xs font-bold transition-all border border-white/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>تعديل الملف التعريفي الكامل</span>
                </button>
              </div>
            </div>
          </div>

          {/* LIVE MONGODB STATS BAR (Real Numbers Only) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: 'المعالم التراثية', count: dashboardStats?.heritageSitesCount ?? places.length, icon: Landmark, color: 'text-amber-500' },
              { label: 'الأماكن', count: dashboardStats?.placesCount ?? places.length, icon: MapPin, color: 'text-blue-500' },
              { label: 'الحرف والتراث', count: dashboardStats?.craftsCount ?? crafts.length, icon: Hammer, color: 'text-orange-500' },
              { label: 'أكلات المحافظة', count: dashboardStats?.foodsCount ?? foods.length, icon: Utensils, color: 'text-rose-500' },
              { label: 'شيوخ الصنعة', count: dashboardStats?.peopleCount ?? people.length, icon: Users, color: 'text-indigo-500' },
              { label: 'وه بيحكي', count: dashboardStats?.storiesCount ?? stories.length, icon: BookOpen, color: 'text-emerald-500' },
              { label: 'مواسم وفعاليات', count: (dashboardStats?.eventsCount ?? events.length) + (dashboardStats?.seasonsCount ?? seasons.length), icon: Calendar, color: 'text-teal-500' }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/75 dark:bg-[#151513]/90 p-3.5 rounded-2xl border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-[10px] text-black/40 dark:text-white/40 font-bold">MongoDB</span>
                  </div>
                  <div className="text-xl font-black font-serif">
                    {isStatsLoading ? '...' : stat.count}
                  </div>
                  <div className="text-[11px] font-bold text-black/60 dark:text-white/60 mt-0.5">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Scoped Governorate Category Navigation Tabs */}
          <div className="bg-white/75 dark:bg-[#151513]/90 p-2 rounded-2xl border border-black/10 dark:border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar backdrop-blur-xl">
            {[
              { id: 'overview', label: 'الملف التعريفي', icon: Info },
              { id: 'cities_villages', label: `المدن والقرى (${cities.length + villages.length})`, icon: MapPin },
              { id: 'places_heritage', label: `الأماكن والمعالم (${places.length})`, icon: Landmark },
              { id: 'crafts', label: `الحرف والتراث (${crafts.length})`, icon: Hammer },
              { id: 'food', label: `أكلات المحافظة (${foods.length})`, icon: Utensils },
              { id: 'people_artisans', label: `الناس والحرفيين (${people.length})`, icon: Users },
              { id: 'stories', label: `وه بيحكي (${stories.length})`, icon: BookOpen },
              { id: 'events_seasons', label: `الفعاليات والمواسم (${events.length + seasons.length})`, icon: Calendar },
              { id: 'products', label: `منتجات سوق وه (${products.length})`, icon: ShoppingBag },
              { id: 'map', label: 'خريطة المحافظة', icon: MapIcon },
              { id: 'relationships', label: 'شبكة العلاقات', icon: LinkIcon },
              {
                id: 'pending_review',
                label: `يحتاج مراجعة (${dashboardStats?.pendingReviewCount ?? 0})`,
                icon: AlertCircle,
                badgeColor: 'bg-amber-500 text-white'
              }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveSubTab(tab.id as GovernorateSubTab);
                    setSelectedIds([]);
                    setInternalSearch('');
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
                      : 'text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bulk Actions Floating Bar (Active when items are selected) */}
          {selectedIds.length > 0 && (
            <div className="bg-[#211d18] text-white dark:bg-white dark:text-black p-3 sm:p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-slideUp">
              <div className="flex items-center gap-2 text-xs font-bold">
                <CheckSquare className="w-4 h-4 text-[#9a6a35]" />
                <span>تم تحديد {selectedIds.length} عنصر</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={bulkActionInProgress}
                  onClick={() => handleBulkAction('approve')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  اعتماد ونشر
                </button>
                <button
                  type="button"
                  disabled={bulkActionInProgress}
                  onClick={() => handleBulkAction('archive')}
                  className="px-3.5 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  أرشفة
                </button>
                <button
                  type="button"
                  disabled={bulkActionInProgress}
                  onClick={() => handleBulkAction('feature')}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  تمييز ⭐
                </button>
                <button
                  type="button"
                  disabled={bulkActionInProgress}
                  onClick={() => handleBulkAction('reject')}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  رفض
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="px-3.5 py-2 bg-black/20 dark:bg-black/10 hover:bg-black/30 rounded-xl text-xs font-bold cursor-pointer"
                >
                  إلغاء التحديد
                </button>
              </div>
            </div>
          )}

          {/* Internal Search Bar for active subtab */}
          {activeSubTab !== 'overview' && activeSubTab !== 'map' && activeSubTab !== 'relationships' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/75 dark:bg-[#151513]/90 p-3.5 rounded-2xl border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-black/40 dark:text-white/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={internalSearch}
                  onChange={(e) => setInternalSearch(e.target.value)}
                  placeholder={`البحث داخل محتوى ${activeGov.name}...`}
                  className="w-full bg-black/[0.035] dark:bg-white/[0.04] text-xs rounded-xl pr-10 pl-4 py-2 border border-black/10 dark:border-white/10 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (activeSubTab === 'cities_villages') setEditingEntityType('city');
                    else if (activeSubTab === 'places_heritage') setEditingEntityType('place');
                    else if (activeSubTab === 'crafts') setEditingEntityType('craft');
                    else if (activeSubTab === 'food') setEditingEntityType('food');
                    else if (activeSubTab === 'people_artisans') setEditingEntityType('person');
                    else if (activeSubTab === 'stories') setEditingEntityType('story');
                    else if (activeSubTab === 'events_seasons') setEditingEntityType('event');
                    setEditingItem(null);
                    setIsEditModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة عنصر في هذا القسم</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* SUBTAB 1: OVERVIEW & PROFILE (الملف التعريفي الكامل)      */}
          {/* ======================================================= */}
          {activeSubTab === 'overview' && (
            <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 space-y-6 shadow-lg backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold font-serif">الملف التعريفي الشامل لمحافظة {activeGov.name}</h3>
                  <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">يمكن للإدارة تعديل كافة بيانات المحافظة مباشرة وحفظها في قاعدة البيانات.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingEntityType('governorate');
                    setEditingItem(activeGov);
                    setIsEditModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  <span>تحرير الحقول</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <div>
                    <span className="font-bold text-black/50 dark:text-white/50 block mb-1">الاسم بالعربية:</span>
                    <div className="p-3 bg-black/[0.035] dark:bg-white/[0.04] rounded-xl font-bold">{activeGov.name}</div>
                  </div>
                  <div>
                    <span className="font-bold text-black/50 dark:text-white/50 block mb-1">اللقب الشعبي والتاريخي:</span>
                    <div className="p-3 bg-black/[0.035] dark:bg-white/[0.04] rounded-xl">{activeGov.nickname || 'غير محدد'}</div>
                  </div>
                  <div>
                    <span className="font-bold text-black/50 dark:text-white/50 block mb-1">العاصمة الإقليمية:</span>
                    <div className="p-3 bg-black/[0.035] dark:bg-white/[0.04] rounded-xl font-bold">{activeGov.capitalCity || activeGov.name}</div>
                  </div>
                  <div>
                    <span className="font-bold text-black/50 dark:text-white/50 block mb-1">الإقليم الجغرافي:</span>
                    <div className="p-3 bg-black/[0.035] dark:bg-white/[0.04] rounded-xl">{activeGov.region || 'صعيد مصر'}</div>
                  </div>
                  <div>
                    <span className="font-bold text-black/50 dark:text-white/50 block mb-1">الموقع النيلي:</span>
                    <div className="p-3 bg-black/[0.035] dark:bg-white/[0.04] rounded-xl">{activeGov.nileSegment || 'مجرى النيل الخالد'}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="font-bold text-black/50 dark:text-white/50 block mb-1">المقدمة والنبذة الموجزة:</span>
                    <div className="p-3 bg-black/[0.035] dark:bg-white/[0.04] rounded-xl leading-relaxed">{activeGov.shortIntro}</div>
                  </div>
                  <div>
                    <span className="font-bold text-black/50 dark:text-white/50 block mb-1">العمق التاريخي والتراثي:</span>
                    <div className="p-3 bg-black/[0.035] dark:bg-white/[0.04] rounded-xl leading-relaxed">{activeGov.history}</div>
                  </div>
                  <div>
                    <span className="font-bold text-black/50 dark:text-white/50 block mb-1">أبرز ما تشتهر به المحافظة:</span>
                    <div className="flex flex-wrap gap-1.5 p-3 bg-black/[0.035] dark:bg-white/[0.04] rounded-xl">
                      {activeGov.famousFor?.map((f, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white dark:bg-[#151513] rounded-md font-bold text-[#9a6a35]">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* SUBTAB 2: CITIES & VILLAGES (المدن والقرى)               */}
          {/* ======================================================= */}
          {activeSubTab === 'cities_villages' && (
            <div className="space-y-6">
              {/* Cities Section */}
              <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 shadow-lg backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                  <h3 className="text-base font-bold font-serif flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#9a6a35]" />
                    <span>مدن ومراكز محافظة {activeGov.name} ({cities.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEntityType('city');
                      setEditingItem(null);
                      setIsEditModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 rounded-xl text-xs font-bold text-[#9a6a35] flex items-center gap-1 cursor-pointer border border-black/10 dark:border-white/10"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة مدينة</span>
                  </button>
                </div>

                {cities.length === 0 ? (
                  <p className="text-xs text-black/60 dark:text-white/60 text-center py-6">لم يتم تسجيل مدن تابعة لهذه المحافظة بعد.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cities.map((city) => (
                      <div key={city.id} className="p-4 rounded-2xl bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm">{city.name}</h4>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmation({ isOpen: true, item: city, entityType: 'cities' })}
                            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-black/60 dark:text-white/60 line-clamp-2">{city.shortDescription || 'مركز تراثي وتجاري عريق.'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Villages Section */}
              <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 shadow-lg backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                  <h3 className="text-base font-bold font-serif flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#9a6a35]" />
                    <span>القرى والنجوع التراثية ({villages.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEntityType('village');
                      setEditingItem(null);
                      setIsEditModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 rounded-xl text-xs font-bold text-[#9a6a35] flex items-center gap-1 cursor-pointer border border-black/10 dark:border-white/10"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة قرية</span>
                  </button>
                </div>

                {villages.length === 0 ? (
                  <p className="text-xs text-black/60 dark:text-white/60 text-center py-6">لم يتم تسجيل قرى تراثية لهذه المحافظة بعد.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {villages.map((v) => (
                      <div key={v.id} className="p-4 rounded-2xl bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm">{v.name}</h4>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmation({ isOpen: true, item: v, entityType: 'villages' })}
                            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-black/60 dark:text-white/60 line-clamp-2">{v.description || 'قرية تحتضن موروثاً حرفياً.'}</p>
                        {v.traditionalCraftName && (
                          <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-[#151513] text-[#9a6a35] border border-black/10 dark:border-white/10">
                            الحرفة: {v.traditionalCraftName}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* SUBTAB 3: PLACES & HERITAGE (الأماكن والمعالم التراثية)   */}
          {/* ======================================================= */}
          {activeSubTab === 'places_heritage' && (
            <div className="space-y-4">
              {places.length === 0 ? (
                <div className="text-center py-16 bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
                  <Landmark className="w-12 h-12 text-black/40 dark:text-white/40 mx-auto mb-3" />
                  <h3 className="text-base font-bold">لا توجد معالم أو أماكن موثقة بعد في {activeGov.name}</h3>
                  <p className="text-xs text-black/60 dark:text-white/60 mt-1">استخدم زر "إضافة محتوى سريع" لتوثيق معلم جديد.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {places
                    .filter((p) => !internalSearch || p.title.toLowerCase().includes(internalSearch.toLowerCase()))
                    .map((place) => {
                      const isChecked = selectedIds.includes(place.id);
                      return (
                        <div
                          key={place.id}
                          className={`bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border transition-all p-5 shadow-lg backdrop-blur-xl flex flex-col justify-between ${
                            isChecked ? 'border-[#9a6a35] ring-2 ring-[#9a6a35]/20' : 'border-black/10 dark:border-white/10'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedIds((prev) => [...prev, place.id]);
                                  else setSelectedIds((prev) => prev.filter((id) => id !== place.id));
                                }}
                                className="w-4 h-4 rounded border-black/20 text-[#9a6a35] focus:ring-[#9a6a35] mt-1 cursor-pointer"
                              />
                              <div className="flex items-center gap-3 flex-1">
                                <img
                                  src={place.coverImage || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=200'}
                                  alt={place.title}
                                  className="w-12 h-12 rounded-xl object-cover border border-black/10 dark:border-white/10"
                                />
                                <div>
                                  <h4 className="font-bold text-sm line-clamp-1">{place.title}</h4>
                                  <span className="text-[11px] text-[#9a6a35] font-bold">{place.category}</span>
                                </div>
                              </div>
                              {renderStatusBadge(place.status)}
                            </div>
                            <p className="text-xs text-black/60 dark:text-white/60 line-clamp-2 mb-2 leading-relaxed">
                              {place.description}
                            </p>
                            {place.locationName && (
                              <p className="text-[11px] text-black/50 dark:text-white/50 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#9a6a35]" />
                                <span>{place.locationName}</span>
                              </p>
                            )}
                          </div>

                          <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingEntityType('place');
                                  setEditingItem(place);
                                  setIsEditModalOpen(true);
                                }}
                                className="p-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/5 hover:bg-black/5 text-xs font-bold cursor-pointer"
                                title="تعديل"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmation({ isOpen: true, item: place, entityType: 'places' })}
                                className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold cursor-pointer"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[10px] text-black/40 dark:text-white/40 font-bold">إحداثيات: {place.coordinates ? 'موثقة ✓' : 'غير محددة'}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* SUBTAB 4: CRAFTS (الحرف والتراث)                         */}
          {/* ======================================================= */}
          {activeSubTab === 'crafts' && (
            <div className="space-y-4">
              {crafts.length === 0 ? (
                <div className="text-center py-16 bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
                  <Hammer className="w-12 h-12 text-black/40 dark:text-white/40 mx-auto mb-3" />
                  <h3 className="text-base font-bold">لا توجد حرف موثقة لهذه المحافظة حالياً</h3>
                  <p className="text-xs text-black/60 dark:text-white/60 mt-1">وثّق الحرف التقليدية وأنوال النسيج والفخار والخوص الخاصة بـ {activeGov.name}.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {crafts
                    .filter((c) => !internalSearch || c.title.toLowerCase().includes(internalSearch.toLowerCase()))
                    .map((craft) => (
                      <div key={craft.id} className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-5 shadow-lg backdrop-blur-xl flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={craft.coverImage || 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=200'}
                                alt={craft.title}
                                className="w-12 h-12 rounded-xl object-cover border border-black/10 dark:border-white/10"
                              />
                              <div>
                                <h4 className="font-bold text-sm">{craft.title}</h4>
                                <span className="text-[10px] text-[#9a6a35] font-bold">حرفة أصيلة</span>
                              </div>
                            </div>
                            {renderStatusBadge(craft.status)}
                          </div>
                          <p className="text-xs text-black/60 dark:text-white/60 line-clamp-2 mb-3 leading-relaxed">
                            {craft.shortDescription || craft.history}
                          </p>
                          {craft.materials && (
                            <p className="text-[10px] text-black/50 dark:text-white/50">المواد: {craft.materials.slice(0, 2).join('، ')}</p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingEntityType('craft');
                                setEditingItem(craft);
                                setIsEditModalOpen(true);
                              }}
                              className="p-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/5 hover:bg-black/5 text-xs font-bold cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmation({ isOpen: true, item: craft, entityType: 'crafts' })}
                              className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">مسجلة بالتوثيق</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* SUBTAB 5: FOOD (أكلات وتراث المطبخ)                     */}
          {/* ======================================================= */}
          {activeSubTab === 'food' && (
            <div className="space-y-4">
              {foods.length === 0 ? (
                <div className="text-center py-16 bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
                  <Utensils className="w-12 h-12 text-black/40 dark:text-white/40 mx-auto mb-3" />
                  <h3 className="text-base font-bold">لا توجد أكلات موثقة لـ {activeGov.name} حالياً</h3>
                  <p className="text-xs text-black/60 dark:text-white/60 mt-1">وثّق المخبوزات والوصفات التاريخية المرتبطة بهذه المحافظة.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {foods.map((food) => (
                    <div key={food.id} className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-5 shadow-lg backdrop-blur-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-base">{food.title}</h4>
                          {renderStatusBadge(food.status)}
                        </div>
                        <p className="text-xs text-black/60 dark:text-white/60 line-clamp-2 mb-3 leading-relaxed">
                          {food.description || food.originStory}
                        </p>
                        {food.ingredients && (
                          <p className="text-[10px] text-black/50 dark:text-white/50">المكونات: {food.ingredients.slice(0, 3).join('، ')}</p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between mt-3">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmation({ isOpen: true, item: food, entityType: 'food' })}
                          className="text-xs text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEntityType('food');
                            setEditingItem(food);
                            setIsEditModalOpen(true);
                          }}
                          className="text-xs text-[#9a6a35] hover:underline font-bold cursor-pointer"
                        >
                          تعديل الوصفة
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* SUBTAB 6: PEOPLE & ARTISANS (الناس والحرفيين)             */}
          {/* ======================================================= */}
          {activeSubTab === 'people_artisans' && (
            <div className="space-y-4">
              {people.length === 0 ? (
                <div className="text-center py-16 bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
                  <Users className="w-12 h-12 text-black/40 dark:text-white/40 mx-auto mb-3" />
                  <h3 className="text-base font-bold">لا يوجد شيوخ صنعة أو حرفيين مسجلين حالياً</h3>
                  <p className="text-xs text-black/60 dark:text-white/60 mt-1">وثّق أسماء وخبرات شيوخ الصنعة وحراس التراث في {activeGov.name}.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {people.map((person) => (
                    <div key={person.id} className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-5 shadow-lg backdrop-blur-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={person.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'}
                              alt={person.name}
                              className="w-12 h-12 rounded-xl object-cover border border-black/10 dark:border-white/10"
                            />
                            <div>
                              <h4 className="font-bold text-sm">{person.name}</h4>
                              <p className="text-xs text-[#9a6a35] font-bold">{person.titleOrRole}</p>
                            </div>
                          </div>
                          {renderStatusBadge(person.status)}
                        </div>
                        <p className="text-xs text-black/60 dark:text-white/60 line-clamp-2 mb-2 leading-relaxed">
                          {person.biography}
                        </p>
                        <p className="text-[11px] text-black/50 dark:text-white/50">المهنة / المهارة: {person.craftOrSkill}</p>
                      </div>

                      <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between mt-3">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmation({ isOpen: true, item: person, entityType: 'people' })}
                          className="text-xs text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEntityType('person');
                            setEditingItem(person);
                            setIsEditModalOpen(true);
                          }}
                          className="text-xs text-[#9a6a35] hover:underline font-bold cursor-pointer"
                        >
                          تعديل السيرة
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* SUBTAB 7: WAH STORIES (وه بيحكي)                         */}
          {/* ======================================================= */}
          {activeSubTab === 'stories' && (
            <div className="space-y-4">
              {stories.length === 0 ? (
                <div className="text-center py-16 bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
                  <BookOpen className="w-12 h-12 text-black/40 dark:text-white/40 mx-auto mb-3" />
                  <h3 className="text-base font-bold">لا توجد حكايات موثقة لهذه المحافظة في وه بيحكي</h3>
                  <p className="text-xs text-black/60 dark:text-white/60 mt-1">وثّق المرويات الشفاهية والأساطير الشعبية لـ {activeGov.name}.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {stories.map((story) => (
                    <div key={story.id} className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-5 shadow-lg backdrop-blur-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[11px] font-bold text-[#9a6a35]">وه بيحكي</span>
                          {renderStatusBadge(story.status)}
                        </div>
                        <h4 className="font-bold text-base mb-1">{story.title}</h4>
                        <p className="text-xs text-black/60 dark:text-white/60 line-clamp-3 mb-3 leading-relaxed">
                          {story.excerpt || story.content}
                        </p>
                        <p className="text-[10px] text-black/50 dark:text-white/50">الراوي / الكاتب: {story.authorName} • قراءة {story.readingTimeMinutes || 3} د</p>
                      </div>

                      <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between mt-3">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmation({ isOpen: true, item: story, entityType: 'stories' })}
                          className="text-xs text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEntityType('story');
                            setEditingItem(story);
                            setIsEditModalOpen(true);
                          }}
                          className="text-xs text-[#9a6a35] hover:underline font-bold cursor-pointer"
                        >
                          تعديل الحكاية
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* SUBTAB 8: EVENTS & SEASONS (الفعاليات والمواسم)           */}
          {/* ======================================================= */}
          {activeSubTab === 'events_seasons' && (
            <div className="space-y-6">
              {/* Seasons Section */}
              <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 shadow-lg backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                  <h3 className="text-base font-bold font-serif flex items-center gap-2">
                    <Wheat className="w-4 h-4 text-amber-500" />
                    <span>مواسم الحصاد والتراث التلقائي ({seasons.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEntityType('season');
                      setEditingItem(null);
                      setIsEditModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 rounded-xl text-xs font-bold text-[#9a6a35] flex items-center gap-1 cursor-pointer border border-black/10 dark:border-white/10"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة موسم</span>
                  </button>
                </div>

                {seasons.length === 0 ? (
                  <p className="text-xs text-black/60 dark:text-white/60 text-center py-6">لم يتم تسجيل مواسم حصاد أو زراعة خاصة بهذه المحافظة.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {seasons.map((s) => (
                      <div key={s.id} className="p-4 rounded-2xl bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                            {s.startPeriod} - {s.endPeriod}
                          </span>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmation({ isOpen: true, item: s, entityType: 'seasons' })}
                            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="font-bold text-sm">{s.title}</h4>
                        <p className="text-xs text-black/60 dark:text-white/60 line-clamp-2">{s.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cultural Events Section */}
              <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 shadow-lg backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                  <h3 className="text-base font-bold font-serif flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#9a6a35]" />
                    <span>المهروجانات والموالد والفعاليات ({events.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEntityType('event');
                      setEditingItem(null);
                      setIsEditModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 rounded-xl text-xs font-bold text-[#9a6a35] flex items-center gap-1 cursor-pointer border border-black/10 dark:border-white/10"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة فعالية</span>
                  </button>
                </div>

                {events.length === 0 ? (
                  <p className="text-xs text-black/60 dark:text-white/60 text-center py-6">لم يتم تسجيل فعاليات دورية لهذه المحافظة بعد.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.map((ev) => (
                      <div key={ev.id} className="p-4 rounded-2xl bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#9a6a35] font-bold">{ev.eventDate}</span>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmation({ isOpen: true, item: ev, entityType: 'events' })}
                            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="font-bold text-sm">{ev.title}</h4>
                        <p className="text-xs text-black/60 dark:text-white/60 line-clamp-2">{ev.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* SUBTAB 9: MARKETPLACE PRODUCTS (منتجات سوق وه)           */}
          {/* ======================================================= */}
          {activeSubTab === 'products' && (
            <div className="space-y-4">
              <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 shadow-lg backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4 mb-4">
                  <div>
                    <h3 className="text-base font-bold font-serif">منتجات سوق وه المصنوعة في {activeGov.name} ({products.length})</h3>
                    <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">المنتجات المرتبطة بحرفيي وتجار هذه المحافظة في المتجر المباشر.</p>
                  </div>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-12 text-black/50 dark:text-white/50">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-bold">لا توجد منتجات مسجلة لصالح تجار هذه المحافظة في المتجر حالياً.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((prod) => (
                      <div key={prod.id} className="p-4 rounded-2xl bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 flex items-center gap-3">
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200'}
                          alt={prod.title}
                          className="w-16 h-16 rounded-xl object-cover border border-black/10 dark:border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs truncate">{prod.title}</h4>
                          <p className="text-[11px] text-[#9a6a35] font-bold mt-0.5">{prod.price} ج.م</p>
                          <span className="text-[10px] text-black/50 dark:text-white/50 block">البائع: {prod.sellerName || 'حرفي محلي'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* SUBTAB 10: GOVERNORATE MAP (خريطة المحافظة وإحداثياتها) */}
          {/* ======================================================= */}
          {activeSubTab === 'map' && (
            <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 shadow-lg backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold font-serif flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-[#9a6a35]" />
                    <span>الخريطة التفاعلية لمحافظة {activeGov.name}</span>
                  </h3>
                  <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">تظهر كافة المعالم والأماكن الموثقة بإحداثيات GPS في قاعدة البيانات.</p>
                </div>
              </div>

              <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-black/10 dark:border-white/10 flex items-center justify-center p-6 text-center">
                <div className="space-y-2">
                  <MapPin className="w-10 h-10 text-[#9a6a35] mx-auto animate-bounce" />
                  <h4 className="font-bold text-sm">مستودع إحداثيات {activeGov.name}</h4>
                  <p className="text-xs text-black/60 dark:text-white/60 max-w-md">
                    تم ربط {places.filter((p) => !!p.coordinates).length} معلماً بإحداثيات حية. تظهر هذه النقاط تلقائياً على خريطة وه العامة وخريطة استكشاف الصعيد التفاعلية.
                  </p>
                </div>
              </div>

              {/* Coordinates list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {places.map((p) => (
                  <div key={p.id} className="p-3 bg-black/[0.035] dark:bg-white/[0.04] rounded-xl text-xs space-y-1 border border-black/10 dark:border-white/10">
                    <div className="font-bold truncate">{p.title}</div>
                    <div className="text-[10px] text-black/50 dark:text-white/50">
                      إحداثيات: {p.coordinates ? `${p.coordinates.lat}, ${p.coordinates.lng}` : 'غير مدخلة'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* SUBTAB 11: RELATIONSHIP MANAGER (مدير شبكة العلاقات)      */}
          {/* ======================================================= */}
          {activeSubTab === 'relationships' && (
            <RelationshipManagerSection
              governorate={activeGov}
              crafts={crafts}
              people={people}
              places={places}
              stories={stories}
              seasons={seasons}
              foods={foods}
              onSuccess={() => loadGovernorateData(activeGov.id)}
            />
          )}

          {/* ======================================================= */}
          {/* SUBTAB 12: PENDING REVIEW QUEUE (طابور مراجعة المحتوى)  */}
          {/* ======================================================= */}
          {activeSubTab === 'pending_review' && (
            <PendingReviewSection
              governorate={activeGov}
              places={places}
              crafts={crafts}
              foods={foods}
              people={people}
              stories={stories}
              events={events}
              seasons={seasons}
              onSuccess={() => loadGovernorateData(activeGov.id)}
            />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ACTION CENTER MODAL (إضافة محتوى سريع للمحافظة)                   */}
      {/* ========================================================================= */}
      {isActionCenterOpen && activeGov && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-[#151513]/95 rounded-[2rem] p-6 sm:p-8 max-w-xl w-full border border-black/10 dark:border-white/10 shadow-2xl space-y-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold font-serif">إضافة محتوى لمحافظة {activeGov.name}</h3>
                <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">اختر نوع الكيان المطلوب إضافته وتوثيقه في قاعدة البيانات:</p>
              </div>
              <button type="button" onClick={() => setIsActionCenterOpen(false)} className="p-1.5 rounded-lg text-black/50 dark:text-white/50 hover:bg-black/5 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { type: 'place', label: 'إضافة مكان / معلم', icon: Landmark, color: 'text-amber-500' },
                { type: 'craft', label: 'إضافة حرفة أصيلة', icon: Hammer, color: 'text-orange-500' },
                { type: 'food', label: 'إضافة أكلة تراثية', icon: Utensils, color: 'text-rose-500' },
                { type: 'person', label: 'إضافة شيخ صنعة / حرفي', icon: Users, color: 'text-indigo-500' },
                { type: 'story', label: 'إضافة قصة في وه بيحكي', icon: BookOpen, color: 'text-emerald-500' },
                { type: 'event', label: 'إضافة فعالية ثقافية', icon: Calendar, color: 'text-teal-500' },
                { type: 'season', label: 'إضافة موسم حصاد', icon: Wheat, color: 'text-yellow-500' },
                { type: 'city', label: 'إضافة مدينة / مركز', icon: MapPin, color: 'text-blue-500' },
                { type: 'village', label: 'إضافة قرية تراثية', icon: Compass, color: 'text-purple-500' }
              ].map((act, idx) => {
                const Icon = act.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIsActionCenterOpen(false);
                      setEditingEntityType(act.type);
                      setEditingItem(null);
                      setIsEditModalOpen(true);
                    }}
                    className="p-4 rounded-2xl bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 hover:border-[#9a6a35] flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group"
                  >
                    <Icon className={`w-6 h-6 ${act.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-xs font-bold leading-tight">{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SAFE DELETION / ARCHIVAL CONFIRMATION MODAL                      */}
      {/* ========================================================================= */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-[#151513]/95 rounded-[2rem] p-6 sm:p-8 max-w-md w-full border border-black/10 dark:border-white/10 shadow-2xl space-y-4 text-center backdrop-blur-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">تأكيد عملية الحذف أو الأرشفة</h3>
            <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف السجل "{deleteConfirmation.item.name || deleteConfirmation.item.title}"؟ لا يمكن التراجع عن هذه العملية بعد التنفيذ.
            </p>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-black/70 dark:text-white/70 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={executeSafeDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isDeleting ? 'جاري التنفيذ...' : 'تأكيد الحذف النهائي'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: COMPREHENSIVE ENTITY EDIT & CREATION MODAL                       */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <EntityCreationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            if (selectedGovId) loadGovernorateData(selectedGovId);
            else loadGovernorates();
          }}
          entityType={editingEntityType}
          editingItem={editingItem}
          lockedGovernorate={activeGov}
          governorates={governorates}
          authUser={authUser}
        />
      )}
    </div>
  );
};

// =========================================================================
// SUBCOMPONENT: RELATIONSHIP MANAGER (مدير شبكة العلاقات التراثية)
// =========================================================================
interface RelationshipManagerProps {
  governorate: WahGovernorate;
  crafts: CulturalCraft[];
  people: LocalPerson[];
  places: HeritagePlace[];
  stories: WahStory[];
  seasons: WahSeason[];
  foods: UpperEgyptFood[];
  onSuccess: () => void;
}

const RelationshipManagerSection: React.FC<RelationshipManagerProps> = ({
  governorate,
  crafts,
  people,
  places,
  stories,
  seasons,
  foods,
  onSuccess
}) => {
  const { addToast } = useApp();
  const [selectedCraftId, setSelectedCraftId] = useState(crafts[0]?.id || '');
  const [selectedArtisanId, setSelectedArtisanId] = useState(people[0]?.id || '');
  const [selectedStoryId, setSelectedStoryId] = useState(stories[0]?.id || '');
  const [selectedPlaceId, setSelectedPlaceId] = useState(places[0]?.id || '');
  const [isLinking, setIsLinking] = useState(false);

  const handleLinkCraftArtisan = async () => {
    if (!selectedCraftId || !selectedArtisanId) return;
    setIsLinking(true);
    try {
      await wahApi.updateRelationship({
        sourceEntityType: 'craft',
        sourceId: selectedCraftId,
        targetEntityType: 'person',
        targetId: selectedArtisanId,
        relationType: 'craft_artisan',
        action: 'link'
      });
      addToast('تم الربط', 'تم ربط الحرفة بشيخ الصنعة بنجاح', 'success');
      onSuccess();
    } catch (err: any) {
      addToast('فشل الربط', err.message || 'تعذر حفظ الرابط', 'error');
    } finally {
      setIsLinking(false);
    }
  };

  const handleLinkStoryPlace = async () => {
    if (!selectedStoryId || !selectedPlaceId) return;
    setIsLinking(true);
    try {
      await wahApi.updateRelationship({
        sourceEntityType: 'story',
        sourceId: selectedStoryId,
        targetEntityType: 'place',
        targetId: selectedPlaceId,
        relationType: 'place_story',
        action: 'link'
      });
      addToast('تم الربط', 'تم ربط الحكاية بالمعلم التراثي بنجاح', 'success');
      onSuccess();
    } catch (err: any) {
      addToast('فشل الربط', err.message || 'تعذر حفظ الرابط', 'error');
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 space-y-6 shadow-lg backdrop-blur-xl">
      <div className="border-b border-black/10 dark:border-white/10 pb-4">
        <h3 className="text-base font-bold font-serif flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-[#9a6a35]" />
          <span>مدير شبكة العلاقات التراثية الذكية ({governorate.name})</span>
        </h3>
        <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">
          اربط الحرف بالحرفيين، والقصص بالمعالم التراثية، والمواسم بالأكلات دون الحاجة لكتابة معرفات برمجية يدوياً.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Link Craft <-> Artisan */}
        <div className="p-5 rounded-2xl bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 space-y-4">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Hammer className="w-4 h-4 text-orange-500" />
            <span>ربط حرفة أصيلة بشيخ صنعة / حرفي</span>
          </h4>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-black/60 dark:text-white/60 mb-1 font-bold">الحرفة التراثية:</label>
              <select
                value={selectedCraftId}
                onChange={(e) => setSelectedCraftId(e.target.value)}
                className="w-full bg-white dark:bg-[#151513] text-xs rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 outline-none cursor-pointer"
              >
                {crafts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-black/60 dark:text-white/60 mb-1 font-bold">شيخ الصنعة / الحرفي:</label>
              <select
                value={selectedArtisanId}
                onChange={(e) => setSelectedArtisanId(e.target.value)}
                className="w-full bg-white dark:bg-[#151513] text-xs rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 outline-none cursor-pointer"
              >
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.titleOrRole})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              disabled={isLinking || crafts.length === 0 || people.length === 0}
              onClick={handleLinkCraftArtisan}
              className="w-full py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isLinking ? 'جاري الربط...' : 'تثبيت الرابط في قاعدة البيانات'}
            </button>
          </div>
        </div>

        {/* Link Story <-> Place */}
        <div className="p-5 rounded-2xl bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 space-y-4">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span>ربط قصة في "وه بيحكي" بمعلم تراثي</span>
          </h4>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-black/60 dark:text-white/60 mb-1 font-bold">الحكاية الشعبية:</label>
              <select
                value={selectedStoryId}
                onChange={(e) => setSelectedStoryId(e.target.value)}
                className="w-full bg-white dark:bg-[#151513] text-xs rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 outline-none cursor-pointer"
              >
                {stories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-black/60 dark:text-white/60 mb-1 font-bold">المعلم التراثي المرتبط:</label>
              <select
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(e.target.value)}
                className="w-full bg-white dark:bg-[#151513] text-xs rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 outline-none cursor-pointer"
              >
                {places.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              disabled={isLinking || stories.length === 0 || places.length === 0}
              onClick={handleLinkStoryPlace}
              className="w-full py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isLinking ? 'جاري الربط...' : 'تثبيت الرابط في قاعدة البيانات'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// SUBCOMPONENT: PENDING REVIEW QUEUE (طابور مراجعة المحتوى والمصادر)
// =========================================================================
interface PendingReviewSectionProps {
  governorate: WahGovernorate;
  places: HeritagePlace[];
  crafts: CulturalCraft[];
  foods: UpperEgyptFood[];
  people: LocalPerson[];
  stories: WahStory[];
  events: CulturalEvent[];
  seasons: WahSeason[];
  onSuccess: () => void;
}

const PendingReviewSection: React.FC<PendingReviewSectionProps> = ({
  governorate,
  places,
  crafts,
  foods,
  people,
  stories,
  events,
  seasons,
  onSuccess
}) => {
  const { addToast } = useApp();

  const pendingItems = useMemo(() => {
    const list: any[] = [];
    places.filter((p) => p.status === 'pending_review' || (p as any).verificationStatus === 'pending_review').forEach((p) => list.push({ ...p, entityType: 'places', typeLabel: 'معلم تراثي' }));
    crafts.filter((c) => c.status === 'pending_review').forEach((c) => list.push({ ...c, entityType: 'crafts', typeLabel: 'حرفة' }));
    foods.filter((f) => f.status === 'pending_review').forEach((f) => list.push({ ...f, entityType: 'food', typeLabel: 'أكلة' }));
    people.filter((p) => p.status === 'pending_review').forEach((p) => list.push({ ...p, entityType: 'people', typeLabel: 'شخصية' }));
    stories.filter((s) => s.status === 'pending_review').forEach((s) => list.push({ ...s, entityType: 'stories', typeLabel: 'قصة' }));
    events.filter((e) => e.status === 'pending_review').forEach((e) => list.push({ ...e, entityType: 'events', typeLabel: 'فعالية' }));
    seasons.filter((s) => s.status === 'pending_review').forEach((s) => list.push({ ...s, entityType: 'seasons', typeLabel: 'موسم' }));
    return list;
  }, [places, crafts, foods, people, stories, events, seasons]);

  const handleApproveItem = async (entityType: string, id: string) => {
    try {
      await wahApi.executeBulkAction({ entityType: entityType as any, action: 'approve', ids: [id] });
      addToast('تم الاعتماد', 'تم اعتماد السجل ونشره بنجاح', 'success');
      onSuccess();
    } catch (err: any) {
      addToast('خطأ', err.message || 'فشل اعتماد السجل', 'error');
    }
  };

  return (
    <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 space-y-6 shadow-lg backdrop-blur-xl">
      <div className="border-b border-black/10 dark:border-white/10 pb-4">
        <h3 className="text-base font-bold font-serif flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>طابور مراجعة المحتوى وتدقيق المصادر ({pendingItems.length})</span>
        </h3>
        <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">
          وفقاً لميثاق جودة بيانات وه: أي محتوى جديد يبدأ بحالة "يحتاج مراجعة" ومرفق معه المصدر وتاريخ البحث حتى يقرره مدير النظام.
        </p>
      </div>

      {pendingItems.length === 0 ? (
        <div className="text-center py-12 text-black/50 dark:text-white/50">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
          <h4 className="font-bold text-sm">كافة السجلات معتمدة ومحققة</h4>
          <p className="text-xs mt-1">لا توجد عناصر بانتظار المراجعة في محافظة {governorate.name}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                    {item.typeLabel}
                  </span>
                  <h4 className="font-bold text-sm">{item.title || item.name}</h4>
                </div>
                <p className="text-xs text-black/60 dark:text-white/60 line-clamp-2">{item.description || item.shortIntro || item.biography}</p>
                {item.sourceName && (
                  <div className="text-[11px] text-[#9a6a35] flex items-center gap-1 font-bold">
                    <span>المصدر: {item.sourceName}</span>
                    {item.sourceUrl && (
                      <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-0.5">
                        <span>زيارة المصدر</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleApproveItem(item.entityType, item.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  اعتماد ونشر
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// MODAL: COMPREHENSIVE ENTITY EDIT & CREATION (دعم كافة كيانات المنظومة ومصادرها)
// =========================================================================
interface EntityCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entityType: string;
  editingItem: any;
  lockedGovernorate: WahGovernorate | null;
  governorates: WahGovernorate[];
  authUser: { id?: string; role?: string };
}

const EntityCreationModal: React.FC<EntityCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  entityType,
  editingItem,
  lockedGovernorate,
  governorates,
  authUser
}) => {
  const { addToast } = useApp();
  const [title, setTitle] = useState(editingItem?.title || editingItem?.name || '');
  const [selectedGovName, setSelectedGovName] = useState(
    editingItem?.governorateName || lockedGovernorate?.name || governorates[0]?.name || 'أسيوط'
  );
  const [category, setCategory] = useState(editingItem?.category || '');
  const [shortDesc, setShortDesc] = useState(editingItem?.description || editingItem?.shortDescription || editingItem?.shortIntro || '');
  const [fullContent, setFullContent] = useState(editingItem?.history || editingItem?.biography || editingItem?.content || editingItem?.originStory || '');
  const [coverImage, setCoverImage] = useState(editingItem?.coverImage || editingItem?.avatarUrl || '');
  const [videoUrl, setVideoUrl] = useState<string>(editingItem?.videoUrl || '');
  const [gallery, setGallery] = useState<string[]>(
    editingItem?.gallery && editingItem.gallery.length > 0
      ? editingItem.gallery
      : editingItem?.galleryImages || []
  );
  const [lat, setLat] = useState<string>(editingItem?.coordinates?.lat?.toString() || '');
  const [lng, setLng] = useState<string>(editingItem?.coordinates?.lng?.toString() || '');
  const [sourceName, setSourceName] = useState(editingItem?.sourceName || 'وزارة السياحة والآثار المصرية');
  const [sourceUrl, setSourceUrl] = useState(editingItem?.sourceUrl || 'https://mota.gov.eg');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(editingItem?.verificationStatus || 'verified');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('بيانات مطلوبة', 'يرجى كتابة الاسم أو العنوان الرئيسي', 'warning');
      return;
    }

    setIsSubmitting(true);
    const targetGovObj = governorates.find((g) => g.name === selectedGovName) || lockedGovernorate;
    const govId = targetGovObj?.id || `gov-${selectedGovName}`;
    const slug = editingItem?.slug || `${Date.now()}-${title.trim().toLowerCase().replace(/[^\u0621-\u064A\w]+/g, '-')}`;

    const coordinates = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;

    try {
      if (entityType === 'governorate') {
        await wahApi.saveGovernorate(
          {
            id: editingItem?.id,
            name: title.trim(),
            slug,
            shortIntro: shortDesc.trim(),
            history: fullContent.trim(),
            coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800',
            status: verificationStatus === 'verified' ? 'approved' : 'pending_review'
          },
          authUser
        );
      } else if (entityType === 'place') {
        await wahApi.savePlace(
          {
            id: editingItem?.id,
            title: title.trim(),
            slug,
            governorateId: govId,
            governorateName: selectedGovName,
            category: (category as any) || 'temple',
            description: shortDesc.trim(),
            history: fullContent.trim(),
            significance: shortDesc.trim(),
            locationName: selectedGovName,
            coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
            videoUrl: videoUrl.trim() || undefined,
            videos: videoUrl.trim() ? [videoUrl.trim()] : (editingItem?.videos || []),
            gallery: gallery,
            galleryImages: gallery,
            coordinates,
            status: verificationStatus === 'verified' ? 'approved' : 'pending_review',
            sourceName: sourceName.trim()
          },
          authUser
        );
      } else if (entityType === 'craft') {
        await wahApi.saveCraft(
          {
            id: editingItem?.id,
            title: title.trim(),
            slug,
            shortDescription: shortDesc.trim(),
            history: fullContent.trim(),
            governorates: [selectedGovName],
            materials: ['خامات طبيعية محلية'],
            tools: ['أدوات يدوية تقليدية'],
            manufacturingStages: [{ stepNumber: 1, title: 'المرحلة الأساسية', description: fullContent.trim() || shortDesc.trim() }],
            coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800',
            videoUrl: videoUrl.trim() || undefined,
            videos: videoUrl.trim() ? [videoUrl.trim()] : (editingItem?.videos || []),
            gallery: gallery,
            status: verificationStatus === 'verified' ? 'approved' : 'pending_review'
          },
          authUser
        );
      } else if (entityType === 'food') {
        await wahApi.saveFood(
          {
            id: editingItem?.id,
            title: title.trim(),
            slug,
            governorateId: govId,
            governorateName: selectedGovName,
            description: shortDesc.trim(),
            ingredients: ['مكونات طازجة من مزارع الصعيد'],
            preparationMethod: fullContent.trim() || shortDesc.trim(),
            originStory: fullContent.trim() || shortDesc.trim(),
            coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
            status: verificationStatus === 'verified' ? 'approved' : 'pending_review'
          },
          authUser
        );
      } else if (entityType === 'person') {
        await wahApi.savePerson(
          {
            id: editingItem?.id,
            name: title.trim(),
            slug,
            governorateId: govId,
            governorateName: selectedGovName,
            titleOrRole: category || 'شيخ صنعة وحارس تراث',
            craftOrSkill: category || 'صانع تقليدي',
            biography: fullContent.trim() || shortDesc.trim(),
            avatarUrl: coverImage.trim() || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
            status: verificationStatus === 'verified' ? 'approved' : 'pending_review'
          },
          authUser
        );
      } else if (entityType === 'story') {
        await wahApi.saveStory(
          {
            id: editingItem?.id,
            title: title.trim(),
            slug,
            governorateId: govId,
            governorateName: selectedGovName,
            excerpt: shortDesc.trim(),
            content: fullContent.trim() || shortDesc.trim(),
            category: 'oral_tradition',
            authorName: 'فريق توثيق وه',
            coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
            videoUrl: videoUrl.trim() || undefined,
            videos: videoUrl.trim() ? [videoUrl.trim()] : (editingItem?.videos || []),
            readingTimeMinutes: 4,
            status: verificationStatus === 'verified' ? 'approved' : 'pending_review'
          },
          authUser
        );
      } else if (entityType === 'event') {
        await wahApi.saveEvent(
          {
            id: editingItem?.id,
            title: title.trim(),
            slug,
            governorateId: govId,
            governorateName: selectedGovName,
            category: (category as any) || 'festival',
            locationName: selectedGovName,
            eventDate: 'موسم سنوي',
            description: fullContent.trim() || shortDesc.trim(),
            coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
            status: verificationStatus === 'verified' ? 'approved' : 'pending_review'
          },
          authUser
        );
      } else if (entityType === 'season') {
        await wahApi.saveSeason(
          {
            id: editingItem?.id,
            title: title.trim(),
            slug,
            governorateId: govId,
            governorateName: selectedGovName,
            category: 'harvest',
            startPeriod: 'فترة الحصاد',
            endPeriod: 'نهاية الموسم',
            description: shortDesc.trim() || fullContent.trim(),
            sourceName: sourceName.trim(),
            sourceUrl: sourceUrl.trim(),
            verificationStatus,
            status: verificationStatus === 'verified' ? 'approved' : 'pending_review'
          },
          authUser
        );
      } else if (entityType === 'city') {
        await wahApi.saveCity(
          {
            id: editingItem?.id,
            name: title.trim(),
            governorateId: govId,
            governorateName: selectedGovName,
            shortDescription: shortDesc.trim(),
            status: 'approved'
          },
          authUser
        );
      } else if (entityType === 'village') {
        await wahApi.saveVillage(
          {
            id: editingItem?.id,
            name: title.trim(),
            governorateId: govId,
            governorateName: selectedGovName,
            description: shortDesc.trim(),
            status: 'approved'
          },
          authUser
        );
      }

      addToast('تم الحفظ بنجاح', `تم حفظ "${title}" في قاعدة البيانات بنجاح`, 'success');
      onSuccess();
    } catch (err: any) {
      addToast('خطأ في الحفظ', err.message || 'تعذر حفظ البيانات', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white/95 dark:bg-[#151513]/95 rounded-[2rem] p-4 sm:p-7 max-w-2xl w-full border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-2xl my-4 sm:my-8 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-5">
          <h3 className="text-lg font-bold font-serif flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#9a6a35]" />
            <span>{editingItem ? 'تعديل السجل في MongoDB' : `توثيق ${entityType} جديد في قاعدة البيانات`}</span>
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-black/50 dark:text-white/50 hover:bg-black/5 cursor-pointer" aria-label="إغلاق">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-black/60 dark:text-white/60 mb-1">الاسم أو العنوان الرئيسي *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: الدير المحرق، فن التلي، العيش الشمسي..."
              className="w-full bg-black/[0.035] dark:bg-white/[0.04] text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-black/10 dark:border-white/10 outline-none font-bold focus:border-[#9a6a35]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-black/60 dark:text-white/60 mb-1">المحافظة التابعة</label>
              <select
                value={selectedGovName}
                onChange={(e) => setSelectedGovName(e.target.value)}
                disabled={!!lockedGovernorate && !editingItem}
                className="w-full bg-black/[0.035] dark:bg-white/[0.04] text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-black/10 dark:border-white/10 outline-none font-bold disabled:opacity-75 cursor-pointer"
              >
                {governorates.map((g) => (
                  <option key={g.id} value={g.name}>
                    محافظة {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-black/60 dark:text-white/60 mb-1">التصنيف أو الكلمات المفتاحية</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="مثال: معبد فرعوني، دير، نسيج حرير..."
                className="w-full bg-black/[0.035] dark:bg-white/[0.04] text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-black/10 dark:border-white/10 outline-none focus:border-[#9a6a35]"
              />
            </div>
          </div>

          <AdminMediaUploader
            entityType={entityType}
            entitySlug={editingItem?.slug || title}
            entityId={editingItem?.id}
            entityTitle={title}
            governorateName={selectedGovName}
            value={coverImage}
            onChange={(val) => setCoverImage(val)}
            label="صورة الغلاف / الأيقونة التوثيقية"
            helperText="ارفع صورة معتمدة من جهازك أو اعتمد رابطاً خارجياً للظهور في المنصة والخريطة"
          />

          {/* Video and Gallery uploaders for places, crafts, and stories */}
          {(entityType === 'place' || entityType === 'craft' || entityType === 'story') && (
            <div className="space-y-4 pt-2 border-t border-black/10 dark:border-white/10">
              <div className="bg-black/[0.02] dark:bg-white/[0.02] p-3.5 sm:p-4 rounded-2xl border border-black/10 dark:border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#9a6a35] flex items-center gap-1.5">
                    <Video className="w-4 h-4" />
                    <span>مقطع فيديو توثيقي (Cloudinary WAH/videos)</span>
                  </span>
                  <span className="text-[11px] text-black/50 dark:text-white/50">MP4, WebM حتى 150MB</span>
                </div>
                <AdminMediaUploader
                  entityType={entityType}
                  entitySlug={editingItem?.slug || title || 'media-video'}
                  entityId={editingItem?.id}
                  entityTitle={title}
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
                    setVideoUrl(vUrl);
                  }}
                  label={
                    entityType === 'craft'
                      ? 'فيديو الحرفة التوثيقي'
                      : entityType === 'story'
                      ? 'فيديو القصة التوثيقي'
                      : 'فيديو المعلم أو الموقع التوثيقي'
                  }
                  helperText="ارفع فيديو ليظهر في مشغل الفيديو ومعرض المكان أو الحرفة للزوار"
                />
              </div>

              <div className="bg-black/[0.02] dark:bg-white/[0.02] p-3.5 sm:p-4 rounded-2xl border border-black/10 dark:border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#9a6a35] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>معرض صور إضافية للمكان (Gallery)</span>
                  </span>
                  <span className="text-[11px] text-black/50 dark:text-white/50">{gallery.length} صورة</span>
                </div>
                <AdminMediaUploader
                  entityType={entityType}
                  entitySlug={editingItem?.slug || title || 'place-gallery'}
                  entityId={editingItem?.id}
                  entityTitle={title}
                  mediaCategory="image"
                  multiple={true}
                  value={gallery}
                  onChange={(uploaded: any) => {
                    if (Array.isArray(uploaded)) {
                      const urls = uploaded
                        .map((it: any) => (typeof it === 'string' ? it : (it?.secureUrl || it?.url || '')))
                        .filter(Boolean);
                      setGallery(urls);
                    } else if (typeof uploaded === 'string' && uploaded) {
                      setGallery((prev) => Array.from(new Set([...prev, uploaded])));
                    }
                  }}
                  label="ألبوم صور إضافية للمعلم"
                  helperText="ارفع مجموعة صور إضافية للمعلم التراثي ليتمكن الزوار من تصفحها بالمعرض"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-black/60 dark:text-white/60 mb-1">خط العرض (Latitude)</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="27.1809"
                className="w-full bg-black/[0.035] dark:bg-white/[0.04] text-xs rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 outline-none focus:border-[#9a6a35]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/60 dark:text-white/60 mb-1">خط الطول (Longitude)</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="31.1837"
                className="w-full bg-black/[0.035] dark:bg-white/[0.04] text-xs rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 outline-none focus:border-[#9a6a35]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black/60 dark:text-white/60 mb-1">نبذة موجزة للعرض في البطاقات</label>
            <textarea
              rows={2}
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="تعريف مكثف لا يتجاوز سطرين..."
              className="w-full bg-black/[0.035] dark:bg-white/[0.04] text-xs sm:text-sm rounded-xl px-4 py-2 border border-black/10 dark:border-white/10 outline-none focus:border-[#9a6a35]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-black/60 dark:text-white/60 mb-1">المحتوى التاريخي والتفصيلي والقصة</label>
            <textarea
              rows={3}
              value={fullContent}
              onChange={(e) => setFullContent(e.target.value)}
              placeholder="التوثيق الكامل وتاريخ الصنعة والمروية التراثية..."
              className="w-full bg-black/[0.035] dark:bg-white/[0.04] text-xs sm:text-sm rounded-xl px-4 py-2 border border-black/10 dark:border-white/10 outline-none focus:border-[#9a6a35]"
            />
          </div>

          {/* Verification and Sources Panel */}
          <div className="bg-black/[0.035] dark:bg-white/[0.04] p-4 rounded-2xl border border-black/10 dark:border-white/10 space-y-3">
            <span className="text-xs font-black text-[#9a6a35] block">توثيق المصدر وحالة النشر (وفق معايير وه)</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-black/60 dark:text-white/60 mb-1">اسم المصدر المعتمد:</label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="مثال: وزارة السياحة والآثار المصرية"
                  className="w-full bg-white dark:bg-[#151513] text-xs rounded-lg px-3 py-1.5 border border-black/10 dark:border-white/10 outline-none focus:border-[#9a6a35]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-black/60 dark:text-white/60 mb-1">رابط المصدر (URL):</label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white dark:bg-[#151513] text-xs rounded-lg px-3 py-1.5 border border-black/10 dark:border-white/10 outline-none focus:border-[#9a6a35]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-black/60 dark:text-white/60 mb-1">حالة التحقق والنشر:</label>
              <select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
                className="w-full bg-white dark:bg-[#151513] text-xs font-bold rounded-lg px-3 py-1.5 border border-black/10 dark:border-white/10 outline-none cursor-pointer"
              >
                <option value="verified">محقق ومعتمد للنشر العام (Verified)</option>
                <option value="pending_review">يحتاج مراجعة وتدقيق (Pending Review)</option>
                <option value="unverified">غير محقق / مسودة (Unverified)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-black/70 dark:text-white/70 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
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