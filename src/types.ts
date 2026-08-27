export type UserRole = 'guest' | 'buyer' | 'seller' | 'admin';

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

export type PaymentMethod = 'vodafone_cash' | 'instapay' | 'cod' | 'credit_card';

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
  paymentStatus: 'pending' | 'paid' | 'refunded';
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
  validUntil: string;
  usageCount: number;
  description: string;
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
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  profileImage?: {
    secureUrl: string;
    publicId: string;
  } | null;
  governorate: Governorate;
  savedAddresses: OrderAddress[];
  createdAt: string;
  sellerId?: string;
  sellerStatus?: SellerStatus;
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
  | 'crafts'
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
  | 'seller-analytics'
  | 'seller-account'
  | 'admin-dashboard'
  | 'admin-sellers'
  | 'admin-products'
  | 'admin-buyers'
  | 'admin-orders'
  | 'admin-categories'
  | 'admin-discounts'
  | 'admin-reports'
  | 'admin-audit-logs'
  | 'admin-settings';

export interface CraftStory {
  id: string;
  title: string;
  subtitle: string;
  governorate: string;
  historyAge: string;
  image: string;
  description: string;
  keyFeatures: string[];
  categoryId: string;
  displayOrder?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

