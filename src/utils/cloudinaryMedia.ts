/**
 * WAH | وه - Centralized Cloudinary Media Optimization Utility
 * 
 * Provides high-performance, memoized transformations for:
 * 1. Video delivery optimization (f_auto, q_auto, faststart, codec selection, mp4 normalization).
 * 2. Instant video first-frame poster generation (so_0, f_auto, q_auto, w_800).
 * 3. Safe URL normalization and fallback handling.
 */

const videoUrlCache = new Map<string, string>();
const posterUrlCache = new Map<string, string>();

const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.m4v', '.ogv', '.mkv', '.avi'];

export interface VideoOptimizationOptions {
  /** Target max width or height limit (e.g. 1080 for HD, 720 for mobile) */
  maxDimension?: number;
  /** Force MP4 container if true (default: true for broad mobile/desktop compatibility) */
  forceMp4?: boolean;
}

/**
 * Check if a URL or filename points to a video
 */
export function isVideoUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const lower = url.trim().toLowerCase();
  
  if (lower.includes('/video/upload/') || lower.includes('resource_type=video')) {
    return true;
  }
  
  // Strip query parameters and hashes before checking extension
  const cleanPath = lower.split('?')[0].split('#')[0];
  return VIDEO_EXTENSIONS.some((ext) => cleanPath.endsWith(ext));
}

/**
 * Transforms any Cloudinary video URL into an optimized, fast-starting streamable delivery URL.
 * - Injects `f_auto,q_auto` (with optional dimension bounds like `w_1080,c_limit`).
 * - Transcodes raw QuickTime `.mov` and other phone recordings to streaming-ready `.mp4` with faststart moov atom.
 * - Non-Cloudinary URLs are safely returned untouched.
 */
export function getOptimizedVideoUrl(
  url?: string | null,
  options?: VideoOptimizationOptions
): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Return cached result if already computed
  const cacheKey = `${trimmed}_${options?.maxDimension || 0}_${options?.forceMp4 ?? true}`;
  const cached = videoUrlCache.get(cacheKey);
  if (cached) return cached;

  // Only transform Cloudinary URLs
  if (!trimmed.includes('res.cloudinary.com')) {
    videoUrlCache.set(cacheKey, trimmed);
    return trimmed;
  }

  try {
    let result = trimmed;

    // Normalize QuickTime / raw mobile video extensions to .mp4 for universal browser playback
    const forceMp4 = options?.forceMp4 !== false;
    if (forceMp4 && (result.endsWith('.mov') || result.endsWith('.MOV') || result.endsWith('.webm') || result.endsWith('.m4v'))) {
      result = result.replace(/\.[a-zA-Z0-9]+$/, '.mp4');
    }

    // Prepare transformation string
    const parts: string[] = ['f_auto', 'q_auto'];
    if (options?.maxDimension && options.maxDimension > 0) {
      parts.push(`w_${options.maxDimension}`, 'c_limit');
    }
    const transformString = parts.join(',');

    // Cloudinary URL structure: https://res.cloudinary.com/<cloud_name>/video/upload/[<existing_transformations>/][v<version>/]<public_id>.<ext>
    const uploadIndex = result.indexOf('/video/upload/');
    if (uploadIndex !== -1) {
      const prefix = result.substring(0, uploadIndex + '/video/upload/'.length);
      const suffix = result.substring(uploadIndex + '/video/upload/'.length);

      // Check if already transformed with f_auto or q_auto
      if (suffix.startsWith('f_auto') || suffix.includes('/f_auto') || suffix.includes('q_auto')) {
        videoUrlCache.set(cacheKey, result);
        return result;
      }

      result = `${prefix}${transformString}/${suffix}`;
    }

    videoUrlCache.set(cacheKey, result);
    return result;
  } catch {
    return trimmed;
  }
}

/**
 * Generates or optimizes a video poster thumbnail image:
 * 1. If a valid custom poster image is provided, returns it (with image f_auto,q_auto if on Cloudinary).
 * 2. If no valid image poster exists (or if poster points to a video file!), extracts an instant
 *    first-frame JPEG snapshot directly from Cloudinary using `so_0,f_auto,q_auto,w_800`.
 * 3. Falls back to a high-quality heritage image placeholder if completely unavailable.
 */
export function getOptimizedVideoPoster(
  videoUrl?: string | null,
  customPoster?: string | null,
  width = 800
): string {
  const cacheKey = `${videoUrl || ''}_${customPoster || ''}_${width}`;
  const cached = posterUrlCache.get(cacheKey);
  if (cached) return cached;

  const DEFAULT_FALLBACK_POSTER =
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80';

  // Check if customPoster is a valid image URL (and NOT a video file mistakenly saved as poster!)
  if (customPoster && typeof customPoster === 'string' && customPoster.trim()) {
    const trimmedPoster = customPoster.trim();
    const isActuallyVideo = isVideoUrl(trimmedPoster);

    if (!isActuallyVideo) {
      // If it's a Cloudinary image, optimize delivery
      if (trimmedPoster.includes('res.cloudinary.com') && trimmedPoster.includes('/image/upload/')) {
        if (!trimmedPoster.includes('f_auto') && !trimmedPoster.includes('q_auto')) {
          const optimizedPoster = trimmedPoster.replace(
            '/image/upload/',
            `/image/upload/f_auto,q_auto,w_${width},c_limit/`
          );
          posterUrlCache.set(cacheKey, optimizedPoster);
          return optimizedPoster;
        }
      }
      posterUrlCache.set(cacheKey, trimmedPoster);
      return trimmedPoster;
    }
  }

  // If we have a Cloudinary video URL, extract the first frame (so_0) as a lightweight JPEG
  if (videoUrl && typeof videoUrl === 'string' && videoUrl.includes('res.cloudinary.com')) {
    try {
      let derivedPoster = videoUrl.trim();
      const uploadIndex = derivedPoster.indexOf('/video/upload/');

      if (uploadIndex !== -1) {
        const prefix = derivedPoster.substring(0, uploadIndex + '/video/upload/'.length);
        let suffix = derivedPoster.substring(uploadIndex + '/video/upload/'.length);

        // Remove any existing transformations in suffix if starting with parameters
        if (suffix.startsWith('f_auto') || suffix.startsWith('so_') || suffix.startsWith('w_')) {
          const nextSlash = suffix.indexOf('/');
          if (nextSlash !== -1) {
            suffix = suffix.substring(nextSlash + 1);
          }
        }

        // Change video extension (.mov, .mp4, etc.) to .jpg
        suffix = suffix.replace(/\.[a-zA-Z0-9]+$/, '.jpg');

        derivedPoster = `${prefix}so_0,f_auto,q_auto,w_${width},c_limit/${suffix}`;
        posterUrlCache.set(cacheKey, derivedPoster);
        return derivedPoster;
      }
    } catch {
      // Fall through to default
    }
  }

  posterUrlCache.set(cacheKey, DEFAULT_FALLBACK_POSTER);
  return DEFAULT_FALLBACK_POSTER;
}
