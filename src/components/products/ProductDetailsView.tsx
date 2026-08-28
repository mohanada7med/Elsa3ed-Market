import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { updatePageSEO, generateProductSchema } from '../../utils/seo';
import {
  Heart,
  ShoppingBag,
  Star,
  Sparkles,
  MapPin,
  Truck,
  ShieldCheck,
  Store,
  ChevronRight,
  Clock,
  Award,
  Layers,
  Send,
  CheckCircle2,
  Share2,
  MessageCircle,
  Building2,
  Edit,
  Settings,
  Boxes
} from 'lucide-react';
import { WHATSAPP_NUMBER, getWhatsAppUrl } from '../common/WhatsAppButton';

export const ProductDetailsView: React.FC = () => {
  const {
    products,
    selectedProductId,
    setActivePage,
    addToCart,
    toggleFavorite,
    isFavorite,
    navigateToSeller,
    reviews,
    addReview,
    addToast,
    currentRole,
    isAuthenticated
  } = useApp();

  const product = products.find((p) => p.id === selectedProductId) || products[0];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'shipping'>('desc');

  const productImages = product?.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://res.cloudinary.com/kuana1nl/image/upload/v1787864171/elsa3ed_market2.png'];
  const productTags = Array.isArray(product?.tags) ? product.tags : [];
  const productSpecs = product?.specifications || {
    material: 'خامات طبيعية تراثية',
    originGovernorate: product?.sellerGovernorate || 'قنا',
    craftsmanship: 'صناعة يدوية أصيلة'
  };

  // Inject Product SEO and Schema.org Structured Data
  useEffect(() => {
    if (product) {
      updatePageSEO({
        title: product.title || 'منتج تراثي',
        description: (product.description || '').slice(0, 160),
        image: productImages[0],
        type: 'product',
        schema: generateProductSchema({
          id: product.id,
          title: product.title || '',
          description: product.description || '',
          images: productImages,
          price: product.price || 0,
          rating: product.rating || 5,
          reviewCount: product.reviewCount || 0,
          sellerName: product.sellerName || 'حرفي من الصعيد',
          inStock: product.inStock !== false
        })
      });
    }
  }, [product, productImages]);

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h3 className="text-xl font-bold text-gray-800">المنتج غير متوفر حالياً</h3>
        <p className="text-gray-500 text-sm">قد يكون تم حذف المنتج أو لم يتم تحميل البيانات بعد.</p>
        <button
          type="button"
          onClick={() => setActivePage('products')}
          className="px-6 py-2.5 bg-[#943310] hover:bg-[#7c280a] text-white rounded-xl text-sm font-bold transition-colors"
        >
          العودة لكافة المنتجات
        </button>
      </div>
    );
  }

  const favorite = isFavorite(product?.id || '');
  const productReviews = (reviews || []).filter((r) => r.productId === product.id);
  const relatedProducts = (products || [])
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.approvalStatus === 'approved')
    .slice(0, 4);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addReview(product.id, newRating, newComment);
    setNewComment('');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast('تم نسخ الرابط', 'تم نسخ رابط المنتج لمشاركته مع أصدقائك', 'info');
  };

  return (
    <div id="product-details-view" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#8c6b53]">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#943310] transition-colors"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <button
          type="button"
          onClick={() => setActivePage('products')}
          className="hover:text-[#943310] transition-colors"
        >
          المنتجات
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="text-[#943310] font-bold">{product.categoryName}</span>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="text-gray-800 truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Product Gallery (Left in RTL = Right in View) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-[#ebdccd] shadow-xs">
            <img
              src={productImages[selectedImageIndex] || productImages[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />

            {/* Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
              {product.discountPercent && (
                <span className="bg-[#943310] text-white text-xs font-black px-2.5 py-1 rounded-md shadow-xs">
                  خصم {product.discountPercent}%
                </span>
              )}
              {product.isHandmade && (
                <span className="bg-amber-100/95 text-[#78350f] text-xs font-bold px-2.5 py-1 rounded-md border border-amber-300 shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>حرفة يدوية أصيلة</span>
                </span>
              )}
            </div>

            {/* Favorite & Share on Image */}
            <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
              <button
                type="button"
                id="details-share-btn"
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-sm transition-all"
                title="مشاركة المنتج"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {(currentRole === 'buyer' || !isAuthenticated) && (
                <button
                  type="button"
                  id="details-fav-btn"
                  onClick={() => toggleFavorite(product.id)}
                  className={`p-2.5 rounded-full backdrop-blur-md shadow-sm transition-all ${
                    favorite
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/90 hover:bg-white text-gray-700 hover:text-rose-500'
                  }`}
                  title="المفضلة"
                >
                  <Heart className="w-4 h-4" fill={favorite ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>
          </div>

          {/* Thumbnail list */}
          {productImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-[#943310] ring-2 ring-[#943310]/20'
                      : 'border-[#ebdccd] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`معاينة ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Purchase Actions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Seller / Workshop Header */}
          <div className="flex items-center justify-between border-b border-[#f0e4d7] pb-4">
            <button
              type="button"
              id="details-seller-link"
              onClick={() => navigateToSeller(product.sellerId)}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#943310] flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="text-xs text-[#8c6b53] block">صُنعت بأنامل الحرفي:</span>
                <span className="text-sm font-bold text-gray-900">{product.sellerName}</span>
              </div>
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4ebe1] text-[#943310] text-xs font-bold border border-[#dfcebe]">
              <MapPin className="w-3.5 h-3.5" />
              <span>محافظة {product.sellerGovernorate}</span>
            </span>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              {product.title}
            </h1>
            {product.titleEn && (
              <p className="text-xs text-[#8c6b53] font-medium mt-1 font-mono">{product.titleEn}</p>
            )}
          </div>

          {/* Rating Summary */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-gray-900">{product.rating}</span>
            <span className="text-xs text-gray-400">({product.reviewCount} تقييم من مشترين حقيقيين)</span>
          </div>

          {/* Price Box */}
          <div className="bg-[#faf6f0] p-4 rounded-2xl border border-[#ebdccd] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#8c6b53] block">السعر الحالي:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#943310]">{product.price}</span>
                <span className="text-sm font-bold text-[#943310]">جنيه مصري</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-gray-400 line-through mr-2">
                    {product.originalPrice} ج.م
                  </span>
                )}
              </div>
            </div>

            <div className="text-left">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  product.inStock
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{product.inStock ? `متوفر في الورشة (${product.stockCount} قطعة)` : 'نفد المخزون'}</span>
              </span>
            </div>
          </div>

          {/* Role-Specific Actions: Buyer gets Cart, Seller gets Edit/Inventory, Admin gets Manage */}
          <div className="space-y-3 pt-2">
            {currentRole === 'buyer' || !isAuthenticated ? (
              <>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex items-center justify-between sm:justify-start border border-[#ebdccd] rounded-xl bg-white p-1 min-h-[44px]">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg font-bold min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
                      aria-label="تقليل الكمية"
                    >
                      -
                    </button>
                    <span className="px-4 font-bold text-sm text-gray-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(product.stockCount || 99, quantity + 1))}
                      disabled={quantity >= (product.stockCount || 0)}
                      className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 rounded-lg font-bold min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
                      aria-label="زيادة الكمية"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    id="details-add-cart-btn"
                    onClick={() => addToCart(product, quantity)}
                    disabled={!product.inStock}
                    className="flex-1 py-3.5 px-6 bg-[#943310] hover:bg-[#7c280a] disabled:bg-gray-300 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] min-h-[48px] cursor-pointer"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>إضافة إلى سلة المشتريات ({product.price * quantity} ج.م)</span>
                  </button>
                </div>

                {/* Direct WhatsApp Instant Order Button */}
                <a
                  href={getWhatsAppUrl(
                    `السلام عليكم، أود طلب أو الاستفسار عن منتج: "${product.title}" (سعر: ${product.price} ج.م، كمية: ${quantity}، صانع: ${product.sellerName} من ${product.sellerGovernorate})`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] min-h-[44px]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>طلب سريع عبر واتساب ({WHATSAPP_NUMBER})</span>
                </a>
              </>
            ) : currentRole === 'seller' ? (
              /* Seller Actions (No Cart / No Buy Now) */
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-amber-700" />
                  <span>أنت مسجل كبائع وحرفي في سوق الصعيد</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    id="details-seller-edit-btn"
                    onClick={() => setActivePage('seller-products')}
                    className="flex-1 py-3 px-4 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                    <span>تعديل بيانات المنتج</span>
                  </button>
                  <button
                    type="button"
                    id="details-seller-inventory-btn"
                    onClick={() => setActivePage('seller-inventory')}
                    className="flex-1 py-3 px-4 bg-white dark:bg-[#201B18] hover:bg-amber-100 text-amber-900 dark:text-amber-200 font-bold text-xs sm:text-sm rounded-xl border border-amber-300 dark:border-amber-700 shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Boxes className="w-4 h-4" />
                    <span>إدارة المخزون والكميات</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Admin Actions (No Cart / No Buy Now) */
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-purple-700" />
                  <span>إدارة ومراجعة المنتجات التراثية (الإدارة العليا)</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    id="details-admin-manage-btn"
                    onClick={() => setActivePage('admin-products')}
                    className="flex-1 py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                    <span>إدارة المنتج في المنصة</span>
                  </button>
                  <button
                    type="button"
                    id="details-admin-review-btn"
                    onClick={() => setActivePage('admin-dashboard')}
                    className="flex-1 py-3 px-4 bg-white dark:bg-[#201B18] hover:bg-purple-100 text-purple-900 dark:text-purple-200 font-bold text-xs sm:text-sm rounded-xl border border-purple-300 dark:border-purple-700 shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>لوحة المراجعة والاعتماد</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Wholesale & Bulk Orders Banner */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300/60 dark:border-amber-700/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  متوفر للبيع بالجملة وتوريدات الفنادق والشركات (B2B)
                </span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                خصم حتى 35%
              </span>
            </div>

            <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
              نوفر أسعار جملة تصاعدية تبدأ من 5 قطع مع إمكانية حفر الشعار وطلب عينات قبل التوريد.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={getWhatsAppUrl(
                  `السلام عليكم، نود طلب عرض أسعار جملة لمنتج: "${product.title}" (كود: ${product.id}) لـ (اسم المنشأة/الفندق)...`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>طلب تسعير جملة فوري</span>
              </a>

              <button
                type="button"
                onClick={() => setActivePage('wholesale')}
                className="py-2 px-3 bg-white dark:bg-[#1B1613] hover:bg-amber-100 text-amber-900 dark:text-amber-300 border border-amber-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                تفاصيل التوريد
              </button>
            </div>
          </div>

          {/* Quick Trust Pillars */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#f0e4d7] text-xs text-gray-700">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#943310]" />
              <span>توصيل معتمد لباب بيتك</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#943310]" />
              <span>ضمان أصالة الحرفة اليدوية</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description, Specifications, Reviews, Shipping */}
      <div className="bg-white rounded-2xl border border-[#ebdccd] p-4 sm:p-8 shadow-xs">
        <div className="flex border-b border-[#f0e4d7] gap-3 sm:gap-6 overflow-x-auto pb-3 mb-6 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('desc')}
            className={`pb-2 text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === 'desc'
                ? 'border-b-2 border-[#943310] text-[#943310]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            وصف القطعة وأصالتها
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`pb-2 text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-b-2 border-[#943310] text-[#943310]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            المواصفات وطريقة الصنع
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-b-2 border-[#943310] text-[#943310]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            آراء المشترين ({productReviews.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`pb-2 text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === 'shipping'
                ? 'border-b-2 border-[#943310] text-[#943310]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            الشحن والتغليف الآمن
          </button>
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'desc' && (
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p className="text-base font-medium text-gray-900">{product.description}</p>
            <div className="p-4 bg-[#faf6f0] rounded-xl border border-[#ebdccd] space-y-2">
              <h4 className="font-bold text-[#943310] text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>عن الحرفة الصعيدية في {product.sellerGovernorate}</span>
              </h4>
              <p className="text-xs text-[#6d4d38] leading-relaxed">
                تعتبر هذه القطعة تجسيداً حياً لتقاليد متوارثة أباً عن جد. تم تصنيعها بمواد خام طبيعية 100% مستخلصة من بيئة صعيد مصر دون أي مواد كيميائية ضارة، لتمنح منزلك لمسة من الفخامة التراثية الأصيلة.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {productTags.map((tag, i) => (
                <span key={i} className="text-xs bg-[#f4ebe1] text-[#8c6b53] px-2.5 py-1 rounded-lg">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Specs */}
        {activeTab === 'specs' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <tbody className="divide-y divide-[#f0e4d7]">
                <tr>
                  <td className="py-3 px-4 font-bold text-[#8c6b53] bg-[#faf6f0] w-1/3">الخامات والمواد الأساسية</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{productSpecs.material || 'خامات طبيعية'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#8c6b53] bg-[#faf6f0]">محافظة ومكان المنشأ</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">صعيد مصر - محافظة {productSpecs.originGovernorate || product.sellerGovernorate || 'قنا'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#8c6b53] bg-[#faf6f0]">طريقة التصنيع والصنعة</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{productSpecs.craftsmanship || 'صناعة يدوية'}</td>
                </tr>
                {productSpecs.dimensions && (
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#8c6b53] bg-[#faf6f0]">الأبعاد والمقاسات</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{productSpecs.dimensions}</td>
                  </tr>
                )}
                {productSpecs.weight && (
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#8c6b53] bg-[#faf6f0]">الوزن التقريبي</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{productSpecs.weight}</td>
                  </tr>
                )}
                {productSpecs.estimatedMakingTime && (
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#8c6b53] bg-[#faf6f0]">وقت الصنع اليدوي للقطعة</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{productSpecs.estimatedMakingTime}</td>
                  </tr>
                )}
                {productSpecs.careInstructions && (
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#8c6b53] bg-[#faf6f0]">تعليمات العناية والتنظيف</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{productSpecs.careInstructions}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Reviews List */}
            <div className="space-y-4">
              {productReviews.length === 0 ? (
                <p className="text-xs text-gray-500 italic">كن أول من يكتب تقييماً لهذه القطعة التراثية!</p>
              ) : (
                productReviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-[#faf6f0] rounded-xl border border-[#ebdccd] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#943310] text-white flex items-center justify-center text-xs font-bold">
                          {rev.userName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-gray-900 block">{rev.userName}</span>
                          <span className="text-[10px] text-gray-400">
                            {rev.userGovernorate ? `محافظة ${rev.userGovernorate}` : 'مشتري موثق'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-gray-400 block">{rev.date}</span>
                  </div>
                ))
              )}
            </div>

            {/* Add Review Form */}
            <form onSubmit={handleAddReview} className="bg-white p-4 rounded-xl border border-[#ebdccd] space-y-3">
              <h4 className="text-xs font-bold text-gray-900">شاركنا رأيك في هذه القطعة</h4>
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">التقييم بالنجوم:</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <textarea
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="اكتب تجربتك مع جودة الصنع والتغليف وطعم/شكل القطعة..."
                  rows={3}
                  className="w-full p-3 bg-[#faf6f0] border border-[#ebdccd] rounded-xl text-xs outline-none focus:border-[#943310]"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2 bg-[#943310] hover:bg-[#7c280a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال التقييم</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: Shipping */}
        {activeTab === 'shipping' && (
          <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#faf6f0] rounded-xl border border-[#ebdccd]">
                <h4 className="font-bold text-[#943310] mb-1">📦 التغليف التراثي المحكم</h4>
                <p className="text-gray-600">
                  يتم تغليف الفخار والخزف والأواني بطبقات مزدوجة من الفوم المقاوم للصدمات والكرتون المقوى مع ختم "قابل للكسر" لضمان وصولها سليمة 100%.
                </p>
              </div>
              <div className="p-4 bg-[#faf6f0] rounded-xl border border-[#ebdccd]">
                <h4 className="font-bold text-[#943310] mb-1">⏱️ مدد التوصيل المتوقعة</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• القاهرة، الجيزة، الإسكندرية: خلال 48 إلى 72 ساعة.</li>
                  <li>• محافظات الصعيد والوجه البحري: خلال 3 إلى 4 أيام عمل.</li>
                  <li>• مدن القناة وسيناء: خلال 4 إلى 5 أيام عمل.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 font-heritage">
              منتجات تراثية مشابهة قد تعجبك
            </h3>
            <button
              type="button"
              onClick={() => setActivePage('products')}
              className="text-xs font-bold text-[#943310] hover:underline"
            >
              عرض المزيد
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
