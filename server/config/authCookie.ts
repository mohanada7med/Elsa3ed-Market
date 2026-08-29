import type { Request, Response, CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'saeed_auth_token';
export const AUTH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export function getAuthCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
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
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  });
}

export function getAuthTokenFromRequest(req: Request): string | null {
  // 1. Authorization Bearer header (highest priority for SPA / API clients)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }

  // 2. Direct x-auth-token header
  const xAuthToken = req.headers['x-auth-token'];
  if (xAuthToken && typeof xAuthToken === 'string' && xAuthToken.trim()) {
    return xAuthToken.trim();
  }

  // 3. Cookie-parser populated cookies
  if (req.cookies && typeof req.cookies === 'object' && req.cookies[AUTH_COOKIE_NAME]) {
    return req.cookies[AUTH_COOKIE_NAME];
  }

  // 4. Direct Header cookie parsing fallback
  const rawCookie = req.headers.cookie;
  if (rawCookie) {
    const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]*)`));
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}
