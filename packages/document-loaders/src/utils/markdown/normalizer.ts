import {
  allowedConfidentialyLevelRegex,
  contentWhitespacesRegex,
  deniedConfidentialyLevelRegex,
  escapedDashRegex,
  leadingWhitespaceRegex,
  lineSeparatorRegex,
  listItemRegex,
  markdownLinkRegex,
  trailingWhitespaceRegex,
} from '../cleanup-content.js';

export function normalizeMarkdown(content: string) {
  if (deniedConfidentialyLevelRegex.test(content)) {
    throw new Error('Markdown Parser Confidentiality level is not allowed');
  }

  return content
    .replaceAll(lineSeparatorRegex, '\n')
    .replaceAll(leadingWhitespaceRegex, '')
    .replaceAll(trailingWhitespaceRegex, '')
    .replaceAll(contentWhitespacesRegex, ' ')
    .replaceAll(escapedDashRegex, '-')
    .replaceAll(allowedConfidentialyLevelRegex, '')
    .replaceAll(listItemRegex, '\n- ')
    .trim();
}

export function normalizeMarkdownForEmbedding(text: string): string {
  return text.replaceAll(markdownLinkRegex, '');
}
