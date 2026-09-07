import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { MapGovernorateData, MapMarkerItem, MapMarkerType, MapPayload } from '../../types';
import {
  MapPin,
  Compass,
  Edit3,
  CheckCircle2,
  Save,
  Search,
  Layers,
  ArrowLeft,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Landmark,
  Hammer,
  Utensils,
  Calendar,
  User,
  BookOpen,
  Map as MapIcon,
  Filter,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';

interface EditableItem {
  id: string;
  name: string;
  type: 'governorate' | 'place' | 'craft' | 'food' | 'event' | 'artisan' | 'story';
  typeLabel: string;
  governorateName: string;
  governorateId?: string;
  lat: number;
  lng: number;
  isFeatured?: boolean;
  coverImage?: string;
}

export const AdminMapEditorPage: React.FC = () => {
  const { currentUser, setActivePage } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [mapPayload, setMapPayload] = useState<MapPayload | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedGov, setSelectedGov] = useState<string>('all');

  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load all map items
  const loadData = async () => {
    setIsLoading(true);
    try {
      const payload = await wahApi.getFullMapPayload();
      setMapPayload(payload);
    } catch (err) {
      console.error('Failed to load map payload:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Normalize all items into a single editable list
  const allItems: EditableItem[] = useMemo(() => {
    if (!mapPayload) return [];

    const govItems: EditableItem[] = mapPayload.governorates.map((g) => ({
      id: g.id,
      name: g.name,
      type: 'governorate',
      typeLabel: 'محافظة',
      governorateName: g.name,
      lat: g.coordinates?.lat || 26.0,
      lng: g.coordinates?.lng || 32.0,
      isFeatured: true,
      coverImage: g.coverImage
    }));

    const markerItems: EditableItem[] = mapPayload.markers.map((m) => ({
      id: m.id,
      name: m.title,
      type: m.type as any,
      typeLabel: m.typeLabel,
      governorateName: m.governorateName,
      governorateId: m.governorateId,
      lat: m.lat,
      lng: m.lng,
      isFeatured: m.isFeatured,
      coverImage: m.coverImage
    }));

    return [...govItems, ...markerItems];
  }, [mapPayload]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const matchesGov = selectedGov === 'all' || item.governorateName === selectedGov;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.governorateName.toLowerCase().includes(q);

      return matchesType && matchesGov && matchesSearch;
    });
  }, [allItems, selectedType, selectedGov, searchQuery]);

  // Coordinate presets for quick calibration
  const CITY_PRESETS = [
    { name: 'أسوان (الشلال الأول)', lat: 24.0889, lng: 32.8998 },
    { name: 'الأقصر (طيبة)', lat: 25.6872, lng: 32.6396 },
    { name: 'قنا (دندرة)', lat: 26.1551, lng: 32.716 },
    { name: 'سوهاج (أخميم)', lat: 26.5569, lng: 31.6948 },
    { name: 'أسيوط (القناطر)', lat: 27.1809, lng: 31.1837 },
    { name: 'المنيا (بني حسن)', lat: 28.1099, lng: 30.7503 },
    { name: 'بني سويف (ميدوم)', lat: 29.0744, lng: 31.0978 },
    { name: 'الفيوم (وادي الحيتان)', lat: 29.3084, lng: 30.8428 },
    { name: 'الوادي الجديد (الخارجة)', lat: 25.4514, lng: 30.5472 }
  ];

  // Save updated coordinates
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsSaving(true);
    try {
      await wahApi.updateMapCoordinates(
        editingItem.type,
        editingItem.id,
        editingItem.lat,
        editingItem.lng,
        editingItem.isFeatured,
        currentUser
      );
      setSaveSuccess(`تم حفظ إحداثيات (${editingItem.name}) بنجاح`);
      setTimeout(() => setSaveSuccess(null), 3500);
      setEditingItem(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء حفظ الإحداثيات');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#110E0C] text-[#241E1A] dark:text-[#FAF6F2] font-sans pb-16">
      {/* Top Header */}
      <header className="border-b border-[#E5DDD3] dark:border-[#2C2420] bg-white/80 dark:bg-[#1A1614]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#73675B] dark:text-[#9C8F82]">
            <button
              onClick={() => setActivePage('admin-dashboard')}
              className="hover:text-[#B24C2B] transition-colors cursor-pointer"
            >
              لوحة الإدارة
            </button>
            <span>/</span>
            <span className="text-[#B24C2B] font-bold">محرر وضبط إحداثيات الخريطة (GIS)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePage('map')}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#B24C2B] hover:bg-[#9E4F36] px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>معاينة الخريطة التفاعلية</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Title and Intro */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5DDD3] dark:border-[#2C2420] pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-bold mb-2">
              <Compass className="w-3.5 h-3.5 text-[#B24C2B]" />
              <span>نظام إدارة الإحداثيات الجغرافية لموسوعة صعيد مصر</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#241E1A] dark:text-[#FAF6F2]">
              محرر إحداثيات المواقع والمعالم (WAH GIS)
            </h1>
            <p className="text-xs sm:text-sm text-[#73675B] dark:text-[#A89C90] mt-1">
              تحكم كامل في خطوط الطول ودائرات العرض لجميع محافظات، معالم، ورش، ومواقع صعيد مصر على الخريطة التفاعلية.
            </p>
          </div>

          {/* KPI Counters */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white dark:bg-[#1A1614] border border-[#E5DDD3] dark:border-[#2C2420] text-center min-w-[80px]">
              <span className="text-lg font-black text-[#B24C2B] block">
                {mapPayload?.governorates.length || 0}
              </span>
              <span className="text-[10px] text-[#73675B] dark:text-[#9C8F82] font-semibold">محافظات</span>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-[#1A1614] border border-[#E5DDD3] dark:border-[#2C2420] text-center min-w-[80px]">
              <span className="text-lg font-black text-emerald-600 block">
                {mapPayload?.markers.length || 0}
              </span>
              <span className="text-[10px] text-[#73675B] dark:text-[#9C8F82] font-semibold">نقاط ومعالم</span>
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {/* Filters Toolbar */}
        <div className="bg-white dark:bg-[#1A1614] p-4 rounded-2xl border border-[#E5DDD3] dark:border-[#2C2420] mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#73675B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو المحافظة..."
              className="w-full pr-10 pl-4 py-2 text-xs rounded-xl bg-[#FAF7F2] dark:bg-[#26201B] border border-[#E5DDD3] dark:border-[#352B24] focus:outline-none focus:border-[#B24C2B]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Entity Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#26201B] border border-[#E5DDD3] dark:border-[#352B24] font-semibold"
            >
              <option value="all">كل الأنواع</option>
              <option value="governorate">المحافظات</option>
              <option value="place">معالم تراثية</option>
              <option value="craft">حرف يدوية</option>
              <option value="food">مأكولات تراثية</option>
              <option value="event">فعاليات وموالد</option>
              <option value="artisan">مبدعون وحرفيون</option>
              <option value="story">حكايات وأساطير</option>
            </select>

            {/* Governorate Filter */}
            <select
              value={selectedGov}
              onChange={(e) => setSelectedGov(e.target.value)}
              className="text-xs p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#26201B] border border-[#E5DDD3] dark:border-[#352B24] font-semibold"
            >
              <option value="all">كل المحافظات</option>
              {mapPayload?.governorates.map((g) => (
                <option key={g.id} value={g.name}>
                  محافظة {g.name}
                </option>
              ))}
            </select>

            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#26201B] border border-[#E5DDD3] dark:border-[#352B24] text-[#73675B] hover:text-[#B24C2B] transition-colors cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Data View: Desktop Table + Mobile Cards */}
        <div className="bg-white dark:bg-[#1A1614] rounded-2xl sm:rounded-3xl border border-[#E5DDD3] dark:border-[#2C2420] overflow-hidden shadow-xs">
          {/* Mobile Card List (< md) */}
          <div className="block md:hidden divide-y divide-[#F0EAE1] dark:divide-[#2C2420]">
            {isLoading ? (
              <div className="p-8 text-center text-[#73675B]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#B24C2B]" />
                <span className="text-xs">جاري تحميل بيانات المواقع من قاعدة البيانات...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-8 text-center text-[#73675B] text-xs">
                لا توجد عناصر مطابقة لخيارات البحث المحددة.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={`${item.type}-${item.id}`} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {item.coverImage ? (
                        <img
                          src={item.coverImage}
                          alt=""
                          className="w-11 h-11 rounded-xl object-cover bg-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-[#FAF7F2] dark:bg-[#26201B] flex items-center justify-center text-[#B24C2B] shrink-0 border border-[#E5DDD3] dark:border-[#352B24]">
                          <MapPin className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-[#241E1A] dark:text-[#FAF6F2] line-clamp-1">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF7F2] dark:bg-[#26201B] text-[#73675B] dark:text-[#A89C90] border border-[#E5DDD3] dark:border-[#352B24] font-semibold text-[10px]">
                            {item.typeLabel}
                          </span>
                          <span className="text-xs text-[#73675B] font-medium">
                            {item.governorateName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {item.isFeatured && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] shrink-0">
                        بارز ★
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#F5EFE6] dark:border-[#26201B]">
                    <div className="font-mono text-xs text-[#73675B] dark:text-[#A89C90] flex items-center gap-2">
                      <span className="bg-[#FAF7F2] dark:bg-[#26201B] px-2 py-1 rounded-lg border border-[#E5DDD3] dark:border-[#352B24]">
                        {item.lat.toFixed(4)}° N
                      </span>
                      <span className="bg-[#FAF7F2] dark:bg-[#26201B] px-2 py-1 rounded-lg border border-[#E5DDD3] dark:border-[#352B24]">
                        {item.lng.toFixed(4)}° E
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...item })}
                      className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#B24C2B]/10 hover:bg-[#B24C2B] text-[#B24C2B] hover:text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>تعديل</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FAF7F2] dark:bg-[#26201B] text-[#73675B] dark:text-[#9C8F82] border-b border-[#E5DDD3] dark:border-[#2C2420] font-bold">
                <tr>
                  <th className="p-3.5">الاسم والوصف</th>
                  <th className="p-3.5">النوع</th>
                  <th className="p-3.5">المحافظة</th>
                  <th className="p-3.5">دائرة العرض (Lat)</th>
                  <th className="p-3.5">خط الطول (Lng)</th>
                  <th className="p-3.5">الحالة بالخريطة</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE1] dark:divide-[#2C2420]">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#73675B]">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#B24C2B]" />
                      <span>جاري تحميل بيانات المواقع من قاعدة البيانات...</span>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#73675B]">
                      لا توجد عناصر مطابقة لخيارات البحث المحددة.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={`${item.type}-${item.id}`}
                      className="hover:bg-[#FAF7F2]/60 dark:hover:bg-[#26201B]/60 transition-colors"
                    >
                      <td className="p-3.5 font-bold flex items-center gap-2.5">
                        {item.coverImage ? (
                          <img
                            src={item.coverImage}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover bg-gray-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] dark:bg-[#26201B] flex items-center justify-center text-[#B24C2B]">
                            <MapPin className="w-4 h-4" />
                          </div>
                        )}
                        <span className="truncate max-w-[200px]">{item.name}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF7F2] dark:bg-[#26201B] text-[#73675B] dark:text-[#A89C90] border border-[#E5DDD3] dark:border-[#352B24] font-semibold">
                          {item.typeLabel}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-[#73675B] dark:text-[#9C8F82]">
                        {item.governorateName}
                      </td>
                      <td className="p-3.5 font-mono text-[#241E1A] dark:text-[#FAF6F2]">
                        {item.lat.toFixed(4)}° N
                      </td>
                      <td className="p-3.5 font-mono text-[#241E1A] dark:text-[#FAF6F2]">
                        {item.lng.toFixed(4)}° E
                      </td>
                      <td className="p-3.5">
                        {item.isFeatured ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                            بارز على الخريطة ★
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#73675B] dark:text-[#9C8F82]">
                            عادي
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setEditingItem({ ...item })}
                          className="px-3 py-1.5 rounded-lg bg-[#B24C2B]/10 hover:bg-[#B24C2B] text-[#B24C2B] hover:text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Editing Item Coordinates */}
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white dark:bg-[#1A1614] rounded-2xl sm:rounded-3xl max-w-lg w-full border border-[#E5DDD3] dark:border-[#2C2420] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
              <div className="p-4 sm:p-5 border-b border-[#E5DDD3] dark:border-[#2C2420] flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg text-[#241E1A] dark:text-[#FAF6F2]">
                    ضبط إحداثيات: {editingItem.name}
                  </h3>
                  <p className="text-xs text-[#73675B] dark:text-[#9C8F82]">
                    {editingItem.typeLabel} • محافظة {editingItem.governorateName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#26201B] text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-4">
                {/* Coordinates Presets */}
                <div>
                  <span className="text-xs font-bold text-[#73675B] dark:text-[#9C8F82] block mb-1.5">
                    إسناد سريع لمدينة رئيسية:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {CITY_PRESETS.map((city) => (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() =>
                          setEditingItem((prev) =>
                            prev ? { ...prev, lat: city.lat, lng: city.lng } : null
                          )
                        }
                        className="text-[10px] px-2 py-1 rounded-md bg-[#FAF7F2] dark:bg-[#26201B] text-[#4A3F35] dark:text-[#DDD2C6] border border-[#E5DDD3] dark:border-[#352B24] hover:border-[#B24C2B] font-semibold transition-colors"
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Numerical Lat/Lng Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#241E1A] dark:text-[#FAF6F2] block mb-1">
                      دائرة العرض (Latitude)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={editingItem.lat}
                      onChange={(e) =>
                        setEditingItem((prev) =>
                          prev ? { ...prev, lat: parseFloat(e.target.value) || 0 } : null
                        )
                      }
                      className="w-full p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#26201B] border border-[#E5DDD3] dark:border-[#352B24] font-mono text-xs focus:outline-none focus:border-[#B24C2B]"
                    />
                    <span className="text-[10px] text-[#73675B] block mt-1">
                      النطاق للصعيد: 22.0° إلى 29.8°
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#241E1A] dark:text-[#FAF6F2] block mb-1">
                      خط الطول (Longitude)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={editingItem.lng}
                      onChange={(e) =>
                        setEditingItem((prev) =>
                          prev ? { ...prev, lng: parseFloat(e.target.value) || 0 } : null
                        )
                      }
                      className="w-full p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#26201B] border border-[#E5DDD3] dark:border-[#352B24] font-mono text-xs focus:outline-none focus:border-[#B24C2B]"
                    />
                    <span className="text-[10px] text-[#73675B] block mt-1">
                      النطاق للصعيد: 27.2° إلى 33.8°
                    </span>
                  </div>
                </div>

                {/* Featured on Map toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="edit-is-featured"
                    checked={!!editingItem.isFeatured}
                    onChange={(e) =>
                      setEditingItem((prev) =>
                        prev ? { ...prev, isFeatured: e.target.checked } : null
                      )
                    }
                    className="w-4 h-4 accent-[#B24C2B] rounded"
                  />
                  <label
                    htmlFor="edit-is-featured"
                    className="text-xs font-bold text-[#241E1A] dark:text-[#FAF6F2] cursor-pointer"
                  >
                    تمييز الموقع بنبض بصري مستمر على الخريطة (Featured Pulsing Pin)
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-[#E5DDD3] dark:border-[#2C2420]">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2.5 rounded-xl bg-[#B24C2B] hover:bg-[#9E4F36] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>حفظ الإحداثيات في قاعدة البيانات</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="py-2.5 px-4 rounded-xl bg-[#FAF7F2] dark:bg-[#26201B] text-xs font-bold text-[#73675B] hover:text-[#241E1A] transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default AdminMapEditorPage;
