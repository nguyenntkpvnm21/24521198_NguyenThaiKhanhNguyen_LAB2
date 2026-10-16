// Store state values across render passes.
const stateStore = [];

let cursor = 0;

// Reset the hook cursor before every render.
export function resetCursor() {
  cursor = 0;
}