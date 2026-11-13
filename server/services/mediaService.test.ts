import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { memoryDb } from '../db/mongodb.ts';
import { deleteAdminMedia } from './mediaService.ts';

process.env.MONGODB_URI = '';
process.env.MONGODB_CONNECTION_URL = '';
process.env.MONGO_URI = '';
process.env.DATABASE_URL = '';

afterEach(() => {
  memoryDb.heritagePlaces = [];
  memoryDb.culturalEvents = [];
  memoryDb.seasons = [];
  memoryDb.media = [];
});

test('deleting event media removes gallery and cover references without place records', async () => {
  const removedUrl = 'https://example.com/removed-event.jpg';
  const remainingUrl = 'https://example.com/remaining-event.jpg';

  memoryDb.heritagePlaces = [];
  memoryDb.culturalEvents = [{
    id: 'event-media-test',
    title: 'فعالية اختبار',
    slug: 'event-media-test',
    category: 'festival',
    governorateName: 'قنا',
    governorateId: 'qena',
    locationName: 'قنا',
    eventDate: '2025-01-01',
    description: 'اختبار حذف صورة',
    coverImage: removedUrl,
    gallery: [removedUrl, remainingUrl],
    status: 'approved',
    createdAt: '',
    updatedAt: ''
  }];
  memoryDb.seasons = [{
    id: 'season-media-test',
    title: 'موسم اختبار',
    slug: 'season-media-test',
    governorateName: 'قنا',
    governorateId: 'qena',
    category: 'cultural',
    description: 'اختبار حذف صورة',
    startPeriod: 'يناير',
    endPeriod: 'فبراير',
    coverImage: removedUrl,
    gallery: [removedUrl, remainingUrl],
    verificationStatus: 'approved',
    status: 'approved',
    createdAt: '',
    updatedAt: ''
  }];

  await deleteAdminMedia(removedUrl, { id: 'admin-test', role: 'admin' });

  assert.equal(memoryDb.culturalEvents[0].coverImage, remainingUrl);
  assert.deepEqual(memoryDb.culturalEvents[0].gallery, [remainingUrl]);
  assert.equal(memoryDb.seasons[0].coverImage, remainingUrl);
  assert.deepEqual(memoryDb.seasons[0].gallery, [remainingUrl]);

  await deleteAdminMedia(remainingUrl, { id: 'admin-test', role: 'admin' });

  assert.equal(memoryDb.culturalEvents[0].coverImage, '');
  assert.deepEqual(memoryDb.culturalEvents[0].gallery, []);
  assert.equal(memoryDb.seasons[0].coverImage, '');
  assert.deepEqual(memoryDb.seasons[0].gallery, []);
});
