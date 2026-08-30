import React, { useState, useEffect, useRef } from 'react';
import { CraftReel, Governorate, Product, Seller } from '../../types.ts';
import { craftReelsService } from '../../services/craftReelsService.ts';
import {
  Film,
  X,
  Check,
  Play,
  Pause,
  AlertCircle,
  Sparkles,
  Link as LinkIcon,
  ShoppingBag,
  Store,
  MapPin,
  Tag,
  Music,
  Eye,
  Star,
  Pin
} from 'lucide-react';
import { motion } from 'motion/react';

interface ReelEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  reel: CraftReel | null;
  onSuccess: (updatedReel: CraftReel) => void;
  currentUser?: { id?: string; role?: string; sellerId?: string; name?: string };
  sellerProducts?: Product[];
  allSellers?: Seller[];
}

export const ReelEditModal: React.FC<ReelEditModalProps> = ({
  isOpen,
  onClose,
  reel,
  onSuccess,
  currentUser,
  sellerProducts = [],
  allSellers = []
}) => {
  const isAdmin = currentUser?.role === 'admin';

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [governorate, setGovernorate] = useState<Governorate>('قنا');
  const [craftType, setCraftType] = useState('');
  const [duration, setDuration] = useState('0:30');
  const [musicTrack, setMusicTrack] = useState('');
  const [hashtagsStr, setHashtagsStr] = useState('');

  // Linked Product State
  const [productId, setProductId] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [productPrice, setProductPrice] = useState<number | string>(0);
  const [productOriginalPrice, setProductOriginalPrice] = useState<number | string>('');
  const [productImage, setProductImage] = useState('');
  const [inStock, setInStock] = useState(true);

  // Admin-only fields
  const [artisanName, setArtisanName] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [artisanAvatar, setArtisanAvatar] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isVerifiedArtisan, setIsVerifiedArtisan] = useState(true);

  // UI state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (reel) {
      setTitle(reel.title || '');
      setDescription(reel.description || '');
      setVideoUrl(reel.videoUrl || '');
      setPosterUrl(reel.posterUrl || '');
      setGovernorate(reel.governorate || 'قنا');
      setCraftType(reel.craftType || '');
      setDuration(reel.duration || '0:30');
      setMusicTrack(reel.musicTrack || '');
      setHashtagsStr((reel.hashtags || []).join(', '));

      setProductId(reel.productId || '');
      setProductTitle(reel.productTitle || '');
      setProductPrice(reel.productPrice || 0);
      setProductOriginalPrice(reel.productOriginalPrice || '');
      setProductImage(reel.productImage || '');
      setInStock(reel.inStock !== false);

      setArtisanName(reel.artisanName || '');
      setWorkshopName(reel.workshopName || '');
      setArtisanAvatar(reel.artisanAvatar || '');
      setSellerId(reel.sellerId || '');
      setIsFeatured((reel as any).isFeatured || false);
      setIsPinned((reel as any).isPinned || false);
      setIsVerifiedArtisan(reel.isVerifiedArtisan !== false);
      setErrorMsg(null);
    }
  }, [reel]);

  if (!isOpen || !reel) return null;

  const handleProductSelect = (selectedProdId: string) => {
    if (selectedProdId === 'custom') {
      return;
    }
    const found = sellerProducts.find((p) => p.id === selectedProdId);
    if (found) {
      setProductId(found.id);
      setProductTitle(found.title);
      setProductPrice(found.price);
      setProductOriginalPrice(found.originalPrice || Math.round(found.price * 1.25));
      setProductImage(found.images?.[0] || '');
      if (found.sellerGovernorate) {
        setGovernorate(found.sellerGovernorate as Governorate);
      }
    }
  };

  const handleSellerSelect = (chosenSellerId: string) => {
    setSellerId(chosenSellerId);
    const s = allSellers.find((item) => item.id === chosenSellerId);
    if (s) {
      setArtisanName(s.name);
      setWorkshopName(s.brandName || s.name);
      setGovernorate(s.governorate);
      setArtisanAvatar(s.avatar);
      if (s.specialty) {
        setCraftType(s.specialty);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('يرجى إدخال عنوان الفيديو');
      return;
    }
    if (!videoUrl.trim()) {
      setErrorMsg('يرجى تحديد رابط الفيديو السحابي');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const hashtags = hashtagsStr
      .split(/[,،\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const updates: Partial<CraftReel> & Record<string, any> = {
      title: title.trim(),
      description: description.trim(),
      videoUrl: videoUrl.trim(),
      posterUrl: posterUrl.trim() || productImage || reel.posterUrl,
      duration: duration || reel.duration,
      governorate,
      craftType: craftType.trim(),
      musicTrack: musicTrack.trim(),
      hashtags: hashtags.length > 0 ? hashtags : reel.hashtags,
      productId: productId || reel.productId,
      productTitle: productTitle.trim() || title.trim(),
      productPrice: Number(productPrice) || reel.productPrice,
      productOriginalPrice: productOriginalPrice ? Number(productOriginalPrice) : undefined,
      productImage: productImage.trim() || posterUrl.trim() || reel.productImage,
      inStock
    };

    if (isAdmin) {
      updates.artisanName = artisanName.trim();
      updates.workshopName = workshopName.trim();
      updates.artisanAvatar = artisanAvatar.trim();
      updates.sellerId = sellerId || reel.sellerId;
      updates.isFeatured = isFeatured;
      updates.isPinned = isPinned;
      updates.isVerifiedArtisan = isVerifiedArtisan;
    }

    try {
      const userParam = currentUser || { role: 'seller' };
      const res = await craftReelsService.updateReelAsync(userParam, reel.id, updates);
      setIsSubmitting(false);
      if (res) {
        onSuccess(res);
      } else {
        onSuccess({ ...reel, ...updates });
      }
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'حدث خطأ أثناء حفظ التعديلات في قاعدة البيانات');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white dark:bg-[#261E19] rounded-3xl shadow-2xl border border-[#E8E1D9] dark:border-[#382E27] overflow-hidden my-6"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E8E1D9] dark:border-[#382E27] flex items-center justify-between bg-[#FAF6F0] dark:bg-[#1F1916]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#B45F42]/10 dark:bg-[#B45F42]/20 flex items-center justify-center text-[#B45F42] dark:text-[#E07A5F]">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#2D2A26] dark:text-[#FDFBF7] font-heritage">
                تعديل بيانات مقطع الفيديو (Craft Reel)
              </h2>
              <p className="text-xs text-[#7A6F64] dark:text-[#A89F91]">
                {isAdmin
                  ? 'تحكم إداري كامل بمحتوى الفيديو، رابط الكلاود، الحرفي، والمنتج المرتبط'
                  : 'تحديث تفاصيل الفيديو والمنتج الخاص بورشة عملك'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-2xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Grid: Video Player Preview & Form Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Live Player & Cloud Link */}
            <div className="lg:col-span-5 space-y-4">
              <label className="block text-xs font-bold text-[#2D2A26] dark:text-[#FDFBF7]">
                معاينة الفيديو المشغل من الكلاود
              </label>

              <div className="relative aspect-9/16 bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border border-gray-800">
                {videoUrl ? (
                  <>
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      poster={posterUrl || productImage}
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (videoRef.current) {
                          if (videoRef.current.paused) {
                            videoRef.current.play();
                          } else {
                            videoRef.current.pause();
                          }
                        }
                      }}
                      className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:scale-110 transition-transform cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white mr-0.5" />}
                    </button>
                  </>
                ) : (
                  <div className="text-center p-6 text-gray-500">
                    <Film className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">أدخل رابط فيديو سحابي صالح للمعاينة</p>
                  </div>
                )}
              </div>

              {/* Video Cloud URL Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2D2A26] dark:text-[#FDFBF7] flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-[#B45F42]" />
                  <span>رابط الفيديو على الكلاود (Cloud Video URL / CDN / MP4)</span>
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/.../video.mp4 أو https://my-bucket.s3.../video.mp4"
                  className="w-full p-2.5 bg-[#FDFBF7] dark:bg-[#1F1916] border border-[#E8E1D9] dark:border-[#382E27] rounded-xl text-xs outline-none focus:border-[#B45F42] text-left font-mono"
                  dir="ltr"
                  required
                />
                <p className="text-[10px] text-[#7A6F64] dark:text-[#A89F91]">
                  يدعم روابط Cloudinary السحابية، AWS S3، Vimeo Direct، Google Cloud، وأي رابط فيديو مباشر.
                </p>
              </div>

              {/* Poster Image URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2D2A26] dark:text-[#FDFBF7]">
                  رابط صورة الغلاف السحابية (Poster / Thumbnail URL)
                </label>
                <input
                  type="url"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="https://.../poster.jpg"
                  className="w-full p-2.5 bg-[#FDFBF7] dark:bg-[#1F1916] border border-[#E8E1D9] dark:border-[#382E27] rounded-xl text-xs outline-none focus:border-[#B45F42] text-left font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Right Column: Video Details & Linked Product */}
            <div className="lg:col-span-7 space-y-4">
              {/* Admin workshop selection */}
              {isAdmin && allSellers.length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                    <Store className="w-4 h-4 text-amber-600" />
                    <span>تخصيص الورشة والحرفي (صلاحيات الأدمن)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-[#7A6F64] dark:text-[#A89F91] block mb-1">اختر البائع / الورشة</label>
                      <select
                        value={sellerId}
                        onChange={(e) => handleSellerSelect(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-[#261E19] border border-[#E8E1D9] dark:border-[#382E27] rounded-xl text-xs outline-none"
                      >
                        <option value="">ورشة مخصصة / عامة</option>
                        {allSellers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.brandName || s.name} ({s.governorate})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-[#7A6F64] dark:text-[#A89F91] block mb-1">اسم الحرفي</label>
                      <input
                        type="text"
                        value={artisanName}
                        onChange={(e) => setArtisanName(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-[#261E19] border border-[#E8E1D9] dark:border-[#382E27] rounded-xl text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Badges & Featured Toggle */}
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="rounded text-[#B45F42] focus:ring-[#B45F42]"
                      />
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-bold text-[#2D2A26] dark:text-[#FDFBF7]">فيديو مميز (Featured)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPinned}
                        onChange={(e) => setIsPinned(e.target.checked)}
                        className="rounded text-[#B45F42] focus:ring-[#B45F42]"
                      />
                      <Pin className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-bold text-[#2D2A26] dark:text-[#FDFBF7]">تثبيت في الصدارة</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Title & Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2D2A26] dark:text-[#FDFBF7]">
                  عنوان مقطع الفيديو *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: سر تشكيل الفخار القناوي باليد..."
                  className="w-full p-2.5 bg-[#FDFBF7] dark:bg-[#1F1916] border border-[#E8E1D9] dark:border-[#382E27] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2D2A26] dark:text-[#FDFBF7]">
                  وصف كواليس الصنعة والحكاية
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب نبذة عن أسرار الصنعة والمواد الطبيعية المستخدمة..."
                  className="w-full p-2.5 bg-[#FDFBF7] dark:bg-[#1F1916] border border-[#E8E1D9] dark:border-[#382E27] rounded-xl text-xs outline-none focus:border-[#B45F42]"
                />
              </div>

              {/* Governorate & Craft Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2D2A26] dark:text-[#FDFBF7] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#B45F42]" />
                    <span>المحافظة التراثية</span>
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value as Governorate)}
                    className="w-full p-2.5 bg-[#FDFBF7] dark:bg-[#1F1916] border border-[#E8E1D9] dark:border-[#382E27] rounded-xl text-xs outline-none"
                  >
                    {['قنا', 'سوهاج', 'الأقصر', 'أسوان', 'أسيوط', 'المنيا', 'بني سويف', 'الوادي الجديد', 'الفيوم'].map(
                      (gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2D2A26] dark:text-[#FDFBF7] flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-[#B45F42]" />
                    <span>نوع الحرفة اليدوية</span>
                  </label>
                  <input
                    type="text"
                    value={craftType}
                    onChange={(e) => setCraftType(e.target.value)}
                    placeholder="مثال: فخار، كليم يدوي، نقش نحاس"
                    className="w-full p-2.5 bg-[#FDFBF7] dark:bg-[#1F1916] border border-[#E8E1D9] dark:border-[#382E27] rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              {/* Linked Shoppable Product */}
              <div className="p-4 bg-[#FAF6F0] dark:bg-[#1F1916] border border-[#E8E1D9] dark:border-[#382E27] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#B45F42]" />
                    <span className="text-xs font-bold text-[#2D2A26] dark:text-[#FDFBF7]">
                      المنتج المرتبط بالفيديو للشراء المباشر
                    </span>
                  </div>
                  {sellerProducts.length > 0 && (
                    <select
                      onChange={(e) => handleProductSelect(e.target.value)}
                      className="text-[11px] p-1.5 bg-white dark:bg-[#261E19] border border-[#E8E1D9] dark:border-[#382E27] rounded-lg outline-none"
                    >
                      <option value="custom">اختيار من قائمة منتجاتي...</option>
                      {sellerProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.price} ج.م)
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-[#7A6F64] dark:text-[#A89F91] block mb-1">اسم المنتج</label>
                    <input
                      type="text"
                      value={productTitle}
                      onChange={(e) => setProductTitle(e.target.value)}
                      placeholder="اسم المنتج في الفيديو"
                      className="w-full p-2 bg-white dark:bg-[#261E19] border border-[#E8E1D9] dark:border-[#382E27] rounded-xl text-xs outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#7A6F64] dark:text-[#A89F91] block mb-1">السعر الحالي (ج.م)</label>
                    <input
                      type="number"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-[#261E19] border border-[#E8E1D9] dark:border-[#382E27] rounded-xl text-xs outline-none font-bold text-[#B45F42]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-[#7A6F64] dark:text-[#A89F91] block mb-1">رابط صورة المنتج</label>
                    <input
                      type="url"
                      value={productImage}
                      onChange={(e) => setProductImage(e.target.value)}
                      placeholder="https://.../product.jpg"
                      className="w-full p-2 bg-white dark:bg-[#261E19] border border-[#E8E1D9] dark:border-[#382E27] rounded-xl text-xs outline-none text-left font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#7A6F64] dark:text-[#A89F91] block mb-1">السعر الأصلي قبل الخصم (اختياري)</label>
                    <input
                      type="number"
                      value={productOriginalPrice}
                      onChange={(e) => setProductOriginalPrice(e.target.value)}
                      placeholder="مثال: 450"
                      className="w-full p-2 bg-white dark:bg-[#261E19] border border-[#E8E1D9] dark:border-[#382E27] rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-[#2D2A26] dark:text-[#FDFBF7]">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="rounded text-[#B45F42] focus:ring-[#B45F42]"
                    />
                    <span>المنتج متوفر بالمخزون وجاهز للطلب الفوري</span>
                  </label>
                </div>
              </div>

              {/* Music & Hashtags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2D2A26] dark:text-[#FDFBF7] flex items-center gap-1">
                    <Music className="w-3.5 h-3.5 text-[#B45F42]" />
                    <span>الموسيقى التراثية الخلفية</span>
                  </label>
                  <input
                    type="text"
                    value={musicTrack}
                    onChange={(e) => setMusicTrack(e.target.value)}
                    placeholder="مثال: نغم الربابة الصعيدي"
                    className="w-full p-2 bg-[#FDFBF7] dark:bg-[#1F1916] border border-[#E8E1D9] dark:border-[#382E27] rounded-xl text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2D2A26] dark:text-[#FDFBF7]">
                    الهاشتاجات (مفصولة بفواصل)
                  </label>
                  <input
                    type="text"
                    value={hashtagsStr}
                    onChange={(e) => setHashtagsStr(e.target.value)}
                    placeholder="#فخار, #تراث_قنا"
                    className="w-full p-2 bg-[#FDFBF7] dark:bg-[#1F1916] border border-[#E8E1D9] dark:border-[#382E27] rounded-xl text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-[#E8E1D9] dark:border-[#382E27] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#E8E1D9] dark:border-[#382E27] text-xs font-bold text-[#7A6F64] dark:text-[#A89F91] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#B45F42] hover:bg-[#9E4F36] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>جاري الحفظ في قاعدة البيانات...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>حفظ التعديلات في قاعدة البيانات</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
