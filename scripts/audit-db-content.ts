import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';

async function auditContent() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'Elsa3ed_market';
  if (!uri) return;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collections = [
      'wah_governorates',
      'wah_heritage_places',
      'wah_cities',
      'wah_villages',
      'wah_cultural_crafts',
      'wah_stories',
      'wah_food',
      'wah_local_people',
      'wah_events',
      'wah_seasons',
      'wah_traditions',
      'craft_stories',
      'reels',
      'categories',
      'platform_settings'
    ];

    console.log('=== DATABASE CONTENT AUDIT ===');
    for (const colName of collections) {
      const docs = await db.collection(colName).find({}).toArray();
      console.log(`\n-----------------------------------------`);
      console.log(`COLLECTION: [${colName}] - Count: ${docs.length}`);
      console.log(`-----------------------------------------`);
      docs.forEach((doc, idx) => {
        const id = doc.id || doc._id;
        const title = doc.name || doc.title || doc.siteName || doc.code;
        console.log(`[${idx + 1}] ID: ${id} | Title/Name: ${title}`);
        if (doc.shortIntro) console.log(`   shortIntro: ${doc.shortIntro.substring(0, 100)}...`);
        if (doc.description) console.log(`   description: ${doc.description.substring(0, 100)}...`);
        if (doc.excerpt) console.log(`   excerpt: ${doc.excerpt.substring(0, 100)}...`);
        if (doc.biography) console.log(`   biography: ${doc.biography.substring(0, 100)}...`);
        if (doc.history && typeof doc.history === 'string') console.log(`   history: ${doc.history.substring(0, 100)}...`);
      });
    }
  } catch (err: any) {
    console.error('Audit error:', err);
  } finally {
    await client.close();
  }
}

auditContent();
