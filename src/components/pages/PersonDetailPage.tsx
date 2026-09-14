import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { LocalPerson } from '../../types';
import {
  Users,
  MapPin,
  Award,
  Hammer,
  ArrowLeft,
  ArrowUpLeft,
  Share2,
  ChevronLeft,
  Quote,
  Sparkles,
  ExternalLink,
  Scroll,
} from 'lucide-react';

export const PersonDetailPage: React.FC = () => {
  const {
    selectedPersonSlug,
    navigateToGovernorate,
    navigateToCraft,
    setActivePage,
    addToast
  } = useApp();

  const [person, setPerson] = useState<LocalPerson | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const slug =
    selectedPersonSlug ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/people/')
      ? decodeURIComponent(window.location.pathname.split('/')[2] || '')
      : null) ||
    'yahya-taher-abdullah-luxor';

  useEffect(() => {
    const fetchPerson = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getPersonBySlug(slug);
        if (data) {
          setPerson(data);
        }
      } catch (err) {
        console.warn('Could not load person details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPerson();
  }, [slug]);

  const handleShare = () => {
    const url = `${window.location.origin}/people/${encodeURIComponent(slug)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      addToast('تم نسخ الرابط', 'تم نسخ رابط ملف شيخ الصنعة بنجاح', 'success');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-foreground-secondary">جاري تحميل ملف السيرة والمسيرة...</p>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-black mb-2">الملف غير موجود</h2>
          <p className="text-sm text-foreground-secondary mb-6">لم نتمكن من العثور على بيانات هذا الشخص</p>
          <button
            onClick={() => setActivePage('people')}
            className="px-6 py-3 rounded-xl bg-btn-dark text-white dark:bg-surface dark:text-foreground font-bold text-xs cursor-pointer"
          >
            العودة لكافة ناس الصعيد
          </button>
        </div>
      </div>
    );
  }

  const roleTitle = person.craftTitle || (person as any).craftOrSkill || (person as any).titleOrRole || 'حرفي وتراثي';

  const getPersonPhoto = (p: any) => {
    if (!p) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800';
    const candidates = [
      p.avatarUrl,
      p.photoUrl,
      p.imageUrl,
      p.image,
      p.photo,
      p.coverImage
    ].filter((u): u is string => typeof u === 'string' && u.trim().length > 0);

    const custom = candidates.find((u) => !u.includes('images.unsplash.com') && !u.includes('placeholder'));
    if (custom) return custom;

    return p.avatarUrl || p.photoUrl || candidates[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800';
  };

  const avatarImage = getPersonPhoto(person);
  const bioText = person.bio || (person as any).biography || '';

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
            onClick={() => setActivePage('people')}
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
            <span className="hidden sm:block">كافة ناس الصعيد</span>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <div className="text-[9px] font-bold tracking-[0.35em] text-accent">
              WAH
            </div>
            <div className="mt-1 text-sm font-black">أعلام وناس الصعيد</div>
          </div>

          <button
            type="button"
            onClick={handleShare}
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
            title="مشاركة الملف"
          >
            <span className="hidden sm:block">مشاركة الملف</span>
            <Share2 size={15} />
          </button>
        </div>
      </header>

      {/* =====================================================
          PERSON HERO DOSSIER SECTION
      ===================================================== */}
      <section className="relative overflow-hidden border-b border-border-subtle">
        <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full border border-border-subtle/50" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-[350px] w-[350px] rounded-full border border-border-subtle/50" />

        <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 lg:gap-14 items-center">
            {/* Avatar Frame */}
            <div className="relative mx-auto lg:mx-0 w-64 h-64 sm:w-80 sm:h-80 overflow-hidden rounded-[2.5rem] border-4 border-border-subtle shadow-2xl">
              <img
                src={avatarImage}
                alt={person.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 right-4 left-4 text-center">
                <span className="inline-block rounded-full bg-black/50 backdrop-blur-md px-3.5 py-1 text-[11px] font-bold text-white border border-white/20">
                  {roleTitle}
                </span>
              </div>
            </div>

            {/* Profile Content */}
            <div className="space-y-6 text-right">
              <div className="flex flex-wrap items-center gap-3">
                {person.governorateName && (
                  <button
                    type="button"
                    onClick={() => navigateToGovernorate(person.governorateId || 'qena')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1 text-xs font-bold text-foreground-secondary hover:bg-accent hover:text-white transition-colors cursor-pointer border border-border-subtle"
                  >
                    <MapPin size={13} className="text-accent" />
                    <span>محافظة {person.governorateName}</span>
                  </button>
                )}

                {person.yearsOfExperience && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3.5 py-1 text-xs font-bold text-accent border border-accent/20">
                    <Award size={13} />
                    <span>مسيرة تمتد لأكثر من {person.yearsOfExperience} عاماً</span>
                  </span>
                )}

                {person.sourceName && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 px-3.5 py-1 text-xs font-bold border border-emerald-500/20">
                    <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
                    <span>توثيق: {person.sourceName}</span>
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-6xl font-black font-serif tracking-tight">
                {person.name}
              </h1>

              {person.originVillage && (
                <div className="flex items-center gap-2 text-sm font-bold text-accent">
                  <MapPin size={16} className="text-accent shrink-0" />
                  <span>الجذور والنشأة: {person.originVillage}</span>
                </div>
              )}

              <p className="text-base sm:text-lg leading-8 text-foreground/80 font-medium">
                {bioText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TIMELINE & KEY MILESTONES SECTION
      ===================================================== */}
      {person.keyMilestones && person.keyMilestones.length > 0 && (
        <section className="border-b border-border-subtle py-14 sm:py-20">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12">
            <div className="mb-10 text-right">
              <span className="text-[10px] font-bold tracking-[0.3em] text-accent block mb-2 uppercase">
                CAREER TIMELINE & STATIONS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-serif">
                محطات فاصلة في مسيرته
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {person.keyMilestones.map((milestone, idx) => (
                <div
                  key={idx}
                  className="
                    relative flex flex-col justify-between
                    rounded-[1.5rem]
                    border border-border-subtle
                    bg-surface
                    p-6 sm:p-7
                    shadow-sm
                  "
                >
                  <div>
                    {milestone.year && (
                      <span className="inline-block font-mono text-xs font-black text-accent bg-accent/10 px-3 py-1 rounded-full mb-3">
                        {milestone.year}
                      </span>
                    )}
                    <h3 className="text-base sm:text-lg font-black mb-2 text-foreground">
                      {milestone.title}
                    </h3>
                    <p className="text-xs sm:text-sm leading-6 text-foreground-secondary">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          NOTABLE WORKS & ACHIEVEMENTS SECTION
      ===================================================== */}
      {person.famousWorksOrActs && person.famousWorksOrActs.length > 0 && (
        <section className="border-b border-border-subtle py-14 sm:py-20 bg-surface/50">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12">
            <div className="mb-10 text-right">
              <span className="text-[10px] font-bold tracking-[0.3em] text-accent block mb-2 uppercase">
                LEGACY & MASTERWORKS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-serif">
                أبرز البصمات والآثار الخالدة
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {person.famousWorksOrActs.map((work, idx) => (
                <div
                  key={idx}
                  className="
                    flex items-start gap-3.5
                    rounded-2xl
                    border border-border-subtle
                    bg-surface
                    p-5
                    shadow-sm
                  "
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent font-black text-xs mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold leading-relaxed text-foreground">
                    {work}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          ANECDOTE & LOCAL IMPACT SECTION
      ===================================================== */}
      {(person.famousAnecdote || person.localImpact) && (
        <section className="border-b border-border-subtle py-14 sm:py-20">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {person.famousAnecdote && (
                <div
                  className="
                    rounded-[2rem]
                    border border-accent/25
                    bg-accent/5
                    p-7 sm:p-9
                    relative
                    overflow-hidden
                  "
                >
                  <div className="flex items-center gap-2 text-accent text-xs font-black uppercase tracking-wider mb-4">
                    <Scroll size={17} />
                    <span>موقف لا يُنسى من الذاكرة الصعيدية</span>
                  </div>
                  <h3 className="text-xl font-black mb-3">حكاية من سيرة المكان</h3>
                  <p className="text-sm leading-8 text-foreground/80 font-medium">
                    {person.famousAnecdote}
                  </p>
                </div>
              )}

              {person.localImpact && (
                <div
                  className="
                    rounded-[2rem]
                    border border-border-subtle
                    bg-surface
                    p-7 sm:p-9
                    relative
                    overflow-hidden
                  "
                >
                  <div className="flex items-center gap-2 text-accent text-xs font-black uppercase tracking-wider mb-4">
                    <Sparkles size={17} />
                    <span>البصمة والأثر في الصعيد</span>
                  </div>
                  <h3 className="text-xl font-black mb-3">أثره في أهله وبلده</h3>
                  <p className="text-sm leading-8 text-foreground/80 font-medium">
                    {person.localImpact}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          MASTER'S QUOTE SECTION
      ===================================================== */}
      {person.quote && (
        <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:px-12">
          <div
            className="
              relative overflow-hidden
              rounded-[2rem]
              border border-border-subtle
              bg-surface
              p-8 sm:p-12
              shadow-lg
            "
          >
            <Quote size={36} className="text-accent/30 mb-4" />
            <span className="text-[10px] font-bold tracking-[0.3em] text-accent block mb-2">
              WORDS & LEGACY
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-serif mb-4">
              من كلمات وأقوال {person.name}
            </h2>
            <blockquote className="text-xl sm:text-2xl font-serif italic leading-relaxed text-foreground/90">
              «{person.quote}»
            </blockquote>
          </div>
        </section>
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
                  GUARDING THE LEGACY
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

              <div className="flex flex-col gap-4">
                <p className="text-sm leading-8 text-white/70">
                  تعرّف على باقي شيوخ الصنعة والرواة الذين يحملون تاريخ الصعيد في قلوبهم وأفئدتهم.
                </p>
                <button
                  onClick={() => setActivePage('people')}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-surface text-foreground px-6 py-3.5 text-xs font-bold transition-all duration-300 hover:bg-accent hover:text-white shadow-md cursor-pointer w-fit border border-border-subtle"
                >
                  <span>تصفح كافة ناس الصعيد</span>
                  <ArrowLeft size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PersonDetailPage;