import { logger } from '@callstack/byorg-utils';
import { NotionRecordProps } from './types.js';

export function parseStringProp(props: NotionRecordProps, name: string): string {
  const result = parseOptionalStringProp(props, name);
  if (result == null) {
    logger.error('Entity: ', JSON.stringify(props, null, 2));
    throw new Error(`Notion: property "${name}" is required.`);
  }

  return result;
}

export function parseOptionalStringProp(
  props: NotionRecordProps,
  name: string,
): string | undefined {
  const prop = props[name];
  if (prop == null) {
    return undefined;
  }

  switch (prop.type) {
    case 'rich_text':
      if (prop.rich_text.length === 0) {
        return undefined;
      }
      return prop.rich_text.map((t) => t.plain_text).join('');

    case 'title':
      return prop.title[0]?.plain_text ?? undefined;

    case 'url':
      return prop.url ?? undefined;

    case 'email':
      return prop.email ?? undefined;

    case 'select':
      return prop.select?.name;

    case 'multi_select':
      return prop.multi_select.map((s) => s.name).join('; ');

    default:
      logger.error(`${name}:`, JSON.stringify(prop, null, 2));
      throw new Error(`Notion: property type "${prop?.type}" not supported ("${name}")`);
  }
}
