import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { FavoriteDocument } from '../models/types.ts';
import { Logger } from '../utils/logger.ts';

const memoryFavorites: FavoriteDocument[] = [
  { id: 'fav-1', buyerId: 'user-buyer-1', productId: 'prod-1', createdAt: '2024-01-01' },
  { id: 'fav-2', buyerId: 'user-buyer-1', productId: 'prod-2', createdAt: '2024-01-02' }
];

export async function getUserFavorites(buyerId: string): Promise<string[]> {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const favs = await db.collection('favorites').find({ buyerId }).toArray();
      return favs.map((f: any) => f.productId);
    } catch (e) {
      Logger.error('[FavoriteService] Error fetching favorites from MongoDB:', e);
    }
  }

  return memoryFavorites
    .filter((f) => f.buyerId === buyerId)
    .map((f) => f.productId);
}

export async function toggleFavorite(buyerId: string, productId: string): Promise<{ isFavorite: boolean; favorites: string[] }> {
  const { db, isMongo } = await getDatabase();

  if (isMongo && db) {
    try {
      const existing = await db.collection('favorites').findOne({ buyerId, productId });
      if (existing) {
        await db.collection('favorites').deleteOne({ buyerId, productId });
      } else {
        const doc: FavoriteDocument = {
          id: `fav-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          buyerId,
          productId,
          createdAt: new Date().toISOString()
        };
        await db.collection('favorites').insertOne(doc as any);
      }

      const all = await db.collection('favorites').find({ buyerId }).toArray();
      const productIds = all.map((f: any) => f.productId);
      return {
        isFavorite: !existing,
        favorites: productIds
      };
    } catch (e) {
      Logger.error('[FavoriteService] Error toggling favorite in MongoDB:', e);
    }
  }

  // Memory fallback
  const idx = memoryFavorites.findIndex((f) => f.buyerId === buyerId && f.productId === productId);
  let isFavorite = false;
  if (idx >= 0) {
    memoryFavorites.splice(idx, 1);
    isFavorite = false;
  } else {
    memoryFavorites.push({
      id: `fav-${Date.now()}`,
      buyerId,
      productId,
      createdAt: new Date().toISOString()
    });
    isFavorite = true;
  }

  const favorites = memoryFavorites.filter((f) => f.buyerId === buyerId).map((f) => f.productId);
  return { isFavorite, favorites };
}
