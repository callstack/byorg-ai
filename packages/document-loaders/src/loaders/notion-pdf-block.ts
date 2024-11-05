import { isFullBlock } from '@notionhq/client';
import { PdfBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints.js';
import { fetchBlock } from '../utils/notion/api.js';
import { loadPdfContentFromBuffer } from '../utils/pdf/loader.js';
import { extractFilename } from '../utils/url.js';
import { DocumentLoader, DocumentMetadata } from './types.js';

const URL_ROOT = 'https://www.notion.so/';
const BLOCK_ID_REGEX = /^[a-z0-9]{32}$/; // 32 characters

export const notionPdfBlockLoader: DocumentLoader = {
  isSupported,
  loadDocument,
  loadMetadata,
};

function isSupported(source: string) {
  return source.startsWith(URL_ROOT) && BLOCK_ID_REGEX.test(getUrlHash(source));
}

async function loadMetadata(url: string) {
  const pdfBlock = await fetchPdfBlock(url);
  return getMetadataFromBlock(url, pdfBlock);
}

async function loadDocument(url: string) {
  const pdfBlock = await fetchPdfBlock(url);
  const metadata = getMetadataFromBlock(url, pdfBlock);

  const pdfUrl = getPdfUrlFromBlock(pdfBlock);
  const response = await fetch(pdfUrl);
  const buffer = await response.arrayBuffer();
  const content = await loadPdfContentFromBuffer(buffer);

  return { content, metadata };
}

function getUrlHash(url: string): string {
  const urlHash = new URL(url).hash;

  // Remove '#' symbol
  return urlHash.slice(1);
}

async function fetchPdfBlock(url: string): Promise<PdfBlockObjectResponse> {
  const blockId = getUrlHash(url);
  const block = await fetchBlock(blockId);

  if (!block) {
    throw new Error(`NotionPdfBlockLoader Notion block not found: ${blockId}`);
  }

  if (!isFullBlock(block)) {
    throw new Error('NotionPdfBlockLoader Invalid block object');
  }

  if (block.type !== 'pdf') {
    throw new Error('NotionPdfBlockLoader Given block is not an embedded PDF');
  }

  return block;
}

function getMetadataFromBlock(url: string, pdfBlock: PdfBlockObjectResponse): DocumentMetadata {
  const pdfUrl = getPdfUrlFromBlock(pdfBlock);

  return {
    url,
    title: extractFilename(pdfUrl),
    lastModified: new Date(pdfBlock.last_edited_time),
  };
}

function getPdfUrlFromBlock(block: PdfBlockObjectResponse): string {
  if (block.pdf.type === 'external') {
    return block.pdf.external.url;
  }

  return block.pdf.file.url;
}
