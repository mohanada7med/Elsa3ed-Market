import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import type { MediaItem } from '../../types.ts';
import { AdminMediaUploader } from '../common/AdminMediaUploader.tsx';
import {
  Image as ImageIcon,
  Search,
  Filter,
  Trash2,
  Copy,
  Check,
  Eye,
  ExternalLink,
  Plus,
  RefreshCw,
  Folder,
  Layers,
  AlertCircle,
  Loader2,
  X,
  Calendar,
  HardDrive
} from 'lucide-react';

const ENTITY_TYPE_OPTIONS = [
  { value: 'all', label: 'جميع الأنواع والأقسام' },
  { value: 'province', label: 'محافظات الصعيد (Provinces)' },
  { value: 'archaeologicalSite', label: 'المعالم والمواقع الأثرية (Sites)' },
  { value: 'craft', label: 'الحرف اليدوية والفنون (Crafts)' },
  { value: 'food', label: 'المأكولات والتراث الغذائي (Food)' },
  { value: 'story', label: 'القصص والتاريخ الشفاهي (Stories)' },
  { value: 'person', label: 'الشخصيات وحراس التراث (People)' },
  { value: 'event', label: 'المواسم والفعاليات (Events)' },
  { value: 'village', label: 'القرى التراثية (Villages)' },
  { value: 'city', label: 'المدن والمراكز (Cities)' },
  { value: 'category', label: 'أقسام السوق (Categories)' },
  { value: 'general', label: 'وسائط عامة (General)' }
];

const FOLDER_OPTIONS = [
  { value: 'all', label: 'جميع المجلدات' },
  { value: 'WAH/provinces', label: 'WAH/provinces' },
  { value: 'WAH/archaeological-sites', label: 'WAH/archaeological-sites' },
  { value: 'WAH/crafts', label: 'WAH/crafts' },
  { value: 'WAH/food', label: 'WAH/food' },
  { value: 'WAH/stories', label: 'WAH/stories' },
  { value: 'WAH/people', label: 'WAH/people' },
  { value: 'WAH/events', label: 'WAH/events' },
  { value: 'WAH/villages', label: 'WAH/villages' },
  { value: 'WAH/cities', label: 'WAH/cities' },
  { value: 'WAH/categories', label: 'WAH/categories' },
  { value: 'WAH/general', label: 'WAH/general' }
];

export const AdminMediaLibraryPage: React.FC = () => {
  const { user } = useApp();

  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState('all');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedSort, setSelectedSort] = useState<'newest' | 'oldest' | 'size_desc' | 'size_asc'>('newest');

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadEntityType, setUploadEntityType] = useState('archaeologicalSite');
  const [uploadEntitySlug, setUploadEntitySlug] = useState('');
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [copiedPublicId, setCopiedPublicId] = useState<string | null>(null);

  // Load media items from API
  const loadMedia = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.getAdminMediaList(user || {}, {
        search: searchQuery,
        entityType: selectedEntityType,
        folder: selectedFolder,
        sort: selectedSort,
        page: currentPage,
        limit: 24
      });
      setMediaList(res.items || []);
      setTotalItems(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      console.error('Failed to load media list:', err);
      setErrorMessage(err?.message || 'فشل في جلب وسائط المنصة');
    } finally {
      setIsLoading(false);
    }
  }, [user, searchQuery, selectedEntityType, selectedFolder, selectedSort, currentPage]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // Handle Delete media asset
  const handleDeleteMedia = async (item: MediaItem) => {
    if (!item.id && !item.publicId) return;
    const confirmDelete = window.confirm(
      `هل أنت متأكد من حذف هذه الصورة من Cloudinary وقاعدة البيانات؟\n${item.publicId || item.title || item.url}`
    );
    if (!confirmDelete) return;

    setDeletingItemId(item.id || item.publicId || 'current');
    try {
      await api.deleteAdminMedia(user || {}, item.id || item.publicId || item.url);
      setMediaList((prev) => prev.filter((m) => m.id !== item.id && m.publicId !== item.publicId));
      setTotalItems((prev) => Math.max(0, prev - 1));
      if (lightboxItem?.id === item.id) setLightboxItem(null);
    } catch (err: any) {
      alert(err?.message || 'فشل في حذف الصورة');
    } finally {
      setDeletingItemId(null);
    }
  };

  // Copy Public ID or URL to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPublicId(id);
    setTimeout(() => setCopiedPublicId(null), 2500);
  };

  // Format bytes to human readable size
  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return 'غير محدد';
    const k = 1024;
    const sizes = ['بايت', 'ك.ب', 'م.ب', 'ج.ب'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1A1512] text-[#2D2621] dark:text-[#E8E1D9] p-4 sm:p-6 md:p-8" dir="rtl">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8E0D5] dark:border-[#382E27]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#8E422D]/10 dark:bg-[#FF8A65]/10 text-[#8E422D] dark:text-[#FF8A65] flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black font-serif">مكتبة وسائط منصة وه</h1>
                <p className="text-xs sm:text-sm text-[#7A6E63] dark:text-[#A89D91]">
                  إدارة وتوثيق الصور السحابية على Cloudinary وتصنيفها حسب الكيانات والمحافظات
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadMedia()}
              disabled={isLoading}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#D9CFBE] dark:border-[#3D332A] bg-white dark:bg-[#251E1A] hover:bg-[#F3ECE2] text-xs sm:text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
              title="تحديث القائمة"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">تحديث</span>
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#8E422D] hover:bg-[#753422] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>رفع وسائط جديدة</span>
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8A7E72] absolute right-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="بحث بالاسم أو المعرف السحابي..."
              className="w-full min-h-[44px] pr-10 pl-4 py-2.5 rounded-xl border border-[#D9CFBE] dark:border-[#3D332A] bg-white dark:bg-[#251E1A] text-xs sm:text-sm placeholder:text-[#9C8F82] focus:outline-none focus:border-[#8E422D]"
            />
          </div>

          {/* Filter Entity Type */}
          <div>
            <select
              value={selectedEntityType}
              onChange={(e) => {
                setSelectedEntityType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D9CFBE] dark:border-[#3D332A] bg-white dark:bg-[#251E1A] text-xs sm:text-sm focus:outline-none focus:border-[#8E422D]"
            >
              {ENTITY_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Folder */}
          <div>
            <select
              value={selectedFolder}
              onChange={(e) => {
                setSelectedFolder(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D9CFBE] dark:border-[#3D332A] bg-white dark:bg-[#251E1A] text-xs sm:text-sm focus:outline-none focus:border-[#8E422D]"
            >
              {FOLDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D9CFBE] dark:border-[#3D332A] bg-white dark:bg-[#251E1A] text-xs sm:text-sm focus:outline-none focus:border-[#8E422D]"
            >
              <option value="newest">الأحدث رفعاً</option>
              <option value="oldest">الأقدم رفعاً</option>
              <option value="size_desc">الأكبر حجماً</option>
              <option value="size_asc">الأصغر حجماً</option>
            </select>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between mt-4 text-xs text-[#7A6E63] dark:text-[#A89D91]">
          <span>إجمالي الصور الموثقة: <strong className="text-[#8E422D] dark:text-[#FF8A65]">{totalItems}</strong></span>
          <span>صفحة {currentPage} من {totalPages}</span>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Media Grid */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#8E422D] animate-spin" />
            <p className="text-xs sm:text-sm text-[#7A6E63] dark:text-[#A89D91]">
              جاري فحص ومزامنة الوسائط من Cloudinary...
            </p>
          </div>
        ) : mediaList.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border-2 border-dashed border-[#D9CFBE] dark:border-[#3D332A] bg-[#FAF6F0] dark:bg-[#201A16] p-8">
            <ImageIcon className="w-12 h-12 text-[#A89D91] mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-[#2D2621] dark:text-[#E8E1D9] mb-1">
              لا توجد وسائط مسجلة في هذا التصنيف
            </h3>
            <p className="text-xs text-[#7A6E63] dark:text-[#A89D91] max-w-sm mx-auto mb-4">
              يمكنك رفع صور جديدة مباشرة وربطها بالمعالم أو الحرف أو المحافظات.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-[#8E422D] hover:bg-[#753422] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>رفع أول صورة</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaList.map((item) => {
              const url = item.secureUrl || item.url;
              return (
                <div
                  key={item.id || item.publicId || url}
                  className="rounded-2xl border border-[#E8E0D5] dark:border-[#382E27] bg-white dark:bg-[#251E1A] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video sm:aspect-4/3 bg-black/5 overflow-hidden">
                    <img
                      src={url}
                      alt={item.alt || item.title || 'وسيط تراثي'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      loading="lazy"
                    />

                    {/* Format Badge */}
                    {item.format && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono font-bold uppercase">
                        {item.format}
                      </span>
                    )}

                    {/* Cloudinary Folder Badge */}
                    {item.folder && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-[#8E422D]/90 backdrop-blur-xs text-white text-[9px] font-mono font-bold truncate max-w-[150px]">
                        {item.folder.replace('WAH/', '')}
                      </span>
                    )}

                    {/* Quick Lightbox Trigger */}
                    <button
                      onClick={() => setLightboxItem(item)}
                      className="absolute top-2 left-2 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="معاينة بالحجم الكامل"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-3 sm:p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#2D2621] dark:text-[#E8E1D9] truncate" title={item.title || item.alt}>
                        {item.title || item.alt || 'صورة تراثية'}
                      </h4>

                      {/* Dimensions and Size */}
                      <div className="flex items-center gap-3 text-[10px] sm:text-[11px] text-[#7A6E63] dark:text-[#A89D91] mt-1 font-mono" dir="ltr">
                        {item.width && item.height && (
                          <span>{item.width} × {item.height}px</span>
                        )}
                        <span>{formatBytes(item.bytes || item.sizeBytes)}</span>
                      </div>

                      {/* Public ID */}
                      {item.publicId && (
                        <div className="mt-2 flex items-center justify-between gap-1 p-1.5 rounded-lg bg-[#FAF6F0] dark:bg-[#1E1815] border border-[#E8E0D5] dark:border-[#382E27]">
                          <span className="text-[10px] font-mono text-[#7A6E63] dark:text-[#A89D91] truncate ltr" dir="ltr">
                            {item.publicId}
                          </span>
                          <button
                            onClick={() => handleCopy(item.publicId!, item.id || item.publicId!)}
                            className="p-1 text-[#8A7E72] hover:text-[#8E422D] shrink-0"
                            title="نسخ المعرف السحابي"
                          >
                            {copiedPublicId === (item.id || item.publicId) ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-2 border-t border-[#E8E0D5] dark:border-[#332A22] flex items-center justify-between gap-2 mt-2">
                      <button
                        onClick={() => handleCopy(url, `url-${item.id || item.publicId}`)}
                        className="text-[11px] font-bold text-[#8E422D] dark:text-[#FF8A65] hover:underline flex items-center gap-1"
                      >
                        {copiedPublicId === `url-${item.id || item.publicId}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>تم نسخ الرابط</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>نسخ الرابط</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteMedia(item)}
                        disabled={deletingItemId === item.id || deletingItemId === item.publicId}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all disabled:opacity-50"
                        title="حذف الصورة من السحابة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="min-h-[40px] px-4 py-2 rounded-xl border border-[#D9CFBE] dark:border-[#3D332A] bg-white dark:bg-[#251E1A] text-xs font-bold disabled:opacity-40"
            >
              السابق
            </button>
            <span className="text-xs font-bold text-[#7A6E63] dark:text-[#A89D91] px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="min-h-[40px] px-4 py-2 rounded-xl border border-[#D9CFBE] dark:border-[#3D332A] bg-white dark:bg-[#251E1A] text-xs font-bold disabled:opacity-40"
            >
              التالي
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#251E1A] rounded-2xl w-full max-w-lg border border-[#E8E0D5] dark:border-[#382E27] p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E0D5] dark:border-[#382E27] mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#8E422D]" />
                <h3 className="text-base font-bold">رفع وسائط إلى Cloudinary</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-[#8A7E72] hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Folder / Entity Selection */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-[#6B5E52] dark:text-[#A89D91] mb-1">
                  نوع الكيان التراثي المستهدف
                </label>
                <select
                  value={uploadEntityType}
                  onChange={(e) => setUploadEntityType(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#D9CFBE] dark:border-[#3D332A] bg-[#FAF6F0] dark:bg-[#1E1815] text-xs sm:text-sm"
                >
                  {ENTITY_TYPE_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6B5E52] dark:text-[#A89D91] mb-1">
                  المعرف اللطيف / الاسم (Slug)
                </label>
                <input
                  type="text"
                  value={uploadEntitySlug}
                  onChange={(e) => setUploadEntitySlug(e.target.value)}
                  placeholder="مثال: meidum-pyramid أو fayesh"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#D9CFBE] dark:border-[#3D332A] bg-[#FAF6F0] dark:bg-[#1E1815] text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Reusable Uploader */}
            <AdminMediaUploader
              entityType={uploadEntityType}
              entitySlug={uploadEntitySlug}
              multiple={true}
              onChange={() => {
                loadMedia();
              }}
              label="ملفات الصور"
              helperText="سيتم تنظيم الملفات في مسار WAH/{category}/{slug}"
            />

            <div className="mt-5 pt-4 border-t border-[#E8E0D5] dark:border-[#382E27] flex justify-end">
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  loadMedia();
                }}
                className="min-h-[44px] px-6 py-2 rounded-xl bg-[#8E422D] hover:bg-[#753422] text-white text-xs sm:text-sm font-bold"
              >
                إغلاق والعودة للمكتبة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[95vh] bg-[#1F1A16] rounded-2xl p-4 overflow-hidden flex flex-col items-center">
            <button
              type="button"
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={lightboxItem.secureUrl || lightboxItem.url}
              alt={lightboxItem.title || 'معاينة'}
              className="max-h-[75vh] w-auto object-contain rounded-xl"
            />

            <div className="w-full mt-3 p-2 text-center text-xs text-white/90 space-y-1">
              <p className="font-bold">{lightboxItem.title || lightboxItem.alt}</p>
              <p className="text-white/60 font-mono text-[11px] ltr" dir="ltr">
                {lightboxItem.publicId || lightboxItem.url}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
