import { WebClient } from '@slack/web-api';
import { withCache } from '@callstack/byorg-utils';
import { getIdentity } from './slack-api.js';

export const getBotId = withCache(async (client: WebClient) => {
  const response = await getIdentity(client);

  if (!response.bot_id) {
    throw new Error("Unexpected lack of 'bot_id' in 'auth.test' response");
  }

  return response.bot_id;
});
