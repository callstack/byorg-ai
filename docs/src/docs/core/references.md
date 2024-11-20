# References

References are a way of informing bout source of information retrieved by a tool call.
When tool call is triggered, you can add references to context, and later use those entries
in a plugin to provide user with referenced pages etc.
References are a part of the context.

:::info

References are not being added for AI in any way. Unless you implement it that way.

:::

As an example, we will prepare middleware that will add relevant weather information.

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

That way, AI will receive information about requested city, and
context will get an information about the source of information.

references object has two functions `getReferences` and `addReference`
If you'd like to present user with informations about references, you need to add
them manually to the response.

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
