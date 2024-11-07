import Slack, { ContextBlock, LogLevel, RichTextBlock, SayFn } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { Application } from '@callstack/byorg-core';
import { logger } from '@callstack/byorg-utils';
import { parseMarkdownToRichTextBlock } from '@callstack/slack-rich-text';
import pDebounce from 'p-debounce';
import {
  SlackMessage,
  SlackApplicationConfig as SlackApplicationConfig,
  ConversationMode,
} from './types.js';
import { fetchFileInfo, getThread } from './slack-api.js';
import { formatGroupMessage, toCoreMessage } from './messages.js';
import { wait } from './utils.js';
import { getBotId } from './bot-id.js';

type MessageBlock = RichTextBlock | ContextBlock;

const UPDATE_THROTTLE_TIME = 1000;
const NOTIFICATION_TEXT_LIMIT = 200;

const RESPONDING_BLOCK: MessageBlock = {
  type: 'context',
  elements: [{ type: 'plain_text', text: 'Responding...  🐌', emoji: true }],
};

export function createSlackApp(options: SlackApplicationConfig): Slack.App {
  const app = new Slack.App({
    socketMode: options.socketMode,
    token: options.token,
    appToken: options.appToken,
    signingSecret: options.signingSecret,
    logLevel: options.logLevel ?? LogLevel.WARN,
  });

  configureSlackApp(options.app, app);
  return app;
}

type HandleMessageContext = {
  conversationMode: ConversationMode;
  client: WebClient;
  say: SayFn;
};

function configureSlackApp(app: Application, slack: Slack.App): void {
  const handleMessage = async (
    slackMessage: SlackMessage,
    { conversationMode, client, say }: HandleMessageContext,
  ) => {
    logger.info(`[SLACK] Received message from user: ${slackMessage.user}`);

    const botId = await getBotId(client);

    // TODO: What should we do with messages coming while the previous one hasn't been handled yet?

    const { channel } = slackMessage;
    const messageTs = slackMessage.ts;
    const threadTs = slackMessage.thread_ts ?? slackMessage.ts;

    const thread = await getThread(channel, threadTs, client);
    const messages = await Promise.all(
      thread.map((message) => toCoreMessage(message, botId, client)),
    );

    if (conversationMode === 'public_channel') {
      messages.forEach((message) => {
        message.content = formatGroupMessage(message);
      });
    }

    logger.debug(`[SLACK] Fetched thread with ${messages.length} message(s).`);

    // Skip the latest one
    const lastMessage = messages.at(-1);
    logger.debug(`[SLACK] Request has ${lastMessage?.attachments?.length ?? 0} attachment(s)`);

    let responseMessageTs: string | null = null;

    const updateResponseMessage = async (content: string, isFinalResponse = false) => {
      logger.debug('[SLACK] Sending response message... ');
      const text = content.slice(0, NOTIFICATION_TEXT_LIMIT);
      const richTextBlock = parseMarkdownToRichTextBlock(content);
      const blocks = isFinalResponse ? [richTextBlock] : [richTextBlock, RESPONDING_BLOCK];

      if (!responseMessageTs) {
        const responseMessage = await say({
          channel,
          thread_ts: threadTs,
          text,
          blocks,
        });
        responseMessageTs = responseMessage.ts as string;

        await wait(UPDATE_THROTTLE_TIME);
        return;
      }

      await client.chat.update({
        channel,
        ts: responseMessageTs,
        text,
        blocks,
        parse: 'none',
      });

      await wait(UPDATE_THROTTLE_TIME);
      return;
    };

    let updatePartialResponsePromise: Promise<void> = Promise.resolve();
    const updateResponseMessageWithThrottle = pDebounce.promise(updateResponseMessage);

    const handlePartialResponse = (response: string): void => {
      updatePartialResponsePromise = updateResponseMessageWithThrottle(response);
    };

    const startTime = performance.now();
    const { response, pendingEffects } = await app.processMessages(messages, {
      onPartialResponse: handlePartialResponse,
      extras: { threadTs, messageTs, conversationMode: conversationMode },
    });

    const responseTime = performance.now() - startTime;
    logger.info(`[SLACK] Processed message in ${responseTime.toFixed(0)} ms`);

    // Wait for the last update to finish
    await updatePartialResponsePromise;

    await updateResponseMessage(response.content, true);
    logger.debug('[SLACK] Sent final response.');

    await pendingEffects;
    logger.debug('[SLACK] Resolved processing effects.');
  };

  // Handle direct messages
  slack.message(async ({ message, client, say }) => {
    if (message.subtype !== undefined && message.subtype !== 'file_share') {
      return;
    }

    const msg: SlackMessage = {
      ts: message.ts,
      thread_ts: message.thread_ts,
      text: message.text?.trim() ?? '',
      channel: message.channel,
      user: message.user,
      filesUrls: message.files
        ?.map((file) => file.url_private)
        .filter((url): url is string => !!url),
    };

    await handleMessage(msg, { conversationMode: 'direct', client, say });
  });

  // Handle mentions
  slack.event('app_mention', async ({ event, client, say }) => {
    if (!event.user) {
      return;
    }

    const resolvedFiles = event.files
      ? await Promise.all(
          event.files.map((file) => file.id).map((file) => fetchFileInfo(client, file)),
        )
      : undefined;

    const msg: SlackMessage = {
      ts: event.ts,
      thread_ts: event.thread_ts,
      text: event.text,
      channel: event.channel,
      user: event.user,
      filesUrls: resolvedFiles
        ?.map((file) => file.url_private)
        .filter((url): url is string => !!url),
    };

    await handleMessage(msg, { conversationMode: 'public_channel', client, say });
  });

  // Handle errors globally
  slack.error((error) => {
    logger.error('Slack app error:', error);
    return Promise.resolve();
  });
}
