import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { validateAndGetEnv } from './server/config/env.ts';
import { getDatabase } from './server/db/mongodb.ts';
import { authenticate } from './server/middleware/auth.ts';
import { requestIdMiddleware } from './server/middleware/requestId.ts';
import { securityHeadersMiddleware } from './server/middleware/security.ts';
import { standardApiLimiter } from './server/middleware/rateLimiter.ts';
import { errorHandler } from './server/middleware/errorHandler.ts';
import { cacheService } from './server/services/cacheService.ts';
import { Logger } from './server/utils/logger.ts';

// Routes
import authRoutes from './server/routes/authRoutes.ts';
import productRoutes from './server/routes/productRoutes.ts';
import sellerRoutes from './server/routes/sellerRoutes.ts';
import adminRoutes from './server/routes/adminRoutes.ts';
import cartRoutes from './server/routes/cartRoutes.ts';
import orderRoutes from './server/routes/orderRoutes.ts';
import commonRoutes from './server/routes/commonRoutes.ts';
import categoryRoutes from './server/routes/categoryRoutes.ts';
import craftStoryRoutes from './server/routes/craftStoryRoutes.ts';
import uploadRoutes from './server/routes/uploadRoutes.ts';
import seoRoutes from './server/routes/seoRoutes.ts';

async function startServer() {
  // 1. Validate environment configuration
  const env = validateAndGetEnv();
  const PORT = env.PORT || 3000;
  const startTime = Date.now();

  const app = express();

  // 2. Global Security & Tracing Middlewares
  app.disable('x-powered-by');
  app.use(securityHeadersMiddleware);
  app.use(requestIdMiddleware);

  // 3. Body parsers (support larger payloads for base64 image uploads)
  app.use(express.json({ limit: `${env.MAX_UPLOAD_SIZE_MB + 2}mb` }));
  app.use(express.urlencoded({ extended: true, limit: `${env.MAX_UPLOAD_SIZE_MB + 2}mb` }));

  // 4. Static Uploads folder serving
  const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
  app.use('/uploads', express.static(uploadsPath, { maxAge: '7d', etag: true }));

  // 5. SEO routes (Sitemap & Robots at root level)
  app.use(seoRoutes);

  // 6. Authentication Context
  app.use(authenticate);

  // 7. Initialize Database Connection Pool
  await getDatabase();

  // 8. Health check endpoint verifying database connectivity without exposing secrets
  app.get('/api/health', async (req, res) => {
    try {
      const { db, isMongo } = await getDatabase();
      let dbConnected = true;
      if (isMongo && db) {
        await db.command({ ping: 1 });
      }
      res.json({
        status: 'ok',
        database: dbConnected ? 'connected' : 'disconnected'
      });
    } catch {
      res.status(503).json({
        status: 'error',
        database: 'disconnected'
      });
    }
  });

  // 9. API Routes with rate limiting
  app.use('/api', standardApiLimiter);
  app.use('/api/auth', authRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/craft-stories', craftStoryRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/seller', sellerRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', commonRoutes);

  // 10. Centralized Error Handler for API
  app.use('/api', errorHandler);

  // 11. Frontend Serving (Vite in Dev / Static in Prod)
  if (process.env.NODE_ENV !== 'production') {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : undefined
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { maxAge: '1d' }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Graceful shutdown handling
  const server = app.listen(PORT, '0.0.0.0', () => {
    Logger.info(`[Elsa3ed Market] Production-ready server running at http://0.0.0.0:${PORT} in [${env.NODE_ENV}] mode`);
  });

  const shutdown = () => {
    Logger.info('[Server] Gracefully shutting down...');
    server.close(() => {
      Logger.info('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('[Elsa3ed Market] Server failed to start:', err);
});
