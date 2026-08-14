# Frontend API Endpoint Guide

Base URL (local): `http://127.0.0.1:8000`
API v1 prefix: `/api/v1`

This file explains each currently exposed endpoint, who should call it, and what it is used for.

## Health

### GET /health
- Purpose: root health probe for uptime checks.
- Auth: none.
- Returns: app status and current environment.
- Frontend use: optional diagnostics page.

### GET /api/v1/health
- Purpose: versioned health endpoint.
- Auth: none.
- Returns: app status and current environment.
- Frontend use: same as above, preferred if frontend only talks to versioned APIs.

## Authentication

### GET /api/v1/auth/me
- Purpose: validates bearer token and returns decoded claims.
- Auth: required (Supabase JWT).
- Returns: `{ message, claims }`.
- Frontend use: session bootstrap and role-aware UI routing.

## Users

### GET /api/v1/users
- Purpose: placeholder users list endpoint.
- Auth: currently none.
- Returns: not implemented message.
- Frontend use: none yet.

## Merchants

### GET /api/v1/merchants
- Purpose: placeholder merchant list endpoint.
- Auth: currently none.
- Returns: not implemented message.
- Frontend use: none yet.

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

## Payment Links

### GET /api/v1/payment-links
- Purpose: placeholder endpoint.
- Auth: currently none.
- Returns: not implemented message.
- Frontend use: none yet.

## Transactions

### GET /api/v1/transactions
- Purpose: placeholder endpoint.
- Auth: currently none.
- Returns: not implemented message.
- Frontend use: none yet.

## Escrow

### GET /api/v1/escrow
- Purpose: placeholder endpoint.
- Auth: currently none.
- Returns: not implemented message.
- Frontend use: none yet.

## Disputes

### GET /api/v1/disputes
- Purpose: placeholder endpoint.
- Auth: currently none.
- Returns: not implemented message.
- Frontend use: none yet.

## Webhooks (provider-to-backend only)

### POST /api/v1/webhooks/loop
- Purpose: receive LOOP callback events and map them to transaction state transitions.
- Auth: provider-side trust path (signature verification TODO).
- Expected callers: LOOP systems only, not frontend clients.
- Frontend use: none directly.

## Typical Frontend Flow (Current)

1. Seller creates order via `POST /api/v1/orders`.
2. Seller shares `order_code` link/identifier.
3. Buyer page fetches order via `GET /api/v1/checkout/orders/{order_code}`.
4. Buyer clicks Pay; frontend calls `POST /api/v1/checkout/orders/{order_code}/pay`.
5. Frontend polls/refreshes transaction pages as later transaction endpoints are implemented.

## Error Basics

- `404`: resource not found (example: unknown `order_code`).
- `422`: request validation error (bad payload shape/constraints).
- `500`: server/database/runtime errors.
