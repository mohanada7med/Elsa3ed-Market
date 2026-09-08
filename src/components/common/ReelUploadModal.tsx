import React, { useState, useRef, useEffect } from 'react';
import { CraftReel, Governorate, Product } from '../../types.ts';
import { craftReelsService, HERITAGE_VIDEO_PRESETS } from '../../services/craftReelsService.ts';
import { api } from '../../services/api.ts';
import { useApp } from '../../context/AppContext.tsx';
import { VideoUploadProgress } from './VideoUploadProgress.tsx';

import {
  Film,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Play,
  Pause,
  X,
  Check,
  Music,
  ShoppingBag,
  Store,
  MapPin,
  Tag,
  Image as ImageIcon,
  AlertCircle,
  Eye,
  Trash2,
  Layers,
  ChevronRight,
  Lock,
  LogIn,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newReel: CraftReel) => void;
  sellerId?: string;
  sellerName?: string;
  artisanName?: string;
  artisanAvatar?: string;
  defaultGovernorate?: Governorate;
  sellerProducts?: Product[];
  currentUser?: { id?: string; role?: string; sellerId?: string; name?: string; avatar?: string };
  allSellers?: any[];
}

export const ReelUploadModal: React.FC<ReelUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  sellerId,
  sellerName,
  artisanName: initialArtisanName,
  artisanAvatar: initialArtisanAvatar,
  defaultGovernorate = 'قنا',
  sellerProducts = [],
  currentUser,
  allSellers = []
}) => {
  const { setIsAuthModalOpen, setAuthModalTab, setActivePage } = useApp();

  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');
  const [sourceType, setSourceType] = useState<'upload' | 'url' | 'preset'>('upload');
  
  // Video Source State
  const [videoUrl, setVideoUrl] = useState('');
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState<string | undefined>(undefined);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [duration, setDuration] = useState('0:30');
  
  // Poster State
  const [posterUrl, setPosterUrl] = useState('');
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);

  // Content Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [governorate, setGovernorate] = useState<Governorate>(defaultGovernorate);
  const [location, setLocation] = useState('');
  const [contentType, setContentType] = useState<string>('places');
  const [craftType, setCraftType] = useState('حرف وصناعات');
  const [artisanName, setArtisanName] = useState(initialArtisanName || 'صانع محتوى صعيدي');
  const [workshopName, setWorkshopName] = useState(sellerName || 'حكايات الصعيد');
  const [artisanAvatar, setArtisanAvatar] = useState(
    initialArtisanAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  );
  const [hashtagsStr, setHashtagsStr] = useState('#الصعيد, #وه_Stories, #حكايات_الصعيد');
  const [musicTrack, setMusicTrack] = useState('');

  // Linked Product State (COMPLETELY OPTIONAL)
  const [selectedProductId, setSelectedProductId] = useState<string>('none');
  const [productTitle, setProductTitle] = useState('');
  const [productPrice, setProductPrice] = useState<number>(350);
  const [productOriginalPrice, setProductOriginalPrice] = useState<number>(450);
  const [productImage, setProductImage] = useState('');
  const [productRating, setProductRating] = useState(4.9);

  // Preview video player
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const posterInputRef = useRef<HTMLInputElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Authorization Check: Only seller and admin can upload
  const isUnauthorized = !currentUser || (currentUser.role !== 'seller' && currentUser.role !== 'admin');

  // Sync when product selection changes
  useEffect(() => {
    if (selectedProductId && selectedProductId !== 'custom' && selectedProductId !== 'none') {
      const prod = sellerProducts.find((p) => p.id === selectedProductId);
      if (prod) {
        setProductTitle(prod.title);
        setProductPrice(prod.price);
        setProductOriginalPrice(prod.originalPrice || Math.round(prod.price * 1.25));
        setProductImage(prod.images?.[0] || '');
        setProductRating(prod.rating || 4.8);
        if (prod.sellerGovernorate) {
          setGovernorate(prod.sellerGovernorate as Governorate);
        }
      }
    } else if (selectedProductId === 'none') {
      setProductTitle('');
      setProductImage('');
    }
  }, [selectedProductId, sellerProducts]);

  const generatePosterFromVideo = (videoSrc: string, directThumbnail?: string) => {
    if (directThumbnail) {
      setPosterUrl(directThumbnail);
      setIsGeneratingPoster(false);
      return;
    }

    // If it's a Cloudinary video URL, instantly derive standard Cloudinary poster JPG URL (zero memory, zero latency)
    if (videoSrc.includes('res.cloudinary.com')) {
      const cldPoster = videoSrc.includes('/video/upload/')
        ? videoSrc.replace('/video/upload/', '/video/upload/so_1.0/').replace(/\.[^/.]+$/, '.jpg')
        : videoSrc.replace(/\.[^/.]+$/, '.jpg');
      setPosterUrl(cldPoster);
      setIsGeneratingPoster(false);
      return;
    }

    setIsGeneratingPoster(true);
    const video = document.createElement('video');
    video.src = videoSrc;
    video.crossOrigin = 'anonymous';
    video.currentTime = 1.0; // 1 second in

    video.onloadeddata = () => {
      // Calculate formatted duration
      if (video.duration && !isNaN(video.duration)) {
        const mins = Math.floor(video.duration / 60);
        const secs = Math.floor(video.duration % 60);
        setDuration(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 720;
        canvas.height = video.videoHeight || 1280;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPosterUrl(dataUrl);
        }
      } catch (err) {
        console.warn('Could not auto-generate poster snapshot', err);
      } finally {
        setIsGeneratingPoster(false);
      }
    };

    video.onerror = () => {
      setIsGeneratingPoster(false);
    };
  };

  const handleCustomPosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPosterFile(file);
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      if (loadEvt.target?.result) {
        setPosterUrl(loadEvt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: typeof HERITAGE_VIDEO_PRESETS[0]) => {
    setVideoUrl(preset.videoUrl);
    setCloudinaryPublicId(undefined);
    setPosterUrl(preset.posterUrl);
    setDuration(preset.duration);
    setCraftType(preset.craftType);
    setGovernorate(preset.governorate as Governorate);
    setTitle(preset.title);
    setMusicTrack(preset.musicTrack);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUploadingVideo) {
      setErrorMsg('جاري رفع الفيديو إلى السحابة، يرجى الانتظار حتى اكتمال الرفع');
      return;
    }

    if (!videoUrl || !videoUrl.trim()) {
      setErrorMsg('يرجى تحديد أو رفع مقطع فيديو صالح أولاً');
      return;
    }

    if (videoUrl.trim().startsWith('blob:')) {
      setErrorMsg('لا يمكن حفظ رابط مؤقت (blob:). يرجى التأكد من اكتمال الرفع السحابي للفيديو.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('يرجى كتابة عنوان جذاب لمقطع الفيديو');
      return;
    }

    const hasProduct = selectedProductId !== 'none';
    if (hasProduct && selectedProductId === 'custom' && !productTitle.trim()) {
      setErrorMsg('يرجى كتابة اسم المنتج المرتبط أو اختيار "بدون ربط بمنتج"');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const hashtags = hashtagsStr
      .split(/[,،\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const effectivePoster =
      posterUrl ||
      productImage ||
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80';

    try {
      const userParam = (currentUser as any) || {
        id: sellerId || 'seller-current',
        role: (currentUser as any)?.role || 'seller',
        sellerId: sellerId || (currentUser as any)?.sellerId,
        name: artisanName
      };

      const createdReel = await craftReelsService.addReelAsync(userParam, {
        title: title.trim(),
        artisanName,
        artisanAvatar,
        workshopName,
        sellerId: sellerId || currentUser?.sellerId || `seller-${Date.now()}`,
        governorate,
        location: location.trim() || governorate,
        contentType: contentType || 'places',
        craftType: craftType || 'الصعيد',
        videoUrl: videoUrl.trim(),
        cloudinaryPublicId: cloudinaryPublicId,
        resourceType: 'video',
        posterUrl: effectivePoster,
        duration: duration || '0:30',
        productId: hasProduct ? (selectedProductId === 'custom' ? `prod-${Date.now()}` : selectedProductId) : undefined,
        productTitle: hasProduct ? productTitle.trim() : undefined,
        productPrice: hasProduct ? (Number(productPrice) || 0) : undefined,
        productOriginalPrice: hasProduct ? (Number(productOriginalPrice) || Math.round(Number(productPrice) * 1.2)) : undefined,
        productImage: hasProduct ? (productImage || effectivePoster) : undefined,
        productRating: hasProduct ? productRating : undefined,
        inStock: hasProduct ? true : undefined,
        description: description.trim() || title.trim(),
        hashtags: hashtags.length > 0 ? hashtags : ['#الصعيد', '#وه_Stories'],
        musicTrack: musicTrack.trim() || undefined,
        isVerifiedArtisan: true
      });

      setIsSubmitting(false);
      onSuccess(createdReel);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'حدث خطأ أثناء حفظ الفيديو، يرجى المحاولة مرة أخرى.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-white dark:bg-[#261E19] rounded-2xl sm:rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden my-2 sm:my-6 max-h-[94vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-black/5 via-white/80 to-black/5 dark:from-[#151513] dark:via-[#1c1c19] dark:to-[#151513] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#9a6a35]/10 dark:bg-[#9a6a35]/20 flex items-center justify-center text-[#9a6a35] dark:text-[#E07A5F] shadow-inner shrink-0">
              <Film className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-[#211d18] dark:text-[#f5f0e7] font-heritage">
                  إضافة حكاية أو فيديو جديد (وه Stories)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#9a6a35] text-white text-[9px] sm:text-[10px] font-black">
                  Upper Egypt Stories
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50 mt-0.5 line-clamp-1 sm:line-clamp-none">
                شارك معالم الصعيد، تراثه، أسواقه، أكلاته، أو حكايات ناسه وحرفه مع الجميع
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Unauthorized (Guest or Buyer) -> Render Permission Guard Barrier Screen */}
        {isUnauthorized ? (
          <div className="p-6 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 my-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-700 dark:text-amber-300 shadow-md">
              <Lock className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="max-w-lg space-y-2">
              <h3 className="text-lg sm:text-2xl font-black text-[#2D2A26] dark:text-[#FAF6F2] font-heritage">
                رفع مقاطع الفيديو مخصص للحرفيين وأصحاب الورش فقط
              </h3>
              <p className="text-xs sm:text-sm text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50 leading-relaxed">
                {!currentUser
                  ? 'عفواً، لا يمكنك رفع ونشر مقاطع الفيديو بدون تسجيل الدخول بحساب بائع أو حرفي معتمد في سوق الصعيد.'
                  : 'حسابك الحالي مسجل كـ "مشتري". لنشر مقاطع كواليس ورشتك وربط منتجاتك بفيديوهات تفاعلية، يرجى التقديم لفتح ورشة بائع.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
              {!currentUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setAuthModalTab('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full py-3 px-4 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs sm:text-sm font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer min-h-[44px] transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>تسجيل الدخول كبائع</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setAuthModalTab('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full py-3 px-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/10 dark:hover:bg-white/10 text-xs sm:text-sm font-bold rounded-xl cursor-pointer min-h-[44px] transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>إنشاء حساب جديد</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setActivePage('sellers');
                    }}
                    className="w-full py-3 px-4 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs sm:text-sm font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer min-h-[44px] transition-all"
                  >
                    <Store className="w-4 h-4" />
                    <span>التقديم لفتح ورشة بائع</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 px-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] hover:bg-black/10 dark:hover:bg-white/10 text-xs sm:text-sm font-bold rounded-xl cursor-pointer min-h-[44px] transition-all"
                  >
                    <span>إلغاء وإغلاق</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Mobile View Switcher (< lg) */}
            <div className="flex lg:hidden border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setMobileTab('form')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] ${
                  mobileTab === 'form'
                    ? 'bg-white dark:bg-[#261E19] text-[#9a6a35] dark:text-[#E07A5F] shadow-xs'
                    : 'text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>نموذج وبيانات الفيديو</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] ${
                  mobileTab === 'preview'
                    ? 'bg-white dark:bg-[#261E19] text-[#9a6a35] dark:text-[#E07A5F] shadow-xs'
                    : 'text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>معاينة 9:16 المباشرة</span>
              </button>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center gap-2.5 text-xs text-red-700 dark:text-red-300 font-medium shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form Body: Scrollable */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                {/* Left Column: Video inputs & Metadata */}
                <div className={`lg:col-span-7 space-y-5 sm:space-y-6 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
                  {/* Step 1: Video Source Picker */}
                  <div className="space-y-2.5 sm:space-y-3">
                    <label className="block text-xs sm:text-sm font-bold text-[#211d18] dark:text-[#f5f0e7]">
                      ١. اختر طريقة تزويد مقطع الفيديو
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSourceType('upload')}
                        className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl sm:rounded-2xl border text-[11px] sm:text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer min-h-[44px] justify-center ${
                          sourceType === 'upload'
                            ? 'border-[#9a6a35] bg-[#9a6a35]/10 text-[#9a6a35] dark:text-[#E07A5F] shadow-xs'
                            : 'border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A1614]'
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        <span>رفع من الجهاز</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSourceType('url')}
                        className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl sm:rounded-2xl border text-[11px] sm:text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer min-h-[44px] justify-center ${
                          sourceType === 'url'
                            ? 'border-[#9a6a35] bg-[#9a6a35]/10 text-[#9a6a35] dark:text-[#E07A5F] shadow-xs'
                            : 'border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A1614]'
                        }`}
                      >
                        <LinkIcon className="w-4 h-4" />
                        <span>رابط مباشر (URL)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSourceType('preset')}
                        className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl sm:rounded-2xl border text-[11px] sm:text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer min-h-[44px] justify-center ${
                          sourceType === 'preset'
                            ? 'border-[#9a6a35] bg-[#9a6a35]/10 text-[#9a6a35] dark:text-[#E07A5F] shadow-xs'
                            : 'border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A1614]'
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>مقاطع صعيدية</span>
                      </button>
                    </div>

                    {/* Source Controls */}
                    {sourceType === 'upload' && (
                      <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/10 dark:border-white/10">
                        <VideoUploadProgress
                          currentUser={currentUser}
                          sellerId={sellerId}
                          onUploadStart={() => {
                            setIsUploadingVideo(true);
                            setErrorMsg(null);
                          }}
                          onUploadSuccess={(result) => {
                            setVideoUrl(result.url);
                            setCloudinaryPublicId(result.cloudinaryPublicId);
                            setIsUploadingVideo(false);
                            setErrorMsg(null);
                            if (result.duration && !isNaN(result.duration)) {
                              const mins = Math.floor(result.duration / 60);
                              const secs = Math.floor(result.duration % 60);
                              setDuration(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
                            }
                            generatePosterFromVideo(result.url, result.thumbnailUrl);
                          }}
                          onUploadError={(err) => {
                            setIsUploadingVideo(false);
                            setErrorMsg(`فشل في رفع الفيديو: ${err}`);
                          }}
                          onUploadCancel={() => {
                            setVideoUrl('');
                            setCloudinaryPublicId(undefined);
                            setIsUploadingVideo(false);
                          }}
                          onVideoRemoved={() => {
                            setVideoUrl('');
                            setCloudinaryPublicId(undefined);
                            setIsUploadingVideo(false);
                          }}
                        />
                      </div>
                    )}

                    {sourceType === 'url' && (
                      <div className="space-y-2">
                        <div className="relative">
                          <LinkIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            value={videoUrl}
                            onChange={(e) => {
                              setVideoUrl(e.target.value);
                              setCloudinaryPublicId(undefined);
                            }}
                            placeholder="https://... (رابط فيديو MP4 مباشر من Cloudinary, S3, Firebase)"
                            className="w-full pl-3 pr-9 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-[#211d18] dark:text-[#f5f0e7] outline-none focus:border-[#9a6a35]"
                          />
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          يمكنك لصق رابط مباشر لفيديو مرفوع على أي استضافة سحابية خارجية بصيغة MP4.
                        </p>
                      </div>
                    )}

                    {sourceType === 'preset' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                        {HERITAGE_VIDEO_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPreset(preset)}
                            className={`p-2.5 rounded-2xl border text-right transition-all flex items-center gap-2 cursor-pointer ${
                              videoUrl === preset.videoUrl
                                ? 'border-[#9a6a35] bg-[#9a6a35]/10 text-[#9a6a35] dark:text-[#E07A5F]'
                                : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#211d18] dark:text-[#f5f0e7] hover:border-[#9a6a35]/50'
                            }`}
                          >
                            <span className="text-lg">{preset.emoji || '🎬'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">{preset.title}</p>
                              <p className="text-[10px] text-gray-400 truncate">{preset.craftType}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Step 2: Content Details */}
                  <div className="space-y-3 pt-2 border-t border-black/10 dark:border-white/10">
                    <label className="block text-xs sm:text-sm font-bold text-[#211d18] dark:text-[#f5f0e7]">
                      ٢. تفاصيل وحكاية المقطع (Upper Egypt Content)
                    </label>

                    <div>
                      <label className="text-[11px] text-gray-500 dark:text-gray-400 block mb-1">
                        عنوان الفيديو أو الحكاية:
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="مثال: جولة في سوق الخميس الأسبوعي بمدينة إسنا"
                        className="w-full px-3 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs sm:text-sm text-[#211d18] dark:text-[#f5f0e7] outline-none focus:border-[#9a6a35]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-gray-500 dark:text-gray-400 block mb-1">
                          تصنيف المحتوى (Content Type):
                        </label>
                        <select
                          value={contentType}
                          onChange={(e) => setContentType(e.target.value)}
                          className="w-full px-3 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] outline-none focus:border-[#9a6a35]"
                        >
                          <option value="places">أماكن ومعالم (Places & Landmarks)</option>
                          <option value="crafts">حرف وصناعات (Crafts & Industries)</option>
                          <option value="heritage">تراث وآثار (Heritage & Archaeology)</option>
                          <option value="events">فعاليات ومهرجانات (Events & Festivals)</option>
                          <option value="food">أكل صعيدي (Food)</option>
                          <option value="markets">أسواق (Markets)</option>
                          <option value="people">حكايات الناس (People's Stories)</option>
                          <option value="travel">رحلات وتجارب (Travel & Experiences)</option>
                          <option value="other">أخرى (Other)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-gray-500 dark:text-gray-400 block mb-1">
                          المحافظة:
                        </label>
                        <select
                          value={governorate}
                          onChange={(e) => setGovernorate(e.target.value as Governorate)}
                          className="w-full px-3 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs font-medium text-[#211d18] dark:text-[#f5f0e7] outline-none focus:border-[#9a6a35]"
                        >
                          <option value="قنا">قنا</option>
                          <option value="سوهاج">سوهاج</option>
                          <option value="الأقصر">الأقصر</option>
                          <option value="أسوان">أسوان</option>
                          <option value="أسيوط">أسيوط</option>
                          <option value="المنيا">المنيا</option>
                          <option value="بني سويف">بني سويف</option>
                          <option value="الفيوم">الفيوم</option>
                          <option value="الوادي الجديد">الوادي الجديد</option>
                          <option value="البحر الأحمر">البحر الأحمر</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-gray-500 dark:text-gray-400 block mb-1">
                          الموقع / المكان بالتحديد (اختياري):
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="مثال: معبد حتشبسوت، قرية تونس، سوق إسنا..."
                          className="w-full px-3 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-[#211d18] dark:text-[#f5f0e7] outline-none focus:border-[#9a6a35]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-gray-500 dark:text-gray-400 block mb-1">
                          الوسوم والهاشتاج (Hashtags):
                        </label>
                        <input
                          type="text"
                          value={hashtagsStr}
                          onChange={(e) => setHashtagsStr(e.target.value)}
                          placeholder="#الصعيد, #وه_Stories, #أماكن_مصر"
                          className="w-full px-3 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-[#211d18] dark:text-[#f5f0e7] outline-none focus:border-[#9a6a35]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-500 dark:text-gray-400 block mb-1">
                        وصف الحكاية أو الفيديو:
                      </label>
                      <textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="اكتب نبذة شيقة وموجزة عن المكان، التجربة، أو الحكاية..."
                        className="w-full px-3 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-[#211d18] dark:text-[#f5f0e7] outline-none focus:border-[#9a6a35]"
                      />
                    </div>
                  </div>

                  {/* Step 3: Optional Linked Product */}
                  <div className="space-y-3 pt-2 border-t border-black/10 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs sm:text-sm font-bold text-[#211d18] dark:text-[#f5f0e7]">
                        ٣. ربط بمنتج (اختياري تماماً)
                      </label>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        غير إجباري
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] text-gray-500 dark:text-gray-400 block">
                        هل ترغب بربط الفيديو بمنتج للشراء المباشر؟
                      </label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-[#211d18] dark:text-[#f5f0e7] outline-none focus:border-[#9a6a35] font-bold"
                      >
                        <option value="none">✨ بدون ربط بمنتج (محتوى مرئي وثقافي فقط)</option>
                        <option value="custom">✏️ إدخال منتج معروض يدوياً</option>
                        {sellerProducts.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            🛍️ {prod.title} — ({prod.price} ج.م)
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedProductId === 'custom' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10">
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-[#2D2A26] dark:text-gray-300 block mb-1">
                            اسم المنتج المعروض:
                          </label>
                          <input
                            type="text"
                            value={productTitle}
                            onChange={(e) => setProductTitle(e.target.value)}
                            placeholder="مثال: طاجن فخار قناوي حراري مزجج"
                            className="w-full px-3 py-2 bg-white dark:bg-[#261E19] border border-black/10 dark:border-white/10 rounded-xl text-xs text-[#211d18] dark:text-[#f5f0e7] outline-none focus:border-[#9a6a35]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#2D2A26] dark:text-gray-300 block mb-1">
                            السعر (ج.م):
                          </label>
                          <input
                            type="number"
                            value={productPrice}
                            onChange={(e) => setProductPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white dark:bg-[#261E19] border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold text-[#9a6a35] outline-none focus:border-[#9a6a35]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#2D2A26] dark:text-gray-300 block mb-1">
                            السعر قبل الخصم (اختياري):
                          </label>
                          <input
                            type="number"
                            value={productOriginalPrice}
                            onChange={(e) => setProductOriginalPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white dark:bg-[#261E19] border border-black/10 dark:border-white/10 rounded-xl text-xs text-gray-500 outline-none focus:border-[#9a6a35]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Live Interactive 9:16 Feed Preview Mockup */}
                <div className={`lg:col-span-5 flex flex-col items-center justify-start space-y-4 ${mobileTab === 'form' ? 'hidden lg:flex' : 'flex'}`}>
                  <div className="w-full flex items-center justify-between">
                    <span className="text-xs font-bold text-black/60 dark:text-white/60 dark:text-black/50 dark:text-white/50 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-[#9a6a35]" />
                      معاينة مباشرة كما ستظهر للجمهور:
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#9a6a35] bg-[#9a6a35]/10 px-2 py-0.5 rounded-full">
                      وه Stories
                    </span>
                  </div>

                  {/* Mobile Mockup Frame */}
                  <div className="relative w-[240px] sm:w-[280px] aspect-9/16 rounded-3xl overflow-hidden bg-black shadow-2xl border-4 border-[#2D2A26] dark:border-black group mx-auto">
                    {videoUrl ? (
                      <video
                        ref={previewVideoRef}
                        src={videoUrl}
                        poster={posterUrl || productImage}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-gray-400 bg-gray-900">
                        <Film className="w-10 sm:w-12 h-10 sm:h-12 mb-2 opacity-50" />
                        <p className="text-xs font-bold">حدد أو ارفع فيديو لمشاهدة المعاينة المباشرة</p>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />

                    {/* Top Meta */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                      <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                        {duration}
                      </span>
                      <span className="bg-[#9a6a35]/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {governorate}
                      </span>
                    </div>

                    {/* Bottom Mockup Info */}
                    <div className="absolute bottom-3 inset-x-3 z-10 space-y-2">
                      {/* Location & Category Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-xs">
                          📍 {location || governorate}
                        </span>
                        <span className="text-[9px] font-medium text-white/80 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                          {contentType}
                        </span>
                      </div>

                      {/* Title */}
                      <p className="text-[11px] sm:text-xs font-bold text-white line-clamp-2 leading-tight drop-shadow-md">
                        {title || 'عنوان حكاية الصعيد...'}
                      </p>

                      {/* Optional Shoppable Product Card Overlay */}
                      {selectedProductId !== 'none' && productTitle && (
                        <div className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-between gap-1.5 sm:gap-2 shadow-lg">
                          <img
                            src={productImage || posterUrl || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=300&q=80'}
                            alt="product"
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl object-cover shrink-0 border border-white/30"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-[11px] font-bold text-white truncate">{productTitle}</p>
                            <span className="text-[10px] sm:text-[11px] font-black text-amber-300">{productPrice} ج.م</span>
                          </div>
                          <div className="px-2 py-1 bg-[#9a6a35] text-white rounded-lg text-[9px] sm:text-[10px] font-bold shadow-xs">
                            شراء
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="w-full flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 sm:pt-6 border-t border-black/10 dark:border-white/10 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer text-center min-h-[44px]"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9a6a35] to-[#7d5427] hover:from-[#7d5427] hover:to-[#623f1a] text-white text-xs sm:text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer min-h-[44px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري حفظ ونشر الفيديو...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>نشر في وه Stories</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};
