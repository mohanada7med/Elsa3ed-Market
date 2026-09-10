import fs from 'fs';
import path from 'path';

// Load the updates we used in migration
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function updateFile() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'Elsa3ed_market';
  if (!uri) return;

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const places = await db.collection('wah_heritage_places').find({}).toArray();
  const placesMap = new Map(places.map(p => [p.id, p]));

  const filePath = path.resolve('server', 'utils', 'additionalPlacesData.ts');
  let content = fs.readFileSync(filePath, 'utf-8');

  // For each place in ADDITIONAL_HERITAGE_PLACES, update description, history, significance, visitorTips
  let updatedCount = 0;
  for (const [id, place] of placesMap.entries()) {
    // Check if id exists in content
    const idRegex = new RegExp(`id:\\s*['"]${id}['"]`, 'g');
    if (!idRegex.test(content)) continue;

    // Find the place block
    const placeIdx = content.indexOf(`id: '${id}'`);
    if (placeIdx === -1) continue;

    // Find the next place or end of array
    const nextPlaceIdx = content.indexOf(`id: 'place-`, placeIdx + 15);
    const blockEnd = nextPlaceIdx !== -1 ? nextPlaceIdx : content.indexOf('];', placeIdx);
    let block = content.substring(placeIdx, blockEnd);

    // Replace description
    if (place.description) {
      block = block.replace(/description:\s*'(?:[^'\\]|\\.)*'/, `description: '${place.description.replace(/'/g, "\\'")}'`);
    }
    // Replace history
    if (place.history) {
      block = block.replace(/history:\s*'(?:[^'\\]|\\.)*'/, `history: '${place.history.replace(/'/g, "\\'")}'`);
    }
    // Replace significance
    if (place.significance) {
      block = block.replace(/significance:\s*'(?:[^'\\]|\\.)*'/, `significance: '${place.significance.replace(/'/g, "\\'")}'`);
    }
    // Replace visitorTips
    if (place.visitorTips) {
      block = block.replace(/visitorTips:\s*'(?:[^'\\]|\\.)*'/, `visitorTips: '${place.visitorTips.replace(/'/g, "\\'")}'`);
    }

    content = content.substring(0, placeIdx) + block + content.substring(blockEnd);
    updatedCount++;
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated ${updatedCount} places in additionalPlacesData.ts!`);
  await client.close();
}

updateFile();
