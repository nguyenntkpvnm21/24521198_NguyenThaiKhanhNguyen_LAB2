import assert from 'node:assert/strict';
import { fetchFeed } from './data-service.js';

// Test 1: Successful request
const items = await fetchFeed({ delay: 10 });

assert.equal(items.length, 3);
assert.equal(items[0].title, 'Review Pull Request');

console.log('PASS: Successful request');

// Test 2: Failed request
await assert.rejects(
  fetchFeed({ delay: 10, shouldFail: true }),
  /Unable to connect to the data service/
);

console.log('PASS: Failed request');

// Test 3: Abort before request
const controller1 = new AbortController();
controller1.abort();

await assert.rejects(
  fetchFeed({ signal: controller1.signal }),
  { name: 'AbortError' }
);

console.log('PASS: Pre-aborted request');

// Test 4: Abort during request
const controller2 = new AbortController();

const pendingRequest = fetchFeed({
  delay: 1000,
  signal: controller2.signal
});

controller2.abort();

await assert.rejects(
  pendingRequest,
  { name: 'AbortError' }
);

console.log('PASS: Abort during request');

// Test 5: Independent data objects
const first = await fetchFeed({ delay: 10 });
const second = await fetchFeed({ delay: 10 });

assert.notStrictEqual(first, second);
assert.notStrictEqual(first[0], second[0]);

console.log('PASS: Independent data objects');

console.log('PASS: All 5 data service tests');