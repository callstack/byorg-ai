import type {
  RichTextElement,
  RichTextLink,
  RichTextPreformatted,
  RichTextSection,
  RichTextStyleable,
} from '@slack/web-api';
import type { Token, Tokens } from 'marked';
import {
  any,
  buildRegExp,
  capture,
  charClass,
  charRange,
  choiceOf,
  digit,
  endOfString,
  oneOrMore,
  optional,
  repeat,
  startOfString,
  word,
  zeroOrMore,
} from 'ts-regex-builder';
import type { RichTextBlockBuilder } from './markdown-to-block.js';

// Captures emojis in text :fire:
const emojiRegex = buildRegExp([':', oneOrMore(word), ':'], {
  global: true,
  ignoreCase: true,
});

// Nobody needs more than 2 new lines in text
const multipleNewLinesRegex = buildRegExp(
  repeat(choiceOf(['\n', zeroOrMore(' ')], [zeroOrMore(' '), '\n']), { min: 3 }),
);

// Regex for a slack format mentions
const mentionRegex = buildRegExp([
  '<',
  choiceOf('@', '#', '!subteam^', '!'),
  oneOrMore(any, { greedy: false }),
  '>',
]);

// Looks for mentions and emojis in text
const specialFormattingRegex = buildRegExp(capture([choiceOf(mentionRegex, emojiRegex)]));

// Checks if string is a codespan
const codespanRegex = buildRegExp([startOfString, '`', oneOrMore(any), '`', endOfString]);

// Extracts type and value of a mention
const mentionPartsRegex = buildRegExp(
  [
    '<',
    capture(choiceOf('@', '#', '!subteam^', '!'), { name: 'type' }),
    capture(
      oneOrMore(charClass(charRange('a', 'z'), charRange('A', 'Z'), charRange('0', '9')), {
        greedy: false,
      }),
      { name: 'id' },
    ),
    optional(['|', zeroOrMore(any, { greedy: false })]),
    '>',
  ],
  { global: true },
);

const listItemNumberRegex = buildRegExp([
  startOfString,
  zeroOrMore(' '),
  capture(oneOrMore(digit)),
  '.',
]);

function stripCodeSpan(input: string): string {
  // Use a regular expression to match backticks at the start and end of the string
  return input.replace(/^`+(.*?)`+$/, '$1');
}

// Handles tokens at the highest level
export const renderTopLevelTokens = (token: Token, richTextBlocksBuilder: RichTextBlockBuilder) => {
  switch (token.type) {
    case 'fences':
    case 'code': {
      richTextBlocksBuilder.addPreformatted([{ type: 'text', text: token.text.trim() }]);

      break;
    }
    // We are manually adding #, as the inline raw text handling strips it away
    case 'lheading':
    case 'heading': {
      const elements: RichTextElement[] = renderChildrenTokens(token.tokens).map((element) => ({
        ...element,
        style: { ...element.style, bold: true },
      }));

      if (elements[0] && 'text' in elements[0]) {
        elements[0].text = `${'#'.repeat(token.depth)} ${elements[0].text}`;
      }

      elements.push({ type: 'text', text: '\n\n' });
      richTextBlocksBuilder.addSectionElements(elements);
      break;
    }

    case 'blockquote':
      if ('tokens' in token) {
        const elements = renderChildrenTokens(token.tokens);
        richTextBlocksBuilder.addQuote(elements);
      }
      break;

    case 'list':
      if ('items' in token) {
        const lists = renderListToken(token as Tokens.List);
        richTextBlocksBuilder.addLists(lists);
      }
      break;

    case 'html':
    case 'def':
      richTextBlocksBuilder.addPreformatted([{ type: 'text', text: token.raw }]);
      break;

    case 'table':
      richTextBlocksBuilder.addPreformatted([{ type: 'text', text: token.raw.trim() }]);
      break;

    case 'paragraph':
      if ('tokens' in token) {
        const elements = renderChildrenTokens(token.tokens);
        richTextBlocksBuilder.addSectionElements(elements);
      }
      break;

    case 'hr':
    case 'text':
    case 'space':
      richTextBlocksBuilder.addSectionElements(renderRawTextToken(token.raw));
      break;

    default:
      console.warn('Unhandled token type: ', token);
      richTextBlocksBuilder.addSectionElements(renderRawTextToken(token.raw));
  }
};

const stylableElementTypes = ['channel', 'link', 'text', 'user', 'usergroup'];

function applyStyleIfAllowed(element: RichTextElement, style: RichTextStyleable['style']) {
  const isAllowed = stylableElementTypes.includes(element.type);
  if (!isAllowed) {
    return;
  }

  element.style = { ...element.style, ...style };
}

// Recursively handles children tokens
export const renderChildrenTokens = (tokens?: Token[]): RichTextElement[] => {
  const result: RichTextElement[] = [];

  tokens?.forEach((token) => {
    let children: RichTextElement[] = [];
    if ('tokens' in token) {
      children = renderChildrenTokens(token.tokens);
    } else {
      children = renderRawTextToken(token.raw);
    }

    children.forEach((element) => {
      switch (token.type) {
        case 'em':
          applyStyleIfAllowed(element, { italic: true });

          break;

        case 'codespan': {
          if ('text' in element && element.text != null) {
            element.text = stripCodeSpan(element.text).trim();
          }

          applyStyleIfAllowed(element, { code: true });
          break;
        }

        case 'code': {
          if ('text' in element) {
            element.text = token.text.trim();
          }

          applyStyleIfAllowed(element, { code: true });

          break;
        }

        case 'del':
          applyStyleIfAllowed(element, { strike: true });

          break;

        case 'heading':
        case 'strong':
          applyStyleIfAllowed(element, { bold: true });

          break;

        case 'link':
          (element as RichTextLink).url = token.href;
          element.type = 'link';
          break;

        case 'paragraph':
        case 'text':
        case 'br':
          // Pass as is
          break;

        default: {
          console.warn('Unhandled token type: ', token);
          break;
        }
      }
    });

    result.push(...children);
  });

  return result;
};

export const renderRawTextToken = (rawText: string): RichTextElement[] => {
  const result: RichTextElement[] = [];

  if (rawText.match(codespanRegex)) {
    return [{ type: 'text', text: rawText }];
  }

  const texts = rawText.split(specialFormattingRegex).filter((text) => text.length);

  texts.forEach((text) => {
    const isEmoji = text.match(emojiRegex);
    const isMention = text.match(mentionRegex);

    if (!isEmoji && !isMention) {
      result.push({
        type: 'text',
        text: text.replace(multipleNewLinesRegex, '\n\n'),
      });
      return;
    }

    if (isEmoji) {
      result.push({
        type: 'emoji',
        name: text.replaceAll(':', ''),
      });
    } else {
      mentionPartsRegex.lastIndex = 0;
      const { type, id } = mentionPartsRegex.exec(text)?.groups ?? {};

      if (!id || !type) {
        result.push({
          type: 'text',
          text: text.replace(multipleNewLinesRegex, '\n\n'),
        });
        return;
      }

      switch (type) {
        case '@': {
          result.push({
            type: 'user',
            user_id: id,
          });
          break;
        }
        case '#': {
          result.push({
            type: 'channel',
            channel_id: id,
          });
          break;
        }
        case '!subteam^': {
          result.push({
            type: 'usergroup',
            usergroup_id: id,
          });
          break;
        }
        case '!': {
          if (id === 'here' || id === 'channel' || id === 'everyone') {
            result.push({
              type: 'broadcast',
              range: id,
            });
          }
          break;
        }
      }
    }
  });

  return result;
};

const getListItemNumber = (raw: string): string => {
  return raw.match(listItemNumberRegex)?.[1] ?? '';
};

const newEmptyRichTextSection = (): RichTextSection => {
  return { type: 'rich_text_section', elements: [] };
};

export const unorderedListPrefixes = ['●', '○', '•', '◦'];

export const renderListToken = (
  listToken: Token,
  level: number = 0,
): (RichTextSection | RichTextPreformatted)[] => {
  if (!('items' in listToken)) {
    return [];
  }

  const sections: (RichTextSection | RichTextPreformatted)[] = [];

  let addNewLine = true;
  let currentSection: RichTextSection = newEmptyRichTextSection();
  sections.push(currentSection);

  listToken.items.forEach((item: Tokens.ListItem) => {
    // Using 2 space indent for visual aestethics
    let prefix = ' '.repeat(level * 2);
    if (listToken.ordered) {
      prefix += `${getListItemNumber(item.raw)}. `;
    } else {
      prefix += `${unorderedListPrefixes[level % unorderedListPrefixes.length]} `;
    }

    currentSection.elements.push({ type: 'text', text: prefix });

    item.tokens.forEach((token) => {
      if (token.type === 'list') {
        sections.push(...renderListToken(token, level + 1));

        currentSection = newEmptyRichTextSection();
        sections.push(currentSection);
        addNewLine = false;
      } else if (token.type === 'code') {
        sections.push({
          type: 'rich_text_preformatted',
          elements: [{ type: 'text', text: token.text }],
        });

        currentSection = newEmptyRichTextSection();
        sections.push(currentSection);
        addNewLine = false;
      } else {
        if ('tokens' in token) {
          currentSection.elements.push(...renderChildrenTokens(token.tokens));
        } else {
          currentSection.elements.push(...renderRawTextToken(token.raw));
        }

        addNewLine = true;
      }
    });

    if (addNewLine) {
      currentSection.elements.push({ type: 'text', text: '\n' });
    }
  });

  return sections.filter((list) => list.elements.length > 0);
};
