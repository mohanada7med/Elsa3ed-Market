import type { Metadata } from 'next';
import ClientApp from './ClientApp';

export const dynamic = 'force-dynamic';

const baseUrl = (process.env.APP_URL || 'https://waaaaah.vercel.app').replace(/\/+$/, '');
const brandLogoUrl = 'https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png';
const homeDescription =
  'اكتشف منصة وه — العالم الرقمي لصعيد مصر: سوق حرفي أصيل للشراء المباشر من ورش الصعيد، ريلز حية للصنعة، خريطة المحافظات، المعالم والأكلات وأعلام الصعيد.';

export const metadata: Metadata = {
  title: {
    absolute: 'وه | WAH — العالم الرقمي لصعيد مصر وسوق الحرف التراثية',
  },
  description: homeDescription,
  alternates: {
    canonical: `${baseUrl}/`,
  },
  openGraph: {
    title: 'وه | WAH — العالم الرقمي لصعيد مصر وسوق الحرف التراثية',
    description: homeDescription,
    url: `${baseUrl}/`,
    siteName: 'وه | WAH',
    locale: 'ar_EG',
    type: 'website',
    images: [
      {
        url: brandLogoUrl,
        width: 800,
        height: 800,
        alt: 'وه | WAH — العالم الرقمي لصعيد مصر',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'وه | WAH — العالم الرقمي لصعيد مصر وسوق الحرف التراثية',
    description: homeDescription,
    images: [brandLogoUrl],
  },
};

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${baseUrl}/#webpage`,
      url: `${baseUrl}/`,
      name: 'وه | WAH — العالم الرقمي لصعيد مصر وسوق الحرف التراثية',
      description: homeDescription,
      inLanguage: 'ar-EG',
      isPartOf: { '@id': `${baseUrl}/#website` },
      about: { '@id': `${baseUrl}/#organization` },
    },
    {
      '@type': 'ItemList',
      name: 'أقسام منصة وه الرئيسية',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'سوق وه للمنتجات الحرفية', url: `${baseUrl}/products` },
        { '@type': 'ListItem', position: 2, name: 'ريلز وفيديوهات الصنعة', url: `${baseUrl}/reels` },
        { '@type': 'ListItem', position: 3, name: 'خريطة ومحافظات صعيد مصر', url: `${baseUrl}/map` },
        { '@type': 'ListItem', position: 4, name: 'معالم وتراث الصعيد', url: `${baseUrl}/places` },
        { '@type': 'ListItem', position: 5, name: 'مطبخ وأكلات الصعيد التراثية', url: `${baseUrl}/food` },
        { '@type': 'ListItem', position: 6, name: 'أعلام وشخصيات الصعيد', url: `${baseUrl}/people` },
        { '@type': 'ListItem', position: 7, name: 'فعاليات ومواسم الصعيد', url: `${baseUrl}/events` },
        { '@type': 'ListItem', position: 8, name: 'ورش وحرفيو الصعيد', url: `${baseUrl}/sellers` },
        { '@type': 'ListItem', position: 9, name: 'طلبات الجملة للورش', url: `${baseUrl}/wholesale` },
      ],
    },
  ],
};

export default function RootPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <ClientApp />
    </>
  );
}
