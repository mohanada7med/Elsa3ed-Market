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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-black/50 dark:text-white/50 font-medium">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#9a6a35] transition-colors cursor-pointer"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-black/30 dark:text-white/30" />
        <span className="font-bold">ناس الصنعة في الصعيد</span>
      </nav>

      {/* Header */}
      <div className="rounded-[2rem] bg-[#211d18] text-white dark:bg-white dark:text-black p-6 sm:p-10 shadow-xl relative overflow-hidden border border-black/10 dark:border-white/10 backdrop-blur-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-black/10 text-amber-200 dark:text-[#9a6a35] text-xs font-bold backdrop-blur-xs">
            <Store className="w-3.5 h-3.5" />
            <span>من الورشة لبيتك على طول</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-serif leading-tight">
            شيوخ الكار.. سر الصنعة وريحة بلادنا
          </h1>

          <p className="text-xs sm:text-sm text-white/75 dark:text-black/75 leading-relaxed font-sans">
            شوف شغل شيوخ الصنعة وحلاوة إيديهم في الصعيد؛ من النيل للوادي. نَقّي قطع أصيلة معمولة بحب، وخلي خير بلادنا عايش في بيتك.
          </p>

          <div className="pt-2">
            <div className="relative max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث باسم الورشة، الحرفي، أو التخصص..."
                className="w-full pl-4 pr-10 py-3 bg-white dark:bg-[#151513] text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs sm:text-sm outline-none shadow-md placeholder:text-black/40 dark:placeholder:text-white/40 min-h-[44px] border border-black/10 dark:border-white/10 focus:border-[#9a6a35] transition-colors"
              />
              <Search className="w-4 h-4 text-black/40 dark:text-white/40 absolute right-3.5 top-3.5" />
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
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[40px] cursor-pointer ${selectedGov === gov
              ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
              : 'bg-white/75 dark:bg-[#151513]/90 text-black/75 dark:text-white/75 hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 backdrop-blur-xl'
              }`}
          >
            {gov === 'all' ? 'جميع المحافظات' : `محافظة ${gov}`}
          </button>
        ))}
      </div>

      {/* Sellers Grid or Empty State */}
      {filteredSellers.length === 0 ? (
        <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-12 text-center my-6 space-y-4 shadow-lg backdrop-blur-xl">
          <div className="w-16 h-16 rounded-full bg-[#9a6a35]/10 text-[#9a6a35] flex items-center justify-center mx-auto">
            <Store className="w-8 h-8 opacity-70" />
          </div>
          <h3 className="font-bold text-lg font-serif">لم يتم العثور على ورش مطابقة للبحث</h3>
          <p className="text-xs text-black/60 dark:text-white/60 max-w-md mx-auto leading-relaxed">
            يمكنك إزالة فلتر البحث أو استعراض جميع المحافظات لرؤية باقي الحرفيين وشيوخ الصنعة.
          </p>
          <button
            type="button"
            onClick={() => { setSelectedGov('all'); setSearch(''); }}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>إعادة ضبط البحث</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredSellers.map((seller) => (
            <div
              key={seller.id}
              id={`directory-seller-${seller.id}`}
              onClick={() => navigateToSeller(seller.id)}
              className="group relative overflow-hidden rounded-[2rem] bg-white/75 dark:bg-[#151513]/90 border border-black/10 dark:border-white/10 cursor-pointer transition-all duration-500 hover:-translate-y-1.5 hover:border-[#9a6a35] hover:shadow-[0_20px_50px_rgba(154,106,53,0.12)] flex flex-col justify-between backdrop-blur-xl shadow-lg"
            >
              {/* Cover Banner */}
              <div className="relative h-36 w-full overflow-hidden bg-black/5 dark:bg-white/5">
                <img
                  src={seller.coverImage}
                  alt={seller.brandName}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/50 group-hover:via-black/20 transition-colors" />
                <div className="absolute top-3 right-3">
                  <span className="bg-[#9a6a35] text-white text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1">
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
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-[#151513] shadow-md bg-stone-100"
                      />
                      {seller.verified && (
                        <div className="absolute -bottom-1 -left-1 bg-emerald-600 text-white rounded-full p-0.5" title="حرفي موثق ومعتمد">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-2.5 py-1 rounded-xl text-xs font-bold backdrop-blur-md">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{seller.rating}</span>
                      <span className="text-[10px] text-black/40 dark:text-white/40 font-normal">({seller.salesCount} مبيعة)</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg group-hover:text-[#9a6a35] transition-colors leading-tight font-serif">
                    {seller.brandName}
                  </h3>
                  <span className="text-xs text-black/60 dark:text-white/60 font-medium block mt-0.5">
                    بإشراف الصانع: {seller.name}
                  </span>

                  <p className="text-xs text-black/65 dark:text-white/65 mt-2 line-clamp-3 leading-relaxed">
                    {seller.bio}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
                  <span className="text-[#9a6a35] font-bold bg-[#9a6a35]/10 px-2.5 py-1 rounded-lg text-[11px] border border-[#9a6a35]/30">
                    {seller.specialty}
                  </span>
                  <span className="text-black/50 dark:text-white/50 font-medium text-[11px]">
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