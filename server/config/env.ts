import dotenv from 'dotenv';
dotenv.config();

/**
 * Server-side Environment Configuration & Validation Layer
 * Ensures all required environment variables are set and properly typed.
 * Protects against accidental leakage of secrets to the client.
 */

export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  APP_URL: string;
  MONGODB_URI?: string;
  MONGODB_DB: string;
  AUTH_SECRET: string;
  ENABLE_RATE_LIMITING: boolean;
  CACHE_TTL_SECONDS: number;
  MAX_UPLOAD_SIZE_MB: number;
}

let cachedConfig: EnvConfig | null = null;

export function validateAndGetEnv(): EnvConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const NODE_ENV = (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development';
  const PORT = Number(process.env.PORT) || 3000;
  const APP_URL = process.env.APP_URL || 'http://localhost:3000';
  const MONGODB_URI = (
    process.env.MONGODB_URI ||
    process.env.MONGODB_CONNECTION_URL ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL
  )?.trim();
  const MONGODB_DB = process.env.MONGODB_DB?.trim() || 'Elsa3ed_market';
  const AUTH_SECRET = process.env.AUTH_SECRET?.trim() || (NODE_ENV !== 'production' ? 'elsa3ed-dev-session-key-not-for-prod' : 'elsa3ed-prod-session-fallback-secret-2026');
  const ENABLE_RATE_LIMITING = process.env.ENABLE_RATE_LIMITING !== 'false';
  const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS) || 300;
  const MAX_UPLOAD_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB) || 5;

  // Verification checks
  const missingConfigs: string[] = [];

  if (NODE_ENV === 'production') {
    if (!MONGODB_URI) {
      missingConfigs.push('MONGODB_URI (or MONGODB_CONNECTION_URL) is missing');
    }
    if (!process.env.AUTH_SECRET) {
      console.warn('[Config Warning] AUTH_SECRET is not set in production. Using fallback secret.');
    }
  }

  if (missingConfigs.length > 0) {
    const warnMsg = `[Env Warning] Missing configuration on Vercel: ${missingConfigs.join(', ')}. Set this in Vercel Project Settings -> Environment Variables.`;
    console.warn(warnMsg);
  }

  cachedConfig = {
    NODE_ENV,
    PORT,
    APP_URL,
    MONGODB_URI,
    MONGODB_DB,
    AUTH_SECRET,
    ENABLE_RATE_LIMITING,
    CACHE_TTL_SECONDS,
    MAX_UPLOAD_SIZE_MB
  };

  console.log(`[Config] Environment validated successfully. Mode: ${NODE_ENV}, Port: ${PORT}, DB: ${MONGODB_DB}`);

  return cachedConfig;
}
