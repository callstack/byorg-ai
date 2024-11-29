# Performance

To test your application's performance, you can use the performance object available in the context.

```js
const slowPlugin: Promise<MessageResponse> = {
  name: 'slow-plugin',
  middleware: async (context, next): Promise<MessageResponse> => {

    context.performance.markStart("SlowPluginPerformance");
    await slowFunction();
    context.performance.markEnd("SlowPluginPerformance");

    // Continue middleware chain
    return next();
  },
};
```

After collecting your performance data, you can access it through the same performance object. Performance tracking requires all processes to complete, so it uses effect instead of middleware, as it runs after the response is finalized.

```js
const analyticsPlugin: Promise<MessageResponse> = {
  name: 'analytics',
  effects: [analyticsEffect]
};

async function analyticsEffect(context: RequestContext, response: MessageResponse): Promise<void> {
  console.log(context.performance.getMeasureTotal("SlowPluginPerformance"))
}
```

## Measures vs Marks

This concept comes from [Web Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance).
Marks are just named 'sequences' for the performance tool to measure.
Let's say that you have a tool for your AI, and you'd like to check how it performs.
Issue might be that it's being triggered multiple times by AI. For that reason
one mark can be a part of multiple measures.
Single measure is constructed of two marks: `start` and `end`.

This concept is inspired by the [Web Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance). Marks are essentially named sequences that the performance tool uses to measure execution time. For instance, if you have a tool for your AI and want to evaluate its performance, you might find it triggered multiple times by the AI. Therefore, a single mark can be part of multiple measures. A measure is constructed using two marks: `start` and `end`.

:::info
You can also access all marks and measures using `getMarks` and `getMeasures`
:::

## Default measures

Byorg automatically gathers performance data. Middleware measures are collected in two separate phases: before handling the response and after it.

```js
export const PerformanceMarks = {
  processMessages: 'processMessages',
  middlewareBeforeHandler: 'middleware:beforeHandler',
  middlewareAfterHandler: 'middleware:afterHandler',
  chatModel: 'chatModel',
  toolExecution: 'toolExecution',
  errorHandler: 'errorHandler',
} as const;
```
