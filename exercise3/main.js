import { renderApp } from '../exercise2/app-renderer.js';
import { DataFeedApp } from './data-feed.js';

const root = document.getElementById('app');

if (!root) {
  throw new Error('Root element #app was not found');
}

renderApp(root, DataFeedApp);