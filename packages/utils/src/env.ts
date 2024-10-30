import * as logger from './logger/logger.js';

export function requireEnv(key: string) {
  const value = process.env[key];
  if (!value) {
    logger.error(`Missing environment variable: ${key}`);
    process.exit(1);
  }

  return value;
}
