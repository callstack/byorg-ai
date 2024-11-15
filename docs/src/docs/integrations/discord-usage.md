# Usage

In byorg we also implemented functions that integrate your app with Discord.
To use it you just need to use the `createDiscordApp` function, and pass it byorg app instance.

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

:::danger
Discord implementation is still in progress, treat it as experimental.
:::
