import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

async function backupDatabase() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'Elsa3ed_market';
  if (!uri) {
    console.error('No MONGODB_URI found.');
    return;
  }

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

    const backupData: Record<string, any[]> = {};
    for (const colName of collections) {
      const docs = await db.collection(colName).find({}).toArray();
      backupData[colName] = docs;
      console.log(`Backed up [${colName}]: ${docs.length} documents.`);
    }

    const backupPath = path.resolve('scripts', 'wah-content-backup-original.json');
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
    console.log(`\nSuccessfully created full backup at: ${backupPath}`);
  } catch (err) {
    console.error('Backup failed:', err);
  } finally {
    await client.close();
  }
}

backupDatabase();
