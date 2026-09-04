import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { LocalPerson } from '../../types';
import {
  Users,
  MapPin,
  Award,
  Hammer,
  ArrowLeft,
  Share2,
  ChevronLeft,
  Quote,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const PersonDetailPage: React.FC = () => {
  const {
    selectedPersonSlug,
    navigateToGovernorate,
    navigateToCraft,
    setActivePage,
    addToast
  } = useApp();

  const [person, setPerson] = useState<LocalPerson | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const slug = selectedPersonSlug || 'sheikh-qenawy-pottery';

  useEffect(() => {
    const fetchPerson = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getPersonBySlug(slug);
        if (data) {
          setPerson(data);
        }
      } catch (err) {
        console.warn('Could not load person details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPerson();
  }, [slug]);

  const handleShare = () => {
    const url = `${window.location.origin}/people?slug=${encodeURIComponent(slug)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      addToast('تم نسخ الرابط', 'تم نسخ رابط ملف شيخ الصنعة بنجاح', 'success');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#B45F42] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-[#7A6F64]">جاري تحميل ملف السيرة والمسيرة...</p>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">الملف غير موجود</h2>
          <p className="text-sm text-[#7A6F64] mb-4">لم نتمكن من العثور على بيانات هذا الشخص</p>
          <button
            onClick={() => setActivePage('people')}
            className="px-5 py-2.5 rounded-xl bg-[#B45F42] text-white font-bold text-sm"
          >
            العودة لكافة ناس الصعيد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] text-[#29221D] dark:text-[#FAF6F2] font-sans pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Top Controls */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            type="button"
            onClick={() => setActivePage('people')}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#665A4F] dark:text-[#A89C90] hover:text-[#B45F42] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>كافة ناس الصعيد</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl bg-white dark:bg-[#1E1917] text-[#29221D] dark:text-[#FAF6F2] border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="مشاركة الملف"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">مشاركة الملف</span>
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-10 border border-[#E8E1D9] dark:border-[#382E27] shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-right">
            <img
              src={person.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'}
              alt={person.name}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl object-cover border-4 border-[#FAF6F0] dark:border-[#25201D] shadow-md shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-2">
                <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold">
                  {person.craftTitle}
                </span>
                <button
                  onClick={() => navigateToGovernorate(person.governorateId || 'qena')}
                  className="px-3 py-1 rounded-full bg-[#FAF6F0] dark:bg-[#25201D] text-[#7A6F64] hover:text-[#B45F42] text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#B45F42]" />
                  <span>محافظة {person.governorateName}</span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black font-serif text-[#29221D] dark:text-[#FAF6F2] mb-3">
                {person.name}
              </h1>

              {person.yearsOfExperience && (
                <p className="text-xs sm:text-sm font-semibold text-[#B45F42] flex items-center justify-center sm:justify-start gap-1.5 mb-4">
                  <Award className="w-4 h-4" />
                  <span>أكثر من {person.yearsOfExperience} عاماً في حفظ الصنعة وتدريب الأجيال</span>
                </p>
              )}

              <p className="text-sm sm:text-base text-[#665A4F] dark:text-[#A89C90] leading-relaxed">
                {person.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Master's Quote / Advice */}
        {person.quote && (
          <div className="bg-amber-50 dark:bg-amber-950/40 rounded-3xl p-6 sm:p-8 border border-amber-200 dark:border-amber-800/40 mb-8 relative">
            <Quote className="w-10 h-10 text-amber-600/30 absolute top-4 left-4" />
            <h3 className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">
              من وصايا وحكم شيخ الصنعة:
            </h3>
            <p className="text-base sm:text-lg font-serif italic text-amber-950 dark:text-amber-100 leading-relaxed">
              «{person.quote}»
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => setActivePage('people')}
            className="px-6 py-3 rounded-2xl bg-[#B45F42] hover:bg-[#9E4F36] text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
          >
            تصفح المزيد من ناس الصعيد
          </button>
        </div>
      </div>
    </div>
  );
};
