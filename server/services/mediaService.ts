import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import { ObjectId } from 'mongodb';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { validateImage } from '../utils/imageValidator.ts';
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
    } catch {}
  }
  return { $or: filter };
}

export interface UploadAdminMediaOptions {
  data: Buffer | string; // Buffer or Base64 string
  filename?: string;
  mimeType?: string;
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
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'size_desc' | 'size_asc';
}

/**
 * Maps entity type to the corresponding MongoDB collection name
 */
function getEntityCollectionName(entityType: string): string | null {
  const norm = entityType.toLowerCase();
  if (norm === 'province' || norm === 'provinces' || norm === 'governorate' || norm === 'governorates') {
    return 'wah_governorates';
  }
  if (
    norm === 'archaeologicalsite' ||
    norm === 'archaeological-site' ||
    norm === 'place' ||
    norm === 'heritageplace' ||
    norm === 'places' ||
    norm === 'museum' ||
    norm === 'religioussite' ||
    norm === 'naturalreserve'
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
  return null;
}

/**
 * Updates an entity's coverImage or gallery in its MongoDB collection
 */
async function syncMediaWithEntity(
  entityType: string,
  entityId: string,
  secureUrl: string,
  isPrimary?: boolean,
  addToGallery?: boolean
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

  // 2. Validate Image Content & Format
  const validation = validateImage(data, filename, mimeType);
  if (!validation.valid) {
    throw new Error(validation.error || 'ملف الصورة غير صالح أو يتجاوز الحجم المسموح');
  }

  // 3. Resolve Standardized Cloudinary Folder via Whitelisted Central Function
  const targetFolder = getCloudinaryFolder(entityType, entitySlug || entityId);

  if (!isCloudinaryAvailable()) {
    throw new Error('خدمة Cloudinary غير مهيأة أو غير متوفرة في بيئة العمل');
  }

  ensureCloudinaryConfig();

  // 4. Generate Safe Public ID
  const cleanName = sanitizeSlug(filename.replace(/\.[^/.]+$/, '')) || 'img';
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const publicId = `${cleanName}_${uniqueSuffix}`;

  // 5. Prepare Payload & Upload Options
  let uploadPayload: string | Buffer;
  if (Buffer.isBuffer(data)) {
    uploadPayload = data;
  } else if (typeof data === 'string') {
    if (data.startsWith('data:')) {
      uploadPayload = data;
    } else {
      uploadPayload = `data:${validation.mimeType || 'image/jpeg'};base64,${data}`;
    }
  } else {
    throw new Error('صيغة بيانات الصورة غير مدعومة');
  }

  const uploadOptions: any = {
    folder: targetFolder,
    public_id: publicId,
    overwrite: false,
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  };

  let uploadResult: UploadApiResponse;

  try {
    if (Buffer.isBuffer(uploadPayload)) {
      uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, res) => {
          if (err || !res) {
            reject(err || new Error('فشل رفع الصورة إلى Cloudinary'));
          } else {
            resolve(res);
          }
        });
        stream.end(uploadPayload);
      });
    } else {
      uploadResult = await cloudinary.uploader.upload(uploadPayload, uploadOptions);
    }
  } catch (cloudErr: any) {
    Logger.error('[MediaService] Cloudinary upload error:', cloudErr?.message || cloudErr);
    throw new Error(cloudErr?.message || 'فشل في رفع الصورة إلى خدمة التخزين السحابي Cloudinary');
  }

  // 6. Construct Media Document
  const mediaId = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const suggestedAlt = alt || `${filename || 'صورة'} - منصة وه للتراث`;

  const mediaDoc: any = {
    _id: mediaId,
    id: mediaId,
    title: suggestedAlt,
    url: uploadResult.secure_url,
    secureUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    folder: targetFolder,
    type: 'image',
    category: (entityType as any) || 'general',
    entityType,
    entityId: entityId || undefined,
    entitySlug: sanitizeSlug(entitySlug) || undefined,
    uploadedBy: user.id,
    uploaderRole: 'admin',
    sizeBytes: uploadResult.bytes || validation.sizeBytes || 0,
    bytes: uploadResult.bytes || validation.sizeBytes || 0,
    width: uploadResult.width,
    height: uploadResult.height,
    format: uploadResult.format,
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
      await cloudinary.uploader.destroy(oldPublicId);
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
      const res = await cloudinary.uploader.destroy(targetPublicId);
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
        Logger.info(`[MediaService] Cleaned up entity references for ${mediaDoc.entityId} in ${collectionName}`);
      } catch (syncErr) {
        Logger.warn('[MediaService] Entity reference cleanup error:', syncErr);
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
  if (isMongo && db) {
    await db.collection(collectionName).updateOne(
      { $or: [{ id: entityId }, { _id: entityId } as any] },
      { $set: { gallery: galleryUrls, updatedAt: new Date().toISOString() } }
    );
  }

  return { success: true, gallery: galleryUrls };
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
  const { search, entityType, folder, entityId, page = 1, limit = 24, sort = 'newest' } = options;
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

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { alt: { $regex: q, $options: 'i' } },
        { caption: { $regex: q, $options: 'i' } },
        { publicId: { $regex: q, $options: 'i' } },
        { entitySlug: { $regex: q, $options: 'i' } },
        { folder: { $regex: q, $options: 'i' } }
      ];
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
