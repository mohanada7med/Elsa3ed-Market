import { getDatabase, memoryDb } from '../db/mongodb.ts';

export type PublicSeoEntityType =
  | 'product'
  | 'seller'
  | 'governorate'
  | 'place'
  | 'food'
  | 'event'
  | 'person'
  | 'craft'
  | 'category'
  | 'reel';

export interface PublicSeoPage {
  type: PublicSeoEntityType;
  path: string;
  title: string;
  description: string;
  image?: string;
  updatedAt?: string;
  data: Record<string, any>;
}

export const WAH_DEFAULT_SEO_IMAGE =
  'https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png';

const publicStatuses = ['approved', 'verified', 'published'];

const entityConfig: Record<
  string,
  {
    type: PublicSeoEntityType;
    collection: string;
    memoryItems: (store: typeof memoryDb) => any[];
    titleFields: string[];
    descriptionFields: string[];
    imageFields: string[];
  }
> = {
  governorates: {
    type: 'governorate',
    collection: 'wah_governorates',
    memoryItems: (store) => store.governorates,
    titleFields: ['name'],
    descriptionFields: ['shortIntro', 'history'],
    imageFields: ['coverImage']
  },
  places: {
    type: 'place',
    collection: 'wah_heritage_places',
    memoryItems: (store) => store.heritagePlaces,
    titleFields: ['title'],
    descriptionFields: ['shortDescription', 'description', 'history'],
    imageFields: ['coverImage']
  },
  food: {
    type: 'food',
    collection: 'wah_food',
    memoryItems: (store) => store.upperEgyptFood,
    titleFields: ['title', 'name'],
    descriptionFields: ['description', 'originStory', 'story'],
    imageFields: ['coverImage']
  },
  foods: {
    type: 'food',
    collection: 'wah_food',
    memoryItems: (store) => store.upperEgyptFood,
    titleFields: ['title', 'name'],
    descriptionFields: ['description', 'originStory', 'story'],
    imageFields: ['coverImage']
  },
  events: {
    type: 'event',
    collection: 'wah_events',
    memoryItems: (store) => store.culturalEvents,
    titleFields: ['title'],
    descriptionFields: ['description', 'traditions'],
    imageFields: ['coverImage']
  },
  people: {
    type: 'person',
    collection: 'wah_local_people',
    memoryItems: (store) => store.localPeople,
    titleFields: ['name'],
    descriptionFields: ['bio', 'biography', 'titleOrRole'],
    imageFields: ['photoUrl', 'avatarUrl', 'imageUrl']
  },
  crafts: {
    type: 'craft',
    collection: 'wah_cultural_crafts',
    memoryItems: (store) => store.culturalCrafts,
    titleFields: ['title'],
    descriptionFields: ['shortDescription', 'history'],
    imageFields: ['coverImage']
  },
  products: {
    type: 'product',
    collection: 'products',
    memoryItems: (store) => store.products,
    titleFields: ['title'],
    descriptionFields: ['description'],
    imageFields: ['images.0']
  },
  sellers: {
    type: 'seller',
    collection: 'sellers',
    memoryItems: (store) => store.sellers,
    titleFields: ['brandName', 'name'],
    descriptionFields: ['bio', 'story', 'specialty'],
    imageFields: ['coverImage', 'avatar']
  },
  categories: {
    type: 'category',
    collection: 'categories',
    memoryItems: (store) => store.categories,
    titleFields: ['name'],
    descriptionFields: ['description', 'heritageNote'],
    imageFields: ['image', 'imageUrl']
  },
  reels: {
    type: 'reel',
    collection: 'reels',
    memoryItems: (store) => store.reels || [],
    titleFields: ['title', 'caption', 'craftName'],
    descriptionFields: ['description', 'caption', 'story'],
    imageFields: ['thumbnailUrl', 'posterUrl', 'coverImage']
  }
};

const sectionBreadcrumbMap: Record<PublicSeoEntityType, { name: string; path: string }> = {
  product: { name: 'سوق وه للمنتجات الحرفية', path: '/products' },
  seller: { name: 'ورش وحرفيو الصعيد', path: '/sellers' },
  governorate: { name: 'خريطة ومحافظات الصعيد', path: '/map' },
  place: { name: 'معالم وتراث الصعيد', path: '/places' },
  food: { name: 'أكلات ومطبخ الصعيد', path: '/food' },
  event: { name: 'فعاليات ومواسم الصعيد', path: '/events' },
  person: { name: 'أعلام وشخصيات الصعيد', path: '/people' },
  craft: { name: 'الحرف التراثية', path: '/categories' },
  category: { name: 'تصنيفات الحرف والمنتجات', path: '/categories' },
  reel: { name: 'ريلز وفيديوهات الصنعة', path: '/reels' }
};

export function cleanSeoDescription(text: string, maxLength = 160): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  const sliced = normalized.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(' ');
  const cutoff = lastSpace > Math.floor(maxLength * 0.6) ? sliced.slice(0, lastSpace) : sliced;
  return `${cutoff.replace(/[،,.\-:؛]+$/, '')}…`;
}

function firstString(item: Record<string, any>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = key.split('.').reduce<any>((current, part) => current?.[part], item);
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function isPublic(item: Record<string, any>, type: PublicSeoEntityType): boolean {
  if (type === 'product') return item.approvalStatus === 'approved';
  if (type === 'seller') return item.status === 'approved';
  if (type === 'category') return item.active !== false;
  if (type === 'reel') {
    const okStatus = !item.status || publicStatuses.includes(item.status);
    const okMod = !item.moderationStatus || item.moderationStatus === 'approved';
    return okStatus && okMod;
  }
  return !item.status || publicStatuses.includes(item.status);
}

function publicStatusFilter() {
  return {
    $or: [
      { status: { $in: publicStatuses } },
      { status: { $exists: false } },
      { status: null }
    ]
  };
}

export async function getPublicSeoPage(
  route: string,
  identifier: string
): Promise<PublicSeoPage | null> {
  const config = entityConfig[route];
  if (!config || !identifier) return null;

  const { db, isMongo } = await getDatabase();
  let item: Record<string, any> | null = null;

  if (isMongo && db) {
    const statusFilter =
      config.type === 'product'
        ? { approvalStatus: 'approved' }
        : config.type === 'seller'
          ? { status: 'approved' }
          : config.type === 'category'
            ? { active: { $ne: false } }
            : config.type === 'reel'
              ? {
                  $and: [
                    publicStatusFilter(),
                    {
                      $or: [
                        { moderationStatus: 'approved' },
                        { moderationStatus: { $exists: false } },
                        { moderationStatus: null }
                      ]
                    }
                  ]
                }
              : publicStatusFilter();

    item = await db.collection(config.collection).findOne({
      $and: [
        { $or: [{ slug: identifier }, { id: identifier }] },
        statusFilter
      ]
    });
  } else {
    item =
      config.memoryItems(memoryDb).find(
        (candidate) =>
          (candidate.slug === identifier || candidate.id === identifier) &&
          isPublic(candidate, config.type)
      ) || null;
  }

  if (!item && config.type === 'event') {
    if (isMongo && db) {
      item = await db.collection('wah_seasons').findOne({
        $and: [
          { $or: [{ slug: identifier }, { id: identifier }] },
          publicStatusFilter()
        ]
      });
    } else {
      item =
        memoryDb.seasons.find(
          (candidate) =>
            (candidate.slug === identifier || candidate.id === identifier) &&
            isPublic(candidate, 'event')
        ) || null;
    }
  }

  if (!item) return null;

  const title = firstString(item, config.titleFields);
  if (!title) return null;

  const canonicalRoute = route === 'foods' ? 'food' : route;
  const rawDescription =
    firstString(item, config.descriptionFields) ||
    `${title} — منصة وه لاكتشاف تراث صعيد مصر.`;

  const images = Array.isArray(item.images) ? item.images : [];
  return {
    type: config.type,
    path: `/${canonicalRoute}/${encodeURIComponent(String(item.slug || item.id))}`,
    title,
    description: cleanSeoDescription(rawDescription, 160),
    image: firstString(item, config.imageFields) || images[0],
    updatedAt: item.updatedAt || item.createdAt,
    data: item
  };
}

export function getPublicSeoJsonLd(page: PublicSeoPage, canonicalUrl: string) {
  const { data } = page;
  const image = page.image || WAH_DEFAULT_SEO_IMAGE;

  switch (page.type) {
    case 'governorate':
      return {
        '@context': 'https://schema.org',
        '@type': 'AdministrativeArea',
        name: page.title,
        description: page.description,
        image,
        url: canonicalUrl,
        inLanguage: 'ar-EG',
        containedInPlace: {
          '@type': 'Country',
          name: 'مصر'
        },
        ...(data.coordinates?.lat && data.coordinates?.lng
          ? {
              geo: {
                '@type': 'GeoCoordinates',
                latitude: data.coordinates.lat,
                longitude: data.coordinates.lng
              }
            }
          : {})
      };
    case 'place':
      return {
        '@context': 'https://schema.org',
        '@type': 'TouristDestination',
        name: page.title,
        description: page.description,
        image,
        url: canonicalUrl,
        inLanguage: 'ar-EG',
        address: {
          '@type': 'PostalAddress',
          addressRegion: data.governorateName || 'صعيد مصر',
          addressCountry: 'EG'
        },
        ...(data.coordinates
          ? {
              geo: {
                '@type': 'GeoCoordinates',
                latitude: data.coordinates.lat,
                longitude: data.coordinates.lng
              }
            }
          : {})
      };
    case 'food': {
      const rawPrep = data.preparationMethod || data.preparation || '';
      const instructions = typeof rawPrep === 'string' && rawPrep.trim()
        ? rawPrep
            .split(/\n+/)
            .map((step: string) => step.replace(/^[\d\-•*.]+\s*/, '').trim())
            .filter(Boolean)
            .map((text: string) => ({ '@type': 'HowToStep', text }))
        : undefined;

      return {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: page.title,
        description: page.description,
        image,
        url: canonicalUrl,
        inLanguage: 'ar-EG',
        author: {
          '@type': 'Organization',
          name: 'وه | WAH'
        },
        recipeCuisine: 'Upper Egyptian',
        recipeCategory: 'أكلات صعيدية تراثية',
        recipeIngredient: Array.isArray(data.ingredients) ? data.ingredients : [],
        ...(instructions && instructions.length > 0 ? { recipeInstructions: instructions } : {})
      };
    }
    case 'event':
      return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: page.title,
        description: page.description,
        image,
        inLanguage: 'ar-EG',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        startDate: data.startDate || data.eventDate || data.startPeriod,
        endDate: data.endDate || data.endPeriod,
        url: canonicalUrl,
        organizer: {
          '@type': 'Organization',
          name: 'وه | WAH'
        },
        location: {
          '@type': 'Place',
          name: data.locationName || data.location || data.cityName || data.governorateName || 'صعيد مصر',
          address: {
            '@type': 'PostalAddress',
            addressRegion: data.governorateName || 'صعيد مصر',
            addressCountry: 'EG'
          }
        }
      };
    case 'person':
      return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: page.title,
        description: page.description,
        image,
        url: canonicalUrl,
        ...(data.titleOrRole ? { jobTitle: data.titleOrRole } : {}),
        address: {
          '@type': 'PostalAddress',
          addressRegion: data.governorateName || 'صعيد مصر',
          addressCountry: 'EG'
        }
      };
    case 'product': {
      const hasValidRating = Number(data.rating) > 0 && Number(data.reviewCount) > 0;
      const productImages = Array.isArray(data.images) && data.images.length > 0 ? data.images : [image];
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: page.title,
        description: page.description,
        image: productImages,
        sku: `WAH-${data.id || page.title}`,
        category: data.categoryName || 'حرف ومنتجات صعيد مصر التراثية',
        brand: {
          '@type': 'Brand',
          name: data.sellerName || 'ورش وحرفيو وه — صعيد مصر'
        },
        url: canonicalUrl,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'EGP',
          price: data.price,
          url: canonicalUrl,
          itemCondition: 'https://schema.org/NewCondition',
          availability:
            data.stockCount > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
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
            }
          }
        },
        ...(hasValidRating
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: Number(data.rating),
                reviewCount: Number(data.reviewCount),
                bestRating: 5,
                worstRating: 1
              }
            }
          : {})
      };
    }
    case 'seller':
      return {
        '@context': 'https://schema.org',
        '@type': 'Store',
        name: page.title,
        description: page.description,
        image,
        url: canonicalUrl,
        priceRange: '$$',
        currenciesAccepted: 'EGP',
        areaServed: {
          '@type': 'Country',
          name: 'EG'
        },
        ...(data.phone ? { telephone: data.phone } : {}),
        address: {
          '@type': 'PostalAddress',
          addressLocality: data.city || data.governorate || 'قنا',
          addressRegion: data.governorate || 'صعيد مصر',
          addressCountry: 'EG'
        }
      };
    case 'reel':
      return {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: page.title,
        description: page.description,
        thumbnailUrl: [image],
        contentUrl: data.videoUrl,
        embedUrl: canonicalUrl,
        uploadDate: data.createdAt || page.updatedAt || new Date().toISOString(),
        inLanguage: 'ar-EG',
        publisher: {
          '@type': 'Organization',
          name: 'وه | WAH',
          logo: {
            '@type': 'ImageObject',
            url: WAH_DEFAULT_SEO_IMAGE
          }
        }
      };
    default:
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: page.title,
        description: page.description,
        image,
        url: canonicalUrl,
        inLanguage: 'ar-EG',
        dateModified: page.updatedAt,
        publisher: {
          '@type': 'Organization',
          name: 'وه | WAH',
          logo: {
            '@type': 'ImageObject',
            url: WAH_DEFAULT_SEO_IMAGE
          }
        }
      };
  }
}

export function getPublicSeoBreadcrumbJsonLd(page: PublicSeoPage, baseUrl: string) {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const section = sectionBreadcrumbMap[page.type];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'الرئيسية',
        item: `${cleanBase}/`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: section.name,
        item: `${cleanBase}${section.path}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: page.title,
        item: `${cleanBase}${page.path}`
      }
    ]
  };
}

export function getListingSeoJsonLd(
  canonicalPath: string,
  title: string,
  description: string,
  baseUrl: string
) {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const canonicalUrl = `${cleanBase}${canonicalPath}`;

  const graph: Record<string, any>[] = [
    {
      '@type': 'CollectionPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: `${title} | وه | WAH`,
      description,
      inLanguage: 'ar-EG',
      isPartOf: {
        '@id': `${cleanBase}/#website`
      }
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'الرئيسية',
          item: `${cleanBase}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: title,
          item: canonicalUrl
        }
      ]
    }
  ];

  if (canonicalPath === '/help') {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'ما هي منصة وه (WAH)؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'منصة وه هي العالم الرقمي الشامل لصعيد مصر؛ تجمع بين سوق إلكتروني مباشر لمنتجات الورش والحرفيين الأصيلة، وريلز حية للصنعة، وموسوعة تفاعلية لمعالم ومحافظات وأكلات وأعلام الصعيد.'
          }
        },
        {
          '@type': 'Question',
          name: 'هل يتم الشحن لجميع محافظات مصر؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'نعم، نوفر شحناً آمناً ومغلفاً بعناية لجميع محافظات مصر مباشرة من ورش الحرفيين في صعيد مصر مع إمكانية تتبع الطلب.'
          }
        },
        {
          '@type': 'Question',
          name: 'كيف يمكنني الانضمام كحرفي أو صاحب ورشة على منصة وه؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'يمكنك إنشاء حساب جديد والتقديم لاعتماد ورشتك من خلال صفحة الحساب الشخصي، وسيقوم فريق وه بمراجعة الطلب والتواصل معك.'
          }
        }
      ]
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}
