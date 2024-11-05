import { parseBlocks } from '../utils/notion/parser-blocks.js';
import { fetchChildBlocks, fetchPageMetadata } from '../utils/notion/api.js';
import { DocumentLoader } from './types.js';

const URL_ROOT = 'https://www.notion.so/';

export const notionLoader: DocumentLoader = {
  isSupported,
  loadDocument,
  loadMetadata,
};

function isSupported(source: string) {
  return source.startsWith(URL_ROOT);
}

// TODO: implement document loading
async function loadDocument(url: string) {
  const pageId = extractNotionPageId(url);
  if (!pageId) {
    throw new Error(`NotionLoader Invalid Notion URL: ${url}`);
  }

  const metadata = await fetchPageMetadata(pageId);
  const blocks = await fetchChildBlocks(pageId);
  const content = await parseBlocks(blocks, { pageUrl: url, depth: 0 });

  return { content, metadata };
}

async function loadMetadata(url: string) {
  const pageId = extractNotionPageId(url);
  if (!pageId) {
    throw new Error(`NotionLoader Invalid Notion URL: ${url}`);
  }

  return await fetchPageMetadata(pageId);
}

function extractNotionPageId(url: string) {
  const pattern = /[0-9a-f]{32}/;
  const match = url.match(pattern);
  return match ? match[0] : null;
}
