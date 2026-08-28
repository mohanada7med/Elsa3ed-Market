import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { validateAndGetEnv } from './config/env.ts';
import { getDatabase } from './db/mongodb.ts';
import { authenticate } from './middleware/auth.ts';
import { requestIdMiddleware } from './middleware/requestId.ts';
import { securityHeadersMiddleware } from './middleware/security.ts';
import { standardApiLimiter } from './middleware/rateLimiter.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { Logger } from './utils/logger.ts';

// Routes
import authRoutes from './routes/authRoutes.ts';
import productRoutes from './routes/productRoutes.ts';
import sellerRoutes from './routes/sellerRoutes.ts';
import adminRoutes from './routes/adminRoutes.ts';
import cartRoutes from './routes/cartRoutes.ts';
import orderRoutes from './routes/orderRoutes.ts';
import commonRoutes from './routes/commonRoutes.ts';
import categoryRoutes from './routes/categoryRoutes.ts';
import craftStoryRoutes from './routes/craftStoryRoutes.ts';
import uploadRoutes from './routes/uploadRoutes.ts';
import seoRoutes from './routes/seoRoutes.ts';

export function createApp(): Express {
  const env = validateAndGetEnv();
  const app = express();

  // 1. Global Security & Tracing Middlewares
  app.disable('x-powered-by');
  app.use(securityHeadersMiddleware);
  app.use(requestIdMiddleware);

  // 2. CORS Handling for Vercel, localhost & custom origins with credentials
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-user-id,x-user-role,x-request-id');
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  // 3. Cookie parser for secure HTTP-only authentication tokens
  app.use(cookieParser());

  // 4. Body parsers
  app.use(express.json({ limit: `${env.MAX_UPLOAD_SIZE_MB + 2}mb` }));
  app.use(express.urlencoded({ extended: true, limit: `${env.MAX_UPLOAD_SIZE_MB + 2}mb` }));

  // 4. Static Uploads folder serving
  const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
  app.use('/uploads', express.static(uploadsPath, { maxAge: '7d', etag: true }));

  // 5. SEO routes (Sitemap & Robots at root level)
  app.use(seoRoutes);

  // 6. Authentication Context
  app.use(authenticate);

  // 7. Initialize Database Connection Pool asynchronously
  getDatabase().catch((err: any) => {
    Logger.error('[App] Database startup error:', err?.message || err);
  });

  // 8. Health check endpoint verifying database connectivity
  const healthHandler = async (req: express.Request, res: express.Response) => {
    try {
      const { db: currentDb, isMongo: currentIsMongo } = await getDatabase();
      let dbConnected = false;
      let pingLatencyMs = 0;

      if (currentIsMongo && currentDb) {
        const start = Date.now();
        await currentDb.command({ ping: 1 });
        pingLatencyMs = Date.now() - start;
        dbConnected = true;
      }

      const isHealthy = dbConnected || env.NODE_ENV !== 'production';

      res.status(isHealthy ? 200 : 503).json({
        status: dbConnected ? 'ok' : 'degraded',
        database: dbConnected ? 'connected' : 'disconnected',
        pingMs: dbConnected ? pingLatencyMs : null,
        environment: env.NODE_ENV,
        databaseName: env.MONGODB_DB,
        timestamp: new Date().toISOString(),
        ...(!dbConnected && {
          hint: 'Ensure MONGODB_URI is set in Vercel environment variables and 0.0.0.0/0 is added in MongoDB Atlas Network Access.'
        })
      });
    } catch (err: any) {
      const isTimeout = err?.name === 'MongoServerSelectionError' || err?.message?.includes('timed out');
      res.status(503).json({
        status: 'error',
        database: 'disconnected',
        error: err?.message || 'Database connection error',
        hint: isTimeout
          ? 'MongoDB Atlas Network Access blocked: Go to cloud.mongodb.com -> Network Access -> IP Access List -> Add 0.0.0.0/0 (Allow Access from Anywhere).'
          : 'Check your MONGODB_URI credentials in Vercel project settings.'
      });
    }
  };

  app.get('/api/health', healthHandler);
  app.get('/health', healthHandler);

  // 9. API Routes with rate limiting
  app.use('/api', standardApiLimiter);

  // Dual mount (/api/xxx and /xxx) for resilience on Vercel serverless rewrites
  const routeModules = [
    { prefix: '/auth', router: authRoutes },
    { prefix: '/upload', router: uploadRoutes },
    { prefix: '/categories', router: categoryRoutes },
    { prefix: '/craft-stories', router: craftStoryRoutes },
    { prefix: '/products', router: productRoutes },
    { prefix: '/cart', router: cartRoutes },
    { prefix: '/orders', router: orderRoutes },
    { prefix: '/seller', router: sellerRoutes },
    { prefix: '/admin', router: adminRoutes },
    { prefix: '', router: commonRoutes }
  ];

  for (const { prefix, router } of routeModules) {
    app.use(`/api${prefix}`, router);
    if (prefix) {
      app.use(prefix, router);
    }
  }

  // 10. Centralized Error Handler for API
  app.use('/api', errorHandler);

  return app;
}
