import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';

import {
  ArrowLeft,
  ArrowUpLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Compass,
  Crown,
  Eye,
  Flame,
  Landmark,
  MapPin,
  Menu,
  Mountain,
  Package,
  ScrollText,
  Search,
  Sparkles,
  Store,
  Utensils,
  Users,
  X,
} from 'lucide-react';

import { NubianGeometricPattern } from '../common/NubianGeometricPattern';
import {
  HeritagePlace,
  CulturalCraft,
  WahStory,
  LocalPerson,
  UpperEgyptFood,
  CulturalEvent,
  Product,
} from '../../types';

const NILE_ORDER_MAP: Record<string, number> = {
  'bani-suef': 1,
  'beni-suef': 1,
  'minya': 2,
  'asyut': 3,
  'sohag': 4,
  'qena': 5,
  'luxor': 6,
  'aswan': 7,
  'new-valley': 8,
};

export const GovernorateDetailPage: React.FC = () => {
  const {
    selectedGovernorateSlug,
    navigateToPlace,
    navigateToCraft,
    navigateToStory,
    navigateToPerson,
    navigateToFood,
    navigateToEvent,
    navigateToProduct,
    setActivePage,
    addToast,
  } = useApp();

  const slug =
    selectedGovernorateSlug ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/governorates/')
      ? decodeURIComponent(window.location.pathname.split('/')[2] || '')
      : null) ||
    'qena';

  const cachedGov = wahApi.getCachedGovernorateBySlug(slug);
  const [governorate, setGovernorate] = useState<any>(() => cachedGov || null);
  const [loading, setLoading] = useState(() => !cachedGov);
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const orderNumber = governorate?.nileOrder || (governorate?.order || (governorate?.slug ? NILE_ORDER_MAP[governorate.slug] : 1));
  const orderFormatted = String(orderNumber).padStart(2, '0');

  useEffect(() => {
    let mounted = true;

    const loadGovernorate = async () => {
      try {
        if (!cachedGov) {
          setLoading(true);
        }

        const data = await wahApi.getGovernorateBySlug(slug);

        if (mounted && data) {
          setGovernorate(data);
        }
      } catch (error) {
        console.error('Failed to load governorate:', error);

        if (mounted && !governorate) {
          addToast?.(
            'error',
            'حصلت مشكلة في تحميل بيانات المحافظة'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadGovernorate();

    return () => {
      mounted = false;
    };
  }, [slug, addToast]);

  const places = governorate?.places || [];
  const crafts = governorate?.crafts || [];
  const stories = governorate?.stories || [];
  const people = governorate?.people || [];
  const foods = governorate?.foods || [];
  const events = governorate?.events || [];
  const products = governorate?.products || [];

  const sections = useMemo(
    () => [
      {
        id: 'overview',
        number: '01',
        label: 'الحكاية',
        icon: ScrollText,
      },
      {
        id: 'places',
        number: '02',
        label: 'المعالم',
        icon: Landmark,
        count: places.length,
      },
      {
        id: 'crafts',
        number: '03',
        label: 'الصنايع',
        icon: Sparkles,
        count: crafts.length,
      },
      {
        id: 'stories',
        number: '04',
        label: 'الحكايات',
        icon: ScrollText,
        count: stories.length,
      },
      {
        id: 'people',
        number: '05',
        label: 'الناس',
        icon: Users,
        count: people.length,
      },
      {
        id: 'food',
        number: '06',
        label: 'الأكل',
        icon: Utensils,
        count: foods.length,
      },
      {
        id: 'events',
        number: '07',
        label: 'المواسم',
        icon: CalendarDays,
        count: events.length,
      },
      {
        id: 'market',
        number: '08',
        label: 'السوق',
        icon: Store,
        count: products.length,
      },
    ],
    [
      places.length,
      crafts.length,
      stories.length,
      people.length,
      foods.length,
      events.length,
      products.length,
    ]
  );

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);

    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const getImage = (item: any, fallback?: string) => {
    return (
      item?.coverImage ||
      item?.imageUrl ||
      item?.photoUrl ||
      item?.thumbnailUrl ||
      item?.images?.[0] ||
      fallback ||
      'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1200&q=80'
    );
  };

  const getPersonImage = (person: any) =>
    person?.photoUrl ||
    person?.avatarUrl ||
    person?.imageUrl ||
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80';

  const getFoodTitle = (food: any) => food?.title || food?.name || 'أكلة من الصعيد';

  const getPersonTitle = (person: any) =>
    person?.craftTitle ||
    person?.craftOrSkill ||
    person?.titleOrRole ||
    person?.title ||
    'شخصية من الصعيد';

  const getEventDate = (event: any) =>
    event?.eventDate || event?.timeOfYear || event?.startDate || 'موعد الموسم';

  if (loading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen w-full overflow-x-hidden bg-[#eee8dc] text-[#211d18] dark:bg-[#0b0b0a] dark:text-[#f5f0e7] transition-colors duration-500"
      >
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5">
          <div className="text-center">
            <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-2 border-[#D8CCC1] border-t-[#9a6a35] dark:border-[#382D27] dark:border-t-[#d5a56d]" />

            <p className="text-sm font-bold tracking-wide text-[#73675B] dark:text-[#B8AAA0]">
              بنفتح أرشيف المحافظة...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!governorate) {
    return (
      <div
        dir="rtl"
        className="min-h-screen w-full overflow-x-hidden bg-[#eee8dc] text-[#211d18] dark:bg-[#0b0b0a] dark:text-[#f5f0e7] transition-colors duration-500"
      >
        <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
          <div className="mx-auto max-w-xl rounded-[32px] border border-[#E4DBD2] bg-white p-10 text-center shadow-sm dark:border-[#382D27] dark:bg-[#1B1613]">
            <Landmark className="mx-auto mb-5 h-12 w-12 text-[#9a6a35] dark:text-[#d5a56d]" />

            <h1 className="mb-3 text-2xl font-black">
              المحافظة مش موجودة
            </h1>

            <p className="mb-7 text-sm leading-7 text-[#73675B] dark:text-[#B8AAA0]">
              حاول ترجع للخريطة واختار محافظة تانية.
            </p>

            <button
              onClick={() => setActivePage('governorates')}
              className="inline-flex items-center gap-2 rounded-full bg-[#241E1A] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#9a6a35] dark:bg-[#FFF8F1] dark:text-[#17120F] dark:hover:bg-[#d5a56d] dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              رجوع للمحافظات
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full overflow-x-hidden bg-[#eee8dc] text-[#211d18] dark:bg-[#0b0b0a] dark:text-[#f5f0e7] transition-colors duration-500"
    >
      {/* =========================================================
          HERO — MUSEUM EXHIBITION
      ========================================================= */}

      <section className="relative px-4 pb-8 pt-4 sm:px-6 lg:px-8 lg:pt-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="relative min-h-[620px] overflow-hidden rounded-[32px] bg-[#241E1A] shadow-[0_30px_80px_rgba(36,30,26,0.18)] dark:bg-[#1B1613] sm:rounded-[42px] lg:min-h-[680px]">
            {/* Image */}
            <div className="absolute inset-0 lg:left-[29%]">
              <img
                src={getImage(governorate)}
                alt={governorate.name}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-l from-[#241E1A] via-[#241E1A]/75 to-transparent lg:from-[#241E1A] lg:via-[#241E1A]/40 lg:to-transparent" />

              <div className="absolute inset-0 bg-gradient-to-t from-[#241E1A]/90 via-transparent to-[#241E1A]/10" />
            </div>

            {/* Decorative museum line */}
            <div className="absolute bottom-8 right-8 top-8 hidden w-px bg-white/15 lg:block" />

            {/* Pattern */}
            <div className="pointer-events-none absolute left-0 top-0 opacity-20">
              <NubianGeometricPattern />
            </div>

            {/* Content */}
            <div className="relative z-10 flex min-h-[620px] flex-col justify-between p-6 sm:p-10 lg:min-h-[680px] lg:w-[57%] lg:p-16">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="mb-3 flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-white/55">
                    <span className="h-px w-10 bg-[#d5a56d]" />
                    ARCHIVE {orderFormatted}
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white/80 backdrop-blur-md">
                    <Compass className="h-3.5 w-3.5" />
                    أرشيف الصعيد
                  </div>
                </div>

                <button
                  onClick={() => setActivePage('governorates')}
                  className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-white hover:text-[#241E1A]"
                  aria-label="رجوع"
                >
                  <ArrowLeft className="h-5 w-5 transition group-hover:-translate-x-0.5" />
                </button>
              </div>

              <div className="max-w-2xl">
                <div className="mb-5 flex items-end gap-4">
                  <span className="text-[72px] font-black leading-none tracking-[-0.08em] text-white/10 sm:text-[110px]">
                    {orderFormatted}
                  </span>

                  <div className="mb-2 h-px flex-1 bg-white/15" />
                </div>

                <p className="mb-4 text-sm font-bold text-[#E8B19D]">
                  {governorate.capitalCity
                    ? `العاصمة • ${governorate.capitalCity}`
                    : 'من أرشيف الصعيد'}
                </p>

                <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.045em] text-white sm:text-7xl lg:text-[92px]">
                  {governorate.name}
                </h1>

                <p className="mt-7 max-w-xl text-base leading-8 text-white/70 sm:text-lg">
                  {governorate.shortIntro ||
                    'حكاية مكان، وذاكرة ناس، وتراث لسه عايش.'}
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  <button
                    onClick={() => scrollToSection('places')}
                    className="group inline-flex items-center gap-2 rounded-full bg-[#211d18] text-white dark:bg-white dark:text-[#211d18] px-6 py-3.5 text-sm font-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#9a6a35] dark:hover:bg-[#9a6a35] dark:hover:text-white cursor-pointer shadow-md"                  >
                    اكتشف المعالم
                    <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
                  </button>

                  <button
                    onClick={() => scrollToSection('market')}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/15"
                  >
                    <Store className="h-4 w-4" />
                    سوق المحافظة
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-8 sm:grid-cols-4">
                {[
                  ['المعالم', places.length],
                  ['الصنايع', crafts.length],
                  ['الحكايات', stories.length],
                  ['الناس', people.length],
                ].map(([label, count]) => (
                  <div
                    key={String(label)}
                    className="border-r border-white/15 pr-4 first:border-r-0"
                  >
                    <div className="text-2xl font-black text-white sm:text-3xl">
                      {count}
                    </div>
                    <div className="mt-1 text-xs font-bold text-white/45">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MUSEUM INDEX
      ========================================================= */}

      <div className="sticky top-0 z-40 border-y border-black/10 bg-[#eee8dc]/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0b0a]/90">
        <div className="mx-auto max-w-[1500px]">
          <div className="no-scrollbar flex overflow-x-auto">
            {sections.map((section) => {
              const Icon = section.icon;
              const active = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`group flex min-w-max items-center gap-3 border-l border-[#E4DBD2] px-4 py-4 text-right transition first:border-l-0 dark:border-[#382D27] sm:px-6 ${active
                    ? 'bg-[#241E1A] text-white dark:bg-[#FFF8F1] dark:text-[#17120F]'
                    : 'text-[#73675B] hover:bg-white hover:text-[#241E1A] dark:text-[#B8AAA0] dark:hover:bg-[#1B1613] dark:hover:text-white'
                    }`}
                >
                  <span className="text-[10px] font-black opacity-40">
                    {section.number}
                  </span>

                  <Icon className="h-4 w-4" />

                  <span className="text-xs font-black">
                    {section.label}
                  </span>

                  {typeof section.count === 'number' && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black ${active
                        ? 'bg-white/10'
                        : 'bg-[#EEE6DE] dark:bg-[#2A211D]'
                        }`}
                    >
                      {section.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        {/* =======================================================
            OVERVIEW
        ======================================================= */}

        <section
          id="overview"
          className="scroll-mt-20 py-16 sm:py-24 lg:py-32"
        >
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.8fr] lg:gap-20">
            <div>
              <div className="mb-5 flex items-center gap-3 text-xs font-black tracking-[0.18em] text-[#9a6a35] dark:text-[#d5a56d]">
                <span>01</span>
                <span className="h-px w-10 bg-current" />
                الحكاية
              </div>

              <h2 className="max-w-md text-4xl font-black leading-tight tracking-[-0.035em] sm:text-5xl">
                المحافظة مش مجرد مكان.
                <span className="block text-[#9a6a35] dark:text-[#d5a56d]">
                  دي ذاكرة.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-sm leading-8 text-[#73675B] dark:text-[#B8AAA0]">
                رحلة جوه تفاصيل المكان، من الحجر والشارع لحد الصنعة والحكاية
                والأكل والناس.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -right-3 top-6 h-full w-px bg-[#D8CCC1] dark:bg-[#382D27]" />

              <div className="pr-7 sm:pr-12">
                <span className="text-6xl font-black leading-none text-[#241E1A]/10 dark:text-white/10 sm:text-8xl">
                  “
                </span>

                <p className="mt-[-18px] text-2xl font-bold leading-[1.8] tracking-[-0.02em] text-[#332A24] dark:text-[#F3E8DF] sm:text-3xl lg:text-4xl">
                  {governorate.history ||
                    governorate.shortIntro ||
                    'كل شارع هنا شايل حكاية، وكل حكاية بتفتح باب على جزء من تاريخ الصعيد.'}
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  {(governorate.famousFor || [])
                    .slice(0, 5)
                    .map((item: any, index: number) => (
                      <span
                        key={index}
                        className="rounded-full border border-[#DDD1C7] bg-white px-4 py-2 text-xs font-bold text-[#5F534A] dark:border-[#382D27] dark:bg-[#1B1613] dark:text-[#C8BAB0]"
                      >
                        {typeof item === 'string'
                          ? item
                          : item?.name || item?.title}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cultural strip */}
          {governorate.culturalTraditions && (
            <div className="mt-16 grid gap-5 lg:grid-cols-3">
              {[
                {
                  icon: Crown,
                  title: 'الهوية',
                  text:
                    typeof governorate.culturalTraditions === 'string'
                      ? governorate.culturalTraditions
                      : 'تقاليد متوارثة بتتغير مع الزمن من غير ما تفقد روحها.',
                },
                {
                  icon: Mountain,
                  title: 'المكان',
                  text: governorate.shortIntro || 'جغرافيا صنعت شخصية المكان.',
                },
                {
                  icon: Flame,
                  title: 'الذاكرة',
                  text:
                    governorate.history ||
                    'حكايات متوارثة من جيل لجيل.',
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="group rounded-[28px] border border-[#E4DBD2] bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#241E1A]/5 dark:border-[#382D27] dark:bg-[#1B1613] dark:hover:shadow-black/20"
                  >
                    <Icon className="mb-8 h-6 w-6 text-[#9a6a35] dark:text-[#d5a56d]" />

                    <h3 className="mb-3 text-lg font-black">
                      {item.title}
                    </h3>

                    <p className="text-sm leading-7 text-[#73675B] dark:text-[#B8AAA0]">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* =======================================================
            PLACES
        ======================================================= */}

        <section id="places" className="scroll-mt-20 py-16 sm:py-24">
          <SectionHeading
            number="02"
            eyebrow="PLACES"
            title="أماكن تستاهل تتشاف"
            description="من المعابد للمساجد والأديرة والقرى، كل مكان له شخصية وحكاية."
            icon={Landmark}
          />

          {places.length > 0 ? (
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-12">
              {places.slice(0, 6).map((place: HeritagePlace, index: number) => {
                const large = index === 0 || index === 3;

                return (
                  <button
                    key={place.id || place.slug || index}
                    onClick={() => navigateToPlace(place.slug || place.id)}
                    className={`group relative overflow-hidden rounded-[30px] text-right ${large
                      ? 'min-h-[480px] lg:col-span-7'
                      : 'min-h-[330px] lg:col-span-5'
                      }`}
                  >
                    <img
                      src={getImage(place)}
                      alt={place.title}
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

                    <div className="absolute left-6 top-6">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/20 text-xs font-black text-white backdrop-blur-md">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="absolute right-6 top-6 flex flex-wrap items-center gap-2">
                      {place.visitInfo?.visitStatus && place.visitInfo.visitStatus !== 'open' && (
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-black shadow-lg ${
                            place.visitInfo.visitStatus === 'closed_to_public'
                              ? 'bg-red-600/90 text-white border border-red-400/40'
                              : place.visitInfo.visitStatus === 'closed_for_restoration'
                              ? 'bg-amber-600/90 text-white border border-amber-400/40'
                              : place.visitInfo.visitStatus === 'public_landmark'
                              ? 'bg-emerald-600/90 text-white border border-emerald-400/40'
                              : place.visitInfo.visitStatus === 'active_institution'
                              ? 'bg-indigo-600/90 text-white border border-indigo-400/40'
                              : 'bg-orange-600/90 text-white border border-orange-400/40'
                          }`}
                        >
                          {place.visitInfo.visitStatus === 'closed_to_public' && '⚠️ مغلق أمام الجمهور'}
                          {place.visitInfo.visitStatus === 'closed_for_restoration' && '🏛️ مغلق للترميم'}
                          {place.visitInfo.visitStatus === 'public_landmark' && '📍 معلم عام مفتوح'}
                          {place.visitInfo.visitStatus === 'active_institution' && '🎓 صرح تعليمي وديني'}
                          {place.visitInfo.visitStatus === 'requires_safari_permit' && '🚙 محمية وسفاري'}
                        </span>
                      )}
                    </div>

                    <div className="absolute inset-x-6 bottom-6">
                      <div className="mb-3 flex items-center gap-2 text-xs font-bold text-white/60">
                        <MapPin className="h-3.5 w-3.5" />
                        {place.governorateName || governorate.name}
                      </div>

                      <h3 className="text-2xl font-black text-white sm:text-3xl">
                        {place.title}
                      </h3>

                      <div className="mt-4 flex items-center gap-2 text-xs font-bold text-white/70 transition group-hover:text-white">
                        اكتشف المكان
                        <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState text="لسه بنضيف معالم المحافظة للأرشيف." />
          )}
        </section>

        {/* =======================================================
            CRAFTS
        ======================================================= */}

        <section id="crafts" className="scroll-mt-20 py-16 sm:py-24">
          <SectionHeading
            number="03"
            eyebrow="CRAFTS"
            title="الصنعة لسه عايشة"
            description="إيد بتشتغل، وخبرة بتتنقل، وتفاصيل اتولدت في الصعيد ولسه مستمرة."
            icon={Sparkles}
          />

          {crafts.length > 0 ? (
            <div className="mt-12 divide-y divide-[#E4DBD2] border-y border-[#E4DBD2] dark:divide-[#382D27] dark:border-[#382D27]">
              {crafts.slice(0, 7).map((craft: CulturalCraft, index: number) => (
                <button
                  key={craft.id || craft.slug || index}
                  onClick={() => navigateToCraft(craft.slug || craft.id)}
                  className="group grid w-full grid-cols-[60px_92px_1fr_auto] items-center gap-4 py-5 text-right transition hover:px-3 sm:grid-cols-[80px_150px_1fr_auto] sm:gap-6"
                >
                  <span className="text-xs font-black text-[#9a6a35] dark:text-[#d5a56d]">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="h-20 overflow-hidden rounded-2xl sm:h-24">
                    <img
                      src={getImage(craft)}
                      alt={craft.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-black sm:text-2xl">
                      {craft.title || 'حرفة تراثية'}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-xs leading-6 text-[#73675B] dark:text-[#B8AAA0] sm:text-sm">
                      {craft.shortDescription ||
                        craft.history ||
                        'صنعة متوارثة من أهل المكان.'}
                    </p>
                  </div>

                  <ArrowLeft className="hidden h-5 w-5 text-[#A89B91] transition group-hover:-translate-x-1 group-hover:text-[#9a6a35] dark:group-hover:text-[#d5a56d] sm:block" />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState text="لسه بنوثق صنايع المحافظة." />
          )}
        </section>

        {/* =======================================================
            STORIES
        ======================================================= */}

        <section id="stories" className="scroll-mt-20 py-16 sm:py-24">
          <SectionHeading
            number="04"
            eyebrow="STORIES"
            title="الحكاية قبل الصورة"
            description="مرويات وأحداث وذاكرة شعبية بتخلي المكان له صوت."
            icon={ScrollText}
          />

          {stories.length > 0 ? (
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {stories.slice(0, 6).map((story: WahStory, index: number) => (
                <button
                  key={story.id || story.slug || index}
                  onClick={() => navigateToStory(story.slug || story.id)}
                  className={`group relative overflow-hidden rounded-[30px] border border-[#E4DBD2] bg-white text-right dark:border-[#382D27] dark:bg-[#1B1613] ${index === 0 ? 'lg:row-span-2' : ''
                    }`}
                >
                  <div
                    className={
                      index === 0
                        ? 'h-[500px]'
                        : 'h-[260px]'
                    }
                  >
                    <img
                      src={getImage(story)}
                      alt={story.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-6 pt-24">
                    <div className="mb-3 text-[10px] font-black tracking-[0.18em] text-[#E8B19D]">
                      STORY {String(index + 1).padStart(2, '0')}
                    </div>

                    <h3 className="text-xl font-black text-white sm:text-2xl">
                      {story.title || 'حكاية من الصعيد'}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-xs leading-6 text-white/65">
                      {story.excerpt ||
                        story.content ||
                        'حكاية من ذاكرة المكان.'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState text="لسه بنجمع حكايات المحافظة." />
          )}
        </section>

        {/* =======================================================
            PEOPLE
        ======================================================= */}

        <section id="people" className="scroll-mt-20 py-16 sm:py-24">
          <SectionHeading
            number="05"
            eyebrow="PEOPLE"
            title="الناس هم التراث"
            description="أصحاب الصنعة، الرواة، والشخصيات اللي بتحافظ على روح المكان."
            icon={Users}
          />

          {people.length > 0 ? (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {people.slice(0, 8).map((person: LocalPerson, index: number) => (
                <button
                  key={person.id || person.slug || index}
                  onClick={() => navigateToPerson(person.slug || person.id)}
                  className="group overflow-hidden rounded-[28px] border border-[#E4DBD2] bg-white text-right transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 dark:border-[#382D27] dark:bg-[#1B1613] dark:hover:shadow-black/20"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={getPersonImage(person)}
                      alt={person.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-xs font-black text-white backdrop-blur-md">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-black">
                      {person.name || 'شخصية من المحافظة'}
                    </h3>

                    <p className="mt-1 text-xs font-bold text-[#9a6a35] dark:text-[#d5a56d]">
                      {getPersonTitle(person)}
                    </p>

                    <p className="mt-3 line-clamp-2 text-xs leading-6 text-[#73675B] dark:text-[#B8AAA0]">
                      {person.bio ||
                        person.biography ||
                        'واحد من الناس اللي شايلين ذاكرة المكان.'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState text="لسه بنوثق الشخصيات المؤثرة." />
          )}
        </section>

        {/* =======================================================
            FOOD
        ======================================================= */}

        <section id="food" className="scroll-mt-20 py-16 sm:py-24">
          <SectionHeading
            number="06"
            eyebrow="FOOD"
            title="طعم المكان"
            description="الأكل جزء من الحكاية، وكل وصفة ليها مناسبة وذاكرة."
            icon={Utensils}
          />

          {foods.length > 0 ? (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {foods.slice(0, 8).map((food: UpperEgyptFood, index: number) => (
                <button
                  key={food.id || food.slug || index}
                  onClick={() => navigateToFood(food.slug || food.id)}
                  className="group relative min-h-[330px] overflow-hidden rounded-[28px] text-right"
                >
                  <img
                    src={getImage(food)}
                    alt={getFoodTitle(food)}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  <div className="absolute left-5 top-5">
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black text-white backdrop-blur-md">
                      {food.category ||
                        food.occasionOrTradition ||
                        'أكلة شعبية'}
                    </span>
                  </div>

                  <div className="absolute inset-x-5 bottom-5">
                    <div className="mb-2 text-[10px] font-black tracking-widest text-white/45">
                      FOOD {String(index + 1).padStart(2, '0')}
                    </div>

                    <h3 className="text-xl font-black text-white">
                      {getFoodTitle(food)}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-xs leading-6 text-white/65">
                      {food.story ||
                        food.originStory ||
                        food.description ||
                        'طعم من ذاكرة المكان.'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState text="لسه بنوثق أكلات المحافظة." />
          )}
        </section>

        {/* =======================================================
            EVENTS
        ======================================================= */}

        <section id="events" className="scroll-mt-20 py-16 sm:py-24">
          <SectionHeading
            number="07"
            eyebrow="SEASONS"
            title="المواسم اللي بتجمع الناس"
            description="مناسبات وأحداث بتحرك الذاكرة وتجمع أهل المكان."
            icon={CalendarDays}
          />

          {events.length > 0 ? (
            <div className="mt-12 border-y border-[#E4DBD2] dark:border-[#382D27]">
              {events.slice(0, 7).map((event: CulturalEvent, index: number) => (
                <button
                  key={event.id || event.slug || index}
                  onClick={() => navigateToEvent(event.slug || event.id)}
                  className="group grid w-full gap-5 border-b border-[#E4DBD2] py-7 text-right last:border-b-0 dark:border-[#382D27] md:grid-cols-[120px_1fr_auto] md:items-center"
                >
                  <div>
                    <div className="text-2xl font-black text-[#9a6a35] dark:text-[#d5a56d]">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <div className="mt-1 text-[10px] font-bold text-[#8B7D73] dark:text-[#8F8178]">
                      {getEventDate(event)}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-black transition group-hover:text-[#9a6a35] dark:group-hover:text-[#d5a56d]">
                      {event.title || 'فعالية من المحافظة'}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-[#73675B] dark:text-[#B8AAA0]">
                      {event.description ||
                        'موعد من مواسم المكان.'}
                    </p>
                  </div>

                  <ArrowLeft className="hidden h-5 w-5 text-[#A89B91] transition group-hover:-translate-x-1 group-hover:text-[#9a6a35] dark:group-hover:text-[#d5a56d] md:block" />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState text="لسه بنضيف مواسم وأحداث المحافظة." />
          )}
        </section>

        {/* =======================================================
            MARKET
        ======================================================= */}

        <section id="market" className="scroll-mt-20 py-16 sm:py-24 lg:py-32">
          <div className="relative overflow-hidden rounded-[36px] bg-[#241E1A] p-7 text-white sm:p-10 lg:p-14 dark:bg-[#1B1613]">
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full border border-white/10" />

            <div className="relative z-10 flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <div className="mb-5 flex items-center gap-3 text-xs font-black tracking-[0.18em] text-[#E8B19D]">
                  <span>08</span>
                  <span className="h-px w-10 bg-[#d5a56d]" />
                  MARKET
                </div>

                <h2 className="text-4xl font-black tracking-[-0.035em] sm:text-6xl">
                  خد حتة من الحكاية معاك.
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-8 text-white/60 sm:text-base">
                  منتجات من أهل الصعيد، معمولة بإيد أصحابها، وكل قطعة وراها
                  قصة.
                </p>
              </div>

              <button
                onClick={() => setActivePage('market')}
                className="group inline-flex w-fit items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-black text-[#241E1A] transition hover:-translate-y-1 hover:bg-[#d5a56d] hover:text-white"
              >
                <Store className="h-4 w-4" />
                ادخل السوق
                <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
              </button>
            </div>

            {products.length > 0 && (
              <div className="relative z-10 mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {products.slice(0, 4).map((product: Product, index: number) => (
                  <button
                    key={product.id || index}
                    onClick={() => navigateToProduct(product.id)}
                    className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/5 text-right backdrop-blur-sm transition hover:bg-white/10"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={getImage(product)}
                        alt={product.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-4">
                      <div className="mb-1 text-[10px] font-bold text-white/40">
                        {product.categoryName || 'منتج تراثي'}
                      </div>

                      <h3 className="line-clamp-1 text-sm font-black text-white">
                        {product.title || 'منتج من الصعيد'}
                      </h3>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* =========================================================
          MOBILE FLOATING INDEX
      ========================================================= */}

      <div className="fixed bottom-5 left-5 z-50 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen((value) => !value)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#241E1A] text-white shadow-2xl transition hover:scale-105 dark:bg-[#FFF8F1] dark:text-[#17120F]"
          aria-label="فتح الفهرس"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {mobileMenuOpen && (
          <div className="absolute bottom-16 left-0 w-60 overflow-hidden rounded-[24px] border border-[#E4DBD2] bg-white p-2 shadow-2xl dark:border-[#382D27] dark:bg-[#1B1613]">
            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right transition hover:bg-[#F6F1EA] dark:hover:bg-[#2A211D]"
                >
                  <span className="text-[10px] font-black text-[#9a6a35] dark:text-[#d5a56d]">
                    {section.number}
                  </span>

                  <Icon className="h-4 w-4 text-[#73675B] dark:text-[#B8AAA0]" />

                  <span className="text-xs font-bold">
                    {section.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* =============================================================
   SECTION HEADING
============================================================= */

interface SectionHeadingProps {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  number,
  eyebrow,
  title,
  description,
  icon: Icon,
}) => {
  return (
    <div className="grid gap-7 lg:grid-cols-[170px_1fr] lg:items-end">
      <div className="flex items-center gap-4 lg:block">
        <div className="text-5xl font-black leading-none tracking-[-0.06em] text-[#241E1A]/10 dark:text-white/10 lg:text-7xl">
          {number}
        </div>

        <div className="h-px flex-1 bg-[#D8CCC1] dark:bg-[#382D27] lg:mt-7 lg:w-20" />
      </div>

      <div className="max-w-3xl">
        <div className="mb-4 flex items-center gap-3 text-[10px] font-black tracking-[0.2em] text-[#9a6a35] dark:text-[#d5a56d]">
          <Icon className="h-4 w-4" />
          {eyebrow}
        </div>

        <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl lg:text-6xl">
          {title}
        </h2>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#73675B] dark:text-[#B8AAA0] sm:text-base">
          {description}
        </p>
      </div>
    </div>
  );
};

/* =============================================================
   EMPTY STATE
============================================================= */

const EmptyState: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="mt-10 rounded-[28px] border border-dashed border-[#D8CCC1] bg-white/50 px-6 py-14 text-center dark:border-[#382D27] dark:bg-[#1B1613]/50">
      <Package className="mx-auto mb-4 h-8 w-8 text-[#A89B91] dark:text-[#74665D]" />

      <p className="text-sm font-bold text-[#73675B] dark:text-[#B8AAA0]">
        {text}
      </p>
    </div>
  );
};