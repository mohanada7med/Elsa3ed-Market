import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  HeartHandshake,
  Sparkles,
  MapPin,
  Film,
  Users,
  Store,
  BookOpen,
  Utensils,
  ArrowLeft,
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { setShowIntroVideo, setActivePage } = useApp();

  return (
    <section className="relative overflow-hidden py-20 sm:py-24 bg-[#FAF7F2] dark:bg-[#110E0C] border-t border-[#ebdccd] dark:border-[#352B24] transition-colors duration-300">

      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#B24C2B]/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Intro Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 sm:mb-16">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B24C2B]/10 dark:bg-[#E0633C]/10 text-[#943310] dark:text-[#E0633C] text-xs font-black mb-5">
            <span>وه | WAH</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[#241C17] dark:text-[#F7F3EE] font-heritage leading-tight">
            الصعيد مش مجرد مكان...
            <br />
            <span className="text-[#B24C2B] dark:text-[#E0633C]">
              الصعيد حكاية
            </span>
          </h2>

          <p className="mt-5 text-sm sm:text-base leading-8 text-[#6E5F52] dark:text-[#A8988B]">
            وه هي المساحة الرقمية اللي بتجمع روح الصعيد في مكان واحد؛
            ناسه، بلادُه، حرفُه، أكله، حكاياته، تراثه وأسواقه.
            بنوثّق الحكاية، ونقرّبك من أصحابها، ونخليك تعيش الصعيد من جوّه.
          </p>
        </div>

        {/* Main Experience */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Visual Story */}
          <div className="lg:col-span-5 relative min-h-[420px]">

            <div className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-[#1B1613]">

              <img
                src="https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png"
                alt="وه - العالم الرقمي لصعيد مصر"
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white">

                <span className="inline-flex items-center gap-2 text-amber-300 text-xs font-black mb-3">
                  <MapPin className="w-4 h-4" />
                  من الفيوم لأسوان
                </span>

                <h3 className="text-2xl sm:text-3xl font-black font-heritage leading-tight">
                  كل مكان هنا
                  <br />
                  وراه حكاية.
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-white/75 leading-6">
                  اكتشف الصعيد من خلال ناسه وأماكنه وحرفه وحكاياته.
                </p>
              </div>
            </div>

            {/* Floating Brand Card */}
            <div className="absolute -bottom-5 -left-3 sm:-left-5 bg-[#B24C2B] text-white px-4 py-3 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black font-heritage text-lg">
                وه
              </div>

              <div>
                <div className="text-xs font-black">
                  WAH
                </div>
                <div className="text-[10px] text-white/75">
                  كل حكاية ليها أصل
                </div>
              </div>
            </div>
          </div>

          {/* Platform Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-7">

              <div className="group p-4 rounded-2xl bg-white dark:bg-[#1B1613] border border-[#ebdccd] dark:border-[#352B24] hover:border-[#B24C2B]/50 transition-all">
                <MapPin className="w-5 h-5 text-[#B24C2B] mb-3" />
                <h4 className="text-xs font-black text-[#2C211B] dark:text-[#F7F3EE]">
                  أماكن
                </h4>
                <p className="text-[10px] text-[#8C7A6B] mt-1">
                  بلاد ومعالم وحكايات
                </p>
              </div>

              <div className="group p-4 rounded-2xl bg-white dark:bg-[#1B1613] border border-[#ebdccd] dark:border-[#352B24] hover:border-[#B24C2B]/50 transition-all">
                <Users className="w-5 h-5 text-[#B24C2B] mb-3" />
                <h4 className="text-xs font-black text-[#2C211B] dark:text-[#F7F3EE]">
                  ناس
                </h4>
                <p className="text-[10px] text-[#8C7A6B] mt-1">
                  وجوه وشيوخ وأساطوات
                </p>
              </div>

              <div className="group p-4 rounded-2xl bg-white dark:bg-[#1B1613] border border-[#ebdccd] dark:border-[#352B24] hover:border-[#B24C2B]/50 transition-all">
                <Sparkles className="w-5 h-5 text-[#B24C2B] mb-3" />
                <h4 className="text-xs font-black text-[#2C211B] dark:text-[#F7F3EE]">
                  حرف
                </h4>
                <p className="text-[10px] text-[#8C7A6B] mt-1">
                  صنعة متوارثة وحرفة حية
                </p>
              </div>

              <div className="group p-4 rounded-2xl bg-white dark:bg-[#1B1613] border border-[#ebdccd] dark:border-[#352B24] hover:border-[#B24C2B]/50 transition-all">
                <BookOpen className="w-5 h-5 text-[#B24C2B] mb-3" />
                <h4 className="text-xs font-black text-[#2C211B] dark:text-[#F7F3EE]">
                  حكايات
                </h4>
                <p className="text-[10px] text-[#8C7A6B] mt-1">
                  مرويات وذاكرة المكان
                </p>
              </div>

              <div className="group p-4 rounded-2xl bg-white dark:bg-[#1B1613] border border-[#ebdccd] dark:border-[#352B24] hover:border-[#B24C2B]/50 transition-all">
                <Utensils className="w-5 h-5 text-[#B24C2B] mb-3" />
                <h4 className="text-xs font-black text-[#2C211B] dark:text-[#F7F3EE]">
                  أكل
                </h4>
                <p className="text-[10px] text-[#8C7A6B] mt-1">
                  طعم الصعيد وأكلاته
                </p>
              </div>

              <div className="group p-4 rounded-2xl bg-white dark:bg-[#1B1613] border border-[#ebdccd] dark:border-[#352B24] hover:border-[#B24C2B]/50 transition-all">
                <Store className="w-5 h-5 text-[#B24C2B] mb-3" />
                <h4 className="text-xs font-black text-[#2C211B] dark:text-[#F7F3EE]">
                  سوق
                </h4>
                <p className="text-[10px] text-[#8C7A6B] mt-1">
                  من الصانع لبيتك
                </p>
              </div>

            </div>

            {/* Mission */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#241C17] dark:bg-[#1B1613] text-white relative overflow-hidden">

              <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-[#B24C2B]/20 blur-2xl" />

              <div className="relative">

                <span className="text-[11px] font-black text-amber-300">
                  رؤيتنا
                </span>

                <h3 className="mt-2 text-xl sm:text-2xl font-black font-heritage">
                  نخلي الصعيد أقرب...
                  <span className="text-amber-300">
                    وأصله أوضح.
                  </span>
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-white/65 leading-7">
                  من أول مكان في البلد، لآخر حكاية عند الأسطى،
                  وه بتبني مساحة رقمية تحفظ التراث، وتعرّف الناس بيه،
                  وتفتح الطريق بين صانع التراث وكل اللي بيقدّره.
                </p>

              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-5">

              <button
                type="button"
                id="about-watch-film-btn"
                onClick={() => setShowIntroVideo(true)}
                className="group px-5 py-3.5 rounded-xl bg-[#B24C2B] hover:bg-[#943310] text-white text-xs font-black shadow-lg flex items-center justify-center gap-2 transition-all min-h-[46px] cursor-pointer"
              >
                <Film className="w-4 h-4" />
                مشاهدة حكاية وه
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                id="about-explore-sellers-btn"
                onClick={() => setActivePage('sellers')}
                className="px-5 py-3.5 rounded-xl bg-white dark:bg-[#1B1613] hover:bg-[#F3EBDD] dark:hover:bg-[#26201B] text-[#2C211B] dark:text-white border border-[#dfcebe] dark:border-[#352B24] text-xs font-black transition-all min-h-[46px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Store className="w-4 h-4" />
                اكتشف صُنّاع الصعيد
              </button>

            </div>

          </div>
        </div>

        {/* Bottom Statement */}
        <div className="mt-16 text-center">

          <div className="inline-flex items-center gap-3 text-[#8C7A6B] dark:text-[#A8988B]">
            <span className="w-12 h-px bg-[#D8C9BA] dark:bg-[#493B31]" />

            <span className="text-xs font-black">
              كل حكاية ليها أصل
            </span>

            <span className="w-12 h-px bg-[#D8C9BA] dark:bg-[#493B31]" />
          </div>

        </div>

      </div>
    </section>
  );
};