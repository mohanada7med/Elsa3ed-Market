import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { LocalPerson } from '../../types';
import {
  Users,
  MapPin,
  Search,
  ArrowLeft,
  ArrowUpLeft,
  Award,
  Sparkles,
  Hammer,
  ChevronDown,
  X,
  Compass,
  Plus,
  CheckCircle2,
  Quote,
  BookOpen,
  Heart
} from 'lucide-react';

export const PeoplePage: React.FC = () => {
  const { navigateToPerson, setActivePage } = useApp();
  const [people, setPeople] = useState<LocalPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [governorateFilter, setGovernorateFilter] = useState<string>('all');

  // Modal State for adding Upper Egypt figures
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    governorateName: 'قنا',
    villageOrOrigin: '',
    craftTitle: '',
    biography: '',
    anecdote: '',
    famousWork: '',
    quote: '',
    avatarUrl: ''
  });

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

  const handleContributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setSubmitError('لازم تكتب اسم الشخصية أو الرمز الصعيدي يا غالي!');
      return;
    }
    if (!formData.biography.trim()) {
      setSubmitError('احكي لنا كلمتين بالعامية عن سيرته وحكايته!');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const govIdMap: Record<string, string> = {
      'قنا': 'gov-qena',
      'الأقصر': 'gov-luxor',
      'أسوان': 'gov-aswan',
      'سوهاج': 'gov-sohag',
      'أسيوط': 'gov-asyut',
      'المنيا': 'gov-minya',
      'بني سويف': 'gov-beni-suef',
      'الفيوم': 'gov-fayoum',
      'الوادي الجديد': 'gov-new-valley',
      'البحر الأحمر': 'gov-red-sea'
    };

    const newPersonPayload: Partial<LocalPerson> = {
      name: formData.name.trim(),
      governorateName: formData.governorateName,
      governorateId: govIdMap[formData.governorateName] || 'gov-qena',
      villageOrOrigin: formData.villageOrOrigin.trim(),
      originVillage: formData.villageOrOrigin.trim(),
      craftTitle: formData.craftTitle.trim() || 'رمز وعلم صعيدي أصيل',
      craftOrSkill: formData.craftTitle.trim() || 'رمز وعلم صعيدي أصيل',
      titleOrRole: formData.craftTitle.trim() || 'رمز وعلم صعيدي أصيل',
      biography: formData.biography.trim(),
      bio: formData.biography.trim(),
      quote: formData.quote.trim() || undefined,
      avatarUrl: formData.avatarUrl.trim() || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
      photoUrl: formData.avatarUrl.trim() || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
      yearsOfExperience: 35,
      isFeatured: true,
      status: 'approved',
      verificationStatus: 'verified',
      sourceName: 'توثيق مجتمعي شعبي - أبناء الصعيد',
      sourceType: 'community',
      historicalAnecdotes: formData.anecdote.trim()
        ? [{ title: 'موقف صعيدي أصيل لا يُنسى', story: formData.anecdote.trim() }]
        : undefined,
      famousWorks: formData.famousWork.trim()
        ? [{ title: formData.famousWork.trim(), type: 'بصمة وأثر خالد' }]
        : undefined
    };

    try {
      const saved = await wahApi.contributePerson(newPersonPayload);
      setPeople((prev) => [saved, ...prev]);
      setSubmitSuccess('تسلم إيدك يا غالي.. سيرة العلم ده اتسجلت فخر لكل أهل الصعيد ومحفوظة في الداتا بيز!');
      setTimeout(() => {
        setIsAddModalOpen(false);
        setSubmitSuccess(null);
        setFormData({
          name: '',
          governorateName: 'قنا',
          villageOrOrigin: '',
          craftTitle: '',
          biography: '',
          anecdote: '',
          famousWork: '',
          quote: '',
          avatarUrl: ''
        });
      }, 1600);
    } catch (err: any) {
      setSubmitError(err?.message || 'حصل خطأ أثناء الحفظ، جرّب تاني يا طيب.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPeople = people.filter((person) => {
    const role = person.craftTitle || person.craftOrSkill || person.titleOrRole || '';
    const bioText = person.bio || person.biography || '';
    const matchesSearch =
      !searchQuery.trim() ||
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bioText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.governorateName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGov = governorateFilter === 'all' || person.governorateName === governorateFilter;
    return matchesSearch && matchesGov;
  });

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        overflow-x-hidden
        bg-cream
        text-espresso
        transition-colors duration-500
        dark:bg-espresso-900
        dark:text-cream
      "
    >
      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <header className="relative z-50 border-b border-black/10 dark:border-white/10">
        <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button
            onClick={() => setActivePage('home')}
            className="
              group flex items-center gap-3
              text-sm font-bold
              transition-all
              hover:text-primary
              cursor-pointer
            "
          >
            <span
              className="
                flex h-10 w-10 items-center justify-center
                rounded-full
                border border-black/10
                bg-white/60
                transition-all
                group-hover:bg-espresso
                group-hover:text-white
                dark:border-white/10
                dark:bg-cream/5
                dark:group-hover:bg-white
                dark:group-hover:text-black
              "
            >
              <ArrowLeft
                size={17}
                className="transition-transform group-hover:-translate-x-1"
              />
            </span>

            <span className="hidden sm:block">الرئيسية</span>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <div className="text-[9px] font-bold tracking-[0.35em] text-primary">
              WAH
            </div>

            <div className="mt-1 text-sm font-black">ناس الصعيد</div>
          </div>

          <button
            onClick={() => setActivePage('cultural-crafts')}
            className="
              flex items-center gap-2
              rounded-full
              border border-black/10
              px-4 py-2.5
              text-xs font-bold
              transition-all
              hover:bg-espresso
              hover:text-white
              dark:border-white/10
              dark:hover:bg-white
              dark:hover:text-black
              cursor-pointer
            "
          >
            <span className="hidden sm:block">موسوعة الحرف</span>
            <Hammer size={15} />
          </button>
        </div>
      </header>

      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full border border-black/5 dark:border-white/5" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-[350px] w-[350px] rounded-full border border-black/5 dark:border-white/5" />

        <div className="mx-auto max-w-[1600px] px-5 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-24 lg:px-12 lg:pb-20 lg:pt-32">
          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_420px]">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <Sparkles size={16} className="text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                  Guardians of Heritage / Upper Egypt
                </span>
              </div>

              <h1
                className="
                  max-w-5xl
                  text-[14vw]
                  font-black
                  leading-[0.78]
                  tracking-[-0.08em]
                  sm:text-[11vw]
                  lg:text-[9rem]
                  xl:text-[11rem]
                "
              >
                ناس
                <br />
                <span className="mr-[8vw] text-primary lg:mr-28">الصعيد</span>
              </h1>

              <div className="mt-10 flex max-w-2xl items-start gap-5">
                <div className="mt-2 h-16 w-px bg-primary" />
                <p className="text-sm leading-8 text-black/55 dark:text-white/55 sm:text-base">
                  ناس الصعيد هما روحه وحراسه؛ من الأسطوات اللي ورثوا الصنعة إيد بإيد، للشعراء والمبدعين اللي حكوا حكايات البلد بصوتها الصادق.
                </p>
              </div>
            </div>

            {/* Stats Card */}
            <div className="relative">
              <div
                className="
                  relative overflow-hidden
                  rounded-[2rem]
                  border border-black/10
                  bg-white/50
                  p-7
                  backdrop-blur-xl
                  dark:border-white/10
                  dark:bg-cream/[0.035]
                "
              >
                <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full border border-primary/20" />

                <div className="relative">
                  <div className="mb-10 flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-[0.25em] text-black/40 dark:text-white/40">
                      MASTERS & ARTISANS
                    </span>
                    <Users size={18} className="text-primary" />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-5xl font-black tracking-[-0.05em]">
                        {people.length}
                      </div>
                      <div className="mt-2 text-xs text-black/45 dark:text-white/45">
                        علم ورمز موثق بالداتا بيز
                      </div>
                    </div>

                    <div>
                      <div className="text-5xl font-black tracking-[-0.05em]">
                        {governorates.length}
                      </div>
                      <div className="mt-2 text-xs text-black/45 dark:text-white/45">
                        محافظة صعيدية
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex items-center gap-3 border-t border-black/10 pt-5 dark:border-white/10">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-xs font-bold">
                      أرواح تنبض بعبق التراث والأصالة
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FLOATING FILTERS BAR
      ===================================================== */}
      <section className="relative z-30 mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div
          className="
            rounded-[1.5rem]
            border border-black/10
            bg-white/75
            p-3
            shadow-[0_20px_70px_rgba(0,0,0,0.08)]
            backdrop-blur-2xl
            dark:border-white/10
            dark:bg-espresso-900/90
            dark:shadow-black/30
          "
        >
          <div className="flex flex-col gap-3 lg:flex-row">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={17}
                className="
                  absolute right-4 top-1/2
                  -translate-y-1/2
                  text-black/40
                  dark:text-white/40
                "
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن شيخ صنعة، حرفي، أو راوٍ..."
                className="
                  h-12 w-full
                  rounded-xl
                  border border-transparent
                  bg-black/[0.035]
                  pr-11 pl-10
                  text-sm
                  outline-none
                  transition-all
                  placeholder:text-black/35
                  focus:border-primary/40
                  focus:bg-transparent
                  dark:bg-cream/[0.04]
                  dark:placeholder:text-white/30
                  dark:focus:bg-white/[0.06]
                "
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="
                    absolute left-3 top-1/2
                    -translate-y-1/2
                    rounded-full p-1.5
                    hover:bg-black/10
                    dark:hover:bg-white/10
                    cursor-pointer
                  "
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Governorate Select */}
            <div className="relative lg:w-72">
              <select
                value={governorateFilter}
                onChange={(e) => setGovernorateFilter(e.target.value)}
                className="
                  h-12 w-full
                  appearance-none
                  rounded-xl
                  border border-transparent
                  bg-black/[0.035]
                  px-4
                  text-sm font-bold
                  outline-none
                  transition-all
                  focus:border-primary/40
                  dark:bg-cream/[0.04]
                  dark:focus:bg-white/[0.06]
                  cursor-pointer
                "
              >
                <option value="all">كل المحافظات</option>
                {governorates.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="
                  pointer-events-none
                  absolute left-4 top-1/2
                  -translate-y-1/2
                "
              />
            </div>

            {/* Result Counter & Clear */}
            <div
              className="
                flex items-center justify-between
                rounded-xl
                bg-espresso
                px-5
                text-white
                dark:bg-cream
                dark:text-black
              "
            >
              <div className="flex items-center gap-2">
                <Users size={14} />
                <span className="text-xs font-bold">
                  {filteredPeople.length} شخصية
                </span>
              </div>

              {(searchQuery.trim() !== '' || governorateFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setGovernorateFilter('all');
                  }}
                  className="mr-5 text-[10px] font-bold underline underline-offset-4 cursor-pointer"
                >
                  إعادة
                </button>
              )}
            </div>

            {/* Add Person CTA Button (Colloquial Upper Egypt) */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="
                flex items-center justify-center gap-2
                h-12 px-6
                rounded-xl
                bg-primary text-white
                font-black text-xs sm:text-sm
                shadow-md hover:bg-primary/90
                transition-all duration-300
                hover:scale-[1.02]
                shrink-0
                cursor-pointer
              "
            >
              <Plus size={16} />
              <span>ضيف رمز من بلدك</span>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          MASTERS GRID SECTION
      ===================================================== */}
      <section className="mx-auto max-w-[1600px] px-5 pb-24 pt-14 sm:px-8 sm:pt-20 lg:px-12">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="mb-2 text-[10px] font-bold tracking-[0.3em] text-primary">
              PROFILES
            </div>
            <h2 className="text-3xl font-black sm:text-4xl">أعلام ورموز وشيوخ الصعيد</h2>
          </div>

          <div className="hidden items-center gap-2 text-xs text-black/40 dark:text-white/40 sm:flex">
            <Compass size={14} />
            <span>Upper Egypt Masters</span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[420px] animate-pulse rounded-[1.5rem] bg-black/5 dark:bg-cream/5"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPeople.length === 0 && (
          <div
            className="
              flex min-h-[420px]
              flex-col items-center justify-center
              rounded-[2rem]
              border border-dashed
              border-black/15
              text-center
              dark:border-white/15
            "
          >
            <div
              className="
                mb-6 flex h-16 w-16
                items-center justify-center
                rounded-full
                border border-black/10
                dark:border-white/10
              "
            >
              <Users size={24} />
            </div>

            <h3 className="text-xl font-black">لم يتم العثور على شخصيات مطابقة</h3>
            <p className="mt-3 text-sm text-black/45 dark:text-white/45">
              جرّب تغيير كلمات البحث أو المحافظة.
            </p>

            {(searchQuery.trim() !== '' || governorateFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setGovernorateFilter('all');
                }}
                className="
                  mt-6
                  rounded-full
                  bg-espresso
                  px-6 py-3
                  text-xs font-bold text-white
                  dark:bg-cream
                  dark:text-black
                  cursor-pointer
                "
              >
                عرض كل الشخصيات
              </button>
            )}
          </div>
        )}

        {/* People Cards Grid */}
        {!isLoading && filteredPeople.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPeople.map((person, index) => {
              const photo =
                person.photoUrl ||
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800';
              const roleTitle = person.craftTitle || person.craftOrSkill || person.titleOrRole || 'حرفي وتراثي';

              return (
                <article
                  key={person.id || index}
                  onClick={() => navigateToPerson(person.slug)}
                  className="
                    group
                    relative
                    flex flex-col justify-between
                    overflow-hidden
                    rounded-[1.5rem]
                    border border-black/10
                    bg-white/70
                    p-6 sm:p-7
                    shadow-sm
                    transition-all duration-500
                    hover:-translate-y-1.5
                    hover:border-primary/60
                    hover:shadow-xl
                    dark:border-white/10
                    dark:bg-espresso-900
                    cursor-pointer
                  "
                >
                  <div>
                    {/* Top Row: Avatar & Governorate Badge */}
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-black/10 dark:border-white/10">
                        <img
                          src={photo}
                          alt={person.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        {person.governorateName && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-black/5 dark:bg-cream/5 px-3 py-1 text-[10px] font-bold text-black/70 dark:text-white/70">
                            <MapPin size={11} className="text-primary" />
                            {person.governorateName}
                          </span>
                        )}
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary">
                          {roleTitle}
                        </span>
                      </div>
                    </div>

                    {/* Name & Bio */}
                    <h3 className="text-2xl font-black mb-1.5 transition-colors group-hover:text-primary">
                      {person.name}
                    </h3>

                    {(person.originVillage || (person as any).villageOrOrigin) && (
                      <div className="text-[11px] font-bold text-primary/80 mb-2.5 flex items-center gap-1">
                        <MapPin size={12} className="shrink-0 text-primary" />
                        <span className="truncate">{person.originVillage || (person as any).villageOrOrigin}</span>
                      </div>
                    )}

                    <p className="text-xs sm:text-sm leading-6 text-black/60 dark:text-white/60 line-clamp-3 mb-3">
                      {person.bio || person.biography}
                    </p>

                    {person.quote && (
                      <div className="mb-3 rounded-lg bg-black/[0.03] dark:bg-cream/[0.04] p-2.5 text-[11px] italic text-black/75 dark:text-white/75 line-clamp-2 border-r-2 border-primary flex items-start gap-1.5">
                        <Quote size={12} className="shrink-0 text-primary mt-0.5" />
                        <span>{person.quote}</span>
                      </div>
                    )}

                    {person.yearsOfExperience && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-2">
                        <Award size={14} />
                        <span>خبرة تمتد لأكثر من {person.yearsOfExperience} عاماً</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs font-bold">
                    <span className="text-black/50 dark:text-white/50 group-hover:text-primary transition-colors">
                      السيرة الكاملة والمقتنيات
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 dark:bg-cream/5 text-black dark:text-white transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                      <ArrowUpLeft size={16} />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}
      <section className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div
            className="
              relative overflow-hidden
              rounded-[2rem]
              bg-espresso
              px-6 py-14
              text-white
              sm:px-12 sm:py-20
              lg:px-20
            "
          >
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full border border-white/10" />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_400px] lg:items-end">
              <div>
                <div className="mb-5 text-[10px] font-bold tracking-[0.3em] text-[#d5a56d]">
                  LIVING LEGENDS
                </div>
                <h2
                  className="
                    max-w-4xl
                    text-4xl
                    font-black
                    leading-tight
                    tracking-[-0.04em]
                    sm:text-6xl
                  "
                >
                  أيدٍ تنقش في الذاكرة...
                  <br />
                  وعقول تحرس التراث.
                </h2>
              </div>

              <p className="text-sm leading-8 text-white/55">
                كل شخصية هنا تمثل حلقة وصل حية بين الماضي المجيد ومستقبل الصعيد، تنقل الحكمة والصنعة للأجيال القادمة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ADD PERSON MODAL (بالعامية الصعيدية الأصيلة)
      ===================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            onClick={() => !isSubmitting && setIsAddModalOpen(false)}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Card */}
          <div
            className="
              relative z-10
              w-full max-w-2xl
              max-h-[90vh] overflow-y-auto
              rounded-[2rem]
              border border-black/10
              bg-cream
              p-6 sm:p-8
              shadow-2xl
              dark:border-white/10
              dark:bg-espresso-900
            "
          >
            {/* Close Button */}
            <button
              onClick={() => !isSubmitting && setIsAddModalOpen(false)}
              className="
                absolute left-5 top-5
                flex h-9 w-9 items-center justify-center
                rounded-full bg-black/5 dark:bg-white/5
                hover:bg-black/10 dark:hover:bg-white/10
                text-black/60 dark:text-white/60
                transition-colors cursor-pointer
              "
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-primary font-bold text-xs mb-2">
                <Sparkles size={15} />
                <span>توثيق شعبي بالعامية لأبناء الصعيد</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black">
                أضف رمز أو شخصية صعيدية
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-6 text-black/60 dark:text-white/60">
                شاركنا بسيرة راجل طيّب، شيخ، فنان، أسطى، أو علم من بلدكم ساب علامة في قلوب الناس وتراب الجنوب.. والكلام كله بالعامية والبلدي عشان يوصل لقلوب الناس بسرعة.
              </p>
            </div>

            {/* Success Alert */}
            {submitSuccess && (
              <div className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
                <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-emerald-600" />
                <div className="text-xs sm:text-sm font-bold leading-6">
                  {submitSuccess}
                </div>
              </div>
            )}

            {/* Error Alert */}
            {submitError && (
              <div className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-rose-800 dark:text-rose-300 flex items-start gap-3">
                <X size={20} className="shrink-0 mt-0.5 text-rose-600" />
                <div className="text-xs sm:text-sm font-bold leading-6">
                  {submitError}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleContributeSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Person Name */}
                <div>
                  <label className="block font-black text-black/80 dark:text-white/80 mb-1.5">
                    اسم العلم أو الرمز الصعيدي <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثلاً: الشيخ فلان، الخال، الأسطى..."
                    className="
                      w-full h-11 px-4 rounded-xl
                      border border-black/10 dark:border-white/10
                      bg-white/60 dark:bg-black/20
                      outline-none focus:border-primary
                      transition-all
                    "
                  />
                </div>

                {/* Governorate */}
                <div>
                  <label className="block font-black text-black/80 dark:text-white/80 mb-1.5">
                    المحافظة الصعيدية <span className="text-primary">*</span>
                  </label>
                  <select
                    value={formData.governorateName}
                    onChange={(e) => setFormData({ ...formData, governorateName: e.target.value })}
                    className="
                      w-full h-11 px-4 rounded-xl
                      border border-black/10 dark:border-white/10
                      bg-white/60 dark:bg-black/20
                      outline-none focus:border-primary
                      transition-all cursor-pointer font-bold
                    "
                  >
                    {[
                      'قنا',
                      'الأقصر',
                      'أسوان',
                      'سوهاج',
                      'أسيوط',
                      'المنيا',
                      'بني سويف',
                      'الفيوم',
                      'الوادي الجديد',
                      'البحر الأحمر'
                    ].map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Origin Village */}
                <div>
                  <label className="block font-black text-black/80 dark:text-white/80 mb-1.5">
                    القرية، النجع، أو المركز الأصيل
                  </label>
                  <input
                    type="text"
                    value={formData.villageOrOrigin}
                    onChange={(e) => setFormData({ ...formData, villageOrOrigin: e.target.value })}
                    placeholder="مثلاً: قرية أبنود، دندرة، الحواتكة، النزلة..."
                    className="
                      w-full h-11 px-4 rounded-xl
                      border border-black/10 dark:border-white/10
                      bg-white/60 dark:bg-black/20
                      outline-none focus:border-primary
                      transition-all
                    "
                  />
                </div>

                {/* Craft / Role */}
                <div>
                  <label className="block font-black text-black/80 dark:text-white/80 mb-1.5">
                    لقبه، مهنته، أو مكانته بين الناس
                  </label>
                  <input
                    type="text"
                    value={formData.craftTitle}
                    onChange={(e) => setFormData({ ...formData, craftTitle: e.target.value })}
                    placeholder="مثلاً: سلطان المداحين، شيخ الصنعة، شاعر العامية..."
                    className="
                      w-full h-11 px-4 rounded-xl
                      border border-black/10 dark:border-white/10
                      bg-white/60 dark:bg-black/20
                      outline-none focus:border-primary
                      transition-all
                    "
                  />
                </div>
              </div>

              {/* Biography (Colloquial) */}
              <div>
                <label className="block font-black text-black/80 dark:text-white/80 mb-1.5">
                  حكايته وسيرته بالبلدي (بالعامية) <span className="text-primary">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.biography}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  placeholder="احكي لنا عنه وعن نشأته وقعدته على المصطبة والناس كانت بتحبه ليه وبصمته في البلد إيه..."
                  className="
                    w-full p-4 rounded-xl
                    border border-black/10 dark:border-white/10
                    bg-white/60 dark:bg-black/20
                    outline-none focus:border-primary
                    transition-all resize-none leading-6
                  "
                />
              </div>

              {/* Anecdote (Colloquial) */}
              <div>
                <label className="block font-black text-black/80 dark:text-white/80 mb-1.5">
                  موقف صعيدي أو حكاية جدعنة لا تتنسيش في بلده
                </label>
                <textarea
                  rows={2}
                  value={formData.anecdote}
                  onChange={(e) => setFormData({ ...formData, anecdote: e.target.value })}
                  placeholder="موقف كرم، شهامة، أو قصة مشهورة كل أهل النجع بيحكوها عنه..."
                  className="
                    w-full p-3 rounded-xl
                    border border-black/10 dark:border-white/10
                    bg-white/60 dark:bg-black/20
                    outline-none focus:border-primary
                    transition-all resize-none leading-6
                  "
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Famous Work */}
                <div>
                  <label className="block font-black text-black/80 dark:text-white/80 mb-1.5">
                    أهم أعماله أو أثره الخالد
                  </label>
                  <input
                    type="text"
                    value={formData.famousWork}
                    onChange={(e) => setFormData({ ...formData, famousWork: e.target.value })}
                    placeholder="غنوة، كتاب، مسجد، ورشة، أثر لا يُنسى..."
                    className="
                      w-full h-11 px-4 rounded-xl
                      border border-black/10 dark:border-white/10
                      bg-white/60 dark:bg-black/20
                      outline-none focus:border-primary
                      transition-all
                    "
                  />
                </div>

                {/* Quote */}
                <div>
                  <label className="block font-black text-black/80 dark:text-white/80 mb-1.5">
                    حكمة أو كلمة صعيدية كان دايماً يقولها
                  </label>
                  <input
                    type="text"
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    placeholder="«الصاحب الجدع سند، والصعيدي ما يوطيش راسه...»"
                    className="
                      w-full h-11 px-4 rounded-xl
                      border border-black/10 dark:border-white/10
                      bg-white/60 dark:bg-black/20
                      outline-none focus:border-primary
                      transition-all
                    "
                  />
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <label className="block font-black text-black/80 dark:text-white/80 mb-1.5">
                  رابط صورة للشخصية (اختياري)
                </label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://... (سيبه فاضي لو مش معاك رابط صورة)"
                  className="
                    w-full h-11 px-4 rounded-xl
                    border border-black/10 dark:border-white/10
                    bg-white/60 dark:bg-black/20
                    outline-none focus:border-primary
                    transition-all text-xs
                  "
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddModalOpen(false)}
                  className="
                    px-5 py-2.5 rounded-xl
                    border border-black/10 dark:border-white/10
                    text-black/60 dark:text-white/60
                    font-bold text-xs
                    hover:bg-black/5 dark:hover:bg-white/5
                    transition-all cursor-pointer
                  "
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    flex items-center gap-2
                    px-6 py-2.5 rounded-xl
                    bg-primary text-white
                    font-black text-xs sm:text-sm
                    shadow-lg hover:bg-primary/90
                    disabled:opacity-50
                    transition-all cursor-pointer
                  "
                >
                  {isSubmitting ? (
                    <span>جاري التسجيل في الداتا بيز...</span>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>سجّل الشخصية في الداتا بيز</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeoplePage;