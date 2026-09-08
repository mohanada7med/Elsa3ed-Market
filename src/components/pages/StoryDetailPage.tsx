import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { WahStory } from '../../types';
import {
  MapPin,
  Volume2,
  VolumeX,
  Share2,
  ChevronLeft,
  Sparkles,
  Quote
} from 'lucide-react';

export const StoryDetailPage: React.FC = () => {
  const {
    selectedStorySlug,
    navigateToGovernorate,
    setActivePage,
    addToast
  } = useApp();

  const [story, setStory] = useState<WahStory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const slug =
    selectedStorySlug ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/stories/')
      ? decodeURIComponent(window.location.pathname.split('/')[2] || '')
      : null) ||
    'sirah-hilaliyya';

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
    const url = `${window.location.origin}/stories/${encodeURIComponent(slug)}`;
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
      <div
        dir="rtl"
        className="min-h-screen bg-[#eee8dc] dark:bg-[#0b0b0a] flex items-center justify-center p-6 text-[#211d18] dark:text-[#f5f0e7]"
      >
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#9a6a35] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold">جاري فتح سجل الحكايات...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#eee8dc] dark:bg-[#0b0b0a] flex items-center justify-center p-6 text-center text-[#211d18] dark:text-[#f5f0e7]"
      >
        <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-10 max-w-md w-full shadow-lg space-y-4">
          <h2 className="text-2xl font-black font-serif">الحكاية غير موجودة</h2>
          <p className="text-sm text-[#211d18]/70 dark:text-[#f5f0e7]/70">لم نتمكن من العثور على نص هذه الحكاية</p>
          <button
            type="button"
            onClick={() => setActivePage('stories')}
            className="w-full py-3.5 rounded-[1.25rem] bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] font-black text-xs transition-colors cursor-pointer shadow-md"
          >
            العودة لكافة الحكايات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#eee8dc] dark:bg-[#0b0b0a] text-[#211d18] dark:text-[#f5f0e7] pb-16"
    >
      {/* Article Container */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 space-y-8">
        {/* Top Controls */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setActivePage('stories')}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#211d18]/60 dark:text-[#f5f0e7]/60 hover:text-[#9a6a35] dark:hover:text-[#d5a56d] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>كافة حكايات «وه بيحكي»</span>
          </button>

          <div className="flex items-center gap-2">


            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-white/80 dark:bg-[#151513]/90 text-[#211d18] dark:text-[#f5f0e7] border border-black/10 dark:border-white/10 hover:border-[#9a6a35] transition-colors cursor-pointer"
              title="مشاركة الحكاية"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Story Header Card */}
        <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 border border-black/10 dark:border-white/10 shadow-lg">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="px-3.5 py-1 rounded-full bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d] text-xs font-bold border border-[#9a6a35]/30">
              {story.category}
            </span>
            <button
              type="button"
              onClick={() => navigateToGovernorate(story.governorateId || 'qena')}
              className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-[#211d18]/70 dark:text-[#f5f0e7]/70 hover:text-[#9a6a35] dark:hover:text-[#d5a56d] text-xs font-semibold flex items-center gap-1 transition-colors border border-black/5 dark:border-white/5 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#9a6a35]" />
              <span>محافظة {story.governorateName}</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif text-[#211d18] dark:text-[#f5f0e7] mb-4 leading-tight">
            {story.title}
          </h1>

          {story.excerpt && (
            <p className="text-base sm:text-lg font-serif text-[#9a6a35] dark:text-[#d5a56d] italic mb-6 leading-relaxed">
              «{story.excerpt}»
            </p>
          )}

          {story.narrator && (
            <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs text-[#211d18]/60 dark:text-[#f5f0e7]/60">
              <span>راوي الرواية الشفاهية: <strong className="text-[#211d18] dark:text-[#f5f0e7]">{story.narrator}</strong></span>
              <span className="flex items-center gap-1 font-serif text-[#9a6a35] dark:text-[#d5a56d] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>توثيق منصة وه</span>
              </span>
            </div>
          )}
        </div>

        {/* Story Content Prose */}
        <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 border border-black/10 dark:border-white/10 shadow-lg space-y-6">
          <div className="prose dark:prose-invert max-w-none text-base sm:text-lg font-serif leading-loose text-[#211d18]/90 dark:text-[#f5f0e7]/90 whitespace-pre-line space-y-6">
            {story.content}
          </div>

          {/* Cultural Moral Quote */}
          {story.culturalSignificance && (
            <div className="mt-8 p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 relative">
              <Quote className="w-8 h-8 text-[#9a6a35]/30 absolute top-4 left-4" />
              <h4 className="text-sm font-bold font-serif text-[#9a6a35] dark:text-[#d5a56d] mb-2">
                الأصل الثقافي والعبرة المتوارثة:
              </h4>
              <p className="text-sm sm:text-base font-serif text-[#211d18]/80 dark:text-[#f5f0e7]/80 leading-relaxed">
                {story.culturalSignificance}
              </p>
            </div>
          )}
        </div>

        {/* Back to Stories */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setActivePage('stories')}
            className="px-8 py-3.5 rounded-[1.25rem] bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] font-black text-xs shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
          >
            تصفح المزيد من حكايات وه بيحكي
          </button>
        </div>
      </div>
    </div>
  );
};
