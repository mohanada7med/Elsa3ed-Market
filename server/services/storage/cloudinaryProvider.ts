import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

import { validateImage } from '../../utils/imageValidator.ts';
import { getCloudinaryFolder, isValidWahEntityType, sanitizeSlug } from '../../utils/cloudinaryFolders.ts';
import { Logger } from '../../utils/logger.ts';
import type { IStorageProvider, UploadFileOptions, UploadResult } from './storageProvider.ts';

/**
 * Check if a credential value is an unconfigured template placeholder or invalid string.
 */
function isPlaceholderValue(val?: string): boolean {
  if (!val || typeof val !== 'string') return true;
  const trimmed = val.trim();
  if (!trimmed) return true;
  if (
    trimmed.includes('<') ||
    trimmed.includes('>') ||
    trimmed.includes('%3C') ||
    trimmed.includes('%3E') ||
    trimmed.toLowerCase().includes('your_api_key') ||
    trimmed.toLowerCase().includes('your_cloud_name') ||
    trimmed.toLowerCase().includes('your_api_secret') ||
    trimmed.toLowerCase().includes('your_api') ||
    trimmed.toLowerCase().includes('placeholder') ||
    trimmed.toLowerCase().includes('dummy') ||
    trimmed === 'undefined' ||
    trimmed === 'null'
  ) {
    return true;
  }
  return false;
}

/**
 * Validates whether real, non-placeholder Cloudinary credentials exist in the environment.
 */
export function isCloudinaryAvailable(): boolean {
  const url = process.env.CLOUDINARY_URL;
  if (url && !isPlaceholderValue(url) && url.trim().startsWith('cloudinary://')) {
    return true;
  }
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!isPlaceholderValue(cloudName) && !isPlaceholderValue(apiKey) && !isPlaceholderValue(apiSecret)) {
    return true;
  }
  return false;
}


export class CloudinaryStorageProvider implements IStorageProvider {
  private isConfigured = false;

  constructor() {
    this.configure();
  }

  public isAvailable(): boolean {
    return isCloudinaryAvailable();
  }

  private configure() {
    if (this.isConfigured) return;

    if (!isCloudinaryAvailable()) {
      Logger.info('[Cloudinary] Cloudinary credentials not configured or placeholder detected; will use local storage provider');
      return;
    }

    if (
      !isPlaceholderValue(process.env.CLOUDINARY_CLOUD_NAME) &&
      !isPlaceholderValue(process.env.CLOUDINARY_API_KEY) &&
      !isPlaceholderValue(process.env.CLOUDINARY_API_SECRET)
    ) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME!.trim(),
        api_key: process.env.CLOUDINARY_API_KEY!.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET!.trim(),
        secure: true
      });
      this.isConfigured = true;
      Logger.info('[Cloudinary] Configured via individual credentials');
    } else if (process.env.CLOUDINARY_URL && !isPlaceholderValue(process.env.CLOUDINARY_URL)) {
      cloudinary.config({
        secure: true
      });
      this.isConfigured = true;
      Logger.info('[Cloudinary] Configured via CLOUDINARY_URL');
    }
  }

  /**
   * Upload an image to Cloudinary in the structured folder:
   * WAH/products/{productId}/{filename}
   */
  async upload(options: UploadFileOptions): Promise<UploadResult> {
    this.configure();

    if (!this.isConfigured || !isCloudinaryAvailable()) {
      throw new Error('خدمة التخزين السحابي Cloudinary غير مهيأة أو مفاتيح الربط غير صالحة');
    }

    const {
      data,
      filename = 'media',
      mimeType,
      folder = 'products',
      resourceType,
      productId,
      ownerId,
      userId,
      customPublicId,
      overwrite
    } = options;

    const isVideo =
      resourceType === 'video' ||
      folder === 'reels' ||
      folder === 'videos' ||
      Boolean(mimeType && mimeType.startsWith('video/')) ||
      filename.endsWith('.mp4') ||
      filename.endsWith('.webm') ||
      filename.endsWith('.mov');

    let uploadPayload: string | Buffer;
    let detectedMime = mimeType;
    let sizeBytes = 0;

    if (isVideo) {
      // Video upload handling
      if (typeof data === 'string') {
        uploadPayload = data;
      } else {
        detectedMime = detectedMime || 'video/mp4';
        uploadPayload = data; // Keep raw Buffer for streaming upload
        sizeBytes = data.length;
      }
    } else {
      // 1. Image validation
      const validation = validateImage(data, filename, mimeType);
      if (!validation.valid) {
        throw new Error(validation.error || 'فشل في التحقق من صحة ملف الصورة');
      }
      detectedMime = validation.mimeType || 'image/jpeg';
      sizeBytes = validation.sizeBytes || 0;

      if (typeof data === 'string') {
        if (data.startsWith('data:')) {
          uploadPayload = data;
        } else {
          uploadPayload = `data:${detectedMime};base64,${data}`;
        }
      } else {
        uploadPayload = data;
      }
    }

    // 3. Determine Cloudinary Folder & Public ID
    let cloudinaryFolder: string;
    let publicId: string;
    let shouldOverwrite = false;

    if (isVideo || (folder as string) === 'reels' || (folder as string) === 'videos') {
      if (options.role === 'admin' && !options.sellerId) {
        // Admin video uploads go to dedicated WAH videos folder
        cloudinaryFolder = 'WAH/videos';
      } else if (options.sellerId) {
        // Seller video uploads go to isolated seller folder
        const cleanSellerId = options.sellerId.replace(/[^a-zA-Z0-9_-]/g, '_');
        cloudinaryFolder = `WAH/videos/sellers/${cleanSellerId}`;
      } else if (ownerId) {
        const cleanOwnerId = ownerId.replace(/[^a-zA-Z0-9_-]/g, '_');
        cloudinaryFolder = `WAH/videos/sellers/${cleanOwnerId}`;
      } else {
        cloudinaryFolder = 'WAH/videos';
      }

      const cleanFilename = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      publicId = `${cleanFilename}_${uniqueSuffix}`;
      shouldOverwrite = false;
    } else if (folder === 'products') {
      const prodId = productId || `prod-${Date.now()}`;
      cloudinaryFolder = `WAH/products/${prodId}`;
      const cleanFilename = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      publicId = `${cleanFilename}_${uniqueSuffix}`;
      shouldOverwrite = false;
    } else if (folder === 'users') {
      const targetUserId = userId || ownerId || `user-${Date.now()}`;
      cloudinaryFolder = `WAH/users/${targetUserId}`;
      publicId = customPublicId || 'profile';
      shouldOverwrite = overwrite ?? true;
    } else if (folder === 'sellers') {
      const targetSellerId = (options.sellerId || ownerId || 'seller').replace(/[^a-zA-Z0-9_-]/g, '_');
      cloudinaryFolder = `WAH/sellers/${targetSellerId}`;
      const cleanFilename = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      publicId = `${cleanFilename}_${uniqueSuffix}`;
      shouldOverwrite = overwrite ?? false;
    } else {
      cloudinaryFolder = `WAH/${folder}`;
      const cleanFilename = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      publicId = `${cleanFilename}_${uniqueSuffix}`;
      shouldOverwrite = overwrite ?? false;
    }

    try {
      const uploadOptions: any = {
        folder: cloudinaryFolder,
        public_id: publicId,
        overwrite: shouldOverwrite,
        invalidate: true
      };

      let uploadResult: UploadApiResponse;

      if (Buffer.isBuffer(uploadPayload)) {
        if (isVideo) {
          uploadOptions.resource_type = 'video';
          uploadOptions.chunk_size = 20000000; // 20MB chunk size for video stream
          uploadOptions.timeout = 600000; // 10 min timeout for large 1GB video processing
        } else {
          uploadOptions.resource_type = 'image';
          uploadOptions.allowed_formats = ['jpg', 'jpeg', 'png', 'webp'];
          uploadOptions.transformation = [{ quality: 'auto', fetch_format: 'auto' }];
        }
        uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, res) => {
            if (err || !res) {
              reject(err || new Error('فشل رفع الملف إلى Cloudinary'));
            } else {
              resolve(res);
            }
          });
          stream.end(uploadPayload);
        });
      } else if (isVideo) {
        uploadOptions.resource_type = 'video';
        uploadOptions.chunk_size = 20000000; // 20MB chunk size for reliable video streaming uploads
        uploadOptions.timeout = 600000; // 10 min timeout for large 1GB video processing
        uploadResult = (await cloudinary.uploader.upload_large(uploadPayload, uploadOptions)) as UploadApiResponse;
      } else {
        uploadOptions.resource_type = 'image';
        uploadOptions.allowed_formats = ['jpg', 'jpeg', 'png', 'webp'];
        uploadOptions.transformation = [{ quality: 'auto', fetch_format: 'auto' }];
        uploadResult = await cloudinary.uploader.upload(uploadPayload, uploadOptions);
      }


      Logger.info(`[Cloudinary] ${isVideo ? 'Video' : 'Image'} uploaded successfully to ${cloudinaryFolder}: ${uploadResult.public_id}`);

      return {
        url: uploadResult.secure_url,
        fileKey: uploadResult.public_id,
        mimeType: `${uploadResult.resource_type}/${uploadResult.format}`,
        sizeBytes: uploadResult.bytes || sizeBytes || 0,
        uploadedAt: uploadResult.created_at || new Date().toISOString(),
        duration: uploadResult.duration
      };
    } catch (err: any) {
      Logger.error(`[Cloudinary] ${isVideo ? 'Video' : 'Image'} upload failed:`, err?.message || err);
      throw new Error(err?.message || `فشل في رفع ${isVideo ? 'الفيديو' : 'الصورة'} إلى خدمة التخزين السحابي`);
    }
  }

  /**
   * Delete asset from Cloudinary by public_id or full Cloudinary URL
   */
  async delete(fileKeyOrUrl: string, requestingUser?: { id: string; role: string }): Promise<boolean> {
    this.configure();

    if (!fileKeyOrUrl || !this.isConfigured) return false;

    const fileKey = extractCloudinaryPublicId(fileKeyOrUrl) || fileKeyOrUrl;

    // Security check: only allow deletion of WAH or WAH assets
    if (!fileKey.startsWith('WAH/') && !fileKey.startsWith('WAH/')) {
      Logger.warn(`[Cloudinary] Refusing to delete asset outside allowed namespaces: ${fileKey}`);
      return false;
    }

    const isVideo = fileKey.includes('/reels/') || fileKey.includes('/videos/') || fileKey.startsWith('WAH/videos/') || fileKey.includes('video');

    try {
      const res = await cloudinary.uploader.destroy(fileKey, isVideo ? { resource_type: 'video' } : undefined);
      const isSuccess = res.result === 'ok';
      if (isSuccess) {
        Logger.info(`[Cloudinary] Deleted asset: ${fileKey}`);
      } else {
        Logger.warn(`[Cloudinary] Asset deletion returned: ${res.result} for ${fileKey}`);
      }
      return isSuccess;
    } catch (err: any) {
      Logger.error(`[Cloudinary] Failed to delete asset: ${fileKey}`, err?.message || err);
      return false;
    }
  }

  /**
   * Generates a cryptographically signed direct upload payload for frontend direct-to-Cloudinary upload.
   * Keeps API Secret strictly on server while providing frontend with signed parameters for progress tracking.
   */
  generateVideoUploadSignature(options: {
    role: string;
    sellerId?: string;
    filename?: string;
    folder?: string;
    entityType?: string;
    entitySlug?: string;
  }): {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
    publicId: string;
    resourceType: 'video';
  } {
    this.configure();

    if (!this.isConfigured || !isCloudinaryAvailable()) {
      throw new Error('خدمة التخزين السحابي Cloudinary غير مهيأة أو مفاتيح الربط غير صالحة');
    }

    const config = cloudinary.config();
    let apiKey = config.api_key || process.env.CLOUDINARY_API_KEY;
    let apiSecret = config.api_secret || process.env.CLOUDINARY_API_SECRET;
    let cloudName = config.cloud_name || process.env.CLOUDINARY_CLOUD_NAME;

    if ((!apiKey || !apiSecret || !cloudName) && process.env.CLOUDINARY_URL) {
      const match = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@(.*)/);
      if (match) {
        apiKey = apiKey || match[1];
        apiSecret = apiSecret || match[2];
        cloudName = cloudName || match[3];
      }
    }

    if (!apiKey || !apiSecret || !cloudName) {
      throw new Error('بيانات مصادقة Cloudinary غير مكتملة في بيئة العمل');
    }

    let folder: string;
    if (options.folder) {
      folder = options.folder;
    } else if (options.entityType && isValidWahEntityType(options.entityType)) {
      folder = getCloudinaryFolder({
        entityType: options.entityType,
        entitySlug: options.entitySlug,
        resourceType: 'video'
      });
    } else if (options.role === 'admin' && !options.sellerId) {
      folder = 'WAH/admin/videos';
    } else if (options.sellerId) {
      const cleanSellerId = options.sellerId.replace(/[^a-zA-Z0-9_-]/g, '_');
      folder = `WAH/sellers/${cleanSellerId}/videos`;
    } else {
      folder = 'WAH/videos';
    }

    const rawFilename = options.filename || 'place_video';
    const cleanFilename = sanitizeSlug(rawFilename.replace(/\.[^/.]+$/, '')) || 'video';
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const publicId = `${cleanFilename}_${uniqueSuffix}`;

    const timestamp = Math.round(new Date().getTime() / 1000);

    const paramsToSign = {
      folder,
      public_id: publicId,
      timestamp
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return {
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
      publicId,
      resourceType: 'video'
    };
  }

  /**
   * Return full delivery URL from fileKey or existing URL
   */
  getUrl(fileKey: string): string {
    if (fileKey.startsWith('http://') || fileKey.startsWith('https://')) {
      return fileKey;
    }
    return cloudinary.url(fileKey, { secure: true });
  }

  /**
   * Verify whether a video asset exists and is ready in Cloudinary.
   * Enables client asynchronous polling during post-100% video processing.
   */
  async verifyVideoAsset(publicId: string): Promise<{
    exists: boolean;
    isReady: boolean;
    status: 'ready' | 'processing' | 'pending' | 'not_found' | 'error';
    url?: string;
    thumbnailUrl?: string;
    duration?: number;
    bytes?: number;
    format?: string;
    width?: number;
    height?: number;
    message?: string;
  }> {
    this.configure();
    if (!this.isConfigured || !isCloudinaryAvailable()) {
      return { exists: false, isReady: false, status: 'error', message: 'خدمة التخزين السحابي غير متصلة' };
    }
    try {
      const cleanKey = extractCloudinaryPublicId(publicId) || publicId;
      const resource = await cloudinary.api.resource(cleanKey, {
        resource_type: 'video'
      });

      if (resource && (resource.secure_url || resource.url)) {
        const rawStatus = (resource.status || '').toLowerCase();
        const isProcessing = rawStatus === 'processing' || rawStatus === 'pending';
        const isReady = !isProcessing && Boolean(resource.secure_url || resource.url);
        const rawUrl = resource.secure_url || resource.url;

        // Automatically derive instant Cloudinary video poster thumbnail (frame at 0s, fast f_auto,q_auto,w_800 jpg)
        let thumbnailUrl: string | undefined;
        let optimizedUrl = rawUrl;
        if (rawUrl) {
          if (rawUrl.includes('/video/upload/')) {
            thumbnailUrl = rawUrl
              .replace('/video/upload/', '/video/upload/so_0,f_auto,q_auto,w_800,c_limit/')
              .replace(/\.[^/.]+$/, '.jpg');
            optimizedUrl = rawUrl
              .replace('/video/upload/', '/video/upload/f_auto,q_auto/')
              .replace(/\.(mov|MOV|webm|m4v)$/, '.mp4');
          } else {
            thumbnailUrl = rawUrl.replace(/\.[^/.]+$/, '.jpg');
          }
        }

        return {
          exists: true,
          isReady,
          status: isReady ? 'ready' : 'processing',
          url: optimizedUrl,
          thumbnailUrl,
          duration: resource.duration,
          bytes: resource.bytes,
          format: resource.format,
          width: resource.width,
          height: resource.height,
          message: isReady ? 'تم تجهيز الفيديو بنجاح' : 'الفيديو قيد المعالجة السحابية'
        };
      }

      return { exists: false, isReady: false, status: 'processing', message: 'جاري تجميع أجزاء الفيديو' };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isNotFound = errMsg.toLowerCase().includes('not found') || err?.http_code === 404;

      if (isNotFound) {
        // Asset is still being stitched by Cloudinary workers
        return {
          exists: false,
          isReady: false,
          status: 'processing',
          message: 'جاري معالجة وتجميع الفيديو في السحابة'
        };
      }

      Logger.warn(`[Cloudinary] Asset verification for ${publicId}: ${errMsg}`);
      return {
        exists: false,
        isReady: false,
        status: 'error',
        message: 'تعذر التحقق من حالة الفيديو'
      };
    }
  }
}

/**
 * Extracts Cloudinary public_id from a Cloudinary URL or returns the key if already a publicId.
 * Example: https://res.cloudinary.com/kuana1nl/video/upload/v1787870212/WAH/sellers/seller_1/videos/vid.mp4
 * -> WAH/sellers/seller_1/videos/vid
 */
export function extractCloudinaryPublicId(urlOrKey: string): string | null {
  if (!urlOrKey || typeof urlOrKey !== 'string') return null;
  const trimmed = urlOrKey.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed;
  }
  // Match Cloudinary upload URL path: /upload/(?:v\d+/)?((?:WAH|WAH)/[^.?#]+)
  const match = trimmed.match(/\/upload\/(?:v\d+\/)?((?:WAH|WAH)\/[^?#]+?)(?:\.[a-zA-Z0-9]+)?(?:[?#]|$)/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

export const cloudinaryStorage = new CloudinaryStorageProvider();
