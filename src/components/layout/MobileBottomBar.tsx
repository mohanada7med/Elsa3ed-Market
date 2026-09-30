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

    if (
      currentRole === 'seller' ||
      currentUser?.role === 'seller'
    ) {
      setActivePage('seller-account');
      return;
    }

    if (
      currentRole === 'admin' ||
      currentUser?.role === 'admin'
    ) {
      setActivePage('admin-dashboard');
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
      label: 'لوحة التحكم',
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
      label: 'لوحة التحكم',
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
        id: 'products',
        label: 'المقتنيات',
        icon: Layers,
        isActive: activePage === 'products',
        onClick: () =>
          setActivePage('products' as any),
      },
    ];

    centerItem = {
      id: 'map',
      label: 'لفة في الصعيد',
      icon: MapPin,
      isActive: activePage === 'map',
      onClick: () =>
        setActivePage('map' as any),
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
   * GLASS TAB
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
        }}
        className="
          relative
          flex-1
          h-full
          flex
          flex-col
          items-center
          justify-center
          gap-[3px]
          select-none
          outline-none
          touch-manipulation
          group
        "
        aria-label={item.label}
      >
        {/* ACTIVE GLASS */}
        <motion.div
          initial={false}
          animate={{
            opacity: item.isActive ? 1 : 0,
            scale: item.isActive ? 1 : 0.7,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          className="
            absolute
            inset-[5px]
            rounded-[18px]

            bg-white/55
            dark:bg-white/[0.075]

            border
            border-white/80
            dark:border-white/[0.10]

            backdrop-blur-xl

            shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]
            dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]

            pointer-events-none
          "
        />

        {/* ACTIVE LIGHT */}
        {item.isActive && (
          <motion.div
            layoutId="wahActiveLight"
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 32,
            }}
            className="
              absolute
              bottom-[5px]
              left-1/2
              -translate-x-1/2

              w-5
              h-[3px]

              rounded-full

              bg-[#C99444]

              shadow-[0_0_12px_rgba(201,148,68,0.9)]
            "
          />
        )}

        {/* ICON */}
        <motion.div
          className="relative z-10"
          animate={{
            y: item.isActive ? -2 : 0,
            scale: item.isActive ? 1.12 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 450,
            damping: 24,
          }}
        >
          <Icon
            className={`
              w-[19px]
              h-[19px]

              transition-colors
              duration-200

              ${item.isActive
                ? 'text-[#8A4A23] dark:text-[#E8B96F]'
                : 'text-stone-500 dark:text-white/50 group-hover:text-stone-800 dark:group-hover:text-white/80'
              }
            `}
            strokeWidth={
              item.isActive ? 2.35 : 1.8
            }
          />

          {/* BADGE */}
          {item.badge !== undefined &&
            item.badge > 0 && (
              <motion.span
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 600,
                  damping: 20,
                }}
                className="
                  absolute
                  -top-2
                  -right-3

                  min-w-[16px]
                  h-[16px]

                  px-1

                  rounded-full

                  flex
                  items-center
                  justify-center

                  bg-[#B43B2F]
                  text-white

                  text-[8px]
                  font-black

                  border-2
                  border-white/90
                  dark:border-[#17100C]

                  shadow-[0_3px_10px_rgba(0,0,0,0.2)]
                "
              >
                {item.badge > 99
                  ? '99+'
                  : item.badge}
              </motion.span>
            )}
        </motion.div>

        {/* LABEL */}
        <motion.span
          animate={{
            y: item.isActive ? -1 : 0,
            opacity: item.isActive ? 1 : 0.7,
          }}
          className={`
            relative
            z-10

            text-[9px]
            leading-none
            font-bold

            transition-colors

            ${item.isActive
              ? 'text-[#8A4A23] dark:text-[#E8B96F] font-black'
              : 'text-stone-500 dark:text-white/50'
            }
          `}
        >
          {item.label}
        </motion.span>
      </motion.button>
    );
  };

  /*
   * ============================================================
   * CENTER GLASS BUTTON
   * ============================================================
   */

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
      {/* AMBIENT LIGHT */}
      <motion.div
        animate={{
          opacity: [0.15, 0.28, 0.15],
          scale: [0.9, 1.08, 0.9],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="
          absolute
          bottom-3
          left-1/2
          -translate-x-1/2

          w-56
          h-16

          bg-[#C99444]/20
          dark:bg-[#C99444]/10

          blur-3xl

          pointer-events-none
        "
      />

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
            RIGHT GLASS ISLAND
        ==================================================== */}

        <motion.nav
          initial={{
            x: 25,
            opacity: 0,
          }}
          animate={{
            x: 0,
            opacity: 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
          }}
          className="
            pointer-events-auto

            relative
            flex-1

            h-[62px]

            px-1

            rounded-[25px]

            flex
            items-center
            justify-around

            overflow-hidden

            bg-white/[0.58]
            dark:bg-[#17100C]/[0.58]

            backdrop-blur-[28px]
            backdrop-saturate-[170%]

            border
            border-white/75
            dark:border-white/[0.11]

            shadow-[0_14px_45px_rgba(50,28,14,0.14)]
            dark:shadow-[0_14px_45px_rgba(0,0,0,0.60)]
          "
        >
          {/* GLASS REFLECTION */}
          <div
            className="
              absolute
              top-0
              left-[15%]
              right-[15%]

              h-px

              bg-gradient-to-r
              from-transparent
              via-white
              to-transparent

              dark:via-white/20
            "
          />

          {leftItems.map(renderTab)}
        </motion.nav>

        {/* ====================================================
            CENTER
        ==================================================== */}

        <div
          className="
            pointer-events-auto

            relative

            w-[66px]
            h-[78px]

            flex
            items-start
            justify-center
          "
        >
          {/* OUTER GLOW */}
          <motion.div
            animate={{
              scale: [1, 1.12, 1],
              opacity: [0.22, 0.38, 0.22],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="
              absolute
              top-[1px]

              w-[64px]
              h-[64px]

              rounded-full

              bg-[#C99444]

              blur-2xl

              pointer-events-none
            "
          />

          {/* ROTATING GLASS RING */}
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="
              absolute
              top-[-3px]

              w-[68px]
              h-[68px]

              rounded-full

              border
              border-dashed
              border-[#C99444]/30

              pointer-events-none
            "
          />

          {/* CENTER BUTTON */}
          <motion.button
            type="button"
            onClick={centerItem.onClick}
            whileHover={{
              scale: 1.07,
            }}
            whileTap={{
              scale: 0.88,
            }}
            className="
              relative
              z-20

              mt-[2px]

              w-[58px]
              h-[58px]

              rounded-[21px]

              rotate-45

              flex
              items-center
              justify-center

              overflow-hidden

              bg-gradient-to-br
              from-[#6E391D]
              via-[#8B4B25]
              to-[#5D2B17]

              dark:from-[#8B4C25]
              dark:via-[#6A3419]
              dark:to-[#35170B]

              border
              border-white/60
              dark:border-[#E4B86D]/25

              shadow-[0_12px_35px_rgba(82,42,20,0.35)]
              dark:shadow-[0_12px_35px_rgba(0,0,0,0.65)]

              outline-none
            "
            aria-label={centerItem.label}
          >
            {/* GLASS SHINE */}
            <motion.div
              animate={{
                x: ['-120%', '120%'],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                repeatDelay: 2,
                ease: 'easeInOut',
              }}
              className="
                absolute

                top-[-30%]
                left-[-20%]

                w-[30%]
                h-[170%]

                rotate-[25deg]

                bg-white/20

                blur-md

                pointer-events-none
              "
            />

            {/* INNER BORDER */}
            <div
              className="
                absolute
                inset-[5px]

                rounded-[17px]

                border
                border-white/15

                pointer-events-none
              "
            />

            {/* ICON */}
            <motion.div
              animate={{
                rotate: centerItem.isActive
                  ? [0, 5, -5, 0]
                  : 0,
                scale: centerItem.isActive
                  ? [1, 1.08, 1]
                  : 1,
              }}
              transition={{
                duration: 2.2,
                repeat: centerItem.isActive
                  ? Infinity
                  : 0,
              }}
              className="-rotate-45 relative z-10"
            >
              <CenterIcon
                className="
                  w-[23px]
                  h-[23px]

                  text-[#F4D39C]
                "
                strokeWidth={2.2}
              />
            </motion.div>
          </motion.button>

          {/* CENTER LABEL */}
          <motion.span
            animate={{
              y: centerItem.isActive
                ? [0, -1, 0]
                : 0,
            }}
            transition={{
              duration: 2,
              repeat: centerItem.isActive
                ? Infinity
                : 0,
            }}
            className="
              absolute

              -bottom-[2px]

              px-2.5
              py-[4px]

              rounded-full

              whitespace-nowrap

              text-[8.5px]
              font-black

              text-[#8A4A23]
              dark:text-[#E8B96F]

              bg-white/60
              dark:bg-white/[0.06]

              border
              border-white/70
              dark:border-white/10

              backdrop-blur-xl
            "
          >
            {centerItem.label}
          </motion.span>
        </div>

        {/* ====================================================
            LEFT GLASS ISLAND
        ==================================================== */}

        <motion.nav
          initial={{
            x: -25,
            opacity: 0,
          }}
          animate={{
            x: 0,
            opacity: 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
          }}
          className="
            pointer-events-auto

            relative
            flex-1

            h-[62px]

            px-1

            rounded-[25px]

            flex
            items-center
            justify-around

            overflow-hidden

            bg-white/[0.58]
            dark:bg-[#17100C]/[0.58]

            backdrop-blur-[28px]
            backdrop-saturate-[170%]

            border
            border-white/75
            dark:border-white/[0.11]

            shadow-[0_14px_45px_rgba(50,28,14,0.14)]
            dark:shadow-[0_14px_45px_rgba(0,0,0,0.60)]
          "
        >
          {/* GLASS REFLECTION */}
          <div
            className="
              absolute
              top-0
              left-[15%]
              right-[15%]

              h-px

              bg-gradient-to-r
              from-transparent
              via-white
              to-transparent

              dark:via-white/20
            "
          />

          {rightItems.map(renderTab)}
        </motion.nav>
      </div>
    </div>
  );
};