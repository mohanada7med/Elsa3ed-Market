import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { CulturalCraft } from '../../types';
import {
  Hammer,
  MapPin,
  Sparkles,
  ArrowLeft,
  Share2,
  ChevronLeft,
  Layers,
  ShoppingBag,
  Info,
  ShieldCheck,
  CheckCircle2,
  Users
} from 'lucide-react';

export const CulturalCraftDetailPage: React.FC = () => {
  const {
    selectedCraftSlug,
    navigateToGovernorate,
    navigateToPerson,
    navigateToProduct,
    setActivePage,
    addToast
  } = useApp();

  const [craft, setCraft] = useState<CulturalCraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const slug = selectedCraftSlug || 'qena-pottery';

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
    const url = `${window.location.origin}/cultural-crafts?slug=${encodeURIComponent(slug)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      addToast('تم نسخ الرابط', 'تم نسخ رابط الحرفة التراثية بنجاح', 'success');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#B45F42] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-[#7A6F64]">جاري تحميل أسرار الصنعة...</p>
        </div>
      </div>
    );
  }

  if (!craft) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">الحرفة غير موجودة</h2>
          <p className="text-sm text-[#7A6F64] mb-4">لم نتمكن من العثور على بيانات هذه الحرفة</p>
          <button
            onClick={() => setActivePage('cultural-crafts')}
            className="px-5 py-2.5 rounded-xl bg-[#B45F42] text-white font-bold text-sm"
          >
            العودة لكافة الحرف
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] text-[#29221D] dark:text-[#FAF6F2] font-sans pb-16">
      {/* Hero Header */}
      <div className="relative h-[320px] sm:h-[440px] w-full bg-[#1A1614] overflow-hidden">
        <img
          src={craft.coverImage || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1600'}
          alt={craft.title}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151210] via-black/40 to-transparent" />

        {/* Top Controls */}
        <div className="absolute top-6 left-0 right-0 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActivePage('cultural-crafts')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>موسوعة الحرف</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateToGovernorate(craft.governorateId || craft.governorates?.[0] || 'qena')}
              className="px-3.5 py-2 rounded-xl bg-[#B45F42]/90 hover:bg-[#B45F42] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>محافظة {craft.governorateName || craft.governorates?.[0] || 'الصعيد'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              title="مشاركة الحرفة"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">مشاركة</span>
            </button>
          </div>
        </div>

        {/* Title Content */}
        <div className="absolute bottom-6 sm:bottom-10 right-0 left-0 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="px-3 py-1 rounded-full bg-amber-600/90 text-white text-xs font-bold">
              {craft.category}
            </span>
            {craft.preservationStatus && (
              <span className="px-3 py-1 rounded-full bg-emerald-600/90 text-white text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{craft.preservationStatus}</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-serif tracking-tight mb-2 drop-shadow-md">
            {craft.title}
          </h1>

          <p className="text-sm sm:text-base text-amber-100/90 max-w-2xl leading-relaxed drop-shadow-sm">
            {craft.shortDescription}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-8">
            {/* History Section */}
            <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] dark:border-[#382E27]">
              <h2 className="text-xl sm:text-2xl font-black font-serif text-[#29221D] dark:text-[#FAF6F2] mb-4">
                أصل وتاريخ الصنعة
              </h2>
              <div className="text-sm sm:text-base text-[#665A4F] dark:text-[#A89C90] leading-relaxed space-y-4 whitespace-pre-line font-serif">
                {craft.history || craft.shortDescription}
              </div>
            </div>

            {/* Stages of Crafting (مراحل الصنعة) */}
            {((craft.stages && craft.stages.length > 0) || (craft.manufacturingStages && craft.manufacturingStages.length > 0)) && (
              <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] dark:border-[#382E27]">
                <h3 className="text-lg sm:text-xl font-black font-serif text-[#29221D] dark:text-[#FAF6F2] mb-6">
                  مراحل الصنعة خطوة بخطوة
                </h3>
                <div className="space-y-4">
                  {(craft.stages || craft.manufacturingStages || []).map((stage, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl bg-[#FAF6F0] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] flex items-start gap-4"
                    >
                      <span className="w-8 h-8 rounded-xl bg-[#B45F42] text-white font-bold flex items-center justify-center shrink-0 text-sm">
                        {stage.stepNumber || idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-[#29221D] dark:text-[#FAF6F2] mb-1">
                          {stage.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-[#665A4F] dark:text-[#A89C90] leading-relaxed">
                          {stage.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Products in Marketplace */}
            {craft.relatedProducts && craft.relatedProducts.length > 0 && (
              <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] dark:border-[#382E27]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black font-serif text-[#29221D] dark:text-[#FAF6F2]">
                      منتجات أصيلة من هذه الحرفة بسوق وه
                    </h3>
                    <p className="text-xs text-[#7A6F64]">صُنعت بأيدي شيوخ الصنعة في {craft.governorateName || craft.governorates?.[0] || 'الصعيد'}</p>
                  </div>
                  <button
                    onClick={() => setActivePage('products')}
                    className="text-xs font-bold text-[#B45F42] hover:underline"
                  >
                    السوق بالكامل ←
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {craft.relatedProducts.map((prod: any) => (
                    <div
                      key={prod.id}
                      onClick={() => navigateToProduct(prod.id)}
                      className="group p-3 rounded-2xl bg-[#FAF6F0] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] cursor-pointer transition-all"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-[#E8E1D9]">
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400'}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h4 className="text-xs font-bold text-[#29221D] dark:text-[#FAF6F2] truncate group-hover:text-[#B45F42]">
                        {prod.title}
                      </h4>
                      <p className="text-xs font-black text-[#B45F42] mt-1">{prod.price} ج.م</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Raw Materials */}
            <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 border border-[#E8E1D9] dark:border-[#382E27]">
              <h3 className="text-base font-bold mb-3 text-[#29221D] dark:text-[#FAF6F2]">
                الخامات والمصادر الطبيعية:
              </h3>
              <div className="flex flex-wrap gap-2">
                {craft.materials?.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800/40"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Tools Used */}
            {((craft.toolsUsed && craft.toolsUsed.length > 0) || (craft.tools && craft.tools.length > 0)) && (
              <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 border border-[#E8E1D9] dark:border-[#382E27]">
                <h3 className="text-base font-bold mb-3 text-[#29221D] dark:text-[#FAF6F2]">
                  أدوات الصنعة التقليدية:
                </h3>
                <div className="space-y-2">
                  {(craft.toolsUsed || craft.tools || []).map((tool, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-medium text-[#665A4F] dark:text-[#A89C90]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B45F42]" />
                      <span>{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explore Governorate CTA */}
            <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 border border-[#E8E1D9] dark:border-[#382E27]">
              <h3 className="text-base font-bold mb-2 text-[#29221D] dark:text-[#FAF6F2]">
                معقل الصنعة
              </h3>
              <p className="text-xs text-[#7A6F64] mb-4">
                تنتشر ورش هذه الحرفة في قرى ومراكز محافظة {craft.governorateName || craft.governorates?.[0] || 'الصعيد'}.
              </p>
              <button
                type="button"
                onClick={() => navigateToGovernorate(craft.governorateId || craft.governorates?.[0] || 'qena')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#B45F42] hover:bg-[#9E4F36] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
