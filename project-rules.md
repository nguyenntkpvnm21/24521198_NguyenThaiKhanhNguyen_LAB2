
# Project Rules - Web Lab 02

## 1. Development Workflow
- Divide the exercise into small, independent tasks.
- Define function contracts before implementation.
- Implement and test one function at a time.
- Review generated code before committing.
- Use meaningful Git commits for each milestone.

## 2. JavaScript Rules
- Use modern JavaScript with const and let.
- Do not use var or implicit global variables.
- Use ES modules for imports and exports.
- Do not use inline HTML event handlers.
- Avoid unsafe innerHTML when rendering user content.
- Use DOM APIs such as createElement and createTextNode.

## 3. Virtual DOM Rules
- Implement createTextElement, createElement, and renderToDOM.
- Represent Virtual DOM nodes using plain JavaScript objects.
- Normalize text and numeric children into TEXT_ELEMENT nodes.
- Support nested children and null props.
- Validate VNode types before rendering.

## 4. Semantic HTML and Security
- Use semantic elements such as main, header, section, and button.
- Avoid unnecessary div elements.
- Treat user-provided strings as text, not executable HTML.
- Test XSS resistance using malicious-looking input strings.

## 5. Verification
- Test each module before integration.
- Check the browser Console for errors.
- Inspect the generated DOM using Chrome DevTools.
- Verify that the button click event works.
- Ensure there are no unexpected DOM nodes.

## 6. Git Requirements
- Commit each completed milestone separately.
- Do not combine unrelated changes in one commit.
- Review git diff and git status before committing.
- Push the completed project to GitHub.
