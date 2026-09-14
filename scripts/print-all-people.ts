import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'Elsa3ed_market';
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db(dbName);
  const people = await db.collection('wah_local_people').find({}).toArray();
  for (let i = 0; i < people.length; i++) {
    const p = people[i];
    console.log(`${i + 1}. [${p.id}] ${p.name} (${p.governorateName}) - ${p.craftTitle || p.titleOrRole}`);
  }
  await client.close();
}
main();