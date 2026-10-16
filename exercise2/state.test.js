import assert from "node:assert/strict";
import { resetCursor } from "./reactive-engine.js";

assert.equal(typeof resetCursor, "function");

resetCursor();

console.log("PASS: resetCursor is exported and callable.");

import { useState, setRenderer } from "./reactive-engine.js";

let renderCount = 0;

setRenderer(() => {
  renderCount++;
});

// First render: initialize two independent states.
resetCursor();

const [count, setCount] = useState(0);
const [filter, setFilter] = useState("ALL");

assert.equal(count, 0);
assert.equal(filter, "ALL");

// Update count using a functional updater.
setCount((previous) => previous + 1);

assert.equal(renderCount, 1);

// Second render: state values must persist.
resetCursor();

const [updatedCount, setUpdatedCount] = useState(0);
const [updatedFilter] = useState("ALL");

assert.equal(updatedCount, 1);
assert.equal(updatedFilter, "ALL");

// Unchanged state must not trigger another render.
setUpdatedCount(1);

assert.equal(renderCount, 1);

console.log("PASS: useState initialization.");
console.log("PASS: Independent state storage.");
console.log("PASS: Functional state updater.");
console.log("PASS: State persistence across renders.");
console.log("PASS: Unchanged state skips rendering.");

// Hook order invariant test.
resetCursor();

const [finalCount] = useState(0);
const [finalFilter] = useState("ALL");

assert.equal(finalCount, 1);
assert.equal(finalFilter, "ALL");

console.log("PASS: Hook call order remains consistent.");