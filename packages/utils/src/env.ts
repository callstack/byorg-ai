import * as logger from './logger/logger.js';

export type DeployEnvironment = 'dev' | 'prod';

export function logEnv(env: DeployEnvironment) {
  if (env === 'prod') {
    logger.warn('Using PROD env!');
  } else {
    logger.info(`Using ${env} env.`);
  }
}

export function requireEnv(key: string, env?: DeployEnvironment) {
  const envKey = formatEnvKey(key, env);

  const value = process.env[envKey];
  if (!value) {
    logger.error(`Missing environment variable: ${envKey}`);
    process.exit(1);
  }

  return value;
}

function formatEnvKey(key: string, env?: DeployEnvironment) {
  if (env === undefined) {
    return key;
  }

  if (env === 'prod') {
    return `PROD_${key}`;
  }

  if (env === 'dev') {
    return `DEV_${key}`;
  }

  throw new Error(`Unknown environment: ${env}`);
}
