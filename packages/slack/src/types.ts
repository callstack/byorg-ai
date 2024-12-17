import { Application } from '@callstack/byorg-core';
import Slack from '@slack/bolt';
import {
  ConversationsInfoResponse,
  ConversationsRepliesResponse,
  FilesInfoResponse,
  UsersProfileGetResponse,
} from '@slack/web-api';

/**
 * This type defines a standardized structure for Slack messages,
 * regardless of the source (e.g., mention event, message event)
 */
export type SlackMessage = {
  ts: string;
  thread_ts?: string;
  channel: string;
  text: string;
  user: string;
  filesUrls?: string[];
};

export type SlackApplicationConfig = {
  app: Application;
  socketMode?: boolean;
  token: string;
  appToken: string;
  signingSecret: string;
  logLevel?: Slack.LogLevel;
  streamingThrottle?: number;
};

// Helper TS function to extract types eg. messages?: Message[] into Message
export type Unpacked<T> = T extends (infer U)[] ? NonNullable<U> : NonNullable<T>;

export type MessageElement = Unpacked<ConversationsRepliesResponse['messages']>;

export type FileElement = Unpacked<MessageElement['files']>;

export type File = NonNullable<FilesInfoResponse['file']>;

export type Profile = Unpacked<UsersProfileGetResponse['profile']>;

export type Channel = Unpacked<ConversationsInfoResponse['channel']>;

export type ConversationMode = 'direct' | 'public_channel';
