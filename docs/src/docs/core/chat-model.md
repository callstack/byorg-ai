# Chat Model

## Providers and Adapter

You can use any AI provider supported by Vercel’s [AI SDK](https://sdk.vercel.ai/providers/ai-sdk-providers). This includes both LLM-as-a-service providers like OpenAI, Anthropic, and others, as well as locally hosted LLMs. We are also open to extending support to other types of chat models, such as LangChain’s [runnables](https://js.langchain.com/docs/how_to/streaming).

### Providers Examples

```js
import { createOpenAI } from '@ai-sdk/openai';

const openAiProvider = createOpenAI({
  apiKey: 'your-api-key',
  compatibility: 'strict',
});
```

After instantiating the provider client, wrap it with our `VercelAdapter` class:

```js
import { VercelChatModelAdapter } from '@callstack/byorg-core';

const openAiChatModel = new VercelChatModelAdapter({
  languageModel: openAiModel,
});
```

Now that the `chatModel` is ready, let’s discuss the `systemPrompt` function.
