
/**
 * Audio frequency visualizer using Canvas.
 *
 * Responsibilities:
 * - Read frequency data from AnalyserNode.
 * - Render spectrum bars using Canvas 2D.
 * - Manage requestAnimationFrame lifecycle.
 * - Avoid unnecessary UI state updates.
 */
export class AudioVisualizer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {AnalyserNode} analyser
   */
  constructor(canvas, analyser) {
    if (!canvas || typeof canvas.getContext !== 'function') {
      throw new TypeError('A valid canvas is required');
    }

    if (!analyser || typeof analyser.getByteFrequencyData !== 'function') {
      throw new TypeError('A valid AnalyserNode is required');
    }

    this.canvas = canvas;
    this.context = canvas.getContext('2d');

    if (!this.context) {
      throw new Error('Canvas 2D context is unavailable');
    }

    this.analyser = analyser;
    this.dataArray = new Uint8Array(
      analyser.frequencyBinCount
    );

    this.animationFrameId = null;
    this.isRunning = false;
    this.frame = this.frame.bind(this);
  }

  /**
   * Resize canvas according to its display size.
   */
  resize() {
    const dpr = Math.min(
      globalThis.devicePixelRatio || 1,
      2
    );

    const width = Math.max(
      1,
      Math.floor(this.canvas.clientWidth * dpr)
    );

    const height = Math.max(
      1,
      Math.floor(this.canvas.clientHeight * dpr)
    );

    if (
      this.canvas.width !== width ||
      this.canvas.height !== height
    ) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  /**
   * Draw one frequency spectrum frame.
   */
  draw() {
    this.resize();

    const { width, height } = this.canvas;
    const ctx = this.context;

    ctx.clearRect(0, 0, width, height);

    this.analyser.getByteFrequencyData(
      this.dataArray
    );

    const barCount = this.dataArray.length;
    const gap = Math.max(1, width * 0.002);

    const barWidth = Math.max(
      1,
      (width - gap * (barCount - 1)) / barCount
    );

    for (let i = 0; i < barCount; i++) {
      const value = this.dataArray[i] / 255;
      const barHeight = Math.max(2, value * height);

      const x = i * (barWidth + gap);
      const y = height - barHeight;

      const hue = 200 + (i / barCount) * 100;

      ctx.fillStyle = `hsl(${hue}, 85%, 60%)`;
      ctx.fillRect(
        x,
        y,
        barWidth,
        barHeight
      );
    }
  }

  /**
   * Schedule the next animation frame.
   */
  frame() {
    if (!this.isRunning) {
      return;
    }

    this.draw();

    if (this.isRunning) {
      this.animationFrameId =
        requestAnimationFrame(this.frame);
    }
  }

  /**
   * Start visualization.
   *
   * @returns {boolean}
   */
  start() {
    if (this.isRunning) {
      return false;
    }

    this.isRunning = true;

    this.animationFrameId =
      requestAnimationFrame(this.frame);

    return true;
  }

  /**
   * Stop visualization and cancel animation.
   *
   * @returns {boolean}
   */
  stop() {
    if (!this.isRunning) {
      return false;
    }

    this.isRunning = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    return true;
  }

  /**
   * Release visualizer resources.
   */
  dispose() {
    this.stop();

    this.context.clearRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }
}
