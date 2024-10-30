import * as Path from 'node:path';
import { FileBuffer } from '@callstack/byorg-core';
import { requireEnv } from '@callstack/byorg-utils';
import { AuthTestResponse, WebClient, type FilesInfoResponse } from '@slack/web-api';
import { MessageElement } from '@slack/web-api/dist/response/ConversationsRepliesResponse.js';

export type File = NonNullable<FilesInfoResponse['file']>;

let client: WebClient | null = null;

export function getWebClient(): WebClient {
  if (client) {
    return client;
  }

  client = new WebClient(requireEnv('SLACK_BOT_TOKEN'));
  return client;
}

export async function fetchFileInfo(client: WebClient, fileId: string): Promise<File> {
  const response = await client.files.info({
    file: fileId,
  });

  if (!response.file) {
    throw new Error('File not found.');
  }

  return response.file as File;
}

export async function fetchFile(client: WebClient, url: string): Promise<FileBuffer> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${client.token}`,
    },
  });
  const contentType = response.headers.get('Content-Type');
  const name = Path.basename(url);

  if (!response.ok) {
    throw new Error(`Couldn't download the requested file, response: ${response.statusText}.`);
  }

  if (!contentType) {
    throw new Error('Missing Content-Type header.');
  }

  return {
    name: name,
    mimeType: contentType,
    buffer: await response.arrayBuffer(),
  };
}

export async function getThread(
  channel: string,
  threadTs: string,
  client: WebClient,
): Promise<MessageElement[]> {
  const response = await client.conversations.replies({
    channel,
    ts: threadTs,
  });

  if (!response.ok) {
    throw new Error('Failed fetch in getThread');
  }

  return response.messages!;
}

export async function getIdentity(client: WebClient): Promise<AuthTestResponse> {
  const response = await client.auth.test();

  if (!response.ok) {
    throw new Error('Failed fetch in getIdentity');
  }

  return response;
}
