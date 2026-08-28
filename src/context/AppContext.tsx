import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  ActivePage,
  AuditLog,
  CartItem,
  Category,
  DiscountCoupon,
  Governorate,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductStatus,
  Review,
  Seller,
  UserProfile,
  UserRole
} from '../types.ts';
import { api } from '../services/api.ts';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: string;
}

interface AppContextType {
  // Navigation & Page State
  activePage: ActivePage;
  setActivePage: (page: ActivePage | ((prev: ActivePage) => ActivePage)) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  selectedSellerId: string | null;
  setSelectedSellerId: (id: string | null) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  navigateToProduct: (productId: string) => void;
  navigateToCategory: (categoryId: string) => void;
  navigateToSeller: (sellerId: string) => void;
  navigateToOrder: (orderId: string) => void;

  // Intro Experience
  showIntroVideo: boolean;
  setShowIntroVideo: (show: boolean) => void;
  dismissIntroVideo: () => void;

  // Auth & Roles
  isAuthenticated: boolean;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  switchRole: (role: UserRole) => void;
  login: (identifier: string, password: string) => Promise<void>;
  register: (params: {
    username: string;
    name: string;
    email?: string;
    password: string;
    phone: string;
    role: UserRole;
    governorate?: string;
    workshopName?: string;
    specialty?: string;
  }) => Promise<void>;
  logout: () => void;
  uploadProfileImage: (imageDataUri: string, filename?: string) => Promise<void>;
  removeProfileImage: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (tab: 'login' | 'register') => void;

  // Data & Entities
  products: Product[];
  sellerProducts: Product[];
  adminProducts: Product[];
  pendingProducts: Product[];
  categories: Category[];
  sellers: Seller[];
  orders: Order[];
  reviews: Review[];
  discounts: DiscountCoupon[];
  auditLogs: AuditLog[];
  isLoading: boolean;

  // Data Refresh Methods
  refreshPublicProducts: () => Promise<void>;
  refreshSellerProducts: () => Promise<void>;
  refreshAdminProducts: () => Promise<void>;
  refreshAuditLogs: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshSellers: () => Promise<void>;
  refreshReviews: () => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  shippingFee: number;
  appliedDiscount: DiscountCoupon | null;
  applyDiscountCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeDiscountCode: () => void;
  cartDiscountAmount: number;
  cartTotal: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;

  // Favorites
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;

  // Search & Filter State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGovernorateFilter: Governorate | 'all';
  setSelectedGovernorateFilter: (gov: Governorate | 'all') => void;
  selectedCategoryFilter: string | 'all';
  setSelectedCategoryFilter: (cat: string | 'all') => void;
  selectedHandmadeOnly: boolean;
  setSelectedHandmadeOnly: (val: boolean) => void;
  selectedSort: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  setSelectedSort: (sort: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest') => void;

  // Product Actions
  addProduct: (productData: Partial<Product>, initialStatus?: ProductStatus) => Promise<Product>;
  submitProductForReview: (productId: string) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product | void>;
  deleteProduct: (id: string) => Promise<void>;
  approveProduct: (id: string) => Promise<void>;
  rejectProduct: (id: string, reason: string) => Promise<void>;

  // Seller Actions
  approveSeller: (sellerId: string) => Promise<void> | void;
  rejectSeller: (sellerId: string, reason?: string) => Promise<void> | void;
  suspendSeller: (sellerId: string, reason?: string) => Promise<void> | void;
  updateSeller: (sellerId: string, updates: Partial<Seller>) => void;
  updateSellerStatus: (sellerId: string, status: string, reason?: string) => Promise<void>;
  updateSellerProfile: (updates: Partial<Seller>) => Promise<void>;

  // Order Actions
  createOrder: (orderData: {
    address?: Order['shippingAddress'] | any;
    buyerName?: string;
    buyerPhone?: string;
    governorate?: Governorate;
    city?: string;
    addressText?: string;
    paymentMethod: PaymentMethod;
    paymentReference?: string;
    notes?: string;
  }) => Promise<Order> | Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => Promise<void>;
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;

  // Reviews
  addReview: (productId: string, rating: number, comment: string) => Promise<void> | void;
  moderateReview: (reviewId: string, status: 'published' | 'hidden', reason?: string) => Promise<void>;

  // Discounts
  addDiscountCoupon: (coupon: Omit<DiscountCoupon, 'id' | 'usageCount'>) => void;
  toggleDiscountStatus: (id: string) => void;

  // Categories
  addCategory: (categoryData: Omit<Category, 'id' | 'productsCount'>) => Promise<void> | void;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void> | void;
  deleteCategory: (id: string) => Promise<void> | void;

  // Inventory & Seller Dashboard
  sellerInventory: any[];
  refreshSellerInventory: () => Promise<void>;
  updateInventoryStock: (productId: string, newStock: number, reason?: string) => Promise<void>;
  stockMovements: any[];
  refreshStockMovements: (productId?: string) => Promise<void>;
  sellerStats: any;
  refreshSellerStats: () => Promise<void>;

  // Notifications / Toast
  toasts: ToastNotification[];
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const GUEST_USER: UserProfile = {
  id: '',
  username: '',
  name: 'زائر سوق الصعيد',
  email: '',
  phone: '',
  role: 'guest',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  governorate: 'أخرى',
  savedAddresses: [],
  createdAt: ''
};

export const normalizeOrder = (ord: any): Order => {
  if (!ord) return ord;
  const items = Array.isArray(ord.items)
    ? ord.items.map((it: any) => {
      const product = it.product
        ? {
          ...it.product,
          id: it.product.id || it.productId || 'prod-item',
          images: Array.isArray(it.product.images) && it.product.images.length > 0
            ? it.product.images
            : [it.productImage || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80']
        }
        : {
          id: it.productId || 'prod-item',
          title: it.productTitle || 'منتج تراثي أصيل',
          price: it.unitPrice || 0,
          originalPrice: it.unitPrice || 0,
          images: [it.productImage || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80'],
          sellerId: it.sellerId || '',
          sellerName: it.sellerName || 'ورشة الصعيد التراثية',
          sellerGovernorate: it.sellerGovernorate || 'قنا',
          categoryId: 'cat-pottery',
          categoryName: 'الفخار والخزف',
          inStock: true,
          stockCount: 10,
          rating: 5,
          reviewCount: 1,
          isHandmade: true,
          heritageGovernorate: it.sellerGovernorate || 'قنا',
          approvalStatus: 'approved' as const,
          description: it.productTitle || 'منتج تراثي مصنوع يدوياً في صعيد مصر'
        };

      return {
        product,
        quantity: it.quantity || 1,
        selectedColor: it.selectedColor,
        customNote: it.customNote
      };
    })
    : [];

  return {
    ...ord,
    id: ord.id || `ord-${Date.now()}`,
    orderNumber: ord.orderNumber || `SAED-${String(ord.id || '').replace(/\D/g, '').slice(-4) || '1042'}`,
    buyerId: ord.buyerId || 'user-buyer-1',
    buyerName: ord.buyerName || ord.shippingAddress?.fullName || 'عميل سوق الصعيد',
    buyerPhone: ord.buyerPhone || ord.shippingAddress?.phone || '01000000000',
    shippingAddress: {
      fullName: ord.shippingAddress?.fullName || ord.shippingAddress?.buyerName || ord.buyerName || 'عميل سوق الصعيد',
      phone: ord.shippingAddress?.phone || ord.shippingAddress?.buyerPhone || ord.buyerPhone || '01000000000',
      governorate: (ord.shippingAddress?.governorate || 'القاهرة') as Governorate,
      city: ord.shippingAddress?.city || 'المدينة',
      streetAddress: ord.shippingAddress?.streetAddress || ord.shippingAddress?.address || 'العنوان',
      buildingNo: ord.shippingAddress?.buildingNo || '',
      notes: ord.shippingAddress?.notes || ord.notes || ''
    },
    items,
    status: ord.status || 'pending',
    paymentMethod: ord.paymentMethod || 'vodafone_cash',
    paymentStatus: ord.paymentStatus || 'pending',
    subtotal: ord.subtotal || 0,
    shippingFee: ord.shippingFee ?? 45,
    discountAmount: ord.discountAmount || 0,
    total: ord.total || 0,
    createdAt: ord.createdAt || new Date().toISOString(),
    updatedAt: ord.updatedAt || new Date().toISOString(),
    trackingNumber: ord.trackingNumber || `EG-SAED-${Math.floor(1000 + Math.random() * 9000)}`,
    timeline: Array.isArray(ord.timeline) && ord.timeline.length > 0 ? ord.timeline : [
      { status: ord.status || 'pending', title: 'تم استلام الطلب', description: 'تم إنشاء الطلب بنجاح', time: 'الآن', done: true }
    ],
    sellerIds: ord.sellerIds || []
  };
};

const PAGE_ROUTES: Record<ActivePage, string> = {
  home: '/',
  products: '/products',
  'product-details': '/products',
  categories: '/categories',
  'category-details': '/categories',
  crafts: '/crafts',
  sellers: '/sellers',
  'seller-details': '/sellers',
  about: '/about',
  search: '/search',
  cart: '/cart',
  checkout: '/checkout',
  orders: '/orders',
  'order-details': '/orders',
  favorites: '/favorites',
  'buyer-account': '/buyer-account',
  'seller-dashboard': '/seller-dashboard',
  'seller-products': '/seller-products',
  'seller-inventory': '/seller-inventory',
  'seller-orders': '/seller-orders',
  'seller-analytics': '/seller-analytics',
  'seller-account': '/seller-account',
  'admin-dashboard': '/admin-dashboard',
  'admin-sellers': '/admin-sellers',
  'admin-products': '/admin-products',
  'admin-buyers': '/admin-buyers',
  'admin-orders': '',
  'admin-categories': '',
  'admin-discounts': '',
  'admin-reports': '',
  'admin-audit-logs': '',
  'admin-settings': ''
};

function getInitialNavigationState(): {
  page: ActivePage;
  productId: string | null;
  categoryId: string | null;
  sellerId: string | null;
  orderId: string | null;
} {
  if (typeof window === 'undefined') {
    return { page: 'home', productId: null, categoryId: null, sellerId: null, orderId: null };
  }

  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(window.location.search);
  const idFromQuery = params.get('id');

  if (path === '/' || path === '') {
    const saved = sessionStorage.getItem('elsa3ed_active_page') as ActivePage;
    if (saved && PAGE_ROUTES[saved] && saved !== 'home') {
      return {
        page: saved,
        productId: sessionStorage.getItem('elsa3ed_selected_product_id'),
        categoryId: sessionStorage.getItem('elsa3ed_selected_category_id'),
        sellerId: sessionStorage.getItem('elsa3ed_selected_seller_id'),
        orderId: sessionStorage.getItem('elsa3ed_selected_order_id'),
      };
    }
    return { page: 'home', productId: null, categoryId: null, sellerId: null, orderId: null };
  }

  if (path === '/products') {
    if (idFromQuery) {
      return { page: 'product-details', productId: idFromQuery, categoryId: null, sellerId: null, orderId: null };
    }
    return { page: 'products', productId: null, categoryId: null, sellerId: null, orderId: null };
  }

  if (path.startsWith('/products/')) {
    const prodId = path.split('/')[2];
    return { page: 'product-details', productId: prodId, categoryId: null, sellerId: null, orderId: null };
  }

  if (path === '/categories') {
    if (idFromQuery) {
      return { page: 'category-details', productId: null, categoryId: idFromQuery, sellerId: null, orderId: null };
    }
    return { page: 'categories', productId: null, categoryId: null, sellerId: null, orderId: null };
  }

  if (path.startsWith('/categories/')) {
    const catId = path.split('/')[2];
    return { page: 'category-details', productId: null, categoryId: catId, sellerId: null, orderId: null };
  }

  if (path === '/sellers') {
    if (idFromQuery) {
      return { page: 'seller-details', productId: null, categoryId: null, sellerId: idFromQuery, orderId: null };
    }
    return { page: 'sellers', productId: null, categoryId: null, sellerId: null, orderId: null };
  }

  if (path.startsWith('/sellers/')) {
    const sId = path.split('/')[2];
    return { page: 'seller-details', productId: null, categoryId: null, sellerId: sId, orderId: null };
  }

  if (path === '/orders') {
    if (idFromQuery) {
      return { page: 'order-details', productId: null, categoryId: null, sellerId: null, orderId: idFromQuery };
    }
    return { page: 'orders', productId: null, categoryId: null, sellerId: null, orderId: null };
  }

  if (path.startsWith('/orders/')) {
    const ordId = path.split('/')[2];
    return { page: 'order-details', productId: null, categoryId: null, sellerId: null, orderId: ordId };
  }

  const simplePages: ActivePage[] = [
    'crafts',
    'about',
    'cart',
    'checkout',
    'favorites',
    'buyer-account',
    'seller-dashboard',
    'seller-products',
    'seller-inventory',
    'seller-orders',
    'seller-analytics',
    'seller-account',
    'admin-dashboard',
    'admin-sellers',
    'admin-products',
    'admin-buyers'
  ];

  for (const p of simplePages) {
    if (path === `/${p}`) {
      return { page: p, productId: null, categoryId: null, sellerId: null, orderId: null };
    }
  }

  const saved = sessionStorage.getItem('elsa3ed_active_page') as ActivePage;
  if (saved && PAGE_ROUTES[saved]) {
    return {
      page: saved,
      productId: sessionStorage.getItem('elsa3ed_selected_product_id'),
      categoryId: sessionStorage.getItem('elsa3ed_selected_category_id'),
      sellerId: sessionStorage.getItem('elsa3ed_selected_seller_id'),
      orderId: sessionStorage.getItem('elsa3ed_selected_order_id'),
    };
  }

  return { page: 'home', productId: null, categoryId: null, sellerId: null, orderId: null };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation initialized from browser URL and session storage
  const initialNav = useMemo(() => getInitialNavigationState(), []);
  const [activePage, setActivePageState] = useState<ActivePage>(initialNav.page);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(initialNav.productId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialNav.categoryId);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(initialNav.sellerId);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialNav.orderId);

  // Sync activePage with browser URL and history
  const setActivePage = useCallback((pageOrUpdater: ActivePage | ((prev: ActivePage) => ActivePage)) => {
    setActivePageState((prev) => {
      const nextPage = typeof pageOrUpdater === 'function' ? pageOrUpdater(prev) : pageOrUpdater;
      try {
        sessionStorage.setItem('elsa3ed_active_page', nextPage);
        const targetPath = PAGE_ROUTES[nextPage] || (nextPage === 'home' ? '/' : `/${nextPage}`);
        if (window.location.pathname !== targetPath) {
          window.history.pushState({ page: nextPage }, '', targetPath);
        }
      } catch { }
      return nextPage;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Update navigation state on browser back/forward buttons (popstate)
  useEffect(() => {
    const onPopState = () => {
      const nav = getInitialNavigationState();
      setActivePageState(nav.page);
      if (nav.productId !== undefined) setSelectedProductId(nav.productId);
      if (nav.categoryId !== undefined) setSelectedCategoryId(nav.categoryId);
      if (nav.sellerId !== undefined) setSelectedSellerId(nav.sellerId);
      if (nav.orderId !== undefined) setSelectedOrderId(nav.orderId);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // On mount / page change: ensure URL reflects active page
  useEffect(() => {
    try {
      const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
      const expectedPath = PAGE_ROUTES[activePage] || (activePage === 'home' ? '/' : `/${activePage}`);
      if (currentPath === '/' && activePage !== 'home') {
        window.history.replaceState({ page: activePage }, '', expectedPath);
      }
    } catch { }
  }, [activePage]);

  // Intro Video: Opt-in only via explicit click to prevent blocking visitors
  const [showIntroVideo, setShowIntroVideo] = useState<boolean>(false);

  const dismissIntroVideo = () => {
    setShowIntroVideo(false);
    localStorage.setItem('saeed_intro_seen', 'true');
  };

  // Roles & Auth: Synchronously restore cached user for zero-latency UI on refresh
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const token = localStorage.getItem('saeed_token');
      const savedUser = localStorage.getItem('saeed_user');
      if (token && savedUser) {
        return JSON.parse(savedUser);
      }
    } catch { }
    return GUEST_USER;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const token = localStorage.getItem('saeed_token');
      const savedUser = localStorage.getItem('saeed_user');
      if (token && savedUser) {
        const u = JSON.parse(savedUser);
        if (u && u.role) return u.role;
      }
    } catch { }
    return 'guest';
  });

  const isAuthenticated = currentRole !== 'guest' && Boolean(currentUser?.id);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  // Master Data - Initialized to empty state and fetched directly from real MongoDB Database
  const [products, setProducts] = useState<Product[]>([]);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [discounts, setDiscounts] = useState<DiscountCoupon[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Phase 4: Inventory & Seller Stats
  const [sellerInventory, setSellerInventory] = useState<any[]>([]);
  const [stockMovements, setStockMovements] = useState<any[]>([]);
  const [sellerStats, setSellerStats] = useState<any>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('saeed_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCoupon | null>(null);

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('saeed_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGovernorateFilter, setSelectedGovernorateFilter] = useState<Governorate | 'all'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | 'all'>('all');
  const [selectedHandmadeOnly, setSelectedHandmadeOnly] = useState(false);
  const [selectedSort, setSelectedSort] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');

  // Notifications / Toast
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback((title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast: ToastNotification = {
      id,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString('ar-EG')
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync cart & favorites to localStorage
  useEffect(() => {
    localStorage.setItem('saeed_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('saeed_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Fetch Public Products from backend
  const refreshPublicProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetched = await api.getPublicProducts();
      if (fetched) {
        setProducts(fetched);
      }
    } catch (e) {
      console.warn('[AppContext] Could not fetch public products from API:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Seller Products from backend
  const refreshSellerProducts = useCallback(async () => {
    try {
      const fetched = await api.getSellerProducts({
        id: currentUser.id,
        role: currentRole,
        sellerId: currentUser.id
      });
      if (fetched) {
        setSellerProducts(fetched);
      }
    } catch (e) {
      console.warn('[AppContext] Could not fetch seller products from API:', e);
    }
  }, [currentUser.id, currentRole]);

  // Fetch Admin Products and Pending list from backend
  const refreshAdminProducts = useCallback(async () => {
    try {
      const [all, pending] = await Promise.all([
        api.getAllAdminProducts({ id: currentUser.id, role: 'admin' }),
        api.getAdminPendingProducts({ id: currentUser.id, role: 'admin' })
      ]);
      if (all) setAdminProducts(all);
      if (pending) setPendingProducts(pending);
    } catch (e) {
      console.warn('[AppContext] Could not fetch admin products from API:', e);
    }
  }, [currentUser.id]);

  // Fetch Audit Logs
  const refreshAuditLogs = useCallback(async () => {
    try {
      const logs = await api.getAdminAuditLogs({ id: currentUser.id, role: currentRole });
      if (logs && logs.length > 0) {
        setAuditLogs(logs);
      }
    } catch (e) {
      console.warn('[AppContext] Could not fetch audit logs from API:', e);
    }
  }, [currentUser.id, currentRole]);

  // Fetch Orders based on active role
  const refreshOrders = useCallback(async () => {
    try {
      let fetchedOrders: Order[] | null = null;
      if (currentRole === 'admin') {
        fetchedOrders = await api.getAdminOrders({ id: currentUser.id, role: 'admin' });
      } else if (currentRole === 'seller') {
        fetchedOrders = await api.getSellerOrders({
          id: currentUser.id,
          role: 'seller',
          sellerId: currentUser.id
        });
      } else {
        fetchedOrders = await api.getBuyerOrders({
          id: currentUser.id,
          role: 'buyer'
        });
      }

      if (fetchedOrders && Array.isArray(fetchedOrders)) {
        setOrders(fetchedOrders.map(normalizeOrder));
      }
    } catch (e) {
      console.warn('[AppContext] Could not fetch orders from API:', e);
    }
  }, [currentUser.id, currentRole]);

  // Fetch Reviews
  const refreshReviews = useCallback(async () => {
    try {
      if (currentRole === 'admin') {
        const adminRevs = await api.getAdminReviews({ id: currentUser.id, role: 'admin' });
        if (adminRevs && Array.isArray(adminRevs)) {
          setReviews(adminRevs);
        }
      }
    } catch (e) {
      console.warn('[AppContext] Could not fetch reviews:', e);
    }
  }, [currentUser.id, currentRole]);

  // Fetch Categories
  const refreshCategories = useCallback(async () => {
    try {
      const cats = currentRole === 'admin'
        ? await api.getAdminCategories({ id: currentUser.id, role: 'admin' })
        : await api.getCategories();
      if (cats && Array.isArray(cats)) {
        setCategories(cats);
      }
    } catch (e) {
      console.warn('[AppContext] Could not fetch categories:', e);
    }
  }, [currentUser.id, currentRole]);

  // Fetch Sellers
  const refreshSellers = useCallback(async () => {
    try {
      const s = currentRole === 'admin'
        ? await api.getAdminSellers({ id: currentUser.id, role: 'admin' })
        : await api.getSellers();
      if (s && Array.isArray(s)) {
        setSellers(s);
      }
    } catch (e) {
      console.warn('[AppContext] Could not fetch sellers:', e);
    }
  }, [currentUser.id, currentRole]);

  // Fetch Seller Inventory
  const refreshSellerInventory = useCallback(async () => {
    try {
      if (currentRole === 'seller') {
        const inv = await api.getSellerInventory({
          id: currentUser.id,
          role: 'seller',
          sellerId: currentUser.id
        });
        if (inv && Array.isArray(inv)) {
          setSellerInventory(inv);
        }
      }
    } catch (e) {
      console.warn('[AppContext] Could not fetch seller inventory:', e);
    }
  }, [currentUser.id, currentRole]);

  // Fetch Stock Movements
  const refreshStockMovements = useCallback(async (productId?: string) => {
    try {
      if (currentRole === 'seller') {
        const movs = await api.getSellerStockMovements({
          id: currentUser.id,
          role: 'seller',
          sellerId: currentUser.id
        }, productId);
        if (movs && Array.isArray(movs)) {
          setStockMovements(movs);
        }
      }
    } catch (e) {
      console.warn('[AppContext] Could not fetch stock movements:', e);
    }
  }, [currentUser.id, currentRole]);

  // Fetch Seller Dashboard Stats
  const refreshSellerStats = useCallback(async () => {
    try {
      if (currentRole === 'seller') {
        const stats = await api.getSellerDashboardStats({
          id: currentUser.id,
          role: 'seller',
          sellerId: currentUser.id
        });
        if (stats) {
          setSellerStats(stats);
        }
      }
    } catch (e) {
      console.warn('[AppContext] Could not fetch seller stats:', e);
    }
  }, [currentUser.id, currentRole]);

  // Initial load from Database APIs
  useEffect(() => {
    refreshPublicProducts();
    refreshOrders();
    refreshCategories();
    refreshSellers();
  }, [refreshPublicProducts, refreshOrders, refreshCategories, refreshSellers]);

  // Refresh when role changes
  useEffect(() => {
    refreshOrders();
    if (currentRole === 'seller') {
      refreshSellerProducts();
      refreshSellerInventory();
      refreshStockMovements();
      refreshSellerStats();
    } else if (currentRole === 'admin') {
      refreshAdminProducts();
      refreshAuditLogs();
      refreshReviews();
      refreshCategories();
      refreshSellers();
    } else {
      refreshPublicProducts();
    }
  }, [
    currentRole,
    refreshOrders,
    refreshSellerProducts,
    refreshSellerInventory,
    refreshStockMovements,
    refreshSellerStats,
    refreshAdminProducts,
    refreshAuditLogs,
    refreshReviews,
    refreshCategories,
    refreshSellers,
    refreshPublicProducts
  ]);

  // Log helper
  const addAuditLog = (action: string, resource: string, details: string, status: 'نجاح' | 'تنبيه' | 'خطأ' = 'نجاح') => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userName: currentUser.name || 'مستخدم المنصة',
      userRole: currentRole,
      action,
      resource,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status,
      details
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Auth Operations (Database-backed)
  const login = async (identifier: string, pass: string) => {
    const data = await api.login(identifier, pass);
    if (data && data.user) {
      setCurrentUser(data.user);
      setCurrentRole(data.user.role || 'buyer');
      if (data.token) {
        localStorage.setItem('saeed_token', data.token);
      }
      localStorage.setItem('saeed_user', JSON.stringify(data.user));
      setIsAuthModalOpen(false);
      addToast('تسجيل الدخول', `مرحباً بك يا ${data.user.username || data.user.name} في سوق الصعيد!`, 'success');
    }
  };

  const register = async (params: {
    username: string;
    name: string;
    email?: string;
    password: string;
    phone: string;
    role: UserRole;
    governorate?: string;
    workshopName?: string;
    specialty?: string;
  }) => {
    let data;
    if (params.role === 'seller' && params.workshopName) {
      data = await api.registerSeller({
        username: params.username,
        name: params.name,
        email: params.email,
        password: params.password,
        phone: params.phone,
        workshopName: params.workshopName,
        governorate: params.governorate,
        specialty: params.specialty
      });
    } else {
      data = await api.register(params);
    }

    if (data && data.user) {
      setCurrentUser(data.user);
      setCurrentRole(data.user.role || 'buyer');
      if (data.token) {
        localStorage.setItem('saeed_token', data.token);
      }
      localStorage.setItem('saeed_user', JSON.stringify(data.user));
      setIsAuthModalOpen(false);
      addToast(
        'إنشاء الحساب',
        data.user.role === 'seller'
          ? `تم تسجيل حساب ورشتكم بنجاح! مرحباً بك يا ${data.user.username || data.user.name}. طلبكم قيد المراجعة والاعتماد.`
          : `تم تسجيل حسابك بنجاح! مرحباً بك يا ${data.user.username || data.user.name}.`,
        'success'
      );
      refreshSellers();
      if (data.user.role === 'seller') {
        setActivePage('seller-dashboard');
      }
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('[AppContext] Logout server call error:', err);
    } finally {
      localStorage.removeItem('saeed_token');
      localStorage.removeItem('saeed_user');
      setCurrentUser(GUEST_USER);
      setCurrentRole('guest');
      // If the user is on a protected page, navigate to public homepage
      setActivePage((prev) => {
        if (['buyer-account', 'seller-dashboard', 'admin-dashboard', 'checkout', 'favorites'].includes(prev)) {
          return 'home';
        }
        return prev;
      });
      addToast('تسجيل الخروج', 'تم تسجيل الخروج بنجاح. أهلاً بك دائماً في سوق الصعيد.', 'info');
    }
  };

  // Restore authenticated session on initial mount
  useEffect(() => {
    const token = localStorage.getItem('saeed_token');
    if (token) {
      api.getMe()
        .then((userData) => {
          if (userData && userData.id) {
            setCurrentUser(userData);
            localStorage.setItem('saeed_user', JSON.stringify(userData));
            if (userData.role) {
              setCurrentRole(userData.role);
            }
          } else {
            localStorage.removeItem('saeed_token');
            localStorage.removeItem('saeed_user');
            setCurrentUser(GUEST_USER);
            setCurrentRole('guest');
          }
        })
        .catch((err) => {
          console.warn('[AppContext] Could not restore session on startup:', err);
          localStorage.removeItem('saeed_token');
          localStorage.removeItem('saeed_user');
          setCurrentUser(GUEST_USER);
          setCurrentRole('guest');
        });
    } else {
      setCurrentUser(GUEST_USER);
      setCurrentRole('guest');
    }
  }, []);

  // Upload Profile Image to Cloudinary & update MongoDB
  const uploadProfileImage = async (imageDataUri: string, filename?: string) => {
    const res = await api.uploadProfileImage(
      { id: currentUser.id, role: currentRole },
      imageDataUri,
      filename
    );
    if (res && res.user) {
      setCurrentUser(res.user);
      addToast('الصورة الشخصية', 'تم تحديث صورة الملف الشخصي بنجاح', 'success');
    }
  };

  // Remove Profile Image from Cloudinary & restore default avatar
  const removeProfileImage = async () => {
    const res = await api.removeProfileImage(
      { id: currentUser.id, role: currentRole }
    );
    if (res && res.user) {
      setCurrentUser(res.user);
      addToast('الصورة الشخصية', 'تم حذف الصورة واستعادة الصورة الافتراضية', 'info');
    }
  };

  // Cart Computations
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const shippingFee = useMemo(() => {
    if (cart.length === 0) return 0;
    return cartSubtotal >= 1000 ? 0 : 45;
  }, [cart, cartSubtotal]);

  const cartDiscountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    if (cartSubtotal < appliedDiscount.minOrderValue) return 0;
    const calc = (cartSubtotal * appliedDiscount.discountPercent) / 100;
    if (appliedDiscount.maxDiscount && calc > appliedDiscount.maxDiscount) {
      return appliedDiscount.maxDiscount;
    }
    return Math.round(calc);
  }, [cartSubtotal, appliedDiscount]);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal + shippingFee - cartDiscountAmount);
  }, [cartSubtotal, shippingFee, cartDiscountAmount]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
    addToast('تمت الإضافة إلى سلة المشتريات', `${product.title} (${quantity} قطعة)`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    addToast('تم الحذف', 'تم حذف المنتج من سلة المشتريات', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedDiscount(null);
  };

  const applyDiscountCode = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    try {
      const res = await api.validateCoupon(cleanCode, cartSubtotal);
      if (res && res.valid) {
        setAppliedDiscount(res.coupon);
        addToast('تم تطبيق الخصم', res.message || 'تم تطبيق الخصم بنجاح', 'success');
        return { success: true, message: res.message || 'تم تطبيق الخصم بنجاح' };
      } else {
        addToast('كود غير صالح', res.message || 'كود الخصم غير صحيح أو منتهي الصلاحية', 'error');
        return { success: false, message: res.message || 'كود الخصم غير صحيح أو منتهي الصلاحية' };
      }
    } catch (e: any) {
      addToast('كود غير صالح', e.message || 'كود الخصم غير صحيح أو منتهي الصلاحية', 'error');
      return { success: false, message: e.message || 'كود الخصم غير صحيح أو منتهي الصلاحية' };
    }
  };

  const removeDiscountCode = () => {
    setAppliedDiscount(null);
    addToast('تم إلغاء الكوبون', 'تمت إزالة كود الخصم من السلة', 'info');
  };

  // Favorites (Syncs with Database)
  const toggleFavorite = async (productId: string) => {
    const exists = favorites.includes(productId);
    if (exists) {
      setFavorites((prev) => prev.filter((id) => id !== productId));
      addToast('المفضلة', 'تمت إزالة المنتج من المفضلة', 'info');
    } else {
      setFavorites((prev) => [...prev, productId]);
      const prod = products.find((p) => p.id === productId) || adminProducts.find((p) => p.id === productId);
      addToast('المفضلة', `تمت إضافة "${prod?.title || 'المنتج'}" إلى المفضلة ❤️`, 'success');
    }

    try {
      const updatedFavs = await api.toggleFavorite(
        { id: currentUser.id, role: currentRole },
        productId
      );
      if (updatedFavs && Array.isArray(updatedFavs)) {
        setFavorites(updatedFavs);
      }
    } catch {
      // Keep optimistic update
    }
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  // Navigation helpers
  const navigateToProduct = (productId: string) => {
    setSelectedProductId(productId);
    setActivePageState('product-details');
    try {
      sessionStorage.setItem('elsa3ed_active_page', 'product-details');
      sessionStorage.setItem('elsa3ed_selected_product_id', productId);
      const targetUrl = `/products?id=${encodeURIComponent(productId)}`;
      window.history.pushState({ page: 'product-details', productId }, '', targetUrl);
    } catch { }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategoryFilter(categoryId);
    setActivePageState('category-details');
    try {
      sessionStorage.setItem('elsa3ed_active_page', 'category-details');
      sessionStorage.setItem('elsa3ed_selected_category_id', categoryId);
      const targetUrl = `/categories?id=${encodeURIComponent(categoryId)}`;
      window.history.pushState({ page: 'category-details', categoryId }, '', targetUrl);
    } catch { }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSeller = (sellerId: string) => {
    setSelectedSellerId(sellerId);
    setActivePageState('seller-details');
    try {
      sessionStorage.setItem('elsa3ed_active_page', 'seller-details');
      sessionStorage.setItem('elsa3ed_selected_seller_id', sellerId);
      const targetUrl = `/sellers?id=${encodeURIComponent(sellerId)}`;
      window.history.pushState({ page: 'seller-details', sellerId }, '', targetUrl);
    } catch { }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setActivePageState('order-details');
    try {
      sessionStorage.setItem('elsa3ed_active_page', 'order-details');
      sessionStorage.setItem('elsa3ed_selected_order_id', orderId);
      const targetUrl = `/orders?id=${encodeURIComponent(orderId)}`;
      window.history.pushState({ page: 'order-details', orderId }, '', targetUrl);
    } catch { }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Role Navigation
  const switchRole = (newRole: UserRole) => {
    if (newRole === 'guest') {
      logout();
      return;
    }
    if (!isAuthenticated) {
      setAuthModalTab(newRole === 'seller' ? 'register' : 'login');
      setIsAuthModalOpen(true);
      return;
    }
    if (currentUser.role === newRole) {
      setCurrentRole(newRole);
      if (newRole === 'admin') setActivePage('admin-dashboard');
      else if (newRole === 'seller') setActivePage('seller-dashboard');
      else setActivePage('home');
    } else {
      addToast('تنبيه الصلاحية', 'حسابك الحالي لا يمتلك هذه الصلاحية. يرجى تسجيل الدخول بالحساب المناسب.', 'warning');
      setIsAuthModalOpen(true);
    }
  };

  // Product Operations (Connected to Backend API)
  const addProduct = async (
    productData: Partial<Product>,
    initialStatus: ProductStatus = 'pending'
  ): Promise<Product> => {
    try {
      const created = await api.createSellerProduct(
        { id: currentUser.id, role: currentRole, sellerId: currentUser.id },
        productData,
        initialStatus
      );

      // Update local state
      setSellerProducts((prev) => [created, ...prev]);
      setAdminProducts((prev) => [created, ...prev]);

      if (created.approvalStatus === 'pending') {
        setPendingProducts((prev) => [created, ...prev]);
      } else if (created.approvalStatus === 'approved') {
        setProducts((prev) => [created, ...prev]);
      }

      addToast(
        initialStatus === 'pending' ? 'تم إرسال المنتج للمراجعة بنجاح' : 'تم حفظ المسودة بنجاح',
        `المنتج "${created.title}" مسجل الآن بحالة: ${created.approvalStatus === 'pending' ? 'قيد المراجعة من إدارة المنصة' : 'مسودة'
        }`,
        'success'
      );

      refreshAuditLogs();
      return created;
    } catch (err: any) {
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const submitProductForReview = async (productId: string): Promise<Product> => {
    try {
      const updated = await api.submitSellerProduct(
        { id: currentUser.id, role: currentRole, sellerId: currentUser.id },
        productId
      );

      setSellerProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      setAdminProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      setPendingProducts((prev) => [updated, ...prev.filter((p) => p.id !== productId)]);

      addToast(
        'تم إرسال المنتج للمراجعة بنجاح',
        `تم تقديم "${updated.title}" بنجاح لفريق فحص الجودة والأصالة`,
        'success'
      );

      refreshAuditLogs();
      return updated;
    } catch (err) {
      console.error('Error submitting product for review:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const updated = await api.updateSellerProduct(
        { id: currentUser.id, role: currentRole, sellerId: currentUser.id },
        id,
        updates
      );

      setSellerProducts((prev) => prev.map((prod) => (prod.id === id ? updated : prod)));
      setAdminProducts((prev) => prev.map((prod) => (prod.id === id ? updated : prod)));
      if (updated.approvalStatus === 'approved') {
        setProducts((prev) => prev.map((prod) => (prod.id === id ? updated : prod)));
      }

      addToast('تم التحديث', 'تم حفظ تعديلات المنتج بنجاح', 'success');
      return updated;
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.deleteSellerProduct(
        { id: currentUser.id, role: currentRole, sellerId: currentUser.id },
        id
      );
    } catch (e) {
      console.warn('API delete error:', e);
    }

    setSellerProducts((prev) => prev.filter((p) => p.id !== id));
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setAdminProducts((prev) => prev.filter((p) => p.id !== id));
    setPendingProducts((prev) => prev.filter((p) => p.id !== id));
    addToast('تم الحذف', 'تم حذف المنتج من النظام', 'info');
  };

  const approveProduct = async (id: string) => {
    try {
      const approved = await api.approveProduct({ id: currentUser.id, role: 'admin' }, id);

      setPendingProducts((prev) => prev.filter((p) => p.id !== id));
      setAdminProducts((prev) => prev.map((p) => (p.id === id ? approved : p)));
      setSellerProducts((prev) => prev.map((p) => (p.id === id ? approved : p)));

      setProducts((prev) => {
        const exists = prev.some((p) => p.id === id);
        return exists ? prev.map((p) => (p.id === id ? approved : p)) : [approved, ...prev];
      });

      addToast('تمت الموافقة بنجاح', `تم اعتماد المنتج "${approved.title}" ونشره بالسوق العام للجمهور`, 'success');
      refreshAuditLogs();
    } catch (err) {
      console.error('Error approving product:', err);
    }
  };

  const rejectProduct = async (id: string, reason: string) => {
    try {
      const rejected = await api.rejectProduct({ id: currentUser.id, role: 'admin' }, id, reason);

      setPendingProducts((prev) => prev.filter((p) => p.id !== id));
      setAdminProducts((prev) => prev.map((p) => (p.id === id ? rejected : p)));
      setSellerProducts((prev) => prev.map((p) => (p.id === id ? rejected : p)));
      setProducts((prev) => prev.filter((p) => p.id !== id));

      addToast('تم رفض المنتج', `تم رفض إدراج المنتج وإرسال سبب الرفض للورشة: "${reason}"`, 'warning');
      refreshAuditLogs();
    } catch (err) {
      console.error('Error rejecting product:', err);
    }
  };

  // Seller Actions
  const approveSeller = async (sellerId: string) => {
    try {
      const updated = await api.updateAdminSellerStatus({ id: currentUser.id, role: 'admin' }, sellerId, 'approved');
      setSellers((prev) =>
        prev.map((s) => (s.id === sellerId ? { ...s, ...updated, status: 'approved', verified: true } : s))
      );
      const seller = sellers.find((s) => s.id === sellerId);
      addAuditLog('اعتماد بائع', seller?.brandName || sellerId, 'تم اعتماد الحرفي وإصدار رخصة البيع الموثقة');
      addToast('تم اعتماد البائع', `تم توثيق متجر "${seller?.brandName || ''}" بنجاح`, 'success');
      refreshSellers();
    } catch (err: any) {
      addToast('خطأ', err.message || 'تعذر اعتماد البائع', 'error');
    }
  };

  const rejectSeller = async (sellerId: string, reason?: string) => {
    try {
      const updated = await api.updateAdminSellerStatus({ id: currentUser.id, role: 'admin' }, sellerId, 'rejected', reason);
      setSellers((prev) =>
        prev.map((s) => (s.id === sellerId ? { ...s, ...updated, status: 'rejected', verified: false, rejectionReason: reason } : s))
      );
      const seller = sellers.find((s) => s.id === sellerId);
      addAuditLog('رفض بائع', seller?.brandName || sellerId, `تم رفض طلب الانضمام${reason ? ` - السبب: ${reason}` : ''}`, 'تنبيه');
      addToast('تم الرفض', 'تم رفض طلب انضمام البائع بنجاح', 'warning');
      refreshSellers();
    } catch (err: any) {
      addToast('خطأ', err.message || 'تعذر رفض البائع', 'error');
    }
  };

  const suspendSeller = async (sellerId: string, reason?: string) => {
    try {
      const updated = await api.updateAdminSellerStatus({ id: currentUser.id, role: 'admin' }, sellerId, 'suspended', reason);
      setSellers((prev) =>
        prev.map((s) => (s.id === sellerId ? { ...s, ...updated, status: 'suspended', verified: false, suspensionReason: reason } : s))
      );
      const seller = sellers.find((s) => s.id === sellerId);
      addAuditLog('تعليق بائع', seller?.brandName || sellerId, `تم تعليق حساب الورشة مؤقتاً${reason ? ` - السبب: ${reason}` : ''}`, 'تنبيه');
      addToast('تم تعليق الحساب', `تم تعليق حساب ورشة "${seller?.brandName || ''}" مؤقتاً`, 'warning');
      refreshSellers();
    } catch (err: any) {
      addToast('خطأ', err.message || 'تعذر تعليق حساب البائع', 'error');
    }
  };

  const updateSellerStatus = async (sellerId: string, status: string, reason?: string) => {
    try {
      const updated = await api.updateAdminSellerStatus(
        { id: currentUser.id, role: 'admin' },
        sellerId,
        status,
        reason
      );
      setSellers((prev) => prev.map((s) => (s.id === sellerId ? updated : s)));
      addToast('تم تحديث حالة البائع', `تم تغيير الحالة إلى "${status}" بنجاح`, 'success');
      refreshAuditLogs();
    } catch (err: any) {
      console.error('Error updating seller status:', err);
    }
  };

  const updateSellerProfile = async (updates: Partial<Seller>) => {
    try {
      const updated = await api.updateSellerProfile(
        { id: currentUser.id, role: 'seller', sellerId: currentUser.id },
        updates
      );
      setSellers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      addToast('تم التحديث', 'تم حفظ بيانات الورشة والمتجر بنجاح', 'success');
    } catch (err: any) {
      console.error('Error updating seller profile:', err);
    }
  };

  const updateSeller = (sellerId: string, updates: Partial<Seller>) => {
    setSellers((prev) =>
      prev.map((s) => (s.id === sellerId ? { ...s, ...updates } : s))
    );
    addToast('تم التحديث', 'تم حفظ تعديلات الحساب والورشة بنجاح', 'success');
  };

  // Inventory Management
  const updateInventoryStock = async (productId: string, newStock: number, reason?: string) => {
    try {
      const res = await api.updateSellerInventoryStock(
        { id: currentUser.id, role: 'seller', sellerId: currentUser.id },
        productId,
        newStock,
        reason
      );

      setSellerProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stockCount: newStock, inStock: newStock > 0 } : p))
      );
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stockCount: newStock, inStock: newStock > 0 } : p))
      );
      setSellerInventory((prev) =>
        prev.map((item) =>
          item.productId === productId
            ? { ...item, currentStock: newStock, inStock: newStock > 0, stockStatus: newStock === 0 ? 'out_of_stock' : newStock <= 5 ? 'low_stock' : 'in_stock' }
            : item
        )
      );

      if (res.movement) {
        setStockMovements((prev) => [res.movement, ...prev]);
      }

      addToast('تم تعديل المخزون', `الكمية الجديدة للمنتج: ${newStock} قطعة`, 'success');
    } catch (err: any) {
      console.error('Error updating stock:', err);
    }
  };

  // Order Actions
  const createOrder = async (orderData: {
    address?: any;
    buyerName?: string;
    buyerPhone?: string;
    governorate?: Governorate;
    city?: string;
    addressText?: string;
    paymentMethod: PaymentMethod;
    paymentReference?: string;
    notes?: string;
  }): Promise<Order> => {
    const resolvedAddress = {
      fullName: orderData.buyerName || orderData.address?.fullName || orderData.address?.buyerName || currentUser.name || 'عميل سوق الصعيد',
      phone: orderData.buyerPhone || orderData.address?.phone || orderData.address?.buyerPhone || currentUser.phone || '01000000000',
      governorate: (orderData.governorate || orderData.address?.governorate || currentUser.governorate || 'القاهرة') as Governorate,
      city: orderData.city || orderData.address?.city || 'المدينة',
      streetAddress: orderData.addressText || orderData.address?.streetAddress || orderData.address?.address || 'العنوان',
      buildingNo: orderData.address?.buildingNo || '',
      notes: orderData.notes || orderData.address?.notes || ''
    };

    try {
      const createdOrder = await api.createOrder(
        { id: currentUser.id, role: currentRole },
        {
          shippingAddress: resolvedAddress,
          paymentMethod: orderData.paymentMethod,
          paymentReference: orderData.paymentReference,
          discountCode: appliedDiscount?.code,
          notes: orderData.notes
        }
      );

      const normalized = normalizeOrder(createdOrder);

      setOrders((prev) => [normalized, ...prev.filter((o) => o.id !== normalized.id)]);
      clearCart();

      // Deduct stock locally from products for immediate UI response
      setProducts((prev) =>
        prev.map((p) => {
          const item = normalized.items.find((it) => (it.product?.id || (it as any).productId) === p.id);
          if (item) {
            const newStock = Math.max(0, p.stockCount - item.quantity);
            return { ...p, stockCount: newStock, inStock: newStock > 0 };
          }
          return p;
        })
      );

      addToast(
        'تم تسجيل الطلب بنجاح',
        `رقم الطلب: ${createdOrder.orderNumber || createdOrder.id} - إجمالي الفاتورة: ${createdOrder.total} ج.م`,
        'success'
      );

      refreshAuditLogs();
      return createdOrder;
    } catch (err: any) {
      console.error('[AppContext] Error creating order:', err);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, note?: string) => {
    try {
      if (currentRole === 'seller') {
        const updated = await api.updateSellerOrderStatus(
          { id: currentUser.id, role: 'seller', sellerId: currentUser.id },
          orderId,
          newStatus,
          note
        );
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      } else if (currentRole === 'admin') {
        const updated = await api.updateAdminOrderStatus(
          { id: currentUser.id, role: 'admin' },
          orderId,
          newStatus,
          note
        );
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      }
      addToast('تحديث حالة الطلب', `تم تغيير حالة الطلب بنجاح إلى: "${newStatus}"`, 'success');
      refreshAuditLogs();
    } catch (err) {
      console.error('[AppContext] Error updating order status:', err);
    }
  };

  const cancelOrder = async (orderId: string, reason?: string) => {
    try {
      const cancelled = await api.cancelBuyerOrder(
        { id: currentUser.id, role: currentRole },
        orderId,
        reason
      );
      setOrders((prev) => prev.map((o) => (o.id === orderId ? cancelled : o)));
      addToast('إلغاء الطلب', 'تم إلغاء الطلب بنجاح', 'info');
      refreshPublicProducts();
    } catch (err) {
      console.error('[AppContext] Error cancelling order:', err);
    }
  };

  // Reviews
  const addReview = async (productId: string, rating: number, comment: string) => {
    try {
      const res = await api.createProductReview(
        { id: currentUser.id, role: currentRole },
        productId,
        rating,
        comment
      );

      const newRev: Review = res.data?.review || res.data || {
        id: `rev-${Date.now()}`,
        productId,
        userId: currentUser.id,
        userName: currentUser.name,
        userGovernorate: currentUser.governorate,
        rating,
        comment,
        date: 'الآن',
        verifiedPurchase: true,
        status: 'published'
      };

      setReviews((prev) => [newRev, ...prev]);
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            const newCount = p.reviewCount + 1;
            const newAvg = Number(((p.rating * p.reviewCount + rating) / newCount).toFixed(1));
            return { ...p, rating: newAvg, reviewCount: newCount };
          }
          return p;
        })
      );
      addToast('شكراً لتقييمك الموثق!', 'تم اعتماد تقييمك للقطعة التراثية بنجاح', 'success');
      refreshReviews();
    } catch (err: any) {
      const errMsg = err.message || 'فشل في إضافة التقييم';
      addToast('تنبيه التقييم', errMsg, 'warning');
    }
  };

  const moderateReview = async (reviewId: string, status: 'published' | 'hidden', reason?: string) => {
    try {
      const updated = await api.moderateAdminReview(
        { id: currentUser.id, role: 'admin' },
        reviewId,
        status,
        reason
      );
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
      addToast('إدارة التقييمات', `تم تغيير حالة التقييم إلى "${status === 'published' ? 'منشور' : 'مخفي'}"`, 'success');
      refreshAuditLogs();
    } catch (err: any) {
      console.error('Error moderating review:', err);
    }
  };

  // Discounts
  const addDiscountCoupon = (couponData: Omit<DiscountCoupon, 'id' | 'usageCount'>) => {
    const newCoupon: DiscountCoupon = {
      ...couponData,
      id: `disc-${Date.now()}`,
      usageCount: 0
    };
    setDiscounts((prev) => [newCoupon, ...prev]);
    addToast('تم إنشاء الكوبون', `تم إنشاء كود "${newCoupon.code}" بنجاح`, 'success');
  };

  const toggleDiscountStatus = (id: string) => {
    setDiscounts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, active: !d.active } : d))
    );
  };

  // Categories
  const addCategory = async (catData: Omit<Category, 'id' | 'productsCount'>) => {
    try {
      const created = await api.createAdminCategory({ id: currentUser.id, role: 'admin' }, catData);
      setCategories((prev) => [...prev, created]);
      addToast('تمت إضافة التصنيف', `تمت إضافة تصنيف "${created.name}" بنجاح`, 'success');
      refreshAuditLogs();
    } catch (err: any) {
      console.error('Error creating category:', err);
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const updated = await api.updateAdminCategory({ id: currentUser.id, role: 'admin' }, id, updates);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      addToast('تم التحديث', `تم تحديث تصنيف "${updated.name}" بنجاح`, 'success');
      refreshAuditLogs();
    } catch (err: any) {
      console.error('Error updating category:', err);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await api.deleteAdminCategory({ id: currentUser.id, role: 'admin' }, id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      addToast('تم الحذف', 'تم حذف التصنيف بنجاح', 'info');
      refreshAuditLogs();
    } catch (err: any) {
      console.error('Error deleting category:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        selectedProductId,
        setSelectedProductId,
        selectedCategoryId,
        setSelectedCategoryId,
        selectedSellerId,
        setSelectedSellerId,
        selectedOrderId,
        setSelectedOrderId,
        navigateToProduct,
        navigateToCategory,
        navigateToSeller,
        navigateToOrder,

        showIntroVideo,
        setShowIntroVideo,
        dismissIntroVideo,

        isAuthenticated,
        currentRole,
        setCurrentRole,
        currentUser,
        setCurrentUser,
        switchRole,
        login,
        register,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,

        products,
        sellerProducts,
        adminProducts,
        pendingProducts,
        categories,
        sellers,
        orders,
        reviews,
        discounts,
        auditLogs,
        isLoading,

        refreshPublicProducts,
        refreshSellerProducts,
        refreshAdminProducts,
        refreshAuditLogs,
        refreshOrders,
        refreshCategories,
        refreshSellers,
        refreshReviews,

        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        shippingFee,
        appliedDiscount,
        applyDiscountCode,
        removeDiscountCode,
        cartDiscountAmount,
        cartTotal,
        isCartDrawerOpen,
        setIsCartDrawerOpen,

        favorites,
        toggleFavorite,
        isFavorite,

        searchQuery,
        setSearchQuery,
        selectedGovernorateFilter,
        setSelectedGovernorateFilter,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        selectedHandmadeOnly,
        setSelectedHandmadeOnly,
        selectedSort,
        setSelectedSort,

        addProduct,
        submitProductForReview,
        updateProduct,
        deleteProduct,
        approveProduct,
        rejectProduct,

        approveSeller,
        rejectSeller,
        suspendSeller,
        updateSeller,
        updateSellerStatus,
        updateSellerProfile,

        sellerInventory,
        refreshSellerInventory,
        updateInventoryStock,
        stockMovements,
        refreshStockMovements,
        sellerStats,
        refreshSellerStats,

        createOrder,
        updateOrderStatus,
        cancelOrder,

        addReview,
        moderateReview,

        addDiscountCoupon,
        toggleDiscountStatus,

        addCategory,
        updateCategory,
        deleteCategory,

        uploadProfileImage,
        removeProfileImage,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
