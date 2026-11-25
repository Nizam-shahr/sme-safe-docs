# Decisions

Record each design decision: date, decision, why, alternatives considered.

## 2026-11-25: Initial stack
- **Decision:** FastAPI + PostgreSQL 16/pgvector with row-level security; Next.js App Router + Tailwind + shadcn/ui; Presidio for PII; providers behind one interface (Foundry, Ollama, Fake).
- **Why:** access control enforced in the database; one database for data and vectors; local-first development; UI kit that uses our own Tailwind tokens.
- **Alternatives:** separate vector database (rejected: second store to secure); Ant Design (rejected: second styling system, admin-dashboard look).

## 2026-11-25: Backend packaging and test client
- **Decision:** `backend/pyproject.toml` built with hatchling, installed into a plain `venv` with `pip install -e ".[dev]"`; tool settings (ruff, mypy strict, pytest, coverage, vulture, bandit) live in the same file. Dev extras use `httpx2` rather than `httpx`.
- **Why:** one config file, no extra installer to learn. Starlette 1.x (via FastAPI 0.165) prefers `httpx2` for `TestClient`, type-checks against it, and warns when only `httpx` is installed. `httpx2` is the maintained successor by the same author.
- **Alternatives:** uv or Poetry (rejected for now: extra tool, not installed); keeping `httpx` (rejected: deprecated path for the test client).
