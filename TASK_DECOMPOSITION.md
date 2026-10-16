
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