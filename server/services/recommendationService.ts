import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { ProductDocument } from '../models/types.ts';
import { Logger } from '../utils/logger.ts';

export async function getRecommendedProducts(options: {
  productId?: string;
  categoryId?: string;
  limit?: number;
}): Promise<ProductDocument[]> {
  const limit = options.limit || 4;
  const { db, isMongo } = await getDatabase();

  if (isMongo && db) {
    try {
      const query: any = { approvalStatus: 'approved' };
      if (options.productId) {
        query.id = { $ne: options.productId };
      }
      if (options.categoryId) {
        query.categoryId = options.categoryId;
      }

      let prods = (await db
        .collection('products')
        .find(query)
        .sort({ rating: -1, reviewCount: -1 })
        .limit(limit)
        .toArray()) as unknown as ProductDocument[];

      if (prods.length < limit) {
        // Fetch popular fallback from other categories
        const extra = (await db
          .collection('products')
          .find({
            approvalStatus: 'approved',
            id: { $nin: [...prods.map((p) => p.id), ...(options.productId ? [options.productId] : [])] }
          })
          .sort({ rating: -1 })
          .limit(limit - prods.length)
          .toArray()) as unknown as ProductDocument[];

        prods = [...prods, ...extra];
      }

      return prods;
    } catch (e) {
      Logger.error('[RecommendationService] MongoDB error:', e);
    }
  }

  // Memory fallback
  let candidates = memoryDb.products.filter(
    (p) => p.approvalStatus === 'approved' && (!options.productId || p.id !== options.productId)
  );

  if (options.categoryId) {
    const sameCategory = candidates.filter((p) => p.categoryId === options.categoryId);
    if (sameCategory.length >= limit) {
      return sameCategory.slice(0, limit) as unknown as ProductDocument[];
    }
  }

  return candidates.slice(0, limit) as unknown as ProductDocument[];
}
