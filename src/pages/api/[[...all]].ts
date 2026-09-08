import type { NextApiRequest, NextApiResponse } from 'next';
import { createApp } from '../../../server/app.ts';

let appInstance: any = null;
function getApp() {
  if (!appInstance || process.env.NODE_ENV !== 'production') {
    appInstance = createApp();
  }
  return appInstance;
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return getApp()(req, res);
}
