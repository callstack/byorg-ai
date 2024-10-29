import { googleDriveLoader } from './google-drive.js';
import { googleSlidesLoader } from './google-slides.js';
import { googleDocsLoader } from './google-docs.js';
import { DocumentLoader, DocumentLoaderResult } from './types.js';
import { notionLoader } from './notion.js';
import { notionPdfBlockLoader } from './notion-pdf-block.js';

const loaders: DocumentLoader[] = [
  notionPdfBlockLoader,
  googleDriveLoader,
  googleSlidesLoader,
  googleDocsLoader,
  notionLoader,
];

export function loadDocument(source: string): Promise<DocumentLoaderResult> {
  for (const loader of loaders) {
    if (loader.isSupported(source)) {
      return loader.loadDocument(source);
    }
  }

  throw new Error(`DocumentLoader Unsupported document type ${source}`);
}
