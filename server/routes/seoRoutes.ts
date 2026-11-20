import express from 'express';
import type { Request, Response } from 'express';
import { getDatabase, memoryDb } from '../db/mongodb.ts';

const router = express.Router();

/**
 * Escape XML special characters safely.
 */
function escapeXml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Normalize application base URL.
 */
function getBaseUrl(req: Request): string {
  const configuredUrl = process.env.APP_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }

  return `${req.protocol}://${req.get('host')}`.replace(/\/+$/, '');
}

/**
 * Convert date to YYYY-MM-DD.
 */
function getDate(value: unknown, fallback: string): string {
  if (!value) return fallback;

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toISOString().split('T')[0];
}

/**
 * GET /sitemap.xml
 *
 * Comprehensive dynamic sitemap for all live public WAH platform pages and entities.
 */
router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const baseUrl = getBaseUrl(req);
    const today = new Date().toISOString().split('T')[0];

    const { db, isMongo } = await getDatabase();

    let products: any[] = [];
    let categories: any[] = [];
    let sellers: any[] = [];
    let governorates: any[] = [];
    let places: any[] = [];
    let foods: any[] = [];
    let events: any[] = [];
    let people: any[] = [];
    let seasons: any[] = [];
    let reels: any[] = [];

    if (isMongo && db) {
      try {
        const publishedStatus = {
          status: { $nin: ['draft', 'pending_review', 'rejected', 'archived'] }
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
          reels
        ] = await Promise.all([
          db
            .collection('products')
            .find(
              { approvalStatus: 'approved' },
              { projection: { id: 1, updatedAt: 1, createdAt: 1 } }
            )
            .toArray(),
          db
            .collection('categories')
            .find(
              { active: { $ne: false } },
              { projection: { id: 1, slug: 1, updatedAt: 1 } }
            )
            .toArray(),
          db
            .collection('sellers')
            .find(
              { status: 'approved' },
              { projection: { id: 1, updatedAt: 1, createdAt: 1 } }
            )
            .toArray(),
          db
            .collection('wah_governorates')
            .find(publishedStatus, { projection: { id: 1, slug: 1, updatedAt: 1, createdAt: 1 } })
            .toArray(),
          db
            .collection('wah_heritage_places')
            .find(publishedStatus, { projection: { id: 1, slug: 1, updatedAt: 1, createdAt: 1 } })
            .toArray(),
          db
            .collection('wah_food')
            .find(publishedStatus, { projection: { id: 1, slug: 1, updatedAt: 1, createdAt: 1 } })
            .toArray(),
          db
            .collection('wah_events')
            .find(publishedStatus, { projection: { id: 1, slug: 1, updatedAt: 1, createdAt: 1 } })
            .toArray(),
          db
            .collection('wah_local_people')
            .find(publishedStatus, { projection: { id: 1, slug: 1, updatedAt: 1, createdAt: 1 } })
            .toArray(),
          db
            .collection('wah_seasons')
            .find(publishedStatus, { projection: { id: 1, slug: 1, updatedAt: 1, createdAt: 1 } })
            .toArray(),
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
                      { moderationStatus: null }
                    ]
                  }
                ]
              },
              { projection: { id: 1, slug: 1, updatedAt: 1, createdAt: 1 } }
            )
            .toArray()
        ]);
      } catch (error) {
        console.error('Error querying WAH sitemap data from MongoDB:', error);
      }
    }

    // Memory DB fallback when running without MongoDB
    if (products.length === 0) {
      products = memoryDb.products.filter((product) => product.approvalStatus === 'approved');
    }
    if (categories.length === 0) {
      categories = memoryDb.categories.filter((category) => category.active !== false);
    }
    if (sellers.length === 0) {
      sellers = memoryDb.sellers.filter((seller) => seller.status === 'approved' || !seller.status);
    }
    const isPublished = (item: any) =>
      !['draft', 'pending_review', 'rejected', 'archived'].includes(item.status);
    if (governorates.length === 0) governorates = memoryDb.governorates.filter(isPublished);
    if (places.length === 0) places = memoryDb.heritagePlaces.filter(isPublished);
    if (foods.length === 0) foods = memoryDb.upperEgyptFood.filter(isPublished);
    if (events.length === 0) events = memoryDb.culturalEvents.filter(isPublished);
    if (people.length === 0) people = memoryDb.localPeople.filter(isPublished);
    if (seasons.length === 0) seasons = memoryDb.seasons.filter(isPublished);
    if (reels.length === 0 && Array.isArray(memoryDb.reels)) {
      reels = memoryDb.reels.filter((r: any) => isPublished(r) && Boolean(r.videoUrl));
    }

    const seenLocs = new Set<string>();
    const urls: string[] = [];

    const addUrl = (
      path: string,
      options?: {
        lastmod?: string;
        changefreq?: string;
        priority?: string;
      }
    ) => {
      const normalizedPath = path === '/' ? '/' : path.replace(/\/+$/, '');
      const loc = `${baseUrl}${normalizedPath}`;
      if (seenLocs.has(loc)) return;
      seenLocs.add(loc);

      const lastmod = options?.lastmod || today;
      const changefreq = options?.changefreq || 'weekly';
      const priority = options?.priority || '0.5';

      urls.push(`
  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
    };

    // Main live public pages (only real, non-redirect, indexable routes)
    addUrl('/', { changefreq: 'daily', priority: '1.0' });
    addUrl('/products', { changefreq: 'daily', priority: '0.95' });
    addUrl('/reels', { changefreq: 'daily', priority: '0.9' });
    addUrl('/map', { changefreq: 'weekly', priority: '0.9' });
    addUrl('/places', { changefreq: 'weekly', priority: '0.9' });
    addUrl('/food', { changefreq: 'weekly', priority: '0.85' });
    addUrl('/events', { changefreq: 'weekly', priority: '0.85' });
    addUrl('/people', { changefreq: 'weekly', priority: '0.85' });
    addUrl('/sellers', { changefreq: 'weekly', priority: '0.85' });
    addUrl('/categories', { changefreq: 'weekly', priority: '0.8' });
    addUrl('/wholesale', { changefreq: 'weekly', priority: '0.8' });
    addUrl('/quiz', { changefreq: 'monthly', priority: '0.7' });
    addUrl('/film', { changefreq: 'monthly', priority: '0.7' });
    addUrl('/help', { changefreq: 'monthly', priority: '0.6' });
    addUrl('/privacy', { changefreq: 'yearly', priority: '0.4' });
    addUrl('/terms', { changefreq: 'yearly', priority: '0.4' });

    // Dynamic entity URLs
    const addEntityUrls = (
      items: any[],
      route: string,
      priority: string,
      changefreq: string = 'weekly',
      useIdOnly: boolean = false
    ) => {
      for (const item of items) {
        const identifier = useIdOnly ? item.id : item.slug || item.id;
        if (!identifier) continue;
        addUrl(`/${route}/${encodeURIComponent(String(identifier))}`, {
          lastmod: getDate(item.updatedAt || item.createdAt, today),
          changefreq,
          priority
        });
      }
    };

    addEntityUrls(categories, 'categories', '0.75', 'weekly');
    addEntityUrls(products, 'products', '0.85', 'weekly', true);
    addEntityUrls(sellers, 'sellers', '0.75', 'weekly', true);
    addEntityUrls(governorates, 'governorates', '0.85', 'monthly');
    addEntityUrls(places, 'places', '0.85', 'monthly');
    addEntityUrls(foods, 'food', '0.8', 'monthly');
    addEntityUrls(events, 'events', '0.75', 'monthly');
    addEntityUrls(seasons, 'events', '0.75', 'monthly');
    addEntityUrls(people, 'people', '0.75', 'monthly');
    addEntityUrls(reels, 'reels', '0.75', 'weekly');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>`;

    res.status(200);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.send(xml);
  } catch (error) {
    console.error('Error generating WAH sitemap:', error);
    res.status(500).type('text/plain').send('Error generating sitemap');
  }
});

/**
 * GET /robots.txt
 *
 * Search engine crawling policy for WAH platform.
 */
router.get('/robots.txt', (req: Request, res: Response) => {
  const baseUrl = getBaseUrl(req);

  const robots = `# robots.txt for WAH (وه)
# منصة وه - العالم الرقمي لصعيد مصر وسوق الحرف التراثية

User-agent: *

# Public indexable pages
Allow: /
Allow: /products
Allow: /categories
Allow: /sellers
Allow: /reels
Allow: /map
Allow: /governorates
Allow: /places
Allow: /food
Allow: /events
Allow: /people
Allow: /wholesale
Allow: /quiz
Allow: /film
Allow: /help
Allow: /privacy
Allow: /terms

# Private, dashboard, and transactional areas
Disallow: /admin
Disallow: /seller-
Disallow: /seller/
Disallow: /account
Disallow: /profile
Disallow: /buyer-account
Disallow: /cart
Disallow: /checkout
Disallow: /orders
Disallow: /favorites
Disallow: /notifications
Disallow: /messages
Disallow: /search
Disallow: /global-search

# API endpoints
Disallow: /api/

# Authentication & password recovery
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;

  res.status(200);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.send(robots);
});

export default router;