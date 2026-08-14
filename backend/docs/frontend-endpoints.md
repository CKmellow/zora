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

### GET /api/v1/auth/me
- Purpose: return current profile state for role-aware UI.
- Auth: required (local bearer token from signup/login).
- Returns: profile with `is_buyer`, `is_seller`, plus identity fields.
- Frontend use: session bootstrap and toggle buy/sell experiences.

### PATCH /api/v1/auth/me
- Purpose: update profile details and/or role flags over time.
- Auth: required.
- Request body (any subset):
```json
{
  "full_name": "Updated Name",
  "phone_number": "254700000000",
  "is_buyer": true,
  "is_seller": true
}
```
- Frontend use: buyer later becomes seller (or vice versa) without a new account.

### POST /api/v1/auth/change-password
- Purpose: rotate account password.
- Auth: required.
- Request body:
```json
{
  "current_password": "StrongPass123",
  "new_password": "EvenStronger456"
}
```
- Returns: `204 No Content`.

## Users

### GET /api/v1/users
- Purpose: placeholder users list endpoint.
- Auth: currently none.
- Returns: not implemented message.
- Frontend use: none yet.

## Merchants

### GET /api/v1/merchants/me
- Purpose: list stores owned by the logged-in user.
- Auth: required.
- Frontend use: seller profile/store switcher and dashboard.

### POST /api/v1/merchants
- Purpose: create a store for current user (also marks user as seller).
- Auth: required.
- Request body:
```json
{
  "name": "My Store",
  "email": "seller@example.com",
  "phone_number": "254700111222",
  "till_number": "123456"
}
```
- Frontend use: seller onboarding for users who started as buyers.

### PATCH /api/v1/merchants/{merchant_id}
- Purpose: update store details (name/email/phone/till).
- Auth: required (owner only).
- Request body: any subset of create fields.
- Frontend use: seller store settings page.

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

1. User signs up (`/auth/signup`) as buyer, seller, or both.
2. User logs in (`/auth/login`) and stores bearer token.
3. Frontend loads `/auth/me` to decide UI role surfaces.
4. If buyer later wants to sell, frontend toggles role via `PATCH /auth/me` and creates store via `POST /merchants`.
5. Seller creates order via `POST /orders`.
6. Seller shares `order_code` link/identifier.
7. Buyer page fetches order via `GET /checkout/orders/{order_code}` and initiates pay.

## Error Basics

- `404`: resource not found (example: unknown `order_code`).
- `422`: request validation error (bad payload shape/constraints).
- `500`: server/database/runtime errors.
