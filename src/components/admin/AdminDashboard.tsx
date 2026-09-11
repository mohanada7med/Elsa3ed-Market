import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Product, OrderStatus, ProductStatus, Category, Review, CraftStory, Seller, Governorate, CraftReel } from '../../types.ts';
import { api } from '../../services/api.ts';
import { craftReelsService } from '../../services/craftReelsService.ts';
import { AdminPayouts } from './AdminPayouts.tsx';
import { NotificationsManager } from '../common/NotificationsManager.tsx';
import { RefreshDataButton } from '../common/RefreshDataButton.tsx';
import { ReelUploadModal } from '../common/ReelUploadModal.tsx';
import { ReelEditModal } from '../common/ReelEditModal.tsx';
import { CraftReelsModal } from '../public/CraftReelsModal.tsx';
import { AdminMediaUploader } from '../common/AdminMediaUploader.tsx';
import { AdminMediaLibraryPage } from './AdminMediaLibraryPage.tsx';
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
  RefreshCw,
  Key,
  UserCheck,
  UserX,
  Lock,
  UserPlus,
  Eye,
  Copy,
  KeyRound,
  CreditCard,
  DollarSign,
  Wallet,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Film,
  Play,
  Heart,
  Music,
  Bell,
  Landmark
} from 'lucide-react';

const HERITAGE_COVER_PRESETS = [
  {
    id: 'pottery-qena',
    title: 'فخار',
    craft: 'فخار طمي النيل خزفي وحرف يدوية',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788789133/WAH/crafts/qena-pottery/img_1788789133627_u027.jpg'
  },
  {
    id: 'rugs-sohag',
    title: 'سجاد وكليم',
    craft: 'نول يدوي ومنسوجات صوف وحرير',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788712729/%D9%83%D9%84%D9%8A%D9%85.jpg'
  },
  {
    id: 'tally-asyut',
    title: 'تلي وتطريز',
    craft: 'تطريز تلي صعيدي أصيل',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788712725/%D8%A7%D9%84%D8%AA%D9%84%D9%89.jpg'
  },
  {
    id: 'palm-aswan',
    title: 'خوص ونخيل وتمور',
    craft: 'جدل خوص وسلال نخيل نوبية',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788712728/%D8%AA%D9%85%D9%88%D8%B1.jpg'
  },

  {
    id: 'honey-herbs-minya',
    title: 'عسل جبلي وأعشاب برية',
    craft: 'مناحل طبيعية ومقطرات عشبية',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788712728/%D8%B9%D8%B3%D9%84.jpg'
  }
];

export const AdminDashboard: React.FC = () => {
  const {
    adminProducts,
    refreshAdminProducts,
    pendingProducts,
    approveProduct,
    rejectProduct,
    deleteProduct,
    addProduct,
    updateProduct,
    sellers,
    approveSeller,
    rejectSeller,
    suspendSeller,
    updateSeller,
    refreshSellers,
    orders,
    refreshOrders,
    updateOrderStatus,
    categories,
    refreshCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    reviews,
    refreshReviews,
    moderateReview,
    auditLogs,
    refreshAuditLogs,
    addToast,
    currentUser,
    activePage,
    setActivePage
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'approvals' | 'categories' | 'craft-stories' | 'craft-reels' | 'reviews' | 'sellers' | 'payouts' | 'orders' | 'coupons' | 'audit' | 'users' | 'password-resets' | 'payment-settings' | 'notifications' | 'media-library'
  >('overview');

  // Reels Management State for Admin (Full Database & Cloud Control)
  const [adminReels, setAdminReels] = useState<CraftReel[]>([]);
  const [isAdminReelUploadOpen, setIsAdminReelUploadOpen] = useState(false);
  const [adminEditingReel, setAdminEditingReel] = useState<CraftReel | null>(null);
  const [isAdminReelEditOpen, setIsAdminReelEditOpen] = useState(false);
  const [adminSelectedReelPreviewId, setAdminSelectedReelPreviewId] = useState<string | null>(null);
  const [isAdminReelPreviewOpen, setIsAdminReelPreviewOpen] = useState(false);
  const [adminReelSearchTerm, setAdminReelSearchTerm] = useState('');
  const [adminReelGovFilter, setAdminReelGovFilter] = useState('all');

  const refreshAdminReelsFromDb = async () => {
    try {
      const dbReels = await craftReelsService.fetchReelsFromDb();
      setAdminReels(dbReels);
    } catch {
      setAdminReels(craftReelsService.getReels());
    }
  };

  useEffect(() => {
    if (activeTab === 'craft-reels') {
      refreshAdminReelsFromDb();
    }
  }, [activeTab]);

  const handleAdminReelUploaded = (newReel: CraftReel) => {
    refreshAdminReelsFromDb();
    addToast('تم نشر الفيديو بنجاح', `تم حفظ مقطع "${newReel.title}" في قاعدة البيانات وربطه بالورشة`, 'success');
  };

  const handleAdminReelUpdated = (updatedReel: CraftReel) => {
    refreshAdminReelsFromDb();
    addToast('تم تحديث الفيديو', `تم تعديل بيانات الفيديو "${updatedReel.title}" وحفظها في قاعدة البيانات`, 'success');
  };

  const handleAdminDeleteReel = async (reelId: string, reelTitle: string) => {
    if (window.confirm(`هل أنت متأكد من حذف مقطع "${reelTitle}" نهائياً من قاعدة البيانات والمنصة؟`)) {
      try {
        await craftReelsService.deleteReelAsync(currentUser || { role: 'admin' }, reelId);
        await refreshAdminReelsFromDb();
        addToast('تم حذف الفيديو', `تم حذف مقطع "${reelTitle}" نهائياً من قاعدة البيانات`, 'info');
      } catch (err: any) {
        addToast('خطأ في الحذف', err?.message || 'فشل حذف الفيديو من قاعدة البيانات', 'error');
      }
    }
  };

  // Synchronize activeTab when navigation changes via URL or Header links
  useEffect(() => {
    if (activePage === 'admin-sellers') setActiveTab('sellers');
    else if (activePage === 'admin-products') setActiveTab('approvals');
    else if (activePage === 'admin-buyers') setActiveTab('users');
    else if (activePage === 'admin-orders') setActiveTab('orders');
    else if (activePage === 'admin-payouts') setActiveTab('payouts');
    else if (activePage === 'admin-categories') setActiveTab('categories');
    else if (activePage === 'admin-discounts') setActiveTab('coupons');
    else if (activePage === 'admin-audit-logs') setActiveTab('audit');
    else if (activePage === 'admin-media') setActiveTab('media-library');
    else if (activePage === 'admin-dashboard') setActiveTab('overview');
  }, [activePage]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // User Management Full Control State
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userGovernorateFilter, setUserGovernorateFilter] = useState('all');
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<any | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<any | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Edit User State
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editGovernorate, setEditGovernorate] = useState('قنا');
  const [editRole, setEditRole] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended'>('active');
  const [editWorkshopName, setEditWorkshopName] = useState('');
  const [editSpecialty, setEditSpecialty] = useState('');

  // Reset Password State
  const [selectedUserForResetPassword, setSelectedUserForResetPassword] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Create User State
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  const [newUserGovernorate, setNewUserGovernorate] = useState('قنا');
  const [newUserWorkshopName, setNewUserWorkshopName] = useState('');
  const [newUserSpecialty, setNewUserSpecialty] = useState('');
  const [isTogglingStatus, setIsTogglingStatus] = useState<string | null>(null);

  // Password Resets State
  const [passwordResets, setPasswordResets] = useState<any[]>([]);
  const [isLoadingPasswordResets, setIsLoadingPasswordResets] = useState(false);
  const [passwordResetFilter, setPasswordResetFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');
  const [selectedResetForAction, setSelectedResetForAction] = useState<any | null>(null);
  const [isCreateTempPasswordModalOpen, setIsCreateTempPasswordModalOpen] = useState(false);
  const [tempPasswordInput, setTempPasswordInput] = useState('');
  const [isSubmittingTempPassword, setIsSubmittingTempPassword] = useState(false);
  const [completedTempPasswordInfo, setCompletedTempPasswordInfo] = useState<{
    username: string;
    name?: string;
    phone?: string;
    temporaryPassword: string;
  } | null>(null);
  const [isCopiedTempPassword, setIsCopiedTempPassword] = useState(false);

  // Seller Management State
  const [sellerStatusFilter, setSellerStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'suspended'>('all');
  const [sellerSearchTerm, setSellerSearchTerm] = useState('');
  const [selectedSellerForAction, setSelectedSellerForAction] = useState<{ id: string; name: string; action: 'reject' | 'suspend' } | null>(null);
  const [sellerActionReason, setSellerActionReason] = useState('');
  const [isProcessingSellerAction, setIsProcessingSellerAction] = useState(false);

  // Admin Edit Seller Modal State
  const [selectedSellerForEditProfile, setSelectedSellerForEditProfile] = useState<Seller | null>(null);
  const [isUpdatingSellerProfile, setIsUpdatingSellerProfile] = useState(false);
  const [sellerEditBrandName, setSellerEditBrandName] = useState('');
  const [sellerEditName, setSellerEditName] = useState('');
  const [sellerEditPhone, setSellerEditPhone] = useState('');
  const [sellerEditEmail, setSellerEditEmail] = useState('');
  const [sellerEditGovernorate, setSellerEditGovernorate] = useState<Governorate>('قنا');
  const [sellerEditSpecialty, setSellerEditSpecialty] = useState('');
  const [sellerEditBio, setSellerEditBio] = useState('');
  const [sellerEditAvatar, setSellerEditAvatar] = useState('');
  const [sellerEditCoverImage, setSellerEditCoverImage] = useState('');
  const [sellerEditCoverMode, setSellerEditCoverMode] = useState<'preset' | 'url' | 'upload'>('preset');
  const [sellerEditSelectedPresetId, setSellerEditSelectedPresetId] = useState<string>('pottery-qena');
  const [sellerEditCustomUrl, setSellerEditCustomUrl] = useState('');
  const [sellerEditPayoutMethod, setSellerEditPayoutMethod] = useState<'instapay' | 'vodafone_cash' | 'bank_transfer'>('instapay');
  const [sellerEditPayoutAccount, setSellerEditPayoutAccount] = useState('');
  const [sellerEditStatus, setSellerEditStatus] = useState<string>('approved');
  const [sellerEditVerified, setSellerEditVerified] = useState<boolean>(true);

  // Admin Product Edit & Add State
  const [adminProductModalOpen, setAdminProductModalOpen] = useState(false);
  const [editingAdminProduct, setEditingAdminProduct] = useState<Product | null>(null);
  const [isAdminSubmittingProduct, setIsAdminSubmittingProduct] = useState(false);
  const [prodTitle, setProdTitle] = useState('');
  const [prodTitleEn, setProdTitleEn] = useState('');
  const [prodCategoryId, setProdCategoryId] = useState('cat-pottery');
  const [prodCategoryName, setProdCategoryName] = useState('');
  const [prodSellerId, setProdSellerId] = useState('');
  const [prodPrice, setProdPrice] = useState(250);
  const [prodOriginalPrice, setProdOriginalPrice] = useState<number | undefined>(undefined);
  const [prodStockCount, setProdStockCount] = useState(10);
  const [prodDescription, setProdDescription] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodMaterial, setProdMaterial] = useState('طين نيل طبيعي');
  const [prodCraftsmanship, setProdCraftsmanship] = useState('صناعة يدوية على الدولاب التقليدي');
  const [prodDimensions, setProdDimensions] = useState('25 × 15 سم');
  const [prodWeight, setProdWeight] = useState('800 جرام');
  const [prodOriginGovernorate, setProdOriginGovernorate] = useState<Governorate>('قنا');
  const [prodApprovalStatus, setProdApprovalStatus] = useState<ProductStatus>('approved');
  const [prodIsHandmade, setProdIsHandmade] = useState(true);
  const [prodIsHeritage, setProdIsHeritage] = useState(true);

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

  // Craft Stories & Heritage Atlas (توثيق الحرف التراثية وقصص الصنعة) State
  const [craftStories, setCraftStories] = useState<CraftStory[]>([]);
  const [isLoadingCraftStories, setIsLoadingCraftStories] = useState(false);
  const [isCraftStoryModalOpen, setIsCraftStoryModalOpen] = useState(false);
  const [editingCraftStory, setEditingCraftStory] = useState<CraftStory | null>(null);
  const [craftTitle, setCraftTitle] = useState('');
  const [craftSubtitle, setCraftSubtitle] = useState('');
  const [craftGovernorate, setCraftGovernorate] = useState('قنا');
  const [craftCity, setCraftCity] = useState('');
  const [craftVillage, setCraftVillage] = useState('');
  const [craftHistoryAge, setCraftHistoryAge] = useState('');
  const [craftImage, setCraftImage] = useState('');
  const [craftDescription, setCraftDescription] = useState('');
  const [craftMaterialsText, setCraftMaterialsText] = useState('');
  const [craftTechniquesText, setCraftTechniquesText] = useState('');
  const [craftHeritageSignificance, setCraftHeritageSignificance] = useState('');
  const [craftArtisan, setCraftArtisan] = useState('');
  const [craftSourcesText, setCraftSourcesText] = useState('');
  const [craftCoordinatesText, setCraftCoordinatesText] = useState('');
  const [craftVerificationStatus, setCraftVerificationStatus] = useState<'verified' | 'pending_review' | 'draft'>('verified');
  const [craftKeyFeaturesText, setCraftKeyFeaturesText] = useState('');
  const [craftCategoryId, setCraftCategoryId] = useState('pottery');
  const [craftDisplayOrder, setCraftDisplayOrder] = useState(1);
  const [craftActive, setCraftActive] = useState(true);
  const [isSubmittingCraftStory, setIsSubmittingCraftStory] = useState(false);

  // Orders Payment Filtering & Verification State
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<'all' | 'pending_verification' | 'paid' | 'payment_rejected' | 'cod'>('all');
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);

  // Payment Accounts Configuration State
  const [adminPaymentSettings, setAdminPaymentSettings] = useState<{
    instaPayAccount: string;
    vodafoneCashNumber: string;
    instaPayInstructions?: string;
    vodafoneCashInstructions?: string;
    isInstaPayActive: boolean;
    isVodafoneCashActive: boolean;
    isCashOnDeliveryActive: boolean;
  }>({
    instaPayAccount: 'elsa3ed@instapay',
    vodafoneCashNumber: '01158969931',
    instaPayInstructions: 'قم بالتحويل عبر تطبيق إنستاباي إلى المعرف الموضح أعلاه واضغط على "تأكيد الطلب".',
    vodafoneCashInstructions: 'قم بتحويل المبلغ إلى رقم فودافون كاش الموضح أعلاه واضغط على "تأكيد الطلب".',
    isInstaPayActive: true,
    isVodafoneCashActive: true,
    isCashOnDeliveryActive: true
  });
  const [isLoadingPaymentSettings, setIsLoadingPaymentSettings] = useState(false);
  const [isSavingPaymentSettings, setIsSavingPaymentSettings] = useState(false);

  const fetchAdminPaymentSettings = async () => {
    setIsLoadingPaymentSettings(true);
    try {
      const cfg = await api.getAdminPaymentConfig(currentUser);
      if (cfg) {
        setAdminPaymentSettings({
          instaPayAccount: cfg.instaPayAccount || 'elsa3ed@instapay',
          vodafoneCashNumber: cfg.vodafoneCashNumber || '01158969931',
          instaPayInstructions: cfg.instaPayInstructions || '',
          vodafoneCashInstructions: cfg.vodafoneCashInstructions || '',
          isInstaPayActive: cfg.isInstaPayActive ?? true,
          isVodafoneCashActive: cfg.isVodafoneCashActive ?? true,
          isCashOnDeliveryActive: cfg.isCashOnDeliveryActive ?? true
        });
      }
    } catch (err: any) {
      console.warn('Failed to load payment settings:', err);
    } finally {
      setIsLoadingPaymentSettings(false);
    }
  };

  const handleSaveAdminPaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPaymentSettings(true);
    try {
      const updated = await api.updateAdminPaymentConfig(currentUser, adminPaymentSettings);
      if (updated) {
        setAdminPaymentSettings(updated);
      }
      addToast('تم الحفظ بنجاح', 'تم تحديث حسابات وتعليمات الدفع الرسمية للمنصة بنجاح', 'success');
    } catch (err: any) {
      addToast('فشل حفظ الإعدادات', err?.message || 'تعذر تحديث إعدادات الدفع', 'error');
    } finally {
      setIsSavingPaymentSettings(false);
    }
  };

  const handleAdminVerifyPayment = async (orderId: string) => {
    setVerifyingOrderId(orderId);
    try {
      await api.adminVerifyOrderPayment(currentUser, orderId);
      addToast('تم تأكيد الدفع', 'تم التحقق من استلام التحويل وتأكيد الطلب للشحن بنجاح', 'success');
      await refreshOrders();
    } catch (err: any) {
      addToast('خطأ في التأكيد', err?.message || 'تعذر تأكيد استلام الدفعة', 'error');
    } finally {
      setVerifyingOrderId(null);
    }
  };

  const handleAdminRejectPayment = async (orderId: string) => {
    const reason = window.prompt('يرجى كتابة سبب رفض التحويل (اختياري - سيظهر للمشتري):');
    if (reason === null) return;
    setRejectingOrderId(orderId);
    try {
      await api.adminRejectOrderPayment(currentUser, orderId, reason || undefined);
      addToast('تم رفض التحويل', 'تم تغيير حالة الدفع إلى "مرفوض" وإشعار المشتري', 'info');
      await refreshOrders();
    } catch (err: any) {
      addToast('خطأ في الرفض', err?.message || 'تعذر رفض عملية التحويل', 'error');
    } finally {
      setRejectingOrderId(null);
    }
  };

  const fetchAdminUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const users = await api.getAdminUsers(
        { id: currentUser.id, role: currentUser.role },
        {
          search: userSearchTerm,
          role: userRoleFilter,
          status: userStatusFilter,
          governorate: userGovernorateFilter
        }
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

  const handleToggleUserStatus = async (u: any) => {
    if (currentUser.id === u.id) {
      addToast('محظور', 'لا يمكنك تعليق أو تجميد حسابك الشخصي كمدير للمنصة', 'warning');
      return;
    }
    const newStatus = u.status === 'suspended' ? 'active' : 'suspended';
    setIsTogglingStatus(u.id);
    try {
      const res = await api.toggleAdminUserStatus(
        { id: currentUser.id, role: currentUser.role },
        u.id,
        newStatus
      );
      addToast(
        'حالة الحساب',
        res?.message || (newStatus === 'active' ? 'تم تنشيط وتفعيل الحساب بنجاح' : 'تم تعليق الحساب بنجاح'),
        'success'
      );
      setAdminUsers((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, status: newStatus } : item))
      );
      if (selectedUserForDetails?.id === u.id) {
        setSelectedUserForDetails((prev: any) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      addToast('خطأ', err?.message || 'فشل في تغيير حالة الحساب', 'error');
    } finally {
      setIsTogglingStatus(null);
    }
  };

  const handleOpenEditUser = (u: any) => {
    setEditName(u.name || '');
    setEditUsername(u.username || '');
    setEditEmail(u.email || '');
    setEditPhone(u.phone || '');
    setEditGovernorate(u.governorate || 'قنا');
    setEditRole(u.role || 'buyer');
    setEditStatus(u.status || 'active');
    setEditWorkshopName(u.seller?.brandName || u.workshopName || '');
    setEditSpecialty(u.seller?.specialty || u.specialty || '');
    setSelectedUserForEdit(u);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    if (!editName.trim()) {
      addToast('خطأ', 'الاسم الكامل مطلوب', 'error');
      return;
    }
    if (!editPhone.trim()) {
      addToast('خطأ', 'رقم الهاتف مطلوب', 'error');
      return;
    }
    setIsUpdatingUser(true);
    try {
      await api.updateAdminUser(
        { id: currentUser.id, role: currentUser.role },
        selectedUserForEdit.id,
        {
          name: editName.trim(),
          username: editUsername.trim() || undefined,
          email: editEmail.trim() || undefined,
          phone: editPhone.trim(),
          governorate: editGovernorate,
          role: editRole,
          status: editStatus,
          workshopName: editRole === 'seller' ? editWorkshopName.trim() : undefined,
          specialty: editRole === 'seller' ? editSpecialty.trim() : undefined
        }
      );
      addToast('تم التحديث', 'تم حفظ وتحديث بيانات المستخدم بنجاح', 'success');
      setSelectedUserForEdit(null);
      fetchAdminUsers();
      if (selectedUserForDetails?.id === selectedUserForEdit.id) {
        openUserDetails(selectedUserForEdit.id);
      }
    } catch (err: any) {
      addToast('خطأ في التحديث', err?.message || 'تعذر تحديث بيانات المستخدم', 'error');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleOpenResetPassword = (u: any) => {
    setSelectedUserForResetPassword(u);
    setNewPasswordInput('');
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForResetPassword) return;
    if (!newPasswordInput || newPasswordInput.length < 6) {
      addToast('تنبيه', 'كلمة المرور الجديدة يجب ألا تقل عن 6 خانات', 'warning');
      return;
    }
    setIsResettingPassword(true);
    try {
      const res = await api.resetAdminUserPassword(
        { id: currentUser.id, role: currentUser.role },
        selectedUserForResetPassword.id,
        newPasswordInput
      );
      addToast('نجاح العملية', res?.message || 'تم إعادة تعيين كلمة المرور بنجاح', 'success');
      setSelectedUserForResetPassword(null);
      setNewPasswordInput('');
    } catch (err: any) {
      addToast('خطأ', err?.message || 'فشل في إعادة تعيين كلمة المرور', 'error');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserUsername.trim() || !newUserName.trim() || !newUserPhone.trim() || !newUserPassword) {
      addToast('بيانات ناقصة', 'يرجى ملء جميع الحقول المطلوبة لإنشاء الحساب', 'warning');
      return;
    }
    if (newUserPassword.length < 6) {
      addToast('كلمة المرور', 'كلمة المرور يجب ألا تقل عن 6 خانات', 'warning');
      return;
    }
    if (newUserRole === 'seller' && !newUserWorkshopName.trim()) {
      addToast('بيانات الورشة', 'اسم الورشة مطلوب لحسابات البائعين', 'warning');
      return;
    }
    setIsCreatingUser(true);
    try {
      const created = await api.createAdminUser(
        { id: currentUser.id, role: currentUser.role },
        {
          username: newUserUsername.trim(),
          name: newUserName.trim(),
          email: newUserEmail.trim() || undefined,
          phone: newUserPhone.trim(),
          password: newUserPassword,
          role: newUserRole,
          governorate: newUserGovernorate,
          workshopName: newUserRole === 'seller' ? newUserWorkshopName.trim() : undefined,
          specialty: newUserRole === 'seller' ? newUserSpecialty.trim() : undefined
        }
      );
      addToast('تم إنشاء الحساب', `تم إنشاء حساب ${created.name} (@${created.username}) بنجاح`, 'success');
      setIsCreateUserModalOpen(false);
      setNewUserName('');
      setNewUserUsername('');
      setNewUserEmail('');
      setNewUserPhone('');
      setNewUserPassword('');
      setNewUserRole('buyer');
      setNewUserWorkshopName('');
      setNewUserSpecialty('');
      fetchAdminUsers();
    } catch (err: any) {
      addToast('خطأ في الإنشاء', err?.message || 'فشل في إنشاء الحساب', 'error');
    } finally {
      setIsCreatingUser(false);
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

  // Seller Profile and Cover Editor Handlers (Admin Control)
  const openEditSellerModal = (seller: Seller) => {
    setSelectedSellerForEditProfile(seller);
    setSellerEditBrandName(seller.brandName || seller.name || '');
    setSellerEditName(seller.name || '');
    setSellerEditPhone(seller.phone || '');
    setSellerEditEmail(seller.email || '');
    setSellerEditGovernorate(seller.governorate || 'قنا');
    setSellerEditSpecialty(seller.specialty || '');
    setSellerEditBio(seller.bio || seller.story || '');
    setSellerEditAvatar(seller.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80');

    const existingCover = seller.coverImage || HERITAGE_COVER_PRESETS[0].url;
    setSellerEditCoverImage(existingCover);
    const matchedPreset = HERITAGE_COVER_PRESETS.find((p) => p.url === existingCover);
    if (matchedPreset) {
      setSellerEditCoverMode('preset');
      setSellerEditSelectedPresetId(matchedPreset.id);
    } else {
      setSellerEditCoverMode('url');
      setSellerEditCustomUrl(existingCover);
    }
    setSellerEditPayoutMethod((seller.payoutMethod as any) || 'instapay');
    setSellerEditPayoutAccount(seller.payoutAccount || '');
    setSellerEditStatus(seller.status || 'approved');
    setSellerEditVerified(Boolean(seller.verified));
  };

  const handleSaveAdminSellerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSellerForEditProfile) return;
    setIsUpdatingSellerProfile(true);
    try {
      let finalCover = sellerEditCoverImage;
      if (sellerEditCoverMode === 'preset') {
        const p = HERITAGE_COVER_PRESETS.find((preset) => preset.id === sellerEditSelectedPresetId);
        if (p) finalCover = p.url;
      } else if (sellerEditCoverMode === 'url' && sellerEditCustomUrl.trim()) {
        finalCover = sellerEditCustomUrl.trim();
      }

      await updateSeller(selectedSellerForEditProfile.id, {
        brandName: sellerEditBrandName.trim(),
        name: sellerEditName.trim(),
        phone: sellerEditPhone.trim(),
        email: sellerEditEmail.trim(),
        governorate: sellerEditGovernorate,
        specialty: sellerEditSpecialty.trim(),
        bio: sellerEditBio.trim(),
        story: sellerEditBio.trim(),
        avatar: sellerEditAvatar.trim(),
        coverImage: finalCover,
        payoutMethod: sellerEditPayoutMethod,
        payoutAccount: sellerEditPayoutAccount.trim(),
        status: sellerEditStatus as any,
        verified: sellerEditVerified
      });

      setSelectedSellerForEditProfile(null);
    } catch (err: any) {
      console.error('Error in handleSaveAdminSellerProfile:', err);
    } finally {
      setIsUpdatingSellerProfile(false);
    }
  };

  // Product Add & Edit Handlers (Admin Control)
  const openAdminAddProductModal = () => {
    setEditingAdminProduct(null);
    setProdTitle('');
    setProdTitleEn('');
    setProdCategoryId(categories[0]?.id || 'cat-pottery');
    setProdCategoryName(categories[0]?.name || 'فخار وخزف قناوي');
    setProdSellerId(sellers[0]?.id || currentUser.id);
    setProdPrice(250);
    setProdOriginalPrice(undefined);
    setProdStockCount(15);
    setProdDescription('');
    setProdImageUrl('https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80');
    setProdMaterial('طمي نيل طبيعي وأصباغ نباتية');
    setProdCraftsmanship('يدوي أصيل بالكامل');
    setProdDimensions('30 × 20 سم');
    setProdWeight('1 كجم');
    setProdOriginGovernorate(sellers[0]?.governorate || 'قنا');
    setProdApprovalStatus('approved');
    setProdIsHandmade(true);
    setProdIsHeritage(true);
    setAdminProductModalOpen(true);
  };

  const openAdminEditProductModal = (product: Product) => {
    setEditingAdminProduct(product);
    setProdTitle(product.title || '');
    setProdTitleEn(product.titleEn || '');
    setProdCategoryId(product.categoryId || 'cat-pottery');
    setProdCategoryName(product.categoryName || '');
    setProdSellerId(product.sellerId || '');
    setProdPrice(product.price || 0);
    setProdOriginalPrice(product.originalPrice);
    setProdStockCount(product.stockCount || 0);
    setProdDescription(product.description || '');
    setProdImageUrl(product.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80');
    setProdMaterial(product.specifications?.material || 'خامات طبيعية');
    setProdCraftsmanship(product.specifications?.craftsmanship || 'صناعة يدوية');
    setProdDimensions(product.specifications?.dimensions || '');
    setProdWeight(product.specifications?.weight || '');
    setProdOriginGovernorate(product.sellerGovernorate || product.specifications?.originGovernorate || 'قنا');
    setProdApprovalStatus(product.approvalStatus || 'approved');
    setProdIsHandmade(product.isHandmade !== undefined ? product.isHandmade : true);
    setProdIsHeritage(product.isHeritage !== undefined ? product.isHeritage : true);
    setAdminProductModalOpen(true);
  };

  const handleAdminSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle.trim()) {
      addToast('ناقص بيانات', 'اكتب اسم المنتج من فضلك', 'warning');
      return;
    }
    setIsAdminSubmittingProduct(true);
    try {
      const selectedCat = categories.find((c) => c.id === prodCategoryId);
      const targetSeller = sellers.find((s) => s.id === prodSellerId);

      const productPayload: Partial<Product> = {
        title: prodTitle.trim(),
        titleEn: prodTitleEn.trim() || undefined,
        categoryId: prodCategoryId,
        categoryName: selectedCat?.name || prodCategoryName,
        sellerId: prodSellerId || currentUser.id,
        sellerName: targetSeller?.brandName || targetSeller?.name || 'إدارة منصة وه',
        sellerGovernorate: (prodOriginGovernorate || targetSeller?.governorate || 'قنا') as any,
        price: Number(prodPrice),
        originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : undefined,
        discountPercent:
          prodOriginalPrice && prodOriginalPrice > prodPrice
            ? Math.round(((prodOriginalPrice - prodPrice) / prodOriginalPrice) * 100)
            : undefined,
        stockCount: Number(prodStockCount),
        inStock: Number(prodStockCount) > 0,
        description: prodDescription.trim(),
        images: [prodImageUrl.trim() || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'],
        specifications: {
          material: prodMaterial.trim(),
          craftsmanship: prodCraftsmanship.trim(),
          dimensions: prodDimensions.trim(),
          weight: prodWeight.trim(),
          originGovernorate: prodOriginGovernorate
        },
        isHandmade: prodIsHandmade,
        isHeritage: prodIsHeritage,
        approvalStatus: prodApprovalStatus
      };

      if (editingAdminProduct) {
        await updateProduct(editingAdminProduct.id, productPayload);
      } else {
        await addProduct(productPayload, prodApprovalStatus);
      }

      setAdminProductModalOpen(false);
      setEditingAdminProduct(null);
    } catch (err: any) {
      console.error('Error saving product by admin:', err);
    } finally {
      setIsAdminSubmittingProduct(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchAdminUsers();
    }
  }, [activeTab, userRoleFilter, userStatusFilter, userGovernorateFilter]);

  // Debounced search for users
  useEffect(() => {
    if (activeTab === 'users') {
      const timer = setTimeout(() => {
        fetchAdminUsers();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [userSearchTerm]);

  const fetchPasswordResets = async () => {
    setIsLoadingPasswordResets(true);
    try {
      const data = await api.getAdminPasswordResets(
        { id: currentUser.id, role: currentUser.role },
        passwordResetFilter
      );
      setPasswordResets(data || []);
    } catch (err: any) {
      console.error('Failed fetching password resets:', err);
    } finally {
      setIsLoadingPasswordResets(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchPasswordResets();
    }
  }, [passwordResetFilter, currentUser?.role]);

  const openCreateTempPasswordModal = (request: any) => {
    setSelectedResetForAction(request);
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let generated = '';
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPasswordInput(generated);
    setIsCreateTempPasswordModalOpen(true);
  };

  const handleConfirmCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResetForAction || !tempPasswordInput || tempPasswordInput.length < 6) {
      addToast('خد بالك', 'كلمة السر المؤقتة لازم متقلش عن 6 خانات', 'warning');
      return;
    }

    setIsSubmittingTempPassword(true);
    try {
      const result = await api.completeAdminPasswordReset(
        { id: currentUser.id, role: currentUser.role },
        selectedResetForAction.id,
        tempPasswordInput
      );
      setIsCreateTempPasswordModalOpen(false);
      setCompletedTempPasswordInfo({
        username: selectedResetForAction.username,
        name: selectedResetForAction.name,
        phone: selectedResetForAction.phone,
        temporaryPassword: result.temporaryPassword
      });
      setIsCopiedTempPassword(false);
      addToast('تمام كله مظبوط', result.message, 'success');
      fetchPasswordResets();
    } catch (err: any) {
      addToast('حصلت مشكلة', err?.message || 'معرفناش نعمل كلمة السر المؤقتة دلوقتي', 'error');
    } finally {
      setIsSubmittingTempPassword(false);
    }
  };

  const handleRejectReset = async (request: any) => {
    const reason = prompt('اكتب سبب رفض طلب استرجاع كلمة السر:', 'طلب مش متأكدين منه أو اتواصلنا مع المستخدم قبل كده');
    if (reason === null) return;

    try {
      await api.rejectAdminPasswordReset(
        { id: currentUser.id, role: currentUser.role },
        request.id,
        reason
      );
      addToast('اترفض', 'اترفض طلب استرجاع كلمة السر خلاص', 'info');
      fetchPasswordResets();
    } catch (err: any) {
      addToast('حصلت مشكلة', err?.message || 'معرفناش نرفض الطلب دلوقتي', 'error');
    }
  };

  const copyTempPassword = () => {
    if (!completedTempPasswordInfo) return;
    navigator.clipboard.writeText(completedTempPasswordInfo.temporaryPassword);
    setIsCopiedTempPassword(true);
    addToast('اتنسخت خلاص', 'اتنسخت كلمة السر المؤقتة عندك في الحافظة', 'info');
  };

  const fetchCraftStories = async () => {
    setIsLoadingCraftStories(true);
    try {
      const data = await api.getAdminCraftStories({ id: currentUser.id, role: 'admin' });
      setCraftStories(data);
    } catch (err: any) {
      console.error('Failed fetching admin craft stories:', err);
      addToast('حصلت مشكلة', 'معرفناش نجيب حكايات الصنعة من قاعدة البيانات', 'error');
    } finally {
      setIsLoadingCraftStories(false);
    }
  };

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
    setCraftCity('');
    setCraftVillage('');
    setCraftHistoryAge('');
    setCraftImage('');
    setCraftDescription('');
    setCraftMaterialsText('');
    setCraftTechniquesText('');
    setCraftHeritageSignificance('');
    setCraftArtisan('');
    setCraftSourcesText('');
    setCraftCoordinatesText('');
    setCraftVerificationStatus('verified');
    setCraftKeyFeaturesText('');
    setCraftCategoryId(categories[0]?.id || 'pottery');
    setCraftDisplayOrder(craftStories.length + 1);
    setCraftActive(true);
    setIsCraftStoryModalOpen(true);
  };

  const openEditCraftStoryModal = (story: CraftStory) => {
    setEditingCraftStory(story);
    setCraftTitle(story.title);
    setCraftSubtitle(story.subtitle || '');
    setCraftGovernorate(story.governorate || 'قنا');
    setCraftCity(story.city || '');
    setCraftVillage(story.village || '');
    setCraftHistoryAge(story.historyAge || '');
    setCraftImage(story.image || '');
    setCraftDescription(story.description || '');
    setCraftMaterialsText(Array.isArray(story.materials) ? story.materials.join('\n') : '');
    setCraftTechniquesText(Array.isArray(story.techniques) ? story.techniques.join('\n') : '');
    setCraftHeritageSignificance(story.heritageSignificance || '');
    setCraftArtisan(story.artisan || '');
    setCraftSourcesText(
      Array.isArray(story.sources)
        ? story.sources
          .map((s) => (s.sourceUrl ? `${s.sourceName || ''} | ${s.sourceUrl}` : s.sourceName || ''))
          .filter(Boolean)
          .join('\n')
        : ''
    );
    setCraftCoordinatesText(
      story.coordinates && typeof story.coordinates.lat === 'number' && typeof story.coordinates.lng === 'number'
        ? `${story.coordinates.lat}, ${story.coordinates.lng}`
        : ''
    );
    setCraftVerificationStatus((story.verificationStatus as any) || 'verified');
    setCraftKeyFeaturesText(Array.isArray(story.keyFeatures) ? story.keyFeatures.join('\n') : '');
    setCraftCategoryId(story.categoryId || categories[0]?.id || 'pottery');
    setCraftDisplayOrder(story.displayOrder ?? 1);
    setCraftActive(story.active ?? true);
    setIsCraftStoryModalOpen(true);
  };

  const handleSaveCraftStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!craftTitle.trim()) {
      addToast('ناقص بيانات', 'عنوان الحرفة التراثية مطلوب', 'error');
      return;
    }
    if (!craftDescription.trim()) {
      addToast('ناقص بيانات', 'حكاية ووصف الحرفة التراثية مطلوبة', 'error');
      return;
    }
    if (!craftGovernorate.trim()) {
      addToast('ناقص بيانات', 'لازم تختار المحافظة', 'error');
      return;
    }

    const keyFeatures = craftKeyFeaturesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const materials = craftMaterialsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const techniques = craftTechniquesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const sources = craftSourcesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((line) => {
        if (line.includes('|')) {
          const [name, url] = line.split('|').map((part) => part.trim());
          return { sourceName: name, sourceUrl: url };
        }
        return { sourceName: line };
      });

    let coordinates: { lat: number; lng: number } | undefined;
    if (craftCoordinatesText.includes(',')) {
      const [latStr, lngStr] = craftCoordinatesText.split(',').map((part) => part.trim());
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (!isNaN(lat) && !isNaN(lng)) {
        coordinates = { lat, lng };
      }
    }

    setIsSubmittingCraftStory(true);
    try {
      const payload: Partial<CraftStory> = {
        title: craftTitle.trim(),
        subtitle: craftSubtitle.trim(),
        governorate: craftGovernorate.trim(),
        city: craftCity.trim() || undefined,
        village: craftVillage.trim() || undefined,
        historyAge: craftHistoryAge.trim(),
        image: craftImage.trim(),
        description: craftDescription.trim(),
        materials,
        techniques,
        heritageSignificance: craftHeritageSignificance.trim() || undefined,
        artisan: craftArtisan.trim() || undefined,
        sources,
        coordinates,
        verificationStatus: craftVerificationStatus,
        keyFeatures,
        categoryId: craftCategoryId,
        displayOrder: Number(craftDisplayOrder) || 1,
        active: craftActive
      };

      if (editingCraftStory) {
        const updated = await api.updateAdminCraftStory(
          { id: currentUser.id, role: 'admin' },
          editingCraftStory.id,
          payload
        );
        setCraftStories((prev) => prev.map((s) => (s.id === editingCraftStory.id ? updated : s)));
        addToast('اتحدّثت بنجاح', `تم تحديث توثيق "${updated.title}" بنجاح في قاعدة البيانات`, 'success');
      } else {
        const created = await api.createAdminCraftStory(
          { id: currentUser.id, role: 'admin' },
          payload
        );
        setCraftStories((prev) => [...prev, created]);
        addToast('اتضافت بنجاح', `تم حفظ توثيق الحرفة "${created.title}" في قاعدة البيانات بنجاح`, 'success');
      }
      setIsCraftStoryModalOpen(false);
    } catch (err: any) {
      addToast('مشكلة في الحفظ', err?.message || 'معرفناش نحفظ الحرفة التراثية دلوقتي', 'error');
    } finally {
      setIsSubmittingCraftStory(false);
    }
  };

  const handleDeleteCraftStory = async (story: CraftStory) => {
    if (!confirm(`متأكد إنك عايز تحذف حكاية "${story.title}" نهائي من قاعدة البيانات؟`)) {
      return;
    }
    try {
      await api.deleteAdminCraftStory({ id: currentUser.id, role: 'admin' }, story.id);
      setCraftStories((prev) => prev.filter((s) => s.id !== story.id));
      addToast('اتحذفت', `تم حذف حكاية "${story.title}" بنجاح من قاعدة البيانات`, 'info');
    } catch (err: any) {
      addToast('مشكلة في الحذف', err?.message || 'معرفناش نحذف حكاية الصنعة دلوقتي', 'error');
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
        nextActive ? 'اشتغلت وظهرت' : 'اختفت من المتجر',
        `تم ${nextActive ? 'تفعيل ظهور' : 'إخفاء'} حكاية "${story.title}" في المتجر الرئيسي`,
        'success'
      );
    } catch (err: any) {
      addToast('حصلت مشكلة', err?.message || 'معرفناش نغير حالة تفعيل الحكاية', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'reviews') {
      refreshReviews();
    }
  }, [activeTab, refreshReviews]);

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
    setRejectionReasonInput('يا ريت توضح نسبة الخامات الطبيعية وترفع صور أوضح للورشة ولطريقة الصنع اليدوي.');
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingProductId) return;
    if (!rejectionReasonInput.trim()) {
      addToast('خد بالك', 'اكتب سبب الرفض عشان نساعد الحرفي يظبط بياناته', 'warning');
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
        await rejectSeller(selectedSellerForAction.id, sellerActionReason.trim() || 'مش مستوفي معايير الحرف التراثية الصعيدية');
      } else if (selectedSellerForAction.action === 'suspend') {
        await suspendSeller(selectedSellerForAction.id, sellerActionReason.trim() || 'مخالفة سياسات التوريد أو معايير الجودة المعتمدة');
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
    <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-[#211d18] dark:bg-[#151513] rounded-[2rem] p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-black/10 dark:border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#9a6a35]/30 border border-[#9a6a35]/50 flex items-center justify-center text-[#9a6a35] dark:text-[#d5a56d] shrink-0">
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
              <h1 className="text-xl sm:text-2xl font-black font-heritage">لوحة الإدارة المركزية لمنصة وه</h1>
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
            <p className="text-xs text-white/80 mt-1">
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
      <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 overflow-x-auto pb-2 no-scrollbar px-1">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'overview'
            ? 'bg-[#9a6a35] text-white shadow-md'
            : 'bg-white/80 dark:bg-[#151513]/90 text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10'
            }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>المؤشرات العامة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap relative cursor-pointer ${activeTab === 'approvals'
            ? 'bg-[#9a6a35] text-white shadow-md'
            : 'bg-white/80 dark:bg-[#151513]/90 text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10'
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
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'categories'
            ? 'bg-[#9a6a35] text-white shadow-md'
            : 'bg-white/80 dark:bg-[#151513]/90 text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10'
            }`}
        >
          <Layers className="w-4 h-4" />
          <span>التصنيفات التراثية ({categories.length})</span>
        </button>

        <button
          type="button"
          id="admin-tab-craft-stories"
          onClick={() => setActiveTab('craft-stories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'craft-stories'
            ? 'bg-[#9a6a35] text-white shadow-md'
            : 'bg-white/80 dark:bg-[#151513]/90 text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10'
            }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>قصص الصنعة وأسرار الأجداد ({craftStories.length})</span>
        </button>

        <button
          type="button"
          id="admin-tab-wah-cultural"
          onClick={() => setActivePage('admin-cultural-cms')}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 border border-amber-300 dark:border-amber-800 cursor-pointer"
        >
          <Landmark className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>الموسوعة التراثية وإدارة المحافظات (WAH CMS)</span>
        </button>

        <button
          type="button"
          id="admin-tab-media-library"
          onClick={() => setActiveTab('media-library')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'media-library'
            ? 'bg-[#9a6a35] text-white shadow-md'
            : 'bg-white/80 dark:bg-[#151513]/90 text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10'
            }`}
        >
          <ImageIcon className="w-4 h-4 text-[#9a6a35] dark:text-[#d5a56d]" />
          <span>مكتبة وسائط Cloudinary</span>
        </button>

        <button
          type="button"
          id="admin-tab-craft-reels"
          onClick={() => {
            setActiveTab('craft-reels');
            setAdminReels(craftReelsService.getReels());
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'craft-reels'
            ? 'bg-[#9a6a35] text-white shadow-md'
            : 'bg-white/80 dark:bg-[#151513]/90 text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10'
            }`}
        >
          <Film className="w-4 h-4 text-amber-500" />
          <span>فيديوهات الحرفيين (Craft Reels) ({adminReels.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'reviews'
            ? 'bg-[#9a6a35] text-white shadow-md'
            : 'bg-white/80 dark:bg-[#151513]/90 text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10'
            }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>مراجعات وتقييمات المشترين</span>
        </button>

        <button
          type="button"
          id="admin-tab-sellers"
          onClick={() => setActiveTab('sellers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'sellers'
            ? 'bg-[#9a6a35] text-white shadow-md'
            : 'bg-white/80 dark:bg-[#151513]/90 text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10'
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
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'orders'
            ? 'bg-[#9a6a35] text-white shadow-md'
            : 'bg-white/80 dark:bg-[#151513]/90 text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10'
            }`}
        >
          <Truck className="w-4 h-4" />
          <span>مراقبة الشحنات والطلبات</span>
        </button>

        <button
          type="button"
          id="admin-tab-payouts"
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'payouts'
            ? 'bg-[#9a6a35] text-white shadow-md'
            : 'bg-white/80 dark:bg-[#151513]/90 text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10'
            }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>طلبات صرف المستحقات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'coupons'
            ? 'bg-[#9a6a35] text-white shadow-md'
            : 'bg-white/80 dark:bg-[#151513]/90 text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10'
            }`}
        >
          <Tag className="w-4 h-4" />
          <span>أكواد الخصم</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('payment-settings');
            fetchAdminPaymentSettings();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'payment-settings'
            ? 'bg-[#9a6a35] text-white shadow-md'
            : 'bg-white/80 dark:bg-[#151513]/90 text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10'
            }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-500" />
          <span>إعدادات الدفع الرقمي (InstaPay & كاش)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'audit'
            ? 'bg-[#9a6a35] text-white shadow-md'
            : 'bg-white/80 dark:bg-[#151513]/90 text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10'
            }`}
        >
          <FileText className="w-4 h-4" />
          <span>سجل الرقابة (Audit)</span>
        </button>

        <button
          type="button"
          id="admin-tab-users"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'users'
            ? 'bg-[#9a6a35] text-white shadow-md'
            : 'bg-white/80 dark:bg-[#151513]/90 text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10'
            }`}
        >
          <Users className="w-4 h-4" />
          <span>إدارة المستخدمين ({adminUsers.length || '...'})</span>
        </button>

        <button
          type="button"
          id="admin-tab-password-resets"
          onClick={() => setActiveTab('password-resets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap relative cursor-pointer ${activeTab === 'password-resets'
            ? 'bg-[#9a6a35] text-white shadow-md'
            : 'bg-white/80 dark:bg-[#151513]/90 text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10'
            }`}
        >
          <KeyRound className="w-4 h-4 text-amber-500" />
          <span>طلبات استعادة كلمة المرور</span>
          {passwordResets.filter((r) => r.status === 'pending').length > 0 && (
            <span className="bg-rose-600 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">
              {passwordResets.filter((r) => r.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          type="button"
          id="admin-tab-notifications"
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'notifications'
            ? 'bg-[#9a6a35] text-white shadow-md'
            : 'bg-white/80 dark:bg-[#151513]/90 text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10'
            }`}
        >
          <Bell className="w-4 h-4 text-amber-500" />
          <span>مركز الإشعارات والتنبيهات العامة</span>
        </button>
      </div>

      {/* TAB: MEDIA LIBRARY (CLOUDINARY) */}
      {activeTab === 'media-library' && (
        <div className="space-y-6">
          <AdminMediaLibraryPage />
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Overview Top Header with Refresh Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-black/10 dark:border-white/10 shadow-xs">
            <div>
              <h2 className="font-black text-lg text-[#211d18] dark:text-[#f5f0e7]">نظرة عامة على شغل المنصة</h2>
              <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">
                متابعة حية للمبيعات، ورش الصعيد، طابور الاعتماد وشحنات المحافظات
              </p>
            </div>
            <RefreshDataButton
              onRefresh={async () => {
                await Promise.all([
                  refreshAdminProducts(),
                  refreshSellers(),
                  refreshOrders()
                ]);
              }}
              label="تحديث الأرقام"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl p-5 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm text-[#211d18] dark:text-[#f5f0e7]">
              <span className="text-xs text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50 block mb-1">إجمالي مبيعات المنصة (GMV)</span>
              <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">{totalMarketplaceSales.toLocaleString()} ج.م</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">
                {orders.length > 0 ? `إجمالي ${orders.length} طلب متسجل` : 'مؤشر المبيعات المباشرة'}
              </span>
            </div>

            <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl p-5 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm text-[#211d18] dark:text-[#f5f0e7]">
              <span className="text-xs text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50 block mb-1">إجمالي الحرفيين والورش</span>
              <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">{sellers.length} ورشة</span>
              <span className="text-[10px] text-[#9a6a35] dark:text-[#d5a56d] font-bold block mt-1">
                {new Set(sellers.map((s) => s.governorate).filter(Boolean)).size > 0
                  ? `بتغطي ${new Set(sellers.map((s) => s.governorate).filter(Boolean)).size} محافظات في الصعيد`
                  : 'شبكة ورش الصعيد'}
              </span>
            </div>

            <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl p-5 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm text-[#211d18] dark:text-[#f5f0e7]">
              <span className="text-xs text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50 block mb-1">المنتجات الحرفية النشطة</span>
              <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">
                {adminProducts.filter((p) => p.approvalStatus === 'approved').length} قطعة
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">
                {adminProducts.length > 0
                  ? `${Math.round((adminProducts.filter((p) => p.approvalStatus === 'approved').length / adminProducts.length) * 100)}% نسبة الاعتماد`
                  : 'توثيق الحرف اليدوية'}
              </span>
            </div>

            <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl p-5 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm text-[#211d18] dark:text-[#f5f0e7]">
              <span className="text-xs text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50 block mb-1">طلبات الشحن المتنفذة</span>
              <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">{orders.length} شحنة</span>
              <span className="text-[10px] text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50 block mt-1">
                {orders.length > 0
                  ? `${orders.filter((o) => o.status === 'delivered').length} شحنة اتسلّمت خلاص`
                  : 'شحن مباشر من الورش'}
              </span>
            </div>
          </div>

          {/* Pending Queue Highlight */}
          <div className="bg-white dark:bg-[#1B1613] rounded-3xl border border-black/10 dark:border-white/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7]">طابور المراجعة السريعة للمنتجات الجديدة</h3>
              <button
                type="button"
                onClick={() => setActiveTab('approvals')}
                className="text-xs font-bold text-[#9a6a35] dark:text-[#d5a56d] hover:underline cursor-pointer"
              >
                افتح قايمة الاعتماد كاملة ({pendingProducts.length})
              </button>
            </div>

            {pendingProducts.length === 0 ? (
              <div className="text-center py-8 bg-black/5 dark:bg-white/5 dark:bg-[#201A16] rounded-2xl border border-dashed border-black/10 dark:border-white/10">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">مفيش طلبات معلقة دلوقتي - كل المنتجات اتراجعت تمام</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingProducts.slice(0, 3).map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80'}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover border border-black/10 dark:border-white/10"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-[#211d18] dark:text-[#f5f0e7]">{prod.title}</h4>
                        <p className="text-xs text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50">
                          الورشة: <strong>{prod.sellerName}</strong> • محافظة {prod.sellerGovernorate} • السعر: {prod.price} ج.م
                        </p>
                        <p className="text-[11px] text-[#9a6a35] dark:text-[#d5a56d] mt-0.5">
                          الخامات: {prod.specifications?.material || 'خامات طبيعية'} • الصنعة: {prod.specifications?.craftsmanship || 'يدوية'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleApprove(prod.id)}
                        disabled={isProcessing}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>موافقة ونشر</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openRejectModal(prod.id)}
                        disabled={isProcessing}
                        className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
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
        <div className="bg-white dark:bg-[#1B1613] rounded-3xl border border-black/10 dark:border-white/10 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7]">طابور فحص واعتماد المنتجات التراثية</h3>
              <p className="text-xs text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50">
                كل قطعة لازم تتفحص كويس للتأكد من أصالتها ومطابقتها للمواصفات التراثية قبل ما تظهر للمشترين في المتجر
              </p>
            </div>

            {/* Filter Tabs & Add Product Button */}
            <div className="flex flex-wrap items-center gap-2">
              <RefreshDataButton
                onRefresh={refreshAdminProducts}
                label="تحديث قايمة المنتجات"
              />

              <button
                type="button"
                id="admin-add-new-product-btn"
                onClick={openAdminAddProductModal}
                className="px-4 py-2 bg-[#9a6a35] hover:bg-[#7d5427] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج كمسؤول</span>
              </button>

              <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 dark:bg-[#26201B] p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'all' ? 'bg-[#211d18] text-white dark:bg-white dark:text-black' : 'text-black/60 dark:text-white/60'
                    }`}
                >
                  الكل ({adminProducts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${statusFilter === 'pending' ? 'bg-amber-600 text-white' : 'text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50'
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'approved' ? 'bg-emerald-700 text-white' : 'text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50'
                    }`}
                >
                  معتمد
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('rejected')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'rejected' ? 'bg-rose-700 text-white' : 'text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50'
                    }`}
                >
                  مرفوض
                </button>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50 absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="دور باسم المنتج، الورشة، أو المحافظة..."
              className="w-full pr-10 pl-4 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] placeholder:text-[#9C8E80] dark:placeholder:text-[#8A7D71] rounded-xl text-xs outline-none focus:border-[#9a6a35] dark:focus:border-[#9a6a35]"
            />
          </div>

          {/* Products List */}
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-black/5 dark:bg-white/5 dark:bg-[#201A16] border border-dashed border-black/10 dark:border-white/10 rounded-2xl">
                <Package className="w-8 h-8 text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">مفيش منتجات متطابقة مع البحث دلوقتي</p>
              </div>
            ) : (
              filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className={`p-4 rounded-2xl border transition-all ${prod.approvalStatus === 'pending'
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
                    : prod.approvalStatus === 'rejected'
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      : 'bg-black/5 dark:bg-white/5 dark:bg-[#1E1916] border-black/10 dark:border-white/10'
                    }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80'}
                        alt={prod.title}
                        className="w-16 h-16 rounded-xl object-cover border border-black/10 dark:border-white/10 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm text-[#211d18] dark:text-[#f5f0e7]">{prod.title}</h4>
                          {getStatusBadge(prod.approvalStatus)}
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-[#9a6a35] dark:text-[#d5a56d] px-2 py-0.5 rounded font-bold">
                            {prod.categoryName}
                          </span>
                        </div>
                        <p className="text-xs text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50">
                          الورشة: <strong>{prod.sellerName}</strong> • محافظة {prod.sellerGovernorate} • السعر: <strong className="text-[#9a6a35] dark:text-[#d5a56d]">{prod.price} ج.م</strong>
                        </p>
                        <p className="text-[11px] text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50">
                          الخامات: {prod.specifications?.material || 'خامات طبيعية'} • أسلوب الصنع: {prod.specifications?.craftsmanship || 'يدوية'}
                        </p>
                      </div>
                    </div>

                    {/* Moderation Controls */}
                    <div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-[#352B24] w-full md:w-auto">
                      <button
                        type="button"
                        id={`admin-edit-prod-${prod.id}`}
                        onClick={() => openAdminEditProductModal(prod)}
                        className="px-3.5 py-2 bg-black/5 dark:bg-white/5 dark:bg-[#26201B] hover:bg-black/5 dark:bg-white/5 dark:hover:bg-[#322923] text-[#211d18] dark:text-[#f5f0e7] border border-black/10 dark:border-white/10 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="تعديل بيانات المنتج كمسؤول"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#9a6a35] dark:text-[#d5a56d]" />
                        <span>تعديل</span>
                      </button>

                      <button
                        type="button"
                        id={`admin-delete-prod-${prod.id}`}
                        onClick={() => {
                          if (window.confirm(`متأكد إنك عايز تحذف منتج "${prod.title}" نهائي من المنصة؟`)) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                        title="حذف المنتج نهائياً"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>

                      {prod.approvalStatus !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleApprove(prod.id)}
                          disabled={isProcessing}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
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
                          className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>رفض المنتج</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rejection reason if any */}
                  {prod.approvalStatus === 'rejected' && prod.rejectionReason && (
                    <div className="mt-3 p-3 bg-rose-100/80 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-900/60 rounded-xl text-xs space-y-1">
                      <span className="font-bold text-rose-900 dark:text-rose-200 block">سبب الرفض المسجل للحرفي:</span>
                      <p className="text-rose-800 dark:text-rose-300 leading-relaxed">{prod.rejectionReason}</p>
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
        <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-6 shadow-sm space-y-6 text-[#211d18] dark:text-[#f5f0e7]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7]">إدارة أقسام وتصنيفات الحرف التراثية</h3>
              <p className="text-xs text-black/60 dark:text-white/60">
                تقسيم القطع الحرفية حسب نوع الفن (فخار، نسيج، خوص، نحاس، حلي، خشب، مأكولات صعيدية)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <RefreshDataButton
                onRefresh={refreshCategories}
                label="تحديث الأقسام"
              />

              <button
                type="button"
                onClick={openAddCategoryModal}
                className="px-4 py-2.5 bg-[#9a6a35] hover:bg-[#7d5427] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قسم تراثي جديد</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{cat.icon || '🏺'}</span>
                      <div>
                        <h4 className="font-bold text-sm text-[#211d18] dark:text-[#f5f0e7]">{cat.name}</h4>
                        {cat.nameEn && <span className="text-[10px] text-black/60 dark:text-white/60 block font-mono">{cat.nameEn}</span>}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold font-mono bg-amber-100 text-[#9a6a35] dark:text-[#d5a56d] px-2 py-0.5 rounded-full">
                      {cat.productCount || 0} منتج
                    </span>
                  </div>
                  <p className="text-xs text-black/60 dark:text-white/60 line-clamp-2 leading-relaxed">
                    {cat.description || 'الحرف اليدوية والفنون التراثية الأصيلة في محافظات الصعيد.'}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => openEditCategoryModal(cat)}
                    className="p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-black/10 dark:border-white/10 text-xs font-bold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`متأكد إنك عايز تحذف قسم "${cat.name}"؟`)) {
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
        <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-6 shadow-sm space-y-6 text-[#211d18] dark:text-[#f5f0e7]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7]">حكايات الصنعة وأسرار الأجداد (قاعدة البيانات)</h3>
                <span className="bg-amber-100 text-[#9a6a35] dark:text-[#d5a56d] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  craft_stories collection
                </span>
              </div>
              <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                إدارة أطلس الحرف التراثية وأسرار الصنايعية المعروضة في واجهة المتجر الرئيسية، مع إمكانية التعديل والإضافة والإخفاء فوراً.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <RefreshDataButton
                onRefresh={fetchCraftStories}
                isLoading={isLoadingCraftStories}
                label="تحديث الحكايات"
              />

              <button
                type="button"
                id="admin-add-craft-story-btn"
                onClick={openAddCraftStoryModal}
                className="px-4 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة حكاية صنعة جديدة</span>
              </button>
            </div>
          </div>

          {isLoadingCraftStories && craftStories.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#9a6a35] dark:text-[#d5a56d]" />
              <span>بنحمّل حكايات الصنعة من قاعدة البيانات...</span>
            </div>
          ) : craftStories.length === 0 ? (
            <div className="p-8 text-center bg-black/5 dark:bg-white/5 rounded-2xl border border-dashed border-black/10 dark:border-white/10 space-y-3">
              <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-sm font-bold text-gray-700">مفيش حكايات صنعة متسجلة دلوقتي في قاعدة البيانات</p>
              <button
                type="button"
                onClick={openAddCraftStoryModal}
                className="px-4 py-2 bg-[#9a6a35] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                ضيف أول حكاية دلوقتي
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {craftStories.map((story) => (
                <div
                  key={story.id}
                  className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between bg-white shadow-xs ${story.active === false ? 'border-gray-300 opacity-70 bg-gray-50' : 'border-black/10 dark:border-white/10 hover:border-amber-700/30'
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
                          <span className="text-[10px] font-bold text-[#9a6a35] dark:text-[#d5a56d] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            {story.governorate}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${story.active === false
                              ? 'bg-gray-200 text-gray-600'
                              : 'bg-emerald-100 text-emerald-800'
                              }`}
                          >
                            {story.active === false ? 'مخفية من الواجهة' : 'شغالة وظاهرة'}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{story.title}</h4>
                        <p className="text-xs text-amber-800 font-medium line-clamp-1">{story.subtitle}</p>
                        <p className="text-[11px] text-gray-500 font-mono">العمر: {story.historyAge}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed bg-black/5 dark:bg-white/5 p-2.5 rounded-xl border border-[#ebdccd]">
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

                  <div className="px-5 py-3 bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-2">
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
                        className="p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-black/10 dark:border-white/10 text-xs font-bold flex items-center gap-1"
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

      {/* TAB: CRAFT REELS (VIDEOS) MANAGEMENT */}
      {activeTab === 'craft-reels' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Banner */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#211d18] via-[#28221c] to-[#211d18] text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-black/10 dark:border-white/10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#9a6a35]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-amber-300 text-xs font-bold border border-white/15">
                  <Film className="w-4 h-4 text-amber-400" />
                  <span>الإشراف على محتوى وه Stories وحكايات الصعيد</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-heritage">
                  إدارة الفيديوهات والحكايات المصورة والتفاعل المباشر
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  متابعة الفيديوهات المصورة لمعالم الصعيد وتراثه وأسواقه وأكلاته وحرفه، وإدارة التصنيفات والمحافظات، وربطها بالمنتجات لو تحب.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <RefreshDataButton
                  onRefresh={refreshAdminReelsFromDb}
                  label="تحديث الفيديوهات"
                  variant="outline"
                  className="bg-white/10 text-white hover:bg-white/20 border-white/20"
                />

                <button
                  type="button"
                  id="admin-upload-reel-btn"
                  onClick={() => setIsAdminReelUploadOpen(true)}
                  className="px-5 py-3 bg-gradient-to-r from-[#9a6a35] to-[#7d5427] hover:from-[#7d5427] hover:to-[#623f1a] text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>نشر حكاية/فيديو جديد</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl p-5 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm text-[#211d18] dark:text-[#f5f0e7]">
              <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 mb-2">
                <span>إجمالي الفيديوهات</span>
                <Film className="w-4 h-4 text-[#9a6a35] dark:text-[#d5a56d]" />
              </div>
              <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">{adminReels.length} فيديو</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">بتغطي بلاد الصعيد كلها</span>
            </div>

            <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl p-5 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm text-[#211d18] dark:text-[#f5f0e7]">
              <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 mb-2">
                <span>إجمالي المشاهدات</span>
                <Eye className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">
                {adminReels.reduce((acc, r) => acc + (r.viewsCount || 0), 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">مشاهدات حقيقية وتفاعل عالي</span>
            </div>

            <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl p-5 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm text-[#211d18] dark:text-[#f5f0e7]">
              <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 mb-2">
                <span>إجمالي الإعجابات</span>
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              </div>
              <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">
                {adminReels.reduce((acc, r) => acc + (r.likesCount || 0), 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-black/60 dark:text-white/60 block mt-1">تفاعل الناس في المنصة</span>
            </div>

            <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl p-5 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm text-[#211d18] dark:text-[#f5f0e7]">
              <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 mb-2">
                <span>الحكايات والفيديوهات</span>
                <Store className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">
                {adminReels.length} حكاية
              </span>
              <span className="text-[10px] text-indigo-700 font-bold block mt-1">محتوى توثيقي وصنايعية</span>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-2xl border border-black/10 dark:border-white/10 p-4 shadow-sm text-[#211d18] dark:text-[#f5f0e7] flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Governorate Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setAdminReelGovFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${adminReelGovFilter === 'all'
                  ? 'bg-[#9a6a35] text-white shadow-md'
                  : 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/5 dark:bg-white/5'
                  }`}
              >
                كل المحافظات ({adminReels.length})
              </button>
              {(['قنا', 'سوهاج', 'أسوان', 'أسيوط', 'الأقصر', 'الوادي الجديد', 'الفيوم'] as Governorate[]).map((gov) => {
                const count = adminReels.filter((r) => r.governorate === gov).length;
                if (count === 0) return null;
                return (
                  <button
                    key={gov}
                    type="button"
                    onClick={() => setAdminReelGovFilter(gov)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${adminReelGovFilter === gov
                      ? 'bg-[#9a6a35] text-white shadow-md'
                      : 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/5 dark:bg-white/5'
                      }`}
                  >
                    {gov} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-black/60 dark:text-white/60 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={adminReelSearchTerm}
                onChange={(e) => setAdminReelSearchTerm(e.target.value)}
                placeholder="دور بالعنوان، المكان، التصنيف..."
                className="w-full pl-8 pr-9 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] transition-colors"
              />
              {adminReelSearchTerm && (
                <button
                  type="button"
                  onClick={() => setAdminReelSearchTerm('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Reels Grid */}
          {adminReels.filter((r) => {
            const matchesGov = adminReelGovFilter === 'all' || r.governorate === adminReelGovFilter;
            const term = adminReelSearchTerm.trim().toLowerCase();
            const matchesSearch =
              term === '' ||
              r.title.toLowerCase().includes(term) ||
              (r.location && r.location.toLowerCase().includes(term)) ||
              (r.contentType && r.contentType.toLowerCase().includes(term)) ||
              (r.description && r.description.toLowerCase().includes(term)) ||
              (r.artisanName && r.artisanName.toLowerCase().includes(term)) ||
              (r.craftType && r.craftType.toLowerCase().includes(term)) ||
              (r.productTitle && r.productTitle.toLowerCase().includes(term));
            return matchesGov && matchesSearch;
          }).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {adminReels
                .filter((r) => {
                  const matchesGov = adminReelGovFilter === 'all' || r.governorate === adminReelGovFilter;
                  const term = adminReelSearchTerm.trim().toLowerCase();
                  const matchesSearch =
                    term === '' ||
                    r.title.toLowerCase().includes(term) ||
                    (r.location && r.location.toLowerCase().includes(term)) ||
                    (r.contentType && r.contentType.toLowerCase().includes(term)) ||
                    (r.description && r.description.toLowerCase().includes(term)) ||
                    (r.artisanName && r.artisanName.toLowerCase().includes(term)) ||
                    (r.craftType && r.craftType.toLowerCase().includes(term)) ||
                    (r.productTitle && r.productTitle.toLowerCase().includes(term));
                  return matchesGov && matchesSearch;
                })
                .map((reel) => (
                  <div
                    key={reel.id}
                    className="bg-white rounded-3xl border border-black/10 dark:border-white/10 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    {/* 9:16 Video Thumbnail Container */}
                    <div
                      onClick={() => {
                        setAdminSelectedReelPreviewId(reel.id);
                        setIsAdminReelPreviewOpen(true);
                      }}
                      className="relative aspect-9/16 bg-black overflow-hidden cursor-pointer"
                    >
                      <img
                        src={reel.posterUrl}
                        alt={reel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/40 shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white mr-0.5" />
                        </div>
                      </div>

                      {/* Top Badges */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                        <div className="flex items-center gap-1">
                          <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                            {reel.duration}
                          </span>
                          {(reel as any).isFeatured && (
                            <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                              مميز ★
                            </span>
                          )}
                          {(reel as any).isPinned && (
                            <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                              مثبت 📌
                            </span>
                          )}
                        </div>
                        <span className="bg-[#9a6a35] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {reel.location || reel.governorate}
                        </span>
                      </div>

                      {/* Bottom Info on Poster */}
                      <div className="absolute bottom-3 inset-x-3 z-10 space-y-1">
                        <p className="text-xs font-bold text-white line-clamp-2 drop-shadow-md">
                          {reel.title}
                        </p>
                        <p className="text-[10px] text-amber-300 truncate">
                          {reel.contentType || reel.craftType || 'حكاية صعيدية'}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Metadata & Actions */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-black/5 dark:bg-white/5/40">
                      {/* Linked Product (Optional) */}
                      {reel.productId && reel.productTitle ? (
                        <div className="p-2.5 bg-white dark:bg-[#1c1c19] rounded-2xl border border-black/10 dark:border-white/10 flex items-center justify-between gap-2 shadow-2xs">
                          {reel.productImage && (
                            <img
                              src={reel.productImage}
                              alt={reel.productTitle}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-100 dark:border-white/10"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-[#211d18] dark:text-[#f5f0e7] truncate">{reel.productTitle}</p>
                            <span className="text-xs font-black text-[#9a6a35] dark:text-[#d5a56d]">{reel.productPrice} ج.م</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 bg-black/5 dark:bg-white/5 rounded-2xl border border-dashed border-black/10 dark:border-white/10 text-center">
                          <span className="text-[10px] text-black/50 dark:text-white/50 font-medium">
                            محتوى توثيقي / من غير منتج مرتبط
                          </span>
                        </div>
                      )}

                      {/* Engagement Stats & Database Sync Badge */}
                      <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 pt-1">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[11px]">
                            <Eye className="w-3.5 h-3.5 text-gray-500" />
                            <span>{reel.viewsCount}</span>
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-rose-600 font-bold">
                            <Heart className="w-3.5 h-3.5 fill-rose-600" />
                            <span>{reel.likesCount}</span>
                          </span>
                        </div>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          قاعدة البيانات ✓
                        </span>
                      </div>

                      {/* Actions Buttons: View, Edit, Delete (Full Admin Control) */}
                      <div className="flex items-center gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setAdminSelectedReelPreviewId(reel.id);
                            setIsAdminReelPreviewOpen(true);
                          }}
                          className="flex-1 py-2 bg-[#9a6a35] hover:bg-[#7d5427] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>معاينة وتشغيل</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAdminEditingReel(reel);
                            setIsAdminReelEditOpen(true);
                          }}
                          className="p-2 text-gray-600 hover:text-[#9a6a35] dark:text-[#d5a56d] hover:bg-black/5 dark:bg-white/5 rounded-xl transition-colors cursor-pointer border border-black/10 dark:border-white/10"
                          title="تعديل الفيديو والمنتج والورشة بالكامل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAdminDeleteReel(reel.id, reel.title)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent"
                          title="حذف الفيديو نهائياً من قاعدة البيانات والمنصة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-black/10 dark:border-white/10 space-y-4">
              <Film className="w-16 h-16 text-gray-300 mx-auto" />
              <h4 className="text-base font-bold text-[#211d18] dark:text-[#f5f0e7]">مفيش فيديوهات متطابقة مع البحث</h4>
              <p className="text-xs text-black/60 dark:text-white/60 max-w-md mx-auto">
                تقدر ترفع فيديو جديد لأي حرفي أو تمسح كلمة البحث عشان تشوف كل فيديوهات الورش.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB: REVIEWS MODERATION (PHASE 4) */}
      {activeTab === 'reviews' && (
        <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-6 shadow-sm space-y-6 text-[#211d18] dark:text-[#f5f0e7]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7]">إشراف ومراجعة تقييمات المشترين</h3>
              <p className="text-xs text-black/60 dark:text-white/60">
                مراجعة آراء وتعليقات الزباين، وشارة الشراء المؤكد، ومنع أي تقييم عشوائي أو مش مناسب
              </p>
            </div>

            <RefreshDataButton
              onRefresh={refreshReviews}
              label="تحديث التقييمات"
            />
          </div>

          <div className="space-y-3">
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 rounded-2xl">
                <MessageSquare className="w-8 h-8 text-black/60 dark:text-white/60 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">مفيش تقييمات متسجلة لحد دلوقتي</p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs text-[#211d18] dark:text-[#f5f0e7]">{rev.userName || 'مشتري موثق'}</span>
                      {rev.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                          <BadgeCheck className="w-3 h-3 text-emerald-600" />
                          <span>شروة متأكدة (Verified)</span>
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
                      <span className="text-[10px] text-black/60 dark:text-white/60 font-mono">{rev.date}</span>
                    </div>

                    <p className="text-xs text-[#211d18] dark:text-[#f5f0e7] leading-relaxed">"{rev.comment}"</p>

                    <div className="text-[11px] text-black/60 dark:text-white/60 flex items-center gap-3">
                      <span>المنتج: <strong className="text-[#9a6a35] dark:text-[#d5a56d]">{rev.productTitle || rev.productId}</strong></span>
                      <span>المحافظة: {rev.userGovernorate || 'الصعيد'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => moderateReview(rev.id, 'published')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>قبول ونشر</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => moderateReview(rev.id, 'hidden')}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>إخفاء</span>
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
          <div className="bg-white rounded-3xl border border-black/10 dark:border-white/10 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-[#211d18] dark:text-[#f5f0e7] font-heritage">إدارة الورش واعتماد الصنايعية</h3>
                {pendingSellersCount > 0 && (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black px-2.5 py-0.5 rounded-full animate-pulse">
                    {pendingSellersCount} طلب مستني المراجعة
                  </span>
                )}
              </div>
              <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">
                مراجعة طلبات انضمام الورش، وتوثيق صنايعية الصعيد، والموافقة على الحسابات أو وقفها
              </p>
            </div>

            {/* Quick Action / Refresh */}
            <div className="flex items-center gap-2">
              <RefreshDataButton
                id="admin-refresh-sellers-btn"
                onRefresh={refreshSellers}
                label="تحديث الورش"
              />
            </div>
          </div>

          {/* Filter Tabs & Search Bar */}
          <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-2xl border border-black/10 dark:border-white/10 p-4 shadow-sm text-[#211d18] dark:text-[#f5f0e7] flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                id="filter-sellers-all"
                onClick={() => setSellerStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${sellerStatusFilter === 'all'
                  ? 'bg-[#9a6a35] text-white shadow-md'
                  : 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/5 dark:bg-white/5'
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
                <span>مستني المراجعة</span>
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
                معتمد ومتوثق ({sellers.filter((s) => s.status === 'approved').length})
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
                متوقف مؤقتاً ({sellers.filter((s) => s.status === 'suspended').length})
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
              <Search className="w-4 h-4 text-black/60 dark:text-white/60 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="seller-search-input"
                value={sellerSearchTerm}
                onChange={(e) => setSellerSearchTerm(e.target.value)}
                placeholder="دور بالاسم، الورشة، المحافظة..."
                className="w-full pl-8 pr-9 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] transition-colors"
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
              <div className="bg-white rounded-3xl border border-black/10 dark:border-white/10 p-12 text-center shadow-xs">
                <Store className="w-12 h-12 text-black/60 dark:text-white/60/40 mx-auto mb-3" />
                <h4 className="font-bold text-sm text-[#211d18] dark:text-[#f5f0e7]">مفيش ورش متطابقة مع البحث</h4>
                <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                  جرب تغير الفلتر أو تمسح كلمة البحث عشان تشوف كل الورش المسجلة
                </p>
              </div>
            ) : (
              filteredSellers.map((s) => (
                <div
                  key={s.id}
                  id={`seller-card-${s.id}`}
                  className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-2xl border border-black/10 dark:border-white/10 p-5 shadow-sm text-[#211d18] dark:text-[#f5f0e7] hover:border-[#9a6a35]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Seller Info Column */}
                  <div className="flex items-start gap-4">
                    <img
                      src={s.avatar}
                      alt={s.brandName}
                      className="w-14 h-14 rounded-2xl object-cover border border-black/10 dark:border-white/10 shrink-0"
                    />
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7]">{s.brandName}</h4>

                        {/* Status Badge */}
                        {s.status === 'approved' && (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>معتمد ومتوثق</span>
                          </span>
                        )}
                        {s.status === 'pending' && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>مستني المراجعة والاعتماد</span>
                          </span>
                        )}
                        {s.status === 'suspended' && (
                          <span className="bg-orange-100 text-orange-900 border border-orange-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-orange-600" />
                            <span>متوقف مؤقتاً</span>
                          </span>
                        )}
                        {s.status === 'rejected' && (
                          <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>مرفوض</span>
                          </span>
                        )}

                        <span className="bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          محافظة {s.governorate}
                        </span>
                      </div>

                      {/* Details & Specs */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-black/60 dark:text-white/60">
                        <span>صاحب الورشة: <strong className="text-[#211d18] dark:text-[#f5f0e7]">{s.name}</strong></span>
                        <span>كود الحساب: <strong className="text-[#211d18] dark:text-[#f5f0e7] font-mono text-[11px]">{s.userId || s.id}</strong></span>
                        <span>الحرفة: <strong className="text-[#211d18] dark:text-[#f5f0e7]">{s.specialty || 'مشغولات تراثية'}</strong></span>
                        <span>الهاتف: <strong className="text-[#211d18] dark:text-[#f5f0e7] font-mono">{s.phone}</strong></span>
                        {s.email && <span>البريد: <strong className="text-[#211d18] dark:text-[#f5f0e7]">{s.email}</strong></span>}
                        {s.createdAt && <span>تاريخ التقديم: <strong className="text-[#211d18] dark:text-[#f5f0e7]">{s.createdAt.split('T')[0]}</strong></span>}
                      </div>

                      {/* Reasons display if rejected or suspended */}
                      {s.status === 'rejected' && s.rejectionReason && (
                        <div className="text-xs bg-rose-50 text-rose-800 px-3 py-1 rounded-lg border border-rose-200 inline-block mt-1">
                          <strong>سبب الرفض:</strong> {s.rejectionReason}
                        </div>
                      )}
                      {s.status === 'suspended' && s.suspensionReason && (
                        <div className="text-xs bg-orange-50 text-orange-900 px-3 py-1 rounded-lg border border-orange-200 inline-block mt-1">
                          <strong>سبب الوقف:</strong> {s.suspensionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 w-full md:w-auto">
                    <button
                      type="button"
                      id={`admin-view-seller-${s.id}`}
                      onClick={() => openEditSellerModal(s)}
                      className="px-3.5 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="معاينة تفاصيل طلب الورشة وتعديل الغلاف"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#9a6a35] dark:text-[#d5a56d]" />
                      <span>تفاصيل الورشة</span>
                    </button>

                    {/* Action buttons based on current state */}
                    {s.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          id={`admin-approve-seller-${s.id}`}
                          onClick={() => approveSeller(s.id)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>الموافقة على الورشة</span>
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
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
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
                        className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>وقف الحساب مؤقتاً</span>
                      </button>
                    )}

                    {(s.status === 'suspended' || s.status === 'rejected') && (
                      <button
                        type="button"
                        id={`admin-reactivate-seller-${s.id}`}
                        onClick={() => approveSeller(s.id)}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>إعادة التفعيل والموافقة</span>
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
        <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-6 shadow-sm space-y-6 text-[#211d18] dark:text-[#f5f0e7]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
            <div>
              <h3 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7]">طلبات وشحنات المنصة</h3>
              <p className="text-xs text-black/60 dark:text-white/60">متابعة الأوردرات والتأكد من تحويلات الفلوس (إنستاباي / فودافون كاش)</p>
            </div>

            {/* Summary Counters & Refresh */}
            <div className="flex flex-wrap items-center gap-2">
              <RefreshDataButton
                onRefresh={refreshOrders}
                label="تحديث الأوردرات"
              />

              <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {orders.filter((o) => o.paymentStatus === 'payment_pending_verification').length} مستنيين تأكيد التحويل
                </span>
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {orders.filter((o) => o.paymentStatus === 'paid').length} اتدفعت خلاص
                </span>
              </span>
            </div>
          </div>

          {/* Payment Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-500 font-bold ml-1">فلترة حسب طريقة الدفع:</span>
            {[
              { id: 'all', label: 'كل الأوردرات' },
              { id: 'pending_verification', label: '⚠️ مستنيين تأكيد التحويل' },
              { id: 'paid', label: '✅ الدفع اتأكد' },
              { id: 'payment_rejected', label: '❌ تحويلات اترفضت' },
              { id: 'cod', label: '💵 الدفع وقت الاستلام' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setOrderPaymentFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${orderPaymentFilter === tab.id
                  ? 'bg-[#9a6a35] text-white'
                  : 'bg-black/5 dark:bg-white/5 text-gray-700 hover:bg-[#f0e4d7] border border-[#dfcebe]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="wah-table-container overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
            <table className="w-full text-xs text-right">
              <thead className="bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 border-b border-black/10 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4 font-bold">رقم الأوردر</th>
                  <th className="py-3 px-4 font-bold">المشتري</th>
                  <th className="py-3 px-4 font-bold">طريقة الدفع</th>
                  <th className="py-3 px-4 font-bold">بيانات التحويل</th>
                  <th className="py-3 px-4 font-bold">المبلغ</th>
                  <th className="py-3 px-4 font-bold">حالة الدفع</th>
                  <th className="py-3 px-4 font-bold">حالة الأوردر</th>
                  <th className="py-3 px-4 font-bold text-center">التأكيد والشحن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 dark:divide-white/10">
                {orders
                  .filter((ord) => {
                    if (orderPaymentFilter === 'all') return true;
                    if (orderPaymentFilter === 'pending_verification') return ord.paymentStatus === 'payment_pending_verification';
                    if (orderPaymentFilter === 'paid') return ord.paymentStatus === 'paid';
                    if (orderPaymentFilter === 'payment_rejected') return ord.paymentStatus === 'payment_rejected';
                    if (orderPaymentFilter === 'cod') return ord.paymentMethod === 'cod';
                    return true;
                  })
                  .map((ord) => {
                    const isPendingVerification = ord.paymentStatus === 'payment_pending_verification';
                    return (
                      <tr key={ord.id} className={`hover:bg-black/5 dark:bg-white/5 ${isPendingVerification ? 'bg-amber-50/40' : ''}`}>
                        <td className="py-3 px-4 font-mono font-bold text-[#9a6a35] dark:text-[#d5a56d]">
                          #{ord.orderNumber || ord.id}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#211d18] dark:text-[#f5f0e7]">
                          {ord.shippingAddress?.fullName || (ord.shippingAddress as any)?.buyerName || ord.buyerName}
                          <span className="block text-[10px] text-gray-500 font-normal">
                            {ord.shippingAddress?.phone || (ord.shippingAddress as any)?.buyerPhone || ord.buyerPhone} • {ord.shippingAddress?.governorate || 'المحافظة'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold">
                          {ord.paymentMethod === 'vodafone_cash' ? (
                            <span className="text-red-700 flex items-center gap-1">
                              <Wallet className="w-3.5 h-3.5" />
                              فودافون كاش
                            </span>
                          ) : ord.paymentMethod === 'instapay' ? (
                            <span className="text-blue-700 flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5" />
                              إنستاباي
                            </span>
                          ) : ord.paymentMethod === 'credit_card' ? (
                            <span className="text-amber-800">كارت بنكي</span>
                          ) : (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5" />
                              وقت الاستلام
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {ord.paymentReference ? (
                            <div className="bg-black/5 dark:bg-white/5 p-1.5 rounded border border-[#dfcebe] text-[11px] font-mono text-gray-800">
                              <span className="text-[10px] text-gray-500 block">رقم التحويل / الحساب:</span>
                              {ord.paymentReference}
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400">مش متسجل</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-black text-[#9a6a35] dark:text-[#d5a56d] text-sm">{ord.total} ج.م</td>
                        <td className="py-3 px-4">
                          {ord.paymentStatus === 'payment_pending_verification' ? (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[10px] font-bold inline-flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>مستني تأكيد التحويل</span>
                            </span>
                          ) : ord.paymentStatus === 'paid' ? (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>اتأكد الدفع خلاص</span>
                            </span>
                          ) : ord.paymentStatus === 'payment_rejected' ? (
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-rose-700" />
                              <span>تحويل مرفوض</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-bold">
                              {ord.paymentMethod === 'cod' ? 'تحصيل وقت الاستلام' : 'معلق'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={ord.status}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                            className="px-2 py-1 bg-white border border-black/10 dark:border-white/10 rounded-lg text-[11px] font-bold text-gray-700 outline-none cursor-pointer"
                          >
                            <option value="pending">جديد (Pending)</option>
                            <option value="confirmed">متأكد (Confirmed)</option>
                            <option value="processing">بيتجهز (Processing)</option>
                            <option value="shipped">في الطريق (Shipped)</option>
                            <option value="delivered">اتسلم (Delivered)</option>
                            <option value="cancelled">ملغي (Cancelled)</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {isPendingVerification && (
                              <>
                                <button
                                  type="button"
                                  disabled={verifyingOrderId === ord.id}
                                  onClick={() => handleAdminVerifyPayment(ord.id)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                  title="تأكيد استلام التحويل واعتماد الطلب"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{verifyingOrderId === ord.id ? 'بنأكد...' : 'تأكيد الاستلام'}</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={rejectingOrderId === ord.id}
                                  onClick={() => handleAdminRejectPayment(ord.id)}
                                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="رفض التحويل وإشعار المشتري"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>رفض</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: PAYMENT SETTINGS */}
      {activeTab === 'payment-settings' && (
        <div className="bg-white rounded-3xl border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#211d18] dark:text-[#f5f0e7] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#9a6a35] dark:text-[#d5a56d]" />
                <span>إعدادات طرق الدفع وحسابات المنصة (إنستاباي وفودافون كاش)</span>
              </h3>
              <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                ظبط حسابات ورقم المحفظة اللي الزباين هيبعتوا عليها الفلوس في صفحة الدفع.
              </p>
            </div>
            <RefreshDataButton
              onRefresh={fetchAdminPaymentSettings}
              label="تحديث الإعدادات"
            />
          </div>

          <form onSubmit={handleSaveAdminPaymentSettings} className="space-y-6 max-w-2xl">
            {/* InstaPay Section */}
            <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/30 space-y-4">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <h4 className="font-bold text-sm text-blue-950 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>حساب إنستاباي (InstaPay)</span>
                </h4>
                <label className="flex items-center gap-2 text-xs font-bold text-blue-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminPaymentSettings.isInstaPayActive}
                    onChange={(e) => setAdminPaymentSettings({ ...adminPaymentSettings, isInstaPayActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>شغال في الدفع</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  عنوان إنستاباي للمنصة (IPA):
                </label>
                <input
                  type="text"
                  required
                  value={adminPaymentSettings.instaPayAccount}
                  onChange={(e) => setAdminPaymentSettings({ ...adminPaymentSettings, instaPayAccount: e.target.value })}
                  placeholder="مثال: wah@instapay"
                  className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-xl text-sm font-mono text-gray-900 outline-none focus:border-blue-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  تعليمات للزبون لما يختار إنستاباي:
                </label>
                <textarea
                  value={adminPaymentSettings.instaPayInstructions || ''}
                  onChange={(e) => setAdminPaymentSettings({ ...adminPaymentSettings, instaPayInstructions: e.target.value })}
                  placeholder="اكتب التعليمات اللي تظهر للزبون..."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-white border border-blue-200 rounded-xl text-xs text-gray-800 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Vodafone Cash Section */}
            <div className="p-5 rounded-2xl border border-red-200 bg-red-50/30 space-y-4">
              <div className="flex items-center justify-between border-b border-red-100 pb-2">
                <h4 className="font-bold text-sm text-red-950 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-red-600" />
                  <span>محفظة فودافون كاش</span>
                </h4>
                <label className="flex items-center gap-2 text-xs font-bold text-red-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminPaymentSettings.isVodafoneCashActive}
                    onChange={(e) => setAdminPaymentSettings({ ...adminPaymentSettings, isVodafoneCashActive: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span>شغال في الدفع</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  رقم محفظة فودافون كاش المعتمد:
                </label>
                <input
                  type="text"
                  required
                  value={adminPaymentSettings.vodafoneCashNumber}
                  onChange={(e) => setAdminPaymentSettings({ ...adminPaymentSettings, vodafoneCashNumber: e.target.value })}
                  placeholder="مثال: 01158969931"
                  className="w-full px-3.5 py-2.5 bg-white border border-red-200 rounded-xl text-sm font-mono text-gray-900 outline-none focus:border-red-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  تعليمات للزبون لما يختار فودافون كاش:
                </label>
                <textarea
                  value={adminPaymentSettings.vodafoneCashInstructions || ''}
                  onChange={(e) => setAdminPaymentSettings({ ...adminPaymentSettings, vodafoneCashInstructions: e.target.value })}
                  placeholder="اكتب التعليمات اللي تظهر للزبون..."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-white border border-red-200 rounded-xl text-xs text-gray-800 outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Cash on Delivery Section */}
            <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>الدفع كاش وقت الاستلام (COD)</span>
                </h4>
                <label className="flex items-center gap-2 text-xs font-bold text-emerald-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminPaymentSettings.isCashOnDeliveryActive}
                    onChange={(e) => setAdminPaymentSettings({ ...adminPaymentSettings, isCashOnDeliveryActive: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>شغال في الدفع</span>
                </label>
              </div>
              <p className="text-xs text-emerald-800">
                تشغيل خيار دفع الفلوس كاش في إيد مندوب الشحن أول ما الأوردر يوصل.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSavingPaymentSettings}
              className="px-8 py-3.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              {isSavingPaymentSettings ? (
                <span>بنحفظ الإعدادات...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>حفظ وتطبيق إعدادات الدفع</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-black/10 dark:border-white/10 shadow-xs">
            <div>
              <h3 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7]">إدارة كوبونات وأكواد الخصم</h3>
              <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">
                عمل ومتابعة كوبونات الخصم، وصلاحيتها، والحد الأدنى للأوردر
              </p>
            </div>
            <RefreshDataButton
              onRefresh={async () => {
                // Re-sync coupons
              }}
              label="تحديث الكوبونات"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <form onSubmit={handleCreateCoupon} className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-6 shadow-sm space-y-4 text-[#211d18] dark:text-[#f5f0e7]">
                <h3 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7]">إضافة كوبون خصم جديد</h3>

                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">كود الكوبون (حروف إنجليزي)</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="مثال: UPPEREGYPT25"
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs font-mono uppercase outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">نسبة الخصم (%)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={90}
                      value={newDiscount}
                      onChange={(e) => setNewDiscount(Number(e.target.value))}
                      className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">أقل قيمة للأوردر (ج.م)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newMinOrder}
                      onChange={(e) => setNewMinOrder(Number(e.target.value))}
                      className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#9a6a35] hover:bg-[#7d5427] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>تفعيل ونشر الكوبون</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-6 shadow-sm space-y-4 text-[#211d18] dark:text-[#f5f0e7]">
                <h3 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7]">كوبونات الخصم الشغالة دلوقتي</h3>

                <div className="space-y-3">
                  {coupons.map((c, i) => (
                    <div key={i} className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-black text-sm text-[#9a6a35] dark:text-[#d5a56d] block">{c.code}</span>
                        <span className="text-xs text-black/60 dark:text-white/60">
                          خصم <strong>{c.discount}%</strong> • للطلبات فوق {c.minOrder} ج.م
                        </span>
                      </div>

                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                        شغال ومفعل
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-6 shadow-sm space-y-4 text-[#211d18] dark:text-[#f5f0e7]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7]">سجل العمليات والنشاط (Audit Logs)</h3>
              <p className="text-xs text-black/60 dark:text-white/60">
                سجل بيوضح كل عمليات الاعتماد والرفض وتعديل المنتجات مع الوقت واسم المسؤول
              </p>
            </div>
            <RefreshDataButton
              onRefresh={refreshAuditLogs}
              label="تحديث السجل"
            />
          </div>

          <div className="wah-table-container overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
            <table className="w-full text-xs text-right">
              <thead className="bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 border-b border-black/10 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4 font-bold">الوقت والتاريخ</th>
                  <th className="py-3 px-4 font-bold">المستخدم والدور</th>
                  <th className="py-3 px-4 font-bold">العملية</th>
                  <th className="py-3 px-4 font-bold">القسم / العنصر</th>
                  <th className="py-3 px-4 font-bold">تفاصيل العملية</th>
                  <th className="py-3 px-4 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 dark:divide-white/10">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-black/5 dark:bg-white/5">
                    <td className="py-3 px-4 font-mono text-black/60 dark:text-white/60 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-4 font-bold text-[#211d18] dark:text-[#f5f0e7]">
                      {log.userName}
                      <span className="block text-[10px] text-black/60 dark:text-white/60 font-normal">{log.userRole}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#9a6a35] dark:text-[#d5a56d]">{log.action}</td>
                    <td className="py-3 px-4 text-[#211d18] dark:text-[#f5f0e7]">{log.resource}</td>
                    <td className="py-3 px-4 text-black/60 dark:text-white/60 max-w-xs">{log.details}</td>
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

      {/* TAB 9: USERS MANAGEMENT (FULL CONTROL) */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm text-[#211d18] dark:text-[#f5f0e7]">
              <span className="text-[11px] text-black/60 dark:text-white/60 block mb-1">إجمالي المستخدمين</span>
              <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">{adminUsers.length}</span>
            </div>
            <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm text-[#211d18] dark:text-[#f5f0e7]">
              <span className="text-[11px] text-black/60 dark:text-white/60 block mb-1">المشترين (Buyers)</span>
              <span className="text-2xl font-black text-blue-700 font-mono">
                {adminUsers.filter((u) => u.role === 'buyer').length}
              </span>
            </div>
            <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm text-[#211d18] dark:text-[#f5f0e7]">
              <span className="text-[11px] text-black/60 dark:text-white/60 block mb-1">الورش والحرفيين (Sellers)</span>
              <span className="text-2xl font-black text-amber-700 font-mono">
                {adminUsers.filter((u) => u.role === 'seller').length}
              </span>
            </div>
            <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm text-[#211d18] dark:text-[#f5f0e7]">
              <span className="text-[11px] text-black/60 dark:text-white/60 block mb-1">المسؤولين (Admins)</span>
              <span className="text-2xl font-black text-purple-700 font-mono">
                {adminUsers.filter((u) => u.role === 'admin').length}
              </span>
            </div>
            <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm text-[#211d18] dark:text-[#f5f0e7]">
              <span className="text-[11px] text-black/60 dark:text-white/60 block mb-1">حسابات شغالة</span>
              <span className="text-2xl font-black text-emerald-700 font-mono">
                {adminUsers.filter((u) => (u.status || 'active') === 'active').length}
              </span>
            </div>
            <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm text-[#211d18] dark:text-[#f5f0e7]">
              <span className="text-[11px] text-black/60 dark:text-white/60 block mb-1">حسابات متوقفة</span>
              <span className="text-2xl font-black text-rose-700 font-mono">
                {adminUsers.filter((u) => u.status === 'suspended' || u.status === 'blocked').length}
              </span>
            </div>
          </div>

          {/* Search, Filters & Action Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 dark:border-white/10 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
              <input
                type="text"
                id="admin-users-search-input"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="دور بالاسم، اسم المستخدم، الإيميل، أو الموبايل..."
                className="w-full pl-3 pr-10 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <RefreshDataButton
                onRefresh={fetchAdminUsers}
                label="تحديث الحسابات"
              />

              {/* Role filter */}
              <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-2 py-1">
                <Filter className="w-3.5 h-3.5 text-black/60 dark:text-white/60" />
                <select
                  id="admin-users-role-filter"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="bg-transparent text-xs font-medium outline-none py-1.5 cursor-pointer text-[#211d18] dark:text-[#f5f0e7]"
                >
                  <option value="all">كل الأدوار</option>
                  <option value="buyer">المشترين</option>
                  <option value="seller">الورش والصنايعية</option>
                  <option value="admin">المسؤولين</option>
                </select>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-2 py-1">
                <select
                  id="admin-users-status-filter"
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="bg-transparent text-xs font-medium outline-none py-1.5 cursor-pointer text-[#211d18] dark:text-[#f5f0e7]"
                >
                  <option value="all">كل الحالات</option>
                  <option value="active">الحسابات الشغالة بس</option>
                  <option value="suspended">الحسابات المتوقفة بس</option>
                </select>
              </div>

              {/* Governorate filter */}
              <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-2 py-1">
                <select
                  id="admin-users-gov-filter"
                  value={userGovernorateFilter}
                  onChange={(e) => setUserGovernorateFilter(e.target.value)}
                  className="bg-transparent text-xs font-medium outline-none py-1.5 cursor-pointer text-[#211d18] dark:text-[#f5f0e7]"
                >
                  <option value="all">كل المحافظات</option>
                  <option value="قنا">قنا</option>
                  <option value="سوهاج">سوهاج</option>
                  <option value="أسوان">أسوان</option>
                  <option value="الأقصر">الأقصر</option>
                  <option value="أسيوط">أسيوط</option>
                  <option value="المنيا">المنيا</option>
                  <option value="بني سويف">بني سويف</option>
                  <option value="الوادي الجديد">الوادي الجديد</option>
                  <option value="القاهرة">القاهرة</option>
                  <option value="الجيزة">الجيزة</option>
                  <option value="الإسكندرية">الإسكندرية</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              {/* Refresh button */}
              <button
                type="button"
                id="admin-users-refresh-btn"
                onClick={fetchAdminUsers}
                disabled={isLoadingUsers}
                className="p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="تحديث البيانات"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">تحديث</span>
              </button>

              {/* Add User button */}
              <button
                type="button"
                id="admin-add-user-btn"
                onClick={() => setIsCreateUserModalOpen(true)}
                className="px-3.5 py-2.5 bg-[#9a6a35] hover:bg-[#7d5427] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة مستخدم جديد</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-2xl border border-black/10 dark:border-white/10 shadow-sm overflow-hidden text-[#211d18] dark:text-[#f5f0e7]">
            <div className="wah-table-container overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-black/60 dark:text-white/60">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">المستخدم</th>
                    <th className="py-3.5 px-4 font-bold">الدور</th>
                    <th className="py-3.5 px-4 font-bold">الحالة</th>
                    <th className="py-3.5 px-4 font-bold">المحافظة</th>
                    <th className="py-3.5 px-4 font-bold">الموبايل</th>
                    <th className="py-3.5 px-4 font-bold">تاريخ الانضمام</th>
                    <th className="py-3.5 px-4 font-bold text-center">التحكم والإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 dark:divide-white/10">
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#9a6a35] dark:text-[#d5a56d]" />
                        <span>بنحمّل بيانات المستخدمين...</span>
                      </td>
                    </tr>
                  ) : adminUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        مفيش حسابات متطابقة مع البحث والفلتر.
                      </td>
                    </tr>
                  ) : (
                    adminUsers.map((u) => {
                      const isCurrentAdmin = currentUser.id === u.id;
                      const isSuspended = u.status === 'suspended' || u.status === 'blocked';
                      return (
                        <tr key={u.id} className="hover:bg-black/5 dark:bg-white/5/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative shrink-0">
                                <img
                                  src={u.profileImage?.secureUrl || u.avatar || 'https://res.cloudinary.com/kuana1nl/image/upload/v1788710904/user.jpg'}
                                  alt={u.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-black/10 dark:border-white/10"
                                />
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${isSuspended ? 'bg-rose-500' : 'bg-emerald-500'
                                    }`}
                                  title={isSuspended ? 'حساب متوقف' : 'حساب شغال'}
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-[#211d18] dark:text-[#f5f0e7] truncate">{u.name}</span>
                                  {isCurrentAdmin && (
                                    <span className="bg-amber-100 text-[#9a6a35] dark:text-[#d5a56d] text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                                      أنت
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-gray-500 block truncate">
                                  {u.username ? `@${u.username}` : ''} {u.email ? `• ${u.email}` : ''}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : u.role === 'seller'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}
                            >
                              {u.role === 'admin' ? 'مسؤول منصة' : u.role === 'seller' ? 'ورشة وصنايعي' : 'مشتري موثق'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${isSuspended
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-rose-600' : 'bg-emerald-600'}`} />
                              <span>{isSuspended ? 'متوقف' : 'شغال'}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-[#211d18] dark:text-[#f5f0e7]">{u.governorate || 'مش محدد'}</td>
                          <td className="py-3 px-4 font-mono text-gray-600">{u.phone || '---'}</td>
                          <td className="py-3 px-4 text-gray-500 text-[11px]">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG') : '---'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* View Details */}
                              <button
                                type="button"
                                id={`view-user-${u.id}`}
                                onClick={() => openUserDetails(u.id)}
                                title="تفاصيل الحساب"
                                className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-gray-600" />
                                <span className="hidden xl:inline">تفاصيل</span>
                              </button>

                              {/* Edit Profile */}
                              <button
                                type="button"
                                id={`edit-user-${u.id}`}
                                onClick={() => handleOpenEditUser(u)}
                                title="تعديل الحساب"
                                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                                <span className="hidden xl:inline">تعديل</span>
                              </button>

                              {/* Reset Password */}
                              <button
                                type="button"
                                id={`reset-pwd-${u.id}`}
                                onClick={() => handleOpenResetPassword(u)}
                                title="تغيير كلمة السر"
                                className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Key className="w-3.5 h-3.5 text-amber-600" />
                                <span className="hidden xl:inline">الباسورد</span>
                              </button>

                              {/* Toggle Suspension (Suspend / Activate) */}
                              {!isCurrentAdmin && (
                                <button
                                  type="button"
                                  id={`toggle-status-${u.id}`}
                                  onClick={() => handleToggleUserStatus(u)}
                                  disabled={isTogglingStatus === u.id}
                                  title={isSuspended ? 'تفعيل الحساب' : 'وقف الحساب مؤقتاً'}
                                  className={`p-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${isSuspended
                                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                    : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                                    }`}
                                >
                                  {isTogglingStatus === u.id ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : isSuspended ? (
                                    <UserCheck className="w-3.5 h-3.5" />
                                  ) : (
                                    <UserX className="w-3.5 h-3.5" />
                                  )}
                                  <span className="hidden xl:inline">{isSuspended ? 'تفعيل' : 'وقف'}</span>
                                </button>
                              )}

                              {/* Delete User */}
                              {isCurrentAdmin ? (
                                <span
                                  title="حسابك الشخصي (ما ينفعش تحذف نفسك)"
                                  className="p-2 bg-gray-100 text-gray-400 border border-gray-200 rounded-xl text-xs font-bold cursor-not-allowed"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  id={`delete-user-${u.id}`}
                                  onClick={() => setSelectedUserForDelete(u)}
                                  title="حذف الحساب نهائياً"
                                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="hidden xl:inline">حذف</span>
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

      {/* TAB 10: PASSWORD RESET REQUESTS */}
      {activeTab === 'password-resets' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header & Metrics Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl p-5 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm text-[#211d18] dark:text-[#f5f0e7]">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#211d18] dark:text-[#f5f0e7] flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#9a6a35] dark:text-[#d5a56d]" />
                <span>طلبات تغيير كلمات السر</span>
              </h2>
              <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                متابعة طلبات الناس اللي نسيت الباسورد، وتعملهم باسورد مؤقت عشان يعرفوا يسجلوا دخول.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-800">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>طلبات مستنية: {passwordResets.filter((r) => r.status === 'pending').length}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-2 py-1">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  id="admin-password-resets-filter"
                  value={passwordResetFilter}
                  onChange={(e) => setPasswordResetFilter(e.target.value as any)}
                  className="bg-transparent text-xs font-medium outline-none py-1.5 cursor-pointer text-[#211d18] dark:text-[#f5f0e7]"
                >
                  <option value="all">كل الطلبات ({passwordResets.length})</option>
                  <option value="pending">طلبات مستنية ({passwordResets.filter((r) => r.status === 'pending').length})</option>
                  <option value="completed">اتنفذت خلاص ({passwordResets.filter((r) => r.status === 'completed').length})</option>
                  <option value="rejected">مرفوضة ({passwordResets.filter((r) => r.status === 'rejected').length})</option>
                </select>
              </div>

              <RefreshDataButton
                id="admin-password-resets-refresh-btn"
                onRefresh={fetchPasswordResets}
                isLoading={isLoadingPasswordResets}
                label="تحديث الطلبات"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-2xl border border-black/10 dark:border-white/10 shadow-sm overflow-hidden text-[#211d18] dark:text-[#f5f0e7]">
            <div className="wah-table-container overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-black/60 dark:text-white/60">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">اسم المستخدم</th>
                    <th className="py-3.5 px-4 font-bold">رقم الموبايل</th>
                    <th className="py-3.5 px-4 font-bold">تاريخ الطلب</th>
                    <th className="py-3.5 px-4 font-bold">الحالة</th>
                    <th className="py-3.5 px-4 font-bold">المسؤول اللي نفذ</th>
                    <th className="py-3.5 px-4 font-bold">تاريخ التنفيذ</th>
                    <th className="py-3.5 px-4 font-bold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 dark:divide-white/10">
                  {isLoadingPasswordResets ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#9a6a35] dark:text-[#d5a56d]" />
                        <span>بنحمّل طلبات تغيير الباسورد...</span>
                      </td>
                    </tr>
                  ) : passwordResets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        مفيش طلبات تغيير باسورد متطابقة مع الفلتر.
                      </td>
                    </tr>
                  ) : (
                    passwordResets.map((r) => {
                      const isPending = r.status === 'pending';
                      const isCompleted = r.status === 'completed';
                      return (
                        <tr key={r.id} className="hover:bg-black/5 dark:bg-white/5/60 transition-colors">
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-bold text-[#211d18] dark:text-[#f5f0e7] block">
                                {r.name || r.username}
                              </span>
                              <span className="text-[11px] text-gray-500 font-mono">
                                @{r.username}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono">
                            {r.phone || 'مش متسجل'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {r.createdAt ? new Date(r.createdAt).toLocaleString('ar-EG') : '-'}
                          </td>
                          <td className="py-3 px-4">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>مستني المعالجة</span>
                              </span>
                            ) : isCompleted ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>اتنفذ خلاص</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-900 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>مرفوض</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-medium text-[#211d18] dark:text-[#f5f0e7]">
                            {r.handledByAdminName ? (
                              <span className="inline-flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                                <span>{r.handledByAdminName}</span>
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {r.handledAt ? new Date(r.handledAt).toLocaleString('ar-EG') : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              {isPending ? (
                                <>
                                  <button
                                    type="button"
                                    id={`complete-reset-btn-${r.id}`}
                                    onClick={() => openCreateTempPasswordModal(r)}
                                    className="px-3 py-1.5 bg-[#9a6a35] hover:bg-[#7d5427] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <Key className="w-3.5 h-3.5" />
                                    <span>عمل باسورد جديد</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectReset(r)}
                                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                    title="رفض الطلب"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>رفض</span>
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-gray-400 font-medium">اتنفذ خلاص</span>
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

      {/* TAB 11: SELLER PAYOUT REQUESTS (طلبات صرف المستحقات) */}
      {activeTab === 'payouts' && <AdminPayouts user={currentUser} />}

      {/* TAB 12: PLATFORM NOTIFICATIONS (مركز الإشعارات والتنبيهات العامة) */}
      {activeTab === 'notifications' && (
        <NotificationsManager
          viewMode="admin"
          onNavigateTab={(tab) => {
            if (tab === 'orders') setActiveTab('orders');
            else if (tab === 'products' || tab === 'approvals') setActiveTab('approvals');
            else if (tab === 'payouts') setActiveTab('payouts');
            else if (tab === 'sellers') setActiveTab('sellers');
            else if (tab === 'users') setActiveTab('users');
            else if (tab === 'password-resets') setActiveTab('password-resets');
          }}
        />
      )}

      {/* Category Add / Edit Modal (Phase 4) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white/95 dark:bg-[#151513]/95 backdrop-blur-2xl rounded-[2rem] border border-black/10 dark:border-white/10 max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto my-auto text-[#211d18] dark:text-[#f5f0e7]">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <h3 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7]">
                {editingCategory ? 'تعديل القسم التراثي' : 'إضافة قسم تراثي جديد'}
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
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">اسم القسم (عربي) *</label>
                  <input
                    type="text"
                    required
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="مثال: فخار وخزف قنا"
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">الاسم بالإنجليزية</label>
                  <input
                    type="text"
                    value={categoryNameEn}
                    onChange={(e) => setCategoryNameEn(e.target.value)}
                    placeholder="e.g. Pottery & Ceramics"
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">الأيقونة (Emoji أو رمز)</label>
                  <input
                    type="text"
                    value={categoryIcon}
                    onChange={(e) => setCategoryIcon(e.target.value)}
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-center text-lg outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">الرابط المختصر (Slug)</label>
                  <input
                    type="text"
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    placeholder="cat-pottery"
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs font-mono outline-none focus:border-[#9a6a35]"
                  />
                </div>
              </div>

              <AdminMediaUploader
                entityType="category"
                entitySlug={categorySlug || 'category'}
                entityTitle={categoryName}
                value={categoryImage}
                onChange={(val) => setCategoryImage(val)}
                label="صورة القسم التراثي"
                helperText="ارفع صورة معبرة عن نوع الحرفة من جهازك أو حط لينك مباشر"
              />

              <div>
                <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">وصف الحرفة وتاريخها</label>
                <textarea
                  rows={2}
                  value={categoryDesc}
                  onChange={(e) => setCategoryDesc(e.target.value)}
                  placeholder="احكي عن أصل الصنعة وتاريخها في الصعيد..."
                  className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-black/60 dark:text-white/60"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCat}
                  className="px-5 py-2.5 bg-[#9a6a35] hover:bg-[#7d5427] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingCat ? 'بنحفظ...' : 'حفظ القسم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Craft Story Add / Edit Modal (قصص الصنعة وأسرار الأجداد) */}
      {isCraftStoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-black/10 dark:border-white/10 max-w-xl w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7]">
                  {editingCraftStory ? 'تعديل حكاية الصنعة' : 'إضافة حكاية صنعة جديدة'}
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
                <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">عنوان الصنعة التراثية *</label>
                <input
                  type="text"
                  required
                  value={craftTitle}
                  onChange={(e) => setCraftTitle(e.target.value)}
                  placeholder="مثال: فخار قنا وأسيوط (طين النيل العذب)"
                  className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">العنوان الفرعي وسر الصنعة</label>
                <input
                  type="text"
                  value={craftSubtitle}
                  onChange={(e) => setCraftSubtitle(e.target.value)}
                  placeholder="مثال: سر البرودة والنكهة الخالدة من زمان"
                  className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">المحافظة *</label>
                  <input
                    type="text"
                    required
                    value={craftGovernorate}
                    onChange={(e) => setCraftGovernorate(e.target.value)}
                    placeholder="مثال: قنا"
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">المركز / البندر</label>
                  <input
                    type="text"
                    value={craftCity}
                    onChange={(e) => setCraftCity(e.target.value)}
                    placeholder="مثال: نقادة أو أخميم"
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">القرية أو النجع</label>
                  <input
                    type="text"
                    value={craftVillage}
                    onChange={(e) => setCraftVillage(e.target.value)}
                    placeholder="مثال: قرية الجرنة أو طوخ"
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">عمر الصنعة التقريبي</label>
                  <input
                    type="text"
                    value={craftHistoryAge}
                    onChange={(e) => setCraftHistoryAge(e.target.value)}
                    placeholder="مثال: أكتر من 5000 سنة"
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">حالة التوثيق</label>
                  <select
                    value={craftVerificationStatus}
                    onChange={(e) => setCraftVerificationStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  >
                    <option value="verified">متوثقة ومعتمدة</option>
                    <option value="pending_review">تحت المراجعة</option>
                    <option value="draft">مسودة مؤقتة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">القسم التراثي</label>
                  <select
                    value={craftCategoryId}
                    onChange={(e) => setCraftCategoryId(e.target.value)}
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">ترتيب الظهور</label>
                  <input
                    type="number"
                    min="1"
                    value={craftDisplayOrder}
                    onChange={(e) => setCraftDisplayOrder(Number(e.target.value) || 1)}
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>
              </div>

              <AdminMediaUploader
                entityType="craft"
                entitySlug={craftTitle || 'craft-story'}
                entityTitle={craftTitle}
                governorateName={craftGovernorate}
                value={craftImage}
                onChange={(val) => setCraftImage(val)}
                label="صورة توثيق الصنعة"
                helperText="ارفع صورة الأسطى أو الورشة من جهازك أو حط لينك مباشر"
              />

              <div>
                <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">حكاية وتوثيق الصنعة التراثية *</label>
                <textarea
                  required
                  rows={3}
                  value={craftDescription}
                  onChange={(e) => setCraftDescription(e.target.value)}
                  placeholder="احكي بالتفصيل حكاية الصنعة وسر توارثها بين الأجيال في الصعيد..."
                  className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">
                    الخامات الطبيعية والبيئية (خامة في كل سطر)
                  </label>
                  <textarea
                    rows={2}
                    value={craftMaterialsText}
                    onChange={(e) => setCraftMaterialsText(e.target.value)}
                    placeholder="طمي النيل العذب&#10;رمال الصحراء الشرقية&#10;سعف النخيل"
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">
                    مراحل وتقنيات الصنعة اليدوية (مرحلة في كل سطر)
                  </label>
                  <textarea
                    rows={2}
                    value={craftTechniquesText}
                    onChange={(e) => setCraftTechniquesText(e.target.value)}
                    placeholder="التشكيل على الدولاب الخشبي&#10;التجفيف الشمسي البطيء&#10;الحرق في أفران بلدي"
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">
                  أسرار ومميزات الصنعة (ميزة في كل سطر)
                </label>
                <textarea
                  rows={2}
                  value={craftKeyFeaturesText}
                  onChange={(e) => setCraftKeyFeaturesText(e.target.value)}
                  placeholder="تبريد طبيعي فوري عبر مسام الفخار&#10;صناعة يدوية 100%&#10;آمن وصحي وخالٍ من الرصاص"
                  className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">
                    المصادر والمراجع (اسم المصدر | اللينك)
                  </label>
                  <textarea
                    rows={2}
                    value={craftSourcesText}
                    onChange={(e) => setCraftSourcesText(e.target.value)}
                    placeholder="أطلس المأثورات الشعبية المصرية | https://...&#10;سجلات حصر التراث"
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">
                    الإحداثيات الجغرافية (خط العرض , خط الطول)
                  </label>
                  <input
                    type="text"
                    value={craftCoordinatesText}
                    onChange={(e) => setCraftCoordinatesText(e.target.value)}
                    placeholder="مثال: 26.155, 32.716"
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="craft-active-toggle"
                  checked={craftActive}
                  onChange={(e) => setCraftActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#9a6a35] dark:text-[#d5a56d] focus:ring-[#9a6a35]"
                />
                <label htmlFor="craft-active-toggle" className="text-xs font-bold text-gray-800 cursor-pointer">
                  عرض الحكاية دي في الصفحة الرئيسية علطول
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCraftStoryModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-black/60 dark:text-white/60"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  id="submit-craft-story-btn"
                  disabled={isSubmittingCraftStory}
                  className="px-5 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmittingCraftStory ? 'بنحفظ...' : 'حفظ الحكاية'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Product Modal with Reason Requirement */}
      {rejectingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white/95 dark:bg-[#151513]/95 backdrop-blur-2xl rounded-[2rem] border border-black/10 dark:border-white/10 max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto my-auto text-[#211d18] dark:text-[#f5f0e7]">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <h3 className="font-bold text-base text-rose-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>رفض المنتج وتسجيل السبب</span>
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
              <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                اكتب سبب واضح لرفض المنتج عشان يظهر للأسطى في لوحة تحكمه ويقدر يعدل ويبعت تاني.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">سبب الرفض (ضروري) *</label>
                <textarea
                  required
                  rows={4}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="مثال: محتاجين تفاصيل أوضح عن نوع الطمي وطريقة الشغل اليدوي..."
                  className="w-full p-3 bg-black/5 dark:bg-white/5 border border-rose-200 rounded-xl text-xs outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setRejectingProductId(null)}
                  className="px-4 py-2 text-xs font-bold text-black/60 dark:text-white/60"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  تأكيد الرفض وإبلاغ الورشة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seller Action Modal (Reject or Suspend with Reason) */}
      {selectedSellerForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white/95 dark:bg-[#151513]/95 backdrop-blur-2xl rounded-[2rem] border border-black/10 dark:border-white/10 max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto my-auto text-[#211d18] dark:text-[#f5f0e7]">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <h3 className={`font-bold text-base flex items-center gap-2 ${selectedSellerForAction.action === 'reject' ? 'text-rose-900' : 'text-orange-900'
                }`}>
                {selectedSellerForAction.action === 'reject' ? (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>رفض طلب انضمام ورشة: {selectedSellerForAction.name}</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-orange-600" />
                    <span>وقف حساب الورشة مؤقتاً: {selectedSellerForAction.name}</span>
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
              <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                {selectedSellerForAction.action === 'reject'
                  ? 'اكتب سبب واضح لرفض طلب انضمام الورشة، عشان يظهر للأسطى في حسابه.'
                  : 'اكتب سبب وقف الورشة (زي: ملاحظات على الجودة أو تأخير في الشحن)، ومنتجاتها هتختفي مؤقتاً.'}
              </p>

              <div>
                <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">
                  سبب الإجراء الإداري (ضروري) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={sellerActionReason}
                  onChange={(e) => setSellerActionReason(e.target.value)}
                  placeholder={
                    selectedSellerForAction.action === 'reject'
                      ? 'مثال: المشغولات مش تابعة للحرف التراثية الصعيدية المعتمدة في وه...'
                      : 'مثال: في شكاوى متكررة من المشترين عن مطابقة المنتج للمواصفات...'
                  }
                  className={`w-full p-3 bg-black/5 dark:bg-white/5 border rounded-xl text-xs outline-none ${selectedSellerForAction.action === 'reject'
                    ? 'border-rose-200 focus:border-rose-500'
                    : 'border-orange-200 focus:border-orange-500'
                    }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedSellerForAction(null)}
                  className="px-4 py-2 text-xs font-bold text-black/60 dark:text-white/60"
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
                    ? 'بننفذ...'
                    : selectedSellerForAction.action === 'reject'
                      ? 'تأكيد رفض الطلب'
                      : 'تأكيد وقف الحساب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal (Safe Display with Quick Actions) */}
      {selectedUserForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white/95 dark:bg-[#151513]/95 backdrop-blur-2xl rounded-[2rem] border border-black/10 dark:border-white/10 max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto my-auto text-[#211d18] dark:text-[#f5f0e7]">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <h3 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#9a6a35] dark:text-[#d5a56d]" />
                <span>بيانات حساب المستخدم</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUserForDetails(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10">
              <div className="relative shrink-0">
                <img
                  src={selectedUserForDetails.profileImage?.secureUrl || selectedUserForDetails.avatar || 'https://res.cloudinary.com/kuana1nl/image/upload/v1788710904/user.jpg'}
                  alt={selectedUserForDetails.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${selectedUserForDetails.status === 'suspended' ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                  title={selectedUserForDetails.status === 'suspended' ? 'حساب متوقف' : 'حساب شغال'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7] truncate">{selectedUserForDetails.name}</h4>
                <p className="text-xs text-gray-500 font-mono">@{selectedUserForDetails.username || 'من غير اسم مستخدم'}</p>
                <p className="text-xs text-gray-500 truncate">{selectedUserForDetails.email || 'الإيميل مش متسجل'}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {selectedUserForDetails.role === 'admin' ? 'مسؤول المنصة' : selectedUserForDetails.role === 'seller' ? 'ورشة وصنايعي' : 'مشتري موثق'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedUserForDetails.status === 'suspended'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                      }`}
                  >
                    {selectedUserForDetails.status === 'suspended' ? 'متوقف مؤقتاً' : 'شغال'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-500 block mb-0.5">رقم الموبايل:</span>
                <span className="font-bold font-mono text-[#211d18] dark:text-[#f5f0e7]">{selectedUserForDetails.phone || 'مش متسجل'}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-500 block mb-0.5">المحافظة:</span>
                <span className="font-bold text-[#211d18] dark:text-[#f5f0e7]">{selectedUserForDetails.governorate || 'مش محدد'}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-500 block mb-0.5">كود الحساب (ID):</span>
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
                <p className="text-gray-700"><strong>الصنعة والتخصص:</strong> {selectedUserForDetails.seller.specialty || 'شغل يدوي تراثي'}</p>
                <p className="text-gray-700"><strong>حالة الاعتماد:</strong> {selectedUserForDetails.seller.status}</p>
              </div>
            )}

            {/* Quick Action Buttons inside Details Modal */}
            <div className="pt-2 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEditUser(selectedUserForDetails);
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل الحساب</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleOpenResetPassword(selectedUserForDetails);
                  }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>الباسورد</span>
                </button>

                {currentUser.id !== selectedUserForDetails.id && (
                  <button
                    type="button"
                    onClick={() => handleToggleUserStatus(selectedUserForDetails)}
                    disabled={isTogglingStatus === selectedUserForDetails.id}
                    className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${selectedUserForDetails.status === 'suspended'
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                      }`}
                  >
                    {isTogglingStatus === selectedUserForDetails.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : selectedUserForDetails.status === 'suspended' ? (
                      <UserCheck className="w-3.5 h-3.5" />
                    ) : (
                      <UserX className="w-3.5 h-3.5" />
                    )}
                    <span>{selectedUserForDetails.status === 'suspended' ? 'تفعيل' : 'وقف'}</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedUserForDetails(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                قفل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white/95 dark:bg-[#151513]/95 backdrop-blur-2xl rounded-[2rem] border border-black/10 dark:border-white/10 max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto my-auto text-[#211d18] dark:text-[#f5f0e7]">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <h3 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                <span>تعديل بيانات حساب: {selectedUserForEdit.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUserForEdit(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">الاسم بالكامل *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">اسم المستخدم (@Username) *</label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35] font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">رقم الموبايل *</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35] font-mono text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">الإيميل</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35] text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">الدور والصلاحية *</label>
                  <select
                    value={editRole}
                    disabled={currentUser.id === selectedUserForEdit.id}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35] font-bold"
                  >
                    <option value="buyer">مشتري</option>
                    <option value="seller">ورشة وصنايعي</option>
                    <option value="admin">مسؤول منصة</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">حالة الحساب *</label>
                  <select
                    value={editStatus}
                    disabled={currentUser.id === selectedUserForEdit.id}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35] font-bold"
                  >
                    <option value="active">شغال (نشط)</option>
                    <option value="suspended">متوقف مؤقتاً</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">المحافظة *</label>
                  <select
                    value={editGovernorate}
                    onChange={(e) => setEditGovernorate(e.target.value)}
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35]"
                  >
                    <option value="قنا">قنا</option>
                    <option value="سوهاج">سوهاج</option>
                    <option value="أسوان">أسوان</option>
                    <option value="الأقصر">الأقصر</option>
                    <option value="أسيوط">أسيوط</option>
                    <option value="المنيا">المنيا</option>
                    <option value="بني سويف">بني سويف</option>
                    <option value="الوادي الجديد">الوادي الجديد</option>
                    <option value="القاهرة">القاهرة</option>
                    <option value="الجيزة">الجيزة</option>
                    <option value="الإسكندرية">الإسكندرية</option>
                  </select>
                </div>
              </div>

              {editRole === 'seller' && (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                  <span className="font-bold text-amber-900 block">بيانات ورشة الصنايعي:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-950 mb-1">اسم الورشة أو البراند *</label>
                      <input
                        type="text"
                        value={editWorkshopName}
                        onChange={(e) => setEditWorkshopName(e.target.value)}
                        placeholder="مثال: ورشة الفخار الأصيل"
                        className="w-full p-2 bg-white border border-amber-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-950 mb-1">تخصص الصنعة</label>
                      <input
                        type="text"
                        value={editSpecialty}
                        onChange={(e) => setEditSpecialty(e.target.value)}
                        placeholder="مثال: الفخار والجريد"
                        className="w-full p-2 bg-white border border-amber-200 rounded-xl outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  disabled={isUpdatingUser}
                  className="px-4 py-2 text-xs font-bold text-black/60 dark:text-white/60 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  id="save-edit-user-btn"
                  disabled={isUpdatingUser}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingUser ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>بنحفظ التعديلات...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>حفظ التعديلات</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {selectedUserForResetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-black/10 dark:border-white/10 max-w-md w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <h3 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7] flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                <span>تغيير الباسورد</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUserForResetPassword(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 text-xs">
              <span className="text-gray-500 block mb-0.5">الحساب المطلوب:</span>
              <span className="font-bold text-[#211d18] dark:text-[#f5f0e7]">{selectedUserForResetPassword.name}</span>
              <span className="text-gray-500 font-mono text-[11px] block">@{selectedUserForResetPassword.username}</span>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">الباسورد الجديد (على الأقل 6 حروف أو أرقام) *</label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="اكتب الباسورد الجديد هنا..."
                  className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35] font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const randomPass = `Sa3ed@${Math.floor(1000 + Math.random() * 9000)}`;
                    setNewPasswordInput(randomPass);
                  }}
                  className="text-[11px] text-[#9a6a35] dark:text-[#d5a56d] hover:underline font-bold"
                >
                  ⚡ ولّد باسورد قوي وسريع تلقائياً
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedUserForResetPassword(null)}
                  disabled={isResettingPassword}
                  className="px-4 py-2 text-xs font-bold text-black/60 dark:text-white/60 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  id="confirm-reset-pwd-btn"
                  disabled={isResettingPassword}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isResettingPassword ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>بنغير الباسورد...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      <span>تأكيد وتغيير الباسورد</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Directly by Admin Modal */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white/95 dark:bg-[#151513]/95 backdrop-blur-2xl rounded-[2rem] border border-black/10 dark:border-white/10 max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto my-auto text-[#211d18] dark:text-[#f5f0e7]">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <h3 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#9a6a35] dark:text-[#d5a56d]" />
                <span>إضافة مستخدم جديد للمنصة</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateUserModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">نوع الحساب والصلاحية *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewUserRole('buyer')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all text-center cursor-pointer ${newUserRole === 'buyer'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 border-black/10 dark:border-white/10'
                      }`}
                  >
                    مشتري موثق
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewUserRole('seller')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all text-center cursor-pointer ${newUserRole === 'seller'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 border-black/10 dark:border-white/10'
                      }`}
                  >
                    ورشة وصنايعي
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewUserRole('admin')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all text-center cursor-pointer ${newUserRole === 'admin'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 border-black/10 dark:border-white/10'
                      }`}
                  >
                    مسؤول منصة
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">الاسم بالكامل *</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="مثال: أحمد عبد الله"
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">اسم المستخدم (@Username) *</label>
                  <input
                    type="text"
                    required
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    placeholder="ahmed_abdallah"
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35] font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">رقم الموبايل *</label>
                  <input
                    type="text"
                    required
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35] font-mono text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">الإيميل (اختياري)</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35] text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">الباسورد *</label>
                  <input
                    type="password"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="مش أقل من 6 حروف أو أرقام..."
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">المحافظة *</label>
                  <select
                    value={newUserGovernorate}
                    onChange={(e) => setNewUserGovernorate(e.target.value)}
                    className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35]"
                  >
                    <option value="قنا">قنا</option>
                    <option value="سوهاج">سوهاج</option>
                    <option value="أسوان">أسوان</option>
                    <option value="الأقصر">الأقصر</option>
                    <option value="أسيوط">أسيوط</option>
                    <option value="المنيا">المنيا</option>
                    <option value="بني سويف">بني سويف</option>
                    <option value="الوادي الجديد">الوادي الجديد</option>
                    <option value="القاهرة">القاهرة</option>
                    <option value="الجيزة">الجيزة</option>
                    <option value="الإسكندرية">الإسكندرية</option>
                  </select>
                </div>
              </div>

              {newUserRole === 'seller' && (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-2.5">
                  <span className="font-bold text-amber-900 block">بيانات ورشة الصنايعي:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-950 mb-1">اسم الورشة *</label>
                      <input
                        type="text"
                        required
                        value={newUserWorkshopName}
                        onChange={(e) => setNewUserWorkshopName(e.target.value)}
                        placeholder="مثال: ورشة النوبية للأعمال اليدوية"
                        className="w-full p-2 bg-white border border-amber-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-950 mb-1">تخصص الصنعة</label>
                      <input
                        type="text"
                        value={newUserSpecialty}
                        onChange={(e) => setNewUserSpecialty(e.target.value)}
                        placeholder="مثال: خزف، خوص، نول"
                        className="w-full p-2 bg-white border border-amber-200 rounded-xl outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  disabled={isCreatingUser}
                  className="px-4 py-2 text-xs font-bold text-black/60 dark:text-white/60 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  id="submit-create-user-btn"
                  disabled={isCreatingUser}
                  className="px-5 py-2.5 bg-[#9a6a35] hover:bg-[#7d5427] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isCreatingUser ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>بنعمل الحساب دلوقتي...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>إنشاء الحساب</span>
                    </>
                  )}
                </button>
              </div>
            </form>
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
                <h3 className="font-bold text-base text-gray-900">تأكيد مسح الحساب نهائياً</h3>
                <p className="text-xs text-rose-600 font-medium">خطوة حاسمة وما ينفعش ترجع فيها</p>
              </div>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">
              متأكد إنك عاوز تمسح حساب <strong className="text-gray-900">{selectedUserForDelete.name}</strong> ({selectedUserForDelete.email})؟
            </p>

            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-xs space-y-1.5 text-rose-900">
              <p className="font-bold">الخطوة دي هتعمل فوراً الآتي:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-800">
                <li>مسح صورة الحساب من الكلاود.</li>
                {selectedUserForDelete.role === 'seller' ? (
                  <>
                    <li>مسح الورشة وكل المنتجات وصورها المرفوعة.</li>
                    <li>حفظ وتجهيل بيانات الطلبات القديمة للمشترين.</li>
                  </>
                ) : (
                  <>
                    <li>مسح سلة التسوق والمفضلة والإشعارات الخاصة بالحساب ده.</li>
                    <li>حفظ وتجهيل سجلات الطلبات القديمة لحماية حقوق الورش والصناع.</li>
                  </>
                )}
                <li>تسجيل العملية فوراً في سجل النشاط الإداري (Audit Log).</li>
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
                    <span>بنمسح الحساب دلوقتي...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>تأكيد مسح الحساب</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Create New Temporary Password Modal */}
      {isCreateTempPasswordModalOpen && selectedResetForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-black/10 dark:border-white/10 max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <h3 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7] flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#9a6a35] dark:text-[#d5a56d]" />
                <span>عمل باسورد مؤقت جديد</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateTempPasswordModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target User Info */}
            <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">اسم المستخدم:</span>
                <span className="font-bold font-mono text-[#211d18] dark:text-[#f5f0e7]">@{selectedResetForAction.username}</span>
              </div>
              {selectedResetForAction.name && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">الاسم بالكامل:</span>
                  <span className="font-bold text-[#211d18] dark:text-[#f5f0e7]">{selectedResetForAction.name}</span>
                </div>
              )}
              {selectedResetForAction.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">رقم الموبايل:</span>
                  <span className="font-bold font-mono text-[#211d18] dark:text-[#f5f0e7]">{selectedResetForAction.phone}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleConfirmCompleteReset} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-[#211d18] dark:text-[#f5f0e7]">
                    الباسورد المؤقت *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
                      let generated = '';
                      for (let i = 0; i < 10; i++) {
                        generated += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      setTempPasswordInput(generated);
                    }}
                    className="text-[11px] text-[#9a6a35] dark:text-[#d5a56d] hover:underline font-bold cursor-pointer"
                  >
                    ⚡ ولّد باسورد قوي وسريع تلقائياً
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={tempPasswordInput}
                    onChange={(e) => setTempPasswordInput(e.target.value)}
                    placeholder="اكتب أو ولّد الباسورد المؤقت"
                    className="w-full pl-3 pr-10 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#9a6a35] font-mono text-left"
                    dir="ltr"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                ℹ️ الباسورد المؤقت هيظهرلك في الخطوة الجاية عشان تنسخه وتبعتوا للمستخدم. وهيطلب منه إجباري يغيره أول ما يدخل الحساب.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateTempPasswordModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-black/60 dark:text-white/60 hover:bg-gray-100 rounded-xl"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingTempPassword}
                  id="confirm-submit-temp-password-btn"
                  className="px-5 py-2.5 bg-[#9a6a35] hover:bg-[#7d5427] disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingTempPassword ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>بنحفظ ونشفّر الباسورد...</span>
                    </>
                  ) : (
                    <span>تأكيد وعمل الباسورد</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: "Show Once" Temporary Password Display */}
      {completedTempPasswordInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-black/10 dark:border-white/10 max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl overflow-y-auto my-auto">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-black/10 dark:border-white/10 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-black text-base text-[#211d18] dark:text-[#f5f0e7]">تم عمل الباسورد المؤقت بنجاح</h3>
                <p className="text-xs text-emerald-700 font-medium">اتحدث الحساب واتشفر الباسورد الجديد في السجلات</p>
              </div>
            </div>

            {/* Security Alert Banner */}
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>تنبيه أمني مهم: الباسورد ده هيظهرلك مرة واحدة بس!</span>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                مش هتقدر تشوف الباسورد المؤقت تاني بعد ما تقفل الشاشة دي عشان نحافظ على أمان الحساب. انسخه دلوقتي وبلّغ بيه المستخدم في الموبايل أو وسيلة التواصل المناسبة.
              </p>
            </div>

            {/* User & Password Box */}
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10 space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">اسم المستخدم:</span>
                <span className="font-bold font-mono text-base text-[#211d18] dark:text-[#f5f0e7]">@{completedTempPasswordInfo.username}</span>
              </div>

              {completedTempPasswordInfo.phone && (
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">رقم الموبايل للتواصل:</span>
                  <span className="font-bold font-mono text-sm text-[#211d18] dark:text-[#f5f0e7]">{completedTempPasswordInfo.phone}</span>
                </div>
              )}

              <div>
                <span className="text-gray-500 block mb-1">الباسورد المؤقت الجديد:</span>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 p-3 bg-white border-2 border-dashed border-[#9a6a35] rounded-xl font-mono text-center text-base sm:text-lg font-black tracking-wider text-[#211d18] dark:text-[#f5f0e7] select-all select-text"
                    dir="ltr"
                  >
                    {completedTempPasswordInfo.temporaryPassword}
                  </div>
                  <button
                    type="button"
                    id="copy-temp-password-btn"
                    onClick={copyTempPassword}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-center shrink-0 cursor-pointer ${isCopiedTempPassword
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-[#9a6a35] hover:bg-[#7d5427] border-[#9a6a35] text-white'
                      }`}
                    title="نسخ الباسورد"
                  >
                    {isCopiedTempPassword ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Force change note */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] leading-relaxed flex items-start gap-2">
              <KeyRound className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                أول ما المستخدم يسجل دخوله بالباسورد ده، هتظهرله شاشة تطلب منه تعيين باسورد جديد وخاص بيه ومش هيعرف يكمل غير لما يغيره.
              </span>
            </div>

            {/* Action buttons */}
            <div className="pt-2">
              <button
                type="button"
                id="close-temp-password-modal-btn"
                onClick={() => setCompletedTempPasswordInfo(null)}
                className="w-full py-3 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>نسخت الباسورد خلاص - اقفل الشاشة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Admin Workshop Profile & Cover Image Editor */}
      {selectedSellerForEditProfile && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-black/10 dark:border-white/10 max-w-2xl w-full p-5 sm:p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh] my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5 text-[#9a6a35] dark:text-[#d5a56d]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#211d18] dark:text-[#f5f0e7]">تعديل بيانات وغلاف الورشة</h3>
                  <p className="text-xs text-black/60 dark:text-white/60">تعديل بيانات الورشة وهوية الصانع وغلاف المعرض وصلاحيات الحساب</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSellerForEditProfile(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminSellerProfile} className="space-y-4">
              {/* Cover Image Customizer Section */}
              <div className="space-y-3 p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#9a6a35] dark:text-[#d5a56d]" />
                    <span className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">صورة غلاف الورشة:</span>
                  </div>
                  <span className="text-[11px] text-black/60 dark:text-white/60">بتظهر في خلفية كارت الورشة وصفحتها</span>
                </div>

                {/* Live Preview Card */}
                <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-inner group">
                  <img
                    src={
                      sellerEditCoverMode === 'preset'
                        ? HERITAGE_COVER_PRESETS.find((p) => p.id === sellerEditSelectedPresetId)?.url || sellerEditCoverImage
                        : sellerEditCoverMode === 'url' && sellerEditCustomUrl.trim()
                          ? sellerEditCustomUrl.trim()
                          : sellerEditCoverImage || HERITAGE_COVER_PRESETS[0].url
                    }
                    alt="معاينة الغلاف"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = HERITAGE_COVER_PRESETS[0].url;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={sellerEditAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md shrink-0"
                      />
                      <div className="text-white space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm leading-tight text-white drop-shadow-xs">
                            {sellerEditBrandName || 'اسم الورشة'}
                          </h4>
                          {sellerEditVerified && <BadgeCheck className="w-4 h-4 text-amber-400 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-amber-200">
                          {sellerEditName} • محافظة {sellerEditGovernorate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cover Mode Selector */}
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setSellerEditCoverMode('preset')}
                    className={`flex-1 py-1.5 rounded-lg transition-all text-center ${sellerEditCoverMode === 'preset' ? 'bg-[#9a6a35] text-white shadow-md' : 'text-black/60 dark:text-white/60 hover:bg-gray-50'
                      }`}
                  >
                    نماذج تراث الصعيد (8)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSellerEditCoverMode('url')}
                    className={`flex-1 py-1.5 rounded-lg transition-all text-center ${sellerEditCoverMode === 'url' ? 'bg-[#9a6a35] text-white shadow-md' : 'text-black/60 dark:text-white/60 hover:bg-gray-50'
                      }`}
                  >
                    لينك صورة مباشر
                  </button>
                  <button
                    type="button"
                    onClick={() => setSellerEditCoverMode('upload')}
                    className={`flex-1 py-1.5 rounded-lg transition-all text-center ${sellerEditCoverMode === 'upload' ? 'bg-[#9a6a35] text-white shadow-md' : 'text-black/60 dark:text-white/60 hover:bg-gray-50'
                      }`}
                  >
                    رفع صورة من جهازك
                  </button>
                </div>

                {/* Mode 1: Presets Gallery */}
                {sellerEditCoverMode === 'preset' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 max-h-48 overflow-y-auto p-1">
                    {HERITAGE_COVER_PRESETS.map((preset) => {
                      const isSelected = sellerEditSelectedPresetId === preset.id;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => {
                            setSellerEditSelectedPresetId(preset.id);
                            setSellerEditCoverImage(preset.url);
                          }}
                          className={`cursor-pointer relative rounded-xl overflow-hidden border-2 transition-all group/preset ${isSelected
                            ? 'border-[#9a6a35] ring-2 ring-[#9a6a35]/30 shadow-md scale-[1.02]'
                            : 'border-black/10 dark:border-white/10 hover:border-[#9a6a35]/60'
                            }`}
                        >
                          <img src={preset.url} alt={preset.title} className="w-full h-16 object-cover" />
                          <div className="p-1.5 bg-white space-y-0.5">
                            <p className="text-[10px] font-bold text-[#211d18] dark:text-[#f5f0e7] truncate">{preset.title}</p>

                          </div>
                          {isSelected && (
                            <div className="absolute top-1 left-1 bg-[#9a6a35] text-white p-0.5 rounded-full shadow-xs">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="pt-2">
                  <AdminMediaUploader
                    entityType="seller"
                    entitySlug={selectedSellerForEditProfile?.id}
                    entityTitle={sellerEditBrandName}
                    governorateName={sellerEditGovernorate}
                    value={sellerEditCoverImage}
                    onChange={(val) => setSellerEditCoverImage(val)}
                    label="صورة غلاف الورشة أو المتجر"
                    helperText="ارفع صورة بانورامية عالية الجودة لورشة العمل أو الحرفيين"
                  />
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">اسم الورشة أو البراند:</label>
                  <input
                    type="text"
                    required
                    value={sellerEditBrandName}
                    onChange={(e) => setSellerEditBrandName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">اسم الأسطى أو الصانع المسؤول:</label>
                  <input
                    type="text"
                    required
                    value={sellerEditName}
                    onChange={(e) => setSellerEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">المحافظة:</label>
                  <select
                    value={sellerEditGovernorate}
                    onChange={(e) => setSellerEditGovernorate(e.target.value as Governorate)}
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  >
                    {['قنا', 'الأقصر', 'أسوان', 'سوهاج', 'أسيوط', 'المنيا', 'بني سويف', 'الوادي الجديد', 'البحر الأحمر', 'الفيوم'].map((gov) => (
                      <option key={gov} value={gov}>
                        محافظة {gov}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">الصنعة التراثية والتخصص:</label>
                  <input
                    type="text"
                    value={sellerEditSpecialty}
                    onChange={(e) => setSellerEditSpecialty(e.target.value)}
                    placeholder="مثال: فخار وخزف طمي نيل، تلي أسيوطي..."
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">رقم الموبايل:</label>
                  <input
                    type="text"
                    value={sellerEditPhone}
                    onChange={(e) => setSellerEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">الإيميل:</label>
                  <input
                    type="email"
                    value={sellerEditEmail}
                    onChange={(e) => setSellerEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">حالة الورشة في المنصة:</label>
                  <select
                    value={sellerEditStatus}
                    onChange={(e) => setSellerEditStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] font-bold"
                  >
                    <option value="approved">معتمد ومفعل</option>
                    <option value="pending">تحت المراجعة</option>
                    <option value="suspended">متوقف مؤقتاً</option>
                    <option value="rejected">مرفوض</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">رابط الصورة الشخصية (Avatar):</label>
                  <input
                    type="url"
                    value={sellerEditAvatar}
                    onChange={(e) => setSellerEditAvatar(e.target.value)}
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Story & Bio */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">حكاية الورشة ونبذة عن الصنعة:</label>
                <textarea
                  rows={3}
                  value={sellerEditBio}
                  onChange={(e) => setSellerEditBio(e.target.value)}
                  placeholder="اكتب نبذة عن تاريخ الورشة والتقنيات التراثية المستخدمة..."
                  className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] resize-none"
                />
              </div>

              {/* Payout Details */}
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 space-y-2">
                <span className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] block">بيانات تحويل المستحقات والأرباح:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-black/60 dark:text-white/60 block mb-1">طريقة التحويل:</label>
                    <select
                      value={sellerEditPayoutMethod}
                      onChange={(e) => setSellerEditPayoutMethod(e.target.value as 'instapay' | 'vodafone_cash' | 'bank_transfer')}
                      className="w-full px-3 py-1.5 bg-white border border-black/10 dark:border-white/10 rounded-lg text-xs outline-none focus:border-[#9a6a35]"
                    >
                      <option value="instapay">انستاباي (InstaPay)</option>
                      <option value="vodafone_cash">فودافون كاش ومحافظ إلكترونية</option>
                      <option value="bank_transfer">تحويل بنكي (IBAN)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-black/60 dark:text-white/60 block mb-1">رقم المحفظة أو الحساب:</label>
                    <input
                      type="text"
                      value={sellerEditPayoutAccount}
                      onChange={(e) => setSellerEditPayoutAccount(e.target.value)}
                      placeholder="اسم المستخدم أو رقم المحفظة أو الآيبان"
                      className="w-full px-3 py-1.5 bg-white border border-black/10 dark:border-white/10 rounded-lg text-xs outline-none focus:border-[#9a6a35] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Verified Badge Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="admin-seller-verified-toggle"
                  checked={sellerEditVerified}
                  onChange={(e) => setSellerEditVerified(e.target.checked)}
                  className="w-4 h-4 rounded text-[#9a6a35] dark:text-[#d5a56d] focus:ring-[#9a6a35]"
                />
                <label htmlFor="admin-seller-verified-toggle" className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] cursor-pointer flex items-center gap-1">
                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  <span>ورشة موثقة ومعتمدة رسمياً في منصة وه</span>
                </label>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedSellerForEditProfile(null)}
                  className="px-4 py-2 text-xs font-bold text-black/60 dark:text-white/60 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isUpdatingSellerProfile}
                  id="confirm-admin-save-seller-btn"
                  className="px-6 py-2.5 bg-[#9a6a35] hover:bg-[#7d5427] disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isUpdatingSellerProfile ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>بنحفظ التعديلات...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>حفظ بيانات وغلاف الورشة</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Admin Product Add & Edit Modal */}
      {adminProductModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-black/10 dark:border-white/10 max-w-2xl w-full p-5 sm:p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh] my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-[#9a6a35] dark:text-[#d5a56d]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#211d18] dark:text-[#f5f0e7]">
                    {editingAdminProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج تراثي جديد'}
                  </h3>
                  <p className="text-xs text-black/60 dark:text-white/60">تحكم كامل في الأسعار والمواصفات والمخزون وحالة النشر</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdminProductModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">اسم المنتج بالعربي:</label>
                  <input
                    type="text"
                    required
                    value={prodTitle}
                    onChange={(e) => setProdTitle(e.target.value)}
                    placeholder="مثال: قلة قناوية فخار مسامي أصيل"
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">الاسم بالإنجليزي (اختياري):</label>
                  <input
                    type="text"
                    value={prodTitleEn}
                    onChange={(e) => setProdTitleEn(e.target.value)}
                    placeholder="Authentic Qena Clay Pot"
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] text-left"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">القسم والتصنيف:</label>
                  <select
                    value={prodCategoryId}
                    onChange={(e) => {
                      setProdCategoryId(e.target.value);
                      const cat = categories.find((c) => c.id === e.target.value);
                      if (cat) setProdCategoryName(cat.name);
                    }}
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">الورشة أو الصانع:</label>
                  <select
                    value={prodSellerId}
                    onChange={(e) => setProdSellerId(e.target.value)}
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  >
                    {sellers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.brandName || s.name} (محافظة {s.governorate})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">السعر الحالي (جنيه):</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">السعر قبل الخصم (لو فيه خصم):</label>
                  <input
                    type="number"
                    min="0"
                    value={prodOriginalPrice || ''}
                    onChange={(e) => setProdOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="سيبه فاضي لو مفيش خصم"
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">الكمية المتاحة في المخزن:</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={prodStockCount}
                    onChange={(e) => setProdStockCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">محافظة المنشأ:</label>
                  <select
                    value={prodOriginGovernorate}
                    onChange={(e) => setProdOriginGovernorate(e.target.value as Governorate)}
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  >
                    {['قنا', 'الأقصر', 'أسوان', 'سوهاج', 'أسيوط', 'المنيا', 'بني سويف', 'الوادي الجديد', 'البحر الأحمر'].map((gov) => (
                      <option key={gov} value={gov}>
                        محافظة {gov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <AdminMediaUploader
                entityType="product"
                entitySlug={prodTitle || 'product'}
                entityTitle={prodTitle}
                governorateName={prodOriginGovernorate}
                value={prodImageUrl}
                onChange={(val) => setProdImageUrl(val)}
                label="صورة المنتج الرئيسية"
                helperText="ارفع صورة واضحة وعالية الجودة للمنتج من جهازك أو استخدم لينك مباشر"
              />

              {/* Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">الخامات والمكونات:</label>
                  <input
                    type="text"
                    value={prodMaterial}
                    onChange={(e) => setProdMaterial(e.target.value)}
                    placeholder="مثال: طمي نيل طبيعي، صوف غنم يدوي..."
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">طريقة الصنعة والتشكيل:</label>
                  <input
                    type="text"
                    value={prodCraftsmanship}
                    onChange={(e) => setProdCraftsmanship(e.target.value)}
                    placeholder="مثال: تشكيل يدوي على الدولاب وحرق أفران حطب"
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">المقاسات والأبعاد:</label>
                  <input
                    type="text"
                    value={prodDimensions}
                    onChange={(e) => setProdDimensions(e.target.value)}
                    placeholder="مثال: 30 × 20 سم"
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">الوزن التقريبي:</label>
                  <input
                    type="text"
                    value={prodWeight}
                    onChange={(e) => setProdWeight(e.target.value)}
                    placeholder="مثال: 1.2 كجم"
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">وصف وتفاصيل المنتج:</label>
                <textarea
                  rows={3}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="اكتب وصفاً دقيقاً للمنتج وأصالته واستخداماته..."
                  className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] resize-none"
                />
              </div>

              {/* Status and Flags */}
              <div className="p-3.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">حالة الاعتماد والنشر:</label>
                  <select
                    value={prodApprovalStatus}
                    onChange={(e) => setProdApprovalStatus(e.target.value as any)}
                    className="px-3 py-1.5 bg-white border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:border-[#9a6a35]"
                  >
                    <option value="approved">معتمد ومعروض للبيع</option>
                    <option value="pending">تحت المراجعة</option>
                    <option value="rejected">مرفوض</option>
                    <option value="draft">مسودة خاصة</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-black/10 dark:border-white/10">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodIsHandmade}
                      onChange={(e) => setProdIsHandmade(e.target.checked)}
                      className="w-4 h-4 rounded text-[#9a6a35] dark:text-[#d5a56d] focus:ring-[#9a6a35]"
                    />
                    <span>صناعة يدوية 100%</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodIsHeritage}
                      onChange={(e) => setProdIsHeritage(e.target.checked)}
                      className="w-4 h-4 rounded text-[#9a6a35] dark:text-[#d5a56d] focus:ring-[#9a6a35]"
                    />
                    <span>منتج صعيدي أصيل موثق</span>
                  </label>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setAdminProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-black/60 dark:text-white/60 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isAdminSubmittingProduct}
                  id="confirm-admin-save-product-btn"
                  className="px-6 py-2.5 bg-[#9a6a35] hover:bg-[#7d5427] disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isAdminSubmittingProduct ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>بنحفظ المنتج...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingAdminProduct ? 'حفظ تعديلات المنتج' : 'إضافة ونشر المنتج'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Reel Upload Modal */}
      <ReelUploadModal
        isOpen={isAdminReelUploadOpen}
        onClose={() => setIsAdminReelUploadOpen(false)}
        onSuccess={handleAdminReelUploaded}
        sellerId={currentUser?.sellerId || 'seller-admin'}
        sellerName={currentUser?.name || 'إدارة منصة وه'}
        artisanName="أسطى الحرفة الصعيدي"
        defaultGovernorate="قنا"
        sellerProducts={adminProducts}
        currentUser={currentUser}
        allSellers={sellers}
      />

      {/* Admin Reel Edit Modal (Full Control) */}
      <ReelEditModal
        isOpen={isAdminReelEditOpen}
        onClose={() => {
          setIsAdminReelEditOpen(false);
          setAdminEditingReel(null);
        }}
        reel={adminEditingReel}
        onSuccess={handleAdminReelUpdated}
        currentUser={currentUser}
        sellerProducts={adminProducts}
        allSellers={sellers}
      />

      {/* Admin Reel Preview Modal */}
      {adminSelectedReelPreviewId && (
        <CraftReelsModal
          reels={adminReels}
          initialReelId={adminSelectedReelPreviewId}
          isOpen={isAdminReelPreviewOpen}
          onClose={() => {
            setIsAdminReelPreviewOpen(false);
            setAdminSelectedReelPreviewId(null);
          }}
        />
      )}
    </div>
  );
};
