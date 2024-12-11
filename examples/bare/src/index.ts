import readline from 'readline';
import { Message, VercelChatModelAdapter, createApp } from '@callstack/byorg-core';
import { createOpenAI } from '@ai-sdk/openai';
import { requireEnv } from '@callstack/byorg-utils';

const LANGUAGE_MODEL = 'gpt-4o-2024-11-20';
const API_KEY = requireEnv('OPENAI_API_KEY');

const openAiProvider = createOpenAI({
  apiKey: API_KEY,
  compatibility: 'strict', // strict mode, enable when using the OpenAI API
});

const chatModel = new VercelChatModelAdapter({
  languageModel: openAiProvider.languageModel(LANGUAGE_MODEL),
});

// You can use a mock model for testing before using real LLM
// import { createChatMockModel } from '@callstack/byorg-core';
// const chatModel = createChatMockModel();

const SYSTEM_PROMPT = 'Your name is Byorg. You are a helpful AI Assistant.';

const app = createApp({
  chatModel,
  systemPrompt: SYSTEM_PROMPT,
});

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'You: ',
});

// Create array for messages
const messages: Message[] = [];

// Start the CLI chat
console.log('Welcome to the byorg.ai example cli Chat!\n');

rl.prompt();

rl.on('line', async (line: string) => {
  const input = line.trim();

  if (input.toLowerCase() === 'exit') {
    console.log('\nGoodbye!');
    rl.close();
    return;
  }

  messages.push({ role: 'user', content: input });

  process.stdout.write('\n');
  process.stdout.write('ai: ');

  let currentMessage = '';
  const { response } = await app.processMessages(messages, {
    onPartialResponse: (text: string) => {
      const delta = text.slice(currentMessage.length);
      currentMessage += delta;
      process.stdout.write(delta);
    },
  });

  if (response.role === 'assistant') {
    messages.push({ role: response.role, content: response.content });
  }

  process.stdout.write('\n\n');

  rl.prompt();

  return;
});

process.on('SIGINT', () => {
  console.log('Exiting');
  process.exit();
});
