import { inspect } from 'util';
import { logger } from '@callstack/byorg-utils';
import { ApplicationPlugin, MessageResponse, RequestContext } from '../index.js';

const getFormattedNow = () => new Date().toISOString();

export const loggingPlugin: ApplicationPlugin = {
  name: 'logging',
  middleware: async (context, next): Promise<MessageResponse> => {
    const serializedCommand = JSON.stringify(context.lastMessage);
    console.debug(`${getFormattedNow()} Handling: "${serializedCommand}"...`);

    try {
      // Continue middleware chain
      const response = await next();

      console.debug(`${getFormattedNow()} Handling: "${serializedCommand}" finished.`);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(
        `${getFormattedNow()} Handling: "${serializedCommand}" failed, error: ${errorMessage}`,
      );
      throw error;
    }
  },
};

export const contextLoggerBuilder = (fieldsToLog?: (keyof RequestContext)[]): ApplicationPlugin => {
  return {
    name: 'context-logger',
    middleware: (context, next): Promise<MessageResponse> => {
      const toLog: Record<string, unknown> = {};

      if (!fieldsToLog || fieldsToLog.length === 0) {
        logger.info(inspect(context, false, null, true));
        return next();
      }

      for (const field of fieldsToLog) {
        if (field in context) {
          toLog[field] = context[field];
        } else {
          logger.debug(`No ${field} in context.`);
        }
      }

      if (Object.keys(toLog).length > 0) {
        logger.info(inspect(toLog, false, null, true));
      }

      // Continue middleware chain
      return next();
    },
  };
};
