import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { CulturalCraft } from '../../types';
import {
  Hammer,
  MapPin,
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Compass,
  ShoppingBag
} from 'lucide-react';

export const CulturalCraftsPage: React.FC = () => {
  const { navigateToCraft, navigateToGovernorate, setActivePage } = useApp();
  const [crafts, setCrafts] = useState<CulturalCraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [governorateFilter, setGovernorateFilter] = useState<string>('all');

  useEffect(() => {
    const fetchCrafts = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getCraftEncyclopedia();
        setCrafts(data);
      } catch (err) {
        console.warn('Could not load crafts:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCrafts();
  }, []);

  const governorates = Array.from(new Set(crafts.map((c) => c.governorateName || c.governorates?.[0]))).filter(Boolean) as string[];
  const categories = Array.from(new Set(crafts.map((c) => c.category || 'صناعات يدوية'))).filter(Boolean) as string[];

  const filteredCrafts = crafts.filter((craft) => {
    const govName = craft.governorateName || craft.governorates?.join(' ') || '';
    const craftCat = craft.category || 'صناعات يدوية';
    const matchesSearch =
      craft.title.includes(searchQuery) ||
      craft.shortDescription.includes(searchQuery) ||
      govName.includes(searchQuery) ||
      craft.materials.some((m) => m.includes(searchQuery));
    const matchesCategory = categoryFilter === 'all' || craftCat === categoryFilter;
    const matchesGov = governorateFilter === 'all' || (craft.governorateName || craft.governorates?.[0]) === governorateFilter;
    return matchesSearch && matchesCategory && matchesGov;
  });

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] text-[#29221D] dark:text-[#FAF6F2] py-6 sm:py-10 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#7A6F64] dark:text-[#9C8F82]">
            <button
              onClick={() => setActivePage('home')}
              className="hover:text-[#B45F42] transition-colors cursor-pointer"
            >
              الرئيسية
            </button>
            <span>/</span>
            <span className="text-[#B45F42] font-bold">موسوعة الحرف والورش التراثية</span>
          </div>

          <button
            onClick={() => setActivePage('products')}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#B45F42] hover:text-[#9E4F36] bg-[#B45F42]/10 hover:bg-[#B45F42]/20 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>تسوق منتجات الورش بالسوق</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold mb-3 border border-amber-300 dark:border-amber-800/40">
            <Hammer className="w-3.5 h-3.5" />
            <span>حرف وصناعات الأجداد الحية</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#29221D] dark:text-[#FAF6F2] font-serif tracking-tight mb-3">
            موسوعة حرف وصنائع الصعيد
          </h1>
          <p className="text-sm sm:text-base text-[#665A4F] dark:text-[#A89C90] leading-relaxed">
            من الفركة والتلي إلى الفخار القناوي وخزف النوبة وألباستر الأقصر. نوثق أسرار الصنعة، الخامات الطبيعية، وشيوخ الحرف الذين يحفظون هوية الصعيد.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-[#1E1917] rounded-2xl p-4 sm:p-5 border border-[#E8E1D9] dark:border-[#382E27] shadow-xs mb-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن حرفة، خامة، أو قرية صنع..."
                className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm text-[#29221D] dark:text-[#FAF6F2] rounded-xl pl-10 pr-4 py-2.5 border border-[#E8E1D9] dark:border-[#382E27] focus:border-[#B45F42] outline-none"
              />
              <Search className="w-4 h-4 text-[#7A6F64] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-[#B45F42] text-white'
                    : 'bg-[#FAF6F0] dark:bg-[#25201D] text-[#665A4F] dark:text-[#A89C90] hover:bg-[#E8E1D9]'
                }`}
              >
                كافة الحرف
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-[#B45F42] text-white'
                      : 'bg-[#FAF6F0] dark:bg-[#25201D] text-[#665A4F] dark:text-[#A89C90] hover:bg-[#E8E1D9]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Governorate Sub-Filter */}
          {governorates.length > 0 && (
            <div className="flex items-center gap-2 pt-3 border-t border-[#F0EAE1] dark:border-[#2D2622] overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-[#7A6F64] shrink-0">المحافظة:</span>
              <button
                onClick={() => setGovernorateFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                  governorateFilter === 'all'
                    ? 'bg-[#B45F42] text-white'
                    : 'bg-[#FAF6F0] dark:bg-[#25201D] text-[#7A6F64]'
                }`}
              >
                الكل
              </button>
              {governorates.map((gov) => (
                <button
                  key={gov}
                  onClick={() => setGovernorateFilter(gov)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                    governorateFilter === gov
                      ? 'bg-[#B45F42] text-white'
                      : 'bg-[#FAF6F0] dark:bg-[#25201D] text-[#7A6F64] hover:bg-[#E8E1D9]'
                  }`}
                >
                  {gov}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Crafts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 rounded-3xl bg-white dark:bg-[#1E1917] border border-[#E8E1D9] animate-pulse"
              />
            ))}
          </div>
        ) : filteredCrafts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
            <Hammer className="w-12 h-12 text-[#7A6F64] mx-auto mb-3" />
            <h3 className="text-lg font-bold">لم يتم العثور على حرف مطابقة</h3>
            <p className="text-xs text-[#7A6F64] mt-1">جرب تغيير شروط البحث أو الفلتر</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCrafts.map((craft) => (
              <div
                key={craft.id}
                id={`craft-card-${craft.slug}`}
                onClick={() => navigateToCraft(craft.slug)}
                className="group bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#E8E1D9] dark:bg-[#25201D]">
                  <img
                    src={craft.coverImage || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'}
                    alt={craft.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-600/90 backdrop-blur-md text-white text-[11px] font-bold">
                    {craft.category || 'حرفة يدوية أصيلة'}
                  </span>

                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                    محافظة {craft.governorateName || craft.governorates?.[0] || 'الصعيد'}
                  </span>

                  <div className="absolute bottom-3 right-3 left-3 text-white">
                    <h3 className="text-xl font-black font-serif drop-shadow-md">
                      {craft.title}
                    </h3>
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-[#665A4F] dark:text-[#A89C90] leading-relaxed mb-4 line-clamp-3">
                      {craft.shortDescription}
                    </p>

                    {/* Materials Chips */}
                    {craft.materials && craft.materials.length > 0 && (
                      <div className="mb-4">
                        <span className="text-[11px] font-bold text-[#7A6F64] block mb-1.5">
                          الخامات الطبيعية:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {craft.materials.slice(0, 3).map((mat, i) => (
                            <span
                              key={i}
                              className="text-[11px] bg-[#FAF6F0] dark:bg-[#25201D] text-[#29221D] dark:text-[#FAF6F2] px-2.5 py-0.5 rounded-lg border border-[#E8E1D9] dark:border-[#382E27]"
                            >
                              {mat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center justify-between text-[#B45F42] dark:text-[#FF855D] font-bold text-xs sm:text-sm group-hover:text-[#9E4F36]">
                    <span>أسرار الصنعة ومراحلها</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
