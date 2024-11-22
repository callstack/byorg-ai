import { VercelChatModelAdapter, createApp } from '@callstack/byorg-core';
import { createOpenAI } from '@ai-sdk/openai';
import { logger, requireEnv } from '@callstack/byorg-utils';
import { createSlackApp } from '@callstack/byorg-slack';

const LANGUAGE_MODEL = 'gpt-4o-2024-11-20';
const API_KEY = requireEnv('OPENAI_API_KEY');
const SLACK_BOT_TOKEN = requireEnv('SLACK_BOT_TOKEN');
const SLACK_APP_TOKEN = requireEnv('SLACK_APP_TOKEN');
const SLACK_SIGNING_SECRET = requireEnv('SLACK_SIGNING_SECRET');

const openAiProvider = createOpenAI({
  apiKey: API_KEY,
  compatibility: 'strict', // strict mode, enable when using the OpenAI API
});

const openAiModel = openAiProvider.languageModel(LANGUAGE_MODEL);

const chatModel = new VercelChatModelAdapter({
  languageModel: openAiModel,
});

const systemPrompt = () => {
  return 'Your name is Cassandra. You are an AI Assistant.';
};

const app = createApp({
  chatModel,
  systemPrompt,
});

const slack = createSlackApp({
  app,
  socketMode: true,
  token: SLACK_BOT_TOKEN,
  appToken: SLACK_APP_TOKEN,
  signingSecret: SLACK_SIGNING_SECRET,
});

void (async () => {
  try {
    await slack.start(8080);
    logger.info('Slack ready.');
  } catch (error) {
    logger.error('Dev Slack start error:', error);
  }
})();
