import { logger } from '@callstack/byorg-utils';
import { collectPaginatedAPI } from '@notionhq/client';
import { DocumentMetadata } from '../../loaders/types.js';
import { parseOptionalStringProp } from './parser-props.js';
import { getNotionClient } from './auth.js';

export async function fetchPageMetadata(pageId: string): Promise<DocumentMetadata> {
  try {
    const notion = getNotionClient();
    const page = await notion.pages.retrieve({ page_id: pageId });
    if (page.object !== 'page' || !('properties' in page)) {
      throw new Error('Notion invalid page object');
    }

    const title =
      parseOptionalStringProp(page.properties, 'Page') ??
      parseOptionalStringProp(page.properties, 'title');
    if (title == null) {
      throw new Error('Notion page title not found');
    }

    return {
      url: page.url,
      title: title,
      lastModified: new Date(page.last_edited_time),
    };
  } catch (error) {
    throw Error(`Notion failed to fetch page metadata ${error}`);
  }
}

export async function fetchBlock(blockId: string) {
  logger.debug(`Notion: fetching ${blockId} block...`);
  const notion = getNotionClient();
  const result = await notion.blocks.retrieve({ block_id: blockId });

  logger.debug(`Notion: fetched ${blockId} block`);
  return result;
}

export async function fetchChildBlocks(blockId: string) {
  logger.debug(`Notion: fetching ${blockId} child block...`);
  const notion = getNotionClient();
  const result = await collectPaginatedAPI(notion.blocks.children.list, {
    block_id: blockId,
  });

  logger.debug(`Notion: fetched ${result.length} child block`);
  return result;
}

export async function fetchDatabaseRecords(databaseId: string) {
  const notion = getNotionClient();
  const result = await collectPaginatedAPI(notion.databases.query, {
    database_id: databaseId,
  });

  return result;
}
