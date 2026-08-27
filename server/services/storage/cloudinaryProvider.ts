import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

import { validateImage } from '../../utils/imageValidator.ts';
import { Logger } from '../../utils/logger.ts';
import { IStorageProvider, UploadFileOptions, UploadResult } from './storageProvider.ts';

/**
 * Cloudinary Storage Provider
 * Official image storage system for Elsa3ed Market.
 * Strictly configured via server-side environment variables.
 */
class CloudinaryStorageProvider implements IStorageProvider {
  private isConfigured = false;

  constructor() {
    this.configure();
  }

  private configure() {
    if (this.isConfigured) return;

    if (process.env.CLOUDINARY_URL) {
      cloudinary.config();
      this.isConfigured = true;
      Logger.info('[Cloudinary] Configured via CLOUDINARY_URL');
    } else if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
      });
      this.isConfigured = true;
      Logger.info('[Cloudinary] Configured via individual credentials');
    } else {
      Logger.warn('[Cloudinary] Missing CLOUDINARY_URL or credentials in environment');
    }
  }

  /**
   * Upload an image to Cloudinary in the structured folder:
   * Elsa3ed-Market/products/{productId}/{filename}
   */
  async upload(options: UploadFileOptions): Promise<UploadResult> {
    this.configure();

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

    if (!fileKey) return false;

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
