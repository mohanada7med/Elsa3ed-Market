import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Product, Governorate, OrderStatus, ProductStatus, CraftReel } from '../../types.ts';
import { api } from '../../services/api.ts';
import { craftReelsService } from '../../services/craftReelsService.ts';
import { SellerPayouts } from './SellerPayouts.tsx';
import { NotificationsManager } from '../common/NotificationsManager.tsx';
import { RefreshDataButton } from '../common/RefreshDataButton.tsx';
import { ReelUploadModal } from '../common/ReelUploadModal.tsx';
import { ReelEditModal } from '../common/ReelEditModal.tsx';
import { CraftReelsModal } from '../public/CraftReelsModal.tsx';
import { ChatView } from '../chat/ChatView.tsx';
import {
  Store,
  Package,
  DollarSign,
  Star,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Settings,
  Bell,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  X,
  Save,
  Send,
  AlertCircle,
  FileText,
  Boxes,
  History,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Check,
  ShieldAlert,
  XCircle,
  Upload,
  Image as ImageIcon,
  Loader2,
  User,
  Camera,
  Palette,
  Eye,
  Link as LinkIcon,
  Layers,
  Info,
  Film,
  Play,
  Share2,
  Heart,
  Music,
  MessageSquare,
  PanelLeft,
  Columns2,
  StretchHorizontal,
  LayoutGrid,
  Search,
  Menu,
  ChevronLeft,
  SlidersHorizontal
} from 'lucide-react';

// ==========================================
// 1. مصفوفة صور غلاف الورشة المعتمدة
// ==========================================
interface WorkshopCoverPreset {
  id: string;
  title: string;
  craft: string;
  craftCategory: 'pottery' | 'tally' | 'weaving' | 'khous' | 'sculpture';
  url: string;
}

const STATIC_WORKSHOP_COVERS: WorkshopCoverPreset[] = [
  {
    id: 'cover-1',
    title: 'ورشة الفخار',
    craft: 'تشكيل الفخار اليدوي',
    craftCategory: 'pottery',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1789225979/38796941-1937-41aa-b0cd-3619e161219a.png',
  },
  {
    id: 'cover-2',
    title: 'ورشة التلي',
    craft: 'تطريز التلي الصعيدي',
    craftCategory: 'tally',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1789226376/6096106f-bff1-463f-b82d-2b999259e734.png',
  },
  {
    id: 'cover-3',
    title: 'أنوال الكليم اليدوي',
    craft: 'غزل ونسيج صوف طبيعي',
    craftCategory: 'weaving',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1789226417/94e7d0f5-d39a-438d-8dca-7b5f84064ac4.png',
  },
  {
    id: 'cover-4',
    title: 'ورشة الخوص وسعف النخيل',
    craft: 'جدل الخوص وسلال التمر',
    craftCategory: 'khous',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1789226500/54cc63f6-5896-43cb-b786-d9c28c38d045.png',
  },
];

export const SellerDashboard: React.FC = () => {
  const {
    activePage,
    currentUser,
    sellerProducts,
    refreshSellerProducts,
    addProduct,
    submitProductForReview,
    updateProduct,
    deleteProduct,
    orders,
    refreshOrders,
    updateOrderStatus,
    categories,
    sellers,
    refreshSellers,
    setActivePage,
    addToast,
    sellerInventory,
    refreshSellerInventory,
    updateInventoryStock,
    stockMovements,
    refreshStockMovements,
    sellerStats,
    refreshSellerStats,
    updateSellerProfile,
    chatUnreadCount,
    confirmModal
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'inventory' | 'orders' | 'messages' | 'payouts' | 'reels' | 'notifications' | 'settings'>('overview');

  // Multi-Layout Modes for Artisan Seller Dashboard
  type SellerLayoutMode = 'sidebar' | 'compact-rail' | 'full-hub' | 'bento';
  const [layoutMode, setLayoutMode] = useState<SellerLayoutMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wah_seller_layout_mode');
      if (saved === 'sidebar' || saved === 'compact-rail' || saved === 'full-hub' || saved === 'bento') {
        return saved as SellerLayoutMode;
      }
    }
    return 'sidebar';
  });

  const handleLayoutChange = (mode: SellerLayoutMode) => {
    setLayoutMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wah_seller_layout_mode', mode);
    }
  };

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [activeHubSection, setActiveHubSection] = useState<string>('all');

  const handleSelectTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsMobileNavOpen(false);
    if (typeof window !== 'undefined') {
      const pane = document.getElementById('seller-main-pane');
      if (pane) {
        pane.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Reels Management State
  const [reels, setReels] = useState<CraftReel[]>([]);
  const [isReelUploadOpen, setIsReelUploadOpen] = useState(false);
  const [sellerEditingReel, setSellerEditingReel] = useState<CraftReel | null>(null);
  const [isSellerReelEditOpen, setIsSellerReelEditOpen] = useState(false);
  const [selectedReelPreviewId, setSelectedReelPreviewId] = useState<string | null>(null);
  const [isReelPreviewOpen, setIsReelPreviewOpen] = useState(false);

  // تصنيف وتصفية صور الغلاف المعتمدة
  const [workshopCraftFilter, setWorkshopCraftFilter] = useState<'all' | 'pottery' | 'tally' | 'weaving' | 'khous' | 'sculpture'>('all');

  const filteredWorkshopImages = useMemo(() => {
    if (workshopCraftFilter === 'all') return STATIC_WORKSHOP_COVERS;
    return STATIC_WORKSHOP_COVERS.filter((img) => img.craftCategory === workshopCraftFilter);
  }, [workshopCraftFilter]);

  const effectiveSellerId = currentUser?.sellerId || currentUser?.id;

  // احتساب التقييم الحقيقي الموثق للورشة
  const ratingStats = useMemo(() => {
    if (sellerStats?.rating && typeof sellerStats.rating === 'number' && sellerStats.rating > 0) {
      return {
        average: sellerStats.rating.toFixed(1),
        count: sellerStats.reviewCount || 0
      };
    }

    const totalReviews = sellerProducts.reduce((sum, p) => sum + (p.reviewCount || 0), 0);
    const totalPoints = sellerProducts.reduce(
      (sum, p) => sum + (p.rating || 0) * (p.reviewCount || 0),
      0
    );

    return {
      average: totalReviews > 0 ? (totalPoints / totalReviews).toFixed(1) : null,
      count: totalReviews
    };
  }, [sellerStats, sellerProducts]);

  const sellerTargetIds = useMemo(() => {
    return Array.from(
      new Set([currentUser?.sellerId, currentUser?.id, effectiveSellerId].filter(Boolean))
    ) as string[];
  }, [currentUser?.sellerId, currentUser?.id, effectiveSellerId]);

  const [isLoadingReels, setIsLoadingReels] = useState(false);

  const refreshSellerReelsFromDb = async () => {
    if (!effectiveSellerId && sellerTargetIds.length === 0) {
      setReels([]);
      return;
    }
    setIsLoadingReels(true);
    try {
      const allDbReels = await craftReelsService.fetchReelsFromDb({
        sellerId: effectiveSellerId
      });
      const myReels = (allDbReels || []).filter(
        (r) => r.sellerId && sellerTargetIds.includes(r.sellerId)
      );
      setReels(myReels);
    } catch {
      const localReels = craftReelsService.getReelsBySeller(effectiveSellerId || '', currentUser?.id);
      setReels(localReels);
    } finally {
      setIsLoadingReels(false);
    }
  };

  const sellerReels = useMemo(() => {
    return reels.filter((r) => r.sellerId && sellerTargetIds.includes(r.sellerId));
  }, [reels, sellerTargetIds]);

  useEffect(() => {
    refreshSellerReelsFromDb();
  }, [effectiveSellerId]);

  const handleReelUploaded = (newReel: CraftReel) => {
    refreshSellerReelsFromDb();
    addToast('تم نشر الفيديو بنجاح', `تم حفظ مقطع "${newReel.title}" في قاعدة البيانات وربطه بورشة عملك`, 'success');
  };

  const handleSellerReelUpdated = (updatedReel: CraftReel) => {
    refreshSellerReelsFromDb();
    addToast('تم تحديث الفيديو', `تم تحديث بيانات الفيديو "${updatedReel.title}" وحفظها في قاعدة البيانات`, 'success');
  };

  const handleDeleteReel = (reelId: string, reelTitle: string) => {
    confirmModal({
      title: 'حذف فيديو من الورشة',
      message: `هل أنت متأكد من حذف مقطع "${reelTitle}" من ورشتك؟`,
      confirmText: 'نعم، حذف الفيديو',
      danger: true,
      onConfirm: async () => {
        try {
          await craftReelsService.deleteReelAsync(currentUser || { role: 'seller', sellerId: effectiveSellerId }, reelId);
          await refreshSellerReelsFromDb();
          addToast('تم حذف الفيديو', `تم حذف مقطع "${reelTitle}" بنجاح من قاعدة البيانات`, 'info');
        } catch (err: any) {
          addToast('خطأ في الحذف', err?.message || 'فشل حذف مقطع الفيديو', 'error');
        }
      }
    });
  };

  useEffect(() => {
    if (activePage === 'seller-products') setActiveTab('products');
    else if (activePage === 'seller-inventory') setActiveTab('inventory');
    else if (activePage === 'seller-orders') setActiveTab('orders');
    else if (activePage === 'seller-messages') setActiveTab('messages');
    else if (activePage === 'seller-payouts' || activePage === 'seller-analytics') setActiveTab('payouts');
    else if (activePage === 'seller-account') setActiveTab('settings');
    else if (activePage === 'seller-dashboard') setActiveTab('overview');
  }, [activePage]);

  const currentSeller = sellers.find((s) => s.id === currentUser.sellerId || s.id === currentUser.id);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields for Product
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [categoryId, setCategoryId] = useState('cat-pottery');
  const [price, setPrice] = useState(250);
  const [originalPrice, setOriginalPrice] = useState(300);
  const [stockCount, setStockCount] = useState(15);
  const [governorate, setGovernorate] = useState<Governorate>('قنا');
  const [isHandmade, setIsHandmade] = useState(true);
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('طمي نيلي معتق');
  const [craftsmanship, setCraftsmanship] = useState('تشكيل يدوي على دولاب الفخار');
  const [submissionIntent, setSubmissionIntent] = useState<'pending' | 'draft'>('pending');

  // Product Images Cloudinary State
  const [selectedImages, setSelectedImages] = useState<Array<{ file?: File; dataUri: string; name: string }>>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Stock Update Modal State
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockTargetProduct, setStockTargetProduct] = useState<Product | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [stockAdjustmentReason, setStockAdjustmentReason] = useState<string>('إنتاج دفعة جديدة بالورشة');
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Profile & Workshop Identity State
  const [brandName, setBrandName] = useState(currentSeller?.brandName || currentUser.name || 'ورشة عم سعيد الفخاري');
  const [sellerBio, setSellerBio] = useState(currentSeller?.bio || 'عائلة تتوارث صناعة الفخار القناوي والخزف اليدوي منذ أكثر من 70 عاماً في قنا.');
  const [sellerSpecialty, setSellerSpecialty] = useState(currentSeller?.specialty || 'فخار نيلي وأواني فخارية تراثية');
  const [sellerGovernorate, setSellerGovernorate] = useState<Governorate>(currentSeller?.governorate || currentUser.governorate || 'قنا');
  const [sellerCoverImage, setSellerCoverImage] = useState<string>(
    currentSeller?.coverImage || STATIC_WORKSHOP_COVERS[0].url
  );
  const [sellerAvatar, setSellerAvatar] = useState<string>(
    currentSeller?.avatar || currentUser.profileImage?.secureUrl || currentUser.avatar || 'https://res.cloudinary.com/kuana1nl/image/upload/v1788710904/user.jpg'
  );
  const [sellerPhone, setSellerPhone] = useState(currentSeller?.phone || currentUser.phone || '01012345678');
  const [sellerPayoutMethod, setSellerPayoutMethod] = useState<'vodafone_cash' | 'instapay' | 'bank_transfer'>(
    (currentSeller?.payoutMethod as any) || 'vodafone_cash'
  );
  const [sellerPayoutAccount, setSellerPayoutAccount] = useState(currentSeller?.payoutAccount || '01012345678');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Cover Image Selection & Upload State
  const [coverPickerTab, setCoverPickerTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (currentSeller) {
      if (currentSeller.brandName) setBrandName(currentSeller.brandName);
      if (currentSeller.bio) setSellerBio(currentSeller.bio);
      if (currentSeller.specialty) setSellerSpecialty(currentSeller.specialty);
      if (currentSeller.governorate) setSellerGovernorate(currentSeller.governorate);
      if (currentSeller.coverImage) setSellerCoverImage(currentSeller.coverImage);
      if (currentSeller.avatar) setSellerAvatar(currentSeller.avatar);
      if (currentSeller.phone) setSellerPhone(currentSeller.phone);
      if (currentSeller.payoutMethod) setSellerPayoutMethod(currentSeller.payoutMethod as any);
      if (currentSeller.payoutAccount) setSellerPayoutAccount(currentSeller.payoutAccount);
    }
  }, [currentSeller]);

  // Payout request modal state
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'vodafone_cash' | 'instapay'>('vodafone_cash');
  const [payoutNumber, setPayoutNumber] = useState('01012345678');
  const [payoutAmount, setPayoutAmount] = useState(1500);

  // Seller review status state
  const [sellerStatus, setSellerStatus] = useState<string>(currentUser.sellerStatus || 'pending');
  const [statusDetails, setStatusDetails] = useState<any>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const fetchSellerReviewStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const data = await api.getSellerStatus({
        id: currentUser.id,
        role: 'seller',
        sellerId: currentUser.sellerId || currentUser.id
      });
      if (data) {
        setSellerStatus(data.status);
        setStatusDetails(data);
        if (data.status === 'approved') {
          currentUser.sellerStatus = 'approved';
        }
      }
    } catch (e) {
      console.warn('Could not fetch seller status:', e);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (currentUser.role === 'seller') {
      fetchSellerReviewStatus();
    }
  }, [currentUser.id, currentUser.role]);

  useEffect(() => {
    if (sellerStatus === 'approved') {
      refreshSellerInventory();
      refreshStockMovements();
      refreshSellerStats();
    }
  }, [sellerStatus, refreshSellerInventory, refreshStockMovements, refreshSellerStats]);

  // Lock background scrolling whenever ANY modal or drawer is open
  const isAnyModalOpen = Boolean(
    isProductModalOpen ||
    isStockModalOpen ||
    isPayoutModalOpen ||
    isMobileNavOpen ||
    isReelUploadOpen ||
    isSellerReelEditOpen ||
    isReelPreviewOpen
  );

  useEffect(() => {
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [isAnyModalOpen]);

  const openAddProductModal = () => {
    setEditingProduct(null);
    setTitle('');
    setTitleEn('');
    setCategoryId(categories[0]?.id || 'cat-pottery');
    setPrice(250);
    setOriginalPrice(300);
    setStockCount(15);
    setGovernorate(currentUser.governorate || 'قنا');
    setIsHandmade(true);
    setDescription('');
    setMaterial('طمي نيلي معتق');
    setCraftsmanship('تشكيل يدوي على دولاب الفخار');
    setSelectedImages([]);
    setExistingImages([]);
    setUploadError(null);
    setSubmissionIntent('pending');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setTitle(prod.title);
    setTitleEn(prod.titleEn || '');
    setCategoryId(prod.categoryId);
    setPrice(prod.price);
    setOriginalPrice(prod.originalPrice || prod.price);
    setStockCount(prod.stockCount);
    setGovernorate(prod.specifications?.originGovernorate || currentUser.governorate || 'قنا');
    setIsHandmade(prod.isHandmade ?? true);
    setDescription(prod.description || '');
    setMaterial(prod.specifications?.material || 'طمي نيلي معتق');
    setCraftsmanship(prod.specifications?.craftsmanship || 'صناعة يدوية أصيلة');
    setSelectedImages([]);
    setExistingImages(prod.images || []);
    setUploadError(null);
    setIsProductModalOpen(true);
  };

  const [isDragOverDropzone, setIsDragOverDropzone] = useState(false);

  const processImageFiles = (files: FileList | File[]) => {
    setUploadError(null);
    if (!files || files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeBytes = 5 * 1024 * 1024;

    const currentTotal = selectedImages.length + existingImages.length;
    if (currentTotal + files.length > 5) {
      const err = `الحد الأقصى لعدد صور المنتج هو 5 صور (المتبقي لك: ${Math.max(0, 5 - currentTotal)} صور)`;
      setUploadError(err);
      addToast('تنبيه الحد الأقصى', err, 'warning');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedTypes.includes(file.type)) {
        const err = `الملف "${file.name}" غير مدعوم. الصيغ المدعومة هي JPG، PNG، WebP`;
        setUploadError(err);
        addToast('صيغة غير مدعومة', err, 'error');
        return;
      }
      if (file.size > maxSizeBytes) {
        const err = `حجم الصورة "${file.name}" يتجاوز الحد الأقصى المسموح (5 ميجابايت)`;
        setUploadError(err);
        addToast('حجم كبير', err, 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUri = event.target?.result as string;
        setSelectedImages((prev) => {
          if (prev.length + existingImages.length >= 5) return prev;
          return [...prev, { file, dataUri, name: file.name }];
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processImageFiles(e.target.files);
    }
    e.target.value = '';
  };

  const handleDropzoneDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverDropzone(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFiles(e.dataTransfer.files);
    }
  };

  const handleDropzoneDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverDropzone(true);
  };

  const handleDropzoneDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverDropzone(false);
  };

  const handleRemoveSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const openStockModal = (prod: Product) => {
    setStockTargetProduct(prod);
    setNewStockValue(prod.stockCount);
    setStockAdjustmentReason('إنتاج دفعة جديدة بالورشة');
    setIsStockModalOpen(true);
  };

  const handleStockUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockTargetProduct) return;
    setIsUpdatingStock(true);
    try {
      await updateInventoryStock(stockTargetProduct.id, Number(newStockValue), stockAdjustmentReason);
      setIsStockModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!title.trim()) {
      addToast('خطأ في البيانات', 'يرجى إدخال اسم المنتج', 'error');
      return;
    }
    if (price <= 0) {
      addToast('خطأ في البيانات', 'السعر يجب أن يكون أكبر من 0', 'error');
      return;
    }

    if (selectedImages.length === 0 && existingImages.length === 0) {
      const errMsg = 'يرجى رفع أو اختيار صورة واحدة على الأقل للمنتج (إلزامية للحفظ)';
      setUploadError(errMsg);
      addToast('صورة المنتج مطلوبة', errMsg, 'error');
      return;
    }

    const cat = categories.find((c) => c.id === categoryId);
    setIsSubmitting(true);
    setIsUploadingImages(true);

    try {
      let newlyUploadedUrls: string[] = [];

      if (selectedImages.length > 0) {
        const dataUris = selectedImages.map((img) => img.dataUri);
        const uploadRes = await api.uploadProductImages(
          { id: currentUser.id, role: 'seller', sellerId: currentUser.sellerId || currentUser.id },
          dataUris,
          editingProduct?.id
        );
        newlyUploadedUrls = uploadRes.urls;
      }

      const finalImages = [...existingImages, ...newlyUploadedUrls];

      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          title,
          titleEn,
          categoryId,
          categoryName: cat?.name || 'فخار وخزف',
          price: Number(price),
          originalPrice: Number(originalPrice),
          stockCount: Number(stockCount),
          inStock: Number(stockCount) > 0,
          isHandmade,
          description,
          images: finalImages,
          specifications: {
            ...(editingProduct.specifications || {}),
            material,
            originGovernorate: governorate,
            craftsmanship
          }
        });
      } else {
        await addProduct(
          {
            title,
            titleEn,
            categoryId,
            categoryName: cat?.name || 'فخار وخزف',
            price: Number(price),
            originalPrice: Number(originalPrice),
            stockCount: Number(stockCount),
            inStock: Number(stockCount) > 0,
            isHandmade,
            isHeritage: true,
            isFeatured: true,
            sellerGovernorate: governorate,
            images: finalImages,
            description,
            specifications: {
              material,
              originGovernorate: governorate,
              craftsmanship,
              dimensions: 'حجم تقليدي أصيل',
              weight: '1.2 كجم',
              estimatedMakingTime: '3 أيام عمل'
            },
            tags: ['صعيد', governorate, 'يدوي']
          },
          submissionIntent
        );
      }
      setIsProductModalOpen(false);
      addToast('نجاح العملية', 'تم إرسال القطعة ومزامنة الصور مع Cloudinary بنجاح', 'success');
    } catch (err: any) {
      console.error(err);
      setUploadError(err?.message || 'فشل في رفع الصور أو حفظ المنتج');
      addToast('خطأ', err?.message || 'تعذر حفظ المنتج', 'error');
    } finally {
      setIsSubmitting(false);
      setIsUploadingImages(false);
    }
  };

  const handleSubmitForReview = async (productId: string) => {
    try {
      await submitProductForReview(productId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCoverImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setCoverUploadError('يرجى اختيار صورة بصيغة JPG أو PNG أو WebP');
      addToast('صيغة غير مدعومة', 'يرجى اختيار صورة بصيغة JPG أو PNG أو WebP', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCoverUploadError('حجم الصورة يجب ألا يتجاوز 5 ميجابايت');
      addToast('حجم كبير', 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت', 'error');
      return;
    }

    setCoverUploadError(null);
    setIsUploadingCover(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUri = reader.result as string;
        try {
          const uploadRes = await api.uploadSellerCoverImage(
            { id: currentUser.id, role: 'seller', sellerId: currentUser.sellerId || currentUser.id },
            dataUri,
            file.name
          );
          if (uploadRes?.url) {
            setSellerCoverImage(uploadRes.url);
            addToast('تم رفع الغلاف بنجاح', 'تم تحديث صورة غلاف الورشة في المعاينة', 'success');
          }
        } catch (err: any) {
          console.warn('Cover upload to server failed, applying direct preview:', err);
          setSellerCoverImage(dataUri);
          addToast('تم اختيار الغلاف', 'تم تعيين صورة الغلاف بنجاح', 'success');
        } finally {
          setIsUploadingCover(false);
        }
      };
      reader.onerror = () => {
        setCoverUploadError('تعذر قراءة ملف الصورة');
        setIsUploadingCover(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setCoverUploadError(err?.message || 'فشل في قراءة ملف الصورة');
      setIsUploadingCover(false);
    }
  };

  const handleApplyCoverUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCoverUrl.trim()) return;
    if (!customCoverUrl.startsWith('http://') && !customCoverUrl.startsWith('https://') && !customCoverUrl.startsWith('data:')) {
      setCoverUploadError('يرجى إدخال رابط يبدأ بـ https://');
      return;
    }
    setSellerCoverImage(customCoverUrl.trim());
    setCoverUploadError(null);
    addToast('تم تعيين الغلاف', 'تم تطبيق رابط صورة الغلاف بنجاح', 'success');
  };

  const handleSelectPresetCover = (url: string, title: string) => {
    setSellerCoverImage(url);
    setCoverUploadError(null);
    addToast('تم اختيار الغلاف', `تم اختيار: ${title}`, 'success');
  };

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUri = reader.result as string;
        try {
          const uploadRes = await api.uploadProfileImage(
            { id: currentUser.id, role: 'seller' },
            dataUri,
            file.name
          );
          if (uploadRes?.url) {
            setSellerAvatar(uploadRes.url);
            addToast('تم تحديث الشعار', 'تم رفع شعار الورشة بنجاح', 'success');
          }
        } catch (err) {
          setSellerAvatar(dataUri);
          addToast('تم تعيين الشعار', 'تم تحديث الشعار في المعاينة', 'success');
        } finally {
          setIsUploadingAvatar(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveWorkshopProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateSellerProfile({
        brandName,
        bio: sellerBio,
        specialty: sellerSpecialty,
        governorate: sellerGovernorate,
        coverImage: sellerCoverImage,
        avatar: sellerAvatar,
        phone: sellerPhone,
        payoutMethod: sellerPayoutMethod,
        payoutAccount: sellerPayoutAccount
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPayoutModalOpen(false);
    addToast(
      'تم طلب السحب بنجاح',
      `سيتم تحويل مبلغ ${payoutAmount} ج.م عبر ${payoutMethod === 'vodafone_cash' ? 'فودافون كاش' : 'InstaPay'} خلال 24 ساعة`,
      'success'
    );
  };

  const activeOrders = orders.filter((o) => o.status !== 'cancelled');
  const totalRevenue =
    typeof sellerStats?.totalSales === 'number'
      ? sellerStats.totalSales
      : typeof sellerStats?.financials?.totalRevenue === 'number'
        ? sellerStats.financials.totalRevenue
        : activeOrders.reduce((sum, o) => sum + o.total, 0);

  const totalOrdersCount =
    typeof sellerStats?.ordersCount === 'number'
      ? sellerStats.ordersCount
      : typeof sellerStats?.financials?.totalOrders === 'number'
        ? sellerStats.financials.totalOrders
        : activeOrders.length;

  const lowStockCount = sellerProducts.filter((p) => p.stockCount > 0 && p.stockCount <= 5).length;
  const outOfStockCount = sellerProducts.filter((p) => p.stockCount === 0).length;
  const totalValuation = sellerProducts.reduce((sum, p) => sum + p.price * p.stockCount, 0);
  const pendingOrdersCount = activeOrders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
  const pendingProductsCount = sellerProducts.filter((p) => p.approvalStatus === 'pending').length;

  interface SellerNavItem {
    id: 'overview' | 'products' | 'inventory' | 'orders' | 'messages' | 'payouts' | 'reels' | 'notifications' | 'settings';
    label: string;
    sublabel?: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    elementId: string;
  }

  interface SellerNavSection {
    id: string;
    title: string;
    description: string;
    items: SellerNavItem[];
  }

  const navSections: SellerNavSection[] = [
    {
      id: 'core',
      title: 'الرئيسية والمالية',
      description: 'أداء الورشة، المبيعات وسحب الأرباح',
      items: [
        {
          id: 'overview',
          label: 'نظرة عامة وإحصائيات',
          sublabel: 'المؤشرات والرسوم البيانية',
          icon: TrendingUp,
          elementId: 'seller-nav-overview-btn'
        },
        {
          id: 'payouts',
          label: 'طلب صرف المستحقات',
          sublabel: `المبيعات ${totalRevenue.toLocaleString('ar-EG')} ج.م`,
          icon: CreditCard,
          elementId: 'seller-nav-payouts-btn'
        }
      ]
    },
    {
      id: 'products_inventory',
      title: 'القطع الحرفية والمخزون',
      description: 'معروضات الصنعة، الجرد وتنبيهات النواقص',
      items: [
        {
          id: 'products',
          label: 'إدارة المنتجات والاعتماد',
          sublabel: `${sellerProducts.length} قطعة مسجلة`,
          icon: Package,
          badge: pendingProductsCount > 0 ? `${pendingProductsCount} قيد الاعتماد` : sellerProducts.length,
          elementId: 'seller-nav-products-btn'
        },
        {
          id: 'inventory',
          label: 'المخزون وحركات الجرد',
          sublabel: `${sellerProducts.reduce((acc, p) => acc + p.stockCount, 0)} قطعة بالمخزن`,
          icon: Boxes,
          badge: lowStockCount > 0 ? `${lowStockCount} نواقص` : undefined,
          elementId: 'seller-nav-inventory-btn'
        }
      ]
    },
    {
      id: 'logistics_customers',
      title: 'الطلبات والزبائن',
      description: 'الشحن والتوصيل والمحادثات المباشرة',
      items: [
        {
          id: 'orders',
          label: 'تنفيذ وتجهيز الطلبات',
          sublabel: `${totalOrdersCount} طلب إجمالي`,
          icon: Truck,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
          elementId: 'seller-nav-orders-btn'
        },
        {
          id: 'messages',
          label: 'محادثات الزبائن المباشرة',
          sublabel: 'تواصل فوري مع المشترين',
          icon: MessageSquare,
          badge: chatUnreadCount > 0 ? chatUnreadCount : undefined,
          elementId: 'seller-nav-messages-btn'
        }
      ]
    },
    {
      id: 'media_identity',
      title: 'الهوية وإعلام الورشة',
      description: 'ريلز الحرفة، التنبيهات والغلاف',
      items: [
        {
          id: 'reels',
          label: 'فيديوهات الصنعة (Reels)',
          sublabel: `${sellerReels.length} مقطع منشور`,
          icon: Film,
          badge: sellerReels.length > 0 ? sellerReels.length : undefined,
          elementId: 'seller-nav-reels-btn'
        },
        {
          id: 'notifications',
          label: 'مركز التنبيهات والإشعارات',
          sublabel: 'إشعارات الإدارة والطلبات',
          icon: Bell,
          elementId: 'seller-nav-notifications-btn'
        },
        {
          id: 'settings',
          label: 'بيانات الورشة والغلاف',
          sublabel: 'الشعار والوصف والمحافظة',
          icon: Settings,
          elementId: 'seller-nav-settings-btn'
        }
      ]
    }
  ];

  const allNavItems: SellerNavItem[] = navSections.flatMap((s) => s.items);
  const currentActiveItem: SellerNavItem | undefined = allNavItems.find((i) => i.id === activeTab);

  const filteredSections: SellerNavSection[] = navSections.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (!navSearchQuery.trim()) return true;
      const q = navSearchQuery.toLowerCase();
      return (
        item.label.toLowerCase().includes(q) ||
        (item.sublabel && item.sublabel.toLowerCase().includes(q))
      );
    })
  })).filter((section) => section.items.length > 0);

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>معتمد ومنشور</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>قيد المراجعة</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-900 border border-rose-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>مرفوض من الإدارة</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 border border-gray-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <FileText className="w-3.5 h-3.5 text-gray-500" />
            <span>مسودة</span>
          </span>
        );
    }
  };

  if (sellerStatus !== 'approved') {
    return (
      <div
        dir="rtl"
        className="min-h-screen overflow-x-hidden bg-[#eee8dc] text-[#211d18] transition-colors duration-500 dark:bg-[#0b0b0a] dark:text-[#f5f0e7] max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-12"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {sellerStatus === 'pending' && (
            <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
              <div className="rounded-t-[2rem] bg-[#211d18] text-white dark:bg-white dark:text-black p-8 text-center sm:text-right relative overflow-hidden border-b border-black/10 dark:border-white/10">
                <div className="absolute top-0 left-0 w-48 h-48 bg-[#9a6a35]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#9a6a35]/15 border border-[#9a6a35]/30 flex items-center justify-center text-[#9a6a35] shrink-0 shadow-inner">
                    <Clock className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9a6a35]/15 text-[#9a6a35] text-xs font-bold mb-2 border border-[#9a6a35]/30">
                      <span className="w-2 h-2 rounded-full bg-[#9a6a35] animate-ping" />
                      <span>طلب قيد المراجعة والاعتماد</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black font-serif">
                      أهلاً بك يا أسطى {statusDetails?.name || currentUser.name}!
                    </h1>
                    <p className="text-xs sm:text-sm text-white/70 dark:text-black/70 mt-1 leading-relaxed">
                      تم استلام طلب تسجيل ورشتكم في منصة وه بنجاح، وطلبكم قيد الفحص والتوثيق من قِبل إدارة المنصة.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/10 dark:border-white/10">
                <h2 className="text-xs font-bold text-black/60 dark:text-white/60 uppercase tracking-wider mb-4">
                  مراحل اعتماد وتوثيق الورشة
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">1. تسجيل الحساب والبيانات</h3>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">تم إنشاء الحساب في قاعدة البيانات</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 bg-[#9a6a35]/10 border-2 border-[#9a6a35] rounded-2xl shadow-xs">
                    <div className="w-7 h-7 rounded-full bg-[#9a6a35] text-white flex items-center justify-center shrink-0 text-xs font-bold animate-spin">
                      ⏳
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#9a6a35]">2. فحص الهوية والحرفة الصعيدية</h3>
                      <p className="text-[11px] text-black/60 dark:text-white/60 mt-0.5">جاري التحقق من الأصالة والتراث</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-2xl opacity-60">
                    <div className="w-7 h-7 rounded-full bg-black/10 dark:bg-white/10 text-black/60 dark:text-white/60 flex items-center justify-center shrink-0 text-xs font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="text-xs font-bold">3. تفعيل لوحة التحكم ونشر المنتجات</h3>
                      <p className="text-[11px] text-black/50 dark:text-white/50 mt-0.5">سيتاح فور موافقة الإدارة</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-2xl p-5">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#9a6a35]" />
                    <span>بيانات الورشة المسجلة لدينا:</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-black/60 dark:text-white/60">اسم الورشة:</span>
                      <span className="font-bold">{statusDetails?.brandName || currentUser.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-black/60 dark:text-white/60">المحافظة:</span>
                      <span className="font-bold">{statusDetails?.governorate || currentUser.governorate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-black/60 dark:text-white/60">الحرفة / التخصص:</span>
                      <span className="font-bold">{statusDetails?.specialty || 'مشغولات وحرف تراثية'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-black/60 dark:text-white/60">رقم الهاتف:</span>
                      <span className="font-bold font-mono">{statusDetails?.phone || currentUser.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#9a6a35]/10 border border-[#9a6a35]/25 rounded-2xl flex items-start gap-3 text-xs text-black/70 dark:text-white/70 leading-relaxed">
                  <AlertCircle className="w-5 h-5 text-[#9a6a35] shrink-0 mt-0.5" />
                  <p>
                    حفاظاً على معايير الجودة والأصالة الصعيدية في منصتنا، تتطلب ميزات إدارة المنتجات وإضافة القطع الحرفية واستقبال الطلبات موافقة مسبقة من إدارة المنصة. سنقوم بإشعاركم فور الانتهاء من التدقيق.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-black/10 dark:border-white/10">
                  <button
                    type="button"
                    id="refresh-seller-status-btn"
                    onClick={fetchSellerReviewStatus}
                    disabled={isCheckingStatus}
                    className="w-full sm:w-auto px-6 py-3 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                    <span>{isCheckingStatus ? 'جاري التحقق...' : 'تحديث حالة الطلب الآن'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePage('home')}
                    className="text-xs text-black/60 dark:text-white/60 hover:text-[#9a6a35] font-bold transition-colors cursor-pointer"
                  >
                    العودة للصفحة الرئيسية
                  </button>
                </div>
              </div>
            </div>
          )}

          {sellerStatus === 'rejected' && (
            <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
              <div className="bg-gradient-to-r from-rose-600 to-rose-700 p-8 text-white flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
                  <XCircle className="w-8 h-8 text-rose-200" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/40 text-rose-100 text-xs font-bold mb-2 border border-rose-400/30">
                    <span>طلب غير معتمد</span>
                  </div>
                  <h1 className="text-2xl font-black font-serif">
                    نعتذر، لم يتم قبول طلب اعتماد ورشتكم في الوقت الحالي
                  </h1>
                  <p className="text-xs text-rose-100 mt-1">
                    تم مراجعة الطلب من قِبل إدارة المنصة وتبيّن عدم استيفاء الشروط والمعايير المطلوبة.
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {statusDetails?.rejectionReason && (
                  <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-rose-900 dark:text-rose-200 mb-1">سبب الرفض المسجل من قِبل الإدارة:</h3>
                    <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">{statusDetails.rejectionReason}</p>
                  </div>
                )}

                <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                  إذا كنت تعتقد أن هناك خطأ أو ترغب في تعديل بيانات الحرفة وموافاتنا بنماذج أو شهادات موثقة إضافية، يسعدنا تواصلكم المباشر مع فريق الدعم الفني لورش الصعيد.
                </p>

                <div className="flex items-center gap-4 pt-4 border-t border-black/10 dark:border-white/10">
                  <button
                    type="button"
                    onClick={fetchSellerReviewStatus}
                    className="px-6 py-3 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>إعادة التحقق من الحالة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePage('home')}
                    className="text-xs text-black/60 dark:text-white/60 hover:text-[#9a6a35] font-bold cursor-pointer"
                  >
                    العودة للرئيسية
                  </button>
                </div>
              </div>
            </div>
          )}

          {sellerStatus === 'suspended' && (
            <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-8 text-white flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
                  <ShieldAlert className="w-8 h-8 text-[#d5a56d]" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/40 text-orange-100 text-xs font-bold mb-2 border border-orange-400/30">
                    <span>الحساب معلق مؤقتاً</span>
                  </div>
                  <h1 className="text-2xl font-black font-serif">
                    حساب ورشتكم معلق مؤقتاً
                  </h1>
                  <p className="text-xs text-amber-100 mt-1">
                    تم إيقاف صلاحيات البيع وإدارة المنتجات مؤقتاً بقرار إداري.
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {statusDetails?.suspensionReason && (
                  <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-orange-900 dark:text-orange-200 mb-1">سبب التعليق المسجل:</h3>
                    <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">{statusDetails.suspensionReason}</p>
                  </div>
                )}

                <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                  يرجى التواصل مع إدارة منصة وه لتسوية الملاحظات المرفوعة وإعادة تفعيل نشاط المتجر.
                </p>

                <div className="flex items-center gap-4 pt-4 border-t border-black/10 dark:border-white/10">
                  <button
                    type="button"
                    onClick={fetchSellerReviewStatus}
                    className="px-6 py-3 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>إعادة التحقق من الحالة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePage('home')}
                    className="text-xs text-black/60 dark:text-white/60 hover:text-[#9a6a35] font-bold cursor-pointer"
                  >
                    العودة للرئيسية
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#eee8dc] text-[#211d18] transition-colors duration-500 dark:bg-[#0b0b0a] dark:text-[#f5f0e7] max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-8 space-y-8"
    >
      {/* Top Header with Workshop Cover Background Accent */}
      <div className="relative overflow-hidden rounded-[2rem] text-white shadow-xl border border-black/10 dark:border-white/10 backdrop-blur-xl">
        <div className="absolute inset-0 z-0">
          <img
            src={sellerCoverImage}
            alt={brandName}
            className="w-full h-full object-cover blur-[1px] brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/85" />
          <div className="absolute inset-0 bg-[#9a6a35]/15 mix-blend-color" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/30 flex items-center justify-center text-white text-2xl font-bold font-serif shadow-md shrink-0">
              {sellerAvatar || currentUser.profileImage?.secureUrl || currentUser.avatar ? (
                <img
                  src={sellerAvatar || currentUser.profileImage?.secureUrl || currentUser.avatar}
                  alt={brandName}
                  className="w-full h-full object-cover"
                />
              ) : (
                'ص'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black font-serif">لوحة تحكم البائع الحرفي</h1>
                <span className="bg-[#9a6a35] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                  ورشة معتمدة
                </span>
                <button
                  type="button"
                  id="seller-cover-settings-btn"
                  onClick={() => setActiveTab('settings')}
                  className="text-[11px] text-[#d5a56d] hover:text-white underline mr-2 flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>تعديل صورة الغلاف والشعار</span>
                </button>
              </div>
              <p className="text-xs text-white/70 mt-1 font-medium">
                {brandName} • محافظة {sellerGovernorate} ({sellerSpecialty || 'حرفي موثق'})
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div
              id="seller-layout-switcher"
              className="flex items-center bg-black/30 dark:bg-black/50 border border-white/10 rounded-xl p-1 gap-1 shadow-inner"
              title="تغيير مظهر وعرض لوحة تحكم الورشة"
            >
              <button
                type="button"
                id="seller-layout-sidebar-btn"
                onClick={() => handleLayoutChange('sidebar')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${layoutMode === 'sidebar'
                  ? 'bg-[#9a6a35] text-white shadow-xs'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                title="عرض الشريط الجانبي (Sidebar)"
              >
                <PanelLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">شريط جانبي</span>
              </button>

              <button
                type="button"
                id="seller-layout-rail-btn"
                onClick={() => handleLayoutChange('compact-rail')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${layoutMode === 'compact-rail'
                  ? 'bg-[#9a6a35] text-white shadow-xs'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                title="عرض الشريط الذكي الرفيع (Compact Iconic Rail)"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">شريط رفيع</span>
              </button>

              <button
                type="button"
                id="seller-layout-hub-btn"
                onClick={() => handleLayoutChange('full-hub')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${layoutMode === 'full-hub'
                  ? 'bg-[#9a6a35] text-white shadow-xs'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                title="عرض التبويب العريض (Full-Width Hub)"
              >
                <StretchHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تبويب عريض</span>
              </button>

              <button
                type="button"
                id="seller-layout-bento-btn"
                onClick={() => handleLayoutChange('bento')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${layoutMode === 'bento'
                  ? 'bg-[#9a6a35] text-white shadow-xs'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                title="عرض البطاقات السريعة (Bento Grid)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">بطاقات Bento</span>
              </button>
            </div>

            <button
              type="button"
              id="seller-edit-cover-quick-btn"
              onClick={() => setActiveTab('settings')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 text-[#d5a56d]" />
              <span className="hidden sm:inline">غلاف الورشة</span>
            </button>

            <button
              type="button"
              id="seller-add-product-btn"
              onClick={openAddProductModal}
              className="px-4 py-2 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة منتج جديد</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workplace Layout */}
      <div className={(layoutMode === 'sidebar' || layoutMode === 'compact-rail') ? "flex flex-col lg:flex-row gap-5 items-start" : "w-full space-y-6"}>
        {/* LAYOUT 1: SIDEBAR */}
        {layoutMode === 'sidebar' && (
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-4 space-y-4 shadow-xl sticky lg:top-4 z-20">
            <div className="flex lg:hidden items-center justify-between p-2 bg-black/5 dark:bg-white/5 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Store className="w-4 h-4 text-[#9a6a35]" />
                <span>{currentActiveItem?.label || 'لوحة الورشة'}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="px-3 py-1.5 bg-[#9a6a35] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Menu className="w-3.5 h-3.5" />
                <span>تبديل القسم</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#9a6a35] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={navSearchQuery}
                onChange={(e) => setNavSearchQuery(e.target.value)}
                placeholder="بحث في أدوات الورشة..."
                className="w-full pr-8 pl-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] text-[#211d18] dark:text-[#f5f0e7]"
              />
              {navSearchQuery && (
                <button
                  type="button"
                  onClick={() => setNavSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ×
                </button>
              )}
            </div>

            <div className="space-y-4 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
              {filteredSections.map((sec) => (
                <div key={sec.id} className="space-y-1">
                  <div className="px-2 py-1 flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#9a6a35] dark:text-[#d5a56d]">
                      {sec.title}
                    </span>
                    <span className="text-[10px] text-black/40 dark:text-white/40 font-mono">
                      {sec.items.length}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          id={item.elementId}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full p-2.5 rounded-xl flex items-center justify-between text-right text-xs font-bold transition-all cursor-pointer ${isActive
                            ? 'bg-[#9a6a35] text-white shadow-xs'
                            : 'text-[#211d18] dark:text-[#f5f0e7] hover:bg-[#9a6a35]/10 hover:text-[#9a6a35]'
                            }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#9a6a35]'}`} />
                            <div className="truncate text-right">
                              <span className="block truncate">{item.label}</span>
                              {item.sublabel && (
                                <span className={`text-[10px] block font-normal truncate ${isActive ? 'text-white/80' : 'text-black/50 dark:text-white/50'
                                  }`}>
                                  {item.sublabel}
                                </span>
                              )}
                            </div>
                          </div>

                          {item.badge !== undefined && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300'
                              }`}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={openAddProductModal}
                className="w-full py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قطعة جديدة</span>
              </button>
            </div>
          </aside>
        )}

        {/* LAYOUT 2: COMPACT RAIL */}
        {layoutMode === 'compact-rail' && (
          <aside className="hidden lg:flex flex-col items-center w-20 shrink-0 bg-white/85 dark:bg-[#151513]/90 backdrop-blur-xl rounded-3xl border border-black/10 dark:border-white/10 py-5 px-2 gap-3 shadow-xl sticky top-4 z-20">
            <div className="w-11 h-11 rounded-2xl bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d] flex items-center justify-center font-black text-base font-serif shadow-xs mb-1">
              {sellerAvatar ? (
                <img src={sellerAvatar} alt="ص" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                'ص'
              )}
            </div>

            <div className="w-8 h-[1px] bg-black/10 dark:border-white/10 my-1" />

            <div className="flex flex-col items-center gap-1.5 w-full">
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <div key={item.id} className="relative group/rail flex items-center justify-center w-full">
                    <button
                      type="button"
                      id={`rail-${item.elementId}`}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative ${isActive
                        ? 'bg-[#9a6a35] text-white shadow-md scale-105'
                        : 'text-[#211d18] dark:text-[#f5f0e7] hover:bg-[#9a6a35]/15 hover:text-[#9a6a35]'
                        }`}
                      aria-label={item.label}
                    >
                      <Icon className="w-5 h-5" />
                      {item.badge !== undefined && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#151513]" />
                      )}
                    </button>

                    <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-2 bg-[#211d18] dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold whitespace-nowrap shadow-xl opacity-0 translate-x-2 group-hover/rail:opacity-100 group-hover/rail:translate-x-0 transition-all pointer-events-none z-50 flex items-center gap-2">
                      <span>{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="bg-[#9a6a35] text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                          {item.badge}
                        </span>
                      )}
                      <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 border-solid border-l-[#211d18] dark:border-l-white border-l-4 border-y-transparent border-y-4 border-r-0" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="w-8 h-[1px] bg-black/10 dark:border-white/10 mt-auto my-1" />

            <button
              type="button"
              onClick={() => handleLayoutChange('sidebar')}
              className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-[#9a6a35]/15 text-black/60 dark:text-white/60 hover:text-[#9a6a35] flex items-center justify-center text-xs transition-colors cursor-pointer"
              title="توسيع إلى شريط جانبي كامل"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </aside>
        )}

        {/* LAYOUT 3: FULL HUB */}
        {layoutMode === 'full-hub' && (
          <div className="w-full bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-5 sm:p-6 space-y-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <StretchHorizontal className="w-5 h-5 text-[#9a6a35] dark:text-[#d5a56d]" />
                  <h3 className="font-black text-base text-[#211d18] dark:text-[#f5f0e7]">
                    مركز التحكم الموسع للورشة (Full-Width Hub)
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d]">
                    عرض عريض
                  </span>
                </div>
                <p className="text-xs text-black/60 dark:text-white/60">
                  تصفح سريع لجميع أدوات الورشة وإدارة الطلبات والقطع الحرفية
                </p>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="w-3.5 h-3.5 text-[#9a6a35] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={navSearchQuery}
                  onChange={(e) => setNavSearchQuery(e.target.value)}
                  placeholder="بحث سريع في كل أدوات الورشة..."
                  className="w-full pr-8 pl-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] text-[#211d18] dark:text-[#f5f0e7]"
                />
                {navSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setNavSearchQuery('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveHubSection('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${activeHubSection === 'all'
                  ? 'bg-[#9a6a35] text-white shadow-xs'
                  : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-[#9a6a35]/10 hover:text-[#9a6a35]'
                  }`}
              >
                جميع الأدوات ({allNavItems.length})
              </button>
              {navSections.map((sec) => {
                const isSelected = activeHubSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveHubSection(sec.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${isSelected
                      ? 'bg-[#9a6a35] text-white shadow-xs'
                      : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-[#9a6a35]/10 hover:text-[#9a6a35]'
                      }`}
                  >
                    <span>{sec.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10'}`}>
                      {sec.items.length}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {(activeHubSection === 'all'
                ? filteredSections.flatMap((s) => s.items)
                : (filteredSections.find((s) => s.id === activeHubSection)?.items || [])
              ).map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    id={`hub-${item.elementId}`}
                    onClick={() => handleSelectTab(item.id)}
                    className={`p-4 rounded-2xl border transition-all text-right flex items-start justify-between cursor-pointer group shadow-2xs ${isActive
                      ? 'bg-[#9a6a35] text-white border-[#9a6a35] shadow-md ring-2 ring-[#9a6a35]/30'
                      : 'bg-white dark:bg-[#161513] hover:bg-black/5 dark:hover:bg-white/5 border-black/10 dark:border-white/10'
                      }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${isActive ? 'bg-white/20 text-white' : 'bg-[#9a6a35]/10 text-[#9a6a35]'
                        }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate">{item.label}</div>
                        {item.sublabel && (
                          <div className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-white/80' : 'text-black/50 dark:text-white/50'}`}>
                            {item.sublabel}
                          </div>
                        )}
                      </div>
                    </div>

                    {item.badge !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-[#9a6a35]/15 text-[#9a6a35]'
                        }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* LAYOUT 4: BENTO */}
        {layoutMode === 'bento' && (
          <div className="w-full bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-5 sm:p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-[#9a6a35] dark:text-[#d5a56d]" />
                <h3 className="font-black text-base text-[#211d18] dark:text-[#f5f0e7]">
                  شبكة البطاقات الذكية للورشة (Bento Matrix)
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d]">
                  نظرة شمولية
                </span>
              </div>
              {currentActiveItem && (
                <div className="flex items-center gap-2 text-xs bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10">
                  <span className="text-black/50 dark:text-white/50">القسم المعروض بالأسفل:</span>
                  <span className="font-bold text-[#9a6a35] dark:text-[#d5a56d]">{currentActiveItem.label}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => handleSelectTab('products')}
                className={`md:col-span-2 rounded-3xl p-5 border transition-all cursor-pointer relative overflow-hidden group shadow-xs ${activeTab === 'products'
                  ? 'bg-gradient-to-br from-[#9a6a35] to-[#734c1f] text-white border-[#9a6a35] ring-2 ring-[#9a6a35]/30'
                  : 'bg-white dark:bg-[#161513] border-black/10 dark:border-white/10 hover:border-[#9a6a35]/50'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                      }`}>
                      قطع الصنعة المعروضة
                    </span>
                    <h4 className="font-black text-lg mt-1">إدارة واعتماد معروضات الورشة</h4>
                    <p className={`text-xs max-w-sm ${activeTab === 'products' ? 'text-white/80' : 'text-black/60 dark:text-white/60'}`}>
                      رفع قطع يدوية جديدة، تعديل الأسعار، ومتابعة اعتماد المنصة للتراث الصعيدي
                    </p>
                  </div>
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                    }`}>
                    <Package className="w-6 h-6" />
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 ${pendingProductsCount > 0
                    ? 'bg-amber-500 text-white animate-pulse'
                    : activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                    {pendingProductsCount > 0 ? (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{pendingProductsCount} قطعة قيد المراجعة</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>جميع المعروضات معتمدة</span>
                      </>
                    )}
                  </div>
                  <span className={`text-xs ${activeTab === 'products' ? 'text-white/70' : 'text-black/50 dark:text-white/50'}`}>
                    {sellerProducts.length} قطعة بالورشة
                  </span>
                </div>
              </div>

              <div
                onClick={() => handleSelectTab('orders')}
                className={`rounded-3xl p-5 border transition-all cursor-pointer relative overflow-hidden group shadow-xs ${activeTab === 'orders'
                  ? 'bg-[#9a6a35] text-white border-[#9a6a35] ring-2 ring-[#9a6a35]/30'
                  : 'bg-white dark:bg-[#161513] border-black/10 dark:border-white/10 hover:border-[#9a6a35]/50'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Truck className="w-5 h-5" />
                  </div>
                  {pendingOrdersCount > 0 && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                      {pendingOrdersCount} للتجهيز
                    </span>
                  )}
                </div>
                <h4 className="font-black text-sm mt-3">طلبات الزبائن والشحن</h4>
                <p className={`text-xs mt-1 ${activeTab === 'orders' ? 'text-white/80' : 'text-black/60 dark:text-white/60'}`}>
                  تأكيد الشحن وتحديث بوليصة التوصيل
                </p>
                <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
                  <span className="font-bold">{totalOrdersCount} طلب إجمالي</span>
                  <span className="text-[11px] text-[#9a6a35] dark:text-[#d5a56d] font-bold">متابعة ←</span>
                </div>
              </div>

              <div
                onClick={() => handleSelectTab('inventory')}
                className={`rounded-3xl p-5 border transition-all cursor-pointer relative overflow-hidden group shadow-xs ${activeTab === 'inventory'
                  ? 'bg-[#9a6a35] text-white border-[#9a6a35] ring-2 ring-[#9a6a35]/30'
                  : 'bg-white dark:bg-[#161513] border-black/10 dark:border-white/10 hover:border-[#9a6a35]/50'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Boxes className="w-5 h-5" />
                  </div>
                  {lowStockCount > 0 && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white">
                      {lowStockCount} أوشك
                    </span>
                  )}
                </div>
                <h4 className="font-black text-sm mt-3">المخزون والجرد</h4>
                <p className={`text-xs mt-1 ${activeTab === 'inventory' ? 'text-white/80' : 'text-black/60 dark:text-white/60'}`}>
                  حركات الدفعات وتنبيهات نفاد القطع
                </p>
                <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
                  <span className="font-bold">{sellerProducts.reduce((acc, p) => acc + p.stockCount, 0)} قطعة مخزنة</span>
                  <span className="text-[11px] text-[#9a6a35] dark:text-[#d5a56d] font-bold">جرد ←</span>
                </div>
              </div>

              <div
                onClick={() => handleSelectTab('payouts')}
                className={`rounded-3xl p-5 border transition-all cursor-pointer relative overflow-hidden group shadow-xs ${activeTab === 'payouts'
                  ? 'bg-[#9a6a35] text-white border-[#9a6a35] ring-2 ring-[#9a6a35]/30'
                  : 'bg-white dark:bg-[#161513] border-black/10 dark:border-white/10 hover:border-[#9a6a35]/50'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400">
                    InstaPay / فودافون
                  </span>
                </div>
                <h4 className="font-black text-sm mt-3">أرباح ومستحقات الورشة</h4>
                <p className="text-xs mt-1 font-mono font-bold text-base text-[#9a6a35] dark:text-[#d5a56d]">
                  {totalRevenue.toLocaleString('ar-EG')} ج.م
                </p>
                <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
                  <span className="text-black/60 dark:text-white/60">سحب الأرباح</span>
                  <span className="text-[11px] text-[#9a6a35] dark:text-[#d5a56d] font-bold">طلب صرف ←</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAIN WORKPLACE CONTENT PANE */}
        <main id="seller-main-pane" className={(layoutMode === 'sidebar' || layoutMode === 'compact-rail') ? "flex-1 min-w-0 w-full space-y-6" : "w-full space-y-6"}>
          {(layoutMode === 'sidebar' || layoutMode === 'compact-rail') && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                id="seller-primary-add-card"
                onClick={openAddProductModal}
                className="p-3.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] rounded-2xl shadow-sm transition-all text-right flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold block">إضافة منتج</span>
                  <span className="text-[10px] text-white/70 dark:text-black/70 block">رفع قطعة جديدة</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/15 dark:bg-black/10 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
              </button>

              <button
                type="button"
                id="seller-primary-prods-card"
                onClick={() => handleSelectTab('products')}
                className={`p-3.5 rounded-2xl shadow-sm transition-all text-right flex items-center justify-between border cursor-pointer ${activeTab === 'products'
                  ? 'bg-white dark:bg-[#151513] border-[#9a6a35]'
                  : 'bg-white/75 dark:bg-[#151513]/90 border-black/10 dark:border-white/10 hover:border-[#9a6a35]/40'
                  }`}
              >
                <div>
                  <span className="text-xs font-bold block">معروضاتي</span>
                  <span className="text-[10px] text-black/60 dark:text-white/60 block">{sellerProducts.length} قطعة</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[#9a6a35]/10 flex items-center justify-center text-[#9a6a35] shrink-0">
                  <Package className="w-4 h-4" />
                </div>
              </button>

              <button
                type="button"
                id="seller-primary-orders-card"
                onClick={() => handleSelectTab('orders')}
                className={`p-3.5 rounded-2xl shadow-sm transition-all text-right flex items-center justify-between border cursor-pointer ${activeTab === 'orders'
                  ? 'bg-white dark:bg-[#151513] border-[#9a6a35]'
                  : 'bg-white/75 dark:bg-[#151513]/90 border-black/10 dark:border-white/10 hover:border-[#9a6a35]/40'
                  }`}
              >
                <div>
                  <span className="text-xs font-bold block">الطلبات</span>
                  <span className="text-[10px] text-black/60 dark:text-white/60 block">{totalOrdersCount} طلب</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
              </button>

              <button
                type="button"
                id="seller-primary-account-card"
                onClick={() => handleSelectTab('settings')}
                className={`p-3.5 rounded-2xl shadow-sm transition-all text-right flex items-center justify-between border cursor-pointer ${activeTab === 'settings'
                  ? 'bg-white dark:bg-[#151513] border-[#9a6a35]'
                  : 'bg-white/75 dark:bg-[#151513]/90 border-black/10 dark:border-white/10 hover:border-[#9a6a35]/40'
                  }`}
              >
                <div>
                  <span className="text-xs font-bold block">غلاف الورشة</span>
                  <span className="text-[10px] text-black/60 dark:text-white/60 block">تعديل الهوية</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-700 dark:text-purple-400 shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/75 dark:bg-[#151513]/90 p-6 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
                <div>
                  <h2 className="font-black text-xl text-[#211d18] dark:text-[#f5f0e7] font-serif">لوحة أداء ومبيعات الورشة</h2>
                  <p className="text-xs text-black/60 dark:text-white/60 mt-1 font-medium">
                    متابعة حركة الإيرادات، حالة الطلبات، والقطع المعتمدة في ورشتكم
                  </p>
                </div>
                <RefreshDataButton
                  onRefresh={async () => {
                    await Promise.all([
                      refreshSellerStats(),
                      refreshSellerProducts(),
                      refreshOrders(),
                      refreshSellerInventory()
                    ]);
                  }}
                  label="تحديث المؤشرات"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
                  <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 mb-2 font-medium">
                    <span>إجمالي المبيعات المحققة</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">{totalRevenue.toLocaleString()} ج.م</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">
                    {activeOrders.length > 0 ? `${orders.filter((o) => o.status === 'delivered').length} طلب مكتمل التسليم` : 'مبيعات موثقة من الورشة'}
                  </span>
                </div>

                <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
                  <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 mb-2 font-medium">
                    <span>إجمالي الطلبات</span>
                    <div className="w-8 h-8 rounded-xl bg-[#9a6a35]/10 flex items-center justify-center">
                      <Truck className="w-4 h-4 text-[#9a6a35]" />
                    </div>
                  </div>
                  <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">{totalOrdersCount}</span>
                  <span className="text-[10px] text-black/60 dark:text-white/60 block mt-1">طلبات نشطة من محافظات الجمهورية</span>
                </div>

                <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
                  <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 mb-2 font-medium">
                    <span>القطع المعروضة والمخزون</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Package className="w-4 h-4 text-amber-600 dark:text-[#d6aa72]" />
                    </div>
                  </div>
                  <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">{sellerProducts.length} منتج</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">
                    {sellerProducts.filter((p) => p.approvalStatus === 'approved').length} معتمد ومنشور بالسوق
                  </span>
                </div>

                {/* كارت تقييم المشترين الموثق المحسوب حقيقياً وديناميكياً */}
                <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 mb-2 font-medium">
                      <span>تقييم المشترين الموثق</span>
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Star className={`w-4 h-4 ${ratingStats.average ? 'text-amber-500 fill-amber-500' : 'text-stone-400'}`} />
                      </div>
                    </div>

                    {ratingStats.average ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">
                            {ratingStats.average}
                          </span>
                          <span className="text-xs text-black/40 dark:text-white/40 font-bold">/ 5.0</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">
                          بناءً على {ratingStats.count.toLocaleString('ar-EG')} تقييم بمشتريات مؤكدة
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-bold text-[#211d18]/70 dark:text-[#f5f0e7]/70 block">
                          لا توجد تقييمات بعد
                        </span>
                        <span className="text-[10px] text-black/40 dark:text-white/40 block mt-1">
                          ستظهر أول التقييمات فور استلام المشترين للقطع
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {(lowStockCount > 0 || outOfStockCount > 0) && (
                <div className="p-5 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-[1.5rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-[#d6aa72] shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-[#211d18] dark:text-[#f5f0e7] block">تنبيهات المخزون الحرج:</span>
                      <span className="text-black/70 dark:text-white/70">
                        لديك {outOfStockCount} منتجات نفذ رصيدها بالكامل، و {lowStockCount} منتجات قاربت على النفاذ (أقل من 5 قطع).
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('inventory')}
                    className="px-4 py-2 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto cursor-pointer transition-colors shadow-sm"
                  >
                    تحديث الجرد والمخزون
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGER */}
          {activeTab === 'products' && (
            <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-lg backdrop-blur-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-xl text-[#211d18] dark:text-[#f5f0e7] font-serif">كتالوج قطع الورشة ومتابعة دورة الاعتماد</h3>
                  <p className="text-xs text-black/60 dark:text-white/60 mt-1 font-medium">
                    جميع المنتجات تمر بدورة اعتماد: إنشاء مسودة أو تقديم للمراجعة ← فحص الإدارة ← نشر بالسوق العام
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <RefreshDataButton
                    onRefresh={refreshSellerProducts}
                    label="تحديث المنتجات"
                  />
                  <button
                    type="button"
                    id="seller-tab-add-product"
                    onClick={openAddProductModal}
                    className="px-5 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة قطعة جديدة</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {sellerProducts.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] rounded-[1.5rem]">
                    <Package className="w-10 h-10 text-black/40 dark:text-white/40 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-bold text-[#211d18] dark:text-[#f5f0e7]">لا توجد منتجات مسجلة حتى الآن</p>
                    <p className="text-xs text-black/60 dark:text-white/60 mt-1">ابدأ بإضافة أول قطعة تراثية من ورشتك</p>
                    <button
                      type="button"
                      onClick={openAddProductModal}
                      className="mt-4 px-5 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                    >
                      إضافة منتج الآن
                    </button>
                  </div>
                ) : (
                  sellerProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${prod.approvalStatus === 'rejected'
                        ? 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/30'
                        : prod.approvalStatus === 'pending'
                          ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30'
                          : 'bg-white/60 dark:bg-white/[0.03] border-black/10 dark:border-white/10 hover:border-[#9a6a35]/40'
                        }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3.5">
                          <img
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80'}
                            alt={prod.title}
                            className="w-16 h-16 rounded-xl object-cover border border-black/10 dark:border-white/10 shrink-0 shadow-sm"
                          />
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-sm text-[#211d18] dark:text-[#f5f0e7]">{prod.title}</h4>
                              {getStatusBadge(prod.approvalStatus)}
                              <span className="text-[10px] bg-[#9a6a35]/15 text-[#9a6a35] px-2 py-0.5 rounded font-bold">
                                {prod.categoryName}
                              </span>
                            </div>
                            <p className="text-xs text-black/60 dark:text-white/60 font-medium">
                              السعر: <strong className="text-[#9a6a35] font-mono">{prod.price} ج.م</strong> • المخزون: <span className={prod.stockCount === 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : prod.stockCount <= 5 ? 'text-amber-600 dark:text-[#d6aa72] font-bold' : 'text-emerald-700 dark:text-emerald-400 font-bold'}>{prod.stockCount} قطعة</span> • الصنعة: {prod.specifications?.craftsmanship || 'يدوية'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/10 dark:border-white/10 w-full md:w-auto">
                          <button
                            type="button"
                            onClick={() => openStockModal(prod)}
                            className="px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs font-bold flex items-center gap-1.5 border border-black/10 dark:border-white/10 cursor-pointer transition-colors"
                          >
                            <Boxes className="w-3.5 h-3.5 text-[#9a6a35]" />
                            <span>تعديل المخزون ({prod.stockCount})</span>
                          </button>

                          {(prod.approvalStatus === 'draft' || prod.approvalStatus === 'rejected') && (
                            <button
                              type="button"
                              onClick={() => handleSubmitForReview(prod.id)}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>إرسال للمراجعة</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openEditProductModal(prod)}
                            className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] border border-black/10 dark:border-white/10 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              confirmModal({
                                title: 'حذف المنتج',
                                message: `هل أنت متأكد من حذف المنتج "${prod.title}" من ورشتك نهائياً؟`,
                                confirmText: 'نعم، حذف المنتج',
                                danger: true,
                                onConfirm: async () => {
                                  await deleteProduct(prod.id);
                                }
                              });
                            }}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
                  <span className="text-xs text-black/60 dark:text-white/60 block mb-1 font-medium">إجمالي القطع في الورشة</span>
                  <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">
                    {sellerProducts.reduce((acc, p) => acc + p.stockCount, 0)} قطعة
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">جاهزة للشحن المباشر</span>
                </div>

                <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
                  <span className="text-xs text-black/60 dark:text-white/60 block mb-1 font-medium">قيمة المخزون الإجمالية</span>
                  <span className="text-2xl font-black text-[#9a6a35] font-mono">
                    {totalValuation.toLocaleString()} ج.م
                  </span>
                  <span className="text-[10px] text-black/60 dark:text-white/60 block mt-1">بسعر البيع الفعلي</span>
                </div>

                <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
                  <span className="text-xs text-black/60 dark:text-white/60 block mb-1 font-medium">قطع أوشكت على النفاذ</span>
                  <span className={`text-2xl font-black font-mono ${lowStockCount > 0 ? 'text-amber-600 dark:text-[#d6aa72]' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {lowStockCount} منتجات
                  </span>
                  <span className="text-[10px] text-amber-700 dark:text-[#d6aa72] font-bold block mt-1">مخزون أقل من 5 قطع</span>
                </div>

                <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
                  <span className="text-xs text-black/60 dark:text-white/60 block mb-1 font-medium">قطع نفذت بالكامل</span>
                  <span className={`text-2xl font-black font-mono ${outOfStockCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-black/40 dark:text-white/40'}`}>
                    {outOfStockCount} منتج
                  </span>
                  <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold block mt-1">تحتاج إنتاج دفعة جديدة بالورشة</span>
                </div>
              </div>

              <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-lg backdrop-blur-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-black text-xl text-[#211d18] dark:text-[#f5f0e7] font-serif">إدارة المخزون والتوريدات اليدوية</h3>
                    <p className="text-xs text-black/60 dark:text-white/60 mt-1 font-medium">
                      سجل حركة زيادة أو إنقاص القطع فور إتمام الصنعة بالورشة أو عند حرق دفعة جديدة
                    </p>
                  </div>

                  <RefreshDataButton
                    onRefresh={async () => {
                      await Promise.all([
                        refreshSellerInventory(),
                        refreshStockMovements()
                      ]);
                    }}
                    label="مزامنة وتحديث المخزن"
                  />
                </div>

                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 font-bold">
                        <th className="pb-3 pr-2">المنتج والورشة</th>
                        <th className="pb-3">التصنيف</th>
                        <th className="pb-3">سعر القطعة</th>
                        <th className="pb-3">الرصيد الحالي</th>
                        <th className="pb-3">حالة الوفرة</th>
                        <th className="pb-3 text-left pl-2">إجراءات التعديل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10 dark:divide-white/10">
                      {sellerProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 pr-2">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80'}
                                alt={prod.title}
                                className="w-10 h-10 rounded-xl object-cover border border-black/10 dark:border-white/10 shadow-xs"
                              />
                              <div>
                                <span className="font-bold text-[#211d18] dark:text-[#f5f0e7] block">{prod.title}</span>
                                <span className="text-[10px] text-black/50 dark:text-white/50">{prod.specifications?.material || 'خامات طبيعية'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 text-black/60 dark:text-white/60 font-medium">{prod.categoryName}</td>
                          <td className="py-3.5 font-black font-mono text-[#9a6a35]">{prod.price} ج.م</td>
                          <td className="py-3.5 font-mono font-bold text-sm text-[#211d18] dark:text-[#f5f0e7]">{prod.stockCount} قطعة</td>
                          <td className="py-3.5">
                            {prod.stockCount === 0 ? (
                              <span className="inline-flex items-center gap-1 bg-rose-500/15 text-rose-800 dark:text-rose-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                                <AlertCircle className="w-3 h-3" />
                                <span>نفذ من المخزن</span>
                              </span>
                            ) : prod.stockCount <= 5 ? (
                              <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-900 dark:text-[#d5a56d] font-bold px-2 py-0.5 rounded-full text-[10px]">
                                <AlertTriangle className="w-3 h-3" />
                                <span>مخزون منخفض ({prod.stockCount})</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                                <Check className="w-3 h-3" />
                                <span>متوفر ({prod.stockCount})</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 text-left pl-2">
                            <button
                              type="button"
                              onClick={() => openStockModal(prod)}
                              className="px-4 py-2 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 ml-auto min-h-[36px] cursor-pointer transition-colors"
                            >
                              <Boxes className="w-3.5 h-3.5" />
                              <span>تعديل الرصيد</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-lg backdrop-blur-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
                <div>
                  <h3 className="font-black text-xl text-[#211d18] dark:text-[#f5f0e7] font-serif">إدارة وشحن طلبات العملاء</h3>
                  <p className="text-xs text-black/60 dark:text-white/60 mt-1 font-medium">قم بتحديث حالة الشحنة فور تجهيز الطرد بالورشة</p>
                </div>
                <RefreshDataButton
                  onRefresh={refreshOrders}
                  label="تحديث الطلبات"
                />
              </div>

              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-black/50 dark:text-white/50 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-dashed border-black/10 dark:border-white/10">
                    لا توجد طلبات جديدة موجهة لمنتجاتك حالياً.
                  </div>
                ) : (
                  orders.map((ord) => (
                    <div key={ord.id} className="p-5 bg-white/60 dark:bg-white/[0.03] rounded-2xl border border-black/10 dark:border-white/10 space-y-3 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-3">
                        <div>
                          <span className="font-mono font-bold text-xs text-[#9a6a35] block">
                            {ord.orderNumber || ord.id}
                          </span>
                          <span className="text-xs text-[#211d18] dark:text-[#f5f0e7]">
                            المشتري: <strong>{ord.shippingAddress?.fullName || (ord.shippingAddress as any)?.buyerName || ord.buyerName}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-black/60 dark:text-white/60 font-medium">تحديث الحالة:</span>
                          <select
                            value={ord.status}
                            onChange={(e) => {
                              const newSt = e.target.value as OrderStatus;
                              if (newSt === 'cancelled') {
                                confirmModal({
                                  title: 'إلغاء الطلب واسترجاع المخزون',
                                  message: `هل تريد بالتأكيد إلغاء الطلب #${ord.orderNumber || ord.id}؟ سيتم استرجاع كميات القطع إلى المخزون تلقائياً واستبعاد قيمة الطلب (${ord.total} ج.م) من إجمالي المبيعات المحققة والطلبات.`,
                                  confirmText: 'نعم، قم بالإلغاء واسترجع المخزون',
                                  cancelText: 'تراجع',
                                  danger: true,
                                  onConfirm: () => updateOrderStatus(ord.id, 'cancelled')
                                });
                              } else {
                                updateOrderStatus(ord.id, newSt);
                              }
                            }}
                            className="px-3 py-1.5 bg-white/80 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold text-[#9a6a35] outline-none cursor-pointer focus:border-[#9a6a35]"
                          >
                            <option value="pending">طلب جديد (Pending)</option>
                            <option value="confirmed">تأكيد الورشة (Confirmed)</option>
                            <option value="processing">جاري التجهيز والتغليف</option>
                            <option value="shipped">تم تسليم الشحنة لشركة التوصيل</option>
                            <option value="delivered">تم الاستلام من العميل</option>
                            <option value="cancelled">ملغي (Cancelled)</option>
                          </select>
                        </div>
                      </div>
                      {ord.status === 'cancelled' && (
                        <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-bold">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                          <span>هذا الطلب ملغي — تم استرجاع القطع للمخزون واستبعاد قيمته من إجمالي المبيعات المحققة وإجمالي الطلبات</span>
                        </div>
                      )}
                      <div className="text-xs text-[#211d18] dark:text-[#f5f0e7] flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-bold">العنوان:</span> {ord.shippingAddress?.governorate} - {ord.shippingAddress?.city}
                        </div>
                        <div className="font-bold font-mono text-[#9a6a35]">
                          إجمالي الفاتورة: {ord.total} ج.م
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PAYOUTS */}
          {activeTab === 'payouts' && (
            <SellerPayouts
              user={currentUser}
              onNavigateToAccount={() => setActiveTab('settings')}
            />
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-lg backdrop-blur-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9a6a35]/10 text-[#9a6a35] border border-[#9a6a35]/20 text-xs font-bold mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#9a6a35]" />
                      <span>واجهة عرض الورشة في قسم الورش والتعاونيات الحرفية المعتمدة</span>
                    </div>
                    <h3 className="font-black text-xl text-[#211d18] dark:text-[#f5f0e7] font-serif">
                      هوية وغلاف الورشة في منصة وه
                    </h3>
                    <p className="text-xs text-black/60 dark:text-white/60 mt-1 max-w-2xl leading-relaxed font-medium">
                      خصص صورة الغلاف وشعار ورشتكم والبيانات التعريفية. تظهر هذه الصورة في صدارة بطاقة ورشتكم بالمنصة.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                    <RefreshDataButton
                      onRefresh={refreshSellers}
                      label="تحديث بيانات الورشة"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-6">
                  {/* صندوق اختيار صورة الغلاف */}
                  <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-lg backdrop-blur-xl space-y-5">
                    <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#9a6a35]/10 text-[#9a6a35] flex items-center justify-center">
                          <Camera className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#211d18] dark:text-[#f5f0e7]">اختيار وتحديث صورة الغلاف</h4>
                          <p className="text-[11px] text-black/60 dark:text-white/60">اختر من المعرض التراثي المعتمد أو ارفع صورة خاصة</p>
                        </div>
                      </div>
                      {sellerCoverImage && (
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>تم تعيين الغلاف</span>
                        </span>
                      )}
                    </div>

                    {/* أزرار التبديل */}
                    <div className="flex items-center gap-2 p-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setCoverPickerTab('presets')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${coverPickerTab === 'presets'
                          ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
                          : 'text-black/60 dark:text-white/60 hover:text-[#211d18] dark:hover:text-[#f5f0e7]'
                          }`}
                      >
                        <Palette className="w-3.5 h-3.5" />
                        <span>معرض ورش الصنعة ({STATIC_WORKSHOP_COVERS.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCoverPickerTab('upload')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${coverPickerTab === 'upload'
                          ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
                          : 'text-black/60 dark:text-white/60 hover:text-[#211d18] dark:hover:text-[#f5f0e7]'
                          }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>رفع من جهازك</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCoverPickerTab('url')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${coverPickerTab === 'url'
                          ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
                          : 'text-black/60 dark:text-white/60 hover:text-[#211d18] dark:hover:text-[#f5f0e7]'
                          }`}
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>رابط صورة</span>
                      </button>
                    </div>

                    {/* المعرض المعتمد */}
                    {coverPickerTab === 'presets' && (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <p className="text-xs text-[#211d18] dark:text-[#f5f0e7] font-bold">
                            اختر صورة غلاف تمثل طابع ورشتكم وحرفتكم التراثية الأصيلة:
                          </p>
                        </div>

                        {/* فلاتر الحرفة */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                          <button
                            type="button"
                            onClick={() => setWorkshopCraftFilter('all')}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer ${workshopCraftFilter === 'all'
                              ? 'bg-[#9a6a35] text-white shadow-xs'
                              : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70'
                              }`}
                          >
                            كل الورش ({STATIC_WORKSHOP_COVERS.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setWorkshopCraftFilter('pottery')}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer ${workshopCraftFilter === 'pottery'
                              ? 'bg-[#9a6a35] text-white shadow-xs'
                              : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70'
                              }`}
                          >
                            الفخار والخزف
                          </button>
                          <button
                            type="button"
                            onClick={() => setWorkshopCraftFilter('tally')}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer ${workshopCraftFilter === 'tally'
                              ? 'bg-[#9a6a35] text-white shadow-xs'
                              : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70'
                              }`}
                          >
                            التلي والفضة
                          </button>
                          <button
                            type="button"
                            onClick={() => setWorkshopCraftFilter('weaving')}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer ${workshopCraftFilter === 'weaving'
                              ? 'bg-[#9a6a35] text-white shadow-xs'
                              : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70'
                              }`}
                          >
                            النول والكليم
                          </button>
                          <button
                            type="button"
                            onClick={() => setWorkshopCraftFilter('khous')}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer ${workshopCraftFilter === 'khous'
                              ? 'bg-[#9a6a35] text-white shadow-xs'
                              : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70'
                              }`}
                          >
                            الخوص والنخيل
                          </button>
                          <button
                            type="button"
                            onClick={() => setWorkshopCraftFilter('sculpture')}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer ${workshopCraftFilter === 'sculpture'
                              ? 'bg-[#9a6a35] text-white shadow-xs'
                              : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70'
                              }`}
                          >
                            الألاباستر والنحت
                          </button>
                        </div>

                        {/* شبكة الصور */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1">
                          {filteredWorkshopImages.map((preset) => {
                            const isSelected = sellerCoverImage === preset.url;
                            return (
                              <button
                                type="button"
                                key={preset.id}
                                onClick={() => handleSelectPresetCover(preset.url, preset.title)}
                                className={`group relative rounded-2xl overflow-hidden border-2 text-right transition-all cursor-pointer ${isSelected
                                  ? 'border-[#9a6a35] ring-2 ring-[#9a6a35]/30 shadow-md scale-[1.02]'
                                  : 'border-black/10 dark:border-white/10 hover:border-[#9a6a35]/60 hover:shadow-xs'
                                  }`}
                              >
                                <div className="h-28 w-full relative overflow-hidden bg-black/10 dark:bg-white/10">
                                  <img
                                    src={preset.url}
                                    alt={preset.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

                                  {isSelected && (
                                    <div className="absolute top-2 left-2 w-5 h-5 bg-[#9a6a35] text-white rounded-full flex items-center justify-center shadow-xs">
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    </div>
                                  )}

                                  <div className="absolute bottom-2 right-2 left-2 text-white space-y-0.5">
                                    <span className="text-[11px] font-bold text-white block truncate drop-shadow-xs leading-tight">
                                      {preset.title}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* رفع من الجهاز */}
                    {coverPickerTab === 'upload' && (
                      <div className="space-y-4">
                        <label
                          htmlFor="seller-cover-upload-input"
                          className="border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 border-black/10 dark:border-white/10 hover:border-[#9a6a35] bg-black/[0.02] dark:bg-white/[0.02]"
                        >
                          <input
                            id="seller-cover-upload-input"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={handleCoverImageFileSelect}
                            disabled={isUploadingCover}
                            className="hidden"
                          />
                          {isUploadingCover ? (
                            <Loader2 className="w-6 h-6 animate-spin text-[#9a6a35]" />
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-[#9a6a35]" />
                              <span className="text-sm font-bold">انقر لاختيار صورة من جهازك</span>
                            </>
                          )}
                        </label>
                      </div>
                    )}

                    {/* رابط مباشر */}
                    {coverPickerTab === 'url' && (
                      <form onSubmit={handleApplyCoverUrl} className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={customCoverUrl}
                            onChange={(e) => setCustomCoverUrl(e.target.value)}
                            placeholder="https://example.com/workshop-cover.jpg"
                            className="flex-1 p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35] dir-ltr text-left"
                          />
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                          >
                            تطبيق
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* بيانات المتجر */}
                  <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-lg backdrop-blur-xl space-y-5">
                    <form onSubmit={handleSaveWorkshopProfile} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">
                          اسم الورشة أو العلامة الحرفية *
                        </label>
                        <input
                          type="text"
                          required
                          value={brandName}
                          onChange={(e) => setBrandName(e.target.value)}
                          className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">
                            محافظة المنشأ الحرفي *
                          </label>
                          <select
                            value={sellerGovernorate}
                            onChange={(e) => setSellerGovernorate(e.target.value as Governorate)}
                            className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35] cursor-pointer"
                          >
                            <option value="قنا">قنا</option>
                            <option value="سوهاج">سوهاج</option>
                            <option value="أسوان">أسوان</option>
                            <option value="الأقصر">الأقصر</option>
                            <option value="أسيوط">أسيوط</option>
                            <option value="المنيا">المنيا</option>
                            <option value="الوادي الجديد">الوادي الجديد</option>
                            <option value="بني سويف">بني سويف</option>
                            <option value="الفيوم">الفيوم</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">
                            التخصص الحرفي
                          </label>
                          <input
                            type="text"
                            value={sellerSpecialty}
                            onChange={(e) => setSellerSpecialty(e.target.value)}
                            className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">
                          نبذة عن تاريخ الورشة
                        </label>
                        <textarea
                          rows={3}
                          value={sellerBio}
                          onChange={(e) => setSellerBio(e.target.value)}
                          className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="px-6 py-3 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                      >
                        {isSavingProfile ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>جاري الحفظ...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>حفظ التعديلات واعتماد الغلاف</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* المعاينة الحية */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="sticky top-6 space-y-4">
                    <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] p-6 text-[#211d18] dark:text-[#f5f0e7] shadow-xl border border-black/10 dark:border-white/10 backdrop-blur-xl">
                      <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-[#9a6a35]" />
                          <h4 className="font-bold text-sm">معاينة حية لبطاقة الورشة</h4>
                        </div>
                      </div>

                      <div className="bg-white/90 dark:bg-[#151513] rounded-3xl border border-black/10 dark:border-white/10 overflow-hidden shadow-lg group transition-all text-[#211d18] dark:text-[#f5f0e7]">
                        <div className="h-44 relative overflow-hidden bg-black/10 dark:bg-white/10">
                          <img
                            src={sellerCoverImage}
                            alt={brandName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute top-3 right-3 bg-white/90 dark:bg-[#151513]/90 backdrop-blur-xs text-[#211d18] dark:text-[#f5f0e7] text-[11px] font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1 border border-black/10 dark:border-white/10">
                            <MapPin className="w-3 h-3 text-[#9a6a35]" />
                            <span>محافظة {sellerGovernorate}</span>
                          </div>
                          <div className="absolute -bottom-6 right-5">
                            <div className="w-16 h-16 rounded-2xl border-3 border-white dark:border-[#151513] overflow-hidden shadow-md bg-white dark:bg-[#151513]">
                              <img
                                src={sellerAvatar}
                                alt={brandName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="p-5 pt-8 space-y-3">
                          <h4 className="font-bold text-base font-serif">{brandName}</h4>
                          <span className="inline-block text-[11px] font-bold text-[#9a6a35] bg-[#9a6a35]/10 px-2 py-0.5 rounded-md">
                            {sellerSpecialty || 'حرفة يدوية تراثية أصيلة'}
                          </span>
                          <p className="text-xs text-black/60 dark:text-white/60 line-clamp-2">
                            {sellerBio}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: REELS */}
          {activeTab === 'reels' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="relative rounded-[2rem] bg-gradient-to-r from-[#211d18] via-[#2e261f] to-[#211d18] text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl sm:text-3xl font-black font-serif">فيديوهات ورشة الصنعة القصيرة</h2>
                  <p className="text-xs sm:text-sm text-white/80 mt-1">ارفع مقاطع فيديو عمودية (9:16) تبرز كواليس الصنع والتشكيل اليدوي لورشتك فقط</p>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshDataButton
                    onRefresh={refreshSellerReelsFromDb}
                    label="تحديث الفيديوهات"
                  />
                  <button
                    type="button"
                    onClick={() => setIsReelUploadOpen(true)}
                    className="px-6 py-3.5 bg-white text-black hover:bg-[#9a6a35] hover:text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>رفع فيديو جديد</span>
                  </button>
                </div>
              </div>

              {isLoadingReels ? (
                <div className="p-12 text-center text-black/60 dark:text-white/60">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#9a6a35] mb-2" />
                  <span className="text-xs font-bold">جاري جلب فيديوهات ورشتكم...</span>
                </div>
              ) : sellerReels.length === 0 ? (
                <div className="bg-white/60 dark:bg-white/[0.02] rounded-3xl border border-dashed border-black/10 dark:border-white/10 p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-[#9a6a35]/10 text-[#9a6a35] flex items-center justify-center mx-auto">
                    <Film className="w-8 h-8" />
                  </div>
                  <h3 className="font-black text-base text-[#211d18] dark:text-[#f5f0e7]">لا توجد مقاطع فيديو منشورة لورشتك بعد</h3>
                  <p className="text-xs text-black/60 dark:text-white/60 max-w-md mx-auto">
                    لم تقم بنشر أي مقاطع فيديو لورشتك حتى الآن. يمكنك تصوير كواليس الصنعة والحرفة ورفعها لتظهر في خلاصة ريلز المنصة.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsReelUploadOpen(true)}
                    className="px-5 py-2.5 bg-[#9a6a35] hover:bg-[#83582c] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>نشر أول فيديو للورشة</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {sellerReels.map((reel) => (
                    <div key={reel.id} className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 overflow-hidden shadow-lg flex flex-col group backdrop-blur-xl">
                      <div
                        onClick={() => {
                          setSelectedReelPreviewId(reel.id);
                          setIsReelPreviewOpen(true);
                        }}
                        className="relative aspect-9/16 bg-black overflow-hidden cursor-pointer"
                      >
                        <img src={reel.posterUrl} alt={reel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/40">
                            <Play className="w-5 h-5 fill-white mr-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-3 inset-x-3 text-white text-xs font-bold truncate">
                          {reel.title}
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between gap-2 border-t border-black/5 dark:border-white/5">
                        <span className="text-[11px] text-black/60 dark:text-white/60 font-medium truncate">
                          {reel.viewsCount || 0} مشاهدة • {reel.likesCount || 0} إعجاب
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSellerEditingReel(reel);
                              setIsSellerReelEditOpen(true);
                            }}
                            className="p-2 text-[#9a6a35] hover:bg-[#9a6a35]/10 rounded-xl transition-colors cursor-pointer"
                            title="تعديل بيانات الفيديو"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReel(reel.id, reel.title)}
                            className="p-2 text-rose-600 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                            title="حذف الفيديو من ورشتك"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-2 sm:p-4 shadow-lg">
              <ChatView isSellerMode={true} />
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <NotificationsManager
              viewMode="seller"
              onNavigateTab={(tab) => {
                if (tab === 'orders') setActiveTab('orders');
                else if (tab === 'products') setActiveTab('products');
                else if (tab === 'inventory') setActiveTab('inventory');
                else if (tab === 'payouts') setActiveTab('payouts');
                else if (tab === 'settings') setActiveTab('settings');
              }}
            />
          )}
        </main>
      </div>

      {/* Stock Adjustment Modal */}
      {isStockModalOpen && stockTargetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white/95 dark:bg-[#151513]/95 rounded-[2rem] border border-black/10 dark:border-white/10 max-w-md w-full p-6 space-y-4 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <h3 className="font-black text-lg text-[#211d18] dark:text-[#f5f0e7] font-serif">تعديل رصيد المخزون</h3>
              <button
                type="button"
                onClick={() => setIsStockModalOpen(false)}
                className="p-1 rounded-lg text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleStockUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">
                  الكمية الجديدة المتاحة بالورشة (قطع) *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStockValue((prev) => Math.max(0, prev - 1))}
                    className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 text-lg font-bold border border-black/10 dark:border-white/10 cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newStockValue}
                    onChange={(e) => setNewStockValue(Number(e.target.value))}
                    className="flex-1 p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center font-bold font-mono outline-none focus:border-[#9a6a35]"
                  />
                  <button
                    type="button"
                    onClick={() => setNewStockValue((prev) => prev + 1)}
                    className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 text-lg font-bold border border-black/10 dark:border-white/10 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStock}
                  className="px-5 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl cursor-pointer"
                >
                  {isUpdatingStock ? 'جاري التحديث...' : 'حفظ الرصيد الجديد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white/95 dark:bg-[#151513]/95 rounded-[2rem] border border-black/10 dark:border-white/10 max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <h3 className="font-black text-xl text-[#211d18] dark:text-[#f5f0e7] font-serif">
                {editingProduct ? 'تعديل بيانات القطعة التراثية' : 'إضافة قطعة يدوية جديدة للورشة'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">اسم القطعة (بالعربية) *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">التصنيف التراثي *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">محافظة المنشأ الأصيلة</label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value as Governorate)}
                    className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35] cursor-pointer"
                  >
                    <option value="قنا">قنا</option>
                    <option value="سوهاج">سوهاج</option>
                    <option value="أسوان">أسوان</option>
                    <option value="الأقصر">الأقصر</option>
                    <option value="أسيوط">أسيوط</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">السعر (ج.م) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">السعر قبل الخصم</label>
                  <input
                    type="number"
                    min={0}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">المخزون المتاح</label>
                  <input
                    type="number"
                    min={0}
                    value={stockCount}
                    onChange={(e) => setStockCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>
              </div>

              {/* Product Images Dropzone */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">
                    صور المنتج التراثي * <span className="text-rose-500 font-bold">(إلزامية - صورة واحدة على الأقل)</span>
                  </label>
                  <span className={`text-[11px] font-bold ${existingImages.length + selectedImages.length === 0
                      ? 'text-rose-500'
                      : 'text-[#9a6a35] dark:text-[#d5a56d]'
                    }`}>
                    ({existingImages.length + selectedImages.length} من 5 صور كحد أقصى)
                  </span>
                </div>

                {uploadError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Dropzone Container */}
                {existingImages.length + selectedImages.length < 5 && (
                  <div
                    onDrop={handleDropzoneDrop}
                    onDragOver={handleDropzoneDragOver}
                    onDragLeave={handleDropzoneDragLeave}
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${isDragOverDropzone
                        ? 'border-[#9a6a35] bg-[#9a6a35]/10 scale-[1.01]'
                        : existingImages.length + selectedImages.length === 0
                          ? 'border-black/20 dark:border-white/20 hover:border-[#9a6a35] bg-black/[0.02] dark:bg-white/[0.02]'
                          : 'border-black/10 dark:border-white/10 hover:border-[#9a6a35] bg-black/[0.01] dark:bg-white/[0.01]'
                      }`}
                  >
                    <input
                      id="product-images-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleImageFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                      <div className="w-12 h-12 rounded-2xl bg-[#9a6a35]/10 text-[#9a6a35] flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-[#211d18] dark:text-[#f5f0e7]">
                          اسحب الصور وأفلتها هنا، أو <span className="text-[#9a6a35] underline font-black">تصفح من جهازك</span>
                        </p>
                        <p className="text-[11px] text-black/50 dark:text-white/50 mt-1">
                          صيغ مدعومة: JPG، PNG، WebP (حتى 5 ميجابايت لكل صورة، 5 صور كحد أقصى)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Thumbnails Preview Grid */}
                {(existingImages.length > 0 || selectedImages.length > 0) && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                    {/* Existing Images */}
                    {existingImages.map((url, idx) => (
                      <div
                        key={`existing-${idx}`}
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-black/15 dark:border-white/15 bg-black/5 shadow-xs"
                      >
                        <img
                          src={url}
                          alt={`صورة المنتج ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(idx)}
                            className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md cursor-pointer transition-transform hover:scale-110"
                            title="حذف الصورة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                          حالية {idx + 1}
                        </span>
                      </div>
                    ))}

                    {/* Newly Selected Images */}
                    {selectedImages.map((img, idx) => (
                      <div
                        key={`selected-${idx}`}
                        className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-[#9a6a35] bg-black/5 shadow-xs"
                      >
                        <img
                          src={img.dataUri}
                          alt={img.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveSelectedImage(idx)}
                            className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md cursor-pointer transition-transform hover:scale-110"
                            title="حذف الصورة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-[#9a6a35] text-white px-1.5 py-0.5 rounded-md">
                          جديدة {idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-3 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImages}
                  className="px-7 py-3 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-2xl shadow-md cursor-pointer"
                >
                  {isSubmitting ? 'جاري الحفظ...' : editingProduct ? 'حفظ التعديلات' : 'إرسال للمراجعة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/95 dark:bg-[#151513]/95 rounded-[2rem] border border-black/10 dark:border-white/10 max-w-md w-full p-6 space-y-4 shadow-2xl backdrop-blur-2xl">
            <h3 className="font-black text-xl text-[#211d18] dark:text-[#f5f0e7] font-serif">طلب سحب أرباح الورشة</h3>
            <form onSubmit={handlePayoutSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">المبلغ المطلوب (ج.م)</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  تأكيد التحويل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reel Upload Modal */}
      <ReelUploadModal
        isOpen={isReelUploadOpen}
        onClose={() => setIsReelUploadOpen(false)}
        onSuccess={handleReelUploaded}
        sellerId={currentUser?.sellerId || currentUser?.id}
        sellerName={brandName || currentUser?.name || 'ورشة الصعيد'}
        artisanName={currentUser?.name || 'أسطى الحرفة'}
        artisanAvatar={sellerAvatar || currentUser?.avatar}
        defaultGovernorate={sellerGovernorate || 'قنا'}
        sellerProducts={sellerProducts}
        currentUser={currentUser}
      />

      {/* Reel Edit Modal */}
      <ReelEditModal
        isOpen={isSellerReelEditOpen}
        onClose={() => {
          setIsSellerReelEditOpen(false);
          setSellerEditingReel(null);
        }}
        reel={sellerEditingReel}
        onSuccess={handleSellerReelUpdated}
        currentUser={currentUser}
        sellerProducts={sellerProducts}
      />

      {/* Reel Preview Modal */}
      {selectedReelPreviewId && (
        <CraftReelsModal
          reels={sellerReels}
          initialReelId={selectedReelPreviewId}
          isOpen={isReelPreviewOpen}
          onClose={() => {
            setIsReelPreviewOpen(false);
            setSelectedReelPreviewId(null);
          }}
        />
      )}

      {/* Mobile Navigation Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="fixed inset-0" onClick={() => setIsMobileNavOpen(false)} />
          <div className="relative mr-auto w-4/5 max-w-xs h-full bg-white/95 dark:bg-[#151513]/95 p-5 shadow-2xl flex flex-col gap-4 border-l border-black/10 dark:border-white/10 z-10 backdrop-blur-2xl overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2 font-bold text-sm text-[#211d18] dark:text-[#f5f0e7]">
                <Store className="w-4 h-4 text-[#9a6a35]" />
                <span>أقسام لوحة الورشة</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="p-1 rounded-lg text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 flex-1">
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full p-3 rounded-xl flex items-center justify-between text-right text-xs font-bold transition-all cursor-pointer ${isActive
                        ? 'bg-[#9a6a35] text-white shadow-xs'
                        : 'text-[#211d18] dark:text-[#f5f0e7] hover:bg-[#9a6a35]/10 hover:text-[#9a6a35]'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#9a6a35]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300'
                        }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};