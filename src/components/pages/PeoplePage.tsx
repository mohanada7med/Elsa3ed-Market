import React, { useState, useEffect, useMemo } from 'react';
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
  Hammer,
  ChevronDown,
  X,
  Compass,
  Plus,
  CheckCircle2,
  Quote,
  BookOpen,
  RefreshCw,
  Scroll,
  Loader2,
  Edit3,
  ShieldCheck
} from 'lucide-react';

const INITIAL_BATCH_SIZE = 9;
const NEXT_BATCH_SIZE = 6;

// كاش محلي خارج الـ Component لمنع الفلاش وتغير الشكل عند الـ Refresh والتنقل
let peopleCache: LocalPerson[] | null = null;

const emptyFormState = {
  name: '',
  governorateName: 'قنا',
  villageOrOrigin: '',
  craftTitle: '',
  biography: '',
  anecdote: '',
  famousWork: '',
  quote: '',
  avatarUrl: ''
};

export const PeoplePage: React.FC = () => {
  const { navigateToPerson, setActivePage, user } = useApp();

  const isAdmin = Boolean(
    (user as any)?.isAdmin ||
    (user as any)?.role === 'admin' ||
    (user as any)?.email?.includes('admin')
  );

  // البدء بالبيانات المخزنة فوراً لمنع شاشة التحميل البيضاء وتغير الـ Layout
  const [people, setPeople] = useState<LocalPerson[]>(() => peopleCache || []);
  const [isLoading, setIsLoading] = useState<boolean>(!peopleCache);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [governorateFilter, setGovernorateFilter] = useState<string>('all');
  const [selectedPersonForModal, setSelectedPersonForModal] = useState<LocalPerson | null>(null);

  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<LocalPerson | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState(emptyFormState);

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

  const fetchPeopleData = async (forceRefresh = false) => {
    try {
      const data = await wahApi.getPeople({ _t: forceRefresh ? Date.now().toString() : 'cache' });
      const list = Array.isArray(data) ? data : [];
      peopleCache = list;
      setPeople(list);
    } catch (err) {
      console.warn('Could not load people:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (!peopleCache) {
        setIsLoading(true);
      }
      await fetchPeopleData(false);
      if (isMounted) {
        setIsLoading(false);
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchPeopleData(true);
      setVisibleCount(INITIAL_BATCH_SIZE);
    } finally {
      setIsRefreshing(false);
    }
  };

  const governorates = useMemo(
    () => Array.from(new Set(people.map((p) => p.governorateName))).filter(Boolean),
    [people]
  );

  const filteredPeople = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return people.filter((person) => {
      const role = person.craftTitle || (person as any).craftOrSkill || (person as any).titleOrRole || '';
      const bioText = person.bio || (person as any).biography || '';
      const originText = person.originVillage || (person as any).villageOrOrigin || '';
      const anecdoteText = person.famousAnecdote || '';

      const matchesSearch =
        !query ||
        person.name?.toLowerCase().includes(query) ||
        role?.toLowerCase().includes(query) ||
        bioText?.toLowerCase().includes(query) ||
        person.governorateName?.toLowerCase().includes(query) ||
        originText?.toLowerCase().includes(query) ||
        anecdoteText?.toLowerCase().includes(query) ||
        (person.famousWorksOrActs && person.famousWorksOrActs.some((w) => w.toLowerCase().includes(query)));

      const matchesGov = governorateFilter === 'all' || person.governorateName === governorateFilter;
      return matchesSearch && matchesGov;
    });
  }, [people, searchQuery, governorateFilter]);

  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE);
  }, [searchQuery, governorateFilter]);

  const visiblePeople = useMemo(() => {
    return filteredPeople.slice(0, visibleCount);
  }, [filteredPeople, visibleCount]);

  const hasMore = visibleCount < filteredPeople.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + NEXT_BATCH_SIZE);
      setIsLoadingMore(false);
    }, 250);
  };

  const openEditModal = (person: LocalPerson) => {
    if (!isAdmin) return;
    setEditingPerson(person);
    setFormData({
      name: person.name || '',
      governorateName: person.governorateName || 'قنا',
      villageOrOrigin: person.originVillage || (person as any).villageOrOrigin || '',
      craftTitle: person.craftTitle || (person as any).craftOrSkill || (person as any).titleOrRole || '',
      biography: person.bio || (person as any).biography || '',
      anecdote: person.famousAnecdote || '',
      famousWork: person.famousWorksOrActs?.[0] || '',
      quote: person.quote || '',
      avatarUrl: person.avatarUrl || person.photoUrl || ''
    });
    setSubmitError(null);
    setSubmitSuccess(null);
    setIsFormModalOpen(true);
  };

  const openAddModal = () => {
    if (!isAdmin) return;
    setEditingPerson(null);
    setFormData(emptyFormState);
    setSubmitError(null);
    setSubmitSuccess(null);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!formData.name.trim()) {
      setSubmitError('برجاء كتابة اسم الشخصية!');
      return;
    }
    if (!formData.biography.trim()) {
      setSubmitError('برجاء كتابة السيرة والنشأة!');
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

    const payload: Partial<LocalPerson> = {
      ...(editingPerson ? editingPerson : {}),
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
      famousAnecdote: formData.anecdote.trim() || undefined,
      famousWorksOrActs: formData.famousWork.trim() ? [formData.famousWork.trim()] : undefined
    };

    try {
      let resultPerson: LocalPerson;

      if (editingPerson) {
        if (typeof (wahApi as any).updatePerson === 'function') {
          resultPerson = await (wahApi as any).updatePerson(editingPerson.id || editingPerson.slug, payload);
        } else {
          resultPerson = await wahApi.contributePerson({ ...payload, id: editingPerson.id } as any);
        }

        const updatedList = people.map((p) =>
          ((p.id && p.id === editingPerson.id) || p.slug === editingPerson.slug ? { ...p, ...payload, ...resultPerson } : p)
        );
        peopleCache = updatedList;
        setPeople(updatedList);

        if (selectedPersonForModal && ((selectedPersonForModal.id && selectedPersonForModal.id === editingPerson.id) || selectedPersonForModal.slug === editingPerson.slug)) {
          setSelectedPersonForModal((prev) => (prev ? { ...prev, ...payload, ...resultPerson } : null));
        }

        setSubmitSuccess('تم حفظ التعديلات بنجاح!');
      } else {
        resultPerson = await wahApi.contributePerson(payload);
        const newList = [resultPerson, ...people];
        peopleCache = newList;
        setPeople(newList);
        setSubmitSuccess('تم تسجيل الشخصية بنجاح!');
      }

      setTimeout(() => {
        setIsFormModalOpen(false);
        setEditingPerson(null);
        setSubmitSuccess(null);
        setFormData(emptyFormState);
      }, 1200);
    } catch (err: any) {
      setSubmitError(err?.message || 'حصل خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300"
    >
      {/* NAVBAR */}
      <header className="relative z-50 border-b border-border-subtle bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button
            onClick={() => setActivePage('home')}
            className="group flex items-center gap-3 text-sm font-bold transition-all hover:text-accent cursor-pointer"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface transition-all group-hover:bg-btn-dark group-hover:text-white">
              <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" />
            </span>
            <span className="hidden sm:block">الرئيسية</span>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <div className="text-[9px] font-bold tracking-[0.35em] text-accent">WAH</div>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-sm font-black">
              <span>أعلام الصعيد</span>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                  <ShieldCheck size={11} />
                  <span>لوحة الإدارة</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-full border border-border-subtle px-3.5 py-2 text-xs font-bold transition-all hover:bg-surface text-foreground-secondary cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-accent' : ''} />
              <span className="hidden md:inline">تحديث</span>
            </button>

            <button
              onClick={() => setActivePage('cultural-crafts')}
              className="flex items-center gap-2 rounded-full border border-border-subtle px-4 py-2.5 text-xs font-bold transition-all hover:bg-btn-dark hover:text-white cursor-pointer"
            >
              <span className="hidden sm:block">موسوعة الحرف</span>
              <Hammer size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
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

              <h1 className="max-w-5xl text-[14vw] font-black leading-[0.78] tracking-[-0.08em] sm:text-[11vw] lg:text-[9rem] xl:text-[11rem]">
                ناس
                <br />
                <span className="mr-[8vw] text-accent lg:mr-28">الصعيد</span>
              </h1>

              <div className="mt-10 flex max-w-2xl items-start gap-5">
                <div className="mt-2 h-16 w-px bg-accent" />
                <p className="text-sm leading-8 text-foreground-secondary sm:text-base">
                  أعلام ورجالة شرفوا الصعيد ورفعوا راسه؛ من أدباء ومفكرين وشعراء عامية، لشيوخ التلاوة وفنانين وأصحاب بصمة حقيقية.. ناس طالعة من طين ونيل الجنوب، حفروا أساميهم في تاريخ البلد وكل حتة في الدنيا بنَفَسهم الأصيل.
                </p>
              </div>
            </div>

            {/* Stats Card */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-[2rem] border border-border-subtle bg-surface p-7 shadow-lg">
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
                        علم ورمز موثق
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

      {/* FLOATING FILTERS BAR */}
      <section className="relative z-30 mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div className="rounded-[1.5rem] border border-border-subtle bg-surface p-3 shadow-xl">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، القرية، الصنعة، حكاية أو أثر خالد..."
                className="h-12 w-full rounded-xl border border-border-subtle bg-surface-subtle pr-11 pl-10 text-sm text-foreground outline-none transition-all placeholder:text-foreground-muted focus:border-accent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 hover:bg-border-subtle text-foreground-muted cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="relative lg:w-72">
              <select
                value={governorateFilter}
                onChange={(e) => setGovernorateFilter(e.target.value)}
                className="
                  h-12 w-full appearance-none rounded-xl border border-border-subtle
                  bg-surface-subtle text-foreground
                  dark:bg-[#1A1612] dark:text-[#EDE8E1] dark:border-white/10
                  px-4 text-sm font-bold outline-none transition-all
                  focus:border-accent cursor-pointer dark:[color-scheme:dark]
                "
              >
                <option
                  value="all"
                  className="bg-surface text-foreground dark:bg-[#1A1612] dark:text-[#EDE8E1]"
                >
                  كل المحافظات ({people.length})
                </option>
                {governorates.map((gov) => {
                  const count = people.filter((p) => p.governorateName === gov).length;
                  return (
                    <option
                      key={gov}
                      value={gov}
                      className="bg-surface text-foreground dark:bg-[#1A1612] dark:text-[#EDE8E1]"
                    >
                      {gov} ({count})
                    </option>
                  );
                })}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-btn-dark px-5 text-white">
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
                  className="mr-5 text-[10px] font-bold underline underline-offset-4 cursor-pointer text-accent"
                >
                  إعادة
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MASTERS GRID SECTION */}
      <section className="mx-auto max-w-[1600px] px-5 pb-24 pt-14 sm:px-8 sm:pt-20 lg:px-12">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 text-[10px] font-bold tracking-[0.3em] text-accent">
              سجل الشخصيات • معروض {visiblePeople.length} من أصل {filteredPeople.length}
            </div>
            <h2 className="text-3xl font-black sm:text-4xl">أعلام ورموز الصعيد</h2>
          </div>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-black text-white shadow transition-all hover:bg-accent/90 cursor-pointer"
              >
                <Plus size={15} />
                <span>أضف سيرة جديدة</span>
              </button>
            )}
            <div className="hidden items-center gap-2 text-xs text-foreground-muted sm:flex">
              <Compass size={14} />
              <span>توثيق معتمد وموثوق</span>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-3xl border border-border-subtle bg-surface/40 p-4"
              >
                <div className="aspect-square w-full rounded-2xl bg-border-subtle/70" />
                <div className="mt-4 h-5 w-1/2 rounded-lg bg-border-subtle" />
                <div className="mt-3 h-4 w-full rounded bg-border-subtle/50" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPeople.length === 0 && (
          <div className="mx-auto flex min-h-[360px] max-w-lg flex-col items-center justify-center rounded-3xl border border-dashed border-border-subtle bg-surface/30 p-8 text-center backdrop-blur-md">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
              <Scroll size={24} />
            </div>
            <h3 className="text-xl font-black text-foreground">لم يُدوَّن في السجل بعد</h3>
            <p className="mt-2 text-xs leading-relaxed text-foreground-secondary">
              جرّب البحث باسم القرية أو المركز، أو تصفح كل المحافظات.
            </p>
            {(searchQuery.trim() !== '' || governorateFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setGovernorateFilter('all');
                }}
                className="mt-5 rounded-full bg-btn-dark px-6 py-2.5 text-xs font-black text-white transition-all hover:bg-accent cursor-pointer"
              >
                عرض كافة السجلات ({people.length})
              </button>
            )}
          </div>
        )}

        {/* Square Portrait Grid */}
        {!isLoading && visiblePeople.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePeople.map((person, index) => {
                const photo = getPersonPhoto(person);
                const roleTitle =
                  person.craftTitle ||
                  (person as any).craftOrSkill ||
                  (person as any).titleOrRole ||
                  'رمز وعلم صعيدي';
                const bioText = person.bio || (person as any).biography || '';
                const originVillage =
                  person.originVillage || (person as any).villageOrOrigin || '';

                return (
                  <article
                    key={person.id || person.slug || index}
                    className="group relative flex flex-col justify-between rounded-3xl border border-border-subtle bg-surface p-4 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-accent hover:shadow-xl"
                  >
                    <div>
                      {/* Square Image Frame (1:1 Ratio) */}
                      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border-subtle bg-surface-subtle">
                        <img
                          src={photo}
                          alt={person.name}
                          loading="lazy"
                          onClick={() => navigateToPerson(person.slug)}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-pointer"
                        />

                        {/* Governorate Tag */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/60 px-3 py-1 text-[10px] font-black text-white backdrop-blur-md">
                          <MapPin size={11} className="text-accent" />
                          <span>{person.governorateName || 'الصعيد'}</span>
                        </div>

                        {/* Admin Action Button */}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(person);
                            }}
                            className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer z-10"
                            title="تعديل بيانات الشخصية (أدمن)"
                          >
                            <Edit3 size={13} />
                          </button>
                        )}

                        {/* Origin Ribbon */}
                        {originVillage && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-3 pt-8 text-[11px] font-bold text-white/95">
                            ديار: {originVillage}
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="mt-4 px-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-md bg-accent/10 px-2.5 py-0.5 text-[10px] font-black text-accent">
                            {roleTitle}
                          </span>

                          <span className="font-mono text-[10px] font-bold text-foreground-muted">
                            وثيقة #{(index + 1).toString().padStart(2, '0')}
                          </span>
                        </div>

                        <h3
                          onClick={() => navigateToPerson(person.slug)}
                          className="mt-2 text-xl font-black tracking-tight text-foreground transition-colors group-hover:text-accent cursor-pointer sm:text-2xl"
                        >
                          {person.name}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foreground-secondary">
                          {bioText}
                        </p>

                        {/* Quote / Anecdote */}
                        {person.quote ? (
                          <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-dashed border-accent/30 bg-accent/5 p-2 text-[11px] italic text-foreground/85">
                            <Quote size={11} className="shrink-0 text-accent" />
                            <span className="truncate">«{person.quote}»</span>
                          </div>
                        ) : person.famousAnecdote ? (
                          <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-dashed border-border-subtle bg-surface-subtle p-2 text-[11px] text-foreground-secondary">
                            <Scroll size={11} className="shrink-0 text-accent" />
                            <span className="truncate">{person.famousAnecdote}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Card Bottom Bar */}
                    <div className="mt-5 flex items-center justify-between border-t border-border-subtle px-1 pt-3 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPersonForModal(person)}
                          className="inline-flex items-center gap-1 font-bold text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
                        >
                          <BookOpen size={13} className="text-accent" />
                          <span>الأرشيف</span>
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => openEditModal(person)}
                            className="inline-flex items-center gap-1 font-bold text-accent hover:underline cursor-pointer"
                          >
                            <Edit3 size={12} />
                            <span>تعديل</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => navigateToPerson(person.slug)}
                        className="inline-flex items-center gap-1 font-black text-accent transition-transform duration-300 group-hover:-translate-x-1 cursor-pointer"
                      >
                        <span>مطالعة السيرة</span>
                        <ArrowUpLeft size={13} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Incremental Load More Section */}
            {hasMore && (
              <div className="mt-14 flex flex-col items-center justify-center gap-3">
                <div className="flex items-center gap-2 text-xs text-foreground-muted font-medium">
                  <span>تم عرض {visiblePeople.length} من {filteredPeople.length} علم</span>
                  <span>•</span>
                  <span>{Math.round((visiblePeople.length / filteredPeople.length) * 100)}%</span>
                </div>

                <div className="h-1.5 w-48 overflow-hidden rounded-full bg-surface-subtle border border-border-subtle">
                  <div
                    className="h-full bg-accent transition-all duration-300 rounded-full"
                    style={{
                      width: `${(visiblePeople.length / filteredPeople.length) * 100}%`
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="mt-2 inline-flex items-center gap-2 rounded-full bg-btn-dark px-8 py-3.5 text-xs font-black text-white shadow-md transition-all hover:bg-accent hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={15} className="animate-spin text-accent" />
                      <span>جاري إظهار المزيد من الأعلام...</span>
                    </>
                  ) : (
                    <>
                      <span>إظهار المزيد من قامات الصعيد ({filteredPeople.length - visiblePeople.length} متبقي)</span>
                      <ChevronDown size={15} />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* PERSON FULL DATABASE DETAILS MODAL */}
      {selectedPersonForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            onClick={() => setSelectedPersonForModal(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] border border-border-subtle bg-background text-foreground p-6 sm:p-8 shadow-2xl">
            <div className="absolute left-5 top-5 flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => {
                    const target = selectedPersonForModal;
                    setSelectedPersonForModal(null);
                    openEditModal(target);
                  }}
                  className="flex h-9 items-center gap-1.5 rounded-full bg-accent/15 px-3 text-xs font-black text-accent hover:bg-accent hover:text-white transition-all cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>تعديل السيرة</span>
                </button>
              )}

              <button
                onClick={() => setSelectedPersonForModal(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-subtle hover:bg-border-subtle text-foreground-secondary transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-6 pb-6 border-b border-border-subtle">
              <img
                src={getPersonPhoto(selectedPersonForModal)}
                alt={selectedPersonForModal.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-border-subtle shadow-md shrink-0 aspect-square"
              />

              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent border border-accent/20">
                    {selectedPersonForModal.craftTitle ||
                      (selectedPersonForModal as any).craftOrSkill ||
                      (selectedPersonForModal as any).titleOrRole ||
                      'رمز وعلم صعيدي'}
                  </span>
                  {selectedPersonForModal.governorateName && (
                    <span className="rounded-full bg-surface-subtle border border-border-subtle px-3 py-1 text-xs font-bold text-foreground-secondary flex items-center gap-1">
                      <MapPin size={12} className="text-accent" />
                      محافظة {selectedPersonForModal.governorateName}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                    <span>مسجل</span>
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black font-serif">
                  {selectedPersonForModal.name}
                </h2>

                {(selectedPersonForModal.originVillage ||
                  (selectedPersonForModal as any).villageOrOrigin) && (
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-accent">
                      <MapPin size={14} className="text-accent" />
                      <span>
                        الجذور والنشأة:{' '}
                        {selectedPersonForModal.originVillage ||
                          (selectedPersonForModal as any).villageOrOrigin}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-6 text-sm">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-accent mb-2">
                  السيرة والنشأة بالعامية
                </h4>
                <p className="leading-7 text-foreground/90 bg-surface p-4 rounded-xl border border-border-subtle">
                  {selectedPersonForModal.bio ||
                    (selectedPersonForModal as any).biography ||
                    'سيرة صعيدية حافلة بالعطاء والأثر الطيب.'}
                </p>
              </div>

              {selectedPersonForModal.famousAnecdote && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-accent mb-2 flex items-center gap-1.5">
                    <Scroll size={14} />
                    <span>موقف لا يُنسى من الذاكرة وحكاية من سيرته</span>
                  </h4>
                  <div className="leading-7 text-foreground/90 bg-accent/5 p-4 rounded-xl border border-accent/20">
                    {selectedPersonForModal.famousAnecdote}
                  </div>
                </div>
              )}

              {selectedPersonForModal.famousWorksOrActs &&
                selectedPersonForModal.famousWorksOrActs.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-accent mb-2 flex items-center gap-1.5">
                      <Sparkles size={14} />
                      <span>أبرز البصمات والآثار الخالدة</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedPersonForModal.famousWorksOrActs.map((work, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-3 rounded-xl bg-surface border border-border-subtle"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent font-bold text-[10px] mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold">{work}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {selectedPersonForModal.localImpact && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-accent mb-2">
                    الأثر في الصعيد وأهله
                  </h4>
                  <p className="leading-7 text-foreground/90 bg-surface p-4 rounded-xl border border-border-subtle">
                    {selectedPersonForModal.localImpact}
                  </p>
                </div>
              )}

              {selectedPersonForModal.quote && (
                <div className="p-4 rounded-xl bg-surface border-r-4 border-accent italic text-base">
                  «{selectedPersonForModal.quote}»
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border-subtle text-xs text-foreground-secondary">
                {selectedPersonForModal.sourceName && (
                  <div>
                    <strong className="text-foreground">مصدر التوثيق:</strong>{' '}
                    {selectedPersonForModal.sourceName}
                  </div>
                )}
                {selectedPersonForModal.yearsOfExperience && (
                  <div>
                    <strong className="text-foreground">سنوات الخبرة والمسيرة:</strong>{' '}
                    {selectedPersonForModal.yearsOfExperience} عاماً
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-6 mt-6 border-t border-border-subtle flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedPersonForModal(null)}
                className="px-5 py-2.5 rounded-xl border border-border-subtle text-foreground-secondary font-bold text-xs hover:bg-surface transition-colors cursor-pointer"
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
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-btn-dark text-white font-bold text-xs hover:bg-accent transition-all cursor-pointer shadow-md"
              >
                <span>فتح صفحة الملف التفصيلي الكاملة</span>
                <ArrowUpLeft size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FINAL CTA */}
      <section className="border-t border-border-subtle">
        <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div className="relative overflow-hidden rounded-[2rem] bg-btn-dark px-6 py-14 text-white sm:px-12 sm:py-20 lg:px-20">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full border border-white/10" />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_400px] lg:items-end">
              <div>
                <div className="mb-5 text-[10px] font-bold tracking-[0.3em] text-accent">
                  LIVING LEGENDS
                </div>
                <h2 className="max-w-4xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-6xl">
                  ما كانوش مجرد ناس بتعدي...
                  <br />
                  دول حفروا أساميهم في حيطان المدينة وبقوا عنوانها.
                </h2>
              </div>

              <p className="text-sm leading-8 text-white/70">
                كل شخصية هنا مسجلة وموثقة في سجل وه، تمثل حلقة وصل حية بين الماضي المجيد ومستقبل الصعيد، تنقل الحكمة والصنعة للأجيال القادمة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ADMIN ADD / EDIT PERSON MODAL */}
      {isAdmin && isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            onClick={() => !isSubmitting && setIsFormModalOpen(false)}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
          />

          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] border border-border-subtle bg-background p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => !isSubmitting && setIsFormModalOpen(false)}
              className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-surface-subtle hover:bg-border-subtle text-foreground-secondary transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-2 text-accent font-bold text-xs mb-2">
                <ShieldCheck size={15} />
                <span>لوحة تحكم الأدمن • إدارة وتوثيق الأعلام</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black">
                {editingPerson ? `تعديل سيرة: ${editingPerson.name}` : 'إضافة رمز أو شخصية جديدة'}
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-6 text-foreground-secondary">
                {editingPerson
                  ? 'قم بتحديث أي بيانات أو تفاصيل خاصة بهذه الشخصية لتنعكس مباشرة في الموقع وقاعدة البيانات.'
                  : 'أدخل بيانات العلم الصعيدي لتسجيله وتوثيقه رسمياً في منصة وه.'}
              </p>
            </div>

            {submitSuccess && (
              <div className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
                <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-emerald-600" />
                <div className="text-xs sm:text-sm font-bold leading-6">
                  {submitSuccess}
                </div>
              </div>
            )}

            {submitError && (
              <div className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-rose-800 dark:text-rose-300 flex items-start gap-3">
                <X size={20} className="shrink-0 mt-0.5 text-rose-600" />
                <div className="text-xs sm:text-sm font-bold leading-6">
                  {submitError}
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-surface outline-none focus:border-accent transition-all"
                  />
                </div>

                <div>
                  <label className="block font-black text-foreground mb-1.5">
                    المحافظة الصعيدية <span className="text-accent">*</span>
                  </label>
                  <select
                    value={formData.governorateName}
                    onChange={(e) => setFormData({ ...formData, governorateName: e.target.value })}
                    className="
                      w-full h-11 px-4 rounded-xl border border-border-subtle
                      bg-surface text-foreground
                      dark:bg-[#1A1612] dark:text-[#EDE8E1] dark:border-white/10
                      outline-none focus:border-accent transition-all cursor-pointer font-bold
                      dark:[color-scheme:dark]
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
                      <option
                        key={gov}
                        value={gov}
                        className="bg-surface text-foreground dark:bg-[#1A1612] dark:text-[#EDE8E1]"
                      >
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-black text-foreground mb-1.5">
                    القرية، النجع، أو المركز الأصيل
                  </label>
                  <input
                    type="text"
                    value={formData.villageOrOrigin}
                    onChange={(e) => setFormData({ ...formData, villageOrOrigin: e.target.value })}
                    placeholder="مثلاً: قرية أبنود، دندرة، الحواتكة، النزلة..."
                    className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-surface outline-none focus:border-accent transition-all"
                  />
                </div>

                <div>
                  <label className="block font-black text-foreground mb-1.5">
                    لقبه، مهنته، أو مكانته بين الناس
                  </label>
                  <input
                    type="text"
                    value={formData.craftTitle}
                    onChange={(e) => setFormData({ ...formData, craftTitle: e.target.value })}
                    placeholder="مثلاً: سلطان المداحين، شيخ الصنعة، شاعر العامية..."
                    className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-surface outline-none focus:border-accent transition-all"
                  />
                </div>
              </div>

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
                  className="w-full p-4 rounded-xl border border-border-subtle bg-surface outline-none focus:border-accent transition-all resize-none leading-6"
                />
              </div>

              <div>
                <label className="block font-black text-foreground mb-1.5">
                  موقف صعيدي أو حكاية جدعنة لا تتنسيش في بلده
                </label>
                <textarea
                  rows={2}
                  value={formData.anecdote}
                  onChange={(e) => setFormData({ ...formData, anecdote: e.target.value })}
                  placeholder="موقف كرم، شهامة، أو قصة مشهورة كل أهل النجع بيحكوها عنه..."
                  className="w-full p-3 rounded-xl border border-border-subtle bg-surface outline-none focus:border-accent transition-all resize-none leading-6"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-black text-foreground mb-1.5">
                    أهم أعماله أو أثره الخالد
                  </label>
                  <input
                    type="text"
                    value={formData.famousWork}
                    onChange={(e) => setFormData({ ...formData, famousWork: e.target.value })}
                    placeholder="غنوة، كتاب، مسجد، ورشة، أثر لا يُنسى..."
                    className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-surface outline-none focus:border-accent transition-all"
                  />
                </div>

                <div>
                  <label className="block font-black text-foreground mb-1.5">
                    حكمة أو كلمة صعيدية كان دايماً يقولها
                  </label>
                  <input
                    type="text"
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    placeholder="«الصاحب الجدع سند، والصعيدي ما يوطيش راسه...»"
                    className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-surface outline-none focus:border-accent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-foreground mb-1.5">
                  رابط صورة للشخصية (اختياري)
                </label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://... (سيبه فاضي لو مش معاك رابط صورة)"
                  className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-surface outline-none focus:border-accent transition-all text-xs"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border-subtle">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-border-subtle text-foreground-secondary font-bold text-xs hover:bg-surface transition-all cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-white font-black text-xs sm:text-sm shadow-lg hover:bg-accent/90 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>جاري الحفظ في الداتا بيز...</span>
                  ) : (
                    <>
                      {editingPerson ? <Edit3 size={16} /> : <Plus size={16} />}
                      <span>{editingPerson ? 'حفظ التعديلات' : 'تسجيل الشخصية'}</span>
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