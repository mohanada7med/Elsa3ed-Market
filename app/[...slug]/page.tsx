import ClientApp from '../ClientApp';
import type { Metadata } from 'next';
import {
  WAH_DEFAULT_SEO_IMAGE,
  getListingSeoJsonLd,
  getPublicSeoBreadcrumbJsonLd,
  getPublicSeoJsonLd,
  getPublicSeoPage,
  type PublicSeoPage
} from '../../server/services/publicSeoService';

export const dynamic = 'force-dynamic';

type CatchAllProps = {
  params: Promise<{ slug: string[] }>;
};

const baseUrl = (process.env.APP_URL || 'https://waaaaah.vercel.app').replace(/\/+$/, '');

const indexRobots: Metadata['robots'] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1
  }
};

const noIndexRobots: Metadata['robots'] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false
  }
};

function isPrivateRoute(route: string): boolean {
  if (!route) return false;
  if (route.startsWith('admin') || route.startsWith('seller-') || route === 'seller') {
    return true;
  }
  return [
    'account',
    'profile',
    'buyer-account',
    'cart',
    'checkout',
    'orders',
    'favorites',
    'notifications',
    'messages',
    'reset-password',
    'login',
    'register',
    'forgot-password',
    'search',
    'global-search',
    'cultural-cms'
  ].includes(route);
}

interface ListingSeoConfig {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string[];
}

const listingMetadata: Record<string, ListingSeoConfig> = {
  map: {
    title: 'خريطة محافظات الصعيد التفاعلية',
    description:
      'استكشف خريطة صعيد مصر التفاعلية ورحلة النيل عبر محافظات الفيوم وبني سويف والمنيا وأسيوط وسوهاج وقنا والأقصر وأسوان والوادي الجديد والبحر الأحمر.',
    canonicalPath: '/map',
    keywords: ['خريطة صعيد مصر', 'محافظات الصعيد', 'رحلة النيل', 'أطلس الصعيد']
  },
  explore: {
    title: 'خريطة محافظات الصعيد التفاعلية',
    description:
      'استكشف خريطة صعيد مصر التفاعلية ورحلة النيل عبر محافظات الصعيد ومعالمها وحرفها وأكلاتها الأصيلة.',
    canonicalPath: '/map'
  },
  governorates: {
    title: 'محافظات صعيد مصر',
    description:
      'دليل شامل لمحافظات صعيد مصر: التاريخ، المدن، المعالم الأثرية، الحرف اليدوية، والأكلات التراثية لكل محافظة.',
    canonicalPath: '/map',
    keywords: ['محافظات صعيد مصر', 'قنا', 'الأقصر', 'أسوان', 'سوهاج', 'أسيوط', 'المنيا']
  },
  places: {
    title: 'معالم وتراث صعيد مصر',
    description:
      'دليل موثّق للمعابد الفرعونية والأديرة والمساجد العتيقة والقلاع والبيوت التراثية والمعالم السياحية في محافظات صعيد مصر.',
    canonicalPath: '/places',
    keywords: ['معالم الصعيد', 'آثار صعيد مصر', 'السياحة في الصعيد', 'معابد الصعيد']
  },
  food: {
    title: 'أكلات ومطبخ الصعيد التراثي',
    description:
      'اكتشف أشهر أكلات ومخبوزات صعيد مصر الأصيلة مثل العيش الشمسي والفطير المشلتت والفايش والويكا بمكوناتها وطريقة تحضيرها وحكاياتها.',
    canonicalPath: '/food',
    keywords: ['أكلات صعيدية', 'مطبخ الصعيد', 'عيش شمسي', 'فطير مشلتت', 'فايش صعيدي']
  },
  events: {
    title: 'فعاليات ومواسم وموالد الصعيد',
    description:
      'تابع أجندة الفعاليات والمواسم التراثية والموالد الشعبية ومواسم الحصاد والمهرجانات الثقافية في محافظات صعيد مصر.',
    canonicalPath: '/events',
    keywords: ['فعاليات الصعيد', 'موالد الصعيد', 'مواسم صعيد مصر', 'تراث صعيدي']
  },
  people: {
    title: 'أعلام وشخصيات من صعيد مصر',
    description:
      'تعرّف على سير ومسيرة أعلام الصعيد وشيوخ الصنعة والأدباء والرواة والشخصيات المؤثرة التي صنعت تاريخ وثقافة صعيد مصر.',
    canonicalPath: '/people',
    keywords: ['أعلام الصعيد', 'شخصيات صعيد مصر', 'شيوخ الصنعة', 'رموز الصعيد']
  },
  products: {
    title: 'سوق وه — منتجات وحرف يدوية من صعيد مصر',
    description:
      'تسوّق أرقى المنتجات الحرفية اليدوية الأصيلة من الفخار والكليم والتلي والنحاس والجلود وخيرات الصعيد مباشرة من الورش وبشحن آمن لكل مصر.',
    canonicalPath: '/products',
    keywords: ['سوق الصعيد', 'منتجات يدوية مصرية', 'حرف يدوية صعيدية', 'شراء فخار وكليم وتلي']
  },
  market: {
    title: 'سوق وه — منتجات وحرف يدوية من صعيد مصر',
    description:
      'تسوّق أرقى المنتجات الحرفية اليدوية الأصيلة مباشرة من ورش وحرفيي صعيد مصر مع ضمان الجودة والشحن لجميع المحافظات.',
    canonicalPath: '/products'
  },
  'wah-market': {
    title: 'سوق وه — منتجات وحرف يدوية من صعيد مصر',
    description:
      'تسوّق أرقى المنتجات الحرفية اليدوية الأصيلة مباشرة من ورش وحرفيي صعيد مصر مع ضمان الجودة والشحن لجميع المحافظات.',
    canonicalPath: '/products'
  },
  reels: {
    title: 'ريلز وه — فيديوهات الصنعة والورش الحية',
    description:
      'شاهد مقاطع ريلز وفيديوهات حية من قلب ورش صعيد مصر لحرفيي الفخار والكليم والتلي والنحاس أثناء الصنعة، واقتنِ القطعة مباشرة من صانعها.',
    canonicalPath: '/reels',
    keywords: ['ريلز وه', 'فيديوهات حرفيين', 'صنعة صعيدية', 'ورش صعيد مصر']
  },
  sellers: {
    title: 'دليل ورش وحرفيي صعيد مصر المعتمدين',
    description:
      'تعرّف على شيوخ الصنعة وأصحاب الورش الحرفية المعتمدة في قنا والأقصر وأسوان وسوهاج وأسيوط والمنيا والوادي الجديد وتسوّق منهم مباشرة.',
    canonicalPath: '/sellers',
    keywords: ['حرفيو الصعيد', 'ورش الصعيد', 'شيوخ الصنعة', 'بائعي سوق وه']
  },
  categories: {
    title: 'أقسام وتصنيفات الحرف التراثية',
    description:
      'تصفح جميع أقسام الحرف والصناعات اليدوية الصعيدية: الفخار والخزف، الكليم والسجاد، التلي والتطريز، الخشب والنحاس، وخيرات الصعيد الطبيعية.',
    canonicalPath: '/categories',
    keywords: ['تصنيفات الحرف اليدوية', 'فخار', 'كليم', 'تلي', 'مشغولات يدوية']
  },
  wholesale: {
    title: 'طلبات الجملة والتوريد من ورش الصعيد',
    description:
      'اطلب منتجات حرفية وتراثية صعيدية بأسعار الجملة مباشرة من الورش المعتمدة للفنادق والبازارات والمتاجر وشركات التصدير في مصر والعالم.',
    canonicalPath: '/wholesale',
    keywords: ['جملة حرف يدوية', 'توريد منتجات صعيدية', 'أسعار الجملة للورش', 'تصدير حرف مصرية']
  },
  quiz: {
    title: 'مسابقة عم وه — اختبر معرفتك بكلام الصعيد',
    description:
      'شارك في مسابقة عم وه التفاعلية واكتشف معاني كلمات ومصطلحات وأمثال اللهجة الصعيدية الأصيلة واختبر معلوماتك عن تراث الصعيد.',
    canonicalPath: '/quiz',
    keywords: ['كلام الصعيد', 'اللهجة الصعيدية', 'مسابقة الصعيد', 'قاموس اللهجة الصعيدية']
  },
  quize: {
    title: 'مسابقة عم وه — اختبر معرفتك بكلام الصعيد',
    description:
      'شارك في مسابقة عم وه التفاعلية واكتشف معاني كلمات ومصطلحات وأمثال اللهجة الصعيدية الأصيلة.',
    canonicalPath: '/quiz'
  },
  film: {
    title: 'فيلم وه التوثيقي — الصعيد بيحكي',
    description:
      'شاهد الفيلم التوثيقي لمنصة وه في رحلة بصرية وسمعية داخل قلب صعيد مصر، بين ورش الحرفيين والمعالم العريقة وحكايات أهل البلد.',
    canonicalPath: '/film',
    keywords: ['فيلم وه', 'الصعيد بيحكي', 'وثائقي صعيد مصر']
  },
  intro: {
    title: 'فيلم وه التوثيقي — الصعيد بيحكي',
    description:
      'شاهد الفيلم التوثيقي لمنصة وه في رحلة بصرية وسمعية داخل قلب صعيد مصر وتراثه الأصيل.',
    canonicalPath: '/film'
  },
  help: {
    title: 'المساعدة والتواصل — مضايفة وه',
    description:
      'تواصل مع فريق دعم منصة وه على مدار الأسبوع للاستفسار عن الطلبات والشحن، انضمام الورش والحرفيين، وطلبات الجملة.',
    canonicalPath: '/help',
    keywords: ['تواصل مع وه', 'دعم منصة وه', 'خدمة عملاء وه']
  },
  contact: {
    title: 'المساعدة والتواصل — مضايفة وه',
    description:
      'تواصل مع فريق دعم منصة وه للاستفسار عن الطلبات والشحن أو الانضمام كحرفي وصاحب ورشة.',
    canonicalPath: '/help'
  },
  privacy: {
    title: 'سياسة الخصوصية وحماية البيانات',
    description:
      'تعرّف على سياسة الخصوصية وأمان البيانات في منصة وه وكيف نحمي معلومات الزوار والمشترين وأصحاب الورش.',
    canonicalPath: '/privacy'
  },
  terms: {
    title: 'الشروط والأحكام وعهد الصنعة',
    description:
      'اطّلع على الشروط والأحكام وسياسة الاسترجاع والضمان وعهد التعامل بين المشترين والورش المعتمدة على منصة وه.',
    canonicalPath: '/terms'
  }
};

function getMetadata(page: PublicSeoPage): Metadata {
  const canonical = `${baseUrl}${page.path}`;
  const image = page.image?.startsWith('http')
    ? page.image
    : page.image
      ? `${baseUrl}${page.image}`
      : WAH_DEFAULT_SEO_IMAGE;

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    openGraph: {
      title: `${page.title} | وه | WAH`,
      description: page.description,
      url: canonical,
      siteName: 'وه | WAH',
      type: page.type === 'product' || page.type === 'seller' ? 'website' : 'article',
      locale: 'ar_EG',
      images: [{ url: image, alt: page.title }]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${page.title} | وه | WAH`,
      description: page.description,
      images: [image]
    },
    robots: indexRobots
  };
}

async function resolvePage(params: CatchAllProps['params']) {
  const { slug = [] } = await params;
  const route = (slug[0] || '').toLowerCase();
  const identifier = slug[1] ? decodeURIComponent(slug[1]) : '';
  const page = identifier ? await getPublicSeoPage(route, identifier) : null;
  return { page, route, identifier };
}

export async function generateMetadata({ params }: CatchAllProps): Promise<Metadata> {
  const { page, route, identifier } = await resolvePage(params);
  if (page) return getMetadata(page);

  if (isPrivateRoute(route)) {
    return {
      title: 'منطقة الحساب والإدارة',
      description: 'صفحة خاصة بحسابك وإدارة الطلبات والورشة على منصة وه.',
      robots: noIndexRobots
    };
  }

  const listing = !identifier ? listingMetadata[route] : undefined;
  if (listing) {
    const canonical = `${baseUrl}${listing.canonicalPath}`;
    return {
      title: listing.title,
      description: listing.description,
      ...(listing.keywords ? { keywords: listing.keywords } : {}),
      alternates: { canonical },
      openGraph: {
        title: `${listing.title} | وه | WAH`,
        description: listing.description,
        url: canonical,
        siteName: 'وه | WAH',
        type: 'website',
        locale: 'ar_EG',
        images: [{ url: WAH_DEFAULT_SEO_IMAGE, width: 800, height: 800, alt: listing.title }]
      },
      twitter: {
        card: 'summary_large_image',
        title: `${listing.title} | وه | WAH`,
        description: listing.description,
        images: [WAH_DEFAULT_SEO_IMAGE]
      },
      robots: indexRobots
    };
  }

  return {
    title: 'وه | WAH — الحكاية ورا كل حاجة',
    description:
      'منصة صعيد مصر الشاملة: سوق حرفي تجاري متكامل للتسوق المباشر، ريلز حية للحرفيين، وتوثيق تفاعلي لمعالم وتراث محافظات الصعيد.',
    alternates: { canonical: `${baseUrl}/` },
    robots: route.length === 0 ? indexRobots : noIndexRobots
  };
}

export default async function CatchAllPage({ params }: CatchAllProps) {
  const { page, route, identifier } = await resolvePage(params);

  if (page) {
    const canonicalUrl = `${baseUrl}${page.path}`;
    const entityJsonLd = getPublicSeoJsonLd(page, canonicalUrl);
    const breadcrumbJsonLd = getPublicSeoBreadcrumbJsonLd(page, baseUrl);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(entityJsonLd).replace(/</g, '\\u003c')
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c')
          }}
        />
        <ClientApp />
      </>
    );
  }

  const listing = !identifier && !isPrivateRoute(route) ? listingMetadata[route] : undefined;
  if (listing) {
    const listingJsonLd = getListingSeoJsonLd(
      listing.canonicalPath,
      listing.title,
      listing.description,
      baseUrl
    );
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(listingJsonLd).replace(/</g, '\\u003c')
          }}
        />
        <ClientApp />
      </>
    );
  }

  return <ClientApp />;
}
