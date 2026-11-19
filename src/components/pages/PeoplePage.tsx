
import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { LocalPerson } from '../../types';
import {
  Users,
  MapPin,
  Search,
  ArrowLeft,
  ArrowUpLeft,
  Sparkles,
  ChevronDown,
  X,
  Plus,
  CheckCircle2,
  Quote,
  BookOpen,
  RefreshCw,
  Film,
  Play,
  Camera,
  Award,
  Calendar,
  Compass,
  Bookmark,
  Clapperboard,
  Feather,
  Globe2,
} from 'lucide-react';
import FloatingDock from '../common/FloatingDock';
import { UncleWahHeroBanner } from '../common/UncleWahHeroBanner';
import { ArchiveStatsCard } from '../common/ArchiveStatsCard';
import { PageNavigationBar } from '../layout/PageNavigationBar';
import { BrandPatternBackground } from '../layout/BrandPatternBackground';

const GOVERNORATES = [
  'قنا',
  'الأقصر',
  'أسوان',
  'سوهاج',
  'أسيوط',
  'المنيا',
  'بني سويف',
  'الفيوم',
  'الوادي الجديد',
  'البحر الأحمر',
];

const GOV_IDS: Record<string, string> = {
  'قنا': 'gov-qena',
  'الأقصر': 'gov-luxor',
  'أسوان': 'gov-aswan',
  'سوهاج': 'gov-sohag',
  'أسيوط': 'gov-asyut',
  'المنيا': 'gov-minya',
  'بني سويف': 'gov-beni-suef',
  'الفيوم': 'gov-fayoum',
  'الوادي الجديد': 'gov-new-valley',
  'البحر الأحمر': 'gov-red-sea',
};

const EMPTY_FORM = {
  name: '',
  governorateName: 'قنا',
  villageOrOrigin: '',
  craftTitle: '',
  biography: '',
  anecdote: '',
  famousWork: '',
  quote: '',
  avatarUrl: '',
};

const getPersonPhoto = (person: any) => {
  const fallback =
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1000';

  if (!person) return fallback;

  const candidates = [
    person.avatarUrl,
    person.photoUrl,
    person.imageUrl,
    person.image,
    person.photo,
    person.coverImage,
  ].filter((url): url is string =>
    typeof url === 'string' && url.trim().length > 0
  );

  return (
    candidates.find(
      (url) =>
        !url.includes('images.unsplash.com') &&
        !url.includes('placeholder')
    ) ||
    candidates[0] ||
    fallback
  );
};

const getRole = (person: any) =>
  person.craftTitle ||
  person.craftOrSkill ||
  person.titleOrRole ||
  'شخصية من الصعيد';

const getBio = (person: any) =>
  person.bio || person.biography || '';

const getOrigin = (person: any) =>
  person.originVillage || person.villageOrOrigin || '';

const inputClass =
  'w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10';

export const PeoplePage: React.FC = () => {
  const {
    navigateToPerson,
    setActivePage,
    currentUser,
    currentRole,
  } = useApp();

  const isAdmin =
    currentRole === 'admin' || currentUser?.role === 'admin';

  const [people, setPeople] = useState<LocalPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [governorateFilter, setGovernorateFilter] =
    useState('all');

  const [selectedPerson, setSelectedPerson] =
    useState<LocalPerson | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchPeopleData = async () => {
    const data = await wahApi.getPeople({
      _t: Date.now().toString(),
    });
    setPeople(data);
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const data = await wahApi.getPeople({
          _t: Date.now().toString(),
        });

        if (mounted) setPeople(data);
      } catch (error) {
        console.warn('Could not load people:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchPeopleData();
    } catch (error) {
      console.warn('Could not refresh people:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const governorates = useMemo(
    () =>
      Array.from(
        new Set(people.map((person) => person.governorateName))
      ).filter(Boolean),
    [people]
  );

  const filteredPeople = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return people.filter((person: any) => {
      const role = getRole(person);
      const bio = getBio(person);
      const origin = getOrigin(person);

      const matchesSearch =
        !query ||
        [
          person.name,
          role,
          bio,
          person.governorateName,
          origin,
          person.famousAnecdote,
          ...(person.famousWorksOrActs || []),
        ].some((value) =>
          String(value || '').toLowerCase().includes(query)
        );

      const matchesGovernorate =
        governorateFilter === 'all' ||
        person.governorateName === governorateFilter;

      return matchesSearch && matchesGovernorate;
    });
  }, [people, searchQuery, governorateFilter]);

  const featuredPerson = filteredPeople[0];

  const handleContributeSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!isAdmin) {
      setSubmitError('إضافة الشخصيات متاحة لمدير النظام فقط.');
      return;
    }

    if (!formData.name.trim()) {
      setSubmitError('اكتب اسم الشخصية يا غالي!');
      return;
    }

    if (!formData.biography.trim()) {
      setSubmitError('احكيلنا حكاية الشخصية وسيرتها.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const defaultImage =
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800';

    const newPersonPayload: Partial<LocalPerson> = {
      name: formData.name.trim(),
      governorateName: formData.governorateName,
      governorateId:
        GOV_IDS[formData.governorateName] || 'gov-qena',
      villageOrOrigin: formData.villageOrOrigin.trim(),
      originVillage: formData.villageOrOrigin.trim(),
      craftTitle: formData.craftTitle.trim() || 'رمز وعلم صعيدي أصيل',
      craftOrSkill: formData.craftTitle.trim() || 'رمز وعلم صعيدي أصيل',
      titleOrRole: formData.craftTitle.trim() || 'رمز وعلم صعيدي أصيل',
      biography: formData.biography.trim(),
      bio: formData.biography.trim(),
      quote: formData.quote.trim() || undefined,
      avatarUrl: formData.avatarUrl.trim() || defaultImage,
      photoUrl: formData.avatarUrl.trim() || defaultImage,
      yearsOfExperience: 35,
      isFeatured: true,
      status: 'pending_review',
      verificationStatus: 'pending_review',
      sourceName: 'توثيق مجتمعي شعبي - أبناء الصعيد',
      sourceType: 'community',
      historicalAnecdotes: formData.anecdote.trim()
        ? [
            {
              title: 'موقف صعيدي أصيل لا يُنسى',
              story: formData.anecdote.trim(),
            },
          ]
        : undefined,
      famousWorks: formData.famousWork.trim()
        ? [
            {
              title: formData.famousWork.trim(),
              type: 'بصمة وأثر خالد',
            },
          ]
        : undefined,
    };

    try {
      const saved = await wahApi.savePerson(newPersonPayload, {
        id: currentUser.id,
        role: currentRole,
      });

      setPeople((previous) => [saved, ...previous]);

      setSubmitSuccess(
        'اتحفظت الشخصية وهي دلوقتي مستنية مراجعة الأدمن.'
      );

      setTimeout(() => {
        setIsAddModalOpen(false);
        setSubmitSuccess(null);
        setFormData(EMPTY_FORM);
      }, 1600);
    } catch (error: any) {
      setSubmitError(
        error?.message || 'حصل خطأ أثناء الحفظ، جرّب تاني.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setGovernorateFilter('all');
  };

  const openPerson = (person: LocalPerson) => {
    setSelectedPerson(person);
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-cream text-espresso transition-colors duration-500 dark:bg-espresso-900 dark:text-cream"
    >
      <BrandPatternBackground />

      <FloatingDock
        count={people.length}
        label="ذاكرة الجنوب"
      />

      <PageNavigationBar
        backLabel="الرئيسية"
        onBack={() => setActivePage('home')}
        title="ذاكرة الجنوب"
      >
        <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-full border border-current/10 px-4 py-2 text-xs font-bold transition hover:bg-primary hover:text-white"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? 'animate-spin' : ''}
            />
            <span className="hidden sm:inline">تحديث الأرشيف</span>
          </button>
      </PageNavigationBar>

      {/* DOCUMENTARY INTRO */}
      <section className="relative overflow-hidden text-espresso transition-colors duration-500 dark:text-cream">
        <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full border border-black/5 dark:border-white/5" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-[350px] w-[350px] rounded-full border border-black/5 dark:border-white/5" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-[350px] w-[350px] rounded-full bg-primary/10 blur-[100px]" />

        <div className="relative mx-auto max-w-[1600px] px-5 pb-16 pt-16 sm:px-10 sm:pb-24 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_400px]">
            <div>
              <h1 className="text-[17vw] font-black leading-[0.95] tracking-[-0.07em] sm:text-[12vw] lg:text-[9rem]">
                ذاكرة
                <br />
                <span className="mr-[10vw] text-primary dark:text-primary-hover lg:mr-32">
                  الجنوب
                </span>
              </h1>

              <p className="mr-10 max-w-2xl text-sm font-medium leading-8 text-black/55 sm:text-base sm:leading-9 dark:text-white/55">
                مش مجرد أسماء في كتب التاريخ...
                دول ناس عاشوا واشتغلوا وحلموا، وسابوا
                في بلادهم حكايات تستاهل تفضل عايشة.
                هنا بنحفظ سيرتهم ونحكي أثرهم للأجيال.
              </p>

              <button
                onClick={() =>
                  document
                    .getElementById('documentary-archive')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="mt-9 inline-flex items-center gap-3 border border-primary/50 px-6 py-4 text-xs font-black text-primary transition hover:bg-espresso hover:text-white dark:text-primary-hover dark:hover:bg-white dark:hover:text-black"
              >
                <Play size={15} fill="currentColor" />
                اكتشف الحكايات
                <ArrowUpLeft size={15} />
              </button>
            </div>
            <ArchiveStatsCard
              eyebrow="THE PEOPLE ARCHIVE"
              icon={Film}
              stats={[
                {
                  value: people.length.toString().padStart(2, '0'),
                  label: <>شخصية في<br />الأرشيف</>,
                },
                {
                  value: GOVERNORATES.length.toString().padStart(2, '0'),
                  label: <>محافظة<br />صعيدية ممثلة</>,
                },
              ]}
              footer="بنحفظ حكايات الناس عشان تفضل عايشة"
            />
          </div>
        </div>
      </section>

      {/* UNCLE WAH */}
      <div className="relative z-20 mx-auto -mt-5 mb-12 max-w-[1500px] px-4 sm:px-8">
        <UncleWahHeroBanner
          doorTitle="حكايات ورموز من قلب الصعيد"
          doorBadge="أرشيف ذاكرة الجنوب"
          mascotSrc="/mascot/fan.png"
          mascotRole="عم وه حارس الحكايات"
          quote="كل بلد فيها راجل عظيم، وكل راجل وراه حكاية تستاهل تتسمع.. تعالى نعرف حكايات أهل الجنوب."
          statsText={`${people.length} شخصية في الأرشيف`}
          actionText={isAdmin ? 'أضف شخصية للأرشيف' : undefined}
          onAction={
            isAdmin ? () => setIsAddModalOpen(true) : undefined
          }
        />
      </div>

      {/* ARCHIVE FILTER */}
      <section
        id="documentary-archive"
        className="relative z-20 mx-auto max-w-[1500px] px-4 sm:px-8"
      >
        <div className="mb-9 flex flex-col gap-5 border-b border-black/10 pb-7 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-primary dark:text-primary-hover">
              <span className="h-px w-8 bg-primary" />
              THE PEOPLE OF UPPER EGYPT
            </div>
            <h2 className="text-3xl font-black sm:text-4xl">
              أرشيف الشخصيات
            </h2>
            <p className="mt-2 text-xs leading-7 text-foreground-secondary">
              فتّش في الحكايات، واكتشف الناس اللي سابوا بصمتهم.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن شخصية أو حكاية..."
                className="h-12 w-full rounded-xl border border-transparent bg-black/[0.035] pr-11 pl-10 text-sm text-espresso outline-none transition placeholder:text-black/35 focus:border-primary/40 focus:bg-transparent dark:bg-cream/[0.04] dark:text-cream dark:placeholder:text-white/30 dark:focus:bg-white/[0.06]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="relative min-w-[170px]">
              <select
                value={governorateFilter}
                onChange={(e) => setGovernorateFilter(e.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-transparent bg-black/[0.035] px-4 pl-10 text-sm font-bold text-espresso outline-none transition focus:border-primary/40 dark:bg-cream/[0.04] dark:text-cream dark:focus:bg-white/[0.06]"
              >
                <option value="all" className="bg-white text-espresso dark:bg-espresso-900 dark:text-cream">كل المحافظات</option>
                {governorates.map((gov) => (
                  <option key={gov} value={gov} className="bg-white text-espresso dark:bg-espresso-900 dark:text-cream">
                    {gov}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              />
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex h-12 items-center justify-center gap-2 bg-primary px-5 text-xs font-black text-white transition hover:bg-primary-hover"
              >
                <Plus size={16} />
                إضافة شخصية
              </button>
            )}
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-foreground-secondary">
            <Bookmark size={14} className="text-primary dark:text-primary-hover" />
            <span>
              عرض {filteredPeople.length} من {people.length} شخصية
            </span>
          </div>

          {(searchQuery || governorateFilter !== 'all') && (
            <button
              onClick={resetFilters}
              className="font-bold text-primary underline underline-offset-4 dark:text-primary-hover"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      </section>

      {/* FEATURED DOCUMENTARY */}

{!isLoading && featuredPerson && (
  <section className="mx-auto max-w-[1500px] px-4 sm:px-8">
    <div className="group relative mb-16 min-h-[480px] overflow-hidden rounded-[2rem] bg-espresso-900 shadow-2xl sm:min-h-[580px] lg:min-h-[650px]">

      {/* Background Image */}
      <img
        src={getPersonPhoto(featuredPerson)}
        alt={featuredPerson.name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1800ms] group-hover:scale-105"
      />

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-l from-black/65 via-transparent to-transparent" />

      {/* Top Meta */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-5 sm:p-9">
        <div className="flex items-center gap-3 rounded-full border border-white/20 bg-black/30 px-4 py-2.5 text-[10px] font-bold text-white backdrop-blur-xl">
          <Film size={14} className="text-gold" />
          حكاية من ذاكرة الصعيد
        </div>

        <span className="text-[10px] font-bold tracking-[0.3em] text-white/70">
          WAH DOCUMENTARIES
        </span>
      </div>

      {/* Main Content */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-10 lg:p-14">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_340px]">

          {/* Featured Identity */}
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3 text-[10px] font-bold tracking-[0.25em] text-gold">
              <span className="h-px w-10 bg-gold" />
              FEATURED PERSONALITY
              <span className="text-white/50">/ 001</span>
            </div>

            <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-white/75">
              <MapPin size={14} className="text-gold" />
              {featuredPerson.governorateName}
              {getOrigin(featuredPerson)
                ? ` — ${getOrigin(featuredPerson)}`
                : ''}
            </div>

            <h2 className="mb-5 text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
              {featuredPerson.name}
            </h2>

            <div className="mb-7 inline-flex border-r-2 border-gold pr-4 text-sm font-bold text-white/80">
              {getRole(featuredPerson)}
            </div>

            <button
              onClick={() => openPerson(featuredPerson)}
              className="group/btn inline-flex items-center gap-4 rounded-full bg-white px-6 py-3.5 text-sm font-black text-espresso transition-all duration-300 hover:bg-gold hover:text-white"
            >
              اكتشف الحكاية
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-espresso text-white transition-transform group-hover/btn:-translate-x-1">
                <ArrowUpLeft size={16} />
              </span>
            </button>
          </div>

          {/* Story Preview */}
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.2em] text-gold">
                THE STORY
              </span>
              <Film size={17} className="text-white/60" />
            </div>

            <h3 className="mb-3 text-xl font-black">
              حكاية تستحق إنها تتحكي
            </h3>

            <p className="line-clamp-4 text-xs leading-8 text-white/75">
              {getBio(featuredPerson) ||
                'حكاية من حكايات الجنوب تستحق أن تُروى.'}
            </p>

            <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-4">
              <span className="text-[9px] font-bold tracking-widest text-white/50">
                WAH / PEOPLE ARCHIVE
              </span>
              <span className="text-xs font-bold text-gold">
                01 — 01
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Decorative Index */}
      <div className="absolute left-6 top-1/2 hidden -translate-y-1/2 -rotate-90 text-[9px] font-bold tracking-[0.5em] text-white/40 lg:block">
        STORIES FROM UPPER EGYPT
      </div>
    </div>
  </section>
)}

      {/* ARCHIVE GRID */}

<section className="mx-auto max-w-[1500px] px-4 pb-28 sm:px-8">

  {/* Archive Heading */}
  <div className="mb-10 flex flex-col justify-between gap-5 border-b border-black/10 pb-6 dark:border-white/10 sm:flex-row sm:items-end">
    <div>
      <div className="mb-3 flex items-center gap-3 text-[10px] font-black tracking-[0.25em] text-primary dark:text-gold">
        <span className="h-px w-8 bg-primary dark:bg-gold" />
        WAH PEOPLE ARCHIVE
      </div>
      <h2 className="text-3xl font-black sm:text-4xl">
        وجوه وحكايات
      </h2>
      <p className="mt-3 max-w-lg text-xs leading-7 text-foreground-secondary">
        وراء كل اسم حكاية، ووراء كل حكاية أثر يستحق إنه يفضل عايش.
      </p>
    </div>

    <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest text-foreground-muted">
      <Camera size={16} />
      DOCUMENTARY COLLECTION
      <span className="h-1 w-1 rounded-full bg-primary dark:bg-gold" />
      {filteredPeople.filter(
        (person) => person.id !== featuredPerson?.id
      ).length} FILES
    </div>
  </div>

  {isLoading ? (
    <div className="grid gap-8 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="grid animate-pulse gap-5 sm:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="aspect-[4/5] bg-black/5 dark:bg-white/5" />
          <div className="space-y-4 py-4">
            <div className="h-3 w-1/3 bg-black/5 dark:bg-white/5" />
            <div className="h-8 w-3/4 bg-black/5 dark:bg-white/5" />
            <div className="h-3 w-full bg-black/5 dark:bg-white/5" />
            <div className="h-3 w-4/5 bg-black/5 dark:bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  ) : filteredPeople.filter(
    (person) => person.id !== featuredPerson?.id
  ).length === 0 ? (
    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-current/20 text-center">
      <Users size={35} className="mb-5 text-primary dark:text-gold" />
      <h3 className="text-xl font-black">
        مفيش حكايات هنا لسه
      </h3>
      <p className="mt-3 text-sm text-foreground-secondary">
        جرّب تغير كلمات البحث أو تختار محافظة تانية.
      </p>
      <button
        onClick={resetFilters}
        className="mt-6 rounded-full bg-primary px-6 py-3 text-xs font-bold text-white transition hover:bg-primary-hover"
      >
        عرض كل الشخصيات
      </button>
    </div>
  ) : (
    <div className="grid gap-x-10 gap-y-14 lg:grid-cols-2">
      {filteredPeople
        .filter((person) => person.id !== featuredPerson?.id)
        .map((person, index) => (
          <article
            key={person.id || person.slug || index}
            className="group relative"
          >
            <div className="grid gap-5 sm:grid-cols-[0.9fr_1.1fr] sm:gap-6">

              {/* Documentary Portrait */}
              <button
                onClick={() => navigateToPerson(person.slug)}
                className="relative block aspect-[4/5] overflow-hidden rounded-xl bg-espresso-800 text-right"
              >
                <img
                  src={getPersonPhoto(person)}
                  alt={person.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-1000 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                  <span className="border border-white/30 bg-black/30 px-3 py-2 text-[9px] font-bold tracking-widest text-white backdrop-blur-md">
                    FILE / {String(index + 2).padStart(3, '0')}
                  </span>
                  <Film size={17} className="text-white/80" />
                </div>

                <div className="absolute bottom-0 right-0 w-full p-5 text-white">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold text-gold">
                    <MapPin size={12} />
                    {person.governorateName}
                  </div>

                  <h3 className="text-2xl font-black leading-tight">
                    {person.name}
                  </h3>

                  <p className="mt-2 text-[11px] font-semibold text-white/70">
                    {getRole(person)}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-white/25 pt-3">
                    <span className="text-[10px] font-bold">
                      استكشف الشخصية
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 transition duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-espresso">
                      <ArrowUpLeft size={15} />
                    </span>
                  </div>
                </div>
              </button>

              {/* Editorial Information */}
              <div className="flex min-w-0 flex-col justify-center py-2 sm:py-5">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-7 bg-primary dark:bg-gold" />
                  <span className="text-[9px] font-black tracking-[0.2em] text-primary dark:text-gold">
                    THE STORY / {String(index + 1).padStart(3, '0')}
                  </span>
                </div>

                {getOrigin(person) && (
                  <div className="mb-4 flex items-center gap-2 text-[10px] text-foreground-muted">
                    <Compass size={13} />
                    {getOrigin(person)}
                  </div>
                )}

                <h3 className="mb-4 text-xl font-black leading-relaxed sm:text-2xl">
                  {person.name}
                </h3>

                <p className="line-clamp-4 text-xs leading-8 text-foreground-secondary sm:text-sm">
                  {getBio(person) ||
                    'حكاية من حكايات الجنوب تستحق أن تُروى.'}
                </p>

                {person.quote && (
                  <div className="relative mt-5 border-r-2 border-primary py-2 pr-4 dark:border-gold">
                    <Quote
                      size={16}
                      className="mb-2 text-primary/60 dark:text-gold/60"
                    />
                    <p className="line-clamp-3 text-xs italic leading-7 text-foreground-secondary">
                      {person.quote}
                    </p>
                  </div>
                )}

                <div className="mt-auto border-t border-black/10 pt-5 dark:border-white/10">
                  <button
                    onClick={() => openPerson(person)}
                    className="group/read inline-flex items-center gap-3 text-xs font-black text-primary transition dark:text-gold"
                  >
                    اقرأ الحكاية كاملة
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 transition group-hover/read:bg-primary group-hover/read:text-white dark:border-gold/30 dark:group-hover/read:bg-gold dark:group-hover/read:text-espresso">
                      <ArrowUpLeft size={15} />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Archive Divider */}
            <div className="mt-8 h-px w-full bg-gradient-to-l from-primary/30 via-black/10 to-transparent dark:from-gold/30 dark:via-white/10" />
          </article>
        ))}
    </div>
  )}
</section>

      {/* PERSON DOCUMENTARY MODAL */}
      {selectedPerson && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          <button
            aria-label="إغلاق النافذة"
            onClick={() => setSelectedPerson(null)}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          <div className="relative z-10 flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden bg-cream text-espresso shadow-2xl dark:bg-espresso-900 dark:text-cream">
            <button
              onClick={() => setSelectedPerson(null)}
              className="absolute left-4 top-4 z-30 flex h-10 w-10 items-center justify-center bg-black/50 text-white transition hover:bg-primary"
            >
              <X size={19} />
            </button>

            {/* Documentary cover */}
            <div className="relative grid shrink-0 bg-espresso text-cream sm:grid-cols-[250px_1fr]">
              <div className="relative h-[220px] overflow-hidden sm:h-[260px]">
                <img
                  src={getPersonPhoto(selectedPerson)}
                  alt={selectedPerson.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:bg-gradient-to-l" />
              </div>

              <div className="flex flex-col justify-center p-6 sm:p-9">
                <div className="mb-5 flex items-center gap-2 text-[9px] tracking-[0.25em] text-gold">
                  <Film size={14} />
                  WAH DOCUMENTARY ARCHIVE
                </div>

                <span className="mb-3 text-xs font-bold text-gold">
                  {getRole(selectedPerson)}
                </span>

                <h2 className="text-3xl font-black sm:text-4xl">
                  {selectedPerson.name}
                </h2>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-cream/60">
                  {selectedPerson.governorateName && (
                    <span className="flex items-center gap-2">
                      <MapPin size={13} />
                      {selectedPerson.governorateName}
                    </span>
                  )}

                  {getOrigin(selectedPerson) && (
                    <span>{getOrigin(selectedPerson)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Documentary chapters */}
            <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-10">
              <div className="mx-auto max-w-3xl space-y-10">
                <div>
                  <div className="mb-5 flex items-center gap-3">
                    <span className="text-xs font-black text-primary dark:text-primary-hover">
                      01
                    </span>
                    <span className="h-px flex-1 bg-current/10" />
                    <h3 className="text-sm font-black">
                      الحكاية والبداية
                    </h3>
                  </div>

                  <p className="text-sm leading-9 text-foreground-secondary">
                    {getBio(selectedPerson) ||
                      'سيرة حافلة بالعطاء والأثر الطيب.'}
                  </p>
                </div>

                {selectedPerson.famousAnecdote && (
                  <div>
                    <div className="mb-5 flex items-center gap-3">
                      <span className="text-xs font-black text-primary dark:text-primary-hover">
                        02
                      </span>
                      <span className="h-px flex-1 bg-current/10" />
                      <h3 className="text-sm font-black">
                        حكاية من حياته
                      </h3>
                    </div>

                    <div className="border-r-2 border-primary bg-primary/5 p-6 text-sm leading-9 dark:bg-primary/10">
                      {selectedPerson.famousAnecdote}
                    </div>
                  </div>
                )}

                {selectedPerson.famousWorksOrActs &&
                  selectedPerson.famousWorksOrActs.length > 0 && (
                    <div>
                      <div className="mb-5 flex items-center gap-3">
                        <span className="text-xs font-black text-primary dark:text-primary-hover">
                          03
                        </span>
                        <span className="h-px flex-1 bg-current/10" />
                        <h3 className="text-sm font-black">
                          الأثر اللي سابه
                        </h3>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {selectedPerson.famousWorksOrActs.map(
                          (work, index) => (
                            <div
                              key={index}
                              className="flex gap-3 border border-current/10 p-4"
                            >
                              <span className="font-black text-primary dark:text-primary-hover">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <span className="text-xs leading-7">
                                {work}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {selectedPerson.localImpact && (
                  <div>
                    <div className="mb-5 flex items-center gap-3">
                      <span className="text-xs font-black text-primary dark:text-primary-hover">
                        04
                      </span>
                      <span className="h-px flex-1 bg-current/10" />
                      <h3 className="text-sm font-black">
                        أثره في الصعيد
                      </h3>
                    </div>

                    <p className="text-sm leading-9 text-foreground-secondary">
                      {selectedPerson.localImpact}
                    </p>
                  </div>
                )}

                {selectedPerson.quote && (
                  <div className="relative border-y border-primary/30 py-8 text-center dark:border-primary-hover/30">
                    <Quote
                      size={28}
                      className="mx-auto mb-4 text-primary dark:text-primary-hover"
                    />
                    <p className="text-lg font-black italic leading-9">
                      «{selectedPerson.quote}»
                    </p>
                  </div>
                )}

                <div className="grid gap-3 border-t border-current/10 pt-6 sm:grid-cols-2">
                  {selectedPerson.sourceName && (
                    <div className="bg-black/[0.03] p-4 dark:bg-white/[0.04]">
                      <div className="mb-2 text-[10px] text-foreground-muted">
                        مصدر التوثيق
                      </div>
                      <div className="text-xs font-black">
                        {selectedPerson.sourceName}
                      </div>
                    </div>
                  )}

                  {selectedPerson.yearsOfExperience && (
                    <div className="bg-black/[0.03] p-4 dark:bg-white/[0.04]">
                      <div className="mb-2 text-[10px] text-foreground-muted">
                        مدة المسيرة
                      </div>
                      <div className="text-xs font-black">
                        {selectedPerson.yearsOfExperience} عاماً
                      </div>
                    </div>
                  )}
                </div>

                <div className="pb-5 text-center text-[9px] tracking-[0.3em] text-foreground-muted">
                  END OF DOCUMENTARY EXCERPT — WAH ARCHIVE
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t border-current/10 bg-surface p-4 sm:flex-row sm:justify-between">
              <button
                onClick={() => setSelectedPerson(null)}
                className="px-5 py-3 text-xs font-bold text-foreground-secondary hover:bg-black/5 dark:hover:bg-white/5"
              >
                إغلاق
              </button>

              <button
                onClick={() => {
                  const slug = selectedPerson.slug;
                  setSelectedPerson(null);
                  navigateToPerson(slug);
                }}
                className="flex items-center justify-center gap-3 bg-primary px-6 py-3 text-xs font-black text-white transition hover:bg-primary-hover"
              >
                شاهد السيرة الكاملة
                <ArrowUpLeft size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PERSON MODAL */}
      {isAdmin && isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6">
          <button
            aria-label="إغلاق"
            onClick={() =>
              !isSubmitting && setIsAddModalOpen(false)
            }
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-current/10 bg-cream p-6 text-espresso shadow-2xl dark:bg-espresso-900 dark:text-cream sm:p-9">
            <button
              onClick={() =>
                !isSubmitting && setIsAddModalOpen(false)
              }
              className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
            >
              <X size={17} />
            </button>

            <div className="mb-7">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold text-primary dark:text-primary-hover">
                <Clapperboard size={16} />
                DOCUMENTARY CONTRIBUTION
              </div>
              <h3 className="text-2xl font-black">
                أضف حكاية جديدة للأرشيف
              </h3>
              <p className="mt-3 text-xs leading-7 text-foreground-secondary">
                ساعدنا نحفظ سيرة شخصية من بلدك ونوثق أثرها للأجيال.
              </p>
            </div>

            {submitSuccess && (
              <div className="mb-5 flex items-center gap-3 border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 size={20} />
                {submitSuccess}
              </div>
            )}

            {submitError && (
              <div className="mb-5 flex items-center gap-3 border border-red-500/30 bg-red-500/10 p-4 text-xs font-bold text-red-600">
                <X size={18} />
                {submitError}
              </div>
            )}

            <form
              onSubmit={handleContributeSubmit}
              className="space-y-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black">
                    اسم الشخصية *
                  </label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    placeholder="اسم الشخصية"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black">
                    المحافظة *
                  </label>
                  <select
                    value={formData.governorateName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        governorateName: e.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    {GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black">
                    القرية أو المركز
                  </label>
                  <input
                    value={formData.villageOrOrigin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        villageOrOrigin: e.target.value,
                      })
                    }
                    placeholder="القرية أو المركز"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black">
                    المهنة أو اللقب
                  </label>
                  <input
                    value={formData.craftTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        craftTitle: e.target.value,
                      })
                    }
                    placeholder="شيخ صنعة، شاعر، فنان..."
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black">
                  السيرة والحكاية *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.biography}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      biography: e.target.value,
                    })
                  }
                  placeholder="احكيلنا عن نشأته وحياته وأثره..."
                  className={`${inputClass} resize-y leading-8`}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black">
                  موقف أو حكاية مشهورة
                </label>
                <textarea
                  rows={3}
                  value={formData.anecdote}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      anecdote: e.target.value,
                    })
                  }
                  placeholder="احكيلنا موقف يستاهل يتوثق..."
                  className={`${inputClass} resize-y leading-8`}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black">
                    أشهر أعماله
                  </label>
                  <input
                    value={formData.famousWork}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        famousWork: e.target.value,
                      })
                    }
                    placeholder="عمل أو أثر معروف"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black">
                    مقولة مشهورة
                  </label>
                  <input
                    value={formData.quote}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quote: e.target.value,
                      })
                    }
                    placeholder="حكمة أو كلمة مشهورة"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black">
                  رابط الصورة
                </label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      avatarUrl: e.target.value,
                    })
                  }
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-current/10 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddModalOpen(false)}
                  className="border border-current/15 px-6 py-3 text-xs font-bold"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 bg-primary px-7 py-3 text-xs font-black text-white transition hover:bg-primary-hover disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'جاري حفظ الشخصية...'
                  ) : (
                    <>
                      <Plus size={16} />
                      حفظ في الأرشيف
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default PeoplePage;
