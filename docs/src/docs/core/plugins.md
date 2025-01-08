# Plugins

Plugins allow you to modify the context before it reaches the inference and AI response phase. Each plugin consists of a name, optional middleware, and optional effects.

## Middleware and Effects

While middleware and effects share some similarities, they serve different purposes within the framework:

### Middleware
- A middleware function receives the request context and an asynchronous `next()` function, which triggers the next middleware in the chain.
- Middleware can execute code before and after receiving the final response from the chat model:
  - Code before the `await next()` call runs prior to receiving the chat model's response.
  - Code after the `await next()` call runs after the chat model's response is received.
- Middleware execution blocks the final response from being sent to the user. To avoid delaying the user response, use effects instead.
- Partial responses (enabled via the onPartialResponse option) are streamed immediately as they are received from the chat model. These occur before the middleware code that runs after the await next() call.

### Effects
- An effect function received the request context and the final response sent to the user.
- Effects are executed after the message processing pipeline has completed.
- Use effects for tasks like logging, analytics, or other post-processing operations that do not block the user response.

Note that the response to the user is blocked until all middlewares finish processing.

## Middleware Example

Let's create a middleware that enriches the context for our system prompt function.

```js
import { ApplicationPlugin, MessageResponse } from '@callstack/byorg-core';

const isAdminPlugin: Promise<MessageResponse> = {
  name: 'is-admin',
  middleware: async (context, next): Promise<MessageResponse> => {
    const isAdmin = await checkIfUserIsAdmin(context.lastMessage.senderId)

    context.extras.isAdmin = isAdmin;

    // Continue middleware chain
    return next();
  },
};
```

## Effect example

Now, let's create an effect that runs after receiving a response from the AI. If the user is an admin or the response ends with an error, it does nothing. Otherwise, it increases the message count for the user.

```js
import { MessageResponse } from '@callstack/byorg-core';

const usageCountPlugin: Promise<MessageResponse> = {
  name: 'usage-count',
  effects: [counterEffect]
};

async function counterEffect(context: RequestContext, response: MessageResponse): Promise<void> {
  const { isAdmin } = context.extras;

  if(response.error || isAdmin) {
    return;
  }

  await increaseMsgsCount(context.lastMessage.userId)
}
```

## Connecting Plugins

Once you've written your plugins, connect them to the app:

```js
  const app = createApp({
    chatModel,
    plugins: [
      usageCountPlugin,
      isAdminPlugin
    ]
    systemPrompt,
  });
```

The order of plugins is important! Depending on the call to `next`, they are executed:

- Top-down before the call to `next`
- Bottom-up after the call to `next`

## Middleware early return

Your middleware can also break the execution chain early, stopping the execution of any subsequent middleware.

```js
import { ApplicationPlugin, MessageResponse } from '@callstack/byorg-core';

const flowBreakingPlugin: Promise<MessageResponse> = {
  name: 'breaks-flow',
  middleware: async (context, next): Promise<MessageResponse> => {
    // Breaks the middleware chain
    return {
      role: 'system';
      content: "AI Assistant is unvailable now!";
    };
  },
};
```

## Pending effects

When you trigger `processMessages` on a byorg app, one of the returned values is `pendingEffects`.
This allows you to wait for them to finish execution, which is useful to prevent the application from shutting down prematurely (e.g., in serverless functions).
