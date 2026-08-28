import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Product, OrderStatus, ProductStatus, Category, Review, CraftStory } from '../../types.ts';
import { api } from '../../services/api.ts';
import {
  ShieldAlert,
  TrendingUp,
  Package,
  Store,
  CheckCircle2,
  XCircle,
  Tag,
  Plus,
  Truck,
  Users,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  FileText,
  Clock,
  AlertCircle,
  Check,
  X,
  Layers,
  MessageSquare,
  Star,
  Edit2,
  Trash2,
  BadgeCheck,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    adminProducts,
    pendingProducts,
    approveProduct,
    rejectProduct,
    deleteProduct,
    sellers,
    approveSeller,
    rejectSeller,
    suspendSeller,
    refreshSellers,
    orders,
    updateOrderStatus,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    reviews,
    refreshReviews,
    moderateReview,
    auditLogs,
    addToast,
    currentUser,
    setActivePage
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'approvals' | 'categories' | 'craft-stories' | 'reviews' | 'sellers' | 'orders' | 'coupons' | 'audit' | 'users'
  >('overview');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // User Management State
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<any | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<any | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Seller Management State
  const [sellerStatusFilter, setSellerStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'suspended'>('all');
  const [sellerSearchTerm, setSellerSearchTerm] = useState('');
  const [selectedSellerForAction, setSelectedSellerForAction] = useState<{ id: string; name: string; action: 'reject' | 'suspend' } | null>(null);
  const [sellerActionReason, setSellerActionReason] = useState('');
  const [isProcessingSellerAction, setIsProcessingSellerAction] = useState(false);

  // Rejection Modal State for Products
  const [rejectingProductId, setRejectingProductId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryNameEn, setCategoryNameEn] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('🏺');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [categoryImage, setCategoryImage] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Coupon Generator State
  const [coupons, setCoupons] = useState([
    { code: 'SAEED100', discount: 15, minOrder: 300, active: true },
    { code: 'ASWAN20', discount: 20, minOrder: 500, active: true },
    { code: 'RAMADAN', discount: 10, minOrder: 200, active: true }
  ]);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(15);
  const [newMinOrder, setNewMinOrder] = useState(300);

  // Craft Stories (قصص الصنعة وأسرار الأجداد) State
  const [craftStories, setCraftStories] = useState<CraftStory[]>([]);
  const [isLoadingCraftStories, setIsLoadingCraftStories] = useState(false);
  const [isCraftStoryModalOpen, setIsCraftStoryModalOpen] = useState(false);
  const [editingCraftStory, setEditingCraftStory] = useState<CraftStory | null>(null);
  const [craftTitle, setCraftTitle] = useState('');
  const [craftSubtitle, setCraftSubtitle] = useState('');
  const [craftGovernorate, setCraftGovernorate] = useState('قنا');
  const [craftHistoryAge, setCraftHistoryAge] = useState('');
  const [craftImage, setCraftImage] = useState('');
  const [craftDescription, setCraftDescription] = useState('');
  const [craftKeyFeaturesText, setCraftKeyFeaturesText] = useState('');
  const [craftCategoryId, setCraftCategoryId] = useState('pottery');
  const [craftDisplayOrder, setCraftDisplayOrder] = useState(1);
  const [craftActive, setCraftActive] = useState(true);
  const [isSubmittingCraftStory, setIsSubmittingCraftStory] = useState(false);

  const fetchAdminUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const users = await api.getAdminUsers(
        { id: currentUser.id, role: currentUser.role },
        { search: userSearchTerm, role: userRoleFilter }
      );
      setAdminUsers(users);
    } catch (err: any) {
      console.error('Failed fetching admin users:', err);
      addToast('خطأ', err?.message || 'فشل في استعراض بيانات المستخدمين', 'error');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const openUserDetails = async (userId: string) => {
    try {
      const details = await api.getAdminUserDetails(
        { id: currentUser.id, role: currentUser.role },
        userId
      );
      setSelectedUserForDetails(details);
    } catch (err: any) {
      addToast('خطأ', err?.message || 'تعذر جلب تفاصيل الحساب', 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserForDelete) return;
    setIsDeletingUser(true);
    try {
      const res = await api.deleteAdminUser(
        { id: currentUser.id, role: currentUser.role },
        selectedUserForDelete.id
      );
      addToast('تم حذف الحساب', res?.message || 'تم حذف الحساب وتنظيف أصوله وبياناته بنجاح', 'success');
      setSelectedUserForDelete(null);
      fetchAdminUsers();
      refreshSellers();
    } catch (err: any) {
      addToast('خطأ في الحذف', err?.message || 'تعذر حذف الحساب', 'error');
    } finally {
      setIsDeletingUser(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchAdminUsers();
    }
  }, [activeTab, userRoleFilter]);

  // Debounced search for users
  useEffect(() => {
    if (activeTab === 'users') {
      const timer = setTimeout(() => {
        fetchAdminUsers();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [userSearchTerm]);

  const fetchCraftStories = async () => {
    setIsLoadingCraftStories(true);
    try {
      const data = await api.getAdminCraftStories({ id: currentUser.id, role: 'admin' });
      setCraftStories(data);
    } catch (err: any) {
      console.error('Failed fetching admin craft stories:', err);
      addToast('خطأ', 'فشل في استعراض قصص الصنعة من قاعدة البيانات', 'error');
    } finally {
      setIsLoadingCraftStories(false);
    }
  };

  useEffect(() => {
    fetchCraftStories();
  }, []);

  useEffect(() => {
    if (activeTab === 'craft-stories') {
      fetchCraftStories();
    }
  }, [activeTab]);

  const openAddCraftStoryModal = () => {
    setEditingCraftStory(null);
    setCraftTitle('');
    setCraftSubtitle('');
    setCraftGovernorate('قنا');
    setCraftHistoryAge('متوارثة منذ أكثر من 5000 عام');
    setCraftImage('https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80');
    setCraftDescription('');
    setCraftKeyFeaturesText('تبريد طبيعي فوري عبر مسام الفخار النقية\nصناعة يدوية على دولاب الفخار الخشبي\nحرق في أفران بلدية تقليدية معالجة بالحرارة\nآمن وصحي 100% وخالٍ من الرصاص والكيماويات');
    setCraftCategoryId(categories[0]?.id || 'pottery');
    setCraftDisplayOrder(craftStories.length + 1);
    setCraftActive(true);
    setIsCraftStoryModalOpen(true);
  };

  const openEditCraftStoryModal = (story: CraftStory) => {
    setEditingCraftStory(story);
    setCraftTitle(story.title);
    setCraftSubtitle(story.subtitle || '');
    setCraftGovernorate(story.governorate || '');
    setCraftHistoryAge(story.historyAge || '');
    setCraftImage(story.image || '');
    setCraftDescription(story.description || '');
    setCraftKeyFeaturesText(Array.isArray(story.keyFeatures) ? story.keyFeatures.join('\n') : '');
    setCraftCategoryId(story.categoryId || categories[0]?.id || 'pottery');
    setCraftDisplayOrder(story.displayOrder ?? 1);
    setCraftActive(story.active ?? true);
    setIsCraftStoryModalOpen(true);
  };

  const handleSaveCraftStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!craftTitle.trim()) {
      addToast('بيانات ناقصة', 'عنوان الحرفة التراثية مطلوب', 'error');
      return;
    }
    if (!craftDescription.trim()) {
      addToast('بيانات ناقصة', 'قصة ووصف الحرفة التراثية مطلوب', 'error');
      return;
    }

    const keyFeatures = craftKeyFeaturesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    setIsSubmittingCraftStory(true);
    try {
      if (editingCraftStory) {
        const updated = await api.updateAdminCraftStory(
          { id: currentUser.id, role: 'admin' },
          editingCraftStory.id,
          {
            title: craftTitle,
            subtitle: craftSubtitle,
            governorate: craftGovernorate,
            historyAge: craftHistoryAge,
            image: craftImage,
            description: craftDescription,
            keyFeatures,
            categoryId: craftCategoryId,
            displayOrder: Number(craftDisplayOrder) || 1,
            active: craftActive
          }
        );
        setCraftStories((prev) => prev.map((s) => (s.id === editingCraftStory.id ? updated : s)));
        addToast('تم التحديث', `تم تحديث قصة "${updated.title}" بنجاح في قاعدة البيانات`, 'success');
      } else {
        const created = await api.createAdminCraftStory(
          { id: currentUser.id, role: 'admin' },
          {
            title: craftTitle,
            subtitle: craftSubtitle,
            governorate: craftGovernorate,
            historyAge: craftHistoryAge,
            image: craftImage,
            description: craftDescription,
            keyFeatures,
            categoryId: craftCategoryId,
            displayOrder: Number(craftDisplayOrder) || 1,
            active: craftActive
          }
        );
        setCraftStories((prev) => [...prev, created]);
        addToast('تمت الإضافة', `تم حفظ قصة الصنعة "${created.title}" في قاعدة البيانات بنجاح`, 'success');
      }
      setIsCraftStoryModalOpen(false);
    } catch (err: any) {
      addToast('خطأ في الحفظ', err?.message || 'تعذر حفظ قصة الصنعة', 'error');
    } finally {
      setIsSubmittingCraftStory(false);
    }
  };

  const handleDeleteCraftStory = async (story: CraftStory) => {
    if (!confirm(`هل أنت متأكد من حذف قصة "${story.title}" نهائياً من قاعدة البيانات؟`)) {
      return;
    }
    try {
      await api.deleteAdminCraftStory({ id: currentUser.id, role: 'admin' }, story.id);
      setCraftStories((prev) => prev.filter((s) => s.id !== story.id));
      addToast('تم الحذف', `تم حذف قصة "${story.title}" بنجاح من قاعدة البيانات`, 'info');
    } catch (err: any) {
      addToast('خطأ في الحذف', err?.message || 'تعذر حذف قصة الصنعة', 'error');
    }
  };

  const handleToggleCraftStoryActive = async (story: CraftStory) => {
    try {
      const nextActive = story.active === false ? true : false;
      const updated = await api.updateAdminCraftStory(
        { id: currentUser.id, role: 'admin' },
        story.id,
        { active: nextActive }
      );
      setCraftStories((prev) => prev.map((s) => (s.id === story.id ? updated : s)));
      addToast(
        nextActive ? 'تم التفعيل' : 'تم الإخفاء',
        `تم ${nextActive ? 'تفعيل ظهور' : 'إخفاء'} قصة "${story.title}" في الواجهة الرئيسية`,
        'success'
      );
    } catch (err: any) {
      addToast('خطأ', err?.message || 'تعذر تغيير حالة تفعيل القصة', 'error');
    }
  };

  useEffect(() => {
    refreshReviews();
  }, [refreshReviews]);

  const totalMarketplaceSales = orders.reduce((sum, o) => sum + o.total, 0);

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      await approveProduct(id);
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectModal = (id: string) => {
    setRejectingProductId(id);
    setRejectionReasonInput('يرجى توضيح نسبة الخامات الطبيعية وإرفاق صور أدق للورشة وأسلوب الصنع اليدوي.');
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingProductId) return;
    if (!rejectionReasonInput.trim()) {
      addToast('تنبيه', 'يرجى كتابة سبب الرفض لمساعدة الحرفي في تصحيح البيانات', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      await rejectProduct(rejectingProductId, rejectionReasonInput.trim());
      setRejectingProductId(null);
      setRejectionReasonInput('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSellerAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSellerForAction) return;

    setIsProcessingSellerAction(true);
    try {
      if (selectedSellerForAction.action === 'reject') {
        await rejectSeller(selectedSellerForAction.id, sellerActionReason.trim() || 'لم يستوفِ معايير الحرف التراثية');
      } else if (selectedSellerForAction.action === 'suspend') {
        await suspendSeller(selectedSellerForAction.id, sellerActionReason.trim() || 'مخالفة سياسات التوريد أو معايير الجودة');
      }
      setSelectedSellerForAction(null);
      setSellerActionReason('');
    } finally {
      setIsProcessingSellerAction(false);
    }
  };

  const pendingSellersCount = sellers.filter((s) => s.status === 'pending').length;

  const filteredSellers = sellers.filter((s) => {
    if (sellerStatusFilter !== 'all' && s.status !== sellerStatusFilter) {
      return false;
    }
    if (sellerSearchTerm.trim()) {
      const q = sellerSearchTerm.trim().toLowerCase();
      return (
        s.name?.toLowerCase().includes(q) ||
        s.brandName?.toLowerCase().includes(q) ||
        s.governorate?.toLowerCase().includes(q) ||
        s.specialty?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        s.email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryNameEn('');
    setCategorySlug('');
    setCategoryIcon('🏺');
    setCategoryDesc('');
    setCategoryImage('https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80');
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryNameEn(cat.nameEn || '');
    setCategorySlug(cat.slug || '');
    setCategoryIcon(cat.icon || '🏺');
    setCategoryDesc(cat.description || '');
    setCategoryImage(cat.image || '');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      addToast('خطأ في البيانات', 'يرجى إدخال اسم التصنيف', 'error');
      return;
    }
    setIsSubmittingCat(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: categoryName,
          nameEn: categoryNameEn,
          slug: categorySlug || categoryName.toLowerCase().replace(/\s+/g, '-'),
          icon: categoryIcon,
          description: categoryDesc,
          image: categoryImage
        });
      } else {
        await addCategory({
          name: categoryName,
          nameEn: categoryNameEn,
          slug: categorySlug || `cat-${Date.now()}`,
          icon: categoryIcon,
          description: categoryDesc,
          image: categoryImage
        });
      }
      setIsCategoryModalOpen(false);
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    setCoupons([
      ...coupons,
      { code: newCode.toUpperCase().trim(), discount: Number(newDiscount), minOrder: Number(newMinOrder), active: true }
    ]);
    setNewCode('');
    addToast('تم إنشاء الكوبون', `كوبون ${newCode.toUpperCase()} مفعل الآن للمتسوقين`, 'success');
  };

  const filteredProducts = adminProducts.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.approvalStatus === statusFilter;
    const matchesSearch =
      searchTerm.trim() === '' ||
      p.title.includes(searchTerm) ||
      p.sellerName.includes(searchTerm) ||
      p.sellerGovernorate.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>معتمد ومنشور</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>قيد المراجعة</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-900 border border-rose-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>مرفوض</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 border border-gray-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
            <FileText className="w-3 h-3 text-gray-500" />
            <span>مسودة</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-[#2D2A26] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#443E38]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#B45F42]/30 border border-[#B45F42]/50 flex items-center justify-center text-[#B45F42] shrink-0">
            {currentUser.profileImage?.secureUrl || currentUser.avatar ? (
              <img
                src={currentUser.profileImage?.secureUrl || currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ShieldAlert className="w-8 h-8 text-amber-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-heritage">لوحة الإدارة المركزية لمنصة سوق الصعيد</h1>
              <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                Super Admin
              </span>
              <button
                type="button"
                id="admin-profile-settings-btn"
                onClick={() => setActivePage('buyer-account')}
                className="text-[11px] text-amber-300 hover:text-amber-100 underline mr-2"
              >
                تغيير الصورة الشخصية
              </button>
            </div>
            <p className="text-xs text-[#E8E1D9]/80 mt-1">
              مراقبة المنظومة، مراجعة وتوثيق أصالة المنتجات التراثية، إدارة التصنيفات والمراجعات، وشحنات الصعيد
            </p>
          </div>
        </div>

        {pendingProducts.length > 0 && (
          <div className="bg-amber-500/20 border border-amber-500/40 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-amber-300 text-xs font-bold">
            <Clock className="w-4 h-4 animate-pulse text-amber-400" />
            <span>يوجد {pendingProducts.length} منتج بانتظار قرار الفحص والاعتماد</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E1D9] overflow-x-auto pb-2 no-scrollbar px-1">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'overview'
            ? 'bg-[#B45F42] text-white shadow-xs'
            : 'bg-white text-[#2D2A26] hover:bg-[#F3EFE9] border border-[#E8E1D9]'
            }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>المؤشرات العامة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap relative ${activeTab === 'approvals'
            ? 'bg-[#B45F42] text-white shadow-xs'
            : 'bg-white text-[#2D2A26] hover:bg-[#F3EFE9] border border-[#E8E1D9]'
            }`}
        >
          <Package className="w-4 h-4" />
          <span>فحص واعتماد المنتجات</span>
          {pendingProducts.length > 0 && (
            <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
              {pendingProducts.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'categories'
            ? 'bg-[#B45F42] text-white shadow-xs'
            : 'bg-white text-[#2D2A26] hover:bg-[#F3EFE9] border border-[#E8E1D9]'
            }`}
        >
          <Layers className="w-4 h-4" />
          <span>التصنيفات التراثية ({categories.length})</span>
        </button>

        <button
          type="button"
          id="admin-tab-craft-stories"
          onClick={() => setActiveTab('craft-stories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'craft-stories'
            ? 'bg-[#B45F42] text-white shadow-xs'
            : 'bg-white text-[#2D2A26] hover:bg-[#F3EFE9] border border-[#E8E1D9]'
            }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>قصص الصنعة وأسرار الأجداد ({craftStories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'reviews'
            ? 'bg-[#B45F42] text-white shadow-xs'
            : 'bg-white text-[#2D2A26] hover:bg-[#F3EFE9] border border-[#E8E1D9]'
            }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>مراجعات وتقييمات المشترين</span>
        </button>

        <button
          type="button"
          id="admin-tab-sellers"
          onClick={() => setActiveTab('sellers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'sellers'
            ? 'bg-[#B45F42] text-white shadow-xs'
            : 'bg-white text-[#2D2A26] hover:bg-[#F3EFE9] border border-[#E8E1D9]'
            }`}
        >
          <Store className="w-4 h-4" />
          <span>الورش والحرفيون ({sellers.length})</span>
          {pendingSellersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold animate-pulse">
              {pendingSellersCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'orders'
            ? 'bg-[#B45F42] text-white shadow-xs'
            : 'bg-white text-[#2D2A26] hover:bg-[#F3EFE9] border border-[#E8E1D9]'
            }`}
        >
          <Truck className="w-4 h-4" />
          <span>مراقبة الشحنات والطلبات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'coupons'
            ? 'bg-[#B45F42] text-white shadow-xs'
            : 'bg-white text-[#2D2A26] hover:bg-[#F3EFE9] border border-[#E8E1D9]'
            }`}
        >
          <Tag className="w-4 h-4" />
          <span>أكواد الخصم</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'audit'
            ? 'bg-[#B45F42] text-white shadow-xs'
            : 'bg-white text-[#2D2A26] hover:bg-[#F3EFE9] border border-[#E8E1D9]'
            }`}
        >
          <FileText className="w-4 h-4" />
          <span>سجل الرقابة (Audit)</span>
        </button>

        <button
          type="button"
          id="admin-tab-users"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'users'
            ? 'bg-[#B45F42] text-white shadow-xs'
            : 'bg-white text-[#2D2A26] hover:bg-[#F3EFE9] border border-[#E8E1D9]'
            }`}
        >
          <Users className="w-4 h-4" />
          <span>إدارة المستخدمين ({adminUsers.length || '...'})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <span className="text-xs text-[#7A6F64] block mb-1">إجمالي حجم مبيعات المنصة (GMV)</span>
              <span className="text-2xl font-black text-[#2D2A26] font-mono">{totalMarketplaceSales.toLocaleString()} ج.م</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">+24% مقارنة بالشهر السابق</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <span className="text-xs text-[#7A6F64] block mb-1">إجمالي الحرفيين والورش</span>
              <span className="text-2xl font-black text-[#2D2A26] font-mono">{sellers.length} ورشة</span>
              <span className="text-[10px] text-[#B45F42] font-bold block mt-1">تغطي 7 محافظات صعيدية</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <span className="text-xs text-[#7A6F64] block mb-1">المنتجات الحرفية النشطة</span>
              <span className="text-2xl font-black text-[#2D2A26] font-mono">
                {adminProducts.filter((p) => p.approvalStatus === 'approved').length} قطعة
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">100% تم فحص أصالتها</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <span className="text-xs text-[#7A6F64] block mb-1">طلبات الشحن المنفذة</span>
              <span className="text-2xl font-black text-[#2D2A26] font-mono">{orders.length} شحنة</span>
              <span className="text-[10px] text-[#7A6F64] block mt-1">نسبة كسر التغليف &lt; 0.2%</span>
            </div>
          </div>

          {/* Pending Queue Highlight */}
          <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#2D2A26]">طابور المراجعة السريعة للمنتجات الجديدة</h3>
              <button
                type="button"
                onClick={() => setActiveTab('approvals')}
                className="text-xs font-bold text-[#B45F42] hover:underline"
              >
                فتح قائمة الاعتماد الكاملة ({pendingProducts.length})
              </button>
            </div>

            {pendingProducts.length === 0 ? (
              <div className="text-center py-8 bg-[#FDFBF7] rounded-2xl border border-dashed border-[#E8E1D9]">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-[#2D2A26]">لا توجد طلبات معلقة حالياً - تم فحص جميع المنتجات المدرجة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingProducts.slice(0, 3).map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img src={prod.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover border border-[#E8E1D9]" />
                      <div>
                        <h4 className="font-bold text-sm text-[#2D2A26]">{prod.title}</h4>
                        <p className="text-xs text-[#7A6F64]">
                          الورشة: <strong>{prod.sellerName}</strong> • محافظة {prod.sellerGovernorate} • السعر: {prod.price} ج.م
                        </p>
                        <p className="text-[11px] text-[#B45F42] mt-0.5">
                          الخامات: {prod.specifications.material} • الصنعة: {prod.specifications.craftsmanship}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleApprove(prod.id)}
                        disabled={isProcessing}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>موافقة ونشر</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openRejectModal(prod.id)}
                        disabled={isProcessing}
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>رفض مع ذكر السبب</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: APPROVALS QUEUE & CATALOG AUDIT */}
      {activeTab === 'approvals' && (
        <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-[#2D2A26]">طابور فحص واعتماد المنتجات التراثية</h3>
              <p className="text-xs text-[#7A6F64]">
                يجب فحص كل قطعة للتأكد من أصالتها ومطابقتها للمواصفات التراثية قبل إتاحتها للمشترين في المتجر العام
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-[#F3EFE9] p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'all' ? 'bg-[#2D2A26] text-white' : 'text-[#7A6F64]'
                  }`}
              >
                الكل ({adminProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${statusFilter === 'pending' ? 'bg-amber-600 text-white' : 'text-[#7A6F64]'
                  }`}
              >
                <span>قيد المراجعة</span>
                <span className="bg-amber-400 text-amber-950 text-[10px] px-1 rounded-full font-black">
                  {pendingProducts.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('approved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'approved' ? 'bg-emerald-700 text-white' : 'text-[#7A6F64]'
                  }`}
              >
                معتمد
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('rejected')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'rejected' ? 'bg-rose-700 text-white' : 'text-[#7A6F64]'
                  }`}
              >
                مرفوض
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#7A6F64] absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث باسم المنتج، الورشة، أو المحافظة..."
              className="w-full pr-10 pl-4 py-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
            />
          </div>

          {/* Products List */}
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-[#FDFBF7] border border-dashed border-[#E8E1D9] rounded-2xl">
                <Package className="w-8 h-8 text-[#7A6F64] mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-[#2D2A26]">لا توجد منتجات تطابق الفلتر الحالي</p>
              </div>
            ) : (
              filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className={`p-4 rounded-2xl border transition-all ${prod.approvalStatus === 'pending'
                    ? 'bg-amber-50/50 border-amber-300'
                    : prod.approvalStatus === 'rejected'
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-[#FDFBF7] border-[#E8E1D9]'
                    }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={prod.images[0]}
                        alt={prod.title}
                        className="w-16 h-16 rounded-xl object-cover border border-[#E8E1D9] shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm text-[#2D2A26]">{prod.title}</h4>
                          {getStatusBadge(prod.approvalStatus)}
                          <span className="text-[10px] bg-amber-100 text-[#B45F42] px-2 py-0.5 rounded font-bold">
                            {prod.categoryName}
                          </span>
                        </div>
                        <p className="text-xs text-[#7A6F64]">
                          الورشة: <strong>{prod.sellerName}</strong> • محافظة {prod.sellerGovernorate} • السعر: <strong className="text-[#B45F42]">{prod.price} ج.م</strong>
                        </p>
                        <p className="text-[11px] text-[#7A6F64]">
                          الخامات: {prod.specifications.material} • أسلوب الصنع: {prod.specifications.craftsmanship}
                        </p>
                      </div>
                    </div>

                    {/* Moderation Controls */}
                    <div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 w-full md:w-auto">
                      {prod.approvalStatus !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleApprove(prod.id)}
                          disabled={isProcessing}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>موافقة ونشر</span>
                        </button>
                      )}

                      {prod.approvalStatus !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => openRejectModal(prod.id)}
                          disabled={isProcessing}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>رفض المنتج</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rejection reason if any */}
                  {prod.approvalStatus === 'rejected' && prod.rejectionReason && (
                    <div className="mt-3 p-3 bg-rose-100/80 border border-rose-300 rounded-xl text-xs space-y-1">
                      <span className="font-bold text-rose-900 block">سبب الرفض المسجل للحرفي:</span>
                      <p className="text-rose-800 leading-relaxed">{prod.rejectionReason}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: CATEGORIES MANAGEMENT (PHASE 4) */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-[#2D2A26]">إدارة التصنيفات والحرف التراثية</h3>
              <p className="text-xs text-[#7A6F64]">
                تصنيف القطع الحرفية حسب نوع الفن (فخار، نسيج، خوص، نحاس، حلي، خشب، مأكولات)
              </p>
            </div>

            <button
              type="button"
              onClick={openAddCategoryModal}
              className="px-4 py-2.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة تصنيف تراثي جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E8E1D9] space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{cat.icon || '🏺'}</span>
                      <div>
                        <h4 className="font-bold text-sm text-[#2D2A26]">{cat.name}</h4>
                        {cat.nameEn && <span className="text-[10px] text-[#7A6F64] block font-mono">{cat.nameEn}</span>}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold font-mono bg-amber-100 text-[#B45F42] px-2 py-0.5 rounded-full">
                      {cat.productCount || 0} منتج
                    </span>
                  </div>
                  <p className="text-xs text-[#7A6F64] line-clamp-2 leading-relaxed">
                    {cat.description || 'الحرف اليدوية والفنون التراثية الأصيلة بمحافظات الصعيد.'}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E1D9]">
                  <button
                    type="button"
                    onClick={() => openEditCategoryModal(cat)}
                    className="p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-[#E8E1D9] text-xs font-bold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف تصنيف "${cat.name}"؟`)) {
                        deleteCategory(cat.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: CRAFT STORIES MANAGEMENT (قصص الصنعة وأسرار الأجداد) */}
      {activeTab === 'craft-stories' && (
        <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-[#2D2A26]">قصص الصنعة وأسرار الأجداد (قاعدة البيانات)</h3>
                <span className="bg-amber-100 text-[#943310] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  craft_stories collection
                </span>
              </div>
              <p className="text-xs text-[#7A6F64] mt-1">
                إدارة أطلس الحرف التراثية وأسرار الحرفيين المعروضة في واجهة المتجر الرئيسية، مع إمكانية التعديل والإضافة والإخفاء الفوري.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchCraftStories}
                disabled={isLoadingCraftStories}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                title="تحديث من قاعدة البيانات"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCraftStories ? 'animate-spin' : ''}`} />
                <span>تحديث</span>
              </button>

              <button
                type="button"
                id="admin-add-craft-story-btn"
                onClick={openAddCraftStoryModal}
                className="px-4 py-2.5 bg-[#943310] hover:bg-[#7c280a] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قصة صنعة جديدة</span>
              </button>
            </div>
          </div>

          {isLoadingCraftStories && craftStories.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#943310]" />
              <span>جاري تحميل قصص الصنعة من قاعدة البيانات...</span>
            </div>
          ) : craftStories.length === 0 ? (
            <div className="p-8 text-center bg-[#FDFBF7] rounded-2xl border border-dashed border-[#E8E1D9] space-y-3">
              <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-sm font-bold text-gray-700">لا توجد قصص صنعة مسجلة حالياً في قاعدة البيانات</p>
              <button
                type="button"
                onClick={openAddCraftStoryModal}
                className="px-4 py-2 bg-[#943310] text-white text-xs font-bold rounded-xl"
              >
                إضافة القصة الأولى الآن
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {craftStories.map((story) => (
                <div
                  key={story.id}
                  className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between bg-white shadow-xs ${story.active === false ? 'border-gray-300 opacity-70 bg-gray-50' : 'border-[#E8E1D9] hover:border-amber-700/30'
                    }`}
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-gray-200 shadow-xs relative">
                        <img
                          src={story.image}
                          alt={story.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-sm">
                          #{story.displayOrder ?? 1}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-[#943310] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            {story.governorate}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${story.active === false
                              ? 'bg-gray-200 text-gray-600'
                              : 'bg-emerald-100 text-emerald-800'
                              }`}
                          >
                            {story.active === false ? 'مخفية بالواجهة' : 'نشطة وظاهرة'}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{story.title}</h4>
                        <p className="text-xs text-amber-800 font-medium line-clamp-1">{story.subtitle}</p>
                        <p className="text-[11px] text-gray-500 font-mono">العمر: {story.historyAge}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed bg-[#faf6f0] p-2.5 rounded-xl border border-[#ebdccd]">
                      {story.description}
                    </p>

                    {/* Key features pill list */}
                    {Array.isArray(story.keyFeatures) && story.keyFeatures.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-500 block">أسرار الصنعة المسجلة:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {story.keyFeatures.slice(0, 3).map((feat, fi) => (
                            <span
                              key={fi}
                              className="text-[10px] bg-white text-gray-700 px-2 py-0.5 rounded-md border border-gray-200 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="line-clamp-1">{feat}</span>
                            </span>
                          ))}
                          {story.keyFeatures.length > 3 && (
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md font-mono">
                              +{story.keyFeatures.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-5 py-3 bg-[#faf7f2] border-t border-[#E8E1D9] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleCraftStoryActive(story)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${story.active === false
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                    >
                      {story.active === false ? 'تفعيل وإظهار' : 'إخفاء من المتجر'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditCraftStoryModal(story)}
                        className="p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-[#E8E1D9] text-xs font-bold flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCraftStory(story)}
                        className="p-2 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: REVIEWS MODERATION (PHASE 4) */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-[#2D2A26]">إشراف ومراجعة تقييمات المشترين</h3>
              <p className="text-xs text-[#7A6F64]">
                مراجعة تعليقات العملاء، شارة الشراء المؤكد، ومنع التقييمات العشوائية أو غير اللائقة
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                refreshReviews();
                addToast('تحديث', 'تم تحديث قائمة المراجعات', 'info');
              }}
              className="px-3.5 py-2 bg-[#FDFBF7] hover:bg-[#F3EFE9] border border-[#E8E1D9] text-xs font-bold text-[#2D2A26] rounded-xl flex items-center gap-2 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#B45F42]" />
              <span>مزامنة التقييمات</span>
            </button>
          </div>

          <div className="space-y-3">
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-[#FDFBF7] border border-dashed border-[#E8E1D9] rounded-2xl">
                <MessageSquare className="w-8 h-8 text-[#7A6F64] mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-[#2D2A26]">لا توجد مراجعات مسجلة حتى الآن</p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E8E1D9] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs text-[#2D2A26]">{rev.userName || 'مشتري معتمد'}</span>
                      {rev.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                          <BadgeCheck className="w-3 h-3 text-emerald-600" />
                          <span>شراء مؤكد (Verified)</span>
                        </span>
                      )}
                      <div className="flex items-center text-amber-500 mr-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-[#7A6F64] font-mono">{rev.date}</span>
                    </div>

                    <p className="text-xs text-[#2D2A26] leading-relaxed">"{rev.comment}"</p>

                    <div className="text-[11px] text-[#7A6F64] flex items-center gap-3">
                      <span>المنتج المستهدف: <strong className="text-[#B45F42]">{rev.productTitle || rev.productId}</strong></span>
                      <span>المحافظة: {rev.userGovernorate || 'الصعيد'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => moderateReview(rev.id, 'published')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>اعتماد</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => moderateReview(rev.id, 'hidden')}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>حجب</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SELLERS MANAGEMENT & APPROVALS */}
      {activeTab === 'sellers' && (
        <div className="space-y-6">
          {/* Header & Stats Banner */}
          <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-[#2D2A26] font-heritage">إدارة الورش واعتماد الحرفيين</h3>
                {pendingSellersCount > 0 && (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black px-2.5 py-0.5 rounded-full animate-pulse">
                    {pendingSellersCount} طلب جديد بالانتظار
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7A6F64] mt-0.5">
                مراجعة طلبات انضمام الورش، توثيق الحرفيين الصعايدة، واعتماد أو تعليق الحسابات
              </p>
            </div>

            {/* Quick Action / Refresh */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="admin-refresh-sellers-btn"
                onClick={() => refreshSellers()}
                className="px-4 py-2 bg-[#F3EFE9] hover:bg-[#EDE7DF] text-[#2D2A26] text-xs font-bold rounded-xl border border-[#E8E1D9] flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تحديث القائمة</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs & Search Bar */}
          <div className="bg-white rounded-2xl border border-[#E8E1D9] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                id="filter-sellers-all"
                onClick={() => setSellerStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${sellerStatusFilter === 'all'
                  ? 'bg-[#B45F42] text-white shadow-xs'
                  : 'bg-[#F3EFE9] text-[#7A6F64] hover:bg-[#EDE7DF]'
                  }`}
              >
                الكل ({sellers.length})
              </button>

              <button
                type="button"
                id="filter-sellers-pending"
                onClick={() => setSellerStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${sellerStatusFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                  }`}
              >
                <span>قيد المراجعة</span>
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingSellersCount}
                </span>
              </button>

              <button
                type="button"
                id="filter-sellers-approved"
                onClick={() => setSellerStatusFilter('approved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${sellerStatusFilter === 'approved'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                  }`}
              >
                معتمد وموثق ({sellers.filter((s) => s.status === 'approved').length})
              </button>

              <button
                type="button"
                id="filter-sellers-suspended"
                onClick={() => setSellerStatusFilter('suspended')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${sellerStatusFilter === 'suspended'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-100'
                  }`}
              >
                معلق ({sellers.filter((s) => s.status === 'suspended').length})
              </button>

              <button
                type="button"
                id="filter-sellers-rejected"
                onClick={() => setSellerStatusFilter('rejected')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${sellerStatusFilter === 'rejected'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
                  }`}
              >
                مرفوض ({sellers.filter((s) => s.status === 'rejected').length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-[#7A6F64] absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="seller-search-input"
                value={sellerSearchTerm}
                onChange={(e) => setSellerSearchTerm(e.target.value)}
                placeholder="ابحث بالاسم، الورشة، المحافظة..."
                className="w-full pl-8 pr-9 py-2 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42] transition-colors"
              />
              {sellerSearchTerm && (
                <button
                  type="button"
                  onClick={() => setSellerSearchTerm('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Sellers Cards Grid / List */}
          <div className="space-y-3">
            {filteredSellers.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E8E1D9] p-12 text-center shadow-xs">
                <Store className="w-12 h-12 text-[#7A6F64]/40 mx-auto mb-3" />
                <h4 className="font-bold text-sm text-[#2D2A26]">لا توجد ورش مطابقة لمعايير البحث</h4>
                <p className="text-xs text-[#7A6F64] mt-1">
                  جرب تغيير حالة الفرز أو مسح كلمة البحث لرؤية كافة الورش المسجلة
                </p>
              </div>
            ) : (
              filteredSellers.map((s) => (
                <div
                  key={s.id}
                  id={`seller-card-${s.id}`}
                  className="bg-white rounded-2xl border border-[#E8E1D9] p-5 shadow-xs hover:border-[#B45F42]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Seller Info Column */}
                  <div className="flex items-start gap-4">
                    <img
                      src={s.avatar}
                      alt={s.brandName}
                      className="w-14 h-14 rounded-2xl object-cover border border-[#E8E1D9] shrink-0"
                    />
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-base text-[#2D2A26]">{s.brandName}</h4>

                        {/* Status Badge */}
                        {s.status === 'approved' && (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>معتمد وموثق</span>
                          </span>
                        )}
                        {s.status === 'pending' && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>قيد المراجعة والاعتماد</span>
                          </span>
                        )}
                        {s.status === 'suspended' && (
                          <span className="bg-orange-100 text-orange-900 border border-orange-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-orange-600" />
                            <span>معلق مؤقتاً</span>
                          </span>
                        )}
                        {s.status === 'rejected' && (
                          <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>مرفوض</span>
                          </span>
                        )}

                        <span className="bg-[#F3EFE9] text-[#7A6F64] text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          محافظة {s.governorate}
                        </span>
                      </div>

                      {/* Details & Specs */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#7A6F64]">
                        <span>صاحب الورشة: <strong className="text-[#2D2A26]">{s.name}</strong></span>
                        <span>الحرفة: <strong className="text-[#2D2A26]">{s.specialty || 'مشغولات تراثية'}</strong></span>
                        <span>الهاتف: <strong className="text-[#2D2A26] font-mono">{s.phone}</strong></span>
                        {s.email && <span>البريد: <strong className="text-[#2D2A26]">{s.email}</strong></span>}
                      </div>

                      {/* Reasons display if rejected or suspended */}
                      {s.status === 'rejected' && s.rejectionReason && (
                        <div className="text-xs bg-rose-50 text-rose-800 px-3 py-1 rounded-lg border border-rose-200 inline-block mt-1">
                          <strong>سبب الرفض:</strong> {s.rejectionReason}
                        </div>
                      )}
                      {s.status === 'suspended' && s.suspensionReason && (
                        <div className="text-xs bg-orange-50 text-orange-900 px-3 py-1 rounded-lg border border-orange-200 inline-block mt-1">
                          <strong>سبب التعليق:</strong> {s.suspensionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 w-full md:w-auto">
                    {/* Action buttons based on current state */}
                    {s.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          id={`admin-approve-seller-${s.id}`}
                          onClick={() => approveSeller(s.id)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          <span>اعتماد الورشة</span>
                        </button>
                        <button
                          type="button"
                          id={`admin-reject-seller-${s.id}`}
                          onClick={() =>
                            setSelectedSellerForAction({
                              id: s.id,
                              name: s.brandName || s.name,
                              action: 'reject'
                            })
                          }
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>رفض الطلب</span>
                        </button>
                      </>
                    )}

                    {s.status === 'approved' && (
                      <button
                        type="button"
                        id={`admin-suspend-seller-${s.id}`}
                        onClick={() =>
                          setSelectedSellerForAction({
                            id: s.id,
                            name: s.brandName || s.name,
                            action: 'suspend'
                          })
                        }
                        className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>تعليق الحساب</span>
                      </button>
                    )}

                    {(s.status === 'suspended' || s.status === 'rejected') && (
                      <button
                        type="button"
                        id={`admin-reactivate-seller-${s.id}`}
                        onClick={() => approveSeller(s.id)}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>إعادة الاعتماد والتفعيل</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-[#2D2A26]">سجل طلبات وشحنات المنصة</h3>
            <p className="text-xs text-[#7A6F64]">متابعة كافة المعاملات وحالات التسليم بمختلف المحافظات</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-[#F3EFE9] text-[#7A6F64] border-b border-[#E8E1D9]">
                <tr>
                  <th className="py-3 px-4 font-bold">رقم الطلب</th>
                  <th className="py-3 px-4 font-bold">المشتري</th>
                  <th className="py-3 px-4 font-bold">وجهة التوصيل</th>
                  <th className="py-3 px-4 font-bold">وسيلة الدفع</th>
                  <th className="py-3 px-4 font-bold">المبلغ</th>
                  <th className="py-3 px-4 font-bold">الحالة الإدارية</th>
                  <th className="py-3 px-4 font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D9]">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FDFBF7]">
                    <td className="py-3 px-4 font-mono font-bold text-[#B45F42]">
                      {ord.orderNumber || ord.id}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#2D2A26]">
                      {ord.shippingAddress?.fullName || (ord.shippingAddress as any)?.buyerName || ord.buyerName}
                      <span className="block text-[10px] text-gray-500 font-normal">
                        {ord.shippingAddress?.phone || (ord.shippingAddress as any)?.buyerPhone || ord.buyerPhone}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {ord.shippingAddress?.governorate || 'المحافظة'} ({ord.shippingAddress?.city || 'المدينة'})
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-700">
                      {ord.paymentMethod === 'vodafone_cash'
                        ? 'فودافون كاش'
                        : ord.paymentMethod === 'instapay'
                          ? 'إنستاباي'
                          : ord.paymentMethod === 'credit_card'
                            ? 'بطاقة بنكية'
                            : 'عند الاستلام'}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#B45F42]">{ord.total} ج.م</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${ord.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'processing'
                              ? 'bg-amber-100 text-amber-800'
                              : ord.status === 'confirmed'
                                ? 'bg-indigo-100 text-indigo-800'
                                : ord.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {ord.status === 'cancelled'
                          ? 'ملغي'
                          : ord.status === 'delivered'
                            ? 'تم الاستلام'
                            : ord.status === 'shipped'
                              ? 'تم الشحن'
                              : ord.status === 'processing'
                                ? 'قيد التجهيز'
                                : ord.status === 'confirmed'
                                  ? 'معتمد ومؤكد'
                                  : 'طلب جديد'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className="px-2 py-1 bg-white border border-[#E8E1D9] rounded-lg text-[11px] font-bold text-gray-700 outline-none"
                      >
                        <option value="pending">جديد (Pending)</option>
                        <option value="confirmed">تأكيد (Confirmed)</option>
                        <option value="processing">تجهيز (Processing)</option>
                        <option value="shipped">شحن (Shipped)</option>
                        <option value="delivered">تسليم (Delivered)</option>
                        <option value="cancelled">إلغاء (Cancelled)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 5: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <form onSubmit={handleCreateCoupon} className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-[#2D2A26]">إنشاء كود خصم ترويجي جديد</h3>

              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">رمز الكوبون (بالأحرف اللاتينية)</label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="مثال: UPPEREGYPT25"
                  className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs font-mono uppercase outline-none focus:border-[#B45F42]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">نسبة الخصم (%)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={90}
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">الحد الأدنى للطلب (ج.م)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newMinOrder}
                    onChange={(e) => setNewMinOrder(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#B45F42] hover:bg-[#9E4F36] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>تفعيل ونشر الكوبون</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-[#2D2A26]">أكواد الخصم النشطة في النظام</h3>

              <div className="space-y-3">
                {coupons.map((c, i) => (
                  <div key={i} className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#E8E1D9] flex items-center justify-between">
                    <div>
                      <span className="font-mono font-black text-sm text-[#B45F42] block">{c.code}</span>
                      <span className="text-xs text-[#7A6F64]">
                        خصم <strong>{c.discount}%</strong> • للطلبات فوق {c.minOrder} ج.م
                      </span>
                    </div>

                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                      نشط ويعمل
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-[#2D2A26]">سجل العمليات والرقابة الأمنية (Audit Logs)</h3>
            <p className="text-xs text-[#7A6F64]">
              سجل تفصيلي لجميع إجراءات الاعتماد، الرفض، ونشر المنتجات موثق بالوقت والمستخدم
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-[#F3EFE9] text-[#7A6F64] border-b border-[#E8E1D9]">
                <tr>
                  <th className="py-3 px-4 font-bold">الوقت والتاريخ</th>
                  <th className="py-3 px-4 font-bold">المستخدم والصفة</th>
                  <th className="py-3 px-4 font-bold">الإجراء</th>
                  <th className="py-3 px-4 font-bold">المورد المستهدف</th>
                  <th className="py-3 px-4 font-bold">تفاصيل العملية</th>
                  <th className="py-3 px-4 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D9]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FDFBF7]">
                    <td className="py-3 px-4 font-mono text-[#7A6F64] whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-4 font-bold text-[#2D2A26]">
                      {log.userName}
                      <span className="block text-[10px] text-[#7A6F64] font-normal">{log.userRole}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#B45F42]">{log.action}</td>
                    <td className="py-3 px-4 text-[#2D2A26]">{log.resource}</td>
                    <td className="py-3 px-4 text-[#7A6F64] max-w-xs">{log.details}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${log.status === 'نجاح'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'تنبيه'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                          }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 9: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <span className="text-xs text-[#7A6F64] block mb-1">إجمالي الحسابات المسجلة</span>
              <span className="text-2xl font-black text-[#2D2A26] font-mono">{adminUsers.length}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <span className="text-xs text-[#7A6F64] block mb-1">حسابات المشترين (Buyers)</span>
              <span className="text-2xl font-black text-blue-700 font-mono">
                {adminUsers.filter((u) => u.role === 'buyer').length}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <span className="text-xs text-[#7A6F64] block mb-1">ورش وحرفيو الصعيد (Sellers)</span>
              <span className="text-2xl font-black text-amber-700 font-mono">
                {adminUsers.filter((u) => u.role === 'seller').length}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <span className="text-xs text-[#7A6F64] block mb-1">مديرو المنصة (Admins)</span>
              <span className="text-2xl font-black text-purple-700 font-mono">
                {adminUsers.filter((u) => u.role === 'admin').length}
              </span>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
              <input
                type="text"
                id="admin-users-search-input"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="بحث بالاسم، البريد الإلكتروني، أو الهاتف..."
                className="w-full pl-3 pr-10 py-2 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#7A6F64]" />
                <select
                  id="admin-users-role-filter"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="p-2 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42] font-medium"
                >
                  <option value="all">جميع الأدوار</option>
                  <option value="buyer">المشترون فقط</option>
                  <option value="seller">الحرفيون والورش فقط</option>
                  <option value="admin">المديرون فقط</option>
                </select>
              </div>

              <button
                type="button"
                id="admin-users-refresh-btn"
                onClick={fetchAdminUsers}
                disabled={isLoadingUsers}
                className="p-2 bg-[#FDFBF7] hover:bg-[#E8E1D9] text-[#2D2A26] rounded-xl border border-[#E8E1D9] text-xs font-bold transition-all flex items-center gap-1.5"
                title="تحديث القائمة"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                <span>تحديث</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-[#E8E1D9] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#FDFBF7] border-b border-[#E8E1D9] text-[#7A6F64]">
                  <tr>
                    <th className="py-3 px-4 font-bold">المستخدم</th>
                    <th className="py-3 px-4 font-bold">الدور</th>
                    <th className="py-3 px-4 font-bold">المحافظة</th>
                    <th className="py-3 px-4 font-bold">الهاتف</th>
                    <th className="py-3 px-4 font-bold">تاريخ الانضمام</th>
                    <th className="py-3 px-4 font-bold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E1D9]">
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#B45F42]" />
                        <span>جاري تحميل بيانات المستخدمين من قاعدة البيانات...</span>
                      </td>
                    </tr>
                  ) : adminUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        لا توجد حسابات تطابق معايير البحث والفلترة.
                      </td>
                    </tr>
                  ) : (
                    adminUsers.map((u) => {
                      const isCurrentAdmin = currentUser.id === u.id;
                      return (
                        <tr key={u.id} className="hover:bg-[#FDFBF7]/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.profileImage?.secureUrl || u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                                alt={u.name}
                                className="w-9 h-9 rounded-xl object-cover border border-[#E8E1D9] shrink-0"
                              />
                              <div>
                                <span className="font-bold text-[#2D2A26] block">{u.name}</span>
                                <span className="text-[11px] text-gray-500">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'seller'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                                }`}
                            >
                              {u.role === 'admin' ? 'مدير منصة' : u.role === 'seller' ? 'بائع حرفي' : 'مشتري موثق'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-[#2D2A26]">{u.governorate || 'غير محدد'}</td>
                          <td className="py-3 px-4 font-mono text-gray-600">{u.phone || '---'}</td>
                          <td className="py-3 px-4 text-gray-500 text-[11px]">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG') : '---'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                id={`view-user-${u.id}`}
                                onClick={() => openUserDetails(u.id)}
                                className="px-3 py-1.5 bg-[#FDFBF7] hover:bg-[#E8E1D9] text-[#2D2A26] border border-[#E8E1D9] rounded-xl text-xs font-bold transition-all"
                              >
                                عرض الحساب
                              </button>

                              {isCurrentAdmin ? (
                                <span
                                  title="حسابك الشخصي (الحذف الذاتي محظور)"
                                  className="px-3 py-1.5 bg-gray-100 text-gray-400 border border-gray-200 rounded-xl text-xs font-bold cursor-not-allowed"
                                >
                                  حسابك
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  id={`delete-user-${u.id}`}
                                  onClick={() => setSelectedUserForDelete(u)}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>حذف</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Category Add / Edit Modal (Phase 4) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E8E1D9] max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-[#E8E1D9] pb-3">
              <h3 className="font-bold text-base text-[#2D2A26]">
                {editingCategory ? 'تعديل التصنيف التراثي' : 'إضافة تصنيف تراثي جديد'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">اسم التصنيف (عربي) *</label>
                  <input
                    type="text"
                    required
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="مثال: فخار وخزف قنا"
                    className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">الاسم بالإنجليزية</label>
                  <input
                    type="text"
                    value={categoryNameEn}
                    onChange={(e) => setCategoryNameEn(e.target.value)}
                    placeholder="e.g. Pottery & Ceramics"
                    className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">الأيقونة (Emoji أو رمز)</label>
                  <input
                    type="text"
                    value={categoryIcon}
                    onChange={(e) => setCategoryIcon(e.target.value)}
                    className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-center text-lg outline-none focus:border-[#B45F42]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">المعرف (Slug)</label>
                  <input
                    type="text"
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    placeholder="cat-pottery"
                    className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs font-mono outline-none focus:border-[#B45F42]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">رابط صورة التصنيف</label>
                <input
                  type="url"
                  value={categoryImage}
                  onChange={(e) => setCategoryImage(e.target.value)}
                  className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">وصف الحرفة والتراث</label>
                <textarea
                  rows={2}
                  value={categoryDesc}
                  onChange={(e) => setCategoryDesc(e.target.value)}
                  placeholder="نبذة عن الحرفة وتاريخها بمحافظات الصعيد..."
                  className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E1D9]">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#7A6F64]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCat}
                  className="px-5 py-2.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {isSubmittingCat ? 'جاري الحفظ...' : 'حفظ التصنيف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Craft Story Add / Edit Modal (قصص الصنعة وأسرار الأجداد) */}
      {isCraftStoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E8E1D9] max-w-xl w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-[#E8E1D9] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-[#2D2A26]">
                  {editingCraftStory ? 'تعديل قصة الصنعة التراثية' : 'إضافة قصة صنعة جديدة في الداتا بيز'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCraftStoryModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCraftStory} className="space-y-3.5 text-right">
              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">عنوان الحرفة التراثية *</label>
                <input
                  type="text"
                  required
                  value={craftTitle}
                  onChange={(e) => setCraftTitle(e.target.value)}
                  placeholder="مثال: فخار قنا وأسيوط (طين النيل العذب)"
                  className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#943310]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">العنوان الفرعي وسر الحرفة</label>
                <input
                  type="text"
                  value={craftSubtitle}
                  onChange={(e) => setCraftSubtitle(e.target.value)}
                  placeholder="مثال: سر البرودة والنكهة الخالدة منذ عهد الفراعنة"
                  className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#943310]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">المحافظة أو الموطن *</label>
                  <input
                    type="text"
                    required
                    value={craftGovernorate}
                    onChange={(e) => setCraftGovernorate(e.target.value)}
                    placeholder="مثال: قنا وأسيوط"
                    className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#943310]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">عمر الحرفة التقديري</label>
                  <input
                    type="text"
                    value={craftHistoryAge}
                    onChange={(e) => setCraftHistoryAge(e.target.value)}
                    placeholder="مثال: أكثر من 5000 عام"
                    className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#943310]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">القسم التراثي المرتبط</label>
                  <select
                    value={craftCategoryId}
                    onChange={(e) => setCraftCategoryId(e.target.value)}
                    className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#943310]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">ترتيب الظهور (رقم)</label>
                  <input
                    type="number"
                    min="1"
                    value={craftDisplayOrder}
                    onChange={(e) => setCraftDisplayOrder(Number(e.target.value) || 1)}
                    className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#943310]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">رابط صورة الحرفة (URL)</label>
                <input
                  type="url"
                  value={craftImage}
                  onChange={(e) => setCraftImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#943310]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">قصة الحرفة وسر الأجداد *</label>
                <textarea
                  required
                  rows={3}
                  value={craftDescription}
                  onChange={(e) => setCraftDescription(e.target.value)}
                  placeholder="اكتب بالتفصيل قصة الصنعة وأسرار توارثها بين الأجيال..."
                  className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#943310]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                  أسرار ومميزات الحرفة (ميزة واحدة في كل سطر)
                </label>
                <textarea
                  rows={3}
                  value={craftKeyFeaturesText}
                  onChange={(e) => setCraftKeyFeaturesText(e.target.value)}
                  placeholder="تبريد طبيعي فوري عبر مسام الفخار&#10;صناعة يدوية على دولاب خشبي&#10;آمن وصحي 100%"
                  className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#943310]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="craft-active-toggle"
                  checked={craftActive}
                  onChange={(e) => setCraftActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#943310] focus:ring-[#943310]"
                />
                <label htmlFor="craft-active-toggle" className="text-xs font-bold text-gray-800 cursor-pointer">
                  تفعيل ظهور هذه القصة في الصفحة الرئيسية فوراً
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E1D9]">
                <button
                  type="button"
                  onClick={() => setIsCraftStoryModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#7A6F64]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  id="submit-craft-story-btn"
                  disabled={isSubmittingCraftStory}
                  className="px-5 py-2.5 bg-[#943310] hover:bg-[#7c280a] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {isSubmittingCraftStory ? 'جاري الحفظ في قاعدة البيانات...' : 'حفظ في الداتا بيز'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Product Modal with Reason Requirement */}
      {rejectingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E8E1D9] max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-[#E8E1D9] pb-3">
              <h3 className="font-bold text-base text-rose-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>رفض إدراج المنتج وتسجيل السبب</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectingProductId(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <p className="text-xs text-[#7A6F64] leading-relaxed">
                يرجى كتابة سبب واضح لرفض المنتج. سيظهر هذا السبب للحرفي في لوحة تحكمه حتى يتمكن من تعديل البيانات وإعادة الإرسال.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">سبب الرفض (إلزامي) *</label>
                <textarea
                  required
                  rows={4}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="مثال: يرجى كتابة تفاصيل دقيقة عن نوع الطين أو أسلوب الصنع اليدوي..."
                  className="w-full p-3 bg-[#FDFBF7] border border-rose-200 rounded-xl text-xs outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E1D9]">
                <button
                  type="button"
                  onClick={() => setRejectingProductId(null)}
                  className="px-4 py-2 text-xs font-bold text-[#7A6F64]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  تأكيد الرفض وإشعار الورشة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seller Action Modal (Reject or Suspend with Reason) */}
      {selectedSellerForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E8E1D9] max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-[#E8E1D9] pb-3">
              <h3 className={`font-bold text-base flex items-center gap-2 ${selectedSellerForAction.action === 'reject' ? 'text-rose-900' : 'text-orange-900'
                }`}>
                {selectedSellerForAction.action === 'reject' ? (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>رفض طلب انضمام الورشة: {selectedSellerForAction.name}</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-orange-600" />
                    <span>تعليق حساب الورشة مؤقتاً: {selectedSellerForAction.name}</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedSellerForAction(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSellerAction} className="space-y-4">
              <p className="text-xs text-[#7A6F64] leading-relaxed">
                {selectedSellerForAction.action === 'reject'
                  ? 'يرجى تدوين سبب واضح لرفض طلب انضمام هذه الورشة. سيتم حفظ السبب وإظهاره للحرفي في لوحة تحكمه.'
                  : 'يرجى تدوين سبب تعليق نشاط الورشة (مثل: ملاحظات جودة أو تأخر توريد). سيتوقف ظهور منتجات الورشة مؤقتاً.'}
              </p>

              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                  سبب الإجراء الإداري (إلزامي) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={sellerActionReason}
                  onChange={(e) => setSellerActionReason(e.target.value)}
                  placeholder={
                    selectedSellerForAction.action === 'reject'
                      ? 'مثال: المشغولات المقدمة لا تتبع الحرف التراثية الصعيدية المعتمدة...'
                      : 'مثال: تكرار شكاوى المشترين بشأن مطابقة المنتج للمواصفات...'
                  }
                  className={`w-full p-3 bg-[#FDFBF7] border rounded-xl text-xs outline-none ${selectedSellerForAction.action === 'reject'
                    ? 'border-rose-200 focus:border-rose-500'
                    : 'border-orange-200 focus:border-orange-500'
                    }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E1D9]">
                <button
                  type="button"
                  onClick={() => setSelectedSellerForAction(null)}
                  className="px-4 py-2 text-xs font-bold text-[#7A6F64]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  id="confirm-seller-action-btn"
                  disabled={isProcessingSellerAction}
                  className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 ${selectedSellerForAction.action === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                    }`}
                >
                  {isProcessingSellerAction
                    ? 'جاري التنفيذ...'
                    : selectedSellerForAction.action === 'reject'
                      ? 'تأكيد رفض الطلب'
                      : 'تأكيد تعليق الحساب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal (Safe Display) */}
      {selectedUserForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E8E1D9] max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-[#E8E1D9] pb-3">
              <h3 className="font-bold text-base text-[#2D2A26] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#B45F42]" />
                <span>تفاصيل حساب المستخدم</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUserForDetails(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#FDFBF7] rounded-2xl border border-[#E8E1D9]">
              <img
                src={selectedUserForDetails.profileImage?.secureUrl || selectedUserForDetails.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                alt={selectedUserForDetails.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
              />
              <div>
                <h4 className="font-bold text-base text-[#2D2A26]">{selectedUserForDetails.name}</h4>
                <p className="text-xs text-gray-500">{selectedUserForDetails.email}</p>
                <span className="inline-block mt-1 bg-amber-100 text-[#B45F42] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {selectedUserForDetails.role === 'admin' ? 'مدير المنصة' : selectedUserForDetails.role === 'seller' ? 'ورشة معتمدة' : 'متسوق موثق'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-500 block mb-0.5">رقم الهاتف:</span>
                <span className="font-bold font-mono text-[#2D2A26]">{selectedUserForDetails.phone || 'غير مسجل'}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-500 block mb-0.5">المحافظة:</span>
                <span className="font-bold text-[#2D2A26]">{selectedUserForDetails.governorate || 'غير محدد'}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-500 block mb-0.5">معرف الحساب (ID):</span>
                <span className="font-bold font-mono text-[11px] text-gray-700">{selectedUserForDetails.id}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-500 block mb-0.5">تاريخ التسجيل:</span>
                <span className="font-bold text-gray-700">
                  {selectedUserForDetails.createdAt ? new Date(selectedUserForDetails.createdAt).toLocaleDateString('ar-EG') : '---'}
                </span>
              </div>
            </div>

            {selectedUserForDetails.seller && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-2">
                <h5 className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-amber-700" />
                  <span>بيانات الورشة المرتبطة</span>
                </h5>
                <p className="text-gray-700"><strong>اسم الورشة:</strong> {selectedUserForDetails.seller.brandName || selectedUserForDetails.seller.name}</p>
                <p className="text-gray-700"><strong>الحرفة والتخصص:</strong> {selectedUserForDetails.seller.specialty || 'تراث يدوي'}</p>
                <p className="text-gray-700"><strong>حالة الاعتماد:</strong> {selectedUserForDetails.seller.status}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedUserForDetails(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {selectedUserForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-rose-200 max-w-md w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center gap-3 text-rose-700 border-b border-rose-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">تأكيد حذف الحساب نهائياً</h3>
                <p className="text-xs text-rose-600 font-medium">إجراء رقابي حاسم لا يمكن التراجع عنه</p>
              </div>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف حساب <strong className="text-gray-900">{selectedUserForDelete.name}</strong> ({selectedUserForDelete.email})؟
            </p>

            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-xs space-y-1.5 text-rose-900">
              <p className="font-bold">سيؤدي هذا الإجراء فوراً إلى:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-800">
                <li>حذف صورة الحساب من التخزين السحابي Cloudinary.</li>
                {selectedUserForDelete.role === 'seller' ? (
                  <>
                    <li>حذف الورشة وكافة المنتجات وصورها السحابية.</li>
                    <li>حفظ وتجهيل سجلات الطلبات التاريخية للعملاء.</li>
                  </>
                ) : (
                  <>
                    <li>مسح السلة والمفضلة والإشعارات الخاصة بالحساب.</li>
                    <li>حفظ وتجهيل سجلات الطلبات السابقة لحماية حقوق الورش.</li>
                  </>
                )}
                <li>توثيق العملية في سجل الرقابة الإداري (Audit Log).</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUserForDelete(null)}
                disabled={isDeletingUser}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
              >
                إلغاء
              </button>

              <button
                type="button"
                id="confirm-delete-user-btn"
                onClick={handleDeleteUser}
                disabled={isDeletingUser}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isDeletingUser ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري التنفيذ والحذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>تأكيد حذف الحساب</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
