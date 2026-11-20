import type { Metadata, Viewport } from 'next';
import '../src/index.css';

const baseUrl = (process.env.APP_URL || 'https://waaaaah.vercel.app').replace(/\/+$/, '');
const brandLogoUrl = 'https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png';
const defaultDescription =
  'منصة صعيد مصر الشاملة: سوق حرفي تجاري متكامل للتسوق المباشر من الورش، ريلز حية للحرفيين، وموسوعة تفاعلية لمعالم ومحافظات وأكلات وأعلام الصعيد.';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  applicationName: 'وه | WAH',
  title: {
    default: 'وه | WAH — الحكاية ورا كل حاجة',
    template: '%s | وه | WAH',
  },
  description: defaultDescription,
  keywords: [
    'وه',
    'WAH',
    'وه صعيد مصر',
    'صعيد مصر',
    'تراث الصعيد',
    'حرف يدوية صعيدية',
    'سوق صعيد مصر',
    'منتجات يدوية مصرية',
    'محافظات صعيد مصر',
    'معالم الصعيد',
    'أكلات صعيدية',
    'أعلام الصعيد',
    'فخار',
    'كليم',
    'تلي',
    'عيش شمسي',
    'قنا',
    'الأقصر',
    'أسوان',
    'سوهاج',
    'أسيوط',
    'المنيا',
    'بني سويف',
    'الفيوم',
    'الوادي الجديد',
    'البحر الأحمر',
    'Upper Egypt Heritage',
    'Egyptian Handmade Crafts',
  ],
  authors: [{ name: 'وه | WAH', url: baseUrl }],
  creator: 'وه | WAH',
  publisher: 'وه | WAH',
  category: 'Culture & Heritage',
  alternates: {
    canonical: `${baseUrl}/`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: brandLogoUrl,
    apple: brandLogoUrl,
  },
  openGraph: {
    title: 'وه | WAH — الحكاية ورا كل حاجة',
    description: defaultDescription,
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
    title: 'وه | WAH — الحكاية ورا كل حاجة',
    description: defaultDescription,
    images: [brandLogoUrl],
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
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try {
              var savedTheme = localStorage.getItem('elsa3ed_theme');
              if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
                document.documentElement.setAttribute('data-theme', 'dark');
              }
            } catch (error) {
              console.warn('[Theme] Could not restore the saved theme:', error);
            }`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function () {
              var root = document.documentElement;
              var startedAt = Date.now();
              root.dataset.wahLoaderStartedAt = String(startedAt);
              var completed = false;
              var readyTimer = null;
              var fallbackTimer = null;

              function exitLoader() {
                if (completed) return;
                completed = true;
                if (readyTimer !== null) window.clearTimeout(readyTimer);
                if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
                window.removeEventListener('wah:app-ready', onAppReady);
                root.classList.add('app-ready');
              }

              function onAppReady() {
                var remaining = Math.max(0, 4000 - (Date.now() - startedAt));
                readyTimer = window.setTimeout(exitLoader, remaining);
              }

              window.addEventListener('wah:app-ready', onAppReady, { once: true });
              fallbackTimer = window.setTimeout(exitLoader, 12000);
            })();`,
          }}
        />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preload" as="image" href={brandLogoUrl} type="image/png" />
        <link rel="preload" as="image" href="/mascot/logo.png" type="image/png" />
        <link rel="preload" as="image" href="/mascot/welcoming.png" type="image/png" />
        <link rel="preload" as="image" href="/mascot/success.png" type="image/png" />
        <link rel="preload" as="image" href="/mascot/wrong.png" type="image/png" />
        <link rel="preload" as="image" href="/mascot/warning.png" type="image/png" />
        <link rel="preload" as="image" href="/mascot/info.png" type="image/png" />
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
        <link
          rel="preload"
          href="/fonts/wah-arabic-digits-bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/wah-arabic-digits-extrabold.woff2"
          as="font"
          type="font/woff2"
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
                  '@id': `${baseUrl}/#organization`,
                  name: 'وه | WAH — العالم الرقمي لصعيد مصر',
                  alternateName: ['وه', 'WAH', 'منصة وه'],
                  url: baseUrl,
                  logo: {
                    '@type': 'ImageObject',
                    url: brandLogoUrl,
                    caption: 'منصة وه لتراث وحرف صعيد مصر'
                  },
                  description: defaultDescription,
                  areaServed: {
                    '@type': 'Country',
                    name: 'Egypt'
                  },
                  address: {
                    '@type': 'PostalAddress',
                    addressRegion: 'صعيد مصر',
                    addressCountry: 'EG'
                  }
                },
                {
                  '@type': 'WebSite',
                  '@id': `${baseUrl}/#website`,
                  url: baseUrl,
                  name: 'وه | WAH',
                  alternateName: 'منصة وه لصعيد مصر',
                  description:
                    'العالم الرقمي لصعيد مصر: تراث، حرف، سوق، ريلز، أكلات، ومعالم أصيلة',
                  publisher: {
                    '@id': `${baseUrl}/#organization`
                  },
                  inLanguage: 'ar-EG',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: `${baseUrl}/global-search?q={search_term_string}`,
                    'query-input': 'required name=search_term_string'
                  }
                }
              ]
            }).replace(/</g, '\\u003c')
          }}
        />
      </head>
      <body className="bg-[#FFF9EE] dark:bg-[#1B1009] text-[#3B1E0E] dark:text-[#FFF9EE] antialiased selection:bg-[#C99444]/30 selection:text-[#3B1E0E] dark:selection:text-[#FFF9EE] font-cairo">
        <div id="wah-initial-loader" role="status" aria-label="جاري تحميل وه">
          <div className="wah-loader-content">
            <div className="wah-loader-emblem">
              <span className="wah-loader-orbit wah-loader-orbit-outer" aria-hidden="true" />
              <span className="wah-loader-orbit wah-loader-orbit-inner" aria-hidden="true" />
              <img src="/mascot/logo.png" alt="" width="112" height="112" fetchPriority="high" />
              <span className="wah-loader-spark wah-loader-spark-one" aria-hidden="true" />
              <span className="wah-loader-spark wah-loader-spark-two" aria-hidden="true" />
            </div>
            <p className="wah-loader-kicker">من قلب الصعيد</p>
            <p className="wah-loader-title">الحكاية ورا كل حاجة</p>
            <p className="wah-loader-caption" aria-hidden="true">
              <span className="wah-loader-message-list">
                <span>بنجهزلك رحلة في قلب الصعيد</span>
                <span>بنفتح أبواب الحكايات والتراث</span>
                <span>بنوصلك بحرفيي وه المميزين</span>
              </span>
            </p>
            <div
              className="wah-loader-progress"
              role="progressbar"
              aria-label="جاري تجهيز المنصة"
              aria-valuetext="جاري التحميل"
            >
              <span />
            </div>
            <p className="wah-loader-footnote">لحظات وتبدأ الرحلة</p>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
