/*  src/components/pages/FoodDetailPage.tsx  (نسخة 7 — كتاب الوصفات)  */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { UpperEgyptFood } from '../../types';
import { ArrowLeft, ArrowRight, Check, Clock, Edit3, MapPin, RotateCcw, Share2, Utensils } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { EventImageLightboxModal } from '../common/EventImageLightboxModal';

const fallbackCover = '/mascot/welcome.png';
const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- الثيم: تلقائي من إعدادات النظام (من غير زرار) ----------
   - الافتراضي لايت، ولو الجهاز على الداكن → داكن (prefers-color-scheme).
   - لو تطبيقك بيحط class="dark" / "light" على <html> فهو اللي بيحسم.
   الدرجات تقريبية لألوانك: espresso-900 ≈ #1A1210 ، espresso-800 ≈ #2A1D18 ، cream ≈ #F5EDE0
   لو قيمك مختلفة في tailwind.config بدّلها هنا فقط. */
const DARK_VARS = `
  --bg:#1A1210; --surface:#2A1D18; --ink:#F5EDE0;
  --muted:rgba(245,237,224,.7); --line:rgba(245,237,224,.16);
  --gold:#C99444; --goldtext:#C99444; --ongold:#1A1210;
  --cover:#0D0908; --gutter:rgba(0,0,0,.38); --photo:#F5EDE0; color-scheme:dark;`;
const themeCss = `
.fd-root{
  --bg:#F5EDE0; --surface:#FBF7EE; --ink:#2A1D18;
  --muted:rgba(42,29,24,.7); --line:rgba(42,29,24,.16);
  --gold:#C99444; --goldtext:#8A5A14; --ongold:#1A1210;
  --cover:#4A2E22; --gutter:rgba(42,29,24,.14); --photo:#FFFDF8; color-scheme:light;
}
@media (prefers-color-scheme: dark){ :root:not(.light) .fd-root{${DARK_VARS}} }
:root.dark .fd-root{${DARK_VARS}}

@keyframes fd-spin{ to{ transform:rotate(360deg); } }
.fd-noscroll{ scrollbar-width:none; }
.fd-noscroll::-webkit-scrollbar{ display:none; }
@media (min-width:1024px){
  .fd-page-r{ background-image:linear-gradient(to left,transparent 86%,var(--gutter)); }
  .fd-page-l{ background-image:linear-gradient(to right,transparent 86%,var(--gutter)); }
}
`;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]';

const ribbonShape = 'polygon(0 0, 100% 0, 100% 100%, 50% 84%, 0 100%)';
const toAr = (n: number) => n.toLocaleString('ar-EG');

type SpreadId = 'intro' | 'recipe' | 'photos';

export const FoodDetailPage: React.FC = () => {
  const { selectedFoodSlug, navigateToGovernorate, setActivePage, addToast, currentUser, currentRole } = useApp();
  const reduce = useReducedMotion();
  const isAdmin = currentRole === 'admin' || currentUser?.role === 'admin';
  const bookRef = useRef<HTMLDivElement>(null);

  const [food, setFood] = useState<UpperEgyptFood | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [doneSteps, setDoneSteps] = useState<Record<number, boolean>>({});
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  /* ---------- Slug ---------- */
  const slug =
    selectedFoodSlug ??
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/food/')
      ? decodeURIComponent(window.location.pathname.split('/')[2])
      : undefined) ??
    'saidi-fayesh';

  /* ---------- Fetch ---------- */
  useEffect(() => {
    let mounted = true;
    const fetchFood = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getFoodBySlug(slug);
        if (mounted) setFood(data || null);
      } catch (e) {
        console.warn('Could not load food details:', e);
        if (mounted) setFood(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchFood();
    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    setCheckedIngredients({});
    setDoneSteps({});
    setSpreadIndex(0);
  }, [slug]);

  /* ---------- Share ---------- */
  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/food/${encodeURIComponent(slug)}`;
    try {
      if (navigator.share && typeof navigator.share === 'function') {
        await navigator.share({ title: food?.title ?? 'وصفة صعيدية', text: food?.description ?? '', url });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        addToast('تم نسخ الرابط', 'تم نسخ رابط الوصفة بنجاح', 'success');
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      console.warn('Could not share food:', e);
    }
  };

  /* ---------- Data ---------- */
  const ingredientsList = food?.ingredients || [];
  const checkedCount = Object.values(checkedIngredients).filter(Boolean).length;
  const toggleIngredient = (idx: number) => setCheckedIngredients(p => ({ ...p, [idx]: !p[idx] }));

  const prepSteps = useMemo(() => {
    const raw = food?.preparationMethod || food?.preparation || '';
    if (!raw) return [];
    const lines = raw
      .split(/\n+/)
      .map(line => line.replace(/^[\d\-•*.]+\s*/, '').trim())
      .filter(Boolean);
    return lines.length > 1 ? lines : [raw];
  }, [food?.preparationMethod, food?.preparation]);

  const doneCount = Object.values(doneSteps).filter(Boolean).length;
  const toggleStep = (idx: number) => setDoneSteps(p => ({ ...p, [idx]: !p[idx] }));

  const allGalleryImages = useMemo(() => {
    const list: string[] = [];
    const cover = food?.coverImage?.trim();
    if (cover) list.push(cover);
    food?.gallery?.forEach(img => {
      const t = img?.trim();
      if (t && !list.includes(t)) list.push(t);
    });
    return list;
  }, [food?.coverImage, food?.gallery]);

  const story = food?.originStory || food?.story;

  const spreads = useMemo(() => {
    const l: { id: SpreadId; label: string }[] = [{ id: 'intro', label: 'الحكاية' }];
    if (ingredientsList.length > 0 || prepSteps.length > 0) l.push({ id: 'recipe', label: 'الوصفة' });
    if (allGalleryImages.length > 1) l.push({ id: 'photos', label: 'الصور' });
    return l;
  }, [ingredientsList.length, prepSteps.length, allGalleryImages.length]);

  const safeIndex = Math.min(spreadIndex, spreads.length - 1);
  const current = spreads[safeIndex];

  const goSpread = (i: number) => {
    const next = Math.max(0, Math.min(spreads.length - 1, i));
    setSpreadIndex(next);
    const rect = bookRef.current?.getBoundingClientRect();
    if (rect && rect.top < 70) {
      bookRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  };

  const openLightbox = (index = 0) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const setFallback = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    if (!el.src.endsWith(fallbackCover)) el.src = fallbackCover;
  };

  const shell = 'fd-root min-h-screen w-full bg-[var(--bg)] text-[var(--ink)] transition-colors duration-300';

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <div dir="rtl" className={`${shell} flex items-center justify-center`}>
        <style>{themeCss}</style>
        <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
          <motion.div
            animate={reduce ? undefined : { rotateY: [0, 180, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Utensils size={36} className="text-[var(--goldtext)]" />
          </motion.div>
          <p className="text-sm font-bold text-[var(--goldtext)]">جاري فتح كتاب الوصفات…</p>
        </div>
      </div>
    );
  }

  /* ---------- Not found ---------- */
  if (!food) {
    return (
      <div dir="rtl" className={`${shell} flex items-center justify-center p-6`}>
        <style>{themeCss}</style>
        <div className="max-w-md text-center">
          <Utensils size={30} className="mx-auto text-[var(--goldtext)]" />
          <h1 className="mt-5 text-3xl font-black">الأكلة دي مش موجودة</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            مش لاقيين بيانات الوصفة دي. ممكن تكون اتنقلت أو لسه متوثقتش.
          </p>
          <button
            type="button"
            onClick={() => setActivePage('food')}
            className={`mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-black text-[var(--ongold)] ${focusRing}`}
          >
            <ArrowRight size={16} />
            <span>ارجع لقائمة الأكلات</span>
          </button>
        </div>
      </div>
    );
  }

  const foodTitle = food.title || food.name || 'أكلة صعيدية';
  const glassBtn = `inline-flex h-10 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--bg)]/80 px-4 text-xs font-bold backdrop-blur-md transition-colors hover:bg-[var(--surface)] ${focusRing}`;
  const resetBtn = `inline-flex items-center gap-1.5 text-sm font-bold text-[var(--goldtext)] underline-offset-4 hover:underline ${focusRing}`;
  const pageBase = 'relative bg-[var(--surface)] p-6 sm:p-10 lg:min-h-[600px]';
  const pageTitle = 'text-2xl font-black sm:text-3xl';

  const pageNo = (n: number) => (
    <span aria-hidden className="absolute inset-x-0 bottom-4 text-center text-sm font-bold text-[var(--muted)]">
      {toAr(n)}
    </span>
  );

  /* صورة ملزوقة بشريط */
  const TapedPhoto = (img: string, i: number, widthClass = 'w-full') => {
    const tilt = [-2.5, 2, -1.5, 3, -3, 1.5][i % 6];
    return (
      <motion.button
        key={i}
        type="button"
        onClick={() => openLightbox(i)}
        aria-label={`افتح الصورة ${i + 1}`}
        initial={false}
        animate={{ rotate: tilt }}
        whileHover={reduce ? undefined : { rotate: 0, scale: 1.04, zIndex: 10 }}
        transition={{ duration: 0.3 }}
        className={`relative bg-[var(--photo)] p-2 pb-8 shadow-lg ${widthClass} ${focusRing}`}
      >
        <span
          aria-hidden
          className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 -rotate-3 bg-[var(--gold)]/55"
        />
        <img src={img} alt={`${foodTitle} ${i + 1}`} onError={setFallback} className="aspect-square w-full object-cover" />
      </motion.button>
    );
  };

  /* ---------- محتوى الصفحات ---------- */
  const introRight = (
    <div className={`${pageBase} fd-page-r`}>
      <h1 className="text-4xl font-black leading-[1.25] sm:text-5xl">{foodTitle}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold">
        <span className="rounded-full border border-[var(--gold)] px-3.5 py-1 text-[var(--goldtext)]">
          {food.category || food.occasionOrTradition || 'أكلة صعيدية أصيلة'}
        </span>
        {food.governorateName && (
          <button
            type="button"
            onClick={() => food.governorateId && navigateToGovernorate?.(food.governorateId)}
            className={`inline-flex items-center gap-1.5 underline-offset-4 hover:underline ${focusRing}`}
          >
            <MapPin size={14} className="text-[var(--goldtext)]" />
            <span>{food.governorateName}</span>
          </button>
        )}
      </div>

      <div className="mx-auto mt-8 max-w-xs">
        <motion.button
          type="button"
          onClick={() => openLightbox(0)}
          aria-label="كبّر صورة الأكلة"
          initial={false}
          animate={{ rotate: -2 }}
          whileHover={reduce ? undefined : { rotate: 0, scale: 1.03 }}
          transition={{ duration: 0.3 }}
          className={`relative block w-full bg-[var(--photo)] p-2.5 pb-10 shadow-xl ${focusRing}`}
        >
          <span aria-hidden className="absolute -top-3 left-6 h-6 w-16 -rotate-6 bg-[var(--gold)]/55" />
          <span aria-hidden className="absolute -top-3 right-6 h-6 w-16 rotate-6 bg-[var(--gold)]/55" />
          <img
            src={food.coverImage ?? fallbackCover}
            alt={foodTitle}
            onError={setFallback}
            className="aspect-[4/5] w-full object-cover"
          />
        </motion.button>
      </div>

      {food.description && <p className="mt-8 text-lg leading-9 text-[var(--muted)]">{food.description}</p>}
      <div className="h-8" />
      {pageNo(safeIndex * 2 + 1)}
    </div>
  );

  const introLeft = (
    <div className={`${pageBase} fd-page-l`}>
      {story && (
        <>
          <h2 className={pageTitle}>حكاية الأكلة</h2>
          <p className="mt-5 text-lg leading-[2.1] sm:text-xl sm:leading-[2.1]">{story}</p>
        </>
      )}

      <div className={`${story ? 'mt-10' : ''} rounded-2xl border-2 border-dashed border-[var(--line)] p-5 sm:p-6`}>
        <h3 className="text-lg font-black">على السريع</h3>
        <dl className="mt-3">
          <div className="flex items-center justify-between gap-3 border-b border-dashed border-[var(--line)] py-3">
            <dt className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
              <Clock size={14} className="text-[var(--goldtext)]" />
              وقت التحضير
            </dt>
            <dd className="text-sm font-black">{food.prepTime ?? 'غير محدد'}</dd>
          </div>
          {ingredientsList.length > 0 && (
            <div className="flex items-center justify-between gap-3 border-b border-dashed border-[var(--line)] py-3">
              <dt className="text-sm text-[var(--muted)]">المكوّنات</dt>
              <dd className="text-sm font-black">{ingredientsList.length} مكوّن</dd>
            </div>
          )}
          {prepSteps.length > 1 && (
            <div className="flex items-center justify-between gap-3 border-b border-dashed border-[var(--line)] py-3">
              <dt className="text-sm text-[var(--muted)]">الخطوات</dt>
              <dd className="text-sm font-black">{prepSteps.length} خطوة</dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 py-3">
            <dt className="text-sm text-[var(--muted)]">المنشأ</dt>
            <dd className="text-sm font-black">{food.governorateName ?? 'الصعيد'}</dd>
          </div>
        </dl>
      </div>

      {(ingredientsList.length > 0 || prepSteps.length > 0) && (
        <button
          type="button"
          onClick={() => goSpread(spreads.findIndex(s => s.id === 'recipe'))}
          className={`mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-black text-[var(--ongold)] transition-opacity hover:opacity-90 ${focusRing}`}
        >
          <span>اقلب للوصفة</span>
          <ArrowLeft size={16} />
        </button>
      )}
      <div className="h-8" />
      {pageNo(safeIndex * 2 + 2)}
    </div>
  );

  const ingredientsPage = (extra = '') => (
    <div className={`${pageBase} fd-page-r ${extra}`}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className={pageTitle}>المكوّنات</h2>
          <p className="mt-1 text-sm text-[var(--muted)]" aria-live="polite">
            جهّزت {checkedCount} من {ingredientsList.length}
          </p>
        </div>
        {checkedCount > 0 && (
          <button type="button" onClick={() => setCheckedIngredients({})} className={resetBtn}>
            <RotateCcw size={13} />
            <span>ابدأ من جديد</span>
          </button>
        )}
      </div>

      {(food?.sourceName || food?.sourceUrl) && (
        <aside className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-sm leading-6 text-[var(--muted)]" role="note">
          {food.verificationStatus === 'unverified' ? (
            <p className="font-bold text-[var(--ink)]">
              تنبيه: هذه مكونات وصفة منشورة قريبة، وليست توثيقاً مؤكداً للوصفة المحلية بهذا الاسم.
            </p>
          ) : (
            <p className="font-bold text-[var(--ink)]">مصدر المكونات</p>
          )}
          {food.sourceUrl ? (
            <a
              href={food.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block underline decoration-[var(--gold)] underline-offset-2"
            >
              {food.sourceName || food.sourceUrl}
            </a>
          ) : food.sourceName ? (
            <p>{food.sourceName}</p>
          ) : null}
        </aside>
      )}

      <ul className="mt-5 border-t border-[var(--line)]">
        {ingredientsList.map((ing, idx) => {
          const isChecked = !!checkedIngredients[idx];
          return (
            <li key={idx} className="border-b border-[var(--line)]">
              <button
                type="button"
                onClick={() => toggleIngredient(idx)}
                aria-pressed={isChecked}
                className={`flex min-h-[3.25rem] w-full items-center gap-3.5 py-2 text-right ${focusRing}`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isChecked ? 'border-[var(--gold)] bg-[var(--gold)] text-[var(--ongold)]' : 'border-[var(--line)]'
                  }`}
                >
                  {isChecked && (
                    <motion.span
                      initial={reduce ? false : { scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    >
                      <Check size={14} strokeWidth={3} />
                    </motion.span>
                  )}
                </span>
                <span
                  className="text-base font-bold leading-7 transition-opacity"
                  style={{ opacity: isChecked ? 0.45 : 1, textDecoration: isChecked ? 'line-through' : 'none' }}
                >
                  {ing}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="h-8" />
      {pageNo(safeIndex * 2 + 1)}
    </div>
  );

  const stepsPage = (extra = '') => (
    <div className={`${pageBase} fd-page-l ${extra}`}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className={pageTitle}>طريقة التحضير</h2>
          {prepSteps.length > 1 && (
            <p className="mt-1 text-sm text-[var(--muted)]" aria-live="polite">
              خلّصت {doneCount} من {prepSteps.length} خطوة
            </p>
          )}
        </div>
        {doneCount > 0 && (
          <button type="button" onClick={() => setDoneSteps({})} className={resetBtn}>
            <RotateCcw size={13} />
            <span>ابدأ من جديد</span>
          </button>
        )}
      </div>

      {prepSteps.length > 1 ? (
        <ol className="mt-5 border-t border-[var(--line)]">
          {prepSteps.map((step, idx) => {
            const done = !!doneSteps[idx];
            return (
              <li key={idx} className="border-b border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => toggleStep(idx)}
                  aria-pressed={done}
                  className={`flex w-full items-start gap-4 py-5 text-right ${focusRing}`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-base font-black transition-colors ${
                      done
                        ? 'border-[var(--gold)] bg-[var(--gold)] text-[var(--ongold)]'
                        : 'border-[var(--goldtext)] text-[var(--goldtext)]'
                    }`}
                  >
                    {done ? <Check size={17} strokeWidth={3} /> : idx + 1}
                  </span>
                  <span className="flex-1 pt-0.5 text-lg leading-9 transition-opacity" style={{ opacity: done ? 0.45 : 1 }}>
                    {step}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-6 whitespace-pre-line text-lg leading-9">{prepSteps[0]}</p>
      )}

      {prepSteps.length > 1 && doneCount === prepSteps.length && (
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center text-3xl font-black text-[var(--goldtext)]"
        >
          بالهنا والشفا
        </motion.p>
      )}
      <div className="h-8" />
      {pageNo(safeIndex * 2 + 2)}
    </div>
  );

  const half = Math.ceil(allGalleryImages.length / 2);
  const photosRight = (
    <div className={`${pageBase} fd-page-r`}>
      <h2 className={pageTitle}>صور الأكلة</h2>
      <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8">
        {allGalleryImages.slice(0, half).map((img, i) => TapedPhoto(img, i))}
      </div>
      <div className="h-8" />
      {pageNo(safeIndex * 2 + 1)}
    </div>
  );
  const photosLeft = (
    <div className={`${pageBase} fd-page-l`}>
      <div className="hidden h-[2.6rem] lg:block" aria-hidden />
      <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8">
        {allGalleryImages.slice(half).map((img, i) => TapedPhoto(img, half + i))}
      </div>
      <div className="h-8" />
      {pageNo(safeIndex * 2 + 2)}
    </div>
  );

  const renderSpread = () => {
    if (current.id === 'intro') {
      return (
        <>
          {introRight}
          {introLeft}
        </>
      );
    }
    if (current.id === 'recipe') {
      const hasI = ingredientsList.length > 0;
      const hasS = prepSteps.length > 0;
      if (hasI && hasS) {
        return (
          <>
            {ingredientsPage()}
            {stepsPage()}
          </>
        );
      }
      return <div className="lg:col-span-2">{hasI ? ingredientsPage() : stepsPage()}</div>;
    }
    return (
      <>
        {photosRight}
        {photosLeft}
      </>
    );
  };

  return (
    <main dir="rtl" className={`${shell} overflow-x-hidden`}>
      <style>{themeCss}</style>

      {/* ===== الشريط العلوي ===== */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <button type="button" onClick={() => setActivePage('food')} className={glassBtn}>
            <ArrowRight size={15} />
            <span>كل الأكلات</span>
          </button>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={() => addToast('ميزة التعديل غير مفعلة الآن', '', 'info')}
                className={glassBtn}
              >
                <Edit3 size={14} />
                <span className="hidden sm:inline">تعديل</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleShare}
              className={`inline-flex h-10 items-center gap-2 rounded-full bg-[var(--gold)] px-5 text-xs font-black text-[var(--ongold)] transition-opacity hover:opacity-90 ${focusRing}`}
            >
              <Share2 size={14} />
              <span>شارك</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== الكتاب ===== */}
      <section ref={bookRef} className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-20 pt-8 sm:px-8">
        {/* شرائط العلامات */}
        {spreads.length > 1 && (
          <div role="tablist" aria-label="أقسام الكتاب" className="relative z-10 -mb-4 flex gap-3 px-6 sm:px-10">
            {spreads.map((s, i) => {
              const active = i === safeIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => goSpread(i)}
                  className={`w-24 pt-2.5 text-sm font-black transition-all duration-300 ${focusRing} ${
                    active
                      ? 'h-[4.5rem] bg-[var(--gold)] text-[var(--ongold)]'
                      : 'h-14 bg-[var(--gold)]/45 text-[var(--ink)] hover:h-16'
                  }`}
                  style={{ clipPath: ribbonShape }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        )}

        {/* الغلاف + الصفحات */}
        <div
          className="rounded-[1.5rem] bg-[var(--cover)] p-2 ring-1 ring-[var(--gold)]/50 sm:p-3"
          style={{ boxShadow: '0 2px 0 rgba(0,0,0,.25), 0 8px 0 -3px rgba(0,0,0,.18), 0 24px 40px -12px rgba(0,0,0,.35)' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, rotateY: -55 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, rotateY: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, rotateY: 55 }}
              transition={{ duration: 0.4, ease: EASE }}
              style={{ transformPerspective: 1800 }}
              className="grid grid-cols-1 overflow-hidden rounded-xl lg:grid-cols-2"
            >
              {renderSpread()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* تقليب الصفحات */}
        {spreads.length > 1 && (
          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => goSpread(safeIndex - 1)}
              disabled={safeIndex === 0}
              className={`inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-5 py-3 text-sm font-bold transition-colors hover:border-[var(--gold)] disabled:opacity-30 disabled:hover:border-[var(--line)] ${focusRing}`}
            >
              <ArrowRight size={16} />
              <span>الصفحة اللي فاتت</span>
            </button>

            <span className="text-sm font-bold text-[var(--muted)]" aria-live="polite">
              صفحة {toAr(safeIndex * 2 + 1)} – {toAr(safeIndex * 2 + 2)}
            </span>

            <button
              type="button"
              onClick={() => goSpread(safeIndex + 1)}
              disabled={safeIndex === spreads.length - 1}
              className={`inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-black text-[var(--ongold)] transition-opacity hover:opacity-90 disabled:opacity-30 ${focusRing}`}
            >
              <span>الصفحة الجاية</span>
              <ArrowLeft size={16} />
            </button>
          </div>
        )}
      </section>

      <EventImageLightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={allGalleryImages}
        initialIndex={lightboxIndex}
        coverImage={food?.coverImage}
        title={foodTitle}
      />
    </main>
  );
};

export default FoodDetailPage;