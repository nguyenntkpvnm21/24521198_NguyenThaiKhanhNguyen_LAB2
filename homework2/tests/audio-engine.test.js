
import test from 'node:test';
import assert from 'node:assert/strict';

import { AudioEngine } from '../src/audio-engine.js';

test('AudioEngine initializes with empty resources', () => {
  const engine = new AudioEngine();

  assert.equal(engine.audioContext, null);
  assert.equal(engine.analyser, null);
  assert.equal(engine.currentSource, null);
  assert.equal(engine.currentBuffer, null);
});

test('loadAudio requires initialization', async () => {
  const engine = new AudioEngine();

  await assert.rejects(
    engine.loadAudio('track.mp3'),
    /AudioEngine must be initialized first/
  );
});

test('getAnalyser returns null before initialization', () => {
  const engine = new AudioEngine();

  assert.equal(engine.getAnalyser(), null);
});

test('play requires engine initialization', async () => {
  const engine = new AudioEngine();

  await assert.rejects(
    engine.play({}),
    /AudioEngine must be initialized first/
  );
});

test('stop returns false when nothing is playing', () => {
  const engine = new AudioEngine();

  assert.equal(engine.stop(), false);
  assert.equal(engine.isPlaying(), false);
});

test('stop disconnects and clears active source', () => {
  const engine = new AudioEngine();

  let stopped = false;
  let disconnected = false;

  engine.currentSource = {
    onended: null,
    stop() {
      stopped = true;
    },
    disconnect() {
      disconnected = true;
    }
  };

  engine.currentBuffer = {};

  assert.equal(engine.stop(), true);
  assert.equal(stopped, true);
  assert.equal(disconnected, true);
  assert.equal(engine.currentSource, null);
  assert.equal(engine.currentBuffer, null);
});

test('dispose clears audio resources', async () => {
  const engine = new AudioEngine();

  let analyserDisconnected = false;
  let contextClosed = false;

  engine.analyser = {
    disconnect() {
      analyserDisconnected = true;
    }
  };

  engine.audioContext = {
    state: 'running',
    async close() {
      contextClosed = true;
    }
  };

  await engine.dispose();

  assert.equal(analyserDisconnected, true);
  assert.equal(contextClosed, true);
  assert.equal(engine.audioContext, null);
  assert.equal(engine.analyser, null);
});

function createMockAudioEngine() {
  const engine = new AudioEngine();
  const sources = [];

  const analyser = {
    connect() {},
    disconnect() {}
  };

  engine.analyser = analyser;

  engine.audioContext = {
    state: 'running',

    createBufferSource() {
      const source = {
        buffer: null,
        onended: null,
        connected: false,
        disconnected: false,
        started: false,
        stopped: false,

        connect() {
          this.connected = true;
        },

        disconnect() {
          this.disconnected = true;
        },

        start() {
          this.started = true;
        },

        stop() {
          this.stopped = true;
        }
      };

      sources.push(source);
      return source;
    }
  };

  return { engine, sources };
}

test('play creates and starts an audio source', async () => {
  const { engine, sources } = createMockAudioEngine();
  const buffer = { duration: 8 };

  await engine.play(buffer);

  assert.equal(sources.length, 1);
  assert.equal(sources[0].started, true);
  assert.equal(sources[0].connected, true);
  assert.equal(engine.currentBuffer, buffer);
  assert.equal(engine.isPlaying(), true);
});

test('playing another track stops the previous source', async () => {
  const { engine, sources } = createMockAudioEngine();

  await engine.play({ duration: 8 });
  await engine.play({ duration: 5 });

  assert.equal(sources.length, 2);
  assert.equal(sources[0].stopped, true);
  assert.equal(sources[0].disconnected, true);
  assert.equal(sources[1].started, true);
  assert.equal(engine.currentSource, sources[1]);
});

test('natural playback completion releases source', async () => {
  const { engine, sources } = createMockAudioEngine();

  let callbackCount = 0;

  engine.onPlaybackEnded = () => {
    callbackCount++;
  };

  await engine.play({ duration: 8 });

  const source = sources[0];

  source.onended();

  assert.equal(engine.currentSource, null);
  assert.equal(engine.currentBuffer, null);
  assert.equal(engine.isPlaying(), false);
  assert.equal(source.disconnected, true);
  assert.equal(callbackCount, 1);
});

test('manual stop does not trigger playback ended callback', async () => {
  const { engine } = createMockAudioEngine();

  let callbackCount = 0;

  engine.onPlaybackEnded = () => {
    callbackCount++;
  };

  await engine.play({ duration: 8 });

  assert.equal(engine.stop(), true);
  assert.equal(engine.isPlaying(), false);
  assert.equal(callbackCount, 0);
});
