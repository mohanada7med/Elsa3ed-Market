import type { Metadata, Viewport } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'وه | WAH — الحكاية ورا كل حاجة',
  description:
    'منصة صعيد مصر الشاملة: سوق حرفي تجاري متكامل للتسوق المباشر، ريلز وتجارب صناع المحتوى الحية، وتوثيق وثائقي تفاعلي لمعالم وتراث محافظات الصعيد.',
  icons: {
    icon: 'https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png',
    apple: 'https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png',
  },
  openGraph: {
    title: 'وه | WAH — الحكاية ورا كل حاجة',
    description:
      'منصة صعيد مصر الشاملة: سوق حرفي تجاري متكامل للتسوق المباشر، ريلز وتجارب صناع المحتوى الحية، وتوثيق وثائقي تفاعلي لمعالم وتراث محافظات الصعيد.',
    type: 'website',
    images: [
      {
        url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png',
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
    images: ['https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#3B1E0E',
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
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preload" as="image" href="https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png" type="image/png" />
        {/* Typography: Cairo (Primary UI & Display), Amiri (Heritage & Editorial) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="preload"
          href="/fonts/alfont_com_Amira-Typo.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/AdobeArabic-Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
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
                    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png',
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
      <body className="bg-[#FFF9EE] dark:bg-[#1B1009] text-[#3B1E0E] dark:text-[#FFF9EE] antialiased selection:bg-[#C99444]/30 selection:text-[#3B1E0E] dark:selection:text-[#FFF9EE] font-cairo">
        {children}
      </body>
    </html>
  );
}
