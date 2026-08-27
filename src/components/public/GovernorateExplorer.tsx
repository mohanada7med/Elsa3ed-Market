import React from 'react';
import { useApp } from '../../context/AppContext';
import { Governorate } from '../../types';
import { MapPin, Sparkles, ArrowLeft } from 'lucide-react';

interface GovItem {
  name: Governorate;
  famousCraft: string;
  famousItem: string;
  count: number;
  bgGradient: string;
  iconImage: string;
}

const UPPER_EGYPT_GOVERNORATES: GovItem[] = [
  {
    name: 'أسوان',
    famousCraft: 'خيرات النوبة والخوص',
    famousItem: 'تمور مجدول وكركديه وبخور',
    count: 0,
    bgGradient: 'from-[#78350f] to-[#d97706]',
    iconImage: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'الأقصر',
    famousCraft: 'النحاسيات والألاباستر',
    famousItem: 'صواني النحاس وأواني الخشب',
    count: 0,
    bgGradient: 'from-[#652b19] to-[#9a3412]',
    iconImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'قنا',
    famousCraft: 'الفخار وطين النيل',
    famousItem: 'القِلال وقواديس الفخار',
    count: 0,
    bgGradient: 'from-[#8c3512] to-[#b45309]',
    iconImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'سوهاج',
    famousCraft: 'أنوال أخميم التراثية',
    famousItem: 'كليم الصوف والحرير',
    count: 0,
    bgGradient: 'from-[#9a3412] to-[#c2410c]',
    iconImage: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'أسيوط',
    famousCraft: 'تلي أسيوط والحرير',
    famousItem: 'تطريز الفضة وطواجن الفخار',
    count: 0,
    bgGradient: 'from-[#831843] to-[#9f1239]',
    iconImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'المنيا',
    famousCraft: 'عسل السدر والزراعة العضوية',
    famousItem: 'عسل جبلي وأعشاب برية',
    count: 0,
    bgGradient: 'from-[#14532d] to-[#15803d]',
    iconImage: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=300&q=80'
  }
];

export const GovernorateExplorer: React.FC = () => {
  const { sellers, products, setSelectedGovernorateFilter, setActivePage } = useApp();

  const handleSelectGov = (gov: Governorate) => {
    setSelectedGovernorateFilter(gov);
    setActivePage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#943310]/10 text-[#943310] text-xs font-bold mb-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>خريطة محافظات الصعيد</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-heritage">
          تسوّق بحسب محافظة المنشأ
        </h2>
        <p className="text-xs sm:text-sm text-[#8c6b53] mt-1">
          كل محافظة في صعيد مصر تشتهر بصنعة فريدة توارثتها أجيالها عبر آلاف السنين
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {UPPER_EGYPT_GOVERNORATES.map((gov) => {
          const govSellers = sellers.filter(
            (s) => s.governorate === gov.name && s.status !== 'rejected' && s.status !== 'suspended'
          );
          const govProducts = products.filter(
            (p) =>
              (p.sellerGovernorate === gov.name || p.specifications?.originGovernorate === gov.name) &&
              p.approvalStatus === 'approved'
          );
          const sellersCount = govSellers.length;
          const productsCount = govProducts.length;

          return (
            <div
              key={gov.name}
              id={`gov-card-${gov.name}`}
              onClick={() => handleSelectGov(gov.name)}
              className="group cursor-pointer rounded-2xl bg-white border border-[#ebdccd] hover:border-[#943310] p-4 text-center transition-all duration-300 shadow-xs hover:shadow-md flex flex-col items-center justify-between"
            >
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden mb-3 border border-amber-900/10 shadow-xs group-hover:scale-105 transition-transform">
                <img src={gov.iconImage} alt={gov.name} className="w-full h-full object-cover" />
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#943310] transition-colors">
                  محافظة {gov.name}
                </h3>
                <p className="text-[11px] font-bold text-[#943310] mt-0.5">{gov.famousCraft}</p>
                <p className="text-[10px] text-[#8c6b53] mt-1 leading-tight">{gov.famousItem}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#f0e4d7] w-full text-[10px] text-gray-500 font-medium flex items-center justify-between gap-1 group-hover:text-[#943310]">
                <div className="flex items-center gap-1 truncate text-right">
                  <span className="font-bold text-[#943310]">
                    {sellersCount > 0
                      ? `${sellersCount} ${sellersCount === 1 ? 'مقدم خدمة' : 'مقدمي خدمات'}`
                      : 'بانتظار ورش'}
                  </span>
                  {productsCount > 0 && (
                    <span className="text-[9px] text-gray-400 font-normal">
                      ({productsCount} منتج)
                    </span>
                  )}
                </div>
                <ArrowLeft className="w-2.5 h-2.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#943310]" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
