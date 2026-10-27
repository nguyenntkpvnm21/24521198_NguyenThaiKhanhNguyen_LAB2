
import {
  createCountdown,
  formatCountdown
} from './timer.js';

const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const statusElement = document.getElementById('countdown-status');

// Demo sale duration: 5 minutes from page initialization.
const saleEndTime = Date.now() + 5 * 60 * 1000;

function renderCountdown(milliseconds) {
  const time = formatCountdown(milliseconds);

  hoursElement.textContent = time.hours;
  minutesElement.textContent = time.minutes;
  secondsElement.textContent = time.seconds;
}

const countdown = createCountdown({
  endTime: saleEndTime,

  onTick(remaining) {
    renderCountdown(remaining);
    statusElement.textContent =
      remaining > 0 ? 'Flash sale is active.' : 'Sale has ended.';
  },

  onComplete() {
    statusElement.textContent = 'Flash sale has ended.';
  }
});

countdown.start();

window.addEventListener('pagehide', () => {
  countdown.stop();
});

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    countdown.start();
  }
});
