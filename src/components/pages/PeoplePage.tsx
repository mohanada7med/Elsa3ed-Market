import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { LocalPerson } from '../../types';
import {
  Users,
  MapPin,
  Search,
  Filter,
  ArrowLeft,
  Award,
  Sparkles,
  Hammer
} from 'lucide-react';

export const PeoplePage: React.FC = () => {
  const { navigateToPerson, navigateToGovernorate, setActivePage } = useApp();
  const [people, setPeople] = useState<LocalPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [governorateFilter, setGovernorateFilter] = useState<string>('all');

  useEffect(() => {
    const fetchPeople = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getPeople();
        setPeople(data);
      } catch (err) {
        console.warn('Could not load people:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPeople();
  }, []);

  const governorates = Array.from(new Set(people.map((p) => p.governorateName))).filter(Boolean);

  const filteredPeople = people.filter((person) => {
    const role = person.craftTitle || person.craftOrSkill || person.titleOrRole || '';
    const bioText = person.bio || person.biography || '';
    const matchesSearch =
      person.name.includes(searchQuery) ||
      role.includes(searchQuery) ||
      bioText.includes(searchQuery) ||
      person.governorateName.includes(searchQuery);
    const matchesGov = governorateFilter === 'all' || person.governorateName === governorateFilter;
    return matchesSearch && matchesGov;
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
            <span className="text-[#B45F42] font-bold">ناس الصعيد وشيوخ الصنعة</span>
          </div>

          <button
            onClick={() => setActivePage('cultural-crafts')}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#B45F42] hover:text-[#9E4F36] bg-[#B45F42]/10 hover:bg-[#B45F42]/20 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <Hammer className="w-4 h-4" />
            <span>موسوعة الحرف</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold mb-3 border border-amber-300 dark:border-amber-800/40">
            <Users className="w-3.5 h-3.5" />
            <span>حراس التراث وذاكرة الأجداد</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#29221D] dark:text-[#FAF6F2] font-serif tracking-tight mb-3">
            ناس الصعيد
          </h1>
          <p className="text-sm sm:text-base text-[#665A4F] dark:text-[#A89C90] leading-relaxed">
            توثيق مسيرات شيوخ الصنائع، الرواة، والفنانين التلقائيين الذين ورثوا أسرار الصنعة كابراً عن كابر وحافظوا على أصالة الصعيد لقرون.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-[#1E1917] rounded-2xl p-4 sm:p-5 border border-[#E8E1D9] dark:border-[#382E27] shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن شيخ صنعة، حرفي، أو راوٍ..."
              className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm text-[#29221D] dark:text-[#FAF6F2] rounded-xl pl-10 pr-4 py-2.5 border border-[#E8E1D9] dark:border-[#382E27] focus:border-[#B45F42] outline-none"
            />
            <Search className="w-4 h-4 text-[#7A6F64] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Governorate Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar">
            <button
              onClick={() => setGovernorateFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                governorateFilter === 'all'
                  ? 'bg-[#B45F42] text-white'
                  : 'bg-[#FAF6F0] dark:bg-[#25201D] text-[#665A4F] dark:text-[#A89C90] hover:bg-[#E8E1D9]'
              }`}
            >
              كافة المحافظات
            </button>
            {governorates.map((gov) => (
              <button
                key={gov}
                onClick={() => setGovernorateFilter(gov)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  governorateFilter === gov
                    ? 'bg-[#B45F42] text-white'
                    : 'bg-[#FAF6F0] dark:bg-[#25201D] text-[#665A4F] dark:text-[#A89C90] hover:bg-[#E8E1D9]'
                }`}
              >
                {gov}
              </button>
            ))}
          </div>
        </div>

        {/* People Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 rounded-3xl bg-white dark:bg-[#1E1917] border border-[#E8E1D9] animate-pulse"
              />
            ))}
          </div>
        ) : filteredPeople.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27]">
            <Users className="w-12 h-12 text-[#7A6F64] mx-auto mb-3" />
            <h3 className="text-lg font-bold">لم يتم العثور على شخصيات مطابقة</h3>
            <p className="text-xs text-[#7A6F64] mt-1">جرب تغيير كلمات البحث أو المحافظة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPeople.map((person) => (
              <div
                key={person.id}
                id={`person-card-${person.slug}`}
                onClick={() => navigateToPerson(person.slug)}
                className="group bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={person.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'}
                      alt={person.name}
                      className="w-18 h-18 rounded-2xl object-cover border-2 border-[#E8E1D9] dark:border-[#382E27] group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <span className="text-[11px] font-bold text-[#B45F42] bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40 inline-block mb-1">
                        {person.craftTitle}
                      </span>
                      <h3 className="text-lg font-bold font-serif text-[#29221D] dark:text-[#FAF6F2] group-hover:text-[#B45F42] transition-colors">
                        {person.name}
                      </h3>
                      <p className="text-xs text-[#7A6F64] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#B45F42]" />
                        <span>محافظة {person.governorateName}</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#665A4F] dark:text-[#A89C90] leading-relaxed line-clamp-3 mb-4">
                    {person.bio}
                  </p>

                  {person.yearsOfExperience && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7A6F64] mb-2">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>خبرة تمتد لأكثر من {person.yearsOfExperience} عاماً</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-2 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center justify-between text-[#B45F42] dark:text-[#FF855D] font-bold text-xs sm:text-sm group-hover:text-[#9E4F36]">
                  <span>السيرة الكاملة والمقتنيات</span>
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
