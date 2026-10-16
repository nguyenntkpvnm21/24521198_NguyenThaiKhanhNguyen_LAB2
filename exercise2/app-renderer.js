import { resetCursor, setRenderer } from './reactive-engine.js';
import { renderToDOM } from './render-to-dom.js';
import { setupEventDelegation } from './event-delegation.js';

export function renderApp(root, App) {
  if (!(root instanceof Element)) {
    throw new TypeError('Invalid root container');
  }

  if (typeof App !== 'function') {
    throw new TypeError('App must be a function');
  }

  // Register root listeners only once.
  setupEventDelegation(root);

  const rerender = () => {
  // Remember the focused element before rendering.
  const activeElement = document.activeElement;
  const hadFocus = root.contains(activeElement);

  const focusId = hadFocus
    ? activeElement.getAttribute('data-focus-id')
    : null;

  const focusableSelector =
    'button, input, select, textarea';

  const oldElements = [
    ...root.querySelectorAll(focusableSelector)
  ];

  const focusIndex = oldElements.indexOf(activeElement);

  const wasCheckbox =
    hadFocus && activeElement.matches('input[type="checkbox"]');

  // Generate the updated VNode tree.
  resetCursor();

  const vNode = App();
  const dom = renderToDOM(vNode);

  root.replaceChildren(dom);

  if (!hadFocus) {
    return;
  }

  // Restore checkbox focus using its stable ID.
  if (focusId) {
    const matchingElement = [
      ...root.querySelectorAll('[data-focus-id]')
    ].find((element) =>
      element.getAttribute('data-focus-id') === focusId
    );

    if (matchingElement) {
      matchingElement.focus({ preventScroll: true });
      return;
    }
  }

  // If a focused checkbox disappeared, focus the active filter.
  if (wasCheckbox) {
    const activeFilter = root.querySelector(
      'button[aria-pressed="true"]'
    );

    activeFilter?.focus({ preventScroll: true });
    return;
  }

  // Preserve focus for controls that remain in the same position.
  if (focusIndex !== -1) {
    const newElements = [
      ...root.querySelectorAll(focusableSelector)
    ];

    newElements[focusIndex]?.focus({ preventScroll: true });
  }
};
  // Connect state updates to the render function.
  setRenderer(rerender);

  // Perform the initial render.
  rerender();
}