import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { CulturalEvent } from '../../types';
import {
  X,
  Save,
  FileText,
  Sparkles,
  CheckCircle2,
  Utensils,
  Calendar,
  Flame,
  Music,
  HelpCircle,
  Clock
} from 'lucide-react';

export interface QuickEventTextEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CulturalEvent;
  onSaved: (updatedEvent: CulturalEvent) => void;
  initialSection?: 'all' | 'description' | 'rituals' | 'traditions' | 'foods' | 'dates';
}

export const QuickEventTextEditModal: React.FC<QuickEventTextEditModalProps> = ({
  isOpen,
  onClose,
  event,
  onSaved,
  initialSection = 'all',
}) => {
  const { currentUser, addToast } = useApp();

  const [activeSection, setActiveSection] = useState<'all' | 'description' | 'rituals' | 'traditions' | 'foods' | 'dates'>(initialSection);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for texts
  const [title, setTitle] = useState(event.title || '');
  const [seasonText, setSeasonText] = useState(event.timeOfYear || event.dateText || event.season || event.eventDate || '');
  const [description, setDescription] = useState(event.description || '');
  const [traditions, setTraditions] = useState(event.traditions || '');
  const [ritualsText, setRitualsText] = useState((event.rituals || []).join('\n'));
  const [foodsText, setFoodsText] = useState((event.famousFoods || []).join('\n'));
  const [activitiesText, setActivitiesText] = useState((event.activities || []).join('\n'));

  if (!isOpen) return null;

  // Quick insertion helpers for authentic Upper Egyptian cultural phrases
  const addRitualSuggestion = (text: string) => {
    setRitualsText((prev) => (prev ? `${prev.trim()}\n${text}` : text));
  };

  const addFoodSuggestion = (text: string) => {
    setFoodsText((prev) => (prev ? `${prev.trim()}\n${text}` : text));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('حقل مطلوب', 'يرجى كتابة عنوان أو اسم الاحتفال', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedRituals = ritualsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedFoods = foodsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedActivities = activitiesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: Partial<CulturalEvent> = {
        title: title.trim(),
        season: seasonText.trim() || undefined,
        timeOfYear: seasonText.trim() || undefined,
        dateText: seasonText.trim() || undefined,
        description: description.trim(),
        traditions: traditions.trim() || undefined,
        rituals: parsedRituals.length > 0 ? parsedRituals : undefined,
        famousFoods: parsedFoods.length > 0 ? parsedFoods : undefined,
        activities: parsedActivities.length > 0 ? parsedActivities : undefined,
        updatedAt: new Date().toISOString(),
      };

      const updated = await wahApi.updateEvent(event.id, payload, currentUser || { role: 'admin' });

      addToast(
        'تم التعديل السريع بنجاح',
        `تم حفظ وتحديث نصوص الاحتفال «${updated.title}» مباشرة في الصفحة!`,
        'success'
      );
      onSaved(updated);
      onClose();
    } catch (err: any) {
      console.error('Quick edit error:', err);
      addToast('خطأ في الحفظ السريع', err?.message || 'تعذر حفظ التعديلات السريعة', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="
          relative w-full max-w-3xl max-h-[90vh]
          flex flex-col
          rounded-[2.5rem]
          bg-cream text-espresso
          dark:bg-espresso-900 dark:text-cream
          border border-black/10 dark:border-white/10
          shadow-2xl overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-primary/5 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-serif">
                  التعديل السريع لنصوص الاحتفال
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-primary text-black dark:text-espresso text-[10px] font-black">
                  Quick Edit
                </span>
              </div>
              <p className="text-xs text-black/60 dark:text-white/60">
                تعديل الروايات والطقوس والنفحات مباشرة في نفس الصفحة دون مغادرتها
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl text-black/50 dark:text-white/50 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-all"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Filter Bar */}
        <div className="px-6 py-2.5 border-b border-black/10 dark:border-white/10 flex items-center gap-2 bg-black/[0.015] dark:bg-white/[0.01] overflow-x-auto text-xs font-bold scrollbar-none">
          <span className="text-[11px] text-black/40 dark:text-white/40 font-mono ml-2 shrink-0">
            الانتقال السريع:
          </span>
          {[
            { id: 'all', label: 'كل النصوص' },
            { id: 'description', label: 'الرواية والوصف' },
            { id: 'rituals', label: 'الطقوس والمراسم' },
            { id: 'traditions', label: 'العادات والتقاليد' },
            { id: 'foods', label: 'النفحات والأكلات' },
            { id: 'dates', label: 'الموعد والموسم' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 text-xs ${
                activeSection === tab.id
                  ? 'bg-primary text-black dark:text-espresso font-black shadow-xs'
                  : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* TITLE & BASIC INFO */}
          {(activeSection === 'all' || activeSection === 'description') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-primary border-b border-primary/20 pb-2">
                <Sparkles className="w-4 h-4" />
                <span>عنوان الاحتفال والمولد</span>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  اسم أو عنوان الاحتفال التراثي <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: مولد سيدي عبد الرحيم القنائي..."
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  الرواية والوصف بالعامية الصعيدية (Colloquial Narrative) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب حكاية المولد بلهجة أهل البلد وروح المحبة والنفحات..."
                  className="w-full px-4 py-3 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs leading-relaxed focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* DATES & SEASON */}
          {(activeSection === 'all' || activeSection === 'dates') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-primary border-b border-primary/20 pb-2">
                <Clock className="w-4 h-4" />
                <span>توقيت وموعد الموسم</span>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  توقيت الاحتفال وموسم الليلة
                </label>
                <input
                  type="text"
                  value={seasonText}
                  onChange={(e) => setSeasonText(e.target.value)}
                  placeholder="مثال: منتصف شعبان من كل عام، أول أسبوع في برمودة، الليلة الختامية ٢٨ رجب..."
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TRADITIONS */}
          {(activeSection === 'all' || activeSection === 'traditions') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-primary border-b border-primary/20 pb-2">
                <Flame className="w-4 h-4" />
                <span>العادات والتقاليد التراثية وسرد المراسم</span>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  تفاصيل العادات وسياق الليلة الكامل
                </label>
                <textarea
                  rows={4}
                  value={traditions}
                  onChange={(e) => setTraditions(e.target.value)}
                  placeholder="كيف تبدأ الليلة، نصب الخيام، حلقات الذكر، دور أهل البلد والضيوف..."
                  className="w-full px-4 py-3 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs leading-relaxed focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* RITUALS LIST */}
          {(activeSection === 'all' || activeSection === 'rituals') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                <div className="flex items-center gap-2 text-xs font-black text-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>طقوس ومراسم الليلة الكبيرة (كل طقس في سطر)</span>
                </div>
              </div>

              {/* Suggestions Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="text-black/50 dark:text-white/50 font-bold">إضافة مقترحة:</span>
                {[
                  'التحطيب بالمزمار البلدي الصعيدي',
                  'زفة الدورة بالبيارق والرايات',
                  'حلقات الذكر والمديح النبوي',
                  'إطعام الطعام في الساحات والمضايف',
                  'ليلة المحفل الختامية وإنشاد الشيخ',
                  'سباقات الفروسية والمرماح'
                ].map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => addRitualSuggestion(sug)}
                    className="px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-primary/20 text-black/80 dark:text-white/80 cursor-pointer border border-black/5 transition-colors"
                  >
                    + {sug}
                  </button>
                ))}
              </div>

              <textarea
                rows={4}
                value={ritualsText}
                onChange={(e) => setRitualsText(e.target.value)}
                placeholder="التحطيب بالخيزران في باحة المولد&#10;زفة البيارق الخضراء بعد صلاة العصر&#10;حلقات الذكر والمدائح الصوفية حتى الفجر"
                className="w-full px-4 py-3 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs leading-relaxed focus:ring-2 focus:ring-primary focus:outline-none font-mono"
              />
            </div>
          )}

          {/* FAMOUS FOODS */}
          {(activeSection === 'all' || activeSection === 'foods') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                <div className="flex items-center gap-2 text-xs font-black text-primary">
                  <Utensils className="w-4 h-4" />
                  <span>أكلات ومشروبات النفحة والضيافة (كل صنف في سطر)</span>
                </div>
              </div>

              {/* Food Suggestions Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="text-black/50 dark:text-white/50 font-bold">إضافة شائعة:</span>
                {[
                  'الفتة الصعيدي بالخل والتوم واللحمة البلدي',
                  'الكشك الصعيدي المقرمش',
                  'شوربة النابت بالليمون والكمون',
                  'الملوخية الصعيدية بالمخروطة',
                  'الأرز باللبن والمحلب',
                  'حمص المولد والحلاوة السمسمية',
                  'الكركديه الأسواني والتمر هندي المركز'
                ].map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => addFoodSuggestion(sug)}
                    className="px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-primary/20 text-black/80 dark:text-white/80 cursor-pointer border border-black/5 transition-colors"
                  >
                    + {sug}
                  </button>
                ))}
              </div>

              <textarea
                rows={4}
                value={foodsText}
                onChange={(e) => setFoodsText(e.target.value)}
                placeholder="الفتة الصعيدي بلحم العجول البلدي&#10;شوربة الفول النابت بالليمون والكمون&#10;الأرز باللبن والمكسرات للنفحة"
                className="w-full px-4 py-3 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs leading-relaxed focus:ring-2 focus:ring-primary focus:outline-none font-mono"
              />
            </div>
          )}

          {/* ACTIVITIES & CHANTERS */}
          {(activeSection === 'all' || activeSection === 'rituals') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-primary border-b border-primary/20 pb-2">
                <Music className="w-4 h-4" />
                <span>الأنشطة والإنشاد والمدائح (كل نشاط في سطر)</span>
              </div>
              <textarea
                rows={3}
                value={activitiesText}
                onChange={(e) => setActivitiesText(e.target.value)}
                placeholder="مدائح الشيخ ياسين التهامي&#10;حلقات الإنشاد الصوفي لكبار المنشدين&#10;مسابقات التحطيب بحضور فرسان الصعيد"
                className="w-full px-4 py-3 rounded-xl border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/30 text-xs leading-relaxed focus:ring-2 focus:ring-primary focus:outline-none font-mono"
              />
            </div>
          )}

          {/* Modal Actions Footer */}
          <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="
                px-6 py-2.5 rounded-xl
                bg-primary hover:bg-primary-hover
                text-black dark:text-espresso text-xs font-black
                flex items-center gap-2
                transition-all shadow-md
                cursor-pointer disabled:opacity-50
                hover:scale-105 active:scale-95
              "
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الحفظ الفوري...' : 'حفظ التعديل السريع فوراً'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
