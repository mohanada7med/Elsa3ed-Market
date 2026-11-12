import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../products/ProductCard';
import {
  Store,
  MapPin,
  Star,
  BadgeCheck,
  ChevronRight,
  Share2,
  MessageCircle,
  Heart,
  Edit2,
} from 'lucide-react';
import { updatePageSEO, generateStoreSchema } from '../../utils/seo';
import { api } from '../../services/api';
import { QrCodeModal } from '../common/QrCodeModal';

type SortKey = 'default' | 'price-asc' | 'price-desc';

/** زخرفة مثلثات متكررة (مستوحاة من الوشم والنسيج النوبي/الصعيدي) تُستخدم كقناع */
const ZIGZAG_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='16' viewBox='0 0 32 16'%3E%3Cpath d='M0 16 L8 0 L16 16 L24 0 L32 16 Z' fill='black'/%3E%3C/svg%3E")`;

const toWhatsAppNumber = (raw?: string) => {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `20${digits.slice(1)}`;
  return digits;
};

export const SellerProfileView: React.FC = () => {
  const {
    sellers,
    selectedSellerId,
    products,
    setActivePage,
    addToast,
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthModalTab,
  } = useApp();

  const effectiveSellerId =
    selectedSellerId ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/sellers/')
      ? decodeURIComponent(window.location.pathname.split('/')[2] || '')
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
  const [followState, setFollowState] = useState({ following: false, followersCount: 0 });
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('default');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSortBy('default');
    setActiveCategory('all');
  }, [effectiveSellerId]);

  useEffect(() => {
    if (matchedSeller || !effectiveSellerId) {
      setDirectSeller(null);
      return;
    }
    let isMounted = true;
    setIsLoadingDirect(true);
    fetch(`/api/sellers/${encodeURIComponent(effectiveSellerId)}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json?.data) setDirectSeller(json.data);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingDirect(false);
      });
    return () => {
      isMounted = false;
    };
  }, [matchedSeller, effectiveSellerId]);

  const seller = matchedSeller || directSeller;

  const isOwnSellerProfile = Boolean(
    seller &&
      isAuthenticated &&
      currentUser.role === 'seller' &&
      (currentUser.id === seller.id ||
        currentUser.id === seller.userId ||
        currentUser.sellerId === seller.id)
  );

  useEffect(() => {
    if (!seller?.id || !isAuthenticated || currentUser.role !== 'buyer') {
      setFollowState({ following: false, followersCount: 0 });
      return;
    }
    let active = true;
    api
      .getSellerFollowState(currentUser, seller.id)
      .then((state) => {
        if (active) setFollowState(state);
      })
      .catch((error) => console.error('[SellerProfileView] Failed to load follow state:', error));
    return () => {
      active = false;
    };
  }, [seller?.id, isAuthenticated, currentUser.id, currentUser.role]);

  const handleFollowSeller = async () => {
    if (!isAuthenticated) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      return;
    }
    if (currentUser.role !== 'buyer' || !seller?.id) return;
    setIsFollowLoading(true);
    try {
      const state = followState.following
        ? await api.unfollowSeller(currentUser, seller.id)
        : await api.followSeller(currentUser, seller.id);
      setFollowState(state);
      addToast(
        state.following ? 'بدأت متابعة الورشة' : 'تم إلغاء متابعة الورشة',
        state.following
          ? 'هيوصلك تنبيه عند نشر منتجات أو حكايات جديدة'
          : 'يمكنك متابعة الورشة مرة أخرى في أي وقت',
        'success'
      );
    } catch (error) {
      addToast('تعذر تحديث المتابعة', (error as Error).message || 'حاول مرة أخرى بعد قليل', 'error');
    } finally {
      setIsFollowLoading(false);
    }
  };

  useEffect(() => {
    if (!seller) return;
    const sellerName = seller.brandName || seller.name || 'حرفي من الصعيد';
    const sellerBio =
      seller.bio ||
      `ورشة ومنتجات ${sellerName} الحرفية في ${seller.governorate || 'صعيد مصر'}. صناعة يدوية وتراثية 100%.`;
    updatePageSEO({
      title: `${sellerName} — ورشة وصانع بصعيد مصر`,
      description: sellerBio.slice(0, 160),
      image:
        seller.avatar ||
        'https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png',
      type: 'website',
      schema: generateStoreSchema({
        id: seller.id || seller.userId || 'artisan',
        name: seller.name || sellerName,
        brandName: seller.brandName || sellerName,
        bio: sellerBio,
        avatar: seller.avatar,
        governorate: seller.governorate || 'صعيد مصر',
        phone: seller.phone,
      }),
    });
  }, [seller]);

  const sellerProducts = useMemo(() => {
    if (!seller) return [];
    return (products || []).filter(
      (p) =>
        (p.sellerId === seller.id ||
          (seller.userId && p.sellerId === seller.userId) ||
          (seller.brandName && p.sellerName === seller.brandName)) &&
        p.approvalStatus === 'approved'
    );
  }, [products, seller]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    sellerProducts.forEach((p) => {
      const c = (p as any).category;
      if (typeof c === 'string' && c.trim()) set.add(c.trim());
    });
    return Array.from(set);
  }, [sellerProducts]);

  const visibleProducts = useMemo(() => {
    let list = sellerProducts;
    if (activeCategory !== 'all') {
      list = list.filter((p) => String((p as any).category || '').trim() === activeCategory);
    }
    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => Number((a as any).price || 0) - Number((b as any).price || 0));
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => Number((b as any).price || 0) - Number((a as any).price || 0));
    }
    return list;
  }, [sellerProducts, activeCategory, sortBy]);

  /* ---------------- loading / not found ---------------- */

  if (isLoadingDirect || (!seller && sellers.length === 0)) {
    return (
      <div dir="rtl" className="flex min-h-[70vh] items-center justify-center px-5">
        <div className="text-center">
          <img src="/mascot/make.png" alt="عم وه" className="mx-auto h-20 w-20 animate-pulse object-contain" />
          <p className="mt-5 text-sm font-black text-foreground">بنفتحلك ديار الصانع...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div dir="rtl" className="flex min-h-[70vh] items-center justify-center px-5">
        <div className="w-full max-w-md rounded-[2rem] border border-border-subtle bg-surface-subtle p-8 text-center shadow-xl sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <Store className="h-9 w-9" />
          </div>
          <h3 className="mt-6 text-2xl font-cairo font-bold text-foreground">الورشة دي مش معروضة دلوقتي</h3>
          <p className="mt-3 text-sm leading-7 text-foreground-muted">
            ممكن تكون الورشة قيد مراجعة الجودة أو بياناتها بتتحدّث. تصفّح باقي الصنّاع في الجنوب.
          </p>
          <button
            type="button"
            onClick={() => setActivePage('sellers')}
            className="mt-7 w-full rounded-2xl bg-foreground py-4 text-sm font-black text-background transition-colors hover:bg-primary hover:text-white"
          >
            شوف باقي الصنّاع
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- values ---------------- */

  const brandTitle = seller.brandName || seller.name || 'ورشة الحرفي';
  const ownerName = seller.name || 'حرفي الجنوب';
  const specialty = seller.specialty || 'مشغولات يدوية';
  const governorate = seller.governorate || 'صعيد مصر';

  const coverImg =
    seller.coverImage ||
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=85';
  const avatarImg =
    seller.avatar || 'https://res.cloudinary.com/kuana1nl/image/upload/v1788710904/user.jpg';

  const joinedYear = String(seller.joinedDate || '2023').slice(0, 4);
  const craftYears = seller.craftSinceYear
    ? Math.max(0, new Date().getFullYear() - seller.craftSinceYear)
    : null;

  const hasRating = Number(seller.rating) > 0;
  const hasSales = Number(seller.salesCount) > 0;
  const whatsappNumber = toWhatsAppNumber(seller.phone);

  const profileUrl = () =>
    `${window.location.origin}/sellers/${encodeURIComponent(seller.id || effectiveSellerId || '')}`;

  const copyLink = (url: string) => {
    navigator.clipboard?.writeText(url);
    addToast('تم نسخ الرابط', 'تم نسخ رابط ورشة الحرفي بنجاح', 'info');
  };

  const handleShare = () => {
    const url = profileUrl();
    if (navigator.share) {
      navigator
        .share({ title: brandTitle, text: `ورشة ${brandTitle} - شيوخ صنعة صعيد مصر على منصة وه`, url })
        .catch(() => copyLink(url));
    } else {
      copyLink(url);
    }
  };

  const handleShareOnWhatsApp = () => {
    const message = `ورشة ${brandTitle} - اكتشف منتجاتها على سوق وه: ${profileUrl()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const handleContactSeller = () => {
    if (!whatsappNumber) return;
    const message = `السلام عليكم، شفت ورشتك "${brandTitle}" على سوق وه وحابب أستفسر عن منتجاتك.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const stats = [
    { value: String(sellerProducts.length), label: 'قطعة متاحة' },
    hasRating && { value: String(seller.rating), label: 'تقييم', star: true },
    hasSales && { value: String(seller.salesCount), label: 'مبيعة' },
    followState.followersCount > 0 && { value: String(followState.followersCount), label: 'متابع' },
    craftYears !== null && { value: String(craftYears), label: 'سنة خبرة' },
  ].filter(Boolean) as { value: string; label: string; star?: boolean }[];

  const iconBtn =
    'inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white';

  /* ---------------- render ---------------- */

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      {/* ==================== HERO (full-bleed) ==================== */}
      <section className="relative isolate overflow-hidden bg-black">
        <img src={coverImg} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/60 to-black/20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-l from-black/70 via-transparent to-transparent" />

        <div className="mx-auto flex min-h-[600px] max-w-[1400px] flex-col px-4 pb-24 pt-5 sm:px-6 lg:min-h-[680px] lg:px-10">
          {/* breadcrumb + share */}
          <div className="flex items-center justify-between gap-4">
            <nav aria-label="مسار التنقل" className="flex items-center gap-2 overflow-hidden text-xs font-bold text-white/70">
              <button type="button" onClick={() => setActivePage('home')} className="shrink-0 hover:text-white">
                الرئيسية
              </button>
              <ChevronRight className="h-3 w-3 shrink-0 rotate-180 opacity-50" />
              <button type="button" onClick={() => setActivePage('sellers')} className="shrink-0 hover:text-white">
                دليل الصنّاع
              </button>
            </nav>

            <div className="flex items-center gap-2">
              <button type="button" onClick={handleShare} aria-label="مشاركة الورشة" className={iconBtn}>
                <Share2 className="h-4 w-4" />
              </button>
              <button type="button" onClick={handleShareOnWhatsApp} aria-label="مشاركة على واتساب" className={iconBtn}>
                <MessageCircle className="h-4 w-4" />
              </button>
              <QrCodeModal title={brandTitle} url={`/sellers/${encodeURIComponent(seller.id)}`} entityLabel="الورشة" />
            </div>
          </div>

          {/* identity */}
          <div className="mt-auto grid grid-cols-1 items-end gap-10 pt-16 lg:grid-cols-[1fr_auto]">
            <div className="order-2 lg:order-1">
              <p className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold text-white/80">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  {governorate}
                </span>
                <span className="text-white/90">{specialty}</span>
                {seller.verified && (
                  <span className="inline-flex items-center gap-1.5 text-emerald-300">
                    <BadgeCheck className="h-4 w-4" />
                    صانع موثّق
                  </span>
                )}
              </p>

              <h1 className="max-w-4xl text-5xl font-main font-black leading-[1.1] text-white sm:text-7xl lg:text-8xl">
                {brandTitle}
              </h1>

              <p className="mt-4 text-base text-white/80 sm:text-lg">
                بإدارة الصانع <span className="font-black text-white">{ownerName}</span>
              </p>

              <p className="mt-5 max-w-xl text-sm leading-8 text-white/75 sm:text-base">
                {seller.bio ||
                  'ورشة متخصصة في المشغولات الصعيدية التراثية المتوارثة أباً عن جد؛ بنصنع بعناية ونوصّل الحكاية من يد الصانع لباب بيتك.'}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                {isOwnSellerProfile ? (
                  <button
                    type="button"
                    onClick={() => setActivePage('seller-account')}
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-black text-white transition-colors hover:bg-primary-hover"
                  >
                    <Edit2 className="h-4 w-4" />
                    تعديل البروفايل
                  </button>
                ) : (
                  <>
                    {(currentUser.role === 'buyer' || !isAuthenticated) && (
                      <button
                        type="button"
                        onClick={handleFollowSeller}
                        disabled={isFollowLoading}
                        aria-pressed={followState.following}
                        className={`inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-black transition-colors disabled:cursor-wait disabled:opacity-60 ${
                          followState.following
                            ? 'border border-white/40 bg-white/10 text-white backdrop-blur-md hover:bg-white/20'
                            : 'bg-primary text-white hover:bg-primary-hover'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${followState.following ? 'fill-current text-rose-300' : ''}`} />
                        {isFollowLoading ? 'لحظة...' : followState.following ? 'بتتابع الورشة' : 'تابع الورشة'}
                      </button>
                    )}
                    
                  </>
                )}
              </div>
            </div>

            {/* arch portrait */}
            <div className="order-1 mx-auto lg:order-2 lg:mx-0">
              <div className="relative">
                <img
                  src={avatarImg}
                  alt={ownerName}
                  className="h-64 w-48 rounded-t-full rounded-b-[2rem] border-[6px] border-white/90 bg-background object-cover shadow-2xl sm:h-80 sm:w-60 lg:h-[26rem] lg:w-72"
                />
                {seller.verified && (
                  <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-black text-white shadow-lg">
                    <BadgeCheck className="h-4 w-4" />
                    موثّق
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* zigzag edge */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-4 bg-background"
          style={{
            WebkitMaskImage: ZIGZAG_MASK,
            maskImage: ZIGZAG_MASK,
            WebkitMaskRepeat: 'repeat-x',
            maskRepeat: 'repeat-x',
            WebkitMaskSize: '32px 16px',
            maskSize: '32px 16px',
          }}
        />
      </section>

      {/* ==================== STATS RIBBON ==================== */}
      <div className="mx-auto -mt-1 max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <dl className="flex flex-wrap items-stretch justify-center divide-x divide-x-reverse divide-border-subtle border-b border-border-subtle py-6">
          {stats.map((s) => (
            <div key={s.label} className="flex min-w-[110px] flex-1 flex-col items-center px-4 py-2 text-center">
              <dd className="flex items-center gap-1.5 text-3xl font-main font-black sm:text-4xl">
                {s.star && <Star className="h-5 w-5 fill-current text-amber-500" />}
                {s.value}
              </dd>
              <dt className="mt-1 text-xs font-bold text-foreground-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>

      {/* ==================== BODY ==================== */}
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_340px] lg:gap-14 lg:px-10 lg:py-16">
        <main className="min-w-0 space-y-16">
          {/* story */}
          <section aria-labelledby="story-title">
            <h2 id="story-title" className="text-3xl font-main font-black leading-snug sm:text-4xl">
              {seller.story ? 'حكاية بدأت بإيدين بتحب الصنعة' : `كل قطعة من ${brandTitle} وراها حكاية`}
            </h2>

            {seller.story ? (
              <p className="mt-6 max-w-2xl whitespace-pre-line border-r-4 border-primary pr-6 text-lg leading-10 text-foreground-muted">
                {seller.story}
              </p>
            ) : (
              <p className="mt-6 max-w-2xl border-r-4 border-primary pr-6 text-lg leading-10 text-foreground-muted">
                وراها وقت ومهارة واختيار للخامة. اكتشف شغل {brandTitle} وتعرّف على الصنعة من خلال المنتجات.
              </p>
            )}

            {(seller.offerings || seller.specialty) && (
              <div className="mt-10 rounded-3xl bg-surface-subtle p-6 sm:p-8">
                <h3 className="text-lg font-black">إيه اللي بنقدمه؟</h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-8 text-foreground-muted">
                  {seller.offerings || seller.specialty}
                </p>
              </div>
            )}
          </section>

          {/* products */}
          <section aria-labelledby="products-title">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="products-title" className="text-3xl font-main font-black sm:text-4xl">
                  شغل إيدين {brandTitle}
                </h2>
                <p className="mt-1 text-sm text-foreground-muted">{sellerProducts.length} قطعة جاهزة للطلب</p>
              </div>

              {sellerProducts.length > 1 && (
                <label className="inline-flex items-center gap-2 text-xs font-bold text-foreground-muted">
                  ترتيب
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortKey)}
                    className="rounded-full border border-border-subtle bg-surface-subtle px-4 py-2 text-xs font-black text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="default">الافتراضي</option>
                    <option value="price-asc">السعر: الأقل أولاً</option>
                    <option value="price-desc">السعر: الأعلى أولاً</option>
                  </select>
                </label>
              )}
            </div>

            {categories.length > 1 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {['all', ...categories].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActiveCategory(c)}
                    aria-pressed={activeCategory === c}
                    className={`rounded-full border px-4 py-2 text-xs font-black transition-colors ${
                      activeCategory === c
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border-subtle hover:border-foreground/40'
                    }`}
                  >
                    {c === 'all' ? 'الكل' : c}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-8">
              {sellerProducts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border-subtle p-12 text-center sm:p-16">
                  <Store className="mx-auto h-10 w-10 text-foreground-disabled opacity-60" />
                  <h3 className="mt-4 text-lg font-cairo font-bold">الصانع شغال على قطع جديدة</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-foreground-muted">
                    تابع الورشة عشان يوصلك تنبيه أول ما تنزل مشغولات جديدة.
                  </p>
                </div>
              ) : visibleProducts.length === 0 ? (
                <p className="rounded-2xl bg-surface-subtle p-8 text-center text-sm text-foreground-muted">
                  مفيش قطع في القسم ده حالياً.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          </section>

          
        </main>

        {/* ==================== SIDEBAR ==================== */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-border-subtle bg-surface-subtle">
            <div className="h-3 bg-primary" style={{
              WebkitMaskImage: ZIGZAG_MASK,
              maskImage: ZIGZAG_MASK,
              WebkitMaskRepeat: 'repeat-x',
              maskRepeat: 'repeat-x',
              WebkitMaskSize: '24px 12px',
              maskSize: '24px 12px',
            }} aria-hidden="true" />

            <div className="p-6">
              <div className="flex items-center gap-4">
                <img src={avatarImg} alt="" className="h-16 w-16 rounded-full object-cover" />
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-black">{ownerName}</h2>
                  <p className="truncate text-xs font-bold text-foreground-muted">صانع {specialty}</p>
                </div>
              </div>

              <dl className="mt-6 divide-y divide-border-subtle text-sm">
                <div className="flex items-center justify-between py-3">
                  <dt className="text-foreground-muted">مكان الورشة</dt>
                  <dd className="font-black">{governorate}</dd>
                </div>
                {seller.craftSinceYear && (
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-foreground-muted">بداية الحرفة</dt>
                    <dd className="font-black">{seller.craftSinceYear}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between py-3">
                  <dt className="text-foreground-muted">على وه من</dt>
                  <dd className="font-black">{joinedYear}</dd>
                </div>
                {seller.achievementOrdersCount != null && (
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-foreground-muted">طلبات نفّذها</dt>
                    <dd className="font-black">{seller.achievementOrdersCount.toLocaleString('ar-EG')}</dd>
                  </div>
                )}
              </dl>

              {!!seller.achievementSkills?.length && (
                <div className="mt-5">
                  <h3 className="text-sm font-black">مهارات الحرفي</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {seller.achievementSkills.map((skill: string) => (
                      <span key={skill} className="rounded-full bg-background px-3 py-1.5 text-xs font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] text-foreground-muted">هذه المعلومات يضيفها الحرفي بنفسه.</p>
                </div>
              )}

              
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SellerProfileView;