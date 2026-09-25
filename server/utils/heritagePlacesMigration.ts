import { Db } from 'mongodb';
import { Logger } from './logger.ts';
import { memoryDb } from '../db/mongodb.ts';
import type {
    GovernorateDoc,
    HeritagePlaceDoc,
    CulturalCraftDoc,
    LocalPersonDoc,
    UpperEgyptFoodDoc,
    CulturalEventDoc,
    SeasonDoc,
    CityDoc,
    VillageDoc,
    CulturalTraditionDoc,
    WahStoryDoc
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

        // 2. قراءة وتحميل كافة البيانات التراثية والمواسم مباشرة وحصرياً من MongoDB
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
            db.collection<GovernorateDoc>('wah_governorates').find({}).toArray(),
            db.collection<HeritagePlaceDoc>('wah_heritage_places').find({}).toArray(),
            db.collection<CulturalCraftDoc>('wah_cultural_crafts').find({}).toArray(),
            db.collection<LocalPersonDoc>('wah_local_people').find({}).toArray(),
            db.collection<UpperEgyptFoodDoc>('wah_food').find({}).toArray(),
            db.collection<CulturalEventDoc>('wah_events').find({}).toArray(),
            db.collection<SeasonDoc>('wah_seasons').find({}).toArray(),
            db.collection<CityDoc>('wah_cities').find({}).toArray(),
            db.collection<VillageDoc>('wah_villages').find({}).toArray(),
            db.collection<CulturalTraditionDoc>('wah_traditions').find({}).toArray(),
            db.collection<WahStoryDoc>('wah_stories').find({}).toArray()
        ]);

        memoryDb.governorates = dbGovernorates;
        memoryDb.heritagePlaces = dbPlaces.map((place) => {
            const cleanPlace = { ...place };
            delete (cleanPlace as any).rating;
            return cleanPlace;
        });
        memoryDb.culturalCrafts = dbCrafts;
        memoryDb.localPeople = dbPeople;
        memoryDb.upperEgyptFood = dbFood;
        memoryDb.culturalEvents = dbEvents;
        memoryDb.seasons = dbSeasons;
        (memoryDb as any).cities = dbCities;
        (memoryDb as any).villages = dbVillages;
        (memoryDb as any).traditions = dbTraditions;
        memoryDb.wahStories = dbStories;

        const totalPlaces = dbPlaces.length;
        const totalGovs = dbGovernorates.length;
        const totalEvents = dbEvents.length;
        const totalSeasons = dbSeasons.length;
        const cleanedRatingsCount = ratingCleanupResult.modifiedCount;

        Logger.info(
            `[WAH Database Sync] Loaded exclusively from MongoDB. Places: ${totalPlaces}, Governorates: ${totalGovs}, Events: ${totalEvents}, Seasons: ${totalSeasons}, People: ${dbPeople.length}, Food: ${dbFood.length}`
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