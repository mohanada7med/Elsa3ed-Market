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
              var removeTimer = null;

              function exitLoader() {
                if (completed) return;
                completed = true;
                if (readyTimer !== null) window.clearTimeout(readyTimer);
                if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
                window.removeEventListener('wah:app-ready', onAppReady);
                root.classList.add('app-ready');

                var fadeDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700;
                removeTimer = window.setTimeout(function () {
                  var loader = document.getElementById('wah-initial-loader');
                  if (loader) loader.remove();
                  removeTimer = null;
                }, fadeDuration);
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
        <link rel="preload" as="image" href="https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png" type="image/png" />
        <link rel="preload" as="image" href="/mascot/logo.png" type="image/png" />
        <link rel="preload" as="image" href="/mascot/welcoming.png" type="image/png" />
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
            <h1>الحكاية ورا كل حاجة</h1>
            <p className="wah-loader-caption" aria-hidden="true">
              <span className="wah-loader-message-list">
                <span>بنجهزلك رحلة في قلب الصعيد</span>
                <span>بنفتح أبواب الحكايات والتراث</span>
                <span>بنوصلك بصنّاع وه المميزين</span>
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
