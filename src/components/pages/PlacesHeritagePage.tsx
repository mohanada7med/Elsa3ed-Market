import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { HeritagePlace } from '../../types';
import {
  Landmark,
  Search,
  Compass
} from 'lucide-react';
import { WAHEditorialCard } from '../../design-system/cards/WAHEditorialCard';
import { WAHEmptyState } from '../../design-system/WAHEmptyState';

const CATEGORY_MAP: Record<string, string[]> = {
  'فرعوني': ['temple', 'tomb', 'pharaonic', 'فرعوني'],
  'قبطي': ['monastery', 'coptic', 'قبطي'],
  'إسلامي': ['mosque', 'islamic', 'إسلامي'],
  'تراث شعبي': ['heritage_village', 'cultural_center', 'museum', 'folk', 'تراث شعبي'],
  'طبيعي': ['nature', 'natural', 'طبيعي']
};

const CATEGORY_LABELS: Record<string, string> = {
  temple: 'معبد فرعوني',
  tomb: 'مقابر أثرية',
  monastery: 'دير قبطي',
  mosque: 'مسجد أثري',
  museum: 'متحف قومي',
  heritage_village: 'قرية تراثية',
  nature: 'محمية طبيعية',
  cultural_center: 'مركز ثقافي',
  historical: 'معلم تاريخي'
};

export const PlacesHeritagePage: React.FC = () => {
  const { navigateToPlace, setActivePage } = useApp();
  const [places, setPlaces] = useState<HeritagePlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'فرعوني' | 'قبطي' | 'إسلامي' | 'تراث شعبي' | 'طبيعي'>('all');
  const [governorateFilter, setGovernorateFilter] = useState<string>('all');

  useEffect(() => {
    const fetchPlaces = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getPlaces();
        setPlaces(data);
      } catch (err) {
        console.warn('Could not load places:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  const governorates = Array.from(new Set(places.map((p) => p.governorateName))).filter(Boolean);

  const filteredPlaces = places.filter((place) => {
    const desc = place.shortDescription || place.description || '';
    const matchesSearch =
      place.title.includes(searchQuery) ||
      desc.includes(searchQuery) ||
      place.governorateName.includes(searchQuery);
    const matchesCategory =
      categoryFilter === 'all' ||
      place.category === categoryFilter ||
      (CATEGORY_MAP[categoryFilter] && CATEGORY_MAP[categoryFilter].includes(place.category));
    const matchesGov = governorateFilter === 'all' || place.governorateName === governorateFilter;
    return matchesSearch && matchesCategory && matchesGov;
  });

  return (
    <div className="min-h-screen bg-[var(--wah-bg,#FAF7F2)] dark:bg-[var(--wah-bg,#120E0C)] text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] py-6 sm:py-10 px-3 sm:px-6 lg:px-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] font-medium">
            <button
              onClick={() => setActivePage('home')}
              className="hover:text-[var(--wah-primary,#B24C2B)] dark:hover:text-[var(--wah-primary,#E0633C)] transition-colors cursor-pointer"
            >
              الرئيسية
            </button>
            <span>/</span>
            <span className="text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] font-bold">
              معالم وآثار صعيد مصر
            </span>
          </div>

          <button
            onClick={() => setActivePage('map')}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] hover:underline cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>عرض المعالم على الخريطة</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--wah-accent-light,#FDF3E7)] dark:bg-[var(--wah-surface-subtle,#26201B)] text-[var(--wah-accent,#D97724)] text-xs font-bold border border-[var(--wah-accent,#D97724)]/20">
            <Landmark className="w-3.5 h-3.5" />
            <span>سجل المعالم الأثرية والتاريخية</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-heritage tracking-tight">
            معالم وآثار صعيد مصر
          </h1>
          <p className="text-sm sm:text-base text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] leading-relaxed">
            توثيق تفصيلي لأعظم معابد وقلاع وأديرة ومساجد ومحميات صعيد مصر، وقصص العمارة والإبداع التي خلدها التاريخ.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-[var(--wah-surface,#1B1613)] rounded-2xl p-4 sm:p-5 border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن معبد، دير، قلعة، أو مكان..."
                className="w-full bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)] text-xs sm:text-sm text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] rounded-xl pl-10 pr-4 py-2.5 border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] focus:border-[var(--wah-primary,#B24C2B)] outline-none"
              />
              <Search className="w-4 h-4 text-[var(--wah-text-muted,#73675B)] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar">
              {(['all', 'فرعوني', 'قبطي', 'إسلامي', 'تراث شعبي', 'طبيعي'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-[var(--wah-primary,#B24C2B)] text-white shadow-xs'
                      : 'bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)] text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] hover:bg-[var(--wah-border,#E5DDD3)]'
                  }`}
                >
                  {cat === 'all' ? 'كافة العصور' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Governorate Sub-filter */}
          {governorates.length > 0 && (
            <div className="flex items-center gap-2 pt-3 border-t border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-[var(--wah-text-muted,#73675B)] shrink-0">المحافظة:</span>
              <button
                onClick={() => setGovernorateFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                  governorateFilter === 'all'
                    ? 'bg-[var(--wah-primary,#B24C2B)] text-white'
                    : 'bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)] text-[var(--wah-text-muted,#73675B)]'
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
                      ? 'bg-[var(--wah-primary,#B24C2B)] text-white'
                      : 'bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)] text-[var(--wah-text-muted,#73675B)]'
                  }`}
                >
                  {gov}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Places Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-white dark:bg-[var(--wah-surface,#1B1613)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] animate-pulse"
              />
            ))}
          </div>
        ) : filteredPlaces.length === 0 ? (
          <WAHEmptyState
            icon={<Landmark className="w-8 h-8 sm:w-10 sm:h-10" />}
            title="لم يتم العثور على معالم مطابقة"
            description="جرب البحث بكلمة أخرى أو تعديل تصنيف العصر والمحافظة."
            actionLabel="إعادة ضبط الفلاتر"
            onAction={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setGovernorateFilter('all');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPlaces.map((place) => (
              <WAHEditorialCard
                key={place.id}
                id={`place-card-${place.slug}`}
                title={place.title}
                subtitle={place.historicalEra ? `العصر: ${place.historicalEra}` : undefined}
                excerpt={place.shortDescription || place.description}
                image={place.coverImage || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800'}
                category={CATEGORY_LABELS[place.category] || place.category}
                governorate={place.governorateName}
                onClick={() => navigateToPlace(place.slug)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
