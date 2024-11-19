# Error handling

Error handler receives the error object, and returns message that should be sent back to the user.
In order to react for errors being thrown by the byorg, you can pass you own error handler.

```js
function handleError(error: unknown): SystemResponse {
  logger.error('Unhandled error:', error);

  return {
    role: 'system',
    content: 'There was a problem with Assistant. Please try again later or contact administrator.',
    error,
  };
}

const app = createApp({
  chatModel,
  systemPrompt,
  errorHandler: handleError,
});
```

Error handler allows you to implement custom reaction to thrown error and send feedback to user.
