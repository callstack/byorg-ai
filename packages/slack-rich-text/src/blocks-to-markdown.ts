import type {
  RichTextBlock,
  RichTextElement,
  RichTextSection,
  RichTextStyleable,
} from '@slack/web-api';
import { format } from 'date-fns';
import {
  anyOf,
  buildRegExp,
  capture,
  choiceOf,
  digit,
  lookahead,
  lookbehind,
  oneOrMore,
  startOfString,
  zeroOrMore,
} from 'ts-regex-builder';
import { unorderedListPrefixes } from './token-renderers.js';

const orderedItemNumberRegex = buildRegExp([
  lookbehind(zeroOrMore(' ')),
  capture(oneOrMore(digit)),
  lookahead('. '),
]);

const unorderedItemRegex = buildRegExp([
  lookbehind(zeroOrMore(' ')),
  capture(anyOf(unorderedListPrefixes.join(''))),
  lookahead(' '),
]);

const listItemRegex = buildRegExp(choiceOf(orderedItemNumberRegex, unorderedItemRegex));

const prefixSpacesRegex = buildRegExp([startOfString, zeroOrMore(' ')]);

const getOrderedItemNumber = (item: RichTextSection) => {
  const firstElement = item.elements[0];

  if (!firstElement || !('text' in firstElement && firstElement.text)) {
    return 0;
  }

  if (firstElement.text.match(orderedItemNumberRegex)) {
    const itemNumber = Number.parseInt(firstElement.text.replace(orderedItemNumberRegex, '$1'));

    if (Number.isInteger(itemNumber)) {
      return itemNumber;
    }
  }

  return 0;
};

export const parseRichTextBlockToMarkdown = ({ elements }: RichTextBlock) => {
  let text = '';

  for (const element of elements) {
    switch (element.type) {
      case 'rich_text_list': {
        for (const innerElement of element.elements) {
          const itemOrder = getOrderedItemNumber(innerElement);

          text += parseRichTextElementsToMarkdown(
            itemOrder ? innerElement.elements.slice(1) : innerElement.elements,
            {
              indent: element.indent,
              listStyle: element.style,
              itemNumber: itemOrder,
            },
          );
        }
        break;
      }
      case 'rich_text_preformatted': {
        text += `\`\`\`\n${parseRichTextElementsToMarkdown(element.elements)}\`\`\`\n`;
        break;
      }
      case 'rich_text_quote': {
        text += `> ${parseRichTextElementsToMarkdown(element.elements)}`;
        break;
      }
      case 'rich_text_section': {
        text += parseRichTextElementsToMarkdown(element.elements);
        break;
      }
    }
  }

  return text;
};

type RichTextSectionOptions = {
  indent?: number;
  listStyle?: 'ordered' | 'bullet';
  itemNumber?: number;
} & RichTextStyleable;

const parseRichTextElementsToMarkdown = (
  elements: RichTextElement[],
  options?: RichTextSectionOptions,
) => {
  let text = '';

  if (options?.listStyle) {
    text += formatListItem(text, options);
  }

  for (const element of elements) {
    switch (element.type) {
      case 'broadcast': {
        text += applyTextStyle(`<!${element.range}>`, element.style);
        break;
      }
      case 'channel': {
        text += applyTextStyle(`<#${element.channel_id}>`, element.style);
        break;
      }
      case 'color': {
        text += applyTextStyle(element.value, element.style);
        break;
      }
      case 'date': {
        text += applyTextStyle(format(element.timestamp, 'd MMM yyyy'), element.style);
        break;
      }
      case 'emoji': {
        text += `:${element.name}:`;
        break;
      }
      case 'link': {
        text += applyTextStyle(`[${element.text}](${element.url})`, element.style);
        break;
      }
      case 'team': {
        text += applyTextStyle(`<!subteam^${element.team_id}>`, element.style);
        break;
      }
      case 'text': {
        if (element.text.match(listItemRegex)) {
          text += formatTextListItem(element.text);
        } else {
          text += applyTextStyle(element.text, element.style);
        }
        break;
      }
      case 'user': {
        text += applyTextStyle(`<@${element.user_id}>`, element.style);
        break;
      }
      case 'usergroup': {
        text += applyTextStyle(`<!subteam^${element.usergroup_id}>`, element.style);
        break;
      }
    }
  }

  if (text.trim() === '') {
    return text;
  }

  if (text.endsWith('\n')) {
    return text;
  }

  return text + '\n';
};

type FormatListItemOptions = {
  indent?: number;
  itemNumber?: number;
};

const formatListItem = (text: string, options?: FormatListItemOptions) => {
  let prefix = '  '.repeat(options?.indent ? options.indent * 2 : 0);
  prefix += options?.itemNumber ? `${options?.itemNumber}. ` : `- `;
  const item = `${prefix}${text}`;

  return item;
};

const formatTextListItem = (text: string) => {
  // We need to double the indentation to match markdown req
  let item = text.match(prefixSpacesRegex)?.[0].repeat(2);

  if (text.match(orderedItemNumberRegex)) {
    item += text.trim();
  } else {
    item += text.replace(unorderedItemRegex, '-').trim();
  }

  item += ' ';

  return item;
};

const applyTextStyle = (text: string, style: RichTextStyleable['style']) => {
  let stylizedText: string = text.trimEnd();
  let trailingWhitespaces = text.substring(stylizedText.length);

  if (style?.bold && !text.startsWith('#')) {
    stylizedText = `**${stylizedText}**`;
  }

  if (style?.italic) {
    stylizedText = `*${stylizedText}*`;
  }

  if (style?.strike) {
    stylizedText = `~${stylizedText}~`;
  }

  if (style?.code) {
    stylizedText = `\`${stylizedText}\``;
  }

  return stylizedText + trailingWhitespaces;
};
