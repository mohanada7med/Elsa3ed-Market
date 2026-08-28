import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { validateAndGetEnv } from './server/config/env.ts';
import { Logger } from './server/utils/logger.ts';
import { createApp } from './server/app.ts';

async function startServer() {
  const env = validateAndGetEnv();
  const PORT = env.PORT || 3000;
  const app = await createApp();

  // Frontend Serving (Vite in Dev / Static in Prod)
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
