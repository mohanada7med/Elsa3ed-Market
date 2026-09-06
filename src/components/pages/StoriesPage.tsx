import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { WahStory } from '../../types';
import {
  BookOpen,
  Search,
  ArrowLeft
} from 'lucide-react';
import { WAHEditorialCard } from '../../design-system/cards/WAHEditorialCard';
import { WAHEmptyState } from '../../design-system/WAHEmptyState';

export const StoriesPage: React.FC = () => {
  const { navigateToStory, setActivePage } = useApp();
  const [stories, setStories] = useState<WahStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [governorateFilter, setGovernorateFilter] = useState<string>('all');

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getStories();
        setStories(data);
      } catch (err) {
        console.warn('Could not load stories:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStories();
  }, []);

  const governorates = Array.from(new Set(stories.map((s) => s.governorateName))).filter(Boolean);
  const categories = Array.from(new Set(stories.map((s) => s.category))).filter(Boolean);

  const filteredStories = stories.filter((story) => {
    const matchesSearch =
      story.title.includes(searchQuery) ||
      story.excerpt.includes(searchQuery) ||
      story.content.includes(searchQuery) ||
      story.governorateName.includes(searchQuery);
    const matchesCat = categoryFilter === 'all' || story.category === categoryFilter;
    const matchesGov = governorateFilter === 'all' || story.governorateName === governorateFilter;
    return matchesSearch && matchesCat && matchesGov;
  });

  return (
    <div className="min-h-screen bg-[var(--wah-bg,#FAF7F2)] dark:bg-[var(--wah-bg,#120E0C)] text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] py-6 sm:py-10 px-3 sm:px-6 lg:px-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb */}
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
              وه بيحكي — حكايات ومرويات الصعيد
            </span>
          </div>

          <button
            onClick={() => setActivePage('governorates')}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] hover:underline cursor-pointer"
          >
            <span>حكايات حسب المحافظة</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--wah-accent-light,#FDF3E7)] dark:bg-[var(--wah-surface-subtle,#26201B)] text-[var(--wah-accent,#D97724)] text-xs font-bold border border-[var(--wah-accent,#D97724)]/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>«وه — كل حكاية ليها أصل»</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-heritage tracking-tight">
            وه بيحكي — ذاكرة المرويات الشفاهية
          </h1>
          <p className="text-sm sm:text-base text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] leading-relaxed">
            مستودع المرويات الشفاهية، أساطير النيل والجبل، السيرة الهلالية، وقصص البطولة والحكمة التي تناقلتها أجيال الصعيد حول موائد السمر في العصاري وليالي الشتاء.
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
                placeholder="ابحث في حكايات الصعيد وأساطيره..."
                className="w-full bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)] text-xs sm:text-sm text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] rounded-xl pl-10 pr-4 py-2.5 border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] focus:border-[var(--wah-primary,#B24C2B)] outline-none"
              />
              <Search className="w-4 h-4 text-[var(--wah-text-muted,#73675B)] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-[var(--wah-primary,#B24C2B)] text-white shadow-xs'
                    : 'bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)] text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] hover:bg-[var(--wah-border,#E5DDD3)]'
                }`}
              >
                كافة الحكايات
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-[var(--wah-primary,#B24C2B)] text-white shadow-xs'
                      : 'bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)] text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] hover:bg-[var(--wah-border,#E5DDD3)]'
                  }`}
                >
                  {cat}
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

        {/* Stories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-72 rounded-3xl bg-white dark:bg-[var(--wah-surface,#1B1613)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] animate-pulse"
              />
            ))}
          </div>
        ) : filteredStories.length === 0 ? (
          <WAHEmptyState
            icon={<BookOpen className="w-8 h-8 sm:w-10 sm:h-10" />}
            title="لم يتم العثور على حكايات مطابقة"
            description="جرب البحث بكلمات أخرى أو تغيير تصنيف الحكاية لاستكشاف مرويات الصعيد."
            actionLabel="إعادة ضبط الفلاتر"
            onAction={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setGovernorateFilter('all');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {filteredStories.map((story) => (
              <WAHEditorialCard
                key={story.id}
                id={`story-card-${story.slug}`}
                title={story.title}
                subtitle={story.narrator ? `عن الراوي: ${story.narrator}` : undefined}
                excerpt={story.excerpt || story.content}
                image={story.coverImage || 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=800'}
                category={story.category}
                governorate={story.governorateName}
                onClick={() => navigateToStory(story.slug)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
