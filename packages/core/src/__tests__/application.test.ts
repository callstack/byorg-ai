import { expect, test, vitest } from 'vitest';
import { createApp } from '../application.js';
import { Message, MessageResponse, RequestContext } from '../domain.js';
import { createMockChatModel } from '../mock/mock-model.js';

const messages: Message[] = [{ role: 'user', content: 'Hello' }];

test('basic non-streaming test', async () => {
  const testModel = createMockChatModel({ delay: 0, seed: 3 });
  const app = createApp({
    chatModel: testModel,
  });

  const result = await app.processMessages(messages);
  expect(result.response).toEqual({
    content:
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    role: 'assistant',
    usage: {
      model: 'test',
      inputTokens: 1,
      outputTokens: 17,
      requests: 1,
      responseTime: 0,
    },
  });
  await expect(result.pendingEffects).resolves.toEqual([]);
});

test('basic streaming test', async () => {
  const testModel = createMockChatModel({ delay: 0, seed: 3 });
  const app = createApp({
    chatModel: testModel,
  });

  const onPartialResponse = vitest.fn();
  const result = await app.processMessages(messages, { onPartialResponse });
  expect(onPartialResponse.mock.calls.map((call) => call[0])).toEqual([
    'Excepteur ',
    'Excepteur sint ',
    'Excepteur sint occaecat ',
    'Excepteur sint occaecat cupidatat ',
    'Excepteur sint occaecat cupidatat non ',
    'Excepteur sint occaecat cupidatat non proident, ',
    'Excepteur sint occaecat cupidatat non proident, sunt ',
    'Excepteur sint occaecat cupidatat non proident, sunt in ',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa ',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui ',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia ',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt ',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit ',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim ',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id ',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est ',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  ]);

  expect(result.response).toEqual({
    content:
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    role: 'assistant',
    usage: {
      model: 'test',
      inputTokens: 1,
      outputTokens: 17,
      requests: 1,
      responseTime: 0,
    },
  });
  await expect(result.pendingEffects).resolves.toEqual([]);
});

test('uses chat model from context', async () => {
  const baseModel = createMockChatModel({ delay: 0, seed: 3 });
  const altModel = createMockChatModel({ delay: 0, seed: 3 });

  async function altModelMiddleware(context: RequestContext, next: () => Promise<MessageResponse>) {
    context.chatModel = altModel;
    return await next();
  }

  const app = createApp({
    chatModel: baseModel,
    plugins: [
      {
        name: 'middleware',
        middleware: altModelMiddleware,
      },
    ],
  });

  await app.processMessages(messages);
  expect(altModel.calls.length).toBe(1);
  expect(baseModel.calls.length).toBe(0);
});
