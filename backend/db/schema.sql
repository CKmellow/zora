BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE transaction_status AS ENUM (
    'PENDING',
    'FUNDED',
    'IN_TRANSIT',
    'DELIVERED',
    'SETTLED',
    'DISPUTED',
    'REFUNDED'
);

CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

CREATE TYPE payout_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

CREATE TYPE dispute_status AS ENUM (
    'OPEN',
    'UNDER_REVIEW',
    'RESOLVED',
    'REFUNDED',
    'REJECTED'
);

CREATE TABLE
    users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        email VARCHAR(255) NOT NULL UNIQUE,
        full_name VARCHAR(255),
        is_active BOOLEAN NOT NULL DEFAULT true,
        supabase_user_id VARCHAR(255) UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
    );

CREATE UNIQUE INDEX ix_users_email ON users (email);

CREATE TABLE
    merchants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        owner_user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone_number VARCHAR(32),
        till_number VARCHAR(64),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
    );

CREATE TABLE
    payment_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        merchant_id UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        amount NUMERIC(18, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'KES',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
    );

CREATE TABLE
    orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        merchant_id UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
        order_code VARCHAR(32) NOT NULL UNIQUE,
        item_name VARCHAR(255) NOT NULL,
        item_description TEXT,
        item_image_url TEXT,
        amount NUMERIC(18, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'KES',
        buyer_name VARCHAR(255),
        buyer_phone VARCHAR(32),
        status transaction_status NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
    );

CREATE UNIQUE INDEX ix_orders_order_code ON orders (order_code);

CREATE TABLE
    escrow_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        order_id UUID UNIQUE REFERENCES orders (id) ON DELETE SET NULL,
        payment_link_id UUID REFERENCES payment_links (id) ON DELETE SET NULL,
        merchant_id UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
        buyer_user_id UUID REFERENCES users (id) ON DELETE SET NULL,
        external_reference VARCHAR(128) UNIQUE,
        amount NUMERIC(18, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'KES',
        status transaction_status NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
    );

CREATE TABLE
    payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        transaction_id UUID NOT NULL REFERENCES escrow_transactions (id) ON DELETE CASCADE,
        amount NUMERIC(18, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'KES',
        status payment_status NOT NULL DEFAULT 'PENDING',
        provider_reference VARCHAR(128) UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
    );

CREATE TABLE
    payouts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        transaction_id UUID NOT NULL REFERENCES escrow_transactions (id) ON DELETE CASCADE,
        amount NUMERIC(18, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'KES',
        status payout_status NOT NULL DEFAULT 'PENDING',
        provider_reference VARCHAR(128) UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
    );

CREATE TABLE
    disputes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        transaction_id UUID NOT NULL REFERENCES escrow_transactions (id) ON DELETE CASCADE,
        reason VARCHAR(255) NOT NULL,
        details TEXT,
        status dispute_status NOT NULL DEFAULT 'OPEN',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
    );

CREATE TABLE
    delivery_confirmations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        transaction_id UUID NOT NULL REFERENCES escrow_transactions (id) ON DELETE CASCADE,
        confirmation_method VARCHAR(64) NOT NULL,
        confirmed_by VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
    );

CREATE TABLE
    webhook_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        source VARCHAR(64) NOT NULL,
        payload_hash VARCHAR(64) NOT NULL,
        payload JSON NOT NULL,
        headers JSON,
        processed BOOLEAN NOT NULL DEFAULT false,
        processing_error TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
    );

CREATE INDEX ix_webhook_events_source ON webhook_events (source);

CREATE INDEX ix_webhook_events_payload_hash ON webhook_events (payload_hash);

CREATE TABLE
    ledger_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        transaction_id UUID NOT NULL REFERENCES escrow_transactions (id) ON DELETE CASCADE,
        entry_type VARCHAR(64) NOT NULL,
        amount NUMERIC(18, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'KES',
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
    );

CREATE TABLE
    audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        actor_id VARCHAR(255),
        action VARCHAR(128) NOT NULL,
        entity_type VARCHAR(128) NOT NULL,
        entity_id VARCHAR(255) NOT NULL,
        metadata JSON,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
    );

COMMIT;