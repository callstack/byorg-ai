import { ChannelType, Client, Events, GatewayIntentBits, Message, Partials } from 'discord.js';
import { Application, Message as CoreMessage } from '@callstack/byorg-core';
import { throttle } from './throttle.js';

const UPDATE_THROTTLE_TIME = 200;

export type DiscordApplicationConfig = {
  app: Application;
  botToken: string;
};

type ClientStart = {
  start: () => Promise<string>;
};

export type DiscordClient = Client & ClientStart;

export function createDiscordApp(options: DiscordApplicationConfig): DiscordClient {
  const { app, botToken } = options;

  const client = new Client({
    intents: [
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
    ],
    partials: [Partials.Channel],
  }) as DiscordClient;

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  });

  client.on(Events.MessageCreate, async (discordMessage) => {
    // Ignore messages from bots
    if (discordMessage.author.bot) {
      return;
    }

    // Ignore non-direct messages
    if (discordMessage.channel.type !== ChannelType.DM) {
      return;
    }

    const thread = await discordMessage.channel.messages.fetch({
      limit: 16,
      before: discordMessage.id,
    });
    const threadWithCurrentMessage = [...thread.toJSON(), discordMessage];
    const messages = threadWithCurrentMessage.map(toCoreMessage);

    await discordMessage.channel.sendTyping();

    let replyMessage: Message | null = null;

    const updateResponseMessage = async (content: string) => {
      if (!replyMessage) {
        replyMessage = await discordMessage.reply(content);
        return;
      }

      await replyMessage.edit(content);
    };

    let updatePartialResponsePromise: Promise<void> = Promise.resolve();
    const handlePartialResponse = throttle(updateResponseMessage, UPDATE_THROTTLE_TIME);

    const onPartialResponse = (response: string) => {
      updatePartialResponsePromise = handlePartialResponse(response);
    };

    const { response, pendingEffects } = await app.processMessages(messages, {
      onPartialResponse,
    });

    // Wait for the last update to finish
    await updatePartialResponsePromise;
    await updateResponseMessage(response.content);

    // Wait for effects to finish
    await pendingEffects;
  });

  client.start = () => {
    return client.login(botToken);
  };

  return client;
}

function toCoreMessage(message: Message): CoreMessage {
  return {
    role: message.author.bot ? 'assistant' : 'user',
    content: message.content,
    senderId: message.author.id,
  };
}
