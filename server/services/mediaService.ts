import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import { ObjectId } from 'mongodb';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { validateImage, validateVideo } from '../utils/imageValidator.ts';
import { getCloudinaryFolder, sanitizeSlug } from '../utils/cloudinaryFolders.ts';
import { cloudinaryStorage, isCloudinaryAvailable, extractCloudinaryPublicId } from './storage/cloudinaryProvider.ts';
import { Logger } from '../utils/logger.ts';
import type { MediaAssetDoc, UserRole } from '../models/types.ts';

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

export function buildEntityFilter(entityId: string) {
  const filter: any[] = [
    { id: entityId },
    { slug: entityId },
    { _id: entityId }
  ];

  if (ObjectId.isValid(entityId) && entityId.length === 24) {
    try {
      filter.push({ _id: new ObjectId(entityId) });
    } catch { }
  }

  return { $or: filter };
}

export interface UploadAdminMediaOptions {
  data?: Buffer | string;
  url?: string; // دعم الرفع عبر الرابط المباشر
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
  resourceType?: 'image' | 'video';
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
  const filter = buildEntityFilter(entityId);

  if (isMongo && db) {
    try {
      const updateFields: any = {};
      const pushFields: any = {};

      if (resourceType === 'video') {
        updateFields.videoUrl = secureUrl;
        pushFields.videos = secureUrl;
      } else {
        if (isPrimary) {
          if (entityType.toLowerCase().includes('person')) {
            updateFields.avatarUrl = secureUrl;
          } else {
            updateFields.coverImage = secureUrl;
            updateFields.imageUrl = secureUrl;
          }
        }

        if (addToGallery) {
          pushFields.gallery = secureUrl;
          pushFields.galleryImages = secureUrl;
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
      }
    } catch (err) {
      Logger.error(`[MediaSync] Failed to sync media with entity in ${collectionName}:`, err);
    }
  }

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

export async function uploadAdminMedia(options: UploadAdminMediaOptions): Promise<MediaAssetDoc> {
  const {
    data,
    url: externalUrl,
    filename = 'media_file',
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

  if (!user || user.role !== 'admin') {
    throw new Error('عفواً، هذه العملية مخصصة لمدراء النظام فقط');
  }

  if (!isCloudinaryAvailable()) {
    throw new Error('خدمة Cloudinary غير مهيأة أو غير متوفرة في بيئة العمل');
  }

  ensureCloudinaryConfig();

  const isVideo =
    options.resourceType === 'video' ||
    Boolean(mimeType && mimeType.toLowerCase().startsWith('video/')) ||
    filename.toLowerCase().endsWith('.mp4') ||
    filename.toLowerCase().endsWith('.webm') ||
    filename.toLowerCase().endsWith('.mov') ||
    filename.toLowerCase().endsWith('.ogg') ||
    filename.toLowerCase().endsWith('.mkv') ||
    Boolean(
      externalUrl &&
      (externalUrl.toLowerCase().match(/\.(mp4|webm|mov|ogg|mkv|3gp|m4v)(\?.*)?$/i) ||
        externalUrl.toLowerCase().includes('/video/upload/') ||
        externalUrl.toLowerCase().includes('resource_type=video'))
    ) ||
    entityType === 'video' ||
    entityType === 'videos';

  const targetFolder = isVideo
    ? getCloudinaryFolder({ entityType, entitySlug: entitySlug || entityId, resourceType: 'video' })
    : getCloudinaryFolder(entityType, entitySlug || entityId);

  const cleanName = sanitizeSlug(filename.replace(/\.[^/.]+$/, '')) || (isVideo ? 'vid' : 'img');
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const publicId = `${cleanName}_${uniqueSuffix}`;

  let uploadResult: UploadApiResponse;

  // دعم الرفع المباشر عبر الرابط الخارجي (URL)
  if (!data && externalUrl) {
    const trimmedUrl = externalUrl.trim();
    if (!trimmedUrl.startsWith('https://') && !trimmedUrl.startsWith('http://')) {
      throw new Error('الرابط غير آمن. يسمح فقط بروابط تبدأ بـ http:// أو https://');
    }

    try {
      uploadResult = await cloudinary.uploader.upload(trimmedUrl, {
        folder: targetFolder,
        public_id: publicId,
        resource_type: isVideo ? 'video' : 'image',
        ...(isVideo
          ? {
            chunk_size: 20000000,
            timeout: 600000
          }
          : {})
      });
    } catch (urlErr: any) {
      Logger.error('[MediaService] External URL upload error:', urlErr?.message || urlErr);
      throw new Error('فشل جلب وتحميل الملف من الرابط الخارجي المزود');
    }
  } else {
    // الرفع العادي للملفات (Buffers أو Base64)
    if (!data) {
      throw new Error('يرجى توفير ملف للرفع أو رابط خارجي صالح');
    }

    const validation = isVideo
      ? validateVideo(data, filename, mimeType)
      : validateImage(data, filename, mimeType);

    if (!validation.valid) {
      throw new Error(validation.error || (isVideo ? 'ملف الفيديو غير صالح أو يتجاوز الحجم المسموح' : 'ملف الصورة غير صالح أو يتجاوز الحجم المسموح'));
    }

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
          chunk_size: 20000000, // رفع حجم الجزء الواحد إلى 20MB لزيادة سرعة الرفع وتجنب التايم آوت
          timeout: 600000
        }
        : {
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'webm'],
          transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        })
    };

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
  }

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
    sizeBytes: uploadResult.bytes || 0,
    bytes: uploadResult.bytes || 0,
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

  try {
    const { db, isMongo } = await getDatabase();
    if (isMongo && db) {
      await db.collection<MediaAssetDoc>('wah_media').insertOne({ ...mediaDoc } as any);
    }
    memoryDb.media.unshift(mediaDoc);

    if (entityId) {
      await syncMediaWithEntity(entityType, entityId, uploadResult.secure_url, isPrimary, addToGallery, isVideo ? 'video' : 'image');
    }

    return mediaDoc;
  } catch (dbErr: any) {
    try {
      await cloudinary.uploader.destroy(mediaDoc.publicId!);
    } catch (cleanupErr) { }
    throw new Error('فشل حفظ بيانات الوسائط في قاعدة البيانات بعد الرفع');
  }
}

export async function saveExternalUrlMedia(options: ExternalUrlMediaOptions): Promise<MediaAssetDoc> {
  return uploadAdminMedia({
    url: options.url,
    resourceType: options.resourceType,
    entityType: options.entityType,
    entitySlug: options.entitySlug,
    entityId: options.entityId,
    alt: options.alt,
    caption: options.caption,
    isPrimary: options.isPrimary,
    addToGallery: options.addToGallery,
    user: options.user
  });
}

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
    await db.collection('wah_media').deleteOne(buildMediaIdFilter(newMedia.id));
  }

  const idx = memoryDb.media.findIndex((m) => m.id === mediaId);
  if (idx !== -1) {
    memoryDb.media[idx] = { ...memoryDb.media[idx], ...updatedDoc };
  }
  memoryDb.media = memoryDb.media.filter((m) => m.id !== newMedia.id);

  if (oldPublicId) {
    try {
      const destroyOpts: any = {};
      if (existingMedia.type === 'video' || existingMedia.resourceType === 'video') {
        destroyOpts.resource_type = 'video';
      }
      await cloudinary.uploader.destroy(oldPublicId, destroyOpts);
    } catch (destroyErr) { }
  }

  return { ...existingMedia, ...updatedDoc } as MediaAssetDoc;
}

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

  if (targetPublicId && isCloudinaryAvailable()) {
    ensureCloudinaryConfig();
    try {
      const destroyOpts: any = {};
      if (mediaDoc?.type === 'video' || mediaDoc?.resourceType === 'video') {
        destroyOpts.resource_type = 'video';
      }
      await cloudinary.uploader.destroy(targetPublicId, destroyOpts);
    } catch (cloudErr) { }
  }

  if (isMongo && db) {
    await db.collection('wah_media').deleteMany(buildMediaIdFilter(mediaIdOrPublicId));
  }

  memoryDb.media = memoryDb.media.filter(
    (m) =>
      m.id !== mediaIdOrPublicId &&
      m.publicId !== targetPublicId &&
      m.url !== targetUrl &&
      m.secureUrl !== targetUrl
  );

  return true;
}

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

  const idx = memoryDb.media.findIndex((m) => m.id === mediaId);
  if (idx !== -1) {
    memoryDb.media[idx] = { ...memoryDb.media[idx], ...setObj };
    if (!updatedDoc) updatedDoc = memoryDb.media[idx];
  }

  if (updates.isPrimary && updatedDoc?.entityType && updatedDoc?.entityId && updatedDoc.secureUrl) {
    await syncMediaWithEntity(updatedDoc.entityType, updatedDoc.entityId, updatedDoc.secureUrl, true);
  }

  return updatedDoc;
}

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

  return await updateAdminMediaMetadata(mediaId, { isPrimary: true }, user);
}

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

  const collectionName = getEntityCollectionName(entityType);
  if (!collectionName) {
    throw new Error(`نوع الكيان ${entityType} غير مدعوم للمعرض`);
  }

  const { db, isMongo } = await getDatabase();
  const filter = buildEntityFilter(entityId);

  if (isMongo && db) {
    await db.collection(collectionName).updateOne(
      filter,
      { $set: { gallery: galleryUrls, galleryImages: galleryUrls, updatedAt: new Date().toISOString() } }
    );
  }

  return { success: true, gallery: galleryUrls };
}

export async function manageEntityGallery(options: {
  entityType: string;
  entityId: string;
  action: 'add' | 'remove' | 'setCover' | 'updateGallery' | 'setVideo' | 'removeVideo';
  imageUrl?: string;
  videoUrl?: string;
  galleryUrls?: string[];
  coverImage?: string;
  user: { id: string; role: UserRole };
}): Promise<{
  success: boolean;
  message: string;
  coverImage?: string;
  gallery?: string[];
  videoUrl?: string | null;
  videos?: string[];
}> {
  const { entityType, entityId, action, imageUrl, videoUrl, galleryUrls, coverImage, user } = options;

  if (!user || user.role !== 'admin') {
    throw new Error('عفواً، هذه العملية مخصصة لمدراء النظام فقط');
  }

  const collectionName = getEntityCollectionName(entityType);
  if (!collectionName) {
    throw new Error(`نوع الكيان ${entityType} غير مدعوم للمعرض`);
  }

  const { db, isMongo } = await getDatabase();
  const filter = buildEntityFilter(entityId);

  let updatedGallery: string[] = [];
  let updatedCover: string | undefined;

  if (action === 'setCover' && imageUrl) {
    updatedCover = imageUrl;
    if (isMongo && db) {
      await db.collection(collectionName).updateOne(filter, {
        $set: { coverImage: imageUrl, imageUrl: imageUrl, updatedAt: new Date().toISOString() }
      });
    }
    return { success: true, message: 'تم تعيين الصورة كصورة رئيسية بنجاح', coverImage: imageUrl };
  }

  if (action === 'setVideo' && (videoUrl || imageUrl)) {
    const targetVideo = videoUrl || imageUrl;
    if (isMongo && db) {
      await db.collection(collectionName).updateOne(filter, {
        $set: { videoUrl: targetVideo, updatedAt: new Date().toISOString() },
        $addToSet: { videos: targetVideo } as any
      });
    }
    return { success: true, message: 'تم حفظ مقطع الفيديو التوثيقي بنجاح', videoUrl: targetVideo };
  }

  if (action === 'removeVideo') {
    const targetVideo = videoUrl || imageUrl;
    if (isMongo && db) {
      const updateDoc: any = { $set: { updatedAt: new Date().toISOString() } };
      if (!targetVideo) updateDoc.$set.videoUrl = null;
      if (targetVideo) updateDoc.$pull = { videos: targetVideo };
      await db.collection(collectionName).updateOne(filter, updateDoc);
    }
    return { success: true, message: 'تم إزالة مقطع الفيديو بنجاح', videoUrl: null };
  }

  if (action === 'add' && imageUrl) {
    if (isMongo && db) {
      await db.collection(collectionName).updateOne(filter, {
        $addToSet: { gallery: imageUrl, galleryImages: imageUrl } as any,
        $set: { updatedAt: new Date().toISOString() }
      });
    }
    return { success: true, message: 'تمت إضافة الصورة إلى المعرض بنجاح', gallery: updatedGallery };
  }

  if (action === 'remove' && imageUrl) {
    if (isMongo && db) {
      await db.collection(collectionName).updateOne(filter, {
        $pull: { gallery: imageUrl, galleryImages: imageUrl } as any,
        $set: { updatedAt: new Date().toISOString() }
      });
    }
    return { success: true, message: 'تم حذف الصورة من معرض المكان بنجاح', gallery: updatedGallery };
  }

  if (action === 'updateGallery' && Array.isArray(galleryUrls)) {
    const updateFields: any = {
      gallery: galleryUrls,
      galleryImages: galleryUrls,
      updatedAt: new Date().toISOString()
    };
    if (coverImage) {
      updateFields.coverImage = coverImage;
      updateFields.imageUrl = coverImage;
    }
    if (isMongo && db) {
      await db.collection(collectionName).updateOne(filter, { $set: updateFields });
    }
    return { success: true, message: 'تم تحديث صور المعرض بنجاح', gallery: galleryUrls, coverImage: coverImage || updatedCover };
  }

  return { success: false, message: 'إجراء غير معروف أو بيانات غير مكتملة' };
}

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

  return { ...mediaDoc, ...updateFields };
}

export async function getAdminMediaList(options: GetMediaFilterOptions) {
  const { search, entityType, folder, entityId, resourceType, page = 1, limit = 24, sort = 'newest' } = options;
  const { db, isMongo } = await getDatabase();
  const skip = (Math.max(1, page) - 1) * limit;

  if (isMongo && db) {
    const filter: any = {};
    if (entityType && entityType !== 'all') filter.entityType = { $regex: new RegExp(`^${entityType}$`, 'i') };
    if (folder && folder !== 'all') filter.folder = { $regex: new RegExp(folder, 'i') };
    if (entityId) filter.entityId = entityId;
    if (resourceType && resourceType !== 'all') filter.$or = [{ type: resourceType }, { resourceType: resourceType }];

    let sortObj: any = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    if (sort === 'size_desc') sortObj = { sizeBytes: -1 };
    if (sort === 'size_asc') sortObj = { sizeBytes: 1 };

    const [total, items] = await Promise.all([
      db.collection('wah_media').countDocuments(filter),
      db.collection<MediaAssetDoc>('wah_media').find(filter).sort(sortObj).skip(skip).limit(limit).toArray()
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  return { items: [], total: 0, page, limit, totalPages: 1 };
}