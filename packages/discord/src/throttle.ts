export function throttle<TArgs extends unknown[], TReturnType>(
  func: (...args: TArgs) => Promise<TReturnType>,
  delay: number,
): (...args: TArgs) => Promise<TReturnType> {
  let lastCallTime = 0;
  let pendingPromise: Promise<TReturnType> | null = null;
  let queuedArgs: TArgs | null = null;

  const invokeFunction = (args: TArgs): Promise<TReturnType> => {
    lastCallTime = Date.now();
    // eslint-disable-next-line promise/prefer-await-to-then
    return func(...args).finally(() => {
      pendingPromise = null;
      if (queuedArgs) {
        pendingPromise = invokeFunction(queuedArgs);
        queuedArgs = null;
      }
    });
  };

  return function (...args: TArgs): Promise<TReturnType> {
    const now = Date.now();

    if (now - lastCallTime >= delay) {
      if (pendingPromise === null) {
        pendingPromise = invokeFunction(args);
      } else {
        queuedArgs = args;
      }
    } else if (pendingPromise === null) {
      const waitTime = delay - (now - lastCallTime);
      pendingPromise = new Promise((resolve) =>
        setTimeout(() => {
          pendingPromise = invokeFunction(queuedArgs || args);
          queuedArgs = null;
          resolve(pendingPromise);
        }, waitTime),
      );
    } else {
      queuedArgs = args;
    }

    return pendingPromise!;
  };
}
