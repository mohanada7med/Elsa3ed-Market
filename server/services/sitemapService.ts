import { getDatabase, memoryDb } from '../db/mongodb.ts';

export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Validates whether a value is a reliable date.
 * Returns a valid Date object only if reliable, otherwise undefined.
 */
export function parseReliableDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  const time = date.getTime();
  if (Number.isNaN(time)) return undefined;
  // Guard against epoch or corrupt dates
  if (date.getFullYear() < 2020 || date.getFullYear() > 2100) return undefined;
  return date;
}

/**
 * Escapes XML entities safely.
 */
export function escapeXml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Fetches all indexable public URLs and returns clean sitemap entries.
 */
export async function getSitemapEntries(baseUrl: string): Promise<SitemapEntry[]> {
  const normalizedBase = (baseUrl || 'https://waaaaah.vercel.app').replace(/\/+$/, '');
  const seenUrls = new Set<string>();
  const entries: SitemapEntry[] = [];

  const addEntry = (
    path: string,
    options?: {
      lastModified?: Date;
      changeFrequency?: SitemapEntry['changeFrequency'];
      priority?: number;
    }
  ) => {
    const cleanPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
    const fullUrl = `${normalizedBase}${cleanPath}`;

    if (seenUrls.has(fullUrl)) return;
    seenUrls.add(fullUrl);

    entries.push({
      url: fullUrl,
      ...(options?.lastModified ? { lastModified: options.lastModified } : {}),
      changeFrequency: options?.changeFrequency || 'weekly',
      priority: options?.priority ?? 0.5,
    });
  };

  // 1. Static Core Public Pages (Excludes private dashboards, search, auth, admin)
  addEntry('/', { changeFrequency: 'daily', priority: 1.0 });
  addEntry('/products', { changeFrequency: 'daily', priority: 0.95 });
  addEntry('/reels', { changeFrequency: 'daily', priority: 0.9 });
  addEntry('/map', { changeFrequency: 'weekly', priority: 0.9 });
  addEntry('/places', { changeFrequency: 'weekly', priority: 0.9 });
  addEntry('/food', { changeFrequency: 'weekly', priority: 0.85 });
  addEntry('/events', { changeFrequency: 'weekly', priority: 0.85 });
  addEntry('/people', { changeFrequency: 'weekly', priority: 0.85 });
  addEntry('/sellers', { changeFrequency: 'weekly', priority: 0.85 });
  addEntry('/categories', { changeFrequency: 'weekly', priority: 0.8 });
  addEntry('/crafts', { changeFrequency: 'weekly', priority: 0.8 });
  addEntry('/wholesale', { changeFrequency: 'weekly', priority: 0.8 });
  addEntry('/quiz', { changeFrequency: 'monthly', priority: 0.7 });
  addEntry('/film', { changeFrequency: 'monthly', priority: 0.7 });
  addEntry('/intro', { changeFrequency: 'monthly', priority: 0.7 });
  addEntry('/help', { changeFrequency: 'monthly', priority: 0.6 });
  addEntry('/privacy', { changeFrequency: 'yearly', priority: 0.4 });
  addEntry('/terms', { changeFrequency: 'yearly', priority: 0.4 });

  // 2. Dynamic Entities from MongoDB with memoryDb fallback
  let products: any[] = [];
  let categories: any[] = [];
  let sellers: any[] = [];
  let governorates: any[] = [];
  let places: any[] = [];
  let foods: any[] = [];
  let events: any[] = [];
  let people: any[] = [];
  let seasons: any[] = [];
  let culturalCrafts: any[] = [];
  let reels: any[] = [];

  try {
    const { db, isMongo } = await getDatabase();
    if (isMongo && db) {
      const publishedStatus = {
        status: { $nin: ['draft', 'pending_review', 'rejected', 'archived'] },
      };

      [
        products,
        categories,
        sellers,
        governorates,
        places,
        foods,
        events,
        people,
        seasons,
        culturalCrafts,
        reels,
      ] = await Promise.all([
        db
          .collection('products')
          .find({ approvalStatus: 'approved' }, { projection: { id: 1, updatedAt: 1, createdAt: 1 } })
          .toArray()
          .catch(() => []),
        db
          .collection('categories')
          .find({ active: { $ne: false } }, { projection: { id: 1, slug: 1, updatedAt: 1, createdAt: 1 } })
          .toArray()
          .catch(() => []),
        db
          .collection('sellers')
          .find({ status: 'approved' }, { projection: { id: 1, updatedAt: 1, createdAt: 1 } })
          .toArray()
          .catch(() => []),
        db
          .collection('wah_governorates')
          .find(publishedStatus, { projection: { id: 1, slug: 1, updatedAt: 1, createdAt: 1 } })
          .toArray()
          .catch(() => []),
        db
          .collection('wah_heritage_places')
          .find(publishedStatus, { projection: { id: 1, slug: 1, updatedAt: 1, createdAt: 1 } })
          .toArray()
          .catch(() => []),
        db
          .collection('wah_food')
          .find(publishedStatus, { projection: { id: 1, slug: 1, updatedAt: 1, createdAt: 1 } })
          .toArray()
          .catch(() => []),
        db
          .collection('wah_events')
          .find(publishedStatus, { projection: { id: 1, slug: 1, updatedAt: 1, createdAt: 1 } })
          .toArray()
          .catch(() => []),
        db
          .collection('wah_local_people')
          .find(publishedStatus, { projection: { id: 1, slug: 1, updatedAt: 1, createdAt: 1 } })
          .toArray()
          .catch(() => []),
        db
          .collection('wah_seasons')
          .find(publishedStatus, { projection: { id: 1, slug: 1, updatedAt: 1, createdAt: 1 } })
          .toArray()
          .catch(() => []),
        db
          .collection('wah_cultural_crafts')
          .find(publishedStatus, { projection: { id: 1, slug: 1, updatedAt: 1, createdAt: 1 } })
          .toArray()
          .catch(() => []),
        db
          .collection('reels')
          .find(
            {
              $and: [
                publishedStatus,
                { videoUrl: { $exists: true, $nin: ['', null] } },
                {
                  $or: [
                    { moderationStatus: 'approved' },
                    { moderationStatus: { $exists: false } },
                    { moderationStatus: null },
                  ],
                },
              ],
            },
            { projection: { id: 1, slug: 1, updatedAt: 1, createdAt: 1 } }
          )
          .toArray()
          .catch(() => []),
      ]);
    }
  } catch (err) {
    console.error('[SitemapService] Error querying MongoDB:', err);
  }

  // Graceful fallback to memoryDb if collections are empty or DB disconnected
  const isPublished = (item: any) =>
    !['draft', 'pending_review', 'rejected', 'archived'].includes(item?.status);

  if (products.length === 0 && Array.isArray(memoryDb.products)) {
    products = memoryDb.products.filter((p) => p.approvalStatus === 'approved');
  }
  if (categories.length === 0 && Array.isArray(memoryDb.categories)) {
    categories = memoryDb.categories.filter((c) => c.active !== false);
  }
  if (sellers.length === 0 && Array.isArray(memoryDb.sellers)) {
    sellers = memoryDb.sellers.filter((s) => s.status === 'approved' || !s.status);
  }
  if (governorates.length === 0 && Array.isArray(memoryDb.governorates)) {
    governorates = memoryDb.governorates.filter(isPublished);
  }
  if (places.length === 0 && Array.isArray(memoryDb.heritagePlaces)) {
    places = memoryDb.heritagePlaces.filter(isPublished);
  }
  if (foods.length === 0 && Array.isArray(memoryDb.upperEgyptFood)) {
    foods = memoryDb.upperEgyptFood.filter(isPublished);
  }
  if (events.length === 0 && Array.isArray(memoryDb.culturalEvents)) {
    events = memoryDb.culturalEvents.filter(isPublished);
  }
  if (people.length === 0 && Array.isArray(memoryDb.localPeople)) {
    people = memoryDb.localPeople.filter(isPublished);
  }
  if (seasons.length === 0 && Array.isArray(memoryDb.seasons)) {
    seasons = memoryDb.seasons.filter(isPublished);
  }
  if (culturalCrafts.length === 0 && Array.isArray(memoryDb.culturalCrafts)) {
    culturalCrafts = memoryDb.culturalCrafts.filter(isPublished);
  }
  if (reels.length === 0 && Array.isArray(memoryDb.reels)) {
    reels = memoryDb.reels.filter((r) => isPublished(r) && Boolean(r.videoUrl));
  }

  // Helper to add entity URLs with reliable lastmod
  const addEntityEntries = (
    items: any[],
    routePrefix: string,
    priority: number,
    changeFrequency: SitemapEntry['changeFrequency'],
    preferId: boolean = false
  ) => {
    for (const item of items) {
      const identifier = preferId ? item.id : item.slug || item.id;
      if (!identifier || typeof identifier !== 'string') continue;

      const trimmed = identifier.trim();
      if (!trimmed || trimmed.includes('[object') || trimmed === 'undefined' || trimmed === 'null') {
        continue;
      }

      const reliableDate = parseReliableDate(item.updatedAt) || parseReliableDate(item.createdAt);

      addEntry(`/${routePrefix}/${encodeURIComponent(trimmed)}`, {
        lastModified: reliableDate,
        changeFrequency,
        priority,
      });
    }
  };

  addEntityEntries(governorates, 'governorates', 0.85, 'monthly');
  addEntityEntries(places, 'places', 0.85, 'monthly');
  addEntityEntries(foods, 'food', 0.8, 'monthly');
  addEntityEntries(events, 'events', 0.75, 'monthly');
  addEntityEntries(seasons, 'events', 0.75, 'monthly');
  addEntityEntries(people, 'people', 0.75, 'monthly');
  addEntityEntries(culturalCrafts, 'crafts', 0.75, 'weekly');
  addEntityEntries(products, 'products', 0.85, 'weekly', true);
  addEntityEntries(categories, 'categories', 0.75, 'weekly');
  addEntityEntries(sellers, 'sellers', 0.75, 'weekly', true);
  addEntityEntries(reels, 'reels', 0.75, 'weekly', true);

  return entries;
}

/**
 * Generates XML string compliant with sitemaps.org protocol 0.9.
 */
export function generateSitemapXml(entries: SitemapEntry[]): string {
  const urlNodes = entries.map((entry) => {
    const lines = [
      '  <url>',
      `    <loc>${escapeXml(entry.url)}</loc>`,
    ];

    if (entry.lastModified) {
      const isoDate = entry.lastModified.toISOString().split('T')[0];
      lines.push(`    <lastmod>${isoDate}</lastmod>`);
    }

    if (entry.changeFrequency) {
      lines.push(`    <changefreq>${entry.changeFrequency}</changefreq>`);
    }

    if (typeof entry.priority === 'number') {
      lines.push(`    <priority>${entry.priority.toFixed(2)}</priority>`);
    }

    lines.push('  </url>');
    return lines.join('\n');
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes.join('\n')}
</urlset>`;
}
