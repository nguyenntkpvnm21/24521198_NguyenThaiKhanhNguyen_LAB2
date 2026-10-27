
/**
 * Web Audio Engine
 *
 * Responsibilities:
 * - Initialize and manage AudioContext.
 * - Fetch and decode audio.
 * - Play, stop, and switch tracks.
 * - Manage audio source lifecycle.
 * - Expose AnalyserNode for visualization.
 */
export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.currentSource = null;
    this.currentBuffer = null;
    this.onPlaybackEnded = null;
  }

  /**
   * Initialize the Web Audio API.
   *
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.audioContext) {
      return;
    }

    this.audioContext = new AudioContext();

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    this.analyser.connect(
      this.audioContext.destination
    );
  }

  /**
   * Fetch and decode an audio file.
   *
   * @param {string} trackUrl
   * @param {AbortSignal} signal
   * @returns {Promise<AudioBuffer>}
   */
  async loadAudio(trackUrl, signal) {
    if (!this.audioContext) {
      throw new Error(
        'AudioEngine must be initialized first'
      );
    }

    const response = await fetch(trackUrl, { signal });

    if (!response.ok) {
      throw new Error(
        `Audio request failed: HTTP ${response.status}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    if (signal?.aborted) {
      throw new DOMException(
        'Audio loading was cancelled',
        'AbortError'
      );
    }

    const audioBuffer =
      await this.audioContext.decodeAudioData(arrayBuffer);

    if (signal?.aborted) {
      throw new DOMException(
        'Audio decoding result was cancelled',
        'AbortError'
      );
    }

    return audioBuffer;
  }

  /**
   * Play an AudioBuffer.
   * Stops the previous source if one exists.
   *
   * @param {AudioBuffer} audioBuffer
   * @returns {Promise<void>}
   */
  async play(audioBuffer) {
    if (!this.audioContext || !this.analyser) {
      throw new Error(
        'AudioEngine must be initialized first'
      );
    }

    if (!audioBuffer) {
      throw new TypeError(
        'audioBuffer is required'
      );
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.stop();

    const source = this.audioContext.createBufferSource();

    source.buffer = audioBuffer;
    source.connect(this.analyser);

    

source.onended = () => {
  const wasCurrentSource = this.currentSource === source;

  if (wasCurrentSource) {
    this.currentSource = null;
    this.currentBuffer = null;
  }

  source.disconnect();
  source.onended = null;

  if (
    wasCurrentSource &&
    typeof this.onPlaybackEnded === 'function'
  ) {
    this.onPlaybackEnded();
  }
};



    this.currentSource = source;
    this.currentBuffer = audioBuffer;

    try {
      source.start(0);
    } catch (error) {
      if (this.currentSource === source) {
        this.currentSource = null;
        this.currentBuffer = null;
      }

      source.onended = null;
      source.disconnect();

      throw error;
    }
  }

  /**
   * Stop current playback and release the source.
   *
   * @returns {boolean}
   */
  stop() {
    if (!this.currentSource) {
      return false;
    }

    const source = this.currentSource;

    this.currentSource = null;
    this.currentBuffer = null;

    source.onended = null;

    try {
      source.stop(0);
    } catch (error) {
      if (error.name !== 'InvalidStateError') {
        throw error;
      }
    } finally {
      source.disconnect();
    }

    return true;
  }

  /**
   * Check whether a source is currently active.
   *
   * @returns {boolean}
   */
  isPlaying() {
    return this.currentSource !== null;
  }

  /**
   * Return analyser for the visualizer.
   *
   * @returns {AnalyserNode|null}
   */
  getAnalyser() {
    return this.analyser;
  }

  /**
   * Release audio resources.
   *
   * @returns {Promise<void>}
   */
  async dispose() {
    this.stop();

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    if (this.audioContext) {
      const context = this.audioContext;
      this.audioContext = null;

      if (context.state !== 'closed') {
        await context.close();
      }
    }

    this.currentBuffer = null;
  }
}
