import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { CraftReel, CraftReelComment } from '../../types.ts';
import { craftReelsService } from '../../services/craftReelsService.ts';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ShoppingBag,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Store,
  BadgeCheck,
  Send,
  Music,
  Eye,
  Check,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CraftReelsModalProps {
  reels: CraftReel[];
  initialReelId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (productId: string) => void;
  onSelectSeller?: (sellerId: string) => void;
}

export const CraftReelsModal: React.FC<CraftReelsModalProps> = ({
  reels,
  initialReelId,
  isOpen,
  onClose,
  onSelectProduct,
  onSelectSeller
}) => {
  const { addToCart, products, navigateToProduct, navigateToSeller, addToast, currentUser, isAuthenticated } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [likedReelIds, setLikedReelIds] = useState<string[]>([]);
  const [currentReelLikes, setCurrentReelLikes] = useState<number>(0);
  const [commentsDrawerOpen, setCommentsDrawerOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [reelsList, setReelsList] = useState<CraftReel[]>(reels);
  const [copiedLink, setCopiedLink] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedCartSuccess, setAddedCartSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Initialize active reel based on initialReelId
  useEffect(() => {
    if (initialReelId && reels.length > 0) {
      const idx = reels.findIndex((r) => r.id === initialReelId);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [initialReelId, reels]);

  // Sync liked reels from storage
  useEffect(() => {
    if (isOpen) {
      const liked = craftReelsService.getUserLikedReels();
      setLikedReelIds(liked);
      setReelsList(craftReelsService.getReels());
    }
  }, [isOpen]);

  const currentReel = reelsList[currentIndex] || reels[0];

  // Sync current likes count when index changes
  useEffect(() => {
    if (currentReel) {
      setCurrentReelLikes(currentReel.likesCount);
      craftReelsService.incrementViews(currentReel.id);
      setVideoProgress(0);
      setAddedCartSuccess(false);
    }
  }, [currentIndex, currentReel]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (commentsDrawerOpen) {
          setCommentsDrawerOpen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        goToNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        goToPrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, commentsDrawerOpen, currentIndex, reelsList.length]);

  const goToNext = () => {
    if (currentIndex < reelsList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsPlaying(true);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
  };

  // Handle Like Action
  const handleLike = () => {
    if (!currentReel) return;
    const { isLiked, newLikesCount } = craftReelsService.toggleLikeReel(currentReel.id);
    setCurrentReelLikes(newLikesCount);

    if (isLiked) {
      setLikedReelIds((prev) => [...prev, currentReel.id]);
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    } else {
      setLikedReelIds((prev) => prev.filter((id) => id !== currentReel.id));
    }
  };

  // Double tap to like on video
  const handleDoubleTap = () => {
    if (!likedReelIds.includes(currentReel.id)) {
      handleLike();
    } else {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    }
  };

  // Handle Share Action
  const handleShare = () => {
    if (!currentReel) return;
    craftReelsService.incrementShares(currentReel.id);
    const shareUrl = `${window.location.origin}/?reel=${currentReel.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: currentReel.title,
          text: `شاهد إبداع الحرفي الصعيدي ${currentReel.artisanName} في صناعة ${currentReel.craftType} على سوق الصعيد!`,
          url: shareUrl
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      addToast('تم نسخ الرابط', 'تم نسخ رابط فيديو الحرفة إلى الحافظة بنجاح', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Handle Add Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentReel) return;

    const newComment = craftReelsService.addComment(currentReel.id, {
      userName: currentUser?.name || (isAuthenticated ? 'مستخدم سوق الصعيد' : 'زائر مهتم بالتراث'),
      userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      governorate: currentUser?.governorate || 'مصر',
      comment: newCommentText.trim()
    });

    setReelsList((prev) =>
      prev.map((r) => {
        if (r.id === currentReel.id) {
          return {
            ...r,
            comments: [newComment, ...(r.comments || [])]
          };
        }
        return r;
      })
    );

    setNewCommentText('');
    addToast('تم نشر تعليقك', 'شكراً لدعمك وتشجيعك لصناع وتراث الصعيد!', 'success');
  };

  // Handle Quick Buy / Add to Cart
  const handleQuickAddToCart = () => {
    if (!currentReel) return;
    setIsAddingToCart(true);

    const fullProduct = products.find((p) => p.id === currentReel.productId) || {
      id: currentReel.productId,
      title: currentReel.productTitle,
      price: currentReel.productPrice,
      originalPrice: currentReel.productOriginalPrice,
      images: [currentReel.productImage],
      rating: currentReel.productRating,
      reviewCount: 18,
      inStock: currentReel.inStock,
      stockCount: 12,
      categoryId: 'pottery',
      categoryName: currentReel.craftType,
      sellerId: currentReel.sellerId,
      sellerName: currentReel.workshopName,
      sellerGovernorate: currentReel.governorate,
      description: currentReel.description,
      specifications: {
        material: currentReel.craftType,
        originGovernorate: currentReel.governorate,
        craftsmanship: 'صناعة يدوية أصيلة'
      },
      tags: currentReel.hashtags,
      isHandmade: true,
      isHeritage: true,
      createdAt: currentReel.createdAt,
      approvalStatus: 'approved'
    };

    addToCart(fullProduct, 1);
    setAddedCartSuccess(true);
    setIsAddingToCart(false);
    addToast('أُضيف إلى السلة بنجاح', `تمت إضافة "${currentReel.productTitle}" لسلة مشترياتك`, 'success');

    setTimeout(() => setAddedCartSuccess(false), 3000);
  };

  // Video Time Update for progress bar
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress || 0);
    }
  };

  if (!isOpen || !currentReel) return null;

  const isLiked = likedReelIds.includes(currentReel.id);

  return (
    <div
      id="craft-reels-modal-overlay"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-200"
    >
      {/* Modal Container */}
      <div className="relative w-full h-full sm:h-[92vh] sm:max-w-md md:max-w-lg bg-black sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-white/10">
        {/* Top Progress Bar */}
        <div className="absolute top-0 inset-x-0 z-30 h-1 bg-white/20">
          <div
            className="h-full bg-[#B45F42] transition-all duration-150"
            style={{ width: `${videoProgress}%` }}
          />
        </div>

        {/* Top Header Overlay */}
        <div className="absolute top-2 inset-x-0 z-30 px-4 py-2 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {/* Brand & Badge */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#B45F42] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white font-heritage tracking-wide">
                  ورش الصعيد التفاعلية
                </span>
                <span className="bg-amber-500/30 border border-amber-400/50 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  Reels
                </span>
              </div>
              <span className="text-[10px] text-white/70 block">
                {currentIndex + 1} من {reelsList.length} مقطع
              </span>
            </div>
          </div>

          {/* Controls: Mute & Close */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="craft-reels-toggle-mute"
              onClick={() => setIsMuted((prev) => !prev)}
              className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs border border-white/15 transition-all cursor-pointer"
              title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              type="button"
              id="craft-reels-close-btn"
              onClick={onClose}
              className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs border border-white/15 transition-all cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Video Player Canvas */}
        <div
          className="relative w-full h-full flex items-center justify-center cursor-pointer bg-[#1A1614] overflow-hidden"
          onClick={togglePlay}
          onDoubleClick={handleDoubleTap}
        >
          <video
            ref={videoRef}
            key={currentReel.id}
            src={currentReel.videoUrl}
            poster={currentReel.posterUrl}
            playsInline
            autoPlay
            loop
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-cover"
          />

          {/* Pause Indicator overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white animate-scale-up">
                <Play className="w-8 h-8 fill-white mr-1" />
              </div>
            </div>
          )}

          {/* Double Tap Heart Burst Animation */}
          <AnimatePresence>
            {showHeartBurst && (
              <motion.div
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 1.3, opacity: 1 }}
                exit={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
              >
                <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Up / Down Navigation Floaters for Desktop */}
          <div className="hidden sm:flex flex-col gap-2 absolute left-4 top-1/2 -translate-y-1/2 z-30">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white disabled:opacity-30 disabled:cursor-not-allowed border border-white/15 transition-all cursor-pointer"
              title="الفيديو السابق (سهم لأعلى)"
            >
              <ChevronUp className="w-5 h-5" />
            </button>

            <button
              type="button"
              disabled={currentIndex === reelsList.length - 1}
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white disabled:opacity-30 disabled:cursor-not-allowed border border-white/15 transition-all cursor-pointer"
              title="الفيديو التالي (سهم لأسفل)"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Floating Social Interaction Bar (TikTok style) */}
        <div className="absolute right-3 bottom-32 sm:bottom-36 z-30 flex flex-col items-center gap-4">
          {/* Artisan Avatar Profile */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              if (onSelectSeller) {
                onSelectSeller(currentReel.sellerId);
              } else {
                navigateToSeller(currentReel.sellerId);
              }
            }}
            className="group/artisan relative cursor-pointer flex flex-col items-center"
            title="زيارة صفحة ورشة الحرفي"
          >
            <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-[#B45F42] to-rose-500 shadow-lg">
              <img
                src={currentReel.artisanAvatar}
                alt={currentReel.artisanName}
                className="w-full h-full rounded-full object-cover border-2 border-black"
              />
            </div>
            <div className="absolute -bottom-1.5 bg-[#B45F42] text-white p-0.5 rounded-full shadow-xs">
              <Store className="w-3 h-3" />
            </div>
          </div>

          {/* Like Button */}
          <button
            type="button"
            id="craft-reel-like-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            className="flex flex-col items-center gap-0.5 text-white group/like cursor-pointer"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xs transition-transform active:scale-75 ${
                isLiked ? 'bg-rose-600/90 text-white' : 'bg-black/50 hover:bg-black/70 text-white border border-white/15'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-white text-white' : 'group-hover/like:text-rose-400'}`} />
            </div>
            <span className="text-[11px] font-black drop-shadow-md">
              {currentReelLikes >= 1000 ? `${(currentReelLikes / 1000).toFixed(1)}k` : currentReelLikes}
            </span>
          </button>

          {/* Comments Button */}
          <button
            type="button"
            id="craft-reel-comments-btn"
            onClick={(e) => {
              e.stopPropagation();
              setCommentsDrawerOpen(true);
            }}
            className="flex flex-col items-center gap-0.5 text-white group/comm cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 border border-white/15 flex items-center justify-center backdrop-blur-xs transition-transform active:scale-75">
              <MessageCircle className="w-5 h-5 group-hover/comm:text-amber-400" />
            </div>
            <span className="text-[11px] font-black drop-shadow-md">
              {currentReel.comments?.length || 0}
            </span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            id="craft-reel-share-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="flex flex-col items-center gap-0.5 text-white group/share cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 border border-white/15 flex items-center justify-center backdrop-blur-xs transition-transform active:scale-75">
              {copiedLink ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5 group-hover/share:text-sky-400" />}
            </div>
            <span className="text-[11px] font-black drop-shadow-md">
              {currentReel.sharesCount}
            </span>
          </button>
        </div>

        {/* Bottom Content & Product Card Overlay */}
        <div className="absolute bottom-0 inset-x-0 z-30 p-3 sm:p-4 bg-gradient-to-t from-black via-black/80 to-transparent space-y-2.5">
          {/* Artisan & Video Info */}
          <div className="pr-1 space-y-1.5 max-w-[80%]">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-white drop-shadow-md hover:underline cursor-pointer">
                {currentReel.artisanName}
              </span>
              {currentReel.isVerifiedArtisan && (
                <BadgeCheck className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="text-[11px] text-amber-200/90 font-medium bg-amber-950/70 border border-amber-500/30 px-2 py-0.2 rounded-md">
                محافظة {currentReel.governorate}
              </span>
            </div>

            <h3 className="text-xs sm:text-sm font-bold text-white leading-tight drop-shadow-sm">
              {currentReel.title}
            </h3>

            <p className="text-[11px] text-gray-200 line-clamp-2 leading-relaxed">
              {currentReel.description}
            </p>

            {/* Music Track Badge */}
            <div className="flex items-center gap-1.5 text-[10px] text-amber-300/90 overflow-hidden">
              <Music className="w-3 h-3 shrink-0 animate-bounce" />
              <span className="truncate">{currentReel.musicTrack}</span>
            </div>
          </div>

          {/* Instant Buy Product Overlay Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 flex items-center justify-between gap-3 shadow-xl">
            {/* Product Info */}
            <div
              onClick={() => {
                onClose();
                if (onSelectProduct) {
                  onSelectProduct(currentReel.productId);
                } else {
                  navigateToProduct(currentReel.productId);
                }
              }}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
            >
              <img
                src={currentReel.productImage}
                alt={currentReel.productTitle}
                className="w-12 h-12 rounded-xl object-cover border border-white/20 shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-amber-300 font-bold bg-amber-900/60 px-1.5 rounded">
                    المنتج في الفيديو
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">متوفر للشحن</span>
                </div>
                <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-200 transition-colors">
                  {currentReel.productTitle}
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-400">
                    {currentReel.productPrice} ج.م
                  </span>
                  {currentReel.productOriginalPrice && (
                    <span className="text-[10px] text-gray-400 line-through">
                      {currentReel.productOriginalPrice} ج.م
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons: Quick Buy & View */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                id="craft-reel-quick-buy-btn"
                onClick={handleQuickAddToCart}
                disabled={isAddingToCart}
                className={`px-3 py-2 text-xs font-black rounded-xl flex items-center gap-1 shadow-lg transition-all cursor-pointer ${
                  addedCartSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#B45F42] hover:bg-[#9E4F36] text-white active:scale-95'
                }`}
                title="شراء فوري وإضافة إلى السلة"
              >
                {addedCartSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>تمت الإضافة!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>شراء فوري</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSelectProduct) {
                    onSelectProduct(currentReel.productId);
                  } else {
                    navigateToProduct(currentReel.productId);
                  }
                }}
                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="عرض تفاصيل القطعة والمواصفات"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sliding Comments Drawer */}
        <AnimatePresence>
          {commentsDrawerOpen && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="absolute inset-x-0 bottom-0 top-1/3 z-40 bg-[#2D2A26] rounded-t-3xl border-t border-white/20 shadow-2xl flex flex-col justify-between p-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-sm text-white">
                    تعليقات ورأي الجمهور ({currentReel.comments?.length || 0})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setCommentsDrawerOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
                {currentReel.comments && currentReel.comments.length > 0 ? (
                  currentReel.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-2.5 text-right">
                      <img
                        src={comment.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0"
                      />
                      <div className="flex-1 bg-white/5 rounded-2xl p-2.5 border border-white/10 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300">
                            {comment.userName}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {comment.createdAt}
                          </span>
                        </div>
                        <p className="text-xs text-gray-200 leading-relaxed">
                          {comment.comment}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-2 py-8">
                    <MessageCircle className="w-8 h-8 text-gray-500" />
                    <p className="text-xs">كن أول من يترك تعليقاً ويشجع الأسطى!</p>
                  </div>
                )}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="pt-2 border-t border-white/10 flex items-center gap-2">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="اكتب كلمة تشجيع للحرفي أو استفسار عن الصنعة..."
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-gray-400 outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="p-2.5 bg-[#B45F42] hover:bg-[#9E4F36] disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4 rotate-180" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
