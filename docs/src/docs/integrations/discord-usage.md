# Integrating with Discord

Byorg provides built-in functionality to integrate your application with Discord. To set this up, use the `createDiscordApp` function and provide the necessary parameters.

## Endpoint mode

```js
const app = createApp({
  chatModel,
  systemPrompt,
});

const discord = createDiscordApp({
  app,
});
```

:::warn
Discord implementation is still in progress, treat it as experimental.
:::
