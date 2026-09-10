import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';

async function checkDb() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'Elsa3ed_market';
  console.log('MongoDB URI exists:', !!uri);
  if (!uri) return;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log(`Collections in ${dbName}:`);
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  - ${col.name}: ${count}`);
    }
  } catch (err: any) {
    console.error('Error connecting to DB:', err?.message || err);
  } finally {
    await client.close();
  }
}
checkDb();
