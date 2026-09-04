import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { CulturalEvent } from '../../types';
import {
  Calendar,
  MapPin,
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
  Clock,
  ExternalLink
} from 'lucide-react';

export const EventsPage: React.FC = () => {
  const { navigateToEvent, navigateToGovernorate, setActivePage } = useApp();
  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [governorateFilter, setGovernorateFilter] = useState<string>('all');

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getEvents();
        setEvents(data);
      } catch (err) {
        console.warn('Could not load events:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const governorates = Array.from(new Set(events.map((e) => e.governorateName))).filter(Boolean);
  const categories = Array.from(new Set(events.map((e) => e.category))).filter(Boolean);

  const filteredEvents = events.filter((event) => {
    const loc = event.location || event.locationName || '';
    const matchesSearch =
      event.title.includes(searchQuery) ||
      event.description.includes(searchQuery) ||
      event.governorateName.includes(searchQuery) ||
      loc.includes(searchQuery);
    const matchesCat = categoryFilter === 'all' || event.category === categoryFilter;
    const matchesGov = governorateFilter === 'all' || event.governorateName === governorateFilter;
    return matchesSearch && matchesCat && matchesGov;
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
            <span className="text-[#B45F42] font-bold">فعاليات ومواسم صعيد مصر</span>
          </div>

          <button
            onClick={() => setActivePage('governorates')}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#B45F42] hover:text-[#9E4F36] bg-[#B45F42]/10 hover:bg-[#B45F42]/20 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <span>فعاليات حسب المحافظة</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold mb-3 border border-amber-300 dark:border-amber-800/40">
            <Calendar className="w-3.5 h-3.5" />
            <span>أجندة الاحتفالات والمواسم الشعبية</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#29221D] dark:text-[#FAF6F2] font-serif tracking-tight mb-3">
            فعاليات ومواسم الصعيد
          </h1>
          <p className="text-sm sm:text-base text-[#665A4F] dark:text-[#A89C90] leading-relaxed">
            مواعيد وأسرار الموالد الصوفية التاريخية، مواسم حصاد القصب وتصنيع العسل، مهرجانات التمور، ومعارض الحرف التراثية في كل قرية ومدينة.
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
                placeholder="ابحث عن مولد، موسم حصاد، أو معرض..."
                className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm text-[#29221D] dark:text-[#FAF6F2] rounded-xl pl-10 pr-4 py-2.5 border border-[#E8E1D9] dark:border-[#382E27] focus:border-[#B45F42] outline-none"
              />
              <Search className="w-4 h-4 text-[#7A6F64] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-[#B45F42] text-white'
                    : 'bg-[#FAF6F0] dark:bg-[#25201D] text-[#665A4F] dark:text-[#A89C90] hover:bg-[#E8E1D9]'
                }`}
              >
                كافة الفعاليات
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

          {/* Governorate Sub-filter */}
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

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-white dark:bg-[#1E1917] border border-[#E8E1D9] animate-pulse"
              />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
            <Calendar className="w-12 h-12 text-[#7A6F64] mx-auto mb-3" />
            <h3 className="text-lg font-bold">لم يتم العثور على فعاليات مطابقة</h3>
            <p className="text-xs text-[#7A6F64] mt-1">جرب تغيير شروط البحث أو الفلتر</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                id={`event-card-${event.slug}`}
                onClick={() => navigateToEvent(event.slug)}
                className="group bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] p-6 sm:p-8 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                      {event.category}
                    </span>
                    <span className="text-xs text-[#7A6F64] flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-[#B45F42]" />
                      <span>{event.location || event.locationName} • {event.governorateName}</span>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black font-serif text-[#29221D] dark:text-[#FAF6F2] group-hover:text-[#B45F42] transition-colors mb-2">
                    {event.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs font-bold text-[#B45F42] mb-3">
                    <Clock className="w-3.5 h-3.5" />
                    <span>الموسم: {event.timeOfYear || event.startDate}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#665A4F] dark:text-[#A89C90] leading-relaxed line-clamp-3">
                    {event.description}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center justify-between text-[#B45F42] dark:text-[#FF855D] font-bold text-xs sm:text-sm group-hover:text-[#9E4F36]">
                  <span>تفاصيل الفعالية وطقوسها</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
