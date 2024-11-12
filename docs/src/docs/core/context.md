# Context

Context is an object that is holding informations about the currently processed message. It allows you to change the behaviour of your assistant in the runtime, or to change the flow of processed message.

Context can be manipulated by plugins either by adding, or removing values from it.

In order to add typing for your own properties to the context, you need to create a file with type and override the typing.

```js
declare module '@callstack/byorg-core' {
  interface MessageRequestExtras {
    // Here you can add your own properties
    example?: string;
    messagesCount?: number;
    isAdmin?: boolea;
  }
}

export {};
```

:::danger

All custom properties must be an optional as current context creation doesn't support default values for custom objects.

:::

After setting extras, you can get to it from context object:

```js
export const systemPrompt = (context: RequestContext): Promise<string> | string => {
  if (context.extras.isAdmin) {
    return `You are currently talking to an admin.`;
  }

  return `You are talking to user with regular permissions.`;
};
```

Now we'll go through the concept of `plugins` to get an understanding of how to modify the `context`
