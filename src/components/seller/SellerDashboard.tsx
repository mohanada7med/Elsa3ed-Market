import React, { useState, useEffect } from 'react';
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
  MessageSquare
} from 'lucide-react';

// Curated Heritage Craft Workshop Cover Presets
const HERITAGE_COVER_PRESETS = [
  {
    id: 'pottery-qena',
    title: 'فخار وخزف قنا والأقصر',
    region: 'قنا / الأقصر',
    craft: 'فخار نيلي وخزف يدوي أصيل',
    url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'rugs-sohag',
    title: 'سجاد وكليم صوف أخميم التراثي',
    region: 'سوهاج',
    craft: 'نول يدوي ومنسوجات صوف وحرير',
    url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'tally-asyut',
    title: 'تلي وتطريز خيوط الفضة التراثي',
    region: 'أسيوط',
    craft: 'تطريز تلي صعيدي أصيل',
    url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'brass-luxor',
    title: 'صواني ونقوش النحاس الأقصري',
    region: 'الأقصر',
    craft: 'نقش وتشكيل نحاس وزخارف عربية',
    url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'palm-aswan',
    title: 'خوص ونخيل وتمور أسوان النوبية',
    region: 'أسوان',
    craft: 'جدل خوص وسلال نخيل نوبية',
    url: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'wood-craft',
    title: 'أخشاب السرسوع والمشغولات الخشبية',
    region: 'قنا / سوهاج',
    craft: 'نجارة تقليدية وتطعيم صدف',
    url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'alabaster-luxor',
    title: 'نحت الألباستر ومحاجر القرنة',
    region: 'الأقصر',
    craft: 'نحت يدوي على الألباستر والأحجار',
    url: 'https://images.unsplash.com/photo-1599818817351-40995772654c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'honey-herbs-minya',
    title: 'عسل جبلي وأعشاب برية بالمنيا',
    region: 'المنيا',
    craft: 'مناحل طبيعية ومقطرات عشبية',
    url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80'
  }
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
    chatUnreadCount
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'inventory' | 'orders' | 'messages' | 'payouts' | 'reels' | 'notifications' | 'settings'>('overview');

  // Reels Management State (Seller Workshop Control)
  const [reels, setReels] = useState<CraftReel[]>([]);
  const [isReelUploadOpen, setIsReelUploadOpen] = useState(false);
  const [sellerEditingReel, setSellerEditingReel] = useState<CraftReel | null>(null);
  const [isSellerReelEditOpen, setIsSellerReelEditOpen] = useState(false);
  const [selectedReelPreviewId, setSelectedReelPreviewId] = useState<string | null>(null);
  const [isReelPreviewOpen, setIsReelPreviewOpen] = useState(false);

  const effectiveSellerId = currentUser?.sellerId || currentUser?.id;

  const refreshSellerReelsFromDb = async () => {
    try {
      const allDbReels = await craftReelsService.fetchReelsFromDb({
        sellerId: effectiveSellerId
      });
      // Ensure only videos belonging to this seller are shown in their dashboard
      const myReels = allDbReels.filter(
        (r) => r.sellerId === effectiveSellerId || r.sellerId === currentUser?.sellerId || r.sellerId === currentUser?.id
      );
      setReels(myReels.length > 0 ? myReels : craftReelsService.getReelsBySeller(effectiveSellerId || ''));
    } catch {
      setReels(craftReelsService.getReelsBySeller(effectiveSellerId || ''));
    }
  };

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

  const handleDeleteReel = async (reelId: string, reelTitle: string) => {
    if (window.confirm(`هل أنت متأكد من حذف مقطع "${reelTitle}" من ورشتك؟`)) {
      try {
        await craftReelsService.deleteReelAsync(currentUser || { role: 'seller', sellerId: effectiveSellerId }, reelId);
        await refreshSellerReelsFromDb();
        addToast('تم حذف الفيديو', `تم حذف مقطع "${reelTitle}" بنجاح من قاعدة البيانات`, 'info');
      } catch (err: any) {
        addToast('خطأ في الحذف', err?.message || 'فشل حذف مقطع الفيديو', 'error');
      }
    }
  };

  // Synchronize activeTab when navigation changes via URL or Header links
  useEffect(() => {
    if (activePage === 'seller-products') setActiveTab('products');
    else if (activePage === 'seller-inventory') setActiveTab('inventory');
    else if (activePage === 'seller-orders') setActiveTab('orders');
    else if (activePage === 'seller-messages') setActiveTab('messages');
    else if (activePage === 'seller-payouts' || activePage === 'seller-analytics') setActiveTab('payouts');
    else if (activePage === 'seller-account') setActiveTab('settings');
    else if (activePage === 'seller-dashboard') setActiveTab('overview');
  }, [activePage]);

  // Find current seller from store data
  const currentSeller = sellers.find((s) => s.id === currentUser.sellerId || s.id === currentUser.id);

  // Product Modal State (Add or Edit)
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
    currentSeller?.coverImage || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80'
  );
  const [sellerAvatar, setSellerAvatar] = useState<string>(
    currentSeller?.avatar || currentUser.profileImage?.secureUrl || currentUser.avatar || 'https://res.cloudinary.com/kuana1nl/image/upload/v1787924812/user.jpg'
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

  // Sync state with current seller when available
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

  // Seller review status state (defaults to currentUser.sellerStatus)
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

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    if (selectedImages.length + existingImages.length + files.length > 5) {
      setUploadError('الحد الأقصى لعدد صور المنتج هو 5 صور');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedTypes.includes(file.type)) {
        setUploadError(`الملف "${file.name}" غير مدعوم. الصيغ المدعومة هي JPG، PNG، WebP`);
        return;
      }
      if (file.size > maxSizeBytes) {
        setUploadError(`حجم الصورة "${file.name}" يتجاوز الحد الأقصى المسموح (5 ميجابايت)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUri = event.target?.result as string;
        setSelectedImages((prev) => [...prev, { file, dataUri, name: file.name }]);
      };
      reader.readAsDataURL(file);
    }
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
      setUploadError('يرجى رفع صورة واحدة على الأقل للمنتج');
      addToast('صورة مطلوبة', 'يرجى اختيار صورة واحدة على الأقل للمنتج', 'error');
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

    // Validate type and size (5MB max)
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
          // Upload to Cloudinary / storage backend
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

  const totalRevenue = sellerStats?.financials?.totalRevenue || orders.reduce((sum, o) => sum + o.total, 0);
  const lowStockCount = sellerProducts.filter((p) => p.stockCount > 0 && p.stockCount <= 5).length;
  const outOfStockCount = sellerProducts.filter((p) => p.stockCount === 0).length;
  const totalValuation = sellerProducts.reduce((sum, p) => sum + p.price * p.stockCount, 0);

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

  // If seller status is not approved, show appropriate Arabic state banner / screen
  if (sellerStatus !== 'approved') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {sellerStatus === 'pending' && (
          <div className="bg-white rounded-3xl border border-amber-200 shadow-xl overflow-hidden">
            {/* Top Amber Header Banner */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-8 text-white text-center sm:text-right relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
                  <Clock className="w-8 h-8 animate-pulse text-amber-200" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/40 text-amber-100 text-xs font-bold mb-2 border border-amber-400/30">
                    <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
                    <span>طلب قيد المراجعة والاعتماد</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black font-heritage">
                    أهلاً بك يا أسطى {statusDetails?.name || currentUser.name}!
                  </h1>
                  <p className="text-xs sm:text-sm text-amber-100 mt-1 leading-relaxed">
                    تم استلام طلب تسجيل ورشتكم في منصة وه بنجاح، وطلبكم قيد الفحص والتوثيق من قِبل إدارة المنصة.
                  </p>
                </div>
              </div>
            </div>

            {/* Workflow Progress Steps */}
            <div className="p-6 sm:p-8 bg-[#fcfaf7] border-b border-amber-100">
              <h2 className="text-xs font-bold text-[#7A6F64] uppercase tracking-wider mb-4">
                مراحل اعتماد وتوثيق الورشة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-emerald-900">1. تسجيل الحساب والبيانات</h3>
                    <p className="text-[11px] text-emerald-700 mt-0.5">تم إنشاء الحساب في قاعدة البيانات</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-amber-50 border-2 border-amber-400 rounded-xl shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-xs font-bold animate-spin">
                    ⏳
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-amber-900">2. فحص الهوية والحرفة الصعيدية</h3>
                    <p className="text-[11px] text-amber-700 mt-0.5">جاري التحقق من الأصالة والتراث</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl opacity-60">
                  <div className="w-7 h-7 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center shrink-0 text-xs font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-700">3. تفعيل لوحة التحكم ونشر المنتجات</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">سيتاح فور موافقة الإدارة</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Submitted Details Summary */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="bg-amber-50/50 border border-amber-200/70 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-[#2D2A26] mb-3 flex items-center gap-2">
                  <Store className="w-4 h-4 text-amber-700" />
                  <span>بيانات الورشة المسجلة لدينا:</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#7A6F64]">اسم الورشة:</span>
                    <span className="font-bold text-[#2D2A26]">{statusDetails?.brandName || currentUser.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#7A6F64]">المحافظة:</span>
                    <span className="font-bold text-[#2D2A26]">{statusDetails?.governorate || currentUser.governorate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#7A6F64]">الحرفة / التخصص:</span>
                    <span className="font-bold text-[#2D2A26]">{statusDetails?.specialty || 'مشغولات وحرف تراثية'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#7A6F64]">رقم الهاتف:</span>
                    <span className="font-bold text-[#2D2A26] font-mono">{statusDetails?.phone || currentUser.phone}</span>
                  </div>
                </div>
              </div>

              {/* Notice Card */}
              <div className="p-4 bg-[#fcf8f3] border border-[#e8dccb] rounded-xl flex items-start gap-3 text-xs text-[#7A6F64] leading-relaxed">
                <AlertCircle className="w-5 h-5 text-[#B45F42] shrink-0 mt-0.5" />
                <p>
                  حفاظاً على معايير الجودة والأصالة الصعيدية في منصتنا، تتطلب ميزات إدارة المنتجات وإضافة القطع الحرفية واستقبال الطلبات موافقة مسبقة من إدارة المنصة. سنقوم بإشعاركم فور الانتهاء من التدقيق.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  id="refresh-seller-status-btn"
                  onClick={fetchSellerReviewStatus}
                  disabled={isCheckingStatus}
                  className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                  <span>{isCheckingStatus ? 'جاري التحقق...' : 'تحديث حالة الطلب الآن'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePage('home')}
                  className="text-xs text-[#7A6F64] hover:text-[#B45F42] font-semibold transition-colors"
                >
                  العودة للصفحة الرئيسية
                </button>
              </div>
            </div>
          </div>
        )}

        {sellerStatus === 'rejected' && (
          <div className="bg-white rounded-3xl border border-rose-200 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-rose-600 to-rose-700 p-8 text-white flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0">
                <XCircle className="w-8 h-8 text-rose-200" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/40 text-rose-100 text-xs font-bold mb-2">
                  <span>طلب غير معتمد</span>
                </div>
                <h1 className="text-2xl font-black font-heritage">
                  نعتذر، لم يتم قبول طلب اعتماد ورشتكم في الوقت الحالي
                </h1>
                <p className="text-xs text-rose-100 mt-1">
                  تم مراجعة الطلب من قِبل إدارة المنصة وتبيّن عدم استيفاء الشروط والمعايير المطلوبة.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {statusDetails?.rejectionReason && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-rose-900 mb-1">سبب الرفض المسجل من قِبل الإدارة:</h3>
                  <p className="text-sm font-semibold text-rose-800">{statusDetails.rejectionReason}</p>
                </div>
              )}

              <p className="text-xs text-[#7A6F64] leading-relaxed">
                إذا كنت تعتقد أن هناك خطأ أو ترغب في تعديل بيانات الحرفة وموافاتنا بنماذج أو شهادات موثقة إضافية، يسعدنا تواصلكم المباشر مع فريق الدعم الفني لورش الصعيد.
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={fetchSellerReviewStatus}
                  className="px-6 py-2.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>إعادة التحقق من الحالة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('home')}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  العودة للرئيسية
                </button>
              </div>
            </div>
          </div>
        )}

        {sellerStatus === 'suspended' && (
          <div className="bg-white rounded-3xl border border-orange-200 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-8 text-white flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0">
                <ShieldAlert className="w-8 h-8 text-amber-200" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/40 text-orange-100 text-xs font-bold mb-2">
                  <span>الحساب معلق مؤقتاً</span>
                </div>
                <h1 className="text-2xl font-black font-heritage">
                  حساب ورشتكم معلق مؤقتاً
                </h1>
                <p className="text-xs text-amber-100 mt-1">
                  تم إيقاف صلاحيات البيع وإدارة المنتجات مؤقتاً بقرار إداري.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {statusDetails?.suspensionReason && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-orange-900 mb-1">سبب التعليق المسجل:</h3>
                  <p className="text-sm font-semibold text-orange-800">{statusDetails.suspensionReason}</p>
                </div>
              )}

              <p className="text-xs text-[#7A6F64] leading-relaxed">
                يرجى التواصل مع إدارة منصة وه لتسوية الملاحظات المرفوعة وإعادة تفعيل نشاط المتجر.
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={fetchSellerReviewStatus}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>إعادة التحقق من الحالة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('home')}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  العودة للرئيسية
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header with Workshop Cover Background Accent */}
      <div className="relative overflow-hidden rounded-3xl text-white shadow-xl border border-[#9E4F36]">
        {/* Background Cover Image with Rich Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={sellerCoverImage}
            alt={brandName}
            className="w-full h-full object-cover blur-[1px] brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#B45F42]/95 via-[#B45F42]/90 to-[#7A3F2C]/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/40 flex items-center justify-center text-white text-2xl font-bold font-heritage shadow-md shrink-0">
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
                <h1 className="text-2xl font-black font-heritage">لوحة تحكم البائع الحرفي</h1>
                <span className="bg-amber-300 text-[#2D2A26] text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  ورشة معتمدة
                </span>
                <button
                  type="button"
                  id="seller-cover-settings-btn"
                  onClick={() => setActiveTab('settings')}
                  className="text-[11px] text-amber-200 hover:text-white underline mr-2 flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>تعديل صورة الغلاف والشعار</span>
                </button>
              </div>
              <p className="text-xs text-amber-100 mt-1 font-medium">
                {brandName} • محافظة {sellerGovernorate} ({sellerSpecialty || 'حرفي موثق'})
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              id="seller-edit-cover-quick-btn"
              onClick={() => setActiveTab('settings')}
              className="px-4 py-3 bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold rounded-2xl backdrop-blur-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Palette className="w-4 h-4 text-amber-300" />
              <span>تخصيص غلاف الورشة</span>
            </button>

            <button
              type="button"
              id="seller-add-product-btn"
              onClick={openAddProductModal}
              className="px-6 py-3 bg-[#FDFBF7] hover:bg-white text-[#B45F42] text-sm font-bold rounded-2xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة منتج جديد</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Older-User & Artisan Friendly Primary Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Action 1: Add Product */}
        <button
          type="button"
          id="seller-primary-add-card"
          onClick={openAddProductModal}
          className="p-5 bg-[#B45F42] hover:bg-[#9E4F36] text-white rounded-3xl shadow-md transition-all text-right flex items-center justify-between group cursor-pointer"
        >
          <div>
            <span className="text-base font-bold block mb-1">إضافة منتج</span>
            <span className="text-xs text-amber-100/90 block font-medium">رفع قطعة جديدة للاعتماد</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
        </button>

        {/* Action 2: My Products */}
        <button
          type="button"
          id="seller-primary-prods-card"
          onClick={() => setActiveTab('products')}
          className={`p-5 rounded-3xl shadow-xs transition-all text-right flex items-center justify-between border cursor-pointer ${
            activeTab === 'products'
              ? 'bg-[#FDFBF7] border-[#B45F42]'
              : 'bg-white border-[#E8E1D9] hover:border-[#B45F42]'
          }`}
        >
          <div>
            <span className="text-base font-bold text-[#2D2A26] block mb-1">منتجاتي</span>
            <span className="text-xs text-[#7A6F64] block font-medium">{sellerProducts.length} قطعة مسجلة بالورشة</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </button>

        {/* Action 3: Orders */}
        <button
          type="button"
          id="seller-primary-orders-card"
          onClick={() => setActiveTab('orders')}
          className={`p-5 rounded-3xl shadow-xs transition-all text-right flex items-center justify-between border cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#FDFBF7] border-[#B45F42]'
              : 'bg-white border-[#E8E1D9] hover:border-[#B45F42]'
          }`}
        >
          <div>
            <span className="text-base font-bold text-[#2D2A26] block mb-1">الطلبات</span>
            <span className="text-xs text-[#7A6F64] block font-medium">{orders.length} طلب من الزبائن</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
        </button>

        {/* Action 4: Workshop Identity & Cover */}
        <button
          type="button"
          id="seller-primary-account-card"
          onClick={() => setActiveTab('settings')}
          className={`p-5 rounded-3xl shadow-xs transition-all text-right flex items-center justify-between border cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#FDFBF7] border-[#B45F42]'
              : 'bg-white border-[#E8E1D9] hover:border-[#B45F42]'
          }`}
        >
          <div>
            <span className="text-base font-bold text-[#2D2A26] block mb-1">غلاف وهوية الورشة</span>
            <span className="text-xs text-[#7A6F64] block font-medium">تعديل الغلاف وقسم الورش المعتمدة</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-700 shrink-0">
            <Camera className="w-6 h-6" />
          </div>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E1D9] overflow-x-auto pb-2 no-scrollbar px-1">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-[#B45F42] text-white shadow-xs'
              : 'bg-white text-[#2D2A26] hover:bg-[#F3EFE9] border border-[#E8E1D9]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>نظرة عامة وإحصائيات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-[#B45F42] text-white shadow-xs'
              : 'bg-white text-[#2D2A26] hover:bg-[#F3EFE9] border border-[#E8E1D9]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>إدارة المنتجات والاعتماد ({sellerProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'bg-[#B45F42] text-white shadow-xs'
              : 'bg-white text-[#2D2A26] hover:bg-[#F3EFE9] border border-[#E8E1D9]'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>المخزون وحركات الجرد ({sellerProducts.reduce((acc, p) => acc + p.stockCount, 0)} قطعة)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-[#B45F42] text-white shadow-xs'
              : 'bg-white text-[#2D2A26] hover:bg-[#F3EFE9] border border-[#E8E1D9]'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>تنفيذ وتجهيز الطلبات ({orders.length})</span>
        </button>

        <button
          type="button"
          id="seller-messages-tab-btn"
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'messages'
              ? 'bg-[#B45F42] text-white shadow-xs'
              : 'bg-white text-[#2D2A26] hover:bg-[#F3EFE9] border border-[#E8E1D9]'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-amber-500" />
          <span>محادثات الزبائن المباشرة</span>
          {chatUnreadCount > 0 && (
            <span className="bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {chatUnreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'payouts'
              ? 'bg-[#B45F42] text-white shadow-xs'
              : 'bg-white text-[#2D2A26] hover:bg-[#F3EFE9] border border-[#E8E1D9]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>طلب صرف المستحقات</span>
        </button>

        <button
          type="button"
          id="seller-reels-tab-btn"
          onClick={() => setActiveTab('reels')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'reels'
              ? 'bg-[#B45F42] text-white shadow-xs'
              : 'bg-white text-[#2D2A26] hover:bg-[#F3EFE9] border border-[#E8E1D9]'
          }`}
        >
          <Film className="w-4 h-4 text-amber-500" />
          <span>فيديوهات ورشة الصنعة (Craft Reels) ({reels.length})</span>
        </button>

        <button
          type="button"
          id="seller-notifications-tab-btn"
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-[#B45F42] text-white shadow-xs'
              : 'bg-white text-[#2D2A26] hover:bg-[#F3EFE9] border border-[#E8E1D9]'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>مركز الإشعارات والتنبيهات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-[#B45F42] text-white shadow-xs'
              : 'bg-white text-[#2D2A26] hover:bg-[#F3EFE9] border border-[#E8E1D9]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>بيانات الورشة والتسوية</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Overview Top Header with Refresh Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E8E1D9] shadow-xs">
            <div>
              <h2 className="font-black text-lg text-[#2D2A26]">لوحة أداء ومبيعات الورشة</h2>
              <p className="text-xs text-[#7A6F64] mt-0.5">
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

          {/* 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#7A6F64] mb-2">
                <span>إجمالي المبيعات المحققة</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-2xl font-black text-[#2D2A26] font-mono">{totalRevenue.toLocaleString()} ج.م</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">+18% نمو المبيعات التراثية</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#7A6F64] mb-2">
                <span>إجمالي الطلبات</span>
                <Truck className="w-4 h-4 text-[#B45F42]" />
              </div>
              <span className="text-2xl font-black text-[#2D2A26] font-mono">{orders.length}</span>
              <span className="text-[10px] text-[#7A6F64] block mt-1">طلبات من محافظات الجمهورية</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#7A6F64] mb-2">
                <span>القطع المعروضة والمخزون</span>
                <Package className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-2xl font-black text-[#2D2A26] font-mono">{sellerProducts.length} منتج</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                {sellerProducts.filter((p) => p.approvalStatus === 'approved').length} معتمد ومنشور بالسوق
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#7A6F64] mb-2">
                <span>تقييم المشترين الموثق</span>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <span className="text-2xl font-black text-[#2D2A26] font-mono">4.9 / 5.0</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">100% تقييمات بمشتريات مؤكدة</span>
            </div>
          </div>

          {/* Quick Inventory Alert Bar */}
          {(lowStockCount > 0 || outOfStockCount > 0) && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-amber-900 block">تنبيهات المخزون الحرج:</span>
                  <span className="text-amber-800">
                    لديك {outOfStockCount} منتجات نفذ رصيدها بالكامل، و {lowStockCount} منتجات قاربت على النفاذ (أقل من 5 قطع).
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto"
              >
                تحديث الجرد والمخزون
              </button>
            </div>
          )}

          {/* Pending products status notice */}
          {sellerProducts.some((p) => p.approvalStatus === 'pending') && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">لديك منتجات قيد فحص الجودة والأصالة</h4>
                  <p className="text-[11px] text-amber-700">
                    يقوم مسؤولو منصة وه بمراجعة بيانات قطعك والتأكد من أصالتها قبل النشر العام للجمهور.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0"
              >
                متابعة الحالات
              </button>
            </div>
          )}

          {/* Rejection notices if any */}
          {sellerProducts.some((p) => p.approvalStatus === 'rejected') && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-rose-900">يوجد منتجات تحتاج لتعديل وتصحيح لإعادة النشر</h4>
                  <p className="text-[11px] text-rose-700">
                    راجع أسباب الرفض المسجلة من إدارة المنصة وقم بتصحيح البيانات ثم أعد تقديمها للمراجعة.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shrink-0"
              >
                عرض الملاحظات
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGER */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-[#2D2A26]">كتالوج قطع الورشة ومتابعة دورة الاعتماد</h3>
              <p className="text-xs text-[#7A6F64]">
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
                className="px-4 py-2.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قطعة جديدة</span>
              </button>
            </div>
          </div>

          {/* Products List with Full Moderation Lifecycle */}
          <div className="space-y-4">
            {sellerProducts.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#E8E1D9] rounded-2xl">
                <Package className="w-10 h-10 text-[#7A6F64] mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold text-[#2D2A26]">لا توجد منتجات مسجلة حتى الآن</p>
                <p className="text-xs text-[#7A6F64] mt-1">ابدأ بإضافة أول قطعة تراثية من ورشتك</p>
                <button
                  type="button"
                  onClick={openAddProductModal}
                  className="mt-4 px-4 py-2 bg-[#B45F42] text-white text-xs font-bold rounded-xl"
                >
                  إضافة منتج الآن
                </button>
              </div>
            ) : (
              sellerProducts.map((prod) => (
                <div
                  key={prod.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    prod.approvalStatus === 'rejected'
                      ? 'bg-rose-50/50 border-rose-200'
                      : prod.approvalStatus === 'pending'
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-[#FDFBF7] border-[#E8E1D9]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <img
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80'}
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
                          السعر: <strong className="text-[#B45F42]">{prod.price} ج.م</strong> • المخزون: <span className={prod.stockCount === 0 ? 'text-rose-600 font-bold' : prod.stockCount <= 5 ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'}>{prod.stockCount} قطعة</span> • الصنعة: {prod.specifications?.craftsmanship || 'يدوية'}
                        </p>
                        <p className="text-[11px] text-[#7A6F64]">
                          تاريخ الإدراج: {prod.createdAt} • المحافظة: {prod.sellerGovernorate}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 w-full md:w-auto">
                      {/* Quick stock adjustment button */}
                      <button
                        type="button"
                        onClick={() => openStockModal(prod)}
                        className="px-3 py-1.5 bg-[#F3EFE9] hover:bg-[#E8E1D9] text-[#2D2A26] rounded-lg text-xs font-bold flex items-center gap-1.5 border border-[#E8E1D9]"
                        title="تعديل المخزون المتاح"
                      >
                        <Boxes className="w-3.5 h-3.5 text-[#B45F42]" />
                        <span>تعديل المخزون ({prod.stockCount})</span>
                      </button>

                      {/* If Draft or Rejected, allow submitting to review */}
                      {(prod.approvalStatus === 'draft' || prod.approvalStatus === 'rejected') && (
                        <button
                          type="button"
                          onClick={() => handleSubmitForReview(prod.id)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                          title="إرسال للمراجعة والاعتماد"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>إرسال للمراجعة</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openEditProductModal(prod)}
                        className="p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-[#E8E1D9] transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف المنتج "${prod.title}"؟`)) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="p-2 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* If product was rejected by Admin, show rejection reason box */}
                  {prod.approvalStatus === 'rejected' && prod.rejectionReason && (
                    <div className="mt-3 p-3 bg-rose-100/70 border border-rose-300 rounded-xl text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-900 font-bold">
                        <AlertCircle className="w-4 h-4 text-rose-700" />
                        <span>سبب الرفض المسجل من إدارة المنصة:</span>
                      </div>
                      <p className="text-rose-800 text-xs pr-5 leading-relaxed">{prod.rejectionReason}</p>
                      <div className="pt-1 pr-5">
                        <button
                          type="button"
                          onClick={() => openEditProductModal(prod)}
                          className="text-[11px] font-bold text-rose-900 underline hover:text-rose-950"
                        >
                          انقر هنا لتصحيح البيانات وإعادة إرسال المنتج للمراجعة
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: INVENTORY & STOCK MOVEMENTS (PHASE 4) */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <span className="text-xs text-[#7A6F64] block mb-1">إجمالي القطع في الورشة</span>
              <span className="text-2xl font-black text-[#2D2A26] font-mono">
                {sellerProducts.reduce((acc, p) => acc + p.stockCount, 0)} قطعة
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">جاهزة للشحن المباشر</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <span className="text-xs text-[#7A6F64] block mb-1">قيمة المخزون الإجمالية</span>
              <span className="text-2xl font-black text-[#B45F42] font-mono">
                {totalValuation.toLocaleString()} ج.م
              </span>
              <span className="text-[10px] text-[#7A6F64] block mt-1">بسعر البيع الفعلي</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <span className="text-xs text-[#7A6F64] block mb-1">قطع أوشكت على النفاذ</span>
              <span className={`text-2xl font-black font-mono ${lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                {lowStockCount} منتجات
              </span>
              <span className="text-[10px] text-amber-700 font-bold block mt-1">مخزون أقل من 5 قطع</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <span className="text-xs text-[#7A6F64] block mb-1">قطع نفذت بالكامل</span>
              <span className={`text-2xl font-black font-mono ${outOfStockCount > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                {outOfStockCount} منتج
              </span>
              <span className="text-[10px] text-rose-700 font-bold block mt-1">تحتاج إنتاج دفعة جديدة بالورشة</span>
            </div>
          </div>

          {/* Real Inventory Table with instant stock adjustment */}
          <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-[#2D2A26]">إدارة المخزون والتوريدات اليدوية</h3>
                <p className="text-xs text-[#7A6F64]">
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

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#E8E1D9] text-[#7A6F64] font-bold">
                    <th className="pb-3 pr-2">المنتج والورشة</th>
                    <th className="pb-3">التصنيف</th>
                    <th className="pb-3">سعر القطعة</th>
                    <th className="pb-3">الرصيد الحالي</th>
                    <th className="pb-3">حالة الوفرة</th>
                    <th className="pb-3 text-left pl-2">إجراءات التعديل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E1D9]">
                  {sellerProducts.map((prod) => {
                    const isOutOfStock = prod.stockCount === 0;
                    const isLow = prod.stockCount > 0 && prod.stockCount <= 5;
                    return (
                      <tr key={prod.id} className="hover:bg-[#FDFBF7]/80 transition-colors">
                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80'}
                              alt={prod.title}
                              className="w-10 h-10 rounded-lg object-cover border border-[#E8E1D9]"
                            />
                            <div>
                              <span className="font-bold text-[#2D2A26] block">{prod.title}</span>
                              <span className="text-[10px] text-[#7A6F64]">{prod.specifications?.material || 'خامات طبيعية'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 text-[#7A6F64] font-medium">{prod.categoryName}</td>
                        <td className="py-3.5 font-bold font-mono text-[#B45F42]">{prod.price} ج.م</td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#2D2A26]">{prod.stockCount}</span>
                            <span className="text-[10px] text-[#7A6F64]">قطعة</span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                              <AlertCircle className="w-3 h-3" />
                              <span>نفذ من المخزن</span>
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                              <AlertTriangle className="w-3 h-3" />
                              <span>مخزون منخفض ({prod.stockCount})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                              <Check className="w-3 h-3" />
                              <span>متوفر ({prod.stockCount})</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-left pl-2">
                          <button
                            type="button"
                            onClick={() => openStockModal(prod)}
                            className="px-3 py-1.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 ml-auto min-h-[36px]"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>تعديل الرصيد</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View for Inventory */}
            <div className="md:hidden space-y-3">
              {sellerProducts.map((prod) => {
                const isOutOfStock = prod.stockCount === 0;
                const isLow = prod.stockCount > 0 && prod.stockCount <= 5;
                return (
                  <div key={prod.id} className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E8E1D9] space-y-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80'}
                        alt={prod.title}
                        className="w-12 h-12 rounded-xl object-cover border border-[#E8E1D9] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs text-[#2D2A26] block truncate">{prod.title}</span>
                        <span className="text-[11px] text-[#7A6F64] block">
                          {prod.categoryName} • <strong className="text-[#B45F42] font-mono">{prod.price} ج.م</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E8E1D9]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#7A6F64]">الرصيد:</span>
                        <span className="font-mono font-bold text-sm text-[#2D2A26]">{prod.stockCount} قطعة</span>
                        {isOutOfStock ? (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">نفذ</span>
                        ) : isLow ? (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">منخفض</span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">متوفر</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => openStockModal(prod)}
                        className="px-3 py-1.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-xs font-bold rounded-xl shadow-2xs min-h-[38px] flex items-center gap-1"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>تعديل</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stock Movements Audit Trail */}
          <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#2D2A26] flex items-center gap-2">
                  <History className="w-4 h-4 text-[#B45F42]" />
                  <span>سجل حركات وتوريدات المخزن (Audit Trail)</span>
                </h3>
                <p className="text-xs text-[#7A6F64]">توثيق دقيق لكل عملية بيع أو إنتاج يدوي أو تسوية جردية</p>
              </div>
            </div>

            <div className="space-y-2">
              {stockMovements.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500 bg-[#FDFBF7] rounded-xl border border-dashed border-[#E8E1D9]">
                  لا توجد حركات مسجلة مؤخراً. سيتم تدوين العمليات فور تعديل الرصيد أو البيع.
                </div>
              ) : (
                stockMovements.slice(0, 10).map((mov, idx) => (
                  <div
                    key={mov.id || idx}
                    className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E8E1D9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        mov.type === 'STOCK_ADDED' ? 'bg-emerald-500' : mov.type === 'ORDER_SOLD' ? 'bg-blue-500' : 'bg-amber-500'
                      }`} />
                      <div>
                        <span className="font-bold text-[#2D2A26]">{mov.productTitle || 'منتج بالورشة'}</span>
                        <span className="text-[#7A6F64] block text-[11px] mt-0.5">
                          السبب: {mov.reason} • القائم بالعملية: {mov.actorName || 'الحرفي'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center font-mono">
                      <div className="text-right">
                        <span className="text-[#7A6F64] text-[10px] block">الرصيد السابق ← الجديد</span>
                        <span className="font-bold text-[#2D2A26]">
                          {mov.previousStock} ← <strong className="text-[#B45F42]">{mov.newStock}</strong>
                        </span>
                      </div>
                      <span className={`font-bold px-2 py-1 rounded text-xs ${
                        mov.quantity >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E1D9] pb-4">
            <div>
              <h3 className="font-bold text-base text-[#2D2A26]">إدارة وشحن طلبات العملاء</h3>
              <p className="text-xs text-[#7A6F64]">قم بتحديث حالة الشحنة فور تجهيز الطرد بالورشة</p>
            </div>
            <RefreshDataButton
              onRefresh={refreshOrders}
              label="تحديث الطلبات"
            />
          </div>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 bg-[#FDFBF7] rounded-2xl border border-dashed border-[#E8E1D9]">
                لا توجد طلبات جديدة موجهة لمنتجاتك حالياً.
              </div>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="p-4 sm:p-5 bg-[#FDFBF7] rounded-2xl border border-[#E8E1D9] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E1D9] pb-3">
                    <div>
                      <span className="font-mono font-bold text-xs text-[#B45F42] block">
                        {ord.orderNumber || ord.id}
                      </span>
                      <span className="text-xs text-[#2D2A26]">
                        المشتري: <strong>{ord.shippingAddress?.fullName || (ord.shippingAddress as any)?.buyerName || ord.buyerName}</strong> (
                        {ord.shippingAddress?.phone || (ord.shippingAddress as any)?.buyerPhone || ord.buyerPhone})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#7A6F64]">تحديث الحالة:</span>
                      <select
                        value={ord.status}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className="px-3 py-1.5 bg-white border border-[#E8E1D9] rounded-xl text-xs font-bold text-[#B45F42] outline-none"
                      >
                        <option value="pending">طلب جديد (Pending)</option>
                        <option value="confirmed">تأكيد الورشة (Confirmed)</option>
                        <option value="processing">جاري التجهيز والتغليف بالورشة</option>
                        <option value="shipped">تم تسليم الشحنة لشركة التوصيل</option>
                        <option value="delivered">تم الاستلام من العميل</option>
                        <option value="cancelled">ملغي (Cancelled)</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs text-[#2D2A26] flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold">العنوان:</span> {ord.shippingAddress?.governorate || 'المحافظة'} - {ord.shippingAddress?.city || 'المدينة'} ({ord.shippingAddress?.streetAddress || (ord.shippingAddress as any)?.address || 'العنوان'})
                    </div>
                    <div className="font-bold text-[#B45F42]">
                      إجمالي الفاتورة: {ord.total} ج.م
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PAYOUTS */}
      {activeTab === 'payouts' && (
        <SellerPayouts
          user={currentUser}
          onNavigateToAccount={() => setActiveTab('settings')}
        />
      )}

      {/* TAB 5: WORKSHOP SETTINGS & PROFILE */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#B45F42]" />
                  <span>واجهة عرض الورشة في قسم الورش والتعاونيات الحرفية المعتمدة</span>
                </div>
                <h3 className="font-black text-xl text-[#2D2A26] font-heritage">
                  هوية وغلاف الورشة في منصة وه
                </h3>
                <p className="text-xs text-[#7A6F64] mt-1 max-w-2xl leading-relaxed">
                  خصص صورة الغلاف وشعار ورشتكم والبيانات التعريفية. تظهر هذه الصورة في صدارة بطاقة ورشتكم بقسم 
                  <strong className="text-[#2D2A26] font-bold mx-1">"الورش والتعاونيات الحرفية المعتمدة"</strong>
                  بالصفحة الرئيسية، ودليل الحرفيين، والمتجر التراثي الخاص بكم.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                <RefreshDataButton
                  onRefresh={refreshSellers}
                  label="تحديث بيانات الورشة"
                />
                <button
                  type="button"
                  onClick={() => setActivePage('sellers')}
                  className="px-4 py-2 bg-[#FDFBF7] hover:bg-[#F3EFE9] text-[#B45F42] border border-[#E8E1D9] rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>مشاهدة قسم الورش بالمنصة</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Cover Selection & Settings Form (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Cover Image Selector Box */}
              <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-[#E8E1D9] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#B45F42] flex items-center justify-center">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#2D2A26]">اختيار وتحديث صورة الغلاف</h4>
                      <p className="text-[11px] text-[#7A6F64]">اختر من المعرض التراثي المعتمد أو ارفع صورة خاصة لورشتك</p>
                    </div>
                  </div>
                  
                  {sellerCoverImage && (
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>تم تعيين الغلاف</span>
                    </span>
                  )}
                </div>

                {/* Cover Picker Tabs */}
                <div className="flex items-center gap-2 p-1 bg-[#FDFBF7] border border-[#E8E1D9] rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setCoverPickerTab('presets')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      coverPickerTab === 'presets'
                        ? 'bg-[#B45F42] text-white shadow-xs'
                        : 'text-[#7A6F64] hover:text-[#2D2A26]'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>المعرض التراثي ({HERITAGE_COVER_PRESETS.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCoverPickerTab('upload')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      coverPickerTab === 'upload'
                        ? 'bg-[#B45F42] text-white shadow-xs'
                        : 'text-[#7A6F64] hover:text-[#2D2A26]'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع من جهازك</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCoverPickerTab('url')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      coverPickerTab === 'url'
                        ? 'bg-[#B45F42] text-white shadow-xs'
                        : 'text-[#7A6F64] hover:text-[#2D2A26]'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>رابط صورة</span>
                  </button>
                </div>

                {/* TAB 1: CURATED PRESETS GALLERY */}
                {coverPickerTab === 'presets' && (
                  <div className="space-y-3">
                    <p className="text-xs text-[#7A6F64]">
                      اختر صورة غلاف موثقة وعالية الجودة تمثل طابع حرفتكم التراثية بالصعيد:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {HERITAGE_COVER_PRESETS.map((preset) => {
                        const isSelected = sellerCoverImage === preset.url;
                        return (
                          <button
                            type="button"
                            key={preset.id}
                            onClick={() => handleSelectPresetCover(preset.url, preset.title)}
                            className={`group relative rounded-2xl overflow-hidden border-2 text-right transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#B45F42] ring-2 ring-[#B45F42]/30 shadow-md scale-[1.02]'
                                : 'border-[#E8E1D9] hover:border-[#B45F42]/60 hover:shadow-xs'
                            }`}
                          >
                            <div className="h-24 w-full relative overflow-hidden bg-gray-100">
                              <img
                                src={preset.url}
                                alt={preset.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                              
                              {/* Selected Checkmark Badge */}
                              {isSelected && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-[#B45F42] text-white rounded-full flex items-center justify-center shadow-xs">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}

                              <div className="absolute bottom-1.5 right-2 left-2 text-white">
                                <span className="text-[9px] font-bold block truncate drop-shadow-xs">
                                  {preset.region}
                                </span>
                                <span className="text-[10px] font-black text-amber-200 block truncate drop-shadow-xs">
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

                {/* TAB 2: UPLOAD FROM DEVICE */}
                {coverPickerTab === 'upload' && (
                  <div className="space-y-4">
                    <label
                      htmlFor="seller-cover-upload-input"
                      className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                        isUploadingCover
                          ? 'border-amber-400 bg-amber-50/50'
                          : 'border-[#E8E1D9] hover:border-[#B45F42] bg-[#FDFBF7] hover:bg-[#F3EFE9]/40'
                      }`}
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
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 animate-spin">
                            <Loader2 className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-[#2D2A26] block">جاري رفع وحفظ صورة الغلاف...</span>
                            <span className="text-xs text-[#7A6F64]">يتم معالجة الصورة السحابية بدقة عالية</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#B45F42] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-[#2D2A26] block mb-1">
                              انقر هنا لاختيار صورة الغلاف من جهازك
                            </span>
                            <span className="text-xs text-[#7A6F64] block">
                              الصيغ المدعومة: JPG, PNG, WebP (الحجم الأقصى: 5 ميجابايت)
                            </span>
                          </div>
                          <span className="px-4 py-1.5 bg-[#B45F42] text-white text-xs font-bold rounded-xl shadow-xs">
                            تصفح الملفات
                          </span>
                        </>
                      )}
                    </label>

                    {coverUploadError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{coverUploadError}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: CUSTOM IMAGE URL */}
                {coverPickerTab === 'url' && (
                  <form onSubmit={handleApplyCoverUrl} className="space-y-3">
                    <p className="text-xs text-[#7A6F64]">
                      إذا كانت لديك صورة مرفوعة مسبقاً على الإنترنت، يمكنك لصق الرابط المباشر هنا:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={customCoverUrl}
                        onChange={(e) => setCustomCoverUrl(e.target.value)}
                        placeholder="https://example.com/workshop-cover.jpg"
                        className="flex-1 p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42] dir-ltr text-left"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-xs font-bold rounded-xl shrink-0 transition-all shadow-xs"
                      >
                        تطبيق الرابط
                      </button>
                    </div>
                    {coverUploadError && (
                      <p className="text-xs text-rose-600 font-semibold">{coverUploadError}</p>
                    )}
                  </form>
                )}
              </div>

              {/* Workshop Identity & Payout Form */}
              <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-[#E8E1D9] pb-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#B45F42] flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#2D2A26]">البيانات الرسمية وهوية المتجر</h4>
                    <p className="text-[11px] text-[#7A6F64]">تعديل اسم الورشة، المحافظة، التخصص، وبيانات الحساب</p>
                  </div>
                </div>

                <form onSubmit={handleSaveWorkshopProfile} className="space-y-4">
                  {/* Workshop Logo / Avatar */}
                  <div className="p-4 bg-[#FDFBF7] border border-[#E8E1D9] rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-xs bg-gray-100 shrink-0 relative">
                        <img
                          src={sellerAvatar}
                          alt={brandName}
                          className="w-full h-full object-cover"
                        />
                        {isUploadingAvatar && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#2D2A26] block">شعار الورشة / صورة الحرفي</span>
                        <span className="text-[11px] text-[#7A6F64] block">تظهر في الدائرة الصغيرة على بطاقة الورشة</span>
                      </div>
                    </div>

                    <label
                      htmlFor="seller-avatar-upload"
                      className="px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-[#E8E1D9] text-[#2D2A26] rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs shrink-0"
                    >
                      <input
                        id="seller-avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileSelect}
                        disabled={isUploadingAvatar}
                        className="hidden"
                      />
                      تغيير الشعار
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                      اسم الورشة أو العلامة الحرفية *
                    </label>
                    <input
                      type="text"
                      required
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                        محافظة المنشأ الحرفي *
                      </label>
                      <select
                        value={sellerGovernorate}
                        onChange={(e) => setSellerGovernorate(e.target.value as Governorate)}
                        className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
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
                      <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                        التخصص الحرفي الأصيل
                      </label>
                      <input
                        type="text"
                        value={sellerSpecialty}
                        onChange={(e) => setSellerSpecialty(e.target.value)}
                        placeholder="مثال: فخار نيلي، تلي أسيوط، كليم أخميم"
                        className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                      نبذة عن تاريخ الورشة وأصالة الصنعة
                    </label>
                    <textarea
                      rows={3}
                      value={sellerBio}
                      onChange={(e) => setSellerBio(e.target.value)}
                      placeholder="اكتب نبذة تراثية تجذب المشترين وتعرفهم بتاريخ ورشتكم في الصعيد..."
                      className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42] leading-relaxed"
                    />
                  </div>

                  <div className="border-t border-[#E8E1D9] pt-4 space-y-3">
                    <h4 className="font-bold text-xs text-[#2D2A26]">إعدادات استلام المستحقات المالية</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#2D2A26] mb-1">طريقة التسوية المفضلة</label>
                        <select
                          value={sellerPayoutMethod}
                          onChange={(e) => setSellerPayoutMethod(e.target.value as any)}
                          className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                        >
                          <option value="vodafone_cash">فودافون كاش / محافظ الكترونية</option>
                          <option value="instapay">شبكة المدفوعات اللحظية InstaPay</option>
                          <option value="bank_transfer">تحويل بنكي مباشر</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#2D2A26] mb-1">رقم الحساب أو عنوان IPA</label>
                        <input
                          type="text"
                          value={sellerPayoutAccount}
                          onChange={(e) => setSellerPayoutAccount(e.target.value)}
                          className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-4">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-6 py-3 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>جاري حفظ الغلاف والبيانات...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>حفظ التعديلات واعتماد الغلاف</span>
                        </>
                      )}
                    </button>

                    <span className="text-[11px] text-[#7A6F64]">
                      يتم تحديث بطاقة الورشة فوراً في الصفحة الرئيسية
                    </span>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Live Interactive Card Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="sticky top-6 space-y-4">
                <div className="bg-gradient-to-br from-[#2D2A26] to-[#1C1A17] rounded-3xl p-6 text-white shadow-xl space-y-4 border border-[#3E3A35]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-amber-400" />
                      <h4 className="font-bold text-sm text-white">معاينة حية ومباشرة</h4>
                    </div>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                      قسم الورش المعتمدة
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-100/80 leading-relaxed">
                    هكذا تظهر بطاقة ورشتكم للمشترين في قسم 
                    <strong className="text-white font-bold mx-1">"الورش والتعاونيات الحرفية المعتمدة"</strong>
                    بالصفحة الرئيسية ودليل الحرفيين:
                  </p>

                  {/* The Exact Realistic Card from FeaturedSellers.tsx */}
                  <div className="bg-white rounded-3xl border border-[#E8E1D9] overflow-hidden shadow-lg group transition-all text-[#2D2A26]">
                    {/* Workshop Cover Banner */}
                    <div className="h-44 relative overflow-hidden bg-gray-100">
                      <img
                        src={sellerCoverImage}
                        alt={brandName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* Governorate Badge */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#2D2A26] text-[11px] font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1 border border-white/40">
                        <MapPin className="w-3 h-3 text-[#B45F42]" />
                        <span>محافظة {sellerGovernorate}</span>
                      </div>

                      {/* Verified Badge */}
                      <div className="absolute top-3 left-3 bg-[#B45F42] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>مُعتمد</span>
                      </div>

                      {/* Workshop Avatar Overlap */}
                      <div className="absolute -bottom-6 right-5">
                        <div className="w-16 h-16 rounded-2xl border-3 border-white overflow-hidden shadow-md bg-white">
                          <img
                            src={sellerAvatar}
                            alt={brandName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Content Details */}
                    <div className="p-5 pt-8 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-base text-[#2D2A26] font-heritage group-hover:text-[#B45F42] transition-colors">
                            {brandName}
                          </h4>
                          <span className="inline-block text-[11px] font-bold text-[#B45F42] bg-amber-50 px-2 py-0.5 rounded-md mt-1 border border-amber-100">
                            {sellerSpecialty || 'حرفة يدوية تراثية أصيلة'}
                          </span>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-xl text-amber-800 text-xs font-bold shrink-0 border border-amber-100">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>4.9</span>
                        </div>
                      </div>

                      {/* Bio text */}
                      <p className="text-xs text-[#7A6F64] line-clamp-2 leading-relaxed">
                        {sellerBio || 'ورشة تراثية متخصصة في الحرف اليدوية الصعيدية الأصيلة بجودة ممتازة.'}
                      </p>

                      {/* Card Footer */}
                      <div className="border-t border-[#E8E1D9] pt-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-[#7A6F64]">
                          <Package className="w-4 h-4 text-[#B45F42]" />
                          <span className="font-semibold">{sellerProducts.length} قطعة معروضة</span>
                        </div>

                        <span className="text-[#B45F42] font-bold text-xs flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
                          <span>زيارة المتجر</span>
                          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Helper Callout */}
                  <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-2.5 text-[11px] text-amber-200/90">
                    <Info className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <span>
                      أي تغيير في صورة الغلاف أو المحافظة أو التخصص ينعكس على الفور في المعاينة أعلاه وموقع المنصة بمجرد الضغط على زر الحفظ.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CRAFT REELS (VIDEOS) MANAGEMENT */}
      {activeTab === 'reels' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Header Banner */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#2D2A26] via-[#382E27] to-[#2D2A26] text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-[#4A3E35]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#B45F42]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-amber-300 text-xs font-bold border border-white/15">
                  <Film className="w-4 h-4 text-amber-400" />
                  <span>فيديوهات ورشة الصنعة القصيرة • Shoppable Craft Reels</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black font-heritage tracking-tight">
                  سجّل كواليس الصنعة واجعل الزبائن يشترون مباشرة من الفيديو!
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  ارفع مقاطع فيديو عمودية (9:16) تبرز خطوات تشكيل الطين، نسج النول، أو نقش النحاس. يرتبط كل مقطع بمنتج معروض في ورشتك للشراء الفوري.
                </p>
              </div>

              <button
                type="button"
                id="seller-upload-reel-main-btn"
                onClick={() => setIsReelUploadOpen(true)}
                className="px-6 py-3.5 bg-gradient-to-r from-[#B45F42] to-[#9E4F36] hover:from-[#9E4F36] hover:to-[#863F28] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-xl flex items-center gap-2.5 transition-all hover:scale-105 shrink-0 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span>رفع فيديو جديد للورشة (Craft Reel)</span>
              </button>
            </div>
          </div>

          {/* 4 Reels Key Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#7A6F64] mb-2">
                <span>إجمالي المقاطع المنشورة</span>
                <Film className="w-4 h-4 text-[#B45F42]" />
              </div>
              <span className="text-2xl font-black text-[#2D2A26] font-mono">{reels.length} فيديو</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">معروضة للجمهور بالرئيسية وصفحة الريلز</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#7A6F64] mb-2">
                <span>إجمالي المشاهدات التفاعلية</span>
                <Eye className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-2xl font-black text-[#2D2A26] font-mono">
                {reels.reduce((acc, r) => acc + r.viewsCount, 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">+34% تفاعل خلال هذا الأسبوع</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#7A6F64] mb-2">
                <span>الإعجابات ودعم الحرفة</span>
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              </div>
              <span className="text-2xl font-black text-[#2D2A26] font-mono">
                {reels.reduce((acc, r) => acc + r.likesCount, 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-[#7A6F64] block mt-1">تفاعل مباشر من عشاق التراث</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#7A6F64] mb-2">
                <span>تحويلات الشراء المباشر</span>
                <Package className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-2xl font-black text-[#2D2A26] font-mono">
                {reels.reduce((acc, r) => acc + r.sharesCount, 0) * 3} نقرة شراء
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">مبيعات من خلال زر الشراء بالفيديو</span>
            </div>
          </div>

          {/* Reels Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base font-bold text-[#2D2A26] flex items-center gap-2">
                <Film className="w-5 h-5 text-[#B45F42]" />
                <span>المقاطع المسجلة والمعروضة ({reels.length})</span>
              </h3>
              <div className="flex items-center gap-2">
                <RefreshDataButton
                  onRefresh={refreshSellerReelsFromDb}
                  label="تحديث المقاطع"
                />
                <button
                  type="button"
                  onClick={() => setIsReelUploadOpen(true)}
                  className="text-xs font-bold text-[#B45F42] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة مقطع جديد</span>
                </button>
              </div>
            </div>

            {reels.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {reels.map((reel) => (
                  <div
                    key={reel.id}
                    className="bg-white rounded-3xl border border-[#E8E1D9] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    {/* 9:16 Video Thumbnail Container */}
                    <div
                      onClick={() => {
                        setSelectedReelPreviewId(reel.id);
                        setIsReelPreviewOpen(true);
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
                        <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                          {reel.duration}
                        </span>
                        <span className="bg-[#B45F42] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {reel.governorate}
                        </span>
                      </div>

                      {/* Bottom Info on Poster */}
                      <div className="absolute bottom-3 inset-x-3 z-10 space-y-1">
                        <p className="text-xs font-bold text-white line-clamp-2 drop-shadow-md">
                          {reel.title}
                        </p>
                        <p className="text-[10px] text-amber-300 truncate">
                          {reel.artisanName} • {reel.craftType}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Metadata & Actions */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-[#FAF6F0]/40">
                      {/* Linked Product Quick View */}
                      <div className="p-2.5 bg-white rounded-2xl border border-[#E8E1D9] flex items-center justify-between gap-2 shadow-2xs">
                        <img
                          src={reel.productImage}
                          alt={reel.productTitle}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-100"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-[#2D2A26] truncate">{reel.productTitle}</p>
                          <span className="text-xs font-black text-[#B45F42]">{reel.productPrice} ج.م</span>
                        </div>
                      </div>

                      {/* Engagement Stats & Cloud DB Status */}
                      <div className="flex items-center justify-between text-xs text-[#7A6F64] pt-1">
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

                      {/* Actions Buttons (Seller Full Control over own video) */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[#E8E1D9]">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReelPreviewId(reel.id);
                            setIsReelPreviewOpen(true);
                          }}
                          className="flex-1 py-2 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>مشاهدة المقطع</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSellerEditingReel(reel);
                            setIsSellerReelEditOpen(true);
                          }}
                          className="p-2 text-gray-600 hover:text-[#B45F42] hover:bg-[#FAF6F0] rounded-xl transition-colors cursor-pointer border border-[#E8E1D9]"
                          title="تعديل بيانات الفيديو والمنتج المربوط"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteReel(reel.id, reel.title)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent"
                          title="حذف الفيديو من ورشتك"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E1D9] space-y-4">
                <Film className="w-16 h-16 text-gray-300 mx-auto" />
                <h4 className="text-base font-bold text-[#2D2A26]">لم تقم برفع أي فيديوهات لورشتك بعد</h4>
                <p className="text-xs text-[#7A6F64] max-w-md mx-auto">
                  فيديوهات كواليس الصنع اليدوي تزيد من ثقة الزبائن ومبيعات المنتجات بنسبة تفوق 300%. ابدأ برفع أول فيديو الآن!
                </p>
                <button
                  type="button"
                  onClick={() => setIsReelUploadOpen(true)}
                  className="px-6 py-2.5 bg-[#B45F42] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#9E4F36] transition-all cursor-pointer"
                >
                  رفع أول مقطع فيديو للورشة
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: SELLER LIVE CHAT */}
      {activeTab === 'messages' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E8E1D9] dark:border-stone-800 p-2 sm:p-4">
          <ChatView isSellerMode={true} />
        </div>
      )}

      {/* TAB 7: NOTIFICATIONS & ALERTS */}
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

      {/* Stock Adjustment Modal (Phase 4) */}
      {isStockModalOpen && stockTargetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#E8E1D9] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8E1D9] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#2D2A26]">تعديل رصيد المخزون</h3>
                <p className="text-xs text-[#7A6F64]">{stockTargetProduct.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsStockModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                  الكمية الجديدة المتاحة بالورشة (قطع) *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStockValue((prev) => Math.max(0, prev - 1))}
                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold text-gray-700 flex items-center justify-center"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newStockValue}
                    onChange={(e) => setNewStockValue(Number(e.target.value))}
                    className="flex-1 p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-center text-base font-bold font-mono outline-none focus:border-[#B45F42]"
                  />
                  <button
                    type="button"
                    onClick={() => setNewStockValue((prev) => prev + 1)}
                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold text-gray-700 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">سبب التعديل أو رقم الدفعة *</label>
                <select
                  value={stockAdjustmentReason}
                  onChange={(e) => setStockAdjustmentReason(e.target.value)}
                  className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                >
                  <option value="إنتاج دفعة جديدة بالورشة">إنتاج دفعة جديدة بالورشة (+)</option>
                  <option value="حرق دفعة فخار جديدة في الفرن">حرق دفعة فخار جديدة في الفرن (+)</option>
                  <option value="جرد دوري للمخزن">جرد دوري وتصحيح رصيد</option>
                  <option value="تلف أو كسر بالورشة">تلف أو كسر بالورشة (-)</option>
                  <option value="بيع مباشر خارج المنصة">بيع مباشر من المعرض (-)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E1D9]">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#7A6F64] hover:bg-gray-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStock}
                  className="px-5 py-2 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#E8E1D9] max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E1D9] pb-3">
              <h3 className="font-bold text-base text-[#2D2A26]">
                {editingProduct ? 'تعديل بيانات القطعة التراثية' : 'إضافة قطعة يدوية جديدة للورشة'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">اسم القطعة (بالعربية) *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: قلة قناوية فخار مسامية أصلية"
                  className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">التصنيف التراثي *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">محافظة المنشأ الأصيلة</label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value as Governorate)}
                    className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                  >
                    <option value="قنا">قنا</option>
                    <option value="سوهاج">سوهاج</option>
                    <option value="أسوان">أسوان</option>
                    <option value="الأقصر">الأقصر</option>
                    <option value="أسيوط">أسيوط</option>
                    <option value="المنيا">المنيا</option>
                    <option value="الوادي الجديد">الوادي الجديد</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">السعر (ج.م) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">السعر قبل الخصم</label>
                  <input
                    type="number"
                    min={0}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">المخزون المتاح</label>
                  <input
                    type="number"
                    min={0}
                    value={stockCount}
                    onChange={(e) => setStockCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">الخامات الطبيعية المستخدمة</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="مثال: طمي نيل معتق وخيوط قطنية"
                    className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">أسلوب الصنعة اليدوية</label>
                  <input
                    type="text"
                    value={craftsmanship}
                    onChange={(e) => setCraftsmanship(e.target.value)}
                    placeholder="مثال: نسج نول يدوي أصيل"
                    className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                  />
                </div>
              </div>

              {/* Arabic Product Images Upload Section (Cloudinary Integration) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#2D2A26]">
                    صور المنتج *
                    <span className="text-[10px] text-[#7A6F64] font-normal mr-2">
                      (الحد الأقصى 5 صور - JPG, PNG, WebP حتى 5 ميجابايت)
                    </span>
                  </label>
                  <span className="text-xs text-[#7A6F64] font-mono">
                    {selectedImages.length + existingImages.length} / 5
                  </span>
                </div>

                {uploadError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Previews Grid */}
                {(existingImages.length > 0 || selectedImages.length > 0) && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-2">
                    {/* Existing Images */}
                    {existingImages.map((url, idx) => (
                      <div
                        key={`existing-${idx}`}
                        className="relative group rounded-xl overflow-hidden border-2 border-[#E8E1D9] aspect-square bg-gray-50 shadow-xs"
                      >
                        <img src={url} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setExistingImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 left-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors"
                          title="حذف الصورة"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] rounded font-mono">
                          محفوظة
                        </span>
                      </div>
                    ))}

                    {/* Newly Selected Local Images */}
                    {selectedImages.map((img, idx) => (
                      <div
                        key={`selected-${idx}`}
                        className="relative group rounded-xl overflow-hidden border-2 border-[#B45F42] aspect-square bg-gray-50 shadow-xs"
                      >
                        <img src={img.dataUri} alt={img.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setSelectedImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 left-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors"
                          title="إلغاء التحديد"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-[#B45F42] text-white text-[9px] rounded">
                          جديدة
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button & File Input */}
                {selectedImages.length + existingImages.length < 5 && (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#DFCEBE] hover:border-[#B45F42] bg-[#FDFBF7] hover:bg-[#FAF6F0] rounded-2xl p-4 cursor-pointer transition-colors text-center group">
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileSelect}
                      className="hidden"
                      id="product-image-file-input"
                    />
                    <div className="w-10 h-10 rounded-full bg-[#B45F42]/10 group-hover:bg-[#B45F42]/20 flex items-center justify-center text-[#B45F42] mb-1.5 transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[#2D2A26] block">
                      رفع الصور
                    </span>
                    <span className="text-[10px] text-[#7A6F64] block mt-0.5">
                      اضغط لاختيار صور عالية الدقة من جهازك
                    </span>
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">وصف أصالة القطعة وقصتها</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="صف مراحل التصنيع بالورشة وفوائد القطعة التراثية..."
                  className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                />
              </div>

              {/* Section 3: Review & Submission Notice */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1.5 text-amber-950">
                <p className="font-bold flex items-center gap-1.5 text-sm text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>مراجعة واعتماد المنتج</span>
                </p>
                <p className="leading-relaxed text-amber-900">
                  بعد إرسال المنتج سيتم مراجعته من الإدارة قبل ظهوره في المتجر.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E1D9]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-3 text-xs sm:text-sm font-bold text-[#7A6F64] hover:bg-gray-100 rounded-2xl transition-colors"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  id="submit-product-review-btn"
                  disabled={isSubmitting || isUploadingImages}
                  className="px-7 py-3 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isUploadingImages ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري رفع الصور...</span>
                    </>
                  ) : isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري حفظ المنتج...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingProduct ? 'حفظ التعديلات' : 'إرسال المنتج للمراجعة'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E8E1D9] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-[#2D2A26]">طلب سحب أرباح الورشة</h3>
            <form onSubmit={handlePayoutSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">المبلغ المطلوب (ج.م)</label>
                <input
                  type="number"
                  required
                  min={100}
                  max={4850}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">وسيلة التحويل</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value as any)}
                  className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs"
                >
                  <option value="vodafone_cash">فودافون كاش (Vodafone Cash)</option>
                  <option value="instapay">إنستاباي (InstaPay IPA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">رقم المحفظة / عنوان إنستاباي</label>
                <input
                  type="text"
                  required
                  value={payoutNumber}
                  onChange={(e) => setPayoutNumber(e.target.value)}
                  className="w-full p-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#7A6F64]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl"
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

      {/* Reel Edit Modal (Seller Workshop Control) */}
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
          reels={reels}
          initialReelId={selectedReelPreviewId}
          isOpen={isReelPreviewOpen}
          onClose={() => {
            setIsReelPreviewOpen(false);
            setSelectedReelPreviewId(null);
          }}
        />
      )}
    </div>
  );
};
