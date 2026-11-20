import type { MetadataRoute } from 'next';
import { getSitemapEntries } from '../server/services/sitemapService';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.APP_URL || 'https://waaaaah.vercel.app').replace(/\/+$/, '');
  const entries = await getSitemapEntries(baseUrl);
  return entries;
}
