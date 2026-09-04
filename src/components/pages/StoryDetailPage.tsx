import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { WahStory } from '../../types';
import {
  BookOpen,
  MapPin,
  Volume2,
  VolumeX,
  ArrowLeft,
  Share2,
  ChevronLeft,
  Sparkles,
  Quote,
  Clock
} from 'lucide-react';

export const StoryDetailPage: React.FC = () => {
  const {
    selectedStorySlug,
    navigateToGovernorate,
    navigateToStory,
    setActivePage,
    addToast
  } = useApp();

  const [story, setStory] = useState<WahStory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const slug = selectedStorySlug || 'sirah-hilaliyya';

  useEffect(() => {
    const fetchStory = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getStoryBySlug(slug);
        if (data) {
          setStory(data);
        }
      } catch (err) {
        console.warn('Could not load story details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStory();
  }, [slug]);

  const handleShare = () => {
    const url = `${window.location.origin}/stories?slug=${encodeURIComponent(slug)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      addToast('تم نسخ الرابط', 'تم نسخ رابط الحكاية بنجاح', 'success');
    }
  };

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      addToast('وضع القراءة الصوتية', 'تم تشغيل تلاوة الحكاية بالصوت الصعيدي الأصيل', 'info');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#B45F42] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-[#7A6F64]">جاري فتح سجل الحكايات...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">الحكاية غير موجودة</h2>
          <p className="text-sm text-[#7A6F64] mb-4">لم نتمكن من العثور على نص هذه الحكاية</p>
          <button
            onClick={() => setActivePage('stories')}
            className="px-5 py-2.5 rounded-xl bg-[#B45F42] text-white font-bold text-sm"
          >
            العودة لكافة الحكايات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] text-[#29221D] dark:text-[#FAF6F2] font-sans pb-16">
      {/* Article Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Top Controls */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            type="button"
            onClick={() => setActivePage('stories')}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#665A4F] dark:text-[#A89C90] hover:text-[#B45F42] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>كافة حكايات «وه بيحكي»</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : 'bg-white dark:bg-[#1E1917] text-[#29221D] dark:text-[#FAF6F2] border border-[#E8E1D9] dark:border-[#382E27]'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#B45F42]" />}
              <span>{isPlayingAudio ? 'إيقاف السرد' : 'استمع للحكاية'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-white dark:bg-[#1E1917] text-[#29221D] dark:text-[#FAF6F2] border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] transition-colors cursor-pointer"
              title="مشاركة الحكاية"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Story Header Card */}
        <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-10 border border-[#E8E1D9] dark:border-[#382E27] shadow-sm mb-8">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold">
              {story.category}
            </span>
            <button
              onClick={() => navigateToGovernorate(story.governorateId || 'qena')}
              className="px-3 py-1 rounded-full bg-[#FAF6F0] dark:bg-[#25201D] text-[#7A6F64] hover:text-[#B45F42] text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#B45F42]" />
              <span>محافظة {story.governorateName}</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif text-[#29221D] dark:text-[#FAF6F2] mb-4 leading-tight">
            {story.title}
          </h1>

          {story.excerpt && (
            <p className="text-base sm:text-lg font-serif text-[#B45F42] dark:text-[#FF855D] italic mb-6 leading-relaxed">
              «{story.excerpt}»
            </p>
          )}

          {story.narrator && (
            <div className="pt-4 border-t border-[#F0EAE1] dark:border-[#2D2622] flex items-center justify-between text-xs text-[#7A6F64]">
              <span>راوي الرواية الشفاهية: <strong>{story.narrator}</strong></span>
              <span className="flex items-center gap-1 font-serif">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>توثيق منصة وه</span>
              </span>
            </div>
          )}
        </div>

        {/* Story Content Prose */}
        <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-10 border border-[#E8E1D9] dark:border-[#382E27] shadow-sm mb-8">
          <div className="prose dark:prose-invert max-w-none text-base sm:text-lg font-serif leading-loose text-[#29221D] dark:text-[#FAF6F2] whitespace-pre-line space-y-6">
            {story.content}
          </div>

          {/* Cultural Moral Quote */}
          {story.culturalSignificance && (
            <div className="mt-8 p-6 rounded-2xl bg-[#FAF6F0] dark:bg-[#25201D] border border-amber-300 dark:border-amber-800/40 relative">
              <Quote className="w-8 h-8 text-amber-500/40 absolute top-4 left-4" />
              <h4 className="text-sm font-bold font-sans text-amber-800 dark:text-amber-300 mb-2">
                الأصل الثقافي والعبرة المتوارثة:
              </h4>
              <p className="text-sm sm:text-base font-serif text-[#665A4F] dark:text-[#A89C90] leading-relaxed">
                {story.culturalSignificance}
              </p>
            </div>
          )}
        </div>

        {/* Back to Stories */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => setActivePage('stories')}
            className="px-6 py-3 rounded-2xl bg-[#B45F42] hover:bg-[#9E4F36] text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
          >
            تصفح المزيد من حكايات وه بيحكي
          </button>
        </div>
      </div>
    </div>
  );
};
