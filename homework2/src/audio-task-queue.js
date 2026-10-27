
/**
 * @typedef {Object} AudioTask
 * @property {string} id
 * @property {string} trackUrl
 * @property {(buffer: AudioBuffer) => void} resolve
 * @property {(error: Error) => void} reject
 */

/**
 * FIFO queue for loading and decoding audio tracks.
 */
export class AudioTaskQueue {
  /**
   * @param {(trackUrl: string, signal: AbortSignal) => Promise<AudioBuffer>} loader
   */
  constructor(loader) {
    if (typeof loader !== 'function') {
      throw new TypeError('loader must be a function');
    }

    this.loader = loader;
    this.queue = [];
    this.isProcessing = false;
    this.activeController = null;
  }

  /**
   * Add a new audio task.
   *
   * @param {string} trackUrl
   * @returns {Promise<AudioBuffer>}
   */
  enqueue(trackUrl) {
    if (typeof trackUrl !== 'string' || !trackUrl.trim()) {
      return Promise.reject(
        new TypeError('trackUrl must be a non-empty string')
      );
    }

    return new Promise((resolve, reject) => {
      const task = {
        id: crypto.randomUUID(),
        trackUrl,
        resolve,
        reject
      };

      this.queue.push(task);
      void this.processNext();
    });
  }

  /**
   * Execute audio tasks sequentially.
   *
   * @returns {Promise<void>}
   */
  async processNext() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const task = this.queue.shift();
        const controller = new AbortController();

        this.activeController = controller;

        try {
          const audioBuffer = await this.loader(
            task.trackUrl,
            controller.signal
          );

          if (controller.signal.aborted) {
            throw new DOMException(
              'Audio loading was cancelled',
              'AbortError'
            );
          }

          task.resolve(audioBuffer);
        } catch (error) {
          task.reject(error);
        } finally {
          this.activeController = null;
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Cancel the currently running audio task.
   *
   * @returns {boolean}
   */
  cancelActive() {
    if (!this.activeController) {
      return false;
    }

    this.activeController.abort();
    return true;
  }

  /**
   * Cancel all pending tasks without affecting
   * the currently running task.
   *
   * @returns {number}
   */
  clearPending() {
    const pendingTasks = this.queue.splice(0);

    for (const task of pendingTasks) {
      task.reject(
        new DOMException(
          'Pending audio task was cancelled',
          'AbortError'
        )
      );
    }

    return pendingTasks.length;
  }
}
