const MIN_UPDATE_TIME = 2000;
const MIN_RESPONSE_LENGTH = 200;

export type UpdateResponseFn = (text: string, isFinalResponse?: boolean) => Promise<void>;

export function debounceUpdateResponse(updateResponse: UpdateResponseFn) {
  let pendingPromise: Promise<void> | undefined;
  let lastUpdate: number = performance.now();

  return async function (text: string, isFinalResponse?: boolean) {
    // Wait for the last update to finish
    if (pendingPromise) {
      return pendingPromise;
    }

    // Final message should be always sent
    if (!isFinalResponse) {
      // Debouncing
      if (performance.now() - lastUpdate < MIN_UPDATE_TIME) {
        return Promise.resolve();
      }

      // Drop too short initial messages
      if (text.length < MIN_RESPONSE_LENGTH) {
        return Promise.resolve();
      }
    }

    try {
      lastUpdate = performance.now();
      pendingPromise = updateResponse(text, isFinalResponse);
			return await pendingPromise;
		} finally {
			pendingPromise = undefined;
		}
  }
}
z