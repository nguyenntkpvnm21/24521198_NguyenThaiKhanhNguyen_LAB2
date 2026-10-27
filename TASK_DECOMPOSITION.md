
# Task Decomposition - Exercise 1

## Exercise 1: Mini-React VNode & Mounting Engine

### Task 1.1 - Define VNode Contracts
- [x] Define the VNode structure.
- [x] Identify required props and children.
- [x] Define basic type validation rules.

### Task 1.2 - Implement createTextElement
- [x] Convert strings and numbers into TEXT_ELEMENT nodes.
- [x] Ensure each text node has an empty children array.
- [x] Verify the returned VNode structure.

### Task 1.3 - Implement createElement
- [x] Support type, props, and multiple children.
- [x] Handle null props.
- [x] Flatten nested children arrays.
- [x] Ignore null, undefined, and false children.
- [x] Normalize primitive children.
- [x] Verify the generated VNode tree.

### Task 1.4 - Implement renderToDOM
- [x] Create real HTML elements from VNodes.
- [x] Create text nodes using document.createTextNode.
- [x] Assign element attributes.
- [x] Register event listeners.
- [x] Recursively render child nodes.
- [x] Validate VNode types before rendering.

### Task 1.5 - Integration and Security Testing
- [x] Create a semantic HTML page.
- [x] Mount the VNode tree into the root container.
- [x] Verify the button click event.
- [x] Test basic XSS resistance.
- [x] Inspect the DOM using Chrome DevTools.
- [x] Check for unexpected nodes and Console errors.
- [x] Verify invalid VNode rejection with automated tests.

### Task 1.6 - Git and Submission
- [x] Commit createElement implementation.
- [x] Commit renderToDOM implementation.
- [x] Complete final verification.
- [x] Push the project to GitHub.
- [x] Capture screenshots of the results.
- [x] Prepare one PDF with the GitHub link and screenshots.

## Exercise 2: Reactive State Machine & Delegation Hub

### State Management
- [x] E2-01: Implement stateStore and resetCursor
- [x] E2-02: Implement custom useState with closure
- [x] E2-03: Support functional state updates
- [x] E2-04: Prevent unnecessary renders using Object.is
- [x] E2-05: Verify state persistence and hook call order

### Event Architecture
- [x] E2-06: Implement root event delegation hub
- [x] E2-07: Integrate events with the VNode engine
- [x] E2-08: Verify root listener counts and event behavior

### Reactive Application
- [x] E2-09: Implement Task Manager UI
- [x] E2-10: Implement task creation and filtering
- [x] E2-11: Verify reactive updates and DOM behavior
- [x] E2-12: Complete final audit and documentation

## Exercise 3: Resilient State Machine & Skeleton Loader

### T-03A: State Machine Contract
- [x] Define four states: IDLE, LOADING, SUCCESS, ERROR.
- [x] Define valid state transitions.
- [x] Prevent inconsistent state combinations.
- [x] Verify state transition behavior.

### T-03B: Asynchronous Data Service
- [x] Implement simulated asynchronous data fetching.
- [x] Support successful and failed requests.
- [x] Handle race conditions between requests.
- [x] Verify asynchronous behavior.

### T-03C: Skeleton Loader
- [x] Build semantic HTML page structure.
- [x] Implement animated CSS skeleton placeholders.
- [x] Display skeletons only during LOADING.
- [x] Verify loading feedback.

### T-03D: Reactive Data Feed
- [x] Integrate the custom useState engine from Exercise 2.
- [x] Render UI according to the current state.
- [x] Display fetched data during SUCCESS.
- [x] Display a readable error message during ERROR.
- [x] Implement the Retry Connection button.

### T-03E: Verification & Git
- [x] Test IDLE, LOADING, SUCCESS, and ERROR.
- [x] Test retry behavior after failure.
- [x] Verify race-condition protection.
- [x] Inspect browser Console and Elements.


## Homework 1 — Production Enterprise Data-Grid

### Phase 1 — Project Foundation
- [x] HW1-01: Define DataGrid requirements and component contracts
- [x] HW1-02: Initialize React application using Vite
- [x] HW1-03: Define dataset and column configurations

### Phase 2 — Core DataGrid
- [x] HW1-04: Implement semantic HTML table
- [x] HW1-05: Implement column sorting
- [x] HW1-06: Implement data filtering
- [x] HW1-07: Implement pagination
- [x] HW1-08: Implement row selection

### Phase 3 — Accessibility
- [x] HW1-09: Implement keyboard navigation with arrow keys
- [x] HW1-10: Implement Enter and Space interactions
- [x] HW1-11: Implement focus management and ARIA semantics
- [ ] HW1-12: Verify WCAG 2.2 AA color contrast

### Phase 4 — Testing and Verification
- [ ] HW1-13: Add functional and accessibility tests
- [ ] HW1-14: Perform manual keyboard and screen-reader testing
- [x] HW1-15: Achieve Lighthouse Accessibility 100
- [x] HW1-16: Achieve Lighthouse Best Practices 100


## Homework 2 — Concurrent FIFO Audio Visualizer Queue Engine

### Phase 1 — Architecture and Contracts
- [x] HW2-01: Define application modules and responsibilities.
- [x] HW2-02: Define FIFO queue task contracts and lifecycle.
- [x] HW2-03: Define audio engine and visualizer interfaces.

### Phase 2 — Application UI
- [x] HW2-04: Create semantic HTML application structure.
- [x] HW2-05: Implement responsive CSS layout.
- [x] HW2-06: Add playback controls and queue status display.

### Phase 3 — FIFO Audio Task Queue
- [x] HW2-07: Implement AudioTaskQueue and enqueue().
- [x] HW2-08: Implement sequential processNext() execution.
- [x] HW2-09: Handle task completion, rejection, and queue recovery.
- [x] HW2-10: Verify FIFO ordering using automated tests.

### Phase 4 — Web Audio Engine
- [x] HW2-11: Initialize AudioContext and AnalyserNode.
- [x] HW2-12: Fetch and decode audio into AudioBuffer.
- [x] HW2-13: Implement playback, stop, and track switching.
- [x] HW2-14: Connect audio source to analyser and destination.

### Phase 5 — Audio Visualization
- [x] HW2-15: Implement Canvas frequency spectrum rendering.
- [x] HW2-16: Configure FFT analysis with fftSize 256 or 512.
- [x] HW2-17: Implement requestAnimationFrame rendering loop.
- [x] HW2-18: Verify animation performance and responsiveness.

### Phase 6 — Cancellation and Memory Safety
- [x] HW2-19: Implement AbortController for active fetch operations.
- [x] HW2-20: Handle queued and active task cancellation.
- [x] HW2-21: Clean up AudioBufferSourceNode connections and references.
- [x] HW2-22: Cancel animation frames and release audio resources.

### Phase 7 — Integration and Verification
- [x] HW2-23: Integrate queue, audio engine, visualizer, and UI.
- [x] HW2-24: Test rapid enqueue, cancellation, and error recovery.
- [x] HW2-25: Check for unhandled errors and resource leaks.
- [x] HW2-26: Verify behavior using Chrome DevTools.

## Homework 3 — High-Concurrency Flash-Sale E-Commerce Engine

### Phase 1 — Architecture and Contracts
- [x] HW3-01: Define application requirements and module responsibilities.
- [x] HW3-02: Define countdown timer and inventory contracts.
- [x] HW3-03: Set up the application structure and test environment.

### Phase 2 — Zero-Drift Countdown Engine
- [x] HW3-04: Implement timestamp-based countdown calculation.
- [x] HW3-05: Implement requestAnimationFrame rendering.
- [x] HW3-06: Handle timer completion and cleanup.
- [x] HW3-07: Test timer accuracy after tab inactivity.

### Phase 3 — Inventory State Machine
- [x] HW3-08: Define inventory and reservation state contracts.
- [x] HW3-09: Implement valid reservation state transitions.
- [x] HW3-10: Implement product reservation and inventory locking.
- [x] HW3-11: Implement reservation expiration and inventory release.
- [x] HW3-12: Implement checkout and purchase confirmation.

### Phase 4 — Concurrency and Inventory Safety
- [x] HW3-13: Prevent overselling and duplicate reservations.
- [x] HW3-14: Handle competing reservation requests.
- [x] HW3-15: Test expiration and checkout race conditions.
- [x] HW3-16: Verify inventory consistency and state invariants.

### Phase 5 — Flash-Sale User Interface
- [x] HW3-17: Create semantic HTML application structure.
- [x] HW3-18: Implement responsive CSS layout.
- [x] HW3-19: Display countdown and product inventory.
- [x] HW3-20: Implement reservation and checkout controls.
- [x] HW3-21: Display reservation status and user feedback.

### Phase 6 — Integration and Verification
- [x] HW3-22: Integrate countdown, inventory, and UI modules.
- [x] HW3-23: Test successful reservation and checkout.
- [x] HW3-24: Test inventory exhaustion and reservation expiration.
- [x] HW3-25: Verify rapid interactions and concurrency behavior.
- [x] HW3-26: Inspect Console, DOM, and application responsiveness.

### Phase 7 — AI Failure Mode Audit
- [x] HW3-27: Identify at least three AI-generated code failure modes.
- [x] HW3-28: Document reproduction steps and observed behavior.
- [x] HW3-29: Explain root causes, fixes, and verification results.
- [x] HW3-30: Complete AI_FAILURE_AUDIT.md.
