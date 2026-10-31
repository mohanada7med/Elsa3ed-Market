import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  Compass,
  Hammer,
  Music2,
  MapPin,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Store,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { MapGovernorateData, Product, Seller } from '../../types';

const ONBOARDING_STEPS = [
  { eyebrow: 'حكاية وه تبدأ من هنا', title: 'نورت ديار وه' },
  { eyebrow: 'من بلد لبلد', title: 'اكتشف محافظات الصعيد' },
  { eyebrow: 'من إيد الصانع', title: 'حرف وحكايات تستاهل' },
  { eyebrow: 'أهلاً بيك في بيتك', title: 'يلا نبدأ الحكاية' },
];

const sceneTransition = {
  initial: { opacity: 0, x: 32, filter: 'blur(6px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, x: -32, filter: 'blur(6px)' },
};

const ProductPreview: React.FC<{
  product: Product;
  onOpen: () => void;
}> = ({ product, onOpen }) => (
  <button
    type="button"
    onClick={onOpen}
    className="group flex min-w-0 items-center gap-3 rounded-2xl border border-primary/15 bg-background/70 p-2.5 text-right transition hover:border-primary/40 hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
  >
    <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-primary/10">
      {product.images?.[0] ? (
        <img
          src={product.images[0]}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <span className="flex h-full items-center justify-center text-primary">
          <ShoppingBag size={22} />
        </span>
      )}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-black text-foreground">{product.title}</span>
      <span className="mt-1 block truncate text-[11px] font-semibold text-foreground-secondary">
        {product.categoryName || product.specifications?.craftsmanship || 'صنعة صعيدية'}
      </span>
      <span className="mt-1 block text-xs font-black text-primary dark:text-primary-hover">
        {product.price.toLocaleString('ar-EG')} ج.م
      </span>
    </span>
    <ArrowLeft size={16} className="shrink-0 text-primary transition-transform group-hover:-translate-x-1" />
  </button>
);

const ArtisanPreview: React.FC<{
  seller: Seller;
  onOpen: () => void;
}> = ({ seller, onOpen }) => (
  <button
    type="button"
    onClick={onOpen}
    className="group flex min-w-0 items-center gap-3 rounded-2xl border border-primary/15 bg-background/70 p-2.5 text-right transition hover:border-primary/40 hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
  >
    <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-primary/10">
      {(seller.avatar || seller.coverImage) ? (
        <img
          src={seller.avatar || seller.coverImage}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <span className="flex h-full items-center justify-center text-primary">
          <Store size={22} />
        </span>
      )}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-black text-foreground">{seller.brandName || seller.name}</span>
      <span className="mt-1 block truncate text-[11px] font-semibold text-foreground-secondary">
        {seller.specialty || 'ورشة صعيدية'} · {seller.governorate}
      </span>
      {seller.verified && (
        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-primary dark:text-primary-hover">
          <Check size={12} />
          ورشة موثقة
        </span>
      )}
    </span>
    <ArrowLeft size={16} className="shrink-0 text-primary transition-transform group-hover:-translate-x-1" />
  </button>
);

export const WahOnboardingExperience: React.FC = () => {
  const {
    showOnboarding,
    dismissOnboarding,
    products,
    sellers,
    isLoading,
    navigateToGovernorate,
    navigateToProduct,
    navigateToSeller,
    setActivePage,
  } = useApp();

  const reduceMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);
  const [governorates, setGovernorates] = useState<MapGovernorateData[]>([]);
  const [isLoadingGovernorates, setIsLoadingGovernorates] = useState(false);
  const [governorateLoadError, setGovernorateLoadError] = useState(false);
  const [doorOpened, setDoorOpened] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const pointerStartX = useRef<number | null>(null);
  const introAudioRef = useRef<HTMLAudioElement | null>(null);

  const loadGovernorates = useCallback(async () => {
    setIsLoadingGovernorates(true);
    setGovernorateLoadError(false);
    try {
      const payload = wahApi.getCachedMapPayload() || await wahApi.getFullMapPayload();
      setGovernorates(payload.governorates);
      setGovernorateLoadError(payload.governorates.length === 0);
    } catch (error) {
      console.error('[WahOnboardingExperience] Failed to load governorates:', error);
      setGovernorateLoadError(true);
    } finally {
      setIsLoadingGovernorates(false);
    }
  }, []);

  useEffect(() => {
    if (!showOnboarding) return;
    setActiveStep(0);
    setDoorOpened(false);
    setAudioError(false);
    void loadGovernorates();
  }, [showOnboarding, loadGovernorates]);

  useEffect(() => {
    if (!showOnboarding) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dismissOnboarding();
      } else if (event.key === 'ArrowLeft') {
        setActiveStep((step) => Math.min(ONBOARDING_STEPS.length - 1, step + 1));
      } else if (event.key === 'ArrowRight') {
        setActiveStep((step) => Math.max(0, step - 1));
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showOnboarding, dismissOnboarding]);

  const featuredProducts = useMemo(
    () =>
      products
        .filter((product) => product.approvalStatus === 'approved')
        .slice(0, 2),
    [products]
  );
  const featuredSellers = useMemo(() => {
    const approved = sellers.filter((seller) => seller.status === 'approved');
    return (approved.length > 0 ? approved : sellers).slice(0, 1);
  }, [sellers]);

  const goToStep = (step: number) => {
    setActiveStep(Math.max(0, Math.min(ONBOARDING_STEPS.length - 1, step)));
  };

  const playIntroAudio = () => {
    setAudioError(false);
    try {
      const audio = introAudioRef.current || new Audio('/audio/site-intro.mp3');
      audio.preload = 'auto';
      audio.volume = 0.45;
      audio.currentTime = 0;
      introAudioRef.current = audio;
      void audio.play().catch((error: unknown) => {
        console.warn('[WahOnboardingExperience] Could not play the intro audio:', error);
        setAudioError(true);
      });
    } catch (error) {
      console.warn('[WahOnboardingExperience] Could not initialize the intro audio:', error);
      setAudioError(true);
    }
  };

  const openDoor = () => {
    if (doorOpened) return;
    setDoorOpened(true);
    playIntroAudio();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = event.clientX;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null) return;
    const delta = event.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(delta) < 60) return;
    goToStep(activeStep + (delta < 0 ? 1 : -1));
  };

  const openGovernorate = (governorate: MapGovernorateData) => {
    dismissOnboarding();
    navigateToGovernorate(governorate.slug || governorate.id);
  };

  const openProduct = (product: Product) => {
    dismissOnboarding();
    navigateToProduct(product.id);
  };

  const openSeller = (seller: Seller) => {
    dismissOnboarding();
    navigateToSeller(seller.id);
  };

  return (
    <AnimatePresence>
      {showOnboarding && <motion.div
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#1B1009]/80 p-2 backdrop-blur-xl sm:p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.3 }}
        role="dialog"
        aria-modal="true"
        aria-label="جولة تعريفية بمنصة وه"
      >
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex h-[min(760px,calc(100dvh-16px))] w-[min(1100px,calc(100vw-16px))] flex-col overflow-hidden rounded-[1.75rem] border border-primary/30 bg-background text-foreground shadow-[0_35px_110px_rgba(0,0,0,0.55)] sm:h-[min(760px,calc(100dvh-40px))] sm:w-[min(1100px,calc(100vw-40px))] sm:rounded-[2.25rem]"
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.055]" style={{ backgroundImage: "url('/pattern/pat2.png')", backgroundSize: '380px auto' }} />
          <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-primary/10 px-4 py-3 sm:px-7 sm:py-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary dark:text-primary-hover">
                <Compass size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-black tracking-[0.16em] text-primary dark:text-primary-hover sm:text-xs">
                  WAH · جولة في ديارنا
                </p>
                <p className="mt-0.5 text-[10px] font-semibold text-foreground-secondary">
                  {activeStep + 1} من {ONBOARDING_STEPS.length}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissOnboarding}
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-primary/15 px-3 text-xs font-bold text-foreground-secondary transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="تخطي الجولة التعريفية"
            >
              <span className="hidden sm:inline">تخطي الجولة</span>
              <X size={16} />
            </button>
          </header>

          <div className="relative z-10 flex min-h-0 flex-1 flex-col" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} style={{ touchAction: 'pan-y' }}>
            <div className="relative flex min-h-0 flex-1 items-stretch overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeStep}
                  variants={sceneTransition}
                  initial={reduceMotion ? false : 'initial'}
                  animate="animate"
                  exit={reduceMotion ? undefined : 'exit'}
                  transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="flex min-h-0 w-full flex-col overflow-y-auto px-4 py-4 sm:px-8 sm:py-6"
                  aria-live="polite"
                >
                  {activeStep === 0 && (
                    <div className="grid min-h-full flex-1 items-center gap-3 sm:grid-cols-[1fr_0.9fr] sm:gap-8">
                      <div className="order-2 space-y-4 text-center sm:order-1 sm:text-right">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[10px] font-black text-primary dark:text-primary-hover">
                          <Sparkles size={13} />
                          {ONBOARDING_STEPS[0].eyebrow}
                        </div>
                        <h1 className="font-heading text-3xl font-black leading-tight text-espresso dark:text-cream sm:text-5xl">
                          الباب مفتوح
                          <br />
                          <span className="text-primary dark:text-primary-hover">يا أهل وه</span>
                        </h1>
                        <p className="mx-auto max-w-md text-sm font-semibold leading-7 text-foreground-secondary sm:mx-0 sm:text-base">
                          عم وه مستنيك.. افتح باب الحكاية وتعالى نلف سوا بين بلاد الصعيد وصنّاعه.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-primary dark:text-primary-hover sm:justify-start">
                          <span className="h-px w-8 bg-primary/40" />
                          تراث عايش من إيد لإيد
                          <span className="h-px w-8 bg-primary/40" />
                        </div>
                      </div>

                      <div className="order-1 flex min-h-[250px] items-center justify-center sm:order-2 sm:min-h-[380px]">
                        <div className="relative h-[260px] w-full max-w-[360px] sm:h-[360px]" style={{ perspective: '1200px' }}>
                          <div className="absolute inset-3 rounded-[48%_48%_20px_20px] border-[7px] border-[#9B642F] bg-gradient-to-b from-[#F8EBD7] via-[#DAB987] to-[#6B3A1F] shadow-[inset_0_0_0_4px_rgba(255,255,255,0.25),0_24px_50px_rgba(59,30,14,0.25)] dark:border-[#C99444] dark:from-[#4A2715] dark:via-[#3B1E0E] dark:to-[#1B1009]">
                            <div className="absolute inset-x-0 bottom-0 top-[17%] overflow-hidden rounded-[47%_47%_12px_12px] bg-gradient-to-b from-[#fff5df] via-[#efd4a7] to-[#C99444]/50 dark:from-[#2b1a10] dark:via-[#3B1E0E] dark:to-[#6B3A1F]/70">
                              <motion.img
                                src="/mascot/welcoming.png"
                                alt="عم وه بيرحب بيك"
                                className="absolute bottom-0 left-1/2 h-[96%] w-auto -translate-x-1/2 object-contain drop-shadow-[0_12px_18px_rgba(59,30,14,0.3)]"
                                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: reduceMotion ? 0 : 0.25, duration: reduceMotion ? 0 : 0.5 }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={openDoor}
                              disabled={doorOpened}
                              aria-label={doorOpened ? 'الباب مفتوح' : 'افتح باب وه واسمع أغنية وه'}
                              className="absolute inset-x-3 bottom-3 top-[17%] overflow-hidden rounded-[47%_47%_12px_12px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/70"
                            >
                              <motion.span
                                className="absolute inset-y-0 left-0 w-1/2 origin-left border-2 border-[#D6AA72] bg-gradient-to-br from-[#8B5528] via-[#6B3A1F] to-[#3B1E0E] shadow-[inset_-8px_0_12px_rgba(0,0,0,0.2)]"
                                animate={{ rotateY: doorOpened ? -78 : 0 }}
                                transition={{ duration: reduceMotion ? 0 : 1.15, ease: [0.22, 1, 0.36, 1] }}
                                style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                              >
                                <span className="absolute inset-2 rounded-t-[90%] border border-[#E0C79B]/50" />
                                <span className="absolute inset-x-3 top-[25%] bottom-[10%] rounded-t-[48%] border-2 border-[#D6AA72]/70" />
                                <span className="absolute right-2 top-1/2 h-3 w-3 rounded-full border border-[#F8EBD7] bg-[#C99444] shadow" />
                              </motion.span>
                              <motion.span
                                className="absolute inset-y-0 right-0 w-1/2 origin-right border-2 border-[#D6AA72] bg-gradient-to-bl from-[#8B5528] via-[#6B3A1F] to-[#3B1E0E] shadow-[inset_8px_0_12px_rgba(0,0,0,0.2)]"
                                animate={{ rotateY: doorOpened ? 78 : 0 }}
                                transition={{ duration: reduceMotion ? 0 : 1.15, ease: [0.22, 1, 0.36, 1] }}
                                style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                              >
                                <span className="absolute inset-2 rounded-t-[90%] border border-[#E0C79B]/50" />
                                <span className="absolute inset-x-3 top-[25%] bottom-[10%] rounded-t-[48%] border-2 border-[#D6AA72]/70" />
                                <span className="absolute left-2 top-1/2 h-3 w-3 rounded-full border border-[#F8EBD7] bg-[#C99444] shadow" />
                              </motion.span>
                            </button>
                            {!doorOpened && (
                              <motion.span
                                className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-[#F8EBD7]/60 bg-[#C99444] text-white shadow-lg"
                                animate={reduceMotion ? undefined : { scale: [1, 1.12, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <ArrowLeft size={18} />
                              </motion.span>
                            )}
                          </div>
                          <motion.div
                            className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-primary/15 bg-surface/90 px-3 py-1 text-[10px] font-black text-primary shadow-md dark:text-primary-hover"
                            animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            {doorOpened ? <MapPin size={12} /> : <Music2 size={12} />}
                            {doorOpened ? 'أهلاً بيك في وه' : 'افتح الباب واسمع أغنية وه'}
                          </motion.div>
                        </div>
                      </div>
                      {audioError && (
                        <div role="status" className="flex items-center justify-center gap-2 text-center text-xs font-semibold text-primary">
                          <span>تعذر تشغيل الأغنية.</span>
                          <button
                            type="button"
                            onClick={playIntroAudio}
                            className="underline underline-offset-2"
                          >
                            حاول تاني
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeStep === 1 && (
                    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center">
                      <div className="mb-5 text-center sm:mb-7">
                        <span className="inline-flex items-center gap-2 text-xs font-black text-primary dark:text-primary-hover">
                          <MapPin size={15} />
                          {ONBOARDING_STEPS[1].eyebrow}
                        </span>
                        <h2 className="mt-2 font-heading text-2xl font-black sm:text-4xl">{ONBOARDING_STEPS[1].title}</h2>
                        <p className="mt-2 text-xs font-semibold text-foreground-secondary sm:text-sm">
                          حكاية كل بلد من أهلها.. اختار محافظة وابدأ رحلتك.
                        </p>
                      </div>
                      {isLoadingGovernorates ? (
                        <div className="flex min-h-40 flex-1 items-center justify-center gap-3 text-sm font-bold text-foreground-secondary">
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
                          بنجهز خريطة محافظات الصعيد...
                        </div>
                      ) : governorates.length > 0 ? (
                        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                          {governorates.slice(0, 4).map((governorate, index) => (
                            <motion.button
                              key={governorate.id}
                              type="button"
                              onClick={() => openGovernorate(governorate)}
                              whileHover={reduceMotion ? undefined : { y: -5 }}
                              whileTap={{ scale: 0.98 }}
                              className="group relative flex min-h-36 flex-col justify-end overflow-hidden rounded-2xl border border-primary/20 bg-espresso text-white shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:min-h-52 sm:rounded-3xl"
                            >
                              {governorate.coverImage && (
                                <img
                                  src={governorate.coverImage}
                                  alt=""
                                  loading={index < 2 ? 'eager' : 'lazy'}
                                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                />
                              )}
                              <span className="absolute inset-0 bg-gradient-to-t from-[#1B1009]/95 via-[#1B1009]/35 to-transparent" />
                              <span className="relative p-3 text-right sm:p-4">
                                <span className="mb-1 block text-[9px] font-bold text-white/65">
                                  {governorate.region || 'بلاد الصعيد'}
                                </span>
                                <span className="block truncate text-base font-black sm:text-xl">{governorate.name}</span>
                                <span className="mt-1 block truncate text-[10px] font-semibold text-white/75">
                                  {governorate.nickname || governorate.topCraft || governorate.famousFor?.[0] || 'شوف الحكاية'}
                                </span>
                              </span>
                              <span className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/25 text-xs font-black text-white backdrop-blur-md">
                                0{index + 1}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-40 flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/25 p-5 text-center">
                          <MapPin className="text-primary" size={24} />
                          <p className="text-sm font-bold text-foreground-secondary">
                            {governorateLoadError ? 'بيانات المحافظات مش متاحة دلوقتي.' : 'لسه مفيش محافظات متاحة.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => void loadGovernorates()}
                            disabled={isLoadingGovernorates}
                            className="min-h-11 rounded-full bg-primary px-5 text-xs font-black text-white disabled:opacity-50"
                          >
                            حاول تاني
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center">
                      <div className="mb-5 text-center sm:mb-7">
                        <span className="inline-flex items-center gap-2 text-xs font-black text-primary dark:text-primary-hover">
                          <Hammer size={15} />
                          {ONBOARDING_STEPS[2].eyebrow}
                        </span>
                        <h2 className="mt-2 font-heading text-2xl font-black sm:text-4xl">{ONBOARDING_STEPS[2].title}</h2>
                        <p className="mt-2 text-xs font-semibold text-foreground-secondary sm:text-sm">
                          شوف شغل الورش ومنتجاتها الحقيقية على سوق وه.
                        </p>
                      </div>
                      {isLoading && products.length === 0 && sellers.length === 0 ? (
                        <div className="flex min-h-40 flex-1 items-center justify-center gap-3 text-sm font-bold text-foreground-secondary">
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
                          بنفتح أبواب الورش...
                        </div>
                      ) : featuredProducts.length || featuredSellers.length ? (
                        <div className="grid flex-1 content-center gap-4 sm:grid-cols-2 sm:gap-5">
                          <div className="space-y-2.5">
                            <h3 className="flex items-center gap-2 text-xs font-black text-foreground">
                              <ShoppingBag size={15} className="text-primary" />
                              من سوق وه
                            </h3>
                            {featuredProducts.length ? featuredProducts.map((product) => (
                              <ProductPreview
                                key={product.id}
                                product={product}
                                onOpen={() => openProduct(product)}
                              />
                            )) : (
                              <p className="rounded-2xl border border-dashed border-primary/20 p-4 text-xs font-semibold text-foreground-secondary">
                                مفيش منتجات معتمدة ظاهرة دلوقتي.
                              </p>
                            )}
                          </div>
                          <div className="space-y-2.5">
                            <h3 className="flex items-center gap-2 text-xs font-black text-foreground">
                              <Store size={15} className="text-primary" />
                              أهل الصنعة
                            </h3>
                            {featuredSellers.length ? featuredSellers.map((seller) => (
                              <ArtisanPreview
                                key={seller.id}
                                seller={seller}
                                onOpen={() => openSeller(seller)}
                              />
                            )) : (
                              <p className="rounded-2xl border border-dashed border-primary/20 p-4 text-xs font-semibold text-foreground-secondary">
                                الورش هتظهر هنا أول ما تتاح.
                              </p>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                dismissOnboarding();
                                setActivePage('sellers');
                              }}
                              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary/25 px-4 text-xs font-black text-primary transition hover:bg-primary/5 dark:text-primary-hover"
                            >
                              استكشف كل الورش
                              <ArrowLeft size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex min-h-40 flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/25 p-5 text-center">
                          <Hammer className="text-primary" size={24} />
                          <p className="text-sm font-bold text-foreground-secondary">مفيش منتجات أو ورش متاحة للعرض دلوقتي.</p>
                          <button
                            type="button"
                            onClick={() => {
                              dismissOnboarding();
                              setActivePage('products');
                            }}
                            className="min-h-11 rounded-full bg-primary px-5 text-xs font-black text-white"
                          >
                            افتح سوق وه
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeStep === 3 && (
                    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center py-4 text-center">
                      <motion.div
                        initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: reduceMotion ? 0 : 0.55 }}
                        className="relative mb-3 flex h-40 w-40 items-center justify-center sm:mb-5 sm:h-56 sm:w-56"
                      >
                        <span className="absolute inset-2 rounded-full bg-primary/10 blur-xl" />
                        <img
                          src="/mascot/welcoming.png"
                          alt="عم وه بيرحب بيك في ديار وه"
                          className="relative h-full w-auto object-contain drop-shadow-[0_20px_24px_rgba(59,30,14,0.2)]"
                        />
                        <span className="absolute right-2 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                          <Check size={18} />
                        </span>
                      </motion.div>
                      <span className="inline-flex items-center gap-2 text-xs font-black text-primary dark:text-primary-hover">
                        <Sparkles size={15} />
                        {ONBOARDING_STEPS[3].eyebrow}
                      </span>
                      <h2 className="mt-2 font-heading text-3xl font-black sm:text-5xl">
                        {ONBOARDING_STEPS[3].title}
                      </h2>
                      <p className="mt-3 max-w-lg text-sm font-semibold leading-7 text-foreground-secondary sm:text-base">
                        بلدنا مليانة ناس مبدعة وحكايات جميلة.. خد راحتك، لفّ في وه واكتشف اللي بتحبه.
                      </p>
                      <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={dismissOnboarding}
                          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-black text-white shadow-lg transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                          يلا نبدأ
                          <ArrowLeft size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            dismissOnboarding();
                            setActivePage('products');
                          }}
                          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-primary/25 px-6 text-sm font-black text-primary transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-primary-hover"
                        >
                          <ShoppingBag size={16} />
                          اكتشف سوق وه
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-primary/10 bg-background/80 px-4 py-3 sm:px-7 sm:py-4">
              <button
                type="button"
                onClick={() => goToStep(activeStep - 1)}
                disabled={activeStep === 0}
                className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-xs font-bold text-foreground-secondary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-35 sm:min-w-24"
                aria-label="الخطوة السابقة"
              >
                <ArrowRight size={16} />
                <span className="hidden sm:inline">السابق</span>
              </button>
              <div className="flex items-center gap-2" role="group" aria-label="اختيار مرحلة الجولة">
                {ONBOARDING_STEPS.map((step, index) => (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => goToStep(index)}
                    aria-label={`الانتقال إلى المرحلة ${index + 1}: ${step.title}`}
                    aria-current={activeStep === index ? 'step' : undefined}
                    className={`h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      activeStep === index ? 'w-8 bg-primary' : 'w-2.5 bg-primary/25 hover:bg-primary/50'
                    }`}
                  />
                ))}
              </div>
              {activeStep < ONBOARDING_STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => goToStep(activeStep + 1)}
                  aria-label="الخطوة التالية"
                  className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-black text-white shadow-md transition hover:bg-primary-hover sm:min-w-24"
                >
                  <span className="hidden sm:inline">التالي</span>
                  <ChevronLeft size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep(0);
                    setDoorOpened(false);
                    setAudioError(false);
                  }}
                  className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-xs font-bold text-primary transition hover:bg-primary/5 dark:text-primary-hover sm:min-w-24"
                  aria-label="إعادة الجولة"
                >
                  <RotateCcw size={15} />
                  <span className="hidden sm:inline">إعادة الجولة</span>
                </button>
              )}
            </footer>
          </div>
        </motion.section>
      </motion.div>}
    </AnimatePresence>
  );
};

export default WahOnboardingExperience;