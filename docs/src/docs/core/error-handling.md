# Error handling

The error handler in byorg.ai is responsible for processing error objects and returning messages that are sent back to the user. You can customize the error handling by providing your own error handler function. This allows you to define specific reactions to errors and deliver appropriate feedback to users.

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

By implementing a custom error handler, you can tailor the user experience by providing meaningful responses to errors encountered within the byorg framework.
