# Chat Model

## Providers and Adapter

In order to make development of our framework faster, we decided to use [Vercel AI SDK](https://sdk.vercel.ai/docs/introduction) as an interface for handling LLM models.

[Here](https://sdk.vercel.ai/providers/ai-sdk-providers) are all providers integrated with Vercel.

### Providers Examples

```js
import { createOpenAI } from '@ai-sdk/openai';
import { createAzure } from '@ai-sdk/azure';
import { createMistral } from '@ai-sdk/mistral';

const azureProvider = createAzure({
  resourceName: 'your-resource-name',
  apiKey: 'your-api-key',
});

const openAiProvider = createOpenAI({
  apiKey: 'your-api-key',
  compatibility: 'strict',
});

const mistralProvider = createMistral({
  // custom settings
});
```

After instantiating provider client, you need to wrap it into our VercelAdapter class:

```js
import { VercelChatModelAdapter } from '@callstack/byorg-core';

const openAiChatModel = new VercelChatModelAdapter({
  languageModel: openAiModel,
});

const vercelChatModel = new VercelChatModelAdapter({
  languageModel: azureProvider,
});

const mistralChatModel = new VercelChatModelAdapter({
  languageModel: mistralProvider,
});
```

Now that `chatModel` is ready, let's discuss `systemPrompt` function.
