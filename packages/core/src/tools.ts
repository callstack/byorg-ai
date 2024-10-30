import { z } from 'zod';
import { RequestContext } from './domain.js';

export type ApplicationTool<TSchema extends z.ZodSchema = z.ZodTypeAny, TOutput = unknown> = {
  name: string;
  description: string;
  parameters: TSchema;
  handler: (params: z.infer<TSchema>, context: RequestContext) => Promise<TOutput>;
};
