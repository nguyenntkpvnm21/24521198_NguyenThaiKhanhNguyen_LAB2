const supportedEvents = ['click', 'input', 'keydown'];

const initializedRoots = new WeakSet();

export function setupEventDelegation(rootContainer) {
  if (!(rootContainer instanceof Element)) {
    throw new TypeError('Invalid root container');
  }

  if (initializedRoots.has(rootContainer)) {
    return;
  }

  supportedEvents.forEach((eventType) => {
    rootContainer.addEventListener(eventType, (nativeEvent) => {
      const handlerProp =
        `on${eventType.charAt(0).toUpperCase()}${eventType.slice(1)}`;

      let target = nativeEvent.target;

      while (target && target !== rootContainer) {
        const handler = target.__vnode?.props?.[handlerProp];

        if (typeof handler === 'function') {
          handler(nativeEvent);
          break;
        }

        target = target.parentElement;
      }
    });
  });

  initializedRoots.add(rootContainer);
}