import { isFullBlock } from '@notionhq/client';
import {
  ChildPageBlockObjectResponse,
  CodeBlockObjectResponse,
  LinkToPageBlockObjectResponse,
  RichTextItemResponse,
  TableBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints.js';
import { logger } from '@callstack/byorg-utils';
import * as md from '../markdown/builder.js';
import { fetchChildBlocks, fetchPageMetadata } from './api.js';
import { NotionBlock } from './types.js';

export type ParseBlockContext = {
  pageUrl: string;
  depth: number;
};

export async function parseBlocks(blocks: NotionBlock[], context: ParseBlockContext) {
  const result = [];
  for (const block of blocks) {
    const parsed = await parseBlock(block, context);
    if (parsed) {
      result.push(parsed);
    }
  }

  return result.join('\n');
}

export async function parseBlock(
  block: NotionBlock,
  context: ParseBlockContext,
): Promise<string | null> {
  if (!isFullBlock(block)) {
    return null;
  }

  let markdown = '';
  let parseChildren = true;

  switch (block.type) {
    case 'bulleted_list_item':
      markdown = md.unorderedListItem(parseRichText(block.bulleted_list_item.rich_text));
      break;

    case 'bookmark':
      markdown = md.link(parseRichText(block.bookmark.caption), block.bookmark.url);
      break;

    case 'callout':
      markdown = parseRichText(block.callout.rich_text);
      break;

    case 'code':
      markdown = parseCodeBlock(block);
      break;

    case 'heading_1':
      markdown = md.heading(parseRichText(block.heading_1.rich_text), 1);
      break;

    case 'heading_2':
      markdown = md.heading(parseRichText(block.heading_2.rich_text), 2);
      break;

    case 'heading_3':
      markdown = md.heading(parseRichText(block.heading_3.rich_text), 3);
      break;

    case 'link_to_page':
      markdown = await parseLinkToPageBlock(block);
      break;

    case 'numbered_list_item':
      markdown = md.orderedListItem(parseRichText(block.numbered_list_item.rich_text));
      break;

    case 'paragraph':
      markdown = `${parseRichText(block.paragraph.rich_text)}\n`;
      break;

    case 'quote':
      markdown = md.blockQuote(parseRichText(block.quote.rich_text));
      break;

    case 'template':
      markdown = parseRichText(block.template.rich_text);
      break;

    case 'to_do':
      markdown = md.toDoItem(parseRichText(block.to_do.rich_text), block.to_do.checked);
      break;

    case 'toggle':
      markdown = parseRichText(block.toggle.rich_text);
      break;

    case 'divider':
      markdown = md.divider;
      parseChildren = false;
      break;

    case 'table': {
      markdown = await parseTableBlocks(block);
      parseChildren = false;
      break;
    }

    case 'child_page':
      markdown = await parseChildPageBlock(block);
      parseChildren = false;
      break;

    case 'pdf': {
      const blockUrl = new URL(context.pageUrl);
      blockUrl.hash = block.id;
      logger.warn(`Ignoring embedded PDF: ${blockUrl.toString()}`);
      return null;
    }

    // Supported blocks that do not have content but will have their children parsed:
    case 'column_list':
    case 'column':
      break;

    // Skipped blocks, the children will nnot be parsed:
    case 'child_database':
    case 'image':
    case 'video':
    case 'audio':
    case 'file':
    case 'unsupported':
      parseChildren = false;
      break;

    default:
      parseChildren = false;
      logger.debug('Notion: block type not implemented:', block.type);
      break;
  }

  markdown = indentText(markdown, context.depth);

  if (parseChildren && block.has_children) {
    markdown += '\n';

    // 'column_list' and 'column' shouldn't influence depth as those are completely stripped from Markdown
    const nextDepth = ['column_list', 'column'].includes(block.type)
      ? context.depth
      : context.depth + 1;

    const children = await fetchChildBlocks(block.id);
    markdown += await parseBlocks(children, {
      ...context,
      depth: nextDepth,
    });
  }

  return markdown;
}

function parseRichText(items: RichTextItemResponse[]) {
  let result: string[] = [];

  items.forEach((item) => {
    let text = item.plain_text;

    if (item.href) {
      text = md.link(text, item.href);
    }

    if (item.annotations.bold) {
      text = md.bold(text);
    }

    if (item.annotations.italic) {
      text = md.italic(text);
    }

    if (item.annotations.strikethrough) {
      text = md.strikethrough(text);
    }

    result.push(text);
  });

  return result.join('').trim();
}

async function parseLinkToPageBlock(block: LinkToPageBlockObjectResponse) {
  if (block.link_to_page.type !== 'page_id') {
    logger.error(
      'Notion: block link_to_page.type not supported:',
      block.link_to_page.type,
      JSON.stringify(block.link_to_page, null, 2),
    );
    throw new Error(`Notion block link_to_page.type "${block.link_to_page.type}" not supported.`);
  }

  const metadata = await fetchPageMetadata(block.link_to_page.page_id);
  return md.link(metadata.title, metadata.url);
}

async function parseChildPageBlock(block: ChildPageBlockObjectResponse) {
  const metadata = await fetchPageMetadata(block.id);
  return md.link(metadata.title, metadata.url);
}

function parseCodeBlock(block: CodeBlockObjectResponse) {
  return md.codeBlock(
    parseRichText(block.code.rich_text),
    block.code.language === 'plain text' ? 'text' : block.code.language,
  );
}

async function parseTableBlocks(tableBlock: TableBlockObjectResponse) {
  const rows: string[][] = [];

  if (!tableBlock.table.has_column_header) {
    rows.push(Array(tableBlock.table.table_width).fill(''));
  }

  const children = await fetchChildBlocks(tableBlock.id);
  for (const child of children) {
    if (isFullBlock(child) && child.type === 'table_row') {
      rows.push(child.table_row.cells.map((cell) => excapeNewlines(parseRichText(cell))));
    }
  }

  return md.table(rows);
}

function excapeNewlines(text: string) {
  return text.replace(/\n/g, '<br/>');
}

const INDENT_STEP = '  ';

function indentText(text: string, n: number) {
  return text
    .split('\n')
    .map((line) => `${INDENT_STEP.repeat(n)}${line}`)
    .join('\n');
}
