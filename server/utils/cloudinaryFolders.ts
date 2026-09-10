/**
 * WAH | وه - Centralized Cloudinary Folder Management
 * 
 * Generates secure, standardized, and predictable folder paths for all media assets
 * across the Upper Egypt Heritage platform.
 * 
 * Enforces a strict whitelist of allowed entity types and sanitizes slugs
 * to prevent directory traversal or arbitrary folder generation.
 */

export const WAH_ROOT_FOLDER = 'WAH';

// Exactly 17 standardized top-level content folders
export const WAH_TOP_LEVEL_FOLDERS = [
  'provinces',
  'cities',
  'villages',
  'archaeological-sites',
  'museums',
  'natural-reserves',
  'religious-sites',
  'food',
  'crafts',
  'traditions',
  'stories',
  'people',
  'events',
  'heritage-places',
  'videos',
  'galleries',
  'general'
] as const;

export type WahTopLevelFolder = typeof WAH_TOP_LEVEL_FOLDERS[number];

// Strict mapping of entity types to their designated Cloudinary folder names
export const CLOUDINARY_ENTITY_FOLDER_MAP: Record<string, WahTopLevelFolder> = {
  // Provinces / Governorates
  province: 'provinces',
  provinces: 'provinces',
  governorate: 'provinces',
  governorates: 'provinces',

  // Cities
  city: 'cities',
  cities: 'cities',

  // Villages
  village: 'villages',
  villages: 'villages',

  // Archaeological Sites
  archaeologicalSite: 'archaeological-sites',
  'archaeological-site': 'archaeological-sites',
  archaeologicalSites: 'archaeological-sites',
  'archaeological-sites': 'archaeological-sites',

  // Museums
  museum: 'museums',
  museums: 'museums',

  // Natural Reserves
  naturalReserve: 'natural-reserves',
  'natural-reserve': 'natural-reserves',
  naturalReserves: 'natural-reserves',
  'natural-reserves': 'natural-reserves',

  // Religious Sites
  religiousSite: 'religious-sites',
  'religious-site': 'religious-sites',
  religiousSites: 'religious-sites',
  'religious-sites': 'religious-sites',

  // Food
  food: 'food',
  foods: 'food',
  upperEgyptFood: 'food',
  'upper-egypt-food': 'food',

  // Crafts
  craft: 'crafts',
  crafts: 'crafts',
  culturalCraft: 'crafts',
  'cultural-craft': 'crafts',
  product: 'crafts',
  products: 'crafts',

  // Traditions
  tradition: 'traditions',
  traditions: 'traditions',
  culturalTradition: 'traditions',
  'cultural-tradition': 'traditions',

  // Stories
  story: 'stories',
  stories: 'stories',
  wahStory: 'stories',
  'wah-story': 'stories',

  // People
  person: 'people',
  people: 'people',
  localPerson: 'people',
  'local-person': 'people',

  // Events & Seasons
  event: 'events',
  events: 'events',
  culturalEvent: 'events',
  'cultural-event': 'events',
  season: 'events',
  seasons: 'events',

  // Heritage Places
  heritagePlace: 'heritage-places',
  'heritage-place': 'heritage-places',
  heritagePlaces: 'heritage-places',
  'heritage-places': 'heritage-places',
  place: 'heritage-places',
  places: 'heritage-places',

  // Videos
  video: 'videos',
  videos: 'videos',
  reel: 'videos',
  reels: 'videos',

  // Galleries
  gallery: 'galleries',
  galleries: 'galleries',

  // General & Platform Taxonomy
  general: 'general',
  category: 'general',
  categories: 'general',
  platform: 'general',
  banner: 'general',
  banners: 'general'
};

export interface FolderGenerationOptions {
  type?: string;
  entityType?: string;
  entitySlug?: string;
  subfolder?: string;
  resourceType?: 'image' | 'video';
}

/**
 * Checks if a given entity type is valid and recognized in the WAH architecture.
 */
export function isValidWahEntityType(type?: string): boolean {
  if (!type || typeof type !== 'string') return false;
  return Boolean(CLOUDINARY_ENTITY_FOLDER_MAP[type.trim()]);
}

/**
 * Returns all allowed top-level WAH folders.
 */
export function getAllowedWahFolders(): readonly string[] {
  return WAH_TOP_LEVEL_FOLDERS;
}

/**
 * Sanitizes an entity slug to ensure it is URL-safe, filesystem-safe,
 * and contains no path traversal sequences (e.g., '../', '//').
 */
export function sanitizeSlug(slug?: string): string {
  if (!slug || typeof slug !== 'string') {
    return '';
  }

  return slug
    .trim()
    .toLowerCase()
    // Replace spaces and slashes with hyphens
    .replace(/[\s\\/]+/g, '-')
    // Strip characters that are not Arabic letters, alphanumeric, hyphens, or underscores
    .replace(/[^\u0621-\u064Aa-z0-9_-]/g, '')
    // Replace multiple consecutive hyphens with a single hyphen
    .replace(/-+/g, '-')
    // Trim hyphens from beginning and end
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates the centralized, standardized Cloudinary folder path.
 * 
 * Signature 1: getCloudinaryFolder(entityType: string, entitySlug?: string): string
 * Signature 2: getCloudinaryFolder(options: FolderGenerationOptions): string
 * 
 * Structure: WAH/{top-level-folder}/{sanitized-entity-slug}
 * 
 * If an unknown entityType is received:
 * - Rejects the operation.
 * - Does not create a random or client-specified folder.
 * - Throws a descriptive server-side Error.
 */
export function getCloudinaryFolder(
  entityTypeOrOptions: string | FolderGenerationOptions,
  entitySlugParam?: string
): string {
  let type: string;
  let entitySlug: string | undefined;
  let subfolder: string | undefined;
  let resourceType: 'image' | 'video' | undefined;

  if (typeof entityTypeOrOptions === 'string') {
    type = entityTypeOrOptions;
    entitySlug = entitySlugParam;
  } else if (entityTypeOrOptions && typeof entityTypeOrOptions === 'object') {
    type = entityTypeOrOptions.type || entityTypeOrOptions.entityType || '';
    entitySlug = entityTypeOrOptions.entitySlug;
    subfolder = entityTypeOrOptions.subfolder;
    resourceType = entityTypeOrOptions.resourceType;
  } else {
    const err = new Error('نوع الكيان (entityType) مطلوب لإنشاء مسار مجلد التخزين');
    (err as any).code = 'UNKNOWN_ENTITY_TYPE';
    throw err;
  }

  if (!type || typeof type !== 'string' || !type.trim()) {
    const err = new Error('نوع الكيان (entityType) مطلوب ولا يمكن أن يكون فارغاً');
    (err as any).code = 'UNKNOWN_ENTITY_TYPE';
    throw err;
  }

  const normalizedType = type.trim();
  const folderName = CLOUDINARY_ENTITY_FOLDER_MAP[normalizedType];

  if (!folderName) {
    const validFolders = WAH_TOP_LEVEL_FOLDERS.join(', ');
    const err = new Error(
      `نوع القسم "${type}" مش مظبوط في مجلدات وه، اختار من الأقسام المعتمدة دي: ${validFolders}`
    );
    (err as any).code = 'UNKNOWN_ENTITY_TYPE';
    throw err;
  }

  const cleanSlug = sanitizeSlug(entitySlug);
  const cleanSubfolder = sanitizeSlug(subfolder);

  // If this is a video or explicitly requested as video, route into WAH/videos folder tree (d03b8e1b5e8938e80e3e4205e905206b0e)
  if (resourceType === 'video' || folderName === 'videos') {
    const videoParts = [WAH_ROOT_FOLDER, 'videos'];
    if (folderName !== 'videos') {
      videoParts.push(folderName);
    }
    if (cleanSlug) {
      videoParts.push(cleanSlug);
    }
    if (cleanSubfolder) {
      videoParts.push(cleanSubfolder);
    }
    return videoParts.join('/');
  }

  const parts = [WAH_ROOT_FOLDER, folderName];

  if (cleanSlug) {
    parts.push(cleanSlug);
  }

  if (cleanSubfolder) {
    parts.push(cleanSubfolder);
  }

  return parts.join('/');
}

/**
 * Checks if a given folder path is within the allowed WAH namespace.
 */
export function isAllowedWahFolder(folderPath: string): boolean {
  if (!folderPath || typeof folderPath !== 'string') return false;
  const trimmed = folderPath.trim();
  return trimmed.startsWith(`${WAH_ROOT_FOLDER}/`) || trimmed === WAH_ROOT_FOLDER;
}
