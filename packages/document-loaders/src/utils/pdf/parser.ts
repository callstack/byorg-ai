import {
  allowedConfidentialyLevelRegex,
  contentWhitespacesRegex,
  deniedConfidentialyLevelRegex,
  leadingWhitespaceRegex,
  lineSeparatorRegex,
  pageBreakRegex,
  trailingWhitespaceRegex,
} from '../cleanup-content.js';

export function parsePdfContentToPages(content: string) {
  const pages = content.split(pageBreakRegex);
  return pages.map(normalizePageContent).filter((page) => page);
}

function normalizePageContent(content: string) {
  if (deniedConfidentialyLevelRegex.test(content)) {
    throw new Error('PDF Parser Confidentiality level is not allowed');
  }

  return content
    .replaceAll(lineSeparatorRegex, '\n')
    .replaceAll(leadingWhitespaceRegex, '')
    .replaceAll(trailingWhitespaceRegex, '')
    .replaceAll(contentWhitespacesRegex, ' ')
    .replaceAll(allowedConfidentialyLevelRegex, '')
    .trim();
}
