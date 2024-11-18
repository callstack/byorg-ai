import { logger } from '@callstack/byorg-utils';
import { ChatModel } from './ai/types.js';
import { PerformanceMarks } from './constants.js';
import {
  RequestContext,
  MessageRequestExtras,
  MessageResponse,
  SystemResponse,
  Message,
} from './domain.js';
import { Middleware, MiddlewareHandler } from './middleware.js';
import { PerformanceTimeline } from './performance.js';
import { getReferenceStorage } from './references.js';
import { ApplicationTool } from './tools.js';
import { requestValidationMiddleware } from './validation.js';

export type ProcessMessageResult = {
  response: MessageResponse;
  pendingEffects: Promise<void[]>;
};

export type Application = {
  processMessages(
    messages: Message[],
    options?: ProcessMessageOptions,
  ): Promise<ProcessMessageResult>;
};

export type ApplicationConfig = {
  chatModel: ChatModel;
  systemPrompt: (context: RequestContext) => Promise<string> | string;
  plugins?: ApplicationPlugin[];
  errorHandler?: (
    error: unknown,
    context: RequestContext,
  ) => Promise<MessageResponse> | MessageResponse;
};

export type ApplicationPlugin = {
  name: string;
  middleware?: Middleware;
  effects?: Effect[];
  tools?: ApplicationTool[];
};

export type Effect = (context: RequestContext, response: MessageResponse) => Promise<void>;

export type ProcessMessageOptions = {
  extras?: MessageRequestExtras;
  onPartialResponse?: (partialText: string) => void;
};

export function createApp(config: ApplicationConfig): Application {
  const { plugins = [], chatModel, errorHandler = defaultErrorHandler } = config;

  plugins.forEach((plugin) => {
    logger.info(`Plugin "${plugin.name}" registered`);
  });

  const middlewares: Middleware[] = [
    ...plugins.map((plugin) => plugin.middleware).filter((middleware) => middleware != null),
    requestValidationMiddleware,
  ];
  const effects: Effect[] = [...plugins.flatMap((plugin) => plugin.effects ?? [])];
  const tools: ApplicationTool[] = [...plugins.flatMap((plugin) => plugin.tools ?? [])];

  // TODO: Validate
  tools.forEach((tool) => {
    logger.info(`Tool "${tool.name}" registered`);
  });

  const middlewareExecutor = new MiddlewareHandler();
  middlewareExecutor.use(middlewares);

  return {
    processMessages: async (
      messages: Message[],
      options?: ProcessMessageOptions,
    ): Promise<ProcessMessageResult> => {
      const lastMessage = messages.at(-1);
      if (lastMessage?.role !== 'user') {
        throw new Error('Last message in the "messages" list should be a "UserMessage"');
      }

      logger.debug(`Processing message for user: ${lastMessage.senderId}`);

      const performance = new PerformanceTimeline();
      performance.markStart(PerformanceMarks.processMessages);

      const onPartialResponse = options?.onPartialResponse;
      const context: RequestContext = {
        messages,
        get lastMessage() {
          const lastMessage = this.messages.at(-1);
          // This will normally be true, unless the middleware
          if (lastMessage?.role !== 'user') {
            throw new Error('Last message in the "messages" list should be a "UserMessage"');
          }

          return lastMessage;
        },

        tools,
        references: getReferenceStorage(),
        resolvedEntities: {},
        onPartialResponse,
        extras: options?.extras ?? {},
        performance,
        systemPrompt: () => config.systemPrompt(context),
      };

      const handler = async () => {
        // Closes the 'middleware:beforeHandler' mark started before middlewareExecutor has run
        performance.markEnd(PerformanceMarks.middlewareBeforeHandler);

        performance.markStart(PerformanceMarks.chatModel);
        const response = await chatModel.generateResponse(context);
        performance.markEnd(PerformanceMarks.chatModel);

        // Opens the 'middleware:afterHandler' mark that will be closed after middlewareExecutor has run
        performance.markStart(PerformanceMarks.middlewareAfterHandler);

        return response;
      };

      let response: MessageResponse;
      try {
        performance.markStart(PerformanceMarks.middlewareBeforeHandler);

        // markEnd(PerformanceMarks.middlewareBeforeHandler) & markStart(PerformanceMarks.middlewareAfterHandler) happen in handler
        response = await middlewareExecutor.run(context, handler);

        performance.markEnd(PerformanceMarks.middlewareAfterHandler);
      } catch (error) {
        performance.markStart(PerformanceMarks.errorHandler);
        response = await errorHandler(error, context);
        performance.markEnd(PerformanceMarks.errorHandler);
      } finally {
        performance.markEnd(PerformanceMarks.processMessages);
      }

      const pendingEffects = Promise.all(
        effects.map(async (effect) => {
          try {
            return await effect(context, response);
          } catch (error) {
            logger.error(`Effect failed ${effect.name}`, error);
          }
        }),
      );

      return { response, pendingEffects };
    },
  };
}

function defaultErrorHandler(error: unknown, _context: RequestContext): SystemResponse {
  logger.error('Error while processing message:', error);

  return {
    role: 'system',
    content: 'An error occurred while processing your request. Please try again later.',
    error,
  };
}
