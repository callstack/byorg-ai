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

test('removes trailing assistant messages', async () => {
  const processRequest = vitest.fn((_context: RequestContext) => {
    return 'Response text';
  });

  const testModel = createMockChatModel({
    delay: 0,
    seed: 3,
    processRequest,
  });

  const messages: Message[] = [
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi!' },
    { role: 'assistant', content: 'Sup!' },
  ];

  Object.freeze(messages);

  const app = createApp({
    chatModel: testModel,
  });

  const onPartialResponse = vitest.fn();

  // This hides the warning thrown by function
  const consoleSpy = vitest.spyOn(console, 'warn').mockImplementationOnce(() => undefined);

  await app.processMessages(messages, { onPartialResponse });

  // confirms that main messages were not mutated
  expect(messages).toEqual([
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi!' },
    { role: 'assistant', content: 'Sup!' },
  ]);

  expect(consoleSpy).toHaveBeenCalledOnce();
  expect(consoleSpy.mock.calls[0][0]).toContain('Ignored 2 trailing assistant message(s).');

  expect(processRequest).toHaveBeenCalledOnce();
  expect(processRequest.mock.calls[0][0]['messages']).toEqual([{ role: 'user', content: 'Hello' }]);
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

test('adds unique and returns references', async () => {
  const baseModel = createMockChatModel({ delay: 0, seed: 3 });
  const refFunc = vitest.fn();

  const addReferenceMiddlewareMock = vitest.fn(
    async (context: RequestContext, next: () => Promise<MessageResponse>) => {
      context.references.addReferences([{ title: 'Test', url: 'test.com' }]);
      return await next();
    },
  );

  const getReferenceMiddlewareMock = vitest.fn(
    async (context: RequestContext, next: () => Promise<MessageResponse>) => {
      const response = await next();
      refFunc(context.references.getReferences());
      return response;
    },
  );

  const app = createApp({
    chatModel: baseModel,
    plugins: [
      {
        name: 'add',
        middleware: addReferenceMiddlewareMock,
      },
      {
        name: 'get',
        middleware: getReferenceMiddlewareMock,
      },
    ],
  });

  expect(refFunc).not.toBeCalled();
  await app.processMessages(messages);
  expect(addReferenceMiddlewareMock).toBeCalledTimes(1);
  expect(getReferenceMiddlewareMock).toBeCalledTimes(1);
  expect(refFunc).toBeCalledWith([{ title: 'Test', url: 'test.com' }]);
  await app.processMessages(messages);
  expect(addReferenceMiddlewareMock).toBeCalledTimes(2);
  expect(getReferenceMiddlewareMock).toBeCalledTimes(2);
  expect(refFunc).toBeCalledWith([{ title: 'Test', url: 'test.com' }]);
});
