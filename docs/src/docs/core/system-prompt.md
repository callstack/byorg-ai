# System Prompt

The `createApp` function requires a `systemPrompt` function to operate correctly.
The system prompt is a string that provides an "initial" description of the situation for the AI.
It should include details such as the assistant's personality, name, purpose, and available tools.
The system prompt can also incorporate dynamic values like the current date or time.
Think of the system prompt as your assistant's "personality" and guidelines

## Why a function?

Byorg requires a function to generate the system prompt because each message might need a different prompt.
This allows you to implement custom logic to modify the system prompt at runtime.

## Example

Here is an example that adds the current date and the user's name to the conversation:

```js
export const systemPrompt = (context: RequestContext): Promise<string> | string => {
  let date = new Date().toDateString();
  let userName = context.extras.userName;

  return `You are a helpful AI bot. Your name is Byorg. You work for ACME.
  Current date: ${date}
  You are talking with: ${userName}`;
};
```

As you can see, the `systemPrompt` function takes a `context` parameter.
The context is an object containing information about the current conversation. We’ll explore this topic further in the next section.
