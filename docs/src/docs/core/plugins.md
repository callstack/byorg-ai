# Plugins

Plugins are your way to modify the context before it reaches the inference and AI response phase. Each plugin consists of a name, optional middleware and optional effects.

## Middleware and Effects

Those two concepts are similar, but have one important difference.

- Middlewares are run before response to user
- Effects are run after

As an example, because of that, you can use Effects for gathering analytics about usage, or log to DB without addind any waiting time for the user.

## Middleware Example:

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

## Effect example:

Also, let's create an effect that will be run after we get a response from AI and process it. If the user is an admin, or the response ended with an error we'll do nothing, otherwise we will increase the messages count for a user.

```js
import { ApplicationPlugin, MessageResponse } from '@callstack/byorg-core';

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
  import { VercelChatModelAdapter } from '@callstack/byorg-core';

  const app = createApp({
    chatModel,
    plugins: [
      usageCountPlugin,
      isAdminPlugin
    ]
    systemPrompt,
  });
```
