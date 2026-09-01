export type UserRole = 'guest' | 'buyer' | 'seller' | 'admin';

export type ProductStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

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

export interface ProductDocument {
  id: string;
  title: string;
  titleEn?: string;
  categoryId: string;
  categoryName: string;
  sellerId: string;
  sellerName: string;
  sellerGovernorate: string;
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
    originGovernorate: string;
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
  createdAt: string;
  updatedAt?: string;
  approvalStatus: ProductStatus;
  approvedAt?: string | null;
  approvedBy?: string | null;
  rejectionReason?: string | null;
}

export interface SellerDocument {
  id: string;
  userId?: string;
  name: string;
  brandName: string;
  governorate: string;
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
  rejectionReason?: string | null;
  suspensionReason?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  rejectedAt?: string | null;
  rejectedBy?: string | null;
  suspendedAt?: string | null;
  suspendedBy?: string | null;
}

export interface AuditLogDocument {
  id: string;
  actorId?: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  status: 'نجاح' | 'تنبيه' | 'خطأ';
  details: string;
  metadata?: Record<string, any>;
}

export interface CartItemDocument {
  productId: string;
  quantity: number;
  selectedColor?: string;
  customNote?: string;
  addedAt: string;
}

export interface CartDocument {
  id: string;
  buyerId: string;
  items: CartItemDocument[];
  updatedAt: string;
}

export interface PopulatedCartItem {
  product: ProductDocument;
  quantity: number;
  selectedColor?: string;
  customNote?: string;
  itemSubtotal: number;
  isAvailable: boolean;
  stockCount: number;
  warning?: string;
}

export interface OrderItemSnapshot {
  productId: string;
  productTitle: string;
  productImage: string;
  sellerId: string;
  sellerName: string;
  sellerGovernorate: string;
  quantity: number;
  unitPrice: number; // Historical price snapshot at order creation
  subtotal: number;
  selectedColor?: string;
  customNote?: string;
}

export interface OrderAddressDocument {
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  streetAddress: string;
  buildingNo?: string;
  notes?: string;
}

export interface OrderTimelineDocument {
  status: OrderStatus;
  title: string;
  description: string;
  time: string;
  done: boolean;
}

export interface OrderDocument {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  shippingAddress: OrderAddressDocument;
  items: OrderItemSnapshot[];
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
  timeline: OrderTimelineDocument[];
  sellerIds: string[];
  cancellationReason?: string;
}

export interface CategoryDocument {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  description: string;
  image: string;
  iconName: string;
  productsCount: number;
  active: boolean;
  heritageNote?: string;
  featuredGovernorate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewDocument {
  id: string;
  productId: string;
  productTitle?: string;
  userId: string;
  userName: string;
  userGovernorate?: string;
  orderId?: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  status: 'published' | 'hidden';
  createdAt?: string;
  updatedAt?: string;
}

export interface StockMovementDocument {
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

export interface DiscountCouponDocument {
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

export interface UserAddress {
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  streetAddress: string;
  buildingNo?: string;
  notes?: string;
  isDefault?: boolean;
}

export interface UserDocument {
  id: string;
  username: string;
  usernameNormalized?: string;
  name: string;
  email?: string;
  passwordHash?: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  status?: 'active' | 'suspended' | 'blocked';
  profileImage?: {
    secureUrl: string;
    publicId: string;
  } | null;
  governorate?: string;
  sellerId?: string;
  sellerStatus?: SellerStatus;
  savedAddresses?: UserAddress[];
  mustChangePassword?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PasswordResetRequestDocument {
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

export interface FavoriteDocument {
  id: string;
  buyerId: string;
  productId: string;
  createdAt: string;
}

export interface NotificationDocument {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'product' | 'system' | 'promotion';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface PaymentDocument {
  id: string;
  orderId: string;
  buyerId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paymentReceiptUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ShipmentDocument {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: OrderStatus;
  estimatedDelivery?: string;
  updates: Array<{
    status: string;
    message: string;
    timestamp: string;
    location?: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

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

export interface CraftStoryDocument {
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
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PayoutStatus = 'pending' | 'approved' | 'processing' | 'paid' | 'rejected' | 'cancelled';
export type PayoutMethod = 'vodafone_cash' | 'instapay' | 'bank_transfer';

export interface PayoutDocument {
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

export interface PaymentConfigDocument {
  id: string;
  instaPayAccount: string;
  vodafoneCashNumber: string;
  instaPayInstructions?: string;
  vodafoneCashInstructions?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface CraftReelCommentDocument {
  id: string;
  userName: string;
  userAvatar?: string;
  governorate?: string;
  comment: string;
  createdAt: string;
  likesCount: number;
}

export interface CraftReelDocument {
  id: string;
  title: string;
  artisanName: string;
  artisanAvatar: string;
  workshopName: string;
  sellerId: string;
  governorate: string;
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
  isFeatured?: boolean;
  isPinned?: boolean;
  createdAt: string;
  updatedAt?: string;
  comments?: CraftReelCommentDocument[];
}

export interface ConversationDocument {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  productId?: string;
  productTitle?: string;
  productImage?: string;
  productPrice?: number;
  orderId?: string;
  orderNumber?: string;
  orderStatus?: OrderStatus;
  lastMessageText?: string;
  lastMessageSenderId?: string;
  lastMessageSenderRole?: UserRole;
  lastMessageAt?: string;
  buyerUnreadCount: number;
  sellerUnreadCount: number;
  status: 'active' | 'archived' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

export interface MessageDocument {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  text: string;
  messageType: 'text' | 'image' | 'product_reference' | 'system';
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}



