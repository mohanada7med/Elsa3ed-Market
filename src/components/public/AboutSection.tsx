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
    <section
      dir="rtl"
      className="
        relative
        overflow-hidden
        py-20
        sm:py-24
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors duration-500
        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
        border-t border-black/10
        dark:border-white/10
      "
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#9a6a35]/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="relative max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">

        {/* Intro Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 sm:mb-16">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#9a6a35] text-xs font-bold backdrop-blur-md shadow-sm mb-5">
            <span>وه | WAH</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-serif leading-tight tracking-tight">
            الصعيد مش مجرد مكان...
            <br />
            <span className="text-[#9a6a35]">
              الصعيد حكاية
            </span>
          </h2>

          <p className="mt-5 text-sm sm:text-base leading-8 text-black/60 dark:text-white/60">
            وه هي المساحة الرقمية اللي بتجمع روح الصعيد في مكان واحد؛
            ناسه، بلادُه، حرفُه، أكله، حكاياته، تراثه وأسواقه.
            بنوثّق الحكاية، ونقرّبك من أصحابها، ونخليك تعيش الصعيد من جوّه.
          </p>
        </div>

        {/* Main Experience */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Visual Story */}
          <div className="lg:col-span-5 relative min-h-[420px]">

            <div className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-[#151513]">

              <img
                src="https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png"
                alt="وه - العالم الرقمي لصعيد مصر"
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white">

                <span className="inline-flex items-center gap-2 text-amber-300 text-xs font-bold mb-3">
                  <MapPin className="w-4 h-4" />
                  من الفيوم لأسوان
                </span>

                <h3 className="text-2xl sm:text-3xl font-black font-serif leading-tight">
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
            <div className="absolute -bottom-5 -left-3 sm:-left-5 bg-[#211d18] text-white dark:bg-white dark:text-black px-4 py-3 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3 backdrop-blur-xl">
              <div className="w-10 h-10 rounded-xl bg-white/10 dark:bg-black/10 flex items-center justify-center font-black font-serif text-lg">
                وه
              </div>

              <div>
                <div className="text-xs font-black">
                  WAH
                </div>
                <div className="text-[10px] text-white/75 dark:text-black/75">
                  كل حكاية ليها أصل
                </div>
              </div>
            </div>
          </div>

          {/* Platform Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-7">

              <div className="group p-4 rounded-2xl bg-white/75 dark:bg-[#151513]/90 border border-black/10 dark:border-white/10 hover:border-[#9a6a35]/50 transition-all backdrop-blur-xl">
                <MapPin className="w-5 h-5 text-[#9a6a35] mb-3" />
                <h4 className="text-xs font-black">
                  أماكن
                </h4>
                <p className="text-[10px] text-black/50 dark:text-white/50 mt-1">
                  بلاد ومعالم وحكايات
                </p>
              </div>

              <div className="group p-4 rounded-2xl bg-white/75 dark:bg-[#151513]/90 border border-black/10 dark:border-white/10 hover:border-[#9a6a35]/50 transition-all backdrop-blur-xl">
                <Users className="w-5 h-5 text-[#9a6a35] mb-3" />
                <h4 className="text-xs font-black">
                  ناس
                </h4>
                <p className="text-[10px] text-black/50 dark:text-white/50 mt-1">
                  وجوه وشيوخ وأساطوات
                </p>
              </div>

              <div className="group p-4 rounded-2xl bg-white/75 dark:bg-[#151513]/90 border border-black/10 dark:border-white/10 hover:border-[#9a6a35]/50 transition-all backdrop-blur-xl">
                <Sparkles className="w-5 h-5 text-[#9a6a35] mb-3" />
                <h4 className="text-xs font-black">
                  حرف
                </h4>
                <p className="text-[10px] text-black/50 dark:text-white/50 mt-1">
                  صنعة متوارثة وحرفة حية
                </p>
              </div>

              <div className="group p-4 rounded-2xl bg-white/75 dark:bg-[#151513]/90 border border-black/10 dark:border-white/10 hover:border-[#9a6a35]/50 transition-all backdrop-blur-xl">
                <BookOpen className="w-5 h-5 text-[#9a6a35] mb-3" />
                <h4 className="text-xs font-black">
                  حكايات
                </h4>
                <p className="text-[10px] text-black/50 dark:text-white/50 mt-1">
                  مرويات وذاكرة المكان
                </p>
              </div>

              <div className="group p-4 rounded-2xl bg-white/75 dark:bg-[#151513]/90 border border-black/10 dark:border-white/10 hover:border-[#9a6a35]/50 transition-all backdrop-blur-xl">
                <Utensils className="w-5 h-5 text-[#9a6a35] mb-3" />
                <h4 className="text-xs font-black">
                  أكل
                </h4>
                <p className="text-[10px] text-black/50 dark:text-white/50 mt-1">
                  طعم الصعيد وأكلاته
                </p>
              </div>

              <div className="group p-4 rounded-2xl bg-white/75 dark:bg-[#151513]/90 border border-black/10 dark:border-white/10 hover:border-[#9a6a35]/50 transition-all backdrop-blur-xl">
                <Store className="w-5 h-5 text-[#9a6a35] mb-3" />
                <h4 className="text-xs font-black">
                  سوق
                </h4>
                <p className="text-[10px] text-black/50 dark:text-white/50 mt-1">
                  من الصانع لبيتك
                </p>
              </div>

            </div>

            {/* Mission */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#211d18] dark:bg-[#151513] text-white border border-white/10 relative overflow-hidden shadow-xl">

              <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-[#9a6a35]/20 blur-2xl" />

              <div className="relative">

                <span className="text-[11px] font-black text-amber-300">
                  رؤيتنا
                </span>

                <h3 className="mt-2 text-xl sm:text-2xl font-black font-serif">
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
                className="group px-5 py-3.5 rounded-xl bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-black shadow-lg flex items-center justify-center gap-2 transition-all min-h-[46px] cursor-pointer"
              >
                <Film className="w-4 h-4" />
                مشاهدة حكاية وه
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                id="about-explore-sellers-btn"
                onClick={() => setActivePage('sellers')}
                className="px-5 py-3.5 rounded-xl bg-white/80 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-[#211d18] dark:text-white border border-black/10 dark:border-white/10 text-xs font-black transition-all min-h-[46px] flex items-center justify-center gap-2 cursor-pointer backdrop-blur-xl"
              >
                <Store className="w-4 h-4" />
                اكتشف صُنّاع الصعيد
              </button>

            </div>

          </div>
        </div>

        {/* Bottom Statement */}
        <div className="mt-16 text-center">

          <div className="inline-flex items-center gap-3 text-black/40 dark:text-white/40">
            <span className="w-12 h-px bg-black/10 dark:bg-white/10" />

            <span className="text-xs font-black">
              كل حكاية ليها أصل
            </span>

            <span className="w-12 h-px bg-black/10 dark:bg-white/10" />
          </div>

        </div>

      </div>
    </section>
  );
};