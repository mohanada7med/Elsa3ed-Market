import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { memoryDb } from '../db/mongodb.ts';
import { getPublicSeoJsonLd, getPublicSeoPage } from './publicSeoService.ts';

process.env.MONGODB_URI = '';
process.env.MONGODB_CONNECTION_URL = '';
process.env.MONGO_URI = '';
process.env.DATABASE_URL = '';

afterEach(() => {
  memoryDb.heritagePlaces = [];
  memoryDb.upperEgyptFood = [];
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
    getPublicSeoJsonLd(page!, 'https://wah-saeed.com/places/dendera-test')['@type'],
    'TouristDestination'
  );
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
