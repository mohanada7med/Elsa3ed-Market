/**
 * ==============================================================================
 * 🏺 لوحة التحكم المركزية في باترن وهوية الصفحة الرئيسية (WAH Home Pattern Config)
 * ==============================================================================
 * يمكنك من هذا الملف التحكم في كافة الباترن الموجودة بالصفحة الرئيسية:
 * - تشغيل أو إيقاف أي باترن (enabled: true / false)
 * - تعديل درجة الشفافية (opacity) لكل جزء
 * - تغيير مقاس الباترن (scale بالبيكسل)
 * - تبديل ملف الباترن المستخدم:
 *    • pat1.svg: شريط الزخارف النوبية الصعيدية الفيكتور
 *    • pat2.png: أيقونات الهوية التراثية المفرغة (قلال، شمس، قباب، نخيل، زهور)
 *    • pat3.png: نسيج الخطوط الهندسية الصعيدية بلون البردي الدافئ
 * ==============================================================================
 */

export interface HomePatternSettings {
  /** المفتاح الرئيسي للتحكم بالباترن كاملاً */
  globalEnabled: boolean;
  /** معامل مضاعفة الشفافية للجميع (1.0 = عادي، 0.5 = نصف الشفافية، 1.5 = زيادة 50%) */
  opacityMultiplier: number;

  /** أول الصفحة (Hero Section) */
  hero: {
    enabled: boolean;
    /** الركن العلوي الأيسر (أيقونات الهوية) */
    topLeft: {
      enabled: boolean;
      pattern: string;
      opacity: number;
      scale: number;
    };
    /** الركن السفلي الأيمن (الخطوط الهندسية) */
    bottomRight: {
      enabled: boolean;
      pattern: string;
      opacity: number;
      scale: number;
    };
  };

  /** الفواصل بين أقسام الصفحة الرئيسية */
  dividers: {
    enabled: boolean;
    pattern: string;
    opacity: number;
    /** شكل الفاصل: 'flanked' = شريطان من الجانبين مع شعار بالوسط | 'ribbon' = شريط متصل */
    variant: 'flanked' | 'ribbon';
    showLabels: boolean;
  };

  /** قسم وه بيحكي (Craft Reels) */
  reels: {
    enabled: boolean;
    pattern: string;
    opacity: number;
    scale: number;
  };

  /** قسم قاموس اللهجات والاختبار */
  quiz: {
    enabled: boolean;
    pattern: string;
    opacity: number;
    scale: number;
  };

  /** قسم سوق ومنتجات وه */
  market: {
    enabled: boolean;
    pattern: string;
    opacity: number;
    scale: number;
  };

  /** الفوتر وختم نهاية الموقع */
  footer: {
    enabled: boolean;
    /** شريط الزخارف الفيكتور أعلى الفوتر */
    topFrieze: boolean;
    /** النقشة الخلفية المتحفية للفوتر */
    ambientWallpaper: boolean;
    ambientPattern: string;
    ambientOpacity: number;
    ambientScale: number;
    /** ختم عم وه التراثي بجانب اللوجو */
    mascotSeal: boolean;
    /** الشريط التراثي أسفل الفوتر */
    bottomRibbon: boolean;
  };
}

export const HOME_PATTERNS = {
  icons: '/pattern/pat2.png',     // أيقونات وه المفرغة (قلة، شمس، قباب، نخيل)
  frieze: '/pattern/pat1.svg',     // الشريط الفيكتور النوبي الصعيدي
  stripes: '/pattern/pat3.png',   // النسيج الهندسي التراثي
} as const;

export const HOME_PATTERN_CONFIG: HomePatternSettings = {
  // 1. التحكم العام
  globalEnabled: true,
  opacityMultiplier: 1.0,

  // 2. الهيرو (أول الصفحة)
  hero: {
    enabled: true,
    topLeft: {
      enabled: true,
      pattern: HOME_PATTERNS.icons,
      opacity: 0.7,  // من 4% لـ 8%
      scale: 420,     // مقاس الباترن
    },
    bottomRight: {
      enabled: true,
      pattern: HOME_PATTERNS.stripes,
      opacity: 0.05,
      scale: 380,
    },
  },

  // 3. الفواصل بين أقسام الصفحة
  dividers: {
    enabled: true,
    pattern: HOME_PATTERNS.frieze,
    opacity: 0.65,
    variant: 'flanked', // 'flanked' أو 'ribbon'
    showLabels: true,
  },

  // 4. قسم "وه بيحكي" (حكايات الصنعة)
  reels: {
    enabled: true,
    pattern: HOME_PATTERNS.icons,
    opacity: 0.04,
    scale: 520,
  },

  // 5. قسم قاموس اللهجات واختبار الأصالة
  quiz: {
    enabled: true,
    pattern: HOME_PATTERNS.icons,
    opacity: 0.035,
    scale: 500,
  },

  // 6. قسم سوق وه (خلفية كروت السوق)
  market: {
    enabled: false,
    pattern: HOME_PATTERNS.icons,
    opacity: 0.025,
    scale: 440,
  },

  // 7. الفوتر ونقشة الختم
  footer: {
    enabled: true,
    topFrieze: true,
    ambientWallpaper: true,
    ambientPattern: HOME_PATTERNS.icons,
    ambientOpacity: 0.055,
    ambientScale: 640,
    mascotSeal: true,
    bottomRibbon: true,
  },
};

/** دالة مساعدة لحساب الشفافية الفعلية آخذة في الاعتبار المفتاح الرئيسي ومعامل الشفافية */
export function getHomePatternOpacity(baseOpacity: number): number {
  if (!HOME_PATTERN_CONFIG.globalEnabled) return 0;
  return Number((baseOpacity * HOME_PATTERN_CONFIG.opacityMultiplier).toFixed(4));
}
