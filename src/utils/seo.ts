/**
 * SEO and Structured Data Helper for Elsa3ed Market (سوق الصعيد)
 */

export interface SEOConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  schema?: Record<string, any>;
}

export function updatePageSEO(config: SEOConfig) {
  const baseTitle = 'سوق الصعيد | Elsa3ed Market';
  const finalTitle = config.title ? `${config.title} | ${baseTitle}` : `${baseTitle} — أصالة الحرف والمنتجات التراثية`;

  document.title = finalTitle;

  // Description
  const description =
    config.description ||
    'سوق الصعيد هو المنصة الرائدة لعرض وشراء المنتجات اليدوية والحرف التراثية والخيرات الأصيلة من قلب صعيد مصر.';

  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  // Open Graph
  const ogTags: Record<string, string> = {
    'og:title': finalTitle,
    'og:description': description,
    'og:type': config.type || 'website',
    'og:image': config.image || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
    'og:url': config.url || window.location.href
  };

  for (const [property, content] of Object.entries(ogTags)) {
    let ogMeta = document.querySelector(`meta[property="${property}"]`);
    if (!ogMeta) {
      ogMeta = document.createElement('meta');
      ogMeta.setAttribute('property', property);
      document.head.appendChild(ogMeta);
    }
    ogMeta.setAttribute('content', content);
  }

  // Schema.org JSON-LD Injection
  const existingSchema = document.getElementById('structured-data-jsonld');
  if (existingSchema) {
    existingSchema.remove();
  }

  if (config.schema) {
    const script = document.createElement('script');
    script.id = 'structured-data-jsonld';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(config.schema);
    document.head.appendChild(script);
  }
}

/**
 * Generate Schema.org Product Structured Data
 */
export function generateProductSchema(product: {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  rating?: number;
  reviewCount?: number;
  sellerName?: string;
  inStock?: boolean;
}) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: product.images,
    description: product.description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: product.sellerName || 'حرفيي صعيد مصر'
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EGP',
      price: product.price,
      availability: product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: window.location.href
    },
    ...(product.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount || 1
          }
        }
      : {})
  };
}

/**
 * Generate Schema.org Store / LocalBusiness Structured Data
 */
export function generateStoreSchema(seller: {
  id: string;
  name: string;
  brandName?: string;
  bio?: string;
  avatar?: string;
  governorate?: string;
  phone?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: seller.brandName || seller.name,
    description: seller.bio || 'ورشة حرفية تراثية بصعيد مصر',
    image: seller.avatar,
    telephone: seller.phone,
    address: {
      '@type': 'PostalAddress',
      addressRegion: seller.governorate || 'قنا',
      addressCountry: 'EG'
    }
  };
}
