import { expect, it, describe } from 'vitest';
import { Message } from '@callstack/byorg-core';
import { formatGroupMessage } from '../messages.js';

describe('formatGroupMessage', () => {
  it('should return content without sender id for assistant messages', () => {
    const message: Message = {
      role: 'assistant',
      content: 'Hello world',
      senderId: 'BOT123',
    };

    expect(formatGroupMessage(message)).toBe('Hello world');
  });

  it('should return content without sender id when senderId is missing', () => {
    const message: Message = {
      role: 'user',
      content: 'Hello world',
    };

    expect(formatGroupMessage(message)).toBe('Hello world');
  });

  it('should prepend sender id for user messages', () => {
    const message: Message = {
      role: 'user',
      content: 'Hello world',
      senderId: 'USER123',
    };

    expect(formatGroupMessage(message)).toBe('[USER123] Hello world');
  });
});
