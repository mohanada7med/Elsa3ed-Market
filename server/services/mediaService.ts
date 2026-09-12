import fs from 'fs';
import os from 'os';
import path from 'path';
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

export function buildEntityFilter(entityId: string, entitySlug?: string) {
  const filter: any[] = [
    { id: entityId },
    { slug: entityId },
    { _id: entityId }
  ];

  if (entitySlug && entitySlug !== entityId) {
    filter.push({ slug: entitySlug });
    filter.push({ id: entitySlug });
  }

  if (ObjectId.isValid(entityId) && entityId.length === 24) {
    try {
      filter.push({ _id: new ObjectId(entityId) });
    } catch { }
  }

  if (entitySlug && ObjectId.isValid(entitySlug) && entitySlug.length === 24) {
    try {
      filter.push({ _id: new ObjectId(entitySlug) });
    } catch { }
  }

  return { $or: filter };
}

function findMemoryEntity(collectionName: string, entityId: string, entitySlug?: string): any {
  const match = (item: any) =>
    item &&
    (item.id === entityId ||
      item.slug === entityId ||
      (entitySlug && (item.slug === entitySlug || item.id === entitySlug)));

  if (collectionName === 'wah_heritage_places') return memoryDb.heritagePlaces.find(match) || null;
  if (collectionName === 'wah_cultural_crafts') return memoryDb.culturalCrafts.find(match) || null;
  if (collectionName === 'wah_stories') return memoryDb.wahStories.find(match) || null;
  if (collectionName === 'wah_people') return memoryDb.localPeople.find(match) || null;
  if (collectionName === 'wah_foods') return memoryDb.upperEgyptFood.find(match) || null;
  if (collectionName === 'wah_events') return memoryDb.culturalEvents.find(match) || null;
  if (collectionName === 'wah_governorates') return memoryDb.governorates.find(match) || null;
  return null;
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

/**
 * Removes any association of this media URL or publicId from other heritage places
 * ensuring strict 1-to-1 place binding so videos/images are never duplicated across places.
 */
export async function unbindMediaFromOtherEntities(
  urlOrPublicId: string,
  currentEntityType?: string,
  currentEntityId?: string
): Promise<void> {
  if (!urlOrPublicId || !urlOrPublicId.trim()) return;
  const cleanUrl = urlOrPublicId.trim();
  const cleanBasePath = cleanUrl.split('?')[0];
  const publicId = extractCloudinaryPublicId(cleanUrl);

  const targets = [cleanUrl, cleanBasePath];
  if (publicId) targets.push(publicId);

  const { db, isMongo } = await getDatabase();

  try {
    if (isMongo && db) {
      const otherPlacesFilter: any = {
        $or: [
          { videoUrl: { $in: targets } },
          { videos: { $in: targets } },
          { gallery: { $in: targets } },
          { galleryImages: { $in: targets } }
        ]
      };
      if (currentEntityId) {
        otherPlacesFilter.id = { $ne: currentEntityId };
        otherPlacesFilter.slug = { $ne: currentEntityId };
      }

      const otherPlaces = await db.collection('wah_heritage_places').find(otherPlacesFilter).toArray();
      for (const p of otherPlaces) {
        const remainingVideos = (p.videos || []).filter((v: string) => !targets.includes(v));
        const remainingGallery = (p.gallery || []).filter((g: string) => !targets.includes(g));
        const updateDoc: any = {
          $pull: {
            videos: { $in: targets },
            gallery: { $in: targets },
            galleryImages: { $in: targets }
          } as any,
          $set: { updatedAt: new Date().toISOString() }
        };
        if (targets.includes(p.videoUrl)) {
          updateDoc.$set.videoUrl = remainingVideos[0] || null;
        }
        if (targets.includes(p.coverImage)) {
          updateDoc.$set.coverImage = remainingGallery[0] || null;
          updateDoc.$set.imageUrl = remainingGallery[0] || null;
        }
        await db.collection('wah_heritage_places').updateOne({ _id: p._id }, updateDoc);
        if (targets.includes(p.videoUrl)) {
          await removeEntityReel({ entityId: p.id, videoUrl: p.videoUrl });
        }
      }
    }

    // Unbind from memoryDb
    for (const p of memoryDb.heritagePlaces) {
      if (currentEntityId && (p.id === currentEntityId || p.slug === currentEntityId)) {
        continue;
      }
      let modified = false;
      if (p.videoUrl && targets.includes(p.videoUrl)) {
        p.videos = (p.videos || []).filter((v: string) => !targets.includes(v));
        p.videoUrl = p.videos[0] || undefined;
        modified = true;
      } else if (p.videos && p.videos.some((v: string) => targets.includes(v))) {
        p.videos = p.videos.filter((v: string) => !targets.includes(v));
        modified = true;
      }
      if (p.gallery && p.gallery.some((g: string) => targets.includes(g))) {
        p.gallery = p.gallery.filter((g: string) => !targets.includes(g));
        modified = true;
      }
      if (p.galleryImages && p.galleryImages.some((g: string) => targets.includes(g))) {
        p.galleryImages = p.galleryImages.filter((g: string) => !targets.includes(g));
        modified = true;
      }
      if (p.coverImage && targets.includes(p.coverImage)) {
        p.coverImage = p.gallery?.[0] || '';
        (p as any).imageUrl = p.coverImage;
        modified = true;
      }
      if (modified) {
        memoryDb.reels = memoryDb.reels.filter(
          (r) => r.id !== `reel-place-${p.id}` && !targets.includes(r.videoUrl)
        );
      }
    }
  } catch (err) {
    Logger.error('[MediaSync] Error unbinding media from other entities:', err);
  }
}

/**
 * Synchronizes a place video with the global Reels feed.
 * Ensures the video appears in Reels without duplicates.
 */
export async function syncEntityReel(params: {
  entityType?: string;
  entityId?: string;
  entitySlug?: string;
  videoUrl: string;
  publicId?: string;
  duration?: number | string;
  title?: string;
  description?: string;
  coverImage?: string;
}): Promise<void> {
  try {
    const { videoUrl, entityType, entityId, entitySlug } = params;
    if (!videoUrl || !videoUrl.trim()) return;
    const cleanUrl = videoUrl.trim();
    const publicId = params.publicId || extractCloudinaryPublicId(cleanUrl) || undefined;

    const { db, isMongo } = await getDatabase();
    let entityDoc: any = null;
    const targetKey = entityId || entitySlug;

    if (entityType === 'heritage-place' || !entityType || entityType === 'place') {
      if (isMongo && db && targetKey) {
        entityDoc = await db.collection('wah_heritage_places').findOne(buildEntityFilter(targetKey, entitySlug));
      }
      if (!entityDoc && targetKey) {
        entityDoc = memoryDb.heritagePlaces.find((p) => p.id === targetKey || p.slug === targetKey);
      }
    } else if (entityType === 'cultural-craft' || entityType === 'craft') {
      if (isMongo && db && targetKey) {
        entityDoc = await db.collection('wah_cultural_crafts').findOne(buildEntityFilter(targetKey, entitySlug));
      }
      if (!entityDoc && targetKey) {
        entityDoc = memoryDb.culturalCrafts.find((c) => c.id === targetKey || c.slug === targetKey);
      }
    }

    const placeId = entityDoc?.id || entityId || entitySlug || 'place';
    const reelId = `reel-place-${placeId}`;
    const placeTitle = entityDoc?.title || entityDoc?.name || params.title || 'معلم أثري وتراثي';
    const placeCover = entityDoc?.coverImage || entityDoc?.imageUrl || params.coverImage || '';
    const placeGov = entityDoc?.governorate || 'الصعيد';
    const placeLoc = entityDoc?.location || entityDoc?.city || placeGov || 'مصر';

    let poster = placeCover;
    if ((!poster || poster.endsWith('.mp4') || poster.endsWith('.mov')) && cleanUrl.includes('/video/upload/')) {
      poster = cleanUrl
        .replace('/video/upload/', '/video/upload/so_0,f_auto,q_auto,w_800,c_limit/')
        .replace(/\.[^/.]+$/, '.jpg');
    }

    const reelDoc: any = {
      id: reelId,
      title: placeTitle,
      contentType: 'heritage_site',
      location: placeLoc,
      artisanName: 'توثيق تراثي',
      artisanAvatar: poster || undefined,
      workshopName: placeTitle,
      governorate: placeGov,
      craftType: 'معلم أثري وتراثي',
      videoUrl: cleanUrl,
      cloudinaryPublicId: publicId,
      posterUrl: poster || '',
      duration:
        typeof params.duration === 'string'
          ? params.duration
          : params.duration
            ? `${Math.floor(params.duration / 60)}:${Math.floor(params.duration % 60).toString().padStart(2, '0')}`
            : '0:30',
      likesCount: entityDoc?.likesCount || 15,
      viewsCount: entityDoc?.viewsCount || 120,
      sharesCount: 6,
      description:
        entityDoc?.description || entityDoc?.shortDescription || params.description || `جولة توثيقية في رحاب ${placeTitle}`,
      hashtags: ['#تراث_الصعيد', '#معالم_مصر', `#${placeGov.replace(/\s+/g, '_')}`],
      isFeatured: true,
      createdAt: entityDoc?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isMongo && db) {
      // Delete any reel already matching this videoUrl or reelId to avoid duplicates
      await db.collection('reels').deleteMany({
        $or: [{ id: reelId }, { videoUrl: cleanUrl }]
      });
      await db.collection('reels').insertOne(reelDoc);
    }

    // Memory DB sync without duplicates
    memoryDb.reels = memoryDb.reels.filter((r) => r.id !== reelId && r.videoUrl !== cleanUrl);
    memoryDb.reels.unshift(reelDoc);

    Logger.info(`[MediaSync] Reel successfully synced for place: ${placeTitle} (${reelId})`);
  } catch (err) {
    Logger.error('[MediaSync] Failed to sync entity reel:', err);
  }
}

/**
 * Removes the place reel from the Reels feed and database when a video is removed or deleted.
 */
export async function removeEntityReel(params: {
  entityId?: string;
  entitySlug?: string;
  videoUrl?: string;
}): Promise<void> {
  try {
    const { entityId, videoUrl } = params;
    const { db, isMongo } = await getDatabase();
    const reelId = entityId ? `reel-place-${entityId}` : undefined;
    const cleanUrl = videoUrl?.trim();

    const orConditions: any[] = [];
    if (reelId) orConditions.push({ id: reelId });
    if (cleanUrl) orConditions.push({ videoUrl: cleanUrl });

    if (orConditions.length > 0) {
      if (isMongo && db) {
        await db.collection('reels').deleteMany({ $or: orConditions });
      }
      memoryDb.reels = memoryDb.reels.filter((r) => {
        if (reelId && r.id === reelId) return false;
        if (cleanUrl && r.videoUrl === cleanUrl) return false;
        return true;
      });
    }
    Logger.info(`[MediaSync] Reel removed for entity: ${entityId || videoUrl}`);
  } catch (err) {
    Logger.error('[MediaSync] Failed to remove entity reel:', err);
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
  const suggestedAlt = alt || `${filename || (isVideo ? 'فيديو' : 'صورة')} - منصة وه للتراث`;

  let uploadResult: UploadApiResponse;

  // دعم الرفع المباشر عبر الرابط الخارجي (URL)
  if (!data && externalUrl) {
    const trimmedUrl = externalUrl.trim();
    if (!trimmedUrl.startsWith('https://') && !trimmedUrl.startsWith('http://')) {
      throw new Error('الرابط غير آمن. يسمح فقط بروابط تبدأ بـ http:// أو https://');
    }

    const publicIdFromUrl = extractCloudinaryPublicId(trimmedUrl);
    const isCloudinaryUrl =
      Boolean(publicIdFromUrl) ||
      trimmedUrl.includes('res.cloudinary.com') ||
      trimmedUrl.includes('cloudinary.com') ||
      trimmedUrl.includes('/video/upload/') ||
      trimmedUrl.includes('/image/upload/');

    // إذا كان الرابط موجوداً بالفعل على Cloudinary: لا تعيد الرفع، بل اربطه بالكيان مباشرة!
    if (isCloudinaryUrl) {
      Logger.info(`[uploadAdminMedia] Reusing existing Cloudinary media: ${trimmedUrl} (publicId: ${publicIdFromUrl})`);

      // 1. فك ارتباط هذا الفيديو أو الصورة بأي مكان آخر (Strict 1-to-1)
      await unbindMediaFromOtherEntities(trimmedUrl, entityType, entityId || entitySlug);

      const targetPublicId = publicIdFromUrl || `WAH/${isVideo ? 'videos' : 'images'}/${cleanName}`;
      const { db, isMongo } = await getDatabase();

      // البحث عن سجل الوسيط في قاعدة البيانات
      let existingDoc: MediaAssetDoc | null = null;
      if (isMongo && db) {
        existingDoc = await db.collection<MediaAssetDoc>('wah_media').findOne({
          $or: [
            { url: trimmedUrl },
            { secureUrl: trimmedUrl },
            { publicId: targetPublicId }
          ]
        });
      }
      if (!existingDoc) {
        existingDoc =
          memoryDb.media.find(
            (m) => m.url === trimmedUrl || m.secureUrl === trimmedUrl || m.publicId === targetPublicId
          ) || null;
      }

      if (existingDoc) {
        // تحديث ارتباط السجل الحالي بالكيان الجديد
        const updateFields: any = {
          entityType,
          entityId: entityId || undefined,
          entitySlug: sanitizeSlug(entitySlug) || undefined,
          isPrimary: Boolean(isPrimary),
          status: 'verified',
          updatedAt: new Date().toISOString()
        };
        if (isMongo && db) {
          await db.collection('wah_media').updateOne({ _id: (existingDoc as any)._id }, { $set: updateFields });
        }
        Object.assign(existingDoc, updateFields);

        // مزامنة مع الكيان الجديد ومع الريلز
        if (entityId || entitySlug) {
          await syncMediaWithEntity(
            entityType,
            entityId || entitySlug!,
            trimmedUrl,
            isPrimary,
            addToGallery,
            isVideo ? 'video' : 'image'
          );
        }
        if (isVideo) {
          await syncEntityReel({
            entityType,
            entityId: entityId || entitySlug,
            entitySlug,
            videoUrl: trimmedUrl,
            publicId: targetPublicId,
            duration: (existingDoc as any).duration,
            title: alt || caption
          });
        }

        return existingDoc;
      }

      // إذا لم يكن مسجلاً في wah_media بعد، ننشئ له سجلاً فورياً دون إعادة رفع
      const mediaId = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newMediaDoc: any = {
        _id: mediaId,
        id: mediaId,
        title: suggestedAlt,
        url: trimmedUrl,
        secureUrl: trimmedUrl,
        publicId: targetPublicId,
        folder: targetPublicId.includes('/')
          ? targetPublicId.substring(0, targetPublicId.lastIndexOf('/'))
          : targetFolder,
        type: isVideo ? 'video' : 'image',
        resourceType: isVideo ? 'video' : 'image',
        category: (entityType as any) || (isVideo ? 'videos' : 'images'),
        entityType,
        entityId: entityId || undefined,
        entitySlug: sanitizeSlug(entitySlug) || undefined,
        uploadedBy: user.id,
        uploaderRole: 'admin',
        sizeBytes: 0,
        bytes: 0,
        format: isVideo ? 'mp4' : 'jpg',
        alt: suggestedAlt,
        caption: caption || '',
        isPrimary: Boolean(isPrimary),
        status: 'verified',
        metadata: {
          originalFilename: filename,
          isReusedCloudinaryAsset: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (isMongo && db) {
        await db.collection<MediaAssetDoc>('wah_media').insertOne({ ...newMediaDoc } as any);
      }
      memoryDb.media.unshift(newMediaDoc);

      if (entityId || entitySlug) {
        await syncMediaWithEntity(
          entityType,
          entityId || entitySlug!,
          trimmedUrl,
          isPrimary,
          addToGallery,
          isVideo ? 'video' : 'image'
        );
      }
      if (isVideo) {
        await syncEntityReel({
          entityType,
          entityId: entityId || entitySlug,
          entitySlug,
          videoUrl: trimmedUrl,
          publicId: targetPublicId,
          title: alt || caption
        });
      }

      return newMediaDoc;
    }

    // إذا كان رابطاً خارجياً من خارج Cloudinary، نرفعه مرة واحدة إلى Cloudinary
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
      if (isVideo) {
        let tempFilePath: string | null = null;
        try {
          if (Buffer.isBuffer(uploadPayload)) {
            tempFilePath = path.join(os.tmpdir(), `admin_vid_${Date.now()}_${publicId}.mp4`);
            fs.writeFileSync(tempFilePath, uploadPayload);
            uploadResult = (await cloudinary.uploader.upload_large(tempFilePath, uploadOptions)) as UploadApiResponse;
          } else {
            uploadResult = (await cloudinary.uploader.upload_large(uploadPayload, uploadOptions)) as UploadApiResponse;
          }
        } finally {
          if (tempFilePath && fs.existsSync(tempFilePath)) {
            try { fs.unlinkSync(tempFilePath); } catch { }
          }
        }
      } else if (Buffer.isBuffer(uploadPayload)) {
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
      throw new Error(cloudErr?.message || (isVideo ? 'فشل في رفع الفيديو إلى خدمة التخزين السحابي Cloudinary' : 'فشل في رفع الصورة إلى خدمة التخزين السحابي Cloudinary'));
    }
  }

  const mediaId = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

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
      await cloudinary.uploader.destroy(mediaDoc.publicId!, { resource_type: isVideo ? 'video' : 'image' });
    } catch (cleanupErr) { }
    throw new Error('فشل حفظ بيانات الوسائط في قاعدة البيانات بعد الرفع');
  }
}

export interface ConfirmAdminVideoOptions {
  publicId: string;
  secureUrl: string;
  url?: string;
  entityType: string;
  entityId?: string;
  entitySlug?: string;
  filename?: string;
  duration?: number;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
  user: {
    id: string;
    role: UserRole;
    name?: string;
  };
}

export async function confirmAdminVideo(options: ConfirmAdminVideoOptions): Promise<MediaAssetDoc> {
  const {
    publicId,
    secureUrl,
    url = secureUrl,
    entityType,
    entityId,
    entitySlug,
    filename = 'place_video.mp4',
    duration,
    format = 'mp4',
    bytes = 0,
    width,
    height,
    alt,
    caption = '',
    user
  } = options;

  if (!user || user.role !== 'admin') {
    throw new Error('عفواً، هذه العملية مخصصة لمدراء النظام فقط');
  }

  const mediaId = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const suggestedAlt = alt || `${filename} - منصة وه للتراث`;
  const folder = publicId.includes('/') ? publicId.substring(0, publicId.lastIndexOf('/')) : 'WAH/videos';

  const mediaDoc: any = {
    _id: mediaId,
    id: mediaId,
    title: suggestedAlt,
    url,
    secureUrl,
    publicId,
    folder,
    type: 'video',
    resourceType: 'video',
    category: (entityType as any) || 'videos',
    entityType,
    entityId: entityId || undefined,
    entitySlug: sanitizeSlug(entitySlug) || undefined,
    uploadedBy: user.id,
    uploaderRole: 'admin',
    sizeBytes: bytes,
    bytes,
    width,
    height,
    duration,
    format,
    alt: suggestedAlt,
    caption,
    isPrimary: false,
    status: 'verified',
    metadata: {
      originalFilename: filename,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // فك ارتباط هذا الفيديو بأي مكان آخر لضمان الربط الحصري 1-to-1 وعدم التكرار
  await unbindMediaFromOtherEntities(secureUrl, entityType, entityId || entitySlug);

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    // Delete any previous wah_media record for this publicId/URL to avoid duplicates
    await db.collection('wah_media').deleteMany({
      $or: [{ publicId }, { url }, { secureUrl }]
    });
    await db.collection<MediaAssetDoc>('wah_media').insertOne({ ...mediaDoc } as any);
  }

  memoryDb.media = memoryDb.media.filter(
    (m) => m.publicId !== publicId && m.url !== url && m.secureUrl !== secureUrl
  );
  memoryDb.media.unshift(mediaDoc);

  const targetEntity = entityId || entitySlug;
  if (targetEntity) {
    await syncMediaWithEntity(entityType, targetEntity, secureUrl, false, false, 'video');
  }

  // مزامنة فورية وحصرية مع فيديوهات الريلز
  await syncEntityReel({
    entityType,
    entityId: targetEntity,
    entitySlug,
    videoUrl: secureUrl,
    publicId,
    duration,
    title: suggestedAlt,
    description: caption
  });

  return mediaDoc;
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
  const targetUrl = mediaDoc?.secureUrl || mediaDoc?.url || (mediaIdOrPublicId.startsWith('http') ? mediaIdOrPublicId : undefined);
  const cleanUrl = targetUrl?.split('?')[0];

  const isVideo =
    mediaDoc?.type === 'video' ||
    mediaDoc?.resourceType === 'video' ||
    Boolean(targetUrl && targetUrl.includes('/video/upload/')) ||
    Boolean(targetUrl && targetUrl.match(/\.(mp4|webm|mov|ogg|mkv|3gp|m4v)(\?.*)?$/i)) ||
    (targetPublicId && targetPublicId.includes('/videos/'));

  if (targetPublicId && isCloudinaryAvailable()) {
    ensureCloudinaryConfig();
    try {
      const primaryResType = isVideo ? 'video' : 'image';
      const destroyRes = await cloudinary.uploader.destroy(targetPublicId, {
        resource_type: primaryResType
      });
      // If result wasn't ok, attempt with alternate resource type in case of type mismatch
      if (destroyRes?.result !== 'ok' && !destroyRes?.result?.includes('not found')) {
        await cloudinary.uploader.destroy(targetPublicId, {
          resource_type: isVideo ? 'image' : 'video'
        });
      }
      Logger.info(`[deleteAdminMedia] Cloudinary asset deleted: ${targetPublicId}`);
    } catch (cloudErr) {
      Logger.warn(`[deleteAdminMedia] Cloudinary deletion notice:`, cloudErr);
    }
  }

  // URLs to purge from places and reels
  const urlsToPurge: string[] = [];
  if (targetUrl) urlsToPurge.push(targetUrl);
  if (cleanUrl && cleanUrl !== targetUrl) urlsToPurge.push(cleanUrl);
  if (mediaIdOrPublicId.startsWith('http') && !urlsToPurge.includes(mediaIdOrPublicId)) {
    urlsToPurge.push(mediaIdOrPublicId);
  }

  if (isMongo && db) {
    // 1. Delete from wah_media
    await db.collection('wah_media').deleteMany(buildMediaIdFilter(mediaIdOrPublicId));

    // 2. Cascade delete from reels if it's a video
    if (urlsToPurge.length > 0 || targetPublicId) {
      const reelFilter: any = {
        $or: [
          ...urlsToPurge.map((u) => ({ videoUrl: u })),
          ...(targetPublicId ? [{ cloudinaryPublicId: targetPublicId }] : [])
        ]
      };
      await db.collection('reels').deleteMany(reelFilter);
    }

    // 3. Cascade update in heritage places (pull from videos, gallery, galleryImages)
    if (urlsToPurge.length > 0) {
      const placesWithMedia = await db.collection('wah_heritage_places').find({
        $or: [
          { videoUrl: { $in: urlsToPurge } },
          { videos: { $in: urlsToPurge } },
          { gallery: { $in: urlsToPurge } },
          { galleryImages: { $in: urlsToPurge } },
          { coverImage: { $in: urlsToPurge } },
          { imageUrl: { $in: urlsToPurge } }
        ]
      }).toArray();

      for (const p of placesWithMedia) {
        const remainingVideos = (p.videos || []).filter((v: string) => !urlsToPurge.includes(v));
        const remainingGallery = (p.gallery || []).filter((g: string) => !urlsToPurge.includes(g));
        const updateDoc: any = {
          $pull: {
            videos: { $in: urlsToPurge },
            gallery: { $in: urlsToPurge },
            galleryImages: { $in: urlsToPurge }
          } as any,
          $set: { updatedAt: new Date().toISOString() }
        };
        if (urlsToPurge.includes(p.videoUrl)) {
          updateDoc.$set.videoUrl = remainingVideos[0] || null;
        }
        if (urlsToPurge.includes(p.coverImage) || urlsToPurge.includes(p.imageUrl)) {
          updateDoc.$set.coverImage = remainingGallery[0] || null;
          updateDoc.$set.imageUrl = remainingGallery[0] || null;
        }
        await db.collection('wah_heritage_places').updateOne({ _id: p._id }, updateDoc);
      }
    }
  }

  // Cascade clean memoryDb
  memoryDb.media = memoryDb.media.filter(
    (m) =>
      m.id !== mediaIdOrPublicId &&
      m.publicId !== targetPublicId &&
      (!targetUrl || (m.url !== targetUrl && m.secureUrl !== targetUrl))
  );

  if (urlsToPurge.length > 0 || targetPublicId) {
    memoryDb.reels = memoryDb.reels.filter(
      (r) =>
        (!r.videoUrl || !urlsToPurge.includes(r.videoUrl)) &&
        (!targetPublicId || r.cloudinaryPublicId !== targetPublicId)
    );
  }

  for (const place of memoryDb.heritagePlaces) {
    if (urlsToPurge.includes(place.videoUrl || '')) {
      place.videos = (place.videos || []).filter((v) => !urlsToPurge.includes(v));
      place.videoUrl = place.videos[0] || undefined;
    } else if (place.videos) {
      place.videos = place.videos.filter((v) => !urlsToPurge.includes(v));
    }
    if (place.gallery) {
      place.gallery = place.gallery.filter((g) => !urlsToPurge.includes(g));
    }
    if (place.galleryImages) {
      place.galleryImages = place.galleryImages.filter((g) => !urlsToPurge.includes(g));
    }
    if (urlsToPurge.includes(place.coverImage || '')) {
      place.coverImage = place.gallery?.[0] || '';
      (place as any).imageUrl = place.coverImage;
    }
  }

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
  entitySlug?: string;
  galleryUrls: string[];
  user: { id: string; role: UserRole };
}): Promise<{ success: boolean; gallery: string[] }> {
  const { entityType, entityId, entitySlug, galleryUrls, user } = options;

  if (!user || user.role !== 'admin') {
    throw new Error('عفواً، هذه العملية مخصصة لمدراء النظام فقط');
  }

  const collectionName = getEntityCollectionName(entityType);
  if (!collectionName) {
    throw new Error(`نوع الكيان ${entityType} غير مدعوم للمعرض`);
  }

  const { db, isMongo } = await getDatabase();
  const filter = buildEntityFilter(entityId, entitySlug);

  if (isMongo && db) {
    await db.collection(collectionName).updateOne(
      filter,
      { $set: { gallery: galleryUrls, galleryImages: galleryUrls, updatedAt: new Date().toISOString() } }
    );
  }

  const memEntity = findMemoryEntity(collectionName, entityId, entitySlug);
  if (memEntity) {
    memEntity.gallery = galleryUrls;
    memEntity.galleryImages = galleryUrls;
  }

  return { success: true, gallery: galleryUrls };
}

export async function manageEntityGallery(options: {
  entityType: string;
  entityId: string;
  entitySlug?: string;
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
  const { entityType, entityId, entitySlug, action, imageUrl, videoUrl, galleryUrls, coverImage, user } = options;

  if (!user || user.role !== 'admin') {
    throw new Error('عفواً، هذه العملية مخصصة لمدراء النظام فقط');
  }

  const collectionName = getEntityCollectionName(entityType);
  if (!collectionName) {
    throw new Error(`نوع الكيان ${entityType} غير مدعوم للمعرض`);
  }

  const { db, isMongo } = await getDatabase();
  const filter = buildEntityFilter(entityId, entitySlug);
  const memEntity = findMemoryEntity(collectionName, entityId, entitySlug);

  // Fetch current entity state
  let currentDoc: any = null;
  if (isMongo && db) {
    currentDoc = await db.collection(collectionName).findOne(filter);
  }
  if (!currentDoc && memEntity) {
    currentDoc = memEntity;
  }

  let currentGallery: string[] = Array.isArray(currentDoc?.gallery)
    ? currentDoc.gallery
    : (Array.isArray(memEntity?.gallery) ? memEntity.gallery : []);
  let currentCover: string | undefined = currentDoc?.coverImage || currentDoc?.imageUrl || memEntity?.coverImage || memEntity?.imageUrl;

  // 1. SET COVER
  if (action === 'setCover' && imageUrl) {
    const cleanUrl = imageUrl.trim();
    if (isMongo && db) {
      await db.collection(collectionName).updateOne(filter, {
        $set: { coverImage: cleanUrl, imageUrl: cleanUrl, updatedAt: new Date().toISOString() }
      });

      // Update primary state in wah_media
      try {
        await db.collection<MediaAssetDoc>('wah_media').updateMany(
          {
            $or: [
              { entityType, entityId },
              ...(entitySlug ? [{ entityType, entitySlug }] : [])
            ]
          },
          { $set: { isPrimary: false, updatedAt: new Date().toISOString() } }
        );
        await db.collection<MediaAssetDoc>('wah_media').updateOne(
          buildMediaIdFilter(cleanUrl),
          { $set: { isPrimary: true, updatedAt: new Date().toISOString() } }
        );
      } catch { }
    }

    if (memEntity) {
      memEntity.coverImage = cleanUrl;
      memEntity.imageUrl = cleanUrl;
    }

    memoryDb.media.forEach((m) => {
      if (m.entityType === entityType && (m.entityId === entityId || (entitySlug && m.entitySlug === entitySlug))) {
        m.isPrimary = m.url === cleanUrl || m.secureUrl === cleanUrl;
      }
    });

    return {
      success: true,
      message: 'تم تعيين الصورة كغلاف رئيسي بنجاح',
      coverImage: cleanUrl,
      gallery: currentGallery
    };
  }

  // 2. SET VIDEO
  if (action === 'setVideo' && (videoUrl || imageUrl)) {
    const targetVideo = (videoUrl || imageUrl)!.trim();

    // فك ارتباط الفيديو بأي مكان آخر لضمان الربط الحصري 1-to-1
    await unbindMediaFromOtherEntities(targetVideo, entityType, entityId || entitySlug);

    if (isMongo && db) {
      await db.collection(collectionName).updateOne(filter, {
        $set: { videoUrl: targetVideo, updatedAt: new Date().toISOString() },
        $addToSet: { videos: targetVideo } as any
      });
    }
    if (memEntity) {
      memEntity.videoUrl = targetVideo;
      if (!memEntity.videos) memEntity.videos = [];
      if (!memEntity.videos.includes(targetVideo)) memEntity.videos.push(targetVideo);
    }

    // مزامنة فورية مع خلاصة الريلز الشاملة
    await syncEntityReel({
      entityType,
      entityId: entityId || entitySlug,
      entitySlug,
      videoUrl: targetVideo
    });

    return { success: true, message: 'تم حفظ مقطع الفيديو التوثيقي ومزامنته مع الريلز بنجاح', videoUrl: targetVideo };
  }

  // 3. REMOVE VIDEO
  if (action === 'removeVideo') {
    const targetVideo = (videoUrl || imageUrl)?.trim();
    if (targetVideo) {
      // حذف الفيديو كلياً من Cloudinary وقاعدة بيانات الوسائط
      try {
        await deleteAdminMedia(targetVideo, user);
      } catch (delErr) {
        Logger.warn('[manageEntityGallery] Notice during video deletion:', delErr);
      }
      // إزالة الفيديو من خلاصة الريلز
      await removeEntityReel({
        entityId: entityId || entitySlug,
        videoUrl: targetVideo
      });
    }

    if (isMongo && db) {
      const updateDoc: any = { $set: { updatedAt: new Date().toISOString() } };
      if (!targetVideo) {
        updateDoc.$set.videoUrl = null;
      } else {
        updateDoc.$pull = { videos: targetVideo };
        if (currentDoc?.videoUrl === targetVideo) {
          const remaining = (currentDoc.videos || []).filter((v: string) => v !== targetVideo);
          updateDoc.$set.videoUrl = remaining[0] || null;
        }
      }
      await db.collection(collectionName).updateOne(filter, updateDoc);
    }
    if (memEntity) {
      if (!targetVideo) {
        memEntity.videoUrl = null;
      } else if (memEntity.videos) {
        memEntity.videos = memEntity.videos.filter((v: string) => v !== targetVideo);
        if (memEntity.videoUrl === targetVideo) {
          memEntity.videoUrl = memEntity.videos[0] || null;
        }
      }
    }
    return { success: true, message: 'تم إزالة مقطع الفيديو وحذفه من السحابة وقاعدة البيانات والريلز بنجاح', videoUrl: null };
  }

  // 4. ADD IMAGE TO GALLERY
  if (action === 'add' && imageUrl) {
    const cleanUrl = imageUrl.trim();
    const isFirstImage = !currentCover && currentGallery.length === 0;
    const targetCover = isFirstImage ? cleanUrl : currentCover;

    if (isMongo && db) {
      const updateDoc: any = {
        $addToSet: { gallery: cleanUrl, galleryImages: cleanUrl } as any,
        $set: { updatedAt: new Date().toISOString() }
      };
      if (isFirstImage) {
        updateDoc.$set.coverImage = cleanUrl;
        updateDoc.$set.imageUrl = cleanUrl;
      }
      await db.collection(collectionName).updateOne(filter, updateDoc);
    }

    if (memEntity) {
      if (!memEntity.gallery) memEntity.gallery = [];
      if (!memEntity.gallery.includes(cleanUrl)) memEntity.gallery.push(cleanUrl);
      if (!memEntity.galleryImages) memEntity.galleryImages = [];
      if (!memEntity.galleryImages.includes(cleanUrl)) memEntity.galleryImages.push(cleanUrl);
      if (isFirstImage) {
        memEntity.coverImage = cleanUrl;
        memEntity.imageUrl = cleanUrl;
      }
    }

    const updatedGallery = Array.from(new Set([...currentGallery, cleanUrl]));
    return {
      success: true,
      message: 'تمت إضافة الصورة إلى المعرض بنجاح',
      gallery: updatedGallery,
      coverImage: targetCover
    };
  }

  // 5. REMOVE IMAGE FROM GALLERY & CLOUDINARY
  if (action === 'remove' && imageUrl) {
    const cleanUrl = imageUrl.trim();
    const cleanBasePath = cleanUrl.split('?')[0];

    // Filter out removed image from gallery
    const remainingGallery = currentGallery.filter(
      (u) => u && u.trim() !== cleanUrl && u.trim().split('?')[0] !== cleanBasePath
    );

    const isCurrentCover =
      currentCover &&
      (currentCover.trim() === cleanUrl || currentCover.trim().split('?')[0] === cleanBasePath);
    const nextCover = isCurrentCover ? (remainingGallery[0] || undefined) : currentCover;

    if (isMongo && db) {
      const updateDoc: any = {
        $pull: {
          gallery: { $in: [cleanUrl, cleanBasePath] },
          galleryImages: { $in: [cleanUrl, cleanBasePath] }
        } as any,
        $set: { updatedAt: new Date().toISOString() }
      };
      if (isCurrentCover) {
        updateDoc.$set.coverImage = nextCover || null;
        updateDoc.$set.imageUrl = nextCover || null;
      }
      await db.collection(collectionName).updateOne(filter, updateDoc);
    }

    if (memEntity) {
      if (memEntity.gallery) {
        memEntity.gallery = remainingGallery;
      }
      if (memEntity.galleryImages) {
        memEntity.galleryImages = remainingGallery;
      }
      if (isCurrentCover) {
        memEntity.coverImage = nextCover;
        memEntity.imageUrl = nextCover;
      }
    }

    // Purge from Cloudinary and wah_media collection completely
    try {
      await deleteAdminMedia(cleanUrl, user);
    } catch (cloudErr) {
      Logger.warn('[manageEntityGallery] Cloudinary purge warning:', cloudErr);
    }

    return {
      success: true,
      message: 'تم حذف الصورة من المعرض والتخزين السحابي وقاعدة البيانات بنجاح',
      gallery: remainingGallery,
      coverImage: nextCover
    };
  }

  // 6. UPDATE FULL GALLERY
  if (action === 'updateGallery' && Array.isArray(galleryUrls)) {
    const validUrls = Array.from(new Set(galleryUrls.map((u) => u.trim()).filter(Boolean)));
    const targetCover = coverImage?.trim() || (validUrls.length > 0 ? (validUrls.includes(currentCover || '') ? currentCover : validUrls[0]) : undefined);

    const updateFields: any = {
      gallery: validUrls,
      galleryImages: validUrls,
      updatedAt: new Date().toISOString()
    };
    if (targetCover) {
      updateFields.coverImage = targetCover;
      updateFields.imageUrl = targetCover;
    }

    if (isMongo && db) {
      await db.collection(collectionName).updateOne(filter, { $set: updateFields });
    }

    if (memEntity) {
      memEntity.gallery = validUrls;
      memEntity.galleryImages = validUrls;
      if (targetCover) {
        memEntity.coverImage = targetCover;
        memEntity.imageUrl = targetCover;
      }
    }

    return {
      success: true,
      message: 'تم تحديث صور المعرض بنجاح',
      gallery: validUrls,
      coverImage: targetCover
    };
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