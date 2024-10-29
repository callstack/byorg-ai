import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import type { AuthClient } from 'google-auth-library';
import { logger } from '@callstack/byorg-utils';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'google-token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'google-credentials.json');

async function loadClientFromCredentialsIfExist(): Promise<AuthClient | null> {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content.toString());
    logger.debug('Google: authorized with token');

    return google.auth.fromJSON(credentials);
  } catch (err) {
    throw new Error(`GoogleAuth Authorization error: ${err}`);
  }
}

async function saveCredentials(client: AuthClient) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content.toString());
  const key = keys.installed || keys.web;

  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });

  await fs.writeFile(TOKEN_PATH, payload);
}

let authClient: AuthClient | null = null;

export async function getGoogleAuthClient(): Promise<AuthClient> {
  if (authClient) {
    return authClient;
  }

  authClient = await authorize();
  return authClient;
}

async function authorize(): Promise<AuthClient> {
  let client = await loadClientFromCredentialsIfExist();
  if (client) {
    return client;
  }

  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client?.credentials) {
    await saveCredentials(client);
  }

  return client;
}
