import { ActivePage } from '../types';

export interface NotificationNavigationTarget {
  link?: string;
  actionPage?: string;
  actionTab?: string;
  metadata?: {
    orderId?: string;
    productId?: string;
    sellerId?: string;
    payoutId?: string;
    reviewId?: string;
    tab?: string;
    [key: string]: any;
  };
  type?: string;
}

export interface NavigationContextHelpers {
  setActivePage: (page: ActivePage) => void;
  navigateToOrder?: (orderId: string) => void;
  navigateToProduct?: (productId: string) => void;
  navigateToSeller?: (sellerId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

/**
 * Resolves notification target page intelligently based on user role,
 * link, actionPage, and payload metadata (orderId, productId, etc.).
 * Prevents 404 (NotFoundPage) by routing to role-accessible pages
 * and falling back gracefully to 'notifications'.
 */
export function resolveNotificationNavigation(
  item: NotificationNavigationTarget,
  currentRole: 'admin' | 'seller' | 'buyer' | 'guest' | string,
  helpers: NavigationContextHelpers
): void {
  if (!item) {
    helpers.setActivePage('notifications');
    return;
  }

  const role = currentRole || 'buyer';

  // 1. Check direct metadata references first
  if (item.metadata?.orderId) {
    if (role === 'seller') {
      helpers.setActivePage('seller-orders');
      if (item.actionTab && helpers.onNavigateTab) helpers.onNavigateTab(item.actionTab);
      return;
    }
    if (role === 'admin') {
      helpers.setActivePage('admin-orders');
      if (item.actionTab && helpers.onNavigateTab) helpers.onNavigateTab(item.actionTab);
      return;
    }
    if (helpers.navigateToOrder) {
      helpers.navigateToOrder(item.metadata.orderId);
      return;
    }
    helpers.setActivePage('orders');
    return;
  }

  if (item.metadata?.productId) {
    if (role === 'seller') {
      helpers.setActivePage('seller-products');
      return;
    }
    if (role === 'admin') {
      helpers.setActivePage('admin-products');
      return;
    }
    if (helpers.navigateToProduct) {
      helpers.navigateToProduct(item.metadata.productId);
      return;
    }
    helpers.setActivePage('products' as any);
    return;
  }

  if (item.metadata?.sellerId) {
    if (helpers.navigateToSeller) {
      helpers.navigateToSeller(item.metadata.sellerId);
      return;
    }
    helpers.setActivePage('sellers');
    return;
  }

  // 2. Parse target link / actionPage candidate
  const rawTarget = (item.link || item.actionPage || '').trim();

  // Strip leading and trailing slashes for uniform matching
  const target = rawTarget.replace(/^\/+/, '').replace(/\/+$/, '');

  if (!target || target === 'notifications' || target === 'notification' || target === 'all') {
    helpers.setActivePage('notifications');
    return;
  }

  // Handle orders targets with role awareness
  if (target === 'orders' || target === 'buyer-orders' || target === 'order') {
    if (role === 'seller') {
      helpers.setActivePage('seller-orders');
    } else if (role === 'admin') {
      helpers.setActivePage('admin-orders');
    } else {
      helpers.setActivePage('orders');
    }
    return;
  }

  if (target === 'seller-orders') {
    if (role === 'admin') {
      helpers.setActivePage('admin-orders');
    } else {
      helpers.setActivePage('seller-orders');
    }
    return;
  }

  if (target === 'admin-orders') {
    if (role === 'admin') {
      helpers.setActivePage('admin-orders');
    } else {
      helpers.setActivePage('orders');
    }
    return;
  }

  // Seller dashboard & sub-pages
  if (target === 'seller-dashboard') {
    if (role === 'admin') {
      helpers.setActivePage('admin-dashboard');
    } else if (role === 'seller') {
      helpers.setActivePage('seller-dashboard');
    } else {
      helpers.setActivePage('buyer-account');
    }
    return;
  }

  if (target === 'seller-products') {
    if (role === 'admin') {
      helpers.setActivePage('admin-products');
    } else {
      helpers.setActivePage('seller-products');
    }
    return;
  }

  if (target === 'seller-payouts') {
    if (role === 'admin') {
      helpers.setActivePage('admin-payouts');
    } else {
      helpers.setActivePage('seller-payouts');
    }
    return;
  }

  // Admin sub-pages
  if (target === 'admin-dashboard') {
    if (role === 'admin') {
      helpers.setActivePage('admin-dashboard');
    } else {
      helpers.setActivePage('home');
    }
    return;
  }

  if (target === 'admin-sellers') {
    if (role === 'admin') {
      helpers.setActivePage('admin-sellers');
    } else {
      helpers.setActivePage('home');
    }
    return;
  }

  if (target === 'admin-products') {
    if (role === 'admin') {
      helpers.setActivePage('admin-products');
    } else {
      helpers.setActivePage('products' as any);
    }
    return;
  }

  if (target === 'admin-payouts') {
    if (role === 'admin') {
      helpers.setActivePage('admin-payouts');
    } else {
      helpers.setActivePage('home');
    }
    return;
  }

  // Buyer Account & Profile
  if (target === 'buyer-account' || target === 'account' || target === 'profile') {
    helpers.setActivePage('buyer-account');
    return;
  }

  // Market & Products
  if (target === 'market' || target === 'products' || target === 'wah-market') {
    helpers.setActivePage('products' as any);
    return;
  }

  // Messages & Live Chat
  if (target === 'messages' || target === 'chat' || target === 'conversations') {
    helpers.setActivePage('messages');
    return;
  }

  // Cart & Checkout
  if (target === 'cart') {
    helpers.setActivePage('cart');
    return;
  }
  if (target === 'checkout') {
    helpers.setActivePage('checkout');
    return;
  }

  // Home
  if (target === 'home' || target === '') {
    helpers.setActivePage('home');
    return;
  }

  // Other known valid ActivePages
  const validPages: Record<string, ActivePage> = {
    'explore': 'explore',
    'map': 'map',
    'favorites': 'favorites',
    'about': 'about',
    'wholesale': 'wholesale',
    'categories': 'categories',
    'crafts': 'crafts',
    'cultural-crafts': 'cultural-crafts',
    'reels': 'reels',
    'governorates': 'governorates',
    'places': 'places',
    'stories': 'stories',
    'people': 'people',
    'food': 'food',
    'events': 'events'
  };

  if (validPages[target]) {
    helpers.setActivePage(validPages[target]);
    return;
  }

  // Safe fallback to notifications so it NEVER triggers 404 (NotFoundPage)
  helpers.setActivePage('notifications');
}
