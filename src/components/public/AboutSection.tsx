import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, HeartHandshake, Sparkles, MapPin, Film, Users, Award } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { setShowIntroVideo, setActivePage } = useApp();

  return (
    <section className="py-16 bg-[#faf6f0] border-t border-[#ebdccd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Image Collage */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://res.cloudinary.com/kuana1nl/image/upload/v1787864171/elsa3ed_market2.png"
                alt="شيوخ الصنعة في صعيد مصر"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute bottom-6 right-6 left-6 text-white text-right">
                <span className="text-amber-300 font-bold text-xs uppercase tracking-wider block mb-1">
                  عراقة متوارثة منذ آلاف السنين
                </span>
                <h4 className="text-xl font-bold font-heritage leading-tight">
                  "صنعة في اليد أمان من الفقر وعمار للبلاد"
                </h4>
                <p className="text-xs text-amber-100/80 mt-1">مثل صعيدي أصيل يجسد روح العمل والإتقان</p>
              </div>
            </div>

            {/* Floating Experience Box */}
            <div className="absolute -bottom-5 left-2 sm:left-6 bg-[#943310] text-white p-3.5 sm:p-4 rounded-2xl shadow-xl border-2 border-amber-300/30 flex items-center gap-3 max-w-[calc(100%-1rem)]">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-amber-300 text-sm shrink-0 font-heritage">
                وه
              </div>
              <div className="text-right">
                <span className="text-xs font-bold block">منصة وه | WAH</span>
                <span className="text-[11px] text-amber-200">العالم الرقمي لصعيد مصر • كل حكاية ليها أصل</span>
              </div>
            </div>
          </div>

          {/* Right Column: Mission & Principles */}
          <div className="lg:col-span-7 space-y-6 text-right">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#943310]/10 text-[#943310] text-xs font-bold">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>عن منصة وه (WAH)</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 font-heritage leading-tight">
              جسر يربط بين ورش وثقافة الصعيد العريقة <br />
              <span className="text-[#943310]">وبين كل عاشق للأصالة والتراث</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#614b3d] leading-relaxed">
              انطلقت <strong>منصة وه (WAH)</strong> كعالم رقمي جامع لاكتشاف وتوثيق وربط تراث وثقافة ومحافظات وحرف وأكلات وناس صعيد مصر، ودعم الحرفيين وشيوخ الصنعة والنساء المعيلات في قرى ونجوع محافظات الصعيد (أسوان، الأقصر، قنا، سوهاج، أسيوط، المنيا، والوادي الجديد)، بجانب سوق وه المعتمد لتسوق الحرف الأصيلة مباشرة من صناعها.
            </p>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-white p-4 rounded-2xl border border-[#ebdccd] shadow-xs text-right">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#943310] flex items-center justify-center mb-2.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-gray-900 mb-1">أصالة بدون وسطاء</h4>
                <p className="text-[11px] text-[#8c6b53] leading-relaxed">
                  تشتري مباشرة من صانع القطعة الحقيقي لضمان أفضل سعر وأعلى عائد للحرفي.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#ebdccd] shadow-xs text-right">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#943310] flex items-center justify-center mb-2.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-gray-900 mb-1">تغليف فخار مصفح</h4>
                <p className="text-[11px] text-[#8c6b53] leading-relaxed">
                  نظام حماية وتغليف معتمد للأواني الفخارية والقطع القابلة للكسر حتى الاستلام.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#ebdccd] shadow-xs text-right">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#943310] flex items-center justify-center mb-2.5">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-gray-900 mb-1">تمكين الأسر المنتجة</h4>
                <p className="text-[11px] text-[#8c6b53] leading-relaxed">
                  أكثر من 65% من حرفيي المنصة نساء معيلات وتعاونيات قرى صعيدية مكافحة.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              <button
                type="button"
                id="about-watch-film-btn"
                onClick={() => setShowIntroVideo(true)}
                className="px-5 py-3 rounded-xl bg-[#943310] hover:bg-[#7c280a] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-colors min-h-[44px]"
              >
                <Film className="w-4 h-4" />
                <span>مشاهدة الفيلم الوثائقي للمنصة</span>
              </button>

              <button
                type="button"
                id="about-explore-sellers-btn"
                onClick={() => setActivePage('sellers')}
                className="px-5 py-3 rounded-xl bg-white hover:bg-[#f3ebd9] text-gray-800 border border-[#dfcebe] text-xs font-bold shadow-xs transition-colors text-center min-h-[44px] flex items-center justify-center"
              >
                دليل ورش الحرفيين
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
