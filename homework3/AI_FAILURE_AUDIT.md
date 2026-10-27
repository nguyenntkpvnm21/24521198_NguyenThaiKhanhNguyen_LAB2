
# AI Failure Mode Audit
## Homework 3 - High-Concurrency Flash-Sale Engine

### 1. Overview

This audit examines three common implementation failures
that can occur in AI-generated flash-sale application code.

Each failure mode is evaluated using:
- A deliberately flawed implementation.
- A reproducible test scenario.
- The expected and observed behavior.
- A corrected implementation.
- Automated verification.

The flawed examples are controlled audit fixtures.
They are not claimed to be historical defects observed
in the project repository.

### 2. AF-01: Countdown Timer Drift

**Problem**

A countdown implemented by decrementing a counter
depends on callback execution frequency.

Browsers can delay callbacks when tabs are inactive,
causing the displayed countdown to become inaccurate.

**Flawed approach**

    remaining -= 1000;

**Reproduction scenario**

1. Initialize a countdown with 60 seconds.
2. Simulate a callback delay of 45 seconds.
3. Execute one timer callback.
4. Compare displayed time with actual remaining time.

**Expected behavior**

The timer should report 15 seconds remaining.

**Flawed behavior**

The counter reports 59 seconds remaining.

**Root cause**

The implementation assumes that each callback
corresponds to exactly one second of elapsed time.

**Correction**

Calculate remaining time using an absolute deadline:

    remaining = Math.max(0, endTime - Date.now());

Use requestAnimationFrame only for rendering updates.

**Verification**

Automated test: AF-01 in tests/failure-modes.test.js.

### 3. AF-02: Inventory Overselling

**Problem**

Concurrent reservation requests can oversell inventory
if stock validation and stock modification are separated
by an asynchronous operation.

**Flawed approach**

    if (availableStock > 0) {
      await someAsyncOperation();
      availableStock -= 1;
    }

**Reproduction scenario**

1. Initialize inventory with one available product.
2. Submit two competing reservation requests.
3. Allow both requests to validate stock.
4. Resume both requests and update inventory.

**Expected behavior**

Only one reservation should succeed.

**Flawed behavior**

Both reservations succeed, leaving available stock at -1.

**Root cause**

The check-and-update sequence is not atomic.
Both requests can observe the same available stock.

**Correction**

Centralize reservation operations and perform validation
and mutation synchronously without an await between them.

**Verification**

Automated test: AF-02 in tests/failure-modes.test.js.

**Scope limitation**

The corrected implementation is safe for this
single-runtime simulation. A distributed production
system would require server-side transaction control,
locking, or another atomic inventory mechanism.

### 4. AF-03: Checkout After Reservation Expiration

**Problem**

A checkout operation can incorrectly accept an expired
reservation if it only checks the reservation status.

**Flawed approach**

    if (reservation.status === 'RESERVED') {
      reservation.status = 'PURCHASED';
    }

**Reproduction scenario**

1. Create a reservation with a four-second lifetime.
2. Advance the clock beyond the reservation deadline.
3. Attempt checkout without processing expiration.

**Expected behavior**

Checkout must be rejected, and inventory must be released.

**Flawed behavior**

The expired reservation is marked as PURCHASED.

**Root cause**

The checkout operation does not validate expiration
against the current timestamp.

**Correction**

Process expired reservations before checkout.
Permit checkout only when the reservation remains active.

**Verification**

Automated test: AF-03 in tests/failure-modes.test.js.

### 5. Summary

| ID | Risk | Corrective approach |
| --- | --- | --- |
| AF-01 | Timer drift | Absolute deadline |
| AF-02 | Overselling | Atomic stock update |
| AF-03 | Expired checkout | State and deadline validation |

### 6. Conclusion

AI-generated code must be independently verified,
especially when the system manages time-sensitive
operations and shared inventory.

This audit uses controlled failure examples to
demonstrate three risks and verifies their corrections
through automated tests.
