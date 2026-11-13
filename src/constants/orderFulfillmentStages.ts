import type { OrderStatus } from '../types.ts';

export type OrderFulfillmentStageStatus = Extract<
  OrderStatus,
  'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered'
>;

export const ORDER_FULFILLMENT_STAGES: {
  status: OrderFulfillmentStageStatus;
  label: string;
  desc: string;
  eta?: string;
}[] = [
  {
    status: 'pending',
    label: 'تم تسجيل الطلب',
    desc: 'تم استلام طلبك ومراجعته بالورشة',
    eta: 'الآن'
  },
  {
    status: 'confirmed',
    label: 'تأكيد الورش الحرفية',
    desc: 'تم تأكيد توافر القطع وجودة الصنعة اليدوية',
    eta: 'خلال ساعتين'
  },
  {
    status: 'processing',
    label: 'التجهيز والتغليف الآمن',
    desc: 'يتم الآن فحص القطعة وتغليفها بمواد امتصاص الصدمات',
    eta: 'خلال 24 ساعة'
  },
  {
    status: 'shipped',
    label: 'في الطريق للتوصيل',
    desc: 'تم شحن الطلب بالتنسيق المباشر مع الورشة وهو في طريقه إليك',
    eta: 'خلال 48 ساعة'
  },
  {
    status: 'out_for_delivery',
    label: 'خرجت للتوصيل',
    desc: 'الشحنة في طريقها لتسليم الطلب على عنوانك بالتنسيق معك'
  },
  {
    status: 'delivered',
    label: 'تم الاستلام بنجاح',
    desc: 'تم تسليم الطلب إلى باب المنزل',
    eta: 'خلال 3 - 4 أيام عمل'
  }
];
