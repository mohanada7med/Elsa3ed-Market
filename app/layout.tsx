import type { Metadata, Viewport } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'وه | WAH — الحكاية ورا كل حاجة',
  description:
    'منصة صعيد مصر الشاملة: سوق حرفي تجاري متكامل للتسوق المباشر، ريلز وتجارب صناع المحتوى الحية، وتوثيق وثائقي تفاعلي لمعالم وتراث محافظات الصعيد.',
  icons: {
    icon: 'https://res.cloudinary.com/kuana1nl/image/upload/v1790364861/logo_wah_copy2.png',
    apple: 'https://res.cloudinary.com/kuana1nl/image/upload/v1790364861/logo_wah_copy2.png',
  },
  openGraph: {
    title: 'وه | WAH — الحكاية ورا كل حاجة',
    description:
      'منصة صعيد مصر الشاملة: سوق حرفي تجاري متكامل للتسوق المباشر، ريلز وتجارب صناع المحتوى الحية، وتوثيق وثائقي تفاعلي لمعالم وتراث محافظات الصعيد.',
    type: 'website',
    images: [
      {
        url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1790364861/logo_wah_copy2.png',
        width: 800,
        height: 800,
        alt: 'وه | WAH',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'وه | WAH — الحكاية ورا كل حاجة',
    description:
      'منصة صعيد مصر الشاملة: سوق حرفي تجاري متكامل للتسوق المباشر، ريلز وتجارب صناع المحتوى الحية، وتوثيق وثائقي تفاعلي لمعالم وتراث محافظات الصعيد.',
    images: ['https://res.cloudinary.com/kuana1nl/image/upload/v1790364861/logo_wah_copy2.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#9a6a35',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preload" as="image" href="https://res.cloudinary.com/kuana1nl/image/upload/v1790364861/logo_wah_copy2.png" type="image/png" />
        <link rel="preload" as="image" href="/logo-wah.png" type="image/png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': 'https://wah-saeed.com/#organization',
                  name: 'وه | WAH — العالم الرقمي لصعيد مصر',
                  url: 'https://wah-saeed.com',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1790364861/logo_wah_copy2.png',
                    caption: 'منصة وه لتراث وحرف صعيد مصر'
                  },
                  description:
                    'منصة صعيد مصر الشاملة: سوق حرفي تجاري متكامل للتسوق المباشر من الورش، وتوثيق وثائقي تفاعلي لمعالم وتراث وقرى وأكلات محافظات الصعيد.',
                  address: {
                    '@type': 'PostalAddress',
                    addressRegion: 'صعيد مصر',
                    addressCountry: 'EG'
                  }
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://wah-saeed.com/#website',
                  url: 'https://wah-saeed.com',
                  name: 'وه | WAH',
                  description:
                    'العالم الرقمي لصعيد مصر: تراث، حرف، سوق، أكلات، ومعالم أصيلة',
                  publisher: {
                    '@id': 'https://wah-saeed.com/#organization'
                  },
                  inLanguage: 'ar-EG',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://wah-saeed.com/?search={search_term_string}',
                    'query-input': 'required name=search_term_string'
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body className="bg-cream dark:bg-espresso-900 text-espresso dark:text-cream antialiased selection:bg-primary/20 selection:text-primary">
        {children}
      </body>
    </html>
  );
}
