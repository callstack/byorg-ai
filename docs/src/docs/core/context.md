# Context

The `context` object holds information about the currently processed message. It allows you to modify the behavior of your assistant at runtime or alter the message processing flow.

`Context` can be modified by [middlewares](./plugins.md) during the message processing flow to implement highly flexible logic or rules (e.g., authentication, RAG, etc.).

### Properties in Context

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

To add typing for your custom properties to the context, create a file with the type definition and override the typing.

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
All custom properties must be optional, as the current context creation does not support default values for custom objects.
:::

After setting extras, you can access them from the context object:

```js
export const systemPrompt = (context: RequestContext): Promise<string> | string => {
  if (context.extras.isAdmin) {
    return `You are currently talking to an admin.`;
  }

  return `You are talking to user with regular permissions.`;
};
```

Next, we’ll explore the concept of `plugins` to understand how to modify the `context`.
