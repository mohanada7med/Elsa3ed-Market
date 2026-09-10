import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';
import { runHeritagePlacesMigration } from '../server/utils/heritagePlacesMigration.ts';

async function main() {
  const uri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DB?.trim() || 'Elsa3ed_market';

  console.log('🏛️ Running Heritage Places Enrichment & Visit Status Verification...');

  if (!uri) {
    console.log('⚠️ No MONGODB_URI found in environment. Migration will run on server startup or in-memory.');
    return;
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB:', dbName);
    const db = client.db(dbName);

    const result = await runHeritagePlacesMigration(db);
    console.log('📊 Migration result:', result);

    // Verify places with restricted or special accessibility
    const restrictedPlaces = await db
      .collection('wah_heritage_places')
      .find({
        'visitInfo.visitStatus': { $exists: true, $ne: 'open' }
      })
      .project({ id: 1, title: 1, 'visitInfo.visitStatus': 1, 'visitInfo.visitStatusLabel': 1, 'visitInfo.visitStatusNote': 1 })
      .toArray();

    console.log('\n🔍 Verified places with special/restricted visit status:');
    restrictedPlaces.forEach((p) => {
      console.log(`- [${p.id}] ${p.title}: status=${(p.visitInfo as any)?.visitStatus} | label=${(p.visitInfo as any)?.visitStatusLabel}`);
      console.log(`  note: ${(p.visitInfo as any)?.visitStatusNote}\n`);
    });

    const totalPlaces = await db.collection('wah_heritage_places').countDocuments();
    const totalGovs = await db.collection('wah_governorates').countDocuments();
    const govsList = await db.collection('wah_governorates').find({}).project({ name: 1 }).toArray();
    const placesWithRating = await db.collection('wah_heritage_places').countDocuments({ rating: { $exists: true } });

    console.log(`\n========================================`);
    console.log(`📈 FINAL AUDIT SUMMARY:`);
    console.log(`🏛️ Total Heritage Places in MongoDB: ${totalPlaces}`);
    console.log(`🗺️ Total Governorates in MongoDB: ${totalGovs} (${govsList.map(g => g.name).join(', ')})`);
    console.log(`⭐ Places with unverified/fabricated ratings: ${placesWithRating} (Must be 0)`);
    console.log(`========================================\n`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.close();
  }
}

main();
