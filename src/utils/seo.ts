/**
 * SEO and Structured Data Helper for WAH (وه)
 */

export const WAH_DEFAULT_OG_IMAGE =
  'https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png';

export interface SEOConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  canonicalPath?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  schema?: Record<string, any>;
}

function setMetaByName(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function setMetaByProperty(property: string, content: string) {
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function setCanonicalLink(href: string) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function resolveCanonicalUrl(config: SEOConfig): string {
  if (typeof window === 'undefined') return 'https://waaaaah.vercel.app/';
  const origin = window.location.origin.replace(/\/+$/, '');
  if (config.url) {
    try {
      const parsed = new URL(config.url, origin);
      return `${parsed.origin}${parsed.pathname}`;
    } catch {
      return config.url;
    }
  }
  if (config.canonicalPath) {
    const cleanPath = config.canonicalPath.startsWith('/')
      ? config.canonicalPath
      : `/${config.canonicalPath}`;
    return `${origin}${cleanPath}`;
  }
  const pathname = window.location.pathname || '/';
  return `${origin}${pathname}`;
}

export function updatePageSEO(config: SEOConfig) {
  if (typeof document === 'undefined') return;

  const baseTitle = 'وه | WAH';
  const rawTitle = (config.title || '').replace(/\s*\|\s*(وه|WAH)(\s*\|\s*WAH)?\s*$/i, '').trim();
  const finalTitle = rawTitle
    ? `${rawTitle} | ${baseTitle}`
    : `${baseTitle} — العالم الرقمي لصعيد مصر وسوق الحرف التراثية`;

  document.title = finalTitle;

  const description = (
    config.description ||
    'منصة صعيد مصر الشاملة: سوق حرفي تجاري متكامل للتسوق المباشر من الورش، ريلز حية للحرفيين، وموسوعة تفاعلية لمعالم ومحافظات وأكلات وأعلام الصعيد.'
  )
    .replace(/\s+/g, ' ')
    .trim();

  const canonicalUrl = resolveCanonicalUrl(config);
  const imageUrl = config.image?.startsWith('http')
    ? config.image
    : config.image && typeof window !== 'undefined'
      ? `${window.location.origin}${config.image.startsWith('/') ? config.image : `/${config.image}`}`
      : WAH_DEFAULT_OG_IMAGE;

  setMetaByName('description', description);
  setMetaByName(
    'robots',
    config.noIndex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  );
  setCanonicalLink(canonicalUrl);

  // Open Graph
  setMetaByProperty('og:title', finalTitle);
  setMetaByProperty('og:description', description);
  setMetaByProperty('og:type', config.type || 'website');
  setMetaByProperty('og:image', imageUrl);
  setMetaByProperty('og:url', canonicalUrl);
  setMetaByProperty('og:site_name', 'وه | WAH');
  setMetaByProperty('og:locale', 'ar_EG');

  // Twitter Card
  setMetaByName('twitter:card', 'summary_large_image');
  setMetaByName('twitter:title', finalTitle);
  setMetaByName('twitter:description', description);
  setMetaByName('twitter:image', imageUrl);

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
  const pageUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : `https://waaaaah.vercel.app/products/${encodeURIComponent(product.id)}`;

  const hasValidRating = Number(product.rating) > 0 && Number(product.reviewCount) > 0;

  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: Array.isArray(product.images) && product.images.length > 0 ? product.images : [WAH_DEFAULT_OG_IMAGE],
    description: product.description,
    sku: `WAH-${product.id}`,
    mpn: product.id,
    category: product.categoryName || 'حرف وصناعات يدوية وتراثية',
    countryOfOrigin: {
      '@type': 'Country',
      name: 'EG'
    },
    brand: {
      '@type': 'Brand',
      name: product.sellerName || 'حرفيو صعيد مصر'
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EGP',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: pageUrl,
      seller: {
        '@type': 'LocalBusiness',
        name: product.sellerName || 'ورش صعيد مصر',
        address: {
          '@type': 'PostalAddress',
          addressRegion: product.sellerGovernorate || 'صعيد مصر',
          addressCountry: 'EG'
        }
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'EG',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn'
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'EG'
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'd'
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 4,
            unitCode: 'd'
          }
        }
      }
    },
    ...(hasValidRating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Number(product.rating),
            reviewCount: Number(product.reviewCount),
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
  const origin =
    typeof window !== 'undefined' ? window.location.origin.replace(/\/+$/, '') : 'https://waaaaah.vercel.app';

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url
        ? item.url.startsWith('http')
          ? item.url
          : `${origin}${item.url.startsWith('/') ? item.url : `/${item.url}`}`
        : `${origin}/`
    }))
  };
}

/**
 * Generate Schema.org AdministrativeArea Structured Data for Upper Egypt Governorates
 */
export function generateGovernorateSchema(gov: {
  name: string;
  description?: string;
  image?: string;
  latitude?: number;
  longitude?: number;
  url?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AdministrativeArea',
    name: gov.name,
    description: gov.description || `دليل محافظة ${gov.name} ومعالمها وحرفها وأكلاتها على منصة وه`,
    image: gov.image || WAH_DEFAULT_OG_IMAGE,
    url: gov.url,
    inLanguage: 'ar-EG',
    containedInPlace: {
      '@type': 'Country',
      name: 'مصر'
    },
    ...(gov.latitude && gov.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: gov.latitude,
            longitude: gov.longitude
          }
        }
      : {})
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
    image: place.image || WAH_DEFAULT_OG_IMAGE,
    url: place.url,
    inLanguage: 'ar-EG',
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
    image: article.image || WAH_DEFAULT_OG_IMAGE,
    url: article.url,
    inLanguage: 'ar-EG',
    author: {
      '@type': 'Organization',
      name: article.author || 'وه — توثيق التراث'
    },
    publisher: {
      '@type': 'Organization',
      name: 'وه | WAH',
      logo: {
        '@type': 'ImageObject',
        url: WAH_DEFAULT_OG_IMAGE
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
  instructions?: string[];
  url?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: food.name,
    description: food.description || `أكلة صعيدية تقليدية من تراث ${food.governorate || 'الصعيد'}`,
    image: food.image || WAH_DEFAULT_OG_IMAGE,
    url: food.url,
    inLanguage: 'ar-EG',
    author: {
      '@type': 'Organization',
      name: 'وه | WAH'
    },
    recipeCuisine: 'صعيدي / مصري',
    recipeCategory: 'أكلات صعيدية تراثية',
    recipeIngredient:
      food.ingredients && food.ingredients.length > 0
        ? food.ingredients
        : ['مكونات طبيعية من خير مزارع وقرى الصعيد'],
    ...(food.instructions && food.instructions.length > 0
      ? {
          recipeInstructions: food.instructions.map((text) => ({
            '@type': 'HowToStep',
            text
          }))
        }
      : {})
  };
}

/**
 * Generate Schema.org Event Structured Data
 */
export function generateEventSchema(event: {
  name: string;
  description?: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  locationName?: string;
  governorate?: string;
  url?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description || `فعالية وموسم تراثي في ${event.governorate || 'صعيد مصر'}`,
    image: event.image || WAH_DEFAULT_OG_IMAGE,
    url: event.url,
    inLanguage: 'ar-EG',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    ...(event.startDate ? { startDate: event.startDate } : {}),
    ...(event.endDate ? { endDate: event.endDate } : {}),
    organizer: {
      '@type': 'Organization',
      name: 'وه | WAH'
    },
    location: {
      '@type': 'Place',
      name: event.locationName || event.governorate || 'صعيد مصر',
      address: {
        '@type': 'PostalAddress',
        addressRegion: event.governorate || 'صعيد مصر',
        addressCountry: 'EG'
      }
    }
  };
}

/**
 * Generate Schema.org Person Structured Data
 */
export function generatePersonSchema(person: {
  name: string;
  description?: string;
  image?: string;
  jobTitle?: string;
  governorate?: string;
  url?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    description: person.description || `من أعلام وشخصيات ${person.governorate || 'صعيد مصر'}`,
    image: person.image || WAH_DEFAULT_OG_IMAGE,
    url: person.url,
    ...(person.jobTitle ? { jobTitle: person.jobTitle } : {}),
    address: {
      '@type': 'PostalAddress',
      addressRegion: person.governorate || 'صعيد مصر',
      addressCountry: 'EG'
    }
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
    thumbnailUrl: [video.thumbnailUrl || WAH_DEFAULT_OG_IMAGE],
    uploadDate: video.uploadDate || new Date().toISOString(),
    contentUrl: video.contentUrl,
    duration: video.duration || 'PT1M',
    inLanguage: 'ar-EG',
    publisher: {
      '@type': 'Organization',
      name: 'وه | WAH',
      logo: {
        '@type': 'ImageObject',
        url: WAH_DEFAULT_OG_IMAGE
      }
    }
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
    '@type': ['Store', 'LocalBusiness'],
    name: seller.brandName || seller.name,
    description: seller.bio || 'ورشة حرفية وتراثية معتمدة من قلب صعيد مصر، تقدم منتجات يدوية أصيلة.',
    image: seller.avatar || WAH_DEFAULT_OG_IMAGE,
    ...(seller.phone ? { telephone: seller.phone } : {}),
    priceRange: '$$',
    currenciesAccepted: 'EGP',
    paymentAccepted: 'Cash on delivery, Vodafone Cash, Credit Card, Meeza',
    areaServed: {
      '@type': 'Country',
      name: 'EG'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: seller.governorate || 'قنا',
      addressRegion: seller.governorate || 'صعيد مصر',
      addressCountry: 'EG'
    }
  };
}
