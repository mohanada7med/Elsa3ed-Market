import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { CulturalCraft } from '../../types';
import { VisitorMediaGallery } from '../common/VisitorMediaGallery';
import {
  MapPin,
  ArrowLeft,
  Share2,
  ChevronLeft,
  ShieldCheck,
} from 'lucide-react';

export const CulturalCraftDetailPage: React.FC = () => {
  const {
    selectedCraftSlug,
    navigateToGovernorate,
    navigateToProduct,
    setActivePage,
    addToast
  } = useApp();

  const [craft, setCraft] = useState<CulturalCraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const slug =
    selectedCraftSlug ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/cultural-crafts/')
      ? decodeURIComponent(window.location.pathname.split('/')[2] || '')
      : null) ||
    'qena-pottery';

  useEffect(() => {
    const fetchCraft = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getCraftBySlug(slug);
        if (data) {
          setCraft(data);
        }
      } catch (err) {
        console.warn('Could not load craft details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCraft();
  }, [slug]);

  const handleShare = () => {
    const url = `${window.location.origin}/cultural-crafts/${encodeURIComponent(slug)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      addToast('تم نسخ الرابط', 'تم نسخ رابط الحرفة التراثية بنجاح', 'success');
    }
  };

  if (isLoading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#eee8dc] dark:bg-[#0b0b0a] flex items-center justify-center p-6 text-[#211d18] dark:text-[#f5f0e7]"
      >
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#9a6a35] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold">جاري تحميل أسرار الصنعة...</p>
        </div>
      </div>
    );
  }

  if (!craft) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#eee8dc] dark:bg-[#0b0b0a] flex items-center justify-center p-6 text-center text-[#211d18] dark:text-[#f5f0e7]"
      >
        <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-10 max-w-md w-full shadow-lg space-y-4">
          <h2 className="text-2xl font-black font-serif">الحرفة غير موجودة</h2>
          <p className="text-sm text-[#211d18]/70 dark:text-[#f5f0e7]/70">لم نتمكن من العثور على بيانات هذه الحرفة</p>
          <button
            type="button"
            onClick={() => setActivePage('cultural-crafts')}
            className="w-full py-3.5 rounded-[1.25rem] bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] font-black text-xs transition-colors cursor-pointer shadow-md"
          >
            العودة لكافة الحرف
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#eee8dc] dark:bg-[#0b0b0a] text-[#211d18] dark:text-[#f5f0e7] pb-16"
    >
      {/* Hero Header */}
      <div className="relative h-[340px] sm:h-[460px] w-full bg-stone-950 overflow-hidden">
        <img
          src={craft.coverImage || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1600'}
          alt={craft.title}
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0a] via-black/40 to-transparent" />

        {/* Top Controls */}
        <div className="absolute top-6 left-0 right-0 px-5 sm:px-8 max-w-[1600px] mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActivePage('cultural-crafts')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>موسوعة الحرف</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateToGovernorate(craft.governorateId || craft.governorates?.[0] || 'qena')}
              className="px-4 py-2 rounded-full bg-[#9a6a35] hover:bg-[#7d5427] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>محافظة {craft.governorateName || (craft.governorates && craft.governorates.length > 0 ? craft.governorates.join('، ') : 'الصعيد')}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 sm:px-3.5 sm:py-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="مشاركة الحرفة"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">مشاركة</span>
            </button>
          </div>
        </div>

        {/* Title Content */}
        <div className="absolute bottom-6 sm:bottom-10 right-0 left-0 px-5 sm:px-8 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="px-3.5 py-1 rounded-full bg-[#9a6a35] text-white text-xs font-bold shadow-md">
              {craft.category}
            </span>
            {craft.preservationStatus && (
              <span className="px-3.5 py-1 rounded-full bg-emerald-600/90 text-white text-xs font-bold flex items-center gap-1 shadow-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{craft.preservationStatus}</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-serif tracking-tight mb-2 drop-shadow-md">
            {craft.title}
          </h1>

          <p className="text-sm sm:text-base text-amber-100/90 max-w-2xl leading-relaxed drop-shadow-sm font-light">
            {craft.shortDescription}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-8">
            {/* History Section */}
            <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-black/10 dark:border-white/10 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-black font-serif text-[#211d18] dark:text-[#f5f0e7] mb-4">
                أصل وتاريخ الصنعة
              </h2>
              <div className="text-sm sm:text-base text-[#211d18]/80 dark:text-[#f5f0e7]/80 leading-relaxed space-y-4 whitespace-pre-line font-serif">
                {craft.history || craft.shortDescription}
              </div>
            </div>

            {/* Stages of Crafting */}
            {((craft.stages && craft.stages.length > 0) || (craft.manufacturingStages && craft.manufacturingStages.length > 0)) && (
              <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-black/10 dark:border-white/10 shadow-lg">
                <h3 className="text-lg sm:text-xl font-black font-serif text-[#211d18] dark:text-[#f5f0e7] mb-6">
                  مراحل الصنعة خطوة بخطوة
                </h3>
                <div className="space-y-4">
                  {(craft.stages || craft.manufacturingStages || []).map((stage, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-[1.25rem] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-start gap-4"
                    >
                      <span className="w-8 h-8 rounded-xl bg-[#9a6a35] text-white font-bold flex items-center justify-center shrink-0 text-sm">
                        {stage.stepNumber || idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm sm:text-base font-black font-serif text-[#211d18] dark:text-[#f5f0e7] mb-1">
                          {stage.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-[#211d18]/70 dark:text-[#f5f0e7]/70 leading-relaxed">
                          {stage.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visitor Media Gallery & Video Showcase */}
            <VisitorMediaGallery
              title={`معرض صور وتوثيق حرفة ${craft.title}`}
              entityType="cultural-craft"
              entityId={craft.id || craft.slug}
              entitySlug={craft.slug}
              entityTitle={craft.title}
              coverImage={craft.coverImage}
              gallery={(craft.gallery && craft.gallery.length > 0) ? craft.gallery : []}
              videoUrl={(craft as any).videoUrl}
              videos={(craft as any).videos || []}
              onGalleryChange={(updatedGallery) => {
                setCraft((prev) => prev ? { ...prev, gallery: updatedGallery } : null);
              }}
              onCoverChange={(newCover) => {
                setCraft((prev) => prev ? { ...prev, coverImage: newCover } : null);
              }}
              onVideoChange={(newVideo, updatedVideos) => {
                setCraft((prev) => prev ? { ...prev, videoUrl: newVideo || undefined, videos: updatedVideos } as any : null);
              }}
            />

            {/* Available Products in Marketplace */}
            {craft.relatedProducts && craft.relatedProducts.length > 0 && (
              <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-black/10 dark:border-white/10 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black font-serif text-[#211d18] dark:text-[#f5f0e7]">
                      منتجات أصيلة من هذه الحرفة بسوق وه
                    </h3>
                    <p className="text-xs text-[#211d18]/60 dark:text-[#f5f0e7]/60">صُنعت بأيدي شيوخ الصنعة في {craft.governorateName || craft.governorates?.[0] || 'الصعيد'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePage('products')}
                    className="text-xs font-bold text-[#9a6a35] dark:text-[#d5a56d] hover:underline cursor-pointer"
                  >
                    السوق بالكامل ←
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {craft.relatedProducts.map((prod: any) => (
                    <div
                      key={prod.id}
                      onClick={() => navigateToProduct(prod.id)}
                      className="group p-3 rounded-[1.25rem] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-[#9a6a35] cursor-pointer transition-all"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-black/10">
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400'}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h4 className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] truncate group-hover:text-[#9a6a35]">
                        {prod.title}
                      </h4>
                      <p className="text-xs font-black text-[#9a6a35] dark:text-[#d5a56d] mt-1">{prod.price} ج.م</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Raw Materials */}
            <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] p-6 border border-black/10 dark:border-white/10 shadow-lg">
              <h3 className="text-base font-black font-serif mb-3 text-[#211d18] dark:text-[#f5f0e7]">
                الخامات والمصادر الطبيعية:
              </h3>
              <div className="flex flex-wrap gap-2">
                {craft.materials?.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d] text-xs font-bold border border-[#9a6a35]/25"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Tools Used */}
            {((craft.toolsUsed && craft.toolsUsed.length > 0) || (craft.tools && craft.tools.length > 0)) && (
              <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] p-6 border border-black/10 dark:border-white/10 shadow-lg">
                <h3 className="text-base font-black font-serif mb-3 text-[#211d18] dark:text-[#f5f0e7]">
                  أدوات الصنعة التقليدية:
                </h3>
                <div className="space-y-2">
                  {(craft.toolsUsed || craft.tools || []).map((tool, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-medium text-[#211d18]/80 dark:text-[#f5f0e7]/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#9a6a35]" />
                      <span>{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explore Governorate CTA */}
            <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] p-6 border border-black/10 dark:border-white/10 shadow-lg">
              <h3 className="text-base font-black font-serif mb-2 text-[#211d18] dark:text-[#f5f0e7]">
                معقل الصنعة
              </h3>
              <p className="text-xs text-[#211d18]/60 dark:text-[#f5f0e7]/60 mb-4">
                تنتشر ورش هذه الحرفة في قرى ومراكز محافظة {craft.governorateName || craft.governorates?.[0] || 'الصعيد'}.
              </p>
              <button
                type="button"
                onClick={() => navigateToGovernorate(craft.governorateId || craft.governorates?.[0] || 'qena')}
                className="w-full py-3 px-4 rounded-[1.25rem] bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <span>دليل محافظة {craft.governorateName || craft.governorates?.[0] || 'الصعيد'}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
