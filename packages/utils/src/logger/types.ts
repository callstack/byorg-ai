export interface Logger {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: unknown, ...args: unknown[]) => void;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
