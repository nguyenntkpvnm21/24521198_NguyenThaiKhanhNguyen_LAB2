import { createElement } from '../exercise1/mini-react.js';

import { useState } from '../exercise2/reactive-engine.js';

import {
  STATUS,
  createInitialState
} from './state-machine.js';

import { fetchFeed } from './data-service.js';
import { transition } from './state-machine.js';
import { createRequestManager } from './request-manager.js';

const requestManager = createRequestManager();

export function renderSkeleton() {
  return createElement(
    'section',
    {
      className: 'skeleton-list',
      'aria-label': 'Loading data',
      'aria-busy': 'true'
    },
    [1, 2, 3].map(() =>
      createElement(
        'article',
        {
          className: 'skeleton-card',
          'aria-hidden': 'true'
        },
        createElement('div', {
          className: 'skeleton skeleton-title'
        }),
        createElement('div', {
          className: 'skeleton skeleton-text'
        }),
        createElement('div', {
          className: 'skeleton skeleton-text'
        })
      )
    )
  );
}

export function renderIdle() {
  return createElement(
    'section',
    { className: 'idle-view' },

    createElement(
      'p',
      { className: 'status-message' },
      'The data feed has not been loaded yet.'
    ),

    createElement(
      'button',
      {
        type: 'button',
        id: 'load-button'
      },
      'Load Data'
    ),

    createElement(
      'button',
      {
        type: 'button',
        id: 'simulate-error-button'
      },
      'Simulate Connection Error'
    )
  );
}

export function renderSuccess(items) {
  return createElement(
    'section',
    { className: 'success-view' },

    createElement(
      'p',
      { className: 'status-message' },
      `Successfully loaded ${items.length} items.`
    ),

    createElement(
      'ul',
      { className: 'feed-list' },

      items.map((item) =>
        createElement(
          'li',
          {
            className: 'feed-card',
            key: item.id
          },

          createElement(
            'h3',
            null,
            item.title
          ),

          createElement(
            'p',
            null,
            item.description
          )
        )
      )
    )
  );
}

export function renderError(message) {
  return createElement(
    'section',
    {
      className: 'error-message',
      role: 'alert'
    },

    createElement(
      'h3',
      null,
      'Connection Failed'
    ),

    createElement(
      'p',
      null,
      message
    ),

    createElement(
      'button',
      {
        type: 'button',
        id: 'retry-button'
      },
      'Retry Connection'
    )
  );
}

export function DataFeedApp() {
  const [state, setState] = useState(createInitialState());

  const loadData = async (shouldFail = false) => {
    // Create a new request and cancel the previous one.
    const request = requestManager.start();

    setState((previous) =>
      transition(previous, {
        status: STATUS.LOADING
      })
    );

    try {
      const items = await fetchFeed({
        shouldFail,
        signal: request.signal
      });

      // Ignore results from outdated requests.
      if (!requestManager.isCurrent(request.id)) {
        return;
      }

      setState((previous) =>
        transition(previous, {
          status: STATUS.SUCCESS,
          data: items
        })
      );
    } catch (error) {
      // Ignore aborted or outdated requests.
      if (
        error.name === 'AbortError' ||
        !requestManager.isCurrent(request.id)
      ) {
        return;
      }

      setState((previous) =>
        transition(previous, {
          status: STATUS.ERROR,
          error: error.message
        })
      );
    }
  };

  switch (state.status) {
    case STATUS.IDLE: {
      const view = renderIdle();

      const buttons = view.props.children.filter(
        (child) => child.type === 'button'
      );

      const loadButton = buttons.find(
        (button) => button.props.id === 'load-button'
      );

      const errorButton = buttons.find(
        (button) =>
          button.props.id === 'simulate-error-button'
      );

      loadButton.props.onClick = () => loadData(false);

      errorButton.props.onClick = () => loadData(true);

      return view;
    }

    case STATUS.LOADING:
      return renderSkeleton();

    case STATUS.SUCCESS:
      return renderSuccess(state.data);

    case STATUS.ERROR: {
      const view = renderError(state.error);

      const retryButton = view.props.children.find(
        (child) =>
          child.type === 'button' &&
          child.props.id === 'retry-button'
      );

      retryButton.props.onClick = () => loadData(false);

      return view;
    }

    default:
      throw new Error(
        `Unknown state: ${state.status}`
      );
  }
}