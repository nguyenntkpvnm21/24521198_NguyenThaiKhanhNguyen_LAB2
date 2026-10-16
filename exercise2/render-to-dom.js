export function renderToDOM(vNode) {
  // Validate the VNode structure.
  if (
    vNode === null ||
    typeof vNode !== 'object' ||
    typeof vNode.type !== 'string' ||
    vNode.props === null ||
    typeof vNode.props !== 'object' ||
    !Array.isArray(vNode.props.children)
  ) {
    throw new TypeError('Invalid VNode');
  }

  // Render text nodes safely.
  if (vNode.type === 'TEXT_ELEMENT') {
    if (
      typeof vNode.props.nodeValue !== 'string' ||
      vNode.props.children.length !== 0
    ) {
      throw new TypeError('Invalid text VNode');
    }

    return document.createTextNode(vNode.props.nodeValue);
  }

  const dom = document.createElement(vNode.type);

  // Associate the real DOM node with its VNode.
  dom.__vnode = vNode;

  Object.entries(vNode.props).forEach(([name, value]) => {
    if (
      name === 'children' ||
      name === 'nodeValue' ||
      name === 'key'
    ) {
      return;
    }

    // Event handlers are managed by the root delegation hub.
    if (name.startsWith('on') && typeof value === 'function') {
      return;
    }

    if (name === 'className') {
      dom.className = value;
    } else if (
      name === 'style' &&
      value &&
      typeof value === 'object'
    ) {
      Object.assign(dom.style, value);
    } else if (
      typeof value === 'string' ||
      typeof value === 'number'
    ) {
      dom.setAttribute(name, String(value));
    }
  });

  // Render child nodes recursively.
  vNode.props.children.forEach((child) => {
    dom.appendChild(renderToDOM(child));
  });

  return dom;
}