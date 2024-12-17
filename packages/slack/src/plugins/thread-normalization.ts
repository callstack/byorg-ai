import { ApplicationPlugin, MessageResponse } from '@callstack/byorg-core';
import { logger } from '@callstack/byorg-utils';

/**
 * Slack plugin for normalizing messages coming from Slack [AI apps](https://api.slack.com/docs/apps/ai). 
 */
export const slackThreadNormalizerPlugin: ApplicationPlugin = {
  name: 'slack-thread-normalizer',
  middleware: async (context, next): Promise<MessageResponse> => {
    const { messages } = context;

    if (messages[0].content === 'New chat\n' && messages[1]?.role === 'user') {
      context.messages = messages.slice(1);
      logger.debug('Removed Slack "New Chat" message');
    }

    // Continue middleware chain
    return await next();
  },
};
