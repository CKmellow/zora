PYTHON ?= python3.12

.PHONY: install dev test lint format migrate makemigration docker-up docker-down

install:
	$(PYTHON) -m pip install --upgrade pip
	$(PYTHON) -m pip install -e .[dev]

dev:
	uvicorn app.main:app --reload --port 8000

test:
	pytest

lint:
	ruff check .

format:
	ruff format .

migrate:
	alembic upgrade head

makemigration:
	alembic revision --autogenerate -m "$(m)"

docker-up:
	docker compose up -d

docker-down:
	docker compose down
