import React from 'react';
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
  Share2
} from 'lucide-react';

export const SellerProfileView: React.FC = () => {
  const { sellers, selectedSellerId, products, setActivePage, addToast } = useApp();

  const effectiveSellerId =
    selectedSellerId ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/sellers/')
      ? decodeURIComponent(window.location.pathname.split('/')[2] || '')
      : null);

  const seller = sellers.find((s) => s.id === effectiveSellerId) || (!effectiveSellerId ? sellers[0] : undefined);

  if (!seller) {
    return (
      <div
        dir="rtl"
        className="min-h-[60vh] flex items-center justify-center max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-16"
      >
        <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-10 text-center space-y-4 shadow-lg max-w-md w-full">
          <Store className="w-12 h-12 text-[#9a6a35] mx-auto" />
          <h3 className="text-xl font-black font-serif text-[#211d18] dark:text-[#f5f0e7]">صفحة الورشة مش موجودة دلوقتي</h3>
          <button
            type="button"
            onClick={() => setActivePage('sellers')}
            className="w-full py-3.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] rounded-[1.25rem] text-xs font-black transition-colors cursor-pointer"
          >
            شوف باقي شيوخ الصنعة
          </button>

        </div>
      </div>
    );
  }

  const sellerProducts = products.filter(
    (p) => (p.sellerId === seller.id || p.sellerName === seller.brandName) && p.approvalStatus === 'approved'
  );

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/sellers/${encodeURIComponent(seller.id)}`;
    if (navigator.share) {
      navigator
        .share({
          title: seller.brandName,
          text: `ورشة ${seller.brandName} - حرفيو صعيد مصر على منصة وه`,
          url: shareUrl
        })
        .catch(() => {
          navigator.clipboard?.writeText(shareUrl);
          addToast('تم نسخ الرابط', 'تم نسخ رابط ورشة الحرفي المباشر بنجاح', 'info');
        });
    } else {
      navigator.clipboard?.writeText(shareUrl);
      addToast('تم نسخ الرابط', 'تم نسخ رابط ورشة الحرفي المباشر بنجاح', 'info');
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#eee8dc] text-[#211d18] dark:bg-[#0b0b0a] dark:text-[#f5f0e7] max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-8 space-y-8"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#211d18]/60 dark:text-[#f5f0e7]/60 font-medium">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#9a6a35] dark:hover:text-[#d5a56d] transition-colors cursor-pointer"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 opacity-50" />
        <button
          type="button"
          onClick={() => setActivePage('sellers')}
          className="hover:text-[#9a6a35] dark:hover:text-[#d5a56d] transition-colors cursor-pointer"
        >
          دليل شيوخ الصنعة        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 opacity-50" />
        <span className="text-[#211d18] dark:text-[#f5f0e7] font-bold">{seller.brandName}</span>
      </nav>

      {/* Workshop Header & Profile Banner */}
      <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 overflow-hidden shadow-lg">
        {/* Cover Banner */}
        <div className="relative h-48 sm:h-64 w-full bg-black/5 dark:bg-white/5">
          <img src={seller.coverImage} alt={seller.brandName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          {/* Governorate tag & Share */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="bg-[#9a6a35] text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>محافظة {seller.governorate}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="absolute top-4 left-4 p-2.5 rounded-full bg-white/90 dark:bg-[#151513]/90 hover:bg-white text-[#211d18] dark:text-[#f5f0e7] backdrop-blur-md shadow-sm transition-all cursor-pointer"
            title="مشاركة رابط الورشة"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Details Bar */}
        <div className="p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-right gap-4">
              <div className="relative shrink-0">
                <img
                  src={seller.avatar}
                  alt={seller.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white dark:border-[#151513] shadow-xl bg-stone-100"
                />
                {seller.verified && (
                  <div className="absolute -bottom-1 -left-1 bg-emerald-600 text-white rounded-full p-1 shadow-md" title="حرفي موثق">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#211d18] dark:text-[#f5f0e7] font-serif">
                  {seller.brandName}
                </h1>
                <p className="text-xs sm:text-sm text-[#211d18]/70 dark:text-[#f5f0e7]/70 font-semibold mt-0.5">
                  الصانع: {seller.name} • تخصص: {seller.specialty}
                </p>
              </div>
            </div>

            {/* Performance metrics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3.5 sm:px-4 py-2.5 rounded-[1.25rem] text-center">
                <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-xs sm:text-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{seller.rating}</span>
                </div>
                <span className="text-[10px] text-[#211d18]/60 dark:text-[#f5f0e7]/60 block mt-0.5">تقييم المتسوقين</span>
              </div>

              <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3.5 sm:px-4 py-2.5 rounded-[1.25rem] text-center">
                <span className="font-black text-xs sm:text-sm text-[#9a6a35] dark:text-[#d5a56d] block">{seller.salesCount}+</span>
                <span className="text-[10px] text-[#211d18]/60 dark:text-[#f5f0e7]/60 block mt-0.5">قطعة تم شحنها</span>
              </div>

              <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3.5 sm:px-4 py-2.5 rounded-[1.25rem] text-center">
                <span className="font-bold text-xs sm:text-sm text-[#211d18] dark:text-[#f5f0e7] block">{seller.productsCount}</span>
                <span className="text-[10px] text-[#211d18]/60 dark:text-[#f5f0e7]/60 block mt-0.5">منتجات معروضة</span>
              </div>
            </div>
          </div>

          {/* Artisan Story / Bio */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 border-t border-black/10 dark:border-white/10">
            <div className="lg:col-span-8 space-y-3">
              <h3 className="text-sm font-black text-[#9a6a35] dark:text-[#d5a56d] flex items-center gap-1.5 font-serif">
                <Sparkles className="w-4 h-4" />
                <span>عن الورشة وتاريخ الصنعة التراثية</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#211d18]/80 dark:text-[#f5f0e7]/80 leading-relaxed">
                {seller.bio}
              </p>
            </div>

            {/* Contact / Workshop Info */}
            <div className="lg:col-span-4 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/10 dark:border-white/10 space-y-2.5 text-xs text-[#211d18]/70 dark:text-[#f5f0e7]/70">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>عضو معتمد في منصة وه منذ {seller.joinedDate?.slice(0, 4) || '2023'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span dir="ltr" className="font-mono text-[#211d18] dark:text-[#f5f0e7] font-semibold">{seller.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#9a6a35] dark:text-[#d5a56d]" />
                <span>حرف يدوية أصيلة خالية من المواد الصناعية</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seller's Products Catalog */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-serif">
              شغل وحلاوة {seller.brandName}
            </h2>
            <p className="text-xs text-[#211d18]/60 dark:text-[#f5f0e7]/60 mt-0.5">
              كل القطع بتتشحن على طول من الورشة في {seller.governorate} لحد عندك
            </p>
          </div>
          <span className="text-xs font-bold text-[#9a6a35] dark:text-[#d5a56d] bg-[#9a6a35]/10 px-3.5 py-1 rounded-full border border-[#9a6a35]/20">
            {sellerProducts.length} قطع جاهزة
          </span>
        </div>

        {sellerProducts.length === 0 ? (
          <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-12 text-center shadow-lg">
            <Store className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
            <h4 className="font-bold text-[#211d18]/70 dark:text-[#f5f0e7]/70 text-sm font-serif">لسه مفيش قطع معروضة للورشة دي حالياً</h4>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {sellerProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};