# Usage

In byorg we also implemented functions that integrate your app with Slack.
To use it you just need to use the `createSlackApp` function, and pass required variables.

## Endpoint mode

```js
const app = createApp({
  chatModel,
  systemPrompt,
});

const slack = createSlackApp({
  app,
  token: 'slack_bot_token',
  appToken: 'slack_app_token',
  signingSecret: 'slack_signing_secret',
});
```

Once you have an instance of an app wrapped in slack handler, you need to pass it the event
received from slack endpoint.

```js
slack.processEvent(event);
```

## Websocket mode

You can also run the slack app in websocket mode. To do that you need to additionally pass
a `websocket` boolean variable as true, and run slack app with `start` function.

```js
const slack = createSlackApp({
  app,
  websocket: true,
  token: 'slack_bot_token',
  appToken: 'slack_app_token',
  signingSecret: 'slack_signing_secret',
});

slack.start();
```

## Types

In order to handle types correctly, you also need to extend the context of byorg.

```js
declare module '@callstack/byorg-core' {
  interface MessageRequestExtras {
    // Set by "byorg-slack" plugin
    threadTs?: string;
    messageTs?: string;
    conversationMode?: ConversationMode;
  }
}

export {};
```

:::info
Our slack app distinguishes two conversation modes: `public_channel` and `direct`
:::
