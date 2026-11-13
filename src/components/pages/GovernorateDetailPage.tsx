import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { VisitorMediaGallery } from '../common/VisitorMediaGallery';
import type { WahGovernorate } from '../../types';

import {
  ArrowLeft,
  ArrowUpLeft,
  CalendarDays,
  Compass,
  Crown,
  Flame,
  Film,
  Landmark,
  MapPin,
  Menu,
  Mountain,
  Package,
  ScrollText,
  Sparkles,
  Store,
  Utensils,
  Users,
  X,
  Pencil,
  Save,
  BookOpen,
  Feather,
} from 'lucide-react';

import {
  HeritagePlace,
  CulturalCraft,
  LocalPerson,
  UpperEgyptFood,
  CulturalEvent,
  Product,
} from '../../types';

const EMPTY_MEDIA_LIST: string[] = [];

interface GovernorateEditDraft {
  name: string;
  slug: string;
  shortIntro: string;
  history: string;
  famousFor: string;
  coverImage: string;
  gallery: string;
  videos: string;
  capitalCity: string;
  nickname: string;
  region: string;
  nileSegment: string;
  mapLatitude: string;
  mapLongitude: string;
  traditionalCraftsIds: string;
  traditionalFoodIds: string;
  culturalTraditions: string;
  status: WahGovernorate['status'];
  sourceName: string;
  sourceUrl: string;
  sourceType: string;
  researchDate: string;
  verificationStatus: NonNullable<WahGovernorate['verificationStatus']>;
}

const toMultilineValue = (value: unknown): string =>
  Array.isArray(value)
    ? value
      .map((item) => {
        if (typeof item === 'string') return item;
        if (!item || typeof item !== 'object') return '';
        const entry = item as Record<string, unknown>;
        return typeof entry.name === 'string'
          ? entry.name
          : typeof entry.title === 'string'
            ? entry.title
            : '';
      })
      .filter(Boolean)
      .join('\n')
    : typeof value === 'string'
      ? value
      : '';

const parseMultilineValue = (value: string): string[] =>
  Array.from(new Set(value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)));

const createGovernorateEditDraft = (governorate: WahGovernorate): GovernorateEditDraft => ({
  name: governorate.name || '',
  slug: governorate.slug || '',
  shortIntro: governorate.shortIntro || '',
  history: governorate.history || '',
  famousFor: toMultilineValue(governorate.famousFor),
  coverImage: governorate.coverImage || '',
  gallery: toMultilineValue(governorate.gallery),
  videos: toMultilineValue(
    Array.from(
      new Set([
        ...(governorate.videoUrl ? [governorate.videoUrl] : []),
        ...(Array.isArray(governorate.videos) ? governorate.videos : []),
      ])
    )
  ),
  capitalCity: governorate.capitalCity || '',
  nickname: governorate.nickname || '',
  region: governorate.region || '',
  nileSegment: governorate.nileSegment || '',
  mapLatitude: governorate.mapCoordinates?.lat === undefined ? '' : String(governorate.mapCoordinates.lat),
  mapLongitude: governorate.mapCoordinates?.lng === undefined ? '' : String(governorate.mapCoordinates.lng),
  traditionalCraftsIds: toMultilineValue(governorate.traditionalCraftsIds),
  traditionalFoodIds: toMultilineValue(governorate.traditionalFoodIds),
  culturalTraditions: toMultilineValue(governorate.culturalTraditions),
  status: governorate.status || 'approved',
  sourceName: governorate.sourceName || '',
  sourceUrl: governorate.sourceUrl || '',
  sourceType: governorate.sourceType || '',
  researchDate: governorate.researchDate?.slice(0, 10) || '',
  verificationStatus: governorate.verificationStatus || governorate.status || 'approved',
});

const NILE_ORDER_MAP: Record<string, number> = {
  'bani-suef': 1,
  'beni-suef': 1,
  minya: 2,
  asyut: 3,
  sohag: 4,
  qena: 5,
  luxor: 6,
  aswan: 7,
  'new-valley': 8,
};

const GOVERNORATE_PATTERN_CONFIG: Record<string, { position: string; transform?: string; scale?: number }> = {
  'أسوان': { position: '0px 0px', transform: 'none', scale: 440 },
  'الأقصر': { position: '160px 80px', transform: 'scaleX(-1)', scale: 480 },
  'قنا': { position: '80px 180px', transform: 'rotate(180deg)', scale: 460 },
  'سوهاج': { position: '240px 60px', transform: 'scaleY(-1)', scale: 500 },
  'أسيوط': { position: '120px 240px', transform: 'none', scale: 450 },
  'المنيا': { position: '320px 140px', transform: 'scaleX(-1)', scale: 470 },
  'بني سويف': { position: '40px 100px', transform: 'rotate(180deg)', scale: 460 },
  'الفيوم': { position: '200px 220px', transform: 'none', scale: 490 },
  'الوادي الجديد': { position: '280px 40px', transform: 'scaleY(-1)', scale: 520 },
  'البحر الأحمر': { position: '60px 160px', transform: 'scaleX(-1)', scale: 450 },
};

export const GovernorateDetailPage: React.FC = () => {
  const {
    selectedGovernorateSlug,
    navigateToPlace,
    navigateToCraft,
    navigateToPerson,
    navigateToFood,
    navigateToEvent,
    navigateToProduct,
    setActivePage,
    addToast,
    currentUser,
    currentRole,
  } = useApp();

  const isAdmin = currentRole === 'admin' || currentUser?.role === 'admin';
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<GovernorateEditDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const orderNumber =
    governorate?.nileOrder || (governorate?.order || (governorate?.slug ? NILE_ORDER_MAP[governorate.slug] : 1));
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
          addToast?.('error', 'حصلت مشكلة في تحميل بيانات المحافظة');
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
  const people = governorate?.people || [];
  const foods = governorate?.foods || [];
  const rawEvents = governorate?.events || [];
  const rawSeasons = governorate?.seasons || [];
  const events = useMemo(() => {
    const combined = [...rawEvents];
    for (const season of rawSeasons) {
      if (!combined.some((e: any) => e.id === season.id || (season.slug && e.slug === season.slug))) {
        combined.push({
          id: season.id,
          title: season.title,
          slug: season.slug || season.id,
          governorateId: season.governorateId,
          governorateName: season.governorateName,
          category: season.category || 'harvest',
          eventDate: season.eventDate || `موسم سنوي (${season.startPeriod || ''} - ${season.endPeriod || ''})`,
          timeOfYear: season.timeOfYear || `${season.startPeriod || ''} - ${season.endPeriod || ''}`,
          description: season.description,
          coverImage: season.coverImage,
          locationName: season.cityName || season.governorateName,
          status: season.status || 'approved',
        });
      }
    }
    return combined;
  }, [rawEvents, rawSeasons]);

  const products = governorate?.products || [];
  const governorateVideos = useMemo(
    () =>
      Array.from(
        new Set(
          [
            ...(governorate?.videoUrl ? [governorate.videoUrl] : []),
            ...(Array.isArray(governorate?.videos) ? governorate.videos : []),
          ].filter(Boolean)
        )
      ),
    [governorate?.videoUrl, governorate?.videos]
  );

  const openGovernorateEditor = () => {
    if (!isAdmin || !governorate) return;
    setEditDraft(createGovernorateEditDraft(governorate as WahGovernorate));
    setIsEditModalOpen(true);
  };

  const handleSaveGovernorate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isAdmin || !governorate || !editDraft || isSaving) return;

    const videoLinks = parseMultilineValue(editDraft.videos);
    for (const link of videoLinks) {
      try {
        const parsed = new URL(link);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          throw new Error();
        }
      } catch {
        addToast('رابط فيديو غير صالح', `تأكد من الرابط: ${link}`, 'error');
        return;
      }
    }

    const hasLatitude = editDraft.mapLatitude.trim() !== '';
    const hasLongitude = editDraft.mapLongitude.trim() !== '';
    if (hasLatitude !== hasLongitude) {
      addToast('إحداثيات غير مكتملة', 'أدخل خط العرض والطول معًا أو اتركهما فارغين', 'error');
      return;
    }

    let mapCoordinates: WahGovernorate['mapCoordinates'] | null = null;
    if (hasLatitude && hasLongitude) {
      const lat = Number(editDraft.mapLatitude);
      const lng = Number(editDraft.mapLongitude);
      if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
        addToast('إحداثيات غير صالحة', 'خط العرض من -90 إلى 90 والطول من -180 إلى 180', 'error');
        return;
      }
      mapCoordinates = { lat, lng };
    }

    const name = editDraft.name.trim();
    const updatedSlug = editDraft.slug.trim();
    if (!name || !updatedSlug) {
      addToast('بيانات ناقصة', 'اسم ورابط المحافظة مطلوبان', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await wahApi.updateGovernorate(
        governorate.id || governorate.slug,
        {
          name,
          slug: updatedSlug,
          shortIntro: editDraft.shortIntro.trim(),
          history: editDraft.history.trim(),
          famousFor: parseMultilineValue(editDraft.famousFor),
          coverImage: editDraft.coverImage.trim(),
          gallery: parseMultilineValue(editDraft.gallery),
          videoUrl: videoLinks[0] || null,
          videos: videoLinks,
          capitalCity: editDraft.capitalCity.trim(),
          nickname: editDraft.nickname.trim(),
          region: editDraft.region.trim(),
          nileSegment: editDraft.nileSegment.trim(),
          mapCoordinates,
          traditionalCraftsIds: parseMultilineValue(editDraft.traditionalCraftsIds),
          traditionalFoodIds: parseMultilineValue(editDraft.traditionalFoodIds),
          culturalTraditions: parseMultilineValue(editDraft.culturalTraditions),
          status: editDraft.status,
          sourceName: editDraft.sourceName.trim(),
          sourceUrl: editDraft.sourceUrl.trim(),
          sourceType: editDraft.sourceType.trim(),
          researchDate: editDraft.researchDate,
          verificationStatus: editDraft.verificationStatus,
        },
        { id: currentUser?.id, role: 'admin' }
      );

      setGovernorate((current: any) => (current ? { ...current, ...updated } : updated));
      setIsEditModalOpen(false);
      addToast('تم الحفظ', 'تم تحديث بيانات المحافظة وروابط الفيديوهات', 'success');
    } catch (error: any) {
      addToast('تعذر الحفظ', error?.message || 'فشل تحديث بيانات المحافظة', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const sections = useMemo(
    () => [
      { id: 'overview', number: 'ص ١', label: 'الافتتاحية والحكاية', icon: ScrollText },
      { id: 'places', number: 'ص ٢', label: 'شواهد ومعالم', icon: Landmark, count: places.length },
      { id: 'crafts', number: 'ص ٣', label: 'أهل الصنعة', icon: Sparkles, count: crafts.length },
      { id: 'people', number: 'ص ٤', label: 'سير وتراجم', icon: Users, count: people.length },
      { id: 'food', number: 'ص ٥', label: 'زاد البيوت', icon: Utensils, count: foods.length },
      { id: 'events', number: 'ص ٦', label: 'دفتر المواسم', icon: CalendarDays, count: events.length },
      { id: 'market', number: 'ص ٧', label: 'وكالة الصعيد', icon: Store, count: products.length },
      { id: 'videos', number: 'ص ٨', label: 'الشريط المصور', icon: Film, count: governorateVideos.length },
    ],
    [
      places.length,
      crafts.length,
      people.length,
      foods.length,
      events.length,
      products.length,
      governorateVideos.length,
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

  const getPersonImage = (person: any) => {
    if (!person)
      return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80';
    const candidates = [
      person.avatarUrl,
      person.photoUrl,
      person.imageUrl,
      person.image,
      person.photo,
      person.coverImage,
    ].filter((u): u is string => typeof u === 'string' && u.trim().length > 0);

    const custom = candidates.find((u) => !u.includes('images.unsplash.com') && !u.includes('placeholder'));
    if (custom) return custom;

    return (
      person.avatarUrl ||
      person.photoUrl ||
      candidates[0] ||
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80'
    );
  };

  const getFoodTitle = (food: any) => food?.title || food?.name || 'أكلة من الصعيد';

  const getPersonTitle = (person: any) =>
    person?.craftTitle || person?.craftOrSkill || person?.titleOrRole || person?.title || 'شخصية من الصعيد';

  const getEventDate = (event: any) => event?.eventDate || event?.timeOfYear || event?.startDate || 'موعد الموسم';
  const GOVERNORATE_ARABIC_NAMES: Record<string, string> = {
    'bani-suef': 'بني سويف',
    'beni-suef': 'بني سويف',
    minya: 'المنيا',
    asyut: 'أسيوط',
    assiut: 'أسيوط',
    sohag: 'سوهاج',
    qena: 'قنا',
    luxor: 'الأقصر',
    aswan: 'أسوان',
    fayoum: 'الفيوم',
    fayyum: 'الفيوم',
    'new-valley': 'الوادي الجديد',
    'red-sea': 'البحر الأحمر',
  };

  if (loading) {
    const loadingGovName =
      governorate?.name || GOVERNORATE_ARABIC_NAMES[slug.toLowerCase()] || slug;

    return (
      <div
        dir="rtl"
        className="min-h-screen w-full overflow-x-hidden bg-[#F5EFE4] text-[#261910] dark:bg-[#16100C] dark:text-[#EFE6D8]"
      >
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5">
          <div className="border-y-4 border-double border-[#261910] py-8 px-12 text-center dark:border-[#C99444]">
            <Feather className="mx-auto mb-3 h-8 w-8 animate-bounce text-[#9E5A24]" />
            <p className="text-lg font-black">
              جاري تجهيز العدد الأرشيفي لمحافظة {loadingGovName}...
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
        className="min-h-screen w-full overflow-x-hidden bg-[#F5EFE4] text-[#261910] dark:bg-[#16100C] dark:text-[#EFE6D8]"
      >
        <div className="mx-auto max-w-xl px-5 py-20 text-center">
          <div className="border-4 border-double border-[#261910] bg-[#FAF6EE] p-12 dark:border-[#C99444] dark:bg-[#211710]">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-[#9E5A24]" />
            <h1 className="mb-3 text-2xl font-black">هذا العدد غير متوفر حالياً</h1>
            <p className="mb-7 text-sm text-[#7A6048] dark:text-[#BCA892]">
              يمكنك العودة لخريطة الصعيد لاختيار محافظة أخرى.
            </p>
            <button
              onClick={() => setActivePage('map')}
              className="inline-flex items-center gap-2 bg-[#261910] px-6 py-3 text-xs font-black text-white dark:bg-[#C99444] dark:text-[#16100C]"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة للخريطة
            </button>
          </div>
        </div>
      </div>
    );
  }

  const govPattern = (governorate?.name && GOVERNORATE_PATTERN_CONFIG[governorate.name]) || {
    position: '0px 0px',
    transform: 'none',
    scale: 460,
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full overflow-x-hidden bg-[#F5EFE4] text-[#261910] dark:bg-[#150E0A] dark:text-[#F0E6D8] transition-colors duration-500"
    >
      {/* =========================================================
          BROADSHEET MASTHEAD (ترويسة الجورنال الأرشيفي)
      ========================================================= */}
      <header className="relative w-full px-3 pt-4 sm:px-6 sm:pt-6 lg:px-10 lg:pt-10 2xl:px-16">
        {/* Top Utility Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#261910]/30 pb-3 text-xs font-bold dark:border-[#C99444]/30">
          <button
            onClick={() => setActivePage('map')}
            className="group inline-flex items-center gap-2 font-black text-[#261910] transition hover:text-primary dark:text-[#F0E6D8] dark:hover:text-[#C99444]"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
            <span>العودة إلى أطلس وخريطة الصعيد</span>
          </button>

          <div className="flex items-center gap-4">
            <span className="hidden text-[#7A6048] dark:text-[#BCA892] sm:inline">
              سلسلة وثائق التراث المصري — إصدار خاص غير دوري
            </span>

            {isAdmin && (
              <button
                type="button"
                onClick={openGovernorateEditor}
                className="inline-flex items-center gap-1.5 bg-primary px-4 py-1.5 text-xs font-black text-white transition hover:bg-primary-hover"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>تحرير العدد</span>
              </button>
            )}
          </div>
        </div>

        {/* Publication Nameplate */}
        <div className="mt-4 border-y-4 border-double border-[#261910] py-3 text-center dark:border-[#C99444]">
          <div className="grid items-center gap-2 text-xs font-bold sm:grid-cols-3">
            <div className="text-right hidden sm:block">
              <span>العدد التذكاري رقم ({orderFormatted})</span>
              <span className="mx-2">•</span>
              <span>{governorate.nileSegment || 'إقليم الصعيد'}</span>
            </div>

            <div className="text-center text-sm font-black tracking-[0.15em] text-[#9E5A24] dark:text-[#C99444]">
              ✦ جورنال أرشيف وَهْ للتراث ✦
            </div>

            <div className="text-left hidden sm:block">
              <span>الحاضرة: {governorate.capitalCity || governorate.name}</span>
              <span className="mx-2">•</span>
              <span>وثيقة معتمدة</span>
            </div>
          </div>
        </div>

        {/* Giant Headline Banner */}
        <div className="relative overflow-hidden border-b-2 border-[#261910] py-8 text-center dark:border-[#C99444]/60 sm:py-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.045]"
            style={{
              backgroundImage: "url('/pattern/pat2.png')",
              backgroundRepeat: 'repeat',
              backgroundSize: `${govPattern.scale}px auto`,
              backgroundPosition: govPattern.position,
            }}
            aria-hidden="true"
          />

          {governorate.nickname && (
            <div className="mb-3 inline-block border border-[#261910] bg-[#EAE0CE] px-4 py-1 text-xs font-black dark:border-[#C99444] dark:bg-[#261910] dark:text-[#C99444]">
              ملف خاص عن «{governorate.nickname}»
            </div>
          )}
          <br />
          <br />
          <h1 className="break-words text-4xl font-black leading-tight tracking-tight text-[#261910] dark:text-white sm:text-6xl sm:leading-none md:text-8xl lg:text-[110px]">
            محافظة {governorate.name}
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-base font-bold leading-8 text-[#5C4532] dark:text-[#D5C5B0] sm:text-xl">
            {governorate.shortIntro || 'حكاية مكان، وذاكرة ناس، وتراث لسه عايش في كل شارع وبيت.'}
          </p>
        </div>

        {/* =====================================================
            FRONT-PAGE 3-COLUMN NEWSPAPER GRID
        ===================================================== */}
        <div className="grid border-b-4 border-double border-[#261910] dark:border-[#C99444] lg:grid-cols-12">
          {/* Right Column (3 cols): Identity & Key Facts */}
          <div className="flex flex-col justify-between border-b border-[#261910]/30 p-4 dark:border-[#C99444]/30 sm:p-6 lg:col-span-3 lg:border-b-0 lg:border-l">
            <div>
              <div className="mb-4 border-b-2 border-[#261910] pb-2 text-xs font-black uppercase dark:border-[#C99444]">
                بطاقة تعريف الإقليم
              </div>

              <dl className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-dashed border-[#261910]/20 pb-2 dark:border-white/10">
                  <dt className="font-bold text-[#7A6048] dark:text-[#BCA892]">ترتيب النيل:</dt>
                  <dd className="font-black">المحطة رقم {orderFormatted}</dd>
                </div>
                <div className="flex justify-between border-b border-dashed border-[#261910]/20 pb-2 dark:border-white/10">
                  <dt className="font-bold text-[#7A6048] dark:text-[#BCA892]">العاصمة:</dt>
                  <dd className="font-black">{governorate.capitalCity || governorate.name}</dd>
                </div>
                <div className="flex justify-between border-b border-dashed border-[#261910]/20 pb-2 dark:border-white/10">
                  <dt className="font-bold text-[#7A6048] dark:text-[#BCA892]">النطاق:</dt>
                  <dd className="font-black">{governorate.nileSegment || 'صعيد مصر'}</dd>
                </div>
                <div className="flex justify-between pb-1">
                  <dt className="font-bold text-[#7A6048] dark:text-[#BCA892]">المصدر:</dt>
                  <dd className="font-black">{governorate.sourceName || 'أرشيف وه'}</dd>
                </div>
              </dl>

              {(governorate.famousFor || []).length > 0 && (
                <div className="mt-6">
                  <div className="mb-2.5 text-xs font-black text-[#9E5A24] dark:text-[#C99444]">
                    علامات مسجلة باسم المحافظة:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(governorate.famousFor || []).map((item: any, idx: number) => (
                      <span
                        key={idx}
                        className="border border-[#261910]/40 bg-[#EAE0CE] px-2.5 py-1 text-[11px] font-bold dark:border-[#C99444]/40 dark:bg-[#261910]"
                      >
                        {typeof item === 'string' ? item : item?.name || item?.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 border-t-2 border-[#261910] pt-4 text-[11px] leading-6 text-[#6E543C] dark:border-[#C99444] dark:text-[#BCA892]">
              يُحفظ هذا السجل ضمن مشروع توثيق التراث العمراني والشعبي لمحافظات صعيد مصر.
            </div>
          </div>

          {/* Center Column (6 cols): Main Archival Photograph */}
          <div className="border-b border-[#261910]/30 p-3 dark:border-[#C99444]/30 sm:p-6 lg:col-span-6 lg:border-b-0 lg:border-l">
            <div className="overflow-hidden border-2 border-[#261910] bg-[#261910] p-2 dark:border-[#C99444]">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={getImage(governorate)}
                  alt={governorate.name}
                  className="h-full w-full object-cover contrast-[1.05] sepia-[0.1]"
                />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs font-bold text-[#6E543C] dark:text-[#BCA892]">
              <span>▲ صورة أرشيفية توثق ملامح العمارة والحياة في محافظة {governorate.name}.</span>
              <span className="font-black text-[11px]">ARCHIVE-IMG #{orderFormatted}</span>
            </div>
          </div>

          {/* Left Column (3 cols): Table of Contents / Issue Index */}
          <div className="flex flex-col justify-between p-4 sm:p-6 lg:col-span-3">
            <div>
              <div className="mb-4 border-b-2 border-[#261910] pb-2 text-xs font-black uppercase dark:border-[#C99444]">
                فهرس أبواب العدد
              </div>

              <div className="divide-y divide-dashed divide-[#261910]/25 dark:divide-white/15">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className="group flex w-full items-center justify-between py-2.5 text-right transition hover:pr-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-[#9E5A24] dark:text-[#C99444]">{sec.number}</span>
                      <span className="text-xs font-black group-hover:underline">{sec.label}</span>
                    </div>
                    {typeof sec.count === 'number' && (
                      <span className="bg-[#EAE0CE] px-2 py-0.5 text-[10px] font-black dark:bg-[#261910] dark:text-[#C99444]">
                        {sec.count} مادة
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => scrollToSection('market')}
              className="mt-6 flex w-full items-center justify-center gap-2 border-2 border-[#261910] bg-[#261910] py-3 text-xs font-black text-white transition hover:bg-primary dark:border-[#C99444] dark:bg-[#C99444] dark:text-[#150E0A]"
            >
              <Store className="h-4 w-4" />
              تصفح وكالة وسوق المحافظة
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          STICKY NEWSPAPER RIBBON
      ========================================================= */}
      <div className="sticky top-0 z-40 border-b-2 border-[#261910] bg-[#EFE7D8]/95 backdrop-blur-md dark:border-[#C99444] dark:bg-[#1E140E]/95">
        <div className="w-full px-3 sm:px-6 lg:px-10 2xl:px-16">
          <div className="no-scrollbar flex items-center divide-x divide-x-reverse divide-[#261910]/20 overflow-x-auto dark:divide-white/15">
            {sections.map((section) => {
              const active = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`flex min-w-max items-center gap-2 px-5 py-3 text-xs font-black transition ${active
                      ? 'bg-[#261910] text-white dark:bg-[#C99444] dark:text-[#150E0A]'
                      : 'text-[#5C4532] hover:bg-[#E2D6C1] dark:text-[#D5C5B0] dark:hover:bg-[#2C1E15]'
                    }`}
                >
                  <span className="opacity-65">{section.number}:</span>
                  <span>{section.label}</span>
                  {typeof section.count === 'number' && <span>({section.count})</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN NEWSPAPER PAGES
      ========================================================= */}
      <main className="w-full px-3 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16 2xl:px-16">
        {/* =======================================================
            PAGE 01: EDITORIAL STORY (الافتتاحية والحكاية)
        ======================================================= */}
        <section id="overview" className="scroll-mt-20 pb-20">
          <BroadsheetHeader
            pageNumber="صفحة (١)"
            category="الافتتاحية والتاريخ الشفهي"
            title="المحافظة مش مجرد حدود.. دي ذاكرة ناس وحجر"
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            {/* Lead Article Text */}
            <div className="lg:col-span-8">
              <div className="border-l-0 border-[#261910]/25 lg:border-l lg:pl-8 dark:border-white/15">
                <p className="text-xl font-bold leading-[2.1] text-[#261910] dark:text-[#F0E6D8] sm:text-2xl">
                  <span className="float-right ml-3 mt-1 bg-[#261910] px-3 py-1 text-3xl font-black text-[#F5EFE4] dark:bg-[#C99444] dark:text-[#150E0A]">
                    فـ
                  </span>
                  {governorate.history ||
                    governorate.shortIntro ||
                    'ي كل زاوية من زوايا هذه المحافظة العريقة تقف الشواهد التاريخية جنباً إلى جنب مع الحكايات الشعبية المتوارثة، لتصنع نسيجاً ثقافياً فريداً يحفظ للصعيد هويته الأصيلة عبر القرون.'}
                </p>
              </div>
            </div>

            {/* Side Pull-Quote & Cultural Pillars */}
            <div className="flex flex-col justify-between gap-6 lg:col-span-4">
              <blockquote className="border-y-2 border-[#261910] bg-[#EAE0CE]/60 p-6 dark:border-[#C99444] dark:bg-[#221710]">
                <div className="mb-2 text-xs font-black text-[#9E5A24] dark:text-[#C99444]">
                  ✦ من طباع وهوية المكان
                </div>
                <p className="text-base font-black leading-8">
                  «
                  {typeof governorate.culturalTraditions === 'string'
                    ? governorate.culturalTraditions
                    : Array.isArray(governorate.culturalTraditions) && governorate.culturalTraditions.length > 0
                      ? governorate.culturalTraditions.join(' • ')
                      : 'تقاليد متوارثة بتتغير مع الزمن من غير ما تفقد روحها وأصالتها.'}
                  »
                </p>
              </blockquote>

              <div className="border border-[#261910]/30 bg-[#FAF6EE] p-5 dark:border-[#C99444]/30 dark:bg-[#1E140E]">
                <div className="mb-1 text-xs font-black text-[#9E5A24] dark:text-[#C99444]">الموقع والمزاج العام</div>
                <p className="text-xs font-bold leading-6 text-[#5C4532] dark:text-[#D5C5B0]">
                  {governorate.shortIntro || 'جغرافيا النيل والجبل صنعت شخصية المكان الفريدة.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            PAGE 02: PLACES (تحقيق مصور: المعالم)
        ======================================================= */}
        <section id="places" className="scroll-mt-20 pb-20">
          <BroadsheetHeader
            pageNumber="صفحة (٢)"
            category="تحقيق مصور • شواهد العمارة والتاريخ"
            title="أماكن ومعالم تستاهل تتشاف"
            count={places.length}
          />

          {places.length > 0 ? (
            <div className="mt-8 grid border-t border-r border-[#261910] dark:border-[#C99444]/50 md:grid-cols-2 lg:grid-cols-3">
              {places.slice(0, 6).map((place: HeritagePlace, index: number) => (
                <button
                  key={place.id || place.slug || index}
                  onClick={() => navigateToPlace(place.slug || place.id)}
                  className="group flex flex-col justify-between border-b border-l border-[#261910] bg-[#FAF6EE] p-6 text-right transition hover:bg-[#EAE0CE] dark:border-[#C99444]/50 dark:bg-[#1D140E] dark:hover:bg-[#281C14]"
                >
                  <div>
                    <div className="mb-3 flex items-center justify-between text-xs font-black text-[#9E5A24] dark:text-[#C99444]">
                      <span>شاهد رقم ({index + 1})</span>
                      <span>{place.governorateName || governorate.name}</span>
                    </div>

                    <div className="relative aspect-[16/10] overflow-hidden border border-[#261910] dark:border-[#C99444]/40">
                      <img
                        src={getImage(place)}
                        alt={place.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      {place.visitInfo?.visitStatus && place.visitInfo.visitStatus !== 'open' && (
                        <span className="absolute right-2 top-2 bg-[#261910] px-2.5 py-1 text-[10px] font-black text-white">
                          {place.visitInfo.visitStatus === 'closed_to_public' && 'مغلق للجمهور'}
                          {place.visitInfo.visitStatus === 'closed_for_restoration' && 'تحت الترميم'}
                          {place.visitInfo.visitStatus === 'public_landmark' && 'معلم مفتوح'}
                          {place.visitInfo.visitStatus === 'active_institution' && 'صرح نشط'}
                          {place.visitInfo.visitStatus === 'requires_safari_permit' && 'تصريح سفاري'}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-2xl font-black group-hover:underline">{place.title}</h3>

                    <p className="mt-2 line-clamp-3 text-xs font-bold leading-6 text-[#5C4532] dark:text-[#BCA892]">
                      {place.shortDescription || 'أحد أبرز المعالم التاريخية والتراثية الموثقة داخل المحافظة.'}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-dashed border-[#261910]/30 pt-3 text-xs font-black dark:border-white/15">
                    <span>اقرأ التقرير الكامل للمعلم</span>
                    <ArrowUpLeft className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState text="لم يتم إدراج معالم في هذا الباب بعد." />
          )}
        </section>

        {/* =======================================================
            PAGE 03: CRAFTS (ملف الصنايع والحرف)
        ======================================================= */}
        <section id="crafts" className="scroll-mt-20 pb-20">
          <BroadsheetHeader
            pageNumber="صفحة (٣)"
            category="ملف الإنتاج المحلي والمهارات اليدوية"
            title="الصنعة لسه عايشة في إيد أهلها"
            count={crafts.length}
          />

          {crafts.length > 0 ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {crafts.slice(0, 8).map((craft: CulturalCraft, index: number) => (
                <button
                  key={craft.id || craft.slug || index}
                  onClick={() => navigateToCraft(craft.slug || craft.id)}
                  className="group flex flex-col overflow-hidden border-2 border-[#261910] bg-[#FAF6EE] text-right transition hover:bg-[#EAE0CE] dark:border-[#C99444]/50 dark:bg-[#1D140E] sm:flex-row"
                >
                  <div className="h-48 w-full shrink-0 overflow-hidden border-b border-[#261910] sm:h-auto sm:w-44 sm:border-b-0 sm:border-l dark:border-[#C99444]/50">
                    <img
                      src={getImage(craft)}
                      alt={craft.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <span className="text-[11px] font-black text-[#9E5A24] dark:text-[#C99444]">
                        حرفة تقليدية • رقم ({index + 1})
                      </span>
                      <h3 className="mt-1 text-xl font-black group-hover:underline">{craft.title || 'حرفة تراثية'}</h3>
                      <p className="mt-2 line-clamp-2 text-xs font-bold leading-6 text-[#5C4532] dark:text-[#BCA892]">
                        {craft.shortDescription || craft.history || 'صنعة متوارثة من أهل المكان.'}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-1 text-xs font-black text-[#261910] dark:text-[#C99444]">
                      <span>مطالعة تفاصيل الصنعة</span>
                      <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-1" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState text="لم يتم إدراج حرف يدوية في هذا الباب بعد." />
          )}
        </section>

        {/* =======================================================
            PAGE 04: PEOPLE (سير وتراجم أهل المكان)
        ======================================================= */}
        <section id="people" className="scroll-mt-20 pb-20">
          <BroadsheetHeader
            pageNumber="صفحة (٤)"
            category="باب السير والتراجم الشعبية"
            title="الناس هم التراث.. وجوه صنعت ذاكرة المكان"
            count={people.length}
          />

          {people.length > 0 ? (
            <div className="mt-8 grid border-t border-r border-[#261910] dark:border-[#C99444]/50 sm:grid-cols-2 lg:grid-cols-4">
              {people.slice(0, 8).map((person: LocalPerson, index: number) => (
                <button
                  key={person.id || person.slug || index}
                  onClick={() => navigateToPerson(person.slug || person.id)}
                  className="group flex flex-col justify-between border-b border-l border-[#261910] bg-[#FAF6EE] p-5 text-right transition hover:bg-[#EAE0CE] dark:border-[#C99444]/50 dark:bg-[#1D140E]"
                >
                  <div>
                    <div className="aspect-[4/4.2] overflow-hidden border border-[#261910] dark:border-[#C99444]/40">
                      <img
                        src={getPersonImage(person)}
                        alt={person.name}
                        className="h-full w-full object-cover grayscale-[20%] transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                      />
                    </div>

                    <div className="mt-4">
                      <span className="text-[11px] font-black text-[#9E5A24] dark:text-[#C99444]">
                        {getPersonTitle(person)}
                      </span>
                      <h3 className="mt-1 text-xl font-black group-hover:underline">
                        {person.name || 'شخصية من المحافظة'}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-xs font-bold leading-6 text-[#5C4532] dark:text-[#BCA892]">
                        {person.bio || person.biography || 'واحد من الناس اللي شايلين ذاكرة المكان.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-dashed border-[#261910]/30 pt-2.5 text-xs font-black dark:border-white/15">
                    قراءة السيرة الكاملة ←
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState text="لم يتم إدراج سير وتراجم في هذا الباب بعد." />
          )}
        </section>

        {/* =======================================================
            PAGE 05: FOOD (زاد البيوت والمطبخ الصعيدي)
        ======================================================= */}
        <section id="food" className="scroll-mt-20 pb-20">
          <BroadsheetHeader
            pageNumber="صفحة (٥)"
            category="ملحق المائدة التراثية"
            title="طعم المكان.. وصفات من خزين البيوت"
            count={foods.length}
          />

          {foods.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {foods.slice(0, 8).map((food: UpperEgyptFood, index: number) => (
                <button
                  key={food.id || food.slug || index}
                  onClick={() => navigateToFood(food.slug || food.id)}
                  className="group border-2 border-[#261910] bg-[#FAF6EE] p-4 text-right transition hover:-translate-y-1 dark:border-[#C99444]/50 dark:bg-[#1D140E]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden border border-[#261910] dark:border-[#C99444]/40">
                    <img
                      src={getImage(food)}
                      alt={getFoodTitle(food)}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute right-2 top-2 bg-[#261910] px-2.5 py-0.5 text-[10px] font-black text-white">
                      {food.category || food.occasionOrTradition || 'أكلة شعبية'}
                    </span>
                  </div>

                  <h3 className="mt-3.5 text-lg font-black group-hover:underline">{getFoodTitle(food)}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs font-bold leading-6 text-[#5C4532] dark:text-[#BCA892]">
                    {food.story || food.originStory || food.description || 'طعم من ذاكرة المكان.'}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState text="لم يتم إدراج وصفات في هذا الباب بعد." />
          )}
        </section>

        {/* =======================================================
            PAGE 06: EVENTS (روزنامة المواسم)
        ======================================================= */}
        <section id="events" className="scroll-mt-20 pb-20">
          <BroadsheetHeader
            pageNumber="صفحة (٦)"
            category="الروزنامة السنوية والموالد"
            title="المواسم اللي بتجمع الناس"
            count={events.length}
          />

          {events.length > 0 ? (
            <div className="mt-8 divide-y-2 divide-[#261910] border-y-2 border-[#261910] dark:divide-[#C99444]/50 dark:border-[#C99444]/50">
              {events.slice(0, 7).map((event: CulturalEvent, index: number) => (
                <button
                  key={event.id || event.slug || index}
                  onClick={() => navigateToEvent(event.slug || event.id)}
                  className="group grid w-full items-center gap-4 py-6 text-right transition hover:bg-[#EAE0CE]/60 dark:hover:bg-[#221710] md:grid-cols-[200px_1fr_auto] md:px-4"
                >
                  <div>
                    <span className="inline-block bg-[#261910] px-3 py-1 text-xs font-black text-white dark:bg-[#C99444] dark:text-[#150E0A]">
                      {getEventDate(event)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black group-hover:underline">
                      {event.title || 'فعالية من المحافظة'}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs font-bold leading-6 text-[#5C4532] dark:text-[#BCA892]">
                      {event.description || 'موعد من مواسم المكان.'}
                    </p>
                  </div>

                  <ArrowLeft className="hidden h-5 w-5 transition group-hover:-translate-x-1 md:block" />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState text="لم يتم إدراج مواسم في هذا الباب بعد." />
          )}
        </section>

        {/* =======================================================
            PAGE 07: MARKET (إعلانات وكالة الصعيد)
        ======================================================= */}
        <section id="market" className="scroll-mt-20 pb-20">
          <div className="border-4 border-double border-[#261910] bg-[#EAE0CE] p-7 dark:border-[#C99444] dark:bg-[#221710] sm:p-10">
            <div className="flex flex-col justify-between gap-6 border-b-2 border-[#261910] pb-6 dark:border-[#C99444] lg:flex-row lg:items-end">
              <div>
                <div className="text-xs font-black text-[#9E5A24] dark:text-[#C99444]">
                  صفحة (٧) • وكالة وسوق الحرفيين بمحافظة {governorate.name}
                </div>
                <h2 className="mt-2 text-3xl font-black sm:text-5xl">خد حتة من الحكاية معاك</h2>
                <p className="mt-2 max-w-xl text-sm font-bold leading-7 text-[#5C4532] dark:text-[#D5C5B0]">
                  معروضات أصلية من شغل إيد الحرفيين في {governorate.name}، متاحة للشراء المباشر.
                </p>
              </div>

              <button
                onClick={() => setActivePage('market')}
                className="inline-flex w-fit items-center gap-2 bg-[#261910] px-7 py-4 text-xs font-black text-white transition hover:bg-primary dark:bg-[#C99444] dark:text-[#150E0A]"
              >
                <Store className="h-4 w-4" />
                الدخول إلى السوق العام
              </button>
            </div>

            {products.length > 0 && (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {products.slice(0, 4).map((product: Product, index: number) => (
                  <button
                    key={product.id || index}
                    onClick={() => navigateToProduct(product.id)}
                    className="group border-2 border-[#261910] bg-[#FAF6EE] p-3 text-right transition hover:-translate-y-1 dark:border-[#C99444]/50 dark:bg-[#16100C]"
                  >
                    <div className="aspect-square overflow-hidden border border-[#261910]/30">
                      <img
                        src={getImage(product)}
                        alt={product.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="pt-3">
                      <div className="text-[10px] font-black text-[#9E5A24] dark:text-[#C99444]">
                        {product.categoryName || 'منتج تراثي'}
                      </div>
                      <h3 className="mt-1 line-clamp-1 text-sm font-black group-hover:underline">
                        {product.title || 'منتج من الصعيد'}
                      </h3>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =======================================================
            PAGE 08: VIDEOS
        ======================================================= */}
        {/* =======================================================
            PAGE 08: VIDEOS (الشريط المصور والأرشيف السينمائي)
        ======================================================= */}
        {(governorateVideos.length > 0 || isAdmin) && (
          <section id="videos" className="scroll-mt-20 pb-10">
            <BroadsheetHeader
              pageNumber="صفحة (٨)"
              category="الأرشيف المرئي والتوثيق الميداني"
              title={`الشريط المصور لمحافظة ${governorate.name}`}
              count={governorateVideos.length}
            />

            <div className="mt-8 border-2 border-[#261910] bg-[#FAF6EE] p-4 shadow-[6px_6px_0px_#261910] dark:border-[#C99444]/60 dark:bg-[#1D140E] dark:shadow-[6px_6px_0px_#C99444] sm:p-7">
              {/* Top Archival Film Strip Meta Bar */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-[#261910]/25 pb-4 text-xs font-black text-[#9E5A24] dark:border-[#C99444]/30 dark:text-[#C99444]">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4" />
                  <span>وحدة التوثيق السمعي والبصري — أرشيف وَهْ</span>
                </div>

                <div className="flex items-center gap-3 font-black text-[11px] text-[#5C4532] dark:text-[#BCA892]">
                  <span>REEL-REF: #{orderFormatted}-VID</span>
                  <span>•</span>
                  <span>{governorateVideos.length} شريط مسجل</span>
                </div>
              </div>

              {/* Media Gallery Component Inside Newspaper Frame */}
              <div className="overflow-hidden border border-[#261910]/20 bg-[#F5EFE4]/60 p-2 dark:border-[#C99444]/20 dark:bg-[#150E0A]/60 sm:p-4">
                <VisitorMediaGallery
                  id="governorate-videos"
                  title={`الشريط المصور لمحافظة ${governorate.name}`}
                  entityType="governorate"
                  entityId={governorate.id || governorate.slug}
                  entitySlug={governorate.slug}
                  entityTitle={governorate.name}
                  coverImage={governorate.coverImage}
                  gallery={governorate.gallery || EMPTY_MEDIA_LIST}
                  videoUrl={governorate.videoUrl}
                  videos={governorate.videos || EMPTY_MEDIA_LIST}
                  initialTab="videos"
                  onVideoChange={(videoUrl, videos) => {
                    setGovernorate((current: any) =>
                      current ? { ...current, videoUrl: videoUrl || undefined, videos: videos || [] } : current
                    );
                  }}
                />
              </div>

              {/* Bottom Archival Caption Footer */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#261910]/20 pt-3 text-[11px] font-bold text-[#6E543C] dark:border-white/10 dark:text-[#BCA892]">
                <span>▲ المواد الفيلمية والصور المرفقة موثقة ضمن السجل البصري لمحافظة {governorate.name}.</span>
                <span>نهاية العدد الأرشيفي ({orderFormatted})</span>
              </div>
            </div>
          </section>
        )}      </main>

      {/* =========================================================
          ADMIN EDIT MODAL
      ========================================================= */}
      {isEditModalOpen && editDraft && isAdmin && (
        <div
          className="fixed inset-0 z-[10020] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="governorate-editor-title"
        >
          <form
            onSubmit={handleSaveGovernorate}
            className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border-2 border-[#261910] bg-[#FAF6EE] shadow-2xl dark:border-[#C99444] dark:bg-[#1c1a18]"
          >
            <header className="flex items-center justify-between border-b border-[#C8B396] p-4 sm:p-6 dark:border-[#6B3A1F]">
              <div>
                <h2 id="governorate-editor-title" className="text-lg font-black">
                  تعديل بيانات محافظة {governorate.name}
                </h2>
                <p className="mt-1 text-xs text-[#8C6F53] dark:text-[#D6C6B1]">
                  التغييرات متاحة للأدمن فقط ويتم حفظها مباشرة على بيانات المحافظة.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSaving}
                className="rounded-xl p-2 text-[#8C6F53] transition hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50"
                aria-label="إغلاق محرر المحافظة"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="grid gap-4 overflow-y-auto p-4 sm:grid-cols-2 sm:p-6">
              <label className="text-xs font-bold">
                اسم المحافظة *
                <input
                  required
                  value={editDraft.name}
                  onChange={(event) => setEditDraft({ ...editDraft, name: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold">
                الرابط المختصر (Slug) *
                <input
                  required
                  dir="ltr"
                  value={editDraft.slug}
                  onChange={(event) => setEditDraft({ ...editDraft, slug: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold">
                العاصمة
                <input
                  value={editDraft.capitalCity}
                  onChange={(event) => setEditDraft({ ...editDraft, capitalCity: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold">
                اللقب
                <input
                  value={editDraft.nickname}
                  onChange={(event) => setEditDraft({ ...editDraft, nickname: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold">
                الإقليم
                <input
                  value={editDraft.region}
                  onChange={(event) => setEditDraft({ ...editDraft, region: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold">
                قطاع النيل
                <input
                  value={editDraft.nileSegment}
                  onChange={(event) => setEditDraft({ ...editDraft, nileSegment: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold">
                حالة التوثيق
                <select
                  value={editDraft.status}
                  onChange={(event) =>
                    setEditDraft({ ...editDraft, status: event.target.value as WahGovernorate['status'] })
                  }
                  className="mt-1.5 w-full rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                >
                  {['draft', 'pending_review', 'approved', 'rejected', 'archived', 'verified', 'unverified'].map(
                    (status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    )
                  )}
                </select>
              </label>
              <label className="text-xs font-bold">
                اسم المصدر
                <input
                  value={editDraft.sourceName}
                  onChange={(event) => setEditDraft({ ...editDraft, sourceName: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold">
                نوع المصدر
                <input
                  value={editDraft.sourceType}
                  onChange={(event) => setEditDraft({ ...editDraft, sourceType: event.target.value })}
                  placeholder="official_gov / unesco / academic"
                  className="mt-1.5 w-full rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold">
                رابط المصدر
                <input
                  type="url"
                  dir="ltr"
                  value={editDraft.sourceUrl}
                  onChange={(event) => setEditDraft({ ...editDraft, sourceUrl: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold">
                تاريخ البحث
                <input
                  type="date"
                  value={editDraft.researchDate}
                  onChange={(event) => setEditDraft({ ...editDraft, researchDate: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold">
                حالة التحقق
                <select
                  value={editDraft.verificationStatus}
                  onChange={(event) =>
                    setEditDraft({
                      ...editDraft,
                      verificationStatus: event.target.value as WahGovernorate['status'],
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                >
                  {['draft', 'pending_review', 'approved', 'rejected', 'archived', 'verified', 'unverified'].map(
                    (status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    )
                  )}
                </select>
              </label>
              <label className="text-xs font-bold sm:col-span-2">
                نبذة قصيرة
                <textarea
                  rows={2}
                  value={editDraft.shortIntro}
                  onChange={(event) => setEditDraft({ ...editDraft, shortIntro: event.target.value })}
                  className="mt-1.5 w-full resize-y rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold sm:col-span-2">
                التاريخ والحكاية
                <textarea
                  rows={4}
                  value={editDraft.history}
                  onChange={(event) => setEditDraft({ ...editDraft, history: event.target.value })}
                  className="mt-1.5 w-full resize-y rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold">
                تشتهر بـ (كل عنصر في سطر)
                <textarea
                  rows={4}
                  value={editDraft.famousFor}
                  onChange={(event) => setEditDraft({ ...editDraft, famousFor: event.target.value })}
                  className="mt-1.5 w-full resize-y rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold">
                التقاليد الثقافية (كل عنصر في سطر)
                <textarea
                  rows={4}
                  value={editDraft.culturalTraditions}
                  onChange={(event) => setEditDraft({ ...editDraft, culturalTraditions: event.target.value })}
                  className="mt-1.5 w-full resize-y rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold">
                روابط الحرف المرتبطة (ID لكل سطر)
                <textarea
                  rows={3}
                  dir="ltr"
                  value={editDraft.traditionalCraftsIds}
                  onChange={(event) => setEditDraft({ ...editDraft, traditionalCraftsIds: event.target.value })}
                  className="mt-1.5 w-full resize-y rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold">
                روابط الأكلات المرتبطة (ID لكل سطر)
                <textarea
                  rows={3}
                  dir="ltr"
                  value={editDraft.traditionalFoodIds}
                  onChange={(event) => setEditDraft({ ...editDraft, traditionalFoodIds: event.target.value })}
                  className="mt-1.5 w-full resize-y rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold sm:col-span-2">
                رابط صورة الغلاف
                <input
                  type="url"
                  dir="ltr"
                  value={editDraft.coverImage}
                  onChange={(event) => setEditDraft({ ...editDraft, coverImage: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold sm:col-span-2">
                روابط صور المعرض (رابط لكل سطر)
                <textarea
                  rows={3}
                  dir="ltr"
                  value={editDraft.gallery}
                  onChange={(event) => setEditDraft({ ...editDraft, gallery: event.target.value })}
                  className="mt-1.5 w-full resize-y rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold sm:col-span-2">
                روابط الفيديوهات (رابط لكل سطر، مثل YouTube)
                <textarea
                  rows={4}
                  dir="ltr"
                  placeholder={'https://www.youtube.com/watch?v=...\nhttps://...'}
                  value={editDraft.videos}
                  onChange={(event) => setEditDraft({ ...editDraft, videos: event.target.value })}
                  className="mt-1.5 w-full resize-y rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold">
                خط العرض
                <input
                  type="number"
                  step="any"
                  value={editDraft.mapLatitude}
                  onChange={(event) => setEditDraft({ ...editDraft, mapLatitude: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
              <label className="text-xs font-bold">
                خط الطول
                <input
                  type="number"
                  step="any"
                  value={editDraft.mapLongitude}
                  onChange={(event) => setEditDraft({ ...editDraft, mapLongitude: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#C8B396] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-[#6B3A1F] dark:bg-[#2A211D]"
                />
              </label>
            </div>

            <footer className="flex justify-end gap-2 border-t border-[#C8B396] p-4 dark:border-[#6B3A1F]">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSaving}
                className="rounded-xl border border-[#C8B396] px-4 py-2.5 text-xs font-bold text-[#8C6F53] disabled:opacity-50 dark:border-[#6B3A1F] dark:text-[#D6C6B1]"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white transition hover:bg-primary-hover disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'جاري الحفظ...' : 'حفظ كل البيانات'}
              </button>
            </footer>
          </form>
        </div>
      )}

      {/* =========================================================
          MOBILE FLOATING INDEX
      ========================================================= */}
      <div className="fixed bottom-20 left-4 z-50 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen((value) => !value)}
          className="flex h-13 w-13 items-center justify-center border-2 border-[#261910] bg-[#FAF6EE] text-[#261910] shadow-xl dark:border-[#C99444] dark:bg-[#1D140E] dark:text-[#C99444]"
          aria-label="فهرس العدد"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {mobileMenuOpen && (
          <div className="absolute bottom-16 left-0 w-64 border-2 border-[#261910] bg-[#FAF6EE] p-2 shadow-2xl dark:border-[#C99444] dark:bg-[#1D140E]">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-right transition hover:bg-[#EAE0CE] dark:hover:bg-[#281C14]"
              >
                <span className="text-xs font-black">
                  {section.number} — {section.label}
                </span>
                {typeof section.count === 'number' && (
                  <span className="text-[10px] font-bold">({section.count})</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* =============================================================
   BROADSHEET SECTION HEADER
============================================================= */

const BroadsheetHeader: React.FC<{
  pageNumber: string;
  category: string;
  title: string;
  count?: number;
}> = ({ pageNumber, category, title, count }) => (
  <div className="border-y-4 border-double border-[#261910] py-4 dark:border-[#C99444]">
    <div className="mb-2 flex items-center justify-between text-xs font-black text-[#9E5A24] dark:text-[#C99444]">
      <span>{category}</span>
      <span>
        {pageNumber} {typeof count === 'number' ? `• (${count} مادة موثقة)` : ''}
      </span>
    </div>
    <h2 className="text-3xl font-black tracking-tight sm:text-5xl">{title}</h2>
  </div>
);

/* =============================================================
   EMPTY STATE
============================================================= */

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="mt-8 border-2 border-dashed border-[#261910]/40 bg-[#FAF6EE]/50 px-6 py-14 text-center dark:border-[#C99444]/40 dark:bg-[#1D140E]/50">
    <Package className="mx-auto mb-3 h-8 w-8 text-[#9E5A24]" />
    <p className="text-sm font-bold text-[#5C4532] dark:text-[#BCA892]">{text}</p>
  </div>
);