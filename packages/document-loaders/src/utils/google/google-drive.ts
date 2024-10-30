import process from 'process';
import { google } from 'googleapis';
import { anyOf, buildRegExp, charClass, lookbehind, oneOrMore, word } from 'ts-regex-builder';
import type { AuthClient, OAuth2Client } from 'google-auth-library';
import { logger } from '@callstack/byorg-utils';
import { DocumentMetadata } from '../../loaders/types.js';
import { loadPdfContentFromBuffer } from '../pdf/loader.js';
import { parsePdfContentToPages } from '../pdf/parser.js';

// Identifies file id in a url from google drive
const fileIdChar = charClass(word, anyOf('-'));
const fileIdRegex = buildRegExp([lookbehind('/d/'), oneOrMore(fileIdChar)]);

export function extractFileIdFromUrl(fileUrl: string) {
  const url = new URL(fileUrl);
  const fileId = url.pathname.match(fileIdRegex)?.[0];
  if (!fileId) {
    logger.error("Didn't recognize file Id");
    process.exit(0);
  }
  return fileId;
}

export async function fetchFileMetadata(
  authClient: AuthClient,
  url: string,
): Promise<DocumentMetadata | null> {
  const fileId = extractFileIdFromUrl(url);
  const drive = google.drive({
    version: 'v3',
    auth: authClient as OAuth2Client,
  });

  const response = await drive.files.get({
    fileId,
    fields: 'name,mimeType,modifiedTime,labelInfo',
  });

  const metadata = response?.data;
  if (!metadata?.name) {
    return null;
  }

  return {
    url,
    title: metadata.name,
    lastModified: metadata.modifiedTime ? new Date(metadata.modifiedTime) : undefined,
  };
}

export async function fetchPdfFileAsPages(
  authClient: AuthClient,
  fileUrl: string,
): Promise<string[]> {
  const fileId = extractFileIdFromUrl(fileUrl);
  const drive = google.drive({
    version: 'v3',
    auth: authClient as OAuth2Client,
  });

  const response = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' });

  const buffer = (await response.data) as ArrayBuffer;
  const content = await loadPdfContentFromBuffer(buffer);

  return parsePdfContentToPages(content);
}

export async function fetchSlidesAsPages(authClient: AuthClient, url: string): Promise<string[]> {
  const slidesRootUrl = 'https://docs.google.com/presentation/d/';
  const fileId = extractFileIdFromUrl(url);

  const formattedUrl = `${slidesRootUrl}${fileId}/export/pdf?id=${fileId}`;

  const headers = await authClient.getRequestHeaders();

  const response = await fetch(formattedUrl, {
    headers,
    redirect: 'follow',
    credentials: 'include',
  });

  if (response.status !== 200) {
    throw new Error(`GoogleDrive/fetchSlidesAsPages Invalid response status: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const content = await loadPdfContentFromBuffer(buffer);
  return parsePdfContentToPages(content);
}

export async function fetchDocAsMarkdown(authClient: AuthClient, fileUrl: string) {
  const fileId = extractFileIdFromUrl(fileUrl);
  const drive = google.drive({
    version: 'v3',
    auth: authClient as OAuth2Client,
  });

  const response = await drive.files.export(
    { fileId, alt: 'media', mimeType: 'text/markdown' },
    { responseType: 'arraybuffer' },
  );

  if (response.status !== 200) {
    throw new Error(`GoogleDrive/fetchDocAsMarkdown Invalid response status: ${response.status}`);
  }

  // @ts-expect-error googleapis typic is incorrect
  const buffer = Buffer.from(response.data);
  return new TextDecoder().decode(buffer);
}
