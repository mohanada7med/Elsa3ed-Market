import next from 'next';
import { validateAndGetEnv } from './server/config/env.ts';
import { Logger } from './server/utils/logger.ts';
import { createApp } from './server/app.ts';

async function startServer() {
  const env = validateAndGetEnv();
  const PORT = env.PORT || 3000;
  const dev = env.NODE_ENV !== 'production';

  const nextApp = next({ dev });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();
  const app = createApp();

  // Next.js handles all frontend pages and assets
  app.all('*', (req, res) => {
    return handle(req, res);
  });

  // Graceful shutdown handling
  const server = app.listen(PORT, '0.0.0.0', () => {
    Logger.info(`[Elsa3ed Market] Next.js + Node.js server running at http://0.0.0.0:${PORT} in [${env.NODE_ENV}] mode`);
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
