import { LanguageModelV1CallOptions } from 'ai';
import { MockLanguageModelV1 } from 'ai/test';

export type MockVercelModelOptions = {
  text: string;
};

export function createMockVercelModel({ text }: MockVercelModelOptions) {
  const calls: LanguageModelV1CallOptions[] = [];
  const languageModel = new MockLanguageModelV1({
    doGenerate: (options) => {
      calls.push(options);
      return Promise.resolve({
        rawCall: { rawPrompt: null, rawSettings: {} },
        finishReason: 'stop',
        usage: { promptTokens: 10, completionTokens: 20 },
        text,
      });
    },
    // TODO: add doStream when needed
  });

  return { languageModel, calls };
}
