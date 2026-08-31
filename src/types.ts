export type UserRole = 'guest' | 'buyer' | 'seller' | 'admin';
export type ThemeMode = 'light' | 'dark';

export type Governorate =
  | 'أسوان'
  | 'الأقصر'
  | 'قنا'
  | 'سوهاج'
  | 'أسيوط'
  | 'المنيا'
  | 'بني سويف'
  | 'الوادي الجديد'
  | 'الفيوم'
  | 'القاهرة'
  | 'الجيزة'
  | 'الإسكندرية'
  | 'أخرى';

export type ProductStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Product {
  id: string;
  title: string;
  titleEn?: string;
  categoryId: string;
  categoryName: string;
  sellerId: string;
  sellerName: string;
  sellerGovernorate: Governorate;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  images: string[];
  description: string;
  specifications: {
    material: string;
    originGovernorate: Governorate;
    craftsmanship: string;
    dimensions?: string;
    weight?: string;
    careInstructions?: string;
    estimatedMakingTime?: string;
  };
  tags: string[];
  isHandmade: boolean;
  isHeritage: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  wholesalePrice?: number;
  wholesaleMinQty?: number;
  createdAt: string;
  updatedAt?: string;
  approvalStatus: ProductStatus;
  approvedAt?: string | null;
  approvedBy?: string | null;
  rejectionReason?: string | null;
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  slug?: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  icon?: string;
  iconName?: string;
  productCount?: number;
  productsCount?: number;
  active?: boolean;
  heritageNote?: string;
  featuredGovernorate?: Governorate;
}

export type SellerStatus = 'approved' | 'pending' | 'rejected' | 'suspended';

export interface Seller {
  id: string;
  name: string;
  brandName: string;
  governorate: Governorate;
  rating: number;
  salesCount: number;
  productsCount: number;
  badge: string;
  avatar: string;
  coverImage: string;
  bio: string;
  story: string;
  verified: boolean;
  joinedDate: string;
  phone: string;
  email: string;
  payoutMethod: 'vodafone_cash' | 'instapay' | 'bank_transfer';
  payoutAccount: string;
  status: SellerStatus;
  specialty: string;
  rejectionReason?: string;
  suspensionReason?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  customNote?: string;
}

export type OrderStatus =
  | 'pending'
  | 'review'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod =
  | 'vodafone_cash'
  | 'instapay'
  | 'cod'
  | 'cash_on_delivery'
  | 'online_gateway'
  | 'credit_card';

export type PaymentStatus =
  | 'pending'
  | 'payment_pending_verification'
  | 'paid'
  | 'payment_rejected'
  | 'failed'
  | 'refunded'
  | 'cash_on_delivery';

export interface OrderAddress {
  fullName: string;
  phone: string;
  governorate: Governorate;
  city: string;
  streetAddress: string;
  buildingNo?: string;
  notes?: string;
}

export interface OrderTimelineItem {
  status: OrderStatus;
  title: string;
  description: string;
  time: string;
  done: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  shippingAddress: OrderAddress;
  items: CartItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paymentReceiptUrl?: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  discountCode?: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  trackingNumber: string;
  timeline: OrderTimelineItem[];
  sellerIds: string[];
}

export interface Review {
  id: string;
  productId: string;
  productTitle?: string;
  userId: string;
  userName: string;
  userGovernorate?: Governorate;
  orderId?: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  status: 'published' | 'hidden';
}

export interface StockMovement {
  id: string;
  productId: string;
  productTitle: string;
  sellerId: string;
  type: 'STOCK_ADDED' | 'STOCK_REMOVED' | 'ORDER_SOLD' | 'MANUAL_ADJUSTMENT';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  actorId: string;
  actorName: string;
  timestamp: string;
}

export interface DiscountCoupon {
  id: string;
  code: string;
  discountPercent: number;
  maxDiscount?: number;
  minOrderValue: number;
  active: boolean;
  validUntil?: string;
  usageCount: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resource: string;
  timestamp: string;
  status: 'نجاح' | 'تنبيه' | 'خطأ';
  details: string;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  avatar: string;
  status?: 'active' | 'suspended' | 'blocked';
  profileImage?: {
    secureUrl: string;
    publicId: string;
  } | null;
  governorate: Governorate;
  savedAddresses: OrderAddress[];
  createdAt: string;
  sellerId?: string;
  sellerStatus?: SellerStatus;
  mustChangePassword?: boolean;
}

export interface PasswordResetRequest {
  id: string;
  userId: string;
  username: string;
  name?: string;
  phone?: string;
  role?: UserRole;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
  handledByAdminId?: string;
  handledByAdminName?: string;
  handledAt?: string;
  adminNotes?: string;
}

export type ActivePage =
  | 'home'
  | 'products'
  | 'product-details'
  | 'categories'
  | 'category-details'
  | 'sellers'
  | 'seller-details'
  | 'about'
  | 'wholesale'
  | 'crafts'
  | 'reels'
  | 'search'
  | 'cart'
  | 'checkout'
  | 'orders'
  | 'order-details'
  | 'favorites'
  | 'buyer-account'
  | 'seller-dashboard'
  | 'seller-products'
  | 'seller-inventory'
  | 'seller-orders'
  | 'seller-payouts'
  | 'seller-analytics'
  | 'seller-account'
  | 'admin-dashboard'
  | 'admin-sellers'
  | 'admin-products'
  | 'admin-buyers'
  | 'admin-orders'
  | 'admin-payouts'
  | 'admin-categories'
  | 'admin-discounts'
  | 'admin-reports'
  | 'admin-audit-logs'
  | 'admin-settings';

export type CraftVerificationStatus = 'draft' | 'pending_review' | 'verified' | 'published' | 'rejected';

export interface CraftSource {
  sourceName?: string;
  sourceUrl?: string;
  sourceType?: string;
  sourceDate?: string;
}

export interface CraftCoordinates {
  lat?: number;
  lng?: number;
}

export interface CraftStory {
  id: string;
  title: string;
  subtitle?: string;
  governorate: string;
  city?: string;
  village?: string;
  location?: string;
  historyAge?: string;
  image?: string;
  images?: string[];
  description: string;
  materials?: string[];
  techniques?: string[];
  heritageSignificance?: string;
  artisan?: string;
  sources?: CraftSource[];
  coordinates?: CraftCoordinates;
  keyFeatures?: string[];
  categoryId: string;
  subCategory?: string;
  verificationStatus?: CraftVerificationStatus;
  displayOrder?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PayoutStatus = 'pending' | 'approved' | 'processing' | 'paid' | 'rejected' | 'cancelled';
export type PayoutMethod = 'vodafone_cash' | 'instapay' | 'bank_transfer';

export interface PayoutRequest {
  id: string;
  sellerId: string;
  sellerName?: string;
  sellerBrandName?: string;
  sellerGovernorate?: string;
  requestedAmount: number;
  approvedAmount?: number;
  paidAmount?: number;
  currency: string;
  status: PayoutStatus;
  paymentMethod: PayoutMethod;
  paymentDetailsSnapshot: {
    method: PayoutMethod;
    accountNumber: string;
    accountHolderName?: string;
    bankName?: string;
  };
  sellerBalanceAtRequest: number;
  transactionReference?: string;
  paymentDate?: string;
  rejectionReason?: string | null;
  adminNote?: string | null;
  sellerNotes?: string | null;
  requestedAt: string;
  approvedAt?: string | null;
  processingAt?: string | null;
  paidAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
  reviewedBy?: string | null;
  paidBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SellerPayoutSummary {
  totalEarnings: number;
  totalSalesCount: number;
  totalPaid: number;
  pendingProcessing: number;
  availableBalance: number;
  hasPayoutInfo: boolean;
  payoutInfo?: {
    method: PayoutMethod;
    account: string;
  };
}

export interface AdminPayoutSummary {
  totalPendingCount: number;
  totalPendingAmount: number;
  totalApprovedProcessingCount: number;
  totalApprovedProcessingAmount: number;
  totalPaidCount: number;
  totalPaidAmount: number;
  totalRejectedCount: number;
}

export interface PaymentConfig {
  instaPayAccount: string;
  vodafoneCashNumber: string;
  instaPayInstructions?: string;
  vodafoneCashInstructions?: string;
  updatedAt?: string;
}

export interface CraftReelComment {
  id: string;
  userName: string;
  userAvatar?: string;
  governorate?: string;
  comment: string;
  createdAt: string;
  likesCount: number;
}

export interface CraftReel {
  id: string;
  title: string;
  artisanName: string;
  artisanAvatar: string;
  workshopName: string;
  sellerId: string;
  governorate: Governorate;
  craftType: string;
  videoUrl: string;
  cloudinaryPublicId?: string;
  resourceType?: string;
  posterUrl: string;
  duration: string;
  likesCount: number;
  viewsCount: number;
  sharesCount: number;
  productId: string;
  productTitle: string;
  productPrice: number;
  productOriginalPrice?: number;
  productImage: string;
  productRating: number;
  inStock: boolean;
  description: string;
  hashtags: string[];
  musicTrack: string;
  isVerifiedArtisan?: boolean;
  createdAt: string;
  comments?: CraftReelComment[];
}


