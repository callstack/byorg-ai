import markdownTable from 'markdown-table';

export function heading(text: string, level: number = 1) {
  return `${'#'.repeat(level)} ${text}`;
}

export function bold(text: string) {
  return `**${text}**`;
}

export function italic(text: string) {
  return `*${text}*`;
}

export function strikethrough(text: string) {
  return `~~${text}~~`;
}

export function code(text: string) {
  return `\`${text}\``;
}

export function codeBlock(text: string, lang: string = '') {
  return '```' + lang + '\n' + text + '\n```\n';
}

export function orderedListItem(text: string) {
  return `1. ${text}`;
}

export function unorderedListItem(text: string) {
  return `- ${text}`;
}

export function toDoItem(text: string, checked: boolean) {
  return `- [${checked ? 'x' : ' '}] ${text}`;
}

export function link(text: string, href: string) {
  return `[${text}](${href})`;
}

export function blockQuote(text: string) {
  const lines = text.split('\n');
  return lines.map((line) => `> ${line}`).join('\n');
}

export const divider = '\n---\n';

export function table(table: string[][]) {
  return markdownTable(table, { alignDelimiters: false });
}
