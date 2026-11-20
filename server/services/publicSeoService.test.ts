import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { memoryDb } from '../db/mongodb.ts';
import {
  getListingSeoJsonLd,
  getPublicSeoBreadcrumbJsonLd,
  getPublicSeoJsonLd,
  getPublicSeoPage
} from './publicSeoService.ts';

process.env.MONGODB_URI = '';
process.env.MONGODB_CONNECTION_URL = '';
process.env.MONGO_URI = '';
process.env.DATABASE_URL = '';

afterEach(() => {
  memoryDb.heritagePlaces = [];
  memoryDb.upperEgyptFood = [];
  memoryDb.governorates = [];
  memoryDb.products = [];
  memoryDb.reels = [];
});

test('resolves public Arabic place metadata and structured data', async () => {
  memoryDb.heritagePlaces.push({
    id: 'place-seo-test',
    slug: 'dendera-test',
    title: 'معبد دندرة',
    description: 'معبد أثري في قنا',
    governorateName: 'قنا',
    status: 'approved',
    coverImage: '/dendera.jpg'
  } as any);

  const page = await getPublicSeoPage('places', 'dendera-test');

  assert.equal(page?.title, 'معبد دندرة');
  assert.equal(page?.description, 'معبد أثري في قنا');
  assert.equal(page?.path, '/places/dendera-test');
  assert.equal(
    getPublicSeoJsonLd(page!, 'https://waaaaah.vercel.app/places/dendera-test')['@type'],
    'TouristDestination'
  );

  const breadcrumbs = getPublicSeoBreadcrumbJsonLd(page!, 'https://waaaaah.vercel.app');
  assert.equal(breadcrumbs['@type'], 'BreadcrumbList');
  assert.equal(breadcrumbs.itemListElement.length, 3);
  assert.equal(breadcrumbs.itemListElement[2].name, 'معبد دندرة');
});

test('does not expose draft cultural content to SEO', async () => {
  memoryDb.upperEgyptFood.push({
    id: 'food-seo-test',
    slug: 'draft-dish',
    title: 'أكلة غير منشورة',
    description: 'مسودة',
    status: 'draft'
  } as any);

  assert.equal(await getPublicSeoPage('food', 'draft-dish'), null);
});

test('resolves governorate as AdministrativeArea and reel as VideoObject', async () => {
  memoryDb.governorates.push({
    id: 'gov-qena',
    slug: 'qena',
    name: 'قنا',
    shortIntro: 'محافظة الفخار ومعبد دندرة',
    status: 'approved',
    coverImage: 'https://example.com/qena.jpg'
  } as any);

  memoryDb.reels.push({
    id: 'reel-1',
    title: 'صناعة الفخار في جراجوس',
    description: 'فيديو حي من الورشة',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/sample.mp4',
    thumbnailUrl: 'https://res.cloudinary.com/demo/video/upload/sample.jpg',
    status: 'approved'
  } as any);

  const govPage = await getPublicSeoPage('governorates', 'qena');
  assert.equal(govPage?.type, 'governorate');
  assert.equal(
    getPublicSeoJsonLd(govPage!, 'https://waaaaah.vercel.app/governorates/qena')['@type'],
    'AdministrativeArea'
  );

  const reelPage = await getPublicSeoPage('reels', 'reel-1');
  assert.equal(reelPage?.type, 'reel');
  const reelSchema = getPublicSeoJsonLd(reelPage!, 'https://waaaaah.vercel.app/reels/reel-1') as any;
  assert.equal(reelSchema['@type'], 'VideoObject');
  assert.equal(reelSchema.contentUrl, 'https://res.cloudinary.com/demo/video/upload/sample.mp4');
});

test('product JSON-LD omits fabricated aggregateRating and includes FAQPage on /help', async () => {
  memoryDb.products.push({
    id: 'prod-1',
    title: 'إبريق فخار صعيدي',
    description: 'مصنوع يدوياً في قنا',
    price: 250,
    stockCount: 5,
    approvalStatus: 'approved',
    images: ['https://example.com/pot.jpg']
  } as any);

  const prodPage = await getPublicSeoPage('products', 'prod-1');
  const prodSchema = getPublicSeoJsonLd(prodPage!, 'https://waaaaah.vercel.app/products/prod-1') as any;
  assert.equal(prodSchema['@type'], 'Product');
  assert.equal(prodSchema.aggregateRating, undefined);

  const helpGraph = getListingSeoJsonLd(
    '/help',
    'المساعدة والتواصل',
    'تواصل مع فريق دعم منصة وه',
    'https://waaaaah.vercel.app'
  );
  const types = helpGraph['@graph'].map((n: any) => n['@type']);
  assert.ok(types.includes('CollectionPage'));
  assert.ok(types.includes('BreadcrumbList'));
  assert.ok(types.includes('FAQPage'));
});
