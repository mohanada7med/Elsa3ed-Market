/**
 * SEO and Structured Data Helper for WAH (وه)
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
  const baseTitle = 'وه | WAH';
  const finalTitle = config.title ? `${config.title} | ${baseTitle}` : `${baseTitle} — العالم الرقمي لصعيد مصر`;

  document.title = finalTitle;

  // Description
  const description =
    config.description ||
    'وه — منصتك لاكتشاف روح صعيد مصر وحكاياته؛ من بلد لبلد، بنتعرف على ناس الصعيد ومعالمه وحرفه وأكلاته وسوقه التراثي الأصيل.';

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
  sellerGovernorate?: string;
  inStock?: boolean;
  categoryName?: string;
}) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: Array.isArray(product.images) && product.images.length > 0 ? product.images : undefined,
    description: product.description,
    sku: product.id,
    category: product.categoryName || 'حرف وصناعات يدوية',
    brand: {
      '@type': 'Brand',
      name: product.sellerName || 'حرفيي صعيد مصر'
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EGP',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: typeof window !== 'undefined' ? window.location.href : 'https://wah-saeed.com',
      seller: {
        '@type': 'Organization',
        name: product.sellerName || 'وه | صعيد مصر'
      }
    },
    ...(product.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount || 1,
            bestRating: 5,
            worstRating: 1
          }
        }
      : {})
  };
}

/**
 * Generate Schema.org BreadcrumbList Structured Data
 */
export function generateBreadcrumbSchema(items: { name: string; url?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url || (typeof window !== 'undefined' ? window.location.origin : 'https://wah-saeed.com')
    }))
  };
}

/**
 * Generate Schema.org TouristDestination / Place Structured Data
 */
export function generatePlaceSchema(place: {
  name: string;
  description?: string;
  image?: string;
  governorate?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  url?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: place.name,
    description: place.description || `معلم تراثي وأثري أصيل في ${place.governorate || 'صعيد مصر'}`,
    image: place.image,
    url: place.url,
    address: {
      '@type': 'PostalAddress',
      addressRegion: place.governorate || 'صعيد مصر',
      addressCountry: 'EG'
    },
    ...(place.latitude && place.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: place.latitude,
            longitude: place.longitude
          }
        }
      : {})
  };
}

/**
 * Generate Schema.org Article / BlogPosting Structured Data
 */
export function generateArticleSchema(article: {
  title: string;
  description?: string;
  image?: string;
  author?: string;
  datePublished?: string;
  url?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    url: article.url,
    author: {
      '@type': 'Person',
      name: article.author || 'وه — توثيق التراث'
    },
    publisher: {
      '@type': 'Organization',
      name: 'وه | WAH',
      logo: {
        '@type': 'ImageObject',
        url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png'
      }
    },
    datePublished: article.datePublished || new Date().toISOString()
  };
}

/**
 * Generate Schema.org Recipe Structured Data for Upper Egyptian cuisine
 */
export function generateRecipeSchema(food: {
  name: string;
  description?: string;
  image?: string;
  governorate?: string;
  ingredients?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: food.name,
    description: food.description || `أكلة صعيدية تقليدية من تراث ${food.governorate || 'الصعيد'}`,
    image: food.image,
    recipeCuisine: 'صعيدي / مصري',
    recipeCategory: 'أكلات تراثية',
    recipeIngredient: food.ingredients || ['مكونات طبيعية من خير مزارع وقرى الصعيد']
  };
}

/**
 * Generate Schema.org VideoObject Structured Data for Craft Reels
 */
export function generateVideoSchema(video: {
  title: string;
  description?: string;
  thumbnailUrl: string;
  uploadDate?: string;
  contentUrl?: string;
  duration?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description || video.title,
    thumbnailUrl: [video.thumbnailUrl],
    uploadDate: video.uploadDate || new Date().toISOString(),
    contentUrl: video.contentUrl,
    duration: video.duration || 'PT1M'
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
