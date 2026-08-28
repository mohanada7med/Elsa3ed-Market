import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes to prevent memory leaks
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);
if (typeof cleanupTimer?.unref === 'function') {
  cleanupTimer.unref();
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyPrefix?: string;
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max, message, keyPrefix = 'rl' } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // If rate limiting is disabled via env
    if (process.env.ENABLE_RATE_LIMITING === 'false') {
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    let record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      rateLimitMap.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        error: message || 'تجاوزت الحد المسموح من الطلبات، يرجى الانتظار قليلاً وإعادة المحاولة',
        code: 'TOO_MANY_REQUESTS',
        retryAfter: retryAfterSeconds
      });
    }

    next();
  };
}

// Pre-configured rate limiters
export const standardApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  keyPrefix: 'std',
  message: 'تم تجاوز الحد الأقصى لتصفح المنصة في الدقيقة، يرجى الانتظار قليلاً'
});

export const mutationLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  keyPrefix: 'mut',
  message: 'تم استقبال عدد كبير من عمليات الإرسال، يرجى الانتظار دقيقة واحدة'
});

export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  keyPrefix: 'upl',
  message: 'تم تجاوز الحد المسموح لرفع الصور والملفات، يرجى المحاولة بعد قليل'
});

export const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 25,
  keyPrefix: 'auth',
  message: 'تم تجاوز محاولات تسجيل الدخول، يرجى الانتظار دقيقة لحماية الحساب'
});
