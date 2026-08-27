export interface ShippingCalculation {
  fee: number;
  isFree: boolean;
  freeShippingThreshold: number;
  estimatedDays: string;
  carrierName: string;
}

/**
 * Calculates shipping fee and delivery SLA server-side.
 * Rule: Free shipping for orders >= 1000 EGP.
 * Standard shipping: 45 EGP for Cairo/Giza/Alexandria, 55 EGP for Upper Egypt governorates (Qena, Luxor, Aswan, Sohag, Assiut, Minya).
 */
export function calculateShipping(subtotal: number, governorate?: string): ShippingCalculation {
  const FREE_SHIPPING_THRESHOLD = 1000;
  
  if (subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0) {
    return {
      fee: 0,
      isFree: subtotal > 0,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      estimatedDays: '2 - 3 أيام عمل',
      carrierName: 'صعيد إكسبريس للتوصيل السريع'
    };
  }

  // Upper Egypt origin shipping optimization
  const upperEgypt = ['قنا', 'الأقصر', 'أسوان', 'سوهاج', 'أسيوط', 'المنيا', 'بني سويف', 'الوادي الجديد', 'الفيوم'];
  const fee = upperEgypt.includes(governorate || '') ? 45 : 55;

  return {
    fee,
    isFree: false,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    estimatedDays: '3 - 4 أيام عمل',
    carrierName: 'صعيد إكسبريس للشحن الآمن'
  };
}
