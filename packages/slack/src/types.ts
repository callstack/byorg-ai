import { Application } from '@callstack/byorg-core';
import Slack from '@slack/bolt';

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
};

export type ConversationMode = 'direct' | 'public_channel';
