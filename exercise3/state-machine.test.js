import assert from 'node:assert/strict';

import {
  STATUS,
  createInitialState,
  transition
} from './state-machine.js';

// Test 1: Initial state
const initial = createInitialState();

assert.deepEqual(initial, {
  status: STATUS.IDLE
});

// Test 2: IDLE -> LOADING
const loading = transition(initial, {
  status: STATUS.LOADING
});

assert.deepEqual(loading, {
  status: STATUS.LOADING
});

// Test 3: LOADING -> SUCCESS
const success = transition(loading, {
  status: STATUS.SUCCESS,
  data: ['Item A', 'Item B']
});

assert.deepEqual(success, {
  status: STATUS.SUCCESS,
  data: ['Item A', 'Item B']
});

// Test 4: LOADING -> ERROR
const error = transition(loading, {
  status: STATUS.ERROR,
  error: 'Connection failed'
});

assert.equal(error.status, STATUS.ERROR);
assert.equal(error.error, 'Connection failed');

// Test 5: ERROR -> LOADING (Retry)
const retry = transition(error, {
  status: STATUS.LOADING
});

assert.equal(retry.status, STATUS.LOADING);

// Test 6: SUCCESS -> LOADING (Reload)
const reload = transition(success, {
  status: STATUS.LOADING
});

assert.equal(reload.status, STATUS.LOADING);

// Test 7: Reject invalid transition
assert.throws(() => {
  transition(initial, {
    status: STATUS.SUCCESS,
    data: []
  });
}, /Invalid transition/);

// Test 8: Reject SUCCESS without data
assert.throws(() => {
  transition(loading, {
    status: STATUS.SUCCESS
  });
}, /SUCCESS state requires an array/);

// Test 9: Reject ERROR without message
assert.throws(() => {
  transition(loading, {
    status: STATUS.ERROR,
    error: ''
  });
}, /ERROR state requires an error message/);

console.log('PASS: All 9 state machine tests');