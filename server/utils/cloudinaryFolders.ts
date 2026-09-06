/**
 * WAH | وه - Centralized Cloudinary Folder Management
 * 
 * Generates secure, standardized, and predictable folder paths for all media assets
 * across the Upper Egypt Heritage platform.
 * 
 * Enforces a strict whitelist of allowed entity types and sanitizes slugs
 * to prevent directory traversal or arbitrary folder generation.
 */

// Strict mapping of entity types to their designated Cloudinary folder names
export const CLOUDINARY_ENTITY_FOLDER_MAP: Record<string, string> = {
  // Provinces / Governorates
  province: 'provinces',
  provinces: 'provinces',
  governorate: 'provinces',
  governorates: 'provinces',

  // Archaeological & Heritage Sites
  archaeologicalSite: 'archaeological-sites',
  'archaeological-site': 'archaeological-sites',
  archaeologicalSites: 'archaeological-sites',
  'archaeological-sites': 'archaeological-sites',
  place: 'archaeological-sites',
  places: 'archaeological-sites',
  heritagePlace: 'archaeological-sites',

  // Specialized Places
  museum: 'museums',
  museums: 'museums',
  religiousSite: 'religious-sites',
  'religious-site': 'religious-sites',
  religiousSites: 'religious-sites',
  naturalReserve: 'natural-reserves',
  'natural-reserve': 'natural-reserves',
  naturalReserves: 'natural-reserves',

  // Food Heritage
  food: 'food',
  foods: 'food',
  upperEgyptFood: 'food',

  // Crafts & Artisans
  craft: 'crafts',
  crafts: 'crafts',
  culturalCraft: 'crafts',

  // Traditions & Customs
  tradition: 'traditions',
  traditions: 'traditions',
  culturalTradition: 'traditions',

  // Stories & Oral History
  story: 'stories',
  stories: 'stories',
  wahStory: 'stories',

  // Local Figures & Custodians
  person: 'people',
  people: 'people',
  localPerson: 'people',

  // Events & Festivals
  event: 'events',
  events: 'events',
  culturalEvent: 'events',
  season: 'events',
  seasons: 'events',

  // Villages & Cities
  village: 'villages',
  villages: 'villages',
  city: 'cities',
  cities: 'cities',

  // Commerce & Platform
  category: 'categories',
  categories: 'categories',
  general: 'general'
};

export interface FolderGenerationOptions {
  type: string;
  entitySlug?: string;
  subfolder?: string;
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
 * Generates the standardized Cloudinary folder path.
 * Format: WAH/{mapped-category}/{sanitized-entity-slug}
 * 
 * @throws Error if the entity type is not in the approved whitelist
 */
export function getCloudinaryFolder(options: FolderGenerationOptions): string {
  const { type, entitySlug, subfolder } = options;

  if (!type || typeof type !== 'string') {
    throw new Error('نوع الكيان (entityType) مطلوب لإنشاء مجلد التخزين');
  }

  const normalizedType = type.trim();
  const folderName = CLOUDINARY_ENTITY_FOLDER_MAP[normalizedType];

  if (!folderName) {
    const validTypes = Object.keys(CLOUDINARY_ENTITY_FOLDER_MAP).slice(0, 10).join(', ');
    throw new Error(
      `نوع الكيان "${type}" غير مدعوم في بنية مجلدات منصة وه. الأنواع المدعومة تشمل: ${validTypes}...`
    );
  }

  const cleanSlug = sanitizeSlug(entitySlug);
  const cleanSubfolder = sanitizeSlug(subfolder);

  const parts = ['WAH', folderName];

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
  return trimmed.startsWith('WAH/') || trimmed === 'WAH';
}
