import { VercelChatModelAdapter, createApp } from '@callstack/byorg-core';
import { createOpenAI } from '@ai-sdk/openai';
import { logger, requireEnv } from '@callstack/byorg-utils';
import { createDiscordApp } from '@callstack/byorg-discord';

const LANGUAGE_MODEL = 'gpt-4o-2024-11-20';
const API_KEY = requireEnv('OPENAI_API_KEY');
const DISCORD_BOT_TOKEN = requireEnv('DISCORD_BOT_TOKEN');

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

const discordClient = await createDiscordApp({
  app,
});

void (async () => {
  try {
    await discordClient.login(DISCORD_BOT_TOKEN);
    logger.info('Discord ready.');
  } catch (error) {
    logger.error('Dev Slack start error:', error);
  }
})();
