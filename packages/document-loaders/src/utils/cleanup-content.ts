import {
  any,
  anyOf,
  buildRegExp,
  choiceOf,
  digit,
  lookahead,
  lookbehind,
  oneOrMore,
  optional,
  startOfString,
  whitespace,
  zeroOrMore,
} from 'ts-regex-builder';

const contentWhitespace = anyOf(' \t\x0b');
export const contentWhitespacesRegex = buildRegExp(oneOrMore(contentWhitespace), {
  global: true,
});

export const leadingWhitespaceRegex = buildRegExp(
  [lookbehind(oneOrMore('\n')), oneOrMore(whitespace)],
  { global: true },
);

export const trailingWhitespaceRegex = buildRegExp(
  [oneOrMore(whitespace), lookahead(oneOrMore('\n'))],
  { global: true },
);

// Callstack  |   IS.11 - Asset Register Policy Confidentiality level: 3 - Confidential
export const deniedConfidentialyLevelRegex = buildRegExp(
  [
    'Confidentiality',
    zeroOrMore(contentWhitespace),
    'level:',
    zeroOrMore(contentWhitespace),
    '3',
    zeroOrMore(contentWhitespace),
    optional('-'),
    zeroOrMore(contentWhitespace),
    'Confidential',
  ],
  { global: true, ignoreCase: true },
);

// Callstack  |   IS.11 - Asset Register Policy Confidentiality level: 2 - Internal
// Callstack | IS.11 - Asset Register
export const allowedConfidentialyLevelRegex = buildRegExp(
  [
    optional('Callstack'),
    zeroOrMore(contentWhitespace),
    optional('|'),
    zeroOrMore(contentWhitespace),
    optional('IS.11'),
    zeroOrMore(contentWhitespace),
    optional('-'),
    zeroOrMore(contentWhitespace),
    optional('Asset'),
    zeroOrMore(contentWhitespace),
    optional('Register'),
    zeroOrMore(contentWhitespace),
    optional('Policy'),
    zeroOrMore(contentWhitespace),
    'Confidentiality',
    zeroOrMore(contentWhitespace),
    'level:',
    zeroOrMore(contentWhitespace),
    choiceOf('1', '2'),
    zeroOrMore(contentWhitespace),
    optional('-'),
    zeroOrMore(contentWhitespace),
    choiceOf('Public', 'Internal'),
  ],
  { global: true, ignoreCase: true },
);

export const pageBreakRegex = buildRegExp(
  [oneOrMore('-'), 'Page (', oneOrMore(digit), ') Break', oneOrMore('-')],
  { global: true },
);

export const lineSeparatorRegex = buildRegExp(
  [
    zeroOrMore(' '),
    choiceOf([oneOrMore('\n'), optional('\n')], [oneOrMore('\r'), optional('\n')]),
    zeroOrMore(' '),
  ],
  { global: true },
);

// Markdown download escapes all dashes \-
export const escapedDashRegex = buildRegExp(['\\-'], { global: true });

// Reformat all bullet lists
export const listItemRegex = buildRegExp(
  [optional(choiceOf(startOfString, '\n')), '●', optional(whitespace)],
  { global: true },
);

/*
![][image1]

[image1]:
<data:image/png;base64,iVBORw0K>
*/
export const markdownImagesRegex = buildRegExp(
  [
    choiceOf(
      ['![][', oneOrMore(any, { greedy: false }), ']'],
      [
        '[',
        oneOrMore(any, { greedy: false }),
        ']:',
        optional(choiceOf(oneOrMore('\n'), oneOrMore(whitespace))),
        '<',
        oneOrMore(any, { greedy: false }),
        '>',
      ],
    ),
  ],
  { global: true },
);

export const markdownLinkRegex = buildRegExp(
  ['[', oneOrMore(any, { greedy: false }), ']', '(', oneOrMore(any, { greedy: false }), ')'],
  { global: true },
);
