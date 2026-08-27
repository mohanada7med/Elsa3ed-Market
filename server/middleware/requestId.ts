import { Request, Response, NextFunction } from 'express';

export interface RequestWithId extends Request {
  id?: string;
  startTime?: number;
}

export function requestIdMiddleware(req: RequestWithId, res: Response, next: NextFunction) {
  const incomingId = (req.headers['x-request-id'] as string) || (req.headers['x-correlation-id'] as string);
  const requestId = incomingId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  req.id = requestId;
  req.startTime = Date.now();
  res.setHeader('X-Request-ID', requestId);

  // Response time logger
  res.on('finish', () => {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    if (req.url.startsWith('/api') && !req.url.startsWith('/api/health')) {
      const statusColor = res.statusCode >= 500 ? '🔴' : res.statusCode >= 400 ? '🟡' : '🟢';
      console.log(`[API ${statusColor}] ${req.method} ${req.originalUrl || req.url} -> ${res.statusCode} (${duration}ms) [${requestId}]`);
    }
  });

  next();
}
