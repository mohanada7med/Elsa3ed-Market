import ClientApp from '../ClientApp';
import type { Metadata } from 'next';
import {
  getPublicSeoJsonLd,
  getPublicSeoPage,
  type PublicSeoPage
} from '../../server/services/publicSeoService';

export const dynamic = 'force-dynamic';

type CatchAllProps = {
  params: Promise<{ slug: string[] }>;
};

const baseUrl = (process.env.APP_URL || 'https://wah-saeed.com').replace(/\/+$/, '');

function getMetadata(page: PublicSeoPage): Metadata {
  const canonical = `${baseUrl}${page.path}`;
  const image = page.image?.startsWith('http')
    ? page.image
    : page.image
      ? `${baseUrl}${page.image}`
      : undefined;

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonical,
      type: page.type === 'product' ? 'website' : 'article',
      locale: 'ar_EG',
      ...(image ? { images: [{ url: image, alt: page.title }] } : {})
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      ...(image ? { images: [image] } : {})
    },
    robots: { index: true, follow: true }
  };
}

async function resolvePage(params: CatchAllProps['params']) {
  const { slug = [] } = await params;
  const route = slug[0] || '';
  const identifier = slug[1] || '';
  const page = identifier ? await getPublicSeoPage(route, identifier) : null;
  return { page, route };
}

const listingMetadata: Record<string, [string, string]> = {
  map: ['خريطة محافظات الصعيد', 'استكشف محافظات الصعيد ومدنها ومعالمها وتراثها على الخريطة التفاعلية.'],
  governorates: ['محافظات صعيد مصر', 'اكتشف محافظات الصعيد وتاريخها ومدنها ومعالمها وتراثها.'],
  places: ['معالم وتراث الصعيد', 'دليل المعابد والأديرة والمتاحف والمعالم التراثية في صعيد مصر.'],
  food: ['أكلات الصعيد التراثية', 'اكتشف وصفات وأكلات صعيد مصر وحكاياتها ومكوناتها.'],
  events: ['فعاليات ومواسم الصعيد', 'تابع الفعاليات والمواسم الثقافية في محافظات صعيد مصر.'],
  people: ['شخصيات من صعيد مصر', 'تعرّف على الحرفيين والشخصيات المؤثرة وحكايات أهل الصعيد.'],
  products: ['منتجات حرفية من صعيد مصر', 'تسوّق منتجات يدوية أصيلة من ورش وحرفيي صعيد مصر.'],
  sellers: ['حرفيو وورش الصعيد', 'تعرّف على الورش والحرفيين المعتمدين في صعيد مصر.'],
  categories: ['تصنيفات الحرف التراثية', 'استكشف الحرف والصناعات اليدوية التراثية في صعيد مصر.'],
  crafts: ['الحرف التراثية', 'اكتشف الحرف والصناعات اليدوية الأصيلة في صعيد مصر.'],
  stories: ['حكايات وتراث الصعيد', 'اقرأ الحكايات والروايات التي توثق تراث صعيد مصر.'],
  heritage: ['تراث صعيد مصر', 'اكتشف تراث صعيد مصر وحرفه وأماكنه وأكلاته.']
};

export async function generateMetadata({ params }: CatchAllProps): Promise<Metadata> {
  const { page, route } = await resolvePage(params);
  if (page) return getMetadata(page);

  const listing = listingMetadata[route];
  if (listing) {
    const [title, description] = listing;
    const canonical = `${baseUrl}/${route}`;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { title, description, url: canonical, type: 'website', locale: 'ar_EG' },
      robots: { index: true, follow: true }
    };
  }

  return {
    title: 'وه | WAH — الحكاية ورا كل حاجة',
    description: 'منصة صعيد مصر الشاملة: سوق حرفي تجاري متكامل للتسوق المباشر، وتوثيق تفاعلي لمعالم وتراث محافظات الصعيد.',
    alternates: { canonical: `${baseUrl}/` },
    robots: { index: route.length === 0, follow: true }
  };
}

export default async function CatchAllPage({ params }: CatchAllProps) {
  const { page } = await resolvePage(params);
  if (!page) return <ClientApp />;

  const canonicalUrl = `${baseUrl}${page.path}`;
  const jsonLd = getPublicSeoJsonLd(page, canonicalUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')
        }}
      />
      <ClientApp />
    </>
  );
}
