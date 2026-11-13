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
  | 'category';

export interface PublicSeoPage {
  type: PublicSeoEntityType;
  path: string;
  title: string;
  description: string;
  image?: string;
  updatedAt?: string;
  data: Record<string, any>;
}

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
  }
};

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

  const images = Array.isArray(item.images) ? item.images : [];
  return {
    type: config.type,
    path: `/${route}/${encodeURIComponent(String(item.slug || item.id))}`,
    title,
    description:
      firstString(item, config.descriptionFields) ||
      `${title} — منصة وه لاكتشاف تراث صعيد مصر.`,
    image: firstString(item, config.imageFields) || images[0],
    updatedAt: item.updatedAt || item.createdAt,
    data: item
  };
}

export function getPublicSeoJsonLd(page: PublicSeoPage, canonicalUrl: string) {
  const { data } = page;
  const image = page.image;

  switch (page.type) {
    case 'place':
      return {
        '@context': 'https://schema.org',
        '@type': 'TouristDestination',
        name: page.title,
        description: page.description,
        image,
        url: canonicalUrl,
        address: {
          '@type': 'PostalAddress',
          addressRegion: data.governorateName,
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
    case 'food':
      return {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: page.title,
        description: page.description,
        image,
        recipeCuisine: 'Upper Egyptian',
        recipeIngredient: data.ingredients || []
      };
    case 'event':
      return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: page.title,
        description: page.description,
        image,
        startDate: data.startDate || data.eventDate || data.startPeriod,
        endDate: data.endDate || data.endPeriod,
        url: canonicalUrl,
        location: {
          '@type': 'Place',
          name: data.locationName || data.location || data.cityName || data.governorateName,
          address: {
            '@type': 'PostalAddress',
            addressRegion: data.governorateName,
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
        address: data.governorateName
      };
    case 'product':
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: page.title,
        description: page.description,
        image,
        url: canonicalUrl,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'EGP',
          price: data.price,
          availability: data.stockCount > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock'
        }
      };
    case 'seller':
      return {
        '@context': 'https://schema.org',
        '@type': 'Store',
        name: page.title,
        description: page.description,
        image,
        url: canonicalUrl
      };
    default:
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: page.title,
        description: page.description,
        image,
        url: canonicalUrl,
        dateModified: page.updatedAt
      };
  }
}
