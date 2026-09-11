import { Db } from 'mongodb';
import { Logger } from './logger.ts';
import { memoryDb } from '../db/mongodb.ts';
import type {
    GovernorateDoc,
    HeritagePlaceDoc
} from '../models/types.ts';

/**
 * Migration and Sync utility for WAH Heritage Places & Governorates.
 * - Loads all live data directly from MongoDB collections.
 * - Cleans up legacy/fabricated rating fields from the database.
 * - Synchronizes the in-memory cache (memoryDb) with the authoritative DB data.
 */
export async function runHeritagePlacesMigration(db: Db): Promise<{
    success: boolean;
    totalPlaces: number;
    migratedCount: number;
    alreadyUpToDateCount: number;
}> {
    try {
        // 1. حذف حقول التقييمات الوهمية/الثابتة من الأماكن التراثية في قاعدة البيانات
        const ratingCleanupResult = await db.collection('wah_heritage_places').updateMany(
            { rating: { $exists: true } },
            {
                $unset: { rating: '' },
                $set: { updatedAt: new Date().toISOString() }
            }
        );

        // 2. قراءة كل المحافظات مباشرة من الداتا بيز ومزامنة الذاكرة المؤقتة (memoryDb)
        const dbGovernorates = await db.collection<GovernorateDoc>('wah_governorates').find({}).toArray();
        memoryDb.governorates = dbGovernorates;

        // 3. قراءة كل الأماكن التراثية مباشرة من الداتا بيز ومزامنة الذاكرة المؤقتة (memoryDb)
        const dbPlaces = await db.collection<HeritagePlaceDoc>('wah_heritage_places').find({}).toArray();

        // التأكد من خلو عناصر الذاكرة من حقل rating
        memoryDb.heritagePlaces = dbPlaces.map((place) => {
            const cleanPlace = { ...place };
            delete (cleanPlace as any).rating;
            return cleanPlace;
        });

        const totalPlaces = dbPlaces.length;
        const totalGovs = dbGovernorates.length;
        const cleanedRatingsCount = ratingCleanupResult.modifiedCount;

        Logger.info(
            `[Heritage Places Sync] Loaded successfully from MongoDB. Total Places: ${totalPlaces}, Total Governorates: ${totalGovs}, Cleaned ratings: ${cleanedRatingsCount}`
        );

        return {
            success: true,
            totalPlaces,
            migratedCount: cleanedRatingsCount,
            alreadyUpToDateCount: totalPlaces - cleanedRatingsCount
        };
    } catch (error: any) {
        Logger.error('[Heritage Places Sync] Error during database loading & sync:', error);
        return {
            success: false,
            totalPlaces: 0,
            migratedCount: 0,
            alreadyUpToDateCount: 0
        };
    }
}