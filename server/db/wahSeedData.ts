import type {
  GovernorateDoc,
  HeritagePlaceDoc,
  CulturalCraftDoc,
  WahStoryDoc,
  LocalPersonDoc,
  UpperEgyptFoodDoc,
  CulturalEventDoc,
  CityDoc,
  VillageDoc,
  CulturalTraditionDoc,
  PlatformSettingsDoc,
  SeasonDoc
} from '../models/types.ts';

// =========================================================================
// WAH Cultural Ecosystem - Pure MongoDB Driven
// All in-memory static fallbacks have been completely cleared.
// All data is stored, managed, and queried exclusively from MongoDB.
// =========================================================================

export const INITIAL_GOVERNORATES: GovernorateDoc[] = [];
export const INITIAL_HERITAGE_PLACES: HeritagePlaceDoc[] = [];
export const INITIAL_CULTURAL_CRAFTS: CulturalCraftDoc[] = [];
export const INITIAL_UPPER_EGYPT_FOOD: UpperEgyptFoodDoc[] = [];
export const INITIAL_LOCAL_PEOPLE: LocalPersonDoc[] = [];
export const INITIAL_WAH_STORIES: WahStoryDoc[] = [];
export const INITIAL_CULTURAL_EVENTS: CulturalEventDoc[] = [];
export const INITIAL_CITIES: CityDoc[] = [];
export const INITIAL_VILLAGES: VillageDoc[] = [];
export const INITIAL_TRADITIONS: CulturalTraditionDoc[] = [];
export const INITIAL_SEASONS: SeasonDoc[] = [];

export const INITIAL_PLATFORM_SETTINGS: PlatformSettingsDoc = {
  id: 'platform_settings_global',
  siteName: 'وه | WAH — العالم الرقمي لصعيد مصر',
  siteTagline: 'منصة الصعيد الأولى — بنوثق التراث وبنقربك من حكاياته وناسه وحرفه الأصيلة',
  contactEmail: 'contact@elsa3ed.com',
  contactPhone: '01000000000',
  shippingFlatRate: 45,
  freeShippingThreshold: 500,
  featuredGovernorates: ['gov-qena', 'gov-luxor', 'gov-aswan', 'gov-asyut'],
  featuredCrafts: ['craft-pottery', 'craft-tally', 'craft-akhmeem'],
  featuredStories: [],
  featuredProducts: [],
  heroHeadline: 'أصالة الصعيد بين إيديك',
  heroSubheadline: 'من قلب صعيد مصر للعالم كله؛ بنحكي قصص البلاد والناس وبندعم أصحاب الصنعة الحقيقيين',
  updatedAt: new Date().toISOString(),
  updatedBy: 'النظام'
};