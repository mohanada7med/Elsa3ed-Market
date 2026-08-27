import React from 'react';
import { useApp } from '../../context/AppContext';
import { Store, Star, MapPin, CheckCircle2, ArrowLeft } from 'lucide-react';

export const FeaturedSellers: React.FC = () => {
  const { sellers, navigateToSeller, setActivePage } = useApp();

  if (sellers.length === 0) {
    return null;
  }

  return (
    <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#943310] mb-1">
            <Store className="w-4 h-4" />
            <span>حرفيو الصعيد وشيوخ الصنعة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-heritage">
            الورش والتعاونيات الحرفية المعتمدة
          </h2>
          <p className="text-xs sm:text-sm text-[#8c6b53] mt-1">
            تعرف على صانعي الجمال واطلع على ورشهم وقصص كفاحهم المتوارثة
          </p>
        </div>

        <button
          type="button"
          id="view-all-sellers-btn"
          onClick={() => setActivePage('sellers')}
          className="text-xs sm:text-sm font-bold text-[#943310] hover:text-[#7c280a] flex items-center gap-1.5 self-start sm:self-auto hover:underline min-h-[40px]"
        >
          <span>عرض كافة الورش والحرفيين</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Sellers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.slice(0, 6).map((seller) => (
          <div
            key={seller.id}
            id={`seller-card-${seller.id}`}
            onClick={() => navigateToSeller(seller.id)}
            className="clay-card overflow-hidden cursor-pointer group bg-white border border-[#ebdccd] flex flex-col"
          >
            {/* Cover Image */}
            <div className="relative h-32 w-full overflow-hidden bg-[#f4ebe1]">
              <img
                src={seller.coverImage}
                alt={seller.brandName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute top-2.5 right-2.5">
                <span className="bg-[#943310] text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>محافظة {seller.governorate}</span>
                </span>
              </div>
            </div>

            {/* Avatar & Content */}
            <div className="p-5 pt-0 flex-1 flex flex-col justify-between relative">
              <div>
                {/* Avatar Offset */}
                <div className="relative -mt-10 mb-3 flex items-end justify-between">
                  <div className="relative">
                    <img
                      src={seller.avatar}
                      alt={seller.name}
                      className="w-16 h-16 rounded-2xl object-cover border-3 border-white shadow-md"
                    />
                    {seller.verified && (
                      <div className="absolute -bottom-1 -left-1 bg-emerald-600 text-white rounded-full p-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-900">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{seller.rating}</span>
                    <span className="text-[10px] text-gray-400 font-normal">({seller.salesCount} مبيعة)</span>
                  </div>
                </div>

                {/* Seller Brand & Name */}
                <h3 className="font-bold text-gray-900 text-base group-hover:text-[#943310] transition-colors leading-tight">
                  {seller.brandName}
                </h3>
                <p className="text-xs text-[#8c6b53] font-medium mt-0.5">{seller.name}</p>

                <p className="text-xs text-gray-600 mt-2.5 line-clamp-2 leading-relaxed">
                  {seller.bio}
                </p>
              </div>

              {/* Footer info */}
              <div className="mt-4 pt-3 border-t border-[#f0e4d7] flex items-center justify-between text-xs">
                <span className="text-[#943310] font-bold bg-[#faf6f0] px-2 py-0.5 rounded text-[11px]">
                  {seller.specialty}
                </span>
                <span className="text-gray-500 font-medium text-[11px]">
                  {seller.productsCount} منتجات معروضة
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
