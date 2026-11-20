import type { MetadataRoute } from 'next';

const baseUrl = (process.env.APP_URL || 'https://waaaaah.vercel.app').replace(/\/+$/, '');

export const dynamic = 'force-dynamic';
export const revalidate = 86400;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/products',
          '/categories',
          '/sellers',
          '/reels',
          '/map',
          '/governorates',
          '/places',
          '/food',
          '/events',
          '/people',
          '/crafts',
          '/wholesale',
          '/quiz',
          '/film',
          '/intro',
          '/help',
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/admin',
          '/admin/',
          '/seller-',
          '/seller/',
          '/account',
          '/profile',
          '/buyer-account',
          '/cart',
          '/checkout',
          '/orders',
          '/favorites',
          '/notifications',
          '/messages',
          '/search',
          '/global-search',
          '/api/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
