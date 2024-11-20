# System Prompt

`createApp` function requires a `systemPrompt` fuction to work properly.
System prompt is a string with "initial" description of situation for AI.
It should contain information like Assistant personality, name, purpose and available tools.
System prompt can also contain dynamic values like current date or hour.
You can think about system prompt as your Assistant 'personality' and guidelines.

## Why a function?

Byorg requires a function for generating a system prompt, because each message can require a different system prompt.
Thanks to this, you can implement your own logic for changing system prompt in run time.

## Example

Here is an example that will add current date and user's name to conversation.

```js
export const systemPrompt = (context: RequestContext): Promise<string> | string => {
  let date = new Date().toDateString();
  let userName = context.extras.userName;

  return `You are a helpful AI bot. Your name is Cassandra. You work for Callstack.
  Current date: ${date}
  You are talking with: ${userName}`;
};
```

As you see, `systemPrompt` function takes a `context` as parameter. Context is an object containing
a informations about current conversation. We'll dive deeper into that topic in next section.
