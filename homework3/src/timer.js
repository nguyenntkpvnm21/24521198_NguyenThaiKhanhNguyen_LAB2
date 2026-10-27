
/**
 * Zero-drift countdown engine.
 *
 * Calculates remaining time from an absolute deadline
 * instead of decrementing a counter every second.
 */

export function createCountdown({
  endTime,
  onTick,
  onComplete = () => {},
  now = () => Date.now(),
  requestFrame = (callback) => requestAnimationFrame(callback),
  cancelFrame = (id) => cancelAnimationFrame(id)
}) {
  if (!Number.isFinite(endTime)) {
    throw new TypeError('endTime must be a finite timestamp.');
  }

  if (
    typeof onTick !== 'function' ||
    typeof onComplete !== 'function' ||
    typeof now !== 'function' ||
    typeof requestFrame !== 'function' ||
    typeof cancelFrame !== 'function'
  ) {
    throw new TypeError('Invalid countdown callback.');
  }

  let frameId = null;
  let running = false;
  let completed = false;

  function getRemainingTime() {
    return Math.max(0, endTime - now());
  }

  function tick() {
    if (!running) {
      return;
    }

    frameId = null;

    const remaining = getRemainingTime();

    onTick(remaining);

    // A callback may stop the timer during onTick.
    if (!running) {
      return;
    }

    if (remaining === 0) {
      running = false;

      if (!completed) {
        completed = true;
        onComplete();
      }

      return;
    }

    frameId = requestFrame(tick);
  }

  function start() {
    if (running || completed) {
      return;
    }

    running = true;
    tick();
  }

  function stop() {
    running = false;

    if (frameId !== null) {
      cancelFrame(frameId);
      frameId = null;
    }
  }

  return {
    start,
    stop,
    getRemainingTime,
    isRunning: () => running,
    isCompleted: () => completed
  };
}

/**
 * Converts remaining milliseconds into display values.
 */
export function formatCountdown(milliseconds) {
  const safeMilliseconds = Number.isFinite(milliseconds)
    ? Math.max(0, milliseconds)
    : 0;

  const totalSeconds = Math.ceil(safeMilliseconds / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  };
}
