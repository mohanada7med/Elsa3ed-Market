import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { WahSearchResult } from '../../types';
import {
  Search,
  MapPin,
  Landmark,
  Hammer,
  BookOpen,
  Users,
  Utensils,
  Calendar,
  ShoppingBag,
  Store,
  ArrowLeft,
  Sparkles,
  X
} from 'lucide-react';

export const GlobalSearchResultsPage: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    navigateToGovernorate,
    navigateToPlace,
    navigateToCraft,
    navigateToStory,
    navigateToPerson,
    navigateToFood,
    navigateToEvent,
    navigateToProduct,
    navigateToSeller,
    setActivePage
  } = useApp();

  const [results, setResults] = useState<WahSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');

  useEffect(() => {
    const runSearch = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await wahApi.globalSearch(searchQuery);
        setResults(data);
      } catch (err) {
        console.warn('Search failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      runSearch();
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleResultClick = (item: WahSearchResult) => {
    switch (item.type) {
      case 'governorate':
        navigateToGovernorate(item.slug);
        break;
      case 'place':
        navigateToPlace(item.slug);
        break;
      case 'craft':
        navigateToCraft(item.slug);
        break;
      case 'story':
        navigateToStory(item.slug);
        break;
      case 'person':
        navigateToPerson(item.slug);
        break;
      case 'food':
        navigateToFood(item.slug);
        break;
      case 'event':
        navigateToEvent(item.slug);
        break;
      case 'product':
        navigateToProduct(item.id || item.slug);
        break;
      case 'seller':
        navigateToSeller(item.id || item.slug);
        break;
      default:
        setActivePage('home');
    }
  };

  const typesCount = results.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredResults = results.filter((r) => {
    if (activeTypeFilter === 'all') return true;
    return r.type === activeTypeFilter;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'governorate':
        return MapPin;
      case 'place':
        return Landmark;
      case 'craft':
        return Hammer;
      case 'story':
        return BookOpen;
      case 'person':
        return Users;
      case 'food':
        return Utensils;
      case 'event':
        return Calendar;
      case 'product':
        return ShoppingBag;
      case 'seller':
        return Store;
      default:
        return Sparkles;
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#eee8dc] text-[#211d18] dark:bg-[#0b0b0a] dark:text-[#f5f0e7] transition-colors duration-500 py-8 sm:py-12"
    >
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header Search Input */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-[#151513]/90 border border-black/10 dark:border-white/10 text-xs font-bold text-[#9a6a35] shadow-xs mb-3 backdrop-blur-xl">
            <Sparkles size={13} />
            <span>محرّك بحث التراث الصعيدي</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-serif mb-3 tracking-tight">
            البحث الشامل في منصة <span className="text-[#9a6a35]">وَه</span>
          </h1>
          <p className="text-xs sm:text-sm text-black/60 dark:text-white/60 mb-6 font-medium">
            ابحث في كافة معالم، محافظات، حكايات، حرف، أكلات، ناس، ومنتجات صعيد مصر
          </p>

          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="اكتب ما تبحث عنه (مثال: فخار، قنا، دندرة، تلي، فايش، حكاية)..."
              className="w-full bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl text-sm sm:text-base rounded-[1.5rem] pr-12 pl-12 py-4 border border-black/10 dark:border-white/10 focus:border-[#9a6a35] shadow-lg outline-none transition-all text-[#211d18] dark:text-[#f5f0e7] placeholder:text-black/35 dark:placeholder:text-white/35"
              autoFocus
            />
            <Search className="w-5 h-5 text-[#9a6a35] absolute right-4 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-black/40 dark:text-white/40 cursor-pointer transition-colors"
                aria-label="مسح البحث"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        {results.length > 0 && (
          <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
            <button
              onClick={() => setActiveTypeFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTypeFilter === 'all'
                  ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
                  : 'bg-white/75 dark:bg-[#151513]/90 text-black/70 dark:text-white/70 border border-black/10 dark:border-white/10 hover:border-[#9a6a35]'
              }`}
            >
              الكل ({results.length})
            </button>
            {Object.keys(typesCount).map((type) => {
              const sample = results.find((r) => r.type === type);
              return (
                <button
                  key={type}
                  onClick={() => setActiveTypeFilter(type)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTypeFilter === type
                      ? 'bg-[#9a6a35] text-white shadow-md'
                      : 'bg-white/75 dark:bg-[#151513]/90 text-black/70 dark:text-white/70 border border-black/10 dark:border-white/10 hover:border-[#9a6a35]'
                  }`}
                >
                  {sample?.typeLabel || type} ({typesCount[type]})
                </button>
              );
            })}
          </div>
        )}

        {/* Results Stream */}
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-[1.5rem] bg-white/50 dark:bg-[#151513]/50 border border-black/10 dark:border-white/10 animate-pulse"
                />
              ))}
            </div>
          ) : !searchQuery.trim() ? (
            <div className="text-center py-20 bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-lg">
              <div className="w-16 h-16 rounded-2xl bg-[#9a6a35]/10 text-[#9a6a35] flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-[#211d18] dark:text-[#f5f0e7]">
                ابدأ بكتابة أي كلمة للبحث في المنصة
              </h3>
              <p className="text-xs text-black/60 dark:text-white/60 mt-1 font-medium">
                جرب البحث عن أسماء المحافظات، المعالم، أو شيوخ الصنعة
              </p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-20 bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-lg">
              <div className="w-16 h-16 rounded-2xl bg-[#9a6a35]/10 text-[#9a6a35] flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-[#211d18] dark:text-[#f5f0e7]">
                لم نعثر على نتائج مطابقة لـ «{searchQuery}»
              </h3>
              <p className="text-xs text-black/60 dark:text-white/60 mt-1 font-medium">
                تأكد من كتابة الكلمة بشكل صحيح أو جرب كلمة بحث أخرى
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResults.map((item) => {
                const Icon = getIcon(item.type);
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleResultClick(item)}
                    className="group bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[1.5rem] border border-black/10 dark:border-white/10 hover:border-[#9a6a35] p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer shadow-md hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {item.coverImage ? (
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-black/10 dark:border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#9a6a35]/10 text-[#9a6a35] flex items-center justify-center shrink-0">
                          <Icon className="w-6 h-6" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#9a6a35]/10 text-[#9a6a35] border border-[#9a6a35]/20">
                            {item.typeLabel}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-black text-[#211d18] dark:text-[#f5f0e7] group-hover:text-[#9a6a35] transition-colors truncate">
                          {item.title}
                        </h3>
                        {item.subtitle && (
                          <p className="text-xs text-black/60 dark:text-white/60 truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-black text-[#9a6a35] shrink-0">
                      <span className="hidden sm:inline">استكشف</span>
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchResultsPage;
