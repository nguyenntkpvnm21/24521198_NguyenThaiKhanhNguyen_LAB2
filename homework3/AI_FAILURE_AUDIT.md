
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


---

## 7. AF-04: Keyboard Focus Loss After DOM Replacement

### Detected issue

During keyboard interaction, the application rebuilt
the product and reservation controls using
replaceChildren().

The original focused button was removed from the DOM,
which could cause keyboard focus to return to BODY.

### Affected implementation

The initial refreshUI() implementation called
renderProducts() and renderReservations() without
preserving the identity of the activated control.

An earlier focus-restoration attempt was introduced
in commit 0d03b3b, but its behavior required
additional investigation.

### Root cause

The UI replaced interactive DOM elements during
reservation updates. Relying on document.activeElement
inside refreshUI() was insufficiently reliable for
preserving the activated control across updates.

### Manual correction

The event delegation handler now captures the
activated button's action, productId and reservationId.

This focusTarget is forwarded to the appropriate
action handler and then to refreshUI(focusTarget).

After rendering, the application searches for a
matching enabled control and restores focus.

If the original control is unavailable, a suitable
reservation card or section heading is used instead.

### Verification

The issue was investigated using Chrome DevTools
and document.activeElement.

Observed before the final correction:

- beforeTag: BUTTON
- beforeAction: reserve
- afterTag: BODY
- afterAction: undefined
- oldElementConnected: false

Observed after the final correction:

- The replacement Reserve button received focus.
- The focused control retained its reserve action.
- The focus-restoration debug check succeeded.

The corrected version was verified using the
current application served at localhost:8765.

### Engineering lesson

Replacing interactive DOM nodes requires explicit
focus management. Capturing the activated control's
identity before updating the DOM is more reliable
than relying only on document.activeElement during
the rendering process.
