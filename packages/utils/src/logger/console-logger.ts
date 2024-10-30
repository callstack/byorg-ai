import { Logger } from './types.js';

export const consoleLogger: Logger = {
  debug(message: string, ...args: unknown[]): void {
    console.debug(`🟤${formatExtras()} ${message}`, ...args);
  },

  info(message: string, ...args: unknown[]): void {
    console.info(`🔵${formatExtras()} ${message}`, ...args);
  },

  warn(message: string, ...args: unknown[]): void {
    console.warn(`🟠${formatExtras()} ${message}`, ...args);
  },

  error(error: unknown, ...args: unknown[]): void {
    const message = error instanceof Error ? error.message : error!.toString();
    console.error(`🔴${formatExtras()} ${message}`, ...args);
  },
};

function formatExtras(): string {
  return `[${new Date().toISOString()}]`;
}
