
# Homework 3 - Flash-Sale Engine Architecture

## 1. Project Overview

This project simulates a high-concurrency flash-sale
e-commerce application inspired by Vietnam's 11.11
and midnight shopping events.

The application focuses on countdown accuracy,
inventory reservation, lock expiration, and checkout.

## 2. Technology Stack

- HTML5 for semantic page structure
- CSS3 for responsive presentation
- JavaScript ES Modules for application logic
- requestAnimationFrame for countdown rendering
- Node.js built-in test runner for automated testing

## 3. Application Modules

### Timer Engine

File: src/timer.js

Responsibilities:
- Calculate remaining time using Date.now().
- Update the countdown with requestAnimationFrame.
- Prevent negative remaining time.
- Stop updating when the countdown finishes.
- Support explicit cancellation and cleanup.

### Inventory Engine

File: src/inventory.js

Responsibilities:
- Maintain product stock information.
- Create inventory reservations.
- Prevent reservations exceeding available stock.
- Track reservation expiration.
- Release expired or cancelled reservations.
- Confirm successful purchases.
- Enforce valid state transitions.

### Application Controller

File: src/app.js

Responsibilities:
- Initialize the countdown and inventory engine.
- Render product information.
- Handle reservation and checkout interactions.
- Display inventory and reservation status.
- Present readable errors and feedback.

## 4. Reservation State Machine

Reservation states:

- RESERVED: Inventory is temporarily held.
- PURCHASED: Checkout has been completed.
- EXPIRED: Reservation expired before checkout.
- CANCELLED: Reservation was explicitly cancelled.

Valid transitions:

- RESERVED -> PURCHASED
- RESERVED -> EXPIRED
- RESERVED -> CANCELLED

Terminal states:

- PURCHASED
- EXPIRED
- CANCELLED

Expired and cancelled reservations release inventory.
Purchased reservations permanently consume inventory.

## 5. Inventory Invariants

1. Available stock must never be negative.
2. A reservation must have a unique identifier.
3. A reservation cannot be purchased twice.
4. Expired reservations cannot be checked out.
5. A terminal reservation cannot be reactivated.
6. Available, reserved, and sold stock must remain consistent.

Stock consistency:

totalStock = availableStock + reservedStock + soldStock

## 6. Concurrency Strategy

All inventory modifications pass through one
centralized inventory engine.

Each reservation operation must validate stock
availability and update the inventory consistently
without an asynchronous interruption between
validation and mutation.

Expiration and checkout operations must verify
the reservation state and expiration timestamp.

This is a single-runtime concurrency simulation,
not a distributed transaction system.

## 7. Engineering Verification

- Test countdown drift and completion.
- Test reservations when stock is exhausted.
- Test expiration and inventory release.
- Test duplicate checkout attempts.
- Test competing reservation requests.
- Document at least three AI failure modes.

## 8. Git Workflow

Use at least eight atomic Conventional Commits.

Each commit must correspond to a verified
development milestone.
