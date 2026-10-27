
import {
  ReservationStatus,
  ReservationEvent,
  VALID_TRANSITIONS
} from './contracts.js';

export function createInventory({
  products,
  reservationDuration = 30000,
  now = () => Date.now()
}) {
  if (!Array.isArray(products) || typeof now !== 'function') {
    throw new TypeError('Invalid inventory configuration.');
  }

  if (!Number.isSafeInteger(reservationDuration) ||
      reservationDuration <= 0) {
    throw new RangeError('Invalid reservation duration.');
  }

  const productStore = new Map();
  const reservationStore = new Map();
  let reservationSequence = 0;

  // Validate and initialize products.
  for (const product of products) {
    if (
      typeof product.id !== 'string' ||
      product.id.length === 0 ||
      !Number.isSafeInteger(product.totalStock) ||
      product.totalStock < 0 ||
      productStore.has(product.id)
    ) {
      throw new TypeError('Invalid or duplicate product.');
    }

    productStore.set(product.id, {
      ...product,
      availableStock: product.totalStock,
      reservedStock: 0,
      soldStock: 0
    });
  }

  function getCurrentTime() {
    const timestamp = now();

    if (!Number.isFinite(timestamp)) {
      throw new TypeError('Invalid current time.');
    }

    return timestamp;
  }

  function transition(reservation, event) {
    const nextStatus =
      VALID_TRANSITIONS[reservation.status]?.[event];

    if (!nextStatus) {
      throw new Error(
        `Invalid transition: ${reservation.status} -> ${event}`
      );
    }

    reservation.status = nextStatus;
  }

  function releaseReservation(reservation, event) {
    const product = productStore.get(reservation.productId);

    transition(reservation, event);

    product.reservedStock -= reservation.quantity;
    product.availableStock += reservation.quantity;
  }

  function expireReservationsAt(currentTime) {
    let expiredCount = 0;

    for (const reservation of reservationStore.values()) {
      if (
        reservation.status === ReservationStatus.RESERVED &&
        currentTime >= reservation.expiresAt
      ) {
        releaseReservation(reservation, ReservationEvent.EXPIRE);
        expiredCount++;
      }
    }

    return expiredCount;
  }

  function expireReservations() {
    return expireReservationsAt(getCurrentTime());
  }

  function getProductOrThrow(productId) {
    const product = productStore.get(productId);

    if (!product) {
      throw new Error(`Unknown product: ${productId}`);
    }

    return product;
  }

  function getReservationOrThrow(reservationId) {
    const reservation = reservationStore.get(reservationId);

    if (!reservation) {
      throw new Error(`Unknown reservation: ${reservationId}`);
    }

    return reservation;
  }

  function reserve(productId, quantity = 1) {
    const currentTime = getCurrentTime();
    expireReservationsAt(currentTime);

    const product = getProductOrThrow(productId);

    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new RangeError('Quantity must be a positive integer.');
    }

    if (product.availableStock < quantity) {
      throw new Error('Insufficient stock.');
    }

    const reservationId = `reservation-${++reservationSequence}`;

    const reservation = {
      id: reservationId,
      productId,
      quantity,
      status: ReservationStatus.RESERVED,
      createdAt: currentTime,
      expiresAt: currentTime + reservationDuration
    };

    product.availableStock -= quantity;
    product.reservedStock += quantity;

    reservationStore.set(reservationId, reservation);

    return { ...reservation };
  }

  function checkout(reservationId) {
    const currentTime = getCurrentTime();
    expireReservationsAt(currentTime);

    const reservation = getReservationOrThrow(reservationId);

    if (reservation.status !== ReservationStatus.RESERVED) {
      throw new Error('Reservation is no longer active.');
    }

    const product = getProductOrThrow(reservation.productId);

    transition(reservation, ReservationEvent.CHECKOUT);

    product.reservedStock -= reservation.quantity;
    product.soldStock += reservation.quantity;

    return { ...reservation };
  }

  function cancel(reservationId) {
    const currentTime = getCurrentTime();
    expireReservationsAt(currentTime);

    const reservation = getReservationOrThrow(reservationId);

    if (reservation.status !== ReservationStatus.RESERVED) {
      throw new Error('Reservation is no longer active.');
    }

    releaseReservation(reservation, ReservationEvent.CANCEL);

    return { ...reservation };
  }

  function getStock(productId) {
    expireReservations();

    const product = getProductOrThrow(productId);

    return {
      totalStock: product.totalStock,
      availableStock: product.availableStock,
      reservedStock: product.reservedStock,
      soldStock: product.soldStock
    };
  }

  function getReservation(reservationId) {
    expireReservations();

    return { ...getReservationOrThrow(reservationId) };
  }

  function getProducts() {
    expireReservations();

    return [...productStore.values()].map(product => ({
      ...product
    }));
  }

  return {
    reserve,
    checkout,
    cancel,
    expireReservations,
    getStock,
    getReservation,
    getProducts
  };
}
