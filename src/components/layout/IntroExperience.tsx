import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Volume2, VolumeX, ArrowLeft, Sparkles, X, Compass, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const IntroExperience: React.FC = () => {
  const { showIntroVideo, dismissIntroVideo, setActivePage } = useApp();
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  if (!showIntroVideo) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="intro-video-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#18110b]/90 backdrop-blur-md p-2.5 sm:p-6 overflow-y-auto"
      >
        <div className="relative w-full max-w-4xl bg-[#231a14] border border-[#d97706]/30 rounded-2xl overflow-hidden shadow-2xl text-white max-h-[92vh] overflow-y-auto my-auto">
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
                className="p-2 bg-black/50 hover:bg-black/80 rounded-full border border-white/10 text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
                aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>
              <button
                type="button"
                id="intro-close-btn"
                onClick={dismissIntroVideo}
                className="p-2 bg-black/50 hover:bg-black/80 rounded-full border border-white/10 text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="تخطي ودخول السوق"
                aria-label="تخطي ودخول السوق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Video or Simulated Cinematic Video Player */}
          <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
            {/* Background looping visual montage */}
            <video
              className="w-full h-full object-cover opacity-100"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              poster="https://res.cloudinary.com/kuana1nl/video/upload/v1787870212/%D8%B9%D8%A7%D9%8A%D8%B2%D9%87_%D9%8A%D9%83%D9%88%D9%86_%D8%AB%D8%A7%D9%86%D9%8A%D9%87.mp4"
            >
              {/* Fallback to online cinematic video or poster */}
              <source
                src="https://res.cloudinary.com/kuana1nl/video/upload/v1787870212/%D8%B9%D8%A7%D9%8A%D8%B2%D9%87_%D9%8A%D9%83%D9%88%D9%86_%D8%AB%D8%A7%D9%86%D9%8A%D9%87.mp4"
                type="video/mp4"
              />
            </video>

            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#231a14] via-black/1 to-black/2 pointer-events-none" />

            {/* Center Story Highlights */}

          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 sm:p-6 bg-[#1a120c] border-t border-[#3d2e22] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-amber-200/80">
              <div className="flex items-center gap-1.5">
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">

              <button
                type="button"
                id="intro-explore-btn"
                onClick={() => {
                  dismissIntroVideo();
                  setActivePage('products');
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c25e2e] to-[#b45309] hover:from-[#d97706] hover:to-[#92400e] text-white text-xs sm:text-sm font-bold shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 transition-all min-h-[44px]"
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
