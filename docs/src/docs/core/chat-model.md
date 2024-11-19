# Chat Model

## Providers and Adapter

You can use any AI provider supported by Vercel's [AI SDK](https://sdk.vercel.ai/providers/ai-sdk-providers). This includes both LLM-as-a-service providers like OpenAI, Anthropic, Mistral, etc, as well as locally hosted LLMs. We are open to extending support also to other types of chat models, e.g. LangChain's [runnables](https://js.langchain.com/docs/how_to/streaming).

### Providers Examples

```js
import { createOpenAI } from '@ai-sdk/openai';

const openAiProvider = createOpenAI({
  apiKey: 'your-api-key',
  compatibility: 'strict',
});
```

After instantiating provider client, you need to wrap it into our VercelAdapter class:

```js
import { VercelChatModelAdapter } from '@callstack/byorg-core';

const openAiChatModel = new VercelChatModelAdapter({
  languageModel: openAiModel,
});
```

Now that `chatModel` is ready, let's discuss `systemPrompt` function.
