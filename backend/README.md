# Zora Backend Foundation

## 1. Purpose
Zora is a trust-based escrow and payment orchestration backend for social commerce. This repository contains the backend foundation for REST APIs, Supabase-authenticated access, transaction lifecycle state management, webhook ingestion, and LOOP integration scaffolding.

## 2. Tech Stack
- Python 3.12+
- FastAPI + Uvicorn
- PostgreSQL (Supabase shared DB by default)
- SQLAlchemy 2.x + Alembic
- Pydantic v2 + pydantic-settings
- httpx
- pytest
- Docker + Docker Compose (optional isolated Postgres fallback)

## 3. Folder Structure
- app: FastAPI app, core config/security, routers, models, schemas, repos, services, integrations
- tests: health/config/signature tests
- alembic: migration configuration and versions

## 4. Local Setup
```bash
cd backend

python3.12 -m venv .venv
source .venv/bin/activate

pip install -e .[dev]
```

## 5. Environment Variables
Create and adjust `.env` from `.env.example`.

Important notes:
- `DATABASE_URL` default should be Supabase direct/session Postgres connection string.
- `SUPABASE_JWKS_URL` is optional: if blank, it is auto-derived from `SUPABASE_URL` as:
  `/auth/v1/.well-known/jwks.json`
- Keep LOOP credentials and Supabase service role key only in backend env.

## 6. Database Modes
### a) Shared mode (default)
Set `DATABASE_URL` in `.env` to Supabase-hosted Postgres direct/session URL.

### b) Isolated mode (fallback)
Run local Postgres only when needed:
```bash
docker compose up -d
```
Then set:
`DATABASE_URL=postgresql+psycopg://zora:zora_password@localhost:5432/zora`

## 7. Migrations
```bash
alembic upgrade head
```

## 8. Start FastAPI
```bash
uvicorn app.main:app --reload --port 8000
```

## 9. Run Tests
```bash
pytest
```

## 10. API Docs
- http://localhost:8000/docs

## 11. LOOP Integration Status
- Sandbox-oriented configuration is in place.
- OAuth, payments, payouts, and inquiry methods are scaffolded and intentionally not fully implemented.
- Signature utility is implemented and tested.

## 12. Secrets and Security
- Never commit `.env` or real credentials.
- Never expose LOOP credentials or Supabase service role keys to frontend.
- Supabase JWT verification is designed for RS256 with JWKS.

## 13. Roadmap
- Implement LOOP OAuth token retrieval endpoint details.
- Add webhook authenticity verification and strict schema validation.
- Implement payment-link creation and escrow transaction workflows.
- Implement payout orchestration and reconciliation.
- Add transaction state machine guards and richer audit logging.

## Common Commands
```bash
# shared mode: just set DATABASE_URL to the Supabase connection string in .env

# isolated mode fallback:
docker compose up -d

alembic upgrade head

uvicorn app.main:app --reload --port 8000

pytest
```
