## Integrating with Slack

Byorg provides built-in functionality to integrate your application with Slack. To set this up, use the `createSlackApp` function and provide the necessary parameters.

## Http endpoint mode

In this mode you use SlackApp to receive Slack event objects directly.
Here's a [tutorial](https://cloud.google.com/functions/docs/tutorials/slack) on setting up a Google Cloud Function with event receiver.

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

We provide automatic parsing from slack event to our internal event. We also provide custom formatter to
[slack blocks](https://api.slack.com/block-kit) that uses `slack-rich-text` package.

## Websocket mode

Alternatively, you can use [Slack SDK](https://tools.slack.dev/bolt-js/concepts/socket-mode) ability to connect to Slack API using WebSockets. This can be helpful in cases when you want to setup your server in a setting without public IP connection and/or for development purposes.

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

When using byorg-slack package, the context.extras field will contain various Slack-related fields.

```js
declare module '@callstack/byorg-core' {
  interface MessageRequestExtras {
    // Set by "byorg-slack" plugin
    threadTs?: string; // Thread timestamp (used as id)
    messageTs?: string; // Message timestamp (used as id)
    conversationMode?: ConversationMode; // Whether message was a `public_channel` or `direct`
  }
}

export {};
```
