import type { Metadata, Viewport } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'وه - WAH العالم الرقمي لصعيد مصر',
  description:
    'وه — كل حكاية ليها أصل. منصة رقمية شاملة لاكتشاف وتوثيق وربط تراث وثقافة ومحافظات وحرف وأكلات وناس وحكايات وصناع صعيد مصر، وسوق وه للحرف التراثية.',
  icons: {
    icon: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png',
    apple: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png',
  },
  openGraph: {
    title: 'وه | WAH — العالم الرقمي لصعيد مصر',
    description: 'وه — كل حكاية ليها أصل. اكتشف الصعيد من خلال ناسه وأماكنه وحرفه وأكلاته وحكاياته وسوقه.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#B24C2B',
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
      <body className="bg-[var(--wah-background,#FAF7F2)] dark:bg-[var(--wah-background,#110E0C)] text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] antialiased selection:bg-[var(--wah-primary,#B24C2B)]/20 selection:text-[var(--wah-primary,#B24C2B)]">
        {children}
      </body>
    </html>
  );
}
