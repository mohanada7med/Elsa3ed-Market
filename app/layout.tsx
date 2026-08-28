import type { Metadata, Viewport } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'سوق الصعيد | Elsa3ed Market — أصالة الحرف والمنتجات التراثية',
  description:
    'سوق الصعيد هو المنصة الرائدة لعرض وشراء المنتجات اليدوية والحرف التراثية والخيرات الأصيلة من قلب صعيد مصر: فخار قنا وأسيوط، كليم أخميم، عسل السدر، والتمور النوبية.',
  icons: {
    icon: 'https://res.cloudinary.com/kuana1nl/image/upload/v1787864171/elsa3ed_market2.png',
    apple: 'https://res.cloudinary.com/kuana1nl/image/upload/v1787864171/elsa3ed_market2.png',
  },
  openGraph: {
    title: 'سوق الصعيد | Elsa3ed Market',
    description: 'منصة الحرف اليدوية والمنتجات التراثية والخيرات الأصيلة من صعيد مصر',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#9a3412',
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
      <body className="bg-[#faf6f0] text-[#29221d] antialiased selection:bg-[#c25e2e]/20 selection:text-[#802a0a]">
        {children}
      </body>
    </html>
  );
}
