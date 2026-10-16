
import assert from 'node:assert/strict';
import { createElement, createTextElement, renderToDOM } from './mini-react.js';

let passed = 0;

function test(name, callback) {
  try {
    callback();
    passed++;
    console.log(`PASS: ${name}`);
  } catch (error) {
    console.error(`FAIL: ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

// Test 1: Text normalization
test('createTextElement converts numbers to strings', () => {
  const node = createTextElement(123);

  assert.equal(node.type, 'TEXT_ELEMENT');
  assert.equal(node.props.nodeValue, '123');
  assert.deepEqual(node.props.children, []);
});

// Test 2: Null props
test('createElement supports null props', () => {
  const node = createElement('h1', null, 'Hello');

  assert.equal(node.type, 'h1');
  assert.equal(node.props.children.length, 1);
});

// Test 3: Nested children
test('createElement flattens nested arrays', () => {
  const node = createElement('main', null, [
    'First',
    ['Second', 123]
  ]);

  assert.equal(node.props.children.length, 3);
});

// Test 4: Empty children
test('createElement ignores empty children', () => {
  const node = createElement(
    'section',
    null,
    null,
    undefined,
    false,
    'Valid'
  );

  assert.equal(node.props.children.length, 1);
});

// Test 5: Null VNode
test('renderToDOM rejects null', () => {
  assert.throws(
    () => renderToDOM(null),
    TypeError
  );
});

// Test 6: Missing type
test('renderToDOM rejects missing type', () => {
  assert.throws(
    () => renderToDOM({ props: { children: [] } }),
    TypeError
  );
});

// Test 7: Invalid props
test('renderToDOM rejects invalid props', () => {
  assert.throws(
    () => renderToDOM({ type: 'main', props: null }),
    TypeError
  );
});

// Test 8: Invalid children
test('renderToDOM rejects invalid children', () => {
  assert.throws(
    () => renderToDOM({
      type: 'main',
      props: { children: 'invalid' }
    }),
    TypeError
  );
});

// Test 9: Invalid text node
test('renderToDOM rejects invalid text node', () => {
  assert.throws(
    () => renderToDOM({
      type: 'TEXT_ELEMENT',
      props: {
        nodeValue: 123,
        children: []
      }
    }),
    TypeError
  );
});

console.log(`\nTests passed: ${passed}/9`);
