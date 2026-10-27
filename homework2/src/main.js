
import { AudioTaskQueue } from './audio-task-queue.js';
import { AudioEngine } from './audio-engine.js';
import { AudioVisualizer } from './audio-visualizer.js';

const elements = {
  input: document.getElementById('track-url'),
  enqueue: document.getElementById('enqueue-button'),
  play: document.getElementById('play-button'),
  stop: document.getElementById('stop-button'),
  cancel: document.getElementById('cancel-button'),
  clear: document.getElementById('clear-button'),
  status: document.getElementById('status-message'),
  queueList: document.getElementById('queue-list'),
  queueCount: document.getElementById('queue-count'),
  canvas: document.getElementById('audio-canvas')
};

const audioEngine = new AudioEngine();

const audioQueue = new AudioTaskQueue(
  (url, signal) => audioEngine.loadAudio(url, signal)
);

let visualizer = null;
let loadedBuffer = null;
let loadedTrackUrl = '';

const tasks = [];

function setStatus(message) {
  elements.status.textContent = message;
}

function getTrackName(trackUrl) {
  try {
    const url = new URL(trackUrl, window.location.href);
    return decodeURIComponent(
      url.pathname.split('/').pop()
    ) || trackUrl;
  } catch {
    return trackUrl;
  }
}

function updateButtons() {
  elements.play.disabled = !loadedBuffer;
  elements.stop.disabled = !audioEngine.isPlaying();

  elements.cancel.disabled =
    !audioQueue.activeController;

  elements.clear.disabled =
    !tasks.some((task) => task.status === 'PENDING');
}

function renderQueue() {
  elements.queueList.replaceChildren();

  const visibleTasks = tasks.filter(
    (task) =>
      task.status === 'PENDING' ||
      task.status === 'LOADING'
  );

  if (visibleTasks.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-message';
    empty.textContent = 'No audio tasks in the queue.';
    elements.queueList.appendChild(empty);
  }

  for (const task of visibleTasks) {
    const item = document.createElement('li');

    item.textContent =
      `${task.status}: ${getTrackName(task.url)}`;

    elements.queueList.appendChild(item);
  }

  const pendingCount = visibleTasks.filter(
    (task) => task.status === 'PENDING'
  ).length;

  elements.queueCount.textContent =
    `${pendingCount} pending`;

  updateButtons();
}

function syncTaskStates() {
  const activeTask = tasks.find(
    (task) => task.status === 'LOADING'
  );

  if (!activeTask && audioQueue.isProcessing) {
    const nextTask = tasks.find(
      (task) => task.status === 'PENDING'
    );

    if (nextTask) {
      nextTask.status = 'LOADING';
    }
  }

  renderQueue();
}

async function initializeAudio() {
  await audioEngine.initialize();

  if (!visualizer) {
    visualizer = new AudioVisualizer(
      elements.canvas,
      audioEngine.getAnalyser()
    );
  }
}

async function addTrack(url) {
  const task = {
    id: crypto.randomUUID(),
    url,
    status: audioQueue.isProcessing
      ? 'PENDING'
      : 'LOADING'
  };

  tasks.push(task);

  const promise = audioQueue.enqueue(url);

  syncTaskStates();

  try {
    const buffer = await promise;

    task.status = 'SUCCESS';

    loadedBuffer = buffer;
    loadedTrackUrl = url;

    setStatus(`Loaded: ${getTrackName(url)}`);
  } catch (error) {
    task.status =
      error.name === 'AbortError'
        ? 'CANCELLED'
        : 'ERROR';

    setStatus(
      `${task.status}: ${getTrackName(url)}`
    );
  } finally {
    const index = tasks.findIndex(
      (item) => item.id === task.id
    );

    if (index !== -1) {
      tasks.splice(index, 1);
    }

    const nextTask = tasks.find(
      (item) => item.status === 'PENDING'
    );

    if (nextTask && audioQueue.isProcessing) {
      nextTask.status = 'LOADING';
    }

    renderQueue();
  }
}

async function playTrack() {
  if (!loadedBuffer) {
    setStatus('Load an audio track first.');
    return;
  }

  await audioEngine.play(loadedBuffer);
  visualizer.start();

  setStatus(
    `Playing: ${getTrackName(loadedTrackUrl)}`
  );

  updateButtons();
}

function stopTrack() {
  audioEngine.stop();
  visualizer?.stop();

  setStatus('Playback stopped.');
  updateButtons();
}



audioEngine.onPlaybackEnded = () => {

  visualizer?.stop();

  setStatus('Playback finished.');
  updateButtons();
};



elements.enqueue.addEventListener('click', async () => {
  const url = elements.input.value.trim();

  if (!url) {
    setStatus('Enter an audio file URL.');
    return;
  }

  try {
    await initializeAudio();
  } catch (error) {
    setStatus(`Initialization failed: ${error.message}`);
    return;
  }

  setStatus(`Queued: ${getTrackName(url)}`);

  void addTrack(url);
  elements.input.value = '';
});

elements.input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    elements.enqueue.click();
  }
});

elements.play.addEventListener('click', async () => {
  try {
    await playTrack();
  } catch (error) {
    setStatus(`Playback failed: ${error.message}`);
  }
});

elements.stop.addEventListener('click', stopTrack);

elements.cancel.addEventListener('click', () => {
  if (audioQueue.cancelActive()) {
    setStatus('Cancelling active audio task...');
  }

  updateButtons();
});

elements.clear.addEventListener('click', () => {
  const count = audioQueue.clearPending();

  for (const task of tasks) {
    if (task.status === 'PENDING') {
      task.status = 'CANCELLED';
    }
  }

  setStatus(`Cancelled ${count} pending task(s).`);
  renderQueue();
});

window.addEventListener('pagehide', () => {
  audioQueue.cancelActive();
  audioQueue.clearPending();

  visualizer?.dispose();
  void audioEngine.dispose();
});

renderQueue();
setStatus('Ready to load audio.');
