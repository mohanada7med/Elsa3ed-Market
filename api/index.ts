import { createApp } from '../server/app.ts';
import type { Request, Response } from 'express';

const app = createApp();

export default function handler(req: Request, res: Response) {
  // Support Vercel serverless environment URL routing
  const matchedPath = req.headers?.['x-matched-path'];
  if (matchedPath && typeof matchedPath === 'string') {
    if (req.url === '/' || req.url === '/api' || req.url === '/api/') {
      req.url = matchedPath;
    }
  }
  return app(req, res);
}