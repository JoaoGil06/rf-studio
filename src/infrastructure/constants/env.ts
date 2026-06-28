import { resolve } from 'node:path';

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;

  if (value === undefined) throw new Error(`Missing environment variable: ${key}`);

  return value;
};

export const NODE_ENV = getEnv('NODE_ENV', 'development');
export const PORT = Number(getEnv('PORT', '8000'));
export const DATABASE_URL = getEnv('DATABASE_URL');
export const REDIS_URL = getEnv('REDIS_URL');
export const JWT_SECRET = getEnv('JWT_SECRET');
export const JWT_EXPIRES_IN = getEnv('JWT_EXPIRES_IN');
export const PUBLIC_BASE_URL = getEnv('PUBLIC_BASE_URL', 'http://localhost:8000');
export const ASSETS_DIR = resolve(process.cwd(), getEnv('ASSETS_DIR', 'assets'));
export const FEATURE_FLAGS_PATH = resolve(
  process.cwd(),
  getEnv('FEATURE_FLAGS_PATH', 'feature-flags.json'),
);
