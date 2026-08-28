import { createApp } from '../server/app.ts';
import type { Request, Response, NextFunction } from 'express';

const app = createApp();

// Normalize URL when Vercel rewrites collapse the path to /api
app.use((req: Request, res: Response, next: NextFunction) => {
  const matchedPath = req.headers?.['x-matched-path'];
  if (matchedPath && typeof matchedPath === 'string') {
    if (req.url === '/' || req.url === '/api' || req.url === '/api/') {
      req.url = matchedPath;
    }
  }
  next();
});

export default app;