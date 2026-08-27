import path from 'path';
import fs from 'fs';
import { validateImage } from '../../utils/imageValidator.ts';
import { Logger } from '../../utils/logger.ts';

export interface UploadFileOptions {
  data: string | Buffer; // Base64 data-uri or raw buffer
  filename?: string;
  mimeType?: string;
  folder?: 'products' | 'sellers' | 'categories' | 'receipts' | 'users';
  productId?: string;
  userId?: string;
  ownerId?: string;
  customPublicId?: string;
  overwrite?: boolean;
}

export interface UploadResult {
  url: string;
  fileKey: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface IStorageProvider {
  upload(options: UploadFileOptions): Promise<UploadResult>;
  delete(fileKey: string, requestingUser?: { id: string; role: string }): Promise<boolean>;
  getUrl(fileKey: string): string;
}

export class LocalStorageProvider implements IStorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
      for (const sub of ['products', 'sellers', 'categories', 'receipts']) {
        const subDir = path.join(this.uploadDir, sub);
        if (!fs.existsSync(subDir)) {
          fs.mkdirSync(subDir, { recursive: true });
        }
      }
    } catch (err) {
      Logger.warn('[Storage] Could not create local uploads folder, falling back to memory/data-uri mode');
    }
  }

  async upload(options: UploadFileOptions): Promise<UploadResult> {
    const { data, filename = 'image.jpg', mimeType, folder = 'products', ownerId } = options;

    // 1. Validation
    const validation = validateImage(data, filename, mimeType);
    if (!validation.valid) {
      throw new Error(validation.error || 'فشل في التحقق من صحة الصورة');
    }

    const detectedMime = validation.mimeType || 'image/jpeg';
    const ext = detectedMime === 'image/png' ? '.png' : detectedMime === 'image/webp' ? '.webp' : detectedMime === 'image/svg+xml' ? '.svg' : '.jpg';
    
    // Generate safe unique key
    const cleanOwner = ownerId ? ownerId.replace(/[^a-zA-Z0-9_-]/g, '') : 'gen';
    const timestamp = Date.now();
    const randomSalt = Math.random().toString(36).substring(2, 7);
    const safeKey = `${folder}/${cleanOwner}_${timestamp}_${randomSalt}${ext}`;
    const filePath = path.join(this.uploadDir, safeKey);

    let buffer: Buffer;
    if (typeof data === 'string') {
      if (data.startsWith('data:')) {
        const base64Content = data.split(',')[1];
        buffer = Buffer.from(base64Content, 'base64');
      } else {
        buffer = Buffer.from(data, 'base64');
      }
    } else {
      buffer = data;
    }

    try {
      const parentDir = path.dirname(filePath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${safeKey}`;
      Logger.info(`[Storage] File stored successfully: ${publicUrl} (${validation.sizeBytes} bytes)`);

      return {
        url: publicUrl,
        fileKey: safeKey,
        mimeType: detectedMime,
        sizeBytes: validation.sizeBytes || buffer.length,
        uploadedAt: new Date().toISOString()
      };
    } catch (err) {
      Logger.warn('[Storage] Write to disk failed, generating secure Base64 data-URI url fallback');
      const dataUri = `data:${detectedMime};base64,${buffer.toString('base64')}`;
      return {
        url: dataUri,
        fileKey: safeKey,
        mimeType: detectedMime,
        sizeBytes: validation.sizeBytes || buffer.length,
        uploadedAt: new Date().toISOString()
      };
    }
  }

  async delete(fileKey: string, requestingUser?: { id: string; role: string }): Promise<boolean> {
    // Sanitization against path traversal
    const sanitizedKey = path.normalize(fileKey).replace(/^(\.\.[\/\\])+/, '');
    if (sanitizedKey.includes('..')) {
      throw new Error('مسار الملف غير آمن');
    }

    // Ownership check if user provided and not admin
    if (requestingUser && requestingUser.role !== 'admin') {
      const parts = sanitizedKey.split('/');
      const filename = parts[parts.length - 1];
      if (!filename.startsWith(requestingUser.id)) {
        throw new Error('غير مصرح لك بحذف ملفات لا تخص متجرك');
      }
    }

    const filePath = path.join(this.uploadDir, sanitizedKey);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        Logger.info(`[Storage] Deleted file: ${sanitizedKey}`);
        return true;
      }
      return false;
    } catch (err) {
      Logger.error(`[Storage] Failed to delete file: ${sanitizedKey}`, err);
      return false;
    }
  }

  getUrl(fileKey: string): string {
    if (fileKey.startsWith('http://') || fileKey.startsWith('https://') || fileKey.startsWith('data:')) {
      return fileKey;
    }
    return `/uploads/${fileKey.replace(/^\/+/, '')}`;
  }
}

import { cloudinaryStorage } from './cloudinaryProvider.ts';

const localStorageProvider = new LocalStorageProvider();

class DelegatingStorageProvider implements IStorageProvider {
  private getProvider(): IStorageProvider {
    const hasCloudinary = Boolean(
      process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)
    );
    return hasCloudinary ? cloudinaryStorage : localStorageProvider;
  }

  async upload(options: UploadFileOptions): Promise<UploadResult> {
    return this.getProvider().upload(options);
  }

  async delete(fileKey: string, requestingUser?: { id: string; role: string }): Promise<boolean> {
    return this.getProvider().delete(fileKey, requestingUser);
  }

  getUrl(fileKey: string): string {
    return this.getProvider().getUrl(fileKey);
  }
}

export const storageService: IStorageProvider = new DelegatingStorageProvider();

