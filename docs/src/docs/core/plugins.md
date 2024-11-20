# Plugins

Plugins are your way to modify the context before it reaches the inference and AI response phase. Each plugin consists of a name, optional middleware and optional effects.

## Middleware and Effects

Those two concepts are similar, but have one important difference.

- Middlewares are run before response to user
- Your middleware can be run before, or after call to `next` to perform actions after or before getting response from AI.
- Effects are run after giving response to user

As an example, because of that, you can use Effects for gathering analytics about usage, or log to DB without addind any waiting time for the user.
Be aware that until all Middlewares finish processing, sending response to user is blocked.

## Middleware Example

Let's create a middleware, that will enrich the context for our system prompt function.

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

Also, let's create an effect that will be run after we get a response from AI and process it. If the user is an admin, or the response ended with an error we'll do nothing, otherwise we will increase the messages count for a user.

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

Now that we wrote our plugins, let's connect them to the app:

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

Order of plugins is important! Depending on call to `next` they are called:

- top-down before call to `next`
- down-top after call to `next`

## Midleware early return

Your middleware can also cause you application to break the execution chain sooner.
This stops execution of middleware scheduled after.

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

When you trigger `processMessages` on byorg app, one of returned values are `pendingEffects`.
Thanks to that you can wait for them to finish execution. It is used to avoid cases in which
application is shutting down prematurely (e.g. serverless functions)
