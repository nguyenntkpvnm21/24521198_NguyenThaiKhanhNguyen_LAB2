
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
- [ ] Create a semantic HTML page.
- [ ] Mount the VNode tree into the root container.
- [ ] Verify the button click event.
- [ ] Test XSS resistance.
- [ ] Inspect the DOM using Chrome DevTools.
- [ ] Check for unexpected nodes and Console errors.

### Task 1.6 - Git and Submission
- [ ] Commit createElement implementation.
- [ ] Commit renderToDOM implementation.
- [ ] Complete final verification.
- [ ] Push the project to GitHub.
- [ ] Capture screenshots of the results.
- [ ] Prepare one PDF with the GitHub link and screenshots.
