import { logger } from '@callstack/byorg-utils';
import { Profile } from '@slack/web-api/dist/response/UsersProfileGetResponse.js';
import { getWebClient } from '../slack-api.js';

export type SlackUserInfo = {
  realName: string | undefined;
  displayName: string | undefined;
  email: string | undefined;
  title: string | undefined;
};

const cache = new Map<string, SlackUserInfo | null>();

export async function resolveUser(userId: string): Promise<SlackUserInfo | null> {
  const cachedUser = cache.get(userId) ?? null;
  if (cachedUser) {
    logger.debug(`Resolved cached user: "${userId}"`, cachedUser);
    return cachedUser;
  }

  try {
    const client = getWebClient();
    const response = await client.users.profile.get({ user: userId });
    if (!response.profile) {
      logger.warn(`Unable to resolve user: "${userId}"`, response.error);
      return null;
    }

    const user = mapProfile(response.profile);
    cache.set(userId, user);
    logger.debug(`Resolved user: "${userId}"`, user);
    return user;
  } catch (error) {
    logger.warn(`Unable to resolve user: "${userId}"`, error);
    return null;
  }
}

function mapProfile(profile: Profile): SlackUserInfo {
  return {
    realName: profile.real_name ?? profile.real_name_normalized,
    displayName: profile.display_name ?? profile.display_name_normalized,
    email: profile.email,
    title: profile.title,
  };
}
