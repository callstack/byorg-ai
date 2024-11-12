# System Prompt

`createApp` function requires a `systemPrompt` fuction to work properly.

## Why a function?

Byorg requires a function for generating a system prompt, because each message can require a different system prompt.
Thanks to this, you can implement your own logic for changing system prompt in run time.

## Example

Here is an example that will change our Assistant name.

```js
export const systemPrompt = (context: RequestContext): Promise<string> | string => {
  let name = 'Jim';

  if (context.lastMessage.content === 'Hi Betty!') {
    name = 'Betty';
  }

  return `Your name is ${name} and you are a friendly AI assistant.`;
};
```

Now that you know how to generate a system prompt dynamically depending on context, let's discuss the `context` itself.
