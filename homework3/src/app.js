
import { createCountdown, formatCountdown } from './timer.js';
import { createInventory } from './inventory.js';
import { ReservationStatus } from './contracts.js';
import { PRODUCTS } from './products.js';
import { createFlashSale } from './flash-sale.js';

const SALE_DURATION = 5 * 60 * 1000;
const RESERVATION_DURATION = 30 * 1000;

const inventory = createInventory({
  products: PRODUCTS,
  reservationDuration: RESERVATION_DURATION
});

const elements = {
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds'),
  countdownStatus: document.getElementById('countdown-status'),
  saleBadge: document.getElementById('sale-badge'),
  products: document.getElementById('products'),
  reservations: document.getElementById('reservations'),
  activityLog: document.getElementById('activity-log'),
  appMessage: document.getElementById('app-message')
};

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
});

const saleEndTime = Date.now() + SALE_DURATION;
const flashSale = createFlashSale({
  endTime: saleEndTime
});
const reservationIds = [];
const activityEntries = [];

let saleEnded = false;

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = String(text);
  }

  return element;
}

function addActivity(message) {
  const timestamp = new Date().toLocaleTimeString('en-GB');

  activityEntries.unshift(`${timestamp} - ${message}`);

  if (activityEntries.length > 10) {
    activityEntries.pop();
  }

  elements.activityLog.replaceChildren(
    ...activityEntries.map(entry => createElement('li', '', entry))
  );

  elements.appMessage.textContent = message;
}

function createButton(label, className, action, disabled = false) {
  const button = createElement('button', className, label);
  button.type = 'button';
  button.dataset.action = action;
  button.disabled = disabled;
  return button;
}

function renderProducts() {
  const cards = inventory.getProducts().map(product => {
    const card = createElement('article', 'product-card');

    const icon = createElement('div', 'product-icon', product.icon);
    icon.setAttribute('aria-hidden', 'true');

    const title = createElement('h3', '', product.name);
    const description = createElement(
      'p',
      'product-description',
      product.description
    );

    const pricing = createElement('div', 'pricing');
    pricing.append(
      createElement('span', 'price', currency.format(product.price)),
      createElement(
        'span',
        'original-price',
        currency.format(product.originalPrice)
      )
    );

    const stock = createElement(
      'p',
      product.availableStock <= 2 ? 'stock low-stock' : 'stock',
      `${product.availableStock} available / ${product.totalStock} total`
    );

    const reserveButton = createButton(
      'Reserve Now',
      'primary-button',
      'reserve',
      !flashSale.canReserve() || product.availableStock === 0
    );

    reserveButton.dataset.productId = product.id;

    card.append(
      icon,
      title,
      description,
      pricing,
      stock,
      reserveButton
    );

    return card;
  });

  elements.products.replaceChildren(...cards);
}

function renderReservations() {
  const cards = reservationIds.map(id => {
    const reservation = inventory.getReservation(id);
    const product = PRODUCTS.find(
      item => item.id === reservation.productId
    );

    const card = createElement('article', 'reservation-card');
    const info = createElement('div', 'reservation-info');

    info.append(
      createElement('h3', '', product.name),
      createElement('p', '', `Quantity: ${reservation.quantity}`)
    );

    const status = createElement(
      'p',
      `reservation-status ${reservation.status.toLowerCase()}`,
      reservation.status
    );

    info.append(status);

    
if (reservation.status === ReservationStatus.RESERVED) {
  const seconds = Math.ceil(
    Math.max(0, reservation.expiresAt - Date.now()) / 1000
  );

  const countdownText = createElement(
    'p',
    'reservation-countdown',
    `Expires in ${seconds}s`
  );

  countdownText.dataset.reservationCountdown = reservation.id;

  info.append(countdownText);
}


    const actions = createElement('div', 'reservation-actions');

    if (reservation.status === ReservationStatus.RESERVED) {
      const checkoutButton = createButton(
  'Checkout',
  'primary-button',
  'checkout'
);

      checkoutButton.dataset.reservationId = reservation.id;

      const cancelButton = createButton(
        'Cancel',
        'secondary-button',
        'cancel'
      );

      cancelButton.dataset.reservationId = reservation.id;

      actions.append(checkoutButton, cancelButton);
    }

    card.append(info, actions);
    return card;
  });

  if (cards.length === 0) {
    elements.reservations.replaceChildren(
      createElement('p', 'empty-message', 'No reservations yet.')
    );
    return;
  }

  elements.reservations.replaceChildren(...cards);
}

function refreshUI() {
  renderProducts();
  renderReservations();
}

function handleReserve(productId) {
  if (!flashSale.canReserve()) {
    addActivity('Flash sale has ended. New reservations are disabled.');
    return;
  }

  try {
    const reservation = inventory.reserve(productId, 1);

    reservationIds.push(reservation.id);

    addActivity(`Reservation created: ${reservation.id}`);
    refreshUI();
  } catch (error) {
    addActivity(`Reservation failed: ${error.message}`);
    refreshUI();
  }
}

function handleCheckout(reservationId) {
  try {
    inventory.checkout(reservationId);

    addActivity(`Purchase completed: ${reservationId}`);
    refreshUI();
  } catch (error) {
    addActivity(`Checkout failed: ${error.message}`);
    refreshUI();
  }
}

function handleCancel(reservationId) {
  try {
    inventory.cancel(reservationId);

    addActivity(`Reservation cancelled: ${reservationId}`);
    refreshUI();
  } catch (error) {
    addActivity(`Cancellation failed: ${error.message}`);
    refreshUI();
  }
}

// One delegated click listener handles all dynamic buttons.
document.querySelector('.app').addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');

  if (!button || !elements.products.contains(button) &&
      !elements.reservations.contains(button)) {
    return;
  }

  const action = button.dataset.action;

  if (action === 'reserve') {
    handleReserve(button.dataset.productId);
  } else if (action === 'checkout') {
    handleCheckout(button.dataset.reservationId);
  } else if (action === 'cancel') {
    handleCancel(button.dataset.reservationId);
  }
});

function renderCountdown(remaining) {
  const formatted = formatCountdown(remaining);

  elements.hours.textContent = formatted.hours;
  elements.minutes.textContent = formatted.minutes;
  elements.seconds.textContent = formatted.seconds;
}

const countdown = createCountdown({
  endTime: saleEndTime,

  onTick(remaining) {
    renderCountdown(remaining);

    if (remaining > 0) {
      elements.countdownStatus.textContent = 'Flash sale is active.';
    }
  },

  onComplete() {
    saleEnded = true;
    elements.saleBadge.textContent = 'ENDED';
    elements.saleBadge.classList.add('ended');
    elements.countdownStatus.textContent = 'Flash sale has ended.';

    addActivity('Flash sale ended.');
    refreshUI();
  }
});

// Refresh reservation expiry without recreating the full page every frame.

function updateReservationCountdowns() {
  const activeReservations = elements.reservations.querySelectorAll(
    '[data-reservation-countdown]'
  );

  for (const countdownElement of activeReservations) {
    const reservationId = countdownElement.dataset.reservationCountdown;
    const reservation = inventory.getReservation(reservationId);

    if (reservation.status !== ReservationStatus.RESERVED) {
      continue;
    }

    const remaining = Math.max(
      0,
      reservation.expiresAt - Date.now()
    );

    const seconds = Math.ceil(remaining / 1000);

    countdownElement.textContent = `Expires in ${seconds}s`;
  }
}

const refreshInterval = window.setInterval(() => {
  const expiredCount = inventory.expireReservations();

  if (expiredCount > 0) {
    addActivity(`${expiredCount} reservation(s) expired.`);
    refreshUI();
  } else {
    updateReservationCountdowns();
  }
}, 1000);


window.addEventListener('pagehide', () => {
  countdown.stop();
});


window.addEventListener('pageshow', event => {
  if (!event.persisted) {
    return;
  }

  countdown.start();

  if (!flashSale.isActive() && !saleEnded) {
    saleEnded = true;
    elements.saleBadge.textContent = 'ENDED';
    elements.saleBadge.classList.add('ended');
    elements.countdownStatus.textContent = 'Flash sale has ended.';
  }

  const expiredCount = inventory.expireReservations();

  if (expiredCount > 0) {
    addActivity(`${expiredCount} reservation(s) expired.`);
  }

  refreshUI();
});


refreshUI();
addActivity('Flash sale initialized.');
countdown.start();
