const SAMPLE_ITEMS = [
  {
    id: 1,
    title: 'Review Pull Request',
    description: 'Check the latest changes before merging.'
  },
  {
    id: 2,
    title: 'Verify State Machine',
    description: 'Test all valid and invalid state transitions.'
  },
  {
    id: 3,
    title: 'Audit Event Delegation',
    description: 'Verify that event listeners remain on the root.'
  }
];

export function fetchFeed({
  delay = 1200,
  shouldFail = false,
  signal
} = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Request aborted', 'AbortError'));
      return;
    }

    let timer;

    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Request aborted', 'AbortError'));
    };

    signal?.addEventListener('abort', onAbort, { once: true });

    timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);

      if (shouldFail) {
        reject(new Error('Unable to connect to the data service.'));
        return;
      }

      resolve(SAMPLE_ITEMS.map((item) => ({ ...item })));
    }, delay);
  });
}