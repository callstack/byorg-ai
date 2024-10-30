import {
  buildRegExp,
  capture,
  oneOrMore,
  startOfString,
  whitespace,
  zeroOrMore,
} from 'ts-regex-builder';
import { ApplicationPlugin, RequestContext, MessageResponse } from '../index.js';

export type Command = {
  trigger: string | RegExp;
  handler: (context: RequestContext) => Promise<string> | string;
  isAllowed?: (context: RequestContext) => boolean;
};

export type CommandsPluginConfig = {
  prefix: string;
  commands: Command[];
};

export function createCommandsPlugin({
  commands,
  prefix,
}: CommandsPluginConfig): ApplicationPlugin {
  return {
    name: 'commands',
    middleware: async (context, next): Promise<MessageResponse> => {
      const extractor = buildRegExp([
        startOfString,
        zeroOrMore(whitespace),
        prefix,
        capture(oneOrMore(/[\w-]/)),
      ]);
      const match = context.lastMessage.content.match(extractor);

      const trigger = match?.[1];
      if (!trigger) {
        // Continue middleware chain
        return await next();
      }

      for (let command of commands) {
        if (matchCommand(command.trigger, trigger)) {
          console.log('Matched command:', command.trigger);

          if (command.isAllowed?.(context) === false) {
            console.log('No access to command');

            return {
              role: 'system',
              content: buildUnknownCommandsResponse(trigger, commands),
            };
          }

          const response = await command.handler(context);
          return { role: 'system', content: response };
        }
      }

      return {
        role: 'system',
        content: buildUnknownCommandsResponse(trigger, commands),
      };
    },
  };
}

function buildUnknownCommandsResponse(trigger: string, commands: Command[]) {
  const commandsList = commands.map((command) => `- ${command.trigger}`).join('\n');
  return `Unknown command: ${trigger}.\nHere's a list of possible commands:\n${commandsList}`;
}

function matchCommand(matcher: string | RegExp, text: string) {
  return typeof matcher === 'string' ? text === matcher : matcher.test(text);
}
