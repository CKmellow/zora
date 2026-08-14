BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Demo seller account for Feature 1 API tests.
INSERT INTO
    users (id, email, full_name, is_active, supabase_user_id)
VALUES
    (
        gen_random_uuid (),
        'seller1@example.com',
        'Seller One',
        true,
        NULL
    ) ON CONFLICT (email) DO
UPDATE
SET
    full_name = EXCLUDED.full_name,
    is_active = EXCLUDED.is_active RETURNING id;

-- Demo merchant mapped to demo seller.
INSERT INTO
    merchants (
        id,
        owner_user_id,
        name,
        email,
        phone_number,
        till_number
    )
SELECT
    gen_random_uuid (),
    u.id,
    'Seller One Store',
    'seller1@example.com',
    '254700111222',
    '133239'
FROM
    users u
WHERE
    u.email = 'seller1@example.com' ON CONFLICT DO NOTHING;

-- Optional sample payment link.
INSERT INTO
    payment_links (
        id,
        merchant_id,
        title,
        description,
        amount,
        currency,
        is_active
    )
SELECT
    gen_random_uuid (),
    m.id,
    'General Store Checkout',
    'Use this link for social commerce checkout.',
    1.00,
    'KES',
    true
FROM
    merchants m
WHERE
    m.email = 'seller1@example.com'
    AND NOT EXISTS (
        SELECT
            1
        FROM
            payment_links pl
        WHERE
            pl.merchant_id = m.id
            AND pl.title = 'General Store Checkout'
    );

COMMIT;