import type { Request, Response, NextFunction } from 'express';

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
        error: message || 'طلبات كتير ورا بعض، استنى ثواني وجرب تاني',
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
  message: 'طلبات تصفح كتيرة في وقت قصير، استنى شوية وجرب تاني'
});

export const mutationLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  keyPrefix: 'mut',
  message: 'إرسال طلبات كتير ورا بعض، استنى دقيقة وجرب تاني'
});

export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  keyPrefix: 'upl',
  message: 'رفعت ملفات كتير في وقت قصير، استنى شوية وجرب تاني'
});

export const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 25,
  keyPrefix: 'auth',
  message: 'محاولات دخول كتيرة ورا بعض، استنى دقيقة لحماية حسابك'
});

export const forgotPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 requests per 15 minutes
  keyPrefix: 'forgot_pwd',
  message: 'طلبت استعادة كلمة السر كذا مرة، استنى ربع ساعة وجرب تاني عشان أمان حسابك'
});

export const resetPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  keyPrefix: 'reset_pwd',
  message: 'محاولات كثيرة لإعادة تعيين كلمة السر، استنى شوية وجرب تاني'
});

