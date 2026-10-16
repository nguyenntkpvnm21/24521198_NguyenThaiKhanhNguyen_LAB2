
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
- [ ] E2-06: Implement root event delegation hub
- [ ] E2-07: Integrate events with the VNode engine
- [ ] E2-08: Verify event listeners and cleanup behavior

### Reactive Application
- [ ] E2-09: Implement Task Manager UI
- [ ] E2-10: Implement task creation and filtering
- [ ] E2-11: Verify reactive updates and DOM behavior
- [ ] E2-12: Complete final audit and documentation