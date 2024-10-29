import { Logger, LogLevel } from './types.js';
import { consoleLogger } from './console-logger.js';

const severity: Record<LogLevel, number> = {
  error: 400,
  warn: 300,
  info: 200,
  debug: 100,
};

let logLevel: LogLevel = 'info';
let logger: Logger = consoleLogger;

export function debug(message: string, ...args: unknown[]): void {
  if (!isMoreOrEqualSevere('debug', logLevel)) {
    return;
  }

  logger.debug(message, ...args);
}

export function info(message: string, ...args: unknown[]): void {
  if (!isMoreOrEqualSevere('info', logLevel)) {
    return;
  }

  logger.info(message, ...args);
}

export function warn(message: string, ...args: unknown[]): void {
  if (!isMoreOrEqualSevere('warn', logLevel)) {
    return;
  }

  logger.warn(message, ...args);
}

export function error(message: unknown, ...args: unknown[]): void {
  if (!isMoreOrEqualSevere('error', logLevel)) {
    return;
  }

  logger.error(message, ...args);
}

export function setLogger(impl: Logger): void {
  logger = impl;
}

export function getLevel(): LogLevel {
  return logLevel;
}

export function setLevel(newLogLevel: LogLevel): void {
  logLevel = newLogLevel;
}

function isMoreOrEqualSevere(a: LogLevel, b: LogLevel): boolean {
  return severity[a] >= severity[b];
}
