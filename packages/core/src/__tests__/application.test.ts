import { expect, test, vitest } from 'vitest';
import { createApp } from '../application.js';
import { Message } from '../domain.js';
import { createMockModel } from '../mock/mock-model.js';

const messages: Message[] = [{ role: 'user', content: 'Hello' }];

test('basic non-streaming test', async () => {
  const testModel = createMockModel({ delay: 0, seed: 3 });
  const app = createApp({
    chatModel: testModel,
    systemPrompt: () => '',
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
  const testModel = createMockModel({ delay: 0, seed: 3 });
  const app = createApp({
    chatModel: testModel,
    systemPrompt: () => '',
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
