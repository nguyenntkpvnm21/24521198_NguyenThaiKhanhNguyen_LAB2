import assert from 'node:assert/strict';

import { fetchFeed } from './data-service.js';
import { createRequestManager } from './request-manager.js';

const manager = createRequestManager();

const acceptedResults = [];

// Request A: slow request
const requestA = manager.start();

const promiseA = fetchFeed({
  delay: 1000,
  signal: requestA.signal
})
  .then((items) => {
    if (manager.isCurrent(requestA.id)) {
      acceptedResults.push({
        request: 'A',
        items
      });
    }
  })
  .catch((error) => {
    assert.equal(error.name, 'AbortError');
  });

// Request B: faster and newer request
const requestB = manager.start();

const promiseB = fetchFeed({
  delay: 20,
  signal: requestB.signal
})
  .then((items) => {
    if (manager.isCurrent(requestB.id)) {
      acceptedResults.push({
        request: 'B',
        items
      });
    }
  });

// Wait for both requests.
await Promise.all([promiseA, promiseB]);

// Verification
assert.equal(requestA.signal.aborted, true);
assert.equal(requestB.signal.aborted, false);

assert.equal(acceptedResults.length, 1);
assert.equal(acceptedResults[0].request, 'B');
assert.equal(acceptedResults[0].items.length, 3);

console.log('PASS: Old request was aborted');
console.log('PASS: Only latest request was accepted');
console.log('PASS: Latest request returned 3 items');
console.log('PASS: Race condition protection verified');