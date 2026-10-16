import assert from "node:assert/strict";
import { resetCursor } from "./reactive-engine.js";

assert.equal(typeof resetCursor, "function");

resetCursor();

console.log("PASS: resetCursor is exported and callable.");