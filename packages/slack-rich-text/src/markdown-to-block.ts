import type {
  RichTextBlock,
  RichTextElement,
  RichTextPreformatted,
  RichTextSection,
  RichTextText,
} from '@slack/web-api';
import { marked } from 'marked';
import { renderTopLevelTokens } from './token-renderers.js';

// Helps to avoid situation when we send incorrect rich text block without elements
// This can happen when we send message before parsing first chunk
const EMPTY_RICH_TEXT_BLOCK: RichTextBlock = {
  type: 'rich_text',
  elements: [
    {
      type: 'rich_text_section',
      elements: [
        {
          type: 'text',
          text: ' ',
        },
      ],
    },
  ],
};

export const parseMarkdownToRichTextBlock = (text: string) => {
  const richTextBlocksBuilder = new RichTextBlockBuilder();

  marked
    .lexer(text ?? '', {
      gfm: true,
    })
    .forEach((token) => renderTopLevelTokens(token, richTextBlocksBuilder));

  return richTextBlocksBuilder.getRichTextBlock();
};

export class RichTextBlockBuilder {
  private richTextBlock: RichTextBlock;

  constructor() {
    this.richTextBlock = {
      type: 'rich_text',
      elements: [],
    };
  }

  getRichTextBlock() {
    if (this.richTextBlock.elements.length === 0) {
      return EMPTY_RICH_TEXT_BLOCK;
    }
    return this.richTextBlock;
  }

  addSectionElements(elements: RichTextElement[]) {
    const sanitizedElements = sanitizeElements<RichTextElement>(elements);
    if (sanitizedElements.length === 0) {
      return;
    }

    const lastElement = this.richTextBlock.elements.at(-1);

    if (lastElement?.type === 'rich_text_section') {
      lastElement.elements.push(...sanitizedElements);
    } else {
      this.richTextBlock.elements.push({
        type: 'rich_text_section',
        elements: sanitizedElements,
      });
    }
  }

  addLists(lists: (RichTextSection | RichTextPreformatted)[]) {
    lists.forEach((list) => {
      list.elements = sanitizeElements(list.elements);
    });

    this.richTextBlock.elements.push(...lists.filter((list) => list.elements.length > 0));
  }

  addPreformatted(elements: RichTextText[]) {
    const sanitizedElements = sanitizeElements<RichTextText>(elements);
    if (sanitizedElements.length === 0) {
      return;
    }

    this.richTextBlock.elements.push({
      type: 'rich_text_preformatted',
      elements: sanitizedElements,
    });
  }

  addQuote(elements: RichTextElement[]) {
    const sanitizedElements = sanitizeElements<RichTextText>(elements);
    if (sanitizedElements.length === 0) {
      return;
    }

    this.richTextBlock.elements.push({
      type: 'rich_text_quote',
      elements: sanitizedElements,
    });
  }
}

const sanitizeElements = <T>(elements: RichTextElement[]): T[] => {
  return elements.filter((element) => {
    if ('text' in element) {
      return element.text !== '';
    }
    if ('name' in element) {
      return element.name !== '';
    }

    return true;
  }) as T[];
};
