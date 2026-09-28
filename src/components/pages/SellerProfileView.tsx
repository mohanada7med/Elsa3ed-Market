import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../products/ProductCard';
import {
  Store,
  MapPin,
  Star,
  CheckCircle2,
  ChevronRight,
  Phone,
  Calendar,
  Sparkles,
  Award,
  Share2,
  Package,
  Layers,
  ArrowDownLeft,
  ShoppingBag,
  ShieldCheck,
  Heart,
  WandSparkles,
} from 'lucide-react';
import { UncleWahInteractiveGuide } from '../common/UncleWahInteractiveGuide';
import { updatePageSEO, generateStoreSchema } from '../../utils/seo';

export const SellerProfileView: React.FC = () => {
  const {
    sellers,
    selectedSellerId,
    products,
    setActivePage,
    addToast,
  } = useApp();

  const effectiveSellerId =
    selectedSellerId ||
    (typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/sellers/')
      ? decodeURIComponent(
        window.location.pathname.split('/')[2] || ''
      )
      : null);

  const matchedSeller = useMemo(() => {
    if (!effectiveSellerId) return sellers[0] || null;

    const trimmed = effectiveSellerId.trim();

    return (
      sellers.find(
        (s) =>
          s.id === trimmed ||
          (s as any)._id === trimmed ||
          s.userId === trimmed ||
          (s.brandName && s.brandName.trim() === trimmed) ||
          (s.name && s.name.trim() === trimmed)
      ) || null
    );
  }, [sellers, effectiveSellerId]);

  const [directSeller, setDirectSeller] = useState<any>(null);
  const [isLoadingDirect, setIsLoadingDirect] = useState(false);
  const [liked, setLiked] = useState(false);
  const [visibleSections, setVisibleSections] = useState<
    Record<string, boolean>
  >({});

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [effectiveSellerId]);

  useEffect(() => {
    if (matchedSeller || !effectiveSellerId) {
      setDirectSeller(null);
      return;
    }

    let isMounted = true;

    setIsLoadingDirect(true);

    fetch(`/api/sellers/${encodeURIComponent(effectiveSellerId)}`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json?.data) {
          setDirectSeller(json.data);
        }
      })
      .catch(() => { })
      .finally(() => {
        if (isMounted) {
          setIsLoadingDirect(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [matchedSeller, effectiveSellerId]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    Object.entries(sectionRefs.current).forEach(([key, element]) => {
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({
              ...prev,
              [key]: true,
            }));

            observer.disconnect();
          }
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -60px 0px',
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const seller = matchedSeller || directSeller;

  useEffect(() => {
    if (!seller) return;
    const sellerName = seller.brandName || seller.name || 'حرفي من الصعيد';
    const sellerBio = seller.bio || `ورشة ومنتجات ${sellerName} الحرفية في ${seller.governorate || 'صعيد مصر'}. صناعة يدوية وتراثية 100%.`;
    
    updatePageSEO({
      title: `${sellerName} — ورشة وصانع بصعيد مصر`,
      description: sellerBio.slice(0, 160),
      image: seller.avatar || 'https://res.cloudinary.com/kuana1nl/image/upload/v1790463189/logo.png',
      type: 'website',
      schema: generateStoreSchema({
        id: seller.id || seller.userId || 'artisan',
        name: seller.name || sellerName,
        brandName: seller.brandName || sellerName,
        bio: sellerBio,
        avatar: seller.avatar,
        governorate: seller.governorate || 'صعيد مصر',
        phone: seller.phone
      })
    });
  }, [seller]);

  if (isLoadingDirect || (!seller && sellers.length === 0)) {
    return (
      <div
        dir="rtl"
        className="min-h-[70vh] flex items-center justify-center px-5"
      >
        <div className="relative text-center">
          <div className="absolute inset-0 blur-3xl bg-primary/10 rounded-full scale-150" />

          <div className="relative">
            {/* عم وه */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl animate-pulse" />

              <img
                src="/mascot/make.png"
                alt="عم وه"
                className="relative z-10 w-20 h-20 object-contain animate-[pulse_2s_ease-in-out_infinite]"
              />
            </div>

            <p className="mt-5 text-sm font-black text-foreground">
              بنفتحلك ديار الصانع...
            </p>

            <div className="flex justify-center gap-1 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div
        dir="rtl"
        className="min-h-[70vh] flex items-center justify-center px-5"
      >
        <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-border-subtle bg-surface-subtle p-8 sm:p-12 text-center shadow-2xl">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full" />

          <div className="relative">
            <div className="w-20 h-20 rounded-[1.75rem] bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Store className="w-9 h-9" />
            </div>

            <h3 className="mt-6 text-2xl font-black font-serif text-foreground">
              الورشة دي مش معروضة دلوقتي
            </h3>

            <p className="mt-3 text-sm text-foreground-muted leading-7">
              قد تكون الورشة قيد مراجعة الجودة أو تم تحديث بياناتها؛
              تصفح بقية شيوخ الصنعة في الجنوب.
            </p>

            <button
              type="button"
              onClick={() => setActivePage('sellers')}
              className="mt-7 w-full py-4 rounded-2xl bg-foreground text-background hover:bg-primary hover:text-white transition-all duration-300 font-black text-sm shadow-lg hover:-translate-y-1"
            >
              شوف باقي شيوخ الصنعة
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sellerProducts = (products || []).filter(
    (p) =>
      (p.sellerId === seller.id ||
        (seller.userId && p.sellerId === seller.userId) ||
        (seller.brandName && p.sellerName === seller.brandName)) &&
      p.approvalStatus === 'approved'
  );

  const brandTitle =
    seller.brandName || seller.name || 'ورشة الحرفي';

  const coverImg =
    seller.coverImage ||
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=85';

  const avatarImg =
    seller.avatar ||
    'https://res.cloudinary.com/kuana1nl/image/upload/v1788710904/user.jpg';

  const joinedYear = String(
    seller.joinedDate || '2023'
  ).slice(0, 4);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/sellers/${encodeURIComponent(
      seller.id || effectiveSellerId || ''
    )}`;

    if (navigator.share) {
      navigator
        .share({
          title: brandTitle,
          text: `ورشة ${brandTitle} - شيوخ صنعة صعيد مصر على منصة وه`,
          url: shareUrl,
        })
        .catch(() => {
          navigator.clipboard?.writeText(shareUrl);
          addToast(
            'تم نسخ الرابط',
            'تم نسخ رابط ورشة الحرفي بنجاح',
            'info'
          );
        });
    } else {
      navigator.clipboard?.writeText(shareUrl);
      addToast(
        'تم نسخ الرابط',
        'تم نسخ رابط ورشة الحرفي بنجاح',
        'info'
      );
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-background text-foreground overflow-hidden"
    >
      {/* =========================================================
          BACKGROUND DECORATION
      ========================================================= */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[8%] -right-40 w-[28rem] h-[28rem] rounded-full bg-primary/[0.055] blur-3xl" />
        <div className="absolute top-[45%] -left-40 w-[28rem] h-[28rem] rounded-full bg-orange-500/[0.035] blur-3xl" />
        <div className="absolute bottom-[5%] right-[35%] w-[20rem] h-[20rem] rounded-full bg-amber-500/[0.025] blur-3xl" />
      </div>

      <div className="relative max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-5 sm:py-8">
        {/* =========================================================
            BREADCRUMB
        ========================================================= */}

        <nav className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-foreground-disabled overflow-hidden">
            <button
              type="button"
              onClick={() => setActivePage('home')}
              className="hover:text-primary transition-colors shrink-0"
            >
              الرئيسية
            </button>

            <ChevronRight className="w-3 h-3 rotate-180 opacity-30 shrink-0" />

            <button
              type="button"
              onClick={() => setActivePage('sellers')}
              className="hover:text-primary transition-colors shrink-0"
            >
              دليل الصنّاع
            </button>

            <ChevronRight className="w-3 h-3 rotate-180 opacity-30 shrink-0" />

            <span className="text-foreground truncate">
              {brandTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">


            <button
              type="button"
              onClick={handleShare}
              className="h-10 px-3.5 sm:px-4 rounded-xl border border-border-subtle bg-surface-subtle hover:border-primary/30 hover:text-primary inline-flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px] font-black">
                مشاركة
              </span>
            </button>
          </div>
        </nav>

        {/* UNCLE WAH INTERACTIVE GUIDE */}
        <div className="mb-6">
          <UncleWahInteractiveGuide
            context="crafts"
            title={brandTitle}
            locationName={seller?.governorate}
            customQuote={`«عم وه زار ورشة ${brandTitle} في ${seller?.governorate || 'الصعيد'}، وشاف سر الصنعة وخطوات الشغل اليدوي بعينه.. صنايعي شاطر من رجالة بلدنا وأمين على التراث الصعيدي!»`}
          />
        </div>

        {/* =========================================================
            HERO
        ========================================================= */}

        <section
          ref={(el) => {
            sectionRefs.current.hero = el;
          }}
          className={`transition-all duration-1000 ${visibleSections.hero
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
            }`}
        >
          <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[3rem] min-h-[480px] sm:min-h-[580px] lg:min-h-[620px] border border-white/10 shadow-2xl group">
            {/* IMAGE */}

            <img
              src={coverImg}
              alt={brandTitle}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1800ms] ease-out group-hover:scale-[1.045]"
            />

            {/* DARK GRADIENT */}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/5" />

            <div className="absolute inset-0 bg-gradient-to-l from-black/50 via-transparent to-transparent" />

            {/* MOVING LIGHT */}

            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/20 blur-3xl opacity-60 group-hover:opacity-90 transition-opacity duration-1000" />

            {/* HERO CONTENT */}

            <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 lg:p-12">
              <div className="max-w-4xl">
                {/* BADGES */}

                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="inline-flex items-center gap-2 rounded-full bg-black/45 backdrop-blur-xl border border-white/15 text-white px-3.5 py-2 text-[10px] sm:text-xs font-black shadow-lg">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {seller.governorate || 'الصعيد'}
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/90 backdrop-blur-xl text-white px-3.5 py-2 text-[10px] sm:text-xs font-black shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    {seller.specialty || 'مشغولات يدوية'}
                  </span>

                  {seller.verified && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/90 text-white px-3.5 py-2 text-[10px] sm:text-xs font-black shadow-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      صانع موثّق
                    </span>
                  )}
                </div>

                {/* TITLE */}

                <div className="flex items-end gap-4 sm:gap-6">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-[1.4rem] bg-primary/50 blur-xl animate-pulse" />

                    <img
                      src={avatarImg}
                      alt={seller.name || brandTitle}
                      className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-[1.4rem] object-cover border-2 border-white/30 shadow-2xl bg-background transition-transform duration-500 group-hover:-translate-y-2"
                    />

                    {seller.verified && (
                      <div className="absolute -bottom-2 -left-2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white/80 text-white flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-white/65 text-[10px] sm:text-xs font-bold mb-1">
                      ورشة من قلب صعيد مصر
                    </p>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif text-white leading-[1.05] tracking-tight">
                      {brandTitle}
                    </h1>

                    <p className="mt-2 text-white/70 text-xs sm:text-sm">
                      بإدارة الصانع:
                      <span className="text-white font-black mr-1">
                        {seller.name || 'حرفي الجنوب'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* DESCRIPTION */}

                <p className="max-w-2xl mt-6 text-white/75 text-xs sm:text-sm leading-7">
                  {seller.bio ||
                    'ورشة متخصصة في المشغولات الصعيدية التراثية المتوارثة أباً عن جد؛ نصنع بعناية ونوصل الحكاية من يد الصانع لباب بيتك.'}
                </p>

                {/* STATS */}

                <div className="grid grid-cols-3 max-w-xl mt-7 rounded-2xl sm:rounded-3xl border border-white/10 bg-black/25 backdrop-blur-xl overflow-hidden">
                  <div className="px-3 py-4 sm:px-6 sm:py-5 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm sm:text-base font-black">
                        {seller.rating ?? 0}
                      </span>
                    </div>
                    <span className="block mt-1 text-[9px] sm:text-[10px] text-white/50 font-bold">
                      التقييم
                    </span>
                  </div>

                  <div className="px-3 py-4 sm:px-6 sm:py-5 text-center border-x border-white/10">
                    <span className="block text-sm sm:text-base font-black text-white">
                      {seller.salesCount ?? 0}
                    </span>
                    <span className="block mt-1 text-[9px] sm:text-[10px] text-white/50 font-bold">
                      مبيعة
                    </span>
                  </div>

                  <div className="px-3 py-4 sm:px-6 sm:py-5 text-center">
                    <span className="block text-sm sm:text-base font-black text-white">
                      {sellerProducts.length}
                    </span>
                    <span className="block mt-1 text-[9px] sm:text-[10px] text-white/50 font-bold">
                      قطعة
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* FLOATING CORNER */}

            <div className="absolute top-5 left-5 sm:top-8 sm:left-8 hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white/80 text-[10px] font-bold">
              <WandSparkles className="w-3.5 h-3.5 text-primary" />
              صناعة بإيدين مصرية
            </div>
          </div>
        </section>

        {/* =========================================================
            INFO STRIP
        ========================================================= */}

        <section
          ref={(el) => {
            sectionRefs.current.info = el;
          }}
          className={`mt-5 sm:mt-7 transition-all duration-1000 delay-150 ${visibleSections.info
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
            }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="group rounded-2xl border border-border-subtle bg-surface-subtle p-4 sm:p-5 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-4.5 h-4.5" />
                </div>

                <div>
                  <span className="block text-[9px] text-foreground-disabled font-bold">
                    موجود على وه من
                  </span>
                  <span className="block mt-0.5 text-xs font-black">
                    {joinedYear}
                  </span>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl border border-border-subtle bg-surface-subtle p-4 sm:p-5 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>

                <div>
                  <span className="block text-[9px] text-foreground-disabled font-bold">
                    الجودة
                  </span>
                  <span className="block mt-0.5 text-xs font-black">
                    إنتاج يدوي أصيل
                  </span>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl border border-border-subtle bg-surface-subtle p-4 sm:p-5 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MapPin className="w-4.5 h-4.5" />
                </div>

                <div>
                  <span className="block text-[9px] text-foreground-disabled font-bold">
                    مكان الورشة
                  </span>
                  <span className="block mt-0.5 text-xs font-black">
                    {seller.governorate || 'صعيد مصر'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            PRODUCTS HEADER
        ========================================================= */}

        <section
          ref={(el) => {
            sectionRefs.current.products = el;
          }}
          className={`mt-12 sm:mt-16 transition-all duration-1000 delay-200 ${visibleSections.products
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10'
            }`}
        >
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 text-primary text-[10px] sm:text-xs font-black mb-2">
                  <Package className="w-4 h-4" />
                  <span>المعروضات الجاهزة للطلب</span>
                </div>

                <div className="flex items-center gap-3">
                  <h2 className="text-3xl sm:text-4xl font-black font-serif">
                    شغل إيدين {brandTitle}
                  </h2>

                  <div className="hidden sm:block w-12 h-1 rounded-full bg-primary/70" />
                </div>

                <p className="mt-2 text-xs sm:text-sm text-foreground-muted">
                  كل قطعة بتطلع من الورشة بحكاية لوحدها
                </p>
              </div>

              <div className="inline-flex self-start sm:self-auto items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface-subtle border border-border-subtle text-xs font-black">
                <ShoppingBag className="w-4 h-4 text-primary" />
                {sellerProducts.length} قطعة متاحة
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            PRODUCTS
        ========================================================= */}

        <section
          className={`mt-6 transition-all duration-1000 delay-300 ${visibleSections.products
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10'
            }`}
        >
          {sellerProducts.length === 0 ? (
            <div className="relative overflow-hidden rounded-[2.5rem] border border-border-subtle bg-surface-subtle p-12 sm:p-20 text-center">
              <div className="absolute top-0 right-1/2 translate-x-1/2 w-72 h-72 bg-primary/5 blur-3xl rounded-full" />

              <div className="relative">
                <div className="w-20 h-20 rounded-[1.75rem] bg-background border border-border-subtle flex items-center justify-center mx-auto shadow-lg">
                  <Store className="w-9 h-9 text-foreground-disabled opacity-50" />
                </div>

                <h4 className="mt-6 font-black text-lg font-serif">
                  الصانع شغال على قطع جديدة
                </h4>

                <p className="mt-2 text-xs sm:text-sm text-foreground-disabled max-w-sm mx-auto leading-7">
                  تابع الورشة قريباً لمشاهدة المشغولات اليدوية الجديدة فور توفرها.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {sellerProducts.map((p, index) => (
                <div
                  key={p.id}
                  className="group relative transition-all duration-500 hover:-translate-y-2"
                  style={{
                    transitionDelay: `${Math.min(index * 70, 350)}ms`,
                  }}
                >
                  <div className="absolute -inset-1 rounded-[2rem] bg-primary/0 group-hover:bg-primary/[0.035] blur-xl transition-all duration-500 pointer-events-none" />

                  <div className="relative">
                    <ProductCard product={p} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =========================================================
            BOTTOM STORY
        ========================================================= */}

        <section
          ref={(el) => {
            sectionRefs.current.story = el;
          }}
          className={`mt-14 sm:mt-20 transition-all duration-1000 ${visibleSections.story
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10'
            }`}
        >
          <div className="relative overflow-hidden rounded-[2.5rem] sm:rounded-[3rem] border border-border-subtle bg-surface-subtle p-6 sm:p-10 lg:p-14">
            <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-primary text-[10px] font-black mb-3">
                  <Layers className="w-4 h-4" />
                  أصل الصنعة
                </div>

                <h3 className="text-2xl sm:text-3xl font-black font-serif">
                  مش مجرد ورشة...
                  <br />
                  <span className="text-primary">
                    دي حكاية بتكمل.
                  </span>
                </h3>

                <p className="mt-4 max-w-2xl text-xs sm:text-sm text-foreground-muted leading-7">
                  {seller.bio ||
                    'صنعة اتوارثت من جيل لجيل، ولسه مستمرة بإيدين بتحب اللي بتعمله وتحافظ على روح المكان.'}
                </p>
              </div>

              <div className="hidden sm:flex w-28 h-28 rounded-full border border-primary/20 bg-primary/5 items-center justify-center">
                <Award className="w-12 h-12 text-primary" />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            CONTACT FOOTER
        ========================================================= */}


      </div>
    </div>
  );
};

export default SellerProfileView;
