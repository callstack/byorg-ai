# Tools

You can extend the capabilities of your assistant by providing it with tools.
Tools are functions attached to the AI request. Once the request is received, the AI can decide to use these tools to enrich the context,
fetch more data, or save information.

:::info
OpenAI has implemented tools, but not all AI providers do.
:::

## Adding tools

To start, implement the tool function. It takes two inputs: `params`, which are determined by the AI, and `context`, which is passed by byorg.
The tool function must return a string, as this information will be passed back to the AI as an addition to the system prompt.

```js
async function queryUsers(params: { query: string }, context: RequestContext): Promise<string> {
  const { query } = params;
  const { references } = context;

  const users = await getMatchingusers(query);

  return formatUsersResponse(users);
}
```

Next, describe this function for the AI to help it understand when and how to use it.

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

Once the function is implemented and described, wrap it into the plugin system and connect it to the app.

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

Tools are an excellent place to implement embedding for inserts or other RAG (Retrieval-Augmented Generation) functionalities.

Your tools might attach data from a specific source. If you want to inform users about the data source, you can use `references` from the context object.
We’ll discuss that next.
