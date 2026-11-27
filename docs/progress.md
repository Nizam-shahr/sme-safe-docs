# Progress

One line per day: date, Day N, what was done, what is left.

- 2026-11-25, Day 1: repository skeleton, docs headings, .env.example. Next: Day 2 backend tooling.
- 2026-11-25, Day 2: backend pyproject with FastAPI and quality tooling (ruff, mypy, vulture, pytest-cov, bandit, pip-audit), minimal app/main.py, one smoke test; all checks green on Python 3.12. Next: Day 3 frontend tooling.
- 2026-11-25, Day 3: Next.js 16 App Router (TS strict, Tailwind v4, ESLint) in frontend/, Prettier, Vitest + React Testing Library, one component test; all four checks green. Next: Day 4 pre-commit, CI and Claude Code hook.
- 2026-11-26, Day 4: pre-commit hooks (linters on commit, tests on push), GitHub Actions CI with backend and frontend jobs, Claude Code edit hook running fast checks; all hooks green locally. Next: green CI run on GitHub, then Day 5 running stack.
- 2026-11-27, Day 5: docker compose stack (Postgres 16 + pgvector, API, web), FastAPI /health, home page streams API status; unit, integration and component tests green. Next: Day 6 models and first migration.
