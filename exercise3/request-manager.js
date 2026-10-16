export function createRequestManager() {
  let currentRequestId = 0;
  let currentController = null;

  return {
    start() {
      currentController?.abort();

      currentRequestId += 1;
      currentController = new AbortController();

      return {
        id: currentRequestId,
        signal: currentController.signal
      };
    },

    isCurrent(id) {
      return id === currentRequestId &&
        currentController !== null &&
        !currentController.signal.aborted;
    },

    cancel() {
      currentController?.abort();
      currentController = null;
      currentRequestId += 1;
    }
  };
}