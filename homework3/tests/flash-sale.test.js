
import test from 'node:test';
import assert from 'node:assert/strict';

import { createFlashSale } from '../src/flash-sale.js';
import { createInventory } from '../src/inventory.js';
import { ReservationStatus } from '../src/contracts.js';

test('flash sale accepts reservations before deadline', () => {
  let currentTime = 1000;

  const sale = createFlashSale({
    endTime: 5000,
    now: () => currentTime
  });

  assert.equal(sale.canReserve(), true);
  assert.equal(sale.getStatus(), 'ACTIVE');

  currentTime = 4999;

  assert.equal(sale.canReserve(), true);
});

test('flash sale rejects reservations at exact deadline', () => {
  let currentTime = 4999;

  const sale = createFlashSale({
    endTime: 5000,
    now: () => currentTime
  });

  currentTime = 5000;

  assert.equal(sale.canReserve(), false);
  assert.equal(sale.getStatus(), 'ENDED');
});

test('existing reservation can checkout after sale ends', () => {
  let currentTime = 1000;

  const sale = createFlashSale({
    endTime: 5000,
    now: () => currentTime
  });

  const inventory = createInventory({
    products: [
      {
        id: 'P01',
        name: 'Flash Deal',
        price: 100000,
        totalStock: 1
      }
    ],
    reservationDuration: 10000,
    now: () => currentTime
  });

  const reservation = inventory.reserve('P01', 1);

  currentTime = 6000;

  assert.equal(sale.canReserve(), false);

  const result = inventory.checkout(reservation.id);

  assert.equal(result.status, ReservationStatus.PURCHASED);
  assert.equal(inventory.getStock('P01').soldStock, 1);
});

test('reservation expires even after flash sale ends', () => {
  let currentTime = 1000;

  const inventory = createInventory({
    products: [
      {
        id: 'P01',
        name: 'Flash Deal',
        price: 100000,
        totalStock: 1
      }
    ],
    reservationDuration: 3000,
    now: () => currentTime
  });

  const reservation = inventory.reserve('P01');

  currentTime = 5000;

  assert.equal(
    inventory.getReservation(reservation.id).status,
    ReservationStatus.EXPIRED
  );

  assert.equal(inventory.getStock('P01').availableStock, 1);
});

test('invalid sale configuration is rejected', () => {
  assert.throws(
    () => createFlashSale({ endTime: NaN }),
    /Invalid sale end time/
  );
});
