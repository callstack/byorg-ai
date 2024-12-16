import { AssistantResponse, ChatModel } from '../ai/types.js';
import { RequestContext } from '../domain.js';

export const LOREM_IPSUM_RESPONSES = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
  'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
  'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?',
  'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?',
];

export type MockChatModelConfig = {
  responses?: string[];
  delay?: number;
  seed?: number;
  processRequest?: (context: RequestContext) => string;
};

export type MockChatModel = ChatModel & {
  calls: Parameters<ChatModel['generateResponse']>[];
};

export function createMockChatModel(config?: MockChatModelConfig): MockChatModel {
  const responses = config?.responses ?? LOREM_IPSUM_RESPONSES;
  const delay = config?.delay ?? 100;
  const processRequest = config?.processRequest;

  const calls: Parameters<ChatModel['generateResponse']>[] = [];

  let lastRandom = config?.seed ?? Date.now();
  return {
    calls,
    generateResponse: async (context: RequestContext): Promise<AssistantResponse> => {
      calls.push([context]);
      lastRandom = random(lastRandom);

      const response = processRequest
        ? processRequest(context)
        : responses[lastRandom % responses.length];
      const tokens = response.split(/(\S+\s*)/).filter(Boolean);

      if (context.onPartialResponse) {
        let accumulator = '';
        for (const token of tokens) {
          await sleep(delay);
          accumulator += token;
          context.onPartialResponse(accumulator, token);
        }
      }

      await sleep(delay);

      const allInputLength = context.messages.reduce((acc, msg) => acc + msg.content.length, 0);

      return Promise.resolve({
        role: 'assistant',
        content: response,
        usage: {
          model: 'test',
          inputTokens: Math.round(allInputLength / 4),
          outputTokens: tokens.length,
          requests: 1,
          responseTime: tokens.length * delay,
        },
      });
    },
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simple PRNG for testing
// Definitely not safe for production
function random(state: number): number {
  return (state * 16807) % 2147483647; // Linear congruential generator
}
