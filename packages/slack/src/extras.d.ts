import { ConversationMode } from './types.ts';

declare module '@callstack/byorg-core' {
  interface MessageRequestExtras {
    threadTs?: string;
    messageTs?: string;
    conversationMode?: ConversationMode;
  }
}

export {};
