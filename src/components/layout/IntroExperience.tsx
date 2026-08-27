import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Volume2, VolumeX, ArrowLeft, Sparkles, X, Compass, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const IntroExperience: React.FC = () => {
  const { showIntroVideo, dismissIntroVideo, setActivePage } = useApp();
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  if (!showIntroVideo) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="intro-video-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#18110b]/90 backdrop-blur-md p-4 sm:p-6"
      >
        <div className="relative w-full max-w-4xl bg-[#231a14] border border-[#d97706]/30 rounded-2xl overflow-hidden shadow-2xl text-white">
          {/* Header controls inside modal */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-medium text-amber-200">فيلم وثائقي: أصالة الصعيد</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="intro-mute-toggle"
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 bg-black/50 hover:bg-black/80 rounded-full border border-white/10 text-white transition-colors"
                title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
                aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>
              <button
                type="button"
                id="intro-close-btn"
                onClick={dismissIntroVideo}
                className="p-2 bg-black/50 hover:bg-black/80 rounded-full border border-white/10 text-white transition-colors"
                title="تخطي ودخول السوق"
                aria-label="تخطي ودخول السوق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Video or Simulated Cinematic Video Player */}
          <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
            {/* Background looping visual montage */}
            <video
              className="w-full h-full object-cover opacity-80"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              poster="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80"
            >
              {/* Fallback to online cinematic video or poster */}
              <source
                src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-potter-shaping-a-clay-pot-42930-large.mp4"
                type="video/mp4"
              />
            </video>

            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#231a14] via-black/30 to-black/60 pointer-events-none" />

            {/* Center Story Highlights */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 pointer-events-none">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>رحلة في قلب الجنوب المصري</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                  سوق الصعيد — من يد الصانع إلى باب بيتك
                </h2>
                <p className="text-sm sm:text-base text-[#e5d5c5] leading-relaxed line-clamp-2 sm:line-clamp-3 mb-6">
                  نحن نوثق ونجمع أندر الحرف اليدوية والمنتجات التراثية من قنا وسوهاج وأسوان وأسيوط والأقصر. فخار النيل الأصيل، كليم أخميم الصوفي، عسل السدر، وتلي أسيوط المعتق.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 sm:p-6 bg-[#1a120c] border-t border-[#3d2e22] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-amber-200/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>حرفيون حقيقيون موثقون</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-amber-400/40" />
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>شحن آمن لكافة المحافظات</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                id="intro-skip-btn"
                onClick={dismissIntroVideo}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/10 text-sm font-medium transition-colors text-center"
              >
                تخطي والمتابعة كزائر
              </button>
              <button
                type="button"
                id="intro-explore-btn"
                onClick={() => {
                  dismissIntroVideo();
                  setActivePage('products');
                }}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c25e2e] to-[#b45309] hover:from-[#d97706] hover:to-[#92400e] text-white text-sm font-bold shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 transition-all"
              >
                <span>استكشف المنتجات التراثية</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
