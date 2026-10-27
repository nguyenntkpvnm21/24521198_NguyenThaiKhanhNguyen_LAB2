
import test from 'node:test';
import assert from 'node:assert/strict';

import { createInventory } from '../src/inventory.js';
import { ReservationStatus } from '../src/contracts.js';

function createTestInventory({
  stock = 5,
  duration = 30000
} = {}) {
  let currentTime = 100000;

  const inventory = createInventory({
    products: [
      {
        id: 'P01',
        name: 'Flash Sale Headphones',
        price: 299000,
        totalStock: stock
      }
    ],
    reservationDuration: duration,
    now: () => currentTime
  });

  return {
    inventory,
    advanceTime(milliseconds) {
      currentTime += milliseconds;
    }
  };
}

function assertStockInvariant(stock) {
  assert.equal(
    stock.totalStock,
    stock.availableStock + stock.reservedStock + stock.soldStock
  );

  assert.ok(stock.availableStock >= 0);
  assert.ok(stock.reservedStock >= 0);
  assert.ok(stock.soldStock >= 0);
}

// Test 1: Successful reservation
test('reserving products updates inventory correctly', () => {
  const { inventory } = createTestInventory();

  const reservation = inventory.reserve('P01', 2);
  const stock = inventory.getStock('P01');

  assert.equal(reservation.status, ReservationStatus.RESERVED);
  assert.equal(stock.availableStock, 3);
  assert.equal(stock.reservedStock, 2);
  assert.equal(stock.soldStock, 0);

  assertStockInvariant(stock);
});

// Test 2: Insufficient stock
test('reservation cannot exceed available stock', () => {
  const { inventory } = createTestInventory({ stock: 2 });

  inventory.reserve('P01', 2);

  assert.throws(
    () => inventory.reserve('P01', 1),
    /Insufficient stock/
  );

  assertStockInvariant(inventory.getStock('P01'));
});

// Test 3: Reservation expiration
test('expired reservation releases inventory', () => {
  const { inventory, advanceTime } = createTestInventory({
    stock: 3,
    duration: 10000
  });

  const reservation = inventory.reserve('P01', 2);

  advanceTime(10000);

  const updated = inventory.getReservation(reservation.id);
  const stock = inventory.getStock('P01');

  assert.equal(updated.status, ReservationStatus.EXPIRED);
  assert.equal(stock.availableStock, 3);
  assert.equal(stock.reservedStock, 0);

  assertStockInvariant(stock);
});

// Test 4: Successful checkout
test('checkout moves reserved inventory into sold inventory', () => {
  const { inventory } = createTestInventory();

  const reservation = inventory.reserve('P01', 2);
  const purchased = inventory.checkout(reservation.id);
  const stock = inventory.getStock('P01');

  assert.equal(purchased.status, ReservationStatus.PURCHASED);
  assert.equal(stock.availableStock, 3);
  assert.equal(stock.reservedStock, 0);
  assert.equal(stock.soldStock, 2);

  assertStockInvariant(stock);
});

// Test 5: Duplicate checkout
test('reservation cannot be checked out twice', () => {
  const { inventory } = createTestInventory();

  const reservation = inventory.reserve('P01', 1);

  inventory.checkout(reservation.id);

  assert.throws(
    () => inventory.checkout(reservation.id),
    /no longer active/
  );

  assert.equal(inventory.getStock('P01').soldStock, 1);
});

// Test 6: Expired checkout
test('expired reservation cannot be purchased', () => {
  const { inventory, advanceTime } = createTestInventory({
    duration: 5000
  });

  const reservation = inventory.reserve('P01', 1);

  advanceTime(6000);

  assert.throws(
    () => inventory.checkout(reservation.id),
    /no longer active/
  );

  assert.equal(inventory.getStock('P01').soldStock, 0);
});

// Test 7: Cancel reservation
test('cancelling a reservation releases inventory', () => {
  const { inventory } = createTestInventory();

  const reservation = inventory.reserve('P01', 2);
  const cancelled = inventory.cancel(reservation.id);

  assert.equal(cancelled.status, ReservationStatus.CANCELLED);

  const stock = inventory.getStock('P01');

  assert.equal(stock.availableStock, 5);
  assert.equal(stock.reservedStock, 0);

  assertStockInvariant(stock);
});

// Test 8: Competing purchase requests
test('competing requests cannot oversell inventory', async () => {
  const { inventory } = createTestInventory({ stock: 3 });

  const requests = Array.from({ length: 20 }, () =>
    Promise.resolve().then(() => {
      try {
        return inventory.reserve('P01', 1);
      } catch {
        return null;
      }
    })
  );

  const results = await Promise.all(requests);
  const successful = results.filter(Boolean);

  assert.equal(successful.length, 3);

  const stock = inventory.getStock('P01');

  assert.equal(stock.availableStock, 0);
  assert.equal(stock.reservedStock, 3);

  assertStockInvariant(stock);
});

// Test 9: Checkout at expiration boundary
test('checkout at exact expiration time is rejected', () => {
  const { inventory, advanceTime } = createTestInventory({
    duration: 10000
  });

  const reservation = inventory.reserve('P01', 1);

  advanceTime(10000);

  assert.throws(
    () => inventory.checkout(reservation.id),
    /no longer active/
  );

  assert.equal(
    inventory.getReservation(reservation.id).status,
    ReservationStatus.EXPIRED
  );
});

// Test 10: Invalid quantity
test('invalid reservation quantities are rejected', () => {
  const { inventory } = createTestInventory();

  for (const quantity of [0, -1, 1.5, NaN]) {
    assert.throws(
      () => inventory.reserve('P01', quantity),
      /positive integer/
    );
  }

  assert.equal(inventory.getStock('P01').availableStock, 5);
});

// Test 11: Inventory snapshots cannot mutate internal state
test('returned snapshots cannot modify inventory internally', () => {
  const { inventory } = createTestInventory();

  const product = inventory.getProducts()[0];

  product.availableStock = 1000;

  assert.equal(inventory.getStock('P01').availableStock, 5);

  const reservation = inventory.reserve('P01', 1);

  reservation.status = ReservationStatus.PURCHASED;

  assert.equal(
    inventory.getReservation(reservation.id).status,
    ReservationStatus.RESERVED
  );
});

// Test 12: Expiration followed by a new reservation
test('expired inventory can be reserved again', () => {
  const { inventory, advanceTime } = createTestInventory({
    stock: 1,
    duration: 5000
  });

  const first = inventory.reserve('P01', 1);

  advanceTime(5000);

  const second = inventory.reserve('P01', 1);

  assert.notEqual(first.id, second.id);
  assert.equal(inventory.getStock('P01').availableStock, 0);
  assert.equal(inventory.getStock('P01').reservedStock, 1);

  assertStockInvariant(inventory.getStock('P01'));
});
