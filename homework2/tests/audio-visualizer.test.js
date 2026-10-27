
import test from 'node:test';
import assert from 'node:assert/strict';

import { AudioVisualizer } from '../src/audio-visualizer.js';

function createMocks() {
  const calls = {
    clear: 0,
    fill: 0,
    frequencyReads: 0
  };

  const context = {
    fillStyle: '',
    clearRect() {
      calls.clear++;
    },
    fillRect() {
      calls.fill++;
    }
  };

  const canvas = {
    clientWidth: 800,
    clientHeight: 300,
    width: 800,
    height: 300,
    getContext() {
      return context;
    }
  };

  const analyser = {
    frequencyBinCount: 128,
    getByteFrequencyData(array) {
      calls.frequencyReads++;
      array.fill(128);
    }
  };

  return {
    canvas,
    analyser,
    calls
  };
}

test('visualizer validates canvas', () => {
  const { analyser } = createMocks();

  assert.throws(
    () => new AudioVisualizer(null, analyser),
    TypeError
  );
});

test('visualizer creates frequency data buffer', () => {
  const { canvas, analyser } = createMocks();

  const visualizer = new AudioVisualizer(
    canvas,
    analyser
  );

  assert.equal(visualizer.dataArray.length, 128);
  assert.equal(visualizer.isRunning, false);
});

test('draw reads frequency data and renders bars', () => {
  const { canvas, analyser, calls } = createMocks();

  const visualizer = new AudioVisualizer(
    canvas,
    analyser
  );

  visualizer.draw();

  assert.equal(calls.frequencyReads, 1);
  assert.equal(calls.fill, 128);
  assert.equal(calls.clear, 1);
});

test('dispose clears the canvas', () => {
  const { canvas, analyser, calls } = createMocks();

  const visualizer = new AudioVisualizer(
    canvas,
    analyser
  );

  visualizer.dispose();

  assert.equal(calls.clear, 1);
  assert.equal(visualizer.isRunning, false);
});

test('start and stop manage animation lifecycle', () => {
  const originalRequest = globalThis.requestAnimationFrame;
  const originalCancel = globalThis.cancelAnimationFrame;

  let requested = 0;
  let cancelled = 0;

  try {
    globalThis.requestAnimationFrame = () => {
      requested++;
      return requested;
    };

    globalThis.cancelAnimationFrame = () => {
      cancelled++;
    };

    const { canvas, analyser } = createMocks();

    const visualizer = new AudioVisualizer(
      canvas,
      analyser
    );

    assert.equal(visualizer.start(), true);
    assert.equal(visualizer.start(), false);

    assert.equal(requested, 1);

    assert.equal(visualizer.stop(), true);
    assert.equal(visualizer.stop(), false);

    assert.equal(cancelled, 1);
    assert.equal(visualizer.isRunning, false);
    assert.equal(visualizer.animationFrameId, null);
  } finally {
    globalThis.requestAnimationFrame = originalRequest;
    globalThis.cancelAnimationFrame = originalCancel;
  }
});
