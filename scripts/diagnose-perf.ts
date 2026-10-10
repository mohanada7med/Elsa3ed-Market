import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';

async function run() {
  const uri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DB?.trim() || 'Elsa3ed_market';
  console.log('[Diag] Starting diagnosis...');
  console.log('[Diag] URI configured:', !!uri);
  console.log('[Diag] DB Name:', dbName);

  if (!uri) {
    console.log('[Diag] No URI configured.');
    return;
  }

  const tStart = Date.now();
  console.log('[Diag] Connecting MongoClient...');
  const client = new MongoClient(uri, {
    connectTimeoutMS: 15000,
    serverSelectionTimeoutMS: 15000,
  });

  try {
    await client.connect();
    console.log(`[Diag] Connected in ${Date.now() - tStart}ms`);

    const db = client.db(dbName);

    const tPing = Date.now();
    await db.command({ ping: 1 });
    console.log(`[Diag] Ping command in ${Date.now() - tPing}ms`);

    // Measure collections
    const tColls = Date.now();
    const collections = await db.listCollections().toArray();
    console.log(`[Diag] Listed ${collections.length} collections in ${Date.now() - tColls}ms`);

    // Test queries matching the 5 endpoints
    // 1. users findOne
    const tUser = Date.now();
    const user = await db.collection('users').findOne({});
    console.log(`[Diag] users.findOne in ${Date.now() - tUser}ms (found: ${!!user})`);

    // 2. categories find
    const tCats = Date.now();
    const cats = await db.collection('categories').find({ active: { $ne: false } }).toArray();
    console.log(`[Diag] categories.find in ${Date.now() - tCats}ms (count: ${cats.length})`);

    // 3. products find
    const tProds = Date.now();
    const prods = await db.collection('products').find({ approvalStatus: 'approved' }).limit(50).toArray();
    console.log(`[Diag] products.find in ${Date.now() - tProds}ms (count: ${prods.length})`);

    // 4. sellers find
    const tSellers = Date.now();
    const sellers = await db.collection('sellers').find({ status: { $ne: 'suspended' } }).toArray();
    console.log(`[Diag] sellers.find in ${Date.now() - tSellers}ms (count: ${sellers.length})`);

    // 5. wah/stats counts
    const tStats = Date.now();
    const [c1, c2, c3, c4, c5] = await Promise.all([
      db.collection('wah_governorates').countDocuments(),
      db.collection('wah_heritage_places').countDocuments(),
      db.collection('products').countDocuments(),
      db.collection('sellers').countDocuments(),
      db.collection('orders').countDocuments()
    ]);
    console.log(`[Diag] 5 collection counts in ${Date.now() - tStats}ms`);

    // Test heritagePlacesMigration queries
    const tMigration = Date.now();
    const [
      dbGovernorates,
      dbPlaces,
      dbCrafts,
      dbPeople,
      dbFood,
      dbEvents,
      dbSeasons,
      dbCities,
      dbVillages,
      dbTraditions,
      dbStories
    ] = await Promise.all([
      db.collection('wah_governorates').find({}).toArray(),
      db.collection('wah_heritage_places').find({}).toArray(),
      db.collection('wah_cultural_crafts').find({}).toArray(),
      db.collection('wah_local_people').find({}).toArray(),
      db.collection('wah_food').find({}).toArray(),
      db.collection('wah_events').find({}).toArray(),
      db.collection('wah_seasons').find({}).toArray(),
      db.collection('wah_cities').find({}).toArray(),
      db.collection('wah_villages').find({}).toArray(),
      db.collection('wah_traditions').find({}).toArray(),
      db.collection('wah_stories').find({}).toArray()
    ]);
    console.log(`[Diag] Heritage 11 collections find in ${Date.now() - tMigration}ms (places: ${dbPlaces.length})`);

  } catch (err: any) {
    console.error('[Diag] Error:', err.message);
  } finally {
    await client.close();
    console.log(`[Diag] Total time: ${Date.now() - tStart}ms`);
  }
}

run();
