import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';
import { AUTHENTIC_WAH_FOOD } from '../server/db/authenticWahFoodData.ts';

async function seedWahFood() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.MONGODB_DB || 'Elsa3ed_market';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log(`✓ Connected to MongoDB database: ${dbName}`);
    const db = client.db(dbName);
    const collection = db.collection('wah_food');

    // Remove any mock or unverified food items
    const clearResult = await collection.deleteMany({});
    console.log(`Cleared existing food items: ${clearResult.deletedCount}`);

    // Insert all authentic foods
    for (const food of AUTHENTIC_WAH_FOOD) {
      await collection.updateOne(
        { id: food.id },
        { $set: food },
        { upsert: true }
      );
      console.log(`✓ Upserted: [${food.governorateName}] ${food.title} (${food.slug})`);
    }

    // Ensure proper indexes
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ slug: 1 }, { unique: true });
    await collection.createIndex({ governorateName: 1 });
    await collection.createIndex({ governorateId: 1 });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ category: 1 });

    const totalCount = await collection.countDocuments();
    console.log(`\n🎉 Total authentic foods now in wah_food collection: ${totalCount}`);

    // Verify governorate coverage
    const govCoverage = await collection.aggregate([
      { $group: { _id: '$governorateName', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    console.log('\nGovernorate Food Coverage:');
    govCoverage.forEach(g => {
      console.log(` - ${g._id}: ${g.count} أكلات تراثية موثقة`);
    });

  } catch (err: any) {
    console.error('Seeding error:', err);
  } finally {
    await client.close();
  }
}

seedWahFood();
