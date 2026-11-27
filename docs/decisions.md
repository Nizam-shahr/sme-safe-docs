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

## 2026-11-26: Local hooks, CI and line endings
- **Decision:** `pre-commit` with local hooks that call the tools already installed in `backend/.venv` and `frontend/node_modules`; linters run on commit, test suites on push, and CI runs everything. A Claude Code `PostToolUse` hook (`.claude/hooks/fast-checks.mjs`) runs ruff + backend unit tests or eslint + vitest after each edit Claude makes. Line endings: `core.autocrlf=false` in the local repo instead of a `.gitattributes` file.
- **Why:** local hooks use the same tool versions as the project, so there is no second set of versions to keep in sync. Commits stay fast while tests still run before code leaves the machine. Git's CRLF conversion on Windows made Prettier reject every frontend file locally while CI on Linux passed.
- **Known limits:** backend hook entries use the Windows venv path (`backend\.venv\Scripts\*.exe`); macOS/Linux would need `.venv/bin`. CI does not use pre-commit, so it is unaffected.
- **Alternatives:** pre-commit's own tool repos (rejected: duplicate pinned versions, and mypy would need the app's dependencies); `.gitattributes` with `eol=lf` or Prettier `endOfLine: auto` (not chosen).

## 2026-11-27: Running stack
- **Decision:** `uvicorn` serves the FastAPI app. `docker-compose.yml` runs `db` (`pgvector/pgvector:pg16`), `api` and `web`; each waits for the previous one's health check. For now the Postgres superuser is the `POSTGRES_OWNER_USER` from `.env`. The web app reads the API URL from `API_BASE_URL` on the server only, and the home page streams the API status inside `<Suspense>` because Next.js 16 Cache Components requires request-time data to be inside a Suspense boundary.
- **Why:** uvicorn is the standard ASGI server for FastAPI and the smallest addition (`fastapi[standard]` pulls in much more). Health-gated startup keeps the web app from showing "unavailable" while the API is still booting.
- **Open for Day 7:** whether `safedocs_owner` should stay the cluster superuser or become a non-superuser owner created by a separate admin role.
- **Alternatives:** `fastapi run` via `fastapi[standard]` (rejected: extra dependencies); exposing Postgres on a host port (not needed yet).
