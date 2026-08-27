import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Governorate } from '../../types';
import { Store, MapPin, Star, CheckCircle2, ChevronRight, Search, Sparkles } from 'lucide-react';

const GOVERNORATES: (Governorate | 'all')[] = [
  'all',
  'أسوان',
  'الأقصر',
  'قنا',
  'سوهاج',
  'أسيوط',
  'المنيا',
  'الوادي الجديد'
];

export const SellersDirectoryPage: React.FC = () => {
  const { sellers, navigateToSeller, setActivePage } = useApp();
  const [selectedGov, setSelectedGov] = useState<Governorate | 'all'>('all');
  const [search, setSearch] = useState('');

  const filteredSellers = sellers.filter((s) => {
    const matchGov = selectedGov === 'all' || s.governorate === selectedGov;
    const matchSearch =
      search.trim() === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.brandName.toLowerCase().includes(search.toLowerCase()) ||
      s.specialty.toLowerCase().includes(search.toLowerCase()) ||
      s.governorate.toLowerCase().includes(search.toLowerCase());
    return matchGov && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#8c6b53]">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#943310] transition-colors"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="text-gray-900 font-bold">دليل ورش وشيوخ صنعة الصعيد</span>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#943310] to-[#78280a] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
            <Store className="w-3.5 h-3.5" />
            <span>حرفيو الصعيد المعتمدون</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-heritage leading-tight">
            دليل الورش والتعاونيات الحرفية
          </h1>

          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
            تواصل مباشرة مع الحرفيين وشيوخ الصنعة في أسوان والأقصر وقنا وسوهاج وأسيوط والمنيا. تسوق منتجاتهم الأصلية وادعم استمرار هذا الفن التراثي.
          </p>

          <div className="pt-2">
            <div className="relative max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث باسم الورشة، الحرفي، أو التخصص..."
                className="w-full pl-4 pr-10 py-2.5 bg-white text-gray-900 rounded-xl text-xs sm:text-sm outline-none shadow-md placeholder-gray-400 min-h-[44px]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Governorate Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {GOVERNORATES.map((gov) => (
          <button
            key={gov}
            type="button"
            onClick={() => setSelectedGov(gov)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[40px] ${
              selectedGov === gov
                ? 'bg-[#943310] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-[#ede0ca] border border-[#ebdccd]'
            }`}
          >
            {gov === 'all' ? 'جميع المحافظات' : `محافظة ${gov}`}
          </button>
        ))}
      </div>

      {/* Sellers Grid or Empty State */}
      {filteredSellers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#ebdccd] p-12 text-center my-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#f3ebd9] text-[#943310] flex items-center justify-center mx-auto">
            <Store className="w-8 h-8 opacity-70" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">لم يتم العثور على ورش مسجلة حالياً</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            باب الانضمام والاعتماد مفتوح لكافة ورش وشيوخ صنعة الصعيد. سجل ورشتك الآن لتكون من أوائل الحرفيين المعتمدين بالمنصة.
          </p>
          <button
            type="button"
            onClick={() => setActivePage('home')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#943310] hover:bg-[#7c280a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <span>العودة للرئيسية</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSellers.map((seller) => (
            <div
              key={seller.id}
              id={`directory-seller-${seller.id}`}
              onClick={() => navigateToSeller(seller.id)}
              className="clay-card bg-white rounded-2xl border border-[#ebdccd] hover:border-[#943310] overflow-hidden cursor-pointer group transition-all duration-300 flex flex-col"
            >
              {/* Cover Banner */}
              <div className="relative h-36 w-full overflow-hidden bg-[#f4ebe1]">
                <img
                  src={seller.coverImage}
                  alt={seller.brandName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 right-3">
                  <span className="bg-[#943310] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>محافظة {seller.governorate}</span>
                  </span>
                </div>
              </div>

              {/* Profile body */}
              <div className="p-5 pt-0 flex-1 flex flex-col justify-between relative">
                <div>
                  <div className="relative -mt-10 mb-3 flex items-end justify-between">
                    <div className="relative">
                      <img
                        src={seller.avatar}
                        alt={seller.name}
                        className="w-16 h-16 rounded-2xl object-cover border-3 border-white shadow-md"
                      />
                      {seller.verified && (
                        <div className="absolute -bottom-1 -left-1 bg-emerald-600 text-white rounded-full p-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-900">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{seller.rating}</span>
                      <span className="text-[10px] text-gray-400 font-normal">({seller.salesCount} مبيعة)</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#943310] transition-colors leading-tight font-heritage">
                    {seller.brandName}
                  </h3>
                  <span className="text-xs text-[#8c6b53] font-medium block mt-0.5">
                    بإشراف الصانع: {seller.name}
                  </span>

                  <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                    {seller.bio}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#f0e4d7] flex items-center justify-between text-xs">
                  <span className="text-[#943310] font-bold bg-[#faf6f0] px-2.5 py-1 rounded-md text-[11px]">
                    {seller.specialty}
                  </span>
                  <span className="text-gray-500 font-medium text-[11px]">
                    {seller.productsCount} قطعة معروضة
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
