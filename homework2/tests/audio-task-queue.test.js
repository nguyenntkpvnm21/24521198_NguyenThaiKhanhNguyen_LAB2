
import test from 'node:test';
import assert from 'node:assert/strict';

import { AudioTaskQueue } from '../src/audio-task-queue.js';

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

test('enqueue rejects invalid track URLs', async () => {
  const queue = new AudioTaskQueue(async () => ({}));

  await assert.rejects(
    queue.enqueue(''),
    TypeError
  );

  await assert.rejects(
    queue.enqueue('   '),
    TypeError
  );

  await assert.rejects(
    queue.enqueue(null),
    TypeError
  );
});

test('tasks execute in FIFO order', async () => {
  const executionOrder = [];

  const loader = async (trackUrl) => {
    executionOrder.push(trackUrl);
    await wait(10);
    return { trackUrl };
  };

  const queue = new AudioTaskQueue(loader);

  const results = await Promise.all([
    queue.enqueue('A.mp3'),
    queue.enqueue('B.mp3'),
    queue.enqueue('C.mp3')
  ]);

  assert.deepEqual(executionOrder, [
    'A.mp3',
    'B.mp3',
    'C.mp3'
  ]);

  assert.deepEqual(
    results.map((result) => result.trackUrl),
    ['A.mp3', 'B.mp3', 'C.mp3']
  );
});

test('only one task executes at a time', async () => {
  let activeTasks = 0;
  let maxActiveTasks = 0;

  const loader = async (trackUrl) => {
    activeTasks++;

    maxActiveTasks = Math.max(
      maxActiveTasks,
      activeTasks
    );

    await wait(10);

    activeTasks--;

    return { trackUrl };
  };

  const queue = new AudioTaskQueue(loader);

  await Promise.all([
    queue.enqueue('A.mp3'),
    queue.enqueue('B.mp3'),
    queue.enqueue('C.mp3'),
    queue.enqueue('D.mp3')
  ]);

  assert.equal(maxActiveTasks, 1);
  assert.equal(queue.isProcessing, false);
  assert.equal(queue.queue.length, 0);
});

test('a failed task does not block the queue', async () => {
  const executionOrder = [];

  const loader = async (trackUrl) => {
    executionOrder.push(trackUrl);

    await wait(5);

    if (trackUrl === 'B.mp3') {
      throw new Error('Failed to load B.mp3');
    }

    return { trackUrl };
  };

  const queue = new AudioTaskQueue(loader);

  const results = await Promise.allSettled([
    queue.enqueue('A.mp3'),
    queue.enqueue('B.mp3'),
    queue.enqueue('C.mp3')
  ]);

  assert.deepEqual(executionOrder, [
    'A.mp3',
    'B.mp3',
    'C.mp3'
  ]);

  assert.equal(results[0].status, 'fulfilled');
  assert.equal(results[1].status, 'rejected');
  assert.equal(results[2].status, 'fulfilled');

  assert.equal(queue.isProcessing, false);
  assert.equal(queue.queue.length, 0);
});

test('queue accepts new tasks after becoming idle', async () => {
  const executionOrder = [];

  const loader = async (trackUrl) => {
    executionOrder.push(trackUrl);
    return { trackUrl };
  };

  const queue = new AudioTaskQueue(loader);

  await queue.enqueue('A.mp3');
  await queue.enqueue('B.mp3');

  assert.deepEqual(executionOrder, [
    'A.mp3',
    'B.mp3'
  ]);

  assert.equal(queue.isProcessing, false);
});

test('cancelActive aborts the running task', async () => {
  let notifyStarted;
  const started = new Promise((resolve) => {
    notifyStarted = resolve;
  });

  const loader = (trackUrl, signal) =>
    new Promise((resolve, reject) => {
      const onAbort = () => {
        reject(
          new DOMException(
            'Operation aborted',
            'AbortError'
          )
        );
      };

      signal.addEventListener(
        'abort',
        onAbort,
        { once: true }
      );

      notifyStarted();
    });

  const queue = new AudioTaskQueue(loader);

  const task = queue.enqueue('A.mp3');

  await started;

  assert.equal(queue.cancelActive(), true);

  await assert.rejects(
    task,
    { name: 'AbortError' }
  );

  assert.equal(queue.activeController, null);
  assert.equal(queue.isProcessing, false);
});

test('clearPending rejects waiting tasks', async () => {
  let releaseActive;

  const activeGate = new Promise((resolve) => {
    releaseActive = resolve;
  });

  const loader = async (trackUrl) => {
    if (trackUrl === 'A.mp3') {
      await activeGate;
    }

    return { trackUrl };
  };

  const queue = new AudioTaskQueue(loader);

  const active = queue.enqueue('A.mp3');

  const pendingB = queue.enqueue('B.mp3');
  const pendingC = queue.enqueue('C.mp3');

  const settled = Promise.allSettled([
    pendingB,
    pendingC
  ]);

  assert.equal(queue.clearPending(), 2);
  assert.equal(queue.queue.length, 0);

  releaseActive();

  const results = await settled;
  const activeResult = await active;

  assert.equal(activeResult.trackUrl, 'A.mp3');

  assert.equal(results[0].status, 'rejected');
  assert.equal(results[1].status, 'rejected');

  assert.equal(results[0].reason.name, 'AbortError');
  assert.equal(results[1].reason.name, 'AbortError');
});

test('queue can continue after cancellation', async () => {
  const loader = (trackUrl, signal) =>
    new Promise((resolve, reject) => {
      if (trackUrl === 'A.mp3') {
        signal.addEventListener(
          'abort',
          () => reject(
            new DOMException(
              'Cancelled',
              'AbortError'
            )
          ),
          { once: true }
        );

        return;
      }

      resolve({ trackUrl });
    });

  const queue = new AudioTaskQueue(loader);

  const first = queue.enqueue('A.mp3');
  const second = queue.enqueue('B.mp3');

  const resultsPromise = Promise.allSettled([
    first,
    second
  ]);

  assert.equal(queue.cancelActive(), true);

  const results = await resultsPromise;

  assert.equal(results[0].status, 'rejected');
  assert.equal(results[1].status, 'fulfilled');
  assert.equal(results[1].value.trackUrl, 'B.mp3');
});
