import { createApp, createMockChatModel, Message } from '@callstack/byorg-core';
import { describe, expect, it, vitest } from 'vitest';
import { slackThreadNormalizerPlugin } from '../plugins/thread-normalization.js';

describe('threadNormalizer', () => {
  it('should remove slack "New chat" initial message', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'New chat\n' },
      { role: 'user', content: 'Hello!' },
    ];
    const baseModel = createMockChatModel({ delay: 0, seed: 3 });

    const modelSpy = vitest.spyOn(baseModel, 'generateResponse');

    const app = createApp({
      chatModel: baseModel,
      plugins: [slackThreadNormalizerPlugin],
    });

    await app.processMessages(messages);

    expect(modelSpy.mock.calls[0][0]['messages']).toEqual([{ role: 'user', content: 'Hello!' }]);
  });
});
