import type { RichTextBlock } from '@slack/web-api';
import { describe, test, expect } from 'vitest';
import { parseRichTextBlockToMarkdown } from '../blocks-to-markdown.js';
import { parseMarkdownToRichTextBlock } from '../markdown-to-block.js';

describe('Marked library', () => {
  test('should convert markdown to Slack Rich Text block', () => {
    const parsedTextBlock = parseMarkdownToRichTextBlock(markdownMessage);

    expect(parsedTextBlock).toEqual(richTextBlock);
  });

  test('should convert blocks to markdown and back to the same Slack Rich Text', () => {
    const parsedTextBlock = parseMarkdownToRichTextBlock(markdownMessage);

    const text = parseRichTextBlockToMarkdown(parsedTextBlock);
    const newRichTextBlock = parseMarkdownToRichTextBlock(text);

    expect(newRichTextBlock).toEqual(parsedTextBlock);
  });

  test('should correctly handle emojis', () => {
    const textToParse = `**Hello**: :smile:`;
    const parsedBlocks = parseMarkdownToRichTextBlock(textToParse);

    expect(parsedBlocks.elements[0]?.elements).toEqual([
      { type: 'text', text: 'Hello', style: { bold: true } },
      { type: 'text', text: ': ' },
      { type: 'emoji', name: 'smile' },
    ]);
  });

  test('should correctly handle code blocks in list', () => {
    const textToParse = `1. **Rename the Branch Locally**

    First, rename the branch locally while you are on it:

    \`\`\`bash
    git branch -m master main
    \`\`\``;
    const parsedBlocks = parseMarkdownToRichTextBlock(textToParse);

    expect(parsedBlocks.elements).toEqual([
      {
        type: 'rich_text_section',
        elements: [
          {
            type: 'text',
            text: '1. ',
          },
          {
            type: 'text',
            text: 'Rename the Branch Locally',
            style: { bold: true },
          },
          { type: 'text', text: '\n\n' },
          {
            type: 'text',
            text: ' First, rename the branch locally while you are on it:',
          },
          { type: 'text', text: '\n\n' },
        ],
      },
      {
        type: 'rich_text_preformatted',
        elements: [
          {
            type: 'text',
            text: 'git branch -m master main',
          },
        ],
      },
    ]);
  });

  test('should correctly filter empty elements', () => {
    const text = `1. \`\`\`\`\`\`
\`\`\`\`\`\`
`;

    const parsedBlocks = parseMarkdownToRichTextBlock(text);

    expect(parsedBlocks.elements).toEqual([
      {
        type: 'rich_text_section',
        elements: [{ type: 'text', text: '1. ' }],
      },
    ]);
  });
});

const markdownMessage = `# H1 header
## H2 header
### H3 header
H1 Header (Underline)
=============

H2 Header (Underline)
-------------

~~Strikethrough~~
**Bold**      *Italic*

> Blockquotes

> "Blockquotes Blockquotes", [Link](http://localhost/)。

> Blockquotes
Multiline

[Links](http://localhost/)

[Links with title](http://localhost/ "link title")

[Reference link][id/name]

[id/name]: http://link-url/

*[Italic link](http://link-url/)*

\`$ npm install marked\`

Indented 4 spaces, like \`<pre>\` (Preformatted Text).

    <?php
        echo "Hello world!";
    ?>

Code Blocks (Preformatted text):

    | First Header  | Second Header |
    | ------------- | ------------- |
    | Content Cell  | Content Cell  |
    | Content Cell  | Content Cell  |

\`\`\`javascript
function test(){
	console.log("Hello world!");
}

(function(){
    var box = function(){
        return box.fn.init();
    };

    window.box = box;
})();

var testBox = box();
testBox.add("jQuery").remove("jQuery");
\`\`\`

\`\`\`html
<!DOCTYPE html>
<html>
    <head>
        <title>Hello world!</title>
    </head>
</html>
\`\`\`

#### Lists

- Item A
- Item B
    - **Item B 1**
    - *Item B 2*
- Item C \`\`\`With code\`\`\` block
    - _Item C 1_
    - \`Item C 2\`
    - Item C 3
- **Item D**

1. Item 1
2. Item 2
    1. **Item 2 1**
    2. *Item 2 2*
3. Item 3
    1. _Item 3 1_
    2. \`Item 3 2\`
    3. Item 3 3
4. **Item 4**

----

### Tables

First Header  | Second Header
------------- | -------------
Content Cell  | Content Cell
Content Cell  | Content Cell

| First Header  | Second Header |
| ------------- | ------------- |
| Content Cell  | Content Cell  |
| Content Cell  | Content Cell  |

| Function name | Description                    |
| ------------- | ------------------------------ |
| \`help()\`      | Display the help window.       |
| \`destroy()\`   | **Destroy your computer!**     |

| Item      | Value |
| --------- | -----:|
| Computer  | $1600 |
| Phone     |   $12 |
| Pipe      |    $1 |

| Left-Aligned  | Center Aligned  | Right Aligned |
| :------------ |:---------------:| -----:|
| col 3 is      | some wordy text | $1600 |
| col 2 is      | centered        |   $12 |
| zebra stripes | are neat        |    $1 |

----

### Emoji mixed :smiley:

> Blockquotes :star:

This : : is not :emoji:

Here is channel mention: <#C123ABC456>
Here are user mentions: <@U012AB3CD> and <@W012AB3CD>
Here is user group: <!subteam^SAZ94GDB8>
Here are special mentions: <!here> and <!channel>

1. <#C123ABC456>
2. <@U012AB3CD> and <@W012AB3CD>
    1. <!subteam^SAZ94GDB8>
    2. <!here> and <!channel>
    3. Also emoji :smiley:

- :options: \`string.range(of:options:) :options: \` :opti_ons:
`;

const richTextBlock: RichTextBlock = {
  type: 'rich_text',
  elements: [
    {
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: '# H1 header', style: { bold: true } },
        { type: 'text', text: '\n\n' },
        { type: 'text', text: '## H2 header', style: { bold: true } },
        { type: 'text', text: '\n\n' },
        { type: 'text', text: '### H3 header', style: { bold: true } },
        { type: 'text', text: '\n\n' },
        {
          type: 'text',
          text: '# H1 Header (Underline)',
          style: { bold: true },
        },
        { type: 'text', text: '\n\n' },
        {
          type: 'text',
          text: '## H2 Header (Underline)',
          style: { bold: true },
        },
        { type: 'text', text: '\n\n' },
        {
          type: 'text',
          text: 'Strikethrough',
          style: { strike: true },
        },
        { type: 'text', text: '\n' },
        { type: 'text', text: 'Bold', style: { bold: true } },
        { type: 'text', text: '      ' },
        { type: 'text', text: 'Italic', style: { italic: true } },
        { type: 'text', text: '\n\n' },
      ],
    },
    {
      type: 'rich_text_quote',
      elements: [{ type: 'text', text: 'Blockquotes' }],
    },
    {
      type: 'rich_text_section',
      elements: [{ type: 'text', text: '\n\n' }],
    },
    {
      type: 'rich_text_quote',
      elements: [
        { type: 'text', text: '"Blockquotes Blockquotes", ' },
        { type: 'link', text: 'Link', url: 'http://localhost/' },
        { type: 'text', text: '。' },
      ],
    },
    {
      type: 'rich_text_section',
      elements: [{ type: 'text', text: '\n\n' }],
    },
    {
      type: 'rich_text_quote',
      elements: [{ type: 'text', text: 'Blockquotes\nMultiline' }],
    },
    {
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: '\n\n' },
        { type: 'link', text: 'Links', url: 'http://localhost/' },
        { type: 'text', text: '\n\n' },
        {
          type: 'link',
          text: 'Links with title',
          url: 'http://localhost/',
        },
        { type: 'text', text: '\n\n' },
        {
          type: 'link',
          text: 'Reference link',
          url: 'http://link-url/',
        },
        { type: 'text', text: '\n\n' },
        {
          type: 'link',
          text: 'Italic link',
          url: 'http://link-url/',
          style: { italic: true },
        },
        { type: 'text', text: '\n\n' },
        {
          type: 'text',
          text: '$ npm install marked',
          style: { code: true },
        },
        { type: 'text', text: '\n\n' },
        { type: 'text', text: 'Indented 4 spaces, like ' },
        { type: 'text', text: '<pre>', style: { code: true } },
        { type: 'text', text: ' (Preformatted Text).' },
        { type: 'text', text: '\n\n' },
      ],
    },
    {
      type: 'rich_text_preformatted',
      elements: [{ type: 'text', text: '<?php\n    echo "Hello world!";\n?>' }],
    },
    {
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: 'Code Blocks (Preformatted text):' },
        { type: 'text', text: '\n\n' },
      ],
    },
    {
      type: 'rich_text_preformatted',
      elements: [
        {
          type: 'text',
          text:
            '| First Header  | Second Header |\n' +
            '| ------------- | ------------- |\n' +
            '| Content Cell  | Content Cell  |\n' +
            '| Content Cell  | Content Cell  |',
        },
      ],
    },
    {
      type: 'rich_text_preformatted',
      elements: [
        {
          type: 'text',
          text:
            'function test(){\n' +
            '	console.log("Hello world!");\n' +
            '}\n' +
            '\n' +
            '(function(){\n' +
            '    var box = function(){\n' +
            '        return box.fn.init();\n' +
            '    };\n' +
            '\n' +
            '    window.box = box;\n' +
            '})();\n' +
            '\n' +
            'var testBox = box();\n' +
            'testBox.add("jQuery").remove("jQuery");',
        },
      ],
    },
    {
      type: 'rich_text_section',
      elements: [{ type: 'text', text: '\n\n' }],
    },
    {
      type: 'rich_text_preformatted',
      elements: [
        {
          type: 'text',
          text:
            '<!DOCTYPE html>\n' +
            '<html>\n' +
            '    <head>\n' +
            '        <title>Hello world!</title>\n' +
            '    </head>\n' +
            '</html>',
        },
      ],
    },
    {
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: '\n\n' },
        { type: 'text', text: '#### Lists', style: { bold: true } },
        { type: 'text', text: '\n\n' },
      ],
    },
    {
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: '● ' },
        { type: 'text', text: 'Item A' },
        { type: 'text', text: '\n' },
        { type: 'text', text: '● ' },
        { type: 'text', text: 'Item B' },
      ],
    },
    {
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: '  ○ ' },
        { type: 'text', text: 'Item B 1', style: { bold: true } },
        { type: 'text', text: '\n' },
        { type: 'text', text: '  ○ ' },
        { type: 'text', text: 'Item B 2', style: { italic: true } },
        { type: 'text', text: '\n' },
      ],
    },
    {
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: '● ' },
        { type: 'text', text: 'Item C ' },
        { type: 'text', text: 'With code', style: { code: true } },
        { type: 'text', text: ' block' },
      ],
    },
    {
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: '  ○ ' },
        { type: 'text', text: 'Item C 1', style: { italic: true } },
        { type: 'text', text: '\n' },
        { type: 'text', text: '  ○ ' },
        { type: 'text', text: 'Item C 2', style: { code: true } },
        { type: 'text', text: '\n' },
        { type: 'text', text: '  ○ ' },
        { type: 'text', text: 'Item C 3' },
        { type: 'text', text: '\n' },
      ],
    },
    {
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: '● ' },
        { type: 'text', text: 'Item D', style: { bold: true } },
        { type: 'text', text: '\n' },
        { type: 'text', text: '\n\n' },
      ],
    },
    {
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: '1. ' },
        { type: 'text', text: 'Item 1' },
        { type: 'text', text: '\n' },
        { type: 'text', text: '2. ' },
        { type: 'text', text: 'Item 2' },
      ],
    },
    {
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: '  1. ' },
        { type: 'text', text: 'Item 2 1', style: { bold: true } },
        { type: 'text', text: '\n' },
        { type: 'text', text: '  2. ' },
        { type: 'text', text: 'Item 2 2', style: { italic: true } },
        { type: 'text', text: '\n' },
      ],
    },
    {
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: '3. ' },
        { type: 'text', text: 'Item 3' },
      ],
    },
    {
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: '  1. ' },
        { type: 'text', text: 'Item 3 1', style: { italic: true } },
        { type: 'text', text: '\n' },
        { type: 'text', text: '  2. ' },
        { type: 'text', text: 'Item 3 2', style: { code: true } },
        { type: 'text', text: '\n' },
        { type: 'text', text: '  3. ' },
        { type: 'text', text: 'Item 3 3' },
        { type: 'text', text: '\n' },
      ],
    },
    {
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: '4. ' },
        { type: 'text', text: 'Item 4', style: { bold: true } },
        { type: 'text', text: '\n' },
        { type: 'text', text: '\n\n' },
        { type: 'text', text: '----' },
        { type: 'text', text: '\n\n' },
        { type: 'text', text: '### Tables', style: { bold: true } },
        { type: 'text', text: '\n\n' },
      ],
    },
    {
      type: 'rich_text_preformatted',
      elements: [
        {
          type: 'text',
          text:
            'First Header  | Second Header\n' +
            '------------- | -------------\n' +
            'Content Cell  | Content Cell\n' +
            'Content Cell  | Content Cell',
        },
      ],
    },
    {
      type: 'rich_text_preformatted',
      elements: [
        {
          type: 'text',
          text:
            '| First Header  | Second Header |\n' +
            '| ------------- | ------------- |\n' +
            '| Content Cell  | Content Cell  |\n' +
            '| Content Cell  | Content Cell  |',
        },
      ],
    },
    {
      type: 'rich_text_preformatted',
      elements: [
        {
          type: 'text',
          text:
            '| Function name | Description                    |\n' +
            '| ------------- | ------------------------------ |\n' +
            '| `help()`      | Display the help window.       |\n' +
            '| `destroy()`   | **Destroy your computer!**     |',
        },
      ],
    },
    {
      type: 'rich_text_preformatted',
      elements: [
        {
          type: 'text',
          text:
            '| Item      | Value |\n' +
            '| --------- | -----:|\n' +
            '| Computer  | $1600 |\n' +
            '| Phone     |   $12 |\n' +
            '| Pipe      |    $1 |',
        },
      ],
    },
    {
      type: 'rich_text_preformatted',
      elements: [
        {
          type: 'text',
          text:
            '| Left-Aligned  | Center Aligned  | Right Aligned |\n' +
            '| :------------ |:---------------:| -----:|\n' +
            '| col 3 is      | some wordy text | $1600 |\n' +
            '| col 2 is      | centered        |   $12 |\n' +
            '| zebra stripes | are neat        |    $1 |',
        },
      ],
    },
    {
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: '----' },
        { type: 'text', text: '\n\n' },
        {
          type: 'text',
          text: '### Emoji mixed ',
          style: { bold: true },
        },
        { type: 'emoji', name: 'smiley', style: { bold: true } },
        { type: 'text', text: '\n\n' },
      ],
    },
    {
      type: 'rich_text_quote',
      elements: [
        { type: 'text', text: 'Blockquotes ' },
        { type: 'emoji', name: 'star' },
      ],
    },
    {
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: '\n\n' },
        { type: 'text', text: 'This : : is not ' },
        { type: 'emoji', name: 'emoji' },
        { type: 'text', text: '\n\n' },
        { type: 'text', text: 'Here is channel mention: ' },
        { type: 'channel', channel_id: 'C123ABC456' },
        { type: 'text', text: '\nHere are user mentions: ' },
        { type: 'user', user_id: 'U012AB3CD' },
        { type: 'text', text: ' and ' },
        { type: 'user', user_id: 'W012AB3CD' },
        { type: 'text', text: '\nHere is user group: ' },
        { type: 'usergroup', usergroup_id: 'SAZ94GDB8' },
        { type: 'text', text: '\nHere are special mentions: ' },
        { type: 'broadcast', range: 'here' },
        { type: 'text', text: ' and ' },
        { type: 'broadcast', range: 'channel' },
        { type: 'text', text: '\n\n' },
      ],
    },
    {
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: '1. ' },
        { type: 'channel', channel_id: 'C123ABC456' },
        { type: 'text', text: '\n' },
        { type: 'text', text: '2. ' },
        { type: 'user', user_id: 'U012AB3CD' },
        { type: 'text', text: ' and ' },
        { type: 'user', user_id: 'W012AB3CD' },
      ],
    },
    {
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: '  1. ' },
        { type: 'usergroup', usergroup_id: 'SAZ94GDB8' },
        { type: 'text', text: '\n' },
        { type: 'text', text: '  2. ' },
        { type: 'broadcast', range: 'here' },
        { type: 'text', text: ' and ' },
        { type: 'broadcast', range: 'channel' },
        { type: 'text', text: '\n' },
        { type: 'text', text: '  3. ' },
        { type: 'text', text: 'Also emoji ' },
        { type: 'emoji', name: 'smiley' },
        { type: 'text', text: '\n' },
        { type: 'text', text: '\n\n' },
      ],
    },
    {
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: '● ' },
        { type: 'emoji', name: 'options' },
        { type: 'text', text: ' ' },
        {
          type: 'text',
          text: 'string.range(of:options:) :options:',
          style: { code: true },
        },
        { type: 'text', text: ' ' },
        { type: 'emoji', name: 'opti_ons' },
        { type: 'text', text: '\n' },
      ],
    },
  ],
};
