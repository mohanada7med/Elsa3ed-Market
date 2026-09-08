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
    'sheikh-qenawy-pottery';

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
      <div className="min-h-screen bg-[#eee8dc] dark:bg-[#0b0b0a] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#9a6a35] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-black/60 dark:text-white/60">جاري تحميل ملف السيرة والمسيرة...</p>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-[#eee8dc] dark:bg-[#0b0b0a] flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-black mb-2">الملف غير موجود</h2>
          <p className="text-sm text-black/60 dark:text-white/60 mb-6">لم نتمكن من العثور على بيانات هذا الشخص</p>
          <button
            onClick={() => setActivePage('people')}
            className="px-6 py-3 rounded-xl bg-[#211d18] text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer"
          >
            العودة لكافة ناس الصعيد
          </button>
        </div>
      </div>
    );
  }

  const roleTitle = person.craftTitle || (person as any).craftOrSkill || (person as any).titleOrRole || 'حرفي وتراثي';
  const avatarImage = person.photoUrl || (person as any).avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800';
  const bioText = person.bio || (person as any).biography || '';

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors duration-500
        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
      "
    >
      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <header className="relative z-50 border-b border-black/10 dark:border-white/10">
        <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button
            onClick={() => setActivePage('people')}
            className="
              group flex items-center gap-3
              text-sm font-bold
              transition-all
              hover:text-[#9a6a35]
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
                group-hover:bg-[#211d18]
                group-hover:text-white
                dark:border-white/10
                dark:bg-white/5
                dark:group-hover:bg-white
                dark:group-hover:text-black
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
            <div className="text-[9px] font-bold tracking-[0.35em] text-[#9a6a35]">
              WAH
            </div>
            <div className="mt-1 text-sm font-black">شيخ الصنعة</div>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="
              flex items-center gap-2
              rounded-full
              border border-black/10
              px-4 py-2.5
              text-xs font-bold
              transition-all
              hover:bg-[#211d18]
              hover:text-white
              dark:border-white/10
              dark:hover:bg-white
              dark:hover:text-black
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
      <section className="relative overflow-hidden border-b border-black/10 dark:border-white/10">
        <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full border border-black/5 dark:border-white/5" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-[350px] w-[350px] rounded-full border border-black/5 dark:border-white/5" />

        <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 lg:gap-14 items-center">
            {/* Avatar Frame */}
            <div className="relative mx-auto lg:mx-0 w-64 h-64 sm:w-80 sm:h-80 overflow-hidden rounded-[2.5rem] border-4 border-black/10 dark:border-white/10 shadow-2xl">
              <img
                src={avatarImage}
                alt={person.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 right-4 left-4 text-center">
                <span className="inline-block rounded-full bg-black/40 backdrop-blur-md px-3.5 py-1 text-[11px] font-bold text-white border border-white/20">
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
                    className="inline-flex items-center gap-1.5 rounded-full bg-black/5 dark:bg-white/5 px-3.5 py-1 text-xs font-bold text-black/70 dark:text-white/70 hover:bg-[#9a6a35] hover:text-white transition-colors cursor-pointer"
                  >
                    <MapPin size={13} className="text-[#9a6a35]" />
                    <span>محافظة {person.governorateName}</span>
                  </button>
                )}

                {person.yearsOfExperience && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9a6a35]/10 px-3.5 py-1 text-xs font-bold text-[#9a6a35]">
                    <Award size={13} />
                    <span>خبرة {person.yearsOfExperience} عاماً</span>
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-6xl font-black font-serif tracking-tight">
                {person.name}
              </h1>

              <p className="text-base sm:text-lg leading-8 text-black/75 dark:text-white/75 font-medium">
                {bioText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MASTER'S QUOTE SECTION
      ===================================================== */}
      {person.quote && (
        <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:px-12">
          <div
            className="
              relative overflow-hidden
              rounded-[2rem]
              border border-black/10
              bg-white/75
              p-8 sm:p-12
              shadow-lg
              backdrop-blur-xl
              dark:border-white/10
              dark:bg-[#151513]/90
            "
          >
            <Quote size={36} className="text-[#9a6a35]/30 mb-4" />
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#9a6a35] block mb-2">
              MASTER'S WISDOM
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-serif mb-4">
              من وصايا وحكم شيخ الصنعة
            </h2>
            <blockquote className="text-xl sm:text-2xl font-serif italic leading-relaxed text-black/80 dark:text-white/80">
              «{person.quote}»
            </blockquote>
          </div>
        </section>
      )}

      {/* =====================================================
          FINAL CTA
      ===================================================== */}
      <section className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div
            className="
              relative overflow-hidden
              rounded-[2rem]
              bg-[#211d18]
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
                <p className="text-sm leading-8 text-white/55">
                  تعرّف على باقي شيوخ الصنعة والرواة الذين يحملون تاريخ الصعيد في قلوبهم وأفئدتهم.
                </p>
                <button
                  onClick={() => setActivePage('people')}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#211d18] text-white dark:bg-white dark:text-black px-6 py-3.5 text-xs font-bold transition-all duration-300 hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] shadow-md cursor-pointer w-fit"                >
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