
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createCountdown,
  formatCountdown
} from '../src/timer.js';

function createFakeClock(initialTime = 0) {
  let currentTime = initialTime;
  let nextFrameId = 0;
  const frames = new Map();

  return {
    now: () => currentTime,

    requestFrame(callback) {
      const id = ++nextFrameId;
      frames.set(id, callback);
      return id;
    },

    cancelFrame(id) {
      frames.delete(id);
    },

    advance(milliseconds) {
      currentTime += milliseconds;
    },

    runFrame() {
      const callbacks = [...frames.values()];
      frames.clear();

      for (const callback of callbacks) {
        callback();
      }
    },

    pendingFrames: () => frames.size
  };
}

test('countdown calculates remaining time correctly', () => {
  const clock = createFakeClock(1000);
  const ticks = [];

  const countdown = createCountdown({
    endTime: 6000,
    onTick: (remaining) => ticks.push(remaining),
    ...clock
  });

  countdown.start();

  assert.equal(ticks[0], 5000);

  clock.advance(2000);
  clock.runFrame();

  assert.equal(ticks.at(-1), 3000);
});

test('countdown does not drift after a delayed frame', () => {
  const clock = createFakeClock(0);
  const ticks = [];

  const countdown = createCountdown({
    endTime: 60000,
    onTick: (remaining) => ticks.push(remaining),
    ...clock
  });

  countdown.start();

  // Simulate a background tab where animation frames are delayed.
  clock.advance(45000);
  clock.runFrame();

  assert.equal(ticks.at(-1), 15000);
});

test('countdown stops at zero and completes only once', () => {
  const clock = createFakeClock();
  let completionCount = 0;
  const ticks = [];

  const countdown = createCountdown({
    endTime: 3000,
    onTick: (remaining) => ticks.push(remaining),
    onComplete: () => completionCount++,
    ...clock
  });

  countdown.start();

  clock.advance(5000);
  clock.runFrame();

  assert.equal(ticks.at(-1), 0);
  assert.equal(completionCount, 1);
  assert.equal(countdown.isCompleted(), true);
  assert.equal(clock.pendingFrames(), 0);

  countdown.start();

  assert.equal(completionCount, 1);
});

test('stop cancels pending animation frames', () => {
  const clock = createFakeClock();

  const countdown = createCountdown({
    endTime: 10000,
    onTick: () => {},
    ...clock
  });

  countdown.start();

  assert.equal(clock.pendingFrames(), 1);

  countdown.stop();

  assert.equal(clock.pendingFrames(), 0);
  assert.equal(countdown.isRunning(), false);
});

test('formatCountdown returns correct display values', () => {
  assert.deepEqual(formatCountdown(3661000), {
    hours: '01',
    minutes: '01',
    seconds: '01'
  });

  assert.deepEqual(formatCountdown(-1000), {
    hours: '00',
    minutes: '00',
    seconds: '00'
  });
});
