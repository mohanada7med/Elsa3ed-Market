import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  ShoppingBag,
  Layers,
  User,
  Store,
  ShieldAlert,
  LogIn,
  Package,
  ClipboardList,
  MessageSquare,
  MapPin,
  House,
  Settings,
} from 'lucide-react';
import { motion } from 'motion/react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}

export const MobileBottomBar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    cartCount,
    setIsCartDrawerOpen,
    isAuthenticated,
    currentRole,
    currentUser,
    setIsAuthModalOpen,
    setAuthModalTab,
    setPostLoginRedirect,
    chatUnreadCount,
  } = useApp();

  const handleAccountClick = () => {
    if (!isAuthenticated) {
      setPostLoginRedirect('buyer-account');
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      return;
    }

    setActivePage('buyer-account');
  };

  const isAccountActive =
    activePage === 'buyer-account' ||
    activePage === 'seller-account' ||
    (currentRole === 'seller' &&
      activePage === 'seller-dashboard') ||
    (currentRole === 'admin' &&
      activePage === 'admin-dashboard');

  if (
    activePage === 'product-detail' ||
    activePage === 'product-details' ||
    activePage === 'checkout' ||
    activePage === 'reels'
  ) {
    return null;
  }

  let leftItems: TabItem[] = [];
  let rightItems: TabItem[] = [];
  let centerItem: TabItem;

  /*
   * ============================================================
   * SELLER
   * ============================================================
   */

  if (
    isAuthenticated &&
    (currentRole === 'seller' || currentUser?.role === 'seller')
  ) {
    leftItems = [
      {
        id: 'home',
        label: 'الرئيسية',
        icon: Compass,
        isActive: activePage === 'home',
        onClick: () => setActivePage('home' as any),
      },
      {
        id: 'seller-products',
        label: 'منتجاتي',
        icon: Package,
        isActive: activePage === 'seller-products',
        onClick: () =>
          setActivePage('seller-products' as any),
      },
    ];

    centerItem = {
      id: 'seller-dashboard',
      label: 'التحكم',
      icon: Settings,
      isActive: activePage === 'seller-dashboard',
      onClick: () =>
        setActivePage('seller-dashboard' as any),
    };

    rightItems = [
      {
        id: 'seller-orders',
        label: 'الطلبات',
        icon: ClipboardList,
        isActive: activePage === 'seller-orders',
        onClick: () =>
          setActivePage('seller-orders' as any),
      },
      {
        id: 'seller-messages',
        label: 'المحادثات',
        icon: MessageSquare,
        isActive:
          activePage === 'messages' ||
          activePage === 'seller-messages',
        onClick: () =>
          setActivePage('messages' as any),
        badge: chatUnreadCount,
      },
    ];
  }

  /*
   * ============================================================
   * ADMIN
   * ============================================================
   */

  else if (
    isAuthenticated &&
    (currentRole === 'admin' || currentUser?.role === 'admin')
  ) {
    leftItems = [
      {
        id: 'home',
        label: 'الرئيسية',
        icon: Compass,
        isActive: activePage === 'home',
        onClick: () => setActivePage('home' as any),
      },
      {
        id: 'admin-products',
        label: 'المنتجات',
        icon: Package,
        isActive: activePage === 'admin-products',
        onClick: () =>
          setActivePage('admin-products' as any),
      },
    ];

    centerItem = {
      id: 'admin-dashboard',
      label: 'التحكم',
      icon: Settings,
      isActive: activePage === 'admin-dashboard',
      onClick: () =>
        setActivePage('admin-dashboard' as any),
    };

    rightItems = [
      {
        id: 'admin-orders',
        label: 'الطلبات',
        icon: ClipboardList,
        isActive: activePage === 'admin-orders',
        onClick: () =>
          setActivePage('admin-orders' as any),
      },
      {
        id: 'admin-sellers',
        label: 'الورش',
        icon: Store,
        isActive: activePage === 'admin-sellers',
        onClick: () =>
          setActivePage('admin-sellers' as any),
      },
    ];
  }

  /*
   * ============================================================
   * GUEST / BUYER
   * ============================================================
   */

  else {
    leftItems = [
      {
        id: 'home',
        label: 'الرئيسية',
        icon: Compass,
        isActive: activePage === 'home',
        onClick: () => setActivePage('home' as any),
      },
      {
        id: 'map',
        label: 'الصعيد',
        icon: MapPin,
        isActive: activePage === 'map',
        onClick: () =>
          setActivePage('map' as any),
      },
    ];

    centerItem = {
      id: 'products',
      label: 'المنتجات',
      icon: Layers,
      isActive: activePage === 'products',
      onClick: () =>
        setActivePage('products' as any),
    };

    rightItems = [
      {
        id: 'cart',
        label: 'السلة',
        icon: ShoppingBag,
        isActive: activePage === 'cart',
        onClick: () =>
          setIsCartDrawerOpen(true),
        badge: cartCount,
      },
      ...(isAuthenticated &&
      (currentRole === 'buyer' || currentUser?.role === 'buyer')
        ? [
            {
              id: 'messages',
              label: 'الرسائل',
              icon: MessageSquare,
              isActive: activePage === 'messages',
              onClick: () => setActivePage('messages' as any),
              badge: chatUnreadCount,
            },
          ]
        : []),
      {
        id: 'account',
        label: !isAuthenticated
          ? 'دخول'
          : 'حسابي',
        icon: !isAuthenticated
          ? LogIn
          : User,
        isActive: isAccountActive,
        onClick: handleAccountClick,
      },
    ];
  }

  /*
   * ============================================================
   * CARTOON TAB ITEM
   * ============================================================
   */

  const renderTab = (item: TabItem) => {
    const Icon = item.icon;

    return (
      <motion.button
        key={item.id}
        type="button"
        onClick={item.onClick}
        whileTap={{
          scale: 0.82,
          rotate: -4,
        }}
        className="
          relative
          flex-1
          h-full
          flex
          flex-col
          items-center
          justify-center
          gap-[2px]
          select-none
          outline-none
          touch-manipulation
          group
        "
        aria-label={item.label}
      >
        {/* CARTOON ACTIVE BACKGROUND PILL */}
        {item.isActive && (
          <motion.div
            layoutId="cartoonActivePill"
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 25,
            }}
            className="
              absolute
              inset-x-1
              top-1
              bottom-2
              rounded-2xl
              bg-[#FFE8C5]
              dark:bg-[#3D2619]
              border-2
              border-[#3B2213]
              dark:border-[#E8B96F]
              shadow-[0_3px_0px_#3B2213]
              dark:shadow-[0_3px_0px_#E8B96F]
              pointer-events-none
            "
          />
        )}

        {/* ICON CONTAINER */}
        <div className="relative z-10 flex items-center justify-center">
          <Icon
            className={`
              w-[20px]
              h-[20px]
              transition-transform
              duration-150
              ${item.isActive
                ? 'text-[#8A3A13] dark:text-[#FFD188] scale-110'
                : 'text-[#6B5344] dark:text-[#A89080] group-hover:scale-105'
              }
            `}
            strokeWidth={item.isActive ? 2.8 : 2.2}
          />

          {/* BADGE */}
          {item.badge !== undefined &&
            item.badge > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 600,
                  damping: 15,
                }}
                className="
                  absolute
                  -top-2
                  -right-3
                  min-w-[18px]
                  h-[18px]
                  px-1
                  rounded-full
                  flex
                  items-center
                  justify-center
                  bg-[#E74C3C]
                  text-white
                  text-[9px]
                  font-black
                  border-2
                  border-[#3B2213]
                  shadow-[0_2px_0px_#3B2213]
                "
              >
                {item.badge > 99 ? '99+' : item.badge}
              </motion.span>
            )}
        </div>

        {/* LABEL */}
        <span
          className={`
            relative
            z-10
            text-[10px]
            leading-none
            font-black
            tracking-tight
            ${item.isActive
              ? 'text-[#6A2B0A] dark:text-[#FFD188]'
              : 'text-[#6B5344] dark:text-[#A89080]'
            }
          `}
        >
          {item.label}
        </span>
      </motion.button>
    );
  };

  const CenterIcon = centerItem.icon;

  return (
    <div
      id="mobile-bottom-navigation"
      dir="rtl"
      className="
        lg:hidden
        fixed
        bottom-0
        inset-x-0
        z-50
        flex
        justify-center
        pointer-events-none
        px-3
        pb-[calc(10px+env(safe-area-inset-bottom))]
      "
      role="navigation"
      aria-label="التنقل الرئيسي"
    >
      <div
        className="
          relative
          flex
          items-end
          justify-center
          gap-2
          w-full
          max-w-[440px]
        "
      >
        {/* ====================================================
            RIGHT CARTOON ISLAND
        ==================================================== */}
        <motion.nav
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          className="
            pointer-events-auto
            relative
            flex-1
            h-[64px]
            px-1.5
            rounded-[28px]
            flex
            items-center
            justify-around
            bg-[#FFF8EE]
            dark:bg-[#1E120B]
            border-[3px]
            border-[#3B2213]
            dark:border-[#E8B96F]/50
            shadow-[0_6px_0px_#3B2213]
            dark:shadow-[0_6px_0px_#000000]
          "
        >
          {leftItems.map(renderTab)}
        </motion.nav>

        {/* ====================================================
            CENTER COMIC/CARTOON BUTTON
        ==================================================== */}
        <div
          className="
            pointer-events-auto
            relative
            w-[74px]
            h-[76px]
            flex
            items-start
            justify-center
          "
        >
          {/* FLOATING SHADOW BASE */}
          <div
            className="
              absolute
              bottom-1
              w-14
              h-4
              rounded-full
              bg-[#3B2213]/25
              dark:bg-black/50
              blur-[2px]
              pointer-events-none
            "
          />

          <motion.button
            type="button"
            onClick={centerItem.onClick}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.85, y: 4 }}
            className="
              relative
              z-20
              w-[64px]
              h-[56px]
              rounded-[22px]
              flex
              items-center
              justify-center
              bg-gradient-to-br
              from-[#F49F42]
              via-[#E87A2B]
              to-[#C55A11]
              dark:from-[#E8A54C]
              dark:via-[#C6782B]
              dark:to-[#8B4810]
              border-[3px]
              border-[#3B2213]
              dark:border-[#FFD188]
              shadow-[0_5px_0px_#3B2213]
              dark:shadow-[0_5px_0px_#000000]
              outline-none
            "
            aria-label={centerItem.label}
          >
            {/* CARTOON SHINE EFFECT */}
            <div
              className="
                absolute
                top-1
                left-2
                w-4
                h-2
                rounded-full
                bg-white/50
                pointer-events-none
              "
            />

            <motion.div
              animate={{
                rotate: centerItem.isActive ? [0, 8, -8, 0] : 0,
              }}
              transition={{
                duration: 2,
                repeat: centerItem.isActive ? Infinity : 0,
              }}
              className="relative z-10"
            >
              <CenterIcon
                className="w-[26px] h-[26px] text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]"
                strokeWidth={2.6}
              />
            </motion.div>
          </motion.button>

          {/* CENTER LABEL BADGE - معدلة لتكون واضحة وبارزة تماماً */}
          <motion.span
            animate={{
              y: centerItem.isActive ? [0, -2, 0] : 0,
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="
              absolute
              bottom-1
              px-3
              py-[2px]
              rounded-full
              whitespace-nowrap
              text-[10px]
              font-black
              tracking-tight
              text-[#3B2213]
              dark:text-[#FFD188]
              bg-[#FFF8EE]
              dark:bg-[#1E120B]
              border-2
              border-[#3B2213]
              dark:border-[#E8B96F]/80
              shadow-[0_3px_0px_#3B2213]
              dark:shadow-[0_3px_0px_#000]
              z-30
            "
          >
            {centerItem.label}
          </motion.span>
        </div>

        {/* ====================================================
            LEFT CARTOON ISLAND
        ==================================================== */}
        <motion.nav
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          className="
            pointer-events-auto
            relative
            flex-1
            h-[64px]
            px-1.5
            rounded-[28px]
            flex
            items-center
            justify-around
            bg-[#FFF8EE]
            dark:bg-[#1E120B]
            border-[3px]
            border-[#3B2213]
            dark:border-[#E8B96F]/50
            shadow-[0_6px_0px_#3B2213]
            dark:shadow-[0_6px_0px_#000000]
          "
        >
          {rightItems.map(renderTab)}
        </motion.nav>
      </div>
    </div>
  );
};