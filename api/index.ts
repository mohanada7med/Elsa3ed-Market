import { createApp } from '../server/app.ts';
import type { Request, Response } from 'express';

let cachedApp: any = null;

export const config = {
  maxDuration: 15,
};

export default async function handler(req: Request, res: Response) {
  // Normalize URL when Vercel rewrites collapse the path to /api
  const matchedPath = req.headers['x-matched-path'];
  if (matchedPath && typeof matchedPath === 'string') {
    if (req.url === '/' || req.url === '/api' || req.url === '/api/') {
      req.url = matchedPath;
    }
  }

  try {
    if (!cachedApp) {
      cachedApp = await createApp();
    }
    return cachedApp(req, res);
  } catch (error: any) {
    console.error('[Vercel Serverless Error]:', error);
    res.status(500).json({
      status: 'error',
      message: error?.message || 'Server initialization failed',
      timestamp: new Date().toISOString(),
    });
  }
}