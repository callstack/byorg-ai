import { RequestContext } from '../domain.js';

export type AssistantResponse = {
  role: 'assistant';
  content: string;
  usage: ModelUsage;
};

export type ModelUsage = {
  model: string;
  inputTokens: number;
  outputTokens: number;
  requests: number;
  responseTime: number;
  usedTools?: Record<string, number>;
};

export interface ChatModel {
  name: string;
  generateResponse(context: RequestContext): Promise<AssistantResponse>;
}
