import { logger } from '@callstack/byorg-utils';
import { Channel } from '@slack/web-api/dist/response/ConversationsInfoResponse.js';
import { getWebClient } from '../slack-api.js';

export type SlackChannelInfo = {
  name: string | undefined;
  topic: string | undefined;
  purpose: string | undefined;
};

const cache = new Map<string, SlackChannelInfo | null>();

export async function resolveChannel(channelId: string): Promise<SlackChannelInfo | null> {
  if (cache.has(channelId)) {
    return cache.get(channelId) ?? null;
  }

  try {
    const client = getWebClient();
    const response = await client.conversations.info({ channel: channelId });
    if (!response.channel) {
      logger.warn(`Unable to resolve channel: "${channelId}"`, response.error);
      return null;
    }

    const user = mapChannel(response.channel);
    cache.set(channelId, user);
    return user;
  } catch (error) {
    logger.warn(`Unable to resolve user: "${channelId}"`, error);
    return null;
  }
}

function mapChannel(channel: Channel): SlackChannelInfo {
  return {
    name: channel.name ?? channel.name_normalized,
    topic: channel.topic?.value,
    purpose: channel.purpose?.value,
  };
}
