import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import {
  Landmark,
  Hammer,
  BookOpen,
  Users,
  Utensils,
  Calendar,
  Plus,
  Save,
  CheckCircle,
  FileText,
  Sparkles,
  MapPin,
  ArrowLeft
} from 'lucide-react';

export const CulturalCmsAdminPage: React.FC = () => {
  const { setActivePage, addToast, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'place' | 'craft' | 'story' | 'person' | 'food' | 'event'>('place');

  // Form State for creating new heritage item
  const [title, setTitle] = useState('');
  const [governorateName, setGovernorateName] = useState('قنا');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [detailedContent, setDetailedContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      addToast('بيانات ناقصة', 'يرجى إدخال العنوان والوصف الموجز على الأقل', 'error');
      return;
    }

    setIsSubmitting(true);
    const slug = `${Date.now()}-${title.trim().toLowerCase().replace(/[^\u0621-\u064A\w]+/g, '-')}`;
    const userAuth = { id: currentUser?.id, role: currentUser?.role || 'admin' };

    try {
      if (activeTab === 'place') {
        await wahApi.savePlace({
          title: title.trim(),
          slug,
          governorateName,
          governorateId: `gov-${governorateName}`,
          category: category || 'heritage_site',
          description: description.trim(),
          history: detailedContent.trim() || description.trim(),
          significance: description.trim(),
          locationName: governorateName,
          coverImage: imageUrl.trim() || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
          gallery: imageUrl.trim() ? [imageUrl.trim()] : [],
          status: 'approved'
        }, userAuth);
      } else if (activeTab === 'craft') {
        await wahApi.saveCraft({
          title: title.trim(),
          slug,
          shortDescription: description.trim(),
          history: detailedContent.trim() || description.trim(),
          governorates: [governorateName],
          materials: ['مواد طبيعية محلية صلبة'],
          tools: ['أدوات يدوية تقليدية متوارثة'],
          manufacturingStages: [
            { stepNumber: 1, title: 'المرحلة التحضيرية', description: detailedContent.trim() || description.trim() }
          ],
          coverImage: imageUrl.trim() || 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800',
          gallery: imageUrl.trim() ? [imageUrl.trim()] : [],
          status: 'approved'
        }, userAuth);
      } else if (activeTab === 'story') {
        await wahApi.saveStory({
          title: title.trim(),
          slug,
          excerpt: description.trim(),
          content: detailedContent.trim() || description.trim(),
          category: 'oral_tradition',
          authorName: currentUser?.name || 'راوي الصعيد',
          governorateName,
          governorateId: `gov-${governorateName}`,
          coverImage: imageUrl.trim() || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
          readingTimeMinutes: 4,
          status: 'approved'
        }, userAuth);
      } else if (activeTab === 'person') {
        await wahApi.savePerson({
          name: title.trim(),
          slug,
          titleOrRole: category || 'شيخ صنعة وحارس تراث',
          craftOrSkill: category || 'حرفي صعيدي تقليدي',
          governorateName,
          governorateId: `gov-${governorateName}`,
          biography: detailedContent.trim() || description.trim(),
          avatarUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
          yearsOfExperience: 25,
          status: 'approved'
        }, userAuth);
      } else if (activeTab === 'food') {
        await wahApi.saveFood({
          title: title.trim(),
          slug,
          governorateName,
          governorateId: `gov-${governorateName}`,
          description: description.trim(),
          ingredients: ['مكونات بلدية طازجة من خيرات الصعيد'],
          preparationMethod: detailedContent.trim() || description.trim(),
          originStory: detailedContent.trim() || description.trim(),
          occasionOrTradition: category || 'أكلات يومية ومناسبات',
          coverImage: imageUrl.trim() || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
          status: 'approved'
        }, userAuth);
      } else if (activeTab === 'event') {
        await wahApi.saveEvent({
          title: title.trim(),
          slug,
          category: category || 'festival',
          governorateName,
          governorateId: `gov-${governorateName}`,
          locationName: governorateName,
          eventDate: 'موسم سنوي',
          eventTime: '06:00 مساءً',
          description: detailedContent.trim() || description.trim(),
          coverImage: imageUrl.trim() || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
          status: 'approved'
        }, userAuth);
      }

      addToast('تم الحفظ بنجاح', `تم توثيق ونشر "${title}" في موسوعة وه بنجاح`, 'success');
      setTitle('');
      setDescription('');
      setDetailedContent('');
      setImageUrl('');
    } catch (err: any) {
      console.error('Failed to save heritage item:', err);
      addToast('فشل الحفظ', err.message || 'حدث خطأ أثناء حفظ العنصر التراثي', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] text-[#29221D] dark:text-[#FAF6F2] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#7A6F64]">
            <button
              onClick={() => setActivePage('home')}
              className="hover:text-[#B45F42] transition-colors cursor-pointer"
            >
              الرئيسية
            </button>
            <span>/</span>
            <span className="text-[#B45F42] font-bold">لوحة التوثيق التراثي المتقدمة (Curator Studio)</span>
          </div>

          <button
            onClick={() => setActivePage('admin-dashboard')}
            className="flex items-center gap-2 text-xs font-bold text-[#B45F42] hover:underline"
          >
            <span>لوحة التحكم الرئيسية للمتجر</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] dark:border-[#382E27] shadow-xs mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-serif text-[#29221D] dark:text-[#FAF6F2]">
                استوديو التوثيق وحفظ التراث — منصة وه
              </h1>
              <p className="text-xs sm:text-sm text-[#7A6F64] mt-0.5">
                إضافة وإدارة محتوى المعالم، الحرف، المرويات الشفاهية، شيوخ الصنعة، والأكلات التراثية
              </p>
            </div>
          </div>

          {/* Module Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-6 border-t border-[#F0EAE1] dark:border-[#2D2622] mt-6">
            <button
              onClick={() => setActiveTab('place')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'place'
                  ? 'bg-[#B45F42] text-white'
                  : 'bg-[#FAF6F0] dark:bg-[#25201D] text-[#665A4F] hover:bg-[#E8E1D9]'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>معلم تراثي</span>
            </button>

            <button
              onClick={() => setActiveTab('craft')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'craft'
                  ? 'bg-[#B45F42] text-white'
                  : 'bg-[#FAF6F0] dark:bg-[#25201D] text-[#665A4F] hover:bg-[#E8E1D9]'
              }`}
            >
              <Hammer className="w-4 h-4" />
              <span>حرفة وورشة</span>
            </button>

            <button
              onClick={() => setActiveTab('story')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'story'
                  ? 'bg-[#B45F42] text-white'
                  : 'bg-[#FAF6F0] dark:bg-[#25201D] text-[#665A4F] hover:bg-[#E8E1D9]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>حكاية ومروية</span>
            </button>

            <button
              onClick={() => setActiveTab('person')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'person'
                  ? 'bg-[#B45F42] text-white'
                  : 'bg-[#FAF6F0] dark:bg-[#25201D] text-[#665A4F] hover:bg-[#E8E1D9]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>شيخ صنعة</span>
            </button>

            <button
              onClick={() => setActiveTab('food')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'food'
                  ? 'bg-[#B45F42] text-white'
                  : 'bg-[#FAF6F0] dark:bg-[#25201D] text-[#665A4F] hover:bg-[#E8E1D9]'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>أكلة ومطبخ</span>
            </button>

            <button
              onClick={() => setActiveTab('event')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'event'
                  ? 'bg-[#B45F42] text-white'
                  : 'bg-[#FAF6F0] dark:bg-[#25201D] text-[#665A4F] hover:bg-[#E8E1D9]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>فعالية وموسم</span>
            </button>
          </div>
        </div>

        {/* Creation Form */}
        <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] dark:border-[#382E27] shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F0EAE1] dark:border-[#2D2622]">
            <h2 className="text-lg font-bold font-serif flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#B45F42]" />
              <span>
                توثيق عنصر جديد: {
                  activeTab === 'place' ? 'معلم تراثي أو موقع أثري' :
                  activeTab === 'craft' ? 'حرفة تقليدية وورشة عتيقة' :
                  activeTab === 'story' ? 'حكاية شفاهية أو أسطورة شعبية' :
                  activeTab === 'person' ? 'شيخ صنعة أو راوٍ تراثي' :
                  activeTab === 'food' ? 'أكلة أو مخبوز صعيدي أصيل' :
                  'موسم أو مولد أو مهرجان صعيدي'
                }
              </span>
            </h2>
            <span className="text-xs text-[#7A6F64]">يُنشر مباشرة في موسوعة وه</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-bold text-[#7A6F64] mb-2">
                  العنوان أو الاسم الرئيسي *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: معبد دندرة، حياكة التلي الأسيوطي، الشلولو..."
                  className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm text-[#29221D] dark:text-[#FAF6F2] rounded-xl px-4 py-3 border border-[#E8E1D9] dark:border-[#382E27] focus:border-[#B45F42] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7A6F64] mb-2">
                  المحافظة الصعيدية *
                </label>
                <select
                  value={governorateName}
                  onChange={(e) => setGovernorateName(e.target.value)}
                  className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm text-[#29221D] dark:text-[#FAF6F2] rounded-xl px-4 py-3 border border-[#E8E1D9] dark:border-[#382E27] focus:border-[#B45F42] outline-none"
                >
                  <option value="قنا">قنا</option>
                  <option value="الأقصر">الأقصر</option>
                  <option value="أسوان">أسوان</option>
                  <option value="سوهاج">سوهاج</option>
                  <option value="أسيوط">أسيوط</option>
                  <option value="المنيا">المنيا</option>
                  <option value="بني سويف">بني سويف</option>
                  <option value="الفيوم">الفيوم</option>
                  <option value="الوادي الجديد">الوادي الجديد</option>
                  <option value="البحر الأحمر">البحر الأحمر</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-bold text-[#7A6F64] mb-2">
                  التصنيف الفرعي
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="مثال: فخار وخزف، نسيج يدوي، مأكولات تقليدية..."
                  className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm text-[#29221D] dark:text-[#FAF6F2] rounded-xl px-4 py-3 border border-[#E8E1D9] dark:border-[#382E27] focus:border-[#B45F42] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7A6F64] mb-2">
                  رابط صورة الغلاف التوثيقية
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm text-[#29221D] dark:text-[#FAF6F2] rounded-xl px-4 py-3 border border-[#E8E1D9] dark:border-[#382E27] focus:border-[#B45F42] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7A6F64] mb-2">
                الوصف الموجز والتعريف السريع *
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="نبذة مكثفة تظهر في بطاقات الاستكشاف والخرائط..."
                className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm text-[#29221D] dark:text-[#FAF6F2] rounded-xl px-4 py-3 border border-[#E8E1D9] dark:border-[#382E27] focus:border-[#B45F42] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7A6F64] mb-2">
                التوثيق التفصيلي والمروية الكاملة
              </label>
              <textarea
                rows={6}
                value={detailedContent}
                onChange={(e) => setDetailedContent(e.target.value)}
                placeholder="سرد التاريخ، مراحل الصنع، الأسرار الشعبية، أو تفاصيل الزيارة..."
                className="w-full bg-[#FAF6F0] dark:bg-[#25201D] text-xs sm:text-sm text-[#29221D] dark:text-[#FAF6F2] rounded-xl px-4 py-3 border border-[#E8E1D9] dark:border-[#382E27] focus:border-[#B45F42] outline-none font-serif"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0EAE1] dark:border-[#2D2622]">
              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setDescription('');
                  setDetailedContent('');
                  setImageUrl('');
                }}
                className="px-5 py-2.5 rounded-xl border border-[#E8E1D9] dark:border-[#382E27] text-xs font-bold text-[#7A6F64] hover:bg-[#FAF6F0]"
              >
                إلغاء وتفريغ الحقول
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#B45F42] hover:bg-[#9E4F36] text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'جاري الحفظ والتوثيق...' : 'حفظ ونشر بالمنصة'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
