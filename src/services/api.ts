import { Product, ProductStatus, Category, Seller, AuditLog, CraftStory, DiscountCoupon } from '../types.ts';

const API_BASE = '/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  count?: number;
}

function getAuthHeaders(user?: { id?: string; role?: string; sellerId?: string }): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (user?.id) {
    headers['x-user-id'] = user.id;
  }
  if (user?.role) {
    headers['x-user-role'] = user.role;
  }
  return headers;
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
    const res = await fetch(`${API_BASE}/products${queryStr}`);
    const json: ApiResponse<Product[]> = await res.json();
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
      const res = await fetch(`${API_BASE}/categories`);
      const json: ApiResponse<Category[]> = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async getSellers(): Promise<Seller[]> {
    try {
      const res = await fetch(`${API_BASE}/sellers`);
      const json: ApiResponse<Seller[]> = await res.json();
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

  // ==================== CRAFT STORIES (قصص الصنعة وأسرار الأجداد) ====================
  async getPublicCraftStories(): Promise<CraftStory[]> {
    try {
      const res = await fetch(`${API_BASE}/craft-stories`);
      const json: ApiResponse<CraftStory[]> = await res.json();
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
    return json.data;
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
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
    return json.data;
  },


  async getMe(user?: { id?: string; role?: string }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include',
        headers: getAuthHeaders(user)
      });
      if (!res.ok) {
        return null;
      }
      const json: ApiResponse<any> = await res.json();
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
  }
};

