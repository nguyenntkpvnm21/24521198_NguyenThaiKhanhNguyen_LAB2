// Store state values across render passes.
const stateStore = [];

let cursor = 0;

// Reset the hook cursor before every render.
export function resetCursor() {
  cursor = 0;
}

// Function called when a state update requires a new render.
let triggerRender = () => {};

export function setRenderer(rerenderFn) {
  triggerRender = rerenderFn;
}

export function useState(initialValue) {
  const currentCursor = cursor;

  // Initialize the state only on its first use.
  if (currentCursor >= stateStore.length) {
    stateStore[currentCursor] = initialValue;
  }

  const setState = (nextValue) => {
    const previousValue = stateStore[currentCursor];

    const resolvedValue =
      typeof nextValue === "function"
        ? nextValue(previousValue)
        : nextValue;

    // Skip rendering if the state has not changed.
    if (Object.is(previousValue, resolvedValue)) {
      return;
    }

    stateStore[currentCursor] = resolvedValue;
    triggerRender();
  };

  cursor++;

  return [stateStore[currentCursor], setState];
}