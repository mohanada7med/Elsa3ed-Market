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
  | 'explore'
  | 'governorates'
  | 'governorate-details'
  | 'map'
  | 'places'
  | 'place-details'
  | 'cultural-crafts'
  | 'cultural-craft-details'
  | 'craft-details'
  | 'stories'
  | 'story-details'
  | 'people'
  | 'person-details'
  | 'food'
  | 'food-details'
  | 'events'
  | 'event-details'
  | 'global-search'
  | 'cultural-cms'
  | 'wah-market'
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
  | 'messages'
  | 'buyer-account'
  | 'seller-dashboard'
  | 'seller-products'
  | 'seller-inventory'
  | 'seller-orders'
  | 'seller-messages'
  | 'seller-payouts'
  | 'seller-analytics'
  | 'seller-account'
  | 'admin-dashboard'
  | 'admin-cultural-cms'

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

export interface Conversation {
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

export interface ChatMessage {
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

// ==========================================
// WAH PLATFORM - CULTURAL & REGIONAL TYPES
// ==========================================

export type VerificationStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';

export interface WahGovernorate {
  id: string;
  name: string;
  slug: string;
  shortIntro: string;
  history: string;
  famousFor: string[];
  coverImage: string;
  gallery: string[];
  capitalCity: string;
  mapCoordinates?: { lat: number; lng: number };
  traditionalCraftsIds: string[];
  traditionalFoodIds: string[];
  culturalTraditions: string[];
  status: VerificationStatus;
  places?: HeritagePlace[];
  crafts?: CulturalCraft[];
  foods?: UpperEgyptFood[];
  stories?: WahStory[];
  people?: LocalPerson[];
  events?: CulturalEvent[];
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}

export type GovernorateDoc = WahGovernorate;

export interface HeritagePlace {
  id: string;
  title: string;
  slug: string;
  governorateId: string;
  governorateName: string;
  category: 'temple' | 'monastery' | 'mosque' | 'museum' | 'tomb' | 'heritage_village' | 'nature' | 'cultural_center' | string;
  description: string;
  shortDescription?: string;
  history: string;
  fullHistory?: string;
  historicalEra?: string;
  architecturalHighlights?: string[];
  galleryImages?: string[];
  locationDescription?: string;
  visitorTips?: string;
  significance: string;
  locationName: string;
  coverImage: string;
  gallery: string[];
  videoUrl?: string;
  relatedCrafts?: string[];
  status: VerificationStatus;
  sourceName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CulturalCraft {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  history: string;
  governorates: string[];
  materials: string[];
  tools: string[];
  manufacturingStages: { title: string; description: string; stepNumber: number }[];
  stages?: { title: string; description: string; stepNumber?: number }[];
  toolsUsed?: string[];
  category?: string;
  preservationStatus?: string;
  governorateId?: string;
  governorateName?: string;
  coverImage: string;
  gallery: string[];
  videoUrl?: string;
  relatedArtisansIds?: string[];
  status: VerificationStatus;
  relatedProducts?: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface WahStory {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: 'craft_origins' | 'places_myths' | 'villages_history' | 'artisan_journey' | 'oral_tradition' | 'folklore';
  authorName: string;
  narrator?: string;
  culturalSignificance?: string;
  governorateName: string;
  governorateId: string;
  coverImage: string;
  readingTimeMinutes: number;
  relatedPlaceId?: string;
  relatedCraftId?: string;
  relatedArtisanId?: string;
  status: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LocalPerson {
  id: string;
  name: string;
  slug: string;
  titleOrRole: string;
  craftTitle?: string;
  governorateName: string;
  governorateId: string;
  biography: string;
  bio?: string;
  craftOrSkill: string;
  avatarUrl: string;
  photoUrl?: string;
  quote?: string;
  yearsOfExperience?: number;
  relatedArtisanId?: string;
  relatedCraftId?: string;
  status: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpperEgyptFood {
  id: string;
  title: string;
  name?: string;
  slug: string;
  governorateName: string;
  governorateId: string;
  description: string;
  category?: string;
  ingredients: string[];
  preparationMethod: string;
  preparation?: string;
  originStory: string;
  story?: string;
  occasionOrTradition?: string;
  coverImage: string;
  status: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CulturalEvent {
  id: string;
  title: string;
  slug: string;
  category: 'festival' | 'moulid' | 'exhibition' | 'workshop' | 'cultural_night' | 'market_fair' | string;
  governorateName: string;
  governorateId: string;
  locationName: string;
  location?: string;
  eventDate: string;
  startDate?: string;
  eventTime?: string;
  timeOfYear?: string;
  description: string;
  traditions?: string;
  coverImage: string;
  status: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MapGovernorateData {
  id: string;
  name: string;
  slug: string;
  shortIntro: string;
  coverImage: string;
  famousFor: string[];
  coordinates: { lat: number; lng: number };
  stats: {
    placesCount: number;
    craftsCount: number;
    storiesCount: number;
    foodsCount: number;
    eventsCount: number;
    productsCount: number;
  };
}

export interface GlobalSearchResult {
  id: string;
  title: string;
  type: 'governorate' | 'place' | 'craft' | 'story' | 'person' | 'food' | 'event' | 'product';
  typeLabel: string;
  subtitle?: string;
  coverImage?: string;
  url: string;
  slug: string;
}

export type WahSearchResult = GlobalSearchResult;




