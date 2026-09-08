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

  // Curated Heritage Craft Workshop Cover Presets (Linked to Cloudinary)
  const [cloudImages, setCloudImages] = useState<Array<{ id: string; title: string; url: string }>>([]);
  const [isLoadingCloudImages, setIsLoadingCloudImages] = useState(false);

  useEffect(() => {
    const loadCloudImages = async () => {
      setIsLoadingCloudImages(true);
      try {
        const images = await api.fetchCloudinaryImages();
        if (images && images.length > 0) {
          const formatted = images.map((img: any, index: number) => ({
            id: `cloud-${index}`,
            title: img.public_id || `صورة سحابية ${index + 1}`,
            region: 'ورشة معتمدة',
            craft: 'تراث صعيدي أصيل',
            url: img.secure_url || img.url
          }));
          setCloudImages(formatted);
        }
      } catch (err) {
        console.error('Error loading cloud images:', err);
      } finally {
        setIsLoadingCloudImages(false);
      }
    };

    loadCloudImages();
  }, []);

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
      <div
        dir="rtl"
        className="
          min-h-screen
          overflow-x-hidden
          bg-[#eee8dc]
          text-[#211d18]
          transition-colors duration-500
          dark:bg-[#0b0b0a]
          dark:text-[#f5f0e7]
          max-w-[1600px]
          mx-auto
          px-5
          sm:px-8
          lg:px-12
          py-12
        "
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {sellerStatus === 'pending' && (
            <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
              {/* Top Amber Header Banner */}
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

              {/* Workflow Progress Steps */}
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

              {/* Seller Submitted Details Summary */}
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

                {/* Notice Card */}
                <div className="p-4 bg-[#9a6a35]/10 border border-[#9a6a35]/25 rounded-2xl flex items-start gap-3 text-xs text-black/70 dark:text-white/70 leading-relaxed">
                  <AlertCircle className="w-5 h-5 text-[#9a6a35] shrink-0 mt-0.5" />
                  <p>
                    حفاظاً على معايير الجودة والأصالة الصعيدية في منصتنا، تتطلب ميزات إدارة المنتجات وإضافة القطع الحرفية واستقبال الطلبات موافقة مسبقة من إدارة المنصة. سنقوم بإشعاركم فور الانتهاء من التدقيق.
                  </p>
                </div>

                {/* Action Buttons */}
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
                  <ShieldAlert className="w-8 h-8 text-amber-200" />
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
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors duration-500
        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
        max-w-[1600px]
        mx-auto
        px-5
        sm:px-8
        lg:px-12
        py-8
        space-y-8
      "
    >
      {/* Top Header with Workshop Cover Background Accent */}
      <div className="relative overflow-hidden rounded-[2rem] text-white shadow-xl border border-black/10 dark:border-white/10 backdrop-blur-xl">
        {/* Background Cover Image with Rich Overlay */}
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
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              id="seller-edit-cover-quick-btn"
              onClick={() => setActiveTab('settings')}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Palette className="w-4 h-4 text-[#d5a56d]" />
              <span>تخصيص غلاف الورشة</span>
            </button>

            <button
              type="button"
              id="seller-add-product-btn"
              onClick={openAddProductModal}
              className="px-6 py-3 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer border border-white/10"
            >
              <Plus className="w-4 h-4" />
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
          className="p-5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] rounded-[2rem] shadow-lg border border-black/10 dark:border-white/10 transition-all text-right flex items-center justify-between group cursor-pointer"
        >
          <div>
            <span className="text-base font-bold block mb-1">إضافة منتج</span>
            <span className="text-xs text-white/70 dark:text-black/70 block font-medium">رفع قطعة جديدة للاعتماد</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/15 dark:bg-black/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
        </button>

        {/* Action 2: My Products */}
        <button
          type="button"
          id="seller-primary-prods-card"
          onClick={() => setActiveTab('products')}
          className={`p-5 rounded-[2rem] shadow-lg transition-all text-right flex items-center justify-between border cursor-pointer backdrop-blur-xl ${activeTab === 'products'
            ? 'bg-white dark:bg-[#151513] border-[#9a6a35]'
            : 'bg-white/75 dark:bg-[#151513]/90 border-black/10 dark:border-white/10 hover:border-[#9a6a35]/40'
            }`}
        >
          <div>
            <span className="text-base font-bold block mb-1">منتجاتي</span>
            <span className="text-xs text-black/60 dark:text-white/60 block font-medium">{sellerProducts.length} قطعة مسجلة بالورشة</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#9a6a35]/10 flex items-center justify-center text-[#9a6a35] shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </button>

        {/* Action 3: Orders */}
        <button
          type="button"
          id="seller-primary-orders-card"
          onClick={() => setActiveTab('orders')}
          className={`p-5 rounded-[2rem] shadow-lg transition-all text-right flex items-center justify-between border cursor-pointer backdrop-blur-xl ${activeTab === 'orders'
            ? 'bg-white dark:bg-[#151513] border-[#9a6a35]'
            : 'bg-white/75 dark:bg-[#151513]/90 border-black/10 dark:border-white/10 hover:border-[#9a6a35]/40'
            }`}
        >
          <div>
            <span className="text-base font-bold block mb-1">الطلبات</span>
            <span className="text-xs text-black/60 dark:text-white/60 block font-medium">{orders.length} طلب من الزبائن</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
        </button>

        {/* Action 4: Workshop Identity & Cover */}
        <button
          type="button"
          id="seller-primary-account-card"
          onClick={() => setActiveTab('settings')}
          className={`p-5 rounded-[2rem] shadow-lg transition-all text-right flex items-center justify-between border cursor-pointer backdrop-blur-xl ${activeTab === 'settings'
            ? 'bg-white dark:bg-[#151513] border-[#9a6a35]'
            : 'bg-white/75 dark:bg-[#151513]/90 border-black/10 dark:border-white/10 hover:border-[#9a6a35]/40'
            }`}
        >
          <div>
            <span className="text-base font-bold block mb-1">غلاف وهوية الورشة</span>
            <span className="text-xs text-black/60 dark:text-white/60 block font-medium">تعديل الغلاف وقسم الورش المعتمدة</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-700 dark:text-purple-400 shrink-0">
            <Camera className="w-6 h-6" />
          </div>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 overflow-x-auto pb-2 no-scrollbar px-1">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'overview'
            ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
            : 'bg-white/75 dark:bg-[#151513]/90 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 backdrop-blur-xl'
            }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>نظرة عامة وإحصائيات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'products'
            ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
            : 'bg-white/75 dark:bg-[#151513]/90 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 backdrop-blur-xl'
            }`}
        >
          <Package className="w-4 h-4" />
          <span>إدارة المنتجات والاعتماد ({sellerProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'inventory'
            ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
            : 'bg-white/75 dark:bg-[#151513]/90 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 backdrop-blur-xl'
            }`}
        >
          <Boxes className="w-4 h-4" />
          <span>المخزون وحركات الجرد ({sellerProducts.reduce((acc, p) => acc + p.stockCount, 0)} قطعة)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'orders'
            ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
            : 'bg-white/75 dark:bg-[#151513]/90 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 backdrop-blur-xl'
            }`}
        >
          <Truck className="w-4 h-4" />
          <span>تنفيذ وتجهيز الطلبات ({orders.length})</span>
        </button>

        <button
          type="button"
          id="seller-messages-tab-btn"
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'messages'
            ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
            : 'bg-white/75 dark:bg-[#151513]/90 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 backdrop-blur-xl'
            }`}
        >
          <MessageSquare className="w-4 h-4 text-[#9a6a35]" />
          <span>محادثات الزبائن المباشرة</span>
          {chatUnreadCount > 0 && (
            <span className="bg-[#9a6a35] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {chatUnreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'payouts'
            ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
            : 'bg-white/75 dark:bg-[#151513]/90 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 backdrop-blur-xl'
            }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>طلب صرف المستحقات</span>
        </button>

        <button
          type="button"
          id="seller-reels-tab-btn"
          onClick={() => setActiveTab('reels')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'reels'
            ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
            : 'bg-white/75 dark:bg-[#151513]/90 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 backdrop-blur-xl'
            }`}
        >
          <Film className="w-4 h-4 text-[#9a6a35]" />
          <span>فيديوهات ورشة الصنعة (Craft Reels) ({reels.length})</span>
        </button>

        <button
          type="button"
          id="seller-notifications-tab-btn"
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'notifications'
            ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
            : 'bg-white/75 dark:bg-[#151513]/90 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 backdrop-blur-xl'
            }`}
        >
          <Bell className="w-4 h-4" />
          <span>مركز الإشعارات والتنبيهات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'settings'
            ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-md'
            : 'bg-white/75 dark:bg-[#151513]/90 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 backdrop-blur-xl'
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

          {/* 4 KPI Cards */}
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
                {orders.length > 0 ? `${orders.filter((o) => o.status === 'delivered').length} طلب مكتمل التسليم` : 'مبيعات موثقة من الورشة'}
              </span>
            </div>

            <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
              <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 mb-2 font-medium">
                <span>إجمالي الطلبات</span>
                <div className="w-8 h-8 rounded-xl bg-[#9a6a35]/10 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-[#9a6a35]" />
                </div>
              </div>
              <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">{orders.length}</span>
              <span className="text-[10px] text-black/60 dark:text-white/60 block mt-1">طلبات من محافظات الجمهورية</span>
            </div>

            <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
              <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 mb-2 font-medium">
                <span>القطع المعروضة والمخزون</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">{sellerProducts.length} منتج</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">
                {sellerProducts.filter((p) => p.approvalStatus === 'approved').length} معتمد ومنشور بالسوق
              </span>
            </div>

            <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
              <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 mb-2 font-medium">
                <span>تقييم المشترين الموثق</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
              </div>
              <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">4.9 / 5.0</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">100% تقييمات بمشتريات مؤكدة</span>
            </div>
          </div>

          {/* Quick Inventory Alert Bar */}
          {(lowStockCount > 0 || outOfStockCount > 0) && (
            <div className="p-5 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-[1.5rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
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

          {/* Pending products status notice */}
          {sellerProducts.some((p) => p.approvalStatus === 'pending') && (
            <div className="p-5 bg-[#9a6a35]/10 dark:bg-[#9a6a35]/20 border border-[#9a6a35]/30 rounded-[1.5rem] flex items-center justify-between gap-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#9a6a35] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">لديك منتجات قيد فحص الجودة والأصالة</h4>
                  <p className="text-[11px] text-black/70 dark:text-white/70">
                    يقوم مسؤولو منصة وه بمراجعة بيانات قطعك والتأكد من أصالتها قبل النشر العام للجمهور.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className="px-4 py-2 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] rounded-xl text-xs font-bold shrink-0 cursor-pointer transition-colors shadow-sm"
              >
                متابعة الحالات
              </button>
            </div>
          )}

          {/* Rejection notices if any */}
          {sellerProducts.some((p) => p.approvalStatus === 'rejected') && (
            <div className="p-5 bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 rounded-[1.5rem] flex items-center justify-between gap-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">يوجد منتجات تحتاج لتعديل وتصحيح لإعادة النشر</h4>
                  <p className="text-[11px] text-black/70 dark:text-white/70">
                    راجع أسباب الرفض المسجلة من إدارة المنصة وقم بتصحيح البيانات ثم أعد تقديمها للمراجعة.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer transition-colors shadow-sm"
              >
                عرض الملاحظات
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

          {/* Products List with Full Moderation Lifecycle */}
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
                          السعر: <strong className="text-[#9a6a35] font-mono">{prod.price} ج.م</strong> • المخزون: <span className={prod.stockCount === 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : prod.stockCount <= 5 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-emerald-700 dark:text-emerald-400 font-bold'}>{prod.stockCount} قطعة</span> • الصنعة: {prod.specifications?.craftsmanship || 'يدوية'}
                        </p>
                        <p className="text-[11px] text-black/50 dark:text-white/50">
                          تاريخ الإدراج: {prod.createdAt} • المحافظة: {prod.sellerGovernorate}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/10 dark:border-white/10 w-full md:w-auto">
                      {/* Quick stock adjustment button */}
                      <button
                        type="button"
                        onClick={() => openStockModal(prod)}
                        className="px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs font-bold flex items-center gap-1.5 border border-black/10 dark:border-white/10 cursor-pointer transition-colors"
                        title="تعديل المخزون المتاح"
                      >
                        <Boxes className="w-3.5 h-3.5 text-[#9a6a35]" />
                        <span>تعديل المخزون ({prod.stockCount})</span>
                      </button>

                      {/* If Draft or Rejected, allow submitting to review */}
                      {(prod.approvalStatus === 'draft' || prod.approvalStatus === 'rejected') && (
                        <button
                          type="button"
                          onClick={() => handleSubmitForReview(prod.id)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                          title="إرسال للمراجعة والاعتماد"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>إرسال للمراجعة</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openEditProductModal(prod)}
                        className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] border border-black/10 dark:border-white/10 transition-colors cursor-pointer"
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
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* If product was rejected by Admin, show rejection reason box */}
                  {prod.approvalStatus === 'rejected' && prod.rejectionReason && (
                    <div className="mt-3 p-3 bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-900 dark:text-rose-200 font-bold">
                        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span>سبب الرفض المسجل من إدارة المنصة:</span>
                      </div>
                      <p className="text-rose-800 dark:text-rose-300 text-xs pr-5 leading-relaxed">{prod.rejectionReason}</p>
                      <div className="pt-1 pr-5">
                        <button
                          type="button"
                          onClick={() => openEditProductModal(prod)}
                          className="text-[11px] font-bold text-rose-900 dark:text-rose-200 underline hover:text-rose-950 dark:hover:text-rose-100 cursor-pointer"
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
              <span className={`text-2xl font-black font-mono ${lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {lowStockCount} منتجات
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block mt-1">مخزون أقل من 5 قطع</span>
            </div>

            <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
              <span className="text-xs text-black/60 dark:text-white/60 block mb-1 font-medium">قطع نفذت بالكامل</span>
              <span className={`text-2xl font-black font-mono ${outOfStockCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-black/40 dark:text-white/40'}`}>
                {outOfStockCount} منتج
              </span>
              <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold block mt-1">تحتاج إنتاج دفعة جديدة بالورشة</span>
            </div>
          </div>

          {/* Real Inventory Table with instant stock adjustment */}
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

            {/* Desktop Table View */}
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
                  {sellerProducts.map((prod) => {
                    const isOutOfStock = prod.stockCount === 0;
                    const isLow = prod.stockCount > 0 && prod.stockCount <= 5;
                    return (
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
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#211d18] dark:text-[#f5f0e7]">{prod.stockCount}</span>
                            <span className="text-[10px] text-black/50 dark:text-white/50">قطعة</span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 bg-rose-500/15 text-rose-800 dark:text-rose-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                              <AlertCircle className="w-3 h-3" />
                              <span>نفذ من المخزن</span>
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-900 dark:text-amber-200 font-bold px-2 py-0.5 rounded-full text-[10px]">
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
                  <div key={prod.id} className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 space-y-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80'}
                        alt={prod.title}
                        className="w-12 h-12 rounded-xl object-cover border border-black/10 dark:border-white/10 shrink-0 shadow-xs"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs text-[#211d18] dark:text-[#f5f0e7] block truncate">{prod.title}</span>
                        <span className="text-[11px] text-black/60 dark:text-white/60 block">
                          {prod.categoryName} • <strong className="text-[#9a6a35] font-mono">{prod.price} ج.م</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-black/60 dark:text-white/60">الرصيد:</span>
                        <span className="font-mono font-bold text-sm text-[#211d18] dark:text-[#f5f0e7]">{prod.stockCount} قطعة</span>
                        {isOutOfStock ? (
                          <span className="bg-rose-500/15 text-rose-800 dark:text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full">نفذ</span>
                        ) : isLow ? (
                          <span className="bg-amber-500/15 text-amber-900 dark:text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">منخفض</span>
                        ) : (
                          <span className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">متوفر</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => openStockModal(prod)}
                        className="px-3.5 py-1.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-xs min-h-[36px] flex items-center gap-1 cursor-pointer transition-colors"
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
          <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-lg backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-xl text-[#211d18] dark:text-[#f5f0e7] flex items-center gap-2 font-serif">
                  <History className="w-5 h-5 text-[#9a6a35]" />
                  <span>سجل حركات وتوريدات المخزن (Audit Trail)</span>
                </h3>
                <p className="text-xs text-black/60 dark:text-white/60 mt-1 font-medium">توثيق دقيق لكل عملية بيع أو إنتاج يدوي أو تسوية جردية</p>
              </div>
            </div>

            <div className="space-y-2">
              {stockMovements.length === 0 ? (
                <div className="p-6 text-center text-xs text-black/50 dark:text-white/50 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-dashed border-black/10 dark:border-white/10">
                  لا توجد حركات مسجلة مؤخراً. سيتم تدوين العمليات فور تعديل الرصيد أو البيع.
                </div>
              ) : (
                stockMovements.slice(0, 10).map((mov, idx) => (
                  <div
                    key={mov.id || idx}
                    className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${mov.type === 'STOCK_ADDED' ? 'bg-emerald-500' : mov.type === 'ORDER_SOLD' ? 'bg-blue-500' : 'bg-amber-500'
                        }`} />
                      <div>
                        <span className="font-bold text-[#211d18] dark:text-[#f5f0e7]">{mov.productTitle || 'منتج بالورشة'}</span>
                        <span className="text-black/60 dark:text-white/60 block text-[11px] mt-0.5">
                          السبب: {mov.reason} • القائم بالعملية: {mov.actorName || 'الحرفي'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center font-mono">
                      <div className="text-right">
                        <span className="text-black/50 dark:text-white/50 text-[10px] block">الرصيد السابق ← الجديد</span>
                        <span className="font-bold text-[#211d18] dark:text-[#f5f0e7]">
                          {mov.previousStock} ← <strong className="text-[#9a6a35]">{mov.newStock}</strong>
                        </span>
                      </div>
                      <span className={`font-bold px-2.5 py-1 rounded-full text-xs ${mov.quantity >= 0 ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300' : 'bg-rose-500/15 text-rose-800 dark:text-rose-300'
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
                        المشتري: <strong>{ord.shippingAddress?.fullName || (ord.shippingAddress as any)?.buyerName || ord.buyerName}</strong> (
                        {ord.shippingAddress?.phone || (ord.shippingAddress as any)?.buyerPhone || ord.buyerPhone})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-black/60 dark:text-white/60 font-medium">تحديث الحالة:</span>
                      <select
                        value={ord.status}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className="px-3 py-1.5 bg-white/80 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold text-[#9a6a35] outline-none cursor-pointer focus:border-[#9a6a35]"
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

                  <div className="text-xs text-[#211d18] dark:text-[#f5f0e7] flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold">العنوان:</span> {ord.shippingAddress?.governorate || 'المحافظة'} - {ord.shippingAddress?.city || 'المدينة'} ({ord.shippingAddress?.streetAddress || (ord.shippingAddress as any)?.address || 'العنوان'})
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
                  خصص صورة الغلاف وشعار ورشتكم والبيانات التعريفية. تظهر هذه الصورة في صدارة بطاقة ورشتكم بقسم
                  <strong className="text-[#211d18] dark:text-[#f5f0e7] font-bold mx-1">"الورش والتعاونيات الحرفية المعتمدة"</strong>
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
                  className="px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-[#9a6a35]" />
                  <span>مشاهدة قسم الورش بالمنصة</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Cover Selection & Settings Form (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Cover Image Selector Box */}
              <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-lg backdrop-blur-xl space-y-5">
                <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#9a6a35]/10 text-[#9a6a35] flex items-center justify-center">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#211d18] dark:text-[#f5f0e7]">اختيار وتحديث صورة الغلاف</h4>
                      <p className="text-[11px] text-black/60 dark:text-white/60">اختر من المعرض التراثي المعتمد أو ارفع صورة خاصة لورشتك</p>
                    </div>
                  </div>

                  {sellerCoverImage && (
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>تم تعيين الغلاف</span>
                    </span>
                  )}
                </div>

                {/* Cover Picker Tabs */}
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
                    <span>المعرض التراثي ({cloudImages.length})</span>
                  </button>
                  {coverPickerTab === 'presets' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-black/60 dark:text-white/60 font-medium">
                          اختر من أحدث صورك المرفوعة على سحابة Cloudinary:
                        </p>
                        {isLoadingCloudImages && (
                          <span className="text-xs text-[#9a6a35] flex items-center gap-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>جاري جلب الصور من الكلاود...</span>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-1">
                        {cloudImages.length === 0 && !isLoadingCloudImages ? (
                          <p className="col-span-full text-center text-xs text-black/50 py-6">
                            لم يتم العثور على صور مخزنة في حساب Cloudinary أو تأكد من إعدادات الـ API.
                          </p>
                        ) : (
                          cloudImages.map((preset) => {
                            const isSelected = sellerCoverImage === preset.url;
                            return (
                              <button
                                type="button"
                                key={preset.id}
                                onClick={() => handleSelectPresetCover(preset.url, preset.title)}
                                className={`group relative rounded-2xl overflow-hidden border-2 text-right transition-all cursor-pointer ${isSelected
                                    ? 'border-[#9a6a35] ring-2 ring-[#9a6a35]/30 shadow-md scale-[1.02]'
                                    : 'border-black/10 dark:border-white/10 hover:border-[#9a6a35]/60'
                                  }`}
                              >
                                <div className="h-24 w-full relative overflow-hidden bg-black/10 dark:bg-white/10">
                                  <img
                                    src={preset.url}
                                    alt={preset.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                  {isSelected && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#9a6a35] text-white rounded-full flex items-center justify-center shadow-xs">
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    </div>
                                  )}
                                  <div className="absolute bottom-1.5 right-2 left-2 text-white">
                                    <span className="text-[10px] font-black text-amber-200 block truncate drop-shadow-xs">
                                      {preset.title}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
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

                {/* TAB 1: CURATED PRESETS GALLERY */}
                {coverPickerTab === 'presets' && (
                  <div className="space-y-3">
                    <p className="text-xs text-black/60 dark:text-white/60 font-medium">
                      اختر صورة غلاف موثقة وعالية الجودة تمثل طابع حرفتكم التراثية بالصعيد:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {cloudImages.map((preset) => {
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
                            <div className="h-24 w-full relative overflow-hidden bg-black/10 dark:bg-white/10">
                              <img
                                src={preset.url}
                                alt={preset.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                              {/* Selected Checkmark Badge */}
                              {isSelected && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-[#9a6a35] text-white rounded-full flex items-center justify-center shadow-xs">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}

                              <div className="absolute bottom-1.5 right-2 left-2 text-white">
                                <span className="text-[9px] font-bold block truncate drop-shadow-xs">
                                  {preset.title}
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
                      className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${isUploadingCover
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-black/10 dark:border-white/10 hover:border-[#9a6a35] bg-black/[0.02] dark:bg-white/[0.02]'
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
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-300 animate-spin">
                            <Loader2 className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-[#211d18] dark:text-[#f5f0e7] block">جاري رفع وحفظ صورة الغلاف...</span>
                            <span className="text-xs text-black/60 dark:text-white/60">يتم معالجة الصورة السحابية بدقة عالية</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-[#9a6a35]/10 text-[#9a6a35] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-[#211d18] dark:text-[#f5f0e7] block mb-1">
                              انقر هنا لاختيار صورة الغلاف من جهازك
                            </span>
                            <span className="text-xs text-black/60 dark:text-white/60 block">
                              الصيغ المدعومة: JPG, PNG, WebP (الحجم الأقصى: 5 ميجابايت)
                            </span>
                          </div>
                          <span className="px-5 py-2 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-md transition-colors">
                            تصفح الملفات
                          </span>
                        </>
                      )}
                    </label>

                    {coverUploadError && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{coverUploadError}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: CUSTOM IMAGE URL */}
                {coverPickerTab === 'url' && (
                  <form onSubmit={handleApplyCoverUrl} className="space-y-3">
                    <p className="text-xs text-black/60 dark:text-white/60 font-medium">
                      إذا كانت لديك صورة مرفوعة مسبقاً على الإنترنت، يمكنك لصق الرابط المباشر هنا:
                    </p>
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
                        className="px-5 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shrink-0 transition-colors shadow-md cursor-pointer"
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
              <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-lg backdrop-blur-xl space-y-5">
                <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-[#9a6a35]/10 text-[#9a6a35] flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#211d18] dark:text-[#f5f0e7]">البيانات الرسمية وهوية المتجر</h4>
                    <p className="text-[11px] text-black/60 dark:text-white/60">تعديل اسم الورشة، المحافظة، التخصص، وبيانات الحساب</p>
                  </div>
                </div>

                <form onSubmit={handleSaveWorkshopProfile} className="space-y-4">
                  {/* Workshop Logo / Avatar */}
                  <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white dark:border-stone-800 shadow-xs bg-gray-100 dark:bg-stone-800 shrink-0 relative">
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
                        <span className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] block">شعار الورشة / صورة الحرفي</span>
                        <span className="text-[11px] text-black/60 dark:text-white/60 block">تظهر في الدائرة الصغيرة على بطاقة الورشة</span>
                      </div>
                    </div>

                    <label
                      htmlFor="seller-avatar-upload"
                      className="px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs shrink-0"
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
                        التخصص الحرفي الأصيل
                      </label>
                      <input
                        type="text"
                        value={sellerSpecialty}
                        onChange={(e) => setSellerSpecialty(e.target.value)}
                        placeholder="مثال: فخار نيلي، تلي أسيوط، كليم أخميم"
                        className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">
                      نبذة عن تاريخ الورشة وأصالة الصنعة
                    </label>
                    <textarea
                      rows={3}
                      value={sellerBio}
                      onChange={(e) => setSellerBio(e.target.value)}
                      placeholder="اكتب نبذة تراثية تجذب المشترين وتعرفهم بتاريخ ورشتكم في الصعيد..."
                      className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35] leading-relaxed"
                    />
                  </div>

                  <div className="border-t border-black/10 dark:border-white/10 pt-4 space-y-3">
                    <h4 className="font-bold text-xs text-[#211d18] dark:text-[#f5f0e7]">إعدادات استلام المستحقات المالية</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">طريقة التسوية المفضلة</label>
                        <select
                          value={sellerPayoutMethod}
                          onChange={(e) => setSellerPayoutMethod(e.target.value as any)}
                          className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35] cursor-pointer"
                        >
                          <option value="vodafone_cash">فودافون كاش / محافظ الكترونية</option>
                          <option value="instapay">شبكة المدفوعات اللحظية InstaPay</option>
                          <option value="bank_transfer">تحويل بنكي مباشر</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">رقم الحساب أو عنوان IPA</label>
                        <input
                          type="text"
                          value={sellerPayoutAccount}
                          onChange={(e) => setSellerPayoutAccount(e.target.value)}
                          className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-4">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-6 py-3 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
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

                    <span className="text-[11px] text-black/60 dark:text-white/60 font-medium">
                      يتم تحديث بطاقة الورشة فوراً في الصفحة الرئيسية
                    </span>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Live Interactive Card Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="sticky top-6 space-y-4">
                <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] p-6 text-[#211d18] dark:text-[#f5f0e7] shadow-xl space-y-4 border border-black/10 dark:border-white/10 backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#9a6a35]" />
                      <h4 className="font-bold text-sm text-[#211d18] dark:text-[#f5f0e7]">معاينة حية ومباشرة</h4>
                    </div>
                    <span className="text-[10px] bg-[#9a6a35]/15 text-[#9a6a35] font-bold px-2 py-0.5 rounded-full border border-[#9a6a35]/20">
                      قسم الورش المعتمدة
                    </span>
                  </div>

                  <p className="text-[11px] text-black/60 dark:text-white/60 leading-relaxed font-medium">
                    هكذا تظهر بطاقة ورشتكم للمشترين في قسم
                    <strong className="text-[#211d18] dark:text-[#f5f0e7] font-bold mx-1">"الورش والتعاونيات الحرفية المعتمدة"</strong>
                    بالصفحة الرئيسية ودليل الحرفيين:
                  </p>

                  {/* The Exact Realistic Card from FeaturedSellers.tsx */}
                  <div className="bg-white/90 dark:bg-[#151513] rounded-3xl border border-black/10 dark:border-white/10 overflow-hidden shadow-lg group transition-all text-[#211d18] dark:text-[#f5f0e7]">
                    {/* Workshop Cover Banner */}
                    <div className="h-44 relative overflow-hidden bg-black/10 dark:bg-white/10">
                      <img
                        src={sellerCoverImage}
                        alt={brandName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Governorate Badge */}
                      <div className="absolute top-3 right-3 bg-white/90 dark:bg-[#151513]/90 backdrop-blur-xs text-[#211d18] dark:text-[#f5f0e7] text-[11px] font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1 border border-black/10 dark:border-white/10">
                        <MapPin className="w-3 h-3 text-[#9a6a35]" />
                        <span>محافظة {sellerGovernorate}</span>
                      </div>

                      {/* Verified Badge */}
                      <div className="absolute top-3 left-3 bg-[#9a6a35] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>مُعتمد</span>
                      </div>

                      {/* Workshop Avatar Overlap */}
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

                    {/* Card Content Details */}
                    <div className="p-5 pt-8 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-base text-[#211d18] dark:text-[#f5f0e7] font-serif group-hover:text-[#9a6a35] transition-colors">
                            {brandName}
                          </h4>
                          <span className="inline-block text-[11px] font-bold text-[#9a6a35] bg-[#9a6a35]/10 px-2 py-0.5 rounded-md mt-1 border border-[#9a6a35]/20">
                            {sellerSpecialty || 'حرفة يدوية تراثية أصيلة'}
                          </span>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-bold shrink-0 border border-amber-500/20">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>4.9</span>
                        </div>
                      </div>

                      {/* Bio text */}
                      <p className="text-xs text-black/60 dark:text-white/60 line-clamp-2 leading-relaxed">
                        {sellerBio || 'ورشة تراثية متخصصة في الحرف اليدوية الصعيدية الأصيلة بجودة ممتازة.'}
                      </p>

                      {/* Card Footer */}
                      <div className="border-t border-black/10 dark:border-white/10 pt-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-black/60 dark:text-white/60">
                          <Package className="w-4 h-4 text-[#9a6a35]" />
                          <span className="font-semibold">{sellerProducts.length} قطعة معروضة</span>
                        </div>

                        <span className="text-[#9a6a35] font-bold text-xs flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
                          <span>زيارة المتجر</span>
                          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Helper Callout */}
                  <div className="p-3.5 bg-black/[0.03] dark:bg-white/[0.03] rounded-2xl border border-black/10 dark:border-white/10 flex items-start gap-2.5 text-[11px] text-black/70 dark:text-white/70">
                    <Info className="w-4 h-4 text-[#9a6a35] shrink-0 mt-0.5" />
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
          <div className="relative rounded-[2rem] bg-gradient-to-r from-[#211d18] via-[#2e261f] to-[#211d18] text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-black/10 dark:border-white/10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#9a6a35]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[#d5a56d] text-xs font-bold border border-white/15">
                  <Film className="w-4 h-4 text-[#d5a56d]" />
                  <span>فيديوهات ورشة الصنعة القصيرة • Shoppable Craft Reels</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black font-serif tracking-tight">
                  سجّل كواليس الصنعة واجعل الزبائن يشترون مباشرة من الفيديو!
                </h2>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
                  ارفع مقاطع فيديو عمودية (9:16) تبرز خطوات تشكيل الطين، نسج النول، أو نقش النحاس. يرتبط كل مقطع بمنتج معروض في ورشتك للشراء الفوري.
                </p>
              </div>

              <button
                type="button"
                id="seller-upload-reel-main-btn"
                onClick={() => setIsReelUploadOpen(true)}
                className="px-6 py-3.5 bg-white text-black hover:bg-[#9a6a35] hover:text-white text-xs sm:text-sm font-bold rounded-2xl shadow-xl flex items-center gap-2.5 transition-all hover:scale-105 shrink-0 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span>رفع فيديو جديد للورشة (Craft Reel)</span>
              </button>
            </div>
          </div>

          {/* 4 Reels Key Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
              <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 mb-2 font-medium">
                <span>إجمالي المقاطع المنشورة</span>
                <div className="w-8 h-8 rounded-xl bg-[#9a6a35]/10 flex items-center justify-center">
                  <Film className="w-4 h-4 text-[#9a6a35]" />
                </div>
              </div>
              <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">{reels.length} فيديو</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">معروضة للجمهور بالرئيسية وصفحة الريلز</span>
            </div>

            <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
              <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 mb-2 font-medium">
                <span>إجمالي المشاهدات التفاعلية</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">
                {reels.reduce((acc, r) => acc + r.viewsCount, 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">
                {reels.length > 0 ? `${reels.length} مقطع موثق للورشة` : 'مقاطع مرئية وتوثيق حي'}
              </span>
            </div>

            <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
              <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 mb-2 font-medium">
                <span>الإعجابات ودعم الحرفة</span>
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                </div>
              </div>
              <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">
                {reels.reduce((acc, r) => acc + r.likesCount, 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-black/60 dark:text-white/60 block mt-1">تفاعل مباشر من عشاق التراث</span>
            </div>

            <div className="bg-white/75 dark:bg-[#151513]/90 p-5 rounded-[1.5rem] border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
              <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 mb-2 font-medium">
                <span>تحويلات الشراء المباشر</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <span className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] font-mono">
                {reels.reduce((acc, r) => acc + r.sharesCount, 0) * 3} نقرة شراء
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">مبيعات من خلال زر الشراء بالفيديو</span>
            </div>
          </div>

          {/* Reels Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xl font-black text-[#211d18] dark:text-[#f5f0e7] flex items-center gap-2 font-serif">
                <Film className="w-5 h-5 text-[#9a6a35]" />
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
                  className="text-xs font-bold text-[#9a6a35] hover:underline flex items-center gap-1 cursor-pointer"
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
                    className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col group backdrop-blur-xl"
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
                        <span className="bg-[#9a6a35] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
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
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-black/[0.02] dark:bg-white/[0.02]">
                      {/* Linked Product Quick View */}
                      <div className="p-2.5 bg-white/80 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10 flex items-center justify-between gap-2 shadow-2xs">
                        <img
                          src={reel.productImage}
                          alt={reel.productTitle}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-black/10 dark:border-white/10"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-[#211d18] dark:text-[#f5f0e7] truncate">{reel.productTitle}</p>
                          <span className="text-xs font-black font-mono text-[#9a6a35]">{reel.productPrice} ج.م</span>
                        </div>
                      </div>

                      {/* Engagement Stats & Cloud DB Status */}
                      <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60 pt-1">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[11px]">
                            <Eye className="w-3.5 h-3.5 text-black/40 dark:text-white/40" />
                            <span>{reel.viewsCount}</span>
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-rose-600 font-bold">
                            <Heart className="w-3.5 h-3.5 fill-rose-600" />
                            <span>{reel.likesCount}</span>
                          </span>
                        </div>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
                          قاعدة البيانات ✓
                        </span>
                      </div>

                      {/* Actions Buttons (Seller Full Control over own video) */}
                      <div className="flex items-center gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReelPreviewId(reel.id);
                            setIsReelPreviewOpen(true);
                          }}
                          className="flex-1 py-2 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>مشاهدة المقطع</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSellerEditingReel(reel);
                            setIsSellerReelEditOpen(true);
                          }}
                          className="p-2 text-[#211d18] dark:text-[#f5f0e7] hover:text-[#9a6a35] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer border border-black/10 dark:border-white/10"
                          title="تعديل بيانات الفيديو والمنتج المربوط"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteReel(reel.id, reel.title)}
                          className="p-2 text-rose-600 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer border border-transparent"
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
              <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] p-12 text-center border border-black/10 dark:border-white/10 space-y-4 backdrop-blur-xl">
                <Film className="w-16 h-16 text-black/20 dark:text-white/20 mx-auto" />
                <h4 className="text-base font-bold text-[#211d18] dark:text-[#f5f0e7]">لم تقم برفع أي فيديوهات لورشتك بعد</h4>
                <p className="text-xs text-black/60 dark:text-white/60 max-w-md mx-auto">
                  فيديوهات كواليس الصنع اليدوي تزيد من ثقة الزبائن ومبيعات المنتجات بنسبة تفوق 300%. ابدأ برفع أول فيديو الآن!
                </p>
                <button
                  type="button"
                  onClick={() => setIsReelUploadOpen(true)}
                  className="px-6 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
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
        <div className="bg-white/80 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-2 sm:p-4 shadow-lg">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white/95 dark:bg-[#151513]/95 rounded-[2rem] border border-black/10 dark:border-white/10 max-w-md w-full p-6 space-y-4 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <div>
                <h3 className="font-black text-lg text-[#211d18] dark:text-[#f5f0e7] font-serif">تعديل رصيد المخزون</h3>
                <p className="text-xs text-black/60 dark:text-white/60 mt-0.5 font-medium">{stockTargetProduct.title}</p>
              </div>
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
                    className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-lg font-bold text-[#211d18] dark:text-[#f5f0e7] flex items-center justify-center cursor-pointer border border-black/10 dark:border-white/10"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newStockValue}
                    onChange={(e) => setNewStockValue(Number(e.target.value))}
                    className="flex-1 p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-center text-base font-bold font-mono outline-none focus:border-[#9a6a35]"
                  />
                  <button
                    type="button"
                    onClick={() => setNewStockValue((prev) => prev + 1)}
                    className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-lg font-bold text-[#211d18] dark:text-[#f5f0e7] flex items-center justify-center cursor-pointer border border-black/10 dark:border-white/10"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">سبب التعديل أو رقم الدفعة *</label>
                <select
                  value={stockAdjustmentReason}
                  onChange={(e) => setStockAdjustmentReason(e.target.value)}
                  className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35] cursor-pointer"
                >
                  <option value="إنتاج دفعة جديدة بالورشة">إنتاج دفعة جديدة بالورشة (+)</option>
                  <option value="حرق دفعة فخار جديدة في الفرن">حرق دفعة فخار جديدة في الفرن (+)</option>
                  <option value="جرد دوري للمخزن">جرد دوري وتصحيح رصيد</option>
                  <option value="تلف أو كسر بالورشة">تلف أو كسر بالورشة (-)</option>
                  <option value="بيع مباشر خارج المنصة">بيع مباشر من المعرض (-)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStock}
                  className="px-5 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-md disabled:opacity-50 cursor-pointer transition-colors"
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
                  placeholder="مثال: قلة قناوية فخار مسامية أصلية"
                  className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">التصنيف التراثي *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35] cursor-pointer"
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
                    className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35] cursor-pointer"
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
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">السعر (ج.م) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">السعر قبل الخصم</label>
                  <input
                    type="number"
                    min={0}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">المخزون المتاح</label>
                  <input
                    type="number"
                    min={0}
                    value={stockCount}
                    onChange={(e) => setStockCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">الخامات الطبيعية المستخدمة</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="مثال: طمي نيل معتق وخيوط قطنية"
                    className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">أسلوب الصنعة اليدوية</label>
                  <input
                    type="text"
                    value={craftsmanship}
                    onChange={(e) => setCraftsmanship(e.target.value)}
                    placeholder="مثال: نسج نول يدوي أصيل"
                    className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                  />
                </div>
              </div>

              {/* Arabic Product Images Upload Section (Cloudinary Integration) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]">
                    صور المنتج *
                    <span className="text-[10px] text-black/60 dark:text-white/60 font-normal mr-2">
                      (الحد الأقصى 5 صور - JPG, PNG, WebP حتى 5 ميجابايت)
                    </span>
                  </label>
                  <span className="text-xs text-black/60 dark:text-white/60 font-mono">
                    {selectedImages.length + existingImages.length} / 5
                  </span>
                </div>

                {uploadError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
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
                        className="relative group rounded-xl overflow-hidden border-2 border-black/10 dark:border-white/10 aspect-square bg-black/5 dark:bg-white/5 shadow-xs"
                      >
                        <img src={url} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setExistingImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 left-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
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
                        className="relative group rounded-xl overflow-hidden border-2 border-[#9a6a35] aspect-square bg-black/5 dark:bg-white/5 shadow-xs"
                      >
                        <img src={img.dataUri} alt={img.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setSelectedImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 left-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
                          title="إلغاء التحديد"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-[#9a6a35] text-white text-[9px] rounded font-bold">
                          جديدة
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button & File Input */}
                {selectedImages.length + existingImages.length < 5 && (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-black/10 dark:border-white/10 hover:border-[#9a6a35] bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl p-5 cursor-pointer transition-colors text-center group">
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileSelect}
                      className="hidden"
                      id="product-image-file-input"
                    />
                    <div className="w-10 h-10 rounded-full bg-[#9a6a35]/10 group-hover:bg-[#9a6a35]/20 flex items-center justify-center text-[#9a6a35] mb-1.5 transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] block">
                      رفع الصور
                    </span>
                    <span className="text-[10px] text-black/50 dark:text-white/50 block mt-0.5 font-medium">
                      اضغط لاختيار صور عالية الدقة من جهازك
                    </span>
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">وصف أصالة القطعة وقصتها</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="صف مراحل التصنيع بالورشة وفوائد القطعة التراثية..."
                  className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                />
              </div>

              {/* Section 3: Review & Submission Notice */}
              <div className="p-4 bg-[#9a6a35]/10 dark:bg-[#9a6a35]/15 border border-[#9a6a35]/30 rounded-2xl text-xs space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-sm text-[#9a6a35]">
                  <Sparkles className="w-4 h-4 text-[#9a6a35]" />
                  <span>مراجعة واعتماد المنتج</span>
                </p>
                <p className="leading-relaxed text-black/70 dark:text-white/70">
                  بعد إرسال المنتج سيتم مراجعته من الإدارة قبل ظهوره في المتجر.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-3 text-xs sm:text-sm font-bold text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  id="submit-product-review-btn"
                  disabled={isSubmitting || isUploadingImages}
                  className="px-7 py-3 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs sm:text-sm font-bold rounded-2xl shadow-md flex items-center gap-2 disabled:opacity-50 transition-colors cursor-pointer"
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
                  max={4850}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">وسيلة التحويل</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value as any)}
                  className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35] cursor-pointer"
                >
                  <option value="vodafone_cash">فودافون كاش (Vodafone Cash)</option>
                  <option value="instapay">إنستاباي (InstaPay IPA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">رقم المحفظة / عنوان إنستاباي</label>
                <input
                  type="text"
                  required
                  value={payoutNumber}
                  onChange={(e) => setPayoutNumber(e.target.value)}
                  className="w-full p-2.5 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-xl text-xs outline-none focus:border-[#9a6a35]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
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
