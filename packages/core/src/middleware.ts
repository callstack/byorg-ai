import { logger } from '@callstack/byorg-utils';
import { RequestContext, MessageResponse } from './domain.js';

export type NextFunction = () => Promise<MessageResponse>;

export type Middleware = (context: RequestContext, next: NextFunction) => Promise<MessageResponse>;

export class MiddlewareHandler {
  private readonly middlewares: Middleware[] = [];

  use(middlewares: Middleware[]) {
    this.middlewares.push(...middlewares);
  }

  run(context: RequestContext, handler: () => Promise<MessageResponse>): Promise<MessageResponse> {
    logger.debug('Middleware chain started');

    // Call middlewares in order, and call handler at the end
    const runFn = (i: number) => {
      // No more middlewares to run, call the handler
      if (i >= this.middlewares.length) {
        logger.debug('Middleware chain finished');
        return handler();
      }

      const nextRun = () => runFn(i + 1);
      return this.middlewares[i](context, nextRun);
    };

    return runFn(0);
  }
}
