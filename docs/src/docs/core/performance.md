# Performance

If you'd like to test your application performance, you can use `performance` object from the context.

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

After gathering your measures, you can access them through the same object.
Because performance tracking needs all processes to finish, it uses `effect` instead of `middleware`, since it runs after response is done.

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

:::info

You can also access all measures and marks with `getMarks` and `getMeasures`

:::

## Default measures

byorg is gathering performance data out of the box.

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

Middleware measures are gathered in two separate sections: before handling the response, and after that.
