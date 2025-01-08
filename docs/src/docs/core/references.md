# References

References provide information about the source of data retrieved by a tool call.
When a tool call is triggered, you can add references to the context and later use these entries in a plugin to provide users with referenced pages or other relevant information. References are part of the context.

:::info
References are not automatically added for the AI. You need to implement this functionality if needed.
:::

Let's create a tool that adds relevant weather information to the context.

```js
async function queryWeather(
  params: { query: string },
  context: RequestContext,
): Promise<string> {
  const { query } = params;
  const { references } = context;

  const userWeatherInfo = await getWeather(query);

  references.addReference({
    title: userWeatherInfo.title,
    url: userWeatherInfo.url
  });

  return formatWeatherInfo(userWeatherInfo);
}

const queryWeatherTool: ApplicationTool = {
  name: 'query_weather',
  description:
    'Search weather data for requested city.',
  parameters: z.object({
    query: z.string().describe('City'),
  }),
  handler: queryWeather,
};

const cityWeatherPlugin: ApplicationPlugin = {
  name: 'weather-tool',
  tools: [queryWeatherTool],
};
```

In this example, the AI receives information about the requested city, and the context includes information about the source of this data.

## Using References

The `references` object provides two functions: `getReferences` and `addReference`.
If you want to present users with information about references, you need to manually add them to the response.

```js
export const referencesPlugin: ApplicationPlugin = {
  name: 'references',
  middleware: async (context, next): Promise<MessageResponse> => {
    // Continue middleware chain
    const response = await next();

    const references = context.references.getReferences();

    return {
      ...response,
      content: `${response.content}${formatReferencesAnnotation(references)}`,
    };
  },
};
```

By using these functions, you can ensure that users are informed about the sources of the information they receive.
