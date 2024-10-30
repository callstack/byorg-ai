export function withCache<TArgs extends unknown[], TReturn extends Promise<unknown>>(
  func: (...args: TArgs) => TReturn,
): (...args: TArgs) => TReturn {
  let cachedValue: TReturn | null = null;

  return function (...args: TArgs): TReturn {
    if (cachedValue) {
      return cachedValue;
    }

    // Usually async/await syntax is better, but in this case
    // it's easier to use .catch instead
    // eslint-disable-next-line promise/prefer-await-to-then
    cachedValue = func(...args).catch((error) => {
      cachedValue = null;
      throw error;
    }) as TReturn;

    return cachedValue;
  };
}
