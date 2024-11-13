# References

This is a part of the context. References are objects contained in a list.
At any point of the flow you can use that information to either
inform the users, log most used sources, or anything else.

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
