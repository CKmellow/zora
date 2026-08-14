# Frontend API Endpoint Guide

Base URL (local): `http://127.0.0.1:8000`
API v1 prefix: `/api/v1`

This file lists only endpoints that are confirmed working in implementation and tests.
Current confirmed scope: Feature 1, Feature 2, Feature 3, Feature 4, Feature 5,
Feature 6, and auth signup/login.

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

## OTP (Feature 3)

### POST /api/v1/auth/otp/issue
- Purpose: issue one-time code challenge for login/verification flows.
- Auth: required (bearer token from signup/login).
- Request body:
```json
{
  "subject": "+254700111222",
  "purpose": "login",
  "channel": "sms"
}
```
- Returns: `challenge_id`, `expires_at`, `attempts_remaining`, message.
- Note: current dev flow includes OTP code in message for testability.

### POST /api/v1/auth/otp/verify
- Purpose: verify code against an issued challenge.
- Auth: none (challenge-based verification).
- Request body:
```json
{
  "challenge_id": "uuid",
  "code": "021423"
}
```
- Returns: verification result with remaining attempts.

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
- Returns: `{ order_code, transaction_id, transaction_status, message, loop_status_code, loop_reference }`.
- Frontend use: buyer pay action button.
- Behavior:
  - repeated call for same order returns the same transaction rather than creating duplicates.
  - now triggers a LOOP Prompt request to sandbox endpoint:
    - `POST /gateway/loop-prompt/2/services/process-request`

## LOOP Payouts and Transfers

### POST /api/v1/loop/send-money
- Purpose: execute Feature 5 send-money payouts via LOOP channels.
- Auth: none currently (should become role-protected in next hardening pass).
- Body:
```json
{
  "txn_reference": "tx-unique-ref",
  "recipient_mobile_no": "254700123456",
  "amount": 100.00,
  "purpose_of_payment": "Supplier settlement",
  "channel": "LOOP",
  "merchant_till": "133239"
}
```
- Supported channel values and LOOP endpoints:
  - `LOOP` -> `POST /gateway/send-money-loop/1.0/services/process-service-request2`
  - `MPESA` -> `POST /gateway/send-money-mpesa/1.0/services/process-request`
  - `PESALINK` -> `POST /gateway/send-money-pesalink/1.0/services/process-request`
- Returns: `{ status_code, message, data }` where `status_code` mirrors LOOP response body.

### POST /api/v1/loop/pay-to
- Purpose: execute Feature 6 pay-to transfer flows.
- Auth: none currently (should become role-protected in next hardening pass).
- Body:
```json
{
  "txn_reference": "tx-unique-ref",
  "merchant_rcv_till": "247247",
  "account_number": "INV-123",
  "amount": 350.00,
  "channel": "MPESAPAYBILL",
  "merchant_till": "133239"
}
```
- Supported channel values and LOOP endpoints:
  - `LOOP` -> `POST /gateway/pay-to-looptill/1.0/services/process-request`
  - `MPESATILL` -> `POST /gateway/pay-to-mpesa-till/1.0/services/process-request`
  - `MPESAPAYBILL` -> `POST /gateway/pay-to-paybill/1.0/services/process-request`
- Returns: `{ status_code, message, data }` where `status_code` mirrors LOOP response body.

## Webhooks (provider-to-backend only)

### POST /api/v1/webhooks/loop
- Purpose: receive LOOP callback events and map them to transaction state transitions.
- Auth: provider-side trust path (signature verification TODO).
- Expected callers: LOOP systems only, not frontend clients.
- Frontend use: none directly.

## Escrow Approvals (Feature 4)

### POST /api/v1/escrow/transactions/{transaction_id}/approvals
- Purpose: submit one user approval/rejection decision for a transaction.
- Auth: required (bearer token).
- Body:
```json
{
  "decision": "approve",
  "note": "Looks good"
}
```
- Rules:
  - one decision per user per transaction.
  - duplicate submission by same user is rejected.

### GET /api/v1/escrow/transactions/{transaction_id}/approvals/summary
- Purpose: read approval counts and settlement threshold status.
- Auth: none currently.
- Returns: `approved_count`, `rejected_count`, `settled_by_approval`, status message.
- Behavior: when approved count reaches threshold (2), transaction/order can move to `SETTLED`.

## Typical Frontend Flow (Confirmed)

1. Seller signs up or logs in.
2. Seller can issue and verify OTP for protected verification flows.
3. Seller creates order via `POST /orders`.
4. Seller shares `order_code` link/identifier.
5. Buyer page fetches order via `GET /checkout/orders/{order_code}`.
6. Buyer initiates pay via `POST /checkout/orders/{order_code}/pay`.
7. LOOP callback posts to `POST /webhooks/loop` and status transition is applied.
8. Escrow actors submit approvals and monitor summary until settlement threshold is reached.
9. Seller settlement/disbursement can run through `/api/v1/loop/send-money` (Feature 5).
10. Merchant/network transfers can run through `/api/v1/loop/pay-to` (Feature 6).

## Error Basics

- `404`: resource not found (example: unknown `order_code`).
- `422`: request validation error (bad payload shape/constraints).
- `500`: server/database/runtime errors.

## Update Rule

Only add endpoints here after they are implemented and verified through endpoint tests.
