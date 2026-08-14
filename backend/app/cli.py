import os
import shutil
import subprocess
import sys
from pathlib import Path

import psycopg

from app.core.config import get_settings


def _run(command: list[str]) -> int:
    return subprocess.call(command)


def dev() -> None:
    sys.exit(_run(["uvicorn", "app.main:app", "--reload", "--port", "8000"]))


def test() -> None:
    sys.exit(_run(["pytest"]))


def lint() -> None:
    sys.exit(_run(["ruff", "check", "."]))


def format_code() -> None:
    sys.exit(_run(["ruff", "format", "."]))


def migrate() -> None:
    sys.exit(_run(["alembic", "upgrade", "head"]))


def makemigration() -> None:
    message = os.getenv("MIGRATION_MESSAGE", "new_migration")
    sys.exit(_run(["alembic", "revision", "--autogenerate", "-m", message]))


def bootstrap_dev() -> None:
    """Run migrations and apply seed SQL for development only."""
    settings = get_settings()
    if settings.app_env.lower() != "development":
        print("bootstrap-dev is blocked outside development environment")
        sys.exit(1)

    if _run(["alembic", "upgrade", "head"]) != 0:
        sys.exit(1)

    db_url = settings.database_url
    if not db_url:
        print("DATABASE_URL is not configured")
        sys.exit(1)

    # psql/libpq connection URL; strip SQLAlchemy driver prefix.
    psql_url = db_url.replace("+psycopg", "", 1).replace("+psycopg2", "", 1)
    seed_path = Path("db/seed.sql")
    if not seed_path.exists():
        print("Seed file db/seed.sql not found")
        sys.exit(1)

    if shutil.which("psql"):
        sys.exit(_run(["psql", psql_url, "-f", str(seed_path)]))

    # Fallback for environments without psql installed.
    sql = seed_path.read_text(encoding="utf-8")
    with psycopg.connect(psql_url) as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()

    print("Seed applied successfully using psycopg fallback")
    sys.exit(0)
