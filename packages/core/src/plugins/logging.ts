import { ApplicationPlugin, MessageResponse } from '../index.js';

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
