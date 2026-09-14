import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { LocalPerson } from '../../types';
import {
  MapPin,
  ArrowLeft,
  Share2,
  Sparkles,
  Scroll,
  Film,
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
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#060608] text-stone-900 dark:text-white flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        <div className="relative text-center z-10 space-y-4">
          <div className="w-16 h-16 border-2 border-amber-600/30 border-t-amber-600 dark:border-t-amber-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono tracking-[0.4em] uppercase text-amber-700 dark:text-amber-500/80">
            Archiving History / جاري فتح الأرشيف
          </p>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#060608] text-stone-900 dark:text-white flex items-center justify-center p-6 text-center transition-colors duration-500">
        <div className="max-w-md">
          <h2 className="text-3xl font-serif font-black mb-3 text-stone-800 dark:text-amber-100">سيرة لم تكتمل</h2>
          <p className="text-xs text-stone-500 dark:text-white/50 mb-8 font-light">تعذّر الوصول إلى ملف الشخصية في سجلات التراث الصعيدي</p>
          <button
            onClick={() => setActivePage('people')}
            className="px-8 py-3.5 rounded-full border border-amber-600/30 dark:border-amber-500/30 bg-amber-500/10 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-500 dark:hover:text-black transition-all text-xs font-bold tracking-widest uppercase cursor-pointer"
          >
            العودة إلى سجل الشخصيات
          </button>
        </div>
      </div>
    );
  }

  const roleTitle = person.craftTitle || (person as any).craftOrSkill || (person as any).titleOrRole || 'شيخ صنعة وتراث';

  const getPersonPhoto = (p: any) => {
    if (!p) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200';
    const candidates = [
      p.avatarUrl,
      p.photoUrl,
      p.imageUrl,
      p.image,
      p.photo,
      p.coverImage
    ].filter((u): u is string => typeof u === 'string' && u.trim().length > 0);

    const custom = candidates.find((u) => !u.includes('images.unsplash.com') && !u.includes('placeholder'));
    return custom || candidates[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200';
  };

  const avatarImage = getPersonPhoto(person);
  const bioText = person.bio || (person as any).biography || '';

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#FDFBF7] dark:bg-[#070709] text-stone-800 dark:text-[#E5E2DC] selection:bg-amber-600 selection:text-white font-sans antialiased relative overflow-x-hidden transition-colors duration-500"
    >
      {/* 1. Cinematic Noise & Film Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] dark:opacity-[0.045] mix-blend-multiply dark:mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-40 shadow-[inset_0_0_80px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_0_130px_rgba(0,0,0,0.9)]" />

      {/* 2. Cinema Letterbox Strips */}
      <div className="fixed top-0 inset-x-0 h-2 sm:h-3 bg-stone-950 z-50 border-b border-white/5" />
      <div className="fixed bottom-0 inset-x-0 h-2 sm:h-3 bg-stone-950 z-50 border-t border-white/5" />

      {/* =====================================================
          CINEMATIC HUD / NAVBAR
      ===================================================== */}
      <header className="relative z-40 pt-4">
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6 sm:px-12">

          <button
            onClick={() => setActivePage('people')}
            className="group flex items-center gap-3.5 text-xs font-semibold text-stone-700 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 transition-all cursor-pointer"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-md transition-all duration-300 group-hover:border-amber-500/50 group-hover:bg-amber-500/10 shadow-sm">
              <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1 text-stone-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400" />
            </span>
            <span className="hidden sm:inline-block tracking-wider">سجل ناس الصعيد</span>
          </button>

          {/* Documentary Recording Indicator */}
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            <div className="text-[10px] font-mono tracking-[0.45em] text-stone-500 dark:text-white/40 uppercase">
              DOCUMENTARY 24FPS
            </div>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="group flex items-center gap-2.5 rounded-full border border-stone-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-5 py-2.5 text-xs font-medium backdrop-blur-md hover:border-amber-500/40 hover:bg-amber-500/10 text-stone-700 dark:text-white/80 hover:text-amber-700 dark:hover:text-amber-300 transition-all cursor-pointer shadow-sm"
          >
            <span className="hidden sm:inline">نشر القصة</span>
            <Share2 size={14} className="transition-transform group-hover:scale-110" />
          </button>
        </div>
      </header>

      {/* =====================================================
          CINEMATIC HERO (Widescreen Spotlight - Always Dramatic)
      ===================================================== */}
      <section className="relative min-h-[90vh] flex items-end justify-center overflow-hidden pb-20 pt-16 bg-[#070709] text-white">

        {/* Background Image & Dramatic Light */}
        <div className="absolute inset-0 z-0">
          <img
            src={avatarImage}
            alt={person.name}
            className="h-full w-full object-cover object-center filter contrast-125 brightness-[0.7] saturate-[0.85] scale-100 transition-transform duration-[4000ms] hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070709] via-transparent to-[#070709]/80" />
          <div className="absolute -top-40 right-0 h-[650px] w-[650px] rounded-full bg-amber-600/20 blur-[160px] pointer-events-none" />
        </div>

        {/* Viewfinder Frame Guides */}
        <div className="pointer-events-none absolute inset-8 lg:inset-14 border border-white/10 rounded-[2.5rem]">
          <span className="absolute top-4 left-4 text-[9px] font-mono text-white/30 tracking-widest">CAM 01 • ARCHIVE REEL</span>
          <span className="absolute bottom-4 right-4 text-[9px] font-mono text-white/30 tracking-widest">+24.00 EXP</span>
        </div>

        {/* Hero Details */}
        <div className="relative z-10 mx-auto max-w-[1400px] w-full px-6 sm:px-12 lg:px-16">
          <div className="max-w-4xl space-y-6">

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {person.governorateName && (
                <button
                  type="button"
                  onClick={() => navigateToGovernorate(person.governorateId || 'qena')}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-md hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
                >
                  <MapPin size={12} />
                  <span>{person.governorateName}</span>
                </button>
              )}

              {roleTitle && (
                <span className="rounded-full border border-white/15 bg-black/40 px-4 py-1.5 text-white/80 font-medium backdrop-blur-md">
                  {roleTitle}
                </span>
              )}

              {person.originVillage && (
                <span className="text-white/50 text-xs flex items-center gap-1 font-mono">
                  • {person.originVillage}
                </span>
              )}
            </div>

            <h1 className="text-6xl sm:text-8xl lg:text-9xl font-serif font-black tracking-tight text-white leading-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)]">
              {person.name}
            </h1>

            {bioText && (
              <p className="text-base sm:text-lg text-white/80 max-w-2xl font-light leading-relaxed line-clamp-3">
                {bioText}
              </p>
            )}

            <div className="flex items-center gap-8 pt-4 border-t border-white/15">
              {person.yearsOfExperience && (
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">سنوات العطاء</div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-white">+{person.yearsOfExperience} عام</div>
                </div>
              )}
              {person.sourceName && (
                <div className="border-r border-white/15 pr-8">
                  <div className="text-[10px] font-mono tracking-widest text-white/50 uppercase">المصدر التوثيقي</div>
                  <div className="text-sm sm:text-base font-medium text-white/90">{person.sourceName}</div>
                </div>
              )}
            </div>

          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <span className="text-[8px] font-mono tracking-[0.4em] text-white/70 uppercase">انزل إلى السيرة</span>
          <div className="h-6 w-px bg-gradient-to-b from-amber-400 to-transparent animate-bounce" />
        </div>
      </section>

      {/* =====================================================
          CHAPTER 01: BIOGRAPHY MONOLOGUE
      ===================================================== */}
      <section className="relative py-28 border-y border-stone-200 dark:border-white/[0.06] bg-[#F5F1EB] dark:bg-[#09090D] transition-colors duration-500">
        <div className="mx-auto max-w-[1200px] px-6 sm:px-12">
          <div className="grid lg:grid-cols-[200px_1fr] gap-12 items-start">

            <div className="space-y-2">
              <div className="text-[10px] font-mono tracking-[0.4em] text-amber-700 dark:text-amber-500 uppercase">CHAPTER 01</div>
              <div className="text-lg font-serif font-bold text-stone-900 dark:text-white/90">سيرة المكان والإنسان</div>
            </div>

            <div className="relative">
              <span className="absolute -top-12 -right-8 text-8xl font-serif text-amber-600/15 dark:text-amber-500/10 select-none">“</span>
              <p className="text-xl sm:text-2xl lg:text-3xl font-serif leading-loose text-stone-800 dark:text-white/90 font-normal">
                {bioText}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          CHAPTER 02: FILM REEL TIMELINE
      ===================================================== */}
      {person.keyMilestones && person.keyMilestones.length > 0 && (
        <section className="py-32 relative">
          <div className="mx-auto max-w-[1200px] px-6 sm:px-12">

            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-20 gap-4 border-b border-stone-200 dark:border-white/[0.08] pb-8">
              <div>
                <div className="text-[10px] font-mono tracking-[0.4em] text-amber-700 dark:text-amber-500 uppercase mb-2">CHAPTER 02</div>
                <h2 className="text-3xl sm:text-5xl font-serif font-black text-stone-900 dark:text-white">محطات المسيرة</h2>
              </div>
              <div className="text-xs font-mono text-stone-400 dark:text-white/40 tracking-widest">
                TIMELINE ARCHIVE / {person.keyMilestones.length} ENTRIES
              </div>
            </div>

            <div className="relative">
              <div className="absolute right-4 md:right-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber-600/40 dark:from-amber-500/50 via-stone-300 dark:via-white/10 to-transparent md:-translate-x-1/2" />

              <div className="space-y-16">
                {person.keyMilestones.map((milestone, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <div
                      key={idx}
                      className={`relative flex flex-col md:flex-row gap-8 items-start ${isEven ? 'md:flex-row-reverse' : ''
                        }`}
                    >
                      {/* Central Node */}
                      <div className="absolute right-4 md:right-1/2 w-3 h-3 rounded-full bg-amber-600 dark:bg-amber-500 shadow-[0_0_15px_rgba(217,119,6,0.6)] dark:shadow-[0_0_15px_rgba(245,158,11,0.8)] -translate-x-1/2 mt-6 hidden md:block" />

                      <div className="w-full md:w-1/2 pr-10 md:pr-0 md:px-10">
                        <div className="group relative rounded-3xl border border-stone-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.02] p-8 backdrop-blur-xl shadow-md dark:shadow-none transition-all duration-500 hover:border-amber-500/40 hover:bg-white dark:hover:bg-white/[0.04] hover:-translate-y-1">

                          {milestone.year && (
                            <div className="font-mono text-xs font-black text-amber-700 dark:text-amber-400 mb-3 tracking-widest">
                              {milestone.year}
                            </div>
                          )}

                          <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-200 transition-colors">
                            {milestone.title}
                          </h3>

                          <p className="mt-3 text-sm text-stone-600 dark:text-white/60 leading-relaxed font-light">
                            {milestone.description}
                          </p>

                          <div className="absolute top-4 left-4 text-[9px] font-mono text-stone-300 dark:text-white/10 group-hover:text-stone-400 dark:group-hover:text-white/30 transition-colors">
                            #{String(idx + 1).padStart(2, '0')}
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:block w-1/2" />
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>
      )}

      {/* =====================================================
          CHAPTER 03: WORKS & LEGACY (Negative Film Style)
      ===================================================== */}
      {person.famousWorksOrActs && person.famousWorksOrActs.length > 0 && (
        <section className="py-28 bg-[#F5F1EB] dark:bg-[#09090D] border-t border-stone-200 dark:border-white/[0.06] relative transition-colors duration-500">
          <div className="mx-auto max-w-[1200px] px-6 sm:px-12">

            <div className="mb-16">
              <div className="text-[10px] font-mono tracking-[0.4em] text-amber-700 dark:text-amber-500 uppercase mb-2">CHAPTER 03</div>
              <h2 className="text-3xl sm:text-5xl font-serif font-black text-stone-900 dark:text-white">إرث الصنعة والأثر</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {person.famousWorksOrActs.map((work, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-[#0c0c11] p-8 transition-all duration-500 hover:border-amber-500/40 shadow-sm dark:shadow-none hover:shadow-xl flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/[0.08] pb-4 mb-6">
                    <span className="font-mono text-xs text-amber-700 dark:text-amber-400/90 font-bold">FRAME {String(idx + 1).padStart(2, '0')}</span>
                    <Film size={14} className="text-stone-400 dark:text-white/20 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
                  </div>

                  <p className="text-base text-stone-800 dark:text-white/80 font-medium leading-relaxed mb-6">
                    {work}
                  </p>

                  <div className="text-[10px] font-mono text-stone-400 dark:text-white/30 tracking-wider">
                    DOCUMENTED LEGACY
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* =====================================================
          CHAPTER 04: ANECDOTE & IMPACT
      ===================================================== */}
      {(person.famousAnecdote || person.localImpact) && (
        <section className="py-32 relative overflow-hidden">
          <div className="mx-auto max-w-[1200px] px-6 sm:px-12">

            <div className="mb-16">
              <div className="text-[10px] font-mono tracking-[0.4em] text-amber-700 dark:text-amber-500 uppercase mb-2">CHAPTER 04</div>
              <h2 className="text-3xl sm:text-5xl font-serif font-black text-stone-900 dark:text-white">رواية حية لا تموت</h2>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {person.famousAnecdote && (
                <div className="relative rounded-3xl border border-amber-600/20 dark:border-amber-500/20 bg-gradient-to-br from-amber-50/70 to-amber-100/30 dark:from-amber-950/20 dark:to-black/60 p-10 backdrop-blur-xl shadow-md dark:shadow-none">
                  <Scroll size={24} className="text-amber-700 dark:text-amber-400 mb-6" />
                  <div className="text-[10px] font-mono tracking-widest text-amber-800 dark:text-amber-400/60 uppercase mb-3">حكاية يتوارثها أهل البلد</div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-4">موقف من الذاكرة</h3>
                  <p className="text-stone-700 dark:text-white/70 leading-loose text-base font-light">
                    {person.famousAnecdote}
                  </p>
                </div>
              )}

              {person.localImpact && (
                <div className="relative rounded-3xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-10 backdrop-blur-xl shadow-md dark:shadow-none">
                  <Sparkles size={24} className="text-amber-700 dark:text-amber-400 mb-6" />
                  <div className="text-[10px] font-mono tracking-widest text-stone-400 dark:text-white/40 uppercase mb-3">البصمة الحقيقية</div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-4">الأثر الباقي</h3>
                  <p className="text-stone-700 dark:text-white/70 leading-loose text-base font-light">
                    {person.localImpact}
                  </p>
                </div>
              )}
            </div>

          </div>
        </section>
      )}

      {/* =====================================================
          CINEMATIC QUOTE (Golden Spotlight)
      ===================================================== */}
      {person.quote && (
        <section className="relative py-36 bg-stone-900 dark:bg-black border-y border-stone-800 dark:border-white/[0.08] overflow-hidden text-center text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-600/15 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-4xl px-6">
            <span className="text-6xl font-serif text-amber-400/50 block mb-6 leading-none">“</span>
            <blockquote className="text-3xl sm:text-5xl font-serif font-medium leading-relaxed text-amber-100">
              {person.quote}
            </blockquote>
            <div className="h-0.5 w-12 bg-amber-500 mx-auto my-8" />
            <div className="font-serif text-base text-white/60 tracking-wider">{person.name}</div>
          </div>
        </section>
      )}

      {/* =====================================================
          CREDITS & RETURN (End Screen)
      ===================================================== */}
      <footer className="py-24 bg-[#EFEBE3] dark:bg-[#050507] text-center border-t border-stone-200 dark:border-white/5 relative transition-colors duration-500">
        <div className="mx-auto max-w-xl px-6 space-y-6">
          <div className="text-[10px] font-mono tracking-[0.5em] text-amber-700 dark:text-amber-500 uppercase">END OF ARCHIVE</div>
          <h2 className="text-3xl font-serif font-black text-stone-900 dark:text-white">لكل صنعة شيخ، ولكل قرية حكاية</h2>
          <p className="text-sm text-stone-600 dark:text-white/50 leading-relaxed">
            وثائق تراث الصعيد تظل حيّة بمشاركتكم وتدوين أسماء هؤلاء المبدعين.
          </p>
          <button
            onClick={() => setActivePage('people')}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-stone-900 text-white dark:bg-amber-500 dark:text-black font-bold text-xs tracking-wider uppercase hover:bg-amber-700 dark:hover:bg-amber-400 transition-all cursor-pointer shadow-lg dark:shadow-[0_0_40px_rgba(245,158,11,0.2)]"
          >
            <span>استكشاف باقي روايات الصعيد</span>
            <ArrowLeft size={14} />
          </button>
        </div>
      </footer>

    </div>
  );
};

export default PersonDetailPage;