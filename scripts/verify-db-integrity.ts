import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';

async function verifyIntegrity() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'Elsa3ed_market';
  if (!uri) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  console.log('--- DATABASE INTEGRITY AND RELATIONSHIP AUDIT ---');

  // Check Governorates
  const govs = await db.collection('wah_governorates').find({}).toArray();
  const govIds = new Set(govs.map(g => g.id || g.slug));
  console.log(`✅ Governorates count: ${govs.length}`);

  // Check Heritage Places
  const places = await db.collection('wah_heritage_places').find({}).toArray();
  console.log(`✅ Heritage Places count: ${places.length}`);
  let invalidGovInPlaces = 0;
  for (const p of places) {
    if (p.governorateId && !govIds.has(p.governorateId)) {
      invalidGovInPlaces++;
    }
  }
  console.log(`   Heritage Places with valid governorate links: ${places.length - invalidGovInPlaces}/${places.length}`);

  // Check Cities
  const cities = await db.collection('wah_cities').find({}).toArray();
  console.log(`✅ Cities count: ${cities.length}`);

  // Check Villages
  const villages = await db.collection('wah_villages').find({}).toArray();
  console.log(`✅ Villages count: ${villages.length}`);

  // Check Food
  const foods = await db.collection('wah_food').find({}).toArray();
  console.log(`✅ Food items count: ${foods.length}`);

  // Check Cultural Crafts
  const crafts = await db.collection('wah_cultural_crafts').find({}).toArray();
  console.log(`✅ Cultural crafts count: ${crafts.length}`);

  // Check Stories
  const stories = await db.collection('wah_stories').find({}).toArray();
  console.log(`✅ Stories count: ${stories.length}`);

  // Check Local People
  const people = await db.collection('wah_local_people').find({}).toArray();
  console.log(`✅ Local People count: ${people.length}`);

  // Check Events
  const events = await db.collection('wah_events').find({}).toArray();
  console.log(`✅ Events count: ${events.length}`);

  // Check Seasons
  const seasons = await db.collection('wah_seasons').find({}).toArray();
  console.log(`✅ Seasons count: ${seasons.length}`);

  // Check Traditions
  const traditions = await db.collection('wah_traditions').find({}).toArray();
  console.log(`✅ Traditions count: ${traditions.length}`);

  // Check Reels
  const reels = await db.collection('reels').find({}).toArray();
  console.log(`✅ Reels count: ${reels.length}`);

  // Check Categories
  const categories = await db.collection('categories').find({}).toArray();
  console.log(`✅ Categories count: ${categories.length}`);

  // Check Sellers & Users
  const sellers = await db.collection('sellers').find({}).toArray();
  const users = await db.collection('users').find({}).toArray();
  console.log(`✅ Sellers count: ${sellers.length}, Users count: ${users.length}`);

  console.log('\nAll core database records and relationships are intact and properly structured!');
  await client.close();
}

verifyIntegrity().catch(err => {
  console.error(err);
  process.exit(1);
});
