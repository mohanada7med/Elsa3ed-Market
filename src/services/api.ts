import {
  Product,
  ProductStatus,
  Category,
  Seller,
  AuditLog,
  CraftStory,
  DiscountCoupon,
  PayoutRequest,
  SellerPayoutSummary,
  AdminPayoutSummary,
  PayoutMethod,
  CraftReel,
  CraftReelComment,
  Conversation,
  ChatMessage
} from '../types.ts';


const API_BASE = '/api';
const TOKEN_KEY = 'saeed_auth_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  } catch {}
}

export function clearStoredToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  count?: number;
}

function getAuthHeaders(user?: { id?: string; role?: string; sellerId?: string }, extraHeaders?: Record<string, string>): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders || {})
  };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-auth-token'] = token;
  }

  if (user?.id) {
    headers['x-user-id'] = user.id;
  }
  if (user?.role) {
    headers['x-user-role'] = user.role;
  }
  if (user?.sellerId) {
    headers['x-seller-id'] = user.sellerId;
  }
  return headers;
}

// Request deduplication and client-side micro-cache to eliminate duplicate network calls

const inFlightRequests = new Map<string, Promise<any>>();
const clientCache = new Map<string, { data: any; expiresAt: number }>();

export function clearClientCache() {
  clientCache.clear();
}

async function dedupedFetch<T>(
  url: string,
  options?: RequestInit,
  cacheTtlMs = 0
): Promise<T> {
  const method = (options?.method || 'GET').toUpperCase();
  if (method !== 'GET') {
    const res = await fetch(url, options);
    return res.json();
  }

  const key = `${url}:${JSON.stringify(options?.headers || {})}`;

  if (cacheTtlMs > 0) {
    const cached = clientCache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
  }

  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key)!;
  }

  const promise = (async () => {
    try {
      const res = await fetch(url, { ...options, credentials: options?.credentials || 'include' });
      const data = await res.json();
      if (cacheTtlMs > 0 && res.ok) {
        clientCache.set(key, { data, expiresAt: Date.now() + cacheTtlMs });
      }
      return data;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
}

export const api = {
  // Public Products
  async getPublicProducts(filters?: {
    categoryId?: string;
    governorate?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: string;
  }): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.categoryId && filters.categoryId !== 'all') params.append('categoryId', filters.categoryId);
    if (filters?.governorate && filters.governorate !== 'all') params.append('governorate', filters.governorate);
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const json: ApiResponse<Product[]> = await dedupedFetch(`${API_BASE}/products${queryStr}`, undefined, 10000);
    return json.data || [];
  },


  async getProductById(id: string, user?: { id?: string; role?: string }): Promise<Product | null> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      headers: getAuthHeaders(user)
    });
    if (!res.ok) return null;
    const json: ApiResponse<Product> = await res.json();
    return json.data || null;
  },

  // Seller API
  async getSellerProducts(user: { id: string; role: string; sellerId?: string }): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/seller/products`, {
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<Product[]> = await res.json();
    return json.data || [];
  },

  async createSellerProduct(
    user: { id: string; role: string; sellerId?: string },
    productData: Partial<Product>,
    status: ProductStatus = 'pending'
  ): Promise<Product> {
    const res = await fetch(`${API_BASE}/seller/products`, {
      method: 'POST',
      headers: getAuthHeaders(user),
      body: JSON.stringify({ ...productData, status })
    });
    const json: ApiResponse<Product> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في إضافة المنتج');
    }
    return json.data;
  },

  async submitSellerProduct(
    user: { id: string; role: string; sellerId?: string },
    productId: string
  ): Promise<Product> {
    const res = await fetch(`${API_BASE}/seller/products/${productId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<Product> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في إرسال المنتج للمراجعة');
    }
    return json.data;
  },

  async updateSellerProduct(
    user: { id: string; role: string; sellerId?: string },
    productId: string,
    updates: Partial<Product>
  ): Promise<Product> {
    const res = await fetch(`${API_BASE}/seller/products/${productId}`, {
      method: 'PUT',
      headers: getAuthHeaders(user),
      body: JSON.stringify(updates)
    });
    const json: ApiResponse<Product> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تحديث المنتج');
    }
    return json.data;
  },

  async deleteSellerProduct(
    user: { id: string; role: string; sellerId?: string },
    productId: string
  ): Promise<boolean> {
    const res = await fetch(`${API_BASE}/seller/products/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any> = await res.json();
    return !!json.success;
  },

  async uploadProductImage(
    user: { id?: string; role?: string; sellerId?: string },
    imageDataUri: string,
    filename?: string,
    productId?: string
  ): Promise<{ url: string; fileKey: string; productId: string }> {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: getAuthHeaders(user),
      body: JSON.stringify({
        image: imageDataUri,
        filename,
        folder: 'products',
        productId
      })
    });
    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في رفع الصورة إلى خدمة التخزين');
    }
    return json.data;
  },

  async uploadProductImages(
    user: { id?: string; role?: string; sellerId?: string },
    imagesDataUris: string[],
    productId?: string
  ): Promise<{ urls: string[]; keys: string[]; productId: string }> {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: getAuthHeaders(user),
      body: JSON.stringify({
        images: imagesDataUris,
        folder: 'products',
        productId
      })
    });
    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في رفع الصور إلى خدمة التخزين');
    }
    const results = json.data as Array<{ url: string; fileKey: string }>;
    return {
      urls: results.map(r => r.url),
      keys: results.map(r => r.fileKey),
      productId: json.productId || productId
    };
  },

  // Admin API
  async getAdminPendingProducts(user: { id: string; role: string }): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/admin/products/pending`, {
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<Product[]> = await res.json();
    return json.data || [];
  },

  async getAllAdminProducts(user: { id: string; role: string }, status?: ProductStatus): Promise<Product[]> {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/admin/products${query}`, {
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<Product[]> = await res.json();
    return json.data || [];
  },

  async approveProduct(user: { id: string; role: string }, productId: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/admin/products/${productId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<Product> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في اعتماد المنتج');
    }
    return json.data;
  },

  async rejectProduct(
    user: { id: string; role: string },
    productId: string,
    rejectionReason: string
  ): Promise<Product> {
    const res = await fetch(`${API_BASE}/admin/products/${productId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(user),
      body: JSON.stringify({ rejectionReason })
    });
    const json: ApiResponse<Product> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في رفض المنتج');
    }
    return json.data;
  },

  async getAdminAuditLogs(user: { id: string; role: string }): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<AuditLog[]> = await res.json();
    return json.data || [];
  },

  // Common
  async getCategories(): Promise<Category[]> {
    try {
      const json: ApiResponse<Category[]> = await dedupedFetch(`${API_BASE}/categories`, undefined, 60000);
      return json.data || [];
    } catch {
      return [];
    }
  },

  async getSellers(): Promise<Seller[]> {
    try {
      const json: ApiResponse<Seller[]> = await dedupedFetch(`${API_BASE}/sellers`, undefined, 60000);
      return json.data || [];
    } catch {
      return [];
    }
  },

  // Cart API
  async getCart(
    user?: { id?: string; role?: string },
    couponCode?: string,
    governorate?: string
  ): Promise<any> {
    const params = new URLSearchParams();
    if (couponCode) params.append('couponCode', couponCode);
    if (governorate) params.append('governorate', governorate);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE}/cart${query}`, {
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any> = await res.json();
    return json.data || null;
  },

  async addToCart(
    user: { id?: string; role?: string },
    productId: string,
    quantity = 1,
    selectedColor?: string,
    customNote?: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/cart/items`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(user),
      body: JSON.stringify({ productId, quantity, selectedColor, customNote })
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في إضافة المنتج للسلة');
    }
    return json.data;
  },

  async updateCartItem(
    user: { id?: string; role?: string },
    productId: string,
    quantity: number
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/cart/items/${productId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: getAuthHeaders(user),
      body: JSON.stringify({ quantity })
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تحديث السلة');
    }
    return json.data;
  },

  async removeCartItem(
    user: { id?: string; role?: string },
    productId: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/cart/items/${productId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في حذف المنتج من السلة');
    }
    return json.data;
  },

  async clearCart(user: { id?: string; role?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/cart`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any> = await res.json();
    return json.data;
  },

  // Order API
  async createOrder(
    user: { id?: string; role?: string },
    orderData: {
      shippingAddress: any;
      paymentMethod: string;
      paymentReference?: string;
      discountCode?: string;
      notes?: string;
    }
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(user),
      body: JSON.stringify(orderData)
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في إتمام الطلب');
    }
    return json.data;
  },

  async getBuyerOrders(user: { id?: string; role?: string }): Promise<any[]> {
    const res = await fetch(`${API_BASE}/orders`, {
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any[]> = await res.json();
    return json.data || [];
  },

  async getBuyerOrderById(user: { id?: string; role?: string }, orderId: string): Promise<any | null> {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, {
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    if (!res.ok) return null;
    const json: ApiResponse<any> = await res.json();
    return json.data || null;
  },

  async cancelBuyerOrder(
    user: { id?: string; role?: string },
    orderId: string,
    reason?: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(user),
      body: JSON.stringify({ reason })
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في إلغاء الطلب');
    }
    return json.data;
  },

  async getSellerOrders(user: { id: string; role: string; sellerId?: string }): Promise<any[]> {
    const res = await fetch(`${API_BASE}/seller/orders`, {
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any[]> = await res.json();
    return json.data || [];
  },

  async updateSellerOrderStatus(
    user: { id: string; role: string; sellerId?: string },
    orderId: string,
    status: string,
    note?: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/seller/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(user),
      body: JSON.stringify({ status, note })
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تحديث حالة الطلب');
    }
    return json.data;
  },

  async getAdminOrders(
    user: { id: string; role: string },
    filters?: { status?: string; governorate?: string; search?: string }
  ): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.governorate && filters.governorate !== 'all') params.append('governorate', filters.governorate);
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE}/admin/orders${query}`, {
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any[]> = await res.json();
    return json.data || [];
  },

  async updateAdminOrderStatus(
    user: { id: string; role: string },
    orderId: string,
    status?: string,
    paymentStatus?: string,
    trackingNumber?: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(user),
      body: JSON.stringify({ status, paymentStatus, trackingNumber })
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تحديث بيانات الطلب');
    }
    return json.data;
  },

  async adminVerifyOrderPayment(
    user: { id?: string; role?: string },
    orderId: string,
    adminNote?: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/verify-payment`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(user),
      body: JSON.stringify({ adminNote })
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تأكيد استلام الدفعة');
    }
    return json.data;
  },

  async adminRejectOrderPayment(
    user: { id?: string; role?: string },
    orderId: string,
    reason?: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/reject-payment`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(user),
      body: JSON.stringify({ reason })
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في رفض دفعة الطلب');
    }
    return json.data;
  },

  async getPublicPaymentConfig(): Promise<{
    instaPayAccount: string;
    vodafoneCashNumber: string;
    instaPayInstructions?: string;
    vodafoneCashInstructions?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE}/payment-config`);
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    } catch (e) {
      console.warn('Failed to fetch public payment config, using fallback defaults', e);
    }
    return {
      instaPayAccount: 'elsa3ed@instapay',
      vodafoneCashNumber: '01158969931',
      instaPayInstructions: 'قم بالتحويل عبر تطبيق إنستاباي إلى المعرف الموضح أعلاه واضغط على "تم التحويل".',
      vodafoneCashInstructions: 'قم بتحويل المبلغ إلى رقم فودافون كاش الموضح أعلاه واضغط على "تم التحويل".'
    };
  },

  async getAdminPaymentConfig(user: { id?: string; role?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/settings/payment`, {
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في جلب إعدادات الدفع');
    }
    return json.data;
  },

  async updateAdminPaymentConfig(
    user: { id?: string; role?: string },
    payload: {
      instaPayAccount?: string;
      vodafoneCashNumber?: string;
      instaPayInstructions?: string;
      vodafoneCashInstructions?: string;
    }
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/settings/payment`, {
      method: 'PUT',
      headers: getAuthHeaders(user),
      body: JSON.stringify(payload)
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تحديث إعدادات الدفع');
    }
    return json.data;
  },

  // ==================== PHASE 4: SELLER DASHBOARD, INVENTORY & ANALYTICS ====================
  async getSellerDashboardStats(user: { id: string; role: string; sellerId?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/seller/dashboard-stats`, {
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any> = await res.json();
    return json.data || null;
  },

  async getSellerAnalytics(
    user: { id: string; role: string; sellerId?: string },
    period: '7d' | '30d' | '90d' | 'all' = '30d'
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/seller/analytics?period=${period}`, {
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any> = await res.json();
    return json.data || null;
  },

  async getSellerInventory(user: { id: string; role: string; sellerId?: string }): Promise<any[]> {
    const res = await fetch(`${API_BASE}/seller/inventory`, {
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any[]> = await res.json();
    return json.data || [];
  },

  async updateSellerInventoryStock(
    user: { id: string; role: string; sellerId?: string },
    productId: string,
    newStock: number,
    reason?: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/seller/inventory/${productId}`, {
      method: 'PUT',
      headers: getAuthHeaders(user),
      body: JSON.stringify({ newStock, reason })
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تحديث المخزون');
    }
    return json.data;
  },

  async getSellerStockMovements(
    user: { id: string; role: string; sellerId?: string },
    productId?: string
  ): Promise<any[]> {
    const query = productId ? `?productId=${productId}` : '';
    const res = await fetch(`${API_BASE}/seller/inventory/movements${query}`, {
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any[]> = await res.json();
    return json.data || [];
  },

  async updateSellerProfile(
    user: { id: string; role: string; sellerId?: string },
    updates: Partial<Seller>
  ): Promise<Seller> {
    const res = await fetch(`${API_BASE}/seller/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(user),
      body: JSON.stringify(updates)
    });
    const json: ApiResponse<Seller> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تحديث بيانات المتجر');
    }
    return json.data;
  },

  async uploadSellerCoverImage(
    user: { id: string; role: string; sellerId?: string },
    imageDataUri: string,
    filename?: string
  ): Promise<{ url: string; fileKey: string }> {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: getAuthHeaders(user),
      body: JSON.stringify({
        image: imageDataUri,
        filename: filename || 'workshop-cover',
        folder: 'sellers'
      })
    });
    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في رفع صورة الغلاف إلى خدمة التخزين');
    }
    return json.data;
  },

  // ==================== PHASE 4: REVIEWS ====================
  async getProductReviews(productId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews`);
    const json: ApiResponse<any[]> = await res.json();
    return json.data || [];
  },

  async createProductReview(
    user: { id: string; role: string },
    productId: string,
    rating: number,
    comment: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(user),
      body: JSON.stringify({ rating, comment })
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في إرسال التقييم');
    }
    return json;
  },

  async getAdminReviews(
    user: { id: string; role: string },
    filters?: { productId?: string; status?: string; search?: string }
  ): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.productId) params.append('productId', filters.productId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE}/admin/reviews${query}`, {
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any[]> = await res.json();
    return json.data || [];
  },

  async moderateAdminReview(
    user: { id: string; role: string },
    reviewId: string,
    status: 'published' | 'hidden',
    reason?: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/reviews/${reviewId}/moderate`, {
      method: 'PUT',
      headers: getAuthHeaders(user),
      body: JSON.stringify({ status, reason })
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تعديل حالة التقييم');
    }
    return json.data;
  },

  // ==================== PHASE 4: CATEGORIES MANAGEMENT ====================
  async getAdminCategories(user: { id: string; role: string }): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/admin/categories`, {
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<Category[]> = await res.json();
    return json.data || [];
  },

  async createAdminCategory(user: { id: string; role: string }, data: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/admin/categories`, {
      method: 'POST',
      headers: getAuthHeaders(user),
      body: JSON.stringify(data)
    });
    const json: ApiResponse<Category> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في إنشاء القسم');
    }
    return json.data;
  },

  async updateAdminCategory(
    user: { id: string; role: string },
    id: string,
    data: Partial<Category>
  ): Promise<Category> {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(user),
      body: JSON.stringify(data)
    });
    const json: ApiResponse<Category> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تحديث القسم');
    }
    return json.data;
  },

  async deleteAdminCategory(user: { id: string; role: string }, id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'فشل في حذف القسم');
    }
    return true;
  },

  // ==================== CRAFT STORIES (أطلس الحرف وقصص الصنعة) ====================
  async getPublicCraftStories(filters?: { governorate?: string; categoryId?: string; search?: string }): Promise<CraftStory[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.governorate) params.set('governorate', filters.governorate);
      if (filters?.categoryId) params.set('categoryId', filters.categoryId);
      if (filters?.search) params.set('search', filters.search);
      const queryString = params.toString() ? `?${params.toString()}` : '';

      const json: ApiResponse<CraftStory[]> = await dedupedFetch(`${API_BASE}/craft-stories${queryString}`, undefined, 60000);
      return json.data || [];
    } catch {
      return [];
    }
  },

  async getCraftStoryById(id: string): Promise<CraftStory | null> {
    try {
      const res = await fetch(`${API_BASE}/craft-stories/${id}`);
      if (!res.ok) return null;
      const json: ApiResponse<CraftStory> = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async getAdminCraftStories(user: { id: string; role: string }): Promise<CraftStory[]> {
    const res = await fetch(`${API_BASE}/admin/craft-stories`, {
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<CraftStory[]> = await res.json();
    return json.data || [];
  },

  async createAdminCraftStory(
    user: { id: string; role: string },
    data: Partial<CraftStory>
  ): Promise<CraftStory> {
    const res = await fetch(`${API_BASE}/admin/craft-stories`, {
      method: 'POST',
      headers: getAuthHeaders(user),
      body: JSON.stringify(data)
    });
    const json: ApiResponse<CraftStory> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في إضافة قصة الصنعة');
    }
    return json.data;
  },

  async updateAdminCraftStory(
    user: { id: string; role: string },
    id: string,
    data: Partial<CraftStory>
  ): Promise<CraftStory> {
    const res = await fetch(`${API_BASE}/admin/craft-stories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(user),
      body: JSON.stringify(data)
    });
    const json: ApiResponse<CraftStory> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تحديث قصة الصنعة');
    }
    return json.data;
  },

  async deleteAdminCraftStory(user: { id: string; role: string }, id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/craft-stories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'فشل في حذف قصة الصنعة');
    }
    return true;
  },

  // ==================== PHASE 4: SELLERS MANAGEMENT ====================
  async getAdminSellers(
    user: { id: string; role: string },
    filters?: { status?: string; search?: string }
  ): Promise<Seller[]> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE}/admin/sellers${query}`, {
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<Seller[]> = await res.json();
    return json.data || [];
  },

  async updateAdminSellerStatus(
    user: { id: string; role: string },
    sellerId: string,
    status: string,
    reason?: string
  ): Promise<Seller> {
    const res = await fetch(`${API_BASE}/admin/sellers/${sellerId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(user),
      body: JSON.stringify({ status, reason })
    });
    const json: ApiResponse<Seller> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تحديث حالة البائع');
    }
    return json.data;
  },

  async updateAdminSellerProfile(
    user: { id: string; role: string },
    sellerId: string,
    updates: Partial<Seller>
  ): Promise<Seller> {
    const res = await fetch(`${API_BASE}/admin/sellers/${sellerId}`, {
      method: 'PUT',
      headers: getAuthHeaders(user),
      body: JSON.stringify(updates)
    });
    const json: ApiResponse<Seller> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تحديث بيانات وغلاف الورشة بواسطة الإدارة');
    }
    return json.data;
  },

  async createAdminProduct(
    user: { id: string; role: string },
    productData: any
  ): Promise<Product> {
    const res = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: getAuthHeaders(user),
      body: JSON.stringify(productData)
    });
    const json: ApiResponse<Product> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في إضافة المنتج بواسطة الإدارة');
    }
    return json.data;
  },

  async updateAdminProduct(
    user: { id: string; role: string },
    productId: string,
    updates: Partial<Product>
  ): Promise<Product> {
    const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
      method: 'PUT',
      headers: getAuthHeaders(user),
      body: JSON.stringify(updates)
    });
    const json: ApiResponse<Product> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تعديل بيانات المنتج بواسطة الإدارة');
    }
    return json.data;
  },

  async deleteAdminProduct(
    user: { id: string; role: string },
    productId: string
  ): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'فشل في حذف المنتج بواسطة الإدارة');
    }
    return true;
  },

  async getSellerStatus(user: { id: string; role: string; sellerId?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/seller/status`, {
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any> = await res.json();
    return json.data || null;
  },

  async registerSeller(params: {
    username: string;
    name: string;
    email?: string;
    password: string;
    phone: string;
    workshopName: string;
    governorate?: string;
    specialty?: string;
    avatar?: string;
  }): Promise<{ user: any; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register/seller`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const json: ApiResponse<{ user: any; token: string }> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تسجيل حساب الورشة');
    }
    if (json.data.token) {
      setStoredToken(json.data.token);
    }
    return json.data;
  },

  // ==================== ADMIN USER MANAGEMENT API ====================
  async getAdminUsers(
    user: { id: string; role: string },
    filters?: { search?: string; role?: string; status?: string; governorate?: string }
  ): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.governorate && filters.governorate !== 'all') params.append('governorate', filters.governorate);
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE}/admin/users${query}`, {
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any[]> = await res.json();
    return json.data || [];
  },

  async getAdminUserDetails(
    user: { id: string; role: string },
    userId: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'تعذر جلب تفاصيل المستخدم');
    }
    return json.data;
  },

  async deleteAdminUser(
    user: { id: string; role: string },
    userId: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'فشل في حذف حساب المستخدم');
    }
    return json.data || json;
  },

  async createAdminUser(
    user: { id: string; role: string },
    data: any
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      credentials: 'include',
      headers: { ...getAuthHeaders(user), 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في إنشاء حساب المستخدم');
    }
    return json.data;
  },

  async updateAdminUser(
    user: { id: string; role: string },
    userId: string,
    data: any
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { ...getAuthHeaders(user), 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تحديث بيانات المستخدم');
    }
    return json.data;
  },

  async toggleAdminUserStatus(
    user: { id: string; role: string },
    userId: string,
    status: 'active' | 'suspended' | 'blocked'
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { ...getAuthHeaders(user), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'فشل في تغيير حالة الحساب');
    }
    return json.data || json;
  },

  async resetAdminUserPassword(
    user: { id: string; role: string },
    userId: string,
    newPassword: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/reset-password`, {
      method: 'POST',
      credentials: 'include',
      headers: { ...getAuthHeaders(user), 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword })
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'فشل في إعادة تعيين كلمة المرور');
    }
    return json;
  },

  // ==================== FORGOT & RESET PASSWORD WORKFLOW API ====================

  async requestPasswordReset(username: string): Promise<{ success: boolean; message: string; data?: { requestId: string } }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'فشل في إرسال طلب استعادة كلمة المرور');
    }
    return json;
  },

  async changePersonalPassword(
    user: { id: string; role: string },
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      credentials: 'include',
      headers: { ...getAuthHeaders(user), 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'فشل في تغيير كلمة المرور');
    }
    return json;
  },

  async getAdminPasswordResets(
    user: { id: string; role: string },
    status?: string
  ): Promise<any[]> {
    const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    const res = await fetch(`${API_BASE}/admin/password-resets${query}`, {
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any[]> = await res.json();
    return json.data || [];
  },

  async completeAdminPasswordReset(
    user: { id: string; role: string },
    requestId: string,
    temporaryPassword: string
  ): Promise<{ success: boolean; message: string; temporaryPassword: string }> {
    const res = await fetch(`${API_BASE}/admin/password-resets/${requestId}/complete`, {
      method: 'POST',
      credentials: 'include',
      headers: { ...getAuthHeaders(user), 'Content-Type': 'application/json' },
      body: JSON.stringify({ temporaryPassword })
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'فشل في تعيين كلمة المرور المؤقتة');
    }
    return {
      success: true,
      message: json.message,
      temporaryPassword: json.data?.temporaryPassword
    };
  },

  async rejectAdminPasswordReset(
    user: { id: string; role: string },
    requestId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/password-resets/${requestId}/reject`, {
      method: 'POST',
      credentials: 'include',
      headers: { ...getAuthHeaders(user), 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'فشل في رفض الطلب');
    }
    return json;
  },

  // ==================== AUTH & PERSISTENCE API ====================
  async login(identifier: string, password: string): Promise<{ user: any; token?: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: identifier, email: identifier, password })
    });
    const json: ApiResponse<{ user: any; token?: string }> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل تسجيل الدخول');
    }
    if (json.data.token) {
      setStoredToken(json.data.token);
    }
    return json.data;
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    clearStoredToken();
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      const json = await res.json();
      return json;
    } catch {
      return { success: true, message: 'تم تسجيل الخروج بنجاح' };
    }
  },

  async register(params: {
    username: string;
    name: string;
    email?: string;
    password: string;
    phone: string;
    role: string;
    governorate?: string;
    workshopName?: string;
    specialty?: string;
    avatar?: string;
  }): Promise<{ user: any; token?: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const json: ApiResponse<{ user: any; token?: string }> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل إنشاء الحساب');
    }
    if (json.data.token) {
      setStoredToken(json.data.token);
    }
    return json.data;
  },


  async getMe(user?: { id?: string; role?: string }): Promise<any> {
    try {
      const json: ApiResponse<any> = await dedupedFetch(`${API_BASE}/auth/me`, {
        credentials: 'include',
        headers: getAuthHeaders(user)
      }, 5000);
      return (json && json.success && json.data) ? json.data : null;
    } catch {
      return null;
    }
  },

  async updateProfile(user: { id: string; role: string }, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      credentials: 'include',
      headers: getAuthHeaders(user),
      body: JSON.stringify(data)
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل تحديث البيانات الشخصية');
    }
    return json.data;
  },

  async uploadProfileImage(
    user: { id?: string; role?: string },
    imageDataUri: string,
    filename?: string
  ): Promise<{ url: string; fileKey: string; user: any }> {
    const res = await fetch(`${API_BASE}/auth/profile/image`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(user),
      body: JSON.stringify({
        image: imageDataUri,
        filename
      })
    });
    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في رفع صورة الملف الشخصي');
    }
    return {
      url: json.data.avatar,
      fileKey: json.data.profileImage?.publicId,
      user: json.data
    };
  },

  async removeProfileImage(
    user: { id?: string; role?: string }
  ): Promise<{ user: any }> {
    const res = await fetch(`${API_BASE}/auth/profile/image`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في حذف صورة الملف الشخصي');
    }
    return {
      user: json.data
    };
  },

  async getFavorites(user: { id: string; role: string }): Promise<string[]> {
    const res = await fetch(`${API_BASE}/auth/favorites`, {
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<string[]> = await res.json();
    return json.data || [];
  },

  async toggleFavorite(user: { id: string; role: string }, productId: string): Promise<string[]> {
    const res = await fetch(`${API_BASE}/auth/favorites/toggle`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(user),
      body: JSON.stringify({ productId })
    });
    const json: ApiResponse<{ isFavorite: boolean; favorites: string[] }> = await res.json();
    return json.data?.favorites || [];
  },

  async getNotifications(user: { id: string; role: string }): Promise<any[]> {
    const res = await fetch(`${API_BASE}/auth/notifications`, {
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any[]> = await res.json();
    return json.data || [];
  },

  async markNotificationRead(user: { id: string; role: string }, notificationId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/auth/notifications/${notificationId}/read`, {
      method: 'PATCH',
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any> = await res.json();
    return json.success || false;
  },

  async validateCoupon(code: string, subtotal: number): Promise<any> {
    const res = await fetch(`${API_BASE}/discounts/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'كود الخصم غير صالح');
    }
    return json.data;
  },

  async getRecommendations(productId?: string, categoryId?: string, limit = 4): Promise<Product[]> {
    const params = new URLSearchParams();
    if (productId) params.append('productId', productId);
    if (categoryId) params.append('categoryId', categoryId);
    if (limit) params.append('limit', limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE}/recommendations${query}`);
    const json: ApiResponse<Product[]> = await res.json();
    return json.data || [];
  },

  async getHealth(): Promise<{ status: string; database: string }> {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // ==================== ADMIN DISCOUNTS MANAGEMENT ====================
  async getAdminDiscounts(user: { id: string; role: string }): Promise<DiscountCoupon[]> {
    const res = await fetch(`${API_BASE}/admin/discounts`, {
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<DiscountCoupon[]> = await res.json();
    return json.data || [];
  },

  async createAdminDiscount(
    user: { id: string; role: string },
    data: {
      code: string;
      discountPercent: number;
      maxDiscount?: number;
      minOrderValue: number;
      active?: boolean;
      validUntil?: string;
      description?: string;
    }
  ): Promise<DiscountCoupon> {
    const res = await fetch(`${API_BASE}/admin/discounts`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(user),
      body: JSON.stringify(data)
    });
    const json: ApiResponse<DiscountCoupon> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في إنشاء كود الخصم');
    }
    return json.data;
  },

  async updateAdminDiscount(
    user: { id: string; role: string },
    id: string,
    data: Partial<DiscountCoupon>
  ): Promise<DiscountCoupon> {
    const res = await fetch(`${API_BASE}/admin/discounts/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: getAuthHeaders(user),
      body: JSON.stringify(data)
    });
    const json: ApiResponse<DiscountCoupon> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تعديل كود الخصم');
    }
    return json.data;
  },

  async deleteAdminDiscount(
    user: { id: string; role: string },
    id: string
  ): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/discounts/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'فشل في حذف كود الخصم');
    }
    return true;
  },

  async toggleAdminDiscount(
    user: { id: string; role: string },
    id: string
  ): Promise<DiscountCoupon> {
    const res = await fetch(`${API_BASE}/admin/discounts/${id}/toggle`, {
      method: 'PATCH',
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<DiscountCoupon> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تغيير حالة كود الخصم');
    }
    return json.data;
  },

  // ==================== SELLER PAYOUT API ====================

  async createSellerPayout(
    user: { id: string; role: string; sellerId?: string },
    data: { amount: number; notes?: string }
  ): Promise<PayoutRequest> {
    const res = await fetch(`${API_BASE}/seller/payouts`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(user),
      body: JSON.stringify(data)
    });
    const json: ApiResponse<PayoutRequest> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في إرسال طلب صرف المستحقات');
    }
    return json.data;
  },

  async getSellerPayouts(
    user: { id: string; role: string; sellerId?: string }
  ): Promise<{ payouts: PayoutRequest[]; summary: SellerPayoutSummary }> {
    const res = await fetch(`${API_BASE}/seller/payouts`, {
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<PayoutRequest[]> & { summary?: SellerPayoutSummary } = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'فشل في جلب طلبات صرف المستحقات');
    }
    return {
      payouts: json.data || [],
      summary: json.summary || {
        totalEarnings: 0,
        totalSalesCount: 0,
        totalPaid: 0,
        pendingProcessing: 0,
        availableBalance: 0,
        hasPayoutInfo: false
      }
    };
  },

  async getSellerPayoutById(
    user: { id: string; role: string; sellerId?: string },
    id: string
  ): Promise<PayoutRequest> {
    const res = await fetch(`${API_BASE}/seller/payouts/${id}`, {
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<PayoutRequest> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'طلب الصرف غير موجود');
    }
    return json.data;
  },

  async cancelSellerPayout(
    user: { id: string; role: string; sellerId?: string },
    id: string
  ): Promise<PayoutRequest> {
    const res = await fetch(`${API_BASE}/seller/payouts/${id}/cancel`, {
      method: 'PATCH',
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<PayoutRequest> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في إلغاء طلب صرف المستحقات');
    }
    return json.data;
  },

  // ==================== ADMIN PAYOUT API ====================

  async getAdminPayouts(
    user: { id: string; role: string },
    filters?: { status?: string; search?: string }
  ): Promise<{ payouts: PayoutRequest[]; summary: AdminPayoutSummary }> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/admin/payouts${queryStr}`, {
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<PayoutRequest[]> & { summary?: AdminPayoutSummary } = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'فشل في جلب طلبات صرف المستحقات');
    }
    return {
      payouts: json.data || [],
      summary: json.summary || {
        totalPendingCount: 0,
        totalPendingAmount: 0,
        totalApprovedProcessingCount: 0,
        totalApprovedProcessingAmount: 0,
        totalPaidCount: 0,
        totalPaidAmount: 0,
        totalRejectedCount: 0
      }
    };
  },

  async getAdminPayoutById(
    user: { id: string; role: string },
    id: string
  ): Promise<{
    payout: PayoutRequest;
    seller: Seller | null;
    currentAvailableBalance: number;
    sellerPreviousPayouts: PayoutRequest[];
    totalSellerEarnings: number;
  }> {
    const res = await fetch(`${API_BASE}/admin/payouts/${id}`, {
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في جلب تفاصيل طلب الصرف');
    }
    return json.data;
  },

  async approveAdminPayout(
    user: { id: string; role: string },
    id: string,
    note?: string
  ): Promise<PayoutRequest> {
    const res = await fetch(`${API_BASE}/admin/payouts/${id}/approve`, {
      method: 'PATCH',
      credentials: 'include',
      headers: getAuthHeaders(user),
      body: JSON.stringify({ note })
    });
    const json: ApiResponse<PayoutRequest> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في الموافقة على طلب الصرف');
    }
    return json.data;
  },

  async rejectAdminPayout(
    user: { id: string; role: string },
    id: string,
    reason: string
  ): Promise<PayoutRequest> {
    const res = await fetch(`${API_BASE}/admin/payouts/${id}/reject`, {
      method: 'PATCH',
      credentials: 'include',
      headers: getAuthHeaders(user),
      body: JSON.stringify({ reason })
    });
    const json: ApiResponse<PayoutRequest> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في رفض طلب الصرف');
    }
    return json.data;
  },

  async markAdminPayoutProcessing(
    user: { id: string; role: string },
    id: string
  ): Promise<PayoutRequest> {
    const res = await fetch(`${API_BASE}/admin/payouts/${id}/processing`, {
      method: 'PATCH',
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<PayoutRequest> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تحديث حالة الطلب إلى قيد التنفيذ');
    }
    return json.data;
  },

  async markAdminPayoutPaid(
    user: { id: string; role: string },
    id: string,
    data: {
      transactionReference: string;
      paymentMethod?: PayoutMethod;
      paidAmount?: number;
      paymentDate?: string;
      adminNote?: string;
    }
  ): Promise<PayoutRequest> {
    const res = await fetch(`${API_BASE}/admin/payouts/${id}/paid`, {
      method: 'PATCH',
      credentials: 'include',
      headers: getAuthHeaders(user),
      body: JSON.stringify(data)
    });
    const json: ApiResponse<PayoutRequest> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تأكيد تحويل المبلغ وتسجيل الدفع');
    }
    return json.data;
  },

  // ==================== CRAFT REELS API (DATABASE-POWERED) ====================
  async getReels(filters?: {
    sellerId?: string;
    governorate?: string;
    craftType?: string;
    search?: string;
    featuredOnly?: boolean;
  }): Promise<CraftReel[]> {
    const params = new URLSearchParams();
    if (filters?.sellerId && filters.sellerId !== 'all') params.append('sellerId', filters.sellerId);
    if (filters?.governorate && filters.governorate !== 'all') params.append('governorate', filters.governorate);
    if (filters?.craftType && filters.craftType !== 'all') params.append('craftType', filters.craftType);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.featuredOnly) params.append('featuredOnly', 'true');

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/reels${queryStr}`);
    const json: ApiResponse<CraftReel[]> = await res.json();
    return json.data || [];
  },

  async getReelById(id: string): Promise<CraftReel | null> {
    const res = await fetch(`${API_BASE}/reels/${id}`);
    const json: ApiResponse<CraftReel> = await res.json();
    return json.data || null;
  },

  async getReelUploadSignature(
    user: { id?: string; role?: string; sellerId?: string },
    filename = 'reel_video.mp4',
    targetSellerId?: string
  ): Promise<{
    directUpload: boolean;
    data?: {
      signature: string;
      timestamp: number;
      apiKey: string;
      cloudName: string;
      folder: string;
      publicId: string;
      resourceType: 'video';
    };
  }> {
    const params = new URLSearchParams({ filename });
    if (targetSellerId) {
      params.append('targetSellerId', targetSellerId);
    }
    const res = await fetch(`${API_BASE}/reels/upload-signature?${params.toString()}`, {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'تعذر الحصول على ترخيص الرفع السحابي');
    }
    return json;
  },

  /**
   * Upload video with real upload progress tracking (XMLHttpRequest progress events)
   * Exclusively uses direct Cloudinary signed chunked upload to completely bypass server/proxy payload limits (avoiding 413 & timeouts).
   * Supports massive video files (up to 2GB+) by slicing into reliable 6MB chunks with automatic per-chunk retries and progress aggregation.
   */
  uploadReelVideoWithProgress(options: {
    user: { id?: string; role?: string; sellerId?: string };
    file: File | Blob;
    filename?: string;
    onProgress?: (info: {
      loaded: number;
      total: number;
      percentage: number;
      state: 'uploading' | 'processing';
      currentChunk?: number;
      totalChunks?: number;
    }) => void;
    onCancelRef?: (cancelFn: () => void) => void;
    targetSellerId?: string;
  }): Promise<{ url: string; fileKey: string; cloudinaryPublicId: string; duration?: number; format?: string }> {
    return new Promise(async (resolve, reject) => {
      const { user, file, filename: customFilename, onProgress, onCancelRef, targetSellerId } = options;
      const fileName = customFilename || (file instanceof File ? file.name : 'reel_video.mp4');
      const fileSize = file.size;

      if (!file || fileSize <= 0) {
        return reject(new Error('ملف الفيديو المحدد فارغ أو غير صالح'));
      }

      let isCancelled = false;
      let activeXhr: XMLHttpRequest | null = null;

      if (onCancelRef) {
        onCancelRef(() => {
          isCancelled = true;
          if (activeXhr) {
            try {
              activeXhr.abort();
            } catch {}
          }
        });
      }

      try {
        // Step 1: Request signed upload payload from server
        let signatureResponse;
        try {
          signatureResponse = await api.getReelUploadSignature(user, fileName, targetSellerId);
        } catch (sigErr: any) {
          console.warn('[VideoUpload] Signature request failed:', sigErr);
          if (fileSize > 4 * 1024 * 1024) {
            return reject(
              new Error(
                sigErr?.message ||
                  'تعذر الحصول على ترخيص الرفع السحابي للفيديو. يرجى التأكد من تسجيل الدخول والمحاولة مجدداً.'
              )
            );
          }
        }

        if (signatureResponse?.directUpload && signatureResponse.data) {
          // Direct Cloudinary Signed Chunked Upload (Zero Server Proxy Overhead — Completely bypasses Vercel/Proxy 413 limits)
          const sig = signatureResponse.data;
          const uploadUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`;
          const uniqueUploadId = `cld_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

          // Standard Cloudinary chunk size: 6MB (Cloudinary requires minimum 5MB for chunked uploads except last chunk)
          const CHUNK_SIZE = 6 * 1024 * 1024;
          const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
          const isChunked = fileSize > CHUNK_SIZE;

          let finalResult: any = null;

          for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            if (isCancelled) {
              return reject(new Error('تم إلغاء عملية الرفع'));
            }

            const start = chunkIndex * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, fileSize);
            const isLastChunk = chunkIndex === totalChunks - 1;
            const chunkBlob = file.slice(start, end);

            // Execute chunk upload with up to 3 retries on transient network errors
            let chunkSuccess = false;
            let lastChunkError: any = null;

            for (let attempt = 1; attempt <= 3; attempt++) {
              if (isCancelled) {
                return reject(new Error('تم إلغاء عملية الرفع'));
              }

              try {
                const chunkResponse = await new Promise<any>((chunkResolve, chunkReject) => {
                  const xhr = new XMLHttpRequest();
                  activeXhr = xhr;

                  xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable && event.total > 0) {
                      const cumulativeLoaded = start + event.loaded;
                      const percentage = Math.min(99, Math.round((cumulativeLoaded / fileSize) * 100));
                      onProgress?.({
                        loaded: cumulativeLoaded,
                        total: fileSize,
                        percentage,
                        state: isLastChunk && percentage >= 99 ? 'processing' : 'uploading',
                        currentChunk: chunkIndex + 1,
                        totalChunks
                      });
                    }
                  };

                  xhr.open('POST', uploadUrl);

                  if (isChunked) {
                    xhr.setRequestHeader('X-Unique-Upload-Id', uniqueUploadId);
                    xhr.setRequestHeader('Content-Range', `bytes ${start}-${end - 1}/${fileSize}`);
                  }

                  xhr.timeout = 180000; // 3 minutes timeout per 6MB chunk

                  xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                      try {
                        const parsed = xhr.responseText ? JSON.parse(xhr.responseText) : {};
                        chunkResolve(parsed);
                      } catch {
                        chunkResolve({});
                      }
                    } else {
                      try {
                        const errJson = JSON.parse(xhr.responseText);
                        const cloudErr = errJson?.error?.message || `HTTP ${xhr.status}`;
                        chunkReject(new Error(cloudErr));
                      } catch {
                        chunkReject(new Error(`فشل رفع الجزء (${xhr.status})`));
                      }
                    }
                  };

                  xhr.onerror = () => {
                    chunkReject(new Error('انقطع الاتصال بالإنترنت أثناء رفع الفيديو'));
                  };

                  xhr.ontimeout = () => {
                    chunkReject(new Error('انتهت مهلة رفع الجزء السحابي'));
                  };

                  xhr.onabort = () => {
                    chunkReject(new Error('تم إلغاء عملية الرفع'));
                  };

                  const formData = new FormData();
                  formData.append('file', chunkBlob);
                  formData.append('api_key', sig.apiKey);
                  formData.append('timestamp', String(sig.timestamp));
                  formData.append('signature', sig.signature);
                  formData.append('folder', sig.folder);
                  formData.append('public_id', sig.publicId);

                  xhr.send(formData);
                });

                chunkSuccess = true;
                if (isLastChunk || chunkResponse?.secure_url || chunkResponse?.public_id) {
                  finalResult = chunkResponse;
                }
                break;
              } catch (err: any) {
                lastChunkError = err;
                if (err?.message === 'تم إلغاء عملية الرفع' || isCancelled) {
                  return reject(new Error('تم إلغاء عملية الرفع'));
                }
                // If attempt < 3, wait briefly before retrying chunk
                if (attempt < 3) {
                  await new Promise((r) => setTimeout(r, attempt * 1000));
                }
              }
            }

            if (!chunkSuccess) {
              const errMsg = lastChunkError?.message || 'فشل في رفع أجزاء الفيديو إلى السحابة';
              if (errMsg.toLowerCase().includes('too large') || errMsg.includes('413')) {
                return reject(
                  new Error('حجم ملف الفيديو يتجاوز السعة السحابية المسموحة في باقة Cloudinary.')
                );
              }
              return reject(new Error(`خطأ في الرفع السحابي (الجزء ${chunkIndex + 1}): ${errMsg}`));
            }
          }

          // Complete upload progress
          onProgress?.({
            loaded: fileSize,
            total: fileSize,
            percentage: 100,
            state: 'processing',
            currentChunk: totalChunks,
            totalChunks
          });

          if (finalResult && (finalResult.secure_url || finalResult.url || finalResult.public_id)) {
            return resolve({
              url: finalResult.secure_url || finalResult.url,
              fileKey: finalResult.public_id || sig.publicId,
              cloudinaryPublicId: finalResult.public_id || sig.publicId,
              duration: finalResult.duration,
              format: finalResult.format
            });
          }

          // Fallback if response didn't include url but public_id was uploaded
          const deliveryUrl = `https://res.cloudinary.com/${sig.cloudName}/video/upload/${sig.folder}/${sig.publicId}.mp4`;
          return resolve({
            url: deliveryUrl,
            fileKey: `${sig.folder}/${sig.publicId}`,
            cloudinaryPublicId: `${sig.folder}/${sig.publicId}`
          });
        } else {
          // Fallback: Local / Server-side Multipart Stream Upload (for non-Cloudinary setups)
          const formData = new FormData();
          formData.append('videoFile', file, fileName);
          formData.append('filename', fileName);
          formData.append('mimeType', file.type || 'video/mp4');
          if (targetSellerId) {
            formData.append('targetSellerId', targetSellerId);
          }

          const xhr = new XMLHttpRequest();
          activeXhr = xhr;

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && event.total > 0) {
              const percentage = Math.min(99, Math.round((event.loaded / event.total) * 100));
              onProgress?.({
                loaded: event.loaded,
                total: event.total,
                percentage,
                state: percentage >= 99 ? 'processing' : 'uploading'
              });
            }
          };

          xhr.open('POST', `${API_BASE}/reels/upload-video`);
          xhr.withCredentials = true;

          const authHeaders = getAuthHeaders(user);
          for (const [key, value] of Object.entries(authHeaders)) {
            if (key.toLowerCase() !== 'content-type') {
              xhr.setRequestHeader(key, value);
            }
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const result = JSON.parse(xhr.responseText);
                if (result.success && result.data) {
                  resolve(result.data);
                } else {
                  reject(new Error(result.error || 'فشل في حفظ الفيديو المرفوع'));
                }
              } catch {
                reject(new Error('فشل في معالجة استجابة الخادم'));
              }
            } else {
              try {
                const errJson = JSON.parse(xhr.responseText);
                if (xhr.status === 413) {
                  reject(new Error('حجم ملف الفيديو يتجاوز الحد الأقصى المسموح به لخادم التطبيق (413).'));
                } else {
                  reject(new Error(errJson.error || `فشل رفع الفيديو (${xhr.status})`));
                }
              } catch {
                if (xhr.status === 413) {
                  reject(new Error('حجم ملف الفيديو يتجاوز الحد الأقصى المسموح به لخادم التطبيق (413).'));
                } else {
                  reject(new Error(`فشل رفع الفيديو (${xhr.status})`));
                }
              }
            }
          };

          xhr.onerror = () => {
            reject(new Error('انقطع الاتصال بالإنترنت أثناء رفع الفيديو'));
          };

          xhr.onabort = () => {
            reject(new Error('تم إلغاء عملية الرفع'));
          };

          xhr.send(formData);
        }
      } catch (err: any) {
        reject(err);
      } finally {
        activeXhr = null;
      }
    });
  },

  async deleteReelAsset(
    user: { id?: string; role?: string; sellerId?: string },
    fileKey: string
  ): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/reels/delete-asset`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(user),
        body: JSON.stringify({ fileKey })
      });
      const json = await res.json();
      return Boolean(json.success && json.deleted);
    } catch {
      return false;
    }
  },

  async uploadReelVideo(
    user: { id?: string; role?: string; sellerId?: string },
    videoDataUriOrFile: string | File | Blob,
    filename = 'reel_video.mp4',
    targetSellerId?: string
  ): Promise<{ url: string; fileKey: string; duration?: number; format?: string }> {
    // If a File or Blob or Base64 is passed, route through direct Cloudinary signed upload to avoid 413
    let fileObj: File | Blob;
    if (typeof videoDataUriOrFile === 'string') {
      if (videoDataUriOrFile.startsWith('data:')) {
        const parts = videoDataUriOrFile.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'video/mp4';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        fileObj = new Blob([u8arr], { type: mime });
      } else {
        throw new Error('صيغة الفيديو غير صالحة');
      }
    } else {
      fileObj = videoDataUriOrFile;
    }

    return api.uploadReelVideoWithProgress({
      user,
      file: fileObj,
      filename,
      targetSellerId
    });
  },


  async createReel(
    user: { id?: string; role?: string; sellerId?: string },
    data: Partial<CraftReel>
  ): Promise<CraftReel> {
    const res = await fetch(`${API_BASE}/reels`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(user),
      body: JSON.stringify(data)
    });
    const json: ApiResponse<CraftReel> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في حفظ مقطع الفيديو في قاعدة البيانات');
    }
    return json.data;
  },

  async updateReel(
    user: { id?: string; role?: string; sellerId?: string },
    id: string,
    data: Partial<CraftReel>
  ): Promise<CraftReel> {
    const res = await fetch(`${API_BASE}/reels/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: getAuthHeaders(user),
      body: JSON.stringify(data)
    });
    const json: ApiResponse<CraftReel> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تحديث مقطع الفيديو');
    }
    return json.data;
  },

  async deleteReel(
    user: { id?: string; role?: string; sellerId?: string },
    id: string
  ): Promise<boolean> {
    const res = await fetch(`${API_BASE}/reels/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'فشل في حذف مقطع الفيديو');
    }
    return true;
  },

  async bulkDeleteReels(
    user: { id?: string; role?: string; sellerId?: string },
    ids: string[]
  ): Promise<number> {
    const res = await fetch(`${API_BASE}/reels/bulk-delete`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(user),
      body: JSON.stringify({ ids })
    });
    const json: any = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'فشل في الحذف الجماعي لمقاطع الفيديو');
    }
    return json.deletedCount || ids.length;
  },

  async likeReel(id: string, isLiked: boolean): Promise<number> {
    const res = await fetch(`${API_BASE}/reels/${id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isLiked })
    });
    const json = await res.json();
    return json.likesCount || 0;
  },

  async incrementReelView(id: string): Promise<number> {
    const res = await fetch(`${API_BASE}/reels/${id}/view`, {
      method: 'POST'
    });
    const json = await res.json();
    return json.viewsCount || 0;
  },

  async incrementReelShare(id: string): Promise<number> {
    const res = await fetch(`${API_BASE}/reels/${id}/share`, {
      method: 'POST'
    });
    const json = await res.json();
    return json.sharesCount || 0;
  },

  async addReelComment(
    id: string,
    commentData: { userName: string; comment: string; userAvatar?: string; governorate?: string }
  ): Promise<CraftReelComment> {
    const res = await fetch(`${API_BASE}/reels/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData)
    });
    const json: ApiResponse<CraftReelComment> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في إضافة التعليق');
    }
    return json.data;
  },

  // ==================== LIVE CHAT & MESSAGING ====================

  async getChatUnreadCount(user?: { id?: string; role?: string; sellerId?: string }): Promise<number> {
    try {
      const res = await fetch(`${API_BASE}/chat/unread-count`, {
        headers: getAuthHeaders(user)
      });
      const json = await res.json();
      return json.unreadCount || 0;
    } catch {
      return 0;
    }
  },

  async getConversations(user?: { id?: string; role?: string; sellerId?: string }): Promise<Conversation[]> {
    const res = await fetch(`${API_BASE}/chat/conversations`, {
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<Conversation[]> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في تحميل المحادثات');
    }
    return json.data;
  },

  async getOrCreateConversation(
    data: { sellerId: string; productId?: string; orderId?: string; initialMessage?: string },
    user?: { id?: string; role?: string; sellerId?: string }
  ): Promise<Conversation> {
    const res = await fetch(`${API_BASE}/chat/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(user),
      body: JSON.stringify(data)
    });
    const json: ApiResponse<Conversation> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.message || json.error || 'فشل في فتح المحادثة');
    }
    return json.data;
  },

  async getConversation(
    id: string,
    user?: { id?: string; role?: string; sellerId?: string }
  ): Promise<Conversation> {
    const res = await fetch(`${API_BASE}/chat/conversations/${id}`, {
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<Conversation> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في جلب المحادثة');
    }
    return json.data;
  },

  async getMessages(
    conversationId: string,
    user?: { id?: string; role?: string; sellerId?: string },
    limit: number = 50,
    before?: string
  ): Promise<ChatMessage[]> {
    const query = new URLSearchParams({ limit: limit.toString() });
    if (before) query.append('before', before);

    const res = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages?${query.toString()}`, {
      headers: getAuthHeaders(user)
    });
    const json: ApiResponse<ChatMessage[]> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'فشل في جلب الرسائل');
    }
    return json.data;
  },

  async sendMessage(
    conversationId: string,
    data: { text: string; messageType?: 'text' | 'image' | 'product_reference' },
    user?: { id?: string; role?: string; sellerId?: string }
  ): Promise<{ message: ChatMessage; conversation: Conversation }> {
    const res = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(user),
      body: JSON.stringify(data)
    });
    const json: any = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.message || json.error || 'فشل في إرسال الرسالة');
    }
    return {
      message: json.data,
      conversation: json.conversation
    };
  },

  async markConversationRead(
    conversationId: string,
    user?: { id?: string; role?: string; sellerId?: string }
  ): Promise<number> {
    const res = await fetch(`${API_BASE}/chat/conversations/${conversationId}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(user)
    });
    const json: any = await res.json();
    return json.readCount || 0;
  }
};


