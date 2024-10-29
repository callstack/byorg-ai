import {
  BlockObjectResponse,
  DatabaseObjectResponse,
  PageObjectResponse,
  PartialBlockObjectResponse,
  PartialDatabaseObjectResponse,
  PartialPageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints.js';

export type NotionRecord =
  | PageObjectResponse
  | PartialPageObjectResponse
  | DatabaseObjectResponse
  | PartialDatabaseObjectResponse;

export type NotionRecordProps = PageObjectResponse['properties'];

export type NotionBlock = BlockObjectResponse | PartialBlockObjectResponse;
