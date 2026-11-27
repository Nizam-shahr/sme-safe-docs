# SafeDocs

Privacy-first AI workspace for small businesses.

Staff ask questions about company documents and draft emails, summaries, proposals and memos from company templates, while every request respects company policy and roles. Access is enforced in the database, personal data is masked before any AI model sees it, and every request is audited. SafeDocs drafts; people send.

> Status: in development. See `docs/ROADMAP.md`.

## Backend development

Requires Python 3.12. From `backend/`:

```sh
py -3.12 -m venv .venv            # Windows; use python3.12 elsewhere
.venv/Scripts/python -m pip install -e ".[dev]"   # .venv/bin/... on macOS/Linux
```

Checks (all must pass before committing):

```sh
ruff check
ruff format --check
mypy --strict app
vulture app --min-confidence 80
pytest --cov=app --cov-fail-under=80
bandit -c pyproject.toml -r app
pip-audit
```

## Git hooks and CI

Install the local Git hooks once, from the repo root (after the backend venv and `npm install` in `frontend/`):

```sh
backend/.venv/Scripts/pre-commit install
```

- On `git commit`: ruff, mypy, vulture, bandit, eslint, prettier and tsc, for the part of the repo you changed.
- On `git push`: pytest (with coverage) and vitest.
- GitHub Actions (`.github/workflows/ci.yml`) runs every backend and frontend check on each pull request and on `main`.

This repo expects LF line endings. On Windows, run `git config core.autocrlf false` in the repo before checking files out, or Prettier will reject CRLF files.
