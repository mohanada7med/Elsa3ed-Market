import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';
import { BATCH_1 } from './migrate-batch1.js';
import { BATCH_2 } from './migrate-batch2.js';
import { BATCH_3 } from './migrate-batch3.js';
import { BATCH_4 } from './migrate-batch4.js';

async function main() {
  const allUpdates = [...BATCH_1, ...BATCH_2, ...BATCH_3, ...BATCH_4];
  console.log(`Prepared updates for ${allUpdates.length} places.`);

  // Check unique IDs
  const idSet = new Set(allUpdates.map(u => u.id));
  if (idSet.size !== allUpdates.length) {
    throw new Error(`Duplicate IDs detected! Unique: ${idSet.size}, Total: ${allUpdates.length}`);
  }

  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error('MONGODB_URI is not set');
  const dbName = process.env.MONGODB_DB?.trim() || 'Elsa3ed_market';

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection('wah_heritage_places');

  let updatedCount = 0;
  for (const item of allUpdates) {
    const existing = await col.findOne({ $or: [{ id: item.id }, { slug: item.slug }] });
    if (!existing) {
      console.warn(`Place not found in DB: ${item.id} (${item.slug})`);
      continue;
    }

    const mergedVisitInfo = {
      ...(existing.visitInfo || {}),
      visitStatus: item.visitInfo.visitStatus || existing.visitInfo?.visitStatus || 'open',
      visitStatusLabel: item.visitInfo.visitStatusLabel,
      visitStatusNote: item.visitInfo.visitStatusNote,
      entryFee: item.visitInfo.entryFee,
      reservationRequired: item.visitInfo.reservationRequired !== undefined ? item.visitInfo.reservationRequired : existing.visitInfo?.reservationRequired
    };

    const res = await col.updateOne(
      { _id: existing._id },
      {
        $set: {
          visitInfo: mergedVisitInfo,
          visitorServices: item.visitorServices,
          updatedAt: new Date()
        }
      }
    );

    if (res.modifiedCount > 0 || res.matchedCount > 0) {
      updatedCount++;
    }
  }

  console.log(`Successfully processed and updated ${updatedCount} places in ${col.collectionName}!`);

  // Verify sample
  const sample = await col.find({ id: { $in: ['place-abu-simbel', 'place-abydos', 'place-alexan-pasha-palace', 'place-karnak', 'place-white-desert'] } }).toArray();
  console.log('\n--- VERIFICATION SAMPLES ---');
  sample.forEach(p => {
    console.log(`\nID: ${p.id} | Title: ${p.title}`);
    console.log(`Status Label: ${p.visitInfo?.visitStatusLabel}`);
    console.log(`Status Note: ${p.visitInfo?.visitStatusNote}`);
    console.log(`Entry Fee: ${p.visitInfo?.entryFee}`);
    console.log(`Services Count: ${p.visitorServices?.length}`);
    p.visitorServices?.slice(0, 2).forEach((s: any) => console.log(`  - ${s.name}: ${s.description}`));
  });

  await client.close();
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
