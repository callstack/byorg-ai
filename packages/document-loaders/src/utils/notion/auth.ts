import { Client } from '@notionhq/client';
import { requireEnv } from '@callstack/byorg-utils';

let notionClient: Client | null = null;

export function getNotionClient(): Client {
  if (notionClient) {
    return notionClient;
  }

  const notionToken = requireEnv('NOTION_TOKEN');
  notionClient = new Client({
    auth: notionToken,
  });

  return notionClient;
}
