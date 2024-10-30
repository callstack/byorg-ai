import { ApplicationPlugin, RequestContext, MessageResponse, Message } from '@callstack/byorg-core';
import { logger } from '@callstack/byorg-utils';
import { resolveUser, SlackUserInfo } from '../resolvers/resolver-user.js';
import { resolveChannel, SlackChannelInfo } from '../resolvers/resolver-channel.js';

const USER_REGEX = /<@([A-Z0-9]+)>/g;
const CHANNEL_REGEX = /<#([A-Z0-9]+)\|>/g;

export type SlackUserDictionary = Record<string, SlackUserInfo>;

export const slackEntityResolverPlugin: ApplicationPlugin = {
  name: 'slack-entity-resolver',
  middleware: async (context, next): Promise<MessageResponse> => {
    const [users, channels] = await Promise.all([resolveUsers(context), resolveChannels(context)]);

    context.resolvedEntities = {
      ...context.resolvedEntities,
      ...users,
      ...channels,
    };

    logger.debug('Resolved Slack entities:', context.resolvedEntities);

    // Continue middleware chain
    return await next();
  },
};

async function resolveUsers(context: RequestContext): Promise<SlackUserDictionary> {
  const userIds = new Set([
    ...extractSenders(context),
    ...extractMatchesFromContext(context, USER_REGEX),
  ]);

  const users = await Promise.all(
    [...userIds].map(async (id) => {
      const info = await resolveUser(id);
      return { id: `<@${id}>`, info };
    }),
  );

  const result: SlackUserDictionary = {};
  for (const entry of users) {
    if (entry.info) {
      result[entry.id] = entry.info;
    }
  }

  return result;
}

async function resolveChannels(context: RequestContext): Promise<Record<string, SlackChannelInfo>> {
  const userIds = [...extractMatchesFromContext(context, CHANNEL_REGEX)];

  const users = await Promise.all(
    userIds.map(async (id) => {
      const info = await resolveChannel(id);
      return { id: `<#${id}>`, info };
    }),
  );

  const result: Record<string, SlackChannelInfo> = {};
  for (const entry of users) {
    if (entry.info) {
      result[entry.id] = entry.info;
    }
  }

  return result;
}

function extractSenders(context: RequestContext): Set<string> {
  const users = context.messages.map((message) => message.senderId).filter((u): u is string => !!u);

  return new Set(users);
}

export function extractUserMentionsFromMessage(message: Message): string[] {
  const userIds = extractMatchesFromText(message.content, USER_REGEX);

  return [...userIds];
}

function extractMatchesFromContext(context: RequestContext, pattern: RegExp): Set<string> {
  const result = new Set<string>();

  for (const message of context.messages) {
    const matches = extractMatchesFromText(message.content, pattern);
    // Using `add` instead of `union` as it throws in runtime
    for (const match of matches) {
      result.add(match);
    }
  }

  return result;
}

function extractMatchesFromText(text: string, pattern: RegExp): Set<string> {
  const matches = [...text.matchAll(pattern)];
  return new Set(matches.map((match) => match[1]));
}
