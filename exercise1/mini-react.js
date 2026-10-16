export function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: String(text),
      children: []
    }
  };
}


export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...(props || {}),
      children: children
        .flat(Infinity)
        .filter(
          (child) =>
            child !== null &&
            child !== undefined &&
            child !== false
        )
        .map((child) =>
          typeof child === 'object'
            ? child
            : createTextElement(child)
        )
    }
  };
}


export function renderToDOM(vNode) {
  // Validate the VNode structure
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

  // Create a real DOM node
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

  // Assign attributes and event listeners
  Object.entries(vNode.props).forEach(([name, value]) => {
    if (name === 'children' || name === 'nodeValue' || name === 'key') {
      return;
    }

    if (name.startsWith('on') && typeof value === 'function') {
      const eventType = name.slice(2).toLowerCase();
      dom.addEventListener(eventType, value);
    } else if (name === 'className') {
      dom.className = value;
    } else if (name === 'style' && value && typeof value === 'object') {
      Object.assign(dom.style, value);
    } else if (
      typeof value === 'string' ||
      typeof value === 'number'
    ) {
      dom.setAttribute(name, String(value));
    }
  });

  // Recursively render child nodes
  vNode.props.children.forEach((child) => {
    dom.appendChild(renderToDOM(child));
  });

  return dom;
}
