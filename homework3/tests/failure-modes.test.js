
import test from 'node:test';
import assert from 'node:assert/strict';

import { createCountdown } from '../src/timer.js';
import { createInventory } from '../src/inventory.js';

// AF-01: Timer drift caused by decrementing a counter.
test('AF-01: timestamp calculation prevents timer drift', () => {
  let actualTime = 0;
  let flawedRemaining = 60000;

  // Simulate one delayed callback after 45 seconds.
  actualTime += 45000;
  flawedRemaining -= 1000;

  assert.equal(flawedRemaining, 59000);

  let correctRemaining = null;

  const timer = createCountdown({
    endTime: 60000,
    now: () => actualTime,
    onTick: value => {
      correctRemaining = value;
    },
    requestFrame: () => 1,
    cancelFrame: () => {}
  });

  timer.start();

  assert.equal(correctRemaining, 15000);
  timer.stop();
});

// AF-02: Concurrent requests validate stock before awaiting.
test('AF-02: asynchronous check-then-update can oversell', async () => {
  const flawedStock = { available: 1, reserved: 0 };

  async function flawedReserve() {
    if (flawedStock.available <= 0) {
      return false;
    }

    // Another request can enter while this request is paused.
    await Promise.resolve();

    flawedStock.available -= 1;
    flawedStock.reserved += 1;

    return true;
  }

  const flawedResults = await Promise.all([
    flawedReserve(),
    flawedReserve()
  ]);

  assert.equal(flawedResults.filter(Boolean).length, 2);
  assert.equal(flawedStock.available, -1);

  // Correct approach: centralized synchronous reservation.
  const inventory = createInventory({
    products: [
      {
        id: 'P01',
        name: 'Flash Sale Product',
        price: 100000,
        totalStock: 1
      }
    ]
  });

  const results = await Promise.all(
    [1, 2].map(async () => {
      try {
        return inventory.reserve('P01', 1);
      } catch {
        return null;
      }
    })
  );

  assert.equal(results.filter(Boolean).length, 1);
  assert.equal(inventory.getStock('P01').availableStock, 0);
});

// AF-03: Checkout ignores reservation expiration.
test('AF-03: expired reservation must not be purchased', () => {
  const flawedReservation = {
    status: 'RESERVED',
    expiresAt: 5000
  };

  // Flawed checkout verifies only the status.
  function flawedCheckout(reservation) {
    if (reservation.status !== 'RESERVED') {
      return false;
    }

    reservation.status = 'PURCHASED';
    return true;
  }

  assert.equal(flawedCheckout(flawedReservation), true);

  let currentTime = 1000;

  const inventory = createInventory({
    products: [
      {
        id: 'P01',
        name: 'Flash Sale Product',
        price: 100000,
        totalStock: 1
      }
    ],
    reservationDuration: 4000,
    now: () => currentTime
  });

  const reservation = inventory.reserve('P01', 1);

  currentTime = 6000;

  assert.throws(
    () => inventory.checkout(reservation.id),
    /no longer active/
  );

  assert.equal(inventory.getStock('P01').soldStock, 0);
});
