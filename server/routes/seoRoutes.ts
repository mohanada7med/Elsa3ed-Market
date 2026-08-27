import { Router, Request, Response } from 'express';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { ProductDocument } from '../models/types.ts';

const router = Router();

// GET /sitemap.xml - Dynamic XML Sitemap
router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const { db, isMongo } = await getDatabase();

    let products: any[] = [];
    let categories: any[] = [];
    let sellers: any[] = [];

    if (isMongo && db) {
      try {
        products = await db
          .collection('products')
          .find({ approvalStatus: 'approved' }, { projection: { id: 1, updatedAt: 1, createdAt: 1 } })
          .toArray();

        categories = await db
          .collection('categories')
          .find({ active: true }, { projection: { id: 1, slug: 1 } })
          .toArray();

        sellers = await db
          .collection('sellers')
          .find({ status: 'approved' }, { projection: { id: 1 } })
          .toArray();
      } catch (e) {
        console.error('Error querying sitemap data from MongoDB:', e);
      }
    }

    if (products.length === 0) {
      products = memoryDb.products.filter((p) => p.approvalStatus === 'approved');
    }
    if (categories.length === 0) {
      categories = memoryDb.categories.filter((c) => c.active !== false);
    }
    if (sellers.length === 0) {
      sellers = memoryDb.sellers.filter((s) => s.status === 'approved' || !s.status);
    }

    const now = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static public pages
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${baseUrl}/products</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${baseUrl}/categories</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${baseUrl}/sellers</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;

    // Public Categories
    for (const cat of categories) {
      const slug = cat.slug || cat.id;
      xml += `  <url>\n    <loc>${baseUrl}/categories/${encodeURIComponent(slug)}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    // Public Approved Products
    for (const prod of products) {
      const lastmod = (prod.updatedAt || prod.createdAt || now).split('T')[0];
      xml += `  <url>\n    <loc>${baseUrl}/products/${encodeURIComponent(prod.id)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    // Public Sellers
    for (const seller of sellers) {
      xml += `  <url>\n    <loc>${baseUrl}/sellers/${encodeURIComponent(seller.id)}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// GET /robots.txt - Dynamic robots.txt
router.get('/robots.txt', (req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

  const robots = `# robots.txt for Elsa3ed Market (سوق الصعيد)
User-agent: *
Allow: /
Allow: /products
Allow: /categories
Allow: /sellers
Allow: /about

# Disallow private user and administrative paths
Disallow: /admin
Disallow: /seller
Disallow: /account
Disallow: /cart
Disallow: /checkout
Disallow: /orders
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain');
  res.send(robots);
});

export default router;
