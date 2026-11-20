import express from 'express';
import type { Request, Response } from 'express';
import { getSitemapEntries, generateSitemapXml } from '../services/sitemapService.ts';

const router = express.Router();

/**
 * Normalize application base URL.
 */
function getBaseUrl(req: Request): string {
  const configuredUrl = (process.env.APP_URL || 'https://waaaaah.vercel.app').trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }
  return `${req.protocol}://${req.get('host')}`.replace(/\/+$/, '');
}

/**
 * GET /sitemap.xml
 *
 * Comprehensive dynamic sitemap for all live public WAH platform pages and entities.
 */
router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const baseUrl = getBaseUrl(req);
    const entries = await getSitemapEntries(baseUrl);
    const xml = generateSitemapXml(entries);

    res.status(200);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.send(xml);
  } catch (error) {
    console.error('[SeoRoutes] Error generating WAH sitemap:', error);
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
Allow: /crafts
Allow: /wholesale
Allow: /quiz
Allow: /film
Allow: /intro
Allow: /help
Allow: /privacy
Allow: /terms

# Private, dashboard, and transactional areas
Disallow: /admin
Disallow: /admin/
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
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.send(robots);
});

export default router;
