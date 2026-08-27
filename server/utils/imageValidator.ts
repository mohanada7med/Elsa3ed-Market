/**
 * Image Validation Utility
 * Enforces strict MIME types, file extensions, and file sizes
 * to prevent security vulnerabilities.
 */

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
];

export const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.svg'
];

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  mimeType?: string;
  extension?: string;
  sizeBytes?: number;
}

export function validateImage(
  data: string | Buffer,
  filename?: string,
  declaredMimeType?: string
): ImageValidationResult {
  let mimeType = declaredMimeType?.toLowerCase();
  let buffer: Buffer;

  // ============================================================
  // 1. Convert input to Buffer
  // ============================================================

  if (typeof data === 'string') {
    if (data.startsWith('data:')) {
      // Handle Base64 Data URI
      const match = data.match(
        /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/
      );

      if (!match) {
        return {
          valid: false,
          error: 'صيغة الصورة المشفرة Data-URI غير صالحة'
        };
      }

      // MIME type comes directly from the Data URI
      mimeType = match[1].toLowerCase();

      const base64Data = match[2];

      try {
        buffer = Buffer.from(base64Data, 'base64');
      } catch {
        return {
          valid: false,
          error: 'بيانات الصورة المشفرة غير صالحة'
        };
      }
    } else {
      // Handle raw Base64 string
      try {
        buffer = Buffer.from(data, 'base64');
      } catch {
        return {
          valid: false,
          error: 'بيانات الصورة المشفرة غير صالحة'
        };
      }
    }
  } else {
    buffer = data;
  }

  const sizeBytes = buffer.length;

  // ============================================================
  // 2. Size Check
  // ============================================================

  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `حجم الصورة (${(sizeBytes / (1024 * 1024)).toFixed(
        2
      )} ميجابايت) يتجاوز الحد الأقصى المسموح (5 ميجابايت)`
    };
  }

  if (sizeBytes < 100) {
    return {
      valid: false,
      error: 'ملف الصورة تالف أو فارغ'
    };
  }

  // ============================================================
  // 3. MIME Type Check
  // ============================================================

  if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `نوع الملف (${mimeType}) غير مدعوم. الصيغ المدعومة هي JPG، PNG، WebP، GIF، SVG`
    };
  }

  // ============================================================
  // Debug Information
  // ============================================================

  console.log('IMAGE VALIDATION DEBUG:', {
    filename,
    declaredMimeType,
    detectedMimeType: mimeType,
    dataType: typeof data,
    isDataUri:
      typeof data === 'string' && data.startsWith('data:')
  });

  // ============================================================
  // 4. Filename Validation
  // ============================================================

  let extension: string | undefined;

  if (filename && filename.trim() !== '') {
    const safeFilename = filename.trim();

    // Prevent path traversal
    if (
      safeFilename.includes('..') ||
      safeFilename.includes('/') ||
      safeFilename.includes('\\')
    ) {
      return {
        valid: false,
        error: 'اسم الملف غير صالح ويحتوي على محارف غير آمنة'
      };
    }

    const dotIndex = safeFilename.lastIndexOf('.');

    /**
     * IMPORTANT:
     *
     * Filename extension is optional.
     *
     * Example:
     * image_1
     * image_123
     *
     * These are valid when the actual image type is detected
     * from the Data URI / MIME type / Magic Bytes.
     */
    if (dotIndex !== -1) {
      extension = safeFilename.substring(dotIndex).toLowerCase();

      // Check extension
      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return {
          valid: false,
          error: `امتداد الملف (${extension}) غير مسموح به`
        };
      }

      // ========================================================
      // 5. Extension ↔ MIME Type Validation
      // ========================================================

      if (mimeType) {
        const extensionMimeMap: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.webp': 'image/webp',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml'
        };

        const expectedMimeType = extensionMimeMap[extension];

        if (
          expectedMimeType &&
          expectedMimeType !== mimeType
        ) {
          return {
            valid: false,
            error: 'امتداد الملف لا يتطابق مع نوع الصورة'
          };
        }
      }
    }
  }

  // ============================================================
  // 6. Magic Bytes Inspection
  // ============================================================

  if (buffer.length >= 4) {
    // JPEG
    const isJpeg =
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff;

    // PNG
    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;

    // GIF
    const isGif =
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46;

    // WebP
    const isWebp =
      buffer.length >= 12 &&
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;

    // SVG
    const initialContent = buffer
      .toString('utf8', 0, Math.min(1000, buffer.length))
      .trim()
      .toLowerCase();

    const isSvg =
      initialContent.includes('<svg') ||
      initialContent.startsWith('<?xml') &&
      initialContent.includes('<svg');

    // ============================================================
    // Detect actual image type
    // ============================================================

    let detectedMimeType: string | undefined;

    if (isJpeg) {
      detectedMimeType = 'image/jpeg';
    } else if (isPng) {
      detectedMimeType = 'image/png';
    } else if (isGif) {
      detectedMimeType = 'image/gif';
    } else if (isWebp) {
      detectedMimeType = 'image/webp';
    } else if (isSvg) {
      detectedMimeType = 'image/svg+xml';
    }

    // ============================================================
    // Invalid image structure
    // ============================================================

    if (!detectedMimeType) {
      return {
        valid: false,
        error:
          'الملف المرفوع لا يتطابق مع البنية الثنائية للصور المعتمدة'
      };
    }

    // ============================================================
    // MIME ↔ Magic Bytes Validation
    // ============================================================

    if (mimeType && detectedMimeType !== mimeType) {
      return {
        valid: false,
        error:
          'نوع الصورة المعلن لا يتطابق مع محتوى الملف الفعلي'
      };
    }

    // If MIME wasn't provided, use detected MIME
    mimeType = detectedMimeType;
  }

  // ============================================================
  // 7. Final Validation
  // ============================================================

  return {
    valid: true,
    mimeType: mimeType || 'image/jpeg',
    extension,
    sizeBytes
  };
};