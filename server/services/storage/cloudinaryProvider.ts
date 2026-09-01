import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

import { validateImage } from '../../utils/imageValidator.ts';
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

/**
 * Cloudinary Storage Provider
 * Official image storage system for Elsa3ed Market.
 * Strictly configured via server-side environment variables.
 */
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

    if (process.env.CLOUDINARY_URL && !isPlaceholderValue(process.env.CLOUDINARY_URL)) {
      cloudinary.config();
      this.isConfigured = true;
      Logger.info('[Cloudinary] Configured via CLOUDINARY_URL');
    } else if (
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
    }
  }

  /**
   * Upload an image to Cloudinary in the structured folder:
   * Elsa3ed-Market/products/{productId}/{filename}
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
        // Admin video uploads go to dedicated admin folder
        cloudinaryFolder = 'Elsa3ed-Market/admin/videos';
      } else if (options.sellerId) {
        // Seller video uploads go to isolated seller folder
        const cleanSellerId = options.sellerId.replace(/[^a-zA-Z0-9_-]/g, '_');
        cloudinaryFolder = `Elsa3ed-Market/sellers/${cleanSellerId}/videos`;
      } else if (ownerId) {
        const cleanOwnerId = ownerId.replace(/[^a-zA-Z0-9_-]/g, '_');
        cloudinaryFolder = `Elsa3ed-Market/sellers/${cleanOwnerId}/videos`;
      } else {
        cloudinaryFolder = 'Elsa3ed-Market/videos';
      }

      const cleanFilename = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      publicId = `${cleanFilename}_${uniqueSuffix}`;
      shouldOverwrite = false;
    } else if (folder === 'products') {
      const prodId = productId || `prod-${Date.now()}`;
      cloudinaryFolder = `Elsa3ed-Market/products/${prodId}`;
      const cleanFilename = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      publicId = `${cleanFilename}_${uniqueSuffix}`;
      shouldOverwrite = false;
    } else if (folder === 'users') {
      const targetUserId = userId || ownerId || `user-${Date.now()}`;
      cloudinaryFolder = `Elsa3ed-Market/users/${targetUserId}`;
      publicId = customPublicId || 'profile';
      shouldOverwrite = overwrite ?? true;
    } else if (folder === 'sellers') {
      const targetSellerId = (options.sellerId || ownerId || 'seller').replace(/[^a-zA-Z0-9_-]/g, '_');
      cloudinaryFolder = `Elsa3ed-Market/sellers/${targetSellerId}`;
      const cleanFilename = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      publicId = `${cleanFilename}_${uniqueSuffix}`;
      shouldOverwrite = overwrite ?? false;
    } else {
      cloudinaryFolder = `Elsa3ed-Market/${folder}`;
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
          uploadOptions.chunk_size = 6000000; // 6MB chunk size for video stream
          uploadOptions.timeout = 300000; // 5 min timeout
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
        uploadOptions.chunk_size = 6000000; // 6MB chunk size for reliable video streaming uploads
        uploadOptions.timeout = 300000; // 5 min timeout
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

    // Security check: only allow deletion of Elsa3ed-Market assets
    if (!fileKey.startsWith('Elsa3ed-Market/')) {
      Logger.warn(`[Cloudinary] Refusing to delete asset outside Elsa3ed-Market namespace: ${fileKey}`);
      return false;
    }

    const isVideo = fileKey.includes('/reels/') || fileKey.includes('/videos/');

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
    const apiKey = config.api_key;
    const apiSecret = config.api_secret;
    const cloudName = config.cloud_name;

    if (!apiKey || !apiSecret || !cloudName) {
      throw new Error('بيانات مصادقة Cloudinary غير مكتملة في بيئة العمل');
    }

    let folder: string;
    if (options.role === 'admin' && !options.sellerId) {
      folder = 'Elsa3ed-Market/admin/videos';
    } else if (options.sellerId) {
      const cleanSellerId = options.sellerId.replace(/[^a-zA-Z0-9_-]/g, '_');
      folder = `Elsa3ed-Market/sellers/${cleanSellerId}/videos`;
    } else {
      folder = 'Elsa3ed-Market/videos';
    }

    const rawFilename = options.filename || 'reel_video';
    const cleanFilename = rawFilename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
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
}

/**
 * Extracts Cloudinary public_id from a Cloudinary URL or returns the key if already a publicId.
 * Example: https://res.cloudinary.com/kuana1nl/video/upload/v1787870212/Elsa3ed-Market/sellers/seller_1/videos/vid.mp4
 * -> Elsa3ed-Market/sellers/seller_1/videos/vid
 */
export function extractCloudinaryPublicId(urlOrKey: string): string | null {
  if (!urlOrKey || typeof urlOrKey !== 'string') return null;
  const trimmed = urlOrKey.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed;
  }
  // Match Cloudinary upload URL path: /upload/(?:v\d+/)?(Elsa3ed-Market/[^.?#]+)
  const match = trimmed.match(/\/upload\/(?:v\d+\/)?(Elsa3ed-Market\/[^?#]+?)(?:\.[a-zA-Z0-9]+)?(?:[?#]|$)/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

export const cloudinaryStorage = new CloudinaryStorageProvider();

