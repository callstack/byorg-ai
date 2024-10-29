import type { Brand } from './types.js';
import type { FileBuffer } from './domain.js';

export type Base64 = Brand<string, 'base64'>;

export function getBase64ForFileBuffer(file: FileBuffer): Base64 {
  const encodedImage = Buffer.from(file.buffer).toString('base64');
  return `data:${file.mimeType};base64,${encodedImage}` as Base64;
}
