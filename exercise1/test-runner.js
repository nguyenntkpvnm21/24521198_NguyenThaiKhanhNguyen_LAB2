
import { createElement, renderToDOM } from './mini-react.js';

// Build the Virtual DOM tree
const vApp = createElement(
  'main',
  { id: 'root-view', role: 'main' },

  createElement(
    'header',
    { className: 'hero' },

    createElement('h1', null, 'Mini React Engine'),

    createElement(
      'p',
      null,
      '<img onerror=alert(1)> Safe Text'
    )
  ),

  createElement(
    'section',
    { 'aria-label': 'Interaction test' },

    createElement(
      'button',
      {
        type: 'button',
        onClick: () => console.log('Ping')
      },
      'Click'
    )
  )
);

// Mount the Virtual DOM into the page
const root = document.getElementById('app');

root.replaceChildren(renderToDOM(vApp));

// Verify the mounted DOM
console.assert(
  root.querySelector('button') !== null,
  'Mount Failed'
);

console.assert(
  root.querySelector('h1')?.textContent === 'Mini React Engine',
  'Heading test failed'
);

console.assert(
  root.querySelector('img') === null,
  'XSS test failed'
);

console.log('Mini React Engine mounted successfully');
