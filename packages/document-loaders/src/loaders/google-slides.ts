import {
  extractFileIdFromUrl,
  fetchFileMetadata,
  fetchSlidesAsPages,
} from '../utils/google/google-drive.js';
import { getGoogleAuthClient } from '../utils/google/auth.js';
import { DocumentLoader } from './types.js';

const URL_ROOT = 'https://docs.google.com/presentation/d/';

export const googleSlidesLoader: DocumentLoader = {
  isSupported,
  loadDocument,
};

function isSupported(source: string) {
  return source.startsWith(URL_ROOT);
}

async function loadMetadata(url: string) {
  const authClient = await getGoogleAuthClient();
  const fileMetadata = await fetchFileMetadata(authClient, url);
  if (!fileMetadata) {
    throw new Error(`DocumentLoader/GoogleSlides Document name not found: ${url}`);
  }

  return {
    ...fileMetadata,
    url: formatStandardizedUrl(url),
  };
}

async function loadDocument(url: string) {
  const metadata = await loadMetadata(url);

  const authClient = await getGoogleAuthClient();
  const slides = await fetchSlidesAsPages(authClient, url);

  return { content: slides.join('\n\n'), metadata };
}

function formatStandardizedUrl(url: string) {
  const fileId = extractFileIdFromUrl(url);
  return `${URL_ROOT}${fileId}`;
}
