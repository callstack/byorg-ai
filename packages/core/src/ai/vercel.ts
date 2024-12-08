import {
  generateText,
  streamText,
  tool as createTool,
  LanguageModel,
  CoreMessage,
  UserContent,
  FinishReason,
  CoreTool,
  LanguageModelUsage,
  ToolCallPart,
} from 'ai';
import { z } from 'zod';
import { PerformanceMarks } from '../constants.js';
import { RequestContext, Message } from '../domain.js';
import { ApplicationTool } from '../tools.js';
import type { ChatModel, AssistantResponse, ModelUsage } from './types.js';

const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_MAX_STEPS = 5;

// Workaround for memory issue happening when sending image attachment. The attachments get inefficiently serialised causing a memory spike.
const VERCEL_AI_SHARED_OPTIONS = {
  experimental_telemetry: {
    // Make sure telemetry is turned off.
    isEnabled: false,

    // Disable serialization of inputs and outputs to reduce memory usage.
    // This should be automatically disabled, but there is currently a bug in the AI SDK.
    recordInputs: false,
    recordOutputs: false,
  },
};

export type VercelChatModelAdapterOptions = {
  languageModel: LanguageModel;
  maxTokens?: number;
  maxSteps?: number;
};

type AiExecutionContext = {
  messages: CoreMessage[];
  tools: Record<string, CoreTool>;
};

type AiExecutionResult = {
  finishReason: FinishReason;
  text: string;
  toolCalls: ToolCallPart[];
  usage: LanguageModelUsage;
  stepsCount: number;
  responseTime: number;
  model: string;
};

export class VercelChatModelAdapter implements ChatModel {
  constructor(private readonly _options: VercelChatModelAdapterOptions) {}

  async generateResponse(context: RequestContext): Promise<AssistantResponse> {
    let systemPrompt = context.systemPrompt();
    const entitiesPrompt = formatResolvedEntities(context.resolvedEntities);
    if (systemPrompt && entitiesPrompt) {
      systemPrompt += '\n\n' + entitiesPrompt;
    }

    const messages: CoreMessage[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push(...context.messages.map(toMessageParam));

    const getRunToolFunction =
      <TParams extends z.ZodSchema, TOutput>(
        tool: ApplicationTool<TParams, TOutput>,
        context: RequestContext,
      ) =>
      (params: z.infer<TParams>): Promise<TOutput> => {
        context.performance.markStart(PerformanceMarks.toolExecution);
        const result = tool.handler(params, context);
        context.performance.markEnd(PerformanceMarks.toolExecution);
        return result;
      };

    const tools = Object.fromEntries(
      context.tools.map((tool) => [
        tool.name,
        createTool({
          description: tool.description,
          parameters: tool.parameters,
          execute: getRunToolFunction(tool, context),
        }),
      ]),
    );

    const executionContext: AiExecutionContext = {
      tools,
      messages: messages,
    };

    const executionResult = context.onPartialResponse
      ? await this.executeRequestWithStreaming(executionContext, context.onPartialResponse)
      : await this.executeRequest(executionContext);

    if (executionResult.finishReason !== 'stop' && executionResult.finishReason !== 'length') {
      throw new AiProviderError(
        `The response stream ended with an unexpected reason: ${executionResult.finishReason}`,
      );
    }

    const usage = this.getUsageFromExecutionResult(executionResult);

    return {
      role: 'assistant',
      content: executionResult.text,
      usage,
    };
  }

  private async executeRequestWithStreaming(
    context: AiExecutionContext,
    onPartialResponse: (text: string) => void,
  ): Promise<AiExecutionResult> {
    const startTime = performance.now();
    const result = await streamText({
      ...VERCEL_AI_SHARED_OPTIONS,
      model: this._options.languageModel,
      maxTokens: this._options.maxTokens ?? DEFAULT_MAX_TOKENS,
      maxSteps: this._options.maxSteps ?? DEFAULT_MAX_STEPS,
      messages: context.messages,
      tools: context.tools,
    });

    let currentText = '';
    for await (const textDelta of result.textStream) {
      currentText += textDelta;
      onPartialResponse(currentText);
    }
    const responseTime = performance.now() - startTime;

    const steps = await result.steps;
    const toolCalls = steps.flatMap((step) => step.toolCalls);

    // By the time we get here, the stream is already finished.
    return {
      finishReason: await result.finishReason,
      text: await result.text,
      toolCalls,
      usage: await result.usage,
      stepsCount: (await result.steps).length,
      responseTime,
      model: (await result.response).modelId,
    };
  }

  private async executeRequest(context: AiExecutionContext): Promise<AiExecutionResult> {
    const startTime = performance.now();
    const result = await generateText({
      ...VERCEL_AI_SHARED_OPTIONS,
      model: this._options.languageModel,
      maxTokens: this._options.maxTokens ?? DEFAULT_MAX_TOKENS,
      maxSteps: this._options.maxSteps ?? DEFAULT_MAX_STEPS,
      messages: context.messages,
      tools: context.tools,
    });
    const responseTime = performance.now() - startTime;
    const toolCalls = result.steps.flatMap((step) => step.toolCalls);

    return {
      finishReason: result.finishReason,
      text: result.text,
      toolCalls,
      usage: result.usage,
      stepsCount: result.steps.length,
      responseTime,
      model: result.response.modelId,
    };
  }

  private getUsageFromExecutionResult(result: AiExecutionResult): ModelUsage {
    // TODO: Make inputTokens and outputTokens nullable
    const usage: ModelUsage = {
      // Those should include sum of all calls
      inputTokens: toNumberOrZero(result.usage.promptTokens),
      outputTokens: toNumberOrZero(result.usage.completionTokens),
      requests: result.stepsCount,
      responseTime: result.responseTime,
      model: result.model,
    };

    result.toolCalls.forEach((toolCall) => {
      usage.usedTools ??= {};
      usage.usedTools[toolCall.toolName] = (usage.usedTools[toolCall.toolName] ?? 0) + 1;
    });

    return usage;
  }
}

export class AiProviderError extends Error {}

function toMessageParam(message: Message): CoreMessage {
  if (message.role === 'assistant') {
    return {
      role: message.role,
      content: message.content,
    };
  }

  return {
    role: message.role,
    content: toUserContent(message),
  };
}

function toUserContent(message: Message): UserContent {
  const files = message.attachments ?? [];

  return [
    { type: 'text' as const, text: message.content },
    ...files.map((file) => ({
      type: 'image' as const,
      image: file.buffer,
      mimeType: file.mimeType,
    })),
  ];
}

function toNumberOrZero(n: number): number {
  return Number.isNaN(n) ? 0 : n;
}

function formatResolvedEntities(entities: Record<string, unknown>): string | null {
  if (Object.keys(entities).length === 0) {
    return null;
  }

  return `### ENTITY DICTIONARY ###\n
${Object.entries(entities)
  .map(([key, value]) => `'${key}' is '${JSON.stringify(value)}'`)
  .join('\n')}
  `;
}
