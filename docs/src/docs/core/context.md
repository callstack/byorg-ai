# Context

Context is an object that is holding informations about the currently processed message. It allows you to change the behaviour of your assistant in the runtime, or to change the flow of processed message.

Context can be changed by [middlewares](./plugins.md) during the message processing flow to implement highly-flexible logic or rules (e.g. authentication, RAG, etc)

Here are properties that you can find in the context:

```js
export type RequestContext = {
  /** All messages from given conversation */
  messages: Message[];

  /** Convenience reference to the last `messages` item which is the latest `UserMessage`. */
  lastMessage: UserMessage;

  /** Declarations of tools for ai assistant */
  tools: ApplicationTool[];

  /** Storage with references to documents mentioned in the conversation */
  references: ReferenceStorage;

  /** Ids of users who are a part of conversation */
  resolvedEntities: EntityInfo;

  /** Function for generating a system prompt */
  systemPrompt: () => Promise<string> | string;

  /** Function for handling chunks from ai streaming response */
  onPartialResponse?: (text: string) => void;

  /** Measures and marks for performance tracking */
  performance: PerformanceTimeline;

  /** Container for additional custom properties */
  extras: MessageRequestExtras;
};
```

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

:::warning

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
