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

  const seller = sellers.find((s) => s.id === selectedSellerId) || sellers[0];

  if (!seller) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h3 className="text-xl font-bold text-gray-800">بيانات الحرفي غير متوفرة</h3>
        <button
          type="button"
          onClick={() => setActivePage('sellers')}
          className="px-6 py-2.5 bg-[#943310] hover:bg-[#7c280a] text-white rounded-xl text-sm font-bold transition-colors"
        >
          دليل الحرفيين والورش
        </button>
      </div>
    );
  }

  const sellerProducts = products.filter(
    (p) => (p.sellerId === seller.id || p.sellerName === seller.brandName) && p.approvalStatus === 'approved'
  );

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/?seller=${seller.id}`;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#8c6b53]">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#943310] transition-colors"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <button
          type="button"
          onClick={() => setActivePage('sellers')}
          className="hover:text-[#943310] transition-colors"
        >
          دليل الحرفيين
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="text-gray-900 font-bold">{seller.brandName}</span>
      </nav>

      {/* Workshop Header & Profile Banner */}
      <div className="bg-white rounded-3xl border border-[#ebdccd] shadow-lg overflow-hidden">
        {/* Cover Banner */}
        <div className="relative h-48 sm:h-64 w-full bg-[#f4ebe1]">
          <img src={seller.coverImage} alt={seller.brandName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Governorate tag & Share */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="bg-[#943310] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>محافظة {seller.governorate}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="absolute top-4 left-4 p-2.5 rounded-full bg-white/80 hover:bg-white text-gray-800 backdrop-blur-md shadow-sm transition-all"
            title="مشاركة رابط الورشة"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Details Bar */}
        <div className="p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-14 sm:-mt-20 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-right gap-4">
              <div className="relative shrink-0">
                <img
                  src={seller.avatar}
                  alt={seller.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-xl"
                />
                {seller.verified && (
                  <div className="absolute -bottom-1 -left-1 bg-emerald-600 text-white rounded-full p-1 shadow-md">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-heritage">
                  {seller.brandName}
                </h1>
                <p className="text-xs sm:text-sm text-[#8c6b53] font-semibold mt-0.5">
                  الصانع: {seller.name} • تخصص: {seller.specialty}
                </p>
              </div>
            </div>

            {/* Performance metrics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="bg-[#faf6f0] border border-[#ebdccd] px-3 sm:px-4 py-2 rounded-2xl text-center">
                <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-xs sm:text-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{seller.rating}</span>
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">تقييم المتسوقين</span>
              </div>

              <div className="bg-[#faf6f0] border border-[#ebdccd] px-3 sm:px-4 py-2 rounded-2xl text-center">
                <span className="font-bold text-xs sm:text-sm text-[#943310] block">{seller.salesCount}+</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">قطعة تم شحنها</span>
              </div>

              <div className="bg-[#faf6f0] border border-[#ebdccd] px-3 sm:px-4 py-2 rounded-2xl text-center">
                <span className="font-bold text-xs sm:text-sm text-gray-900 block">{seller.productsCount}</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">منتجات معروضة</span>
              </div>
            </div>
          </div>

          {/* Artisan Story / Bio */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-[#f0e4d7]">
            <div className="lg:col-span-8 space-y-3">
              <h3 className="text-sm font-bold text-[#943310] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>عن الورشة وتاريخ الصنعة</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {seller.bio}
              </p>
            </div>

            {/* Contact / Workshop Info */}
            <div className="lg:col-span-4 bg-[#faf6f0] p-4 rounded-2xl border border-[#ebdccd] space-y-2 text-xs text-gray-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>عضو معتمد في منصة وه منذ {seller.joinedDate?.slice(0, 4) || '2023'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-700" />
                <span dir="ltr">{seller.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#943310]" />
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
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-heritage">
              معروضات ومصنوعات {seller.brandName}
            </h2>
            <p className="text-xs text-[#8c6b53] mt-0.5">
              جميع القطع متوفرة للشحن المباشر من الورشة في {seller.governorate}
            </p>
          </div>
          <span className="text-xs font-bold text-[#943310]">
            {sellerProducts.length} منتجات متاحة
          </span>
        </div>

        {sellerProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#ebdccd] p-12 text-center">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h4 className="font-bold text-gray-700 text-sm">لا توجد منتجات منشورة حالياً لهذه الورشة</h4>
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
