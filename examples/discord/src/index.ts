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

const chatModel = new VercelChatModelAdapter({
  languageModel: openAiProvider.languageModel(LANGUAGE_MODEL),
});

// You can use a mock model for testing before using real LLM:
// import { createMockModel } from '@callstack/byorg-core';
// const chatModel = createMockModel();

const systemPrompt = () => {
  return 'Your name is Byorg. You are a helpful AI Assistant.';
};

const app = createApp({
  chatModel,
  systemPrompt,
});

const discord = await createDiscordApp({ app });

void (async () => {
  try {
    await discord.login(DISCORD_BOT_TOKEN);
    logger.info('Discord ready.');
  } catch (error) {
    logger.error('Dev Slack start error:', error);
  }
})();
