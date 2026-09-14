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
  Heart,
  RefreshCw,
  Scroll
} from 'lucide-react';

export const PeoplePage: React.FC = () => {
  const { navigateToPerson, setActivePage } = useApp();
  const [people, setPeople] = useState<LocalPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [governorateFilter, setGovernorateFilter] = useState<string>('all');
  const [selectedPersonForModal, setSelectedPersonForModal] = useState<LocalPerson | null>(null);

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

  const getPersonPhoto = (person: any) => {
    if (!person) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800';
    const candidates = [
      person.avatarUrl,
      person.photoUrl,
      person.imageUrl,
      person.image,
      person.photo,
      person.coverImage
    ].filter((u): u is string => typeof u === 'string' && u.trim().length > 0);

    const custom = candidates.find((u) => !u.includes('images.unsplash.com') && !u.includes('placeholder'));
    if (custom) return custom;

    return person.avatarUrl || person.photoUrl || candidates[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800';
  };

  const fetchPeopleData = async () => {
    try {
      const data = await wahApi.getPeople({ _t: Date.now().toString() });
      setPeople(data);
    } catch (err) {
      console.warn('Could not load people:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchPeopleData();
      setIsLoading(false);
    };
    init();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await wahApi.getPeople({ _t: Date.now().toString() });
      setPeople(data);
    } catch (err) {
      console.warn('Could not refresh people:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

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
    const role = person.craftTitle || (person as any).craftOrSkill || (person as any).titleOrRole || '';
    const bioText = person.bio || (person as any).biography || '';
    const originText = person.originVillage || (person as any).villageOrOrigin || '';
    const anecdoteText = person.famousAnecdote || '';
    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !query ||
      person.name.toLowerCase().includes(query) ||
      role.toLowerCase().includes(query) ||
      bioText.toLowerCase().includes(query) ||
      person.governorateName.toLowerCase().includes(query) ||
      originText.toLowerCase().includes(query) ||
      anecdoteText.toLowerCase().includes(query) ||
      (person.famousWorksOrActs && person.famousWorksOrActs.some((w) => w.toLowerCase().includes(query)));

    const matchesGov = governorateFilter === 'all' || person.governorateName === governorateFilter;
    return matchesSearch && matchesGov;
  });

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        overflow-x-hidden
        bg-background
        text-foreground
        transition-colors duration-500
      "
    >
      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <header className="relative z-50 border-b border-border-subtle">
        <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button
            onClick={() => setActivePage('home')}
            className="
              group flex items-center gap-3
              text-sm font-bold
              transition-all
              hover:text-accent
              cursor-pointer
            "
          >
            <span
              className="
                flex h-10 w-10 items-center justify-center
                rounded-full
                border border-border-subtle
                bg-surface
                transition-all
                group-hover:bg-btn-dark
                group-hover:text-white
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
            <div className="text-[9px] font-bold tracking-[0.35em] text-accent">
              WAH
            </div>

            <div className="mt-1 text-sm font-black">ناس الصعيد</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="
                flex items-center gap-1.5
                rounded-full
                border border-border-subtle
                px-3.5 py-2
                text-xs font-bold
                transition-all
                hover:bg-surface
                text-foreground-secondary
                cursor-pointer
              "
              title="تحديث البيانات"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-accent' : ''} />
              <span className="hidden md:inline">تحديث</span>
            </button>

            <button
              onClick={() => setActivePage('cultural-crafts')}
              className="
                flex items-center gap-2
                rounded-full
                border border-border-subtle
                px-4 py-2.5
                text-xs font-bold
                transition-all
                hover:bg-btn-dark
                hover:text-white
                cursor-pointer
              "
            >
              <span className="hidden sm:block">موسوعة الحرف</span>
              <Hammer size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full border border-border-subtle/50" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-[350px] w-[350px] rounded-full border border-border-subtle/50" />

        <div className="mx-auto max-w-[1600px] px-5 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-24 lg:px-12 lg:pb-20 lg:pt-32">
          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_420px]">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <Sparkles size={16} className="text-accent" />
                <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-accent">
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
                <span className="mr-[8vw] text-accent lg:mr-28">الصعيد</span>
              </h1>

              <div className="mt-10 flex max-w-2xl items-start gap-5">
                <div className="mt-2 h-16 w-px bg-accent" />
                <p className="text-sm leading-8 text-foreground-secondary sm:text-base">
                  ناس الصعيد هما روحه وحراسه؛ من الأسطوات اللي ورثوا الصنعة إيد بإيد، للشعراء والمبدعين ورجال الدين والأدب اللي حكوا حكايات البلد بصوتها الصادق.. موثقين بأصولهم وأعمالهم وسيرهم الأصيلة.
                </p>
              </div>
            </div>

            {/* Stats Card */}
            <div className="relative">
              <div
                className="
                  relative overflow-hidden
                  rounded-[2rem]
                  border border-border-subtle
                  bg-surface
                  p-7
                  shadow-lg
                "
              >
                <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full border border-accent/20" />

                <div className="relative">
                  <div className="mb-10 flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-[0.25em] text-foreground-muted">
                      DATABASE REGISTRY
                    </span>
                    <Users size={18} className="text-accent" />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-5xl font-black tracking-[-0.05em] text-accent">
                        {people.length}
                      </div>
                      <div className="mt-2 text-xs text-foreground-secondary font-bold">
                        علم ورمز موثق بالداتا بيز
                      </div>
                    </div>

                    <div>
                      <div className="text-5xl font-black tracking-[-0.05em]">
                        {governorates.length}
                      </div>
                      <div className="mt-2 text-xs text-foreground-secondary font-bold">
                        محافظة صعيدية
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex items-center gap-3 border-t border-border-subtle pt-5">
                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs font-bold text-foreground">
                      سجلات موثقة تشمل السيرة، الحكايات، والآثار الخالدة
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
      {/* =====================================================
    PEOPLE FILTER / SEARCH BAR
===================================================== */}
      <section className="relative z-30 mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <div
          className="
      rounded-[2rem]
      border border-border-subtle
      bg-surface/95
      p-3
      shadow-[0_20px_60px_rgba(0,0,0,0.08)]
      backdrop-blur-xl
    "
        >
          <div className="flex flex-col gap-3 lg:flex-row">
            {/* Search */}
            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                className="
            pointer-events-none
            absolute right-4 top-1/2
            -translate-y-1/2
            text-accent
          "
              />

              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="دَوّر على اسم، قرية، صنعة أو حكاية..."
                className="
            h-14 w-full
            rounded-[1.25rem]
            border border-border-subtle
            bg-surface-subtle
            pr-12 pl-11
            text-sm font-semibold
            text-foreground
            outline-none
            transition-all duration-300
            placeholder:text-foreground-muted
            focus:border-accent
            focus:bg-surface
            focus:ring-4
            focus:ring-accent/10
          "
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="
              absolute left-3 top-1/2
              flex h-8 w-8
              -translate-y-1/2
              items-center justify-center
              rounded-full
              bg-surface
              text-foreground-muted
              transition-all
              hover:bg-accent
              hover:text-white
              cursor-pointer
            "
                  aria-label="مسح البحث"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Governorate */}
            <div className="relative lg:w-[260px]">
              <select
                value={governorateFilter}
                onChange={(e) => setGovernorateFilter(e.target.value)}
                className="
            h-14 w-full
            appearance-none
            rounded-[1.25rem]
            border border-border-subtle
            bg-surface-subtle
            px-5
            pl-11
            text-sm font-bold
            text-foreground
            outline-none
            transition-all duration-300
            focus:border-accent
            focus:bg-surface
            focus:ring-4
            focus:ring-accent/10
            cursor-pointer
          "
              >
                <option value="all">
                  كل المحافظات ({people.length})
                </option>

                {governorates.map((gov) => {
                  const count = people.filter(
                    (p) => p.governorateName === gov
                  ).length;

                  return (
                    <option key={gov} value={gov}>
                      {gov} ({count})
                    </option>
                  );
                })}
              </select>

              <ChevronDown
                size={16}
                className="
            pointer-events-none
            absolute left-4 top-1/2
            -translate-y-1/2
            text-foreground-muted
          "
              />
            </div>

            {/* Results */}
            <div
              className="
          flex h-14
          items-center justify-between
          gap-4
          rounded-[1.25rem]
          bg-btn-dark
          px-5
          text-white
        "
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="
              flex h-8 w-8
              items-center justify-center
              rounded-full
              bg-white/10
            "
                >
                  <Users size={15} />
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-white/50">
                    النتائج
                  </span>

                  <span className="text-xs font-black">
                    {filteredPeople.length} شخصية
                  </span>
                </div>
              </div>

              {(searchQuery.trim() !== '' ||
                governorateFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setGovernorateFilter('all');
                    }}
                    className="
              rounded-full
              px-2
              text-[10px]
              font-bold
              text-accent
              underline
              underline-offset-4
              transition-colors
              hover:text-white
              cursor-pointer
            "
                  >
                    مسح
                  </button>
                )}
            </div>

            {/* Add Person */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="
          flex h-14
          shrink-0
          items-center
          justify-center
          gap-2
          rounded-[1.25rem]
          bg-accent
          px-6
          text-xs sm:text-sm
          font-black
          text-white
          shadow-lg
          shadow-accent/20
          transition-all duration-300
          hover:-translate-y-0.5
          hover:bg-accent/90
          hover:shadow-xl
          hover:shadow-accent/25
          active:scale-[0.98]
          cursor-pointer
        "
            >
              <Plus size={17} />
              <span>ضيف شخصية من بلدك</span>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
    PEOPLE SECTION
===================================================== */}
      <section className="mx-auto max-w-[1500px] px-4 pb-24 pt-16 sm:px-6 sm:pt-20 lg:px-10">
        {/* Section Heading */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-px w-8 bg-accent" />

              <span className="text-[10px] font-black tracking-[0.18em] text-accent">
                حكايات من قلب الصعيد
              </span>
            </div>

            <h2
              className="
          text-3xl
          font-black
          leading-tight
          tracking-tight
          sm:text-4xl
          lg:text-5xl
        "
            >
              ناس سابوا أثر
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-foreground-secondary">
              شخصيات من بلاد الصعيد، كل واحد فيهم وراه حكاية،
              ومشوار يستاهل يتحكي.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="
          flex h-11 w-11
          items-center justify-center
          rounded-2xl
          border border-border-subtle
          bg-surface
          text-accent
          shadow-sm
        "
            >
              <Compass size={18} />
            </div>

            <div>
              <div className="text-[10px] font-bold text-foreground-muted">
                إجمالي الشخصيات
              </div>

              <div className="text-lg font-black">
                {people.length}
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="
            h-[540px]
            animate-pulse
            overflow-hidden
            rounded-[2rem]
            border
            border-border-subtle
            bg-surface
          "
              >
                <div className="h-[290px] bg-surface-subtle" />

                <div className="space-y-4 p-6">
                  <div className="h-4 w-24 rounded-full bg-surface-subtle" />
                  <div className="h-7 w-2/3 rounded-lg bg-surface-subtle" />
                  <div className="h-4 w-full rounded-lg bg-surface-subtle" />
                  <div className="h-4 w-5/6 rounded-lg bg-surface-subtle" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && filteredPeople.length === 0 && (
          <div
            className="
        flex min-h-[430px]
        flex-col items-center justify-center
        rounded-[2rem]
        border border-dashed
        border-border-subtle
        bg-surface
        px-6
        text-center
      "
          >
            <div
              className="
          mb-6
          flex h-20 w-20
          items-center justify-center
          rounded-[1.75rem]
          bg-accent/10
          text-accent
        "
            >
              <Users size={28} />
            </div>

            <h3 className="text-xl font-black">
              ملقيناش الشخصية دي
            </h3>

            <p className="mt-3 max-w-md text-sm leading-7 text-foreground-secondary">
              جرّب تدور باسم مختلف أو اختار محافظة تانية،
              يمكن الحكاية تكون في بلد تانية.
            </p>

            {(searchQuery.trim() !== '' ||
              governorateFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setGovernorateFilter('all');
                  }}
                  className="
            mt-7
            rounded-full
            bg-btn-dark
            px-7 py-3
            text-xs
            font-black
            text-white
            transition-all
            hover:bg-accent
            cursor-pointer
          "
                >
                  وريني كل الشخصيات
                </button>
              )}
          </div>
        )}

        {/* =====================================================
      PEOPLE CARDS
  ===================================================== */}
        {!isLoading && filteredPeople.length > 0 && (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPeople.map((person, index) => {
              const photo = getPersonPhoto(person);

              const roleTitle =
                person.craftTitle ||
                (person as any).craftOrSkill ||
                (person as any).titleOrRole ||
                'شخصية من الصعيد';

              const bioText =
                person.bio ||
                (person as any).biography ||
                '';

              const originVillage =
                person.originVillage ||
                (person as any).villageOrOrigin ||
                '';

              return (
                <article
                  key={person.id || person.slug || index}
                  className="
              group
              relative
              overflow-hidden
              rounded-[2rem]
              border border-border-subtle
              bg-surface
              shadow-sm
              transition-all duration-500
              hover:-translate-y-2
              hover:border-accent/40
              hover:shadow-[0_25px_70px_rgba(0,0,0,0.12)]
            "
                >
                  {/* Image */}
                  <div
                    onClick={() => navigateToPerson(person.slug)}
                    className="
                relative
                h-[330px]
                overflow-hidden
                cursor-pointer
                bg-surface-subtle
              "
                  >
                    <img
                      src={photo}
                      alt={person.name}
                      loading={index < 3 ? 'eager' : 'lazy'}
                      className="
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-[1.06]
                "
                    />

                    {/* Image Overlay */}
                    <div
                      className="
                  absolute inset-0
                  bg-gradient-to-t
                  from-black/75
                  via-black/10
                  to-transparent
                "
                    />

                    {/* Governorate */}
                    {person.governorateName && (
                      <div
                        className="
                    absolute right-4 top-4
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border border-white/20
                    bg-black/35
                    px-3.5 py-1.5
                    text-[10px]
                    font-black
                    text-white
                    backdrop-blur-md
                  "
                      >
                        <MapPin size={11} />
                        {person.governorateName}
                      </div>
                    )}

                    {/* Verified */}
                    <div
                      className="
                  absolute left-4 top-4
                  flex h-8 w-8
                  items-center justify-center
                  rounded-full
                  border border-white/20
                  bg-black/30
                  text-white
                  backdrop-blur-md
                "
                      title="شخصية مسجلة"
                    >
                      <CheckCircle2 size={15} />
                    </div>

                    {/* Image Bottom Info */}
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <div className="mb-2">
                        <span
                          className="
                      inline-flex
                      rounded-full
                      bg-accent
                      px-3 py-1
                      text-[9px]
                      font-black
                      text-white
                      shadow-lg
                    "
                        >
                          {roleTitle}
                        </span>
                      </div>

                      <h3
                        onClick={() => navigateToPerson(person.slug)}
                        className="
                    cursor-pointer
                    text-2xl
                    font-black
                    leading-tight
                    text-white
                    transition-colors
                    group-hover:text-[#F3D1B8]
                  "
                      >
                        {person.name}
                      </h3>

                      {originVillage && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-white/75">
                          <MapPin size={11} />
                          <span className="truncate">
                            {originVillage}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6">
                    <p
                      className="
                  line-clamp-3
                  text-xs
                  leading-7
                  text-foreground-secondary
                  sm:text-sm
                "
                    >
                      {bioText}
                    </p>

                    {/* Quote */}
                    {person.quote && (
                      <div
                        className="
                    relative
                    mt-4
                    overflow-hidden
                    rounded-2xl
                    border
                    border-accent/15
                    bg-accent/5
                    p-4
                  "
                      >
                        <Quote
                          size={17}
                          className="
                      absolute
                      left-3
                      top-3
                      text-accent/20
                    "
                        />

                        <p className="relative pr-1 text-[11px] font-semibold leading-6 text-foreground/80">
                          «{person.quote}»
                        </p>
                      </div>
                    )}

                    {/* Bottom */}
                    <div
                      className="
                  mt-5
                  flex
                  items-center
                  justify-between
                  gap-3
                  border-t
                  border-border-subtle
                  pt-4
                "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPersonForModal(person)
                        }
                        className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    px-2
                    py-2
                    text-[11px]
                    font-bold
                    text-foreground-secondary
                    transition-colors
                    hover:text-accent
                    cursor-pointer
                  "
                      >
                        <BookOpen
                          size={14}
                          className="text-accent"
                        />

                        <span>الحكاية</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigateToPerson(person.slug)
                        }
                        className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-btn-dark
                    px-4 py-2.5
                    text-[10px]
                    font-black
                    text-white
                    shadow-sm
                    transition-all duration-300
                    hover:bg-accent
                    hover:shadow-lg
                    cursor-pointer
                  "
                      >
                        <span>اعرف حكايته</span>
                        <ArrowUpLeft size={13} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* =====================================================
    PERSON DETAILS MODAL
===================================================== */}
      {selectedPersonForModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedPersonForModal(null)}
            className="
        absolute inset-0
        bg-black/75
        backdrop-blur-md
      "
          />

          {/* Modal */}
          <div
            className="
        relative z-10
        flex
        max-h-[94vh]
        w-full
        max-w-4xl
        flex-col
        overflow-hidden
        rounded-[2rem]
        border
        border-white/10
        bg-background
        text-foreground
        shadow-[0_30px_100px_rgba(0,0,0,0.35)]
      "
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setSelectedPersonForModal(null)}
              className="
          absolute
          left-4 top-4
          z-20
          flex h-10 w-10
          items-center justify-center
          rounded-full
          border border-white/10
          bg-black/40
          text-white
          backdrop-blur-md
          transition-all
          hover:bg-accent
          cursor-pointer
        "
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div
              className="
          relative
          shrink-0
          overflow-hidden
          bg-btn-dark
          px-6
          pb-7
          pt-14
          text-white
          sm:px-8
        "
            >
              <div
                className="
            absolute
            -right-24
            -top-24
            h-64
            w-64
            rounded-full
            bg-accent/20
            blur-3xl
          "
              />

              <div
                className="
            absolute
            -bottom-20
            -left-20
            h-52
            w-52
            rounded-full
            bg-accent/10
            blur-3xl
          "
              />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                <img
                  src={getPersonPhoto(selectedPersonForModal)}
                  alt={selectedPersonForModal.name}
                  className="
              h-28
              w-28
              shrink-0
              rounded-[1.5rem]
              border-2
              border-white/20
              object-cover
              shadow-2xl
            "
                />

                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span
                      className="
                  rounded-full
                  bg-accent
                  px-3 py-1
                  text-[10px]
                  font-black
                "
                    >
                      {selectedPersonForModal.craftTitle ||
                        (selectedPersonForModal as any).craftOrSkill ||
                        (selectedPersonForModal as any).titleOrRole ||
                        'شخصية من الصعيد'}
                    </span>

                    {selectedPersonForModal.governorateName && (
                      <span
                        className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-white/15
                    bg-white/10
                    px-3 py-1
                    text-[10px]
                    font-bold
                  "
                      >
                        <MapPin size={11} />

                        {selectedPersonForModal.governorateName}
                      </span>
                    )}
                  </div>

                  <h2
                    className="
                text-3xl
                font-black
                leading-tight
                sm:text-4xl
              "
                  >
                    {selectedPersonForModal.name}
                  </h2>

                  {(selectedPersonForModal.originVillage ||
                    (selectedPersonForModal as any).villageOrOrigin) && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-white/65">
                        <MapPin size={13} />

                        <span>
                          {selectedPersonForModal.originVillage ||
                            (selectedPersonForModal as any)
                              .villageOrOrigin}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div
              className="
          min-h-0
          flex-1
          overflow-y-auto
          p-5
          sm:p-8
        "
            >
              <div className="space-y-7">
                {/* Biography */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-5 w-1 rounded-full bg-accent" />

                    <h4 className="text-sm font-black">
                      حكايته
                    </h4>
                  </div>

                  <div
                    className="
                rounded-[1.5rem]
                border
                border-border-subtle
                bg-surface
                p-5
                text-sm
                leading-8
                text-foreground-secondary
              "
                  >
                    {selectedPersonForModal.bio ||
                      (selectedPersonForModal as any).biography ||
                      'سيرة حافلة بالعطاء والأثر الطيب.'}
                  </div>
                </div>

                {/* Anecdote */}
                {selectedPersonForModal.famousAnecdote && (
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Scroll
                        size={16}
                        className="text-accent"
                      />

                      <h4 className="text-sm font-black">
                        حكاية من سيرته
                      </h4>
                    </div>

                    <div
                      className="
                  rounded-[1.5rem]
                  border
                  border-accent/20
                  bg-accent/5
                  p-5
                  text-sm
                  leading-8
                "
                    >
                      {selectedPersonForModal.famousAnecdote}
                    </div>
                  </div>
                )}

                {/* Famous Works */}
                {selectedPersonForModal.famousWorksOrActs &&
                  selectedPersonForModal.famousWorksOrActs.length > 0 && (
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <Sparkles
                          size={16}
                          className="text-accent"
                        />

                        <h4 className="text-sm font-black">
                          أهم اللي سابه وراه
                        </h4>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {selectedPersonForModal.famousWorksOrActs.map(
                          (work, idx) => (
                            <div
                              key={idx}
                              className="
                          flex
                          items-start
                          gap-3
                          rounded-2xl
                          border
                          border-border-subtle
                          bg-surface
                          p-4
                        "
                            >
                              <span
                                className="
                            flex h-7 w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-accent/10
                            text-[10px]
                            font-black
                            text-accent
                          "
                              >
                                {idx + 1}
                              </span>

                              <span className="text-xs font-semibold leading-6">
                                {work}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Local Impact */}
                {selectedPersonForModal.localImpact && (
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="h-5 w-1 rounded-full bg-accent" />

                      <h4 className="text-sm font-black">
                        أثره في الصعيد
                      </h4>
                    </div>

                    <div
                      className="
                  rounded-[1.5rem]
                  border
                  border-border-subtle
                  bg-surface
                  p-5
                  text-sm
                  leading-8
                  text-foreground-secondary
                "
                    >
                      {selectedPersonForModal.localImpact}
                    </div>
                  </div>
                )}

                {/* Quote */}
                {selectedPersonForModal.quote && (
                  <div
                    className="
                relative
                overflow-hidden
                rounded-[1.5rem]
                border-r-4
                border-accent
                bg-accent/5
                p-6
              "
                  >
                    <Quote
                      size={28}
                      className="
                  absolute
                  left-4
                  top-4
                  text-accent/15
                "
                    />

                    <p
                      className="
                  relative
                  text-base
                  font-semibold
                  italic
                  leading-8
                "
                    >
                      «{selectedPersonForModal.quote}»
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div
                  className="
              grid
              gap-3
              border-t
              border-border-subtle
              pt-6
              sm:grid-cols-2
            "
                >
                  {selectedPersonForModal.sourceName && (
                    <div
                      className="
                  rounded-2xl
                  bg-surface-subtle
                  p-4
                "
                    >
                      <span className="block text-[10px] font-bold text-foreground-muted">
                        مصدر التوثيق
                      </span>

                      <span className="mt-1 block text-xs font-black">
                        {selectedPersonForModal.sourceName}
                      </span>
                    </div>
                  )}

                  {selectedPersonForModal.yearsOfExperience && (
                    <div
                      className="
                  rounded-2xl
                  bg-surface-subtle
                  p-4
                "
                    >
                      <span className="block text-[10px] font-bold text-foreground-muted">
                        مدة المسيرة
                      </span>

                      <span className="mt-1 block text-xs font-black">
                        {selectedPersonForModal.yearsOfExperience} عاماً
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="
          flex
          shrink-0
          flex-col-reverse
          gap-3
          border-t
          border-border-subtle
          bg-surface
          p-4
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-6
        "
            >
              <button
                type="button"
                onClick={() => setSelectedPersonForModal(null)}
                className="
            h-11
            rounded-xl
            border
            border-border-subtle
            px-5
            text-xs
            font-bold
            text-foreground-secondary
            transition-colors
            hover:bg-surface-subtle
            cursor-pointer
          "
              >
                إغلاق
              </button>

              <button
                type="button"
                onClick={() => {
                  const s = selectedPersonForModal.slug;

                  setSelectedPersonForModal(null);

                  navigateToPerson(s);
                }}
                className="
            inline-flex
            h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-btn-dark
            px-6
            text-xs
            font-black
            text-white
            shadow-md
            transition-all
            hover:bg-accent
            cursor-pointer
          "
              >
                <span>شوف السيرة كاملة</span>
                <ArrowUpLeft size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* =====================================================
          FINAL CTA
      ===================================================== */}
      <section className="border-t border-border-subtle">
        <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div
            className="
              relative overflow-hidden
              rounded-[2rem]
              bg-btn-dark
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
                <div className="mb-5 text-[10px] font-bold tracking-[0.3em] text-accent">
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

              <p className="text-sm leading-8 text-white/70">
                كل شخصية هنا مسجلة وموثقة في سجل وه، تمثل حلقة وصل حية بين الماضي المجيد ومستقبل الصعيد، تنقل الحكمة والصنعة للأجيال القادمة.
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
              border border-border-subtle
              bg-background
              p-6 sm:p-8
              shadow-2xl
            "
          >
            {/* Close Button */}
            <button
              onClick={() => !isSubmitting && setIsAddModalOpen(false)}
              className="
                absolute left-5 top-5
                flex h-9 w-9 items-center justify-center
                rounded-full bg-surface-subtle
                hover:bg-border-subtle
                text-foreground-secondary
                transition-colors cursor-pointer
              "
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-accent font-bold text-xs mb-2">
                <Sparkles size={15} />
                <span>توثيق شعبي بالعامية لأبناء الصعيد</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black">
                أضف رمز أو شخصية صعيدية
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-6 text-foreground-secondary">
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
                  <label className="block font-black text-foreground mb-1.5">
                    اسم العلم أو الرمز الصعيدي <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثلاً: الشيخ فلان، الخال، الأسطى..."
                    className="
                      w-full h-11 px-4 rounded-xl
                      border border-border-subtle
                      bg-surface
                      outline-none focus:border-accent
                      transition-all
                    "
                  />
                </div>

                {/* Governorate */}
                <div>
                  <label className="block font-black text-foreground mb-1.5">
                    المحافظة الصعيدية <span className="text-accent">*</span>
                  </label>
                  <select
                    value={formData.governorateName}
                    onChange={(e) => setFormData({ ...formData, governorateName: e.target.value })}
                    className="
                      w-full h-11 px-4 rounded-xl
                      border border-border-subtle
                      bg-surface
                      outline-none focus:border-accent
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
                  <label className="block font-black text-foreground mb-1.5">
                    القرية، النجع، أو المركز الأصيل
                  </label>
                  <input
                    type="text"
                    value={formData.villageOrOrigin}
                    onChange={(e) => setFormData({ ...formData, villageOrOrigin: e.target.value })}
                    placeholder="مثلاً: قرية أبنود، دندرة، الحواتكة، النزلة..."
                    className="
                      w-full h-11 px-4 rounded-xl
                      border border-border-subtle
                      bg-surface
                      outline-none focus:border-accent
                      transition-all
                    "
                  />
                </div>

                {/* Craft / Role */}
                <div>
                  <label className="block font-black text-foreground mb-1.5">
                    لقبه، مهنته، أو مكانته بين الناس
                  </label>
                  <input
                    type="text"
                    value={formData.craftTitle}
                    onChange={(e) => setFormData({ ...formData, craftTitle: e.target.value })}
                    placeholder="مثلاً: سلطان المداحين، شيخ الصنعة، شاعر العامية..."
                    className="
                      w-full h-11 px-4 rounded-xl
                      border border-border-subtle
                      bg-surface
                      outline-none focus:border-accent
                      transition-all
                    "
                  />
                </div>
              </div>

              {/* Biography (Colloquial) */}
              <div>
                <label className="block font-black text-foreground mb-1.5">
                  حكايته وسيرته بالبلدي (بالعامية) <span className="text-accent">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.biography}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  placeholder="احكي لنا عنه وعن نشأته وقعدته على المصطبة والناس كانت بتحبه ليه وبصمته في البلد إيه..."
                  className="
                    w-full p-4 rounded-xl
                    border border-border-subtle
                    bg-surface
                    outline-none focus:border-accent
                    transition-all resize-none leading-6
                  "
                />
              </div>

              {/* Anecdote (Colloquial) */}
              <div>
                <label className="block font-black text-foreground mb-1.5">
                  موقف صعيدي أو حكاية جدعنة لا تتنسيش في بلده
                </label>
                <textarea
                  rows={2}
                  value={formData.anecdote}
                  onChange={(e) => setFormData({ ...formData, anecdote: e.target.value })}
                  placeholder="موقف كرم، شهامة، أو قصة مشهورة كل أهل النجع بيحكوها عنه..."
                  className="
                    w-full p-3 rounded-xl
                    border border-border-subtle
                    bg-surface
                    outline-none focus:border-accent
                    transition-all resize-none leading-6
                  "
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Famous Work */}
                <div>
                  <label className="block font-black text-foreground mb-1.5">
                    أهم أعماله أو أثره الخالد
                  </label>
                  <input
                    type="text"
                    value={formData.famousWork}
                    onChange={(e) => setFormData({ ...formData, famousWork: e.target.value })}
                    placeholder="غنوة، كتاب، مسجد، ورشة، أثر لا يُنسى..."
                    className="
                      w-full h-11 px-4 rounded-xl
                      border border-border-subtle
                      bg-surface
                      outline-none focus:border-accent
                      transition-all
                    "
                  />
                </div>

                {/* Quote */}
                <div>
                  <label className="block font-black text-foreground mb-1.5">
                    حكمة أو كلمة صعيدية كان دايماً يقولها
                  </label>
                  <input
                    type="text"
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    placeholder="«الصاحب الجدع سند، والصعيدي ما يوطيش راسه...»"
                    className="
                      w-full h-11 px-4 rounded-xl
                      border border-border-subtle
                      bg-surface
                      outline-none focus:border-accent
                      transition-all
                    "
                  />
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <label className="block font-black text-foreground mb-1.5">
                  رابط صورة للشخصية (اختياري)
                </label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://... (سيبه فاضي لو مش معاك رابط صورة)"
                  className="
                    w-full h-11 px-4 rounded-xl
                    border border-border-subtle
                    bg-surface
                    outline-none focus:border-accent
                    transition-all text-xs
                  "
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border-subtle">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddModalOpen(false)}
                  className="
                    px-5 py-2.5 rounded-xl
                    border border-border-subtle
                    text-foreground-secondary
                    font-bold text-xs
                    hover:bg-surface
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
                    bg-accent text-white
                    font-black text-xs sm:text-sm
                    shadow-lg hover:bg-accent/90
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