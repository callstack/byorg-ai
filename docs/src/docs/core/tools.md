# Tools

You can extend capabilities of your assistant, by providing it with tools.
Tools are functions, that are attached to the request to AI. After that request
is received, AI can decide to use those tools to either enrich the context, fetch more data
or save some information.

:::info
OpenAI has implemented tools, but not all AI providers do.
:::

## Adding tools

First lets start by implementing the tool function. There are two inputs for it `params` that are decided
by the AI and context that is passed by byorg. Tool function has to return a string, as the information
returned by it will be then passed back to AI as an 'addition' to system prompt.

```js

async function queryUsers(params: { query: string }, context: RequestContext): Promise<string> {
  const { query } = params;
  const { references } = context;

  const users = await getMatchingusers(query);

  return formatUsersResponse(users);
}
```

This function needs to be later described for the AI, so it will have a better
understanding of when to use it and for what purpose.

```js
import z from 'zod';

const queryUsersTool: ApplicationTool = {
  name: 'query_users',
  parameters: z.object({
    query: z
      .string()
      .describe(
        'Query to users list, can include user name, id, email or role in company etc.',
      ),
  }),
  description:
    'Search information about users, by name, id, email or role etc.',
  handler: queryUsers,
};
```

Once you have the function implemented and described for AI, you need to wrap it into
our plugin system and connect it to the app.

```js
const toolsPlugin: ApplicationPlugin = {
  name: 'tools',
  tools: [queryUsersTool],
};

const app = createApp({
  chatModel,
  plugins: [
    toolsPlugin,
  ]
  systemPrompt,
});
```

Tools are a great place to implement embedding for inserts or other RAG functionalities.

Your tools might attach data from a specific source. In case you'd like to inform
your users about the source of data, you can use `references` from context object.
We'll discuss that next.
