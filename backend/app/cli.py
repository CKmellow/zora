import os
import subprocess
import sys


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
