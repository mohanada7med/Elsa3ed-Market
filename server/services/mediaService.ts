import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import { ObjectId } from 'mongodb';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { validateImage, validateVideo } from '../utils/imageValidator.ts';
import { getCloudinaryFolder, sanitizeSlug } from '../utils/cloudinaryFolders.ts';
import { cloudinaryStorage, isCloudinaryAvailable, extractCloudinaryPublicId } from './storage/cloudinaryProvider.ts';
import { Logger } from '../utils/logger.ts';
import type { MediaAssetDoc, UserRole } from '../models/types.ts';

/**
 * Ensures Cloudinary has active credentials configured, falling back safely
 * to individual environment variables when CLOUDINARY_URL is a placeholder.
 */
function ensureCloudinaryConfig() {
  const config = cloudinary.config();
  if (!config.cloud_name || !config.api_key || !config.api_secret || config.api_key.includes('your_api_key')) {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
        api_key: process.env.CLOUDINARY_API_KEY.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
        secure: true
      });
    }
  }
}

/**
 * Builds a flexible MongoDB filter for matching a media asset by id, _id, or publicId.
 */
export function buildMediaIdFilter(mediaIdOrPublicId: string) {
  const filter: any[] = [
    { id: mediaIdOrPublicId },
    { _id: mediaIdOrPublicId },
    { publicId: mediaIdOrPublicId },
    { url: mediaIdOrPublicId },
    { secureUrl: mediaIdOrPublicId }
  ];
  if (ObjectId.isValid(mediaIdOrPublicId) && mediaIdOrPublicId.length === 24) {
    try {
      filter.push({ _id: new ObjectId(mediaIdOrPublicId) });
    } catch { }
  }
  return { $or: filter };
}

export interface UploadAdminMediaOptions {
  data: Buffer | string; // Buffer or Base64 string
  filename?: string;
  mimeType?: string;
  resourceType?: 'image' | 'video';
  entityType: string;
  entitySlug?: string;
  entityId?: string;
  alt?: string;
  caption?: string;
  isPrimary?: boolean;
  addToGallery?: boolean;
  user: {
    id: string;
    role: UserRole;
    name?: string;
  };
}

export interface ReplaceAdminMediaOptions {
  mediaId: string;
  data: Buffer | string;
  filename?: string;
  mimeType?: string;
  alt?: string;
  caption?: string;
  user: {
    id: string;
    role: UserRole;
  };
}

export interface ExternalUrlMediaOptions {
  url: string;
  entityType: string;
  entitySlug?: string;
  entityId?: string;
  alt?: string;
  caption?: string;
  isPrimary?: boolean;
  addToGallery?: boolean;
  user: {
    id: string;
    role: UserRole;
  };
}

export interface GetMediaFilterOptions {
  search?: string;
  entityType?: string;
  folder?: string;
  entityId?: string;
  resourceType?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'size_desc' | 'size_asc';
}

/**
 * Maps entity type to the corresponding MongoDB collection name
 */
function getEntityCollectionName(entityType: string): string | null {
  if (!entityType) return null;
  const norm = entityType.toLowerCase().replace(/[-_\s]/g, '');
  if (norm === 'province' || norm === 'provinces' || norm === 'governorate' || norm === 'governorates') {
    return 'wah_governorates';
  }
  if (
    norm === 'archaeologicalsite' ||
    norm === 'place' ||
    norm === 'heritageplace' ||
    norm === 'places' ||
    norm === 'museum' ||
    norm === 'religioussite' ||
    norm === 'naturalreserve' ||
    norm === 'site' ||
    norm === 'sites'
  ) {
    return 'wah_heritage_places';
  }
  if (norm === 'craft' || norm === 'culturalcraft' || norm === 'crafts') {
    return 'wah_cultural_crafts';
  }
  if (norm === 'story' || norm === 'wahstory' || norm === 'stories') {
    return 'wah_stories';
  }
  if (norm === 'person' || norm === 'localperson' || norm === 'people') {
    return 'wah_people';
  }
  if (norm === 'food' || norm === 'upperegyptfood' || norm === 'foods') {
    return 'wah_foods';
  }
  if (norm === 'event' || norm === 'culturalevent' || norm === 'events') {
    return 'wah_events';
  }
  if (norm === 'season' || norm === 'seasons') {
    return 'wah_seasons';
  }
  if (norm === 'village' || norm === 'villages') {
    return 'wah_villages';
  }
  if (norm === 'city' || norm === 'cities') {
    return 'wah_cities';
  }
  if (norm === 'tradition' || norm === 'culturaltradition' || norm === 'traditions') {
    return 'wah_traditions';
  }
  if (norm === 'category' || norm === 'categories') {
    return 'categories';
  }
  if (norm === 'general' || norm === 'media' || norm === 'wahmedia') {
    return 'wah_media';
  }
  return 'wah_heritage_places';
}

/**
 * Updates an entity's coverImage or gallery in its MongoDB collection
 */
async function syncMediaWithEntity(
  entityType: string,
  entityId: string,
  secureUrl: string,
  isPrimary?: boolean,
  addToGallery?: boolean,
  resourceType?: 'image' | 'video'
) {
  if (!entityId) return;

  const collectionName = getEntityCollectionName(entityType);
  if (!collectionName) return;

  const { db, isMongo } = await getDatabase();
  const filter = { $or: [{ id: entityId }, { _id: entityId } as any] };

  if (isMongo && db) {
    try {
      const updateFields: any = {};
      const pushFields: any = {};

      if (resourceType === 'video') {
        updateFields.videoUrl = secureUrl;
        pushFields.videos = secureUrl;
      } else {
        if (isPrimary) {
          if (entityType === 'person') {
            updateFields.avatarUrl = secureUrl;
          } else {
            updateFields.coverImage = secureUrl;
          }
        }

        if (addToGallery) {
          pushFields.gallery = secureUrl;
        }
      }

      const updateOp: any = {};
      if (Object.keys(updateFields).length > 0) {
        updateOp.$set = { ...updateFields, updatedAt: new Date().toISOString() };
      }
      if (Object.keys(pushFields).length > 0) {
        updateOp.$addToSet = pushFields;
      }

      if (Object.keys(updateOp).length > 0) {
        await db.collection(collectionName).updateOne(filter, updateOp);
        Logger.info(`[MediaSync] Updated ${collectionName} entity ${entityId} with media URL: ${secureUrl}`);
      }
    } catch (err) {
      Logger.error(`[MediaSync] Failed to sync media with entity in ${collectionName}:`, err);
    }
  }

  // Also sync in-memory collections for fast immediate reactivity
  if (collectionName === 'wah_heritage_places') {
    const place = memoryDb.heritagePlaces.find((p) => p.id === entityId || p.slug === entityId);
    if (place) {
      if (resourceType === 'video') {
        place.videoUrl = secureUrl;
        if (!place.videos) place.videos = [];
        if (!place.videos.includes(secureUrl)) place.videos.push(secureUrl);
      } else {
        if (isPrimary) place.coverImage = secureUrl;
        if (addToGallery) {
          if (!place.gallery) place.gallery = [];
          if (!place.gallery.includes(secureUrl)) place.gallery.push(secureUrl);
        }
      }
    }
  } else if (collectionName === 'wah_cultural_crafts') {
    const craft = memoryDb.culturalCrafts.find((c) => c.id === entityId || c.slug === entityId);
    if (craft) {
      if (resourceType === 'video') {
        craft.videoUrl = secureUrl;
        if (!craft.videos) craft.videos = [];
        if (!craft.videos.includes(secureUrl)) craft.videos.push(secureUrl);
      } else {
        if (isPrimary) craft.coverImage = secureUrl;
        if (addToGallery) {
          if (!craft.gallery) craft.gallery = [];
          if (!craft.gallery.includes(secureUrl)) craft.gallery.push(secureUrl);
        }
      }
    }
  } else if (collectionName === 'wah_stories') {
    const story = memoryDb.wahStories.find((s) => s.id === entityId || s.slug === entityId);
    if (story) {
      if (resourceType === 'video') {
        story.videoUrl = secureUrl;
        if (!story.videos) story.videos = [];
        if (!story.videos.includes(secureUrl)) story.videos.push(secureUrl);
      } else {
        if (isPrimary) story.coverImage = secureUrl;
      }
    }
  }
}

/**
 * Uploads media strictly for ADMIN users into the designated Cloudinary WAH folder structure.
 */
export async function uploadAdminMedia(options: UploadAdminMediaOptions): Promise<MediaAssetDoc> {
  const {
    data,
    filename = 'image',
    mimeType,
    entityType,
    entitySlug,
    entityId,
    alt,
    caption,
    isPrimary,
    addToGallery,
    user
  } = options;

  // 1. Strict Server Authorization Check
  if (!user || user.role !== 'admin') {
    throw new Error('عفواً، هذه العملية مخصصة لمدراء النظام فقط');
  }

  // 2. Detect Media Type (Video vs Image)
  const isVideo =
    options.resourceType === 'video' ||
    Boolean(mimeType && mimeType.toLowerCase().startsWith('video/')) ||
    filename.toLowerCase().endsWith('.mp4') ||
    filename.toLowerCase().endsWith('.webm') ||
    filename.toLowerCase().endsWith('.mov') ||
    filename.toLowerCase().endsWith('.ogg') ||
    filename.toLowerCase().endsWith('.mkv') ||
    entityType === 'video' ||
    entityType === 'videos';

  // 3. Validate Content & Format
  const validation = isVideo
    ? validateVideo(data, filename, mimeType)
    : validateImage(data, filename, mimeType);

  if (!validation.valid) {
    throw new Error(validation.error || (isVideo ? 'ملف الفيديو غير صالح أو يتجاوز الحجم المسموح' : 'ملف الصورة غير صالح أو يتجاوز الحجم المسموح'));
  }

  // 4. Resolve Standardized Cloudinary Folder via Whitelisted Central Function
  // Videos are strictly routed under WAH/videos (d03b8e1b5e8938e80e3e4205e905206b0e)
  const targetFolder = isVideo
    ? getCloudinaryFolder({ entityType, entitySlug: entitySlug || entityId, resourceType: 'video' })
    : getCloudinaryFolder(entityType, entitySlug || entityId);

  if (!isCloudinaryAvailable()) {
    throw new Error('خدمة Cloudinary غير مهيأة أو غير متوفرة في بيئة العمل');
  }

  ensureCloudinaryConfig();

  // 5. Generate Safe Public ID
  const cleanName = sanitizeSlug(filename.replace(/\.[^/.]+$/, '')) || (isVideo ? 'vid' : 'img');
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const publicId = `${cleanName}_${uniqueSuffix}`;

  // 6. Prepare Payload & Upload Options
  let uploadPayload: string | Buffer;
  if (Buffer.isBuffer(data)) {
    uploadPayload = data;
  } else if (typeof data === 'string') {
    if (data.startsWith('data:')) {
      uploadPayload = data;
    } else {
      const defaultMime = isVideo ? 'video/mp4' : 'image/jpeg';
      uploadPayload = `data:${validation.mimeType || defaultMime};base64,${data}`;
    }
  } else {
    throw new Error('صيغة بيانات الوسائط غير مدعومة');
  }

  const uploadOptions: any = {
    folder: targetFolder,
    public_id: publicId,
    overwrite: false,
    resource_type: isVideo ? 'video' : 'image',
    ...(isVideo
      ? {
        chunk_size: 6000000, // 6MB chunks for robust streaming of large videos
        timeout: 300000 // 5 minutes timeout to prevent connection drops on larger files
      }
      : {
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      })
  };

  let uploadResult: UploadApiResponse;

  try {
    if (Buffer.isBuffer(uploadPayload)) {
      uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, res) => {
          if (err || !res) {
            reject(err || new Error(isVideo ? 'فشل رفع الفيديو إلى Cloudinary' : 'فشل رفع الصورة إلى Cloudinary'));
          } else {
            resolve(res);
          }
        });
        stream.end(uploadPayload);
      });
    } else if (isVideo) {
      uploadResult = (await cloudinary.uploader.upload_large(uploadPayload, uploadOptions)) as UploadApiResponse;
    } else {
      uploadResult = await cloudinary.uploader.upload(uploadPayload, uploadOptions);
    }
  } catch (cloudErr: any) {
    Logger.error('[MediaService] Cloudinary upload error:', cloudErr?.message || cloudErr);
    throw new Error(cloudErr?.message || (isVideo ? 'فشل في رفع الفيديو إلى خدمة التخزين السحابي Cloudinary' : 'فشل في رفع الصورة إلى خدمة التخزين السحابي Cloudinary'));
  }

  // 7. Construct Media Document
  const mediaId = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const suggestedAlt = alt || `${filename || (isVideo ? 'فيديو' : 'صورة')} - منصة وه للتراث`;

  const mediaDoc: any = {
    _id: mediaId,
    id: mediaId,
    title: suggestedAlt,
    url: uploadResult.secure_url,
    secureUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    folder: targetFolder,
    type: isVideo ? 'video' : 'image',
    resourceType: isVideo ? 'video' : 'image',
    category: (entityType as any) || (isVideo ? 'videos' : 'general'),
    entityType,
    entityId: entityId || undefined,
    entitySlug: sanitizeSlug(entitySlug) || undefined,
    uploadedBy: user.id,
    uploaderRole: 'admin',
    sizeBytes: uploadResult.bytes || validation.sizeBytes || 0,
    bytes: uploadResult.bytes || validation.sizeBytes || 0,
    width: uploadResult.width,
    height: uploadResult.height,
    duration: uploadResult.duration,
    format: uploadResult.format || (isVideo ? 'mp4' : 'jpg'),
    alt: suggestedAlt,
    caption: caption || '',
    isPrimary: Boolean(isPrimary),
    status: 'verified',
    metadata: {
      originalFilename: filename,
      etag: uploadResult.etag,
      cloudinaryVersion: uploadResult.version
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 7. Save Media Document to MongoDB (with rollback on DB failure)
  try {
    const { db, isMongo } = await getDatabase();
    if (isMongo && db) {
      await db.collection<MediaAssetDoc>('wah_media').insertOne({ ...mediaDoc } as any);
    }
    // In-memory fallback
    memoryDb.media.unshift(mediaDoc);

    // 8. If associated with an entity, update the entity references
    if (entityId) {
      await syncMediaWithEntity(entityType, entityId, uploadResult.secure_url, isPrimary, addToGallery);
    }

    Logger.info(`[MediaService] Admin media uploaded & saved successfully: ${mediaDoc.publicId} (${mediaDoc.secureUrl})`);
    return mediaDoc;
  } catch (dbErr: any) {
    // Database operation failed: ROLLBACK Cloudinary asset immediately to prevent orphaned assets!
    Logger.error('[MediaService] Database insertion failed. Rolling back Cloudinary asset:', mediaDoc.publicId);
    try {
      await cloudinary.uploader.destroy(mediaDoc.publicId!);
      Logger.info('[MediaService] Successfully rolled back orphaned Cloudinary asset');
    } catch (cleanupErr) {
      Logger.error('[MediaService] Failed to rollback Cloudinary asset:', cleanupErr);
    }
    throw new Error('فشل حفظ بيانات الوسائط في قاعدة البيانات بعد الرفع');
  }
}

/**
 * Saves an external safe URL as a WAH media document and links to entity if needed.
 */
export async function saveExternalUrlMedia(options: ExternalUrlMediaOptions): Promise<MediaAssetDoc> {
  const { url, entityType, entitySlug, entityId, alt, caption, isPrimary, addToGallery, user } = options;

  if (!user || user.role !== 'admin') {
    throw new Error('عفواً، هذه العملية مخصصة لمدراء النظام فقط');
  }

  if (!url || typeof url !== 'string') {
    throw new Error('يرجى تزويد رابط الصورة');
  }

  const trimmed = url.trim();
  // Safe URL Protocol Validation
  if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://')) {
    throw new Error('الرابط غير آمن. يسمح فقط بروابط تبدأ بـ http:// أو https://');
  }

  // Check dangerous strings
  const lower = trimmed.toLowerCase();
  if (lower.includes('javascript:') || lower.includes('data:') || lower.includes('<script')) {
    throw new Error('الرابط يحتوي على بروتوكول غير آمن أو غير مصرح به');
  }

  const publicId = extractCloudinaryPublicId(trimmed) || undefined;
  const folder = getCloudinaryFolder(entityType, entitySlug || entityId);
  const mediaId = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const title = alt || 'صورة خارجية موثقة';

  const mediaDoc: any = {
    _id: mediaId,
    id: mediaId,
    title,
    url: trimmed,
    secureUrl: trimmed,
    publicId,
    folder,
    type: 'image',
    category: (entityType as any) || 'general',
    entityType,
    entityId: entityId || undefined,
    entitySlug: sanitizeSlug(entitySlug) || undefined,
    uploadedBy: user.id,
    uploaderRole: 'admin',
    alt: title,
    caption: caption || '',
    isPrimary: Boolean(isPrimary),
    status: 'verified',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    await db.collection<MediaAssetDoc>('wah_media').insertOne({ ...mediaDoc } as any);
  }
  memoryDb.media.unshift(mediaDoc);

  if (entityId) {
    await syncMediaWithEntity(entityType, entityId, trimmed, isPrimary, addToGallery);
  }

  return mediaDoc;
}

/**
 * Replaces an existing media asset with a new image upload.
 * Guarantees that old image is preserved if new upload or DB update fails.
 */
export async function replaceAdminMedia(options: ReplaceAdminMediaOptions): Promise<MediaAssetDoc> {
  const { mediaId, data, filename = 'replacement', mimeType, alt, caption, user } = options;

  if (!user || user.role !== 'admin') {
    throw new Error('عفواً، هذه العملية مخصصة لمدراء النظام فقط');
  }

  const { db, isMongo } = await getDatabase();
  let existingMedia: MediaAssetDoc | null = null;

  if (isMongo && db) {
    existingMedia = await db.collection<MediaAssetDoc>('wah_media').findOne(buildMediaIdFilter(mediaId));
  }
  if (!existingMedia) {
    existingMedia = memoryDb.media.find((m) => m.id === mediaId) || null;
  }

  if (!existingMedia) {
    throw new Error('سجل الصورة المطلوب استبداله غير موجود في قاعدة البيانات');
  }

  const oldPublicId = existingMedia.publicId;
  const oldUrl = existingMedia.secureUrl || existingMedia.url;

  // 1. Upload the replacement image first
  const newMedia = await uploadAdminMedia({
    data,
    filename,
    mimeType,
    entityType: existingMedia.entityType || 'general',
    entitySlug: existingMedia.entitySlug,
    entityId: existingMedia.entityId,
    alt: alt || existingMedia.alt,
    caption: caption || existingMedia.caption,
    isPrimary: existingMedia.isPrimary,
    user
  });

  // 2. Update existing media record with new values
  const updatedDoc: Partial<MediaAssetDoc> = {
    url: newMedia.secureUrl,
    secureUrl: newMedia.secureUrl,
    publicId: newMedia.publicId,
    width: newMedia.width,
    height: newMedia.height,
    bytes: newMedia.bytes,
    sizeBytes: newMedia.sizeBytes,
    format: newMedia.format,
    alt: alt || existingMedia.alt,
    caption: caption || existingMedia.caption,
    updatedAt: new Date().toISOString()
  };

  if (isMongo && db) {
    await db.collection<MediaAssetDoc>('wah_media').updateOne(
      buildMediaIdFilter(mediaId),
      { $set: updatedDoc }
    );
    // Delete the temporary single media doc created by uploadAdminMedia since we updated the existing one
    await db.collection('wah_media').deleteOne(buildMediaIdFilter(newMedia.id));
  }

  // Update in-memory
  const idx = memoryDb.media.findIndex((m) => m.id === mediaId);
  if (idx !== -1) {
    memoryDb.media[idx] = { ...memoryDb.media[idx], ...updatedDoc };
  }
  memoryDb.media = memoryDb.media.filter((m) => m.id !== newMedia.id);

  // 3. Update related entity references (replace old URL with new URL)
  if (existingMedia.entityType && existingMedia.entityId) {
    const collectionName = getEntityCollectionName(existingMedia.entityType);
    if (collectionName && isMongo && db) {
      try {
        const entityFilter = { $or: [{ id: existingMedia.entityId }, { _id: existingMedia.entityId } as any] };
        // Replace coverImage if it matched
        await db.collection(collectionName).updateOne(
          { ...entityFilter, coverImage: oldUrl },
          { $set: { coverImage: newMedia.secureUrl, updatedAt: new Date().toISOString() } }
        );
        // Replace in gallery array
        await db.collection(collectionName).updateOne(
          { ...entityFilter, gallery: oldUrl },
          { $set: { 'gallery.$': newMedia.secureUrl, updatedAt: new Date().toISOString() } }
        );
      } catch (syncErr) {
        Logger.warn('[MediaService] Entity replacement sync warning:', syncErr);
      }
    }
  }

  // 4. Safely destroy the old Cloudinary asset now that replacement is verified in DB
  if (oldPublicId) {
    try {
      const destroyOpts: any = {};
      if (existingMedia.type === 'video' || existingMedia.resourceType === 'video') {
        destroyOpts.resource_type = 'video';
      }
      await cloudinary.uploader.destroy(oldPublicId, destroyOpts);
      Logger.info(`[MediaService] Successfully destroyed replaced old Cloudinary asset: ${oldPublicId}`);
    } catch (destroyErr) {
      Logger.warn('[MediaService] Failed to destroy old Cloudinary asset:', destroyErr);
    }
  }

  return { ...existingMedia, ...updatedDoc } as MediaAssetDoc;
}

/**
 * Deletes a media asset:
 * 1. Checks Admin permission
 * 2. Destroys the Cloudinary asset via public ID
 * 3. Removes from MongoDB wah_media collection
 * 4. Removes references from the related entity (coverImage, gallery)
 */
export async function deleteAdminMedia(
  mediaIdOrPublicId: string,
  user: { id: string; role: UserRole }
): Promise<boolean> {
  if (!user || user.role !== 'admin') {
    throw new Error('عفواً، هذه العملية مخصصة لمدراء النظام فقط');
  }

  const { db, isMongo } = await getDatabase();
  let mediaDoc: MediaAssetDoc | null = null;

  if (isMongo && db) {
    mediaDoc = await db.collection<MediaAssetDoc>('wah_media').findOne(buildMediaIdFilter(mediaIdOrPublicId));
  }
  if (!mediaDoc) {
    mediaDoc =
      memoryDb.media.find(
        (m) =>
          m.id === mediaIdOrPublicId ||
          m.publicId === mediaIdOrPublicId ||
          m.url === mediaIdOrPublicId ||
          m.secureUrl === mediaIdOrPublicId
      ) || null;
  }

  const targetPublicId =
    mediaDoc?.publicId || extractCloudinaryPublicId(mediaIdOrPublicId) || mediaIdOrPublicId;
  const targetUrl = mediaDoc?.secureUrl || mediaDoc?.url;

  // 1. Destroy asset from Cloudinary
  let cloudinaryDeleted = false;
  if (targetPublicId && isCloudinaryAvailable()) {
    ensureCloudinaryConfig();
    try {
      const destroyOpts: any = {};
      if (mediaDoc?.type === 'video' || mediaDoc?.resourceType === 'video') {
        destroyOpts.resource_type = 'video';
      }
      const res = await cloudinary.uploader.destroy(targetPublicId, destroyOpts);
      cloudinaryDeleted = res.result === 'ok' || res.result === 'not found';
      Logger.info(`[MediaService] Cloudinary destroy result for ${targetPublicId}: ${res.result}`);
    } catch (cloudErr) {
      Logger.error(`[MediaService] Cloudinary deletion error for ${targetPublicId}:`, cloudErr);
    }
  }

  // 2. Remove references from related entity in MongoDB
  if (mediaDoc && mediaDoc.entityType && mediaDoc.entityId && targetUrl) {
    const collectionName = getEntityCollectionName(mediaDoc.entityType);
    if (collectionName && isMongo && db) {
      try {
        const filter = { $or: [{ id: mediaDoc.entityId }, { _id: mediaDoc.entityId } as any] };
        // Unset coverImage if this was the cover image
        await db.collection(collectionName).updateOne(
          { ...filter, coverImage: targetUrl },
          { $set: { coverImage: '', updatedAt: new Date().toISOString() } }
        );
        // Pull from gallery array
        await db.collection(collectionName).updateOne(filter, {
          $pull: { gallery: targetUrl } as any,
          $set: { updatedAt: new Date().toISOString() }
        });
        // Pull from videos or unset videoUrl
        await db.collection(collectionName).updateOne(
          { ...filter, videoUrl: targetUrl },
          { $set: { videoUrl: '', updatedAt: new Date().toISOString() } }
        );
        await db.collection(collectionName).updateOne(filter, {
          $pull: { videos: targetUrl } as any,
          $set: { updatedAt: new Date().toISOString() }
        });
        Logger.info(`[MediaService] Cleaned up entity references for ${mediaDoc.entityId} in ${collectionName}`);
      } catch (syncErr) {
        Logger.warn('[MediaService] Entity reference cleanup error:', syncErr);
      }
    }

    // Clean up memoryDb entity stores as well
    if (targetUrl) {
      const targetClean = targetUrl.trim();
      const targetPath = targetClean.split('?')[0];
      const checkMatch = (u?: string) => u && (u.trim() === targetClean || u.trim().split('?')[0] === targetPath);

      for (const p of memoryDb.heritagePlaces) {
        if (checkMatch(p.coverImage)) p.coverImage = '';
        if (p.gallery) p.gallery = p.gallery.filter((u) => !checkMatch(u));
        if ((p as any).galleryImages) (p as any).galleryImages = (p as any).galleryImages.filter((u: string) => !checkMatch(u));
        if (checkMatch(p.videoUrl)) p.videoUrl = '';
        if (p.videos) p.videos = p.videos.filter((u) => !checkMatch(u));
      }
      for (const c of memoryDb.culturalCrafts) {
        if (checkMatch(c.coverImage)) c.coverImage = '';
        if (c.gallery) c.gallery = c.gallery.filter((u) => !checkMatch(u));
      }
      for (const g of memoryDb.governorates) {
        if (checkMatch(g.coverImage)) g.coverImage = '';
        if ((g as any).gallery) (g as any).gallery = (g as any).gallery.filter((u: string) => !checkMatch(u));
      }
      for (const s of memoryDb.wahStories) {
        if (checkMatch(s.coverImage)) s.coverImage = '';
        if ((s as any).gallery) (s as any).gallery = (s as any).gallery.filter((u: string) => !checkMatch(u));
      }
    }
  }

  // 3. Remove document from MongoDB wah_media collection
  if (isMongo && db) {
    await db.collection('wah_media').deleteMany(buildMediaIdFilter(mediaIdOrPublicId));
  }

  // Remove from in-memory fallback
  memoryDb.media = memoryDb.media.filter(
    (m) =>
      m.id !== mediaIdOrPublicId &&
      m.publicId !== targetPublicId &&
      m.url !== targetUrl &&
      m.secureUrl !== targetUrl
  );

  Logger.info(`[MediaService] Media deletion completed for ${mediaIdOrPublicId}`);
  return true;
}

/**
 * Updates metadata (alt, caption, isPrimary) for a media asset
 */
export async function updateAdminMediaMetadata(
  mediaId: string,
  updates: { alt?: string; caption?: string; isPrimary?: boolean },
  user: { id: string; role: UserRole }
): Promise<MediaAssetDoc | null> {
  if (!user || user.role !== 'admin') {
    throw new Error('عفواً، هذه العملية مخصصة لمدراء النظام فقط');
  }

  const { db, isMongo } = await getDatabase();
  const setObj: any = { updatedAt: new Date().toISOString() };
  if (updates.alt !== undefined) setObj.alt = updates.alt.trim();
  if (updates.caption !== undefined) setObj.caption = updates.caption.trim();
  if (updates.isPrimary !== undefined) setObj.isPrimary = Boolean(updates.isPrimary);

  let updatedDoc: MediaAssetDoc | null = null;

  if (isMongo && db) {
    const res = await db
      .collection<MediaAssetDoc>('wah_media')
      .findOneAndUpdate(
        buildMediaIdFilter(mediaId),
        { $set: setObj },
        { returnDocument: 'after' }
      );
    updatedDoc = res || null;
  }

  // Update in-memory
  const idx = memoryDb.media.findIndex((m) => m.id === mediaId);
  if (idx !== -1) {
    memoryDb.media[idx] = { ...memoryDb.media[idx], ...setObj };
    if (!updatedDoc) updatedDoc = memoryDb.media[idx];
  }

  // If set to primary, update the corresponding entity's coverImage
  if (updates.isPrimary && updatedDoc?.entityType && updatedDoc?.entityId && updatedDoc.secureUrl) {
    await syncMediaWithEntity(updatedDoc.entityType, updatedDoc.entityId, updatedDoc.secureUrl, true);
  }

  return updatedDoc;
}

/**
 * Sets an image as primary for an entity and updates the entity's coverImage.
 */
export async function setPrimaryAdminMedia(
  mediaId: string,
  user: { id: string; role: UserRole }
): Promise<MediaAssetDoc | null> {
  if (!user || user.role !== 'admin') {
    throw new Error('عفواً، هذه العملية مخصصة لمدراء النظام فقط');
  }

  const { db, isMongo } = await getDatabase();
  let mediaDoc: MediaAssetDoc | null = null;

  if (isMongo && db) {
    mediaDoc = await db.collection<MediaAssetDoc>('wah_media').findOne(buildMediaIdFilter(mediaId));
  }
  if (!mediaDoc) {
    mediaDoc = memoryDb.media.find((m) => m.id === mediaId) || null;
  }

  if (!mediaDoc) {
    throw new Error('سجل الصورة المطلوب غير موجود');
  }

  // Unset isPrimary for other media belonging to this entity
  if (mediaDoc.entityType && mediaDoc.entityId) {
    if (isMongo && db) {
      await db.collection<MediaAssetDoc>('wah_media').updateMany(
        { entityType: mediaDoc.entityType, entityId: mediaDoc.entityId },
        { $set: { isPrimary: false, updatedAt: new Date().toISOString() } }
      );
    }
    memoryDb.media.forEach((m) => {
      if (m.entityType === mediaDoc!.entityType && m.entityId === mediaDoc!.entityId) {
        m.isPrimary = false;
      }
    });
  }

  // Set isPrimary = true on this media doc
  return await updateAdminMediaMetadata(mediaId, { isPrimary: true }, user);
}

/**
 * Reorders the gallery array for an entity.
 */
export async function reorderGalleryMedia(options: {
  entityType: string;
  entityId: string;
  galleryUrls: string[];
  user: { id: string; role: UserRole };
}): Promise<{ success: boolean; gallery: string[] }> {
  const { entityType, entityId, galleryUrls, user } = options;

  if (!user || user.role !== 'admin') {
    throw new Error('عفواً، هذه العملية مخصصة لمدراء النظام فقط');
  }

  if (!entityId || !Array.isArray(galleryUrls)) {
    throw new Error('بيانات إعادة ترتيب المعرض غير مكتملة');
  }

  const collectionName = getEntityCollectionName(entityType);
  if (!collectionName) {
    throw new Error(`نوع الكيان ${entityType} غير مدعوم للمعرض`);
  }

  const { db, isMongo } = await getDatabase();
  const filter = { $or: [{ id: entityId }, { _id: entityId } as any] };
  if (isMongo && db) {
    await db.collection(collectionName).updateOne(
      filter,
      { $set: { gallery: galleryUrls, updatedAt: new Date().toISOString() } }
    );
  }

  // Also sync memoryDb
  if (collectionName === 'wah_heritage_places') {
    const place = memoryDb.heritagePlaces.find((p) => p.id === entityId || p.slug === entityId);
    if (place) place.gallery = [...galleryUrls];
  } else if (collectionName === 'wah_cultural_crafts') {
    const craft = memoryDb.culturalCrafts.find((c) => c.id === entityId || c.slug === entityId);
    if (craft) craft.gallery = [...galleryUrls];
  }

  return { success: true, gallery: galleryUrls };
}

/**
 * Directly manages entity gallery items: add, remove, setCover, updateGallery, setVideo, removeVideo
 */
export async function manageEntityGallery(options: {
  entityType: string;
  entityId: string;
  action: 'add' | 'remove' | 'setCover' | 'updateGallery' | 'setVideo' | 'removeVideo';
  imageUrl?: string;
  videoUrl?: string;
  galleryUrls?: string[];
  user: { id: string; role: UserRole };
}): Promise<{
  success: boolean;
  message: string;
  coverImage?: string;
  gallery?: string[];
  videoUrl?: string | null;
  videos?: string[];
}> {
  const { entityType, entityId, action, imageUrl, videoUrl, galleryUrls, user } = options;

  if (!user || user.role !== 'admin') {
    throw new Error('عفواً، هذه العملية مخصصة لمدراء النظام فقط');
  }

  const collectionName = getEntityCollectionName(entityType);
  if (!collectionName) {
    throw new Error(`نوع الكيان ${entityType} غير مدعوم للمعرض`);
  }

  const { db, isMongo } = await getDatabase();
  const filter = { $or: [{ id: entityId }, { slug: entityId }, { _id: entityId } as any] };

  let updatedGallery: string[] = [];
  let updatedCover: string | undefined;

  if (action === 'setCover' && imageUrl) {
    updatedCover = imageUrl;
    if (isMongo && db) {
      await db.collection(collectionName).updateOne(filter, {
        $set: { coverImage: imageUrl, updatedAt: new Date().toISOString() }
      });
    }
    if (collectionName === 'wah_heritage_places') {
      const place = memoryDb.heritagePlaces.find((p) => p.id === entityId || p.slug === entityId);
      if (place) place.coverImage = imageUrl;
    } else if (collectionName === 'wah_cultural_crafts') {
      const craft = memoryDb.culturalCrafts.find((c) => c.id === entityId || c.slug === entityId);
      if (craft) craft.coverImage = imageUrl;
    }
    return { success: true, message: 'تم تعيين الصورة كصورة رئيسية للمكان بنجاح', coverImage: imageUrl };
  }

  if (action === 'setVideo' && (videoUrl || imageUrl)) {
    const targetVideo = videoUrl || imageUrl;
    if (isMongo && db) {
      await db.collection(collectionName).updateOne(filter, {
        $set: { videoUrl: targetVideo, updatedAt: new Date().toISOString() },
        $addToSet: { videos: targetVideo } as any
      });
    }
    if (collectionName === 'wah_heritage_places') {
      const place = memoryDb.heritagePlaces.find((p) => p.id === entityId || p.slug === entityId);
      if (place) {
        place.videoUrl = targetVideo;
        if (!place.videos) place.videos = [];
        if (!place.videos.includes(targetVideo!)) place.videos.push(targetVideo!);
      }
    } else if (collectionName === 'wah_cultural_crafts') {
      const craft = memoryDb.culturalCrafts.find((c) => c.id === entityId || c.slug === entityId);
      if (craft) {
        craft.videoUrl = targetVideo;
        if (!craft.videos) craft.videos = [];
        if (!craft.videos.includes(targetVideo!)) craft.videos.push(targetVideo!);
      }
    }
    return { success: true, message: 'تم حفظ مقطع الفيديو التوثيقي بنجاح', videoUrl: targetVideo };
  }

  if (action === 'removeVideo') {
    const targetVideo = videoUrl || imageUrl;
    if (isMongo && db) {
      const updateDoc: any = {
        $set: { updatedAt: new Date().toISOString() }
      };
      if (!targetVideo) {
        updateDoc.$set.videoUrl = null;
      }
      if (targetVideo) {
        updateDoc.$pull = { videos: targetVideo };
      }
      await db.collection(collectionName).updateOne(filter, updateDoc);
    }
    if (collectionName === 'wah_heritage_places') {
      const place = memoryDb.heritagePlaces.find((p) => p.id === entityId || p.slug === entityId);
      if (place) {
        if (!targetVideo || place.videoUrl === targetVideo) place.videoUrl = undefined;
        if (targetVideo && place.videos) place.videos = place.videos.filter((v) => v !== targetVideo);
      }
    } else if (collectionName === 'wah_cultural_crafts') {
      const craft = memoryDb.culturalCrafts.find((c) => c.id === entityId || c.slug === entityId);
      if (craft) {
        if (!targetVideo || craft.videoUrl === targetVideo) craft.videoUrl = undefined;
        if (targetVideo && craft.videos) craft.videos = craft.videos.filter((v) => v !== targetVideo);
      }
    }
    return { success: true, message: 'تم إزالة مقطع الفيديو بنجاح', videoUrl: null };
  }

  if (action === 'add' && imageUrl) {
    if (isMongo && db) {
      await db.collection(collectionName).updateOne(filter, {
        $addToSet: { gallery: imageUrl } as any,
        $set: { updatedAt: new Date().toISOString() }
      });
    }
    if (collectionName === 'wah_heritage_places') {
      const place = memoryDb.heritagePlaces.find((p) => p.id === entityId || p.slug === entityId);
      if (place) {
        if (!place.gallery) place.gallery = [];
        if (!place.gallery.includes(imageUrl)) place.gallery.push(imageUrl);
        updatedGallery = place.gallery;
      }
    } else if (collectionName === 'wah_cultural_crafts') {
      const craft = memoryDb.culturalCrafts.find((c) => c.id === entityId || c.slug === entityId);
      if (craft) {
        if (!craft.gallery) craft.gallery = [];
        if (!craft.gallery.includes(imageUrl)) craft.gallery.push(imageUrl);
        updatedGallery = craft.gallery;
      }
    }
    return { success: true, message: 'تمت إضافة الصورة إلى معرض صور المكان بنجاح', gallery: updatedGallery };
  }

  if (action === 'remove' && imageUrl) {
    const targetClean = imageUrl.trim();
    const targetPath = targetClean.split('?')[0];

    if (isMongo && db) {
      try {
        const doc = await db.collection(collectionName).findOne(filter);
        if (doc) {
          const currentList: string[] = Array.isArray(doc.gallery)
            ? doc.gallery
            : Array.isArray((doc as any).galleryImages)
              ? (doc as any).galleryImages
              : [];

          const filtered = currentList.filter((img: string) => {
            if (!img) return false;
            const clean = img.trim();
            if (clean === targetClean || clean.split('?')[0] === targetPath) return false;
            const p1 = clean.split('/upload/')[1];
            const p2 = targetClean.split('/upload/')[1];
            if (p1 && p2 && (p1.endsWith(p2) || p2.endsWith(p1))) return false;
            return true;
          });

          const updateFields: any = {
            gallery: filtered,
            updatedAt: new Date().toISOString()
          };
          if ((doc as any).galleryImages) {
            updateFields.galleryImages = filtered;
          }
          if (doc.coverImage && (doc.coverImage === targetClean || doc.coverImage.split('?')[0] === targetPath)) {
            updateFields.coverImage = filtered[0] || '';
          }
          await db.collection(collectionName).updateOne(filter, { $set: updateFields });
          updatedGallery = filtered;
        } else {
          await db.collection(collectionName).updateOne(filter, {
            $pull: { gallery: imageUrl, galleryImages: imageUrl } as any,
            $set: { updatedAt: new Date().toISOString() }
          });
        }
      } catch (dbErr) {
        Logger.warn('[MediaService] MongoDB gallery removal warning:', dbErr);
      }
    }

    // Synchronize memoryDb store
    if (collectionName === 'wah_heritage_places') {
      const place = memoryDb.heritagePlaces.find((p) => p.id === entityId || p.slug === entityId);
      if (place) {
        const curList = Array.isArray(place.gallery) && place.gallery.length > 0 ? place.gallery : ((place as any).galleryImages || []);
        const filtered = curList.filter((img: string) => img !== targetClean && img.split('?')[0] !== targetPath);
        place.gallery = filtered;
        (place as any).galleryImages = filtered;
        if (place.coverImage && (place.coverImage === targetClean || place.coverImage.split('?')[0] === targetPath)) {
          place.coverImage = filtered[0] || '';
        }
        updatedGallery = filtered;
      }
    } else if (collectionName === 'wah_cultural_crafts') {
      const craft = memoryDb.culturalCrafts.find((c) => c.id === entityId || c.slug === entityId);
      if (craft) {
        const curList = craft.gallery || [];
        const filtered = curList.filter((img: string) => img !== targetClean && img.split('?')[0] !== targetPath);
        craft.gallery = filtered;
        if (craft.coverImage && (craft.coverImage === targetClean || craft.coverImage.split('?')[0] === targetPath)) {
          craft.coverImage = filtered[0] || '';
        }
        updatedGallery = filtered;
      }
    } else if (collectionName === 'wah_governorates') {
      const gov = memoryDb.governorates.find((g) => g.id === entityId || g.slug === entityId);
      if (gov && (gov as any).gallery) {
        (gov as any).gallery = (gov as any).gallery.filter((img: string) => img !== targetClean && img.split('?')[0] !== targetPath);
        updatedGallery = (gov as any).gallery;
      }
    } else if (collectionName === 'wah_stories') {
      const story = memoryDb.wahStories.find((s) => s.id === entityId || s.slug === entityId);
      if (story && (story as any).gallery) {
        (story as any).gallery = (story as any).gallery.filter((img: string) => img !== targetClean && img.split('?')[0] !== targetPath);
        updatedGallery = (story as any).gallery;
      }
    }

    // Safely delete Cloudinary asset if public ID is extracted
    const publicId = extractCloudinaryPublicId(targetClean);
    if (publicId && isCloudinaryAvailable()) {
      try {
        ensureCloudinaryConfig();
        await cloudinary.uploader.destroy(publicId);
        Logger.info(`[MediaService] Cloudinary destroyed asset on gallery removal: ${publicId}`);
      } catch (cloudErr) {
        Logger.warn('[MediaService] Cloudinary destroy on gallery removal error:', cloudErr);
      }
    }

    // Also remove from media assets collection
    if (isMongo && db) {
      await db.collection('wah_media').deleteMany({
        $or: [{ url: targetClean }, { secureUrl: targetClean }, { url: targetPath }, { secureUrl: targetPath }]
      });
    }
    memoryDb.media = memoryDb.media.filter(
      (m) => m.url !== targetClean && m.secureUrl !== targetClean && m.url !== targetPath && m.secureUrl !== targetPath
    );

    return { success: true, message: 'تم حذف الصورة من معرض المكان بنجاح', gallery: updatedGallery };
  }

  if (action === 'updateGallery' && Array.isArray(galleryUrls)) {
    if (isMongo && db) {
      await db.collection(collectionName).updateOne(filter, {
        $set: { gallery: galleryUrls, galleryImages: galleryUrls, updatedAt: new Date().toISOString() }
      });
    }
    if (collectionName === 'wah_heritage_places') {
      const place = memoryDb.heritagePlaces.find((p) => p.id === entityId || p.slug === entityId);
      if (place) {
        place.gallery = [...galleryUrls];
        (place as any).galleryImages = [...galleryUrls];
      }
    } else if (collectionName === 'wah_cultural_crafts') {
      const craft = memoryDb.culturalCrafts.find((c) => c.id === entityId || c.slug === entityId);
      if (craft) craft.gallery = [...galleryUrls];
    } else if (collectionName === 'wah_governorates') {
      const gov = memoryDb.governorates.find((g) => g.id === entityId || g.slug === entityId);
      if (gov) (gov as any).gallery = [...galleryUrls];
    } else if (collectionName === 'wah_stories') {
      const story = memoryDb.wahStories.find((s) => s.id === entityId || s.slug === entityId);
      if (story) (story as any).gallery = [...galleryUrls];
    }
    return { success: true, message: 'تم تحديث صور المعرض بنجاح', gallery: galleryUrls };
  }

  return { success: false, message: 'إجراء غير معروف أو بيانات غير مكتملة' };
}

/**
 * Reassigns an image asset to another entity or updates its slug/folder.
 */
export async function reassignMediaEntity(options: {
  mediaId: string;
  targetEntityType: string;
  targetEntityId?: string;
  targetEntitySlug?: string;
  user: { id: string; role: UserRole };
}): Promise<MediaAssetDoc | null> {
  const { mediaId, targetEntityType, targetEntityId, targetEntitySlug, user } = options;

  if (!user || user.role !== 'admin') {
    throw new Error('عفواً، هذه العملية مخصصة لمدراء النظام فقط');
  }

  const { db, isMongo } = await getDatabase();
  let mediaDoc: MediaAssetDoc | null = null;

  if (isMongo && db) {
    mediaDoc = await db.collection<MediaAssetDoc>('wah_media').findOne(buildMediaIdFilter(mediaId));
  }
  if (!mediaDoc) {
    mediaDoc = memoryDb.media.find((m) => m.id === mediaId) || null;
  }

  if (!mediaDoc) {
    throw new Error('سجل الصورة المطلوب غير موجود');
  }

  const newFolder = getCloudinaryFolder(targetEntityType, targetEntitySlug || targetEntityId);

  const updateFields: Partial<MediaAssetDoc> = {
    entityType: targetEntityType,
    entityId: targetEntityId,
    entitySlug: sanitizeSlug(targetEntitySlug),
    folder: newFolder,
    category: targetEntityType as any,
    updatedAt: new Date().toISOString()
  };

  if (isMongo && db) {
    await db.collection<MediaAssetDoc>('wah_media').updateOne(
      { $or: [{ id: mediaId }, { _id: mediaId } as any] },
      { $set: updateFields }
    );
  }

  const idx = memoryDb.media.findIndex((m) => m.id === mediaId);
  if (idx !== -1) {
    memoryDb.media[idx] = { ...memoryDb.media[idx], ...updateFields };
  }

  return { ...mediaDoc, ...updateFields };
}

/**
 * Lists media items with search, filters, pagination, and sorting.
 */
export async function getAdminMediaList(options: GetMediaFilterOptions) {
  const { search, entityType, folder, entityId, resourceType, page = 1, limit = 24, sort = 'newest' } = options;
  const { db, isMongo } = await getDatabase();

  const skip = (Math.max(1, page) - 1) * limit;

  if (isMongo && db) {
    const filter: any = {};

    if (entityType && entityType !== 'all') {
      filter.entityType = { $regex: new RegExp(`^${entityType}$`, 'i') };
    }

    if (folder && folder !== 'all') {
      filter.folder = { $regex: new RegExp(folder, 'i') };
    }

    if (entityId) {
      filter.entityId = entityId;
    }

    if (resourceType && resourceType !== 'all') {
      filter.$or = [{ type: resourceType }, { resourceType: resourceType }];
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      const searchConditions = [
        { title: { $regex: q, $options: 'i' } },
        { alt: { $regex: q, $options: 'i' } },
        { caption: { $regex: q, $options: 'i' } },
        { publicId: { $regex: q, $options: 'i' } },
        { entitySlug: { $regex: q, $options: 'i' } },
        { folder: { $regex: q, $options: 'i' } }
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    let sortObj: any = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    if (sort === 'size_desc') sortObj = { sizeBytes: -1 };
    if (sort === 'size_asc') sortObj = { sizeBytes: 1 };

    const [total, items] = await Promise.all([
      db.collection('wah_media').countDocuments(filter),
      db
        .collection<MediaAssetDoc>('wah_media')
        .find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .toArray()
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  // In-memory fallback
  let list = [...memoryDb.media];
  if (entityType && entityType !== 'all') {
    list = list.filter((m) => m.entityType?.toLowerCase() === entityType.toLowerCase());
  }
  if (folder && folder !== 'all') {
    list = list.filter((m) => m.folder?.toLowerCase().includes(folder.toLowerCase()));
  }
  if (entityId) {
    list = list.filter((m) => m.entityId === entityId);
  }
  if (resourceType && resourceType !== 'all') {
    list = list.filter((m) => m.type === resourceType || (m as any).resourceType === resourceType);
  }
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (m) =>
        m.title?.toLowerCase().includes(q) ||
        m.alt?.toLowerCase().includes(q) ||
        m.publicId?.toLowerCase().includes(q) ||
        m.entitySlug?.toLowerCase().includes(q)
    );
  }

  if (sort === 'oldest') {
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (sort === 'size_desc') {
    list.sort((a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0));
  } else if (sort === 'size_asc') {
    list.sort((a, b) => (a.sizeBytes || 0) - (b.sizeBytes || 0));
  } else {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const total = list.length;
  const items = list.slice(skip, skip + limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1
  };
}
