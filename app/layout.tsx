import type { Metadata, Viewport } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'وه | WAH — الحكاية ورا كل حاجة',
  description:
    'وه WAH هي منصتك وشاشتك الأولى لكل حاجة تخص صعيد مصر. بنجمع لك هنا حكايات أهلنا، تاريخنا العريق، حرفنا اليدوية اللي بنفخر بيها، أكلنا الصعيدي الأصيل، وأحلى الأماكن والأسرار المخفية في محافظات الصعيد.',
  icons: {
    icon: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png',
    apple: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png',
  },
  openGraph: {
    title: 'وه | WAH — الحكاية ورا كل حاجة',
    description:
      'وه WAH هي منصتك وشاشتك الأولى لكل حاجة تخص صعيد مصر. بنجمع لك هنا حكايات أهلنا، تاريخنا العريق، حرفنا اليدوية اللي بنفخر بيها، أكلنا الصعيدي الأصيل، وأحلى الأماكن والأسرار المخفية في محافظات الصعيد.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#9a6a35',
  width: 'device-width',
  initialScale: 1,
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
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#eee8dc] dark:bg-[#0b0b0a] text-[#211d18] dark:text-[#f5f0e7] antialiased selection:bg-[#9a6a35]/20 selection:text-[#9a6a35]">
        {children}
      </body>
    </html>
  );
}
