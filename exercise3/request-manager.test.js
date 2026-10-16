import assert from 'node:assert/strict';

import {
  createRequestManager
} from './request-manager.js';

// Test 1: First request is current
const manager = createRequestManager();

const request1 = manager.start();

assert.equal(manager.isCurrent(request1.id), true);
assert.equal(request1.signal.aborted, false);

console.log('PASS: First request is current');

// Test 2: Starting a new request aborts the old one
const request2 = manager.start();

assert.equal(request1.signal.aborted, true);
assert.equal(request2.signal.aborted, false);

assert.equal(manager.isCurrent(request1.id), false);
assert.equal(manager.isCurrent(request2.id), true);

console.log('PASS: Old request is aborted');

// Test 3: Request IDs are unique and increasing
assert.ok(request2.id > request1.id);

console.log('PASS: Request IDs increase');

// Test 4: Cancel invalidates current request
manager.cancel();

assert.equal(request2.signal.aborted, true);
assert.equal(manager.isCurrent(request2.id), false);

console.log('PASS: Cancel invalidates request');

// Test 5: New request works after cancellation
const request3 = manager.start();

assert.equal(request3.signal.aborted, false);
assert.equal(manager.isCurrent(request3.id), true);

console.log('PASS: New request after cancellation');

// Test 6: Only latest request remains current
const request4 = manager.start();
const request5 = manager.start();

assert.equal(manager.isCurrent(request3.id), false);
assert.equal(manager.isCurrent(request4.id), false);
assert.equal(manager.isCurrent(request5.id), true);

console.log('PASS: Only latest request is current');

// Test 7: Cancel is safe to call repeatedly
manager.cancel();
manager.cancel();

assert.equal(manager.isCurrent(request5.id), false);

console.log('PASS: Repeated cancellation');

console.log('PASS: All 7 request manager tests');