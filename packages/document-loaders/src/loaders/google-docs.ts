import {
  extractFileIdFromUrl,
  fetchDocAsMarkdown,
  fetchFileMetadata,
} from '../utils/google/google-drive.js';
import { getGoogleAuthClient } from '../utils/google/auth.js';
import { DocumentLoader, DocumentMetadata } from './types.js';

const URL_ROOT = 'https://docs.google.com/document/d/';

export const googleDocsLoader: DocumentLoader = {
  isSupported,
  loadDocument,
};

function isSupported(source: string) {
  return source.startsWith(URL_ROOT);
}

async function loadMetadata(url: string): Promise<DocumentMetadata> {
  const authClient = await getGoogleAuthClient();
  const fileMetadata = await fetchFileMetadata(authClient, url);
  if (!fileMetadata) {
    throw new Error(`DocumentLoader/GoogleDocs Document metadata not found: ${url}`);
  }

  return {
    ...fileMetadata,
    url: formatStandardizedUrl(url),
  };
}

async function loadDocument(url: string) {
  const metadata = await loadMetadata(url);

  const authClient = await getGoogleAuthClient();
  const content = await fetchDocAsMarkdown(authClient, url);

  return { content, metadata };
}

function formatStandardizedUrl(url: string) {
  const fileId = extractFileIdFromUrl(url);
  return `${URL_ROOT}${fileId}`;
}
