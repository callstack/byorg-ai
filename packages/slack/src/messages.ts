import {
  FileElement,
  MessageElement,
} from '@slack/web-api/dist/response/ConversationsRepliesResponse.js';
import { WebClient } from '@slack/web-api';
import { RichTextBlock } from '@slack/bolt';
import { FileBuffer, Message } from '@callstack/byorg-core';
import { parseRichTextBlockToMarkdown } from '@callstack/slack-rich-text';
import { fetchFile } from './slack-api.js';

export async function toCoreMessage(
  message: MessageElement,
  botId: string,
  client: WebClient,
): Promise<Message> {
  const isAssistant = message.bot_id === botId;

  return {
    role: isAssistant ? 'assistant' : 'user',
    content: parseContent(message),
    senderId: message.user,
    attachments: await fetchAttachments(message.files, client),
  };
}

function parseContent(message: MessageElement): string {
  if (message.blocks?.[0]?.type === 'rich_text') {
    return parseRichTextBlockToMarkdown(message.blocks[0] as RichTextBlock);
  }

  return message.text ?? '';
}

function fetchAttachments(
  files: FileElement[] | undefined,
  client: WebClient,
): Promise<FileBuffer[]> | undefined {
  const urls = files
    ?.map((file) => file.url_private)
    .filter((file): file is string => file != null);

  if (!urls) {
    return undefined;
  }

  return Promise.all(urls.map((file) => fetchFile(client, file)));
}

export function formatGroupMessage(message: Message): string {
  //  Do not add sender id for assistant messages, as LLMs tend repeat the format of their previous messages.
  if (!message.senderId || message.role === 'assistant') {
    return message.content;
  }

  return `[${message.senderId}] ${message.content}`;
}
