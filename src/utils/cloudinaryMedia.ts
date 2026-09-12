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
  /** Target max width or height limit (e.g. 720 for mobile, 1080 for desktop) */
  maxDimension?: number;
  /** Force MP4 container if true (default: true for universal mobile/desktop playback) */
  forceMp4?: boolean;
  /** Quality mode: 'auto' (default) | 'eco' (mobile bandwidth saver) */
  qualityMode?: 'auto' | 'eco';
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
 * - Injects `f_auto,q_auto` and mobile-smart dimensions `w_720,c_limit`.
 * - Enables `fl_faststart` so playback begins immediately without full download.
 * - Transcodes raw QuickTime `.mov` and phone recordings to streaming-ready `.mp4`.
 * - Non-Cloudinary URLs are safely returned untouched.
 */
export function getOptimizedVideoUrl(
  url?: string | null,
  options?: VideoOptimizationOptions
): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Adaptive mobile compression: if no dimension is specified, use 720 on mobile viewports
  let targetDimension = options?.maxDimension;
  if (!targetDimension && typeof window !== 'undefined' && window.innerWidth <= 768) {
    targetDimension = 720;
  }

  // Return cached result if already computed
  const cacheKey = `${trimmed}_${targetDimension || 0}_${options?.forceMp4 ?? true}_${options?.qualityMode || 'auto'}`;
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
    const parts: string[] = ['f_auto'];
    if (options?.qualityMode === 'eco') {
      parts.push('q_auto:eco');
    } else {
      parts.push('q_auto');
    }

    if (targetDimension && targetDimension > 0) {
      parts.push(`w_${targetDimension}`, 'c_limit');
    }

    // Faststart ensures MP4 metadata (moov atom) is at front for instant start
    parts.push('fl_faststart');

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

  // If we have a Cloudinary video URL, extract the first frame (so_1.0) as a lightweight JPEG
  if (videoUrl && typeof videoUrl === 'string' && videoUrl.includes('res.cloudinary.com')) {
    try {
      let derivedPoster = videoUrl.trim();
      const uploadIndex = derivedPoster.indexOf('/video/upload/');

      if (uploadIndex !== -1) {
        const prefix = derivedPoster.substring(0, uploadIndex + '/video/upload/'.length);
        let suffix = derivedPoster.substring(uploadIndex + '/video/upload/'.length);

        // Remove any existing transformations in suffix if starting with parameters
        if (suffix.startsWith('f_auto') || suffix.startsWith('so_') || suffix.startsWith('w_') || suffix.startsWith('q_')) {
          const nextSlash = suffix.indexOf('/');
          if (nextSlash !== -1) {
            suffix = suffix.substring(nextSlash + 1);
          }
        }

        // Change video extension (.mov, .mp4, etc.) to .jpg
        suffix = suffix.replace(/\.[a-zA-Z0-9]+$/, '.jpg');

        derivedPoster = `${prefix}so_1.0,f_auto,q_auto,w_${width},c_limit/${suffix}`;
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

/**
 * Captures an instant high-quality JPEG poster frame from a local video file or Blob
 * using HTML5 Video + Canvas. Takes frame at targetTime (default: 1.0s).
 */
export async function captureVideoFrame(
  videoSource: File | Blob | string,
  targetTime = 1.0
): Promise<{ dataUrl: string; duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window unavailable'));
    }

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    const url = typeof videoSource === 'string' ? videoSource : URL.createObjectURL(videoSource);
    video.src = url;

    const cleanup = () => {
      if (typeof videoSource !== 'string' && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };

    video.onloadedmetadata = () => {
      // Seek to targetTime or 20% into video
      const seekTime = Math.min(targetTime, Math.max(0.2, (video.duration || 2) * 0.2));
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      try {
        const width = video.videoWidth || 720;
        const height = video.videoHeight || 1280;
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(width, 720);
        canvas.height = Math.round((canvas.width / width) * height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          return reject(new Error('Canvas context unavailable'));
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        const result = {
          dataUrl,
          duration: video.duration || 0,
          width,
          height
        };
        cleanup();
        resolve(result);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Failed to load video for poster capture'));
    };
  });
}
