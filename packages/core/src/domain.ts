import { ApplicationTool } from './tools.js';
import type { AssistantResponse } from './ai/types.js';
import { ReferenceStorage } from './references.js';
import { PerformanceTimeline } from './performance.js';

export type UserMessage = {
  role: 'user';
  content: string;
  senderId?: string;
  attachments?: FileBuffer[];
};

export type AssistantMessage = {
  role: 'assistant';
  content: string;
  senderId?: string;
  attachments?: FileBuffer[];
};

export type Message = UserMessage | AssistantMessage;
export type MessageRole = Message['role'];

export type RequestContext = {
  /** All messages from given conversation */
  messages: Message[];

  /** Convenience reference to the last `messages` item which is the latest `UserMessage`. */
  lastMessage: UserMessage;

  tools: ApplicationTool[];
  references: ReferenceStorage;
  resolvedEntities: EntityInfo;
  systemPrompt: () => string | null;
  onPartialResponse?: (text: string) => void;
  extras: MessageRequestExtras;
  performance: PerformanceTimeline;
};

export type MessageResponse = AssistantResponse | SystemResponse;

export type SystemResponse = {
  role: 'system';
  content: string;
  error?: unknown;
  usage?: undefined;
};
// Module augmentation, interface merging
export interface MessageRequestExtras {}

// Module augmentation, interface merging
export type EntityInfo = Record<string, object | null>;

export type FileBuffer = {
  name: string;
  mimeType: string;
  buffer: ArrayBuffer;
};
