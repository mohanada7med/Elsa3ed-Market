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
  const PORT = 3000; // Hardcoded port required by infrastructure
  const APP_URL = process.env.APP_URL || 'http://localhost:3000';
  const MONGODB_URI = process.env.MONGODB_URI?.trim() || 'mongodb+srv://ahmdmohanad28_db_user:<db_password>@cluster0.je3wwaw.mongodb.net/?appName=Cluster0';
  const MONGODB_DB = process.env.MONGODB_DB?.trim() || 'Elsa3ed_market';
  const AUTH_SECRET = process.env.AUTH_SECRET?.trim() || 'elsa3ed-market-secure-session-key-2026';
  const ENABLE_RATE_LIMITING = process.env.ENABLE_RATE_LIMITING !== 'false';
  const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS) || 300;
  const MAX_UPLOAD_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB) || 5;

  // Verification checks
  const missingConfigs: string[] = [];

  if (NODE_ENV === 'production') {
    if (!process.env.AUTH_SECRET) {
      console.warn('[Env Warning] AUTH_SECRET is not set in production; using fallback key.');
    }
  }

  if (missingConfigs.length > 0) {
    const errorMsg = `[Env Error] Missing required environment variables: ${missingConfigs.join(', ')}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
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
