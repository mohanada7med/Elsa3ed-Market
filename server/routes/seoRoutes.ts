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
 * Dynamic sitemap for WAH platform.
 *
 * Public pages:
 * - Home
 * - Products
 * - Categories
 * - Sellers
 * - Heritage
 * - Food
 * - Places
 * - Crafts
 * - Stories
 */
router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const baseUrl = getBaseUrl(req);
    const today = new Date().toISOString().split('T')[0];

    const { db, isMongo } = await getDatabase();

    let products: any[] = [];
    let categories: any[] = [];
    let sellers: any[] = [];

    /**
     * MongoDB
     */
    if (isMongo && db) {
      try {
        products = await db
          .collection('products')
          .find(
            {
              approvalStatus: 'approved',
            },
            {
              projection: {
                id: 1,
                updatedAt: 1,
                createdAt: 1,
              },
            }
          )
          .toArray();

        categories = await db
          .collection('categories')
          .find(
            {
              active: true,
            },
            {
              projection: {
                id: 1,
                slug: 1,
                updatedAt: 1,
              },
            }
          )
          .toArray();

        sellers = await db
          .collection('sellers')
          .find(
            {
              status: 'approved',
            },
            {
              projection: {
                id: 1,
                updatedAt: 1,
                createdAt: 1,
              },
            }
          )
          .toArray();
      } catch (error) {
        console.error(
          'Error querying WAH sitemap data from MongoDB:',
          error
        );
      }
    }

    /**
     * Memory DB fallback
     */
    if (products.length === 0) {
      products = memoryDb.products.filter(
        (product) => product.approvalStatus === 'approved'
      );
    }

    if (categories.length === 0) {
      categories = memoryDb.categories.filter(
        (category) => category.active !== false
      );
    }

    if (sellers.length === 0) {
      sellers = memoryDb.sellers.filter(
        (seller) =>
          seller.status === 'approved' || !seller.status
      );
    }

    /**
     * XML
     */
    const urls: string[] = [];

    /**
     * Helper for adding URLs.
     */
    const addUrl = (
      path: string,
      options?: {
        lastmod?: string;
        changefreq?: string;
        priority?: string;
      }
    ) => {
      const lastmod = options?.lastmod || today;
      const changefreq = options?.changefreq || 'weekly';
      const priority = options?.priority || '0.5';

      urls.push(`
  <url>
    <loc>${escapeXml(`${baseUrl}${path}`)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
    };

    /**
     * ============================================================
     * WAH - Main Public Pages
     * ============================================================
     */

    addUrl('/', {
      changefreq: 'daily',
      priority: '1.0',
    });

    addUrl('/products', {
      changefreq: 'daily',
      priority: '0.9',
    });

    addUrl('/categories', {
      changefreq: 'weekly',
      priority: '0.8',
    });

    addUrl('/sellers', {
      changefreq: 'weekly',
      priority: '0.7',
    });

    /**
     * ============================================================
     * WAH - Heritage / Cultural Pages
     * ============================================================
     *
     * Add these only if these routes actually exist
     * in your frontend.
     */

    addUrl('/heritage', {
      changefreq: 'weekly',
      priority: '0.9',
    });

    addUrl('/places', {
      changefreq: 'weekly',
      priority: '0.8',
    });

    addUrl('/food', {
      changefreq: 'weekly',
      priority: '0.8',
    });

    addUrl('/crafts', {
      changefreq: 'weekly',
      priority: '0.8',
    });

    addUrl('/stories', {
      changefreq: 'weekly',
      priority: '0.7',
    });

    addUrl('/about', {
      changefreq: 'monthly',
      priority: '0.6',
    });

    /**
     * ============================================================
     * Public Categories
     * ============================================================
     */

    for (const category of categories) {
      const slug = category.slug || category.id;

      if (!slug) continue;

      const lastmod = getDate(
        category.updatedAt,
        today
      );

      addUrl(
        `/categories/${encodeURIComponent(String(slug))}`,
        {
          lastmod,
          changefreq: 'weekly',
          priority: '0.7',
        }
      );
    }

    /**
     * ============================================================
     * Approved Products
     * ============================================================
     */

    for (const product of products) {
      const productId = product.id;

      if (!productId) continue;

      const lastmod = getDate(
        product.updatedAt || product.createdAt,
        today
      );

      addUrl(
        `/products/${encodeURIComponent(String(productId))}`,
        {
          lastmod,
          changefreq: 'weekly',
          priority: '0.8',
        }
      );
    }

    /**
     * ============================================================
     * Approved Sellers
     * ============================================================
     */

    for (const seller of sellers) {
      const sellerId = seller.id;

      if (!sellerId) continue;

      const lastmod = getDate(
        seller.updatedAt || seller.createdAt,
        today
      );

      addUrl(
        `/sellers/${encodeURIComponent(String(sellerId))}`,
        {
          lastmod,
          changefreq: 'weekly',
          priority: '0.6',
        }
      );
    }

    /**
     * Build sitemap XML.
     */
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join(
      ''
    )}
</urlset>`;

    res.status(200);

    res.setHeader(
      'Content-Type',
      'application/xml; charset=utf-8'
    );

    res.setHeader(
      'Cache-Control',
      'public, max-age=3600, s-maxage=3600'
    );

    res.send(xml);
  } catch (error) {
    console.error(
      'Error generating WAH sitemap:',
      error
    );

    res
      .status(500)
      .type('text/plain')
      .send('Error generating sitemap');
  }
});

/**
 * GET /robots.txt
 *
 * Robots configuration for WAH.
 */
router.get('/robots.txt', (req: Request, res: Response) => {
  const baseUrl = getBaseUrl(req);

  const robots = `# robots.txt for WAH (وَه)
# منصة وَه - منصة التراث والثقافة وسوق منتجات الصعيد

User-agent: *

# Public pages
Allow: /
Allow: /products
Allow: /categories
Allow: /sellers
Allow: /heritage
Allow: /places
Allow: /food
Allow: /crafts
Allow: /stories
Allow: /about

# Private / administrative areas
Disallow: /admin
Disallow: /seller
Disallow: /account
Disallow: /cart
Disallow: /checkout
Disallow: /orders

# API should not be indexed
Disallow: /api/

# Authentication pages
Disallow: /login
Disallow: /register
Disallow: /forgot-password

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;

  res.status(200);

  res.setHeader(
    'Content-Type',
    'text/plain; charset=utf-8'
  );

  res.setHeader(
    'Cache-Control',
    'public, max-age=3600, s-maxage=3600'
  );

  res.send(robots);
});

export default router;