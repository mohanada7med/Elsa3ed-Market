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
  ArrowLeft,
  Sparkles,
  Layers
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
        navigateToProduct(item.slug);
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
      default:
        return Sparkles;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] text-[#29221D] dark:text-[#FAF6F2] py-6 sm:py-10 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header Search Input */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-2xl sm:text-4xl font-black font-serif mb-3">
            البحث الشامل في منصة وه
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6F64] mb-6">
            ابحث في كافة معالم، محافظات، حكايات، حرف، أكلات، ناس، ومنتجات صعيد مصر
          </p>

          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="اكتب ما تبحث عنه (مثال: فخار، قنا، دندرة، تلي، فايش، حكاية)..."
              className="w-full bg-white dark:bg-[#1E1917] text-sm sm:text-base rounded-2xl pl-12 pr-5 py-3.5 sm:py-4 border-2 border-[#E8E1D9] dark:border-[#382E27] focus:border-[#B45F42] shadow-sm outline-none transition-all text-[#29221D] dark:text-[#FAF6F2]"
              autoFocus
            />
            <Search className="w-5 h-5 text-[#B45F42] absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Filter Pills */}
        {results.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 flex-wrap mb-8">
            <button
              onClick={() => setActiveTypeFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTypeFilter === 'all'
                  ? 'bg-[#B45F42] text-white'
                  : 'bg-white dark:bg-[#1E1917] text-[#665A4F] border border-[#E8E1D9] dark:border-[#382E27]'
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
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    activeTypeFilter === type
                      ? 'bg-[#B45F42] text-white'
                      : 'bg-white dark:bg-[#1E1917] text-[#665A4F] border border-[#E8E1D9] dark:border-[#382E27]'
                  }`}
                >
                  {sample?.typeLabel || type} ({typesCount[type]})
                </button>
              );
            })}
          </div>
        )}

        {/* Results Stream */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-white dark:bg-[#1E1917] border border-[#E8E1D9] animate-pulse"
              />
            ))}
          </div>
        ) : !searchQuery.trim() ? (
          <div className="text-center py-16 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
            <Search className="w-12 h-12 text-[#7A6F64] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#29221D] dark:text-[#FAF6F2]">
              ابدأ بكتابة أي كلمة للبحث في المنصة
            </h3>
            <p className="text-xs text-[#7A6F64] mt-1">
              جرب البحث عن أسماء المحافظات، المعالم، أو شيوخ الصنعة
            </p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
            <Sparkles className="w-12 h-12 text-[#7A6F64] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#29221D] dark:text-[#FAF6F2]">
              لم نعثر على نتائج مطابقة لـ «{searchQuery}»
            </h3>
            <p className="text-xs text-[#7A6F64] mt-1">
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
                  className="group bg-white dark:bg-[#1E1917] rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer shadow-xs hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-[#E8E1D9] shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF6F0] dark:bg-[#25201D] text-[#B45F42] border border-[#E8E1D9] dark:border-[#382E27]">
                          {item.typeLabel}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-[#29221D] dark:text-[#FAF6F2] group-hover:text-[#B45F42] transition-colors truncate">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-xs text-[#7A6F64] dark:text-[#A89C90] truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#B45F42] shrink-0">
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
  );
};
