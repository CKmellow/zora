# Frontend API Endpoint Guide

Base URL (local): `http://127.0.0.1:8000`
API v1 prefix: `/api/v1`

This file lists only endpoints that are confirmed working in implementation and tests.
Current confirmed scope: Feature 1, Feature 2, and auth signup/login.

## Authentication

### POST /api/v1/auth/signup
- Purpose: create one user account that can act as buyer, seller, or both.
- Auth: none.
- Request body (frontend fields to collect):
```json
{
  "email": "user@example.com",
  "password": "StrongPass123",
  "full_name": "Jane Doe",
  "phone_number": "254700111222",
  "wants_to_buy": true,
  "wants_to_sell": false,
  "store_name": null,
  "till_number": null
}
```
- Notes:
  - `email`, `password` are required.
  - For seller-on-signup, set `wants_to_sell=true` and include `store_name`; store gets created automatically.
  - A user can be both buyer and seller from day one.
- Returns: bearer token plus role flags (`is_buyer`, `is_seller`) for frontend routing.

### POST /api/v1/auth/login
- Purpose: sign in existing user and issue bearer token.
- Auth: none.
- Request body:
```json
{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```
- Returns: bearer token + role flags.

## Orders (Feature 1)

### POST /api/v1/orders
- Purpose: create a seller order checkout object.
- Auth: currently none (should later become seller-auth only).
- Body:
```json
{
  "merchant_id": "uuid",
  "item_name": "string",
  "item_description": "string|null",
  "item_image_url": "string|null",
  "amount": 7500,
  "currency": "KES",
  "buyer_name": "string|null",
  "buyer_phone": "string|null"
}
```
- Returns: created order object including `order_code` and `status`.
- Frontend use: seller order creation screen.
- Important: `merchant_id` must exist in `merchants` table.

### GET /api/v1/orders/merchant/{merchant_id}
- Purpose: list all orders for one merchant.
- Auth: currently none (should later become seller-auth only).
- Returns: array of order objects.
- Frontend use: seller dashboard order list.

## Checkout (Feature 1)

### GET /api/v1/checkout/orders/{order_code}
- Purpose: public fetch of checkout details for one order.
- Auth: none.
- Returns: public order shape (no sensitive internals).
- Frontend use: buyer checkout page by shared `order_code`.

### POST /api/v1/checkout/orders/{order_code}/pay
- Purpose: initiate payment for an order and attach/create transaction.
- Auth: none (for now).
- Body:
```json
{
  "phone_number": "2547XXXXXXXX"
}
```
- Returns: `{ order_code, transaction_id, transaction_status, message }`.
- Frontend use: buyer pay action button.
- Behavior: repeated call for same order returns the same transaction rather than creating duplicates.

## Webhooks (provider-to-backend only)

### POST /api/v1/webhooks/loop
- Purpose: receive LOOP callback events and map them to transaction state transitions.
- Auth: provider-side trust path (signature verification TODO).
- Expected callers: LOOP systems only, not frontend clients.
- Frontend use: none directly.

## Typical Frontend Flow (Confirmed)

1. Seller signs up or logs in.
2. Seller creates order via `POST /orders`.
3. Seller shares `order_code` link/identifier.
4. Buyer page fetches order via `GET /checkout/orders/{order_code}`.
5. Buyer initiates pay via `POST /checkout/orders/{order_code}/pay`.
6. LOOP callback posts to `POST /webhooks/loop` and status transition is applied.

## Error Basics

- `404`: resource not found (example: unknown `order_code`).
- `422`: request validation error (bad payload shape/constraints).
- `500`: server/database/runtime errors.

## Update Rule

Only add endpoints here after they are implemented and verified through endpoint tests.
