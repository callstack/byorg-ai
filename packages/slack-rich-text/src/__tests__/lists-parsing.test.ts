import { marked, type Token, type TokensList } from 'marked';
import { expect, test } from 'vitest';
import { parseMarkdownToRichTextBlock } from '../markdown-to-block.js';

function drawTree(tree: TokensList) {
  const result = [];
  for (const token of tree) {
    result.push(...drawTreeInternal(token));
  }
  return result.join('\n');
}

function drawTreeInternal(token: Token, depth: number = 0) {
  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type, tokens, items, ...rest } = token;
  const result = [`${'  '.repeat(depth)} - ${type}: ${JSON.stringify(rest)}`];

  if ('tokens' in token && token.tokens?.length) {
    for (const child of token.tokens) {
      result.push(...drawTreeInternal(child, depth + 1));
    }
  }

  if ('items' in token && token.items?.length) {
    for (const item of token.items) {
      result.push(...drawTreeInternal(item, depth + 1));
    }
  }

  return result;
}

test('walk basic markdown tree', () => {
  const markdown = 'This is a **bold** text.';

  const tree = marked.lexer(markdown, { gfm: true });
  expect(drawTree(tree)).toMatchInlineSnapshot(`
    " - paragraph: {"raw":"This is a **bold** text.","text":"This is a **bold** text."}
       - text: {"raw":"This is a ","text":"This is a "}
       - strong: {"raw":"**bold**","text":"bold"}
         - text: {"raw":"bold","text":"bold"}
       - text: {"raw":" text.","text":" text."}"
  `);

  expect(parseMarkdownToRichTextBlock(markdown)).toMatchInlineSnapshot(`
    {
      "elements": [
        {
          "elements": [
            {
              "text": "This is a ",
              "type": "text",
            },
            {
              "style": {
                "bold": true,
              },
              "text": "bold",
              "type": "text",
            },
            {
              "text": " text.",
              "type": "text",
            },
          ],
          "type": "rich_text_section",
        },
      ],
      "type": "rich_text",
    }
  `);
});

test('walk basic markdown tree 2', () => {
  const markdown =
    'This is a paragraph.\nThis is still the same paragraph.\n\nThis is another paragraph.';

  const tree = marked.lexer(markdown, { gfm: true });
  expect(drawTree(tree)).toMatchInlineSnapshot(`
    " - paragraph: {"raw":"This is a paragraph.\\nThis is still the same paragraph.","text":"This is a paragraph.\\nThis is still the same paragraph."}
       - text: {"raw":"This is a paragraph.\\nThis is still the same paragraph.","text":"This is a paragraph.\\nThis is still the same paragraph."}
     - space: {"raw":"\\n\\n"}
     - paragraph: {"raw":"This is another paragraph.","text":"This is another paragraph."}
       - text: {"raw":"This is another paragraph.","text":"This is another paragraph."}"
  `);

  expect(parseMarkdownToRichTextBlock(markdown)).toMatchInlineSnapshot(`
    {
      "elements": [
        {
          "elements": [
            {
              "text": "This is a paragraph.
    This is still the same paragraph.",
              "type": "text",
            },
            {
              "text": "

    ",
              "type": "text",
            },
            {
              "text": "This is another paragraph.",
              "type": "text",
            },
          ],
          "type": "rich_text_section",
        },
      ],
      "type": "rich_text",
    }
  `);
});

test('render nested orderd list', () => {
  const markdown =
    '1. List 1\n2. List 2 **bold**\n    1. List 2.1 *italic*\n    2. List 2.2\n3. List 3';

  const tree = marked.lexer(markdown, { gfm: true });
  expect(drawTree(tree)).toMatchInlineSnapshot(`
    " - list: {"raw":"1. List 1\\n2. List 2 **bold**\\n    1. List 2.1 *italic*\\n    2. List 2.2\\n3. List 3","ordered":true,"start":1,"loose":false}
       - list_item: {"raw":"1. List 1\\n","task":false,"loose":false,"text":"List 1"}
         - text: {"raw":"List 1","text":"List 1"}
           - text: {"raw":"List 1","text":"List 1"}
       - list_item: {"raw":"2. List 2 **bold**\\n    1. List 2.1 *italic*\\n    2. List 2.2\\n","task":false,"loose":false,"text":"List 2 **bold**\\n 1. List 2.1 *italic*\\n 2. List 2.2"}
         - text: {"raw":"List 2 **bold**\\n","text":"List 2 **bold**"}
           - text: {"raw":"List 2 ","text":"List 2 "}
           - strong: {"raw":"**bold**","text":"bold"}
             - text: {"raw":"bold","text":"bold"}
         - list: {"raw":" 1. List 2.1 *italic*\\n 2. List 2.2","ordered":true,"start":1,"loose":false}
           - list_item: {"raw":" 1. List 2.1 *italic*\\n","task":false,"loose":false,"text":"List 2.1 *italic*"}
             - text: {"raw":"List 2.1 *italic*","text":"List 2.1 *italic*"}
               - text: {"raw":"List 2.1 ","text":"List 2.1 "}
               - em: {"raw":"*italic*","text":"italic"}
                 - text: {"raw":"italic","text":"italic"}
           - list_item: {"raw":" 2. List 2.2","task":false,"loose":false,"text":"List 2.2"}
             - text: {"raw":"List 2.2","text":"List 2.2"}
               - text: {"raw":"List 2.2","text":"List 2.2"}
       - list_item: {"raw":"3. List 3","task":false,"loose":false,"text":"List 3"}
         - text: {"raw":"List 3","text":"List 3"}
           - text: {"raw":"List 3","text":"List 3"}"
  `);

  expect(JSON.stringify([parseMarkdownToRichTextBlock(markdown)], null, 2)).toMatchInlineSnapshot(`
    "[
      {
        "type": "rich_text",
        "elements": [
          {
            "type": "rich_text_section",
            "elements": [
              {
                "type": "text",
                "text": "1. "
              },
              {
                "type": "text",
                "text": "List 1"
              },
              {
                "type": "text",
                "text": "\\n"
              },
              {
                "type": "text",
                "text": "2. "
              },
              {
                "type": "text",
                "text": "List 2 "
              },
              {
                "type": "text",
                "text": "bold",
                "style": {
                  "bold": true
                }
              }
            ]
          },
          {
            "type": "rich_text_section",
            "elements": [
              {
                "type": "text",
                "text": "  1. "
              },
              {
                "type": "text",
                "text": "List 2.1 "
              },
              {
                "type": "text",
                "text": "italic",
                "style": {
                  "italic": true
                }
              },
              {
                "type": "text",
                "text": "\\n"
              },
              {
                "type": "text",
                "text": "  2. "
              },
              {
                "type": "text",
                "text": "List 2.2"
              },
              {
                "type": "text",
                "text": "\\n"
              }
            ]
          },
          {
            "type": "rich_text_section",
            "elements": [
              {
                "type": "text",
                "text": "3. "
              },
              {
                "type": "text",
                "text": "List 3"
              },
              {
                "type": "text",
                "text": "\\n"
              }
            ]
          }
        ]
      }
    ]"
  `);
});
