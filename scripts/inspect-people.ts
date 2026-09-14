import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'Elsa3ed_market';
  if (!uri) {
    console.log('No MONGODB_URI found');
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const people = await db.collection('wah_local_people').find({}).toArray();
    console.log(`Total people in wah_local_people: ${people.length}`);
    for (let i = 0; i < people.length; i++) {
      const p = people[i];
      console.log(`[${i + 1}] ID: ${p.id} | Slug: ${p.slug} | Name: ${p.name} | Gov: ${p.governorateName} | Status: ${p.status}`);
      console.log(`    Craft/Role: ${p.craftTitle || p.titleOrRole || p.craftOrSkill}`);
      console.log(`    Photo: ${p.avatarUrl || p.photoUrl}`);
      console.log(`    Bio snippet: ${(p.bio || p.biography || '').substring(0, 70)}...`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}
main();
