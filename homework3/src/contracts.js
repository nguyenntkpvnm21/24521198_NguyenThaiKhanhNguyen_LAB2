
export const ReservationStatus = Object.freeze({
  RESERVED: 'RESERVED',
  PURCHASED: 'PURCHASED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED'
});

export const ReservationEvent = Object.freeze({
  CHECKOUT: 'CHECKOUT',
  EXPIRE: 'EXPIRE',
  CANCEL: 'CANCEL'
});

export const VALID_TRANSITIONS = Object.freeze({
  [ReservationStatus.RESERVED]: Object.freeze({
    [ReservationEvent.CHECKOUT]: ReservationStatus.PURCHASED,
    [ReservationEvent.EXPIRE]: ReservationStatus.EXPIRED,
    [ReservationEvent.CANCEL]: ReservationStatus.CANCELLED
  }),

  [ReservationStatus.PURCHASED]: Object.freeze({}),
  [ReservationStatus.EXPIRED]: Object.freeze({}),
  [ReservationStatus.CANCELLED]: Object.freeze({})
});

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {number} totalStock
 */

/**
 * @typedef {Object} Reservation
 * @property {string} id
 * @property {string} productId
 * @property {number} quantity
 * @property {string} status
 * @property {number} createdAt
 * @property {number} expiresAt
 */

/**
 * @typedef {Object} InventorySnapshot
 * @property {number} totalStock
 * @property {number} availableStock
 * @property {number} reservedStock
 * @property {number} soldStock
 */
