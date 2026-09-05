import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';
import {
  INITIAL_GOVERNORATES,
  INITIAL_CITIES,
  INITIAL_VILLAGES,
  INITIAL_HERITAGE_PLACES,
  INITIAL_CULTURAL_CRAFTS,
  INITIAL_TRADITIONS,
  INITIAL_WAH_STORIES,
  INITIAL_LOCAL_PEOPLE,
  INITIAL_UPPER_EGYPT_FOOD,
  INITIAL_CULTURAL_EVENTS,
  INITIAL_SEASONS,
  INITIAL_PLATFORM_SETTINGS
} from '../server/db/wahSeedData.ts';

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in environment');
    process.exit(1);
  }

  console.log('🚀 Connecting to MongoDB...');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('Elsa3ed_market');
  console.log('✅ Connected to MongoDB database: Elsa3ed_market');

  const syncTasks = [
    { name: 'wah_governorates', data: INITIAL_GOVERNORATES },
    { name: 'wah_cities', data: INITIAL_CITIES },
    { name: 'wah_villages', data: INITIAL_VILLAGES },
    { name: 'wah_heritage_places', data: INITIAL_HERITAGE_PLACES },
    { name: 'wah_cultural_crafts', data: INITIAL_CULTURAL_CRAFTS },
    { name: 'wah_traditions', data: INITIAL_TRADITIONS },
    { name: 'wah_stories', data: INITIAL_WAH_STORIES },
    { name: 'wah_local_people', data: INITIAL_LOCAL_PEOPLE },
    { name: 'wah_food', data: INITIAL_UPPER_EGYPT_FOOD },
    { name: 'wah_events', data: INITIAL_CULTURAL_EVENTS },
    { name: 'wah_seasons', data: INITIAL_SEASONS },
  ];

  console.log('\n📦 Synchronizing verified Upper Egypt real data into MongoDB...');
  for (const task of syncTasks) {
    let upserted = 0;
    let modified = 0;
    for (const item of task.data) {
      const res = await db.collection(task.name).updateOne(
        { id: item.id },
        { $set: item },
        { upsert: true }
      );
      if (res.upsertedCount > 0) upserted++;
      else if (res.modifiedCount > 0) modified++;
    }
    const totalCount = await db.collection(task.name).countDocuments();
    console.log(`  ✓ ${task.name}: ${task.data.length} records processed (New: ${upserted}, Updated: ${modified}, Total in DB: ${totalCount})`);
  }

  // Settings
  await db.collection('platform_settings').updateOne(
    { id: INITIAL_PLATFORM_SETTINGS.id },
    { $set: INITIAL_PLATFORM_SETTINGS },
    { upsert: true }
  );
  console.log('  ✓ platform_settings synchronized');

  console.log('\n📊 Final MongoDB Verification Summary:');
  const collections = [
    'wah_governorates',
    'wah_cities',
    'wah_villages',
    'wah_heritage_places',
    'wah_cultural_crafts',
    'wah_traditions',
    'wah_stories',
    'wah_local_people',
    'wah_food',
    'wah_events',
    'wah_seasons',
    'platform_settings'
  ];

  for (const c of collections) {
    const count = await db.collection(c).countDocuments();
    console.log(`    - ${c.padEnd(24)}: ${count} verified documents`);
  }

  await client.close();
  console.log('\n✨ All real Upper Egypt cultural data has been successfully synchronized to MongoDB!');
}

main().catch((err) => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
