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
      filename = 'image',
      mimeType,
      folder = 'products',
      productId,
      ownerId,
      userId,
      customPublicId,
      overwrite
    } = options;

    // 1. Server-side validation of file type, size, and magic bytes
    const validation = validateImage(data, filename, mimeType);
    if (!validation.valid) {
      throw new Error(validation.error || 'فشل في التحقق من صحة ملف الصورة');
    }

    // 2. Format upload payload for Cloudinary (Data-URI or raw buffer)
    let uploadPayload: string;
    if (typeof data === 'string') {
      if (data.startsWith('data:')) {
        uploadPayload = data;
      } else {
        const detectedMime = validation.mimeType || 'image/jpeg';
        uploadPayload = `data:${detectedMime};base64,${data}`;
      }
    } else {
      const detectedMime = validation.mimeType || 'image/jpeg';
      uploadPayload = `data:${detectedMime};base64,${data.toString('base64')}`;
    }

    // 3. Determine Cloudinary Folder & Public ID
    let cloudinaryFolder: string;
    let publicId: string;
    let shouldOverwrite = false;

    if (folder === 'products') {
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
    } else {
      cloudinaryFolder = `Elsa3ed-Market/${folder}`;
      const cleanFilename = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      publicId = `${cleanFilename}_${uniqueSuffix}`;
      shouldOverwrite = overwrite ?? false;
    }

    try {
      const uploadResult: UploadApiResponse = await cloudinary.uploader.upload(uploadPayload, {
        folder: cloudinaryFolder,
        public_id: publicId,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        overwrite: shouldOverwrite,
        invalidate: true,
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      Logger.info(`[Cloudinary] Image uploaded successfully: ${uploadResult.public_id}`);

      return {
        url: uploadResult.secure_url,
        fileKey: uploadResult.public_id,
        mimeType: `${uploadResult.resource_type}/${uploadResult.format}`,
        sizeBytes: uploadResult.bytes || validation.sizeBytes || 0,
        uploadedAt: uploadResult.created_at || new Date().toISOString()
      };
    } catch (err: any) {
      Logger.error('[Cloudinary] Upload failed:', err?.message || err);
      throw new Error(err?.message || 'فشل في رفع الصورة إلى خدمة التخزين السحابي');
    }
  }

  /**
   * Delete asset from Cloudinary by public_id
   */
  async delete(fileKey: string, requestingUser?: { id: string; role: string }): Promise<boolean> {
    this.configure();

    if (!fileKey || !this.isConfigured) return false;

    // Security check: only allow deletion of Elsa3ed-Market assets
    if (!fileKey.startsWith('Elsa3ed-Market/')) {
      Logger.warn(`[Cloudinary] Refusing to delete asset outside Elsa3ed-Market namespace: ${fileKey}`);
      return false;
    }

    try {
      const res = await cloudinary.uploader.destroy(fileKey);
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
   * Return full delivery URL from fileKey or existing URL
   */
  getUrl(fileKey: string): string {
    if (fileKey.startsWith('http://') || fileKey.startsWith('https://')) {
      return fileKey;
    }
    return cloudinary.url(fileKey, { secure: true });
  }
}

export const cloudinaryStorage = new CloudinaryStorageProvider();

