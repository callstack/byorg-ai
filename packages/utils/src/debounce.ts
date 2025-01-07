export type PartialUpdateFn = (text: string) => Promise<void>;
export type DebouncePartialUpdateOptions = {
  minUpdateTime: number;
  minResponseLength: number;
};

export function debouncePartialUpdate(
  partialUpdate: PartialUpdateFn,
  { minResponseLength, minUpdateTime }: DebouncePartialUpdateOptions,
) {
  let pendingPromise: Promise<void> | undefined;
  let lastUpdate: number | undefined;

  return async function (text: string) {
    // Wait for the last update to finish
    if (pendingPromise) {
      return pendingPromise;
    }

    // Time-based debounce
    if (lastUpdate !== undefined && performance.now() - lastUpdate < minUpdateTime) {
      return;
    }

    // Skip too short initial messages
    if (text.length < minResponseLength) {
      return;
    }

    try {
      lastUpdate = performance.now();
      pendingPromise = partialUpdate(text);
      return await pendingPromise;
    } finally {
      pendingPromise = undefined;
    }
  };
}
