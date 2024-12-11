import { expect, test } from 'vitest';
import { createMockVercelModel } from '../../mock/vercel-mock-model.js';
import { createApp } from '../../application.js';
import { Message } from '../../domain.js';
import { VercelChatModelAdapter } from '../vercel.js';

const messages: Message[] = [{ role: 'user', content: 'Hello' }];

test('sends system messages when system prompt is provided', async () => {
  const { languageModel, calls } = createMockVercelModel({ text: 'Hello, world!' });
  const app = createApp({
    chatModel: new VercelChatModelAdapter({ languageModel }),
    systemPrompt: 'This is system prompt',
  });

  await app.processMessages(messages);
  expect(calls.length).toBe(1);
  expect(calls[0].prompt).toContainEqual({
    role: 'system',
    content: 'This is system prompt',
  });
});

test('does not send system message when system prompt is not provided', async () => {
  const { languageModel, calls } = createMockVercelModel({ text: 'Hello, world!' });
  const app = createApp({
    chatModel: new VercelChatModelAdapter({ languageModel }),
  });

  await app.processMessages(messages);
  expect(calls.length).toBe(1);
  expect(calls[0].prompt).not.toContainEqual({
    role: 'system',
  });
});

test('does not send system message when system prompt returns null', async () => {
  const { languageModel, calls } = createMockVercelModel({ text: 'Hello, world!' });
  const app = createApp({
    chatModel: new VercelChatModelAdapter({ languageModel }),
    systemPrompt: () => null,
  });

  await app.processMessages(messages);
  expect(calls.length).toBe(1);
  expect(calls[0].prompt).not.toContainEqual({
    role: 'system',
  });
});

test('does not send system message when system prompt returns empty string', async () => {
  const { languageModel, calls } = createMockVercelModel({ text: 'Hello, world!' });
  const app = createApp({
    chatModel: new VercelChatModelAdapter({ languageModel }),
    systemPrompt: () => '',
  });

  await app.processMessages(messages);
  expect(calls.length).toBe(1);
  expect(calls[0].prompt).not.toContainEqual({
    role: 'system',
  });
});
