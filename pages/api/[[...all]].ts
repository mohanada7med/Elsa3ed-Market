import type { NextApiRequest, NextApiResponse } from 'next';
import { createApp } from '../../server/app.ts';

let cachedApp: ReturnType<typeof createApp> | null = null;

function getApp() {
  if (!cachedApp) {
    cachedApp = createApp();
  }
  return cachedApp;
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const app = getApp();
  return app(req, res);
}
