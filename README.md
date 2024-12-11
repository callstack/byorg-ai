# byorg.ai - Chatbot Application Framework

[Our Docs](https://byorg.ai)

## Structure

### byorg.ai framework

Packages:

- `packages/core` - Frontend-agnostic chatbot logic (application, middlewares, effects)
- `packages/slack` - Slack frontend integration
- `packages/discord` - Discord frontend integration
- `packages/utils` - Utility functions (e.g. logger)
- `packages/document-loaders` - Document loaders: Google Docs, Notion, PDF, etc.)
- `packages/slack-rich-text` - Markdown renderer to/from Slack Blocks format

## byorg.ai key concepts (`core` package)

- `Application` (message processor) - pipeline for processing messages from the user. In starts with conversation history (e.g. for Slack), then in passes the message through a series of middleware and finally to AI provider (e.g. OpenAI) which produces the response.
- `Middleware` - a middleware is a function that processes the message before it is passed to the AI provider. It is used to add custom logic to the message processing pipeline.
- `Effect` - an effect is a function that is executed after the message is processed. It is used to add custom logic to the message processing pipeline (e.g. logging and analytics).
- `Tool` - a tool is a function that is used by AI provider to call an external API.
- `Plugin` - plugin is a simple interface that groups middlewares, tools and effects into a single entity that can be used to extend the chatbot functionality.
- `ChatModel` - interface representing LLM chat model or more advanced AI flow which adheres to the same simple interface. We use [ai-sdk](https://github.com/ai-sdk/ai-sdk) under the hood to allow for easy integration with many AI providers.
