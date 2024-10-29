import path from 'node:path';

export function extractFilename(url: string): string {
  return path.basename(new URL(url).pathname);
}
