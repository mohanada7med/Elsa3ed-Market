import { Request, Response, CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'saeed_auth_token';
export const AUTH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export function getAuthCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE
  };
}

export function setAuthCookie(res: Response, token: string): void {
  const options = getAuthCookieOptions();
  res.cookie(AUTH_COOKIE_NAME, token, options);
}

export function clearAuthCookie(res: Response): void {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/'
  });
}

export function getAuthTokenFromRequest(req: Request): string | null {
  // 1. Try cookie-parser populated cookies
  if (req.cookies && typeof req.cookies === 'object' && req.cookies[AUTH_COOKIE_NAME]) {
    return req.cookies[AUTH_COOKIE_NAME];
  }

  // 2. Direct Header cookie parsing fallback (handles serverless edge cases)
  const rawCookie = req.headers.cookie;
  if (rawCookie) {
    const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]*)`));
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  // 3. Authorization Bearer header fallback
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}
