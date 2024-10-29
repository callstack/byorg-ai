import { Client } from '@notionhq/client';
import { requireEnv } from '@callstack/byorg-utils';

let notionClient: Client;

export function getNotionClient() {
  if (notionClient) {
    return notionClient;
  }

  const notionToken = requireEnv('NOTION_TOKEN');

  return new Client({
    auth: notionToken,
  });
}
