import {
  fetchPdfFileAsPages,
  extractFileIdFromUrl,
  fetchFileMetadata,
} from '../utils/google/google-drive.js';
import { getGoogleAuthClient } from '../utils/google/auth.js';
import { DocumentLoader } from './types.js';

const URL_ROOT = 'https://drive.google.com/file/d/';

export const googleDriveLoader: DocumentLoader = {
  isSupported,
  loadDocument,
  loadMetadata,
};

function isSupported(source: string) {
  return source.startsWith(URL_ROOT);
}

async function loadDocument(url: string) {
  const authClient = await getGoogleAuthClient();

  const fileMetadata = await fetchFileMetadata(authClient, url);
  if (!fileMetadata) {
    throw new Error(`DocumentLoader/GoogleDrive Document name not found: ${url}`);
  }

  const contentChunks = await fetchPdfFileAsPages(authClient, url);

  return {
    content: contentChunks.join('\n\n'),
    metadata: { ...fileMetadata, url: formatStandardizedUrl(url) },
  };
}

async function loadMetadata(url: string) {
  const authClient = await getGoogleAuthClient();

  const fileMetadata = await fetchFileMetadata(authClient, url);
  if (!fileMetadata) {
    throw new Error(`DocumentLoader/GoogleDrive Document name not found: ${url}`);
  }

  return fileMetadata;
}

function formatStandardizedUrl(url: string) {
  const fileId = extractFileIdFromUrl(url);
  return `${URL_ROOT}${fileId}`;
}
